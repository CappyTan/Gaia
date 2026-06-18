# CLAUDE.md

Guidance for AI assistants working in this repo. Read this first, then the docs it points to.

## What this is

**Gaia: A World of Five Powers** — a turn-based RPG proof of concept. Final-Fantasy-style
**ATB** combat, a five-power **Attunement** affinity system, and Diablo-style **loot** with
random affixes.

A collaboration: **Dara Saadat** owns the world, lore, classes, and art. This repo brings the
gameplay mechanics. It is an early, playable POC (`v0.11`).

The entire game is a **single self-contained file: [`app/gaia.html`](app/gaia.html)**. No build
step, no server, no dependencies, no framework. Open it in any modern browser (desktop or iOS
Safari) and it runs. Persisting that property is a hard constraint — see Conventions.

## Repo map

| Path | What |
|---|---|
| [`app/gaia.html`](app/gaia.html) | **The game.** ~1570 lines: `<style>` then one `<script>`. Everything lives here. |
| [`app/tools/slice-art.py`](app/tools/slice-art.py) | Reproducible art pipeline: slices Dara's reference sheets → transparent sprites in `app/assets/`. |
| [`app/tools/balance-sim.js`](app/tools/balance-sim.js) | Headless full-run combat simulator for difficulty tuning. Loads the *shipping* script. |
| [`app/assets/`](app/assets/) | Generated game sprites (items, enemies, heroes). Rebuilt by `slice-art.py`. |
| `index.html` (root) | Landing page that redirects to `app/gaia.html` with a cache-buster. |
| [`README.md`](README.md) / [`app/README.md`](app/README.md) | Player- and build-facing overviews + implemented-feature status. |
| [`DESIGN.md`](DESIGN.md) | Full design spec: the 12 locked decisions, systems, art plan, open questions. |
| [`CONTEXT.md`](CONTEXT.md) | **Glossary of Gaia's domain language.** Use these exact terms. |
| [`docs/adr/`](docs/adr/README.md) | Architecture Decision Records (immutable rationale). |
| [`docs/design/requiem/`](docs/design/requiem/README.md) | **REQUIEM** — Dara's canonical 45-class / 250-ability combat system (source HTML + parser + JSON + MD) plus `battle-mechanics.md` (Ascension/Soul Burn/Harmonic Ascension). |
| [`docs/art/`](docs/art/README.md) | Art-pipeline resume guide, rig spec, layer brief. |
| [`assets/reference/`](assets/reference/) | Dara's raw reference art (class grid, loot charts, enemy sheet, maps). Source for `slice-art.py`. |

## Inside `app/gaia.html`

One `<script>` divided by banner comments (`/* ===== N. TITLE ===== */`). Navigate by these:

1. **CONTENT** — the Five Powers ring, classes, enemies, loot tables, affixes (`RING`, `ATT`, `RARITY`, `ITEM_NAMES`, `AFFIXES`, `SKILLS`, `PARTY_DEFS`, `ENEMIES`, `ENCOUNTERS`, `ZONES`).
2. **GAME STATE** — the `Game` object (run lifecycle, gold, inventory, merchant), `makeMember`, `recalc`.
3. **LOOT** — `makeItem`, `itemScore`, `rollDrop`.
4. **ATB BATTLE ENGINE** — `combatDamage`, gauges, turn resolution, enemy AI, status ticks.
5. **FIELD MAP** — tile grid, camera, movement, random encounters, mini-boss/boss gate (`Field`).
6. **SCREENS / OVERLAY / UI** — party, inventory, equip, merchant (`UI`, `Overlay`).
7. **TELEMETRY** — per-session + lifetime metrics, persisted to `localStorage`.
8. **MUSIC** — procedural chiptune via Web Audio (no asset files).

Paper-doll rendering (a character = stacked layers, equip swaps a layer; ADR 0004) lives near the
top: `RIG`, `renderDoll`, `BODY_LAYER`/`ARMOR_LAYER` (the latter wait on weaponless body art).

## Development workflow

There is no package.json and nothing to install. To develop:

- **Edit** `app/gaia.html` directly. Open it in a browser to play-test.
- **Syntax check** (do this after any script edit):
  ```bash
  cd app
  node -e "const fs=require('fs');const h=fs.readFileSync('gaia.html','utf8');const b=h.match(/<script>([\s\S]*?)<\/script>/)[1];fs.writeFileSync('/tmp/_check.js',b);" && node --check /tmp/_check.js
  ```
- **Balance / regression sim** (uses the real shipping `combatDamage`/`ENEMIES`/`SKILLS`/loot):
  ```bash
  node app/tools/balance-sim.js        # 60 runs (default)
  node app/tools/balance-sim.js 200    # more runs
  ```
  Targets: end-of-fight party HP ~55–75%, bosses lower (~30–50%), full-clear wipe rate <~10%.
  Tune by editing `ENEMIES`/`ZONES` in `gaia.html`, then re-run.
- **Rebuild art** (needs Python + Pillow):
  ```bash
  python3 app/tools/slice-art.py            # writes app/assets/{items,enemies,heroes}/*.png
  python3 app/tools/slice-art.py --preview  # + verification montage
  ```
- **REQUIEM canon** — if `requiem-compendium.source.html` changes, re-run the parser; never hand-edit the generated files:
  ```bash
  node docs/design/requiem/parse-requiem.js   # regenerates classes.json + REQUIEM-classes.md
  ```

The logic harness referenced in `app/README.md` (affinity/loot/leveling unit checks, boot/battle
smoke) is run as throwaway inline node scripts that extract the `<script>` block and exercise the
pure systems. Name scratch test files `_*.js` — `.gitignore` excludes them.

## Conventions

- **Single-file, zero-build is sacred.** Don't add a framework, bundler, npm dependency, or
  external runtime asset to the game. Vanilla JS; Canvas for the field map, DOM/CSS for menus and
  battle. Must keep working from `file://` and on iOS Safari. (ADR 0002 — build fresh.)
- **Match the existing code style.** It is dense, idiomatic, single-file vanilla JS: terse helpers
  (`$`, `el`, `rnd`, `ri`, `pick`, `clamp`), data-driven tables, banner-comment sections. Write to
  blend in, not to refactor toward "best practices."
- **Use Gaia's domain vocabulary precisely** (see `CONTEXT.md`). The traps:
  - **Attunement** (SOL/NOX/ANIMA/QUANTA/UMBRAXIS), not "element" or "school".
  - **Weapon Archetype** (9 of them), not "weapon class". **Class** = Attunement × Archetype (45).
  - **Rarity** for loot quality (Common→Artifact), never "tier" or "grade".
  - **Elite** = affixed normal enemy; the **boss** is the Bandit Brute (don't conflate).
- **REQUIEM is canon; the POC is a slice.** `docs/design/requiem/` is Dara's authoritative
  design (per-attunement mana mechanics, per-class resources, full kits). `gaia.html` currently
  ships an *invented placeholder* (a damage affinity ring + one signature effect per attunement)
  and only the four SOL classes. When they disagree, REQUIEM wins; the POC is to be reconciled
  toward it, not treated as the source of truth.
- **Art is Dara's lane.** Real art is sliced from his reference sheets via `slice-art.py` (the
  only sanctioned way to regenerate `app/assets/`). Generated/placeholder art must match his
  gold-on-dark palette. **Never ship the FF battle-screen reference screenshots** (Square Enix
  copyright) — they are reference only.
- **Bump `GAME_VERSION`** (`const GAME_VERSION` in `gaia.html`) on a player-visible change, and
  follow the existing `vX.Y: summary` commit-message style.
- **Record hard-to-reverse decisions as ADRs** in `docs/adr/` (short: what + why), matching the
  existing four.

## Current state (v0.11)

Two zones — **Greenvale** (Lv 1–6) → **The Duskmarsh** (Lv 7–10) — with a **merchant** between
them. Fixed all-SOL party of four: **Auren** (S&S, tank), **Kaela** (Dual Swords, DPS), **Sephi**
(Staff, caster/heal), **Rion** (Spellblade, hybrid). ATB combat, affinity ring + signature
effects, status effects, Diablo loot with affixes, elites, XP/levels/skill unlocks, mini-boss +
zone-boss gates, treasure chests, and a procedural chiptune soundtrack are all implemented.

Greenvale's five bandits use real sliced art; the other enemies fall back to emoji until art
exists. **Still placeholder:** field-map tiles + walking marker, six newer enemies, save/persistence
(`localStorage` autosave is planned). Balance is first-pass — `balance-sim.js` is the tuning loop.
