# Environmental wayfinding via derived Objectives (authored Quests reserved)

Gaia guides the player to "where to go next" through the **world** — landmarks (the Elder-Oak
across the Sunless Gorge), capability-gated **traversal barriers** (the gorge/raft soft-gate), NPC
directions (Elder Maelis in Hearthford), signposts, and a zoomed-out overview map that reveals
regions as a fog-of-war — **not** a HUD quest marker or an authored quest script. The current
**Objective** ("where to go next") is *derived* from existing run state (gates cleared, capabilities
owned, known regions) by a pure `systems/` function; a persisted **known-regions** set (mirroring the
`OwnedCaps` pattern, ADR 0007 envelope) gates the map reveal. We deliberately do **not** build a quest
engine yet, but name everything **source-agnostically** (`Objective` / `currentObjective`, never
`currentQuest`) so an authored **Quest** layer can later *supply* Objectives without a rename.

Why: it matches the no-framework, data-driven, guide-without-walls ethos (the `overworld-design`
skill) and avoids authoring + feeding a quest engine for what is still a ~one-hour POC, while keeping
direction diegetic.

## Considered Options

- **Authored quest graph + HUD objective marker** — more expressive, but heavier, off-ethos, and
  premature for the POC. Rejected for now; the naming leaves the door open to add it later as a new
  Objective *source*, not a rewrite.

## Consequences

- An **Objective exists as background run state even though it is deliberately kept OUT of the HUD**
  (surfaced only environmentally + as the map's lit destination). A future reader will find
  unsurfaced objective state — that is intentional, not dead code; show it in the HUD only if
  playtesting proves it necessary.
- Adding authored **Quests** later is a feature addition (a higher-priority Objective source), not a
  refactor. Per `CONTEXT.md`, don't add a quest engine without superseding/extending this ADR.
