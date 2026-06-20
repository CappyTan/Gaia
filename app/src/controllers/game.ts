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

  // ── TOWN: the hub that appears after a zone boss. A modal placeholder for a future tiled town
  // (Greenvale Outpost). The merchant lives inside it as one action; Rest/Revive/Smith/etc sit
  // alongside it. Party/Bag opened from here return to the hub via UI.close() (see menus.ts).
  openTown(): void {
    this._inTown = true; this._inMerchant = false;
    this.rollMerchantStock(); // stock is rolled once per town visit (no reroll by re-entering the shop)
    this.renderTown();
  },
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
    this.renderTown();
  },
  // Cost to revive one fallen hero. INTERIM: charged in GOLD. Canon will use an "Aether" currency
  // instead — swapping it is a one-line change here (point reviveCost/this.gold at the new pool).
  // FLAGGED: Aether economy (source + earn rates) is a follow-up; see the handback notes.
  reviveCostFor(m: Member): number { return 50 * m.level; },
  reviveMember(memberId: string): void {
    const m = this.party.find((x) => x.id === memberId);
    if (!m || m.alive) return;
    const cost = this.reviveCostFor(m);
    if (this.gold < cost) return; // ← currency check; swap `this.gold` for Aether later
    this.gold -= cost;            // ← currency spend; swap for Aether later
    m.alive = true; m.hp = m.maxhp; m.mp = m.maxmp;
    this.renderTown();
  },
  // Smith STUB — visibly present, clearly a placeholder. The crafting economy (Mana Dust/Shard/
  // Core drops + forge recipes + UI) is a flagged follow-up; do not build it here.
  openSmith(): void {
    Overlay.show(`<h2 class="title-gold">🔨 The Smith</h2>
      <div class="card" style="text-align:left;margin:8px 0">
        <b class="r-legendary">Coming soon</b>
        <p class="small" style="margin-top:6px">Forge gear from materials dropped by enemies — Mana Dust, Mana Shard, and Mana Core. The forge isn't open yet.</p>
      </div>
      <div class="row"><button class="btn gold" onclick="Game.renderTown()">◂ Back to town</button></div>`);
  },
  renderTown(): void {
    this._inTown = true; this._inMerchant = false;
    const next = Field.isLastZone() ? null : ZONES[Field.zoneIndex + 1];
    const zone = Field.zone();
    const dead = this.party.filter((m) => !m.alive);
    const hpSum = this.party.reduce((n, m) => n + Math.max(0, m.hp), 0);
    const maxSum = this.party.reduce((n, m) => n + m.maxhp, 0);
    const reviveAll = dead.reduce((n, m) => n + this.reviveCostFor(m), 0);

    let h = `<div class="small" style="opacity:.7;letter-spacing:1px">GREENVALE OUTPOST · ZONE ${Field.zoneIndex + 1}</div>
      <h2 class="title-gold" style="margin:2px 0">TOWN</h2>
      <p class="small">You rest at the outpost after clearing ${zone.name}.</p>
      <div class="card" style="text-align:left;margin:8px 0">
        <div class="row" style="justify-content:space-between">
          <span><b style="color:var(--gold2)">Gold</b> ${this.gold}</span>
          <span><b style="color:var(--gold2)">Party HP</b> ${hpSum}/${maxSum}</span>
        </div>
        <div class="small" style="margin-top:6px">${this.party.map((m) => `${m.spr} ${m.name} ${m.alive ? `${Math.max(0, m.hp)}/${m.maxhp}` : `<span class="r-rare">fallen</span>`}`).join(" · ")}</div>
      </div>
      <div class="scroll">`;

    // Action cards. .card holds an icon+title+desc; the button is the tappable target (≥44px).
    const card = (icon: string, title: string, desc: string, btn: string) =>
      `<div class="card" style="text-align:left;margin:6px 0">
        <div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">${icon}</span><b style="color:var(--gold2);font-size:15px">${title}</b></div>
        <div class="small" style="margin:4px 0 8px">${desc}</div>${btn}</div>`;

    const fullHp = this.party.every((m) => !m.alive || (m.hp >= m.maxhp && m.mp >= m.maxmp));
    h += card("☀️", "Rest &amp; Recover", "Restore HP and MP for all living heroes. Free.",
      `<button class="btn${fullHp ? "" : " gold"}" ${fullHp ? "disabled" : ""} onclick="Game.restParty()">${fullHp ? "Fully rested" : "Rest (free)"}</button>`);
    h += card("🛒", "Visit Merchant", "Buy rolled gear for the road ahead, or sell loot from your bag.",
      `<button class="btn" onclick="Game.openMerchant()">Enter shop</button>`);
    h += card("🔨", "Visit Smith", "Forge gear from materials. (Coming soon.)",
      `<button class="btn" onclick="Game.openSmith()">View forge</button>`);
    h += card("📊", "Character Status", "Inspect your party, gear, MNA, and skill trees.",
      `<button class="btn" onclick="UI.openParty()">Open party</button>`);
    const reviveDesc = dead.length ? `Bring back ${dead.length} fallen ${dead.length === 1 ? "hero" : "heroes"} (50g × level each).` : "No fallen heroes.";
    h += card("🩸", "Revive Fallen", reviveDesc,
      dead.length
        ? dead.map((m) => { const c = this.reviveCostFor(m), can = this.gold >= c;
            return `<button class="btn${can ? " gold" : ""}" ${can ? "" : "disabled"} onclick="Game.reviveMember('${m.id}')">Revive ${m.spr} ${m.name} · ${c}g</button>`; }).join(" ")
          + (dead.length > 1 ? `<div class="small" style="opacity:.6;margin-top:4px">Total to revive all: ${reviveAll}g</div>` : "")
        : `<button class="btn" disabled>No fallen heroes</button>`);
    h += card("⚔️", "Head Back Out", next ? `Set out for ${next.name}.` : "Press on to the final reckoning.",
      `<button class="btn gold" onclick="Game.leaveTown()">${next ? "Onward to " + next.name + " →" : "Onward →"}</button>`);
    h += card("🔄", "Start Over", "Abandon this run and rebuild your party.",
      `<button class="btn" onclick="Game.restartFromTown()">Restart run</button>`);

    h += `</div>`;
    Overlay.show(h);
  },
  // Leave the town and continue onward — the old leaveMerchant behavior (next zone, or victory).
  leaveTown(): void {
    this._inTown = false; this._inMerchant = false;
    Overlay.hide();
    if (Field.isLastZone()) this.victory();
    else Field.loadZone(Field.zoneIndex + 1);
  },
  restartFromTown(): void {
    this._inTown = false; this._inMerchant = false;
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
  // The shop's "back" returns to the town hub (the merchant now lives inside the town).
  leaveMerchant(): void {
    this._inMerchant = false;
    this.renderTown();
  },
};
