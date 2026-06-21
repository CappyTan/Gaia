# Battle System Update 2.0 — design notes (DRAFT)

> **Status: DRAFT — logged, NOT implemented. Subject to change.**
> Captured from Dara, 2026-06-21. These mechanics are **not** in the live game and will **not**
> ship piecemeal. They roll out together as **"Battle System Update 2.0"**, and only **after** the
> class-ability rework below is done. When we're ready, Dara will say so and we implement against
> this doc. Numbers here are first-pass and explicitly expected to be tuned in testing.
>
> This is the concrete, buildable spec for the REQUIEM **Ascension / Soul Burn** mechanics that
> [`requiem/battle-mechanics.md`](requiem/battle-mechanics.md) captured only at the concept level.
> Where this doc and that one differ, this doc is the newer design intent to build toward.

---

## 1. Ascension (combat buff)

A temporary in-combat buff that **raises the hero's MNA by +50** in the attunement their **weapon
archetype** designates (e.g. a SOL Heliomancer gains **+50 SOL MNA**). Because abilities are
MNA-threshold–gated, simply going Ascended **unlocks more abilities for its duration**.

- **MNA gain:** +50 MNA, in the hero's weapon attunement.
- **Duration:** **minimum 5 turns.** After turn 5, **each subsequent turn has a 50% chance** for
  the effect to drop off — so it can run well beyond 5 turns on a lucky streak.
- **Presentation:** has a dedicated activation **animation** (TBD).

### How a hero gets Ascension — the *Ascension Matrix* affix

For now Ascension is acquired **only through gear** — a **VERY rare affix called `Ascension Matrix`**.

- **Eligible rarities:** **Legendary** and **Artifact** only.
- **Affix drop chance:**
  - Legendary gear: **0.1%**
  - Artifact gear: **1%**
- **Affix value:** always a number **1–5**, equal to the **% chance to trigger Ascension when the
  equipped hero takes a turn** (per-turn proc). Matrix 1 = 1% per turn, … Matrix 5 = 5% per turn.
- **Value distribution** (when the affix rolls, how likely each tier is — Matrix 5 is far rarer):

  | Ascension Matrix | Chance to roll this value |
  |:---:|:---:|
  | 1 | 70% |
  | 2 | 15% |
  | 3 | 10% |
  | 4 | 4% |
  | 5 | 1% |

This is intended to be **one of the most desirable rolls in the game.**

---

## 2. Soul Burn (optional, on Ascension trigger)

When **Ascension triggers**, the hero gets the **+50 MNA** *and* is given the **option to initiate
Soul Burn**. Soul Burn is a high-risk / high-reward gamble:

### Downsides (the risk)
- Hero **loses 33% of max HP** (drain — imminent death unless **massive** healing is poured in).
- **Healing received is reduced by 50%** while Soul Burning.
- The fantasy: the hero is dying on a timer; only an *insane* healer keeps them alive — so good
  healers become a **damage enabler**, not just sustain (Dara's core intent).
- **If the hero dies while Soul Burning:** they deal **mass AoE damage to ALL party members** and
  **cannot be revived for the rest of the battle.**

### Upsides (the reward)
- **+50% damage**
- **+50% SPD**
- **Class-specific resource generation tripled (3×)**
- **All abilities have NO cooldown** — the hero can spam their most powerful abilities (limited only
  by class-specific resources, see §3) for the duration.

### Design goal
A single Soul Burn should let a hero land **at least two Ultimates** that do more total damage than
normal. **Optimal play → long strings of Ultimates.** The combo of tripled resource gen + zero
cooldowns is what makes the ultimate-chaining possible.

> **Numbers to tune in testing:** the 33% HP drain (per-turn? on-activation? ramping?), the 50%
> healing reduction, the +50%/+50%/3× values, and the death-AoE magnitude. The shape is fixed
> (risk of death vs. burst output); the magnitudes are placeholders.

---

## 3. Ability rework (prerequisite for 2.0)

Before the above can ship, **all classes' abilities are reworked** into **four categories**, and
**MP is removed entirely** as a resource. Abilities are instead gated by **cooldowns** and
**class-specific resources** (REQUIEM per-class resources — e.g. Kindling/Radiance/Aegis).

1. **Basic attack** — deals damage, may apply debuffs, and **generates** class-specific resource.
2. **Special abilities** — **on cooldown**, and **GENERATE** class-specific resource. Can't be
   spammed (cooldown-limited).
3. **Signature abilities** — more powerful, **on cooldown**, and **SPEND** class-specific resource.
4. **Ultimate abilities** — most powerful, **very long cooldown**, and **spend even more**
   class-specific resource.

### Why this ordering matters for Soul Burn
Soul Burn **removes all cooldowns** and **triples resource generation** — so during a burn, the
cooldown brakes come off and resources flood in, letting a hero chain Signatures/Ultimates as fast
as resources allow. The 4-category split + class resources are what give Soul Burn its ceiling.

---

## Implementation notes & reconciliation (for when we build it)

These are flags for the eventual build — **not decisions to make now.**

- **Remove `mp` / `maxmp`** from the combat/resource model; replace with per-class resource pools.
  Touches: `types.ts` (`Skill.mp`, `Member.mp/maxmp`), `systems/combat.ts`, `controllers/battle.ts`
  (skill affordability + bars), `ui/render` (MP bar), and every kit in `data/skills.ts` /
  `data/requiem-kits.ts`.
- **New engine systems:** a **cooldown** tracker per ability and a **class-resource** generator/
  spender — neither exists today. Likely new fields on `Skill` (category, cooldown, resourceGen,
  resourceCost) and on `Member` (resource pool, per-ability cooldown timers).
- **Ability categories** map onto the rework of `data/skills.ts` + the REQUIEM generator
  (`docs/design/requiem/gen-kits.cjs`) — the generated kits already reference class resources in
  their `desc` text, so the generator is the place to emit category/cooldown/resource fields.
- **MNA stays** as the threshold-gate + output-scaler. Ascension's **+50 MNA** rides on the
  existing `m.mna[att]` machinery — it's a temporary additive that re-evaluates `skillUnlocked`,
  so higher-threshold abilities light up mid-fight automatically.
- **Ascension Matrix** is a new affix tier that only rolls on Legendary/Artifact, with a separate
  drop gate (0.1% / 1%) and its own value table (the 1–5 distribution above) — distinct from the
  normal affix pool in `data/items.ts` / `systems/loot.ts`.
- **Soul Burn** needs: an activation prompt on Ascension proc, a per-turn HP-drain + healing-debuff
  status, the death → party-AoE + no-revive hook, and the buff bundle (dmg/spd/resource/no-cooldown).
- **Archon Type I (100 MNA)** already gates ultimates today; Ascension's +50 can push a hero across
  100 temporarily → temporary Archon/ult access is an intended interaction.

## Source
Dara Saadat, 2026-06-21 (design conversation). First-pass numbers; tune in testing.
