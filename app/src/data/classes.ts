import type { Attunement } from "../types";
import { specFor } from "./classSpecs";

// Class = Attunement × Weapon Archetype (REQUIEM). A hero's class is set by their equipped weapon's
// Attunement + Archetype. The class's DISPLAY NAME comes from its 52-slot design spec (data/classSpecs —
// the canonical source for all 45 classes). There is no separate ability-kit map any more: a hero's kit
// is the V3 choice-system kit they build from their picks (systems/classKit), gated by MNA (ADR 0020).
export const className = (att: Attunement, archetype: string): string =>
  specFor(att, archetype)?.name ?? `${att} ${archetype}`;
