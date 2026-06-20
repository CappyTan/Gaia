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

### Riverhearth — the Trade Capital (ADR 0006, first true CITY)
Third settlement and Gaia's **first real city** (`data/towns.ts` `RIVERHEARTH`, `theme: "city"`,
rendered by `controllers/field.drawTownCell`). A large (48×30, camera-scrolled), dense capital built
around a **river crossed by two bridges**, with four readable districts: a **docks/riverfront** (wharf
planks + warehouses), a **civic/keep** quarter (grand halls + statue), a **market square** (stalls +
fountain/well), and a **residential quarter** (rows of townhouses), all knit by grand **avenues**.
Wants its OWN warm-but-bustling gold-on-dark city tileset (lamplit paved streets, banners, a bright
river). All ship as placeholders today.

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Town ground: grand avenue (`town-avenue`) | Riverhearth spine streets | flat `#8a7a54` | The wide paved boulevards; the city's main routes. Walkable. |
| ◐ | River (`town-river`) | the river down the city's centre | flat `#2f5b7a` + faint ripple | **Impassable water.** Crossed only by bridges; bridges keep both banks reachable. |
| ◐ | Bridge (`town-bridge`) | the two river crossings | flat `#7a6a48` | Walkable span over the river. Wants an arched-stone-bridge sprite. |
| ◐ | Dock/wharf (`town-dock`) | riverfront, north reach | flat `#5a4a30` | Walkable plank wharf along the water; where barges tie up. |
| ◐ | Building: grand hall (`t-grand`) | dock warehouses + civic/keep | 🏛️ emoji | Impassable; the big civic/trade structures. |
| ◐ | Building: townhouse (`t-townhouse`) | residential quarter (12 blocks) | 🏘️ emoji | Impassable; the city's homes. |
| ◐ | Building: market stall (`t-stall`) | market square | ⛺ emoji | Impassable; awning stalls of the trade heart. |
| ◐ | Decoration: civic statue (`t-statue`) | the civic plaza | 🗽 emoji | Impassable; a monument on a grassy plinth. |
| | _(reused: `t-inn`/`t-shop`/`t-smith`/`t-revive`/`t-exit` + `town-cobble`/`town-grass`/`t-fountain`/`t-well`/`t-tree` share existing sprites — the shop labels "Exchange" and the gate "↑ North Road" in the city)_ | Riverhearth services + plaza | as Hearthford | A warm capital re-skin is a nice-to-have, not a blocker. |
| ◐ | NPC: Town Crier Edda | upper avenue | 📢 emoji + name | Sprite needed. Warm-but-bustling capital lines (placeholder → narrative-writer). |
| ◐ | NPC: Dockhand Garrow | the wharves | 🧑‍🏭 emoji | Sprite needed. |
| ◐ | NPC: Guildmaster Veska | merchant quarter | 🧑‍💼 emoji | Sprite needed. |
| ◐ | NPC: Captain Aldric (guard) | by the civic hall | 🛡️ emoji | Sprite needed. |
| ◐ | NPC: Tam & Nessa (children) | by the market fountain | 🧒 emoji ×2 | Sprites needed. |
| ◐ | NPC: Ferryman Old Pell | by the river | 🧓 emoji | Sprite needed. |
| ◐ | NPC: Lady Corvin (noble) | residential quarter | 👸 emoji | Sprite needed. |
| ◐ | NPC: Joss the Busker | market square | 🎻 emoji | Sprite needed. |
| ◐ | NPC: Marda the Fishwife | east dock | 🐟 emoji | Sprite needed. |

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

### Greenfield **Silverwood overworld** — the ancient-forest dressing (ADR 0006)
Silverwood (Aurelion region #2, the Ancient Forest; game zone index 1, inserted between Greenvale and
the Duskmarsh) reads DENSER + DARKER than the open shire: the renderer (`field.draw`, gated on
`Field.isForest()` = zone env leads with "forest") remaps the carved generic kinds to old-growth
grove sprites, sibling to the marsh's `isMire()` remap. The winding root-trail layout + heavier
scatter (`scatter: 0.09`) do the "old, hushed, close" feel; the new kinds give it its skin. East of
the Elder Treant's gate, the **Sunless Grove** dungeon uses a NEW `grove` dungeon tileset prefix
(`grove-floor`/`grove-floor2`/`grove-path`/`grove-wall`/`grove-rock`/`grove-chest`/`grove-entrance` —
loaded by `DUNGEON_SETS[1]`; falls back to flat dungeon colours until sliced). New OVERWORLD forest
kinds (placeholders today):

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Grove ground (`grove-ground`/`grove-ground2`) | Silverwood open ground (remap of `grass`) | flat `#2e4a26` + deep canopy shade | Mossy walkable forest floor; two-variant for texture (hash-picked). |
| ◐ | Root trail (`grove-path`) | Silverwood roads (remap of `path`) | falls back to grove-ground fill | The root-worn trail the player winds along east. |
| ◐ | Ancient tree (`oldtree`) | Silverwood walls (remap of `tree`) | 🌲 emoji on grove-ground | Towering old-growth trunk — the forest wall + the gate chokepoint. Wants a darker/denser look than Greenvale's `tree`. |
| ◐ | Fern clump (`fern`) | Silverwood scatter (remap of `bush`) | 🌿 emoji | Walkable decoration. |
| ◐ | Mushroom (`mushroom`) | Silverwood scatter (remap of `rock`) | 🍄 emoji | Walkable decoration. |

Plus a NEW dungeon tileset for the **Sunless Grove** (`grove-*`, see above) — a hollowed-heartwood
crawl distinct from the `warren` (Bandit Warren) and `vault` (Drowned Vault) sets. The `lair` tile is
reused for the Mossback Tortoise's den in the southern mossbed (same overworld den/burrow sprite as
Hogger's; no new art).

## Enemies & bosses
The **Silverwood roster** (Dara's new bestiary, `data/enemies.ts`) ships as emoji placeholders until
sliced. Attunements are SPREAD across the ring (no region theme). Names/lore flagged for
requiem-canon-keeper to vet.

| Status | Asset | Where used | Placeholder | Notes |
|---|---|---|---|---|
| ◐ | Direwolf (`dwolf`) | Silverwood random | 🐺 emoji | ANIMA, fast pack beast (the teach enemy). |
| ◐ | Thornling (`thornling`) | Silverwood random | 🌿 emoji | QUANTA, poison-on-hit plant. |
| ◐ | Sylvan Archer (`sylvanarcher`) | Silverwood random | 🏹 emoji | SOL, high-ATK skirmisher. |
| ◐ | Gloom Wisp (`gloomwisp`) | Silverwood random | 🔮 emoji | UMBRAXIS caster (`hex`). |
| ◐ | Barkhide Brute (`barkbrute`) | Silverwood random | 🪵 emoji | NOX, tanky armored bruiser. |
| ◐ | Spriggan (`spriggan`) | Silverwood random | 🍂 emoji | SOL, life-leech attacker. |
| ◐ | Elder Treant (`treantelder`) | Silverwood mini-boss (the gate) | 🌳 emoji | ANIMA mini-boss; gate to the Sunless Grove. |
| ◐ | The Hollow King (`hollowking`) | Silverwood boss (grove arena) | 🦌 emoji | QUANTA zone boss. |
| ◐ | Mossback Tortoise (`mossback`) | Silverwood rare (grove lair + random) | 🐢 emoji | ANIMA ultra-rare, huge armor / huge XP (Metal-Slime tier). |
| | _(more filled in as the bestiary expands)_ | | | |

---

*Keep this list current as each region is built. The art pass happens after, in one go.*
