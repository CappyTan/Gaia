# CLAUDE.md

Guidance for AI assistants working in this repo. Read this first, then the docs it points to.

## What this is

**Gaia: A World of Five Powers** — a turn-based RPG proof of concept. Final-Fantasy-style
**ATB** combat, a five-power **Attunement** affinity system, and Diablo-style **loot** with
random affixes.

A collaboration: **Dara Saadat** owns the world, lore, classes, and art. This repo brings the
gameplay mechanics. It is an early, playable POC (`v0.12`).

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
| [`app/tools/slice-art.py`](app/tools/slice-art.py) | Reproducible art pipeline: slices Dara's reference sheets → transparent sprites in `app/assets/`. |
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
| **Content** | `data/` | `attunements`, `rarity`, `items` (+affixes), `skills`, `party`, `enemies`, `zones`, `art` tables, `version`. Pure data — add a zone/enemy/class/skill here, not in the engine. `db` is the **content registry** (typed query API + cross-refs: which zones spawn an enemy, which classes use a skill); `validate` is the **integrity check** (run in tests + a dev-startup assert). Query via `DB` rather than reaching into raw consts. |
| **Logic** | `systems/` | **Pure, no DOM, tested:** `affinity`, `combat` (`combatDamage`, `makeEnemy`, status), `loot`, `progression`, `enemyAbilities`. RNG is injectable for determinism. |
| **Presentation** | `ui/` | `render` (paper-doll, item HTML, sprites, badges) + `overlay`. Returns HTML/draws; no game flow. |
| **Orchestration** | `controllers/` | DOM-touching app flow: `game` (lifecycle + run state + merchant), `battle` (ATB engine + battle screen), `field` (tile map), `menus` (party/bag/equip), `screens`. |
| **Infra** | `core/` | `rng`/utils, `dom` helpers, `events` (typed bus), `assets` (Vite `import.meta.glob` URL resolver). |
| **Services** | `audio/`, `telemetry/` | `Music` (procedural chiptune), `Telemetry` (localStorage metrics). |
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
- **Rebuild art** (needs Python + Pillow): `python3 app/tools/slice-art.py` (`--preview` adds a
  montage). Writes `app/assets/{items,enemies,heroes}/*.png`.
- **REQUIEM canon** — if `requiem-compendium.source.html` changes, re-run the parser; never
  hand-edit the generated files: `node docs/design/requiem/parse-requiem.js`.

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
  sim and tests exercise the same code the game ships.
- **Match the existing code style.** Terse, idiomatic, data-driven; small helpers (`$`, `el`,
  `rnd`, `ri`, `pick`, `clamp`, `cap`). Write to blend in.
- **Type it.** `strict` is on; keep `npm run typecheck` clean. Prefer real interfaces in
  `types.ts` over `any`.
- **Use Gaia's domain vocabulary precisely** (see `CONTEXT.md`). The traps:
  - **Attunement** (SOL/NOX/ANIMA/QUANTA/UMBRAXIS), not "element" or "school".
  - **Weapon Archetype** (9 of them), not "weapon class". **Class** = Attunement × Archetype (45).
  - **Rarity** for loot quality (Common→Artifact), never "tier" or "grade".
  - **Elite** = affixed normal enemy; **Champion** = a tankier multi-affix *pack leader* (a tier
    above elite); the **boss** is the Bandit Brute (don't conflate the three).
- **REQUIEM is canon; the POC is a slice.** `docs/design/requiem/` is Dara's authoritative
  design (per-attunement mana, per-class resources, full kits, Ascension/Soul Burn/Archon). The
  game ships an *invented placeholder* (a damage affinity ring + one signature effect per
  attunement) and only the four SOL classes. When they disagree, REQUIEM wins; reconcile toward it.
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

## Current state (v0.33)

Two zones — **Greenvale** (Lv 1–6) → **The Duskmarsh** (Lv 7–10, dungeon = the Drowned Vault) —
with a **merchant** between them. **Party of five** (3 front / 2 back): the front line is targeted
first, the back line (casters/ranged) is shielded. At the start the player **builds their own
party** in the **Roster picker** — each hero's **Attunement × Archetype** (= class) and row.
**No SOL default / no SOL bias anywhere**: the suggested default party is Attunement-diverse
(Auren SOL S&S · Kaela NOX Dual · Rion ANIMA Spellblade front, Sephi SOL Staff · Liora QUANTA Staff
back) and enemy attunements are spread across the ring so any comp gets matchups. **All 45 classes
have distinct ability kits**: the 8 SOL/NOX S&S·Dual·Staff·Spellblade kits are hand-tuned; the
other 37 are generated from Dara's REQUIEM canon by `docs/design/requiem/gen-kits.cjs` →
`data/requiem-kits.ts` (canon names, heuristic mechanics — reconcile/balance over time).
`KITS_GENERIC` remains only as a safety fallback.

ATB combat, affinity ring + signature effects, status effects, Diablo loot (per-attunement
painterly weapon + armor art, ilvl/MNA scaling), **elites + champion packs** (tanky multi-affix
pack leaders), XP/levels/MNA allocator, mini-boss + zone-boss gates, treasure chests, and a
procedural chiptune soundtrack are all implemented. **Six equip slots** — weapon · helmet · armor
(chest) · gloves · boots · trinket; the four armor-family slots share the armor art/name set and
each has its own stat lean (chest=HP, helmet=HP/MP, gloves=ATK, boots=SPD). Loot rarity is
**level-banded** (`rarityBand` in `systems/loot.ts`: ~L10 uncommon/rare→lucky epic, L20 rare/epic→
lucky legendary, L30+ artifacts appear) with steep **ilvl scaling** so a deep low-rarity piece can
out-base a shallow high-rarity one (rarity still wins on affix count). The **merchant buys loot
back** (Bag/Sell, ~40% of asking). **Crit-hit burst VFX** (per-Attunement, sliced from Dara's
montage, CSS pop-and-fade). **Ultra-rare "treasure" monsters** (Metal-Slime / Warmech tier:
`rare` flag, ~4% encounter replace, exceptional loot) — first entry **Hogger** in Greenvale
(`RARE_MONSTERS` in `data/enemies.ts`). The bestiary is now **Dara's canon roster** (Greenvale:
Green Slime/Kobold/Greenvale Bandit/Mage + Kingpin boss; Drowned Vault: Cave Rat/Spider/Leper +
Cave Troll boss — Kingpin **SOL-infused**, Troll **NOX-infused** for a final-fight matchup), with sliced sprites for all of them. Art: all
45 weaponless class bodies + the paper-doll with hero-sized weapons; **Greenvale field tileset** +
Bandit Warren / Drowned Vault dungeon tilesets; a top-down player walker. **Still placeholder:**
helmet/gloves/boots share the chest armor art, dungeon-floor/merchant field markers,
armour-over-body layer, save/persistence (`localStorage` autosave planned). Balance is tuned via
`balance-sim.ts` (models rows + champion packs).

## History

`app/gaia.html` is the frozen pre-modular single-file build (v0.11) — the version ADR 0002
described. It still runs from `file://`. All active development happens in `app/src/`.
