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

// ── The Duskmarsh + Drowned Vault (greenfield, same layout system) ──────────────────────────
// A grimmer, tighter mire: the road threads between hollows; one northern bog pocket and one
// southern hollow each hide a chest; east of the gate the Drowned Vault is a flooded crawl that
// loops past a sunken chest to the Broodmother's pit and the Cave Troll's deep arena.
const DUSKMARSH_LAYOUT: ZoneLayout = {
  w: 60, h: 20, spawn: { x: 2, y: 10 }, gate: { x: 31, y: 10 }, gateWallX: 31, boss: { x: 56, y: 10 },
  fieldRects: [
    { x: 1, y: 8, w: 7, h: 5 },     // mire mouth
    { x: 12, y: 3, w: 7, h: 5 },    // north bog pocket (chest)
    { x: 11, y: 13, w: 7, h: 5 },   // south hollow pocket (chest)
    { x: 20, y: 7, w: 8, h: 7 },    // central hollow
    { x: 27, y: 8, w: 4, h: 5 },    // pre-gate clearing
  ],
  fieldPaths: [
    [{ x: 2, y: 10 }, { x: 12, y: 10 }, { x: 22, y: 10 }, { x: 30, y: 10 }],
    [{ x: 15, y: 10 }, { x: 15, y: 5 }],
    [{ x: 14, y: 10 }, { x: 14, y: 15 }],
  ],
  dunRects: [
    { x: 33, y: 7, w: 6, h: 7 },    // vault entry
    { x: 41, y: 12, w: 6, h: 5 },   // sunken side cell (chest)
    { x: 41, y: 4, w: 7, h: 5 },    // drowned gallery
    { x: 50, y: 7, w: 8, h: 7 },    // the Troll's deep arena
  ],
  dunPaths: [
    [{ x: 32, y: 10 }, { x: 37, y: 10 }],
    [{ x: 38, y: 12 }, { x: 43, y: 12 }, { x: 43, y: 14 }],
    [{ x: 38, y: 9 }, { x: 44, y: 9 }, { x: 44, y: 6 }],
    [{ x: 44, y: 6 }, { x: 52, y: 6 }, { x: 52, y: 10 }, { x: 55, y: 10 }],
  ],
  chests: [
    { x: 15, y: 4 },
    { x: 14, y: 15 },
    { x: 43, y: 14 },  // sunken cell
    { x: 44, y: 5 },   // drowned gallery
  ],
  scatter: 0.05,
};

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "brigand", miniAdds: ["gbandit", "gbandit"], boss: "kingpin",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren" }, bands: ENCOUNTERS, layout: GREENVALE_LAYOUT },
  { id: "duskmarsh", name: "The Duskmarsh", mini: "broodmother", miniAdds: ["spider", "spider"], boss: "troll",
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "vault" }, layout: DUSKMARSH_LAYOUT, bands: [
      { at: 0.0, sets: [["rat", "rat", "spider"], ["spider", "rat"], ["rat", "rat", "spider"]] },
      { at: 0.2, sets: [["rat", "spider", "rat"], ["leper", "rat", "rat"], ["direrat", "rat", "spider"]] },
      { at: 0.4, sets: [["leper", "rat", "spider"], ["spider", "bonespider", "rat"], ["direrat", "spider", "rat"]] },
      { at: 0.6, sets: [["leper", "direrat", "rat"], ["bonespider", "spider", "rat"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper", "rat"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
];
