# Voidstar Exarch — UMBRAXIS × Spellblade

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The class fantasy, seat (the
> **gravity battle-mage** — drain with the blade, collapse with gravity-magic; the durable front-line
> caster), the three locked lanes (**A · Voidblade / B · Gravity Casting / C · Eventblade**), and the
> Runeblade DNA are **`from-brief`** — the LOCKED row + sketch in the
> [Spellblade family note](./spellblade-family.md); the kit's individual abilities are `proposed`.
> Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Drain · Crush · Anchored · event-horizon · time-dilation · Mass armor ·
> Singularity: pull → cluster → collapse · the **conservation** economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (UMBRAXIS suite). **Drain** is
> UMBRAXIS's signature DoT — life/energy pulled *out* and transferred to the caster (conservation: the
> pool is *fed by what it takes*, never made from nothing). If that framework shifts, reconcile this
> kit toward it. Lexicon leans **void / star / event / rune / imbue / collapse** to stay clear of the
> orbital-/lance-/tide-heavy UMBRAXIS siblings (and to avoid any name reuse — invariant #8).

## Identity (derived + DNA)

- **Class:** Voidstar Exarch · **Attunement × Archetype:** UMBRAXIS × Spellblade *(`from-brief`)*
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** AGI (← Spellblade) — a **DEF/AGI**
  **durable front-line caster**: the only UMBRAXIS class that *casts gravity at melee range and
  survives there* on **Mass armor**, while AGI sharpens the imbued blade
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/steals, never made
  from nothing; the Exarch's strikes Drain to fuel the spells the casts spend)
- **Attunement signature:** **Drain** (life/energy pulled *out* and transferred) · the UMBRAXIS suite
  it wields **at melee range, through the rune-imbued blade and the gravity-spell:** **Crush**
  (escalating damage the longer it's held), **Anchored** (pinned by gravity), **event-horizon** (can't
  flee / swap rows), **time-dilation** (slowed near the mass), **Mass armor** (DEF → damage reduction —
  the front-line caster's survival), **Singularity** (pull → cluster → collapse — carried into *melee*
  as a close-range well). The Voidstar Exarch owns UMBRAXIS's **drain-blade → close-Singularity
  fusion** facet.

**Fantasy.** *(`from-brief`)* The Voidstar Exarch is the **gravity battle-mage** — the only UMBRAXIS
caster that carries the well into melee. One hand drives a **rune-imbued blade** whose every cut
**Drains** the foe to feed the pool; the other hand casts **gravity-magic** — it **Crushes**,
**Anchors**, and opens a close-range **Singularity** at sword's reach. It does not place wells from
the back like the Staff, and it does not parry like the duelist — it **bleeds with the edge and
collapses with the spell**, and the rhythm is fixed: **strike to Drain (generate), cast to collapse
(spend).** Where the SOL Starforge Knight forges *heat* into the blade and Detonates it, the Voidstar
Exarch pours **gravity** into his — the strike pins and bleeds, the spell crushes what the blade
pinned, the well falls shut at melee range. And unlike every other front-line caster of the five, the
Exarch **does not have to melt the foe before it melts him**: he is the **durable** battle-mage,
standing in the front row a caster has no business standing in because **Mass armor** eats the blows
and **Drain** refills him from what he takes. Where the UMBRAXIS **Staff (The Singularitan)** stands
at the *back* and litters the field with wells that pull and crush *from afar* (zone artillery), the
Voidstar Exarch **walks the well into melee** — drain-blade in one hand, a close Singularity in the
other, durable at the front. Bleed by edge, collapse by spell, and never fall.

### The shared Runeblade DNA *(`from-brief` — how this is a Spellblade)*

1. **Imbue — channel UMBRAXIS *through* the blade.** Strikes carry the signature into melee: each cut
   **Drains** a sliver of life to the pool (conservation) and lays the gravity charge — **Crush** /
   **Anchor** — that the spell will collapse. The blade is the delivery system for the drain and for
   the close-range gravity.
2. **Strike↔Cast rhythm — the literal generate→spend loop.** Melee strikes (specials) **generate**
   UMBRAXIS by **Draining**; gravity-spells and rune-collapses (signatures) **spend** it. The Voidstar
   Exarch is the most literal expression of the MNA economy *for UMBRAXIS specifically*: the strike
   doesn't just charge — it **takes** (conservation), and the cast pays it back as a collapse.
3. **Front-line caster — durable.** He casts the well at melee range and *survives there* on **Mass
   armor** + **Drain**, unlike the back-line Staff and unlike the squishier SOL/QUANTA battle-mages who
   must out-tempo the fight. The spell-warrior who doesn't hide *and* doesn't have to race — DEF holds
   the line while the well collapses.
4. **Reuse UMBRAXIS's own phase chain via the imbued blade.** No new combo resource: the Opening **is**
   the escalating **Crush** (and the **Anchor**) laid by the imbued strike; the finisher **is** the
   **Singularity** collapse cast onto what the blade pinned. The pin and the pressure are the meter —
   the strike sets them, the spell spends them.

### Lanes *(`from-brief` — the locked frame's three)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Voidblade** *(blade)* | **Imbued melee** — rune-charged cuts that **Drain** every strike (conservation sustain) and lay **Anchor** / **Crush** on the foe. The bleed-and-pin half; feeds the pool and keeps the caster alive at the front | **DEF/AGI**, Drain on strike, Anchor/Crush setup, self-sustain | front-line single-target pressure + UMBRAXIS engine | long attrition fights; little outside healing; you want to feed the pool and pin the target yourself |
| **B · Gravity Casting** *(cast)* | **Gravity spells** — cast **Crush**, **Anchor / event-horizon**, and a **close-range Singularity** (pull → cluster → collapse at sword's reach); a **Mass-armor** ward lets the caster hold the front. The collapse-and-control half (spend the pool) | **AGI**/DEF, Crush/Singularity collapse, Anchor, Mass ward | close-range AoE collapse + position control | clustered or fleeing lines to gather and collapse; a primed/pinned target to crush; a front you must ward |
| **C · Eventblade** *(fusion — the seat)* | **The strike↔cast loop** — the strike **Drains to fuel** the spell, the spell **collapses what the blade pinned**: imbue-and-release made one motion, with **time-dilation** to hold the window. The signature fusion seat | **DEF/AGI**, strike↔cast tempo, Drain→collapse, time-dilation, conservation economy | combo-engine / enabler / battery | drawn-out fights where the loop compounds; UMBRAXIS-stacked party to feed; when you want the whole drain→collapse engine running |

**Build axes:** drain-blade sustain ↔ gravity-collapse cast (A↔B) · gravity-collapse cast ↔
fusion-loop/battery (B↔C) · own-target bleed-and-pin ↔ tempo/economy enabling (A,B ↔ C). **DEF anchors
all three** — survival at the front is **Mass armor** + the **Drain** the blade takes, never a race.

**Cross-lane synergy:** **A's imbued cuts Drain to fill the pool and lay Anchor + Crush on the target →
C time-dilates the pin so the window holds and converts the strike's Drain straight into the next cast
→ B spends the pool to collapse a close-range Singularity onto the pinned, Crushed foe.** Strike bleeds
and pins; fusion holds and fuels; cast collapses.

---

## Auto-attack *(unlaned)*

- **Voidmark Cut** · phys · enemy · *a single rune-imbued cut; the gravity etched on the edge pulls a sliver of life back to you (a wisp of Drain)* · gen **minor UMBRAXIS** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Leeching Edge** · phys · enemy · *a rune-charged cut that Drains a sliver of HP to you* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Gravity Glyph** · mag · enemy · *cast a small gravity-glyph that pulls the foe toward you and Anchors it (rooted)* · gen **moderate UMBRAXIS** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Crush Glyph** · mag · enemy · *trace a heavy gravity-glyph over the foe: seed Crush — pressure that ramps the longer it's held* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Bleed the Charge** · phys · enemy · *strike, then route the strike's Drain straight into the blade's gravity-charge — the first beat of the loop; banks a surge of UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Voidcut** · phys · enemy · *two rune-imbued cuts; each Drains HP, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **C · Conduit Cut** · buff · self · *an imbued cut whose Drain "charges" your next cast — the next Gravity Casting spell this turn costs less; banks UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Pin-Strike** · phys · enemy · *a heavy imbued thrust that Anchors the foe and lays a wisp of Crush* · gen **moderate UMBRAXIS** · cd **short** · `proposed`
- **B · Wellcast** · mag · allEnemies · *open a small close-range well: pull the line a step inward into a cluster* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Wardgravity** · buff · self · *settle your mass into a guard: gain damage reduction (Mass armor) so a caster can hold the front while it casts* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Dilation Glyph** · util · enemy · *time-dilate the Anchored foe: its attack-bar fills slower while pinned, holding the collapse window open* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Hollowing Cut** · mag · enemy · *a draining stab: Drain HP and a share of the foe's energy to you, banking UMBRAXIS* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Voidbank Cut** · buff · self · *an imbued cut that stores a large UMBRAXIS reserve for the party (battery) and loads a gravity-charge on the blade* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Sapping Lunge** · mag · enemy · *a stepping imbued lunge; Drain ramps with the target's held Crush, banking a surge of UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Collapse Glyph** · mag · enemy · *cast a tightening gravity-glyph: deepen the foe's Crush and pull it closer* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Mass Glyphward** · buff · allAllies · *cast a thin gravitic shell over the party (brief damage reduction — Mass armor)* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Held Charge** · util · enemy · *seal the pin: time-lock the target's Anchor + Crush so they hold while the blade lines up the collapse, and bank UMBRAXIS* · gen **major UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Eventcarve** · phys · enemy · *a heavy rune-charged cut on a pinned foe; deepens Crush and Drains harder the longer it's been Anchored* · gen **moderate UMBRAXIS** · cd **medium** · `proposed`
- **C · Void Reservoir** · buff · allAllies · *the party's next UMBRAXIS ability is discounted; a Drain-fed surge banks into the shared pool* · gen **major UMBRAXIS** · cd **long** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Starpiercing Cut** · phys · enemy · *a decisive rune-imbued strike; massive bonus vs a Crushed / Anchored target (the drain-blade showcase), Draining deep* · gen **major UMBRAXIS** · cd **medium** · `proposed`
- **B · Singularity Glyph** · mag · allEnemies · *cast a close-range well over the line: pull every foe into a tight cluster and brief-Anchor it for the collapse* · gen **major UMBRAXIS** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Exsanguine Rune** · mag · enemy · *a draining rune-strike that steals a large chunk of the target's HP to you* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **B · Gravewell Glyph** · mag · enemy · *cast a deep gravity-glyph: strong pull + Anchor + a stamp of Crush on one target* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Wardmass** · buff · self · *raise heavy Mass armor for several turns so a caster can stand the front and keep casting* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Bind and Bleed** · util · enemy · *pin a foe with Anchor + event-horizon and open a Drain on it that feeds you while it cannot flee* · cost **low UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Drain Rune** · mag · enemy · *a multi-cut rune flurry; each cut Drains and feeds the next, escalating the steal and your sustain* · cost **med UMBRAXIS** · cd **medium** · `proposed`
- **C · Collapse the Pinned** · phys · enemy · *collapse all held Crush on an Anchored foe in one rune-imbued cut: burst scaling with the gravity pressure the blade built* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sanguine Edge Rune** · mag · self · *for a few turns, every imbued cut Drains and a share of all your damage returns as healing — you live on what you take* · cost **med UMBRAXIS** · cd **long** · `proposed`
- **B · Crushing Glyph** · mag · enemy · *cast a sustained crushing well: damage ramps each turn the foe stays Anchored* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Closewell** · mag · allEnemies · *open a Singularity at sword's reach: pull the whole line into a cluster, Anchor it, and crush the gathered foes* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **C · Eventfall Cut** · phys · enemy · *hold the foe at the still point and run the blade through, collapsing all its loaded Crush at once: a heavy single-target burst* · cost **high UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Bled to the Edge** · mag · enemy · *catastrophic Drain on a single foe through the imbued blade, healing you greatly and banking UMBRAXIS* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Riven Singularity** · phys · enemy · *the loop's verdict: route the strike's Drain into a close well and collapse it on the pinned foe in one motion — burst scaling with Crush built and HP drained* · cost **med UMBRAXIS** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Edge of the Void** · phys · enemy · *a chain of rune-imbued cuts; each cut that lands on a Crushed / Anchored foe deepens its Drain and extends the chain* · cost **high UMBRAXIS** · cd **medium** · `proposed`
- **B · Eventwell** · mag · allEnemies · *warp the front: cluster all foes into a close well, time-dilate them, and grind Crush across the gathered line* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Voidshell** · buff · allAllies · *shroud the party in damage-reducing mass and Drain a share of every blow against them back as party healing* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Caught in the Fall** · util · enemy · *time-dilate the Anchored foe to a crawl while the imbued blade keeps Draining it — its tempo dragged far back, bleeding all the while* · cost **high UMBRAXIS** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Long Drain** · mag · enemy · *bleed the foe across many turns — deep, uncleansable Drain through the rune-edge that feeds you every tick* · cost **high UMBRAXIS** · cd **long** · `proposed`
- **C · Voidstar Collapse** · phys · enemy · *plunge the target into a fully-loaded Crush by blade, then collapse a close Singularity onto it for a near-lethal burst (drain-pin, gravity-execute)* · cost **high UMBRAXIS** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · The Bleeding Star** *(Voidblade)* · enemy · *open a wound the blade will not close — Drain the target relentlessly across the fight through the imbued edge, healing you and refilling the party's UMBRAXIS with every cut* · `proposed`
- **B · The Falling Well** *(Gravity Casting)* · allEnemies · *cast the singularity itself at melee range — pull every foe into one close well, Anchor and time-dilate them, and collapse the gathered cluster in a crushing implosion* · `proposed`
- **C · The Event Engine** *(Eventblade)* · self → enemy · *become the loop for the turn — an unbroken strike↔cast cascade: every imbued cut Drains and pins, every cast collapses the Crush it laid, with no cooldown between them, the well feeding the blade and the blade feeding the well* · `proposed`
- **Voidstar Ascendant** *(neutral/fusion)* · allEnemies · *the blade and the well become one collapsing star — pin and Drain the whole line with imbued cuts, gather it into a close Singularity, then collapse all its loaded Crush at once — and stand at the front, Mass armor unbroken* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Edgethirst** · *your imbued cuts Drain more HP to you* · `proposed`
- **B · Glyphgravity** · *your gravity-spells' Anchors and Crush last longer, and your close wells pull from farther* · `proposed`
- **C · Drain-Fed Casting** · *after an imbued strike your next cast costs less, fueled by the Drain it took (the loop pays itself)* · `proposed`

**Set @ MNA 60**
- **A · Conservation Edge** · *a share of all damage you take is Drained back to you as healing — you survive on what you swallow* · `proposed`
- **B · Crushwright** · *your collapse damage scales harder with the Crush stacked on a foe* · `proposed`
- **C · Eventflow** · *while a foe is Anchored, your time-dilation also drags its attack-bar, holding the collapse window open longer* · `proposed`

**Set @ MNA 90**
- **A · Bottomless Edge** · *your Drains restore more, and a portion overflows into the party's UMBRAXIS* · `proposed`
- **B · Collapse Point Mass** · *your close-Singularity collapses can shear very low-HP Anchored foes apart (execute)* · `proposed`
- **C · The Unfalling Mage** · *while your Mass armor holds, the force you absorb overflows into the party's UMBRAXIS and the party's time-locked durations don't tick down* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Spellblades.** The Voidstar Exarch is the **gravity
  battle-mage**: a **drain-imbued blade** that bleeds and pins, and **gravity-spells** that Crush,
  Anchor, and collapse a **close-range Singularity** — a fusion of drain-strike and gravity-collapse,
  and the **only durable (DEF) front-line caster** of the family. Distinct from the SOL **Starforge
  Knight** (radiant battle-mage — *forge Burn into the blade and Detonate it*, AGI+AGI pure offense, no
  defensive line), the NOX **Lattice Executioner** (frost-arcane executioner — *freeze by spell,
  Shatter by blade*), the ANIMA **Biomancer** (mutation battle-mage — blade-borne *contagion* +
  self-evolution, **non-healer**), and the QUANTA **Quantum Exarch** (probability battle-mage —
  *observe with the strike, collapse the probability with the spell*). His imbue is **gravity/void**,
  his cast is the **collapsing well**, his sustain is **Drain**, and he alone *cannot be raced* — Mass
  armor holds the front while the well falls. Held by no other Spellblade.
- **Same-archetype — vs his back-line cousin The Singularitan (UMBRAXIS × Staff), the priority watch.**
  They share only the UMBRAXIS **signature** (Drain) and the suite (Crush / Anchored / event-horizon /
  time-dilation / Mass armor / Singularity), and the attunement. Everything else is opposite. The
  **Singularitan is back-line zone-control artillery** — a **VIT caster** that *places wells from
  safety at the back*, littering the field with gravity that pulls, crushes, and drains *from afar*; it
  never enters melee and has no blade. The **Voidstar Exarch carries the well into MELEE** — a
  **DEF/AGI** front-line caster whose **rune-imbued blade Drains and pins** in one hand while the other
  casts a **close-range Singularity**; its gravity is delivered *at sword's reach*, fed by the strike's
  Drain, and survives the front on **Mass armor**. Back-line well-artillery (the Singularitan) vs the
  front-line drain-blade-and-close-collapse battle-mage (this class) — different row, different stat
  line (VIT vs DEF/AGI), different cadence (place-and-emit vs strike↔cast).
- **Same-attunement (#10) — UMBRAXIS concept budget.** He reuses the UMBRAXIS *signature* (Drain) and
  the ratified suite freely — the shared identity — but as a **front-line drain-blade → close-Singularity
  fusion**, which no other UMBRAXIS class does. He does **not** pile onto a saturated UMBRAXIS *role*:
  the **single-target drain-siphon skirmisher** is The Lagrangian (daggers); the **parry-and-redirect
  counter-duelist** is the Abyssal Vector (swords); the **AoE gravity-gather melee cleaver** is the
  Singularity Reaver (greatsword); the **point-slam bruiser-tank** is the Graviton Warden (hammer); the
  **pure DEF+DEF hyper-tank** is the Tidal Sovereign (S&S); the **back-line zone-control well-artillery**
  is The Singularitan (staff); the **back-line cluster-volley gunner** is the Orbitalist (pistols); the
  **charge-and-pierce gravity sniper** is the Astrolancer (rifle). He takes **no orbital lockdown
  identity, no parry/redirect, no AoE line-cleave, no point-slam, no pure-tank wall, no ranged
  artillery/volley/lance** — his Mass armor is a *front-line caster's self-preservation*, not a tank's
  wall, and his only AoE is the close-range gather-and-collapse, not a swept arc or a sprayed kill-box.
  His seat — *cast gravity at melee range, Drain with the rune-imbued blade, and collapse a close
  Singularity onto what the blade pinned* — is held by no other UMBRAXIS class. (No ANIMA-style
  party-healing; ledger #16 is honored — this is a non-healer, self-sustain + UMBRAXIS battery only.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary AGI ← Spellblade · threshold = milestone | ✓ |
| Economy: specials generate-only (lean to Drain per conservation) · sig/ult cost-only · auto = minor trickle · all UMBRAXIS | ✓ |
| Provenance on every entry (fantasy / seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8 — grepped) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Spellblade siblings *and* vs The Singularitan | ✓ |
| Same-attunement concept budget (#10) — reuses UMBRAXIS signature/suite only; no saturated-role pile-on | ✓ |
