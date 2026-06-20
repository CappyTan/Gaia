# ADR 0006 — Explorable settlements & bespoke greenfield zones

**Status:** accepted (Aurelion build). Builds on [ADR 0005](0005-modular-ts-vite.md) (layering) and
the world cataloged in [`docs/design/world-atlas.md`](../design/world-atlas.md).

## Context

The POC proved the loop but cut two corners we're now outgrowing as we build out **Aurelion**:

1. **Zones share one generic corridor.** `Field.genMap()` builds the *same* 60×18 map for every
   zone — a guaranteed-walkable central band, one tree-wall gate (mini-boss), fixed chest
   coordinates, a boss tile, and a dungeon east of the gate. Layout knobs (`W`, `gate`, `chests`,
   `boss`) are hardcoded on `Field`, identical per zone, so zones differ only by tileset + encounter
   table. Greenvale and the Duskmarsh feel the same to *traverse*.
2. **Towns are one hardcoded modal-plaza.** There is a single walkable hub — the "Greenvale
   Outpost", a 15×11 plaza in `Field.genTown()` — reused between every zone. Its four buildings
   (Inn/Merchant/Smith/Revive) are walk-on tiles that immediately open a **modal overlay**. There
   are no real settlements, no NPCs, nothing to *explore or talk to* — towns are modal interludes
   wearing a map.

Dara's direction (this session): **rebuild the existing POC zones greenfield** (reuse what's good,
scrap the rest — don't be anchored to the current shapes), and give Gaia **real cities and towns the
player walks around and interacts with — NPCs, not modal interludes.** He also granted the Creative
Director **full authority over level bands, the bestiary, and encounters** to deliver a smooth,
canon-true progression.

## Decision

**1 · Zones become bespoke & data-driven (greenfield).** Lift the layout off `Field` and into the
content layer so each zone shapes its own space. Keep the *good* engine parts — the canvas/camera,
d-pad movement, encounter cadence, the chokepoint→dungeon split, chest reachability/anti-soft-lock —
but let a zone define its own size, route, gate/boss placement, POIs, and tile composition (a
per-zone layout spec and/or zone-specific generator, in `data/zones.ts`, consumed by
`controllers/field.ts`). The single shared corridor is retired. Greenvale and the Duskmarsh are
**rebuilt from scratch** against this; nothing about their current maps is load-bearing.

**2 · Settlements become first-class content.** A new `data/towns.ts` (settlements registry)
describes each place the player can walk: `id`, `name`, a tile layout (hand-authored or spec-driven),
**building POIs** (inn / merchant / smith / revive / exit, and room to grow), and **NPCs**
(position, sprite, name, and dialogue). Settlements range from a small starting **village** to a
proper **city** (e.g. Riverhearth) — same engine, bigger/denser data. The current `genTown` plaza is
replaced by loading a settlement by id; `townMode` rendering/movement is reused and extended.

**3 · In-world interaction, not modal-only.** The player **walks up to an NPC and talks** (a
lightweight dialogue surface in `ui/`, distinct from the blocking `Overlay` used for menus). Service
buildings remain (Inn/Merchant/Smith/Revive) but are part of the explorable settlement — entered by
walking in, optionally fronted by a keeper NPC. Goal: a town you *inhabit*, where the merchant is a
place you visit, not a popup that *is* the town. Keep `Overlay` for the heavier service UIs
(merchant grid, party/bag) at first; convert toward in-world panels over time.

**4 · Placeholders are first-class; art gaps are tracked, not blockers.** New tile kinds, NPC
sprites, and building art that don't exist yet render as labelled placeholders (the existing
emoji/colour fallback pattern), and every gap is logged in a running **asset-gap list**
([`docs/design/asset-gaps.md`](../design/asset-gaps.md)) for Dara to hand to the art creator. Build
the *system* against placeholders; slice real art later via `slice-art.py` (art is Dara's lane).

**5 · Progression authority.** The Creative Director sets **level bands, the bestiary, and encounter
composition** (Dara's grant) to tune a smooth curve — within REQUIEM canon, with `balance-tuner`
validating the numbers via the sim.

## Consequences / trade-offs

- **Respects ADR 0005 layering.** Town/zone *content* (layouts, NPCs, dialogue, bands) is pure
  `data/`; field/town/dialogue *flow* is `controllers/`; the dialogue surface is `ui/`. `data/` and
  `systems/` stay DOM-free. No new runtime framework; stays statically hostable + iOS-Safari-safe.
- **Bigger content surface.** Bespoke zones and hand-authored settlements are more data to author and
  maintain than one generic corridor — that's the point, and it's the cost.
- **Anti-soft-lock still mandatory.** Bespoke layouts must keep the guaranteed-traversable
  invariant (reachable boss, reachable chests, no stranding trigger) — now enforced per zone.
- **Migration, not preservation.** Greenvale/Duskmarsh are greenfield; reusable code (camera,
  movement, encounter roll, dungeon split) carries over, the rest is replaced. `app/gaia.html`
  remains the frozen pre-modular reference.
- **Save/persistence** is still future work (localStorage autosave planned), unchanged by this ADR.
