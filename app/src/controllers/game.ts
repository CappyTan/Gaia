// Run lifecycle + run-state container + merchant. The orchestration layer: holds the live
// run (party/gold/inventory/flags) and drives transitions between systems, field, and battle.
// Cross-controller calls that appear only in inline HTML handlers (UI.*, Game.*) resolve via
// the window bridge set up in main.ts, so they aren't imported here (keeps the cycle small).

import type { Item, Member, MemberDef } from "../types";
import { clamp, ri, pick } from "../core/rng";
import { PARTY_DEFS } from "../data/party";
import { ZONES } from "../data/zones";
import { makeMember, recalc } from "../systems/progression";
import { makeItem, rollItemAtRarity, itemScore } from "../systems/loot";
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
  _stock: [] as Item[],
  _lastDefs: null as MemberDef[] | null,

  // Restart with the most recently chosen party (or the default) — used by retry/play-again.
  start(): void { this.startRun(this._lastDefs ?? PARTY_DEFS); },

  // Begin a fresh run with a specific party composition (from the Roster picker or default).
  startRun(defs: MemberDef[]): void {
    this._lastDefs = defs;
    this.gold = 0; this.inventory = []; this.steps = 0; this.encountersWon = 0;
    this.bossDefeated = false; this.miniBossDefeated = false; this.continueAfterBattle = null; this._inMerchant = false; this._inTown = false;
    Telemetry.load(); Telemetry.startSession();
    this.party = defs.map((d) => makeMember(d));
    // starting gear: a common weapon each, IN THE HERO'S CHOSEN ATTUNEMENT — otherwise the
    // weapon (which sets the class) would default to SOL and silently re-class the whole party.
    this.party.forEach((m) => { m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att); });
    recalc(this.party);
    Field.init();
    Screens.show("field");
  },
  gameOver(): void {
    Telemetry.endSession("wipe");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">The party has fallen</h2>
    <p class="small">Greenvale claims another band of adventurers.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Try again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },
  victory(): void {
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

  // ── TOWN: the Greenvale Outpost — a real walkable hub (Field.townMode) that appears after a
  // zone boss. The four buildings are walk-in POIs (Field.townTouch routes each onto the actions
  // below); the merchant/smith/revive open as focused overlays over the town field. Party/Bag
  // opened in town return to the town field via UI.close() → backToTown (see menus.ts).
  openTown(): void {
    this._inTown = true; this._inMerchant = false;
    this.rollMerchantStock(); // stock is rolled once per town visit (no reroll by re-entering the shop)
    Field.enterTown();
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
  // Leave the outpost and continue onward (next zone, or the final reckoning).
  confirmLeaveTown(): void {
    const next = Field.isLastZone() ? null : ZONES[Field.zoneIndex + 1];
    Overlay.show(`<h2 class="title-gold">⚔️ Leave the Outpost</h2>
      <p class="small">${next ? `Set out for ${next.name}? Your gear and levels carry over.` : "Press on to the final reckoning?"}</p>
      <div class="row"><button class="btn gold" onclick="Game.leaveTown()">${next ? "Onward to " + next.name + " →" : "Onward →"}</button>
        <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
  },
  leaveTown(): void {
    this._inTown = false; this._inMerchant = false; Field.townMode = false;
    Overlay.hide();
    if (Field.isLastZone()) this.victory();
    else Field.loadZone(Field.zoneIndex + 1);
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
