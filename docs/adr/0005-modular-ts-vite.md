# ADR 0005 — Modular TypeScript + Vite architecture (supersedes the single-file build)

**Status:** accepted (v0.12) — supersedes the single-file, zero-build constraint of
[ADR 0002](0002-build-fresh.md).

## Context

The POC shipped as one self-contained `app/gaia.html` (~1570 lines): zero build, zero deps,
openable from `file://`. That was the right call to prove the game out fast (ADR 0002). But as
Gaia grows toward Dara's full REQUIEM canon (45 classes, 250 abilities, multiple zones, the
Ascension/Soul Burn/Archon systems), a single mutable-global file stops scaling: no module
boundaries, no type safety, no isolated tests, and every change risks the whole file. We want a
codebase that is maintainable, modular, and moldable as the world expands — and we don't want to
rewrite the game each iteration.

## Decision

Restructure into a **TypeScript + Vite** project with strict layering. Source lives in
`app/src/`; the game is the Vite entry `app/index.html`.

**Layers (dependency flows one way):**

```
data  ←  systems  ←  controllers  →  ui
                         ↓
                       state/services (audio, telemetry)
```

- **`data/`** — pure content: attunements, rarity, items/affixes, skills, party, enemies, zones,
  art tables, version. Adding a zone/enemy/class/skill is a data edit, not an engine change.
- **`systems/`** — pure logic, **no DOM**: affinity, combat math (`combatDamage`, `makeEnemy`,
  status), loot, progression, enemy abilities. Deterministic (injectable RNG) and unit-tested.
- **`ui/`** — presentation: render helpers (paper-doll, item HTML, sprites, badges) + overlay.
- **`controllers/`** — orchestration that touches the DOM: game lifecycle/state, ATB battle,
  field map, menus, screens. Imports systems + data + ui; **nothing pure imports a controller.**
- **`core/`** — infra: RNG/utils, DOM helpers, event bus, Vite asset resolver.

This is what makes the renderer/engine **swappable**: replace `ui/` + `controllers/` with a new
front end and the tested `data/` + `systems/` carry over unchanged.

## Consequences / trade-offs

- **Build step now required.** `npm install`, `npm run dev` (HMR), `npm run build` → `dist/`.
  The game no longer opens from `file://` — it needs the dev server or a static host. This is the
  real cost of leaving ADR 0002; accepted deliberately for type safety, tests, and modularity.
- **GitHub Pages** is still the host: a CI workflow builds `dist/` and deploys it. `base: './'`
  keeps it path-independent (works at `/Gaia/`). Static hosting is preserved — only the build moved.
- **Still no runtime framework.** Vanilla TS + Canvas/DOM; Vite is a dev/build tool, not a runtime
  dependency. The spirit of "no heavy framework" (ADR 0002) holds; only the single-file/zero-build
  clause is superseded.
- **Inline `onclick` bridge is transitional.** The HTML's inline handlers resolve to controllers
  published on `window` in `main.ts`. A later pass should move to delegated/data-action listeners
  and drop the global bridge.
- **`app/gaia.html` is frozen** as the pre-modular reference build (last single-file version,
  v0.11). It still runs from `file://` as a fallback but is no longer the source of truth.
- **Tests + balance sim import the real systems.** `npm test` (Vitest) replaces the old inline
  node harness; `npm run sim` runs the balance simulator against the shipping modules directly
  (no more regex-extracting the script).
