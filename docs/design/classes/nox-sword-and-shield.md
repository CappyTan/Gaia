# Penumbral Bastion — NOX × Sword & Shield

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes locked in the
> [Sword & Shield family note](./sword-and-shield-family.md); every ability is `proposed`. Numberless.
> Mechanics vocabulary (Chill/Freeze/Shatter/Stasis/stillness armor + shadow Blind) draws on the
> [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified canon (Dara, 2026-06-28).
> Leans **shadow/penumbra** (NOX's dark facet) to stay distinct from the frost-forward Rimewalker
> (Dual Swords) and Equilibrium Ascendant (Hammer).

## Identity (derived + DNA)

- **Class:** Penumbral Bastion · **Attunement × Archetype:** NOX × Sword & Shield
- **Primary stat:** STR (← NOX) · **Secondary stat:** DEF (← Sword & Shield)
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed)
- **Attunement signature:** **Chill/Freeze/Stasis** + **shadow Blind**; defense via **mitigation + lockdown**

**Fantasy.** The Penumbral Bastion is a guardian of cold and shadow — a wall of dusk that **lowers the
magnitude** of every blow (stillness armor, shadow-shrouds) while **freezing and blinding** the
enemies that dare swing. Where the Rimewalker dances and the Equilibrium Ascendant crushes, the
Penumbral Bastion **endures and protects**: it stands in the dark, takes little, shields the party
behind it, and grinds the fight to a frozen, sightless halt. The patient eclipse.

**Defensive mechanic — mitigate the magnitude.** Survival is **damage reduction** (shadow-armor /
stillness) for self and party, paired with **control** (Chill→Freeze, Seal, attack-bar drag) that
stops attacks before they start. It takes *little* when hit (the opposite of the QUANTA evasion-tank,
which takes full hits but rarely connects).

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Umbral Aegis** | The wall — shadow-armor & stillness reduce incoming damage to you *and* the party; guard, intercept, endure | DEF, mitigation | main-tank / protector | party needs a damage-reducing wall |
| **B · Cold Lock** | Control — Chill/Freeze/Seal attackers, drag their attack-bars, stop offense at the source | control/tempo | disruptor-tank | vs hard-hitting or fast attackers |
| **C · Eclipse** | Darkness — Blind foes, weaken/sap attackers, retaliate from shadow; the tank's teeth | STR, debuff | punish/debuff | when the party needs the enemy *softened* |

**Build axes:** endure ↔ lock-down (A↔B) · protect ↔ debuff-punish (A↔C) · mitigation/control ↔
offense (A,B ↔ C).

---

## Auto-attack *(unlaned)*

- **Duskblow** · phys · enemy · *a heavy shield-edge strike wreathed in shadow* · gen **minor NOX** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Shadow Guard** · buff · self · *raise a shroud of shadow: brief damage reduction + draw aggro* · gen **moderate NOX** · cd **short**
- **B · Frostbind** · util · enemy · *Chill the target (slows its attack-bar)* · gen **moderate NOX** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Numbing Grasp** · util · enemy · *deepen Chill; the target's next action is delayed* · gen **moderate NOX** · cd **medium**
- **C · Gloom** · util · enemy · *shadows cloud the foe: Blind (chance to miss)* · gen **moderate NOX** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Nightward** · buff · allAllies · *shroud the party in shadow: brief party damage reduction* · gen **major NOX** · cd **medium**
- **C · Umbral Lash** · phys · enemy · *a shadow strike that weakens the target's attack (reduced damage)* · gen **moderate NOX** · cd **short**

**@ MNA 35** *(A/B)*
- **A · Bastion Wall** · buff · self · *plant: greatly reduce damage taken and become unbypassable (peel)* · gen **moderate NOX** · cd **medium**
- **B · Glaciate** · util · enemy · *freeze a Chilled target solid (cannot act)* · gen **moderate NOX** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Hoarbind** · util · allEnemies · *Chill all foes (slow their attack-bars)* · gen **moderate NOX** · cd **medium**
- **C · Duskfall** · util · allEnemies · *darkness falls: Blind all foes briefly* · gen **moderate NOX** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Aegis Shroud** · buff · allAllies · *party damage reduction + a share of incoming damage redirected to you* · gen **major NOX** · cd **medium**
- **C · Shadowbrand** · util · enemy · *mark a foe: it deals less damage and takes more from your party* · gen **moderate NOX** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Stoneform** · buff · self · *harden: heavy damage reduction, but your attack-bar slows (the patient wall)* · gen **moderate NOX** · cd **medium**
- **B · Sealing Dark** · util · enemy · *Seal a foe's abilities and Chill it (it can't use specials)* · gen **moderate NOX** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Hard Freeze** · util · enemy · *a long Freeze on a Chilled target (stun)* · gen **major NOX** · cd **medium**
- **C · Nightfall** · util · allEnemies · *deep shadow: Blind all foes + reduce their accuracy* · gen **moderate NOX** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Living Bulwark** · buff · self · *for a few turns, redirect a share of all party damage to yourself and reduce it* · gen **moderate NOX** · cd **medium**
- **C · Umbral Sap** · mag · enemy · *shadow saps the foe: weaken its damage and feed your NOX (bank)* · gen **major NOX** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Adamant Aegis** · buff · self · *hold your damage reduction at maximum for a few turns (the immovable shadow)* · gen **major NOX** · cd **medium**
- **B · Cold Snap** · util · allEnemies · *Chill + briefly Freeze multiple foes* · gen **major NOX** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Shadow Bastion** · buff · self · *high damage reduction + Taunt for several turns* · cost **med NOX** · cd **medium**
- **B · Bonechill** · util · enemy · *heavy Chill + slow; the target's attack-bar drags hard* · cost **med NOX** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Winter's Grip** · util · allEnemies · *Chill all foes and drag their attack-bars* · cost **med NOX** · cd **medium**
- **C · Veil of Night** · buff · allAllies · *shroud the party: Blind all enemies (they miss the party more)* · cost **med NOX** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Penumbral Veil** · buff · allAllies · *party damage reduction for several turns* · cost **med NOX** · cd **long**
- **C · Gravewind** · mag · allEnemies · *a wave of cold shadow: weaken all foes' damage* · cost **med NOX** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Immovable Shadow** · buff · self · *for a few turns take greatly reduced damage and cannot be moved or stunned* · cost **high NOX** · cd **long**
- **B · Flash Freeze** · util · enemy · *instantly Freeze a foe (stun), Chilled or not* · cost **med NOX** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Glacial Prison** · util · allEnemies · *Freeze multiple foes solid* · cost **high NOX** · cd **long**
- **C · Total Eclipse** · util · allEnemies · *total darkness: Blind all foes and sharply reduce their accuracy* · cost **high NOX** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Bulwark of Night** · buff · allAllies · *a shadow-wall: block the next hit on each ally + party damage reduction* · cost **high NOX** · cd **medium**
- **C · Sapping Gloom** · mag · enemy · *deep shadow: greatly weaken the target's damage + apply Stasis* · cost **med NOX** · cd **medium**

**@ MNA 70** *(A/B)*
- **A · Eventide Aegis** · buff · self · *become a wall of dusk: massive damage reduction + force enemies to target you* · cost **high NOX** · cd **long**
- **B · Dead of Winter** · util · allEnemies · *Freeze most foes (stun) for a turn* · cost **high NOX** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Cryostasis** · util · enemy · *encase a foe in ice: long Freeze; it Shatters for bonus damage if struck* · cost **high NOX** · cd **long**
- **C · Umbral Collapse** · mag · allEnemies · *shadows crush inward: weaken + Blind all foes + light damage* · cost **high NOX** · cd **long**

**@ MNA 90** *(A/C)*
- **A · The Long Dark** · buff · allAllies · *party-wide heavy damage reduction + preserve ally buffs (freeze their timers)* · cost **high NOX** · cd **long**
- **C · Eclipse Eternal** · util · allEnemies · *unending darkness: Blind, accuracy down, and weaken — all foes, long* · cost **high NOX** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Umbral Sovereign** *(Umbral Aegis)* · allAllies · *cloak the party in absolute shadow: massive damage reduction, and you intercept the killing blow for any ally*
- **B · Endless Winter** *(Cold Lock)* · allEnemies · *Freeze the entire enemy side solid and drag their tempo to a halt*
- **C · Total Darkness** *(Eclipse)* · allEnemies · *snuff all light: every foe Blinded, weakened, and stripped of accuracy*
- **The Gloaming** *(neutral/fusion)* · all · *twilight falls on the field — party shrouded (damage reduction), all foes Chilled and Blinded*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Shadeskin** · *your damage reduction is higher*
- **B · Lingering Chill** · *your Chill and Freeze last longer*
- **C · Gloombringer** · *your Blinds are stronger and last longer*

**Set @ MNA 60**
- **A · Aegis of Dusk** · *when you guard, you also shield an adjacent ally*
- **B · Bitter Cold** · *foes you've Chilled deal reduced damage*
- **C · Shadow Tithe** · *you bank NOX whenever you mitigate a hit*

**Set @ MNA 90**
- **A · Unyielding** · *while at max damage reduction you cannot be stunned, moved, or bypassed*
- **B · Deepwinter** · *your Freezes catch an additional nearby foe*
- **C · Eternal Night** · *foes within your shadow keep reduced accuracy as long as they're Blinded*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary DEF ← Sword & Shield · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other specs (invariant #8) | ✓ |
