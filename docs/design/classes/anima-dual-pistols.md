# Sporecaster — ANIMA × Dual Pistols

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The **row, seat, three lanes,
> and Gunslinger framing are `from-brief`** — the LOCKED frame in the
> [Dual Pistols family note](./dual-pistols-family.md) (the Gunslinger: *how fast can you keep
> firing?* — pistols = **volume of fire**); the kit's individual **abilities are `proposed`**, pending
> a content review. Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (**Infestation** / **Evolution** [Seed→Bloom→Overgrowth] / **Adaptation** / **Bloom** /
> **Metabolize** / **Regen**, plus the Gunslinger DNA: double-tap / volume-rhythm / back-line mobility)
> draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md) (ANIMA suite).
>
> **⚠️ NOT A PARTY-HEALER (ratified ledger #16).** ANIMA party-healing is reserved for the **Staff**
> (Genesis Sage, the dedicated healer) and the **Hammer** (Lifekeeper, the *one* secondary). The
> Sporecaster is the **non-healer** ANIMA Dual Pistols: its negentropy mode is **ranged contagion /
> spore-spray**, not medicine. Self-sustain is allowed — VIT bulk, **Adaptation** (grow resistance),
> the self-only **Regen** mirror of its DoT, and Metabolizing what it kills — but there are **no
> `ally`/`allAllies` heals, no shared Regen, and no party HoT** anywhere in this kit.

## Identity (derived + DNA)

- **Class:** Sporecaster · **Attunement × Archetype:** ANIMA × Dual Pistols
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** AGI (← Dual Pistols) — a **VIT/AGI back-row
  gunner**: the durable contagion-sprayer who floods the whole enemy line with living spore-rounds
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* DoT that multiplies/stacks and
  **spreads on the host's death**; engine keyword `poison`) · ANIMA suite of **Evolution**
  (Seed→Bloom→Overgrowth), **Adaptation** (grow resistance to a damage type after it hits you),
  **Bloom**, **Metabolize** (devour a corpse/debuff to grow), and the **self-only Regen** mirror

**Fantasy.** *(seat from-brief)* The Sporecaster wields twin spore-guns — a back-line gardener of
plagues who **buries the whole enemy line under living fire.** Where the Rifle's Genewarden injects
one engineered strain into one target with surgical care, the Sporecaster **sprays**: a relentless
hail of attuned rounds, each barrel coughing spores that breed inside the wound, so a single fan of
fire seeds contagion across the line at once. Twin barrels mean **two Infestation applications per
volley** — the game's fastest *ranged* applicator. As the fight runs its rounds **evolve** — the
strain in the chamber mutates into stronger forms and adapts to what the enemy throws back — and the
spore-clouds it lays down **root** the line in a creeping garden so nothing escapes the next volley.
It claims the field by **saturation**, not precision. *It is **explicitly not a medic.** Where the
ANIMA Staff (Genesis Sage) and Hammer (Lifekeeper) keep the party alive, the Sporecaster keeps only
**itself** standing — VIT bulk, Adaptation, the self-Regen mirror, and Metabolizing kills — and keeps
the **enemy** dying by flooding the line with spores. Its only sustain is its own.*

### The shared Gunslinger DNA *(from-brief — how this is a Dual Pistols)*

1. **Double-tap (two Infestation applications).** Dual barrels fire two rounds → two contagion seeds
   per shot. The Sporecaster is the **ranged contagion applicator** — it stacks the ANIMA signature
   fastest at range, and many of its specials spray two seeds where a single gun would land one.
2. **Volume / rhythm.** Sustained fire builds momentum; cheap fast spore-shots seed the line, and the
   rhythm of the volley feeds the bigger Bloom/Overgrowth payoffs. Saturation over the single shot.
3. **Back-line mobility.** The fragility answer is *don't get hit* — kite, reposition, and lay
   spore-clouds from the back row at range, never a defensive front-line wall.
4. **Opening → Finisher reuses ANIMA's own phase chain *applied by fire* across the LINE** (no new
   resource): the Opening **is** **Seed → Bloom** (spray the line with spore-rounds and let the
   strains mature, deepened by sustained fire); the Finisher is the **Overgrowth** — a host's death
   erupts and reseeds the contagion onward through the pack.

### Lanes *(from-brief — LOCKED frame)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Spore Volley** *(contagion spray)* | **Infestation rounds that spread on death** — fan the barrels across the line, seeding the living contagion with every fast volley; a downed host's spores leap onward (the Seed→Bloom→Overgrowth chain *applied by fire* across the line). The applicator | **AGI**, Infestation stacks, volume/rate-of-fire, DoT-duration | back-row AoE DoT engine / line-flooder | vs packs and multi-foe HP pools; fights with bodies to chain an outbreak through; crit/rate-of-fire gear |
| **B · Mutagen Round** *(evolving fire / self-adaptation)* | **Evolving & adaptive shots** — the strain in the chamber **mutates** into stronger forms (Seed→Bloom→Overgrowth) and the gunner **Adapts**, growing resistances to what hits back; Metabolize kills into VIT/Regen. Escalating, **self-sustain only** | **VIT**/AGI, escalation, resistance-growth, self-Regen | self-sustaining ramp damage / durable back-liner | long single-target or boss fights that reward a ramp; bruiser/VIT gear; no dedicated healer to *replace* — it just refuses to die |
| **C · Hive Field** *(zone-control)* | **Spore-cloud zone-control** — lay creeping clouds and rooting growth that pin the line, foul its footing, and hold the kill-box so nothing escapes the volley; the back-line controller | AGI/VIT, root/Entangle, zone-control, slow | ranged disruptor / lockdown | vs swarms and fleeing/charging foes; protecting the party's front line; setting up the team's burst window |

**Build axes:** contagion-spray ↔ evolving/self-sustain (A↔B) · evolving self-adaptation ↔
zone-control (B↔C) · spreading-DoT damage ↔ field-lockdown control (A,C). **All three lanes lean on
Evolution** — the contagion deepens, the chambered strain mutates, and the spore-field's growth
thickens over time, so the Sporecaster is steady early and overwhelming late. *Self-sustain (lane B)
tops out at keeping the gunner alive; it never becomes a party-heal — that is the Staff's and
Hammer's lane by ratified ledger #16.*

**Cross-lane synergy:** **C lays the spore-field that roots the line so nothing leaves the volley's
arc → A fans contagion across the held line, seeding Infestation that Blooms and spreads on each
death → B feeds on the carnage, Metabolizing kills and Adapting into a gunner that never goes down
and whose rounds keep mutating stronger.**

---

## Auto-attack *(unlaned)*

- **Double-Tap Spores** · phys · enemy · *two quick spore-slick rounds from the twin barrels; each can seed a stack of Infestation* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Sporeshot** · phys · enemy · *a fast double round; applies Infestation, building the Opening* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Mutagen Round** · phys · enemy · *a chambered mutating round; deals damage and Evolves your loaded strain a stage (Seed)* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Adaptive Load** · buff · self · *after the volley, grow resistance to the last damage type you took (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Spore Cloud** · util · enemy · *fire a bursting round; a creeping spore-cloud blooms over the target, slowing it* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Pollen Burst** · phys · allEnemies · *a wide fan of fire across the line; seeds a stack of Infestation on each foe it touches* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Rooting Spores** · util · enemy · *rounds burst into clutching growth; Entangle the target so it can't close or flee (rooted)* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Festering Volley** · phys · enemy · *a rapid burst that extends and deepens the target's existing Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Resistant Chamber** · buff · self · *load an adaptive strain: your next several rounds heal you a little on hit and you shrug off the last harm a touch better* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Strain Reload** · buff · self · *Evolve your loaded strain mid-fight: your rounds hit harder and seed deeper Infestation for several turns* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Choke Volley** · util · allEnemies · *spray a spreading spore-haze across the line: all foes briefly rooted and slowed in the cloud* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Spreading Fire** · phys · allEnemies · *a sweeping volume of fire; a foe slain by it spreads its Infestation to the rest of the line* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Pheromone Trap** · util · allEnemies · *seed a lure-cloud on the field: foes drawn into it are slowed and their accuracy fouled by the spores* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Cloudkill Round** · phys · allEnemies · *rake the line; refresh and Bloom the Infestation on every foe a stage* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Self-Symbiote Load** · buff · self · *graft the symbiote to your draw: for several turns kills and heavy hits drink vitality back to you (Metabolize, self only)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Acclimating Rounds** · buff · self · *after taking a damage type, sharply grow resistance to it; gain brief self-Regen (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Suppression Cloud** · util · allEnemies · *a thick spore-bank rolls over the line: rooted and their next volley of attacks falters (accuracy down)* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Saturating Spores** · phys · allEnemies · *a saturating volley whose Infestation can no longer be cleansed off the foes it hits this fight* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Sporechoke Field** · util · allEnemies · *the whole field overgrows with spores: the line is held in clutching growth — rooted and unable to reach the back row* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Plaguehail** · phys · allEnemies · *an apex line-spray that applies max-duration, fully-Bloomed Infestation across the arc* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Apex Chamber** · buff · self · *push your loaded strain to its peak form: large lasting bulk, heavy resistance, and self-Regen for several turns* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Contagion Hail** · phys · allEnemies · *empty both barrels across the whole line, flooding every foe with Infestation stacks at once* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Mutagen Reload** · buff · self · *Evolve your chambered strain a full stage: for several turns your rounds carry a stronger, deeper-stacking Infestation* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Self-Mending Strain** · buff · self · *Metabolize: devour every debuff on yourself, healing for each and growing brief bulk (self only)* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Tangling Cloud** · util · allEnemies · *a rolling spore-bank clamps the line: all foes rooted for several turns, unable to flee the volley* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Spore Bloom Round** · mag · allEnemies · *Bloom the Infestation on the whole line a full stage — it stacks higher, ticks harder, and now spreads on each death* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Hive Lockdown** · util · allEnemies · *stake a spore-hive over the field: while it holds, rooted foes cannot leave the kill-box and the cloud threatens the back row* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Strainwork Chamber** · phys · allEnemies · *a volley whose damage scales with the total Infestation stacks across the line; refreshes them* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Adaptive Discharge** · buff · self · *for several turns, each foe you fell Evolves your strain a stage (more potent rounds) and refunds you health (Evolution, self only)* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Symbiote Reload** · buff · self · *enter your apex survival form: large self-Regen + lasting bulk that grows each turn it holds, while your rounds keep firing (self only)* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Numbing Cloud** · util · allEnemies · *a heavy paralytic spore-bank rings the field: the line is rooted, torn if it moves, and its swings falter* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Outbreak Volley** · phys · allEnemies · *a fan of fire that detonates a downed host's Bloomed Infestation, reseeding it onto every other foe (Overgrowth across the line)* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Spore Cyclone Round** · util · allEnemies · *a whirling spore-storm sweeps the line: all foes rooted and Exposed (they take more from the whole party) while they remain in the cloud* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Brood Volley** · mag · allEnemies · *the Infestation on every foe Evolves a stage — it ticks harder and erupts onto a neighbor on each death* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Engineered Round** · buff · self · *for the duration, kills and heavy volleys refund health and ANIMA and Evolve your strain; the effect ramps (self only)* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Living Magazine** · buff · self · *Evolve to your apex strain: cap incoming damage, deep self-Regen, and immunity to the damage types you've Adapted to, while the chamber keeps cycling (self only)* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Saturation Field** · util · allEnemies · *imprison the whole line in a living spore-cage: a long root none can break, holding them in the volley's arc* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Pandemic Volley** · mag · allEnemies · *flood the line with a deep, un-cleansable Infestation that keeps multiplying and spreads on every death* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Wildfire Spores** · util · allEnemies · *the field becomes a total spore-garden: root and Expose the entire line and keep them rooted for the duration — none escape the cloud* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · The Endless Hail** *(Spore Volley)* · allEnemies · *empty an unending hail of spore-rounds into the whole line — max-duration Evolved Infestation on every foe, and each death erupts in Overgrowth that reseeds onto every survivor: an unstoppable outbreak sprayed through the pack* · `proposed`
- **B · Strainshot Verdict** *(Mutagen Round)* · self · *the chamber reaches its final evolution — for the duration you cannot be reduced below 1 HP, regenerate each turn, grow resistance to everything that strikes you, and every round mutates a stage stronger: you simply outlast and out-gun the fight (self only)* · `proposed`
- **C · The Spreading Garden** *(Hive Field)* · allEnemies · *the field erupts into a devouring spore-jungle — the entire line is rooted, choked, and Exposed for the duration, held fast in the cloud with no escape to the back row* · `proposed`
- **Brood Saturation** *(neutral/fusion)* · allEnemies · *both barrels and every spore at once — one saturating volley roots and infests the whole line, the contagion Blooms and detonates across every foe, and you Metabolize the carnage to Evolve, harden, and heal yourself (self only)* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Infesting Salvo** · *your volleys' Infestation stacks higher and spreads to one more foe on a host's death* · `proposed`
- **B · Hot Chamber** · *your loaded strain Evolves to its next stage a step sooner* · `proposed`
- **C · Deepclutch** · *your roots and Entangle effects last longer* · `proposed`

**Set @ MNA 60**
- **A · Sporebearer** · *foes Infested by your fire take increased damage from the whole party* · `proposed`
- **B · Quick Acclimation** · *you grow resistance to a damage type a step faster after it hits you (Adaptation)* · `proposed`
- **C · Hold the Cloud** · *while a foe is rooted by you, it cannot reach your back row at all* · `proposed`

**Set @ MNA 90**
- **A · Perennial Outbreak** · *your Infestation always spreads on a host's death, even when reduced* · `proposed`
- **B · Apex Hardening** · *while you have self-Regen, you take reduced damage and your Evolved strain never decays while you sustain it* · `proposed`
- **C · Strangling Garden** · *your spore-fields also disarm — rooted foes in the cloud can't attack at all* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Dual Pistols (the Gunslinger family).** The Sporecaster is
  the **back-row contagion-sprayer**: spore-rounds that fan Infestation across the line and spread on
  death, **evolving/adaptive shots** (the chambered strain mutates), and **spore-cloud zone-control**.
  Distinct from the SOL **Gunslinger Solaris** (doubled-AGI pure crit-spray that rakes Burn), the NOX
  **Cryovex** (Chill-rounds spray → Frozen → shatter-shot), the QUANTA **Entropic Echo** (ricocheting
  echo/probability shots, crit/dodge swings), and the UMBRAXIS **Orbitalist** (gravity-curved rounds
  that pull/cluster, Drain). Only the Sporecaster's volley *infests* and *grows*, and its control is
  *living* (spore-clouds/roots), not Chill, gravity, or probability.
- **Same-archetype — vs its Rifle cousin Genewarden (the spray vs the injection).** Both are ANIMA
  ranged back-liners on the contagion theme, so the split must be airtight. **Genewarden is the
  *precision* gene-injection marksman** — *one* engineered strain into *one* marked target, the single
  injection. The Sporecaster shares none of that: it is the **spore-SPRAY that floods the whole line**
  (AoE double-tap volume, not a single aimed shot, no mark→execute), winning by **saturation** rather
  than precision. Genewarden aims and injects one foe; the Sporecaster fans living fire across the
  pack — and both keep only *themselves* alive (each a non-healer per ledger #16).
- **Same-attunement (#10) — ANIMA concept budget & ledger #16.** It reuses the ANIMA *signature*
  (Infestation, the Seed→Bloom→Overgrowth chain, Evolution/Adaptation/Metabolize) freely — that's the
  shared identity — but **honors ratified ledger #16 in full: it is NOT a party-healer.** No
  `ally`/`allAllies` heal, no shared Regen, no party HoT appears anywhere in the kit; every sustain
  effect is `self`. It also does **not** pile onto a saturated ANIMA role: party-healing belongs to the
  **Staff (Genesis Sage)** + the **Hammer (Lifekeeper)**; *summoned* life to the **S&S (Soul-Bound
  Aegis)**; the *adaptation duelist* to the **swords (Pulse Arbiter)**; the *self-sustain melee
  contagion applicator* to the **daggers (Symbiote Hunter)**; the *line-cleave contagion + territorial
  reach* to the **Two-Hander (Apex Dominion)**; the *precision single-injection mark* to the **Rifle
  (Genewarden)**. The Sporecaster's seat — **ranged AoE spore-spray that floods the line with
  Infestation + evolving/adaptive fire + living spore-cloud zone-control, as a non-healing back-row
  gunner** — is held by no other ANIMA class.

### NO party-healing — explicit confirmation

This kit contains **zero** party heals: scanned every entry — no `ally` or `allAllies` `heal` target,
no shared/party Regen, no party HoT. The only sustain is `self`-targeted: VIT bulk, **Adaptation**
(resistance growth), the self-only **Regen** mirror of the DoT, and **Metabolize** (heal *yourself*
off kills/debuffs). The Sporecaster is a **non-healer** per ledger #16.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (specials 5…95; sigs 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary AGI ← Dual Pistols · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA (compounds) | ✓ |
| Provenance on every entry (row/lanes/seat/Gunslinger framing `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Gunslinger siblings *and* from Genewarden | ✓ |
| Same-attunement concept budget (#10) — reuses ANIMA signature only; honors ledger #16 (no saturated-role pile-on) | ✓ |
| **NOT A PARTY-HEALER (ledger #16):** no `ally`/`allAllies` heal, no shared Regen, no party HoT; all sustain is `self` | ✓ |
