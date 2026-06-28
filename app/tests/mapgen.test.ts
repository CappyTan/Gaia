// Procedural map-gen (systems/mapgen) — the pure grid builders the field controller wires onto its run
// state. Seeded rng = deterministic; the flood-based reachability invariant must hold for every feature.

import { describe, it, expect } from "vitest";
import { genCombined, genOverworld, genDungeon, flood, FIELD_WALLS, type ClearedState } from "../src/systems/mapgen";
import { ZONES } from "../src/data/zones";
import type { Pt } from "../src/data/zones";
import { seeded } from "../src/core/rng";

// A "nothing cleared yet" state (fresh run) — every chest sealed, no mouth/floor-mini beaten.
const fresh = (over: Partial<ClearedState> = {}): ClearedState => ({
  poiSpent: () => false,
  chestOpened: () => false,
  miniCleared: false,
  floorMiniBeaten: false,
  restSpent: () => false,
  ...over,
});

const greenvale = ZONES.find((z) => z.id === "greenvale")!;       // new-model: genOverworld + genDungeon
const legacy = ZONES.find((z) => z.id === "duskmarsh") ?? ZONES[2]; // legacy combined-grid zone

// Are all the targets reachable from spawn over the carved grid? (the anti-soft-lock guarantee).
function allReachable(map: string[][], W: number, H: number, spawn: Pt, targets: Pt[]): boolean {
  const seen = flood({ map, W, H }, spawn);
  return targets.every((t) => !!seen[t.y]?.[t.x]);
}

describe("mapgen — determinism", () => {
  it("same seed → byte-identical overworld grid", () => {
    const a = genOverworld(greenvale, fresh(), seeded(7));
    const b = genOverworld(greenvale, fresh(), seeded(7));
    expect(a.map).toEqual(b.map);
    expect(a.spawn).toEqual(b.spawn);
    expect(a.mouth).toEqual(b.mouth);
  });

  it("same seed → byte-identical dungeon floor", () => {
    const D = greenvale.dungeon.layout;
    const a = genDungeon(D, true, fresh(), seeded(11));
    const b = genDungeon(D, true, fresh(), seeded(11));
    expect(a.map).toEqual(b.map);
  });

  it("same seed → byte-identical legacy combined grid", () => {
    const a = genCombined(legacy.layout, legacy.dungeon.layout, fresh(), seeded(3));
    const b = genCombined(legacy.layout, legacy.dungeon.layout, fresh(), seeded(3));
    expect(a.map).toEqual(b.map);
  });

  it("different seeds may differ only in cosmetic scatter (dimensions + anchors stable)", () => {
    const a = genOverworld(greenvale, fresh(), seeded(1));
    const b = genOverworld(greenvale, fresh(), seeded(99));
    expect([a.W, a.H]).toEqual([b.W, b.H]);
    expect(a.mouth).toEqual(b.mouth);
    expect(a.chests).toEqual(b.chests);
  });
});

describe("mapgen — reachability invariant (anti-soft-lock)", () => {
  it("overworld: mouth + every chest/lair/POI reachable from spawn", () => {
    const r = genOverworld(greenvale, fresh(), seeded(5));
    const targets: Pt[] = [r.mouth!, ...r.chests, ...r.pois.map((p) => ({ x: p.x, y: p.y }))];
    if (r.lairAt) targets.push(r.lairAt);
    expect(allReachable(r.map, r.W, r.H, r.spawn, targets)).toBe(true);
  });

  it("dungeon finale floor: boss + every chest reachable from entry", () => {
    const D = greenvale.dungeon.layout;
    const r = genDungeon(D, true, fresh(), seeded(8));
    expect(allReachable(r.map, r.W, r.H, r.spawn, [r.boss, ...r.chests])).toBe(true);
  });

  it("legacy combined: boss + every chest reachable from spawn", () => {
    const r = genCombined(legacy.layout, legacy.dungeon.layout, fresh(), seeded(2));
    expect(allReachable(r.map, r.W, r.H, r.spawn, [r.boss, ...r.chests])).toBe(true);
  });
});

describe("mapgen — cleared-state drives the tiles", () => {
  it("a beaten mouth guard carves the mouth as walkable 'mouth', not 'miniboss'", () => {
    const guarded = genOverworld(greenvale, fresh({ miniCleared: false }), seeded(4));
    const open = genOverworld(greenvale, fresh({ miniCleared: true }), seeded(4));
    expect(guarded.map[guarded.mouth!.y][guarded.mouth!.x]).toBe("miniboss");
    expect(open.map[open.mouth!.y][open.mouth!.x]).toBe("mouth");
  });

  it("an opened overworld chest reverts to walkable path (no re-spawn on regen)", () => {
    const c0 = greenvale.layout.chests[0];
    if (!c0) return; // greenvale always has overworld chests, but guard anyway
    const sealed = genOverworld(greenvale, fresh(), seeded(6));
    const looted = genOverworld(greenvale, fresh({ chestOpened: (c) => c.x === c0.x && c.y === c0.y }), seeded(6));
    expect(sealed.map[c0.y][c0.x]).toBe("chest");
    expect(looted.map[c0.y][c0.x]).not.toBe("chest");
    expect(FIELD_WALLS.has(looted.map[c0.y][c0.x])).toBe(false); // walkable
  });
});
