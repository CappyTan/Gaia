// PURE procedural map-gen — no DOM, no controller `this`, rng injectable (skill §1/§2). The geometry
// that BUILDS a zone's tile grid (carve clearings/rooms, snake corridors, stamp scatter/water/terrain,
// flood-fill to GUARANTEE reachability) lives here so it's unit-testable + sim-reachable, decoupled
// from the field controller's DOM/flow. The controller (`controllers/field.ts`) calls these and wires
// the returned grid + spawn/anchors into its run state; it owns the per-run "already cleared/looted"
// predicates (passed in) and all screen/overlay flow.
//
// Behaviour-preserving extraction of field.ts's genCombined/genOverworld/genDungeon + their carve
// helpers — code MOVED, logic unchanged. The one mechanical change (skill §2): scatter, which was the
// only ambient `Math.random()` here, now flows through an injected `rng: Rng = Math.random` (so it's
// seedable for tests) — unchanged when called without a seed, exactly as the game does.

import type { Rng } from "../core/rng";
import type { Pt, Rect, Path, Poi, ZoneLayout, DungeonLayout } from "../data/zones";

// Overworld/dungeon WALL kinds — impassable, and a flood-fill barrier (anti-soft-lock routes over
// these). `tree` walls every zone's canvas + the gate chokepoint; `water` is the marsh's hard pool.
// `cliff` (rocky mountain wall) + `river` (watercourse) also hard-block; the bridge/ford crossings +
// the POI kinds are WALKABLE (deliberately absent here). Shared with the controller (re-exported there).
export const FIELD_WALLS = new Set(["tree", "water", "cliff", "river"]);

/** A mutable tile grid + its dimensions — the carrier the pure carve/flood helpers operate on. */
export interface MapGrid { map: string[][]; W: number; H: number; }

/** The carved grid + the anchors/spawn a generator produced — the controller assigns these onto Field. */
export interface GenResult {
  map: string[][];
  W: number; H: number;
  spawn: Pt;            // px/py the player lands on
  gate: Pt;             // door/up-stair / chokepoint tile
  boss: Pt;             // boss tile (placeholder on the overworld-only grid)
  mouth?: Pt;           // overworld dungeon-mouth POI (genOverworld only)
  chests: Pt[];
  lairAt: Pt | null;
  pois: Poi[];
}

/** Per-run "already spent/looted" predicates the controller threads in (it owns the persisted sets). */
export interface ClearedState {
  /** A POI ("<zoneId>:<x>,<y>") has been used/cleared. */
  poiSpent(poi: Poi): boolean;
  /** An overworld/dungeon chest at (x,y) has been looted (the controller scopes the key). */
  chestOpened(c: Pt): boolean;
  /** The zone's overworld dungeon-mouth guard has been beaten (drives mouth vs miniboss tile). */
  miniCleared: boolean;
  /** This dungeon FLOOR's in-dungeon lieutenant has been beaten (drives the gate tile). */
  floorMiniBeaten: boolean;
  /** A dungeon REST node at (x,y) has been spent (reverts to floor). */
  restSpent(p: Pt): boolean;
}

// ── pure grid primitives (operate on a MapGrid; no `this`) ────────────────────────────────────────

/** A fresh H×W grid filled with `tree` (overworld = forest wall, dungeon = rock wall via the draw map). */
function blankGrid(w: number, h: number): MapGrid {
  return { map: Array.from({ length: h }, () => Array.from({ length: w }, () => "tree")), W: w, H: h };
}
const inBounds = (g: MapGrid, x: number, y: number) => x > 0 && y > 0 && x < g.W - 1 && y < g.H - 1;
function carve(g: MapGrid, x: number, y: number, kind: string): void { if (inBounds(g, x, y)) g.map[y][x] = kind; }
function carveRect(g: MapGrid, r: Rect): void { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(g, x, y, "grass"); }

/** L-shaped corridor between two points, drawn as "path". */
export function carveSeg(g: MapGrid, a: Pt, b: Pt): void {
  let cx = a.x, cy = a.y;
  const c = (x: number, y: number) => { if (x > 0 && y > 0 && x < g.W - 1 && y < g.H - 1) g.map[y][x] = "path"; };
  c(cx, cy);
  while (cx !== b.x) { cx += Math.sign(b.x - cx); c(cx, cy); }
  while (cy !== b.y) { cy += Math.sign(b.y - cy); c(cx, cy); }
}
function carvePath(g: MapGrid, p: Path): void { for (let i = 1; i < p.length; i++) carveSeg(g, p[i - 1], p[i]); }

/** Clear a 3×3 halo of tree around a feature tile so it's reachable. */
export function halo(g: MapGrid, p: Pt): void {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const xx = p.x + dx, yy = p.y + dy;
    if (xx > 0 && yy > 0 && xx < g.W - 1 && yy < g.H - 1 && g.map[yy][xx] === "tree") g.map[yy][xx] = "grass";
  }
}

// scatter (decoration) + marsh water pools + VARIED TERRAIN (rivers/cliffs/bridges/fords) — shared by
// genCombined/genOverworld (the dungeon does its own scatter and has no water/terrain). Never
// overwrites the mouth/miniboss tile. Mirrors data/world.buildAuthoredGrid so the discrete + big-map
// paths realize the SAME geography. The scatter is the ONLY randomness here → injected rng.
function scatterAndWater(g: MapGrid, L: ZoneLayout, rng: Rng): void {
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < g.W - 1 && y < g.H - 1;
  const stamp = (rs: Rect[] | undefined, kind: string) => {
    if (!rs) return;
    for (const r of rs) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++)
      if (inB(x, y) && g.map[y][x] !== "miniboss") g.map[y][x] = kind;
  };
  const dens = L.scatter ?? 0.06;
  for (let y = 1; y < g.H - 1; y++) for (let x = 1; x < g.W - 1; x++)
    if (g.map[y][x] === "grass" && rng() < dens) g.map[y][x] = rng() < 0.6 ? "bush" : "rock";
  stamp(L.water, "water");
  stamp(L.rivers, "river");
  stamp(L.cliffs, "cliff");
  // walkable crossings stamp LAST (over river/water) — a bridge/ford reads on top of the watercourse.
  if (L.bridges) for (const b of L.bridges) if (inB(b.x, b.y)) g.map[b.y][b.x] = "bridge";
  if (L.fords) for (const f of L.fords) if (inB(f.x, f.y)) g.map[f.y][f.x] = "ford";
}

// Stamp the zone's POIs (the INHABITED world) onto the carved grid: each on a cleared halo, as its own
// walkable kind — unless already spent (a used shrine / cleared camp reverts to plain ground so it can't
// be re-triggered). Returns the per-run POI list (a shallow copy the controller keeps).
function stampPois(g: MapGrid, L: ZoneLayout, cleared: ClearedState): Poi[] {
  const pois = (L.pois ?? []).map((p) => ({ ...p }));
  for (const p of pois) {
    halo(g, p);
    g.map[p.y][p.x] = cleared.poiSpent(p) ? "path" : p.kind;
  }
  return pois;
}

/** bush/rock are decoration (walkable); tree and water are walls; the gate/mouth is walkable. */
export function flood(g: MapGrid, start: Pt): boolean[][] {
  const seen = Array.from({ length: g.H }, () => Array.from({ length: g.W }, () => false));
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < g.W && y < g.H && !FIELD_WALLS.has(g.map[y][x]);
  const q: Pt[] = [start]; if (open(start.x, start.y)) seen[start.y][start.x] = true; else return seen;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
    }
  }
  return seen;
}

// Verify (and, if needed, repair) reachability of every target from `spawn` — punch a straight
// L-corridor through walls to any feature that ended up walled off, then re-flood.
export function ensureReachable(g: MapGrid, spawn: Pt, targets: Pt[]): void {
  let seen = flood(g, spawn);
  for (const t of targets) {
    if (seen[t.y]?.[t.x]) continue;
    let best: Pt | null = null, bd = Infinity;
    for (let y = 0; y < g.H; y++) for (let x = 0; x < g.W; x++)
      if (seen[y][x]) { const d = Math.abs(x - t.x) + Math.abs(y - t.y); if (d < bd) { bd = d; best = { x, y }; } }
    if (best) {
      let cx = best.x, cy = best.y;
      const step = (x: number, y: number) => { if (x > 0 && y > 0 && x < g.W - 1 && y < g.H - 1 && FIELD_WALLS.has(g.map[y][x])) g.map[y][x] = "path"; };
      while (cx !== t.x) { cx += Math.sign(t.x - cx); step(cx, cy); }
      while (cy !== t.y) { cy += Math.sign(t.y - cy); step(cx, cy); }
      seen = flood(g, spawn);
    }
  }
}

// ── the three generators (pure; return a GenResult the controller assigns onto Field) ─────────────

// LEGACY combined grid: overworld WEST of a synthesized chokepoint wall at gateWallX + the rebased
// dungeon EAST of it (a single grid, the gate the only gap). Byte-identical to the pre-Stage-2 map.
// Used by Silverwood/Duskmarsh until they migrate to genOverworld/genDungeon.
export function genCombined(L: ZoneLayout, D: DungeonLayout, cleared: ClearedState, rng: Rng = Math.random): GenResult {
  const dx0 = L.gateWallX;               // re-add the rebase so D's local x maps back to world x
  const offPt = (q: Pt): Pt => ({ x: q.x + dx0, y: q.y });          // dungeon-local → combined-grid x
  const offR = (r: Rect): Rect => ({ ...r, x: r.x + dx0 });
  const offP = (p: Pt[]) => p.map(offPt);
  const g = blankGrid(L.w, L.h);
  const gate = { ...L.gate }, boss = offPt(D.boss);
  const chests = [...L.chests.map((c) => ({ ...c })), ...D.chests.map(offPt)];
  const lairAt = L.lair ? { ...L.lair } : null;

  // 2. carve walkable rects (clearings/rooms): overworld field rects + the rebased dungeon rooms.
  L.fieldRects.forEach((r) => carveRect(g, r)); L.dunRects.forEach((r) => carveRect(g, r)); D.rooms.map(offR).forEach((r) => carveRect(g, r));
  // 3. carve paths (L-shaped segments between consecutive points), drawn as the intended route
  L.fieldPaths.forEach((p) => carvePath(g, p)); L.dunPaths.forEach((p) => carvePath(g, p)); D.paths.map(offP).forEach((p) => carvePath(g, p));

  // 4. the CHOKEPOINT: a full-height tree wall at gateWallX with one gap = the mini-boss gate.
  const gx = L.gateWallX;
  for (let y = 1; y < g.H - 1; y++) g.map[y][gx] = "tree";
  // a one-tile path stub on each side so the gate connects field ↔ dungeon
  carve(g, gx - 1, L.gate.y, "path"); carve(g, gx + 1, L.gate.y, "path");
  g.map[L.gate.y][gx] = "miniboss";

  scatterAndWater(g, L, rng);

  // 6. chests + lair, each with a cleared 3×3 halo so they're reachable
  chests.forEach((c) => { halo(g, c); carve(g, c.x, c.y, "chest"); });
  if (lairAt) { halo(g, lairAt); carve(g, lairAt.x, lairAt.y, "lair"); }
  const pois = stampPois(g, L, cleared); // POIs (the INHABITED world)
  carve(g, boss.x, boss.y, "boss");
  carve(g, L.spawn.x, L.spawn.y, "path");

  // 7. ANTI-SOFT-LOCK: flood-fill from spawn (gate walkable) and repair any walled-off feature —
  //    boss, chests, lair, AND every walkable crossing/POI (so river/cliff terrain can't strand them).
  const targets = [boss, ...chests]; if (lairAt) targets.push(lairAt);
  if (L.bridges) targets.push(...L.bridges);
  if (L.fords) targets.push(...L.fords);
  targets.push(...pois.map((p) => ({ x: p.x, y: p.y })));
  ensureReachable(g, L.spawn, targets);
  return { map: g.map, W: g.W, H: g.H, spawn: { ...L.spawn }, gate, boss, chests, lairAt, pois };
}

// ── ADR 0008 Stage 2 (step 3): the OVERWORLD-only grid (no dungeon, no gate wall) — the seamless
// region. The dungeon mouth is a POI tile: "miniboss" while the mini guards it, "mouth" once the mini
// is beaten (stepping onto it then descends, via move()). Greenvale only for now.
export function genOverworld(z: { id: string; layout: ZoneLayout; hub?: string }, cleared: ClearedState, rng: Rng = Math.random): GenResult {
  const L = z.layout;
  const g = blankGrid(L.w, L.h);
  const gate = { ...L.mouth }, mouth = { ...L.mouth };
  const boss = { ...L.mouth }; // no overworld boss tile; placeholder so progress()/draw stay safe
  const chests = L.chests.map((c) => ({ ...c }));
  const lairAt = L.lair ? { ...L.lair } : null;

  L.fieldRects.forEach((r) => carveRect(g, r));
  L.fieldPaths.forEach((p) => carvePath(g, p));

  scatterAndWater(g, L, rng);

  // ALREADY-LOOTED chests revert to plain path (mirrors stampPois' spent-POI handling) so a Continue
  // can't re-spawn a looted chest; a still-sealed chest carves as "chest". An opened chest is just
  // walkable floor, so it's also dropped from the anti-soft-lock targets (it can never strand anything).
  const owOpened = (c: Pt) => cleared.chestOpened(c);
  chests.forEach((c) => { halo(g, c); carve(g, c.x, c.y, owOpened(c) ? "path" : "chest"); });
  if (lairAt) { halo(g, lairAt); carve(g, lairAt.x, lairAt.y, "lair"); }
  const pois = stampPois(g, L, cleared); // POIs (the INHABITED world)
  // The mouth POI: guarded by the mini until it's beaten, then enterable.
  halo(g, mouth);
  g.map[mouth.y][mouth.x] = cleared.miniCleared ? "mouth" : "miniboss";
  carve(g, L.spawn.x, L.spawn.y, "path");
  // Re-enterable hub marker (any zone with a hub), one tile in from spawn (mirrors buildAuthoredGrid).
  const village = z.hub ? { x: Math.max(1, L.spawn.x - 1), y: L.spawn.y } : null;
  if (village) { halo(g, village); carve(g, village.x, village.y, "village"); }

  // ANTI-SOFT-LOCK: the mouth + every UNOPENED overworld chest/lair/crossing/POI + the hub marker reachable from spawn.
  const targets = [mouth, ...chests.filter((c) => !owOpened(c))]; if (lairAt) targets.push(lairAt); if (village) targets.push(village);
  if (L.bridges) targets.push(...L.bridges);
  if (L.fords) targets.push(...L.fords);
  targets.push(...pois.map((p) => ({ x: p.x, y: p.y })));
  ensureReachable(g, L.spawn, targets);
  return { map: g.map, W: g.W, H: g.H, spawn: { ...L.spawn }, gate, boss, mouth, chests, lairAt, pois };
}

// ── ADR 0008 Stage 2/3 (step 3): build ONE FLOOR of the zone's DUNGEON as its own grid. The player
// lands at `entry` (the mouth's inside on B1, the up-stair on deeper floors). MULTI-FLOOR: an
// intermediate floor carries a `stairsDown` tile gated by the floor's `miniboss` lieutenant; the LAST
// floor carries the zone `boss` finale. The up-stair (`entry`/`gate`) is drawn "stairsup".
export function genDungeon(D: DungeonLayout, last: boolean, cleared: ClearedState, rng: Rng = Math.random): GenResult {
  const g = blankGrid(D.w, D.h);
  const gate = { ...D.gate };           // the door/up-stair back out / up a floor
  const boss = { ...D.boss };           // only meaningful on the LAST floor
  const chests = D.chests.map((c) => ({ ...c }));

  D.rooms.forEach((r) => carveRect(g, r));
  D.paths.forEach((p) => carvePath(g, p));

  // cosmetic scatter (drawn as rock in the dungeon tileset)
  const dens = D.scatter ?? 0.06;
  for (let y = 1; y < g.H - 1; y++) for (let x = 1; x < g.W - 1; x++)
    if (g.map[y][x] === "grass" && rng() < dens) g.map[y][x] = rng() < 0.6 ? "bush" : "rock";

  // ALREADY-LOOTED chests on THIS floor revert to plain path so a Continue can't re-spawn a looted chest.
  const dunOpened = (c: Pt) => cleared.chestOpened(c);
  chests.forEach((c) => { halo(g, c); carve(g, c.x, c.y, dunOpened(c) ? "path" : "chest"); });
  // Anti-soft-lock targets: UNOPENED chests + the floor's egress (boss on the last floor, stairs-down otherwise).
  const targets: Pt[] = [...chests.filter((c) => !dunOpened(c))];
  if (last) { carve(g, boss.x, boss.y, "boss"); targets.push(boss); }
  else if (D.stairsDown) {
    halo(g, D.stairsDown);
    carve(g, D.stairsDown.x, D.stairsDown.y, "stairsdown");
    targets.push(D.stairsDown);
  }
  // IN-DUNGEON mini-boss gate (the lieutenant): while it stands, its tile reads as the guardian
  // ("miniboss") and the player can't pass to the stairs; beaten, it reverts to floor. Always a flood
  // target so the gated stairs/chests behind it stay reachable (the repair routes THROUGH the gate tile).
  if (D.miniboss) {
    halo(g, D.miniboss);
    carve(g, D.miniboss.x, D.miniboss.y, cleared.floorMiniBeaten ? "path" : "miniboss");
    // TRUE GATE PINCH (anti-bypass): re-wall the perpendicular flanks the halo opened so the ONLY way
    // through the gate is the lieutenant tile itself (the flood-repair still routes THROUGH it).
    carve(g, D.miniboss.x, D.miniboss.y - 1, "tree");
    carve(g, D.miniboss.x, D.miniboss.y + 1, "tree");
    targets.push(D.miniboss);
  }
  // REST NODES (breather valley): a walkable campfire that heals once, then spends (reverts to floor).
  if (D.rests) for (const r of D.rests) { halo(g, r); carve(g, r.x, r.y, cleared.restSpent(r) ? "path" : "rest"); targets.push(r); }
  // COLLAPSE DROPS: a one-way `rubble` tile that drops to its paired landing — both walkable + flood targets.
  if (D.drops) for (const dp of D.drops) { halo(g, dp); carve(g, dp.x, dp.y, "rubble"); halo(g, dp.to); carve(g, dp.to.x, dp.to.y, "path"); targets.push(dp, dp.to); }
  // The up-stair / way back is "stairsup" on EVERY floor — "up = out" everywhere.
  carve(g, D.entry.x, D.entry.y, "stairsup");

  ensureReachable(g, D.entry, targets);
  return { map: g.map, W: g.W, H: g.H, spawn: { ...D.entry }, gate, boss, chests, lairAt: null, pois: [] };
}
