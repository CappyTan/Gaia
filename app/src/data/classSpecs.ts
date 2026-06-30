// Re-encoded 52-slot class specs (ADR 0020) — the structured build input the band→number generator
// (systems/classGen) + the live kit system (systems/classKit) consume. The 45 numberless markdown design
// specs (docs/design/classes/*.md, the human design record) are transcribed into ClassSpec shape by the
// generator (app/tools/gen-class-specs.ts → classSpecs.generated.ts, committed, never hand-edited). This
// module is the public face over that generated data: the registry + lookups + the slice subset.
//
// The generator was validated to reproduce the original hand-encoded Heliomancer (SOL Staff) exactly
// across every structural field + the derived status — so the whole roster transcribes faithfully.

import type { ClassSpec } from "./classSpec";
import { GENERATED_SPECS } from "./classSpecs.generated";

/** Every re-encoded class (5 Attunements × 9 Weapon Archetypes = 45). */
export const SPECS: ClassSpec[] = GENERATED_SPECS;

/** Registry keyed by "Attunement:Archetype" (a Member's `att` × `cls`), like ULTIMATES / BASIC_ATTACK_ANIM. */
export const SPEC_BY_CLASS: Record<string, ClassSpec> =
  Object.fromEntries(SPECS.map((s) => [`${s.att}:${s.archetype}`, s]));

/** The 52-slot spec for a class (Attunement × Archetype), or undefined if it isn't re-encoded. */
export const specFor = (att: string, archetype: string): ClassSpec | undefined => SPEC_BY_CLASS[`${att}:${archetype}`];

/** SOL × Staff — the first class encoded + the generator's validation ground truth; the picker's preview
 *  default and the slice's anchor. (Sourced from the generated data — single source of truth.) */
export const HELIOMANCER: ClassSpec = specFor("SOL", "Staff")!;

/** The original vertical-slice classes (ADR 0020 §4 — one per Attunement, five distinct Archetypes:
 *  Staff · Rifle · Dual Daggers · Spellblade · Hammer) that proved the spec→combat pipeline before the
 *  full-roster rollout. Kept as a named subset for reference; the live system now covers all of SPECS. */
const SLICE_KEYS = ["SOL:Staff", "NOX:Rifle", "ANIMA:Dual Daggers", "QUANTA:Spellblade", "UMBRAXIS:Hammer"];
export const SLICE_SPECS: ClassSpec[] = SLICE_KEYS.map((k) => SPEC_BY_CLASS[k]).filter(Boolean);
