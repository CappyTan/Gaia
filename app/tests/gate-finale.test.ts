// THE ANCIENT RUINS FINALE (wave6c) — the Long Bridge, the Sealed Gate, the Warmech, and Defense
// Platform V.04 - #13. Guards the four seams the feature adds:
//   • the FLOOR-3 GEOMETRY: a long (10–14 tile), dead-straight, one-tile causeway over an impassable
//     chasm is the SOLE approach to the seal (block the bridge ⇒ the gate strands), and the floor
//     stays a soft-lock-free single component (dungeonTopology replays the chasm/bridge carve);
//   • the WARMECH: re-homed off the random rare pool onto the bridge — out-levels the whole shipped
//     arc, keeps the treasure-tier hoard, and its per-step ambush roll is low + seed-deterministic;
//   • the PLATFORM: a far-endgame L35 boss (enormous derived HP, walls of armor) that is nobody's
//     zone `boss` (so the zone-advance flow ignores it);
//   • the SCRIPT (pure systems/bossScripts): Systems Online / Targeting / Execute→nuke on turns
//     1–3, then the nuke re-fires every 2–3 turns with normal-AI turns between.

import { describe, it, expect } from "vitest";
import { ZONES, type Pt } from "../src/data/zones";
import { ENEMIES, RARE_MONSTERS } from "../src/data/enemies";
import { genDungeon, FIELD_WALLS, type ClearedState } from "../src/systems/mapgen";
import { floorTopology } from "../src/systems/dungeonTopology";
import { rollBridgeAmbush, BRIDGE_AMBUSH_CHANCE } from "../src/systems/encounter";
import { ENEMY_SCRIPTS, newScriptState, scriptedTurn } from "../src/systems/bossScripts";
import { makeEnemy } from "../src/systems/combat";
import { seeded } from "../src/core/rng";

const GV = ZONES.find((z) => z.id === "greenvale")!;
const floors = GV.dungeon2!.floors!;
const A3 = floors[floors.length - 1]; // the Sealed Deep

const fresh = (): ClearedState => ({
  poiSpent: () => false, chestOpened: () => false, miniCleared: false, floorMiniBeaten: false, restSpent: () => false,
});

/** 4-way flood over a realized grid using the REAL wall set, with an optional extra blocked set. */
function reach(grid: string[][], from: Pt, to: Pt, blocked = new Set<string>()): boolean {
  const H = grid.length, W = grid[0]?.length ?? 0;
  const open = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < W && y < H && !FIELD_WALLS.has(grid[y][x]) && !blocked.has(x + "," + y);
  if (!open(from.x, from.y)) return false;
  const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
  const q = [from]; seen[from.y][from.x] = true;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
    }
  }
  return !!seen[to.y]?.[to.x];
}

describe("the Sealed Deep (floor 3) — the Long Bridge + the gate", () => {
  it("authors a long, dead-straight, one-tile causeway (10–14 tiles) over a chasm to the seal", () => {
    expect(A3.chasm && A3.chasm.length).toBeTruthy();
    expect(A3.bridge!.length).toBeGreaterThanOrEqual(10);
    expect(A3.bridge!.length).toBeLessThanOrEqual(14);
    expect(new Set(A3.bridge!.map((b) => b.y)).size).toBe(1); // one row — the dramatic straight span
    // contiguous xs (no gaps a step could fall through)
    const xs = A3.bridge!.map((b) => b.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBe(1);
  });

  it("genDungeon carves the bridge walkable over the impassable chasm; the seal waits at the far end", () => {
    expect(FIELD_WALLS.has("chasm")).toBe(true); // the void is a real wall/flood barrier
    const r = genDungeon(A3, true, fresh(), seeded(7));
    for (const b of A3.bridge!) expect(r.map[b.y][b.x], `bridge tile ${b.x},${b.y}`).toBe("bridge");
    // the void actually stamped (a corner + mid of the authored rect, off the bridge row)
    const cr = A3.chasm![0];
    expect(r.map[cr.y][cr.x]).toBe("chasm");
    expect(r.map[cr.y + cr.h - 1][cr.x + cr.w - 1]).toBe("chasm");
    expect(r.map[A3.seal!.y][A3.seal!.x]).toBe("seal");
    expect(reach(r.map, A3.entry, A3.seal!)).toBe(true); // the gate is walkable-to
  });

  it("the bridge is the SOLE approach — blocking it strands the gate (and only the gate side)", () => {
    const r = genDungeon(A3, true, fresh(), seeded(7));
    const blocked = new Set(A3.bridge!.map((b) => b.x + "," + b.y));
    expect(reach(r.map, A3.entry, A3.seal!, blocked)).toBe(false); // no sneak route around the void
    // the near side is untouched: both vault chests stay reachable with the bridge cut
    expect(reach(r.map, A3.entry, A3.chests[1], blocked)).toBe(true);
    expect(reach(r.map, A3.entry, A3.chests[2], blocked)).toBe(true);
  });

  it("stays a soft-lock-free single component with a loop (dungeonTopology replays the chasm carve)", () => {
    const t = floorTopology(A3, { zone: "greenvale-ruins", floorIndex: 2, floorCount: floors.length });
    expect(t.metrics.softLock.ok, JSON.stringify(t.metrics.softLock.unreachable)).toBe(true);
    expect(t.metrics.egress.reachable).toBe(true);
    expect(t.metrics.components).toBe(1);
    expect(t.metrics.loops).toBeGreaterThanOrEqual(1); // the twin-vault circuit survives the rework
  });
});

describe("the Warmech — the bridge ambush (FF1 homage)", () => {
  it("out-levels the entire shipped arc (bar the gate guardian) and keeps the treasure-tier hoard", () => {
    const d = ENEMIES.warmech;
    expect(d.lvl).toBeGreaterThanOrEqual(22);
    expect(d.lvl).toBeLessThanOrEqual(24);
    expect(d.rare).toBe(true); // rare ⇒ the 3-drop hoard + no elite roll (battle.end / makeEnemy)
    for (const [k, e] of Object.entries(ENEMIES))
      if (k !== "warmech" && k !== "defplatform") expect(d.lvl, `warmech must out-level ${k}`).toBeGreaterThan(e.lvl);
    // jackpot rewards: outearns every rare in the random pool
    for (const r of RARE_MONSTERS) { expect(d.xp).toBeGreaterThan(ENEMIES[r.key].xp); expect(d.gold[1]).toBeGreaterThan(ENEMIES[r.key].gold[1]); }
    // re-homed: NOT in the random rare pool any more (it lives on the bridge, per-step)
    expect(RARE_MONSTERS.some((r) => r.key === "warmech")).toBe(false);
  });

  it("the ambush roll is LOW (~3–5%), pure, and seed-deterministic", () => {
    expect(BRIDGE_AMBUSH_CHANCE).toBeGreaterThanOrEqual(0.03);
    expect(BRIDGE_AMBUSH_CHANCE).toBeLessThanOrEqual(0.05);
    expect(rollBridgeAmbush(() => BRIDGE_AMBUSH_CHANCE - 0.001)).toBe(true);
    expect(rollBridgeAmbush(() => BRIDGE_AMBUSH_CHANCE)).toBe(false); // strict-less-than boundary
    const rng = seeded(42);
    let hits = 0;
    for (let i = 0; i < 5000; i++) if (rollBridgeAmbush(rng)) hits++;
    expect(hits).toBeGreaterThan(80);   // ≈ 4% of 5000 = 200; wide seeded-sanity band
    expect(hits).toBeLessThan(360);
  });
});

describe("Defense Platform V.04 - #13 — the scripted gate guardian", () => {
  it("is a far-endgame wall: an L35 boss with enormous derived HP + heavy armor, and nobody's zone boss", () => {
    const d = ENEMIES.defplatform;
    expect(d.lvl).toBe(35);
    expect(d.role).toBe("boss");
    expect(d.boss).toBe(true); // boss-tier render/AI/stun-immunity + boss spoils
    const e = makeEnemy("defplatform", 0, true, 0, false, seeded(1));
    expect(e.maxhp).toBeGreaterThan(15000); // "enormous HP (thousands)" — far beyond any current party's burst
    expect(e.armor).toBeGreaterThan(400);   // walls of DEF: matter chip damage only
    expect(e.atk).toBeGreaterThan(80);      // with its ~×8.4 abp amplifier, any connected hit ends a current-arc hero
    // never in a zone's authored flow: not a zone boss (the zone-advance identity check in battle.end),
    // and in no encounter band anywhere (it is reached only via the gate's Engage warning).
    for (const z of ZONES) {
      expect(z.boss).not.toBe("defplatform");
      const bands = [...z.bands, ...(z.dungeon.bands ?? []), ...(z.dungeon2?.bands ?? [])];
      for (const b of bands) for (const s of b.sets) expect(s).not.toContain("defplatform");
    }
    expect(RARE_MONSTERS.some((r) => r.key === "defplatform")).toBe(false);
  });

  it("scripts its first three turns verbatim: Systems Online / Targeting / Execute→nuke, never attacking early", () => {
    const s = ENEMY_SCRIPTS.defplatform;
    expect(s).toBeTruthy();
    const st = newScriptState(), rng = seeded(5);
    const t1 = scriptedTurn(s, st, rng)!;
    expect(t1.say!.text).toBe("Systems Online");
    expect(t1.act).toBe("hold"); // boots + analyzes — no attack
    const t2 = scriptedTurn(s, st, rng)!;
    expect(t2.say!.text).toBe("Targeting");
    expect(t2.act).toBe("hold"); // defense systems come online — no attack
    const t3 = scriptedTurn(s, st, rng)!;
    expect(t3.say!.text).toBe("Execute");
    expect(t3.act).toBe("nuke"); // → Vault Purge Protocol, immediately
    expect(t1.say!.speaker).toBe("Defense Platform V.04 - #13");
  });

  it("after the opening it re-fires the nuke every 2–3 turns, with normal-AI turns between", () => {
    const s = ENEMY_SCRIPTS.defplatform;
    const st = newScriptState(), rng = seeded(9);
    for (let i = 0; i < 3; i++) scriptedTurn(s, st, rng); // play out the opening
    let last = 3, fires = 0;
    for (let turn = 4; turn <= 60; turn++) {
      const step = scriptedTurn(s, st, rng);
      if (!step) continue; // a normal AI turn between cadence beats
      expect(step.act).toBe("nuke"); // the loop only ever re-fires the nuke
      const gap = turn - last;
      expect(gap).toBeGreaterThanOrEqual(2);
      expect(gap).toBeLessThanOrEqual(3);
      last = turn; fires++;
    }
    expect(fires).toBeGreaterThanOrEqual(15); // it kept firing for the whole fight
  });

  it("sequencing is deterministic under a fixed seed", () => {
    const s = ENEMY_SCRIPTS.defplatform;
    const run = () => {
      const st = newScriptState(), rng = seeded(1234), acts: string[] = [];
      for (let t = 1; t <= 20; t++) acts.push(scriptedTurn(s, st, rng)?.act ?? "-");
      return acts.join("");
    };
    expect(run()).toBe(run());
  });
});
