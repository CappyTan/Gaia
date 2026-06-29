# Rimewalker — NOX × Dual Swords

> **Status: Frame RATIFIED (Dara, 2026-06-29); abilities proposed. Re-cut for NOX distinctness —
> supersedes the prior Rimewalker** (lanes re-cut so the NOX daggers/swords don't overlap). Greenfield
> design spec authored by the `build-class` skill against the [Class System Model](./README.md). The
> class fantasy, seat (durable STR+AGI crit-parry preservationist), the three re-cut lanes, and the
> duelist DNA are **`from-brief`** — Dara's re-cut row in the [Dual Swords family note](./dual-swords-family.md)
> and the brief; the kit's individual abilities are `proposed`. **Supersedes both the pre-framework
> Rimewalker and the first framework re-spec** (which gave Rimewalker a Stasis-attrition *grind* lane,
> attack-bar denial, and a fast execute — concepts now ceded to Velestra; see Distinctness).
> Numberless by design; magnitudes are a later balance pass. Mechanics vocabulary
> (Stasis · Chill → Frozen → Brittle → Shatter · time-lock · stillness / lattice **ward** ·
> the "banks" economy) draws on the ratified [Attunement Mechanics Framework](../attunement-mechanics.md)
> (NOX suite). **Stasis** is the design name for NOX's signature DoT — cold cessation, vitality winding
> toward absolute zero, *not* rot (engine keyword `decay`).

## Identity (derived + DNA)

- **Class:** Rimewalker · **Attunement × Archetype:** NOX × Dual Swords
- **Primary stat:** STR (← NOX) · **Secondary stat:** AGI (← Dual Swords) — a STR/AGI **crit-parry
  duelist whose crits Shatter and who survives by *defending***
- **Resource:** NOX (party-shared; **banks** — slow to spend, doesn't bleed away between turns)
- **Attunement signature:** **Stasis** (DoT, woven into cuts/parries — never a dedicated grind lane) ·
  NOX suite: **Chill**, **Frozen** (can't act), **Brittle** (bonus burst taken), **Shatter**
  (Frozen/Brittle → clean-crit burst, esp. STR/AGI precision), **time-lock** (freeze a duration so it
  stops ticking — preservation), **stillness / lattice ward** (damage reduction — preservation), the
  **banks** economy. Rimewalker owns NOX's **preservation** facet (parry · ward · battery) plus the
  **crit-shatter** payoff.

**Fantasy.** *(from-brief)* A frost **crit-parry preservationist** — a bladesman who wins the exchange
not by denying the enemy its turn but by **out-defending it, then breaking it on glass.** One blade is
always kept back as a **frost parry**: he turns a blow aside and answers in cold, riposting with a
guaranteed crit and **Chilling** the attacker. While he duels he keeps a **stillness / lattice ward**
between himself and harm, and **banks** the party's shared NOX so the casters behind him keep firing.
His patient cuts weave Stasis and Chill into the foe until it crystallizes **Frozen** and **Brittle** —
and a Rimewalker's crits land on glass: a clean **critical hit** on a Frozen/Brittle target **Shatters**
it. Where the NOX dagger (Velestra) floods Stasis, *robs the enemy of its turns*, and races to a fast
execute, the Rimewalker **stands, parries, and preserves** — and the kill is a precise crit on a frozen
foe, not a speed-execute. Durable, not denying; precise, not flooding.

### The shared duelist DNA *(from-brief — how this is a dual-sword)*

1. **Crit (AGI-keyed) is the win condition *and* the Shatter trigger.** The Rimewalker wins by landing
   clean, *critical* cuts — precision, not volume — and a crit on a Frozen/Brittle foe detonates the
   cold. The Shatter payoff is a **clean AGI crit** (precision), explicitly **not** a fast low-HP
   execute.
2. **Riposte / Parry — the *frost* parry (his signature defense).** Two blades = offense *and* defense
   in one; the off-blade is kept back to **counter** an incoming blow with cold. The counter doesn't
   just answer the hit — it **Chills** the attacker. His fragility answer is **parry + ward**
   (durable), never lockdown.
3. **Flow / stance.** Sustained, patient bladework that compounds across the *exchange* — weaving
   Stasis and Chill in along the way, never as a standalone grind.
4. **Opening → Finisher reuses NOX's own phase chain.** No new combo resource: the Opening **is**
   **Chill → Frozen → Brittle**, deepened by his cuts and parries; the finisher is a crit that
   **Shatters** the frozen glass.

### Lanes *(from-brief — the re-cut)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Glasscutter** *(lead)* | **Crit-shatter**: clean AGI crits that **Shatter** a Frozen/Brittle target — the showcase NOX payoff and his lead lane. Precision burst, *not* a speed-execute | **AGI**, Crit, Frozen/Brittle setup, Shatter | single-target precision burst | vs targets you can chill/freeze; crit-rich gear; spike a frozen priority kill |
| **B · Frostward** | **Frost parry / riposte + ward**: keep the off-blade back to parry an incoming blow and answer in cold (Chill the attacker); lattice **ward** self-mitigation. The duelist's *defense* | **AGI**/**DEF**, parry/riposte, mitigation | self-sustaining front-line duelist | vs hard-hitting attackers; you want a durable damage-dealer who doesn't need a babysitter |
| **C · Hoarwarden** | **Preservation + NOX battery**: **time-lock**, a party **stillness / lattice ward**, and **banks** the shared NOX pool — the control/economy enabler | preservation, NOX economy, mitigation | enabler / protector / battery | NOX-stacked party (feeds the pool) or a fragile party needing a ward + preserved buffs |

**Build axes:** crit-burst ↔ self-defense (A↔B) · self-defense ↔ team-preservation/battery (B↔C) ·
own-target damage ↔ team preservation/control (A,B ↔ C).

**Cross-lane synergy:** **C chills/freezes the target and time-locks the cold so it holds → A crits it
to Shatter → B keeps the Rimewalker (and the party) standing through the exchange while C banks the NOX
that fuels all of it.**

---

## Auto-attack *(unlaned)*

- **Glassglide Cut** · phys · enemy · *two flowing crystalline cuts (two crit rolls); the second leaves a wisp of Chill* · gen **minor NOX** · cd **none** *(spammable)* · `proposed`

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Glint Cut** · phys · enemy · *a crit-leaning cut; bonus crit chance vs a Chilled/Frozen target* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Verglas Riposte** · phys · enemy · *a counter-cut stance for a turn: if struck, parry and answer with a cold riposte that Chills the attacker* · gen **moderate NOX** · cd **short** · `proposed`

**@ MNA 15** *(B/C)*
- **B · Cold Riposte** · phys · enemy · *a measured counter-cut; a guaranteed crit if it lands on a Chilled foe, and it deepens the Chill* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Crystal Feint** · util · allEnemies · *a thrown cold lace: lightly Chill all foes and seed a touch of Stasis* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 25** *(A/C)*
- **A · Brittlebreak** · phys · enemy · *a precise strike; if the target is Chilled it becomes Brittle (sets up the Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Banked Frost** · buff · self · *the party's next NOX ability costs less; bank a surge of NOX* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 35** *(A/B)*
- **A · Glasswright Cut** · phys · enemy · *two patient cuts that compound Chill and a wisp of Stasis, readying the freeze* · gen **moderate NOX** · cd **short** · `proposed`
- **B · Frostward Stance** · buff · self · *a cold guard-stance: raise a brief lattice ward (damage reduction) while your specials keep flowing* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 45** *(B/C)*
- **B · Crystal Counter** · phys · enemy · *a counter-cut; a guaranteed crit if it lands on a Frozen target — a Shatter trigger on parry* · gen **major NOX** · cd **medium** · `proposed`
- **C · Crystalward Hold** · util · enemy · *time-lock the target: its current debuffs (Stasis/Chill) stop ticking down, preserving the freeze window* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 55** *(A/C)*
- **A · Shatterglint** · phys · enemy · *a clean crit-cut; if the target is Frozen it Shatters for bonus and leaves lesser Chill* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Hoarbank** · buff · self · *store a large NOX reserve for the party (battery); raise a small self ward* · gen **major NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 65** *(A/B)*
- **A · Glintstrike** · phys · enemy · *a flanking dash-cut; a guaranteed crit when striking a Chilled target* · gen **major NOX** · cd **medium** · `proposed`
- **B · Wardlace** · buff · self · *weave the off-blade into a lattice guard: dodge the next hit, then Chill the attacker on the recovery* · gen **moderate NOX** · cd **medium** · `proposed`

**@ MNA 75** *(B/C)*
- **B · Mirrorstroke** · phys · enemy · *a parry-cut that reflects a portion of the parried blow back as cold and Chills the attacker* · gen **major NOX** · cd **medium** · `proposed`
- **C · Frostward Lace** · buff · allAllies · *lay a thin lattice ward across the party (brief damage reduction); bank NOX* · gen **moderate NOX** *(battery)* · cd **medium** · `proposed`

**@ MNA 85** *(A/C)*
- **A · Permafrost Glass** · phys · enemy · *a heavy patient cut; deepens Chill and makes a Chilled target Brittle (priming a big Shatter)* · gen **moderate NOX** · cd **medium** · `proposed`
- **C · Cold Lattice Bank** · buff · allAllies · *the party's next NOX ability is discounted; a NOX surge banks into the shared pool* · gen **major NOX** *(battery)* · cd **long** · `proposed`

**@ MNA 95** *(A/B)*
- **A · Glassbright Cut** · phys · enemy · *a clean crit finisher; massively bonus vs a Frozen/Brittle target (the Shatter showcase)* · gen **major NOX** · cd **medium** · `proposed`
- **B · Frostmirror Stance** · buff · self · *a perfected parry stance for several turns: parried hits are answered with a guaranteed-crit riposte and reflect cold* · gen **major NOX** · cd **medium** · `proposed`

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Glasscut Verdict** · phys · enemy · *a deep crit-cut; consumes the target's Chill to Freeze it, then Shatters if the cut crits* · cost **med NOX** · cd **medium** · `proposed`
- **B · Frostmirror Riposte** · buff · self · *a frost-parry: dodge the next hit, then answer with a guaranteed crit and Chill the attacker* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 20** *(B/C)*
- **B · Rimeguard** · buff · self · *raise a lattice ward (heavy self damage reduction) for several turns; parried blows Chill the attacker* · cost **med NOX** · cd **medium** · `proposed`
- **C · Hush Glass** · util · allEnemies · *AoE Chill that crystallizes the line toward Frozen — sets up a team Shatter window* · cost **low NOX** · cd **medium** · `proposed`

**@ MNA 30** *(A/C)*
- **A · Glassbreaker's Verdict** · phys · enemy · *a multi-cut crit flurry on one target; every crit against a Frozen/Brittle foe Shatters for bonus* · cost **med NOX** · cd **medium** · `proposed`
- **C · Frostbank Tithe** · buff · allAllies · *increase party NOX generation for several turns (battery)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 40** *(A/B)*
- **A · Mirror of Rime** · phys · enemy · *Freeze a Chilled target, then a guaranteed-crit cut that Shatters the frozen glass* · cost **med NOX** · cd **medium** · `proposed`
- **B · Glass Lattice Ward** · buff · self · *for a few turns take greatly reduced damage and become impossible to stun or move (the immovable duelist)* · cost **med NOX** · cd **medium** · `proposed`

**@ MNA 50** *(B/C)*
- **B · Glasswork Verdict** · phys · enemy · *a counter-stance turned offensive: every blow you parry this round answers with a guaranteed-crit Shatter against a Frozen/Brittle attacker* · cost **high NOX** · cd **medium** · `proposed`
- **C · Frostquiet Lattice** · util · allEnemies · *encase the front line in a frozen lattice — Freeze one or more foes (can't act); they Shatter for bonus if struck* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 60** *(A/C)*
- **A · Glasslight Verdict** · phys · enemy · *a colossal precision crit; if it crits a Frozen/Brittle foe the Shatter detonates for bonus scaling with crit damage* · cost **med NOX** · cd **medium** · `proposed`
- **C · Cold Mirror** · buff · allAllies · *refund a chunk of the party's banked NOX pool, and reflect a share of the next hit on each ally back as cold (battery + preservation)* · cost **low NOX** · cd **long** · `proposed`

**@ MNA 70** *(A/B)*
- **A · Glass Cadence Cut** · phys · enemy · *a chain of crit-cuts; each crit on a Frozen/Brittle foe extends the chain* · cost **high NOX** · cd **medium** · `proposed`
- **B · Mirrorblade** · buff · self · *a perfected mirror stance: for several turns every hit against you is parried into a guaranteed-crit counter that Chills* · cost **high NOX** · cd **long** · `proposed`

**@ MNA 80** *(B/C)*
- **B · Frostward Aegis** · buff · allAllies · *a lattice ward over the party (damage reduction); the first hit each ally parries this round Chills its attacker* · cost **high NOX** · cd **long** · `proposed`
- **C · Brittleward Edict** · util · allEnemies · *a frozen lattice clamps the field: Brittle all foes and time-lock their current debuffs (the team Shatter setup, held open)* · cost **med NOX** · cd **long** · `proposed`

**@ MNA 90** *(A/C)*
- **A · Final Glass** · phys · enemy · *plunge the target into a deep Frozen/Brittle state, then a guaranteed-crit cut that Shatters it for a burst* · cost **high NOX** · cd **long** · `proposed`
- **C · The Mirror Cold** · buff · allAllies · *a stillness ward over the party (damage reduction) + a burst of banked party NOX + preserve allies' current buff timers* · cost **med NOX** · cd **long** · `proposed`

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · Glassfall Mirror** *(Glasscutter)* · enemy · *bring the target to absolute zero — a guaranteed Freeze + max Brittle, then a single colossal guaranteed-crit Shatter scaling with crit damage (precision, not an HP-execute)* · `proposed`
- **B · The Mirror Wall** *(Frostward)* · self · *become an unbreakable mirror for several turns — near-total damage reduction, and every incoming hit is parried into a guaranteed-crit cold riposte that Chills and can Shatter a frozen attacker* · `proposed`
- **C · The Lattice Held** *(Hoarwarden)* · all · *the field crystallizes — Freeze and Brittle every foe and time-lock their actions, while a stillness ward and a NOX surge wash over the party (a team-wide Shatter window, held open)* · `proposed`
- **Rimewalker's Mirror** *(neutral/fusion)* · allEnemies · *a flowing frost-blade mirror dance: parry the line's blows into cold while Chilling and Freezing every foe, then a crit-chain that Shatters across every Frozen target* · `proposed`

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Glasshand Discipline** · *after a crit, gain bonus crit chance against Frozen/Brittle foes* · `proposed`
- **B · Mirror Reflex** · *your parries/ripostes trigger more readily and the riposte's Chill bites deeper* · `proposed`
- **C · Glass Tithe** · *your specials generate extra NOX, and it banks (doesn't bleed)* · `proposed`

**Set @ MNA 60**
- **A · Killing Glass Edge** · *your crit damage rises against Frozen/Brittle foes* · `proposed`
- **B · Rimeguard Discipline** · *while your lattice ward holds, your damage reduction is stronger and a parried hit refunds part of your attack-bar* · `proposed`
- **C · Wardkeeper** · *your Chill / Freeze / time-lock and ward effects last longer* · `proposed`

**Set @ MNA 90**
- **A · Shatterward Refund** · *when one of your crits Shatters a Frozen/Brittle target, refund part of your attack-bar* · `proposed`
- **B · Verglas Edge** · *while at max ward you cannot be stunned or moved, and your ripostes are guaranteed crits* · `proposed`
- **C · Cold Reserve Lattice** · *while your stillness/lattice ward holds, the party's time-locked durations don't tick down* · `proposed`

---

## Distinctness *(invariants #9 & #10 — how this seat is honored)*

- **Same-archetype (#9) — vs the four other Dual Swords.** Rimewalker is the **frost crit-parry
  preservationist**: AGI crits that *Shatter* a frozen foe, a frost *parry/riposte*, and a *lattice
  ward + NOX battery*. Distinct from the SOL **Sunblade** (pure radiant crit, no defensive line), the
  ANIMA **Pulse Arbiter** (adaptation/evolution, non-healer), the QUANTA **Phasewalker** (evasion via
  phase — controls *space*), and the UMBRAXIS **Abyssal Vector** (parry-and-*redirect* with gravity).
  His parry is *cold* (Chills the attacker) and his payoff is *Shatter* — no one else's is.
- **Same-archetype — vs his dagger cousin Velestra (NOX daggers).** The only thing they share is the
  NOX **signature** itself (Stasis, Chill → Frozen → Shatter). Velestra (concurrent re-spec) is the
  glass **tempo/flood/execute** assassin: a dedicated **Stasis-flood grind** lane, **attack-bar
  denial / time-skip** turn-control, and a **fast low-HP execute**. Rimewalker has **none** of those —
  no grind lane (Stasis is woven into his cuts/parries), no attack-bar-denial/time-skip, no
  speed-execute. His unique half of NOX is **crit-shatter + parry/ward + battery**, and he is
  **durable** (survives by defending), where she is glass (survives by denying).
- **Same-attunement (#10) — NOX concept budget.** He reuses the NOX *signature* (Stasis / Chill →
  Frozen → Brittle → Shatter) freely, as the framework intends, and takes NOX's **preservation** facet
  (parry · ward · banks) — which the dagger explicitly *cedes* to him. He does **not** pile onto a
  saturated NOX role: the **anti-caster/Seal** control belongs to the Staff (Null Absolutionist), the
  **planted slam-crusher** to the Hammer (Equilibrium Ascendant), the **mitigation-wall tank** to the
  Sword & Shield (Penumbral Bastion), and the **flood/execute/tempo-denial** to the dagger (Velestra).
  His seat — *crit-shatter + frost parry + preservation battery* — is held by no other NOX class.

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds (5…95 / 10…90) | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9; rotation A/B→B/C→A/C) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX (banks) | ✓ |
| Provenance on every entry (fantasy/lanes/DNA `from-brief`; abilities `proposed`) | ✓ |
| Ability names globally unique within kit + across all `docs/design/classes/*.md` (invariant #8) | ✓ |
| Same-archetype distinctness (#9) — distinct seat from all 4 Dual Swords siblings *and* from Velestra | ✓ |
| Same-attunement concept budget (#10) — reuses NOX signature only; no saturated-role pile-on | ✓ |
