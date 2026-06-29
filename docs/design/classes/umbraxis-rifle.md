# Astrolancer — UMBRAXIS × Rifle

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The row, seat, the three lanes,
> and the Marksman DNA are **`from-brief`** — locked in the [Rifle family note](./rifle-family.md)
> (dev-approved); the kit's individual abilities are `proposed`, pending a content review. Numberless
> by design; magnitudes are a later balance pass. Mechanics vocabulary (Drain / Crush / Anchored /
> event-horizon / time-dilation / Mass armor / Singularity) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28) — the UMBRAXIS suite.

## Identity (derived + DNA)

- **Class:** Astrolancer · **Attunement × Archetype:** UMBRAXIS × Rifle
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** SPD (← Rifle) — a **DEF+SPD** durable,
  first-striking sniper (range-control via mass, *not* a glass back-liner)
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/steals, never made
  from nothing; the Astrolancer leans hard on **Drain** to refill the pool from range)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred to the caster) ·
  UMBRAXIS suite: **Crush** (escalating damage the longer it's held), **Anchored** (pinned by
  gravity), **event-horizon** (can't flee / swap rows), **time-dilation** (slowed near the mass),
  **Mass armor** (DEF → damage reduction), **Singularity** (the decisive collapse-shot).

**Fantasy.** *(from family note.)* The Astrolancer is the **gravity-lance sniper** — it does not
spray the line, it draws one perfect bead and looses a single **piercing gravity-shot** that runs
the whole rank through and **Anchors** whatever it pins. It opens the fight first (SPD), then works
at distance: it **marks** a target with a gravity tag and bleeds it from afar (Drain) or grinds
mounting weight into it (Crush), holding the field at arm's length on **Anchor / event-horizon** so
nothing closes — and when the mark has ripened, it reuses UMBRAXIS's own **Crush → Singularity**
chain *as the decisive shot*: a single collapsing lance that detonates all the gravity it has loaded
into the target. It is no fragile gunner: **DEF / Mass armor** lets the Astrolancer stand its ground
and keep the angle, refilling the well on the force it **Drains** out of whatever it has marked.
*Where the Pistols' **Orbitalist** sprays a curving CLUSTER-volley that pulls the line into a
kill-box (volume), the Astrolancer fires the single piercing precision **LANCE** (the one shot) —
it does not cluster a spray, it runs one line through and collapses one mark.*

### The shared Marksman DNA *(from-brief — how this is a Rifle)*

1. **The aimed shot.** Single-target precision burst — the piercing **lance**, not volume. One
   round, drawn and loosed; gravity makes it pierce the whole rank along the line of fire rather than
   spraying across it.
2. **Charge / aim.** A wind-up that loads a bigger shot — the ranged cousin of momentum: the
   Astrolancer steadies the lance and loads gravity into the round before it looses, the heavier the
   draw the deeper it pierces and Anchors.
3. **The mark.** Designate a target — a gravity tag that the Astrolancer then **Drains** and
   **Crushes** from range, and that the decisive collapse-shot resolves against (bonus / collapse on
   the marked foe).
4. **First-strike / range-control.** SPD priority to open from max range, then keep distance:
   **Anchor / event-horizon** so the marked foe cannot close or flee, and **Mass armor** to hold the
   angle. The fragility answer is *stand and pin at range*, not kite-and-pray.
5. **Opening → Finisher reuses UMBRAXIS's own Crush → Singularity chain — no new resource.** The
   Opening *is* the **mark** loaded with escalating **Crush** (and bled with **Drain**); the Finisher
   *is* the **Singularity** collapse-shot that detonates all the loaded gravity into the marked
   target. No combo-point currency — the pressure on the mark is the meter.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Gravity Lance** *(lead)* | **The charged piercing shot** — load gravity into a single round that pierces the line and **Anchors** what it hits; the precision burst and the Singularity collapse-shot live here | **SPD**, charge/aim, single-target burst, Anchor-on-hit | front-loading single-target sniper | a priority target to pin and run through; first-strike openers; charge-rewarding gear |
| **B · Lance Mark** | **Mark → Drain / Crush from range** — tag a target, then bleed it with **Drain** (conservation sustain / pool-feed) and grind **Crush** into it from afar; the decisive shot resolves the mark | SPD, Drain, Crush-ramp, mark | ranged attrition / resource battery | bosses and long fights; a party that needs the UMBRAXIS pool fed from the back line |
| **C · Orbit Hold** | **Range-control + Mass armor** — **Anchor / event-horizon** to keep foes off the angle, **time-dilation** to drag a closing foe, and **Mass armor** to hold the ground; the durable marksman | DEF, Anchor/event-horizon, mitigation | zone-lock / durable back-line anchor | foes that rush or flee the sniper; the back line needs a sturdy, self-holding angle |

**Build axes:** charged-burst ↔ ranged-attrition (A↔B) · raw single-shot ↔ endurance/lockdown (A↔C)
· bleed-and-pressure ↔ deny-the-approach (B↔C). The DNA chain runs **B marks the foe and loads it
(Drain + ramping Crush) → A collapses the loaded mark with the Singularity lance (the decisive
shot)**; **C keeps the foe Anchored on the angle and the Astrolancer standing** — no new combo
resource: the "Opening" *is* the marked target loaded with UMBRAXIS's own escalating **Crush**, and
the payoff *is* **Singularity**.

**Cross-lane synergy:** **C Anchors the foe at distance so it cannot close → B marks it and grinds
Drain + Crush into the held target → A looses the charged collapse-lance that detonates all the
loaded gravity at once.**

---

## Auto-attack *(unlaned)*

- **Drawn Bead** · phys · enemy · *a steadied single round drawn down the gravity line; a sliver of weight Drains back to you* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Sighting Lance** · phys · enemy · *a quick aimed round that pierces a step down the line and lightly Anchors what it hits* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Mark Decay** · util · enemy · *tag a target with a gravity mark and seed a sliver of Crush — pressure that ramps the longer it's held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Sighted Drain** · mag · enemy · *a draining round on the marked foe: Drain a little HP to you from range* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Far Anchor** · util · enemy · *a heavy round that roots a closing foe where it stands (Anchor) before it reaches the angle* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Drawn Aim** · buff · self · *steady the lance: load gravity into your next shot for deeper pierce and a firmer Anchor (charge)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Hold Pattern** · buff · self · *settle behind your mass: gain damage reduction (Mass armor) while you keep the angle* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Plumbline** · phys · enemy · *a true vertical lance that runs the whole rank through, Anchoring the foe it pins* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Deepening Round** · mag · enemy · *a round that deepens the held Crush on a marked foe, tightening the ramp* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Drawn Drain** · mag · enemy · *a patient draining shot on the mark: Drain HP and a little of the foe's energy, banking UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Bias the Orbit** · util · enemy · *bend the foe's path: time-dilate a closing target so its attack-bar fills slower while Anchored* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Loaded Gravity** · phys · enemy · *fire the charged lance: a heavy piercing shot whose damage scales with how long you steadied the draw* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Sentinel Hold** · util · enemy · *hold the line at distance — Anchor + event-horizon: the marked foe cannot flee or swap rows* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Lensed Shot** · phys · enemy · *bend the round's flight through a gravity lens to strike from an unguarded angle; bonus vs an Anchored foe* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Marked and Bled** · mag · enemy · *heavy Drain on the mark: steal HP and a share of the foe's attack power to you* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Pressing Round** · mag · enemy · *a sustained crushing shot on the mark; Crush ramps a touch each turn the foe stays tagged* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Far Mass** · buff · self · *raise your effective mass at the angle: large damage reduction; you cannot be moved or pulled off your line* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Heavier Round** · phys · enemy · *load the densest round in the magazine: a piercing shot that Anchors hard and seeds deep Crush on impact* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Sightlock** · util · enemy · *fix the foe in your scope's well: deepen Anchor + event-horizon; it cannot reposition out of the line of fire* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Closing Lance** · phys · enemy · *force the charge to its peak and loose: bonus damage as the loaded gravity crests, piercing and Anchoring* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Drain Mark** · mag · enemy · *a deep draining finisher on the mark; restores you for more the lower the foe's HP, banking a surge of UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Gravewell Lance** · phys · enemy · *a charged piercing shot that runs the rank through and snares the pinned foe in a gravity grave: heavy damage + Anchor* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Marked for the Well** · util · enemy · *brand a target with a deep gravity mark: it takes ramping Crush and feeds your Drains for several turns* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Bleed at Range** · mag · enemy · *open a draining wound on the mark from afar — Drain that ramps each turn the foe stays tagged, healing you and banking UMBRAXIS* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Hold the Distance** · util · enemy · *fold space between you and a closing foe: deep Anchor + event-horizon so it cannot reach the angle* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Lance the Mark** · phys · enemy · *collapse the marked foe's loaded Crush in one piercing shot: burst scaling with the gravity pressure built* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Settled Lance** · buff · self · *plant immovably at your angle: heavy Mass armor and a slow Drain off whatever you've marked* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Star-Drawn** · phys · enemy · *steady a long, perfect draw, then loose a colossal piercing lance through the rank; guaranteed deep Anchor on the foe it pins* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Drained Mark** · mag · enemy · *a heavy draining shot on the mark: steal a large chunk of its HP and a share of its energy to you* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Crushing Round** · mag · enemy · *a sustained crushing shot: damage ramps each turn the marked foe stays Anchored under your fire* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Fixed at Range** · util · enemy · *time-dilate the foe to a crawl: its tempo is dragged far back while Anchored, walled off the angle* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Pinning Shot** · phys · enemy · *a piercing lance that nails the foe to the field — long, uncleansable Anchor + a burst on the loaded Crush* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Long Drain** · mag · enemy · *bleed the marked foe across many turns — deep, uncleansable Drain that feeds you every tick from range* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Apastron** · phys · enemy · *strike from the farthest point of the orbit — a maximal-charge piercing shot, enormous vs an Anchored / Crushed foe* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **B · Mark of Mass** · util · enemy · *the mark becomes a gravity well of its own: ramping Crush + event-horizon, and it bleeds Drain to you each turn it lives* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Bead on the Mark** · mag · enemy · *draw and resolve the perfect bleed: catastrophic Drain on the marked foe, healing you greatly and refunding a large UMBRAXIS surge* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Sentinel's Orbit** · buff · self · *become a fixed point at the angle: capped incoming damage and immunity to all CC and displacement, Draining attackers throughout* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Erasing Lance** · phys · enemy · *collapse a fully-ripened mark into one annihilating piercing shot — a near-lethal Singularity-lance on the Anchored, Crushed target* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · The Held Field** · util · allEnemies · *warp the whole field back from your line: Anchor and event-horizon every foe so none can close on the back row* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · The Falling Star** *(Gravity Lance)* · enemy · *draw the longest possible charge and loose a single collapsing lance — a Singularity-shot that pierces the rank and annihilates the marked foe, scaling with every Crush stack loaded* · `proposed`
- **B · Bled to the Mark** *(Lance Mark)* · enemy · *open a mark that will not close — Drain the marked foe relentlessly across the fight, healing you and refilling the party's UMBRAXIS with every pulse while Crush grinds it down* · `proposed`
- **C · The Unmoving Star** *(Orbit Hold)* · allEnemies · *fix the whole field in orbit around your angle — Anchor and event-horizon every foe so none can close, while Mass armor and a draining well keep the Astrolancer standing* · `proposed`
- **Lodestar** *(neutral/fusion)* · enemy · *become the field's one fixed point — mark, pin, and bleed the foe, then loose the charged Singularity-lance that collapses all the loaded gravity into it at once* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Steady Draw** · *the longer you charge a shot, the deeper it pierces and the harder it Anchors* · `proposed`
- **B · Tagging Bias** · *your marks last longer and the Crush they carry ramps faster* · `proposed`
- **C · Heavy Stance** · *your damage reduction (Mass armor) is higher while you hold your angle* · `proposed`

**Set @ MNA 60**
- **A · Long Sightline** · *your piercing shots reach the back row, and bonus vs an Anchored foe rises* · `proposed`
- **B · Bleed the Mark** · *your Drains on a marked foe restore more, and a portion overflows into the party's UMBRAXIS* · `proposed`
- **C · Inescapable Angle** · *foes you've Anchored cannot cleanse it or close the distance* · `proposed`

**Set @ MNA 90**
- **A · Collapse Point** · *your charged lances can shear very low-HP Anchored foes apart (execute)* · `proposed`
- **B · Bottomless Mark** · *the marked foe's Crush deepens every time you Drain it, feeding the collapse-shot* · `proposed`
- **C · Fixed Star** · *while at high Mass armor, you cannot be moved off your line and the force you absorb overflows into the party's UMBRAXIS* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Rifles (the Marksman family).** The Astrolancer is the
  **gravity-lance sniper**: it charges a single *piercing* round that **Anchors** what it pins, marks
  a foe to **Drain / Crush** from range, and reuses UMBRAXIS's **Crush → Singularity** chain *as the
  decisive collapse-shot*. Distinct from the SOL **Photon Vanguard** (charged radiant *beam* —
  pierce + Burn/Blind, pure offense), the NOX **Terminus** (freezing *kill-shot* — mark → Frozen →
  Shatter, the execute), the ANIMA **Genewarden** (precision *gene-injection* — mark → Infestation /
  mutation, non-healer), and the QUANTA **Observer Prime** (doubled-SPD *observe → collapse a target's
  fate*). No one else's lance *Anchors and gravity-bleeds* the mark, and no one else's payoff is a
  **Singularity** collapse-shot.
- **Same-archetype — vs its Pistols cousin the Orbitalist (UMBRAXIS Dual Pistols).** This is the
  family's designed axis: **Pistols = VOLUME OF FIRE; Rifle = THE ONE SHOT.** The Orbitalist sprays a
  curving **cluster-volley** — many gravity-curved rounds that *pull the line into a kill-box* and
  drain it as an applicator (AGI-secondary, volume). The Astrolancer fires the single piercing
  precision **LANCE** (SPD-secondary, the one shot): it does not cluster a spray, it runs *one line*
  through, Anchors *one mark*, and collapses *one target* with the Singularity-shot. Volume-cluster
  vs precision-lance — the same split that separates every Pistols/Rifle pair.
- **Same-attunement (#10) — UMBRAXIS concept budget.** It reuses the UMBRAXIS *signature* (Drain) and
  the ratified suite (Crush · Anchored · event-horizon · time-dilation · Mass armor · Singularity)
  freely — the shared identity — but does **not** pile onto a saturated UMBRAXIS *role*. The
  **single-target drain-siphon skirmisher** is The Lagrangian (daggers); the **parry-and-redirect
  counter-duelist** is the Abyssal Vector (swords); the **pure DEF+DEF hyper-tank** is the Tidal
  Sovereign (S&S); the **back-line zone-control well-artillery** is The Singularitan (staff); the
  **point-slam bruiser** is the Graviton Warden (hammer); the **AoE gravity-gather cleaver** is the
  Singularity Reaver (greatsword). The Astrolancer's seat — the **first-striking, charge-and-pierce
  gravity sniper** that *marks one target, bleeds and crushes it at range, and collapses it with a
  single Singularity-lance* — is held by no other UMBRAXIS class. (No ANIMA-style party-healing;
  ledger #16 is honored — this is a non-healer, self-sustain via Drain only.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary SPD ← Rifle · threshold = milestone | ✓ |
| Economy: specials generate-only (lean to Drain) · sig/ult cost-only · auto = minor trickle · all UMBRAXIS (conservation) | ✓ |
| Provenance on every entry (row/lanes/seat/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Rifle siblings *and* from the Orbitalist | ✓ |
| Same-attunement concept budget (#10) — reuses UMBRAXIS signature/suite only; no saturated-role pile-on | ✓ |
