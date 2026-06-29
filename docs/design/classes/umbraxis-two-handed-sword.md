# Singularity Reaver — UMBRAXIS × Two-Handed Sword

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The row, seat, the three lanes,
> and the Reaver DNA are **`from-brief`** — locked in the [Two-Handed Sword family note](./two-handed-sword-family.md)
> (dev-approved); the kit's individual abilities are `proposed`, pending a content review. Numberless
> by design; magnitudes are a later balance pass. Mechanics vocabulary (Drain / Crush / Anchored /
> event-horizon / time-dilation / Mass armor / Singularity) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28) — the UMBRAXIS suite.

## Identity (derived + DNA)

- **Class:** Singularity Reaver · **Attunement × Archetype:** UMBRAXIS × Two-Handed Sword
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** STR (← Two-Handed Sword) — a **DEF+STR**
  durable line-reaver (offense via gravity, *not* a pure tank)
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains and pulls, never made
  from nothing)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred to the caster) ·
  UMBRAXIS suite: **Crush** (escalating damage the longer it's held), **Anchored** (pinned by gravity),
  **event-horizon** (can't flee the arc), **time-dilation**, **Mass armor** (DEF → damage reduction),
  **Singularity** (pull → cluster → collapse) — all expressed across the **swept line**, not one point.

**Fantasy.** *(from family note.)* The Singularity Reaver is the **gravity line-cleaver** — a reaver
who does not wait for the line to come to it. It reaches out with gravity, **drags the whole enemy row
into the path of its arc**, and reaves clean through them in one momentum-loaded sweep. Each pass
deepens a **Crush** across every foe it cut, the swept line ripening under mounting weight until the
Reaver collapses it all into a single **Singularity** — pull the line in, hold it, and let the well
fall shut on the cluster. It holds the front on **Mass armor** and refills the well on the force it
**Drains** out of the line, but it is no wall: DEF lets it *stand in the arc* while STR drives the
sweep that clears the row. *Where the Graviton Warden (UMBRAXIS Hammer) pulls foes into a single
clustered **point** and slams it as a bruiser-tank, the Reaver pulls the line into the **sweep** and
cleaves through it — offense and reach, DEF+STR. Where The Lagrangian (UMBRAXIS daggers) **siphons**
one foe and the Abyssal Vector (UMBRAXIS swords) **redirects** a blow back, the Reaver is the
**AoE gravity-gather cleaver** — it gathers the whole line and reaves.*

### The shared Reaver DNA *(from-brief — how this is a Two-Handed Sword)*

1. **Cleave (AoE gravity arcs).** Attacks hit the whole enemy line — the arc is melee AoE, the
   line-clearer; gravity is what *gathers* the row into the path of the sweep so one arc lands on all.
2. **Reach / zone-control.** **Anchor** the line so it cannot flee the arc (**event-horizon** across
   the row): the long blade plus the gravity tether threatens and holds space, pinning the field where
   the sweep will fall.
3. **Momentum.** Slow and heavy: a long wind-up that **releases something cataclysmic** — force builds
   across the swing until the **Singularity** collapse.
4. **Opening → Finisher reuses UMBRAXIS's own Crush → Singularity chain across the LINE — no new
   resource.** The Opening *is* the escalating **Crush** laid across the whole swept line; the Finisher
   *is* the **Singularity** collapse of every Crush at once. No combo-point currency — the pressure on
   the line is the meter.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Reaving Pull** | **Gather-and-cleave** — gravity drags the whole enemy line into the arc's path, then the sweep reaves through all of it (pull-line + cleave) | **STR**, DEF, pull, AoE | front-line line-clearer | scattered or back-row foes; trash packs to gather and mow |
| **B · Crushing Arc** | **Crush ramp → collapse** — each sweep lays and deepens **Crush** across the swept line, ripening it, then collapses all of it as a **Singularity** (the AoE payoff) | STR, crush-ramp, AoE burst | escalating AoE nuke / finisher | packs that live a few rounds; ripening a whole line for one collapse |
| **C · Event Horizon** | **Durable reach/control** — **Mass armor** (DEF → damage reduction) + **Anchor** the line (**event-horizon**: nothing flees the arc), with a little **Drain** to hold the front. The durable reaver | DEF, mitigation, Anchor, light Drain | durable front-line / zone-lock | hard-hitting fields; foes that scatter or flee; holding the line through attrition |

**Build axes:** gather-cleave ↔ ripen-collapse (A↔B) · raw line-clear ↔ endurance/control (A↔C) ·
AoE-burst-payoff ↔ durable-zone-lock (B↔C). The DNA chain runs **A gathers the line into the arc and
cleaves → B lays and deepens Crush across the swept line, then collapses it (Singularity)**; **C keeps
the Reaver standing in the arc and pins the line so it cannot leave the sweep** — no new combo
resource: the "Opening" *is* UMBRAXIS's own escalating **Crush**, spread across the row.

**Cross-lane synergy:** **C Anchors the whole line so none escape the arc and holds the Reaver up → A
drags any stragglers into the path and cleaves the row → B deepens Crush across every cut foe and
collapses the lot into one Singularity.**

---

## Auto-attack *(unlaned)*

- **Reaver's Swing** · phys · allEnemies · *a slow, heavy gravity-weighted arc that grazes the enemy line* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Gathering Sweep** · phys · allEnemies · *a wide arc that drags the line a step inward as it cuts, pulling stragglers toward the sweep* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Weighted Arc** · phys · allEnemies · *a heavy sweep that seeds Crush across every foe it cuts — gravity pressure that ramps the longer it's held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Pressing Cut** · phys · allEnemies · *a sweep that deepens the Crush already laid on the swept line, tightening the ramp* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Reaver's Stance** · buff · self · *settle into a heavy guard mid-arc: gain damage reduction (Mass armor)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Drag the Line** · util · allEnemies · *a gravity tether hauls the whole back row forward into the arc's reach and Anchors them there* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Holding Arc** · phys · allEnemies · *a sustained sweep that Drains a sliver of HP from each foe it cuts while you hold the line* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Tidal Reave** · phys · allEnemies · *pull the line tight into a cluster, then cleave the whole gathered row in one arc* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Compression Sweep** · phys · allEnemies · *a sweep that crushes harder the more Crush the line already carries — pressure feeding pressure* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Falling Arc** · phys · allEnemies · *a momentum overhead that begins to collapse the held Crush on the cut line for a rising burst* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Anchor the Row** · util · allEnemies · *fix the whole line at the edge of the arc — Anchor + event-horizon: none can flee or swap rows* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Wide Gather** · util · allEnemies · *a broad gravity haul: pull every foe inward into a single sweep-band and brief Anchor* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Sapping Sweep** · mag · allEnemies · *a patient draining arc: Drain HP and a little energy from each foe cut, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Linebreaker Arc** · phys · allEnemies · *a flanking momentum cleave that gathers and reaves the whole row at once* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Deepening Crush** · phys · allEnemies · *a ramping sweep on a Crushed line; pressure tightens across the row turn over turn* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Collapsing Sweep** · phys · allEnemies · *force the line's Crush toward its threshold and shear off a chunk in the arc — a partial collapse* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Reaver's Hold** · util · allEnemies · *the whole line is fixed in your kill-band: lasting Anchor; none can reposition out of the sweep* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Gravewide Reave** · phys · allEnemies · *gather the line to a single point and reave it through with one immense arc* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Heavy Mass** · buff · self · *raise your effective mass: large damage reduction; you cannot be moved or pulled* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Total Gather** · util · allEnemies · *an overwhelming haul: pull every foe into the arc's path and Anchor the whole line for the sweep* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Peak Pressure Arc** · phys · allEnemies · *drive the line's Crush to its peak in one sweep; bonus damage as pressure crests* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Reaving Tide** · phys · allEnemies · *drag the whole enemy line into the arc and cleave it in one sweeping pass* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Lay the Crush** · phys · allEnemies · *a heavy sweep that stamps deep Crush across the entire line, priming the collapse* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Collapse the Line** · phys · allEnemies · *collapse all held Crush on the swept line at once: an AoE burst scaling with the gravity pressure built* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Maw of the Arc** · util · allEnemies · *open a gravity throat at the arc's edge: pull all foes in, Anchor them, and seal the escape (event-horizon)* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Pull and Reave** · phys · allEnemies · *haul the scattered line into one sweep-band, then reave the gathered row for heavy AoE* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Wall of Mass** · buff · self · *plant immovably in the arc: heavy damage reduction and a slow Drain off every foe still in reach* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Eventfall Sweep** · phys · allEnemies · *a momentum cleave whose gravity wake keeps dragging the line inward as it lands* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Grind the Row** · phys · allEnemies · *a sustained crush across the line: damage ramps each turn the row stays Anchored under the arc* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Singularity Reave** · phys · allEnemies · *gather the whole Crushed line to a point and run the arc through it: a colossal collapsing sweep* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Tidehold Line** · util · allEnemies · *time-dilate the Anchored line to a crawl: the whole row's tempo is dragged far back while Crush keeps tightening* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Sweep of the Well** · phys · allEnemies · *a vast arc that pulls every foe through the well and out the other side, cleaving the gathered line* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Drink the Line** · mag · allEnemies · *a heavy draining sweep: steal HP and a share of each foe's attack power, healing you and banking UMBRAXIS* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Horizon Gather** · util · allEnemies · *fold the field inward: pull the whole line to the arc and bind it in an event-horizon none can cross* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **B · Crush to Collapse** · phys · allEnemies · *deepen the line's Crush to its threshold, then collapse the whole row in one sweep — a chained AoE burst* · cost **high UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · The Whole Arc Falls** · phys · allEnemies · *let the momentum of the entire wind-up land at once: a cataclysmic sweep that collapses every held Crush across the line* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Mass of the Reaver** · buff · self · *become a fixed mass in the line's path: capped incoming damage and immunity to all CC and displacement, Draining attackers throughout* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Gather the Fallen** · phys · allEnemies · *one final immense haul-and-reave: pull every surviving foe into the arc and shear the gathered line through* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · The Standing Reave** · buff · self · *hold the arc unbroken: heavy lasting damage reduction, an unbreakable Anchor on the line, and a steady Drain off all it cannot flee* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · The Long Reave** *(Reaving Pull)* · allEnemies · *gather the entire field into one sweeping path and cleave the whole gathered line in a single annihilating arc* · `proposed`
- **B · Collapse the Field** *(Crushing Arc)* · allEnemies · *drive the line's Crush past every threshold and collapse it all at once — a battlefield-wide Singularity that crushes every foe together* · `proposed`
- **C · The Unfleeing Line** *(Event Horizon)* · allEnemies · *seal the field in an event-horizon — Anchor every foe so none can leave the arc, while Mass armor and a draining well keep the Reaver standing through the sweep* · `proposed`
- **Reave the Singularity** *(neutral/fusion)* · allEnemies · *pull, hold, and collapse as one — gather the whole line into the well, ripen its Crush to the limit, then reave the collapsing Singularity through every foe at once* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Reaping Pull** · *your gathers drag foes in from farther, and from the back row* · `proposed`
- **B · Mounting Arc** · *your Crush ramps faster across a swept line* · `proposed`
- **C · Mass of the Line** · *your damage reduction (Mass armor) is higher* · `proposed`

**Set @ MNA 60**
- **A · Sweeping Reach** · *your cleaves reach wider and gather more of the line at once* · `proposed`
- **B · Critical Pressure** · *your collapse damage scales harder with the Crush stacked across the line* · `proposed`
- **C · Unfleeing** · *foes you've Anchored to the arc cannot cleanse it or flee* · `proposed`

**Set @ MNA 90**
- **A · Accreting Sweep** · *each foe gathered into your arc adds to that sweep's damage* · `proposed`
- **B · Crush Cascade** · *when your collapse fells a foe, its Crush spills onto the rest of the line* · `proposed`
- **C · Toll of the Arc** · *a share of all damage you take is Drained back to you as healing while you hold the line* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Two-Handed Swords (the Reaver family).** The Singularity
  Reaver is the **gravity line-gatherer**: it *pulls the whole enemy row into the arc's path* and reaves
  through it, ramping **Crush** across the swept line into a **Singularity** collapse. Distinct from the
  NOX **Worldender** (freeze the line → shatter the arc, raw STR+STR power), the SOL **Starbreaker**
  (fast radiant cleave that *spreads Burn* down the line), the ANIMA **Apex Dominion** (contagion arcs +
  self-evolution, non-healer), and the QUANTA **Timeline Breaker** (momentum/time — collapse the line's
  *fate*). No one else's sweep *gathers the row with gravity first*.
- **Same-archetype — vs its Hammer cousin the Graviton Warden (UMBRAXIS Hammer).** This is the family's
  designed axis: the **Hammer is the POINT, the Greatsword is the ARC.** The Graviton Warden pulls foes
  into a single clustered **point** and **slams** it as a durable **bruiser-tank** (DEF+STR, but
  single-impact). The Singularity Reaver pulls the line into the **SWEEP** and **cleaves through** it —
  the gravity-gather is in service of a *wide arc that clears the row* (offense and reach), and the
  Crush→Singularity payoff is laid and collapsed *across the whole line*, not driven into one foe. The
  Reaver is a durable line-reaver, not a point-slam bruiser.
- **Same-attunement (#10) — UMBRAXIS concept budget.** It reuses the UMBRAXIS *signature* (Drain) and
  the ratified suite (Crush · Anchored · event-horizon · time-dilation · Mass armor · Singularity)
  freely — the shared identity — but does **not** pile onto a saturated UMBRAXIS *role*. The
  **single-target drain-siphon skirmisher** is The Lagrangian (daggers); the **parry-and-redirect
  counter-duelist** is the Abyssal Vector (swords); the **pure DEF+DEF hyper-tank** is the Tidal
  Sovereign (S&S); the **back-line zone-control artillery** is The Singularitan (staff); the
  **single-target point-slam bruiser-tank** is the Graviton Warden (hammer). The Reaver's seat — the
  **AoE gravity-gather *cleaver*** that drags the line into a momentum sweep and collapses its Crush
  across the row — is held by no other UMBRAXIS class. (No ANIMA-style party-healing; ledger #16 is not
  in scope, but honored — this is a non-healer.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary STR ← Two-Handed Sword · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS (conservation) | ✓ |
| Provenance on every entry (row/lanes/seat/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Reaver siblings *and* from the Graviton Warden | ✓ |
| Same-attunement concept budget (#10) — reuses UMBRAXIS signature/suite only; no saturated-role pile-on | ✓ |
