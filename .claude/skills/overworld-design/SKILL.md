---
name: overworld-design
description: The overworld & world-map design playbook for Gaia — the distilled, gradeable rubric the world-cartographer and level-designer follow when building the seamless overworld, and the reviewers (cartography-reviewer, level-design-reviewer) grade against. Turns the world-map research (docs/design/overworld-design-research.md) into concrete rules for Gaia's seamless big-map (ADR 0008/0009): believable geography, distinct/memorable regions, guide-without-walls (the triangle rule + dispersed flow + three landmark tiers), terrain/difficulty gating, exploration reward, and a navigable seamless world. Use whenever placing/reworking regions on the world map or shaping an overworld Area. NOTE: only the five Sundering Scars are STRICTLY attuned; other regions MAY carry a light, optional affinity lean — never a defining surface identity (Dara's clarification).
---

# Overworld Design skill — how Gaia's world map is built and graded

The one repeatable rubric for Gaia's **seamless overworld** — the continuous big-map the player
roams with no load (ADR 0008/0009). It distills `docs/design/overworld-design-research.md` (best
practices from acclaimed RPGs and their designers) into concrete rules tied to Gaia's world
framework. This is the **overworld companion to the `dungeon-design` skill** (which owns the
entered, discrete spaces).

**Two roles, two reviewers, one rubric.** The **world-cartographer** follows §1–§5 (macro: where
regions sit, how they connect, the guidance skeleton); the **level-designer** follows §2–§6 (tile
scale: terrain, landmarks, Area shaping). The **cartography-reviewer** grades the world-graph
against §1–§5; the **level-design-reviewer** grades shaped Areas against §2–§6. Checks are written
to be gradeable **[Blocking] / [Should-fix] / [Polish]**.

- **Read first:** `CLAUDE.md`; `docs/design/overworld-design-research.md` (the *why* + citations);
  **`docs/design/world-atlas.md`** and the **reference maps** (`assets/reference/map-gaia-overworld.png`,
  `map-underworld-gaia.png`) — the **maps are canon**; `docs/adr/0008-seamless-continuous-overworld.md`
  + `0009-world-hierarchy-bigmap.md` (the framework). Lanes per CLAUDE.md/ADR 0009 §6 still hold.
- **When to use:** placing/reworking regions on the world map (cartographer) or shaping an overworld
  Area's terrain (level-designer). For an **entered** dungeon/cave, use `dungeon-design` instead.

## ⚠ The one ruling that overrides instinct
**Only the five Sundering Scars are *strictly* attuned** — a defining, canonical Attunement
identity (Dara, 2026-06-22, clarifying ADR 0009 §4). **Other surface regions *may* carry a light,
optional affinity lean** as flavor — the affinity ring is a usable lever anywhere — but it is **not**
a region's *defining* identity (surface identity is primarily **biome / place / landmark**). The
rule is **strict vs. optional**: only a *strictly/defining*-attuned surface region **outside the
scars** is a **[Blocking]** finding; a light optional lean is fine.

---

## 1 · The overworld is connective tissue *and* a place (cartographer)
- Gaia's overworld is **seamless and 1:1-roamable** (ADR 0008), realized as **one big coordinate
  map with regions painted on** (ADR 0009) — *not* an abstracted icon map, *not* a corridor. "Current
  region" is **derived from world position**; the player never feels a zone boundary.
- It must do both jobs: **connect** the entered spaces (towns, dungeon/cave mouths) **and feel like a
  place to roam** — never "a series of hallways" (the FF XIII failure). The open-world rule applies:
  **a mesh of interconnected regions with loops, not a line.**
- **Gradeable:** does the world read as one continuous place? Is it a mesh (multiple routes between
  neighbors) or a corridor? Is region state derived from position, not a zone index?

## 2 · Believable geography (cartographer macro + level-designer tiles)
Make the map read as a world, not a diagram — apply the physical-coherence rules:
- **Rivers** start high, flow **downhill to the sea**, tributaries **merge** (don't split, bar a
  delta), end at a **single** sea point; a no-outlet basin = a salt lake.
- **Mountains** run in **chains** and tend to **parallel coasts**; **deserts** sit in the
  **rain-shadow** of ranges.
- **Biomes blend through transition zones** — opposite biomes (desert↔tundra) **never border
  directly**; the more different, the wider the ecotone you step through. No **"patchwork map."**
- **Settlements** sit where geography gives advantage (river mouths, confluences, harbors, passes).
- **But legibility beats realism when they conflict** — readable, plausible-enough wins over
  simulation-accurate (Nintendo deliberately separated biomes for clarity).
- **Match Dara's atlas/maps** — they're canon for *where* regions sit; physical rules shape the
  *how*. Where atlas and physical logic disagree, **flag for Dara**, don't silently "fix" his map.
- **Gradeable:** rivers/mountains/deserts/biome-borders physically plausible? Transitions blended,
  not hard-cut/patchwork? Placement matches the atlas? Legible where realism would muddy it?

## 3 · Distinct, memorable regions (cartographer hook + level-designer build)
- **Per-region distinctiveness is the first question** — each Zone/Area needs a **one-line hook** and
  a **"tent-pole" landmark**; "don't let every area be everything." Identity resolves **Area → Zone →
  Continent**, so a Zone varies internally.
- **Differentiate by silhouette + signal at a distance** — a unique read for each landmark/region
  (BotW lit shrines a distinct color, campfires a tall smoke column), within the gold-on-dark palette.
- **Build identity from environmental story** — props, ruins, lighting, composition give a region
  history *and* double as navigation callouts (Worch & Smith: environments guide movement, signal
  affordances, reinforce identity, and tell story, all at once).
- **Gradeable:** can each region be told apart at a glance and named by its tent-pole? Or do areas
  blur together? Is the region's *defining* identity biome/place (Attunement at most an optional
  accent — only the scars are strictly attuned; see §0)?

## 4 · Guide without walls — the triangle rule & dispersed flow (cartographer skeleton + level-designer terrain)
The core overworld craft. **Never** "points and lines" (an obvious guide-rope — BotW's failed
prototype) and **never** waypoint/detective-vision crutches; **design the horizon** instead.
- **Triangle rule:** shape terrain as **triangles/pyramids** — the eye is pulled to the **peak**
  (place a POI there), the player chooses **climb-over or go-around**, and the slope **hides what's
  behind** so they're never overwhelmed by a field of options.
- **Three landmark tiers:** **large** = distant goals/"weenies" the player heads toward; **medium** =
  occlude sightlines to create surprise; **small** = set moment-to-moment tempo. Maintain contrast.
- **Leading lines:** **curve/meander** routes and **partially occlude** landmarks so a whole target
  isn't visible from one point — progressive reveal, not a straight A→B.
- **Gravity & dispersed flow:** funnels/bowls make players **orbit** attractive landmarks → routes
  spread out, no one feels rail-roaded. (Lynch's paths/edges/districts/nodes/landmarks underpin it;
  "landmarks lend importance to nodes; nodes give meaning to landmarks.")
- **Cartographer** sets the macro: a distant weenie always on the horizon + a **dispersed** route
  network between neighbors. **Level-designer** sculpts the triangles in tiles (cliffs/hills that
  occlude & funnel) and places the three tiers.
- **Gradeable:** is there always a visible goal to head toward? Do terrain triangles occlude/funnel
  (or is it a flat field / an obvious guide-rope)? Are landmark tiers present and contrasted?

## 5 · Gate by terrain & difficulty, not invisible walls (cartographer + encounter-designer)
- **Soft-gate with terrain** (mountains/water barriers) and **difficulty by location** — encounters/
  difficulty are **sampled by Area position** (ADR 0009 §4), so a tougher Area reads as "come back
  later" (difficulty-as-a-guide; no level-scaling). Gaia is **roam-first**: bosses/gates gate
  **dungeon/depth access, not the right to walk into the next field** (ADR 0008 §6).
- **Traversal unlocks** (ship/airship-style) that "open up" the world are a **future** lever, not the
  first pass.
- **FLAG, DON'T INVENT:** exactly how/where roaming is gated (level-appropriate borders, soft walls,
  story beats) is **a design call to confirm with Dara** (ADR 0008 §6). Propose; don't hard-code.
- **Gradeable:** is gating terrain/difficulty (legible "not yet") rather than an invisible wall? Were
  roam-gating *rules* surfaced to Dara rather than invented?

## 6 · Reward exploration & keep the seamless world navigable (level-designer + engine)
- **Chain-reaction breadcrumb:** each landmark/POI should **reveal the next** — a self-sustaining loop
  of curiosity, not a checklist. **"See it now, reach it later"** — show distant places before they're
  reachable to pull the player forward. A **vista is an *earned* reward** + a low-intensity breather.
- **Avoid bloat:** no icon-vomit/checklist busywork; **tune reward density** (exploration consistently
  pays but isn't carpeted); the best chests and **rare-monster lairs** sit off the safe path
  (dungeon-design §6 at world scale).
- **Seamless but legible:** keep the big-map **interconnected with loops & shortcuts** that bend a
  path into a circle (recontextualize, don't backtrack). **Fast travel** (if added) is **earned and
  anchored to discovered settlements/shrines** — and is a **flag-for-Dara** pacing call. Maintain
  **scale & orientation** with distant weenies + distinct regional silhouettes so 250×250 never feels
  samey or lost. (Engine streams tiles **by chunk near the viewport** per ADR 0009 §3 — the named
  cost of seamless.)
- **Gradeable:** does exploring pay (and reveal more)? Reward density tuned, not carpeted? Loops/
  shortcuts present? Is orientation maintained across the big space?

## 7 · Verify
- Cartographer: the **graph test** (reciprocity, coordinate↔direction, atlas consistency) in
  `app/tests/` covers the change and is green; `npm run typecheck` clean.
- Level-designer: `npm run typecheck && npm run build && npm test` clean; **never soft-lock** (always
  traversable; chests reachable); if cadence/difficulty moved, `npm run sim 200` and hand number moves
  to **balance-tuner**.
- Don't bump `GAME_VERSION` or commit from the design pass — hand finished work back with notes.

## The don'ts (quick reference)
- A corridor/"hallway" world that never opens up. *(§1)*
- Patchwork maps; rivers that split/run uphill; random mountain clusters; desert beside tundra. *(§2)*
- Realism at the cost of legibility. *(§2)*
- Same-y regions with no distinct silhouette/hook. *(§3,§4)*
- "Points and lines" guide-ropes or waypoint/detective-vision crutches. *(§4)*
- Overwhelming the player with a whole field of options (occlude with terrain instead). *(§4)*
- Invisible walls instead of terrain/difficulty gating; inventing roam-gating rules (flag for Dara). *(§5)*
- Icon/checklist busywork; cheap/early fast travel that kills the sense of place. *(§6)*
- A *strictly/defining*-attuned surface region outside the five Sundering Scars (a light optional
  affinity lean elsewhere is fine). *(§0)*

## Lanes (who owns what)
Region boundaries / coordinates / connections / macro landmarks / atlas fidelity / seamless adjacency
→ **world-cartographer** (world registry, `data/zones.ts`). Tile-scale terrain / landmark tiers / POIs
/ Area shaping / loops → **level-designer** (`controllers/field.ts`, `data/zones.ts`). Per-Area
encounter bands & soft difficulty → **encounter-designer**. Difficulty numbers / reward density →
**balance-tuner**. Region names / lore / environmental-story flavor / the 5 scars' Attunement read →
**Dara / requiem-canon-keeper / narrative-writer**. Spot it, apply your part, hand off the rest.
