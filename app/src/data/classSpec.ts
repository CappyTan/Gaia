// Structured 52-slot class-spec schema (ADR 0020 §3) — the GENERATOR'S INPUT. The 45 numberless design
// specs in docs/design/classes/*.md are re-encoded into this shape (a one-time conversion / the
// build-class skill emits it); the band→number generator (systems/classGen) then turns the numberless
// bands into engine numbers. The markdown stays the human design record; this JSON-shaped data is the
// build input. See the Class System Model (docs/design/classes/README.md).

import type { Attunement, SkillTarget, SkillType } from "../types";

/** Build-identity lane. Auto-attack + the neutral ultimate are unlaned. */
export type Lane = "A" | "B" | "C";
/** The five authored tiers (1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = 52). */
export type AbilityTier = "auto" | "special" | "signature" | "ultimate" | "passive";

/** Numberless resource/cooldown bands (the generator maps these to numbers via systems/classGen). */
export type GenBand = "none" | "minor" | "moderate" | "major";   // resource generated (specials + auto)
export type CostBand = "none" | "low" | "med" | "high";          // resource spent (signatures + ultimates)
export type CooldownBand = "none" | "short" | "medium" | "long";

/** One authored ability slot in a 52-slot class spec (numberless — the generator adds the numbers). */
export interface AbilityEntry {
  name: string;
  tier: AbilityTier;
  lane?: Lane; // auto + the neutral ultimate are unlaned
  milestone: number; // the MNA threshold it's chosen at (5,15,25… specials · 10,20,30… signatures · 100 ults)
  type: SkillType;
  target: SkillTarget;
  effect: string; // 1–2 sentence mechanical description (incl. any status it applies)
  status?: string; // catalog status id it applies (ADR 0016), if any
  gen?: GenBand; // resource GENERATED — specials + auto only (one-way: D3)
  cost?: CostBand; // resource SPENT — signatures + ultimates only
  cooldown?: CooldownBand;
}

/** A whole class's authored 52-slot spec. */
export interface ClassSpec {
  att: Attunement;
  archetype: string;
  name: string; // the class name (e.g. "Heliomancer")
  lanes?: { A: string; B: string; C: string }; // the three build-path names (from the spec's ### Lanes table)
  abilities: AbilityEntry[];
}
