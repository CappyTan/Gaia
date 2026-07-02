// @vitest-environment jsdom
//
// CRAFTING SLICE (docs/design/crafting-schema.md, Staging §1) — the pure seams:
//   • systems/crafting: battle-drop rolls (per-foe family pools, RNG-injected), gathering-node
//     yields, recipe math (has/craft/consume), and the Health-Tonic heal effect;
//   • the DATA net: materials/consumables/node tables are internally consistent (validate);
//   • the GENERATORS: Greenvale's authored gathering nodes stamp into both realizers
//     (buildAuthoredGrid AND mapgen.genOverworld), reachable from spawn, and a gathered node
//     regenerates as plain ground (the looted-chest pattern).

import { describe, it, expect, beforeEach } from "vitest";
import {
  addCount, addCounts, rollBattleMaterials, rollBattleConsumables, gatherNode, hasMaterials,
  craftConsumable, healLowestAlly, emptyCounts, type Counts,
} from "../src/systems/crafting";
import { MATERIALS, GATHER_NODES, ENEMY_MAT_FAMILY, FAMILY_MATS } from "../src/data/materials";
import { CONSUMABLES } from "../src/data/consumables";
import { ZONES, type Pt } from "../src/data/zones";
import { buildAuthoredGrid } from "../src/data/world";
import { genOverworld, type ClearedState } from "../src/systems/mapgen";
import { validateContent } from "../src/data/validate";
import { seeded } from "../src/core/rng";
import { placementOf } from "../src/data/world";
import { Field } from "../src/controllers/field";
import { Game } from "../src/controllers/game";

const GV = ZONES.find((z) => z.id === "greenvale")!;
const NODES = GV.layout.nodes!;

/** A fresh nothing-cleared state for the pure generators (mirrors ruins.test.ts). */
const fresh = (over: Partial<ClearedState> = {}): ClearedState => ({
  poiSpent: () => false, chestOpened: () => false, miniCleared: false, floorMiniBeaten: false, restSpent: () => false, ...over,
});

const lo = () => 0;      // an "always hits" rng
const hi = () => 0.999;  // an "always misses" rng

describe("battle material drops (rollBattleMaterials)", () => {
  it("beasts shed beast parts, outlaws shed outlaw parts, with the foe's attunement essence on the rare roll", () => {
    // rng=0: common drop hits (pool[0]) and the 6% rare-essence roll hits (skipping the second common).
    expect(rollBattleMaterials(["kobold"], lo)).toEqual({ "beast-fang": 1, "sol-ember": 1 });   // SOL foe
    expect(rollBattleMaterials(["gbandit"], lo)).toEqual({ "rogue-thread": 1, "nox-rime": 1 }); // NOX foe
    expect(rollBattleMaterials(["slime"], lo)).toEqual({ "beast-fang": 1, "aether-dust": 1 });  // ANIMA → neutral dust
  });
  it("drops nothing on a cold roll, and nothing at all for an unmapped foe", () => {
    expect(rollBattleMaterials(["kobold", "gbandit"], hi)).toEqual({});
    expect(rollBattleMaterials(["hollowking", "treantelder"], lo)).toEqual({}); // later-zone foes: no pool yet
  });
  it("is deterministic under a seed and caps at 0–2 materials per foe, always from known pools", () => {
    const keys = Array(200).fill("kobold");
    const a = rollBattleMaterials(keys, seeded(42));
    const b = rollBattleMaterials(keys, seeded(42));
    expect(a).toEqual(b);
    const legal = new Set([...FAMILY_MATS.beast, "sol-ember", "aether-dust"]);
    for (const id of Object.keys(a)) expect(legal.has(id)).toBe(true);
    const total = Object.values(a).reduce((s, n) => s + n, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(keys.length * 2);
  });
});

describe("battle consumable drops (rollBattleConsumables)", () => {
  it("drops nothing on a cold roll", () => {
    expect(rollBattleConsumables(["kobold", "gbandit"], hi)).toEqual({});
  });
  it("on a hot roll, sheds a real registered consumable per fallen foe", () => {
    const out = rollBattleConsumables(["kobold", "gbandit", "hollowking"], lo);
    expect(Object.values(out).reduce((s, n) => s + n, 0)).toBe(3); // every foe hits at rng=0
    for (const id of Object.keys(out)) expect(CONSUMABLES[id]).toBeTruthy();
  });
  it("is deterministic under a seed, and stays near a modest ~4-8% per-foe rate over many rolls", () => {
    const keys = Array(2000).fill("kobold");
    const a = rollBattleConsumables(keys, seeded(11));
    const b = rollBattleConsumables(keys, seeded(11));
    expect(a).toEqual(b);
    const total = Object.values(a).reduce((s, n) => s + n, 0);
    expect(total).toBeGreaterThan(2000 * 0.03);
    expect(total).toBeLessThan(2000 * 0.09);
    for (const id of Object.keys(a)) expect(CONSUMABLES[id]).toBeTruthy();
  });
  it("with only Health Tonic shipped, every hit lands on it — but the lookup is tier-generic, not hardcoded", () => {
    const out = rollBattleConsumables(Array(50).fill("hollowking"), lo);
    expect(out).toEqual({ "health-tonic": 50 });
  });
});

describe("gathering yields (gatherNode)", () => {
  it("every node kind yields 1–2 of its base plus its rare on a hot roll", () => {
    for (const def of Object.values(GATHER_NODES)) {
      const hot = gatherNode(def.kind, lo);
      expect(hot[def.base]).toBe(2);      // 1 + the 50% extra
      expect(hot[def.rare]).toBe(1);      // rare bonus hit
      const cold = gatherNode(def.kind, hi);
      expect(cold).toEqual({ [def.base]: 1 }); // never empty-handed
    }
  });
  it("is deterministic under a seed", () => {
    expect(gatherNode("node-ore", seeded(7))).toEqual(gatherNode("node-ore", seeded(7)));
  });
});

describe("recipe math (has/craft/consume)", () => {
  const TONIC = CONSUMABLES["health-tonic"];
  it("crafts when the recipe is covered, consuming exactly the recipe", () => {
    const mats: Counts = { "lifebloom-seed": 1, "beast-sinew": 2 };
    const owned = emptyCounts();
    expect(hasMaterials(mats, TONIC.recipe)).toBe(true);
    expect(craftConsumable(mats, owned, TONIC)).toBe(true);
    expect(owned).toEqual({ "health-tonic": 1 });
    expect(mats).toEqual({ "beast-sinew": 1 }); // seed stack emptied → deleted, sinew decremented
  });
  it("refuses (stacks untouched) when short", () => {
    const mats: Counts = { "lifebloom-seed": 1 };
    const owned = emptyCounts();
    expect(craftConsumable(mats, owned, TONIC)).toBe(false);
    expect(mats).toEqual({ "lifebloom-seed": 1 });
    expect(owned).toEqual({});
  });
  it("addCount/addCounts fold stacks (ignoring non-positive adds)", () => {
    const mats = emptyCounts();
    addCount(mats, "iron-scrap", 2); addCount(mats, "iron-scrap"); addCount(mats, "iron-scrap", 0);
    addCounts(mats, { "beast-hide": 3 });
    expect(mats).toEqual({ "iron-scrap": 3, "beast-hide": 3 });
  });
});

describe("Health Tonic effect (healLowestAlly)", () => {
  const ally = (name: string, hp: number, maxhp = 100, alive = true) => ({ name, hp, maxhp, alive });
  it("mends the MOST WOUNDED living ally by pct of their max, clamped to max", () => {
    const party = [ally("A", 80), ally("B", 20), ally("C", 0, 100, false)];
    const res = healLowestAlly(party, 0.35)!;
    expect(res.target.name).toBe("B");
    expect(res.healed).toBe(35);
    expect(party[1].hp).toBe(55);
    // near-full ally clamps to max
    const p2 = [ally("D", 90)];
    expect(healLowestAlly(p2, 0.35)!.healed).toBe(10);
    expect(p2[0].hp).toBe(90 + 10);
  });
  it("compares by wounded FRACTION and returns null when nobody needs it", () => {
    const party = [ally("Big", 150, 300), ally("Small", 60, 100)]; // 50% vs 60% → Big is worse off
    expect(healLowestAlly(party, 0.1)!.target.name).toBe("Big");
    expect(healLowestAlly([ally("Full", 100)], 0.35)).toBeNull();       // full-health party
    expect(healLowestAlly([ally("Dead", 0, 100, false)], 0.35)).toBeNull(); // no living ally
  });
});

describe("data net (validate + tables)", () => {
  it("content stays internally consistent with the crafting tables wired in", () => {
    expect(validateContent()).toEqual([]);
  });
  it("every mapped drop family + node yield resolves to a real material", () => {
    for (const ids of Object.values(FAMILY_MATS)) for (const id of ids) expect(MATERIALS[id]).toBeTruthy();
    for (const n of Object.values(GATHER_NODES)) { expect(MATERIALS[n.base]).toBeTruthy(); expect(MATERIALS[n.rare]).toBeTruthy(); }
    expect(Object.keys(ENEMY_MAT_FAMILY).length).toBeGreaterThan(0);
  });
});

// ── the generators stamp Greenvale's nodes, reachable, regenerating gathered ones as ground ──
const WALLS = new Set(["tree", "water", "uncharted", "cliff", "river"]);
function reach(grid: string[][], from: Pt, to: Pt): boolean {
  const H = grid.length, W = grid[0]?.length ?? 0;
  const open = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !WALLS.has(grid[y][x]);
  if (!open(from.x, from.y)) return false;
  const seen = Array.from({ length: H }, () => Array.from({ length: W }, () => false));
  const q = [from]; seen[from.y][from.x] = true;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (open(nx, ny) && !seen[ny][nx]) { seen[ny][nx] = true; q.push({ x: nx, y: ny }); }
    }
  }
  return !!seen[to.y]?.[to.x];
}

describe("gathering nodes on the Greenvale grid", () => {
  it("authors a healthy scatter (8–12) across all three kinds", () => {
    expect(NODES.length).toBeGreaterThanOrEqual(8);
    expect(NODES.length).toBeLessThanOrEqual(12);
    for (const k of ["node-ore", "node-root", "node-bloom"]) expect(NODES.some((n) => n.kind === k)).toBe(true);
  });
  it("buildAuthoredGrid (big map) stamps every node walkable + reachable from spawn", () => {
    const grid = buildAuthoredGrid("greenvale");
    for (const n of NODES) {
      expect(grid[n.y][n.x]).toBe(n.kind);
      expect(reach(grid, GV.layout.spawn, n)).toBe(true);
    }
  });
  it("genOverworld (discrete) stamps ungathered nodes and regenerates gathered ones as ground", () => {
    const r1 = genOverworld(GV, fresh(), seeded(1));
    for (const n of NODES) expect(r1.map[n.y][n.x]).toBe(n.kind);
    const r2 = genOverworld(GV, fresh({ nodeGathered: () => true }), seeded(1));
    for (const n of NODES) expect(r2.map[n.y][n.x]).toBe("grass"); // spent → plain ground, no respawn
  });
});

// ── controller plumbing (gather → bank → persist; craft → use), driven like ruins.test.ts ──
describe("gather / craft / use — the controller seams", () => {
  beforeEach(() => {
    Game.party = [{ name: "Auren", alive: true, hp: 40, maxhp: 100 } as any];
    Game.materials = {}; Game.consumables = {}; Game.gold = 100;
    document.body.innerHTML = `<div id="fieldScreen"></div><div id="fieldHud"></div><div id="fieldZone"></div><div id="fieldHint"></div>`;
    Field.init();
    Field.enterBigMap("greenvale");
  });

  /** Stand on a Greenvale-local tile (world coords) and fire its cell trigger via a zero-step bigMove. */
  function stepOnto(p: Pt) {
    const pl = placementOf("greenvale")!;
    Field.wx = pl.wx + p.x; Field.wy = pl.wy + p.y;
    Field.realizeAround(); Field.syncZoneFromWorld();
    Field.bigMove(0, 0);
  }

  it("stepping onto a node banks its materials, consumes the tile, and persists the gather", () => {
    const ore = NODES.find((n) => n.kind === "node-ore")!;
    const pl = placementOf("greenvale")!;
    expect(Field.cellAt(pl.wx + ore.x, pl.wy + ore.y).kind).toBe("node-ore");
    stepOnto(ore);
    expect(Game.materials["iron-scrap"] ?? 0).toBeGreaterThanOrEqual(1); // the base yield always lands
    expect(Field.cellAt(pl.wx + ore.x, pl.wy + ore.y).kind).toBe("grass"); // tile consumed
    expect(Field.gatheredNodes[Field.nodeKey("greenvale", ore.x, ore.y)]).toBe(true); // persisted record
    // a rebuild (reload / chunk re-realize) can't re-spawn it — the re-apply carves it as ground.
    Field.enterBigMap("greenvale");
    expect(Field.cellAt(pl.wx + ore.x, pl.wy + ore.y).kind).toBe("grass");
  });

  it("crafting at the smith consumes the recipe + the Aether fee; using it mends the wounded ally", () => {
    Game.materials = { "lifebloom-seed": 1, "beast-sinew": 1 };
    Game.craftConsumable("health-tonic");
    expect(Game.consumables).toEqual({ "health-tonic": 1 });
    expect(Game.materials).toEqual({});
    expect(Game.gold).toBe(100 - CONSUMABLES["health-tonic"].fee);
    // short on materials / fee → a no-op
    Game.craftConsumable("health-tonic");
    expect(Game.consumables).toEqual({ "health-tonic": 1 });
    // use it: the wounded ally drinks (35% of 100 max = +35), the stack empties
    const note = Game.useConsumable("health-tonic");
    expect(note).toContain("Auren");
    expect(Game.party[0].hp).toBe(75);
    expect(Game.consumables).toEqual({});
    expect(Game.useConsumable("health-tonic")).toBeNull(); // none left
  });
});
