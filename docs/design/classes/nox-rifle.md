# Terminus — NOX × Rifle

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The seat (the long-range
> **freezing executioner** — the freezing kill-shot), the three lanes (A · Killshot / B · Cold Mark /
> C · Zero Point), and the Marksman DNA are **`from-brief`** — the locked NOX row of the
> [Rifle family note](./rifle-family.md); the kit's individual abilities are `proposed`. Numberless by
> design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Brittle → Shatter · time-lock · stillness /
> lattice ward · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`). If that framework shifts, reconcile this kit toward it.

## Identity (derived + DNA)

- **Class:** Terminus · **Attunement × Archetype:** NOX × Rifle *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** SPD (← Rifle) — a STR/SPD **long-range
  executioner**: the single freezing kill-shot, not a volley
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT — cold cessation) · NOX suite Terminus wields **down the
  scope at one target:** **Chill** (slows / attack-bar drag), **Frozen** (can't act), **Brittle**
  (bonus burst taken), **Shatter** (Frozen/Brittle → STR burst — *his* is the single Shatter-shot),
  **time-lock** (freeze a debuff's duration so the mark *holds* across a charge / hold the foe at
  distance), the **banks** economy. Terminus owns NOX's **single-shot precision-execute** facet — the
  one charged round that ends a frozen target.

**Fantasy.** *(`from-brief`)* Terminus is the **absolute-zero end** — a marksman who asks only *"can
you make the one shot?"* and answers it with a single freezing round. He opens from the maximum range
the SPD line affords: first to act, far out of reach, he settles the crosshair on one target and
**marks** it in cold. The mark crystallizes — Chill deepens to **Frozen**, the frozen glass turns
**Brittle** — and then he squeezes off the round that has been **charging** the whole time: a
**Shatter-shot** that detonates the frozen target in one clean, decisive hit. He doesn't bury a line
under fire and he doesn't spray to keep enemies stilled; he removes *one* foe — the priority kill, the
caster, the thing that must die first — before it ever acts. His charged round bites hardest into what
is already low or already frozen: the named *Terminus*, the point past which the target does not
continue. Where the NOX **pistol cousin (Cryovex)** *sprays* a Chill-volley across the whole line to
slow the field, Terminus **aims** — mark one target, freeze it, and Shatter it with a single round.
First-strike, charge, mark, kill-shot; the cold full-stop at the end of the scope.

### The shared Marksman DNA *(`from-brief` — how this is a Rifle)*

1. **The aimed shot — single-target precision, not volume.** The auto and the bulk of the kit hit
   **one** target down the scope; the win condition is the *decisive round*, never a hail. Terminus is
   the game's single-shot freezer, not an applicator-of-the-line.
2. **Charge / aim — spend a beat to load a devastating shot (momentum, at range).** A wind-up that
   loads the kill-shot: store the charge, settle the crosshair, then release one round that hits far
   harder against a Frozen/Brittle (or low-HP) target. The ranged cousin of the greatsword's momentum.
3. **The mark — designate a target for bonus damage / the signature application.** Painting a target
   in cold *is* his opener: the mark **Chills → Frozens → Brittles** the one foe and primes it for the
   Shatter-shot; bonus damage and the execute key off the mark.
4. **First-strike / range control — SPD priority + distance.** SPD = act first and open the fight from
   max range; his fragility answer is to **strike first and stay out of reach** — and to **time-lock**
   the foe (hold it frozen at distance, drag its bar) so it never closes. He reuses NOX's own phase
   chain — **Chill → Frozen → Brittle → Shatter** — *as the decisive single shot*, never as a field
   flood. No new combo resource.

### Lanes *(`from-brief` — the locked frame's three)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Killshot** *(lead)* | **The charged kill-shot** — load a charge, then a single freezing round that hits hardest against a Frozen/Brittle or **low-HP** target. The precision execute, the showcase | **STR/SPD**, charge/momentum, Frozen/Brittle & low-HP thresholds | single-target burst / priority kill / execute | vs a frozen, brittle, or already-low target; STR- & burst-stacked gear; you need one thing dead now |
| **B · Cold Mark** | **Mark → Frozen/Brittle → Shatter-shot** — paint one target in cold, deepen the mark through the chain, then detonate it with a Shatter round. The setup-and-detonate lane | **STR**, mark application, Chill→Frozen→Brittle→Shatter on one foe | applicator / setup / detonator | vs a single hard target you can take time to crystallize; a party that follows your mark |
| **C · Zero Point** | **Range control via time-lock** — first-strike, drag and **time-lock** the target frozen at distance, keep your own footing with a thin stillness ward, and **bank** the shared NOX. The distance / control / economy lane | **SPD**, attack-bar drag/time-lock, first-strike, NOX economy | controller / kiter / battery | vs a foe that must be kept frozen-at-distance; NOX-stacked party (feeds the pool) or one needing the foe held off |

**Build axes:** charged-execute-burst ↔ mark-setup-detonate (A↔B) · mark-detonate ↔ range-control/battery
(B↔C) · own-target damage ↔ distance-control/economy (A,B ↔ C).

**Cross-lane synergy:** **B marks one target and crystallizes it Chill → Frozen → Brittle → C time-locks
the mark so it holds at distance and the foe never closes (and banks the NOX that fuels it) → A charges
and squeezes the single Shatter-shot that ends it.**

---

## Auto-attack *(unlaned)*

- **Coldbore Shot** · phys · enemy · *a single aimed crystalline round down the scope; the muzzle leaves a wisp of Chill on the target* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Sighting Frost** · phys · enemy · *a settled aimed round; bonus damage vs a Chilled/Frozen target, and a touch lower the lower its HP — finding the range* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Frostmark Round** · util · enemy · *paint the target in cold: mark it and lay a light Chill, priming it for the chain* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Crystal Bead** · phys · enemy · *draw a bead on the marked foe; deepen its Chill toward Frozen and lay a wisp of Stasis* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Cold Sightline** · util · enemy · *open from distance: drag the target's attack-bar back and Chill it, keeping it out of reach* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Zeroing Cut** · phys · enemy · *a precise round zeroed on the target; bonus vs a low-HP foe, building toward the charged shot* · gen **moderate NOX** · cd **short** · `proposed`
- **C · Range Lock** · util · enemy · *time-lock the target's current Chill/Stasis so it stops ticking down — hold the mark open at distance* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Brittle Bead** · phys · enemy · *an aimed round; if the target is Chilled it becomes Brittle (sets up the Shatter-shot)* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Frostpin** · util · enemy · *pin the marked foe: deepen Chill and pin it in place (it cannot advance or swap rows)* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Standoff Frost** · phys · enemy · *a measured round on the marked foe; consumes some Chill to Freeze it solid for a beat, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`
- **C · Frost Picket** · buff · self · *take an overwatch position: a thin stillness ward on yourself while you hold the angle; bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Coldbore Round** · phys · enemy · *a charged crystalline round; if the target is Frozen it Shatters for bonus and leaves lesser Chill* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Cold Watch** · util · enemy · *first-strike overwatch on the marked foe: drag its bar hard and time-lock the drag (hold it frozen at distance); bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Killcold** · phys · enemy · *a quick decisive round; bonus vs a low-HP target and refunds part of your attack-bar on a kill* · gen **major NOX** · cd **medium** · `proposed`
- **B · Frostline Shot** · phys · enemy · *a round on the marked foe scaling with its current Stasis; deepens the chain toward Frozen* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Tag the Cold** · phys · enemy · *a sharp round that detonates a Frozen/Brittle marked foe for a Shatter burst, leaving lesser Chill* · gen **major NOX** · cd **medium** · `proposed`
- **C · Standoff Lock** · util · enemy · *clamp the distance: Freeze a Chilled target and time-lock the freeze so it holds while you reposition; bank NOX* · gen **moderate NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Crystal Killshot** · phys · enemy · *a charged round held to the apex; massive bonus vs a Frozen/Brittle or low-HP target (the kill-shot showcase)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Coldfront Picket** · buff · self · *dig in at range: raise a stillness ward and bank a large NOX reserve for the party while you hold the angle* · gen **major NOX** *(battery)* · cd **long** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Endfrost** · phys · enemy · *a colossal charged round; the cold full-stop — enormous bonus vs a Frozen/Brittle foe and a clean execute vs a low-HP one* · gen **major NOX** · cd **medium** · `proposed`
- **B · Brittlemark** · util · enemy · *the perfected mark: deep Chill that crystallizes the target toward Frozen and makes it Brittle, primed to be Shattered by one shot* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Frostbore Shot** · phys · enemy · *load a charge and squeeze one freezing round; bonus damage vs a Frozen/Brittle or low-HP target* · cost **med NOX** · cd **medium** · `proposed`
- **B · Mark the Frost** · util · enemy · *paint a hard cold mark: heavy Chill and Stasis on one target that primes it for the Shatter-shot* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Standoff Cold** · phys · enemy · *a round on the marked foe; consumes its Chill to Freeze it, then a Shatter-shot if it was already Brittle* · cost **med NOX** · cd **medium** · `proposed`
- **C · Cold Reticle Lock** · util · enemy · *settle the crosshair and time-lock the target's debuffs so the mark won't thaw, while dragging its attack-bar back* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Killing Frost Round** · phys · enemy · *a charged execute round scaling with the target's missing HP; bonus if it is Frozen or Brittle* · cost **med NOX** · cd **medium** · `proposed`
- **C · Frostline Hold** · util · enemy · *hold the line at distance: Freeze a Chilled foe and time-lock the freeze so it cannot act or close for several turns* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Frostpoint Shot** · phys · enemy · *Freeze a Chilled target with a precise round, then a guaranteed Shatter-shot detonates the frozen glass* · cost **med NOX** · cd **medium** · `proposed`
- **B · Marked for Stillness** · util · enemy · *a deep mark: the target is Brittled and cannot be healed past its current HP while marked (the kill is sealed in)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Sightline Shatter** · phys · enemy · *the setup-and-detonate payoff: deepen the mark to Frozen/Brittle, then one heavy Shatter round that detonates the marked target* · cost **high NOX** · cd **medium** · `proposed`
- **C · Range Frost** · util · enemy · *clamp a foe at distance: long Freeze + time-lock + heavy attack-bar drag, so it never reaches the line* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Shatter Round** · phys · enemy · *a colossal charged round; if it strikes a Frozen/Brittle target the Shatter detonates for bonus scaling with the charge held* · cost **med NOX** · cd **medium** · `proposed`
- **C · Coldhold** · util · enemy · *the controller's hold: Freeze the marked target, time-lock the freeze, and bank a NOX surge for the party while it stands frozen at range* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Terminal Frost** · phys · enemy · *the named end-shot: plunge the target into deep Frozen/Brittle, then a single decisive round that Shatters it for a burst* · cost **high NOX** · cd **medium** · `proposed`
- **B · Zero the Mark** · phys · enemy · *consume the entire mark at once — Freeze, Brittle, and Shatter the marked target in one detonating round* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Hoarmark Detonation** · phys · enemy · *detonate the marked foe's accumulated Stasis and Brittle for a Shatter burst scaling with the mark's depth; reseed a lesser mark* · cost **high NOX** · cd **long** · `proposed`
- **C · Frozen Standoff** · util · allEnemies · *take the high angle and lock the distance: Chill the whole line toward Frozen and time-lock it, then drag every attack-bar back hard — the field is held at arm's length while you pick your shot* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Final Sightline** · phys · enemy · *the absolute-zero kill-shot: bring the target to a deep Frozen/Brittle state, then one charged round that Shatters it, with a clean execute if it was already low* · cost **high NOX** · cd **long** · `proposed`
- **C · Markstill** · util · enemy · *the perfected distance-hold: Freeze the target, time-lock its actions, drag its bar to a crawl, and bank a burst of party NOX — held frozen out of reach* · cost **med NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Absolute Bead** *(Killshot)* · enemy · *charge to the absolute apex and fire the one round — guaranteed Freeze + max Brittle on the target, then a single colossal Shatter-shot scaling with the charge held and the target's missing HP (the precision execute, not a volley)* · `proposed`
- **B · Frost Terminus** *(Cold Mark)* · enemy · *the perfected mark made terminal — instantly deepen the mark to deep Frozen/Brittle, then a Shatter round so heavy it detonates the marked target and Chills whatever stands beside it from the blast* · `proposed`
- **C · The Cold Eye** *(Zero Point)* · allEnemies · *take the high angle over the whole field — Freeze and time-lock every foe at distance, drag every attack-bar to a crawl, raise a stillness ward on the party, and bank a NOX surge (the line is held frozen and out of reach)* · `proposed`
- **Zero Sum Round** *(neutral/fusion)* · enemy · *the mark, the charge, and the freeze collapse into one — paint the target, crystallize it to Frozen/Brittle in an instant, and squeeze a single absolute-zero round that Shatters it where it stands, with the cold spilling onto its neighbors* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Killcold Discipline** · *your charged shots hit harder against Frozen/Brittle and low-HP targets* · `proposed`
- **B · Frostmark Mastery** · *your marks apply a deeper Chill/Stasis and crystallize toward Frozen faster* · `proposed`
- **C · Range Discipline** · *your specials bank extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Frostsight** · *your charge loads faster and a charged shot that lands a kill refunds part of your attack-bar* · `proposed`
- **B · Markbound** · *a marked foe takes increased damage from your shots, and your mark cannot be cleansed on its first turn* · `proposed`
- **C · Stillwatch** · *your Chill / Freeze / time-lock and stillness-ward effects last longer* · `proposed`

**Set @ MNA 90**
- **A · Crystal Eye** · *when one of your shots Shatters a Frozen/Brittle target, refund part of your attack-bar and lower your charged-shot cooldown* · `proposed`
- **B · Markstill Doctrine** · *consuming a mark with a Shatter-shot reseeds a lesser mark on the target, and the splash can carry a wisp of Chill to a nearby foe* · `proposed`
- **C · Zero Point Doctrine** · *while your stillness ward holds, the party's time-locked durations don't tick down* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Rifles.** Terminus is the **freezing single-shot
  executioner**: charge → mark → Frozen/Brittle → one Shatter-shot, with a low-HP execute. Distinct
  from the SOL **Photon Vanguard** (charged radiant *beam* that pierces the line and Burns — light
  AoE, no defensive line), the ANIMA **Genewarden** (precision gene-*injection* → Infestation/mutation,
  **non-healer**, adapt-and-sustain), the QUANTA **Observer Prime** (doubled-SPD *observe → collapse*
  a target's fate — a guaranteed/determined shot, not cold), and the UMBRAXIS **Astrolancer** (gravity
  *lance* — pierce + Anchor/Drain at range). His shot is **cold** (Chill → Frozen → Brittle on one
  target) and his payoff is the **single Shatter-shot + execute** — held by no other Marksman.
- **Same-archetype — vs his pistol cousin Cryovex (NOX Dual Pistols), the closest cold cousin.** They
  share only the NOX **signature** (Stasis, Chill → Frozen → Brittle → Shatter). Cryovex is the
  **Gunslinger / volume-of-fire** seat: a **Chill-volley *spray*** that rakes the **whole line** with
  attack-bar-dragging frost rounds (`Frost Volley`, `Coldsnap`) — the ranged *applicator* that slows
  the field by sheer fire-rate. Terminus does the opposite: **one** aimed target, a **charge**, a
  **mark**, and a **single freezing Shatter-shot that executes** it. He has **no volley, no spray, no
  line-Chill-fire** — his AoE touches at most a neighbor as Shatter splash; he removes *one* priority
  target before it acts, where Cryovex buries the line under cold fire. *Single freezing execute-shot
  (mark → Shatter one target)*, **not** Cryovex's Chill-volley spray.
- **Same-attunement (#10) — NOX concept budget.** He reuses the NOX *signature* freely (Stasis / Chill
  → Frozen → Brittle → Shatter), but as a **single-shot precision execute at range**, which no other
  NOX class does. He does **not** pile onto a saturated NOX role: the **single-target control-crush**
  belongs to the Hammer (Equilibrium Ascendant), the **action-economy / time-skip flood-execute** to
  the dagger (Velestra), the **crit-shatter + frost-parry + NOX-battery** duelist to the swords
  (Rimewalker), the **AoE line-freeze + cataclysmic sweep** to the Two-Handed Sword (Worldender), the
  **mitigation-wall shadow-tank** to the Sword & Shield (Penumbral Bastion), and the **anti-caster
  energy-removal / Seal** to the Staff (Null Absolutionist). He takes **no parry, no ward-wall, no
  Seal, no melee cleave, no time-skip / attack-bar-*denial* turn-theft** (his time-lock *holds a foe at
  distance*, it does not steal the party's clock). His seat — *the charged single Shatter-shot, mark →
  freeze → execute one target at range* — is held by no other NOX class.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary SPD ← Rifle · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8 — grepped) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Rifle siblings *and* vs Cryovex | ✓ |
| Same-attunement concept budget (#10) — single-shot NOX execute only; no saturated-role pile-on | ✓ |
