# Apex Dominion — ANIMA × Two-Handed Sword

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The **row, seat, three lanes,
> and Reaver framing are `from-brief`** — the LOCKED frame in the
> [Two-Handed Sword family note](./two-handed-sword-family.md) (the Reaver: *how wide does the swing
> land?*); the kit's individual **abilities are `proposed`**, pending a content review. Numberless by
> design; magnitudes are a later balance pass. Mechanics vocabulary (**Infestation** / **Evolution**
> [Seed→Bloom→Overgrowth] / **Adaptation** / **Bloom** / **Metabolize** / **Regen**, plus the Reaver
> DNA: cleave / reach / momentum) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (ANIMA suite).
>
> **⚠️ NOT A PARTY-HEALER (ratified ledger #16).** ANIMA party-healing is reserved for the **Staff**
> (Genesis Sage, the dedicated healer) and the **Hammer** (Lifekeeper, the *one* secondary). Apex
> Dominion is the **non-healer** ANIMA Two-Hander: its negentropy mode is **apex predation /
> territorial dominance**, not medicine. Self-sustain is allowed — VIT bulk, **Adaptation**
> (grow resistance), the self-only **Regen** mirror of its DoT, and Metabolizing what it kills — but
> there are **no `ally`/`allAllies` heals, no shared Regen, and no party HoT** anywhere in this kit.

## Identity (derived + DNA)

- **Class:** Apex Dominion · **Attunement × Archetype:** ANIMA × Two-Handed Sword
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** STR (← Two-Handed Sword) — a **VIT/STR
  front-row bruiser**: the durable apex line-sweeper that grows tougher and stronger as it sweeps
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* DoT that multiplies/stacks and
  **spreads on the host's death**; engine keyword `poison`) · ANIMA suite of **Evolution**
  (Seed→Bloom→Overgrowth), **Adaptation** (grow resistance to a damage type after it hits you),
  **Bloom**, **Metabolize** (devour a corpse/debuff to grow), and the **self-only Regen** mirror

**Fantasy.** *(seat from-brief)* Apex Dominion is the **apex predator with a greatsword's reach** — the
top of the food chain holding a kill-zone. The blade is alive: a long sweeping arc that rakes a *living
contagion* across the whole enemy line, so the wound it opens keeps multiplying after the swing has
passed. It is the durable Reaver: where the line-cleavers of other Attunements freeze, burn, or
gather, Apex Dominion **infests and dominates** — it sweeps, the contagion takes root, and as the
predator feeds it **evolves**, growing stronger and tougher with each kill it metabolizes. It claims
territory by reach: roots and entangling growth pin the whole line so nothing escapes the arc, and the
kill-zone it stakes out is its to hold. The Reaver payoff reuses ANIMA's own phase chain across the
**line** — infest the line (**Seed**), let the strains mature (**Bloom**), then a swept host's death
erupts in **Overgrowth** that spreads the contagion onward through the pack. *It is **explicitly not a
medic.** Where the ANIMA Hammer (Lifekeeper) is the heal-bruiser who keeps the party standing by
pulsing life from its impacts, Apex Dominion keeps **itself** standing by adapting and feeding — and
keeps the **enemy** dying by infesting the line. Its only sustain is its own.*

### The shared Reaver DNA *(from-brief — how this is a Two-Hander)*

1. **Cleave (AoE Infestation arcs).** The long arc is melee **AoE** — one swing seeds the living
   contagion across the whole enemy line; the Reaver is the line-clearer, not a single-target breaker.
2. **Reach / zone-control.** The blade zones space: roots and entangling **Overgrowth** pin the line,
   threaten the back row, and hold the kill-zone so nothing flees the arc.
3. **Momentum.** Slow but cataclysmic — a wind-up that *releases*: a charged overhead sweep, or a
   ramp that compounds across the exchange (the predator that grows mid-fight).
4. **Opening → Finisher reuses ANIMA's own phase chain across the LINE** (no new resource): the
   Opening **is** **Seed → Bloom** (infest the line and let the strains mature, deepened by the
   sweeps); the Finisher is the **Overgrowth** — a host's death detonates and reseeds the contagion
   onward through the pack.

### Lanes *(from-brief — LOCKED frame)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Reaping Arc** *(contagion cleave)* | **AoE Infestation cleaves** — wide arcs seed the living contagion across the whole line; a swept host's death **spreads** the strain onward (contagion-sweep, the Seed→Bloom→Overgrowth chain run across the line) | **STR**, Infestation stacks, AoE, DoT-duration | front-row AoE DoT engine / line-clearer | vs packs and multi-foe HP pools; fights with bodies to chain an outbreak through |
| **B · Apex Growth** *(self-evolution)* | **Adapt / Overgrowth self-evolution** — grow stronger *and* tougher as you sweep: crits and damage escalate (Evolution), **Adaptation** grows resistance to what hits you, and you Metabolize kills into VIT/Regen. Durable, **self-sustain only** | **VIT**/STR, escalation, resistance-growth, self-Regen | self-sustaining front-line bruiser / anchor | no dedicated healer to *replace* — it just refuses to die; solo-pressure; long attrition; bruiser/VIT gear |
| **C · Dominion's Reach** *(reach / control)* | **Root / entangle the line, hold the kill-zone** — entangling growth pins the whole line so nothing escapes the arc; reach zones the back row and locks the field as the predator's territory | STR/VIT, root/Entangle, reach, zone-control | front-line disruptor / lockdown | vs swarms and fleeing/back-row foes; protecting the party's back line; setting up the team's burst window |

**Build axes:** contagion-cleave ↔ self-evolution (A↔B) · self-evolution ↔ line-control (B↔C) ·
spreading-DoT damage ↔ zone-lockdown control (A,C). **All three lanes lean on Evolution** — the
contagion deepens, the predator hardens, and the kill-zone's growth thickens over time, so Apex
Dominion is steady early and overwhelming late. *Self-sustain (lane B) tops out at keeping the Reaver
alive; it never becomes a party-heal — that is the Staff's and Hammer's lane by ratified ledger #16.*

**Cross-lane synergy:** **C roots and entangles the line so nothing leaves the arc → A sweeps the
held line, seeding Infestation that Blooms and spreads on each death → B feeds on the carnage,
Metabolizing kills and Adapting into an unkillable apex that keeps swinging.**

---

## Auto-attack *(unlaned)*

- **Rending Sweep** · phys · enemy · *a slow wide arc of the living blade; a glancing hit on the front foe that leaves a wisp of Infestation* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Spore Cleave** · phys · allEnemies · *a wide opening arc across the line; seeds a stack of Infestation on each foe it touches* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Feral Vigor** · buff · self · *settle into the predator's stance: brief self-Regen and a touch of bonus STR while your sweeps keep flowing* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Toughening Hide** · buff · self · *after the swing, grow resistance to the last damage type you took (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Snaring Roots** · util · enemy · *roots burst from the ground; Entangle the target so it can't flee the arc (rooted)* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Festering Arc** · phys · allEnemies · *a sweep that extends and deepens the Infestation already on every foe it hits* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Tanglewall** · util · allEnemies · *entangling growth thickens across the line: all foes briefly rooted, slowed in the kill-zone* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Blightswath** · phys · allEnemies · *a heavier rake across the line; Infested foes take bonus damage scaling with their stacks* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Carnage Feed** · phys · enemy · *a brutal cut; if it kills, Metabolize the corpse for a burst of VIT and ANIMA (self only)* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Mutating Bulk** · buff · self · *Evolve your frame mid-fight: grow tougher and your sweeps hit harder for several turns* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Thornhold** · util · allEnemies · *raise a ring of thorns around the kill-zone: foes that try to leave the arc are rooted and torn* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Reaping Tide** · phys · allEnemies · *a wide momentum sweep; a foe slain by it spreads its Infestation to the rest of the line* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Choking Verdure** · util · allEnemies · *vines foul the line's footing and swings: all foes rooted and their accuracy lowered* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Plague Harrow** · phys · allEnemies · *rake the line; refresh and Bloom the Infestation on every foe a stage* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Devouring Stance** · buff · self · *for several turns, hits that fell a foe heal you and grow a stack of lasting bulk (Metabolize, self only)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Adaptive Bulwark** · buff · self · *after taking a damage type, sharply grow resistance to it; gain brief self-Regen (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Gravewood Snare** · util · allEnemies · *deep entangling growth: root the line and disarm it (entangled swings fail) for a turn* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Virulent Swath** · phys · allEnemies · *a sweep whose Infestation can no longer be cleansed off the foes it hits this fight* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Stranglegrove** · util · allEnemies · *the kill-zone overgrows: the whole line is held in brambles — rooted and unable to reach the back row* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Pestilent Reaping** · phys · allEnemies · *an apex line-rake that applies max-duration, fully-Bloomed Infestation across the arc* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Apex Frame** · buff · self · *push your evolution to its peak form: large lasting bulk, heavy resistance, and self-Regen for several turns* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Contagion Sweep** · phys · allEnemies · *a deep wide arc that floods the whole line with Infestation stacks at once* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Chitin Bloom** · buff · self · *grow a hardened symbiotic shell: heavy self damage reduction + self-Regen while it holds* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Metabolic Surge** · buff · self · *Metabolize: devour every debuff on yourself, healing for each and growing a stack of bulk (self only)* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Rootsnare Edict** · util · allEnemies · *entangling roots clamp the line: all foes rooted for several turns, unable to flee the arc* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Bloomrot Arc** · mag · allEnemies · *Bloom the Infestation on the whole line a full stage — it stacks higher, ticks harder, and now spreads on each death* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Warden of the Kill-Zone** · buff · self · *stake your territory: while it holds, rooted foes cannot leave the arc and your reach threatens the back row* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Harvest Swing** · phys · allEnemies · *a sweep whose damage scales with the total Infestation stacks across the line; refreshes them* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Predator's Ascent** · buff · self · *for several turns, each foe you fell grows your STR and VIT a stage (Evolution) and refunds you health* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Symbiont Mantle** · buff · self · *enter your apex survival form: large self-Regen + heavy damage reduction that grows each turn it holds (self only)* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Bramblewarden Hold** · util · allEnemies · *a rampart of devouring thorns rings the field: the line is rooted, torn if it moves, and cannot reach the back row* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Outbreak Cleave** · phys · allEnemies · *a sweep that detonates a swept host's Bloomed Infestation, reseeding it onto every other foe (Overgrowth across the line)* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Territorial Dominion** · util · allEnemies · *assert the kill-zone: all foes rooted and Exposed (they take more from the whole party) while they remain in the arc* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Spreading Blight** · mag · allEnemies · *the Infestation on every foe Evolves a stage — it ticks harder and erupts onto a neighbor on each death* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Insatiable Apex** · buff · self · *for the duration, kills and heavy sweeps refund health and ANIMA and grow lasting bulk; the effect ramps (self only)* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Unkillable Frame** · buff · self · *Evolve to your apex hide: cap incoming damage, deep self-Regen, and immunity to the damage types you've Adapted to (self only)* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Verdant Cage** · util · allEnemies · *imprison the whole line in living brambles: a long root none can break, holding them in the arc* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Apex Pandemic** · mag · allEnemies · *flood the line with a deep, un-cleansable Infestation that keeps multiplying and spreads on every death* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Dominion Absolute** · util · allEnemies · *the kill-zone is total: root and Expose the entire line and keep them rooted for the duration — none escape the predator's reach* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · The Devouring Sweep** *(Reaping Arc)* · allEnemies · *a single cataclysmic momentum arc across the whole line — max-duration Evolved Infestation on every foe, and each death erupts in Overgrowth that reseeds onto every survivor: an unstoppable outbreak swept through the pack* · `proposed`
- **B · Final Apex** *(Apex Growth)* · self · *the predator reaches its final evolution — for the duration you cannot be reduced below 1 HP, regenerate each turn, grow resistance to everything that strikes you, and every kill swells your bulk: you simply outlast and overpower the fight (self only)* · `proposed`
- **C · The Living Wilds** *(Dominion's Reach)* · allEnemies · *the kill-zone becomes a devouring jungle — the entire line is rooted, torn, and Exposed for the duration, held fast in the arc with no escape to the back row* · `proposed`
- **Reign of the Apex** *(neutral/fusion)* · allEnemies · *the predator claims the field — one apex sweep roots and infests the whole line at once, the contagion Blooms and detonates across every foe, and you Metabolize the carnage to evolve, harden, and heal yourself (self only)* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Contagious Reach** · *your sweeps' Infestation stacks higher and spreads to one more foe on a host's death* · `proposed`
- **B · Thickening Bulk** · *each foe you fell grows your VIT a little for the rest of the fight (Evolution)* · `proposed`
- **C · Deeprooted** · *your roots and Entangle effects last longer* · `proposed`

**Set @ MNA 60**
- **A · Blightbearer** · *foes Infested by your sweeps take increased damage from the whole party* · `proposed`
- **B · Swift Acclimation** · *you grow resistance to a damage type a step faster after it hits you (Adaptation)* · `proposed`
- **C · Hold the Line** · *while a foe is rooted by you, it cannot reach your back row at all* · `proposed`

**Set @ MNA 90**
- **A · Endless Outbreak** · *your Infestation always spreads on a host's death, even when reduced* · `proposed`
- **B · Apex Resilience** · *while you have self-Regen, you take reduced damage and your bulk never decays while you sustain it* · `proposed`
- **C · Strangling Dominion** · *your roots also disarm — rooted foes in the kill-zone can't attack at all* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Two-Handed Swords (the Reaver family).** Apex Dominion is
  the **durable apex line-sweeper**: contagion arcs that seed Infestation across the line, **self-
  evolution** (grow stronger/tougher as it sweeps), and **territorial root/entangle zone-control**.
  Distinct from the NOX **Worldender** (freeze the line → shatter the arc; raw STR+STR power), the SOL
  **Starbreaker** (fast radiant cleave that spreads Burn → Detonate), the QUANTA **Timeline Breaker**
  (momentum/time — superpose → collapse the line's fate), and the UMBRAXIS **Singularity Reaver**
  (gravity — pull the line into the arc and reave). Only Apex Dominion's arc *infests* and *grows*, and
  its zone-control is *living* (roots/brambles), not freeze, gravity, or fate.
- **Same-archetype — vs its Hammer cousin Lifekeeper (the point vs the arc).** Both are ANIMA STR-
  secondary front-liners on the "Breaker" role, so the split must be airtight. **Lifekeeper is the
  sustain-bruiser / AoE secondary *healer* — its impacts pulse life back to the party.** Apex Dominion
  shares none of that: it is the **line-breaker** (AoE Infestation arcs + reach, not single crushing
  impacts) and it **does not heal the party** — its sustain is *self-only* (VIT bulk, Adaptation, the
  self-Regen mirror, Metabolizing kills). Lifekeeper heals the team by wrecking the enemy; Apex
  Dominion *dominates and infests* the enemy and keeps only *itself* alive.
- **Same-attunement (#10) — ANIMA concept budget & ledger #16.** It reuses the ANIMA *signature*
  (Infestation, the Seed→Bloom→Overgrowth chain, Evolution/Adaptation/Metabolize) freely — that's the
  shared identity — but **honors ratified ledger #16 in full: it is NOT a party-healer.** No
  `ally`/`allAllies` heal, no shared Regen, no party HoT appears anywhere in the kit; every sustain
  effect is `self`. It also does **not** pile onto a saturated ANIMA role: party-healing belongs to
  the **Staff (Genesis Sage)** + the **Hammer (Lifekeeper)**; *summoned* life/menagerie to the **S&S
  (Soul-Bound Aegis)**; the *contagion-flood applicator* to the **daggers (Symbiote Hunter)**; the
  *adaptation duelist* to the **swords (Pulse Arbiter)**. Apex Dominion's seat — **AoE line-infesting
  contagion-cleave + self-evolution bulk + living territorial reach-control, as a non-healing front-
  row bruiser** — is held by no other ANIMA class.

### NO party-healing — explicit confirmation

This kit contains **zero** party heals: scanned every entry — no `ally` or `allAllies` `heal` target,
no shared/party Regen, no party HoT. The only `self`-targeted sustain is VIT bulk, **Adaptation**
(resistance growth), the self-only **Regen** mirror of the DoT, and **Metabolize** (heal *yourself*
off kills/debuffs). Apex Dominion is a **non-healer** per ledger #16.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (specials 5…95; sigs 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary STR ← Two-Handed Sword · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA (compounds) | ✓ |
| Provenance on every entry (row/lanes/seat/Reaver framing `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Reaver siblings *and* from Lifekeeper | ✓ |
| Same-attunement concept budget (#10) — reuses ANIMA signature only; honors ledger #16 (no saturated-role pile-on) | ✓ |
| **NOT A PARTY-HEALER (ledger #16):** no `ally`/`allAllies` heal, no shared Regen, no party HoT; all sustain is `self` | ✓ |
