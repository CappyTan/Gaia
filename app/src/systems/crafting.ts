// Crafting engine — PURE, no DOM (the layering rule): material stacks, battle-drop rolls, gathering
// yields, recipe math, and the consumable effects, over the defs in data/materials + data/consumables.
// RNG is injectable (seeded for tests); the controllers own the overlays, the Aether fee, and when to
// call these. State is plain {id → count} records so it serializes straight into the save (optional
// degrade-never-throw fields, like quests — ADR 0007 tolerance).

import type { Rng } from "../core/rng";
import { ENEMIES } from "../data/enemies";
import { ENEMY_MAT_FAMILY, FAMILY_MATS, GATHER_NODES, RARE_ESSENCE } from "../data/materials";
import type { ConsumableDef } from "../data/consumables";
import type { NodeKind } from "../data/zones";

/** A stackable id → count record (materials or consumables). */
export type Counts = Record<string, number>;

export const emptyCounts = (): Counts => ({});

/** Add n of a material/consumable to a stack (no-op for n ≤ 0). */
export function addCount(target: Counts, id: string, n = 1): void {
  if (n <= 0) return;
  target[id] = (target[id] ?? 0) + n;
}

/** Fold a whole gains record into a stack. */
export function addCounts(target: Counts, gains: Counts): void {
  for (const [id, n] of Object.entries(gains)) addCount(target, id, n);
}

// ── battle drops (crafting-schema §Acquisition: combat drops by foe family) ─────────────────────
// Each fallen foe sheds 0–2 materials from its family pool: a common part (55%), then EITHER a rare
// attunement essence trace (6% — Sol Ember/Nox Rime by the foe's power, Aether Dust otherwise) OR a
// second common part (15%). Unmapped foes (later zones) shed nothing yet.
export function rollBattleMaterials(keys: string[], rng: Rng = Math.random): Counts {
  const out: Counts = {};
  for (const key of keys) {
    const fam = ENEMY_MAT_FAMILY[key];
    if (!fam) continue;
    const pool = FAMILY_MATS[fam];
    if (rng() < 0.55) addCount(out, pool[Math.floor(rng() * pool.length)]);
    if (rng() < 0.06) addCount(out, RARE_ESSENCE[ENEMIES[key]?.att ?? ""] ?? "aether-dust");
    else if (rng() < 0.15) addCount(out, pool[Math.floor(rng() * pool.length)]);
  }
  return out;
}

// ── gathering (crafting-schema §Gathering nodes) ────────────────────────────────────────────────
/** One gather of a node: 1–2 of its base material + a rare-chance bonus. */
export function gatherNode(kind: NodeKind, rng: Rng = Math.random): Counts {
  const n = GATHER_NODES[kind];
  const out: Counts = {};
  addCount(out, n.base, 1 + (rng() < 0.5 ? 1 : 0));
  if (rng() < n.rareChance) addCount(out, n.rare);
  return out;
}

// ── recipes ─────────────────────────────────────────────────────────────────────────────────────
/** Does the stack cover every ingredient of the recipe? */
export function hasMaterials(mats: Counts, recipe: Record<string, number>): boolean {
  return Object.entries(recipe).every(([id, n]) => (mats[id] ?? 0) >= n);
}

/**
 * Craft one consumable: consume the recipe from `mats`, add one to `owned`. False (and untouched
 * stacks) if the materials don't cover it. The AETHER FEE is the controller's to charge — currency
 * lives on the run, not in this pure layer.
 */
export function craftConsumable(mats: Counts, owned: Counts, def: ConsumableDef): boolean {
  if (!hasMaterials(mats, def.recipe)) return false;
  for (const [id, n] of Object.entries(def.recipe)) {
    mats[id] -= n;
    if (mats[id] <= 0) delete mats[id];
  }
  addCount(owned, def.id);
  return true;
}

// ── consumable effects ──────────────────────────────────────────────────────────────────────────
/** The slice of a party member the heal effect needs (Member satisfies it). */
export interface Healable { name: string; alive: boolean; hp: number; maxhp: number; }

/**
 * The Health-Tonic effect: mend the MOST WOUNDED living ally (lowest hp/maxhp fraction) by pct of
 * their max HP. Null (nothing consumed) when no living ally is hurt — a full-health party can't
 * waste a tonic. Returns who was healed and by how much (for the controller's feedback line).
 */
export function healLowestAlly<T extends Healable>(party: T[], pct: number): { target: T; healed: number } | null {
  let worst: T | null = null;
  for (const m of party) {
    if (!m.alive || m.hp >= m.maxhp) continue;
    if (!worst || m.hp / m.maxhp < worst.hp / worst.maxhp) worst = m;
  }
  if (!worst) return null;
  const healed = Math.min(worst.maxhp - worst.hp, Math.max(1, Math.round(worst.maxhp * pct)));
  worst.hp += healed;
  return { target: worst, healed };
}
