// MINIMAP — a non-blocking "you are here" overlay for the seamless continent (ADR 0008/0009).
//
// A HUD button (+ the `m` key) toggles a small canvas overlay that shows where the player stands.
// It is its OWN dismissible DOM/canvas layer (NOT the modal #overlay), so opening it never blocks the
// field draw loop or roaming — tap the button again, tap the scrim, or press Esc/`m` to close.
//
// WHAT IT SHOWS (all three field shapes):
//   • IN A BUILT ZONE (bigMapActive && bigZone): the zone's AUTHORED overworld blueprint
//     (buildAuthoredGrid, reflecting mini-boss progress) downscaled to a small map — tile kinds →
//     colors (tree/water dark, path/ground light) — with the player dot, the dungeon MOUTH, every
//     CHEST, and the rare LAIR flagged.
//   • OPEN CONTINENT (bigMapActive && !bigZone): a local window of the realized chunks around the
//     player (from Field's chunk cache), the player centred, + the nearest built zones named with a
//     compass arrow so the roamer can orient toward a settled land.
//   • DISCRETE / DUNGEON (the big-map-off fallback, and inside a dungeon): the live Field.map grid,
//     same color mapping + POI flags.
//
// PERFORMANCE: the minimap IMAGE is built only when the overlay is opened (and rebuilt on each open),
// NEVER per field frame — regionAt / realize stay off the per-frame path (the open-continent view
// reads only chunks Field already realized on move()).
//
// PRESENTATION/ORCHESTRATION (controllers): reads Field state + pure data/world helpers; no game-state
// mutation. Gold-on-dark, touch-friendly, iOS-Safari-safe (plain canvas, no deps).

import { $, el } from "../core/dom";
import { Field } from "./field";
import { Screens } from "./screens";
import { ZONES } from "../data/zones";
import { buildAuthoredGrid, placementOf } from "../data/world";

// Tile-kind → minimap color (gold-on-dark). Walls/canopy read dark, water cold blue, ground/road warm.
const KIND_COLOR: Record<string, string> = {
  tree: "#16241a", oldtree: "#16241a", deadtree: "#1a2230", orchard: "#16241a",
  water: "#243a52", bog: "#2a3a30", reed: "#33503a",
  grass: "#3a5a2c", grass2: "#436533", path: "#7a6a3a",
  bush: "#33522a", rock: "#4a4a44", mushroom: "#4a4a44", fern: "#33522a", wheat: "#5a6a30",
  // open-continent realized kinds that aren't authored
  uncharted: "#0a0f08",
};
// POI accent colors (bright, distinct from terrain).
const POI = {
  player: "#f4d27a", mouth: "#ff9a3c", chest: "#5fd16a", lair: "#b46bff",
};

// The minimap canvas pixel size (CSS px; the canvas backing store scales by dpr).
const MAP_W = 280, MAP_H = 200;

export const Minimap = {
  open: false,
  root: null as HTMLDivElement | null,

  // Build the overlay DOM once (a scrim + a gold-bordered card holding the canvas + legend).
  ensureDom(): HTMLDivElement {
    if (this.root) return this.root;
    const root = el("div", "minimap-scrim") as HTMLDivElement;
    root.innerHTML =
      `<div class="minimap-card">
         <div class="minimap-head"><span class="minimap-title">Map</span><span id="minimapWhere" class="minimap-where"></span></div>
         <canvas id="minimapCanvas"></canvas>
         <div class="minimap-legend">
           <span><i style="background:${POI.player}"></i>You</span>
           <span><i style="background:${POI.mouth}"></i>Dungeon</span>
           <span><i style="background:${POI.chest}"></i>Chest</span>
           <span><i style="background:${POI.lair}"></i>Lair</span>
         </div>
         <div class="minimap-foot small">Tap outside or press M / Esc to close.</div>
       </div>`;
    // Tap the scrim (but not the card) closes; the card swallows its own taps.
    root.addEventListener("pointerdown", (e) => { if (e.target === root) this.hide(); });
    const stage = $("#stage") ?? document.body;
    stage.appendChild(root);
    this.root = root;
    return root;
  },

  toggle(): void { this.open ? this.hide() : this.show(); },

  show(): void {
    // Only meaningful on the field (zone / open continent / dungeon) — ignore elsewhere.
    if (Screens.cur !== "field") return;
    const root = this.ensureDom();
    root.classList.add("on");
    this.open = true;
    this.render();
  },

  hide(): void {
    this.root?.classList.remove("on");
    this.open = false;
  },

  // BUILD the minimap image (called on open only — never per frame).
  render(): void {
    const canvas = $<HTMLCanvasElement>("#minimapCanvas");
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = MAP_W + "px";
    canvas.style.height = MAP_H + "px";
    canvas.width = Math.round(MAP_W * dpr);
    canvas.height = Math.round(MAP_H * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    const where = $("#minimapWhere");
    if (Field.bigMapActive() && Field.bigZone) { this.drawZone(ctx, Field.bigZone, where); }
    else if (Field.bigMapActive()) { this.drawOpen(ctx, where); }
    else { this.drawGrid(ctx, where); } // discrete overworld / any dungeon
  },

  // Fit a w×h tile grid into the MAP_W×MAP_H canvas (uniform scale, centered). Returns the transform.
  fit(w: number, h: number): { s: number; ox: number; oy: number } {
    const s = Math.min(MAP_W / w, MAP_H / h);
    return { s, ox: (MAP_W - w * s) / 2, oy: (MAP_H - h * s) / 2 };
  },

  cell(ctx: CanvasRenderingContext2D, s: number, ox: number, oy: number, x: number, y: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x * s, oy + y * s, Math.max(1, s + 0.5), Math.max(1, s + 0.5));
  },

  // A bright POI marker (a small filled diamond so it reads over the terrain) at a tile.
  marker(ctx: CanvasRenderingContext2D, s: number, ox: number, oy: number, x: number, y: number, color: string, big = false): void {
    const cx = ox + (x + 0.5) * s, cy = oy + (y + 0.5) * s, r = Math.max(big ? 4 : 3, s * (big ? 1.1 : 0.8));
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(0,0,0,.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  // ── IN-ZONE: the built zone's authored blueprint, player + POIs from its layout ──────────────────
  drawZone(ctx: CanvasRenderingContext2D, zoneId: string, where: Element | null): void {
    const z = ZONES.find((zz) => zz.id === zoneId);
    const pl = placementOf(zoneId);
    if (!z || !pl) { this.drawOpen(ctx, where); return; }
    const grid = buildAuthoredGrid(zoneId, Field.miniClearedFor(zoneId));
    const h = grid.length, w = grid[0]?.length ?? 0;
    if (!w) return;
    const { s, ox, oy } = this.fit(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
      this.cell(ctx, s, ox, oy, x, y, KIND_COLOR[grid[y][x]] ?? "#3a5a2c");

    const L = z.layout;
    // POIs from the authored layout (the mouth reflects mini-boss progress: it's still flagged either way).
    for (const c of L.chests) this.marker(ctx, s, ox, oy, c.x, c.y, POI.chest);
    if (L.lair) this.marker(ctx, s, ox, oy, L.lair.x, L.lair.y, POI.lair);
    this.marker(ctx, s, ox, oy, L.mouth.x, L.mouth.y, POI.mouth, true);
    // Player: world coords → this zone's authored local tile.
    const lx = Field.wx - pl.wx, ly = Field.wy - pl.wy;
    this.player(ctx, s, ox, oy, lx, ly);

    if (where) where.textContent = z.name;
  },

  // ── OPEN CONTINENT: a local window of realized chunks around the player + nearest-zone arrows ─────
  drawOpen(ctx: CanvasRenderingContext2D, where: Element | null): void {
    // A 60×42-tile window centred on the player (reads only already-realized chunks via Field.cellAt).
    const winW = 60, winH = 42;
    const x0 = Field.wx - (winW >> 1), y0 = Field.wy - (winH >> 1);
    const { s, ox, oy } = this.fit(winW, winH);
    for (let y = 0; y < winH; y++) for (let x = 0; x < winW; x++) {
      const cell = Field.cellAt(x0 + x, y0 + y);
      this.cell(ctx, s, ox, oy, x, y, KIND_COLOR[cell.kind] ?? "#3a5a2c");
    }
    // Built-zone cores that fall in the window get a faint mouth flag + name.
    for (const id of Field.bigBuiltZoneIds()) {
      const z = ZONES.find((zz) => zz.id === id), pl = placementOf(id);
      if (!z || !pl) continue;
      const mx = pl.wx + z.layout.mouth.x - x0, my = pl.wy + z.layout.mouth.y - y0;
      if (mx >= 0 && mx < winW && my >= 0 && my < winH) this.marker(ctx, s, ox, oy, mx, my, POI.mouth);
    }
    this.player(ctx, s, ox, oy, winW >> 1, winH >> 1);

    const near = Field.nearestBuiltZone();
    if (where) where.textContent = near ? `Open wilds — ${near.name} lies ${near.dir}` : "Open wilds";
  },

  // ── DISCRETE / DUNGEON: the live Field.map grid + POIs from Field's current anchors ──────────────
  drawGrid(ctx: CanvasRenderingContext2D, where: Element | null): void {
    const map = Field.map, h = map.length, w = map[0]?.length ?? 0;
    if (!w) return;
    const { s, ox, oy } = this.fit(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const k = map[y][x];
      // Map the discrete grid's POI tiles onto terrain colors (markers are drawn over them).
      const base = k === "chest" || k === "lair" || k === "mouth" || k === "miniboss" || k === "boss" ? "grass" : k;
      this.cell(ctx, s, ox, oy, x, y, KIND_COLOR[base] ?? "#3a5a2c");
    }
    for (const c of Field.chests) this.marker(ctx, s, ox, oy, c.x, c.y, POI.chest);
    if (Field.lairAt) this.marker(ctx, s, ox, oy, Field.lairAt.x, Field.lairAt.y, POI.lair);
    // Dungeon = the boss tile; overworld = the mouth.
    if (Field.inDungeon()) this.marker(ctx, s, ox, oy, Field.boss.x, Field.boss.y, POI.mouth, true);
    else this.marker(ctx, s, ox, oy, Field.mouth.x, Field.mouth.y, POI.mouth, true);
    this.player(ctx, s, ox, oy, Field.px, Field.py);

    if (where) where.textContent = Field.inDungeon() ? Field.zone().dungeon.name : Field.zone().name;
  },

  // The bright "you are here" dot: a glowing gold disc with a dark rim. Clamped on-canvas so a player
  // standing in the open continent OUTSIDE a zone's dense authored core still reads "here" at the edge.
  player(ctx: CanvasRenderingContext2D, s: number, ox: number, oy: number, x: number, y: number): void {
    const r = Math.max(4, s * 1.3);
    const cx = Math.max(r, Math.min(MAP_W - r, ox + (x + 0.5) * s));
    const cy = Math.max(r, Math.min(MAP_H - r, oy + (y + 0.5) * s));
    ctx.save();
    ctx.shadowColor = "rgba(244,210,122,.9)"; ctx.shadowBlur = 8;
    ctx.fillStyle = POI.player;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,.85)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  },
};
