// REQUIEM Stat System V3 — pure ENEMY stat derivation (no DOM). Mirrors the member model: an enemy's
// combat block is DERIVED from V3 primaries (STR/AGI/VIT/SPD/DEF) that scale with LEVEL, not
// hand-authored per entry (ADR 0018 — folds in the bestiary level-seeding rebuild). "A level-N
// monster" = enemyPrimaries(role, N). Reuses the member substat/abp math (systems/stats) so enemies
// and heroes share one formula. RNG-free + side-effect-free; magnitudes are tuned via balance-sim.

import type { Attunement, EnemyRole, Prims, Subs } from "../types";
import { PRIM_KEYS, zeroSubs } from "../types";
import { abpFromGear, substatBaseline } from "./stats";

// ── Level→primary budget: total primary POINTS an enemy spends across its five stats at a level,
//    distributed by its role's weights (+ optional per-enemy lean). The single "how strong at level N"
//    curve — the level-seeding knob. Placeholder magnitudes; balance-sim owns the final values.
export const PRIM_BASE = 10; // points at level 1
export const PRIM_PER_LVL = 5; // added per level above 1
export const primBudget = (lvl: number): number => PRIM_BASE + PRIM_PER_LVL * Math.max(0, lvl - 1);

// ── Per-role primary SHAPE (relative weights, normalized to the budget). Sets what a role *is*:
//    skirmishers fast/light (AGI/SPD), walls slow tanks (DEF/VIT), casters run on VIT (the universal
//    fuel — ADR 0013, no magic stat), brutes heavy (STR/VIT). miniboss/boss are rounded + tanky; rare
//    is neutral and shaped by its per-enemy `lean` (metal-slime walls, gilded jackpots).
export const ROLE_WEIGHTS: Record<EnemyRole, Prims> = {
  skirmisher: { STR: 1.0, AGI: 3.0, VIT: 1.0, SPD: 3.0, DEF: 0.5 },
  bruiser: { STR: 3.0, AGI: 1.0, VIT: 1.5, SPD: 1.0, DEF: 1.0 },
  harrier: { STR: 1.0, AGI: 2.5, VIT: 1.0, SPD: 3.0, DEF: 0.5 },
  caster: { STR: 0.5, AGI: 1.0, VIT: 3.5, SPD: 1.0, DEF: 1.0 },
  wall: { STR: 1.0, AGI: 0.3, VIT: 2.5, SPD: 0.3, DEF: 3.5 },
  brute: { STR: 3.0, AGI: 0.5, VIT: 2.5, SPD: 0.5, DEF: 1.5 },
  miniboss: { STR: 2.5, AGI: 1.0, VIT: 3.0, SPD: 1.0, DEF: 2.0 },
  boss: { STR: 2.5, AGI: 1.0, VIT: 3.5, SPD: 1.2, DEF: 2.0 },
  rare: { STR: 1.0, AGI: 1.0, VIT: 1.0, SPD: 1.0, DEF: 1.0 },
};

// ── HP / ATK role multipliers — applied to the primary-derived base so durability/threat match the
//    role's fantasy. Bosses/minibosses are the sponges; skirmishers are glassy. These FOLD IN the old
//    per-tier HP treatment (boss/mini sponge, trash thin) — no special-case branch in makeEnemy.
export const ROLE_HP_MULT: Record<EnemyRole, number> = {
  skirmisher: 0.7, bruiser: 1.0, harrier: 0.85, caster: 0.8, wall: 1.4, brute: 1.2,
  miniboss: 6.0, boss: 9.0, rare: 1.0,
};
export const ROLE_ATK_MULT: Record<EnemyRole, number> = {
  skirmisher: 1.0, bruiser: 1.0, harrier: 1.05, caster: 0.9, wall: 0.8, brute: 1.15,
  miniboss: 2.0, boss: 2.4, rare: 0.8,
};

// ── Derived-stat coefficients (primary point → combat stat). Placeholders; tuned in balance-sim.
const HP_BASE = 16, HP_PER_VIT = 6;
const ATK_BASE = 4, ATK_PER_STR = 1.1;
const MAG_BASE = 3, MAG_PER_VIT = 0.9;
const ARMOR_PER_DEF = 0.6;
const SPD_BASE = 4, SPD_PER = 0.7;

/** A level-N enemy's V3 primaries: spend the level's budget across the role's weighted shape, scaled
 *  by an optional per-enemy `lean` (multiplies a stat's weight — a metal jackpot leans DEF hard, VIT
 *  near zero). `lvl` may be fractional (a depth lift); results round. Pure. */
export function enemyPrimaries(role: EnemyRole, lvl: number, lean?: Partial<Prims>): Prims {
  const w = ROLE_WEIGHTS[role];
  const leaned = {} as Prims;
  let sum = 0;
  for (const k of PRIM_KEYS) { leaned[k] = w[k] * (lean?.[k] ?? 1); sum += leaned[k]; }
  const budget = primBudget(lvl);
  const out = {} as Prims;
  for (const k of PRIM_KEYS) out[k] = sum > 0 ? Math.round((leaned[k] / sum) * budget) : 0;
  return out;
}

export interface EnemyStats {
  prim: Prims; sub: Subs; abp: number;
  maxhp: number; atk: number; mag: number; armor: number; spd: number; critPct: number;
}

/** Derive an enemy's full combat block from its V3 primaries (+ attunement, for the ability-power
 *  amplifier). Substats come from the SAME dual-source baseline members use — the enemy's primaries
 *  play the role a hero's gear does. Casters convert VIT→mag (ADR 0013 — VIT is the fuel, no magic
 *  stat); everyone else mag 0. Pure. */
export function enemyDerived(att: Attunement, role: EnemyRole, prim: Prims): EnemyStats {
  const sub = zeroSubs();
  substatBaseline(prim, sub);
  const abp = abpFromGear(att, prim);
  const maxhp = Math.round((HP_BASE + prim.VIT * HP_PER_VIT) * ROLE_HP_MULT[role]);
  const atk = Math.round((ATK_BASE + prim.STR * ATK_PER_STR) * ROLE_ATK_MULT[role]);
  const mag = role === "caster" ? Math.round(MAG_BASE + prim.VIT * MAG_PER_VIT) : 0;
  const armor = Math.round(prim.DEF * ARMOR_PER_DEF);
  const spd = Math.max(1, Math.round(SPD_BASE + prim.SPD * SPD_PER));
  const critPct = 5 + sub.Crt;
  return { prim, sub, abp, maxhp, atk, mag, armor, spd, critPct };
}

/** Convenience: primaries + derived block for a (role, level, lean) — what makeEnemy will call. */
export function enemyBlock(att: Attunement, role: EnemyRole, lvl: number, lean?: Partial<Prims>): EnemyStats {
  return enemyDerived(att, role, enemyPrimaries(role, lvl, lean));
}
