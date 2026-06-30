// The live-combat bridge for the 52-slot class system (ADR 0020 capstone) — pure, no DOM. Turns a
// re-encoded ClassSpec into engine `Skill`s the battle command menu can use, and resolves a member's
// ACTIVE kit from their banked picks + MNA. This is the seam that replaces the static `kitFor` kit: all
// 45 classes are now re-encoded (data/classSpecs), so a hero on ANY class drives its kit from picks once
// the player has banked some; with no picks they fall back to the legacy `kitFor` kit (never stranded).
// Layering: systems → data + systems (never the reverse), so the generated skills are merged INTO the
// shared `SKILLS` registry here (a load-time augmentation, mirroring how data/classes folds in the
// REQUIEM kits) — data/skills stays pure.

import type { Skill, SkillTarget, SkillType, StatusMap } from "../types";
import type { AbilityEntry, ClassSpec } from "../data/classSpec";
import { SKILLS } from "../data/skills";
import { SPECS, specFor } from "../data/classSpecs";
import { genAbility, type GeneratedAbility } from "./classGen";
import { activeKit, type Picks } from "./choice";

// Default status duration (turns) for a generated ability that applies one. The numberless specs carry
// only the status id; the balance pass owns the real durations — 2 matches most hand-authored SOL skills.
const STATUS_TURNS = 2;

/** Stable, globally-unique SKILLS key for a generated ability. Names are unique across all class specs
 *  (Class System Model invariant #8); we preserve that uniqueness in the slug by keeping the chars that
 *  distinguish near-twins — whitespace → `_`, hyphens kept — so "Ember Spread" ≠ "Emberspread" and
 *  "Frame Lock" ≠ "Frame-Lock" don't collapse together. Only `_`/`-`/alphanumerics survive, so the key
 *  is safe to embed in an HTML onclick attribute (no spaces/quotes/apostrophes). The `v3:` prefix keeps
 *  it from ever colliding with a hand-authored key (e.g. the legacy `sunbolt`). A residual collision (a
 *  future name pair differing only in dropped punctuation) fails the classKit test gate, never silently. */
export const genSkillKey = (name: string): string => `v3:${name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_-]/g, "")}`;

/** GeneratedAbility (numbers) → engine `Skill`. Battle 2.0 gates by cooldown, not MP (mp: 0). The
 *  one-way resource fields ride along so the turn loop can credit gen / debit cost per ability. */
function toSkill(g: GeneratedAbility, att: ClassSpec["att"]): Skill {
  return {
    name: g.name,
    mp: 0,
    target: g.target as SkillTarget,
    att,
    mnaReq: g.mnaReq,
    ult: g.ult || undefined,
    type: g.type as SkillType,
    power: g.power,
    status: g.status ? ({ [g.status]: STATUS_TURNS } as StatusMap) : undefined,
    resourceGen: g.resourceGen,
    resourceCost: g.resourceCost,
    cd: g.cooldown || undefined,
    lane: g.lane,
    desc: g.desc,
  };
}

/** Every re-encoded ability as an engine `Skill`, keyed by `genSkillKey`. Covers all 52 slots (auto,
 *  specials, signatures, ultimates, passives) of every class in the roster, so any class a hero equips
 *  can drive its kit from picks. Passives are registered for completeness but never surface as battle
 *  commands (their continuous effects are a follow-up). */
export const GENERATED_SKILLS: Record<string, Skill> = (() => {
  const out: Record<string, Skill> = {};
  for (const spec of SPECS) for (const a of spec.abilities) out[genSkillKey(a.name)] = toSkill(genAbility(a), spec.att);
  return out;
})();

// Merge the generated skills into the shared registry so `SKILLS[key]` lookups (battle menu, progression,
// menus) resolve them. Additive (v3:* keys never overwrite the hand-authored keys); validate.ts only
// walks the static kits, so this is invisible to the integrity net.
Object.assign(SKILLS, GENERATED_SKILLS);

/** Does this class (Attunement × Archetype) have a re-encoded 52-slot spec (i.e. use the choice system)? */
export const hasSpec = (att: string, cls: string): boolean => !!specFor(att, cls);

/** The COMMANDABLE active-kit skill keys for a member: the auto-attack and passives are dropped (auto is
 *  the basic Attack command; passives aren't commands), leaving the picked-and-reached specials,
 *  signatures, and ultimates — in `SKILLS`-key form for the battle menu. Null when the class has no spec
 *  (caller falls back to the legacy kit). */
export function activeKitKeys(att: string, cls: string, picks: Picks, mna: number): string[] | null {
  const spec = specFor(att, cls);
  if (!spec) return null;
  return activeKit(spec, picks, mna)
    .filter((a) => a.tier !== "auto" && a.tier !== "passive")
    .map((a) => genSkillKey(a.name));
}

/** The hero's ACTIVE passive picks (tier "passive", picked + MNA-reached) — the continuous modifiers
 *  (systems/passives) recalc folds into the effective stats. Empty when the class has no spec. */
export function activePassives(att: string, cls: string, picks: Picks, mna: number): AbilityEntry[] {
  const spec = specFor(att, cls);
  if (!spec) return [];
  return activeKit(spec, picks, mna).filter((a) => a.tier === "passive");
}

/** The own-Attunement resource a basic Attack generates for this class: the spec's auto-attack gen band,
 *  or null when the class isn't re-encoded (caller uses the legacy flat trickle). */
export function autoGenFor(att: string, cls: string): number | null {
  const spec = specFor(att, cls);
  const auto = spec?.abilities.find((a) => a.tier === "auto");
  return auto ? genAbility(auto).resourceGen : null;
}
