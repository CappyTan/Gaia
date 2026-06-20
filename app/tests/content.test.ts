// Content-layer tests: the DB registry query API + cross-references, and the schema/integrity
// validator. These guard the "database" so authoring/tweaking content can't silently break the game.

import { describe, it, expect } from "vitest";
import { DB } from "../src/data/db";
import { validateContent } from "../src/data/validate";
import { ARCHETYPE_KEYS } from "../src/data/party";
import { ATTUNEMENTS } from "../src/types";
import { ZONES, type ZoneLayout, type Pt } from "../src/data/zones";
import { SETTLEMENTS, TOWN_GLYPHS, TOWN_BLOCKERS, POI_OF, settlement } from "../src/data/towns";

// Mirror of controllers/field.genMap's carve (WITHOUT the repair pass) so the test proves each
// authored zone layout is ALREADY soft-lock-free by design — the boss + every chest/lair reachable
// from spawn — not just rescued by the runtime flood-fill repair. (ADR 0006 anti-soft-lock rule.)
function carveZone(L: ZoneLayout): string[][] {
  const map = Array.from({ length: L.h }, () => Array.from({ length: L.w }, () => "tree"));
  const inB = (x: number, y: number) => x > 0 && y > 0 && x < L.w - 1 && y < L.h - 1;
  const c = (x: number, y: number, k: string) => { if (inB(x, y)) map[y][x] = k; };
  const rect = (r: { x: number; y: number; w: number; h: number }) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) c(x, y, "grass"); };
  L.fieldRects.forEach(rect); L.dunRects.forEach(rect);
  const seg = (a: Pt, b: Pt) => { let x = a.x, y = a.y; c(x, y, "path"); while (x !== b.x) { x += Math.sign(b.x - x); c(x, y, "path"); } while (y !== b.y) { y += Math.sign(b.y - y); c(x, y, "path"); } };
  const path = (p: Pt[]) => { for (let i = 1; i < p.length; i++) seg(p[i - 1], p[i]); };
  L.fieldPaths.forEach(path); L.dunPaths.forEach(path);
  for (let y = 1; y < L.h - 1; y++) map[y][L.gateWallX] = "tree";
  c(L.gateWallX - 1, L.gate.y, "path"); c(L.gateWallX + 1, L.gate.y, "path"); map[L.gate.y][L.gateWallX] = "miniboss";
  // hard-blocking water pools stamped over carved ground (marsh) — mirrors genMap step 5b.
  if (L.water) for (const w of L.water) for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++) if (inB(x, y) && map[y][x] !== "miniboss") map[y][x] = "water";
  const halo = (p: Pt) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = p.x + dx, yy = p.y + dy; if (inB(xx, yy) && (map[yy][xx] === "tree" || map[yy][xx] === "water")) map[yy][xx] = "grass"; } };
  L.chests.forEach((p) => { halo(p); c(p.x, p.y, "chest"); });
  if (L.lair) { halo(L.lair); c(L.lair.x, L.lair.y, "lair"); }
  c(L.boss.x, L.boss.y, "boss"); c(L.spawn.x, L.spawn.y, "path");
  return map;
}
function reachable(map: string[][], start: Pt): boolean[][] {
  const H = map.length, W = map[0].length;
  const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && map[y][x] !== "tree" && map[y][x] !== "water";
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
    // slime spawns in Greenvale (zone 0); the Cave Troll boss is in zone 1
    expect(DB.enemies.zonesOf("slime")).toContain(0);
    expect(DB.enemies.zonesOf("troll")).toContain(1);
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

describe("zone layouts (ADR 0006 — bespoke + anti-soft-lock)", () => {
  for (const z of ZONES) {
    describe(z.name, () => {
      const L = z.layout;
      it("has a layout with in-bounds, sensibly-sided anchors", () => {
        expect(L).toBeTruthy();
        const inb = (p: Pt) => p.x > 0 && p.y > 0 && p.x < L.w - 1 && p.y < L.h - 1;
        expect(inb(L.spawn)).toBe(true);
        expect(inb(L.boss)).toBe(true);
        expect(L.chests.every(inb)).toBe(true);
        expect(L.spawn.x).toBeLessThan(L.gateWallX);   // start is in the overworld
        expect(L.boss.x).toBeGreaterThan(L.gateWallX);  // boss is in the dungeon
        expect(L.gate.x).toBe(L.gateWallX);
      });
      it("is fully traversable — boss + every chest/lair reachable from spawn (no soft-lock)", () => {
        const map = carveZone(L);
        const seen = reachable(map, L.spawn);
        expect(seen[L.boss.y][L.boss.x]).toBe(true);
        for (const ch of L.chests) expect(seen[ch.y][ch.x]).toBe(true);
        if (L.lair) expect(seen[L.lair.y][L.lair.x]).toBe(true);
      });
    });
  }
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

// The between-zones HUB CHAIN (ADR 0006): beating Greenvale's boss should route the player through
// Riverhearth → Miregard before the Duskmarsh loads, and every settlement in every zone's chain must
// exist and be walkable — so the new flow can't strand the player mid-journey.
describe("zone hub chains (flow can't strand the player)", () => {
  const hubsFor = (z: typeof ZONES[number]) => (z.hubs && z.hubs.length ? z.hubs : [z.hub ?? "hearthford"]);

  it("Greenvale → Riverhearth → Miregard → the Duskmarsh, in that order", () => {
    // The starting zone's chain is its opening village.
    expect(hubsFor(ZONES[0])).toEqual(["hearthford"]);
    // Inbound to the Duskmarsh you pass through the capital then the marsh outpost.
    expect(hubsFor(ZONES[1])).toEqual(["riverhearth", "miregard"]);
  });

  it("every settlement named in any chain exists in the registry", () => {
    for (const z of ZONES) for (const id of hubsFor(z)) {
      expect(SETTLEMENTS[id]).toBeTruthy();
      expect(settlement(id).id).toBe(id); // resolves to itself, not the Hearthford fallback
    }
  });
});
