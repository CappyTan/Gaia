# Dual Swords — the class family (the Duelist: five ways to win the exchange) — RATIFIED

> **Status: RATIFIED FRAME (Dara, 2026-06-29).** The family design for the five Dual Swords classes
> (one per Attunement), shaped in a dev + agent session and blessed by Dara. Mirrors the
> [Sword & Shield](./sword-and-shield-family.md), [Hammer](./hammer-family.md), and
> [Dual Daggers](./dual-daggers-family.md) families. Built on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). The frame + lanes are ratified; the
> per-class **ability content is skill-drafted (`proposed`)**, pending a content review.
>
> **NOX · Rimewalker was fully re-spec'd here** (Dara-approved): the prior version predated the
> entropy framework (it used "Decay", lacked Chill→Frozen→Shatter). The new spec reconciles it to the
> ratified NOX suite.

## The organizing principle

The Dual Swords archetype is the front-row **DPS duelist** (`party.ts`: `role: "DPS"`, **AGI-secondary**,
44 HP / 2 armor — sturdier and steadier than the dagger's 40/1). Its primary axis is **AGI** — finesse,
crit, evasion, footwork. Where Sword & Shield asked *"what do you do about harm?"*, the Hammer *"how
does your impact break the enemy?"*, and the Daggers *"what does the extra turn buy?"*, the Dual Swords
ask:

### **"How do you win the exchange?"** — the duelist's bladework

**The critical distinction from the Daggers** (the two archetypes could blur — both are dual-wield
melee): the **Dagger is assassination** — SPD turn-economy, glass, burst-and-vanish, the fastest
applicator. The **Dual Sword is the duel** — AGI, it *stands and fights* (sturdier), and wins a
**sustained exchange** through precision (crit), the **parry-riposte** (two blades = offense *and*
defense in one), and flow. **Daggers spend speed; duelists spend skill.**

| × Dual Swords | Canon name | Primary + AGI | Seat | vs its dagger cousin |
|---|---|---|---|---|
| **SOL** | Sunblade | **AGI+AGI** | **pure crit duelist** *(flagship)* | stand-and-duel crit machine, not Eclipsedancer's hit-and-vanish |
| **NOX** | Rimewalker | STR+AGI | **durable crit-parry preservationist** | crit-shatter + parry/ward + NOX battery — *not* Velestra's tempo/flood/execute (no grind, no attack-bar denial) |
| **ANIMA** | Pulse Arbiter | VIT+AGI | **adaptation/evolution duelist** | mutating bladework that *adapts*, not Symbiote Hunter's contagion-flood — **and explicitly NOT a healer** |
| **QUANTA** | Phasewalker | SPD+AGI | **evasive phase-duelist** | blink-dodge-and-riposte (controls *space*), not the Anomaly's turn-stealing (controls *time*) |
| **UMBRAXIS** | Abyssal Vector | DEF+AGI | **counter/redirect duelist** | parry-and-redirect with gravity, not the Lagrangian's drain-siphon |

**Cohesion:** all five share AGI-secondary (the duelist's finesse) and the **duelist DNA** below; the
primary decides the role — pure crit (SOL), control/preservation (NOX), adaptation (ANIMA), evasion
(QUANTA), counter/tank (UMBRAXIS). Note the parallel to the daggers: **SOL is the doubled-stat
flagship here** (AGI+AGI), the way QUANTA was for the daggers — the purest crit duelist.

## The shared duelist DNA (what makes a dual-sword a dual-sword)

1. **Crit (AGI-keyed).** The duelist wins by landing clean, precise, *critical* hits — not by volume.
2. **Riposte / Parry.** Two blades = offense *and* defense in one; a blade kept back to **counter** an
   attack. The dual-sword's survival tool — the inverse of the dagger's pure-offense twin-strike. AGI
   feeds the evasion/parry.
3. **Flow / stance.** Sustained bladework chains that build momentum; the *exchange*, not the burst.
4. **Reuse the Attunement's own phase-transition chain** for payoffs (no new resource — same rule as
   the daggers): SOL **Detonate**, NOX **Shatter**, ANIMA **Overgrowth**, UMBRAXIS **Singularity**,
   QUANTA **Collapse**.

## Per-class sketches

### SOL · Sunblade — pure crit duelist (the flagship)
AGI+AGI: the doubled-stat crit machine, **pure offense** (SOL has no defensive line). A radiant
bladesman who wins the exchange with clean, brilliant crits and a parry of light. *Distinct from the
SOL dagger (Eclipsedancer): a stand-and-duel crit machine, not a hit-and-vanish assassin.*
- **A · Solar Edge** — crit-burst bladework: stack crit, radiant finishers; the AGI+AGI single-target duel.
- **B · Sunflare** — Burn through sustained cuts, then **Detonate** it; Blind to win the exchange.
- **C · Riposte** — the light parry: parry → radiant counter, evasion-via-Blind. The duelist's defense.

### NOX · Rimewalker — durable crit-parry preservationist *(re-spec'd to the framework)*
STR+AGI. Rimewalker owns NOX's **preservation** half — parry, ward, the "banks" battery — plus the
**crit-shatter** payoff, and survives by **defending**. Reconciled to the ratified NOX suite: **Stasis**
(not "Decay"), **Chill → Frozen → Shatter**, Brittle, stillness/lattice ward, the **banks** economy.
*Distinct from the NOX dagger (Velestra, the glass tempo/flood/execute assassin): Rimewalker has **no
grind lane, no attack-bar denial, no fast execute** — his Shatter is a clean **AGI crit** on a frozen
guard, and his defense is a **frost parry**. They share only the NOX signature.*
- **A · Glasscutter** — **crit-shatter**: clean AGI crits that Shatter a Frozen/Brittle target — the
  showcase NOX payoff, his lead lane.
- **B · Frostward** — **frost parry / riposte + ward**: parry with the off-blade, counter with cold
  (Chill the attacker), lattice ward self-mitigation. The duelist's defense — distinctly his.
- **C · Hoarwarden** — **preservation + NOX battery**: time-lock, a party stillness/lattice ward, and
  banks the shared NOX pool — the control/economy enabler.

### ANIMA · Pulse Arbiter — adaptation/evolution duelist (NOT a medic)
VIT+AGI. Per the ratified **"Staff + one secondary healer"** decision, this class is **explicitly not a
healer** — party-healing belongs to the Staff (Genesis Sage), the one secondary to the Hammer
(Lifekeeper). Pulse Arbiter is ANIMA's **adaptation** mode of *order-through-change*: a duelist whose
bladework **evolves and adapts** mid-fight. *Distinct from the ANIMA dagger (Symbiote Hunter, the
contagion-flood skirmisher): this one mutates and adapts rather than floods.*
- **A · Adaptblade** — evolving bladework: strikes mutate and escalate (Seed → Bloom → Overgrowth); **grow resistance** to a damage type after you're hit by it.
- **B · Mutagen** — Infestation through the cuts, then **metamorphose** it into stronger forms; contagion, not healing.
- **C · Symbiont Form** — *self*-adaptation: change stance, grow resistances, **light self-sustain only** — no party heals.

### QUANTA · Phasewalker — evasive phase-duelist
SPD+AGI. Controls **space** (phase/blink), where the QUANTA dagger (The Anomaly) controls **time**
(turn-economy). Survives by phasing; crit + dodge + riposte. *(QUANTA flavor stays in the math/physics
register — phase, superposition, decohere, observation, paradox — **never gambling motifs**, per the
same call that re-specced the Anomaly.)*
- **A · Phase Edge** — blink-strike crit: phase in, land a measured crit, phase out.
- **B · Afterimage** — dodge/evasion via phase (dodge → ~100% window), **Decohere** the enemy.
- **C · Riposte Paradox** — parry by phasing *through* the blow, then a determined counter (stamp **Doom**).

### UMBRAXIS · Abyssal Vector — counter/redirect duelist
DEF+AGI: the durable bladesman. Uses gravity to **bend the exchange back** — parry-and-redirect, the
counter-duelist. *Distinct from the UMBRAXIS dagger (The Lagrangian, the drain-siphon skirmisher):
Abyssal Vector **redirects** force rather than **siphons** life.*
- **A · Redirect** — parry-and-redirect: bend the incoming attack back with gravity (the signature counter).
- **B · Gravity Edge** — Anchor/pull the target into your blade; ramping **Crush** in the exchange.
- **C · Event Blade** — DEF mass-armor sustain + a little drain to hold the duel; the durable anchor.

## Notes & flags
- **Rimewalker re-spec** supersedes the prior ratified spec; reconciled to the ratified NOX framework
  (Stasis / Chill→Frozen→Shatter / banks / preservation). Dara-approved (2026-06-29).
- **ANIMA "Staff + one secondary healer"** (Dara-approved): only the **Staff (Genesis Sage)** is a
  dedicated healer and only the **Hammer (Lifekeeper)** is a secondary one. Pulse Arbiter (this family)
  is a non-healer; the daggers' Symbiote Hunter is trimmed to self-sustain only; the S&S Soul-Bound
  Aegis shifts ally-heals → grafting growing buffs. (Cross-family changes applied alongside.)
- **SOL AGI+AGI flagship** parallels the QUANTA SPD+SPD dagger flagship — the purest crit duelist.
