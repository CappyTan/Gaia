# ADR 0016 — Buff/Debuff system: unified status model, distinct DoTs, 5-layer catalog

**Status:** accepted (Dara-ratified, 2026-06-29). Establishes the buff/debuff system and its catalog.
Builds on the [Attunement Mechanics Framework](../design/attunement-mechanics.md) (the 5 mechanic
layers + per-attunement suites) and [ADR 0014](0014-secondary-stats-matter-energy-final-20.md)
(Accuracy/Resistance substats gate application). The effect catalog lives in
[`docs/design/status-effects.md`](../design/status-effects.md). Glossary: **status effect**, **layer**,
**phase-transition**, **dispel-lock** in [`CONTEXT.md`](../../CONTEXT.md).

> **Design canon, not yet engine-wired.** Records the ratified design from a grill audit. The engine
> ships ~8 effects today (3 of them clone DoTs); wiring the catalog is a downstream ticket. Magnitudes
> are a balance pass.

## Context

The buff/debuff design had massively outrun the engine. The engine has ~8 effects, almost all in one
layer: three **mechanically identical DoTs** (`burn`/`poison`/`decay` — same tick, different color),
`regen`, `stun`, `blind`, and three buffs (`atkup`, `wardArmor`, `guard`). Debuffs use a generic
`StatusMap` (string→turns) that can't carry magnitude, stacks, sign, dispellability, or source; buffs
use a separate rigid `Skill.buff {def, atkup, wardArmor, turns}`. Meanwhile the ratified
attunement-mechanics defines a **5-layer × 5-attunement** vocabulary (~25–30 distinct effects) the
class specs already cite (Chill→Frozen→Brittle→Shatter, lattice ward, time-lock, banks…).

The bar for "good": every effect is **distinct** (no clone DoTs), **themed + categorized** (one of the
5 layers), **expressible by the data model**, and has clear **stacking / duration / dispel** rules.

## Decision

1. **A data-driven Status Catalog + structured active instances** (the `substats.ts` pattern). The
   catalog ([`status-effects.md`](../design/status-effects.md)) is the registry of effect *definitions*
   (`id · name · kind buff|debuff · layer · attunement · duration · magnitude/stacks · stacking rule ·
   dispellable · cleansable · time-lockable · needs-source`); a unit carries **active instances**
   `{defId, turns, stacks, magnitude, source}`. **Buffs and debuffs are one model** (sign = `kind`) —
   the rigid 3-field buff shape is retired.

2. **Organize by the 5 ratified layers × 6 buckets.** Layers: Status · Action-economy · Stat/damage ·
   Meta · Economy. Buckets: **Neutral** (class-agnostic: Attack/Defense Up/Down, Guard, Barrier, Slug
   Stun/Slow/Haste) **+ the 5 attunement suites** (signature/flavored effects). No five-fold copies of
   generic buffs; attunements own their characterful effects.

3. **The 5 signature DoTs are mechanically distinct** (no clones): SOL **Burn** (detonatable/spreads) ·
   NOX **Stasis** (winds vitality down, sets up Shatter; engine keyword `decay`) · ANIMA **Infestation**
   (stacks; spreads to a new host on death) · UMBRAXIS **Drain** (ticked HP transfers to the caster —
   uses `source`) · QUANTA **no DoT** (uses **Doom** + probability debuffs). Built as one base-tick +
   per-attunement twist.

4. **Stacking & phase-transitions.** Four stacking rules: `refresh` (default) · `stack-intensity`
   (capped, scales with stacks) · `stack-duration` (rare) · `unique`. DoTs/HoTs tick and durations
   count down at the **bearer's turn**. **Phase-transition chains** = `stack-intensity` reaching a
   threshold auto-promotes to the next-stage effect (Chill→Frozen→Brittle→Shatter, Overheat→Ignite→
   Detonate, Seed→Bloom→Overgrowth). The per-effect cap prevents degenerate infinite stacks.

5. **Lifecycle: apply / resist / remove / protect / anti-lock.**
   - **Apply:** each debuff is `on-hit` (chip — lands with the hit) or `resistible` (rolls **Accuracy
     [attacker] vs Resistance [target]**, the ADR-0014 substats — for hard CC/heavy debuffs).
   - **Remove:** **Cleanse** removes only `cleansable` debuffs (a few signatures are un-cleansable:
     Doom, deep Stasis, Terminal Decay); a **buff-strip** counterpart removes *enemy* buffs (vehicle
     for UMBRAXIS drain-buff and NOX reset).
   - **Protect:** the `time-lockable` flag powers NOX **preserve** (freeze an ally buff's duration) and
     **dispel-lock** (target can't cleanse / gain new buffs for a few turns).
   - **Anti-perma-lock:** stack caps + Resistance + a brief **re-application immunity window** after a
     unit is hard-controlled (Stun/Frozen/Anchored). Soft debuffs (Chill, Decohere) don't trigger it.

## Consequences

- **Engine wiring is a staged ticket.** It touches `types.ts` (replace `StatusMap`/`Skill.buff` with
  the catalog + instance types; add `kind/layer/stacking/flags/source`), a new `data/status.ts`
  registry, `systems/combat.ts` + `controllers/battle.ts` (apply/tick/resist/cleanse/dispel-lock/
  CC-immunity; the per-attunement DoT twists), and the status UI/badges.
- **Deploy-first tranche** (per the catalog): differentiate the 3 clone DoTs + wire Drain; the Neutral
  buff/debuff set; core control (Stun/Blind/Chill→Frozen/Slow). The QUANTA probability suite, the meta
  layer, and the remaining phase-transition chains follow as the class-engine pass needs them.
- **Re-homes the engine's generics** to Neutral (`atkup`→Attack Up, `guard`→Guard, `wardArmor`→
  Barrier); **Regen becomes ANIMA-signature** (its HoT), with the dungeon-reprieve heal a separate
  generic heal.
- Class specs gain a real vocabulary to cite by `id`; the catalog is the shared contract between specs
  and engine.

## Open / deferred

Full QUANTA probability suite + meta-layer delineation; per-effect magnitudes/durations/caps (balance
pass); the Economy layer's overlap with the MNA resource economy; exact UI for stacks/instances.
