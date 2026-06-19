// Art lookup tables + paper-doll rig (ADR 0004). Real art is sliced from Dara's reference
// sheets via app/tools/slice-art.py; anything without art falls back to an emoji glyph, so
// new content degrades gracefully.

// Weapon archetype -> sprite filename stem (assets/items/{stem}-{att}-{rarity}.png).
export const WEAP_IMG: Record<string, string> = {
  "Sword & Shield": "sns",
  "Dual Swords": "dual",
  "Staff": "staff",
  "Spellblade": "spell",
};

// Weapon archetype -> weaponless-body filename slug (assets/bodies/{att}-{slug}.png). Covers all
// nine REQUIEM archetypes; the body shown is the hero's CURRENT class (attunement × archetype),
// so equipping a foreign-attunement weapon swaps the figure to match.
export const ARCH_SLUG: Record<string, string> = {
  "Sword & Shield": "sword-shield",
  "Dual Swords": "dual-swords",
  "Two-Handed Sword": "two-handed",
  "Hammer": "hammer",
  "Dual Daggers": "daggers",
  "Dual Pistols": "pistols",
  "Rifle": "rifle",
  "Staff": "staff",
  "Spellblade": "spellblade",
};

// Enemy keys that have real sliced art (the 5 Greenvale bandits). Others use their emoji.
export const ENEMY_IMG: Record<string, number> = {
  bandit: 1, cutpurse: 1, marauder: 1, archer: 1, brute: 1,
};

// PAPER-DOLL RIG: a character renders as a STACK of aligned layers in one box; equipping an
// item swaps a layer. Per Dara's directive the weapon defines the class, so it's drawn BIG and
// dominant — keyed by ARCHETYPE (the body's pose, shared across attunements). Position (x,y) is
// normalized on the doll box, scale is a fraction of box width (>1 = oversized/hero-sized), rot
// is clockwise degrees. BODY_LAYER/ARMOR_LAYER are art-gated. See docs/art/rig-spec.md.
export interface WeaponXform { x: number; y: number; scale: number; rot: number; }
export const DEFAULT_WEAPON: WeaponXform = { x: 0.5, y: 0.56, scale: 1.15, rot: -14 };

export const RIG: { weapon: Record<string, WeaponXform> } = {
  weapon: {
    "Sword & Shield": { x: 0.48, y: 0.56, scale: 1.12, rot: 18 },
    "Dual Swords": { x: 0.52, y: 0.60, scale: 1.20, rot: -12 },
    "Staff": { x: 0.63, y: 0.52, scale: 1.28, rot: -18 },
    "Spellblade": { x: 0.50, y: 0.56, scale: 1.28, rot: -14 },
  },
};

// weaponless body by class id -> "bodies/{id}.png" (drop in when produced)
export const BODY_LAYER: Record<string, string> = {};
// armor over-body by class id -> { rarity: art } (later)
export const ARMOR_LAYER: Record<string, Record<string, string>> = {};
