# Gaia: A World of Five Powers

A turn-based RPG set in the world of **Gaia** — Final-Fantasy-style ATB combat, the
five-power affinity system, and Diablo-style loot with random affixes.

A collaboration: **Dara Saadat** owns the world, lore, classes, and art; this repo brings
the gameplay mechanics. This is an early proof of concept.

## Play it

A **TypeScript + Vite** app, hosted as a static build on GitHub Pages (works on desktop and iOS
Safari). To run locally (needs Node ≥18):

```bash
npm install && npm run dev    # dev server with hot reload
npm run build                 # production build -> dist/
```

(The original single-file build, [`app/gaia.html`](app/gaia.html), still opens straight from the
file as a frozen reference — see [ADR 0005](docs/adr/0005-modular-ts-vite.md).)

- **Move:** arrow keys / WASD, or the on-screen D-pad (touch).
- **Everything else:** tap/click. In battle, choose a command, then tap a target.
- **Stats:** the field "Stats" button (and the title "Telemetry" button) show gameplay
  telemetry for tuning.

## The proof-of-concept slice

Two zones — **Greenvale** → **The Duskmarsh** — with a merchant between them:

- A fixed party of four **SOL**-attunement adventurers: Auren (Sword & Shield, tank),
  Kaela (Dual Swords, DPS), Sephi (Staff, caster/healer), Rion (Spellblade, hybrid).
- Tile field maps with random encounters → a mid-zone **mini-boss** gate → the **zone boss**.
  Beat the boss, **shop at the merchant** with your gold, then press on to the next zone.
- **ATB** battle screen (party right, enemies left, command menu) — see the FF reference.
- **The Five Powers** as an affinity ring (SOL strong vs NOX, weak vs UMBRAXIS, …) plus a
  signature status effect per power. Enemy attunements make the ring matter in every fight.
- **Diablo loot:** Dara's named items are the rarity rungs (Common → Artifact) with random
  affixes rolled on top. **Elite** enemies carry affixes and drop better gear.
- Leveling, stat growth, and skill unlocks (~Lv 1 → 8).

## Repo layout

| Path | What |
|---|---|
| [`app/`](app/) | The game — a single self-contained `gaia.html` + notes |
| [`docs/design/requiem/`](docs/design/requiem/README.md) | **REQUIEM** — Dara's canonical 45-class / 250-ability combat system (source + parsed data + compendium + battle mechanics) |
| [`DESIGN.md`](DESIGN.md) | Full design spec (decisions, systems, art plan) |
| [`CONTEXT.md`](CONTEXT.md) | Glossary of Gaia's domain language |
| [`docs/adr/`](docs/adr/README.md) | Architecture decision records |
| [`assets/reference/`](assets/reference/) | Dara's reference art (classes, loot, enemies, maps) |

## Status & next

**v0.12 playable.** Two zones, ATB combat, the affinity ring, and Diablo loot are all real;
some art is placeholder (programmer art in Dara's gold-on-dark palette). v0.12 migrated the
single-file POC to a modular TypeScript + Vite codebase (see
[ADR 0005](docs/adr/0005-modular-ts-vite.md)) so the world can scale toward Dara's REQUIEM canon.
Next passes: reconcile combat toward REQUIEM, generate field tiles/backgrounds, tune pacing from
telemetry, and open the party beyond the SOL attunement once more art exists.

**Picking up the art later?** The character paper-doll engine is built and waiting on
weaponless body art — the full resume guide is **[`docs/art/README.md`](docs/art/README.md)**.

See [`DESIGN.md`](DESIGN.md) for the locked decisions and the open questions.
