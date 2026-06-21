// Encounter tables + zone definitions. Adding a zone/band is pure data — no engine changes.

export interface EncounterBand {
  at: number;
  sets: string[][];
}

// ── Bespoke, per-zone layout (ADR 0006) ────────────────────────────────────────────────────
// A zone is no longer the one shared 60×18 corridor. Each zone supplies a `ZoneLayout` the field
// controller (`genMap`) carves into the tile grid: a tree-filled canvas with walkable space cut
// out as RECTS (clearings / dungeon rooms) and PATHS (winding roads / corridors), an anchored
// gate chokepoint, boss tile, treasure chests, and optional POIs (e.g. a rare-monster lair). The
// generator connects everything and flood-fills to GUARANTEE the boss + every chest are reachable
// (anti-soft-lock), repairing the map if a feature ended up walled off. Data only — no DOM.

export interface Pt { x: number; y: number; }
/** An axis-aligned walkable region carved out of the tree canvas (a clearing or a room). */
export interface Rect { x: number; y: number; w: number; h: number; }
/** A walkable polyline (corridor / road): consecutive points are joined by an L-shaped carve. */
export type Path = Pt[];

export interface ZoneLayout {
  w: number;            // grid width  (tiles)
  h: number;            // grid height (tiles)
  spawn: Pt;            // where the player enters the zone
  gate: Pt;             // mid-zone chokepoint (the mini-boss tile in the tree wall)
  gateWallX: number;    // x of the full-height chokepoint wall (the gate sits in it)
  boss: Pt;             // the zone boss tile (deep east, in the dungeon)
  /**
   * The DUNGEON MOUTH (ADR 0008 Stage 2): the overworld POI the mini-boss guards and the player
   * steps onto to descend into the zone's discrete dungeon. Same tile as the old `gate` — kept
   * separate so the overworld-only generator (`genOverworld`) places the mouth without a gate wall.
   */
  mouth: Pt;
  /** Overworld (west of the gate wall) carved space + roads. */
  fieldRects: Rect[];
  fieldPaths: Path[];
  /**
   * @deprecated DUNGEON data has MOVED to `Zone.dungeon.layout` (rebased to its own grid, x from 0).
   * These fields remain ONLY so step-2's `genMap` can rebuild the byte-identical combined grid while
   * Silverwood/Duskmarsh still run the legacy path. Greenvale carries empty arrays here (its dungeon
   * lives entirely in `dungeon.layout`). Removed when all zones move to genOverworld/genDungeon.
   */
  dunRects: Rect[];
  dunPaths: Path[];
  /** Treasure chests — OVERWORLD ONLY now (dungeon chests live in `DungeonLayout.chests`). */
  chests: Pt[];
  /** Optional points of interest: e.g. a rare-monster lair the player can stumble into. */
  lair?: Pt;
  /** Scatter density for cosmetic bush/rock on open ground (0–1). Default ~0.06. */
  scatter?: number;
  /**
   * Optional WATER pools: extra hard-blocking regions stamped onto the carved map AFTER carving
   * (overwriting walkable ground with "water"), to frame causeways and force winding routes in a
   * mire. Water blocks movement exactly like tree (taught to passable/flood + the soft-lock test),
   * so the generator still GUARANTEES the boss/chests/lair stay reachable — water that severs a
   * required tile is repaired by the same flood-fill punch-through. Author pools that pinch, not
   * sever, the critical path.
   */
  water?: Rect[];
  /**
   * VARIED TERRAIN (Dara's 2026-06-21 directive). Hard-blocking, hand-placed geography stamped over
   * the carved ground AFTER carving, just like `water` — but read as real landscape, not a flat field:
   *   • `rivers`  — winding WATER courses (drawn as the "river" kind, hard wall like `water`); author a
   *     bent series of rects so it snakes, not a straight moat. Cross them at a `bridge`/`ford`.
   *   • `cliffs`  — impassable ROCKY mountain walls (the "cliff" kind, hard wall, visually distinct from
   *     the forest "tree"); author ridgelines that funnel routes without severing the critical path.
   * Both are taught to passable/flood/soft-lock, so the generator still GUARANTEES the mouth + every
   * chest/lair/POI stays reachable — anything a river or cliff walls off is repaired by the same
   * flood-fill punch-through. Author terrain that PINCHES/FRAMES the routes, never severs them.
   */
  rivers?: Rect[];
  cliffs?: Rect[];
  /**
   * Walkable WATER CROSSINGS stamped LAST (over river/water), so a river reads as crossable at a chosen
   * point: `bridge` (a plank span) / `ford` (a shallow pale crossing). Both are walkable ground (NOT in
   * the wall sets), so they re-open a route the river would otherwise sever — author one where a road
   * meets a river. (A crossing tile sits on top of the river/water tile it spans.)
   */
  bridges?: Pt[];
  fords?: Pt[];
  /**
   * POINTS OF INTEREST — the INHABITED world (Dara's 2026-06-21 directive). A few per zone, OFF the main
   * flow, so the zone feels lived-in, not empty space between fights. Each is a walkable special tile
   * (drawn as a captioned landmark) with a light `move()` interaction by `kind`:
   *   • `shrine`   — a roadside shrine: stepping on it RESTORES the party (heal) once, then it's spent.
   *   • `camp`     — an encampment (tents + a fire): an OPTIONAL fight vs a themed pack, then a reward +
   *     a cleared state (reuses existing enemies — difficulty flagged for balance-tuner, no new stats).
   *   • `landmark` — a ruin / standing-stones / statue: a non-blocking flavor line (its `name`/`note`).
   *   • `signpost` — a wayfinding marker: a non-blocking directional hint line.
   * POIs are halo'd + treated as flood targets so they're always reachable, and they NEVER block a
   * required route (they sit ON walkable ground). Pure data — the controller wires the triggers.
   */
  pois?: Poi[];
}

/** A point of interest / encampment (the INHABITED-world layer). `kind` drives its `move()` effect. */
export type PoiKind = "shrine" | "camp" | "landmark" | "signpost";
export interface Poi {
  x: number;
  y: number;
  kind: PoiKind;
  /** Display name (the gold caption + the dialogue/flavor line). */
  name: string;
  /** Optional flavor/hint line shown for `landmark`/`signpost` (defaults to a kind-generic line). */
  note?: string;
  /** For a `camp`: the enemy pack to fight (existing bestiary keys). Defaults to a band-appropriate pull. */
  pack?: string[];
}

/**
 * A dungeon's OWN tile grid (ADR 0008 Stage 2) — decoupled from the overworld region. The player
 * descends through the overworld `mouth` into this separate space (`genDungeon`). x is rebased to
 * start at 0 (independent of the overworld's width / the old gate wall). Same carve vocabulary as
 * the overworld (rooms = rects, paths = polylines), flood-filled to keep boss + chests reachable.
 */
export interface DungeonLayout {
  w: number;            // dungeon grid width  (tiles)
  h: number;            // dungeon grid height (tiles)
  entry: Pt;            // where the player lands on descending (the mouth's inside)
  gate: Pt;             // the door tile back out to the overworld (usually == entry)
  boss: Pt;             // the dungeon boss tile (the zone boss lives HERE)
  rooms: Rect[];        // carved chambers
  paths: Path[];        // corridors joining them
  chests: Pt[];         // dungeon treasure (each gets a walkable approach)
  scatter?: number;     // cosmetic rock density (0–1)
}

export interface Zone {
  id: string;
  name: string;
  mini: string;
  miniAdds?: string[];
  boss: string;
  envs: string[];
  bands: EncounterBand[];
  /**
   * The dungeon past the mini-boss mouth: own name + environment, tougher enemies, and (ADR 0008
   * Stage 2) its own decoupled tile grid (`layout`, x rebased to 0). The zone boss lives in
   * `dungeon.layout.boss`.
   */
  dungeon: { name: string; env: string; layout: DungeonLayout };
  /** Bespoke layout consumed by `controllers/field.genMap` (ADR 0006). */
  layout: ZoneLayout;
  /**
   * The settlement (data/towns.ts id) that fronts this zone — its arrival hub. The starting zone's
   * hub is the opening village; a later zone's hub is the outpost the player reaches after clearing
   * the previous boss (the between-zones breather). Defaults to "hearthford" if omitted.
   */
  hub?: string;
  /**
   * Optional ORDERED chain of settlements the player walks through on the way INTO this zone, in
   * sequence, before the overworld loads (ADR 0006 hub flow). Lets a transition pass through more
   * than one place — e.g. arriving from Greenvale you celebrate in the grand capital **Riverhearth**,
   * then push on to the grim doorstep **Miregard**, then step into the Duskmarsh. When present this
   * supersedes `hub` for the inbound flow; the FINAL entry is this zone's true doorstep. If omitted,
   * the flow falls back to `hub` (a single-settlement chain). The starting zone's chain is its
   * opening village. Data-driven so transitions are declared, not special-cased in the controller.
   */
  hubs?: string[];
}

// Greenvale's encounter table by area depth (the further east, the tougher the roll-set).
// The mid-zone chokepoint (Bandit Brigadier) and the final Kingpin are NOT in this table.
export const ENCOUNTERS: EncounterBand[] = [
  { at: 0.0, sets: [["slime", "slime", "kobold"], ["kobold", "kobold"], ["slime", "kobold"]] },
  { at: 0.18, sets: [["gbandit", "kobold", "kobold"], ["slime", "slime", "kobold"], ["kobold", "gbandit"], ["slime", "kobold", "kobold"]] },
  { at: 0.36, sets: [["gbandit", "kobold", "kobold"], ["slimebig", "kobold", "kobold"], ["gbandit", "gbandit", "kobold"], ["slime", "kobolde", "kobold"]] },
  { at: 0.54, sets: [["slimebig", "kobold", "kobold"], ["kobolde", "gbandit", "kobold"], ["gbandit", "gmage", "kobold"], ["kobolde", "gbandit", "kobold"]] },
  { at: 0.72, sets: [["kobolde", "gmage", "kobold"], ["slimebig", "gmage", "kobold"], ["gbandit", "kobolde", "gbandit"], ["gbandit", "gbandit", "gmage"]] },
];

// ── Greenvale overworld + Bandit Warren (greenfield, OPEN-WORLD rework — Dara 2026-06-20) ─────
// NO LONGER a west→east spine with up/down spurs. The shire is an OPEN MESH: spawn feeds a WEST HUB
// clearing, from which THREE parallel roads run to a CENTRAL HUB — a north ORCHARD-RIDGE road (over
// the orchard & NE thicket), a fast exposed MIDDLE road, and a south MEADOW road (through the meadow
// & grove). The three rejoin at the central hub (two big loops), so exploring is a CIRCUIT, not an
// out-and-back: you pick a road, and cross-links knit the orchard/meadow/thicket pockets back to the
// hubs. Treasure sits on routes you CHOOSE BETWEEN (orchard chest on the north road, meadow chest on
// the south road, thicket chest on the north ridge crest); Hogger's lair hangs off the south loop in
// the hidden grove. From the central hub a shared staging green leads to the Brigadier's gate.
//   East of the gate the BANDIT WARREN is a connected room-network, not dead-end cells: the entry
// hall forks into a north GUARD CHAMBER and a south STORE ROOM that BOTH rejoin at an antechamber hub
// before the Kingpin's arena — a loop, so you can circle through either room (each holds a chest) and
// come back. genMap carves these + flood-fills to GUARANTEE boss + every chest/lair reachable
// (anti-soft-lock); the loops mean you can never be walled into a pocket.
//
// VARIED TERRAIN + INHABITED (Dara's 2026-06-21 directive — Greenvale is the exemplar). The shire is
// no longer a flat green field with a tree border: real geography threads the mesh and the world is
// lived-in:
//   • A WINDING RIVER (the Hearthbrook) snakes down the central gap between the west hub and the
//     central hub — column x=20 above the middle road, jogging to x=21 below it — crossed by a stone
//     BRIDGE on the fast middle road (the bridge keeps the route open; the river FRAMES it, never
//     severs it — the north & south loops run well clear at y≈4 / y≈19, and a FORD downstream gives
//     the south loop its own crossing). The river reads as the reason the three roads exist.
//   • A low CLIFF ridge (Greenvale's rocky northern shoulder) walls the gap between the north road and
//     the central hub (x≈18–22, y≈6–7) and a small SE rocky OUTCROP edges the grove — funnels without
//     blocking (the loops route around them; flood-repair guarantees reachability).
//   • The HIDDEN GROVE pocket (SE) is the dense forest COPSE, dressed with the old-growth skin.
//   • POIs scatter the shire so it feels INHABITED, all OFF the main flow: a roadside SHRINE in the
//     orchard (heal), a BANDIT CAMP in the south meadow (an optional fight + reward), STANDING STONES
//     on the north ridge (a flavor landmark), and a SIGNPOST at the west fork (a wayfinding hint).
// All terrain + POIs are taught to passable/flood/soft-lock, so the mouth + every chest/lair/POI stays
// reachable. ART FLAG (art-integrator): river/cliff/bridge/ford + the four POI kinds draw as in-palette
// placeholder fills/emoji until bespoke sprites land (see the hand-back).
const GREENVALE_LAYOUT: ZoneLayout = {
  w: 64, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 40, y: 12 }, gateWallX: 40, boss: { x: 60, y: 11 },
  mouth: { x: 40, y: 12 }, // the dungeon mouth = the old gate tile (the Brigadier guards it)
  fieldRects: [
    { x: 1, y: 10, w: 7, h: 6 },    // spawn green (the village road mouth)
    { x: 10, y: 8, w: 7, h: 8 },    // WEST HUB — the first crossroads, three roads leave it
    { x: 12, y: 2, w: 8, h: 5 },    // north orchard (chest)
    { x: 11, y: 17, w: 9, h: 5 },   // south meadow (chest)
    { x: 24, y: 8, w: 8, h: 8 },    // CENTRAL HUB — the three roads rejoin here
    { x: 24, y: 2, w: 8, h: 5 },    // NE thicket (chest, on the north ridge)
    { x: 23, y: 17, w: 9, h: 5 },   // the hidden grove (Hogger's lair, off the south loop)
    { x: 34, y: 9, w: 5, h: 6 },    // east staging green before the gate
  ],
  fieldPaths: [
    [{ x: 5, y: 12 }, { x: 13, y: 12 }],                                   // spawn → west hub
    [{ x: 13, y: 10 }, { x: 15, y: 4 }, { x: 27, y: 4 }, { x: 27, y: 9 }], // NORTH road: hub → orchard → NE thicket → central
    [{ x: 16, y: 12 }, { x: 24, y: 12 }],                                  // MIDDLE road: hub → central (fast, exposed)
    [{ x: 13, y: 14 }, { x: 15, y: 19 }, { x: 27, y: 19 }, { x: 27, y: 15 }], // SOUTH road: hub → meadow → grove → central
    [{ x: 31, y: 12 }, { x: 36, y: 12 }, { x: 39, y: 12 }],                // central → staging → gate
    [{ x: 16, y: 4 }, { x: 16, y: 9 }],   // cross-link: orchard ↔ west hub
    [{ x: 15, y: 17 }, { x: 15, y: 15 }], // cross-link: meadow ↔ west hub
    [{ x: 27, y: 6 }, { x: 27, y: 9 }],   // cross-link: NE thicket ↔ central hub
  ],
  dunRects: [], dunPaths: [], // dungeon MOVED to dungeon.layout (GREENVALE_DUNGEON) — ADR 0008 Stage 2
  chests: [
    { x: 15, y: 3 },   // orchard (north road)
    { x: 14, y: 20 },  // meadow (south road)
    { x: 27, y: 3 },   // NE thicket (north ridge crest, off the safe road)
  ],
  lair: { x: 27, y: 20 }, // Hogger, deep in the southern grove off the south loop
  scatter: 0.06,
  // THE HEARTHBROOK: a winding river that runs SOUTH down the x=20 gap, CROSSING the routes it meets so
  // it SHAPES them. Its main reach (y 8–20) cuts clean across the fast MIDDLE road (y=12) and the SOUTH
  // road (y=19) — both severed unless you take the crossing — while a short oxbow jogs east (x=21, y14–16)
  // so it snakes rather than running ruler-straight. The NORTH loop (y≈4) stays clear, so it is the dry
  // way round: the river forces a real choice (bridge / ford / detour north), never a soft-lock — every
  // crossing is a walkable flood target and the north road is always open.
  rivers: [
    { x: 20, y: 8, w: 1, h: 12 },  // main reach: crosses the MIDDLE road (y12, bridged) AND the SOUTH road (y19, forded)
    { x: 21, y: 14, w: 1, h: 3 },  // oxbow: the river jogs east mid-course so it winds, not runs straight
  ],
  // CLIFFS: the rocky northern shoulder walls the north-road↔central gap (funnels the north approach),
  // plus a small SE outcrop edging the grove. Both pinch, never sever (loops route around; flood repairs).
  cliffs: [
    { x: 18, y: 6, w: 5, h: 1 },   // the northern ridge shoulder (between the north road and the hub)
    { x: 30, y: 16, w: 2, h: 2 },  // SE rocky outcrop edging the hidden grove
  ],
  // CROSSINGS over the Hearthbrook — each sits on a road the river SEVERS, so it carries that crossing:
  // the BRIDGE is the only way the middle road gets across; the FORD reconnects the south meadow↔grove loop.
  bridges: [{ x: 20, y: 12 }],     // the middle road's only crossing (river severs y=12 here)
  fords: [{ x: 20, y: 19 }],       // the south road's crossing — reconnects the meadow↔grove loop the river cuts
  // POIs — the INHABITED shire, all OFF the main flow (discoveries):
  pois: [
    { x: 18, y: 4, kind: "shrine", name: "Wayside Shrine" },                                 // orchard — heal
    { x: 16, y: 18, kind: "camp", name: "Bandit Camp", pack: ["gbandit", "gbandit", "kobold"] }, // south meadow — optional fight
    { x: 30, y: 4, kind: "landmark", name: "The Standing Stones", note: "Moss-furred stones older than the shire — they hum faintly at dusk." }, // north ridge crest
    { x: 12, y: 13, kind: "signpost", name: "Crossroads Sign", note: "Orchard road north · Meadow road south · the gate lies east." }, // west fork
  ],
};

// ── Greenvale's PLAYABLE Areas (ADR 0009 exemplar — Area = finest identity, realized at play scale) ─
// world.ts paints Greenvale's five Areas as world-scale ORGANIC POLYGONS; here we realize the SAME
// arrangement over the 64×24 PLAYABLE grid (rects, since the playable grid is small + the renderer
// samples per-tile every frame — cheap point-in-rect beats a ray-cast). The five regions TILE the
// overworld portion (west of the gate wall at x=40) with NO gaps, so EVERY playable overworld tile
// resolves to an Area, and each Area realizes its world.ts identity at this scale:
//   • gv-commons         — Hearthford Commons (plains)   : the WEST spawn lobe (spawn green + west hub).
//   • gv-orchard         — Orchard Ridge (orchard)       : the NORTH band (orchard road, NE thicket).
//   • gv-fields          — Bandit Fields (meadow)        : the SOUTH band (meadow road).
//   • gv-grove           — The Hidden Grove (forest)     : the SE pocket (Hogger's lair) — FINEST, it
//                          sits ON TOP of the south band, so the grove wins where it overlaps Fields.
//   • gv-warren-approach — Warren Approach (plains)      : the CENTRAL hub + the EAST lobe to the mouth.
// EAST of the gate wall (the Bandit Warren dungeon) is its OWN discrete grid — no Areas there.
// Identity resolves FINEST-FIRST (smallest rect wins at an overlap), mirroring world.ts §regionAt, with
// a Zone fallback (gv-warren-approach is the default — the central spine — so no tile is ever Area-less).
export type GreenvaleAreaId =
  | "gv-commons" | "gv-orchard" | "gv-fields" | "gv-grove" | "gv-warren-approach";

interface GreenvaleAreaRegion { area: GreenvaleAreaId; rects: Rect[]; }

// Authored over the overworld portion x∈[0,40), matching the layout's roads: the NORTH orchard road
// (orchard clearing + NE thicket, y<9, from x≈9 east) is Orchard Ridge; the SOUTH meadow road
// (y≥16, from x≈9 east) is Bandit Fields; the hidden grove pocket (SE) is small so it WINS over
// Fields; the WEST spawn lobe near the entrance is Hearthford Commons; the CENTRAL hub band + the
// EAST run-up to the dungeon mouth are the Warren Approach.
export const GREENVALE_AREAS: GreenvaleAreaRegion[] = [
  { area: "gv-commons", rects: [{ x: 0, y: 0, w: 10, h: 24 }] },            // WEST spawn lobe (the entrance + west hub)
  { area: "gv-orchard", rects: [{ x: 9, y: 0, w: 25, h: 9 }] },            // NORTH orchard road band
  { area: "gv-fields", rects: [{ x: 9, y: 16, w: 25, h: 8 }] },           // SOUTH meadow road band
  { area: "gv-grove", rects: [{ x: 22, y: 16, w: 11, h: 8 }] },           // SE grove pocket (FINEST — wins over Fields)
  { area: "gv-warren-approach", rects: [{ x: 9, y: 9, w: 55, h: 7 }, { x: 34, y: 0, w: 30, h: 24 }] }, // central hub + EAST lobe to the mouth
];

/**
 * Which Greenvale Area a PLAYABLE OVERWORLD tile sits in (ADR 0009 §4 — finest-first). Pure: a point
 * lands in the SMALLEST-area region whose rect contains it (so the grove pocket beats the broad south
 * Fields band where they overlap), with gv-warren-approach as the spine fallback so no tile is
 * Area-less. Used by the field controller to dress the ground + lean the encounter by Area. Returns
 * undefined only for an out-of-overworld coord (the dungeon east of the gate carries no Area).
 */
export function greenvaleAreaAt(px: number, py: number): GreenvaleAreaId | undefined {
  let best: GreenvaleAreaId | undefined;
  let bestSize = Infinity;
  for (const r of GREENVALE_AREAS) {
    for (const rc of r.rects) {
      if (px < rc.x || py < rc.y || px >= rc.x + rc.w || py >= rc.y + rc.h) continue;
      const sz = rc.w * rc.h;
      if (sz < bestSize) { best = r.area; bestSize = sz; }
    }
  }
  return best;
}

// The Bandit Warren as its OWN grid (ADR 0008 Stage 2): the old Greenvale dungeon (everything east
// of the gate wall at x=40), x rebased by -gateWallX so the gate stub at world-x 41 becomes local
// x=1 (a clean west border at x=0). Width = 64-40 = 24; height carries over (24). The combined
// genMap reconstructs the byte-identical old grid by adding gateWallX back. Kingpin → 20,11.
const GREENVALE_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 },
  rooms: [
    { x: 2, y: 8, w: 6, h: 8 },     // warren entry hall (the fork)
    { x: 10, y: 3, w: 7, h: 5 },    // north guard chamber (chest, on the loop)
    { x: 10, y: 16, w: 7, h: 5 },   // south store room (chest, on the loop)
    { x: 14, y: 8, w: 5, h: 7 },    // antechamber hub (the loop rejoins here)
    { x: 17, y: 8, w: 6, h: 6 },    // the Kingpin's arena
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 5, y: 12 }],                            // mouth → entry hall
    [{ x: 5, y: 10 }, { x: 13, y: 5 }, { x: 16, y: 9 }],           // hall → north chamber → antechamber
    [{ x: 5, y: 14 }, { x: 13, y: 18 }, { x: 16, y: 13 }],         // hall → south store → antechamber (the LOOP)
    [{ x: 16, y: 11 }, { x: 19, y: 11 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 13, y: 18 },  // south store room (loop, richest)
    { x: 13, y: 4 },   // north guard chamber (loop, breather reward)
  ],
  scatter: 0.06,
};

// ── Silverwood, the Ancient Forest + the Sunless Grove (OPEN-WORLD rework — Dara 2026-06-20) ──
// Region #2 of Aurelion (world-atlas): the deep, old, hushed old-growth forest, inserted BETWEEN
// Greenvale and the Duskmarsh. It reads DENSER and DARKER than Greenvale's open shire — small hidden
// HOLLOWS pressed in by ancient trees, linked by narrow ROOT-WORN trails — but it is the SAME open
// MESH, not a winding line with spurs. Spawn feeds a WEST HOLLOW hub, from which THREE root-trails run
// to a CENTRAL crossing hub: a north trail (fern hollow → NE canopy nook), a winding middle trail,
// and a south trail (sunken-root hollow → mossbed). The three rejoin at the central hub (two loops),
// so the forest is a CIRCUIT you roam, not an out-and-back. Chests sit on routes you choose between
// (fern chest north, sunken chest south, canopy chest on the north crest); the Mossback Tortoise's
// lair dens deep in the southern mossbed off the south loop.
//   East of the Elder Treant's gate, THE SUNLESS GROVE is a connected heartwood room-network: the
// root-hall forks into a north HOLLOW BOLE and a south FUNGAL GALLERY that BOTH rejoin at a root-stair
// antechamber before the Hollow King's arena — a loop (each room holds a chest), so you circle through
// and come back, never dead-end. genMap carves + flood-fills to GUARANTEE boss + every chest/lair
// reachable (anti-soft-lock); the loops mean no pocket can wall you in.
const SILVERWOOD_LAYOUT: ZoneLayout = {
  w: 60, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 36, y: 12 }, gateWallX: 36, boss: { x: 56, y: 11 },
  mouth: { x: 36, y: 12 },
  fieldRects: [
    { x: 1, y: 10, w: 6, h: 6 },    // spawn glade (the forest road mouth)
    { x: 9, y: 9, w: 6, h: 7 },     // WEST HOLLOW hub — three trails leave it
    { x: 11, y: 3, w: 7, h: 5 },    // north fern hollow (chest)
    { x: 10, y: 17, w: 8, h: 5 },   // south sunken-root hollow (chest)
    { x: 21, y: 9, w: 7, h: 7 },    // CENTRAL crossing hollow hub — the three trails rejoin
    { x: 22, y: 3, w: 7, h: 5 },    // NE canopy nook (chest, on the north crest)
    { x: 20, y: 17, w: 9, h: 5 },   // deep mossbed (Mossback's lair, off the south loop)
    { x: 30, y: 10, w: 5, h: 5 },   // pre-gate hollow before the Elder Treant
  ],
  fieldPaths: [
    [{ x: 4, y: 12 }, { x: 11, y: 12 }],                                    // spawn → west hollow
    [{ x: 12, y: 10 }, { x: 14, y: 5 }, { x: 24, y: 5 }, { x: 24, y: 10 }], // NORTH trail: hub → fern → NE canopy → central
    [{ x: 14, y: 12 }, { x: 17, y: 13 }, { x: 21, y: 12 }],                 // MIDDLE trail: hub → central (winds)
    [{ x: 12, y: 14 }, { x: 13, y: 19 }, { x: 24, y: 19 }, { x: 24, y: 15 }], // SOUTH trail: hub → sunken → mossbed → central
    [{ x: 27, y: 12 }, { x: 32, y: 12 }, { x: 35, y: 12 }],                 // central → pre-gate → gate
    [{ x: 14, y: 5 }, { x: 14, y: 10 }],   // cross-link: fern hollow ↔ west hub
    [{ x: 13, y: 17 }, { x: 13, y: 15 }],  // cross-link: sunken hollow ↔ west hub
    [{ x: 24, y: 7 }, { x: 24, y: 10 }],   // cross-link: NE canopy ↔ central hub
  ],
  dunRects: [], dunPaths: [], // dungeon MOVED to dungeon.layout (SILVERWOOD_DUNGEON) — ADR 0008 Stage 2
  // VARIED TERRAIN + INHABITED (2026-06-21 roll-out). A WOODED STREAM (river kind = a clear forest brook)
  // runs the x=18 gap between the west hollow and the central crossing, SEVERING the winding MIDDLE trail
  // (it crosses at y=13, carried by a mossy log BRIDGE) and the SOUTH mossbed trail (y=19, carried by a
  // FORD over the stepping-roots) — the NORTH fern trail (y=5) stays dry as the redundant route. A
  // MOSS-FURRED CLIFF (an old rockfall, the "mossy hollow" framed in stone) walls the north-trail↔central
  // gap + edges the deep mossbed, funnelling the route between the ancient trunks.
  rivers: [
    { x: 18, y: 8, w: 1, h: 12 },  // the wooded stream: crosses the MIDDLE trail (y13, log bridge) + the SOUTH mossbed (y19, forded)
    { x: 19, y: 14, w: 1, h: 3 },  // a meander so the brook winds between the roots
  ],
  cliffs: [
    { x: 15, y: 7, w: 4, h: 1 },   // the moss-furred rockfall between the fern trail and the central crossing
    { x: 27, y: 16, w: 2, h: 2 },  // SE mossy outcrop edging the deep mossbed (Mossback's lair)
  ],
  bridges: [{ x: 18, y: 13 }],     // the middle trail's mossy log bridge over the stream (its only crossing)
  fords: [{ x: 18, y: 19 }],       // the stepping-root ford reconnecting the sunken-hollow↔mossbed loop
  chests: [
    { x: 14, y: 4 },   // north fern hollow (north trail)
    { x: 13, y: 20 },  // south sunken-root hollow (south trail)
    { x: 25, y: 4 },   // NE canopy nook (north crest, off the safe trail)
  ],
  lair: { x: 24, y: 20 }, // the Mossback Tortoise dens deep in the southern mossbed off the south loop
  scatter: 0.09,          // denser scatter than the shire: ferns/mushrooms thick on the floor
  // POIs — the INHABITED ancient forest, all OFF the main flow:
  pois: [
    { x: 15, y: 3, kind: "shrine", name: "Grove Shrine" },                                             // north fern hollow — heal
    { x: 14, y: 18, kind: "camp", name: "Poachers' Camp", pack: ["sylvanarcher", "dwolf", "dwolf"] },  // south sunken hollow — optional fight
    { x: 26, y: 3, kind: "landmark", name: "The Elder Stones", note: "Standing stones swallowed by root and moss — the forest grew up around a ring older than memory." }, // NE canopy nook
    { x: 11, y: 12, kind: "signpost", name: "Trailhead Marker", note: "Fern hollow north · sunken roots south · the Elder Treant's gate lies east." }, // west fork
  ],
};
// The Sunless Grove as its own grid (data uniform with Greenvale; Silverwood stays on the LEGACY
// combined-grid path in Chunk A, so this layout is data-only until its zone is migrated — Chunk B).
const SILVERWOOD_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 },
  rooms: [
    { x: 2, y: 8, w: 6, h: 8 },     // grove root-hall (the fork)
    { x: 10, y: 3, w: 6, h: 5 },    // north hollow bole (chest, on the loop)
    { x: 9, y: 16, w: 7, h: 5 },    // south fungal gallery (chest, on the loop)
    { x: 14, y: 8, w: 5, h: 7 },    // root-stair antechamber hub (the loop rejoins)
    { x: 17, y: 8, w: 6, h: 6 },    // the Hollow King's heartwood arena
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 5, y: 12 }],                            // mouth → root-hall
    [{ x: 5, y: 10 }, { x: 13, y: 5 }, { x: 16, y: 9 }],           // hall → north bole → antechamber
    [{ x: 5, y: 14 }, { x: 12, y: 18 }, { x: 16, y: 13 }],         // hall → south gallery → antechamber (the LOOP)
    [{ x: 16, y: 11 }, { x: 19, y: 11 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 12, y: 18 },  // south fungal gallery (loop, rich)
    { x: 13, y: 4 },   // north hollow bole (loop, breather)
  ],
  scatter: 0.09,
};

// ── The Duskmarsh + Drowned Vault (OPEN-WORLD rework — Dara 2026-06-20) ──────────────────────
// The early "dark detour" — grimmer and TIGHTER than the shire, but NO LONGER a single pinched
// causeway with two spurs. It's a water-framed MESH: from the mire-head hub a fork splits into a
// NORTH causeway (the high road, over the fog bog pocket) and a SOUTH causeway (the low road, past
// the sunken ruin), and the two LOOP around a big CENTRAL LAGOON before rejoining at the central
// crossing hub — so the mire is a circuit, not a thread. Standing water (hard wall) sits in the
// WEDGES between the roads and as the central lagoon, framing the routes without severing them, so
// the mire feels close and dangerous yet stays a real choice of paths. Chests sit on the two roads
// you pick between (bog chest north, ruin chest south); the rare Metal-Babble lair dens in the
// flooded ruin stones off the south road.
//   East of the Broodmother's gate, the DROWNED VAULT is a connected flooded room-network: the entry
// hall forks into a north drowned GALLERY and a south drowned CELL that BOTH rejoin at a sunken-stair
// antechamber before the Cave Troll's arena — a loop (each room holds a chest), so you circle through
// and back, never dead-end. The richest hoard sits deepest by the arena threshold. genMap carves +
// stamps water + flood-fills to GUARANTEE boss + every chest/lair reachable (anti-soft-lock); the
// loops mean the water can never wall you into a pocket.
const DUSKMARSH_LAYOUT: ZoneLayout = {
  w: 56, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 32, y: 11 }, gateWallX: 32, boss: { x: 52, y: 10 },
  mouth: { x: 32, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 6, h: 5 },     // mire head hub (the causeway mouth / fork)
    { x: 9, y: 2, w: 7, h: 5 },     // north bog pocket (chest, fog-bound)
    { x: 9, y: 15, w: 8, h: 5 },    // the sunken ruin (chest + the rare lair)
    { x: 20, y: 8, w: 7, h: 7 },    // CENTRAL crossing hub (the two causeways rejoin)
    { x: 27, y: 9, w: 5, h: 5 },    // pre-gate landing before the Broodmother's gate
  ],
  fieldPaths: [
    [{ x: 4, y: 11 }, { x: 7, y: 11 }],                            // mire head → fork node
    // NORTH causeway: fork → up the west bank → across the top (over the bog pocket) → down into central
    [{ x: 7, y: 11 }, { x: 7, y: 4 }, { x: 12, y: 4 }, { x: 18, y: 4 }, { x: 23, y: 5 }, { x: 23, y: 8 }],
    // SOUTH causeway: fork → down the west bank → across the bottom (past the ruin) → up into central
    [{ x: 7, y: 11 }, { x: 7, y: 18 }, { x: 12, y: 18 }, { x: 18, y: 18 }, { x: 23, y: 17 }, { x: 23, y: 15 }],
    [{ x: 26, y: 11 }, { x: 29, y: 11 }, { x: 31, y: 11 }],        // central → pre-gate → gate
    [{ x: 23, y: 11 }, { x: 28, y: 11 }],                          // central → pre-gate connector
  ],
  // Standing water sits in the WEDGES between the two roads — a big central lagoon they loop around,
  // plus bank pools framing the head fork — so it pinches/frames the routes without severing them.
  water: [
    { x: 10, y: 8, w: 8, h: 6 },    // central lagoon (the two causeways loop around it)
    { x: 4, y: 2, w: 2, h: 7 },     // NW bank pool
    { x: 4, y: 13, w: 2, h: 7 },    // SW bank pool
    { x: 17, y: 9, w: 2, h: 4 },    // east-of-lagoon pinch
  ],
  dunRects: [], dunPaths: [], // dungeon MOVED to dungeon.layout (DUSKMARSH_DUNGEON) — ADR 0008 Stage 2
  // VARIED TERRAIN + INHABITED (2026-06-21 roll-out). The mire already has standing-water pools; now a
  // winding CHANNEL (river kind = a slow black watercourse) snakes down the x=15 gap and CROSSES the SOUTH
  // causeway (y=18), SEVERING the low road unless you take the plank FORD — the NORTH causeway (y=4) stays
  // the dry high road (the redundant route). REED-CHOKED HUMMOCKS (cliff kind = mire-rock + dense reed
  // stands you can't push through) frame the channel + edge the sunken ruin, so the mire reads as living
  // wetland, not flat bog. Channel/hummocks pinch, never sever (the north causeway + flood-repair guarantee).
  rivers: [
    { x: 15, y: 15, w: 1, h: 5 },   // the channel: crosses the SOUTH causeway (y18, forded)
    { x: 16, y: 16, w: 1, h: 2 },   // a sluggish meander so the channel winds through the reeds
  ],
  cliffs: [
    { x: 8, y: 7, w: 1, h: 2 },     // reed-hummock pinching the head fork's north shoulder
    { x: 18, y: 16, w: 2, h: 1 },   // reed thicket edging the sunken ruin (between ruin and central hub)
  ],
  fords: [{ x: 15, y: 18 }],        // the plank ford carrying the south causeway over the channel
  chests: [
    { x: 12, y: 3 },   // north bog pocket (north causeway)
    { x: 13, y: 18 },  // sunken ruin (south causeway, shares the ruin with the lair)
  ],
  lair: { x: 11, y: 18 }, // the rare beast dens in the flooded ruin stones off the south road
  scatter: 0.07,
  // POIs — the INHABITED mire, all OFF the main flow:
  pois: [
    { x: 8, y: 3, kind: "shrine", name: "Sunken Shrine" },                                             // north bog pocket approach — heal
    { x: 9, y: 18, kind: "camp", name: "Cultists' Camp", pack: ["leper", "direrat", "rat"] },          // sunken ruin (west of the lair) — optional fight
    { x: 24, y: 3, kind: "signpost", name: "Drowned Signpost", note: "A half-sunk marker, lettering scoured by the bog: 'High road north · low road south · the Vault below.'" }, // NE near central hub
    { x: 19, y: 11, kind: "landmark", name: "The Mire-Idol", note: "A moss-slick idol on a hummock, offerings of bone and reed heaped at its base — someone still prays here." }, // central hub edge
  ],
};
// The Drowned Vault as its own grid (data uniform with Greenvale; Duskmarsh stays on the LEGACY
// combined-grid path in Chunk A — data-only until its zone is migrated in Chunk B).
const DUSKMARSH_DUNGEON: DungeonLayout = {
  w: 24, h: 22, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 20, y: 10 },
  rooms: [
    { x: 2, y: 7, w: 6, h: 8 },     // vault entry hall (the flooded sump fork)
    { x: 10, y: 2, w: 6, h: 5 },    // north drowned gallery (chest, on the loop)
    { x: 9, y: 15, w: 6, h: 5 },    // south drowned cell (chest, on the loop)
    { x: 14, y: 7, w: 5, h: 7 },    // sunken-stair antechamber hub (the loop rejoins)
    { x: 17, y: 7, w: 6, h: 6 },    // the Cave Troll's deep arena
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 5, y: 11 }],                            // mouth → entry hall
    [{ x: 5, y: 9 }, { x: 13, y: 4 }, { x: 16, y: 8 }],            // hall → north gallery → antechamber
    [{ x: 5, y: 13 }, { x: 12, y: 17 }, { x: 16, y: 12 }],         // hall → south cell → antechamber (the LOOP)
    [{ x: 16, y: 10 }, { x: 19, y: 10 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 12, y: 3 },   // north drowned gallery (loop)
    { x: 12, y: 18 },  // south drowned cell (loop)
    { x: 16, y: 12 },  // deepest — by the arena threshold (richest)
  ],
  scatter: 0.07,
};

// ── Goldmeadow Plains + the occupied Windmill (OPEN-WORLD, first backlog fill — brief 2026-06-21) ─
// Aurelion #3, "The Breadbasket": L11–15, the journey's step PAST the Duskmarsh — WIDE, BRIGHT and
// EXPOSED after the marsh's pinch (the brief's "nowhere to hide"). NOT a west→east spine: it's an
// open PLAINS MESH of broad wheat commons joined by farm tracks that LOOP and rejoin. Spawn feeds a
// WEST WHEAT COMMONS hub; THREE farm tracks run east to a CENTRAL CROSSROADS hub — a NORTH track
// (along the field tracks, past the hedge maze + a barn-yard chest), a fast EXPOSED MIDDLE track
// (open ground, long sightlines), and a SOUTH track (down to the CREEK CROSSING, past the burned
// FARMSTEAD). The three rejoin at the central crossroads (two big loops), so roaming is a CIRCUIT,
// not an out-and-back. DRYSTONE WALLS / HEDGES (authored as the tree-canvas negative space between
// the wide rects) channel the open-field engagements; a CREEK (water) cuts the SW and is bridged on
// the south track. Chests sit on routes you CHOOSE BETWEEN (barn-yard chest north, creek chest on
// the south track, a fallow-field chest off the middle track); the rare gilded-beast lair dens in
// the burned farmstead off the south loop. From the central crossroads a staging green leads EAST to
// the war-captain's gate at the windmill MOUTH (x=36, like Silverwood).
//   East of the mouth, THE WINDMILL / GRANARY UNDERCROFT is a connected room-network, not dead-end
// cells: the undercroft entry hall forks into a north GRANARY LOFT and a south MILLSTONE CELLAR that
// BOTH rejoin at a threshing-floor antechamber hub before the warlord's arena — a loop (each room
// holds a chest), so you circle through either and come back. A DEEP DEAD-END VAULT hangs off the
// antechamber holding the RICHEST hoard (reward-the-brave). genMap carves + flood-fills to GUARANTEE
// boss + every chest/lair reachable (anti-soft-lock); the loops mean no pocket can wall you in.
//
// NOTE: tile KINDS reuse the shire/plains family (grass/path/bush/rock/water/tree) as PLACEHOLDERS.
// FLAG FOR ART-INTEGRATOR: this region wants new flavor tiles — WHEAT FIELD (tall golden crop, soft
// cover), DRYSTONE WALL (low impassable field boundary), WINDMILL/BARN landmark — drawn as recolored
// shire tiles until Dara's art lands (logged in docs/design/asset-gaps.md). The creek uses the
// existing hard-blocking "water" kind already taught to passable/flood/soft-lock.
const GOLDMEADOW_LAYOUT: ZoneLayout = {
  w: 60, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 36, y: 12 }, gateWallX: 36, boss: { x: 56, y: 11 },
  mouth: { x: 36, y: 12 }, // the dungeon mouth = the gate tile (the war-captain guards the windmill)
  fieldRects: [
    { x: 1, y: 10, w: 6, h: 6 },    // spawn commons (the wheat-road mouth, WEST)
    { x: 9, y: 9, w: 7, h: 7 },     // WEST WHEAT COMMONS hub — three farm tracks leave it
    { x: 11, y: 2, w: 8, h: 5 },    // north barn-yard field (chest)
    { x: 10, y: 17, w: 9, h: 5 },   // south creek meadow (chest) + bridged creek crossing
    { x: 22, y: 9, w: 7, h: 7 },    // CENTRAL CROSSROADS hub — the three tracks rejoin
    { x: 23, y: 2, w: 8, h: 5 },    // NE fallow field (chest, off the middle track)
    { x: 21, y: 17, w: 9, h: 5 },   // the burned farmstead (the rare lair, off the south loop)
    { x: 30, y: 10, w: 5, h: 5 },   // east staging green before the windmill gate
  ],
  fieldPaths: [
    [{ x: 4, y: 12 }, { x: 11, y: 12 }],                                    // spawn → west commons
    [{ x: 12, y: 9 }, { x: 14, y: 4 }, { x: 26, y: 4 }, { x: 26, y: 9 }],   // NORTH track: hub → barn-yard → NE fallow → central
    [{ x: 15, y: 12 }, { x: 18, y: 12 }, { x: 22, y: 12 }],                 // MIDDLE track: hub → central (fast, exposed)
    [{ x: 12, y: 15 }, { x: 13, y: 19 }, { x: 26, y: 19 }, { x: 26, y: 15 }], // SOUTH track: hub → creek meadow → farmstead → central
    [{ x: 28, y: 12 }, { x: 32, y: 12 }, { x: 35, y: 12 }],                 // central → staging → gate
    [{ x: 14, y: 4 }, { x: 14, y: 9 }],   // cross-link: barn-yard ↔ west hub
    [{ x: 13, y: 17 }, { x: 13, y: 15 }], // cross-link: creek meadow ↔ west hub
    [{ x: 26, y: 6 }, { x: 26, y: 9 }],   // cross-link: NE fallow ↔ central hub
  ],
  dunRects: [], dunPaths: [], // dungeon lives in dungeon.layout (GOLDMEADOW_DUNGEON) — ADR 0008 Stage 2
  // The CREEK (hard-blocking water) cuts the SW between the west hub and the south meadow, framing the
  // south track's bridged crossing without severing it (the south path L-carves across the gap; the
  // flood-repair guarantees it stays open). Open author wedges, not a wall across the critical path.
  water: [
    { x: 7, y: 18, w: 5, h: 4 },    // SW creek pool (the south track bridges its east lip at x≈13)
    { x: 16, y: 20, w: 4, h: 2 },   // creek run trailing SE under the farmstead
  ],
  // VARIED TERRAIN + INHABITED (2026-06-21 roll-out). THE CREEK now CROSSES a road: a winding watercourse
  // (river kind) runs the x=19 gap between the west commons and the central crossroads, SEVERING the fast
  // MIDDLE field track (y=12, carried by a farm BRIDGE) and the SOUTH creek-meadow track (y=19, carried by
  // a FORD) — the NORTH barn-yard track (y=4) stays dry as the redundant route. A DRYSTONE RIDGE (cliff =
  // low field-wall escarpment) walls the north-track↔crossroads gap + edges the burned farmstead, channeling
  // the open-field engagements (the brief's "nowhere to hide" — the ridge is the only hard cover out here).
  rivers: [
    { x: 19, y: 9, w: 1, h: 11 },  // the creek: crosses the MIDDLE track (y12, bridged) + the SOUTH meadow (y19, forded)
    { x: 20, y: 14, w: 1, h: 3 },  // an oxbow so the creek winds across the plain, not runs straight
  ],
  cliffs: [
    { x: 16, y: 7, w: 5, h: 1 },   // the drystone ridge between the north field track and the central crossroads
    { x: 29, y: 16, w: 2, h: 2 },  // SE drystone outcrop edging the burned farmstead
  ],
  bridges: [{ x: 19, y: 12 }],     // the middle track's farm bridge over the creek (its only crossing)
  fords: [{ x: 19, y: 19 }],       // the creek meadow's ford (reconnects the meadow↔farmstead loop)
  chests: [
    { x: 14, y: 3 },   // north barn-yard field (north track)
    { x: 13, y: 20 },  // south creek meadow (south track, by the crossing)
    { x: 26, y: 3 },   // NE fallow field (off the middle/north loop crest)
  ],
  lair: { x: 25, y: 20 }, // the gilded wheat-beast dens in the burned farmstead off the south loop
  scatter: 0.05,          // sparse: wide open ground, "nowhere to hide" — less cover than the forest
  // POIs — the INHABITED breadbasket, all OFF the main flow:
  pois: [
    { x: 16, y: 3, kind: "shrine", name: "Harvest Shrine" },                                           // north barn-yard field — heal
    { x: 15, y: 20, kind: "camp", name: "Raiders' Camp", pack: ["raider", "marauder", "wilddog"] },    // south creek meadow — optional fight
    { x: 29, y: 4, kind: "landmark", name: "The Old Windmill", note: "A burned-out mill, sails snapped — the war-host fires its grain-store as a beacon." }, // NE fallow field
    { x: 13, y: 13, kind: "signpost", name: "Field Crossroads", note: "Barn-yard road north · creek meadow south · the windmill gate lies east." }, // west fork
  ],
};
// The occupied Windmill / Granary Undercroft as its own grid (sibling to Warren/Grove/Vault). The
// undercroft forks into two looped rooms that rejoin at a threshing antechamber, with a DEAD-END VAULT
// off the antechamber (richest hoard) and a guarded run-up to the warlord's arena. Warlord → 20,11.
const GOLDMEADOW_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 },
  rooms: [
    { x: 2, y: 8, w: 6, h: 8 },     // undercroft entry hall (the fork)
    { x: 10, y: 3, w: 7, h: 5 },    // north granary loft (chest, on the loop)
    { x: 10, y: 16, w: 7, h: 5 },   // south millstone cellar (chest, on the loop)
    { x: 14, y: 8, w: 5, h: 7 },    // threshing-floor antechamber hub (the loop rejoins)
    { x: 9, y: 11, w: 4, h: 3 },    // the deep dead-end vault (RICHEST hoard, off the antechamber)
    { x: 17, y: 8, w: 6, h: 6 },    // the warlord's arena
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 5, y: 12 }],                            // mouth → entry hall
    [{ x: 5, y: 10 }, { x: 13, y: 5 }, { x: 16, y: 9 }],           // hall → north loft → antechamber
    [{ x: 5, y: 14 }, { x: 13, y: 18 }, { x: 16, y: 13 }],         // hall → south cellar → antechamber (the LOOP)
    [{ x: 14, y: 12 }, { x: 12, y: 12 }],                          // antechamber → dead-end vault (spur)
    [{ x: 16, y: 11 }, { x: 19, y: 11 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 13, y: 4 },   // north granary loft (loop, breather reward)
    { x: 13, y: 18 },  // south millstone cellar (loop)
    { x: 10, y: 12 },  // the dead-end vault (deepest, RICHEST — reward the brave)
  ],
  scatter: 0.06,
};

// ════ AURELION COMPLETE — the remaining six regions (world-builder build 2026-06-21) ═══════════
// Six new zones built to ONE recipe, replicating Goldmeadow: an OPEN-WORLD overworld mesh (a west hub
// feeding THREE tracks — north field / fast middle / south field — that rejoin at a central hub, two
// big LOOPS so roaming is a circuit, not an out-and-back; cross-links knit the pockets back to the
// hubs; chests sit on routes you CHOOSE BETWEEN; the rare LAIR dens off the south loop; an east staging
// green leads to the mini-boss GATE at the dungeon MOUTH), plus a discrete dungeon east of the mouth.
//   The two SPINE regions (Frostpeak, Sunbridge) get the FULL multi-room dungeon (two looped rooms
// rejoining at an antechamber, a DEAD-END richest-hoard VAULT off it, a guarded boss arena — like the
// Windmill Undercroft). The four OPTIONAL regions get a SMALL single-floor CAVE: an entry hall that
// forks into a north chamber and a tough south chamber that BOTH rejoin at the boss arena (a loop), each
// holding one strong reward. Compact, but still a valid networked DungeonLayout (≥2 loop-redundant arms).
//   genMap carves + flood-repairs to GUARANTEE boss + every chest/lair reachable (anti-soft-lock); the
// loops mean no pocket can wall you in. Water pools (the hard-blocking "water" kind) frame creeks/
// harbors where a region's flavor wants them — authored to pinch, never sever, the critical path.
//
// TILE KINDS reuse the existing family (grass/path/bush/rock/water/tree) as PLACEHOLDERS — the new
// biomes (snow/ice/coast/harbor/stone/etc.) fall back to default shire ground in bigGround, which is
// fine for now. FLAG FOR ART-INTEGRATOR: each region wants bespoke flavor tiles (snow/ice/dwarven-stone
// for Frostpeak; rock-coast/wreck/sea-cliff for Storm Coast; wharf/trade-road for Riverhearth; ruined
// rampart/rubble for Dawnfall; monastic green/cloister-stone for Whisper Hills; quay/sea-wall/lighthouse
// for Sunbridge) — drawn as recolored existing tiles until Dara's art lands.
//   FLAG FOR ME (Phase B / battle.ts): the new dungeon `env` strings (seacave, smuggden, stronghold,
// keepvault, crypt, citadel) need ENV_BG backdrops; they map to "plains" via the fallback meanwhile —
// for now point them at the closest existing backdrop (cave/vault) when wiring ENV_BG.

// ── Optional-region OVERWORLD template (52×22 mesh) + small CAVE (16×16 loop) ──────────────────
// Storm Coast — storm-lashed rock coast: a SW creek (water) wedges the south field; sparse scatter
// reads as "exposed wet rock, nowhere to hide". Mouth = the sea-cave at the east staging.
const STORMCOAST_LAYOUT: ZoneLayout = {
  w: 52, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 34, y: 11 }, gateWallX: 34, boss: { x: 48, y: 10 },
  mouth: { x: 34, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 6, h: 5 },     // spawn cove (WEST)
    { x: 8, y: 8, w: 7, h: 6 },     // WEST hub — three coast tracks leave it
    { x: 10, y: 2, w: 8, h: 5 },    // north cliff terrace (chest)
    { x: 9, y: 15, w: 9, h: 5 },    // south wreck strand (chest) + creek crossing
    { x: 20, y: 8, w: 7, h: 6 },    // CENTRAL hub — the tracks rejoin
    { x: 21, y: 2, w: 8, h: 5 },    // NE tidepools (chest, off the north loop)
    { x: 20, y: 15, w: 9, h: 5 },   // SE smugglers' flat (the rare lair, off the south loop)
    { x: 28, y: 9, w: 5, h: 5 },    // east staging before the sea-cave mouth
  ],
  fieldPaths: [
    [{ x: 4, y: 11 }, { x: 10, y: 11 }],                                   // spawn → west hub
    [{ x: 11, y: 8 }, { x: 13, y: 4 }, { x: 24, y: 4 }, { x: 24, y: 8 }],  // NORTH track: west → cliffs → tidepools → central
    [{ x: 14, y: 11 }, { x: 20, y: 11 }],                                  // MIDDLE track (fast, exposed)
    [{ x: 11, y: 13 }, { x: 12, y: 17 }, { x: 24, y: 17 }, { x: 24, y: 13 }], // SOUTH track: west → strand → smugglers → central
    [{ x: 26, y: 11 }, { x: 33, y: 11 }],                                  // central → staging → gate
    [{ x: 13, y: 4 }, { x: 13, y: 8 }],   // cross-link: cliffs ↔ west hub
    [{ x: 24, y: 6 }, { x: 24, y: 8 }],   // cross-link: tidepools ↔ central hub
  ],
  dunRects: [], dunPaths: [],
  water: [{ x: 6, y: 16, w: 4, h: 4 }], // SW creek/tidewater pool (the south track bridges its east lip)
  // VARIED TERRAIN + INHABITED (Dara's 2026-06-21 roll-out). A SEA INLET (river kind = saltwater channel)
  // floods the gap between the west hub and the central hub at x=17, SEVERING the fast MIDDLE track (y=11,
  // bridged by a plank quay) and the SOUTH strand track (y=17, forded over the shallows) — the NORTH cliff
  // track (y=4) stays dry as the redundant way round. SEA-CLIFFS (cliff kind) wall the north-track↔central
  // gap, funnelling the high road. Both pinch, never sever (loops route around; flood-repair guarantees).
  rivers: [
    { x: 17, y: 8, w: 1, h: 10 },  // tidal inlet: crosses the MIDDLE track (y11, bridged) + the SOUTH strand (y17, forded)
    { x: 18, y: 13, w: 1, h: 3 },  // a short backwater jog so the inlet winds, not runs straight
  ],
  cliffs: [
    { x: 15, y: 6, w: 4, h: 1 },   // sea-cliff shoulder between the north track and the central hub
    { x: 27, y: 14, w: 2, h: 2 },  // SE rocky headland edging the smugglers' flat
  ],
  bridges: [{ x: 17, y: 11 }],     // the middle track's plank quay over the inlet (its only crossing)
  fords: [{ x: 17, y: 17 }],       // the south strand's shallow ford (reconnects the strand↔smugglers loop)
  chests: [{ x: 13, y: 3 }, { x: 12, y: 18 }, { x: 24, y: 3 }],
  lair: { x: 23, y: 18 },               // the sea-beast dens in the SE smugglers' flat
  scatter: 0.05,
  // POIs — the INHABITED coast, all OFF the main flow:
  pois: [
    { x: 15, y: 3, kind: "shrine", name: "Tide-Watcher's Shrine" },                                 // north cliff terrace — heal
    { x: 14, y: 18, kind: "camp", name: "Wreckers' Camp", pack: ["wrecker", "cutthroat", "cutthroat"] }, // south strand — optional fight
    { x: 27, y: 3, kind: "landmark", name: "The Broken Hull", note: "A storm-flung ship's ribs, picked clean by gulls and wreckers alike." }, // NE tidepools
    { x: 11, y: 11, kind: "signpost", name: "Coast Road Sign", note: "Cliff path north · Wreck strand south · the sea-cave lies east." }, // west fork
  ],
};
// A small sea-cave: entry hall forks into a north chamber + a tough south chamber that rejoin at the
// guardian's arena (a loop). Champion guardian → (13,8).
const STORMCOAST_CAVE: DungeonLayout = {
  w: 16, h: 16, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 13, y: 8 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 },     // entry hall (the fork)
    { x: 8, y: 3, w: 5, h: 4 },     // north chamber (chest)
    { x: 8, y: 11, w: 5, h: 3 },    // tough south chamber (chest)
    { x: 10, y: 6, w: 5, h: 5 },    // the guardian's arena
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 4, y: 11 }],                  // mouth → entry hall
    [{ x: 4, y: 9 }, { x: 10, y: 4 }, { x: 12, y: 8 }],  // hall → north chamber → arena
    [{ x: 4, y: 12 }, { x: 10, y: 12 }, { x: 12, y: 9 }],// hall → south chamber → arena (the LOOP)
    [{ x: 11, y: 8 }, { x: 12, y: 8 }],                  // arena → boss spur
  ],
  chests: [{ x: 10, y: 4 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// Riverhearth outskirts — trade-road/river wharves: water frames the south wharf; the EXISTING
// Riverhearth city is the hub (set on the Zone). Mouth = the smugglers' den under the wharves.
const RIVERHEARTH_LAYOUT: ZoneLayout = {
  w: 52, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 34, y: 11 }, gateWallX: 34, boss: { x: 48, y: 10 },
  mouth: { x: 34, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 6, h: 5 },     // spawn wharves (WEST)
    { x: 8, y: 8, w: 7, h: 6 },     // WEST hub
    { x: 10, y: 2, w: 8, h: 5 },    // north trade road (chest)
    { x: 9, y: 15, w: 9, h: 5 },    // south riverbank (chest) + river crossing
    { x: 20, y: 8, w: 7, h: 6 },    // CENTRAL market commons hub
    { x: 21, y: 2, w: 8, h: 5 },    // NE caravan yard (chest)
    { x: 20, y: 15, w: 9, h: 5 },   // SE warehouse row (the rare lair)
    { x: 28, y: 9, w: 5, h: 5 },    // east staging before the den mouth
  ],
  fieldPaths: [
    [{ x: 4, y: 11 }, { x: 10, y: 11 }],
    [{ x: 11, y: 8 }, { x: 13, y: 4 }, { x: 24, y: 4 }, { x: 24, y: 8 }],
    [{ x: 14, y: 11 }, { x: 20, y: 11 }],
    [{ x: 11, y: 13 }, { x: 12, y: 17 }, { x: 24, y: 17 }, { x: 24, y: 13 }],
    [{ x: 26, y: 11 }, { x: 33, y: 11 }],
    [{ x: 13, y: 4 }, { x: 13, y: 8 }],
    [{ x: 24, y: 6 }, { x: 24, y: 8 }],
  ],
  dunRects: [], dunPaths: [],
  water: [{ x: 6, y: 16, w: 4, h: 4 }, { x: 17, y: 18, w: 3, h: 2 }], // the river run along the south
  // VARIED TERRAIN + INHABITED. THE TRADE RIVER (this is the capital's river) snakes down the x=17 gap,
  // SEVERING the fast MIDDLE trade-road (y=11, carried by a stone BRIDGE) and the SOUTH riverbank track
  // (y=17, carried by a FORD) — the NORTH trade road (y=4) stays dry as the redundant route. A ROAD
  // EMBANKMENT (cliff = raised stone causeway) walls the north-road↔central gap, funnelling the high road.
  rivers: [
    { x: 17, y: 8, w: 1, h: 10 },  // the river: crosses the MIDDLE road (y11, bridged) + the SOUTH bank (y17, forded)
    { x: 18, y: 13, w: 1, h: 3 },  // a mid-course meander so the river winds
  ],
  cliffs: [
    { x: 15, y: 6, w: 4, h: 1 },   // raised road embankment between the north road and the central market
    { x: 27, y: 14, w: 2, h: 2 },  // SE wharf retaining wall edging the warehouse row
  ],
  bridges: [{ x: 17, y: 11 }],     // the middle road's stone bridge over the trade river (its only crossing)
  fords: [{ x: 17, y: 17 }],       // the riverbank track's ford (reconnects the bank↔warehouse loop)
  chests: [{ x: 13, y: 3 }, { x: 12, y: 18 }, { x: 24, y: 3 }],
  lair: { x: 23, y: 18 },
  scatter: 0.06,
  // POIs — the INHABITED trade outskirts, all OFF the main flow:
  pois: [
    { x: 15, y: 3, kind: "shrine", name: "Ferryman's Shrine" },                                       // north trade road — heal
    { x: 14, y: 18, kind: "camp", name: "Smugglers' Camp", pack: ["smuggler", "roadbandit", "footpad"] }, // south riverbank — optional fight
    { x: 27, y: 3, kind: "signpost", name: "Capital Milestone", note: "Riverhearth gates ahead · caravan yard north · the wharves south." }, // NE caravan yard
    { x: 11, y: 11, kind: "landmark", name: "The Toll Cairn", note: "A heaped cairn of road-tolls and traders' offerings, older than the city charter." }, // west fork
  ],
};
const RIVERHEARTH_CAVE: DungeonLayout = {
  w: 16, h: 16, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 13, y: 8 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 }, { x: 8, y: 3, w: 5, h: 4 }, { x: 8, y: 11, w: 5, h: 3 }, { x: 10, y: 6, w: 5, h: 5 },
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 4, y: 11 }],
    [{ x: 4, y: 9 }, { x: 10, y: 4 }, { x: 12, y: 8 }],
    [{ x: 4, y: 12 }, { x: 10, y: 12 }, { x: 12, y: 9 }],
    [{ x: 11, y: 8 }, { x: 12, y: 8 }],
  ],
  chests: [{ x: 10, y: 4 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// Dawnfall Hold — breached frontier fortress: grim martial ruin, no water, denser scatter (rubble of
// the fallen rampart). Mouth = the keep's breached undervault.
const DAWNFALL_LAYOUT: ZoneLayout = {
  w: 52, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 34, y: 11 }, gateWallX: 34, boss: { x: 48, y: 10 },
  mouth: { x: 34, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 6, h: 5 },     // spawn watchwall (WEST)
    { x: 8, y: 8, w: 7, h: 6 },     // WEST muster hub
    { x: 10, y: 2, w: 8, h: 5 },    // north rampart walk (chest)
    { x: 9, y: 15, w: 9, h: 5 },    // south muster yard (chest)
    { x: 20, y: 8, w: 7, h: 6 },    // CENTRAL bailey hub
    { x: 21, y: 2, w: 8, h: 5 },    // NE broken tower (chest)
    { x: 20, y: 15, w: 9, h: 5 },   // SE collapsed barracks (the rare lair)
    { x: 28, y: 9, w: 5, h: 5 },    // east staging before the undervault mouth
  ],
  fieldPaths: [
    [{ x: 4, y: 11 }, { x: 10, y: 11 }],
    [{ x: 11, y: 8 }, { x: 13, y: 4 }, { x: 24, y: 4 }, { x: 24, y: 8 }],
    [{ x: 14, y: 11 }, { x: 20, y: 11 }],
    [{ x: 11, y: 13 }, { x: 12, y: 17 }, { x: 24, y: 17 }, { x: 24, y: 13 }],
    [{ x: 26, y: 11 }, { x: 33, y: 11 }],
    [{ x: 13, y: 4 }, { x: 13, y: 8 }],
    [{ x: 24, y: 6 }, { x: 24, y: 8 }],
  ],
  dunRects: [], dunPaths: [],
  // VARIED TERRAIN + INHABITED. A flooded DEFENSIVE MOAT/DITCH (river kind) runs the x=17 gap, SEVERING
  // the MIDDLE bailey track (y=11, carried by a RUINED BRIDGE — the old drawbridge stub) and the SOUTH
  // muster-yard track (y=17, carried by a FORD where the moat has silted up) — the NORTH rampart walk
  // (y=4) stays dry as the redundant route. BROKEN CURTAIN WALLS (cliff = fallen rampart) wall the
  // north-walk↔bailey gap + edge the collapsed barracks, funnelling the approach through the ruin.
  rivers: [
    { x: 17, y: 8, w: 1, h: 10 },  // the moat: crosses the MIDDLE track (y11, ruined bridge) + the SOUTH yard (y17, forded)
    { x: 18, y: 13, w: 1, h: 3 },  // a silted dog-leg so the ditch bends round the fallen masonry
  ],
  cliffs: [
    { x: 15, y: 6, w: 4, h: 1 },   // the broken north curtain wall between the rampart walk and the bailey
    { x: 27, y: 14, w: 2, h: 2 },  // SE rubble of the fallen barracks wall
  ],
  bridges: [{ x: 17, y: 11 }],     // the ruined drawbridge stub over the moat (the middle track's only crossing)
  fords: [{ x: 17, y: 17 }],       // the silted ford reconnecting the muster yard↔barracks loop
  chests: [{ x: 13, y: 3 }, { x: 12, y: 18 }, { x: 24, y: 3 }],
  lair: { x: 23, y: 18 },
  scatter: 0.08,    // rubble-strewn ruin: more cover/debris than the open coast
  // POIs — the INHABITED ruined hold, all OFF the main flow:
  pois: [
    { x: 15, y: 3, kind: "shrine", name: "Garrison Chapel" },                                          // north rampart walk — heal
    { x: 14, y: 18, kind: "camp", name: "Fallen-Watch Camp", pack: ["brokenwatch", "fallenarcher", "frontierbeast"] }, // south muster yard — optional fight
    { x: 27, y: 3, kind: "landmark", name: "The Broken Tower", note: "The watchtower's snapped stump, its beacon long cold — it fell the night the hold was breached." }, // NE broken tower
    { x: 11, y: 11, kind: "signpost", name: "Muster Post", note: "Rampart walk north · muster yard south · the undervault breach lies east." }, // west fork
  ],
};
const DAWNFALL_CAVE: DungeonLayout = {
  w: 16, h: 16, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 13, y: 8 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 }, { x: 8, y: 3, w: 5, h: 4 }, { x: 8, y: 11, w: 5, h: 3 }, { x: 10, y: 6, w: 5, h: 5 },
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 4, y: 11 }],
    [{ x: 4, y: 9 }, { x: 10, y: 4 }, { x: 12, y: 8 }],
    [{ x: 4, y: 12 }, { x: 10, y: 12 }, { x: 12, y: 9 }],
    [{ x: 11, y: 8 }, { x: 12, y: 8 }],
  ],
  chests: [{ x: 10, y: 4 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// Whisper Hills — quiet monastic green hills hiding a dark crypt: open green commons, medium scatter.
// Mouth = the reliquary/crypt below the silent monastery.
const WHISPERHILLS_LAYOUT: ZoneLayout = {
  w: 52, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 34, y: 11 }, gateWallX: 34, boss: { x: 48, y: 10 },
  mouth: { x: 34, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 6, h: 5 },     // spawn cloister green (WEST)
    { x: 8, y: 8, w: 7, h: 6 },     // WEST hub
    { x: 10, y: 2, w: 8, h: 5 },    // north terraced gardens (chest)
    { x: 9, y: 15, w: 9, h: 5 },    // south orchard slope (chest)
    { x: 20, y: 8, w: 7, h: 6 },    // CENTRAL chapter-house hub
    { x: 21, y: 2, w: 8, h: 5 },    // NE bell-tower knoll (chest)
    { x: 20, y: 15, w: 9, h: 5 },   // SE silent garden (the rare lair)
    { x: 28, y: 9, w: 5, h: 5 },    // east staging before the crypt mouth
  ],
  fieldPaths: [
    [{ x: 4, y: 11 }, { x: 10, y: 11 }],
    [{ x: 11, y: 8 }, { x: 13, y: 4 }, { x: 24, y: 4 }, { x: 24, y: 8 }],
    [{ x: 14, y: 11 }, { x: 20, y: 11 }],
    [{ x: 11, y: 13 }, { x: 12, y: 17 }, { x: 24, y: 17 }, { x: 24, y: 13 }],
    [{ x: 26, y: 11 }, { x: 33, y: 11 }],
    [{ x: 13, y: 4 }, { x: 13, y: 8 }],
    [{ x: 24, y: 6 }, { x: 24, y: 8 }],
  ],
  dunRects: [], dunPaths: [],
  // VARIED TERRAIN + INHABITED. A clear monastic BROOK (river kind) tumbles down the x=17 gap between the
  // cloister hubs, SEVERING the MIDDLE pilgrim path (y=11, carried by a humped stone BRIDGE) and the SOUTH
  // orchard-slope track (y=17, carried by a FORD over the stepping-stones) — the NORTH terraced-garden walk
  // (y=4) stays dry as the redundant route. A CLIFF ESCARPMENT (the hills' chalk scarp) walls the
  // north-walk↔chapter-house gap + edges the silent garden, funnelling the climb to the monastery.
  rivers: [
    { x: 17, y: 8, w: 1, h: 10 },  // the brook: crosses the MIDDLE path (y11, bridged) + the SOUTH slope (y17, forded)
    { x: 18, y: 13, w: 1, h: 3 },  // a babbling meander so the brook winds through the hollow
  ],
  cliffs: [
    { x: 15, y: 6, w: 4, h: 1 },   // the chalk escarpment between the terraced gardens and the chapter house
    { x: 27, y: 14, w: 2, h: 2 },  // SE rocky knoll edging the silent garden
  ],
  bridges: [{ x: 17, y: 11 }],     // the pilgrim path's humped stone bridge over the brook (its only crossing)
  fords: [{ x: 17, y: 17 }],       // the stepping-stone ford reconnecting the orchard slope↔silent-garden loop
  chests: [{ x: 13, y: 3 }, { x: 12, y: 18 }, { x: 24, y: 3 }],
  lair: { x: 23, y: 18 },
  scatter: 0.07,
  // POIs — the INHABITED monastic hills, all OFF the main flow:
  pois: [
    { x: 15, y: 3, kind: "shrine", name: "Roadside Reliquary" },                                       // north terraced gardens — heal
    { x: 14, y: 18, kind: "camp", name: "Corrupt-Monks' Camp", pack: ["corruptmonk", "flagellant", "wraith"] }, // south orchard slope — optional fight
    { x: 27, y: 3, kind: "landmark", name: "The Reliquary Stone", note: "A weathered standing stone carved with a litany no living monk will read aloud." }, // NE bell-tower knoll
    { x: 11, y: 11, kind: "signpost", name: "Pilgrim's Marker", note: "Terraced gardens north · orchard slope south · the silent crypt lies east." }, // west fork
  ],
};
const WHISPERHILLS_CAVE: DungeonLayout = {
  w: 16, h: 16, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 13, y: 8 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 }, { x: 8, y: 3, w: 5, h: 4 }, { x: 8, y: 11, w: 5, h: 3 }, { x: 10, y: 6, w: 5, h: 5 },
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 4, y: 11 }],
    [{ x: 4, y: 9 }, { x: 10, y: 4 }, { x: 12, y: 8 }],
    [{ x: 4, y: 12 }, { x: 10, y: 12 }, { x: 12, y: 9 }],
    [{ x: 11, y: 8 }, { x: 12, y: 8 }],
  ],
  chests: [{ x: 10, y: 4 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// ── SPINE region OVERWORLD template (60×24 mesh) + FULL multi-room dungeon (24×24) ─────────────
// Frostpeak Highlands — the cold gate east: frozen peaks + a silent dwarven hold. A frozen pool (water)
// cuts the SW; sparse scatter (white, biting). Mouth = the hold-gate to the Dwarven Stronghold.
const FROSTPEAK_LAYOUT: ZoneLayout = {
  w: 60, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 36, y: 12 }, gateWallX: 36, boss: { x: 56, y: 11 },
  mouth: { x: 36, y: 12 },
  fieldRects: [
    { x: 1, y: 10, w: 6, h: 6 },    // spawn glacial pass mouth (WEST)
    { x: 9, y: 9, w: 7, h: 7 },     // WEST pass hub — three tracks leave it
    { x: 11, y: 2, w: 8, h: 5 },    // north frozen ridge (chest)
    { x: 10, y: 17, w: 9, h: 5 },   // south icefall (chest) + frozen-pool crossing
    { x: 22, y: 9, w: 7, h: 7 },    // CENTRAL glacier hub — the tracks rejoin
    { x: 23, y: 2, w: 8, h: 5 },    // NE crystal field (chest, off the north loop)
    { x: 21, y: 17, w: 9, h: 5 },   // the hanging glacier (the rare crystalline beast lair)
    { x: 30, y: 10, w: 5, h: 5 },   // east staging before the hold-gate
  ],
  fieldPaths: [
    [{ x: 4, y: 12 }, { x: 11, y: 12 }],
    [{ x: 12, y: 9 }, { x: 14, y: 4 }, { x: 26, y: 4 }, { x: 26, y: 9 }],
    [{ x: 15, y: 12 }, { x: 18, y: 12 }, { x: 22, y: 12 }],
    [{ x: 12, y: 15 }, { x: 13, y: 19 }, { x: 26, y: 19 }, { x: 26, y: 15 }],
    [{ x: 28, y: 12 }, { x: 32, y: 12 }, { x: 35, y: 12 }],
    [{ x: 14, y: 4 }, { x: 14, y: 9 }],
    [{ x: 26, y: 6 }, { x: 26, y: 9 }],
  ],
  dunRects: [], dunPaths: [],
  water: [{ x: 7, y: 18, w: 5, h: 3 }], // SW frozen pool (the south track crosses its east lip)
  // VARIED TERRAIN + INHABITED (2026-06-21 roll-out). This is the MOUNTAIN zone, so it LEANS INTO CLIFFS:
  // heavy ridgelines wall and FUNNEL the routes. A frozen MELTWATER STREAM (river kind = a glacial channel)
  // runs the x=19 gap, SEVERING the MIDDLE glacier track (y=12, carried by an ICE BRIDGE) and the SOUTH
  // icefall track (y=19, carried by a FORD over a frozen shallow) — the NORTH frozen-ridge track (y=4) stays
  // dry as the redundant route. Two long CLIFF RIDGELINES squeeze the central glacier hub from north and
  // south (the peaks closing in), plus a ridge edging the hanging glacier — the cold gate's defining terrain.
  rivers: [
    { x: 19, y: 9, w: 1, h: 11 },  // the meltwater stream: crosses the MIDDLE track (y12, ice bridge) + the SOUTH icefall (y19, forded)
    { x: 20, y: 14, w: 1, h: 3 },  // a frozen meander so the stream snakes between the seracs
  ],
  cliffs: [
    { x: 16, y: 7, w: 6, h: 1 },   // north ridgeline closing in on the glacier hub from above
    { x: 16, y: 16, w: 5, h: 1 },  // south ridgeline closing in from below — the two funnel the central approach
    { x: 29, y: 16, w: 2, h: 2 },  // serac wall edging the hanging glacier (the rare lair)
  ],
  bridges: [{ x: 19, y: 12 }],     // the middle track's ice bridge over the meltwater (its only crossing)
  fords: [{ x: 19, y: 19 }],       // the frozen ford reconnecting the icefall↔hanging-glacier loop
  chests: [{ x: 14, y: 3 }, { x: 13, y: 20 }, { x: 26, y: 3 }],
  lair: { x: 25, y: 20 },
  scatter: 0.05,
  // POIs — the INHABITED frozen highlands, all OFF the main flow:
  pois: [
    { x: 16, y: 3, kind: "shrine", name: "Frozen Shrine" },                                            // north frozen ridge — heal
    { x: 15, y: 20, kind: "camp", name: "Frost-Reavers' Camp", pack: ["mtnreaver", "icewolf", "icewolf"] }, // south icefall — optional fight
    { x: 29, y: 4, kind: "landmark", name: "The Dwarven Ruin", note: "A frost-shattered dwarven cairn, runes worn smooth — a road-marker from before the hold went silent." }, // NE crystal field
    { x: 13, y: 13, kind: "signpost", name: "Glacial Waymark", note: "Frozen ridge north · the icefall south · the Dwarven Stronghold's gate lies east." }, // west fork
  ],
};
// The Dwarven Stronghold as its own grid: forks into two looped halls rejoining at a great-hall
// antechamber, a DEAD-END treasury vault off it (richest hoard), a guarded run-up to the boss arena.
const FROSTPEAK_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 },
  rooms: [
    { x: 2, y: 8, w: 6, h: 8 },     // hold-gate entry hall (the fork)
    { x: 10, y: 3, w: 7, h: 5 },    // north forge-hall (chest, on the loop)
    { x: 10, y: 16, w: 7, h: 5 },   // south mine-gallery (chest, on the loop)
    { x: 14, y: 8, w: 5, h: 7 },    // great-hall antechamber hub (the loop rejoins)
    { x: 9, y: 11, w: 4, h: 3 },    // the dead-end treasury vault (RICHEST hoard)
    { x: 17, y: 8, w: 6, h: 6 },    // the guardian's arena
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 5, y: 12 }],
    [{ x: 5, y: 10 }, { x: 13, y: 5 }, { x: 16, y: 9 }],
    [{ x: 5, y: 14 }, { x: 13, y: 18 }, { x: 16, y: 13 }],
    [{ x: 14, y: 12 }, { x: 12, y: 12 }],
    [{ x: 16, y: 11 }, { x: 19, y: 11 }],
  ],
  chests: [{ x: 13, y: 4 }, { x: 13, y: 18 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// Sunbridge — the grand southern port under siege (AURELION FINALE). Harbor water everywhere (two
// pools); sparse scatter (paved quays). Mouth = the citadel/lighthouse the finale dungeon descends from.
const SUNBRIDGE_LAYOUT: ZoneLayout = {
  w: 60, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 36, y: 12 }, gateWallX: 36, boss: { x: 56, y: 11 },
  mouth: { x: 36, y: 12 },
  fieldRects: [
    { x: 1, y: 10, w: 6, h: 6 },    // spawn quays (WEST)
    { x: 9, y: 9, w: 7, h: 7 },     // WEST quay hub — three tracks leave it
    { x: 11, y: 2, w: 8, h: 5 },    // north seawall walk (chest)
    { x: 10, y: 17, w: 9, h: 5 },   // south harbor flats (chest) + harbor-water crossing
    { x: 22, y: 9, w: 7, h: 7 },    // CENTRAL harbor plaza hub
    { x: 23, y: 2, w: 8, h: 5 },    // NE merchant quarter (chest, off the north loop)
    { x: 21, y: 17, w: 9, h: 5 },   // the flooded docks (the rare corsair lair)
    { x: 30, y: 10, w: 5, h: 5 },   // east staging before the citadel mouth
  ],
  fieldPaths: [
    [{ x: 4, y: 12 }, { x: 11, y: 12 }],
    [{ x: 12, y: 9 }, { x: 14, y: 4 }, { x: 26, y: 4 }, { x: 26, y: 9 }],
    [{ x: 15, y: 12 }, { x: 18, y: 12 }, { x: 22, y: 12 }],
    [{ x: 12, y: 15 }, { x: 13, y: 19 }, { x: 26, y: 19 }, { x: 26, y: 15 }],
    [{ x: 28, y: 12 }, { x: 32, y: 12 }, { x: 35, y: 12 }],
    [{ x: 14, y: 4 }, { x: 14, y: 9 }],
    [{ x: 26, y: 6 }, { x: 26, y: 9 }],
  ],
  dunRects: [], dunPaths: [],
  water: [{ x: 7, y: 18, w: 5, h: 4 }, { x: 16, y: 20, w: 4, h: 2 }], // harbor water along the south
  // VARIED TERRAIN + INHABITED (2026-06-21 roll-out — the AURELION FINALE). A HARBOR CHANNEL (river kind =
  // tidal seaway) cuts the x=19 gap between the quay hubs, SEVERING the fast MIDDLE plaza track (y=12,
  // carried by a QUAY BRIDGE) and the SOUTH harbor-flats track (y=19, carried by a FORD over the harbor
  // shallows) — the NORTH seawall walk (y=4) stays dry as the redundant route. The great SEA-WALL (cliff)
  // walls the north-walk↔plaza gap + edges the flooded docks, funnelling the siege-approach to the citadel.
  rivers: [
    { x: 19, y: 9, w: 1, h: 11 },  // the harbor channel: crosses the MIDDLE track (y12, quay bridge) + the SOUTH flats (y19, forded)
    { x: 20, y: 14, w: 1, h: 3 },  // a slipway dog-leg so the channel bends round the moorings
  ],
  cliffs: [
    { x: 16, y: 7, w: 6, h: 1 },   // the great sea-wall between the seawall walk and the harbor plaza
    { x: 29, y: 16, w: 2, h: 2 },  // SE breakwater edging the flooded docks (the rare corsair lair)
  ],
  bridges: [{ x: 19, y: 12 }],     // the harbor plaza's quay bridge over the channel (its only crossing)
  fords: [{ x: 19, y: 19 }],       // the harbor-flats ford reconnecting the flats↔flooded-docks loop
  chests: [{ x: 14, y: 3 }, { x: 13, y: 20 }, { x: 26, y: 3 }],
  lair: { x: 25, y: 20 },
  scatter: 0.04,    // paved quays: least cover of all six
  // POIs — the INHABITED besieged port, all OFF the main flow:
  pois: [
    { x: 16, y: 3, kind: "shrine", name: "Harbor Shrine" },                                            // north seawall walk — heal
    { x: 15, y: 20, kind: "camp", name: "Siege Camp", pack: ["siegetrooper", "searaider", "searaider"] }, // south harbor flats — optional fight
    { x: 29, y: 4, kind: "landmark", name: "The Lighthouse", note: "The citadel's lighthouse, its great lamp dark — the siege snuffed the light that guided Aurelion's ships home." }, // NE merchant quarter
    { x: 13, y: 13, kind: "signpost", name: "Quayside Sign", note: "Seawall walk north · harbor flats south · the besieged citadel lies east." }, // west fork
  ],
};
// The Besieged Citadel / Lighthouse as its own grid: forks into two looped wings rejoining at the
// great-hall antechamber, a DEAD-END treasure vault off it (richest hoard), a guarded run-up to the
// finale boss arena (the lighthouse summit). The continent finale fight lives here.
const SUNBRIDGE_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 },
  rooms: [
    { x: 2, y: 8, w: 6, h: 8 },     // citadel entry hall (the fork)
    { x: 10, y: 3, w: 7, h: 5 },    // north barracks wing (chest, on the loop)
    { x: 10, y: 16, w: 7, h: 5 },   // south cistern wing (chest, on the loop)
    { x: 14, y: 8, w: 5, h: 7 },    // great-hall antechamber hub
    { x: 9, y: 11, w: 4, h: 3 },    // the dead-end treasure vault (RICHEST hoard)
    { x: 17, y: 8, w: 6, h: 6 },    // the lighthouse-summit boss arena
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 5, y: 12 }],
    [{ x: 5, y: 10 }, { x: 13, y: 5 }, { x: 16, y: 9 }],
    [{ x: 5, y: 14 }, { x: 13, y: 18 }, { x: 16, y: 13 }],
    [{ x: 14, y: 12 }, { x: 12, y: 12 }],
    [{ x: 16, y: 11 }, { x: 19, y: 11 }],
  ],
  chests: [{ x: 13, y: 4 }, { x: 13, y: 18 }, { x: 10, y: 12 }],
  scatter: 0.06,
};

// ── World-space placement + region graph (ADR 0008, Stage 1 — world-cartographer) ────────────
// SEAMLESS CONTINUOUS OVERWORLD foundation. Today the engine treats each zone as an isolated grid
// reached by a linear hub chain (`hubs` above) + `loadZone` (controllers/field.ts). ADR 0008's
// target is ONE continuous world the player roams across borders (incl. diagonally) with no load.
// Stage 1 is PURE DATA only: it places every existing region as a rectangle in a single shared
// world-coordinate frame, contiguous + border-aligned + 8-way adjacent, with a consistency test
// (app/tests/worldmap.test.ts). It changes NOTHING the player sees and the engine doesn't consume
// it yet — Stage 2+ (the world-space camera, neighbor streaming, seam blending, position-derived
// region/biome/music/encounters) is an engine build that will read these structures.
//
// WORLD-SPACE CONVENTION. World coords share each zone's local tile grid: a zone occupies the
// rectangle [origin.wx, origin.wx + layout.w) × [origin.wy, origin.wy + layout.h). A tile's world
// position = origin + its local (x,y). Neighbors sit EDGE-TO-EDGE: an eastern neighbor's wx equals
// this zone's (wx + w); a southern neighbor's wy equals this zone's (wy + h). +x = EAST, +y = SOUTH
// (screen convention), so N decreases world-y, E increases world-x.
//
// THE WORLD WE LAID OUT (Aurelion — see docs/design/world-atlas.md):
//   Greenvale (#1, the Shirelands) is the western start. Silverwood (#2, the Ancient Forest) sits
//   EAST of it — you press on through the old forest. The Duskmarsh (Aurelion per Dara's ruling G3,
//   the grim "dark detour") sits SOUTH of Silverwood, low marsh ground. Greenvale and the Duskmarsh
//   meet only at a diagonal CORNER (SE), honoring the "came up the dry road from Greenvale" line
//   (Miregard) without forcing a full shared edge the atlas doesn't dictate.
//
//        x→  0        64        124
//      y    ┌─────────┬──────────┐
//      0    │ Green-  │ Silver-  │
//           │ vale    │ wood     │
//           │ 64×24   │ 60×24    │
//      24   ├─────────┼──────────┤
//           (corner)  │ Dusk-    │
//           │  · · · ·│ marsh    │
//           │         │ 56×22    │
//      46            88└──────────┘ (Duskmarsh: x[64,120], y[24,46])
//
//   Adjacency (8-way, reciprocal):
//     Greenvale  —E →  Silverwood     Silverwood —W →  Greenvale
//     Silverwood —S →  Duskmarsh      Duskmarsh  —N →  Silverwood
//     Greenvale  —SE→  Duskmarsh      Duskmarsh  —NW→  Greenvale   (corner-touch only)
//
// FLAGS FOR DARA (geography the atlas leaves open — §4 G6/G7):
//   • Silverwood-EAST-of-Greenvale and Duskmarsh-SOUTH-of-Silverwood are agent inferences (the atlas
//     fixes neither exact compass adjacency). They match the journey + biome logic but are not yet
//     drawn on Dara's map — confirm or re-orient.
//   • Settlements (Hearthford/Riverhearth/Miregard) are NOT placed as world cells here — see
//     WORLD_SETTLEMENT_NOTE below for the recommendation + open design decision.

/** A zone's top-left world-coordinate (the origin its local tile grid is offset by). */
export interface WorldOrigin { wx: number; wy: number; }

/** 8-way compass directions used by the region graph. */
export type Dir = "N" | "S" | "E" | "W" | "NE" | "NW" | "SE" | "SW";

/** The reciprocal (opposite) of each direction — used to assert mirror-consistency. */
export const OPPOSITE: Record<Dir, Dir> = {
  N: "S", S: "N", E: "W", W: "E", NE: "SW", SW: "NE", NW: "SE", SE: "NW",
};

/** The unit (dx,dy) a direction implies in world-space (+x=E, +y=S). */
export const DIR_DELTA: Record<Dir, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 }, S: { dx: 0, dy: 1 }, E: { dx: 1, dy: 0 }, W: { dx: -1, dy: 0 },
  NE: { dx: 1, dy: -1 }, NW: { dx: -1, dy: -1 }, SE: { dx: 1, dy: 1 }, SW: { dx: -1, dy: 1 },
};

/**
 * One directional adjacency from a region to a neighbor, with the SHARED-BORDER alignment the
 * seamless engine (Stage 2+) and the level-designer need to stitch the seam:
 *  - `dir`    the compass direction to the neighbor (must agree with the two origins' world delta).
 *  - `to`     the neighbor zone id (must be a real ZONES entry).
 *  - `border` the world-space span where the two regions touch. For an E/W edge it's a vertical
 *             segment at a shared world-x (`axis:"x"`, `at`=that x, `from`..`to` the world-y range);
 *             for N/S a horizontal segment at a shared world-y. Diagonal (corner-only) adjacencies
 *             touch at a single world POINT, encoded as a zero-length span (`from === to`).
 *  - `cross`  the recommended world point where a ROAD/PATH should cross the seam (so the
 *             level-designer aligns each side's road to the same coordinate and the crossing is
 *             continuous). Omitted for corner-only diagonals.
 */
export interface WorldEdge {
  dir: Dir;
  to: string;
  border: { axis: "x" | "y"; at: number; from: number; to: number };
  cross?: { wx: number; wy: number };
}

/** A region placed in world-space: its origin + its outward directional edges. */
export interface WorldRegion {
  id: string;                 // matches a ZONES id
  origin: WorldOrigin;        // top-left world coord; rect = [wx,wx+w) × [wy,wy+h) using layout.w/h
  edges: WorldEdge[];
}

// The placement + 8-way region graph. Rects are derived from each zone's layout w/h + origin, so a
// direction is DERIVABLE from the two origins (the test asserts every `dir` agrees with the delta).
// Greenvale at (0,0); Silverwood east at (64,0); Duskmarsh south of Silverwood at (64,24).
//
// SUPERSEDED FOR GEOGRAPHY (ADR 0009). This rect grid was the Stage-1 stitched-grid SKELETON. The
// authoritative GEOGRAPHY (continent/zone/area shapes + map-correct positions) now lives in
// `data/world.ts` as ORGANIC POLYGONS traced from Dara's overworld map — that is the source of truth
// for where regions are. These rects are kept only as the Stage-2 seam-blend ENGINE math scaffolding
// (the `seamBlendBand`/`regionAtWorld`/`localOf`/`worldOf` helpers + worldspace/worldmap tests still
// exercise them); they no longer drive the hierarchy and intentionally don't match the world.ts shapes.
export const WORLD_REGIONS: WorldRegion[] = [
  {
    id: "greenvale", origin: { wx: 0, wy: 0 },
    edges: [
      // East edge (world-x = 0+64 = 64) meets Silverwood's west edge over the full shared height.
      { dir: "E", to: "silverwood", border: { axis: "x", at: 64, from: 0, to: 24 }, cross: { wx: 64, wy: 12 } },
      // SE diagonal: Greenvale's SE corner (64,24) is the Duskmarsh's NW corner — corner-touch only.
      { dir: "SE", to: "duskmarsh", border: { axis: "x", at: 64, from: 24, to: 24 } },
    ],
  },
  {
    id: "silverwood", origin: { wx: 64, wy: 0 },
    edges: [
      // West edge (world-x = 64) meets Greenvale's east edge (reciprocal of Greenvale —E→).
      { dir: "W", to: "greenvale", border: { axis: "x", at: 64, from: 0, to: 24 }, cross: { wx: 64, wy: 12 } },
      // South edge (world-y = 0+24 = 24) meets the Duskmarsh's north edge over the shared width.
      { dir: "S", to: "duskmarsh", border: { axis: "y", at: 24, from: 64, to: 120 }, cross: { wx: 88, wy: 24 } },
    ],
  },
  {
    id: "duskmarsh", origin: { wx: 64, wy: 24 },
    edges: [
      // North edge (world-y = 24) meets Silverwood's south edge (reciprocal of Silverwood —S→).
      { dir: "N", to: "silverwood", border: { axis: "y", at: 24, from: 64, to: 120 }, cross: { wx: 88, wy: 24 } },
      // NW diagonal: the Duskmarsh's NW corner (64,24) is Greenvale's SE corner — corner-touch only.
      { dir: "NW", to: "greenvale", border: { axis: "x", at: 64, from: 24, to: 24 } },
      // East edge (world-x = 64+56 = 120) meets Goldmeadow's west edge (the journey presses on E into
      // the plains). Shared y-overlap = the Duskmarsh's full height (the shorter rect): [24,46).
      { dir: "E", to: "goldmeadow", border: { axis: "x", at: 120, from: 24, to: 46 }, cross: { wx: 120, wy: 35 } },
    ],
  },
  {
    // Goldmeadow Plains (60×24) — EAST of the Duskmarsh, continuing the journey into the breadbasket.
    // (Legacy Stage-1 rect frame; the authoritative organic geography lives in data/world.ts.)
    id: "goldmeadow", origin: { wx: 120, wy: 24 },
    edges: [
      // West edge (world-x = 120) meets the Duskmarsh's east edge (reciprocal of Duskmarsh —E→).
      { dir: "W", to: "duskmarsh", border: { axis: "x", at: 120, from: 24, to: 46 }, cross: { wx: 120, wy: 35 } },
      // AURELION COMPLETE: the journey branches on from the breadbasket. East edge (world-x = 180) meets
      // Frostpeak's west edge (the SPINE pushes east into the cold mountains).
      { dir: "E", to: "frostpeak", border: { axis: "x", at: 180, from: 24, to: 48 }, cross: { wx: 180, wy: 36 } },
      // South edge (world-y = 48) meets Riverhearth's north edge (the optional center detour).
      { dir: "S", to: "riverhearth", border: { axis: "y", at: 48, from: 120, to: 172 }, cross: { wx: 146, wy: 48 } },
    ],
  },
  // ── AURELION COMPLETE — the remaining six in the legacy stitched-grid frame (world-builder 2026-06-21) ──
  // Geography authority is the organic polygons in data/world.ts; this rect frame is only the Stage-2
  // seam-blend ENGINE scaffolding (worldspace/worldmap tests exercise it), so the layout is a clean,
  // contiguous, non-overlapping stitch that mirrors the journey graph, NOT the polygon map exactly.
  // SPINE row east of Goldmeadow: Frostpeak [180,240)×[24,48) → Sunbridge [240,300)×[24,48).
  // OPTIONAL row south (y=48 seam): Storm Coast [68,120) · Riverhearth [120,172) · Dawnfall [172,224) ·
  //   Whisper Hills [224,276), each ×[48,70).
  {
    id: "frostpeak", origin: { wx: 180, wy: 24 },
    edges: [
      { dir: "W", to: "goldmeadow", border: { axis: "x", at: 180, from: 24, to: 48 }, cross: { wx: 180, wy: 36 } },
      { dir: "E", to: "sunbridge", border: { axis: "x", at: 240, from: 24, to: 48 }, cross: { wx: 240, wy: 36 } },
    ],
  },
  {
    id: "sunbridge", origin: { wx: 240, wy: 24 },
    edges: [
      { dir: "W", to: "frostpeak", border: { axis: "x", at: 240, from: 24, to: 48 }, cross: { wx: 240, wy: 36 } },
    ],
  },
  {
    id: "stormcoast", origin: { wx: 68, wy: 48 },
    edges: [
      { dir: "E", to: "riverhearth", border: { axis: "x", at: 120, from: 48, to: 70 }, cross: { wx: 120, wy: 59 } },
    ],
  },
  {
    id: "riverhearth", origin: { wx: 120, wy: 48 },
    edges: [
      { dir: "N", to: "goldmeadow", border: { axis: "y", at: 48, from: 120, to: 172 }, cross: { wx: 146, wy: 48 } },
      { dir: "W", to: "stormcoast", border: { axis: "x", at: 120, from: 48, to: 70 }, cross: { wx: 120, wy: 59 } },
      { dir: "E", to: "dawnfall", border: { axis: "x", at: 172, from: 48, to: 70 }, cross: { wx: 172, wy: 59 } },
    ],
  },
  {
    id: "dawnfall", origin: { wx: 172, wy: 48 },
    edges: [
      { dir: "W", to: "riverhearth", border: { axis: "x", at: 172, from: 48, to: 70 }, cross: { wx: 172, wy: 59 } },
      { dir: "E", to: "whisperhills", border: { axis: "x", at: 224, from: 48, to: 70 }, cross: { wx: 224, wy: 59 } },
    ],
  },
  {
    id: "whisperhills", origin: { wx: 224, wy: 48 },
    edges: [
      { dir: "W", to: "dawnfall", border: { axis: "x", at: 224, from: 48, to: 70 }, cross: { wx: 224, wy: 59 } },
    ],
  },
];

/** Look up a region's world placement by zone id. */
export function worldRegion(id: string): WorldRegion | undefined {
  return WORLD_REGIONS.find((r) => r.id === id);
}

/** A region's world-space rectangle (origin + its zone layout's w/h). */
export function worldRect(id: string): { x0: number; y0: number; x1: number; y1: number } | undefined {
  const r = worldRegion(id);
  const z = ZONES.find((zz) => zz.id === id);
  if (!r || !z) return undefined;
  return { x0: r.origin.wx, y0: r.origin.wy, x1: r.origin.wx + z.layout.w, y1: r.origin.wy + z.layout.h };
}

// ── World-space helpers (ADR 0008 Stage 2, step 1 — PURE, no engine consumer yet) ─────────────
// Convert between a region's local tile grid and the shared world frame, and answer "who owns this
// world tile?". A world tile (wx,wy) belongs to a region when it falls inside that region's
// worldRect (half-open: [x0,x1) × [y0,y1)) — so a shared seam at x1 belongs to the EASTERN/SOUTHERN
// neighbour (whose rect starts there), never to two regions at once. The Stage-2 renderer/movement
// (Chunk B) will read these; they're invisible until then.

/** The region (zone id) that owns a world tile, or undefined if outside every placed region. */
export function regionAtWorld(wx: number, wy: number): string | undefined {
  for (const r of WORLD_REGIONS) {
    const rect = worldRect(r.id);
    if (rect && wx >= rect.x0 && wx < rect.x1 && wy >= rect.y0 && wy < rect.y1) return r.id;
  }
  return undefined;
}

/** Every region whose world-rect overlaps the (half-open) world-space rectangle [x0,y0)..[x1,y1). */
export function regionsOverlappingRect(x0: number, y0: number, x1: number, y1: number): string[] {
  const lo = { x: Math.min(x0, x1), y: Math.min(y0, y1) };
  const hi = { x: Math.max(x0, x1), y: Math.max(y0, y1) };
  const out: string[] = [];
  for (const r of WORLD_REGIONS) {
    const rect = worldRect(r.id);
    if (rect && rect.x0 < hi.x && lo.x < rect.x1 && rect.y0 < hi.y && lo.y < rect.y1) out.push(r.id);
  }
  return out;
}

/** World tile → a region's LOCAL tile coord (subtract its origin). undefined if the region isn't placed. */
export function localOf(id: string, wx: number, wy: number): Pt | undefined {
  const r = worldRegion(id);
  if (!r) return undefined;
  return { x: wx - r.origin.wx, y: wy - r.origin.wy };
}

/** A region's LOCAL tile coord → the shared WORLD frame (add its origin). undefined if not placed. */
export function worldOf(id: string, lx: number, ly: number): Pt | undefined {
  const r = worldRegion(id);
  if (!r) return undefined;
  return { x: lx + r.origin.wx, y: ly + r.origin.wy };
}

/**
 * The render-only BLEND BAND for a seam edge: the ±K-tile world span across the seam where the two
 * regions' ground dithers from one biome into the other (ADR 0008 §3 / step 4). Returns the band as
 * a world-space rectangle straddling the border line plus the perpendicular `from..to` span and the
 * `axis` the seam runs along — purely a rendering hint (it does NOT change tile ownership or
 * passability; `regionAtWorld` stays the source of truth). Diagonal corner-only edges (zero-length
 * border span) and edges with no shared span return undefined (nothing to blend). K defaults to 3.
 */
export function seamBlendBand(edge: WorldEdge, k = 3): { axis: "x" | "y"; from: number; to: number; lo: number; hi: number } | undefined {
  const b = edge.border;
  if (b.from === b.to) return undefined; // corner-touch: a single point, no band to blend
  return { axis: b.axis, from: b.from, to: b.to, lo: b.at - k, hi: b.at + k };
}

/**
 * SETTLEMENT PLACEMENT — recommendation + OPEN DESIGN DECISION for Dara (ADR 0008 §5).
 *
 * ADR 0008 makes the OVERWORLD seamless but keeps DUNGEONS (and, by the same logic, ENTERED
 * settlements) as discrete spaces with a deliberate threshold — you walk up to a door/gate and step
 * into a bespoke interior map. So Hearthford, Riverhearth and Miregard do NOT need their own
 * world-space cells: they read most naturally as POIs that LIVE INSIDE a region's rectangle (a town
 * marker on the seamless overworld you step into), not as separate tiles of the world grid.
 *
 * Recommended homes (each fronts the zone that already references it via `hub`/`hubs`):
 *   • Hearthford  → a POI inside GREENVALE  (its starting village; today the zone's opening hub).
 *   • Riverhearth → a POI inside SILVERWOOD (the trade capital the player reaches inbound; atlas #5).
 *   • Miregard    → a POI inside the DUSKMARSH (its grim marsh-edge doorstep).
 *
 * OPEN for Dara: (a) Riverhearth is Aurelion's CAPITAL (atlas #5) and a multi-region trade hub — it
 * may deserve its OWN world cell/region rather than sitting inside Silverwood, once more of Aurelion
 * exists to branch from. (b) Whether entered-settlements stay discrete interiors or are eventually
 * stitched into the seamless overworld too. Both are design calls — flag, don't invent. This Stage-1
 * data deliberately does NOT place settlement cells; it records the recommendation only.
 */
export const WORLD_SETTLEMENT_NOTE = {
  hearthford: "greenvale",
  riverhearth: "silverwood",
  miregard: "duskmarsh",
} as const;

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "brigand", miniAdds: ["gbandit", "gbandit"], boss: "kingpin",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren", layout: GREENVALE_DUNGEON }, bands: ENCOUNTERS, layout: GREENVALE_LAYOUT, hub: "hearthford", hubs: ["hearthford"] },
  // ── ZONE 2 (index 1): Silverwood, the Ancient Forest (Lv 7–9) ──
  // Inbound from Greenvale the player celebrates in the grand trade capital Riverhearth (the
  // triumphant breather hub) and then steps into the old forest. The Elder Treant gates the way to
  // the Sunless Grove; the Hollow King waits at its heart. Attunements stay SPREAD (Dara's
  // no-region-identity ruling — the forest is NOT an ANIMA theme). Bands are first-pass (teach →
  // combine); balance-tuner owns the final numbers across the now-3-zone curve.
  { id: "silverwood", name: "Silverwood", mini: "treantelder", miniAdds: ["thornling", "thornling"], boss: "hollowking",
    hub: "riverhearth", hubs: ["riverhearth"],
    envs: ["forest", "forest", "forest", "forest"], dungeon: { name: "The Sunless Grove", env: "grove", layout: SILVERWOOD_DUNGEON }, layout: SILVERWOOD_LAYOUT, bands: [
      // teach the new roster one/two at a time, then start combining toward the gate.
      { at: 0.0, sets: [["dwolf", "dwolf"], ["thornling", "dwolf"], ["dwolf", "thornling"]] },
      { at: 0.18, sets: [["dwolf", "thornling", "dwolf"], ["sylvanarcher", "dwolf"], ["thornling", "thornling", "dwolf"]] },
      { at: 0.36, sets: [["sylvanarcher", "dwolf", "thornling"], ["gloomwisp", "dwolf", "dwolf"], ["sylvanarcher", "thornling", "dwolf"]] },
      { at: 0.54, sets: [["gloomwisp", "sylvanarcher", "dwolf"], ["barkbrute", "dwolf", "thornling"], ["sylvanarcher", "gloomwisp", "thornling"]] },
      { at: 0.72, sets: [["barkbrute", "sylvanarcher", "dwolf"], ["spriggan", "gloomwisp", "thornling"], ["barkbrute", "spriggan", "sylvanarcher"]] },
    ] },
  // ── ZONE 3 (index 2): The Duskmarsh → the Drowned Vault (Lv 10+) ──
  // Inbound from Silverwood, the grim marsh outpost Miregard is the Duskmarsh's doorstep (Riverhearth
  // now belongs to Silverwood's chain). `hub` stays "miregard" (the true doorstep) for back-compat.
  { id: "duskmarsh", name: "The Duskmarsh", mini: "broodmother", miniAdds: ["spider", "spider"], boss: "troll", hub: "miregard", hubs: ["miregard"],
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "vault", layout: DUSKMARSH_DUNGEON }, layout: DUSKMARSH_LAYOUT, bands: [
      { at: 0.0, sets: [["rat", "rat", "spider"], ["spider", "rat"], ["rat", "rat", "spider"]] },
      { at: 0.2, sets: [["rat", "spider", "rat"], ["leper", "rat", "rat"], ["direrat", "rat", "spider"]] },
      { at: 0.4, sets: [["leper", "rat", "spider"], ["spider", "bonespider", "rat"], ["direrat", "spider", "rat"]] },
      { at: 0.6, sets: [["leper", "direrat", "rat"], ["bonespider", "spider", "rat"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper", "rat"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
  // ── ZONE 4 (index 3): Goldmeadow Plains → the occupied Windmill (Lv 11–15) ──
  // First BACKLOG FILL (world-builder brief 2026-06-21): the journey's step PAST the Duskmarsh into
  // Aurelion's breadbasket war-front. Inbound hub is a PLACEHOLDER ("miregard") — narrative-writer
  // assigns the real plains doorstep settlement next. dungeon env = "granary" (the audio layer already
  // maps Goldmeadow's dungeon to the granary theme; no render-env for it yet — art/render falls back
  // to the closest tileset until Dara's granary art lands; FLAG for art-integrator).
  //
  // CAST — the real plains war-host roster is wired (encounter-designer authored, names DRAFT per
  // Dara): Plains Raider / Field Marauder / Plains Harrier / Wild Dog / Carrion Bird / Iron Reaver
  // skirmish the open fields; the Raider War-Captain gates the windmill mouth (escorted by marauders);
  // The Reaping Warlord crowns the host as the run-ender; the Gilded Sow is the wheat's rare beast.
  // mini/miniAdds/boss are the live roster. balance-tuner owns the numbers.
  { id: "goldmeadow", name: "Goldmeadow Plains", mini: "warcaptain", miniAdds: ["marauder", "marauder"], boss: "warlord",
    hub: "miregard", hubs: ["miregard"], // PLACEHOLDER doorstep — narrative-writer assigns the real plains hub
    envs: ["plains", "plains", "plains", "plains"], dungeon: { name: "The Windmill Undercroft", env: "granary", layout: GOLDMEADOW_DUNGEON }, layout: GOLDMEADOW_LAYOUT, bands: [
      // TEACH→COMBINE: open the plains with the fast predators (marauder/wilddog) read clean, then
      // fold in the torch-bruiser (raider) + ranged harrier, then the leecher (carrion), and reserve
      // the armored wall (reaver) + full war-host packs for the run to the mouth gate. Set sizes vary
      // per band so cadence isn't monotone. Attunements stay spread (no region identity).
      { at: 0.0, sets: [["marauder", "wilddog"], ["wilddog", "wilddog"], ["marauder", "wilddog", "wilddog"]] },
      { at: 0.2, sets: [["raider", "wilddog"], ["harrier", "marauder"], ["raider", "marauder", "wilddog"], ["wilddog", "wilddog", "marauder"]] },
      { at: 0.4, sets: [["raider", "harrier", "wilddog"], ["carrion", "marauder", "wilddog"], ["raider", "carrion"], ["harrier", "raider", "marauder", "wilddog"]] },
      { at: 0.6, sets: [["reaver", "harrier", "wilddog"], ["raider", "carrion", "marauder"], ["reaver", "raider", "wilddog"], ["harrier", "carrion", "marauder", "wilddog"]] },
      { at: 0.8, sets: [["reaver", "raider", "harrier", "carrion"], ["reaver", "raider", "marauder", "wilddog"], ["reaver", "harrier", "carrion", "wilddog", "marauder"], ["raider", "reaver", "carrion", "harrier"]] },
    ] },
  // ══ AURELION COMPLETE — the remaining six regions (world-builder build 2026-06-21) ════════════
  // SCAFFOLD ONLY: layouts + slots are authored (level-designer, Phase A); the bands/mini/miniAdds/boss
  // borrow the GOLDMEADOW war-host roster (raider/marauder/harrier/wilddog/carrion/reaver/warcaptain/
  // warlord) as PLACEHOLDER enemy keys so the data compiles + sims. encounter-designer (Phase next)
  // replaces every key with each region's real cast (spread Attunements, no region identity). The bands
  // simply ramp set sizes by depth — they are NOT the final encounter curve; balance-tuner owns numbers.
  // OPTIONAL regions (stormcoast/riverhearth/dawnfall/whisperhills) → small CAVE + champion guardian.
  // SPINE regions (frostpeak, sunbridge) → full dungeon + boss. sunbridge is the LAST entry (run-ender).
  //
  // ── OPTIONAL: Storm Coast → a sea-cave (Lv 13–17) ──
  // CAST (encounter-designer, real roster): wreckers/pirates + sea-beasts. TEACH→COMBINE — open with the
  // fast cutthroat + the crab tank read clean, fold in the wrecker (rust/poison bruiser) + slinger
  // (ranged), then the brine-serpent leecher, reserving the gnarliest 4-packs for the run to the
  // sea-cave mouth. Champion guardian = the Wrecker-Captain (boss:true cave payoff). Optional region =
  // 4 bands (lighter than the 5-band spine). Attunements spread (NOX/SOL/QUANTA/ANIMA/UMBRAXIS).
  { id: "stormcoast", name: "Storm Coast", mini: "wreckcaptain", miniAdds: ["cutthroat", "cutthroat"], boss: "wreckcaptain",
    envs: ["coast", "coast", "coast", "coast"], dungeon: { name: "The Smuggler's Sea-Cave", env: "seacave", layout: STORMCOAST_CAVE }, layout: STORMCOAST_LAYOUT, bands: [
      { at: 0.0, sets: [["cutthroat", "cutthroat"], ["shellcrab", "cutthroat"], ["cutthroat", "cutthroat", "shellcrab"]] },
      { at: 0.25, sets: [["wrecker", "cutthroat"], ["deckhand", "cutthroat"], ["wrecker", "cutthroat", "shellcrab"], ["deckhand", "wrecker"]] },
      { at: 0.5, sets: [["wrecker", "deckhand", "cutthroat"], ["seaserpent", "cutthroat", "shellcrab"], ["wrecker", "shellcrab", "deckhand"]] },
      { at: 0.75, sets: [["wrecker", "deckhand", "seaserpent", "cutthroat"], ["shellcrab", "wrecker", "seaserpent"], ["wrecker", "deckhand", "shellcrab", "cutthroat"]] },
    ] },
  // ── OPTIONAL: Riverhearth outskirts → a smugglers' den (Lv 15–18); hub = the existing Riverhearth city ──
  // CAST: road-bandits, smugglers, river-toughs. Opens tougher than Storm Coast (higher band) — start
  // with the road-bandit + fast footpad, fold in the crossbow smuggler + river-tough wall, then the
  // den-fence leecher, reserving full 4-packs for the den mouth. Champion = the River Crime-Lord.
  { id: "riverhearth", name: "Riverhearth Outskirts", mini: "crimelord", miniAdds: ["roadbandit", "footpad"], boss: "crimelord",
    hub: "riverhearth", hubs: ["riverhearth"],
    envs: ["riverside", "road", "town", "riverside"], dungeon: { name: "The Smugglers' Den", env: "smuggden", layout: RIVERHEARTH_CAVE }, layout: RIVERHEARTH_LAYOUT, bands: [
      { at: 0.0, sets: [["roadbandit", "footpad"], ["footpad", "footpad"], ["roadbandit", "footpad", "footpad"]] },
      { at: 0.25, sets: [["roadbandit", "smuggler", "footpad"], ["rivertough", "footpad"], ["smuggler", "roadbandit"], ["roadbandit", "footpad", "smuggler"]] },
      { at: 0.5, sets: [["rivertough", "smuggler", "footpad"], ["fence", "roadbandit", "footpad"], ["rivertough", "roadbandit", "smuggler"]] },
      { at: 0.75, sets: [["rivertough", "smuggler", "fence", "footpad"], ["rivertough", "roadbandit", "fence"], ["smuggler", "rivertough", "fence", "footpad"]] },
    ] },
  // ── SPINE: Frostpeak Highlands → the Dwarven Stronghold (Lv 16–20) ──
  // CAST: frost beasts (ice wolves, a snow-troll) + mountain reavers + awakened dwarven stone-sentinels.
  // SPINE = full 5-band teach→combine. Open with the fast ice-wolf pack + reaver bruiser, introduce the
  // hexing frost-shade caster (behind the fodder) + the slow stone-sentinel wall, then the snow-troll
  // heavy, escalating to gnarly 4-packs in the stronghold. Mini = the Hold-Warden (escorted by reavers).
  // Boss = the Glacier Guardian (ENRAGE). Attunements spread (QUANTA/NOX/UMBRAXIS/SOL/ANIMA).
  { id: "frostpeak", name: "Frostpeak Highlands", mini: "holdwarden", miniAdds: ["mtnreaver", "mtnreaver"], boss: "frostguardian",
    envs: ["snow", "snow", "ice", "stone"], dungeon: { name: "The Dwarven Stronghold", env: "stronghold", layout: FROSTPEAK_DUNGEON }, layout: FROSTPEAK_LAYOUT, bands: [
      { at: 0.0, sets: [["icewolf", "icewolf"], ["mtnreaver", "icewolf"], ["icewolf", "icewolf", "mtnreaver"]] },
      { at: 0.2, sets: [["mtnreaver", "icewolf", "icewolf"], ["frostshade", "icewolf"], ["mtnreaver", "frostshade", "icewolf"], ["icewolf", "icewolf", "icewolf"]] },
      { at: 0.4, sets: [["stonesentinel", "icewolf", "icewolf"], ["frostshade", "mtnreaver", "icewolf"], ["stonesentinel", "frostshade", "icewolf"]] },
      { at: 0.6, sets: [["snowtroll", "icewolf", "icewolf"], ["stonesentinel", "mtnreaver", "frostshade"], ["snowtroll", "frostshade", "icewolf"], ["stonesentinel", "mtnreaver", "icewolf"]] },
      { at: 0.8, sets: [["snowtroll", "stonesentinel", "frostshade", "icewolf"], ["stonesentinel", "mtnreaver", "frostshade", "icewolf"], ["snowtroll", "stonesentinel", "mtnreaver", "frostshade"]] },
    ] },
  // ── OPTIONAL: Dawnfall Hold → the breached undervault (Lv 17–21) ──
  // CAST: the wilds that broke the fort + the hold's fallen watch. Open with the feral frontier-beast +
  // the poison-spear broken-watch, fold in the garrison-ghoul leecher + the fallen-archer harrier, then
  // the heavy rampart-hulk wall, reserving full 4-packs for the breached undervault. Champion = the
  // Fallen Watch-Commander. Attunements spread (ANIMA/NOX/UMBRAXIS/QUANTA/SOL).
  { id: "dawnfall", name: "Dawnfall Hold", mini: "watchcommander", miniAdds: ["brokenwatch", "fallenarcher"], boss: "watchcommander",
    envs: ["ruin", "ruin", "stone", "ruin"], dungeon: { name: "The Breached Undervault", env: "keepvault", layout: DAWNFALL_CAVE }, layout: DAWNFALL_LAYOUT, bands: [
      { at: 0.0, sets: [["frontierbeast", "brokenwatch"], ["frontierbeast", "frontierbeast"], ["brokenwatch", "frontierbeast", "frontierbeast"]] },
      { at: 0.25, sets: [["brokenwatch", "fallenarcher", "frontierbeast"], ["watchghoul", "frontierbeast"], ["brokenwatch", "watchghoul", "frontierbeast"], ["fallenarcher", "brokenwatch"]] },
      { at: 0.5, sets: [["ruinhulk", "fallenarcher", "frontierbeast"], ["watchghoul", "brokenwatch", "fallenarcher"], ["ruinhulk", "brokenwatch", "frontierbeast"]] },
      { at: 0.75, sets: [["ruinhulk", "brokenwatch", "watchghoul", "fallenarcher"], ["ruinhulk", "watchghoul", "brokenwatch"], ["ruinhulk", "fallenarcher", "watchghoul", "frontierbeast"]] },
    ] },
  // ── OPTIONAL: Whisper Hills → the crypt/reliquary (Lv 19–23) ──
  // CAST: restless spirits + corrupted monks. Open with the fast flitting wraith + the chanting
  // corrupted-monk caster (a caster-behind-fodder shape early, since the hills are eerie), fold in the
  // poison-zealot flagellant + the soul-leech revenant, then the heavy reliquary-golem wall, reserving
  // full 4-packs for the crypt. Champion = the Corrupted Abbot (a caster-boss, rally+hex). Attunements
  // spread (UMBRAXIS/ANIMA/NOX/QUANTA/SOL).
  { id: "whisperhills", name: "Whisper Hills", mini: "corruptabbot", miniAdds: ["corruptmonk", "wraith"], boss: "corruptabbot",
    envs: ["meadow", "meadow", "forest", "hollow"], dungeon: { name: "The Reliquary Crypt", env: "crypt", layout: WHISPERHILLS_CAVE }, layout: WHISPERHILLS_LAYOUT, bands: [
      { at: 0.0, sets: [["wraith", "wraith"], ["corruptmonk", "wraith"], ["wraith", "wraith", "corruptmonk"]] },
      { at: 0.25, sets: [["corruptmonk", "flagellant", "wraith"], ["flagellant", "wraith"], ["corruptmonk", "wraith", "flagellant"], ["flagellant", "flagellant", "wraith"]] },
      { at: 0.5, sets: [["revenant", "corruptmonk", "wraith"], ["flagellant", "revenant", "wraith"], ["reliquarygolem", "wraith", "wraith"]] },
      { at: 0.75, sets: [["reliquarygolem", "corruptmonk", "revenant", "wraith"], ["reliquarygolem", "flagellant", "corruptmonk"], ["revenant", "reliquarygolem", "flagellant", "wraith"]] },
    ] },
  // ── SPINE FINALE: Sunbridge → the Besieged Citadel / Lighthouse (Lv 21–25). LAST IN ZONES = run-ender. ──
  // CAST: the besieging host + sea-raiders + something risen from the deep. SPINE FINALE = full 5-band
  // teach→combine, the steepest curve + the only band that goes to FIVE-enemy packs (the climax). Open
  // with the siege-trooper bruiser + the fast sea-raider boarder, fold in the ballista harrier + the
  // poison abyssal-spawn, then the drowned leecher + the heavy siege-ram wall, escalating to brutal
  // 5-packs in the citadel. Mini = the Siege Captain (escorted by troopers). Boss = the Risen Leviathan
  // (ENRAGE) — the hardest fight in the game. Attunements spread (NOX/SOL/QUANTA/ANIMA/UMBRAXIS).
  { id: "sunbridge", name: "Sunbridge", mini: "siegecaptain", miniAdds: ["siegetrooper", "searaider"], boss: "leviathan",
    envs: ["harbor", "coast", "harbor", "harbor"], dungeon: { name: "The Besieged Citadel", env: "citadel", layout: SUNBRIDGE_DUNGEON }, layout: SUNBRIDGE_LAYOUT, bands: [
      { at: 0.0, sets: [["siegetrooper", "searaider"], ["searaider", "searaider"], ["siegetrooper", "searaider", "searaider"]] },
      { at: 0.2, sets: [["siegetrooper", "ballista", "searaider"], ["abyssspawn", "searaider"], ["siegetrooper", "abyssspawn", "searaider"], ["ballista", "siegetrooper", "searaider"]] },
      { at: 0.4, sets: [["drowned", "ballista", "searaider"], ["siegeram", "siegetrooper", "searaider"], ["abyssspawn", "drowned", "siegetrooper"], ["siegeram", "ballista", "searaider"]] },
      { at: 0.6, sets: [["siegeram", "ballista", "drowned", "searaider"], ["abyssspawn", "siegeram", "drowned"], ["siegeram", "siegetrooper", "ballista", "searaider"]] },
      { at: 0.8, sets: [["siegeram", "siegetrooper", "ballista", "drowned", "searaider"], ["siegeram", "abyssspawn", "drowned", "ballista"], ["siegeram", "siegetrooper", "abyssspawn", "drowned", "ballista"]] },
    ] },
];
