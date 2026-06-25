// REQUIEM Stat System V3 — the ability-scaling tier table (data/statScaling). Verifies the
// ring-walk derivation reproduces the canon table in docs/design/stat-system.md §2.

import { describe, it, expect } from "vitest";
import { STAT_TIERS, GOVERNING_STAT, scalingTier, scalingCoef, PRIMARY_STATS, TIER_COEF } from "../src/data/statScaling";
import { RING } from "../src/data/attunements";

describe("stat scaling tiers", () => {
  it("each attunement's S stat is its governing stat", () => {
    for (const att of RING) expect(STAT_TIERS[att][GOVERNING_STAT[att]]).toBe("S");
  });

  it("matches the canon master table (incl. Dara's UMBRAXIS example)", () => {
    // UMBRAXIS: DEF=S, AGI=A, STR=B, MGC=C, SPD=D
    expect(STAT_TIERS.UMBRAXIS).toEqual({ DEF: "S", AGI: "A", STR: "B", MGC: "C", SPD: "D" });
    expect(STAT_TIERS.SOL).toEqual({ AGI: "S", STR: "A", MGC: "B", SPD: "C", DEF: "D" });
    expect(STAT_TIERS.NOX).toEqual({ STR: "S", MGC: "A", SPD: "B", DEF: "C", AGI: "D" });
    expect(STAT_TIERS.ANIMA).toEqual({ MGC: "S", SPD: "A", DEF: "B", AGI: "C", STR: "D" });
    expect(STAT_TIERS.QUANTA).toEqual({ SPD: "S", DEF: "A", AGI: "B", STR: "C", MGC: "D" });
  });

  it("A = prey's stat and D = predator's stat (the ring rule)", () => {
    RING.forEach((att, i) => {
      const prey = RING[(i + 1) % RING.length];      // the one you beat
      const predator = RING[(i + RING.length - 1) % RING.length]; // the one who beats you
      expect(STAT_TIERS[att][GOVERNING_STAT[prey]]).toBe("A");
      expect(STAT_TIERS[att][GOVERNING_STAT[predator]]).toBe("D");
    });
  });

  it("every row and every column is a permutation of S/A/B/C/D (balanced circulant)", () => {
    const sorted = (xs: string[]) => [...xs].sort().join("");
    const target = sorted(["S", "A", "B", "C", "D"]);
    for (const att of RING) expect(sorted(PRIMARY_STATS.map((s) => STAT_TIERS[att][s]))).toBe(target);
    for (const stat of PRIMARY_STATS) expect(sorted(RING.map((att) => STAT_TIERS[att][stat]))).toBe(target);
  });

  it("coefficients: D is a tiny non-zero value; helpers agree", () => {
    expect(TIER_COEF.D).toBeGreaterThan(0);
    expect(TIER_COEF.S).toBe(1.0);
    expect(scalingTier("UMBRAXIS", "SPD")).toBe("D");
    expect(scalingCoef("UMBRAXIS", "SPD")).toBe(TIER_COEF.D);
    expect(scalingCoef("SOL", "AGI")).toBe(1.0);
  });
});
