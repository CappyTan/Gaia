# REQUIEM — MNA progression & ability gating (canon)

Canon from Dara Saadat, confirmed 2026-06-19 (IRL STONKS chat). This is the unifying
progression model for Gaia: **enemy level is the master variable, MNA is the gate to power.**
It supersedes the POC's placeholder "skills unlock by character level." Capturing it here as the
implementation spec; the playable build reconciles toward it (see "POC reconciliation").

## 1. Enemy level is the master dial

An enemy's **level (L)** sets everything it gives: its stats, and the **XP, gold, and loot
item-level (ilvl)** it drops. You get stronger only by engaging higher-level content, two ways:

- **Leveling** → a small **derived MNA floor** — `floor(level/5)` into your *active* attunement
  (20 at the L100 cap = ~20% of the road to Archon@100). **Not** player-assigned; it follows your
  equipped weapon. *(Updated by [ADR 0021](../../adr/0021-mna-from-gear-level-floor.md) — supersedes
  the original "~1/level, player-assigned" line below.)*
- **Loot** (ilvl-scaled) → gear granting **MNA**, stats, passives, and procs. **Gear is the dominant
  MNA source (~80% of the climb to Archon).**

Zones are level bands (Zone 1 = L1–5, Zone 2 = L6–10, …). Each zone has a **dungeon** 1–2 levels
above its overworld max (Zone 1 dungeon = L6–7), with a mid-boss and a boss. **Elites** raise an
enemy's rewards (loot/gold/XP) by a percentage and its drop rarity floor.

## 2. MNA — five trees that gate and amplify

A character has five **MNA** pools, one per **Attunement** (SOL / NOX / ANIMA / QUANTA /
UMBRAXIS) — a talent tree across all five. MNA in a tree comes from:

- **Intrinsic:** a small **derived floor** — `floor(level/5)` MNA in your *active* attunement, auto-
  applied and weapon-following (no allocation, no respec). *(Per [ADR 0021](../../adr/0021-mna-from-gear-level-floor.md);
  the original "freely-assigned points, gold respec" model is mothballed — it only earns its keep once
  multi-class skill access exists, see [endgame-mechanics.md](../classes/endgame-mechanics.md).)*
- **Gear:** equipment grants MNA in specific trees (e.g., a sword with **+10 SOL MNA**). Gear MNA
  applies instantly and is the **dominant** source (~80% of the road to Archon).

MNA does **two** jobs:

1. **Gates abilities (a threshold, not a cost).** Each ability sits in its Attunement's tree
   behind an MNA requirement — *Solar Strike needs 10 SOL MNA.* The moment your MNA in that tree
   meets the threshold (by any mix of levels + gear), the ability is **usable**. Casting still
   costs a *separate* resource (MP / per-class RES) — MNA is not consumed by casting. A single
   high-MNA drop can light up a whole cluster of abilities at once.
2. **Scales output (per REQUIEM mana mechanics).** The same MNA total passively amplifies, up to
   **+60% at 200 MNA**: SOL/NOX → damage, ANIMA → healing, QUANTA → SPD / turn priority,
   UMBRAXIS → defense / damage reduction.

**Archon at 100 MNA.** Reaching **100 MNA in a single Attunement** is the **Archon Type I**
threshold (Mortal Mastery — see [`battle-mechanics.md`](battle-mechanics.md)) and is the ideal
moment to unlock that class's **Ultimate**. (Two trees at 100 → Archon Type II.)

### Pacing (Dara-confirmed anchors)
- Intrinsic MNA: a `floor(level/5)` floor (20 at L100) → leveling supplies only ~20%; **gear is the
  dominant MNA source (~80%)** and paces the climb to Archon ([ADR 0021](../../adr/0021-mna-from-gear-level-floor.md)).
- Threshold spread: basic abilities ~5–15, signatures ~40–60, **ultimate = 100 (Archon).**
- The design tension Dara is after: clearing a zone lands you at its level band, *but* a lucky
  high-MNA drop can leapfrog you into abilities early. That gear-vs-grind pacing is the fun.

## 3. Class = your equipped weapon

A hero's **Class is determined by the weapon they wield** — Class = **Attunement × Weapon
Archetype** (the 45). Equipping a **SOL Two-Handed Sword** instantly makes the character a
**Starbreaker** (SOL × Two-Handed). A weapon can carry MNA in several trees, but its **highest**
MNA tree is its Attunement and sets the class flair. Because the weapon defines the class,
players will typically **stack their leveled MNA points into the tree of the weapon they're
using** — hence free assignment + paid respec when they switch builds.

## 4. Loot & affixes

- **ilvl = enemy level** (+1 elite, +1 mini-boss, +2 boss). ilvl drives item base stats and how
  high affix value ranges roll.
- **Rarity → affix count:** white 0 · green 1 · blue 2 · purple 3 · legendary 4 · artifact 5.
- **Affix kinds:** flat stats · **MNA grants** (the gating ones) · **passives** · **proc
  effects.** Procs/passives are the same machinery as **Ascension / Soul Burn** and must be
  designed against this compendium, not invented.

## POC reconciliation (what the playable build does today vs. this canon)

The shipping game is a slice. Reconciliation is staged:

- **Phase 1 (engine):** five MNA pools; abilities gated by MNA threshold (replacing level-unlock);
  MNA scales output; Archon@100 → ultimate; ilvl-scaled loot + MNA-granting affixes; class label
  derived from the equipped weapon. The level contribution is the **derived `floor(level/5)` floor**
  into the active attunement ([ADR 0021](../../adr/0021-mna-from-gear-level-floor.md)) — no banked
  points.
- **Phase 2:** weapon-swap actually changes the class's ability kit; enemy-level-derived reward
  formulas; zone/dungeon restructure. *(The old "manual point allocation UI + paid respec" is dropped
  by ADR 0021 — mothballed until multi-class skill access exists.)*
- **Phase 3:** passive & proc affixes (REQUIEM-aligned), full Ascension / Soul Burn / Harmonic
  Ascension.

## Source

Dara Saadat, IRL STONKS chat, 2026-06-19 (confirmation of MNA gating, player-assigned points,
class-by-weapon, MNA scales output, Archon@100 → ultimate). Builds on
[`battle-mechanics.md`](battle-mechanics.md) (Archon Types) and the per-attunement mana mechanics
in [`README.md`](README.md).
