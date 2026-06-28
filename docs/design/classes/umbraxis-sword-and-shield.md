# Tidal Sovereign — UMBRAXIS × Sword & Shield

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes locked in the
> [Sword & Shield family note](./sword-and-shield-family.md); every ability is `proposed`. Numberless.
> Mechanics vocabulary (Drain/Crush/Anchored + raw damage reduction) draws on the
> [Attunement Mechanics Framework](../attunement-mechanics.md) — dev-approved, pending Dara.

## Identity (derived + DNA)

- **Class:** Tidal Sovereign · **Attunement × Archetype:** UMBRAXIS × Sword & Shield
- **Primary stat:** DEF (← UMBRAXIS) · **Secondary stat:** DEF (← Sword & Shield) — a **DEF+DEF** hyper-tank
- **Resource:** UMBRAXIS (party-shared; **conservation** — fed by what it drains/takes, not made from nothing)
- **Attunement signature:** **Drain · Crush · Anchored** (gravity); defense via **absorb + gravity + drain**

**Fantasy.** The Tidal Sovereign is the heaviest thing on the field — an immovable mass that bends the
battle toward itself. Its gravity **pulls every blow onto its own shield** (and every enemy into
reach), it **absorbs** what lands rather than dodging it, and it **drains** the force of its attackers
to feed its own endurance. Nothing escapes its pull; nothing it grabs gets away; and the longer a fight
drags on, the stronger the Sovereign grows on what it has swallowed. The wall that eats the tide.

**Defensive mechanic — absorb, gravitate, drain.** The DEF+DEF collision makes it the purest tank of
the five: **raw damage reduction / absorption** (it eats hits), **gravity** (pull aggro, Anchor foes,
redirect attacks onto itself), and **Drain** (steal HP/energy to self-sustain — the conservation
economy: it converts what it takes into resource). Slow, inevitable, unkillable through sheer mass.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Event Horizon** | Absorb — raw damage reduction; cross it and the hit is swallowed. The immovable wall | DEF, mitigation | pure main-tank | the party needs an unkillable anchor |
| **B · Gravity Well** | Pull — drag *all* aggro to you, Anchor/root foes, redirect attacks onto yourself | gravity, forced-target | aggro / position control | scattered or fleeing enemies; protecting the back line |
| **C · Accretion** | Drain — steal HP/energy from attackers to self-sustain; the well that feeds itself | Drain, conservation | sustain-tank | long attrition fights; little outside healing |

**Build axes:** absorb ↔ drain-sustain (A↔C) · passive-wall ↔ active-gravity-control (A↔B) ·
self-sustain ↔ party-protection (C ↔ A,B).

---

## Auto-attack *(unlaned)*

- **Tidebreak** · phys · enemy · *a ponderous shield slam drawing on your mass* · gen **minor UMBRAXIS** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Harden** · buff · self · *set your stance: gain damage reduction (absorb)* · gen **moderate UMBRAXIS** · cd **short**
- **B · Gravity Pull** · util · enemy · *drag a foe toward you and Anchor it (rooted)* · gen **moderate UMBRAXIS** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Mass Taunt** · util · allEnemies · *your gravity compels: force nearby foes to target you* · gen **moderate UMBRAXIS** · cd **medium**
- **C · Leech Strike** · phys · enemy · *a draining shield-blow: damage + Drain a portion of HP to yourself* · gen **moderate UMBRAXIS** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Stonewall** · buff · self · *plant immovably: heavy damage reduction, cannot be pushed or pulled* · gen **major UMBRAXIS** · cd **medium**
- **C · Siphon** · mag · enemy · *Drain the target's energy: weaken it and restore your HP* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Absorb** · buff · self · *the next hits against you are partly absorbed and converted to UMBRAXIS (conservation)* · gen **moderate UMBRAXIS** · cd **medium**
- **B · Singularity Tug** · util · allEnemies · *pull all foes together into a cluster + brief Anchor* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Crushing Grasp** · util · enemy · *gravity crushes: damage that ramps the longer the foe stays Anchored* · gen **moderate UMBRAXIS** · cd **medium**
- **C · Lifesink** · mag · enemy · *Drain HP from a foe to yourself; bank UMBRAXIS* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Bulwark Mass** · buff · self · *increase your effective mass: large damage reduction; you cannot be moved* · gen **major UMBRAXIS** · cd **medium**
- **C · Devourer's Touch** · mag · enemy · *heavy Drain: steal HP and a share of the foe's attack power* · gen **moderate UMBRAXIS** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Tidal Guard** · buff · allAllies · *a gravitic shell: redirect a share of party damage to yourself and reduce it* · gen **moderate UMBRAXIS** · cd **medium**
- **B · Event Pull** · util · allEnemies · *drag all foes inward and Anchor them around you* · gen **major UMBRAXIS** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Tidelock** · util · enemy · *deep Anchor: the foe cannot move, flee, or swap rows* · gen **moderate UMBRAXIS** · cd **medium**
- **C · Vampiric Tide** · mag · allEnemies · *Drain a little HP from all foes to yourself* · gen **major UMBRAXIS** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Immovable Mass** · buff · self · *hold your damage reduction at maximum for a few turns; immune to displacement* · gen **major UMBRAXIS** · cd **medium**
- **C · Soul Siphon** · mag · enemy · *Drain HP and energy; bank a large UMBRAXIS surge* · gen **major UMBRAXIS** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Aegis of Mass** · buff · self · *for a few turns you absorb nearly all incoming damage, converting it to UMBRAXIS* · gen **major UMBRAXIS** · cd **medium**
- **B · Total Anchor** · util · allEnemies · *Anchor every foe: none can move or flee* · gen **major UMBRAXIS** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Ironhold** · buff · self · *high damage reduction + Taunt for several turns* · cost **med UMBRAXIS** · cd **medium**
- **B · Graviton Snare** · util · enemy · *Anchor + crush a foe (rooted, ramping damage)* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Collapsing Field** · util · allEnemies · *pull all foes together and Anchor them* · cost **med UMBRAXIS** · cd **medium**
- **C · Bloodtide** · mag · allEnemies · *Drain HP from all foes, healing you* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Bastion of Tides** · buff · allAllies · *party damage reduction; you absorb a share of all incoming party damage* · cost **med UMBRAXIS** · cd **long**
- **C · Engulf** · mag · enemy · *Drain heavily: steal a large chunk of the target's HP* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 40** *(A/B)*
- **A · Deadweight** · buff · self · *for a few turns take greatly reduced damage and ignore all displacement and CC* · cost **high UMBRAXIS** · cd **long**
- **B · Crushing Depths** · util · enemy · *immense gravity: heavy ramping damage + long Anchor* · cost **med UMBRAXIS** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Gravity Crush** · phys · allEnemies · *collapse the cluster: AoE crush damage, bonus to Anchored foes* · cost **high UMBRAXIS** · cd **medium**
- **C · Drain Tide** · mag · allEnemies · *Drain HP from all foes; a big self + party heal* · cost **high UMBRAXIS** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Horizon Wall** · buff · self · *nothing passes: near-total damage absorption for a turn* · cost **high UMBRAXIS** · cd **long**
- **C · Black Hole Heart** · mag · enemy · *a singularity within you: Drain a foe massively, healing you greatly* · cost **high UMBRAXIS** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Sovereign Bulwark** · buff · allAllies · *raise a gravitic bastion: block the next hit on each ally + party damage reduction* · cost **high UMBRAXIS** · cd **long**
- **B · Singularity** · util · allEnemies · *form a singularity: pull all foes in, Anchor, and crush them together* · cost **high UMBRAXIS** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Tidal Dominion** · util · allEnemies · *overwhelming gravity: all foes Anchored and forced to target you* · cost **high UMBRAXIS** · cd **long**
- **C · Abyssal Feast** · mag · allEnemies · *Drain HP from every foe and convert it into a large party heal* · cost **high UMBRAXIS** · cd **long**

**@ MNA 90** *(A/C)*
- **A · The Immovable** · buff · self · *become an absolute fixed mass: capped damage and immunity to all CC for a few turns* · cost **high UMBRAXIS** · cd **long**
- **C · Devour the Tide** · mag · allEnemies · *consume the field's force: massive Drain from all foes, healing the party* · cost **high UMBRAXIS** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high UMBRAXIS**, cd **long**)*

- **A · Event Horizon** *(Event Horizon lane)* · self · *become a true event horizon — for several turns nothing that strikes you deals damage; it is swallowed and converted to UMBRAXIS*
- **B · Total Collapse** *(Gravity Well)* · allEnemies · *collapse the field into a singularity: pull, Anchor, and crush every foe, holding them helpless*
- **C · Maelstrom** *(Accretion)* · allEnemies · *a draining vortex: siphon HP from every foe continuously, healing you and the party*
- **Undertow** *(neutral/fusion)* · all · *the tide turns — pull and Anchor all foes, Drain them, and shroud the party in damage-reducing mass*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Dense** · *your damage reduction is higher*
- **B · Heavy Gravity** · *your Anchors and roots last longer*
- **C · Sanguine Mass** · *your Drains heal you for more*

**Set @ MNA 60**
- **A · Bedrock** · *the first big hit against you each turn is reduced further*
- **B · Inescapable** · *foes you've Anchored cannot cleanse it or flee*
- **C · Glutton** · *Draining a foe also briefly weakens its damage*

**Set @ MNA 90**
- **A · Adamantine** · *while at max damage reduction you cannot be stunned, moved, or bypassed*
- **B · Crushing Mass** · *your gravity/crush damage ramps faster on Anchored foes*
- **C · Eternal Hunger** · *a share of all damage you take is returned to you as healing*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary DEF ← UMBRAXIS · secondary DEF ← Sword & Shield · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all UMBRAXIS | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
