// World HIERARCHY registry tests (ADR 0009 — world-cartographer).
//
// Guards the Map › Continent › Zone › Area containment framework in data/world.ts, now ORGANIC
// POLYGONS (Dara's directive: shapes feel like real geography, no rectangles). Every painted region's
// polygon nests in its parent, no degenerate/self-undefined polygons, overlapping areas resolve by a
// DEFINED priority (finest/smallest wins), `regionAt` (point-in-polygon) resolves sample points
// (inside each Area, zone-only fallback, empty continent space, off-continent), and every BUILT zone
// links a real `Zone` id in zones.ts. A broken hierarchy (an area spilling out of its zone, a zone
// off its continent, a dangling link, a degenerate shape) MUST fail here.

import { describe, it, expect } from "vitest";
import {
  MAPS, CONTINENTS, ZONE_REGIONS, AREAS, OVERWORLD_ID, OVERWORLD_W, OVERWORLD_H,
  AURELION_ID, VARKHAZ_ID, MYRTHALAS_ID, SUNDERING_ID,
  regionAt, areasOf, zonesOf, builtZonesOf, worldMap, pointInPolygon, polyArea2, bbox,
  type Polygon,
} from "../src/data/world";
import { ZONES } from "../src/data/zones";

// Does polygon `outer` fully contain polygon `inner`? Sampled robustly: every inner VERTEX is inside
// outer, AND a dense grid of points over inner's bbox that fall inside inner also fall inside outer.
// (Vertices alone can pass for concave outers; the grid catches an inner edge bowing outside.)
const polyContains = (outer: Polygon, inner: Polygon): boolean => {
  for (const p of inner) if (!pointInPolygon(outer, p.x, p.y)) return false;
  const b = bbox(inner);
  const N = 24;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++) {
      const x = b.minX + ((b.maxX - b.minX) * i) / N;
      const y = b.minY + ((b.maxY - b.minY) * j) / N;
      if (pointInPolygon(inner, x, y) && !pointInPolygon(outer, x, y)) return false;
    }
  return true;
};
// Do two polygons overlap with positive area? Sampled over the union bbox.
const polyOverlap = (a: Polygon, b: Polygon): boolean => {
  const ba = bbox(a), bb = bbox(b);
  const minX = Math.max(ba.minX, bb.minX), maxX = Math.min(ba.maxX, bb.maxX);
  const minY = Math.max(ba.minY, bb.minY), maxY = Math.min(ba.maxY, bb.maxY);
  if (minX >= maxX || minY >= maxY) return false;
  const N = 60;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++) {
      const x = minX + ((maxX - minX) * i) / N, y = minY + ((maxY - minY) * j) / N;
      if (pointInPolygon(a, x, y) && pointInPolygon(b, x, y)) return true;
    }
  return false;
};
const centroid = (p: Polygon) => ({
  x: p.reduce((s, q) => s + q.x, 0) / p.length,
  y: p.reduce((s, q) => s + q.y, 0) / p.length,
});

describe("world hierarchy registry (ADR 0009, organic polygons)", () => {
  it("the overworld is ONE non-square 3:2 coordinate space sized to the canon map", () => {
    const ow = worldMap(OVERWORLD_ID)!;
    expect(ow).toBeTruthy();
    expect(ow.kind).toBe("overworld");
    // Sized to the 1536×1024 (3:2) canon map; NOT square, NOT 250×250.
    expect(ow.width).toBe(OVERWORLD_W);
    expect(ow.height).toBe(OVERWORLD_H);
    expect(ow.width).not.toBe(ow.height);
    expect(ow.width / ow.height).toBeCloseTo(1.5, 2); // 3:2
    // Big enough that every region has real play-space (a built zone ≈ 60 tiles across).
    expect(ow.width).toBeGreaterThanOrEqual(800);
  });

  it("all four canon continents are painted in their map quadrants", () => {
    const ids = CONTINENTS.filter((c) => c.map === OVERWORLD_ID).map((c) => c.id).sort();
    expect(ids).toEqual([AURELION_ID, MYRTHALAS_ID, SUNDERING_ID, VARKHAZ_ID].sort());
    const cen = (id: string) => centroid(CONTINENTS.find((c) => c.id === id)!.shape);
    const a = cen(AURELION_ID), v = cen(VARKHAZ_ID), m = cen(MYRTHALAS_ID), s = cen(SUNDERING_ID);
    const midX = OVERWORLD_W / 2, midY = OVERWORLD_H / 2;
    // Aurelion NW, Varkhaz NE, Myr'Thalas SW, the Sundering S/SE.
    expect(a.x, "Aurelion is in the west").toBeLessThan(midX);
    expect(a.y, "Aurelion is in the north").toBeLessThan(midY);
    expect(v.x, "Varkhaz is in the east").toBeGreaterThan(midX);
    expect(v.y, "Varkhaz is in the north").toBeLessThan(midY);
    expect(m.x, "Myr'Thalas is in the west").toBeLessThan(midX);
    expect(m.y, "Myr'Thalas is in the south").toBeGreaterThan(midY);
    expect(s.y, "the Sundering is in the south").toBeGreaterThan(midY);
    expect(s.x, "the Sundering is east of Myr'Thalas").toBeGreaterThan(m.x);
  });

  it("no two continents overlap (each is its own landmass across the central sea)", () => {
    for (let i = 0; i < CONTINENTS.length; i++)
      for (let j = i + 1; j < CONTINENTS.length; j++)
        expect(polyOverlap(CONTINENTS[i].shape, CONTINENTS[j].shape),
          `${CONTINENTS[i].id} and ${CONTINENTS[j].id} must not overlap`).toBe(false);
  });

  it("all 25 canon regions are painted, distributed across the four continents", () => {
    expect(ZONE_REGIONS.length).toBe(26); // 25 map regions + the off-map Duskmarsh (Dara's ruling)
    expect(zonesOf(AURELION_ID).length).toBe(10);   // #1–9 + Duskmarsh
    expect(zonesOf(VARKHAZ_ID).length).toBe(6);     // #10–15
    expect(zonesOf(MYRTHALAS_ID).length).toBe(5);   // #16–20
    expect(zonesOf(SUNDERING_ID).length).toBe(5);   // #21–25
  });

  it("no polygon is degenerate (>=3 vertices, positive area, no self-coincident points)", () => {
    const all: { id: string; shape: Polygon }[] = [
      ...CONTINENTS.map((c) => ({ id: c.id, shape: c.shape })),
      ...ZONE_REGIONS.map((z) => ({ id: z.id, shape: z.shape })),
      ...AREAS.map((a) => ({ id: a.id, shape: a.shape })),
    ];
    for (const { id, shape } of all) {
      expect(shape.length, `${id} needs >=3 vertices`).toBeGreaterThanOrEqual(3);
      expect(polyArea2(shape), `${id} must have positive area (not collinear/self-undefined)`).toBeGreaterThan(0);
      // no two consecutive (or duplicate) vertices coincide
      for (let i = 0; i < shape.length; i++)
        for (let j = i + 1; j < shape.length; j++)
          expect(shape[i].x === shape[j].x && shape[i].y === shape[j].y,
            `${id} has a duplicate vertex (${shape[i].x},${shape[i].y})`).toBe(false);
    }
  });

  it("every continent lies within its map", () => {
    for (const c of CONTINENTS) {
      const m = worldMap(c.map)!;
      expect(m, `continent "${c.id}" references a real map`).toBeTruthy();
      const b = bbox(c.shape);
      expect(b.minX >= 0 && b.minY >= 0 && b.maxX <= m.width && b.maxY <= m.height,
        `continent "${c.id}" must lie within map "${c.map}"`).toBe(true);
    }
  });

  it("every BUILT zone references a real Zone def; every region nests within its continent", () => {
    const zoneIds = new Set(ZONES.map((z) => z.id));
    const continentIds = new Set(CONTINENTS.map((c) => c.id));
    for (const z of ZONE_REGIONS) {
      expect(continentIds.has(z.continent), `zone "${z.id}" must have a real parent continent`).toBe(true);
      if (z.zone) expect(zoneIds.has(z.zone), `built zone "${z.id}" must link a real ZONES entry`).toBe(true);
      else expect(z.draft, `backlog zone "${z.id}" must be marked draft`).toBe(true);
      const c = CONTINENTS.find((cc) => cc.id === z.continent)!;
      expect(polyContains(c.shape, z.shape), `zone "${z.id}" must nest within continent "${z.continent}"`).toBe(true);
    }
  });

  it("the built zones roughly occupy their map-correct positions (drift-correction guard)", () => {
    // Realigned to Dara's overworld map: Greenvale NW, Silverwood EAST of it (similar latitude),
    // Duskmarsh in the SW-of-Greenvale wet basin. Guard the relative orientation so it can't re-drift.
    const cen = (id: string) => centroid(ZONE_REGIONS.find((z) => z.id === id)!.shape);
    const gv = cen("greenvale"), sw = cen("silverwood"), dm = cen("duskmarsh");
    expect(sw.x, "Silverwood is EAST of Greenvale").toBeGreaterThan(gv.x);
    expect(Math.abs(sw.y - gv.y), "Silverwood ~ same latitude as Greenvale").toBeLessThan(20);
    expect(dm.y, "Duskmarsh is SOUTH of Greenvale").toBeGreaterThan(gv.y);
    expect(dm.x, "Duskmarsh sits in the west").toBeLessThan(sw.x);
  });

  it("zone ids are unique", () => {
    const ids = ZONE_REGIONS.map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no two zones on the same continent overlap", () => {
    for (let i = 0; i < ZONE_REGIONS.length; i++)
      for (let j = i + 1; j < ZONE_REGIONS.length; j++) {
        const a = ZONE_REGIONS[i], b = ZONE_REGIONS[j];
        if (a.continent !== b.continent) continue;
        expect(polyOverlap(a.shape, b.shape), `${a.id} and ${b.id} must not overlap`).toBe(false);
      }
  });

  it("every area nests within its parent zone's polygon and links a real built zone", () => {
    const builtIds = new Set(ZONE_REGIONS.filter((z) => z.zone).map((z) => z.id));
    for (const a of AREAS) {
      expect(builtIds.has(a.zone), `area "${a.id}" must have a real built parent zone`).toBe(true);
      const z = ZONE_REGIONS.find((zz) => zz.id === a.zone)!;
      expect(polyContains(z.shape, a.shape), `area "${a.id}" must nest within zone "${a.zone}"`).toBe(true);
    }
  });

  it("area ids are unique", () => {
    const ids = AREAS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("overlapping areas in the same zone resolve by a DEFINED priority (finest/smallest wins)", () => {
    for (const z of ZONE_REGIONS) {
      const as = areasOf(z.id);
      for (let i = 0; i < as.length; i++)
        for (let j = i + 1; j < as.length; j++) {
          if (!polyOverlap(as[i].shape, as[j].shape)) continue;
          const si = polyArea2(as[i].shape), sj = polyArea2(as[j].shape);
          expect(si, `overlapping areas ${as[i].id}/${as[j].id} need distinct sizes for priority`).not.toBe(sj);
        }
    }
  });

  it("regionAt resolves a sample of points: inside each area, zone-only fallback, empty, off-map", () => {
    // Inside every Area's centroid → that area (and its zone + continent). Finest (smallest) wins, so
    // the resolved area must contain the centroid (it's `a`, or a smaller area overlapping it).
    for (const a of AREAS) {
      const c = centroid(a.shape);
      const res = regionAt(OVERWORLD_ID, c.x, c.y);
      expect(res.continent?.id, `${a.id} centroid should be in a continent`).toBe(AURELION_ID);
      expect(res.zone?.id, `${a.id} centroid should be in zone ${a.zone}`).toBe(a.zone);
      expect(res.area, `${a.id} centroid should resolve to some area`).toBeTruthy();
      const resolved = AREAS.find((x) => x.id === res.area!.id)!;
      expect(pointInPolygon(resolved.shape, c.x, c.y), `${a.id} centroid must lie in the resolved area`).toBe(true);
    }

    // A point inside Greenvale but outside any Area → zone hit, no area (falls back to the zone).
    // (156,76) was verified to be in the Greenvale polygon but in none of its area sub-shapes.
    const fallback = regionAt(OVERWORLD_ID, 156, 76);
    expect(fallback.zone?.id, "Greenvale fallback point should resolve to the zone").toBe("greenvale");
    expect(fallback.area, "Greenvale fallback point should have no finer area").toBeUndefined();

    // Empty continent space (inside the coastline but outside every zone) → continent only.
    // (230,150) is mid-Aurelion, between Goldmeadow/Riverhearth/Duskmarsh, inside no painted region.
    const empty = regionAt(OVERWORLD_ID, 230, 150);
    expect(empty.continent?.id).toBe(AURELION_ID);
    expect(empty.zone, "empty continent space has no zone").toBeUndefined();
    expect(empty.area).toBeUndefined();

    // One sample resolves into EACH of the four continents (a region or empty space, but right land).
    expect(regionAt(OVERWORLD_ID, 690, 170).continent?.id, "Varkhaz sample").toBe(VARKHAZ_ID);
    expect(regionAt(OVERWORLD_ID, 220, 420).continent?.id, "Myr'Thalas sample").toBe(MYRTHALAS_ID);
    expect(regionAt(OVERWORLD_ID, 560, 470).continent?.id, "Sundering sample").toBe(SUNDERING_ID);

    // The central Great Expanse (between the continents) is OCEAN → no continent.
    const sea = regionAt(OVERWORLD_ID, 480, 200);
    expect(sea.continent, "the Great Expanse is open ocean").toBeUndefined();

    // Wholly off any continent (deep ocean corner) → nothing.
    const off = regionAt(OVERWORLD_ID, MAPS[0].width - 1, MAPS[0].height - 1);
    expect(off.continent).toBeUndefined();
    expect(off.zone).toBeUndefined();

    // A wrong/empty map id resolves to nothing (the underworld has no painted regions yet).
    expect(regionAt("underworld", 10, 10)).toEqual({});
    expect(regionAt("nope", 10, 10)).toEqual({});
  });

  it("areasOf / zonesOf / builtZonesOf are consistent with the registry", () => {
    // All 10 Aurelion regions (3 built + 7 backlog) are painted; the built ones live here.
    expect(zonesOf(AURELION_ID).length).toBe(10);
    expect(builtZonesOf(AURELION_ID).map((z) => z.id).sort())
      .toEqual(["duskmarsh", "greenvale", "silverwood"]);
    // The other three continents are all backlog (no built zones yet).
    for (const id of [VARKHAZ_ID, MYRTHALAS_ID, SUNDERING_ID])
      expect(builtZonesOf(id).length, `${id} has no built zones yet`).toBe(0);
    for (const z of ZONE_REGIONS)
      for (const a of areasOf(z.id)) expect(a.zone).toBe(z.id);
    // every BUILT zone has at least one skeleton area; backlog regions have none yet
    for (const z of builtZonesOf(AURELION_ID)) expect(areasOf(z.id).length).toBeGreaterThan(0);
  });
});
