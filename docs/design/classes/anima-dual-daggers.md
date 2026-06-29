# Symbiote Hunter — ANIMA × Dual Daggers

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). Lanes, seat, and fragility
> answer are **`from-brief`** — the dev-approved row + sketch in the
> [Dual Daggers family note](./dual-daggers-family.md); the kit abilities are `proposed`. Numberless
> by design; magnitudes are a later balance pass. Mechanics vocabulary (Infestation / Regen / Bloom /
> Evolution / Adaptation / Metabolize / Symbiosis) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). **No summons** (that is the ANIMA
> Sword & Shield / Hammer) — this dagger wins through Infestation + self-sustain.

## Identity (derived + DNA)

- **Class:** Symbiote Hunter · **Attunement × Archetype:** ANIMA × Dual Daggers
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** SPD (← Dual Daggers) — the **durable** dagger
  that can actually hold the front row
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* — reframed Poison that
  multiplies/stacks and **spreads on the host's death**; engine keyword `poison`) · ANIMA suite of
  **Regen / Bloom / Evolution / Adaptation / Metabolize / Symbiosis**

**Fantasy.** A poison-skirmisher bonded to a living symbiote — the *survivable* dagger. Where the
QUANTA and SOL daggers are glass cannons that kill before they're killed, the Symbiote Hunter
**outlasts**. It coats twin blades in a contagion that breeds inside the wound, drinks vitality back
with every cut, and only grows stronger as the fight drags on. The fastest **applicator** in the
game — twin-strike means two infections per swing — fused to a **VIT + Regen + lifesteal** sustain
engine that lets 40 HP hold the front line. It does not summon; the only living thing it commands is
the strain in its own veins and the one breeding in the enemy.

**Rogue DNA — themed to ANIMA.** (1) **Twin-strike**: the auto and many specials hit *twice* → two
Infestation applications, the game's fastest contagion seeding. (2) **Opening → Finisher**: cheap
fast specials build the Opening, a signature spends it — but the Hunter does **not** invent a combo
resource; it accelerates ANIMA's own phase-transition chain **Seed → Bloom → Overgrowth** (e.g.
blooming stacked Infestation into a burst that *reseeds* onto new hosts). (3) **Tempo lean** — dips
ANIMA's Evolution layer (better turns over time) on its SPD secondary. (4) **Fragility answer** —
not more armor, but **VIT + Regen + lifesteal**: it heals through the knife-edge.

### Lanes *(from-brief — dev-approved)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Contagion** | Infestation-flood — stack the living poison (spreads on host death) with every fast hit; the best applicator in the game | **SPD**, Infestation stacks, DoT-duration | DoT engine / attrition damage | vs tanky/multi-foe HP pools; packs to chain-spread through |
| **B · Parasite** | symbiotic self-sustain — lifesteal + Regen on hit, Metabolize the target's debuffs/corpses to heal & grow | **VIT**, lifesteal, sustain | self-sustaining front-line skirmisher | no dedicated healer; long attrition; solo-pressure |
| **C · Hunter's Bond** | Evolution / support — a hunter's-mark that **grows** (Seed→Bloom→Overgrowth), shares symbiotic Regen with allies, exposes the marked target | **VIT**, mark-growth, party-buff | support / team enabler | party with focus-fire DPS; comps that want shared Regen |

**Build axes:** attrition-DoT ↔ self-sustain (A↔B) · self-feeding ↔ team-feeding (B↔C) ·
single-target/spread damage ↔ growing-mark support (A,B ↔ C). Each lane leans on **Evolution** — the
contagion, the parasite's vigor, and the mark all *grow over time*, so the Hunter is weak early and
overwhelming late.

---

## Auto-attack *(unlaned)*

- **Twinfang Venom** · phys · enemy · *two quick venom-slick cuts; each can seed a stack of Infestation* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Spore Cut** · phys · enemy · *a fast double cut; applies Infestation, building the Opening* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Vital Theft** · phys · enemy · *a quick cut that lifesteals a portion back to you* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Marrow Drink** · phys · enemy · *strike; heal more the lower the target's HP, and gain brief Regen* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Quarry's Brand** · util · enemy · *plant a hunter's-mark (Seed); the marked foe takes a little more from the party* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Pestilence Coat** · buff · self · *coat your blades — your next several hits each seed Infestation* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Grafted Vigor** · buff · ally · *graft a strand of your symbiote onto an ally: a Regen that grows each turn (Bloom)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Wilting Edge** · phys · enemy · *two cuts; extends the duration of the target's existing Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Sap the Wound** · phys · enemy · *strike a Infested foe; drink from the contagion to heal yourself* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Scavenge** · util · enemy · *Metabolize a debuff off yourself or a corpse on the field to heal and gain a Bloom* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Pheromone Mark** · util · enemy · *the mark matures (Bloom): the marked foe is Exposed — the whole party crits it more readily* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Festerstrike** · phys · enemy · *a cut that makes the target's Infestation tick harder this turn* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Symbiont Graft** · buff · ally · *link your vitality to an ally: a share of the damage they take is healed back over time* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Reaping Spores** · phys · enemy · *strike; if the target dies soon after, its Infestation spreads to a nearby foe* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Drain the Host** · phys · enemy · *heavy lifesteal cut; overheal becomes brief Regen* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Adaptive Hide** · buff · self · *after taking a damage type, grow resistance to it (Adaptation); also heals you a little* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Spreading Sickness** · util · allEnemies · *the marked foe's Infestation leaps to every other foe at lesser strength* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Strain Mutation** · mag · enemy · *Evolve the target's Infestation a stage — it now stacks higher and ticks harder* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Apex Strain** · buff · self · *Evolve your venom (Overgrowth): your Infestation applications are stronger for several turns* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Plaguefang** · phys · enemy · *two heavy cuts that apply max-duration Infestation* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Carrion Feast** · phys · enemy · *a brutal lifesteal blow; if the target is near death, heal hugely and gain ANIMA* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Contagious Bite** · phys · enemy · *a deep envenomed bite that floods the target with Infestation stacks* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Bloodparasite** · buff · self · *for a few turns, every hit you land lifesteals heavily and seeds Regen* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Hollow Out** · phys · enemy · *Metabolize the target — devour its buffs to heal yourself and gain a Bloom* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Bonded Mark** · util · enemy · *seal a growing hunter's-mark; while it lives, the party's hits on it apply your Infestation too* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Pandemic** · mag · allEnemies · *seed Infestation on every foe at once* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Hostbloom** · buff · allAllies · *the symbiote blooms across the party: a growing Regen that strengthens each turn* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Cull the Weak** · phys · enemy · *a strike that scales with the target's current Infestation stacks* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Engorge** · phys · enemy · *a gorging lifesteal combo; you heal for a large share and the symbiote swells (Bloom)* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Vile Multiplication** · buff · self · *your lifesteal and Regen multiply for several turns — sustain ramps each turn it holds* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Symbiotic Surge** · buff · allAllies · *graft a strand of symbiote onto each ally: the party shares your Regen for several turns* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Necrotic Bloom** · mag · enemy · *bloom the target's stacked Infestation into a burst; lesser Infestation reseeds afterward* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Reaping Bond** · util · enemy · *Evolve the mark to Overgrowth: when the marked foe falls, the party gains a burst of Regen* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Endemic** · mag · allEnemies · *Infestation on every foe Evolves a stage — it ticks harder and spreads on each death* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Eternal Appetite** · buff · self · *for the duration, kills and heavy hits refund health and ANIMA; the effect ramps* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Devour the Affliction** · heal · allAllies · *Metabolize every debuff off the party, healing for each one consumed* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Hivebrood** · buff · allAllies · *bind the party to one symbiotic organism: shared growing Regen + a cleanse* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Living Plague** · mag · allEnemies · *apply a deep, un-cleansable Infestation that keeps multiplying* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Apex Predator's Bond** · buff · allAllies · *the mark reaches its apex: the marked foe is fully Exposed and the party's Regen surges greatly* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · Patient Zero** *(Contagion)* · allEnemies · *flood every foe with max-duration Evolved Infestation; each death spreads it onward — an unstoppable epidemic across the enemy line* · `proposed`
- **B · Undying Host** *(Parasite)* · self · *for the duration, every hit massively lifesteals, you cannot be reduced below 1 HP, and the symbiote keeps you regenerating — you simply outlast the fight* · `proposed`
- **C · The Pack Hunts** *(Hunter's Bond)* · allAllies · *mark the deadliest foe and bind the whole party to it — everyone shares overwhelming Regen and pours amplified damage into the marked quarry* · `proposed`
- **The Swarm Consumes** *(neutral/fusion)* · allEnemies · *the contagion blooms and detonates across all foes at once — a burst of Infestation that reseeds, while you drink the carnage to heal the party* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Virulence** · *your Infestation stacks higher* · `proposed`
- **B · Bloodhunger Strain** · *your lifesteal heals you for more* · `proposed`
- **C · Pack Brand** · *your hunter's-mark grows a stage faster* · `proposed`

**Set @ MNA 60**
- **A · Plaguebearer** · *foes Infested by you take increased damage from the party* · `proposed`
- **B · Outlast** · *while you have Regen, you take reduced damage* · `proposed`
- **C · Bonded Hunter** · *allies sharing your symbiotic Regen also heal a little when they strike the marked foe* · `proposed`

**Set @ MNA 90**
- **A · Endless Appetite** · *your Infestation always spreads on the host's death, even when reduced* · `proposed`
- **B · Sustained** · *your lifesteal and Regen ramp the longer the fight runs (Evolution)* · `proposed`
- **C · Marked Quarry** · *your mark exposes the foe further — the party crits it more often* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary SPD ← Dual Daggers · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA | ✓ |
| Provenance flag on every entry (lanes/seat/fragility `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
</content>
</invoke>
