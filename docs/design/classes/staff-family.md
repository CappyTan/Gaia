# Staff — the class family (the caster: five operations on energy) — PHASE 1 / PROPOSAL (pending Dara)

> **Status: PHASE 1 — DNA only (fantasy + lanes), dev-approved, pending Dara.** The 52-entry kits are
> **not yet written** — this note locks each class's identity for review first, then we build the
> abilities. Family-design for the five Staff classes, mirroring the
> [Sword & Shield](./sword-and-shield-family.md) and [Hammer](./hammer-family.md) families. Draws on
> the ratified [Attunement Mechanics Framework](../attunement-mechanics.md) and the
> [caster model (ADR 0013)](../adr/0013-no-magic-stat-casters-are-archetype.md).

## The organizing principle

The Staff is the back-row **Caster** (`party.ts`: low HP, high MP/mag; **VIT-secondary** — the fuel,
doubled-down). Per ADR 0013 a caster is a *delivery style*: it **projects its Attunement at range, as
raw energy**, rather than channeling it through a struck weapon. So where Sword & Shield asks "what do
you do about incoming harm?" and the Hammer asks "how does your impact break the enemy?", the Staff
asks:

### **"With nothing between you and your power — what does the battlefield become?"**

And the unifying lens is **energy**: each attunement is a different **operation on energy**, projected
across the field. This is the entropy spine seen through the caster's hands:

| Attunement × Staff | Canon name | Primary + VIT | Energy operation | The field becomes… | Caster role |
|---|---|---|---|---|---|
| **SOL** | Heliomancer | **AGI**+VIT | **Emit** — radiate energy outward | **a furnace** (spreading fire & light) | **artillery / nuker** |
| **NOX** | Null Absolutionist | **STR**+VIT | **Remove** — take energy *out of the system* | **a silence** (drained to stillness & dark) | **control / anti-caster** |
| **ANIMA** | Genesis Sage | **VIT**+VIT | **Create** — make energy/matter/life from nothing | **a garden** (the big bang: creation) | **the dedicated healer** |
| **QUANTA** | Chronosage | **SPD**+VIT | **Reorder** — move energy through time & probability | **a loom** (rethreaded fate) | **support / enchanter** |
| **UMBRAXIS** | The Singularitan | **DEF**+VIT | **Concentrate** — compress energy/mass into a point | **a singularity** (gravity wells & void) | **zone-control artillery** |

**Cohesion:** five deep-channel casters (VIT-fuel doubled), each a distinct *operation on energy* and a
distinct back-line role (damage / negation / healing / support / zone-control) — the whole dimension no
melee party has. **ANIMA Staff is VIT+VIT** — the purest channel, hence the dedicated healer (echoing
NOX-Hammer STR+STR = pure breaker, UMBRAXIS-S&S DEF+DEF = pure tank). **Lanes stay *within* each
class's role** (per the dev's fork-3 call) — three flavors of one caster identity, not a nuke/control/
support triangle.

The energy framing is sharpest at the poles: **NOX *subtracts* energy** (drink it to absolute zero,
silence, dispel — entropy reversed by removal) and **ANIMA *adds* it** (genesis — make life and wards
from nothing). SOL emits, UMBRAXIS concentrates, QUANTA reorders.

---

## Phase-1 DNA (fantasy + lanes) — for review

### SOL · Heliomancer — artillery / nuker *(emit · the Furnace)*
- **Stats:** AGI + VIT · **Resource:** SOL (*runs hot*) · **Signature:** Burn / Blind / Scorched
- **Fantasy.** A Heliomancer holds a star in the hand and pours it onto the field — fire that spreads,
  light that blinds, heat that builds to detonation. The back-line furnace: a glass-cannon that
  *emits* SOL as raw radiance, and the more it burns, the wider the fire jumps.

| Lane | Identity (a flavor of artillery) | Best when |
|---|---|---|
| **A · Conflagration** | spreading Burn/DoT — ignite, propagate, detonate | many targets; drawn-out fights |
| **B · Solar Lance** | focused bolts/beams — single-target burst, pierce, Scorched (AGI) | bosses; high-value targets |
| **C · Corona** | radiance fields — AoE Blind + escalating heat-zones | packs; battlefield-wide pressure |

### NOX · Null Absolutionist — control / anti-caster *(remove · the Silence)*
- **Stats:** STR + VIT · **Resource:** NOX (*banks*) · **Signature:** Stasis / Freeze / Seal
- **Fantasy.** The Null Absolutionist takes energy *out of the system*. Where the Heliomancer pours
  heat in, the Absolutionist drinks it back toward absolute zero — silencing spells, freezing motion,
  dispelling power, draining the field to stillness and dark. The anti-mage: it doesn't out-damage
  you, it makes you *unable to act*. Entropy reversed by subtraction.

| Lane | Identity (a flavor of negation) | Best when |
|---|---|---|
| **A · Silence** | anti-magic — Seal abilities, lock cooldowns, forbid buffs/casts | vs caster-heavy enemies |
| **B · Heat Sink** | energy-drain — sap MP/resource & tempo (attack-bar), Chill/Freeze toward stillness | vs fast or resource-reliant foes |
| **C · Unmaking** | erasure — strip buffs, cleanse-lock, unmake summons/wards & enemy fields | vs buffed / summoner enemies |

### ANIMA · Genesis Sage — the dedicated healer *(create · the Big Bang)*
- **Stats:** VIT + VIT · **Resource:** ANIMA (*compounds*) · **Signature:** Regen / Bloom / creation
- **Fantasy.** The Genesis Sage is creation itself — a big bang in a staff. Where others manipulate
  what exists, the Sage *makes* what doesn't: new life poured into the wounded, wards and healing
  motes conjured from nothing, growth seeded where there was none. The party's wellspring and main
  healer — the purest channel (VIT+VIT) of life-as-energy.

| Lane | Identity (a flavor of healing/creation) | Best when |
|---|---|---|
| **A · Wellspring** | direct & reactive healing — big heals, emergency saves, revives | the main-healer seat |
| **B · Genesis** | creation — conjure barriers, shields, healing motes/wisps from nothing | vs burst damage; pre-shielding |
| **C · Flourish** | growth-buffs — Regen, Bloom, vitality/stat empowerment that grows | long fights; buff-stacking comps |

### QUANTA · Chronosage — support / enchanter *(reorder · the Loom)*
- **Stats:** SPD + VIT · **Resource:** QUANTA (*gambles*) · **Signature:** probability swings (no Doom-focus — that's the Hammer)
- **Fantasy.** The Chronosage reweaves the battle's energy through time and chance — adding nothing,
  removing nothing, only *reordering*: hastening allies, stalling foes, bending probability so the
  party's blows land true and the enemy's fail. The loom: the enchanter who decides *when* and
  *whether* things happen.

| Lane | Identity (a flavor of support) | Best when |
|---|---|---|
| **A · Tempo** | time — haste allies / extra turns / slow foes | combo teams; speed comps |
| **B · Fortune** | probability — buff party crit/dodge, decohere enemy accuracy/crit, reroll | crit/variance party builds |
| **C · Foresight** | prediction — shields that trigger on the foreseen hit, pre-empt, cleanse-incoming | vs telegraphed burst; protection |

### UMBRAXIS · The Singularitan — zone-control artillery *(concentrate · the Singularity)*
- **Stats:** DEF + VIT · **Resource:** UMBRAXIS (*conserves*) · **Signature:** Crush / Anchored / Drain
- **Fantasy.** The Singularitan compresses energy and matter into points of unbearable gravity,
  littering the field with wells that pull, crush, and devour — bending space so the enemy can neither
  flee nor close. Back-line artillery made of gravity, drinking the battlefield into the dark.

| Lane | Identity (a flavor of zone-control) | Best when |
|---|---|---|
| **A · Gravity Wells** | zone control — place wells that pull/Anchor & cluster foes, reshape the field | scattered enemies; setup for AoE |
| **B · Collapse** | crush artillery — AoE implosions, ramping damage on clustered/Anchored foes | clustered packs |
| **C · Voidwell** | ranged drain — siphon HP/energy from afar; void zones that drain resource (conservation) | attrition; resource-starving foes |

---

## Open flags (for Dara / later)
- Confirm the family frame **"the caster — five operations on energy"** (Emit/Remove/Create/Reorder/Concentrate).
- **QUANTA Chronosage** is *support* (buffs/tempo/luck), deliberately steering clear of the QUANTA Hammer's Doom/crit-verdict identity — confirm the split.
- **Phase 2** = the 52-entry kits for all five, once this DNA is approved.
