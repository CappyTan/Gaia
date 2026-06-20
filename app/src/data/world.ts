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

  // ── BACKLOG (named on the map; draft) ──
  // #3 Goldmeadow Plains (Breadbasket) — center, S of Silverwood.
  { id: "goldmeadow", name: "Goldmeadow Plains", continent: AURELION_ID, draft: true,
    shape: ring([248, 122], [300, 114], [344, 128], [360, 152], [348, 176], [312, 186], [272, 178],
                [246, 160], [240, 140]) },
  // #4 Storm Coast (Seafarer's Rest) — WEST coast, mid-latitude.
  { id: "stormcoast", name: "Storm Coast", continent: AURELION_ID, draft: true,
    shape: ring([100, 178], [136, 170], [156, 188], [158, 216], [138, 234], [110, 230], [96, 208],
                [94, 192]) },
  // #5 Riverhearth (Trade Capital) — CENTER hub of the continent.
  { id: "riverhearth", name: "Riverhearth", continent: AURELION_ID, draft: true,
    shape: ring([264, 206], [308, 198], [344, 210], [356, 232], [342, 254], [306, 264], [272, 254],
                [254, 230]) },
  // #6 Frostpeak Highlands (Dwarven Strongholds) — EAST arm, mid-latitude.
  { id: "frostpeak", name: "Frostpeak Highlands", continent: AURELION_ID, draft: true,
    shape: ring([388, 152], [428, 146], [452, 166], [452, 196], [430, 214], [398, 210], [380, 188],
                [378, 168]) },
  // #7 Dawnfall Hold (Frontier Watch) — SW.
  { id: "dawnfall", name: "Dawnfall Hold", continent: AURELION_ID, draft: true,
    shape: ring([150, 246], [188, 242], [214, 258], [212, 282], [190, 292], [162, 288], [144, 270]) },
  // #8 Whisper Hills (Monastery Land) — SE.
  { id: "whisperhills", name: "Whisper Hills", continent: AURELION_ID, draft: true,
    shape: ring([366, 256], [398, 254], [418, 268], [414, 288], [392, 296], [366, 290], [352, 274]) },
  // #9 Sunbridge (Port City) — S-center, southernmost (toward the Coral Archipelago).
  { id: "sunbridge", name: "Sunbridge", continent: AURELION_ID, draft: true,
    shape: ring([268, 270], [304, 266], [326, 282], [324, 296], [302, 298], [288, 290], [272, 286]) },

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
    shape: ring([124, 56], [148, 50], [160, 64], [154, 82], [134, 88], [120, 74]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "low-slime-kobold", music: "field" } },
  { id: "gv-orchard", name: "Orchard Ridge", zone: "greenvale", draft: true,
    shape: ring([154, 48], [184, 46], [200, 62], [194, 80], [168, 82], [152, 66]),
    identity: { biome: "orchard", tileset: "shire", encounterLean: "kobold-bandit", music: "field" } },
  { id: "gv-fields", name: "Bandit Fields", zone: "greenvale", draft: true,
    shape: ring([130, 86], [166, 84], [186, 96], [176, 106], [148, 106], [128, 96]),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "bandit-mage", music: "field" } },
  { id: "gv-grove", name: "The Hidden Grove", zone: "greenvale", draft: true,
    shape: ring([176, 70], [198, 72], [200, 88], [184, 98], [170, 86]),
    identity: { biome: "forest", tileset: "shire", encounterLean: "rare-lair", music: "field" } },
  { id: "gv-warren-approach", name: "Warren Approach", zone: "greenvale", draft: true,
    shape: ring([158, 84], [180, 88], [180, 102], [160, 102], [152, 92]),
    identity: { biome: "plains", tileset: "shire", encounterLean: "miniboss-gate", music: "field" } },

  // ── Silverwood (the Ancient Forest) — denser/darker old-growth. Fern hollows, heartwood crossing,
  //    the canopy nook, the deep mossbed, and the Sunless-Grove-mouth approach. ──
  { id: "sw-fern-hollows", name: "Fern Hollows", zone: "silverwood", draft: true,
    shape: ring([252, 56], [282, 50], [292, 66], [286, 84], [262, 86], [248, 70]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "wolf-thornling", music: "forest" } },
  { id: "sw-heartwood", name: "Heartwood Crossing", zone: "silverwood", draft: true,
    shape: ring([288, 54], [316, 56], [328, 72], [316, 88], [292, 84], [282, 68]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer-wisp", music: "forest" } },
  { id: "sw-canopy", name: "Canopy Nook", zone: "silverwood", draft: true,
    shape: ring([318, 50], [340, 56], [342, 74], [322, 84], [310, 66]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer", music: "forest" } },
  { id: "sw-mossbed", name: "Deep Mossbed", zone: "silverwood", draft: true,
    shape: ring([270, 88], [300, 88], [310, 96], [296, 102], [272, 98]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "rare-lair", music: "forest" } },
  { id: "sw-grove-approach", name: "Sunless-Grove Approach", zone: "silverwood", draft: true,
    shape: ring([300, 70], [322, 76], [320, 92], [300, 94], [292, 80]),
    identity: { biome: "forest", tileset: "grove", encounterLean: "miniboss-gate", music: "forest" } },

  // ── The Duskmarsh — water-framed mire. Mire-head causeways, the central lagoon they loop around,
  //    the sunken ruin (rare lair), and the Drowned-Vault-mouth landing. ──
  { id: "dm-causeways", name: "The Causeways", zone: "duskmarsh", draft: true,
    shape: ring([150, 130], [178, 126], [192, 140], [186, 156], [160, 160], [146, 144]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "rat-spider", music: "field" } },
  { id: "dm-lagoon", name: "The Central Lagoon", zone: "duskmarsh", draft: true,
    shape: ring([172, 140], [200, 142], [206, 158], [190, 172], [166, 166], [160, 150]),
    identity: { biome: "water", tileset: "mire", encounterLean: "spider-leper", music: "field" } },
  { id: "dm-sunken-ruin", name: "The Sunken Ruin", zone: "duskmarsh", draft: true,
    shape: ring([150, 158], [174, 158], [180, 170], [162, 176], [146, 166]),
    identity: { biome: "ruin", tileset: "mire", encounterLean: "rare-lair", music: "field" } },
  { id: "dm-vault-approach", name: "Drowned-Vault Approach", zone: "duskmarsh", draft: true,
    shape: ring([186, 150], [206, 154], [204, 170], [186, 172], [180, 158]),
    identity: { biome: "mire", tileset: "mire", encounterLean: "miniboss-gate", music: "field" } },
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
