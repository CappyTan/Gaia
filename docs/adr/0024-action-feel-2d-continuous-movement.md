# Action feel in 2D — continuous movement, 60fps Canvas, visible encounters (the Diablo-feel roadmap)

The game felt engine-limited — choppy animation, a character visibly stepping tile-to-tile — and the
question was raised whether we needed 3D, a game engine, or a platform change to reach an
action-RPG (Diablo-like) feel. Investigation showed **none of the choppiness is a web-platform
limit**: the field loop deliberately throttled to ~30fps when idle, movement was tile-quantized *in
the data model* (integer tile coords + a 170ms per-tile glide), and the hero walk cycle has 3 frames
× 4 facings. The browser was idling. We decided the fix is **feel, not dimensionality**:

1. **Stay 2D.** Diablo 1/2 — the reference feel — were 2D sprite games. 3D would delete Dara's
   hand-painted art identity (a full continent of sheets + the slice pipeline) and impose a
   studio-scale model/rig/animate workload. Rejected outright.
2. **Continuous float-space movement, everywhere** (overworld, towns, dungeons — one system, no
   chessboard-past-the-tavern-door inconsistency). The player position becomes float world-coords;
   velocity integrates in the RAF loop; collision is swept against the tile grid. **Tiles become
   terrain, not movement quanta** — the grid, chunks, zones, and all art survive unchanged. The
   occupied tile is **derived from position**; when it changes, the existing tile-enter machinery
   (doors, stairs, gates, POIs, borders) fires untouched. Interactions switch from tile-adjacency to
   radius+facing. Movement math lives in a new pure `systems/movement` (tested, DOM-free, ADR 0005).
   Saves migrate silently (tile ints → floats, ADR 0007). Control is **direct** (hold-toward /
   d-pad / keys); tap-to-move + A* pathfinding is a flagged later option, judged after living with this.
3. **Combat stays ATB; encounters become visible.** Random step-counter encounters are replaced by
   **enemy packs roaming the field** (wander/chase, contact starts the existing ATB battle) — agency
   in the world is what reads as "action RPG"; the battle screen is the load-bearing wall under the
   V3 systems (ADRs 0014–0020) and REQUIEM canon, which is Dara's. **North star: real-time action
   combat (in-field) is the acknowledged ultimate vision** — a future fork, not scheduled; B-era
   choices (real hitboxes, chase AI, telegraph-capable entities) should be made C-compatible where free.
4. **Renderer: Canvas 2D + chunk caching now; PixiJS is the pre-approved escalation.** Static
   chunk layers pre-render to offscreen canvases and blit per frame (draw calls: thousands → dozens);
   the loop runs a full 60fps always while the field is visible. Desktop is the primary venue; iOS
   PWA must keep working. **Escalation trigger (adopt PixiJS without re-litigating):** we cannot
   hold 60fps on target hardware after chunk caching, or real-time-combat-era entity/VFX needs
   exceed Canvas. Chunk-baking carries over to Pixi as baked textures — not throwaway.
5. **Animation richness is procedural first, frames second.** Velocity-synced frame cadence,
   sub-frame bob, direction-lean, grounding drop-shadow, footstep dust, stop-squash — applied to
   hero, NPCs, and field enemies (which have 1 static frame each; the procedural kit is what makes
   ~40 roaming types feel alive without 40 walk cycles). Facing snaps to the nearest of 4 cardinals
   while moving at any angle (the Stardew pattern); 8-way facing art is explicitly **not** requested.
   More hand-painted frames (6–8/facing) are a logged Dara art request (`asset-gaps.md`) — pure
   content upside whenever painted.
6. **Gear visibility: appearance tiers, not per-item art** (the Diablo 2 answer — the naive matrix,
   slots × looks × facings × frames, is ~1,400+ hand-painted overlays; dead on arrival). The weapon
   archetype is the silhouette (9 exist; the weapon IS the class, Dara's directive); **rarity reads
   through procedural juice** (tint, rarity-colored glow/aura, Epic+ shimmer — zero art per item).
   **Smooth swings are procedural**: the static `RIG` transform (ADR 0004) becomes the *rest pose*
   of a small tween system — the weapon layer sweeps an eased arc with a motion trail on attack,
   the body lunges — no new art, and it seeds the real-time-combat animation system. Battle doll
   first (big, close-up, already composable). **Armor appearance-tier layers are deferred/flagged**
   (3–4 visible looks per body archetype, battle-doll only, rig-spec aligned) along with the
   tier-keying question (rarity vs ilvl — recommendation on record: rarity).
7. **Phased shipping.** **Phase 1 — the feel:** continuous movement + always-60fps + chunk caching +
   procedural animation + procedural weapon swing; encounters interim-shimmed from steps to
   *distance traveled* (~20 throwaway lines) so the pure-feel ship stays decoupled from design
   changes. **Phase 2 — the living world:** visible packs, contact battles, encounter tables
   repurposed as placement density (encounter-designer + balance-tuner own pacing; Dara sees
   "you can dodge fights" as a design change, not buried in an engine update). **Phase 3+ — flagged
   forks, none scheduled:** tap-to-move, PixiJS, armor tiers, real-time combat.

## Considered Options

- **3D (Three.js/engine)** — rejected: deletes the art identity, studio-scale cost, solves nothing
  the feel needs. — **Real-time combat now** — rejected: a different game; discards the ATB engine,
  the 52-slot/3-lane system as designed, the balance sim, and large parts of REQUIEM canon; kept as
  the explicit north-star fork instead. — **PixiJS now** — rejected: choppiness isn't fill-rate; a
  first-ever runtime dep buys nothing Phase 1 needs; pre-approved behind a trigger instead. —
  **Smooth-over-grid (keep tile movement, prettier glides)** — rejected: cannot fix the rook-on-a-
  chessboard read, which was the core complaint. — **Per-item gear art** — rejected: combinatorially
  impossible for a hand-painted pipeline.

## Consequences

- Everything keyed to *steps* must move to distance/position (encounter shim, then Phase 2 removes
  it). QA for Phase 1 must walk **every mode** (all ten towns' doors/counters, dungeon
  stairs/gates/reprieves) since one movement system now serves all three; re-verify dungeon
  soft-lock reasoning (wall-hugging can graze past a gate tile a step-mover was forced onto —
  the derived-tile-enter pattern handles it; concentrate testing there).
- The ~30fps idle throttle is gone by design; the loop runs 60fps whenever the field is visible
  (still self-stopping when hidden/backgrounded).
- Open flags on record: tap-to-move + pathfinding (revisit after feel-check) · PixiJS trigger ·
  real-time combat fork (Dara-level design decision when raised) · armor appearance tiers + their
  rarity-vs-ilvl keying · 6–8-frame walk cycles and enemy walk/idle frames (Dara art ledger).
- Supersedes the movement/glide model described in ADR 0012's frame-loop notes; ADR 0004's
  paper-doll compositor is extended (rest-pose tweening), not replaced.
