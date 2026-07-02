# ADR 0021 — MNA comes from gear; leveling gives a small derived floor

**Status:** accepted (2026-06-30, Dara-ratified via a grill session) **+ implemented (v0.212 — the
engine pass: derived floor in `recalc`, allocator deleted, gear-MNA rebalanced, save recompute)**.
Note on D3 as shipped: heroes start at **level 10** (Dara, v0.211) with BOTH the 5-MNA special and
10-MNA signature milestones open on day one, so the starter-weapon guarantee is **≥8** (floor(10/5)=2
+ 8 = 10), not the literal ≥5. Changes how the **MNA gate** is
*sourced* — it does **not** touch what MNA does (still a threshold + the +60% output scaler) or the
spendable per-Attunement **Resource** pools ([ADR 0019](0019-resource-economy.md)). Resolves the
"level→intrinsic-MNA curve" that ADR 0019 and the [Class System Model](../design/classes/README.md)
parked. Supersedes the leveling-MNA half of the 2026-06-19 REQUIEM confirmation in
[`mna-progression.md`](../design/requiem/mna-progression.md) (Dara's canon to change).

## Context

In the prior model, **Total MNA = intrinsic (from leveling, ~0.85/level via a swingy roll) + gear**,
and leveled points were **freely assignable** across the five Attunement trees (with a paid respec).
Two problems surfaced:

1. **Archon arrives too fast / gear feels redundant early.** The level roll averages ~0.85 MNA/level;
   over the L1→100 climb that's **~85 MNA** — and Archon Type I is **100**. Leveling *alone* carried
   ~85% of the road to your first ultimate, doing the gating job loot is supposed to do.
2. **Free cross-tree allocation solves a choice that doesn't exist.** In the one-weapon-one-class
   model a SOL Rifleman has no reason to bank points anywhere but SOL — every player dumps 100% into
   their weapon's tree. The allocator/respec subsystem earns its keep only once you can draw skills
   from **multiple** classes at once (the future cross-class combo / Archon Type II work,
   [endgame-mechanics.md](../design/classes/endgame-mechanics.md)) — which we don't have yet.

## Decision

**MNA is your gear; leveling gives a small floor.**

**D1 · Derived level floor, not allocated points.** `Total MNA = floor(level/5) into your active
attunement + gear`. The level floor is **derived** (not earned-and-banked): it auto-lands in whatever
Attunement you're currently wielding and **follows you on weapon-swap** — no allocation decision, no
stranded points. At the L100 cap the floor is **20 MNA = 20% of the road to Archon@100**; **gear owns
the other ~80%.** The floor is deterministic, replacing the old swingy per-level RNG roll.

**D2 · Gear is the dominant MNA source — rebalance gear MNA up.** Because gear must now supply ~80 MNA
in one tree to reach Archon, the gear-MNA tables (`WEAPON_MNA_ROLL` / `ARMOR_MNA_ROLL` /
`ARMOR_MNA_CHANCE` in `data/loot.ts`, tuned in the old model for gear-**as-topup**) must rise so a
**strong, deliberately-attuned endgame kit** (not a god-roll) can carry the climb. Archon Type I
becomes a **reachable-but-earned loot chase** — hard, not impossible. (This also restores the +60%
`mnaBonus` output curve at endgame, which dips mid-game until gear catches up.) Magnitudes are a
`balance-sim` pass.

**D3 · Starter weapon guaranteed ≥5 attuned MNA** (the first special threshold) so the opening isn't
auto-attack-only while the floor is still 0–1.

**D4 · Delete the intrinsic-allocation subsystem.** `mnaAlloc`, `mnaPoints`, the per-level MNA roll
(`rollLevelMna`), and the never-shipped allocator UI + paid respec all go. `recalc`'s
`mna[a] = mnaAlloc[a]` becomes the derived-floor line. The Victory card surfaces "+1 MNA" only on
every 5th level.

**D5 · Clean save migration.** Bump the save version and **recompute** MNA from `floor(level/5)` + gear;
old banked intrinsic is discarded. In-flight characters re-pace toward gear; skills that fall below
threshold go **dormant** (the existing `skillUnlocked` path handles this gracefully — no crash). On the
V3 rewrite branch this is largely moot anyway (save-compat already dropped, [ADR 0018](0018-breaking-systems-rewrite-v3.md)).

**D6 · Mothball free allocation, don't design it away.** The cross-tree allocator concept is **parked**,
not deleted from the roadmap — it may return when **multi-class skill access** exists (cross-class
combo / Archon Type II). Recorded in [endgame-mechanics.md](../design/classes/endgame-mechanics.md).

## Consequences

- **Doc-first (this session):** this ADR + the canon reconciliation (`mna-progression.md`, the Class
  System Model "two progression axes" section, the `CONTEXT.md` MNA glossary, the endgame mothball
  note). No engine/version change yet.
- **Tracked follow-up (engine pass):** the `recalc` derived-floor cutover + subsystem deletion (D1/D4),
  the **gear-MNA rebalance + sim iteration** (D2 — the meaty part), the starter-weapon guarantee (D3),
  and the save-version bump (D5). Best done as a focused balance pass, landing in the V3 rewrite
  context where the breaking changes already live.
- **Player-facing shift:** leveling now governs your **body** (HP/attributes) + a small floor; **gear**
  governs your **power and kit**. Sharpens the already-canon "you are your weapon," and makes Archon a
  gear achievement rather than a grind milestone.

## Source

Dara Saadat, grill session 2026-06-30. Builds on [ADR 0019](0019-resource-economy.md) (MNA = gate, not
the spendable Resource) and reconciles [`mna-progression.md`](../design/requiem/mna-progression.md).
