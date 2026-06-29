# Soul-Bound Aegis — ANIMA × Sword & Shield

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes locked in the
> [Sword & Shield family note](./sword-and-shield-family.md); every ability is `proposed` — ratified canon (Dara, 2026-06-28). Numberless by design. Mechanics vocabulary (summons, Entangle, Regen, Bloom, Evolve) draws
> on the [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified canon (Dara, 2026-06-28).
> Note: ANIMA's primary stat **VIT** is the proposed MGC→VIT rename (framework ledger #10).

## Identity (derived + DNA)

- **Class:** Soul-Bound Aegis · **Attunement × Archetype:** ANIMA × Sword & Shield
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** DEF (← Sword & Shield)
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation/Regen** + **Evolution**; defense via **summoned life, entangle, and empowerment/wards**

**Fantasy.** The Soul-Bound Aegis defends not by standing in the way but by *growing* a living
bulwark — beasts that body-block, brambles that entangle the enemy, and symbiotic life grafted onto
allies to make them stronger and shield them. It is the **summoner-protector**: a shield-bearer whose
true shield is an ecosystem. Where the other guardians soak, freeze, or dodge a blow, the Aegis ensures
the blow **lands on a beast, never connects through the thorns, or breaks against a grafted ward.**

**Three kingdoms of life.** The lanes are three *kinds of summoned life that behave differently*, and
any summon can **Evolve** mid-fight (Seed→Bloom→Overgrowth — a summon changes into a stronger form).
**Summons are per-battle** — conjured within a fight, reset between battles; no out-of-combat
menagerie to manage.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Guardian** *(fauna)* | One big, durable **beast body-blocker** — taunts, intercepts, soaks hits *for* the party | **VIT**, summon HP, taunt | main-tank-by-proxy | you want a wall that isn't *you*; sustain gear |
| **B · Thornwild** *(flora)* | Spreading **plants that entangle/root/disarm** foes + thorn-walls — deny the enemy's offense | control (Entangle), deterrent | disruptor / lockdown | vs melee swarms; protecting a back line |
| **C · Symbiote** *(symbiosis)* | **Growing symbiotic life** grafted onto allies — escalating buffs, absorb-wards, damage-redirect | **VIT**, Bloom buffs, wards | empower / protect | a party you want stronger and shielded; long fights |

**Build axes:** soak ↔ deny (A↔B) · self-summoning ↔ ally-grafting (A↔C) · bodies/control ↔ empower/ward
(A,B ↔ C). Each lane can Evolve its life-form for a mid-fight power spike.

---

## Auto-attack *(unlaned)*

- **Graft** · phys · enemy · *a shield strike that grafts a seed of life, feeding the pool* · gen **minor ANIMA** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Summon Warden** · buff · self · *conjure a Guardian beast that taunts and body-blocks* · gen **moderate ANIMA** · cd **medium**
- **B · Bramble** · util · enemy · *roots burst up; Entangle the target (rooted)* · gen **moderate ANIMA** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Thorn Wall** · buff · allAllies · *raise a thorn barrier; foes attacking through it take damage* · gen **moderate ANIMA** · cd **medium**
- **C · Wardgraft** · buff · ally · *graft a symbiotic ward onto an ally: it absorbs a share of the next hits* · gen **moderate ANIMA** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Feral Bond** · buff · self · *your Guardian beast Evolves a stage: more HP and taunt* · gen **moderate ANIMA** · cd **medium**
- **C · Symbiosis** · buff · ally · *link to an ally: a share of the damage they take is redirected to your summons and absorbed* · gen **moderate ANIMA** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Maul** · phys · enemy · *command the Guardian to maul a foe* · gen **moderate ANIMA** · cd **short**
- **B · Snare Field** · util · allEnemies · *Entangle all foes briefly (rooted)* · gen **moderate ANIMA** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Bramblemaze** · util · allEnemies · *thorns slow and root; foes that move take damage* · gen **moderate ANIMA** · cd **medium**
- **C · Verdant Bulwark** · buff · allAllies · *a wave of growth grafts a thin absorb-ward onto the whole party* · gen **major ANIMA** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Beast Pack** · buff · self · *summon a second, lesser beast (numbers)* · gen **moderate ANIMA** · cd **medium**
- **C · Bloomgraft** · buff · ally · *graft a Bloom onto an ally: their ATK/power grows each turn it lives* · gen **major ANIMA** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Goad** · buff · self · *your beasts taunt all foes and toughen* · gen **moderate ANIMA** · cd **medium**
- **B · Strangleroot** · util · enemy · *deep Entangle: rooted and disarmed (its attacks fail)* · gen **moderate ANIMA** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Thornburst** · phys · allEnemies · *the thorn barrier explodes: damage + re-Entangle* · gen **major ANIMA** · cd **medium**
- **C · Heartwood Bastion** · buff · allAllies · *plant a tree that pulses a growing absorb-ward to the party each turn* · gen **moderate ANIMA** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Apex Evolve** · buff · self · *Evolve your Guardian to its apex form (huge body-blocker)* · gen **moderate ANIMA** · cd **long**
- **C · Bloomsurge** · buff · allAllies · *consume Bloom stacks for a burst of party power + a refreshed ward* · gen **major ANIMA** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Stampede** · phys · allEnemies · *all your summoned beasts charge as one* · gen **major ANIMA** · cd **medium**
- **B · Bramble Prison** · util · enemy · *cage a foe in thorns: long root + heavy deterrent* · gen **major ANIMA** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Bonded Beast** · buff · self · *summon a stronger Guardian that intercepts hits aimed at allies* · cost **med ANIMA** · cd **medium**
- **B · Stranglehold** · util · enemy · *fully root and disarm a foe for several turns* · cost **med ANIMA** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Bramble Bastion** · buff · allAllies · *encircle the party in thorns: attackers take damage and may be rooted* · cost **med ANIMA** · cd **medium**
- **C · Aegis Bloom** · buff · allAllies · *a surge of growth: graft a growing absorb-ward onto the whole party* · cost **med ANIMA** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Pack Leader** · buff · self · *summon a pack of beasts at once (a wall of bodies)* · cost **med ANIMA** · cd **long**
- **C · Lifebond** · buff · allAllies · *link the whole party: damage to any one is split across the bond and partly absorbed by your summons* · cost **med ANIMA** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Devour** · phys · enemy · *your Guardian devours a foe, healing itself and you* · cost **med ANIMA** · cd **medium**
- **B · Choking Thicket** · util · allEnemies · *root all foes and reduce their accuracy (vines foul their swings)* · cost **med ANIMA** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Worldroot Wall** · buff · allAllies · *a massive thorn rampart: blocks the next hit on each ally + roots attackers* · cost **high ANIMA** · cd **medium**
- **C · Symbiote Rampart** · buff · allAllies · *graft a heavy, lasting absorb-ward across the whole party* · cost **high ANIMA** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Primal Evolution** · buff · self · *instantly Evolve all your summons to a higher form* · cost **high ANIMA** · cd **long**
- **C · Symbiotic Host** · buff · ally · *graft a symbiote that absorbs a share of an ally's damage and grows their power as it feeds* · cost **med ANIMA** · cd **medium**

**@ MNA 70** *(A/B)*
- **A · Behemoth** · buff · self · *summon a single colossal beast that taunts everything and soaks enormous damage* · cost **high ANIMA** · cd **long**
- **B · Thornmaw Snare** · util · allEnemies · *a field of devouring thorns: root + heavy deterrent + accuracy down* · cost **high ANIMA** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Briar Cage** · util · allEnemies · *imprison all foes in brambles: long root; they cannot reach the back line* · cost **high ANIMA** · cd **long**
- **C · Worldgraft** · buff · allAllies · *plant a great tree: a powerful growing party-wide ward + escalating power buff* · cost **high ANIMA** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Alpha Ascendant** · buff · self · *your apex beast bonds to you: it intercepts every hit aimed at the party for a few turns* · cost **high ANIMA** · cd **long**
- **C · Communion** · buff · allAllies · *entwine the party's life: a massive shared absorb-ward + a growing power Bloom + cleanse* · cost **high ANIMA** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · Gaia's Menagerie** *(Guardian)* · self · *summon a full host of apex beasts that body-block and maul for the rest of the fight*
- **B · The Devouring Grove** *(Thornwild)* · allEnemies · *the field erupts in carnivorous thorns — all foes rooted, disarmed, and bleeding deterrent damage*
- **C · Eternal Bloom** *(Symbiote)* · allAllies · *the party becomes one organism: huge ever-growing power Blooms and a shared absorb-ward that splits and soaks all incoming damage for the duration*
- **Genesis** *(neutral/fusion)* · all · *a burst of raw life — summon a Guardian, root all foes, and graft a party-wide absorb-ward at once*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Beastmaster** · *your summons are tougher and last longer*
- **B · Deeproot** · *your Entangle/roots last longer*
- **C · Greenheart** · *your grafted Bloom buffs grant more power*

**Set @ MNA 60**
- **A · Pack Tactics** · *your summons deal more the more of them are alive*
- **B · Bramblethorn** · *foes attacking through your thorns take extra damage*
- **C · Bloomtender** · *your Bloom buffs grow faster*

**Set @ MNA 90**
- **A · Apex Predator** · *your Guardian can Evolve one stage further (apex+)*
- **B · Chokevine** · *your roots also disarm — rooted foes can't attack at all*
- **C · Worldtree** · *your grafted wards pulse to the whole party and persist longer*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary DEF ← Sword & Shield · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
