// PURE field-canvas DRAW primitives (skill §1/§6) — the painterly, FF-style "passability grammar"
// (raised+shadow = blocked, flat+lit = walkable), biome dressing, captioned POIs/mouths/stairs, and the
// figure-ground water/cliff/boss setpieces. These take a CanvasRenderingContext2D + geometry + plain
// data and DRAW; they read NO controller flow state and mutate none (the controller threads in the
// sprite table, the cell data, names, predicates). The per-frame orchestration loop stays in
// controllers/field.ts and calls into these — so the renderer is the ui-layer "how it looks" and the
// controller keeps the "what to draw where" flow.
//
// Behaviour-preserving extraction of field.ts's draw helpers — code MOVED, pixels unchanged.

// POI tile kinds (the INHABITED-world layer) — walkable special tiles drawn as captioned landmarks.
// The controller imports this set from here for its move()/draw dispatch (one source of truth).
export const POI_KINDS = new Set(["shrine", "camp", "landmark", "signpost"]);

// GATHERING-NODE tile kinds (crafting slice) — walkable resource tiles (ore vein / ancient root /
// spirit bloom), drawn as captioned landmarks like POIs. Same one-source-of-truth contract: the
// controller imports this set for its move()/draw dispatch.
export const NODE_KINDS = new Set(["node-ore", "node-root", "node-bloom"]);

type Ctx = CanvasRenderingContext2D;
type Tiles = Record<string, HTMLImageElement>;

// The kinds that draw an OBJECT on top of the biome ground (so the ground choice ignores the cell kind).
const OBJ_KINDS = new Set(["chest", "miniboss", "boss", "lair", "mouth", "village", "ruins"]);

// D4 SOLID raised object (tree/rock/cliff/decorative bush): a soft drop-shadow on the floor at the tile's
// foot, offset bottom-right (the cast of a top-left light). Call BEFORE the object sprite so the sprite
// sits on its own shadow. Mirrors the player foot-shadow primitive.
export function castShadow(c: Ctx, sx: number, sy: number, t: number, rx = 0.34, strength = 0.34): void {
  c.save();
  c.beginPath();
  c.ellipse(sx + t * 0.56, sy + t * 0.84, t * rx, t * rx * 0.42, 0, 0, Math.PI * 2);
  c.fillStyle = `rgba(0,0,0,${strength})`; c.fill();
  c.restore();
}

// D4 CLIFF as a RAISED FACE (not a flat dark fill): a LIT cap edge along the top-left over a shadowed
// foot + a short cast shadow onto the tile below — so a cliff reads as a wall you skirt, the same
// "stands up off the floor" language as a tree, without bespoke art.
export function drawCliffFace(c: Ctx, sx: number, sy: number, t: number): void {
  c.save();
  c.fillStyle = "rgba(120,128,140,.85)"; c.fillRect(sx, sy, t, Math.max(2, t * 0.22));
  c.fillStyle = "rgba(160,168,180,.7)"; c.fillRect(sx, sy, Math.max(2, t * 0.18), t * 0.5); // left-face highlight
  c.fillStyle = "rgba(0,0,0,.4)"; c.fillRect(sx, sy + t * 0.78, t, t * 0.22);                // shadowed foot
  c.restore();
  castShadow(c, sx, sy, t, 0.32, 0.3); // short cast onto the floor below
}

// D5 RECESSED WATER/RIVER (the inverse of a raised object): a COOL reflective surface set BELOW the floor
// plane, with a lit shoreline LIP on the LAND side casting a short shadow DOWN into the water (the bank
// reads as a drop-off), plus a faint specular ripple for life. `wet(dx,dy)` probes orthogonal neighbours
// (controller-supplied) to find the land-side faces.
export function drawRecessedWater(c: Ctx, wx: number, wy: number, sx: number, sy: number, t: number, wet: (gx: number, gy: number) => boolean, now = 0): void {
  c.save();
  c.fillStyle = "rgba(10,28,46,.32)"; c.fillRect(sx, sy, t, t); // deepen + cool the surface
  const n = ((wx * 0x9e3779b1) ^ (wy * 0x85ebca77)) >>> 0;       // faint specular ripple highlight
  // LIVING WATER: given a clock, the glint drifts + breathes (phase-offset per tile so the whole body
  // doesn't pulse in sync); with now=0 (tests / one-shot draws) it's the original static highlight.
  const ph = now ? Math.sin(now / 900 + wx * 0.7 + wy * 1.3) : 0;
  c.fillStyle = `rgba(150,200,230,${(0.13 + 0.07 * ph).toFixed(3)})`;
  c.fillRect(sx + t * (0.2 + (n % 3) * 0.18 + ph * 0.05), sy + t * (0.3 + ((n >> 3) % 3) * 0.16), t * 0.26, Math.max(1, t * 0.06));
  if (now) { // a counter-phase second glint low on the tile — reads as a moving surface
    c.fillStyle = `rgba(170,215,240,${(0.05 - 0.045 * ph).toFixed(3)})`;
    c.fillRect(sx + t * (0.55 - ph * 0.06), sy + t * 0.66, t * 0.2, Math.max(1, t * 0.05));
  }
  const lip = Math.max(2, t * 0.16);
  const edge = (land: boolean, lx: number, ly: number, lw: number, lh: number, shx: number, shy: number, shw: number, shh: number) => {
    if (!land) return;
    c.fillStyle = "rgba(196,178,128,.7)"; c.fillRect(lx, ly, lw, lh);            // lit sandy/earth lip on the land tile edge
    c.fillStyle = "rgba(0,0,0,.34)"; c.fillRect(shx, shy, shw, shh);            // short shadow cast DOWN into the water
  };
  edge(!wet(wx, wy - 1), sx, sy, t, lip, sx, sy + lip, t, lip * 0.7);            // north bank
  edge(!wet(wx - 1, wy), sx, sy, lip, t, sx + lip, sy, lip * 0.7, t);           // west bank
  edge(!wet(wx, wy + 1), sx, sy + t - lip, t, lip, sx, sy + t - lip * 1.7, t, lip * 0.7); // south bank
  edge(!wet(wx + 1, wy), sx + t - lip, sy, lip, t, sx + t - lip * 1.7, sy, lip * 0.7, t); // east bank
  c.restore();
}

// EDGE AO (ambient occlusion): soft contact shading on a FLOOR tile along each edge that meets a raised
// solid (tree mass / wall / cliff). Grounds walls to the floor and breaks the flat tile-grid look — the
// biggest single "not a prototype" cue a tile renderer can add. Two layered flat fills per edge fake a
// gradient with zero per-frame gradient-object allocation (this runs every ambient frame).
export function edgeShade(c: Ctx, sx: number, sy: number, t: number, n: boolean, s: boolean, w: boolean, e: boolean): void {
  if (!n && !s && !w && !e) return;
  const d = Math.max(3, t * 0.24), h = d * 0.45;
  c.fillStyle = "rgba(0,0,0,.10)";
  if (n) c.fillRect(sx, sy, t, d);
  if (s) c.fillRect(sx, sy + t - d, t, d);
  if (w) c.fillRect(sx, sy, d, t);
  if (e) c.fillRect(sx + t - d, sy, d, t);
  c.fillStyle = "rgba(0,0,0,.12)";
  if (n) c.fillRect(sx, sy, t, h);
  if (s) c.fillRect(sx, sy + t - h, t, h);
  if (w) c.fillRect(sx, sy, h, t);
  if (e) c.fillRect(sx + t - h, sy, h, t);
}

// The dungeon/cave MOUTH gets a gold caption (like town POIs) so the east-spine POI reads as a named
// destination. Spine dungeons read `▶ <name>`; OPTIONAL side zones read `<name> (optional)`. A guarded
// mouth (an unbeaten mini-boss gate) reads "⚔". Name/optional/guarded are supplied by the controller.
export function drawMouthLabel(c: Ctx, sx: number, sy: number, t: number, dungeonName: string, optional: boolean, guarded = false): void {
  const cx = sx + t / 2, cy = sy + t / 2;
  c.save();
  const halo = c.createRadialGradient(cx, cy, t * 0.1, cx, cy, t * 1.15);
  halo.addColorStop(0, "rgba(244,210,122,.5)"); halo.addColorStop(0.55, "rgba(244,185,66,.22)"); halo.addColorStop(1, "rgba(244,185,66,0)");
  c.fillStyle = halo; c.beginPath(); c.arc(cx, cy, t * 1.15, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(244,210,122,.95)"; c.lineWidth = Math.max(2, t * 0.07);
  c.beginPath(); c.arc(cx, cy, t * 0.45, 0, Math.PI * 2); c.stroke();
  const txt = `${guarded ? "⚔ " : "▶ "}${dungeonName}${optional ? " (optional)" : ""}`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `bold ${Math.max(10, t * 0.3)}px system-ui`;
  const ly = sy + t * 1.2, tw = c.measureText(txt).width, ph = Math.max(14, t * 0.42);
  c.fillStyle = "rgba(8,8,16,.85)"; c.fillRect(cx - tw / 2 - 6, ly - ph / 2, tw + 12, ph);
  c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.9)"; c.fillStyle = "rgba(244,210,122,.98)";
  c.strokeText(txt, cx, ly); c.fillText(txt, cx, ly);
  c.restore();
}

/** The kind emoji placeholder for a POI / gathering-node tile (until art lands). */
export function poiEmoji(kind: string): string {
  return kind === "shrine" ? "⛩️" : kind === "camp" ? "⛺" : kind === "signpost" ? "🪧"
    : kind === "node-ore" ? "⛏️" : kind === "node-root" ? "🌿" : kind === "node-bloom" ? "✨" : "🗿";
}

// POI / encampment tile (the INHABITED world): a kind emoji (placeholder until art lands) + a gold
// caption with the POI's `name` (resolved by the controller). Mirrors the town-POI + mouth caption.
export function drawPoiCell(c: Ctx, T: Tiles, kind: string, name: string, sx: number, sy: number, t: number): void {
  const img = T[kind]; // placeholder sprite slot (none yet → emoji)
  if (img) { const h = t * 1.4, w = h * (img.width / img.height); c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.95 - h, w, h); }
  else { c.font = `${t * 0.7}px serif`; c.fillText(poiEmoji(kind), sx + t / 2, sy + t / 2); }
  if (name) {
    c.save();
    c.textAlign = "center"; c.textBaseline = "middle";
    c.font = `bold ${Math.max(9, t * 0.24)}px system-ui`;
    c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
    const ly = sy + t * 1.02;
    c.strokeText(name, sx + t / 2, ly); c.fillText(name, sx + t / 2, ly);
    c.restore();
  }
}

// MULTI-FLOOR stairs (placeholder until sliced): draw the sprite if present, else a clear ⬇/⬆ glyph + a
// small gold caption so the descent/climb reads. `up` = an up-stair (climb / out); else a down-stair.
export function drawStairs(c: Ctx, obj: (img: HTMLImageElement | undefined, emoji: string, sc?: number) => void, img: HTMLImageElement | undefined, up: boolean, sx: number, sy: number, t: number): void {
  obj(img, up ? "⬆️" : "⬇️", 0.9);
  c.save();
  c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `bold ${Math.max(8, t * 0.22)}px system-ui`;
  c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
  const txt = up ? "Up" : "Down", ly = sy + t * 1.0;
  c.strokeText(txt, sx + t / 2, ly); c.fillText(txt, sx + t / 2, ly);
  c.restore();
}

// THE SEALED DOOR (wave3b — the Ancient Ruins' bossless terminus): a shut, graven door on the deepest
// floor. Draws the supplied door sprite (the dungeon set's entrance, dimmed — it does NOT open) or a
// door glyph, ringed by a cold halo + a gold "SEALED" caption — clearly a landmark, not an exit.
export function drawSealedDoor(c: Ctx, img: HTMLImageElement | undefined, sx: number, sy: number, t: number): void {
  c.save();
  // a cold, faint ring (the mana bloom) — deliberately NOT the warm mouth halo (this door won't open).
  const cx = sx + t / 2, cy = sy + t / 2;
  const halo = c.createRadialGradient(cx, cy, t * 0.1, cx, cy, t * 1.0);
  halo.addColorStop(0, "rgba(150,190,255,.30)"); halo.addColorStop(1, "rgba(150,190,255,0)");
  c.fillStyle = halo; c.beginPath(); c.arc(cx, cy, t, 0, Math.PI * 2); c.fill();
  if (img) {
    c.globalAlpha = 0.8; // dimmed — shut, not enterable
    const h = t * 1.4, w = h * (img.width / img.height);
    c.drawImage(img, cx - w / 2, sy + t * 0.95 - h, w, h);
    c.globalAlpha = 1;
  } else { c.font = `${t * 0.8}px serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("🚪", cx, cy); }
  c.textAlign = "center"; c.textBaseline = "middle";
  c.font = `bold ${Math.max(9, t * 0.24)}px system-ui`;
  c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = "rgba(244,210,122,.96)";
  const ly = sy + t * 1.02;
  c.strokeText("SEALED", cx, ly); c.fillText("SEALED", cx, ly);
  c.restore();
}

// DUNGEON TREASURE glint: a soft warm glow so a chest reads on the dim floor.
export function drawTreasureMark(c: Ctx, sx: number, sy: number, t: number): void {
  c.save();
  const cx = sx + t / 2, cy = sy + t * 0.5;
  const g = c.createRadialGradient(cx, cy, t * 0.06, cx, cy, t * 0.55);
  g.addColorStop(0, "rgba(244,210,122,.30)"); g.addColorStop(1, "rgba(244,210,122,0)");
  c.fillStyle = g; c.fillRect(sx - t * 0.1, sy - t * 0.1, t * 1.2, t * 1.2);
  c.restore();
}

// The DUNGEON BOSS FINALE marker: a distinct throne/boss glyph on a gold glow + a bold gold "BOSS"
// caption beneath. Once cleared it flips to a planted flag. `bossDefeated` + the throne sprite are
// supplied by the controller.
export function drawDungeonBoss(c: Ctx, throne: HTMLImageElement | undefined, bossDefeated: boolean, sx: number, sy: number, t: number): void {
  c.save();
  c.textAlign = "center"; c.textBaseline = "middle";
  if (!bossDefeated) {
    c.beginPath(); c.arc(sx + t / 2, sy + t / 2, t * 0.46, 0, Math.PI * 2);
    c.fillStyle = "rgba(244,210,122,.18)"; c.fill();
    c.lineWidth = Math.max(2, t * 0.05); c.strokeStyle = "rgba(244,210,122,.6)"; c.stroke();
  }
  if (throne) {
    if (bossDefeated) c.globalAlpha = 0.5;
    const h = t * 1.9, w = h * (throne.width / throne.height);
    c.drawImage(throne, sx + t / 2 - w / 2, sy + t - h, w, h);
    c.globalAlpha = 1;
    if (bossDefeated) { c.font = `${t * 0.5}px serif`; c.fillText("🏴", sx + t / 2, sy + t * 0.12); }
  } else {
    c.font = `${t * 0.8}px serif`;
    c.fillText(bossDefeated ? "🏴" : "👑", sx + t / 2, sy + t * 0.46);
  }
  const txt = bossDefeated ? "CLEARED" : "BOSS", ly = sy + t * 1.04;
  c.font = `bold ${Math.max(9, t * 0.27)}px system-ui`;
  c.lineWidth = 3; c.strokeStyle = "rgba(0,0,0,.85)"; c.fillStyle = bossDefeated ? "rgba(170,170,170,.9)" : "rgba(244,210,122,.98)";
  c.strokeText(txt, sx + t / 2, ly); c.fillText(txt, sx + t / 2, ly);
  c.restore();
}

// Draw a guardian/creature sprite bottom-anchored on a tile, preserving its (tall) aspect.
export function drawMob(c: Ctx, img: HTMLImageElement, sx: number, sy: number, t: number): void {
  const h = t * 1.5, w = h * (img.width / img.height);
  c.drawImage(img, sx + t / 2 - w / 2, sy + t * 0.98 - h, w, h);
}

// ── BIG-MAP biome → ground/object dressing (ADR 0009 / Stage 2B) ─────────────────────────────────
// A zone-AGNOSTIC dressing table keyed by a cell's cached BIOME, returning the ground sprite key (+a
// *-ground2 alternate by the cached variant) and a flat-colour fallback. Pure mapping (the sprite table
// `T` is passed in only to choose the *2 alternate when present). No regionAt on the frame path.
export function bigGround(T: Tiles, biome: string, kind: string, variant: number): { ground: string; flat: string } {
  const isObj = OBJ_KINDS.has(kind) || POI_KINDS.has(kind) || NODE_KINDS.has(kind);
  const alt = (base: string) => (variant && T[base + "2"] ? base + "2" : base);
  if (kind === "river") return { ground: T.water ? "water" : "river", flat: "#2f5b7a" };
  if (kind === "cliff") return { ground: "cliff", flat: "#2b2f37" };
  if (kind === "gorge") return { ground: "gorge", flat: "#0f1622" };
  if (kind === "crossing") return { ground: "crossing", flat: "#7a6242" };
  if (kind === "bridge") return { ground: "bridge", flat: "#7a6242" };
  if (kind === "ford") return { ground: "ford", flat: "#86b0c4" };
  if (biome === "forest") {
    const gm: Record<string, string> = { grass: "grove-ground", grass2: "grove-ground2", path: "grove-path", bush: "fern", rock: "mushroom", tree: "grove-ground", water: "water" };
    const g = isObj ? "grove-ground" : (gm[kind] || "grove-ground");
    const f: Record<string, string> = { path: "#7d7748", grass: "#4f7038", grass2: "#547640", bush: "#4f7038", rock: "#4f7038", tree: "#13230d", water: "#1c3236" };
    return { ground: g === "grove-ground" ? alt("grove-ground") : g, flat: f[kind] ?? "#4f7038" };
  }
  if (biome === "mire" || biome === "water") {
    const gm: Record<string, string> = { grass: "mire-ground", grass2: "mire-ground2", path: "mire-path", bush: "reed", rock: "bog", tree: "mire-ground", water: "water" };
    const g = isObj ? "mire-ground" : (gm[kind] || "mire-ground");
    const f: Record<string, string> = { path: "#8a7c52", grass: "#46583a", grass2: "#4b5d3d", bush: "#3f5236", rock: "#445036", tree: "#19231a", water: "#222e38" };
    return { ground: g === "mire-ground" ? alt("mire-ground") : g, flat: f[kind] ?? "#46583a" };
  }
  if (biome === "ruin") {
    const gm: Record<string, string> = { grass: "ruin-flag", grass2: "ruin-flag2", path: "ruin-walk", bush: "ruin-flag", rock: "ruin-flag", tree: "ruin-flag", water: "ruin-pit" };
    const g = isObj ? "ruin-flag" : (gm[kind] || "ruin-flag");
    const f: Record<string, string> = { path: "#8a7c52", grass: "#5a5448", grass2: "#5f5950", bush: "#4a4640", rock: "#444038", tree: "#1a1814", water: "#26221c" };
    return { ground: g === "ruin-flag" ? alt("ruin-flag") : g, flat: f[kind] ?? "#5a5448" };
  }
  if (biome === "orchard") {
    const gm: Record<string, string> = { grass: "orchard-ground", grass2: "orchard-ground2", path: "path", tree: "orchard-ground" };
    const g = isObj ? "orchard-ground" : (gm[kind] || "orchard-ground");
    return { ground: g === "orchard-ground" ? alt("orchard-ground") : g, flat: kind === "tree" ? "#3a5220" : "#6f8e34" };
  }
  if (biome === "meadow" || biome === "creek") {
    const gm: Record<string, string> = { grass: "meadow-ground", grass2: "meadow-ground2", path: "path", bush: "wheat", tree: "meadow-ground" };
    const g = isObj ? "meadow-ground" : (gm[kind] || "meadow-ground");
    return { ground: g === "meadow-ground" ? alt("meadow-ground") : g, flat: biome === "creek" ? "#5f7a4a" : "#7a8a36" };
  }
  if (biome === "snow" || biome === "ice" || biome === "stone") {
    const gm: Record<string, string> = { grass: "snow-ground", grass2: "snow-ground2", path: "snow-path", bush: "snow-ground", rock: "snow-ground", tree: "snow-ground", water: "snow-frozen" };
    const g = isObj ? "snow-ground" : (gm[kind] || "snow-ground");
    const flat = kind === "water" ? "#5a7896" : biome === "snow" ? "#cfe0ec" : biome === "ice" ? "#aebfd0" : "#6a7080";
    return { ground: g === "snow-ground" ? alt("snow-ground") : g, flat };
  }
  if (biome === "coast" || biome === "beach" || biome === "harbor" || biome === "rock") {
    const gm: Record<string, string> = { grass: "coast-sand", grass2: "coast-sand2", path: "coast-dock", bush: "coast-sand", rock: "coast-sand", tree: "coast-sand", water: "coast-sea" };
    const g = isObj ? "coast-sand" : (gm[kind] || "coast-sand");
    const flat = kind === "water" ? "#2f5b7a" : biome === "rock" ? "#5a6068" : "#cdb98a";
    return { ground: g === "coast-sand" ? alt("coast-sand") : g, flat };
  }
  if (biome === "riverside" || biome === "road" || biome === "town") {
    const flat = kind === "water" ? "#2f5b7a" : biome === "riverside" ? "#cdb98a" : "#8a7a54";
    const g = isObj ? "grass" : kind;
    return { ground: g === "grass" ? alt("grass") : g, flat };
  }
  if (biome === "hills" || biome === "highland") {
    const g = isObj ? "grass" : kind;
    return { ground: g === "grass" ? alt("grass") : g, flat: "#6f8a5a" };
  }
  const g = isObj ? "grass" : kind;
  return { ground: g === "grass" ? alt("grass") : g, flat: kind === "tree" ? "#2c4418" : "#5a8a36" };
}
