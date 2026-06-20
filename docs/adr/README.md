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
