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

## 5 — Enemy & boss sprites — single creature, facing LEFT, soft ground shadow
> [STYLE BLOCK] … BUT each cell shows a single full-body creature facing LEFT (toward the player's
> party), painterly and characterful, with a soft ground shadow, on flat magenta. A 3×4 grid:
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

*Workflow: generate a sheet → remove the magenta → split into the named PNGs → drop into the right
`app/assets/` folder. Tiles/enemies light up with no code change; mark them ☑ in `asset-gaps.md`.*
