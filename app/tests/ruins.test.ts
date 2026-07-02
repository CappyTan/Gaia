// @vitest-environment jsdom
//
// THE ANCIENT RUINS (wave3b) — Greenvale's SECOND dungeon. Guards the three seams the feature adds:
//   • the DATA CONTRACT: `zone.dungeon2` + its `layout.ruins` entrance pairing, the bossless `seal`
//     terminus, the single partial rest (ADR 0010), the hotter bands + the ilvl edge;
//   • the PURE GENERATORS: the overworld "ruins" mouth is stamped + reachable (buildAuthoredGrid AND
//     mapgen.genOverworld), every Ruins floor is a soft-lock-free MESH (dungeonTopology), and the
//     finale floor carves the walkable "seal" landmark INSTEAD of a boss (genDungeon);
//   • the CONTROLLER PLUMBING: stepping onto the ruins tile resolves the SECOND descend target
//     (Field.activeDungeon/dungeonDef — the "current dungeon" is parameterized, no longer hard-wired
//     to zone().dungeon), persistence keys are namespaced apart from the Warren's, and ascend()
//     returns the player to the RUINS entrance tile, not the Warren mouth.

import { describe, it, expect, beforeEach } from "vitest";
import { ZONES, type DungeonLayout, type Pt } from "../src/data/zones";
import { ENEMIES } from "../src/data/enemies";
import { buildAuthoredGrid, placementOf } from "../src/data/world";
import { genOverworld, genDungeon, type ClearedState } from "../src/systems/mapgen";
import { floorTopology } from "../src/systems/dungeonTopology";
import { seeded } from "../src/core/rng";
import { Field } from "../src/controllers/field";
import { Game } from "../src/controllers/game";

const GV = ZONES.find((z) => z.id === "greenvale")!;
const RUINS = GV.dungeon2!;
const L = GV.layout;
const floors: DungeonLayout[] = RUINS.floors && RUINS.floors.length ? RUINS.floors : [RUINS.layout];

/** A fresh nothing-cleared state for the pure generators. */
const fresh = (): ClearedState => ({
  poiSpent: () => false, chestOpened: () => false, miniCleared: false, floorMiniBeaten: false, restSpent: () => false,
});

/** 4-way flood over a realized grid (mirrors the entrability test's REALIZE_WALLS). */
const WALLS = new Set(["tree", "water", "uncharted", "cliff", "river"]);
function reach(grid: string[][], from: Pt, to: Pt): boolean {
  const H = grid.length, W = grid[0]?.length ?? 0;
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !WALLS.has(grid[y][x]);
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

describe("the Ancient Ruins — data contract", () => {
  it("Greenvale carries a second dungeon with a paired overworld entrance and three floors", () => {
    expect(RUINS).toBeTruthy();
    expect(L.ruins).toBeTruthy();
    expect(floors.length).toBe(3);
    expect(RUINS.layout).toBe(floors[0]); // the single-floor contract, same as the Warren
  });

  it("ends at a SEALED terminus, not a boss — and is keyless (no floor minibosses)", () => {
    const last = floors[floors.length - 1];
    expect(last.seal).toBeTruthy();
    expect(last.boss).toEqual(last.seal); // boss-reading consumers (progress/topology egress) point at the seal
    expect(last.stairsDown).toBeUndefined(); // nothing deeper — the door is the end
    for (const F of floors) expect(F.miniboss).toBeUndefined();
    expect(RUINS.floorMini).toBeUndefined();
  });

  it("carries AT MOST one rest, and it is a PARTIAL themed reprieve (ADR 0010 — never a full heal)", () => {
    const rests = floors.flatMap((F) => F.rests ?? []);
    expect(rests.length).toBeLessThanOrEqual(1);
    const withRest = floors.filter((F) => F.rests?.length);
    for (const F of withRest) {
      expect(F.reprieve).toBeDefined();
      expect(F.reprieve!.amount ?? 0.4).toBeLessThan(1); // partial by construction
    }
  });

  it("is noticeably HOTTER than the Greenvale overworld and carries a clear loot edge", () => {
    expect(RUINS.bands && RUINS.bands.length).toBeTruthy();
    const lvls = (bands: typeof GV.bands) => bands.flatMap((b) => b.sets.flat()).map((k) => ENEMIES[k].lvl);
    const owLvls = lvls(GV.bands), ruinLvls = lvls(RUINS.bands!);
    for (const k of RUINS.bands!.flatMap((b) => b.sets.flat())) expect(ENEMIES[k], `enemy "${k}" exists`).toBeTruthy();
    // the Ruins' cast tops out well above the shire's (Silverwood stock) and averages hotter.
    // (v0.212 re-center: the whole arc is compressed onto ~L9–21 for the L10 hero start, so the
    // absolute gaps are tighter than the old L1–25 spread — +2 on the top end, +1 on the average;
    // the multi-floor depth bump then adds up to +3 effective levels on top.)
    expect(Math.max(...ruinLvls)).toBeGreaterThanOrEqual(Math.max(...owLvls) + 2);
    const avg = (a: number[]) => a.reduce((n, v) => n + v, 0) / a.length;
    expect(avg(ruinLvls)).toBeGreaterThan(avg(owLvls) + 1);
    // the chest curve edge: +2/+3 ilvl over the overworld (Field.openChest adds it to level AND ilvl).
    expect(RUINS.ilvlBonus ?? 0).toBeGreaterThanOrEqual(2);
    // packs stay within the battle-screen cap.
    for (const b of RUINS.bands!) for (const s of b.sets) { expect(s.length).toBeGreaterThan(0); expect(s.length).toBeLessThanOrEqual(5); }
  });
});

describe("the Ancient Ruins — pure generators", () => {
  it("the big-map blueprint stamps a reachable 'ruins' mouth (buildAuthoredGrid)", () => {
    const grid = buildAuthoredGrid("greenvale", false);
    expect(grid[L.ruins!.y][L.ruins!.x]).toBe("ruins");
    expect(reach(grid, L.spawn, L.ruins!)).toBe(true); // reachable with the Warren guard still standing
  });

  it("the discrete overworld stamps a reachable 'ruins' mouth (mapgen.genOverworld)", () => {
    const r = genOverworld(GV, fresh(), seeded(11));
    expect(r.map[L.ruins!.y][L.ruins!.x]).toBe("ruins");
    expect(reach(r.map, L.spawn, L.ruins!)).toBe(true);
  });

  it("every floor is a soft-lock-free MESH (loops, one component, egress + chests reachable)", () => {
    floors.forEach((D, fi) => {
      const t = floorTopology(D, { zone: "greenvale-ruins", floorIndex: fi, floorCount: floors.length });
      expect(t.metrics.softLock.ok, `floor ${fi}: unreachable ${JSON.stringify(t.metrics.softLock.unreachable)}`).toBe(true);
      expect(t.metrics.egress.reachable, `floor ${fi}: egress`).toBe(true);
      expect(t.metrics.components, `floor ${fi}: components`).toBe(1);
      expect(t.metrics.loops, `floor ${fi}: loops`).toBeGreaterThanOrEqual(1);
    });
  });

  it("the finale floor carves the walkable SEAL landmark instead of a boss (genDungeon)", () => {
    const last = floors[floors.length - 1];
    const r = genDungeon(last, true, fresh(), seeded(3));
    expect(r.map[last.seal!.y][last.seal!.x]).toBe("seal");
    expect(r.map.flat()).not.toContain("boss");          // bossless by contract
    expect(reach(r.map, last.entry, last.seal!)).toBe(true); // the door is walkable-to (the flavor beat fires)
    // intermediate floors still carve their stairs down as usual.
    const r0 = genDungeon(floors[0], false, fresh(), seeded(3));
    expect(r0.map[floors[0].stairsDown!.y][floors[0].stairsDown!.x]).toBe("stairsdown");
  });
});

describe("the Ancient Ruins — descend-target resolution (controller plumbing)", () => {
  beforeEach(() => {
    Game.party = [{ alive: true } as any]; // saveNow-safe non-empty run
    document.body.innerHTML = `<div id="fieldScreen"></div><div id="fieldHud"></div><div id="fieldZone"></div><div id="fieldHint"></div>`;
    Field.init();
    Field.enterBigMap("greenvale");
  });

  /** Stand on a Greenvale-local tile (world coords) and fire its cell trigger via a zero-step bigMove. */
  function stepOnto(p: Pt) {
    const pl = placementOf("greenvale")!;
    Field.wx = pl.wx + p.x; Field.wy = pl.wy + p.y;
    Field.realizeAround(); Field.syncZoneFromWorld();
    Field.bigMove(0, 0);
  }

  it("stepping onto the ruins tile descends into dungeon2 (not the Warren), with namespaced keys", () => {
    expect(Field.cellAt(placementOf("greenvale")!.wx + L.ruins!.x, placementOf("greenvale")!.wy + L.ruins!.y).kind).toBe("ruins");
    stepOnto(L.ruins!);
    expect(Field.mode).toBe("dungeon");
    expect(Field.activeDungeon).toBe("second");
    expect(Field.dungeonDef().name).toBe(RUINS.name);
    expect(Field.dungeonFloors().length).toBe(3);
    expect(Field.W).toBe(floors[0].w);                    // the RUINS grid, not the Warren's
    expect(Field.px).toBe(floors[0].entry.x);
    expect(Field.py).toBe(floors[0].entry.y);
    // persistence namespace: Ruins chests/rests can never collide with Warren keys.
    expect(Field.dungeonKeyZone()).toBe("greenvale:ruins");
    // the hotter dungeon-scoped bands + the loot edge resolve through the SAME dungeonDef seam.
    expect(Field.dungeonDef().bands).toBe(RUINS.bands);
    expect(Field.dungeonDef().ilvlBonus).toBe(RUINS.ilvlBonus);
    expect(Field.dungeonSealed()).toBe(true);
  });

  it("ascend() returns the player to the RUINS entrance tile (not the Warren mouth) and re-arms 'main'", () => {
    stepOnto(L.ruins!);
    expect(Field.mode).toBe("dungeon");
    Field.ascend();
    const pl = placementOf("greenvale")!;
    expect(Field.mode).toBe("overworld");
    expect({ x: Field.wx, y: Field.wy }).toEqual({ x: pl.wx + L.ruins!.x, y: pl.wy + L.ruins!.y });
    expect(Field.activeDungeon).toBe("main"); // the next descent resolves its own target
  });

  it("the Warren mouth still resolves the MAIN dungeon (the second target never leaks)", () => {
    // clear the mouth guard, then descend through the mouth — the main dungeon must build.
    Field.mouthCleared["greenvale"] = true;
    Field.chunks.clear(); Field.authoredGrids["greenvale"] = buildAuthoredGrid("greenvale", true);
    stepOnto(L.mouth);
    expect(Field.mode).toBe("dungeon");
    expect(Field.activeDungeon).toBe("main");
    expect(Field.dungeonDef().name).toBe(GV.dungeon.name);
    expect(Field.dungeonKeyZone()).toBe("greenvale");     // legacy save keys unchanged
  });
});
