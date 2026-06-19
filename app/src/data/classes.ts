import type { Attunement } from "../types";

// Class = Attunement × Weapon Archetype (REQUIEM). A hero's class is set by their equipped
// weapon's Attunement + Archetype. POC names for the SOL archetypes (+ Dara's Starbreaker
// example for the Two-Handed Sword); fills out toward the full 45 as more art/kits land.
export const CLASS_NAMES: Partial<Record<Attunement, Record<string, string>>> = {
  SOL: {
    "Sword & Shield": "Dawnwarden",
    "Dual Swords": "Sunblade",
    "Staff": "Heliomancer",
    "Spellblade": "Starforge Knight",
    "Two-Handed Sword": "Starbreaker",
  },
};

export const className = (att: Attunement, archetype: string): string =>
  CLASS_NAMES[att]?.[archetype] ?? `${att} ${archetype}`;
