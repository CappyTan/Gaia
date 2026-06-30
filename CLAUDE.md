# CLAUDE.md

Guidance for AI assistants working in this repo. Read this first, then the docs it points to.

## What this is

**Gaia: A World of Five Powers** — a turn-based RPG proof of concept. Final-Fantasy-style
**ATB** combat, a five-power **Attunement** affinity system, and Diablo-style **loot** with
random affixes.

A collaboration: **Dara Saadat** owns the world, lore, classes, and art. This repo brings the
gameplay mechanics. It began as a single-zone POC and is now a substantial vertical slice
(`v0.157`): one full continent — **Aurelion** — built and playable as a seamless overworld.

The game is a **TypeScript + Vite** app (ADR 0005). Source lives in `app/src/`, split into clean
layers; it builds to a static bundle hosted on **GitHub Pages**. No runtime framework — vanilla
TS, Canvas for the field map, DOM/CSS for menus and battle. (The original single-file build is
frozen at `app/gaia.html` as a reference; see History.)

## Repo map

| Path | What |
|---|---|
| [`app/index.html`](app/index.html) | **Vite entry** — the shell markup + styles; loads `src/main.ts`. |
| [`app/src/`](app/src/) | **The game**, as TypeScript modules (see Architecture). |
| [`app/tools/balance-sim.ts`](app/tools/balance-sim.ts) | Headless full-run combat simulator; imports the *shipping* systems. |
| [`app/tools/dungeon-map.ts`](app/tools/dungeon-map.ts) | Headless dungeon-floor **topology** dumper (`npm run map`); ASCII map + a rubric-keyed read (mesh/corridor loops, soft-lock, gate-pinch) on the pure `systems/dungeonTopology`. For the dungeon design/review agents. |
| [`app/tools/class-spec-lint.ts`](app/tools/class-spec-lint.ts) · [`gen-class-specs.ts`](app/tools/gen-class-specs.ts) | V3 class pipeline (ADR 0020): the **linter** (`npm run lint:classes`, vitest-gated) checks the 45 numberless specs' 52-slot invariants; the **generator** (`npm run gen:classes`) transcribes them → `data/classSpecs.generated.ts` (committed/never hand-edited). |
| [`app/tools/slice-art.py`](app/tools/slice-art.py) | Reproducible art pipeline: slices Dara's reference sheets → transparent sprites in `app/assets/` (companions `slice-enemies`/`slice-equipment`/`slice-rares`/`slice-backgrounds`/`slice-crit-fx`/`process-bg` handle the specific sheet types). |
| [`app/tests/`](app/tests/) | Vitest unit tests for the pure systems. |
| [`app/assets/`](app/assets/) | Generated game sprites (items, enemies, heroes). Hashed + copied into the build by Vite. |
| `app/gaia.html` | **Frozen** pre-modular single-file build (v0.11), kept as reference/fallback. Don't develop here. |
| `package.json` · `tsconfig.json` · `vite.config.ts` | Toolchain (repo root). |
| `.github/workflows/deploy-pages.yml` | CI: build + deploy `dist/` to GitHub Pages. |
| [`README.md`](README.md) / [`app/README.md`](app/README.md) | Player- and build-facing overviews + implemented-feature status. |
| [`DESIGN.md`](DESIGN.md) | Full design spec: the 12 locked decisions, systems, art plan, open questions. |
| [`CONTEXT.md`](CONTEXT.md) | **Glossary of Gaia's domain language.** Use these exact terms. |
| [`docs/adr/`](docs/adr/README.md) | Architecture Decision Records (immutable rationale). |
| [`docs/design/requiem/`](docs/design/requiem/README.md) | **REQUIEM** — Dara's canonical 45-class / 250-ability combat system + battle mechanics (Ascension / Soul Burn / Harmonic Ascension / Archon Types). |
| [`docs/design/affinity-ring.md`](docs/design/affinity-ring.md) | Ratified affinity-ring design — lore matchups, the **±15%** tuning, and flagged future systems (continent identity, corrupted attunements, raid rotation). |
| [`docs/design/world-atlas.md`](docs/design/world-atlas.md) | **World Atlas** — catalog of every overworld region (4 continents + the Sundering's 5 Attunement scars) and underworld complex from Dara's maps, their geography/connections, and the **gaps for Dara to fill** before building. |
| [`docs/design/legendary-figures.md`](docs/design/legendary-figures.md) | **Legendary Figures** — Dara's roster of singular, mythic-scale beings (human/monster/non-human) that exist *above* the ordinary scale and **transcend the affinity ring**. Canon record, added as we go (first: The Last Lagrangian). |
| [`docs/design/dungeon-design-research.md`](docs/design/dungeon-design-research.md) | **Dungeon-design research basis** — JRPG best practices (pacing, layout, puzzles, reward/loot, difficulty/boss gating) synthesized for Gaia, with a source-confidence ledger. The *why* behind the `dungeon-design` skill. |
| [`docs/design/overworld-design-research.md`](docs/design/overworld-design-research.md) | **Overworld-design research basis** — world-map best practices (believable geography, distinct regions, the triangle rule / guide-without-walls, terrain/difficulty gating, exploration reward, seamless navigation) synthesized for Gaia's seamless big-map, with a source-confidence ledger. The *why* behind the `overworld-design` skill. (Surface: only the five scars are *strictly* attuned; other regions may carry a light optional affinity lean.) |
| [`docs/art/`](docs/art/README.md) | Art-pipeline resume guide, rig spec, layer brief. |
| [`assets/reference/`](assets/reference/) | Dara's raw reference art (class grid, loot charts, enemy sheet, maps). Source for `slice-art.py`. |

## Architecture (`app/src/`)

Strict one-way layering (ADR 0005). The rule that keeps it scalable: **nothing in `data/` or
`systems/` may import a controller or the DOM.**

```
data  ←  systems  ←  controllers  →  ui
                         ↓
                  services (audio, telemetry) · core
```

| Layer | Dir | What lives here |
|---|---|---|
| **Content** | `data/` | `attunements`, `rarity`, `items` (+affixes), `skills`/`classes`/`requiem-kits` (the 45 class kits), `party`, `enemies`, `zones`, `world` (the seamless Map/Continent/Zone/Area hierarchy + traversal `BARRIERS`, ADR 0009), `towns` (settlements + NPCs), `heldItems`, `art` tables, `changelog`, `version`. Pure data — add a zone/enemy/class/skill/region here, not in the engine. `db` is the **content registry** (typed query API + cross-refs: which zones spawn an enemy, which classes use a skill); `validate` is the **integrity check** (run in tests + a dev-startup assert). Query via `DB` rather than reaching into raw consts. |
| **Logic** | `systems/` | **Pure, no DOM, tested:** `affinity`, `combat` (`combatDamage`, `makeEnemy`, status), `loot`, `progression`, `enemyAbilities`, `encounter` (pure encounter composition), `mapgen` (pure procedural zone/dungeon grid-gen, RNG-injected, ADR 0012), `save` (versioned run state, ADR 0007), `inventory`, `traversal` (capability-gated barriers), `gearScore`, `reprieve` (dungeon rest, ADR 0010), `dungeonTopology`. RNG is injectable for determinism. |
| **Presentation** | `ui/` | `render` (paper-doll, item HTML, sprites, badges), `fieldRender` (pure field-canvas draw primitives — biome dressing, captioned POIs/mouths, figure-ground water/cliff/boss setpieces, ADR 0012), `overlay`, `dialogue` (NPC conversations). Returns HTML/draws; no game flow. |
| **Orchestration** | `controllers/` | DOM-touching app flow: `game` (lifecycle + run state + merchant), `battle` (ATB engine + battle screen), `field` (seamless overworld + towns + dungeons, chunk streaming + the per-frame draw loop that wires `systems/mapgen` + `ui/fieldRender` to the DOM), `roster` (party builder), `menus` (party/bag/equip), `minimap` + `worldMap` (wayfinding), `dataBrowser`, `screens`. |
| **Infra** | `core/` | `rng`/utils, `dom` helpers, `events` (typed bus), `assets` (Vite `import.meta.glob` URL resolver), `wakelock` (keep-awake). |
| **Services** | `audio/`, `telemetry/` | `Music` (procedural chiptune), `Telemetry` (localStorage metrics + optional `endpoint` upload). |
| **Boot** | `main.ts` | Wires controllers to the DOM, publishes the inline-handler `window` bridge, starts music + title. |

`types.ts` holds shared domain interfaces (`Unit`, `Member`, `Enemy`, `Item`, `Skill`, …).
Swapping the front end later = replace `ui/` + `controllers/`; `data/` + `systems/` carry over.

**Inline-handler bridge (transitional):** `app/index.html` uses `onclick="Game.start()"` etc.;
`main.ts` publishes those controllers on `window` (typed in `globals.d.ts`). A future pass should
move to delegated listeners and drop the globals.

## Development workflow

Requires Node (≥18) + npm. First time: `npm install`.

- **Dev server (HMR):** `npm run dev` — opens the game; edit `app/src/**` and it hot-reloads.
  (It needs the server — the modular app does **not** run from `file://`.)
- **Type-check:** `npm run typecheck` (`tsc --noEmit`). Do this after any non-trivial change.
- **Tests:** `npm test` (Vitest, headless) — unit tests for the pure `systems/`. Add tests there.
- **Build:** `npm run build` (`tsc --noEmit && vite build` → `dist/`). CI runs this to deploy.
- **Balance / regression sim:** `npm run sim` (60 runs) or `npm run sim 200`. Imports the real
  shipping systems. Targets: end-of-fight party HP ~55–75%, bosses lower (~30–50%), full-clear
  wipe rate <~10%. Tune by editing `data/enemies.ts` / `data/zones.ts`, then re-run.
- **Dungeon topology map:** `npm run map` (every dungeon floor), `npm run map <zone>` (one zone, by id
  or index), `npm run map <zone> <floor>` (one floor). ASCII map + a rubric-keyed read (mesh vs
  corridor loops, hubs/dead-ends, rest/shortcut, **soft-lock**, mini-boss **gate-pinch**) for the
  level-designer/level-design-reviewer to assess a floor objectively. Pure: `systems/dungeonTopology`.
- **Rebuild art** (needs Python + Pillow): `python3 app/tools/slice-art.py` (`--preview` adds a
  montage). Writes `app/assets/{items,enemies,heroes}/*.png`.
- **REQUIEM canon** — if `requiem-compendium.source.html` changes, re-run the parser; never
  hand-edit the generated files: `node docs/design/requiem/parse-requiem.js`.
- **Class specs (V3, ADR 0020)** — the 45 numberless design specs (`docs/design/classes/*.md`) are
  validated by `npm run lint:classes` (a vitest-gated structural linter) and transcribed into engine
  data by `npm run gen:classes` (`app/tools/gen-class-specs.ts` → `data/classSpecs.generated.ts`,
  **committed/never hand-edited** — re-run it when a spec changes; the generator reproduces the original
  hand-encoded Heliomancer exactly, the validation anchor).

## Shipping changes (Git & deploy) — agents own this; Dara never touches git

**Dara is a designer, not a developer, and contributes _only_ through Claude sessions.** He
describes what he wants; the agent does all the git/PR/deploy work and tells him when it's live.
He should never be asked to run a git command or resolve a conflict. Follow this flow so the
finicky parts don't surface:

- **The pipeline:** develop on the session's dev branch → open a PR → **squash-merge to `main`** →
  the `deploy-pages.yml` Action builds and publishes to **GitHub Pages**. The live game *is* the
  deployed `dist/` on `main`. Nothing is "live" until that post-merge deploy goes green.
- **Re-cut the dev branch from `main` before starting new work:**
  `git fetch origin main && git checkout -B <branch> origin/main`. **This is the fix for the
  recurring rebase/force-push pain.** A squash-merge replaces your branch's commits with one new
  commit on `main`, so a *reused* branch always diverges and conflicts next time. Starting each
  change from a fresh `main` base avoids it. (The first push after re-cutting needs
  `--force-with-lease` — that's expected and safe; the old commits are already merged.)
- **Verify locally before merging — this is the real gate.** `npm run typecheck && npm test &&
  npm run build` must all be green. **PRs opened via the Claude/GitHub-App token do NOT trigger
  the PR validation workflow** (a GitHub anti-recursion safeguard), so the PR shows no checks /
  "pending" — that's normal, not a failure. The authoritative CI is the `push → main` deploy run,
  which re-runs typecheck+test+build and **won't publish if any fail**. So a red local test = a
  failed deploy = not live.
- **Keep tests deterministic.** `systems/` use RNG; a test that doesn't pin/seed it (mock
  `Math.random`, or use `seeded` from `core/rng`) can pass locally and randomly **fail the deploy**.
  A flaky test is a broken deploy — fix the determinism, don't just re-run.
- **Commit identity & `main` history:** commit as `Claude <noreply@anthropic.com>`. GitHub's
  squash-merge commit on `main` is authored by the repo owner and committed by
  `GitHub <noreply@github.com>` — that's normal and shows **Verified**; **never amend or
  force-push `main`** to "fix" it. Only the dev branch is force-pushable (right after re-cutting
  from `main`). Don't commit the model identifier into any artifact (commit/PR/code) — chat only.
- **Always tell Dara the outcome in plain terms:** what changed, that it's merged, and that the
  live site is updated (or what failed and that you're handling it) — not the git mechanics.
- **Don't hand-run this flow — use the tooling.** The `deploy` skill
  ([`.claude/skills/deploy/SKILL.md`](.claude/skills/deploy/SKILL.md)) is the step-by-step clean
  deploy; the **`devops`** agent owns the whole lifecycle and follows that skill (it merges/pushes/
  deploys, unlike read-only `release-shepherd`). To ship: run `/deploy` or hand off to `devops`.

## Conventions

- **No runtime framework.** Vanilla TS + Canvas/DOM; Vite is a build tool, not a runtime dep.
  Don't add React/etc. or a heavy game engine. Must stay statically hostable (GitHub Pages) and
  keep working on iOS Safari. (ADR 0005, which supersedes ADR 0002's single-file clause.)
- **Respect the layering.** `data/` and `systems/` stay pure (no DOM, no controller imports) so
  they remain testable and reusable. New content goes in `data/`; new pure logic in `systems/`
  (with a test); DOM/flow in `controllers/`/`ui/`. Keep combat math in `systems/combat` so the
  sim and tests exercise the same code the game ships. The full architectural-health rubric —
  layering, the `DB` registry seam + `validate` net, injectable RNG, `types.ts` modeling,
  abstractions/coupling — is the **`architecture-review`** skill
  ([`.claude/skills/architecture-review/SKILL.md`](.claude/skills/architecture-review/SKILL.md));
  read it before a non-trivial change to `app/src/**`, and use the **`architecture-reviewer`**
  agent (read-only, whole-module/repo structural review) and the **`refactorer`** agent
  (applies behavior-preserving structural fixes) to keep the codebase easy to work in. They are
  the structural lens; `code-reviewer` / `/code-review` stay the diff-correctness lens.
- **Match the existing code style.** Terse, idiomatic, data-driven; small helpers (`$`, `el`,
  `rnd`, `ri`, `pick`, `clamp`, `cap`). Write to blend in.
- **Type it.** `strict` is on; keep `npm run typecheck` clean. Prefer real interfaces in
  `types.ts` over `any`.
- **Use Gaia's domain vocabulary precisely** (see `CONTEXT.md`). The traps:
  - **Attunement** (SOL/NOX/ANIMA/QUANTA/UMBRAXIS), not "element" or "school".
  - **Weapon Archetype** (9 of them), not "weapon class". **Class** = Attunement × Archetype (45).
  - **Rarity** for loot quality (Common→Artifact), never "tier" or "grade".
  - **Elite** = affixed normal enemy; **Champion** = a tankier multi-affix *pack leader* (a tier
    above elite); each zone has its own **boss** zone-gate fight (Greenvale's is the Bandit Kingpin) — don't conflate the three.
- **REQUIEM is canon; the POC is a slice.** `docs/design/requiem/` is Dara's authoritative
  design (per-attunement mana, per-class resources, full kits, Ascension/Soul Burn/Archon). The
  game ships an *invented placeholder* (a damage affinity ring + one signature effect per
  attunement) and all 45 class kits (8 hand-tuned, 37 generated from canon). When they disagree, REQUIEM wins; reconcile toward it.
- **Dara is the primary designer of classes, abilities, and lore; agents are support.** He authors
  this content; AI agents (and the main loop) **assist** — implement his designs, draft proposals for
  his review, fill genuine gaps, and **flag conflicts/issues for him to decide**. Agents never
  overrule his canon. Invent only into real gaps, reconcile toward REQUIEM, and when canon and a
  proposal disagree, *surface it for Dara* rather than changing the canon. The `requiem-canon-keeper`
  flags; **Dara rules.** (Combat-balance numbers, level layout, loot scaling, art pipeline, etc.
  remain agent-driven — it's specifically class/ability/lore *design* that is Dara's to own.)
- **Art is Dara's lane.** Real art is sliced from his reference sheets via `slice-art.py` (the
  only sanctioned way to regenerate `app/assets/`). Generated/placeholder art must match his
  gold-on-dark palette. **Never ship the FF battle-screen reference screenshots** (Square Enix
  copyright) — they are reference only.
- **Bump `GAME_VERSION`** (`app/src/data/version.ts`) on a player-visible change, and follow the
  existing `vX.Y: summary` commit-message style.
- **Record hard-to-reverse decisions as ADRs** in `docs/adr/` (short: what + why).

## Current state (v0.200 — V3 systems live)

**One full continent — Aurelion, the Heartland — is built and playable** as a single **seamless
overworld** (ADR 0008/0009): one continuous ~960×640-tile coordinate space you roam with **no
loads**, streamed in chunks, with a `Map › Continent › Zone › Area › Tile` hierarchy resolved by
point-in-polygon (`data/world.ts`). The other three continents (Varkhaz, Myr'Thalas, the Sundering)
and the whole underworld are **mapped but unbuilt backlog** — filled in via the `world-builder` /
`creative-director` pipeline.

**The Aurelion arc (≈L1–25), ten zones, each with a front-door town + a dungeon:** Greenvale
(Hearthford) → Silverwood (Elderbough) → The Duskmarsh (Miregard) → Goldmeadow (Wheatcross) → Storm
Coast (Wrackport) → Riverhearth (the trade city) → Frostpeak (Frosthold) → Dawnfall (Lastlight) →
Whisper Hills (Vesperhal) → Sunbridge (Sunpier, the siege finale). Some zones are **spine** (the
critical path), others **optional** side-content. Crossings between zones can be **soft-gated by
traversal barriers / capabilities** — e.g. the **Sunless Gorge**, crossable once you own the
**raft** dropped by the Bandit Kingpin (the wayfinding model is ADR 0011).

**Towns & NPCs (ADR 0006):** ten explorable settlements, each its own walkable place with named,
hand-painted townsfolk whose talk points you down the road — plus an inn (paid rest), a market
(merchant), a smith, and a shrine.

**Combat & systems:** ATB **battle screen**; the **affinity ring** + per-Attunement signature
effects; status effects; a **party of five** (3 front / 2 back) the player **builds in the Roster
picker** (Attunement-diverse default, **no SOL bias**); **all 45 classes** have distinct kits (8
SOL/NOX hand-tuned, 37 generated from REQUIEM canon → `data/requiem-kits.ts`); **MNA-gated**
abilities + a point allocator; XP/levels; Diablo **loot** with **six equip slots**, **level-banded**
rarity + steep **ilvl scaling**, **elites + champion packs**, a **gear score** read-out; ultra-rare
**treasure monsters**; mini-boss + zone-boss gates; **ten multi-floor dungeons** (each a distinct
layout) with **tailored rest reprieves** (ADR 0010 — partial/themed, never a full heal; the two
caves get none). The currency is **Aether (◈)**. Balance is tuned via `balance-sim.ts`.

**Persistence & platform:** **version-tolerant save/resume** (ADR 0007 — autosave + Continue,
graceful migration). Installs as an **iOS/desktop PWA**: offline service worker, auto-update,
full-screen with notch / home-indicator safe areas, screen-wake-lock, branded splash. A player
**minimap** (`m`) + a (dev) **world map** aid orientation.

**Art:** the **entire Aurelion pack is real hand-painted art** (Dara's sheets, sliced) — every town,
dungeon, biome, enemy, NPC, the hero walk cycle, all six equip slots across five Attunements × six
rarities, and crit-hit VFX. Gold-on-dark emoji / flat-fill placeholders now remain **only for the
unbuilt backlog continents**; every gap is logged in `docs/design/asset-gaps.md`.

**Shipped — the V3 systems rewrite** (ADRs 0014–0020): a coordinated *breaking* upgrade that was
developed on a long-lived branch and **flipped to `main` at `v0.200`** (the one deliberate flip; ADR 0018).
**What it delivered:** the **Stat System V3** (five primaries STR/AGI/VIT/SPD/DEF
+ the final-20 Matter/Energy secondary stats + dual-source substats + typed combat); the **enemy V3
cutover** (level-scaled enemies DERIVE stats from role+lvl, `systems/enemyStats`); **itemization** (ADR
0015 — slot-locked affixes); the **buff/debuff catalog** (ADR 0016 — instance status model live in
combat, `systems/status`); the **resource economy** (ADR 0019 — five party-shared per-Attunement pools,
`systems/resources`, per-ability gen/cost); and the capstone **52-slot class system** (ADR 0020): the
**3-lane choice system wired into live member progression** (`systems/choice` + `systems/classKit` →
`controllers/battle`), **all 45 classes** transcribed from their numberless design specs (the generator
`app/tools/gen-class-specs.ts` → `data/classSpecs.generated.ts`, **committed/never hand-edited**) and
usable in combat, **picks + Resource pools persisted** (`systems/save`), and **passive effects** applied
(`systems/passives`). A dev **Test Loop** harness (ADR 0017, title screen) — a fight/loot/equip bench
that borrows run-state behind `Game.testMode` + a per-action **BattleLog** dashboard — is built on top.
**What remains is design + tuning, not engineering:** balance tuning of the first-pass numbers (the Test
Loop is the bench), and Dara's per-passive/per-ability design refinements + the ADR 0019/0020 canon
residuals (Soul Burn, bespoke meters, respec-vs-permanent picks). (Earlier: the Greenvale→Silverwood
wayfinding streamline, ADR 0011.)

## History

`app/gaia.html` is the frozen pre-modular single-file build (v0.11) — the version ADR 0002
described. It still runs from `file://`. All active development happens in `app/src/`.
