# REQUIEM Stat System V3 — stats, scaling tiers, conversions & itemization

**Dara owns the world and lore; this records his canon stat design.** This is the single source of
truth for character stats, how Attunements scale abilities, attribute→substat conversions, weapon
secondary affinities, and the loot/itemization rulings (incl. **Fating**). Math I was asked to
propose is marked **(recommended)** and stays subordinate to Dara's sign-off. Use Gaia's vocabulary
(`CONTEXT.md`).

> **Design ahead of the build.** This is the *target* system. The playable POC currently tracks only
> `hp / mp / atk / mag / spd / armor / crit` and the ±15% affinity ring — **none of V3 is coded yet**.
> Implementation is staged (see §10). Treat this doc as the canon to build toward and to write items
> against *now*.

---

## 1 · Primary Attributes (the 5)

The foundation; they determine ability scaling. Replaces the POC's loose `atk/mag/spd/armor`.

| Stat | Abbr | Theme | S-tier (primary) for |
|---|---|---|---|
| **Strength** | STR | raw power · force · brutality | **NOX** |
| **Agility** | AGI | precision · dexterity · technique | **SOL** |
| **Vitality** | VIT | life · growth · ability potency (ratified rename of the former **Magic / MGC** slot; replaces the POC's `MAG`) | **ANIMA** |
| **Speed** | SPD | momentum · tempo · turn economy | **QUANTA** |
| **Defense** | DEF | protection · endurance · stability | **UMBRAXIS** |

Every class wants every stat (each grants universal value — §3); your Attunement just decides which
stat it converts into **ability power** best (§2).

> **On VIT and "casters" (ratified).** There is **no "Magic" stat** — every Attunement *is* a form of
> channeled power, so a **caster** is a *delivery style* (the **Staff**/**Spellblade** archetypes that
> project their Attunement at range), and its spell power is its **own attunement stat** (§2), not a
> magic stat. **VIT (Vitality)** = **free energy / negentropic reserve**, the universal *fuel* every
> attunement burns to do work against entropy; that is why its substats (ability power / healing /
> debuff) help everyone. VIT is universally applicable like the other four primaries — not a caster-only stat.

---

## 2 · Ability scaling — the S/A/B/C/D tier system (canon)

Each Attunement scales its abilities off the five primary stats at a **tier**, best→worst:

| Tier | Meaning | Coefficient *(recommended)* |
|---|---|---|
| **S** | best scaling | **1.00** |
| **A** | good | **0.70** |
| **B** | average | **0.45** |
| **C** | below average | **0.25** |
| **D** | minimal (Dara: "tiny ~5%") | **0.05** |

**The rule (canon).** Your **S** stat is your Attunement's own primary stat. Then **walk the affinity
ring in the "beats" direction** — you → the one you beat (prey) → the one *they* beat → … → the one
who beats you (predator) — assigning **S → A → B → C → D**. So:
- **S** = your own stat · **A** = your prey's stat · **D** = your predator's stat · **B/C** = the two
  neutrals in ring order.

Ring (beats): `SOL → NOX → ANIMA → QUANTA → UMBRAXIS → SOL`. Stats: SOL=AGI, NOX=STR, ANIMA=VIT,
QUANTA=SPD, UMBRAXIS=DEF.

### The master table

| Attunement (S-stat) | STR | AGI | DEF | SPD | VIT |
|---|---|---|---|---|---|
| **SOL** (AGI) | A | **S** | D | C | B |
| **NOX** (STR) | **S** | D | C | B | A |
| **ANIMA** (VIT) | D | C | B | A | **S** |
| **QUANTA** (SPD) | C | B | A | **S** | D |
| **UMBRAXIS** (DEF) | B | A | **S** | D | C |

*(Worked example — UMBRAXIS: DEF=S, then beats SOL→AGI=A, Nox→STR=B, Anima→VIT=C, weak-to Quanta→
SPD=D. Matches Dara's example exactly.)* The table is a balanced **circulant**: read any column (one
stat) and it is also S/A/B/C/D exactly once across the five — every stat is somebody's best and
somebody's worst.

**Important — the D stat still matters.** A low tier only governs how much a stat feeds *ability
power*. The stat's **universal substat value (§3) applies to everyone regardless of tier** — e.g. SPD
is D-tier for Umbraxis for ability scaling, but SPD still fills an Umbraxis hero's attack bar, grants
initiative, etc. No stat is ever dead weight.

**Off-stat builds (canon — incorporate).** Because A/B stats still scale meaningfully, a class can
deliberately lean a secondary stat for a different feel (an Umbraxis hero stacking **AGI (A)** plays
fast/critty vs **DEF (S)** bruiser). Itemization should make these viable.

---

## 3 · Attribute → substat conversions (canon — dual-source)

> **RATIFIED — see [ADR 0014](../adr/0014-secondary-stats-matter-energy-final-20.md).** Secondary
> stats are **dual-source**: each primary grants a baseline trickle of **its own group's 4 substats**
> (§4), and gear affixes add **any** of the 20 on top. The group structure *is* the conversion table —
> the free-standing per-attribute list below is retained only as the *flavor* summary.

**Summary:** STR → Matter penetration, execute, lifesteal, follow-through · AGI → crit, evasion,
accuracy · VIT → ability power, healing, energy penetration, buff strength · SPD → attack-bar,
cooldowns, turn economy · DEF → Matter/Energy reduction, block, resistance.

**Per-Attunement secondary conversions (canon idea).** On top of the baseline, an Attunement can
convert a stat into **Ability Power** at *different* rates by tier — Dara's example: per **100** AGI,
**SOL** gains **+5% Abp** while **UMBRAXIS** gains only **+2% Abp**. Same stat, same item, different
value. *(recommended: derive from the §2 coefficients — Abp-per-100 ≈ `5 × tierCoef`. Tune later.)*

---

## 4 · The substat taxonomy — the final 20 (RATIFIED, [ADR 0014](../adr/0014-secondary-stats-matter-energy-final-20.md))

Damage is typed **Matter** (struck/martial/kinetic) vs **Energy** (projected/ability); offense and
defense stay symmetric across the axis. **4 substats per primary** (off/def is descriptive, not a
quota), all functional targets, **zero dead stats**.

| Group | Substats *(proposed engine key)* |
|---|---|
| **STR** force/sustain | Matter Penetration `Mpn` · Execute `Exe` · Life Steal `Lfs` · Combo Chance `Cch` |
| **AGI** precision/crit | Crit Chance `Crt` · Crit Damage `Cmd` · Evasion `Eva` *(universal)* · Accuracy `Acc` |
| **DEF** protection | Matter Reduction `Mrd` · Energy Reduction `Erd` · Block `Blk` *(Matter-only)* · Resistance `Res` |
| **SPD** tempo | Attack-Bar Gain `Abg` · Action Refund `Acr` · Cooldown Recovery `Cdr` · Chase Chance `Chc` |
| **VIT** fuel/life | Ability Power `Abp` · Healing Done `Hld` · Energy Penetration `Epn` · Buff Potency `Buf` |

**Removed from the old V3 set:** `Crs` Crush (→ Matter Pen) · `Drd` Damage Reduction (→ split into
Matter/Energy Reduction) · `Pry` Parry (→ Block) · `Vei` Veil (→ Energy Reduction) · `Grv` Gravity
(→ survives as an ability effect, not a substat). The doc's earlier 39-stat taxonomy is **not adopted.**

Plus the unchanged **core combat** values: HP · Atk (weapons) · Arm (armor) — base inputs to the
hidden ratings (§5).

---

## 5 · Hidden (calculated) ratings — recommended math

Never roll on gear; shown on the character sheet. Dara deferred the math to me — **all formulas here
are (recommended)**, constants tunable.

- **Effective Health (Ehp)** — raw damage you can survive:
  `Ehp = HP × (Arm + κ)/κ × 1/(1 − Dmr%) × 1/(1 − Eva%)`
  where armor mitigation = `Arm/(Arm+κ)` (diminishing returns; κ scales with content, e.g. `κ ≈ 100 + 25×level`). Block can fold in as a minor `× 1/(1 − Blk%·avgBlockFrac)`.
- **Offense Rating (Off)** — overall offensive power:
  `Off = EffAtk × (1 + Abp%) × (1 + Crt%×Cmd%) × (1 + Arp%×0.5)`
  where `EffAtk = Atk + (ability stat-scaling)` = `Atk + Σ(statᵢ × tierCoefᵢ × k)` over the primary stats (k tuned so Atk and stat-scaling are comparable).
- **Defense Rating (Dfr)** — overall defensive power: `Dfr = Ehp × (1 + Res%/2 + Blk%/2)`.
- **Combat Rating (Cbr)** — single power number: **geometric mean** rewards being well-rounded:
  `Cbr = round(√(Off × Dfr))`. *(Alt: a weighted sum if you'd rather reward specialization.)*

These give the "the higher the number, the stronger the character" read Dara wants, while keeping Atk
(from weapons) and Arm (from armor) as real inputs to Off/Dfr.

---

## 6 · Weapon-archetype secondary affinities (canon)

A class's **primary** scaling is its Attunement stat (§2). Its **weapon archetype** adds a
**secondary** stat it scales well from — reinforcing the weapon fantasy without the old "warriors=STR,
casters=VIT" lock. (So every ANIMA class still wants VIT first, but a Sword & Shield ANIMA also leans
DEF.)

| Archetype | Primary | Secondary | Fantasy |
|---|---|---|---|
| Sword & Shield | Attunement stat | **DEF** | Survivability & protection |
| Two-Handed Sword | Attunement stat | **STR** | Heavy weapon mastery |
| Hammer | Attunement stat | **STR** | Crushing impact & stagger |
| Dual Swords | Attunement stat | **AGI** | Fluid combos & crits |
| Dual Daggers | Attunement stat | **SPD** | Ambushes & rapid turns |
| Dual Pistols | Attunement stat | **AGI** | Precision & multi-shot |
| Rifle | Attunement stat | **SPD** | Long-range control / attack-bar manipulation |
| Staff | Attunement stat | **VIT** | Stronger spells, buffs, healing |
| Spellblade | Attunement stat | **Balanced** (AGI/VIT, or class-specific) | Hybrid playstyle |

*(recommended) Combine in the ability-scaling formula: primary stat at its §2 tier coefficient, plus
the archetype's secondary stat at a fixed bump — e.g. treat the secondary as at least **A-tier (0.70)**
for that class even if the Attunement table would rate it lower. Exact stacking rule TBD with Dara.*

---

## 7 · Loot & itemization rulings (canon)

- **Weapons always carry Atk; armor always carries Arm.** Both feed Offense/Defense (§5). Kept from
  the POC.
- **No biased affix rolls — for now.** Affix pools are **not** tilted toward an item's preferred
  S/A/B tier stats; the loot hunt should stay challenging (upgrades shouldn't be too easy). *(This is
  the opposite of an earlier suggestion — Dara's call.)*
- **Tier-breaking chase affixes (canon — do it).** Mods that **raise a stat's scaling tier for the
  wearer** (e.g. *"SPD scales one tier higher,"* up to turning a D stat into something real). Delivered
  via **consumables, crafting, and/or directly on weapons & armor.** This is the marquee chase: gear
  that unlocks builds your Attunement normally can't do.

### Fating — the "Corrupted" process (canon)
The previously-flagged **Corrupted Attunement** concept (`affinity-ring.md`) is now a named process:
**Fating** an item (from *fate*). Once processed, the item is **Fated**.

- **Canon:** the term/process — *Fating* → a *Fated* item.
- *(proposed mechanics, for Dara):* Fating **corrupts/blends an item's Attunement** (e.g. counts as a
  blend of two powers, breaking clean matchup/tier certainty) and/or is the vehicle for the
  **tier-breaking** scaling above (a Fated item can scale a stat outside its normal tier). Risk/reward
  framing fits — a Fated item may gain a powerful off-tier scaling at some cost. Exact rules TBD.

---

## 8 · UI (canon — surface it)

- **Character screen shows the S/A/B/C/D scaling chart** for the selected hero (their per-stat tiers),
  so players read stat priorities at a glance.
- Show the **5 primary attributes**, the derived **substats**, and the **hidden ratings**
  (Off / Dfr / Cbr / Ehp) on the character/equipment screen.
- *(recommended)* On items, tag/colour an affix by its tier **for the inspecting hero**, and flag
  **Fated** items distinctly.

---

## 9 · Flagged issues / open questions (caught in the spec)

1. **Abbreviation clash:** **Crt** is used for *both* **Critical Chance** and **Combat Rating**.
   *(recommended:* keep **Crt = Critical Chance**; rename Combat Rating to **Cbr** — used above.)
2. **Dot / Hot:** the count lists 6 healing/status stats incl. **Dot** (DoT potency) and **Hot** (HoT
   potency), but the §VII table only showed 4. Added Dot/Hot to the taxonomy (§4) — confirm names.
3. **Stat count label:** visible stats total **39** on their own (+4 hidden = 43); the "35 visible"
   label doesn't match — likely excludes the 5 primaries (→34) or some core stats. Pick the canonical
   framing.
4. **Secondary-affinity stacking (§6):** exact rule for combining the Attunement-tier primary with the
   archetype secondary stat in the scaling formula — needs a ruling.
5. **MNA reconciliation:** REQUIEM's per-Attunement **MNA** "scales output" mechanic
   (`docs/design/requiem/`) vs. this stat-scaling — confirm how they coexist (MNA as a separate
   amplifier on top of stat scaling is the working assumption).
6. **Mitigation constants** (κ, the scaling `k`, coefficient values) — all tunable; need a balance pass.
7. **POC reconciliation:** map the existing `atk/mag/spd/armor/crit` onto V3 when implemented (§10).

---

## 10 · Suggested implementation staging (when we build it)

Large change — recommend phasing rather than one drop:
1. **Data model:** add the 5 primaries + substat fields to `types.ts` / member & item data; map POC
   `mag→VIT`, keep `atk`/`arm`; seed STR/AGI/DEF/SPD on members & gear.
2. **Scaling tables:** encode the §2 tier matrix + coefficients in `data/` (pure), used by
   `systems/combat` so the sim/tests exercise it.
3. **Conversions + ratings:** implement §3 conversions and §5 ratings in a pure `systems/stats`
   module (tested).
4. **UI:** character-screen stat panel + S–D chart (§8).
5. **Itemization:** tier-breaking affixes + **Fating** flow.
Each phase ships behind the normal verify/deploy gate.
