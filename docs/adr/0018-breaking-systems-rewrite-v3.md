# ADR 0018 — The V3 systems rewrite: a deliberate breaking change on a long-lived branch

**Status:** accepted (2026-06-29). Authorizes implementing the ratified design canon
([ADR 0013](0013-no-magic-stat-casters-are-archetype.md)/[0014](0014-secondary-stats-matter-energy-final-20.md)/[0015](0015-itemization-slots-rarity-affixes.md)/[0016](0016-buff-debuff-system.md)
+ the [52-slot Class System Model](../design/classes/README.md)) as one coordinated **breaking** rewrite
of the systems layer, accepting that the v0.116 POC is left behind. The dev test harness (ADR 0017) is
built **after** this lands.

## Context

A large body of design canon is ratified but only partly engine-wired, and the engine carries a stalled
half-migration: `Unit` holds both the legacy POC stats (`atk/armor/mag/spd`) **and** the V3
`prim/sub/abp`, with combat still reading the old substat keys. Incrementally layering V3 on top is what
produced the half-wired mess. The team's call: do the **full update**, and **it is acceptable to break
the old game entirely** in the process.

## Decision

1. **Full clean V3 cutover (big-bang), no compatibility shim.** V3 primaries/substats become the single
   source of truth; the legacy `atk/armor/mag/spd` fields are removed, not derived. Combat/render/save/
   sim move to V3 together. A balance re-tune (via the sim) is part of the cutover, not a follow-up.
2. **Enemies get full V3 stat blocks**, including **primaries that scale with level**. Substats derive
   from the ADR-0014 dual-source baseline (no per-enemy substat authoring). This **folds the bestiary
   level-seeding rebuild** (the DESIGN.md open question) *into* the cutover: "a level-N monster" = its
   primaries computed at level N. The harness's enemy-level dial is satisfied the moment this lands.
3. **Build order (the spine).** `ADR 0014 (Stat V3)` is the foundation — everything reads stats. Then
   `ADR 0015 (itemization)` and `ADR 0016 (buff/debuff)` (either order; both read V3). The **52-slot
   class engine wiring is the capstone**, gated by a still-owed **battle-system / resource-economy design
   pass** (the "Deferred (parked)" items in the Class System Model: pool caps, reset-vs-persist, cooldown
   unit, level→intrinsic-MNA curve, scaling math, shared-pool ATB timing) — that design is resolved
   before class code is written.
4. **Breakage is accepted, but contained on a long-lived branch.** The rewrite develops on a long-lived
   integration branch; **`main` stays live as v0.116** (a working reference/fallback) until the new world
   is coherent and playable, then flips over in one deliberate merge. We do **not** take the live site
   dark for the duration.
5. **Save compatibility is dropped.** A stat/item/skill reshape this deep cannot honor ADR 0007
   version-tolerant resume; existing runs become unloadable. Acceptable for a POC whose only players are
   the team. The new world ships a fresh save version.

We rejected: the bridge-then-cutover (derive legacy from V3, migrate formula-by-formula) — lower
risk-per-step but slower, and unnecessary once breaking the old game is acceptable; and letting `main`
itself go broken — needlessly dark-sites the live game.

## Consequences

- **No green-at-every-step guarantee** during the rewrite; the gate is that the *end state* is green
  (typecheck/test/build/sim re-tuned to targets) before the integration branch merges to `main`.
- **Content is a second pass behind the engine.** Every enemy needs V3 primaries; every item re-rolls
  under the new loot model; the 45 kits need real numbers (specs are numberless). The engine cutover is
  half the work.
- **Long-lived-branch maintenance cost.** Diverging from `main` reintroduces the squash-merge/rebase pain
  CLAUDE.md warns about, at larger scale — accepted as the price of keeping the live game up.
- **ADR 0017 (test harness) waits.** It depends on these very seams; it is built on the settled V3
  codebase and then becomes the hands-on acceptance tool for everything here.
- **A major version bump** marks the flip (new save version, new systems world).
