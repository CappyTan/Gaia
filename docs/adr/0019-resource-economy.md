# ADR 0019 — The resource economy: five party-shared per-Attunement pools

**Status:** accepted (2026-06-29). Resolves the battle-system / resource-economy design the
[Class System Model](../design/classes/README.md) parked. Builds on the
[Attunement Mechanics Framework](../design/attunement-mechanics.md) (the ratified four-economy
archetypes) and reconciles toward REQUIEM ([`docs/design/requiem/`](../design/requiem/README.md)).
Implemented in the `v3/resource-economy` sub-branch of the rewrite ([ADR 0018](0018-breaking-systems-rewrite-v3.md));
magnitudes are a balance pass. Glossary: **Resource** (updated), **MNA** in [`CONTEXT.md`](../../CONTEXT.md).

## Context

REQUIEM defines a **Resource meter per class** (27 named meters across 45 seats). The greenfield Class
System Model and all 45 numberless specs are instead written against **five party-shared per-Attunement
pools** with a one-way generate(specials)/spend(signatures+ultimates) split — but it parked the load-
bearing mechanics (persistence, personalities, cooldown unit, shared-pool timing, caps, the level→MNA
curve, anti-degeneracy, enemy pools) and left a canon conflict unresolved. This ADR settles them. A
grounding pass (class-spec contract + engine constraints + REQUIEM reconciliation + design precedent)
fed the decisions below.

## Decisions

**D0 · Granularity — five party-shared per-Attunement Resource pools (Dara-ratified).** One pool per
Attunement (SOL/NOX/ANIMA/QUANTA/UMBRAXIS). Each hero **generates** into the pool of *their* Attunement;
**any** hero of that Attunement may **spend** it (two SOL heroes share one SOL pool). This **supersedes**
REQUIEM's per-class meters (per-class names become flavor). Genuinely bespoke non-fill-bar meters
(**Lagrange Nodes** positional, **Kindling** HP-fueled) do **not** fit a pure pool and are flagged for
per-class reconciliation by Dara — not blocking the economy.

**Terminology (C6 fix).** The spendable pool is the **Resource** (per-Attunement, shared); **MNA** is the
never-spent unlock *threshold*. The classes/README "MNA resource economy" section must be **renamed**
(MNA → Resource) during wiring; CONTEXT.md is already corrected.

**D1 · Persistence — persist across fights, behind a tunable switch; boot ON.** Pools carry down a
dungeon (the MP template); reprieves/rest/level-up partially refill. The ratified archetypes (NOX banks ·
SOL runs hot · ANIMA compounds) are only coherent if pools persist, so persist is effectively
canon-implied. Built as **config** (`persist` flag) so it can collapse to reset; **v1 boots full**.

**D2 · Personalities — per-pool rule objects, modular, default ON, collapsible to flat.** NOX = no decay
(banks) · SOL = decay above a threshold (runs hot) · ANIMA = passive regen scaling with fill (compounds)
· QUANTA = generation as a variance roll (gambles) · UMBRAXIS = generation credited only when coupled to
a landed Drain (conserves). Encoded as **per-pool config**, not per-ability tags (the 45 specs need no
re-statting); setting all pools flat removes personalities. *Residual:* UMBRAXIS drain-coupling may need
per-*ability* granularity a pool-level rule can't fully express — parked.

**D3 · One-way vs battery — bounded two-way supported, but all shipped abilities stay one-way for now.**
Invariant #6 amended to *"one-way by default; battery abilities may refund the pool within a capped,
cooled bound."* The engine **supports** a bounded battery refund (per-turn cap + cooldown), but **no
wired ability uses it yet** — a capability on the shelf, enabled when the diverse-party floor (D7) needs
it.

**D4 · Cooldown unit — turns** (the caster's own activations; reuse the existing `ABILITY_CD`). Big
abilities are gated by **Resource cost, not time** — the ATB clock freezes during `awaiting`, so turns
are the only reliable time base.

**D5 · Shared-pool timing — atomic commit at action-lock; pool grows on turn-events; single
`spend()/gain()` helper; re-validate affordability at resolution** (the `awaiting` interlock serializes
turns, mirroring today's Ultimate-MP check-at-paint/re-debit-at-fire). First-come-first-served is the
embraced emergent ATB texture; **no reservation mechanic**.

**D6 · Pool caps — per-pool, co-tuned with personality + generator cooldown + fight length.** Sized so
one high-cost ultimate is reachable within a target fight but early signatures aren't bankable-to-spam.
Tuned in `balance-sim`; explicitly answers "are ultimates boss-only by construction?" rather than leaving
it to accident.

**D7 · Stacking is a balanced trade-off, not a power pick (Dara intent).** Concentrating an Attunement
buys deeper pool synergy (heroes fuel each other's big abilities) but **costs real holes in the arsenal**
(affinity-ring coverage gaps, missing effects/roles); diverse trades pool depth for full coverage. The
target is that **neither strictly dominates**; the specific holes/magnitudes are the **class/attunement
balance pass (TBD)**. A cheap-signature **floor** ensures a diverse party is never *soft-bricked*.

**D8 · Anti-degeneracy — per-action spend cap per pool** (no single ability dumps the whole reserve) as
the v1 floor; the sim must confirm the optimal line isn't single-dump. Tempo-debt deferred unless needed.

**D9 · Level→intrinsic-MNA — keep the manual ~1/level allocator** (already wired + serialized + respec-
able). Verify in the sim whether Archon@100 / ultimates are reachable within the L1–25 Aurelion arc; tune
the *rate* if not (don't abandon manual allocation). Flag the QUANTA-MNA→SPD→ATB-fill coupling as a
balance interaction.
> **⚠ Superseded by [ADR 0021](0021-mna-from-gear-level-floor.md) (2026-06-30).** The manual ~1/level
> allocator is **dropped**: the level contribution is now a derived `floor(level/5)` floor into the
> active attunement (no banked points, no respec), and **gear** is the dominant MNA source (~80% of the
> climb to Archon). The QUANTA-MNA→SPD→ATB coupling flag still stands.

**D10 · Enemy pools — minimal drain-target bar.** Enemies get an abstract Resource bar so canon
drain/reduce ultimates have a target — **not** a full enemy spend economy. Define what draining does
(feed the player's UMBRAXIS pool, or deny an enemy special). Full enemy economy deferred.

## Tunability

The experimental knobs (persistence, the five per-pool personality rules, caps, spend caps) live in a
data-driven `RESOURCE` config so they flip by **data edit, not logic rewrite** — collapsing to
persistent-flat or reset-flat trivially. The **Test Loop harness (ADR 0017)** is the bench for tuning
them: flip a knob, fight, read the battle-log dashboard.

## Canon residuals (for Dara / the class-wiring pass)

- **Bespoke meters (C5):** Lagrange Nodes / Kindling don't fit a pure pool — rework onto the pool or keep
  a bespoke local mechanic (per D0).
- **Soul Burn's "3× resource gen" (C4):** on a shared pool, does it triple the whole pool's inflow or
  only the burning hero's contribution? Needs a per-character hook.
- **Harmonic Ascension / Ascension (C8):** assume per-character state — confirm they coexist with a
  shared *spend* pool (MNA/ascension stay per-character).
- **Cross-attunement (C7):** specs deal off-attunement *damage types* natively; confirm "damage type ≠
  Resource tree" so "strictly own-attunement in-tree" still holds.

## Consequences

- **Engine wiring** (the `v3/resource-economy` sub-branch): five pools on run state (persisted, refilled
  by rest/reprieve/level-up), the `spend()/gain()` single-writer, per-pool personality rules + config,
  turn-denominated cooldowns gated by cost, the per-action spend cap, the bounded-battery capability
  (unused), and the minimal enemy bar. Re-tuned via `balance-sim`.
- **Design canon, numbers later** — all magnitudes (gen/cost bands → values, caps, decay/regen rates, the
  MNA rate) are a balance pass against the existing sim targets.
- **Reconciles toward REQUIEM** by Dara's D0 ratification; the residuals above are surfaced, not silently
  overridden.
