// REQUIEM Stat System V3 — the 20 secondary stats (Dara's canon: 4 per primary, 2 offensive / 2
// defensive). Single source of truth for their order, labels, descriptions, roll magnitudes, and
// which ones are WIRED into combat today vs. pending the skill-tree/ability pass. The affix pool
// (rollable on weapons + armor) is derived straight from this table, so the loot pool and the
// character-sheet substat list can never drift apart.

import type { AffixDef, SubKey } from "../types";
import { ri } from "../core/rng";

export interface SubDef {
  key: SubKey;
  label: string;
  group: "STR" | "AGI" | "MGC" | "SPD" | "DEF";
  off: boolean;               // offensive (vs defensive) — 2 of each per primary
  wired: boolean;             // affects combat now; false = display-only until abilities/skill trees land
  roll: (r: number) => number; // % magnitude by rarity index (0..5)
  desc: string;
}

// Two magnitude profiles: always-on % values can run a bit higher; proc/chance % stay lower (a chance
// to fully block/negate/etc. is worth more per point). Both scale with rarity.
const mag = (r: number): number => ri(3 + r, 6 + r * 2);          // r0: 3–6 … r5: 8–16
const proc = (r: number): number => ri(1 + Math.floor(r / 2), 3 + r); // r0: 1–3 … r5: 5–8

export const SUBSTATS: SubDef[] = [
  // STR
  { key: "Arp", label: "Armor Penetration", group: "STR", off: true,  wired: true,  roll: mag,  desc: "Ignore a percentage of the enemy's armor." },
  { key: "Pry", label: "Parry",             group: "STR", off: false, wired: true,  roll: proc, desc: "Chance to completely block a physical attack." },
  { key: "Exe", label: "Execute",           group: "STR", off: true,  wired: true,  roll: mag,  desc: "Bonus damage to enemies under 20% HP." },
  { key: "Lfs", label: "Life Steal",        group: "STR", off: false, wired: true,  roll: mag,  desc: "Recover a percentage of damage dealt as HP." },
  // AGI
  { key: "Crt", label: "Crit Chance",       group: "AGI", off: true,  wired: true,  roll: mag,  desc: "Chance to land a critical hit." },
  { key: "Eva", label: "Evasion",           group: "AGI", off: false, wired: true,  roll: proc, desc: "Chance to halve incoming physical or ability damage." },
  { key: "Acc", label: "Accuracy",          group: "AGI", off: true,  wired: false, roll: mag,  desc: "Chance to land debuffs." },
  { key: "Cch", label: "Combo Chance",      group: "AGI", off: false, wired: false, roll: proc, desc: "Chance to attack twice." },
  // MGC
  { key: "Abp", label: "Ability Power",     group: "MGC", off: true,  wired: true,  roll: mag,  desc: "Increases the output of all abilities." },
  { key: "Hld", label: "Healing Done",      group: "MGC", off: true,  wired: true,  roll: mag,  desc: "Increases the healing you do." },
  { key: "Buf", label: "Buff Potency",      group: "MGC", off: false, wired: false, roll: mag,  desc: "Makes your positive effects stronger." },
  { key: "Vei", label: "Veil",              group: "MGC", off: false, wired: true,  roll: proc, desc: "Chance to completely negate an ability attack." },
  // SPD
  { key: "Abg", label: "Attack Bar Gain",   group: "SPD", off: true,  wired: false, roll: mag,  desc: "Fills your attack bar faster." },
  { key: "Cdr", label: "Cooldown Recovery", group: "SPD", off: false, wired: false, roll: proc, desc: "Chance to recover 1 turn of all cooldowns per turn." },
  { key: "Acr", label: "Action Refund",     group: "SPD", off: true,  wired: false, roll: proc, desc: "Recover part of your attack bar after acting." },
  { key: "Chc", label: "Chase Chance",      group: "SPD", off: false, wired: false, roll: proc, desc: "Chance to follow up an ally's attack." },
  // DEF
  { key: "Drd", label: "Damage Reduction",  group: "DEF", off: false, wired: true,  roll: mag,  desc: "Reduces all incoming damage." },
  { key: "Grv", label: "Gravity",           group: "DEF", off: true,  wired: false, roll: proc, desc: "Chance for attacks to push back the enemy's attack bar." },
  { key: "Res", label: "Resistance",        group: "DEF", off: false, wired: false, roll: proc, desc: "Chance to resist enemy debuffs." },
  { key: "Crs", label: "Crush",             group: "DEF", off: true,  wired: true,  roll: proc, desc: "Chance for an attack to ignore enemy defense." },
];

export const SUB_BY_KEY: Record<SubKey, SubDef> =
  SUBSTATS.reduce((o, d) => { o[d.key] = d; return o; }, {} as Record<SubKey, SubDef>);

// The affix pool: every drop's random affixes roll from these 20 (rarity sets the COUNT, not which).
export const AFFIXES: AffixDef[] = SUBSTATS.map((d) => ({
  key: d.key,
  stat: d.key,
  roll: d.roll,
  label: (n: number) => `+${n}% ${d.label}`,
}));
