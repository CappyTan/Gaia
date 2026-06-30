// Test Loop dev harness (ADR 0017): the BattleLog per-action buffer + the testMode run-state gating.
// Pure-ish — the buffer is plain data; the gating is asserted at the Game seams (no real DOM/Field needed
// because the testMode branches early-return before touching them).

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BattleLog } from "../src/telemetry/battleLog";
import { Game } from "../src/controllers/game";
import { TestLoop, percentileLE, zoneForLevel } from "../src/controllers/testLoop";
import { ZONES } from "../src/data/zones";
import { ENEMIES } from "../src/data/enemies";
import type { Member } from "../src/types";

const ctx = () => ({
  enemies: [{ key: "gbandit", lvl: 3, att: "NOX" as const }],
  party: [{ name: "Auren", cls: "Staff", att: "SOL", level: 5, gearScore: 120 }],
  isBoss: false, depth: 0.3, env: "plains",
});
const hit = (side: "party" | "enemy", dmg: number, crit = false) =>
  BattleLog.action({ side, actor: side === "party" ? "Auren" : "Bandit", ability: "Attack", target: side === "party" ? "Bandit" : "Auren", dmg, affinityMult: 1, crit, hpBefore: 40, hpAfter: 40 - dmg });

describe("BattleLog — per-action buffer (ADR 0017)", () => {
  beforeEach(() => { BattleLog.clear(); BattleLog.enabled = true; });
  afterEach(() => { BattleLog.clear(); BattleLog.enabled = false; });

  it("captures a fight: actions stream + rolled-up summary", () => {
    BattleLog.startFight(ctx());
    hit("party", 10); hit("party", 20, true); hit("enemy", 7);
    BattleLog.endFight("won", 73.4);
    expect(BattleLog.fights.length).toBe(1);
    const f = BattleLog.fights[0];
    expect(f.outcome).toBe("won");
    expect(f.actions.length).toBe(3);
    expect(f.actions.map((a) => a.seq)).toEqual([0, 1, 2]); // monotonic action sequence
    expect(f.summary.partyDmg).toBe(30);
    expect(f.summary.enemyDmg).toBe(7);
    expect(f.summary.crits).toBe(1);
    expect(f.summary.partyHpEndPct).toBe(73); // rounded
  });

  it("is a NO-OP when disabled (zero cost in real play)", () => {
    BattleLog.enabled = false;
    BattleLog.startFight(ctx());
    hit("party", 99);
    BattleLog.endFight("won", 100);
    expect(BattleLog.fights.length).toBe(0);
    expect(BattleLog.cur).toBeNull();
  });

  it("caps the in-memory history (backstop) and clear() empties it", () => {
    for (let i = 0; i < 35; i++) { BattleLog.startFight(ctx()); hit("party", 5); BattleLog.endFight("won", 100); }
    expect(BattleLog.fights.length).toBe(30); // CAP
    BattleLog.clear();
    expect(BattleLog.fights.length).toBe(0);
  });
});

describe("loot percentile (harness readout math)", () => {
  it("scores a value's percentile within a sample (% ≤ v); empty → 100", () => {
    const arr = [10, 20, 30, 40]; // 4 samples
    expect(percentileLE(arr, 30)).toBe(75);  // 3 of 4 are ≤ 30
    expect(percentileLE(arr, 5)).toBe(0);     // beats nothing
    expect(percentileLE(arr, 99)).toBe(100);  // beats everything
    expect(percentileLE([], 50)).toBe(100);   // no sample → top by convention
  });
});

describe("zoneForLevel (default-fight level scaling)", () => {
  const avgLvl = (z: typeof ZONES[number]) => {
    const lvls = z.bands.flatMap((b) => b.sets.flat()).map((k) => ENEMIES[k]?.lvl ?? 1);
    return lvls.reduce((a, b) => a + b, 0) / lvls.length;
  };
  it("a low-level party matches an early zone; a high-level party a later one (it scales)", () => {
    const lo = zoneForLevel(1), hi = zoneForLevel(99);
    expect(avgLvl(lo)).toBeLessThan(avgLvl(hi));        // higher party level → tougher (higher-level) zone
    expect(ZONES.indexOf(lo)).toBeLessThan(ZONES.indexOf(hi)); // and an earlier zone on the arc
  });
  it("picks the zone whose average enemy level is closest to the party level", () => {
    const target = zoneForLevel(7);
    const best = ZONES.reduce((b, z) => Math.abs(avgLvl(z) - 7) < Math.abs(avgLvl(b) - 7) ? z : b, ZONES[0]);
    expect(target).toBe(best);
  });
});

describe("Game testMode gating (ADR 0017)", () => {
  beforeEach(() => {
    let store: Record<string, string> = {};
    (globalThis as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => { store[k] = v; },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { store = {}; },
      key: () => null, length: 0,
    } as Storage;
  });
  afterEach(() => { Game.testMode = false; Game.testReturn = null; Game.state = "title"; });

  it("saveNow() never writes the save slot under testMode", () => {
    Game.testMode = true;
    Game.state = "field";          // a state that WOULD normally autosave
    Game.party = [{} as never];    // …and a non-empty party (the other guard)
    Game.saveNow();
    expect(localStorage.getItem("gaia.save.v1")).toBeNull(); // the testMode early-return blocked it
  });

  it("gameOver() routes to the loop menu (testReturn) without clearing the save", () => {
    localStorage.setItem("gaia.save.v1", "SENTINEL");
    let returned = false;
    Game.testMode = true;
    Game.testReturn = () => { returned = true; };
    Game.gameOver();
    expect(returned).toBe(true);                                  // returned to the harness loop
    expect(localStorage.getItem("gaia.save.v1")).toBe("SENTINEL"); // the player's run is untouched
  });

  it("reviveParty() restores a wiped bench party to full (no instant-wipe loop)", () => {
    Game.party = [
      { hp: 0, maxhp: 40, mp: 0, maxmp: 10, alive: false } as Member,
      { hp: 5, maxhp: 30, mp: 2, maxmp: 8, alive: true } as Member,
    ];
    TestLoop.reviveParty();
    expect(Game.party.every((m) => m.alive && m.hp === m.maxhp && m.mp === m.maxmp)).toBe(true);
    Game.party = [];
  });
});
