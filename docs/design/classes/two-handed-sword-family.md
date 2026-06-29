# Two-Handed Sword — the class family (the Reaver: how wide does the swing land?) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** A family-design note for the five
> Two-Handed Sword classes (one per Attunement), shaped in a dev + agent session, mirroring the
> [Sword & Shield](./sword-and-shield-family.md), [Hammer](./hammer-family.md),
> [Dual Daggers](./dual-daggers-family.md), and [Dual Swords](./dual-swords-family.md) families. Built
> on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md). Frame + lanes are the
> proposal; per-class ability content is skill-drafted (`proposed`).

## The organizing principle

The Two-Handed Sword and the Hammer are **both STR-secondary front-line Breakers** — literally the same
`role` string in `party.ts` (`role: "Breaker"`, front, `spd 7`, heavy). So this is the **2H ↔ Hammer
overlap**, the last and most acute of the weapon-family overlaps. The entire frame turns on one axis:

### The Hammer is the **POINT**; the Greatsword is the **ARC**

The Hammer asked *"how does your impact break the enemy?"* — a single crushing **point** (stagger /
sunder / Shatter, single-target). The Greatsword asks **"how wide does the swing land?"** — the
**sweep**:

- **Reach** — the long blade zones space: it threatens the back row, keeps foes at bay, controls the
  field by the arc's threat.
- **Cleave** — one arc hits the *whole enemy line*; the Greatsword is melee **AoE**, the front-line
  line-clearer.
- **Momentum** — slow (`spd 7`), but the **wind-up releases something cataclysmic**.

The Hammer breaks a **foe**; the Reaver breaks the **line**. Fittingly, the canon names are all
world-scale — **Starbreaker, Worldender, Timeline Breaker, Singularity Reaver, Apex Dominion.**

> **Family identity: "the Reaver."** (The engine `role` is still "Breaker", shared with the Hammer —
> but the Hammer is the *single-target* breaker, the Reaver the *line* breaker.)

## The shared Reaver DNA

1. **Cleave** — attacks hit multiple foes; the arc is melee AoE, the line-clearer.
2. **Reach / zone-control** — strike the back row, push/hold the line, threaten space.
3. **Momentum** — heavy wind-up → devastating release; force builds across the swing.
4. **Reuse the Attunement's phase chain across the LINE** (not one target): freeze the line→shatter the
   arc (NOX), Burn the line→detonate-spread (SOL), infest→overgrowth (ANIMA), superpose→collapse
   (QUANTA), pull→singularity (UMBRAXIS). No new resource.

| × 2H Sword | Canon name | Primary + STR | Seat (the arc) | vs its Hammer cousin (the point) |
|---|---|---|---|---|
| **NOX** | Worldender | **STR+STR** | doubled-STR flagship — freeze the **line**, shatter the **arc** | ⚠️ **priority watch** — same stat line *and* freeze-shatter as Equilibrium Ascendant |
| **SOL** | Starbreaker | AGI+STR | fast radiant cleave that **spreads Burn** down the line | the sweep *is* the AoE, vs Solar Arbiter's slam→detonation point |
| **ANIMA** | Apex Dominion | VIT+STR | durable apex sweeper — contagion arcs + self-evolution (**non-healer**) | dominance/contagion, not Lifekeeper's heal-bruiser |
| **QUANTA** | Timeline Breaker | SPD+STR | **momentum/time** — wind-up compresses time; a determined cleave across the line | line-scale + momentum, vs Causality Arbiter's single-target Doom |
| **UMBRAXIS** | Singularity Reaver | DEF+STR | gravity cleave — pull the **line** into the arc and reave it | pull-into-sweep, vs Graviton Warden's pull-into-point slam |

**Cohesion:** all five share STR-secondary + the Reaver DNA (cleave / reach / momentum); the primary
decides the role — pure-power line-cleave (NOX), fast Burn-spread (SOL), durable apex-dominance (ANIMA),
momentum/fate (QUANTA), gravity-gather-cleave (UMBRAXIS). **NOX is the doubled-stat flagship** (STR+STR),
as SOL was for Dual Swords and QUANTA for Dual Daggers.

## Per-class sketches (3 lanes each — a cleave lane · a reach/control lane · a momentum/payoff lane)

### NOX · Worldender — the doubled-STR line-cleaver *(⚠️ split hard from the Hammer)*
STR+STR. The pure, overwhelming sweep: freeze the whole line, then shatter the arc. *The hardest
distinctness in the game: Worldender and the NOX **Hammer (Equilibrium Ascendant)** share the same
STR+STR stat line **and** the freeze→shatter signature. The split MUST be airtight — **Equilibrium
Ascendant = single-target lockdown/control-crusher (the point); Worldender = AoE line-freeze + the
colossal sweeping shatter, raw power, no control finesse (the arc).** Worldender has no single-target
tempo-lockdown; it freezes and shatters the whole line.*
- **A · Wintercleave** — AoE **Stasis/Chill** across the line via wide arcs (freeze the line).
- **B · Glacier's Reach** — reach/zone-control: Chill-drag + Brittle the whole field, hold the line.
- **C · Worldbreak** — momentum overhead → **Shatter the entire frozen arc** (the AoE payoff).

### SOL · Starbreaker — the fast radiant line-cleaver
AGI+STR. Fast, precise sweeping arcs of light that spread Burn down the line. *vs Solar Arbiter (Hammer,
slam→detonation point): the sweep itself is the AoE — continuous cleaves + reach, not a single
detonating impact.*
- **A · Suncleave** — fast radiant sweeps that rake **Burn** across the line.
- **B · Solar Wind** — long **Blinding** arcs, reach/keep-away (AGI speed controls the field).
- **C · Starfall** — wind-up overhead that **Detonates** the line's Burn (Overheat→Ignite→Detonate, AoE).

### ANIMA · Apex Dominion — the durable apex line-sweeper (non-healer)
VIT+STR. The apex predator's reach: contagion arcs + self-evolution + territorial control. **Non-healer**
([ledger #16](../attunement-mechanics.md)): self-sustain via VIT/adaptation only, no party heals. *vs
Lifekeeper (Hammer, heal-bruiser): Apex Dominion dominates and infests, it does not heal.*
- **A · Reaping Arc** — AoE **Infestation** cleaves; spreads on the host's death (contagion-sweep).
- **B · Apex Growth** — adapt/**Overgrowth** self-evolution: grow stronger & tougher as you sweep (durable).
- **C · Dominion's Reach** — root/entangle the line, hold the kill-zone (zone-control by reach).

### QUANTA · Timeline Breaker — the momentum/time line-cleaver (math/physics register)
SPD+STR. Momentum lives strongest here: the wind-up compresses time, the cleave's outcome is already
written. *vs Causality Arbiter (Hammer, single-target Doom verdict): Timeline Breaker is line-scale +
momentum — it collapses the **whole line's** fate. (No gambling motifs — phase/superposition/collapse/
Doom/decohere only.)*
- **A · Sweeping Collapse** — superpose the line, then **collapse** the arc to a guaranteed massive cleave.
- **B · Momentum** — compress time on the wind-up (the swing "already landed"), **rewind** a missed cleave.
- **C · Event Reach** — **Doom** + **Decohere** across the line (reach-wide outcome control).

### UMBRAXIS · Singularity Reaver — the gravity line-cleaver
DEF+STR. Pull the whole line into the arc's path and reave through it. *vs Graviton Warden (Hammer,
pull-into-point slam, bruiser-tank): the Reaver pulls the line into the **sweep** and cleaves (offense/
reach, DEF+STR), not a single clustered slam.*
- **A · Reaving Pull** — gather the line into the arc's path (gravity), then cleave through it.
- **B · Crushing Arc** — ramping **Crush** across the swept line → **Singularity** collapse (AoE payoff).
- **C · Event Horizon** — DEF mass-armor + **Anchor** the line (can't flee the arc); the durable reaver.

## Open flags (for Dara / later)
- Confirm the family frame **"the Reaver — how wide does the swing land?"** and the **point (Hammer) vs
  arc (Greatsword)** axis as the differentiator.
- **⚠️ Worldender ↔ Equilibrium Ascendant** is the priority distinctness watch (same STR+STR stats +
  freeze-shatter). Confirm the **single-target control-crush (Hammer) vs AoE line-cleave (Greatsword)**
  split holds; this is the airtight line.
- **ANIMA Apex Dominion** kept a **non-healer** (ledger #16) — confirm.
