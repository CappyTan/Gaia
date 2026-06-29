# ADR 0017 — Dev test harness reuses the live run-state behind a `testMode` flag

**Status:** accepted (2026-06-29). A development/QA-only mode ("Test Loop") that drops a chosen party
into a configurable fight → loot → equip loop so the team can exercise combat, the affinity ring,
loot/affix rolls, progression, and the MNA allocator without playing through the overworld. Built
entirely on the *shipping* systems so that testing the harness = testing the game.

## Context

The team wants a fast way to stress-test the mechanics: pick a party, fight progressively harder real
enemies, simulate loot at a chosen level, equip it, and repeat — skipping the overworld grind.

The hard constraint: `Battle` and the equip/inventory menus read `Game.party`, `Game.inventory`, and
`Game.gold` **directly**. There is no seam to hand them a separate party. So the harness can either:

- **(a)** stand up a parallel state container (`testParty`/`testInventory`/…) and **fork** the battle +
  menu controllers to read from it, or
- **(b)** **borrow** the live run-state container that those controllers already read.

Borrowing collides with three shipping behaviors that assume a real run: `saveNow()` autosaves after
every fight/equip; a party wipe calls `Game.gameOver()`, which **clears the save** and returns to title;
and `continueAfterBattle` routes a victory back to the field.

## Decision

**Borrow the live run-state, gated by a single `Game.testMode` flag** — not a parallel container. While
`testMode` is set:

1. **`saveNow()` early-returns** — the harness **never** touches the `localStorage` save slot, so a
   player's real Continue run is untouched by a test session.
2. **A wipe returns to the loop menu** instead of calling `gameOver()` (no save-clear, no kick to title).
3. **A victory routes back to the loop menu** instead of the field.

Entering the harness leaves any existing real save completely alone (it is never written). Exit-to-title
clears `testMode` and the borrowed party.

We rejected the parallel-container alternative (a): it would fork `Battle` and the menus — a large,
drift-prone duplication of shipping controllers — to serve a dev-only tool. Borrowing keeps the harness
exercising the *exact* code the game ships.

## Consequences

- **The harness is honest by construction.** Enemies come from `makeEnemy` on real bestiary keys, loot
  from `rollDrop` / `rollItemAtLevel`, stats from the real progression growth, equip through the real
  paper-doll menus. No invented balance math (see the bestiary level-seeding open question in DESIGN.md —
  the harness can only climb by drawing real bestiary entries until that is reworked).
- **Shipping controllers gain a dev-mode branch.** `saveNow`, `gameOver`, and the victory route each
  check `testMode`. This is the one surprising bit a future reader would question — hence this ADR. Keep
  the branches small and clearly commented; do not let `testMode` logic spread beyond these seams.
- **Real saves are safe.** Because the harness never writes the slot, there is no migration/corruption
  risk to the player's run from a test session.
- **Loot percentile readout** (within-rarity headline + overall, via Monte-Carlo over the *same* roll
  faucet, scored by `itemScore`) is a harness-only presentation layer — pure, no engine change.
- **Not a player feature.** Lives on the title screen beside Data/Telemetry. If it is ever promoted to a
  real player mode, the persistence story (currently: deliberately none) must be revisited.

## Instrumentation — `BattleLog` + dashboard (harness-only)

The harness captures **granular per-action battle telemetry** for later tuning analysis — a different
shape from the shipping `Telemetry` service, which records session **aggregates** (sums of dmg/crits/
affinity/drops). Decisions:

- **A dedicated `BattleLog` buffer, gated by `testMode`** — *not* an extension of shipping `Telemetry`.
  Per-action data is heavy; keeping it harness-only means **zero cost in real play** (no storage/perf hit
  for players) and no schema bloat on the aggregate format the `telemetry-analyst` already consumes.
- **Captured at the `battle.ts` seams** (the same controller layer that already calls `Telemetry.dmg`),
  so `systems/combat` stays pure (no telemetry import in the logic layer). Records a per-action event
  stream — `{turn, actor, ability, target, rawDmg, affinityMult, crit, status, hpBefore/After, atb}` —
  under a per-fight context header (enemy keys/levels/attunements/affixes, party comp + gearScore, spawn
  config, outcome). Per-fight summaries roll up from the stream.
- **In-memory per harness session**, capped at the last N fights as a backstop; exported on demand (Copy/
  Download JSON, reusing the Telemetry export plumbing). Deliberately **not** persisted across sessions in
  v1 — it dies on exit-to-title.
- **A `Battle Log` dashboard** (loop-menu only) renders the session aggregate + a per-fight list, with a
  drill-down into each fight's action timeline.
- **Downstream consumer.** The raw `BattleLog` JSON is a new format; the `telemetry-analyst` agent (or a
  new analyzer) must learn it — it is not the shipping session-aggregate schema.
