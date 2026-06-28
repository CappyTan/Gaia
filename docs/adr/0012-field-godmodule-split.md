# ADR 0012 — Split the field.ts god-module (ui/fieldRender + systems/mapgen)

**Status:** accepted (structural refactor — behaviour-preserving). Applies the layering of
[ADR 0005](0005-modular-ts-vite.md) and the
[`architecture-review`](../../.claude/skills/architecture-review/SKILL.md) skill (§1 layering, §2
pure/RNG-injected systems, §6 cohesion/god-module). Companion to the earlier `systems/encounter.ts`
extraction.

## Context

`controllers/field.ts` had grown to ~2200 lines / ~95 methods in one object literal, mixing five jobs:
procedural map-gen, seamless big-map chunk streaming, town/dungeon navigation + encounter flow, and a
large Canvas rendering block. It was the single highest-friction file in the tree — the architecture
audit flagged it [Should-fix] (§6 one-module-one-job). Two of those jobs are not controller flow at
all: the **map geometry** is pure logic (testable, sim-reachable) and the **draw primitives** are pure
presentation (ctx + data in, pixels out) — both were trapped behind controller `this`, unreachable by
tests and the balance sim.

## Decision

Extract the two genuinely-non-flow concerns, leaving the controller as the orchestrator that wires
them to the DOM/run state.

**1 · Procedural map-gen → `systems/mapgen.ts` (pure, RNG-injected).** The grid builders
`genCombined` / `genOverworld` / `genDungeon` and their carve helpers (`carveSeg`, `halo`,
`scatterAndWater`, `stampPois`, `flood`, `ensureReachable`) now operate on an explicit `MapGrid`
(`{ map, W, H }`) and **return a `GenResult`** the controller assigns onto `Field`; no `document`,
no `window`, no controller import. The controller owns the per-run "already cleared/looted" state and
passes it in as a `ClearedState` predicate bundle — so mapgen stays a pure transform. The **one
mechanical change** (skill §2): scatter, the only ambient `Math.random()` in this code, now flows
through an injected `rng: Rng = Math.random` — byte-identical when called unseeded (as the game does),
and seedable for tests. `FIELD_WALLS` lives here as the one source of truth (the controller imports it).

**2 · Canvas draw primitives → `ui/fieldRender.ts` (pure, no flow).** The stateless painterly
primitives — `castShadow`, `drawCliffFace`, `drawRecessedWater`, `drawMouthLabel`, `drawPoiCell`,
`drawStairs`, `drawTreasureMark`, `drawDungeonBoss`, `drawMob`, `bigGround`, plus `POI_KINDS` —
moved to the `ui/` layer. They take a `CanvasRenderingContext2D` + geometry + plain data (the sprite
table, names, a `wet(x,y)` probe, `bossDefeated`) and draw; they read **no** controller flow state and
mutate none. The per-frame orchestration loops (`draw` / `drawBig` / `drawTownCell`) stay in the
controller and call `FR.*` with the controller state threaded in — the renderer is "how it looks", the
controller keeps "what to draw where". A handful of *stateful* draw helpers that read run state
(`drawGorgeRimProps` → `ownedCaps`/barrier data; `poiNameAt` → `this.pois`) deliberately **stay** in
the controller; only the genuinely pure parts moved.

## Consequences

- `controllers/field.ts` sheds ~900 lines of non-flow code to the layer that matches each job; the
  map geometry is now **unit-tested** (`app/tests/mapgen.test.ts` — same seed → same map, and the
  flood-based anti-soft-lock reachability invariant) and reusable by any future tool/sim.
- Behaviour is **byte-identical**: code was moved, logic unchanged; the same maps generate and the same
  pixels draw (the unseeded default `rng = Math.random` preserves the live RNG-consumption sequence).
  Verified green: `typecheck` + `test` (379 + 9 new) + `build`; `sim` runs unchanged (the pre-existing
  Goldmeadow balance issue is unrelated — the sim imports none of the moved code).
- The renderer is now front-end-swappable in isolation (ADR 0005 goal): a new front end replaces
  `ui/fieldRender` + the controller loops while `systems/mapgen` carries over untouched.
- **Not done here (follow-up):** the remaining big-map chunk-streaming + the `draw`/`drawBig`
  orchestration loops still live in the controller (they ARE flow + per-frame iteration, legitimately
  controller-resident); a further pass could thin the loops, but the high-friction pure code is out.
