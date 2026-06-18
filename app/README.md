# Gaia — POC build (`app/`)

A self-contained, single-file proof of concept. **No build step, no server.**

## Run it

Double-click [`gaia.html`](gaia.html), or open it in any modern browser (Chrome, Edge,
Safari — including iOS Safari). That's it.

## Controls

- **Move:** arrow keys / WASD, or the on-screen D-pad (touch).
- **Everything else:** tap/click. In battle, choose a command, then tap a target.

## What's implemented (vertical slice)

| System | Status |
|---|---|
| Tile field map (Greenvale), camera, random encounters, boss gate | ✅ |
| **ATB** battle: SPD-driven gauges, act-when-ready, enemy AI | ✅ |
| Command menu: Attack / Skill / Defend / Flee, target select | ✅ |
| Five-Powers **affinity ring** (SOL strong vs NOX, weak vs UMBRAXIS, etc.) | ✅ |
| **Signature effects**: Burn, Poison, Decay, Drain, crit/dodge (QUANTA) | ✅ |
| Status effects: burn/poison/regen/stun/blind/atk-up/ward-armor | ✅ |
| **Diablo loot**: Dara's named items = rarity rungs + random affixes | ✅ |
| 6 rarities (Common→Artifact) drive base stats + affix count | ✅ |
| **Elite** enemies (1-2 random affixes, guaranteed better drops) | ✅ |
| Inventory + per-character equip screen (weapon/armor/trinket) | ✅ |
| Progression: XP, level-ups, stat growth, **skill unlocks** (~Lv 1→8) | ✅ |
| Bandit Brute boss + victory / party-wipe defeat | ✅ |

The four SOL party members: **Auren** (Sword & Shield, tank), **Kaela** (Dual Swords,
DPS), **Sephi** (Staff, caster/healer), **Rion** (Spellblade, hybrid). Greenvale bestiary:
Highway Bandit, Thieves' Cutpurse, Marauder, Outlaw Archer, Bandit Brute (boss). Enemy
attunements are set so the all-SOL party feels the ring (bonus vs NOX bandits, resisted by
the UMBRAXIS cutpurse).

## Art status (deliberate)

This build uses **programmer/placeholder art** in Dara's gold-on-dark palette (emoji
sprites, CSS gradients per environment, rarity-colored loot). The point of the POC is the
**gameplay mechanics** — Dara has the world and art but no mechanics. Next art pass per the
locked decision (DESIGN.md item 11, "generate to fill gaps"):
- Slice real item icons from the four SOL loot charts.
- Slice the five Greenvale enemies + four SOL class figures for the battle screen.
- Generate field tiles, walking sprites, and battle backgrounds matching Dara's style.
- Do **not** ship the FF reference screenshots (Square Enix copyright).

## Validation

No automated UI test, but the core logic is headless-tested (run from `app/`):
- Syntax: `node -e` extract + `node --check` (passes).
- Logic harness (affinity ring, loot generation across all weapons/rarities, recalc death
  handling, leveling + skill unlock + revive, item scoring): **14/14 pass**.
- Boot/battle smoke (start, field move, battle init, strike w/ affinity, heal, burn tick):
  **6/6 pass**.

The harness is an inline node script that extracts the `<script>` block and exercises the
pure systems. A proper module split + `node:test` suite is the follow-up if this graduates
past POC.

## Known rough edges (POC)

- Balance is first-pass; the ~1-hour pacing (encounter rate, XP curve, boss HP) needs a
  real playthrough to tune.
- Enemy AI is simple (random/low-HP targeting, boss AoE chance). No champion packs yet.
- No save/persistence yet (single session). localStorage autosave is the planned add.
- "Defend"/guard, taunt aggro, and the QUANTA dodge are modeled lightly.
