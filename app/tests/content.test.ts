// Content-layer tests: the DB registry query API + cross-references, and the schema/integrity
// validator. These guard the "database" so authoring/tweaking content can't silently break the game.

import { describe, it, expect } from "vitest";
import { DB } from "../src/data/db";
import { validateContent } from "../src/data/validate";
import { ARCHETYPE_KEYS } from "../src/data/party";
import { ATTUNEMENTS } from "../src/types";
import { ZONES, GREENVALE_AREAS, greenvaleAreaAt, type Zone, type ZoneLayout, type DungeonLayout, type Pt, type GreenvaleAreaId } from "../src/data/zones";
import { SETTLEMENTS, TOWN_GLYPHS, TOWN_BLOCKERS, POI_OF, settlement } from "../src/data/towns";

// ── COMBINED-GRID carve (legacy genMap path) ─────────────────────────────────────────────────
// Mirror of controllers/field.genMap's carve (WITHOUT the repair pass) so the test proves each
// authored zone is ALREADY soft-lock-free by design — boss + every chest/lair reachable from spawn
// — not just rescued by the runtime flood-fill repair. (ADR 0006 anti-soft-lock rule.) After ADR
// 0008 Stage 2 the dungeon is its own grid (`z.dungeon.layout`, x rebased to 0); this reconstructs
// the SAME combined grid genMap still builds by stamping the dungeon east of gateWallX (dx0).
function carveZone(z: Zone): string[][] {
  const L: ZoneLayout = z.layout, D: DungeonLayout = z.dungeon.layout;
  const dx0 = L.gateWallX;
  const offPt = (q: Pt): Pt => ({ x: q.x + dx0, y: q.y });
  const offR = (r: { x: number; y: number; w: number; h: number }) => ({ ...r, x: r.x + dx0 });
  const map = Array.from({ length: L.h }, () => Array.from({ length: L.w }, () => "tree"));
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < L.w - 1 && y < L.h - 1;
  const c = (x: number, y: number, k: string) => { if (inB(x, y)) map[y][x] = k; };
  const rect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c(x, y, "grass"); };
  L.fieldRects.forEach(rect); L.dunRects.forEach(rect); D.rooms.map(offR).forEach(rect);
  const seg = (a: Pt, b: Pt) => { let x = a.x, y = a.y; c(x, y, "path"); while (x !== b.x) { x += Math.sign(b.x - x); c(x, y, "path"); } while (y !== b.y) { y += Math.sign(b.y - y); c(x, y, "path"); } };
  const path = (p: Pt[]) => { for (let i = 1; i < p.length; i++) seg(p[i - 1], p[i]); };
  L.fieldPaths.forEach(path); L.dunPaths.forEach(path); D.paths.map((p) => p.map(offPt)).forEach(path);
  for (let y = 1; y < L.h - 1; y++) map[y][L.gateWallX] = "tree";
  c(L.gateWallX - 1, L.gate.y, "path"); c(L.gateWallX + 1, L.gate.y, "path"); map[L.gate.y][L.gateWallX] = "miniboss";
  // hard-blocking water pools + VARIED TERRAIN (rivers/cliffs) + walkable crossings (bridge/ford),
  // stamped over carved ground — mirrors scatterAndWater. Crossings stamp LAST (walkable over river).
  const stampT = (rs: { x: number; y: number; w: number; h: number }[] | undefined, k: string) => { if (rs) for (const w of rs) for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++) if (inB(x, y) && map[y][x] !== "miniboss") map[y][x] = k; };
  stampT(L.water, "water"); stampT(L.rivers, "river"); stampT(L.cliffs, "cliff");
  if (L.bridges) for (const b of L.bridges) c(b.x, b.y, "bridge");
  if (L.fords) for (const f of L.fords) c(f.x, f.y, "ford");
  const chests = [...L.chests, ...D.chests.map(offPt)];
  const boss = offPt(D.boss);
  const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && (map[yy][xx] === "tree" || map[yy][xx] === "water")) map[yy][xx] = "grass"; } };
  chests.forEach((p) => { halo(p); c(p.x, p.y, "chest"); });
  if (L.lair) { halo(L.lair); c(L.lair.x, L.lair.y, "lair"); }
  if (L.pois) for (const p of L.pois) { halo({ x: p.x, y: p.y }); c(p.x, p.y, p.kind); }
  c(boss.x, boss.y, "boss"); c(L.spawn.x, L.spawn.y, "path");
  return map;
}

// ── OVERWORLD-ONLY carve (ADR 0008 Stage 2, step 3 — Greenvale's genOverworld) ────────────────
// The decoupled overworld grid: field rects/paths, the dungeon MOUTH POI (no gate wall east of it),
// chests + lair. Proves the overworld alone reaches the mouth + every overworld chest/lair.
function carveOverworld(L: ZoneLayout): string[][] {
  const map = Array.from({ length: L.h }, () => Array.from({ length: L.w }, () => "tree"));
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < L.w - 1 && y < L.h - 1;
  const c = (x: number, y: number, k: string) => { if (inB(x, y)) map[y][x] = k; };
  const rect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c(x, y, "grass"); };
  L.fieldRects.forEach(rect);
  const seg = (a: Pt, b: Pt) => { let x = a.x, y = a.y; c(x, y, "path"); while (x !== b.x) { x += Math.sign(b.x - x); c(x, y, "path"); } while (y !== b.y) { y += Math.sign(b.y - y); c(x, y, "path"); } };
  const path = (p: Pt[]) => { for (let i = 1; i < p.length; i++) seg(p[i - 1], p[i]); };
  L.fieldPaths.forEach(path);
  const stampT = (rs: { x: number; y: number; w: number; h: number }[] | undefined, k: string) => { if (rs) for (const w of rs) for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++) if (inB(x, y)) map[y][x] = k; };
  stampT(L.water, "water"); stampT(L.rivers, "river"); stampT(L.cliffs, "cliff");
  if (L.bridges) for (const b of L.bridges) c(b.x, b.y, "bridge");
  if (L.fords) for (const f of L.fords) c(f.x, f.y, "ford");
  const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && (map[yy][xx] === "tree" || map[yy][xx] === "water")) map[yy][xx] = "grass"; } };
  L.chests.forEach((p) => { halo(p); c(p.x, p.y, "chest"); });
  if (L.lair) { halo(L.lair); c(L.lair.x, L.lair.y, "lair"); }
  if (L.pois) for (const p of L.pois) { halo({ x: p.x, y: p.y }); c(p.x, p.y, p.kind); }
  halo(L.mouth); c(L.mouth.x, L.mouth.y, "miniboss"); c(L.spawn.x, L.spawn.y, "path");
  return map;
}

// ── DUNGEON-ONLY carve (ADR 0008 Stage 2, step 3 — Greenvale's genDungeon) ────────────────────
// The decoupled dungeon grid: rooms/paths from the dungeon's own coords (x from 0), egress + chests.
// Proves the floor alone reaches its egress (boss on the LAST floor, stairs-down otherwise) + every
// chest from the entry. `last` mirrors genDungeon: the finale floor carves the boss, an intermediate
// floor carves stairs-down. The gating miniboss tile is carved walkable by default (the flood routes
// THROUGH it, exactly as the runtime — the gate is a fight, not a wall, so it can't strand the player);
// pass `miniWall=true` to carve it as a WALL instead (the GATE-INTEGRITY check — proves the gate truly
// blocks the stairs/vault until beaten). genDungeon re-walls the gate's PERPENDICULAR FLANKS (the tiles
// directly above/below the lieutenant) after its halo so the halo ring can't open a bypass — mirrored
// here so the flood matches the runtime.
function carveDungeon(D: DungeonLayout, last = true, miniWall = false): string[][] {
  const map = Array.from({ length: D.h }, () => Array.from({ length: D.w }, () => "tree"));
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < D.w - 1 && y < D.h - 1;
  const c = (x: number, y: number, k: string) => { if (inB(x, y)) map[y][x] = k; };
  const rect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c(x, y, "grass"); };
  D.rooms.forEach(rect);
  const seg = (a: Pt, b: Pt) => { let x = a.x, y = a.y; c(x, y, "path"); while (x !== b.x) { x += Math.sign(b.x - x); c(x, y, "path"); } while (y !== b.y) { y += Math.sign(b.y - y); c(x, y, "path"); } };
  const path = (p: Pt[]) => { for (let i = 1; i < p.length; i++) seg(p[i - 1], p[i]); };
  D.paths.forEach(path);
  const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && map[yy][xx] === "tree") map[yy][xx] = "grass"; } };
  D.chests.forEach((p) => { halo(p); c(p.x, p.y, "chest"); });
  if (last) { c(D.boss.x, D.boss.y, "boss"); }
  else if (D.stairsDown) { halo(D.stairsDown); c(D.stairsDown.x, D.stairsDown.y, "stairsdown"); }
  if (D.miniboss) {
    halo(D.miniboss);
    c(D.miniboss.x, D.miniboss.y, miniWall ? "tree" : "path"); // gate = a fight (walkable) unless forced wall
    c(D.miniboss.x, D.miniboss.y - 1, "tree"); c(D.miniboss.x, D.miniboss.y + 1, "tree"); // re-wall the gate flanks
  }
  // REST nodes + collapse DROPS — carved AFTER the gate flank re-wall, exactly mirroring genDungeon
  // (each halo'd, walkable, a flood target; a drop's landing too). Carving them here lets the pinch
  // test below catch a future rest/drop whose halo would re-open the gate bypass (the risk this opened).
  if (D.rests) for (const r of D.rests) { halo(r); c(r.x, r.y, "rest"); }
  if (D.drops) for (const dp of D.drops) { halo(dp); c(dp.x, dp.y, "rubble"); halo(dp.to); c(dp.to.x, dp.to.y, "path"); }
  c(D.entry.x, D.entry.y, "path");
  return map;
}
// The authored floor stack for a zone (its `floors` if multi-floor, else the single layout).
function floorsOf(z: Zone): DungeonLayout[] {
  const d = z.dungeon; return d.floors && d.floors.length ? d.floors : [d.layout];
}
function reachable(map: string[][], start: Pt): boolean[][] {
  const H = map.length, W = map[0].length;
  const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] !== "tree" && map[y][x] !== "water" && map[y][x] !== "cliff" && map[y][x] !== "river";
  if (!open(start.x, start.y)) return seen;
  const q: Pt[] = [start]; seen[start.y][start.x] = true;
  while (q.length) { const { x, y } = q.shift()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); } } }
  return seen;
}

describe("content integrity (validateContent)", () => {
  it("reports no problems — all content is internally consistent", () => {
    expect(validateContent()).toEqual([]);
  });
});

describe("DB registry", () => {
  it("queries skills and reports which classes use them", () => {
    expect(DB.skills.get("guard")).toBeTruthy();
    expect(DB.skills.all().length).toBeGreaterThan(0);
    expect(DB.skills.ults().every((s) => s.ult)).toBe(true);
    // guard is the SOL Sword & Shield opener
    expect(DB.skills.usedBy("guard")).toContain("SOL Sword & Shield");
  });
  it("queries the bestiary with zone cross-references", () => {
    expect(DB.enemies.get("slime")).toBeTruthy();
    expect(DB.enemies.keys().length).toBe(DB.enemies.all().length);
    expect(DB.enemies.rares().some((e) => e.key === "hogger")).toBe(true);
    expect(DB.enemies.bosses().some((e) => e.boss)).toBe(true);
    // slime spawns in Greenvale (zone 0); the Hollow King boss is in Silverwood (zone 1); the Cave
    // Troll boss is in the Duskmarsh (zone 2, after Silverwood was inserted at index 1).
    expect(DB.enemies.zonesOf("slime")).toContain(0);
    expect(DB.enemies.zonesOf("hollowking")).toContain(1);
    expect(DB.enemies.zonesOf("troll")).toContain(2);
    expect(DB.enemies.inZone(0).some((e) => e.key === "slime")).toBe(true);
  });
  it("exposes the full 45-class grid with kits", () => {
    expect(DB.classes.all().length).toBe(ATTUNEMENTS.length * ARCHETYPE_KEYS.length);
    expect(DB.classes.all().every((c) => c.kit.length > 0)).toBe(true);
  });
  it("exposes zones", () => {
    expect(DB.zones.count()).toBe(DB.zones.all().length);
    expect(DB.zones.get(0)).toBeTruthy();
  });
});

describe("zone layouts (ADR 0006 — bespoke + anti-soft-lock; ADR 0008 — dungeon decoupled)", () => {
  for (const z of ZONES) {
    describe(z.name, () => {
      const L = z.layout, D = z.dungeon.layout;
      const dx0 = L.gateWallX; // rebase offset: dungeon-local x → combined-grid x
      // The COMBINED-grid coords of the dungeon boss + all chests (for the legacy genMap path tests).
      const combinedBoss = { x: D.boss.x + dx0, y: D.boss.y };
      const combinedChests = [...L.chests, ...D.chests.map((c) => ({ x: c.x + dx0, y: c.y }))];
      it("has a layout with in-bounds, sensibly-sided anchors", () => {
        expect(L).toBeTruthy();
        const inb = (p: Pt) => p.x > 0 && p.y > 0 && p.x < L.w - 1 && p.y < L.h - 1;
        expect(inb(L.spawn)).toBe(true);
        expect(L.chests.every(inb)).toBe(true);              // overworld chests in-bounds
        expect(L.spawn.x).toBeLessThan(L.gateWallX);         // start is in the overworld
        expect(L.gate.x).toBe(L.gateWallX);
        expect(L.mouth).toEqual(L.gate);                     // the dungeon mouth == the old gate tile
        // dungeon grid: its own anchors in-bounds (x rebased to 0)
        const dinb = (p: Pt) => p.x > 0 && p.y > 0 && p.x < D.w - 1 && p.y < D.h - 1;
        expect(dinb(D.boss)).toBe(true);
        expect(D.chests.every(dinb)).toBe(true);
        expect(dinb(D.entry)).toBe(true);                    // entry is an in-bounds walkable tile (just inside the mouth)
        expect(D.entry.x).toBe(1);                           // on the dungeon's west edge (the mouth's inside)
      });
      it("LEGACY combined grid is fully traversable — boss + every chest/lair reachable from spawn", () => {
        const map = carveZone(z);
        const seen = reachable(map, L.spawn);
        expect(seen[combinedBoss.y][combinedBoss.x]).toBe(true);
        for (const ch of combinedChests) expect(seen[ch.y][ch.x]).toBe(true);
        if (L.lair) expect(seen[L.lair.y][L.lair.x]).toBe(true);
      });
      // OPEN-WORLD (Dara 2026-06-20): a zone must be a NETWORK with loops, not a spine. Prove it by
      // counting REDUNDANT through-routes — paths whose individual removal still leaves the boss
      // reachable. A pure spine/tree has ZERO redundant carriers (cut any link → severed); a mesh
      // with loops has several. Require ≥2 redundant carriers on BOTH sides of the gate.
      const reachCombinedWithout = (side: "field" | "dun", idx: number): boolean => {
        const zc: Zone = JSON.parse(JSON.stringify(z));
        if (side === "field") zc.layout.fieldPaths.splice(idx, 1);
        else zc.dungeon.layout.paths.splice(idx, 1);
        const seen = reachable(carveZone(zc), zc.layout.spawn);
        return !!seen[combinedBoss.y]?.[combinedBoss.x];
      };
      const redundant = (side: "field" | "dun") =>
        (side === "field" ? L.fieldPaths : D.paths).reduce((n, _p, i) => n + (reachCombinedWithout(side, i) ? 1 : 0), 0);
      // PER-FLOOR dungeon redundancy (covers B2/B3 of a multi-floor dungeon, which the combined-grid
      // check above only ever sees floor 0 of). Carve the floor STANDALONE (carveDungeon), remove each
      // path in turn, and count those whose removal still leaves the floor's egress reachable from entry
      // — the floor's own loop-redundant carriers. The egress is the boss on the last floor, the
      // stairs-down otherwise (the gating lieutenant is walkable, so the flood routes through it).
      const floors = floorsOf(z);
      const redundantFloor = (F: DungeonLayout, last: boolean): number => {
        const egress = last ? F.boss : (F.stairsDown ?? F.boss);
        return F.paths.reduce((n, _p, i) => {
          const fc: DungeonLayout = JSON.parse(JSON.stringify(F));
          fc.paths.splice(i, 1);
          const seen = reachable(carveDungeon(fc, last), fc.entry);
          return n + (seen[egress.y]?.[egress.x] ? 1 : 0);
        }, 0);
      };
      it("is an OPEN-WORLD network — multiple loop-redundant routes overworld AND dungeon (not a spine)", () => {
        expect(redundant("field")).toBeGreaterThanOrEqual(2); // ≥2 alternate overworld routes
        expect(redundant("dun")).toBeGreaterThanOrEqual(2);   // ≥2 alternate dungeon arms (floor 0, combined grid)
        // EVERY floor of a multi-floor dungeon must hold its own loop redundancy (catches a B2/B3 regression).
        floors.forEach((F, i) => {
          expect(redundantFloor(F, i === floors.length - 1), `floor B${i + 1} loop-redundant carriers`).toBeGreaterThanOrEqual(2);
        });
      });
    });
  }
});

// ── ADR 0008 Stage 2 (GREENVALE-first): the decoupled overworld + dungeon each stand alone with no
// soft-lock. Greenvale runs the new genOverworld/genDungeon path; the model is uniform for all zones
// (Silverwood/Duskmarsh stay on the legacy combined path until Chunk B), so we assert the split for
// every zone's data while the runtime only USES it for Greenvale.
describe("ADR 0008 — decoupled overworld + dungeon (no soft-lock)", () => {
  for (const z of ZONES) {
    describe(z.name, () => {
      const L = z.layout, D = z.dungeon.layout;
      it("overworld alone reaches the dungeon MOUTH + every overworld chest/lair from spawn", () => {
        const seen = reachable(carveOverworld(L), L.spawn);
        expect(seen[L.mouth.y][L.mouth.x], "mouth reachable").toBe(true);
        for (const ch of L.chests) expect(seen[ch.y][ch.x]).toBe(true);
        if (L.lair) expect(seen[L.lair.y][L.lair.x]).toBe(true);
      });
      it("dungeon alone reaches its BOSS + every dungeon chest from the entry", () => {
        const seen = reachable(carveDungeon(D), D.entry);
        expect(seen[D.boss.y][D.boss.x], "boss reachable").toBe(true);
        for (const ch of D.chests) expect(seen[ch.y][ch.x]).toBe(true);
      });
    });
  }
});

// ── ADR 0008 Stage 3 — MULTI-FLOOR dungeon engine (the Bandit Warren), no soft-lock on ANY floor.
// EVERY floor of EVERY zone (a single-floor dungeon is a 1-element stack) must, from its entry, reach
// its egress + every chest. An INTERMEDIATE floor's egress is its stairs-down (gated by the floor's
// lieutenant, which is walkable in the flood — the gate is a fight, never a wall); the LAST floor's
// egress is the zone boss. This is the foundation for every future multi-floor dungeon.
describe("ADR 0008 Stage 3 — multi-floor dungeon (every floor traversable, no soft-lock)", () => {
  for (const z of ZONES) {
    const floors = floorsOf(z);
    describe(z.name, () => {
      it(`has ${floors.length} floor(s); intermediate floors carry stairs-down, the last carries the boss`, () => {
        floors.forEach((D, i) => {
          const last = i === floors.length - 1;
          // entry on the west edge (the mouth's inside / the up-stair), in-bounds + walkable approach.
          const dinb = (p: Pt) => p.x > 0 && p.y > 0 && p.x < D.w - 1 && p.y < D.h - 1;
          expect(dinb(D.entry), `floor ${i} entry in-bounds`).toBe(true);
          if (last) expect(dinb(D.boss), `floor ${i} boss in-bounds`).toBe(true);
          else { expect(D.stairsDown, `floor ${i} has stairs-down`).toBeTruthy(); expect(dinb(D.stairsDown!), `floor ${i} stairs in-bounds`).toBe(true); }
          // a gating lieutenant (if any) must be in-bounds.
          if (D.miniboss) expect(dinb(D.miniboss), `floor ${i} miniboss in-bounds`).toBe(true);
        });
      });
      floors.forEach((D, i) => {
        const last = i === floors.length - 1;
        it(`B${i + 1} reaches its ${last ? "BOSS" : "stairs-down"} + every chest from the entry`, () => {
          const seen = reachable(carveDungeon(D, last), D.entry);
          if (last) expect(seen[D.boss.y][D.boss.x], `B${i + 1} boss reachable`).toBe(true);
          else expect(seen[D.stairsDown!.y][D.stairsDown!.x], `B${i + 1} stairs reachable`).toBe(true);
          for (const ch of D.chests) expect(seen[ch.y][ch.x], `B${i + 1} chest ${ch.x},${ch.y} reachable`).toBe(true);
          // the gating lieutenant tile itself must be reachable (the player can always reach the gate).
          if (D.miniboss) expect(seen[D.miniboss.y][D.miniboss.x], `B${i + 1} lieutenant reachable`).toBe(true);
          // rest nodes, collapse drops, AND each drop's landing must all be reachable (never stranded).
          if (D.rests) for (const r of D.rests) expect(seen[r.y][r.x], `B${i + 1} rest ${r.x},${r.y} reachable`).toBe(true);
          if (D.drops) for (const dp of D.drops) {
            expect(seen[dp.y][dp.x], `B${i + 1} drop ${dp.x},${dp.y} reachable`).toBe(true);
            expect(seen[dp.to.y][dp.to.x], `B${i + 1} drop-landing ${dp.to.x},${dp.to.y} reachable`).toBe(true);
          }
        });
      });
    });
  }
  it("the Bandit Warren (Greenvale) is the first multi-floor dungeon (≥2 floors, a gated descent)", () => {
    const gv = ZONES.find((z) => z.id === "greenvale")!;
    const floors = floorsOf(gv);
    expect(floors.length).toBeGreaterThanOrEqual(2);            // a real descent, not a single floor
    expect(gv.dungeon.layout).toBe(floors[0]);                  // the single-floor contract: layout == floors[0]
    expect(floors.some((f) => f.miniboss)).toBe(true);          // an in-dungeon mini-boss gates a descent
    expect(gv.dungeon.floorMini).toBeTruthy();                  // a floor-lieutenant key is authored
  });

  // GATE INTEGRITY (QA 2026-06-21): the per-floor reachability test above carves the lieutenant tile
  // WALKABLE (the flood routes through it), so it can confirm "beaten gate → reachable" but CANNOT
  // catch a BYPASS that lets the player slip past the unbeaten gate. This proves the opposite: with the
  // lieutenant tile forced to a WALL, the stairs-down AND every chest authored BEHIND the gate must be
  // UNREACHABLE from the entry — i.e. the gate genuinely blocks until the fight is won. Run on every
  // floor that has a `miniboss` gating a `stairsDown` (today: Bandit Warren B2).
  describe("a gated floor's lieutenant is a TRUE pinch (no bypass past the unbeaten gate)", () => {
    for (const z of ZONES) {
      const floors = floorsOf(z);
      floors.forEach((D, i) => {
        const last = i === floors.length - 1;
        if (last || !D.miniboss || !D.stairsDown) return; // only intermediate floors with a gated descent
        it(`${z.name} B${i + 1}: stairs-down + the gated chest(s) are UNREACHABLE while the lieutenant stands`, () => {
          // sanity: the gate's flank columns (≥2 east of the lieutenant) hold the gated egress, so a
          // halo can't re-open the pinch. Then flood with the lieutenant forced to a WALL.
          const blocked = carveDungeon(D, last, /* miniWall */ true);
          const seen = reachable(blocked, D.entry);
          expect(seen[D.stairsDown!.y][D.stairsDown!.x], `B${i + 1} stairs must be blocked by the gate`).toBe(false);
          // any chest sitting BEHIND the gate (same side as / further than the stairs) must also be gated.
          // Identify "behind" as: not reachable when the gate is a wall. At least one such chest must
          // exist (the reward-the-brave vault) and ALL behind-gate chests must be blocked.
          const gated = D.chests.filter((ch) => !seen[ch.y][ch.x]);
          expect(gated.length, `B${i + 1} has at least one chest behind the gate (the vault)`).toBeGreaterThanOrEqual(1);
          for (const ch of gated) expect(seen[ch.y][ch.x], `gated chest ${ch.x},${ch.y} must be blocked`).toBe(false);
          // and CONVERSELY: with the lieutenant beaten (walkable), the very same stairs + chests open up.
          const open = reachable(carveDungeon(D, last, /* miniWall */ false), D.entry);
          expect(open[D.stairsDown!.y][D.stairsDown!.x], `B${i + 1} stairs open once the gate is beaten`).toBe(true);
          for (const ch of D.chests) expect(open[ch.y][ch.x], `chest ${ch.x},${ch.y} reachable once beaten`).toBe(true);
        });
      });
    }
  });
});

// ── ADR 0009 exemplar: GREENVALE is AREA-NATIVE — its playable overworld realizes its five Areas
// (Hearthford Commons / Orchard Ridge / Bandit Fields / The Hidden Grove / Warren Approach). The
// per-Area regions (data/zones.GREENVALE_AREAS) tile the overworld portion (x<gateWallX) so EVERY
// walkable overworld tile resolves to an Area, finest-first (the small grove pocket wins over Fields).
describe("Greenvale Areas (ADR 0009 — Area-native overworld, finest-first, full coverage)", () => {
  const z = ZONES[0];
  const L = z.layout;
  const ALL_AREAS: GreenvaleAreaId[] = ["gv-commons", "gv-orchard", "gv-fields", "gv-grove", "gv-warren-approach"];

  it("declares exactly the five canonical Greenvale Areas", () => {
    expect(GREENVALE_AREAS.map((a) => a.area).sort()).toEqual([...ALL_AREAS].sort());
  });

  it("resolves the key anchors to the right Area (spawn=Commons, lair=Grove, mouth approach=Warren)", () => {
    expect(greenvaleAreaAt(L.spawn.x, L.spawn.y)).toBe("gv-commons");
    expect(greenvaleAreaAt(L.lair!.x, L.lair!.y)).toBe("gv-grove");           // Hogger's den is in the hidden grove
    expect(greenvaleAreaAt(L.mouth.x - 1, L.mouth.y)).toBe("gv-warren-approach"); // the run-up to the dungeon mouth
    expect(greenvaleAreaAt(L.chests[0].x, L.chests[0].y)).toBe("gv-orchard"); // north-road chest sits in Orchard Ridge
    expect(greenvaleAreaAt(L.chests[1].x, L.chests[1].y)).toBe("gv-fields");  // south-road chest sits in Bandit Fields
  });

  it("the grove pocket WINS over the broad Fields band where they overlap (finest-first)", () => {
    // The lair tile lies inside BOTH the Fields band and the Grove pocket; the smaller Grove must win.
    expect(greenvaleAreaAt(27, 20)).toBe("gv-grove");
  });

  it("covers EVERY walkable overworld tile — no tile west of the gate is Area-less", () => {
    // Carve the overworld exactly as the controller does, then assert every reachable overworld tile
    // (x strictly west of the gate wall) resolves to one of the five Areas.
    const map = carveOverworld(L);
    const seen = reachable(map, L.spawn);
    const present = new Set<GreenvaleAreaId>();
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.gateWallX; x++) {
      if (!seen[y][x]) continue;
      const a = greenvaleAreaAt(x, y);
      expect(a, `tile (${x},${y}) has no Area`).toBeTruthy();
      if (a) present.add(a);
    }
    // and the player can actually roam through all five Areas (each is on the reachable network).
    for (const a of ALL_AREAS) expect(present.has(a), `Area ${a} is unreachable`).toBe(true);
  });
});

describe("settlements (ADR 0006 — walkable, anti-soft-lock)", () => {
  for (const s of Object.values(SETTLEMENTS)) {
    describe(s.name, () => {
      // Decode the ASCII layout exactly as Field.genTown does (glyph → tile kind).
      const map = s.layout.map((row) => Array.from(row, (ch) => TOWN_GLYPHS[ch] ?? "town-cobble"));
      const H = map.length, W = map[0].length;
      const spawn = s.spawn ?? { x: Math.floor(W / 2), y: H - 2 };
      const npcAt = new Set(s.npcs.map((n) => `${n.x},${n.y}`));
      // walkable = not a blocker tile and not an NPC (NPCs block; you bump them to talk).
      const open = (x: number, y: number) =>
        x >= 0 && y >= 0 && x < W && y < H && !TOWN_BLOCKERS.has(map[y][x]) && !npcAt.has(`${x},${y}`);
      const flood = (): boolean[][] => {
        const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
        if (!open(spawn.x, spawn.y)) return seen;
        const q: Pt[] = [spawn]; seen[spawn.y][spawn.x] = true;
        while (q.length) { const { x, y } = q.shift()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); } } }
        return seen;
      };

      it("has uniform-width rows and a walkable spawn", () => {
        expect(s.layout.every((r) => r.length === W)).toBe(true);
        expect(open(spawn.x, spawn.y)).toBe(true);
      });
      it("has an exit gate, and every service + NPC is reachable from spawn (no soft-lock)", () => {
        const seen = flood();
        // exit gate present + reachable
        let hasExit = false;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (POI_OF[map[y][x]] === "exit") { hasExit = true; expect(seen[y][x]).toBe(true); }
        }
        expect(hasExit).toBe(true);
        // every service building (inn/shop/smith/revive) reachable
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          if (POI_OF[map[y][x]] && POI_OF[map[y][x]] !== "exit") expect(seen[y][x]).toBe(true);
        }
        // every NPC has a reachable adjacent tile (the player can walk up and talk)
        for (const n of s.npcs) {
          const adj = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen[n.y + dy]?.[n.x + dx]);
          expect(adj).toBe(true);
        }
        // all four services exist (a real settlement offers inn + shop + smith + revive)
        const kinds = new Set<string>();
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (POI_OF[map[y][x]]) kinds.add(POI_OF[map[y][x]]!);
        for (const svc of ["inn", "shop", "smith", "revive", "exit"]) expect(kinds.has(svc)).toBe(true);
      });
    });
  }
});

// Riverhearth (ADR 0006) — Gaia's first true CITY: a large, dense, multi-district capital with a
// river crossed by bridges. These assertions go beyond generic traversability to prove it reads as a
// city (scale + density) and that the river/bridge can't wall off a bank from the spawn.
describe("Riverhearth — the Trade Capital (city)", () => {
  const s = SETTLEMENTS.riverhearth;
  const map = s.layout.map((row) => Array.from(row, (ch) => TOWN_GLYPHS[ch] ?? "town-cobble"));
  const H = map.length, W = map[0].length;
  const spawn = s.spawn!;
  const npcAt = new Set(s.npcs.map((n) => `${n.x},${n.y}`));
  const open = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < W && y < H && !TOWN_BLOCKERS.has(map[y][x]) && !npcAt.has(`${x},${y}`);
  const flood = (): boolean[][] => {
    const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
    if (!open(spawn.x, spawn.y)) return seen;
    const q: Pt[] = [spawn]; seen[spawn.y][spawn.x] = true;
    while (q.length) { const { x, y } = q.shift()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); } } }
    return seen;
  };

  it("is a CITY in scale (a large map the camera scrolls), not a village", () => {
    expect(W).toBeGreaterThanOrEqual(40);
    expect(H).toBeGreaterThanOrEqual(24);
    expect(s.theme).toBe("city");
    expect(s.npcs.length).toBeGreaterThanOrEqual(8); // a bustling capital cast
  });

  it("reads as multiple districts (grand buildings, townhouses, market stalls all present)", () => {
    const has = (kind: string) => map.some((row) => row.includes(kind));
    expect(has("t-grand")).toBe(true);      // docks warehouses + civic/keep
    expect(has("t-townhouse")).toBe(true);  // residential quarter
    expect(has("t-stall")).toBe(true);      // market square
    expect(has("town-dock")).toBe(true);    // riverfront wharves
    expect(has("town-avenue")).toBe(true);  // the city's paved spine
  });

  it("has a real river crossed by bridges that keep BOTH banks reachable (no district walled off)", () => {
    const hasRiver = map.some((row) => row.includes("town-river"));
    const hasBridge = map.some((row) => row.includes("town-bridge"));
    expect(hasRiver).toBe(true);
    expect(hasBridge).toBe(true);
    const seen = flood();
    // sample reachable tiles strictly west and strictly east of the river — both banks must connect.
    let west = false, east = false;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!seen[y][x] || map[y][x] === "town-river") continue;
      if (x < 18) west = true; else if (x > 28) east = true;
    }
    expect(west).toBe(true);  // west bank reachable from spawn
    expect(east).toBe(true);  // east bank reachable from spawn (only possible across a bridge)
  });
});

// The between-zones HUB CHAIN (ADR 0006): with Silverwood inserted at index 1 the journey is
// Greenvale → [Riverhearth] → Silverwood → [Miregard] → the Duskmarsh. Beating Greenvale's boss
// routes the player through Riverhearth before Silverwood loads; beating Silverwood's boss routes
// through Miregard before the Duskmarsh loads. Every settlement in every chain must exist and be
// walkable — so the flow can't strand the player mid-journey.
describe("zone hub chains (flow can't strand the player)", () => {
  const hubsFor = (z: typeof ZONES[number]) => (z.hubs && z.hubs.length ? z.hubs : [z.hub ?? "hearthford"]);

  it("Greenvale → [Riverhearth] → Silverwood → [Miregard] → the Duskmarsh → Goldmeadow → the Aurelion six, in order", () => {
    // AURELION COMPLETE (2026-06-21): the journey now extends past Goldmeadow through the remaining six
    // regions, with SUNBRIDGE as the LAST element (the continent finale / run-ender) per the brief.
    expect(ZONES.map((z) => z.id)).toEqual([
      "greenvale", "silverwood", "duskmarsh", "goldmeadow",
      "stormcoast", "riverhearth", "frostpeak", "dawnfall", "whisperhills", "sunbridge",
    ]);
    expect(ZONES[ZONES.length - 1].id).toBe("sunbridge"); // the run-ender is last
    // The starting zone's chain is its opening village.
    expect(hubsFor(ZONES[0])).toEqual(["hearthford"]);
    // Inbound to Silverwood you celebrate in the grand trade capital, then reach the forest doorstep Elderbough.
    expect(hubsFor(ZONES[1])).toEqual(["riverhearth", "elderbough"]);
    // Inbound to the Duskmarsh you pass through the grim marsh outpost.
    expect(hubsFor(ZONES[2])).toEqual(["miregard"]);
  });

  it("every settlement named in any chain exists in the registry", () => {
    for (const z of ZONES) for (const id of hubsFor(z)) {
      expect(SETTLEMENTS[id]).toBeTruthy();
      expect(settlement(id).id).toBe(id); // resolves to itself, not the Hearthford fallback
    }
  });
});

// A town SPAWN must be walkable and not boxed in — you should be able to move on arrival. Guards the
// Miregard bug (spawn on a dead-end plank stub with bog on two sides → "can't walk all 4 directions").
describe("town spawns are walkable and not boxed in", () => {
  const npcSet = (s: typeof SETTLEMENTS[string]) => new Set((s.npcs || []).map((n) => `${n.x},${n.y}`));
  const walkable = (s: typeof SETTLEMENTS[string], npcs: Set<string>, x: number, y: number): boolean => {
    const row = s.layout[y]; if (row === undefined) return false;
    const kind = TOWN_GLYPHS[row[x] ?? "#"] ?? "town-cobble"; // mirror field.passable() in townMode
    return !TOWN_BLOCKERS.has(kind) && !npcs.has(`${x},${y}`);
  };
  for (const s of Object.values(SETTLEMENTS)) {
    it(`${s.id}: spawn is walkable with ≥2 open neighbours`, () => {
      const sp = s.spawn; expect(sp).toBeTruthy(); if (!sp) return;
      const npcs = npcSet(s);
      expect(walkable(s, npcs, sp.x, sp.y)).toBe(true);
      const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => walkable(s, npcs, sp.x + dx, sp.y + dy)).length;
      expect(open).toBeGreaterThanOrEqual(2);
    });
  }
});
