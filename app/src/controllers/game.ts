// Run lifecycle + run-state container + merchant. The orchestration layer: holds the live
// run (party/gold/inventory/flags) and drives transitions between systems, field, and battle.
// Cross-controller calls that appear only in inline HTML handlers (UI.*, Game.*) resolve via
// the window bridge set up in main.ts, so they aren't imported here (keeps the cycle small).

import type { Item, Member, MemberDef } from "../types";
import { clamp, ri, pick } from "../core/rng";
import { PARTY_DEFS } from "../data/party";
import { ZONES, type Zone } from "../data/zones";
import { settlement } from "../data/towns";
import { makeMember, recalc } from "../systems/progression";
import { makeItem, rollItemAtRarity, itemScore } from "../systems/loot";
import { Save } from "../systems/save";
import { GAME_VERSION } from "../data/version";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Screens } from "./screens";
import { Field } from "./field";
import { Telemetry } from "../telemetry/telemetry";

export function priceOf(it: Item): number {
  const base = [30, 70, 150, 320, 650, 1300][it.rIx] || 30;
  return Math.round(base + itemScore(it) * 2);
}
// The merchant buys loot back at a fraction of its asking price (standard RPG sell margin).
export function sellPriceOf(it: Item): number {
  return Math.max(5, Math.round(priceOf(it) * 0.4));
}
// The ordered settlements walked through on the way INTO a zone (ADR 0006 hub chain). Prefer the
// explicit `hubs` chain; fall back to the single `hub`, then Hearthford — so a zone always has one.
export function hubsFor(z: Zone): string[] {
  if (z.hubs && z.hubs.length) return z.hubs;
  return [z.hub ?? "hearthford"];
}

export const Game = {
  state: "title",
  gold: 0,
  party: [] as Member[],
  inventory: [] as Item[],
  steps: 0,
  encountersWon: 0,
  bossDefeated: false,
  miniBossDefeated: false,
  continueAfterBattle: null as (() => void) | null,
  _inMerchant: false,
  _inTown: false,
  // The starting village (Hearthford) drops you into the CURRENT zone on exit; the between-zone
  // hub advances to the NEXT zone. This flag distinguishes the two so the gate routes correctly.
  _startVillage: false,
  // HUB CHAIN (ADR 0006): the ordered settlements being walked through on the way into the next zone
  // (e.g. ["riverhearth","miregard"] before the Duskmarsh). Leaving advances the index; only when the
  // chain is exhausted does the next zone load. Empty/index past the end = no chain in progress.
  _hubChain: [] as string[],
  _hubIx: 0,
  _stock: [] as Item[],
  _lastDefs: null as MemberDef[] | null,

  // Restart with the most recently chosen party (or the default) — used by retry/play-again.
  start(): void { this.startRun(this._lastDefs ?? PARTY_DEFS); },

  // Begin a fresh run with a specific party composition (from the Roster picker or default).
  startRun(defs: MemberDef[]): void {
    this._lastDefs = defs;
    this.gold = 0; this.inventory = []; this.steps = 0; this.encountersWon = 0;
    this.bossDefeated = false; this.miniBossDefeated = false; this.continueAfterBattle = null; this._inMerchant = false; this._inTown = false; this._startVillage = false;
    this._hubChain = []; this._hubIx = 0;
    Telemetry.load(); Telemetry.startSession();
    this.party = defs.map((d) => makeMember(d));
    // starting gear: a common weapon each, IN THE HERO'S CHOSEN ATTUNEMENT — otherwise the
    // weapon (which sets the class) would default to SOL and silently re-class the whole party.
    this.party.forEach((m) => { m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att); });
    recalc(this.party);
    Field.init();          // ready zone 0 behind the village (canvas, tiles, map, encounter state)
    this.openStartVillage(); // ...but begin the run walking around the starting village
  },
  // Open the Greenvale starting village (Hearthford). Walking out its gate enters zone 0.
  openStartVillage(): void {
    this._startVillage = true;
    // The starting zone's hub chain is its opening village (usually just Hearthford).
    this._hubChain = hubsFor(ZONES[0]); this._hubIx = 0;
    this.openTown(this._hubChain[0] ?? "hearthford"); // the starting zone's own front-door village
  },

  // ── SAVE & RESUME (ADR 0007) ───────────────────────────────────────────────────────────────
  // Autosave the live run to the single localStorage slot. Called on meaningful transitions
  // (battle resolved, enter/leave town, zone change, equip change). Cheap + silent; the pure
  // serialize/validate lives in systems/save.ts. Never saves the title screen / a dead run.
  saveNow(): void {
    if (this.state === "title" || !this.party.length) return;
    Save.save({
      gold: this.gold, steps: this.steps, encountersWon: this.encountersWon,
      bossDefeated: this.bossDefeated, miniBossDefeated: this.miniBossDefeated,
      party: this.party, inventory: this.inventory, defs: this._lastDefs,
      inTown: this._inTown, startVillage: this._startVillage,
      hubChain: this._hubChain, hubIx: this._hubIx,
      zoneIndex: Field.zoneIndex,
      townId: this._inTown ? (Field.town?.id ?? this._hubChain[this._hubIx] ?? null) : null,
      px: Field.px, py: Field.py, enteredDungeon: Field.enteredDungeon,
    }, GAME_VERSION);
  },
  // Resume the saved run from the title screen. Loads + validates + rebuilds the party, restores
  // run state, then drops the player back on the field / in town (NEVER mid-battle, ADR 0007 §5).
  // If the save can't be salvaged, falls back to a fresh roster with a notice.
  continueRun(): void {
    const r = Save.load();
    if (!r) {
      Save.clear();
      Overlay.show(`<h2 class="title-gold">No run to resume</h2>
        <p class="small">Your saved run couldn't be loaded — starting fresh.</p>
        <div class="row"><button class="btn gold" onclick="Overlay.hide();Roster.open()">Build a party</button>
          <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
      return;
    }
    // install run state
    this._lastDefs = r.defs;
    this.gold = r.gold; this.steps = r.steps; this.encountersWon = r.encountersWon;
    this.bossDefeated = r.bossDefeated; this.miniBossDefeated = r.miniBossDefeated;
    this.party = r.party; this.inventory = r.inventory;
    this.continueAfterBattle = null; this._inMerchant = false;
    this._inTown = r.inTown; this._startVillage = r.startVillage;
    this._hubChain = r.hubChain; this._hubIx = r.hubIx;
    recalc(this.party); // refold gear/MNA (hp/mp/alive already restored, _init guards the refill)
    Telemetry.load(); Telemetry.startSession();
    // build the field for the saved zone, then place the player.
    Field.init();                      // canvas + tiles + zone 0 baseline
    Field.zoneIndex = r.zoneIndex;
    if (r.inTown && r.townId) {
      this.rollMerchantStock();        // re-roll shop stock (transient, never persisted)
      Field.genTown(r.townId);
      this.placePlayer(r.px, r.py);
      Screens.show("field"); Field.resize(); Field.draw(); Field.hint();
    } else {
      Field.enteredDungeon = r.enteredDungeon;
      Field.resize();
      // ADR 0008 Stage 2: a new-model zone saved INSIDE its dungeon rebuilds the dungeon grid;
      // otherwise build the overworld (the mouth is enterable again if the mini was beaten). Legacy
      // zones go through genMap → the combined grid as before.
      if (Field.usesNewModel() && r.enteredDungeon) Field.genDungeon(Field.zoneIndex);
      else Field.genMap();             // sets px/py to the spawn (overworld) / mode="overworld"
      Field.stepsToEncounter = ri(Field.ENC_MIN, Field.ENC_MAX);
      this.placePlayer(r.px, r.py);
      Screens.show("field"); Field.draw(); Field.hint();
    }
    const noteHtml = r.notes.length ? `<p class="small" style="opacity:.8">${r.notes.join("<br>")}</p>` : "";
    Overlay.show(`<h2 class="title-gold">Welcome back</h2>
      <p class="small">Your run resumes — party, gear, and gold intact.</p>${noteHtml}
      <div class="row"><button class="btn gold" onclick="Overlay.hide()">Continue</button></div>`);
  },
  // Place the player at the saved tile IF it's passable on the (possibly changed) map; otherwise
  // leave them at the zone/town spawn genMap/genTown already set — never strand them in a wall.
  placePlayer(px: number, py: number): void {
    if ((px || py) && Field.passable(px, py)) { Field.px = px; Field.py = py; }
  },
  // Start a NEW run from the title — opens the Roster picker. Confirms first if a resumable run
  // exists (so the player doesn't accidentally overwrite their save), then clears the slot.
  newGame(): void {
    if (Save.hasSave()) {
      Overlay.show(`<h2 class="title-gold">Start a new run?</h2>
        <p class="small">You have a saved run in progress. Starting fresh will overwrite it.</p>
        <div class="row"><button class="btn gold" onclick="Overlay.hide();Save.clear();Roster.open()">New run</button>
          <button class="btn" onclick="Overlay.hide();Game.continueRun()">Resume instead</button>
          <button class="btn" onclick="Overlay.hide()">Cancel</button></div>`);
      return;
    }
    window.Roster.open();
  },
  // Whether the title screen should offer Continue (a valid save exists).
  hasSave(): boolean { return Save.hasSave(); },
  gameOver(): void {
    Save.clear(); // the run is over — don't offer a dead party to resume
    Telemetry.endSession("wipe");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">The party has fallen</h2>
    <p class="small">Greenvale claims another band of adventurers.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Try again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },
  victory(): void {
    Save.clear(); // run complete — nothing to resume
    this.bossDefeated = true; this._inMerchant = false; this._inTown = false;
    Telemetry.boss("win"); Telemetry.endSession("victory");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">Gaia is saved</h2>
    <p>Mirelord Vorn falls. You have cut a path through every zone of the slice.</p>
    <p class="small">Run complete — encounters won: ${this.encountersWon}. Gold: ${this.gold}.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Play again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },

  // ── TOWN: a real walkable settlement hub (Field.townMode). The four buildings are walk-in POIs
  // (Field.townTouch routes each onto the actions below); the merchant/smith/revive open as focused
  // overlays over the town field. Party/Bag opened in town return to the town field via
  // UI.close() → backToTown (see menus.ts).
  // Open a specific walkable settlement by id (no resolution here — the caller picks the place; the
  // hub-chain machinery below decides WHICH settlement at each step).
  openTown(id = "hearthford"): void {
    this._inTown = true; this._inMerchant = false;
    this.rollMerchantStock(); // stock is rolled once per town visit (no reroll by re-entering the shop)
    Field.enterTown(id);
    this.saveNow(); // autosave on entering a settlement (ADR 0007)
  },
  // After a zone boss falls (battle.ts), begin walking the NEXT zone's hub chain — the ordered
  // settlements the player passes through before that zone loads (e.g. Riverhearth → Miregard before
  // the Duskmarsh). Opens the first; `leaveTown` advances the chain and only loads the zone at its end.
  enterNextHubChain(): void {
    this._startVillage = false;
    const next = ZONES[Field.zoneIndex + 1];
    this._hubChain = next ? hubsFor(next) : [];
    this._hubIx = 0;
    if (!this._hubChain.length) { this.victory(); return; } // no chain (shouldn't happen) → end run
    this.openTown(this._hubChain[0]);
  },
  // Close an in-town overlay and return to the walkable town field.
  backToTown(): void { this._inMerchant = false; Overlay.hide(); Screens.show("field"); },
  // The Inn — free full rest for living heroes.
  openInn(): void {
    const fullHp = this.party.every((m) => !m.alive || (m.hp >= m.maxhp && m.mp >= m.maxmp));
    const hpSum = this.party.reduce((n, m) => n + Math.max(0, m.hp), 0), maxSum = this.party.reduce((n, m) => n + m.maxhp, 0);
    Overlay.show(`<h2 class="title-gold">🏠 The Inn</h2>
      <p class="small">Rest by the hearth — restore HP and MP for every living hero. Free.</p>
      <div class="card" style="margin:8px 0"><b style="color:var(--gold2)">Party HP</b> ${hpSum}/${maxSum}
        <div class="small" style="margin-top:6px">${this.party.map((m) => `${m.spr} ${m.name} ${m.alive ? `${Math.max(0, m.hp)}/${m.maxhp}` : `<span class="r-rare">fallen</span>`}`).join(" · ")}</div></div>
      <div class="row"><button class="btn${fullHp ? "" : " gold"}" ${fullHp ? "disabled" : ""} onclick="Game.restAtInn()">${fullHp ? "Fully rested" : "Rest (free)"}</button>
        <button class="btn" onclick="Game.backToTown()">◂ Leave</button></div>`);
  },
  restAtInn(): void { this.restParty(); this.openInn(); },
  rollMerchantStock(): void {
    const floor = clamp(1 + Field.zoneIndex * 2, 0, 5); // deeper zone = better base stock
    const ilvl = 6 + Field.zoneIndex * 6; // stock the road ahead (gear for the next zone)
    // The merchant deals across attunements — a weapon of another power reclasses the hero who
    // wields it (class = weapon). Stock biases to the party's classes/attunements (with variety).
    this._stock = [];
    for (let i = 0; i < 6; i++) { const m = pick(this.party); this._stock.push(rollItemAtRarity(ri(floor, Math.min(5, floor + 2)), m.cls, ilvl, m.att)); }
  },
  // Full heal of all LIVING members (mirrors the level-up refill in progression.ts). Dead members
  // are untouched — reviving them is a separate (paid) action.
  restParty(): void {
    this.party.forEach((m) => { if (m.alive) { m.hp = m.maxhp; m.mp = m.maxmp; } });
  },
  // Cost to revive one fallen hero. INTERIM: charged in GOLD. Canon will use an "Aether" currency
  // instead (Dara: Aether replaces gold) — swapping it is a one-line change here. See issue #35.
  reviveCostFor(m: Member): number { return 50 * m.level; },
  // The Revive shrine — bring fallen heroes back (cost scales with level). Re-renders in place.
  openRevive(): void {
    const dead = this.party.filter((m) => !m.alive);
    const reviveAll = dead.reduce((n, m) => n + this.reviveCostFor(m), 0);
    let h = `<h2 class="title-gold">🔮 The Revive Shrine</h2>`;
    if (!dead.length) h += `<p class="small">No fallen heroes. May it stay that way.</p>`;
    else {
      h += `<p class="small">Channel the shrine's Aether to bring the fallen back. Gold: <b>${this.gold}</b></p><div class="scroll">`;
      h += dead.map((m) => { const c = this.reviveCostFor(m), can = this.gold >= c;
        return `<button class="btn${can ? " gold" : ""}" ${can ? "" : "disabled"} onclick="Game.reviveMember('${m.id}')">Revive ${m.spr} ${m.name} · ${c}g</button>`; }).join(" ");
      if (dead.length > 1) h += `<div class="small" style="opacity:.6;margin-top:4px">Total to revive all: ${reviveAll}g</div>`;
      h += `</div>`;
    }
    h += `<div class="row"><button class="btn" onclick="Game.backToTown()">◂ Leave</button></div>`;
    Overlay.show(h);
  },
  reviveMember(memberId: string): void {
    const m = this.party.find((x) => x.id === memberId);
    if (!m || m.alive) return;
    const cost = this.reviveCostFor(m);
    if (this.gold < cost) return; // ← currency check; swap `this.gold` for Aether later (#35)
    this.gold -= cost;            // ← currency spend; swap for Aether later (#35)
    m.alive = true; m.hp = m.maxhp; m.mp = m.maxmp;
    this.openRevive(); // refresh the shrine list
  },
  // Smith STUB — visibly present, clearly a placeholder. Per Dara (#35) this becomes a Diablo-style
  // affix REROLL (spend Mana Dust/Shard/Core by item rarity to reroll one affix), not forging.
  openSmith(): void {
    Overlay.show(`<h2 class="title-gold">🔨 The Smith</h2>
      <div class="card" style="text-align:left;margin:8px 0">
        <b class="r-legendary">Coming soon</b>
        <p class="small" style="margin-top:6px">Reroll a single affix on a piece of gear — Diablo-style — by spending Mana Dust, Mana Shard, and Mana Core gathered from enemies. The forge isn't open yet.</p>
      </div>
      <div class="row"><button class="btn gold" onclick="Game.backToTown()">◂ Back to town</button></div>`);
  },
  // Leave the settlement. The STARTING village heads into the current zone; a between-zone hub
  // either advances to the NEXT settlement in the chain (e.g. Riverhearth → Miregard) or, at the
  // chain's end, sets out for the next zone (or, after the last, the final reckoning).
  confirmLeaveTown(): void {
    if (this._startVillage) {
      const here = ZONES[Field.zoneIndex];
      Overlay.show(`<h2 class="title-gold">⚔️ Out the Gate</h2>
        <p class="small">Head north into ${here.name}? The road's yours when you're ready.</p>
        <div class="row"><button class="btn gold" onclick="Game.leaveTown()">Into ${here.name} →</button>
          <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
      return;
    }
    const dest = this.nextLeaveDest();
    Overlay.show(`<h2 class="title-gold">⚔️ Leave ${Field.town?.name ?? "Town"}</h2>
      <p class="small">${dest.label}</p>
      <div class="row"><button class="btn gold" onclick="Game.leaveTown()">${dest.cta}</button>
        <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
  },
  // Where leaving the current between-zones hub goes: the NEXT settlement in the chain if one
  // remains, else the next zone (or the final reckoning). Pure copy-helper for the confirm prompt.
  nextLeaveDest(): { label: string; cta: string } {
    const nextHub = this._hubChain[this._hubIx + 1];
    if (nextHub) {
      const nm = settlement(nextHub).name;
      return { label: `Take the road on to ${nm}? Your gear and levels carry over.`, cta: `On to ${nm} →` };
    }
    const next = Field.isLastZone() ? null : ZONES[Field.zoneIndex + 1];
    return next
      ? { label: `Set out for ${next.name}? Your gear and levels carry over.`, cta: `Onward to ${next.name} →` }
      : { label: "Press on to the final reckoning?", cta: "Onward →" };
  },
  leaveTown(): void {
    this._inTown = false; this._inMerchant = false; Field.townMode = false;
    Overlay.hide();
    if (this._startVillage) { this._startVillage = false; Field.enterZoneFromVillage(); this.saveNow(); return; }
    // Advance the hub chain: if another settlement remains, walk into it; else load the next zone.
    const nextHub = this._hubChain[this._hubIx + 1];
    if (nextHub) { this._hubIx++; this.openTown(nextHub); Field.draw(); return; } // openTown saves
    if (Field.isLastZone()) this.victory();
    else { Field.loadZone(Field.zoneIndex + 1); this.saveNow(); } // autosave on zone change (ADR 0007)
  },
  restartFromTown(): void {
    this._inTown = false; this._inMerchant = false; Field.townMode = false;
    Overlay.hide();
    window.Roster.open(); // same entry the title screen uses (build party → start run)
  },

  // ── MERCHANT: opened from the town hub; spend gold on rolled loot, then back to the hub ──
  openMerchant(): void {
    this._inMerchant = true;
    this.renderMerchant();
  },
  renderMerchant(): void {
    this._inMerchant = true;
    let h = `<h2 class="title-gold">Wandering Merchant</h2><div class="small">"Spoils for the road ahead." Gold: <b>${this.gold}</b></div><div class="scroll">`;
    if (!this._stock.length) h += `<p class="small">Sold out. Safe travels.</p>`;
    this._stock.forEach((it, idx) => {
      const price = priceOf(it), afford = this.gold >= price;
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn${afford ? " gold" : ""}" ${afford ? "" : "disabled"} onclick="Game.buyItem(${idx})">Buy · ${price}g</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">Party</button><button class="btn" onclick="UI.openInventory()">Bag / Sell</button>`;
    h += `<button class="btn gold" onclick="Game.leaveMerchant()">◂ Back to town</button></div>`;
    Overlay.show(h);
  },
  buyItem(idx: number): void {
    const it = this._stock[idx];
    if (!it) return;
    const price = priceOf(it);
    if (this.gold < price) return;
    this.gold -= price; this.inventory.push(it); this._stock.splice(idx, 1);
    this.renderMerchant();
  },
  // Sell a bag item to the merchant for gold (only meaningful while shopping). Stays in the Bag
  // view so the player can clear out several pieces in a row.
  sellItem(invIdx: number): void {
    const it = this.inventory[invIdx];
    if (!it || !this._inMerchant) return;
    this.gold += sellPriceOf(it);
    this.inventory.splice(invIdx, 1);
    window.UI.openInventory(); // UI resolves via the window bridge (avoids a controller import cycle)
  },
  // The shop's "back" returns to the walkable town field (the merchant is a building in town).
  leaveMerchant(): void {
    this.backToTown();
  },
};
