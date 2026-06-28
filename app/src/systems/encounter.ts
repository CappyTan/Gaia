// PURE encounter composition — no DOM, no side effects, rng injectable. The decisions that
// determine WHAT the player fights (rare-spawn substitution, the depth/dungeon-driven champion-pack
// chance + curve, the Area-leaned weighted set pick) live here so the field controller AND the
// balance sim share ONE source of truth and can't drift. The controller wraps the result with the
// DOM/flow (Battle.begin, overlays); the sim feeds it the same params with its seeded rng.

import type { Rng } from "../core/rng";
import { clamp, pickR } from "../core/rng";
import type { EncounterBand } from "../data/zones";
import { RARE_ENCOUNTER_CHANCE } from "../data/enemies";

/** The realized shape of an encounter (pre-DOM): which enemy keys, the champion lead index, the
 *  depth to scale by, and whether it's an ultra-rare treasure-monster substitution. */
export interface Encounter {
  keys: string[];     // enemy keys to spawn (lead = index 0 when champIdx === 0)
  champIdx: number;   // index of the champion pack leader, or -1 for none
  depth: number;      // depth (0..1) to scale enemies by
  rare: boolean;      // true ⇒ this is a lone ultra-rare treasure monster (keys = [rareKey])
}

/** Inputs the controller/sim supply (all pure values — no controller `this`). */
export interface EncounterCtx {
  bands: EncounterBand[];   // the zone's encounter bands
  progress: number;         // p: 0..1 west→east through the zone
  inDungeon: boolean;       // in the zone's dungeon (hotter, climbs with floor)
  dungeonFloor: number;     // current dungeon floor (0 outside a dungeon)
  zoneIndex: number;        // zone index (Greenvale = 0 has no champion packs)
  rareKeys: string[];       // eligible ultra-rare keys for this zone (already filtered to exist)
  /** Area-lean favour table for the player's current Area (enemyKey → favour weight), or undefined
   *  for a plain uniform pick (non-Area-native zone / no lean). */
  fav?: Record<string, number>;
}

/** AREA-LEANED set choice (ADR 0009): pick a set from the depth-balanced band, weight-biased toward
 *  the Area the player stands in. weight = 1 baseline + the set's favour score, so a matching set is
 *  a few× likelier but every band set stays possible (variety + curve preserved — same band, pool). */
export function pickAreaSet(sets: string[][], fav: Record<string, number> | undefined, rng: Rng = Math.random): string[] {
  if (!fav) return pickR(rng, sets);
  let total = 0;
  const weights = sets.map((s) => { const w = 1 + s.reduce((n, k) => n + (fav[k] ?? 0), 0); total += w; return w; });
  let r = rng() * total;
  for (let i = 0; i < sets.length; i++) { r -= weights[i]; if (r <= 0) return sets[i]; }
  return sets[sets.length - 1];
}

/** Compose the next encounter. Probabilities/curves are copied verbatim from controllers/field.ts —
 *  this only RELOCATES the decision so the controller and sim share it. */
export function rollEncounter(ctx: EncounterCtx, rng: Rng = Math.random): Encounter {
  const p = ctx.progress;
  let band = ctx.bands[0];
  for (const e of ctx.bands) { if (p >= e.at) band = e; }
  // the dungeon runs ~1-2 levels hotter than the overworld; in a MULTI-FLOOR dungeon the threat also
  // CLIMBS with depth — each floor below B1 adds a step so the dens run hotter the lower you go.
  const floorBump = ctx.inDungeon ? ctx.dungeonFloor * 0.12 : 0;
  const depth = ctx.inDungeon ? clamp(p + 0.25 + floorBump, 0, 1) : p;
  // ULTRA-RARE: a small chance the encounter is instead a lone treasure monster — exceptional loot.
  if (ctx.rareKeys.length && rng() < RARE_ENCOUNTER_CHANCE) {
    return { keys: [pickR(rng, ctx.rareKeys)], champIdx: -1, depth, rare: true };
  }
  const set = pickAreaSet(band.sets, ctx.fav, rng).slice();
  // CHAMPION PACK: past the opening, an encounter can be led by a champion (lead = index 0) with 1-2
  // extra minions. More common deeper in / in the dungeon. None in the STARTER zone (index 0): a
  // fresh L1-4 party can't absorb a multi-affix pack leader on top of the elite rolls.
  let champIdx = -1;
  const champChance = (ctx.inDungeon ? 0.15 : 0.09) + p * 0.07;
  if (ctx.zoneIndex >= 1 && p > 0.12 && rng() < champChance) {
    champIdx = 0;
    const adds = set.slice(1); // a normal minion (not another champion), the champion is the threat
    if (set.length < 5) set.push(pickR(rng, adds.length ? adds : set));
  }
  return { keys: set, champIdx, depth, rare: false };
}
