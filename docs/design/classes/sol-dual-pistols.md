# Gunslinger Solaris — SOL × Dual Pistols

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The class fantasy, seat (the
> doubled-AGI pure crit-**gunslinger** — volume of fire), the three locked lanes
> (**A · Fan Fire / B · Trick Shot / C · Quickdraw**), and the Gunslinger DNA are **`from-brief`** —
> the dev-approved row + sketch in the [Dual Pistols family note](./dual-pistols-family.md) and the
> brief; the kit's individual abilities are `proposed`. Numberless by design; magnitudes are a later
> balance pass. Mechanics vocabulary (Burn / Blind / Scorched / Overheat → Ignite → **Detonate** /
> Haste / **Spread**) draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md)
> (SOL suite). SOL is **pure offense — no defensive line.**

## Identity (derived + DNA)

- **Class:** Gunslinger Solaris · **Attunement × Archetype:** SOL × Dual Pistols
- **Primary stat:** AGI (← SOL) · **Secondary stat:** AGI (← Dual Pistols) — the **doubled-AGI
  flagship** of the ranged line, the purest crit-gunslinger: two barrels, two crit rolls, a hail of
  attuned rounds
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn** (DoT, raked across the line by volume of fire) · SOL suite:
  **Blind** (muzzle-flash → miss chance), **Scorched** (vulnerability), **Overheat → Ignite →
  Detonate** (phase chain — heat built by sustained fire, ignited and detonated by a round), **Haste /
  extra action** (quickdraw tempo), **Spread** (Burn jumps to adjacent foes). SOL is **pure offense —
  no defensive line.**

**Fantasy.** *(from-brief)* A back-line **crit-gunslinger** who buries the whole enemy line under a
**hail of radiant fire.** Twin sidearms answer the question the family asks — *how fast can you keep
firing?* — with **volume**: every pull is two barrels, two crit rolls, two specks of Burn raked across
the row. Where the SOL Rifle (Photon Vanguard) wins with **one charged beam** that removes a single
target, the Gunslinger Solaris wins by **fanning the hammer** — a crit-spray that lights the line on
fire, then walks the rounds across it until the whole row burns. Muzzle-flashes **Blind** the foes so
they whiff while the rounds keep landing; trick shots **ricochet** off one target into the next; and
the gunslinger never stands still — it rolls, vaults, and quickdraws from the back row, kiting at range
because the fragile have only one defense: *don't get hit.* No parry, no ward, no wall — just the speed
of the draw and the weight of the volley. The doubled-AGI flagship: AGI on AGI, crit on crit, fire
walked down the line.

### The shared Gunslinger DNA *(from-brief — how this is a Dual Pistols class)*

1. **Double-tap (two barrels → two crit rolls / two Burn applications).** The auto and most specials
   fire **both barrels** — two rolls to crit, two specks of Burn raked on. The doubled-AGI machine
   lives here: volume of crit, not a single big hit.
2. **Volume / rhythm.** Sustained fire builds **Overheat** and momentum; cheap fast rounds feed the
   finishers. The win comes from *keeping firing*, the hail compounding (entropy rising), not from one
   spike.
3. **Mobility (back-line kite).** The fragility answer is **reposition / quickdraw / roll** — first
   shot off the draw, **Haste**, and never holding still at range. The only defense is range and tempo;
   SOL has no armor and needs none.
4. **Reuse SOL's own phase chain, applied by fire.** No new combo resource: the Opening **is**
   **Overheat → Ignite → Detonate** — sustained fire stacks heat on the line, a round **Ignites** it
   into Burn, and a finishing round **Detonates** the Burn for a blast that **Spreads** down the row.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Fan Fire** *(lead)* | **Volume crit-spray + Burn across the line**: fan the hammer — rapid radiant volleys that rake **Burn** onto the whole row and walk it across them. The showcase Gunslinger engine; sustained AoE crit-pressure that compounds | **AGI**, Crit, Burn, Spread, volume | back-line AoE crit-pressure | packs & clustered lines; drawn-out fights; SOL-stacked party that pools the hot pool |
| **B · Trick Shot** | **Precision crit + ricochet + muzzle-Blind**: aimed trick rounds that crit, **ricochet** from one foe to the next, and muzzle-flash **Blind** so the field whiffs. Crit-density and accuracy-denial, the marksman's-eye half of the gunslinger | **AGI**, Crit, ricochet, Blind | crit-spike / accuracy-denial controller | high-value targets in a pack; crit-rich gear; accuracy-reliant or hard-hitting foes |
| **C · Quickdraw** | **Mobility / tempo (pure offense)**: first-shot off the draw, **Haste**, rolls and repositions, extra-action bursts — out-tempo the fight from the back row. The fragility answer is *speed*, never a guard | **AGI**, SPD-feel/tempo, Haste, mobility | tempo / first-strike kite enabler | you must open fast and stay untouched; low-support party; spike windows that reward acting first |

**Build axes:** volume Burn-spray ↔ precision crit/ricochet (A↔B) · raw line-pressure ↔ tempo/mobility
opening (A↔C) · win-by-the-hail ↔ win-by-the-draw-and-the-trick (A,B ↔ C). **All three are offense** —
SOL has no defensive line; "survival" is range, Blind, and tempo.

**Cross-lane synergy:** **A fans Burn across the whole line and B Blinds it so it whiffs while the heat
builds → C opens the window with Haste and the first draw, then a trick round Ignites and Detonates the
stacked Burn, the blast Spreading down the already-lit row.** Fan Fire lights the line, Trick Shot blinds
and pinpoints it, Quickdraw sets the tempo and pulls the trigger first.

---

## Auto-attack *(unlaned)*

- **Twin Barrels** · phys · enemy · *fire both sidearms at once — two rounds, two crit rolls, each kindling a wisp of heat (Overheat) on the foe it strikes* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Searing Volley** · phys · allEnemies · *a quick fanned spray across the line; rakes a light Burn onto the foes it tags (the Opening)* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Crackshot** · phys · enemy · *a single aimed round, two barrels into one mark; crit-leaning, bonus crit vs a Blinded foe* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Glare Round** · phys · enemy · *a flashing muzzle-burst into the target's eyes; lightly Blind it so its next shots whiff* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Opening Draw** · buff · self · *quickdraw stance for a turn: your next round fires first off the draw and lightly Hastes you* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Burning Spread** · phys · allEnemies · *rapid double-tapped rounds that rake Burn; the Burn can jump to an adjacent foe (Spread)* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Roll and Fire** · phys · enemy · *roll to reposition out of reach, then fire on the recovery — bonus damage and a refund of part of your attack-bar (Haste lean)* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Fanning Sunfire** · phys · allEnemies · *fan the hammer across the line; bonus damage vs Burning foes and deepens the Burn it finds* · gen **major SOL** · cd **medium** · `proposed`
- **B · Ricochet Round** · phys · enemy · *a trick round that bounces from the target into a second foe behind it; crit-leaning on the first hit* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Mirror Ricochet** · phys · allEnemies · *a wall-bounced spray that ricochets through the line, Blinding each foe it skips across* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Ignition Round** · phys · enemy · *a hot round that Ignites the target's Overheat into stacking Burn; Hastes you on the kindle* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Wildfire Volley** · phys · allEnemies · *a sustained fan that walks Burn down the whole row, deepening it on every foe it sweeps* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Vault and Fire** · phys · enemy · *vault clear of the front and fire mid-air; a clean crit-leaning shot and a big attack-bar refund (Haste)* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Powderburn** · phys · allEnemies · *empty both magazines across the line, maximizing Burn and Overheat to prime the finisher* · gen **major SOL** · cd **medium** · `proposed`
- **B · Pinpoint Round** · phys · enemy · *a perfectly aimed round into a Blinded foe; a guaranteed crit when the target can't see it coming* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Trickshot Bloom** · phys · allEnemies · *a single round that ricochets foe-to-foe down the line, each bounce muzzle-flashing Blind and Scorching where it lands* · gen **major SOL** · cd **medium** · `proposed`
- **C · Backpedal Spray** · phys · enemy · *backpedal to max range and unload; refund attack-bar and gain a chance at an extra action (Haste / double-tap)* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Detonating Round** · phys · enemy · *a hot round that detonates the target's Burn; the blast Spreads to its neighbors* · gen **major SOL** · cd **medium** · `proposed`
- **C · Run and Gun** · buff · self · *for a few turns you fire on the move: each round refunds part of your attack-bar and you cannot be pinned to the front* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Solar Fusillade** · phys · allEnemies · *a relentless fanned barrage; heavy Burn that Spreads among every foe the volley touches* · gen **major SOL** · cd **medium** · `proposed`
- **B · Skip Shot** · phys · allEnemies · *a flat ricochet that skips the whole line; a crit-leaning hit on each foe and deep Blind on the ones it grazes* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Fan the Hammer** · phys · allEnemies · *a furious fan of both barrels across the line, raking heavy Burn onto every foe in the spray* · cost **med SOL** · cd **medium** · `proposed`
- **B · Blinding Flash Round** · util · enemy · *a point-blank muzzle-flash; deep Blind so the foe whiffs its next several actions* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Bouncing Round** · phys · allEnemies · *a single trick round that ricochets the entire line front-to-back, crit-leaning on each bounce and Blinding where it skips* · cost **med SOL** · cd **medium** · `proposed`
- **C · Hammer Down** · phys · enemy · *quickdraw and fire before the target can act — a first-strike crit round that also Hastes you* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Sunfire Hail** · mag · allEnemies · *a downpour of radiant rounds — lay Burn on every foe and let it Spread down the line* · cost **med SOL** · cd **long** · `proposed`
- **C · Quick Roll** · buff · self · *roll clear and reset the draw: gain Haste and a guaranteed extra action this round* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Burning Rounds** · mag · allEnemies · *load incendiary rounds and walk them across the line; heavy Spreading Burn, bonus vs already-Burning foes* · cost **med SOL** · cd **medium** · `proposed`
- **B · Crackfire** · phys · enemy · *a rapid trio of aimed rounds into one mark; each is a guaranteed crit if the target is Blinded* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Mirage Round** · util · allEnemies · *a dazzling spray of muzzle-flashes; deep Blind on the whole line and Scorched on the foes nearest the barrels* · cost **high SOL** · cd **medium** · `proposed`
- **C · Solar Crossfire** · phys · allEnemies · *empty both sidearms in a crossing hail; detonate every Burn on the field at once, each blast Spreading onward, while Haste carries you clear* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Suns Salvo** · mag · allEnemies · *a salvo of falling radiant rounds; max Burn across the line, escalating each turn it keeps firing* · cost **high SOL** · cd **medium** · `proposed`
- **C · Lightfoot** · buff · self · *for several turns you move like light: every shot refunds attack-bar, you act first each round, and you cannot be pinned or rooted* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Wildfire Fusillade** · mag · allEnemies · *an unending fanned barrage; Burn that Spreads to every foe and keeps jumping for several turns* · cost **high SOL** · cd **long** · `proposed`
- **B · Sunsplinter Ricochet** · phys · allEnemies · *one round shattered into a ricochet storm; a crit-leaning hit that skips the entire line, Blinding and Scorching every foe it touches* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Mirrorlight Barrage** · util · allEnemies · *flood the field with muzzle-glare: total Blind on all foes for several turns as ricochets skip among them* · cost **high SOL** · cd **long** · `proposed`
- **C · Faster Than the Draw** · buff · self · *time bends to the trigger — take a long run of consecutive actions, each round firing first and refunding tempo (extra-action / Haste cascade)* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Walking Wildfire** · mag · allEnemies · *an un-cleansable Burn walked across the whole line that detonates for a burst scaling with how many foes it Spread to* · cost **high SOL** · cd **long** · `proposed`
- **C · Quickdraw Verdict** · phys · enemy · *the impossible draw — fire before the target's turn even begins for a colossal guaranteed-crit round that detonates all its Burn and Overheat at once, then Haste clear* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Hail of Light** *(Fan Fire)* · allEnemies · *empty every barrel into the sky and bring it down — rake max Burn across every foe and let the wildfire Spread and re-Spread down the row, escalating each turn the hail keeps falling* · `proposed`
- **B · Mirror Fusillade** *(Trick Shot)* · allEnemies · *a single round shattered into an endless ricochet for the turn — it skips foe-to-foe-to-foe without stopping, a guaranteed crit and deep Blind on every enemy it touches, Scorching the line it leaves behind* · `proposed`
- **C · Speed of the Sun** *(Quickdraw)* · self → enemy · *outrun the fight itself — for the turn you act before anything else can move, a cascade of first-draw crit rounds with no recovery between them, each Hasting you further* · `proposed`
- **Gunslinger's Fanfare** *(neutral/fusion)* · allEnemies · *the perfect spray of daylight: fan the hammer across the whole line to Blind it and rake it with Spreading Burn, ricochet a trick round through the lit row, then Detonate every Burn on the field at once — and stand untouched, already reloaded* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Hot Barrels** · *your volleys rake Burn onto more foes, and it Spreads more readily* · `proposed`
- **B · Steady Aim** · *your rounds crit more often, and harder, against Blinded foes* · `proposed`
- **C · Light on the Feet** · *after you reposition or roll, your next round fires first and lightly Hastes you* · `proposed`

**Set @ MNA 60**
- **A · Walking Fire** · *your Burns stack higher and don't expire while you keep firing onto the line* · `proposed`
- **B · Trick Hand** · *your ricochets skip to more foes and each bounce can crit* · `proposed`
- **C · Hair Trigger** · *gain bonus attack-bar fill whenever you act first in a round (the draw rewards itself)* · `proposed`

**Set @ MNA 90**
- **A · Wildfire Gunner** · *when your Burn Spreads to a fresh foe, the jump deals bonus damage* · `proposed`
- **B · Dead-Eye** · *while a foe is Blinded your rounds against it cannot miss and are guaranteed crits* · `proposed`
- **C · Never Cornered** · *you cannot be rooted, pinned, or forced to the front row, and a missed enemy attack refunds part of your attack-bar* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Dual Pistols.** Gunslinger Solaris is the **doubled-AGI
  pure crit-gunslinger**: a back-line **hail** of radiant double-tapped rounds that rakes Burn down the
  line, ricochets and muzzle-Blinds, and quickdraws/kites for tempo. Distinct from the NOX **Cryovex**
  (Chill-round freeze-volley, attack-bar drag), the ANIMA **Sporecaster** (Infestation-spread spore-gun,
  non-healer), the QUANTA **Entropic Echo** (probability ricochet-echo volley, crit/dodge swings), and
  the UMBRAXIS **Orbitalist** (gravity-curved rounds that pull/cluster + Drain). Only the Gunslinger's
  volley is **fire that Spreads** and **light that Blinds** — the SOL signature delivered as volume of
  fire — and only its win condition is a *crit-hail*, not a control or sustain effect.
- **Same-archetype — vs its SOL Rifle cousin (Photon Vanguard, the *one shot*).** The split is the
  ranged-family axis itself: the Photon Vanguard charges and fires **one beam** that pierces and removes
  a single target (precision, the charged lance). Gunslinger Solaris is **volume** — two barrels, two
  crit rolls, a relentless spray that buries the *whole line* under Burn and walks the rounds across it.
  The Vanguard makes the one shot; the Gunslinger never stops firing. Same SOL suite, opposite delivery:
  *the precise single round vs the crit-hail.*
- **Same-archetype — vs the melee SOL Sunblade (also AGI+AGI).** They share only the doubled-AGI stat
  line and the SOL signature. Sunblade is the **melee parry-duelist** — it plants its feet, *parries* an
  incoming blow with a blade of light, and wins a single-target *exchange* with riposte and counter.
  Gunslinger Solaris is **ranged volume-fire from the back row with no parry at all** — its only defense
  is range, Blind, and quickdraw tempo (don't get hit), and its win is the spreading hail across the
  line, not a one-on-one duel. Different row, different mechanic, opposite survival model
  (stand-and-parry vs kite-and-spray).
- **Same-attunement (#10) — SOL concept budget.** It reuses the SOL *signature* (Burn) and the full SOL
  suite (Blind / Scorched / Overheat → Ignite → Detonate / Haste / Spread) freely, as the framework
  intends — but it does **not** pile onto a saturated SOL role. The **single-target crit duel** is owned
  by Sunblade (Dual Swords); the **blink-execute assassin** by Eclipsedancer (Dual Daggers); the
  **back-line caster artillery/nuker** by Heliomancer (Staff); the **slam→detonation point-breaker** by
  Solar Arbiter (Hammer); the **fast melee line-cleaver** by Starbreaker (Two-Handed Sword); the **block
  off-tank** by Dawnwarden (Sword & Shield); the **single charged beam** by Photon Vanguard (Rifle).
  Gunslinger Solaris's seat — *the ranged volume-of-fire crit-hail that walks Spreading Burn across the
  whole line and kites for tempo* — is held by no other SOL class. (SOL is by ratified policy **pure
  offense, no defensive line** — honored: Quickdraw is *mobility/tempo as the fragility answer*, never a
  Block, ward, or parry.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary AGI ← Dual Pistols · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL (runs hot) | ✓ |
| Provenance on every entry (fantasy/seat/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Dual Pistols siblings *and* from Photon Vanguard + Sunblade | ✓ |
| Same-attunement concept budget (#10) — reuses SOL signature only; no saturated-role pile-on; SOL no-defense policy honored | ✓ |
