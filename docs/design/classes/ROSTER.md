# Class Roster — the 45-seat scoreboard

> **Living artifact, refreshed by the `class-spec-reviewer` roster audit** (rubric:
> [`class-spec-review`](../../../.claude/skills/class-spec-review/SKILL.md), Lens 7). Tracks which of
> the 45 classes (5 Attunements × 9 Weapon Archetypes) have a greenfield design spec, family
> completeness, and the roster's Matter/Energy lean. **Incompleteness is a tracked gap, never a
> failure** — we're mid-build by design. The structural gate (`npm run lint:classes`) is separate;
> this is the coverage view.

**Built: 16 / 45.** Last refreshed from the specs on disk (16 spec files).

## The matrix

✓ = spec written (`docs/design/classes/<attunement>-<archetype>.md`) · · = empty seat

| Archetype \ Attunement | SOL | NOX | ANIMA | QUANTA | UMBRAXIS |
|---|---|---|---|---|---|
| **Sword & Shield** | ✓ Dawnwarden | ✓ Penumbral Bastion | ✓ Soul-Bound Aegis | ✓ Paradox Bastion | ✓ Tidal Sovereign |
| **Two-Handed Sword** | · | · | · | · | · |
| **Hammer** | ✓ Solar Arbiter | ✓ Equilibrium Ascendant | ✓ Lifekeeper | ✓ Causality Arbiter | ✓ Graviton Warden |
| **Dual Swords** | · | ✓ Rimewalker | · | · | · |
| **Dual Daggers** | · | · | · | · | · |
| **Dual Pistols** | · | · | · | · | · |
| **Rifle** | · | · | · | · | · |
| **Staff** | ✓ Heliomancer | ✓ Null Absolutionist | ✓ Genesis Sage | ✓ Chronosage | ✓ The Singularitan |
| **Spellblade** | · | · | · | · | · |

## Family completeness (the weapon-family seats)

| Family | Built | Note |
|---|---|---|
| **Sword & Shield** | 5 / 5 ✅ | complete — see [`sword-and-shield-family.md`](./sword-and-shield-family.md) |
| **Hammer** | 5 / 5 ✅ | complete — see [`hammer-family.md`](./hammer-family.md) ("five physics of the blow") |
| **Staff** | 5 / 5 ✅ | complete — see [`staff-family.md`](./staff-family.md) (caster family) |
| **Dual Swords** | 1 / 5 | only NOX (Rimewalker, the pilot/worked example) |
| Two-Handed Sword · Dual Daggers · Dual Pistols · Rifle · Spellblade | 0 / 5 | not started |

## Matter / Energy roster balance (Lens 7)

Per ADR 0014, abilities are typed **Matter** (`phys`) vs **Energy** (`mag`); the *lean* should match
each archetype's fantasy, not hit a 50/50 quota. The expected per-archetype lean:

- **Hammer** → Matter-heavy (martial impact) ✓ as built.
- **Staff** → Energy-heavy (projected attunement) ✓ as built.
- **Sword & Shield** → mixed, DEF-secondary; martial core with attunement Energy on top.

> The **precise roster-wide M/E balance** (do both damage types have enough targets for itemization's
> Matter/Energy offense+defense substats?) is computed by the `class-spec-reviewer` on each roster
> audit, reading the typed entries directly — kept out of this seed to avoid a stale hand-count.
> **Open watch:** all three built families skew toward their archetype's natural type; confirm the
> remaining archetypes (esp. Dual Daggers, Rifle, Spellblade) bring enough Energy/mixed kits that the
> roster isn't a Matter monoculture.

## How this is maintained

Run the **`class-spec-reviewer` in roster mode** (or `/class-spec-review` if exposed) after specs are
added/changed; it re-derives this table from the specs on disk, runs `npm run lint:classes` for the
global structure + name-uniqueness sweep, and rewrites this file. Do not hand-edit beyond quick fixes
— the audit is the source of truth.
