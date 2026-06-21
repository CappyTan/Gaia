// Placement-bridge tests (seamless big-map, Stage 2A — docs/design/seamless-overworld-plan.md).
//
// Guards the PURE DATA bridge that drops each built zone's AUTHORED grid (data/zones.ts ZoneLayout)
// into the one 960×640 world coordinate space (data/world.ts ZONE_REGIONS polygons), at scale 1:1,
// CENTERED on the zone polygon's centroid. No engine consumer yet — this only proves the placement
// math is sound so Stage 2B's renderer can trust it. The crux to verify:
//   • the placement table matches the principled centering (round(centroid − dims/2)) — no drift;
//   • each placement rect lies within its zone polygon's BBOX (the dense core fits in the sparser blob);
//   • placement rects don't overlap each other (so authoredAt's first-match == finest-match);
//   • authoredAt(worldDims) round-trips back to (zoneId, lx, ly) across each rect;
//   • each authored spawn/mouth/lair/chest, mapped to world coords, lands INSIDE the zone polygon
//     (the core sits sensibly in the geography).

import { describe, it, expect } from "vitest";
import {
  WORLD_PLACEMENT, placementOf, worldDimsOf, authoredAt, polyCentroid,
  ZONE_REGIONS, bbox, pointInPolygon, type Polygon,
} from "../src/data/world";
import { ZONES } from "../src/data/zones";

const BUILT = ["greenvale", "silverwood", "duskmarsh", "goldmeadow"] as const;

const layoutOf = (id: string) => ZONES.find((z) => z.id === id)!.layout;
const polyOf = (id: string): Polygon => ZONE_REGIONS.find((z) => z.id === id && z.zone)!.shape;

describe("placement bridge (Stage 2A)", () => {
  it("places exactly the built zones, each at scale 1", () => {
    expect(Object.keys(WORLD_PLACEMENT).sort()).toEqual([...BUILT].sort());
    for (const id of BUILT) {
      const p = placementOf(id)!;
      expect(p).toBeTruthy();
      expect(p.scale).toBe(1);
    }
    expect(placementOf("nowhere")).toBeUndefined();
    expect(worldDimsOf("nowhere")).toBeUndefined();
  });

  it("each placement centers the authored grid on the polygon's shoelace centroid", () => {
    for (const id of BUILT) {
      const lay = layoutOf(id);
      const c = polyCentroid(polyOf(id));
      const expected = { wx: Math.round(c.x - lay.w / 2), wy: Math.round(c.y - lay.h / 2) };
      expect(placementOf(id)).toMatchObject({ wx: expected.wx, wy: expected.wy, scale: 1 });
      // and the placed rect's CENTER is within ~1 tile of the centroid (rounding only).
      const d = worldDimsOf(id)!;
      expect(Math.abs((d.x0 + d.x1) / 2 - c.x)).toBeLessThanOrEqual(0.5);
      expect(Math.abs((d.y0 + d.y1) / 2 - c.y)).toBeLessThanOrEqual(0.5);
    }
  });

  it("worldDimsOf is the authored w×h placed at (wx,wy)", () => {
    for (const id of BUILT) {
      const p = placementOf(id)!;
      const lay = layoutOf(id);
      expect(worldDimsOf(id)).toEqual({ x0: p.wx, y0: p.wy, x1: p.wx + lay.w, y1: p.wy + lay.h });
    }
  });

  it("each placement rect lies within its zone polygon's bbox (dense core ⊂ organic blob)", () => {
    for (const id of BUILT) {
      const d = worldDimsOf(id)!;
      const b = bbox(polyOf(id));
      // the authored grid is SMALLER than the polygon bbox (a dense core inside a sparser shape)…
      expect(d.x1 - d.x0).toBeLessThan(b.maxX - b.minX);
      expect(d.y1 - d.y0).toBeLessThan(b.maxY - b.minY);
      // …and sits fully within it.
      expect(d.x0).toBeGreaterThanOrEqual(b.minX);
      expect(d.y0).toBeGreaterThanOrEqual(b.minY);
      expect(d.x1).toBeLessThanOrEqual(b.maxX);
      expect(d.y1).toBeLessThanOrEqual(b.maxY);
    }
  });

  it("placement rects don't overlap each other", () => {
    for (let i = 0; i < BUILT.length; i++)
      for (let j = i + 1; j < BUILT.length; j++) {
        const a = worldDimsOf(BUILT[i])!, b = worldDimsOf(BUILT[j])!;
        const overlap = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
        expect(overlap).toBe(false);
      }
  });

  it("authoredAt round-trips world coords back to (zoneId, lx, ly) across each rect", () => {
    for (const id of BUILT) {
      const p = placementOf(id)!;
      const lay = layoutOf(id);
      // sample the four corners + the center of the authored grid
      const samples: [number, number][] = [
        [0, 0], [lay.w - 1, 0], [0, lay.h - 1], [lay.w - 1, lay.h - 1],
        [Math.floor(lay.w / 2), Math.floor(lay.h / 2)],
      ];
      for (const [lx, ly] of samples) {
        const hit = authoredAt(p.wx + lx, p.wy + ly);
        expect(hit).toEqual({ zoneId: id, lx, ly });
      }
    }
    // just OUTSIDE a rect (east edge is half-open) → no authored tile here
    const d = worldDimsOf("greenvale")!;
    expect(authoredAt(d.x1, d.y0)).toBeUndefined();
    expect(authoredAt(d.x0 - 1, d.y0)).toBeUndefined();
    // far from any placed core
    expect(authoredAt(900, 600)).toBeUndefined();
  });

  it("authored spawn/mouth/lair/chests land inside the zone polygon when placed", () => {
    for (const id of BUILT) {
      const p = placementOf(id)!;
      const lay = layoutOf(id);
      const poly = polyOf(id);
      const feats: { name: string; pt: { x: number; y: number } }[] = [
        { name: "spawn", pt: lay.spawn },
        { name: "mouth", pt: lay.mouth },
        ...(lay.lair ? [{ name: "lair", pt: lay.lair }] : []),
        ...lay.chests.map((c, i) => ({ name: `chest${i}`, pt: c })),
      ];
      for (const f of feats) {
        const wx = p.wx + f.pt.x, wy = p.wy + f.pt.y;
        expect(pointInPolygon(poly, wx, wy), `${id}.${f.name} world(${wx},${wy}) inside polygon`).toBe(true);
      }
    }
  });
});
