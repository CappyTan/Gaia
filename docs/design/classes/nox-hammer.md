# Equilibrium Ascendant — NOX × Hammer

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Every entry is `proposed` (the designer supplied the class
> identity + the anti-entropy framing; abilities are skill-drafted) — ratified canon (Dara, 2026-06-28). Numberless by
> design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Shatter · lattice ward · dispel-lock · the
> "banks" economy) is drawn from the [Attunement Mechanics Framework](../attunement-mechanics.md),
> which is **ratified canon (Dara, 2026-06-28)**. If that framework shifts, reconcile this
> kit toward it. In particular, **Stasis** is the design name for NOX's signature DoT (engine keyword
> `decay`).

## Identity (derived + DNA)

- **Class:** Equilibrium Ascendant · **Attunement × Archetype:** NOX × Hammer
- **Primary stat:** STR (← NOX) · **Secondary stat:** STR (← Hammer) — a hyper-focused STR bruiser
- **Resource:** NOX (generates & spends the party's shared NOX pool; NOX **banks** — slow to spend, doesn't bleed)
- **Attunement signature:** **Stasis** — cold cessation / order / anti-entropy (not rot)

**Fantasy.** The Equilibrium Ascendant wields a two-handed maul as an instrument of **order against
entropy**. SOL spreads heat, motion, and chaos; NOX is the cold law that says all motion must end.
The Ascendant arrives, plants their feet, and **imposes stillness** — each blow drags its target
toward absolute zero, winding down their tempo until they simply stop. He doesn't rot the living; he
*arrests* them. The strong are slowed to the pace of the weak, the fast are frozen mid-step, and the
line behind him is braced into an unbreakable, balanced wall. Patient, immovable, inevitable.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Stillgrave** | Cold-attrition crusher — heavy blows stack **Stasis** and pay off through **Shatter** | **STR**, Stasis stacks/duration | sustained single-target / boss DPS | vs tanky/boss HP pools; STR-stacked gear |
| **B · Stillbreaker** | The Breaker — Chill/Freeze, stuns, and **attack-bar push-back** that arrest enemy tempo | **STR**, control/stagger, attack-bar | disruptor / front-line lockdown | vs dangerous casters & fast packs; party that punishes frozen foes |
| **C · Equilibrium Warden** | Anti-entropy bulwark + **NOX battery** — lattice wards, preserves party buffs, feeds the shared pool | DEF/bulk, NOX economy, mitigation | enabler / protector / battery | NOX-stacked party (feeds the pool) or a fragile party needing a wall |

**Build axes:** damage ↔ control (A↔B) · offense/self-carry ↔ support/defense (A,B↔C) ·
single-target ↔ field/AoE (A↔B,C).

**Cross-lane synergy:** **B freezes → A shatters → C keeps the party standing and the NOX pool banked.**

---

## Auto-attack *(unlaned)*

- **Tolling Blow** · phys · enemy · *a slow, heavy maul swing* · gen **minor NOX** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Grave Weight** · phys · enemy · *heavy strike; applies Stasis* · gen **moderate NOX** · cd **short**
- **B · Concussive Blow** · phys · enemy · *strike; applies brief Chill (slows attack-bar gain)* · gen **moderate NOX** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Frost Knell** · phys · enemy · *strike; deepens Chill and pushes the target's attack-bar back* · gen **moderate NOX** · cd **medium**
- **C · Lattice Brace** · buff · self · *raise a lattice ward (damage reduction); bank NOX* · gen **major NOX** *(battery)* · cd **medium**

**@ MNA 25** *(A/C)*
- **A · Hoarfrost Crush** · phys · enemy · *heavy strike; bonus damage vs Chilled/Frozen foes* · gen **moderate NOX** · cd **short**
- **C · Order's Tithe** · buff · self · *the party's next NOX ability costs less; bank NOX* · gen **major NOX** *(battery)* · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Creeping Cold** · phys · enemy · *two strikes, each applying light Stasis* · gen **moderate NOX** · cd **short**
- **B · Stagger Smash** · phys · enemy · *strike; stuns if the target is already Chilled* · gen **moderate NOX** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Permafrost Slam** · phys · allEnemies · *ground slam; Chill all foes (slows)* · gen **moderate NOX** · cd **medium**
- **C · Anchor Stance** · buff · self · *plant: greatly reduce damage taken and draw threat; bank NOX* · gen **major NOX** *(battery)* · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Frostreap** · phys · enemy · *heavy strike; consumes some Stasis for bonus damage, leaving lesser Stasis* · gen **moderate NOX** · cd **medium**
- **C · Lattice Conduit** · buff · allAllies · *the party's next NOX ability is discounted; NOX surge* · gen **major NOX** *(battery)* · cd **long**

**@ MNA 65** *(A/B)*
- **A · Gravecrush Combo** · phys · enemy · *three descending blows; the last deepens Stasis* · gen **moderate NOX** · cd **medium**
- **B · Rime Hook** · phys · enemy · *strike that drags the target's attack-bar back hard and briefly Anchors (roots) it* · gen **moderate NOX** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Glacial Sunder** · phys · enemy · *armor-break strike; Frozen targets are also made Brittle (extra shatter damage)* · gen **major NOX** · cd **medium**
- **C · Stillwater Aegis** · buff · allAllies · *brief party damage reduction; preserve allies' current buff durations (freeze the timers)* · gen **moderate NOX** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Encase** · phys · enemy · *heavy strike; if the target is Frozen, extend the freeze and pile on Stasis* · gen **moderate NOX** · cd **medium**
- **C · Hoarvault** · buff · self · *store a large NOX reserve for the party (big battery); small self ward* · gen **major NOX** *(battery)* · cd **long**

**@ MNA 95** *(A/B)*
- **A · Mortal Stillness** · phys · enemy · *massive strike; applies max-duration Stasis* · gen **major NOX** · cd **medium**
- **B · Absolute Halt** · util · enemy · *slam that Freezes the target and pushes its attack-bar to zero* · gen **major NOX** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Graveward Verdict** · phys · enemy · *heavy hit; consumes the target's Stasis for bonus damage* · cost **med NOX** · cd **medium**
- **B · Concussive Decree** · phys · enemy · *strike; brief Freeze (stun)* · cost **med NOX** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Permafrost Hold** · util · allEnemies · *AoE Chill + brief Anchor (root); slows all attack-bars* · cost **low NOX** · cd **medium**
- **C · Bulwark of Order** · buff · allAllies · *party lattice ward / damage reduction for several turns* · cost **med NOX** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Funeral Frost** · mag · allEnemies · *spread Stasis to every foe* · cost **med NOX** · cd **long**
- **C · Orderforge** · buff · allAllies · *increase party NOX generation for several turns (battery)* · cost **low NOX** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Exhume** · phys · enemy · *strike scaling with the target's current Stasis stacks* · cost **med NOX** · cd **medium**
- **B · Shatterpoint** · phys · enemy · *execute vs Frozen/Brittle foes (massive shatter burst)* · cost **med NOX** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Cataclysm Slam** · phys · allEnemies · *ground-shattering AoE; bonus vs Chilled/Frozen* · cost **high NOX** · cd **medium**
- **C · Glaciation** · util · allEnemies · *Freeze (stun) one or more foes* · cost **high NOX** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Tomb Cold** · mag · enemy · *heavy Stasis; reduces the target's incoming healing* · cost **med NOX** · cd **medium**
- **C · Cold Dividend** · buff · allAllies · *refund a chunk of the party's NOX pool (battery)* · cost **low NOX** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Black Ice** · mag · enemy · *detonate the target's Stasis for a burst scaling with stacks consumed* · cost **high NOX** · cd **medium**
- **B · Gravity's Verdict** · util · allEnemies · *push all enemy attack-bars back hard + Chill* · cost **high NOX** · cd **long**

**@ MNA 80** *(B/C)*
- **B · The Long Stillness** · util · allEnemies · *AoE Freeze + Brittle (team shatter setup)* · cost **high NOX** · cd **long**
- **C · Sealing Frost** · util · allEnemies · *dispel-lock: foes cannot cleanse or gain new buffs for several turns (Sealed)* · cost **med NOX** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Terminal Stasis** · mag · enemy · *apply deep, un-cleansable Stasis* · cost **high NOX** · cd **long**
- **C · Aegis Absolute** · buff · allAllies · *big party damage reduction; preserve all ally buff timers; NOX surge* · cost **med NOX** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Entombment** *(Stillgrave)* · enemy · *plunge the target to absolute zero: max Stasis + guaranteed Freeze, then a colossal Shatter detonation*
- **B · Stillbreaker's Verdict** *(Stillbreaker)* · allEnemies · *Freeze every foe and zero their attack-bars; they shatter for massive AoE damage if struck while frozen*
- **C · Equilibrium** *(Equilibrium Warden)* · allAllies · *the world steadies: huge party-wide damage reduction + full buff-preserve + a massive party NOX surge*
- **Stillpoint** *(neutral/fusion)* · allEnemies · *collapse the field to a single still point — AoE deep Stasis + Freeze on foes, lattice ward on allies*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Gravechill** · *your Stasis stacks higher / lasts longer*
- **B · Concussion** · *your stuns and Chills also nudge the target's attack-bar back*
- **C · Cold Reserve** · *your specials generate extra NOX, and it banks (doesn't bleed)*

**Set @ MNA 60**
- **A · Brittlebones** · *foes you've Frozen take extra Shatter damage from you*
- **B · Glacial Grip** · *your Chill / Freeze / root effects last longer*
- **C · Lattice Discipline** · *your wards / damage-reduction are stronger and last longer*

**Set @ MNA 90**
- **A · Absolute Cold** · *your max-stack Stasis becomes un-cleansable*
- **B · Total Arrest** · *your Freezes can catch an additional nearby foe*
- **C · Unbreaking Order** · *while your ward holds, the party's buffs don't tick down*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary STR ← Hammer · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with `nox-dual-swords.md` (invariant #8) | ✓ |
