// Art lookup tables + paper-doll rig (ADR 0004). Real art is sliced from Dara's reference
// sheets via app/tools/slice-art.py; anything without art falls back to an emoji glyph, so
// new content degrades gracefully.

// Weapon archetype -> sprite filename stem (assets/items/{stem}-{rarity}.png).
export const WEAP_IMG: Record<string, string> = {
  "Sword & Shield": "sns",
  "Dual Swords": "dual",
  "Staff": "staff",
  "Spellblade": "spell",
};

// Enemy keys that have real sliced art (the 5 Greenvale bandits). Others use their emoji.
export const ENEMY_IMG: Record<string, number> = {
  bandit: 1, cutpurse: 1, marauder: 1, archer: 1, brute: 1,
};

// PAPER-DOLL RIG: a character renders as a STACK of aligned layers in one box; equipping an
// item swaps a layer. Anchors are normalized (0..1) on the doll box; weapon scale is a
// fraction of box width. BODY_LAYER/ARMOR_LAYER are art-gated — empty until that art exists,
// then the SAME compositor draws them with zero code change. See docs/art/rig-spec.md.
export interface HandAnchor { x: number; y: number; }
export interface WeaponXform { scale: number; rot: number; }

export const RIG: { hand: Record<string, HandAnchor>; weapon: Record<string, WeaponXform> } = {
  hand: {
    dawnguard: { x: 0.34, y: 0.6 }, sunblade: { x: 0.42, y: 0.58 },
    lightkeeper: { x: 0.3, y: 0.5 }, dawnchaser: { x: 0.42, y: 0.58 },
  },
  weapon: {
    "Sword & Shield": { scale: 0.95, rot: -16 }, "Dual Swords": { scale: 0.95, rot: -20 },
    "Staff": { scale: 0.8, rot: -72 }, "Spellblade": { scale: 0.95, rot: -18 },
  },
};

// weaponless body by class id -> "bodies/{id}.png" (drop in when produced)
export const BODY_LAYER: Record<string, string> = {};
// armor over-body by class id -> { rarity: art } (later)
export const ARMOR_LAYER: Record<string, Record<string, string>> = {};
