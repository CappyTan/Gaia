# Genewarden — ANIMA × Rifle

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The **row, seat, three lanes,
> and Marksman framing are `from-brief`** — the LOCKED frame in the [Rifle family note](./rifle-family.md)
> (the Marksman: *can you make the one shot?*); the kit's individual **abilities are `proposed`**,
> pending a content review. Numberless by design; magnitudes are a later balance pass. Mechanics
> vocabulary (**Infestation** / **Evolution** [Seed→Bloom→Overgrowth] / **Adaptation** / **Bloom** /
> **Metabolize** / **Regen**, plus the Marksman DNA: the aimed shot / charge-aim / the mark /
> first-strike) draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md)
> (ANIMA suite).
>
> **⚠️ NOT A PARTY-HEALER (ratified ledger #16).** ANIMA party-healing is reserved for the **Staff**
> (Genesis Sage, the dedicated healer) and the **Hammer** (Lifekeeper, the *one* secondary). The
> Genewarden is the **non-healer** ANIMA Rifle: its negentropy mode is **precision genetic
> engineering** — inject, evolve, contagion-execute — not medicine. Self-sustain is allowed (VIT
> bulk, **Adaptation** grown from overwatch, the self-only **Regen** mirror of its DoT) — but there
> are **no `ally`/`allAllies` heals, no shared Regen, and no party HoT** anywhere in this kit.

## Identity (derived + DNA)

- **Class:** Genewarden · **Attunement × Archetype:** ANIMA × Rifle
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** SPD (← Rifle) — a **VIT/SPD back-row
  precision shooter**: the durable, first-acting gene-sniper who removes one target by *engineering*
  the strain inside it, then lets its death seed the rest of the line
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* DoT that multiplies/stacks and
  **spreads on the host's death**; engine keyword `poison`) · ANIMA suite of **Evolution**
  (Seed→Bloom→Overgrowth), **Adaptation** (grow resistance to a damage type after it hits you),
  **Bloom**, **Metabolize** (devour a corpse/debuff to grow), and the **self-only Regen** mirror

**Fantasy.** *(seat from-brief)* The Genewarden is the **precision gene-sniper** — a marksman whose
round is a syringe. One aimed shot delivers a tailored strain into a single target, and the
Genewarden then *engineers* it: a beat spent at the scope evolves the wound from **Seed** to
**Bloom** to **Overgrowth**, the contagion maturing in the crosshairs until the decisive shot
detonates it. Where the Pistols' Sporecaster *sprays* spores to bury the whole line under contagion,
the Genewarden makes **one** clean injection and grows it into a kill — the single precision
INJECTION, not the spray. It marks a quarry, splices the right strain into it, and when that host
falls the engineered plague **erupts from the corpse** and carries to its neighbours: one shot, then
an outbreak. From the back row it acts *first* (SPD), opening the fight from max range, and it
survives the knife-edge by **watching and adapting** — reading the incoming threat and growing
resistance to it across the fight. *It is **explicitly not a medic.** Where the ANIMA Hammer
(Lifekeeper) pulses life into the party from its impacts and the ANIMA Staff (Genesis Sage) is the
dedicated wellspring, the Genewarden keeps **itself** alive by adapting and tends the **enemy's**
genome toward death. Its only sustain is its own.*

### The shared Marksman DNA *(from-brief — how this is a Rifle)*

1. **The aimed shot — single-target precision injection.** The round is a syringe: a precise
   single-target shot that injects/seeds **Infestation** into one foe. Precision, not volume — the
   inverse of the Pistols' spore-spray.
2. **Charge / aim — load the decisive shot.** A beat spent at the scope *engineers* the strain: it
   runs ANIMA's own phase chain in the crosshairs (**Seed → Bloom → Overgrowth**), the wound
   maturing into a stronger form before the shot that detonates it. The ranged cousin of momentum.
3. **The mark — designate a quarry / carrier.** Brand one target so the party's fire seeds and
   amplifies *the Genewarden's* strain on it, and so its death becomes the source of the outbreak.
4. **First-strike / range control + Adaptation (the fragility answer).** SPD priority to act first
   and open from max range; **adaptive overwatch** reads the incoming damage type and **grows
   resistance** to it (and a little self-Regen) — durability through learning, not armor, and
   **self-sustain only**.

### Lanes *(from-brief — LOCKED frame)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Gene Shot** *(aimed injection)* | **The aimed single-target shot** — a precise round that injects **Infestation** and **evolves** it in the crosshairs (Seed→Bloom→Overgrowth); charge/aim to load the decisive, detonating shot | **SPD**, charge/aim, single-target burst, Infestation, Evolution | back-row precision DoT-burst / single-target remover | priority single-target kills; boss/elite HP pools; charge-aim windows; SPD/crit gear |
| **B · Mark of the Strain** *(mark / contagion-execute)* | **Mark → contagion-execute** — brand a quarry so the party's hits stack *your* strain on it; finish low/marked foes, and the strain **spreads from the marked corpse** to its neighbours: one death, an outbreak | **SPD**/VIT, mark-growth, execute, contagion-spread | focus-fire enabler / outbreak-starter (via contagion + execute, never healing) | a focus-fire party; packs with bodies to chain an outbreak through; cleanup of softened foes |
| **C · Adaptive Watch** *(adaptive overwatch / range-control)* | **Adaptive overwatch + first-strike** — hold the angle: act first, suppress, and **Adapt** (grow resistance to what hits you) + the self-only Regen mirror; the durable, self-sustaining shooter | **VIT**/SPD, first-strike, Adaptation, self-Regen, self-shields | self-sustaining back-line anchor / opener / disruptor | vs hard-hitting elemental foes; no dedicated healer to *replace* — it just refuses to die; opening from range |

**Build axes:** aimed single-target burst ↔ mark/contagion-spread (A↔B) · offensive injection ↔
defensive self-adaptation (A,B ↔ C) · charge-the-shot ↔ brand-the-quarry ↔ watch-and-adapt
(A↔B↔C). **All three lanes lean on Evolution** — the injected strain matures, the marked outbreak
grows, and the overwatch hardens over time, so the Genewarden is steady early and overwhelming late.
*Self-sustain (lane C) tops out at keeping the Genewarden alive; it never becomes a party-heal —
that is the Staff's and Hammer's lane by ratified ledger #16.*

**Cross-lane synergy:** **C opens the fight first from range and adapts to the threat → A aims the
decisive shot, injecting and evolving the strain in one priority target → B has branded that target
as the carrier, so its death erupts in Overgrowth and reseeds the contagion across the rest of the
line.**

---

## Auto-attack *(unlaned)*

- **Splicing Shot** · phys · enemy · *a quick precise round that nicks one foe and slips a wisp of Infestation into the wound* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Gene Round** · phys · enemy · *an aimed shot that injects a stack of Infestation and plants a Seed in the target (the Opening)* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Tagging Round** · util · enemy · *paint a quarry: while the mark holds, the party's hits on it each seed a stack of your Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Carrier Mark** · util · enemy · *the mark matures (Bloom): the marked foe becomes a carrier — when it dies its Infestation spreads to a nearby foe* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Steady Lungs** · buff · self · *settle behind the scope: gain brief self-Regen and steadier aim while your shots keep flowing* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Take Aim** · buff · self · *charge the next shot at the scope: your next aimed round evolves the target's strain a stage and hits far harder* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Acclimate** · buff · self · *after the shot, grow resistance to the last damage type you took (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Sighting Spore** · phys · enemy · *a precise round that extends and deepens the Infestation already in the target* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Cull Round** · phys · enemy · *a clean finishing shot; bonus damage the lower the marked target's HP (the contagion-execute opener)* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Reseeding Shot** · phys · enemy · *shoot a marked foe; if it dies soon after, its Infestation erupts onto a nearby foe* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Resistant Watch** · buff · self · *first-strike overwatch: hold the angle, act first next round, and grow resistance to the type that struck you (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Mutagen Shot** · mag · enemy · *an aimed injection that Evolves the target's Infestation a full stage — it stacks higher and ticks harder* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Watcher's Hide** · buff · self · *after taking a damage type, sharply grow resistance to it; gain brief self-Regen (Adaptation)* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Bloomshot** · phys · enemy · *a charged round that detonates the target's Bloomed strain for a burst of single-target damage* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Quarantine Mark** · util · enemy · *mark and Expose the quarry: it takes more from the whole party, and every party hit deepens your Infestation in it* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Spreading Strain** · util · allEnemies · *the marked carrier's Infestation leaps to every other foe at lesser strength* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Suppressing Strain** · phys · allEnemies · *rake suppressing fire across the line from cover: a little Infestation on each, and you act first next round* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Phenotype Round** · phys · enemy · *Evolve your ammunition mid-fight: your aimed shots apply a stronger strain for several turns (Overgrowth)* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Symbiont Sights** · buff · self · *bond a symbiote to the scope: lasting self-Regen + damage reduction while you hold the angle (self only)* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Overgrowth Shot** · phys · enemy · *an apex aimed round that applies max-duration, fully-Evolved Infestation to one target* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Outbreak Shot** · phys · enemy · *a finishing shot on a marked carrier; on its death the contagion erupts and reseeds across the enemy line* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Aimed Splice** · mag · enemy · *a deliberate scope-loaded injection that floods one target with Infestation stacks at once* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Marked Carrier** · util · enemy · *seal a growing mark on a quarry; while it lives the party's fire stacks your Infestation on it, and its death spreads the strain* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Lethal Strain** · phys · enemy · *a precise execute round that scales with the marked target's current Infestation stacks* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Booster Stance** · buff · self · *enter a survival phenotype at the scope: lasting self-Regen + damage reduction that grows each turn it holds (self only)* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · The Long Splice** · mag · enemy · *a fully charged aimed injection: Evolve the target's strain two full stages in one shot — it now spreads on its death* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Marksman's Adaptation** · buff · self · *Adaptation surge: grow resistance to every damage type you've taken so far this fight (self only)* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Scope Bloom** · mag · enemy · *bloom the target's stacked Infestation into a burst of single-target damage; lesser Infestation reseeds in the wound afterward* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Vector Mark** · util · enemy · *split the quarry wide: for several turns the party damages and crits the marked carrier harder, and each hit it takes drives your Infestation deeper* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Carrier Zero** · util · enemy · *make the quarry a contagion hub: the party's hits on it now spread your Infestation outward to every foe near it* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Settled Sights** · buff · self · *lock in your grown resistances and self-Regen so they no longer decay for the rest of the fight (self only)* · cost **high ANIMA** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Killing Seed** · phys · enemy · *the decisive aimed shot: a charged round that detonates a fully-Bloomed strain, removing one priority target* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Sovereign Phenotype** · buff · self · *Metabolize: devour a debuff on yourself to heal and convert it into a growing resistance (self only)* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Apex Splice** · buff · self · *for the duration, every aimed shot Evolves the target's strain a stage and your rounds carry max-Bloom Infestation* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Outbreak Vector** · mag · allEnemies · *detonate the marked carrier: its Evolved Infestation leaps to every foe and Evolves a stage — it ticks harder and spreads on each death* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Plaguemark** · util · enemy · *brand an un-cleansable carrier mark on a foe: the strain on it keeps multiplying and erupts onto the whole line on its death* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Symbiont Sentinel** · buff · self · *Evolve to your apex overwatch hide: cap incoming damage, deep self-Regen, and immunity to the damage types you've Adapted to (self only)* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · The Perfect Strain** · mag · enemy · *the masterwork injection: a single shot loads a deep, fully-Evolved, un-cleansable strain that keeps multiplying and detonates on the next hit* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Living Scope** · buff · self · *for a few turns become near-unkillable from cover: cap incoming damage, deep self-Regen, and grow resistance to everything that strikes you (self only)* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · The One Shot** *(Gene Shot)* · enemy · *the perfect aimed injection — charge and fire a single masterwork round that loads max-duration, fully-Evolved Infestation and detonates the target's entire Bloomed strain at once, removing one priority foe; the burst reseeds lesser contagion in its place* · `proposed`
- **B · Carrier Zero Protocol** *(Mark of the Strain)* · allEnemies · *brand the deadliest foe as the apex carrier and bind the party's fire to it — every hit floods it with Evolved Infestation, and when it falls the engineered plague erupts and reseeds across every other foe: one death, a total outbreak* · `proposed`
- **C · The Endless Watch** *(Adaptive Watch)* · self · *settle into perfect overwatch — for the duration you act first every round, cannot be reduced below 1 HP, regenerate each turn, and grow resistance to everything that strikes you: you simply outlast and out-shoot the fight (self only)* · `proposed`
- **Genesis Round** *(neutral/fusion)* · allEnemies · *the masterwork strain leaves the barrel — one aimed shot injects, evolves, and detonates a fully-Bloomed contagion that erupts across the whole enemy line at once, while you Metabolize the carnage to harden and self-mend (self only)* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Splicer's Eye** · *your aimed shots Evolve the target's Infestation a step sooner* · `proposed`
- **B · Pack Carrier** · *your carrier mark grows a stage faster and spreads to one more foe on the host's death* · `proposed`
- **C · Quick to Acclimate** · *you grow resistance to a damage type a step faster after taking it (Adaptation)* · `proposed`

**Set @ MNA 60**
- **A · Charged Chamber** · *your charged/aimed shots deal more the more the target's strain has Evolved* · `proposed`
- **B · Vectorbearer** · *foes marked by you take increased damage from the whole party* · `proposed`
- **C · Resilient Sights** · *while you have self-Regen, you take reduced damage* · `proposed`

**Set @ MNA 90**
- **A · Perfected Splice** · *your aimed strain can Evolve one stage further than its apex* · `proposed`
- **B · Endless Outbreak** · *your carrier's Infestation always spreads on the host's death, even when reduced* · `proposed`
- **C · Lasting Acclimation** · *your grown resistances and self-Regen no longer decay while you hold the angle* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Rifles (the Marksman family).** The Genewarden is the
  **precision gene-sniper**: an aimed injection that seeds Infestation, charge/aim that *evolves* the
  strain in the crosshairs (Seed→Bloom→Overgrowth) as the decisive shot, a carrier-mark that turns a
  kill into an outbreak, and adaptive overwatch. Distinct from the SOL **Photon Vanguard** (charged
  radiant beam — pierce + Burn/Blind at range), the NOX **Terminus** (the freezing kill-shot —
  mark → Frozen → Shatter-shot, an HP-execute), the QUANTA **Observer Prime** (observe → collapse a
  target's fate; doubled-SPD foresight), and the UMBRAXIS **Astrolancer** (gravity lance — pierce +
  Anchor/Drain). Only the Genewarden's shot *injects and grows a living strain*, and only its kill
  *seeds an outbreak from the corpse*.
- **Same-archetype — vs its Pistols cousin the Sporecaster (the INJECTION vs the SPRAY).** Both are
  ANIMA ranged contagion-appliers, so the split must be airtight. **The Sporecaster is the
  spore-gun: VOLUME — Infestation rounds *sprayed* across the whole line, the fastest area
  applicator** (its DNA is double-tap volume, crit-spray, kiting). The Genewarden shares none of
  that: it is the **single precision INJECTION** — *one* aimed shot into *one* marked target, the
  strain *engineered* (charged/evolved) in the crosshairs, the line infected only *afterward* by the
  marked corpse's outbreak, not by spray. The Sporecaster floods many; the Genewarden perfects one
  and lets it spread on death.
- **Same-attunement (#10) — ANIMA concept budget & ledger #16.** It reuses the ANIMA *signature*
  (Infestation, the Seed→Bloom→Overgrowth chain, Evolution/Adaptation/Metabolize) freely — that's the
  shared identity — but **honors ratified ledger #16 in full: it is NOT a party-healer.** No
  `ally`/`allAllies` heal, no shared Regen, no party HoT appears anywhere in the kit; every sustain
  effect is `self`. It also does **not** pile onto a saturated ANIMA role: party-healing belongs to
  the **Staff (Genesis Sage)** + the **Hammer (Lifekeeper)**; *summoned* life to the **S&S (Soul-
  Bound Aegis)**; the *spray-flood applicator* to the **Pistols (Sporecaster)** and the *melee
  contagion-flood* to the **daggers (Symbiote Hunter)**; the *adaptation duelist* to the **swords
  (Pulse Arbiter)**; the *line-infesting cleaver* to the **Two-Hander (Apex Dominion)**. The
  Genewarden's seat — **single-target precision gene-injection + charge/aim evolution + carrier-mark
  contagion-execute + adaptive overwatch, as a non-healing back-row sniper** — is held by no other
  ANIMA class.

### NO party-healing — explicit confirmation

This kit contains **zero** party heals: scanned every entry — no `ally` or `allAllies` `heal`
target, no shared/party Regen, no party HoT. The only `self`-targeted sustain is VIT bulk,
**Adaptation** (resistance growth from overwatch), the self-only **Regen** mirror of the DoT, and
**Metabolize** (heal *yourself* off a devoured debuff). Lane B's `allEnemies`/`enemy` effects spread
*contagion* and *Expose* — never healing. The Genewarden is a **non-healer** per ledger #16.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (specials 5…95; sigs 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary SPD ← Rifle · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA (compounds) | ✓ |
| Provenance on every entry (row/lanes/seat/Marksman framing `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Rifle siblings *and* from the Sporecaster | ✓ |
| Same-attunement concept budget (#10) — reuses ANIMA signature only; honors ledger #16 (no saturated-role pile-on) | ✓ |
| **NOT A PARTY-HEALER (ledger #16):** no `ally`/`allAllies` heal, no shared Regen, no party HoT; all sustain is `self` | ✓ |
