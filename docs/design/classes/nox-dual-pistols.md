# Cryovex — NOX × Dual Pistols

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The seat (the **frost volley
> gunner** — back-row STR+AGI), the three lanes (A · Frost Volley / B · Cryo Shot / C · Coldsnap), and
> the Gunslinger DNA are **`from-brief`** — the LOCKED NOX row of the
> [Dual Pistols family note](./dual-pistols-family.md); the kit's individual abilities are `proposed`.
> Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Brittle → Shatter · attack-bar drag · time-lock ·
> stillness ward · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`). If that framework shifts, reconcile this kit toward it.
>
> ⚠️ **The priority distinctness is the ranged pair.** Cryovex (Dual Pistols) and **Terminus**
> (NOX × Rifle) are the two back-row NOX gunners and share the freeze→Shatter signature. The split is
> the families' whole axis — **VOLUME vs THE ONE SHOT** — and is airtight by design: **Terminus is the
> single freezing kill-shot (mark → Frozen → a Shatter-shot, an execute); Cryovex is the Chill-VOLLEY
> that sprays the whole line cold — volume application, two Chill/Stasis hits per pull, never a single
> kill-shot.** See the Distinctness section.

## Identity (derived + DNA)

- **Class:** Cryovex · **Attunement × Archetype:** NOX × Dual Pistols *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** AGI (← Dual Pistols) — a back-row STR/AGI
  **frost volley gunner**: heavy STR freeze-rounds delivered by AGI volume-fire
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT — cold cessation) · NOX suite Cryovex wields **by fire**:
  **Chill** (slows; her rounds spray it across the line), **Frozen** (can't act), **Brittle** (bonus
  burst taken), **Shatter** (Frozen/Brittle → STR burst), attack-bar **drag** (Chill-rounds slow the
  enemy ATB), **time-lock** (hold the freeze open at range), a touch of **stillness ward** (kite
  cover, never a wall). The **banks** economy. Cryovex owns NOX's **ranged volley-application** facet —
  she freezes the *whole line* under a hail of cold rounds.

**Fantasy.** *(`from-brief`)* Cryovex is the **frost volley gunner** — twin pistols that never stop
spitting cold. Where the melee NOX classes weave the freeze into one foe, she **sprays it across the
line**: every pull is a double-tap, two Chill/Stasis applications at once, and a sustained volley rimes
the *whole* enemy front while dragging their attack-bars to a crawl. She is the ranged **applicator** —
the fastest stacker of NOX's signature at range. When a target has iced over she switches to the heavy
STR **freeze-rounds**: deliberate, weighty cryo shots that punch a Chilled foe into **Frozen** and
**Brittle**, holding it crystallized while the volley keeps raking the rest of the line. She wins not by
a single decisive bullet but by **volume and rhythm** — cheap fast cold rounds build the freeze, the
heavy rounds lock it, and the line collapses under accumulating ice. Her answer to the fragile back row
is the back row itself: **kite, reposition, and keep firing** — a frozen, attack-bar-dragged line never
reaches her. Where **Terminus** lines up one freezing kill-shot and removes a target, Cryovex
**buries the line in cold rounds** and freezes it whole. Volley, not the one shot; spray, not the
headshot.

### The shared Gunslinger DNA *(`from-brief` — how this is a Dual Pistols)*

1. **Double-tap (double application).** The auto and most specials fire *two* rounds → **two
   Chill/Stasis applications** per action. Cryovex is the ranged **fastest applicator** of NOX's
   signature — volume, not a single charged shot.
2. **Volume / rhythm.** Sustained fire builds the freeze: cheap fast cold rounds rime the line and
   *feed* the heavy freeze-rounds and the Shatter payoff. Momentum, not a wind-up.
3. **Back-line kite (the fragility answer).** Reposition, quickdraw, and a thin stillness-ward cover
   from the back row — survival is *don't get hit*: a Chilled, attack-bar-dragged, Frozen line can't
   reach the gunner.
4. **Reuse NOX's own phase chain — applied by fire, across the LINE.** No new combo resource: the
   Opening **is** **Chill → Frozen → Brittle**, *sprayed on by the volley*; the payoff is the
   **Shatter** of the iced line — a **volume application**, never a single kill-shot.

### Lanes *(`from-brief` — the locked frame's three)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Frost Volley** *(lead)* | **The Chill-spray applicator** — rapid double-tap volleys that rake **Chill + Stasis** across the *whole enemy line* and **drag their attack-bars**; the ranged freeze-engine, by volume not by a single round | **AGI**, applications-per-pull, Chill/Stasis on the line, attack-bar drag | back-row line-softener / DoT-floor applicator | vs packs & wide lines; AGI- & Stasis-stacked gear; a party that punishes Chilled/Frozen foes |
| **B · Cryo Shot** | **Heavy STR freeze-rounds** — deliberate weighty cryo rounds that punch a Chilled foe to **Frozen / Brittle** and punish the frozen with a Shatter-grade round; the lane that *locks and breaks* what the volley iced | **STR**, Frozen/Brittle setup, Shatter | single-target lock + burst-by-fire | vs a priority target you can ice over; STR-stacked gear; finishing a frozen foe the volley set up |
| **C · Coldsnap** | **Range-control** — **Frozen**, heavy attack-bar **drag** at range, **time-lock** to hold the freeze, and a thin **stillness ward** for the kite; the control/protection enabler that keeps the line cold and off the back row | **AGI**/control, attack-bar, time-lock, light ward | disruptor / kite-enabler / protector | vs fast attackers & casters you must hold off; protecting the back line; holding a freeze open |

**Build axes:** spray-attrition ↔ freeze-round burst (A↔B) · lock-and-break ↔ range-control/protection
(B↔C) · own-line damage ↔ control/kite-protection (A,B ↔ C).

**Cross-lane synergy:** **A sprays the whole line Chill + Stasis and drags its attack-bars → C
time-locks the freeze and holds the line off the back row → B punches the iced priority target to
Frozen/Brittle and breaks it with a heavy round while the volley keeps raking the rest.**

---

## Auto-attack *(unlaned)*

- **Coldshot** · phys · enemy · *a quick double-tap of frost rounds (two shots); the second leaves a wisp of Chill* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Spray of Frost** · phys · allEnemies · *a sweeping double-tap volley across the line; lays light Stasis on every foe it catches — the freeze begins* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Rimeround** · phys · enemy · *a single heavy cryo round into one foe; Chills it (drags its attack-bar)* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Hardpoint Round** · phys · enemy · *a weighty freeze-round; bonus damage vs a Chilled/Frozen target, building toward the break* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Dragging Fire** · util · enemy · *a stuttering burst that pushes the target's attack-bar back hard and deepens its Chill* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Hailfire Volley** · phys · allEnemies · *two raking volleys that compound Chill and a wisp of Stasis across the whole line, readying the freeze* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Snapfreeze Round** · util · enemy · *a precise cold round that Freezes a Chilled target (it can't act); time-lock holds it briefly* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Frostspray Burst** · phys · allEnemies · *a four-round double-volley spraying light Stasis + Chill across the line — the flood by fire* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Brittling Round** · phys · enemy · *a heavy round; if the target is already Chilled it becomes Brittle (priming the Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Glacial Round** · phys · enemy · *a weighty cryo round; bonus vs Frozen, and leaves lesser Chill behind to keep dragging* · gen **major NOX** · cd **medium** · `proposed`
- **C · Whiteout Spray** · util · allEnemies · *a wide suppressing volley: Chill the whole line and drag every attack-bar* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Hoarfrost Hail** · phys · allEnemies · *a sustained volley that spreads Stasis evenly across the entire line* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Hold the Line Cold** · buff · self · *fall back and lay covering fire: raise a thin stillness ward while your volleys keep flowing; bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Creeping Volley** · phys · allEnemies · *a cascading line-volley; every foe already Chilled is pushed toward Frozen* · gen **major NOX** · cd **medium** · `proposed`
- **B · Punch-Through Round** · phys · enemy · *a heavy round that consumes some of the target's Stasis for bonus damage, leaving lesser Stasis ticking* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Shatterfire Round** · phys · enemy · *a Shatter-grade cryo round that detonates a Frozen/Brittle target for bonus burst, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`
- **C · Frostlock Volley** · util · allEnemies · *a wide cold burst; deepen Chill across the line and time-lock it so the freeze won't thaw early* · gen **major NOX** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Squall of Rounds** · phys · allEnemies · *a broad spraying volley; deepens Chill and makes every Chilled foe on the line Brittle (priming a line-wide Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Quickdraw Cold** · buff · self · *reposition and re-load on the move: refund part of your attack-bar, drag the nearest foe's bar back, and bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Blizzard Volley** · phys · allEnemies · *a colossal raking volley; massive line damage, and any Frozen/Brittle foe it catches Shatters for bonus (the spray showcase)* · gen **major NOX** · cd **medium** · `proposed`
- **B · Deadweight Round** · phys · enemy · *a massive single freeze-round; applies max-duration, deep-stack Stasis and Brittles the target* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Opening Barrage** · phys · allEnemies · *open up on the line with a heavy double-volley; lay strong Stasis and Chill across every foe at once (front-load the freeze)* · cost **med NOX** · cd **medium** · `proposed`
- **B · Cryoslug** · phys · enemy · *a single heavy cryo round that consumes a Chilled target's Chill to Freeze it on the spot* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Killing Cold Round** · phys · enemy · *a Shatter-grade round; massive vs a Frozen or Brittle target (the Shatter payoff, by fire not by execute)* · cost **med NOX** · cd **medium** · `proposed`
- **C · Suppressing Frost** · util · allEnemies · *a sustained cold barrage that drags every foe's attack-bar back and Chills the line — keep them off the back row* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Frostwind Fusillade** · mag · allEnemies · *a withering volley of cold — spread deep Stasis to every foe at once* · cost **med NOX** · cd **long** · `proposed`
- **C · Lockdown Frost** · util · enemy · *Freeze a Chilled foe and time-lock it: it can't act and the freeze won't tick down for several turns* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Hailstorm** · phys · allEnemies · *a relentless raking volley scaling with how much Stasis already coats the line — the more iced, the harder it bites* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frostcore Round** · phys · enemy · *a single devastating freeze-round; Freeze the target solid, Chilled or not, and Brittle it* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Pointblank Cryo** · phys · enemy · *a heavy round straight into a Frozen/Brittle foe; a Shatter detonation that leaves lesser Chill on the line behind it* · cost **high NOX** · cd **medium** · `proposed`
- **C · Snowblind Suppression** · util · allEnemies · *a wide freezing barrage: Freeze one or more foes (can't act) and drag the rest of the line's attack-bars to a crawl* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Streaking Frost** · mag · allEnemies · *a streaming volley of cold that lays deep Stasis across the line and reduces every foe's incoming healing while it ticks* · cost **med NOX** · cd **medium** · `proposed`
- **C · Cover the Retreat** · buff · allAllies · *lay down a wall of suppressing cold fire: a thin stillness ward over the party + drag every foe's attack-bar, and bank a NOX surge (kite + battery)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Cascade Volley** · phys · allEnemies · *a chain of raking volleys; every volley that catches a Frozen/Brittle foe Shatters it and feeds the next sweep* · cost **high NOX** · cd **medium** · `proposed`
- **B · Glaciate Round** · phys · enemy · *a colossal freeze-round; Freeze the target, then a Shatter-grade follow-up shot detonates the frozen glass* · cost **high NOX** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Coup de Cryo** · phys · enemy · *the showcase single-target sequence: ice the target to Frozen/Brittle, then one heavy round that Shatters it for a burst* · cost **high NOX** · cd **long** · `proposed`
- **C · Frostfield Suppression** · util · allEnemies · *a field of freezing fire: Chill the whole line toward Frozen and time-lock it (the team-Shatter setup, held open at range)* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Long Volley** · mag · allEnemies · *empty both barrels into the line — apply deep, un-cleansable Stasis to every foe and rake them once more for a burst across the frozen line* · cost **high NOX** · cd **long** · `proposed`
- **C · Absolute Coldsnap** · util · allEnemies · *the field ices over — Freeze and Brittle the whole line, drag every attack-bar to a stop, and time-lock it all so the freeze holds (a team Shatter window, held open)* · cost **high NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Whiteout Storm** *(Frost Volley)* · allEnemies · *a ceaseless storm of cold rounds — bury the whole line under max-duration Stasis, drag every attack-bar to a crawl, and rake the iced line for a sweeping burst (the volley made absolute)* · `proposed`
- **B · The Killing Frost** *(Cryo Shot)* · enemy · *one perfected freeze-round sequence — ice the target to absolute zero (guaranteed Freeze + max Brittle), then a single colossal Shatter-grade round that breaks it (volume's payoff, not Terminus's execute)* · `proposed`
- **C · Deep Freeze Field** *(Coldsnap)* · all · *the range goes silent and white — Freeze and Brittle every foe, time-lock their actions to a stop, and lay a stillness ward over the party (a held-open team Shatter window from the back line)* · `proposed`
- **Cryovex's Hail** *(neutral/fusion)* · allEnemies · *empty the line under endless fire — spray deep Stasis and Freeze across every foe, drag the whole line's tempo to nothing, then a raking Shatter volley that breaks every frozen target the rounds pass through* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Volley Cadence** · *your Chill/Stasis stacks higher across the line and your double-taps land an extra application* · `proposed`
- **B · Heavy Loads** · *your freeze-rounds hit harder and a Chilled foe needs less to push to Frozen/Brittle* · `proposed`
- **C · Frostgunner's Footwork** · *your attack-bar drags are stronger and last longer, and your specials bank extra NOX* · `proposed`

**Set @ MNA 60**
- **A · Riming Spray** · *foes coated by your Stasis take increased damage from your volleys* · `proposed`
- **B · Shatterload** · *foes you've Frozen take extra Shatter damage from your rounds* · `proposed`
- **C · Cold Reposition** · *whenever you Chill or Freeze a foe, refund a little of your attack-bar and push its bar back (kite the line)* · `proposed`

**Set @ MNA 90**
- **A · Endless Hail** · *your line-wide max-stack Stasis becomes un-cleansable* · `proposed`
- **B · Killshot Cold** · *when one of your rounds Shatters a Frozen/Brittle foe, the Shatter splashes lesser burst to the foes beside it* · `proposed`
- **C · Frozen Range** · *while your stillness ward holds, the line's time-locked durations don't tick down and dragged attack-bars recover slower* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **⚠️ Same-attunement & ranged-pair — vs Terminus (NOX × Rifle), the priority watch.** Both are NOX
  back-row gunners running freeze → Shatter. The split is the ranged families' whole axis — **VOLUME
  vs THE ONE SHOT** — and it is airtight here. *Terminus is the **one shot**:* a charged freezing
  **kill-shot**, a single-target **mark → Frozen → a Shatter-shot** that **executes** (bonus vs low-HP),
  removing one target before it acts; SPD-secondary, first-strike. *Cryovex is the **volley**:* her
  offensive buttons are overwhelmingly **`allEnemies`** double-tap volleys that **spray Chill + Stasis
  across the line** and **drag every attack-bar** — she's the ranged **applicator**, two applications
  per pull, freezing the whole line by *volume*. Her single-target lane (B · Cryo Shot) **locks and
  breaks** a foe the volley already iced with a Shatter-grade *round* — a **volume payoff**, explicitly
  **not** a charged single kill-shot or an HP-execute. She has **no mark**, **no charge/aim wind-up**,
  **no execute**; she is AGI-volume where Terminus is SPD-precision. Cryovex freezes the *line*;
  Terminus removes a *target*.
- **Same-archetype (#9) — vs the four other Dual Pistols.** Cryovex is the **frost volley gunner** —
  spray the line cold, drag its tempo, freeze and Shatter it by volume. Distinct from the SOL
  **Gunslinger Solaris** (doubled-AGI pure crit-spray that rakes *Burn*, no defensive line), the ANIMA
  **Sporecaster** (Infestation rounds that spread contagion, **non-healer**), the QUANTA **Entropic
  Echo** (ricocheting *echo* shots, crit/dodge probability swings), and the UMBRAXIS **Orbitalist**
  (gravity-curved rounds that *pull/cluster* the line + Drain). Cryovex's volley is **cold** (Chill /
  Stasis / attack-bar drag) and her payoff is **Shatter the frozen line** — held by no other gunslinger.
- **Same-attunement (#10) — NOX concept budget.** She reuses the NOX *signature* freely (Stasis /
  Chill → Frozen → Brittle → Shatter) — but as **ranged volley-application across the line**, an
  expression no other NOX class holds. She does **not** pile onto a saturated NOX role: the
  **single-target control-crush** belongs to the Hammer (Equilibrium Ascendant), the **AoE
  line-cleave-and-Shatter melee** to the Two-Handed Sword (Worldender), the **action-economy /
  time-skip flood-execute** to the dagger (Velestra), the **crit-shatter + frost-parry + NOX-battery**
  duelist to the swords (Rimewalker), the **mitigation-wall shadow-tank** to the Sword & Shield
  (Penumbral Bastion), the **anti-caster energy-removal / Seal** to the Staff (Null Absolutionist), and
  the **freezing single kill-shot / execute** to the Rifle (Terminus). Cryovex takes **no battery-lane
  identity** (only the incidental kite-cover banking every NOX class shares), **no ward-wall, no parry,
  no Seal, no time-skip, no mark, no execute, no charge**. Her seat — *ranged Chill-volley that
  freezes the whole line by volume + a heavy freeze-round that locks and Shatters a priority target* —
  is held by no other NOX class.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary AGI ← Dual Pistols · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8 — grepped) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Dual Pistols siblings *and* airtight vs Terminus | ✓ |
| Same-attunement concept budget (#10) — ranged volley-application of the NOX signature only; no saturated-role pile-on | ✓ |
</content>
</invoke>
