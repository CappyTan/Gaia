# Seamless overworld — Stage 2 build plan (Greenvale ↔ Silverwood proof)

The implementation plan for [ADR 0008](../adr/0008-seamless-continuous-overworld.md) Stage 2: the
no-load, 2-region seamless crossing proof. Built on the Stage-1 world-space data (`WORLD_REGIONS` etc.
in `data/zones.ts`). **Dara confirmed two play-facing calls:** (1) **dungeons are entered through a
mouth** (the mini-boss guards a dungeon entrance you step onto → a brief discrete "descend"; dungeons
stay discrete), and (2) **free roam after a boss** (bosses gate the dungeon/depth, not the right to
walk into the next region; no auto-advance).

## The knot & resolution
Today a `ZoneLayout` is one grid: overworld **west** of `gateWallX`, dungeon **east** of it. The world
graph puts Silverwood **east** of Greenvale — so the east edge can't be both the dungeon and the seam.
**Resolution (ADR 0008 §5):** decouple the dungeon into a discrete entered space; the overworld region
becomes the world-space tile; the mini-boss gate becomes the **dungeon mouth** POI.

## Build sequence (each step keeps typecheck/test/build green; game stays playable throughout)

1. **Pure world-space helpers + tests (invisible).** In `data/zones.ts`: `regionAtWorld(wx,wy)`,
   `regionsOverlappingRect(...)`, `localOf(id,wx,wy)`/`worldOf(id,lx,ly)`, `seamBlendBand(edge)`. New
   `app/tests/worldspace.test.ts` (round-trips, seam tiles) + add the **invariant** to
   `worldmap.test.ts`: `worldRect(id)` width/height === that region's overworld `layout.w/h`.
2. **Dungeon decoupling as data, behind the existing engine.** Add `DungeonLayout` (own grid: `entry`,
   `boss`, `rooms`, `paths`, `chests`, `gate`); move each zone's `dunRects/dunPaths/dun chests/boss`
   into `Zone.dungeon.layout` (x rebased to 0); add `mouth: Pt` to the overworld layout. **Keep
   `genMap` building the same combined grid for now** (pure data move) — assert the rebuilt grid
   matches the old one before deleting old fields. *Risk: medium (rebasing math).*
3. **Split `genMap` → `genOverworld(regionId)` + `genDungeon(zoneIndex)`; add `Field.mode`
   ("overworld"|"dungeon").** The mouth POI: mini-boss guards it; stepping onto it once the mini is
   beaten builds the dungeon grid, sets `mode="dungeon"`, places player at `dungeon.entry`, shows the
   "you descend" overlay; boss lives in the dungeon. Returning rebuilds the overworld at the mouth.
   Update `battle.ts` mini-win to clear the **mouth-guard** (not a wall), `progress()` (overworld =
   toward the mouth; dungeon = toward boss), `inDungeon()` → `mode`. **Greenvale-first**; keep
   Silverwood/Duskmarsh on the legacy combined path until proven. *Risk: HIGH — boss/mini/save flow;
   verify the full Greenvale clear (overworld → mouth mini → dungeon → boss) end to end.*
4. **World-space rendering + camera.** `draw()` iterates the world-space viewport: `regionMaps`
   cache (per-region overworld grids), draw every region overlapping the viewport offset by its world
   origin, each dressed by **its own** env (shire vs grove). Camera clamps to the union of streamed
   regions. **Seam blend band** via `seamBlendBand` — deterministic dither (reuse the `(mx*7+my*13)%4`
   hash, never per-frame RNG) ramping shire↔grove ground across ±K tiles of x=64 (render-only; doesn't
   change ownership/passability). *Risk: HIGH — iOS Safari perf; cull to viewport, reuse +1px overlap.*
5. **World-space movement + seam crossing + music + encounters.** `move()` in world coords; passability
   from the owning region's grid; on crossing, recompute `activeRegion`, update `zoneIndex` in place
   (encounters/hints/bands follow), **no `loadZone`/overlay**. Keep `px/py` as active-region-local
   (derived each move) so existing per-cell consumers work; assert px/py↔wx/wy round-trip. Music:
   extract a shared `Music.forField()` selector; **duck-swap** `field`↔`forest` on region change (true
   two-track cross-fade deferred to Stage 3). After the Greenvale boss → return to roam (no auto-hub).
6. **Save/resume in world-space.** `SavedRun` gains `wx/wy`; bump `SAVE_SCHEMA`→2 with a migration
   deriving `wx/wy` from old `zoneId`+`px/py` via `worldOf`. `saveNow`/`continueRun`/`placePlayer` in
   world coords. Test an old envelope still loads (degrade-never-throw).
7. **Verify + ship.** Playwright-verify the acceptance criteria; bump `GAME_VERSION`; deploy.

## Acceptance criteria (the proof)
- Walk Greenvale→Silverwood across world-x 64 with **no overlay, no flash, no `loadZone`** (spy-assert).
- Both regions visible at once near the seam; ground **dithers** shire→grove across the band (no wall).
- Crossing **switches encounter bands** (Greenvale roster → Silverwood roster) by position.
- Music **duck-swaps** `field`↔`forest` once per crossing direction.
- **No soft-lock:** per-region flood-fill holds; a road crosses the seam at y≈12 (extend both regions'
  paths to the seam — level-design touch).
- Each region's **dungeon entered discretely** via its mouth (mini guards, boss inside, descend overlay).
- **Save/resume** restores world (wx,wy); resuming near the seam re-renders both regions.

## Scope / deferred to Stage 3
In: Greenvale↔Silverwood seamless only. Deferred: rollout to all regions + retiring `loadZone`
everywhere; the Duskmarsh seam + the Greenvale↔Duskmarsh diagonal; true two-track music cross-fade;
encounter-table *blending* (vs hard switch); region eviction tuning. The Duskmarsh stays discrete (hub
chain) as the always-completable fallback until Stage 3.

## Chunking for delivery
- **Chunk A = steps 1–3** (world-space helpers + dungeon-as-mouth, Greenvale-first). Shippable on its
  own (new dungeon-entry feel); the rest stays on the legacy path.
- **Chunk B = steps 4–6** (seamless render + no-load crossing + world-space save). The payoff.
- **Chunk C = step 7** (verify + ship). Then Stage 3 = rollout.
