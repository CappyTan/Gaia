# Rimewalker — NOX × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed.** Greenfield design spec authored
> by the `build-class` skill against the [Class System Model](./README.md). The class fantasy, lanes,
> seat (STR+AGI frost control/preservation duelist), and duelist DNA are **`from-brief`** — the
> ratified row + sketch in the [Dual Swords family note](./dual-swords-family.md); the kit's
> individual abilities are `proposed`. **Supersedes the pre-framework Rimewalker** (which used
> "Decay" and predated the Chill→Frozen→Shatter chain — fully re-spec'd and reconciled here).
> Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (Stasis · Chill → Frozen → Shatter · Brittle · attack-bar drag/push-back · time-lock ·
> stillness / lattice ward · the "banks" economy) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`).

## Identity (derived + DNA)

- **Class:** Rimewalker · **Attunement × Archetype:** NOX × Dual Swords
- **Primary stat:** STR (← NOX) · **Secondary stat:** AGI (← Dual Swords) — a STR/AGI **crit-duelist
  whose crits Shatter**
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT) · NOX suite: **Chill** (attack-bar drag), **Frozen**
  (can't act), **Brittle** (bonus burst damage taken), **Shatter** (Frozen → burst, esp. STR),
  **time-lock** (freeze a duration so it stops ticking), **stillness / lattice ward** (damage
  reduction — preservation), the **Chill → Frozen → Shatter** phase chain. NOX is **control +
  preservation: win by making them stop, then Shatter.**

**Fantasy.** *(from-brief)* A frost **control/preservation duelist** — a bladesman who wins the
exchange not by out-cutting the foe but by **stilling it, then Shattering it.** Twin blades chain in
patient, crystalline bladework: one blade always kept back as a **frost parry** to turn aside a blow
and answer with cold, while creeping **Stasis** and **Chill** drag the target toward stillness. As
the cold deepens the target **Freezes** solid — and a Rimewalker's crits land on glass: a clean
critical hit on a Frozen, Brittle foe **Shatters** it. Where the NOX dagger (Velestra) is the mobile
twin-strike applicator-executioner who floods Stasis and races the ATB bar, the Rimewalker **stands
and duels** (sturdier, AGI-finesse): finesse and preservation, not flood-application — still the
target, then break it with a crit.

### The shared duelist DNA *(from-brief — how this is a dual-sword)*

1. **Crit (AGI-keyed) is the win condition.** The Rimewalker wins by landing clean, *critical* cuts —
   precision, not volume. And its crits are the Shatter trigger: a crit on a Frozen/Brittle foe
   detonates the cold.
2. **Riposte / Parry — the *frost* parry.** Two blades = offense *and* defense in one; the off-blade
   is kept back to **counter** an incoming blow with cold. The dual-sword's survival tool; the
   counter doesn't just answer the hit, it **Chills** the attacker — preservation through control.
3. **Flow / stance.** Sustained bladework chains that build momentum across the *exchange*, not a
   single burst — patient cuts that compound Stasis and Chill (winding the target down).
4. **Opening → Finisher reuses NOX's own phase chain.** No new combo resource: the Opening **is**
   **Chill → Frozen → Shatter** — cuts and parries deepen Chill until the target Freezes; the
   finisher is a crit that Shatters the frozen glass.

### Lanes *(from-brief)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Rimebleed** | **Stasis-attrition**: stack **Stasis** (DoT) and **Chill**-drag through patient cuts; the grind that winds a target down | **STR**, Stasis stacks/duration, tempo-drag | sustained single-target / boss DPS | vs tanky/boss HP pools; STR- & duration-stacked gear |
| **B · Glasscutter** | **crit + Frozen → Shatter**: clean crits that Shatter a Frozen/Brittle target — the showcase NOX payoff; execute | **AGI**, Crit, Frozen/Brittle setup, Execute | single-target burst / executioner | vs targets you can lock; crit-rich gear; spike a priority kill |
| **C · Hoarwarden** | **frost-control + NOX battery**: Chill/Freeze control, **time-lock**, a **stillness/lattice ward**, and banks the shared NOX pool — the preservation/control enabler | control/tempo, NOX economy, mitigation | disruptor / enabler / battery | NOX-stacked party (feeds the pool) or a fragile party needing control & a ward |

**Build axes:** attrition ↔ crit-burst (A↔B) · self-carry ↔ team-control/battery (B↔C) ·
single-target damage ↔ control/preservation (A,B ↔ C).

**Cross-lane synergy:** **C Chills and Freezes the target → B crits it to Shatter → A grinds whatever
survives with Stasis — while C banks the NOX that fuels all of it.**

---

## Auto-attack *(unlaned)*

- **Frostglide Cut** · phys · enemy · *two flowing crystalline cuts (two crit rolls); the second leaves a wisp of Chill* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Rimecut** · phys · enemy · *a patient cut that applies light Stasis (the Opening of the grind)* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Glasswork Riposte** · phys · enemy · *a crit-leaning strike; sets up the next crit and lightly Chills* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Hairline Cut** · phys · enemy · *a precise strike; bonus crit chance vs Chilled/Frozen foes* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Frostlace** · util · allEnemies · *a thrown cold lace: Chill all foes and drag their attack-bars* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Winterbleed** · phys · enemy · *a cut that extends and deepens the target's existing Stasis* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Hoarfrost Tithe** · buff · self · *the party's next NOX ability costs less; bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Slowblade** · phys · enemy · *two patient cuts, each applying light Stasis and a touch of Chill* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Brittle Opening** · phys · enemy · *a measured strike; if the target is Chilled it becomes Brittle (takes bonus burst)* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Crystal Riposte** · phys · enemy · *a counter-cut; a guaranteed crit if it lands on a Frozen target (a Shatter trigger)* · gen **major NOX** · cd **medium** · `proposed`
- **C · Chillbind** · util · enemy · *deepen Chill on the target and push its attack-bar back* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Coldsink Riposte** · phys · enemy · *a counter-cut scaling with the target's current Stasis stacks; leaves lesser Stasis behind* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Lattice Hold** · util · enemy · *time-lock the target: its current debuffs (Stasis/Chill) stop ticking down (preservation)* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Creeping Verglas** · phys · enemy · *a four-cut flurry; the last cut deepens Stasis and Chill* · gen **moderate NOX** · cd **medium** · `proposed`
- **B · Shiverstep** · phys · enemy · *a dash-strike behind the foe; a guaranteed crit when flanking a Chilled target* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Glassfall** · phys · enemy · *a heavy crit-cut; if the target is Frozen, it Shatters for bonus and leaves lesser Chill* · gen **major NOX** · cd **medium** · `proposed`
- **C · Wintergrasp** · util · enemy · *seize and root the target (Anchored) and drag its attack-bar hard* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Stasis Lace** · mag · enemy · *consume some Stasis for a cold burst; reseeds lesser Stasis on a nearby foe if the target is already afflicted* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Frostward Dance** · buff · self · *a cold guard-stance: a brief stillness ward (damage reduction) while your specials keep flowing* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Permafrost Carve** · phys · enemy · *a heavy patient cut; applies max-duration Stasis* · gen **major NOX** · cd **medium** · `proposed`
- **B · Zero-Kelvin Cut** · phys · enemy · *a crit finisher; massively bonus vs Frozen/Brittle/low-HP foes* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Crystalline Verdict** · phys · enemy · *a deep cut; consumes the target's Stasis for bonus damage* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frost Mirror** · buff · self · *a frost-parry stance: dodge the next hit, then answer with a guaranteed crit and Chill the attacker* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Frostbound Riposte** · phys · enemy · *Freeze a Chilled target, then strike it for a Shatter burst* · cost **med NOX** · cd **medium** · `proposed`
- **C · Frostquiet** · util · allEnemies · *AoE Chill + attack-bar drag; the line goes still* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Hush Frost** · mag · allEnemies · *spread Stasis to every foe* · cost **med NOX** · cd **long** · `proposed`
- **C · Frostbank** · buff · allAllies · *increase party NOX generation for several turns (battery)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Winterglass** · phys · enemy · *a strike scaling with the target's current Stasis stacks* · cost **med NOX** · cd **medium** · `proposed`
- **B · Glass Verdict** · phys · enemy · *an execute; massive vs a Frozen or Brittle target (the Shatter payoff)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Shatterglass** · phys · enemy · *a multi-cut crit flurry on one target; every crit against a Frozen/Brittle foe Shatters for bonus* · cost **high NOX** · cd **medium** · `proposed`
- **C · Stillness Lace** · util · allEnemies · *encase the front line in ice — Freeze one or more foes (can't act); they Shatter for bonus if struck* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Frozen Heart** · mag · enemy · *heavy Stasis; reduces the target's incoming healing* · cost **med NOX** · cd **medium** · `proposed`
- **C · Cold Lattice** · buff · allAllies · *refund a chunk of the party's banked NOX pool (battery)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Glacial Parry** · mag · enemy · *detonate the target's accumulated Stasis for a burst scaling with stacks consumed* · cost **high NOX** · cd **medium** · `proposed`
- **B · Glass Cadence** · phys · enemy · *a chain of crit-cuts; each crit on a Frozen/Brittle foe extends the chain* · cost **high NOX** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Frozen Tempo** · buff · self · *a crit-flow stance: crits grant a chance at an extra action for several turns* · cost **high NOX** · cd **long** · `proposed`
- **C · Frozen Lattice** · util · allEnemies · *a frozen lattice clamps the field: Brittle + attack-bar drag on all foes, and their current debuffs are time-locked* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Final Stillness** · mag · enemy · *apply deep, un-cleansable Stasis* · cost **high NOX** · cd **long** · `proposed`
- **C · Frostquiet Ward** · buff · allAllies · *a stillness ward over the party (damage reduction) + a burst of banked party NOX* · cost **med NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · The Quiet Cold** *(Rimebleed)* · enemy · *bury the target under max-duration Stasis whose ticks are doubled, and drag its attack-bar to a crawl — the grind made absolute* · `proposed`
- **B · Glassfall Verdict** *(Glasscutter)* · enemy · *plunge the target to absolute zero — a guaranteed Freeze + max Brittle, then a single colossal guaranteed-crit Shatter scaling with missing HP* · `proposed`
- **C · The Stilling** *(Hoarwarden)* · all · *the field crystallizes — Freeze and Brittle every foe and time-lock their actions, while a stillness ward and a NOX surge wash over the party (a team-wide Shatter window)* · `proposed`
- **Rimewalker's Cadence** *(neutral/fusion)* · allEnemies · *a flowing frost-blade dance: Chill and Freeze the whole line, then a crit-chain that Shatters across every Frozen foe and leaves deep Stasis behind* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Hoarfrost Cadence** · *your Stasis stacks higher and lasts longer* · `proposed`
- **B · Glasshand** · *after a crit, gain bonus crit chance against Frozen/Brittle foes* · `proposed`
- **C · Cold Tithe** · *your specials generate extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Wintergrind** · *foes afflicted by your Stasis take increased damage from you* · `proposed`
- **B · Killing Glass** · *your crit damage rises against Frozen/Brittle and low-HP foes* · `proposed`
- **C · Frostkeeper** · *your Chill / Freeze / time-lock effects last longer* · `proposed`

**Set @ MNA 90**
- **A · Verglas Veins** · *your max-stack Stasis becomes un-cleansable* · `proposed`
- **B · Shatterglass Edge** · *when one of your crits Shatters a Frozen/Brittle target, refund part of your attack-bar* · `proposed`
- **C · Stillward Discipline** · *while your stillness/lattice ward holds, the party's time-locked durations don't tick down* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance flag on every entry (fantasy/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
