// Tile field map ORCHESTRATOR: camera, movement, navigation/encounter flow, big-map chunk streaming,
// and the per-frame draw LOOP — wiring the pure pieces to the DOM/run state. The map GEOMETRY is
// `systems/mapgen` (pure, RNG-injected); the canvas DRAW primitives are `ui/fieldRender` (pure, ctx+data
// in); the encounter composition is `systems/encounter`. See ADR 0012 for the god-module split.

import { $ } from "../core/dom";
import { assetUrl } from "../core/assets";
import { clamp, ri } from "../core/rng";
import { ZONES, greenvaleAreaAt, type Zone, type DungeonLayout, type Pt, type Poi, type GreenvaleAreaId } from "../data/zones";
import {
  OVERWORLD_ID, AURELION_ID, regionAt, authoredAt, placementOf,
  buildAuthoredGrid, realizeKindWorld, tileHash, builtZonesOf, barrierAt, isBarrierCrossing, type Capability,
} from "../data/world";
import { traversalBlocks, grantCap, type OwnedCaps } from "../systems/traversal";
import { genCombined, genOverworld, genDungeon, FIELD_WALLS, type GenResult, type ClearedState } from "../systems/mapgen";
import * as FR from "../ui/fieldRender";
import { POI_KINDS } from "../ui/fieldRender";
import { emptyProgress, markRegionEntered, markRegionKnown, type Progress } from "../systems/progress";
import { Music } from "../audio/music";
import { settlement, SETTLEMENTS, TOWN_GLYPHS, TOWN_BLOCKERS, POI_OF, type Settlement, type TownNPC } from "../data/towns";
import { ENEMIES, RARE_MONSTERS } from "../data/enemies";
import { rollItemAtLevel } from "../systems/loot";
import { rollEncounter, pickAreaSet } from "../systems/encounter";
import { applyReprieve } from "../systems/reprieve";
import { CHEST_LEVEL, DROP_MODS } from "../data/loot";
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
// AURELION (2026-06-22) — all six later dungeons now have their own bespoke sliced tileset:
//   [4]stormcoast=seacave  [5]riverhearth=smuggden  [6]frostpeak=stronghold
//   [7]dawnfall=keepvault  [8]whisperhills=crypt     [9]sunbridge=citadel
const DUNGEON_SETS = ["warren", "grove", "vault", "granary", "seacave", "smuggden", "stronghold", "keepvault", "crypt", "citadel"];
// Per-set lit WALL DECORATION (sliced, atmosphere only): a room-facing wall occasionally renders this
// variant instead of the plain wall. granary has none (falls back to plain wall).
const DUNGEON_DECO: Record<string, string> = {
  warren: "torch", grove: "spores", vault: "lantern",
  seacave: "glowweed", smuggden: "lamp", stronghold: "brazier", keepvault: "torch", crypt: "candles", citadel: "brazier",
};

// Per-town tileset theme (Aurelion front-door towns): maps the generic town glyph-KINDS to that
// town's bespoke sliced tiles. `_a`/`_b` are the two ground swatches (cobble/grass equivalents);
// the rest override the building/decoration sprite for the matching kind. Missing keys fall back to
// the generic emoji/art, so a town renders cleanly even if a tile is absent. Set via Settlement.theme.
const TOWN_THEMES: Record<string, Record<string, string>> = {
  elderbough: { _a: "eb-path", _b: "eb-verge", twall: "eb-wall", "t-inn": "eb-inn", "t-shop": "eb-shop", "t-smith": "eb-smith", "t-revive": "eb-shrine", "t-exit": "eb-gate", "t-well": "eb-well", "t-tree": "eb-eldertree", "t-house": "eb-lantern", "town-flower": "eb-fern" },
  wheatcross: { _a: "wc-road", _b: "wc-verge", twall: "wc-wall", "t-inn": "wc-inn", "t-shop": "wc-shop", "t-smith": "wc-smith", "t-revive": "wc-shrine", "t-exit": "wc-gate", "t-fountain": "wc-rick", "t-well": "wc-well", "t-tree": "wc-scarecrow", "t-house": "wc-sacks" },
  wrackport: { _a: "wp-cobble", _b: "wp-boardwalk", twall: "wp-wall", "t-inn": "wp-inn", "t-shop": "wp-shop", "t-smith": "wp-smith", "t-revive": "wp-shrine", "t-exit": "wp-gate", "t-fountain": "wp-dock", "t-well": "wp-sea", "t-tree": "wp-mooring", "t-house": "wp-wreck" },
  frosthold: { _a: "fh-floor", _b: "fh-snow", twall: "fh-wall", "t-inn": "fh-inn", "t-shop": "fh-shop", "t-smith": "fh-smith", "t-revive": "fh-shrine", "t-exit": "fh-gate", "t-fountain": "fh-hearth", "t-tree": "fh-pillar", "t-house": "fh-ore" },
  lastlight: { _a: "ll-ground", _b: "ll-verge", twall: "ll-wall", "t-inn": "ll-inn", "t-shop": "ll-shop", "t-smith": "ll-smith", "t-revive": "ll-shrine", "t-exit": "ll-gate", "t-fountain": "ll-bonfire", "t-well": "ll-well", "t-tree": "ll-tower", "t-house": "ll-shields" },
  vesperhal: { _a: "vh-flag", _b: "vh-garth", twall: "vh-wall", "t-inn": "vh-inn", "t-shop": "vh-shop", "t-smith": "vh-smith", "t-revive": "vh-shrine", "t-exit": "vh-gate", "t-fountain": "vh-bell", "t-tree": "vh-cypress", "t-house": "vh-well", "town-flower": "vh-flowers" },
  sunpier: { _a: "sp-flag", _b: "sp-verge", twall: "sp-wall", "t-inn": "sp-inn", "t-shop": "sp-shop", "t-smith": "sp-smith", "t-revive": "sp-shrine", "t-exit": "sp-gate", "t-fountain": "sp-pier", "t-well": "sp-sea", "t-tree": "sp-lamp", "t-house": "sp-cargo" },
};

// OPTIONAL (side) zones vs SPINE (mainline progression). The mouth caption distinguishes the two
// (a spine dungeon reads `↦ <name>`; an optional one reads `<name> (optional)`). The Aurelion-complete
// review names the optional set; everything else is spine-ish (the mainline ladder to Sunbridge).
const OPTIONAL_ZONES = new Set(["stormcoast", "riverhearth", "dawnfall", "whisperhills"]);

// ZONES ON THE NEW DECOUPLED OVERWORLD/DUNGEON MODEL (ADR 0008 Stage 2 — `usesNewModel()`). DATA-DRIVEN
// by zone id (Silverwood Overhaul, B1) so a zone joins by being listed here, not by a hardcoded
// `zoneIndex===0` check. Greenvale (the exemplar) + Silverwood (this overhaul) are migrated; the rest
// stay on the legacy combined-grid path (`genCombined`) until they migrate. The big map is the live
// surface for ALL zones (bigMapEnabled); this set drives onMiniDefeated's mouth-flip + inDungeon's
// mode test, which is what makes the Sunless-Grove mouth open on the big map (live bug 6).
const NEW_MODEL_ZONES = new Set(["greenvale", "silverwood"]);

// FIELD_WALLS (the overworld/dungeon WALL kinds — tree/water/cliff/river — impassable + a flood barrier)
// is imported from systems/mapgen, the one source of truth shared with the pure generators.

// POI_KINDS (the INHABITED-world walkable tile kinds — shrine/camp/landmark/signpost) is imported
// from ui/fieldRender, the one source of truth shared with the draw primitives.

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
  // TRAVERSAL CAPABILITIES (Silverwood Overhaul, D2): the run's owned macro-traversal unlocks (e.g.
  // "gorge" — the raft/bridge-kit from the Bandit Warren). A barrier band (data/world.BARRIERS) is
  // impassable terrain until its cap is owned; bigPassable consults `traversalBlocks` BEFORE the
  // cell-kind check. PERSISTED in the save (string[]); a fresh run owns nothing.
  ownedCaps: new Set<string>() as OwnedCaps,
  // WAYFINDING PROGRESS (ADR 0011): the run's known/entered regions that drive the derived Objective +
  // the continent overview-map reveal. PERSISTED in the save (two string[]s); a fresh run knows nothing.
  // Cosmetic/wayfinding only — it gates no traversal, so an old save loading to empty is always safe.
  // NB named `wayfinding` (not `progress`) to avoid colliding with the existing progress() depth-fraction method.
  wayfinding: emptyProgress() as Progress,
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
  // PER-ZONE OVERWORLD-MOUTH state (Silverwood Overhaul fix): which zones' OVERWORLD dungeon-mouth guard
  // (the zone mini-boss that blocks the descent) has been beaten, by STABLE zone id. The seamless big map
  // hosts MULTIPLE new-model zones (Greenvale + Silverwood) live at once, so the mouth-cleared flag MUST be
  // per-zone — a single global boolean would open every zone's mouth the instant one was cleared (and gate
  // the others' fights as already-won → unreachable dungeons). Reset on a fresh run; PERSISTED in the save
  // (back-compat: an old save with the global `miniBossDefeated` seeds the zone it was in — see deserialize).
  // Legacy combined-grid zones map onto the SAME per-zone state (keyed by their zone id).
  mouthCleared: {} as Record<string, boolean>,
  // The one-time "you raft across the Sunless Gorge" use-feedback callout (ADR 0011 D3): fired the first
  // time the player steps onto a barrier crossing tile this session. Not persisted (a re-cross after a
  // reload showing it once more is harmless), so it lives here, not in the save.
  _gorgeCrossed: false,
  // The floor whose in-dungeon mini-boss fight is in flight (so battle.ts → onMiniDefeated can mark
  // THIS floor cleared, distinct from the overworld mouth guard). -1 = none / the mouth guard fight.
  pendingFloorMini: -1,
  // TOWN: a real walkable settlement (data-driven, ADR 0006) reusing this same canvas/camera/dpad.
  // Loaded by id from data/towns.ts. No encounters; buildings are walk-in POIs; NPCs are talked to.
  townMode: false,
  town: null as Settlement | null,
  npcs: [] as TownNPC[],
  // Town captions (building + NPC names) buffered during the tile/NPC passes and flushed in ONE final
  // pass ON TOP of every sprite — so a later row's tile or a taller NPC can't paint over a label, and
  // each is clamped into the viewport so edge labels aren't clipped (Dara: labels hidden under tiles).
  _townLabels: [] as { text: string; x: number; y: number; f: number }[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  vw: 0, vh: 0, // CSS-pixel viewport size (the canvas backing store is vw/vh × devicePixelRatio)
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
  // SMOOTH-STEP GLIDE (presentation only): logic stays discrete — px/py (or wx/wy) snap immediately for
  // collision/encounters/POIs; only the camera + drawn walker glide between tiles (~115ms, eased), with
  // a small foot-bob. A held direction chains glides from the current visual position so motion flows.
  _glide: null as null | { fx: number; fy: number; t0: number; ms: number },
  // AMBIENT LOOP (the living world): one shared RAF loop drives glides at full rate and ambient life
  // (water shimmer, drifting motes) at ~30fps while the field screen is visible. Self-stops when the
  // field hides or the tab backgrounds; any draw() restarts it. Skipped under prefers-reduced-motion.
  _loopRaf: 0,
  _loopLast: 0,
  _motes: [] as { x: number; y: number; vx: number; vy: number; r: number; p: number }[],
  _moteStyle: "",
  _moteLast: 0,
  _atmo: "",
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
    // TRAVERSAL BARRIER (D2): the locked "gorge" chasm wall (placeholder fill until art-integrator slices
    // a ravine/raft sprite — flagged in the hand-back). Reuses the in-palette dark fill meanwhile.
    names.push("gorge");
    names.push("crossing"); // the UNLOCKED raft/plank causeway over the gorge (placeholder plank fill until sliced — see asset-gaps.md)
    // marsh (Duskmarsh) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["water", "mire-ground", "mire-ground2", "mire-path", "deadtree", "reed", "bog"]) names.push(n);
    // ancient-forest (Silverwood) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["grove-ground", "grove-ground2", "grove-path", "oldtree", "fern", "mushroom"]) names.push(n);
    // Greenvale AREA dressing (ADR 0009 exemplar): per-Area shire flavor kinds — placeholders until
    // sliced (see asset-gaps.md). Orchard Ridge + Bandit Fields get their own ground/scatter so the
    // five Areas read distinct; Commons/Warren reuse the base shire grass; the Grove reuses the
    // existing forest (grove-*) kinds.
    for (const n of ["orchard-ground", "orchard-ground2", "orchard-tree", "meadow-ground", "meadow-ground2", "wheat"]) names.push(n);
    for (const set of DUNGEON_SETS) for (const c of ["floor", "floor2", "path", "wall", "rock", "chest", "entrance", "stairsdown", "stairsup", "rest", "rubble"]) names.push(`${set}-${c}`);
    for (const set of DUNGEON_SETS) if (DUNGEON_DECO[set]) names.push(`${set}-${DUNGEON_DECO[set]}`); // lit wall decorations
    // town sprites (resolve to emoji fallback until the tileset is sliced — see asset-gaps.md)
    for (const n of ["town-cobble", "town-cobble2", "town-grass", "town-flower", "town-inn", "town-shop", "town-smith", "town-revive", "town-fountain", "town-exit", "town-tree", "town-well", "town-house", "town-stash"]) names.push(n);
    // the dungeon-boss throne/lair prop (drawn under the BOSS beacon by drawDungeonBoss)
    names.push("boss-throne");
    // Miregard marsh-outpost kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["town-plank", "town-bog", "town-stilt", "town-deadtree", "town-lantern"]) names.push(n);
    // Riverhearth city kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["town-avenue", "town-river", "town-bridge", "town-dock", "town-grand", "town-townhouse", "town-stall", "town-statue"]) names.push(n);
    // Aurelion per-town bespoke tilesets (sliced art, keyed by Settlement.theme)
    for (const th of Object.values(TOWN_THEMES)) for (const k in th) names.push(th[k]);
    // Aurelion overworld biome tiles (snow / coast / ruin — ground swatches + scatter objects)
    for (const n of ["snow-ground", "snow-ground2", "snow-path", "snow-frozen", "snow-ice", "snow-crag", "snow-pine", "snow-cairn", "snow-rock", "coast-sand", "coast-sand2", "coast-grass", "coast-surf", "coast-sea", "coast-dock", "coast-rock", "coast-pool", "coast-piling", "ruin-flag", "ruin-flag2", "ruin-walk", "ruin-pit", "ruin-wall", "ruin-rubble", "ruin-grass", "ruin-column", "ruin-brazier"]) names.push(n);
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
    // GATE-GUARDIAN sprites: the dungeon-mouth mini-boss (zone.mini) and the in-dungeon floor
    // lieutenant (dungeon.floorMini) render as their actual ENEMY sprite on the gate tile (reusing
    // the battle art) instead of a 🪖 emoji. Preload each unique sprite into tiles["mob:<key>"].
    const mobs = new Set<string>();
    for (const z of ZONES) for (const k of [z.mini, z.dungeon?.floorMini]) if (k) mobs.add(ENEMIES[k]?.art || k);
    for (const sk of mobs) {
      const url = assetUrl(`enemies/${sk}.png`); if (!url) continue;
      const key = `mob:${sk}`, img = new Image();
      img.onload = () => { this.tiles[key] = img; this.draw(); }; img.src = url;
    }
  },

  // The gate-guardian ENEMY sprite for an enemy key (mini / floorMini), or undefined if not loaded yet.
  mob(key: string | undefined): HTMLImageElement | undefined {
    if (!key) return undefined;
    return this.tiles[`mob:${ENEMIES[key]?.art || key}`];
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
  // Whether THIS zone runs the new decoupled overworld/dungeon model (ADR 0008 Stage 2): the OVERWORLD
  // is the seamless region (mouth POI, no gate wall) and the dungeon is its OWN grid (genDungeon).
  // DATA-DRIVEN (Silverwood Overhaul, B1) — a small set of migrated zone ids, not `zoneIndex===0`, so a
  // zone joins the new model by id without touching the gate-on-zoneIndex branches. Greenvale + Silverwood
  // are migrated; the rest stay on the LEGACY combined-grid path (genCombined) until they migrate.
  usesNewModel(): boolean { return NEW_MODEL_ZONES.has(this.zone().id); },
  // Has this zone's OVERWORLD dungeon-mouth guard (the zone mini-boss) been beaten? PER-ZONE (the
  // seamless big map hosts several new-model zones at once; a single global boolean would unlock every
  // zone's mouth at once). The single read every mouth-gating site goes through, so they stay in lockstep.
  miniClearedFor(zoneId: string): boolean { return !!this.mouthCleared[zoneId]; },
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
    this.ownedCaps = new Set(); // fresh run — no traversal caps owned (the gorge stays locked until the Warren falls; a resume restores the set AFTER init())
    this.wayfinding = emptyProgress(); // fresh run — nothing known/entered yet (a resume restores it AFTER init())
    this.mouthCleared = {}; // fresh run — every zone's overworld mouth guard stands (a resume restores the saved set AFTER init())
    this._gorgeCrossed = false; // the one-time "you raft across" callout hasn't fired this session yet
    this.resize();
    this.loadTiles();
    this.genMap(); // sets spawn (px/py) from the zone layout
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.hint();
    this.draw();
    window.addEventListener("resize", () => { this.resize(); this.draw(); });
    // returning to the tab restarts the ambient loop (it self-stops while hidden to save battery)
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.draw(); });
    this.setupPointerWalk();
  },

  // TAP / PRESS-AND-HOLD to walk on the field canvas. The sole movement control in the installed app
  // (the d-pad is hidden there); a bonus alongside the d-pad/keys in a browser tab. Press toward where
  // you want to go (relative to the centred player): a tap steps once, holding keeps walking, and
  // dragging re-aims. Routes through move(), so its dialogue/overlay/passability guards all apply.
  setupPointerWalk(): void {
    const cv = this.canvas; if (!cv) return;
    let dir: [number, number] | null = null, timer = 0;
    const STEP_MS = 150;
    const aim = (cx: number, cy: number): [number, number] => {
      const r = cv.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return [0, 0]; // centre dead-zone
      return Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx) as number, 0] : [0, Math.sign(dy) as number];
    };
    const stop = () => { dir = null; if (timer) { clearInterval(timer); timer = 0; } };
    cv.addEventListener("pointerdown", (e) => {
      if (Dialogue.isOn()) { Dialogue.advance(); return; } // tap advances NPC dialogue
      if (Overlay.isOn()) return;
      const d = aim(e.clientX, e.clientY);
      if (!d[0] && !d[1]) return;
      e.preventDefault(); cv.setPointerCapture?.(e.pointerId);
      dir = d; this.move(d[0], d[1]);
      timer = window.setInterval(() => { if (dir) this.move(dir[0], dir[1]); }, STEP_MS);
    }, { passive: false });
    cv.addEventListener("pointermove", (e) => { if (dir) { const d = aim(e.clientX, e.clientY); if (d[0] || d[1]) dir = d; } });
    cv.addEventListener("pointerup", stop);
    cv.addEventListener("pointercancel", stop);
    cv.addEventListener("pointerleave", stop);
  },
  openMore(): void { $("#moreSheet")?.classList.add("on"); $("#moreScrim")?.classList.add("on"); },
  closeMore(): void { $("#moreSheet")?.classList.remove("on"); $("#moreScrim")?.classList.remove("on"); },
  // advance to a new zone (party/gold/inventory persist; zone progress + boss flags reset)
  loadZone(i: number): void {
    this.zoneIndex = i; Game.bossDefeated = false; Game.miniBossDefeated = false; this.enteredDungeon = false;
    const zid = ZONES[i]?.id; if (zid) delete this.mouthCleared[zid]; // a fresh entry → this zone's mouth guard stands again
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
    this.vw = w; this.vh = h;
    // RETINA: back the canvas at device resolution and draw in CSS px (ctx scaled by DPR), so the
    // painterly tiles stay crisp on a hi-DPI phone instead of upscaling a low-res buffer. DPR capped
    // at 3 to bound the backing-store memory. (Mirrors the minimap's correct DPR handling.)
    if (this.canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      this.canvas.style.width = w + "px"; this.canvas.style.height = h + "px";
      this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
      if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw coords stay in CSS px
    }
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
  // Build a ClearedState for `systems/mapgen` from the run's persisted per-context sets. `zoneId` keys
  // the POI/chest cleared-state; `ctx` ("ow" overworld | a floor index) scopes a chest key; the
  // mini/floor-mini flags drive the mouth/gate tiles. The controller owns these sets (persisted in the
  // save); mapgen stays pure by consuming the predicates, not the controller `this`.
  clearedFor(zoneId: string, ctx: "ow" | number, opts: { miniCleared?: boolean; floorMiniBeaten?: boolean } = {}): ClearedState {
    return {
      poiSpent: (poi) => !!this.poisCleared[this.poiKey(zoneId, poi.x, poi.y)],
      chestOpened: (c) => !!this.openedChests[this.chestKey(zoneId, ctx, c.x, c.y)],
      miniCleared: !!opts.miniCleared,
      floorMiniBeaten: !!opts.floorMiniBeaten,
      restSpent: (p) => !!this.poisCleared[this.poiKey(zoneId + ":d" + this.dungeonFloor, p.x, p.y)],
    };
  },
  // Assign a mapgen GenResult onto the controller's run state (grid + spawn/anchors). Behaviour-preserving:
  // mirrors what the inline generators set on `this` before the extraction (skill §1/§2 — pure gen, DOM wire).
  applyGen(r: GenResult): void {
    this.map = r.map; this.W = r.W; this.H = r.H;
    this.px = r.spawn.x; this.py = r.spawn.y;
    this.gate = r.gate; this.boss = r.boss;
    if (r.mouth) this.mouth = r.mouth;
    this.chests = r.chests; this.lairAt = r.lairAt; this.pois = r.pois;
  },

  // LEGACY combined grid (Silverwood/Duskmarsh): thin wrapper over the pure `genCombined` — build the
  // cleared-state, generate, wire the result onto the controller. The dungeon's combined boss is in the
  // EAST half; POIs/chests key off the zone id (overworld "ow" context).
  genCombined(): void {
    this.townMode = false; this.mode = "overworld";
    const z = this.zone();
    this.applyGen(genCombined(z.layout, z.dungeon.layout, this.clearedFor(z.id, "ow")));
  },

  // ── ADR 0008 Stage 2 (step 3): the OVERWORLD-only grid (no dungeon, no gate wall) — the seamless
  // region. Thin wrapper over the pure `genOverworld`; the mouth tile reads "mouth"/"miniboss" off the
  // zone's per-zone mouth-cleared flag. Greenvale only for now.
  genOverworld(regionId: string): void {
    this.townMode = false;
    const z = ZONES.find((zz) => zz.id === regionId) ?? this.zone();
    this.applyGen(genOverworld(z, this.clearedFor(z.id, "ow", { miniCleared: this.miniClearedFor(z.id) })));
  },

  // ── ADR 0008 Stage 2/3 (step 3): build ONE FLOOR of the zone's DUNGEON as its own grid. Thin wrapper
  // over the pure `genDungeon` — pick the floor, build the floor-scoped cleared-state, generate, wire on.
  // Sets mode="dungeon". MULTI-FLOOR: an intermediate floor carries a `stairsDown` (gated by its
  // `miniboss`); the LAST floor carries the zone `boss`. Single-floor dungeons run a 1-element stack.
  genDungeon(zoneIndex: number, floorIdx = 0): void {
    this.townMode = false;
    this.mode = "dungeon";
    const floors = this.dungeonFloors(zoneIndex);
    this.dungeonFloor = clamp(floorIdx, 0, floors.length - 1);
    const last = this.dungeonFloor >= floors.length - 1;
    const D = floors[this.dungeonFloor];
    const dunZid = ZONES[zoneIndex]?.id ?? this.zone().id;
    const cleared = this.clearedFor(dunZid, this.dungeonFloor, { floorMiniBeaten: !!this.dungeonMiniCleared[this.dungeonFloor] });
    this.applyGen(genDungeon(D, last, cleared));
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
    this.glideFrom(this.px, this.py); // smooth-step: camera/walker glide to the new tile (visual only)
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
      if (!this.miniClearedFor(this.zone().id)) { this.startMiniBoss(); return; }
    }
    if (cell === "mouth") { this.descend(); return; }        // step onto the cleared mouth → into the dungeon
    if (cell === "stairsdown") { if (this.stairsOpen()) this.descendFloor(); return; } // descend a floor
    if (cell === "stairsup") { this.ascendFloor(); return; } // climb a floor (or out on floor 0)
    if (cell === "village") { const h = this.zone().hub; if (h) Game.confirmEnterTownVisit(h); return; } // step onto the village → confirm, then into the zone's hub
    if (cell === "chest") { this.openChest(nx, ny); return; } // a chest doesn't also trigger a fight
    if (cell === "rest") { this.restAt(nx, ny); return; }     // a dungeon campfire (breather full-heal, once)
    if (cell === "rubble") { this.collapseAt(nx, ny); return; } // the Warren collapse: one-way drop shortcut
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
    // PER-ZONE mouth-cleared: mark THE CURRENT ZONE's overworld mouth guard beaten (the seamless big map
    // hosts several zones at once, so this MUST be keyed by zone id — a global flag would open every
    // zone's mouth at once). buildAuthoredGrid + the discrete genOverworld now both read this per-zone
    // flag, so a rebuilt grid (a reload, a chunk re-realize) keeps THIS zone open without touching others.
    this.mouthCleared[this.zone().id] = true;
    if (this.usesNewModel()) {
      // Open the dungeon mouth. The BIG MAP realizes the gate from the AUTHORED GRID via cached chunks,
      // so flip the authored cell AND drop the chunks so it re-realizes as "mouth" — writing this.map
      // alone never reaches the big-map path (that was the bug: a beaten gate stayed "miniboss", so
      // stepping on it neither re-fought nor descended). Also flip this.map for the discrete grid.
      const zid = this.zone().id, g = this.authoredGrids[zid];
      if (g && g[this.mouth.y]) g[this.mouth.y][this.mouth.x] = "mouth";
      if (this.map[this.mouth.y]) this.map[this.mouth.y][this.mouth.x] = "mouth";
      if (this.bigMap) { this.chunks.clear(); this.realizeAround(); }
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
    // Postcondition of ascend() is "the player is now on the overworld FIELD". Usually it's called while
    // already on the field (stepping onto a floor-0 up-stair → a no-op switch), but the ZONE-BOSS victory
    // path calls it from the BATTLE screen (game.afterZoneBoss), so it MUST switch screens — otherwise
    // dismissing the spoils/“Warren falls” overlays reveals the finished battle screen and strands the
    // player (the reported stuck-after-loot bug). Show the field before rebuilding the grid.
    Screens.show("field");
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
      for (const id of this.bigBuiltZoneIds()) this.authoredGrids[id] = buildAuthoredGrid(id, this.miniClearedFor(id));
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
  enterBigMap(startZone?: string): void {
    // Default to the CURRENT zone (so loadZone(i) → genMap → enterBigMap drops at zone i, not always
    // Greenvale — that bug sent zone-advance back to the start). Fresh start: zoneIndex 0 = greenvale.
    const start = startZone ?? ZONES[this.zoneIndex]?.id ?? "greenvale";
    this.townMode = false; this.mode = "overworld"; this.bigMap = true;
    this.authoredGrids = {};
    for (const id of this.bigBuiltZoneIds()) {
      this.authoredGrids[id] = buildAuthoredGrid(id, this.miniClearedFor(id));
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
    const z = ZONES.find((zz) => zz.id === start) ?? ZONES[0];
    const pl = placementOf(start)!, L = z.layout;
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
      if (zi >= 0 && zi !== this.zoneIndex) this.zoneIndex = zi;
      // Keep this.mouth/gate synced to the CURRENT zone's layout EVERY time we're over a built zone —
      // NOT only on a zone CHANGE. A run starts already in zone 0 (greenvale, the default zoneIndex), so
      // the change-guard above never fires on entry; without this the stale DEFAULT mouth (field.ts:151,
      // the old (40,12)) persisted, and once the Greenvale mouth was relocated to (35,20), ascend() —
      // which returns the player to `this.mouth` — dropped them at the wrong tile north of the real mouth
      // (the reported "Bandit Warren entrance is messed up / came out displaced" bug). Cheap object copy,
      // off the per-frame path (syncZoneFromWorld runs per move).
      const L = this.zone().layout;
      this.mouth = { ...L.mouth }; this.gate = { ...L.mouth };
      // WAYFINDING (ADR 0011): mark this zone ENTERED (reveals it on the overview map) and SEED the next
      // spine zone as KNOWN so the overview points AHEAD (entering Greenvale reveals Silverwood — the
      // "world told you where to go" reveal Maelis voices). Seeding on entry is what BOOTSTRAPS the reveal:
      // a `travel` Objective only arises once a region is already known, so without this seed known would
      // never outgrow entered and the overview could only ever show where you'd already stood. Pure
      // systems/progress; idempotent.
      markRegionEntered(this.wayfinding, builtId);
      const next = zi >= 0 ? ZONES[zi + 1] : undefined; // spine-successor heuristic (a future Quest could refine)
      if (next) markRegionKnown(this.wayfinding, next.id);
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
        let kind = realizeKindWorld(OVERWORLD_ID, this.authoredGrids, wx, wy);
        // TRAVERSAL BARRIER (D2): while LOCKED, the barrier band reads as its impassable terrain kind
        // (the "gorge" chasm) so the wall is LEGIBLE — "see it now, reach it later" — even where the
        // realizer would paint open continent. Once the cap is owned the band reverts to its realized
        // kind (grass / crossing). Passability is governed by traversalBlocks (consulted in bigPassable),
        // not by this dressing, so the crossing tiles stay walkable once unlocked.
        const bar = barrierAt(OVERWORLD_ID, wx, wy);
        if (bar && !this.ownedCaps.has(bar.cap)) kind = bar.terrainKind;
        // D3 — once UNLOCKED, the put-in/take-out tiles read as a RAFT/PLANK CAUSEWAY ("crossing"), the
        // legible "way across", rather than reverting to bare open-continent grass. Walkable (not a wall).
        else if (bar && isBarrierCrossing(bar, wx, wy)) kind = "crossing";
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
    const viewW = this.vw ? Math.ceil(this.vw / t) : 13;
    const viewH = this.vh ? Math.ceil(this.vh / t) : 9;
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

  // Big-map passability: a TRAVERSAL BARRIER first (cheap point-in-rect; the gorge band is impassable
  // until the "gorge" cap is owned, crossing tiles passable), THEN the realized cell (uncharted + the
  // field walls block). The barrier check goes BEFORE cellAt so a locked band blocks even where the
  // realizer would paint open ground (D2 — the macro soft-gate sits in the open continent between cores).
  bigPassable(wx: number, wy: number): boolean {
    if (traversalBlocks(OVERWORLD_ID, wx, wy, this.ownedCaps)) return false;
    const cell = this.cellAt(wx, wy);
    return cell.kind !== "uncharted" && !FIELD_WALLS.has(cell.kind);
  },
  // Grant a traversal capability to the run (the Warren/Kingpin clear grants "gorge"); persists on the
  // next save. Idempotent. Re-realizes the chunk ring so a now-open band stops drawing as a wall.
  grantTraversalCap(cap: Capability): void {
    grantCap(this.ownedCaps, cap);
    if (this.bigMap) { this.chunks.clear(); this.realizeAround(); }
  },

  // The Area encounter-lean the player currently stands in (big-map) — drives pickAreaSet.
  bigLean(): string { return this.cellAt(this.wx, this.wy).lean; },

  // Big-map movement: walk in world coords, trigger the same POI flow off the realized cell's kind.
  bigMove(dx: number, dy: number): void {
    const nx = this.wx + dx, ny = this.wy + dy;
    if (!this.bigPassable(nx, ny)) return;
    this.glideFrom(this.wx, this.wy); // smooth-step: camera/walker glide to the new tile (visual only)
    this.wx = nx; this.wy = ny; this.step++;
    this.realizeAround();      // realize-on-move (never in draw)
    this.syncZoneFromWorld();  // POSITION-DERIVED state (zone/bands/music) — the no-loadZone crossing
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.cellAt(nx, ny);
    // PER-ZONE mouth guard: gate on the zone UNDER THE PLAYER (syncZoneFromWorld just locked zoneIndex to
    // it), not a global flag — else clearing Greenvale's guard would skip Silverwood's Elder-Treant fight
    // and strand the Sunless Grove (the seamless-map soft-lock this overhaul fixes).
    if (cell.kind === "miniboss" && !this.miniClearedFor(this.zone().id)) { this.startMiniBoss(); return; }
    if (cell.kind === "mouth") { this.descend(); return; }
    if (cell.kind === "village") { const h = this.zone().hub; if (h) Game.confirmEnterTownVisit(h); return; } // step onto the village → confirm, then into the zone's hub
    if (cell.kind === "chest") { this.openBigChest(nx, ny); return; }
    if (cell.kind === "lair") { this.enterBigLair(nx, ny); return; }
    if (POI_KINDS.has(cell.kind)) { this.touchBigPoi(nx, ny); return; } // shrine / camp / landmark / signpost
    // D3 USE-FEEDBACK: the FIRST step onto a now-unlocked gorge crossing fires a one-time callout (reuses
    // the pickup-callout overlay style). The crossing stays walkable — this never blocks the step.
    if (cell.kind === "crossing" && !this._gorgeCrossed) {
      this._gorgeCrossed = true;
      Overlay.show(`<h2 class="title-gold">The Sunless Gorge</h2><p class="small">You haul the raft to the put-in and push off across the Sunless Gorge — the chasm that turned you back, now crossed. Silverwood waits on the far rim.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Cross</button></div>`);
      return;
    }
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
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4);
    const it = rollItemAtLevel(CHEST_LEVEL(this.zoneIndex, this.progress()), undefined, ilvl, undefined, DROP_MODS.chest); // level-banded rarity (+treat ceiling), EQUAL across classes (Dara)
    Game.inventory.push(it); Telemetry.drop(it.rarity);
    Game.saveNow?.(); // persist the opened-chest record (mirrors the POI clear path)
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Treasure!</h2>${itemHtml(it)}<div class="row"><button class="btn gold" onclick="Overlay.hide()">Take it</button></div>`);
  },
  // The rare-monster den in big-map space (Hogger): consume it, then start the solo rare fight.
  enterBigLair(wx: number, wy: number): void {
    this.cellAt(wx, wy).kind = "grass";
    const a = authoredAt(wx, wy); if (a && this.authoredGrids[a.zoneId]) this.authoredGrids[a.zoneId][a.ly][a.lx] = "grass";
    const key = this.eligibleRares()[0] || null;
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
  // Thin wrapper over systems/encounter.rollEncounter (the pure composition the sim shares): build the
  // ctx from controller state, then do the DOM/flow (Battle.begin). AREA LEAN (ADR 0009 exemplar): the
  // current Area's favour table biases WHICH of the depth band's balanced sets we draw — same band,
  // same pool, only the COMPOSITION shifts.
  rollEncounter(): void {
    const enc = rollEncounter({
      bands: this.zone().bands,
      progress: this.progress(),
      inDungeon: this.inDungeon(),
      dungeonFloor: this.dungeonFloor,
      zoneIndex: this.zoneIndex,
      rareKeys: this.eligibleRares(),
      fav: this.currentFavour(),
    });
    Battle.begin(enc.keys, this.envFor(this.progress()), false, false, enc.depth, enc.champIdx);
  },
  /** Ultra-rare keys eligible (and present in the bestiary) for the current zone. */
  eligibleRares(): string[] {
    return RARE_MONSTERS.filter((r) => r.zones.includes(this.zoneIndex) && ENEMIES[r.key]).map((r) => r.key);
  },
  /** The favour table (enemyKey → weight) for the Area under the player, or undefined for a plain pick. */
  currentFavour(): Record<string, number> | undefined {
    const lean = this.currentLean();
    return lean ? LEAN_FAVOUR[lean] : undefined;
  },
  // The hidden rare-monster lair (Greenvale: Hogger). Stepping in starts a solo rare fight; the
  // den is consumed so it's a one-time reward for the explorer (re-cleared each visit to the zone).
  enterLair(x: number, y: number): void {
    this.map[y][x] = "grass";
    const key = this.eligibleRares()[0] || null; // first eligible rare = the den's named beast
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
        : pickAreaSet(this.zone().bands[Math.min(1, this.zone().bands.length - 1)].sets, this.currentFavour()).slice();
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
    const ilvl = 2 + this.zoneIndex * 6 + Math.round(this.progress() * 4); // a higher item level deeper in
    const it = rollItemAtLevel(CHEST_LEVEL(this.zoneIndex, this.progress()), undefined, ilvl, undefined, DROP_MODS.chest); // level-banded rarity (+treat ceiling), EQUAL across classes (Dara)
    Game.inventory.push(it); Telemetry.drop(it.rarity);
    Game.saveNow?.(); // persist the opened-chest record (mirrors the POI clear path)
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Treasure!</h2>${itemHtml(it)}<div class="row"><button class="btn gold" onclick="Overlay.hide()">Take it</button></div>`);
  },
  // DUNGEON REST NODE (skill §1 breather, ADR 0010): a rest tile that applies THIS dungeon's TAILORED
  // reprieve ONCE per visit, then spends (reverts to floor). Deliberately partial + themed — never a full
  // heal (a full HP+MP refill every floor trivialises the game — Dara); caves carry no reprieve so they
  // never get a rest tile. Keyed per-FLOOR in poisCleared (namespaced "<zoneId>:d<floor>" so a B1/B2 fire
  // at the same x,y can't collide). A spent fire is already carved as floor by genDungeon, so this only
  // fires on a live one. If a layout authored a rest with NO reprieve (a content bug), it's a no-op beat.
  restAt(x: number, y: number): void {
    const key = this.poiKey(this.zone().id + ":d" + this.dungeonFloor, x, y);
    this.poisCleared[key] = true;
    this.map[y][x] = "path";
    const rep = this.curFloor().reprieve;
    if (rep) applyReprieve(Game.party, rep);
    this.draw(); this.hint(); Game.saveNow?.();
    const title = rep?.name ?? "A Quiet Beat";
    const body = rep?.blurb ?? "You catch your breath a moment before pressing on.";
    Overlay.show(`<h2 class="title-gold">${title}</h2><p class="small">${body}</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
  },
  // THE WARREN COLLAPSE (skill §4 gimmick / §2 shortcut): stepping onto a `rubble` tile caves the floor in
  // and drops the player to its paired landing — a ONE-WAY shortcut (no fight, no soft-lock; the landing is
  // always carved walkable + a flood target). Reuses the floor's authored `drops`. Re-arms the encounter
  // counter so the drop isn't a free-step exploit, and redraws/centres on the landing.
  collapseAt(x: number, y: number): void {
    const drop = (this.curFloor().drops ?? []).find((d) => d.x === x && d.y === y);
    if (!drop) { this.map[y][x] = "path"; return; } // defensive: a stray rubble tile is just floor
    this.px = drop.to.x; this.py = drop.to.y;
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">The floor gives way!</h2><p class="small">Rotten boards crack underfoot — you crash through a collapse and tumble down a level, landing in a cloud of dust somewhere you've been.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Pick yourself up</button></div>`);
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
    else if (!this.miniClearedFor(z.id) && p >= 0.38) msg = `A ${miniNm} guards the mouth of ${z.dungeon.name}.`;
    else if (this.usesNewModel() && this.miniClearedFor(z.id) && p >= 0.7) msg = `Step onto the mouth of ${z.dungeon.name} to descend.`;
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
    const tt = this.town?.theme ? TOWN_THEMES[this.town.theme] : undefined; // Aurelion per-town bespoke tileset
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
    let g = tt ? (isWall || onSoft ? tt._b : tt._a) : isWall ? (city ? "town-cobble" : marsh ? "town-bog" : "town-grass") : city ? cityGround : marsh ? (onSoft ? "town-bog" : "town-plank") : (onSoft ? "town-grass" : "town-cobble");
    if (!tt && g === "town-cobble" && (mx * 7 + my * 13) % 4 === 0 && T["town-cobble2"]) g = "town-cobble2";
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
      const img = T[(tt && tt[cell]) || poi[0]];
      if (img) { const h = t * poi[2], w = h * (img.width / img.height); c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.95 - h, w, h); }
      else { c.font = `${t * (poi[2] < 1 ? 0.5 : 0.74)}px serif`; c.fillText(poi[1], sx + t / 2, sy + t / 2); }
      // BUFFER the caption — drawn in the final label pass so the next row's tiles can't cover it.
      if (poi[3]) this._townLabels.push({ text: poi[3], x: sx + t / 2, y: sy + t * 1.02, f: Math.max(9, t * 0.26) });
    } else if (isWall) {
      // The perimeter is a PALISADE, not a row of emoji. Marsh = dead-timber stakes (town-deadtree),
      // shire = a hedge/treeline (town-tree); both are already painted. City rings itself in stone —
      // a layered stone-block fill (no art needed) reads as a curtain wall. Sprites are bottom-anchored
      // and slightly overscaled so adjacent cells overlap into a continuous wall.
      const wkey = tt ? tt.twall : marsh ? "town-deadtree" : city ? "" : "town-tree";
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
  // ── biome→ground dressing + the passability-grammar / setpiece DRAW PRIMITIVES now live in
  // ui/fieldRender (pure, ctx+data in, pixels out); the draw loops below call FR.* with the controller
  // state threaded in. Kept here: poiNameAt (resolves a POI name by coord) + drawGorgeRimProps (reads
  // ownedCaps / barrier data — stateful, stays in the controller).

  // The POI name at a tile (discrete: this.pois; big-map: the authored layout via authoredAt) — fed to
  // FR.drawPoiCell. Stays in the controller (it reads this.pois / world authored data).
  poiNameAt(wx: number, wy: number, big: boolean): string {
    if (big) { const a = authoredAt(wx, wy); if (a) { const z = ZONES.find((zz) => zz.id === a.zoneId); const p = z?.layout.pois?.find((q) => q.x === a.lx && q.y === a.ly); if (p) return p.name; } }
    return this.poiAt(wx, wy)?.name ?? "";
  },
  // `wet` neighbour-probe for FR.drawRecessedWater on the BIG MAP (reads the chunk cache).
  bigWet(gx: number, gy: number): boolean { const k = this.cellAt(gx, gy).kind; return k === "water" || k === "river"; },
  // The OPTIONAL flag for a zone's mouth label (spine vs side zone) — fed to FR.drawMouthLabel.
  mouthOptional(zoneId: string): boolean { return OPTIONAL_ZONES.has(zoneId); },

  // GORGE-RIM PROPS (ADR 0011 lock-before-key, level-designer; west-arm re-placement 2026-06-25). The
  // "Silverwood lies east, the chasm bars the way" cue is an OPEN-CONTINENT prop, NOT a core-bound POI:
  // Greenvale's authored grid ends ~world x190, and the WEST CHASM ARM (band rect {x0:192,y0:66,x1:206,
  // y1:86}) now fingers into Greenvale's eastern play-space, so the locked player walking east DEAD-ENDS
  // at the arm's west face (first chasm tile x192 → last walkable tile x191) on the spawn row y72, long
  // before the old crossing-extent put-in at ~(205,72) — which is itself INSIDE the arm now and never
  // seen. So while LOCKED the lookout/signpost must sit at the ARM'S WEST RIM, the spot the player
  // actually stops; the Elder-Oak (≈280,46) reads across the chasm to the NE. Once UNLOCKED the arm/band
  // open and the crossing-causeway at y72 carries the read, so the put-in marker reverts to the crossing
  // extents. Purely visual — never touches passability (world.ts/barrierBlocks own the walls + route).
  // Coords are DERIVED from the barrier data (band rects + crossing) so they track world.ts, no magic
  // numbers. Returns true if it drew a captioned prop at (wx,wy).
  drawGorgeRimProps(c: CanvasRenderingContext2D, wx: number, wy: number, sx: number, sy: number, t: number): boolean {
    if (this.ownedCaps.has("gorge")) return false;            // unlocked → the crossing/causeway reads instead
    // A rim tile is OPEN CONTINENT just outside the chasm band; probe the adjacent tiles for the gorge
    // barrier so we can derive its band/crossing extents (cheap; the band is small + this is off the hot path).
    const gorge = [barrierAt(OVERWORLD_ID, wx + 1, wy), barrierAt(OVERWORLD_ID, wx - 1, wy),
                   barrierAt(OVERWORLD_ID, wx, wy + 1), barrierAt(OVERWORLD_ID, wx, wy - 1)]
      .find((b) => b?.cap === "gorge");
    if (!gorge) return false;
    const xs = gorge.crossing.map((p) => p.x), ys = gorge.crossing.map((p) => p.y);
    const cy = ys[0], maxX = Math.max(...xs);
    // WEST RIM of the chasm at the crossing latitude cy: the westmost band rect that spans cy is the arm
    // finger reaching into Greenvale; its west face (rect.x0) is the first chasm tile, so the last walkable
    // Greenvale-side tile is rect.x0 - 1 — exactly where the east approach dead-ends. Derived, not hardcoded.
    const armWestFace = Math.min(...gorge.band.filter((r) => cy >= r.y0 && cy < r.y1).map((r) => r.x0));
    let label = "";
    if (wy === cy && wx === armWestFace - 1) label = "Silverwood — the Sunless Gorge bars the way ⟶"; // arm's west rim (dead-end)
    else if (wy === cy && wx === maxX + 1) label = "Silverwood Shore"; // far rim take-out (landfall) — reads across
    if (!label) return false;
    // signpost glyph (reuse the POI signpost emoji until art lands) + a gold caption — on-brand gold-on-dark.
    c.font = `${t * 0.7}px serif`; c.fillText("🪧", sx + t / 2, sy + t / 2);
    c.save();
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `bold ${Math.max(9, t * 0.24)}px system-ui`;
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
    const ly = sy + t * 1.02;
    c.strokeText(label, sx + t / 2, ly); c.fillText(label, sx + t / 2, ly);
    c.restore();
    return true;
  },

  // drawStairs / drawTreasureMark / drawDungeonBoss are now pure FR.* primitives (ui/fieldRender); the
  // boss marker is called with the throne sprite + Game.bossDefeated threaded in from the controller.

  // BIG-MAP draw: iterate the WORLD-TILE viewport from the chunk cache (never calling regionAt).
  // Camera centers on the player's world tile and is clamped to the world extent (placement keeps
  // the player far from the 0/960 edges, so the clamp is effectively a no-op here). Dressing is read
  // from each cell's cached biome (+ seam dither), so Area seams visibly dither as you roam.
  drawBig(): void {
    const c = this.ctx, t = this.tile, T = this.tiles;
    if (!c || !this.canvas) return;
    c.clearRect(0, 0, this.vw, this.vh);
    const viewW = Math.ceil(this.vw / t), viewH = Math.ceil(this.vh / t);
    const now = performance.now(); // one frame clock: water shimmer + motes + glide all share it
    // fractional camera on the glide position (world coords, unclamped — the world is huge): integer
    // tile origin + sub-tile pixel offset, so the continent scrolls smoothly under the walker.
    const vp = this.glidePos(this.wx, this.wy);
    const camfx = vp.x - Math.floor(viewW / 2), camfy = vp.y - Math.floor(viewH / 2);
    const camx = Math.floor(camfx), camy = Math.floor(camfy);
    const sox = Math.round((camfx - camx) * t), soy = Math.round((camfy - camy) * t);
    c.textAlign = "center"; c.textBaseline = "middle";
    for (let y = 0; y <= viewH + 1; y++) for (let x = 0; x <= viewW + 1; x++) {
      const wx = camx + x, wy = camy + y, sx = x * t - sox, sy = y * t - soy;
      const cell = this.cellAt(wx, wy);
      if (cell.kind === "uncharted") { c.fillStyle = "#10180e"; c.fillRect(sx, sy, t, t); continue; } // soft edge
      // seam dither: a hair of the cell is rendered in the neighbouring Area's biome (the cached choice).
      const biome = cell.dither ?? cell.biome;
      const { ground, flat } = FR.bigGround(T, biome, cell.kind, cell.variant);
      const gimg = T[ground];
      if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1);
      else {
        // D3 WALKABLE FLOOR (figure/ground): the floor is the calm receding "ground" — render it LIT + FLAT
        // with only LOW-CONTRAST value-noise so it reads as living grass/moss/dirt MATERIAL, never a grid,
        // never near-black. (Removed the forest-darkening overlay + the high-contrast checkerboard dither
        // that made the overworld a muddy dark grid.) Darkness is reserved for walls/recesses (D4/D5), which
        // overdraw this fill below. The noise is a cheap deterministic hash of (wx,wy) → a ±small value tint.
        c.fillStyle = flat; c.fillRect(sx, sy, t, t);
        if (!FIELD_WALLS.has(cell.kind) && cell.kind !== "gorge") {
          const n = ((wx * 73856093) ^ (wy * 19349663)) >>> 0;        // hash → cheap value-noise
          const v = ((n % 5) - 2) * 3;                                 // ±6 max, low-contrast material grain
          c.fillStyle = v >= 0 ? `rgba(255,250,235,${v / 60})` : `rgba(0,0,0,${-v / 90})`; // warm lift / faint shade
          c.fillRect(sx, sy, t, t);
        }
      }
      // EDGE AO: contact shading where a floor tile meets a raised solid — grounds the tree walls /
      // cliffs (D4) to the floor plane and kills the flat grid read. Recessed kinds own their edges (D5).
      if (!FIELD_WALLS.has(cell.kind) && cell.kind !== "water" && cell.kind !== "river" && cell.kind !== "gorge") {
        const solidW = (gx: number, gy: number): boolean => FIELD_WALLS.has(this.cellAt(gx, gy).kind);
        FR.edgeShade(c, sx, sy, t, solidW(wx, wy - 1), solidW(wx, wy + 1), solidW(wx - 1, wy), solidW(wx + 1, wy));
      }
      // object / scatter sprites (emoji fallback) — biome-skinned.
      c.font = `${t * 0.82}px serif`;
      const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
        if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
        else c.fillText(emoji, sx + t / 2, sy + t / 2);
      };
      // D4 RAISED solid (tree/cliff-prop): a cast shadow on the floor, then the sprite drawn OVERSIZED +
      // bottom-anchored so it overhangs the tile below and stands UP off the floor (the player's own
      // tall-sprite + foot-shadow language, :2010+). Works for real sprites AND the emoji fallback.
      const tall = (img: HTMLImageElement | undefined, emoji: string, sc = 1.45, shadow = 0.34) => {
        FR.castShadow(c, sx, sy, t, 0.34, shadow);
        if (img) {
          const h = t * sc, w = h * (img.width / img.height), ay = sy + t * 0.86 - h;
          c.drawImage(img, sx + t / 2 - w / 2, ay, w, h);
        } else {
          c.font = `${t * sc}px serif`; c.textBaseline = "alphabetic";
          c.fillText(emoji, sx + t / 2, sy + t * 0.9); c.textBaseline = "middle"; c.font = `${t * 0.82}px serif`;
        }
      };
      const dset = DUNGEON_SETS[this.zoneIndex] || DUNGEON_SETS[0];
      if (cell.kind === "chest") obj(T.chest, "📦", 0.8);
      else if (cell.kind === "lair") obj(T.lair, "🕳️", 0.85);
      else if (cell.kind === "mouth") { obj(T[`${dset}-entrance`], "🚪", 0.95); FR.drawMouthLabel(c, sx, sy, t, this.zone().dungeon.name, this.mouthOptional(this.zone().id)); }
      else if (cell.kind === "village") {
        obj(T["town-inn"], "🏘️", 0.95);
        const zid = authoredAt(wx, wy)?.zoneId, hub = zid ? ZONES.find((z) => z.id === zid)?.hub : undefined;
        const nm = hub ? settlement(hub).name : "Town";
        c.save(); c.textAlign = "center"; c.textBaseline = "middle";
        c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
        const ly = sy + t * 1.04; c.strokeText(nm, sx + t / 2, ly); c.fillText(nm, sx + t / 2, ly); c.restore();
      }
      else if (cell.kind === "miniboss") {
        const zid = authoredAt(wx, wy)?.zoneId, z = zid ? ZONES.find((zz) => zz.id === zid) : undefined;
        const g = this.mob((z ?? this.zone()).mini);
        if (g) FR.drawMob(c, g, sx, sy, t); else obj(undefined, "🪖", 0.85);
        FR.drawMouthLabel(c, sx, sy, t, this.zone().dungeon.name, this.mouthOptional(this.zone().id), true);
      }
      else if (POI_KINDS.has(cell.kind)) FR.drawPoiCell(c, T, cell.kind, this.poiNameAt(wx, wy, true), sx, sy, t); // captioned landmark
      else if (cell.kind === "cliff") { if (T.cliff) FR.castShadow(c, sx, sy, t, 0.34, 0.32); else FR.drawCliffFace(c, sx, sy, t); } // D4 RAISED face
      else if (cell.kind === "river") FR.drawRecessedWater(c, wx, wy, sx, sy, t, (gx, gy) => this.bigWet(gx, gy), now); // D5 RECESSED watercourse (over flat OR sprite)
      else if (cell.kind === "gorge" && !T.gorge) {
        // D3 LEGIBLE GORGE (placeholder until art-integrator slices a ravine sprite — flagged in the
        // hand-back). The flat already laid the DARK chasm floor (#0f1622); add a lighter ROCKY RIM on the
        // band's outward faces so it reads as a sheer ravine you walk UP TO, not bare dark ground. A barrier
        // tile whose orthogonal neighbour is NOT gorge is a rim edge → draw a pale rock lip on that side.
        const isGorge = (gx: number, gy: number) => barrierAt(OVERWORLD_ID, gx, gy)?.terrainKind === "gorge" && !this.ownedCaps.has("gorge");
        c.fillStyle = "#3a4250"; // pale rim rock
        const lip = Math.max(2, t * 0.2);
        if (!isGorge(wx, wy - 1)) c.fillRect(sx, sy, t, lip);                 // north rim
        if (!isGorge(wx, wy + 1)) c.fillRect(sx, sy + t - lip, t, lip);       // south rim
        if (!isGorge(wx - 1, wy)) c.fillRect(sx, sy, lip, t);                 // west rim (the Greenvale-side face)
        if (!isGorge(wx + 1, wy)) c.fillRect(sx + t - lip, sy, lip, t);       // east rim
        // a hint of jagged depth in the chasm interior
        if ((wx + wy) % 2) { c.fillStyle = "rgba(0,0,0,.45)"; c.fillRect(sx + t * 0.35, sy + t * 0.3, Math.max(1, t * 0.12), t * 0.5); }
      }
      else if (cell.kind === "crossing" && !T.crossing) {
        // D3 RAFT/PLANK CAUSEWAY (placeholder). The flat laid plank-brown; add cross-planks so it reads as
        // a deliberate raft span "the way across", distinct from the dark chasm + the bare grass beyond.
        c.fillStyle = "rgba(0,0,0,.3)";
        for (let py = 0; py < 3; py++) c.fillRect(sx, sy + py * t * 0.36 + t * 0.1, t, Math.max(1, t * 0.08));
        c.fillStyle = "rgba(214,180,110,.5)"; c.fillRect(sx, sy, Math.max(1, t * 0.1), t); c.fillRect(sx + t - Math.max(1, t * 0.1), sy, Math.max(1, t * 0.1), t);
      }
      else if (cell.kind === "tree") {
        // D4 SOLID WALL: trees/crags are RAISED — cast shadow + oversized bottom-anchored sprite so they
        // stand up off the floor and read as "go around" at a glance (real sprite OR emoji fallback).
        if (biome === "forest") tall(T.oldtree, "🌲");
        else if (biome === "orchard") tall(T["orchard-tree"], "🌳");
        else if (biome === "mire") tall(T.deadtree, "🌫️");
        else if (biome === "ruin") tall(T["ruin-wall"], "🧱");                          // crumbling ruin wall
        else if (biome === "snow" || biome === "ice") tall(T["snow-pine"], "🌲", 1.45, 0.5);  // cold biomes: a snow-laden wall can be LIGHTER than the near-white floor (the value law inverts), so a STRONGER cast shadow must carry figure-ground
        else if (biome === "stone") tall(T["snow-crag"], "⛰️", 1.45, 0.5);                     // ice-rimed crags — same inversion guard
        else if (biome === "rock") tall(T["coast-rock"], "⛰️");
        else if (biome === "coast" || biome === "beach" || biome === "harbor") tall(T["coast-rock"], "🌴");
        else tall(gimg, "🌲");
      }
      else if (cell.kind === "water") FR.drawRecessedWater(c, wx, wy, sx, sy, t, (gx, gy) => this.bigWet(gx, gy), now); // D5 (over flat OR sprite)
      else if (cell.kind === "bush") {
        // D4 DECORATIVE scatter (walkable floor): a SMALL soft shadow so the prop sits on the ground — NOT
        // the full wall cast (a bush/fern is a low prop you walk past, not a wall to skirt).
        FR.castShadow(c, sx, sy, t, 0.22, 0.2);
        if (biome === "forest") obj(T.fern, "🌿", 0.85);
        else if (biome === "meadow" || biome === "creek") obj(T.wheat, "🌾", 0.85);
        else if (biome === "snow" || biome === "ice") obj(T["snow-cairn"], "❄️", 0.9);
        else if (biome === "coast" || biome === "beach" || biome === "harbor") obj(T["coast-pool"], "🐚", 0.9);
        else if (biome === "ruin") obj(T["ruin-grass"], "🌿", 0.85);
        else if (biome === "hills" || biome === "highland") c.fillText("🌾", sx + t / 2, sy + t / 2);
        else if (!gimg) c.fillText("🌿", sx + t / 2, sy + t / 2);
      }
      else if (cell.kind === "rock") {
        FR.castShadow(c, sx, sy, t, 0.24, 0.22); // small scatter shadow (walkable floor prop)
        if (biome === "forest") obj(T.mushroom, "🍄", 0.8);
        else if (biome === "snow" || biome === "ice" || biome === "stone") obj(T["snow-rock"], "🪨", 0.9);
        else if (biome === "ruin") obj(T["ruin-rubble"], "🪨", 0.95);
        else if (biome === "coast" || biome === "beach" || biome === "harbor" || biome === "rock") obj(T["coast-piling"], "⛰️", 0.9);
      }
      // OPEN-CONTINENT gorge-rim props (put-in sign at the real chasm rim / take-out shore marker) — purely
      // visual, drawn over the realized ground; never affects passability. Only the locked-gorge rim tiles match.
      this.drawGorgeRimProps(c, wx, wy, sx, sy, t);
    }
    // player marker (same as discrete): feet shadow + ring + tall walker (emoji fallback), drawn at the
    // GLIDE position with a small mid-step foot-bob (the shadow stays grounded).
    const cx = (vp.x - camfx) * t + t / 2, cy = (vp.y - camfy) * t + t / 2;
    const bob = vp.k ? Math.sin(vp.k * Math.PI) * t * 0.07 : 0;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    const pimg = this.playerImg(T);
    if (pimg) {
      const ph = t * 1.55, pw = ph * (pimg.width / pimg.height);
      const py = Math.max(2, cy + t * 0.46 - ph - bob);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(pimg, cx - pw / 2, py, pw, ph); c.shadowBlur = 0;
    } else { c.font = `${t * 0.7}px serif`; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy - bob); }
    c.restore();
    // ambient atmosphere: biome motes over the scene + the CSS color grade, then keep the loop alive.
    const amb = this.fieldAmbience();
    this.drawMotes(c, amb, now);
    this.setAtmo(amb);
    this.ensureLoop();
  },

  // Begin a smooth visual glide from the tile just left. Guarded for headless/test runs (no canvas /
  // no RAF) and honors prefers-reduced-motion (steps snap instantly, as before).
  glideFrom(ox: number, oy: number): void {
    if (!this.canvas || typeof requestAnimationFrame === "undefined") return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = this.glidePos(ox, oy); // chain: start where the eye currently is, not the old tile
    this._glide = { fx: from.x, fy: from.y, t0: performance.now(), ms: 115 };
    this.ensureLoop();
  },
  // The shared field animation loop: full-rate frames while a glide is live, ~30fps ambient otherwise
  // (water shimmer + motes). Self-stopping: exits when the field screen hides / tab backgrounds; any
  // draw() while visible restarts it, so returning from battle or a menu resumes the living world.
  ensureLoop(): void {
    if (this._loopRaf || !this.canvas || typeof requestAnimationFrame === "undefined") return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = (): void => {
      this._loopRaf = 0;
      const scr = typeof document !== "undefined" ? document.getElementById("fieldScreen") : null;
      if (!scr || !scr.classList.contains("on") || document.hidden) return; // self-stop
      const now = performance.now();
      if (this._glide && now - this._glide.t0 >= this._glide.ms) this._glide = null;
      if (this._glide || now - this._loopLast >= 32) { this._loopLast = now; this.draw(); }
      this._loopRaf = requestAnimationFrame(tick);
    };
    this._loopRaf = requestAnimationFrame(tick);
  },
  // The field's current AMBIENCE — drives the biome particle style + the CSS color grade. One of
  // warm (golden shirelands) / forest (green shade) / mire (cold murk) / snow (blue chill) / dun (torchlit dark).
  fieldAmbience(): string {
    if (this.mode === "dungeon") return "dun";
    if (this.townMode) return "warm";
    if (this.bigMapActive()) {
      const b = this.cellAt(this.wx, this.wy).biome;
      if (b === "mire") return "mire";
      if (b === "snow" || b === "ice" || b === "stone") return "snow";
      if (b === "forest") return "forest";
      return "warm";
    }
    if (this.isMire()) return "mire";
    if (this.isForest()) return "forest";
    return "warm";
  },
  // Swap the CSS color-grade class on #fieldScreen when the ambience changes (cheap no-op otherwise).
  setAtmo(a: string): void {
    if (a === this._atmo) return;
    this._atmo = a;
    const s = typeof document !== "undefined" ? document.getElementById("fieldScreen") : null;
    if (!s) return;
    ["atmo-warm", "atmo-forest", "atmo-mire", "atmo-snow", "atmo-dun"].forEach((k) => s.classList.remove(k));
    s.classList.add("atmo-" + a);
  },
  // AMBIENT MOTES: a light screen-space particle pass — golden pollen on the shirelands, drifting spores
  // under the forest, fog wisps + marsh-lights in the mire, snowfall in the cold biomes, sinking dust in
  // dungeons. Presentation only; reseeds when the ambience changes. (Math.random is fine here — this is
  // the presentation layer, not systems/.)
  drawMotes(c: CanvasRenderingContext2D, style: string, now: number): void {
    if (style !== this._moteStyle || !this._motes.length) {
      this._moteStyle = style;
      const count = style === "snow" ? 42 : style === "mire" ? 19 : style === "dun" ? 14 : 26;
      this._motes = Array.from({ length: count }, (_, i) => {
        const m = { x: Math.random() * this.vw, y: Math.random() * this.vh, vx: 0, vy: 0, r: 0, p: Math.random() * Math.PI * 2 };
        if (style === "snow") { m.vx = 6 + Math.random() * 10; m.vy = 20 + Math.random() * 28; m.r = 1 + Math.random() * 1.6; }
        else if (style === "mire") { const fog = i < 6; m.vx = 3 + Math.random() * 5; m.vy = fog ? 0 : -2.5; m.r = fog ? 55 + Math.random() * 70 : 1.4; }
        else if (style === "dun") { m.vx = (Math.random() - 0.5) * 3; m.vy = 3 + Math.random() * 4; m.r = 1 + Math.random(); }
        else if (style === "forest") { m.vx = (Math.random() - 0.5) * 5; m.vy = 5 + Math.random() * 7; m.r = 1 + Math.random() * 1.4; }
        else { m.vx = 5 + Math.random() * 7; m.vy = -(3 + Math.random() * 5); m.r = 1 + Math.random() * 1.5; } // warm pollen
        return m;
      });
      this._moteLast = now;
    }
    const dt = Math.min(0.1, (now - this._moteLast) / 1000); this._moteLast = now;
    c.save();
    for (const m of this._motes) {
      m.x = (m.x + m.vx * dt + this.vw) % this.vw;
      m.y = (m.y + m.vy * dt + this.vh) % this.vh;
      const tw = 0.5 + 0.5 * Math.sin(now / 700 + m.p); // twinkle 0..1
      if (m.r > 10) { // mire fog wisp: two concentric soft ellipses
        c.fillStyle = "rgba(160,200,190,.035)";
        c.beginPath(); c.ellipse(m.x, m.y, m.r, m.r * 0.42, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "rgba(170,210,200,.03)";
        c.beginPath(); c.ellipse(m.x, m.y, m.r * 0.6, m.r * 0.26, 0, 0, Math.PI * 2); c.fill();
        continue;
      }
      c.fillStyle = style === "snow" ? `rgba(235,242,255,${0.5 + 0.35 * tw})`
        : style === "dun" ? `rgba(205,190,165,${0.14 + 0.12 * tw})`
        : style === "mire" ? `rgba(150,230,190,${0.25 + 0.45 * tw})` // marsh-lights
        : style === "forest" ? `rgba(190,230,170,${0.2 + 0.3 * tw})`
        : `rgba(255,222,140,${0.22 + 0.38 * tw})`; // warm pollen
      c.beginPath(); c.arc(m.x, m.y, m.r, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  },
  // The walker's VISUAL grid position: fractional mid-glide, the live tile once settled. The target is
  // the caller's live coords (px/py or wx/wy) so a glide always lands on truth; a jump of >2 tiles is a
  // teleport/space-change — snap rather than glide across it. `k` = glide progress (0 = settled).
  glidePos(tx: number, ty: number): { x: number; y: number; k: number } {
    const g = this._glide;
    if (!g || Math.abs(tx - g.fx) > 2 || Math.abs(ty - g.fy) > 2) return { x: tx, y: ty, k: 0 };
    const k = Math.min(1, (performance.now() - g.t0) / g.ms);
    const e = 1 - (1 - k) * (1 - k); // ease-out: brisk start, soft landing
    return { x: g.fx + (tx - g.fx) * e, y: g.fy + (ty - g.fy) * e, k };
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
    c.clearRect(0, 0, this.vw, this.vh);
    const viewW = Math.ceil(this.vw / t), viewH = Math.ceil(this.vh / t);
    const now = performance.now(); // one frame clock: motes + glide share it
    // fractional camera centered on the glide position (clamped to the map), split into an integer tile
    // origin + a sub-tile pixel offset so the world scrolls smoothly under the walker between steps.
    const vp = this.glidePos(this.px, this.py);
    const camfx = clamp(vp.x - Math.floor(viewW / 2), 0, Math.max(0, this.W - viewW));
    const camfy = clamp(vp.y - Math.floor(viewH / 2), 0, Math.max(0, this.H - viewH));
    const camx = Math.floor(camfx), camy = Math.floor(camfy);
    const sox = Math.round((camfx - camx) * t), soy = Math.round((camfy - camy) * t);
    const colors: Record<string, string> = { grass: "#4a7a32", grass2: "#52823a", path: "#7a6a3a", tree: "#1f3a1c", bush: "#3a6a2a", rock: "#5a5a52", boss: "#6a1020", chest: "#6a5a2a", miniboss: "#5a1226", river: "#2f5b7a", cliff: "#3f4450", bridge: "#7a6242", ford: "#86b0c4", shrine: "#4a7a32", camp: "#4a7a32", landmark: "#4a7a32", signpost: "#4a7a32" };
    const T = this.tiles;
    c.textAlign = "center"; c.textBaseline = "middle";
    this._townLabels.length = 0; // fresh per frame — building/NPC captions buffer here, flushed last
    for (let y = 0; y < viewH + 2; y++)
      for (let x = 0; x < viewW + 2; x++) {
        const mx = camx + x, my = camy + y;
        if (mx >= this.W || my >= this.H) continue;
        const cell = this.map[my][mx];
        const sx = (mx - camx) * t - sox, sy = (my - camy) * t - soy;
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
        const isObj = cell === "chest" || cell === "miniboss" || cell === "boss" || cell === "lair" || cell === "mouth" || cell === "village" || cell === "stairsdown" || cell === "stairsup" || cell === "rest" || cell === "rubble" || POI_KINDS.has(cell);
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
          // ATMOSPHERE: occasionally light a ROOM-FACING wall with the set's decoration (warren torch /
          // vault lantern / grove spores). Only on a wall whose tile BELOW is walkable (so the sconce
          // faces into the room, not buried in wall mass), gated by a stable hash so it's sparse + fixed.
          const deco = DUNGEON_DECO[dset];
          if (base === "wall" && deco && T[`${dset}-${deco}`] && (mx * 13 + my * 7) % 7 === 0
              && ["grass", "grass2", "path"].includes(this.map[my + 1]?.[mx] ?? "")) base = deco;
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
        // EDGE AO: contact shading on floor tiles that meet a raised solid (tree mass / dungeon wall) —
        // grounds the walls to the floor and breaks the flat tile-grid read (see fieldRender.edgeShade).
        if (!["tree", "cliff", "water", "river"].includes(cell)) {
          const solid = (gx: number, gy: number): boolean => {
            const k = this.map[gy]?.[gx];
            return k === "tree" || k === "cliff" || (inDun && (k === "bush" || k === "rock"));
          };
          FR.edgeShade(c, sx, sy, t, solid(mx, my - 1), solid(mx, my + 1), solid(mx - 1, my), solid(mx + 1, my));
        }
        // overlays / object sprites (fall back to emoji if art isn't loaded)
        c.font = `${t * 0.82}px serif`;
        const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
          if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
          else c.fillText(emoji, sx + t / 2, sy + t / 2);
        };
        if (cell === "chest") { if (inDun) FR.drawTreasureMark(c, sx, sy, t); obj(inDun ? T[`${dset}-chest`] : T.chest, "📦", 0.8); } // glint behind, chest sprite on top
        else if (cell === "lair") obj(T.lair, "🕳️", 0.85); // rare-monster den (placeholder — see asset-gaps.md)
        else if (cell === "mouth") obj(T[`${dset}-entrance`], "🚪", 0.95); // cleared dungeon mouth — step in to descend
        else if (cell === "village") { // re-enterable hub marker → back into the zone's hub town
          obj(T["town-inn"], "🏘️", 0.95);
          const nm = this.zone().hub ? settlement(this.zone().hub!).name : "Town";
          c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)";
          c.strokeText(nm, sx + t / 2, sy + t * 1.02); c.fillStyle = "rgba(244,210,122,.96)"; c.fillText(nm, sx + t / 2, sy + t * 1.02);
          c.font = `${t * 0.82}px serif`;
        }
        else if (cell === "stairsdown") FR.drawStairs(c, obj, T[`${dset}-stairsdown`], false, sx, sy, t); // descend a floor (placeholder — see asset-gaps.md)
        else if (cell === "stairsup") FR.drawStairs(c, obj, T[`${dset}-stairsup`], true, sx, sy, t);      // climb a floor / out
        else if (cell === "miniboss") { // floor lieutenant / mouth guard — its actual enemy sprite
          const g = this.mob(inDun ? this.zone().dungeon?.floorMini : this.zone().mini);
          if (g) FR.drawMob(c, g, sx, sy, t); else c.fillText("🪖", sx + t / 2, sy + t / 2);
        }
        else if (cell === "boss") { if (inDun) FR.drawDungeonBoss(c, this.tiles["boss-throne"], Game.bossDefeated, sx, sy, t); else obj(undefined, Game.bossDefeated ? "🏴" : "⛺", 0.95); }
        else if (cell === "rest") obj(T[`${dset}-rest`], "🔥", 0.8);   // dungeon breather campfire (placeholder emoji — sprite flagged for art-integrator)
        else if (cell === "rubble") obj(T[`${dset}-rubble`], "🕳️", 0.85); // the Warren collapse drop (placeholder emoji — sprite flagged for art-integrator)
        else if (POI_KINDS.has(cell)) FR.drawPoiCell(c, T, cell, this.poiNameAt(mx, my, false), sx, sy, t); // captioned landmark/camp/shrine/sign
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
        if (n.x < camx || n.y < camy || n.x > camx + viewW + 1 || n.y > camy + viewH + 1) continue;
        const nx = (n.x - camx) * t - sox + t / 2, ny = (n.y - camy) * t - soy + t / 2;
        c.beginPath(); c.ellipse(nx, ny + t * 0.36, t * 0.26, t * 0.11, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.38)"; c.fill();
        const nimg = this.tiles[`npc:${this.town?.id}-${n.id}`];
        if (nimg) { const h = t * 1.5, w = h * nimg.width / nimg.height; c.drawImage(nimg, nx - w / 2, ny + t * 0.36 - h, w, h); }
        else { c.font = `${t * 0.72}px serif`; c.fillStyle = "#fff"; c.fillText(n.spr, nx, ny - t * 0.04); }
        // BUFFER the name — drawn in the final pass so a later (taller) NPC sprite can't cover it.
        this._townLabels.push({ text: n.name, x: nx, y: ny + t * 0.5, f: Math.max(8, t * 0.22) });
        if (!talking) { c.font = `${t * 0.4}px serif`; c.fillStyle = "rgba(244,210,122,.85)"; c.fillText("💬", nx + t * 0.36, ny - t * 0.4); }
      }
    }
    // player marker: feet shadow + "you are here" ring + a tall walker sprite that pops (emoji fallback).
    // Drawn at the GLIDE position with a small mid-step foot-bob (the shadow stays grounded).
    const cx = (vp.x - camfx) * t + t / 2, cy = (vp.y - camfy) * t + t / 2;
    const bob = vp.k ? Math.sin(vp.k * Math.PI) * t * 0.07 : 0;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    const pimg = this.playerImg(T);
    if (pimg) {
      const ph = t * 1.55, pw = ph * (pimg.width / pimg.height);
      // The walker is tall (≈1.55× tile) and anchored at the feet, so at a y≈1 spawn on a tall,
      // camera-scrolled map (e.g. the city) its head would clip above the canvas. Clamp the top edge
      // so the body always stays on-screen rather than vanishing past the top.
      const py = Math.max(2, cy + t * 0.46 - ph - bob);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(pimg, cx - pw / 2, py, pw, ph);
      c.shadowBlur = 0;
    } else {
      c.font = `${t * 0.7}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy - bob);
    }
    c.restore();
    // ambient atmosphere: biome motes over the scene (labels stay crisp — drawn after, below).
    const amb = this.fieldAmbience();
    this.drawMotes(c, amb, now);
    // LABEL PASS (town) — every caption drawn LAST, on top of all tiles, NPC sprites AND the player marker
    // (so nothing paints over it — the original bug), each clamped into the viewport so edge labels aren't
    // clipped. textAlign is "center": clamp center-x by half the measured width. The top clamp must clear
    // the DOM HUD strip (zone/town pill + party line) overlaying the canvas top, not just half a tile —
    // else a top-row sign hides under the pill. Bottom clamp keeps it off the screen edge.
    if (this.townMode && this._townLabels.length) {
      const hud = $("#fieldHud"), cr = this.canvas.getBoundingClientRect();
      const topMin = hud ? Math.max(t * 0.5, hud.getBoundingClientRect().bottom - cr.top + 6) : t * 0.5;
      c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.95)";
      for (const L of this._townLabels) {
        c.font = `bold ${L.f}px system-ui`;
        const half = c.measureText(L.text).width / 2 + 3;
        const x = clamp(L.x, half, this.vw - half);
        const y = clamp(L.y, topMin, this.vh - t * 0.15);
        c.strokeText(L.text, x, y); c.fillText(L.text, x, y);
      }
    }
    this.setAtmo(amb);
    this.ensureLoop();
  },
};
