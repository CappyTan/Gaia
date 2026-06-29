# Pulse Arbiter — ANIMA × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed.** Greenfield design spec authored
> by the `build-class` skill against the [Class System Model](./README.md). The **row, lanes, seat,
> and duelist framing are `from-brief`** — the ratified [Dual Swords family note](./dual-swords-family.md)
> (RATIFIED frame, Dara 2026-06-29); the kit **abilities are `proposed`**, pending a content review.
> Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary (Infestation /
> Evolution / Adaptation / Bloom / Metabolize / Regen) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md).
>
> **NOT A HEALER (ratified dev/Dara decision).** ANIMA party-healing is reserved for the **Staff**
> (Genesis Sage, the dedicated healer) and the **Hammer** (Lifekeeper, the one secondary). The Pulse
> Arbiter is an **adaptation/evolution duelist** — its identity is *order-through-change*, not
> healing. Only *light self-sustain* is allowed (the HoT mirror of its own DoT, innate to ANIMA);
> there are **no party heals, no shared Regen, no AoE party HoT** anywhere in this kit.

## Identity (derived + DNA)

- **Class:** Pulse Arbiter · **Attunement × Archetype:** ANIMA × Dual Swords
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** AGI (← Dual Swords) — a VIT/AGI **adaptation
  duelist** (sturdier and steadier than the dagger: the duelist *stands and fights*)
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* DoT that multiplies/stacks and
  spreads on the host's death; engine keyword `poison`) · ANIMA suite of **Evolution**
  (Seed→Bloom→Overgrowth) / **Adaptation** / **Bloom** / **Metabolize** / **Regen**

**Fantasy.** The Pulse Arbiter is a duelist whose **bladework is alive** — a fighting style that
*evolves and adapts mid-fight* the way an organism answers a threat. It is ANIMA's
*order-through-change* expressed as steel: every cut seeds a strain that mutates into a stronger
form, every blow taken teaches the body to resist that harm next time, and the parry is a reflex
that *hardens* the more it is used. Where the SOL duelist wins on raw crit and the NOX duelist
stills its prey, the Arbiter wins by **becoming the wrong opponent to fight** — by the late exchange
it has mutated its venom, grown immune to its enemy's tricks, and answers every blade with a
counter it has already practised. *Distinct from the ANIMA dagger (Symbiote Hunter), which **floods**
the field with contagion: the Arbiter **mutates and adapts** — fewer wounds, each one escalating —
and it is **explicitly not a medic.** Its self-sustain is survival, never a party role.*

**Duelist DNA — themed to ANIMA.** (1) **Crit (AGI-keyed):** the duelist lands clean, precise hits,
and several abilities *grow* their crit as the exchange runs (Evolution). (2) **Riposte / Parry:**
two blades — one answers. The Arbiter's counters are *adaptive* — parrying a damage type **grows
resistance** to it (Adaptation), and a riposte sharpens with reuse. (3) **Flow / stance:** sustained
bladework that escalates; the *Symbiont stance* it slips into changes what it resists and how it
fights. (4) **Opening → Finisher** reuses ANIMA's own phase-transition chain **Seed → Bloom →
Overgrowth** — the Arbiter invents **no new resource**: cheap cuts plant Seeds, mid abilities Bloom
them, finishers spend the Overgrowth. The wound, the venom, the stance, and the counter all *grow
over time*, so the Arbiter is steady early and overwhelming late.

### Lanes *(from-brief — ratified frame)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Adaptblade** | **Evolution + Adaptation** — evolving bladework: strikes mutate and escalate (Seed→Bloom→Overgrowth), crits sharpen with the exchange, and parrying a damage type **grows resistance** to it | **AGI**, Crit, escalation, resistance-growth | front-row crit DPS that hardens as the fight runs | long single-target duels; gear-rich crit build; vs hard-hitting elemental foes |
| **B · Mutagen** | **Infestation + Evolution** — drive the living contagion in through the cuts, then **metamorphose** it into stronger strains; consume the mutated wound for payoffs. Contagion, **not healing** | **VIT**/AGI, Infestation stacks, DoT-duration | sustained-damage attrition / DoT engine | vs tanky or boss HP pools; a fight that rewards a ramp |
| **C · Symbiont Form** | **self-adaptation (VIT)** — shift stance, grow resistances, **light self-sustain only** (the Regen mirror of the DoT). The Arbiter's survival lane — never a party heal | **VIT**, resistance, self-Regen, self-shields | durable self-sustaining bruiser / front-line anchor | no dedicated healer to *replace* — the Arbiter just refuses to die; solo-pressure; long attrition |

**Build axes:** crit-escalation ↔ contagion-attrition (A↔B) · offensive mutation ↔ defensive
self-adaptation (A,B ↔ C) · feed-the-blade ↔ feed-the-strain ↔ feed-the-self (A↔B↔C). **All three
lanes lean on Evolution** — the crit, the venom, and the stance each grow over time. *Self-sustain
(lane C) tops out at keeping the Arbiter alive; it never becomes a party-heal — that is the Staff's
and Hammer's lane by ratified decision.*

---

## Auto-attack *(unlaned)*

- **Pulse Cut** · phys · enemy · *two quick adaptive cuts; each can seed a stack of Infestation* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Carving Strain** · phys · enemy · *a precise double cut; sharpens your next crit (Seed)* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Mutating Wound** · phys · enemy · *strike that drives Infestation into the cut, building the Opening* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Strainmark** · phys · enemy · *cut that extends the duration of the target's existing Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Symbiont Shift** · buff · self · *slip into the Symbiont stance: gain brief self-Regen and steadier footing* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Escalating Edge** · phys · enemy · *a flowing strike whose crit chance grows each time you land it this fight (Evolution)* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Hardening Cut** · buff · self · *after the cut, grow resistance to the last damage type you took (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Adaptive Riposte** · buff · self · *a counter stance: parry the next hit and answer with a crit, growing resistance to what you parried* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Wound Bloom** · mag · enemy · *bloom the target's Infestation a stage — it stacks higher and ticks harder (Bloom)* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Bloodmark Strain** · phys · enemy · *strike an Infested foe; bonus damage scaling with its Infestation stacks* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Resistant Hide** · buff · self · *Metabolize a debuff off yourself to heal a little and grow a lasting resistance* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Crossblade Strain** · phys · enemy · *a twin-blade flurry; each clean hit raises your crit for the rest of the exchange* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Crucible Stance** · buff · self · *harden into a defensive form: damage reduction + self-Regen while it holds* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Phenotype Shift** · buff · self · *Evolve your bladework mid-fight: your strikes change to a stronger form for several turns* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Reseeding Cut** · phys · enemy · *strike; if the target dies soon after, its Infestation spreads to a nearby foe* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Mutant Edge** · phys · enemy · *Evolve the target's Infestation a stage and refresh it (Overgrowth seed)* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Adaptive Carapace** · buff · self · *after taking a damage type, sharply grow resistance to it; heals you a little (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Apex Phenotype** · buff · self · *push your bladework to its apex form: crit and Evolution payoffs peak for several turns* · gen **moderate ANIMA** · cd **long** · `proposed`
- **C · Sap and Adapt** · phys · enemy · *a cut that drinks vitality back to you and grows a resistance from the wound* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Verdant Reflex** · buff · self · *your parries become reflexive: counter and grow resistance several times before it fades* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Apex Strain Verdict** · phys · enemy · *two heavy cuts that apply max-duration, fully-Evolved Infestation* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Living Riposte** · buff · self · *enter an adaptive counter: dodge the next hit, answer with a guaranteed crit, and grow resistance to what you dodged* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Foreign Body** · mag · enemy · *flood the target with Infestation — a strain that keeps multiplying in the wound* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Mutate the Wound** · mag · enemy · *Evolve the target's Infestation a full stage; it now spreads on its death* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Crucible Form** · buff · self · *shift into a survival phenotype: lasting self-Regen + damage reduction, growing as it holds* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Reflexive Mutation** · buff · self · *for several turns, each crit you land sharpens the next and Evolves your strikes a stage* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Adapting Flow** · buff · self · *Adaptation surge: grow resistance to every damage type you've taken so far this fight* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Strain Riposte** · phys · enemy · *a parry-and-cut that Evolves with each use this fight — the more you've riposted, the harder it bites* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Antigen Strike** · phys · enemy · *a strike scaling with the target's current Infestation stacks; refreshes them* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Wound Strain** · mag · enemy · *bloom the target's stacked Infestation into a burst; lesser Infestation reseeds afterward (Overgrowth)* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Settled Verdict** · buff · self · *lock in your grown resistances and self-Regen so they no longer decay for the rest of the fight* · cost **high ANIMA** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Bloomblade** · phys · enemy · *a crit finisher that consumes your accumulated Evolution stacks for escalating burst* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Sovereign Strain** · buff · self · *Metabolize: devour a debuff on yourself to heal and convert it into a growing resistance* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Apex Riposte** · buff · self · *for the duration, every parry lands a guaranteed crit counter and Evolves your blade a stage* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Strain Cascade** · mag · allEnemies · *the target's Infestation leaps to every foe and Evolves a stage — it ticks harder and spreads on each death* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Overgrowth Verdict** · phys · enemy · *a finisher that detonates the target's fully-Evolved Infestation, reseeding it onto the field* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Phenotype Lock** · buff · self · *enter your apex survival form: large self-Regen + heavy damage reduction that grows each turn it holds* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Pulse Verdict** · phys · enemy · *the duelist's apex exchange: a chain of guaranteed crits that Evolves with each connecting blow* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Living Carapace** · buff · self · *become near-unkillable for a few turns: cap incoming damage, deep self-Regen, immune to the types you've adapted to* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · Final Phenotype** *(Adaptblade)* · self · *evolve into your perfect form — for the duration your bladework is at peak Evolution: guaranteed crits, escalating damage, and a resistance grown to every harm you face* · `proposed`
- **B · The Living Plague** *(Mutagen)* · allEnemies · *seed every foe with max-duration, fully-Evolved Infestation; each death spreads and reseeds it — an epidemic that mutates faster than they can cleanse* · `proposed`
- **C · Apex Organism** *(Symbiont Form)* · self · *the symbiont takes over — for the duration you cannot be reduced below 1 HP, regenerate each turn, and grow resistance to everything that strikes you. You simply outlast the duel* · `proposed`
- **Crucible of Change** *(neutral/fusion)* · enemy · *the Arbiter's whole style erupts at once — a chain of evolving crits that detonate the target's bloomed Infestation, while you adapt and self-mend from the exchange* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Coherent Instinct** · *your Evolution-stacked crit chance climbs faster and decays slower* · `proposed`
- **B · Virulent Mutation** · *your Infestation Evolves to its next stage a step sooner* · `proposed`
- **C · Quick to Adapt** · *you grow resistance to a damage type a step faster after taking it* · `proposed`

**Set @ MNA 60**
- **A · Practised Counter** · *each riposte you land sharpens the next a little further (Evolution)* · `proposed`
- **B · Strainbearer** · *foes Infested by you take increased damage from your blades* · `proposed`
- **C · Resilient Phenotype** · *while you have self-Regen, you take reduced damage* · `proposed`

**Set @ MNA 90**
- **A · Perfected Form** · *your bladework can Evolve one stage further than its apex* · `proposed`
- **B · Endless Strain** · *your Infestation always spreads on the host's death, even when reduced* · `proposed`
- **C · Lasting Adaptation** · *your grown resistances and self-Regen no longer decay while you sustain them* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (specials 5–95; sigs 10–90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA | ✓ |
| Provenance: row/lanes/seat/framing `from-brief`; abilities `proposed` (flagged on every entry) | ✓ |
| Ability names globally unique — no internal dupes; no collision with any `docs/design/classes/*.md` (invariant #8) | ✓ |
| **NOT A HEALER:** no party heals, no shared Regen, no AoE party HoT; lane C self-sustain only | ✓ |
