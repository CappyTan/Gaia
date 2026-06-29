# Velestra — NOX × Dual Daggers

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec, authored by the
> `build-class` skill against the [Class System Model](./README.md). Lanes + fantasy locked in the
> [Dual Daggers family note](./dual-daggers-family.md) (`from-brief`); abilities are skill-drafted
> (`proposed`). Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Shatter · Brittle · attack-bar drag/push-back ·
> time-lock · stillness ward · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28). **Stasis** is the
> design name for NOX's signature DoT (engine keyword `decay`). If that framework shifts, reconcile
> this kit toward it.
>
> **Distinctness.** Velestra is the **mobile single-target executioner** of the NOX line — fast,
> precise cuts that *still* a target and then *shatter* it. She is kept clear of the three other NOX
> classes: the **Equilibrium Ascendant** (Hammer — the planted control-*crusher* with heavy slams),
> the **Rimewalker** (Dual Swords — the frost duelist with crit/evasion), and the **Penumbral Bastion**
> (Sword & Shield — the shadow wall). She doesn't slam, she doesn't tank, she doesn't out-crit: she
> locks the target out of the fight and executes it.

## Identity (derived + DNA)

- **Class:** Velestra · **Attunement × Archetype:** NOX × Dual Daggers *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** SPD (← Dual Daggers) — a STR/SPD executioner
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed between turns)
- **Attunement signature:** **Stasis** — cold cessation, vitality winding toward absolute zero (not rot)

**Fantasy.** *(`from-brief`)* Velestra is the lockdown executioner — each cut precise *and* heavy. She
out-races the ATB bar like every dagger, but she spends those extra turns on a first strike that
*stops* the target: rapid cuts seed creeping Stasis and drag the attack-bar, Chill deepens to a
crystalline Frozen, and then a single heavy STR finisher shatters the stilled foe. She survives the
knife-edge of the front row not by armor but by **stopping the enemy from acting** — a frozen thing
swings at nothing. Patient, fast, inevitable: she stills you, then she shatters you.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Hoarfang** | Stasis-attrition — rapid twin cuts stack **Stasis** (DoT) + **Chill**; grind the target and drag its attack-bar | **STR**, Stasis stacks/duration, tempo-drag | sustained single-target / boss DPS | vs tanky/boss HP pools; STR-stacked gear |
| **B · Shatterpoint** | Frozen → Shatter execute — freeze the target, then a heavy STR finisher with bonus vs Frozen / Brittle / low-HP | **STR**, Frozen/Brittle setup, Execute | single-target burst / executioner | vs targets you can lock; spike a priority kill |
| **C · Stillblade** | Lockdown / preservation — Chill → Frozen control, **time-lock** enemy actions, **Brittle** the target for the team; a little stillness-ward self-protection | **SPD/DEF**, control/tempo, team-setup | disruptor / enabler / self-survival | vs dangerous fast attackers; a party that punishes Frozen/Brittle foes |

**Build axes:** attrition ↔ execute (A↔B) · self-carry ↔ team-control (B↔C) · single-target damage ↔
lockdown/preservation (A,B ↔ C).

**Shared rogue DNA** *(`from-brief`, family note):* (1) **twin-strike** — the auto and many specials
hit twice → two Stasis/Chill applications, the fastest applicator of NOX's signature; (2)
**Opening → Finisher** — cheap fast specials build the Opening by spending NOX's own escalating chain
**Chill → Frozen → Shatter** (no new combo-point resource); (3) **tempo lean** — Chill drag and
attack-bar push-back, because SPD is secondary; (4) **fragility answer = lock them down (Frozen)**, not
tank it.

**Cross-lane synergy:** **C freezes & makes Brittle → B shatters the stilled target → A grinds whatever
survives.**

---

## Auto-attack *(unlaned)*

- **Twinfrost** · phys · enemy · *two quick crystalline cuts (twin-strike); the second lays a touch of Stasis* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Rimefang Cut** · phys · enemy · *two fast cuts (twin-strike), each applying light Stasis* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Opening Frost** · phys · enemy · *a quick precise stab that applies Chill — the Opening for the Shatter chain* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Pinning Frost** · phys · enemy · *strike that deepens Chill and pushes the target's attack-bar back* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Stilling Touch** · util · enemy · *a cold flick that Chills and briefly delays the target's next action* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Frostbleed** · phys · enemy · *two cuts; extends and deepens the target's existing Stasis* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Crystal Mark** · util · enemy · *mark the target Brittle (it takes bonus burst damage) for the party* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Glacial Vivisection** · phys · enemy · *a rapid four-cut flurry (twin twin-strike); the last cut deepens Stasis* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Frostlock Strike** · phys · enemy · *strike that Freezes the target if it is already Chilled* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Brittle Cut** · phys · enemy · *heavy cut; bonus damage vs Frozen/Brittle foes, and leaves the target Brittle* · gen **major NOX** · cd **medium** · `proposed`
- **C · Frostbound Web** · util · allEnemies · *a thrown cold lace: Chill all foes and drag their attack-bars* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Hoarfrost Grind** · phys · enemy · *two cuts; consumes some Stasis for bonus damage, leaving lesser Stasis behind* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Latticebind** · util · enemy · *time-lock the target: its current debuffs (Stasis/Chill) stop ticking down* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Coldsink Stab** · phys · enemy · *precise stab scaling with the target's current Stasis stacks* · gen **moderate NOX** · cd **medium** · `proposed`
- **B · Killing Stillness** · phys · enemy · *fast finisher; bonus damage vs low-HP foes, and refunds attack-bar on a kill* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Shatterstep** · phys · enemy · *dash-strike that detonates a Frozen target's Brittle for burst, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`
- **C · Wintergrip** · util · enemy · *seize and root the target (Anchored) and drag its attack-bar hard* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Frostrend Cascade** · phys · enemy · *a flurry that spreads light Stasis to a second nearby foe if the target is already afflicted* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Stillward Dance** · buff · self · *a cold guard-stance: brief stillness ward (damage reduction) while your specials keep flowing* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Deepfrost Carve** · phys · enemy · *heavy twin cut; applies max-duration Stasis* · gen **major NOX** · cd **medium** · `proposed`
- **B · Frozen Verdict** · phys · enemy · *heavy execute; massively bonus vs Frozen/Brittle/low-HP targets* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Creeping Frostfang** · phys · enemy · *deep twin cut that applies heavy Stasis and Chill at once* · cost **med NOX** · cd **medium** · `proposed`
- **B · Quietus Cut** · phys · enemy · *a precise finisher; consumes the target's Stasis for bonus damage* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Frostlock Verdict** · phys · enemy · *Freeze the target, then strike it for a Shatter burst* · cost **med NOX** · cd **medium** · `proposed`
- **C · Hush of Winter** · util · allEnemies · *AoE Chill + attack-bar drag; the front line goes quiet* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Glacial Hemorrhage** · phys · enemy · *strike scaling with the target's current Stasis stacks* · cost **med NOX** · cd **medium** · `proposed`
- **C · Brittlemark Edict** · util · allEnemies · *mark all foes Brittle (party-wide shatter setup)* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Winterfang Spread** · mag · enemy · *detonate the target's Stasis for a burst; reseeds lesser Stasis on a nearby foe* · cost **med NOX** · cd **medium** · `proposed`
- **B · Execute: Hoarfrost** · phys · enemy · *massive execute vs a Frozen or Brittle target (the Shatter payoff)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Glassbreaker's Dance** · phys · enemy · *a multi-cut flurry on a single target; every cut against a Frozen/Brittle foe shatters for bonus* · cost **high NOX** · cd **medium** · `proposed`
- **C · Crystalline Cessation** · util · enemy · *encase the target in ice — a long Freeze (can't act); it Shatters for bonus if struck* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Lingering Hoarfrost** · mag · enemy · *heavy Stasis; reduces the target's incoming healing* · cost **med NOX** · cd **medium** · `proposed`
- **C · Time-Lock Shroud** · buff · allAllies · *time-lock the party's current buff durations so they stop ticking down (preservation)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Permafrost Sentence** · mag · enemy · *detonate accumulated Stasis for a burst scaling with stacks consumed* · cost **high NOX** · cd **medium** · `proposed`
- **B · Shatter Cascade** · phys · enemy · *a chain of cuts; each strike on a Frozen/Brittle target extends the chain* · cost **high NOX** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Killing Cold** · phys · enemy · *Freeze the target and zero its attack-bar, then strike for a colossal Shatter* · cost **high NOX** · cd **long** · `proposed`
- **C · Stasis Lattice** · util · allEnemies · *a frozen lattice clamps the field: Brittle + attack-bar drag on all foes; their current debuffs are time-locked* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Terminal Hoarfrost** · mag · enemy · *apply deep, un-cleansable Stasis* · cost **high NOX** · cd **long** · `proposed`
- **C · Frozen Asylum** · buff · allAllies · *a stillness ward over the party (damage reduction) + a burst of banked party NOX* · cost **med NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · The Endless Grind** *(Hoarfang)* · enemy · *bury the target under max-duration Stasis that ticks twice as fast, and drag its attack-bar to a crawl* · `proposed`
- **B · Mortal Shatter** *(Shatterpoint)* · enemy · *plunge the target to absolute zero — guaranteed Freeze + max Brittle, then a single colossal Shatter scaling with missing HP* · `proposed`
- **C · The Stillpoint Lattice** *(Stillblade)* · allEnemies · *the field crystallizes: Freeze every foe, time-lock their actions, and Brittle them all for the party (a team-wide shatter window)* · `proposed`
- **Absolute Cessation** *(neutral/fusion)* · allEnemies · *all motion ends — deep Stasis + Freeze on every foe, a stillness ward on the party, and a burst of banked NOX* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Hoarfrost Veins** · *your Stasis stacks higher and lasts longer* · `proposed`
- **B · Shatterhand** · *your strikes deal more to Frozen/Brittle foes* · `proposed`
- **C · Cold Discipline** · *your specials generate extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Wintering** · *foes afflicted by your Stasis take increased damage from you* · `proposed`
- **B · Headsman's Edge** · *your crit/finisher damage rises against foes below an HP threshold* · `proposed`
- **C · Bonefrost** · *your Chills and Freezes last longer and drag the attack-bar harder* · `proposed`

**Set @ MNA 90**
- **A · Unthawing** · *your max-stack Stasis becomes un-cleansable* · `proposed`
- **B · Glassfang** · *when you Shatter a Frozen/Brittle target, refund part of your attack-bar* · `proposed`
- **C · Crystalward** · *while your stillness ward holds, your time-locked durations don't tick down* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary SPD ← Dual Daggers · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX | ✓ |
| Every entry has a provenance flag (`from-brief` for class/lane names + fantasy; abilities `proposed`) | ✓ |
| Ability names globally unique — no internal dupes; no collision with any `docs/design/classes/*.md` ability entry (lane label "Shatterpoint" is a build identity, not an ability — distinct from the Hammer's *ability* of that name) | ✓ |
