# Worldender — NOX × Two-Handed Sword

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The seat (doubled-STR **line-cleaver**
> — the *arc*, not the *point*), the three lanes, and the Reaver DNA are **`from-brief`** — the locked
> NOX row of the [Two-Handed Sword family note](./two-handed-sword-family.md); the kit's individual
> abilities are `proposed`. Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Brittle → Shatter · time-lock · stillness /
> lattice ward · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`). If that framework shifts, reconcile this kit toward it.
>
> ⚠️ **This is the hardest distinctness in the game.** Worldender and the NOX **Hammer
> (Equilibrium Ascendant)** share the *same* STR+STR stat line **and** the freeze→shatter signature.
> The split is airtight by design: **Equilibrium Ascendant breaks a *foe* (the point — single-target
> lockdown / control-crush); Worldender breaks the *line* (the arc — AoE line-freeze + a cataclysmic
> sweeping shatter, raw power, no single-target tempo-lockdown or control finesse).** See the dedicated
> Distinctness section.

## Identity (derived + DNA)

- **Class:** Worldender · **Attunement × Archetype:** NOX × Two-Handed Sword *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** STR (← Two-Handed Sword) — the **doubled-STR
  flagship** of the Reaver family: a hyper-focused front-row STR bruiser
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT — cold cessation) · NOX suite he wields across the **whole
  enemy line**: **Chill** (slows the line), **Frozen** (can't act), **Brittle** (bonus burst taken),
  **Shatter** (Frozen/Brittle → STR burst), **time-lock** (freeze a debuff's duration so the freeze
  *holds* across a slow wind-up), **stillness / lattice ward** (a little self-mitigation, never a
  ward-tank's wall). The **banks** economy. Worldender owns NOX's **line-scale cleave** facet —
  freeze the arc, shatter the arc.

**Fantasy.** *(`from-brief`)* The Worldender swings a greatsword the size of a door, and the swing is
the whole point: a single wide arc that lands on **every foe in the line at once**. He is the
doubled-STR flagship of the Reaver — pure, overwhelming, planted power, with none of the finesse of a
duelist or the surgical lockdown of the maul. SOL spreads heat outward; the Worldender drags an entire
battlefield toward absolute zero in one sweep. His arcs **rime the whole line Chill**, his reach holds
the back row at bay and **Brittles the field**, and then — slow, telegraphed, inevitable — he winds the
blade back over his head and brings it down through the **entire frozen arc**, **Shattering every
crystallized foe at once** in one cataclysmic release. Where the **Equilibrium Ascendant** plants and
*crushes one enemy into stillness* — locking a single dangerous foe out of the fight, controlling tempo
to the tick — the Worldender does not lock anyone down or play the clock; he simply **freezes the line
and breaks it.** He has no single-target tempo-control, no attack-bar denial, no parry, no ward-wall. He
is the arc; the Ascendant is the point.

### The shared Reaver DNA *(`from-brief` — how this is a two-handed sword)*

1. **Cleave — the arc is melee AoE.** The auto and most specials land across **multiple foes / the
   whole enemy line**, not one target. The Worldender is the front-line *line-clearer*; his Stasis and
   Chill go on the **arc**, never funneled into one foe.
2. **Reach / zone-control.** The long blade zones space — it threatens and Chill-drags the **back row**,
   holds the line at bay, and **Brittles the field** so the whole arc is primed to break. He controls
   *space*, never *tempo* (no attack-bar denial — that is the dagger's, applied to one foe at a time).
3. **Momentum — heavy wind-up → cataclysmic release.** Slow by nature (`spd 7`); the payoff is a
   telegraphed overhead the swing *charges* into. **time-lock** is used only to hold the line's freeze
   open *across* that slow wind-up, so the cold doesn't thaw before the cleave lands — not to deny a
   turn.
4. **Opening → Finisher reuses NOX's own phase chain — across the LINE.** No new combo resource: the
   Opening **is** **Chill → Frozen → Brittle**, applied to the *whole line*; the finisher is the
   **Shatter of the entire frozen arc** in one swing. Where every other NOX class runs the chain on a
   *target*, the Worldender runs it on the *line*.

### Lanes *(`from-brief` — the locked frame's three)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Wintercleave** *(lead)* | **The line-freeze cleave** — wide arcs that rake **Stasis / Chill** across the *whole enemy line*, crystallizing the arc toward Frozen. Melee AoE, the line-clearer | **STR**, AoE, Chill/Stasis on the line | front-line AoE softener / line-clearer | vs packs & wide enemy lines; STR-stacked gear; a party that punishes Frozen foes |
| **B · Glacier's Reach** | **Reach / zone-control** — Chill-**drag** and **Brittle** the whole field, threaten the back row, and hold the line at bay so the wind-up lands safely. The Reaver's *space* control (never tempo) | **STR**, reach, field Brittle/Chill-drag | field-control / kite-and-hold | vs back-row casters & fast packs you must hold off; protecting a slow wind-up |
| **C · Worldbreak** | **Momentum + AoE Shatter** — wind the blade overhead and bring it down through the **entire frozen arc**, Shattering every crystallized foe at once. The cataclysmic payoff | **STR**, Frozen/Brittle setup, momentum/wind-up | the AoE burst finisher | the line is frozen/brittle and you want one colossal sweep; STR- & burst-stacked gear |

**Build axes:** line-cleave-attrition ↔ wind-up-burst (A↔C) · field-control/reach ↔ burst-payoff
(B↔C) · own-damage AoE ↔ reach/zone-control (A,C ↔ B).

**Cross-lane synergy:** **A rimes the whole line Chill → B drags it back, Brittles the field, and
time-locks the freeze so it holds across the slow charge → C winds up and Shatters the entire frozen
arc in one cataclysmic swing.**

---

## Auto-attack *(unlaned)*

- **Worldcleaver** · phys · allEnemies · *one slow, sweeping greatsword arc that rakes the front of the line; the trailing edge leaves a wisp of Chill* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Riming Sweep** · phys · allEnemies · *a wide arc across the line; lays light Stasis on every foe it catches — the freeze begins* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Frostbind Arc** · util · allEnemies · *a long reaching swing that Chills the line (slows their attack-bars) and nicks the back row* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Frostgrip Reach** · util · enemy · *the blade's reach hooks a back-row foe forward into the kill-zone and Chills it (zone-control by reach)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Bracing Arc** · phys · allEnemies · *a heavy planted sweep; bonus damage vs Chilled/Frozen foes, building toward the wind-up* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Whiteout Cleave** · phys · allEnemies · *two wide arcs that compound Chill and a wisp of Stasis across the whole line, readying the freeze* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Heaving Wind-Up** · buff · self · *plant your feet and haul the blade back: store momentum — your next sweep hits far harder vs Frozen/Brittle foes; bank NOX* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Cleaving Cold** · phys · allEnemies · *a broad sweep; if a foe is already Chilled it becomes Brittle (priming the arc to Shatter)* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Glacier Drag** · util · allEnemies · *drag the whole line's attack-bars back with a sweeping cold pull and deepen their Chill (hold the line at bay)* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Brittle the Field** · util · allEnemies · *a reaching cold lace over the field: make every Chilled foe Brittle (the field-wide Shatter setup)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Frostquake** · phys · allEnemies · *a planted overhead that cracks the ground; heavy AoE, bonus vs Frozen, and leaves lesser Chill behind* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Linewide Frost** · phys · allEnemies · *a sustained wide arc that spreads Stasis evenly across the entire line* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Loaded Swing** · phys · allEnemies · *release a stored sweep; consumes some of the line's Stasis for bonus AoE, leaving lesser Stasis to keep ticking* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Riming Avalanche** · phys · allEnemies · *a cascading multi-foe sweep; every foe already Chilled is pushed toward Frozen* · gen **major NOX** · cd **medium** · `proposed`
- **B · Hoarfront Reach** · util · allEnemies · *a long cold front rolls out: Chill-drag the back row and Brittle any foe the reach touches* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Sweeping Hoarfrost** · util · allEnemies · *a wide hoarfrost wave; deepen Chill across the line and time-lock it so the freeze won't thaw early* · gen **major NOX** · cd **medium** · `proposed`
- **C · Cleave the Frozen** · phys · allEnemies · *a heavy arc that Shatters every Frozen foe it sweeps through for bonus burst, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Frostwall Sweep** · phys · allEnemies · *a broad patient arc; deepens Chill and makes every Chilled foe on the line Brittle (priming a big arc-Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Gathering Momentum** · buff · self · *wind the blade back over several beats: bank a large NOX reserve and load a massive overhead that Shatters Frozen/Brittle foes far harder* · gen **major NOX** · cd **long** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Wide Winter** · phys · allEnemies · *a colossal sweeping arc; massive AoE, and any Frozen/Brittle foe it catches Shatters for bonus (the cleave showcase)* · gen **major NOX** · cd **medium** · `proposed`
- **B · Glacierhold** · util · allEnemies · *a reaching cold clamp that holds the entire line at bay: heavy Chill-drag + Brittle, and the back row cannot advance* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Frostfront March** · phys · allEnemies · *advance with a wide rimed arc; lay heavy Stasis and Chill across the whole line at once (front-load the freeze)* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frostgrip Hold** · util · allEnemies · *the reach clamps the line: Chill-drag every foe's attack-bar and pin the back row in place for a turn* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Frozen Tide** · util · allEnemies · *a rolling cold tide Brittles the line and time-locks its debuffs so the freeze window stays open through your wind-up* · cost **low NOX** · cd **medium** · `proposed`
- **C · Avalanche Edge** · phys · allEnemies · *release a built-up overhead; a sweeping AoE that Shatters every Frozen/Brittle foe it passes through* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Brittle Horizon** · phys · allEnemies · *a horizon-wide arc; consumes the line's Chill to Freeze it, then a sweep that bonuses against the newly frozen* · cost **med NOX** · cd **medium** · `proposed`
- **C · Riming Arc** · phys · allEnemies · *Freeze the Chilled foes in the arc's path, then a single cleave that Shatters the whole frozen swath* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Worldwinter** · mag · allEnemies · *winter rolls across the field — spread deep Stasis to every foe at once* · cost **med NOX** · cd **long** · `proposed`
- **B · Frostwall Held** · util · allEnemies · *raise a reaching frost wall: the line cannot advance or swap rows for several turns, and stays Chilled (hold them off the slow wind-up)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Worldfall** · util · allEnemies · *a field-wide collapse of cold: drag every attack-bar back hard and Brittle the entire line at once* · cost **high NOX** · cd **medium** · `proposed`
- **C · Worldwinter Arc** · phys · allEnemies · *a colossal wind-up sweep; bonus AoE vs Chilled/Frozen and every frozen foe it cleaves Shatters* · cost **high NOX** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Frostmarch Edict** · mag · allEnemies · *a deep Stasis laid across the line that also reduces every foe's incoming healing while it ticks* · cost **med NOX** · cd **medium** · `proposed`
- **C · Held Glacier** · util · allEnemies · *encase the front line in a glacier — Freeze one or more foes (can't act) and time-lock the freeze so it holds; they Shatter for bonus if struck* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Cleaving Avalanche** · phys · allEnemies · *a chain of broad arcs; each sweep that catches a Frozen/Brittle foe Shatters it and feeds the next sweep* · cost **high NOX** · cd **medium** · `proposed`
- **B · Brittlefront Edict** · util · allEnemies · *a reaching edict over the whole field: Brittle every foe and pin the back row — the line is primed and cannot escape the arc* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Sweep to Stillness** · util · allEnemies · *a slow reaching cold front that Chills the whole line toward Frozen and time-locks it (the team-Shatter setup, held open across the charge)* · cost **high NOX** · cd **long** · `proposed`
- **C · The Frozen Arc** · phys · allEnemies · *the signature payoff: Freeze the line, then one colossal overhead Shatter that detonates every frozen foe across the entire arc* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Linebreaker** · phys · allEnemies · *plunge the whole line into a deep Frozen/Brittle state, then a wide cleave that Shatters every foe in the arc for a burst* · cost **high NOX** · cd **long** · `proposed`
- **C · Cataclysm Arc** · phys · allEnemies · *wind up to the apex and bring the blade down through the field: a single cataclysmic sweep whose Shatter scales with how much of the line is frozen* · cost **high NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Frostbound Line** *(Wintercleave)* · allEnemies · *winter takes the whole field — bury every foe under max-duration Stasis and Freeze the entire line solid in one sweeping arc, leaving the whole line crystallized and brittle* · `proposed`
- **B · Held Horizon** *(Glacier's Reach)* · allEnemies · *raise an unbreakable frost wall across the horizon — the entire enemy line is Chill-dragged to a crawl, Brittled, and cannot advance, swap rows, or escape the arc for several turns* · `proposed`
- **C · Shatter the Line** *(Worldbreak)* · allEnemies · *the cataclysmic overhead: wind the blade to its apex and bring the world down — one colossal sweep that Shatters every Frozen/Brittle foe across the whole line at once for massive AoE burst* · `proposed`
- **The Long Cleave** *(neutral/fusion)* · allEnemies · *one endless winter arc — Chill and Freeze the whole line, Brittle the field, and follow through with a sweeping Shatter that breaks every frozen foe the blade passes* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · The Shattered Arc** · *your wide sweeps apply their Stasis/Chill to one additional foe on the line* · `proposed`
- **B · Worldender's Winter** · *your Chill-drag and field Brittle reach further and last longer (the reach bites wider)* · `proposed`
- **C · Cleaveward** · *your wind-up/momentum specials bank extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Glacierkeeper** · *your Stasis on the line stacks higher and lasts longer* · `proposed`
- **B · Brittlewright** · *foes you've Brittled across the field take extra Shatter damage from your sweeps* · `proposed`
- **C · Avalanche Discipline** · *your wind-up/overhead abilities cost less and hit a wider arc* · `proposed`

**Set @ MNA 90**
- **A · Reach Unyielding** · *your reach Chill-drags and field-Brittles cannot be cleansed for their first turn* · `proposed`
- **B · Momentum Unbroken** · *being struck while you wind up no longer interrupts the swing, and a stored sweep keeps a little stillness ward on you until it lands* · `proposed`
- **C · Shatterwide** · *when one of your sweeps Shatters a Frozen/Brittle foe, the Shatter splashes lesser burst to the foes beside it* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **⚠️ Same-archetype & same-attunement — vs Equilibrium Ascendant (NOX × Hammer), the priority
  watch.** Both are NOX, both **STR+STR**, both run **freeze → Shatter**. The split is the family's
  whole axis — **the point vs the arc** — and it is airtight here. *Equilibrium Ascendant is the
  **point**:* it plants and **crushes one foe**, its identity is **single-target lockdown / tempo-
  control** — Stillgrave's single-target Stasis-attrition, Stillbreaker's **attack-bar push-back and
  stuns** that *arrest one enemy's turn* (Frost Knell, Rime Hook, Gravity's Verdict, Absolute Halt),
  and a ward-tank Warden lane. *Worldender is the **arc**:* every offensive button is **`allEnemies`**
  — he freezes the *whole line* and Shatters the *whole frozen arc* in one sweep. He has **no
  single-target tempo-lockdown** (no attack-bar-to-zero on a foe, no stun-to-deny — his "drag" is a
  *wide line-drag* used to *hold the line at bay for the wind-up*, never to control one enemy's clock),
  **no control finesse**, and **no ward-tank lane** (his only mitigation is an incidental stillness
  wisp on a stored swing). He is **raw line-cleaving power + momentum**; the Ascendant is **patient
  single-target control.** Worldender breaks the *line*; Equilibrium Ascendant breaks a *foe*.
- **Same-archetype (#9) — vs the four other Two-Handed Swords.** Worldender is the **doubled-STR
  pure-power line-cleaver**: freeze the line, Shatter the arc. Distinct from the SOL **Starbreaker**
  (fast AGI+STR radiant cleave that *spreads Burn*), the ANIMA **Apex Dominion** (durable VIT+STR
  contagion-sweep + self-evolution, **non-healer**), the QUANTA **Timeline Breaker** (SPD+STR
  momentum/*time* — collapses the line's *fate*, with rewind), and the UMBRAXIS **Singularity Reaver**
  (DEF+STR — *pull* the line into the arc with gravity, then reave). Worldender's arc is **cold**
  (Stasis/Chill across the line) and his payoff is **Shatter the frozen arc** — held by no other Reaver.
- **Same-attunement (#10) — NOX concept budget.** He reuses the NOX *signature* freely (Stasis / Chill
  → Frozen → Brittle → Shatter) — but at **line scale**, which no other NOX class does. He does **not**
  pile onto a saturated NOX role: the **single-target control-crush** belongs to the Hammer (Equilibrium
  Ascendant), the **action-economy / time-skip flood-execute** to the dagger (Velestra), the
  **crit-shatter + frost-parry + NOX-battery** duelist to the swords (Rimewalker), the
  **mitigation-wall shadow-tank** to the Sword & Shield (Penumbral Bastion), and the **anti-caster
  energy-removal / Seal** to the Staff (Null Absolutionist). He takes **no battery/banks lane**, **no
  ward-wall, no parry, no Seal, no attack-bar-denial, no execute**. His seat — *AoE line-freeze + the
  cataclysmic sweeping Shatter, momentum-driven* — is held by no other NOX class.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary STR ← Two-Handed Sword · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8 — grepped) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Reaver siblings *and* airtight vs Equilibrium Ascendant | ✓ |
| Same-attunement concept budget (#10) — line-scale NOX signature only; no saturated-role pile-on | ✓ |
