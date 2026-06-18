# Gaia: A World of Five Powers — POC Design Spec

> Vertical-slice proof of concept. Dara Saadat owns the world, lore, classes, and art;
> this build brings the gameplay mechanics. Decisions below were locked in a grilling
> session on 2026-06-17. Immutable decision records are in [`docs/adr/`](docs/adr/).

## Executive summary

A Final-Fantasy-style, ATB turn-based RPG set in Dara's world of Gaia. The POC is a single
zone (**Greenvale**) delivering ~1 hour of play: a fixed party of four SOL-attunement
characters walks a tile field map, fights random encounters that escalate to a boss
(the Bandit Brute), levels up, unlocks skills, and chases Diablo-style loot with random
affixes. Built fresh as a self-contained HTML file that runs in a browser and on iOS Safari.

## Locked decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Title | **Gaia: A World of Five Powers** |
| 2 | Scope | Single-zone vertical slice (**Greenvale**), ~1 hour of gameplay |
| 3 | Classes | Dara's 45 (9 Weapon Classes × 5 Attunements). **None** carried over from any prior project |
| 4 | Party | Fixed **all-SOL** party of 4: Sword & Shield (tank), Dual Swords (DPS), Staff (caster/heal), Spellblade (hybrid) — see [ADR 0003](docs/adr/0003-fixed-sol-party.md) |
| 5 | Field model | Tile-grid movement + **random encounters**; Bandit Brute is a fixed boss |
| 6 | Battle model | **ATB** (Active Time Battle) — see [ADR 0001](docs/adr/0001-atb-over-turn-based.md) |
| 7 | Five Powers | Affinity ring (damage multipliers) **+ a signature effect per attunement** |
| 8 | Loot | Dara's **named items = rarity rungs**, with **random affixes** rolled on top |
| 9 | Elites | Lightweight: some encounters spawn an elite with 1-2 affixes + guaranteed better drop |
| 10 | Progression | **Levels + loot + skill unlocks** (~Lv 1→8 over the slice) |
| 11 | Art | **Generate to fill gaps** (match Dara's palette) + slice his real art where it exists |
| 12 | Architecture | **Build fresh, no code reuse** from the dungeon engine — see [ADR 0002](docs/adr/0002-build-fresh.md) |

## The world (Dara's — 100%)

- **Gaia**, "A World of Five Powers." The Five Powers are the Attunements: **SOL, NOX,
  ANIMA, QUANTA, UMBRAXIS**.
- **Greenvale** — the starter zone. Bestiary (levels 1-5): Highway Bandit, Thieves'
  Cutpurse, Marauder, Outlaw Archer, **Bandit Brute** (boss).
- Reference art lives in [`assets/reference/`](assets/reference/): the 45-class grid, four
  SOL loot charts (Sword & Shield, Dual Swords, Staves, Spellblades), the Greenvale enemy
  sheet, the FF battle-screen reference, and two world maps.

## Systems

### Battle (ATB)
- Each combatant has an ATB gauge that fills at a rate set by **SPD**. When full, that
  combatant acts; party members open the command menu (Attack / Skill / Item / Defend /
  Flee), enemies act on AI. Enemy gauges keep filling in real time.
- Underlying resolution (damage formula, hit/crit, status application, targeting,
  front/back positioning) re-implements the *concepts* proven in the dungeon engine, fresh
  for ATB. Five combat stats: **HP, MP, ATK, SPD, Armor** (SPD drives gauge speed).
- Layout matches the reference: party right, enemies left, command menu + HP/MP panel.

### The Five Powers
- **Affinity ring (to confirm with Dara's lore):** a 5-cycle where each power is strong
  vs. the next and weak vs. the previous. Working proposal:
  `SOL → NOX → ANIMA → QUANTA → UMBRAXIS → SOL` (each beats the next). Strong hit ≈ +50%,
  resisted hit ≈ −50%, neutral ×1.
- **Signature effect per attunement (to confirm):** SOL = Burn/Blind; NOX = Decay (DoT);
  ANIMA = Regen/Poison; QUANTA = crit/dodge RNG swings; UMBRAXIS = Drain/Fear.
- With an all-SOL party, the ring matters through **enemy** attunements: Greenvale bandits
  get assigned attunements so some take bonus SOL damage and some resist it.

### Loot (Diablo model)
- **Rarity** ladder: Common → Uncommon → Rare → Epic → Legendary → Artifact. Rarity sets
  base-stat magnitude and **how many affixes** roll (e.g. Common 0, Rare 2, Epic 3,
  Artifact 5+).
- **Named items** come straight from Dara's four SOL charts (the SOL drop tables); icons
  sliced from the chart art. Examples: SOL S&S Common "Dawnwatch Guard" → Artifact "Eternal
  Radiance"; SOL Staves Legendary "Dawnbreaker"; SOL Dual Swords Epic "Solar Flare Blades."
- **Affixes** roll from a small pool: +ATK%, +crit, +SPD, +HP, +SOL damage, lifesteal, etc.
- Three equip slots per character (weapon / armor / trinket) is the starting model; weapon
  is the attunement-bound, art-backed slot.

### Elites
- A normal enemy variant flagged **Elite**: 1-2 random affixes (Frenzied +SPD, Ironhide
  +armor, Vampiric lifesteal, Scorched = adds SOL damage), gold name + battle aura,
  guaranteed Rare-or-better drop. Reuses the loot affix engine.

### Progression
- Battles grant XP → level-ups (stat growth) across ~Lv 1→8. Each character unlocks a new
  ATB skill every couple of levels (proposed ~4 skills per class by end of slice). Loot is
  the primary gear-power source on top of levels.
- Win = defeat the Bandit Brute. Lose = party wipe.

## Architecture & tech

- **Build fresh** (ADR 0002): a clean ATB+FF codebase, no code copied from any prior engine.
  A prior round-based engine's *mechanics concepts* and engineering discipline (modular,
  test-driven, single-file build) are honored, not its code.
- **Code location:** this repo, [`app/`](app/) — a single self-contained `gaia.html`.
- **Stack:** vanilla JS, no framework. Canvas for the tile field map; DOM/CSS for menus and
  the battle screen overlay. Single self-contained `gaia.html`, no build step, no server,
  mobile-friendly (iOS Safari).
- **Persistence (proposed):** light autosave to `localStorage` so a session can resume.

## Art plan

| Asset | Source |
|---|---|
| Loot item icons | Slice from Dara's 4 SOL charts (real) |
| Enemy battle figures (5) | Slice from the Greenvale sheet (real) |
| Party battle portraits (4) | Slice the 4 SOL classes from the 45-grid (real, low-res — may regenerate) |
| Field-map tiles | **Generate** (match Dara's palette) |
| Field walking sprites | **Generate** |
| Battle backgrounds (per environment) | **Generate** (reference uses copyrighted FF screenshots — do not ship those) |

## Open / to confirm with Dara
- The affinity-ring ordering and the per-attunement signature effects (lore-driven).
- Whether the named-item lists from the charts are final SOL drop tables.
- Art-style sign-off on any generated tiles/sprites/backgrounds (his lane).

## Items recommended (not yet grilled)
- Skills: ~4 ATB skills per class, themed to weapon + SOL.
- Stack + persistence choices above.
- Code location (precedent vs. "no code in EA" rule).
