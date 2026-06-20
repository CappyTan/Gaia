import type { AffixDef } from "../types";
import { ri } from "../core/rng";

// SOL named-item drop tables (from Dara's four loot charts). index 0..5 = common..artifact.
// One representative name per rung per weapon archetype.
export const ITEM_NAMES: Record<string, string[]> = {
  "Sword & Shield": ["Dawnwatch Guard", "Verdant Protector", "Skyward Bastion", "Solar Flare", "Solaris Majesty", "Eternal Radiance"],
  "Dual Swords": ["Militia Blades", "Verdant Scimitars", "Celestial Wards", "Solar Flare Blades", "Solaris Edge", "Starfall Daggers"],
  "Staff": ["Sunward Staff", "Verdant Growth Staff", "Celestial Focus", "Voidlight Staff", "Dawnbreaker", "Eternal Sol"],
  "Spellblade": ["Soldier's Spellblade", "Verdant Spellblade", "Celestial Spellblade", "Voidlight Spellblade", "Dawnbreaker Spellblade", "Eternal Sol Spellblade"],
};

// Generic, attunement-neutral names. Each armor-family slot is named per-attunement at roll time
// (ATT_ADJ + the slot's noun ladder, e.g. "Wildgrown Cuirass", "Rimewrought Greaves"); trinkets
// stay attunement-agnostic.
export const ARMOR_NOUN = ["Garb", "Mail", "Plate", "Cuirass", "Regalia", "Aegis"];        // chest
export const HELM_NOUN = ["Cap", "Hood", "Helm", "Visor", "Crown", "Halo"];               // helmet
export const GLOVE_NOUN = ["Wraps", "Gloves", "Gauntlets", "Grips", "Handguards", "Talons"]; // gloves
export const BOOT_NOUN = ["Sandals", "Boots", "Greaves", "Treads", "Striders", "Pathmakers"]; // boots
// Noun ladder per armor-family slot — picks the right name set for the slot.
export const ARMOR_SLOT_NOUNS: Record<string, string[]> = {
  helmet: HELM_NOUN, armor: ARMOR_NOUN, gloves: GLOVE_NOUN, boots: BOOT_NOUN,
};
export const TRINKET_NAMES = ["Brass Charm", "Jade Talisman", "Runed Band", "Warded Sigil", "Sovereign Crown", "Origin Relic"];

// Non-SOL weapon naming (SOL uses Dara's named loot charts above). A weapon's name is built
// from its Attunement's rarity-adjective + the archetype noun, e.g. NOX rare S&S = "Rimewrought
// Bulwark". Tables fill out per attunement as Dara's loot charts arrive.
import type { Attunement } from "../types";
export const ARCH_NOUN: Record<string, string> = {
  "Sword & Shield": "Bulwark", "Dual Swords": "Fangs", "Two-Handed Sword": "Greatblade",
  "Hammer": "Crusher", "Dual Daggers": "Shivs", "Dual Pistols": "Irons", "Rifle": "Longarm",
  "Staff": "Scepter", "Spellblade": "Runeblade",
};
export const ATT_ADJ: Partial<Record<Attunement, string[]>> = {
  SOL: ["Burnished", "Sunlit", "Radiant", "Solar", "Solaris", "Eternal-Sun"],
  NOX: ["Chilled", "Frostbitten", "Rimewrought", "Glacial", "Permafrost", "Absolute-Zero"],
  ANIMA: ["Verdant", "Thornclad", "Bloomforged", "Wildgrown", "Primeval", "World-Tree"],
  QUANTA: ["Flickering", "Phased", "Probable", "Entangled", "Quantum", "Singular"],
  UMBRAXIS: ["Dim", "Shadowed", "Umbral", "Void-Touched", "Gravebound", "Event-Horizon"],
};

// Affix pool: rolled onto items.
export const AFFIXES: AffixDef[] = [
  { key: "atk", label: (n) => `+${n}% ATK`, roll: (r) => ri(6 + r * 2, 12 + r * 4), stat: "atkPct" },
  { key: "crit", label: (n) => `+${n}% Crit`, roll: (r) => ri(4 + r, 8 + r * 2), stat: "critPct" },
  { key: "spd", label: (n) => `+${n} SPD`, roll: (r) => ri(1, 2 + r), stat: "spd" },
  { key: "hp", label: (n) => `+${n} HP`, roll: (r) => ri(8 + r * 4, 16 + r * 8), stat: "hp" },
  { key: "sol", label: (n) => `+${n}% Power dmg`, roll: (r) => ri(6 + r * 2, 12 + r * 4), stat: "solPct" },
  { key: "armor", label: (n) => `+${n} Armor`, roll: (r) => ri(1, 2 + r), stat: "armor" },
  { key: "leech", label: (n) => `${n}% Lifesteal`, roll: (r) => ri(3 + r, 6 + r * 2), stat: "leech" },
  { key: "mp", label: (n) => `+${n} MP`, roll: (r) => ri(4 + r * 2, 8 + r * 3), stat: "mp" },
];

// Elite-only enemy affixes (mirror the loot engine). Applied to a live enemy on spawn.
import type { Enemy } from "../types";
export interface EliteAffix {
  key: string;
  apply: (u: Enemy) => void;
}
export const ELITE_AFFIXES: EliteAffix[] = [
  { key: "Frenzied", apply: (u) => { u.spd = Math.round(u.spd * 1.4); } },
  { key: "Ironhide", apply: (u) => { u.armor += 5; } },
  { key: "Vampiric", apply: (u) => { u.leech = 20; } },
  { key: "Scorched", apply: (u) => { u.bonusBurn = true; } },
  { key: "Hulking", apply: (u) => { u.maxhp = Math.round(u.maxhp * 1.45); } },
];
