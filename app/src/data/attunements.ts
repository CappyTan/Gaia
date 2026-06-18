import type { Attunement } from "../types";

// The affinity ring: each Attunement beats the NEXT and loses to the PREV.
//   SOL -> NOX -> ANIMA -> QUANTA -> UMBRAXIS -> SOL
// Working proposal; ordering + signature effects to confirm against Dara's REQUIEM lore.
export const RING: Attunement[] = ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"];

export interface AttInfo {
  color: string;
  sig: "burn" | "decay" | "poison" | "drain" | "none";
}

export const ATT: Record<Attunement, AttInfo> = {
  SOL: { color: "#f4b942", sig: "burn" }, // light/fire  -> Burn
  NOX: { color: "#7ad0c0", sig: "decay" }, // cold/decay  -> Decay (DoT)
  ANIMA: { color: "#7ad06b", sig: "poison" }, // life/nature -> Poison
  QUANTA: { color: "#b46bff", sig: "none" }, // probability -> crit/dodge swings (passive)
  UMBRAXIS: { color: "#9a9aa8", sig: "drain" }, // shadow/void -> Drain
};

export const STRONG = 1.5;
export const WEAK = 0.5;
