// Resource-economy config (ADR 0019) — the five party-shared per-Attunement Resource pools' tunable
// knobs. Deliberately data-driven so the experimental bits flip by editing here, not rewiring code
// (ADR 0019 "tunability"): `persist` toggles carry-across-fights; `personalities` collapses all pools to
// flat; each pool's personality (D2) + cap (D6) live in `pools`. Magnitudes are a first pass — the
// balance-sim + the 52-slot class gen/cost bands (the v3/classes capstone) own the final numbers.

import type { Attunement } from "../types";

export interface PoolConfig {
  cap: number; // D6 — per-pool cap, co-tuned with personality
  // At most ONE personality knob per pool (D2). Absent = "banks/conserves" (no passive change).
  decay?: number; // SOL "runs hot": bleed this much per upkeep when above `decayAbove`
  decayAbove?: number;
  regen?: number; // ANIMA "compounds": passive regen as a fraction of current fill per upkeep
  variance?: number; // QUANTA "gambles": ± swing fraction applied per upkeep
}

export const RESOURCE = {
  persist: true, // D1 — pools carry across fights; flip to false for reset-per-fight
  personalities: true, // D2 — per-pool rules on; flip to false to collapse every pool to flat
  spendCap: 60, // D8 — per-action spend cap (anti-degeneracy: no single ability dumps the whole pool)
  genAuto: 4, // auto-attack trickle (own attunement) — fallback when a class isn't re-encoded
  genSpecial: 12, // a generating (special/skill) action — the legacy flat gen (pre per-ability bands)
  ultSpend: 40, // flat spend for the legacy cutscene ultimates (Photon Vanguard); V3 ults carry their own cost
  // Per-pool personality (D2) + cap (D6). NOX banks (deep cap, no decay); SOL runs hot (bleeds if
  // hoarded); ANIMA compounds (passive regen); QUANTA gambles (variance); UMBRAXIS conserves (steady).
  pools: {
    SOL: { cap: 120, decayAbove: 60, decay: 8 },
    NOX: { cap: 160 },
    ANIMA: { cap: 120, regen: 0.05 },
    QUANTA: { cap: 120, variance: 0.2 },
    UMBRAXIS: { cap: 120 },
  } as Record<Attunement, PoolConfig>,
};
