// The 3-lane choice system (ADR 0020 §2) — pure. At each milestone a class presents a small set of
// options and the player banks a pick: specials/signatures offer 2 (pick 1, rotating lanes), passive
// sets offer 3 (pick 1), the ultimate milestone offers 4 (pick 2). Picks are banked permanently and
// respec-able (ADR 0020); a pick goes DORMANT if total MNA later drops below its milestone. MNA is the
// single gate. Operates on a structured ClassSpec; no DOM, no RNG.

import type { AbilityEntry, AbilityTier, ClassSpec } from "../data/classSpec";

/** A choice slot's stable id. Keyed by tier+milestone because a milestone (30/60/90) is shared by BOTH
 *  a signature pair AND a passive set — they are distinct slots. */
export const slotId = (tier: AbilityTier, milestone: number): string => `${tier}@${milestone}`;

/** Player's banked picks: slot id → chosen ability name(s). Ultimates pick 2; everything else 1. */
export type Picks = Record<string, string[]>;

export interface ChoiceSlot {
  id: string;
  tier: AbilityTier;
  milestone: number;
  options: AbilityEntry[];
  pickCount: number; // ultimates: 2 · everything else: 1
}

/** The ordered choice slots a class presents (auto excluded — always available). Each special/signature
 *  milestone groups its 2 options; each passive set (30/60/90) its 3; the ultimate milestone its 4. */
export function choiceSlots(spec: ClassSpec): ChoiceSlot[] {
  const groups = new Map<string, ChoiceSlot>();
  for (const a of spec.abilities) {
    if (a.tier === "auto") continue;
    const id = slotId(a.tier, a.milestone);
    if (!groups.has(id)) groups.set(id, { id, tier: a.tier, milestone: a.milestone, options: [], pickCount: a.tier === "ultimate" ? 2 : 1 });
    groups.get(id)!.options.push(a);
  }
  return [...groups.values()].sort((x, y) => x.milestone - y.milestone || x.tier.localeCompare(y.tier));
}

/** A milestone is reachable once total MNA in the class's Attunement crosses it. */
export const reached = (milestone: number, mna: number): boolean => mna >= milestone;

/** Names picked in a slot. */
export const pickedAt = (picks: Picks, id: string): string[] => picks[id] ?? [];

/** Toggle a pick in a slot, respecting its pickCount (drops the oldest beyond the limit). Respec-able
 *  (ADR 0020) — re-picking swaps freely. Returns a NEW Picks (pure). */
export function choose(picks: Picks, id: string, name: string, pickCount: number): Picks {
  const cur = pickedAt(picks, id);
  const next = cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name].slice(-pickCount);
  return { ...picks, [id]: next };
}

/** The ACTIVE kit: the auto-attack plus every picked ability whose milestone is reached at the current
 *  MNA. Picks below the threshold are banked but DORMANT (ADR 0020). */
export function activeKit(spec: ClassSpec, picks: Picks, mna: number): AbilityEntry[] {
  const out = spec.abilities.filter((a) => a.tier === "auto");
  for (const slot of choiceSlots(spec)) {
    if (!reached(slot.milestone, mna)) continue;
    for (const name of pickedAt(picks, slot.id)) {
      const a = slot.options.find((o) => o.name === name);
      if (a) out.push(a);
    }
  }
  return out;
}

/** True when every reachable slot has its required number of picks made (a UI completeness hint). */
export function fullyPicked(spec: ClassSpec, picks: Picks, mna: number): boolean {
  return choiceSlots(spec).filter((s) => reached(s.milestone, mna)).every((s) => pickedAt(picks, s.id).length === s.pickCount);
}
