# Sunblade — SOL × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed.** Greenfield design spec authored
> by the `build-class` skill against the [Class System Model](./README.md). The class fantasy, lanes,
> seat (AGI+AGI flagship), and duelist DNA are **`from-brief`** — the ratified row + sketch in the
> [Dual Swords family note](./dual-swords-family.md); the kit's individual abilities are `proposed`.
> Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (Burn / Blind / Scorched / Overheat→Ignite→Detonate / Haste / Spread) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (SOL suite).

## Identity (derived + DNA)

- **Class:** Sunblade · **Attunement × Archetype:** SOL × Dual Swords
- **Primary stat:** AGI (← SOL) · **Secondary stat:** AGI (← Dual Swords) — the **doubled-stat
  flagship**, the purest crit duelist
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (DoT) · SOL suite: **Blind** (miss chance), **Scorched**
  (vulnerability), **Overheat → Ignite → Detonate** (phase chain), **Haste / extra action**,
  **Spread** (DoTs propagate to adjacent foes). SOL is **pure offense — no defensive line.**

**Fantasy.** *(from-brief)* A radiant **pure crit duelist** — a stand-and-duel bladesman who wins the
exchange with clean, brilliant crits and a parry of light. Twin blades chain in sustained, escalating
bladework; one blade always kept back to **parry** an incoming blow and answer it with a counter of
fire. Where the SOL dagger (Eclipsedancer) blinks in and vanishes, the Sunblade **plants its feet and
duels** — it out-precisions the enemy across a long exchange, blinding them so they whiff while its
own cuts land true. The flagship of the dual-sword family: AGI on AGI, crit on crit, no armor and no
need of it.

### The shared duelist DNA *(from-brief — how this is a dual-sword)*

1. **Crit (AGI-keyed) is the win condition.** The Sunblade wins by landing clean, *critical* cuts —
   precision, not volume. AGI+AGI is the doubled-stat crit machine.
2. **Riposte / Parry.** Two blades = offense *and* defense in one; the off-blade is kept back to
   **counter** an attack — the dual-sword's only survival tool (SOL has no armor line). Its parry is
   *of light*: a blocked blow answers with a radiant burst, and **Blind** keeps the enemy missing.
3. **Flow / stance.** Sustained bladework chains that build momentum across the *exchange*, not a
   single burst — escalating cuts that compound (entropy rising).
4. **Opening → Finisher reuses SOL's own phase chain.** No new combo resource: the Opening **is**
   **Overheat → Ignite → Detonate** — cuts stack heat, finishers ignite and detonate it.

### Lanes *(from-brief)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Solar Edge** | crit-burst bladework: stack crit through sustained cuts, spend on radiant finishers — the AGI+AGI single-target duel | **AGI**, Crit, Overheat stacks | solo carry / single-target spike | bosses & high-value targets; gear-rich crit build |
| **B · Sunflare** | Burn through sustained cuts, then **Detonate** it; **Blind** to win the exchange | Burn stacks, Detonate, Blind | DoT / burst-and-blind pressure | drawn-out fights; accuracy-reliant or clustered foes |
| **C · Riposte** | the light parry: **parry → radiant counter**, evasion-via-Blind — the duelist's defense | parry/counter, Blind, Evasion | survivable self-pocket duelist | low-support party; the duelist must hold its own ground |

**Build axes:** crit-burst ↔ Burn/Detonate (A↔B) · kill-the-target ↔ win-the-exchange-defensively
(A↔C) · self-carry ↔ blind/counter survival (A,B ↔ C).

---

## Auto-attack *(unlaned)*

- **Sunblade Flourish** · phys · enemy · *two flowing radiant cuts (two crit rolls), each kindling a wisp of heat (Overheat)* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Solflare Cut** · phys · enemy · *a quick radiant cut; builds Overheat (the Opening)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Searing Slice** · phys · enemy · *a twin cut, each pass applying Burn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Glare Cut** · phys · enemy · *a flashing strike; lightly Blind the target* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Parry of Light** · buff · self · *raise the off-blade: brace to counter the next hit with a radiant burst* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Radiant Lunge** · phys · enemy · *a heavy crit-leaning thrust; deepens Overheat on the target* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Counter Spark** · phys · enemy · *a strike; if you parried last turn, it crits and applies Burn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Brightblade Combo** · phys · enemy · *a flowing three-cut chain; bonus damage vs Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Cinder Slash** · phys · enemy · *a burning cut; the Burn can jump to an adjacent foe (Spread)* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Ignite Edge** · phys · enemy · *Ignite the target's Overheat into stacking Burn* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Sunder Riposte** · phys · enemy · *a counter-cut scaling with how recently you parried; Scorched on hit* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Flowing Edge** · phys · enemy · *a sustained cut-chain; each clean crit refunds part of the attack-bar (Haste lean)* · gen **major SOL** · cd **medium** · `proposed`
- **C · Dazzling Guard** · buff · self · *for a few turns, a blocked/parried hit Blinds the attacker* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Heat Edge** · phys · enemy · *a crit-leaning combo; the final cut spends Overheat for a burst* · gen **moderate SOL** · cd **medium** · `proposed`
- **B · Burning Exchange** · phys · enemy · *a duel of cuts; bonus damage vs Burning foes* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Flashpoint Cut** · mag · enemy · *detonate the target's Burn; the blast Spreads to neighbors* · gen **major SOL** · cd **medium** · `proposed`
- **C · Mirrorlight Parry** · buff · self · *for a few turns, a parried hit reflects part of its fire back as a radiant counter* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Sunpoint Strike** · phys · enemy · *a precise thrust that maximizes Overheat, priming the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **C · Riposte Flurry** · phys · enemy · *a chain of counter-cuts; bonus per parry banked this fight* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Solar Apex** · phys · enemy · *a heavy crit finisher; massive vs fully-Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Wildfire Exchange** · phys · allEnemies · *a sweeping radiant cut; Burn that Spreads among the foes it touches* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Solar Verdict Cut** · phys · enemy · *spend the target's Overheat: a guaranteed-crit strike* · cost **med SOL** · cd **medium** · `proposed`
- **B · Blazing Flash** · util · enemy · *a searing burst; deep Blind so the foe whiffs its next actions* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Detonating Cut** · mag · enemy · *a cut that detonates the target's Burn on the spot, Spreading to neighbors* · cost **med SOL** · cd **medium** · `proposed`
- **C · Riposte Stance** · buff · self · *enter a parry stance: parry the next several hits, each answered with a Burning radiant counter* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Coronal Lunge** · phys · enemy · *a deep thrust scaling with the target's Overheat stacks* · cost **med SOL** · cd **medium** · `proposed`
- **C · Blinding Parry** · buff · self · *brace: the next hit you take is parried and Blinds the whole enemy line* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sunlight Execution** · phys · enemy · *an execution cut; massive vs Overheated or low-HP foes* · cost **med SOL** · cd **medium** · `proposed`
- **B · Scorch Brand** · mag · enemy · *brand the target with Scorched + heavy Burn; it takes more from your fire* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Pyre Exchange** · mag · allEnemies · *detonate every Burn on the field at once, each blast Spreading onward* · cost **high SOL** · cd **medium** · `proposed`
- **C · Radiant Reprisal** · phys · enemy · *unleash a counter scaling with all the parries you've banked this fight* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Zenith Cut** · phys · enemy · *the perfect single strike: a guaranteed-crit finisher that fully spends Overheat* · cost **high SOL** · cd **medium** · `proposed`
- **C · Sunward Guard** · buff · self · *for several turns every hit you take is parried, each answered with a radiant Burning counter* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Brilliant Duel** · buff · self · *enter a flow stance: crits grant Haste and a chance at an extra action for several turns* · cost **high SOL** · cd **long** · `proposed`
- **B · Conflagrant Blade** · mag · allEnemies · *heavy spreading Burn across the line, escalating each turn* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Sunblind Field** · util · allEnemies · *flood the field with glare: deep Blind on all foes for several turns* · cost **high SOL** · cd **long** · `proposed`
- **C · Aegis of Light** · buff · self · *become a wall of parrying light: parry nearly every incoming hit briefly, each reflecting a radiant counter* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Searing Verdict** · phys · enemy · *a colossal guaranteed-crit finisher; detonates all the target's Burn and Overheat at once* · cost **high SOL** · cd **long** · `proposed`
- **C · Sunburst Counter** · phys · enemy · *a counter that converts your banked parries into a single radiant nova; Scorched on every foe it catches* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Edge of the Sun** *(Solar Edge)* · enemy · *a single perfect cut — a guaranteed maximal crit that detonates all the target's Overheat at once, scaling with missing HP* · `proposed`
- **B · Solar Conflagration** *(Sunflare)* · allEnemies · *the line catches fire — apply max Burn to every foe and chain-detonate it, each blast Spreading onward, Blinding the survivors* · `proposed`
- **C · Mirror of Dawn** *(Riposte)* · self → allEnemies · *raise a perfect parry for the turn — turn aside every incoming blow and answer the whole enemy line at once with a radiant Burning counter* · `proposed`
- **Sunblade Ascendant** *(neutral/fusion)* · allEnemies · *become a blade of pure daylight: Blind every foe, then a flowing crit-chain that Burns, Scorches, and detonates across the whole line* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Sunkindle** · *your strikes build Overheat faster* · `proposed`
- **B · Emberspread** · *your Burns spread to more foes when detonated* · `proposed`
- **C · Lightguard** · *after you parry a hit, gain Evasion* · `proposed`

**Set @ MNA 60**
- **A · Radiant Precision** · *your crit chance rises against Overheated foes* · `proposed`
- **B · Combustion Bloom** · *your Burn detonations hit harder* · `proposed`
- **C · Counterlight** · *your counters from parrying can critically strike* · `proposed`

**Set @ MNA 90**
- **A · Sunkiller** · *your finishers deal more to low-HP foes* · `proposed`
- **B · Solar Wildfire** · *your Burns stack higher and don't expire while you keep applying fire* · `proposed`
- **C · Radiant Bulwark** · *while you have Evasion, foes that miss you take Burn* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL | ✓ |
| Provenance flag on every entry (fantasy/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
