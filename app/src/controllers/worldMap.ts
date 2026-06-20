// In-app WORLD MAP view ("the World Map screen", ADR 0009 §7): a read-only design/dev view that
// renders the world hierarchy — the 250×250 surface (or underworld) coordinate space with the
// painted Continent / Zone / Area boundaries drawn as labeled rects — so the designer can SEE the
// world and watch it fill in. Empty map space reads as "to build" (the backlog made visible).
//
// PRESENTATION ONLY (ADR 0005): reads data/world.ts; no game-state mutation, no DB writes. Canvas
// (matching controllers/field.ts) scaled-to-fit the stage since the map is big. Wired to the title
// screen like the Data screen (DataBrowser): title button → window bridge → Overlay.show + draw.

import {
  MAPS, CONTINENTS, ZONE_REGIONS, AREAS, OVERWORLD_ID, UNDERWORLD_ID,
  worldMap, regionAt, type WorldMap, type Bounds,
} from "../data/world";
import { GAME_VERSION } from "../data/version";
import { Overlay } from "../ui/overlay";

// Palette (gold-on-dark, matches index.html CSS vars).
const C = {
  empty: "#0a0a0f",      // backlog / unpainted space
  grid: "rgba(120,110,150,.10)",
  continentFill: "rgba(224,169,46,.07)",
  continentLine: "rgba(224,169,46,.55)",
  zoneFill: "rgba(95,180,140,.12)",
  zoneLine: "#7fd8b0",
  areaFill: "rgba(120,150,255,.14)",
  areaLine: "#9aa9ff",
  draftLine: "#c79a52",
  label: "#f4d27a",
  dim: "#9a93a8",
};

const CANVAS_ID = "worldMapCanvas";

export const WorldMapView = {
  mapId: OVERWORLD_ID as string,

  show(mapId?: string): void {
    this.mapId = mapId ?? this.mapId;
    const map = worldMap(this.mapId)!;
    const tab = (m: WorldMap): string =>
      `<button class="btn${m.id === map.id ? " gold" : ""}" onclick="WorldMapView.show('${m.id}')">${m.kind === "overworld" ? "Overworld" : m.kind === "underworld" ? "Underworld" : m.name}</button>`;

    const continents = CONTINENTS.filter((c) => c.map === map.id);
    const zones = ZONE_REGIONS.filter((z) => continents.some((c) => c.id === z.continent));
    const areas = AREAS.filter((a) => zones.some((z) => z.id === a.zone));
    const draftN = areas.filter((a) => a.draft).length;
    const counts = `${continents.length} continent${continents.length === 1 ? "" : "s"} · ${zones.length} zone${zones.length === 1 ? "" : "s"} · ${areas.length} area${areas.length === 1 ? "" : "s"}${draftN ? ` (${draftN} draft)` : ""}`;

    const legend = `<div class="small" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin:6px 0">
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.continentLine};background:${C.continentFill};vertical-align:middle"></i> Continent</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.zoneLine};background:${C.zoneFill};vertical-align:middle"></i> Zone</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.areaLine};background:${C.areaFill};vertical-align:middle"></i> Area</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px dashed ${C.draftLine};vertical-align:middle"></i> ·draft</span>
      <span><i style="display:inline-block;width:11px;height:11px;border:1px solid ${C.grid};background:${C.empty};vertical-align:middle"></i> empty = to build</span>
    </div>`;

    Overlay.show(`<h2 class="title-gold">World Map — Gaia ${GAME_VERSION}</h2>
      <div class="small" style="margin-top:-4px;opacity:.7">${map.name} · ${map.width}×${map.height} tiles · ${counts}</div>
      <div class="row" style="margin:6px 0">${MAPS.map(tab).join("")}</div>
      ${legend}
      <div style="position:relative;width:100%;display:flex;justify-content:center">
        <canvas id="${CANVAS_ID}" style="max-width:100%;border:1px solid var(--line);border-radius:8px;background:${C.empty};touch-action:none"></canvas>
      </div>
      <div class="small" id="worldMapHover" style="min-height:18px;margin-top:6px;text-align:center">Hover or tap a region to inspect its continent › zone › area chain.</div>
      <div class="row" style="margin-top:8px"><button class="btn gold" onclick="Overlay.hide()">Close</button></div>`);

    // Draw after the overlay HTML is in the DOM and laid out.
    requestAnimationFrame(() => this.draw(map));
  },

  draw(map: WorldMap): void {
    const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fit the square map into the available width (capped so it stays mobile-legible without scroll).
    const css = Math.max(220, Math.min(canvas.parentElement?.clientWidth || 480, 480));
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = css + "px";
    canvas.style.height = css + "px";
    canvas.width = Math.round(css * dpr);
    canvas.height = Math.round(css * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = css / map.width; // tiles → CSS px
    const px = (n: number) => n * s;
    const rect = (b: Bounds) => [px(b.x), px(b.y), px(b.w), px(b.h)] as const;

    // Backdrop = empty/backlog.
    ctx.fillStyle = C.empty;
    ctx.fillRect(0, 0, css, css);

    // Faint coordinate grid (every 50 tiles) so the empty backlog reads as scaled space, not a void.
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    for (let g = 50; g < map.width; g += 50) {
      ctx.beginPath(); ctx.moveTo(px(g), 0); ctx.lineTo(px(g), css); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, px(g)); ctx.lineTo(css, px(g)); ctx.stroke();
    }

    const continents = CONTINENTS.filter((c) => c.map === map.id);
    // Continents: broad tint + label.
    for (const c of continents) {
      const [x, y, w, h] = rect(c.bounds);
      ctx.fillStyle = C.continentFill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = C.continentLine;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = C.continentLine;
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(c.name.toUpperCase(), x + 4, y + 4);
    }

    const zones = ZONE_REGIONS.filter((z) => continents.some((c) => c.id === z.continent));
    // Zones: outlined + named.
    for (const z of zones) {
      const [x, y, w, h] = rect(z.bounds);
      ctx.fillStyle = C.zoneFill;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = C.zoneLine;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = C.zoneLine;
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textBaseline = "bottom";
      ctx.fillText(z.name, x + 3, y + h - 2);
    }

    // Areas: inner blocks; draft areas hatched + line dashed.
    const areas = AREAS.filter((a) => zones.some((z) => z.id === a.zone));
    for (const a of areas) {
      const [x, y, w, h] = rect(a.bounds);
      ctx.fillStyle = C.areaFill;
      ctx.fillRect(x, y, w, h);
      if (a.draft) this.hatch(ctx, x, y, w, h);
      ctx.strokeStyle = a.draft ? C.draftLine : C.areaLine;
      ctx.lineWidth = 1;
      ctx.setLineDash(a.draft ? [3, 2] : []);
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.setLineDash([]);
      // Label small areas with a leader dot; only draw text if the block is roomy enough.
      if (w > 40 && h > 14) {
        ctx.fillStyle = C.label;
        ctx.font = "9px system-ui, sans-serif";
        ctx.textBaseline = "top";
        ctx.fillText((a.draft ? "·" : "") + a.name, x + 3, y + 3);
      }
    }

    // Hover/tap inspect via regionAt (cheap — point-in-region). CSS-px → tile coords.
    const inspect = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const tx = Math.floor(((clientX - r.left) / r.width) * map.width);
      const ty = Math.floor(((clientY - r.top) / r.height) * map.height);
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
    canvas.onpointerdown = (e) => inspect(e.clientX, e.clientY);
  },

  // Diagonal hatch fill to mark draft areas as provisional (lore = Dara's; ADR 0009 §1).
  hatch(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = "rgba(199,154,82,.30)";
    ctx.lineWidth = 1;
    for (let d = -h; d < w; d += 6) {
      ctx.beginPath();
      ctx.moveTo(x + d, y);
      ctx.lineTo(x + d + h, y + h);
      ctx.stroke();
    }
    ctx.restore();
  },
};
