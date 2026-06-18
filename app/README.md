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
| **Multiple zones** (Greenvale → The Duskmarsh): own bestiary, mini-boss, boss, environments | ✅ |
| **Merchant** after each zone boss: spend gold on rolled loot before the next zone | ✅ |
| Open tile field map, camera, random encounters | ✅ |
| **Chokepoint gate**: a mini-boss mid-zone, then the zone boss east | ✅ |
| **Treasure chests** off the path (loot reward for exploring) | ✅ |
| **ATB** battle: SPD-driven gauges, act-when-ready, enemy AI | ✅ |
| Command menu: Attack / Skill / Defend / Flee, target select | ✅ |
| **Enemy abilities**: Shaman heals allies, Wisp blinds, Captain rallies the pack | ✅ |
| On-hit effects: Bog Lurker poison, Hollow Shade lifesteal | ✅ |
| Five-Powers **affinity ring** (SOL strong vs NOX, weak vs UMBRAXIS, etc.) | ✅ |
| **Signature effects**: Burn, Poison, Decay, Drain, crit/dodge (QUANTA) | ✅ |
| Status effects: burn/poison/regen/stun/blind/atk-up/ward-armor | ✅ |
| **Diablo loot**: Dara's named items = rarity rungs + random affixes | ✅ |
| 6 rarities (Common→Artifact) drive base stats + affix count | ✅ |
| **Elite** enemies (1-2 random affixes, guaranteed better drops) | ✅ |
| Inventory + per-character equip screen (weapon/armor/trinket) | ✅ |
| Progression: XP, level-ups, stat growth, **skill unlocks** (~Lv 1→12 over two zones) | ✅ |
| Depth-scaled difficulty per zone; mini-boss + zone boss; final-zone boss wins the run | ✅ |
| **Chiptune soundtrack** (Web Audio, no asset files): per-screen song × style (radiant/orchestral/heroic), cross-faded by state, mute toggle, iOS-safe start | ✅ |

The four SOL party members: **Auren** (Sword & Shield, tank), **Kaela** (Dual Swords,
DPS), **Sephi** (Staff, caster/healer), **Rion** (Spellblade, hybrid).

**Zone 1 — Greenvale** (Lv 1-6): Highway Bandit, Gray Wolf, Thieves' Cutpurse, Forest Wisp,
Marauder, Bog Lurker, Outlaw Archer, Hollow Shade, Bandit Shaman, Brigand Captain (mini),
Bandit Brute (boss). **Zone 2 — The Duskmarsh** (Lv 7-10): Mire Serpent, Drowned Husk, Gloom
Wisp, Fen Witch, Sunken Knight, Fen Warden (mini), Mirelord Vorn (final boss). Greenvale
enemies use real sliced art; Duskmarsh enemies are emoji until art exists. Enemy attunements
span the whole ring so the all-SOL party always feels strong/weak/neutral matchups.

## Art status

**Dara's real art is wired in**, sliced + background-removed by the reproducible pipeline
[`tools/slice-art.py`](tools/slice-art.py) (flood-fills the dark sheet background to
transparency so figures sit flush in the scene; re-run any time to rebuild `assets/`):
- **Weapons** — 24 loot icons from the four SOL charts (`assets/items/{sns,dual,staff,spell}-{rarity}.png`), shown on drops, in the bag/equip screens, AND composited onto the character in battle (the equipped weapon shows on the hero with a rarity glow and updates when you upgrade).
- **Enemies** — the five Greenvale bandits as transparent battle figures (`assets/enemies/`). The six added enemies fall back to emoji (no art on the sheets).
- **Heroes** — the four SOL party portraits from the class grid (`assets/heroes/`), transparent, with a grounding shadow.
- **Battle backgrounds** — dark, painterly, vignette scenes per environment (CSS), so transparent sprites read as in-scene rather than cut-out rectangles.

Still placeholder: field-map tiles + walking marker. Do **not** ship the FF reference
screenshots (Square Enix copyright). Next: art for the six new enemies; field-map art.

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
