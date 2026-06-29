# The Lagrangian — UMBRAXIS × Dual Daggers

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). Lanes, seat, and fragility
> answer are **`from-brief`** — locked in the [Dual Daggers family note](./dual-daggers-family.md)
> (dev-approved); the kit abilities are `proposed`. Numberless by design; magnitudes are a later
> balance pass. Mechanics vocabulary (Drain / Crush / Anchored / event-horizon / time-dilation /
> Mass armor / Singularity) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28).
>
> **Lore resonance (flag for Dara).** This class shares its canon name with Dara's Legendary Figure
> **"The Last Lagrangian"** ([legendary-figures](../legendary-figures.md)) — the apex exemplar of
> exactly this class. The spec keeps the resonance respectful but designs the **playable class**, not
> the legend: the Last Lagrangian's *Twin-Singularities* / *Libration Point Execution* are his
> mythic-scale expression; this is the ordinary-scale drain-duelist that walks the same path. The
> name tie is intentional per the family note's open flag — bless or rename at Dara's call.

## Identity (derived + DNA)

- **Class:** The Lagrangian · **Attunement × Archetype:** UMBRAXIS × Dual Daggers
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** SPD (← Dual Daggers) — a **DEF+SPD** durable, fast duelist
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/steals, never made from nothing)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred to the caster) · Crush · Anchored

**Fantasy.** *(from family note)* Gravity given a blade. The Lagrangian is the **tanky dagger** — a
fast duelist who dances the orbital nodes between bodies, draining life with every cut so its loss
becomes your gain, pinning the target where it stands, and ramping gravity pressure to a collapse.
Where the Graviton Warden *slams* clusters and the Tidal Sovereign *walls* the tide, the Lagrangian
is the **single-target drain-duelist**: it does not flee the front row, it survives there — eating
hits on **Mass armor**, refilling on **Drain**, and stilling its quarry inside a gravity well until
the orbit decays into a killing collapse. Speed buys the privilege to strike, drain, and not die.

**Fragility answer — Mass armor + Drain.** *(from family note.)* 40 HP / ~1 armor on the front line
is the dagger's knife-edge; the Lagrangian holds it not by dodging but by **DEF → damage reduction
(Mass armor)** and by **converting the fight's force into its own sustain (Drain)** — the
conservation economy made personal. The durable dagger.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Siphon** | Drain-skirmish — lifesteal / **Drain** on every cut (conservation); siphon to sustain and to fuel finishers | **DEF**, Drain, lifesteal, attrition | self-sustain front-line duelist | long attrition fights; little outside healing |
| **B · Lagrange Point** | Gravity-control — **Anchor** / pin the target (**event-horizon**: can't flee or swap rows), pull, **time-dilate** near the blade; reposition self | SPD, control, DEF, deny-escape | lockdown / position control | fleeing or back-line foes; protecting a kill |
| **C · Singularity** | Ramping **Crush** finisher — build gravity pressure (Crush escalates the longer it's held), then **collapse** it for a massive single-target burst on a pinned foe | DEF, crush-ramp, single-target burst | single-target nuke / executioner | bosses; a pinned, ripening target |

**Build axes:** sustain ↔ burst (A↔C) · drain-skirmish ↔ lockdown-control (A↔B) · deny-escape ↔
collapse-payoff (B↔C). The DNA chain runs **B opens (pin + Crush pressure) → C collapses
(Singularity)**; **A keeps you alive long enough to land it** — no new combo-point resource, the
"Opening" *is* UMBRAXIS's own escalating **Crush**.

---

## Auto-attack *(unlaned)*

- **Twinned Cut** · phys · enemy · *two quick gravity-edged cuts — twin-strike, two Drain checks* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Vein-Tap** · phys · enemy · *a cut that Drains a sliver of HP to you* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Tether** · util · enemy · *a gravity line pulls a foe toward you and Anchors it (rooted)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Bind the Orbit** · util · enemy · *the target is caught at your Lagrange point — event-horizon: it cannot flee or swap rows* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Closing Orbit** · phys · enemy · *a cut that seeds Crush — gravity pressure that ramps the longer it's held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Drink Deep** · phys · enemy · *twin-strike; each hit Drains HP, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Inward Spiral** · phys · enemy · *a cut that deepens existing Crush, tightening the ramp* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Hollow the Vein** · mag · enemy · *a draining stab: Drain HP and a share of the foe's energy to you* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Frame Drag** · util · enemy · *time-dilate near your blade: the foe's attack-bar fills slower while Anchored* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Restless Frame** · util · self · *blink along the gravity gradient: reposition out of harm, keeping your Anchor on the target* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Compaction** · phys · enemy · *a heavy cut on a Crushed foe; damage scales with held gravity pressure* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Bloodwell** · mag · enemy · *open a draining wound: Drain ramps each turn the foe stays in reach* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Periapsis** · phys · enemy · *strike at closest approach — a Crush-builder that hits harder vs Anchored foes* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Two Wounds** · phys · enemy · *twin-strike; both cuts Drain, banking a surge of UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Saddle Point** · util · enemy · *pin the foe at an unstable equilibrium: deepen Anchor + event-horizon, no escape* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Captured** · util · enemy · *the target falls into a stable orbit around you: lasting Anchor; it cannot reposition* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Decaying Orbit** · phys · enemy · *a ramping crush on a pinned foe — pressure tightens turn over turn* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Reaped Mass** · mag · enemy · *heavy Drain: steal HP and a share of the foe's attack power to yourself* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Peak Pressure** · phys · enemy · *force the Crush to its threshold; bonus damage as pressure peaks* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Bled White** · mag · enemy · *a deep Drain finisher; restores you for more the lower the foe's HP* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Orbital Lock** · util · enemy · *absolute pin: long Anchor + event-horizon; the foe is fixed at your node* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Exsanguine Edge** · mag · enemy · *a draining strike that steals a large chunk of the target's HP to you* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Gravesnare** · util · enemy · *snare the foe in a gravity grave: Anchor + event-horizon for several turns* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Libration** · util · self · *ride the gravity node: dodge out of the next blow and re-pin your target from the new angle* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Collapse Cut** · phys · enemy · *collapse the held Crush in one cut: burst scaling with gravity pressure built* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Drain Cascade** · mag · enemy · *twin-strike; each Drain feeds the next, escalating the steal and your sustain* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Roche Limit** · phys · enemy · *the foe passes the point of no return — a crush that shears apart a Crushed / Anchored target* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sanguine Orbit** · mag · self · *for a few turns, every cut Drains and a share of all your damage returns as healing* · cost **med UMBRAXIS** · cd **long** · `proposed`
- **B · Heavy Tether** · util · enemy · *immense pull + crush: drag the foe to you, Anchor it, and grind ramping pressure* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Captor's Hold** · util · enemy · *deep, uncleansable Anchor: the foe cannot move, flee, swap rows, or be freed* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Stationary Point** · phys · enemy · *hold the foe at the still point and collapse all held Crush at once: a heavy single-target burst* · cost **high UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Bound and Bled** · mag · enemy · *catastrophic Drain on a single foe, healing you greatly and banking UMBRAXIS* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Pull the Thread** · phys · enemy · *unravel a pinned foe — a crush whose damage scales with stacked Crush and lost HP* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Drained Dry** · mag · enemy · *a finishing Drain; massive vs low-HP foes, refunding a large UMBRAXIS surge* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **B · Gravity Debt** · util · enemy · *time-dilate the target to a crawl: its tempo is dragged far back while Anchored* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Worldcage** · util · enemy · *fold space around the foe: it cannot act on the party — fully Anchored and walled off for a turn* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Singularity Edge** · phys · enemy · *gather the whole well into the blade and run it through: an enormous collapse on a pinned, Crushed foe* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Long Fall** · mag · enemy · *bleed the foe across many turns — deep, uncleansable Drain that feeds you every tick* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Erasure Point** · phys · enemy · *collapse a fully-ripened Crush into a near-lethal single strike on the Anchored target* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · Eternal Siphon** *(Siphon)* · enemy · *open a wound that will not close — drain the target relentlessly across the fight, healing you and refilling the party's UMBRAXIS with every pulse* · `proposed`
- **B · Lagrange Prison** *(Lagrange Point)* · enemy · *fix the foe at a perfect equilibrium point — total, unbreakable Anchor and event-horizon; it cannot move, flee, or act away from you* · `proposed`
- **C · Orbital Collapse** *(Singularity)* · enemy · *let the orbit fall — collapse all held gravity into one annihilating strike, scaling with every Crush stack built* · `proposed`
- **The Only Constant** *(neutral/fusion)* · enemy · *pin, drain, and collapse as one — Anchor the foe, bleed it dry to fuel the blow, then crush the well shut around it* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Sanguine Edge** · *your cuts Drain more HP to you* · `proposed`
- **B · Strong Node** · *your Anchors and event-horizons last longer* · `proposed`
- **C · Mounting Pressure** · *your Crush ramps faster while a foe is held* · `proposed`

**Set @ MNA 60**
- **A · Conservation Law** · *a share of all damage you take is returned to you as healing (you survive on what you swallow)* · `proposed`
- **B · Inescapable Orbit** · *foes you've Anchored cannot cleanse it or flee* · `proposed`
- **C · Compaction Master** · *your collapse damage scales harder with stacked Crush* · `proposed`

**Set @ MNA 90**
- **A · Bottomless Thirst** · *your Drains restore more, and a portion overflows into the party's UMBRAXIS* · `proposed`
- **B · Frame Lock** · *while a foe is Anchored, your time-dilation also drags its attack-bar* · `proposed`
- **C · Point of Collapse** · *your finishers can shear very low-HP Anchored foes apart (execute)* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary SPD ← Dual Daggers · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS | ✓ |
| Every entry carries a provenance flag (lanes/seat/fragility `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
