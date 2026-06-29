# Lifekeeper — ANIMA × Hammer

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes from the [Hammer family note](./hammer-family.md);
> every ability is `proposed`. Numberless. Mechanics vocabulary (Regen/Bloom/Infestation/Evolve +
> Breaker stagger) draws on the [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified.
> Heals through *impact* — distinct from the ANIMA S&S summoner and the eventual ANIMA Staff main-healer.

## Identity (derived + DNA)

- **Class:** Lifekeeper · **Attunement × Archetype:** ANIMA × Hammer
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** STR (← Hammer) — a life-fuelled front-liner
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Regen / Bloom / Infestation** + **Evolution**; Breaker toolkit (stagger · Shatter)

**Fantasy.** The Lifekeeper keeps the party alive *by wrecking the enemy*. Every blow is a **lifequake**
— the maul comes down and life erupts from the impact: allies are healed, wounds close, the ground
blooms. It is the **sustain-bruiser**: a warpriest who feeds on combat and pulses that vigor back into
the party. It can plant its feet as a front-line damage dealer that doubles as a **DPS-based AoE
secondary healer** — never the dedicated healer (that's the ANIMA Staff), but the one who keeps a
party standing *while* breaking the line.

**Breaker flavor — the lifequake.** Impact erupts with growth: AoE slams that heal, blows that
metabolize the enemy into your own (and the party's) vitality.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Lifequake** | AoE ground-slams that **heal the party** as they damage | **VIT**/STR, AoE heal | DPS / AoE secondary healer | no dedicated healer; clustered fights |
| **B · Bloodfeast** | **Metabolize-on-hit** — lifesteal, overheal-into-shields, self-sustain | lifesteal, Infestation | self-sustaining bruiser | solo front-line; attrition |
| **C · Wildgrowth** | Impacts seed **flora totems / Regen fields** + Bloom buffs (terrain, not creatures) | totems, Regen, Bloom | zone support / sustain | static fights; protecting a spot |

**Build axes:** party-heal ↔ self-sustain (A↔B) · active smashing ↔ planted totems (A,B↔C).

---

## Auto-attack *(unlaned)*

- **Heartstrike** · phys · enemy · *a heavy maul blow that pulses a little life back to you* · gen **minor ANIMA** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Quakeheal** · phys · allEnemies · *ground-slam: deal damage and heal the party a little* · gen **moderate ANIMA** · cd **short**
- **B · Bloodstrike** · phys · enemy · *heavy blow; lifesteal a portion to yourself* · gen **moderate ANIMA** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Feast** · phys · enemy · *strike; heal more the lower the target's HP (metabolize)* · gen **moderate ANIMA** · cd **short**
- **C · Seedslam** · phys · enemy · *a slam that plants a Regen seed on an ally* · gen **moderate ANIMA** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Tremorbloom** · phys · allEnemies · *shockwave; party heal scales with foes hit* · gen **moderate ANIMA** · cd **medium**
- **C · Totem Smash** · buff · self · *plant a healing totem that pulses Regen to the party* · gen **moderate ANIMA** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Verdant Quake** · phys · allEnemies · *AoE slam + a party Regen pulse* · gen **moderate ANIMA** · cd **medium**
- **B · Rend and Feed** · phys · enemy · *two hits; lifesteal + apply Infestation* · gen **moderate ANIMA** · cd **short**

**@ MNA 45** *(B/C)*
- **B · Carnage** · phys · allEnemies · *AoE smash; lifesteal from all foes hit* · gen **major ANIMA** · cd **medium**
- **C · Grove Totem** · buff · allAllies · *plant a grove: a party Regen field for several turns* · gen **moderate ANIMA** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Lifequake** · phys · allEnemies · *a big AoE slam; substantial party heal* · gen **major ANIMA** · cd **medium**
- **C · Bloomfield** · buff · allAllies · *seed a field granting growing Bloom buffs to the party* · gen **moderate ANIMA** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Renewal Slam** · phys · enemy · *strike; cleanse a debuff from an ally and heal them* · gen **moderate ANIMA** · cd **medium**
- **B · Gorge** · phys · enemy · *heavy blow; big lifesteal that overheals into a shield* · gen **moderate ANIMA** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Bloodquake** · phys · allEnemies · *AoE; lifesteal from all foes + Infestation* · gen **major ANIMA** · cd **medium**
- **C · Lifespring Totem** · buff · allAllies · *a totem that pulses a larger party heal each turn* · gen **moderate ANIMA** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Seismic Renewal** · phys · allEnemies · *a massive AoE slam; large party heal + Regen* · gen **major ANIMA** · cd **medium**
- **C · Overgrowth Totem** · buff · allAllies · *consume Bloom to make the totem erupt: a burst party heal* · gen **major ANIMA** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Genesis Quake** · phys · allEnemies · *an apex AoE slam that heals the party greatly* · gen **major ANIMA** · cd **medium**
- **B · Apex Feast** · phys · enemy · *a devastating lifesteal blow; overheal → party shield* · gen **major ANIMA** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Healing Quake** · phys · allEnemies · *AoE slam with a real party heal — the secondary-healer button* · cost **med ANIMA** · cd **medium**
- **B · Bloodthirst** · buff · self · *for a few turns, all your hits lifesteal heavily* · cost **med ANIMA** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Sanguine Smash** · phys · enemy · *heavy lifesteal; bonus heal if you're below half HP* · cost **med ANIMA** · cd **medium**
- **C · Sanctuary** · buff · allAllies · *plant a sanctuary totem: a strong party Regen zone* · cost **med ANIMA** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Revival Quake** · phys · allEnemies · *an AoE slam that can revive a fallen ally at low HP* · cost **med ANIMA** · cd **long**
- **C · Bloomburst Totem** · buff · allAllies · *the field blooms: party heal + Bloom buffs that grow* · cost **med ANIMA** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Tide of Life** · heal · allAllies · *slam the ground; a wave of healing washes the party* · cost **med ANIMA** · cd **medium**
- **B · Ravage** · phys · enemy · *a brutal lifesteal combo; heals you for a large share* · cost **med ANIMA** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Crimson Harvest** · phys · allEnemies · *AoE; lifesteal from every foe, healing you greatly* · cost **high ANIMA** · cd **medium**
- **C · Eldertree** · buff · allAllies · *raise a great tree: powerful party Regen for the rest of the fight* · cost **high ANIMA** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Cataclysmic Renewal** · phys · allEnemies · *an enormous AoE slam + party heal scaling with foes hit* · cost **high ANIMA** · cd **long**
- **C · Verdant Heart** · buff · allAllies · *a heart-totem that links the party: shared healing* · cost **med ANIMA** · cd **medium**

**@ MNA 70** *(A/B)*
- **A · Earthmend** · phys · allEnemies · *a slam that mends: AoE damage + the biggest single party heal* · cost **high ANIMA** · cd **long**
- **B · Feeding Frenzy** · buff · self · *heavy hits refund health and ANIMA; the effect ramps* · cost **high ANIMA** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Lifereave** · phys · allEnemies · *AoE lifesteal that overheals the party into shields* · cost **high ANIMA** · cd **long**
- **C · Worldbloom** · buff · allAllies · *the field erupts in life: massive party Regen + cleanse* · cost **high ANIMA** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Resurrection Quake** · phys · allEnemies · *an apex slam; revive all fallen allies at partial HP* · cost **high ANIMA** · cd **long**
- **C · Tree of Ages** · buff · allAllies · *plant an eternal tree: continuous large party heal + Bloom* · cost **high ANIMA** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · Cataclysm of Life** *(Lifequake)* · allEnemies · *the earth heaves — massive AoE damage and a full-party heal at once*
- **B · Sanguine Apotheosis** *(Bloodfeast)* · self · *for the duration, every hit massively lifesteals and overheals the party into shields*
- **C · The World Tree** *(Wildgrowth)* · allAllies · *raise the World Tree — the party is bathed in overwhelming Regen and revived on death for the duration*
- **Genesis Bloom** *(neutral/fusion)* · allEnemies · *a burst of raw life: an AoE smash, a party heal, and a lasting Regen field at once*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Mender** · *your slams heal the party for more*
- **B · Bloodhunger** · *your lifesteal heals for more*
- **C · Greenthumb** · *your totems and fields last longer*

**Set @ MNA 60**
- **A · Seismic Mender** · *the more foes your slam hits, the more it heals*
- **B · Overfeed** · *lifesteal beyond full HP becomes a shield*
- **C · Rooted Grove** · *your totems pulse to a wider area*

**Set @ MNA 90**
- **A · Lifebringer** · *your AoE heals can revive low or fallen allies*
- **B · Insatiable** · *your lifesteal ramps the longer you keep hitting*
- **C · Evergreen** · *your totems and trees persist and pulse stronger over time*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary STR ← Hammer · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA | ✓ |
| Provenance flag on every entry (all `proposed`) | ✓ |
| Ability names globally unique (invariant #8) | ✓ |
