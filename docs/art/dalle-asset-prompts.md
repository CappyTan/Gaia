# DALL-E prompt pack — generating Gaia's missing art

Built from `docs/design/asset-gaps.md`. DALL-E makes **one image per prompt** and can't output many
separate transparent sprites at once, so: prepend the **STYLE BLOCK** to every prompt, run **one group
at a time**, then knock out the magenta background (→ transparent PNG) and save each piece by its
**filename** (the game loads by exact name).

- Field tiles / POIs / stairs → `app/assets/field/<key>.png`
- Enemies/bosses → `app/assets/enemies/<key>.png`
- NPC sprites need a small code-wiring pass (not pure drop-in) — do tiles + enemies first.

---

## STYLE BLOCK (paste before every prompt)

> Hand-painted 2D fantasy RPG art in the mood of a classic 16-bit JRPG (Final Fantasy VI) reimagined
> with modern painterly rendering — rich, moody, "gold on dark." Cohesive set: identical lighting, line
> weight, and saturation across every asset. Palette: deep near-black charcoal base, warm antique-gold
> highlights (#e0a92e / #f4d27a), muted earthy tones (mossy greens, bog olive, weathered wood, cold
> slate), with restrained luminous accents only where a magic power shows — solar gold #f4b942, cold
> teal #7ad0c0, life-green #7ad06b, arcane violet #b46bff, void grey #9a9aa8. Lay the assets out as a
> neat grid of equal square cells on a FLAT pure-magenta (#FF00FF) background (no gradient, no shadows
> on the magenta), each item centered with a small margin so the background can be cleanly removed. No
> text, no labels, no letters, no watermark, no UI frames.

---

## 1 — Wetland (marsh) terrain tiles — top-down, seamlessly tileable squares
> [STYLE BLOCK] … A 2×3 grid of top-down, seamlessly tileable square terrain tiles for a grim drowned
> marsh: (1) boggy walkable earth, dark olive, wet; (2) a second variant of that boggy earth; (3) a
> weathered grey plank-board causeway / dry boardwalk path — clearly a raised walkable road; (4) black
> still standing water, deep and impassable; (5) a bare drowned dead tree stump, leafless, as an
> impassable wall; (6) a clump of marsh reeds.

Files: `mire-ground.png`, `mire-ground2.png`, `mire-path.png`, `water.png`, `deadtree.png`, `reed.png`
(plus `bog.png` — a small bog tuft, if you generate a 7th).

## 2 — Forest, orchard & meadow terrain tiles — top-down, tileable squares
> [STYLE BLOCK] … A 3×3 grid of top-down, seamlessly tileable square terrain tiles: (1) mossy
> old-growth forest floor, deep shade; (2) a variant of it; (3) a root-worn dirt forest trail (walkable
> path); (4) a towering ancient dark tree trunk seen from above, impassable wall; (5) a fern clump; (6)
> a cluster of mushrooms; (7) tended orchard grass; (8) a laden green fruit tree from above (wall); (9)
> golden wind-rippled wheat meadow.

Files: `grove-ground.png`, `grove-ground2.png`, `grove-path.png`, `oldtree.png`, `fern.png`,
`mushroom.png`, `orchard-ground.png`, `orchard-tree.png`, `meadow-ground.png` (+ `meadow-ground2.png`,
`orchard-ground2.png`, `wheat.png` as a follow-up batch).

## 3 — Geography crossings, map props & dungeon stairs — top-down, tileable squares
> [STYLE BLOCK] … A 3×4 grid of top-down square tiles/props: (1) a rocky cliff / ridge face, grey
> stone, impassable wall; (2) a winding flowing river-water tile, blue, impassable; (3) a wooden
> plank-bridge span over water, walkable; (4) a shallow pale stepping-stone ford crossing; (5) a small
> dark burrow/den mouth in the earth; (6) a roadside stone shrine with a faint gold glow; (7) a small
> bandit encampment: two tents and a campfire; (8) ancient standing stones / a small ruin; (9) a
> wooden crossroads signpost; (10) a heavy treasure chest, iron-bound, gold trim; (11) a stone
> stairway descending into darkness (top-down); (12) a stone stairway climbing up.

Files: `cliff.png`, `river.png`, `bridge.png`, `ford.png`, `lair.png`, `shrine.png`, `camp.png`,
`landmark.png`, `signpost.png`, `chest.png`, then per dungeon skin: `warren-stairsdown.png` /
`warren-stairsup.png` (and `vault-` / `grove-` variants — re-run recolored for each).

## 4 — Town tilesets — top-down, tileable squares (run once per town theme)
**Hearthford (warm farm village):**
> [STYLE BLOCK] … A 3×4 grid of top-down village tiles: cobblestone street; a grass verge; a flower
> bed; a thatched inn building with a door; a market stall/shop; a blacksmith forge; a small shrine; a
> wooden gate; a stone fountain; a well; a leafy tree; a thatched cottage.

Files: `town-cobble.png`(+`town-cobble2`), `town-grass.png`, `town-flower.png`, `town-inn.png`,
`town-shop.png`, `town-smith.png`, `town-revive.png`, `town-exit.png`, `town-fountain.png`,
`town-well.png`, `town-tree.png`, `town-house.png`.

**Miregard (grim marsh stockade) —** plank boardwalk, black bog, a stilt-house on poles, a drowned
dead tree, a lantern post: `town-plank.png`, `town-bog.png`, `t-stilt.png`, `t-deadtree.png`,
`t-lantern.png`.

**Riverhearth (lamplit trade city) —** a wide paved avenue, a city river, an arched stone bridge, a
plank dock/wharf, a grand stone hall, a townhouse, an awning market stall, a civic statue:
`town-avenue.png`, `town-river.png`, `town-bridge.png`, `town-dock.png`, `t-grand.png`,
`t-townhouse.png`, `t-stall.png`, `t-statue.png`.

## 5 — Enemy & boss sprites — single creature, facing RIGHT, soft ground shadow
> [STYLE BLOCK] … BUT each cell shows a single full-body creature facing RIGHT (toward the player's
> party, which stands to the creature's right — enemies sit on the LEFT of the battle screen, so they
> must face RIGHT to look toward the party, no horizontal flip needed), painterly and characterful,
> with a soft ground shadow, on flat magenta. A 3×4 grid:
> **Silverwood forest foes** — (1) a lean grey direwolf [life-green]; (2) a thorny plant-creature
> [violet]; (3) a sylvan elf archer [gold]; (4) a floating ghostly gloom-wisp [void grey]; (5) a
> hulking bark-skinned brute [teal]; (6) a gnarled spriggan twig-imp [gold]; (7) a colossal ancient
> treant (mini-boss) [life-green]; (8) a regal antlered Hollow King with a hollow skull face (boss)
> [violet]; (9) a giant armored mossback tortoise (rare) [life-green]. **Bandit Warren** — (10) a
> cruel knife-fighter bandit lieutenant, "Bloodknife" [life-green].

Files: `dwolf.png`, `thornling.png`, `sylvanarcher.png`, `gloomwisp.png`, `barkbrute.png`,
`spriggan.png`, `treantelder.png`, `hollowking.png`, `mossback.png`, `lieutenant.png`.

**Goldmeadow war-host (second enemy sheet):** a rust-bladed plains raider, a fast field marauder, a
sling harrier, a wild dog, a carrion bird, an armored iron reaver, a raider war-captain, a hulking
Reaping Warlord boss (+ a fearsome "omega" enraged form of him), a giant gilded sow (rare):
`raider.png`, `marauder.png`, `harrier.png`, `wilddog.png`, `carrion.png`, `reaver.png`,
`warcaptain.png`, `warlord.png`, `warlord-omega.png`, `goldsow.png`.

## 6 — Town NPC sprites — single figure, ¾ top-down, facing viewer, soft shadow
> [STYLE BLOCK] … BUT each cell shows a single full-body villager in ¾ top-down view facing the
> viewer, with a soft shadow. **Hearthford:** a kindly old village elder; a watchman in leather; a
> small child; a farmer woman in an apron; a plump innkeeper. **Miregard:** a grim marsh-warden in a
> hood; an old bog-healer crone; a stranded merchant; an old bog-fisher. **Riverhearth:** a town
> crier; a dockhand; a well-dressed guildmaster; an armored city guard captain; two children; an old
> ferryman; a noble lady; a street musician; a fishwife.

NPC sprites need a small wiring pass (the game renders NPCs as emoji today), so save these but flag
them as "needs code wiring" — do the tiles (1-4) and enemies (5) first; those are pure drop-in.

---

# NEW ART — the Aurelion towns + the five later regions (v0.102–0.103 content)

The seven Dara-named front-door towns are built and the five later regions (Storm Coast → Sunbridge)
are playable, but most still run on placeholder art: the towns borrow Hearthford's tiles, the later
foes are emoji, and the new biomes/dungeons have no skins. This pack covers all of it. **Priority for
pure drop-ins (light up with no code change): §8 enemies first, then §9 biome tiles + §10 dungeon
skins.** §7 town tilesets and §11 NPCs need a small wiring pass (new tile-kinds / the emoji→sprite
swap), like Miregard's and Riverhearth's kinds did.

## 7 — Seven regional town tilesets — top-down, tileable squares (run once per town)
Each is a new town theme — give it to the Field renderer the way Miregard's plank/bog and Riverhearth's
avenue/dock kinds were wired. Filenames are town-prefixed so the seven inns/walls/etc. don't collide.

**Elderbough (ancient-forest hamlet, life-green accents) —**
> [STYLE BLOCK] … A 3×4 grid of top-down village tiles for a hamlet among giant ancient trees, deep
> green shade: (1) a mossy root-worn forest path; (2) a fern-and-moss verge; (3) a towering old-growth
> tree-trunk palisade wall (impassable); (4) a timber forest-lodge inn built around a living trunk,
> lit window, chimney smoke; (5) a forager's bough-stall hung with baskets of roots and mushrooms; (6)
> an open-air forge under a mossy lean-to, glowing embers; (7) a moss-grown root-shrine — a standing
> stone wreathed in roots, faint green glow; (8) a root-arch gateway (a gap through the great trees,
> walkable); (9) the great Elder-Oak, a colossal ancient oak (impassable landmark); (10) a mossy stone
> well; (11) a lantern post haloed with drifting moths; (12) a fern-and-mushroom clump.

Files: `eb-path.png`, `eb-verge.png`, `eb-wall.png`, `eb-inn.png`, `eb-shop.png`, `eb-smith.png`,
`eb-shrine.png`, `eb-gate.png`, `eb-eldertree.png`, `eb-well.png`, `eb-lantern.png`, `eb-fern.png`

**Wheatcross (burning breadbasket crossroads, warm gold with scorch) —**
> [STYLE BLOCK] … A 3×4 grid: (1) a rutted packed-dirt cart-road; (2) a trodden golden-wheat-stubble
> verge; (3) a stacked-haybale-and-fieldstone perimeter wall; (4) a low thatched farmhouse inn,
> warm-lit; (5) a market under a patched awning, sacks and crates; (6) a farrier's smithy, anvil and
> horseshoes; (7) a humble field-shrine, a corn-dolly and a candle on a stone; (8) a timber farm-gate;
> (9) a great grain-rick / haystack, one of them half-burnt and smoking (impassable); (10) a stone
> village well with a bucket; (11) a scarecrow on a post; (12) a stack of grain-sacks.

Files: `wc-road.png`, `wc-verge.png`, `wc-wall.png`, `wc-inn.png`, `wc-shop.png`, `wc-smith.png`,
`wc-shrine.png`, `wc-gate.png`, `wc-rick.png`, `wc-well.png`, `wc-scarecrow.png`, `wc-sacks.png`

**Wrackport (storm-coast wreckers' harbor, cold slate + teal, grey sea) —**
> [STYLE BLOCK] … A 3×4 grid: (1) wet grey cobbles slick with spray; (2) a weathered plank boardwalk;
> (3) a piled storm-breakwater wall of dark sea-rocks (impassable); (4) a salt-bleached harbor inn with
> a swinging lantern; (5) a fishmonger's stall, crates of fish and nets; (6) a ship-chandler's forge,
> anchor-chains and iron; (7) a driftwood shrine, a fishing-float and a candle; (8) a harbor gate of
> lashed timber; (9) cold choppy grey SEA water (impassable harbor edge); (10) a stone jetty / dock
> plank over the water (walkable); (11) a leaning mooring-post strung with net; (12) a heap of
> barnacled wreckage / a broken hull-rib.

Files: `wp-cobble.png`, `wp-boardwalk.png`, `wp-wall.png`, `wp-inn.png`, `wp-shop.png`, `wp-smith.png`,
`wp-shrine.png`, `wp-gate.png`, `wp-sea.png`, `wp-dock.png`, `wp-mooring.png`, `wp-wreck.png`

**Frosthold (dwarven mountain hold-gate, cold slate + snow, warm forge-gold) —**
> [STYLE BLOCK] … A 3×4 grid: (1) a swept flagstone floor dusted with snow; (2) a packed-snow verge;
> (3) a massive dwarf-cut ashlar stone wall (impassable); (4) a stout stone-and-iron hold-inn, runes
> over the door, warm glow; (5) a stall hewn into the rock, ore and goods; (6) a great dwarven forge,
> anvil and gold sparks; (7) a deep-stone shrine, a carved rune-stone with a gold glow; (8) an
> iron-banded stone hold-gate; (9) a vast forge-hearth brazier, the never-cold fire (impassable
> landmark); (10) a carved stone well / cistern; (11) a squat carved stone pillar; (12) a stack of
> ore-baskets and pick-tools.

Files: `fh-floor.png`, `fh-snow.png`, `fh-wall.png`, `fh-inn.png`, `fh-shop.png`, `fh-smith.png`,
`fh-shrine.png`, `fh-gate.png`, `fh-hearth.png`, `fh-well.png`, `fh-pillar.png`, `fh-ore.png`

**Lastlight (last frontier garrison, grim timber + cold dusk, one bonfire glow) —**
> [STYLE BLOCK] … A 3×4 grid: (1) a muddy churned-earth parade ground; (2) a frost-bitten grass verge;
> (3) a sharpened timber palisade wall (impassable); (4) a rough garrison barracks-inn, shuttered,
> lamp-lit; (5) a quartermaster's supply stall, crates and spears; (6) an armorer's forge, war-gear and
> whetstones; (7) a soldier's shrine, a helm on a spear over a stone; (8) a reinforced timber
> watch-gate; (9) a great watch-bonfire on a stone ring, the never-dying fire (impassable landmark);
> (10) a stone well with an iron cover; (11) a watchtower base / signal-brazier post; (12) a stack of
> shields and a war-banner.

Files: `ll-ground.png`, `ll-verge.png`, `ll-wall.png`, `ll-inn.png`, `ll-shop.png`, `ll-smith.png`,
`ll-shrine.png`, `ll-gate.png`, `ll-bonfire.png`, `ll-well.png`, `ll-tower.png`, `ll-shields.png`

**Vesperhal (hillside cloister, pale stone + green hills, hushed candle-gold) —**
> [STYLE BLOCK] … A 3×4 grid: (1) a worn pale-flagstone cloister walk; (2) a tended herb-garth grass
> verge; (3) a low pale monastery wall (impassable); (4) a stone guest-house inn, arched door,
> candlelit; (5) a cellarer's stall of bread, herbs and tallow; (6) a modest cloister forge, tools and
> a small anvil; (7) the true shrine — a stone altar-well with a soft gold glow; (8) a pale stone
> cloister arch-gate; (9) a slender bell-tower with a hanging vesper bell (impassable landmark); (10) a
> herb-garth shrine-well; (11) a dark cypress tree; (12) a bed of pale flowers and a kneeling-stone.

Files: `vh-flag.png`, `vh-garth.png`, `vh-wall.png`, `vh-inn.png`, `vh-shop.png`, `vh-smith.png`,
`vh-shrine.png`, `vh-gate.png`, `vh-bell.png`, `vh-well.png`, `vh-cypress.png`, `vh-flowers.png`

**Sunpier (besieged archipelago port, sun-bleached stone over bright blue-teal sea) —**
> [STYLE BLOCK] … A 3×4 grid: (1) sun-warmed pale harbor flagstones; (2) a palm-and-grass verge; (3) a
> great pale sea-wall of fitted stone (impassable); (4) a bright portside inn, balconies and lanterns;
> (5) a busy quay market under striped awnings; (6) a shipwright's forge, chains and brass; (7) a
> sun-shrine, a gilded sea-disc on a pillar; (8) a grand harbor arch-gate; (9) brilliant sun-glittered
> SEA water (impassable); (10) a great stone pier / wharf plank over the water (walkable); (11) a tall
> harbor lighthouse-lamp post; (12) coiled hawsers, crates and a furled sail.

Files: `sp-flag.png`, `sp-verge.png`, `sp-wall.png`, `sp-inn.png`, `sp-shop.png`, `sp-smith.png`,
`sp-shrine.png`, `sp-gate.png`, `sp-sea.png`, `sp-pier.png`, `sp-lamp.png`, `sp-cargo.png`

## 8 — Later-region enemy & boss sprites — single creature facing RIGHT, soft shadow (pure drop-in)
As §5 (one creature per cell facing RIGHT toward the party, soft ground shadow, flat magenta; the file
key = the enemy id). **Bosses that reuse a minion's art need NO separate sprite:** Wrecker-Captain =
Coast Wrecker, Hold-Warden = Dwarven Sentinel, Fallen Watch-Commander = Broken Sentry, Siege Captain =
Siege Trooper, Corrupted Abbot = Corrupted Monk.

**Storm Coast (sea-cave wreckers):**
> [STYLE BLOCK] … BUT each cell a single creature facing RIGHT, soft shadow. A 2×3 grid: (1) a
> hook-handed Coast Wrecker in oilskins [teal]; (2) a lithe Tide Cutthroat with twin knives [gold]; (3)
> a Pirate Slinger whirling a sling [violet]; (4) a boat-sized armored Reef Crab [life-green]; (5) a
> coiling eel-like Brine Serpent [void grey]; (6) (leave blank).

Files: `wrecker.png`, `cutthroat.png`, `deckhand.png`, `shellcrab.png`, `seaserpent.png`

**Frostpeak (frozen dwarven stronghold):**
> [STYLE BLOCK] … (facing RIGHT). A 3×4 grid: (1) a lean white Ice Wolf [violet]; (2) an axe-wielding
> Mountain Reaver in furs [teal]; (3) a drifting Frost Shade, a robed ice-wraith [void grey]; (4) a
> Dwarven Sentinel, an animated rune-carved stone statue [gold]; (5) a shaggy white Snow Troll
> [life-green]; (6) the Glacier Guardian, a towering being of living glacier-ice (boss) [teal]; (7) its
> enraged "omega" form, a colossus of jagged ice [teal]; (8) a Crystal Stalker, a crystalline ice-beast
> bristling with blue shards (rare) [void grey].

Files: `icewolf.png`, `mtnreaver.png`, `frostshade.png`, `stonesentinel.png`, `snowtroll.png`,
`frostguardian.png`, `frostguardian-omega.png`, `crystalbeast.png`

**Dawnfall Hold (the fallen watch):**
> [STYLE BLOCK] … (facing RIGHT). A 2×3 grid: (1) a feral Frontier Stalker, a wilderness beast
> [life-green]; (2) a Broken Sentry, a dead soldier in rusted watch-armor with a poisoned spear [teal];
> (3) a Garrison Ghoul, a gaunt undead soldier [void grey]; (4) a Rampart Hulk, a massive armored
> undead bruiser [violet]; (5) a Fallen Sentry archer, a dead bowman drawing a bow [gold]; (6) (blank).

Files: `frontierbeast.png`, `brokenwatch.png`, `watchghoul.png`, `ruinhulk.png`, `fallenarcher.png`

**Whisper Hills (corrupted cloister):**
> [STYLE BLOCK] … (facing RIGHT). A 2×3 grid: (1) a Restless Wraith, a flitting ghostly monk [void
> grey]; (2) a Corrupted Monk, a hooded chanting figure with a sickly aura [life-green]; (3) a Cloister
> Flagellant, a scourge-bearing zealot [violet]; (4) a Reliquary Golem, a stone-and-bone construct
> studded with reliquaries [gold]; (5) a Crypt Revenant, a soul-draining undead [teal]; (6) (blank).

Files: `wraith.png`, `corruptmonk.png`, `flagellant.png`, `reliquarygolem.png`, `revenant.png`

**Sunbridge (the siege & the deep):**
> [STYLE BLOCK] … (facing RIGHT). A 3×4 grid: (1) a heavy-armored Siege Trooper [teal]; (2) a fast
> Sea-Raider boarder with a cutlass [gold]; (3) a Ballista Crew working a crewed bolt-thrower [violet];
> (4) an Abyssal Spawn, a small tentacled deep-horror [void grey]; (5) a Drowned Sailor, a waterlogged
> undead [life-green]; (6) a Siege Ram, a great armored battering engine on wheels; (7) the Risen
> Leviathan, a colossal tentacled deep-sea horror rising from the waves (boss) [life-green]; (8) its
> enraged "omega" form, vaster, wreathed in abyssal light [life-green].

Files: `siegetrooper.png`, `searaider.png`, `ballista.png`, `abyssspawn.png`, `drowned.png`,
`siegeram.png`, `leviathan.png`, `leviathan-omega.png`

## 9 — New overworld biome terrain tiles — top-down, seamlessly tileable squares
The later regions roam biomes with no field art yet.

**Coast & harbor (Storm Coast / Sunbridge):**
> [STYLE BLOCK] … A 3×3 grid of top-down tileable tiles: (1) wet sand/shingle beach; (2) a variant; (3)
> a damp coastal-grass headland; (4) dark sea-rock / cliff (impassable wall); (5) a foamy shallow surf
> edge; (6) deep blue-teal sea (impassable); (7) a weathered dock-plank (walkable); (8) a kelp tide-pool;
> (9) a piling / mooring post.

Files: `coast-sand.png`, `coast-sand2.png`, `coast-grass.png`, `coast-rock.png`, `coast-surf.png`,
`coast-sea.png`, `coast-dock.png`, `coast-pool.png`, `coast-piling.png`

**Snow & ice (Frostpeak):**
> [STYLE BLOCK] … A 3×3 grid: (1) wind-packed snowfield; (2) a variant with rock showing through; (3) a
> trodden snow path; (4) a sheer ice-rimed crag (impassable wall); (5) slick blue glacier ice
> (walkable); (6) a frozen black-ice pool (impassable); (7) a snow-laden pine (wall); (8) a snow cairn /
> standing stone; (9) a wind-scoured bare-rock patch.

Files: `snow-ground.png`, `snow-ground2.png`, `snow-path.png`, `snow-crag.png`, `snow-ice.png`,
`snow-frozen.png`, `snow-pine.png`, `snow-cairn.png`, `snow-rock.png`

**Ruin & stone (Dawnfall / hollow):**
> [STYLE BLOCK] … A 3×3 grid: (1) cracked broken flagstone paving; (2) a rubble-strewn variant; (3) a
> worn rampart walk (walkable path); (4) a crumbling fortress wall (impassable); (5) a tumbled rubble
> heap (wall); (6) a dead-grass courtyard verge; (7) a toppled column / broken statue; (8) a dry empty
> moat-pit (impassable); (9) a guttering ruin-brazier.

Files: `ruin-flag.png`, `ruin-flag2.png`, `ruin-walk.png`, `ruin-wall.png`, `ruin-rubble.png`,
`ruin-grass.png`, `ruin-column.png`, `ruin-pit.png`, `ruin-brazier.png`

## 10 — Six new dungeon tilesets — flat-magenta 4×2 sheets (same layout as warren/grove/vault)
One 1774×887 flat-magenta sheet per skin; every cell a full-bleed painted 384px scene tile in the
fixed layout the slicer expects — **row0: floor · floor2 · path · wall   row1: rock · chest · entrance
· ‹deco›**. Add each skin (and its deco name) to `DUNGEON_SETS` / `DECO` in `slice-art.py`, then it
slices to `‹skin›-floor.png … ‹skin›-entrance.png` + the deco automatically.

| skin | place (zone) | materials | deco cell → file |
|---|---|---|---|
| `seacave` | Smuggler's Sea-Cave (Storm Coast) | wet sea-cave rock, tide-pools, smuggler crates; entrance = a cave mouth | hanging glow-weed → `seacave-glowweed.png` |
| `stronghold` | Dwarven Stronghold (Frostpeak) | dwarf-cut flagstone, ashlar walls, ice-rime; entrance = a great rune-gate | forge-brazier sconce → `stronghold-brazier.png` |
| `keepvault` | Breached Undervault (Dawnfall) | cracked keep-stone, fallen masonry, bone; entrance = a breached arch | watch-torch → `keepvault-torch.png` |
| `crypt` | Reliquary Crypt (Whisper Hills) | pale crypt stone, reliquary niches, candle-wax; entrance = an ossuary door | votive candle-cluster → `crypt-candles.png` |
| `citadel` | Besieged Citadel (Sunbridge) | sun-bleached citadel stone, scorch + rubble, sea-spray; entrance = a sea-gate | signal-brazier → `citadel-brazier.png` |
| `smuggden` | Smugglers' Den (Riverhearth outskirts) | dank cellar brick, barrels, contraband; entrance = a trapdoor stair | hanging oil-lamp → `smuggden-lamp.png` |

Each skin's files: `‹skin›-floor.png`, `-floor2.png`, `-path.png`, `-wall.png`, `-rock.png`,
`-chest.png`, `-entrance.png`, `-‹deco›.png`. (The Windmill Undercroft / `granary` skin already exists.)

## 11 — Town NPC sprites — ¾ top-down, facing viewer, soft shadow (needs the §6 wiring pass)
As §6 (the game still draws NPCs as emoji, so generate + stash; they need the emoji→sprite code pass).
One villager per cell, ¾ view facing the viewer, soft shadow, flat magenta. The 42 NPCs of the seven
new towns (names/roles are in `data/towns.ts`); run as town-grouped sheets:
- **Elderbough:** forest-warden (bow); grove-keeper hedge-witch; novice child; plump innkeeper; basket forager; old woodcutter.
- **Wheatcross:** farm-reeve; billhook militiaman; threshing goodwife; old miller; child; market trader.
- **Wrackport:** harbormaster; coast-watch soldier; fishwife; child; weathered old salt; innkeeper.
- **Frosthold:** dwarf hold-warden; dwarf smith (woman); old loremaster; dwarf child; pick-miner; hearth-keeper.
- **Lastlight:** war-captain; sentry; quartermaster; child; old veteran; field-mender.
- **Vesperhal:** abbot; bell-keeper nun; scribe-monk; novice child; pilgrim; herbalist sister.
- **Sunpier:** portmaster; town crier; sailmaster; child; old tide-reader; innkeeper.

Files: one per NPC, `npc-‹town›-‹role›.png` (e.g. `npc-elderbough-warden.png`) — exact keys confirmed at the NPC-wiring pass.

---

*Workflow: generate a sheet → remove the magenta → split into the named PNGs → drop into the right
`app/assets/` folder. Tiles/enemies light up with no code change; mark them ☑ in `asset-gaps.md`.*
