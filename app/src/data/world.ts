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

import { ZONES, type Pt, type Rect } from "./zones";

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

// ── The maps (ADR 0009 §1 — overworld + underworld are seamless coordinate spaces) ──────────────
// THE OVERWORLD IS NOT SQUARE. It is sized to the proportions of Dara's canon overworld map
// (`assets/reference/map-gaia-overworld.png`, 1536×1024 px = 3:2). We use a 3:2 world of
// 960 × 640 TILES so the whole overworld fits at a consistent, playable scale.
//
// SCALE PEG (map-px → world-tile) — everything below is traced from the canon map through this peg:
//   • map is 1536 × 1024 px;  world is 960 × 640 tiles.
//   • 960 / 1536 = 0.625 world-tiles per map-px  (⇔ 1.6 map-px per world-tile).
//   • one 10% grid cell of the map = 96 tiles wide × 64 tall.
//   • a region traced as map-fraction (fx, fy) sits at tile (fx·960, fy·640).
// At this scale a typical region is ~70–110 tiles across — real play-space (a built zone ≈ 60 tiles
// across, ADR target), four continents ringing the central Great Expanse with room between them.
export const OVERWORLD_ID = "overworld";
export const UNDERWORLD_ID = "underworld";
export const OVERWORLD_W = 960;
export const OVERWORLD_H = 640;

export const MAPS: WorldMap[] = [
  { id: OVERWORLD_ID, kind: "overworld", name: "Gaia — Surface", width: OVERWORLD_W, height: OVERWORLD_H },
  // The underworld is the second seamless space (atlas §2). Painted later; declared so the registry
  // models both coordinate spaces from the start. No regions yet = entirely backlog. Same 3:2 frame.
  { id: UNDERWORLD_ID, kind: "underworld", name: "Gaia — Underworld", width: OVERWORLD_W, height: OVERWORLD_H },
];

// Tiny helper so the polygon literals below read as natural coordinate pairs, not `{x,y}` noise.
const ring = (...pts: [number, number][]): Polygon => pts.map(([x, y]) => ({ x, y }));

// ── Continents (ADR 0009 §1) — ALL FOUR landmasses traced from the canon map ───────────────────────
// A rough-but-faithful placement pass: every continent is one ORGANIC landmass (irregular coastline)
// in its canon quadrant, sized + positioned per the overworld map through the scale peg above. The
// central Great Expanse and the named seas are the NEGATIVE SPACE between them (no polygon — ocean is
// "no continent"). This frames the whole world so we can confirm it FITS before filling regions in.
//
//   Aurelion    — NW  (The Heartland; broad rounded landmass, the starting continent).
//   Varkhaz     — NE  (The Untamed Frontier; widest continent, lush west → volcanic east).
//   Myr'Thalas  — SW  (The Ancient Continent; smaller, fragmented, sinking).
//   The Sundering — S/SE (The Scars; a large broken archipelago, Anima reaching W toward Myr'Thalas).
export const AURELION_ID = "aurelion";
export const VARKHAZ_ID = "varkhaz";
export const MYRTHALAS_ID = "myrthalas";
export const SUNDERING_ID = "sundering";

// AURELION (NW): broad rounded heartland. Map frac x≈0.10–0.47, y≈0.03–0.46. A western Storm-Coast
// bulge, a northern Greenvale/Silverwood shoulder, an eastern Frostpeak arm, a tapering S Sunbridge
// peninsula toward the Coral Archipelago.
const AURELION_COAST = ring(
  [104, 38], [150, 18], [196, 14], [240, 20], [286, 16], [326, 26], [360, 20], [398, 30],
  [434, 46], [456, 78], [460, 112], [470, 142], [460, 170], [472, 200], [456, 230],
  [438, 262], [430, 290], [408, 308], [380, 304], [358, 296], [336, 316], [306, 322], [280, 308],
  [264, 284], [240, 290], [216, 306], [196, 314], [172, 304], [156, 282], [134, 276],
  [112, 282], [90, 266], [78, 238], [84, 210], [68, 186], [80, 156], [64, 128],
  [76, 102], [62, 76], [78, 54],
);

// VARKHAZ (NE): the widest continent. Map frac x≈0.52–0.97, y≈0.03–0.41. Lush green west (Emerald
// Basin/waterfalls) → volcanic red east (Ashfang). A jagged coast with a southern Kraal cape.
const VARKHAZ_COAST = ring(
  [512, 56], [560, 32], [604, 24], [648, 30], [690, 20], [730, 28], [772, 18], [814, 26],
  [856, 20], [898, 30], [930, 54], [940, 86], [930, 118], [940, 148], [924, 174],
  [936, 200], [914, 226], [886, 246], [854, 254], [826, 248], [802, 266], [780, 282],
  [754, 276], [732, 258], [708, 270], [684, 280], [660, 274], [636, 262], [612, 246],
  [588, 254], [566, 242], [544, 250], [522, 234], [504, 206], [514, 176], [498, 150],
  [512, 120], [496, 92],
);

// MYR'THALAS (SW): smaller, fragmented ancient land. Map frac x≈0.05–0.40, y≈0.47–0.81. Ragged,
// half-sunk coast — many bays and a long western Celestial-Reach arm.
const MYRTHALAS_COAST = ring(
  [54, 338], [96, 322], [136, 318], [176, 326], [212, 320], [248, 330], [284, 348],
  [306, 374], [310, 402], [300, 428], [312, 456], [296, 484], [268, 506], [236, 516],
  [206, 510], [180, 522], [154, 516], [132, 526], [108, 514], [84, 490], [80, 464],
  [70, 442], [88, 416], [66, 394], [82, 368], [62, 350],
);

// THE SUNDERING (S/SE): a large BROKEN landmass / archipelago. Map frac x≈0.36–0.85, y≈0.47–0.92.
// Anima (#23) reaches WEST toward Myr'Thalas; Sol/Nox north; Quanta the central void; Umbraxis SE
// floating isles. Drawn as one ragged outer shell (the scars are the inner regions).
const SUNDERING_COAST = ring(
  [344, 388], [392, 362], [436, 354], [480, 344], [524, 350], [568, 342], [612, 350],
  [656, 344], [700, 354], [740, 346], [782, 368], [810, 398], [820, 432], [810, 466],
  [822, 500], [802, 532], [776, 560], [742, 576], [704, 584], [666, 576], [634, 588],
  [598, 592], [560, 584], [524, 592], [488, 584], [452, 570], [424, 550], [402, 524],
  [382, 534], [356, 522], [336, 496], [346, 466], [324, 440], [338, 412],
);

const SURFACE_CONTINENTS: Continent[] = [
  { id: AURELION_ID, name: "Aurelion", map: OVERWORLD_ID, shape: AURELION_COAST },
  { id: VARKHAZ_ID, name: "Varkhaz", map: OVERWORLD_ID, shape: VARKHAZ_COAST },
  { id: MYRTHALAS_ID, name: "Myr'Thalas", map: OVERWORLD_ID, shape: MYRTHALAS_COAST },
  { id: SUNDERING_ID, name: "The Sundering", map: OVERWORLD_ID, shape: SUNDERING_COAST },
];

// ── Zones (ADR 0009 §1) — ALL 25 named regions as ROUGH ORGANIC polygons traced from the map ───────
// A rough-but-faithful placement of every numbered region (atlas §1) in its map-correct spot, sized
// at a consistent scale so we can confirm the world FITS before filling in. BUILT zones (link a
// playable Zone via `zone`) are highlighted; everything else is BACKLOG (`draft`, no `zone`) — named
// on the map, not yet built. Positions follow Dara's map (per-region map-position noted); "rough is
// the point" — relative position/size over fine vertices.
//
// Region numbering (atlas §1): Aurelion #1–9, Varkhaz #10–15, Myr'Thalas #16–20, the Sundering #21–25.
const SURFACE_ZONE_REGIONS: ZoneRegion[] = [
  // ══ AURELION (#1–9) — The Heartland (NW) ══════════════════════════════════════════════════════
  // ── BUILT ──
  // #1 Greenvale (Shirelands) — top-LEFT (NW) of the continent.
  { id: "greenvale", name: "Greenvale", continent: AURELION_ID, zone: "greenvale",
    shape: ring([116, 52], [150, 40], [188, 44], [206, 64], [202, 92], [180, 108], [150, 110],
                [124, 98], [110, 76]) },
  // #2 Silverwood (Ancient Forest) — top-CENTER (N), EAST of Greenvale, ~same latitude.
  { id: "silverwood", name: "Silverwood", continent: AURELION_ID, zone: "silverwood",
    shape: ring([244, 44], [286, 36], [326, 44], [350, 64], [344, 92], [318, 106], [284, 106],
                [256, 92], [240, 68]) },
  // The Duskmarsh — NOT on the canon map (Dara's "it's in Aurelion" ruling). Placed as a low wet
  // basin SOUTH of Greenvale (between Storm Coast and Goldmeadow). FLAGGED for Dara (foot of section).
  { id: "duskmarsh", name: "The Duskmarsh", continent: AURELION_ID, zone: "duskmarsh",
    shape: ring([150, 124], [188, 120], [212, 138], [212, 166], [190, 182], [160, 180], [140, 162],
                [138, 138]) },

  // #3 Goldmeadow Plains (Breadbasket) — center, S of Silverwood. BUILT (first backlog fill): rolling
  // open farmland, the breadbasket war-front (L11–15). Organic plains blob — a broad NW open lobe, a
  // tapering NE shoulder under Silverwood, and a dipping S/SE coast toward Riverhearth — sitting inside
  // the Aurelion interior with no overlap of greenvale/silverwood/duskmarsh/riverhearth. Centroid
  // ≈ (299,149); bbox 120×72 comfortably hosts a ~60×24 authored core (level-designer places it).
  { id: "goldmeadow", name: "Goldmeadow Plains", continent: AURELION_ID, zone: "goldmeadow",
    shape: ring([248, 122], [300, 114], [344, 128], [360, 152], [348, 176], [312, 186], [272, 178],
                [246, 160], [240, 140]) },

  // ── BUILT (this build — Aurelion complete; all six linked, polygons refined to host their cores) ──
  // #4 Storm Coast (Seafarer's Rest) — WEST coast, mid-latitude. OPTIONAL (L13–17). A storm-lashed rock
  // coast: a NW cove spawn, N cliffs, a S wreck strand, the E sea-cave mouth. Hugs Aurelion's western
  // coastline; centroid ≈ (122,204); bbox 76×72 hosts a ~52×22 authored core.
  { id: "stormcoast", name: "Storm Coast", continent: AURELION_ID, zone: "stormcoast",
    shape: ring([94, 176], [124, 168], [152, 180], [160, 202], [154, 226], [136, 240], [110, 240],
                [92, 224], [84, 202], [86, 186]) },
  // #5 Riverhearth (Trade Capital) — CENTER hub of the continent. OPTIONAL (L15–18). Trade-road/river
  // outskirts of the capital: W wharves spawn, N trade road, central market, S riverbank, E smugglers'
  // den mouth. Broad central blob (the crossroads); centroid ≈ (303,228); bbox 112×72 hosts a ~56×22 core.
  { id: "riverhearth", name: "Riverhearth", continent: AURELION_ID, zone: "riverhearth",
    shape: ring([258, 200], [300, 192], [342, 202], [360, 224], [352, 248], [326, 262], [294, 264],
                [266, 254], [248, 232], [248, 214]) },
  // #6 Frostpeak Highlands (Dwarven Strongholds) — EAST arm, mid-latitude. SPINE (L16–20). A vertical
  // frozen mountain arm: W glacial pass, N frozen ridge, central glacier, S undervault, the E hold-gate
  // mouth. Eastern arm of Aurelion; centroid ≈ (414,180); bbox 88×76 comfortably hosts a 60×24 core.
  { id: "frostpeak", name: "Frostpeak Highlands", continent: AURELION_ID, zone: "frostpeak",
    shape: ring([380, 150], [414, 142], [446, 152], [458, 176], [452, 202], [432, 218], [402, 218],
                [380, 204], [370, 182], [370, 166]) },
  // #7 Dawnfall Hold (Frontier Watch) — SW. OPTIONAL (L17–21). A breached frontier fortress: W watchwall
  // spawn, N rampart, S muster yard, E breached-undervault mouth. SW interior; centroid ≈ (184,270);
  // bbox 74×52 hosts a ~50×22 core.
  { id: "dawnfall", name: "Dawnfall Hold", continent: AURELION_ID, zone: "dawnfall",
    shape: ring([148, 250], [182, 244], [210, 254], [222, 272], [214, 288], [192, 296], [170, 294],
                [156, 280], [148, 266]) },
  // #8 Whisper Hills (Monastery Land) — SE. OPTIONAL (L19–23). Quiet monastic green hills: W cloister
  // spawn, N greens, S crypt path, E reliquary mouth. SE interior; centroid ≈ (387,272); bbox 82×56
  // hosts a ~52×22 core.
  { id: "whisperhills", name: "Whisper Hills", continent: AURELION_ID, zone: "whisperhills",
    shape: ring([356, 250], [390, 244], [418, 256], [428, 276], [418, 292], [396, 300], [370, 296],
                [352, 282], [346, 266]) },
  // #9 Sunbridge (Port City) — S-center, southernmost (toward the Coral Archipelago). SPINE FINALE
  // (L21–25). The great southern sea-port: W quays spawn, N seawall, central plaza, S harbor, the E
  // citadel/lighthouse mouth (the finale dungeon). S peninsula; centroid ≈ (305,290); bbox 72×48 hosts
  // a 60×24 core.
  { id: "sunbridge", name: "Sunbridge", continent: AURELION_ID, zone: "sunbridge",
    shape: ring([274, 272], [306, 266], [332, 278], [342, 296], [332, 308], [308, 314], [286, 308],
                [274, 296], [270, 284]) },

  // ══ VARKHAZ (#10–15) — The Untamed Frontier (NE) ══════════════════════════════════════════════
  // #10 Dunes of Khar (Shifting Sands) — top-center/NW of the continent.
  { id: "dunes-of-khar", name: "Dunes of Khar", continent: VARKHAZ_ID, draft: true,
    shape: ring([576, 56], [624, 48], [664, 60], [676, 86], [664, 110], [628, 120], [592, 112],
                [568, 90], [564, 70]) },
  // #11 Emerald Basin (Jungle of Giants) — WEST (lush, waterfalls).
  { id: "emerald-basin", name: "Emerald Basin", continent: VARKHAZ_ID, draft: true,
    shape: ring([544, 132], [592, 124], [628, 140], [636, 170], [620, 198], [584, 210], [552, 200],
                [532, 174], [532, 150]) },
  // #12 Bloodstone Mesa (Thunderplateau) — CENTER (red-rock plateau).
  { id: "bloodstone-mesa", name: "Bloodstone Mesa", continent: VARKHAZ_ID, draft: true,
    shape: ring([668, 148], [712, 140], [748, 154], [758, 182], [742, 206], [704, 216], [672, 204],
                [654, 178]) },
  // #13 Ashfang Wastes (Volcanic Badlands) — NE/EAST (volcanic red).
  { id: "ashfang-wastes", name: "Ashfang Wastes", continent: VARKHAZ_ID, draft: true,
    shape: ring([788, 76], [836, 68], [884, 80], [908, 108], [908, 144], [884, 168], [844, 174],
                [806, 160], [784, 132], [776, 102]) },
  // #14 Thornwood (Savage Wilds) — S-center.
  { id: "thornwood", name: "Thornwood", continent: VARKHAZ_ID, draft: true,
    shape: ring([632, 220], [676, 214], [708, 228], [716, 250], [700, 264], [664, 268], [636, 254],
                [624, 236]) },
  // #15 Kraal of the Sand Kings (Ancient Ruins) — SE cape (desert ruins).
  { id: "kraal-sand-kings", name: "Kraal of the Sand Kings", continent: VARKHAZ_ID, draft: true,
    shape: ring([788, 184], [828, 178], [858, 194], [864, 220], [846, 236], [810, 238], [784, 222],
                [776, 202]) },

  // ══ MYR'THALAS (#16–20) — The Ancient Continent (SW) ═══════════════════════════════════════════
  // #16 Crystal Expanse (Arcane Wastes) — top-center/N.
  { id: "crystal-expanse", name: "Crystal Expanse", continent: MYRTHALAS_ID, draft: true,
    shape: ring([152, 332], [192, 324], [228, 338], [240, 358], [226, 378], [190, 386], [160, 376],
                [142, 356]) },
  // #17 The Whispering Marsh (Haunted Wetlands) — W/NW.
  { id: "whispering-marsh", name: "The Whispering Marsh", continent: MYRTHALAS_ID, draft: true,
    shape: ring([86, 372], [124, 364], [152, 380], [156, 404], [138, 424], [104, 426], [82, 408],
                [78, 388]) },
  // #18 Titanfall Basin (Ruins of the Titans) — CENTER.
  { id: "titanfall-basin", name: "Titanfall Basin", continent: MYRTHALAS_ID, draft: true,
    shape: ring([200, 392], [242, 386], [274, 400], [282, 420], [268, 438], [234, 446], [204, 436],
                [190, 414]) },
  // #19 Celestial Reach (Sky Observatories) — far SW (lower-left).
  { id: "celestial-reach", name: "Celestial Reach", continent: MYRTHALAS_ID, draft: true,
    shape: ring([92, 432], [124, 426], [150, 442], [152, 466], [132, 482], [104, 480], [90, 460]) },
  // #20 The Sunken Vaults (Lost Civilization) — S-center (half-drowned).
  { id: "sunken-vaults", name: "The Sunken Vaults", continent: MYRTHALAS_ID, draft: true,
    shape: ring([180, 458], [220, 452], [250, 466], [256, 486], [238, 500], [202, 502], [176, 488],
                [168, 470]) },

  // ══ THE SUNDERING (#21–25) — The Scars of the Calamity (S/SE, ENDGAME) ═════════════════════════
  // #21 Sol Scar (The Radiant Expanse) — N/NW of the Sundering (golden, upper-left).
  { id: "sol-scar", name: "Sol Scar", continent: SUNDERING_ID, draft: true,
    shape: ring([396, 392], [444, 384], [484, 398], [496, 426], [480, 452], [440, 462], [404, 450],
                [384, 422]) },
  // #22 Nox Scar (Eternal Dusk) — NE of the Sundering (dark, upper-right).
  { id: "nox-scar", name: "Nox Scar", continent: SUNDERING_ID, draft: true,
    shape: ring([656, 392], [704, 384], [744, 398], [756, 426], [740, 452], [700, 462], [664, 450],
                [644, 422]) },
  // #23 Anima Scar (The Verdant Heart) — far W of the Sundering, reaching toward Myr'Thalas.
  { id: "anima-scar", name: "Anima Scar", continent: SUNDERING_ID, draft: true,
    shape: ring([356, 456], [394, 450], [420, 466], [424, 494], [404, 514], [372, 514], [350, 494],
                [344, 472]) },
  // #24 Quanta Scar (The Fractured Continuum) — CENTER (the void portal).
  { id: "quanta-scar", name: "Quanta Scar", continent: SUNDERING_ID, draft: true,
    shape: ring([520, 444], [568, 436], [608, 450], [620, 478], [604, 504], [564, 514], [528, 502],
                [508, 474]) },
  // #25 Umbraxis Scar (The Gravity Maw) — SE of the Sundering (floating isles, lower-right).
  { id: "umbraxis-scar", name: "Umbraxis Scar", continent: SUNDERING_ID, draft: true,
    shape: ring([684, 470], [728, 464], [760, 480], [766, 508], [748, 530], [710, 536], [680, 520],
                [668, 494]) },
];

// FLAGS FOR DARA (geography the canon map leaves open or this rough pass had to infer):
//   • AURELION COMPLETE (this build): the six remaining Aurelion regions (#4 Storm Coast, #5 Riverhearth,
//     #6 Frostpeak Highlands, #7 Dawnfall Hold, #8 Whisper Hills, #9 Sunbridge) are now LINKED (zone set,
//     draft dropped) with refined organic polygons + tiling Areas. Their positions still trace your
//     overworld map (Storm Coast W coast, Frostpeak E mountain arm, Sunbridge S port toward the Coral
//     Archipelago, Dawnfall SW, Whisper Hills SE, Riverhearth center). All region/Area NAMES are DRAFT —
//     yours to bless. Nudge any polygon on your word and I'll re-trace.
//   • THE DUSKMARSH IS NOT ON YOUR MAP. Built zone by your "it's in Aurelion" ruling; placed as a low
//     wet basin SOUTH of Greenvale (centroid ≈ world (178,150)), between Storm Coast and Goldmeadow.
//     Tell me where the marsh actually sits and I'll re-trace it.
//   • ALL 25 REGION OUTLINES are ROUGH traces of your map's region positions at a consistent scale —
//     correct relative position/size, not final coastlines. Names/epithets are yours (from the map).
//     Adjust any that read wrong and I'll re-trace.
//   • A FEW POSITIONS ARE INFERENCES where labels sit near a continent edge / over water: Sunbridge
//     (#9) hugs Aurelion's S tip toward the Coral Archipelago; Anima Scar (#23) straddles the
//     Myr'Thalas↔Sundering gap (drawn inside the Sundering shell). Confirm if you want them moved.
//   • CONNECTION GRAPH (region↔region trade/sea/underground routes, atlas G7) is still OPEN — this
//     pass locks WHERE regions are, not yet HOW they link.

// ── Areas (ADR 0009 §1, §4) — the finest identity unit, ORGANIC TILING, FLAGGED FOR DARA ──────────
// REFINED PASS (world-cartographer, 2026-06-20). Each built zone's Areas are now ORGANIC POLYGONS that
// TILE THE ZONE — together they cover the zone's polygon with no gaps and no overlap (verified in
// app/tests/world.test.ts to ~100% interior coverage / 0% mutual overlap), so EVERY point in a built
// zone resolves to an Area (not just the special pockets). The boundaries between Areas are SHARED
// organic seams (a ridge line, a root-trail, a bank, the lagoon shore) traced from each zone's
// open-world layout in zones.ts — not boxes. Each Area's perimeter follows the zone's coastline (a hair
// of overshoot keeps the rim fully covered) and meets its neighbors on a common interior polyline, so
// adjacent Areas are contiguous and the zone reads as one connected network (the open-world rule at the
// finest grain). Names/biomes/leans/music are an AGENT FIRST PASS (draft:true) — Dara blesses them.
//
// Identity resolves FINEST-FIRST (ADR 0009 §4): a tile gets its Area's biome/tileset/lean/music, with
// Zone→Continent fallback. The small SPECIAL POCKETS (the Hidden Grove, the Central Lagoon) are painted
// so the FINEST (smallest) overlapping shape wins — but here they're carved as clean tiles too, so the
// tiling is exact rather than relying on the priority rule.
//
// THE DUNGEON-MOUTH AREA is, in every zone, the EASTERN lobe — because each zone's `mouth`/`gate` sits
// at the east of its playable grid (Greenvale x=40/64, Silverwood x=36/60, Duskmarsh x=32/56). So the
// level-designer puts the dungeon entrance inside: gv-warren (→ Bandit Warren), sw-grove-approach
// (→ Sunless Grove), dm-vault-approach (→ Drowned Vault). encounterLean "miniboss-gate" marks them.
//
// ENCOUNTER-LEAN respects Dara's no-surface-Attunement ruling (ADR 0009 §4): leans are CREATURE/TERRAIN
// flavor (which beasts, how dangerous, what ground), never an Attunement theme.
export const AREAS: Area[] = [
  // ── Greenvale (the Shirelands) — temperate farmland/forest, an open shire mesh. The west spawn
  //    Commons, the north Orchard Ridge, the south meadow Bandit Fields, the hidden Grove pocket on the
  //    south loop (Hogger's lair), and the east Warren Approach (the Bandit Warren mouth). They tile
  //    the shire blob; seams are the orchard ridge-line (N) and the central staging green (E). ──
  { id: "gv-commons", name: "Hearthford Commons", zone: "greenvale", draft: true,
    shape: ring([108, 76], [115, 51], [140, 56], [148, 64], [150, 86], [122, 99]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "low-slime-kobold", music: "field" } },
  { id: "gv-orchard", name: "Orchard Ridge", zone: "greenvale", draft: true,
    shape: ring([115, 51], [150, 38], [189, 43], [182, 60], [148, 64], [140, 56]),
    identity: { biome: "orchard", tileset: "shire", encounterLean: "kobold-bandit", music: "field" } },
  { id: "gv-fields", name: "Bandit Fields", zone: "greenvale", draft: true,
    shape: ring([122, 99], [150, 86], [178, 78], [166, 100], [150, 111]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "bandit-mage", music: "field" } },
  { id: "gv-grove", name: "The Hidden Grove", zone: "greenvale", draft: true,
    shape: ring([150, 111], [166, 100], [178, 78], [182, 92], [182, 108]),
    identity: { biome: "forest", tileset: "shire", encounterLean: "rare-lair", music: "field" } },
  { id: "gv-warren-approach", name: "Warren Approach", zone: "greenvale", draft: true,
    shape: ring([189, 43], [208, 64], [204, 92], [182, 108], [182, 92], [178, 78], [150, 86], [148, 64], [182, 60]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "miniboss-gate", music: "field" } },

  // ── Silverwood (the Ancient Forest) — denser/darker old-growth, the same open mesh hushed by trees.
  //    The west Heartwood Crossing (spawn + central crossing), the north Fern Hollows, the NE Canopy
  //    Nook crest, the south Deep Mossbed (Mossback's lair), and the east Sunless-Grove Approach (the
  //    Sunless Grove mouth). Tiled; seams are root-trails + the deep mossbed front. ──
  { id: "sw-heartwood", name: "Heartwood Crossing", zone: "silverwood", draft: true,
    shape: ring([238, 68], [244, 42], [284, 52], [282, 68], [274, 82], [256, 86]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "wolf-thornling", music: "forest" } },
  { id: "sw-fern-hollows", name: "Fern Hollows", zone: "silverwood", draft: true,
    shape: ring([244, 42], [286, 34], [318, 42], [306, 72], [282, 68], [284, 52]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer-wisp", music: "forest" } },
  { id: "sw-canopy", name: "Canopy Nook", zone: "silverwood", draft: true,
    shape: ring([318, 42], [328, 42], [352, 64], [324, 80], [306, 72]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer", music: "forest" } },
  { id: "sw-mossbed", name: "Deep Mossbed", zone: "silverwood", draft: true,
    shape: ring([238, 68], [256, 86], [274, 82], [290, 88], [316, 90], [319, 108], [284, 108], [254, 92]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "rare-lair", music: "forest" } },
  { id: "sw-grove-approach", name: "Sunless-Grove Approach", zone: "silverwood", draft: true,
    shape: ring([352, 64], [346, 92], [319, 108], [316, 90], [290, 88], [274, 82], [282, 68], [306, 72], [324, 80]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "miniboss-gate", music: "forest" } },

  // ── The Duskmarsh — water-framed mire. The west mire-head Causeways (spawn/fork, wrapping the north
  //    & west banks), the Central Lagoon they loop around (open water, the finest pocket), the south
  //    Sunken Ruin (the flooded ruin + rare Metal-Babble lair), and the east Drowned-Vault Approach
  //    (the Drowned Vault mouth). Tiled; seams are the lagoon shore + the causeway banks. ──
  { id: "dm-causeways", name: "The Causeways", zone: "duskmarsh", draft: true,
    shape: ring([136, 138], [150, 122], [189, 119], [196, 134], [174, 138], [166, 160], [152, 166], [139, 163]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "rat-spider", music: "field" } },
  { id: "dm-lagoon", name: "The Central Lagoon", zone: "duskmarsh", draft: true,
    shape: ring([174, 138], [192, 144], [188, 162], [166, 160]),
    identity: { biome: "water", tileset: "mire", encounterLean: "spider-leper", music: "field" } },
  { id: "dm-sunken-ruin", name: "The Sunken Ruin", zone: "duskmarsh", draft: true,
    shape: ring([139, 163], [152, 166], [166, 160], [188, 162], [176, 182], [160, 181]),
    identity: { biome: "ruin", tileset: "mire", encounterLean: "rare-lair", music: "field" } },
  { id: "dm-vault-approach", name: "Drowned-Vault Approach", zone: "duskmarsh", draft: true,
    shape: ring([189, 119], [213, 138], [213, 166], [191, 183], [176, 182], [188, 162], [192, 144], [174, 138], [196, 134]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "miniboss-gate", music: "field" } },

  // ── Goldmeadow Plains (the Breadbasket) — wide, bright, exposed war-front farmland (L11–15). The
  //    open mesh of the prior zones, now long-sightline plains. The NW/W Open Wheat (spawn commons), the
  //    N farm-track shoulder (drystone walls/roads under Silverwood), the SW Creek Line (the crossing),
  //    the S burned Farmstead pocket (rare-monster lair), and the E Windmill Approach (the dungeon mouth
  //    — occupied windmill/granary). They TILE the plains blob (100% interior coverage, 0% overlap at the
  //    test grid); seams are the central farm-track, the creek bank, and the wall-line E of the farmstead.
  //    Plains/"goldmeadow" family on the placeholder "shire" tileset until Dara's wheat/wall/windmill art
  //    lands. Leans are CREATURE/TERRAIN flavor only (no Attunement — Dara's ruling). Names = DRAFT. ──
  { id: "gm-wheatfields", name: "The Open Wheat", zone: "goldmeadow", draft: true,
    shape: ring([239, 139], [247, 121], [300, 113], [300, 159], [266, 158], [245, 161]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "raider-skirmisher", music: "plains" } },
  { id: "gm-farmtracks", name: "The Farm Tracks", zone: "goldmeadow", draft: true,
    shape: ring([300, 113], [345, 127], [331, 148], [300, 150]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "raider-harrier", music: "plains" } },
  { id: "gm-creek", name: "The Creek Line", zone: "goldmeadow", draft: true,
    shape: ring([245, 161], [266, 158], [300, 159], [303, 171], [289, 184], [271, 179], [244, 162]),
    identity: { biome: "creek", tileset: "shire", encounterLean: "wolfpack-carrionbird", music: "plains" } },
  { id: "gm-farmstead", name: "The Burned Farmstead", zone: "goldmeadow", draft: true,
    shape: ring([300, 150], [300, 159], [303, 171], [289, 184], [313, 187], [332, 172], [331, 148]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "rare-lair", music: "plains" } },
  { id: "gm-windmill-approach", name: "Windmill Approach", zone: "goldmeadow", draft: true,
    shape: ring([345, 127], [361, 152], [349, 177], [313, 187], [332, 172], [331, 148]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "miniboss-gate", music: "plains" } },

  // ══ AURELION COMPLETE — the six newly-wired regions (world-cartographer, this build) ════════════════
  // Each is an ORGANIC TILING of its refined zone polygon (≥4 Areas, 100%/99.6% interior coverage, 0%
  // mutual overlap — verified in app/tests/world.test.ts), EAST lobe = the mouth/cave Area with the
  // "miniboss-gate" lean (the level-designer puts the entrance there). Biomes match the World Brief's
  // visuals; biome strings the field renderer doesn't yet special-case fall back to default ground (fine,
  // placeholder — art/level-designer dress them later). Leans are CREATURE/TERRAIN flavor only (no
  // Attunement — Dara's ruling). Names = DRAFT (flagged for Dara). Music keys per region are noted in the
  // hand-back so audio + the zone wiring align.

  // ── Storm Coast (Seafarer's Rest, W coast, L13–17, OPT) — a storm-lashed rock coast of wrecked hulls
  //    and smugglers' coves. W cove spawn, N cliffs, S wreck strand, E sea-cave (the optional cave mouth).
  //    Biome = rocky shore / breakers; music "stormcoast". ──
  { id: "sc-cove", name: "Smuggler's Cove", zone: "stormcoast", draft: true,
    shape: ring([86, 186], [94, 176], [116, 182], [118, 208], [108, 228], [92, 224], [84, 202]),
    identity: { biome: "coast", tileset: "coast", encounterLean: "wrecker-skirmisher", music: "stormcoast" } },
  { id: "sc-cliffs", name: "The Windward Cliffs", zone: "stormcoast", draft: true,
    shape: ring([94, 176], [124, 168], [146, 178], [136, 196], [118, 208], [116, 182]),
    identity: { biome: "rock", tileset: "coast", encounterLean: "seabeast-crab", music: "stormcoast" } },
  { id: "sc-strand", name: "The Wreck Strand", zone: "stormcoast", draft: true,
    shape: ring([92, 224], [108, 228], [126, 222], [136, 240], [110, 240]),
    identity: { biome: "beach", tileset: "coast", encounterLean: "serpent-wrecker", music: "stormcoast" } },
  { id: "sc-seacave", name: "The Sea-Cave Approach", zone: "stormcoast", draft: true,
    shape: ring([124, 168], [152, 180], [160, 202], [154, 226], [136, 240], [126, 222], [108, 228],
                [118, 208], [136, 196], [146, 178]),
    identity: { biome: "coast", tileset: "coast", encounterLean: "miniboss-gate", music: "stormcoast" } },

  // ── Riverhearth (Trade Capital, center, L15–18, OPT) — the capital's beset trade-road/river-wharf
  //    outskirts (the existing Riverhearth city is its hub). W wharves spawn, N trade road, central
  //    market, S riverbank, E smugglers' den (the optional cave mouth). Biome = riverside/road; music
  //    "riverhearth". ──
  { id: "rh-wharves", name: "The River Wharves", zone: "riverhearth", draft: true,
    shape: ring([258, 200], [286, 196], [290, 228], [270, 254], [266, 254], [248, 232], [248, 214]),
    identity: { biome: "riverside", tileset: "town", encounterLean: "rivertough-smuggler", music: "riverhearth" } },
  { id: "rh-tradeway", name: "The Trade Road", zone: "riverhearth", draft: true,
    shape: ring([258, 200], [300, 192], [330, 198], [322, 220], [290, 228], [286, 196]),
    identity: { biome: "road", tileset: "town", encounterLean: "roadbandit-skirmisher", music: "riverhearth" } },
  { id: "rh-market", name: "The Market Commons", zone: "riverhearth", draft: true,
    shape: ring([290, 228], [322, 220], [324, 244], [300, 252], [270, 254]),
    identity: { biome: "town", tileset: "town", encounterLean: "bandit-cutpurse", music: "riverhearth" } },
  { id: "rh-riverbank", name: "The Lower Riverbank", zone: "riverhearth", draft: true,
    shape: ring([270, 254], [300, 252], [324, 244], [326, 262], [294, 264]),
    identity: { biome: "riverside", tileset: "town", encounterLean: "rare-lair", music: "riverhearth" } },
  { id: "rh-smuggden", name: "The Smugglers' Den Approach", zone: "riverhearth", draft: true,
    shape: ring([330, 198], [342, 202], [360, 224], [352, 248], [326, 262], [324, 244], [322, 220]),
    identity: { biome: "riverside", tileset: "town", encounterLean: "miniboss-gate", music: "riverhearth" } },

  // ── Frostpeak Highlands (Dwarven Strongholds, E mountains, L16–20, SPINE) — the cold gate east: frozen
  //    peaks, glacial passes, the tunnels of a silent dwarven hold. W glacial pass spawn, N frozen ridge,
  //    central glacier, S undervault, E hold-gate (the SPINE dungeon mouth). Biome = snow/ice/stone;
  //    music "frostpeak". ──
  { id: "fp-pass", name: "The Glacial Pass", zone: "frostpeak", draft: true,
    shape: ring([380, 150], [400, 151], [396, 184], [380, 204], [370, 182], [370, 166]),
    identity: { biome: "snow", tileset: "frost", encounterLean: "icewolf-reaver", music: "frostpeak" } },
  { id: "fp-ridge", name: "The Frozen Ridge", zone: "frostpeak", draft: true,
    shape: ring([380, 150], [414, 142], [446, 152], [438, 170], [412, 172], [400, 151]),
    identity: { biome: "snow", tileset: "frost", encounterLean: "reaver-sentinel", music: "frostpeak" } },
  { id: "fp-glacier", name: "The Hanging Glacier", zone: "frostpeak", draft: true,
    shape: ring([400, 151], [412, 172], [418, 200], [396, 184]),
    identity: { biome: "ice", tileset: "frost", encounterLean: "frostbeast-yeti", music: "frostpeak" } },
  { id: "fp-undervault", name: "The Sunken Hold", zone: "frostpeak", draft: true,
    shape: ring([380, 204], [396, 184], [418, 200], [420, 218], [402, 218]),
    identity: { biome: "stone", tileset: "frost", encounterLean: "rare-lair", music: "frostpeak" } },
  { id: "fp-holdgate", name: "The Hold-Gate Approach", zone: "frostpeak", draft: true,
    shape: ring([446, 152], [458, 176], [452, 202], [432, 218], [420, 218], [418, 200], [412, 172],
                [438, 170]),
    identity: { biome: "stone", tileset: "frost", encounterLean: "miniboss-gate", music: "frostpeak" } },

  // ── Dawnfall Hold (Frontier Watch, SW, L17–21, OPT) — a breached frontier fortress that held back the
  //    wilds and lost. W watchwall spawn, N rampart, S muster yard, E breached undervault (the optional
  //    cave mouth). Biome = ruined-keep / grim highland; music "dawnfall". ──
  { id: "df-wall", name: "The Watchwall", zone: "dawnfall", draft: true,
    shape: ring([148, 250], [176, 246], [180, 272], [170, 294], [156, 280], [148, 266]),
    identity: { biome: "highland", tileset: "ruin", encounterLean: "fallenwatch-wildthing", music: "dawnfall" } },
  { id: "df-rampart", name: "The Broken Rampart", zone: "dawnfall", draft: true,
    shape: ring([148, 250], [182, 244], [202, 250], [196, 270], [180, 272], [176, 246]),
    identity: { biome: "ruin", tileset: "ruin", encounterLean: "wildthing-reaver", music: "dawnfall" } },
  { id: "df-muster", name: "The Muster Yard", zone: "dawnfall", draft: true,
    shape: ring([170, 294], [180, 272], [196, 270], [200, 288], [192, 296]),
    identity: { biome: "ruin", tileset: "ruin", encounterLean: "rare-lair", music: "dawnfall" } },
  { id: "df-undervault", name: "The Undervault Approach", zone: "dawnfall", draft: true,
    shape: ring([202, 250], [210, 254], [222, 272], [214, 288], [192, 296], [200, 288], [196, 270]),
    identity: { biome: "ruin", tileset: "ruin", encounterLean: "miniboss-gate", music: "dawnfall" } },

  // ── Whisper Hills (Monastery Land, SE, L19–23, OPT) — quiet green monastic hills hiding a dark secret
  //    beneath a silent monastery. W cloister spawn, N greens, S crypt path, E reliquary (the optional
  //    cave mouth). Biome = green hills / sacred; music "whisperhills". ──
  { id: "wh-cloister", name: "The Silent Cloister", zone: "whisperhills", draft: true,
    shape: ring([346, 266], [356, 250], [378, 254], [384, 276], [372, 290], [352, 282]),
    identity: { biome: "hills", tileset: "monastery", encounterLean: "spirit-monk", music: "whisperhills" } },
  { id: "wh-greens", name: "The Monastery Greens", zone: "whisperhills", draft: true,
    shape: ring([356, 250], [390, 244], [418, 256], [410, 270], [384, 276], [378, 254]),
    identity: { biome: "hills", tileset: "monastery", encounterLean: "monk-wraith", music: "whisperhills" } },
  { id: "wh-cryptpath", name: "The Crypt Path", zone: "whisperhills", draft: true,
    shape: ring([352, 282], [372, 290], [396, 294], [396, 300], [370, 296]),
    identity: { biome: "hills", tileset: "monastery", encounterLean: "rare-lair", music: "whisperhills" } },
  { id: "wh-reliquary", name: "The Reliquary Approach", zone: "whisperhills", draft: true,
    shape: ring([418, 256], [428, 276], [418, 292], [396, 300], [396, 294], [372, 290], [384, 276],
                [410, 270]),
    identity: { biome: "hills", tileset: "monastery", encounterLean: "miniboss-gate", music: "whisperhills" } },

  // ── Sunbridge (Port City, S port, L21–25, SPINE FINALE) — the grand southern sea-port under siege,
  //    Aurelion's climax. W quays spawn, N seawall, central plaza, S harbor, E citadel/lighthouse (the
  //    FINALE dungeon mouth). Biome = harbor/city-coast; music "sunbridge". ──
  { id: "sb-quays", name: "The Quays", zone: "sunbridge", draft: true,
    shape: ring([270, 284], [274, 272], [296, 276], [298, 300], [286, 308], [274, 296]),
    identity: { biome: "harbor", tileset: "port", encounterLean: "searaider-besieger", music: "sunbridge" } },
  { id: "sb-seawall", name: "The Seawall", zone: "sunbridge", draft: true,
    shape: ring([274, 272], [306, 266], [318, 272], [310, 288], [298, 300], [296, 276]),
    identity: { biome: "coast", tileset: "port", encounterLean: "besieger-captain", music: "sunbridge" } },
  { id: "sb-plaza", name: "The Harbor Plaza", zone: "sunbridge", draft: true,
    shape: ring([298, 300], [310, 288], [320, 302], [308, 314], [286, 308]),
    identity: { biome: "harbor", tileset: "port", encounterLean: "raider-deepthing", music: "sunbridge" } },
  { id: "sb-citadel", name: "The Citadel Approach", zone: "sunbridge", draft: true,
    shape: ring([306, 266], [332, 278], [342, 296], [332, 308], [308, 314], [320, 302], [310, 288],
                [318, 272]),
    identity: { biome: "harbor", tileset: "port", encounterLean: "miniboss-gate", music: "sunbridge" } },
];

// ══════════════════════════════════════════════════════════════════════════════════════════════════
// THE UNDERWORLD — *The Forgotten Civilization* (atlas §2) ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════════════════════════
// The second seamless coordinate space (same 960×640 frame as the surface). A ROUGH "does-it-fit"
// placement pass, the underworld sibling of the overworld trace above: every one of Dara's 13 canon
// complexes painted as an ORGANIC polygon in its map-correct spot at one consistent scale, so the
// deep stops being blank and we can see the underground fits. "Rough is the point" — relative
// position/size over fine outlines.
//
// HIERARCHY CHOICE (Map › Continent › Zone › Area). The underworld is NOT split into the four surface
// continents — it is one planet-spanning machine-city. So we model it as ONE underworld "continent",
// **The Forgotten Civilization** (the map's own title for the realm), whose `shape` is a single broad
// cavern-network envelope filling the central frame. The 13 complexes are its ZONE-regions (all
// `draft` — nothing is playable underground yet). No Areas are painted (that's a per-complex build
// job for later). This keeps regionAt / the viewer's continent→zone→area drill working unchanged.
//
// SCALE PEG — same map-px→tile peg as the surface: a complex traced at map-fraction (fx,fy) sits at
// tile (fx·960, fy·640). Label positions read off `assets/reference/map-underworld-gaia.png`.
//
// SURFACE↔UNDERWORLD ALIGNMENT (atlas §2 "Surface ↔ underworld links"). Three complexes are named
// "under" a surface continent; we place them in the matching overworld quadrant so the two maps
// relate: Aurelion Access Shafts → NW (under Aurelion), Anima Deep Halls → NE (under Varkhaz),
// Myr'Thalas Gateways → SW (under Myr'Thalas). See FLAGS-FOR-DARA at the foot of this block (G8).
export const FORGOTTEN_ID = "forgotten-civilization";

// The realm envelope: one organic cavern-network shell filling the central underworld frame (the
// map's edges are legend/lore panels, not cavern — the network lives in the middle). Every complex
// nests inside this shell.
const FORGOTTEN_SHELL = ring(
  [60, 70], [160, 36], [300, 28], [440, 24], [560, 30], [660, 36], [780, 60], [860, 96],
  [892, 150], [880, 210], [892, 270], [868, 330], [820, 388], [760, 420], [700, 432],
  [640, 420], [580, 432], [520, 422], [460, 436], [400, 424], [340, 432], [280, 418],
  [220, 428], [150, 408], [96, 360], [64, 300], [78, 240], [54, 180], [72, 120],
);

export const UNDERWORLD_CONTINENTS: Continent[] = [
  { id: FORGOTTEN_ID, name: "The Forgotten Civilization", map: UNDERWORLD_ID, shape: FORGOTTEN_SHELL },
];

// The 13 complexes as zone-regions (atlas §2 table), all draft. Positions traced from the canon
// underworld map; "rough is the point". Each is an organic blob (cavern / facility footprint), sized
// so the central Worldroot reads largest (the heart) and the network has breathing room around it.
export const UNDERWORLD_ZONE_REGIONS: ZoneRegion[] = [
  // ── CENTRAL HEART ──
  // The Worldroot Complex — the planetary core city, the heart of everything. Largest footprint,
  // top-CENTER, the hub the whole network fans out from.
  { id: "uw-worldroot", name: "The Worldroot Complex", continent: FORGOTTEN_ID, draft: true,
    shape: ring([372, 60], [420, 46], [470, 52], [496, 78], [500, 112], [486, 142], [452, 158],
                [412, 156], [378, 140], [358, 110], [356, 82]) },

  // ── UPPER BAND (NW → NE) ──
  // Aurelion Access Shafts — NW, under Aurelion (surface entry shafts).
  { id: "uw-aurelion-shafts", name: "Aurelion Access Shafts", continent: FORGOTTEN_ID, draft: true,
    shape: ring([176, 56], [216, 44], [256, 52], [274, 76], [268, 102], [240, 116], [204, 112],
                [178, 94], [168, 74]) },
  // Anima Deep Halls — NE, under Varkhaz (biodomes + Planetary Seed Vaults).
  { id: "uw-anima-halls", name: "Anima Deep Halls", continent: FORGOTTEN_ID, draft: true,
    shape: ring([566, 52], [610, 42], [656, 52], [676, 78], [668, 106], [636, 120], [596, 114],
                [566, 92], [556, 70]) },
  // The Bioengineering Biosphere — Upper NE, far-right (living laboratories / ecosystems in stasis).
  { id: "uw-biosphere", name: "The Bioengineering Biosphere", continent: FORGOTTEN_ID, draft: true,
    shape: ring([758, 116], [800, 106], [842, 120], [856, 148], [846, 178], [812, 192], [772, 182],
                [748, 156], [746, 134]) },

  // ── MID BAND (W → E) ──
  // The Transit Nexus — West-Central, the hub of the maglev/conduit network.
  { id: "uw-transit-nexus", name: "The Transit Nexus", continent: FORGOTTEN_ID, draft: true,
    shape: ring([186, 158], [228, 148], [268, 160], [282, 186], [272, 214], [238, 226], [200, 216],
                [176, 190], [174, 172]) },
  // The Celestial Archive — Upper-Central (libraries, data vaults, simulation spires).
  { id: "uw-celestial-archive", name: "The Celestial Archive", continent: FORGOTTEN_ID, draft: true,
    shape: ring([372, 168], [414, 158], [456, 170], [470, 196], [460, 222], [426, 234], [388, 224],
                [364, 198], [362, 180]) },
  // Titan Core Prime — Central-East, the command core of the AI project.
  { id: "uw-titan-core", name: "Titan Core Prime", continent: FORGOTTEN_ID, draft: true,
    shape: ring([512, 166], [554, 156], [596, 168], [610, 196], [600, 224], [566, 236], [526, 224],
                [502, 196], [502, 178]) },
  // Varkhaz Deep Mines — East, industrial excavation piercing the mantle (heavily defended).
  { id: "uw-varkhaz-mines", name: "Varkhaz Deep Mines", continent: FORGOTTEN_ID, draft: true,
    shape: ring([644, 160], [688, 150], [732, 162], [748, 190], [738, 220], [702, 234], [662, 222],
                [638, 192], [636, 174]) },

  // ── LOWER BAND (SW → SE) ──
  // The Myr'Thalas Gateways — SW, under Myr'Thalas (stargate terminals to orbital docks/colonies).
  { id: "uw-myrthalas-gateways", name: "The Myr'Thalas Gateways", continent: FORGOTTEN_ID, draft: true,
    shape: ring([96, 224], [138, 214], [178, 228], [192, 256], [182, 286], [146, 298], [108, 284],
                [86, 254], [86, 238]) },
  // The Silent Vaults — Central-South, sealed districts / dark storage realms.
  { id: "uw-silent-vaults", name: "The Silent Vaults", continent: FORGOTTEN_ID, draft: true,
    shape: ring([238, 256], [280, 246], [322, 258], [336, 286], [326, 314], [292, 326], [252, 314],
                [228, 286], [228, 270]) },
  // The Infinite Foundries — SE Inner, automated fabrication caverns.
  { id: "uw-infinite-foundries", name: "The Infinite Foundries", continent: FORGOTTEN_ID, draft: true,
    shape: ring([496, 286], [538, 276], [580, 288], [594, 316], [584, 344], [550, 356], [510, 344],
                [486, 316], [486, 300]) },
  // The Abyssal Conduit — South-Central, a chasm of unstable energy toward the planetary core.
  { id: "uw-abyssal-conduit", name: "The Abyssal Conduit", continent: FORGOTTEN_ID, draft: true,
    shape: ring([366, 312], [406, 302], [444, 316], [456, 344], [446, 374], [410, 388], [372, 374],
                [350, 344], [350, 328]) },
  // The Forge Cities — SE, gigantic foundries with rivers of molten metal.
  { id: "uw-forge-cities", name: "The Forge Cities", continent: FORGOTTEN_ID, draft: true,
    shape: ring([632, 256], [676, 246], [718, 260], [732, 288], [722, 318], [686, 330], [646, 316],
                [624, 286], [624, 270]) },
];

// FLAGS FOR DARA (underworld geography the canon map leaves open or this rough pass had to infer):
//   • REALM / CONTINENT NAME. I modeled the whole underworld as ONE "continent" named **The Forgotten
//     Civilization** (the map's title for the realm) containing the 13 complexes as zones. If you'd
//     rather split the deep into a few broad districts (e.g. an Upper/Core/Deep band) as the continent
//     layer, say so and I'll re-cut the hierarchy.
//   • SURFACE↔UNDERWORLD ALIGNMENT (atlas G8). Three complexes are named "under" a surface continent
//     and are placed in the matching quadrant (Aurelion Access Shafts NW, Anima Deep Halls NE,
//     Myr'Thalas Gateways SW). The OTHER ten complexes have NO named surface continent above them —
//     the canon underworld layout does NOT mirror the four surface continents (the deep is its own
//     planet-spanning city). No under-Sundering / under-Great-Expanse entrance is named on either map.
//     If you want the deep to mirror the surface quadrants, tell me which complex sits under which.
//   • ALL 13 COMPLEX OUTLINES are ROUGH traces of the map's label positions at a consistent scale —
//     correct relative position/size, not final cavern outlines. Names are yours (from the map).
//   • THE TRANSIT NETWORK (the maglev/conduit lines + Nexus Gate Network linking the complexes) is the
//     underworld's connection graph — still OPEN (the surface G7 sibling). This pass locks WHERE the
//     complexes are, not yet HOW the conduits link them.

// ── The combined registries (surface + underworld), keyed by `map`/`continent` ───────────────────
// One flat list across BOTH maps; every consumer (regionAt, the World Map viewer, tests) already
// scopes by `map` / `continent`, so the two coordinate spaces never bleed into each other.
export const CONTINENTS: Continent[] = [...SURFACE_CONTINENTS, ...UNDERWORLD_CONTINENTS];
export const ZONE_REGIONS: ZoneRegion[] = [...SURFACE_ZONE_REGIONS, ...UNDERWORLD_ZONE_REGIONS];

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
 * the named map (pass "overworld" or "underworld"); a complex/region resolves only within its map.
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

// ── Placement bridge (seamless big-map, Stage 2A) — authored grids → world space ──────────────────
// The CRUX of the seamless overworld (docs/design/seamless-overworld-plan.md): each built zone has
// BOTH an authored playable grid (`data/zones.ts` ZoneLayout — Greenvale 64×24, Silverwood 60×24,
// Duskmarsh 56×22, with roads/chests/lair/mouth, anti-soft-lock-tuned) AND an organic GEOGRAPHY
// polygon here (`ZONE_REGIONS`). This bridge places the authored grid into the one 960×640 world
// coordinate space at SCALE 1:1 (one authored tile = one world tile, no stretch), CENTERED on the
// zone polygon's CENTROID — so the dense hand-built core sits in the middle of the larger, sparser
// organic polygon (the interior outside the core becomes procedural open ground in a later stage).
//
// CENTERING METHOD. `wx,wy` is the world tile where the authored grid's local (0,0) sits, chosen so
// the grid's w×h rect is centered on the polygon's CENTROID. The centroid is the area-weighted
// SHOELACE centroid (`polyCentroid` below) — the true center of mass of the organic shape, not the
// bbox center (the two coincide here to <1 tile since the traced polygons are near-symmetric, but the
// shoelace centroid is the principled choice for an irregular coastline). `wx = round(cx − w/2)`,
// `wy = round(cy − h/2)`.
//
// PURE DATA ONLY (ADR 0005), NO engine consumer yet (Stage 2A). `regionAt` stays the identity source
// of truth (unchanged). Stage 2B+ reads `authoredAt` to REALIZE the authored tile under a world coord.
//
// FIT CHECK (see app/tests/placement.test.ts): each authored grid is SMALLER than its polygon's bbox
// (a dense core inside a sparser blob), every placement rect lies within its polygon's bbox, the three
// rects don't overlap, and each zone's authored spawn/mouth/lair/chests map to world coords that land
// INSIDE the zone polygon — i.e. the core sits sensibly in the geography. All three zones fit cleanly.

/** A built zone's authored-grid placement in world space (Stage 2A). Scale is always 1 (no stretch). */
export interface ZonePlacement {
  /** World tile where the authored grid's local (0,0) sits (so the grid is centered on the centroid). */
  wx: number;
  wy: number;
  /** One authored tile = one world tile. */
  scale: 1;
}

/**
 * The area-weighted (shoelace) CENTROID of a polygon — its center of mass. Orientation-agnostic
 * (the sign of the signed area cancels). Used to center each authored grid on its zone polygon.
 */
export function polyCentroid(poly: Polygon): Point {
  let a2 = 0, cx = 0, cy = 0;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i], q = poly[(i + 1) % n];
    const cross = p.x * q.y - q.x * p.y;
    a2 += cross;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  // a2 = 2·signedArea; centroid = Σ(p+q)·cross / (6·signedArea).
  if (a2 === 0) { const b = bbox(poly); return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }; }
  return { x: cx / (3 * a2), y: cy / (3 * a2) };
}

// The placement table for the three BUILT zones. Each `(wx,wy)` is computed so the authored grid
// (w×h from its ZoneLayout) is centered on the zone polygon's shoelace centroid:
//   greenvale  (64×24) centroid ≈ (159, 74)  → wx,wy = (127, 62)   rect [127,62)..[191,86)
//   silverwood (60×24) centroid ≈ (295, 71)  → wx,wy = (265, 59)   rect [265,59)..[325,83)
//   duskmarsh  (56×22) centroid ≈ (176, 151) → wx,wy = (148, 140)  rect [148,140)..[204,162)
// (Hard-coded — pure data the engine reads at startup — but derived exactly by `polyCentroid` above;
// the test recomputes them from the polygons + ZoneLayouts to guard against drift.)
//   goldmeadow (60×24) centroid ≈ (299, 149) → wx,wy = (269, 137)  rect [269,137)..[329,161)
// AURELION COMPLETE (world-builder 2026-06-21) — the remaining six, each centered on its polygon
// centroid (round(centroid − dims/2)); all fit inside their polygon bbox + the placement test recomputes:
//   stormcoast   (52×22) centroid ≈ (121.9,204.3) → (96, 193)   rect [96,193)..[148,215)
//   riverhearth  (52×22) centroid ≈ (302.5,227.8) → (277, 217)  rect [277,217)..[329,239)
//   frostpeak    (60×24) centroid ≈ (413.5,180.3) → (384, 168)  rect [384,168)..[444,192)
//   dawnfall     (52×22) centroid ≈ (183.7,269.7) → (158, 259)  rect [158,259)..[210,281)
//   whisperhills (52×22) centroid ≈ (386.8,271.9) → (361, 261)  rect [361,261)..[413,283)
//   sunbridge    (60×24) centroid ≈ (304.9,290.0) → (275, 278)  rect [275,278)..[335,302)
export const WORLD_PLACEMENT: Record<string, ZonePlacement> = {
  greenvale: { wx: 127, wy: 62, scale: 1 },
  silverwood: { wx: 265, wy: 59, scale: 1 },
  duskmarsh: { wx: 148, wy: 140, scale: 1 },
  goldmeadow: { wx: 269, wy: 137, scale: 1 },
  stormcoast: { wx: 96, wy: 193, scale: 1 },
  riverhearth: { wx: 277, wy: 217, scale: 1 },
  frostpeak: { wx: 384, wy: 168, scale: 1 },
  dawnfall: { wx: 158, wy: 259, scale: 1 },
  whisperhills: { wx: 361, wy: 261, scale: 1 },
  sunbridge: { wx: 275, wy: 278, scale: 1 },
};

/** A built zone's authored-grid placement in world space, or undefined if the zone isn't placed. */
export function placementOf(zoneId: string): ZonePlacement | undefined {
  return WORLD_PLACEMENT[zoneId];
}

/**
 * A placed zone's authored grid as a WORLD-SPACE rectangle (half-open [x0,x1) × [y0,y1)), using the
 * authored grid's w×h from its ZoneLayout. undefined if the zone isn't placed (or has no layout).
 */
export function worldDimsOf(zoneId: string): { x0: number; y0: number; x1: number; y1: number } | undefined {
  const p = WORLD_PLACEMENT[zoneId];
  const z = ZONES.find((zz) => zz.id === zoneId);
  if (!p || !z) return undefined;
  return { x0: p.wx, y0: p.wy, x1: p.wx + z.layout.w, y1: p.wy + z.layout.h };
}

/**
 * REALIZATION lookup (Stage 2A data, consumed by the Stage 2B renderer): if a world tile falls inside
 * some built zone's placement rect, return that zone + the authored LOCAL coords (`lx = wx − placement.wx`,
 * `ly = wy − placement.wy`); else undefined (the tile is procedural open ground / uncharted). Placement
 * rects don't overlap (asserted in the test), so first-match is also finest-match.
 *
 * NOTE this is the REALIZATION axis (which authored tile sits here), independent of `regionAt` which is
 * the IDENTITY axis (which Area/Zone/Continent owns the tile — biome/encounter-lean/music). The plan's
 * two-lookup model: identity works everywhere; realization only inside a placed authored core.
 */
export function authoredAt(wx: number, wy: number): { zoneId: string; lx: number; ly: number } | undefined {
  for (const zoneId of Object.keys(WORLD_PLACEMENT)) {
    const d = worldDimsOf(zoneId);
    if (d && wx >= d.x0 && wx < d.x1 && wy >= d.y0 && wy < d.y1) {
      return { zoneId, lx: wx - WORLD_PLACEMENT[zoneId].wx, ly: wy - WORLD_PLACEMENT[zoneId].wy };
    }
  }
  return undefined;
}

/** A BUILT zone's geography polygon (the organic shape on the world map), or undefined. */
export function zonePolygonOf(zoneId: string): Polygon | undefined {
  return ZONE_REGIONS.find((z) => z.id === zoneId && z.zone === zoneId)?.shape;
}

/**
 * Is a world tile inside a built zone's geography POLYGON? Used by the Stage-2B realizer to decide
 * procedural OPEN-GROUND fill (inside the polygon, outside the authored core) vs UNCHARTED (outside
 * the polygon — the impassable soft edge). Pure point-in-polygon. (Cheap; the realizer caches the
 * per-cell result by chunk so this is never on the per-frame draw path.)
 */
export function inZonePolygon(zoneId: string, wx: number, wy: number): boolean {
  const poly = zonePolygonOf(zoneId);
  return poly ? pointInPolygon(poly, wx, wy) : false;
}

// ── Stage 2B realization (PURE) — the authored blueprint + the per-tile realization kind ──────────
// These are the PURE half of the chunk realizer (ADR 0005): the controller (field.ts) owns the chunk
// CACHE + RENDER, but the deterministic data — what authored tile sits at a world coord, and whether a
// world coord is open ground / uncharted — lives here so it is unit-testable WITHOUT the DOM. The
// scatter + flood-repair use the SAME stable per-tile hash the renderer uses (never Math.random), so
// the same chunk realizes identically every time (the determinism guarantee Stage 2B requires).

/** A stable, allocation-free per-tile hash in [0,1) — the only randomness in realization. */
export function tileHash(x: number, y: number): number {
  return (((x * 73856093) ^ (y * 19349663)) >>> 0) / 0xffffffff;
}

/** Realization WALL kinds (impassable + flood barriers) — mirrors field.ts FIELD_WALLS. */
const REALIZE_WALLS = new Set(["tree", "water", "uncharted"]);

/**
 * Build a placed zone's AUTHORED OVERWORLD blueprint as a LOCAL string[][] of tile kinds — the dense
 * hand-built core that gets windowed into world space. Pure + deterministic (the scatter uses tileHash,
 * not Math.random) and anti-soft-lock (flood-repairs the mouth + every chest/lair reachable from spawn).
 * `miniDefeated` swaps the mouth tile guard for the enterable mouth (so the realizer reflects progress).
 */
export function buildAuthoredGrid(zoneId: string, miniDefeated = false): string[][] {
  const z = ZONES.find((zz) => zz.id === zoneId);
  if (!z) return [];
  const L = z.layout, W = L.w, H = L.h;
  const grid: string[][] = Array.from({ length: H }, () => Array.from({ length: W }, () => "tree"));
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < W - 1 && y < H - 1;
  const carve = (x: number, y: number, k: string) => { if (inB(x, y)) grid[y][x] = k; };
  const carveRect = (r: Rect) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass"); };
  L.fieldRects.forEach(carveRect);
  const carveSeg = (a: Pt, b: Pt) => {
    let cx = a.x, cy = a.y; const c = (x: number, y: number) => { if (inB(x, y)) grid[y][x] = "path"; };
    c(cx, cy);
    while (cx !== b.x) { cx += Math.sign(b.x - cx); c(cx, cy); }
    while (cy !== b.y) { cy += Math.sign(b.y - cy); c(cx, cy); }
  };
  L.fieldPaths.forEach((p) => { for (let i = 1; i < p.length; i++) carveSeg(p[i - 1], p[i]); });
  const dens = L.scatter ?? 0.06;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++)
    if (grid[y][x] === "grass" && tileHash(x, y) < dens) grid[y][x] = tileHash(y, x) < 0.6 ? "bush" : "rock";
  if (L.water) for (const w of L.water) for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++) if (inB(x, y)) grid[y][x] = "water";
  const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && grid[yy][xx] === "tree") grid[yy][xx] = "grass"; } };
  L.chests.forEach((c) => { halo(c); carve(c.x, c.y, "chest"); });
  if (L.lair) { halo(L.lair); carve(L.lair.x, L.lair.y, "lair"); }
  halo(L.mouth); grid[L.mouth.y][L.mouth.x] = miniDefeated ? "mouth" : "miniboss";
  carve(L.spawn.x, L.spawn.y, "path");
  const targets: Pt[] = [L.mouth, ...L.chests]; if (L.lair) targets.push(L.lair);
  repairAuthoredGrid(grid, L.spawn, targets);
  return grid;
}

/** Flood-fill repair on a standalone authored grid: punch an L-corridor to any walled-off target. */
export function repairAuthoredGrid(grid: string[][], spawn: Pt, targets: Pt[]): void {
  const H = grid.length, W = grid[0]?.length ?? 0;
  if (!W) return;
  const flood = (s: Pt) => {
    const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
    const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !REALIZE_WALLS.has(grid[y][x]);
    const q: Pt[] = []; if (open(s.x, s.y)) { seen[s.y][s.x] = true; q.push(s); }
    while (q.length) { const { x, y } = q.shift()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); } } }
    return seen;
  };
  let seen = flood(spawn);
  for (const t of targets) {
    if (seen[t.y]?.[t.x]) continue;
    let best: Pt | null = null, bd = Infinity;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (seen[y][x]) { const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd) { bd = d; best = { x, y }; } }
    if (best) {
      let cx = best.x, cy = best.y;
      const step = (x: number, y: number) => { if (x > 0 && y > 0 && x < W - 1 && y < H - 1 && REALIZE_WALLS.has(grid[y][x])) grid[y][x] = "path"; };
      while (cx !== t.x) { cx += Math.sign(t.x - cx); step(cx, cy); }
      while (cy !== t.y) { cy += Math.sign(t.y - cy); step(cx, cy); }
      seen = flood(spawn);
    }
  }
}

/**
 * The REALIZATION kind of a WORLD tile for a placed zone (the two-lookup model, realization axis):
 * inside the authored placement rect → that authored cell's kind; else inside the zone polygon →
 * "grass" (procedural open ground); else "uncharted" (the impassable soft edge). Pure — the controller
 * passes the prebuilt authored grid so this never rebuilds it per tile.
 */
export function realizeKind(zoneId: string, authoredGrid: string[][], wx: number, wy: number): string {
  const a = authoredAt(wx, wy);
  if (a && a.zoneId === zoneId && authoredGrid[a.ly]) return authoredGrid[a.ly][a.lx];
  if (inZonePolygon(zoneId, wx, wy)) return "grass";
  return "uncharted";
}

/**
 * WORLD-SPACE reachability: from a placed zone's authored spawn (in world coords), can the player reach
 * every world target across the realized world (authored core + procedural open fill, uncharted/walls
 * blocking)? A BFS over realized kinds, bounded to the zone polygon's bbox + a margin. Returns the set
 * of targets NOT reached (empty == all reachable). PURE — used by the reachability test (no soft-lock).
 */
export function unreachableWorldTargets(zoneId: string, authoredGrid: string[][], spawnW: Pt, targetsW: Pt[]): Pt[] {
  const poly = zonePolygonOf(zoneId);
  if (!poly) return targetsW.slice();
  const b = bbox(poly), m = 4;
  const x0 = b.minX - m, y0 = b.minY - m, x1 = b.maxX + m, y1 = b.maxY + m;
  const open = (x: number, y: number) => x >= x0 && y >= y0 && x <= x1 && y <= y1 && !REALIZE_WALLS.has(realizeKind(zoneId, authoredGrid, x, y));
  const seen = new Set<string>();
  const key = (x: number, y: number) => x + "," + y;
  const q: Pt[] = [];
  if (open(spawnW.x, spawnW.y)) { seen.add(key(spawnW.x, spawnW.y)); q.push(spawnW); }
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); q.push({ x: nx, y: ny }); }
    }
  }
  return targetsW.filter((t) => !seen.has(key(t.x, t.y)));
}

// ── Stage 2C: CONTINENT-WIDE realization (the G22 correction) ─────────────────────────────────────
// The 2B rule was ZONE-scoped: walkable == authored core OR inside the ONE zone's polygon, else
// uncharted. The organic re-paint put Greenvale and Silverwood ~136 tiles APART inside Aurelion
// (world-atlas §4 G22), so the seamless proof is a CONTINENTAL roam, not a shared-zone-seam crossing.
// The revised rule (G22): a world tile is walkable PROCEDURAL OPEN GROUND if it is inside ANY continent
// polygon; built-zone authored cores still come from `authoredAt`; ONLY ocean (off every continent) or
// the world edge is impassable "uncharted". This makes the whole continent interior roamable — dense
// authored cores set in open continent, the open land bridging them.
//
// PURE (ADR 0005): these mirror the zone-scoped helpers above but operate at the continent grain. The
// controller caches the per-cell result by chunk so `regionAt`/point-in-polygon never hit the frame path.

/** The continent whose polygon contains a world tile (overworld map), or undefined (ocean / edge). */
export function continentAt(mapId: string, x: number, y: number): Continent | undefined {
  return CONTINENTS.find((c) => c.map === mapId && pointInPolygon(c.shape, x, y));
}

/** Is a world tile inside ANY continent polygon on the given map? (false == ocean / off-map = uncharted.) */
export function inAnyContinent(mapId: string, x: number, y: number): boolean {
  return !!continentAt(mapId, x, y);
}

/**
 * CONTINENT-WIDE realization kind for a world tile (the G22 two-lookup model, realization axis): any
 * built zone's authored core → that authored cell's kind; else inside ANY continent → "grass"
 * (procedural open ground — the whole continent interior is walkable); else "uncharted" (ocean / the
 * world edge — the impassable soft boundary). `authoredGrids` is a prebuilt blueprint per built zone
 * id (built once on enter), so this never rebuilds a grid per tile. Pure + deterministic.
 *
 * CORE↔CONTINENT BRIDGING (G22): each authored grid is a fully tree-WALLED rectangle (its outer ring is
 * always "tree" by construction), which in a CONTINENTAL roam would seal the dense core off from the
 * open land around it. So the grid's OUTER BORDER RING falls through to the continent rule (open ground)
 * — the authored INTERIOR (where all spawn/road/chest/mouth content lives, carved within the inner box)
 * is realized verbatim, but the sacrificial wall ring opens, so the core connects seamlessly to the
 * continent it sits in. Interior tree scatter is untouched (it's decoration, not a boundary).
 */
export function realizeKindWorld(
  mapId: string, authoredGrids: Record<string, string[][]>, wx: number, wy: number,
): string {
  const a = authoredAt(wx, wy);
  if (a) {
    const g = authoredGrids[a.zoneId];
    if (g && g[a.ly]) {
      const onBorder = a.lx === 0 || a.ly === 0 || a.ly === g.length - 1 || a.lx === g[a.ly].length - 1;
      if (!onBorder) return g[a.ly][a.lx];   // authored interior verbatim
      // border ring: fall through to the continent rule so the core isn't sealed off (G22).
    }
  }
  if (inAnyContinent(mapId, wx, wy)) return "grass";
  return "uncharted";
}

/**
 * CONTINENT-WIDE reachability (the G22 proof): from a spawn world tile, BFS across the realized
 * continent (every built core + the open continent that bridges them; ocean/walls block) and return
 * the targets NOT reached. Bounded to a bbox over the targets + spawn + a margin so it stays cheap.
 * PURE — used by the Stage-2C reachability test (Greenvale spawn → Silverwood core / the Duskmarsh).
 */
export function unreachableContinentTargets(
  mapId: string, authoredGrids: Record<string, string[][]>, spawnW: Pt, targetsW: Pt[],
): Pt[] {
  let minX = spawnW.x, minY = spawnW.y, maxX = spawnW.x, maxY = spawnW.y;
  for (const t of targetsW) { minX = Math.min(minX, t.x); minY = Math.min(minY, t.y); maxX = Math.max(maxX, t.x); maxY = Math.max(maxY, t.y); }
  const m = 12;
  const x0 = minX - m, y0 = minY - m, x1 = maxX + m, y1 = maxY + m;
  const open = (x: number, y: number) =>
    x >= x0 && y >= y0 && x <= x1 && y <= y1 && !REALIZE_WALLS.has(realizeKindWorld(mapId, authoredGrids, x, y));
  const seen = new Set<string>();
  const key = (x: number, y: number) => x + "," + y;
  const q: Pt[] = [];
  if (open(spawnW.x, spawnW.y)) { seen.add(key(spawnW.x, spawnW.y)); q.push(spawnW); }
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); q.push({ x: nx, y: ny }); }
    }
  }
  return targetsW.filter((t) => !seen.has(key(t.x, t.y)));
}
