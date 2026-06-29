# Graviton Warden — UMBRAXIS × Hammer

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes from the [Hammer family note](./hammer-family.md);
> every ability is `proposed`. Numberless. Mechanics vocabulary (Crush/Anchored/pull + Drain) draws on
> the [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified. A **bruiser** (offense
> via gravity), distinct from the UMBRAXIS S&S **tank** (Tidal Sovereign).

## Identity (derived + DNA)

- **Class:** Graviton Warden · **Attunement × Archetype:** UMBRAXIS × Hammer
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** STR (← Hammer) — a durable, weighty bruiser
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it takes)
- **Attunement signature:** **Crush · Anchored · (pull)**; Breaker toolkit (stagger · Shatter)

**Fantasy.** The Graviton Warden's maul carries the weight of a collapsing star. Its blows **pull
foes into the impact** and **crush** them under mounting gravity — and the longer a foe is pinned, the
heavier the world bears down. Where the Tidal Sovereign *walls* with gravity, the Graviton Warden
*weaponizes* it: a durable front-line that breaks the enemy with sheer mass while standing
unmoved itself. The hammer that bends the floor.

**Breaker flavor — the gravity slam.** Impact **pulls and crushes**: drag clustered foes to a point,
Anchor them, and grind them down with ramping weight, all while DEF keeps the Warden on its feet.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Singularity Slam** | Pull foes into the impact + AoE crush — the cluster breaker | **DEF**/STR, pull, AoE | area bruiser | clustered or scattered packs |
| **B · Crush** | Ramping single-target gravity + Anchor — the heavy executioner | crush ramp, Anchor | single-target breaker | bosses; pinning a key foe |
| **C · Mass** | DEF self-sustain & redirect — breaks while enduring | DEF, mitigation, redirect | durable off-tank bruiser | when the party needs a sturdier front-liner |

**Build axes:** AoE pull ↔ single-target crush (A↔B) · offense ↔ durability/redirect (A,B↔C).

---

## Auto-attack *(unlaned)*

- **Downforce** · phys · enemy · *a maul slam that drops with crushing weight* · gen **minor UMBRAXIS** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Gravity Slam** · phys · allEnemies · *a slam whose shockwave drags nearby foes inward* · gen **moderate UMBRAXIS** · cd **short**
- **B · Pin** · util · enemy · *a heavy blow that Anchors the target (rooted)* · gen **moderate UMBRAXIS** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Weighted Blow** · phys · enemy · *strike; ramping damage if the foe stays Anchored* · gen **moderate UMBRAXIS** · cd **short**
- **C · Root Stance** · buff · self · *plant: gain damage reduction; cannot be moved* · gen **moderate UMBRAXIS** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Implosion** · phys · allEnemies · *pull foes together into a cluster* · gen **moderate UMBRAXIS** · cd **medium**
- **C · Ballast** · buff · self · *convert incoming hits partly into UMBRAXIS (absorb)* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Crater Slam** · phys · allEnemies · *a heavy slam; AoE + brief Anchor near the impact* · gen **moderate UMBRAXIS** · cd **medium**
- **B · Compress** · util · enemy · *gravity squeezes: the target takes more damage (compression vulnerability)* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Heavy Hand** · phys · enemy · *a ramping crush; bonus vs Anchored foes* · gen **moderate UMBRAXIS** · cd **medium**
- **C · Bulwark Slam** · buff · self · *a defensive slam: gain damage reduction + draw aggro* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Collapse Slam** · phys · allEnemies · *pull a cluster in, then crush it* · gen **major UMBRAXIS** · cd **medium**
- **C · Counterweight** · buff · self · *redirect a share of party damage to yourself and reduce it* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Gravity Hammer** · phys · allEnemies · *a slam that amplifies its own weight (heavy AoE)* · gen **moderate UMBRAXIS** · cd **medium**
- **B · Anchorpoint** · util · enemy · *deep Anchor; the foe cannot move or flee* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Tonnage** · phys · enemy · *immense ramping crush on an Anchored foe* · gen **major UMBRAXIS** · cd **medium**
- **C · Mass Ward** · buff · allAllies · *a gravitic shell: party damage reduction* · gen **moderate UMBRAXIS** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Meteor Drop** · phys · allEnemies · *leap and crash; massive AoE + pull inward* · gen **major UMBRAXIS** · cd **medium**
- **C · Anvil Stance** · buff · self · *hold max damage reduction; immune to displacement* · gen **major UMBRAXIS** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Singularity Slam** · phys · allEnemies · *pull all foes to a point and crush — a big AoE* · gen **major UMBRAXIS** · cd **medium**
- **B · Flatten** · phys · enemy · *a finishing crush; huge vs Anchored foes* · gen **major UMBRAXIS** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Sinkhole** · util · allEnemies · *the ground sinks: pull all foes inward + brief Anchor* · cost **med UMBRAXIS** · cd **medium**
- **B · Crushgrip** · phys · enemy · *an immense single-target crush + Anchor* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Deadlift** · phys · enemy · *hoist and slam an Anchored foe for heavy damage* · cost **med UMBRAXIS** · cd **medium**
- **C · Aegis of Weight** · buff · allAllies · *party damage reduction; you absorb a share of party damage* · cost **med UMBRAXIS** · cd **long**

**@ MNA 30** *(A/C)*
- **A · Event Collapse** · phys · allEnemies · *collapse the cluster inward for AoE crush* · cost **med UMBRAXIS** · cd **medium**
- **C · Iron Anchor** · buff · self · *for a few turns, greatly reduced damage + immune to CC and displacement* · cost **high UMBRAXIS** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Maw** · phys · allEnemies · *a gravity maw pulls foes in and crushes them* · cost **med UMBRAXIS** · cd **medium**
- **B · Backbreaker** · phys · enemy · *a brutal crush; an Anchored foe is also staggered* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Grind** · phys · enemy · *a sustained crush: damage ramps each turn the foe stays Anchored* · cost **high UMBRAXIS** · cd **medium**
- **C · Gravitic Bastion** · buff · allAllies · *raise a gravity bastion: block the next hit on each ally + party DR* · cost **high UMBRAXIS** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Black Hole Slam** · phys · allEnemies · *a slam forming a brief black hole: pull + heavy AoE crush* · cost **high UMBRAXIS** · cd **long**
- **C · Juggernaut** · buff · self · *become unstoppable: heavy DR, cannot be stopped or moved, you crush through* · cost **high UMBRAXIS** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Collapsar** · phys · allEnemies · *a collapsing star: massive pull + AoE crush, Anchor survivors* · cost **high UMBRAXIS** · cd **long**
- **B · Spine Shatter** · phys · enemy · *a crush that Shatters an Anchored / Crushed foe for a burst* · cost **high UMBRAXIS** · cd **medium**

**@ MNA 80** *(B/C)*
- **B · Compactor** · phys · allEnemies · *crush all clustered foes; ramps with how long they've been Anchored* · cost **high UMBRAXIS** · cd **long**
- **C · Atlas Stance** · buff · allAllies · *bear the burden: redirect ALL party damage to yourself and reduce it for a turn* · cost **high UMBRAXIS** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Neutron Slam** · phys · allEnemies · *the densest blow: enormous AoE crush + Anchor all* · cost **high UMBRAXIS** · cd **long**
- **C · Immortal Mass** · buff · self · *become an absolute fixed mass: capped damage + total CC immunity for a few turns* · cost **high UMBRAXIS** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · Gravity's End** *(Singularity Slam)* · allEnemies · *collapse the battlefield into a singular point — pull every foe in and crush them together*
- **B · The Crushing Hour** *(Crush)* · enemy · *gravity beyond bearing — an unstoppable single-target crush that ramps to a lethal peak*
- **C · Unmoved Mover** *(Mass)* · allAllies · *become the immovable center — total damage reduction and CC immunity, redirecting the party's harm to your unbreakable mass*
- **Gravitational Collapse** *(neutral/fusion)* · allEnemies · *the field implodes — pull, crush, and Anchor every foe at once*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Gravitas** · *your pulls draw foes from farther*
- **B · Relentless Weight** · *your crush ramps faster on Anchored foes*
- **C · Countermass** · *your damage reduction is higher*

**Set @ MNA 60**
- **A · Gravity Lock** · *foes you pull stay Anchored longer*
- **B · Bonecrusher** · *your crushes can stagger*
- **C · Steadfast** · *you cannot be moved or knocked back*

**Set @ MNA 90**
- **A · Accretion Disk** · *each foe pulled into your slam adds to its damage*
- **B · Crushing Finality** · *your crush can execute very low-HP Anchored foes*
- **C · Tectonic Hide** · *while at max damage reduction, the damage you take is further reduced*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary STR ← Hammer · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS | ✓ |
| Provenance flag on every entry (all `proposed`) | ✓ |
| Ability names globally unique (invariant #8) | ✓ |
