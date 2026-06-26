// REQUIEM Stat System V3 — pure stat math (systems/stats): the gear→ability-power amplifier
// (tier-weighted, gear-only so combat is neutral at baseline) and the §3 substat conversions.

import { describe, it, expect } from "vitest";
import { abpFromGear, substats, ABP_K } from "../src/systems/stats";
import { zeroPrims, zeroSubs } from "../src/types";
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

describe("substats (the 20 secondary stats from gear)", () => {
  it("lists exactly the 20 secondary stats in Dara's canonical order", () => {
    const labels = substats(zeroSubs()).map((s) => s.label);
    expect(labels).toEqual([
      "Armor Penetration", "Parry", "Execute", "Life Steal",                 // STR
      "Crit Chance", "Evasion", "Accuracy", "Combo Chance",                  // AGI
      "Ability Power", "Healing Done", "Buff Potency", "Veil",               // MGC
      "Attack Bar Gain", "Cooldown Recovery", "Action Refund", "Chase Chance", // SPD
      "Damage Reduction", "Gravity", "Resistance", "Crush",                  // DEF
    ]);
  });

  it("reads gear affix totals straight from `sub`", () => {
    const sub = { ...zeroSubs(), Arp: 12, Vei: 7 };
    expect(substats(sub).find((s) => s.key === "Arp")!.value).toBe(12);
    expect(substats(sub).find((s) => s.key === "Vei")!.value).toBe(7);
  });

  it("Crit/Life Steal show the live combat totals passed in `base`", () => {
    const sub = { ...zeroSubs(), Crt: 99, Lfs: 99 }; // base overrides the raw sub value
    const out = substats(sub, { crit: 17, leech: 8 });
    expect(out.find((s) => s.key === "Crt")!.value).toBe(17);
    expect(out.find((s) => s.key === "Lfs")!.value).toBe(8);
  });
});
