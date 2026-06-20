// THE WORLD REGISTRY — the containment hierarchy as pure data (ADR 0009).
//
// ADR 0009 gives the world ONE framework: every tile resolves up a fixed spine
//   Map (type) › Continent › Zone › Area › Tile
// A surface map is ONE big ~250×250 tile COORDINATE SPACE; Continents, Zones and Areas are
// ORGANIC SHAPES (irregular POLYGONS) painted onto it — coastlines, ridgelines, river courses, biome
// fronts, NOT grid-aligned boxes (Dara's directive: "we don't want everything to be just rectangle
// shaped — make interesting shaped areas and zone lines that feel like real geography"). A tile's
// (continent, zone, area) is a point-in-POLYGON lookup by (x, y). There are no seams to stitch — it
// is literally one map — which is the simplest possible foundation for the seamless roaming ADR 0008
// wants.
//
// PLACEMENT IS READ FROM DARA'S MAP. The shapes + positions below are traced from the authoritative
// overworld reference `assets/reference/map-gaia-overworld.png` (Aurelion, top-left continent). The
// earlier Stage-1 rect skeleton in `data/zones.ts` had DRIFTED from that map (it crammed all built
// zones into a tiny stitched 3-cell grid by inference); this registry REALIGNS Aurelion to the map
// and the shapes are now organic. See the FLAGS-FOR-DARA block at the foot of the AURELION section.
//
// This module is the single SOURCE OF TRUTH for the hierarchy. It is PURE data (ADR 0005): no DOM,
// no controller imports. It is consumed by:
//   • the future big-map chunked RENDERER/MOVEMENT (which Area/Zone/Continent owns a world tile →
//     biome/tileset, encounter lean, music; derived per-position, ADR 0009 §4/§5),
//   • the dev "WORLD MAP" view (draws the 250×250 with Continent/Zone/Area boundaries colored in so
//     we watch the world fill as we paint regions; empty = "to build"), and
//   • save/resume, which stores (mapId, x, y) and re-derives the hierarchy on load (ADR 0009 §5).
//
// RECONCILING THE STAGE-1 WORLD-SPACE DATA (ADR 0009 consequences). The seamless-overworld Stage-1
// pass placed the three built zones in a shared world frame as `WORLD_REGIONS` (rect origins) +
// helpers in `data/zones.ts` — a superseded stitched-grid skeleton. Those rects stay (the seam-blend
// helpers + worldspace/worldmap tests still exercise them as the Stage-2 engine math), but they are
// no longer the hierarchy authority: this registry now owns the GEOGRAPHY as organic polygons read
// from the map. To keep the two from contradicting each other, the consistency test was relaxed from
// the old "ZoneRegion.bounds === worldRect" rect-equality to a looser "each built zone's polygon
// sits inside its continent" check (the polygon IS the truth now; the old rect is just legacy
// engine-grid scaffolding). The shapes no longer match the tiny Stage-1 rects on purpose.

import { ZONES } from "./zones";

// ── The hierarchy spine (ADR 0009 §1) ─────────────────────────────────────────────────────────

/**
 * The kind of map — and it ENCODES THE TRAVERSAL RULES (ADR 0009 §1):
 *  - "overworld" / "underworld" — SEAMLESS, continuous: one big ~250×250 coordinate space each; you
 *    roam in/out with no load. The underworld is reached from the overworld at the atlas's Access
 *    Shafts / gateways.
 *  - "dungeon" — DISCRETE, entered via a mouth: multiple floors, a self-contained story arc.
 *  - "cave"    — DISCRETE, entered: small, single-floor, tough, optional, one strong reward.
 */
export type MapKind = "overworld" | "underworld" | "dungeon" | "cave";

/** A point in a map's tile coordinate space. */
export interface Point { x: number; y: number; }

/**
 * An ORGANIC region boundary: a closed polygon (a ring of points, implicitly closed last→first) in
 * the map's tile coordinate space. Replaces the old axis-aligned rect — regions are coastlines /
 * ridgelines / river courses, not boxes (ADR 0009 §2 "rects/polygons"; Dara's organic-shapes
 * directive). Wound either way; containment + area are orientation-agnostic.
 */
export type Polygon = Point[];

/** The axis-aligned bounding box of a polygon — a cheap broad-phase reject before the ray cast. */
export interface BBox { minX: number; minY: number; maxX: number; maxY: number; }

/** Identity hints sampled at the Area level (ADR 0009 §4 — finest-first, Zone/Continent fallback). */
export interface AreaIdentity {
  /** Visual biome / which tileset the level-designer dresses this Area in. */
  biome: string;
  /** Tileset key the art-integrator maps to sprites (often == biome; separate so they can diverge). */
  tileset: string;
  /** Encounter LEAN — a hint for the encounter-designer (not a band; bands stay in zones.ts). */
  encounterLean: string;
  /** Ambient music theme key the audio layer selects when the player stands in this Area. */
  music: string;
}

/** A section WITHIN a zone — the finest-grained identity unit (Orchard Ridge, Bandit Fields, …). */
export interface Area {
  id: string;
  name: string;
  zone: string;          // parent Zone id
  shape: Polygon;        // an organic sub-shape nested within the parent zone's polygon
  identity: AreaIdentity;
  /** First-pass skeleton names/shapes inferred from the zone layout — FLAGGED for Dara (lore = his). */
  draft?: boolean;
}

/**
 * A named overworld region. A BUILT zone (`zone` set) links a playable `Zone` def in zones.ts; a
 * BACKLOG region (`zone` undefined, `draft:true`) is a named-but-unbuilt region from Dara's map,
 * painted so the World Map reads as a real continent with the built zones highlighted.
 */
export interface ZoneRegion {
  id: string;            // a stable region id (built zones match a ZONES id; backlog ids are slugs)
  name: string;
  continent: string;     // parent Continent id
  shape: Polygon;        // an organic region outline within the parent continent's polygon
  /** The playable Zone id this region links (built zones only); omitted for backlog regions. */
  zone?: string;
  /** Backlog region from the map, not yet wired to a Zone — FLAGGED for Dara (lore/build = his). */
  draft?: boolean;
}

/** A top-level overworld region (Aurelion / Varkhaz / Myr'Thalas / the Sundering), per the atlas. */
export interface Continent {
  id: string;
  name: string;
  map: string;           // parent WorldMap id
  shape: Polygon;        // an organic landmass outline (coastline); the rest of the map is ocean/backlog
}

/** A map: the kind of space + its full coordinate extent. The overworld is ONE ~250×250 space. */
export interface WorldMap {
  id: string;
  kind: MapKind;
  name: string;
  width: number;         // tile extent (the coordinate space, never realized whole — chunked, §3)
  height: number;
}

/** The result of a coordinate→hierarchy lookup (innermost first; any level may be undefined). */
export interface RegionResolution {
  continent?: Continent;
  zone?: ZoneRegion;
  area?: Area;
}

// ── Polygon geometry (ADR 0009 §2 — pure + cheap; called per-tile/frame later) ────────────────────

/** Axis-aligned bounding box of a polygon (broad-phase). */
export function bbox(poly: Polygon): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/** Twice the signed area of a polygon (shoelace); |area| via `Math.abs(...) / 2`. Used for "finest wins". */
export function polyArea2(poly: Polygon): number {
  let s = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s);
}

/**
 * Point-in-polygon by ray casting (crossing-number), with a bbox fast-reject. A point exactly on an
 * edge may resolve either way — fine here (region seams are owned by SOME region either way; the
 * dev view / streaming only need a deterministic answer, which this gives). Pure + allocation-free.
 */
export function pointInPolygon(poly: Polygon, x: number, y: number): boolean {
  const b = bbox(poly);
  if (x < b.minX || x > b.maxX || y < b.minY || y > b.maxY) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1, n = poly.length; i < n; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// ── The maps (ADR 0009 §1 — overworld + underworld are 250×250 seamless coordinate spaces) ──────
export const OVERWORLD_ID = "overworld";
export const UNDERWORLD_ID = "underworld";
const WORLD_SIZE = 250;

export const MAPS: WorldMap[] = [
  { id: OVERWORLD_ID, kind: "overworld", name: "Gaia — Surface", width: WORLD_SIZE, height: WORLD_SIZE },
  // The underworld is the second seamless space (atlas §2). Painted later; declared so the registry
  // models both coordinate spaces from the start. No regions yet = entirely backlog.
  { id: UNDERWORLD_ID, kind: "underworld", name: "Gaia — Underworld", width: WORLD_SIZE, height: WORLD_SIZE },
];

// Tiny helper so the polygon literals below read as natural coordinate pairs, not `{x,y}` noise.
const ring = (...pts: [number, number][]): Polygon => pts.map(([x, y]) => ({ x, y }));

// ── Continents (ADR 0009 §1) ────────────────────────────────────────────────────────────────────
// Only AURELION is painted (the starting continent — the current game lives here). It is one ORGANIC
// landmass with a real coastline traced from the overworld map (top-left continent); Varkhaz /
// Myr'Thalas / the Sundering are the rest of the 250×250 (ocean + backlog the dev view renders
// blank). The coastline is irregular: a broad NW body, a western Storm-Coast bulge, an eastern
// Frostpeak/Whisper arm across a bay, and a tapering southern Sunbridge peninsula.
export const AURELION_ID = "aurelion";

const AURELION_COAST = ring(
  [8, 18], [20, 10], [34, 7], [48, 8], [58, 12], [70, 9], [84, 8], [96, 11], [104, 9],
  [112, 14], [120, 12], [126, 20], [124, 30], [130, 40], [128, 52], [134, 58], [132, 68],
  [126, 74], [130, 82], [127, 92], [120, 100], [112, 100], [106, 98], [100, 96],
  [92, 102], [86, 110], [80, 118], [72, 126], [64, 124], [58, 116], [54, 108],
  [48, 108], [40, 104], [32, 102], [26, 96], [22, 88], [15, 84], [10, 76],
  [4, 68], [2, 58], [8, 50], [2, 40], [6, 30], [2, 22],
);

export const CONTINENTS: Continent[] = [
  { id: AURELION_ID, name: "Aurelion", map: OVERWORLD_ID, shape: AURELION_COAST },
];

// ── Zones (ADR 0009 §1) — ORGANIC polygons traced from the overworld map ──────────────────────────
// BUILT zones (link a playable Zone via `zone`) are highlighted; BACKLOG regions (`draft`, no `zone`)
// are the other named Aurelion regions from the map (#3–#9), painted so the continent reads real and
// the build backlog is visible. Positions/shapes match Dara's map (see the per-region notes); the
// drifted Stage-1 rect grid is superseded.
//
// Built-zone shapes (north→south, matching the map):
//   • Greenvale  (#1, Shirelands)  — NW upland, temperate farmland/forest. Map: top-LEFT.
//   • Silverwood (#2, Ancient Forest) — N, EAST of Greenvale (slightly higher latitude). Map: top-center/right.
//   • The Duskmarsh — NOT drawn on the map (Dara's "it's in Aurelion" ruling). Placed in a low wet
//     basin in the west-center (south of Greenvale, between Storm Coast and Goldmeadow) as a sensible
//     organic spot for a water-framed mire. FLAGGED for Dara (see foot of section).
export const ZONE_REGIONS: ZoneRegion[] = [
  // ── BUILT ──
  { id: "greenvale", name: "Greenvale", continent: AURELION_ID, zone: "greenvale",
    shape: ring([14, 16], [26, 12], [38, 13], [48, 18], [52, 26], [50, 34], [44, 40], [36, 42],
                [28, 40], [20, 42], [14, 38], [11, 30], [10, 22]) },
  { id: "silverwood", name: "Silverwood", continent: AURELION_ID, zone: "silverwood",
    shape: ring([60, 14], [72, 11], [84, 12], [96, 16], [104, 22], [102, 30], [96, 36], [86, 38],
                [76, 36], [66, 34], [58, 28], [56, 20]) },
  { id: "duskmarsh", name: "The Duskmarsh", continent: AURELION_ID, zone: "duskmarsh",
    shape: ring([26, 46], [36, 44], [44, 48], [48, 55], [45, 63], [38, 67], [30, 66], [24, 60], [23, 52]) },

  // ── BACKLOG (named on the map, not yet built — draft; flagged for Dara) ──
  { id: "goldmeadow", name: "Goldmeadow Plains", continent: AURELION_ID, draft: true,
    shape: ring([50, 40], [62, 38], [74, 40], [82, 46], [84, 54], [78, 60], [68, 62], [58, 60], [50, 54], [48, 46]) },
  { id: "stormcoast", name: "Storm Coast", continent: AURELION_ID, draft: true,
    shape: ring([9, 57], [16, 55], [22, 60], [24, 68], [20, 76], [12, 77], [8, 71], [7, 63]) },
  { id: "riverhearth", name: "Riverhearth", continent: AURELION_ID, draft: true,
    shape: ring([60, 64], [72, 62], [82, 66], [86, 74], [82, 82], [72, 84], [62, 80], [57, 72]) },
  { id: "frostpeak", name: "Frostpeak Highlands", continent: AURELION_ID, draft: true,
    shape: ring([100, 50], [112, 46], [124, 52], [130, 62], [126, 72], [116, 74], [106, 68], [100, 60]) },
  { id: "dawnfall", name: "Dawnfall Hold", continent: AURELION_ID, draft: true,
    shape: ring([28, 84], [40, 82], [50, 86], [52, 94], [46, 100], [34, 100], [26, 94]) },
  { id: "whisperhills", name: "Whisper Hills", continent: AURELION_ID, draft: true,
    shape: ring([100, 78], [112, 76], [122, 82], [124, 92], [115, 97], [104, 95], [98, 88]) },
  { id: "sunbridge", name: "Sunbridge", continent: AURELION_ID, draft: true,
    shape: ring([58, 98], [68, 96], [78, 100], [80, 108], [74, 116], [66, 120], [60, 112], [56, 106]) },
];

// FLAGS FOR DARA (geography the map leaves open — see also the §4 flags in zones.ts):
//   • THE DUSKMARSH IS NOT ON YOUR MAP. It's a built zone by your "it's in Aurelion" ruling, so I
//     placed it in a low west-center basin (centroid ≈ world (35,56)) — a believable spot for a
//     water-framed mire, south of Greenvale and tucked between Storm Coast and Goldmeadow/Riverhearth.
//     Confirm or tell me where on the map the marsh actually sits and I'll re-trace it.
//   • SILVERWOOD SITS EAST OF GREENVALE (roughly the same latitude, a touch higher) — read straight
//     off the map (#1 top-left, #2 top-center). The old data already had E/W right, but had the whole
//     continent crammed into a tiny stitched grid; the shapes + spacing are now map-accurate.
//   • BACKLOG REGION SHAPES (#3–#9) are agent traces of your coastline/region positions, drawn so the
//     continent reads real. Names are yours (from the map); the exact outlines are mine to refine —
//     adjust any that read wrong and I'll re-trace.

// ── Areas (ADR 0009 §1, §4) — the finest identity unit, FIRST-PASS SKELETON, FLAGGED FOR DARA ─────
// Each Area is an ORGANIC sub-shape nested within its zone's polygon, inferred from the zone's
// open-world layout (named clearings/hollows/causeways + dungeon-mouth approach in zones.ts). Shapes
// are irregular (a hollow, a ridge, a lagoon — not boxes). Names/biomes/leans are an AGENT FIRST PASS
// (draft:true) — lore + final names are Dara's.
//
// Identity resolves FINEST-FIRST (ADR 0009 §4): a tile inside an Area gets that Area's biome/music/
// lean; a zone tile outside every Area falls back to the zone (and the zone to the continent). So we
// do NOT need to tile the whole zone with Areas — gaps fall back to the zone's own envs/bands.
export const AREAS: Area[] = [
  // ── Greenvale (the Shirelands) — temperate farmland/forest. Spawn commons, the north orchard
  //    ridge, the south meadow "bandit fields", the hidden grove (Hogger), the warren-mouth green. ──
  { id: "gv-commons", name: "Hearthford Commons", zone: "greenvale", draft: true,
    shape: ring([18, 20], [26, 18], [30, 24], [28, 30], [22, 32], [17, 28]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "low-slime-kobold", music: "field" } },
  { id: "gv-orchard", name: "Orchard Ridge", zone: "greenvale", draft: true,
    shape: ring([30, 15], [40, 15], [46, 20], [44, 26], [36, 27], [30, 22]),
    identity: { biome: "orchard", tileset: "shire", encounterLean: "kobold-bandit", music: "field" } },
  { id: "gv-fields", name: "Bandit Fields", zone: "greenvale", draft: true,
    shape: ring([22, 32], [34, 32], [40, 36], [36, 40], [26, 40], [20, 37]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "bandit-mage", music: "field" } },
  { id: "gv-grove", name: "The Hidden Grove", zone: "greenvale", draft: true,
    shape: ring([40, 28], [47, 28], [48, 33], [44, 37], [39, 34]),
    identity: { biome: "forest", tileset: "shire", encounterLean: "rare-lair", music: "field" } },
  { id: "gv-warren-approach", name: "Warren Approach", zone: "greenvale", draft: true,
    shape: ring([44, 22], [50, 24], [50, 30], [45, 30], [43, 26]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "miniboss-gate", music: "field" } },

  // ── Silverwood (the Ancient Forest) — denser/darker old-growth. Fern hollows, heartwood crossing,
  //    the canopy nook, the deep mossbed, and the Sunless-Grove-mouth approach. ──
  { id: "sw-fern-hollows", name: "Fern Hollows", zone: "silverwood", draft: true,
    shape: ring([60, 18], [68, 16], [72, 22], [70, 30], [63, 30], [58, 24]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "wolf-thornling", music: "forest" } },
  { id: "sw-heartwood", name: "Heartwood Crossing", zone: "silverwood", draft: true,
    shape: ring([74, 18], [82, 18], [86, 24], [82, 30], [75, 28], [72, 22]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer-wisp", music: "forest" } },
  { id: "sw-canopy", name: "Canopy Nook", zone: "silverwood", draft: true,
    shape: ring([84, 16], [94, 17], [98, 22], [94, 27], [86, 25], [83, 20]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer", music: "forest" } },
  { id: "sw-mossbed", name: "Deep Mossbed", zone: "silverwood", draft: true,
    shape: ring([76, 30], [86, 30], [90, 33], [85, 36], [77, 34]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "rare-lair", music: "forest" } },
  { id: "sw-grove-approach", name: "Sunless-Grove Approach", zone: "silverwood", draft: true,
    shape: ring([94, 24], [101, 26], [100, 31], [94, 32], [92, 28]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "miniboss-gate", music: "forest" } },

  // ── The Duskmarsh — water-framed mire. Mire-head causeways, the central lagoon they loop around,
  //    the sunken ruin (rare lair), and the Drowned-Vault-mouth landing. ──
  { id: "dm-causeways", name: "The Causeways", zone: "duskmarsh", draft: true,
    shape: ring([27, 48], [35, 46], [40, 50], [38, 56], [30, 58], [25, 53]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "rat-spider", music: "field" } },
  { id: "dm-lagoon", name: "The Central Lagoon", zone: "duskmarsh", draft: true,
    shape: ring([33, 52], [42, 52], [44, 57], [39, 62], [32, 60], [30, 56]),
    identity: { biome: "water", tileset: "mire", encounterLean: "spider-leper", music: "field" } },
  { id: "dm-sunken-ruin", name: "The Sunken Ruin", zone: "duskmarsh", draft: true,
    shape: ring([28, 58], [35, 58], [37, 62], [32, 65], [27, 62]),
    identity: { biome: "ruin", tileset: "mire", encounterLean: "rare-lair", music: "field" } },
  { id: "dm-vault-approach", name: "Drowned-Vault Approach", zone: "duskmarsh", draft: true,
    shape: ring([40, 55], [46, 56], [45, 61], [40, 61], [38, 58]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "miniboss-gate", music: "field" } },
];

// ── Point-in-region lookups (ADR 0009 §2/§5 — pure + cheap; called per-tile/frame later) ──────────

/** The map definition for a map id. */
export function worldMap(mapId: string): WorldMap | undefined {
  return MAPS.find((m) => m.id === mapId);
}

/**
 * Resolve a coordinate to its place in the hierarchy: { continent, zone, area }, innermost-first.
 * Areas/Zones/Continents are point-in-POLYGON; the FINEST match wins (an Area implies its Zone and
 * Continent). Empty map space (inside the coastline, no painted zone) returns just the continent;
 * off-continent returns {} — the caller falls back to the Map's own rules. Lookups are confined to
 * the named map (the underworld has no regions yet → always {}).
 *
 * Cheap by construction (a handful of bbox-gated ray casts over the painted regions). When the
 * painted set grows large enough to matter, swap the linear scans for a per-map spatial index behind
 * this same signature — consumers (renderer/movement/save/dev view) never change.
 */
export function regionAt(mapId: string, x: number, y: number): RegionResolution {
  const continent = CONTINENTS.find((c) => c.map === mapId && pointInPolygon(c.shape, x, y));
  if (!continent) return {};
  const zone = ZONE_REGIONS.find((z) => z.continent === continent.id && pointInPolygon(z.shape, x, y));
  if (!zone) return { continent };
  // Innermost wins: an Area must nest inside its zone, so a zone hit can be refined to an Area hit.
  // DEFINED PRIORITY for overlapping Areas (ADR 0009 §2 "polygons with priority"): the FINEST
  // (smallest area) wins — so a small special pocket (the Hidden Grove, the Sunken Ruin, the lagoon)
  // painted on top of a broad section (Bandit Fields, the Causeways) takes precedence at the overlap.
  let area: Area | undefined;
  let areaSize = Infinity;
  for (const a of AREAS) {
    if (a.zone !== zone.id || !pointInPolygon(a.shape, x, y)) continue;
    const sz = polyArea2(a.shape);
    if (sz < areaSize) { area = a; areaSize = sz; }
  }
  return { continent, zone, area };
}

/** Areas of a given zone (skeleton sections), in declared order. */
export function areasOf(zoneId: string): Area[] {
  return AREAS.filter((a) => a.zone === zoneId);
}

/** Zone regions of a given continent, in declared order (built + backlog). */
export function zonesOf(continentId: string): ZoneRegion[] {
  return ZONE_REGIONS.filter((z) => z.continent === continentId);
}

/** Only the BUILT zone regions (those linking a playable Zone) of a continent. */
export function builtZonesOf(continentId: string): ZoneRegion[] {
  return ZONE_REGIONS.filter((z) => z.continent === continentId && z.zone);
}
