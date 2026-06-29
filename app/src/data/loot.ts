// LOOT DROP TABLES — the tunable rarity curve, kept as PURE DATA so the loot economy is easy to see
// and tune in one place. `systems/loot.ts` is the only consumer. Rarity index:
//   0 common · 1 uncommon · 2 rare · 3 epic · 4 legendary · 5 artifact.
//
// DESIGN (v0.101 retune — "too much high-rarity loot early"): the PLAYABLE arc is ~L1–10, so the
// curve is STEEP. Commons/uncommons dominate the early game, a RARE is a genuine treat, and epics+
// are a deep-level (L15+) reward — they should NOT show up in Greenvale. Tune the curve here.

import type { Slot } from "../types";

export interface LootBand { maxLvl: number; floor: number; ceil: number; }

// The FIRST band whose `maxLvl` ≥ the drop's level applies. `floor` is the typical rarity; `ceil` is
// the rare "lucky" spike (how often you actually reach it is set by SPIKE_STEP). Must stay monotonic.
export const LOOT_BANDS: LootBand[] = [
  { maxLvl: 4,   floor: 0, ceil: 0 }, // L1–4   : commons only
  { maxLvl: 9,   floor: 0, ceil: 1 }, // L5–9   : common / uncommon (no rares yet)
  { maxLvl: 14,  floor: 0, ceil: 2 }, // L10–14 : + a lucky RARE (the late built-game treat)
  { maxLvl: 24,  floor: 1, ceil: 3 }, // L15–24 : uncommon..epic (epic is the spike)
  { maxLvl: 34,  floor: 2, ceil: 4 }, // L25–34 : rare..legendary
  { maxLvl: 999, floor: 2, ceil: 5 }, // L35+   : + artifacts
];

// Lucky-spike falloff: from the band's floor, each rung up needs another SPIKE_STEP success, so
// P(floor + n) = SPIKE_STEP^n. LOWER = high rarities much rarer. (Was 0.4 — far too generous; a band
// of {0,2} used to drop ~10% rare. At 0.22 it's ~5%, and reaching a +3 spike is ~1%.)
export const SPIKE_STEP = 0.22;

export interface RarityMod { floor?: number; ceil?: number; floorMin?: number; }

// Additive rarity bumps applied to the level band BEFORE the spike roll, by loot SOURCE. Deliberately
// MODEST so an early boss/chest is a notch better — not a guaranteed epic. `floor`/`ceil` add to the
// band; `floorMin` clamps the floor up to a minimum (the source's guaranteed tier).
export const DROP_MODS: Record<string, RarityMod> = {
  elite: { ceil: 1 },                       // affixed normal: a slightly better ceiling
  boss:  { floor: 1, ceil: 1, floorMin: 1 }, // zone/pack boss: a notch up, never below uncommon
  rare:  { floor: 1, ceil: 2, floorMin: 2 }, // ultra-rare treasure monster: genuinely better (rare+)
  chest: { ceil: 1 },                       // a chest/merchant find is a treat: one extra ceiling rung
};

// Slot weighting for drops/loot: weapon ×2, each armor-family slot + trinket once.
export const DROP_SLOTS: Slot[] = ["weapon", "weapon", "helmet", "armor", "gloves", "boots", "trinket"];

// WEAPON MNA ROLL by rarity (ADR 0015 — weapons always carry +MNA; it sets the class). Indexed by
// rarity 0..5 (common→artifact / White→Red): the inclusive [min,max] MNA the weapon rolls in its own
// Attunement, EACH VALUE EQUALLY WEIGHTED (uniform). Rarity owns this roll — no ilvl term (ADR 0015's
// rarity-owns-affixes/quality split). Starting tuning points (Dara); magnitudes are a later balance pass.
export const WEAPON_MNA_ROLL: ReadonlyArray<readonly [number, number]> = [
  [0, 10],  // common    · White
  [5, 20],  // uncommon  · Green
  [10, 30], // rare      · Blue
  [15, 40], // epic      · Purple
  [20, 45], // legendary · Orange
  [25, 50], // artifact  · Red
];

// The rarity LEVEL for non-combat loot (chests scale with zone depth + how deep into the zone you are;
// the merchant stocks slightly ahead of the current zone). Kept here so the WHOLE curve — combat and
// non-combat — tunes from one file. (ilvl, the stat MAGNITUDE, is separate and lives at the call site.)
export const CHEST_LEVEL = (zoneIx: number, progress: number): number => 3 + zoneIx * 7 + Math.round(progress * 4);
export const MERCHANT_LEVEL = (zoneIx: number): number => 5 + zoneIx * 7;
