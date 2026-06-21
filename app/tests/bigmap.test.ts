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
  OVERWORLD_ID, AURELION_ID, inAnyContinent, realizeKindWorld,
  unreachableContinentTargets, builtZonesOf, zonePolygonOf, polyCentroid,
} from "../src/data/world";
import { ZONES } from "../src/data/zones";

const GV = "greenvale";
const layout = ZONES.find((z) => z.id === GV)!.layout;

/** Build the continent's authored-grid map exactly as field.ts enterBigMap does (every built core). */
function continentGrids(): Record<string, string[][]> {
  const grids: Record<string, string[][]> = {};
  for (const z of builtZonesOf(AURELION_ID)) if (placementOf(z.zone!)) grids[z.zone!] = buildAuthoredGrid(z.zone!, true);
  return grids;
}

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

// ── Stage 2C: CONTINENT-WIDE realization + reachability (the G22 correction) ──────────────────────
// G22: the whole continent interior is walkable procedural open ground; built cores are dense islands
// in it; only OCEAN / off-continent / the world edge is impassable "uncharted". The proof is a
// continental roam Greenvale-spawn → Silverwood-core (the cores are ~136 tiles apart, bridged by open
// continent), not a shared-zone-seam crossing.
describe("continent-wide realization (Stage 2C, G22)", () => {
  it("open continent (inside any continent, outside every core) realizes to walkable open ground", () => {
    const grids = continentGrids();
    // a tile inside Aurelion but in NO built zone's authored core → "grass" (walkable open continent).
    let foundOpenContinent = false;
    for (let wy = 60; wy < 90 && !foundOpenContinent; wy++)
      for (let wx = 200; wx < 260 && !foundOpenContinent; wx++) // the gap between Greenvale & Silverwood cores
        if (inAnyContinent(OVERWORLD_ID, wx, wy) && !authoredAt(wx, wy)) {
          expect(realizeKindWorld(OVERWORLD_ID, grids, wx, wy)).toBe("grass");
          foundOpenContinent = true;
        }
    expect(foundOpenContinent).toBe(true);
  });

  it("ocean / off-continent / world edge is impassable uncharted", () => {
    const grids = continentGrids();
    // (0,0) and the far SE corner are open sea between continents → uncharted.
    expect(inAnyContinent(OVERWORLD_ID, 2, 2)).toBe(false);
    expect(realizeKindWorld(OVERWORLD_ID, grids, 2, 2)).toBe("uncharted");
    expect(realizeKindWorld(OVERWORLD_ID, grids, OVERWORLD_W - 2, OVERWORLD_H - 2)).toBe("uncharted");
  });

  it("every built core still realizes its authored tiles inside the continent world", () => {
    const grids = continentGrids();
    for (const z of builtZonesOf(AURELION_ID)) {
      const id = z.zone!, pl = placementOf(id);
      if (!pl) continue;
      const L = ZONES.find((zz) => zz.id === id)!.layout;
      const wx = pl.wx + L.spawn.x, wy = pl.wy + L.spawn.y;
      expect(authoredAt(wx, wy)).toMatchObject({ zoneId: id });
      expect(realizeKindWorld(OVERWORLD_ID, grids, wx, wy)).toBe(grids[id][L.spawn.y][L.spawn.x]);
    }
  });

  it("continent reachability: Greenvale spawn reaches Silverwood's + the Duskmarsh's cores across open land", () => {
    const grids = continentGrids();
    const gv = placementOf(GV)!;
    const spawnW = { x: gv.wx + layout.spawn.x, y: gv.wy + layout.spawn.y };
    const swCore = polyCentroid(zonePolygonOf("silverwood")!);
    const dmCore = polyCentroid(zonePolygonOf("duskmarsh")!);
    const targets = [
      { x: Math.round(swCore.x), y: Math.round(swCore.y) },
      { x: Math.round(dmCore.x), y: Math.round(dmCore.y) },
    ];
    const missing = unreachableContinentTargets(OVERWORLD_ID, grids, spawnW, targets);
    expect(missing).toEqual([]);
  });

  it("and from Greenvale's spawn every built zone's mouth/chests/lair are still reachable", () => {
    const grids = continentGrids();
    const gv = placementOf(GV)!;
    const spawnW = { x: gv.wx + layout.spawn.x, y: gv.wy + layout.spawn.y };
    // Greenvale's own authored features, plus Silverwood's mouth, all in world coords.
    const w = (id: string, p: { x: number; y: number }) => { const pl = placementOf(id)!; return { x: pl.wx + p.x, y: pl.wy + p.y }; };
    const swL = ZONES.find((z) => z.id === "silverwood")!.layout;
    const targets = [
      w(GV, layout.mouth), ...layout.chests.map((c) => w(GV, c)), w(GV, layout.lair!),
      w("silverwood", swL.mouth),
    ];
    expect(unreachableContinentTargets(OVERWORLD_ID, grids, spawnW, targets)).toEqual([]);
  });

  it("every built Aurelion zone's mouth is reachable from Greenvale's spawn across the open continent", () => {
    // The seamless soft-lock proof for ALL ten zones (not just by-construction): flood the realized
    // continent from Greenvale's spawn and confirm each built zone's authored dungeon/cave mouth — the
    // spine progression POI — is reachable across the open ground that bridges the cores (G22). We BFS
    // over a box covering ALL of Aurelion (not the tight spawn↔target bbox `unreachableContinentTargets`
    // uses — the W-coast path to Storm Coast hugs the coastline well outside that), matching how the game
    // lets the player roam the whole continent with no bound.
    const grids = continentGrids();
    const gv = placementOf(GV)!;
    const spawnW = { x: gv.wx + layout.spawn.x, y: gv.wy + layout.spawn.y };
    const mouths = builtZonesOf(AURELION_ID)
      .filter((z) => placementOf(z.zone!))
      .map((z) => {
        const pl = placementOf(z.zone!)!;
        const m = ZONES.find((zz) => zz.id === z.zone!)!.layout.mouth;
        return { key: z.zone!, x: pl.wx + m.x, y: pl.wy + m.y };
      });
    // flood the realized continent, bounded to a generous box around Aurelion (x 40..500, y 0..340).
    const WALLS = new Set(["tree", "water", "uncharted", "cliff", "river"]);
    const seen = new Set<string>(); const q = [spawnW]; seen.add(spawnW.x + "," + spawnW.y);
    while (q.length) {
      const p = q.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = p.x + dx, ny = p.y + dy, k = nx + "," + ny;
        if (nx < 40 || ny < 0 || nx > 500 || ny > 340 || seen.has(k)) continue;
        if (WALLS.has(realizeKindWorld(OVERWORLD_ID, grids, nx, ny))) continue;
        seen.add(k); q.push({ x: nx, y: ny });
      }
    }
    const unreachable = mouths.filter((m) => !seen.has(m.x + "," + m.y)).map((m) => m.key);
    expect(unreachable).toEqual([]);
  });

  it("continent realization is deterministic (realize a world tile twice → identical kind)", () => {
    const grids = continentGrids();
    for (const [x, y] of [[230, 72], [129, 74], [295, 71], [2, 2]] as const)
      expect(realizeKindWorld(OVERWORLD_ID, grids, x, y)).toBe(realizeKindWorld(OVERWORLD_ID, grids, x, y));
  });
});
