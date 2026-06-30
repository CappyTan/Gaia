// Band→number generator for the 52-slot class specs (ADR 0020 §3) — pure. Turns a numberless
// AbilityEntry (data/classSpec) into engine numbers: tier→power, milestone→MNA gate, gen/cost bands→
// resource amounts (one-way: specials generate, signatures/ultimates spend, D3), cooldown band→turns.
// First-pass tables; per-Attunement/Archetype scaling tables + the balance-sim refine the magnitudes —
// the win is that tuning concentrates HERE, not across ~2,340 hand-numbers. No DOM, no RNG.

import type { AbilityEntry } from "../data/classSpec";

// Numberless bands → values (first pass; balance-sim owns the finals).
export const GEN_BAND: Record<string, number> = { none: 0, minor: 6, moderate: 12, major: 20 };
export const COST_BAND: Record<string, number> = { none: 0, low: 15, med: 30, high: 50 };
export const CD_BAND: Record<string, number> = { none: 0, short: 2, medium: 3, long: 4 };
// Tier → base ability power. Auto is the spammable baseline; signatures/ultimates escalate; passives
// deal no direct hit (power 0 — their effect is a continuous modifier applied elsewhere).
const TIER_POWER: Record<string, number> = { auto: 1.0, special: 1.3, signature: 1.9, ultimate: 3.0, passive: 0 };

/** A generated, numeric ability — the bridge from a spec entry toward the engine `Skill`. (Wiring these
 *  into data/skills + the kit map, the choice system, and the picker UI is the rest of the capstone.) */
export interface GeneratedAbility {
  name: string;
  mnaReq: number; // = milestone (the MNA gate)
  type: string;
  target: string;
  power: number; // from tier (refined by archetype scaling later)
  cooldown: number; // turns
  resourceGen: number; // own-Attunement resource generated (specials + auto)
  resourceCost: number; // own-Attunement resource spent (signatures + ultimates)
  ult: boolean;
  passive: boolean;
  lane?: string;
  status?: string;
  desc: string;
}

/** Turn one numberless AbilityEntry into engine numbers. One-way economy (D3) is enforced: a
 *  special/auto only GENERATES, a signature/ultimate only SPENDS. Pure. */
export function genAbility(e: AbilityEntry): GeneratedAbility {
  const generates = e.tier === "special" || e.tier === "auto";
  const spends = e.tier === "signature" || e.tier === "ultimate";
  return {
    name: e.name,
    mnaReq: e.milestone,
    type: e.type,
    target: e.target,
    power: TIER_POWER[e.tier] ?? 1,
    cooldown: CD_BAND[e.cooldown ?? "none"] ?? 0,
    resourceGen: generates ? GEN_BAND[e.gen ?? "none"] ?? 0 : 0,
    resourceCost: spends ? COST_BAND[e.cost ?? "none"] ?? 0 : 0,
    ult: e.tier === "ultimate",
    passive: e.tier === "passive",
    lane: e.lane,
    status: e.status,
    desc: e.effect,
  };
}

/** Generate every ability in a class spec. */
export function genClass(abilities: AbilityEntry[]): GeneratedAbility[] {
  return abilities.map(genAbility);
}
