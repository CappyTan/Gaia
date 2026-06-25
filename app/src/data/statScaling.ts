// REQUIEM Stat System V3 — ability-scaling tiers (canon: docs/design/stat-system.md §2).
// Pure data + trivial accessors (no DOM). Each Attunement scales its abilities off the five primary
// stats at a tier S/A/B/C/D. The table is DERIVED from one rule so it can't drift:
//   • your own governing stat = S, then WALK the affinity ring in the "beats" direction
//     (you → prey → … → predator) assigning S → A → B → C → D.
// So A = your prey's stat, D = your predator's stat. Verified against the doc in tests.

import type { Attunement } from "../types";
import { RING } from "./attunements";

export type PrimaryStat = "STR" | "AGI" | "MGC" | "SPD" | "DEF";
export type ScalingTier = "S" | "A" | "B" | "C" | "D";

export const PRIMARY_STATS: PrimaryStat[] = ["STR", "AGI", "MGC", "SPD", "DEF"];

/** Each Attunement's GOVERNING (S-tier) primary stat. */
export const GOVERNING_STAT: Record<Attunement, PrimaryStat> = {
  SOL: "AGI",
  NOX: "STR",
  ANIMA: "MGC",
  QUANTA: "SPD",
  UMBRAXIS: "DEF",
};

/** Ability-output coefficient per tier (D is a tiny ~5%, never zero — Dara). Tunable. */
export const TIER_COEF: Record<ScalingTier, number> = { S: 1.0, A: 0.7, B: 0.45, C: 0.25, D: 0.05 };

const TIER_ORDER: ScalingTier[] = ["S", "A", "B", "C", "D"];

// Derive the full table by walking the ring (beats direction) from each attunement.
function buildTable(): Record<Attunement, Record<PrimaryStat, ScalingTier>> {
  const out = {} as Record<Attunement, Record<PrimaryStat, ScalingTier>>;
  RING.forEach((att, i) => {
    const row = {} as Record<PrimaryStat, ScalingTier>;
    for (let j = 0; j < RING.length; j++) {
      const other = RING[(i + j) % RING.length]; // self (j=0) → prey → … → predator (j=4)
      row[GOVERNING_STAT[other]] = TIER_ORDER[j];
    }
    out[att] = row;
  });
  return out;
}

/** STAT_TIERS[attunement][stat] → S/A/B/C/D. */
export const STAT_TIERS: Record<Attunement, Record<PrimaryStat, ScalingTier>> = buildTable();

/** The scaling tier an Attunement has with a given primary stat. */
export function scalingTier(att: Attunement, stat: PrimaryStat): ScalingTier {
  return STAT_TIERS[att][stat];
}

/** How much that stat converts into ability output for the Attunement (0..1). */
export function scalingCoef(att: Attunement, stat: PrimaryStat): number {
  return TIER_COEF[scalingTier(att, stat)];
}
