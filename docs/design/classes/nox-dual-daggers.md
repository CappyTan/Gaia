# Velestra — NOX × Dual Daggers

> **Status: DRAFT PROPOSAL — dev-approved (re-cut for NOX distinctness), pending Dara.** Greenfield
> design spec authored by the `build-class` skill against the [Class System Model](./README.md). The
> seat (glass STR+SPD **tempo-executioner**), the three lanes, and the dagger DNA are **`from-brief`**
> — the re-cut row in the [Dual Daggers family note](./dual-daggers-family.md) plus the dev's
> distinctness re-cut; the individual abilities are `proposed`. Numberless by design; magnitudes are a
> later balance pass.
>
> **Supersedes the prior Velestra** (lanes re-cut so the NOX daggers and NOX swords don't overlap).
> The earlier draft seated Velestra as a "lockdown executioner" whose lane C carried a stillness ward
> and whose payoff read as crit-adjacent — that collided with the concurrent Rimewalker re-spec
> (NOX × Dual Swords → crit-shatter + frost-parry/ward + NOX battery). This version sharpens Velestra
> into NOX's **action-economy / tempo** seat: flood Stasis fast, deny the enemy's turns, then execute.
> She has **no ward, no battery, no parry**, and her Shatter payoff is a **fast STR execute**, not a crit.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Shatter · Brittle · attack-bar drag/push-back ·
> time-skip / time-lock · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`). If that framework shifts, reconcile this kit toward it.

## Identity (derived + DNA)

- **Class:** Velestra · **Attunement × Archetype:** NOX × Dual Daggers *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** SPD (← Dual Daggers) — a STR/SPD **tempo-executioner**
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT — cold cessation) · NOX suite she wields: **Chill** (attack-bar
  drag), **Frozen** (can't act), **Brittle** (bonus burst taken), **Shatter** (Frozen/Brittle → burst, esp.
  STR), attack-bar **push-back**, **time-skip** (steal/skip an enemy turn). NOX is **tempo-control: win by
  making them stop.** Velestra owns its *action-economy* facet — and finishes with a fast execute.

**Fantasy.** *(`from-brief`)* Velestra is the **glass tempo-executioner** — the fastest knife in the
NOX line and the one that never lets the enemy answer. She out-races the ATB bar like every dagger, but
she spends those extra turns not on defense and not on a clean crit — she spends them **stealing the
enemy's**. Twin cuts flood creeping **Stasis** and **Chill** faster than anyone can apply them; she drags
the attack-bar, freezes a thing mid-step, and **skips its turn outright** — and a foe that never acts
never hurts you. That is her whole answer to 40 HP on the front row: not a ward, not a parry — *they
don't get to swing.* And once they're stilled, brittle, or bleeding out, she steps in with a single fast,
heavy STR cut that **executes** the helpless target before the bar can refill. Flood, deny, execute. She
has no shield and no second blade kept back to block; if she's standing still she's losing. Fast,
relentless, merciless — she runs the clock to zero and ends you on your own stolen turn.

### The shared rogue DNA *(`from-brief` — how this is a dual-dagger)*

1. **Twin-strike (double application).** The auto and many specials hit *twice* → two Stasis/Chill
   applications. Velestra is the game's **fastest applicator** of NOX's signature — volume, not a slow grind.
2. **Opening → Finisher reuses NOX's own chain.** No new combo resource: the Opening **is**
   **Chill → Frozen → Shatter**. Fast cheap cuts deepen the chain; the finisher is a **fast STR execute**
   that exploits a Frozen / Brittle / low-HP target — a *turn-economy kill*, not a crit detonation.
3. **Tempo lean — her whole identity.** Chill-drag, attack-bar push-back, **time-skip** and Freeze-to-deny.
   Where every other dagger *dips* the action-economy layer, Velestra *lives* in it: she wins by owning the
   clock.
4. **Fragility answer = lock them out of acting.** No ward, no parry. Survival is **denial** — a Frozen,
   skipped, or attack-bar-dragged enemy can't land the hit that would kill a 40-HP knife.

### Lanes *(`from-brief`)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Hoarfang** | **Stasis-flood applicator** — the fastest stacker: rapid twin-strikes pile **Stasis** + **Chill** by *volume* (her SPD advantage), not a slow grind; the DoT engine that softens everything | **SPD/STR**, Stasis stacks, applications-per-turn | sustained single-target / DoT-floor DPS | vs tanky/boss HP pools; SPD- & Stasis-stacked gear |
| **B · Stillblade** | **tempo lockdown / attack-bar denial** — Chill-drag, attack-bar push-back, **time-skip**, Freeze-to-deny; lock the enemy out of *acting* (offense-via-denial, **no ward**). The action-economy lane, distinctly hers | **SPD**, attack-bar control, time-skip | disruptor / turn-denier / enabler | vs dangerous fast attackers & casters you must stop from acting |
| **C · Shatterpoint** | **fast STR execute** — exploit a **Frozen / Brittle / low-HP** target for a quick heavy kill before the bar refills; the executioner finish (execute, **not** crit) | **STR**, execute thresholds, Frozen/Brittle setup | single-target burst / priority kill | vs a target you can lock or that's already low; STR-stacked gear |

**Build axes:** flood-attrition ↔ execute-burst (A↔C) · self-kill ↔ team-denial (C↔B) ·
DoT/damage ↔ tempo-lockdown (A,C ↔ B).

**Cross-lane synergy:** **A floods Stasis & Chill → B drags/skips the enemy's turns so it never answers
→ C executes the stilled, brittle, or low-HP target on a turn that should have been *theirs*.**

---

## Auto-attack *(unlaned)*

- **Quickfrost** · phys · enemy · *two darting crystalline cuts (twin-strike); the second lays a touch of Stasis* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Flickerfrost** · phys · enemy · *two fast cuts (twin-strike), each laying light Stasis — the flood begins* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Stutter Cut** · util · enemy · *a quick cold flick that Chills and drags the target's attack-bar back* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Skipping Cut** · util · enemy · *a darting strike that pushes the target's attack-bar back hard — delay its next turn* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Stillfang** · phys · enemy · *a fast heavy cut; bonus damage vs a Chilled or Frozen target* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Frostflood** · phys · enemy · *two cuts that extend and deepen the target's existing Stasis (pile the stacks)* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Skipfang** · phys · enemy · *a quick finisher; bonus damage vs low-HP foes, and refunds your attack-bar on a kill* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Frostflood Flurry** · phys · enemy · *a rapid four-cut flurry (twin twin-strike), spraying light Stasis + Chill across the hits* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Take the Tempo** · util · enemy · *steal initiative: drag the target's bar back and advance your own* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Whiteout Flurry** · util · allEnemies · *a thrown cold lace: Chill all foes and drag their attack-bars* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Stillfang Flurry** · phys · enemy · *a fast multi-cut on one target; bonus vs Frozen/Brittle and leaves the target Brittle* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Hoarflood Carve** · phys · enemy · *two cuts; consumes some Stasis for bonus damage, leaving lesser Stasis behind to keep ticking* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Quickfrost Carve** · phys · enemy · *a fast precise stab scaling with the target's current Stasis stacks* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Creeping Hoarflood** · phys · enemy · *a flurry; if the target is already afflicted, sprays light Stasis onto a second nearby foe* · gen **moderate NOX** · cd **medium** · `proposed`
- **B · Glaciate the Bar** · util · enemy · *Freeze the target if it is already Chilled (it cannot act)* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Skipstrike** · phys · enemy · *a dash-strike that hits and **time-skips** the target's next turn outright (a stolen action)* · gen **major NOX** · cd **medium** · `proposed`
- **C · Cull the Frozen** · phys · enemy · *a fast heavy cut that detonates a Frozen/Brittle target for an execute burst, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Frostflood Reach** · phys · allEnemies · *a wide spray of cuts; lay light Stasis on the whole line* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Killing Skip** · phys · enemy · *a quick execute; bonus vs low-HP foes and pushes the target's bar back so it can't answer* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Frostflood Carve** · phys · enemy · *heavy twin cut; applies max-duration, deep-stack Stasis* · gen **major NOX** · cd **medium** · `proposed`
- **B · Headlong Frost** · util · enemy · *Freeze the target and push its attack-bar to zero (it acts last, if at all)* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Floodfang** · phys · enemy · *a deep twin cut that applies heavy Stasis and Chill at once — front-load the flood* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frostbite Tempo** · util · enemy · *drag the target's attack-bar hard and skip its next small action* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Lock the Hour** · util · enemy · *Freeze a Chilled target and **time-skip** its next turn (it loses the action entirely)* · cost **med NOX** · cd **medium** · `proposed`
- **C · Coup de Stasis** · phys · enemy · *a precise execute; consumes the target's Stasis stacks for bonus damage scaling with what was consumed* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Frostflood Sentence** · mag · allEnemies · *spread Stasis to every foe — the flood goes wide* · cost **med NOX** · cd **long** · `proposed`
- **C · Stillfang Verdict** · phys · enemy · *a fast heavy execute; massive vs a Frozen or Brittle target (the Shatter payoff, by speed not crit)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Hoarflood Surge** · phys · enemy · *a fast strike scaling with the target's current Stasis stacks* · cost **med NOX** · cd **medium** · `proposed`
- **B · Steal the Hour** · util · enemy · *push the target's attack-bar to zero and **time-skip** its next turn; you act again immediately* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Deny the Turn** · util · allEnemies · *drag every foe's attack-bar back hard and skip the next action of any that were Chilled* · cost **high NOX** · cd **medium** · `proposed`
- **C · Hoarflood Verdict** · phys · enemy · *a fast multi-cut on one target; every cut against a Frozen/Brittle foe lands an execute hit for bonus* · cost **high NOX** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Frostflood Onset** · mag · enemy · *heavy Stasis that reduces the target's incoming healing while it ticks* · cost **med NOX** · cd **medium** · `proposed`
- **C · Quickfrost Verdict** · phys · enemy · *a fast execute scaling with the target's missing HP* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Frostflood Cascade** · mag · enemy · *detonate the target's accumulated Stasis for a burst scaling with stacks consumed; reseeds lesser Stasis* · cost **high NOX** · cd **medium** · `proposed`
- **B · Stopped Clock** · util · enemy · *Freeze the target and **time-lock** it: it cannot act and its bar will not fill for several turns* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Drag to Zero** · util · allEnemies · *drag every foe's attack-bar to a crawl and Chill the line — the field's tempo collapses* · cost **high NOX** · cd **long** · `proposed`
- **C · Frostflood Edict** · phys · enemy · *Freeze the target, skip its turn, then a colossal fast execute on the stilled foe (the showcase: deny then kill)* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Frostflood** · mag · allEnemies · *apply deep, un-cleansable Stasis to every foe — the flood made permanent* · cost **high NOX** · cd **long** · `proposed`
- **C · Endrush** · phys · enemy · *a flurry of fast cuts that each become an execute hit against a low-HP / Frozen / Brittle target; the bar never gets to refill* · cost **high NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · The Stilled Hour** *(Hoarfang)* · allEnemies · *bury the line under max-duration Stasis that ticks twice as fast, and drag every attack-bar to a crawl — the flood made absolute* · `proposed`
- **B · Tempo Larceny** *(Stillblade)* · allEnemies · *seize the clock: zero every foe's attack-bar and **time-skip** the whole enemy team's next turn — they simply don't get to act* · `proposed`
- **C · The Last Hour** *(Shatterpoint)* · enemy · *plunge the target to absolute zero — guaranteed Freeze + max Brittle, then a single colossal fast execute scaling with its missing HP* · `proposed`
- **Velestra's Theft** *(neutral/fusion)* · allEnemies · *run the clock out — deep Stasis + Freeze on every foe, their next turn stolen, and any already low or brittle executed where they stand* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Frostflood Cadence** · *your Stasis stacks higher and your twin-strikes apply an extra application* · `proposed`
- **B · Tempo Thief** · *your attack-bar drags and push-backs are stronger and last longer* · `proposed`
- **C · Headsman's Skip** · *your execute damage rises against Frozen / Brittle / low-HP foes* · `proposed`

**Set @ MNA 60**
- **A · Frostflood Tempo** · *foes afflicted by your Stasis take increased damage from you* · `proposed`
- **B · Bar-Break** · *whenever you Chill or Freeze a foe, also push its attack-bar back a little* · `proposed`
- **C · Skip the Hour** · *when you kill or execute a foe, refund part of your attack-bar (chain the kills)* · `proposed`

**Set @ MNA 90**
- **A · Frostflood Lattice** · *your max-stack Stasis becomes un-cleansable* · `proposed`
- **B · Velestra's Tempo** · *your time-skips can catch a foe that was only Chilled, not yet Frozen* · `proposed`
- **C · Drag the Hour** · *your fast executes ignore part of the target's defense and push its bar back on a non-kill* · `proposed`

---

## Distinctness note *(invariants #9 / #10)*

**vs Rimewalker (NOX × Dual Swords — the closest cousin, concurrent re-spec = crit-shatter +
frost-parry/ward + NOX-battery, durable):** Velestra shares with the Rimewalker **only the NOX
signature itself** — Stasis and the Chill → Frozen → Shatter chain. Everything else is opposite.
Velestra has **no ward, no battery, no parry/riposte**, and her Shatter payoff is a **fast STR execute**
(exploiting Frozen/Brittle/low-HP — a turn-economy kill) **not a crit detonation**; the Rimewalker's is
crit-keyed off AGI. Velestra's unique half of NOX is the **action-economy / tempo facet** (flood-apply,
attack-bar drag/push-back, **time-skip**, Freeze-to-deny) plus the **execute** — a glass knife that wins
by stealing the enemy's turns, where the Rimewalker is the durable duelist that parries, banks NOX, and
crits glass.

**vs the other NOX classes (#9 within scope of the family + #10 attunement budget):** distinct from the
**Equilibrium Ascendant** (Hammer — planted control-*crusher* with heavy slams and a lattice-ward
bulwark; Velestra is fast, fragile, ward-less and never plants), the **Penumbral Bastion** (S&S — shadow
*wall* / mitigation-tank; Velestra mitigates *nothing*, she denies the turn), and the **Null Absolutionist**
(Staff — anti-caster energy-removal/Seal; Velestra removes *turns*, not energy or abilities). The NOX
**tempo-control** suite is broad and not saturated by any one class on the *action-economy / time-skip*
expression at SPD — that is Velestra's seat. She does **not** touch the NOX battery/banks-economy lane
(Rimewalker, Equilibrium Warden) or any defensive ward, honoring the re-cut.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5–95 / 10–90) | ✓ |
| No lane appears in every milestone (specials A7 / B7 / C6 of 10; signatures A6 / B6 / C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary SPD ← Dual Daggers · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique — no internal dupes; no collision with any `docs/design/classes/*.md` (grepped) | ✓ |
| #9 same-archetype distinctness (distinct seat vs the four other daggers; spelled out vs Rimewalker) | ✓ |
| #10 same-attunement budget (owns NOX's action-economy/time-skip + execute; no ward, no battery) | ✓ |
