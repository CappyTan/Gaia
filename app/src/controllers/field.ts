// Tile field map: grid, camera, movement, random encounters, chokepoint mini-boss + zone boss.

import { $ } from "../core/dom";
import { assetUrl } from "../core/assets";
import { clamp, ri, pick } from "../core/rng";
import { ZONES } from "../data/zones";
import { ENEMIES, RARE_MONSTERS, RARE_ENCOUNTER_CHANCE } from "../data/enemies";
import { rollItemAtRarity } from "../systems/loot";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Screens } from "./screens";
import { Game } from "./game";
import { Battle } from "./battle";
import { Telemetry } from "../telemetry/telemetry";

// Per-zone dungeon tileset prefix (east of the gate): Greenvale -> Bandit Warren, Duskmarsh -> Drowned Vault.
const DUNGEON_SETS = ["warren", "vault"];

export const Field = {
  // PACING KNOBS: W = zone length (steps to boss); ENC_MIN/MAX = steps between random fights.
  W: 60, H: 18, tile: 0, px: 0, py: 0,
  map: [] as string[][],
  boss: { x: 58, y: 9 },
  stepsToEncounter: 0,
  gate: { x: 30, y: 9 }, // mid-zone chokepoint — the zone's mini-boss
  chests: [{ x: 8, y: 5 }, { x: 16, y: 13 }, { x: 23, y: 5 }, { x: 41, y: 13 }, { x: 51, y: 5 }],
  ENC_MIN: 3, ENC_MAX: 6,
  zoneIndex: 0,
  enteredDungeon: false,
  // TOWN: a real walkable hub (the Greenvale Outpost) reusing this same canvas/camera/dpad — set
  // between zones in place of the old modal hub. No encounters; buildings are walk-in POIs.
  townMode: false,
  canvas: null as HTMLCanvasElement | null,
  ctx: null as CanvasRenderingContext2D | null,
  tiles: {} as Record<string, HTMLImageElement>, // loaded field sprites (empty until ready)

  // Preload the overworld (Greenvale) tileset + both dungeon tilesets; each redraws as it lands.
  // (merchant.png is sliced for later — the merchant is a between-zones overlay, not a field tile.)
  loadTiles(): void {
    const names = ["grass", "grass2", "path", "tree", "bush", "rock", "chest", "player"];
    for (const set of DUNGEON_SETS) for (const c of ["floor", "floor2", "path", "wall", "rock", "chest", "entrance"]) names.push(`${set}-${c}`);
    // town sprites (resolve to emoji fallback until the tileset is sliced — see art pipeline)
    for (const n of ["town-cobble", "town-cobble2", "town-inn", "town-shop", "town-smith", "town-revive", "town-fountain", "town-exit"]) names.push(n);
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
    this.px = 1; this.py = 9;
    this.genMap();
    this.stepsToEncounter = ri(this.ENC_MIN, this.ENC_MAX);
    this.hint();
    this.draw();
    window.addEventListener("resize", () => { this.resize(); this.draw(); });
  },
  // advance to a new zone (party/gold/inventory persist; zone progress + boss flags reset)
  loadZone(i: number): void {
    this.zoneIndex = i; Game.bossDefeated = false; Game.miniBossDefeated = false; this.enteredDungeon = false;
    this.px = 1; this.py = 9; this.resize(); this.genMap();
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
  genMap(): void {
    this.townMode = false; this.W = 60; this.H = 18; // a zone map (restore dims if leaving a town)
    this.map = [];
    for (let y = 0; y < this.H; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.W; x++) {
        let t = "grass";
        if (x === 0 || y === 0 || x === this.W - 1 || y === this.H - 1) t = "tree";
        else if (Math.random() < 0.1) t = "tree";
        else if (Math.random() < 0.05) t = "bush";
        row.push(t);
      }
      this.map.push(row);
    }
    // guaranteed-walkable central band (rows 8-10) so the road east is never blocked
    for (let x = 1; x < this.W - 1; x++) { this.map[8][x] = "grass"; this.map[9][x] = "path"; this.map[10][x] = "grass"; }
    // mid-zone CHOKEPOINT: a full-height tree wall with one gap holding the mini-boss tile
    const gx = this.gate.x;
    for (let y = 1; y < this.H - 1; y++) this.map[y][gx] = "tree";
    this.map[this.gate.y][gx] = "miniboss";
    // treasure chests, each with a cleared halo so they're reachable off the path
    this.chests.forEach((c) => {
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = c.x + dx, yy = c.y + dy;
          if (xx > 0 && yy > 0 && xx < this.W - 1 && yy < this.H - 1 && this.map[yy][xx] === "tree") this.map[yy][xx] = "grass";
        }
      this.map[c.y][c.x] = "chest";
    });
    this.map[this.boss.y][this.boss.x] = "boss";
    this.map[9][1] = "path";
  },
  // ── TOWN ── Enter the walkable Greenvale Outpost (called after a zone boss, via Game.openTown).
  // A compact cobbled plaza ringed by the four service buildings; walk onto a building's door to
  // use it, onto the gate to leave. Stock is rolled by the caller (Game.openTown).
  enterTown(): void {
    this.genTown();
    Screens.show("field");
    this.draw(); this.hint();
    Overlay.show(`<h2 class="title-gold">Greenvale Outpost</h2><p class="small">A safe haven between the roads. Visit the Inn to rest, the Merchant and Smith for gear, the shrine to revive the fallen — then take the gate onward.</p><div class="row"><button class="btn gold" onclick="Overlay.hide()">Enter town</button></div>`);
  },
  genTown(): void {
    this.townMode = true;
    this.W = 15; this.H = 11;
    this.map = [];
    for (let y = 0; y < this.H; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.W; x++) row.push(x === 0 || y === 0 || x === this.W - 1 || y === this.H - 1 ? "twall" : "town-cobble");
      this.map.push(row);
    }
    // service buildings (walk onto the door tile to enter) ringing the plaza
    this.map[2][3] = "t-inn";        // top-left  — Inn (rest)
    this.map[2][11] = "t-shop";      // top-right — Supplies (merchant)
    this.map[8][3] = "t-smith";      // bot-left  — Blacksmith
    this.map[8][11] = "t-revive";    // bot-right — Revive shrine
    this.map[5][7] = "t-fountain";   // centrepiece (impassable decoration)
    this.map[this.H - 1][7] = "t-exit"; // gate in the south wall — leave the outpost
    this.px = 7; this.py = this.H - 2; // enter just inside the gate
  },
  progress(): number { return clamp((this.px - 1) / (this.boss.x - 1), 0, 1); },
  passable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return false;
    const cell = this.map[y][x];
    if (this.townMode) return cell !== "twall" && cell !== "t-fountain"; // buildings/gate are walk-in
    return cell !== "tree";
  },
  move(dx: number, dy: number): void {
    if (Game.state !== "field" && Screens.cur !== "field") return;
    if (Overlay.isOn()) return;
    const nx = this.px + dx, ny = this.py + dy;
    if (!this.passable(nx, ny)) return;
    this.px = nx; this.py = ny;
    if (this.townMode) { this.draw(); this.hint(); this.townTouch(this.map[ny][nx]); return; } // no steps/encounters in town
    Game.steps++; Telemetry.step();
    this.draw(); this.hint();
    const cell = this.map[ny][nx];
    if (cell === "boss" && !Game.bossDefeated) { this.startBoss(); return; }
    if (cell === "miniboss" && !Game.miniBossDefeated) { this.startMiniBoss(); return; }
    if (cell === "chest") { this.openChest(nx, ny); return; } // a chest doesn't also trigger a fight
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
    if (cell === "t-inn") Game.openInn();
    else if (cell === "t-shop") Game.openMerchant();
    else if (cell === "t-smith") Game.openSmith();
    else if (cell === "t-revive") Game.openRevive();
    else if (cell === "t-exit") Game.confirmLeaveTown();
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
      set("#fieldHint", "Walk to a building to use it; step onto the south gate to head out.");
      set("#fieldZone", `Greenvale Outpost · Zone ${this.zoneIndex + 1}`);
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
  // One town tile: cobble ground (+impassable wall) then the building/decoration sprite with a
  // gold label, falling back to emoji until the tileset art is sliced in.
  drawTownCell(c: CanvasRenderingContext2D, T: Record<string, HTMLImageElement>, cell: string, mx: number, my: number, sx: number, sy: number, t: number): void {
    const isWall = cell === "twall";
    let g = isWall ? "" : "town-cobble";
    if (g === "town-cobble" && (mx * 7 + my * 13) % 4 === 0 && T["town-cobble2"]) g = "town-cobble2";
    const gimg = T[g];
    if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1);
    else { c.fillStyle = isWall ? "#241f17" : "#6b5d44"; c.fillRect(sx, sy, t, t); if (!isWall && (mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.07)"; c.fillRect(sx, sy, t, t); } }
    const POI: Record<string, [string, string, number, string]> = {
      "t-inn": ["town-inn", "🏠", 1.6, "Inn"], "t-shop": ["town-shop", "🛒", 1.6, "Supplies"],
      "t-smith": ["town-smith", "🔨", 1.6, "Smith"], "t-revive": ["town-revive", "🔮", 1.6, "Revive"],
      "t-fountain": ["town-fountain", "⛲", 1.2, ""], "t-exit": ["town-exit", "🚪", 1.1, "Leave →"],
    };
    const poi = POI[cell];
    if (poi) {
      const img = T[poi[0]];
      if (img) { const h = t * poi[2], w = h * (img.width / img.height); c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.95 - h, w, h); }
      else { c.font = `${t * 0.74}px serif`; c.fillText(poi[1], sx + t / 2, sy + t / 2); }
      if (poi[3]) { c.font = `bold ${Math.max(9, t * 0.26)}px system-ui`; c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)"; const ly = sy + t * 1.02; c.strokeText(poi[3], sx + t / 2, ly); c.fillText(poi[3], sx + t / 2, ly); }
    } else if (isWall && !gimg) { c.font = `${t * 0.7}px serif`; c.fillStyle = "#3a5a2a"; c.fillText("🌳", sx + t / 2, sy + t / 2); }
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
        // pick the ground sprite: dungeon uses its tileset, overworld uses Greenvale; chest/boss/
        // miniboss sit on a floor/grass tile; a stable hash mixes in the variant for texture.
        let ground: string;
        if (inDun) {
          const dm: Record<string, string> = { grass: "floor", grass2: "floor2", path: "path", tree: "wall", bush: "rock", rock: "rock" };
          let base = cell === "chest" || cell === "miniboss" || cell === "boss" ? "floor" : (dm[cell] || "floor");
          if (base === "floor" && (mx * 7 + my * 13) % 4 === 0 && T[`${dset}-floor2`]) base = "floor2";
          ground = `${dset}-${base}`;
        } else {
          ground = cell === "chest" || cell === "miniboss" || cell === "boss" ? "grass" : cell;
          if (ground === "grass" && (mx * 7 + my * 13) % 4 === 0 && T.grass2) ground = "grass2";
        }
        const gimg = T[ground];
        if (gimg) c.drawImage(gimg, sx, sy, t + 1, t + 1); // +1px overlap hides hairline seams
        else {
          c.fillStyle = (inDun ? "#2a2740" : colors[cell]) || "#4a7a32"; c.fillRect(sx, sy, t, t);
          if (!inDun && (mx + my) % 2) { c.fillStyle = "rgba(0,0,0,.06)"; c.fillRect(sx, sy, t, t); }
          if (inDun) { c.fillStyle = "rgba(38,30,66,.5)"; c.fillRect(sx, sy, t, t); } // tint only when art missing
        }
        // overlays / object sprites (fall back to emoji if art isn't loaded)
        c.font = `${t * 0.82}px serif`;
        const obj = (img: HTMLImageElement | undefined, emoji: string, sc = 0.9) => {
          if (img) c.drawImage(img, sx + t * (1 - sc) / 2, sy + t * (1 - sc) / 2, t * sc, t * sc);
          else c.fillText(emoji, sx + t / 2, sy + t / 2);
        };
        if (cell === "chest") obj(inDun ? T[`${dset}-chest`] : T.chest, "📦", 0.8);
        else if (cell === "miniboss") c.fillText("🪖", sx + t / 2, sy + t / 2); // gate guardian — emoji for now
        else if (cell === "boss") obj(inDun ? T[`${dset}-entrance`] : undefined, Game.bossDefeated ? "🏴" : "⛺", 0.95);
        else if (!gimg && cell === "tree") c.fillText(inDun ? "🪨" : "🌲", sx + t / 2, sy + t / 2);
        else if (!gimg && cell === "bush") c.fillText(inDun ? "🦴" : "🌿", sx + t / 2, sy + t / 2);
      }
    // player marker: feet shadow + "you are here" ring + a tall walker sprite that pops (emoji fallback)
    const cx = (this.px - camx) * t + t / 2, cy = (this.py - camy) * t + t / 2;
    c.save();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.3, t * 0.13, 0, 0, Math.PI * 2); c.fillStyle = "rgba(0,0,0,.42)"; c.fill();
    c.beginPath(); c.ellipse(cx, cy + t * 0.42, t * 0.32, t * 0.14, 0, 0, Math.PI * 2); c.strokeStyle = "rgba(244,210,122,.75)"; c.lineWidth = Math.max(1.5, t * 0.05); c.stroke();
    if (T.player) {
      const ph = t * 1.55, pw = ph * (T.player.width / T.player.height);
      c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = 4; c.shadowOffsetY = 2;
      c.drawImage(T.player, cx - pw / 2, cy + t * 0.46 - ph, pw, ph);
      c.shadowBlur = 0;
    } else {
      c.font = `${t * 0.7}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText("🧝", cx, cy);
    }
    c.restore();
  },
};
