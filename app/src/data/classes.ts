import type { Attunement } from "../types";
import { REQUIEM_KITS, REQUIEM_CLASS_NAMES } from "./requiem-kits";

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

// Fold in canon class names for all 45 (hand-authored CLASS_NAMES above win on overlap).
for (const att of Object.keys(REQUIEM_CLASS_NAMES) as Attunement[])
  CLASS_NAMES[att] = { ...(REQUIEM_CLASS_NAMES[att] || {}), ...(CLASS_NAMES[att] || {}) };

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

// Shared placeholder kit per attunement, used when no archetype-specific kit is authored yet
// (ANIMA / QUANTA / UMBRAXIS, and any SOL/NOX archetype beyond the four built out). Lets the
// player pick a hero of ANY attunement and still have a usable, themed ability tree.
export const KITS_GENERIC: Partial<Record<Attunement, string[]>> = {
  SOL: ["guard", "shieldBash", "sunfire", "radiantSmite", "supernova"],
  NOX: ["noxLatticeSlash", "noxFrostSpike", "noxShatterShield", "noxBrittleBrand", "noxRunicRefrigeration"],
  ANIMA: ["animaThorns", "animaMend", "animaWither", "animaBloom", "animaGenesis"],
  QUANTA: ["quantaFlux", "quantaHaste", "quantaCollapse", "quantaCascade", "quantaSingularity"],
  UMBRAXIS: ["umbraCrush", "umbraDrain", "umbraEntropy", "umbraWard", "umbraHorizon"],
};

// Fold in the canon-generated kits for the 37 non-hand-authored classes (hand-authored win).
for (const att of Object.keys(REQUIEM_KITS) as Attunement[])
  KITS[att] = { ...(REQUIEM_KITS[att] || {}), ...(KITS[att] || {}) };

/** The kit a hero wields for a given Attunement × Archetype: archetype-specific if authored,
 *  else the attunement's generic placeholder kit, else null. */
export const kitFor = (att: Attunement, archetype: string): string[] | null =>
  KITS[att]?.[archetype] ?? KITS_GENERIC[att] ?? null;
