// TEST LOOP — the dev/QA harness (ADR 0017). Drops a chosen party into a configurable fight → loot →
// equip loop, on the SHIPPING systems (testing the harness = testing the game). It BORROWS the live
// run-state behind Game.testMode (so saveNow no-ops, a wipe/victory returns here instead of title/field)
// and installs `Game.testReturn = () => TestLoop.menu()` as the loop-return. Lives on the title screen
// beside Data/Telemetry; never writes the player's save slot. Per-action telemetry is captured by the
// BattleLog buffer (also gated by testMode) and read in its dashboard.

import type { Attunement, Item, Member, MemberDef } from "../types";
import { ATTUNEMENTS } from "../types";
import { ATT } from "../data/attunements";
import { ENEMIES } from "../data/enemies";
import { PARTY_DEFS } from "../data/party";
import { makeMember, recalc } from "../systems/progression";
import { makeItem, rollItemAtLevel, itemScore } from "../systems/loot";
import { gearScore } from "../systems/gearScore";
import { zeroMna } from "../types";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Screens } from "./screens";
import { Roster } from "./roster";
import { Battle } from "./battle";
import { BattleLog } from "../telemetry/battleLog";
import { Game } from "./game";

const MC_ROLLS = 400; // Monte-Carlo sample for the loot-percentile readout
// A dark-theme numeric stepper field (type to jump, native ±1 step) — used for Level and loot level.
// font-size:16px keeps it legible AND (belt-and-suspenders with the viewport meta) prevents iOS focus-zoom.
const NUM_INPUT = "width:54px;text-align:center;background:#16122a;color:#fff;border:1px solid #3a3358;border-radius:6px;padding:5px;font-size:16px;font-weight:600";

/** Percentile of `v` within `arr` (% of samples ≤ v). Empty sample → 100. Pure (exported for tests). */
export const percentileLE = (arr: number[], v: number): number =>
  arr.length ? Math.round((arr.filter((x) => x <= v).length / arr.length) * 100) : 100;

export const TestLoop = {
  // fight config
  foes: [] as string[],
  foesOpen: false, // the enemy picker is a collapsed accordion by default (it's the bulk of the screen)
  depth: 0.3,
  isBoss: false,
  champ: false,
  // party config
  level: 1,
  // loot config
  lootLevel: 1,
  lastLoot: null as Item | null,
  lastPct: null as { overall: number; within: number; rarity: string } | null,

  /** Enter the harness from the title. Arms the testMode seams and installs a FRESH bench party — never
   *  borrows a leftover real-run party that might still be sitting in Game.party. */
  open(): void {
    Game.testMode = true;
    Game.testReturn = () => this.menu();
    BattleLog.enabled = true;
    this.installParty(PARTY_DEFS);
  },

  /** Build a borrowed test party from defs (mirrors Game.startRun's party setup — starter weapon in each
   *  hero's own Attunement, recalc), set it to the chosen level, then show the loop. */
  installParty(defs: MemberDef[]): void {
    Game.party = defs.map((d) => makeMember(d));
    Game.party.forEach((m) => { m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att); });
    recalc(Game.party);
    this.setLevel(this.level); // sets level/MNA/HP and renders the loop menu
  },

  pickParty(): void { Roster.open((defs) => this.installParty(defs)); },

  /** Set every hero to level N (1–100) with N intrinsic MNA in its own Attunement (≈ the 1/level
   *  auto-bank), full HP/MP — a clean bench character. Coerces a string (from the number field). */
  setLevel(n: number | string): void {
    const v = Math.round(Number(n));
    this.level = Math.max(1, Math.min(100, isFinite(v) ? v : this.level));
    Game.party.forEach((m) => {
      m.level = this.level; m.xp = 0; m.mnaPoints = 0;
      m.mnaAlloc = zeroMna(); m.mnaAlloc[m.att] = this.level;
    });
    recalc(Game.party);
    Game.party.forEach((m) => { m.hp = m.maxhp; m.mp = m.maxmp; m.alive = true; });
    this.menu();
  },
  setLootLevel(n: number | string): void {
    const v = Math.round(Number(n));
    this.lootLevel = Math.max(1, Math.min(100, isFinite(v) ? v : this.lootLevel));
    this.menu();
  },
  // Relative ±1 steppers read the CURRENT value (not an HTML-captured literal), so rapid taps before a
  // re-render paint each count — every tap is authoritative.
  stepLevel(d: number): void { this.setLevel(this.level + d); },
  stepLoot(d: number): void { this.setLootLevel(this.lootLevel + d); },

  /* ---- fight config ---- */
  toggleFoesPanel(): void { this.foesOpen = !this.foesOpen; this.menu(); },
  toggleFoe(key: string): void {
    const i = this.foes.indexOf(key);
    if (i >= 0) this.foes.splice(i, 1);
    else if (this.foes.length < 5) this.foes.push(key); // packs ≤ 5
    this.menu();
  },
  clearFoes(): void { this.foes = []; this.menu(); },
  setDepth(d: number): void { this.depth = Math.max(0, Math.min(1, Math.round(d * 100) / 100)); this.menu(); },
  toggleBoss(): void { this.isBoss = !this.isBoss; this.menu(); },
  toggleChamp(): void { this.champ = !this.champ; this.menu(); },

  /** Bench rule: a fight always starts from full — so a prior wipe can't leave a dead party that
   *  instantly re-wipes (Battle.begin resets statuses/cooldowns but not HP/alive). (ADR 0017) */
  reviveParty(): void { Game.party.forEach((m) => { m.hp = m.maxhp; m.mp = m.maxmp; m.alive = true; }); },
  /** Start the configured fight (testMode is on → wipe/victory return here, no save touched). */
  fight(): void {
    const foes = this.foes.length ? this.foes : [Object.keys(ENEMIES)[0]];
    this.reviveParty();
    Overlay.hide(); // the loop menu is an overlay — hide it so the battle screen underneath is visible
    Battle.begin(foes, "plains", this.isBoss, false, this.depth, this.champ ? 0 : -1);
  },

  /* ---- loot tools ---- */
  /** Roll one item at the loot level (the real faucet), bank it, and compute its percentile vs a
   *  Monte-Carlo sample of the SAME faucet — overall + within its rarity (scored by itemScore). */
  rollLoot(): void {
    const prefCls = Game.party[0]?.cls;
    const prefAtt = Game.party[0]?.att as Attunement | undefined;
    const it = rollItemAtLevel(this.lootLevel, prefCls, this.lootLevel, prefAtt);
    Game.inventory.push(it);
    const score = itemScore(it);
    const sample = Array.from({ length: MC_ROLLS }, () => rollItemAtLevel(this.lootLevel, prefCls, this.lootLevel, prefAtt));
    const scores = sample.map(itemScore);
    const within = sample.filter((s) => s.rarity === it.rarity).map(itemScore);
    this.lastLoot = it;
    this.lastPct = { overall: percentileLE(scores, score), within: percentileLE(within, score), rarity: it.rarity };
    this.menu();
  },

  /* ---- the loop menu ---- */
  menu(): void {
    Game.continueAfterBattle = () => this.menu(); // returning from Bag/Party (UI.close) comes back here
    Screens.show("title");

    // Party — one hero per line (no wrapping/cut-off).
    const party = Game.party.map((m) => {
      const c = ATT[m.att].color;
      return `<div class="small" style="text-align:left;padding:1px 2px"><b style="color:${c}">${m.name}</b> <span style="opacity:.82">${m.cls} · L${m.level} · GS ${gearScore(m).overall} · ${m.hp}/${m.maxhp} HP</span></div>`;
    }).join("");

    // Level + loot-level stepper: − [type-to-jump field] + (increments of 1). The ± buttons step relative
    // to the live value (`rel`); the field sets an absolute value (`abs`).
    const stepper = (label: string, val: number, abs: string, rel: string) =>
      `<span class="small">${label}</span>
       <button class="btn" style="min-width:38px" onclick="TestLoop.${rel}(-1)">−</button>
       <input type="number" value="${val}" min="1" max="100" inputmode="numeric" onchange="TestLoop.${abs}(this.value)" style="${NUM_INPUT}">
       <button class="btn" style="min-width:38px" onclick="TestLoop.${rel}(1)">+</button>`;
    const head = (label: string) => `<div class="tag" style="margin-top:10px;font-size:11px;color:var(--gold);opacity:.85">${label}</div>`;

    // Enemy picker — a collapsed accordion (the bulk of the screen); selection summary in the header.
    const selSummary = this.foes.length
      ? `${this.foes.length} selected · ${this.foes.slice(0, 2).join(", ")}${this.foes.length > 2 ? "…" : ""}`
      : "none — defaults to one";
    let foeGrid = "";
    for (const att of ATTUNEMENTS) {
      const keys = Object.keys(ENEMIES).filter((k) => ENEMIES[k].att === att);
      if (!keys.length) continue;
      foeGrid += `<div class="small" style="color:${ATT[att].color};margin-top:6px">${att}</div><div>`;
      for (const k of keys) {
        const on = this.foes.includes(k);
        const e = ENEMIES[k];
        const tag = e.boss ? "♛" : e.miniboss ? "✦" : "";
        // tap-sized chip with the level INLINE (no hover tooltip on touch); title carries the full name.
        foeGrid += `<button class="btn${on ? " gold" : ""}" style="font-size:12px;margin:3px;padding:7px 10px;min-height:36px" onclick="TestLoop.toggleFoe('${k}')" title="${e.name} · ${e.role}">${tag}${k} L${e.lvl}</button>`;
      }
      foeGrid += `</div>`;
    }
    const foePanel = `<div class="row" style="margin:4px 0;align-items:center;cursor:pointer" onclick="TestLoop.toggleFoesPanel()">
        <span class="tag" style="margin:0;font-size:11px;color:var(--gold);opacity:.85">Enemies ${this.foesOpen ? "▾" : "▸"}</span>
        <span class="small" style="flex:1;min-width:0;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${selSummary}</span>
        ${this.foes.length ? `<button class="btn" style="font-size:12px;padding:5px 10px" onclick="event.stopPropagation();TestLoop.clearFoes()">clear</button>` : ""}
      </div>
      ${this.foesOpen ? `<div class="scroll" style="max-height:32vh;text-align:left">${foeGrid}</div>` : ""}`;

    const lootRead = this.lastLoot && this.lastPct
      ? `<div class="card" style="text-align:left;margin-top:4px">${itemHtml(this.lastLoot)}
          <div class="small" style="margin-top:4px">Score <b>${itemScore(this.lastLoot)}</b> · <b>${this.lastPct.overall}%</b> overall · <b>${this.lastPct.within}%</b> within ${this.lastPct.rarity} <span style="opacity:.6">(vs ${MC_ROLLS} rolls @ L${this.lootLevel})</span></div></div>`
      : "";

    Overlay.show(`<h2 class="title-gold">Test Loop</h2>
      <div class="small" style="opacity:.78">Dev harness — fight real enemies, roll/equip loot, read the Battle Log. Your saved run is never touched.</div>

      ${head("Party")}
      <div>${party || "<span class='small'>none</span>"}</div>
      <div class="row" style="margin:5px 0;align-items:center">
        <button class="btn" onclick="TestLoop.pickParty()">Build party ▸</button>
        <button class="btn" onclick="UI.openParty()">Abilities ▸</button>
        ${stepper("Level", this.level, "setLevel", "stepLevel")}
      </div>

      ${head("Fight")}
      <div class="row" style="margin:5px 0;align-items:center">
        <label class="small"><input type="checkbox" ${this.isBoss ? "checked" : ""} onclick="TestLoop.toggleBoss()"> boss</label>
        <label class="small"><input type="checkbox" ${this.champ ? "checked" : ""} onclick="TestLoop.toggleChamp()"> champion</label>
        <span class="small" title="enemy level scaling: 0 = zone start, 1 = zone end">depth ${this.depth.toFixed(2)} (0–1)</span>
        <button class="btn" style="min-width:34px" onclick="TestLoop.setDepth(${(this.depth - 0.1).toFixed(2)})">−</button>
        <button class="btn" style="min-width:34px" onclick="TestLoop.setDepth(${(this.depth + 0.1).toFixed(2)})">+</button>
      </div>
      ${foePanel}
      <div class="row" style="margin:8px 0"><button class="btn gold" style="flex:1;font-size:16px;padding:10px" onclick="TestLoop.fight()">⚔ Fight</button></div>

      ${head("Loot")}
      <div class="row" style="margin:5px 0;align-items:center">
        ${stepper("@ level", this.lootLevel, "setLootLevel", "stepLoot")}
        <button class="btn gold" onclick="TestLoop.rollLoot()">Roll loot</button>
        <button class="btn" onclick="UI.openInventory()">Bag ▸</button>
      </div>
      ${lootRead}

      <div class="row" style="margin-top:12px">
        <button class="btn" onclick="BattleLog.show()">Battle Log ▸</button>
        <button class="btn" onclick="TestLoop.exit()">Exit to title</button>
      </div>`);
  },

  /** Leave the harness: clear testMode + the borrowed party + the log, return to title (ADR 0017). */
  exit(): void {
    Game.testMode = false;
    Game.testReturn = null;
    Game.continueAfterBattle = null;
    BattleLog.enabled = false;
    BattleLog.clear();
    Game.party = [] as Member[];
    Overlay.hide();
    Screens.show("title");
  },
};
