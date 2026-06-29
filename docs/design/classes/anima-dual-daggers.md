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
game — twin-strike means two infections per swing — fused to a **VIT + self-Regen + lifesteal**
sustain engine that lets 40 HP hold the front line. It does not summon, and it does **not** heal the
party — ANIMA's party-healing belongs to the Genesis Sage (Staff) and the Lifekeeper (Hammer). The
Hunter helps the team a different way: it **brands a quarry** so the whole party's hits seed and
amplify *its* contagion, Exposes that foe to extra punishment, and turns each kill into a fresh
outbreak. The only living thing it commands is the strain in its own veins and the one breeding in
the enemy.

**Rogue DNA — themed to ANIMA.** (1) **Twin-strike**: the auto and many specials hit *twice* → two
Infestation applications, the game's fastest contagion seeding. (2) **Opening → Finisher**: cheap
fast specials build the Opening, a signature spends it — but the Hunter does **not** invent a combo
resource; it accelerates ANIMA's own phase-transition chain **Seed → Bloom → Overgrowth** (e.g.
blooming stacked Infestation into a burst that *reseeds* onto new hosts). (3) **Tempo lean** — dips
ANIMA's Evolution layer (better turns over time) on its SPD secondary. (4) **Fragility answer** —
not more armor, but **VIT + self-Regen + lifesteal**: it heals *itself* through the knife-edge.

### Lanes *(from-brief — dev-approved)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Contagion** | Infestation-flood — stack the living poison (spreads on host death) with every fast hit; the best applicator in the game | **SPD**, Infestation stacks, DoT-duration | DoT engine / attrition damage | vs tanky/multi-foe HP pools; packs to chain-spread through |
| **B · Parasite** | symbiotic self-sustain — lifesteal + Regen on hit, Metabolize the target's debuffs/corpses to heal & grow | **VIT**, lifesteal, sustain | self-sustaining front-line skirmisher | no dedicated healer; long attrition; solo-pressure |
| **C · Hunter's Bond** | Evolution / contagion-support — a hunter's-mark that **grows** (Seed→Bloom→Overgrowth): the party's hits on the marked foe apply *your* Infestation and Expose it, and on its death the contagion erupts and reseeds onto nearby foes | **VIT**, mark-growth, contagion-spread | support / team enabler (via contagion + damage, never healing) | party with focus-fire DPS; packs to chain an outbreak through |

**Build axes:** attrition-DoT ↔ self-sustain (A↔B) · self-feeding ↔ quarry-branding (B↔C) ·
single-target/spread damage ↔ growing-mark contagion-support (A,B ↔ C). Each lane leans on
**Evolution** — the contagion, the parasite's vigor, and the mark all *grow over time*, so the
Hunter is weak early and overwhelming late. Sustain is **self-only** throughout; lane C supports the
party through contagion and Expose, not healing.

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
- **C · Spore Brand** · util · enemy · *plant a hunter's-mark (Seed): while it lives, the party's hits on the marked foe each seed a stack of your Infestation* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Wilting Edge** · phys · enemy · *two cuts; extends the duration of the target's existing Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Sap the Wound** · phys · enemy · *strike a Infested foe; drink from the contagion to heal yourself* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Scavenge** · util · enemy · *Metabolize a debuff off yourself or a corpse on the field to heal and gain a Bloom* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Pheromone Mark** · util · enemy · *the mark matures (Bloom): the marked foe is Exposed — the whole party crits it more readily* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Festerstrike** · phys · enemy · *a cut that makes the target's Infestation tick harder this turn* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Predator's Mark** · util · enemy · *brand the foe as your quarry: it is Exposed (the party damages it harder) and every party hit deepens its Infestation* · gen **major ANIMA** · cd **medium** · `proposed`

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
- **C · Bloomspread Mark** · util · enemy · *the mark Blooms: the party's hits on the marked foe now stack your Infestation faster and Expose it further each turn* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Cull the Weak** · phys · enemy · *a strike that scales with the target's current Infestation stacks* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Engorge** · phys · enemy · *a gorging lifesteal combo; you heal for a large share and the symbiote swells (Bloom)* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Vile Multiplication** · buff · self · *your lifesteal and Regen multiply for several turns — sustain ramps each turn it holds* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Open Wound** · util · enemy · *split the quarry wide: for several turns the party crits and damages the marked foe harder, and each hit it takes drives your Infestation deeper* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Necrotic Bloom** · mag · enemy · *bloom the target's stacked Infestation into a burst; lesser Infestation reseeds afterward* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Reaping Bond** · util · enemy · *Evolve the mark to Overgrowth: when the marked foe falls, its Infestation erupts and reseeds onto every nearby foe* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Endemic** · mag · allEnemies · *Infestation on every foe Evolves a stage — it ticks harder and spreads on each death* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Eternal Appetite** · buff · self · *for the duration, kills and heavy hits refund health and ANIMA; the effect ramps* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Purge the Strain** · buff · self · *Metabolize every debuff off yourself, healing for each one consumed and swelling the symbiote (Bloom)* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Brood Mark** · util · enemy · *make the quarry a contagion hub: the party's hits on it now spread your Infestation outward to every foe near it* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Living Plague** · mag · allEnemies · *apply a deep, un-cleansable Infestation that keeps multiplying* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Apex Quarry** · util · enemy · *the mark reaches its apex (Overgrowth): the marked foe is fully Exposed, the party's hits flood it with Infestation, and its death erupts across the enemy line* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · Patient Zero** *(Contagion)* · allEnemies · *flood every foe with max-duration Evolved Infestation; each death spreads it onward — an unstoppable epidemic across the enemy line* · `proposed`
- **B · Undying Host** *(Parasite)* · self · *for the duration, every hit massively lifesteals, you cannot be reduced below 1 HP, and the symbiote keeps you regenerating — you simply outlast the fight* · `proposed`
- **C · The Pack Hunts** *(Hunter's Bond)* · enemy · *brand the deadliest foe as the apex quarry and bind the whole party to the hunt — every party hit on it floods it with Evolved Infestation and Exposes it to overwhelming damage, and when it falls the outbreak erupts across the enemy line* · `proposed`
- **The Swarm Consumes** *(neutral/fusion)* · allEnemies · *the contagion blooms and detonates across all foes at once — a burst of Infestation that reseeds onto every survivor, while you alone drink the carnage to heal and refill ANIMA* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Virulence** · *your Infestation stacks higher* · `proposed`
- **B · Bloodhunger Strain** · *your lifesteal heals you for more* · `proposed`
- **C · Pack Brand** · *your hunter's-mark grows a stage faster* · `proposed`

**Set @ MNA 60**
- **A · Plaguebearer** · *foes Infested by you take increased damage from the party* · `proposed`
- **B · Outlast** · *while you have Regen, you take reduced damage* · `proposed`
- **C · Mark of the Pack** · *when any ally strikes the marked foe, it also applies a stack of your Infestation* · `proposed`

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
