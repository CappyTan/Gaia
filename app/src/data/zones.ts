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

// ── Greenvale overworld + Bandit Warren (greenfield, ADR 0006) ──────────────────────────────
// The shire's first road. A readable EAST-bound critical path (spawn → winding clearings → the
// Brigadier's gate), with branches that PAY OFF: a north orchard pocket and a south meadow pocket
// each hold a chest, a far-NE thicket hides a chest behind a tighter approach, and a tree-walled
// southern GROVE hides Hogger's lair (the rare-monster reward for the explorer). East of the gate
// wall the Bandit Warren: an entry hall forking into two corridors — the south one dead-ends on the
// warren's richest chest (reward the brave), the north one winds past a guard chamber to the
// Kingpin's arena. genMap carves these + flood-fills to guarantee the boss and every chest are
// reachable (anti-soft-lock).
const GREENVALE_LAYOUT: ZoneLayout = {
  w: 64, h: 22, spawn: { x: 2, y: 11 }, gate: { x: 34, y: 11 }, gateWallX: 34, boss: { x: 60, y: 11 },
  fieldRects: [
    { x: 1, y: 9, w: 8, h: 6 },     // start clearing (village road mouth)
    { x: 12, y: 3, w: 8, h: 6 },    // north orchard pocket (chest)
    { x: 11, y: 14, w: 8, h: 6 },   // south meadow pocket (chest)
    { x: 21, y: 8, w: 7, h: 7 },    // central crossroads clearing
    { x: 24, y: 2, w: 7, h: 5 },    // NE thicket (chest, tighter approach)
    { x: 23, y: 16, w: 8, h: 5 },   // the hidden grove (Hogger's lair)
    { x: 30, y: 9, w: 4, h: 5 },    // pre-gate staging clearing
  ],
  fieldPaths: [
    [{ x: 2, y: 11 }, { x: 10, y: 11 }, { x: 16, y: 11 }, { x: 24, y: 11 }, { x: 33, y: 11 }], // the road east
    [{ x: 15, y: 11 }, { x: 15, y: 6 }],   // fork up to the orchard
    [{ x: 14, y: 11 }, { x: 14, y: 16 }],  // fork down to the meadow
    [{ x: 24, y: 9 }, { x: 27, y: 4 }],    // fork up to the NE thicket
    [{ x: 26, y: 14 }, { x: 26, y: 18 }],  // fork down toward the grove
  ],
  dunRects: [
    { x: 36, y: 8, w: 6, h: 7 },    // warren entry hall
    { x: 44, y: 3, w: 7, h: 5 },    // north guard chamber
    { x: 44, y: 15, w: 6, h: 5 },   // south store room (dead-end, richest chest)
    { x: 52, y: 6, w: 5, h: 6 },    // antechamber before the arena
    { x: 56, y: 8, w: 7, h: 7 },    // the Kingpin's arena
  ],
  dunPaths: [
    [{ x: 35, y: 11 }, { x: 40, y: 11 }],               // gate → entry hall
    [{ x: 41, y: 10 }, { x: 47, y: 10 }, { x: 47, y: 6 }], // hall → north guard chamber
    [{ x: 41, y: 13 }, { x: 47, y: 13 }, { x: 47, y: 17 }],// hall → south store room
    [{ x: 47, y: 5 }, { x: 54, y: 5 }, { x: 54, y: 9 }],   // guard chamber → antechamber
    [{ x: 54, y: 10 }, { x: 59, y: 10 }, { x: 59, y: 11 }],// antechamber → arena (boss)
  ],
  chests: [
    { x: 15, y: 4 },   // orchard pocket
    { x: 13, y: 18 },  // meadow pocket
    { x: 27, y: 3 },   // NE thicket (off the safe path)
    { x: 47, y: 17 },  // warren store room (best — deep dead-end)
    { x: 47, y: 4 },   // guard chamber (on the boss route, a breather reward)
  ],
  lair: { x: 26, y: 18 }, // Hogger, deep in the southern grove
  scatter: 0.06,
};

// ── The Duskmarsh + Drowned Vault (greenfield, ADR 0006) ────────────────────────────────────
// The early "dark detour" — grimmer and TIGHTER than Greenvale's open shire. The road is a narrow
// causeway threading EAST between flooded hollows: standing water (hard wall) pinches the route to
// a few tiles wide so the mire feels close and dangerous, and reed/bog scatter dresses the banks.
// Two paying branches lie OFF the safe causeway: a fog-bound NORTH bog pocket hides a chest, and a
// drowned SUNKEN RUIN to the south hides a chest AND the rare lair (a Metal Babble denning in the
// flooded stones — the explorer's prize), each behind its own spur that the water frames.
//
// East of the Broodmother's gate, the DROWNED VAULT is a real flooded crawl with GATED progression
// (a small puzzle, not a straight line): the entry hall forks two ways across a flooded sump. The
// short SOUTH fork dead-ends on a drowned cell with the vault's first chest (a breather reward) but
// does NOT reach the deep arena — you must take the longer NORTH fork up through a drowned gallery
// (its own rich chest), then back down a sunken stair into the Cave Troll's deep arena. The richest
// hoard sits deepest, by the arena threshold, rewarding the brave. genMap carves + stamps water +
// flood-fills to GUARANTEE the boss/chests/lair stay reachable (anti-soft-lock).
const DUSKMARSH_LAYOUT: ZoneLayout = {
  w: 56, h: 20, spawn: { x: 2, y: 10 }, gate: { x: 30, y: 10 }, gateWallX: 30, boss: { x: 52, y: 10 },
  fieldRects: [
    { x: 1, y: 8, w: 6, h: 5 },     // mire mouth (causeway head)
    { x: 11, y: 2, w: 7, h: 5 },    // north bog pocket (chest, fog-bound)
    { x: 10, y: 14, w: 8, h: 5 },   // the sunken ruin (chest + the rare lair)
    { x: 19, y: 7, w: 7, h: 6 },    // central drowned hollow (the causeway crossing)
    { x: 26, y: 8, w: 4, h: 5 },    // pre-gate landing before the Broodmother's gate
  ],
  fieldPaths: [
    [{ x: 2, y: 10 }, { x: 9, y: 10 }, { x: 16, y: 10 }, { x: 22, y: 10 }, { x: 29, y: 10 }], // the causeway east
    [{ x: 14, y: 10 }, { x: 14, y: 4 }],   // spur up to the north bog pocket
    [{ x: 13, y: 11 }, { x: 13, y: 16 }],  // spur down into the sunken ruin
  ],
  // Standing water pinches the causeway to a thread and frames the branch spurs (hard wall).
  water: [
    { x: 8, y: 2, w: 4, h: 6 },     // northwest pool (narrows the head of the causeway)
    { x: 7, y: 13, w: 4, h: 6 },    // southwest pool (frames the ruin spur)
    { x: 16, y: 2, w: 4, h: 6 },    // north fen (isolates the bog pocket to its spur)
    { x: 17, y: 14, w: 3, h: 5 },   // south fen
    { x: 22, y: 2, w: 5, h: 5 },    // upper crossing pool (pinches the central hollow)
    { x: 22, y: 14, w: 6, h: 5 },   // lower crossing pool
  ],
  dunRects: [
    { x: 32, y: 7, w: 6, h: 7 },    // vault entry hall (the flooded sump fork)
    { x: 40, y: 13, w: 5, h: 5 },   // south drowned cell (dead-end, breather chest)
    { x: 39, y: 3, w: 7, h: 5 },    // north drowned gallery (rich chest, on the boss route)
    { x: 46, y: 7, w: 8, h: 7 },    // the Cave Troll's deep arena
  ],
  dunPaths: [
    [{ x: 31, y: 10 }, { x: 36, y: 10 }],                          // gate → entry hall
    [{ x: 37, y: 12 }, { x: 42, y: 12 }, { x: 42, y: 15 }],        // hall → south cell (dead-end)
    [{ x: 37, y: 8 }, { x: 42, y: 8 }, { x: 42, y: 5 }],           // hall → north gallery
    [{ x: 45, y: 5 }, { x: 49, y: 5 }, { x: 49, y: 10 }, { x: 51, y: 10 }], // gallery → sunken stair → arena (boss)
  ],
  chests: [
    { x: 14, y: 3 },   // north bog pocket (overworld branch)
    { x: 16, y: 17 },  // sunken ruin (off the safe path, shares the ruin with the lair)
    { x: 42, y: 15 },  // south drowned cell (breather, dead-end)
    { x: 41, y: 4 },   // north drowned gallery (rich, on the boss route)
    { x: 49, y: 12 },  // deepest — by the arena threshold (richest, rewards the brave)
  ],
  lair: { x: 12, y: 17 }, // the rare beast dens in the flooded ruin stones
  scatter: 0.07,
};

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "brigand", miniAdds: ["gbandit", "gbandit"], boss: "kingpin",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren" }, bands: ENCOUNTERS, layout: GREENVALE_LAYOUT, hub: "hearthford", hubs: ["hearthford"] },
  // Inbound from Greenvale, the player passes through the grand trade capital Riverhearth (the
  // triumphant breather hub) and then the grim marsh outpost Miregard (the Duskmarsh's doorstep)
  // before the marsh itself loads. `hub` stays "miregard" (the true doorstep) for back-compat.
  { id: "duskmarsh", name: "The Duskmarsh", mini: "broodmother", miniAdds: ["spider", "spider"], boss: "troll", hub: "miregard", hubs: ["riverhearth", "miregard"],
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "vault" }, layout: DUSKMARSH_LAYOUT, bands: [
      { at: 0.0, sets: [["rat", "rat", "spider"], ["spider", "rat"], ["rat", "rat", "spider"]] },
      { at: 0.2, sets: [["rat", "spider", "rat"], ["leper", "rat", "rat"], ["direrat", "rat", "spider"]] },
      { at: 0.4, sets: [["leper", "rat", "spider"], ["spider", "bonespider", "rat"], ["direrat", "spider", "rat"]] },
      { at: 0.6, sets: [["leper", "direrat", "rat"], ["bonespider", "spider", "rat"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper", "rat"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
];
