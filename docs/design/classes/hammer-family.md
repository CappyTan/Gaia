# Hammer — the class family (the Breaker: five physics of the blow) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** A family-design note for the five Hammer
> classes (one per Attunement), shaped in a dev + agent session, mirroring the
> [Sword & Shield family](./sword-and-shield-family.md). Its job: give the `build-class` runs a shared
> frame so the five feel like one weapon family, not five copies. Draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). **NOX is already built**
> ([Equilibrium Ascendant](./nox-hammer.md)); this note fills in the other four around it.

## The organizing principle

The Hammer is canonically the **Breaker** (`party.ts`: front-row, **STR-secondary**, heavy/slow, high
impact). Where Sword & Shield asked *"what do you do about incoming harm?"*, the Hammer asks:

### **"How does your impact break the enemy?"** — five physics of the blow

Every Hammer is a Breaker, sharing the same DNA — **stagger/stun**, **armor-sunder**, attack-bar
**push-back**, and the **Shatter** payoff (the phase-transition family). But each Attunement makes the
blow *land* differently, and the **attunement primary tilts each into a different kind of breaker**:

| Attunement × Hammer | Canon name | Primary + STR | The blow is… | Breaker flavor |
|---|---|---|---|---|
| **NOX** | Equilibrium Ascendant ✓ | STR+STR | **Freeze → Shatter** — still it, then break it | **control**-crusher *(built)* |
| **SOL** | Solar Arbiter | **AGI**+STR | **a blast** — impact detonates & **spreads** outward (here-and-now) | fast **AoE burst**-breaker |
| **ANIMA** | Lifekeeper | **VIT**+STR | **a lifequake** — impact erupts with growth & healing | **sustain**-bruiser / AoE secondary healer |
| **QUANTA** | Causality Arbiter | **SPD**+STR | **a determined verdict** — the outcome is fixed *in time* (crit/Doom) | **tempo / fate** single-target breaker |
| **UMBRAXIS** | Graviton Warden | **DEF**+STR | **a gravity slam** — impact **pulls** foes in & **crushes** (ramp) | durable **gravity**-breaker |

**Cohesion:** all five share STR-secondary (the impact) and the Breaker toolkit (stagger / sunder /
Shatter); the primary decides the *role* — control (NOX), burst (SOL), sustain (ANIMA), tempo/fate
(QUANTA), tank-bruiser (UMBRAXIS). One family, five non-overlapping seats.

## Per-class sketches

### NOX · Equilibrium Ascendant — **built** ✓
The control-crusher: Stasis attrition → Shatter, lockdown, NOX battery. Full spec:
[`nox-hammer.md`](./nox-hammer.md). Lanes: Stillgrave / Stillbreaker / Equilibrium Warden.

### SOL · Solar Arbiter — AoE burst-breaker (radiant, *spatial* judgment)
A glass-cannon wrecking ball (AGI = quick, precise heavy swings). Its judgment is **spatial**: the
blow **detonates and spreads** — shockwaves, sunder, Burn, Blind — breaking everything *around* the
impact, here and now. *(The "Arbiter" who passes sentence with light and force.)*
- **A · Seismic** — AoE shockwave slams; hit clusters, spread the damage. *(the wide wrecker)*
- **B · Sunder** — armor-break + Scorched vulnerability; soften the enemy line for the team. *(enabler)*
- **C · Pyroclasm** — Burn-on-impact that spreads, then **detonate** it for a blast. *(burn engine)*

### ANIMA · Lifekeeper — sustain-bruiser / AoE secondary healer
A warpriest-smasher: every blow **feeds life**. Front-line that sustains *by* wrecking — and can flex
into a **DPS-based AoE secondary healer** (heal the party while dealing damage). VIT+STR. *(Distinct
from the ANIMA S&S summoner: this heals through impact, no menagerie.)*
- **A · Lifequake** — AoE ground-slams that **heal the party** as they damage. *(the dps-aoe-heal lane)*
- **B · Bloodfeast** — metabolize-on-hit: lifesteal/Drain + Regen; self-sustain bruiser. *(self-sustain)*
- **C · Wildgrowth** — impacts seed **flora totems / Regen fields** + Bloom buffs (terrain growth, not creatures). *(growth support)*

### QUANTA · Causality Arbiter — tempo / fate single-target breaker (*temporal* judgment)
The counterpoint to the Solar Arbiter: its judgment is **temporal/probabilistic**, not spatial. The
blow's outcome is **already written** — single-target, fate-sealed. SPD+STR. *(Where SOL breaks
everything around the impact, QUANTA decides the impact's outcome before it lands.)*
- **A · Verdict** — determined strikes: **gamble** a colossal crit, or **collapse** to a guaranteed crit/stagger. *(the executioner)*
- **B · Doomsmith** — stamp **Doom** on impact (a determined future hit); detonate it. *(inevitability / win-con)*
- **C · Tempo** — SPD: an **extra action on stagger**, push enemy attack-bars, **rewind** a missed swing. *(tempo-breaker)*

### UMBRAXIS · Graviton Warden — durable gravity-breaker
The heaviest hammer (DEF+STR) — a *bruiser*, not a pure tank (that's the Tidal Sovereign). Gravity
is used to **smash**: pull foes into the blow, crush, anchor — while its DEF keeps it standing.
- **A · Singularity Slam** — **pull** foes into the impact + AoE crush (the gravity setpiece). *(cluster breaker)*
- **B · Crush** — ramping single-target gravity damage + Anchor. *(heavy executioner)*
- **C · Mass** — DEF self-sustain & redirect; breaks while enduring. *(durable bruiser)*

## The two Arbiters, deliberately differentiated
- **Solar Arbiter (SOL)** = **spatial** judgment — *AoE, here-and-now*, the blast that breaks everything around the impact. Light/force.
- **Causality Arbiter (QUANTA)** = **temporal** judgment — *single-target, fate-sealed*, the verdict already written (crit/Doom/tempo). Probability/time.

## Open flags (for Dara / later)
- Confirm the family frame **"the Breaker — five physics of the blow."**
- **ANIMA Lifekeeper** as sustain-bruiser + flex AoE secondary healer (vs the dedicated Staff healer we'll build later) — confirm the heal here stays *secondary* (impact-gated), not a main-healer.
- Keep **UMBRAXIS Graviton Warden** clearly a *bruiser* (offense via gravity), distinct from the Tidal Sovereign *tank*.
