// MINIMAP — a non-blocking "you are here" overlay for the seamless continent (ADR 0008/0009/0011).
//
// A HUD button (+ the `m` key) toggles a small canvas overlay that shows where the player stands.
// It is its OWN dismissible DOM/canvas layer (NOT the modal #overlay), so opening it never blocks the
// field draw loop or roaming — tap the button again, tap the scrim, or press Esc/`m` to close.
//
// ── TWO INDEPENDENT AXES (do not flatten these into one) ────────────────────────────────────────────
// The minimap is described by TWO orthogonal choices, resolved separately each render():
//   1. ZOOM  (`view`): "local" = the close-in view around the player; "continent" = the zoomed-OUT
//      Aurelion overview (ADR 0011). A header toggle flips this; it persists across opens. The
//      continent view is only OFFERED on the seamless big map (hidden in dungeons/towns/zone-blueprint),
//      because there is no continent to zoom out to elsewhere.
//   2. FIELD SHAPE: which space the player is in — A BUILT ZONE, the OPEN CONTINENT, or a DISCRETE
//      grid / DUNGEON. This is read from Field state, NOT chosen by the user.
// `view==="continent"` overrides the field-shape draw with the single continent overview. Otherwise the
// LOCAL view dispatches by field shape (the three draw* below). Keep the axes separate: a future editor
// adding e.g. a "region" zoom should extend the `view` union, not entangle it with the field-shape switch.
//
// LOCAL view, by field shape:
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
// CONTINENT view (ADR 0011 — the zoomed-out overview): the Aurelion zone polygons (reusing worldMap's
// polygon RENDERING — tracePoly/hatchPoly/the C palette, NOT its hover/drill interaction) for REVEALED
// regions ONLY (isRegionKnown — backlog/unknown stay fogged). Framed so the player AND the current
// Objective region are both visible. The objective region (a derived `travel` goal / any known-but-not-
// entered region) gets a BRIGHT coastline + full-brightness name; other revealed zones sit muted. This
// is light/emphasis — NOT a HUD quest-pin (ADR 0011 keeps direction diegetic).
//
// PERFORMANCE: the minimap IMAGE is built only when the overlay is opened (and rebuilt on each open /
// toggle), NEVER per field frame — regionAt / realize stay off the per-frame path (the open-continent
// view reads only chunks Field already realized on move()).
//
// PRESENTATION/ORCHESTRATION (controllers): reads Field state + pure data/world + systems/progress
// helpers; no game-state mutation. Gold-on-dark, touch-friendly, iOS-Safari-safe (plain canvas, no deps).

import { $, el } from "../core/dom";
import { Field } from "./field";
import { Screens } from "./screens";
import { ZONES } from "../data/zones";
import { buildAuthoredGrid, placementOf, bbox, ZONE_REGIONS, type BBox } from "../data/world";
import { isRegionKnown, isRegionEntered, currentObjective } from "../systems/progress";
import { C, tracePoly, hatchPoly, suggestedLevelOf } from "./worldMap";

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

// The minimap canvas size (CSS px; the canvas backing store scales by dpr). MAX is the cap; render()
// shrinks the width to the available stage so the card stays inside the viewport on a small phone.
const MAP_MAX_W = 300, MAP_H = 200;
// The current canvas CSS dimensions for this open (set in render(), read by the draw* + the player dot).
let mapW = MAP_MAX_W;

export const Minimap = {
  open: false,
  root: null as HTMLDivElement | null,
  // ZOOM axis (see the header's two-axis note): "local" close-in view vs the "continent" zoomed-out
  // overview (ADR 0011). Independent of the field-shape axis; persists across opens; flipped by the toggle.
  view: "local" as "local" | "continent",

  // Build the overlay DOM once (a scrim + a gold-bordered card holding the header toggle, canvas, legend).
  ensureDom(): HTMLDivElement {
    if (this.root) return this.root;
    const root = el("div", "minimap-scrim") as HTMLDivElement;
    root.innerHTML =
      `<div class="minimap-card">
         <div class="minimap-head">
           <span class="minimap-title">Map</span>
           <span id="minimapWhere" class="minimap-where"></span>
           <button id="minimapZoom" class="btn minimap-zoom" type="button"></button>
         </div>
         <canvas id="minimapCanvas"></canvas>
         <div class="minimap-legend" id="minimapLegend"></div>
         <div class="minimap-foot small">Tap outside or press M / Esc to close.</div>
       </div>`;
    // Tap the scrim (but not the card) closes; the card swallows its own taps.
    root.addEventListener("pointerdown", (e) => { if (e.target === root) this.hide(); });
    const stage = $("#stage") ?? document.body;
    stage.appendChild(root);
    this.root = root;
    // The zoom toggle flips the view axis + re-renders (no pinch/swipe — a single ≥44px button).
    $("#minimapZoom")?.addEventListener("click", () => {
      this.view = this.view === "continent" ? "local" : "continent";
      this.render();
    });
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

  /** The continent overview is only OFFERED on the seamless big map (hidden in dungeons/towns/blueprint). */
  canContinent(): boolean { return Field.bigMapActive(); },

  // BUILD the minimap image (called on open / toggle only — never per frame).
  render(): void {
    const canvas = $<HTMLCanvasElement>("#minimapCanvas");
    if (!canvas) return;
    // The continent overview is only available on the big map; fall back to local elsewhere.
    const continent = this.view === "continent" && this.canContinent();
    this.syncToggle(continent);

    // RESPONSIVE width: cap to MAP_MAX_W but never wider than the stage (minus padding) — keeps the card
    // inside a small phone viewport. Height fixed (the card is short; the legend + foot follow).
    const stage = $("#stage");
    const stageW = stage?.clientWidth ?? window.innerWidth;
    mapW = Math.max(200, Math.min(MAP_MAX_W, stageW - 48));

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = mapW + "px";
    canvas.style.height = MAP_H + "px";
    canvas.width = Math.round(mapW * dpr);
    canvas.height = Math.round(MAP_H * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, mapW, MAP_H);
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, mapW, MAP_H);

    const where = $("#minimapWhere");
    // Clear the objective-pulse by default; drawContinent re-adds it only when a destination is lit.
    if (!continent) this.root?.querySelector(".minimap-card")?.classList.remove("has-objective");
    if (continent) { this.drawContinent(ctx, where); }
    else if (Field.bigMapActive() && Field.bigZone) { this.drawZone(ctx, Field.bigZone, where); }
    else if (Field.bigMapActive()) { this.drawOpen(ctx, where); }
    else { this.drawGrid(ctx, where); } // discrete overworld / any dungeon
  },

  // Show/hide + label the zoom toggle, and swap the legend rows to the current view. The toggle only
  // appears when the continent overview is reachable (on the big map); the legend mirrors what's drawn.
  syncToggle(continent: boolean): void {
    const btn = $("#minimapZoom") as HTMLButtonElement | null;
    if (btn) {
      const offerable = this.canContinent();
      btn.style.display = offerable ? "" : "none";
      btn.textContent = continent ? "⊖ Local" : "⊕ Continent";
    }
    const legend = $("#minimapLegend");
    if (!legend) return;
    legend.innerHTML = continent
      ? `<span><i style="background:${POI.player}"></i>You</span>
         <span><i style="background:var(--gold2)"></i>Next — head here</span>
         <span><i style="background:var(--gold);opacity:.45"></i>Named — not yet visited</span>`
      : `<span><i style="background:${POI.player}"></i>You</span>
         <span><i style="background:${POI.mouth}"></i>Dungeon</span>
         <span><i style="background:${POI.chest}"></i>Chest</span>
         <span><i style="background:${POI.lair}"></i>Lair</span>`;
  },

  // Fit a w×h tile grid into the mapW×MAP_H canvas (uniform scale, centered). Returns the transform.
  fit(w: number, h: number): { s: number; ox: number; oy: number } {
    const s = Math.min(mapW / w, MAP_H / h);
    return { s, ox: (mapW - w * s) / 2, oy: (MAP_H - h * s) / 2 };
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

  // ── CONTINENT OVERVIEW (ADR 0011): the zoomed-out Aurelion map, REVEALED regions only ────────────
  // Reuses worldMap's polygon RENDERING (tracePoly/hatchPoly/the C palette) — NOT its hover/drill (dead
  // on touch). A region shows iff isRegionKnown(Field.wayfinding, zoneId): backlog/unknown stay fogged.
  // The current Objective region (a derived `travel` goal, or any known-but-not-entered region) gets a
  // bright coastline + full-brightness name; every other revealed zone is muted. Framed so the player AND
  // the objective region are both on-screen. This is light/emphasis, NOT a quest-pin (ADR 0011: diegetic).
  drawContinent(ctx: CanvasRenderingContext2D, where: Element | null): void {
    const curZone = Field.bigZone || ZONES[Field.zoneIndex]?.id || "";
    // The derived next step (pure). We only HIGHLIGHT a destination region (travel / known-not-entered),
    // never a "clear-gate" (that's a local-zone task with no other region to point at).
    const obj = currentObjective(Field.wayfinding, { currentZone: curZone, gateCleared: (z) => Field.miniClearedFor(z) });
    let highlightId = obj.kind === "travel" ? obj.zoneId : "";
    if (!highlightId) {
      // fall back: the first KNOWN-but-not-entered region (a place the world named you haven't reached).
      for (const zr of ZONE_REGIONS)
        if (zr.zone && isRegionKnown(Field.wayfinding, zr.zone) && !isRegionEntered(Field.wayfinding, zr.zone)) { highlightId = zr.zone; break; }
    }

    // Revealed built regions = those the player KNOWS of (entered or named). Backlog/unknown stay hidden.
    const revealed = ZONE_REGIONS.filter((zr) => zr.zone && isRegionKnown(Field.wayfinding, zr.zone));

    // FRAME: a bbox spanning the player tile AND every revealed region (so the objective is always in
    // view), padded ~12% + a margin, then expanded to the canvas aspect so polygons aren't distorted.
    let minX = Field.wx, minY = Field.wy, maxX = Field.wx, maxY = Field.wy;
    const acc = (b: BBox) => { if (b.minX < minX) minX = b.minX; if (b.minY < minY) minY = b.minY; if (b.maxX > maxX) maxX = b.maxX; if (b.maxY > maxY) maxY = b.maxY; };
    for (const zr of revealed) acc(bbox(zr.shape));
    const win = this.frameBox({ minX, minY, maxX, maxY });
    const winW = win.maxX - win.minX, winH = win.maxY - win.minY;
    const s = Math.min(mapW / winW, MAP_H / winH);
    const ox = (mapW - winW * s) / 2 - win.minX * s, oy = (MAP_H - winH * s) / 2 - win.minY * s;
    const px = (x: number) => ox + x * s, py = (y: number) => oy + y * s;

    // A subtle pulsing glow on the canvas marks "there's somewhere to head" — a CSS animation (gated by
    // the global prefers-reduced-motion rule in index.html, which collapses all animations to instant).
    this.root?.querySelector(".minimap-card")?.classList.toggle("has-objective", !!highlightId);

    for (const zr of revealed) {
      const focused = zr.zone === highlightId;
      // FILL: muted green for revealed; the objective gets a warmer tint. Backlog never reaches here.
      tracePoly(ctx, zr.shape, px, py);
      ctx.fillStyle = focused ? "rgba(224,169,46,.16)" : "rgba(95,180,140,.10)";
      ctx.fill();
      // COASTLINE: the objective region in bright --gold2; others muted.
      tracePoly(ctx, zr.shape, px, py);
      ctx.strokeStyle = focused ? "#f4d27a" : "rgba(127,216,176,.55)";
      ctx.lineWidth = focused ? 2.2 : 1;
      ctx.stroke();
      const bb = bbox(zr.shape);
      const z = ZONES.find((zz) => zz.id === zr.zone);
      if (z) {
        // worldMap's Lv N+ danger label on revealed BUILT zones (the relative-danger read).
        const sug = suggestedLevelOf(zr.zone!);
        const label = z.name + (sug != null ? `  Lv ${sug}+` : "");
        ctx.fillStyle = focused ? "#f4d27a" : "rgba(154,147,168,.85)";
        ctx.font = `${focused ? "bold " : ""}10px system-ui, sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(label, px(bb.minX) + 3, py(bb.minY) + 2);
      }
    }

    // "you are here" dot — the player's world tile through the same (s, ox, oy) transform. player()
    // expects tile coords + a fit transform; our ox/oy already fold in the window origin, so pass wx/wy.
    this.player(ctx, s, ox, oy, Field.wx, Field.wy);

    // Honest, diegetic where-line (mirrors the open-continent compass; never regress it). Name the
    // objective if there is one; otherwise the nearest settled land's direction.
    const hz = highlightId ? ZONES.find((zz) => zz.id === highlightId) : undefined;
    if (where) {
      if (hz) where.textContent = `Aurelion — make for ${hz.name}`;
      else { const near = Field.nearestBuiltZone(); where.textContent = near ? `Aurelion — ${near.name} lies ${near.dir}` : "Aurelion"; }
    }
  },

  /** Pad a tile-space bbox ~12% + a margin, then grow the shorter axis to the canvas aspect (no distortion). */
  frameBox(bb: BBox): BBox {
    const w = Math.max(1, bb.maxX - bb.minX), h = Math.max(1, bb.maxY - bb.minY);
    const pad = Math.max(w, h) * 0.12 + 6;
    let minX = bb.minX - pad, minY = bb.minY - pad, maxX = bb.maxX + pad, maxY = bb.maxY + pad;
    const aspect = mapW / MAP_H;
    const winW = maxX - minX, winH = maxY - minY;
    if (winW / winH > aspect) { const need = winW / aspect, add = (need - winH) / 2; minY -= add; maxY += add; }
    else { const need = winH * aspect, add = (need - winW) / 2; minX -= add; maxX += add; }
    return { minX, minY, maxX, maxY };
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
    const cx = Math.max(r, Math.min(mapW - r, ox + (x + 0.5) * s));
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
