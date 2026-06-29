# Chronosage — QUANTA × Staff

> **Status:** greenfield spec (Phase 2 kit). Lanes from the [Staff family note](./staff-family.md);
> every ability `proposed`. Numberless. Mechanics from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). Energy operation: **reorder**. A
> **support / enchanter** — buffs, tempo, probability — deliberately *not* the QUANTA Hammer's
> Doom/crit-verdict identity.

## Identity (derived + DNA)

- **Class:** Chronosage · **Attunement × Archetype:** QUANTA × Staff
- **Primary stat:** SPD (← QUANTA) · **Secondary stat:** VIT (← Staff)
- **Resource:** QUANTA (party-shared; **gambles**) · **Signature:** probability swings (no Doom-focus)
- **Energy op:** **Reorder** — move energy through time & probability. Caster role: **support / enchanter**.

**Fantasy.** The Chronosage reweaves the battle's energy through time and chance — adding nothing,
removing nothing, only *reordering*: hastening allies, stalling foes, bending probability so the
party's blows land true and the enemy's fail. The loom: the enchanter who decides *when* and
*whether* things happen.

### Lanes *(three flavors of support)*

| Lane | Identity | Best when |
|---|---|---|
| **A · Tempo** | time — haste allies / extra turns / slow foes | combo teams; speed comps |
| **B · Fortune** | probability — buff party crit/dodge, decohere enemy accuracy/crit | crit/variance party builds |
| **C · Foresight** | prediction — shields on the foreseen hit, pre-empt, cleanse incoming | vs telegraphed burst; protection |

**Build axes:** time-tempo ↔ probability-luck (A↔B) · enabling ↔ protecting (A,B↔C).

---

## Auto-attack *(unlaned)*
- **Flux** · mag · enemy · *a flicker of unstable probability* · gen **minor QUANTA** · cd **none** *(spammable)*

## Special skills — 10 milestones × 2 *(generate; never cost)*

**@ MNA 5** *(A/B)*
- **A · Hasten** · buff · ally · *speed an ally's attack-bar* · gen **moderate QUANTA** · cd **short**
- **B · Favor** · buff · ally · *raise an ally's crit & dodge briefly* · gen **moderate QUANTA** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Cloud Fate** · util · enemy · *lower the target's accuracy & crit (decohere)* · gen **moderate QUANTA** · cd **short**
- **C · Foresee** · buff · ally · *predict the next hit on an ally and grant a bracing shield* · gen **moderate QUANTA** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Slow** · util · enemy · *drag the target's attack-bar* · gen **moderate QUANTA** · cd **short**
- **C · Premonition** · buff · ally · *warn an ally — their next dodge is likelier* · gen **moderate QUANTA** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Expedite** · buff · allAllies · *briefly speed the whole party's attack-bars* · gen **moderate QUANTA** · cd **medium**
- **B · Weighted Fate** · buff · ally · *the ally's next hit is far likelier to crit* · gen **moderate QUANTA** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Cloud the Field** · util · allEnemies · *lower all foes' accuracy & crit* · gen **moderate QUANTA** · cd **medium**
- **C · Ward of Fate** · buff · allAllies · *the party's next incoming hit is partly foreseen and reduced* · gen **moderate QUANTA** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Accelerate** · buff · allAllies · *party haste for a few turns* · gen **major QUANTA** · cd **medium**
- **C · Prescience** · buff · ally · *foresee — the ally auto-dodges the next attack* · gen **moderate QUANTA** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Stall** · util · allEnemies · *push all foes' attack-bars back* · gen **moderate QUANTA** · cd **medium**
- **B · Fortune's Favor** · buff · allAllies · *raise the party's crit & dodge* · gen **moderate QUANTA** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Fumble Field** · util · allEnemies · *foes' attacks may fumble (miss & waste the turn)* · gen **major QUANTA** · cd **medium**
- **C · Augury** · buff · allAllies · *read the timeline: party gains a shield on the next predicted hit* · gen **moderate QUANTA** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Timeslip** · util · allEnemies · *all foes lose attack-bar; one may skip its turn* · gen **moderate QUANTA** · cd **medium**
- **C · Clairvoyance** · buff · allAllies · *foresee all incoming: party-wide brief dodge* · gen **major QUANTA** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Tempo Storm** · buff · allAllies · *big party haste + an extra-action chance* · gen **major QUANTA** · cd **medium**
- **B · Probability Storm** · util · allEnemies · *all foes' accuracy & crit crash (mass decohere)* · gen **major QUANTA** · cd **medium**

## Signature abilities — 9 milestones × 2 *(cost; never generate)*

**@ MNA 10** *(A/B)*
- **A · Haste** · buff · ally · *greatly speed an ally for several turns* · cost **med QUANTA** · cd **medium**
- **B · Boon** · buff · allAllies · *raise the party's crit & dodge for several turns* · cost **med QUANTA** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Malfortune** · util · allEnemies · *foes' crit drops to near zero; accuracy down* · cost **med QUANTA** · cd **medium**
- **C · Foreknowledge** · buff · allAllies · *the next attack on each ally is foreseen and reduced* · cost **med QUANTA** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Arrest Time** · util · allEnemies · *freeze all foes' attack-bars (pure time stall, no Chill)* · cost **med QUANTA** · cd **long**
- **C · Prophecy** · buff · allAllies · *foretell the fight: the party's next few hits taken are reduced* · cost **med QUANTA** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Overdrive** · buff · allAllies · *the party gains a guaranteed extra action this round* · cost **med QUANTA** · cd **medium**
- **B · Tip the Scales** · buff · allAllies · *party hits become near-guaranteed crits briefly* · cost **med QUANTA** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Total Misfortune** · util · allEnemies · *all foes' next attacks miss (probability collapsed)* · cost **high QUANTA** · cd **long**
- **C · Precognition** · buff · allAllies · *foresee the next round: party gains big shields against predicted hits* · cost **high QUANTA** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Time Stop** · util · allEnemies · *stop the enemy clock — all foes skip their next turn* · cost **high QUANTA** · cd **long**
- **C · Fate Ward** · buff · allAllies · *weave a protective fate: the party's next lethal hit is foreseen and prevented* · cost **high QUANTA** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Acceleration Field** · buff · allAllies · *sustained party haste + cooldown recovery* · cost **high QUANTA** · cd **long**
- **B · Best of All Worlds** · buff · allAllies · *for a few turns the party's outcomes resolve in their favor (crit/dodge surge)* · cost **high QUANTA** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Worst of All Worlds** · util · allEnemies · *for a few turns the enemy's outcomes resolve against them (miss/fumble surge)* · cost **high QUANTA** · cd **long**
- **C · Foreordained** · buff · allAllies · *survival is written: a round of foreseen damage is heavily reduced* · cost **high QUANTA** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Chronostasis** · util · allEnemies · *the enemy frozen in time — all foes lose their turns for a round (pure time)* · cost **high QUANTA** · cd **long**
- **C · The Long View** · buff · allAllies · *see far ahead: the party pre-empts and dodges/cleanses the next several threats* · cost **high QUANTA** · cd **long**

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high QUANTA**, cd **long**)*
- **A · Time Unbound** *(Tempo)* · allAllies · *unchain the party from the clock — extra actions and overwhelming haste while the enemy crawls*
- **B · Loaded Universe** *(Fortune)* · all · *rig reality — every party outcome favors them, every enemy outcome fails*
- **C · Destiny Rewritten** *(Foresight)* · allAllies · *rewrite the next chapter — foresee and negate all incoming harm to the party for a round*
- **The Loom** *(neutral/fusion)* · all · *reweave the battle — haste the party, decohere the foes, and shield against the foreseen, all at once*

## Passives — 3 sets of 3, **pick 1 each** @ 30 / 60 / 90 *(one per lane)*
**@ 30** — A · **Quickener** *(your haste effects are stronger)* | B · **Lucky** *(your fortune buffs raise crit/dodge more)* | C · **Seer** *(your foresight shields are larger)*
**@ 60** — A · **Time Thief** *(slowing a foe grants your party a little attack-bar)* | B · **Decohering** *(your enemy accuracy/crit debuffs are stronger)* | C · **Prophet** *(your foresight can predict an extra hit)*
**@ 90** — A · **Timeless** *(your party-haste also grants an extra-action chance)* | B · **Fixed Outcome** *(your fortune buffs can guarantee a crit/dodge once)* | C · **Oracle** *(your foreseen shields also cleanse the predicted debuff)*

---

## Validation
| Invariant | Result |
|---|---|
| 1 + 20 + 18 + 4 + 9 = **52** | ✓ |
| 2 options on correct thresholds; lanes A7/B7/C6 (specials), A6/B6/C6 (sigs), no lane every milestone | ✓ |
| ults 3 laned + 1 neutral; every option lane-tagged | ✓ |
| primary SPD ← QUANTA · secondary VIT ← Staff | ✓ |
| economy (specials gen / sig·ult cost / auto minor / all QUANTA) | ✓ |
| all `proposed`; names globally unique (invariant #8) | ✓ |
