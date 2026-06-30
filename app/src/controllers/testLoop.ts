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

export const TestLoop = {
  // fight config
  foes: [] as string[],
  depth: 0.3,
  isBoss: false,
  champ: false,
  // party config
  level: 5,
  // loot config
  lootLevel: 5,
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
    this.setLevel(this.level);
    this.menu();
  },

  pickParty(): void { Roster.open((defs) => this.installParty(defs)); },

  /** Set every hero to level N with N intrinsic MNA in its own Attunement (≈ the 1/level auto-bank), full
   *  HP/MP — a clean bench character. Enough MNA to reach the kit milestones up to N. */
  setLevel(n: number): void {
    this.level = Math.max(1, Math.min(100, Math.round(n)));
    Game.party.forEach((m) => {
      m.level = this.level; m.xp = 0; m.mnaPoints = 0;
      m.mnaAlloc = zeroMna(); m.mnaAlloc[m.att] = this.level;
    });
    recalc(Game.party);
    Game.party.forEach((m) => { m.hp = m.maxhp; m.mp = m.maxmp; m.alive = true; });
  },

  /* ---- fight config ---- */
  toggleFoe(key: string): void {
    const i = this.foes.indexOf(key);
    if (i >= 0) this.foes.splice(i, 1);
    else if (this.foes.length < 5) this.foes.push(key); // packs ≤ 5
    this.menu();
  },
  setDepth(d: number): void { this.depth = Math.max(0, Math.min(1, Math.round(d * 100) / 100)); this.menu(); },
  toggleBoss(): void { this.isBoss = !this.isBoss; this.menu(); },
  toggleChamp(): void { this.champ = !this.champ; this.menu(); },
  bump(field: "level" | "lootLevel", d: number): void {
    if (field === "level") this.setLevel(this.level + d);
    else { this.lootLevel = Math.max(1, Math.min(100, this.lootLevel + d)); this.menu(); }
  },

  /** Start the configured fight (testMode is on → wipe/victory return here, no save touched). */
  /** Bench rule: a fight always starts from full — so a prior wipe can't leave a dead party that
   *  instantly re-wipes (Battle.begin resets statuses/cooldowns but not HP/alive). (ADR 0017) */
  reviveParty(): void { Game.party.forEach((m) => { m.hp = m.maxhp; m.mp = m.maxmp; m.alive = true; }); },
  fight(): void {
    const foes = this.foes.length ? this.foes : [Object.keys(ENEMIES)[0]];
    this.reviveParty();
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
    const pctLE = (arr: number[], v: number) => (arr.length ? Math.round((arr.filter((x) => x <= v).length / arr.length) * 100) : 100);
    this.lastLoot = it;
    this.lastPct = { overall: pctLE(scores, score), within: pctLE(within, score), rarity: it.rarity };
    this.menu();
  },

  /* ---- the loop menu ---- */
  menu(): void {
    Game.continueAfterBattle = () => this.menu(); // returning from Bag/Party (UI.close) comes back here
    Screens.show("title");
    const party = Game.party.map((m) => {
      const c = ATT[m.att].color;
      return `<span class="pill" style="border-color:${c}66"><b style="color:${c}">${m.name}</b> ${m.cls} L${m.level} · GS ${gearScore(m).overall} · ${m.hp}/${m.maxhp}</span>`;
    }).join(" ");

    // enemy picker — grouped by Attunement, toggle up to 5
    let foeGrid = "";
    for (const att of ATTUNEMENTS) {
      const keys = Object.keys(ENEMIES).filter((k) => ENEMIES[k].att === att);
      if (!keys.length) continue;
      foeGrid += `<div class="small" style="color:${ATT[att].color};margin-top:4px">${att}</div><div>`;
      for (const k of keys) {
        const on = this.foes.includes(k);
        const e = ENEMIES[k];
        const tag = e.boss ? "♛" : e.miniboss ? "✦" : "";
        foeGrid += `<button class="btn${on ? " gold" : ""}" style="font-size:10px;margin:1px;padding:2px 6px;min-height:0" onclick="TestLoop.toggleFoe('${k}')" title="${e.name} L${e.lvl} ${e.role}">${tag}${k}</button>`;
      }
      foeGrid += `</div>`;
    }

    const sel = this.foes.length ? this.foes.join(", ") : "(none — defaults to one)";
    const lootRead = this.lastLoot && this.lastPct
      ? `<div class="card" style="text-align:left;margin-top:4px">${itemHtml(this.lastLoot)}
          <div class="small" style="margin-top:4px">Score <b>${itemScore(this.lastLoot)}</b> · <b>${this.lastPct.overall}%</b> overall · <b>${this.lastPct.within}%</b> within ${this.lastPct.rarity} <span style="opacity:.6">(vs ${MC_ROLLS} rolls @ L${this.lootLevel})</span></div></div>`
      : "";

    Overlay.show(`<h2 class="title-gold">Test Loop</h2>
      <div class="small" style="opacity:.8">Dev harness (ADR 0017) — fight real enemies, roll/equip loot, read the Battle Log. Your saved run is never touched.</div>

      <div class="tag" style="margin-top:6px">Party</div>
      <div style="line-height:1.9">${party || "<span class='small'>none</span>"}</div>
      <div class="row" style="margin:4px 0">
        <button class="btn" onclick="TestLoop.pickParty()">Build party ▸</button>
        <button class="btn" onclick="UI.openParty()">Party / Abilities ▸</button>
        <span class="small">Level</span>
        <button class="btn" onclick="TestLoop.bump('level',-5)">−5</button>
        <b style="min-width:24px;text-align:center">${this.level}</b>
        <button class="btn" onclick="TestLoop.bump('level',5)">+5</button>
      </div>

      <div class="tag" style="margin-top:6px">Fight — <span class="small">${sel}</span></div>
      <div class="row" style="margin:4px 0">
        <label class="small"><input type="checkbox" ${this.isBoss ? "checked" : ""} onclick="TestLoop.toggleBoss()"> boss</label>
        <label class="small"><input type="checkbox" ${this.champ ? "checked" : ""} onclick="TestLoop.toggleChamp()"> champion</label>
        <span class="small">depth ${this.depth.toFixed(2)}</span>
        <button class="btn" onclick="TestLoop.setDepth(${(this.depth - 0.1).toFixed(2)})">−</button>
        <button class="btn" onclick="TestLoop.setDepth(${(this.depth + 0.1).toFixed(2)})">+</button>
        <button class="btn gold" onclick="TestLoop.fight()">⚔ Fight</button>
      </div>
      <div class="scroll" style="max-height:22vh;text-align:left">${foeGrid}</div>

      <div class="tag" style="margin-top:6px">Loot</div>
      <div class="row" style="margin:4px 0">
        <span class="small">@ level</span>
        <button class="btn" onclick="TestLoop.bump('lootLevel',-5)">−5</button>
        <b style="min-width:24px;text-align:center">${this.lootLevel}</b>
        <button class="btn" onclick="TestLoop.bump('lootLevel',5)">+5</button>
        <button class="btn gold" onclick="TestLoop.rollLoot()">Roll loot</button>
        <button class="btn" onclick="UI.openInventory()">Bag ▸</button>
      </div>
      ${lootRead}

      <div class="row" style="margin-top:8px">
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
