---
name: architecture-review
description: The architecture & code-health playbook for Gaia — the distilled, gradeable rubric for good architecture, design, abstractions, domain modeling, and best practices in THIS codebase. Turns CLAUDE.md + ADR 0005's layering and the repo's real patterns (the DB registry seam, validate.ts integrity net, injectable RNG, types.ts as the domain model, data-driven content, the vanilla-TS / no-framework constraint) into concrete rules an author follows and a reviewer grades against. Use when reviewing or refactoring app/src/** for design health (a module, a layer, or the whole repo), before a large refactor, or whenever judging whether the code is still easy for Dara and the agents to work in. Complements `code-review` (diff correctness) — this is the structural/maintainability lens.
---

# Architecture Review skill — how Gaia's code stays easy to work in

The one repeatable rubric for **architectural health** of Gaia's TypeScript source. It distills
`CLAUDE.md`, `docs/adr/0005-modular-ts-vite.md`, and the patterns already living in `app/src/` into
concrete, gradeable rules. The north star: **the codebase stays easy for Dara and the agents to work
in as it grows fast** — clean layers, honest abstractions, a sound domain model, and no framework
creep.

**Two audiences, one rubric.** The **refactorer** (and any agent editing `app/src/**`) *follows* this;
the **architecture-reviewer** *grades against* it. Each numbered check is written to be graded
**[Blocking] / [Should-fix] / [Polish]**.

- **Read first:** `CLAUDE.md` (layering, conventions, current state), `docs/adr/` (immutable
  rationale — esp. 0005 modular-TS, 0008/0009 world model), `app/src/types.ts` (the domain model),
  `app/src/data/db.ts` + `app/src/data/validate.ts` (the registry seam + integrity net).
- **When to use:** judging a module/layer/whole-repo for design health, before a large refactor, or
  as the structural lens alongside `code-review`'s diff-correctness lens. A one-line tweak — skip it.
- **Scope:** this is about *shape* — layering, abstraction, modeling, coupling, naming, maintainability.
  It is **not** the balance/UX/lore/art lanes (those have their own reviewers), and it is **not** a
  bug hunt (that's `code-review` / `code-reviewer`). Spot a cross-lane issue, name it, hand it off.

## The spine: layers stay pure → abstractions earn their keep → the model tells the truth

Gaia survives fast growth because logic is **pure and testable**, content is **data not code**, and
the **front end is swappable**. Everything below protects that.

---

## 1 · Honor the one-way layering (the cardinal rule — ADR 0005)
```
data  ←  systems  ←  controllers  →  ui      (+ core, services · boot = main.ts)
```
- **`data/` and `systems/` stay pure**: no `document`/`window`/DOM, no import of a `controllers/` or
  `ui/` module. This is what keeps `systems/` unit-testable and the front end replaceable. A leak here
  is **[Blocking]** — it breaks the swappable-frontend goal and the sim/test parity.
- **Dependencies point one way.** `data ← systems ← controllers → ui`; `core`/`services` sit beneath.
  No cycles, no back-edges (ui importing a controller's flow, systems importing data that imports
  systems). Grep the changed files' imports and trace the direction.
- **The right layer for the change.** New *content* (a zone/enemy/class/skill/affix) belongs in
  `data/`; new *pure logic* in `systems/` (with a test); *DOM/flow* in `controllers/`; *presentation
  helpers* (return HTML/draw, no flow) in `ui/`. Logic that crept into a controller that the sim/tests
  can't reach is a finding — it should live in `systems/`.
- **Gradeable:** does any `data/`/`systems/` file touch the DOM or import up the stack? Do deps point
  one way with no cycles? Is each piece in the layer that matches its job?

## 2 · Keep `systems/` pure, deterministic, and RNG-injectable
- **Combat/loot/progression math lives in `systems/`** so the **balance sim and the game ship the
  identical code** (`combatDamage`, `makeEnemy`, loot, progression). Logic duplicated in a controller —
  or a formula the sim can't call — is the classic regression; flag it.
- **RNG is injected, never reached for ambiently.** Functions that randomize take `rng: Rng =
  Math.random` (see `core/rng.ts` + `seeded`). New pure logic that calls `Math.random()` directly is a
  **[Should-fix]** (it can't be seeded → flaky tests → a broken deploy, per CLAUDE.md).
- **No hidden side effects.** `systems/` functions transform inputs to outputs (or mutate the passed
  unit explicitly, as `damage`/`applyStatus` do) — they don't reach into globals, DOM, or singletons.
- **Gradeable:** is the math in `systems/` and only there? Is RNG injectable/seedable? Any ambient
  state or side effect that defeats determinism?

## 3 · Content is data, queried through the registry seam
- **Add content to `data/`, not the engine.** A new zone/enemy/class/skill/affix is a data entry, not
  a new code path in `systems/`/`controllers/`. Special-case logic that should have been a data field
  is a finding.
- **Query through `DB`, don't reach into raw consts.** `data/db.ts` is the typed query API + cross-ref
  indexes (which zones spawn an enemy, which classes use a skill) and the **stable seam** that lets a
  later phase swap the backing store. New consumers iterating raw `ENEMIES`/`ZONES`/`SKILLS` where a
  `DB` query exists (or should) erode that seam — **[Should-fix]**.
- **New invariants get a `validate.ts` check.** `validateContent()` is the integrity net that lets
  Dara/agents tweak data without silently breaking the game (kit→missing-skill, zone→missing-enemy,
  the 45-kit distinctness rule). A new content relationship that *can* be authored wrong but has no
  check is a gap — flag it and name the check to add.
- **Gradeable:** is new behavior data-driven? Do consumers go through `DB`? Is every new
  "this-must-point-at-that" relationship guarded by `validate` + a test?

## 4 · Abstractions earn their keep (right altitude, no premature framework)
- **Don't add a framework or runtime dep.** Vanilla TS + Canvas/DOM; Vite is build-only. React/a game
  engine/a state library is **[Blocking]** against ADR 0005 (must stay statically hostable + iOS-Safari
  safe). A heavyweight abstraction where a function + a data table would do is over-engineering.
- **Reuse the small shared helpers** rather than re-implementing: `rnd`/`ri`/`pick`/`clamp`/`cap`
  (`core/rng`), `$`/`el` and DOM helpers (`core/dom`), the typed event bus (`core/events`), the asset
  resolver (`core/assets`). A fourth hand-rolled clamp or `querySelector` wrapper is duplication.
- **The abstraction matches the seam.** Good seams here are real: `DB` (data access), `Rng` (injection),
  the event bus (decoupling controllers), `types.ts` (shared shapes). A new abstraction should sit on a
  seam that actually varies — not wrap a single call site "for later." Equally, a 600-line controller
  doing five jobs *under*-abstracts; a tiny one-call wrapper *over*-abstracts. Flag both.
- **Gradeable:** any new dependency/framework? Re-implemented helper that already exists? Is each new
  abstraction at the right altitude — earning its keep on a seam that varies, neither god-module nor
  ceremony?

## 5 · The domain model tells the truth (`types.ts` + the vocabulary)
- **Shared shapes live in `types.ts`**, kept dependency-free so every layer imports it. A new domain
  concept modeled as an inline anonymous type, a loose `Record`, or duplicated field lists in two files
  is a modeling miss — give it a named interface in `types.ts`.
- **Make illegal states unrepresentable where cheap.** Prefer precise unions/literals
  (`Attunement`, `Slot`, `RarityKey`) over `string`; named constants + helpers (`EQUIP_SLOTS`,
  `ARMOR_SLOTS`, `isArmorSlot`) over magic strings scattered around. A `string` where a 5-value union
  exists is a **[Should-fix]**.
- **`strict` is honored.** No stray `any`, no unsound `as` casts papering over a model gap, no `!`
  silencing a real nullability question. If a cast is load-bearing, the model is probably wrong.
- **The names match Gaia's vocabulary** (`CONTEXT.md`): **Attunement** not "element/school";
  **Weapon Archetype** / **Class** (= Attunement × Archetype); **Rarity** not "tier"; **Elite** vs
  **Champion** vs **boss**. A type/field/function named off-vocabulary will mislead every future reader
  — flag the rename. (Deep lore/canon truth is `requiem-canon-keeper`'s; you flag *code-level* naming.)
- **Gradeable:** new concepts as named `types.ts` interfaces? Precise unions over loose strings? Zero
  unsound `any`/casts? Identifiers speak Gaia's exact vocabulary?

## 6 · Cohesion, coupling & module boundaries
- **One module, one job.** A file's exports should hang together (high cohesion). A controller that has
  become a junk drawer — battle flow + loot rolling + persistence — should shed the non-flow parts to
  `systems/`. Name the split.
- **Couple through seams, not internals.** Controllers talk via the event bus / public `DB` API /
  `systems` functions — not by importing each other's internals or sharing mutable module-level state.
  Reaching into another module's privates is a **[Should-fix]**.
- **No new entries on the transitional `window` bridge.** The `onclick="Game.start()"` inline-handler
  bridge (`main.ts` → `globals.d.ts`) is *accepted debt to pay down*, not a pattern to extend. Adding a
  new global to wire UI is a finding; prefer a delegated listener / event-bus path.
- **Dead code, duplication, drift.** Unreferenced exports, copy-pasted blocks that should be one helper,
  and parallel structures that must be kept in sync by hand are all maintainability taxes — call them
  out with the consolidation.
- **Gradeable:** does each module do one job? Is coupling through seams or internals? Any new `window`
  global? Dead/duplicated code?

## 7 · Decisions, docs & the workflow guardrails
- **Hard-to-reverse decisions get an ADR.** A structural choice (a new layer, a swapped data store, a
  build/runtime change) made silently in a diff is a process miss — it belongs in `docs/adr/` (short:
  what + why). Flag a structural change with no ADR.
- **CLAUDE.md / module headers stay honest.** The big doc-comment atop `db.ts`/`validate.ts`/`combat.ts`
  is part of the design; a change that invalidates a stated invariant must update the prose, not leave
  it lying.
- **The verify gate is real.** A refactor isn't done until `npm run typecheck && npm test && npm run
  build` are green (and `npm run sim` if combat/economy logic shape moved). A test made flaky by
  un-seeded RNG is a broken deploy — fix the determinism, don't re-run. (CLAUDE.md "Shipping changes".)
- **Behavior-preserving unless asked.** A *refactor* changes shape, not player-visible behavior or
  balance numbers; if it must change behavior, that's a different task — surface it, don't smuggle it.
- **Gradeable:** does a structural change carry an ADR? Are touched headers/CLAUDE.md still true? Is the
  verify gate green and deterministic? Did a "refactor" quietly change behavior?

---

## How to grade
Walk §1→§7 over the code in scope (a diff, a module, a layer, or the repo). For each finding give
**file:line**, the problem, the rule it breaks (cite the §), why it costs future work, and a concrete
fix. Severities:
- **[Blocking]** — layering leak (§1), a framework/runtime dep (§4), logic the sim/tests can't reach
  (§2): things that break testability, hostability, or the swappable front end.
- **[Should-fix]** — registry/seam erosion (§3), model imprecision or unsound casts (§5), god-module /
  internals coupling / new `window` global (§6), ambient RNG (§2).
- **[Polish]** — naming, dead code, doc drift, small duplication.

End with a one-line **verdict** (healthy / refactor-recommended / structural-debt) and the single
highest-leverage fix.
