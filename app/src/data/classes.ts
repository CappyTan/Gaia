import type { Attunement } from "../types";
import { specFor } from "./classSpecs";

// Class = Attunement × Weapon Archetype (REQUIEM). A hero's class is set by their equipped weapon's
// Attunement + Archetype. The class's DISPLAY NAME comes from its 52-slot design spec (data/classSpecs —
// the canonical source for all 45 classes). There is no separate ability-kit map any more: a hero's kit
// is the V3 choice-system kit they build from their picks (systems/classKit), gated by MNA (ADR 0020).
//
// This is the CANONICAL/reference name (used by class browsers, the balance sim, dev tools — anywhere
// showing a class's true identity regardless of any specific hero's progress). For a LIVE hero's
// in-game display label, use `classTitle` below (ADR 0023) — before Archon they're known by their
// Weapon Discipline, not this name.
export const className = (att: Attunement, archetype: string): string =>
  specFor(att, archetype)?.name ?? `${att} ${archetype}`;

// ── Weapon Discipline -> Archon Title progression (ADR 0023) ─────────────────────────────────────
// The 45 class names above (Dawnwarden, Sunblade, The Lagrangian, …) are ARCHON TITLES — earned only
// at Archon Type I (100 MNA in the class's own Attunement), not starting identities. Before that, a
// character is known by a universal Weapon Discipline title: "{Attunement} {Discipline}". Purely a
// DISPLAY layer (Dara) — mechanics/gating/kit are untouched, still driven by the real MNA threshold.
export const WEAPON_DISCIPLINE: Record<string, string> = {
  "Sword & Shield": "Vanguard",
  "Two-Handed Sword": "Blademaster",
  "Hammer": "Crusher",
  "Dual Swords": "Duelist",
  "Dual Daggers": "Edgewalker",
  "Dual Pistols": "Gunslinger",
  "Rifle": "Marksman",
  "Staff": "Arcanist",
  "Spellblade": "Spellblade",
};

// The discipline title's Attunement prefix — an adjective, not the raw enum (Umbraxis -> "Umbraxian",
// per Dara's own example "Umbraxian Spellblade"; the other four read fine unchanged as prefixes).
export const ATT_ADJ: Record<Attunement, string> = { SOL: "Sol", NOX: "Nox", ANIMA: "Anima", QUANTA: "Quanta", UMBRAXIS: "Umbraxian" };

/** Archon Type I threshold (ADR 0021/REQUIEM canon): 100 MNA in a single Attunement. */
export const isArchon = (mnaInAtt: number): boolean => mnaInAtt >= 100;

/** The DISPLAY title for a class at a given MNA (ADR 0023): below Archon Type I (100 MNA) a character
 *  is known by their Weapon Discipline ("Sol Duelist"); at/after Archon, by their earned Archon Title
 *  (the class spec's name, e.g. "Sunblade"). Use for any LIVE hero's label; `className` stays the
 *  canonical/reference name for class browsers and tooling that aren't a specific character's state. */
export const classTitle = (att: Attunement, archetype: string, mnaInAtt: number): string =>
  isArchon(mnaInAtt) ? className(att, archetype) : `${ATT_ADJ[att]} ${WEAPON_DISCIPLINE[archetype] ?? archetype}`;
