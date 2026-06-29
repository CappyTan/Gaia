// REQUIEM Stat System V3 — pure enemy stat derivation (systems/enemyStats). Locks the STRUCTURE
// (level-monotonic budget, role shapes, lean re-weighting, caster mag, sponge bosses, dual-source
// substats, determinism). Magnitudes are tuned in balance-sim — these assertions are shape, not values.

import { describe, it, expect } from "vitest";
import { enemyPrimaries, enemyDerived, enemyBlock, primBudget } from "../src/systems/enemyStats";
import { PRIM_KEYS } from "../src/types";

const total = (p: Record<string, number>): number => PRIM_KEYS.reduce((n, k) => n + p[k], 0);

describe("enemyStats — level → primaries (ADR 0018 enemy V3)", () => {
  it("primBudget grows monotonically with level", () => {
    expect(primBudget(5)).toBeGreaterThan(primBudget(1));
    expect(primBudget(20)).toBeGreaterThan(primBudget(10));
  });

  it("a higher-level enemy of the same role has more total primaries", () => {
    expect(total(enemyPrimaries("bruiser", 10))).toBeGreaterThan(total(enemyPrimaries("bruiser", 3)));
  });

  it("role shapes the spread — a wall is DEF-heavy, a skirmisher SPD-heavy, at the same level", () => {
    const wall = enemyPrimaries("wall", 10);
    const skirm = enemyPrimaries("skirmisher", 10);
    expect(wall.DEF).toBeGreaterThan(skirm.DEF);
    expect(skirm.SPD).toBeGreaterThan(wall.SPD);
  });

  it("a lean re-weights toward the leaned stat (the metal-jackpot DEF wall)", () => {
    const plain = enemyPrimaries("rare", 9);
    const leaned = enemyPrimaries("rare", 9, { DEF: 8, VIT: 0.3 });
    expect(leaned.DEF).toBeGreaterThan(plain.DEF);
    expect(leaned.VIT).toBeLessThan(plain.VIT);
  });

  it("is deterministic (pure — no RNG)", () => {
    expect(enemyPrimaries("caster", 12, { VIT: 2 })).toEqual(enemyPrimaries("caster", 12, { VIT: 2 }));
  });
});

describe("enemyStats — derived combat block", () => {
  it("casters convert VIT → mag; non-casters have mag 0 (ADR 0013)", () => {
    expect(enemyBlock("SOL", "caster", 10).mag).toBeGreaterThan(0);
    expect(enemyBlock("SOL", "bruiser", 10).mag).toBe(0);
  });

  it("a wall out-armors and out-HPs a skirmisher of the same level", () => {
    const wall = enemyBlock("NOX", "wall", 12);
    const skirm = enemyBlock("NOX", "skirmisher", 12);
    expect(wall.armor).toBeGreaterThan(skirm.armor);
    expect(wall.maxhp).toBeGreaterThan(skirm.maxhp);
  });

  it("bosses dwarf trash HP at the same level (the sponge role)", () => {
    expect(enemyBlock("NOX", "boss", 10).maxhp).toBeGreaterThan(enemyBlock("NOX", "bruiser", 10).maxhp * 3);
  });

  it("substats come from the dual-source baseline — a DEF wall rolls Matter Reduction", () => {
    expect(enemyDerived("NOX", "wall", enemyPrimaries("wall", 12)).sub.Mrd).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    expect(enemyBlock("QUANTA", "brute", 15)).toEqual(enemyBlock("QUANTA", "brute", 15));
  });
});
