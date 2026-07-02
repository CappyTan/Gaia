// DUNGEON FLOOR TOPOLOGY — a pure, DOM-free read of what a single dungeon floor actually IS once its
// authored `DungeonLayout` is carved into a tile grid. The level-designer and level-design-reviewer
// agents (and the `dungeon-map` tool / tests) consume this to assess a floor at a glance — its room
// graph, loops vs. corridor, reachability/soft-lock, and whether a mini-boss gate truly pinches —
// without mentally simulating `controllers/field.genDungeon`.
//
// WHY A SEPARATE PURE REALIZER (not a call into the controller): `genDungeon` lives in the DOM-bound
// field controller and mutates `Field.map` with per-run state + cosmetic RNG scatter. This module
// replays the SAME documented carve vocabulary (rooms = rects, paths = L-shaped polylines, halo'd
// feature tiles, the gate-pinch flank re-wall) over a fresh, worst-case AUTHORED view (chests sealed,
// the mini-boss standing) — the exact state a reviewer wants to grade. It mirrors the precedent set by
// `data/world.buildAuthoredGrid` (a pure overworld realizer kept honest by tests). The ONLY thing it
// drops is scatter: `genDungeon` sprinkles `bush`/`rock`, but both are WALKABLE decoration, so they
// never change topology — omitting them keeps this fully deterministic (no RNG).
//
// SOURCE OF TRUTH for the carve rules: `controllers/field.genDungeon` + `genDungeon`'s helpers
// (`carveSeg`, `halo`) and `FIELD_WALLS`. If those change, update the replay below and the test.

import type { DungeonLayout, Pt, Rect } from "../data/zones";

// A walkable tile is anything that isn't the wall fill. In a dungeon the only wall kind carved is
// "tree" (the canvas fill + the gate-pinch flanks); every room/path/feature tile is walkable. (Mirrors
// `FIELD_WALLS` — water/cliff/river never occur in a dungeon grid.)
const WALL = "tree";

/** A feature anchor on the floor (an authored point of interest the player interacts with). */
export type FeatureKind =
  | "entry"      // where the player lands (the up-stair / mouth inside)
  | "stairsUp"   // the way back out / up a floor (drawn on `entry`)
  | "stairsDown" // descend to the next floor (intermediate floors)
  | "boss"       // the zone-boss finale (the last floor only)
  | "miniboss"   // the in-dungeon lieutenant that GATES the stairs/boss until beaten
  | "chest"      // treasure
  | "rest"       // a breather / heal-once campfire (dungeon-design skill §1)
  | "drop"       // a one-way collapse SHORTCUT tile (skill §2/§4)
  | "landing";   // where a `drop` deposits the player

export interface Feature extends Pt {
  kind: FeatureKind;
  /** Index of the room this feature sits in (or -1 if it sits in a bare corridor / off-room). */
  room: number;
  /** For a `drop`: the landing it carries to. */
  to?: Pt;
  /** Whether this tile is reachable from `entry` (gate treated as passable). */
  reachable: boolean;
  /** For a `miniboss` gate: the features that become UNREACHABLE when this tile is walled (what it gates). */
  gates?: FeatureKind[];
}

/** A room (carved chamber) as a graph node. */
export interface RoomNode {
  id: number;
  rect: Rect;
  /** Bidirectional graph degree (corridor + direct-adjacency links; drops excluded — they're one-way bonus). */
  degree: number;
  /** Feature kinds that sit inside this room (e.g. ["chest","rest"]). */
  has: FeatureKind[];
  /** Reachable from the entry room on the walkable grid (gate passable). */
  reachable: boolean;
}

/** A link in the room graph. `corridor` = joined by an authored path; `adjacency` = rects touch/overlap;
 *  `drop` = a one-way collapse shortcut (not counted toward loops — the floor must traverse without it). */
export interface TopoEdge { a: number; b: number; kind: "corridor" | "adjacency" | "drop"; }

export interface FloorMetrics {
  walkableTiles: number;
  roomCount: number;
  /** Bidirectional links (corridor + adjacency, deduped) — the connectivity used for loops. */
  edgeCount: number;
  /** Connected components of the room graph (should be 1 — anything more means a stranded/ drop-only room). */
  components: number;
  /** Independent loops = edges − nodes + components (cyclomatic). 0 = a tree (corridor-with-spurs); ≥1 = a mesh. */
  loops: number;
  isMesh: boolean;            // loops ≥ 1 — passes the dungeon-design "could I draw this as one trunk?" test
  deadEndRooms: number[];     // room ids with bidirectional degree ≤ 1 (spurs)
  hubRooms: number[];         // room ids with degree ≥ 3 (the hubs the layout orbits)
  chestCount: number;
  restCount: number;          // breather nodes (skill §1)
  reprieveKind: string | null; // the rest node's tailored reprieve (ADR 0010): "mend"|"mana"|"regen", or null
  dropCount: number;          // one-way shortcuts (skill §2/§4)
  /** ANTI-SOFT-LOCK: every feature + room reachable from entry (gate passable). The cardinal check. */
  softLock: { ok: boolean; unreachable: Feature[] };
  /** Present iff the floor has a mini-boss gate: does walling it actually cut off content (a true pinch)? */
  gate?: { pinches: boolean; behind: FeatureKind[] };
  /** The floor's required exit and how far the player must travel to it (gate passable). */
  egress: { kind: "stairsDown" | "boss" | "none"; at: Pt | null; reachable: boolean; pathLen: number };
}

export interface FloorTopology {
  zone: string;
  floorIndex: number;
  floorCount: number;
  isLast: boolean;
  w: number;
  h: number;
  /** The realized walkable grid (true = walkable), worst-case authored view (chests sealed, gate standing). */
  walkable: boolean[][];
  rooms: RoomNode[];
  edges: TopoEdge[];
  features: Feature[];
  metrics: FloorMetrics;
}

export interface TopologyOpts {
  zone?: string;
  floorIndex?: number;
  floorCount?: number;
  /** Whether this is the finale floor (carries the boss). Defaults to floorIndex === floorCount-1. */
  isLast?: boolean;
}

const inGrid = (g: unknown[][], x: number, y: number) => y >= 0 && x >= 0 && y < g.length && x < g[0].length;
const inB = (w: number, h: number, x: number, y: number) => x > 0 && y > 0 && x < w - 1 && y < h - 1;
const inRect = (r: Rect, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
const key = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`);

/**
 * Realize one dungeon floor into a tile-KIND grid, faithfully replaying `genDungeon`'s carve order
 * (minus walkable scatter) over the worst-case authored state. Used internally; exported for tests.
 */
export function realizeFloor(D: DungeonLayout, isLast: boolean): string[][] {
  const { w, h } = D;
  const map: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => WALL));
  const carve = (x: number, y: number, kind: string) => { if (inB(w, h, x, y)) map[y][x] = kind; };
  // halo: open the 8 WALL neighbours of a feature to floor so it's never walled in (genDungeon.halo).
  const halo = (p: Pt) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = p.x + dx, yy = p.y + dy;
      if (inB(w, h, xx, yy) && map[yy][xx] === WALL) map[yy][xx] = "grass";
    }
  };
  // carveRect (rooms) → grass
  for (const r of D.rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, "grass");
  // carveSeg / carvePath (corridors) → path, L-shaped between consecutive points (genDungeon.carveSeg)
  const carveSeg = (a: Pt, b: Pt) => {
    let cx = a.x, cy = a.y;
    const c = (x: number, y: number) => { if (inB(w, h, x, y)) map[y][x] = "path"; };
    c(cx, cy);
    while (cx !== b.x) { cx += Math.sign(b.x - cx); c(cx, cy); }
    while (cy !== b.y) { cy += Math.sign(b.y - cy); c(cx, cy); }
  };
  for (const p of D.paths) for (let i = 1; i < p.length; i++) carveSeg(p[i - 1], p[i]);
  // (scatter skipped — bush/rock are walkable, topology-irrelevant)
  // chasm + bridge (wave6c — the Sealed Deep): the void is a flood barrier (realized as the wall fill
  // here — impassable is impassable), the causeway walkable over it. Replayed in genDungeon's order
  // (after paths, before the feature tiles) so the topology sees the bridge as the only way across.
  if (D.chasm) for (const r of D.chasm) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y, WALL);
  if (D.bridge) for (const b of D.bridge) carve(b.x, b.y, "bridge");
  // chests (sealed authored view): halo + chest tile
  for (const c of D.chests) { halo(c); carve(c.x, c.y, "chest"); }
  // egress: boss on the last floor, else the stairs down
  if (isLast) carve(D.boss.x, D.boss.y, "boss");
  else if (D.stairsDown) { halo(D.stairsDown); carve(D.stairsDown.x, D.stairsDown.y, "stairsdown"); }
  // the mini-boss gate (standing): halo, then RE-WALL its perpendicular flanks so the only way past is
  // the gate tile itself (genDungeon's true-pinch geometry).
  if (D.miniboss) {
    halo(D.miniboss);
    carve(D.miniboss.x, D.miniboss.y, "miniboss");
    carve(D.miniboss.x, D.miniboss.y - 1, WALL);
    carve(D.miniboss.x, D.miniboss.y + 1, WALL);
  }
  if (D.rests) for (const r of D.rests) { halo(r); carve(r.x, r.y, "rest"); }
  if (D.drops) for (const dp of D.drops) { halo(dp); carve(dp.x, dp.y, "rubble"); halo(dp.to); carve(dp.to.x, dp.to.y, "path"); }
  // the up-stair / way back, drawn on entry
  carve(D.entry.x, D.entry.y, "stairsup");
  return map;
}

/** 4-way BFS over the walkable grid from `start`; returns the seen mask. A tile is open when its kind
 *  isn't the wall fill, EXCEPT any coordinate in `blocked` (used to force the gate shut for pinch testing). */
function flood(map: string[][], start: Pt, blocked?: Set<string>): boolean[][] {
  const h = map.length, w = map[0].length;
  const seen = Array.from({ length: h }, () => Array.from({ length: w }, () => false));
  const open = (x: number, y: number) =>
    inGrid(map, x, y) && map[y][x] !== WALL && !(blocked && blocked.has(`${x},${y}`));
  if (!open(start.x, start.y)) return seen;
  const q: Pt[] = [start]; seen[start.y][start.x] = true;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
    }
  }
  return seen;
}

/** Shortest 4-way walkable step distance start→goal, or -1 if unreachable (gate passable). */
function dist(map: string[][], start: Pt, goal: Pt): number {
  const h = map.length, w = map[0].length;
  const d = Array.from({ length: h }, () => Array.from({ length: w }, () => -1));
  const open = (x: number, y: number) => inGrid(map, x, y) && map[y][x] !== WALL;
  if (!open(start.x, start.y)) return -1;
  const q: Pt[] = [start]; d[start.y][start.x] = 0;
  while (q.length) {
    const { x, y } = q.shift()!;
    if (x === goal.x && y === goal.y) return d[y][x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && d[ny][nx] < 0) { d[ny][nx] = d[y][x] + 1; q.push({ x: nx, y: ny }); }
    }
  }
  return -1;
}

/** Which room (index) a tile sits in, or -1 if none (a bare corridor). First match wins. */
function roomOf(rooms: Rect[], x: number, y: number): number {
  for (let i = 0; i < rooms.length; i++) if (inRect(rooms[i], x, y)) return i;
  return -1;
}

/**
 * Traverse one authored dungeon floor and return its full topology — the realized walkable grid, the
 * room graph (loops vs. corridor), every feature, reachability/soft-lock, and the gate-pinch verdict.
 * Pure + deterministic. Pass `opts` to label the floor (zone / index / count / isLast).
 */
export function floorTopology(D: DungeonLayout, opts: TopologyOpts = {}): FloorTopology {
  const floorIndex = opts.floorIndex ?? 0;
  const floorCount = opts.floorCount ?? 1;
  const isLast = opts.isLast ?? floorIndex === floorCount - 1;
  const map = realizeFloor(D, isLast);
  const w = D.w, h = D.h;
  const walkable = map.map((row) => row.map((k) => k !== WALL));

  // ── reachability (gate passable) ──
  const seen = flood(map, D.entry);
  const reach = (p: Pt) => inGrid(seen, p.x, p.y) && seen[p.y][p.x];

  // ── features ──
  const features: Feature[] = [];
  const addF = (p: Pt, kind: FeatureKind, to?: Pt) =>
    features.push({ x: p.x, y: p.y, kind, room: roomOf(D.rooms, p.x, p.y), to, reachable: reach(p) });
  addF(D.entry, "stairsUp");
  if (isLast) addF(D.boss, "boss");
  else if (D.stairsDown) addF(D.stairsDown, "stairsDown");
  if (D.miniboss) addF(D.miniboss, "miniboss");
  for (const c of D.chests) addF(c, "chest");
  if (D.rests) for (const r of D.rests) addF(r, "rest");
  if (D.drops) for (const dp of D.drops) { addF({ x: dp.x, y: dp.y }, "drop", dp.to); addF(dp.to, "landing"); }

  // ── room graph ──
  const rooms: RoomNode[] = D.rooms.map((rect, id) => ({ id, rect, degree: 0, has: [], reachable: false }));
  for (const f of features) if (f.room >= 0 && !rooms[f.room].has.includes(f.kind)) rooms[f.room].has.push(f.kind);
  for (const r of rooms) r.reachable = seen.some((row, yy) => row.some((v, xx) => v && inRect(r.rect, xx, yy)));

  // Room graph from the REALIZED WALKABLE GRID (not the raw polylines) so it faithfully contracts
  // corridors: label every walkable tile with its room id (or -1 for a bare corridor), then link rooms
  // that are directly adjacent OR joined by a shared corridor segment. This correctly captures a link
  // like the gate corridor (drill yard → bare gate tiles → stair landing), which a path-membership read
  // would miss because the gate tile sits in no room.
  const edgeSet = new Map<string, TopoEdge>();
  const addEdge = (a: number, b: number, kind: TopoEdge["kind"]) => {
    if (a < 0 || b < 0 || a === b) return;
    const k = kind === "drop" ? `d${a}>${b}` : key(a, b);
    if (!edgeSet.has(k)) edgeSet.set(k, { a, b, kind });
  };
  const rid = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (walkable[y][x] ? roomOf(D.rooms, x, y) : -2))); // -2 wall, -1 corridor, ≥0 room
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
  const R = rooms.length;
  // direct room↔room adjacency: a room tile orthogonally touching a different room's tile (deduped).
  const adjPairs = new Set<string>();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = rid[y][x]; if (a < 0) continue;
    for (const [dx, dy] of NB) { const nx = x + dx, ny = y + dy; if (inGrid(rid, nx, ny)) { const b = rid[ny][nx]; if (b >= 0 && b !== a) adjPairs.add(key(a, b)); } }
  }
  // corridor JUNCTIONS: flood each connected blob of bare-corridor tiles and record the rooms it touches.
  // A junction touching ≥2 rooms is modelled as its OWN graph node (a star to those rooms) — NOT a clique
  // — so cyclomatic loops stay honest (a 3-room T-junction adds one node, not three phantom cycles).
  const junctions: number[][] = []; // room ids each corridor junction connects (size ≥ 2)
  const cseenG = Array.from({ length: h }, () => Array.from({ length: w }, () => false));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (rid[y][x] !== -1 || cseenG[y][x]) continue;
    const stack: Pt[] = [{ x, y }]; cseenG[y][x] = true; const touched = new Set<number>();
    while (stack.length) {
      const { x: cx, y: cy } = stack.pop()!;
      for (const [dx, dy] of NB) {
        const nx = cx + dx, ny = cy + dy; if (!inGrid(rid, nx, ny)) continue;
        const v = rid[ny][nx];
        if (v === -1 && !cseenG[ny][nx]) { cseenG[ny][nx] = true; stack.push({ x: nx, y: ny }); }
        else if (v >= 0) touched.add(v);
      }
    }
    if (touched.size >= 2) junctions.push([...touched]);
  }
  // CONTRACTED room→room edges (for the readable graph + degree): direct adjacencies, plus every pair a
  // junction joins. (The clique is fine for display — it just says "these rooms interlink here".)
  for (const p of adjPairs) { const [a, b] = p.split(",").map(Number); addEdge(a, b, "adjacency"); }
  for (const js of junctions) for (let i = 0; i < js.length; i++) for (let j = i + 1; j < js.length; j++) addEdge(js[i], js[j], "corridor");
  // drop edges (one-way shortcuts) — recorded but EXCLUDED from loop/connectivity math.
  if (D.drops) for (const dp of D.drops) addEdge(roomOf(D.rooms, dp.x, dp.y), roomOf(D.rooms, dp.to.x, dp.to.y), "drop");
  const edges = [...edgeSet.values()];

  // room degree = distinct neighbour ROOMS (graph contracted), for hub/dead-end reads.
  const nbrs: Set<number>[] = rooms.map(() => new Set());
  for (const e of edges) if (e.kind !== "drop") { nbrs[e.a].add(e.b); nbrs[e.b].add(e.a); }
  rooms.forEach((r) => (r.degree = nbrs[r.id].size));

  // components + cyclomatic LOOPS on the EXPANDED graph (rooms + junction nodes), so a shared junction
  // is one node rather than a clique. N = rooms + junctions; an edge per room↔junction incidence + each
  // direct adjacency. loops = E − N + components.
  const N = R + junctions.length;
  const g2: number[][] = Array.from({ length: N }, () => []);
  let E = 0;
  const link2 = (a: number, b: number) => { g2[a].push(b); g2[b].push(a); E++; };
  for (const p of adjPairs) { const [a, b] = p.split(",").map(Number); link2(a, b); }
  junctions.forEach((js, ji) => js.forEach((rm) => link2(rm, R + ji)));
  let components = 0; const cseen = new Array(N).fill(false);
  for (let i = 0; i < N; i++) if (!cseen[i]) { components++; const st = [i]; cseen[i] = true; while (st.length) { const n = st.pop()!; for (const m of g2[n]) if (!cseen[m]) { cseen[m] = true; st.push(m); } } }
  // components over the FULL node set; isolated junction nodes can't occur (each links ≥2 rooms), so this
  // equals the number of room clusters. Report room-cluster count (exclude any all-junction artefacts).
  const loops = E - N + components;

  // ── gate pinch: wall the mini-boss tile and see what falls out of reach (what it truly gates) ──
  let gate: FloorMetrics["gate"];
  if (D.miniboss) {
    const closed = flood(map, D.entry, new Set([`${D.miniboss.x},${D.miniboss.y}`]));
    const behind: FeatureKind[] = [];
    for (const f of features) if (f.kind !== "miniboss" && f.reachable && !closed[f.y]?.[f.x] && !behind.includes(f.kind)) behind.push(f.kind);
    gate = { pinches: behind.length > 0, behind };
    const mf = features.find((f) => f.kind === "miniboss"); if (mf) mf.gates = behind;
  }

  // ── egress ──
  const egressPt = isLast ? D.boss : D.stairsDown ?? null;
  const egressKind: FloorMetrics["egress"]["kind"] = isLast ? "boss" : D.stairsDown ? "stairsDown" : "none";
  const egress = {
    kind: egressKind,
    at: egressPt,
    reachable: egressPt ? reach(egressPt) : false,
    pathLen: egressPt ? dist(map, D.entry, egressPt) : -1,
  };

  const unreachable = features.filter((f) => !f.reachable);
  const metrics: FloorMetrics = {
    walkableTiles: walkable.reduce((n, row) => n + row.filter(Boolean).length, 0),
    roomCount: rooms.length,
    edgeCount: edges.filter((e) => e.kind !== "drop").length,
    components,
    loops,
    isMesh: loops >= 1,
    deadEndRooms: rooms.filter((r) => r.degree <= 1).map((r) => r.id),
    hubRooms: rooms.filter((r) => r.degree >= 3).map((r) => r.id),
    chestCount: D.chests.length,
    restCount: D.rests?.length ?? 0,
    reprieveKind: D.reprieve?.kind ?? null,
    dropCount: D.drops?.length ?? 0,
    softLock: { ok: unreachable.length === 0, unreachable },
    gate,
    egress,
  };

  return { zone: opts.zone ?? "", floorIndex, floorCount, isLast, w, h, walkable, rooms, edges, features, metrics };
}

// ── Human/agent-readable render ───────────────────────────────────────────────────────────────────
const GLYPH: Record<FeatureKind, string> = {
  entry: "E", stairsUp: "E", stairsDown: ">", boss: "B", miniboss: "M",
  chest: "C", rest: "R", drop: "v", landing: "^",
};

/**
 * Render a floor topology as an ASCII map + legend + a metrics summary keyed to the dungeon-design
 * rubric — the form the agents read to "see" a floor and grade it. Walls = `#`, floor = `·`, features
 * by glyph (legend below). Pure string; no I/O.
 */
export function renderTopology(t: FloorTopology): string {
  // glyph grid: walls/floor, then stamp feature glyphs on top.
  const g: string[][] = t.walkable.map((row) => row.map((wk) => (wk ? "·" : "#")));
  for (const f of t.features) if (inGrid(g, f.x, f.y)) g[f.y][f.x] = GLYPH[f.kind];
  const grid = g.map((row) => row.join("")).join("\n");

  const m = t.metrics;
  const label = t.zone ? `${t.zone} — floor ${t.floorIndex + 1}/${t.floorCount}${t.isLast ? " (finale)" : ""}` : `floor ${t.floorIndex + 1}/${t.floorCount}`;
  const yn = (b: boolean) => (b ? "yes" : "NO");

  const lines: string[] = [];
  lines.push(`╔═ ${label} ═ ${t.w}×${t.h}`);
  lines.push(grid);
  lines.push("");
  lines.push("legend: # wall · floor  E up-stair/entry  > stairs-down  B boss  M mini-boss gate  C chest  R rest  v drop  ^ landing");
  lines.push("");
  // rubric signals (map straight onto dungeon-design SKILL.md checks)
  lines.push("── topology ──");
  lines.push(`rooms ${m.roomCount} · links ${m.edgeCount} · components ${m.components} · loops ${m.loops}  →  ${m.isMesh ? "MESH (loops present)" : "TREE/CORRIDOR (no loops — §2 flag)"}`);
  lines.push(`hubs(deg≥3): [${m.hubRooms.join(", ") || "—"}]   dead-end rooms(deg≤1): [${m.deadEndRooms.join(", ") || "—"}]`);
  // §1 reprieve read (ADR 0010): a rest node should carry a TAILORED reprieve (mend/mana/regen, never a
  // full heal). NO rest is legitimate — required for caves, optional for short dungeons — so it's not a
  // flaw. A rest tile WITHOUT a reprieve is the only real fault (a dead beat / content bug).
  const restNote = m.restCount === 0
    ? "(§1: no rest — fine for a cave / short floor; a dungeon may add a tailored reprieve)"
    : m.reprieveKind
      ? `(§1 reprieve: ${m.reprieveKind})`
      : "(§1: ⚠ rest node with NO reprieve — dead beat, set dungeon.reprieve)";
  lines.push(`chests ${m.chestCount} · rests ${m.restCount} ${restNote} · drops/shortcuts ${m.dropCount}`);
  lines.push(`soft-lock safe (all reachable): ${yn(m.softLock.ok)}${m.softLock.ok ? "" : "  ⚠ UNREACHABLE: " + m.softLock.unreachable.map((f) => `${f.kind}@${f.x},${f.y}`).join(", ")}`);
  if (m.gate) lines.push(`mini-boss gate pinches: ${yn(m.gate.pinches)}${m.gate.pinches ? "  (gates: " + m.gate.behind.join(", ") + ")" : "  ⚠ gate is BYPASSABLE — nothing behind it"}`);
  lines.push(`egress: ${m.egress.kind}${m.egress.at ? `@${m.egress.at.x},${m.egress.at.y}` : ""} · reachable ${yn(m.egress.reachable)} · ${m.egress.pathLen} steps from entry`);
  lines.push("");
  lines.push("── room graph ──");
  for (const r of t.rooms) {
    const links = t.edges.filter((e) => e.kind !== "drop" && (e.a === r.id || e.b === r.id)).map((e) => (e.a === r.id ? e.b : e.a));
    const drops = t.edges.filter((e) => e.kind === "drop" && e.a === r.id).map((e) => `→${e.b}`);
    lines.push(`  [${r.id}] ${r.rect.w}×${r.rect.h}@${r.rect.x},${r.rect.y}  deg ${r.degree}  links {${links.join(",")}}${drops.length ? "  shortcut " + drops.join(",") : ""}${r.has.length ? "  has " + r.has.join("/") : ""}`);
  }
  return lines.join("\n");
}
