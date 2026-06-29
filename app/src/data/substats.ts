// Stat System — the final 20 secondary stats (ADR 0014: Matter/Energy damage typing, dual-source,
// zero dead by design). 4 per primary (STR/AGI/VIT/SPD/DEF); off/def is now DESCRIPTIVE, not a quota.
// Single source of truth for their order, labels, descriptions, roll magnitudes, and which are WIRED
// into combat today vs. pending the ATB/status pass. The affix pool (rollable on weapons + armor) is
// derived straight from this table, so the loot pool and the character-sheet substat list can't drift.
//   Damage is typed Matter (struck/martial) vs Energy (projected/ability). Matter defense = armor +
//   Matter Reduction + Block (Matter-only); Energy defense = Energy Reduction. Penetration mirrors:
//   Matter Penetration cuts armor, Energy Penetration cuts Energy Reduction. Evasion is universal.

import type { AffixDef, SubKey } from "../types";
import { ri } from "../core/rng";

export interface SubDef {
  key: SubKey;
  label: string;
  group: "STR" | "AGI" | "VIT" | "SPD" | "DEF";
  off: boolean;               // offensive (vs defensive) — DESCRIPTIVE only (no 2/2 quota)
  wired: boolean;             // affects combat now; false = display-only until the ATB/status pass
  roll: (r: number) => number; // % magnitude by rarity index (0..5)
  desc: string;
}

// Two magnitude profiles: always-on % values can run a bit higher; proc/chance % stay lower (a chance
// to fully block/negate/etc. is worth more per point). Both scale with rarity.
const mag = (r: number): number => ri(3 + r, 6 + r * 2);          // r0: 3–6 … r5: 8–16
const proc = (r: number): number => ri(1 + Math.floor(r / 2), 3 + r); // r0: 1–3 … r5: 5–8

export const SUBSTATS: SubDef[] = [
  // STR — force / sustain
  { key: "Mpn", label: "Matter Penetration", group: "STR", off: true,  wired: true,  roll: mag,  desc: "Ignore a percentage of the enemy's armor (Matter attacks)." },
  { key: "Exe", label: "Execute",            group: "STR", off: true,  wired: true,  roll: mag,  desc: "Bonus damage to enemies under 20% HP." },
  { key: "Lfs", label: "Life Steal",         group: "STR", off: true,  wired: true,  roll: mag,  desc: "Recover a percentage of damage dealt as HP." },
  { key: "Cch", label: "Combo Chance",       group: "STR", off: true,  wired: false, roll: proc, desc: "Chance to attack twice." },
  // AGI — precision / crit / avoid
  { key: "Crt", label: "Crit Chance",        group: "AGI", off: true,  wired: true,  roll: mag,  desc: "Chance to land a critical hit." },
  { key: "Cmd", label: "Crit Damage",        group: "AGI", off: true,  wired: true,  roll: mag,  desc: "Increases the damage your critical hits deal." },
  { key: "Eva", label: "Evasion",            group: "AGI", off: false, wired: true,  roll: proc, desc: "Chance to halve any incoming hit." },
  { key: "Acc", label: "Accuracy",           group: "AGI", off: true,  wired: false, roll: mag,  desc: "Chance to land debuffs." },
  // VIT — fuel / life / ability
  { key: "Abp", label: "Ability Power",      group: "VIT", off: true,  wired: true,  roll: mag,  desc: "Increases the output of all abilities." },
  { key: "Hld", label: "Healing Done",       group: "VIT", off: true,  wired: true,  roll: mag,  desc: "Increases the healing you do." },
  { key: "Epn", label: "Energy Penetration", group: "VIT", off: true,  wired: true,  roll: mag,  desc: "Cut through a percentage of the enemy's Energy Reduction." },
  { key: "Buf", label: "Buff Potency",       group: "VIT", off: false, wired: false, roll: mag,  desc: "Makes your positive effects stronger." },
  // SPD — tempo
  { key: "Abg", label: "Attack Bar Gain",   group: "SPD", off: true,  wired: false, roll: mag,  desc: "Fills your attack bar faster." },
  { key: "Acr", label: "Action Refund",     group: "SPD", off: true,  wired: false, roll: proc, desc: "Recover part of your attack bar after acting." },
  { key: "Cdr", label: "Cooldown Recovery", group: "SPD", off: false, wired: false, roll: proc, desc: "Chance to recover 1 turn of all cooldowns per turn." },
  { key: "Chc", label: "Chase Chance",      group: "SPD", off: false, wired: false, roll: proc, desc: "Chance to follow up an ally's attack." },
  // DEF — protection
  { key: "Mrd", label: "Matter Reduction",  group: "DEF", off: false, wired: true,  roll: mag,  desc: "Reduces incoming Matter (struck/martial) damage." },
  { key: "Erd", label: "Energy Reduction",  group: "DEF", off: false, wired: true,  roll: mag,  desc: "Reduces incoming Energy (ability) damage." },
  { key: "Blk", label: "Block",             group: "DEF", off: false, wired: true,  roll: proc, desc: "Chance to completely block a Matter attack." },
  { key: "Res", label: "Resistance",        group: "DEF", off: false, wired: false, roll: proc, desc: "Chance to resist enemy debuffs." },
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
