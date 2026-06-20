// Tile field map: grid, camera, movement, random encounters, chokepoint mini-boss + zone boss.

import { $ } from "../core/dom";
import { assetUrl } from "../core/assets";
import { clamp, ri, pick } from "../core/rng";
import { ZONES, greenvaleAreaAt, type ZoneLayout, type Pt, type GreenvaleAreaId } from "../data/zones";
import {
  OVERWORLD_ID, AURELION_ID, regionAt, authoredAt, placementOf,
  buildAuthoredGrid, realizeKindWorld, tileHash, builtZonesOf,
} from "../data/world";
import { Music } from "../audio/music";
import { settlement, TOWN_GLYPHS, TOWN_BLOCKERS, POI_OF, type Settlement, type TownNPC } from "../data/towns";
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
const DUNGEON_SETS = ["warren", "grove", "vault"];

// Overworld/dungeon WALL kinds — impassable, and a flood-fill barrier (anti-soft-lock reasons over
// these). `tree` walls every zone's canvas + the gate chokepoint; `water` is the marsh's hard pool.
const FIELD_WALLS = new Set(["tree", "water"]);

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
  ENC_MIN: 3, ENC_MAX: 6,
  zoneIndex: 0,
  enteredDungeon: false,
  // ADR 0008 Stage 2 (step 3): which decoupled space we're in. "overworld" = the seamless region
  // grid (with the dungeon MOUTH POI); "dungeon" = the discrete dungeon grid (entered through the
  // mouth). Only GREENVALE uses the new genOverworld/genDungeon split for now (usesNewModel());
  // Silverwood/Duskmarsh stay on the LEGACY combined-grid path where `mode` is always "overworld"
  // and `inDungeon()` falls back to the old px>gate.x test.
  mode: "overworld" as "overworld" | "dungeon",
  mouth: { x: 40, y: 12 } as Pt, // overworld dungeon-mouth POI (new model) — set in genOverworld
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
  // `bigMapEnabled` is the MASTER toggle (Greenvale enters the windowed big map when on; flip it off
  // for the discrete fallback). `bigMap` is the per-load ACTIVE-state flag set by enterBigMap().
  // SHIPS DORMANT (false) during the staged seamless build (ADR 0008/0009): prod stays on the proven
  // discrete path until the Greenvale↔Silverwood no-load proof (2C) is verified + Dara signs off the
  // live flip. Tests/Playwright exercise the on-path by toggling this true.
  bigMapEnabled: false,
  bigMap: false,
  wx: 0, wy: 0,                                   // player world-tile position (source of truth when bigMap)
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
    // marsh (Duskmarsh) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["water", "mire-ground", "mire-ground2", "mire-path", "deadtree", "reed", "bog"]) names.push(n);
    // ancient-forest (Silverwood) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["grove-ground", "grove-ground2", "grove-path", "oldtree", "fern", "mushroom"]) names.push(n);
    // Greenvale AREA dressing (ADR 0009 exemplar): per-Area shire flavor kinds — placeholders until
    // sliced (see asset-gaps.md). Orchard Ridge + Bandit Fields get their own ground/scatter so the
    // five Areas read distinct; Commons/Warren reuse the base shire grass; the Grove reuses the
    // existing forest (grove-*) kinds.
    for (const n of ["orchard-ground", "orchard-ground2", "orchard-tree", "meadow-ground", "meadow-ground2", "wheat"]) names.push(n);
    for (const set of DUNGEON_SETS) for (const c of ["floor", "floor2", "path", "wall", "rock", "chest", "entrance"]) names.push(`${set}-${c}`);
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
  },

  zone() { return ZONES[this.zoneIndex]; },
  isLastZone(): boolean { return this.zoneIndex >= ZONES.length - 1; },
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
    carve(this.boss.x, this.boss.y, "boss");
    carve(L.spawn.x, L.spawn.y, "path");

    // 7. ANTI-SOFT-LOCK: flood-fill from spawn (gate walkable) and repair any walled-off feature.
    const targets = [this.boss, ...this.chests]; if (this.lairAt) targets.push(this.lairAt);
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

    this.chests.forEach((c) => { this.halo(c); carve(c.x, c.y, "chest"); });
    if (this.lairAt) { this.halo(this.lairAt); carve(this.lairAt.x, this.lairAt.y, "lair"); }
    // The mouth POI: guarded by the mini until it's beaten, then enterable.
    this.halo(this.mouth);
    this.map[this.mouth.y][this.mouth.x] = Game.miniBossDefeated ? "mouth" : "miniboss";
    carve(L.spawn.x, L.spawn.y, "path");

    // ANTI-SOFT-LOCK: the mouth + every overworld chest/lair must be reachable from spawn.
    const targets = [this.mouth, ...this.chests]; if (this.lairAt) targets.push(this.lairAt);
    this.ensureReachable(L.spawn, targets);
  },

  // ── ADR 0008 Stage 2 (step 3): build the zone's DUNGEON as its own grid (DungeonLayout). The
  // player lands at `entry`; the zone boss lives at `boss`. Sets mode="dungeon". Greenvale only.
  genDungeon(zoneIndex: number): void {
    this.townMode = false;
    this.mode = "dungeon";
    const D = ZONES[zoneIndex].dungeon.layout;
    this.W = D.w; this.H = D.h;
    this.gate = { ...D.gate };           // the door back out to the overworld
    this.boss = { ...D.boss };
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

    this.chests.forEach((c) => { this.halo(c); carve(c.x, c.y, "chest"); });
    carve(this.boss.x, this.boss.y, "boss");
    carve(D.entry.x, D.entry.y, "path");

    const targets = [this.boss, ...this.chests];
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
  // scatter (decoration) + marsh water pools — shared by genCombined/genOverworld (the dungeon does
  // its own scatter and has no water). Never overwrites the mouth/miniboss tile.
  scatterAndWater(L: ZoneLayout): void {
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const dens = L.scatter ?? 0.06;
    for (let y = 1; y < this.H - 1; y++) for (let x = 1; x < this.W - 1; x++)
      if (this.map[y][x] === "grass" && Math.random() < dens) this.map[y][x] = Math.random() < 0.6 ? "bush" : "rock";
    if (L.water) for (const w of L.water)
      for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++)
        if (inB(x, y) && this.map[y][x] !== "miniboss") this.map[y][x] = "water";
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
    if (this.bigMapActive()) { this.bigMove(dx, dy); return; } // windowed big-map roams in world coords
    const nx = this.px + dx, ny = this.py + dy;
    // Walking into an NPC talks to them (you don't move onto their tile).
    if (this.townMode) { const npc = this.npcAt(nx, ny); if (npc) { this.talkTo(npc); return; } }
    if (!this.passable(nx, ny)) return;
    this.px = nx; this.py = ny;
    if (this.townMode) { this.draw(); this.hint(); this.townTouch(this.map[ny][nx]); return; } // no steps/encounters in town
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.map[ny][nx];
    if (cell === "boss" && !Game.bossDefeated) { this.startBoss(); return; }
    if (cell === "miniboss" && !Game.miniBossDefeated) { this.startMiniBoss(); return; }
    if (cell === "mouth") { this.descend(); return; }       // step onto the cleared mouth → into the dungeon
    if (cell === "chest") { this.openChest(nx, ny); return; } // a chest doesn't also trigger a fight
    if (cell === "lair") { this.enterLair(nx, ny); return; }  // the rare-monster den (Hogger)
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
    if (this.usesNewModel()) {
      if (this.mode === "overworld" && this.map[this.mouth.y]) this.map[this.mouth.y][this.mouth.x] = "mouth";
    } else if (this.gate && this.map[this.gate.y]) {
      this.map[this.gate.y][this.gate.x] = "path"; // open the chokepoint into the combined dungeon
    }
    this.draw?.(); this.hint?.();
  },
  // Step onto the cleared mouth → build the dungeon grid, drop into it, show the "you descend" beat.
  descend(): void {
    this.enteredDungeon = true;
    this.resize(); this.genDungeon(this.zoneIndex); // sets mode="dungeon" + px/py to the entry
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Game.saveNow();
    const z = this.zone();
    Overlay.show(`<h2 class="title-gold">${z.dungeon.name}</h2><p class="small">You descend into the dungeon. The enemies here are stronger — but so is their hoard.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
  },
  // Climb back out of the dungeon to the overworld (new model). Rebuilds the overworld at the mouth.
  // BIG-MAP: restore the player onto the mouth's WORLD tile and re-enter the windowed overworld; the
  // chunk cache + authored blueprint carry over (the mouth never moved in world space).
  ascend(): void {
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
  // ═══ SEAMLESS BIG-MAP (ADR 0009 / Stage 2C) — CONTINENT-WIDE, behind `bigMap` ═══════════════════
  // Render+roam the whole AURELION continent as a WINDOW into the 960×640 world (G22). `wx/wy` is the
  // source of truth; the viewport is iterated from a 32×32 chunk cache (realized on move, evicted when
  // far); each cell caches its identity (Area→biome/tileset/lean/music) at realize time so `draw()`
  // never calls regionAt. The three built cores (Greenvale/Silverwood/the Duskmarsh) and the open
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
    for (const id of this.bigBuiltZoneIds()) this.authoredGrids[id] = buildAuthoredGrid(id, Game.miniBossDefeated);
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
    if (builtId !== this.bigZone) {
      this.bigZone = builtId;
      if (builtId) {
        const zi = ZONES.findIndex((z) => z.id === builtId);
        if (zi >= 0) this.zoneIndex = zi;
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
    this.wx = nx; this.wy = ny;
    this.realizeAround();      // realize-on-move (never in draw)
    this.syncZoneFromWorld();  // POSITION-DERIVED state (zone/bands/music) — the no-loadZone crossing
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.cellAt(nx, ny);
    if (cell.kind === "miniboss" && !Game.miniBossDefeated) { this.startMiniBoss(); return; }
    if (cell.kind === "mouth") { this.descend(); return; }
    if (cell.kind === "chest") { this.openBigChest(nx, ny); return; }
    if (cell.kind === "lair") { this.enterBigLair(nx, ny); return; }
    // OPEN CONTINENT (no built zone under the player) is backlog land — no random encounters yet (G22).
    if (!this.bigZone) return;
    this.stepsToEncounter--;
    if (this.stepsToEncounter <= 0) { this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX); this.rollEncounter(); }
  },
  // A chest in big-map space: consume the realized cell + the authored blueprint cell, then reward.
  openBigChest(wx: number, wy: number): void {
    this.cellAt(wx, wy).kind = "path";
    const a = authoredAt(wx, wy); if (a && this.authoredGrids[a.zoneId]) this.authoredGrids[a.zoneId][a.ly][a.lx] = "path";
    const floor = clamp(2 + Math.floor(this.progress() * 3), 1, 5);
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4);
    const m = pick(Game.party);
    const it = rollItemAtRarity(floor, m.cls, ilvl, m.att);
    Game.inventory.push(it); Telemetry.drop(it.rarity);
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
    // the dungeon runs ~1-2 levels hotter than the overworld
    const depth = this.inDungeon() ? clamp(p + 0.25, 0, 1) : p;
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
    if (p > 0.12 && Math.random() < champChance) {
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
  startBoss(): void { Battle.begin([this.zone().boss], this.envFor(1), true, this.isLastZone(), this.progress()); },
  startMiniBoss(): void {
    const p = this.progress(), z = this.zone();
    Battle.begin([z.mini, ...(z.miniAdds || [])], this.envFor(p), true, false, p);
  },
  openChest(x: number, y: number): void {
    this.map[y][x] = "path";
    const floor = clamp(2 + Math.floor(this.progress() * 3), 1, 5); // deeper chests = better floor
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4); // and a higher item level
    const m = pick(Game.party);
    const it = rollItemAtRarity(floor, m.cls, ilvl, m.att);
    Game.inventory.push(it); Telemetry.drop(it.rarity);
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Treasure!</h2>${itemHtml(it)}<div class="row"><button class="btn gold" onclick="Overlay.hide()">Take it</button></div>`);
  },
  hint(): void {
    const set = (sel: string, txt: string) => { const e = $(sel); if (e) e.textContent = txt; };
    const party = $("#fieldParty");
    if (party) party.innerHTML = Game.party.map((m) => `<span class="pm">${m.spr} ${m.name} <span class="small">L${m.level}</span></span>`).join("");
    set("#fieldGold", String(Game.gold));
    if (this.townMode) {
      set("#fieldHint", "Walk into a townsperson to talk; onto a building to use it; through the north gate to head out.");
      set("#fieldZone", this.town?.name ?? "Town");
      return;
    }
    const p = this.progress(), z = this.zone(), name = z.name;
    const miniNm = ENEMIES[z.mini].name, bossNm = ENEMIES[z.boss].name;
    let msg: string;
    if (this.inDungeon()) msg = p > 0.88 ? `The ${bossNm} lurks at the heart of ${z.dungeon.name}.` : `Deep in ${z.dungeon.name} — stronger foes, richer loot.`;
    else if (!Game.miniBossDefeated && p >= 0.38) msg = `A ${miniNm} guards the mouth of ${z.dungeon.name}.`;
    else if (this.usesNewModel() && Game.miniBossDefeated && p >= 0.7) msg = `Step onto the mouth of ${z.dungeon.name} to descend.`;
    else if (p < 0.12) msg = `Head east through ${name}. Search off the path for treasure.`;
    else if (p > 0.88) msg = `${z.dungeon.name} lies just ahead.`;
    else msg = `${Math.round(p * 100)}% through ${name}. Keep moving east.`;
    set("#fieldHint", msg);
    set("#fieldZone", `${this.inDungeon() ? z.dungeon.name : name} · ${Game.encountersWon} cleared`);
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
    let g = isWall ? "" : city ? cityGround : marsh ? (onSoft ? "town-bog" : "town-plank") : (onSoft ? "town-grass" : "town-cobble");
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
    } else if (isWall && !gimg) { c.font = `${t * 0.7}px serif`; c.fillStyle = city ? "#9a8a64" : "#3a5a2a"; c.fillText(city ? "🧱" : marsh ? "🌲" : "🌳", sx + t / 2, sy + t / 2); }
  },
  // ── BIG-MAP biome → ground/object dressing (ADR 0009 / Stage 2B) ─────────────────────────────
  // A zone-AGNOSTIC dressing table keyed by a cell's cached BIOME (Area→identity.biome), replacing the
  // discrete path's Greenvale-special-cased switch. For a realized cell kind it returns the ground
  // sprite key (+a *-ground2 alternate by the cached variant) and, for tree/bush/rock, the object skin.
  // Falls back to the base shire skin for an unknown biome. Pure mapping — no regionAt on the frame path.
  bigGround(biome: string, kind: string, variant: number): { ground: string; flat: string } {
    const T = this.tiles;
    const isObj = kind === "chest" || kind === "miniboss" || kind === "boss" || kind === "lair" || kind === "mouth";
    const alt = (base: string) => (variant && T[base + "2"] ? base + "2" : base);
    // [base-ground, ground2-capable?, path key, scatter-bush key, scatter-rock key, flat-fill]
    if (biome === "forest") {
      const gm: Record<string, string> = { grass: "grove-ground", grass2: "grove-ground2", path: "grove-path", bush: "fern", rock: "mushroom", tree: "grove-ground", water: "water" };
      const g = isObj ? "grove-ground" : (gm[kind] || "grove-ground");
      return { ground: g === "grove-ground" ? alt("grove-ground") : g, flat: "#2e4a26" };
    }
    if (biome === "mire" || biome === "water" || biome === "ruin") {
      const gm: Record<string, string> = { grass: "mire-ground", grass2: "mire-ground2", path: "mire-path", bush: "reed", rock: "bog", tree: "mire-ground", water: "water" };
      const g = isObj ? "mire-ground" : (gm[kind] || "mire-ground");
      return { ground: g === "mire-ground" ? alt("mire-ground") : g, flat: kind === "water" ? "#23303a" : "#3a4030" };
    }
    if (biome === "orchard") {
      const gm: Record<string, string> = { grass: "orchard-ground", grass2: "orchard-ground2", path: "path", tree: "orchard-ground" };
      const g = isObj ? "orchard-ground" : (gm[kind] || "orchard-ground");
      return { ground: g === "orchard-ground" ? alt("orchard-ground") : g, flat: "#557a30" };
    }
    if (biome === "meadow") {
      const gm: Record<string, string> = { grass: "meadow-ground", grass2: "meadow-ground2", path: "path", bush: "wheat", tree: "meadow-ground" };
      const g = isObj ? "meadow-ground" : (gm[kind] || "meadow-ground");
      return { ground: g === "meadow-ground" ? alt("meadow-ground") : g, flat: "#7a8a36" };
    }
    // plains / unknown = base shire grass + road + hedge-tree.
    const g = isObj ? "grass" : kind;
    return { ground: g === "grass" ? alt("grass") : g, flat: "#4a7a32" };
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
      else if (cell.kind === "mouth") obj(T[`${dset}-entrance`], "🚪", 0.95);
      else if (cell.kind === "miniboss") c.fillText("🪖", sx + t / 2, sy + t / 2);
      else if (cell.kind === "tree") {
        if (biome === "forest") obj(T.oldtree, "🌲", 1.0);
        else if (biome === "orchard") obj(T["orchard-tree"], "🌳", 1.0);
        else if (biome === "mire" || biome === "ruin") obj(T.deadtree, "🌫️", 0.95);
        else if (!gimg) c.fillText("🌲", sx + t / 2, sy + t / 2);
      }
      else if (cell.kind === "water" && !gimg) c.fillText("🌊", sx + t / 2, sy + t / 2);
      else if (cell.kind === "bush") {
        if (biome === "forest") obj(T.fern, "🌿", 0.85);
        else if (biome === "meadow") obj(T.wheat, "🌾", 0.85);
        else if (!gimg) c.fillText("🌿", sx + t / 2, sy + t / 2);
      }
      else if (cell.kind === "rock") { if (biome === "forest") obj(T.mushroom, "🍄", 0.8); }
    }
    // player marker (same as discrete): feet shadow + ring + tall walker (emoji fallback).
    const cx = (this.wx - camx) * t + t / 2, cy = (this.wy - camy) * t + t / 2;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    if (T.player) {
      const ph = t * 1.55, pw = ph * (T.player.width / T.player.height);
      const py = Math.max(2, cy + t * 0.46 - ph);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(T.player, cx - pw / 2, py, pw, ph); c.shadowBlur = 0;
    } else { c.font = `${t * 0.7}px serif`; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy); }
    c.restore();
  },

  draw(): void {
    if (this.bigMapActive()) { this.drawBig(); return; } // windowed big-map = its own world-coord render
    const c = this.ctx, t = this.tile;
    if (!c || !this.canvas) return;
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const viewW = Math.ceil(this.canvas.width / t), viewH = Math.ceil(this.canvas.height / t);
    const camx = clamp(this.px - Math.floor(viewW / 2), 0, Math.max(0, this.W - viewW));
    const camy = clamp(this.py - Math.floor(viewH / 2), 0, Math.max(0, this.H - viewH));
    const colors: Record<string, string> = { grass: "#4a7a32", grass2: "#52823a", path: "#7a6a3a", tree: "#1f3a1c", bush: "#3a6a2a", rock: "#5a5a52", boss: "#6a1020", chest: "#6a5a2a", miniboss: "#5a1226" };
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
        const isObj = cell === "chest" || cell === "miniboss" || cell === "boss" || cell === "lair" || cell === "mouth";
        // pick the ground sprite: dungeon uses its tileset, overworld uses Greenvale or (mire) the
        // marsh kinds; chest/boss/miniboss sit on a floor/ground tile; a stable hash mixes variant.
        let ground: string;
        if (inDun) {
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
        if (cell === "chest") obj(inDun ? T[`${dset}-chest`] : T.chest, "📦", 0.8);
        else if (cell === "lair") obj(T.lair, "🕳️", 0.85); // rare-monster den (placeholder — see asset-gaps.md)
        else if (cell === "mouth") obj(T[`${dset}-entrance`], "🚪", 0.95); // cleared dungeon mouth — step in to descend
        else if (cell === "miniboss") c.fillText("🪖", sx + t / 2, sy + t / 2); // gate guardian — emoji for now
        else if (cell === "boss") obj(inDun ? T[`${dset}-entrance`] : undefined, Game.bossDefeated ? "🏴" : "⛺", 0.95);
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
        c.font = `${t * 0.72}px serif`; c.fillStyle = "#fff"; c.fillText(n.spr, nx, ny - t * 0.04);
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
    if (T.player) {
      const ph = t * 1.55, pw = ph * (T.player.width / T.player.height);
      // The walker is tall (≈1.55× tile) and anchored at the feet, so at a y≈1 spawn on a tall,
      // camera-scrolled map (e.g. the city) its head would clip above the canvas. Clamp the top edge
      // so the body always stays on-screen rather than vanishing past the top.
      const py = Math.max(2, cy + t * 0.46 - ph);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(T.player, cx - pw / 2, py, pw, ph);
      c.shadowBlur = 0;
    } else {
      c.font = `${t * 0.7}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy);
    }
    c.restore();
  },
};
