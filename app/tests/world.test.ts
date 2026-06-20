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
  UNDERWORLD_ID, FORGOTTEN_ID,
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
// Distance from (x,y) to a polygon's boundary (min over its edges). Used by the TOLERANT containment
// below — a TILING area's perimeter rides the zone's coastline (and overshoots it a hair so the rim is
// fully covered), so a strict "every vertex strictly inside" test is wrong for it; a vertex sitting ON
// or just past the shared coast is still "nested". EPS ~3 tiles ≈ the seam-blend band width.
const distToPoly = (poly: Polygon, x: number, y: number): number => {
  let m = Infinity;
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    const dx = b.x - a.x, dy = b.y - a.y;
    const L = dx * dx + dy * dy || 1;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / L;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    m = Math.min(m, Math.hypot(x - px, y - py));
  }
  return m;
};
// Tolerant containment for TILING areas: a point is "in zone" if inside the zone OR within EPS of its
// boundary (the shared coastline a tiling area must ride). Same vertex + dense-grid sampling as
// polyContains, but boundary-touching points pass.
const polyContainsTol = (outer: Polygon, inner: Polygon, eps = 3): boolean => {
  const inOrNear = (x: number, y: number) => pointInPolygon(outer, x, y) || distToPoly(outer, x, y) <= eps;
  for (const p of inner) if (!inOrNear(p.x, p.y)) return false;
  const b = bbox(inner);
  const N = 24;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++) {
      const x = b.minX + ((b.maxX - b.minX) * i) / N;
      const y = b.minY + ((b.maxY - b.minY) * j) / N;
      if (pointInPolygon(inner, x, y) && !inOrNear(x, y)) return false;
    }
  return true;
};
// What fraction of a zone's INTERIOR is covered by the union of `areas`? Dense grid over the zone bbox;
// counts only points inside the zone. 1.0 = the areas tile the zone with no gap.
const coverageOf = (zone: Polygon, areas: Polygon[]): number => {
  const b = bbox(zone);
  const N = 110;
  let inside = 0, covered = 0;
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++) {
      const x = b.minX + ((b.maxX - b.minX) * i) / N, y = b.minY + ((b.maxY - b.minY) * j) / N;
      if (!pointInPolygon(zone, x, y)) continue;
      inside++;
      if (areas.some((a) => pointInPolygon(a, x, y))) covered++;
    }
  return inside ? covered / inside : 0;
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

  it("no two continents on the SAME map overlap (each is its own landmass across the central sea)", () => {
    // Scoped per-map: the surface and underworld share the 960×640 coordinate space, so the
    // underworld cavern shell intentionally sits over the surface continents — different maps.
    for (let i = 0; i < CONTINENTS.length; i++)
      for (let j = i + 1; j < CONTINENTS.length; j++) {
        if (CONTINENTS[i].map !== CONTINENTS[j].map) continue;
        expect(polyOverlap(CONTINENTS[i].shape, CONTINENTS[j].shape),
          `${CONTINENTS[i].id} and ${CONTINENTS[j].id} must not overlap`).toBe(false);
      }
  });

  it("all 25 canon SURFACE regions are painted, distributed across the four continents", () => {
    const surfaceZones = ZONE_REGIONS.filter((z) => z.continent !== FORGOTTEN_ID);
    expect(surfaceZones.length).toBe(26); // 25 map regions + the off-map Duskmarsh (Dara's ruling)
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
      // TOLERANT: a TILING area rides (and overshoots a hair past) the zone's coastline, so its
      // perimeter touches the shared boundary — nesting is "inside OR on the zone's coast", not strict.
      expect(polyContainsTol(z.shape, a.shape), `area "${a.id}" must nest within zone "${a.zone}"`).toBe(true);
      // Its centroid is unambiguously inside the zone (a sanity anchor on the tolerant nest above).
      const c = centroid(a.shape);
      expect(pointInPolygon(z.shape, c.x, c.y), `area "${a.id}" centroid must sit inside zone "${a.zone}"`).toBe(true);
    }
  });

  it("each built zone's areas TILE the zone — they cover it (no gaps) and don't overlap", () => {
    // The refined Areas are an organic tiling of every built zone (world-cartographer, ADR 0009 §4):
    // together they cover the zone polygon so EVERY in-zone point resolves to an Area, and they don't
    // mutually overlap (each tile owns its ground; finest-wins priority is a safety net, not relied on).
    for (const z of builtZonesOf(AURELION_ID)) {
      const as = areasOf(z.id);
      expect(as.length, `built zone "${z.id}" should have ~4–6 areas`).toBeGreaterThanOrEqual(4);
      // Coverage: the union of areas covers the whole zone interior (allow a hair for grid sampling).
      const cov = coverageOf(z.shape, as.map((a) => a.shape));
      expect(cov, `areas of "${z.id}" should cover the zone (got ${(cov * 100).toFixed(1)}%)`).toBeGreaterThan(0.99);
      // Non-overlap: no two areas of the same zone share positive area (a clean tiling, not stacked).
      for (let i = 0; i < as.length; i++)
        for (let j = i + 1; j < as.length; j++)
          expect(polyOverlap(as[i].shape, as[j].shape),
            `areas "${as[i].id}" and "${as[j].id}" tile "${z.id}" and must not overlap`).toBe(false);
    }
  });

  it("every built zone's areas carry identity hints (biome/tileset/lean/music) and a dungeon-mouth area", () => {
    for (const z of builtZonesOf(AURELION_ID)) {
      const as = areasOf(z.id);
      for (const a of as) {
        for (const k of ["biome", "tileset", "encounterLean", "music"] as const)
          expect(a.identity[k], `area "${a.id}" needs an identity.${k}`).toBeTruthy();
      }
      // Exactly one area per zone is the dungeon-mouth approach (the level-designer puts the entrance
      // there); flagged by the "miniboss-gate" lean. It is the EAST lobe (mouth sits east in zones.ts).
      const mouths = as.filter((a) => a.identity.encounterLean === "miniboss-gate");
      expect(mouths.length, `zone "${z.id}" needs exactly one dungeon-mouth area`).toBe(1);
      const mouthCx = centroid(mouths[0].shape).x;
      const others = as.filter((a) => a !== mouths[0]);
      const avgOtherCx = others.reduce((s, a) => s + centroid(a.shape).x, 0) / others.length;
      expect(mouthCx, `dungeon-mouth area of "${z.id}" is the EAST lobe`).toBeGreaterThan(avgOtherCx);
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

    // The built zones are now fully TILED by their areas, so a point inside the zone ALWAYS resolves to
    // an area (no in-zone fallback). (156,76) — formerly a fallback gap — now lands in Greenvale's
    // Warren Approach. Spot-check the tiling invariant directly: this in-Greenvale point has both a zone
    // AND an area.
    const tiled = regionAt(OVERWORLD_ID, 156, 76);
    expect(tiled.zone?.id, "in-Greenvale point resolves to the zone").toBe("greenvale");
    expect(tiled.area, "tiled Greenvale point resolves to an area too").toBeTruthy();
    expect(tiled.area?.zone, "the resolved area belongs to Greenvale").toBe("greenvale");

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

    // The overworld lookups never bleed into the underworld map and vice versa: an underworld
    // corner (10,10) is outside the underworld cavern shell → nothing; a bad map id → nothing.
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

// ── The underworld — *The Forgotten Civilization* (atlas §2; rough fit pass) ──────────────────────
describe("underworld registry (The Forgotten Civilization — 13 complexes)", () => {
  const uwMap = () => worldMap(UNDERWORLD_ID)!;
  const uwContinents = () => CONTINENTS.filter((c) => c.map === UNDERWORLD_ID);
  const shell = () => uwContinents()[0].shape;
  const complexes = () => ZONE_REGIONS.filter((z) => z.continent === FORGOTTEN_ID);

  it("the underworld is its own 960×640 seamless coordinate space", () => {
    const m = uwMap();
    expect(m.kind).toBe("underworld");
    expect(m.width).toBe(OVERWORLD_W);
    expect(m.height).toBe(OVERWORLD_H);
  });

  it("the underworld is ONE continent — The Forgotten Civilization — within its map", () => {
    const cs = uwContinents();
    expect(cs.length).toBe(1);
    expect(cs[0].id).toBe(FORGOTTEN_ID);
    const m = uwMap();
    const b = bbox(cs[0].shape);
    expect(b.minX >= 0 && b.minY >= 0 && b.maxX <= m.width && b.maxY <= m.height,
      "the realm shell must lie within the underworld map").toBe(true);
  });

  it("all 13 canon complexes are painted as draft zone-regions of the realm", () => {
    const cx = complexes();
    expect(cx.length).toBe(13);
    for (const z of cx) {
      expect(z.draft, `${z.id} must be draft (nothing playable underground yet)`).toBe(true);
      expect(z.zone, `${z.id} must not link a built Zone yet`).toBeUndefined();
    }
    // The canon set (atlas §2 table).
    expect(cx.map((z) => z.id).sort()).toEqual([
      "uw-abyssal-conduit", "uw-anima-halls", "uw-aurelion-shafts", "uw-biosphere",
      "uw-celestial-archive", "uw-forge-cities", "uw-infinite-foundries", "uw-myrthalas-gateways",
      "uw-silent-vaults", "uw-titan-core", "uw-transit-nexus", "uw-varkhaz-mines", "uw-worldroot",
    ].sort());
  });

  it("every complex nests within the realm shell and none overlap", () => {
    const s = shell();
    const cx = complexes();
    for (const z of cx)
      expect(polyContains(s, z.shape), `${z.id} must nest within the realm shell`).toBe(true);
    for (let i = 0; i < cx.length; i++)
      for (let j = i + 1; j < cx.length; j++)
        expect(polyOverlap(cx[i].shape, cx[j].shape),
          `${cx[i].id} and ${cx[j].id} must not overlap`).toBe(false);
  });

  it("the realm reads coherently against the canon map — Worldroot is the central heart, the three named gateways sit in their surface quadrants", () => {
    const cen = (id: string) => centroid(complexes().find((z) => z.id === id)!.shape);
    const midX = OVERWORLD_W / 2, midY = OVERWORLD_H / 2;
    const root = cen("uw-worldroot");
    // Worldroot is the largest footprint (the heart) and sits in the upper-central band.
    const sizes = complexes().map((z) => polyArea2(z.shape));
    expect(polyArea2(complexes().find((z) => z.id === "uw-worldroot")!.shape),
      "Worldroot is the largest complex").toBe(Math.max(...sizes));
    expect(Math.abs(root.x - midX), "Worldroot is roughly central in x").toBeLessThan(140);
    expect(root.y, "Worldroot is in the upper band").toBeLessThan(midY);
    // Surface↔underworld alignment (atlas §2): the three named "under" complexes match the surface
    // quadrants — Aurelion Access Shafts NW, Anima Deep Halls NE, Myr'Thalas Gateways SW.
    const shafts = cen("uw-aurelion-shafts"), anima = cen("uw-anima-halls"), gates = cen("uw-myrthalas-gateways");
    expect(shafts.x, "Aurelion Access Shafts in the west").toBeLessThan(midX);
    expect(shafts.y, "Aurelion Access Shafts in the north").toBeLessThan(midY);
    expect(anima.x, "Anima Deep Halls in the east").toBeGreaterThan(midX);
    expect(anima.y, "Anima Deep Halls in the north").toBeLessThan(midY);
    expect(gates.x, "Myr'Thalas Gateways in the west").toBeLessThan(midX);
    expect(gates.y, "Myr'Thalas Gateways in the south half").toBeGreaterThan(shafts.y);
  });

  it("regionAt resolves underworld points: inside each complex, empty-in-shell, and off-shell", () => {
    for (const z of complexes()) {
      const c = centroid(z.shape);
      const res = regionAt(UNDERWORLD_ID, c.x, c.y);
      expect(res.continent?.id, `${z.id} centroid is in the realm`).toBe(FORGOTTEN_ID);
      expect(res.zone?.id, `${z.id} centroid resolves to ${z.id}`).toBe(z.id);
      expect(res.area, "complexes have no painted areas yet").toBeUndefined();
    }
    // Inside the cavern shell but outside every complex → realm only (verified gap point).
    const gap = regionAt(UNDERWORLD_ID, 340, 130);
    expect(gap.continent?.id, "empty-in-shell resolves to the realm").toBe(FORGOTTEN_ID);
    expect(gap.zone, "empty-in-shell has no complex").toBeUndefined();
    // Off the shell (a map corner) → nothing.
    const off = regionAt(UNDERWORLD_ID, 5, 5);
    expect(off.continent).toBeUndefined();
    expect(off.zone).toBeUndefined();
  });

  it("underworld zone ids are unique and disjoint from surface zone ids", () => {
    const ids = complexes().map((z) => z.id);
    expect(new Set(ids).size).toBe(ids.length);
    const surfaceIds = new Set(ZONE_REGIONS.filter((z) => z.continent !== FORGOTTEN_ID).map((z) => z.id));
    for (const id of ids) expect(surfaceIds.has(id), `${id} must not collide with a surface zone`).toBe(false);
  });
});
