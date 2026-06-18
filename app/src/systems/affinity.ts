import type { Attunement } from "../types";
import { RING, STRONG, WEAK } from "../data/attunements";

// Multiplier for `att` attacking `defAtt`. Each power beats the NEXT in the ring (+50%) and
// is weak to the PREV (-50%); same/unknown attunement is neutral (x1).
export function affinity(att: Attunement | null | undefined, defAtt: Attunement | null | undefined): number {
  if (!att || !defAtt || att === defAtt) return 1;
  const i = RING.indexOf(att), j = RING.indexOf(defAtt);
  if (i < 0 || j < 0) return 1;
  if ((i + 1) % 5 === j) return STRONG; // att beats the next in the ring
  if ((i + 4) % 5 === j) return WEAK; // att is weak to the prev
  return 1;
}
