# Overworld Design — Research Basis (world-map best practices for Gaia)

A synthesis of overworld / world-map design principles drawn from acclaimed RPGs and their
designers, filtered for **Gaia's** specific shape: a **seamless, continuous big-map** overworld
(ADR 0008/0009) — one ~250×250 coordinate space per surface, regions *painted on* as boundaries,
streamed by chunk, roamed with **no load** in any of 8 directions — sitting above the
`Map › Continent › Zone › Area › Tile` hierarchy, with discrete **dungeons/caves** entered through a
mouth. This is the *basis* for our world-map design — the "why" behind the rules the
**world-cartographer** and **level-designer** build to, and the reviewers grade.

> **How to read this.** Each section gives the principle, who/what it's drawn from, and a
> **→ Gaia** translation pointing at the system/knob it touches (`data/zones.ts` / the world
> registry, `controllers/field.ts`, the atlas). Sources run from primary designer talks and
> reputable trade press (Game Developer/Gamasutra, GDC Vault, Game Maker's Toolkit, The Level
> Design Book) down to community sentiment — weak sourcing is flagged so we don't over-trust it.
> **Dara owns lore, region names, and canon; agents own world *craft*** (geography, layout,
> connections, pacing). This is the overworld companion to
> `docs/design/dungeon-design-research.md`.

> **⚠ One reconciliation up front.** The dungeon doc leans on **Attunement / continent identity**
> (lean a zone toward a power so the player brings the counter). On the surface this is a softer
> rule (Dara, 2026-06-22, clarifying ADR 0009 §4): **only the five Sundering Scars are *strictly*
> attuned** — a defining, canonical Attunement identity. **Other overworld regions *may* carry a
> light, optional affinity lean** as flavor; the affinity ring is a usable lever anywhere. The
> distinction is **strict vs. optional**: a surface region's *defining* identity is **biome / place
> / landmark**, and Attunement is an *accent* it may wear — never the thing that defines it (outside
> the scars, which it does define).

---

## TL;DR — the ten principles we'll build on

1. **The overworld is the connective tissue *and* a place** — it strings towns and dungeons into
   one world, and it must "feel like a place, not a series of hallways."
2. **Geography must be physically believable** — rivers run downhill to the sea, mountains run in
   chains, deserts sit in rain-shadows, biomes blend through transition zones. Match Dara's atlas.
3. **…but trade realism for legibility when they conflict** — readable beats strictly accurate.
4. **Make each region distinct and memorable** — per-region identity is the *first* question;
   landmarks are "tent poles"; don't let every area be everything.
5. **Build identity from environmental story** — props, ruins, lighting, and composition give a
   region history and double as navigation anchors.
6. **Guide without walls — the triangle rule + dispersed flow.** Shape terrain so the eye is pulled
   to peaks/landmarks and what's-behind is hidden; spread routes so no one feels rail-roaded.
7. **Use three landmark tiers** — large (a distant goal/"weenie"), medium (occlude to create
   surprise), small (set moment-to-moment tempo).
8. **Gate by terrain and difficulty, not invisible walls** — barriers + traversal unlocks, and
   tougher regions that steer the under-leveled away ("difficulty as a guide").
9. **Reward exploration as a chain-reaction breadcrumb** — each landmark reveals the next; "see it
   now, reach it later"; vistas are *earned*. Avoid icon-vomit checklist bloat.
10. **Seamless world, kept legible** — interconnection and shortcuts that loop back, fast travel
    earned and anchored to discovered places, and a maintained sense of scale and direction.

---

## 1 · What the overworld is *for* (and Gaia's seamless choice)

**The classic JRPG overworld is an abstracted, symbolic map** whose job is to **string the discrete
towns and dungeons into one connective space** — "a collection of symbols," with a city-sized hero
crossing miles in seconds (Kotaku, *Give Me More World Maps*; RPGamer, *Ode to the Overworld*;
**high — explicit, cross-corroborated**). Early DQ/FF adopted the compressed scale precisely because
1:1 foot-travel between cities was infeasible to convey (RPGamer; **high**). Reaching the overworld
**early** is generally better structure — it gives the player a tangible view of the world's scope
(RPGamer; **medium — stated opinion**).

**Modern JRPGs largely abandoned it** for seamless interconnected zones (FF XII) or corridor worlds
(FF X "travel-line" highroads; FF XIII, criticized as "a long hallway toward an orange target
symbol," towns cut). FF XIII's director defended linearity ("difficult to tell a compelling story
with that much freedom") and its world only opens at Gran Pulse ~⅔ in — the canonical case that
**a world that never opens up feels like hallways** (Wikipedia FFXII/FFXIII, citing GamePro/Edge/1UP;
**high — cited dev/critic quotes**). FF XVI trends back toward a **central hub + linked discrete
zones** (NeoGAF; **low — forum**).

**→ Gaia.** We've already chosen our answer: **a seamless, continuous, 1:1-roamable overworld** (ADR
0008), realized as **one big coordinate map with regions painted on** (ADR 0009) — *not* an
abstracted icon map and *not* a corridor. So our overworld must deliver the thing the abstracted map
gave (a legible sense of the whole world and where things are) **without** an abstracted scale, and
the thing the corridor lost (it must **feel like a place to roam**, not a hallway). The overworld is
Gaia's connective tissue between **entered** spaces (towns, dungeon/cave mouths — ADR 0006/0009),
and "current region" is **derived from position**, so the player never feels a zone boundary.

## 2 · Believable geography & sense of place

**Physical coherence is what makes a map read as a world, not a diagram.** The craft rules
(fantasy-cartography sources, consistent with real physical geography; **high — match real
hydrology/tectonics/climatology**):
- **Rivers** originate high and flow **downhill to the lowest point**, tributaries **merge** going
  down (rivers don't split except a delta), and most **end in the sea at a single point**; a no-outlet
  basin becomes a salt lake (Red Ragged Fiend, *Rivers & Watersheds*).
- **Mountains** form in **chains, not random clusters**, and ranges tend to **parallel coastlines**
  (subduction) (Anima, *Realistic Fantasy Maps*).
- **Deserts** sit in the **rain-shadow** (leeward side) of ranges (Anima).
- **Biomes blend through ecotones** — climatically opposite biomes (desert↔tundra) **can't border
  directly**; the more different, the wider the transition you step through (Anima). The failure mode
  is the **"patchwork map"** of unjustified adjacent biome tiles (TV Tropes; **low — label only**).
- **Settlements** sit where geography gives advantage — river mouths, confluences, harbors, passes
  (Mythcreants, *Crafting Plausible Maps*; **medium — cross-corroborated, page unfetched**).

**But legibility wins when it conflicts with realism.** Nintendo deliberately traded geographic
realism for legibility in BotW — e.g. **starkly separated biomes** visible from one vista — so the
world reads clearly at a glance (Game Developer, *Realism and Legibility in Open-World Level Design*;
**high**). Plausible-enough beats simulation-accurate.

**→ Gaia.** The **world-cartographer** paints region boundaries onto the big-map to **match Dara's
world atlas** (`docs/design/world-atlas.md`) — that's the canon source of where regions sit and how
they connect. Apply the physical-coherence rules so the painted geography reads as a real continent
(a river crossed at a ford, a range that walls and funnels, biomes that *transition* Greenvale's
shire → Silverwood's old growth rather than hard-cut). The **level-designer's** "varied terrain &
living world" directive is exactly this at the Area scale (rivers/forests/cliffs/meadows shaped into
the tiles). When realism and readability fight, **favor the readable** — and where the atlas and
physical logic disagree, **flag it for Dara**, don't silently "fix" his map.

## 3 · Distinct, memorable regions

**Per-region distinctiveness is the first design question.** A world designer should map "hotspots
and pathways" and ask up front **"what will make each region diverse from one another"** — then
**"keep things diverse; don't let every area be everything,"** with landmarks as **"tent poles"** that
set local themes and spread variety (Nathan Cheever, *The Art of Game World Maps*, 80.lv; **medium —
credentialed practitioner, single voice**). Differentiate places by **silhouette and signal at a
distance** — BotW gave each landmark type a unique read (shrines lit a distinctive color, campfires a
tall smoke column) (GMTK; **high**).

**Identity is built from environmental story.** Environments accrue an **"inherent sense of
history"** through props, scripted bits, texturing, lighting, and composition — and they perform
**four jobs at once**: constrain/guide movement, communicate affordances/boundaries, reinforce player
identity, and provide narrative context (Worch & Smith, GDC 2010, *What Happened Here?*; **high —
foundational GDC talk**). Unique landmarks both give an area identity **and** double as navigation
**callouts** (The Level Design Book; **medium**).

**→ Gaia.** Identity resolves **Area → Zone → Continent** (ADR 0009 §4): biome/tileset, ambient
music, encounters, and difficulty are sampled at the **Area** level, so a Zone varies internally —
which is the mechanism for "don't let every area be everything." Give each Zone/Area a **one-line
hook and a tent-pole landmark** the player can see and name (the level-designer already places POIs:
shrines, ruined towers, standing stones, camps). Differentiate by **silhouette + palette** within the
gold-on-dark house style. **A region's *defining* identity is biome/place** (the §0 reconciliation) —
Attunement is an optional accent a region may lean on, not its identity; only the **five Sundering
Scars** are *strictly* attuned.

## 4 · Guide without walls — the triangle rule & dispersed flow

**The cautionary tale:** BotW's first guidance prototype was **"points and lines"** (Sheikah Towers
connected by an intended route). It failed playtesting — players felt **"trapped on an invisible but
obvious guide rope,"** and heatmaps showed a ~**80% dutiful-followers / ~20% aimless-wanderers** split,
matching neither intent (GMTK, *How Nintendo Solved Zelda's Open World Problem*; **high — Nintendo's
own playtest data**). The fix: **seed many varied landmarks** so players freely hop landmark-to-
landmark yet **almost all still reach the key locations** — a breadcrumb of attractions, not a forced
line (GMTK; **high**).

**The triangle rule.** Shape terrain as **triangles/pyramids** (hills, cones, mountains): the eye is
drawn to the **peak** (where a POI sits), the player gets a **binary choice — climb over or go
around** — and the slope **hides what's behind**, so they're never overwhelmed by a field of options
(GMTK; Game Developer, *5 Design Lessons from BotW*; Nintendo Life on the CEDEC talk; **high — the
developers' documented method**).

**Three landmark size tiers**, contrast deliberately maintained: **large** = global visual
markers/goals; **medium** = obstruct sightlines to create surprise; **small** = control
moment-to-moment tempo (Game Developer; Radiator Blog, Robert Yang; **high — two independent
sources**). Guide with **leading lines**: **curve/meander** routes and partially **occlude** landmarks
so you can't see a whole target from one point — progressive reveal, not a straight A→B (Radiator;
**high — direct quote of the rule**). Landmarks have **"gravity"**: funnels/bowls make players *orbit*
attractive points rather than walk a line — **"dispersed player flow"** (Radiator; **medium-high**).
And: **"carefully designing the player's horizon can eliminate the need for many navigation tools"**
(no detective-vision) (Game Developer; **high — direct quote**).

**The theory under it:** Kevin Lynch's **imageability** — a navigable space is built from **paths,
edges, districts, nodes, landmarks** that let people form an accurate mental map; **"landmarks lend
importance to nodes, but nodes give meaning to landmarks"** (Game Developer; Lynch, *The Image of the
City*; **high**). A distant **"weenie"** (Disney term) pulls the player forward and, seen from a
vista in several directions, builds their mental map (Medium, *Vistas and Views*; **medium**).

**→ Gaia.** This is the **core overworld craft for both pipeline roles.** The **world-cartographer**
positions regions and the macro landmarks/goals so there's always a distant thing to head toward (a
**weenie** on the horizon) and a **dispersed** set of routes between neighbors — *not* one obvious
line. The **level-designer** sculpts the **triangles** in the tiles (cliffs/hills that occlude and
funnel — already in the varied-terrain directive) and places the **three landmark tiers**. The payoff
is the open-world rule both roles already follow ("a mesh, not a corridor"), now with the *technique*
to make a mesh **legible**: gravity-wells and occlusion, not walls or waypoints.

## 5 · Gate progression by terrain & difficulty, not invisible walls

**Classic JRPG gating:** an "open" world fenced by **terrain the party can't cross on foot**
(mountains, water), then **traversal unlocks in story order** — boat → canoe/hovercraft → **airship**
— each opening a larger slice, with the airship as the **late-game "world opens up"** payoff (FF Wiki;
Kotaku; Christ&PopCulture; **medium — uncontested pattern, fan-wiki sourced**). Terrain is laid out to
**funnel the player where the story wants**, not for realism (Paste/Endless Mode; **medium**).

**Soft difficulty-gating ("difficulty as a guide"):** Elden Ring **does not level-scale** its open
world — area difficulty is **fixed**, so the **world, not the player's level, dictates progress**, and
an over-tough early enemy (the Tree Sentinel) **steers the under-leveled away** without a wall. Miyazaki
**rejected just lowering global difficulty**, spreading challenges across the map so players level up
**through exploration** (Game Rant, paraphrasing Miyazaki; **medium — enthusiast outlet, well-attested
fact**).

**→ Gaia.** Encounter tables and difficulty are **sampled by Area position** (ADR 0009 §4), so a
region's threat level *is* its location — the natural lever for **soft gating** (a tougher Area reads
as "come back later"). Gaia is **roam-first** (ADR 0008 §6): bosses/gates gate **dungeon/depth
access, not the right to walk into the next field**. **Exactly how/where roaming is gated
(level-appropriate borders, soft walls, story beats) is explicitly a call to confirm with Dara —
flag, don't invent a hard rule** (ADR 0008 §6). Traversal unlocks (ship, later) are a **future**
lever, not for the first pass.

## 6 · Reward exploration & keep the seamless world navigable

**Reward as a chain-reaction breadcrumb.** Each discovered landmark should **reveal the next**, a
self-sustaining loop of curiosity (GMTK; **high**). **"See it now, reach it later"** — show distant
regions the player can't yet access (BotW's plateau views before the paraglider) to sustain
forward pull (Medium; TV Tropes; **medium**). A **vista is an *earned* reward** — a payoff for
reaching the vantage — and doubles as a **low-intensity breather** between intense beats (Medium;
**medium**).

**Avoid bloat.** Icon/checklist worlds (Ubisoft-style) feel like **busywork** because they
compartmentalize content into completion percentages — box-ticking, not discovery; meaningful
exploration is driven by a **mystery/world-building pull** and organic terrain guidance, **not** by
labeling and tracking every activity (GamingBolt; **medium — opinion, echoes the high-confidence
sources**). Tune **reward density** (cf. the dungeon doc's chest-fatigue finding): exploration should
*consistently* pay, but not carpet the map with markers.

**Seamless ≠ disorienting — keep it legible & interconnected.** Seamless worlds maximize
continuity/immersion via **streaming** (load neighbors as you near a border); zoned worlds trade that
for simpler optimization (Wikipedia *Open World*; gamedev.net; **low-medium — forum-leaning**). Dark
Souls builds **one continuous, physically interconnected world** where areas **loop back on real
geometry**, and its **shortcuts are real traversable level** (doors/elevators/ladders) that bend a
straight path into a **circle**, strengthening orientation (FromSoftware analysis; GMTK *Boss Keys*;
TheGamer; **medium-high**). **Fast travel is withheld** until ~halfway (warp around Anor Londo) so the
player **traverses on foot and builds a sense of place** before convenience — and when granted, it's
**anchored to discovered landmarks** (GMTK; **medium**).

**→ Gaia.** Our engine *is* a seamless streamer: **realize tiles by chunk near the viewport, evict
the rest** (ADR 0009 §3) — that's the named cost of seamless, already designed for iOS Safari.
Reward exploration with the **breadcrumb of landmarks/POIs** the level-designer places and the
**rare-monster lairs / good chests** off the safe path (dungeon doc §6 applies here at world scale).
Use **"see it now, reach it later"** with the macro landmarks the cartographer positions. Keep the
big-map **interconnected with loops and shortcuts** (the open-world rule) so roaming recontextualizes
rather than backtracks. **Fast travel**, if/when added, should be **earned and anchored to discovered
settlements/shrines** — and is a **flag-for-Dara** pacing call, not a default. Maintain **scale &
orientation** with distant weenies and distinct regional silhouettes so a 250×250 world never feels
samey or lost.

---

## Anti-patterns to avoid (the "don'ts")

- **Don't** build a corridor/"hallway" world that never opens up (the FF XIII critique). *(§1)*
- **Don't** ship a "patchwork map" — unjustified adjacent biomes, rivers that split/flow uphill,
  random mountain clusters, desert beside tundra. *(§2)*
- **Don't** chase realism at the cost of legibility — readable wins. *(§2)*
- **Don't** let every region read the same — no distinct silhouette/hook = forgettable. *(§3,§4)*
- **Don't** guide with "points and lines" (an obvious guide-rope) or waypoint/detective-vision
  crutches — design the horizon instead. *(§4)*
- **Don't** overwhelm the player with a whole field of options at once — occlude with terrain. *(§4)*
- **Don't** gate with invisible walls — use terrain, traversal unlocks, and soft difficulty. *(§5)*
- **Don't** invent the roam-gating rules unilaterally — that's a flag-for-Dara call. *(§5)*
- **Don't** carpet the map with icons/checklist busywork; reward density is tuned, pull is organic.
  *(§6)*
- **Don't** grant fast travel cheaply/early in a way that erases the sense of place and distance.
  *(§6)*
- **Don't** make a surface region *strictly/defining* attuned outside the five Sundering Scars — a
  light, optional affinity lean elsewhere is fine; a defining one is the scars' alone (Dara). *(§0)*

---

## How this maps onto Gaia's pipeline

| Principle area | Owning agent / file |
|---|---|
| Region boundaries, world coordinates, inter-region connections, macro landmarks/goals, atlas fidelity, seamless adjacency (ADR 0008/0009) | **world-cartographer** → world registry / `data/zones.ts` (`data/worldmap.ts`) |
| Tile-scale terrain (triangles, rivers/cliffs/forests), landmark tiers, POIs, Area shaping, loops/shortcuts | **level-designer** → `controllers/field.ts` (`genMap`), `data/zones.ts` |
| Per-Area/Zone encounter bands & soft difficulty-gating by position | **encounter-designer** → `data/zones.ts` bands |
| Difficulty numbers, reward density, pacing targets | **balance-tuner** → `data/enemies.ts`, `balance-sim.ts` |
| Region names, lore, environmental-story flavor, the 5 scars' Attunement read | **Dara / requiem-canon-keeper / narrative-writer** |
| Seam blending, chunked streaming, world-space camera, position-derived state | engine work in `controllers/field.ts` (+ `game.ts`) per ADR 0008/0009 |

**Reviewers:** **cartography-reviewer** grades the world-graph (atlas fidelity, reciprocity,
8-way/diagonal adjacency, seamless contiguity, edge spec) against §1–§5; **level-design-reviewer**
grades the shaped Areas (triangles/legibility/landmarks/loops, no soft-lock) against §2–§6.

---

## Source confidence ledger

**Designer-grade / primary (high trust):** Worch & Smith, GDC 2010 *What Happened Here?* (environmental
storytelling); Game Developer / GMTK / Nintendo Life / Radiator Blog all tracing to Nintendo's
CEDEC/GDC 2017 BotW talk (triangle rule, three landmark tiers, points-and-lines failure + heatmaps,
dispersed flow, leading lines, "design the horizon"); Game Developer *Realism and Legibility* (Lynch
applied); Kevin Lynch *The Image of the City* (imageability); Wikipedia FFXII/FFXIII design-history
(cited dev/critic quotes); fantasy-cartography craft (Red Ragged Fiend, Anima) for physical geography
(consistent with real hydrology/tectonics/climatology); The Level Design Book.

**Medium:** Nathan Cheever / 80.lv (practitioner interview, single voice); Mythcreants (settlement
placement, page unfetched); Medium *Vistas and Views* (weenies/vistas, single designer blog); Kotaku /
RPGamer / Paste editorials (overworld-as-symbol, abstraction trend); Game Rant paraphrasing Miyazaki
(Elden Ring no-scaling / difficulty-as-guide — fact well-attested, citation not primary); FromSoftware
interconnection/fast-travel via GMTK *Boss Keys* + analyses (read as summaries, not the video).

**Low — treat as sentiment, not doctrine:** FF Wiki (vehicle/airship gating — uncontested pattern, fan
source); NeoGAF (FFXVI hub-and-spoke); GamingBolt (icon busywork — opinion); TV Tropes (patchwork map,
highly-visible-landmark — labels only); gamedev.net forum (seamless-vs-zoned trade-offs); hobbyist
open-world-JRPG taxonomy blog.

**Adversarial / sourcing notes:** No primary **Horii** interview on overworld *topology* surfaced
(two checked interviews don't discuss it), so no claim is attributed to him. The BotW "triangle/
landmark/flow" cluster is the best-anchored material here (multiple independent reports of Nintendo's
own talk). The classic **vehicle-gating** pattern is industry-common knowledge but only fan-wiki
sourced in this pass — treated as a pattern, not a cited doctrine. Several strong editorials (The
Lifestream, Paste full text) returned 403 and rest on search excerpts.
