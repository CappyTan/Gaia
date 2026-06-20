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
  /** Overworld (west of the gate wall) carved space + roads. */
  fieldRects: Rect[];
  fieldPaths: Path[];
  /** Dungeon (east of the gate wall) carved rooms + corridors. */
  dunRects: Rect[];
  dunPaths: Path[];
  /** Treasure chests (overworld + dungeon). Each gets a guaranteed walkable approach. */
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
}

export interface Zone {
  id: string;
  name: string;
  mini: string;
  miniAdds?: string[];
  boss: string;
  envs: string[];
  bands: EncounterBand[];
  /** The dungeon past the mini-boss gate: own name + environment, tougher enemies. */
  dungeon: { name: string; env: string };
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
const GREENVALE_LAYOUT: ZoneLayout = {
  w: 64, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 40, y: 12 }, gateWallX: 40, boss: { x: 60, y: 11 },
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
  dunRects: [
    { x: 42, y: 8, w: 6, h: 8 },    // warren entry hall (the fork)
    { x: 50, y: 3, w: 7, h: 5 },    // north guard chamber (chest, on the loop)
    { x: 50, y: 16, w: 7, h: 5 },   // south store room (chest, on the loop)
    { x: 54, y: 8, w: 5, h: 7 },    // antechamber hub (the loop rejoins here)
    { x: 57, y: 8, w: 6, h: 6 },    // the Kingpin's arena
  ],
  dunPaths: [
    [{ x: 41, y: 12 }, { x: 45, y: 12 }],                          // gate → entry hall
    [{ x: 45, y: 10 }, { x: 53, y: 5 }, { x: 56, y: 9 }],          // hall → north chamber → antechamber
    [{ x: 45, y: 14 }, { x: 53, y: 18 }, { x: 56, y: 13 }],        // hall → south store → antechamber (the LOOP)
    [{ x: 56, y: 11 }, { x: 59, y: 11 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 15, y: 3 },   // orchard (north road)
    { x: 14, y: 20 },  // meadow (south road)
    { x: 27, y: 3 },   // NE thicket (north ridge crest, off the safe road)
    { x: 53, y: 18 },  // south store room (dungeon loop, richest)
    { x: 53, y: 4 },   // north guard chamber (dungeon loop, breather reward)
  ],
  lair: { x: 27, y: 20 }, // Hogger, deep in the southern grove off the south loop
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
  dunRects: [
    { x: 38, y: 8, w: 6, h: 8 },    // grove root-hall (the fork)
    { x: 46, y: 3, w: 6, h: 5 },    // north hollow bole (chest, on the loop)
    { x: 45, y: 16, w: 7, h: 5 },   // south fungal gallery (chest, on the loop)
    { x: 50, y: 8, w: 5, h: 7 },    // root-stair antechamber hub (the loop rejoins)
    { x: 53, y: 8, w: 6, h: 6 },    // the Hollow King's heartwood arena
  ],
  dunPaths: [
    [{ x: 37, y: 12 }, { x: 41, y: 12 }],                          // gate → root-hall
    [{ x: 41, y: 10 }, { x: 49, y: 5 }, { x: 52, y: 9 }],          // hall → north bole → antechamber
    [{ x: 41, y: 14 }, { x: 48, y: 18 }, { x: 52, y: 13 }],        // hall → south gallery → antechamber (the LOOP)
    [{ x: 52, y: 11 }, { x: 55, y: 11 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 14, y: 4 },   // north fern hollow (north trail)
    { x: 13, y: 20 },  // south sunken-root hollow (south trail)
    { x: 25, y: 4 },   // NE canopy nook (north crest, off the safe trail)
    { x: 48, y: 18 },  // south fungal gallery (dungeon loop, rich)
    { x: 49, y: 4 },   // north hollow bole (dungeon loop, breather)
  ],
  lair: { x: 24, y: 20 }, // the Mossback Tortoise dens deep in the southern mossbed off the south loop
  scatter: 0.09,          // denser scatter than the shire: ferns/mushrooms thick on the floor
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
  dunRects: [
    { x: 34, y: 7, w: 6, h: 8 },    // vault entry hall (the flooded sump fork)
    { x: 42, y: 2, w: 6, h: 5 },    // north drowned gallery (chest, on the loop)
    { x: 41, y: 15, w: 6, h: 5 },   // south drowned cell (chest, on the loop)
    { x: 46, y: 7, w: 5, h: 7 },    // sunken-stair antechamber hub (the loop rejoins)
    { x: 49, y: 7, w: 6, h: 6 },    // the Cave Troll's deep arena
  ],
  dunPaths: [
    [{ x: 33, y: 11 }, { x: 37, y: 11 }],                          // gate → entry hall
    [{ x: 37, y: 9 }, { x: 45, y: 4 }, { x: 48, y: 8 }],           // hall → north gallery → antechamber
    [{ x: 37, y: 13 }, { x: 44, y: 17 }, { x: 48, y: 12 }],        // hall → south cell → antechamber (the LOOP)
    [{ x: 48, y: 10 }, { x: 51, y: 10 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 12, y: 3 },   // north bog pocket (north causeway)
    { x: 13, y: 18 },  // sunken ruin (south causeway, shares the ruin with the lair)
    { x: 44, y: 3 },   // north drowned gallery (dungeon loop)
    { x: 44, y: 18 },  // south drowned cell (dungeon loop)
    { x: 48, y: 12 },  // deepest — by the arena threshold (richest, rewards the brave)
  ],
  lair: { x: 11, y: 18 }, // the rare beast dens in the flooded ruin stones off the south road
  scatter: 0.07,
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
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren" }, bands: ENCOUNTERS, layout: GREENVALE_LAYOUT, hub: "hearthford", hubs: ["hearthford"] },
  // ── ZONE 2 (index 1): Silverwood, the Ancient Forest (Lv 7–9) ──
  // Inbound from Greenvale the player celebrates in the grand trade capital Riverhearth (the
  // triumphant breather hub) and then steps into the old forest. The Elder Treant gates the way to
  // the Sunless Grove; the Hollow King waits at its heart. Attunements stay SPREAD (Dara's
  // no-region-identity ruling — the forest is NOT an ANIMA theme). Bands are first-pass (teach →
  // combine); balance-tuner owns the final numbers across the now-3-zone curve.
  { id: "silverwood", name: "Silverwood", mini: "treantelder", miniAdds: ["thornling", "thornling"], boss: "hollowking",
    hub: "riverhearth", hubs: ["riverhearth"],
    envs: ["forest", "forest", "forest", "forest"], dungeon: { name: "The Sunless Grove", env: "grove" }, layout: SILVERWOOD_LAYOUT, bands: [
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
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "vault" }, layout: DUSKMARSH_LAYOUT, bands: [
      { at: 0.0, sets: [["rat", "rat", "spider"], ["spider", "rat"], ["rat", "rat", "spider"]] },
      { at: 0.2, sets: [["rat", "spider", "rat"], ["leper", "rat", "rat"], ["direrat", "rat", "spider"]] },
      { at: 0.4, sets: [["leper", "rat", "spider"], ["spider", "bonespider", "rat"], ["direrat", "spider", "rat"]] },
      { at: 0.6, sets: [["leper", "direrat", "rat"], ["bonespider", "spider", "rat"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper", "rat"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
];
