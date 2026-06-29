# Starforge Knight — SOL × Spellblade

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The class fantasy, seat (the
> **doubled-AGI radiant battle-mage** — forge solar fire into the blade *and* into spell-bursts), the
> three locked lanes (**A · Forgeblade / B · Solar Casting / C · Starforge**), and the Runeblade DNA
> are **`from-brief`** — the LOCKED row + sketch in the [Spellblade family note](./spellblade-family.md);
> the kit's individual abilities are `proposed`. Numberless by design; magnitudes are a later balance
> pass. Mechanics vocabulary (Burn / Blind / Scorched / Overheat → Ignite → **Detonate** / Haste /
> **Spread**) draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md)
> (SOL suite). SOL is **pure offense — no defensive line.**

## Identity (derived + DNA)

- **Class:** Starforge Knight · **Attunement × Archetype:** SOL × Spellblade
- **Primary stat:** AGI (← SOL) · **Secondary stat:** AGI (← Spellblade) — the **doubled-AGI
  flagship**: the only AGI+AGI class that *casts*. A front-line battle-mage that scales **both** on AGI
  yet fights with `mag` + `armor` at melee range (the Spellblade's caster stats)
- **Resource:** SOL (party-shared; **runs hot** — generates fast on the strike, bleeds away if hoarded,
  spent on the cast)
- **Attunement signature:** **Burn** (DoT — forged into the blade, stoked by strikes) · SOL suite:
  **Blind** (radiant flash → miss chance), **Scorched** (vulnerability), **Overheat → Ignite →
  Detonate** (phase chain — heat forged by strikes, ignited and **Detonated** by the spell), **Haste /
  extra action** (the strike↔cast tempo), **Spread** (Burn jumps to adjacent foes when the spell
  detonates it). SOL is **pure offense — no defensive line.**

**Fantasy.** *(from-brief)* A **radiant battle-mage** who carries the star into the fight: it **forges
solar fire into the blade and into spell-bursts at once**, and wins by the loop between them. The
strike is the forge — every imbued cut stokes **Overheat** and **Burn** into the foe and **banks the
SOL** that fuels the spell; the spell is the **release** — a close-range burst that **Detonates** the
Burn the blade laid in, the blast **Spreading** down the line, and in turn re-tempers the blade hotter
for the next cut. Where the SOL **Staff** (Heliomancer) pours fire from *safety at the back*, the
Starforge Knight **stands at the front and melts the line at sword's reach** — `mag` and `armor`
instead of a back-row glass cannon. And where the two other SOL AGI+AGI classes win by **crit** — the
**Sunblade** as a stand-and-parry melee *duelist*, the **Gunslinger Solaris** as a kiting ranged
*crit-gunner* — the Starforge Knight is the **battle-MAGE**: it **imbues and casts**, its win condition
is the **strike↔cast forge loop** (stoke by blade, Detonate by spell), and it lives on `mag` and
spell-bursts, not on a crit-parry or a hail of rounds. The shared doubled-AGI stat line is the only
thing the three have in common.

### The shared Runeblade DNA *(from-brief — how this is a Spellblade)*

1. **Imbue — channel SOL into the blade.** The blade *carries* the Attunement: imbued cuts deliver
   **Burn** in melee and stack **Overheat** on the foe, and the charge laid in by the strike can be
   **released** as a spell-burst. The Starforge Knight *is* SOL, blade in hand.
2. **Strike↔Cast rhythm (the generate→spend economy, made literal).** Melee strikes **generate** SOL
   (the forge runs hot); spells **spend** it. The Knight forges heat with the blade and pays it back
   out as fire from the hand — the most direct expression of the MNA generate→spend loop, and a perfect
   fit for SOL's *runs-hot* pool.
3. **Front-line caster.** It casts at melee range and *survives* there on `mag` + `armor`, **unlike the
   Staff** — the spell-warrior who doesn't hide in the back. SOL has no defensive *line*, so its
   front-line answer is **offense delivered faster** (Haste, Detonate, melt the foe before it melts you),
   never a ward, block, or parry.
4. **Reuse SOL's own phase chain via the imbued blade (melee-delivered).** No new combo resource: the
   Opening **is** **Overheat → Ignite → Detonate** — the blade forges Overheat and Burn into the target,
   the spell **Ignites** and **Detonates** it, the blast **Spreads** down the row.

### Lanes *(from-brief — locked)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Forgeblade** *(blade)* | **Imbued melee**: fast radiant cuts that forge **Overheat** and stoke **Burn** into the foe — the strike side of the forge. Builds the SOL pool and the heat the spell will Detonate; the front-line damage engine | **AGI**, Overheat/Burn build, melee, SOL generation | front-line single-target pressure + resource engine | bosses & priority targets; AGI/melee-leaning gear; you want to feed the pool and prime the line yourself |
| **B · Solar Casting** *(cast)* | **Spell-bursts at melee range**: **Detonate** the Burn the blade laid in, **Blind** the line, radiant AoE — the release side of the forge. Spends the banked SOL for the payoff | **AGI**/`mag`, Detonate, Blind, AoE, Spread | close-range AoE burst + accuracy-denial | clustered lines; a primed Burning line to Detonate; `mag`-leaning gear; SOL-stacked party that pools the hot pool |
| **C · Starforge** *(fusion — the seat)* | **The strike↔cast loop**: the **imbue-and-release** rhythm — strike charges the spell, spell empowers the blade — plus **Haste / extra action** tempo to keep the loop spinning. The signature fusion seat | **AGI**, the strike↔cast cadence, Haste, Overheat→Ignite→Detonate | self-sustaining tempo carry that fuses blade + cast | drawn-out fights where the loop compounds; low-support party that must keep its own tempo; whenever you want neither pure blade nor pure cast but the *engine* |

**Build axes:** stoke-with-the-blade ↔ Detonate-with-the-spell (A↔B) · raw forge-pressure ↔ the
loop/tempo engine (A↔C) · spell-burst payoff ↔ the loop/tempo engine (B↔C). **All three are offense** —
SOL has no defensive line; "survival" at the front is `armor` + Haste + melting the foe first.

**Cross-lane synergy:** **A forges Overheat and Burn into the target with imbued cuts and banks the SOL
→ B spends it to Ignite and Detonate that Burn at close range, the blast Spreading down the line and
Blinding the survivors → C is the loop that joins them: the strike charges the next spell, the spell
re-tempers the blade hotter, and Haste keeps the forge cycling faster than the foe can answer.** Stoke
by blade, release by spell, and the fusion never lets the forge cool.

---

## Auto-attack *(unlaned)*

- **Runebrand Cut** · phys · enemy · *an imbued radiant cut — the solar rune on the blade bites in, kindling a wisp of heat (Overheat) on the foe it strikes* · gen **minor SOL** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Forgestrike** · phys · enemy · *a quick imbued cut that forges Overheat into the target (the Opening); banks a little SOL* · gen **moderate SOL** · cd **short** · `proposed`
- **B · Castfire** · mag · enemy · *a short solar burst from the off-hand; applies Burn at close range* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Runelight Burst** · mag · enemy · *a focused bolt of inscribed light; bonus vs a Blinded foe* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Quench and Strike** · phys · enemy · *strike, then immediately discharge the heat as a small burst — the first beat of the loop; lightly Hastes you on the release* · gen **moderate SOL** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Heatforge Cut** · phys · enemy · *a heavy imbued cut; deepens Overheat and stokes Burn into the target* · gen **moderate SOL** · cd **short** · `proposed`
- **C · Spellforge Loop** · phys · enemy · *an imbued cut that "charges" your next cast — the next Solar Casting spell this turn costs less; banks SOL* · gen **major SOL** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Blade Kindling** · phys · enemy · *a flowing imbued combo; bonus damage vs Overheated foes and adds a wisp of Burn each pass* · gen **major SOL** · cd **medium** · `proposed`
- **B · Searing Imbuement** · mag · allEnemies · *channel the rune outward — a close radiant wash that rakes light Burn across the line and can Spread* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Glyphburst** · mag · enemy · *Ignite the target's forged Overheat into stacking Burn with a point-blank glyph* · gen **moderate SOL** · cd **medium** · `proposed`
- **C · Casting Ignition** · mag · enemy · *spend the heat the blade just laid in: a burst that Ignites Overheat into Burn and Hastes you for the next strike* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Annealing Strike** · phys · enemy · *a sustained imbued cut-chain; each clean hit refunds part of the attack-bar (Haste lean) and stokes Burn hotter* · gen **major SOL** · cd **medium** · `proposed`
- **C · Forgewright's Loop** · phys · enemy · *the full beat: strike to forge heat, release a burst that Detonates it, the recoil re-tempering the blade — bonus on a target you Detonated* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Forge-Tempered Strike** · phys · enemy · *a precise imbued thrust that maximizes Overheat, priming the Detonation* · gen **major SOL** · cd **medium** · `proposed`
- **B · Runeflare** · mag · enemy · *a flaring solar glyph; lightly Blind the target so its next actions whiff* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Glyph Detonation** · mag · enemy · *a point-blank glyph that detonates the target's Burn; the blast Spreads to its neighbors* · gen **major SOL** · cd **medium** · `proposed`
- **C · Casting Crucible** · mag · allEnemies · *strike then cast in one motion — a close radiant burst that Ignites the line's Overheat and refunds attack-bar (Haste) for the next cut* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Whitefire Cut** · phys · enemy · *a white-hot imbued finisher cut; massive vs a fully-Overheated target* · gen **major SOL** · cd **medium** · `proposed`
- **C · Forgefire Verdict** · phys · enemy · *the loop's signature special: a cut that spends the blade's stored heat for a burst and immediately re-imbues hotter, a chance at an extra action* · gen **moderate SOL** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Runewrought Cut** · phys · enemy · *a heavy imbued crescendo cut; deepens Overheat and Burn to their peak for the spell to spend* · gen **major SOL** · cd **medium** · `proposed`
- **B · Runefire Nova** · mag · allEnemies · *a close radiant nova from the off-hand; Burn that Spreads among every foe it washes over* · gen **major SOL** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Forgemark** · phys · enemy · *a deep imbued strike that brands the target with Scorched and forges heavy Overheat into it* · cost **med SOL** · cd **medium** · `proposed`
- **B · Casting Surge** · mag · enemy · *a charged solar burst at melee range; big single-target fire* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Solar Inscription** · mag · enemy · *inscribe a burning glyph that detonates the target's Burn on the spot, Spreading to neighbors* · cost **med SOL** · cd **medium** · `proposed`
- **C · Smith's Cadence** · buff · self · *enter the forge rhythm: for several turns each strike charges the next cast and each cast Hastes the next strike (the strike↔cast loop, accelerated)* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Emberscript** · mag · enemy · *carve a burning rune that brands Scorched and lays escalating Burn that ramps each turn* · cost **med SOL** · cd **medium** · `proposed`
- **C · Runic Detonation** · mag · enemy · *spend the blade's stored heat in one burst: detonate all the target's forged Overheat and Burn at once, Spreading the blast* · cost **med SOL** · cd **medium** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Crucible Cut** · phys · enemy · *an execution-grade imbued cut; massive vs an Overheated or low-HP target* · cost **med SOL** · cd **medium** · `proposed`
- **B · Glyphlight Strike** · mag · allEnemies · *a sweeping glyph of light; deep Blind across the line so the foes whiff* · cost **low SOL** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Solar Glyphfire** · mag · allEnemies · *detonate every Burn on the field at once with a chain of glyphs, each blast Spreading onward* · cost **high SOL** · cd **medium** · `proposed`
- **C · Anvilstrike** · phys · enemy · *the hammer-blow of the loop: strike to forge max heat, then a built-in burst that Detonates it — a single fused strike-and-cast for a burst, then Haste clear* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Star-Forged Edge** · buff · self · *temper the blade in a star for several turns: imbued cuts forge Overheat far faster and apply heavier Burn* · cost **high SOL** · cd **medium** · `proposed`
- **C · Solar Crucible** · mag · allEnemies · *open a melting crucible at sword's reach: sustained close-range fire that Ignites the whole line's Overheat and keeps Detonating, escalating each turn* · cost **high SOL** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Heartforge Strike** · phys · enemy · *the perfect single imbued cut: a finisher that spends the target's full Overheat for a colossal hit* · cost **high SOL** · cd **long** · `proposed`
- **B · Runescript Blaze** · mag · allEnemies · *write fire across the line — heavy Spreading Burn that keeps jumping foe-to-foe for several turns* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Whitefurnace** · mag · allEnemies · *flood the front with furnace-glare: deep Blind on every foe for several turns as the close-range fire builds* · cost **high SOL** · cd **long** · `proposed`
- **C · Furnace Cadence** · buff · self · *settle into a relentless forge tempo for several turns: every strike Hastes the next cast and every cast refunds attack-bar for the next strike — the loop drives itself faster the longer it runs* · cost **high SOL** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Forge-Bound Detonation** · mag · enemy · *plunge the target into max Overheat and Burn with a final imbued cut, then a glyph-burst that Detonates all of it at once for a burst Spreading down the line* · cost **high SOL** · cd **long** · `proposed`
- **C · Forgeheart Surge** · buff · self · *for several turns the forge runs white-hot: every strike grants Haste and a chance at an extra action, and every cast re-imbues the blade hotter (the loop at full tempo)* · cost **high SOL** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · Blade of the Furnace** *(Forgeblade)* · enemy · *forge one perfect white-hot cut — a colossal imbued strike that pours the blade's entire stored heat into a single target and spends all its Overheat and Burn at once, scaling with missing HP* · `proposed`
- **B · Glyph of the Risen Sun** *(Solar Casting)* · allEnemies · *cast the sun itself at melee range — lay max Burn on every foe and chain-Detonate it across the line, each blast Spreading onward and Blinding the survivors* · `proposed`
- **C · The Eternal Forge** *(Starforge)* · self → allEnemies · *become the forge for the turn — an unbroken strike↔cast cascade: every imbued cut Ignites and every burst Detonates with no cooldown between them, each beat Hasting you further and re-tempering the blade hotter* · `proposed`
- **Starforge Ascendant** *(neutral/fusion)* · allEnemies · *the blade and the spell become one star: imbue the whole line with Burn at sword's reach, Blind it, then a fused strike-and-cast that Ignites, Detonates, and Spreads radiant fire across every foe at once — and stand at the front, the forge still roaring* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Forgehand** · *your imbued strikes build Overheat faster* · `proposed`
- **B · Glyphwright** · *your spell-bursts apply deeper Burn and Spread to more foes when they Detonate* · `proposed`
- **C · Tempered Rhythm** · *after a strike, your next cast costs less; after a cast, your next strike is Hastened (the loop pays itself)* · `proposed`

**Set @ MNA 60**
- **A · Whitehot Edge** · *your imbued cuts deal more to Overheated foes* · `proposed`
- **B · Detonation Bloom** · *your Detonations hit harder and reach more neighbors* · `proposed`
- **C · Runekeeper** · *your blade holds its stored heat longer — Overheat and your imbue charge don't bleed away between turns even though SOL runs hot* · `proposed`

**Set @ MNA 90**
- **A · Star-Smith** · *your finisher strikes deal more to low-HP and fully-Overheated foes* · `proposed`
- **B · Conflagrant Glyphs** · *your Burns stack higher and don't expire while you keep casting fire onto the line* · `proposed`
- **C · The Forge Unending** · *while the strike↔cast loop is active, each Detonation refunds part of your attack-bar (the forge feeds its own tempo)* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Spellblades.** Starforge Knight is the **doubled-AGI
  radiant battle-mage**: imbued cuts that forge **Overheat/Burn**, melee-range spell-bursts that
  **Detonate** it and Spread fire down the line, and the **strike↔cast forge loop** with Haste tempo.
  Distinct from the NOX **Lattice Executioner** (freeze-by-spell, Shatter-by-blade — a frost-arcane
  executioner), the ANIMA **Biomancer** (blade-borne **Infestation** + self-mutation, **non-healer**),
  the QUANTA **Quantum Exarch** (strike-observe / spell-collapse — Superposition→Collapse, Doom), and
  the UMBRAXIS **Voidstar Exarch** (**Drain**-blade + gravity-collapse cast, durable DEF). Only the
  Starforge Knight's loop is **fire forged in and detonated out** — the SOL signature delivered through
  the imbue→release rhythm — and only it fights as the **pure-offense doubled-AGI flagship** with no
  defensive line.
- **Same-attunement — vs the SOL Staff (Heliomancer, the back-line artillery).** The split is the
  row and the delivery. Heliomancer is a **back-line glass cannon** (AGI+VIT) that **emits** SOL as
  artillery from *safety*, raining Burn/Blind across the field from afar. Starforge Knight carries the
  same fire to the **front line** and melts the row at **sword's reach** — `mag` + `armor`, melee-laid
  Burn that the spell Detonates, not stand-off nukes. Same SOL suite, opposite range: *the safe nuker
  vs the front-line forge.*
- **Same-attunement — vs the two other SOL AGI+AGI classes (Sunblade + Gunslinger Solaris).** They
  share **only** the doubled-AGI stat line and the SOL signature. **Sunblade** (Dual Swords) is the
  melee **crit-parry duelist** — it plants its feet, *parries* with a blade of light, and wins a
  single-target *exchange* by crit. **Gunslinger Solaris** (Dual Pistols) is the ranged **crit-gunner**
  — a kiting back-row *hail* of crit rounds that walks Burn across the line. Both win by **crit /
  precision**. The Starforge Knight is the **battle-MAGE**: it **imbues and casts**, scaling on `mag`
  with spell-bursts; its win condition is the **strike↔cast forge loop** (stoke by blade → Detonate by
  spell), *not* a crit-parry and *not* a volley. No parry, no kite, no crit-hail — a forge. (And it
  borrows none of their ability names; see invariant #8.)
- **Same-attunement (#10) — SOL concept budget.** It reuses the SOL *signature* (Burn) and the full SOL
  suite (Blind / Scorched / Overheat → Ignite → Detonate / Haste / Spread) freely, as the framework
  intends — but it does **not** pile onto a saturated SOL role. The **back-line artillery/nuker** is
  owned by Heliomancer (Staff); the **single-target crit duel** by Sunblade (Dual Swords); the **ranged
  crit-hail** by Gunslinger Solaris (Dual Pistols); the **blink-execute assassin** by Eclipsedancer
  (Dual Daggers); the **slam→detonation point-breaker** by Solar Arbiter (Hammer); the **fast melee
  line-cleaver** by Starbreaker (Two-Handed Sword); the **block off-tank** by Dawnwarden (Sword &
  Shield); the **single charged beam** by Photon Vanguard (Rifle). The Starforge Knight's seat — *the
  front-line battle-mage whose imbued blade forges Burn and whose spell Detonates it, looped by the
  strike↔cast forge rhythm* — is held by no other SOL class. (SOL is by ratified policy **pure offense,
  no defensive line** — honored: the Knight's front-line answer is `armor` + Haste + melting the foe,
  never a Block, ward, or parry.)

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary AGI ← Spellblade · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL (runs hot) | ✓ |
| Provenance on every entry (fantasy/seat/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Spellblade siblings *and* from Heliomancer + Sunblade + Gunslinger Solaris | ✓ |
| Same-attunement concept budget (#10) — reuses SOL signature only; no saturated-role pile-on; SOL no-defense policy honored | ✓ |
