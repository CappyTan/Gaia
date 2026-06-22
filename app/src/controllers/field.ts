// Tile field map: grid, camera, movement, random encounters, chokepoint mini-boss + zone boss.

import { $ } from "../core/dom";
import { assetUrl } from "../core/assets";
import { clamp, ri, pick } from "../core/rng";
import { ZONES, greenvaleAreaAt, type Zone, type ZoneLayout, type DungeonLayout, type Pt, type Poi, type GreenvaleAreaId } from "../data/zones";
import {
  OVERWORLD_ID, AURELION_ID, regionAt, authoredAt, placementOf,
  buildAuthoredGrid, realizeKindWorld, tileHash, builtZonesOf,
} from "../data/world";
import { Music } from "../audio/music";
import { settlement, SETTLEMENTS, TOWN_GLYPHS, TOWN_BLOCKERS, POI_OF, type Settlement, type TownNPC } from "../data/towns";
import { ENEMIES, RARE_MONSTERS, RARE_ENCOUNTER_CHANCE } from "../data/enemies";
import { rollItemAtRarity } from "../systems/loot";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Dialogue } from "../ui/dialogue";
import { Screens } from "./screens";
import { Game } from "./game";
import { Battle } from "./battle";
import { Telemetry } from "../telemetry/telemetry";

// Per-zone dungeon tileset prefix (east of the gate), indexed by zoneIndex: Greenvale -> Bandit
// Warren, Silverwood -> the Sunless Grove, Duskmarsh -> Drowned Vault. Matches ZONES order + the
// per-zone `dungeon.env`.
// [0]Greenvale=warren [1]Silverwood=grove [2]Duskmarsh=vault [3]Goldmeadow=vault (granary).
// AURELION COMPLETE (2026-06-21) — the new six reuse the nearest existing skin until bespoke art lands:
//   [4]stormcoast(seacave)=warren  [5]riverhearth(smuggden)=warren  [6]frostpeak(stronghold)=vault
//   [7]dawnfall(keepvault)=vault   [8]whisperhills(crypt)=grove     [9]sunbridge(citadel)=vault
const DUNGEON_SETS = ["warren", "grove", "vault", "granary", "warren", "warren", "vault", "vault", "grove", "vault"];

// OPTIONAL (side) zones vs SPINE (mainline progression). The mouth caption distinguishes the two
// (a spine dungeon reads `↦ <name>`; an optional one reads `<name> (optional)`). The Aurelion-complete
// review names the optional set; everything else is spine-ish (the mainline ladder to Sunbridge).
const OPTIONAL_ZONES = new Set(["stormcoast", "riverhearth", "dawnfall", "whisperhills"]);

// Overworld/dungeon WALL kinds — impassable, and a flood-fill barrier (anti-soft-lock reasons over
// these). `tree` walls every zone's canvas + the gate chokepoint; `water` is the marsh's hard pool.
// VARIED TERRAIN (2026-06-21): `cliff` (rocky mountain wall) + `river` (watercourse) also hard-block;
// the `bridge`/`ford` crossings + the POI kinds are WALKABLE (deliberately absent here).
const FIELD_WALLS = new Set(["tree", "water", "cliff", "river"]);

// POI tile kinds (the INHABITED-world layer) — walkable special tiles with a `move()` interaction.
const POI_KINDS = new Set(["shrine", "camp", "landmark", "signpost"]);

// ── Seamless big-map (ADR 0009 / Stage 2B) realization constants ──────────────────────────────
// 32×32 world-tile chunks keyed `(wx>>5,wy>>5)`. Realized once, cached, evicted >3 Chebyshev away.
const CHUNK = 32, CHUNK_SHIFT = 5;          // 2^5 = 32
const SEAM_K = 3;                            // seam-dither half-width (tiles) — matches seamBlendBand K
const EVICT_CHEB = 3;                        // evict chunks > this many chunks (Chebyshev) from player
const CHUNK_MARGIN = 1;                      // realize the viewport chunk-ring + this many extra rings
// `tileHash` (the ONLY randomness at realize time — never Math.random, so re-realizing a chunk is
// byte-identical = no flicker; Stage 2B determinism) is imported from data/world (shared with the
// pure realizer + tests).

// AREA ENCOUNTER LEAN → which existing-bestiary creatures "belong" here (ADR 0009 exemplar, now keyed
// by the Area's `encounterLean` so it is ZONE-AGNOSTIC — the same table serves discrete Greenvale and
// the big-map window, and any future zone whose Areas reuse these lean keys). NO new/restatted enemies;
// the lean only biases WHICH of a depth band's balanced sets you meet, never the curve. Greenvale leans:
//   low-slime-kobold (Commons) · kobold-bandit (Orchard) · bandit-mage (Fields) · rare-lair (Grove) ·
//   miniboss-gate (Warren Approach).
// Discrete Greenvale's Area ids → their world.ts encounter-lean (so the discrete path shares the
// zone-agnostic LEAN_FAVOUR table above, mirroring the big-map window's cached cell lean).
const GV_AREA_LEAN: Record<GreenvaleAreaId, string> = {
  "gv-commons": "low-slime-kobold", "gv-orchard": "kobold-bandit", "gv-fields": "bandit-mage",
  "gv-grove": "rare-lair", "gv-warren-approach": "miniboss-gate",
};
const LEAN_FAVOUR: Record<string, Record<string, number>> = {
  "low-slime-kobold": { slime: 2, slimebig: 2, kobold: 1 },
  "kobold-bandit":    { kobold: 2, kobolde: 2, gbandit: 1 },
  "bandit-mage":      { gbandit: 2, gmage: 2, kobolde: 1 },
  "rare-lair":        { gbandit: 1, gmage: 1, slimebig: 1, kobolde: 1 }, // off the safe path: rougher mixes
  "miniboss-gate":    { gbandit: 2, gmage: 1, kobolde: 1 },             // the camp's muster before the gate
};

/** One realized world cell: the realization KIND + the cached identity/dressing (so draw never calls regionAt). */
interface BigCell {
  kind: string;        // realization: authored tile kind, "grass" (open ground), or "uncharted" (soft edge)
  biome: string;       // identity (Area→biome), cached at realize time
  tileset: string;     // identity (Area→tileset), cached at realize time
  lean: string;        // encounter lean (Area), cached at realize time
  variant: number;     // 0..3 stable ground-variant index (for grass2 / *-ground2 alternates)
  dither?: string;     // seam dither: a neighbouring Area's biome to blend toward at this cell (if any)
}

export const Field = {
  // PACING KNOBS: ENC_MIN/MAX = steps between random fights. Map size + the gate/boss/chest anchors
  // are now BESPOKE PER ZONE (ADR 0006) — supplied by `zone().layout`, applied in genMap.
  W: 60, H: 18, tile: 0, px: 0, py: 0,
  map: [] as string[][],
  boss: { x: 58, y: 9 } as Pt,    // set from the zone layout in genMap
  stepsToEncounter: 0,
  gate: { x: 30, y: 9 } as Pt,    // mid-zone chokepoint — set from the zone layout in genMap
  chests: [] as Pt[],            // set from the zone layout in genMap
  lairAt: null as Pt | null,     // rare-monster lair (Greenvale: Hogger), set from the zone layout
  pois: [] as Poi[],             // points of interest / encampments (the INHABITED world), per-zone
  poisCleared: {} as Record<string, boolean>, // POI key ("<zoneId>:<x>,<y>") → spent (shrine used / camp cleared); PERSISTED in the save
  openedChests: {} as Record<string, boolean>, // chest key (overworld "<zoneId>:ow:<x>,<y>" / dungeon "<zoneId>:d<floor>:<x>,<y>") → looted; PERSISTED in the save (per-RUN, like poisCleared)
  pendingPack: null as string[] | null, // the camp pack staged for fightCamp() (set by runPoi)
  ENC_MIN: 10, ENC_MAX: 15, // steps between random fights (Dara: ~5 felt too frequent → 10-15)
  zoneIndex: 0,
  enteredDungeon: false,
  // ADR 0008 Stage 2 (step 3): which decoupled space we're in. "overworld" = the seamless region
  // grid (with the dungeon MOUTH POI); "dungeon" = the discrete dungeon grid (entered through the
  // mouth). Only GREENVALE uses the new genOverworld/genDungeon split for now (usesNewModel());
  // Silverwood/Duskmarsh stay on the LEGACY combined-grid path where `mode` is always "overworld"
  // and `inDungeon()` falls back to the old px>gate.x test.
  mode: "overworld" as "overworld" | "dungeon",
  mouth: { x: 40, y: 12 } as Pt, // overworld dungeon-mouth POI (new model) — set in genOverworld
  // ── MULTI-FLOOR DUNGEON (ADR 0008 Stage 3) ──────────────────────────────────────────────────
  // Which floor of a multi-floor dungeon (the Bandit Warren) the player is on (0 = B1). 0 for the 9
  // single-floor dungeons (their `dungeon.floors` is absent → a 1-element stack). PERSISTED in the save.
  dungeonFloor: 0,
  // Which floors' IN-DUNGEON mini-boss (the gating lieutenant) has been beaten, by floor index. A floor
  // with no `miniboss` is implicitly open; a beaten mini turns that floor's stairs live. Reset on a fresh
  // descent into the dungeon; PERSISTED so a resume mid-dungeon keeps a beaten gate open.
  dungeonMiniCleared: {} as Record<number, boolean>,
  // The floor whose in-dungeon mini-boss fight is in flight (so battle.ts → onMiniDefeated can mark
  // THIS floor cleared, distinct from the overworld mouth guard). -1 = none / the mouth guard fight.
  pendingFloorMini: -1,
  // TOWN: a real walkable settlement (data-driven, ADR 0006) reusing this same canvas/camera/dpad.
  // Loaded by id from data/towns.ts. No encounters; buildings are walk-in POIs; NPCs are talked to.
  townMode: false,
  town: null as Settlement | null,
  npcs: [] as TownNPC[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  tiles: {} as Record<string, HTMLImageElement>, // loaded field sprites (empty until ready)

  // ── Seamless big-map (ADR 0009 / Stage 2B) ──────────────────────────────────────────────────
  // When `bigMap` is ON (GREENVALE ONLY for now), the overworld is rendered+roamed as a WINDOW into
  // the one 960×640 world coordinate space: `wx/wy` (world tiles) is the player's source of truth and
  // `draw()`/`move()`/`passable` work in world coords off a chunk cache. When OFF (Silverwood/Duskmarsh,
  // and as a safety toggle) the existing discrete grid path runs UNCHANGED. The flag gates ONLY the
  // overworld — dungeons stay discrete (mode="dungeon", `genDungeon`) regardless.
  // `bigMapEnabled` is the MASTER toggle: ON = the seamless continent-wide big map (ADR 0008/0009)
  // is the live overworld; flip OFF for the proven discrete fallback. `bigMap` is the per-load
  // ACTIVE-state flag set by enterBigMap(). LIVE as of v0.62 (Dara's go-ahead) — the discrete path
  // remains intact behind this flag as the instant fallback.
  bigMapEnabled: true,
  bigMap: false,
  wx: 0, wy: 0,                                   // player world-tile position (source of truth when bigMap)
  face: "down" as "down" | "up" | "left" | "right", // walk-cycle facing, set from the last move's dx/dy
  step: 0,                                        // walk-cycle counter, advanced on each successful step
  chunks: new Map<string, BigCell[][]>(),         // realized 32×32 chunks, key `cx,cy`; built on move()
  // Stage 2C: the big map is CONTINENT-WIDE — every built zone's authored blueprint is realized into
  // the one 960×640 world, the open continent bridging them (G22). `authoredGrids` maps a built zone
  // id → its authored overworld blueprint (local string[][]); `bigZone` is the zone the player is
  // CURRENTLY standing in (drives zoneIndex/bands/mouth/dungeon), derived per-step in bigMove.
  authoredGrids: {} as Record<string, string[][]>,
  bigZone: "" as string,                          // the built zone the player currently stands in ("" = open continent)
  bigMusic: "field" as string,                    // the big-map overworld song key currently playing (duck-swap on change)

  // Preload the overworld (Greenvale) tileset + both dungeon tilesets; each redraws as it lands.
  // (merchant.png is sliced for later — the merchant is a between-zones overlay, not a field tile.)
  loadTiles(): void {
    const names = ["grass", "grass2", "path", "tree", "bush", "rock", "chest", "lair", "player"];
    // Directional walk-cycle frames: player-<down|up|left|right>-<0|1|2> (right = mirrored left).
    // Falls back to the static "player" sprite for any frame that fails to load.
    for (const d of ["down", "up", "left", "right"]) for (let i = 0; i < 3; i++) names.push(`player-${d}-${i}`);
    // VARIED TERRAIN + POI sprite slots (2026-06-21) — placeholders until art-integrator slices them
    // (see asset-gaps.md). cliff/bridge/ford ground tiles + the four POI kinds; river reuses water.
    for (const n of ["cliff", "bridge", "ford", "shrine", "camp", "landmark", "signpost"]) names.push(n);
    // marsh (Duskmarsh) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["water", "mire-ground", "mire-ground2", "mire-path", "deadtree", "reed", "bog"]) names.push(n);
    // ancient-forest (Silverwood) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["grove-ground", "grove-ground2", "grove-path", "oldtree", "fern", "mushroom"]) names.push(n);
    // Greenvale AREA dressing (ADR 0009 exemplar): per-Area shire flavor kinds — placeholders until
    // sliced (see asset-gaps.md). Orchard Ridge + Bandit Fields get their own ground/scatter so the
    // five Areas read distinct; Commons/Warren reuse the base shire grass; the Grove reuses the
    // existing forest (grove-*) kinds.
    for (const n of ["orchard-ground", "orchard-ground2", "orchard-tree", "meadow-ground", "meadow-ground2", "wheat"]) names.push(n);
    for (const set of DUNGEON_SETS) for (const c of ["floor", "floor2", "path", "wall", "rock", "chest", "entrance", "stairsdown", "stairsup"]) names.push(`${set}-${c}`);
    // town sprites (resolve to emoji fallback until the tileset is sliced — see asset-gaps.md)
    for (const n of ["town-cobble", "town-cobble2", "town-grass", "town-flower", "town-inn", "town-shop", "town-smith", "town-revive", "town-fountain", "town-exit", "town-tree", "town-well", "town-house"]) names.push(n);
    // Miregard marsh-outpost kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["town-plank", "town-bog", "town-stilt", "town-deadtree", "town-lantern"]) names.push(n);
    // Riverhearth city kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["town-avenue", "town-river", "town-bridge", "town-dock", "town-grand", "town-townhouse", "town-stall", "town-statue"]) names.push(n);
    names.forEach((nm) => {
      const url = assetUrl(`field/${nm}.png`);
      if (!url) return;
      const img = new Image();
      img.onload = () => { this.tiles[nm] = img; this.draw(); };
      img.src = url;
    });
    // NPC sprites (town folk): load assets/npcs/<townid>-<npcid>.png into tiles["npc:<townid>-<id>"].
    // Drop-in — the NPC draw falls back to the emoji until a sprite lands (see asset-gaps.md).
    for (const s of Object.values(SETTLEMENTS)) for (const n of s.npcs) {
      const url = assetUrl(`npcs/${s.id}-${n.id}.png`); if (!url) continue;
      const key = `npc:${s.id}-${n.id}`, img = new Image();
      img.onload = () => { this.tiles[key] = img; this.draw(); }; img.src = url;
    }
  },

  zone() { return ZONES[this.zoneIndex]; },
  isLastZone(): boolean { return this.zoneIndex >= ZONES.length - 1; },
  // SUGGESTED LEVEL (relative-danger signal): the entry difficulty of a built zone, derived cheaply
  // from the MIN enemy level across its opening band's sets (band[0]). No new data — auto-corrects if
  // the encounter tables change. Used by hint()/worldMap to surface "Lv N+" and warn under-levelled
  // players. Defaults to the current zone.
  suggestedLevel(zz?: Zone): number {
    const z = zz ?? this.zone();
    const sets = z.bands[0]?.sets ?? [];
    let min = Infinity;
    for (const s of sets) for (const k of s) { const lv = ENEMIES[k]?.lvl; if (lv != null && lv < min) min = lv; }
    return min === Infinity ? 1 : min;
  },
  // Party average level — the player's footing against a zone's suggested level.
  partyAvgLevel(): number {
    const p = Game.party;
    if (!p.length) return 1;
    return Math.round(p.reduce((n, m) => n + m.level, 0) / p.length);
  },
  // A grim mire reads differently from the shire: the overworld dresses its ground/walls/scatter as
  // a marsh (bog water, dead trees, reeds) when the zone's overworld env leads with "mire".
  isMire(): boolean { return this.zone().envs[0] === "mire"; },
  // An ancient forest reads DENSER + DARKER than the open shire: the overworld dresses its
  // ground/walls/scatter as an old-growth grove (mossy ground, towering old trees, fern/mushroom
  // clumps) when the zone's overworld env leads with "forest" (sibling to the marsh's isMire()).
  isForest(): boolean { return this.zone().envs[0] === "forest"; },
  // Whether THIS zone runs the new decoupled overworld/dungeon model (ADR 0008 Stage 2). Greenvale
  // first; the rest stay on the legacy combined-grid path until Chunk B proves the model out.
  usesNewModel(): boolean { return this.zoneIndex === 0; },
  // ── MULTI-FLOOR helpers (ADR 0008 Stage 3) ──────────────────────────────────────────────────
  // The floor stack for a zone's dungeon: its authored `floors` if multi-floor, else a 1-element stack
  // of the single `layout` (so the 9 single-floor dungeons flow through the same code unchanged).
  dungeonFloors(zoneIndex?: number): DungeonLayout[] {
    const d = ZONES[zoneIndex ?? this.zoneIndex].dungeon;
    return d.floors && d.floors.length ? d.floors : [d.layout];
  },
  // The DungeonLayout the player currently stands on (the current floor). Falls back to floor 0.
  curFloor(): DungeonLayout {
    const fl = this.dungeonFloors();
    return fl[clamp(this.dungeonFloor, 0, fl.length - 1)];
  },
  // The LAST floor (the one carrying the boss finale) — true when no deeper floor remains.
  isLastFloor(): boolean { return this.dungeonFloor >= this.dungeonFloors().length - 1; },
  // Whether the current floor's STAIRS DOWN are live: a floor with no gating mini-boss is always open;
  // a gated floor opens once that floor's lieutenant is beaten (tracked in dungeonMiniCleared).
  stairsOpen(): boolean { return !this.curFloor().miniboss || !!this.dungeonMiniCleared[this.dungeonFloor]; },
  // ── ADR 0009 exemplar: Greenvale is AREA-NATIVE — its playable overworld reads as its five Areas
  // (Hearthford Commons / Orchard Ridge / Bandit Fields / The Hidden Grove / Warren Approach), each
  // with its own ground dressing + encounter lean. Whether THIS zone is the Area-aware one. (Only
  // Greenvale for now — the exemplar; Silverwood/Duskmarsh are untouched pending the G21 decision.)
  isAreaNative(): boolean { return this.zoneIndex === 0; },
  // The Area a given overworld tile sits in (undefined in the dungeon / for a non-Area-native zone).
  areaAt(x: number, y: number): GreenvaleAreaId | undefined {
    if (!this.isAreaNative() || this.inDungeon()) return undefined;
    return greenvaleAreaAt(x, y);
  },
  // The Area the PLAYER currently stands in (drives the encounter lean).
  currentArea(): GreenvaleAreaId | undefined { return this.areaAt(this.px, this.py); },
  // The encounter LEAN of the Area under the player — zone-agnostic, used by pickAreaSet. BIG-MAP reads
  // the cached cell lean; discrete Greenvale maps its GreenvaleAreaId → the matching world.ts lean.
  currentLean(): string | undefined {
    if (this.bigMapActive()) return this.bigLean() || undefined;
    const area = this.currentArea();
    return area ? GV_AREA_LEAN[area] : undefined;
  },
  // In the zone's dungeon: tougher, own environment. New model = the `dungeon` mode flag; legacy =
  // east of the gate on the combined grid (px > gate.x).
  inDungeon(): boolean { return this.usesNewModel() ? this.mode === "dungeon" : this.px > this.gate.x; },
  envFor(p: number): string {
    if (this.inDungeon()) return this.zone().dungeon.env;
    const e = this.zone().envs;
    return e[clamp(Math.floor(p * 4), 0, e.length - 1)];
  },

  init(): void {
    this.canvas = $<HTMLCanvasElement>("#fieldCanvas");
    this.ctx = this.canvas ? this.canvas.getContext("2d") : null;
    this.zoneIndex = 0;
    this.enteredDungeon = false;
    this.poisCleared = {}; // fresh run — no POIs spent yet (a resume restores the saved set AFTER init())
    this.openedChests = {}; // fresh run — no chests looted yet (PER-RUN, like poisCleared; a resume restores the saved set AFTER init())
    this.resize();
    this.loadTiles();
    this.genMap(); // sets spawn (px/py) from the zone layout
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.hint();
    this.draw();
    window.addEventListener("resize", () => { this.resize(); this.draw(); });
  },
  // advance to a new zone (party/gold/inventory persist; zone progress + boss flags reset)
  loadZone(i: number): void {
    this.zoneIndex = i; Game.bossDefeated = false; Game.miniBossDefeated = false; this.enteredDungeon = false;
    this.resize(); this.genMap();
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    Screens.show("field");
    Overlay.show(`<h2 class="title-gold">${this.zone().name}</h2><p class="small">A new road, new dangers. Your gear and levels carry over.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Enter</button></div>`);
  },
  resize(): void {
    const stage = $("#stage");
    const s = stage ? stage.getBoundingClientRect() : { width: 0, height: 0 };
    const w = Math.round(s.width) || window.innerWidth || 800;
    const h = Math.round(s.height) || window.innerHeight || 600;
    if (this.canvas) { this.canvas.width = w; this.canvas.height = h; }
    this.tile = Math.max(28, Math.floor(Math.min(w / 13, h / 9))); // never 0 (would blank the map)
  },
  // Build the bespoke zone map (ADR 0006). DISPATCH (ADR 0008 Stage 2, step 3): GREENVALE builds the
  // OVERWORLD-only grid (genOverworld, with the dungeon MOUTH POI) and enters its dungeon as a
  // separate grid (genDungeon); every other zone still builds the SAME combined grid as before
  // (genCombined). All paths flood-fill to GUARANTEE the boss + every chest reachable (anti-soft-lock).
  genMap(): void {
    // BIG-MAP (Stage 2C): when the master toggle is on, the OVERWORLD is roamed as a window into the
    // 960×640 world CONTINENT — drop at Greenvale's authored spawn and roam all of Aurelion (the three
    // built cores + the open continent between them; G22). Position derives the zone, so no loadZone.
    // The safety toggle off (and dungeons regardless) takes the discrete path UNCHANGED.
    if (this.bigMapEnabled) { this.enterBigMap(); return; }
    this.bigMap = false;
    if (this.usesNewModel()) { this.mode = "overworld"; this.genOverworld(this.zone().id); }
    else this.genCombined();
  },

  // LEGACY combined grid: overworld WEST of a synthesized chokepoint wall at gateWallX + the rebased
  // dungeon EAST of it (a single grid, the gate the only gap). Byte-identical to the pre-Stage-2
  // map. Used by Silverwood/Duskmarsh until they migrate to genOverworld/genDungeon (Chunk B).
  genCombined(): void {
    this.townMode = false; this.mode = "overworld";
    const L = this.zone().layout;
    const D = this.zone().dungeon.layout; // decoupled dungeon grid (ADR 0008 Stage 2)
    const dx0 = L.gateWallX;               // re-add the rebase so D's local x maps back to world x
    const offPt = (q: Pt): Pt => ({ x: q.x + dx0, y: q.y });          // dungeon-local → combined-grid x
    const offR = (r: { x: number; y: number; w: number; h: number }) => ({ ...r, x: r.x + dx0 });
    const offP = (p: Pt[]) => p.map(offPt);
    this.W = L.w; this.H = L.h;
    this.gate = { ...L.gate }; this.boss = offPt(D.boss);
    this.chests = [...L.chests.map((c) => ({ ...c })), ...D.chests.map(offPt)];
    this.lairAt = L.lair ? { ...L.lair } : null;
    this.px = L.spawn.x; this.py = L.spawn.y;

    // 1. fill everything with tree (overworld = forest wall, dungeon = rock wall via the draw map)
    this.map = Array.from({ length: this.H }, () => Array.from({ length: this.W }, () => "tree"));
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const carve = (x: number, y: number, kind: string) => { if (inB(x, y)) this.map[y][x] = kind; };

    // 2. carve walkable rects (clearings/rooms): overworld field rects + the rebased dungeon rooms.
    const carveRect = (r: { x: number; y: number; w: number; h: number }) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass");
    };
    L.fieldRects.forEach(carveRect); L.dunRects.forEach(carveRect); D.rooms.map(offR).forEach(carveRect);

    // 3. carve paths (L-shaped segments between consecutive points), drawn as the intended route
    const carvePath = (p: Pt[]) => { for (let i = 1; i < p.length; i++) this.carveSeg(p[i - 1], p[i]); };
    L.fieldPaths.forEach(carvePath); L.dunPaths.forEach(carvePath); D.paths.map(offP).forEach(carvePath);

    // 4. the CHOKEPOINT: a full-height tree wall at gateWallX with one gap = the mini-boss gate.
    const gx = L.gateWallX;
    for (let y = 1; y < this.H - 1; y++) this.map[y][gx] = "tree";
    // a one-tile path stub on each side so the gate connects field ↔ dungeon
    carve(gx - 1, L.gate.y, "path"); carve(gx + 1, L.gate.y, "path");
    this.map[L.gate.y][gx] = "miniboss";

    this.scatterAndWater(L);

    // 6. chests + lair, each with a cleared 3×3 halo so they're reachable
    this.chests.forEach((c) => { this.halo(c); carve(c.x, c.y, "chest"); });
    if (this.lairAt) { this.halo(this.lairAt); carve(this.lairAt.x, this.lairAt.y, "lair"); }
    this.stampPois(L); // POIs (the INHABITED world)
    carve(this.boss.x, this.boss.y, "boss");
    carve(L.spawn.x, L.spawn.y, "path");

    // 7. ANTI-SOFT-LOCK: flood-fill from spawn (gate walkable) and repair any walled-off feature —
    //    boss, chests, lair, AND every walkable crossing/POI (so river/cliff terrain can't strand them).
    const targets = [this.boss, ...this.chests]; if (this.lairAt) targets.push(this.lairAt);
    if (L.bridges) targets.push(...L.bridges);
    if (L.fords) targets.push(...L.fords);
    targets.push(...this.pois.map((p) => ({ x: p.x, y: p.y })));
    this.ensureReachable(L.spawn, targets);
  },

  // ── ADR 0008 Stage 2 (step 3): the OVERWORLD-only grid (no dungeon, no gate wall) — the seamless
  // region. The dungeon mouth is a POI tile: "miniboss" while the mini guards it, "mouth" once the
  // mini is beaten (stepping onto it then descends, via move()). Greenvale only for now.
  genOverworld(regionId: string): void {
    this.townMode = false;
    const z = ZONES.find((zz) => zz.id === regionId) ?? this.zone();
    const L = z.layout;
    this.W = L.w; this.H = L.h;
    this.gate = { ...L.mouth }; this.mouth = { ...L.mouth };
    this.boss = { ...L.mouth }; // no overworld boss tile; placeholder so progress()/draw stay safe
    this.chests = L.chests.map((c) => ({ ...c }));
    this.lairAt = L.lair ? { ...L.lair } : null;
    this.px = L.spawn.x; this.py = L.spawn.y;

    this.map = Array.from({ length: this.H }, () => Array.from({ length: this.W }, () => "tree"));
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const carve = (x: number, y: number, kind: string) => { if (inB(x, y)) this.map[y][x] = kind; };
    const carveRect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass"); };
    L.fieldRects.forEach(carveRect);
    const carvePath = (p: Pt[]) => { for (let i = 1; i < p.length; i++) this.carveSeg(p[i - 1], p[i]); };
    L.fieldPaths.forEach(carvePath);

    this.scatterAndWater(L);

    // ALREADY-LOOTED chests revert to plain path (mirrors stampPois' spent-POI handling) so a Continue
    // can't re-spawn a looted chest; a still-sealed chest carves as "chest". An opened chest is just
    // walkable floor, so it's also dropped from the anti-soft-lock targets (it can never strand anything).
    const owOpened = (c: Pt) => !!this.openedChests[this.chestKey(z.id, "ow", c.x, c.y)];
    this.chests.forEach((c) => { this.halo(c); carve(c.x, c.y, owOpened(c) ? "path" : "chest"); });
    if (this.lairAt) { this.halo(this.lairAt); carve(this.lairAt.x, this.lairAt.y, "lair"); }
    this.stampPois(L); // POIs (the INHABITED world)
    // The mouth POI: guarded by the mini until it's beaten, then enterable.
    this.halo(this.mouth);
    this.map[this.mouth.y][this.mouth.x] = Game.miniBossDefeated ? "mouth" : "miniboss";
    carve(L.spawn.x, L.spawn.y, "path");
    // Re-enterable hub marker (any zone with a hub), one tile in from spawn (mirrors buildAuthoredGrid).
    const village = this.zone().hub ? { x: Math.max(1, L.spawn.x - 1), y: L.spawn.y } : null;
    if (village) { this.halo(village); carve(village.x, village.y, "village"); }

    // ANTI-SOFT-LOCK: the mouth + every UNOPENED overworld chest/lair/crossing/POI + the hub marker reachable from spawn.
    const targets = [this.mouth, ...this.chests.filter((c) => !owOpened(c))]; if (this.lairAt) targets.push(this.lairAt); if (village) targets.push(village);
    if (L.bridges) targets.push(...L.bridges);
    if (L.fords) targets.push(...L.fords);
    targets.push(...this.pois.map((p) => ({ x: p.x, y: p.y })));
    this.ensureReachable(L.spawn, targets);
  },

  // ── ADR 0008 Stage 2/3 (step 3): build ONE FLOOR of the zone's DUNGEON as its own grid. The player
  // lands at `entry` (the mouth's inside on B1, the up-stair on deeper floors). Sets mode="dungeon".
  // MULTI-FLOOR: an intermediate floor carries a `stairsDown` tile (drawn "stairsdown") gated by the
  // floor's `miniboss` lieutenant where one stands; the LAST floor carries the zone `boss` finale. The
  // up-stair (`entry`/`gate`) is drawn "stairsup" so the player reads the way back. Greenvale (zone 0)
  // is the first multi-floor zone; the 9 single-floor dungeons run a 1-element stack (floor 0) unchanged.
  genDungeon(zoneIndex: number, floorIdx = 0): void {
    this.townMode = false;
    this.mode = "dungeon";
    const floors = this.dungeonFloors(zoneIndex);
    this.dungeonFloor = clamp(floorIdx, 0, floors.length - 1);
    const last = this.dungeonFloor >= floors.length - 1;
    const D = floors[this.dungeonFloor];
    this.W = D.w; this.H = D.h;
    this.gate = { ...D.gate };           // the door/up-stair back out / up a floor
    this.boss = { ...D.boss };           // only meaningful on the LAST floor
    this.chests = D.chests.map((c) => ({ ...c }));
    this.lairAt = null;                  // no rare lairs in the dungeon
    this.px = D.entry.x; this.py = D.entry.y;

    this.map = Array.from({ length: this.H }, () => Array.from({ length: this.W }, () => "tree"));
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const carve = (x: number, y: number, kind: string) => { if (inB(x, y)) this.map[y][x] = kind; };
    const carveRect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass"); };
    D.rooms.forEach(carveRect);
    const carvePath = (p: Pt[]) => { for (let i = 1; i < p.length; i++) this.carveSeg(p[i - 1], p[i]); };
    D.paths.forEach(carvePath);

    // cosmetic scatter (drawn as rock in the dungeon tileset)
    const dens = D.scatter ?? 0.06;
    for (let y = 1; y < this.H - 1; y++) for (let x = 1; x < this.W - 1; x++)
      if (this.map[y][x] === "grass" && Math.random() < dens) this.map[y][x] = Math.random() < 0.6 ? "bush" : "rock";

    // ALREADY-LOOTED chests on THIS floor revert to plain path (mirrors stampPois' spent-POI handling) so
    // a Continue can't re-spawn a looted chest; a still-sealed chest carves as "chest". An opened chest is
    // just walkable floor, so it's also dropped from the anti-soft-lock targets (it can never strand anything).
    const dunZid = ZONES[zoneIndex]?.id ?? this.zone().id;
    const dunOpened = (c: Pt) => !!this.openedChests[this.chestKey(dunZid, this.dungeonFloor, c.x, c.y)];
    this.chests.forEach((c) => { this.halo(c); carve(c.x, c.y, dunOpened(c) ? "path" : "chest"); });
    // Anti-soft-lock targets: UNOPENED chests + the floor's egress (boss on the last floor, stairs-down otherwise).
    const targets: Pt[] = [...this.chests.filter((c) => !dunOpened(c))];
    if (last) { carve(this.boss.x, this.boss.y, "boss"); targets.push(this.boss); }
    else if (D.stairsDown) {
      this.halo(D.stairsDown);
      carve(D.stairsDown.x, D.stairsDown.y, "stairsdown");
      targets.push(D.stairsDown);
    }
    // IN-DUNGEON mini-boss gate (the lieutenant): while it stands, its tile reads as the guardian
    // ("miniboss") and the player can't pass to the stairs; beaten, it reverts to floor. Always a flood
    // target so the gated stairs/chests behind it stay reachable (the repair routes THROUGH the gate tile).
    if (D.miniboss) {
      this.halo(D.miniboss);
      const beaten = !!this.dungeonMiniCleared[this.dungeonFloor];
      carve(D.miniboss.x, D.miniboss.y, beaten ? "path" : "miniboss");
      // TRUE GATE PINCH (anti-bypass): the lieutenant gates a HORIZONTAL (east-west) passage, but its
      // own 3×3 halo (above) opens the 8 neighbours — leaving a walkable RING that lets the player slip
      // AROUND the fight via the tiles directly above/below it. Re-wall those perpendicular flanks so the
      // ONLY way through the gate is the lieutenant tile itself. Authors keep the gated rooms ≥2 cols
      // past the gate so no OTHER halo re-opens these flanks; the flood-repair still routes THROUGH the
      // (walkable) gate tile, so a beaten lieutenant can never strand the player.
      carve(D.miniboss.x, D.miniboss.y - 1, "tree");
      carve(D.miniboss.x, D.miniboss.y + 1, "tree");
      targets.push(D.miniboss);
    }
    // The up-stair / way back is "stairsup" on EVERY floor — "up = out" everywhere. On a deeper floor it
    // climbs to the previous floor; on floor 0 it IS the mouth-back door (stepping on it → ascend() → the
    // overworld mouth), so the player always has a walk-out trigger after climbing B2→B1 (QA fix).
    carve(D.entry.x, D.entry.y, "stairsup");

    this.ensureReachable(D.entry, targets);
  },

  // Shared carve helpers (used by genCombined / genOverworld / genDungeon).
  carveSeg(a: Pt, b: Pt): void {
    let cx = a.x, cy = a.y; const c = (x: number, y: number) => { if (x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1) this.map[y][x] = "path"; };
    c(cx, cy);
    while (cx !== b.x) { cx += Math.sign(b.x - cx); c(cx, cy); }
    while (cy !== b.y) { cy += Math.sign(b.y - cy); c(cx, cy); }
  },
  halo(p: Pt): void { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (xx > 0 && yy > 0 && xx < this.W - 1 && yy < this.H - 1 && this.map[yy][xx] === "tree") this.map[yy][xx] = "grass"; } },
  // scatter (decoration) + marsh water pools + VARIED TERRAIN (rivers/cliffs/bridges/fords) — shared by
  // genCombined/genOverworld (the dungeon does its own scatter and has no water/terrain). Never
  // overwrites the mouth/miniboss tile. Mirrors data/world.buildAuthoredGrid so the discrete + big-map
  // paths realize the SAME geography.
  scatterAndWater(L: ZoneLayout): void {
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const stamp = (rs: { x: number; y: number; w: number; h: number }[] | undefined, kind: string) => {
      if (!rs) return;
      for (const r of rs) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++)
        if (inB(x, y) && this.map[y][x] !== "miniboss") this.map[y][x] = kind;
    };
    const dens = L.scatter ?? 0.06;
    for (let y = 1; y < this.H - 1; y++) for (let x = 1; x < this.W - 1; x++)
      if (this.map[y][x] === "grass" && Math.random() < dens) this.map[y][x] = Math.random() < 0.6 ? "bush" : "rock";
    stamp(L.water, "water");
    stamp(L.rivers, "river");
    stamp(L.cliffs, "cliff");
    // walkable crossings stamp LAST (over river/water) — a bridge/ford reads on top of the watercourse.
    if (L.bridges) for (const b of L.bridges) if (inB(b.x, b.y)) this.map[b.y][b.x] = "bridge";
    if (L.fords) for (const f of L.fords) if (inB(f.x, f.y)) this.map[f.y][f.x] = "ford";
  },
  // Stamp the zone's POIs (the INHABITED world) onto the carved grid: each on a cleared halo, as its
  // own walkable kind — unless already spent (a used shrine / cleared camp reverts to plain ground so
  // it can't be re-triggered). Shared by genCombined/genOverworld.
  stampPois(L: ZoneLayout): void {
    this.pois = (L.pois ?? []).map((p) => ({ ...p }));
    const zid = this.zone().id;
    for (const p of this.pois) {
      this.halo(p);
      const spent = this.poisCleared[this.poiKey(zid, p.x, p.y)];
      this.map[p.y][p.x] = spent ? "path" : p.kind;
    }
  },
  // A per-ZONE POI key ("<zoneId>:<x>,<y>") so the persisted cleared-state can't collide across zones
  // (every zone reuses small x,y coords). Used by stampPois / runPoi and the big-map realize-apply.
  poiKey(zoneId: string, x: number, y: number): string { return zoneId + ":" + x + "," + y; },
  poiAt(x: number, y: number): Poi | undefined { return this.pois.find((p) => p.x === x && p.y === y); },
  // A per-CONTEXT chest key so a looted chest stays looted across a reload without colliding between an
  // overworld chest and a dungeon-floor chest that happen to share x,y. Overworld/big-map chests live in
  // a zone's local chest coords ("<zoneId>:ow:<x>,<y>"); dungeon chests are scoped to their floor
  // ("<zoneId>:d<floor>:<x>,<y>"). Used by openChest/openBigChest (set) and genOverworld/genDungeon/
  // enterBigMap (consult on regen). Mirrors poiKey's per-zone disambiguation.
  chestKey(zoneId: string, ctx: "ow" | number, x: number, y: number): string {
    return zoneId + ":" + (ctx === "ow" ? "ow" : "d" + ctx) + ":" + x + "," + y;
  },

  // bush/rock are decoration (walkable); tree and water are walls; the gate/mouth is walkable.
  flood(start: Pt): boolean[][] {
    const seen = Array.from({ length: this.H }, () => Array.from({ length: this.W }, () => false));
    const open = (x: number, y: number) => x >= 0 && y >= 0 && x < this.W && y < this.H && !FIELD_WALLS.has(this.map[y][x]);
    const q: Pt[] = [start]; if (open(start.x, start.y)) seen[start.y][start.x] = true; else return seen;
    while (q.length) {
      const { x, y } = q.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
      }
    }
    return seen;
  },
  // Verify (and, if needed, repair) reachability of every target from `spawn` — punch a straight
  // L-corridor through walls to any feature that ended up walled off, then re-flood.
  ensureReachable(spawn: Pt, targets: Pt[]): void {
    let seen = this.flood(spawn);
    for (const t of targets) {
      if (seen[t.y]?.[t.x]) continue;
      let best: Pt | null = null, bd = Infinity;
      for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++)
        if (seen[y][x]) { const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd) { bd = d; best = { x, y }; } }
      if (best) {
        let cx = best.x, cy = best.y;
        const step = (x: number, y: number) => { if (x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1 && FIELD_WALLS.has(this.map[y][x])) this.map[y][x] = "path"; };
        while (cx !== t.x) { cx += Math.sign(t.x - cx); step(cx, cy); }
        while (cy !== t.y) { cy += Math.sign(t.y - cy); step(cx, cy); }
        seen = this.flood(spawn);
      }
    }
  },
  // ── TOWN ── Enter a walkable settlement by id (ADR 0006). Called via Game.openTown(id).
  // Service buildings are walk-in POIs; NPCs are walked up to and talked to; the gate leaves.
  // Stock is rolled by the caller (Game.openTown).
  enterTown(id = "hearthford"): void {
    this.genTown(id);
    Screens.show("field");
    // Re-sync the canvas to the live stage size (as init/loadZone/enterZoneFromVillage do). Entering a
    // town from the hub chain comes straight off the battle screen, so without this the field canvas
    // keeps stale state and the first draw can drop the player sprite (the gold marker shows, the body
    // doesn't) until something else forces a redraw. Resizing also resets the backing store cleanly.
    this.resize();
    this.draw(); this.hint();
    const s = this.town!;
    Overlay.show(`<h2 class="title-gold">${s.name}</h2><p class="small">${s.intro}</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Enter town</button></div>`);
  },
  // Decode the settlement's hand-authored ASCII layout into the tile grid + NPC list.
  genTown(id = "hearthford"): void {
    this.townMode = true;
    const s = settlement(id);
    this.town = s;
    this.map = s.layout.map((row) => Array.from(row, (ch) => TOWN_GLYPHS[ch] ?? "town-cobble"));
    this.H = this.map.length; this.W = this.map[0].length;
    this.npcs = s.npcs.map((n) => ({ ...n })); // shallow copy so dialogue state stays in data-shape
    const sp = s.spawn ?? { x: Math.floor(this.W / 2), y: this.H - 2 };
    this.px = clamp(sp.x, 0, this.W - 1); this.py = clamp(sp.y, 0, this.H - 1);
  },
  npcAt(x: number, y: number): TownNPC | undefined { return this.npcs.find((n) => n.x === x && n.y === y); },
  // Leave the STARTING village into the current zone (index 0). Rebuilds the zone map (town genTown
  // overwrote it), drops the player at the zone start, and arms encounters — like loadZone but
  // staying on the same zone index, with the zone-intro overlay.
  enterZoneFromVillage(): void {
    this.enteredDungeon = false;
    this.resize(); this.genMap();
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    Screens.show("field");
    const z = this.zone();
    Overlay.show(`<h2 class="title-gold">${z.name}</h2><p class="small">You set out from the village. Search off the path for treasure — and watch the road.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Set out</button></div>`);
  },
  // 0..1 progress through the current space. Legacy: px toward the combined-grid boss. New model:
  // OVERWORLD = px toward the dungeon mouth; DUNGEON = px toward the dungeon boss.
  progress(): number {
    // BIG-MAP overworld: progress is world-x from the current built zone's authored spawn toward its
    // mouth's world-x. In OPEN CONTINENT (no built zone under the player) there's no gate to progress
    // toward — report mid-progress (encounters there are suppressed anyway; G22 backlog land).
    if (this.bigMapActive()) {
      const pl = this.bigZone ? placementOf(this.bigZone) : undefined;
      if (!pl) return 0.5;
      const L = (ZONES.find((z) => z.id === this.bigZone) ?? this.zone()).layout;
      const x0 = pl.wx + L.spawn.x, x1 = pl.wx + L.mouth.x;
      return clamp((this.wx - x0) / Math.max(1, x1 - x0), 0, 1);
    }
    const goal = this.usesNewModel() && this.mode === "overworld" ? this.mouth.x : this.boss.x;
    return clamp((this.px - 1) / Math.max(1, goal - 1), 0, 1);
  },
  passable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    const cell = this.map[y][x];
    // In town: walls/decoration block, NPCs block (you bump into them = talk), service doors/gate
    // are walk-in. Buildings (t-inn/shop/smith/revive) are NOT in TOWN_BLOCKERS so you step onto them.
    if (this.townMode) return !TOWN_BLOCKERS.has(cell) && !this.npcAt(x, y);
    return !FIELD_WALLS.has(cell);
  },
  move(dx: number, dy: number): void {
    if (Game.state !== "field" && Screens.cur !== "field") return;
    // While a conversation is open, the d-pad/move keys advance the dialogue instead of walking.
    if (Dialogue.isOn()) { Dialogue.advance(); return; }
    if (Overlay.isOn()) return;
    // Turn to face the direction we're trying to walk (even into a wall) — drives the walk-cycle sprite.
    if (dx < 0) this.face = "left"; else if (dx > 0) this.face = "right"; else if (dy < 0) this.face = "up"; else if (dy > 0) this.face = "down";
    if (this.bigMapActive()) { this.bigMove(dx, dy); return; } // windowed big-map roams in world coords
    const nx = this.px + dx, ny = this.py + dy;
    // Walking into an NPC talks to them (you don't move onto their tile).
    if (this.townMode) { const npc = this.npcAt(nx, ny); if (npc) { this.talkTo(npc); return; } }
    if (!this.passable(nx, ny)) return;
    this.px = nx; this.py = ny; this.step++;
    if (this.townMode) { this.draw(); this.hint(); this.townTouch(this.map[ny][nx]); return; } // no steps/encounters in town
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.map[ny][nx];
    if (cell === "boss" && !Game.bossDefeated) { this.startBoss(); return; }
    // MULTI-FLOOR: an in-dungeon "miniboss" tile is the FLOOR LIEUTENANT (gates the stairs); the
    // overworld "miniboss" is the dungeon-mouth guard. Distinguish by mode so each fights its own cast.
    if (cell === "miniboss") {
      if (this.mode === "dungeon") { if (!this.dungeonMiniCleared[this.dungeonFloor]) this.startFloorMini(); else this.map[ny][nx] = "path"; return; }
      if (!Game.miniBossDefeated) { this.startMiniBoss(); return; }
    }
    if (cell === "mouth") { this.descend(); return; }        // step onto the cleared mouth → into the dungeon
    if (cell === "stairsdown") { if (this.stairsOpen()) this.descendFloor(); return; } // descend a floor
    if (cell === "stairsup") { this.ascendFloor(); return; } // climb a floor (or out on floor 0)
    if (cell === "village") { const h = this.zone().hub; if (h) Game.confirmEnterTownVisit(h); return; } // step onto the village → confirm, then into the zone's hub
    if (cell === "chest") { this.openChest(nx, ny); return; } // a chest doesn't also trigger a fight
    if (cell === "lair") { this.enterLair(nx, ny); return; }  // the rare-monster den (Hogger)
    if (POI_KINDS.has(cell)) { this.touchPoi(nx, ny); return; } // shrine / camp / landmark / signpost
    // LEGACY model: crossing the gate the first time = entering the (combined-grid) dungeon.
    if (!this.usesNewModel() && this.inDungeon() && !this.enteredDungeon) {
      this.enteredDungeon = true;
      const z = this.zone();
      Overlay.show(`<h2 class="title-gold">${z.dungeon.name}</h2><p class="small">You descend into the dungeon. The enemies here are stronger — but so is their hoard.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
      return;
    }
    this.stepsToEncounter--;
    if (this.stepsToEncounter <= 0) { this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX); this.rollEncounter(); }
  },
  // ── ADR 0008 Stage 2 (step 3): the DUNGEON MOUTH flow (new model, Greenvale). ─────────────────
  // Called by battle.ts when the mini-boss falls: in the new model the mouth STAYS but becomes
  // enterable (the guard is gone, not the threshold). Legacy zones keep the old "open the gate tile"
  // behaviour. Idempotent + safe to call on either model.
  onMiniDefeated(): void {
    // MULTI-FLOOR: if the just-won fight was an IN-DUNGEON floor lieutenant, route to its handler (it
    // opens that floor's stairs) — NOT the overworld mouth/gate, which the player already passed.
    if (this.pendingFloorMini >= 0) { this.onFloorMiniDefeated(); return; }
    if (this.usesNewModel()) {
      if (this.mode === "overworld" && this.map[this.mouth.y]) this.map[this.mouth.y][this.mouth.x] = "mouth";
    } else if (this.gate && this.map[this.gate.y]) {
      this.map[this.gate.y][this.gate.x] = "path"; // open the chokepoint into the combined dungeon
    }
    this.draw?.(); this.hint?.();
  },
  // Step onto the cleared mouth → build the dungeon grid (floor 0), drop into it, show the "you descend"
  // beat. A FRESH descent from the overworld resets the per-floor mini-gate state (re-cleared per visit).
  descend(): void {
    this.enteredDungeon = true;
    this.dungeonMiniCleared = {}; // fresh run of the dungeon — re-fight each floor's gating lieutenant
    this.pendingFloorMini = -1;   // defensive: no floor-mini fight is in flight on a fresh descent
    this.resize(); this.genDungeon(this.zoneIndex, 0); // sets mode="dungeon" + px/py to floor 0's entry
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Game.saveNow();
    const z = this.zone();
    // Swap to the zone's dedicated dungeon cue if it has one (else keep the overworld cue, as before).
    const dm = Music.forDungeon(z.id);
    if (dm && dm !== this.bigMusic) { this.bigMusic = dm; Music.play(dm); Music._renderStyleLabels?.(); }
    Overlay.show(`<h2 class="title-gold">${z.dungeon.name}</h2><p class="small">You descend into the dungeon. The enemies here are stronger — but so is their hoard.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
  },
  // MULTI-FLOOR: step onto the (open) stairs-down → build the NEXT floor at its entry. Carries the
  // beaten-gate state across floors (per-visit), autosaves the new floor so a resume restores it.
  descendFloor(): void {
    const floors = this.dungeonFloors();
    if (this.dungeonFloor >= floors.length - 1) return; // already on the last floor — no deeper to go
    this.resize(); this.genDungeon(this.zoneIndex, this.dungeonFloor + 1);
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Game.saveNow();
    const z = this.zone();
    const last = this.isLastFloor();
    const body = last
      ? `You descend the last stair — the hideout opens into the ${ENEMIES[z.boss].name}'s hall.`
      : `You descend deeper into ${z.dungeon.name}. The dens run hotter the lower you go.`;
    Overlay.show(`<h2 class="title-gold">${z.dungeon.name} · B${this.dungeonFloor + 1}</h2><p class="small">${body}</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
  },
  // MULTI-FLOOR: step onto the up-stair on a deeper floor → climb back to the PREVIOUS floor, landing
  // on that floor's stairs-down (so you arrive where you descended). On floor 0 the up-stair IS the
  // mouth-back door → ascend out to the overworld.
  ascendFloor(): void {
    this.pendingFloorMini = -1; // defensive: leaving a floor cancels any in-flight floor-mini routing
    if (this.dungeonFloor <= 0) { this.ascend(); return; }
    const prev = this.dungeonFloor - 1;
    this.resize(); this.genDungeon(this.zoneIndex, prev);
    const sd = this.curFloor().stairsDown;
    if (sd && this.passable(sd.x, sd.y)) { this.px = sd.x; this.py = sd.y; } // land back on the descent
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Game.saveNow();
  },
  // Climb back out of the dungeon to the overworld (new model). Rebuilds the overworld at the mouth.
  // BIG-MAP: restore the player onto the mouth's WORLD tile and re-enter the windowed overworld; the
  // chunk cache + authored blueprint carry over (the mouth never moved in world space).
  ascend(): void {
    this.pendingFloorMini = -1; // defensive: back out to the overworld with no floor-mini fight pending
    if (this.bigMap) {
      this.mode = "overworld"; this.enteredDungeon = false; // back on the seamless surface
      const pl = placementOf(this.bigZone)!;
      this.wx = pl.wx + this.mouth.x; this.wy = pl.wy + this.mouth.y; // step back out onto the mouth's world tile
      this.realizeAround();
      this.syncZoneFromWorld();
      this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
      this.draw(); this.hint();
      Game.saveNow();
      return;
    }
    this.resize(); this.genOverworld(this.zone().id); // mode="overworld", px/py at spawn
    this.px = this.mouth.x; this.py = this.mouth.y;    // step back out onto the mouth, not the far spawn
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Game.saveNow();
  },
  // Return to the seamless overworld from a HUB REVISIT (the village marker) — land back on the tile
  // we entered from (wx/wy were left untouched while in town). Mirrors enterBigMap but keeps the
  // player's world position; falls back to the zone spawn if the world tile is unknown (e.g. resumed
  // from a save made inside the town). Discrete fallback rebuilds the overworld when big-map is off.
  returnToOverworld(): void {
    if (this.bigMapEnabled) {
      this.townMode = false; this.mode = "overworld"; this.bigMap = true;
      this.authoredGrids = {};
      for (const id of this.bigBuiltZoneIds()) this.authoredGrids[id] = buildAuthoredGrid(id, Game.miniBossDefeated);
      this.chunks.clear();
      if (!this.wx && !this.wy) { // unknown world tile (e.g. resumed in town) → drop at this zone's spawn
        const z = this.zone(), pl = placementOf(z.id) ?? placementOf("greenvale")!;
        this.wx = pl.wx + z.layout.spawn.x; this.wy = pl.wy + z.layout.spawn.y;
      }
      this.resize();
      this.syncZoneFromWorld();
      this.realizeAround();
      Screens.show("field");
      this.draw(); this.hint();
      return;
    }
    this.townMode = false; this.mode = "overworld";
    this.resize(); this.genOverworld(this.zone().id);
    Screens.show("field"); this.draw(); this.hint();
  },
  // ═══ SEAMLESS BIG-MAP (ADR 0009 / Stage 2C) — CONTINENT-WIDE, behind `bigMap` ═══════════════════
  // Render+roam the whole AURELION continent as a WINDOW into the 960×640 world (G22). `wx/wy` is the
  // source of truth; the viewport is iterated from a 32×32 chunk cache (realized on move, evicted when
  // far); each cell caches its identity (Area→biome/tileset/lean/music) at realize time so `draw()`
  // never calls regionAt. The built cores (Greenvale/Silverwood/the Duskmarsh/Goldmeadow) and the open
  // continent between them are all roamable; position derives the zone (NO loadZone, ever).

  /** Is the windowed big-map overworld currently the active surface? (flag on + not in a dungeon/town.) */
  bigMapActive(): boolean { return this.bigMap && this.mode === "overworld" && !this.townMode; },

  /** The built zones whose authored cores live on the roamed continent (Aurelion's three built zones). */
  bigBuiltZoneIds(): string[] { return builtZonesOf(AURELION_ID).map((z) => z.zone!).filter((id) => placementOf(id)); },

  // ENTER the continent big map: build EVERY built zone's authored blueprint (pure, data/world),
  // drop the player at Greenvale's authored spawn mapped to world coords, sync zoneIndex/mouth to the
  // zone under the player, realize the viewport ring, draw.
  enterBigMap(startZone = "greenvale"): void {
    this.townMode = false; this.mode = "overworld"; this.bigMap = true;
    this.authoredGrids = {};
    for (const id of this.bigBuiltZoneIds()) {
      this.authoredGrids[id] = buildAuthoredGrid(id, Game.miniBossDefeated);
      // Re-apply persisted cleared-POI state: a used shrine / raided camp stays gone across a reload (the
      // authored grid is pure + always restamps every POI, so the realizer would otherwise re-spawn them).
      const z = ZONES.find((zz) => zz.id === id);
      for (const p of z?.layout.pois ?? [])
        if (this.poisCleared[this.poiKey(id, p.x, p.y)] && this.authoredGrids[id][p.y]) this.authoredGrids[id][p.y][p.x] = "path";
      // Re-apply persisted opened-chest state the same way: a looted overworld chest stays gone (carved as
      // path) across a reload, so the realizer can't re-spawn it (chest coords are the zone's authored locals).
      for (const c of z?.layout.chests ?? [])
        if (this.openedChests[this.chestKey(id, "ow", c.x, c.y)] && this.authoredGrids[id][c.y]) this.authoredGrids[id][c.y][c.x] = "path";
    }
    const z = ZONES.find((zz) => zz.id === startZone) ?? ZONES[0];
    const pl = placementOf(startZone)!, L = z.layout;
    this.wx = pl.wx + L.spawn.x; this.wy = pl.wy + L.spawn.y; // authored spawn → world coords
    this.chunks.clear();
    this.syncZoneFromWorld();   // sets zoneIndex/bigZone/mouth/gate + cues music for the spawn position
    this.realizeAround();
    this.draw(); this.hint();
  },

  // POSITION-DERIVED STATE (Stage 2C, the no-loadZone core): from the player's world tile, resolve the
  // built zone they stand in (regionAt → zone whose Area owns this tile) and sync the derived run state
  // — zoneIndex (so bands/dungeon-set/rares follow), bigZone, the zone's mouth (for progress/descend),
  // and the overworld music. In OPEN CONTINENT (no built zone) bigZone="" (no encounters, ambient cue).
  // Cheap: one regionAt at the player tile per step (off the per-frame draw path).
  syncZoneFromWorld(): void {
    const res = regionAt(OVERWORLD_ID, this.wx, this.wy);
    const zid = res.zone?.zone; // a BUILT zone id, or undefined (backlog/open continent)
    const builtId = zid && placementOf(zid) ? zid : "";
    this.bigZone = builtId;
    // Keep zoneIndex in LOCKSTEP with the player's POSITION whenever they're over a built zone — gate on
    // the zoneIndex actually differing, NOT on bigZone *changing*. (A prior desync — bigZone already
    // "greenvale" but zoneIndex still stuck on the Duskmarsh — otherwise pinned the region pill + level
    // to the wrong zone: "The Duskmarsh · Lv 7+" while standing in Greenvale.) Open continent (builtId="")
    // keeps the last entered zone (there's no zone out in the wilds).
    if (builtId) {
      const zi = ZONES.findIndex((z) => z.id === builtId);
      if (zi >= 0 && zi !== this.zoneIndex) {
        this.zoneIndex = zi;
        const L = this.zone().layout;
        this.mouth = { ...L.mouth }; this.gate = { ...L.mouth };
      }
    }
    // MUSIC: Area identity music with a zone/open-continent fallback; duck-swap only when it changes.
    const key = Music.forField(res.area?.identity.music, builtId || undefined);
    if (key !== this.bigMusic) { this.bigMusic = key; Music.play(key); Music._renderStyleLabels?.(); }
  },

  // The overworld song key for the CURRENT position — used by screens.ts (both paths). Big-map derives
  // it from the player's Area identity; the discrete path from the zone's env (mire/forest/field).
  fieldMusic(): string {
    if (this.bigMapActive()) return Music.forField(regionAt(OVERWORLD_ID, this.wx, this.wy).area?.identity.music, this.bigZone || undefined);
    return Music.forField(this.isMire() ? "mire" : this.isForest() ? "forest" : "field", this.zone().id);
  },

  chunkKey(cx: number, cy: number): string { return cx + "," + cy; },

  // REALIZE one 32×32 chunk once (deterministic): per cell run the two-lookup model — realization
  // (authored grid hit → that kind; else inside the zone polygon → "grass"; else "uncharted") and
  // identity/dressing (regionAt→Area→biome/tileset/lean, cached so draw() never calls regionAt) +
  // a seam dither (a neighbouring Area's biome within K tiles, blended by the stable hash).
  realizeChunk(cx: number, cy: number): BigCell[][] {
    const x0 = cx << CHUNK_SHIFT, y0 = cy << CHUNK_SHIFT;
    const cells: BigCell[][] = [];
    for (let ly = 0; ly < CHUNK; ly++) {
      const row: BigCell[] = [];
      for (let lx = 0; lx < CHUNK; lx++) {
        const wx = x0 + lx, wy = y0 + ly;
        // (a) REALIZATION (pure, data/world, G22): ANY built zone's authored core → that kind; else
        // inside ANY continent → open ground ("grass"); else uncharted soft edge (ocean / world edge).
        const kind = realizeKindWorld(OVERWORLD_ID, this.authoredGrids, wx, wy);
        // (b) IDENTITY / DRESSING — cached so the per-frame draw path never calls regionAt.
        const id = regionAt(OVERWORLD_ID, wx, wy);
        const ai = id.area?.identity;
        const biome = ai?.biome ?? "plains", tileset = ai?.tileset ?? "shire", lean = ai?.encounterLean ?? "";
        const variant = ((wx * 7 + wy * 13) % 4 === 0) ? 1 : 0;
        // SEAM DITHER: within K of a DIFFERENT neighbouring Area, blend toward its biome by the hash.
        let dither: string | undefined;
        if (id.area) {
          for (const [dx, dy] of [[SEAM_K, 0], [-SEAM_K, 0], [0, SEAM_K], [0, -SEAM_K]]) {
            const nb = regionAt(OVERWORLD_ID, wx + dx, wy + dy).area;
            if (nb && nb.identity.biome !== biome) {
              // closer to the seam → likelier to flip; stable per cell+neighbour.
              if (tileHash(wx * 3 + dx, wy * 3 + dy) < 0.45) { dither = nb.identity.biome; break; }
            }
          }
        }
        row.push({ kind, biome, tileset, lean, variant, dither });
      }
      cells.push(row);
    }
    return cells;
  },

  // Realize the viewport chunk-ring + a 1-chunk margin around the player; evict chunks far away.
  // Called on move() (NOT in draw()) so realization cost is paid once per step, off the frame path.
  realizeAround(): void {
    const t = this.tile || 32;
    const viewW = this.canvas ? Math.ceil(this.canvas.width / t) : 13;
    const viewH = this.canvas ? Math.ceil(this.canvas.height / t) : 9;
    const cx0 = ((this.wx - (viewW >> 1)) >> CHUNK_SHIFT) - CHUNK_MARGIN;
    const cy0 = ((this.wy - (viewH >> 1)) >> CHUNK_SHIFT) - CHUNK_MARGIN;
    const cx1 = ((this.wx + (viewW >> 1)) >> CHUNK_SHIFT) + CHUNK_MARGIN;
    const cy1 = ((this.wy + (viewH >> 1)) >> CHUNK_SHIFT) + CHUNK_MARGIN;
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const k = this.chunkKey(cx, cy);
      if (!this.chunks.has(k)) this.chunks.set(k, this.realizeChunk(cx, cy));
    }
    // EVICT chunks > EVICT_CHEB chunks (Chebyshev) from the player's chunk.
    const pcx = this.wx >> CHUNK_SHIFT, pcy = this.wy >> CHUNK_SHIFT;
    for (const key of this.chunks.keys()) {
      const [kx, ky] = key.split(",").map(Number);
      if (Math.max(Math.abs(kx - pcx), Math.abs(ky - pcy)) > EVICT_CHEB) this.chunks.delete(key);
    }
  },

  // The realized cell at a WORLD tile (realizing its chunk on demand — used by passable/move; the
  // ring is normally already warm from realizeAround()).
  cellAt(wx: number, wy: number): BigCell {
    const cx = wx >> CHUNK_SHIFT, cy = wy >> CHUNK_SHIFT, k = this.chunkKey(cx, cy);
    let ch = this.chunks.get(k);
    if (!ch) { ch = this.realizeChunk(cx, cy); this.chunks.set(k, ch); }
    return ch[wy - (cy << CHUNK_SHIFT)][wx - (cx << CHUNK_SHIFT)];
  },

  // Big-map passability: read the realized cell. Uncharted + the field walls block.
  bigPassable(wx: number, wy: number): boolean {
    const cell = this.cellAt(wx, wy);
    return cell.kind !== "uncharted" && !FIELD_WALLS.has(cell.kind);
  },

  // The Area encounter-lean the player currently stands in (big-map) — drives pickAreaSet.
  bigLean(): string { return this.cellAt(this.wx, this.wy).lean; },

  // Big-map movement: walk in world coords, trigger the same POI flow off the realized cell's kind.
  bigMove(dx: number, dy: number): void {
    const nx = this.wx + dx, ny = this.wy + dy;
    if (!this.bigPassable(nx, ny)) return;
    this.wx = nx; this.wy = ny; this.step++;
    this.realizeAround();      // realize-on-move (never in draw)
    this.syncZoneFromWorld();  // POSITION-DERIVED state (zone/bands/music) — the no-loadZone crossing
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.cellAt(nx, ny);
    if (cell.kind === "miniboss" && !Game.miniBossDefeated) { this.startMiniBoss(); return; }
    if (cell.kind === "mouth") { this.descend(); return; }
    if (cell.kind === "village") { const h = this.zone().hub; if (h) Game.confirmEnterTownVisit(h); return; } // step onto the village → confirm, then into the zone's hub
    if (cell.kind === "chest") { this.openBigChest(nx, ny); return; }
    if (cell.kind === "lair") { this.enterBigLair(nx, ny); return; }
    if (POI_KINDS.has(cell.kind)) { this.touchBigPoi(nx, ny); return; } // shrine / camp / landmark / signpost
    // OPEN CONTINENT (no built zone under the player) is backlog land — no random encounters yet (G22).
    if (!this.bigZone) return;
    this.stepsToEncounter--;
    if (this.stepsToEncounter <= 0) { this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX); this.rollEncounter(); }
  },
  // A chest in big-map space: consume the realized cell + the authored blueprint cell, then reward.
  openBigChest(wx: number, wy: number): void {
    this.cellAt(wx, wy).kind = "path";
    const a = authoredAt(wx, wy); if (a && this.authoredGrids[a.zoneId]) this.authoredGrids[a.zoneId][a.ly][a.lx] = "path";
    // PERSIST the loot keyed by the chest's AUTHORED zone-local coords (the same coords enterBigMap re-applies
    // over the rebuilt authored grid), so a Continue can't re-spawn this looted big-map chest.
    if (a) this.openedChests[this.chestKey(a.zoneId, "ow", a.lx, a.ly)] = true;
    const floor = clamp(2 + Math.floor(this.progress() * 3), 1, 5);
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4);
    const it = rollItemAtRarity(floor, undefined, ilvl, undefined); // chests roll EQUALLY across all classes (Dara)
    Game.inventory.push(it); Telemetry.drop(it.rarity);
    Game.saveNow?.(); // persist the opened-chest record (mirrors the POI clear path)
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Treasure!</h2>${itemHtml(it)}<div class="row"><button class="btn gold" onclick="Overlay.hide()">Take it</button></div>`);
  },
  // The rare-monster den in big-map space (Hogger): consume it, then start the solo rare fight.
  enterBigLair(wx: number, wy: number): void {
    this.cellAt(wx, wy).kind = "grass";
    const a = authoredAt(wx, wy); if (a && this.authoredGrids[a.zoneId]) this.authoredGrids[a.zoneId][a.ly][a.lx] = "grass";
    const rares = RARE_MONSTERS.filter((r) => r.zones.includes(this.zoneIndex) && ENEMIES[r.key]);
    const key = rares.length ? rares[0].key : null;
    this.draw(); this.hint();
    if (!key) return;
    Overlay.show(`<h2 class="title-gold">A Lair!</h2><p class="small">Something big has been denning here — and it knows you've found it.</p><div class="row"><button class="btn gold" onclick="Overlay.hide();Field.fightLair('${key}')">Brace yourself</button></div>`);
  },

  // Walking onto a town POI tile opens its service (Game owns the run-state actions).
  townTouch(cell: string): void {
    const poi = POI_OF[cell];
    if (poi === "inn") Game.openInn();
    else if (poi === "shop") Game.openMerchant();
    else if (poi === "smith") Game.openSmith();
    else if (poi === "revive") Game.openRevive();
    else if (poi === "stash") Game.openStash();
    else if (poi === "exit") Game.confirmLeaveTown();
  },
  // Talk to an NPC: open the lightweight (non-blocking) dialogue box; advancing redraws so the
  // little "talking" marker over the NPC clears when the conversation ends.
  talkTo(npc: TownNPC): void {
    Dialogue.open(npc.name, npc.spr, npc.lines, () => { this.draw(); this.hint(); });
    this.draw(); this.hint();
  },
  rollEncounter(): void {
    const p = this.progress(), bands = this.zone().bands;
    let band = bands[0];
    for (const e of bands) { if (p >= e.at) band = e; }
    // the dungeon runs ~1-2 levels hotter than the overworld; in a MULTI-FLOOR dungeon the threat also
    // CLIMBS with depth — each floor below B1 adds a step so the dens run hotter the lower you go.
    const floorBump = this.inDungeon() ? this.dungeonFloor * 0.12 : 0;
    const depth = this.inDungeon() ? clamp(p + 0.25 + floorBump, 0, 1) : p;
    // ULTRA-RARE: a small chance the encounter is instead a lone treasure monster (Metal-Slime /
    // Warmech tier) — exceptional loot. Eligible by zone; solo fight, no champion.
    const rares = RARE_MONSTERS.filter((r) => r.zones.includes(this.zoneIndex) && ENEMIES[r.key]);
    if (rares.length && Math.random() < RARE_ENCOUNTER_CHANCE) {
      Battle.begin([pick(rares).key], this.envFor(p), false, false, depth, -1);
      return;
    }
    // AREA LEAN (ADR 0009 exemplar): in Area-native Greenvale, bias WHICH of this depth band's sets we
    // draw toward the Area's creature character — WITHOUT changing the band (depth still drives the
    // curve) or restatting anything. Every candidate set already belongs to this balanced depth band,
    // so we only shift the COMPOSITION you meet (Commons = slime/kobold; Orchard = kobold/bandit;
    // Fields = bandit/mage; Grove/Warren-Approach = the heavier mixes). Falls back to a plain pick.
    const set = this.pickAreaSet(band.sets).slice();
    // CHAMPION PACK: past the opening, an encounter can be led by a champion (lead = index 0)
    // with 1-2 extra minions. More common deeper in / in the dungeon.
    let champIdx = -1;
    const champChance = (this.inDungeon() ? 0.15 : 0.09) + p * 0.07;
    // No champion packs in the STARTER zone (Greenvale, index 0): a fresh L1-4 party can't absorb a
    // multi-affix pack leader on top of the elite rolls (telemetry v0.65 — early elite saturation
    // wiped the run). Champions enter from the second zone on.
    if (this.zoneIndex >= 1 && p > 0.12 && Math.random() < champChance) {
      champIdx = 0;
      const adds = set.slice(1); // a normal minion (not another champion), the champion is the threat
      if (set.length < 5) set.push(pick(adds.length ? adds : set));
    }
    Battle.begin(set, this.envFor(p), false, false, depth, champIdx);
  },
  // ── ADR 0009 exemplar: AREA-LEANED set choice. Pick a set from the (already depth-balanced) band,
  // biased toward the Area the player stands in. The lean is a per-Area "which Greenvale creatures fit
  // here" affinity over the EXISTING bestiary (no new/restatted enemies); we score each candidate set
  // by how many of its members the Area favours, then weight-pick so a matching set is MORE likely but
  // every band set stays possible (variety + the difficulty curve are preserved — same band, same pool).
  pickAreaSet(sets: string[][]): string[] {
    const lean = this.currentLean();
    if (!lean) return pick(sets);
    const fav = LEAN_FAVOUR[lean];
    if (!fav) return pick(sets);
    // weight = 1 baseline + the set's favour score (so a strongly-matching set is a few× likelier).
    let total = 0;
    const weights = sets.map((s) => { const w = 1 + s.reduce((n, k) => n + (fav[k] ?? 0), 0); total += w; return w; });
    let r = Math.random() * total;
    for (let i = 0; i < sets.length; i++) { r -= weights[i]; if (r <= 0) return sets[i]; }
    return sets[sets.length - 1];
  },
  // The hidden rare-monster lair (Greenvale: Hogger). Stepping in starts a solo rare fight; the
  // den is consumed so it's a one-time reward for the explorer (re-cleared each visit to the zone).
  enterLair(x: number, y: number): void {
    this.map[y][x] = "grass";
    const rares = RARE_MONSTERS.filter((r) => r.zones.includes(this.zoneIndex) && ENEMIES[r.key]);
    const key = rares.length ? rares[0].key : null; // first eligible rare = the den's named beast
    this.draw(); this.hint();
    if (!key) return;
    Overlay.show(`<h2 class="title-gold">A Lair!</h2><p class="small">Something big has been denning here — and it knows you've found it.</p><div class="row"><button class="btn gold" onclick="Overlay.hide();Field.fightLair('${key}')">Brace yourself</button></div>`);
  },
  fightLair(key: string): void { Battle.begin([key], this.envFor(this.progress()), false, false, this.progress(), -1); },

  // ── POINTS OF INTEREST (the INHABITED world) ──────────────────────────────────────────────────
  // Stepping onto a POI fires its effect by kind. shrine → full party rest (once, then spent); camp →
  // an OPTIONAL fight vs its pack, then cleared + a reward (the pack's own loot drops); landmark /
  // signpost → a non-blocking flavor/hint line. The cleared/spent state persists in `poisCleared` so a
  // shrine can't be re-used and a camp can't be re-fought this visit. Discrete path (px/py).
  touchPoi(x: number, y: number): void {
    const poi = this.poiAt(x, y);
    if (!poi) return;
    this.runPoi(this.zone().id, poi, () => { this.map[y][x] = "path"; });
  },
  // Big-map path: the POI lives in the current zone's authored layout; clear it in BOTH the realized
  // cell and the authored blueprint so it stays spent as chunks re-realize.
  touchBigPoi(wx: number, wy: number): void {
    const a = authoredAt(wx, wy);
    const L = (a && ZONES.find((z) => z.id === a.zoneId) ? ZONES.find((z) => z.id === a.zoneId)!.layout : this.zone().layout);
    const lp = a ? (L.pois ?? []).find((p) => p.x === a.lx && p.y === a.ly) : undefined;
    const poi = lp ? { ...lp } : this.poiAt(wx, wy);
    if (!poi) return;
    // The POI's OWN zone (its authored layout's zone) keys its cleared-state — not necessarily this.zone()
    // (which can lag a step behind on a zone seam). Falls back to the standing zone if authoredAt missed.
    const zid = a?.zoneId ?? this.bigZone ?? this.zone().id;
    this.runPoi(zid, poi, () => {
      this.cellAt(wx, wy).kind = "path";
      if (a && this.authoredGrids[a.zoneId]) this.authoredGrids[a.zoneId][a.ly][a.lx] = "path";
    });
  },
  // Shared POI effect. `consume` reverts the tile to walkable ground (for spent shrines / cleared camps).
  // The cleared/spent flag is keyed per-zone (poiKey) so it persists in the save without x,y collisions.
  runPoi(zoneId: string, poi: Poi, consume: () => void): void {
    const key = this.poiKey(zoneId, poi.x, poi.y);
    if (poi.kind === "shrine") {
      if (this.poisCleared[key]) { Overlay.show(`<h2 class="title-gold">${poi.name}</h2><p class="small">The shrine's light has guttered out — its blessing is spent.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Move on</button></div>`); return; }
      this.poisCleared[key] = true; consume(); Game.restParty(); this.draw(); this.hint(); Game.saveNow?.();
      Overlay.show(`<h2 class="title-gold">${poi.name}</h2><p class="small">You kneel at the wayside shrine. A warm light washes over the party — HP and MP fully restored.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Rise</button></div>`);
      return;
    }
    if (poi.kind === "camp") {
      if (this.poisCleared[key]) { Overlay.show(`<h2 class="title-gold">${poi.name}</h2><p class="small">Cold ashes and trampled ground — you've already cleared this camp.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Move on</button></div>`); return; }
      this.poisCleared[key] = true; consume(); this.draw(); this.hint();
      this.pendingPack = poi.pack && poi.pack.length ? poi.pack.slice()
        : this.pickAreaSet(this.zone().bands[Math.min(1, this.zone().bands.length - 1)].sets).slice();
      Overlay.show(`<h2 class="title-gold">${poi.name}</h2><p class="small">Tents, a smouldering fire, and unfriendly faces — they spot you. Their hoard is yours if you take it.</p><div class="row"><button class="btn gold" onclick="Overlay.hide();Field.fightCamp()">Raid the camp</button></div>`);
      return;
    }
    // landmark / signpost — a non-blocking flavor/hint line (the tile stays; no consume).
    const line = poi.note || (poi.kind === "signpost" ? "A weathered signpost points the way." : "An old landmark, heavy with the shire's memory.");
    Overlay.show(`<h2 class="title-gold">${poi.name}</h2><p class="small">${line}</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Move on</button></div>`);
  },
  // The camp encampment fight: a normal (non-boss) encounter vs the camp's themed pack (stored on
  // pendingPack by runPoi) — reuses the existing bestiary + Battle pipeline (no new stats), so its loot
  // drops are the reward. Difficulty flagged for balance-tuner (an optional, slightly-tougher pack:
  // champion-led via champIdx 0). Falls back to a safe pull if pendingPack was lost (e.g. a reload).
  fightCamp(): void {
    const pack = this.pendingPack && this.pendingPack.length ? this.pendingPack.slice() : ["gbandit", "gbandit"];
    this.pendingPack = null;
    const p = this.progress();
    // No champion-led camps in the STARTER zone (Greenvale, index 0) — same gate as the random-encounter
    // path (v0.65: a fresh L1-4 party can't absorb a multi-affix pack leader). Zone 0 camps are a plain
    // (still optional, still +0.1 tougher) pack; champion-led camps enter from the second zone on.
    const champIdx = this.zoneIndex >= 1 ? 0 : -1;
    Battle.begin(pack, this.envFor(p), false, false, clamp(p + 0.1, 0, 1), champIdx);
  },
  startBoss(): void { Battle.begin([this.zone().boss], this.envFor(1), true, this.isLastZone(), this.progress(), -1, this.zone().id); },
  startMiniBoss(): void {
    const p = this.progress(), z = this.zone();
    Battle.begin([z.mini, ...(z.miniAdds || [])], this.envFor(p), true, false, p, -1, z.id);
  },
  // MULTI-FLOOR: the IN-DUNGEON mini-boss (the floor lieutenant) — distinct from the overworld mouth
  // guard. Uses the zone's `dungeon.floorMini` key (placeholder = the Brigadier "brigand") at a depth
  // that climbs by floor. Tracks `pendingFloorMini` so battle.ts → onMiniDefeated marks THIS floor (not
  // the mouth) cleared. Falls back to the zone mini if no floorMini key is authored.
  startFloorMini(): void {
    const z = this.zone();
    const key = z.dungeon.floorMini || z.mini;
    this.pendingFloorMini = this.dungeonFloor;
    // depth runs hotter the deeper the floor (mirrors the dungeon depth bump), capped at 1.
    const fl = this.dungeonFloors().length;
    const depth = clamp(0.45 + this.dungeonFloor / Math.max(1, fl), 0, 1);
    Battle.begin([key], this.envFor(depth), true, false, depth, -1, z.id);
  },
  // The floor lieutenant fell: mark THIS floor's gate cleared (the gated stairs go live) and reveal it
  // on the map. Called from battle.ts via onMiniDefeated when pendingFloorMini was set.
  onFloorMiniDefeated(): void {
    const f = this.pendingFloorMini;
    this.pendingFloorMini = -1;
    if (f < 0) return;
    this.dungeonMiniCleared[f] = true;
    // reveal: turn the lieutenant tile to floor so the stairs behind it are now walkable-through.
    if (this.mode === "dungeon" && f === this.dungeonFloor) {
      const mb = this.curFloor().miniboss;
      if (mb && this.map[mb.y]) this.map[mb.y][mb.x] = "path";
      this.draw?.(); this.hint?.();
    }
  },
  openChest(x: number, y: number): void {
    this.map[y][x] = "path";
    // PERSIST the loot: key by context so a Continue (which regenerates the grid from layout data) carves
    // this cell as path instead of re-spawning the chest. Dungeon chests are floor-scoped; overworld chests
    // use the "ow" context. (poiKey-style per-zone disambiguation against x,y collisions across zones/floors.)
    const zid = this.zone().id;
    this.openedChests[this.chestKey(zid, this.mode === "dungeon" ? this.dungeonFloor : "ow", x, y)] = true;
    const floor = clamp(2 + Math.floor(this.progress() * 3), 1, 5); // deeper chests = better floor
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4); // and a higher item level
    const it = rollItemAtRarity(floor, undefined, ilvl, undefined); // chests roll EQUALLY across all classes (Dara)
    Game.inventory.push(it); Telemetry.drop(it.rarity);
    Game.saveNow?.(); // persist the opened-chest record (mirrors the POI clear path)
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Treasure!</h2>${itemHtml(it)}<div class="row"><button class="btn gold" onclick="Overlay.hide()">Take it</button></div>`);
  },
  hint(): void {
    const set = (sel: string, txt: string) => { const e = $(sel); if (e) e.textContent = txt; };
    const hintEl = $("#fieldHint");
    if (hintEl) hintEl.style.color = ""; // reset any prior danger tint to the gold default
    // The zone pill, lead by region name (larger) + a dimmer sub token (Area · suggested-lv · cleared).
    const setPill = (lead: string, sub: string) => {
      const e = $("#fieldZone");
      if (e) e.innerHTML = `<span class="zone-lead">${lead}</span>${sub ? `<span class="zone-sub">${sub}</span>` : ""}`;
    };
    const party = $("#fieldParty");
    if (party) party.innerHTML = Game.party.map((m) => `<span class="pm">${m.spr} ${m.name} <span class="small">L${m.level}</span></span>`).join("");
    set("#fieldGold", String(Game.gold));
    // EGRESS: instant return to town — only on the overworld of a zone that has a hub (not in town/dungeon/open wilds).
    const egress = $("#egressBtn");
    if (egress) (egress as HTMLElement).style.display =
      (!this.townMode && !this.inDungeon() && !!this.zone().hub && (!this.bigMapActive() || !!this.bigZone)) ? "" : "none";
    if (this.townMode) {
      set("#fieldHint", "Walk into a townsperson to talk; onto a building to use it; through the north gate to head out.");
      setPill(this.town?.name ?? "Town", "");
      return;
    }
    // OPEN CONTINENT (big map, between built cores): zone() is the STALE last-entered zone — don't reuse
    // its name/progress. Give an honest "open wilds" pill + a compass cue toward the nearest built zone.
    if (this.bigMapActive() && !this.bigZone) {
      const area = regionAt(OVERWORLD_ID, this.wx, this.wy).area?.name;
      setPill("Open Aurelion", area ? `${area} · wilds` : "wilds");
      const near = this.nearestBuiltZone();
      set("#fieldHint", near ? `${near.name} lies ${near.dir}.` : "Open wilds — no roads here. Strike out toward a settled land.");
      return;
    }
    const p = this.progress(), z = this.zone(), name = z.name;
    const miniNm = ENEMIES[z.mini].name, bossNm = ENEMIES[z.boss].name;
    let msg: string;
    if (this.inDungeon()) {
      // MULTI-FLOOR cues: name the floor lieutenant / the stairs down on intermediate floors; the boss
      // on the finale floor. Single-floor dungeons keep the original "deep in / boss ahead" read.
      const multi = this.dungeonFloors().length > 1;
      if (multi && !this.isLastFloor()) {
        if (this.curFloor().miniboss && !this.stairsOpen()) msg = `A bandit lieutenant blocks the stairs down — cut him down to descend.`;
        else msg = `Find the stairs down — ${z.dungeon.name} runs deeper still.`;
      } else {
        msg = p > 0.88 ? `The ${bossNm} lurks at the heart of ${z.dungeon.name}.` : `Deep in ${z.dungeon.name} — stronger foes, richer loot.`;
      }
    }
    else if (!Game.miniBossDefeated && p >= 0.38) msg = `A ${miniNm} guards the mouth of ${z.dungeon.name}.`;
    else if (this.usesNewModel() && Game.miniBossDefeated && p >= 0.7) msg = `Step onto the mouth of ${z.dungeon.name} to descend.`;
    else if (p < 0.12) msg = `Head east through ${name}. Search off the path for treasure.`;
    else if (p > 0.88) msg = `${z.dungeon.name} lies just ahead.`;
    else msg = `${Math.round(p * 100)}% through ${name}. Keep moving east.`;
    // RELATIVE-DANGER WARNING (overworld only): if the party is well below the zone's suggested level,
    // override the hint with a clear in-palette danger state so a wanderer isn't blindsided.
    const sug = this.suggestedLevel(z);
    if (!this.inDungeon()) {
      const gap = sug - this.partyAvgLevel();
      if (gap >= 3 && hintEl) { msg = `⚠ Dangerous — foes here far outmatch you (Lv ${sug}+).`; hintEl.style.color = "#ff5a5a"; }
      else if (gap >= 1 && hintEl) { msg = `${msg} Foes here are tougher than you (Lv ${sug}+).`; hintEl.style.color = "var(--rare)"; }
    }
    set("#fieldHint", msg);
    // On the seamless map, name the Area you're standing in (Goldmeadow's Open Wheat, the Creek Line, …)
    // so crossing its sub-spaces reads as moving through real places, not one flat zone. Cheap — already
    // sampled for music on the per-step path. Falls back to the zone name off the big map / in a dungeon.
    const area = this.bigMapActive() ? regionAt(OVERWORLD_ID, this.wx, this.wy).area?.name : undefined;
    const lead = this.inDungeon() ? z.dungeon.name : name;
    const floorTag = this.inDungeon() && this.dungeonFloors().length > 1 ? `B${this.dungeonFloor + 1} · ` : "";
    const sub = this.inDungeon()
      ? `${floorTag}${Game.encountersWon} cleared`
      : `${area ? area + " · " : ""}Lv ${sug}+ · ${Game.encountersWon} cleared`;
    setPill(lead, sub);
  },
  // The nearest BUILT zone to the player's world position (big-map open continent) + a compass word for
  // it — drives the honest "X lies east" cue. Uses each placed zone's authored-grid origin as its anchor.
  nearestBuiltZone(): { name: string; dir: string } | undefined {
    let best: { name: string; dir: string } | undefined, bd = Infinity;
    for (const id of this.bigBuiltZoneIds()) {
      const pl = placementOf(id); if (!pl) continue;
      const z = ZONES.find((zz) => zz.id === id); if (!z) continue;
      const tx = pl.wx + z.layout.spawn.x, ty = pl.wy + z.layout.spawn.y;
      const dx = tx - this.wx, dy = ty - this.wy, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = { name: z.name, dir: this.compass(dx, dy) }; }
    }
    return best;
  },
  // An 8-way compass word for a (dx,dy) world-tile vector (y grows south).
  compass(dx: number, dy: number): string {
    const ax = Math.abs(dx), ay = Math.abs(dy);
    const ns = dy < 0 ? "north" : "south", ew = dx < 0 ? "west" : "east";
    if (ax > ay * 2) return ew;
    if (ay > ax * 2) return ns;
    return ns + ew;
  },
  // One town tile: a ground sprite (cobble / grass; wall has none) under a building/decoration
  // object with a gold label. Everything falls back to emoji/flat-colour until the tileset is
  // sliced in (see asset-gaps.md). Decorations (tree/well/house/flower) sit on grass so removing
  // a kind never strands the player.
  drawTownCell(c: CanvasRenderingContext2D, T: Record<string, HTMLImageElement>, cell: string, mx: number, my: number, sx: number, sy: number, t: number): void {
    const isWall = cell === "twall";
    const marsh = this.town?.theme === "marsh"; // grim outpost: planks over bog, not cobble + grass
    const city = this.town?.theme === "city";   // grand capital: avenues + cobble, a river crossed by bridges
    // ground under the tile. Marsh: bog under decorations/standing-bog, plank under streets/buildings.
    // Shire: grass under decorations, cobble under streets & buildings. City: cobble under most, an
    // avenue stripe under avenue/bridge, the river its own water; decorations sit on grass verges.
    const onSoft = cell === "town-grass" || cell === "town-flower" || cell === "t-tree" || cell === "t-well" ||
      cell === "t-house" || cell === "town-bog" || cell === "t-stilt" || cell === "t-deadtree" || cell === "t-lantern" ||
      cell === "t-statue"; // statue stands on a grassy/plaza patch
    // city ground choice (only consulted when `city`):
    const cityGround =
      cell === "town-river" ? "town-river" :
      cell === "town-bridge" ? "town-bridge" :
      cell === "town-dock" ? "town-dock" :
      cell === "town-avenue" ? "town-avenue" :
      onSoft ? "town-grass" : "town-cobble";
    // Walls get a themed ground UNDER them (bog/grass/cobble) so the painted palisade sprite sits on
    // the same floor as the town interior — no bare dark rect ringing the map.
    let g = isWall ? (city ? "town-cobble" : marsh ? "town-bog" : "town-grass") : city ? cityGround : marsh ? (onSoft ? "town-bog" : "town-plank") : (onSoft ? "town-grass" : "town-cobble");
    if (g === "town-cobble" && (mx * 7 + my * 13) % 4 === 0 && T["town-cobble2"]) g = "town-cobble2";
    const gimg = T[g];
    if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1);
    else {
      // flat-colour fallback. Marsh reads cold/dark; shire reads warm; city is paved stone + a bright river.
      let fill: string;
      if (isWall) fill = marsh ? "#1a2018" : city ? "#2a241a" : "#241f17";
      else if (city) fill = g === "town-river" ? "#2f5b7a" : g === "town-bridge" ? "#7a6a48" : g === "town-dock" ? "#5a4a30" : g === "town-avenue" ? "#8a7a54" : onSoft ? "#3f6b2c" : "#6b5d44";
      else fill = marsh ? (onSoft ? "#23303a" : "#4a4030") : (onSoft ? "#3f6b2c" : "#6b5d44");
      c.fillStyle = fill;
      c.fillRect(sx, sy, t, t);
      if (g === "town-river") { c.fillStyle = "rgba(255,255,255,.06)"; if ((mx + my * 2 + (Date.now() / 600 | 0)) % 5 === 0) c.fillRect(sx, sy + t * 0.4, t, Math.max(1, t * 0.08)); } // faint ripple lines
      else if (!isWall && (mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.07)"; c.fillRect(sx, sy, t, t); }
    }
    // [sprite key, emoji fallback, scale (×tile), label]. Empty label = no caption.
    const POI: Record<string, [string, string, number, string]> = {
      "t-inn": ["town-inn", "🏠", 1.6, "Inn"], "t-shop": ["town-shop", "🛒", 1.6, "Market"],
      "t-smith": ["town-smith", "🔨", 1.6, "Smith"], "t-revive": ["town-revive", "🔮", 1.6, "Shrine"],
      "t-stash": ["town-stash", "🏦", 1.6, "Vault"], // placeholder art -> 🏦 emoji until a real building is sliced
      "t-exit": ["town-exit", "🚪", 1.1, marsh ? "→ Marsh" : "↑ Leave"],
      "t-fountain": ["town-fountain", "⛲", 1.2, ""], "t-well": ["town-well", "🪣", 1.0, ""],
      "t-tree": ["town-tree", "🌳", 1.3, ""], "t-house": ["town-house", "🏡", 1.5, ""],
      "town-flower": ["town-flower", "🌷", 0.7, ""],
      // marsh-outpost decorations / buildings
      "t-stilt": ["town-stilt", "🛖", 1.5, ""], "t-deadtree": ["town-deadtree", "🌲", 1.3, ""],
      "t-lantern": ["town-lantern", "🏮", 1.0, ""],
      // city (Riverhearth) buildings / decorations — flavor only (impassable), no service
      "t-grand": ["town-grand", "🏛️", 1.7, ""], "t-townhouse": ["town-townhouse", "🏘️", 1.5, ""],
      "t-stall": ["town-stall", "⛺", 1.3, ""], "t-statue": ["town-statue", "🗽", 1.6, ""],
    };
    // City service buildings re-label to fit a capital (Market → Exchange; gate reads → the road on).
    if (city) {
      if (cell === "t-shop") { POI["t-shop"] = ["town-shop", "🛒", 1.6, "Exchange"]; }
      if (cell === "t-exit") { POI["t-exit"] = ["town-exit", "🚪", 1.1, "↑ North Road"]; }
    }
    const poi = POI[cell];
    if (poi) {
      const img = T[poi[0]];
      if (img) { const h = t * poi[2], w = h * (img.width / img.height); c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.95 - h, w, h); }
      else { c.font = `${t * (poi[2] < 1 ? 0.5 : 0.74)}px serif`; c.fillText(poi[1], sx + t / 2, sy + t / 2); }
      if (poi[3]) { c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)"; const ly = sy + t * 1.02; c.strokeText(poi[3], sx + t / 2, ly); c.fillText(poi[3], sx + t / 2, ly); }
    } else if (isWall) {
      // The perimeter is a PALISADE, not a row of emoji. Marsh = dead-timber stakes (town-deadtree),
      // shire = a hedge/treeline (town-tree); both are already painted. City rings itself in stone —
      // a layered stone-block fill (no art needed) reads as a curtain wall. Sprites are bottom-anchored
      // and slightly overscaled so adjacent cells overlap into a continuous wall.
      const wkey = marsh ? "town-deadtree" : city ? "" : "town-tree";
      const wimg = wkey ? T[wkey] : undefined;
      if (wimg) { const h = t * 1.5, w = h * (wimg.width / wimg.height); c.drawImage(wimg, sx + t / 2 - w / 2, sy + t * 1.04 - h, w, h); }
      else if (city) {
        // stone curtain wall: a base block + a lighter capstone band + a mortar seam
        c.fillStyle = "#4a4332"; c.fillRect(sx, sy, t, t);
        c.fillStyle = "#5c5440"; c.fillRect(sx, sy, t, Math.max(2, t * 0.22));
        c.fillStyle = "rgba(0,0,0,.32)"; c.fillRect(sx, sy + t * 0.22, t, Math.max(1, t * 0.06));
        if ((mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.14)"; c.fillRect(sx + t / 2, sy + t * 0.28, Math.max(1, t * 0.06), t * 0.72); }
      } else { c.font = `${t * 0.7}px serif`; c.fillStyle = "#3a5a2a"; c.fillText("🌳", sx + t / 2, sy + t / 2); }
    }
  },
  // ── BIG-MAP biome → ground/object dressing (ADR 0009 / Stage 2B) ─────────────────────────────
  // A zone-AGNOSTIC dressing table keyed by a cell's cached BIOME (Area→identity.biome), replacing the
  // discrete path's Greenvale-special-cased switch. For a realized cell kind it returns the ground
  // sprite key (+a *-ground2 alternate by the cached variant) and, for tree/bush/rock, the object skin.
  // Falls back to the base shire skin for an unknown biome. Pure mapping — no regionAt on the frame path.
  bigGround(biome: string, kind: string, variant: number): { ground: string; flat: string } {
    const T = this.tiles;
    const isObj = kind === "chest" || kind === "miniboss" || kind === "boss" || kind === "lair" || kind === "mouth" || kind === "village" || POI_KINDS.has(kind);
    const alt = (base: string) => (variant && T[base + "2"] ? base + "2" : base);
    // VARIED TERRAIN (2026-06-21): the new geography kinds render the same in any biome (placeholder
    // in-palette fills until art lands). cliff = grey rock, river = blue water, bridge = plank-brown,
    // ford = pale shallow crossing. POI tiles sit on the biome's ground (their object draws on top).
    if (kind === "river") return { ground: T.water ? "water" : "river", flat: "#2f5b7a" };
    if (kind === "cliff") return { ground: "cliff", flat: "#2b2f37" }; // a cliff is a WALL — DARK so it recedes (was #3f4450, which read as the palest = most "walkable"-looking tile, exactly backwards)
    if (kind === "bridge") return { ground: "bridge", flat: "#7a6242" };
    if (kind === "ford") return { ground: "ford", flat: "#86b0c4" };
    // [base-ground, ground2-capable?, path key, scatter-bush key, scatter-rock key, flat-fill]
    if (biome === "forest") {
      const gm: Record<string, string> = { grass: "grove-ground", grass2: "grove-ground2", path: "grove-path", bush: "fern", rock: "mushroom", tree: "grove-ground", water: "water" };
      const g = isObj ? "grove-ground" : (gm[kind] || "grove-ground");
      // Placeholder flats (no grove art yet) tuned for LEGIBILITY: a lighter TRAIL for the walkable path,
      // mid forest-green ground, DARK tree-walls + water so "where I can walk" reads (was one flat #2e4a26
      // for path/ground/wall alike). Walkable = lighter/warmer; impassable = dark.
      const f: Record<string, string> = { path: "#6f6a3e", grass: "#36522c", grass2: "#3a572f", bush: "#335028", rock: "#3c5230", tree: "#13230d", water: "#223a3e" };
      return { ground: g === "grove-ground" ? alt("grove-ground") : g, flat: f[kind] ?? "#36522c" };
    }
    if (biome === "mire" || biome === "water" || biome === "ruin") {
      const gm: Record<string, string> = { grass: "mire-ground", grass2: "mire-ground2", path: "mire-path", bush: "reed", rock: "bog", tree: "mire-ground", water: "water" };
      const g = isObj ? "mire-ground" : (gm[kind] || "mire-ground");
      // Placeholder flats (no marsh art yet) tuned for LEGIBILITY: the boardwalk causeway (path) is a PALE
      // raised plank — the brightest LAND tile, clearly the road — open ground a mid olive, while tree-WALLS
      // + standing water go DARK. Fixes the inversion Dara hit: walkable path & tree-walls were BOTH the
      // same dark #3a4030 (vanished into the bog), and the palest tile was the impassable cliff.
      const f: Record<string, string> = { path: "#8a7c52", grass: "#46583a", grass2: "#4b5d3d", bush: "#3f5236", rock: "#445036", tree: "#19231a", water: "#222e38" };
      return { ground: g === "mire-ground" ? alt("mire-ground") : g, flat: f[kind] ?? "#46583a" };
    }
    if (biome === "orchard") {
      const gm: Record<string, string> = { grass: "orchard-ground", grass2: "orchard-ground2", path: "path", tree: "orchard-ground" };
      const g = isObj ? "orchard-ground" : (gm[kind] || "orchard-ground");
      return { ground: g === "orchard-ground" ? alt("orchard-ground") : g, flat: "#557a30" };
    }
    if (biome === "meadow" || biome === "creek") {
      const gm: Record<string, string> = { grass: "meadow-ground", grass2: "meadow-ground2", path: "path", bush: "wheat", tree: "meadow-ground" };
      const g = isObj ? "meadow-ground" : (gm[kind] || "meadow-ground");
      // a creek (Goldmeadow's bank) reads a hair cooler/greyer than open wheat.
      return { ground: g === "meadow-ground" ? alt("meadow-ground") : g, flat: biome === "creek" ? "#5f7a4a" : "#7a8a36" };
    }
    // AURELION-COMPLETE biome fills (no bespoke art yet — distinct in-palette flat fills give wayfinding).
    // COLD highlands (Frostpeak): snow/ice/stone → pale cold blue-greys, water stays the cold pool blue.
    if (biome === "snow" || biome === "ice" || biome === "stone") {
      const flat = kind === "water" ? "#5a7896" : biome === "snow" ? "#cfe0ec" : biome === "ice" ? "#aebfd0" : "#6a7080";
      const g = isObj ? "grass" : kind;
      return { ground: g === "grass" ? alt("grass") : g, flat };
    }
    // COAST / shore (Storm Coast, Sunbridge): sand + teal sea — beaches sandy, water teal, rock dark grey.
    if (biome === "coast" || biome === "beach" || biome === "harbor" || biome === "rock") {
      const flat = kind === "water" ? "#2f5b7a" : biome === "rock" ? "#5a6068" : "#cdb98a";
      const g = isObj ? "grass" : kind;
      return { ground: g === "grass" ? alt("grass") : g, flat };
    }
    // RIVER trade-roads (Riverhearth): sand banks + teal river; road/town are stone tan.
    if (biome === "riverside" || biome === "road" || biome === "town") {
      const flat = kind === "water" ? "#2f5b7a" : biome === "riverside" ? "#cdb98a" : "#8a7a54";
      const g = isObj ? "grass" : kind;
      return { ground: g === "grass" ? alt("grass") : g, flat };
    }
    // SAGE hills / highland (Whisper Hills, Dawnfall highland): muted sage green.
    if (biome === "hills" || biome === "highland") {
      const g = isObj ? "grass" : kind;
      return { ground: g === "grass" ? alt("grass") : g, flat: "#6f8a5a" };
    }
    // plains / unknown = base shire grass + road + hedge-tree.
    const g = isObj ? "grass" : kind;
    return { ground: g === "grass" ? alt("grass") : g, flat: "#4a7a32" };
  },

  // The dungeon/cave MOUTH gets a gold caption (like town POIs) so the east-spine POI reads as a named
  // destination, not a bare door. Spine dungeons read `↦ <name>`; OPTIONAL side zones read
  // `<name> (optional)`. Name comes from the zone the player currently stands in (this.zone()).
  // A dungeon entrance is ONE tile in a wide-open zone — easy to walk right past (Dara couldn't find the
  // Drowned Vault). So make it SHINE: a gold halo + ring around the tile + a dark-pill label you can read
  // from across the map. `guarded` (an unbeaten mini-boss gate) reads "⚔ fight to enter"; open reads "▶".
  drawMouthLabel(c: CanvasRenderingContext2D, sx: number, sy: number, t: number, guarded = false): void {
    const z = this.zone();
    const optional = OPTIONAL_ZONES.has(z.id);
    const cx = sx + t / 2, cy = sy + t / 2;
    c.save();
    const halo = c.createRadialGradient(cx, cy, t * 0.1, cx, cy, t * 1.15);
    halo.addColorStop(0, "rgba(244,210,122,.5)"); halo.addColorStop(0.55, "rgba(244,185,66,.22)"); halo.addColorStop(1, "rgba(244,185,66,0)");
    c.fillStyle = halo; c.beginPath(); c.arc(cx, cy, t * 1.15, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "rgba(244,210,122,.95)"; c.lineWidth = Math.max(2, t * 0.07);
    c.beginPath(); c.arc(cx, cy, t * 0.45, 0, Math.PI * 2); c.stroke();
    const txt = `${guarded ? "⚔ " : "▶ "}${z.dungeon.name}${optional ? " (optional)" : ""}`;
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `bold ${Math.max(10, t * 0.3)}px system-ui`;
    const ly = sy + t * 1.2, tw = c.measureText(txt).width, ph = Math.max(14, t * 0.42);
    c.fillStyle = "rgba(8,8,16,.85)"; c.fillRect(cx - tw / 2 - 6, ly - ph / 2, tw + 12, ph);
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.9)"; c.fillStyle = "rgba(244,210,122,.98)";
    c.strokeText(txt, cx, ly); c.fillText(txt, cx, ly);
    c.restore();
  },

  // POI / encampment tile (the INHABITED world): a kind emoji (placeholder until art lands) + a gold
  // caption with the POI's name — mirrors the town-POI + mouth caption pattern. The name is resolved by
  // coord (discrete: this.pois; big-map: the authored layout via authoredAt). ART FLAG: shrine/camp/
  // landmark/signpost sprites are placeholders (emoji) — see the hand-back.
  poiEmoji(kind: string): string {
    return kind === "shrine" ? "⛩️" : kind === "camp" ? "⛺" : kind === "signpost" ? "🪧" : "🗿";
  },
  poiNameAt(wx: number, wy: number, big: boolean): string {
    if (big) { const a = authoredAt(wx, wy); if (a) { const z = ZONES.find((zz) => zz.id === a.zoneId); const p = z?.layout.pois?.find((q) => q.x === a.lx && q.y === a.ly); if (p) return p.name; } }
    return this.poiAt(wx, wy)?.name ?? "";
  },
  drawPoiCell(c: CanvasRenderingContext2D, T: Record<string, HTMLImageElement>, kind: string, wx: number, wy: number, sx: number, sy: number, t: number, big = true): void {
    const img = T[kind]; // placeholder sprite slot (none yet → emoji)
    if (img) { const h = t * 1.4, w = h * (img.width / img.height); c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.95 - h, w, h); }
    else { c.font = `${t * 0.7}px serif`; c.fillText(this.poiEmoji(kind), sx + t / 2, sy + t / 2); }
    const name = this.poiNameAt(wx, wy, big);
    if (name) {
      c.save();
      c.textAlign = "center"; c.textBaseline = "middle";
      c.font = `bold ${Math.max(9, t * 0.24)}px system-ui`;
      c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
      const ly = sy + t * 1.02;
      c.strokeText(name, sx + t / 2, ly); c.fillText(name, sx + t / 2, ly);
      c.restore();
    }
  },

  // MULTI-FLOOR stairs (placeholder until art-integrator slices warren/grove/vault-stairsdown/up): draw
  // the sprite if present, else a clear ⬇/⬆ glyph + a small gold caption so the descent/climb reads.
  // `up` = an up-stair (climb / out); else a down-stair (descend). ART FLAG — see the hand-back.
  drawStairs(c: CanvasRenderingContext2D, obj: (img: HTMLImageElement | undefined, emoji: string, sc?: number) => void, img: HTMLImageElement | undefined, up: boolean, sx: number, sy: number, t: number): void {
    obj(img, up ? "⬆️" : "⬇️", 0.9);
    c.save();
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `bold ${Math.max(8, t * 0.22)}px system-ui`;
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
    const txt = up ? "Up" : "Down", ly = sy + t * 1.0;
    c.strokeText(txt, sx + t / 2, ly); c.fillText(txt, sx + t / 2, ly);
    c.restore();
  },

  // DUNGEON TREASURE marker (Dara QA 2026-06-21 — chests had "no icons" because the warren-chest tile
  // is a placeholder, so nothing read as loot). Overlay a bright glint + a 💰 glyph + a small gold
  // "loot" caption ON TOP of whatever the chest tile drew, so a chest is unmistakable on every floor
  // regardless of the placeholder art. (Also used for the rare-lair if a dungeon ever places one.)
  drawTreasureMark(c: CanvasRenderingContext2D, sx: number, sy: number, t: number): void {
    c.save();
    c.textAlign = "center"; c.textBaseline = "middle";
    // a warm glint disc behind the glyph so it pops off the dim floor even with no chest sprite
    c.beginPath(); c.arc(sx + t / 2, sy + t * 0.46, t * 0.34, 0, Math.PI * 2);
    c.fillStyle = "rgba(244,210,122,.22)"; c.fill();
    c.font = `${t * 0.6}px serif`;
    c.fillText("💰", sx + t / 2, sy + t * 0.46);
    c.font = `bold ${Math.max(8, t * 0.22)}px system-ui`;
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
    const ly = sy + t * 1.0;
    c.strokeText("loot", sx + t / 2, ly); c.fillText("loot", sx + t / 2, ly);
    c.restore();
  },

  // The DUNGEON BOSS FINALE marker (Dara QA 2026-06-21 — the Kingpin was unfindable because the boss
  // tile rendered as the cave-ENTRANCE sprite, reading like a doorway). Draw a DISTINCT, unmistakable
  // throne/boss glyph (the zone boss's own emoji, 👑 the Kingpin) on a gold glow + a bold gold "BOSS"
  // caption beneath (mirrors the mouth/village caption pattern), so the player instantly reads the
  // finale on the warren floor. Once cleared it flips to a planted flag. ART FLAG: a bespoke
  // throne/boss-lair sprite per dungeon set would replace the emoji — see the hand-back.
  drawDungeonBoss(c: CanvasRenderingContext2D, sx: number, sy: number, t: number): void {
    c.save();
    c.textAlign = "center"; c.textBaseline = "middle";
    // a warm glow disc so the throne pops off the dim warren floor
    if (!Game.bossDefeated) {
      c.beginPath(); c.arc(sx + t / 2, sy + t / 2, t * 0.46, 0, Math.PI * 2);
      c.fillStyle = "rgba(244,210,122,.18)"; c.fill();
      c.lineWidth = Math.max(2, t * 0.05); c.strokeStyle = "rgba(244,210,122,.6)"; c.stroke();
    }
    c.font = `${t * 0.8}px serif`;
    c.fillText(Game.bossDefeated ? "🏴" : "👑", sx + t / 2, sy + t * 0.46);
    const txt = Game.bossDefeated ? "CLEARED" : "BOSS", ly = sy + t * 1.04;
    c.font = `bold ${Math.max(9, t * 0.27)}px system-ui`;
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = Game.bossDefeated ? "rgba(170,170,170,.9)" : "rgba(244,210,122,.98)";
    c.strokeText(txt, sx + t / 2, ly); c.fillText(txt, sx + t / 2, ly);
    c.restore();
  },

  // BIG-MAP draw: iterate the WORLD-TILE viewport from the chunk cache (never calling regionAt).
  // Camera centers on the player's world tile and is clamped to the world extent (placement keeps
  // the player far from the 0/960 edges, so the clamp is effectively a no-op here). Dressing is read
  // from each cell's cached biome (+ seam dither), so Area seams visibly dither as you roam.
  drawBig(): void {
    const c = this.ctx, t = this.tile, T = this.tiles;
    if (!c || !this.canvas) return;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const viewW = Math.ceil(this.canvas.width / t), viewH = Math.ceil(this.canvas.height / t);
    const camx = this.wx - Math.floor(viewW / 2), camy = this.wy - Math.floor(viewH / 2);
    c.textAlign = "center"; c.textBaseline = "middle";
    for (let y = 0; y <= viewH; y++) for (let x = 0; x <= viewW; x++) {
      const wx = camx + x, wy = camy + y, sx = x * t, sy = y * t;
      const cell = this.cellAt(wx, wy);
      if (cell.kind === "uncharted") { c.fillStyle = "#10180e"; c.fillRect(sx, sy, t, t); continue; } // soft edge
      // seam dither: a hair of the cell is rendered in the neighbouring Area's biome (the cached choice).
      const biome = cell.dither ?? cell.biome;
      const { ground, flat } = this.bigGround(biome, cell.kind, cell.variant);
      const gimg = T[ground];
      if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1);
      else {
        c.fillStyle = flat; c.fillRect(sx, sy, t, t);
        if ((wx + wy) % 2) { c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(sx, sy, t, t); }
        if (biome === "forest") { c.fillStyle = "rgba(8,20,8,.34)"; c.fillRect(sx, sy, t, t); }
      }
      // object / scatter sprites (emoji fallback) — biome-skinned.
      c.font = `${t * 0.82}px serif`;
      const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
        if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
        else c.fillText(emoji, sx + t / 2, sy + t / 2);
      };
      const dset = DUNGEON_SETS[this.zoneIndex] || DUNGEON_SETS[0];
      if (cell.kind === "chest") obj(T.chest, "📦", 0.8);
      else if (cell.kind === "lair") obj(T.lair, "🕳️", 0.85);
      else if (cell.kind === "mouth") { obj(T[`${dset}-entrance`], "🚪", 0.95); this.drawMouthLabel(c, sx, sy, t); }
      else if (cell.kind === "village") {
        obj(T["town-inn"], "🏘️", 0.95);
        const zid = authoredAt(wx, wy)?.zoneId, hub = zid ? ZONES.find((z) => z.id === zid)?.hub : undefined;
        const nm = hub ? settlement(hub).name : "Town";
        c.save(); c.textAlign = "center"; c.textBaseline = "middle";
        c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
        const ly = sy + t * 1.04; c.strokeText(nm, sx + t / 2, ly); c.fillText(nm, sx + t / 2, ly); c.restore();
      }
      else if (cell.kind === "miniboss") { obj(undefined, "🪖", 0.85); this.drawMouthLabel(c, sx, sy, t, true); }
      else if (POI_KINDS.has(cell.kind)) this.drawPoiCell(c, T, cell.kind, wx, wy, sx, sy, t); // captioned landmark
      else if (cell.kind === "cliff" && !T.cliff) c.fillText("⛰️", sx + t / 2, sy + t / 2);
      else if (cell.kind === "river" && !T.water) c.fillText("🌊", sx + t / 2, sy + t / 2);
      else if (cell.kind === "tree") {
        if (biome === "forest") obj(T.oldtree, "🌲", 1.0);
        else if (biome === "orchard") obj(T["orchard-tree"], "🌳", 1.0);
        else if (biome === "mire" || biome === "ruin") obj(T.deadtree, "🌫️", 0.95);
        else if (biome === "snow" || biome === "ice") c.fillText("🌲", sx + t / 2, sy + t / 2);      // snow-laden conifers
        else if (biome === "stone" || biome === "rock") c.fillText("⛰️", sx + t / 2, sy + t / 2);    // crags
        else if (biome === "coast" || biome === "beach" || biome === "harbor") c.fillText("🌴", sx + t / 2, sy + t / 2);
        else if (!gimg) c.fillText("🌲", sx + t / 2, sy + t / 2);
      }
      else if (cell.kind === "water" && !gimg) c.fillText("🌊", sx + t / 2, sy + t / 2);
      else if (cell.kind === "bush") {
        if (biome === "forest") obj(T.fern, "🌿", 0.85);
        else if (biome === "meadow" || biome === "creek") obj(T.wheat, "🌾", 0.85);
        else if (biome === "snow" || biome === "ice") c.fillText("❄️", sx + t / 2, sy + t / 2);
        else if (biome === "coast" || biome === "beach" || biome === "harbor") c.fillText("🐚", sx + t / 2, sy + t / 2);
        else if (biome === "hills" || biome === "highland") c.fillText("🌾", sx + t / 2, sy + t / 2);
        else if (!gimg) c.fillText("🌿", sx + t / 2, sy + t / 2);
      }
      else if (cell.kind === "rock") {
        if (biome === "forest") obj(T.mushroom, "🍄", 0.8);
        else if (biome === "snow" || biome === "ice" || biome === "stone" || biome === "rock") c.fillText("🪨", sx + t / 2, sy + t / 2);
        else if (biome === "coast" || biome === "beach" || biome === "harbor") c.fillText("⛰️", sx + t / 2, sy + t / 2);
      }
    }
    // player marker (same as discrete): feet shadow + ring + tall walker (emoji fallback).
    const cx = (this.wx - camx) * t + t / 2, cy = (this.wy - camy) * t + t / 2;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    const pimg = this.playerImg(T);
    if (pimg) {
      const ph = t * 1.55, pw = ph * (pimg.width / pimg.height);
      const py = Math.max(2, cy + t * 0.46 - ph);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(pimg, cx - pw / 2, py, pw, ph); c.shadowBlur = 0;
    } else { c.font = `${t * 0.7}px serif`; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy); }
    c.restore();
  },

  // The player sprite for the current frame: the directional walk-cycle frame (player-<face>-<n>),
  // cycling neutral→step→neutral→step as `step` advances; falls back to the static sprite if a frame
  // is missing (so a partial art load never blanks the hero).
  playerImg(T: Record<string, HTMLImageElement>): HTMLImageElement | undefined {
    const WALK = [1, 2, 1, 0]; // frame index per step; 1 = neutral mid-stance (rest pose)
    const f = WALK[this.step % WALK.length];
    return T[`player-${this.face}-${f}`] || T.player;
  },

  draw(): void {
    if (this.bigMapActive()) { this.drawBig(); return; } // windowed big-map = its own world-coord render
    const c = this.ctx, t = this.tile;
    if (!c || !this.canvas) return;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const viewW = Math.ceil(this.canvas.width / t), viewH = Math.ceil(this.canvas.height / t);
    const camx = clamp(this.px - Math.floor(viewW / 2), 0, Math.max(0, this.W - viewW));
    const camy = clamp(this.py - Math.floor(viewH / 2), 0, Math.max(0, this.H - viewH));
    const colors: Record<string, string> = { grass: "#4a7a32", grass2: "#52823a", path: "#7a6a3a", tree: "#1f3a1c", bush: "#3a6a2a", rock: "#5a5a52", boss: "#6a1020", chest: "#6a5a2a", miniboss: "#5a1226", river: "#2f5b7a", cliff: "#3f4450", bridge: "#7a6242", ford: "#86b0c4", shrine: "#4a7a32", camp: "#4a7a32", landmark: "#4a7a32", signpost: "#4a7a32" };
    const T = this.tiles;
    c.textAlign = "center"; c.textBaseline = "middle";
    for (let y = 0; y < viewH + 1; y++)
      for (let x = 0; x < viewW + 1; x++) {
        const mx = camx + x, my = camy + y;
        if (mx >= this.W || my >= this.H) continue;
        const cell = this.map[my][mx];
        const sx = (mx - camx) * t, sy = (my - camy) * t;
        if (this.townMode) { this.drawTownCell(c, T, cell, mx, my, sx, sy, t); continue; }
        // dungeon dressing: NEW model = the whole grid is the dungeon (mode); LEGACY = east of the gate.
        const inDun = this.usesNewModel() ? this.mode === "dungeon" : mx > this.gate.x;
        const dset = DUNGEON_SETS[this.zoneIndex] || DUNGEON_SETS[0];
        const mire = !inDun && this.isMire(); // grim overworld dressing (Duskmarsh)
        const grove = !inDun && this.isForest(); // dense old-growth dressing (Silverwood)
        // ADR 0009 exemplar: in AREA-NATIVE Greenvale the overworld ground is dressed PER-AREA, so the
        // five Areas read distinct as you roam — orchard rows in the north, tall meadow in the south, a
        // hushed forest in the SE grove pocket, open shire in the Commons + the Warren Approach run-up.
        const area = !inDun && !mire && !grove ? this.areaAt(mx, my) : undefined;
        const groveArea = area === "gv-grove"; // the SE pocket: reuse the existing forest (grove-*) skin
        const isObj = cell === "chest" || cell === "miniboss" || cell === "boss" || cell === "lair" || cell === "mouth" || cell === "village" || cell === "stairsdown" || cell === "stairsup" || POI_KINDS.has(cell);
        // pick the ground sprite: dungeon uses its tileset, overworld uses Greenvale or (mire) the
        // marsh kinds; chest/boss/miniboss sit on a floor/ground tile; a stable hash mixes variant.
        let ground: string;
        // VARIED TERRAIN (2026-06-21): the new geography kinds render the same in any zone dressing
        // (placeholder fills until art lands). River reuses the water sprite; cliff/bridge/ford have
        // their own slots. POI kinds draw their object on the area's normal ground (handled by isObj).
        if (!inDun && (cell === "river" || cell === "cliff" || cell === "bridge" || cell === "ford")) {
          ground = cell === "river" ? (T.water ? "water" : "river") : cell;
        } else if (inDun) {
          const dm: Record<string, string> = { grass: "floor", grass2: "floor2", path: "path", tree: "wall", bush: "rock", rock: "rock", water: "wall" };
          let base = isObj ? "floor" : (dm[cell] || "floor");
          if (base === "floor" && (mx * 7 + my * 13) % 4 === 0 && T[`${dset}-floor2`]) base = "floor2";
          ground = `${dset}-${base}`;
        } else if (mire) {
          // marsh remap: open ground = boggy mire-ground, path = a plank causeway, scatter = reed/bog,
          // tree = dead-tree (still drawn as the object below), water = standing water.
          const gm: Record<string, string> = { grass: "mire-ground", grass2: "mire-ground2", path: "mire-path", bush: "reed", rock: "bog", tree: "mire-ground", water: "water" };
          ground = isObj ? "mire-ground" : (gm[cell] || "mire-ground");
          if (ground === "mire-ground" && (mx * 7 + my * 13) % 4 === 0 && T["mire-ground2"]) ground = "mire-ground2";
        } else if (grove) {
          // forest remap: open ground = mossy grove-ground, path = a root-worn trail, scatter =
          // fern/mushroom, tree = an ancient old-tree (still drawn as the object below).
          const gm: Record<string, string> = { grass: "grove-ground", grass2: "grove-ground2", path: "grove-path", bush: "fern", rock: "mushroom", tree: "grove-ground" };
          ground = isObj ? "grove-ground" : (gm[cell] || "grove-ground");
          if (ground === "grove-ground" && (mx * 7 + my * 13) % 4 === 0 && T["grove-ground2"]) ground = "grove-ground2";
        } else if (groveArea) {
          // Greenvale's Hidden Grove pocket: a hushed forest, dressed with the existing forest skin
          // (grove-ground / root trail / fern / mushroom; oldtree drawn as the object below).
          const gm: Record<string, string> = { grass: "grove-ground", grass2: "grove-ground2", path: "grove-path", bush: "fern", rock: "mushroom", tree: "grove-ground" };
          ground = isObj ? "grove-ground" : (gm[cell] || "grove-ground");
          if (ground === "grove-ground" && (mx * 7 + my * 13) % 4 === 0 && T["grove-ground2"]) ground = "grove-ground2";
        } else if (area === "gv-orchard") {
          // Orchard Ridge: tended orchard rows — orchard-ground under foot, orchard fruit-trees as the
          // wall (drawn as the object below), scatter as bush/rock (windfall + stones).
          const gm: Record<string, string> = { grass: "orchard-ground", grass2: "orchard-ground2", path: "path", tree: "orchard-ground" };
          ground = isObj ? "orchard-ground" : (gm[cell] || "orchard-ground");
          if (ground === "orchard-ground" && (mx * 7 + my * 13) % 4 === 0 && T["orchard-ground2"]) ground = "orchard-ground2";
        } else if (area === "gv-fields") {
          // Bandit Fields: tall wind-rippled meadow — meadow-ground, wheat scatter (bush), trees frame it.
          const gm: Record<string, string> = { grass: "meadow-ground", grass2: "meadow-ground2", path: "path", bush: "wheat", tree: "meadow-ground" };
          ground = isObj ? "meadow-ground" : (gm[cell] || "meadow-ground");
          if (ground === "meadow-ground" && (mx * 7 + my * 13) % 4 === 0 && T["meadow-ground2"]) ground = "meadow-ground2";
        } else {
          // Hearthford Commons + the Warren Approach: the open base shire (grass / road / hedge-tree).
          ground = isObj ? "grass" : cell;
          if (ground === "grass" && (mx * 7 + my * 13) % 4 === 0 && T.grass2) ground = "grass2";
        }
        const gimg = T[ground];
        if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1); // +1px overlap hides hairline seams
        else {
          // flat-colour fallback (palette differs for dungeon / mire / grove / per-Area shire)
          const areaFill = groveArea ? "#2e4a26" : area === "gv-orchard" ? "#557a30" : area === "gv-fields" ? "#7a8a36" : undefined;
          const fill = inDun ? "#2a2740" : mire ? (cell === "water" ? "#23303a" : "#3a4030") : grove ? "#2e4a26" : (cell === "grass" || cell === "grass2") && areaFill ? areaFill : (colors[cell] || "#4a7a32");
          c.fillStyle = fill; c.fillRect(sx, sy, t, t);
          if (!inDun && (mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(sx, sy, t, t); }
          if (inDun) { c.fillStyle = "rgba(38,30,66,.5)"; c.fillRect(sx, sy, t, t); } // tint only when art missing
          else if (mire && cell !== "water") { c.fillStyle = "rgba(20,28,18,.28)"; c.fillRect(sx, sy, t, t); } // grim wash
          else if (grove || groveArea) { c.fillStyle = "rgba(8,20,8,.34)"; c.fillRect(sx, sy, t, t); } // deep, hushed canopy shade
        }
        // overlays / object sprites (fall back to emoji if art isn't loaded)
        c.font = `${t * 0.82}px serif`;
        const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
          if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
          else c.fillText(emoji, sx + t / 2, sy + t / 2);
        };
        if (cell === "chest") { obj(inDun ? T[`${dset}-chest`] : T.chest, "📦", 0.8); if (inDun) this.drawTreasureMark(c, sx, sy, t); }
        else if (cell === "lair") obj(T.lair, "🕳️", 0.85); // rare-monster den (placeholder — see asset-gaps.md)
        else if (cell === "mouth") obj(T[`${dset}-entrance`], "🚪", 0.95); // cleared dungeon mouth — step in to descend
        else if (cell === "village") { // re-enterable hub marker → back into the zone's hub town
          obj(T["town-inn"], "🏘️", 0.95);
          const nm = this.zone().hub ? settlement(this.zone().hub!).name : "Town";
          c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)";
          c.strokeText(nm, sx + t / 2, sy + t * 1.02); c.fillStyle = "rgba(244,210,122,.96)"; c.fillText(nm, sx + t / 2, sy + t * 1.02);
          c.font = `${t * 0.82}px serif`;
        }
        else if (cell === "stairsdown") this.drawStairs(c, obj, T[`${dset}-stairsdown`], false, sx, sy, t); // descend a floor (placeholder — see asset-gaps.md)
        else if (cell === "stairsup") this.drawStairs(c, obj, T[`${dset}-stairsup`], true, sx, sy, t);      // climb a floor / out
        else if (cell === "miniboss") c.fillText("🪖", sx + t / 2, sy + t / 2); // gate guardian — emoji for now
        else if (cell === "boss") { if (inDun) this.drawDungeonBoss(c, sx, sy, t); else obj(undefined, Game.bossDefeated ? "🏴" : "⛺", 0.95); }
        else if (POI_KINDS.has(cell)) this.drawPoiCell(c, T, cell, mx, my, sx, sy, t, false); // captioned landmark/camp/shrine/sign
        else if (cell === "cliff" && !gimg) c.fillText("⛰️", sx + t / 2, sy + t / 2);
        else if (cell === "river" && !gimg) c.fillText("🌊", sx + t / 2, sy + t / 2);
        else if (cell === "tree") {
          if (mire) obj(T.deadtree, "🌫️", 0.95);
          else if (grove || groveArea) obj(T.oldtree, "🌲", 1.0);
          else if (area === "gv-orchard") obj(T["orchard-tree"], "🌳", 1.0); // fruit-tree row
          else if (!gimg) c.fillText(inDun ? "🪨" : "🌲", sx + t / 2, sy + t / 2);
        }
        else if (cell === "water" && !inDun && !gimg) c.fillText("🌊", sx + t / 2, sy + t / 2);
        else if (cell === "bush") {
          if (grove || groveArea) obj(T.fern, "🌿", 0.85);
          else if (area === "gv-fields") obj(T.wheat, "🌾", 0.85); // tall meadow grass
          else if (!gimg) c.fillText(inDun ? "🦴" : mire ? "🌾" : "🌿", sx + t / 2, sy + t / 2);
        }
        else if (cell === "rock") { if (mire && !gimg) c.fillText("🪨", sx + t / 2, sy + t / 2); else if (grove || groveArea) obj(T.mushroom, "🍄", 0.8); }
      }
    // NPCs (town only): a shadow + emoji-placeholder body + gold name caption; a "…" bubble while
    // you're mid-conversation with them. Sprite art is flagged in asset-gaps.md.
    if (this.townMode) {
      const talking = Dialogue.isOn();
      for (const n of this.npcs) {
        if (n.x < camx || n.y < camy || n.x > camx + viewW || n.y > camy + viewH) continue;
        const nx = (n.x - camx) * t + t / 2, ny = (n.y - camy) * t + t / 2;
        c.beginPath(); c.ellipse(nx, ny + t * 0.36, t * 0.26, t * 0.11, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.38)"; c.fill();
        const nimg = this.tiles[`npc:${this.town?.id}-${n.id}`];
        if (nimg) { const h = t * 1.5, w = h * nimg.width / nimg.height; c.drawImage(nimg, nx - w / 2, ny + t * 0.36 - h, w, h); }
        else { c.font = `${t * 0.72}px serif`; c.fillStyle = "#fff"; c.fillText(n.spr, nx, ny - t * 0.04); }
        c.font = `bold ${Math.max(8, t * 0.22)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.92)";
        c.strokeText(n.name, nx, ny + t * 0.5); c.fillText(n.name, nx, ny + t * 0.5);
        if (!talking) { c.font = `${t * 0.4}px serif`; c.fillStyle = "rgba(244,210,122,.85)"; c.fillText("💬", nx + t * 0.36, ny - t * 0.4); }
      }
    }
    // player marker: feet shadow + "you are here" ring + a tall walker sprite that pops (emoji fallback)
    const cx = (this.px - camx) * t + t / 2, cy = (this.py - camy) * t + t / 2;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    const pimg = this.playerImg(T);
    if (pimg) {
      const ph = t * 1.55, pw = ph * (pimg.width / pimg.height);
      // The walker is tall (≈1.55× tile) and anchored at the feet, so at a y≈1 spawn on a tall,
      // camera-scrolled map (e.g. the city) its head would clip above the canvas. Clamp the top edge
      // so the body always stays on-screen rather than vanishing past the top.
      const py = Math.max(2, cy + t * 0.46 - ph);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(pimg, cx - pw / 2, py, pw, ph);
      c.shadowBlur = 0;
    } else {
      c.font = `${t * 0.7}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy);
    }
    c.restore();
  },
};
