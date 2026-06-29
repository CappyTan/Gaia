// REQUIEM Stat System V3 — pure stat math (no DOM). Two jobs:
//   1) abpFromGear — turn a hero's GEAR-granted primary attributes into an ability-power amplifier,
//      weighted by their Attunement's S/A/B/C/D scaling tier (data/statScaling). GEAR-only on purpose:
//      a hero with no gear gets +0%, so combat stays neutral at baseline; primaries are the new
//      damage axis the loot hunt feeds (docs/design/stat-system.md §2/§5).
//   2) substats — the universal §3 attribute→substat conversions (the same for every class), used to
//      surface the secondary-stat sheet on the character screen.

import type { Attunement, PrimaryStat, Prims, Subs } from "../types";
import { PRIM_KEYS } from "../types";
import { scalingCoef } from "../data/statScaling";
import { SUBSTATS } from "../data/substats";

/** Ability-power per (1 primary point × tier coefficient). Tuned via the balance sim so a fully-geared
 *  party lands the design targets while an ungeared one is unchanged. */
export const ABP_K = 0.006;

/** Dual-source (ADR 0014): % of secondary stat granted per point of its group's GEAR primary.
 *  Small + gear-only so an ungeared hero is combat-neutral; tune via the balance sim. */
export const SUB_BASE_K = 0.03;

/** Ability-power amplifier (fraction) from a hero's GEAR primaries, weighted by Attunement tier. */
export function abpFromGear(att: Attunement, gearPrim: Partial<Prims>): number {
  let sum = 0;
  for (const s of PRIM_KEYS) sum += (gearPrim[s] || 0) * scalingCoef(att, s);
  return sum * ABP_K;
}

/** Dual-source baseline: each GEAR primary feeds a trickle into its OWN group's 4 substats (the group
 *  structure IS the §3 conversion table). Mutates `sub` in place. Gear-only by design. */
export function substatBaseline(gearPrim: Partial<Prims>, sub: Subs): void {
  for (const d of SUBSTATS) {
    const p = gearPrim[d.group as PrimaryStat] || 0;
    if (p) sub[d.key] += p * SUB_BASE_K;
  }
}

/** A derived substat (display): code + label + value (already a % where the unit is %). */
export interface Substat {
  key: string;
  label: string;
  value: number;
  unit: "" | "%";
}

/**
 * The 20 V3 secondary stats for display, in Dara's canonical order (4 per primary, defs in
 * data/substats). Values come from a hero's gear (the `sub` totals); Crit/Life Steal fold in the
 * live combat values already tracked on the unit (base crit, lifesteal). All are percentages.
 */
export function substats(sub: Subs, base: { crit?: number; leech?: number } = {}): Substat[] {
  return SUBSTATS.map((d) => ({
    key: d.key,
    label: d.label,
    value: d.key === "Crt" ? (base.crit ?? sub.Crt) : d.key === "Lfs" ? (base.leech ?? sub.Lfs) : sub[d.key],
    unit: "%" as const,
  }));
}

export type { PrimaryStat };
