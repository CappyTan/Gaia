// DUNGEON ENTRABILITY — every cave/dungeon must be ENTERABLE, not just internally reachable. Guards the
// "you stand over the entrance but don't go in" class of bug (the per-zone mouth-flip soft-lock, bug-6):
// the topology analyzer checks a floor's INTERNAL reachability, but this checks the OVERWORLD→DUNGEON seam
// every built zone shares on the big map (buildAuthoredGrid): the mouth must be (a) reachable from spawn,
// (b) a `miniboss` GUARD you fight while the zone's mini stands, and (c) an enterable `mouth` once cleared
// (stepping onto which calls descend()). Plus the gate guard (zone.mini) must resolve to a real enemy —
// an unresolved mini = a fight that never starts = standing on the entrance forever.

import { describe, it, expect } from "vitest";
import { ZONES } from "../src/data/zones";
import { ENEMIES } from "../src/data/enemies";
import { buildAuthoredGrid, builtZonesOf, AURELION_ID } from "../src/data/world";

const REALIZE_WALLS = new Set(["tree", "water", "uncharted", "cliff", "river"]); // mirrors world.ts

/** Is the mouth reachable from spawn on the authored grid? (4-way flood over non-wall cells.) */
function mouthReachable(grid: string[][], spawn: { x: number; y: number }, mouth: { x: number; y: number }): boolean {
  const H = grid.length, W = grid[0]?.length ?? 0;
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !REALIZE_WALLS.has(grid[y][x]);
  const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
  const q = [spawn]; if (open(spawn.x, spawn.y)) seen[spawn.y][spawn.x] = true; else return false;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
    }
  }
  return !!seen[mouth.y]?.[mouth.x];
}

describe("dungeon entrability — every built zone's entrance is reachable AND enterable", () => {
  const built = builtZonesOf(AURELION_ID).map((r) => r.zone!).filter((id) => ZONES.some((z) => z.id === id));

  it("covers every built Aurelion zone (sanity: the set isn't empty)", () => {
    expect(built.length).toBeGreaterThanOrEqual(10);
  });

  for (const id of built) {
    const z = ZONES.find((zz) => zz.id === id)!;
    describe(`${z.name} → ${z.dungeon.name}`, () => {
      it("the gate-guard mini resolves to a real enemy (else the entrance fight never starts)", () => {
        expect(z.mini, `${id}.mini`).toBeTruthy();
        expect(ENEMIES[z.mini], `ENEMIES["${z.mini}"]`).toBeDefined();
        for (const a of z.miniAdds ?? []) expect(ENEMIES[a], `miniAdd "${a}"`).toBeDefined();
      });

      it("UNCLEARED: the mouth is a reachable `miniboss` guard (you can walk to it and fight)", () => {
        const grid = buildAuthoredGrid(id, false);
        const m = z.layout.mouth;
        expect(grid[m.y][m.x], `${id} mouth uncleared`).toBe("miniboss");
        expect(mouthReachable(grid, z.layout.spawn, m), `${id} mouth reachable from spawn`).toBe(true);
      });

      it("CLEARED: the mouth flips to an enterable `mouth` (stepping on it descends — not a dead tile)", () => {
        const grid = buildAuthoredGrid(id, true);
        const m = z.layout.mouth;
        expect(grid[m.y][m.x], `${id} mouth cleared`).toBe("mouth");
        expect(mouthReachable(grid, z.layout.spawn, m), `${id} mouth reachable from spawn`).toBe(true);
      });
    });
  }
});
