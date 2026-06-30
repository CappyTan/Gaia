# ADR 0020 — Class-wiring approach: vertical slice, real choice system, generated numbers

**Status:** accepted (2026-06-29). The approach for the **capstone `v3/classes`** sub-branch of the
rewrite ([ADR 0018](0018-breaking-systems-rewrite-v3.md)) — translating the 45 numberless 52-slot class
specs ([Class System Model](../design/classes/README.md)) into the engine. Depends on the stat model
([ADR 0014](0014-secondary-stats-matter-energy-final-20.md)), the status catalog
([ADR 0016](0016-buff-debuff-system.md)), and the resource economy
([ADR 0019](0019-resource-economy.md)).

## Context

The gap is the largest in the rewrite. Current kits are a `string[]` of ~5–6 skill keys, all
unlocked-by-MNA-threshold with **no choice** (`skillUnlocked` checks `m.mna[att] >= mnaReq`). The 52-slot
specs (1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives, with pick-1-of-2 rotating lanes,
pick-2-of-4 ults, pick-1-of-3 passives ×3) are ~2,340 authored entries across 45 classes, introduce a
**choice mechanic** and a **passive system** the engine lacks, and need numbers the numberless specs
don't carry. The `Skill` type lacks the fields (resource gen/cost, lane, tier/milestone, choice-group,
passive type).

## Decisions

1. **Vertical slice first, then rollout.** Wire a few classes *fully* through the new pipeline (extended
   `Skill` → numbers → choice system → resource gen/spend → passives → combat), prove it end-to-end in the
   Test Loop harness, then mass-generate the rest. Two sub-branches: `v3/classes-slice` → `v3/classes-
   rollout`. Rationale: too many novel pieces to build 2,340 entries against an unproven pipeline; a flaw
   caught on 5 classes beats a 45-class rework.

2. **Build the real 3-lane choice system in the slice.** A new `systems/choice` module + a picker UI
   (sibling to the MNA allocator): at each milestone the player banks a pick from the offered pair (2-of-4
   at the ultimate milestone, 1-of-3 for each passive set); a pick goes **dormant** if total MNA later
   drops below its threshold. The choice system is the most novel and identity-defining part, so it must
   be *in* the slice — deferring it would validate only the easy pieces. **Picks are respec-able**
   (consistent with the shipping MNA respec + dev iteration) — a deliberate divergence from the Model's
   strict-"permanent" wording, flagged for Dara in case permanence is an intended identity constraint.

3. **Numbers via structured re-encode + band→number generator + hand-override.** Re-encode the 45 specs
   as **structured data** (JSON, like the existing `classes.json`) capturing the 52-slot fields; a
   generator maps **bands → numbers** (gen `minor/moderate/major`, cost `low/med/high`, cooldown
   `none/short/medium/long`, `mnaReq` = milestone) via per-Attunement/Archetype **scaling tables**;
   `balance-sim` tunes the tables; a thin **hand-override layer** (the `overrides.ts` pattern) covers
   hero/signature classes. The markdown specs remain the human design record; the JSON is the build input.
   The **slice classes are hand-tuned to anchor the scaling tables** the rollout then generates from.

4. **The slice = one class per Attunement, five different Archetypes** (e.g. a Staff, a Hammer, Dual
   Daggers, a Spellblade, a Rifle). This exercises all five resource-pool personalities, all five
   affinity-ring positions, and a spread of archetype secondaries. (Mono-stacking is *not* tested by a
   diverse slice — that's a full-roster + harness balance concern, deferred.)

5. **`Skill`-type extension + passive system fall out** (no separate grill): extend `Skill` with the
   52-slot fields (lane, tier, milestone, resource gen/cost, choice-group, passive type); passives are
   continuous modifiers applied in `recalc`/combat.

6. **Weapon-swap = class-swap is deferred for the slice.** Canon sets class by equipped weapon and swaps
   the kit, but picks are banked *per class*. For the slice, each hero's class is **fixed via its starting
   weapon**; dynamic reclassing (and switching to that class's banked picks/pools) is handled in the
   rollout.

## Consequences

- **The capstone is gated** by ADR 0014 + 0016 + 0019 — it can't start until the stat model, status
  catalog, and resource economy are wired.
- **The slice is the proof** that the full novel pipeline (choice + resource gen/spend + passives +
  generated numbers) works, validated hands-on in the Test Loop harness (ADR 0017) before fan-out.
- **Tuning concentrates in scaling tables**, not 2,340 hand-numbers; all magnitudes are a balance pass.
- **Flagged for Dara:** respec-able vs permanent picks; and the bespoke-meter / Soul-Burn / cross-
  attunement residuals from ADR 0019 land here, in the kits.
