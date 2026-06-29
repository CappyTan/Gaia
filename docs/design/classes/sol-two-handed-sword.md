# Starbreaker — SOL × Two-Handed Sword

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The class fantasy, seat (the
> **fast radiant line-cleaver**), the three locked lanes, and the Reaver DNA are **`from-brief`** —
> the dev-approved row + sketch in the [Two-Handed Sword family note](./two-handed-sword-family.md)
> and the brief; the kit's individual abilities are `proposed`. Numberless by design; magnitudes are
> a later balance pass. Mechanics vocabulary (Burn / Blind / Scorched / Overheat → Ignite →
> **Detonate** / Haste / **Spread**) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (SOL suite).

## Identity (derived + DNA)

- **Class:** Starbreaker · **Attunement × Archetype:** SOL × Two-Handed Sword
- **Primary stat:** AGI (← SOL) · **Secondary stat:** STR (← Two-Handed Sword) — an **AGI/STR fast
  line-cleaver**: AGI makes the cleaves *fast*, STR makes them *hit hard*
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (DoT) · SOL suite: **Blind** (miss chance), **Scorched**
  (vulnerability), **Overheat → Ignite → Detonate** (phase chain, here run across the *whole line*),
  **Haste / extra action**, **Spread** (DoTs jump to adjacent foes). SOL is **pure offense — no
  defensive line.**

**Fantasy.** *(from-brief)* The Starbreaker fights with **light made wide** — quick, precise sweeping
arcs of a greatsword wreathed in solar fire that **rake Burn down the whole enemy line.** AGI carries
the swing fast and clean; STR drives it deep. It is the SOL Reaver: where the SOL Hammer (Solar
Arbiter) lands a single radiant **slam** whose impact detonates and spreads outward from a point, the
Starbreaker's **sweep itself is the AoE** — continuous cleaves and long radiant arcs, not one
detonating impact. It zones the field with **Blinding** arcs that keep the line at bay, then loads a
heavy **overhead** that **Detonates** the Burn it has been raking on — the wind-up release that ends
the exchange. Pure offense, no shield, no wall: it survives by Blinding everything in reach and
killing the line before the line answers.

### The shared Reaver DNA *(from-brief — how this is a Two-Handed Sword)*

1. **Cleave (melee AoE arcs).** The auto and most specials are **sweeping arcs** that hit the enemy
   line, not a single foe. The Starbreaker is the front-line line-clearer; the arc *is* the area.
2. **Reach / zone-control.** Long radiant arcs threaten and **Blind** the whole field, keeping foes
   missing and at bay — AGI speed lets it control the line by how fast the arcs come.
3. **Momentum.** Slow base tempo, but the **wind-up overhead releases something cataclysmic** — heat
   built across the sweep is spent in one falling-star detonation.
4. **Opening → Finisher reuses SOL's own phase chain across the LINE.** No new combo resource: the
   Opening **is** **Overheat → Ignite → Detonate** — the sweeps stack heat and rake Burn across the
   line; the overhead finisher detonates it, the blast **Spreading** down the row.

### Lanes *(from-brief)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Suncleave** *(lead)* | **Burn-spread cleave**: fast radiant sweeps that rake **Burn** across the whole line — the showcase SOL Reaver engine. Sustained AoE pressure that compounds | **AGI**/STR, Burn, Spread, cleave | front-line AoE damage | packs & clustered lines; drawn-out fights; SOL-stacked party that pools the pool |
| **B · Solar Wind** | **Reach / Blind control**: long **Blinding** arcs that zone the field, keep the line missing and at bay — AGI speed controls how fast the field is locked down. The Reaver's *defense-by-offense* | **AGI**, Blind, reach/zone-control, Haste | controller / disruptor / self-protect | accuracy-reliant or hard-hitting foes; low-support party where the cleaver must hold its own ground |
| **C · Starfall** | **Momentum + detonate payoff**: load a heavy wind-up overhead that **Detonates** the line's Burn (Overheat → Ignite → Detonate), the falling-star AoE burst | STR, Overheat, Detonate, momentum | burst finisher / nuke | many Burning foes to detonate; a built-up line ready to pop; spike windows |

**Build axes:** sustained Burn-spread cleave ↔ momentum burst-detonation (A↔C) · raw line-damage ↔
Blind/reach field-control (A↔B) · win-by-pressure ↔ win-by-the-big-release (A,B ↔ C).

**Cross-lane synergy:** **A rakes Burn across the whole line and B Blinds it so it whiffs while the
heat builds → C loads the overhead and Detonates the stacked Burn, the blast Spreading down the
already-lit row.** Suncleave lights the line, Solar Wind holds it still, Starfall ends it.

---

## Auto-attack *(unlaned)*

- **Sunsweep** · phys · enemy · *a single wide radiant arc across the enemy line, kindling a wisp of heat (Overheat) on each foe it grazes* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Daycleave** · phys · allEnemies · *a fast radiant sweep across the line; rakes a light Burn onto the foes it cuts (the Opening)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Glare Arc** · phys · allEnemies · *a long flashing arc; lightly Blind the foes in its reach* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Far Light** · phys · enemy · *a reaching arc that strikes the back row; Blind on hit (zone the rear)* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Kindling Arc** · phys · allEnemies · *a sweeping cut that stacks Overheat across the line, readying the detonation* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Spreading Sweep** · phys · allEnemies · *rapid arcs that rake Burn; the Burn can jump to an adjacent foe (Spread)* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Ignite Line** · phys · allEnemies · *a heated sweep that Ignites the line's Overheat into stacking Burn* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Wildlight Sweep** · phys · allEnemies · *a flowing cleave-chain across the line; bonus damage vs Burning foes* · gen **major SOL** · cd **medium** · `proposed`
- **B · Lash of Light** · phys · allEnemies · *a snapping reach-arc that pushes the enemy line's attack-bars back (the anti-tempo lash)* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Solar Wind** · util · allEnemies · *a wide sustained glare-arc; deep Blind across the line so the field whiffs* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Overswing** · phys · allEnemies · *a half-loaded overhead; spends stacked Overheat for a Burn burst down the line* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Searing Crescent** · phys · allEnemies · *a fast crescent cleave; deepens Burn on every foe it sweeps* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Comet Arc** · phys · allEnemies · *a descending arc that detonates one foe's Burn and Spreads the blast to its neighbors* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Heat the Line** · phys · allEnemies · *a sweeping rake that maximizes Burn and Overheat across the line, priming the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **B · Brilliant Reach** · phys · allEnemies · *a long arc that Blinds and Scorches the line at once (they miss, and take more)* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Heatwind** · util · self · *a cyclone of radiant arcs: Blind every foe in reach and refund part of your attack-bar (Haste lean)* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Skybreak** · phys · allEnemies · *a heavy loaded overhead; detonate the line's Burn in a falling-star burst* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Brandsweep** · phys · allEnemies · *a relentless cleave-chain; Scorched on every foe it touches (vulnerability for the team)* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Loaded Overhead** · phys · allEnemies · *wind up a single colossal swing that fully spends Overheat for a Detonating line-burst* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Wildsweep** · phys · allEnemies · *a massive sweeping cleave; heavy Burn that Spreads among every foe it cuts* · gen **major SOL** · cd **medium** · `proposed`
- **B · Lightreach** · util · allEnemies · *a field-wide reach-arc; total Blind and pushed-back attack-bars across the line* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Burning Crescent** · phys · allEnemies · *a fast radiant cleave that rakes heavy Burn across the whole line* · cost **med SOL** · cd **medium** · `proposed`
- **B · Blinding Arc** · util · allEnemies · *a sweeping flash; deep Blind so the line whiffs its next actions* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Sunshear** · phys · allEnemies · *a long reaching arc that strikes front and back rows alike; Blind + Scorched on the line* · cost **med SOL** · cd **medium** · `proposed`
- **C · Falling Star** · phys · allEnemies · *a wind-up overhead that crashes down and detonates the line's Burn, the blast Spreading onward* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Conflagrant Arc** · mag · allEnemies · *a spreading sweep — lay Burn on every foe and let it jump down the line* · cost **med SOL** · cd **long** · `proposed`
- **C · Cresting Overhead** · phys · allEnemies · *load and release a heavy swing scaling with the Overheat stacked across the line* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sunfire Reach** · mag · allEnemies · *a wide arc of solar flame; heavy Burn that Spreads, bonus vs already-Burning foes* · cost **med SOL** · cd **medium** · `proposed`
- **B · Daystorm** · util · allEnemies · *a storm of blinding arcs: deep Blind on all foes and their attack-bars dragged back for several turns* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Solar Tempest** · util · allEnemies · *a sustained whirl of reaching light: Blind + Scorched the line and Haste yourself* · cost **high SOL** · cd **medium** · `proposed`
- **C · Meteor Cleave** · phys · allEnemies · *a falling overhead that detonates every Burn on the field at once, each blast Spreading to the next foe* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Phoenix Arc** · mag · allEnemies · *a rising-then-falling arc of fire; max Burn across the line, escalating each turn* · cost **high SOL** · cd **medium** · `proposed`
- **C · Starfall Crash** · phys · allEnemies · *a colossal loaded overhead; fully spend the line's Overheat and Burn in one Detonating crater of light* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Wildfire Cleave** · mag · allEnemies · *a sweeping conflagration; Burn that Spreads to every foe and keeps jumping for several turns* · cost **high SOL** · cd **long** · `proposed`
- **B · Sky Afire** · util · allEnemies · *set the field alight with glare: total Blind on all foes for several turns* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Horizon Line** · util · allEnemies · *a field-spanning reach-arc that Blinds, Scorches, and drags back the whole line's tempo at once* · cost **high SOL** · cd **long** · `proposed`
- **C · Cometfall** · phys · allEnemies · *a sky-splitting overhead; a falling-star impact that Detonates and Spreads Burn across the entire field* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Sunscourge** · mag · allEnemies · *an un-cleansable Burn raked across the line that detonates for a burst scaling with how many foes it Spread to* · cost **high SOL** · cd **long** · `proposed`
- **C · Skyfall Verdict** · phys · allEnemies · *the ultimate wind-up — a single annihilating overhead that fully detonates all Burn and Overheat on the field in a chain* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Line of Fire** *(Suncleave)* · allEnemies · *the whole line catches — rake max Burn across every foe and let the wildfire Spread and re-Spread down the row, escalating each turn* · `proposed`
- **B · Solar Reaver** *(Solar Wind)* · allEnemies · *become a cyclone of unending radiant arcs for the turn — total Blind on the field, every enemy whiffing, while your cleaves rake and Scorch the line untouched* · `proposed`
- **C · The Falling Sun** *(Starfall)* · allEnemies · *the one cataclysmic overhead — load every stack of Overheat and Burn on the field and bring a falling star down across the whole line, a chain-Detonation that Spreads to anything left standing* · `proposed`
- **Starbreaker's Arc** *(neutral/fusion)* · allEnemies · *one perfect sweep of pure daylight: Blind the line, rake it with spreading Burn, then carry the same arc up into a falling-star Detonation across every foe at once* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Sweepfire** · *your cleaves rake Burn onto more foes, and it Spreads more readily* · `proposed`
- **B · Long Reach** · *your arcs strike a wider area and reach the back row* · `proposed`
- **C · Heavy Swing** · *your wind-up overheads hit harder the more Overheat the line is carrying* · `proposed`

**Set @ MNA 60**
- **A · Linefire** · *your Burns stack higher and don't expire while you keep sweeping fire across the line* · `proposed`
- **B · Lasting Glare** · *your Blinds last longer and your reach-arcs also lightly Scorch* · `proposed`
- **C · Detonator** · *your overhead Detonations hit harder and Spread to more foes* · `proposed`

**Set @ MNA 90**
- **A · Wildfire Reaver** · *when your Burn Spreads to a fresh foe, it deals bonus damage on the jump* · `proposed`
- **B · Eye of the Storm** · *while foes near you are Blinded, your cleaves cannot miss and lightly Haste you* · `proposed`
- **C · Apex Overhead** · *your loaded overheads detonate for more the more foes they catch in the arc* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Two-Handed Swords.** Starbreaker is the **fast radiant
  line-cleaver**: AGI-fast sweeping arcs that *Spread Burn* down the line, Blinding reach-control, and
  a momentum overhead that *Detonates* across the row. Distinct from the NOX **Worldender** (raw
  STR+STR freeze-the-line → shatter-the-arc, pure power, no Blind/Burn), the ANIMA **Apex Dominion**
  (durable contagion/self-evolution sweeper, non-healer), the QUANTA **Timeline Breaker**
  (momentum-as-*time*, collapsing the line's fate), and the UMBRAXIS **Singularity Reaver**
  (gravity *pulls* the line into the arc). Only Starbreaker's arc is **fire that Spreads** and
  **light that Blinds** — the SOL signature carried across the whole line.
- **Same-archetype — vs its SOL Hammer cousin (Solar Arbiter, the *point*).** The split is the family
  axis itself: the Solar Arbiter is a single radiant **slam** whose *impact* detonates and a shockwave
  spreads outward **from a point** (stagger / sunder / Shatter, impact-centred). Starbreaker's **sweep
  ITSELF is the AoE** — it is the *arc*, not the *point*: continuous cleaves + long reach that rake
  Burn across the line as they travel, and the detonation is the *follow-through of a swing*
  (Starfall's overhead), not the moment of a single impact. The Arbiter breaks a spot; the Starbreaker
  breaks the line by sweeping through it.
- **Same-attunement (#10) — SOL concept budget.** It reuses the SOL *signature* (Burn) and the full
  SOL suite (Blind / Scorched / Overheat → Ignite → Detonate / Haste / Spread) freely, as the
  framework intends — but it does **not** pile onto a saturated SOL role. The **single-target crit
  duel** is owned by Sunblade (Dual Swords) and the **blink-execute assassin** by Eclipsedancer (Dual
  Daggers); the **back-line artillery/nuker** is Heliomancer (Staff); the **block off-tank** is
  Dawnwarden (Sword & Shield); the **slam→detonation point-breaker** is Solar Arbiter (Hammer).
  Starbreaker's seat — *fast melee front-line line-cleave where the sweep is the AoE and Burn Spreads
  down the row* — is held by no other SOL class. (SOL is by ratified policy **pure offense, no
  defensive line** — honored: Solar Wind is *Blind/reach control as defense-by-offense*, never a Block
  or ward.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary STR ← Two-Handed Sword · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL (runs hot) | ✓ |
| Provenance on every entry (fantasy/seat/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Two-Handed siblings *and* from Solar Arbiter | ✓ |
| Same-attunement concept budget (#10) — reuses SOL signature only; no saturated-role pile-on; SOL no-defense policy honored | ✓ |
