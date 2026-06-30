// Pure engine for the five party-shared per-Attunement Resource pools (ADR 0019). No DOM. A hero
// generates into the pool of THEIR Attunement (specials/auto) and any hero of that Attunement may spend
// it (signatures/ultimates) — the strategic mono-vs-diverse identity. Distinct from MNA (the never-spent
// unlock gate). Config + magnitudes live in data/resources; RNG injectable for the QUANTA variance.

import type { Attunement, MnaPools } from "../types";
import { ATTUNEMENTS, zeroMna } from "../types";
import type { Rng } from "../core/rng";
import { clamp } from "../core/rng";
import { RESOURCE } from "../data/resources";

/** The five pools, keyed by Attunement (reuses the per-Attunement numeric shape). */
export type Resources = MnaPools;
export const zeroResources = (): Resources => zeroMna();

export const poolCap = (att: Attunement): number => RESOURCE.pools[att].cap;

/** Generate `amt` into a pool (own-Attunement), clamped to the pool cap. */
export function gain(pools: Resources, att: Attunement, amt: number): void {
  pools[att] = Math.min(poolCap(att), pools[att] + Math.max(0, amt));
}

export const canAfford = (pools: Resources, att: Attunement, cost: number): boolean => pools[att] >= cost;

/** How much own-Attunement resource a party action GENERATES this turn (cost is debited separately at
 *  resolution). Pure decision used by the battle turn loop (ADR 0019 one-way economy):
 *   • a spend action (signature/ultimate — `resourceCost > 0`) generates nothing;
 *   • a V3 generating skill (special — `resourceGen` set) gives its own band amount;
 *   • a legacy hand-authored skill (no resource fields) gives the flat `legacyGen`;
 *   • a basic Attack / Defend (no skill) gives `autoGen` (the class's auto trickle, or `legacyGen`). */
export function turnGain(
  skill: { resourceGen?: number; resourceCost?: number } | null | undefined,
  autoGen: number,
  legacyGen: number,
): number {
  if (!skill) return autoGen;
  if (skill.resourceCost) return 0;
  if (skill.resourceGen != null) return skill.resourceGen;
  return legacyGen;
}

/** Spend from a pool if affordable. The cost is clamped by the per-action spend cap (D8 anti-degeneracy)
 *  so one ability can never dump the whole reserve. Returns true iff it was debited. */
export function spend(pools: Resources, att: Attunement, cost: number): boolean {
  const c = Math.min(Math.max(0, cost), RESOURCE.spendCap);
  if (pools[att] < c) return false;
  pools[att] -= c;
  return true;
}

/** Apply each pool's between-fights personality (D2), config-driven and collapsible to flat:
 *  NOX/UMBRAXIS bank/conserve (no passive change) · SOL runs hot (bleeds above a threshold) · ANIMA
 *  compounds (passive regen scaling with fill) · QUANTA gambles (a variance swing). Mutates `pools`. */
export function applyPersonalities(pools: Resources, rng: Rng = Math.random): void {
  if (!RESOURCE.personalities) return; // collapsed to flat — pools are plain reservoirs
  for (const att of ATTUNEMENTS) {
    const p = RESOURCE.pools[att];
    const v = pools[att];
    if (p.decayAbove != null && p.decay && v > p.decayAbove) pools[att] = Math.max(p.decayAbove, v - p.decay);
    else if (p.regen) pools[att] = Math.min(p.cap, v + Math.round(v * p.regen));
    else if (p.variance) pools[att] = clamp(Math.round(v * (1 + (rng() - 0.5) * p.variance)), 0, p.cap);
  }
}

/** Between-fight upkeep: if pools persist, age them by their personalities; if not, reset to empty
 *  (the reset-per-fight model). Called at fight start. */
export function carryPools(pools: Resources, rng: Rng = Math.random): Resources {
  if (!RESOURCE.persist) return zeroResources();
  applyPersonalities(pools, rng);
  return pools;
}
