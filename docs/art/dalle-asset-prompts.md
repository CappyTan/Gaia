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

## OVERWORLD TERRAIN REFRESH (v0.121 — bake in the depth & passability law)

**Read this first.** The overworld got an engine depth pass (ADR 0011-era; cast shadows, lit floors,
recessed water) — but the painted tiles must REINFORCE it, not fight it. The earlier terrain prompts
(groups 1–3 below) asked for "deep shade" floors, which rendered as a muddy dark checkerboard you
couldn't read. **These refreshed prompts supersede the terrain tiles in groups 1–3** (same filenames —
regenerate over them). Paste the STYLE BLOCK **and** the DEPTH LAW below before every terrain prompt.

### DEPTH & PASSABILITY LAW (paste after the STYLE BLOCK for every terrain tile)

> DEPTH & PASSABILITY LAW — every terrain tile obeys this so the player can read the world at a glance.
> One consistent light from the **top-left**. Three unmistakable reads:
> • **WALKABLE GROUND** = an evenly-lit, fairly **bright**, LOW-contrast **flat** floor seen straight
>   down (top-down), readable as open ground at thumbnail size. Never dark, never "deep shade", never a
>   high-contrast pattern — it is the calm *ground* the eye glides over. Variants differ only subtly.
> • **IMPASSABLE WALL** (tree, crag, ruin wall, dead trunk) = a **raised** form standing UP off the
>   ground, with a bright top-left-lit crown/cap and a darker shaded underside, plus its OWN dark
>   contact/cast shadow pooled to the lower-right at its base. It must read clearly **taller and busier
>   than the floor** — the "figure" against the ground.
> • **WATER / CHASM** = a **cool** surface set visually **below** the ground plane, with a thin **lit
>   lip** along the near (lower) bank and shadow dropping into it — reads as a drop-off you can't cross,
>   never confusable with dark ground.
> Walkable floors are always **lighter and warmer** than the walls that sit on them. Every tile is a
> seamlessly-tileable top-down square.

### Greenvale — the Shire (PRIORITY: this is the zone the player sees first)
> [STYLE BLOCK] [DEPTH LAW] … A 3×3 grid of top-down tiles for sunny temperate shire-land: (1) bright
> sunlit grass meadow floor, warm yellow-green, evenly lit and flat (walkable); (2) a second subtle
> variant of that grass; (3) a worn warm-tan dirt road/path, clearly a walkable lane; (4) a leafy
> round broadleaf tree seen from above, lit green crown on the top-left, dark underside, casting a soft
> shadow down-right — a raised impassable wall, clearly taller than the grass; (5) a low green shrub /
> bush (walkable scatter, small, a hint of shadow); (6) a mossy grey boulder (low scatter); (7) tended
> orchard grass, slightly tidier/striped; (8) a laden fruit tree from above (raised wall, red-dotted
> green crown, shadow down-right); (9) golden wind-rippled wheat stalks (low scatter).

Files: `grass.png`, `grass2.png`, `path.png`, `tree.png`, `bush.png`, `rock.png`, `orchard-ground.png`,
`orchard-tree.png`, `wheat.png` (+ `orchard-ground2.png`, `meadow-ground.png`, `meadow-ground2.png` as a
follow-up — same warm-grass family).

### Silverwood — the Ancient Forest (PRIORITY: refresh — was the muddiest)
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down old-growth forest tiles. CRITICAL: the forest
> FLOOR must stay clearly **walkable and lit** — not black. (1) mossy forest floor, a LIT mid-green
> with dappled warm light, flat and readable (walkable — think a sunlit clearing floor, not deep
> shade); (2) a subtle variant; (3) a root-worn dirt forest trail, warm brown, walkable; (4) a towering
> ancient tree from above — a big dark-green canopy crown lit on the top-left, dense and tall, with a
> strong shadow pooling down-right, unmistakably a raised wall far darker/taller than the floor; (5) a
> green fern clump (low walkable scatter); (6) a cluster of pale mushrooms (low scatter).

Files: `grove-ground.png`, `grove-ground2.png`, `grove-path.png`, `oldtree.png`, `fern.png`, `mushroom.png`.

### The Duskmarsh — drowned marsh (refresh)
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down grim marsh tiles: (1) boggy walkable earth, a
> readable muted olive-brown, damp but clearly LIT and flat (walkable, not black); (2) a variant; (3) a
> weathered grey plank boardwalk causeway, obviously a raised dry walkable road; (4) **black still
> water** — a cool dark pool set below the bank, with a thin lit muddy lip on the near edge (recessed,
> impassable, reads as a drop-in); (5) a bare drowned dead-tree stump from above, pale and leafless, a
> raised wall casting a shadow down-right; (6) a clump of tall marsh reeds (low scatter).

Files: `mire-ground.png`, `mire-ground2.png`, `mire-path.png`, `water.png`, `deadtree.png`, `reed.png`
(+ `bog.png`).

### Frostpeak — snow / ice / dwarven stone
> [STYLE BLOCK] [DEPTH LAW] … A 3×3 grid of top-down frozen-highland tiles: (1) packed snow ground,
> bright blue-white, lit and flat (walkable); (2) a variant with faint wind-ripple; (3) a trodden snow
> path, slightly warmer/greyer (walkable); (4) a snow-laden pine from above — green-and-white raised
> conifer with a STRONG dark contact shadow down-right (the floor is bright, so lean on the shadow to
> read it as a wall); (5) a snow cairn / drift (low scatter); (6) an ice-rimed grey crag, raised rock
> wall, shadowed; (7) pale-blue glacier ice floor (walkable, cool but lit); (8) frozen pool — a cool
> recessed ice-water surface with a lit near lip (impassable); (9) a snow-dusted grey rock (low scatter).

Files: `snow-ground.png`, `snow-ground2.png`, `snow-path.png`, `snow-pine.png`, `snow-cairn.png`,
`snow-crag.png`, `ice-ground.png`, `snow-frozen.png`, `snow-rock.png`.

### Storm Coast / Sunbridge — shore & harbor
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down storm-coast tiles: (1) wet tan beach sand, lit and
> flat (walkable); (2) a variant with shell flecks; (3) weathered grey dock planks (walkable raised
> boardwalk); (4) **teal sea water** — a cool surface below the shore with a pale lit foam lip on the
> near bank (recessed, impassable); (5) a barnacled coastal rock, raised wall with a shadow down-right;
> (6) a tide pool / shell cluster (low scatter).

Files: `coast-sand.png`, `coast-sand2.png`, `coast-dock.png`, `coast-sea.png`, `coast-rock.png`,
`coast-pool.png`.

### Dawnfall Hold — breached frontier ruins
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down ruined-keep tiles: (1) cracked flagstone ground,
> warm grey, lit and flat (walkable); (2) a rubble-strewn flagstone variant; (3) a packed-earth rampart
> walk (walkable path); (4) a crumbling stone wall section from above, raised wall, lit top-left cap +
> shadow down-right; (5) tufts of dry grass through the stone (low scatter); (6) a heap of broken
> masonry rubble (low scatter).

Files: `ruin-flag.png`, `ruin-flag2.png`, `ruin-path.png`, `ruin-wall.png`, `ruin-grass.png`, `ruin-rubble.png`.

### Whisper Hills / Riverhearth outskirts — green hills & riverside
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down tiles: (1) soft green monastic-hill grass, lit and
> flat (walkable); (2) a variant; (3) a pale gravel pilgrim road (walkable); (4) a cypress / dark
> sentinel tree from above (raised wall + shadow); (5) a mossy riverbank reed tuft (low scatter); (6) a
> carved boundary stone (low scatter). [Riverside reuses the bridge/ford crossings below.]

Files: `hills-ground.png`, `hills-ground2.png`, `hills-path.png`, `hills-tree.png`, `hills-reed.png`, `hills-stone.png`.

### Shared crossings & barriers — the recessed/raised special cases
> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down tiles: (1) a rocky **cliff** face from above — a
> raised grey-stone ridge with a bright top-left cap and a deep shadowed foot, clearly an impassable
> wall (NOT a flat grey tile); (2) a winding **river** water tile, cool blue, set below its banks with
> lit near lips, impassable (a flowing variant of still water); (3) a wooden plank **bridge** span over
> water, warm planks, obviously a raised walkable crossing; (4) a shallow pale stepping-stone **ford**,
> bright walkable crossing; (5) a **sunless gorge / chasm** — a deep near-black ravine seen from above
> with pale rocky rim-lips catching the top-left light on its edges and darkness falling away in the
> middle (impassable drop); (6) a lashed-log **raft / plank causeway** spanning a chasm — a deliberate
> walkable span of bound timber with rope rails, reads as "the way across".

Files: `cliff.png`, `river.png`, `bridge.png`, `ford.png`, `gorge.png`, `crossing.png`.

### Elder-Oak landmark (the Silverwood beacon, seen across the gorge)
> [STYLE BLOCK] [DEPTH LAW] … A single top-down view of a COLOSSAL ancient oak — far larger than an
> ordinary forest tree, a vast many-lobed green crown lit on the top-left with a huge shadow, an
> ancient gnarled trunk; it should read as a singular landmark "weenie" you can spot from a distance,
> distinct from the regular `oldtree` wall tile.

File: `elder-oak.png` (landmark prop; see asset-gaps "Wayfinding" row).

---

## OVERWORLD IMPASSABLES REFRESH (v0.146 — mountains, water & the Sunless Gorge)

**The priority refresh.** Playtest flagged three reads as weak: the **gorge looks terrible**, and
**mountains and water** read as low-quality brown smears. These are the overworld's big impassable
masses — the eye must read them as wall/drop instantly at thumbnail size, across the seamless map.
**These supersede the matching tiles in the "Shared crossings & barriers" group above** (same
filenames — regenerate over them). Paste the STYLE BLOCK **and** the DEPTH LAW before this prompt.

> [STYLE BLOCK] [DEPTH LAW] … A 3×3 grid of top-down, seamlessly-tileable square overworld tiles for
> the impassable masses of the world. Light from the top-left, every tile reads at thumbnail size:
> (1) **MOUNTAIN / CRAG WALL** (`cliff`) — a raised grey-stone massif seen from above, a bright
>   top-left-lit rocky crown of fractured planes stepping UP off the ground, deep shadow pooling to
>   the lower-right, unmistakably a tall impassable wall far busier and higher than any floor (NOT a
>   flat grey square); cool slate with warm gold rim-light on the lit faces.
> (2) **DEEP WATER** (`water`) — a cool, clearly-recessed body of water set visually BELOW the ground
>   plane, dark blue-teal with a thin bright lit lip along the near (lower) bank and a soft shadow
>   dropping into it; gentle surface sheen, NOT muddy brown — reads as a drop-off you cannot cross.
> (3) **RIVER** (`river`) — a flowing watercourse variant of the water tile, the same cool blue-teal
>   with a suggestion of current/ripple lines, lit lips on both banks, impassable; tiles end-to-end
>   into a channel.
> (4) **SUNLESS GORGE / CHASM** (`gorge`) — a deep near-black ravine seen straight down: pale rocky
>   rim-lips catching the top-left light along the upper edges, the rock walls falling away into pure
>   darkness in the centre, a genuine bottomless drop. Cold, ominous, high-contrast between the lit
>   rim and the black void — instantly reads "you cannot walk here." Tiles seamlessly into a long arm.
> (5) **RAFT / PLANK CAUSEWAY** (`crossing`) — a deliberate walkable span of lashed timber logs with
>   rope rails, warm lit wood laid ACROSS the dark chasm, obviously "the way over"; the dark gorge
>   shows at the edges so it reads as a bridge over the void.
> (6) **PLANK BRIDGE** (`bridge`) — a warm wooden plank-bridge span over water, a raised walkable
>   crossing, lit planks with a slight arch, dark water showing at the sides.
> (7) **STEPPING-STONE FORD** (`ford`) — a shallow pale crossing, bright flat stepping-stones just
>   above the waterline, obviously a walkable wet crossing.
> (8) a **second MOUNTAIN variant** (`cliff2`) — a taller, snow-flecked-bare crag of the same family,
>   for ridge variety (optional — drop if you only want 7).
> (9) leave blank.

Files: `cliff.png`, `water.png`, `river.png`, `gorge.png`, `crossing.png`, `bridge.png`, `ford.png`
(+ optional `cliff2.png` — needs a one-line `cliff2` registration if used; skip for a pure drop-in).

**Note on the gorge:** it now reaches into Greenvale as a *chasm arm* (v0.146), so the player meets it
early as a dead-end ravine with Silverwood's shore visible across it. The `gorge` tile is the chasm
FILL; the rim lookout / "Silverwood Shore" markers and the `elder-oak` beacon are separate props
(already prompted under "Elder-Oak landmark" above) — this sheet just needs the impassable masses to
look like real mountains, water, and a true bottomless gorge.

### Object / scatter props refresh (the rough tree/bush/rock/oldtree/fern/mushroom tiles)

The walkable scatter + tree walls also read rough. Same STYLE BLOCK + DEPTH LAW; pure drop-in (no code
change). Keep the two trees obviously TALL with cast shadows and the four scatter props obviously LOW.

> [STYLE BLOCK] [DEPTH LAW] … A 2×3 grid of top-down, seamlessly-tileable square overworld props:
> (1) **BROADLEAF TREE** (`tree`, a WALL) — a leafy round broadleaf tree from above, bright green
>   crown lit top-left, dark underside, soft shadow down-right; stands UP off the ground, taller and
>   busier than grass. (2) **ANCIENT FOREST TREE** (`oldtree`, a WALL) — a towering old-growth tree
>   from above, a big dense dark-green canopy lit top-left, strong shadow down-right, unmistakably a
>   tall raised wall far darker/taller than the floor. (3) **SHRUB / BUSH** (`bush`, low walkable
>   scatter) — a small low rounded green bush flat ON the ground, faint shadow, clearly steppable,
>   never a wall. (4) **BOULDER / ROCK** (`rock`, low walkable scatter) — a small mossy grey boulder
>   resting low, slight top-left light + small shadow. (5) **FERN CLUMP** (`fern`, low walkable
>   scatter) — a small spray of green ferns flat on the floor, low, soft. (6) **MUSHROOM CLUSTER**
>   (`mushroom`, low walkable scatter) — a small cluster of pale capped mushrooms low on the ground.

Files: `tree.png`, `oldtree.png`, `bush.png`, `rock.png`, `fern.png`, `mushroom.png` (pure drop-in).

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
