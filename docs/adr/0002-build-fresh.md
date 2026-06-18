# Build fresh, no engine code reuse

The starting intent was to seed this POC from a prior, separate round-based turn-based RPG
engine the author had already built (a Wizardry-style dungeon crawler). After locking ATB
combat (ADR 0001) and a Final-Fantasy field/zone structure (explicitly *not* a dungeon
crawl), we chose to **build a fresh codebase** rather than fork or port that engine.

**Why this is surprising:** that engine already had working, tested loot / progression /
status systems, so the obvious move is to reuse it. We deliberately did not copy its code.

**Trade-off:** we give up proven, tested code and re-implement those mechanics. We accepted
that because the prior engine is round-based and dungeon-shaped (floors, expedition loop,
light, escalation, camp), and retrofitting ATB + FF zones onto it would mean fighting
inherited assumptions the whole way. Its *systems* are honored at the **concept level**
(loot rarity + affix rolls, the five-stat model, the status substrate, and the
modular / test-driven / single-file-build discipline), re-implemented clean for this game —
not lifted verbatim.
