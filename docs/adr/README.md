# Architecture Decision Records — Gaia

Immutable records of decisions that are hard to reverse, surprising without context, and
the result of a real trade-off. Each ADR is a short paragraph: what we decided and why.

| ADR | Decision |
|---|---|
| [0001](0001-atb-over-turn-based.md) | ATB combat over pure turn-based |
| [0002](0002-build-fresh.md) | Build fresh, no engine code reuse |
| [0003](0003-fixed-sol-party.md) | A fixed all-SOL party for the POC |
| [0004](0004-paper-doll-composition.md) | Layered paper-doll character composition (equip = swap a layer) |
| [0005](0005-modular-ts-vite.md) | Modular TypeScript + Vite architecture (supersedes 0002's single-file build) |
| [0006](0006-explorable-settlements-greenfield-zones.md) | Explorable settlements (real towns/cities with NPCs) & bespoke greenfield zones |
| [0007](0007-versioned-save-resume.md) | Version-tolerant save & resume (autosave + Continue; id-based, graceful migration) |
| [0008](0008-seamless-continuous-overworld.md) | Seamless continuous overworld — no-load region roaming (staged) |
| [0009](0009-world-hierarchy-bigmap.md) | World hierarchy (Map/Continent/Zone/Area/Tile) & the big-map paint-regions model |
| [0010](0010-tailored-dungeon-reprieves.md) | Tailored dungeon reprieves — partial, themed rest nodes (no full-heal); caves get none |
| [0011](0011-environmental-wayfinding-derived-objectives.md) | Environmental wayfinding — derived Objectives + persisted known-regions fog-of-war |
| [0012](0012-field-godmodule-split.md) | Split the field.ts god-module → ui/fieldRender (draw) + systems/mapgen (pure, RNG-injected) |
| [0013](0013-no-magic-stat-casters-are-archetype.md) | No "Magic" stat — casters are archetype-defined (Staff/Spellblade); VIT is the universal channeling fuel |
| [0014](0014-secondary-stats-matter-energy-final-20.md) | Secondary stats — Matter/Energy damage typing, the final 20 (zero dead), dual-source (primary baseline + gear) |
| [0015](0015-itemization-slots-rarity-affixes.md) | Itemization — slot roles & split MNA-gate, rarity (count+quality) vs ilvl (base), slot-locked affixes + special/unique layer |
| [0016](0016-buff-debuff-system.md) | Buff/Debuff system — unified status model (catalog + instances), distinct signature DoTs, 5-layer × 6-bucket catalog, stacking/phase-transition + lifecycle rules |
| [0017](0017-dev-test-harness-borrows-runstate.md) | Dev test harness ("Test Loop") reuses the live run-state behind a `testMode` flag (suppresses save + game-over); built on shipping systems |
| [0018](0018-breaking-systems-rewrite-v3.md) | The V3 systems rewrite — one coordinated breaking change (clean stat cutover, full-V3 level-scaled enemies, save-compat dropped) on a long-lived branch; `main` stays live as v0.116 until the flip |
| [0019](0019-resource-economy.md) | The resource economy — five party-shared per-Attunement Resource pools (supersede per-class meters), persistent + per-pool personalities behind tunable config, bounded-battery capability (unused at first), turn cooldowns; stacking is a balanced trade-off |
| [0020](0020-class-wiring-approach.md) | Class-wiring approach — vertical slice (one class/Attunement) first, real 3-lane choice system in the slice, numbers via structured re-encode + band→number generator + hand-override; weapon-swap reclass deferred |
| [0021](0021-mna-from-gear-level-floor.md) | MNA from gear; leveling gives a small derived floor (`floor(level/5)`, ~20% of the climb) — gear is the dominant source (~80%), Archon Type I becomes an earned loot chase; delete the intrinsic-allocation/respec subsystem (mothballed for cross-class), rebalance gear-MNA up |
| [0022](0022-stable-of-45-recruited-roster.md) | 🟡 **DRAFT/proposed** — The Stable of 45: recruited, fixed-class named heroes (start with 5, recruit 41), individually geared; loot → collection model; *proposes* to supersede "Class = equipped weapon" but **not ratified** — brainstorm pending Dara's decision |
| [0023](0023-weapon-discipline-archon-title.md) | Weapon Discipline titles below Archon; the 45 class names are Archon Titles earned at Archon Type I (100 MNA, ADR 0021) — not starting identities. Below Archon, display "{Attunement} {Discipline}" (e.g. Sol Duelist); UMBRAXIS uses "Umbraxian". Display-layer only — mechanics/kit/MNA gating untouched |
| [0024](0024-action-feel-2d-continuous-movement.md) | Action feel in 2D — stay 2D (no 3D/engine); continuous float-space movement everywhere (tiles = terrain, not quanta; derived tile-enter); ATB stays, encounters become visible field packs (real-time combat = flagged north-star fork); Canvas 2D + chunk caching at 60fps with PixiJS pre-approved behind a trigger; procedural animation + procedural weapon swings; gear via appearance tiers + rarity glow (armor tiers deferred); phased shipping (feel → living world → forks) |
