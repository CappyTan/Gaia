# ADR 0009 — The World Hierarchy & the big-map model

**Status:** accepted (Aurelion build). Refines the *mechanism* of
[ADR 0008](0008-seamless-continuous-overworld.md) (keeps its seamless goal, changes how we get it),
and is the spatial framework the whole content pipeline builds against. Sits above
[ADR 0006](0006-explorable-settlements-greenfield-zones.md) (settlements) and
[ADR 0007](0007-versioned-save-resume.md) (save).

## Context

The world is growing and we need one framework to organize it, author it, and *see it grow*. Dara's
model: every tile lives in a containment hierarchy, and the big surface maps are one continuous
coordinate space the cartographer **paints regions onto** (not many small grids stitched together).

## Decision

**1 · The containment hierarchy.** Every tile resolves up a fixed spine:

```
Map (type) › Continent › Zone › Area › Tile
```

- **Map** — the kind of space, and it **encodes the traversal rules**:
  - **Overworld** / **Underworld** — *seamless, continuous* (ADR 0008): one big ~**250×250** coordinate
    map each; you roam in/out, no load. The Underworld is a second such map reached from the overworld
    at the atlas's Access Shafts / gateways.
  - **Dungeon** — *discrete, entered* via a **mouth**: **multiple floors**, a self-contained **story
    arc** (entry → setpieces → boss → resolution) that ties into the main story.
  - **Cave** — *discrete, entered*: **small, single-floor, tough, optional**, one strong reward. (Our
    rare-monster "lairs" graduate into these.)
- **Continent** — top-level overworld region (Aurelion/Varkhaz/Myr'Thalas/the Sundering), per the
  atlas. **Zone** — a named region (Greenvale, Silverwood). **Area** — a *section within a zone*
  (Orchard Ridge, Bandit Fields, the Hidden Grove): the finest-grained identity unit.

**2 · Big-map "paint regions onto one coordinate space" (supersedes grid-stitching).** A surface map
is **one** ~250×250 tile coordinate space. Continents, Zones, and Areas are **boundaries painted onto
it** (rects/polygons with priority). A tile's `(continent, zone, area)` is a **point-in-region lookup**
by `(x, y)`. There are no seams to stitch — it is literally one map — which is the simplest possible
foundation for the seamless roaming ADR 0008 wants. *(This supersedes ADR 0008's "stitch separate zone
grids" mechanism; it keeps 0008's seamless goal, dungeons-discrete, and roam-first progression.)*

**3 · Never realize the whole map; stream by chunk.** 250×250 = 62.5k tiles — fine as a *coordinate
space*, fatal as a dense in-memory grid on iOS Safari. Store the world as **region boundaries +
per-Area generation rules**; **realize and cache tiles by chunk near the viewport**, evict the rest.
Tiles are born lazily as the player walks. (This is ADR 0008's streaming, made natural.)

**4 · Identity resolves finest-first: Area → Zone → Continent.** Biome/tileset, encounter lean,
ambient music, and difficulty are sampled at the **Area** level with Zone/Continent fallbacks, so a
zone can vary internally (the "more intricate, free-flowing" feel). **Honors Dara's ruling:** surface
regions carry *no Attunement identity* except the five Sundering scars.

> **Clarification (Dara, 2026-06-22):** the wording above is about *strict* identity. Only the **five
> Sundering Scars** are **strictly** attuned (a defining, canonical Attunement). Other surface regions
> **may** carry a *light, optional* affinity lean as flavor — the affinity ring is a usable lever
> anywhere — it just must not be a region's *defining* identity (that remains biome/place). "No
> Attunement identity except the scars" = no *strict/defining* one; an optional accent is allowed.

**5 · Position is the source of truth.** One global `(x, y)` per map; *where you are in the hierarchy*
and all derived state (encounters, music, biome) are **lookups from your coordinate**. Save/resume
stores `(mapId, x, y)` (ADR 0007's id-based, version-tolerant envelope already fits).

**6 · Pipeline ownership by level.** **world-cartographer** owns the Map/Continent/Zone/Area
**boundaries + coordinates + connections** (paints the regions). **level-designer** composes the
**tiles within an Area**. **encounter-designer** sets per-Area/Zone bands. **audio** sets per-Zone/Area
themes. **narrative / requiem-canon-keeper / Dara** own names + lore (Dara rules). Settlements (ADR
0006) are **POIs within the map** you step into (entered spaces, like dungeons/caves) — placement
flagged for Dara.

**7 · The framework is visible & buildable.** A typed **world registry** (the hierarchy as data) is
the single source of truth, and a dev **"World Map" view** renders the 250×250 with
Continent/Zone/Area boundaries colored in — so we watch the world fill as we paint regions (empty =
"to build"). New content = "claim a region on the map, fill its Areas."

## Consequences / trade-offs

- **Reconciles the in-flight seamless work.** ADR 0008 Stage-2 **Chunk A** (decoupling dungeons into
  entered spaces via a mouth) stays valid and needed. **Chunk B is re-aimed** from "render two grids +
  stitch the seam" to "render a window into the one big map" — same payoff, simpler. The Stage-1
  `WORLD_REGIONS` data folds into this registry.
- **Layering (ADR 0005):** the world registry + region boundaries + per-Area gen rules are **pure
  data**; chunk realization/streaming, the world-space camera, and position-derived state live in
  controllers; the World Map dev view is `ui`/a controller. No new runtime deps; Canvas/DOM;
  static-host + iOS-safe (chunked realization is the perf guard).
- **Bigger authoring surface, paid down incrementally** — the map fills region by region; the dev view
  makes the backlog literally visible.
- **Staged build:** (a) this spec; (b) the typed registry + coordinate→hierarchy lookup (pure data);
  (c) the dev World Map view; (d) the cartographer paints the Aurelion skeleton; then (e) the big-map
  chunked renderer/movement (the re-aimed Stage 2/3). Each ships green; the discrete zone path remains
  the playable fallback until the big-map renderer lands.
