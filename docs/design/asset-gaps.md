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
First explorable settlement: **Hearthford**, the Greenvale starting village (`data/towns.ts`,
rendered by `controllers/field.ts` `townMode`). All tiles/NPCs ship as gold-on-dark emoji/flat-colour
placeholders today.

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Town ground: cobble (`town-cobble`/`town-cobble2`) | Hearthford streets/plaza | flat `#6b5d44` + checker | Two-variant ground for texture (hash-picked). |
| ◐ | Town ground: grass (`town-grass`) | Hearthford verges/yards | flat `#3f6b2c` | Walkable grass under decorations. |
| ◐ | Decoration: flower bed (`town-flower`) | garden beds by the green | 🌷 emoji | Walkable. |
| ◐ | Building: Inn (`town-inn`) | walk-in Inn (free rest) | 🏠 + "Inn" label | Walk-on door tile → `Game.openInn`. |
| ◐ | Building: Market/merchant (`town-shop`) | walk-in Supplies | 🛒 + "Market" | → `Game.openMerchant`. |
| ◐ | Building: Smith (`town-smith`) | walk-in Smith (stub) | 🔨 + "Smith" | → `Game.openSmith`. |
| ◐ | Building: Revive shrine (`town-revive`) | walk-in shrine | 🔮 + "Shrine" | → `Game.openRevive`. |
| ◐ | Gate (`town-exit`) | north exit gate | 🚪 + "↑ Leave" | → `Game.confirmLeaveTown`. |
| ◐ | Decoration: fountain (`town-fountain`) | central green | ⛲ emoji | Impassable. |
| ◐ | Decoration: well (`town-well`) | beside the fountain | 🪣 emoji | Impassable. |
| ◐ | Decoration: tree (`town-tree`) | town corners/verges | 🌳 emoji | Impassable. |
| ◐ | Decoration: flavor house (`town-house`) | non-service homes (4) | 🏡 emoji | Impassable; pure flavor. |
| ◐ | Town wall (`twall`) | settlement perimeter | 🌳 / `#241f17` | Impassable border. |
| ◐ | NPC: Elder Maelis | village green | 🧓 emoji + name caption | Talk = walk into them. Sprite needed. |
| ◐ | NPC: Watchman Bram | by the north gate | 💂 emoji | Sprite needed. |
| ◐ | NPC: Little Pip (child) | west lane | 🧒 emoji | Sprite needed. |
| ◐ | NPC: Goodwife Tansy (farmer) | south fields | 👩‍🌾 emoji | Sprite needed. |
| ◐ | NPC: Innkeeper Doral | near the inn | 🧑‍🍳 emoji | Sprite needed. |
| ◐ | NPC "talk" indicator | over each NPC | 💬 emoji | Hint that an NPC is talkable. |

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
