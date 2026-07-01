# ADR 0023 — Weapon Discipline titles below Archon; the 45 names are earned, not selected

**Status:** accepted (2026-07-01, Dara). A display-layer model change: the 45 class names
(Dawnwarden, Sunblade, The Lagrangian, …) are **Archon Titles**, earned only at **Archon Type I**
(100 MNA in a single Attunement — [ADR 0021](0021-mna-from-gear-level-floor.md)/REQUIEM canon), not
starting identities. Before that, a character is known by a universal **Weapon Discipline** title.
Purely presentational — mechanics, MNA gating, the 52-slot kit (ADR 0020) are **untouched**.

## Context

Every one of the 45 class names is meant to read as a **prestigious title earned through mastery**,
not something picked off a menu at character creation. But the shipped UI showed the Archon title
(e.g. "Sunblade") everywhere, from the very first frame — the Roster picker at game start, the
battle-screen command header, the abilities screen — regardless of the hero's actual progress. That
directly undercut the intended fantasy.

## Decision

**D1 · Universal Weapon Discipline titles**, one per Weapon Archetype, independent of Attunement:

| Weapon Archetype | Weapon Discipline |
|---|---|
| Sword & Shield | Vanguard |
| Two-Handed Sword | Blademaster |
| Hammer | Crusher |
| Dual Swords | Duelist |
| Dual Daggers | Edgewalker |
| Dual Pistols | Gunslinger |
| Rifle | Marksman |
| Staff | Arcanist |
| Spellblade | Spellblade |

Displayed as **"{Attunement} {Discipline}"** — e.g. *Sol Duelist*, *Nox Vanguard*, *Anima Duelist*,
*Quanta Marksman*. **UMBRAXIS is the one irregular adjective: "Umbraxian"** (not "Umbraxis"), per
Dara's own example ("Umbraxian Spellblade") — the other four Attunement names read fine unchanged as
prefixes.

**D2 · The Archon gate is the existing MNA@100 threshold — not character level.** Confirmed
explicitly: "level 100" in the originating brief means the already-ratified [ADR 0021](0021-mna-from-gear-level-floor.md)
trigger (100 MNA in the class's own Attunement, ~80% gear-sourced), not literal character level. No
new threshold, no change to ADR 0021's pacing.

**D3 · The title swaps, it doesn't stack.** Below Archon Type I, a character is known by their
Weapon Discipline title only. At/after Archon, the Weapon Discipline is **replaced** by the earned
Archon Title (the class spec's canonical `name`, e.g. "Sunblade") — not shown alongside it.

**D4 · A naming collision with already-shipped content was caught and resolved in Dara's favor of
the shipped mapping** (confirmed 2026-07-01): the originating brief's SOL Archon table had Two-Handed
Sword/Hammer/Dual Swords rotated by one row relative to what's actually built and designed this
session (Sunblade's dashboard, Overheat kit, the dual-swords-family distinctness matrix). **The
shipped mapping is authoritative and unchanged: Sunblade = SOL Dual Swords, Starbreaker = SOL
Two-Handed Sword, Solar Arbiter = SOL Hammer.** `data/classSpecs.generated.ts` (parsed from the 45
design docs) was not touched by this ADR and remains the source of truth for every Archon Title.

**D5 · Relationship to the draft Stable of 45 ([ADR 0022](0022-stable-of-45-recruited-roster.md),
still proposed/not ratified):** confirmed to apply **now**, under the current fluid-reclass model,
and to **carry forward unchanged** if Stable is later adopted — a recruited hero would start as e.g.
"Auren, the Sol Vanguard" and become "Auren, Dawnwarden" upon reaching Archon. No blocking dependency
either direction.

## Implementation (this ADR, done)

Pure display layer in `data/classes.ts`:
- `className(att, archetype)` — **unchanged**, the canonical/reference Archon name (class browsers,
  balance-sim, dev tooling — anywhere a "true" class identity is shown independent of any specific
  hero's progress).
- New: `WEAPON_DISCIPLINE`, `ATT_ADJ`, `isArchon(mnaInAtt)`, and `classTitle(att, archetype,
  mnaInAtt)` — the gated live-hero display name, `isArchon(mnaInAtt) ? className(...) :
  "{ATT_ADJ} {WEAPON_DISCIPLINE}"`.

Every LIVE-hero display swapped from `className`/raw `m.cls` to `classTitle(…, m.mna[att])`: the
Roster picker (party-build, `mna=0` — the case this ADR most directly targets, since that's
literally "selected at the beginning of the game"), the battle-screen command header, the
Party→Abilities/Mana screen, the skill-tree visualizer, and the equip-preview reclass warnings.
Standalone class-picker **preview** mode (the title-screen "Classes" browser, unbound to any hero)
intentionally keeps showing the canonical Archon name — it's a reference browser, not a specific
character's state.

No mechanics changed: MNA gating, the 52-slot kit, resource economy, and combat are byte-for-byte
what ADR 0020/0021 already shipped. Gate: typecheck clean, 501 tests pass, build green.

## Source

Dara Saadat, 2026-07-01 (the originating "REQUIEM – Weapon Discipline & Archon Title Progression"
brief), with three conflicts surfaced and resolved in-session: the SOL naming-table collision (D4),
the Level-100-vs-MNA@100 trigger (D2), and the Stable-of-45 relationship (D5).
