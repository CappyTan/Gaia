// Encounter tables + zone definitions. Adding a zone/band is pure data — no engine changes.

import type { Reprieve } from "../types";

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
  entry: Pt;            // where the player lands on arriving on this floor (the mouth's inside / the up-stair)
  gate: Pt;             // the door tile back out / up a floor (usually == entry)
  boss: Pt;             // the dungeon boss tile (the FINALE floor's boss; ignored on intermediate floors)
  rooms: Rect[];        // carved chambers
  paths: Path[];        // corridors joining them
  chests: Pt[];         // dungeon treasure (each gets a walkable approach)
  scatter?: number;     // cosmetic rock density (0–1)
  /**
   * MULTI-FLOOR ENGINE (ADR 0008 Stage 3): on an INTERMEDIATE floor (any floor that isn't the last),
   * the tile that DESCENDS to the next floor's `entry`. Absent on the finale floor (which carries the
   * `boss` instead). Single-floor dungeons (the other 9 zones) omit it entirely — unchanged.
   */
  stairsDown?: Pt;
  /**
   * BREATHER / REST NODES (dungeon-design skill §1) — walkable tiles that give the party a low-intensity
   * safe beat between combat spikes. Stepping onto one applies this dungeon's `reprieve` ONCE, then it's
   * spent (reverts to floor, like a used overworld shrine — keyed per-floor in `poisCleared`). Author one
   * per floor as the deliberate tension valley. Each gets a walkable halo + is a flood target so it can
   * never be walled off. CAVES omit `rests` entirely (no rest); a dungeon with `rests` MUST set `reprieve`.
   */
  rests?: Pt[];
  /**
   * THE REST NODE'S TAILORED RELIEF (ADR 0010) — what the `rests` tiles do. Deliberately partial + themed,
   * never a full heal (a full HP+MP refill every floor trivialises the game — Dara). One per dungeon; the
   * kind ("mend" HP / "mana" MP / "regen" carried heal-over-time) leans to the dungeon's identity. Absent ⇒
   * the `rests`, if any, do nothing meaningful — so authoring `rests` without `reprieve` is a content bug.
   */
  reprieve?: Reprieve;
  /**
   * THE WARREN COLLAPSE — the dungeon's signature gimmick (skill §4: one light, optional gimmick per
   * dungeon, here a one-way collapse SHORTCUT). A `rubble` drop tile: stepping onto it COLLAPSES the
   * floor and drops the player to its paired `to` landing — a ONE-WAY shortcut looping a deep/optional
   * pocket back toward the hub/entry, so exploring is a circuit, not an out-and-back (skill §2
   * unlockable shortcut). Cosmetic flow only (no fight, no soft-lock: `to` is always a carved walkable
   * tile and a flood target). Author the drop off a deep pocket and the landing near the entry hall.
   */
  drops?: { x: number; y: number; to: Pt }[];
  /**
   * Optional IN-DUNGEON mini-boss tile that GATES `stairsDown` until defeated — the floor's own
   * chokepoint, mirroring the overworld mouth/miniboss pattern. While it stands, the player can't step
   * onto `stairsDown` (it draws + reads as the gate guardian); beating it turns the stairs live. The
   * enemy it fights comes from `Zone.dungeon.floorMini` (encounter-designer authors the real cast).
   * Author it so the gating mini-boss can never strand the player — the flood-repair covers stairs +
   * boss + chests + this tile, so a beaten mini always opens onto reachable stairs.
   */
  miniboss?: Pt;
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
   * Stage 2) its own decoupled tile grid (`layout`, x rebased to 0). The zone boss lives in the
   * FINALE floor's `boss`.
   *
   * MULTI-FLOOR (ADR 0008 Stage 3): a dungeon is EITHER single-floor (just `layout`, the other 9
   * zones — unchanged) OR multi-floor via `floors` (the Bandit Warren: a descending B1→B2→… stack).
   * When `floors` is present it is the source of truth and `layout` MUST equal `floors[0]` (kept so
   * the 9 single-floor zones and all existing `dungeon.layout` readers/tests are untouched — a
   * single-floor dungeon is just a 1-element stack). The player descends a floor's `stairsDown`
   * (gated by that floor's `miniboss`, if any) to the next floor's `entry`, and the LAST floor holds
   * the `boss` finale. `floorMini` is the enemy key the in-dungeon mini-boss fights (a placeholder
   * for the encounter-designer to author).
   */
  dungeon: { name: string; env: string; layout: DungeonLayout; floors?: DungeonLayout[]; floorMini?: string };
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

// Greenvale's encounter table by depth — the SAME spine drives the open shire (depth = how far east
// toward the gate) AND the Bandit Warren below it (in-floor progress picks the band; the dungeon's
// floorBump scales the stats hotter per floor, B1→B2→B3). The mouth guard (Bandit Brigadier), the B2
// LIEUTENANT (Bandit Bloodknife), and the B3 finale (Kingpin) are NOT in this table — they're the
// authored chokepoint/boss bookends.
//   Teach→combine + CADENCE VARIETY (encounter-designer 2026-06-21): the curve introduces one creature
// at a time (slime/kobold → gbandit → slimebig/kobolde → gmage) and the SET SIZES vary within each band
// so the rhythm isn't monotone — true SINGLES and PAIRS up top (gentle reads for B1's breather floor and
// the village mouth), growing to triples, with ONE gnarly 4-pack "den swarm" reserved for the deepest
// band (the run-up to the Kingpin / the lower Warren). Packs stay ≤5 (battle-screen + reachable() cap).
// Inside the Warren the Area lean is OFF (the dungeon carries no Area), so every set in a band is equally
// likely — the warren cadence lives in the sets themselves; the overworld additionally Area-leans these.
export const ENCOUNTERS: EncounterBand[] = [
  // GENTLE INTRO / B1 breather: lone fodder + small mixes. A true single teaches the kobold clean.
  { at: 0.0, sets: [["kobold"], ["slime", "kobold"], ["kobold", "kobold"], ["slime", "slime", "kobold"]] },
  // BANDIT enters — first alongside the known kobold (a pair), then a small pack.
  { at: 0.18, sets: [["gbandit"], ["kobold", "gbandit"], ["gbandit", "kobold", "kobold"], ["slime", "kobold", "kobold"]] },
  // The tank (Bloated Slime) + the Raider (kobolde) join; bandit pairs up. A lone bruiser breaks cadence.
  { at: 0.36, sets: [["slimebig"], ["gbandit", "kobold", "kobold"], ["slimebig", "kobold", "kobold"], ["kobolde", "gbandit"], ["gbandit", "gbandit", "kobold"]] },
  // The MAGE arrives — taught behind a single screen of fodder before it stacks into nastier mixes.
  { at: 0.54, sets: [["gmage", "kobold"], ["kobolde", "gbandit", "kobold"], ["gbandit", "gmage", "kobold"], ["slimebig", "kobolde", "kobold"]] },
  // DEEP WARREN / pre-Kingpin: the meanest combos — caster behind a bandit wall, and a 4-pack den swarm.
  { at: 0.72, sets: [["kobolde", "gmage", "kobold"], ["slimebig", "gmage", "kobold"], ["gbandit", "kobolde", "gbandit"], ["gbandit", "gbandit", "gmage", "kobold"]] },
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
// LOCK-BEFORE-KEY RELOCATION (ADR 0011 D2-revised, level-designer 2026-06-23). The Warren MOUTH no
// longer sits on the direct spawn→east path (old local (40,12) → world (167,74), met BEFORE the gorge
// at world x208 — key before lock). The obvious eastward route now funnels to a GORGE RIM lookout at
// the grid's east edge (the put-in signpost row y10 → the player walks off the core east and meets the
// impassable chasm at world x208, the Elder-Oak looming across it). The Warren is discovered as "the
// OTHER WAY" — a SOUTH branch off the staging green down to a Warren-approach hollow (mouth local
// (35,20) → world (162,82), SOUTH of the spawn latitude). Beat: push east → hit gorge (stuck) → see the
// Oak across it → turn back, take the south branch → clear the Warren → raft → return → cross. The boss
// tile/gateWallX stay legacy (the dungeon is its own grid); only the OVERWORLD mouth + routing move.
const GREENVALE_LAYOUT: ZoneLayout = {
  w: 64, h: 24, spawn: { x: 2, y: 12 }, gate: { x: 40, y: 20 }, gateWallX: 40, boss: { x: 60, y: 11 },
  // The OVERWORLD MOUTH is now DECOUPLED from the legacy combined-grid gate (ADR 0008 new model): the
  // live big map stamps the mouth at `mouth`, the legacy combined-grid scaffolding still uses gate/gateWallX
  // at x=40 (its wall gap rides `gate.y`). RELOCATED SOUTH off the spawn→gorge path (was (40,12) → world
  // (167,74), met before the gorge). Now world (162,82) — a south branch, so the gorge is met first.
  mouth: { x: 35, y: 20 }, // the Bandit-Warren mouth (the Brigadier guards it) — SOUTH branch, off the east route
  fieldRects: [
    { x: 1, y: 10, w: 7, h: 6 },    // spawn green (the village road mouth)
    { x: 10, y: 8, w: 7, h: 8 },    // WEST HUB — the first crossroads, three roads leave it
    { x: 12, y: 2, w: 8, h: 5 },    // north orchard (chest)
    { x: 11, y: 17, w: 9, h: 5 },   // south meadow (chest)
    { x: 24, y: 8, w: 8, h: 8 },    // CENTRAL HUB — the three roads rejoin here
    { x: 24, y: 2, w: 8, h: 5 },    // NE thicket (chest, on the north ridge)
    { x: 23, y: 17, w: 9, h: 5 },   // the hidden grove (Hogger's lair, off the south loop)
    { x: 34, y: 8, w: 5, h: 5 },    // east staging green — the eastward main flow continues to the GORGE RIM
    { x: 32, y: 16, w: 7, h: 7 },   // SE WARREN-APPROACH hollow — the south branch down to the relocated mouth
  ],
  fieldPaths: [
    [{ x: 5, y: 12 }, { x: 13, y: 12 }],                                   // spawn → west hub
    [{ x: 13, y: 10 }, { x: 15, y: 4 }, { x: 27, y: 4 }, { x: 27, y: 9 }], // NORTH road: hub → orchard → NE thicket → central
    [{ x: 16, y: 12 }, { x: 24, y: 12 }],                                  // MIDDLE road: hub → central (fast, exposed)
    [{ x: 13, y: 14 }, { x: 15, y: 19 }, { x: 27, y: 19 }, { x: 27, y: 15 }], // SOUTH road: hub → meadow → grove → central
    // EAST MAIN FLOW → the GORGE RIM. central → staging green → the east lookout (the put-in signpost row
    // y10), where the player walks off the core into open continent and meets the impassable chasm.
    [{ x: 31, y: 11 }, { x: 36, y: 10 }, { x: 39, y: 10 }],
    // THE SOUTH BRANCH → the Warren mouth (discovered as "the other way" once the gorge blocks the east).
    [{ x: 36, y: 12 }, { x: 36, y: 17 }, { x: 35, y: 19 }],                // staging → Warren-approach hollow → the mouth
    [{ x: 31, y: 19 }, { x: 33, y: 19 }],                                  // grove ↔ Warren-approach (a back way in / loop)
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
    // WEST FORK SIGN — now points the Warren south (the gate left the east road).
    { x: 12, y: 13, kind: "signpost", name: "Crossroads Sign", note: "Orchard road north · Meadow road south · the bandit warren lies southeast." }, // west fork
    // THE GORGE RIM PUT-IN (ADR 0011 D4) — the eastward route's end: the impassable Sunless Gorge, the
    // Elder-Oak of Silverwood looming across it, and the lore answer (the bandits hold the only crossing).
    { x: 38, y: 10, kind: "signpost", name: "The Sunless Gorge", note: "The road ends at a sheer chasm — the Sunless Gorge. Across it the great Elder-Oak of Silverwood crowns the far rim, close enough to see and too far to reach. They say the bandits of the warren hold the only way across." }, // east rim lookout
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

// ── THE BANDIT WARREN — Gaia's FIRST MULTI-FLOOR dungeon (ADR 0008 Stage 3, Lv 1-6) ─────────────
// A descending bandit hideout in THREE floors (B1 → B2 → the Kingpin's hall). Each floor is its OWN
// DungeonLayout on its own grid; the player descends a floor's `stairsDown` (gated by a floor
// `miniboss` where one stands) to the next floor's `entry`, and climbs the `entry`/up-stair back. The
// FINALE floor (B3) holds the Kingpin `boss`. The open-world rule applies underground too: each floor
// is a connected room-network with loops/shortcuts, not a single corridor. Anti-soft-lock: every floor
// flood-fills so entry reaches its stairs-down (or boss) + all chests, and the gating mini can't strand.
//
// DESIGN REWORK to the dungeon-design SKILL (Dara playtest — "flat, samey maze of corridors"):
//   • DISTINCT FLOOR IDENTITY (skill §1 milestones) — B1 is a twisting TUNNEL warren that fans wide off
//     the entry hub; B2 is a regimented BARRACKS of parallel bunk-rows + a drill yard with the lieutenant
//     locking a vault; B3 is a grand PILLARED THRONE HALL that funnels onto the Kingpin. No two read alike.
//   • PACE BY TENSION & RELEASE (skill §1) — each floor carries a `rest` CAMPFIRE breather node (a safe
//     full-heal valley): on B1 a hearth in the dug-out heart after the tunnel mesh, on B2 a cold mess-fire
//     between the bunk-rows BEFORE the lieutenant spike, on B3 a watch-fire at the threshold — the last
//     calm beat before the boss. The sawtooth: explore → fight → rest → climb.
//   • BRANCH EARLY, FUNNEL LATE (skill §3) — choice-density is highest near each entry (the B1 four-way
//     tunnel fan, the B2 bunk mesh) and tapers toward the egress; B3's galleries collapse into one
//     colonnade so the climax is legible and the Kingpin is in sightline the instant you cross the threshold.
//   • THE WARREN COLLAPSE (skill §4 signature gimmick, light & OPTIONAL) — B1 and B2 each hold ONE one-way
//     `rubble` collapse DROP off a deep pocket that loops the player back near the entry/landing: a found
//     SHORTCUT (skill §2) so deep exploration is a circuit, not a there-and-back trudge. Purely optional —
//     the normal looped routes always remain.
//   • RISK-GATED REWARD (skill §6) — the best chest on each floor sits behind the riskiest reach: B1's
//     richest is past the collapse-only deep cache (or the long way round), B2's is the vault LOCKED behind
//     the lieutenant fight, B3's is the throne-side hoard flanking the boss.
//
// Floor random encounters reuse Greenvale's bands (gbandit/kobold/gmage/…). `floorMini: "lieutenant"`
// is the in-dungeon LIEUTENANT that gates B2 — the authored Bandit Bloodknife (data/enemies.ts), a
// step between the overworld mouth-guard (Brigadier) and the B3 Kingpin finale. (Name is DRAFT for Dara.)
//
// B1 — THE TUNNEL WARREN (the gentle intro floor, no gate, 24-wide). TEACH: the mouth lands in a cramped
// west entry HALL that fans into a four-way TUNNEL hub — a low NW crawl, a NE bunk burrow, a SW spoil-dig,
// a SE den — knit by a north arc, a south arc, an east cross-tunnel and a central shortcut, so the player
// winds the warren MANY ways (a real maze you thread, not a hallway). At the warren's dug-out HEART sits a
// bandit HEARTH (`rest`) — the breather valley after the tunnel-mesh, before the descent. The RICHEST B1
// chest is in a deep SPOIL CACHE reached either the long way (down the SW dig) or via the COLLAPSE DROP off
// the SE den that caves you straight down to it (reward the brave); two breather chests sit on the loop
// arms. A second collapse drop loops the far NE burrow back to the entry hall (the found shortcut). Stays
// 24-wide (the combined-grid redundancy test stamps B1 east of Greenvale's gate wall at x=40, W=64).
// The Warren's tailored reprieve (ADR 0010): a bandit hearth dresses WOUNDS but won't restore your magic —
// "mend" heals 40% of max HP to standing heroes, no MP. Shared across all three floors (each hearth a
// breather valley before its spike), so even the full 3-floor descent never refills the party (no more
// trivialising full HP+MP heal). The fallen still need a town to revive.
const WARREN_HEARTH: Reprieve = {
  kind: "mend", amount: 0.4, name: "A Bandit Hearth",
  blurb: "You catch your breath at a guttering fire and bind your wounds — your standing heroes recover some health, but the embers do nothing for spent magic. The fallen still need a town to revive.",
};
const WARREN_B1: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 20, y: 11 }, // boss unused on B1
  stairsDown: { x: 20, y: 11 }, // descend to B2
  rooms: [
    { x: 2, y: 9, w: 5, h: 7 },     // entry hall (the four-way fork)
    { x: 9, y: 3, w: 6, h: 5 },     // NW crawl (loop, chest)
    { x: 16, y: 3, w: 6, h: 5 },    // NE bunk burrow (loop; holds a collapse-shortcut drop home)
    { x: 9, y: 16, w: 6, h: 5 },    // SW spoil-dig (loop, chest; the long way to the deep cache)
    { x: 16, y: 16, w: 6, h: 5 },   // SE den (loop; holds the collapse drop down to the deep cache)
    { x: 2, y: 18, w: 4, h: 4 },    // deep SPOIL CACHE (richest B1 chest — long way OR the collapse drop)
    { x: 9, y: 9, w: 6, h: 7 },     // central tunnel hub (holds the warren HEARTH rest node)
    { x: 18, y: 9, w: 5, h: 5 },    // east stair landing (the descent)
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 4, y: 12 }],                            // mouth → entry hall
    [{ x: 4, y: 10 }, { x: 11, y: 5 }, { x: 11, y: 9 }],           // hall → NW crawl → hub (N loop arm)
    [{ x: 4, y: 14 }, { x: 11, y: 18 }, { x: 11, y: 15 }],         // hall → SW spoil-dig → hub (S loop arm)
    [{ x: 14, y: 5 }, { x: 19, y: 5 }, { x: 20, y: 9 }],           // NW crawl → NE burrow → stair landing (N rejoin)
    [{ x: 14, y: 18 }, { x: 19, y: 18 }, { x: 20, y: 13 }],        // SW dig → SE den → stair landing (S rejoin)
    [{ x: 12, y: 11 }, { x: 18, y: 11 }],                          // hub → stair landing (central shortcut)
    [{ x: 9, y: 18 }, { x: 4, y: 19 }],                            // SW spoil-dig → deep cache (the LONG way in)
    [{ x: 19, y: 5 }, { x: 19, y: 16 }],                           // NE burrow ↔ SE den (east cross-tunnel / loop)
  ],
  chests: [
    { x: 3, y: 20 },   // deep SPOIL CACHE (richest B1, reward the brave — long way or the collapse drop)
    { x: 11, y: 4 },   // NW crawl (loop breather chest)
    { x: 11, y: 19 },  // SW spoil-dig (loop breather chest)
  ],
  rests: [{ x: 11, y: 12 }], // the warren HEARTH — breather valley at the dug-out heart, before the descent
  drops: [
    { x: 19, y: 19, to: { x: 4, y: 20 } }, // SE den collapse → caves you DOWN into the deep spoil cache (the brave shortcut to the richest chest)
    { x: 19, y: 4, to: { x: 4, y: 11 } },  // NE burrow collapse → drops you back to the entry hall (found shortcut home; no backtrack)
  ],
  reprieve: WARREN_HEARTH,
  scatter: 0.06,
};
// B2 — THE BARRACKS & THE VAULT (the gated descent, 28-wide). Reads distinct from B1's twisting tunnels:
// a regimented bandit BARRACKS. The up-stair lands west into a muster HALL that forks to TWO parallel
// bunk-rows (north + south), cross-linked into a loop, with an NW armoury alcove dead-end off the hall —
// all converging on the central DRILL YARD. A cold mess-FIRE (`rest`) sits in the drill yard: the breather
// BEFORE the spike. The drill yard's east mouth is the LIEUTENANT (`miniboss`) — the SOLE walkable link to
// the stair landing AND a hidden VAULT beyond. Beat him to open the descent + the vault. A COLLAPSE DROP
// off the south bunk-row caves back to the muster hall (the optional found shortcut so the loop isn't a
// there-and-back). Treasure is risk-gated: the richest is locked in the vault behind the fight.
//
// GATE-PINCH GEOMETRY (preserved from the QA fix): the lieutenant tile (19,12) is the SOLE walkable link
// from the drill yard (cols 13-18) to the stair-landing/vault block (cols 22-25) — a SINGLE-ROW corridor on
// row 12: (19,12 lieutenant)→(20,12)→(21,12)→(22,12 landing). Cols 20-21 are solid wall at every OTHER row,
// and the gated block sits ≥2 columns east of the lieutenant (stairs at x=24, vault chest at x=24) so NO
// stairs/chest halo can re-open a flanking tile in cols 20-21. The lieutenant's OWN 3×3 halo is closed off
// by genDungeon re-walling the gate's perpendicular flanks — so the only way east is THROUGH the fight.
// VERIFIED by flooding with the lieutenant forced to a wall: stairs-down AND the vault chest both go
// UNREACHABLE (and with it walkable, all reachable — no soft-lock). NOTE: the collapse DROP's landing is
// WEST of the gate (back in the muster hall), so it never bypasses the pinch.
const WARREN_B2: DungeonLayout = {
  w: 28, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 24, y: 11 }, // boss unused on B2
  stairsDown: { x: 24, y: 12 },   // descend to B3 — ≥2 cols east of the lieutenant (cols 20-21 stay solid)
  miniboss: { x: 19, y: 12 },     // the bandit LIEUTENANT — the SOLE link east; gates the stairs + the vault
  rooms: [
    { x: 2, y: 9, w: 5, h: 7 },     // up-stair muster hall (the fork)
    { x: 9, y: 3, w: 7, h: 5 },     // north bunk-row (loop, chest)
    { x: 9, y: 16, w: 7, h: 5 },    // south bunk-row (loop, chest; holds the collapse drop home)
    { x: 4, y: 3, w: 4, h: 4 },     // NW armoury alcove (dead-end side chest)
    { x: 13, y: 9, w: 6, h: 6 },    // central DRILL YARD (cols 13-18; holds the mess-fire rest; lieutenant at its east mouth x=19)
    { x: 22, y: 9, w: 4, h: 7 },    // stair landing PAST the lieutenant (cols 22-25; cols 20-21 stay solid)
    { x: 22, y: 3, w: 4, h: 4 },    // hidden VAULT dead-end (cols 22-25, behind the lieutenant — richest)
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 4, y: 12 }],                            // up-stair → muster hall
    [{ x: 4, y: 10 }, { x: 11, y: 5 }, { x: 14, y: 10 }],          // hall → north bunk-row → drill yard
    [{ x: 4, y: 14 }, { x: 11, y: 18 }, { x: 14, y: 14 }],         // hall → south bunk-row → drill yard (the LOOP)
    [{ x: 12, y: 8 }, { x: 12, y: 16 }],                           // north bunk-row ↔ south bunk-row (vertical cross-link / loop)
    [{ x: 4, y: 10 }, { x: 5, y: 5 }],                             // muster hall → NW armoury alcove (spur)
    [{ x: 19, y: 12 }, { x: 24, y: 12 }],                          // drill yard → (THROUGH lieutenant) → stair landing
    [{ x: 24, y: 10 }, { x: 24, y: 6 }],                           // stair landing → hidden vault dead-end (spur)
  ],
  chests: [
    { x: 24, y: 4 },   // hidden vault behind the lieutenant (RICHEST — reward the brave)
    { x: 11, y: 4 },   // north bunk-row (loop)
    { x: 11, y: 19 },  // south bunk-row (loop)
    { x: 5, y: 4 },    // NW armoury alcove (dead-end side cache)
  ],
  rests: [{ x: 15, y: 11 }], // the mess-FIRE in the drill yard — the breather valley right before the lieutenant spike
  drops: [
    { x: 14, y: 19, to: { x: 4, y: 14 } }, // south bunk-row collapse → caves back to the muster hall (optional found shortcut, WEST of the gate — never bypasses it)
  ],
  reprieve: WARREN_HEARTH,
  scatter: 0.07,
};
// B3 — THE KINGPIN'S THRONE HALL (the finale, 28-wide). Reads distinct: a grand PILLARED hall, not a
// tunnel or a barracks. BRANCH-EARLY/FUNNEL-LATE: the up-stair lands west into a pillared approach that
// SPLITS into a north gallery and a south gallery (looped by a cross-link, each with a chest), the two
// rejoining at a grand THRESHOLD. At the threshold a watch-FIRE (`rest`) gives the LAST breather before
// the boss. From there a short colonnade opens straight EAST onto the wide THRONE ARENA: the Kingpin sits
// centred on his dais, hoard chests flanking him north and south, in CLEAR SIGHTLINE the instant you cross
// the threshold — the layout FUNNELS you onto a telegraphed boss (skill §5). The zone `boss` lives HERE.
const WARREN_B3: DungeonLayout = {
  w: 28, h: 22, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 22, y: 10 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 },     // up-stair landing
    { x: 9, y: 3, w: 6, h: 5 },     // north gallery (loop, chest)
    { x: 9, y: 14, w: 6, h: 5 },    // south gallery (loop, chest)
    { x: 16, y: 8, w: 3, h: 6 },    // grand threshold (the loop rejoins — the funnel mouth; watch-fire rest)
    { x: 19, y: 4, w: 8, h: 14 },   // THE THRONE ARENA (wide; Kingpin centred, hoard flanking N/S)
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 5, y: 11 }],                            // up-stair → landing
    [{ x: 5, y: 9 }, { x: 11, y: 5 }, { x: 17, y: 9 }],            // landing → north gallery → threshold
    [{ x: 5, y: 13 }, { x: 11, y: 16 }, { x: 17, y: 12 }],         // landing → south gallery → threshold (the LOOP)
    [{ x: 11, y: 8 }, { x: 11, y: 14 }],                           // north ↔ south gallery (cross-link / loop)
    [{ x: 18, y: 11 }, { x: 22, y: 11 }],                          // threshold → throne arena (the funnel onto the boss)
  ],
  chests: [
    { x: 25, y: 6 },   // throne-side hoard N (richest — by the Kingpin)
    { x: 25, y: 15 },  // throne-side hoard S
    { x: 11, y: 4 },   // north gallery (loop)
    { x: 11, y: 15 },  // south gallery (loop)
  ],
  rests: [{ x: 17, y: 11 }], // the watch-FIRE at the threshold — the LAST breather before the telegraphed Kingpin
  reprieve: WARREN_HEARTH,
  scatter: 0.06,
};
// The Bandit Warren = the 3-floor stack. `layout` MUST equal `floors[0]` (the single-floor contract
// every `dungeon.layout` reader/test relies on; a single-floor dungeon is just a 1-element stack).
const GREENVALE_DUNGEON: DungeonLayout = WARREN_B1;
const GREENVALE_FLOORS: DungeonLayout[] = [WARREN_B1, WARREN_B2, WARREN_B3];

// ── Silverwood, the Ancient Forest + the Sunless Grove (OVERWORLD OVERHAUL — anti-reskin, A) ──
// Region #2 of Aurelion, REBUILT to read DEEP and DESCENDING (overworld-design §2-§6) — emphatically
// NOT Greenvale's wide "walk east" shire reskinned. The wood drops from a bright, broad HIGH CROWN in
// the NW (the great Elder-Oak's stand — the tent-pole WEENIE visible across the gorge from Greenvale,
// "see it now, reach it later") through rising dread to the SUNLESS RAVINE THROAT at the SE foot, where
// the Sunless Grove mouth waits. The grid's N→S axis (low-y crown → high-y ravine) carries the descent;
// terrain + biome read carry the dread (open dappled wood high, ravine-edge cliff low) — TERRAIN flavor
// only, no Attunement (D1). Crown stays w=60/h=24/gateWallX=36 so the A0-locked WORLD_PLACEMENT
// (wx:270,wy:58, centroid-centered) is UNCHANGED.
//
// THE NETWORK (open-world rule, §2). A descending MESH, three tiers of landmarks, loops that rejoin:
//   • NW HEARTWOOD CROWN — the spawn glade + the ELDER-OAK tent-pole (large weenie) on its high stand,
//     a bright crown hub the three descents leave from.
//   • THREE descending routes to the SE ravine foot, each with its own character + medium-tier landmark:
//     a NORTH CREST line (fern stand → NE canopy nook, the high dry way), a MIDDLE SPINE (crown →
//     central crossing → pre-gate, the fast read), and a SOUTH RAVINE descent (down through the West
//     Descent into the Deep Mossbed, the low dangerous way). They LOOP: the central crossing cross-links
//     to both crest and mossbed, and the pre-gate hollow gathers all three — so roaming is a CIRCUIT,
//     ≥2 redundant routes reach the mouth (removing any one trail never severs it).
//   • SMALL-tier beats (§3 landmark tiers): a STANDING-STONE RING + GROVE SHRINE in the crown, a FUNGAL
//     HOLLOW landmark on the descent, a POACHER'S CAMP off the south loop.
//   • OCCLUDED SIGHTLINES (triangle rule, §3): a RAVINE LIP (cliff ridgeline) cuts mid-zone between the
//     bright crown and the dark approach, so the mouth is hidden until you crest/descend to it — the
//     lip + old-growth stands break the long view into discovered beats.
//   • RISK-GATED REWARD (§4): the RICHEST chest + the Mossback Tortoise's lair den DEEP in the Deep
//     Mossbed, OFF the safe spine on the low south route.
//   • A WOODED STREAM tumbles down the ravine (winding river), crossed at a log BRIDGE (middle spine) and
//     a stepping-root FORD (south route); the north crest stays the dry redundant way.
// MIGRATED to the genOverworld/genDungeon model (B1): the dungeon lives in `dungeon.layout`
// (SILVERWOOD_DUNGEON, x rebased to 0); dunRects/dunPaths stay empty (the combined-grid test rebuilds
// it east of gateWallX). The Elder Treant gates the SE mouth; beating it (onMiniDefeated) opens the
// Sunless Grove (B2). genOverworld carves + flood-repairs so the mouth + every chest/lair/POI is always
// reachable (anti-soft-lock); the loops mean no pocket can wall you in.
const SILVERWOOD_LAYOUT: ZoneLayout = {
  w: 60, h: 24, spawn: { x: 2, y: 3 }, gate: { x: 36, y: 20 }, gateWallX: 36, boss: { x: 56, y: 11 },
  mouth: { x: 36, y: 20 }, // the Sunless-Grove mouth at the SE RAVINE FOOT (south + east), guarded by the Elder Treant
  fieldRects: [
    { x: 1, y: 1, w: 7, h: 6 },     // NW spawn glade — the high crown's bright threshold
    { x: 1, y: 7, w: 5, h: 6 },     // WEST-SHORE LANDING — where the gorge take-out trail enters the wood (ADR 0011 D4)
    { x: 4, y: 2, w: 8, h: 7 },     // HEARTWOOD CROWN hub — the Elder-Oak's stand; three descents leave it
    { x: 13, y: 1, w: 8, h: 6 },    // north fern stand (chest) — the high CREST line
    { x: 24, y: 2, w: 8, h: 6 },    // NE canopy nook (chest) — the crest's far medium stand
    { x: 14, y: 9, w: 9, h: 7 },    // CENTRAL crossing hollow — the descent midpoint, the loops rejoin
    { x: 3, y: 11, w: 8, h: 6 },    // WEST descent hollow — the south route drops through here
    { x: 4, y: 17, w: 11, h: 6 },   // DEEP MOSSBED — Mossback's lair + the richest chest (low, off-spine)
    { x: 27, y: 12, w: 8, h: 10 },  // SE pre-gate RAVINE hollow — the sunless throat before the mouth (reaches up to the zone centroid so the core's heart is open ground)
  ],
  fieldPaths: [
    [{ x: 3, y: 4 }, { x: 6, y: 5 }],                                       // spawn → crown hub
    // THE GORGE TAKE-OUT TRAIL, in-zone leg (ADR 0011 D4): the trail crossing from Greenvale's gorge
    // enters at the WEST-SHORE LANDING and bends SE, past the crown, DOWNHILL into the descending spine —
    // delivering the player to Silverwood's start, where the in-zone routes carry them to the ravine mouth.
    [{ x: 1, y: 10 }, { x: 5, y: 9 }, { x: 6, y: 6 }],                       // west-shore landing → crown hub (the handoff)
    // NORTH CREST (the high, dry way): crown → fern stand → NE canopy → drop SE into the pre-gate ravine.
    [{ x: 8, y: 4 }, { x: 16, y: 3 }, { x: 27, y: 4 }, { x: 31, y: 9 }, { x: 31, y: 15 }],
    // MIDDLE SPINE (the fast read): crown → central crossing → pre-gate hollow → the mouth.
    [{ x: 8, y: 6 }, { x: 12, y: 11 }, { x: 18, y: 12 }],                   // crown → central crossing (descends)
    [{ x: 20, y: 13 }, { x: 28, y: 17 }, { x: 31, y: 18 }],                 // central → pre-gate ravine
    [{ x: 31, y: 18 }, { x: 35, y: 20 }],                                  // pre-gate → the mouth (the gate gap)
    // SOUTH RAVINE descent (the low, dangerous way): crown → west descent → deep mossbed → climb to pre-gate.
    [{ x: 6, y: 8 }, { x: 6, y: 13 }],                                     // crown → west descent hollow
    [{ x: 7, y: 16 }, { x: 9, y: 20 }, { x: 18, y: 20 }],                  // west descent → deep mossbed
    [{ x: 18, y: 20 }, { x: 26, y: 21 }, { x: 30, y: 20 }],                // deep mossbed → pre-gate ravine (the loop climbs back)
    // CROSS-LINKS (loops, §2): knit crest↔central and central↔mossbed so the mesh is a circuit, not a tree.
    [{ x: 19, y: 9 }, { x: 28, y: 6 }],   // central crossing ↔ NE canopy crest (north loop arm)
    [{ x: 16, y: 15 }, { x: 13, y: 19 }], // central crossing ↔ deep mossbed (south loop arm)
    [{ x: 16, y: 3 }, { x: 8, y: 5 }],    // fern stand ↔ crown (crest's west tie-back)
  ],
  dunRects: [], dunPaths: [], // dungeon lives in dungeon.layout (SILVERWOOD_DUNGEON) — ADR 0008 Stage 2 (B1)
  // VARIED TERRAIN (§2 living world). A WOODED STREAM (river kind) tumbles DOWN the ravine from the crown
  // toward the SE throat, SEVERING the MIDDLE spine (crossed at y=12 by a mossy log BRIDGE) and the SOUTH
  // mossbed route (crossed at y=20 by a stepping-root FORD) — the NORTH crest (y≈3-4) stays the dry
  // redundant way. The RAVINE LIP (cliff ridgeline) cuts mid-zone, OCCLUDING the sunless mouth from the
  // bright crown (triangle rule, §3) and funnelling the descent; a mossy outcrop edges the Deep Mossbed.
  rivers: [
    { x: 22, y: 9, w: 1, h: 9 },   // the stream tumbling down the ravine: crosses the MIDDLE spine (y12, bridge)
    { x: 21, y: 18, w: 1, h: 3 },  // a meander dropping toward the south route (forded at the mossbed climb, y20)
  ],
  cliffs: [
    { x: 11, y: 7, w: 4, h: 1 },   // the RAVINE LIP between the crown and the central crossing (occludes the descent)
    { x: 23, y: 11, w: 5, h: 1 },  // the lip's eastern reach — hides the sunless mouth from the high crest
    { x: 15, y: 17, w: 2, h: 2 },  // mossy outcrop edging the Deep Mossbed (frames Mossback's lair)
  ],
  bridges: [{ x: 22, y: 12 }],     // the middle spine's mossy log bridge over the tumbling stream (its only crossing)
  fords: [{ x: 21, y: 20 }],       // the stepping-root ford reconnecting the mossbed↔pre-gate south loop
  chests: [
    { x: 17, y: 2 },   // north fern stand (the high crest route)
    { x: 28, y: 3 },   // NE canopy nook (the crest's far medium stand, off the safe line)
    { x: 7, y: 21 },   // DEEP MOSSBED — the RICHEST chest, deep on the low south route (reward the brave)
  ],
  lair: { x: 12, y: 21 }, // the Mossback Tortoise dens deep in the Deep Mossbed, off the south loop
  scatter: 0.1,           // dense old-growth: ferns/mushrooms/roots thick on the forest floor (vs the open shire)
  // POIs — the INHABITED ancient forest, all OFF the main flow (discoveries across the three tiers):
  pois: [
    { x: 5, y: 5, kind: "landmark", name: "The Elder-Oak", note: "A titan oak older than Aurelion's kings, crown lost in mist — its silhouette is the wood's beacon, seen from the gorge's far rim." }, // CROWN tent-pole (large weenie)
    { x: 18, y: 2, kind: "shrine", name: "Grove Shrine" },                                             // north fern stand (crest) — heal
    { x: 9, y: 19, kind: "camp", name: "Poachers' Camp", pack: ["sylvanarcher", "dwolf", "dwolf"] },   // deep mossbed (off the south loop) — optional fight
    { x: 26, y: 2, kind: "landmark", name: "The Standing Stones", note: "A moss-furred ring the forest grew up around — older than memory, humming faintly at dusk." }, // NE canopy crest (medium landmark)
    { x: 19, y: 13, kind: "landmark", name: "The Fungal Hollow", note: "A sunless dell where pale fungus climbs the dead boles — the air down here turns cold and still." }, // central crossing (descent beat)
    { x: 3, y: 4, kind: "signpost", name: "Trailhead Marker", note: "Fern crest north · the mossbed deep south · the Elder Treant's gate lies down the ravine, southeast." }, // crown fork
    // WEST-SHORE HANDOFF (ADR 0011 D4) — where the gorge take-out trail meets the wood: names Silverwood
    // and points the descent on toward the Sunless Grove (the "Sunless Grove ↓" handoff at the wood's edge).
    { x: 2, y: 9, kind: "signpost", name: "The Wood's Edge", note: "You make landfall on Silverwood's shore, the gorge behind you. The old wood climbs to the Elder-Oak's crown, then falls away southeast — the Sunless Grove lies down the ravine. ↓" }, // west-shore landing
  ],
};
// THE SUNLESS GROVE as its own grid (ADR 0008 Stage 2). You DESCEND INTO the grove from the SE ravine
// foot, so the mouth/entry lands LOW (south, y=20) — matching the overworld gate's SE ravine-foot row,
// which is what connects the legacy combined grid (the gate gap at gateWallX,gate.y meets this entry's
// row). The root-hall opens off the sunken entrance and the wood RISES into the heart: a north hollow
// bole and a south fungal gallery LOOP up to a root-stair antechamber before the Hollow King's heartwood
// arena (each loop room holds a chest), so you circle through and back, never dead-end. genDungeon
// flood-fills to GUARANTEE the boss + every chest reachable (anti-soft-lock).
const SILVERWOOD_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 20 }, gate: { x: 1, y: 20 }, boss: { x: 20, y: 9 },
  rooms: [
    { x: 2, y: 16, w: 6, h: 6 },    // sunken grove root-hall (the fork, low — you descend in here)
    { x: 9, y: 16, w: 7, h: 5 },    // south fungal gallery (chest, on the loop)
    { x: 10, y: 4, w: 6, h: 5 },    // north hollow bole (chest, on the loop, risen high)
    { x: 14, y: 9, w: 5, h: 7 },    // root-stair antechamber hub (the loop rejoins)
    { x: 17, y: 6, w: 6, h: 6 },    // the Hollow King's heartwood arena
  ],
  paths: [
    [{ x: 1, y: 20 }, { x: 5, y: 19 }],                           // mouth → sunken root-hall
    [{ x: 5, y: 17 }, { x: 13, y: 6 }, { x: 16, y: 10 }],         // hall → north bole (rising) → antechamber
    [{ x: 5, y: 19 }, { x: 12, y: 18 }, { x: 16, y: 14 }],        // hall → south gallery → antechamber (the LOOP)
    // SECOND, INDEPENDENT bole link (the upper section CIRCLES, not a there-and-back spur): a west wall-
    // root riser drops the bole's far corner down to the south gallery on its OWN column (x=11), clear of
    // the x=13 riser. So the bole sits on a genuine cycle — gallery → x11 riser → bole → x16 crossover →
    // antechamber → south arm → gallery — and cutting either bole link leaves it reachable from the other.
    [{ x: 11, y: 8 }, { x: 11, y: 16 }],                          // bole ↔ south gallery (west riser — the return arm)
    [{ x: 16, y: 10 }, { x: 19, y: 9 }],                          // antechamber → arena (boss)
  ],
  chests: [
    { x: 12, y: 18 },  // south fungal gallery (loop, rich)
    { x: 13, y: 5 },   // north hollow bole (loop, breather)
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
  // LEGIBILITY REWORK (Dara playtest 2026-06-22 — "I don't see where I can walk into the central
  // hub"). The route is now a WIDE, CONTINUOUS PLANK CAUSEWAY (the "path"/mire-path kind — the one
  // surface that reads clearly walkable against the look-alike mire-ground/bog/water). Both loops are
  // carved 3 TILES WIDE (a parallel plank polyline either side of the centreline) so the road is an
  // unmistakable boardwalk, not a 1-tile thread, and a BOLD 3-wide plank SPINE runs dead-straight
  // through the central crossing hub onto the Vault gate — so the eye follows one boardwalk
  // spawn → hub → gate. The lagoon/channel/ford/reed-hummocks still PINCH and frame it (water stamps
  // over the wedges between the loops, never the boardwalk), so the mire keeps its close, dangerous
  // character while the through-route reads at a glance. Still a real network: two looped causeways.
  fieldPaths: [
    // SPAWN APPROACH — a 3-wide boardwalk off the mire head into the fork node. Starts at x3 (the tile
    // beside the spawn at x2) so the plank meets the very first step — no reed seam at set-out.
    [{ x: 3, y: 10 }, { x: 8, y: 10 }], [{ x: 3, y: 11 }, { x: 8, y: 11 }], [{ x: 3, y: 12 }, { x: 8, y: 12 }],
    // NORTH causeway (the dry HIGH ROAD): fork → up the west bank → across the top (over the bog
    // pocket) → down into the central hub. Carved 3 wide: the centreline + a plank either side.
    [{ x: 6, y: 11 }, { x: 6, y: 3 }, { x: 23, y: 3 }, { x: 23, y: 8 }],   // top edge of the boardwalk
    [{ x: 7, y: 11 }, { x: 7, y: 4 }, { x: 23, y: 4 }, { x: 23, y: 9 }],   // CENTRELINE
    [{ x: 8, y: 11 }, { x: 8, y: 5 }, { x: 22, y: 5 }, { x: 22, y: 8 }],   // bottom edge of the boardwalk
    [{ x: 24, y: 4 }, { x: 24, y: 10 }],                                   // east shoulder down onto the spine
    // SOUTH causeway (the LOW ROAD over the plank ford): fork → down the west bank → across the
    // bottom (past the sunken ruin) → up into the central hub. Also 3 wide.
    [{ x: 6, y: 11 }, { x: 6, y: 19 }, { x: 23, y: 19 }, { x: 23, y: 15 }], // bottom edge of the boardwalk
    [{ x: 7, y: 11 }, { x: 7, y: 18 }, { x: 23, y: 18 }, { x: 23, y: 14 }], // CENTRELINE (carries the ford at x15)
    [{ x: 8, y: 11 }, { x: 8, y: 17 }, { x: 22, y: 17 }, { x: 22, y: 14 }], // top edge of the boardwalk
    [{ x: 24, y: 18 }, { x: 24, y: 12 }],                                  // east shoulder up onto the spine
    // CENTRAL SPINE — a BOLD 3-wide plank road straight through the crossing hub onto the Vault gate,
    // so the boardwalk visibly continues spawn → hub → gate (the player can always see "forward").
    [{ x: 20, y: 10 }, { x: 31, y: 10 }], [{ x: 20, y: 11 }, { x: 31, y: 11 }], [{ x: 20, y: 12 }, { x: 31, y: 12 }],
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
// THE WINDMILL / GRANARY UNDERCROFT — reshaped to read as a GRANARY CELLAR (anti-reskin, 2026-06-23):
// a stacked-cellar footprint (24×24, budget-capped) that descends through GRAIN BINS from a north loft
// around a wide central THRESHING PIT hub. NOT the old symmetric 4-room fork. You enter a low west
// loading-dock, climb a north grain-conveyor arm and drop through a south chaff-chute arm — two routes
// that BOTH meet the central threshing pit (the hub the player keeps returning to), with a deep silted
// SUMP cache hung off the pit and a one-way GRAIN-CHUTE collapse that drops a deep bin back to the dock
// (the granary's signature shortcut). The warlord's MILLSTONE arena is funnelled off the pit's east lip.
// REPRIEVE: a kept harvest-brazier in the threshing pit grants `regen` — banked grain-warmth that pays
// out heal-over-time in the next fight (relief you carry, not a refill at the node).
const UNDERCROFT_BRAZIER: Reprieve = {
  kind: "regen", amount: 5, name: "The Harvest-Brazier",
  blurb: "You bank a low fire in the threshing pit and let the grain-warmth soak into tired limbs — its glow stays with you, mending a little as you press on into the next fight. No magic returns to you here.",
};
const GOLDMEADOW_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 19, y: 18 },
  rooms: [
    { x: 2, y: 9, w: 5, h: 6 },     // west LOADING DOCK (entry; the fork into the cellar — spans gate.y=12)
    { x: 9, y: 2, w: 7, h: 5 },     // NORTH grain loft (chest, on the loop; holds the chute-collapse drop)
    { x: 9, y: 9, w: 8, h: 6 },     // CENTRAL THRESHING PIT hub (the harvest-brazier rest; the arms rejoin)
    { x: 9, y: 17, w: 7, h: 5 },    // SOUTH chaff cellar (chest, on the loop)
    { x: 2, y: 17, w: 5, h: 5 },    // deep silted SUMP cache (RICHEST, off the south arm — reward the brave)
    { x: 18, y: 9, w: 5, h: 5 },    // east millstone APPROACH (chest; funnels down to the arena)
    { x: 16, y: 16, w: 6, h: 6 },   // the warlord's MILLSTONE arena (boss, low SE)
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 4, y: 12 }],                           // mouth → loading dock
    [{ x: 4, y: 10 }, { x: 12, y: 4 }, { x: 12, y: 9 }],          // dock → north grain loft → pit (NORTH arm)
    [{ x: 4, y: 14 }, { x: 12, y: 19 }, { x: 12, y: 14 }],        // dock → south chaff cellar → pit (SOUTH arm; the LOOP)
    [{ x: 12, y: 7 }, { x: 12, y: 9 }],                           // grain loft → pit (vertical cross-link / loop)
    [{ x: 11, y: 19 }, { x: 4, y: 18 }],                          // south chaff cellar → deep silted sump (spur to the richest)
    [{ x: 16, y: 11 }, { x: 20, y: 11 }],                         // pit → east millstone approach
    [{ x: 20, y: 13 }, { x: 19, y: 17 }],                         // approach → arena (the funnel down onto the warlord)
  ],
  chests: [
    { x: 12, y: 3 },   // NORTH grain loft (loop, breather reward)
    { x: 4, y: 20 },   // deep silted SUMP (deepest, RICHEST — reward the brave)
    { x: 20, y: 10 },  // east millstone approach (run-up reward before the warlord)
  ],
  rests: [{ x: 12, y: 11 }], // the harvest-brazier in the threshing pit — the breather before the warlord
  drops: [
    { x: 14, y: 3, to: { x: 4, y: 12 } }, // NORTH grain-loft GRAIN-CHUTE collapse → drops you back to the loading dock (found shortcut home)
  ],
  reprieve: UNDERCROFT_BRAZIER,
  scatter: 0.06,
};

// ════ AURELION COMPLETE — the remaining six regions (world-builder build 2026-06-21) ═══════════
// The OVERWORLD meshes share ONE recipe (a west hub feeding THREE tracks — north field / fast middle /
// south field — that rejoin at a central hub, two big LOOPS so roaming is a circuit, not an out-and-back;
// cross-links knit the pockets back to the hubs; chests sit on routes you CHOOSE BETWEEN; the rare LAIR
// dens off the south loop; an east staging green leads to the mini-boss GATE at the dungeon MOUTH), plus
// a discrete dungeon east of the mouth.
//   THE DUNGEONS ARE NOW DISTINCT (anti-reskin reshape, 2026-06-23 — the dungeon analog of Dara's "no
// two zones should feel the same"). Each was re-authored to a UNIQUE shape/room-count leaning to its
// identity, no longer two cloned templates. (Footprints are CAPPED by the legacy combined-grid budget —
// a dungeon must fit east of the overworld's `gateWallX` — so the 52-wide overworlds cap their dungeon at
// 18 wide; the dimensions below are the shipped grids, and the IDENTITY lives in the room shapes, not size.)
//     • Windmill Undercroft (Goldmeadow) — a granary cellar (24×24) descending from a north grain loft
//       around a threshing-pit hub; `regen` harvest-brazier.   • Dwarven Stronghold (Frostpeak) — a forged
//       masonry GRID (24×24) of square halls round a great-forge hub; `mend` forge-vent.   • Besieged
//       Citadel (Sunbridge, the finale) — an ASCENDING fortress (24×24) of concentric wards to a lighthouse
//       summit; `mana` lamp.
//     • Breached Undervault (Dawnfall) — a cracked-open strong-room (18×22), cells ringing a collapsed
//       rotunda knifed by a breach-fissure; `regen` watch-brazier.   • Reliquary Crypt (Whisper Hills) —
//       an axial NAVE (18×22) with burial chapels off it; `mana` reliquary altar.
//     • Smuggler's Sea-Cave (Storm Coast) — irregular wave-cut CAVERNS (18×18); CAVE, NO REST.
//     • Smugglers' Den (Riverhearth) — a cramped tucked-away HIDEOUT (18×18); cave-like, NO REST.
//   Each is a soft-lock-free MESH (hub + loops + a one-way collapse shortcut where a dungeon); the five
// true dungeons carry ONE tailored reprieve (varied across mend/mana/regen — see ADR 0010), the two
// caves carry none. genMap carves + flood-repairs to GUARANTEE boss + every chest/lair reachable
// (anti-soft-lock); the loops mean no pocket can wall you in. Water pools (the hard-blocking "water"
// kind) frame creeks/harbors where a region's flavor wants them — authored to pinch, never sever.
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
// THE SMUGGLER'S SEA-CAVE — reshaped to read as IRREGULAR SEA-ERODED CAVERNS (anti-reskin, 2026-06-23):
// an 18×18 wave-cut warren of staggered, mismatched caverns strung along a tidal gut — NOT the
// neat little fork. CAVE = NO REST (skill §1) — punishing end to end. You enter a west tide-gut; a high
// dry GALLERY and a low flooded SUMP run staggered east, knit by a connecting throat into TWO redundant
// routes to the sea-beast's deep grotto, each cavern holding a wrecker's cache. Irregular sizes/offsets
// give it the organic, gnawed-out read of a real sea-cave.
const STORMCOAST_CAVE: DungeonLayout = {
  w: 18, h: 18, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 14, y: 9 },
  rooms: [
    { x: 2, y: 8, w: 5, h: 6 },     // west TIDE-GUT (entry; the cave mouth, the fork — spans gate.y=11)
    { x: 8, y: 3, w: 5, h: 4 },     // high dry GALLERY (cache, on the north route)
    { x: 8, y: 13, w: 5, h: 4 },    // low flooded SUMP (cache, on the south route, deeper/tougher)
    { x: 7, y: 8, w: 4, h: 4 },     // mid connecting THROAT (knits the two routes — the loop pivot)
    { x: 13, y: 6, w: 4, h: 6 },    // the sea-beast's deep grotto (boss)
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 4, y: 11 }],                           // mouth → tide-gut
    [{ x: 5, y: 9 }, { x: 10, y: 5 }, { x: 14, y: 8 }],           // tide-gut → high gallery → grotto (NORTH route)
    [{ x: 5, y: 13 }, { x: 10, y: 15 }, { x: 14, y: 11 }],        // tide-gut → low sump → grotto (SOUTH route; the LOOP)
    [{ x: 8, y: 9 }, { x: 10, y: 6 }],                            // throat ↔ gallery (cross-link / loop pivot)
    [{ x: 9, y: 11 }, { x: 10, y: 13 }],                          // throat ↔ sump (cross-link / loop pivot)
  ],
  chests: [{ x: 10, y: 4 }, { x: 10, y: 15 }],
  scatter: 0.07,
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
// THE SMUGGLERS' DEN — reshaped to read as a TUCKED-AWAY HIDEOUT under the wharves (anti-reskin,
// 2026-06-23): a cramped, off-kilter 18×18 warren of little hidden rooms — a bolt-hole, not a cavern.
// CAVE-LIKE → NO REST (skill §1 / brief): a hideout gives no quarter. You slip in through a low west
// crawl into a smoke-room common, with a stash-cell and a contraband cellar tucked off it; two back-
// alley routes (a high catwalk over the crates, a low cellar passage) LOOP around the smugglers' lair
// where the boss waits. Asymmetric, pinched rooms — the hidden, jury-rigged read of a den.
const RIVERHEARTH_CAVE: DungeonLayout = {
  w: 18, h: 18, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 13, y: 9 },
  rooms: [
    { x: 2, y: 8, w: 4, h: 5 },     // west crawl-in (entry; the bolt-hole mouth — spans gate.y=11)
    { x: 7, y: 3, w: 5, h: 4 },     // smoke-room common (the fork; tucked high)
    { x: 7, y: 13, w: 4, h: 4 },    // stash-cell (cache, tucked low-left)
    { x: 12, y: 2, w: 5, h: 4 },    // high catwalk loft (cache, over the crates)
    { x: 7, y: 8, w: 4, h: 4 },     // mid contraband cellar (the loop pivot)
    { x: 12, y: 8, w: 5, h: 6 },    // the smugglers' lair (boss)
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 3, y: 11 }],                          // mouth → west crawl-in
    [{ x: 4, y: 9 }, { x: 9, y: 5 }],                            // crawl-in → smoke-room common (high)
    [{ x: 4, y: 12 }, { x: 8, y: 14 }],                          // crawl-in → stash-cell (low)
    [{ x: 11, y: 4 }, { x: 14, y: 4 }, { x: 13, y: 8 }],         // smoke-room → high catwalk loft → lair (HIGH route)
    [{ x: 8, y: 15 }, { x: 9, y: 11 }, { x: 12, y: 11 }],        // stash-cell → contraband cellar → lair (LOW route; the LOOP)
    [{ x: 9, y: 6 }, { x: 9, y: 8 }],                            // smoke-room ↔ contraband cellar (vertical cross-link / loop pivot)
  ],
  chests: [{ x: 14, y: 3 }, { x: 8, y: 14 }],
  scatter: 0.05,
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
// THE BREACHED UNDERVAULT — reshaped to read as a CRACKED-OPEN VAULT (anti-reskin, 2026-06-23): a
// blocky 18×22 strong-room whose siege-breach has split it open. NOT the little cave fork. A west
// BREACH-MOUTH (where the siege cracked the wall) opens onto a ring of square reinforced strong-cells
// around a collapsed central ROTUNDA hub, the whole thing knifed across by a diagonal BREACH FISSURE
// (the masonry that fell when the wall failed — funnels the routes). Two cell-ring routes loop the
// rotunda; a deep dead-end SEALED VAULT holds the richest hoard, and a RUBBLE-SLIDE collapse drops the
// far NE cell back to the breach-mouth. The wraith-captain's hall caps the east. REPRIEVE: a kept
// garrison watch-brazier grants `regen` — banked coals you carry as heal-over-time into the next fight.
const UNDERVAULT_BRAZIER: Reprieve = {
  kind: "regen", amount: 5, name: "A Garrison Watch-Brazier",
  blurb: "You rake the last coals of a watch-brazier still burning since the hold fell, and bank its warmth against your hurts — it stays with you, mending a little as you press on. The dead garrison left no magic to draw.",
};
const DAWNFALL_DUNGEON: DungeonLayout = {
  w: 18, h: 22, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 14, y: 10 },
  rooms: [
    { x: 2, y: 8, w: 4, h: 6 },     // west BREACH-MOUTH (entry; the siege-crack into the vault — spans gate.y=11)
    { x: 7, y: 2, w: 4, h: 5 },     // NW strong-cell (chest, on the cell-ring loop)
    { x: 12, y: 2, w: 4, h: 5 },    // NE strong-cell (cell-ring; holds the rubble-slide collapse drop)
    { x: 7, y: 15, w: 4, h: 5 },    // SW strong-cell (chest, on the cell-ring loop)
    { x: 2, y: 15, w: 4, h: 5 },    // deep dead-end SEALED VAULT (RICHEST hoard, off the SW)
    { x: 7, y: 8, w: 5, h: 6 },     // collapsed central ROTUNDA hub (the watch-brazier rest; cells ring it)
    { x: 13, y: 7, w: 4, h: 7 },    // the wraith-captain's hall (east cap)
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 3, y: 11 }],                            // mouth → breach-mouth
    [{ x: 4, y: 9 }, { x: 8, y: 4 }, { x: 9, y: 9 }],              // breach-mouth → NW cell → rotunda (NORTH ring arm)
    [{ x: 4, y: 13 }, { x: 8, y: 17 }, { x: 9, y: 13 }],           // breach-mouth → SW cell → rotunda (SOUTH ring arm; the LOOP)
    [{ x: 10, y: 4 }, { x: 13, y: 4 }, { x: 11, y: 9 }],           // NW cell → NE cell → rotunda (the FISSURE cuts across here)
    [{ x: 7, y: 17 }, { x: 4, y: 16 }],                            // SW cell → deep sealed vault (spur to the richest)
    [{ x: 11, y: 11 }, { x: 14, y: 10 }],                          // rotunda → wraith-captain's hall (boss funnel)
    [{ x: 13, y: 5 }, { x: 11, y: 10 }],                           // NE cell ↔ rotunda (the breach-fissure diagonal cross-link / loop)
  ],
  chests: [
    { x: 8, y: 3 },    // NW strong-cell (cell-ring loop)
    { x: 8, y: 16 },   // SW strong-cell (cell-ring loop)
    { x: 3, y: 18 },   // deep SEALED VAULT (RICHEST — reward the brave)
  ],
  rests: [{ x: 9, y: 11 }], // the watch-brazier in the collapsed rotunda — the breather before the wraith-captain
  drops: [
    { x: 14, y: 3, to: { x: 3, y: 11 } }, // NE cell RUBBLE-SLIDE collapse → drops you back to the breach-mouth (found shortcut home)
  ],
  reprieve: UNDERVAULT_BRAZIER,
  scatter: 0.07,
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
// THE RELIQUARY CRYPT — reshaped to read as CHAMBERS OFF A NAVE (anti-reskin, 2026-06-23): a
// solemn 18×22 crypt built on sacred axial geometry — a central processional NAVE running west→east
// with burial CHAPELS opening off it to the north and south, NOT a cave fork. You enter the west
// narthex; the nave is the spine the player keeps returning to, with paired chapels (an ossuary and a
// catacomb) looping the nave on each side, a deep dead-end RELIQUARY holding the richest hoard behind
// the south chapels, and a crypt-stair collapse dropping the far chapel back to the narthex. The
// crypt-keeper's sanctum caps the east apse. REPRIEVE: a still-burning reliquary altar grants `mana` —
// a blessed wellspring rekindles spent magic (partial MP); it mends no flesh.
const CRYPT_RELIQUARY: Reprieve = {
  kind: "mana", amount: 0.4, name: "A Reliquary Altar",
  blurb: "You kneel at an altar where a votive flame has never gone out, and the old blessing soaks back into your spent magic — but the saints here guard the dead, not the wounds of the living.",
};
const WHISPERHILLS_DUNGEON: DungeonLayout = {
  w: 18, h: 22, entry: { x: 1, y: 11 }, gate: { x: 1, y: 11 }, boss: { x: 14, y: 10 },
  rooms: [
    { x: 2, y: 8, w: 4, h: 6 },     // west NARTHEX (entry; the head of the nave — spans gate.y=11)
    { x: 7, y: 9, w: 6, h: 4 },     // the processional NAVE (the spine; holds the reliquary-altar rest)
    { x: 7, y: 3, w: 5, h: 4 },     // north OSSUARY chapel (chest, loops the nave)
    { x: 7, y: 15, w: 5, h: 4 },    // south CATACOMB chapel (chest, loops the nave)
    { x: 13, y: 3, w: 4, h: 4 },    // NE chantry chapel (holds the crypt-stair collapse drop)
    { x: 13, y: 15, w: 4, h: 4 },   // deep dead-end RELIQUARY (RICHEST hoard, behind the south chapels)
    { x: 13, y: 8, w: 4, h: 6 },    // the crypt-keeper's east apse sanctum (boss)
  ],
  paths: [
    [{ x: 1, y: 11 }, { x: 3, y: 11 }],                           // mouth → narthex
    [{ x: 5, y: 10 }, { x: 7, y: 10 }],                           // narthex → nave (the spine)
    [{ x: 9, y: 9 }, { x: 9, y: 6 }],                             // nave → north ossuary chapel
    [{ x: 9, y: 12 }, { x: 9, y: 15 }],                           // nave → south catacomb chapel
    [{ x: 10, y: 4 }, { x: 14, y: 4 }, { x: 12, y: 10 }],         // ossuary → NE chantry → back to nave (NORTH loop)
    [{ x: 10, y: 17 }, { x: 14, y: 17 }, { x: 12, y: 11 }],       // catacomb → deep reliquary → back to nave (SOUTH loop, past the richest)
    [{ x: 12, y: 10 }, { x: 14, y: 10 }],                         // nave → east apse sanctum (the funnel onto the crypt-keeper)
  ],
  chests: [
    { x: 9, y: 4 },    // north OSSUARY chapel (nave loop)
    { x: 9, y: 16 },   // south CATACOMB chapel (nave loop)
    { x: 14, y: 17 },  // deep RELIQUARY (RICHEST — reward the brave, behind the south chapels)
  ],
  rests: [{ x: 10, y: 10 }], // the reliquary altar mid-nave — the breather before the apse sanctum
  drops: [
    { x: 15, y: 4, to: { x: 3, y: 11 } }, // NE chantry CRYPT-STAIR collapse → drops you back to the narthex (found shortcut home)
  ],
  reprieve: CRYPT_RELIQUARY,
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
// THE DWARVEN STRONGHOLD — reshaped to read FORGED & BLOCKY (anti-reskin, 2026-06-23): a
// 24×24 fortress of square hewn halls laid out on a deliberate masonry GRID (a 3×2 block of forge-halls
// joined orthogonally), nothing organic about it. You enter a west GATEHOUSE, and the hold opens into a
// two-row grid of halls — a north forge-row and a south mine-row — knit by vertical shafts into a true
// MESH (you can circuit either row and cross between them). The central GREAT FORGE is the hub; a deep
// dead-end TREASURY sits walled off the south mine-row, and a one-way ORE-CHUTE collapse drops the far
// NE assay-hall back toward the gatehouse. The stone-king's arena caps the east end, funnelled through a
// short colonnade. REPRIEVE: a forge-vent's banked heat grants `mend` — a dwarven field-forge sears
// wounds shut (partial HP), but the cold hold does nothing for spent magic.
const STRONGHOLD_FORGE: Reprieve = {
  kind: "mend", amount: 0.4, name: "A Dwarven Forge-Vent",
  blurb: "You crouch by a vent where the old forge-heat still seeps from the rock and sear your hurts shut against the iron — your standing heroes recover some health, but the dead hold holds no magic to return. The fallen still need a town to revive.",
};
const FROSTPEAK_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 19, y: 11 },
  rooms: [
    { x: 2, y: 9, w: 5, h: 6 },     // west GATEHOUSE (entry; opens onto the masonry grid — spans gate.y=12)
    { x: 8, y: 2, w: 5, h: 5 },     // NW forge-hall (chest, on the north row loop)
    { x: 14, y: 2, w: 5, h: 5 },    // NE assay-hall (north row; holds the ore-chute collapse drop)
    { x: 8, y: 17, w: 5, h: 5 },    // SW mine-hall (chest, on the south row loop)
    { x: 14, y: 17, w: 5, h: 5 },   // SE deep TREASURY dead-end (RICHEST hoard, walled off the mine-row)
    { x: 8, y: 9, w: 8, h: 6 },     // CENTRAL GREAT FORGE hub (the forge-vent rest; both rows meet here)
    { x: 17, y: 8, w: 5, h: 8 },    // the stone-king's arena (east cap, funnel)
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 4, y: 12 }],                            // mouth → gatehouse
    [{ x: 4, y: 10 }, { x: 10, y: 4 }, { x: 10, y: 9 }],           // gatehouse → NW forge-hall → great forge (NORTH-WEST shaft)
    [{ x: 4, y: 14 }, { x: 10, y: 19 }, { x: 10, y: 14 }],         // gatehouse → SW mine-hall → great forge (SOUTH-WEST shaft; the LOOP)
    [{ x: 11, y: 4 }, { x: 16, y: 4 }, { x: 14, y: 9 }],           // NW forge-hall → NE assay-hall → great forge (north row)
    [{ x: 11, y: 19 }, { x: 16, y: 19 }, { x: 16, y: 17 }],        // SW mine-hall → SE treasury (south row spur to the richest)
    [{ x: 16, y: 5 }, { x: 16, y: 17 }],                           // NE assay-hall ↔ SE treasury (vertical grid cross-link / loop)
    [{ x: 15, y: 11 }, { x: 18, y: 11 }],                          // great forge → arena (the funnel onto the stone-king)
  ],
  chests: [
    { x: 10, y: 3 },   // NW forge-hall (north row loop)
    { x: 10, y: 18 },  // SW mine-hall (south row loop)
    { x: 16, y: 20 },  // SE deep TREASURY (RICHEST — reward the brave, walled off the mine-row)
  ],
  rests: [{ x: 12, y: 11 }], // the forge-vent in the great forge — the breather before the climb to the stone-king
  drops: [
    { x: 17, y: 3, to: { x: 4, y: 12 } }, // NE assay-hall ORE-CHUTE collapse → drops you back to the gatehouse (found shortcut home)
  ],
  reprieve: STRONGHOLD_FORGE,
  scatter: 0.05,
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
// THE BESIEGED CITADEL / LIGHTHOUSE — reshaped to read as an ASCENDING FORTRESS (anti-reskin, the
// AURELION FINALE, 2026-06-23): a 24×24 keep that climbs from a breached west BARBICAN up through
// two concentric defensive WARDS to the lighthouse summit. NOT the old little fork. An outer ward
// (a ring of curtain-wall rooms) and an inner BAILEY hub wrap a deep dead-end POWDER MAGAZINE, with a
// long colonnaded climb funnelling the siege onto the summit arena. Two redundant ward routes loop the
// bailey, plus a SALLY-PORT collapse that drops the far NE bastion back to the barbican (the fortress
// shortcut). The continent-finale fight crowns the lighthouse summit. REPRIEVE: the lighthouse's great
// arcane LAMP grants `mana` — its lingering light rekindles spent magic (partial MP), but the cold keep
// dresses no wounds.
const CITADEL_LAMP: Reprieve = {
  kind: "mana", amount: 0.4, name: "The Lighthouse Lamp",
  blurb: "You stand a moment in the cold blue glow of the great lamp, and the light that once guided Aurelion's ships seeps back into your spent magic — but its fire is for the sea, not for flesh, and binds no wounds.",
};
const SUNBRIDGE_DUNGEON: DungeonLayout = {
  w: 24, h: 24, entry: { x: 1, y: 12 }, gate: { x: 1, y: 12 }, boss: { x: 19, y: 11 },
  rooms: [
    { x: 2, y: 9, w: 5, h: 6 },     // west BARBICAN (entry; the breach into the outer ward — spans gate.y=12)
    { x: 8, y: 2, w: 6, h: 5 },     // NW curtain-wall room (outer ward, chest, on the loop)
    { x: 8, y: 17, w: 6, h: 5 },    // SW cistern room (outer ward, chest, on the loop)
    { x: 15, y: 2, w: 5, h: 5 },    // NE bastion (outer ward; holds the sally-port collapse drop)
    { x: 15, y: 17, w: 5, h: 5 },   // SE magazine approach (outer ward)
    { x: 9, y: 9, w: 7, h: 6 },     // inner BAILEY hub (the lamp rest; both wards meet here)
    { x: 3, y: 3, w: 4, h: 4 },     // deep dead-end POWDER MAGAZINE (RICHEST, walled off the NW ward)
    { x: 17, y: 8, w: 5, h: 8 },    // the lighthouse-SUMMIT boss arena (east cap, the climb funnels here)
  ],
  paths: [
    [{ x: 1, y: 12 }, { x: 4, y: 12 }],                            // mouth → barbican
    [{ x: 4, y: 10 }, { x: 10, y: 4 }, { x: 11, y: 9 }],           // barbican → NW curtain-wall → bailey (NORTH ward arm)
    [{ x: 4, y: 14 }, { x: 10, y: 19 }, { x: 11, y: 14 }],         // barbican → SW cistern → bailey (SOUTH ward arm; the LOOP)
    [{ x: 11, y: 4 }, { x: 17, y: 4 }, { x: 15, y: 10 }],          // NW curtain-wall → NE bastion → bailey (outer ring, north)
    [{ x: 11, y: 19 }, { x: 17, y: 19 }, { x: 15, y: 13 }],        // SW cistern → SE magazine approach → bailey (outer ring, south)
    [{ x: 5, y: 9 }, { x: 5, y: 6 }],                              // barbican → deep powder magazine (spur to the richest)
    [{ x: 15, y: 11 }, { x: 18, y: 11 }],                          // bailey → summit arena (the funnel onto the finale boss)
  ],
  chests: [
    { x: 10, y: 3 },   // NW curtain-wall room (outer ward loop)
    { x: 10, y: 18 },  // SW cistern room (outer ward loop)
    { x: 4, y: 4 },    // deep POWDER MAGAZINE (RICHEST — reward the brave, walled off the NW ward)
  ],
  rests: [{ x: 12, y: 11 }], // the lighthouse lamp in the inner bailey — the LAST breather before the summit finale
  drops: [
    { x: 18, y: 3, to: { x: 4, y: 12 } }, // NE bastion SALLY-PORT collapse → drops you back to the barbican (found shortcut home)
  ],
  reprieve: CITADEL_LAMP,
  scatter: 0.05,
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
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren", layout: GREENVALE_DUNGEON, floors: GREENVALE_FLOORS, floorMini: "lieutenant" }, bands: ENCOUNTERS, layout: GREENVALE_LAYOUT, hub: "hearthford", hubs: ["hearthford"] },
  // ── ZONE 2 (index 1): Silverwood, the Ancient Forest (Lv 7–9) ──
  // Inbound from Greenvale the player celebrates in the grand trade capital Riverhearth (the
  // triumphant breather hub) and then steps into the old forest. The Elder Treant gates the way to
  // the Sunless Grove; the Hollow King waits at its heart. Attunements stay SPREAD (Dara's
  // no-region-identity ruling — the forest is NOT an ANIMA theme). Bands are first-pass (teach →
  // combine); balance-tuner owns the final numbers across the now-3-zone curve.
  { id: "silverwood", name: "Silverwood", mini: "treantelder", miniAdds: ["thornling", "thornling"], boss: "hollowking",
    // Inbound chain: celebrate in the grand capital Riverhearth, then the forest hamlet ELDERBOUGH is
    // Silverwood's true doorstep (the FINAL entry), then into the wood. `hub` = the doorstep for back-compat.
    hub: "elderbough", hubs: ["riverhearth", "elderbough"],
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
    hub: "wheatcross", hubs: ["wheatcross"], // the breadbasket's farming-crossroads doorstep (Dara-named)
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
    hub: "wrackport", hubs: ["wrackport"], // the storm-coast harbor doorstep (Dara-named)
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
    hub: "frosthold", hubs: ["frosthold"], // the dwarven hold-gate doorstep (Dara-named)
    envs: ["snow", "snow", "ice", "stone"], dungeon: { name: "The Dwarven Stronghold", env: "stronghold", layout: FROSTPEAK_DUNGEON }, layout: FROSTPEAK_LAYOUT, bands: [
      { at: 0.0, sets: [["icewolf", "icewolf"], ["mtnreaver", "icewolf"], ["icewolf", "icewolf", "mtnreaver"]] },
      { at: 0.2, sets: [["mtnreaver", "icewolf", "icewolf"], ["frostshade", "icewolf"], ["mtnreaver", "frostshade", "icewolf"], ["icewolf", "icewolf", "icewolf"], ["rimespine", "icewolf"]] },
      { at: 0.4, sets: [["stonesentinel", "icewolf", "icewolf"], ["frostshade", "mtnreaver", "icewolf"], ["stonesentinel", "frostshade", "icewolf"], ["rimespine", "frostshade", "icewolf"]] },
      { at: 0.6, sets: [["snowtroll", "icewolf", "icewolf"], ["stonesentinel", "mtnreaver", "frostshade"], ["snowtroll", "frostshade", "icewolf"], ["stonesentinel", "mtnreaver", "icewolf"], ["snowtroll", "rimespine", "icewolf"]] },
      { at: 0.8, sets: [["snowtroll", "stonesentinel", "frostshade", "icewolf"], ["stonesentinel", "mtnreaver", "frostshade", "icewolf"], ["snowtroll", "stonesentinel", "mtnreaver", "frostshade"], ["snowtroll", "rimespine", "stonesentinel", "frostshade"]] },
    ] },
  // ── OPTIONAL: Dawnfall Hold → the breached undervault (Lv 17–21) ──
  // CAST: the wilds that broke the fort + the hold's fallen watch. Open with the feral frontier-beast +
  // the poison-spear broken-watch, fold in the garrison-ghoul leecher + the fallen-archer harrier, then
  // the heavy rampart-hulk wall, reserving full 4-packs for the breached undervault. Champion = the
  // Fallen Watch-Commander. Attunements spread (ANIMA/NOX/UMBRAXIS/QUANTA/SOL).
  { id: "dawnfall", name: "Dawnfall Hold", mini: "watchcommander", miniAdds: ["brokenwatch", "fallenarcher"], boss: "watchcommander",
    hub: "lastlight", hubs: ["lastlight"], // the last frontier garrison doorstep (Dara-named)
    envs: ["ruin", "ruin", "stone", "ruin"], dungeon: { name: "The Breached Undervault", env: "keepvault", layout: DAWNFALL_DUNGEON }, layout: DAWNFALL_LAYOUT, bands: [
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
    hub: "vesperhal", hubs: ["vesperhal"], // the hillside cloister doorstep (Dara-named)
    envs: ["meadow", "meadow", "forest", "hollow"], dungeon: { name: "The Reliquary Crypt", env: "crypt", layout: WHISPERHILLS_DUNGEON }, layout: WHISPERHILLS_LAYOUT, bands: [
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
    hub: "sunpier", hubs: ["sunpier"], // the archipelago port doorstep, journey's-end (Dara-named)
    envs: ["harbor", "coast", "harbor", "harbor"], dungeon: { name: "The Besieged Citadel", env: "citadel", layout: SUNBRIDGE_DUNGEON }, layout: SUNBRIDGE_LAYOUT, bands: [
      { at: 0.0, sets: [["siegetrooper", "searaider"], ["searaider", "searaider"], ["siegetrooper", "searaider", "searaider"]] },
      { at: 0.2, sets: [["siegetrooper", "ballista", "searaider"], ["abyssspawn", "searaider"], ["siegetrooper", "abyssspawn", "searaider"], ["ballista", "siegetrooper", "searaider"]] },
      { at: 0.4, sets: [["drowned", "ballista", "searaider"], ["siegeram", "siegetrooper", "searaider"], ["abyssspawn", "drowned", "siegetrooper"], ["siegeram", "ballista", "searaider"]] },
      { at: 0.6, sets: [["siegeram", "ballista", "drowned", "searaider"], ["abyssspawn", "siegeram", "drowned"], ["siegeram", "siegetrooper", "ballista", "searaider"]] },
      { at: 0.8, sets: [["siegeram", "siegetrooper", "ballista", "drowned", "searaider"], ["siegeram", "abyssspawn", "drowned", "ballista"], ["siegeram", "siegetrooper", "abyssspawn", "drowned", "ballista"]] },
    ] },
];
