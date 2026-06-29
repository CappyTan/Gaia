// Status-effect catalog (ADR 0016) — the single registry of buff/debuff DEFINITIONS, organized by the
// 5 mechanic layers × 6 buckets (Neutral + the 5 attunement suites). The unified model that supersedes
// the loose StatusMap + rigid Skill.buff: combat/battle apply these as structured StatusInstances.
//
// This is the DEPLOY-FIRST tranche (status-effects.md): the 5 differentiated signature DoTs (Burn /
// Stasis / Infestation / Drain, + QUANTA's no-DoT Doom), the Neutral buff/debuff set, and core control
// (Stun / Blind / Chill→Frozen / Slow / Haste). The rest of the catalog lands as the class-engine pass
// needs it. Engine keywords are preserved where the engine already ships an effect (burn/decay/poison/
// regen/stun/blind/atkup/guard/wardArmor) to keep the StatusMap→instance migration clean. Magnitudes
// are a first pass — balance-sim owns the final numbers.

import type { StatusDef } from "../types";

export const STATUS: Record<string, StatusDef> = {
  // ── Neutral (class-agnostic) — stat & action mods every kit can use ──
  atkup: { id: "atkup", name: "Attack Up", kind: "buff", layer: "stat", bucket: "neutral", turns: 3, magnitude: 50, stacking: "refresh", apply: "on-hit", dispellable: true, desc: "Raises the bearer's attack." },
  atkdown: { id: "atkdown", name: "Attack Down", kind: "debuff", layer: "stat", bucket: "neutral", turns: 3, magnitude: 25, stacking: "refresh", apply: "resistible", cleansable: true, desc: "Lowers the target's attack." },
  defup: { id: "defup", name: "Defense Up", kind: "buff", layer: "stat", bucket: "neutral", turns: 3, magnitude: 50, stacking: "refresh", apply: "on-hit", dispellable: true, desc: "Raises the bearer's mitigation." },
  defdown: { id: "defdown", name: "Defense Down", kind: "debuff", layer: "stat", bucket: "neutral", turns: 3, magnitude: 25, stacking: "refresh", apply: "resistible", cleansable: true, desc: "Lowers the target's mitigation." },
  guard: { id: "guard", name: "Guard", kind: "buff", layer: "stat", bucket: "neutral", turns: 1, magnitude: 50, stacking: "unique", apply: "on-hit", desc: "A braced stance: halves the next incoming hit." },
  barrier: { id: "barrier", name: "Barrier", kind: "buff", layer: "stat", bucket: "neutral", turns: 3, magnitude: 0, stacking: "refresh", apply: "on-hit", dispellable: true, desc: "A flat absorbing ward over the bearer (engine: wardArmor)." },

  // ── Neutral action-economy (ATB/turns) ──
  stun: { id: "stun", name: "Stun", kind: "debuff", layer: "action", bucket: "neutral", turns: 1, stacking: "unique", apply: "resistible", cleansable: true, desc: "The target loses its turn. Hard CC — grants a brief re-application immunity." },
  slow: { id: "slow", name: "Slow", kind: "debuff", layer: "action", bucket: "neutral", turns: 2, magnitude: 30, stacking: "refresh", apply: "resistible", cleansable: true, desc: "Drags the target's ATB fill." },
  haste: { id: "haste", name: "Haste", kind: "buff", layer: "action", bucket: "neutral", turns: 2, magnitude: 30, stacking: "refresh", apply: "on-hit", dispellable: true, desc: "Speeds the bearer's ATB fill." },

  // ── SOL — fire/light ──
  burn: { id: "burn", name: "Burn", kind: "debuff", layer: "status", bucket: "SOL", turns: 2, magnitude: 6, maxStacks: 5, stacking: "stack-intensity", apply: "on-hit", cleansable: true, desc: "SOL signature DoT — combustion that ticks each turn; detonatable and can spread." },
  blind: { id: "blind", name: "Blind", kind: "debuff", layer: "status", bucket: "SOL", turns: 3, magnitude: 40, stacking: "refresh", apply: "resistible", cleansable: true, desc: "The target's attacks have a chance to miss." },

  // ── NOX — cold/order (engine keyword for Stasis stays `decay`) ──
  decay: { id: "decay", name: "Stasis", kind: "debuff", layer: "status", bucket: "NOX", turns: 2, magnitude: 6, maxStacks: 5, stacking: "stack-intensity", apply: "on-hit", cleansable: true, desc: "NOX signature DoT — winds the target's vitality toward zero (cold cessation, not rot); sets up Shatter." },
  chill: { id: "chill", name: "Chill", kind: "debuff", layer: "action", bucket: "NOX", turns: 2, magnitude: 25, maxStacks: 3, stacking: "stack-intensity", apply: "resistible", cleansable: true, promotesTo: "frozen", desc: "Drags ATB fill; at max stacks the target Freezes." },
  frozen: { id: "frozen", name: "Frozen", kind: "debuff", layer: "action", bucket: "NOX", turns: 1, stacking: "unique", apply: "resistible", cleansable: true, desc: "The target cannot act. Hard CC — grants a brief re-application immunity; primes Shatter." },

  // ── ANIMA — life/nature (engine keyword stays `poison`) ──
  poison: { id: "poison", name: "Infestation", kind: "debuff", layer: "status", bucket: "ANIMA", turns: 3, magnitude: 5, maxStacks: 5, stacking: "stack-intensity", apply: "on-hit", cleansable: true, desc: "ANIMA signature DoT — a living contagion that stacks and spreads to a new host on the bearer's death." },
  regen: { id: "regen", name: "Regen", kind: "buff", layer: "status", bucket: "ANIMA", turns: 3, magnitude: 6, stacking: "refresh", apply: "on-hit", dispellable: true, desc: "ANIMA HoT — restores HP each turn (the signature DoT's mirror)." },

  // ── UMBRAXIS — gravity/void ──
  drain: { id: "drain", name: "Drain", kind: "debuff", layer: "status", bucket: "UMBRAXIS", turns: 2, magnitude: 6, maxStacks: 5, stacking: "stack-intensity", apply: "on-hit", needsSource: true, cleansable: true, desc: "UMBRAXIS signature DoT — ticked HP transfers from the target to the caster (needs source)." },

  // ── QUANTA — probability/time (no DoT — a delayed, determined hit) ──
  doom: { id: "doom", name: "Doom", kind: "debuff", layer: "status", bucket: "QUANTA", turns: 2, magnitude: 0, stacking: "unique", apply: "resistible", cleansable: false, desc: "QUANTA — a delayed, determined detonation: when the timer expires the hit lands. Un-cleansable." },
};

/** All catalog effect ids, catalog order. */
export const STATUS_KEYS: string[] = Object.keys(STATUS);

/** Look up a status definition by id (undefined for an unknown key). */
export const statusDef = (id: string): StatusDef | undefined => STATUS[id];
