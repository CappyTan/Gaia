// REQUIEM Stat System V3 — pure stat math (no DOM). Two jobs:
//   1) abpFromGear — turn a hero's GEAR-granted primary attributes into an ability-power amplifier,
//      weighted by their Attunement's S/A/B/C/D scaling tier (data/statScaling). GEAR-only on purpose:
//      a hero with no gear gets +0%, so combat stays neutral at baseline; primaries are the new
//      damage axis the loot hunt feeds (docs/design/stat-system.md §2/§5).
//   2) substats — the universal §3 attribute→substat conversions (the same for every class), used to
//      surface the secondary-stat sheet on the character screen.

import type { Attunement, PrimaryStat, Prims } from "../types";
import { PRIM_KEYS } from "../types";
import { scalingCoef } from "../data/statScaling";

/** Ability-power per (1 primary point × tier coefficient). Tuned via the balance sim so a fully-geared
 *  party lands the design targets while an ungeared one is unchanged. */
export const ABP_K = 0.006;

/** Ability-power amplifier (fraction) from a hero's GEAR primaries, weighted by Attunement tier. */
export function abpFromGear(att: Attunement, gearPrim: Partial<Prims>): number {
  let sum = 0;
  for (const s of PRIM_KEYS) sum += (gearPrim[s] || 0) * scalingCoef(att, s);
  return sum * ABP_K;
}

/** A derived substat (display): code + label + value (already a % where the unit is %). */
export interface Substat {
  key: string;
  label: string;
  value: number;
  unit: "" | "%";
}

/** §3 universal attribute→substat conversions (per-10 rates), flat for every class. `base` lets the
 *  caller fold in flat sources already tracked on the unit (innate crit, gear lifesteal affix). */
export function substats(prim: Prims, base: { crit?: number; leech?: number } = {}): Substat[] {
  const { STR, AGI, MGC, SPD, DEF } = prim;
  const r1 = (n: number) => Math.round(n * 10) / 10; // one decimal for the % stats
  return [
    // Offensive
    { key: "Crt", label: "Crit Chance", value: r1((base.crit || 0) + AGI * 0.01), unit: "%" },
    { key: "Arp", label: "Armor Pen", value: r1(STR * 0.01), unit: "%" },
    { key: "Lif", label: "Lifesteal", value: r1((base.leech || 0) + STR * 0.005), unit: "%" },
    // Precision / flow
    { key: "Acc", label: "Accuracy", value: r1(AGI * 0.02), unit: "%" },
    { key: "Eva", label: "Evasion", value: r1(AGI * 0.01), unit: "%" },
    // Turn economy
    { key: "Abg", label: "Attack-Bar Gain", value: r1(SPD * 0.02), unit: "%" },
    { key: "Cdr", label: "Cooldown Recovery", value: r1(SPD * 0.01), unit: "%" },
    { key: "Ini", label: "Initiative", value: Math.round(SPD * 0.1), unit: "" },
    // Healing & status / power
    { key: "Abp", label: "Ability Power", value: r1(MGC * 0.02), unit: "%" },
    { key: "Hld", label: "Healing Done", value: r1(MGC * 0.02), unit: "%" },
    { key: "Deb", label: "Debuff Potency", value: r1(MGC * 0.01), unit: "%" },
    // Defensive
    { key: "Dmr", label: "Damage Reduction", value: r1(DEF * 0.01), unit: "%" },
    { key: "Bar", label: "Barrier Power", value: r1(DEF * 0.02), unit: "%" },
  ];
}

export type { PrimaryStat };
