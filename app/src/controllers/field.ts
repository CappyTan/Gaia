// Tile field map: grid, camera, movement, random encounters, chokepoint mini-boss + zone boss.

import { $ } from "../core/dom";
import { assetUrl } from "../core/assets";
import { clamp, ri, pick } from "../core/rng";
import { ZONES, type ZoneLayout, type Pt } from "../data/zones";
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
  // TOWN: a real walkable settlement (data-driven, ADR 0006) reusing this same canvas/camera/dpad.
  // Loaded by id from data/towns.ts. No encounters; buildings are walk-in POIs; NPCs are talked to.
  townMode: false,
  town: null as Settlement | null,
  npcs: [] as TownNPC[],
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  tiles: {} as Record<string, HTMLImageElement>, // loaded field sprites (empty until ready)

  // Preload the overworld (Greenvale) tileset + both dungeon tilesets; each redraws as it lands.
  // (merchant.png is sliced for later — the merchant is a between-zones overlay, not a field tile.)
  loadTiles(): void {
    const names = ["grass", "grass2", "path", "tree", "bush", "rock", "chest", "lair", "player"];
    // marsh (Duskmarsh) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["water", "mire-ground", "mire-ground2", "mire-path", "deadtree", "reed", "bog"]) names.push(n);
    // ancient-forest (Silverwood) overworld flavor kinds — placeholders until sliced (see asset-gaps.md)
    for (const n of ["grove-ground", "grove-ground2", "grove-path", "oldtree", "fern", "mushroom"]) names.push(n);
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
  // Past the mini-boss gate you're in the zone's dungeon: tougher, own environment.
  inDungeon(): boolean { return this.px > this.gate.x; },
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
  // Build the bespoke zone map from the zone's `layout` (ADR 0006). A tree-filled canvas with
  // walkable space carved out as clearings/rooms (rects) + winding roads/corridors (paths), an
  // anchored gate chokepoint, boss, chests, and an optional rare-monster lair — then flood-filled
  // to GUARANTEE the boss and every chest are reachable from spawn (anti-soft-lock).
  genMap(): void {
    this.townMode = false;
    const L = this.zone().layout;
    this.W = L.w; this.H = L.h;
    this.gate = { ...L.gate }; this.boss = { ...L.boss };
    this.chests = L.chests.map((c) => ({ ...c }));
    this.lairAt = L.lair ? { ...L.lair } : null;
    this.px = L.spawn.x; this.py = L.spawn.y;

    // 1. fill everything with tree (overworld = forest wall, dungeon = rock wall via the draw map)
    this.map = Array.from({ length: this.H }, () => Array.from({ length: this.W }, () => "tree"));
    const inB = (x: number, y: number) => x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1;
    const carve = (x: number, y: number, kind: string) => { if (inB(x, y)) this.map[y][x] = kind; };

    // 2. carve walkable rects (clearings/rooms)
    const carveRect = (r: { x: number; y: number; w: number; h: number }) => {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass");
    };
    L.fieldRects.forEach(carveRect); L.dunRects.forEach(carveRect);

    // 3. carve paths (L-shaped segments between consecutive points), drawn as the intended route
    const carveSeg = (a: Pt, b: Pt) => {
      let cx = a.x, cy = a.y; carve(cx, cy, "path");
      while (cx !== b.x) { cx += Math.sign(b.x - cx); carve(cx, cy, "path"); }
      while (cy !== b.y) { cy += Math.sign(b.y - cy); carve(cx, cy, "path"); }
    };
    const carvePath = (p: Pt[]) => { for (let i = 1; i < p.length; i++) carveSeg(p[i - 1], p[i]); };
    L.fieldPaths.forEach(carvePath); L.dunPaths.forEach(carvePath);

    // 4. the CHOKEPOINT: a full-height tree wall at gateWallX with one gap = the mini-boss gate.
    const gx = L.gateWallX;
    for (let y = 1; y < this.H - 1; y++) this.map[y][gx] = "tree";
    // a one-tile path stub on each side so the gate connects field ↔ dungeon
    carve(gx - 1, L.gate.y, "path"); carve(gx + 1, L.gate.y, "path");
    this.map[L.gate.y][gx] = "miniboss";

    // 5. cosmetic scatter (bush/rock) on a few open tiles — decoration only, never blocks. The
    // renderer dresses these as reed/bog clumps in the marsh (env-aware), so no new kind is needed.
    const dens = L.scatter ?? 0.06;
    for (let y = 1; y < this.H - 1; y++) for (let x = 1; x < this.W - 1; x++) {
      if (this.map[y][x] === "grass" && Math.random() < dens) this.map[y][x] = Math.random() < 0.6 ? "bush" : "rock";
    }

    // 5b. WATER pools: hard-blocking marsh water stamped over carved ground to pinch the causeway
    // (a zone flavor wall, like tree). The flood-fill in step 7 still guarantees reachability, so
    // a pool that severed a required tile is repaired; authored pools only pinch, not sever.
    if (L.water) for (const w of L.water) {
      for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++)
        if (inB(x, y) && this.map[y][x] !== "miniboss") this.map[y][x] = "water";
    }

    // 6. chests + lair, each with a cleared 3×3 halo so they're reachable
    const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && this.map[yy][xx] === "tree") this.map[yy][xx] = "grass"; } };
    this.chests.forEach((c) => { halo(c); carve(c.x, c.y, "chest"); });
    if (this.lairAt) { halo(this.lairAt); carve(this.lairAt.x, this.lairAt.y, "lair"); }
    carve(this.boss.x, this.boss.y, "boss");
    carve(L.spawn.x, L.spawn.y, "path");

    // 7. ANTI-SOFT-LOCK: flood-fill from spawn (treating the gate as walkable) and verify the boss
    // and every chest/lair are reachable; if a feature got walled off, punch a path to it.
    this.ensureReachable(L);
  },

  // bush/rock are decoration (walkable); tree and water are walls; the gate is walkable.
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
  // Verify (and, if needed, repair) reachability of the boss + every chest/lair from spawn.
  ensureReachable(L: ZoneLayout): void {
    const targets: Pt[] = [this.boss, ...this.chests];
    if (this.lairAt) targets.push(this.lairAt);
    let seen = this.flood(L.spawn);
    for (const t of targets) {
      if (seen[t.y]?.[t.x]) continue;
      // carve a straight L-corridor from the nearest reachable tile to the target, then re-flood.
      let best: Pt | null = null, bd = Infinity;
      for (let y = 0; y < this.H; y++) for (let x = 0; x < this.W; x++)
        if (seen[y][x]) { const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd) { bd = d; best = { x, y }; } }
      if (best) {
        let cx = best.x, cy = best.y;
        const step = (x: number, y: number) => { if (x > 0 && y > 0 && x < this.W - 1 && y < this.H - 1 && FIELD_WALLS.has(this.map[y][x])) this.map[y][x] = "path"; };
        while (cx !== t.x) { cx += Math.sign(t.x - cx); step(cx, cy); }
        while (cy !== t.y) { cy += Math.sign(t.y - cy); step(cx, cy); }
        seen = this.flood(L.spawn);
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
  progress(): number { return clamp((this.px - 1) / (this.boss.x - 1), 0, 1); },
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
    if (cell === "chest") { this.openChest(nx, ny); return; } // a chest doesn't also trigger a fight
    if (cell === "lair") { this.enterLair(nx, ny); return; }  // the rare-monster den (Hogger)
    // crossing the gate the first time = entering the dungeon (one-time beat, no fight this step)
    if (this.inDungeon() && !this.enteredDungeon) {
      this.enteredDungeon = true;
      const z = this.zone();
      Overlay.show(`<h2 class="title-gold">${z.dungeon.name}</h2><p class="small">You descend into the dungeon. The enemies here are stronger — but so is their hoard.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Press on</button></div>`);
      return;
    }
    this.stepsToEncounter--;
    if (this.stepsToEncounter <= 0) { this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX); this.rollEncounter(); }
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
    const set = pick(band.sets).slice();
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
    else if (!Game.miniBossDefeated && p >= 0.38) msg = `A ${miniNm} guards the way into ${z.dungeon.name}.`;
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
  draw(): void {
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
        const inDun = mx > this.gate.x; // east of the gate = the zone's dungeon (its own tileset)
        const dset = DUNGEON_SETS[this.zoneIndex] || DUNGEON_SETS[0];
        const mire = !inDun && this.isMire(); // grim overworld dressing (Duskmarsh)
        const grove = !inDun && this.isForest(); // dense old-growth dressing (Silverwood)
        const isObj = cell === "chest" || cell === "miniboss" || cell === "boss" || cell === "lair";
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
        } else {
          ground = isObj ? "grass" : cell;
          if (ground === "grass" && (mx * 7 + my * 13) % 4 === 0 && T.grass2) ground = "grass2";
        }
        const gimg = T[ground];
        if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1); // +1px overlap hides hairline seams
        else {
          // flat-colour fallback (palette differs for dungeon / mire / grove / shire)
          const fill = inDun ? "#2a2740" : mire ? (cell === "water" ? "#23303a" : "#3a4030") : grove ? "#2e4a26" : (colors[cell] || "#4a7a32");
          c.fillStyle = fill; c.fillRect(sx, sy, t, t);
          if (!inDun && (mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(sx, sy, t, t); }
          if (inDun) { c.fillStyle = "rgba(38,30,66,.5)"; c.fillRect(sx, sy, t, t); } // tint only when art missing
          else if (mire && cell !== "water") { c.fillStyle = "rgba(20,28,18,.28)"; c.fillRect(sx, sy, t, t); } // grim wash
          else if (grove) { c.fillStyle = "rgba(8,20,8,.34)"; c.fillRect(sx, sy, t, t); } // deep, hushed canopy shade
        }
        // overlays / object sprites (fall back to emoji if art isn't loaded)
        c.font = `${t * 0.82}px serif`;
        const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
          if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
          else c.fillText(emoji, sx + t / 2, sy + t / 2);
        };
        if (cell === "chest") obj(inDun ? T[`${dset}-chest`] : T.chest, "📦", 0.8);
        else if (cell === "lair") obj(T.lair, "🕳️", 0.85); // rare-monster den (placeholder — see asset-gaps.md)
        else if (cell === "miniboss") c.fillText("🪖", sx + t / 2, sy + t / 2); // gate guardian — emoji for now
        else if (cell === "boss") obj(inDun ? T[`${dset}-entrance`] : undefined, Game.bossDefeated ? "🏴" : "⛺", 0.95);
        else if (cell === "tree") { if (mire) obj(T.deadtree, "🌫️", 0.95); else if (grove) obj(T.oldtree, "🌲", 1.0); else if (!gimg) c.fillText(inDun ? "🪨" : "🌲", sx + t / 2, sy + t / 2); }
        else if (cell === "water" && !inDun && !gimg) c.fillText("🌊", sx + t / 2, sy + t / 2);
        else if (cell === "bush") { if (grove) obj(T.fern, "🌿", 0.85); else if (!gimg) c.fillText(inDun ? "🦴" : mire ? "🌾" : "🌿", sx + t / 2, sy + t / 2); }
        else if (cell === "rock") { if (mire && !gimg) c.fillText("🪨", sx + t / 2, sy + t / 2); else if (grove) obj(T.mushroom, "🍄", 0.8); }
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
