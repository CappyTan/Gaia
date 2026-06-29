# Causality Arbiter — QUANTA × Hammer

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes from the [Hammer family note](./hammer-family.md);
> every ability is `proposed`. Numberless. Mechanics vocabulary (probability swings · gamble↔guarantee ·
> Doom · tempo) draws on the [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified.
> Names use QUANTA's physics/probability register (not casino gambling).

## Identity (derived + DNA)

- **Class:** Causality Arbiter · **Attunement × Archetype:** QUANTA × Hammer
- **Primary stat:** SPD (← QUANTA) · **Secondary stat:** STR (← Hammer)
- **Resource:** QUANTA (party-shared; **gambles** — fluctuates, can be bet)
- **Attunement signature:** **probability swings + Doom** (gamble↔guarantee); Breaker toolkit (stagger · Shatter)

**Fantasy.** The Causality Arbiter's blow is **a verdict already written**. Where the Solar Arbiter
breaks everything *around* the impact, the Causality Arbiter decides the impact's *outcome before it
lands* — a guaranteed crit, a stagger, or a slow **Doom** whose hour is fixed in time. It manipulates
the clock as much as the maul: striking first, rewinding misses, skipping a foe's turn. **Temporal,
single-target, fate-sealed** — the executioner whose sentence cannot be appealed.

**Breaker flavor — the determined verdict.** Impact is a *collapsed certainty*: gamble a swing for a
colossal crit, or collapse it to a guaranteed one; stamp Doom and let time do the breaking.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Verdict** | Determined strikes — gamble a colossal crit, or collapse to a guaranteed crit/stagger | **SPD**/STR, crit, gamble↔guarantee | single-target executioner | bosses; high-value targets |
| **B · Doomsmith** | Stamp **Doom** on impact, then detonate it — inevitability | Doom, delayed determined hits | attrition / win-con | drawn-out fights; tanky foes |
| **C · Tempo** | Manipulate the clock — extra actions on stagger, attack-bar push, rewind, time-skip | SPD, attack-bar, time | tempo controller / enabler | fast enemies; combo teams |

**Build axes:** burst-now (crit) ↔ inevitability (Doom) (A↔B) · damage ↔ tempo-control (A,B↔C).

---

## Auto-attack *(unlaned)*

- **Tick** · phys · enemy · *a metronomic maul blow, steady as a clock* · gen **minor QUANTA** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Called Shot** · phys · enemy · *a strike with a high crit chance* · gen **moderate QUANTA** · cd **short**
- **B · Doomtap** · phys · enemy · *a blow that seeds a light Doom (a delayed, determined hit)* · gen **moderate QUANTA** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Fate Stamp** · phys · enemy · *strike; deepen the target's Doom* · gen **moderate QUANTA** · cd **short**
- **C · Quicken** · buff · self · *speed up your attack-bar (haste)* · gen **moderate QUANTA** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Probable Strike** · phys · enemy · *gamble: a chance at a massive crit, else a normal hit* · gen **moderate QUANTA** · cd **short**
- **C · Tempo Shift** · util · enemy · *push the target's attack-bar back* · gen **moderate QUANTA** · cd **short**

**@ MNA 35** *(A/B)*
- **A · Pinpoint** · phys · enemy · *guaranteed crit if the target is staggered* · gen **moderate QUANTA** · cd **medium**
- **B · Doomstrike** · phys · enemy · *heavy blow; if the target has Doom, advance it toward resolution* · gen **moderate QUANTA** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Doomspread** · util · allEnemies · *seed a light Doom on all foes* · gen **moderate QUANTA** · cd **medium**
- **C · Haste Field** · buff · allAllies · *briefly speed the party's attack-bars* · gen **moderate QUANTA** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Critical Mass** · phys · enemy · *a strike whose crit chance scales with your QUANTA pool* · gen **major QUANTA** · cd **medium**
- **C · Rewind** · util · self · *undo your last action and act again* · gen **moderate QUANTA** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Variance Strike** · phys · enemy · *gamble: huge crit potential on a wide damage spread* · gen **moderate QUANTA** · cd **medium**
- **B · Doom Hammer** · phys · enemy · *a strike that converts the target's Doom timer into immediate damage* · gen **moderate QUANTA** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Foredoom** · util · enemy · *a heavier Doom; undodgeable* · gen **major QUANTA** · cd **medium**
- **C · Pre-empt** · util · self · *act before the enemy (jump the turn order)* · gen **moderate QUANTA** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Sure Thing** · phys · enemy · *collapse the outcome: a guaranteed crit* · gen **major QUANTA** · cd **medium**
- **C · Time Skip** · util · enemy · *skip a foe's next turn* · gen **moderate QUANTA** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Probability Peak** · phys · enemy · *a strike that crits and staggers when the odds favor you (high QUANTA)* · gen **major QUANTA** · cd **medium**
- **B · Doomfall** · util · allEnemies · *advance all Doom timers; foes near resolution take a burst* · gen **major QUANTA** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Verdict** · phys · enemy · *a determined strike: guaranteed crit + stagger* · cost **med QUANTA** · cd **medium**
- **B · Death Sentence** · util · enemy · *stamp a heavy Doom that resolves in a few turns* · cost **med QUANTA** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Condemn** · util · allEnemies · *Doom multiple foes* · cost **med QUANTA** · cd **long**
- **C · Accelerando** · buff · allAllies · *party haste for several turns* · cost **med QUANTA** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Gambit** · phys · enemy · *bet QUANTA: a colossal crit on success, a whiff on failure (high variance)* · cost **med QUANTA** · cd **medium**
- **C · Freeze Frame** · util · enemy · *stop a foe in time — it loses its next turn (pure time, no Chill)* · cost **med QUANTA** · cd **medium**

**@ MNA 40** *(A/B)*
- **A · Certainty** · phys · enemy · *collapse to certainty: a guaranteed maximum-roll crit* · cost **med QUANTA** · cd **medium**
- **B · Reckoning Hour** · phys · enemy · *instantly resolve the target's Doom for a massive hit* · cost **med QUANTA** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Mass Condemnation** · util · allEnemies · *heavy Doom on the entire enemy team* · cost **high QUANTA** · cd **long**
- **C · Decelerate** · util · allEnemies · *time crawls for all foes — attack-bars drag sharply* · cost **high QUANTA** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Executioner's Verdict** · phys · enemy · *a guaranteed critical execute vs low-HP foes* · cost **high QUANTA** · cd **long**
- **C · Tempo Surge** · buff · self · *gain an immediate extra action* · cost **high QUANTA** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Probability Cascade** · phys · enemy · *a chain of strikes, each with rising crit chance* · cost **high QUANTA** · cd **medium**
- **B · Doomsday** · util · allEnemies · *all foes' Doom timers leap toward resolution* · cost **high QUANTA** · cd **long**

**@ MNA 80** *(B/C)*
- **B · The Reaper's Tally** · util · allEnemies · *a Doomed foe that dies refunds QUANTA and advances others' Doom* · cost **high QUANTA** · cd **long**
- **C · Time Loop** · util · self · *replay your last few actions instantly (act multiple times)* · cost **high QUANTA** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Final Verdict** · phys · enemy · *the sentence is absolute: a guaranteed crit that cannot be reduced, dodged, or mitigated* · cost **high QUANTA** · cd **long**
- **C · Causal Lock** · util · allEnemies · *fix the timeline — all foes lose their next turn* · cost **high QUANTA** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high QUANTA**, cd **long**)*

- **A · The Sentence** *(Verdict)* · enemy · *pass final judgment — a guaranteed, unmitigable maximum crit that staggers everything nearby*
- **B · Inevitable Hour** *(Doomsmith)* · allEnemies · *Doom every foe and resolve it all at once — the determined end arrives*
- **C · Out of Time** *(Tempo)* · allEnemies · *stop the clock for the enemy — all foes skip their turns while you act freely*
- **Grandfather Paradox** *(neutral/fusion)* · allEnemies · *a time paradox: strike all foes with a determined crit and erase their next actions (Doom + turn-skip)*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Critical Eye** · *your crit chance is higher*
- **B · Fatebrand** · *your Doom resolves for more damage*
- **C · Fastforward** · *your haste effects are stronger*

**Set @ MNA 60**
- **A · Pressure Point** · *your crits also stagger*
- **B · Hastened Doom** · *your Doom timers resolve faster*
- **C · Momentum** · *staggering a foe grants you attack-bar*

**Set @ MNA 90**
- **A · Sure Hand** · *a portion of your strikes always crit, regardless*
- **B · Predetermined** · *foes you Doom cannot cleanse or delay it*
- **C · Overclock** · *you have a chance at an extra action whenever you act*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary SPD ← QUANTA · secondary STR ← Hammer · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all QUANTA | ✓ |
| Provenance flag on every entry (all `proposed`) | ✓ |
| Ability names globally unique (invariant #8) | ✓ |
