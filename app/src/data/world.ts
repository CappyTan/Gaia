// THE WORLD REGISTRY — the containment hierarchy as pure data (ADR 0009).
//
// ADR 0009 gives the world ONE framework: every tile resolves up a fixed spine
//   Map (type) › Continent › Zone › Area › Tile
// A surface map is ONE big ~250×250 tile COORDINATE SPACE; Continents, Zones and Areas are
// BOUNDARIES (rects) painted onto it. A tile's (continent, zone, area) is a point-in-region lookup
// by (x, y). There are no seams to stitch — it is literally one map — which is the simplest possible
// foundation for the seamless roaming ADR 0008 wants.
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
// pass placed the three built zones in a shared world frame as `WORLD_REGIONS` (origins) + helpers
// in `data/zones.ts`. Those ORIGINS remain the physical placement source (the engine-grid invariant
// `worldRect(id).w/h === layout.w/h` and the worldmap/worldspace tests still own them). This registry
// FOLDS THEM IN as the hierarchy authority by DERIVING each Zone's hierarchy bounds from that same
// placement (`worldRect`) — so there is exactly one set of coordinates, expressed twice: the flat
// 8-way region graph (zones.ts, for the seam-stitch math) and this nested Map›Continent›Zone›Area
// tree (world.ts, for identity lookups). They cannot drift: the consistency test asserts every Zone
// region's bounds equal its `worldRect`.

import { ZONES, worldRect } from "./zones";

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

/** An axis-aligned region boundary in a map's tile coordinate space: [x, x+w) × [y, y+h). */
export interface Bounds { x: number; y: number; w: number; h: number; }

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
  bounds: Bounds;        // within the parent zone's bounds (in the map's coordinate space)
  identity: AreaIdentity;
  /** First-pass skeleton names/bounds inferred from the zone layout — FLAGGED for Dara (lore = his). */
  draft?: boolean;
}

/** A named overworld region — maps to one or more game zones (here 1:1 with a `Zone` in zones.ts). */
export interface ZoneRegion {
  id: string;            // matches a ZONES id in data/zones.ts (the link to the playable Zone def)
  name: string;
  continent: string;     // parent Continent id
  bounds: Bounds;        // within the parent continent's bounds (derived from the Stage-1 placement)
}

/** A top-level overworld region (Aurelion / Varkhaz / Myr'Thalas / the Sundering), per the atlas. */
export interface Continent {
  id: string;
  name: string;
  map: string;           // parent WorldMap id
  bounds: Bounds;        // a chunk of the map; the rest is empty = the visible backlog to fill
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

// ── Continents (ADR 0009 §1) ────────────────────────────────────────────────────────────────────
// Only AURELION is painted (the starting continent — the current game lives here). It claims a
// chunk of the 250×250; Varkhaz / Myr'Thalas / the Sundering are the empty rest of the map (backlog
// the dev World Map view renders blank). Aurelion sits NORTHWEST per the atlas, so its bounds anchor
// at the map's NW. The three built zones (placed at world origins 0..120 × 0..46 in Stage 1) sit in
// its NW corner; the box is generously oversized so the rest of Aurelion's atlas regions (#3–#9:
// Goldmeadow, Storm Coast, Riverhearth, Frostpeak, Dawnfall, Whisper Hills, Sunbridge) have room.
export const AURELION_ID = "aurelion";
export const CONTINENTS: Continent[] = [
  { id: AURELION_ID, name: "Aurelion", map: OVERWORLD_ID, bounds: { x: 0, y: 0, w: 130, h: 110 } },
];

// ── Zones (ADR 0009 §1) — DERIVED from the Stage-1 world placement so the two never drift ─────────
// The Stage-1 `WORLD_REGIONS` origins + each zone's `layout.w/h` (via `worldRect`) are the physical
// placement; this re-expresses them as hierarchy bounds nested in Aurelion. The consistency test
// asserts each ZoneRegion's bounds === its `worldRect`, so editing the placement in zones.ts and the
// hierarchy here can never disagree.
function zoneBounds(id: string): Bounds {
  const r = worldRect(id);
  if (!r) throw new Error(`world.ts: zone "${id}" has no world placement (WORLD_REGIONS) in zones.ts`);
  return { x: r.x0, y: r.y0, w: r.x1 - r.x0, h: r.y1 - r.y0 };
}

const PAINTED_ZONES: { id: string; continent: string }[] = [
  { id: "greenvale", continent: AURELION_ID },
  { id: "silverwood", continent: AURELION_ID },
  { id: "duskmarsh", continent: AURELION_ID },
];

export const ZONE_REGIONS: ZoneRegion[] = PAINTED_ZONES.map(({ id, continent }) => {
  const z = ZONES.find((zz) => zz.id === id);
  if (!z) throw new Error(`world.ts: painted zone "${id}" is not a real ZONES entry`);
  return { id, name: z.name, continent, bounds: zoneBounds(id) };
});

// ── Areas (ADR 0009 §1, §4) — the finest identity unit, FIRST-PASS SKELETON, FLAGGED FOR DARA ─────
// Each Area is inferred from its zone's open-world layout (the named clearings/hollows/causeways +
// dungeon-mouth approach already authored in zones.ts). Bounds are expressed in WORLD (map) coords
// = the zone's world origin + the local layout rect, so Areas nest exactly inside their zone's
// bounds. Names/biomes/leans are an AGENT FIRST PASS (draft:true) — lore + final names are Dara's.
//
// Identity resolves FINEST-FIRST (ADR 0009 §4): a tile inside an Area gets that Area's biome/music/
// lean; a zone tile outside every Area falls back to the zone (and the zone to the continent). So we
// do NOT need to tile the whole zone with Areas — gaps fall back to the zone's own envs/bands.
//
// Helper to shift a zone-local rect into world coords by the zone's origin.
function inZone(zoneId: string, x: number, y: number, w: number, h: number): Bounds {
  const r = worldRect(zoneId)!;
  return { x: r.x0 + x, y: r.y0 + y, w, h };
}

export const AREAS: Area[] = [
  // ── Greenvale (the Shirelands) — temperate farmland/forest. From its open-mesh layout: a spawn
  //    commons, the north orchard ridge, the south meadow "bandit fields", the hidden grove (Hogger),
  //    and the warren-mouth staging green. (Greenvale envs: plains/forest/desert/mountains.) ──
  { id: "gv-commons", name: "Hearthford Commons", zone: "greenvale", draft: true,
    bounds: inZone("greenvale", 1, 8, 16, 10),
    identity: { biome: "plains", tileset: "shire", encounterLean: "low-slime-kobold", music: "field" } },
  { id: "gv-orchard", name: "Orchard Ridge", zone: "greenvale", draft: true,
    bounds: inZone("greenvale", 12, 2, 20, 6),
    identity: { biome: "orchard", tileset: "shire", encounterLean: "kobold-bandit", music: "field" } },
  { id: "gv-fields", name: "Bandit Fields", zone: "greenvale", draft: true,
    bounds: inZone("greenvale", 11, 16, 21, 6),
    identity: { biome: "meadow", tileset: "shire", encounterLean: "bandit-mage", music: "field" } },
  { id: "gv-grove", name: "The Hidden Grove", zone: "greenvale", draft: true,
    bounds: inZone("greenvale", 23, 17, 9, 5),
    identity: { biome: "forest", tileset: "shire", encounterLean: "rare-lair", music: "field" } },
  { id: "gv-warren-approach", name: "Warren Approach", zone: "greenvale", draft: true,
    bounds: inZone("greenvale", 33, 8, 7, 8),
    identity: { biome: "plains", tileset: "shire", encounterLean: "miniboss-gate", music: "field" } },

  // ── Silverwood (the Ancient Forest) — denser/darker old-growth. From its layout: fern hollows,
  //    the heartwood crossing, the NE canopy, the mossbed, and the Sunless-Grove-mouth approach.
  //    (Silverwood envs: forest×4.) ──
  { id: "sw-fern-hollows", name: "Fern Hollows", zone: "silverwood", draft: true,
    bounds: inZone("silverwood", 9, 3, 9, 13),
    identity: { biome: "forest", tileset: "grove", encounterLean: "wolf-thornling", music: "forest" } },
  { id: "sw-heartwood", name: "Heartwood Crossing", zone: "silverwood", draft: true,
    bounds: inZone("silverwood", 21, 9, 7, 7),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer-wisp", music: "forest" } },
  { id: "sw-canopy", name: "Canopy Nook", zone: "silverwood", draft: true,
    bounds: inZone("silverwood", 22, 3, 7, 5),
    identity: { biome: "forest", tileset: "grove", encounterLean: "archer", music: "forest" } },
  { id: "sw-mossbed", name: "Deep Mossbed", zone: "silverwood", draft: true,
    bounds: inZone("silverwood", 20, 17, 9, 5),
    identity: { biome: "forest", tileset: "grove", encounterLean: "rare-lair", music: "forest" } },
  { id: "sw-grove-approach", name: "Sunless-Grove Approach", zone: "silverwood", draft: true,
    bounds: inZone("silverwood", 30, 10, 6, 5),
    identity: { biome: "forest", tileset: "grove", encounterLean: "miniboss-gate", music: "forest" } },

  // ── The Duskmarsh — water-framed mire. From its layout: the mire-head causeways, the central
  //    lagoon they loop around, the sunken ruin (rare lair), and the Drowned-Vault-mouth landing.
  //    (Duskmarsh envs: mire/forest/mire/hollow.) ──
  { id: "dm-causeways", name: "The Causeways", zone: "duskmarsh", draft: true,
    bounds: inZone("duskmarsh", 1, 2, 16, 18),
    identity: { biome: "mire", tileset: "mire", encounterLean: "rat-spider", music: "field" } },
  { id: "dm-lagoon", name: "The Central Lagoon", zone: "duskmarsh", draft: true,
    bounds: inZone("duskmarsh", 9, 7, 11, 8),
    identity: { biome: "water", tileset: "mire", encounterLean: "spider-leper", music: "field" } },
  { id: "dm-sunken-ruin", name: "The Sunken Ruin", zone: "duskmarsh", draft: true,
    bounds: inZone("duskmarsh", 9, 15, 8, 5),
    identity: { biome: "ruin", tileset: "mire", encounterLean: "rare-lair", music: "field" } },
  { id: "dm-vault-approach", name: "Drowned-Vault Approach", zone: "duskmarsh", draft: true,
    bounds: inZone("duskmarsh", 27, 9, 5, 5),
    identity: { biome: "mire", tileset: "mire", encounterLean: "miniboss-gate", music: "field" } },
];

// ── Point-in-region lookups (ADR 0009 §2/§5 — pure + cheap; called per-tile/frame later) ──────────

const within = (b: Bounds, x: number, y: number) =>
  x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;

/** The map definition for a map id. */
export function worldMap(mapId: string): WorldMap | undefined {
  return MAPS.find((m) => m.id === mapId);
}

/**
 * Resolve a coordinate to its place in the hierarchy: { continent, zone, area }, innermost-first.
 * Areas/Zones/Continents are point-in-region; the FINEST match wins (an Area implies its Zone and
 * Continent). Empty map space (no painted region) returns {} — the caller falls back to the Map's
 * own rules. Lookups are confined to the named map (the underworld has no regions yet → always {}).
 *
 * Cheap by construction (a handful of rect tests over the painted regions). When the painted set
 * grows large enough to matter, swap the linear scans for a per-map spatial index behind this same
 * signature — consumers (renderer/movement/save/dev view) never change.
 */
export function regionAt(mapId: string, x: number, y: number): RegionResolution {
  const continent = CONTINENTS.find((c) => c.map === mapId && within(c.bounds, x, y));
  if (!continent) return {};
  const zone = ZONE_REGIONS.find((z) => z.continent === continent.id && within(z.bounds, x, y));
  if (!zone) return { continent };
  // Innermost wins: an Area must nest inside its zone, so a zone hit can be refined to an Area hit.
  // DEFINED PRIORITY for overlapping Areas (ADR 0009 §2 "rects with priority"): the FINEST (smallest
  // area) wins — so a small special pocket (the Hidden Grove, the Sunken Ruin, the lagoon) painted
  // on top of a broad section (Bandit Fields, the Causeways) takes precedence at the overlap.
  let area: Area | undefined;
  for (const a of AREAS) {
    if (a.zone !== zone.id || !within(a.bounds, x, y)) continue;
    if (!area || a.bounds.w * a.bounds.h < area.bounds.w * area.bounds.h) area = a;
  }
  return { continent, zone, area };
}

/** Areas of a given zone (skeleton sections), in declared order. */
export function areasOf(zoneId: string): Area[] {
  return AREAS.filter((a) => a.zone === zoneId);
}

/** Zone regions of a given continent, in declared order. */
export function zonesOf(continentId: string): ZoneRegion[] {
  return ZONE_REGIONS.filter((z) => z.continent === continentId);
}
