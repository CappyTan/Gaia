// World HIERARCHY registry tests (ADR 0009 — world-cartographer).
//
// Guards the Map › Continent › Zone › Area containment framework in data/world.ts: every painted
// region nests in its parent, no illegal same-level overlaps (a DEFINED priority where allowed),
// `regionAt` resolves sample points (inside each Area, and empty map space → no zone), and every
// painted Zone links a real `Zone` id in zones.ts. A broken hierarchy (an Area spilling out of its
// zone, a zone off its continent, a dangling zone link) MUST fail here.

import { describe, it, expect } from "vitest";
import {
  MAPS, CONTINENTS, ZONE_REGIONS, AREAS, OVERWORLD_ID, AURELION_ID,
  regionAt, areasOf, zonesOf, worldMap, type Bounds,
} from "../src/data/world";
import { ZONES, worldRect } from "../src/data/zones";

// b fully contains inner (inner's rect lies within b, inclusive of edges)?
const contains = (b: Bounds, inner: Bounds) =>
  inner.x >= b.x && inner.y >= b.y &&
  inner.x + inner.w <= b.x + b.w && inner.y + inner.h <= b.y + b.h;
// Two rects overlap with positive AREA (touching edges/corners is NOT an overlap)?
const overlaps = (a: Bounds, b: Bounds) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe("world hierarchy registry (ADR 0009)", () => {
  it("the overworld is one ~250×250 coordinate space", () => {
    const ow = worldMap(OVERWORLD_ID)!;
    expect(ow).toBeTruthy();
    expect(ow.kind).toBe("overworld");
    expect(ow.width).toBeGreaterThanOrEqual(250);
    expect(ow.height).toBeGreaterThanOrEqual(250);
  });

  it("every continent lies within its map", () => {
    for (const c of CONTINENTS) {
      const m = worldMap(c.map)!;
      expect(m, `continent "${c.id}" references a real map`).toBeTruthy();
      expect(contains({ x: 0, y: 0, w: m.width, h: m.height }, c.bounds),
        `continent "${c.id}" must lie within map "${c.map}"`).toBe(true);
    }
  });

  it("no two continents on the same map overlap", () => {
    for (let i = 0; i < CONTINENTS.length; i++)
      for (let j = i + 1; j < CONTINENTS.length; j++) {
        const a = CONTINENTS[i], b = CONTINENTS[j];
        if (a.map !== b.map) continue;
        expect(overlaps(a.bounds, b.bounds), `${a.id} and ${b.id} must not overlap`).toBe(false);
      }
  });

  it("every zone references a real Zone def AND nests within its continent's bounds", () => {
    const zoneIds = new Set(ZONES.map((z) => z.id));
    const continentIds = new Set(CONTINENTS.map((c) => c.id));
    for (const z of ZONE_REGIONS) {
      expect(zoneIds.has(z.id), `painted zone "${z.id}" must link a real ZONES entry`).toBe(true);
      expect(continentIds.has(z.continent), `zone "${z.id}" must have a real parent continent`).toBe(true);
      const c = CONTINENTS.find((cc) => cc.id === z.continent)!;
      expect(contains(c.bounds, z.bounds), `zone "${z.id}" must nest within continent "${z.continent}"`).toBe(true);
    }
  });

  it("each zone's hierarchy bounds equal its Stage-1 world placement (single source of truth)", () => {
    // The flat region graph (zones.ts) and this nested hierarchy must express the SAME coordinates.
    for (const z of ZONE_REGIONS) {
      const r = worldRect(z.id)!;
      expect(z.bounds).toEqual({ x: r.x0, y: r.y0, w: r.x1 - r.x0, h: r.y1 - r.y0 });
    }
  });

  it("no two zones on the same continent overlap", () => {
    for (let i = 0; i < ZONE_REGIONS.length; i++)
      for (let j = i + 1; j < ZONE_REGIONS.length; j++) {
        const a = ZONE_REGIONS[i], b = ZONE_REGIONS[j];
        if (a.continent !== b.continent) continue;
        expect(overlaps(a.bounds, b.bounds), `${a.id} and ${b.id} must not overlap`).toBe(false);
      }
  });

  it("every area nests within its parent zone's bounds and links a real zone", () => {
    const zoneIds = new Set(ZONE_REGIONS.map((z) => z.id));
    for (const a of AREAS) {
      expect(zoneIds.has(a.zone), `area "${a.id}" must have a real parent zone`).toBe(true);
      const z = ZONE_REGIONS.find((zz) => zz.id === a.zone)!;
      expect(contains(z.bounds, a.bounds), `area "${a.id}" must nest within zone "${a.zone}"`).toBe(true);
    }
  });

  it("area ids are unique", () => {
    const ids = AREAS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("overlapping areas in the same zone resolve by a DEFINED priority (finest/smallest wins)", () => {
    // Areas MAY overlap (a special pocket painted over a broad section); the contract is that the
    // smaller-area region wins the overlap, so the resolution is deterministic, not ambiguous.
    for (const z of ZONE_REGIONS) {
      const as = areasOf(z.id);
      for (let i = 0; i < as.length; i++)
        for (let j = i + 1; j < as.length; j++) {
          if (!overlaps(as[i].bounds, as[j].bounds)) continue;
          // sizes must differ so "smallest wins" is unambiguous
          const si = as[i].bounds.w * as[i].bounds.h, sj = as[j].bounds.w * as[j].bounds.h;
          expect(si, `overlapping areas ${as[i].id}/${as[j].id} need distinct sizes for priority`).not.toBe(sj);
        }
    }
  });

  it("regionAt resolves a sample of points: inside each area, inside each zone, and empty space", () => {
    // Inside every Area's center → that area (and its zone + continent).
    for (const a of AREAS) {
      const cx = a.bounds.x + Math.floor(a.bounds.w / 2);
      const cy = a.bounds.y + Math.floor(a.bounds.h / 2);
      const res = regionAt(OVERWORLD_ID, cx, cy);
      expect(res.continent?.id, `${a.id} center should be in a continent`).toBe(AURELION_ID);
      expect(res.zone?.id, `${a.id} center should be in zone ${a.zone}`).toBe(a.zone);
      // the resolved area is the finest containing a.center — which is a itself or a SMALLER overlap
      expect(res.area, `${a.id} center should resolve to some area`).toBeTruthy();
      const resolved = AREAS.find((x) => x.id === res.area!.id)!;
      const cont = resolved.bounds.x <= cx && cx < resolved.bounds.x + resolved.bounds.w &&
                   resolved.bounds.y <= cy && cy < resolved.bounds.y + resolved.bounds.h;
      expect(cont, `${a.id} center must lie inside the resolved area`).toBe(true);
    }

    // A point inside Greenvale but outside any Area → zone hit, no area (falls back to the zone).
    // Greenvale origin (0,0); pick a far corner tile inside the zone rect but outside every Area.
    const gv = worldRect("greenvale")!;
    const corner = regionAt(OVERWORLD_ID, gv.x1 - 1, gv.y1 - 1);
    expect(corner.zone?.id).toBe("greenvale");
    expect(corner.area).toBeUndefined();

    // Empty map space (inside the continent box but outside every zone) → continent only, no zone.
    const c = CONTINENTS.find((cc) => cc.id === AURELION_ID)!;
    const empty = regionAt(OVERWORLD_ID, c.bounds.x + c.bounds.w - 1, c.bounds.y + c.bounds.h - 1);
    expect(empty.continent?.id).toBe(AURELION_ID);
    expect(empty.zone).toBeUndefined();
    expect(empty.area).toBeUndefined();

    // Wholly off the painted continent → nothing.
    const off = regionAt(OVERWORLD_ID, MAPS[0].width - 1, MAPS[0].height - 1);
    expect(off.continent).toBeUndefined();
    expect(off.zone).toBeUndefined();

    // A wrong/empty map id resolves to nothing (the underworld has no painted regions yet).
    expect(regionAt("underworld", 10, 10)).toEqual({});
    expect(regionAt("nope", 10, 10)).toEqual({});
  });

  it("areasOf / zonesOf are consistent with the registry", () => {
    expect(zonesOf(AURELION_ID).map((z) => z.id).sort())
      .toEqual(["duskmarsh", "greenvale", "silverwood"]);
    for (const z of ZONE_REGIONS)
      for (const a of areasOf(z.id)) expect(a.zone).toBe(z.id);
    // every painted zone has at least one skeleton area
    for (const z of ZONE_REGIONS) expect(areasOf(z.id).length).toBeGreaterThan(0);
  });
});
