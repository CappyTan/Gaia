# Lattice Executioner — NOX × Spellblade

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The seat (the **frost-arcane
> executioner** — freeze with crystalline lattice-magic, then execute with the imbued blade; fights
> at the FRONT), the three lanes (A · Rimeblade / B · Lattice Casting / C · Execution), and the
> Runeblade DNA are **`from-brief`** — the locked NOX row of the
> [Spellblade family note](./spellblade-family.md); the kit's individual abilities are `proposed`.
> Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (Stasis · Chill → Frozen → Brittle → Shatter · time-lock · stillness /
> lattice ward · the "banks" economy) is drawn from the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md) (NOX suite). **Stasis** is the design
> name for NOX's signature DoT — cold cessation, vitality winding toward absolute zero, *not* rot
> (engine keyword `decay`). If that framework shifts, reconcile this kit toward it. Lexicon leans
> **lattice / rune / imbue / crystal / executioner** to stay clear of the frost-heavy NOX siblings.

## Identity (derived + DNA)

- **Class:** Lattice Executioner · **Attunement × Archetype:** NOX × Spellblade *(`from-brief`)*
- **Primary stat:** STR (← NOX) · **Secondary stat:** AGI (← Spellblade) — a STR/AGI **front-line
  melee-caster** who freezes by spell and executes by blade
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT — cold cessation) · NOX suite it wields **at melee range,
  through the rune-imbued blade and the spell:** **Chill** (slows), **Frozen** (can't act — encased in
  crystalline lattice), **Brittle** (bonus burst taken), **Shatter** (Frozen/Brittle → STR burst,
  delivered by the *blade* — its defining payoff), **time-lock** (freeze a debuff's duration so the
  freeze holds while it lines up the killing strike), **stillness / lattice ward** (a front-line caster's
  self-preservation — *not* a tank's wall). The **banks** economy. The Lattice Executioner owns NOX's
  **spell-freeze → blade-Shatter fusion** facet.

**Fantasy.** *(`from-brief`)* The Lattice Executioner is the **frost-arcane executioner** — the only
NOX caster that walks into melee. One hand casts a crystalline lattice that **freezes** the target into
glass; the other drives a **rune-imbued blade** that **Shatters** it. He does not hide in the back like
the Staff and he does not parry like the duelist — he *condemns* and *carries out the sentence*. SOL
pours heat into a blade and detonates; the Lattice Executioner pours **order** into his — every strike
carries Chill and Stasis, every spell sets the crystalline lattice, and the rhythm is fixed: **strike to
generate, cast to spend, then break the frozen on the imbued edge.** His casting is offensive
*condemnation* — encase a foe in a lattice of cold, make it Brittle, time-lock the freeze so it holds —
and his blade is the *execution* — a rune-charged Shatter strike that detonates the crystal. While he
fights forward he keeps a thin lattice ward between himself and harm, just enough to survive the front
row a caster has no business standing in. Where the NOX **Staff (Null Absolutionist)** stands at the
back and *silences and dispels* the enemy mage — an anti-caster who takes energy out of the system — the
Lattice Executioner stands in *front* and **kills what he freezes**: he doesn't unmake your spell, he
freezes you and breaks you on the blade. Condemn by lattice, execute by edge.

### The shared Runeblade DNA *(`from-brief` — how this is a Spellblade)*

1. **Imbue — channel NOX *through* the blade.** Strikes carry the signature into melee: each cut lays
   **Stasis / Chill** and the rune-charge on the edge can be released. The blade is the delivery system
   for the cold, and — uniquely among NOX — the delivery system for the **Shatter**.
2. **Strike↔Cast rhythm — the literal generate→spend loop.** Melee strikes (specials) **generate** NOX;
   spells and rune-strikes (signatures) **spend** it. The Lattice Executioner is the most literal
   expression of the MNA economy: cut to charge, cast to condemn, strike to execute.
3. **Front-line caster.** He casts the freeze at melee range and *survives there* (AGI + a lattice ward),
   unlike the back-line Staff. The spell-warrior who doesn't hide — the melee counterpart to the
   Null Absolutionist's back-line negation.
4. **Reuse NOX's own phase chain via the imbued blade.** No new combo resource: the Opening **is**
   **Chill → Frozen → Brittle**, set by spell *and* deepened by imbued strikes; the finisher is a
   rune-charged **blade-Shatter** that breaks the frozen glass. The freeze is cast; the Shatter is *cut*.

### Lanes *(`from-brief` — the locked frame's three)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Rimeblade** *(lead)* | **Imbued melee** — heavy rune-charged STR strikes that apply **Stasis / Chill** and **Shatter** the Frozen on the blade's edge. The execution half; the showcase blade-Shatter | **STR/AGI**, imbued strikes, Shatter on Frozen/Brittle | front-line single-target burst / executioner | vs a foe you (or a caster) can freeze; STR-stacked gear; you want the frozen thing broken now |
| **B · Lattice Casting** | **Frost spells** — cast the crystalline lattice: **Frozen**, **Brittle**, and a self/party **lattice ward** that lets a caster hold the front. The condemnation half (set the kill) | **AGI**, spell freeze/Brittle application, ward | applicator / front-line caster / self-preservation | vs a single hard target you can take a beat to encase; a fragile front you need to ward |
| **C · Execution** | **Fusion** — the strike↔cast loop: freeze by spell, **time-lock** the freeze, then Shatter by blade; banks NOX for the casts. The signature seat | strike↔cast tempo, time-lock, NOX economy | combo-engine / enabler / battery | NOX-stacked party (feeds the pool); when you want the whole freeze→Shatter loop running smoothly |

**Build axes:** blade-Shatter burst ↔ spell-freeze setup (A↔B) · spell-freeze setup ↔ fusion-loop/battery
(B↔C) · own-target execution ↔ tempo/economy enabling (A,B ↔ C).

**Cross-lane synergy:** **B casts the lattice and Brittles the target → C time-locks the freeze so it
holds and banks the NOX that fuels the next cast → A drives the rune-imbued blade through the frozen
glass and Shatters it.** Strike charges the pool; cast condemns; blade executes.

---

## Auto-attack *(unlaned)*

- **Runecut** · phys · enemy · *a single rune-imbued cut; the cold etched on the edge leaves a wisp of Chill on the target* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Etched Strike** · phys · enemy · *a rune-charged cut that lays light Stasis; bonus damage vs a Chilled foe* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Glyphfrost** · mag · enemy · *cast a small lattice-glyph that Chills the target and seeds a touch of Stasis* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Latticecast** · mag · enemy · *trace a crystalline lattice over the foe: deepen its Chill toward Frozen* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Charge the Edge** · buff · self · *channel banked NOX into the blade: your next imbued strike Shatters harder, and you bank a surge of NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Runebreak** · phys · enemy · *a precise imbued strike; if the target is Chilled it becomes Brittle (priming the Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Conduit Glyph** · buff · self · *the party's next NOX ability costs less; bank a surge of NOX (the casting battery)* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Imbued Carve** · phys · enemy · *two rune-charged cuts that compound Chill and a wisp of Stasis, readying the freeze* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Glaciary Bolt** · mag · enemy · *a bolt of lattice-cold; consumes a Chilled target's Chill to Freeze it for a beat* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Wardglyph** · buff · self · *cast a thin lattice ward on yourself (brief damage reduction) so you can hold the front while you cast* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Lattice Tap** · util · enemy · *time-lock the target's current Chill/Stasis so it stops ticking down — hold the freeze window open for the blade* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Shatterstrike** · phys · enemy · *a clean rune-imbued cut; if the target is Frozen it Shatters for bonus and leaves lesser Chill* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Runebank** · buff · self · *store a large NOX reserve for the party (battery) and load a rune-charge on the blade* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Frostfang Lunge** · phys · enemy · *a stepping imbued lunge; bonus damage scaling with the target's current Stasis stacks* · gen **major NOX** · cd **medium** · `proposed`
- **B · Crystalcast** · mag · enemy · *cast a crystallizing lattice; if the target is Chilled it becomes Brittle, otherwise it is Chilled* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Lattice Bulwark** · buff · allAllies · *cast a thin lattice ward across the party (brief damage reduction)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Verdict Glyph** · util · enemy · *seal the condemnation: time-lock the target's Frozen/Brittle state so it holds, and bank NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Glasscarve Imbue** · phys · enemy · *a heavy rune-charged cut; deepens Chill and makes a Chilled target Brittle (priming a big Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Rune Reservoir** · buff · allAllies · *the party's next NOX ability is discounted; a NOX surge banks into the shared pool* · gen **major NOX** *(battery)* · cd **long** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Executioner's Cut** · phys · enemy · *a decisive rune-imbued strike; massive bonus vs a Frozen/Brittle target (the blade-Shatter showcase)* · gen **major NOX** · cd **medium** · `proposed`
- **B · Latticestorm** · mag · allEnemies · *cast a spreading lattice over the line: Chill every foe and crystallize the chilled toward Frozen* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Condemned Edge** · phys · enemy · *a deep rune-imbued cut; consumes a Chilled target's Chill to Freeze it, then Shatters the frozen glass* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frostlattice** · mag · enemy · *cast a hard crystalline lattice: heavy Chill and Stasis on one target, crystallizing it toward Frozen* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Wardlattice** · buff · self · *raise a lattice ward (heavy self damage reduction) for several turns so a caster can stand the front* · cost **med NOX** · cd **medium** · `proposed`
- **C · Bind the Lattice** · util · enemy · *Freeze a Chilled foe and time-lock the freeze so it holds while you line up the killing strike* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Glassbreak Verdict** · phys · enemy · *a multi-cut rune flurry on one target; every cut against a Frozen/Brittle foe Shatters it for bonus* · cost **med NOX** · cd **medium** · `proposed`
- **C · Lattice Tithe** · buff · allAllies · *increase party NOX generation for several turns (the casting battery)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Sentence of Rime** · phys · enemy · *Freeze a Chilled target with a rune-strike, then a guaranteed Shatter cut that detonates the frozen glass* · cost **med NOX** · cd **medium** · `proposed`
- **B · Crystalline Cage** · mag · enemy · *cast an encasing lattice: a long Freeze that holds the target solid, and it is left Brittle* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Frostward Lattice** · buff · allAllies · *a lattice ward over the party (damage reduction) for several turns; the front-line caster's team-preservation* · cost **high NOX** · cd **medium** · `proposed`
- **C · The Frozen Sentence** · util · allEnemies · *cast a crystalline lattice across the front: Freeze one or more foes (can't act); they Shatter for bonus if struck* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Glasswright Verdict** · phys · enemy · *a colossal rune-imbued strike; if it lands on a Frozen/Brittle foe the Shatter detonates for bonus scaling with how deep the freeze ran* · cost **med NOX** · cd **medium** · `proposed`
- **C · Banked Lattice** · buff · allAllies · *refund a chunk of the party's banked NOX pool and lay a thin lattice ward on each ally (battery + preservation)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Carve Cadence** · phys · enemy · *a chain of rune-imbued cuts; each cut that Shatters a Frozen/Brittle foe extends the chain* · cost **high NOX** · cd **medium** · `proposed`
- **B · Imbued Latticestorm** · mag · allEnemies · *cast a deepening lattice over the line: spread heavy Stasis and Brittle every Chilled foe (the team Shatter setup)* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Aegis Lattice** · buff · allAllies · *a heavy lattice ward over the party (damage reduction); preserve allies' current buff timers (time-lock them)* · cost **high NOX** · cd **long** · `proposed`
- **C · Held Condemnation** · util · allEnemies · *clamp the field: Brittle all foes and time-lock their Frozen/Brittle state so the team's Shatter window stays open* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Final Lattice** · phys · enemy · *plunge the target into a deep Frozen/Brittle state by spell, then a guaranteed rune-imbued Shatter cut that breaks it for a burst* · cost **high NOX** · cd **long** · `proposed`
- **C · The Lattice Verdict** · buff · allAllies · *a stillness ward over the party (damage reduction) + a burst of banked party NOX + time-lock allies' current buff timers* · cost **med NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Glassfall Sentence** *(Rimeblade)* · enemy · *condemn the target to absolute zero — a cast that guarantees Freeze + max Brittle, then a single colossal rune-imbued blade-Shatter that breaks the frozen glass for massive burst (execution by edge)* · `proposed`
- **B · The Crystal Bastion** *(Lattice Casting)* · allAllies · *cast an unbreakable crystalline lattice over the party — near-total damage reduction for several turns and immunity to being moved or stunned, so the line holds while you condemn the field* · `proposed`
- **C · Sentence Absolute** *(Execution)* · all · *the loop made whole — Freeze and Brittle every foe and time-lock their actions, raise a stillness ward and a NOX surge over the party, then a sweeping rune-Shatter that breaks every frozen foe (cast-freeze, blade-execute, the whole field at once)* · `proposed`
- **Executioner's Lattice** *(neutral/fusion)* · allEnemies · *condemn and carry out at once — cast a crystalline lattice that Freezes every foe, then a rune-imbued chain of cuts that Shatters across the whole frozen line* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Edgekeeper** · *your imbued strikes carry a deeper rune-charge: bonus Shatter damage against Frozen/Brittle foes* · `proposed`
- **B · Latticeweaver** · *your frost spells crystallize the target toward Frozen faster and your wards last longer* · `proposed`
- **C · Rune Tithe** · *your specials generate extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Glassedge Doctrine** · *your blade-Shatter damage rises against Frozen/Brittle foes* · `proposed`
- **B · Wardkeeper's Lattice** · *while your lattice ward holds, your damage reduction is stronger and a struck attacker is Chilled* · `proposed`
- **C · Strike-and-Cast Cadence** · *after an imbued strike your next spell costs less; after a spell your next strike Shatters harder (the loop reinforced)* · `proposed`

**Set @ MNA 90**
- **A · Executioner's Refund** · *when one of your blade-Shatters breaks a Frozen/Brittle target, refund part of your attack-bar* · `proposed`
- **B · Crystalline Discipline** · *while at max lattice ward you cannot be stunned or moved, and your casts crystallize a foe one step further* · `proposed`
- **C · Conduit Lattice** · *while your stillness/lattice ward holds, the party's time-locked durations don't tick down* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Spellblades.** The Lattice Executioner is the **frost-arcane
  executioner**: cast a crystalline lattice to **Freeze**, then **Shatter** with a rune-imbued blade — a
  fusion of spell-freeze and blade-break. Distinct from the SOL **Starforge Knight** (radiant battle-mage
  — *forge Burn into the blade and Detonate it*, AGI+AGI pure offense), the ANIMA **Biomancer** (mutation
  battle-mage — blade-borne *contagion* + self-evolution, **non-healer**), the QUANTA **Quantum Exarch**
  (probability battle-mage — *observe with the strike, collapse with the spell*), and the UMBRAXIS
  **Voidstar Exarch** (gravity battle-mage — *drain-blade + collapse-cast*, durable DEF). His imbue is
  **cold**, his cast is the **freezing lattice**, and his payoff is the **blade-delivered Shatter** of a
  frozen foe — held by no other Spellblade.
- **Same-archetype — vs his back-line cousin the Null Absolutionist (NOX × Staff), the priority watch.**
  They share only the NOX **signature** (Stasis, Chill → Frozen → Brittle → Shatter) and the attunement.
  Everything else is opposite. The **Null Absolutionist is a back-line anti-caster** — it *removes energy
  from the system*: Seal/silence, dispel, drain MP and tempo, unmake buffs and summons; it doesn't kill
  what it freezes, it makes the enemy *unable to act*, from safety, at range. The **Lattice Executioner
  fights at the FRONT and kills what it freezes** — it freezes by spell and **executes by blade-Shatter**;
  it has **no Seal, no dispel, no energy-drain, no anti-magic** lane, and its casting is *offensive
  condemnation* (freeze → Brittle → Shatter), not negation. Back-line silence/dispel anti-mage (the
  Absolutionist) vs front-line spell-freeze + blade-Shatter executioner (this class).
- **Same-attunement (#10) — NOX concept budget.** He reuses the NOX *signature* freely (Stasis / Chill →
  Frozen → Brittle → Shatter), but as a **front-line spell-freeze → blade-Shatter fusion**, which no other
  NOX class does. He does **not** pile onto a saturated NOX role: the **anti-caster energy-removal / Seal**
  belongs to the Staff (Null Absolutionist), the **crit-shatter + frost-parry + NOX-battery** duelist to
  the Dual Swords (Rimewalker), the **action-economy / time-skip flood-execute** to the dagger (Velestra),
  the **single-target control-crush** to the Hammer (Equilibrium Ascendant), the **AoE line-freeze +
  cataclysmic sweep** to the Two-Handed Sword (Worldender), the **single-shot freezing kill-shot** to the
  Rifle (Terminus), and the **mitigation-wall shadow-tank** to the Sword & Shield (Penumbral Bastion). He
  takes **no Seal, no dispel/energy-drain, no parry, no melee cleave, no time-skip / attack-bar-denial,
  no ward-*wall* tank** — his lattice ward is a *front-line caster's self-preservation*, not a tank's
  bulwark, and his only AoE is the team-Shatter setup, not a sweep. His seat — *cast the freezing lattice
  at melee range, then Shatter the frozen on the rune-imbued blade* — is held by no other NOX class.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary AGI ← Spellblade · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (seat / lanes / DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8 — grepped) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Spellblade siblings *and* vs Null Absolutionist | ✓ |
| Same-attunement concept budget (#10) — front-line freeze→Shatter fusion only; no saturated-role pile-on | ✓ |
