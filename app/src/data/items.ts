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

// Generic names for the non-art-backed slots.
export const ARMOR_NAMES = ["Padded Vestments", "Sunsteel Mail", "Aegis Plate", "Radiant Cuirass", "Solaris Aegis", "Heart of Sol"];
export const TRINKET_NAMES = ["Brass Charm", "Sun Pendant", "Solar Sigil", "Eclipse Band", "Helios Crown", "Origin Relic"];

// Affix pool: rolled onto items.
export const AFFIXES: AffixDef[] = [
  { key: "atk", label: (n) => `+${n}% ATK`, roll: (r) => ri(6 + r * 2, 12 + r * 4), stat: "atkPct" },
  { key: "crit", label: (n) => `+${n}% Crit`, roll: (r) => ri(4 + r, 8 + r * 2), stat: "critPct" },
  { key: "spd", label: (n) => `+${n} SPD`, roll: (r) => ri(1, 2 + r), stat: "spd" },
  { key: "hp", label: (n) => `+${n} HP`, roll: (r) => ri(8 + r * 4, 16 + r * 8), stat: "hp" },
  { key: "sol", label: (n) => `+${n}% SOL dmg`, roll: (r) => ri(6 + r * 2, 12 + r * 4), stat: "solPct" },
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
  { key: "Hulking", apply: (u) => { u.maxhp = Math.round(u.maxhp * 1.6); } },
];
