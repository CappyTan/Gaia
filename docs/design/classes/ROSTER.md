# Class Roster — the 45-seat scoreboard

> **Living artifact, refreshed by the `class-spec-reviewer` roster audit** (rubric:
> [`class-spec-review`](../../../.claude/skills/class-spec-review/SKILL.md)). Tracks which of the 45
> classes (5 Attunements × 9 Weapon Archetypes) have a greenfield design spec, family completeness,
> the audit verdicts, and the roster's Matter/Energy lean. The structural gate
> (`npm run lint:classes`) is separate; this is the coverage + review view.

**Built: 45 / 45 — roster COMPLETE.** Structure gate (Lens 1) green across all 45 (0 Blocking).
Full 7-lens roster audit run **2026-06-29** (per-family, by the `class-spec-reviewer`).

## The matrix

✓ = spec written + reviewed · class name shown

| Archetype \ Attunement | SOL | NOX | ANIMA | QUANTA | UMBRAXIS |
|---|---|---|---|---|---|
| **Sword & Shield** | ✓ Dawnwarden | ✓ Penumbral Bastion | ✓ Soul-Bound Aegis | ✓ Paradox Bastion | ✓ Tidal Sovereign |
| **Two-Handed Sword** | ✓ Starbreaker | ✓ Worldender | ✓ Apex Dominion | ✓ Timeline Breaker | ✓ Singularity Reaver |
| **Hammer** | ✓ Solar Arbiter | ✓ Equilibrium Ascendant | ✓ Lifekeeper | ✓ Causality Arbiter | ✓ Graviton Warden |
| **Dual Swords** | ✓ Sunblade | ✓ Rimewalker | ✓ Pulse Arbiter | ✓ Phasewalker | ✓ Abyssal Vector |
| **Dual Daggers** | ✓ Eclipsedancer | ✓ Velestra | ✓ Symbiote Hunter | ✓ The Anomaly | ✓ The Lagrangian |
| **Dual Pistols** | ✓ Gunslinger Solaris | ✓ Cryovex | ✓ Sporecaster | ✓ Entropic Echo | ✓ Orbitalist |
| **Rifle** | ✓ Photon Vanguard | ✓ Terminus | ✓ Genewarden | ✓ Observer Prime | ✓ Astrolancer |
| **Staff** | ✓ Heliomancer | ✓ Null Absolutionist | ✓ Genesis Sage | ✓ Chronosage | ✓ The Singularitan |
| **Spellblade** | ✓ Starforge Knight | ✓ Lattice Executioner | ✓ Biomancer | ✓ Quantum Exarch | ✓ Voidstar Exarch |

## Audit verdicts (per family)

Lens 1 (structure) is green everywhere; verdicts below reflect the judgment lenses (2–7).

| Family | Verdict | Top advisory finding (Dara rules) |
|---|---|---|
| Sword & Shield | ship-with-fixes | UMBRAXIS *Tidal Sovereign* lane C: prose says self-sustain, abilities party-heal — make them agree |
| Two-Handed Sword | ship-with-fixes | UMBRAXIS *Singularity Reaver*: generators trickle "from nothing" — tie to Drain (conservation) |
| Hammer | ship-with-fixes | **ANIMA *Lifekeeper* heal budget** (mass-revive + full-fight Regen) risks breaching ledger #16 |
| Dual Swords | ship | clean; Rimewalker entropy-framework reconciliation reads well |
| Dual Daggers | ship | "The Lagrangian" name vs the legendary figure *The Last Lagrangian* → canon-keeper |
| Dual Pistols | ship | QUANTA *Entropic Echo* lane B: 4 escalating "enemy-misses" buttons = soft dead rungs |
| Rifle | ship-with-fixes | (fixed) stray tool-wrapper artifact in `nox-rifle.md`; NOX/QUANTA Matter-monoculture |
| Staff | ship-with-fixes | NOX *Null Absolutionist* omits the ratified Chill→Frozen→Shatter showcase |
| Spellblade | ship-with-fixes | UMBRAXIS *Voidstar Exarch* blade lane is half `mag`-typed — re-type imbued cuts to Matter |

## Cross-cutting / roster-level findings (Lens 7 + systemic)

1. **`phys`/`mag` → Matter/Energy vocabulary (every family).** Specs use the engine-legacy `type`
   words; ADR 0014 canon is **Matter/Energy**. A single roster-wide ruling for Dara — adopt the canon
   terms in specs, or keep `phys`/`mag` as the documented engine alias. *(Not a unilateral rewrite.)*
2. **UMBRAXIS conservation economy under-expressed (systemic).** Flagged in Hammer, Two-Handed (and
   the S&S Tidal drift): generators often produce resource "from nothing" rather than from a
   Drain/steal-off-the-foe, so UMBRAXIS reads economically like the other four. The "fed by what it
   takes" identity lives in prose, not structure, in several specs.
3. **ANIMA healer concentration (ledger #16) — mostly honored, one risk.** Daggers, S&S, Staff,
   Two-Handed, Spellblade all rigorously confirmed non-party-healers; **ANIMA Hammer (Lifekeeper)** is
   the one spec whose heal/revive budget pushes past "secondary off-healer" toward the Staff's seat.
4. **QUANTA under-delivers Energy + some Doom typed `util`.** SPD-weapon QUANTA classes (Rifle,
   Daggers) skew near-mono-Matter, and several Doom win-cons are typed `util` (which can't deal damage
   when wired) → a note for `class-kit-reviewer` at engine time.

## Matter / Energy roster balance (Lens 7)

Per ADR 0014, abilities are typed **Matter** (`phys`) vs **Energy** (`mag`); the *lean* should match
each archetype's fantasy, not a 50/50 quota. As built, the roster is healthy with one watch:

- **Energy is well-supplied** by Staff (all-Energy, by design), Spellblades (genuinely mixed — the
  hybrid risk did **not** materialize), and each martial family's attunement finishers (SOL radiant,
  ANIMA spore/Bloom, UMBRAXIS Drain `mag` lines).
- **Matter dominates the martial families** (Hammer, Two-Handed, Swords, Daggers, Pistols, Rifle) —
  correct for kinetic weapons.
- **Watch:** **QUANTA on SPD weapons** (Rifle/Daggers) is near-mono-Matter — QUANTA contributes
  little Energy-offense to the roster. Defensible ("a round is kinetic"), but if itemization wants
  QUANTA Energy targets, retype some Doom/Decohere resolutions to `mag`. Dara's call.

## Open decisions for Dara (surfaced by the audit)

- **Spellblade secondary: AGI (tentative) vs VIT.** AGI makes SOL *Starforge Knight* a **third** SOL
  AGI+AGI class (with Sunblade + Gunslinger Solaris). VIT would dissolve that clustering and fit the
  front-line-caster fantasy. The family's load-bearing tentative call.
- **`phys`/`mag` → Matter/Energy** adoption in spec `type` fields (roster-wide).
- **ANIMA Lifekeeper heal budget** vs ledger #16 (keep heals impact-gated; pull mass-revive to Staff?).
- **Canon-truth (→ `requiem-canon-keeper`):** "The Lagrangian" vs the legendary figure; the two
  "Exarch" Spellblade names (deliberate echo?).

## How this is maintained

Run the **`class-spec-reviewer` in roster mode** after specs are added/changed; it re-derives this
table, runs `npm run lint:classes` for the structure + name-uniqueness sweep, and rewrites this file.
