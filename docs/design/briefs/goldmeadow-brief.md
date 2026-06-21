# World Brief — Goldmeadow Plains (Aurelion #3, "The Breadbasket")

The sync anchor for the first **backlog fill** (world-builder skill §1). Every agent on this build
anchors to this brief; any drift from it is a defect. This turns the roamable-but-empty Goldmeadow
region (a `draft` ZoneRegion in `data/world.ts`, no `zone` link) into a **built, playable zone** in
the seamless overworld (ADR 0008/0009).

> **Status of names/lore:** DRAFT — agent first pass. Dara owns lore/names; everything below is
> flagged for his blessing. Bands, bestiary makeup, encounters, and balance are agent-driven (the
> Director's granted authority). REQUIEM stays canon; surface regions have **no Attunement identity**
> (Dara's ruling) — leans are creature/terrain flavor only.

## Identity & fantasy
**Goldmeadow Plains — the Breadbasket of Aurelion, now a war-front.** Endless rolling fields of
golden wheat, windmills, drystone walls, and farm roads — Aurelion's granary. The hook: the grim
tide that festered in the Duskmarsh has spilled north onto the open plains; raiders and beasts now
burn the harvest and the once-peaceful breadbasket has become a running battle across open ground.
**Why the player goes:** the journey's next step after the marsh — open, fast, dangerous country
where there's nowhere to hide and the fights come at you across the fields.

The contrast with what came before is the point: after the claustrophobic Duskmarsh and the hushed
Silverwood, Goldmeadow is **wide, bright, and exposed** — long sightlines, open engagements, weather.

## Biome & visual language
- **Terrain:** open golden grassland — wheat fields, fallow meadow, farm tracks and drystone walls,
  scattered windmills/barns, a creek line, a few copses. Gold-on-dark house palette: amber/wheat
  ground, dark hedge/wall lines, warm dusk light.
- **Tile kinds:** reuse the shire/plains family where possible (grass, path, bush, rock, water,
  tree). New flavor tiles to FLAG for art: **wheat field** (tall golden crop), **drystone wall**
  (low impassable field boundary), **windmill/barn** landmark. Placeholders = recolored shire tiles
  until Dara's art lands (log in `docs/design/asset-gaps.md`).
- **Landmarks:** a ruined/occupied **windmill** as the dungeon mouth; drystone-wall mazework that
  shapes open-field engagements; a burned farmstead; the creek crossing.

## Attunement identity
**None** (Dara's ruling — surface regions carry no Attunement identity outside the five Sundering
scars). Encounter LEAN is creature/terrain flavor only: open-field raiders + plains beasts. The
boss matchup is built on stats/threat, not an Attunement theme. (If Dara later wants the marsh-tide
to read as a specific corrupted Attunement, that's his call to make — flag, don't invent.)

## Level band & role in the world
- **Band: L11–15.** The next progression step PAST the Duskmarsh (Greenvale 1–6 → Silverwood 7–9 →
  Duskmarsh 10+ → **Goldmeadow 11–15**). Geographically central Aurelion (S of Silverwood), reached
  by roaming the seamless continent.
- **FLAG FOR DARA (run-flow):** the Duskmarsh's boss currently *wins the run* (last zone in `ZONES`).
  Adding Goldmeadow after it makes **Goldmeadow's boss the new run-ender**. Confirm you want the
  journey to continue past the marsh into the plains, or whether Goldmeadow should be a *parallel*
  mid-region instead. This build assumes **continuation (new endgame)** and is reversible.

## Cast & threats (agent-authored, names flagged for Dara)
Open-field war host — raiders who burned the harvest + plains predators drawn to the carnage:
- **Trash/normal:** plains raider (sword/torch bruiser), field marauder (fast skirmisher), harrier
  (ranged/sling), plains wolf/wild dog pack, carrion bird, a heavy "reaver" (armored bruiser).
- **Rare monster (treasure-tier):** a fat slow gilded beast in the wheat (Metal-Slime/Hogger tier,
  ~4% replace, exceptional loot) — DRAFT name flagged.
- **Mini-boss (gate to the dungeon mouth):** a raider war-captain + escort.
- **Zone boss (the windmill):** the warlord who leads the host — a hard L15 fight; ENRAGE-flagged
  (matching v0.63's boss enrage pass) is on the table for balance.
Reuse existing enemy defs where they fit the plains; introduce new ones only where the roster needs
them, and pace them teach-one-then-combine (house rule).

## Dungeon
**The occupied windmill / granary undercroft** (DRAFT name) — the dungeon entered via the **mouth**
at the zone's eastern lobe (seamless-engine convention: mouth in the east Area). Multi-room descent
(forking, a dead-end vault with the richest hoard, a guarded route to the boss arena), gated by the
mini-boss at the mouth. Discrete-entered like the Warren / Grove / Vault.

## Loot & class hooks
Rewards the L11–15 band: rarity-banded loot trending uncommon/rare→lucky epic (per `rarityBand`),
deeper ilvl than the Duskmarsh. No new affixes/sets required for v1 (flag to itemization-designer
only if the open-field fantasy wants a "harvest"/"sunlit" chase piece — optional). No class kit
showcase required.

## Tone & sound
**Bittersweet and martial** — a warm pastoral plains theme with an undercurrent of threat (the
breadbasket is beautiful AND burning): brighter/faster than Silverwood's hush and the Duskmarsh's
dread, a wind-over-wheat openness with a marching pulse. The dungeon theme tightens to a tense,
enclosed granary cue; the boss theme is the build's biggest, most martial statement so far.

## Seamless-engine wiring (how "built" is defined here)
1. **world-cartographer:** keep/refine Goldmeadow's organic polygon in `data/world.ts`; **link it to
   a Zone** (`zone: "goldmeadow"`, drop `draft`); paint its tiling **Areas** (organic, cover the
   polygon, identity hints; eastern lobe = the dungeon-mouth Area `miniboss-gate` lean); confirm it
   sits inside Aurelion and note its neighbor connections (open continent — G22).
2. **level-designer:** author a `ZoneLayout` (Goldmeadow ~60×24) in `data/zones.ts` (fieldRects,
   open-world paths/loops per the interconnection rule, chests, lair, **mouth in the east**, spawn)
   + add a `WORLD_PLACEMENT["goldmeadow"]` entry centered on the polygon centroid; author the
   `DungeonLayout`; add the `Zone` to `ZONES`.
3. **encounter-designer:** bands (teach→combine), mini/boss, rare monster in `data/enemies.ts`.
4. **requiem-canon-keeper → narrative-writer:** vet names; write the prose.
5. **audio-composer → balance-tuner:** plains/dungeon/boss themes; tune to L11–15 (sim targets:
   party HP ~55–75%, boss ~30–50%, wipe <~10%).

Verify gate: `npm run typecheck && npm test && npm run build && npm run sim 200`, all green + on target.
