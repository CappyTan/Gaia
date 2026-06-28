# Paradox Bastion — QUANTA × Sword & Shield

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Every entry is `proposed` (the designer supplied the class
> identity + the all-defensive "evasion tank" framing; abilities are skill-drafted) — ratified canon (Dara, 2026-06-28). Numberless by design; magnitudes are a later balance pass.
>
> **Mechanics vocabulary** (probability swings · gamble↔guarantee · Doom · Observe/Collapse · the
> "gambles" economy) is drawn from the [Attunement Mechanics Framework](../attunement-mechanics.md),
> which is **ratified canon (Dara, 2026-06-28)**. Names are flavored to QUANTA's
> physics / probabilistic / stochastic / quantum-mechanics register (not casino gambling). The
> framework's QUANTA accuracy/crit debuff status is keyworded **Jinx**; in this kit it reads as
> **decohere** — see the open flag in the framework ledger.

## Identity (derived + DNA)

- **Class:** Paradox Bastion · **Attunement × Archetype:** QUANTA × Sword & Shield
- **Primary stat:** SPD (← QUANTA) · **Secondary stat:** DEF (← Sword & Shield) — a *speed-tank*
- **Resource:** QUANTA (party-shared; **gambles** — fluctuates, can be bet)
- **Attunement signature:** **Probability swings** — crit/dodge/time, **gamble↔guarantee**, **Doom** (no DoT)

**Fantasy.** The Paradox Bastion is a shield-bearer who tanks with **probability and time** instead
of mass. Where others raise armor, the Bastion raises *odds* — standing in superposition until the
enemy's strike resolves, then collapsing it into a miss; reading a half-second into the future to
interpose before the hit exists; and, when it matters, forcing the enemy's whole future into a losing
outcome. They are unkillable not because nothing can hurt them, but because, observed correctly, the
hit never happened. A living paradox at the front line — the more they're attacked, the more chances
they get to prove the attack never connected.

**The defining trait — avoidance, not mitigation.** Three tanks survive three ways: **NOX** *mitigates*
(freeze the blow, take little), **UMBRAXIS** *absorbs* (raw mass, shrug it off), **QUANTA** *avoids*
(collapse the attack to a miss). The Bastion has almost **no damage reduction** — the rare clean hit
lands *full* — so it is a high-variance, high-skill tank whose defense is its dodge. QUANTA's
**gamble↔guarantee** axis therefore lives *inside* the defense: cheap probabilistic dodges (gamble —
might eat the hit) vs costly guaranteed blocks (certainty).

> **Mechanical note — avoidance is one axis: dodge %.** There is **no separate "untargetable" /
> "immune" state.** Every "can't be hit / collapse to a miss / phase out" effect is implemented as a
> **dodge-% increase**; some abilities push dodge to an effective **~100%** (read as untargetable),
> others a lesser amount. Keeping it a single tunable number (rather than a binary immunity flag)
> gives precise balance control over *how* unhittable each tool makes you.

### Lanes *(all defensive — three mechanisms of damage-prevention)*

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Blurguard** | **Self-evasion** — collapse incoming front-line hits to misses; draw aggro and survive by not being there | **SPD**, dodge, aggro | evasion main-tank | you want a front-liner who soaks attention; SPD/dodge gear |
| **B · Wardshift** | **Interpose for allies** — shift through space/time to put your shield between a foe and a backliner; redirect & eat hits *for* others | **DEF**, positioning, ally-protect | guardian / peeler | fragile back line; protecting a carry |
| **C · Decoherence** | **Enemy-offense denial** — decohere accuracy/crit (they whiff), seed **Doom**, deny tempo; make the enemy *fail* | **SPD**, probability debuff, Doom | disruptor / attrition | vs hard-hitting packs; the kit's only real win condition (Doom) |

**Build axes:** defense ↔ offense-denial (A↔C) · reactive-protection ↔ proactive-interpose (A↔B) ·
**guarantee/safety ↔ gamble/variance** (QUANTA's signature axis — runs *inside* every lane via the
cheap-probabilistic vs costly-certain option split).

---

## Auto-attack *(unlaned)*

- **Sample** · phys · enemy · *a measured shield-jab that samples the state and feeds the pool* · gen **minor QUANTA** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Blink Guard** · buff · self · *gain brief Evasion and draw aggro* · gen **moderate QUANTA** · cd **short**
- **B · Shield Shift** · util · ally · *swap to an ally's position, intercepting the next hit aimed at them* · gen **moderate QUANTA** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Bulwark Step** · buff · ally · *redirect the next attack on a chosen ally to yourself* · gen **moderate QUANTA** · cd **medium**
- **C · Detune** · util · enemy · *knock the target off-phase — lower its accuracy (decohere)* · gen **moderate QUANTA** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Afterimage** · buff · self · *gain Evasion; the first attack that misses you is countered with a shield-bash* · gen **moderate QUANTA** · cd **medium**
- **C · Measure** · util · enemy · *observe the target: reveal its next action and collapse its crit chance to zero* · gen **moderate QUANTA** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Sidestep** · buff · self · *guaranteed dodge of the very next hit* · gen **moderate QUANTA** · cd **medium**
- **B · Aegis Lend** · buff · ally · *grant an ally a one-time guaranteed block* · gen **moderate QUANTA** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Phase Wall** · buff · allAllies · *brief party-wide dodge chance* · gen **moderate QUANTA** · cd **medium**
- **C · Interference** · util · allEnemies · *destructive interference: lower all foes' accuracy and crit* · gen **moderate QUANTA** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Improbable Stance** · buff · self · *huge dodge for several turns, but take extra damage on any hit that lands (the evasion gamble)* · gen **major QUANTA** · cd **medium**
- **C · Worldline** · util · enemy · *fix the target's worldline — a light Doom (delayed, determined hit)* · gen **moderate QUANTA** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Eigenstate** · buff · self · *collapse to one of two favorable states: spike your dodge to ~100% for a turn, or gain a QUANTA surge* · gen **major QUANTA** · cd **medium**
- **B · Guard Swap** · util · ally · *instantly swap positions with an ally and block the next hit meant for them* · gen **moderate QUANTA** · cd **short**

**@ MNA 75** *(B/C)*
- **B · Bodyguard** · buff · ally · *link to an ally: for a few turns, redirect a share of hits on them to you* · gen **moderate QUANTA** · cd **medium**
- **C · Stutter** · util · enemy · *push the target's attack-bar back and decohere its next action* · gen **moderate QUANTA** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Vanishing Point** · buff · self · *collapse out of the timeline — spike your dodge to ~100% briefly* · gen **moderate QUANTA** · cd **medium**
- **C · Uncertainty** · util · allEnemies · *Heisenberg's curse: all foes' next attacks may fumble (miss and lose the turn)* · gen **major QUANTA** · cd **long**

**@ MNA 95** *(A/B)*
- **A · Perfect Read** · buff · self · *foresee and auto-dodge the next several attacks against you (guaranteed)* · gen **major QUANTA** · cd **medium**
- **B · Last Stand Aegis** · buff · allAllies · *take a share of all incoming hits for a turn* · gen **major QUANTA** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Evasion Protocol** · buff · self · *high Evasion and Taunt for several turns — be the target and dodge it all* · cost **med QUANTA** · cd **medium**
- **B · Intercept** · util · ally · *teleport to a hard-pressed ally and guaranteed-block the next hit* · cost **low QUANTA** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Aegis Field** · buff · allAllies · *a shield-bubble: the next hit on each ally is blocked* · cost **med QUANTA** · cd **medium**
- **C · Static Field** · util · allEnemies · *flood the field with noise: big accuracy and crit reduction for several turns* · cost **med QUANTA** · cd **long**

**@ MNA 30** *(A/C)*
- **A · Probability Cloak** · buff · self · *exist in superposition: very high dodge; hits that do land are partly refunded as QUANTA* · cost **med QUANTA** · cd **medium**
- **C · Foregone Conclusion** · util · enemy · *heavy Doom — undodgeable and uncleansable* · cost **med QUANTA** · cd **medium**

**@ MNA 40** *(A/B)*
- **A · Riposte Cascade** · phys · enemy · *for several turns, every attack you dodge triggers a shield counter* · cost **med QUANTA** · cd **medium**
- **B · Entanglement** · buff · ally · *entangle with an ally: hits on them route to you and are dodged at your evasion* · cost **med QUANTA** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Phalanx** · buff · allAllies · *party-wide guaranteed block of the next hit plus a brief dodge aura* · cost **high QUANTA** · cd **medium**
- **C · Zero Amplitude** · util · allEnemies · *collapse their probability amplitude to nil — their next attacks all miss (guaranteed)* · cost **high QUANTA** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Quantum Tunnel** · util · self · *phase out for a full turn — dodge ~100% of everything — then reappear* · cost **high QUANTA** · cd **long**
- **C · Light Cone** · util · allEnemies · *seal the enemy side's future light cone — Doom every foe* · cost **high QUANTA** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Improbability Drive** · buff · self · *your dodge chance becomes extreme; each successful dodge grants an extra action* · cost **high QUANTA** · cd **long**
- **B · Aegis Paradox** · buff · ally · *make an ally a fixed point — raise their dodge to ~100% for a short window* · cost **high QUANTA** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Bulwark Eternal** · buff · allAllies · *redirect ALL incoming party damage to yourself for a turn, dodged at your evasion* · cost **high QUANTA** · cd **long**
- **C · Null Result** · util · allEnemies · *every enemy attack this turn resolves to nothing and advances their Doom* · cost **high QUANTA** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Many Worlds** · buff · self · *the next few heavy or fatal hits are retroactively dodged — in some branch, you stepped aside* · cost **high QUANTA** · cd **long**
- **C · Inevitable** · util · enemy · *a massive Doom that cannot be removed, delayed, or out-healed* · cost **high QUANTA** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high QUANTA**, cd **long**)*

- **A · Schrödinger's Guard** *(Blurguard)* · self · *both hit and unhit until observed — dodge ~100% (auto-dodge everything) for several turns; draw all aggro*
- **B · Absolute Aegis** *(Wardshift)* · allAllies · *interpose across spacetime: the whole party's dodge is raised to ~100% for a turn (every attack collapses to a miss)*
- **C · Causal Collapse** *(Decoherence)* · allEnemies · *load every outcome against them: all foes decohered to miss, and Doom that resolves at the ultimate's end*
- **Paradox** *(neutral/fusion)* · all · *collapse the field's probability — the party gains massive dodge while enemies are decohered and lose their next turn*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Cross-Section** · *you present a smaller cross-section while holding aggro — higher dodge*
- **B · Quick Cover** · *your intercepts also grant the protected ally brief dodge*
- **C · Damping** · *foes you've decohered also deal reduced crit damage*

**Set @ MNA 60**
- **A · Untouchable** · *after you dodge, your next dodge is likelier (momentum)*
- **B · Aegis Reflex** · *the first hit you intercept each turn is reduced — your only true mitigation*
- **C · Probability Current** · *your Doom effects flow to resolution faster*

**Set @ MNA 90**
- **A · Probability Master** · *a floor of attacks against you always miss, regardless*
- **B · Last Line** · *auto-intercept the next hit on a low-health ally*
- **C · Skewed Distribution** · *your decohere can also force a fumble (a foe loses its turn)*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary SPD ← QUANTA · secondary DEF ← Sword & Shield · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all QUANTA | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
| Ability names globally unique — no internal dupes; no collision with other class specs (invariant #8) | ✓ |
