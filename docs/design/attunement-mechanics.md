# Attunement Mechanics Framework — RATIFIED CANON

> **Status: RATIFIED CANON (Dara, 2026-06-28).** This is the canonical framework for Gaia's
> combat mechanics, grounded in the five core physics concepts, that class design draws on. Every
> item in the Approval Ledger below is **ratified**; the ratified terms are now folded into
> `CONTEXT.md` (the glossary) and the [Class System Model](classes/README.md). Engine *wiring* of
> these mechanics remains downstream implementation work (per CLAUDE.md — design canon, not yet
> engine-wired).
>
> Origin: a `grill-with-docs` session (2026-06-28) while building the NOX × Hammer class, which
> surfaced that the one-status-per-attunement model is thin and that NOX's "Decay" reads as
> *entropy* when NOX is *anti-entropy*.

## The spine: the Five are five stances on entropy

Each attunement reduces to **one unifying physics principle**; the other canon domain words
(cold/dark, light/fire, etc.) are *facets/flavor* of it, not separate mechanic lines. Laid on one
axis, the Five are five answers to entropy — and the affinity ring emerges from the physics for free.

| Attunement | Verb | Principle | Facets (flavor, not separate lines) |
|---|---|---|---|
| **SOL** | **Spread** | *Increase* entropy — energy spreading outward, disorder rising | Expansion · Light · Fire · Entropy |
| **NOX** | **Freeze** | *Reverse* entropy via **stillness** — force systems to a fixed, static, ordered state | Preservation · Cold · Dark · Order · Anti-Entropy |
| **ANIMA** | **Grow** | *Reverse* entropy via **life** — adaptive negentropy: maintain order by changing (metabolize, mutate, replicate) | Life · Purpose · Evolution · Vitality |
| **UMBRAXIS** | **Pull** | *Reverse* entropy via **gravity** — clump, compress, distort position & structure | Gravity · Spacetime · Singularities · Cosmic Structure |
| **QUANTA** | **Collapse** | *Resolve* entropy as **information** — observe/measure to pick one outcome from many | Probability · Time · Observation · Possibility |

**Why the ring falls out of this:** "Entropy beats Order" → SOL beats NOX. NOX's stasis halts the
change life requires → NOX beats ANIMA. Etc. (See `affinity-ring.md` for the ratified ring.)

### Two reframes this implies (ratified)

- **ANIMA: from "biology" to a peer principle.** Reframed as *adaptive negentropy / emergence* —
  order maintained through **change** (vs NOX's order through **stasis**). Same enemy (entropy),
  opposite method, which is *why NOX beats ANIMA*. Shifts ANIMA's mechanical identity away from
  generic poison/heal toward **evolution / adaptation / replication / metabolism**.
- **NOX: the signature DoT is "Stasis", cold *cessation*, not rot.** NOX is anti-entropy, so its
  DoT is not putrefaction (a disorder-increasing, ANIMA-ish idea) but the victim's motion/vitality
  **winding down toward absolute zero** — being *frozen / stilled / arrested*. Design name:
  **Stasis** (engine keyword `decay` can stay for compat; the *concept* is Stasis, no rot).

## Mechanic layers (the "full spectrum")

A "mechanic" in this framework spans **all** of these layers, not just status effects — this breadth
is what lets 45 classes feel distinct. Every mechanic must be a readable expression of its
attunement's principle.

1. **Status effects** — named buffs/debuffs with durations (Burn, Chill, Root…).
2. **Action-economy** — ATB/attack-bar manipulation: haste, slow, push-back, extra turns, stun.
3. **Stat / damage modifiers** — armor-sunder, vulnerability, damage-reflect.
4. **Meta-effects** — buff-strip, heal-denial, cleanse, cleanse-immunity.
5. **Resource / economy patterns** — how the attunement feeds the party-shared MNA pool.

## Cross-cutting mechanic families ("the goldmines")

Core physics ideas that **aren't owned by one attunement** — shared mechanic vocabularies any
attunement can dip into, themed to its own principle.

- **Conservation / transfer** — quantities aren't created, only moved: drain (UMBRAXIS), reflect /
  redirect damage, redistribute HP across the party. The physics of "move it, don't make it."
- **Resonance / interference** — the physics name for a **cross-attunement combo system**:
  constructive interference = two compatible mechanics *amplify*; destructive = they *cancel*.
  (**"Harmonic Ascension" is already canon** — REQUIEM — so resonance is blessed in spirit.)
- **Phase transition / critical threshold** — matter reorganizes suddenly at a critical point:
  statuses that **escalate into a stronger form** at a stack/duration threshold
  (e.g. Chill → Frozen → Shatter). Makes statuses read as physics, not just ticking numbers.

## Per-attunement mechanic suites

> Each attunement's family across the five layers. All five are ratified.

### NOX (Freeze) — *force the target/battlefield toward a fixed, still, ordered state*

**Identity:** the **tempo-control + preservation/tank** attunement. NOX wins by making enemies
*stop* and by being *unbreakable* — not by out-DoT-ing anyone.

**Flavor lexicon:** crystalline · lattice · absolute zero · stillness · hoarfrost · preservation ·
silence · the fixed point.

| Layer | Mechanics |
|---|---|
| **Status** | **Chill** (slows) · **Frozen** (can't act; reads as crystalline/encased) · **Brittle** (takes bonus burst dmg) · **Stasis** (signature DoT — vitality winding toward absolute zero; engine keyword `decay`) · **Sealed** (an ability/buff locked) |
| **Action-economy** | attack-bar **drag** (Chill slows ATB fill) · attack-bar **push-back** · **Stun/Freeze** · **time-lock** a buff/debuff's duration so it doesn't tick down (preservation) |
| **Stat/damage** | **Shatter** (Frozen → bonus damage, esp. STR) · **stillness armor / lattice ward** (self/party damage reduction — NOX as preservation/tank) · **cap/fix** (lock a value: enemy can't be healed past current, or can't crit/spike) |
| **Meta** | **dispel-lock** (enemy can't cleanse or gain new buffs) · **preserve** (freeze an *ally's* buff durations so they persist) · **reset** (strip to a neutral baseline — order clears buffs *and* debuffs) |
| **Economy** | NOX **battery** — and a preservation twist: NOX resource **banks well** (slow to spend, doesn't bleed away between turns) |

**Showcase — the phase-transition chain (crystalline cold):** **Chill → Frozen → Shatter.** Stack
chill until the target freezes into a crystalline state; a frozen target is brittle; the next big
STR hit shatters it for burst. The NOX combat fantasy in one line — and a perfect Hammer payoff.
*Absolute zero* (the floor of the chain) is the natural capstone *concept* — though per the
globally-unique-name rule (class model invariant #8) each class needs its own ability name for it
(Rimewalker already took "Absolute Zero"; the Hammer's is "Entombment").

### SOL (Spread) — *increase entropy: spread, accelerate, detonate*

**Identity:** the **escalation + acceleration** attunement — wins by spreading (AoE, propagation),
speeding up, and detonating. The deliberate inverse of NOX: **pure offense, no defensive line.**

**Flavor lexicon:** solar flare · corona · wildfire · supernova · conflagration · radiance · bloom.

| Layer | Mechanics |
|---|---|
| **Status** | **Burn** (signature DoT — combustion/energy bleeding off) · **Blind** (light → miss chance) · **Scorched** (vulnerability: armor melted, takes more dmg) · **Overheat** (stacking heat → phase transition) |
| **Action-economy** | **Haste** (self/ally ATB speed-up) · **extra action / double-tap** · the anti-NOX: SOL *pushes* the attack-bar forward where NOX drags it back |
| **Stat/damage** | **Sunder/Melt** (reduce enemy armor) · **Scorched** vulnerability (amplify dmg taken) · **escalating** damage that ramps over time/stacks (entropy rising) |
| **Meta** | **Spread** (SOL's signature meta — DoTs/debuffs *propagate to adjacent enemies*; fire jumps) · **burn off** order (strip a NOX-style lock/buff) |
| **Economy** | SOL **battery**, chaos twist: SOL resource **runs hot** — generates fast but **bleeds away if hoarded** (use-it-or-lose-it) |

**Showcase phase-transition (mirror of Chill→Frozen→Shatter):** **Overheat → Ignite → Detonate** —
stack heat, ignite into Burn, then detonate the Burn for an AoE that *spreads* to neighbors.

**The SOL ↔ NOX mirror** (the framework proving itself):

| Axis | NOX (Freeze) | SOL (Spread) |
|---|---|---|
| Tempo | drag / push-back / stun | haste / extra action |
| DoT | **Stasis** (wind down) | **Burn** (combust) |
| Burst | **Shatter** (frozen → burst) | **Detonate** (heat → AoE) |
| Reach | single-target lockdown | **spreads** to neighbors |
| Defense | stillness armor (endure) | — (pure offense) |
| Economy | **banks** well | **runs hot** (use or lose) |

### ANIMA (Grow) — *reverse entropy via life: adaptive negentropy, order through change*

**Identity:** the **ramp + sustain + adaptation** attunement — weak early, snowballs late;
out-sustains and out-adapts everything. *This is why NOX beats it:* stasis halts the change life
needs to ramp. ANIMA's mechanics aren't "heal + poison" — they're **things that change form / grow
over time.**

**Primary stat: VIT** (see flag below) · **Flavor lexicon:** bloom · spore · verdant · symbiote ·
genesis · mutation · chrysalis · hive · overgrowth.

| Layer | Mechanics |
|---|---|
| **Status** | **Infestation** (signature DoT — reframed Poison: a *living contagion* that multiplies/stacks and **spreads on the host's death**) · **Regen** (HoT, the mirror of the DoT) · **Bloom** (a buff that *grows* each turn) |
| **Action-economy** | **Evolution** — ANIMA's signature-unique: abilities/statuses that **change into a stronger form** at a use/turn threshold (metamorphosis). Not faster turns — *better* turns over time |
| **Stat/damage** | **Adaptation** (after taking a damage type, grow resistance to it — the immune system learning) · **escalating** self-buffs that compound each turn |
| **Meta** | **Metabolize / consume** (devour a corpse, debuff, or buff to *grow* — heal/empower from it) · **Symbiosis** (graft a growing buff onto an ally; link two allies to share vitality) · **revive / regrowth** |
| **Economy** | ANIMA resource **compounds** — the more you hold, the faster it grows (living interest / passive regen). The third economy archetype |

**Showcase threshold (metamorphosis = the phase-transition family):** **Seed → Bloom → Overgrowth**
— a stack grows each turn and at the threshold *blooms* into a big payoff (heal burst, a summon, or
a contagion that detonates and reseeds onto new targets).

**The three economy archetypes** now line up across the spine:
**NOX banks** (static, preserved) · **SOL runs hot** (decays, use-or-lose) · **ANIMA compounds** (grows).

> **⚑ STAT-SYSTEM — ANIMA's primary stat: MGC → VIT (RATIFIED).** The former **MGC ("Magic")** slot
> is renamed to **VIT (Vitality)** — the canonical set is now **STR/AGI/DEF/SPD/VIT**, still five
> stats, still 1:1 with the five attunements. VIT keeps the slot's substat role (ability power /
> healing / debuff potency) and is also the **Staff** archetype's secondary. Folded into `CONTEXT.md`,
> the [Class System Model](classes/README.md), and [`stat-system.md`](stat-system.md). See ledger #10.

### UMBRAXIS (Pull) — *reverse entropy via gravity: clump, compress, distort position & structure*

**Identity:** the **position-control + drain/bulwark** attunement — wins by *moving bodies in space*,
compressing them together, and bending position/time near mass. Distinct from NOX control: NOX
**freezes tempo**, UMBRAXIS **moves things in space**. The true tank (DEF), and owner of the
**conservation/transfer** goldmine as its native economy.

**Primary stat: DEF** · **Flavor lexicon:** singularity · event horizon · tidal · gravity well ·
void · collapse · accretion · lagrange *("The Lagrangian" / "Lagrange Nodes" already UMBRAXIS canon)*.

| Layer | Mechanics |
|---|---|
| **Status** | **Drain** (signature DoT — life/energy pulled *out* and transferred to the caster; conservation: your loss is their gain) · **Crush** (gravity pressure — escalating dmg the longer it's held) · **Anchored** (rooted/pinned by gravity) |
| **Action-economy** | **Singularity pull** (drag enemies *together* into a cluster — positional AoE setup) · **time-dilation** (slow near a mass — positional, only inside the well) · **event-horizon** (target can't flee / swap rows) |
| **Stat/damage** | **Mass armor** (DEF → damage reduction; the true tank) · **compression vulnerability** (a crushed target takes more) · **damage-reflect** (gravity bends incoming force back) |
| **Meta** | **Drain/steal** a buff or resource off the enemy (conservation — take what's theirs) · **redistribute** (move HP/threat around the field) · **redirect** incoming hits to the well |
| **Economy** | UMBRAXIS resource is fed by **what it takes** — drains/steals *convert* into the pool. The **conservation economy**: it doesn't generate from nothing, it *transfers* |

**Showcase (the gravity setpiece):** **Singularity** — pull all enemies into one cluster, time-dilate
(slow) them inside it, then **collapse** for a massive AoE crush. The positional mirror of SOL's
*spread*: SOL pushes things *apart*, UMBRAXIS pulls them *together*.

**The control-axis quartet** (what each non-life attunement controls): **NOX = tempo (stop)** ·
**SOL = tempo (accelerate)** · **UMBRAXIS = position (space)** · **QUANTA = outcome (probability)**.

### QUANTA (Collapse) — *resolve entropy as information: observe, gamble, force the outcome*

**Identity:** the **tempo + probability** controller — manipulates turn-order *and* forces/gambles
outcomes. The high-variance "swing" attunement (mana scales SPD/turn-priority — canon). Its
signature axis, owned by no one else: **gamble ↔ guarantee** — make outcomes wildly swingy (bet for
a huge payoff) or *collapse them to certainty* (a guaranteed crit/dodge).

**Primary stat: SPD** · **Flavor lexicon:** superposition · wavefunction · observer · collapse ·
entanglement · uncertainty · paradox · stochastic · the dice · Schrödinger.

| Layer | Mechanics |
|---|---|
| **Status** | **Observed** (enemy randomness collapsed — its next dodge fails / next action known & pre-empted) · **Decohere** (degrade enemy accuracy/crit — the physics-named *Jinx*) · **Superposed** (a coin-flip status, resolves good-or-bad at a threshold) · **Doom** (a delayed, *determined* hit) |
| **Action-economy** | QUANTA's home (scales SPD): **turn-priority/haste** · **chance of extra turns** · **rewind** (undo/replay an action) · **foresight/pre-empt** (act before the enemy) · **time-skip** an enemy's turn |
| **Stat/damage** | **Crit/dodge swings** (canon signature — buff own, debuff enemy's) · **guaranteed crit / guaranteed dodge** (collapse a probability to 1) · **variance up** (gamble: bigger min-max spread) |
| **Meta** | **Observe/Collapse** (signature: force a probabilistic event to a chosen outcome — turn a 50% into 100% or 0%) · **Reroll** (re-roll a hit/miss/crit) |
| **Economy** | QUANTA resource **fluctuates** — generates in random bursts, and you can **gamble the pool** on an outcome. The 4th economy archetype |

**Showcase (the signature):** **Superposition → Collapse** — build "observation," hold a target in
multiple potential outcomes, then *collapse* it to force certainty (guaranteed crit, skipped enemy
turn, or a resolved **Doom**).

**The four economy archetypes** (complete): **NOX banks · SOL runs hot · ANIMA compounds · QUANTA gambles.**

> **⚑ QUANTA's "DoT" = Doom (RATIFIED).** The `none`-signature canon gains **Doom** — *not* a tick
> but a **delayed, *determined* hit** (a timer that resolves into damage; "the outcome is already
> written"). On-theme for collapse/observation/time, and honors "no DoT" because nothing ticks.
> See ledger #13.

> **⚑ Avoidance model (RATIFIED) — "untargetable" is just high dodge %.** QUANTA avoidance is a
> **single tunable axis: dodge %**. There is **no separate untargetable/immune state** — "can't be
> hit / collapse to a miss / phase out" is an ability raising dodge toward an effective **~100%**
> (tunable per ability). One number, precise balance control. See ledger #14.

> **⚑ QUANTA accuracy/crit debuff = "Decohere" (RATIFIED).** The physics register wins over luck
> flavor: the status is **Decohere** (loss of coherence → degraded accuracy/crit), not "Jinx".
> Engine-keyword reconciliation (keep `jinx` internally, or rename to `decohere`) is downstream
> wiring. See ledger #15.

---

## Approval Ledger — RATIFIED by Dara (2026-06-28)

Legend: **ratified** = blessed by Dara, now canon. (All items below are ratified; engine *wiring* of
these mechanics is separate downstream work.)

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | One unifying principle per attunement (facets are flavor) | **ratified** | Folded into CONTEXT.md (Attunement stances) |
| 2 | "Five stances on entropy" as the framework spine + per-attunement verb | **ratified** | Spread/Freeze/Grow/Pull/Collapse |
| 3 | **ANIMA reframe** → adaptive negentropy/emergence (evolution/adaptation/replication) | **ratified** | |
| 4 | **NOX signature DoT = "Stasis"** (cold cessation, not rot) | **ratified** | Concept = Stasis; engine keyword `decay` stays for compat |
| 5 | Full-spectrum mechanic layers (status/action-economy/stat/meta/economy) | **ratified** | Framework scope |
| 6 | Cross-cutting families: conservation/transfer, resonance/interference, phase-transition | **ratified** | |
| 7 | **NOX suite** (control + preservation/tank; Chill→Frozen→Shatter; lexicon: crystalline/lattice/absolute zero) | **ratified** | |
| 8 | **SOL suite** (offense/AoE/tempo-up, no defense; Overheat→Ignite→Detonate; SOL↔NOX mirror) | **ratified** | |
| 9 | **ANIMA suite** (ramp/sustain/adapt; Infestation; Evolution; Seed→Bloom→Overgrowth; compounds) | **ratified** | |
| 10 | **STAT SYSTEM: rename MGC slot → VIT** (ANIMA primary; also Staff secondary) | **ratified** | Folded into CONTEXT.md + Class Model + stat-system.md |
| 11 | **UMBRAXIS suite** (position-control + drain-tank; Singularity setpiece; conservation economy) | **ratified** | |
| 12 | **QUANTA suite** (tempo+probability; gamble↔guarantee; Superposition→Collapse; gambles economy) | **ratified** | |
| 13 | **QUANTA "Doom"** — delayed *determined* hit as QUANTA's DoT-that-isn't (canon sig = none) | **ratified** | Honors "no DoT" (nothing ticks) |
| 14 | **Avoidance = dodge %** — no separate untargetable/immune state; "can't be hit" = dodge to ~100% (tunable) | **ratified** | Mechanical rule for QUANTA avoidance |
| 15 | **QUANTA accuracy/crit debuff = "Decohere"** (physics name over luck "Jinx") | **ratified** | Engine-keyword reconcile is downstream wiring |
| 16 | **ANIMA healer concentration** — dedicated party-healing belongs to the **Staff (Genesis Sage)**; the **Hammer (Lifekeeper)** is the **one** secondary/off-healer. **Every other ANIMA class is NOT a party-healer** — it expresses a different mode of *order-through-change* (replication / contagion / adaptation / metabolism). Self-sustain (the HoT mirror of the DoT) is fine; the party-heal *role* is not. | **ratified (2026-06-29)** | Folded into the Dual Swords family (Pulse Arbiter = adaptation, non-healer) and applied retroactively: Symbiote Hunter (daggers) trimmed to self-sustain only; Soul-Bound Aegis (S&S) lane C shifted heal→growing buffs/wards. Future ANIMA classes (Pistols/Rifle/2H/Spellblade) must honor this. |
