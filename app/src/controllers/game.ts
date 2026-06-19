// Run lifecycle + run-state container + merchant. The orchestration layer: holds the live
// run (party/gold/inventory/flags) and drives transitions between systems, field, and battle.
// Cross-controller calls that appear only in inline HTML handlers (UI.*, Game.*) resolve via
// the window bridge set up in main.ts, so they aren't imported here (keeps the cycle small).

import type { Attunement, Item, Member, MemberDef } from "../types";
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
  _stock: [] as Item[],
  _lastDefs: null as MemberDef[] | null,

  // Restart with the most recently chosen party (or the default) — used by retry/play-again.
  start(): void { this.startRun(this._lastDefs ?? PARTY_DEFS); },

  // Begin a fresh run with a specific party composition (from the Roster picker or default).
  startRun(defs: MemberDef[]): void {
    this._lastDefs = defs;
    this.gold = 0; this.inventory = []; this.steps = 0; this.encountersWon = 0;
    this.bossDefeated = false; this.miniBossDefeated = false; this.continueAfterBattle = null; this._inMerchant = false;
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
    this.bossDefeated = true; this._inMerchant = false;
    Telemetry.boss("win"); Telemetry.endSession("victory");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">Gaia is saved</h2>
    <p>Mirelord Vorn falls. You have cut a path through every zone of the slice.</p>
    <p class="small">Run complete — encounters won: ${this.encountersWon}. Gold: ${this.gold}.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Play again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },

  // ── MERCHANT: appears after a zone boss; spend gold on rolled loot, then press on ──
  openMerchant(): void {
    this._inMerchant = true;
    const floor = clamp(1 + Field.zoneIndex * 2, 0, 5); // deeper zone = better base stock
    const ilvl = 6 + Field.zoneIndex * 6; // stock the road ahead (gear for the next zone)
    // The merchant deals in foreign attunements too — a weapon of another power reclasses
    // the hero who wields it (class = weapon). Kitted attunements only, for now.
    const atts: Attunement[] = ["SOL", "SOL", "NOX"];
    this._stock = [];
    for (let i = 0; i < 6; i++) this._stock.push(rollItemAtRarity(ri(floor, Math.min(5, floor + 2)), pick(this.party).cls, ilvl, pick(atts)));
    this.renderMerchant();
  },
  renderMerchant(): void {
    const next = Field.isLastZone() ? null : ZONES[Field.zoneIndex + 1];
    let h = `<h2 class="title-gold">Wandering Merchant</h2><div class="small">"Spoils for the road ahead." Gold: <b>${this.gold}</b></div><div class="scroll">`;
    if (!this._stock.length) h += `<p class="small">Sold out. Safe travels.</p>`;
    this._stock.forEach((it, idx) => {
      const price = priceOf(it), afford = this.gold >= price;
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn${afford ? " gold" : ""}" ${afford ? "" : "disabled"} onclick="Game.buyItem(${idx})">Buy · ${price}g</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">Party</button><button class="btn" onclick="UI.openInventory()">Bag</button>`;
    h += `<button class="btn gold" onclick="Game.leaveMerchant()">${next ? "Onward to " + next.name + " →" : "Leave →"}</button></div>`;
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
  leaveMerchant(): void {
    this._inMerchant = false;
    Overlay.hide();
    if (Field.isLastZone()) this.victory();
    else Field.loadZone(Field.zoneIndex + 1);
  },
};
