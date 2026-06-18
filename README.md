# Gaia: A World of Five Powers

A turn-based RPG set in the world of **Gaia** — Final-Fantasy-style ATB combat, the
five-power affinity system, and Diablo-style loot with random affixes.

A collaboration: **Dara Saadat** owns the world, lore, classes, and art; this repo brings
the gameplay mechanics. This is an early proof of concept.

## Play it

Open [`app/gaia.html`](app/gaia.html) in any modern browser (desktop or mobile — it works on
iOS Safari). **No build step, no server, no install.** Just open the file.

- **Move:** arrow keys / WASD, or the on-screen D-pad (touch).
- **Everything else:** tap/click. In battle, choose a command, then tap a target.
- **Stats:** the field "Stats" button (and the title "Telemetry" button) show gameplay
  telemetry for tuning.

## The proof-of-concept slice

One zone, **Greenvale** — roughly an hour of play:

- A fixed party of four **SOL**-attunement adventurers: Auren (Sword & Shield, tank),
  Kaela (Dual Swords, DPS), Sephi (Staff, caster/healer), Rion (Spellblade, hybrid).
- A tile field map with random bandit encounters that escalate to the **Bandit Brute** boss.
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
| [`DESIGN.md`](DESIGN.md) | Full design spec (decisions, systems, art plan) |
| [`CONTEXT.md`](CONTEXT.md) | Glossary of Gaia's domain language |
| [`docs/adr/`](docs/adr/README.md) | Architecture decision records |
| [`assets/reference/`](assets/reference/) | Dara's reference art (classes, loot, enemies, maps) |

## Status & next

**v0.1 playable.** The systems are real; the art is placeholder (programmer art in Dara's
gold-on-dark palette). Next passes: wire Dara's real art into the battle screen, generate
field tiles/backgrounds, tune the one-hour pacing from telemetry, and open the party beyond
the SOL attunement once more art exists.

See [`DESIGN.md`](DESIGN.md) for the locked decisions and the open questions.
