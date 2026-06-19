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
  NOX: {
    "Sword & Shield": "Penumbral Bastion",
    "Dual Swords": "Rimewalker",
    "Staff": "Null Absolutionist",
    "Spellblade": "Lattice Executioner",
  },
};

export const className = (att: Attunement, archetype: string): string =>
  CLASS_NAMES[att]?.[archetype] ?? `${att} ${archetype}`;

// Ability kit per Class (Attunement × Weapon Archetype) — the skills a hero wields when
// equipped with that weapon. Equipping a weapon swaps the active kit (REQUIEM canon).
// Attunements without a kit fall back to the hero's innate kit (data-driven; fills out as
// more attunements are authored from REQUIEM).
export const KITS: Partial<Record<Attunement, Record<string, string[]>>> = {
  SOL: {
    "Sword & Shield": ["guard", "shieldBash", "taunt", "radiantSmite", "aegisDawn", "sunbreaker"],
    "Dual Swords": ["twinSlash", "flurry", "solarFlareB", "eclipse", "sunderCombo", "radiantTempest"],
    "Staff": ["sunbolt", "heal", "cleanse", "dawnsLight", "renewingDawn", "solarZenith"],
    "Spellblade": ["flameStrike", "empower", "sunfire", "blindingLight", "eclipseBrand", "supernova"],
  },
  NOX: {
    "Sword & Shield": ["noxImmutable", "noxChillBite", "noxGravityPull", "noxAbsoluteZero", "noxPenumbralCollapse"],
    "Dual Swords": ["noxFrostLace", "noxSingularityStep", "noxGlacialFlurry", "noxRimeEdge", "noxGreatStillness"],
    "Staff": ["noxVoidBolt", "noxPrimordialSilence", "noxHeatDrain", "noxHypothermia", "noxCosmicReset"],
    "Spellblade": ["noxLatticeSlash", "noxFrostSpike", "noxShatterShield", "noxBrittleBrand", "noxRunicRefrigeration"],
  },
};

/** The kit a hero wields for a given Attunement × Archetype, or null if none is authored yet. */
export const kitFor = (att: Attunement, archetype: string): string[] | null => KITS[att]?.[archetype] ?? null;
