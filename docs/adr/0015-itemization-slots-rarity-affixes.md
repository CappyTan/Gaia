# ADR 0015 — Itemization: slot roles, rarity model, affix rolling & slot-locked affixes

**Status:** accepted (Dara-ratified, 2026-06-29). Owns the itemization rulings that supersede
`stat-system.md` §6–§7 where they conflict. Builds on [ADR 0013](0013-no-magic-stat-casters-are-archetype.md)
(VIT), [ADR 0014](0014-secondary-stats-matter-energy-final-20.md) (the final 20 substats, Matter/Energy),
and the [Class System Model](../design/classes/README.md) (Model B — MNA as the skill gate). Glossary:
**Gate MNA**, **slot-locked affix**, **special affix** in [`CONTEXT.md`](../../CONTEXT.md).

> **Design canon, partly engine-wired.** Records the ratified itemization design from a grill audit.
> Wired: the **§1 gear-MNA model** — per-rarity weapon + armor/trinket MNA ranges and the attune chance
> (`WEAPON_MNA_ROLL` / `ARMOR_MNA_ROLL` / `ARMOR_MNA_CHANCE` in `data/loot.ts`). The rest (rarity
> count/quality split, random per-slot primary, slot-locked affix pool, special-affix layer; touching
> `data/rarity.ts`, `data/items.ts`) is a downstream ticket; magnitudes/weights are a later balance pass.

## Decisions

### 1 · Slot roles & the MNA gate (split off the weapon)

- **6 equip slots:** weapon · helmet · chest · gloves · boots · trinket. The **weapon** is the
  keystone — it sets the class (Attunement × Archetype) and is the main offense.
- **The MNA skill-gate is split across weapon AND the other slots** (not weapon-only), so a single
  weapon swap doesn't swing the entire kit.
  - **Weapons always carry +MNA** — the MNA it rolls *is* the weapon's mana attunement (sets the class).
  - **Starting tuning points** — gear MNA is owned by **rarity** (no ilvl term), rolled **uniformly**
    (each value in the range equally weighted). The kit is balanced so a **fully-attuned set weighs ~what
    the weapon alone used to**: the weapon range is **halved**, and each of the **five non-weapon slots**
    (helmet · chest · gloves · boots · **trinket**) carries **~10% of the *original* weapon range**, so
    `½·weapon + 5×10% ≈ original`. *Engine-wired:* `WEAPON_MNA_ROLL` / `ARMOR_MNA_ROLL` in `data/loot.ts`.

    | Rarity | Color | Weapon +MNA (½) | Per non-weapon slot (~10%) |
    |---|---|---|---|
    | Common | White | 0–5 | 0–1 |
    | Uncommon | Green | 3–10 | 1–2 |
    | Rare | Blue | 5–15 | 1–3 |
    | Epic | Purple | 8–20 | 2–4 |
    | Legendary | Orange | 10–23 | 2–5 |
    | Artifact | Red | 13–25 | 3–5 |

    Rules: derived bounds **round UP (ceil)** to the next whole MNA; an attuned **non-weapon** piece
    **never rolls 0** (floored to 1). Ranges overlap by design (a lucky low-rarity roll can match an
    unlucky high-rarity one). First-pass numbers; revisit in the balance-sim pass.
  - **Non-weapon gear (armor + trinket) carries +MNA rarely** — **`ARMOR_MNA_CHANCE` = 0.13** (in the
    ~12–15% band, down from 50%), in a **small** amount (table above), in a **random/roster-biased
    attunement** (only sometimes matches the wearer's class; a "wrong-color" roll is reclass insurance,
    not a contribution to the current gate). The rest of the time the piece is **neutral** (no MNA).
- **MNA acquisition is deliberately throttled.** Reaching **100 (Archon + top skills/ultimates)** must
  be an achievement. Skills currently unlock every **+5 MNA** (threshold may rise later). **Leveling
  as an MNA source is a known over-supply problem — flagged, deferred.**

### 2 · Gate MNA vs. resource pools are SEPARATE systems

- **Gate MNA** — a *stable* per-attunement threshold from **gear + level** that **unlocks skills**
  (and scales output). Does not move in combat. *This is what gear +MNA feeds.*
- **Resource pools** — the *volatile, party-shared* per-attunement combat currency that **specials
  generate and signatures/ultimates spend**. Filled by *playing*, never by gear.
- They share the attunement identity and the "mana" theme but are mechanically independent (so spending
  combat resource never drops a skill below its unlock threshold).

### 3 · Rarity vs. ilvl — clean split

- **Rarity owns affixes:** the **affix COUNT** (common→artifact = **0/1/2/3/4/5**) **and** the **affix
  QUALITY** (a higher tier raises each affix's roll **floor *and* ceiling** — reliable gains plus the
  god-roll thrill).
- **ilvl owns base stats:** base implicit magnitude scales with **ilvl + slot/type, not rarity.**
- Result: a high-ilvl low-rarity piece can out-*base* a low-ilvl high-rarity one, but the high-rarity
  piece has the *affixes* that define a build. Affix magnitude = f(rarity); base = f(ilvl).

### 4 · Per-slot primary attribute is RANDOM

- Every piece still grants one primary attribute (STR/AGI/VIT/SPD/DEF), but it now **rolls randomly**
  (per armor slot), no longer fixed by slot identity. Slot identity instead comes from **affix
  slot-locking** (§5).

### 5 · Affixes — slot-weighted pool + slot homes + hard exclusives

The 20 secondary stats (ADR 0014) roll as affixes, **no duplicates**, with:
- **Soft slot/type weighting** (revises `stat-system.md` §7's "no biased rolls" ruling): weapons lean
  offensive substats, armor leans defensive/sustain, trinket = flex. Anything *can* still roll
  off-type, but dead rolls (Healing Done on a pure-DPS weapon) are rare.
- **Slot homes** — each substat may only roll on a defined subset of slots, with a few **hard
  exclusives**. This caps single-stat stacking (the same throttle tone as MNA) and gives the hunt
  direction. The map is **brick-safe** (no build needs two stats trapped on the same slot):

| Slot | Identity | Allowed substat affixes |
|---|---|---|
| **Weapon** | offense amplifiers | Matter Pen · Energy Pen · Ability Power · Execute · **Crit Damage** · Healing Done |
| **Gloves** | precision / hands | **Crit Chance** *(exclusive)* · Combo · Accuracy · Matter Pen |
| **Helmet** | focus / mind | Ability Power · Accuracy · Cooldown Recovery · Healing Done · Energy Reduction · Buff Potency · Resistance |
| **Chest** | bulwark | Matter Reduction · Energy Reduction · **Block** *(exclusive)* · Resistance · Life Steal |
| **Boots** | mobility / tempo | **Evasion** *(exclusive)* · Attack-Bar Gain · Action Refund · Chase · Matter Reduction |
| **Trinket** | flex / sustain | Life Steal · Buff Potency · Healing Done · Energy Pen · Crit Damage · Attack-Bar Gain · Cooldown Recovery · Resistance |

**Hard exclusives:** Crit Chance → Gloves · Evasion → Boots · Block → Chest. (Crit builds pay a
two-slot tax: Crit *Chance* on gloves, Crit *Damage* on weapon/trinket.)

### 6 · Affixes are NOT limited to secondary stats (B+C)

Substats are only the *baseline* affix class. Gear also rolls a **second class of "special" affixes** —
non-substat effects — and the chase tier gets **bespoke uniques**:
- **Substats** fill the rarity affix-count budget (§3), slot-restricted (§5).
- **Special affixes** sit in **extra, rarity-gated slots** (on top of the substat budget), so high
  rarity is *qualitatively* richer, not just "more substats." Examples (placeholders, not yet
  delineated): *+signature ability damage/effect*, *+ultimate damage/effect*, *loot find*, *apply X
  debuff on hit*, *reduce execute threshold*.
- **Legendary/artifact** can *additionally* be **hand-authored named uniques** with fixed, memorable
  powers (the "incredibly unique" tier).

## Open / deferred

- The full **special-affix catalogue** + the named **unique** items (delineation pass).
- Whether special affixes get **their own slot homes** (e.g. *+ultimate dmg* weapon/trinket only).
- **Base implicit stats per slot under Matter/Energy** — does armor's base become typed
  Matter/Energy mitigation, do weapons stamp a damage type (Matter vs Energy)?
- **Leveling-as-MNA** over-supply throttle.
- Magnitudes/weights/curves throughout — balance-sim pass.

## Consequences

- Revises `stat-system.md` §7 ("no biased rolls" → soft slot-weighting + slot-locks) and §6 (the
  fixed weapon-archetype *secondary stat* is now the class's archetype scaling stat per the Class
  Model; the per-*item* primary roll is random per §4). The doc is synced to point here.
- Engine wiring touches `data/rarity.ts` (count vs quality split), `data/loot.ts` (bands, armor-MNA
  chance ~12–15%, slot/affix weighting), `systems/loot.ts` (decouple base from rarity → ilvl; random
  per-slot primary; slot-locked affix pool; special-affix layer), and the item/affix types.
