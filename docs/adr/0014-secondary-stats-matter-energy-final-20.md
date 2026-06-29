# ADR 0014 — Secondary stats: Matter/Energy damage typing, the final 20, dual-source

**Status:** accepted (Dara-ratified, 2026-06-29). Supersedes the secondary-stat portions of
[`docs/design/stat-system.md`](../design/stat-system.md) §3–§4 and the implemented
`app/src/data/substats.ts`. Builds on the **MGC → VIT** rename ([ADR 0013](0013-no-magic-stat-casters-are-archetype.md))
and the [Attunement Mechanics Framework](../design/attunement-mechanics.md). Glossary terms:
**Matter**, **Energy**, **Penetration**, **Reduction** in [`CONTEXT.md`](../../CONTEXT.md).

## Context

A grill audit of the secondary-stat ("substat") system found it **inadequate on three counts**:

1. **~45% non-functional.** Of the 20 implemented substats, only 11 were wired into combat; **9 were
   display-only**, including the *entire* SPD/tempo group (`Abg`/`Cdr`/`Acr`/`Chc` = 0/4) — exactly
   the stats the new class system's tempo lanes (QUANTA primary, Dual Daggers/Rifle secondary) lean on.
2. **Redundancy.** `Crs` (proc-ignore armor) and `Arp` (always-on armor cut) hit the *same* combat
   variable; `Drd`/`Eva`/`Pry`/`Vei` were four overlapping damage-mitigation knobs.
3. **Behind canon.** The code still grouped by `MGC` (not VIT) and typed damage as physical/ability,
   while the ratified direction is a **Matter/Energy** axis.

The bar set for "adequate": every kept stat is (1) functional, (2) build-relevant for some class/lane,
(3) non-redundant, (4) covering the axes the class system needs (crit, tempo, sustain, mitigation,
control).

## Decision

### 1 · Damage is typed **Matter** vs **Energy**

- **Matter** = struck/martial/kinetic damage (the old "physical").
- **Energy** = projected/channeled ability damage (the old "ability/spell"; aligns with ADR 0013,
  "casters *project energy*").

Every attack is Matter or Energy. Offense and defense are kept **symmetric** across this axis.

### 2 · The final 20 secondary stats (4 per primary; off/def is descriptive, not a quota)

| Group | Stats *(proposed engine key)* |
|---|---|
| **STR** — force / sustain | **Matter Penetration** `Mpn` *(was Arp)* · Execute `Exe` · Life Steal `Lfs` · Combo Chance `Cch` |
| **AGI** — precision / crit / avoid | Crit Chance `Crt` · **Crit Damage `Cmd`** *(new)* · **Evasion** `Eva` *(universal — any damage)* · Accuracy `Acc` |
| **DEF** — protection | **Matter Reduction `Mrd`** *(new)* · **Energy Reduction `Erd`** *(new)* · **Block `Blk`** *(new — Matter-only)* · Resistance `Res` |
| **SPD** — tempo | Attack-Bar Gain `Abg` · Action Refund `Acr` · Cooldown Recovery `Cdr` · Chase Chance `Chc` |
| **VIT** — fuel / life / ability | Ability Power `Abp` · Healing Done `Hld` · **Energy Penetration `Epn`** *(new)* · Buff Potency `Buf` |

**Result:** 20 stats, **zero dead**, full Matter↔Energy offense/defense symmetry, a complete crit axis
(chance + damage), and a working tempo group.

**Removed (5):**
- `Crs` Crush → merged into Matter Penetration (same combat variable).
- `Drd` Damage Reduction → **split** into typed Matter Reduction + Energy Reduction.
- `Pry` Parry → became **Block** (Matter-only).
- `Vei` Veil → absorbed into Energy Reduction.
- `Grv` Gravity → cut **as a substat**; its mechanic (push enemy attack-bar) survives as an **ability
  effect** in class kits.

**Mitigation roles (non-redundant by construction):** Matter Reduction / Energy Reduction = always-on
typed mitigation · **Block** = Matter-only proc (Sword & Shield identity) · **Evasion** = universal
avoid proc. Energy is answered by Energy Reduction (no energy "block").

### 3 · Secondary stats are **dual-source**

Substats come from **both**:
- **Primary attributes** — each primary grants a baseline trickle of **its own group's 4 substats**
  (e.g. STR → Matter Pen / Execute / Life Steal / Combo; SPD → the tempo four). This replaces the old
  free-standing §3 conversion table — the group structure *is* the conversion table.
- **Gear affixes** — rolls add **any** of the 20 on top (rarity sets the affix count, not which).

## Consequences

- **Design canon now; engine wiring is a staged ticket** (per CLAUDE.md — design canon, not yet
  engine-wired). The code change is **not** isolated: it touches `data/substats.ts` (the 20 + keys +
  group rename to VIT + `wired` flags), `types.ts` (the `SubKey` union + `Subs`), `systems/combat.ts`
  (which references `Drd`/`Pry`/`Vei`/`Crs`/`Eva`, and must add the Matter/Energy damage tag + typed
  mitigation/penetration), and the character-sheet UI. It needs its own verified pass
  (typecheck/test/build/sim). **Wiring ticket scope:**
  1. `data/substats.ts` → the final 20, new keys, `group: "VIT"`, all `wired: true` target.
  2. `types.ts` → update `SubKey`/`Subs`; add a `dmgType: "matter" | "energy"` tag to attacks.
  3. `systems/combat.ts` → type damage; apply Matter/Energy Reduction, Block (Matter-only), Evasion
     (universal), Matter/Energy Penetration; remove `Drd`/`Pry`/`Vei`/`Crs` paths.
  4. Dual-source: primary → own-group substat baseline (new pure helper, tested).
  5. UI → character sheet by group; loot affix pool auto-derives from the 20 (unchanged mechanism).
- **No count change** (still 20, 4×5) — UI legibility and a balanced 5-way affix pool are preserved.
- **The `build-class` skill** can reference these stats by name immediately when keying lanes to
  substats (it already does, e.g. the Lagrangian's lanes).
- **`stat-system.md` §3–§4 updated** to point here and list the final 20; the doc's larger 39-stat
  taxonomy is explicitly **not** adopted.
