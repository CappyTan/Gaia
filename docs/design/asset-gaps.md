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

### Miregard — the Duskmarsh marsh-edge outpost (ADR 0006)
Second settlement, the **between-zones hub before the Duskmarsh** (`data/towns.ts` `MIREGARD`,
`theme: "marsh"`, rendered by `controllers/field.drawTownCell`). A grim half-drowned stockade on
stilts — plank boardwalks over black bog, lantern-lit, fog-bound. Wants its OWN gold-on-dark-but-cold
tile set (distinct from sunny Hearthford). All ship as placeholders today.

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Town ground: plank boardwalk (`town-plank`) | Miregard streets/causeway | flat `#4a4030` | The walkable surface (over bog). Cold, weathered wood. |
| ◐ | Town ground: bog (`town-bog`) | Miregard under decorations/edges | flat `#23303a` | Impassable black water; the negative space the planks cross. |
| ◐ | Building: stilt-house (`t-stilt`) | Miregard flavor homes (4) | 🛖 emoji | Impassable; huts raised over the bog. |
| ◐ | Decoration: dead/marsh tree (`t-deadtree`) | Miregard corners/edges | 🌲 emoji | Impassable; bare/drowned timber. |
| ◐ | Decoration: lantern post (`t-lantern`) | Miregard, flanking the walks | 🏮 emoji | Impassable; the only warm light in the fog. |
| | _(reused: `t-inn`/`t-shop`/`t-smith`/`t-revive`/`t-exit` buildings + walls share Hearthford's POI sprites for now — a marsh-styled re-skin would sell the grim tone)_ | Miregard services + gate | as Hearthford | Exit label reads "→ Marsh". A cold re-skin is a nice-to-have, not a blocker. |
| ◐ | NPC: Marsh-Warden Coll | by the east gate causeway | 🪖 emoji | Sprite needed. Dread-tinged lines (placeholder → narrative-writer). |
| ◐ | NPC: Old Mother Sedge (bog-healer) | near the shrine | 🧙 emoji | Sprite needed. |
| ◐ | NPC: Stranded Jeb (trader) | by the market | 🧑‍🌾 emoji | Sprite needed. |
| ◐ | NPC: Wynn the Bog-Fisher | on the spine causeway | 🧓 emoji | Sprite needed. |

## Field tiles & zones
Greenfield **Greenvale overworld + Bandit Warren** (ADR 0006): the zone is now carved from a bespoke
`ZoneLayout` (`data/zones.ts`) by `controllers/field.genMap` — clearings, winding roads, branch
pockets, a chokepoint gate, dungeon rooms. Existing kinds reuse their art; the one genuinely new kind
is the rare-monster lair tile.

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Rare-monster lair (`lair`) | Greenvale southern grove (Hogger's den) | 🕳️ emoji on grass | Walk-on tile → starts the zone's rare fight (`Field.enterLair`). Wants a den/burrow sprite (overworld) — and a dungeon variant later if a dungeon ever hosts one. Sits on grass; removing it never strands the player. |

Re-used existing field kinds the bespoke layouts lean on harder now (no new art needed, noted for
context): `grass`/`grass2` (clearings), `path` (carved roads/corridors), `tree` (forest/room walls +
the gate chokepoint), `bush`/`rock` (walkable scatter decoration), `chest`, `miniboss` (gate guardian,
still 🪖 emoji), `boss`, and the `warren`/`vault` dungeon tilesets east of the gate.

### Greenfield **Duskmarsh overworld** — the mire dressing (ADR 0006)
The Duskmarsh overworld now reads as a grim mire: the renderer (`field.draw`, gated on
`Field.isMire()` = zone env leads with "mire") remaps the carved generic kinds to marsh sprites, and
the layout adds hard-blocking standing-water pools that pinch the causeway. East of the gate the
**Drowned Vault** reuses the existing `vault` dungeon tileset (no new art). New OVERWORLD marsh kinds
(placeholders today):

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Standing water (`water`) | Duskmarsh pools framing the causeway | 🌊 emoji on `#23303a` | **Hard wall** (blocks movement + flood-fill, like `tree`). Authored to pinch, not sever; the soft-lock flood-fill guarantees it never strands a required tile. |
| ◐ | Mire ground (`mire-ground`/`mire-ground2`) | Duskmarsh open ground (remap of `grass`) | flat `#3a4030` + grim wash | Boggy walkable earth; two-variant for texture (hash-picked). |
| ◐ | Mire causeway (`mire-path`) | Duskmarsh roads (remap of `path`) | falls back to mire-ground fill | The plank/dry causeway the player follows east. |
| ◐ | Dead tree (`deadtree`) | Duskmarsh walls (remap of `tree`) | 🌫️ emoji on mire-ground | Bare/drowned timber — the marsh's forest wall + the gate chokepoint. |
| ◐ | Reed clump (`reed`) | Duskmarsh scatter (remap of `bush`) | 🌾 emoji | Walkable decoration. |
| ◐ | Bog tuft (`bog`) | Duskmarsh scatter (remap of `rock`) | 🪨 emoji | Walkable decoration. |

## Enemies & bosses
| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| | _(filled in as the bestiary expands)_ | | | |

---

*Keep this list current as each region is built. The art pass happens after, in one go.*
