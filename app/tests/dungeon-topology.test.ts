// Tests for the pure dungeon-floor topology analyzer (systems/dungeonTopology). Exercises it against
// the REAL shipping dungeon content, so it doubles as the net that keeps the realizer honest with
// genDungeon: if a floor's authored layout ever soft-locks or a gate stops pinching, this goes red.

import { describe, it, expect } from "vitest";
import { ZONES, type DungeonLayout } from "../src/data/zones";
import { floorTopology, realizeFloor, renderTopology } from "../src/systems/dungeonTopology";

// Every dungeon floor across every zone, labelled like Field.dungeonFloors / the dungeon-map tool.
function allFloors(): { zone: string; fi: number; count: number; D: DungeonLayout }[] {
  const out: { zone: string; fi: number; count: number; D: DungeonLayout }[] = [];
  for (const z of ZONES) {
    const d = z.dungeon;
    const floors = d.floors && d.floors.length ? d.floors : [d.layout];
    floors.forEach((D, fi) => out.push({ zone: z.id, fi, count: floors.length, D }));
  }
  return out;
}

const FLOORS = allFloors();

describe("dungeon topology — realizer", () => {
  it("realizes a walkable entry, egress, and every chest for every floor", () => {
    for (const { D, fi, count } of FLOORS) {
      const isLast = fi === count - 1;
      const m = realizeFloor(D, isLast);
      expect(m[D.entry.y][D.entry.x]).not.toBe("tree"); // you can stand where you land
      const egress = isLast ? D.boss : D.stairsDown;
      if (egress) expect(m[egress.y][egress.x]).not.toBe("tree");
      for (const c of D.chests) expect(m[c.y][c.x]).not.toBe("tree");
    }
  });

  it("is pure/deterministic (same layout → identical topology)", () => {
    for (const { D, fi, count } of FLOORS.slice(0, 4)) {
      const a = floorTopology(D, { floorIndex: fi, floorCount: count });
      const b = floorTopology(D, { floorIndex: fi, floorCount: count });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });
});

describe("dungeon topology — invariants on shipping content", () => {
  it("NEVER soft-locks: entry, egress, and every feature reachable on every floor", () => {
    for (const { zone, fi, count, D } of FLOORS) {
      const t = floorTopology(D, { zone, floorIndex: fi, floorCount: count });
      expect(t.metrics.softLock.ok, `${zone} floor ${fi}: unreachable ${JSON.stringify(t.metrics.softLock.unreachable)}`).toBe(true);
      expect(t.metrics.egress.reachable, `${zone} floor ${fi}: egress unreachable`).toBe(true);
    }
  });

  it("every floor is a MESH, not a corridor (dungeon-design §2: loops ≥ 1, one component)", () => {
    for (const { zone, fi, count, D } of FLOORS) {
      const t = floorTopology(D, { zone, floorIndex: fi, floorCount: count });
      expect(t.metrics.components, `${zone} floor ${fi}`).toBe(1);
      expect(t.metrics.loops, `${zone} floor ${fi}: loops`).toBeGreaterThanOrEqual(1);
      expect(t.metrics.isMesh).toBe(true);
    }
  });
});

describe("dungeon topology — the Bandit Warren gate (multi-floor exemplar)", () => {
  const warren = ZONES.find((z) => z.id === "greenvale")!;
  const floors = warren.dungeon.floors!;

  it("B2's lieutenant gate truly PINCHES — walling it cuts off the stairs down + the vault", () => {
    const b2 = floorTopology(floors[1], { zone: "greenvale", floorIndex: 1, floorCount: floors.length });
    expect(b2.metrics.gate?.pinches).toBe(true);
    expect(b2.metrics.gate?.behind).toContain("stairsDown");
    expect(b2.metrics.gate?.behind).toContain("chest"); // the hidden vault
  });

  it("renderTopology emits a map + the rubric legend", () => {
    const b1 = floorTopology(floors[0], { zone: "greenvale", floorIndex: 0, floorCount: floors.length });
    const out = renderTopology(b1);
    expect(out).toContain("legend:");
    expect(out).toContain("room graph");
    expect(out.split("\n").length).toBeGreaterThan(b1.h); // the ASCII grid is in there
  });
});
