# Orbitalist — UMBRAXIS × Dual Pistols

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The row, seat, the three lanes,
> and the Gunslinger DNA are **`from-brief`** — locked in the [Dual Pistols family note](./dual-pistols-family.md)
> (dev-approved); the kit's individual abilities are `proposed`, pending a content review. Numberless
> by design; magnitudes are a later balance pass. Mechanics vocabulary (Drain / Crush / Anchored /
> event-horizon / time-dilation / Mass armor / Singularity) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (Dara, 2026-06-28) — the UMBRAXIS suite.

## Identity (derived + DNA)

- **Class:** Orbitalist · **Attunement × Archetype:** UMBRAXIS × Dual Pistols
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** AGI (← Dual Pistols) — a **DEF+AGI**
  back-line gravity gunner (volume of fire at range; DEF gives it staying power in the back row, AGI
  the trick-shot finesse to curve and crit)
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/steals, never made
  from nothing; the Orbitalist leans hard on **drain** to keep the pool fed at range)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred to the caster) ·
  UMBRAXIS suite: **Crush** (escalating damage the longer it's held), **Anchored** (pinned by
  gravity), **event-horizon** (can't flee / swap rows), **time-dilation**, **Mass armor** (DEF →
  damage reduction), **Singularity** (pull → cluster → collapse) — all **applied by fire**, sprayed
  across the line by gravity-curved rounds rather than driven into one point.

**Fantasy.** *(from family note.)* The Orbitalist fires rounds that **bend in flight** — each shot
curves along a gravity gradient, and the more it fires the more it **hauls the whole enemy line into
a single kill-box**, then keeps pouring fire into the cluster it made. Where the rifle's Astrolancer
sinks *one* charged gravity-lance into a single target, the Orbitalist is the **curving cluster-volley
gunner**: it does not pick a target, it *gathers* them — twin barrels spraying curved rounds that
pull the row together, **Drain** rounds bleeding the line to refill the well from the back, and
**Anchor** rounds nailing fleeing or back-row foes in place so nothing leaves the kill-box. It is
fragile up close like every gunner — so it answers fragility the gunner's way, **at range**, but it
buys extra margin on **Mass armor** and refills the pool with **Drain** rather than purely kiting.
Volume of fire, curved by gravity, gathered into one grave.

### The shared Gunslinger DNA *(from-brief — how this is a Dual Pistols)*

1. **Double-tap → two Drain applications.** Twin barrels fire two rounds per action → **two Drain
   checks**, two chances to bleed the line and bank UMBRAXIS. Volume, not the single decisive shot —
   the conservation economy spread thin across many rounds.
2. **Volume / rhythm.** Sustained, cheap fast fire builds the cluster and the held pressure; the
   spray *is* the meter. The kill-box tightens shot after shot until the finisher collapses it.
3. **Back-line mobility (fragility answer = stay at range).** It works the back row — reposition,
   quickdraw, kite — and never needs to enter melee to land its gravity; the rounds reach out and
   pull for it. (Margin topped up by Mass armor + Drain, but the seat is *don't get hit*.)
4. **Reuse UMBRAXIS's own Crush → Singularity chain — applied by fire, no new resource.** The
   **clustering volley** lays and deepens **Crush** across the gathered line as it fires (the
   Opening); the **Singularity** finishers collapse all that held Crush at once (the payoff). No
   combo-point currency — the pressure on the kill-box is the meter, stamped in by the spray.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Orbital Volley** *(lead)* | **Gravity-curved cluster-volley** — curving rounds that **pull/cluster** the whole line into a kill-box, then a curving spray reaves the gathered row; lays and collapses **Crush** across the cluster | **AGI**, DEF, pull, AoE volume | back-line line-gatherer / AoE applicator | scattered or back-row packs to haul together and mow; ripening a whole line for a collapse |
| **B · Drain Round** | **Conservation sustain at range** — **Drain** rounds (double-tap = two Drain checks) bleed the line, healing you and refilling the party's UMBRAXIS from the back row; the battery that never closes to melee | DEF, Drain, lifesteal, economy | ranged self-sustain + party UMBRAXIS battery | long attrition fights; a UMBRAXIS-stacked party to feed; little outside healing |
| **C · Anchor Shot** | **Range lockdown** — **Anchor** / **event-horizon** rounds nail fleeing or back-row foes in place; **time-dilation** drags their tempo so nothing leaves the kill-box | AGI, DEF, Anchor, deny-escape | zone-lock / position control at range | fleeing, scattering, or back-line foes; pinning the cluster so A and B can work it |

**Build axes:** cluster-volume ↔ drain-sustain (A↔B) · raw AoE fire ↔ lockdown-control (A↔C) ·
deny-escape ↔ drain-economy (B↔C). The DNA chain runs **C nails the line in the kill-box (Anchor +
event-horizon) → A curves the cluster tight and sprays Crush across it, then collapses it
(Singularity) → B drains the gathered row to refill the well from the back** — no new combo
resource: the "Opening" *is* UMBRAXIS's own escalating **Crush**, stamped across the cluster by the
volley.

**Cross-lane synergy:** **C Anchors the row so none flee the kill-box → A hauls any stragglers in,
curves the spray across the cluster, and collapses its Crush → B's Drain rounds bleed the held line
to refill the party's UMBRAXIS so the spray never stops.**

---

## Auto-attack *(unlaned)*

- **Twin Tap** · phys · enemy · *two gravity-curved rounds in quick succession — twin-shot, two Drain checks* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Curveshot** · phys · allEnemies · *a curving spray that bends inward as it cuts the line, dragging stragglers a step toward the kill-box* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Drain Spray** · phys · enemy · *a double-tap; both rounds Drain a sliver of HP to you, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Veinshot** · mag · enemy · *a draining round that bleeds HP and a little of the foe's energy to you* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Pin Round** · util · enemy · *a heavy gravity-loaded round that Anchors the target where it stands (rooted)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Closing Spiral** · phys · allEnemies · *a curving volley that seeds Crush across the line — gravity pressure that ramps the longer it's held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Tether Round** · util · enemy · *a round trailing a gravity line: pull a fleeing or back-row foe toward the kill-box and Anchor it* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Gather Fire** · util · allEnemies · *a wide curving haul: pull the whole row inward into one tight kill-box + brief Anchor* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Sapping Burst** · mag · enemy · *a draining double-tap: Drain HP and a share of the foe's energy to you* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Two-Barrel Drain** · mag · enemy · *twin barrels; each round Drains, banking a surge of UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Frame Drag Round** · util · enemy · *time-dilate a round's wake: the Anchored foe's attack-bar fills slower while pinned* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Compaction Round** · phys · allEnemies · *a curving spray that crushes harder the more Crush the cluster already carries — pressure feeding pressure* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Stake Shot** · util · enemy · *drive a deep gravity stake: lasting Anchor + event-horizon — the foe cannot flee or swap rows* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Inswing Volley** · phys · allEnemies · *a flanking curved barrage that gathers the line tighter as it rakes across the cluster* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **B · Bloodhail** · mag · allEnemies · *a draining hail across the whole kill-box: Drain a little HP from each clustered foe, banking UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Heavy Drain Round** · mag · enemy · *a slow heavy round: Drain HP and a share of the foe's attack power to yourself* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Snare Round** · util · allEnemies · *a spread of gravity snares: the whole clustered line is Anchored; none can reposition out of the kill-box* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Peak Spread** · phys · allEnemies · *force the cluster's Crush toward its threshold; bonus damage as pressure crests across the row* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **C · Orbit-Lock Round** · util · enemy · *fix the target in a stable orbit around the kill-box: absolute Anchor, no escape* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Killbox Volley** · phys · allEnemies · *the showcase spray: haul every foe into one point and rake the gathered cluster with a curving barrage* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Bleeding Volley** · mag · allEnemies · *a draining barrage across the cluster; each round bleeds the line and overflows a UMBRAXIS surge into the pool* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Gathering Storm** · util · allEnemies · *a curving fusillade that hauls the whole line into one tight kill-box and Anchors it for the spray* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Sapping Rounds** · mag · enemy · *a draining double-tap that steals a large chunk of the target's HP to you* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Drink the Spread** · mag · allEnemies · *a draining spray across the clustered line: Drain HP from every foe in the kill-box, healing you* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Eventpin Shot** · util · enemy · *nail the foe with an event-horizon round: Anchor + it cannot flee, swap rows, or be freed for several turns* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Riddling Curve** · phys · allEnemies · *a sustained curving barrage that lays and deepens Crush across the whole gathered cluster, priming the collapse* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Eventpin Net** · util · allEnemies · *a net of gravity rounds across the row: Anchor every clustered foe and seal the escape (event-horizon)* · cost **med UMBRAXIS** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Cluster Hail** · phys · allEnemies · *collapse all held Crush on the kill-box in one raking spray: an AoE burst scaling with the gravity pressure built* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Drain Fan** · mag · self · *for a few turns every round you fire Drains, and a share of all your damage returns as healing — you live on what the spray bleeds* · cost **med UMBRAXIS** · cd **long** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Bleed the Spray** · mag · allEnemies · *a heavy draining barrage: steal HP and a share of each clustered foe's attack power, healing you and banking a large UMBRAXIS surge* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Caught at Range** · util · allEnemies · *time-dilate the Anchored kill-box: the whole cluster's tempo is dragged far back while the Crush keeps tightening* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Kill-Box** · phys · allEnemies · *gather the whole Crushed line to a single point and pour a curving barrage through it: a colossal collapsing volley* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Stillpoint Round** · util · allEnemies · *a round that opens a still point at the kill-box's center: every foe Anchored and held, unable to advance on the party* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Crush Spread** · phys · allEnemies · *deepen the cluster's Crush to its threshold, then collapse the whole kill-box in one raking pass — a chained AoE burst* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **B · Siphon Storm** · mag · allEnemies · *a draining tempest across the cluster: bleed every foe heavily, healing you and refilling the party's UMBRAXIS* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Suck Dry** · mag · enemy · *empty a fleeing or low-HP foe in a draining burst; massive vs the wounded, refunding a large UMBRAXIS surge* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Worldpin Volley** · util · allEnemies · *fold the field's edges inward: the whole line is bound in an event-horizon none can cross, Anchored fast for the kill* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Inward Volley** · phys · allEnemies · *one final immense haul-and-rake: pull every surviving foe into the kill-box and collapse all its held Crush at once* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Pinpoint Net** · util · allEnemies · *an absolute lattice of gravity rounds: long, uncleansable Anchor + event-horizon across the entire line, with a steady Drain off all it cannot flee* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · The Whole Line Falls** *(Orbital Volley)* · allEnemies · *haul the entire field into one kill-box and pour a curving barrage through it — gather every foe, ripen the Crush to the limit, and collapse the cluster in one annihilating volley* · `proposed`
- **B · The Long Siphon** *(Drain Round)* · allEnemies · *open a wound in the whole line that will not close — every round drains the cluster relentlessly across the fight, healing you and refilling the party's UMBRAXIS with each pulse* · `proposed`
- **C · Nothing Leaves Range** *(Anchor Shot)* · allEnemies · *seal the field — Anchor every foe in an event-horizon none can cross, time-dilate the line to a crawl, and hold the whole kill-box helpless under your fire* · `proposed`
- **Gravity's Volley** *(neutral/fusion)* · allEnemies · *pull, pin, and pour as one — gather the whole line into the kill-box, bind it in an event-horizon, bleed it dry to fuel the fire, then collapse its Crush in a single curving barrage* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Curved Aim** · *your curving rounds pull foes in from farther, and from the back row* · `proposed`
- **B · Leeching Barrels** · *your rounds Drain more HP to you* · `proposed`
- **C · Pull Discipline** · *your Anchors and event-horizons last longer* · `proposed`

**Set @ MNA 60**
- **A · Spread the Pull** · *your curving volleys reach wider and gather more of the line into the kill-box at once* · `proposed`
- **B · Banked Barrels** · *a share of all damage you take is Drained back to you as healing, and overflows into the party's UMBRAXIS* · `proposed`
- **C · Frame-Lock** · *while a foe is Anchored, your time-dilation also drags its attack-bar* · `proposed`

**Set @ MNA 90**
- **A · Killbox Master** · *your collapse volleys scale harder with the Crush stacked across the cluster* · `proposed`
- **B · Bottomless Barrel** · *your Drains restore more, and a portion of every round's Drain overflows into the party's UMBRAXIS* · `proposed`
- **C · Inescapable Spread** · *foes you've Anchored to the kill-box cannot cleanse it or flee* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Dual Pistols (the Gunslinger family).** The Orbitalist is
  the **gravity cluster-volley gunner**: curving rounds that *haul the whole line into a kill-box* and
  spray Crush across it into a **Singularity** collapse, with **Drain** rounds feeding the well from
  the back. Distinct from the SOL **Gunslinger Solaris** (doubled-AGI radiant crit-spray, pure
  offense), the NOX **Cryovex** (Chill-volley that freezes the line), the ANIMA **Sporecaster**
  (Infestation spore-spray, non-healer), and the QUANTA **Entropic Echo** (ricocheting probability
  echo-shots). No one else's volley *gathers the row with gravity first* and *bleeds it to refill the
  pool*.
- **Same-archetype — vs its Rifle cousin the Astrolancer (UMBRAXIS Rifle).** This is the ranged pair's
  designed axis: the **Rifle is THE ONE SHOT, the Pistols are VOLUME OF FIRE.** The Astrolancer charges
  *one* piercing gravity-**lance** into a single target (precision, mark, first-strike). The Orbitalist
  does the opposite — it *sprays* curved rounds that **cluster the line** and pours volume into the
  kill-box it made; its gravity is a *gathering curve*, not a single piercing lance, and its Crush →
  Singularity is laid and collapsed *across the whole cluster*, not driven into one mark. Volume that
  gathers, not the precision lance that pierces.
- **Same-attunement (#10) — UMBRAXIS concept budget.** It reuses the UMBRAXIS *signature* (Drain) and
  the ratified suite (Crush · Anchored · event-horizon · time-dilation · Mass armor · Singularity)
  freely — the shared identity — but does **not** pile onto a saturated UMBRAXIS *role*. The
  **single-target drain-siphon skirmisher** is The Lagrangian (daggers); the **parry-and-redirect
  counter-duelist** is the Abyssal Vector (swords); the **AoE gravity-gather melee cleaver** is the
  Singularity Reaver (greatsword); the **point-slam bruiser-tank** is the Graviton Warden (hammer);
  the **DEF+DEF hyper-tank** is the Tidal Sovereign (S&S); the **back-line zone-control artillery**
  *caster* is The Singularitan (staff). The Orbitalist's seat — the **back-line gravity
  cluster-*volley gunner*** that curves twin-barrel fire to gather the line and bleed it dry — is held
  by no other UMBRAXIS class. (Its closest neighbor, the staff Singularitan, is a *VIT caster* placing
  *wells*; the Orbitalist is an *AGI gunner* spraying *curved rounds* — different fantasy, different
  stat, different cadence.) (No ANIMA-style party-healing; ledger #16 is not in scope, but honored —
  this is a non-healer, self-sustain + battery only.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary AGI ← Dual Pistols · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS (conservation) | ✓ |
| Provenance on every entry (row/lanes/seat/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Gunslinger siblings *and* from the Astrolancer | ✓ |
| Same-attunement concept budget (#10) — reuses UMBRAXIS signature/suite only; no saturated-role pile-on | ✓ |
