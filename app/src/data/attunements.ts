import type { Attunement } from "../types";

// The affinity ring: each Attunement beats the NEXT and loses to the PREV (ratified by Dara).
//   SOL -> NOX -> ANIMA -> QUANTA -> UMBRAXIS -> SOL
// Lore: Light breaks Preservation · Preservation freezes Evolution · Life out-adapts Calculation ·
// Probability collapses Singularity · Gravity collapses Light. Each power has 1 prey, 1 predator,
// 2 neutral, 1 mirror — so no attunement is ever universally best or invalid.
export const RING: Attunement[] = ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"];

export interface AttInfo {
  color: string;
  sig: "burn" | "decay" | "poison" | "drain" | "none";
}

export const ATT: Record<Attunement, AttInfo> = {
  SOL: { color: "#f4b942", sig: "burn" }, // light/fire  -> Burn
  NOX: { color: "#7ad0c0", sig: "decay" }, // cold/decay  -> Decay (DoT)
  ANIMA: { color: "#7ad06b", sig: "poison" }, // life/nature -> Poison
  QUANTA: { color: "#ef5350", sig: "none" }, // probability -> crit/dodge swings (passive); RED
  UMBRAXIS: { color: "#b46bff", sig: "drain" }, // shadow/void -> Drain; PURPLE
};

// Modest ±15% swing (Dara's tuning): ~30% total spread between attacking your prey vs your
// predator — big enough to reward matchup play, small enough that gear + skill matter MORE.
// (A single per-attack multiplier already captures both sides: when your prey hits you it's the
// attacker that's weak, so you take less.) Deliberately NOT the old ×1.5/×0.5, which made
// attunement dominate class/gear choices.
export const STRONG = 1.15;
export const WEAK = 0.85;
