# Dawnwarden — SOL × Sword & Shield

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes locked in the
> [Sword & Shield family note](./sword-and-shield-family.md); every ability is `proposed` — ratified canon (Dara, 2026-06-28). Numberless by design. Mechanics vocabulary (Burn/Blind/Block-stacking) draws on the
> [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified canon (Dara, 2026-06-28).

## Identity (derived + DNA)

- **Class:** Dawnwarden · **Attunement × Archetype:** SOL × Sword & Shield
- **Primary stat:** AGI (← SOL) · **Secondary stat:** DEF (← Sword & Shield)
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (+ Blind); defense via **Block / stacking Block**

**Fantasy.** The Dawnwarden fights with the shield as a *weapon* — bashing, hurling, and slamming in
gouts of radiant fire while the blaze of dawn blinds everything in front of them. It is a **damage
off-tank**: its job is pressure, and its survival is **Block** — but a Dawnwarden who *stacks* Block
(and gears for it) hardens into a real main-tank who turns every parry into a counter-burst. Defense,
for SOL, is just offense pointed the other way.

**Defensive mechanic — Block, and stacking it.** Mitigation is **Block** (negate/reduce a portion of
a hit), and the hook is **stacking Block**: build Block stacks (each adds block chance/amount) so a
block-geared Dawnwarden stacks high enough to **main-tank**, while an offense-geared one is a bruiser
who only off-tanks. Block is **gear-dependent** as a primary-tank tool — deliberately. And blocking
**feeds offense** (counters, reflects, spend-the-wall bursts), so defense is never dead weight.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Aggressor** | The damage engine — shield-bash/throw, radiant strikes, Burn/Blind, AoE slams (spread) | **AGI**, Burn, offense | front-line DPS / off-tank | offense gear; party already has a main tank |
| **B · Bastion Stacks** | Block-stacking tank — build Block to hold the line as a true main-tank | **DEF**, Block stacks | main-tank (gear-dependent) | block/DEF gear; party needs a wall |
| **C · Riposte** | Defense→offense — blocking triggers counters, reflects, and spend-the-wall bursts | Block→damage, counters | bruiser / punisher | mixed gear; reactive playstyle |

**Build axes:** offense ↔ block-tanking (A↔B) · raw damage ↔ counter/reflect (A↔C) · *gear tips the
optimum:* fresh = A+C block-and-punish bruiser; block-geared = drop into B to main-tank.

---

## Auto-attack *(unlaned)*

- **Kindle** · phys · enemy · *a quick shield-edge bash that kindles the pool* · gen **minor SOL** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Shield Bash** · phys · enemy · *bash with the shield; brief Blind* · gen **moderate SOL** · cd **short**
- **B · Brace** · buff · self · *raise the shield: gain Block stacks* · gen **moderate SOL** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Sunwall** · buff · self · *plant the shield: large Block + draw aggro* · gen **major SOL** · cd **medium**
- **C · Counterglow** · buff · self · *for a few turns, blocking a hit answers with a radiant burst* · gen **moderate SOL** · cd **medium**

**@ MNA 25** *(A/C)*
- **A · Shield Throw** · phys · enemy · *hurl the shield; it strikes and returns (bonus vs Blinded)* · gen **moderate SOL** · cd **short**
- **C · Riposte Edge** · phys · enemy · *strike; if you blocked last turn, it applies Burn* · gen **moderate SOL** · cd **short**

**@ MNA 35** *(A/B)*
- **A · Flare Slam** · phys · allEnemies · *radiant ground slam; Blind nearby foes* · gen **moderate SOL** · cd **medium**
- **B · Bulwark Drill** · buff · self · *convert SOL into extra Block stacks (bank defense before it bleeds away)* · gen **moderate SOL** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Aegis Line** · buff · allAllies · *grant the party brief Block* · gen **moderate SOL** · cd **medium**
- **C · Retort** · phys · enemy · *counter-strike scaling with your current Block stacks* · gen **moderate SOL** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Solar Cleave** · phys · allEnemies · *wide radiant cleave; applies Burn* · gen **major SOL** · cd **medium**
- **C · Mirror Shield** · buff · self · *for a few turns, a blocked hit reflects part of its damage back* · gen **moderate SOL** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Zenith Strike** · phys · enemy · *heavy bash; bonus vs Burning foes* · gen **moderate SOL** · cd **medium**
- **B · Vanguard Stance** · buff · self · *greatly raise Block and taunt; you can't be bypassed (peel)* · gen **major SOL** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Ember Guard** · buff · allAllies · *party Block + a small retaliatory Burn when they block* · gen **moderate SOL** · cd **long**
- **C · Backdraft** · phys · enemy · *consume Block stacks for a radiant burst (spend the wall)* · gen **major SOL** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Supernova Slam** · phys · allEnemies · *massive radiant AoE; Burn + Blind* · gen **major SOL** · cd **medium**
- **C · Vengeance Aegis** · buff · self · *each hit you block this turn builds a counter that releases at turn's end* · gen **moderate SOL** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Dawnbreaker** · phys · enemy · *huge shield-bash; detonates the target's Burn* · gen **major SOL** · cd **medium**
- **B · Immutable Wall** · buff · self · *hold your Block at maximum for a few turns* · gen **major SOL** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Searing Bash** · phys · enemy · *bash; heavy Burn* · cost **med SOL** · cd **medium**
- **B · Tower Stance** · buff · self · *high Block + Taunt for several turns* · cost **med SOL** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Bulwark Bond** · buff · allAllies · *share your Block with the party for a few turns* · cost **med SOL** · cd **medium**
- **C · Riot of Light** · phys · allEnemies · *radiant burst scaling with your Block stacks* · cost **med SOL** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Conflagration** · mag · allEnemies · *spread Burn to all foes* · cost **med SOL** · cd **long**
- **C · Aegis Reprisal** · phys · enemy · *consume all Block stacks for a strike scaling with the amount spent* · cost **med SOL** · cd **medium**

**@ MNA 40** *(A/B)*
- **A · Sunder Light** · phys · enemy · *armor-break + Burn; bonus vs Blinded* · cost **med SOL** · cd **medium**
- **B · Unbreakable** · buff · self · *for a few turns, blocked hits deal no damage at all (perfect block)* · cost **high SOL** · cd **long**

**@ MNA 50** *(B/C)*
- **B · Solar Bastion** · buff · allAllies · *party-wide Block bubble + a radiant retaliation on block* · cost **high SOL** · cd **medium**
- **C · Cinderstorm** · phys · allEnemies · *AoE counter-burst; bonus per Block stack spent* · cost **high SOL** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Pyre Bash** · phys · enemy · *detonate the target's Burn for a big hit* · cost **high SOL** · cd **medium**
- **C · Reckoning** · phys · enemy · *a finisher dealing a share of all damage you've blocked this fight* · cost **high SOL** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Radiant Judgment** · mag · allEnemies · *blast all foes; Blind + Burn* · cost **high SOL** · cd **long**
- **B · Aegis Eternal** · buff · self · *become an immovable bulwark: massive Block + force enemies to target you* · cost **high SOL** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Lightward Line** · buff · allAllies · *party Block + Blind all enemies (they can't land clean hits)* · cost **high SOL** · cd **long**
- **C · Brilliant Riposte** · phys · enemy · *for several turns every block triggers a Burning counter* · cost **high SOL** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Solar Annihilation** · mag · allEnemies · *cataclysmic detonation of all Burn on the field* · cost **high SOL** · cd **long**
- **C · Last Bulwark** · buff · self · *convert your Block into a damage aura: foes that strike you take heavy radiant damage* · cost **high SOL** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Solar Apotheosis** *(Aggressor)* · allEnemies · *become a small sun — massive radiant AoE, Burn + Blind everything*
- **B · Aegis of Dawn** *(Bastion Stacks)* · allAllies · *raise an unbreakable radiant wall: max Block for you and the party, reflecting blocked damage*
- **C · Total Retribution** *(Riposte)* · enemy · *unleash all stored Block as a single annihilating counter — scales with everything you've blocked*
- **Daybreak** *(neutral/fusion)* · allEnemies · *a breaking dawn that Burns and Blinds all foes while flaring your Block to full*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Kindler** · *your Burns deal more and last longer*
- **B · Shieldwall** · *your Block stacks higher and bleeds away slower*
- **C · Riposteur** · *your counters from blocking hit harder*

**Set @ MNA 60**
- **A · Sunbrand** · *Blinded foes take extra damage from you*
- **B · Aegis Mastery** · *some of your Block converts to flat damage reduction (a gear-light tanking floor)*
- **C · Reflective Plating** · *a portion of every blocked hit is reflected automatically*

**Set @ MNA 90**
- **A · Coronal** · *your AoE radiant abilities hit harder the more foes they strike*
- **B · Immovable** · *while at max Block you cannot be moved, stunned, or bypassed*
- **C · Retribution** · *your block-counters can critically strike*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary DEF ← Sword & Shield · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
