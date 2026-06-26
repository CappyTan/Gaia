// REQUIEM Stat System V3 — pure stat math (systems/stats): the gear→ability-power amplifier
// (tier-weighted, gear-only so combat is neutral at baseline) and the §3 substat conversions.

import { describe, it, expect } from "vitest";
import { abpFromGear, substats, ABP_K } from "../src/systems/stats";
import { zeroPrims } from "../src/types";
import { scalingCoef } from "../src/data/statScaling";

describe("abpFromGear", () => {
  it("is zero with no gear primaries (combat-neutral baseline)", () => {
    expect(abpFromGear("SOL", zeroPrims())).toBe(0);
    expect(abpFromGear("UMBRAXIS", {})).toBe(0);
  });

  it("weights the governing (S) stat at full coefficient", () => {
    // SOL governs AGI (S = 1.0): +100 AGI → 100 * 1.0 * ABP_K
    expect(abpFromGear("SOL", { AGI: 100 })).toBeCloseTo(100 * ABP_K, 6);
  });

  it("a D-tier stat contributes far less than the S stat (the ring rule)", () => {
    const s = abpFromGear("UMBRAXIS", { DEF: 50 }); // DEF = S for Umbraxis
    const d = abpFromGear("UMBRAXIS", { SPD: 50 }); // SPD = D for Umbraxis
    expect(s).toBeGreaterThan(d);
    expect(d).toBeCloseTo(50 * scalingCoef("UMBRAXIS", "SPD") * ABP_K, 6);
  });

  it("sums across all five primaries", () => {
    const prim = { STR: 10, AGI: 10, MGC: 10, SPD: 10, DEF: 10 };
    const expected = (["STR", "AGI", "MGC", "SPD", "DEF"] as const).reduce((n, s) => n + 10 * scalingCoef("ANIMA", s), 0) * ABP_K;
    expect(abpFromGear("ANIMA", prim)).toBeCloseTo(expected, 6);
  });
});

describe("substats (§3 conversions)", () => {
  const find = (prim: Parameters<typeof substats>[0], key: string) => substats(prim).find((s) => s.key === key)!;

  it("lists exactly the 20 secondary stats in Dara's canonical order", () => {
    const labels = substats(zeroPrims()).map((s) => s.label);
    expect(labels).toEqual([
      "Attack", "Armor Penetration", "Armor Break", "Life Steal",            // STR
      "Crit Chance", "Evasion", "Accuracy", "Combo Chance",                  // AGI
      "Ability Power", "Healing Power", "Buff Potency", "Debuff Potency",     // MGC
      "Attack Bar Gain", "Initiative", "Cooldown Recovery", "Counter Chance", // SPD
      "Armor", "Damage Reduction", "Barrier Power", "Block Chance",           // DEF
    ]);
  });

  it("AGI drives crit/accuracy/evasion/combo from the AGI primary", () => {
    const prim = { ...zeroPrims(), AGI: 100 };
    expect(find(prim, "Crt").value).toBeCloseTo(10.0, 5); // 0.1/pt
    expect(find(prim, "Acc").value).toBeCloseTo(10.0, 5);
    expect(find(prim, "Eva").value).toBeCloseTo(5.0, 5);
    expect(find(prim, "Cmb").value).toBeCloseTo(5.0, 5);
  });

  it("folds in flat base crit/leech sources", () => {
    const prim = { ...zeroPrims(), AGI: 100, STR: 100 };
    expect(substats(prim, { crit: 5 }).find((s) => s.key === "Crt")!.value).toBeCloseTo(15.0, 5); // 5 + 100*0.1
    expect(substats(prim, { leech: 3 }).find((s) => s.key === "Lif")!.value).toBeCloseTo(8.0, 5); // 3 + 100*0.05
  });

  it("SPD initiative is a flat +1 per 10", () => {
    expect(find({ ...zeroPrims(), SPD: 50 }, "Ini").value).toBe(5);
  });
});
