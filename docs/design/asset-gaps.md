# Asset gaps — art to create (for Dara → the art creator)

Running list of art the build needs but doesn't have yet. Per [ADR 0006](../adr/0006-explorable-settlements-greenfield-zones.md),
the build ships against **labelled placeholders** (emoji / flat-colour fallbacks in the gold-on-dark
palette) and logs every gap here so Dara can hand it to the art creator in one batch. Real art is
sliced from Dara's reference sheets via `app/tools/slice-art.py` (art is Dara's lane) and registered
in `data/art.ts` (resolves via `core/assets.ts`).

**How to use:** when a build introduces a new tile kind / NPC / building / sprite that lacks art,
add a row here (what · where used · placeholder in use · notes). Check off when the real asset lands.

## Legend
- **Status:** ☐ needed · ◐ placeholder shipped · ☑ real art landed

---

## Settlements & NPCs (ADR 0006)
| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| | _(filled in as the greenfield Greenvale settlement is built)_ | | | |

## Field tiles & zones
| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| | _(filled in as bespoke zone layouts add tile kinds)_ | | | |

## Enemies & bosses
| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| | _(filled in as the bestiary expands)_ | | | |

---

*Keep this list current as each region is built. The art pass happens after, in one go.*
