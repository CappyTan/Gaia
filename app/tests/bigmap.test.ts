// Seamless big-map realization tests (Stage 2B — docs/design/seamless-overworld-plan.md).
//
// Guards the PURE half of the chunk realizer (data/world.ts): the authored blueprint, the per-tile
// realization kind (the two-lookup model's realization axis), and world-space reachability. The
// controller (field.ts) owns the chunk cache + render; these functions are the deterministic data it
// streams, so they MUST be:
//   • DETERMINISTIC — realize the same chunk twice → identical cells (no Math.random; the renderer
//     re-realizes evicted chunks and must not flicker);
//   • ANTI-SOFT-LOCK — across the PLACED world (authored core + procedural open fill, uncharted as the
//     impassable soft edge), Greenvale's spawn reaches the mouth + every chest + Hogger's lair.

import { describe, it, expect } from "vitest";
import {
  buildAuthoredGrid, realizeKind, tileHash, unreachableWorldTargets,
  placementOf, authoredAt, inZonePolygon, OVERWORLD_W, OVERWORLD_H,
} from "../src/data/world";
import { ZONES } from "../src/data/zones";

const GV = "greenvale";
const layout = ZONES.find((z) => z.id === GV)!.layout;

// Realize a CHUNK exactly as field.ts realizeChunk does (the realization axis only — identity/dressing
// is regionAt-cached in the controller and is itself pure; here we pin the realization+hash determinism).
const CHUNK = 32, SHIFT = 5;
function realizeChunkKinds(zoneId: string, grid: string[][], cx: number, cy: number): string[][] {
  const x0 = cx << SHIFT, y0 = cy << SHIFT;
  const out: string[][] = [];
  for (let ly = 0; ly < CHUNK; ly++) {
    const row: string[] = [];
    for (let lx = 0; lx < CHUNK; lx++) row.push(realizeKind(zoneId, grid, x0 + lx, y0 + ly));
    out.push(row);
  }
  return out;
}

describe("big-map realization (Stage 2B)", () => {
  it("tileHash is deterministic and in [0,1)", () => {
    for (const [x, y] of [[0, 0], [127, 62], [959, 639], [-3, 5]] as const) {
      const a = tileHash(x, y), b = tileHash(x, y);
      expect(a).toBe(b);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThan(1);
    }
  });

  it("buildAuthoredGrid is deterministic (no Math.random) — two builds are byte-identical", () => {
    const g1 = buildAuthoredGrid(GV, false);
    const g2 = buildAuthoredGrid(GV, false);
    expect(g1).toEqual(g2);
    expect(g1.length).toBe(layout.h);
    expect(g1[0].length).toBe(layout.w);
    // the mouth tile reflects the mini-boss state argument.
    expect(buildAuthoredGrid(GV, false)[layout.mouth.y][layout.mouth.x]).toBe("miniboss");
    expect(buildAuthoredGrid(GV, true)[layout.mouth.y][layout.mouth.x]).toBe("mouth");
  });

  it("realize the same chunk twice → IDENTICAL cells (the determinism guarantee)", () => {
    const grid = buildAuthoredGrid(GV, true);
    const pl = placementOf(GV)!;
    const cx = (pl.wx + 10) >> SHIFT, cy = (pl.wy + 10) >> SHIFT; // a chunk overlapping the authored core
    const a = realizeChunkKinds(GV, grid, cx, cy);
    const b = realizeChunkKinds(GV, grid, cx, cy);
    expect(a).toEqual(b);
    // and a far chunk (procedural fill / uncharted edge) is just as stable.
    const fx = (pl.wx - 40) >> SHIFT, fy = (pl.wy - 40) >> SHIFT;
    expect(realizeChunkKinds(GV, grid, fx, fy)).toEqual(realizeChunkKinds(GV, grid, fx, fy));
  });

  it("the two-lookup realization axis: authored core, procedural open ground, then uncharted", () => {
    const grid = buildAuthoredGrid(GV, true);
    const pl = placementOf(GV)!;
    // a tile inside the authored placement rect realizes to its authored kind.
    const wSpawn = { x: pl.wx + layout.spawn.x, y: pl.wy + layout.spawn.y };
    expect(authoredAt(wSpawn.x, wSpawn.y)).toBeTruthy();
    expect(realizeKind(GV, grid, wSpawn.x, wSpawn.y)).toBe(grid[layout.spawn.y][layout.spawn.x]);
    // a far-away tile outside every polygon is uncharted (impassable soft edge).
    expect(realizeKind(GV, grid, 900, 600)).toBe("uncharted");
    // there EXISTS open-ground procedural fill: a polygon-interior tile outside the authored core.
    let foundOpen = false;
    for (let wy = 40; wy < 120 && !foundOpen; wy++)
      for (let wx = 100; wx < 220 && !foundOpen; wx++)
        if (!authoredAt(wx, wy) && inZonePolygon(GV, wx, wy)) {
          expect(realizeKind(GV, grid, wx, wy)).toBe("grass");
          foundOpen = true;
        }
    expect(foundOpen).toBe(true);
  });

  it("world-space reachability: spawn reaches the mouth + every chest + Hogger's lair (no soft-lock)", () => {
    const grid = buildAuthoredGrid(GV, true);
    const pl = placementOf(GV)!;
    const w = (p: { x: number; y: number }) => ({ x: pl.wx + p.x, y: pl.wy + p.y });
    const spawnW = w(layout.spawn);
    const targets = [w(layout.mouth), ...layout.chests.map(w), w(layout.lair!)];
    const missing = unreachableWorldTargets(GV, grid, spawnW, targets);
    expect(missing).toEqual([]);
  });

  it("uncharted is impassable but never walls off authored content (the core stays one component)", () => {
    // every authored walkable feature is reachable from spawn purely within the placed world.
    const grid = buildAuthoredGrid(GV, true);
    const pl = placementOf(GV)!;
    const w = (p: { x: number; y: number }) => ({ x: pl.wx + p.x, y: pl.wy + p.y });
    const targets = [w(layout.mouth), ...layout.chests.map(w), w(layout.lair!)];
    expect(unreachableWorldTargets(GV, grid, w(layout.spawn), targets)).toHaveLength(0);
    // sanity: the world frame the placement lives in is the canonical 960×640.
    expect(OVERWORLD_W).toBe(960);
    expect(OVERWORLD_H).toBe(640);
  });
});
