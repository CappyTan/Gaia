# Seamless overworld — big-map build plan (re-aimed for ADR 0009)

The implementation plan for the **seamless big-map overworld engine** — [ADR 0008](../adr/0008-seamless-continuous-overworld.md)
(seamless goal) on the [ADR 0009](../adr/0009-world-hierarchy-bigmap.md) big-map model. Dara chose
this (G21) over a discrete rebuild. **Supersedes** the earlier "stitch two grids" version of this
doc. Chunk A (dungeon-as-mouth) and the Greenvale Area-native exemplar are already shipped.

## The crux, resolved: how authored zone content lives in the chunk-streamed 960×640 world

Two frames exist: the **authored** per-zone grid (`data/zones.ts` `ZoneLayout`, Greenvale 64×24 with
roads/chests/lair/mouth/Area-tiling, anti-soft-lock-tuned) and the **geography** polygons
(`data/world.ts`, Greenvale's organic ~100×73 polygon + its 5 Area sub-polygons; `regionAt` already
the identity source).

**Decision — Option (a): place the authored grid into world space at scale 1:1, centered on the
zone polygon's centroid; render/move by windowing across placed grids; fill the rest of the polygon
with procedural Area-dressed open ground; backlog regions = soft "uncharted" edge.**
- Reject (b) pure Area-rule generation (throws away authored content + anti-soft-lock). Use (c)
  procedural fill **only for backlog/unbuilt regions**, not the three built zones.
- **One world tile : one authored tile (no stretch).** New `WORLD_PLACEMENT[zoneId] = {wx,wy,scale:1}`
  puts the authored grid's local (0,0) so the grid is centered on the polygon centroid. The authored
  grid is a **dense hand-built core** inside the larger, sparser polygon; the polygon interior outside
  it is procedural open ground (you roam open zone, then hit the dense core). Stretching would break
  the integer flood-fill + dilute the tuned pacing — rejected.
- **Two independent per-tile lookups:** (1) **identity** `regionAt("overworld",wx,wy)` → Area →
  biome/encounter-lean/music (works everywhere); (2) **realization** authored grid if the tile is in a
  zone's placement rect, else procedural open ground if inside a built polygon, else "uncharted".
- **Data (pure, ADR 0005):** new `WORLD_PLACEMENT`/`placementOf`/`authoredAt(wx,wy)` in `world.ts`
  (it bridges polygons↔grids); authored content stays in `zones.ts` untouched; legacy `WORLD_REGIONS`
  + `seamBlendBand`/`regionAtWorld`/`localOf`/`worldOf` are superseded, kept till Stage 3 retires them;
  `greenvaleAreaAt`→ generic `areaAt` via `regionAt`; `pickAreaSet` keyed by `area.encounterLean`
  (generalizes encounters to all zones).

## Chunked realization (never realize 614k tiles)
- **Chunk = 32×32 world tiles**, key `(wx>>5,wy>>5)`, `Map<string,Chunk>` cache in `field.ts`.
- Realize a chunk once: per cell run the two-lookup model + **deterministic** dressing (stable
  `(wx*7+wy*13)%4` hash, never `Math.random` at realize time → identical re-realize, no flicker).
- Realize the viewport ring + 1-chunk margin **on move** (not on draw); evict chunks >3 Chebyshev
  away. Cache each cell's dressing decision so `draw()` never calls `regionAt` (keep it off the frame
  path). Anti-soft-lock: run the existing flood-fill on each authored grid at placement; filler is
  open by construction.

## Camera / render / movement
- `Field.wx/wy` (world coords) is the source of truth; `draw()` iterates the world-tile viewport from
  the chunk cache; dressing via a `world.ts`-driven table keyed by `area.tileset/biome` (removes the
  Greenvale special-casing). **Seam dither** at realize time: within K=3 tiles of a different
  neighbouring Area (`regionAt` at ±K offsets), blend the two biomes' ground by the stable hash —
  polygon-native, deterministic, cached (supersedes rect `seamBlendBand`).
- `move()` on `wx/wy`; **no `loadZone`/overlay** on overworld crossing; after each step
  `regionAt`→ set `zoneIndex` (for bands), Area lean (for `pickAreaSet`), music (`Music.forField`).

## Stays discrete (don't break)
Dungeons (mouth/`Field.mode`/`descend`/`ascend`, already shipped — mouth at `placementOf(zone)+mouth`;
ascend restores the mouth's world tile), towns/hubs (entered interiors; POIs at world tiles),
boss/mini fights, roam-first-after-boss. **Backlog/unbuilt regions = impassable soft "uncharted"
edge** with a hint, so the player stays in built content without a hard wall.

## Save (ADR 0007)
Bump `SAVE_SCHEMA` 1→2; `SavedRun` gains `wx/wy` (keep `zoneId`/`px`/`py` for dungeon-local +
back-compat); v1→v2 migration derives `wx/wy = placementOf(zoneId)+(px,py)`, degrade-never-throw for
town/dungeon saves (respawn at spawn).

## Staged sequence (each green + playable; discrete path stays the fallback until proven)
- **2A — Placement data + helpers (pure data, invisible).** `WORLD_PLACEMENT`/`placementOf`/
  `authoredAt` in `world.ts` + `placement.test.ts` (placement rect ⊂ zone polygon bbox; authoredAt
  round-trips; mouth/lair/chests land sensibly). No engine consumer. **Risk: low.**
- **2B — World-space realize + render, GREENVALE only, behind a `Field.bigMap` flag.** Chunk
  cache/realize/evict; `wx/wy` camera + `draw`/`move`; generalized dressing + `areaAt`/`pickAreaSet`;
  seam dither; surround Greenvale's core with procedural shire filler; uncharted soft edge.
  **Risk: HIGH (renderer + iOS perf).** Prove on Greenvale alone, flag-off = discrete fallback;
  "realize twice == identical" test; profile chunk realize. Acceptance: roam all of Greenvale as a
  big-map window (authored roads/chests/Hogger/mouth present + reachable; Area-seam dither; Area-leaned
  encounters; no overlay; mouth→dungeon→boss works). Playwright: no `loadZone` spy, seam screenshot.
- **2C — No-load crossing + world save (Greenvale↔Silverwood).** Place Silverwood; `bigMap` on for it;
  state-derivation in `move`; `Music.forField`; `SAVE_SCHEMA`→2 + migration. **Risk: HIGH.** Duskmarsh
  stays discrete fallback. Acceptance (the proof): walk Greenvale→Silverwood no-load; biome dither at
  the seam; encounters/music switch by position; reachability across the seam; dungeons via mouth;
  save/resume in `wx/wy`. Playwright verifies each.
- **Stage 3 — Duskmarsh into the world; retire the discrete path.** Place+flag Duskmarsh; drop the
  `bigMap` guard; retire `loadZone`/`genCombined`/legacy `WORLD_REGIONS`+tests; backlog soft-edges
  everywhere; later option-(c) procedural fill + true two-track music cross-fade + encounter blending.
  **Risk: medium.** Acceptance: roam all three seamlessly incl. the Greenvale↔Duskmarsh corner; full
  three-zone clear with zero `loadZone`.

## Top risks → de-risk
Chunk perf on iOS (regionAt off the frame path; realize-on-move; 32² chunks) · save migration
(degrade-never-throw; test old envelopes) · seam reachability (world flood-fill test spawn→neighbour;
or carve a world road between adjacent zones) · determinism (stable hash only; realize-twice test).
