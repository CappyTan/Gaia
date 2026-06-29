# Eclipsedancer — SOL × Dual Daggers

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). Lanes, seat, and fragility
> answer are **`from-brief`** — the dev-approved row + sketch in the
> [Dual Daggers family note](./dual-daggers-family.md); the kit's individual abilities are
> `proposed`. Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (Burn / Blind / Scorched / Overheat→Ignite→Detonate / Haste / Spread) draws on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (SOL suite).

## Identity (derived + DNA)

- **Class:** Eclipsedancer · **Attunement × Archetype:** SOL × Dual Daggers
- **Primary stat:** AGI (← SOL) · **Secondary stat:** SPD (← Dual Daggers) — an AGI/SPD glass-cannon assassin
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (DoT) · SOL suite: **Blind** (miss chance), **Scorched**
  (vulnerability), **Overheat → Ignite → Detonate** (phase chain), **Haste / extra action**,
  **Spread** (DoTs propagate to adjacent foes). SOL is **pure offense — no defensive line.**

**Fantasy.** *(from-brief)* A glass-cannon burst assassin who blinks through light and shadow,
strikes from nowhere, and detonates. The Eclipsedancer out-races the ATB bar to land its kill
before the enemy can answer — twin blades rake Burn onto a foe with every cut, an Opening builds
on the fastest fights, and a single blinding finisher spends it all. It owns no armor: it survives
by **Blinding** the enemy so they miss, **blinking** out of the front row, or simply killing first.

### The shared rogue DNA *(from-brief — how this dagger is a dagger)*

1. **Twin-strike (double roll).** The auto and many specials hit *twice* → two crit checks, two
   **Burn** applications. The Eclipsedancer is the game's fastest applicator of Burn.
2. **Opening → Finisher.** Cheap fast specials build an **Opening**; signatures spend it. It does
   **not invent a new combo resource** — the Opening *is* SOL's own phase chain
   **Overheat → Ignite → Detonate** (stack heat with cuts; finishers detonate it).
3. **Tempo lean.** Dips SOL's action-economy layer — **Haste / extra action** — because SPD is secondary.
4. **Fragility management.** ~zero armor on the front line; survives through **Blind + blink**, never armor.

### Lanes *(from-brief)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Sundancer** | single-target burst combo: fast radiant cuts build an Opening (Overheat), spent on a blinding crit finisher | **AGI**, Crit, Overheat stacks | solo carry / single-target spike | bosses & high-value targets; gear-rich crit build |
| **B · Eclipse** | blink/Blind evasion & setup: teleport-strike out of the front row, **Blind** the enemy (they miss → survival), **Haste** self | **SPD**, Blind, Evasion/tempo | survivable carry / self-pocket assassin | squishy or accuracy-reliant foes; low-support party where the rogue must self-protect |
| **C · Wildfire** | Burn-spread engine: rake **Burn** on with every cut, then **Detonate** to spread across the enemy line (Overheat→Ignite→Detonate) | Burn stacks, Spread, AoE | DoT / AoE pressure | packs & drawn-out fights; SOL-stacked party that pools the pool |

**Build axes:** single-target burst ↔ AoE Burn-spread (A↔C) · kill-first glass cannon ↔
blink/Blind self-survival (A↔B) · self-carry ↔ battlefield pressure (A,B ↔ C).

---

## Auto-attack *(unlaned)*

- **Twinlight Cut** · phys · enemy · *two flickering blade-strikes (twin-strike: two crit rolls), each searing on a light Burn* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Sun Rake** · phys · enemy · *two fast radiant cuts; builds Overheat (the Opening)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Radiant Feint** · phys · enemy · *a flashing strike; gain brief Evasion* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Penumbra Step** · phys · enemy · *blink-strike from the front row; lightly Blind the target* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Searing Mark** · phys · enemy · *twin cut, each applying Burn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Solar Stigma** · phys · enemy · *heavy radiant strike; deepens Overheat on the target* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Cinder Rake** · phys · enemy · *rapid cuts that stack Burn; a Burn can jump to an adjacent foe* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Crescent Cut** · phys · enemy · *a crit-leaning arc; bonus damage vs Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Veilstep** · phys · enemy · *teleport behind the target; guaranteed crit when flanking* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Sunspot** · util · enemy · *a stab of glare; Blind the target (it misses)* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Wildfire Rake** · phys · allEnemies · *a sweeping twin cut; light Burn that spreads among foes* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Flicker Strike** · phys · enemy · *a blink-in flurry; refunds part of the attack-bar on a crit (Haste lean)* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Quickflame** · phys · enemy · *Ignite the target's Overheat into stacking Burn* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Heat Bloom** · phys · enemy · *a four-cut combo; the last spends Overheat for a burst* · gen **moderate SOL** · cd **medium** · `proposed`
- **B · Mirage Step** · phys · enemy · *blink-strike; gain Evasion and brief Haste* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Smoldering Veil** · util · self · *cloak in haze: self-Evasion; your next strike Blinds* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Spreading Embers** · mag · enemy · *detonate the target's Burn; the Burn jumps to neighbors (Spread)* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Sun's Opening** · phys · enemy · *a precise strike that maximizes Overheat, priming the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **C · Coronal Cut** · phys · allEnemies · *a radiant sweep; Scorched (vulnerability) on the foes it cuts* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Crescent Apex** · phys · enemy · *a heavy crit finisher; massive vs fully-Overheated targets* · gen **major SOL** · cd **medium** · `proposed`
- **B · Shade Step** · phys · enemy · *teleport-strike; Blind the target and reposition out of the front row* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Blinding Finisher** · phys · enemy · *spend the target's Overheat: a crit strike that also Blinds* · cost **med SOL** · cd **medium** · `proposed`
- **B · Dazzle** · util · enemy · *a searing flash; deep Blind so the foe whiffs its next actions* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Phase Blink** · buff · self · *blink out of the line: dodge the next hit and answer with a guaranteed crit* · cost **med SOL** · cd **medium** · `proposed`
- **C · Detonating Mark** · mag · enemy · *brand the target; when it next takes a hit, its Burn detonates and Spreads* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Umbral Riposte** · phys · enemy · *a from-shadow strike scaling with the target's Overheat stacks* · cost **med SOL** · cd **medium** · `proposed`
- **C · Pyre Mark** · mag · allEnemies · *spread Burn to every foe* · cost **med SOL** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Killing Light** · phys · enemy · *an execution cut; massive vs Overheated or low-HP foes* · cost **med SOL** · cd **medium** · `proposed`
- **B · Stardancer** · buff · self · *enter a blink stance: crits grant Evasion and a chance at an extra action* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Spark Cascade** · phys · allEnemies · *a blinking flurry across the line; Blind each foe it crits* · cost **high SOL** · cd **medium** · `proposed`
- **C · Sun-Eater Strike** · mag · allEnemies · *consume Burn across all foes for a burst; leaves lesser Burn behind* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Apex Cut** · phys · enemy · *the perfect single strike: a guaranteed-crit finisher that fully spends Overheat* · cost **high SOL** · cd **medium** · `proposed`
- **C · Detonation Cascade** · mag · allEnemies · *chain-detonate every Burn on the field, each blast Spreading to the next foe* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Vanishing Step** · phys · enemy · *blink in, land a colossal crit, blink out (self-Evasion after)* · cost **high SOL** · cd **medium** · `proposed`
- **B · Blink Storm** · phys · allEnemies · *a teleporting flurry striking the whole line; Haste self afterward* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Total Solar Eclipse** · util · allEnemies · *snuff the field in glare: deep Blind on all foes for several turns* · cost **high SOL** · cd **long** · `proposed`
- **C · Wildfire Bloom** · mag · allEnemies · *ignite the field — heavy spreading Burn that escalates each turn* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Ember Brand** · mag · enemy · *carve a deep, un-cleansable Burn that detonates for a crit-scaled burst* · cost **high SOL** · cd **long** · `proposed`
- **C · Coronal Burst** · mag · allEnemies · *detonate all Burn at once in a radiant nova; Scorched on every survivor* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Sunlit Edge** *(Sundancer)* · enemy · *a single perfect cut — a guaranteed maximal crit that detonates all the target's Overheat at once, bonus scaling with missing HP* · `proposed`
- **B · Veilrunner** *(Eclipse)* · self → enemy · *become unhittable for the turn (blink to ~total Evasion), Blind the whole field, then strike from nowhere with a guaranteed crit* · `proposed`
- **C · Wildfire's Reach** *(Wildfire)* · allEnemies · *the line catches fire — apply max Burn to every foe and chain-detonate it, each blast Spreading onward* · `proposed`
- **Umbral Zenith** *(neutral/fusion)* · allEnemies · *blot out the sun: Blind every foe, then a blinking flurry that Burns, Scorches, and detonates across the whole line* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Kindling** · *your strikes build Overheat faster* · `proposed`
- **B · Penumbral Guard** · *after you Blind a foe, gain Evasion* · `proposed`
- **C · Spreadfire** · *your Burns spread to more foes when detonated* · `proposed`

**Set @ MNA 60**
- **A · Glasswork** · *your crit chance rises against Overheated foes* · `proposed`
- **B · Flashpoint** · *blinking (teleport-strikes) grants brief Haste* · `proposed`
- **C · Burnout** · *your Burn detonations hit harder* · `proposed`

**Set @ MNA 90**
- **A · Sunsteal** · *your finishers deal more to low-HP foes* · `proposed`
- **B · Combustive Veil** · *while you have Evasion, foes that miss you take Burn* · `proposed`
- **C · Ashfall Veil** · *your Burns stack higher and don't expire while you keep applying them* · `proposed`

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary SPD ← Dual Daggers · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL | ✓ |
| Provenance flag on every entry (lanes/fantasy/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
