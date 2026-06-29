# Dual Daggers — the class family (the Rogue: five edges of speed) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** A family-design note for the five Dual
> Daggers classes (one per Attunement), shaped in a dev + agent session, mirroring the
> [Sword & Shield family](./sword-and-shield-family.md) and [Hammer family](./hammer-family.md). Its
> job: give the `build-class` runs a shared frame so the five feel like one weapon family, not five
> copies. Draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md).

## The organizing principle

The Dual Daggers archetype is canonically the **Rogue** (`party.ts`: front-row, **SPD-secondary**,
the highest SPD in the game, the lowest HP, ~zero armor). Where Sword & Shield asked *"what do you do
about incoming harm?"* and the Hammer asked *"how does your impact break the enemy?"*, the Daggers ask:

### **"What does the extra turn buy you?"** — speed as the weapon

Every dagger out-races the ATB bar — it acts more often than anyone, generating resource and stacking
its Attunement's status faster than the whole party. But each Attunement spends that speed on a
different prize, and the **attunement primary tilts each into a different kind of rogue**:

| Attunement × Daggers | Canon name | Primary + SPD | Speed buys… | Rogue seat | Fragility answer |
|---|---|---|---|---|---|
| **QUANTA** | The Anomaly | **SPD+SPD** | more turns + forced outcomes | **pure crit/tempo probabilist** *(the fastest thing alive)* | dodge → ~100% |
| **SOL** | Eclipsedancer | **AGI+SPD** | burst before they blink | **glass-cannon burst assassin** | Blind (they miss) + blink |
| **NOX** | Velestra | **STR+SPD** | more turns — and you take *theirs* | **glass tempo-executioner** | deny their turns (tempo + Frozen) |
| **ANIMA** | Symbiote Hunter | **VIT+SPD** | more applications, and you outlast | **poison-skirmisher** *(the durable dagger)* | VIT + Regen + lifesteal |
| **UMBRAXIS** | The Lagrangian | **DEF+SPD** | strike, drain, and don't die | **drain-duelist** *(the tanky dagger)* | Mass armor + Drain |

**Cohesion:** all five share SPD-secondary (turn economy) and the **rogue toolkit** below; the primary
decides the *role* — pure crit/tempo (QUANTA), burst (SOL), lockdown-execute (NOX), poison-sustain
(ANIMA), durable-drain (UMBRAXIS). One family, five non-overlapping seats. Note the deliberate spread
on the **fragility menu**: QUANTA and SOL lean *kill-first glass cannons*; NOX locks the enemy out of
the fight; ANIMA (VIT) and UMBRAXIS (DEF) are the *survivable* daggers that can hold the front row — a
real menu of how a rogue stays alive, not one squishy template five times.

## The shared rogue DNA (what makes a dagger a dagger)

Parallel to the Hammer's stagger / sunder / Shatter, every Dual Daggers class is built from the same
four pieces — themed by its Attunement, but always present:

1. **Twin-strike (double roll).** The auto and many specials hit *twice* → two crit checks, two status
   applications. The dagger is the game's fastest **applicator** of its Attunement signature.
2. **Opening → Finisher.** Cheap fast specials build an **Opening**; a signature spends it. The dagger
   does **not invent a new payoff** — it *accelerates its Attunement's existing phase-transition
   chain*: SOL **Detonate**, NOX **Shatter**, ANIMA **Bloom**, UMBRAXIS **Singularity**, QUANTA
   **Collapse**. (No new combo-point resource; the Opening is the attunement's own escalating status.)
3. **Tempo lean.** Every dagger dips its Attunement's action-economy layer (Haste / extra-turn / drag /
   time-dilate / rewind), because SPD is secondary on all five.
4. **Fragility management.** 40 HP / 1 armor on the *front line* is the deliberate knife-edge; each
   class survives it through its own suite (see the table) — none of them just "has more armor."

## Per-class sketches

### QUANTA · The Anomaly — pure crit/tempo probabilist (the flagship)
SPD+SPD: literally the fastest possible class, and with **no DoT** (canon: QUANTA's signature is
probability, not a tick) it's the *pure* crit-and-time dagger. Manipulates outcome and turn-order;
survives on **dodge %** (canon avoidance rule: no immune state, just dodge toward ~100%). The
template-setter for the family. *(Flavor stays in the math/physics register — wavefunction, amplitude,
measurement, collapse — never gambling motifs.)*
- **A · Amplitude** — crit-amplification burst: raise the *probability amplitude* of a critical
  outcome (stack crit), twin-strike to take two measurements, then **collapse the wavefunction to a
  guaranteed maximal crit**. The variance→certainty axis as amplitude → measurement → collapse. *(single-target nuke)*
- **B · Probability Storm** — the tempo engine: chance of extra turns, Haste, **rewind** a missed
  strike, **pre-empt** the enemy (foresight). Acts more than anything in the game. *(SPD / action-economy)*
- **C · Collapse** — dodge-survival + Doom: collapse incoming attacks to misses (dodge→~100%),
  **Decohere** the enemy's accuracy, stamp **Doom** (a delayed, *determined* hit) and resolve it. *(evasion + outcome-control)*

### SOL · Eclipsedancer — glass-cannon burst assassin (light-blink)
AGI+SPD, **pure offense** (SOL has no defensive line). Blink through light and shadow, strike from
nowhere, detonate. Survives by **Blinding** the enemy (SOL's miss-mechanic) and blink-repositioning,
or simply killing first.
- **A · Sundancer** — single-target burst combo: fast radiant cuts build an Opening, spent on a
  blinding crit finisher. *(AGI / crit, the nuke)*
- **B · Eclipse** — blink/Blind evasion & setup: teleport-strike out of the front row, **Blind** the
  enemy (they miss → survival), Haste self. *(SPD / tempo + survival via Blind)*
- **C · Wildfire** — Burn-spread: rake **Burn** on with every cut (fast = many stacks), then
  **Detonate** it to spread across the enemy line (Overheat → Ignite → Detonate). *(Burn engine, AoE payoff)*

### NOX · Velestra — glass tempo-executioner (steal their turns, then execute)
STR+SPD. Velestra owns NOX's **action-economy / tempo** half: she floods Stasis faster than anyone,
drags and skips the enemy's attack-bar, and executes the foe she's locked out of the fight. A glass
knife that survives by **denying the enemy its turns** (Frozen / tempo-denial), not by warding. *Two
deliberate distinctions: from the NOX Hammer (Equilibrium Ascendant, the planted control-crusher), and
— the important one — from the NOX **Rimewalker** (Dual Swords). Velestra has **no ward, no NOX
battery, no parry**, and her Shatter is a **fast STR execute** (a turn-economy kill), never a crit.*
- **A · Hoarfang** — **Stasis-flood**: rapid twin-strikes pile **Stasis** + **Chill** — the fastest
  applicator of NOX's signature (volume from her speed, not a slow grind). *(DoT engine)*
- **B · Stillblade** — **tempo lockdown**: attack-bar **drag** / push-back, **time-skip**, Freeze-to-deny
  — lock the enemy out of acting. The action-economy lane, distinctly hers. *(SPD / tempo denial)*
- **C · Shatterpoint** — **fast STR execute**: exploit Frozen / Brittle / low-HP for a quick heavy kill.
  *(STR / executioner)*

### ANIMA · Symbiote Hunter — poison-skirmisher (the durable dagger)
VIT+SPD: the *survivable* dagger that can actually hold the front row. Bonded to a living symbiote, it
coats its blades in contagion and outlasts everything. **No summons** (that's the ANIMA S&S / Hammer) —
this one wins through Infestation + self-sustain.
- **A · Contagion** — Infestation-flood: stack **Infestation** (the living poison that *spreads on the
  host's death*) with every fast hit; the best applicator in the game. *(DoT engine, attrition)*
- **B · Parasite** — symbiotic self-sustain: lifesteal + **Regen** on hit, **metabolize** the target's
  debuffs / corpses to heal & grow; the self-sustaining skirmisher. *(VIT / sustain self)*
- **C · Hunter's Bond** — Evolution / support: a hunter's-mark that **grows** (Seed → Bloom →
  Overgrowth), shares symbiotic Regen with allies, and exposes the marked target for the party. *(support / team)*

### UMBRAXIS · The Lagrangian — drain-duelist (the tanky dagger, gravity/void)
DEF+SPD: the durable fast duelist. Drains life with every cut (the conservation economy), pins the
target with gravity, ramps Crush to a collapse. Survives via **Mass armor + Drain**. *Distinct from the
UMBRAXIS Hammer (Graviton Warden, AoE pull-slam bruiser) and the Tidal Sovereign (wall tank): the
Lagrangian is a **single-target drain-duelist.***
- **A · Siphon** — Drain-skirmish: lifesteal / **Drain** on every cut (conservation — your loss is my
  gain); siphon to sustain and to fuel finishers. *(drain engine, sustain)*
- **B · Lagrange Point** — gravity-control: **Anchor** / pin the target (event-horizon — can't flee or
  swap rows), pull, **time-dilate** near the blade; reposition self. *(control / DEF, deny escape)*
- **C · Singularity** — ramping Crush finisher: build gravity pressure (**Crush** escalates the longer
  it's held), then collapse it for a massive single-target burst on the pinned target. *(single-target ramp payoff)*

## Open flags (for Dara / later)
- Confirm the family frame **"the Rogue — five edges of speed,"** and the organizing question
  **"what does the extra turn buy you?"**
- **QUANTA flavor register:** all of The Anomaly's probability language stays **math/physics**
  (wavefunction / amplitude / measurement / collapse / decohere), **never gambling motifs** — per the
  same call that made canon prefer "Decohere" over "Jinx." (Dev direction, 2026; confirm.)
- **NOX Velestra ↔ Rimewalker split (resolved 2026-06-29).** The two NOX dual-wield classes first read
  too alike (both Stasis-attrition → Frozen→Shatter → control). Re-cut so they own opposite halves of
  NOX: **Velestra = action-economy/tempo + flood + fast execute (glass)**; **Rimewalker = crit-shatter +
  frost parry/ward + NOX battery (durable)**. They now share only the NOX signature (Stasis,
  Chill→Frozen→Shatter), expressed via speed/execute vs crit/parry. (Both kept clear of the Hammer's
  Equilibrium Ascendant.)
- **UMBRAXIS "The Lagrangian"** shares its name with Dara's legendary figure **"The Last Lagrangian"**
  ([legendary-figures](../legendary-figures.md)) — intentional resonance or rename? Flagging the lore
  tie for Dara to bless.
- **ANIMA Symbiote Hunter** kept **summon-free** (contagion + self-sustain), distinct from the two
  ANIMA summoner/protector classes — confirm.
