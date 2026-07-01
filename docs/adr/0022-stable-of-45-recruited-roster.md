# ADR 0022 — The Stable of 45: recruited, fixed-class named heroes (DRAFT)

**Status: 🟡 PROPOSED — DRAFT / BRAINSTORM (2026-07-01).** A captured design direction from a grill
session, **not ratified and not yet in effect.** It **proposes to supersede** "Class = equipped weapon"
(REQUIEM canon; [`mna-progression.md`](../design/requiem/mna-progression.md) §3, [`CONTEXT.md`](../../CONTEXT.md))
but **does not do so yet** — the current fluid-reclass model remains the truth until Dara decides. This
doc records the proposal, its trade-offs, and the reconciliation checklist to run *if* accepted. Nothing
downstream (canon docs, ADR 0020/0021 framing, engine, content) changes on the strength of this draft.

## The idea

Replace the **fluid "swap weapon → become any of 45 classes"** model with a **stable of 45 fixed-class,
named, lore-bearing heroes** the player **recruits** and builds. You **start with 5** and **scour the
world to find and recruit the other 41**. Each hero *is* one of the 45 classes (Attunement × Weapon
Archetype), permanently.

**Motivation (Dara):** it's immersion-breaking that changing the weapon turns a hulking Umbraxis
two-handed hammer wielder into a quick Quanta pistoleer. Fixed identities keep flavor on-brand and let
each of the 45 seats carry **real lore and weight** — depth the fluid model can't give. The game's
identity shifts from a *systems sandbox* (player invents builds) toward an *authored-roster RPG* (the
45 characters are the draw) — which plays to the project's strengths (lore + art).

## Proposed decisions (all DRAFT)

**D1 · Full class-lock, 1:1 with the 45.** Each hero = one fixed Attunement × Archetype, forever. The
weapon is still a gear/power slot and **still drives MNA in the hero's own attunement** — so
[ADR 0021](0021-mna-from-gear-level-floor.md) survives intact — but the weapon slot only accepts *that*
archetype; **no cross-class reclass.** The roster is the 45 classes, exactly 1:1. The only canon
casualty is the literal "swap weapon = new class."

**D2 · Loot shifts from "build my guy" → "gear my stable."** A **shared stash** + **smart-drop bias**
toward your fielded 5. Off-class drops aren't dead — they kit out benched and not-yet-recruited heroes,
so "scour the world" doubles as "gear the whole collection." Loot stays exciting but *horizontal*
(outfit 45 over time) rather than *vertical* (perfect one build). This re-frames — but preserves — the
Diablo pillar ([ADR 0015](0015-itemization-slots-rarity-affixes.md)).

**D3 · Bench & recruits — no dead-on-arrival, no auto-max.** A recruit joins at a **level floor scaled
to progress / where found**; benched heroes earn **reduced passive XP** (drift behind, stay catch-up-
able). Crucially, because **gear is the real power source (ADR 0021), a benched hero becomes viable the
moment their loot drops** — level is a survivability floor, gear is the power. Preserves the "develop a
character" investment without rotting the bench.

**D4 · Recruitment — mixed, thematically placed.** A handful join on the **main path** (guaranteeing
early role coverage), the rest are **exploration rewards scattered across the world** — placed
**thematically by attunement** (Umbraxis heroes near the Sundering's Umbraxis scar, etc.). Recruitment
*becomes* the concrete purpose for every region and the 5 Attunement scars — a named hero as the reward
for going there. Ties directly into the `world-builder` / `creative-director` pipeline.

**D5 · Art/lore — incremental, region-gated (no 45-hero wall).** The rig is already keyed by class
(`att × archetype`), so the system can ship on the existing per-class bodies. Named portraits +
personality + lore roll out **region by region as the world is built** (build the Umbraxis scar →
author its heroes). The 5 starters get full identity first. Honest cost: 45 authored characters is a
real, long-term authoring commitment Dara owns for the life of the project.

**D6 · Starting cast & the Roster picker.** Adopt the existing 5 `PARTY_DEFS` (Auren SOL S&S tank ·
Kaela NOX dual-swords · Rion ANIMA spellblade · Sephi SOL staff healer · Liora QUANTA staff caster;
**Umbraxis deliberately absent** — recruited later) as fixed authored starters *(revisitable)*. The
Roster picker converts from a per-slot **class builder** into a **"field 5 of your stable + set
formation"** management screen that grows as you recruit.

## What's traded (the honest ledger)

- **Lost:** cross-class reclass freedom; the loot-driven "surprise reclass" adrenaline; the pure
  sandbox/twink theorycraft; the near-zero-content-cost of generating identity from gear.
- **Kept / relocated:** build diversity moves from *reclass roulette* → **roster construction +
  per-character 52-slot 3-lane builds ([ADR 0020](0020-class-wiring-approach.md)) + gear**. More
  legible, more RPG.
- **Gained:** lore weight per seat; a reason for every region to exist; and **better endgame-pillar
  fit** — Harmonic Ascension, the cross-class combo system, and Archon Type II
  ([endgame-mechanics.md](../design/classes/endgame-mechanics.md)) all attach naturally to fixed,
  named, single-attunement heroes (fluid reclass gave them nothing stable to anchor to). Note: this
  reframes ADR 0021's "free MNA allocation returns with cross-class" — in a stable, *cross-class = 
  combining different heroes*, not one hero spanning trees.

## Reconciliation checklist — to run ONLY IF accepted (not done yet)

- Supersede "Class = equipped weapon" in `CONTEXT.md` + `mna-progression.md` §3; amend the ADR 0021
  "you are your weapon" framing to "your weapon powers you *within* your class."
- Retire/repurpose ADR 0020's "weapon-swap reclass deferred"; rewrite the ADR 0021 / endgame mothball
  note on free allocation.
- Systems to build: recruitment + roster/stash + bench-XP + smart-drop bias + party-management UI;
  weapon-slot archetype restriction; recruit-at-floor scaling.
- Content: 45 characters (lore + identity + recruit hooks), staged region-by-region.
- Re-run the balance sim against the new party/gear model.

## Open questions

- Party size stays 5 (ADR 0003) — or does a bigger stable invite larger battles / reserve mechanics?
- Do the starting 5 stay fixed, or eventually a player-pick / single-protagonist framing (D6 is "for
  now")?
- Smart-drop bias strength: how hard toward the fielded 5 vs. genuine roster-wide spread?

## Source

Dara Saadat, grill session 2026-07-01. Explicitly a **brainstorm pending decision** — kept as a draft
ADR so the direction is recorded and discoverable without disturbing current canon.
