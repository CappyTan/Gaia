# Biomancer — ANIMA × Spellblade

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Greenfield design spec authored by the
> `build-class` skill against the [Class System Model](./README.md). The **row, seat, three lanes,
> and Runeblade framing are `from-brief`** — the LOCKED frame in the
> [Spellblade family note](./spellblade-family.md) (the Runeblade: *how do you fuse blade and
> spell?* — the front-line caster); the kit's individual **abilities are `proposed`**, pending a
> content review. Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (**Infestation** / **Evolution** [Seed→Bloom→Overgrowth] / **Adaptation** / **Bloom** /
> **Metabolize** / **Regen**, plus the Runeblade DNA: Imbue / Strike↔Cast rhythm / front-line
> casting) draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md)
> (ANIMA suite).
>
> **⚠️ NOT A PARTY-HEALER (ratified ledger #16) — DESPITE THE NAME.** ANIMA party-healing is
> reserved for the **Staff** (Genesis Sage, the dedicated healer) and the **Hammer** (Lifekeeper,
> the *one* secondary). The Biomancer's "biomancy" is **life-as-a-WEAPON** — blade-borne contagion,
> self-mutation, and evolving offensive spells — **not medicine.** Self-sustain is allowed (VIT
> bulk, **Adaptation** grown from the parry, the self-only **Regen** mirror of its DoT, and
> Metabolizing what it kills) — but there are **no `ally`/`allAllies` heals, no shared Regen, and no
> party HoT** anywhere in this kit.

## Identity (derived + DNA)

- **Class:** Biomancer · **Attunement × Archetype:** ANIMA × Spellblade
- **Primary stat:** VIT (← ANIMA) · **Secondary stat:** AGI (← Spellblade) — a **VIT/AGI front-row
  battle-mage**: the durable mutation-caster who infects with the blade, evolves the strain with the
  spell, and out-mutates whatever it fights
- **Resource:** ANIMA (party-shared; **compounds** — grows the more you hold)
- **Attunement signature:** **Infestation** (a *living contagion* DoT that multiplies/stacks and
  **spreads on the host's death**; engine keyword `poison`) · ANIMA suite of **Evolution**
  (Seed→Bloom→Overgrowth), **Adaptation** (grow resistance to a damage type after it hits you),
  **Bloom**, **Metabolize** (devour a corpse/debuff to grow), and the **self-only Regen** mirror

**Fantasy.** *(seat from-brief)* The Biomancer is the **mutation battle-mage** — a warden who carries
the plague *into* the fight. Its Runeblade is alive: every strike injects a living contagion that
breeds in the wound, and every spell *evolves* that strain into something worse. Where the back-line
Genesis Sage **makes** life and pours it into the wounded, the Biomancer **weaponizes** life — blade
and spell are two ends of one organism, and the loop is contagion: the blade seeds, the cast mutates,
the next strike deepens what the cast grew. It survives the front row not with armor but by
**becoming the wrong thing to wound** — its own body mutates and adapts mid-fight, hardening against
what struck it last, drinking vitality back from the strains it spreads. It is the most literal
expression of the Spellblade's generate→spend economy: **melee strikes feed ANIMA, spells spend it to
mutate** — and because ANIMA *compounds*, the longer the duel runs the faster the warden grows and the
deeper the rot in the enemy. *It is **explicitly not a medic** — despite the name. The ANIMA Staff
(Genesis Sage) heals the party; the ANIMA Hammer (Lifekeeper) is the one secondary; the Biomancer
keeps only **itself** standing and tends the **enemy's** flesh toward death. Its only sustain is its
own.*

### The shared Runeblade DNA *(from-brief — how this is a Spellblade)*

1. **Imbue.** Channel ANIMA into the blade: strikes carry **Infestation** in melee, and the charge
   built by striking can be released as an evolving spell-burst. The warden *is* its contagion, blade
   in hand.
2. **Strike↔Cast rhythm.** Melee strikes **generate** ANIMA; spells **spend** it. The Biomancer is the
   most literal generate→spend loop in the game — the blade seeds the strain, the spell mutates it.
3. **Front-line caster.** It casts at melee range and survives there (VIT bulk + Adaptation), *unlike*
   the back-line Staff. The spell-warrior who infects from inside the fray, not from cover.
4. **Reuse ANIMA's own phase chain via the imbued blade** (no new resource): the Opening **is**
   **Seed → Bloom** (the blade injects the strain, the spell matures it); the Finisher is the
   **Overgrowth** — a mutated host's wound erupts, reseeding the contagion onward and feeding the
   warden.

### Lanes *(from-brief — LOCKED frame)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Thornblade** *(imbued melee)* | **Infestation strikes + Bloom** — imbue the blade and *seed* the living contagion in melee; sustained cuts deepen and **Bloom** the strain. The blade half of the loop | **AGI**, Infestation stacks, melee crit, Bloom | front-row melee DoT-applier / ANIMA generator | up close vs single targets and bosses; AGI/crit gear; you want to feed the cast loop fast |
| **B · Biomancy** *(offensive life-spells)* | **Contagion-burst spells + Evolution + self-Adaptation** — spend ANIMA to evolve the strain, detonate stacked contagion, and mutate your own body's resistances. Life cast *as a weapon*, never as a heal | **VIT**/AGI, Evolution, Infestation, resistance-growth | front-line spell-caster / burst & ramp | a fight that rewards a ramp; spell-power/VIT gear; vs tanky HP pools to grow the strain into |
| **C · Mutation** *(the fusion seat)* | **Strike injects, spell evolves** — the imbue-and-release loop: strikes load the strain and charge, spells spend the charge to mutate, and the warden self-mutates to outlast the front row. **Self-sustain only** | **VIT**/AGI, the strike↔cast loop, self-Regen, self-shields | self-sustaining front-line battle-mage / anchor | long melee-range duels; no dedicated healer to *replace* — it just refuses to die; the rhythm build |

**Build axes:** imbued-melee application ↔ offensive spellcasting (A↔B) · weaponized casting ↔
self-mutating fusion-sustain (B↔C) · feed-the-blade ↔ feed-the-spell ↔ feed-the-self (A↔B↔C).
**All three lanes lean on Evolution** — the strain on the blade, the spell's mutation, and the
warden's own phenotype each grow over time, so the Biomancer is steady early and overwhelming late.
*Self-sustain (lane C) tops out at keeping the warden alive; it never becomes a party-heal — that is
the Staff's and Hammer's lane by ratified ledger #16.*

**Cross-lane synergy:** **A imbues the blade and seeds Infestation in melee, charging the loop → B
spends that charge to Evolve the strain into a stronger form and detonate the stacks → C closes the
loop, converting the carnage into self-mutation: Adapt to what struck you, Metabolize the kill, and
keep the rhythm running so the warden never falls.**

---

## Auto-attack *(unlaned)*

- **Runefang** · phys · enemy · *a single imbued cut from the living blade; nicks the foe and slips a wisp of Infestation into the wound* · gen **minor ANIMA** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Seeding Cut** · phys · enemy · *an imbued strike that injects a stack of Infestation and plants a Seed (the Opening)* · gen **moderate ANIMA** · cd **short** · `proposed`
- **B · Blightbolt** · mag · enemy · *a close-range contagion bolt; deals damage and seeds Infestation at the spell's reach* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Mutagen Cast** · mag · enemy · *spend a beat of charge to Evolve the target's strain a stage — it stacks higher and ticks harder (Bloom)* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Symbiont Imbue** · buff · self · *channel the strain into your own flesh: brief self-Regen and steadier footing while your strikes keep flowing* · gen **moderate ANIMA** · cd **short** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Festering Edge** · phys · enemy · *two imbued cuts that extend and deepen the target's existing Infestation* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Grafting Stance** · buff · self · *after the cut, graft the last damage type you took into a grown resistance (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Thornveil** · buff · self · *imbue your guard: the next hit you parry answers with an Infesting riposte, and you shrug off a little of what you parried* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Spore Nova** · mag · allEnemies · *release the charge as a close-range burst; seeds a stack of Infestation on every foe in reach* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Virulent Cast** · mag · enemy · *a spell that strikes for bonus damage scaling with the target's current Infestation stacks* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Chrysalis Guard** · buff · self · *Metabolize a debuff off yourself to heal a little and grow a lasting resistance (self only)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Plaguecut Flurry** · phys · enemy · *a twin-blade flurry of imbued cuts; each clean hit deepens the Infestation already in the wound* · gen **moderate ANIMA** · cd **short** · `proposed`
- **C · Crucible Imbue** · buff · self · *harden the body mid-fight: damage reduction + self-Regen while the strain runs in your veins* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Phenotype Edge** · buff · self · *Evolve your bladework: your imbued strikes change to a stronger, deeper-seeding form for several turns* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **B · Reseeding Burst** · mag · enemy · *a contagion spell-burst; if the target dies soon after, its Infestation erupts onto a nearby foe* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Mutant Bloom** · mag · enemy · *Evolve the target's Infestation a stage and refresh it (Overgrowth seed)* · gen **major ANIMA** · cd **medium** · `proposed`
- **C · Acclimating Hide** · buff · self · *after taking a damage type, sharply grow resistance to it; gain brief self-Regen (Adaptation)* · gen **moderate ANIMA** · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Saturated Strike** · phys · enemy · *a heavy imbued cut whose Infestation can no longer be cleansed off the target this fight* · gen **moderate ANIMA** · cd **medium** · `proposed`
- **C · Apex Phenotype Form** · buff · self · *push your phenotype to its peak: large lasting bulk, heavy resistance, and self-Regen for several turns (self only)* · gen **major ANIMA** · cd **medium** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Plaguefang Verdict** · phys · enemy · *two heavy imbued cuts that apply max-duration, fully-Bloomed Infestation* · gen **major ANIMA** · cd **medium** · `proposed`
- **B · Overgrowth Cast** · mag · enemy · *an apex spell-burst that Evolves the target's strain to its peak form and detonates a share of it now* · gen **major ANIMA** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Contagion Blade** · phys · enemy · *a deep imbued thrust that floods one target with Infestation stacks at once* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Foreign Strain** · mag · enemy · *cast a self-multiplying contagion into the target — a strain that keeps breeding in the wound* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Evolve the Wound** · mag · enemy · *spend charge to Evolve the target's Infestation a full stage; it now spreads on its death* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Crucible Phenotype** · buff · self · *shift into a survival phenotype: lasting self-Regen + damage reduction, growing as it holds (self only)* · cost **low ANIMA** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Bladestorm Strain** · phys · enemy · *a flurry of imbued cuts that seeds and Blooms Infestation with every connecting blow* · cost **med ANIMA** · cd **long** · `proposed`
- **C · Adapting Genome** · buff · self · *Adaptation surge: grow resistance to every damage type you've taken so far this fight (self only)* · cost **low ANIMA** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Reaving Imbue** · phys · enemy · *an imbued strike scaling with the target's current Infestation stacks; refreshes them and feeds the charge* · cost **med ANIMA** · cd **medium** · `proposed`
- **B · Antibody Cast** · mag · enemy · *a contagion spell that grafts an Adaptation onto you for the type that last struck you, then evolves the strain it casts* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Bloomrot Detonation** · mag · enemy · *bloom the target's stacked Infestation into a burst; lesser Infestation reseeds in the wound afterward (Overgrowth)* · cost **high ANIMA** · cd **medium** · `proposed`
- **C · Settled Phenotype** · buff · self · *lock in your grown resistances and self-Regen so they no longer decay for the rest of the fight (self only)* · cost **high ANIMA** · cd **medium** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Strainreaver** · phys · enemy · *an imbued finisher that consumes the target's Evolution stacks for escalating burst, reseeding lesser contagion* · cost **med ANIMA** · cd **medium** · `proposed`
- **C · Sovereign Genome** · buff · self · *Metabolize: devour a debuff on yourself to heal and convert it into a growing resistance (self only)* · cost **med ANIMA** · cd **medium** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Living Bladework** · buff · self · *for the duration, every imbued strike Evolves the target's strain a stage and your cuts carry max-Bloom Infestation* · cost **high ANIMA** · cd **long** · `proposed`
- **B · Strainspread Cast** · mag · allEnemies · *the target's Infestation leaps to every foe and Evolves a stage — it ticks harder and spreads on each death* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Mutation Verdict** · mag · enemy · *a spell that detonates the target's fully-Evolved Infestation, reseeding it onto the field* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Phenotype Bastion** · buff · self · *enter your apex survival form: large self-Regen + heavy damage reduction that grows each turn it holds (self only)* · cost **high ANIMA** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Runeblight Verdict** · phys · enemy · *the warden's apex exchange: a chain of imbued cuts that Evolves the strain with each connecting blow and detonates it on the last* · cost **high ANIMA** · cd **long** · `proposed`
- **C · Living Phenotype** · buff · self · *become near-unkillable for a few turns: cap incoming damage, deep self-Regen, immune to the damage types you've Adapted to (self only)* · cost **high ANIMA** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high ANIMA**, cd **long**)*

- **A · The Living Blade** *(Thornblade)* · enemy · *the Runeblade fully awakens — for the duration every imbued strike applies max-duration, fully-Evolved Infestation, deepens with each cut, and detonates the bloomed strain in a burst that reseeds onto the field* · `proposed`
- **B · Genesis Plague** *(Biomancy)* · allEnemies · *cast the masterwork contagion — seed every foe with max-duration, fully-Evolved Infestation that mutates faster than they can cleanse, and each death spreads and reseeds the strain across the line* · `proposed`
- **C · The Final Mutation** *(Mutation)* · self · *the strain takes over your own body — for the duration you cannot be reduced below 1 HP, regenerate each turn, grow resistance to everything that strikes you, and every strike-and-cast feeds the next: you simply out-mutate and outlast the fight (self only)* · `proposed`
- **Runebloom Cataclysm** *(neutral/fusion)* · allEnemies · *blade and spell erupt as one — one imbued sweep seeds and Blooms the contagion across the whole line, the spell detonates it across every foe at once, and you Metabolize the carnage to mutate, harden, and self-mend (self only)* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Bladeborne Strain** · *your imbued strikes' Infestation stacks higher* · `proposed`
- **B · Volatile Genome** · *your spells Evolve the target's Infestation to its next stage a step sooner* · `proposed`
- **C · Quick Mutation** · *you grow resistance to a damage type a step faster after taking it (Adaptation)* · `proposed`

**Set @ MNA 60**
- **A · Imbuebearer** · *foes Infested by your blade take increased damage from your spells* · `proposed`
- **B · Mutagenic Surge** · *your offensive spells deal more the more the target's strain has Evolved* · `proposed`
- **C · Resilient Soma** · *while you have self-Regen, you take reduced damage* · `proposed`

**Set @ MNA 90**
- **A · Endless Bloom** · *your Infestation always spreads on the host's death, even when reduced* · `proposed`
- **B · Perfected Strain** · *your strain can Evolve one stage further than its apex* · `proposed`
- **C · Lasting Phenotype** · *your grown resistances and self-Regen no longer decay while you sustain them* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Spellblades (the Runeblade family).** The Biomancer is the
  **mutation battle-mage**: an imbued blade that seeds **Infestation** in melee, offensive life-spells
  that **Evolve** the strain (Seed→Bloom→Overgrowth), and a self-mutating phenotype that adapts to
  outlast the front row. Distinct from the SOL **Starforge Knight** (forge solar fire into the blade,
  strike-to-stoke-Burn → cast-to-Detonate; pure offense, doubled-AGI), the NOX **Lattice Executioner**
  (freeze by spell → Shatter by blade; STR execute), the QUANTA **Quantum Exarch** (strike observes →
  spell collapses the superposition), and the UMBRAXIS **Voidstar Exarch** (drain-blade + gravity
  collapse-cast; DEF-durable). Only the Biomancer's loop *infests and mutates* — the blade injects a
  living strain, the spell evolves it, and the warden's own body mutates to survive.
- **Same-archetype — vs its closest ANIMA cousin, the Pulse Arbiter (Dual Swords; the imbued CASTER
  vs the steel DUELIST).** Both are ANIMA AGI-secondary front-liners on the *order-through-change*
  theme, so the split must be airtight. **The Pulse Arbiter is a pure-steel adaptation DUELIST** —
  no spells, no `mag`: it wins by crit + adaptive parry, mutating its *bladework*. The Biomancer is
  the **front-line CASTER** (`mag`, the only ANIMA melee spellcaster): its identity is the
  **Strike↔Cast fusion** — the blade *seeds* and the spell *evolves and detonates* the strain, the
  generate→spend loop the Arbiter has no part of. The Arbiter mutates its style; the Biomancer mutates
  the *contagion* with magic. Both keep only *themselves* alive (each a non-healer per ledger #16).
- **Same-attunement (#10) — ANIMA concept budget & ledger #16.** It reuses the ANIMA *signature*
  (Infestation, the Seed→Bloom→Overgrowth chain, Evolution/Adaptation/Metabolize) freely — that's the
  shared identity — but **honors ratified ledger #16 in full: it is NOT a party-healer, despite the
  name.** No `ally`/`allAllies` heal, no shared Regen, no party HoT appears anywhere in the kit; every
  sustain effect is `self`. It also does **not** pile onto a saturated ANIMA role: dedicated
  party-healing belongs to the **Staff (Genesis Sage)** + the **Hammer (Lifekeeper)**; *summoned* life
  to the **S&S (Soul-Bound Aegis)**; the *melee contagion-flood applicator* to the **daggers (Symbiote
  Hunter)**; the *steel adaptation duelist* to the **swords (Pulse Arbiter)**; the *line-cleave
  contagion + reach-control* to the **Two-Hander (Apex Dominion)**; the *spore-spray flood* to the
  **Pistols (Sporecaster)**; the *precision single-injection* to the **Rifle (Genewarden)**. The
  Biomancer's seat — **front-line imbued-blade contagion + offensive evolving life-spells + the
  strike↔cast mutation fusion, as a non-healing battle-mage** — is held by no other ANIMA class.

### NO party-healing — explicit confirmation

This kit contains **zero** party heals: scanned every entry — no `ally` or `allAllies` `heal` target,
no shared/party Regen, no party HoT. The only `self`-targeted sustain is VIT bulk, **Adaptation**
(resistance growth from the parry/overwatch), the self-only **Regen** mirror of the DoT, and
**Metabolize** (heal *yourself* off a devoured debuff or kill). Every `enemy`/`allEnemies` effect
spreads *contagion*, *evolves a strain*, or *detonates* it — never healing. The Biomancer is a
**non-healer** per ledger #16, despite the "Biomancer" name.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (specials 5…95; sigs 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary VIT ← ANIMA · secondary AGI ← Spellblade · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all ANIMA (compounds) | ✓ |
| Provenance on every entry (row/lanes/seat/Runeblade framing `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Runeblade siblings *and* from the Pulse Arbiter | ✓ |
| Same-attunement concept budget (#10) — reuses ANIMA signature only; honors ledger #16 (no saturated-role pile-on) | ✓ |
| **NOT A PARTY-HEALER (ledger #16):** no `ally`/`allAllies` heal, no shared Regen, no party HoT; all sustain is `self` | ✓ |
