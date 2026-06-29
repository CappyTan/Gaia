# Spellblade — the class family (the Runeblade: how do you fuse blade and spell?) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Family note for the five Spellblade classes
> — the **ninth and final** weapon archetype. Mirrors the other family notes; built on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). Frame + lanes are the proposal;
> ability content is skill-drafted (`proposed`).

## The organizing principle

Spellblade is the **Hybrid** (`party.ts`: `role: "Hybrid"`, **front row**, **AGI-secondary**, and the
only front-liner with caster stats — `mp 22`, `mag 10`, `armor 3`). It is neither the back-line Staff
nor a steel-only melee weapon. It asks:

### **"How do you fuse blade and spell?"** — the front-line caster

Where the **Staff** casts from safety at the back and the melee weapons swing steel, the Spellblade
**carries the spell into the fight** — it channels its Attunement *through the blade, at melee range.*
It *is* its Attunement, blade in hand (item noun: **Runeblade**).

**Shared Runeblade DNA:**
1. **Imbue** — channel the Attunement into the blade; strikes carry the signature (Burn/Stasis/
   Infestation/probability/Drain applied in melee), and the charge can be released as a spell-burst.
2. **Strike↔Cast rhythm** — melee strikes **generate** the attunement resource; spells **spend** it.
   The Spellblade is the most literal expression of the MNA generate→spend economy.
3. **Front-line caster** — it casts at melee range and survives there (`mag`+`armor`), *unlike the
   Staff*. The spell-warrior who doesn't hide in the back.
4. **Reuse the Attunement's phase chain via the imbued blade** (melee-delivered): forge→Detonate,
   freeze→Shatter, infest→Overgrowth, superpose→Collapse, Crush→Singularity. No new resource.

**Lanes follow the hybrid** — every Spellblade has: a **blade** lane (imbued melee), a **casting** lane
(the Attunement's spell identity), and a **fusion** lane (the strike↔cast loop — the signature seat).

| × Spellblade | Canon name | Primary + AGI | Seat (the fusion) |
|---|---|---|---|
| **SOL** | Starforge Knight | **AGI+AGI** | doubled-AGI flagship — radiant battle-mage; forge fire into the blade, strike-and-detonate |
| **NOX** | Lattice Executioner | STR+AGI | frost-arcane executioner — freeze by spell, Shatter by blade |
| **ANIMA** | Biomancer | VIT+AGI | mutation battle-mage — blade-borne contagion + self-evolution (**non-healer**) |
| **QUANTA** | Quantum Exarch | SPD+AGI | probability battle-mage — strike-observe, spell-collapse |
| **UMBRAXIS** | Voidstar Exarch | DEF+AGI | gravity battle-mage — drain-blade + collapse-cast, durable |

**Cohesion:** all five share AGI-secondary + the Runeblade DNA (imbue / strike↔cast / front-line
casting); the primary sets the role. **SOL is the doubled-AGI flagship.**

## Per-class sketches (3 lanes: a blade lane · a casting lane · a fusion lane)

### SOL · Starforge Knight — radiant battle-mage (doubled-AGI flagship)
AGI+AGI. Forge solar fire into the blade and into spell-bursts; strike to stoke Burn, cast to Detonate
it. Pure offense (SOL has no defensive line). *Distinct from the two other SOL AGI+AGI classes: this is
the battle-MAGE (imbue + spell-bursts, `mag`), not Sunblade (melee crit-parry duelist) or Gunslinger
Solaris (ranged crit-gunner). Distinct from the SOL Staff (Heliomancer, back-line artillery): Starforge
fights at the front.*
- **A · Forgeblade** — imbued melee: fast radiant strikes that stoke **Burn** (and build the spell charge).
- **B · Solar Casting** — spell-bursts: **Detonate** stacked Burn, **Blind**, radiant AoE at close range.
- **C · Starforge** — fusion: strike charges the spell, the spell empowers the blade — the imbue-and-release loop.

### NOX · Lattice Executioner — frost-arcane executioner
STR+AGI. Freeze with crystalline lattice-magic, then execute with the imbued blade. *Distinct from the
NOX Staff (Null Absolutionist, the back-line anti-mage): the Executioner stands in front and kills what
it freezes. Kept clear of the other NOX classes' lanes.*
- **A · Rimeblade** — imbued melee: heavy STR strikes that apply **Stasis**/**Chill** and **Shatter** the Frozen.
- **B · Lattice Casting** — frost spells: **Frozen**, **Brittle**, a lattice **ward** (front-line preservation).
- **C · Execution** — fusion: freeze by spell → Shatter by blade; the strike↔cast executioner loop.

### ANIMA · Biomancer — mutation battle-mage (non-healer)
VIT+AGI. Manipulates life as a *weapon*: blade-borne contagion, self-mutation, evolving spells. **NON-HEALER**
([ledger #16](../attunement-mechanics.md)): despite the name, party-healing belongs to the Staff (Genesis
Sage) + Hammer (Lifekeeper). Biomancer's "biomancy" is **offense/adaptation + self-sustain only.**
- **A · Thornblade** — imbued melee: strikes inject **Infestation** and Bloom it.
- **B · Biomancy** — life-spells **as weapons**: contagion bursts, **Evolution** (Seed→Bloom→Overgrowth), self-Adaptation (no party heals).
- **C · Mutation** — fusion: strike injects, spell evolves the strain; the mutating battle-mage. Durable (VIT), self-sustain only.

### QUANTA · Quantum Exarch — probability battle-mage (math/physics register, no gambling)
SPD+AGI. Observe with the strike, collapse with the spell. *(Probability language stays math/physics —
superposition / collapse / decohere / Doom / eigenstate — never gambling motifs.)*
- **A · Phaseblade** — imbued melee: precise strikes that crit and **Decohere** the target.
- **B · Quantum Casting** — probability spells: **Superposition → Collapse**, **Doom**, dodge swings.
- **C · Eigenblade** — fusion: the strike observes (loads Superposition), the spell collapses it to a determined hit.

### UMBRAXIS · Voidstar Exarch — gravity battle-mage (durable)
DEF+AGI. Drain with the blade, collapse with gravity-magic; the durable front-line caster. *Distinct
from the UMBRAXIS Staff (The Singularitan, back-line zone artillery): the Exarch carries the well into melee.*
- **A · Voidblade** — imbued melee: strikes that **Drain** (conservation sustain at the front).
- **B · Gravity Casting** — gravity spells: **Crush**, **Anchor**, a close-range **Singularity**.
- **C · Eventblade** — fusion: strike drains to fuel the spell, spell collapses what the blade pinned; durable (DEF + Mass armor).

## Open flags (for Dara / later)
- Confirm the family frame **"the Runeblade — how do you fuse blade and spell?"** and the **front-line
  caster** identity (the melee counterpart to the back-line Staff).
- **Spellblade secondary = AGI is marked *tentative*** in the [Class System Model](./README.md). It
  produces a **third SOL AGI+AGI class** (with Sunblade + Gunslinger Solaris). Built on AGI as the
  ratified-tentative value, with Starforge Knight differentiated as the *battle-mage* — but worth
  Dara's call on whether the hybrid's secondary should reflect its caster nature (MAG/VIT) instead.
- **ANIMA Biomancer** kept a **non-healer** (ledger #16) despite the name — confirm.
