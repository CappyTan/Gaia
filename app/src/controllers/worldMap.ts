// In-app WORLD MAP view ("the World Map screen", ADR 0009 §7): a read-only design/dev view that
// renders the world hierarchy — the non-square 960×640 (3:2) surface (or underworld) coordinate
// space with the painted Continent / Zone / Area boundaries drawn as ORGANIC POLYGONS (filled +
// stroked, labeled, draft regions hatched) — so the designer can SEE the world and watch it fill in.
// Empty map space reads as "to build"/ocean (the backlog made visible). Shapes match Dara's canon map.
//
// DRILL-DOWN NAVIGATION (presentation only): the view holds a FOCUS state
//   { mapId, continentId?, zoneId?, areaId? }
// and renders SCALED/ZOOMED to the focused region's bbox (with padding). Clicking the canvas converts
// the click → world (x,y) via the current transform, runs regionAt, and drills to the NEXT level down
// at that point (overworld → continent → zone → area). A breadcrumb (each crumb clickable) and a
// Back/Up control zoom back out. Clicking empty space / a region with no deeper level does nothing.
//
// PRESENTATION ONLY (ADR 0005): reads data/world.ts; no game-state mutation, no DB writes. Canvas
// (matching controllers/field.ts). Wired to the title screen like the Data screen (DataBrowser):
// title button → window bridge → Overlay.show + draw.

import {
  MAPS, CONTINENTS, ZONE_REGIONS, AREAS, OVERWORLD_ID,
  worldMap, regionAt, bbox, type WorldMap, type Polygon, type BBox,
} from "../data/world";
import { ZONES } from "../data/zones";
import { ENEMIES } from "../data/enemies";
import { GAME_VERSION } from "../data/version";
import { Overlay } from "../ui/overlay";

// A built zone's SUGGESTED LEVEL: the min enemy level across its opening band's sets (band[0]) — the
// relative-danger signal, derived cheaply from the existing encounter data (no new data). Mirrors
// Field.suggestedLevel; kept local so the World Map can label built zones without a controller import.
function suggestedLevelOf(zoneId: string): number | undefined {
  const z = ZONES.find((zz) => zz.id === zoneId);
  const sets = z?.bands[0]?.sets;
  if (!sets) return undefined;
  let min = Infinity;
  for (const s of sets) for (const k of s) { const lv = ENEMIES[k]?.lvl; if (lv != null && lv < min) min = lv; }
  return min === Infinity ? undefined : min;
}

// Palette (gold-on-dark, matches index.html CSS vars). EXPORTED so the minimap's continent overview
// (controllers/minimap.ts) reuses this view's polygon RENDERING (the same coastline/fill colors) without
// duplicating the palette — see Minimap's two-axis header comment.
export const C = {
  empty: "#0a0a0f",      // backlog / unpainted space
  grid: "rgba(120,110,150,.10)",
  continentFill: "rgba(224,169,46,.07)",
  continentLine: "rgba(224,169,46,.55)",
  continentFocus: "rgba(224,169,46,.95)",
  zoneFill: "rgba(95,180,140,.12)",
  zoneLine: "#7fd8b0",
  areaFill: "rgba(120,150,255,.14)",
  areaLine: "#9aa9ff",
  draftLine: "#c79a52",
  label: "#f4d27a",
  dim: "#9a93a8",
};

const CANVAS_ID = "worldMapCanvas";

// ── Reusable polygon RENDERING (shared with the minimap's continent overview) ────────────────────
// These are the pure draw primitives — trace an organic region path, hatch-fill a draft region — that
// BOTH this World Map view and controllers/minimap.ts use, so the overview reads as the same map (same
// coastline shapes + gold-on-dark palette). `px`/`py` map tile coords → CSS px under the caller's window.

/** Trace an organic region polygon into the current path (caller fills/strokes). */
export function tracePoly(ctx: CanvasRenderingContext2D, poly: Polygon, px: (n: number) => number, py: (n: number) => number): void {
  ctx.beginPath();
  poly.forEach((p, i) => (i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y))));
  ctx.closePath();
}

/** Diagonal hatch fill clipped to an organic polygon — marks draft/provisional regions (ADR 0009 §1). */
export function hatchPoly(ctx: CanvasRenderingContext2D, poly: Polygon, px: (n: number) => number, py: (n: number) => number): void {
  ctx.save();
  tracePoly(ctx, poly, px, py);
  ctx.clip();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of poly) {
    const x = px(p.x), y = py(p.y);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  ctx.strokeStyle = "rgba(199,154,82,.28)";
  ctx.lineWidth = 1;
  const h = maxY - minY;
  for (let d = minX - h; d < maxX; d += 6) {
    ctx.beginPath();
    ctx.moveTo(d, minY);
    ctx.lineTo(d + h, maxY);
    ctx.stroke();
  }
  ctx.restore();
}

/** A built zone's SUGGESTED entry level (the relative-danger signal) — exported for the minimap overview. */
export { suggestedLevelOf };
// Levels deep, for the breadcrumb + "what does a click drill to next" logic.
type Level = "overworld" | "continent" | "zone" | "area";

// The current view-to-canvas mapping (recomputed each draw); click handling reads it back.
interface View { s: number; ox: number; oy: number; cssW: number; cssH: number; }

export const WorldMapView = {
  mapId: OVERWORLD_ID as string,
  // FOCUS state — which region the view is zoomed to. Empty = the whole overworld.
  continentId: undefined as string | undefined,
  zoneId: undefined as string | undefined,
  areaId: undefined as string | undefined,
  view: { s: 1, ox: 0, oy: 0, cssW: 0, cssH: 0 } as View,

  // ── Public navigation entry points (called from the inline-handler bridge) ──────────────────────

  show(mapId?: string): void {
    if (mapId && mapId !== this.mapId) { this.mapId = mapId; this.continentId = this.zoneId = this.areaId = undefined; }
    this.render();
  },

  /** Jump the focus to a named level (breadcrumb clicks). Pass nothing to focus the whole overworld. */
  focus(continentId?: string, zoneId?: string, areaId?: string): void {
    this.continentId = continentId || undefined;
    this.zoneId = zoneId || undefined;
    this.areaId = areaId || undefined;
    this.render();
  },

  /** Zoom out one level (Back/Up). */
  up(): void {
    if (this.areaId) this.areaId = undefined;
    else if (this.zoneId) this.zoneId = undefined;
    else if (this.continentId) this.continentId = undefined;
    this.render();
  },

  // ── Focus helpers ───────────────────────────────────────────────────────────────────────────────

  level(): Level {
    if (this.areaId) return "area";
    if (this.zoneId) return "zone";
    if (this.continentId) return "continent";
    return "overworld";
  },

  /** The polygon the view is focused on (undefined at the overworld level → fit the whole map). */
  focusedShape(): Polygon | undefined {
    if (this.areaId) return AREAS.find((a) => a.id === this.areaId)?.shape;
    if (this.zoneId) return ZONE_REGIONS.find((z) => z.id === this.zoneId)?.shape;
    if (this.continentId) return CONTINENTS.find((c) => c.id === this.continentId)?.shape;
    return undefined;
  },

  // ── Render: HTML shell + breadcrumb + canvas, then draw ──────────────────────────────────────────

  render(): void {
    const map = worldMap(this.mapId)!;
    const tab = (m: WorldMap): string =>
      `<button class="btn${m.id === map.id ? " gold" : ""}" onclick="WorldMapView.show('${m.id}')">${m.kind === "overworld" ? "Overworld" : m.kind === "underworld" ? "Underworld" : m.name}</button>`;

    const continents = CONTINENTS.filter((c) => c.map === map.id);
    const zones = ZONE_REGIONS.filter((z) => continents.some((c) => c.id === z.continent));
    const builtN = zones.filter((z) => z.zone).length;
    const backlogN = zones.length - builtN;
    const areas = AREAS.filter((a) => zones.some((z) => z.id === a.zone));
    const counts = `${continents.length} continent${continents.length === 1 ? "" : "s"} · ${builtN} built zone${builtN === 1 ? "" : "s"}${backlogN ? ` + ${backlogN} backlog` : ""} · ${areas.length} area${areas.length === 1 ? "" : "s"}`;

    const legend = `<div class="small" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:6px 0">
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.continentLine};background:${C.continentFill};vertical-align:middle"></i> Continent</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.zoneLine};background:${C.zoneFill};vertical-align:middle"></i> Built zone</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px dashed ${C.draftLine};vertical-align:middle"></i> Backlog region</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.areaLine};background:${C.areaFill};vertical-align:middle"></i> Area ·draft</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.grid};background:${C.empty};vertical-align:middle"></i> ocean = to build</span>
    </div>`;

    Overlay.show(`<h2 class="title-gold">World Map — Gaia ${GAME_VERSION}</h2>
      <div class="small" style="margin-top:-4px;opacity:.7">${map.name} · ${map.width}×${map.height} tiles · ${counts}</div>
      <div class="row" style="margin:6px 0">${MAPS.map(tab).join("")}</div>
      ${this.breadcrumbHtml(map)}
      ${legend}
      <div style="position:relative;width:100%;display:flex;justify-content:center">
        <canvas id="${CANVAS_ID}" style="max-width:100%;border:1px solid var(--line);border-radius:8px;background:${C.empty};touch-action:none;cursor:pointer"></canvas>
      </div>
      <div class="small" id="worldMapHover" style="min-height:18px;margin-top:6px;text-align:center">${this.hintFor()}</div>
      <div class="row" style="margin-top:8px"><button class="btn gold" onclick="Overlay.hide()">Close</button></div>`);

    // Draw after the overlay HTML is in the DOM and laid out.
    requestAnimationFrame(() => this.draw(map));
  },

  /** Breadcrumb ("Overworld › Aurelion › Greenvale › …") — each crumb jumps the focus; + a Back/Up control. */
  breadcrumbHtml(map: WorldMap): string {
    const cont = this.continentId ? CONTINENTS.find((c) => c.id === this.continentId) : undefined;
    const zone = this.zoneId ? ZONE_REGIONS.find((z) => z.id === this.zoneId) : undefined;
    const area = this.areaId ? AREAS.find((a) => a.id === this.areaId) : undefined;
    const crumb = (label: string, call: string, active: boolean): string =>
      active
        ? `<span style="color:var(--gold2);font-weight:bold">${label}</span>`
        : `<a href="javascript:void(0)" onclick="${call}" style="color:var(--gold);text-decoration:none">${label}</a>`;

    const overworldLabel = map.kind === "underworld" ? "Underworld" : "Overworld";
    const parts = [crumb(overworldLabel, "WorldMapView.focus()", !cont)];
    if (cont) parts.push(crumb(cont.name, `WorldMapView.focus('${cont.id}')`, !zone));
    if (zone) parts.push(crumb(zone.name, `WorldMapView.focus('${cont!.id}','${zone.id}')`, !area));
    if (area) parts.push(crumb(area.name + (area.draft ? " ·draft" : ""), "", true));

    const canUp = !!cont; // anything below overworld can go up
    const back = `<button class="btn" ${canUp ? "" : "disabled style=\"opacity:.4\""} onclick="WorldMapView.up()" title="Zoom out one level">‹ Back</button>`;
    return `<div class="row" style="margin:4px 0;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap">
      ${back}
      <span class="small" style="color:var(--dim)">${parts.join(' <span style="opacity:.5">›</span> ')}</span>
    </div>`;
  },

  hintFor(): string {
    switch (this.level()) {
      case "overworld": return "Click a continent to zoom in. Hover to inspect its continent › zone › area chain.";
      case "continent": return "Click a zone to zoom in (built or backlog). Back/breadcrumb to zoom out.";
      case "zone": return "Click an area to zoom to the deepest level. Back/breadcrumb to zoom out.";
      case "area": return "Deepest level. Use Back or the breadcrumb to zoom out.";
    }
  },

  // ── Draw ──────────────────────────────────────────────────────────────────────────────────────

  draw(map: WorldMap): void {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The view is sized to the FOCUSED region's bbox (with padding), or the whole map at the
    // overworld level. We compute a uniform scale that fits the focus window into the canvas width,
    // then an origin (ox,oy) in tile-space so the focus window sits centered. Aspect ratio preserved.
    const win = this.focusWindow(map);
    const cssW = Math.max(280, Math.min(canvas.parentElement?.clientWidth || 640, 640));
    const winW = win.maxX - win.minX, winH = win.maxY - win.minY;
    const s = cssW / winW;                 // tile → CSS px (uniform)
    const cssH = winH * s;
    const ox = win.minX, oy = win.minY;    // tile-space origin of the visible window
    this.view = { s, ox, oy, cssW, cssH };

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // tile coords → CSS px under the current focus window.
    const px = (x: number) => (x - ox) * s;
    const py = (y: number) => (y - oy) * s;

    const trace = (poly: Polygon) => tracePoly(ctx, poly, px, py);

    // Backdrop = ocean / empty / backlog (the Great Expanse and named seas).
    ctx.fillStyle = C.empty;
    ctx.fillRect(0, 0, cssW, cssH);

    // Faint coordinate grid (every 80 tiles) so empty ocean reads as scaled space, not a void.
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (let g = 0; g <= map.width; g += 80) {
      ctx.beginPath(); ctx.moveTo(px(g), py(oy)); ctx.lineTo(px(g), py(oy + winH)); ctx.stroke();
    }
    for (let g = 0; g <= map.height; g += 80) {
      ctx.beginPath(); ctx.moveTo(px(ox), py(g)); ctx.lineTo(px(ox + winW), py(g)); ctx.stroke();
    }

    const lvl = this.level();
    const continents = CONTINENTS.filter((c) => c.map === map.id);

    // Continents: organic landmass — tinted fill + coastline stroke + label at the NW of its bbox.
    // The focused continent (when zoomed in) gets a brighter coastline so it reads as "current".
    for (const c of continents) {
      const focused = c.id === this.continentId;
      trace(c.shape);
      ctx.fillStyle = C.continentFill;
      ctx.fill();
      ctx.strokeStyle = focused ? C.continentFocus : C.continentLine;
      ctx.lineWidth = focused ? 2 : 1.5;
      ctx.stroke();
      const bb = bbox(c.shape);
      // Show continent labels at the overworld level (children = continents) and on the focused one.
      if (lvl === "overworld" || focused) {
        ctx.fillStyle = focused ? C.continentFocus : C.continentLine;
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillText(c.name.toUpperCase(), px(bb.minX) + 4, py(bb.minY) + 2);
      }
    }

    // Zones: organic regions. BUILT zones get the solid green highlight; BACKLOG regions get a
    // muted hatched fill + dashed gold outline (named-but-not-yet-built). Drawn for all continents,
    // but labels appear when zones are the focused level's CHILDREN (continent/zone level) for legibility.
    const zones = ZONE_REGIONS.filter((z) => continents.some((c) => c.id === z.continent));
    // Label zones once we're inside a continent — OR, for a single-continent map (the underworld,
    // which is ONE realm = "The Forgotten Civilization"), at the top level too, so the complexes read
    // as placed/labeled without needing to drill in first.
    const singleContinentMap = continents.length === 1;
    const showZoneLabels = lvl === "continent" || lvl === "zone" || lvl === "area" || singleContinentMap;
    for (const z of zones) {
      const built = !!z.zone;
      const focused = z.id === this.zoneId;
      trace(z.shape);
      ctx.fillStyle = built ? C.zoneFill : "rgba(199,154,82,.06)";
      ctx.fill();
      const bb = bbox(z.shape);
      if (!built) this.hatchPath(ctx, z.shape, px, py);
      ctx.strokeStyle = built ? C.zoneLine : C.draftLine;
      ctx.lineWidth = focused ? 2.4 : built ? 1.6 : 1.1;
      ctx.setLineDash(built ? [] : [4, 3]);
      trace(z.shape);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label zones when they're the navigable children (focused on a continent), or when focused,
      // or — on a single-continent map (the underworld realm) — at the top level too.
      const labelThis = focused || (showZoneLabels && z.continent === this.continentId)
        || (singleContinentMap && showZoneLabels && z.continent === continents[0].id);
      if (labelThis) {
        ctx.fillStyle = built ? C.zoneLine : C.draftLine;
        ctx.font = `${built ? "bold " : ""}11px system-ui, sans-serif`;
        ctx.textBaseline = "top";
        // BUILT zones append their suggested entry level ("Greenvale  Lv 1+") so the map signals
        // relative danger; backlog regions stay bare (no encounter data).
        const sug = built && z.zone ? suggestedLevelOf(z.zone) : undefined;
        const label = (built ? "" : "·") + z.name + (sug != null ? `  Lv ${sug}+` : "");
        ctx.fillText(label, px(bb.minX) + 3, py(bb.minY) + 2);
      }
    }

    // Areas: organic inner shapes, hatched (all draft) + dashed outline. Shown for built zones; labels
    // appear when areas are the focused level's children (zone/area level) so they stay legible.
    const areas = AREAS.filter((a) => zones.some((z) => z.id === a.zone && z.zone));
    const showAreaLabels = lvl === "zone" || lvl === "area";
    for (const a of areas) {
      const focused = a.id === this.areaId;
      const bb = bbox(a.shape);
      trace(a.shape);
      ctx.fillStyle = C.areaFill;
      ctx.fill();
      if (a.draft) this.hatchPath(ctx, a.shape, px, py);
      ctx.strokeStyle = focused ? C.areaLine : a.draft ? C.draftLine : C.areaLine;
      ctx.lineWidth = focused ? 2.2 : 1;
      ctx.setLineDash(a.draft && !focused ? [3, 2] : []);
      trace(a.shape);
      ctx.stroke();
      ctx.setLineDash([]);
      const wide = px(bb.maxX) - px(bb.minX) > 38 && py(bb.maxY) - py(bb.minY) > 16;
      if ((focused || (showAreaLabels && a.zone === this.zoneId)) && (wide || focused)) {
        ctx.fillStyle = C.label;
        ctx.font = "9px system-ui, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillText((a.draft ? "·" : "") + a.name, px(bb.minX) + 2, py(bb.minY) + 2);
      }
    }

    this.wireInput(canvas, map);
  },

  /** The visible tile-space window: the focused region's bbox padded ~12%, clamped to the map. */
  focusWindow(map: WorldMap): BBox {
    const shape = this.focusedShape();
    if (!shape) return { minX: 0, minY: 0, maxX: map.width, maxY: map.height };
    const bb = bbox(shape);
    const w = bb.maxX - bb.minX, h = bb.maxY - bb.minY;
    const pad = Math.max(w, h) * 0.18 + 8;
    // Pad, then expand the shorter axis so the window keeps the map's 3:2 aspect (no distortion).
    let minX = bb.minX - pad, minY = bb.minY - pad, maxX = bb.maxX + pad, maxY = bb.maxY + pad;
    const aspect = map.width / map.height;
    let winW = maxX - minX, winH = maxY - minY;
    if (winW / winH > aspect) { // too wide → grow height
      const need = winW / aspect; const add = (need - winH) / 2; minY -= add; maxY += add;
    } else { // too tall → grow width
      const need = winH * aspect; const add = (need - winW) / 2; minX -= add; maxX += add;
    }
    return { minX, minY, maxX, maxY };
  },

  // ── Input: hover inspect + click-to-drill ────────────────────────────────────────────────────────

  wireInput(canvas: HTMLCanvasElement, map: WorldMap): void {
    // Canvas CSS-px → tile coords under the current focus window.
    const toTile = (clientX: number, clientY: number): { tx: number; ty: number } => {
      const r = canvas.getBoundingClientRect();
      const cx = ((clientX - r.left) / r.width) * this.view.cssW;
      const cy = ((clientY - r.top) / r.height) * this.view.cssH;
      return { tx: Math.floor(cx / this.view.s + this.view.ox), ty: Math.floor(cy / this.view.s + this.view.oy) };
    };

    const inspect = (clientX: number, clientY: number) => {
      const { tx, ty } = toTile(clientX, clientY);
      const out = document.getElementById("worldMapHover");
      if (!out) return;
      if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return;
      const res = regionAt(map.id, tx, ty);
      const chain = [res.continent?.name, res.zone?.name, res.area ? (res.area.draft ? res.area.name + " ·draft" : res.area.name) : undefined]
        .filter(Boolean).join(" › ");
      out.innerHTML = chain
        ? `(${tx}, ${ty}) — <span style="color:var(--gold2)">${chain}</span>`
        : `(${tx}, ${ty}) — <span style="color:var(--dim)">unpainted (to build)</span>`;
    };

    canvas.onmousemove = (e) => inspect(e.clientX, e.clientY);

    // Tap/click drills to the next level down at the clicked point (taps == clicks on touch).
    canvas.onpointerdown = (e) => {
      inspect(e.clientX, e.clientY);
      const { tx, ty } = toTile(e.clientX, e.clientY);
      this.drillAt(map, tx, ty);
    };
  },

  /** Click → regionAt → drill one level deeper at (tx,ty). No-op if there's no deeper region there. */
  drillAt(map: WorldMap, tx: number, ty: number): void {
    if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return;
    const res = regionAt(map.id, tx, ty);
    const lvl = this.level();
    if (lvl === "overworld") {
      if (res.continent) this.focus(res.continent.id);
      else this.nudge();
    } else if (lvl === "continent") {
      // Drill to a zone — only if the click is within the focused continent.
      if (res.continent && res.continent.id === this.continentId && res.zone) this.focus(res.continent.id, res.zone.id);
      else if (res.continent && res.continent.id !== this.continentId) this.focus(res.continent.id); // hop continents
      else this.nudge();
    } else if (lvl === "zone") {
      // Drill to an area — only built zones have areas; require the click to land in one.
      if (res.zone?.id === this.zoneId && res.area) this.focus(this.continentId, this.zoneId, res.area.id);
      else if (res.zone && res.zone.id !== this.zoneId && res.continent?.id === this.continentId) this.focus(this.continentId, res.zone.id); // hop zones
      else this.nudge();
    } else {
      // Already deepest (area). A click on a different area within the same zone re-focuses it.
      if (res.area && res.area.id !== this.areaId && res.zone?.id === this.zoneId) this.focus(this.continentId, this.zoneId, res.area.id);
      else this.nudge();
    }
  },

  /** Subtle "nothing deeper here" feedback (no zoom change). */
  nudge(): void {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas) return;
    canvas.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }],
      { duration: 160 },
    );
  },

  // Diagonal hatch fill (clipped to an organic polygon) to mark draft regions/areas as provisional
  // (lore/build = Dara's; ADR 0009 §1). Delegates to the shared `hatchPoly` (also used by the minimap).
  hatchPath(ctx: CanvasRenderingContext2D, poly: Polygon, px: (n: number) => number, py: (n: number) => number): void {
    hatchPoly(ctx, poly, px, py);
  },
};
