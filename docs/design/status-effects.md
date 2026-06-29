# Status-Effect Catalog — the buff/debuff "bible"

The single source of truth for Gaia's buffs & debuffs. Organized by the ratified **5 mechanic layers**
([attunement-mechanics.md](./attunement-mechanics.md)) × **6 buckets** (Neutral + the 5 attunements).
The system model + rules are in **[ADR 0016](../adr/0016-buff-debuff-system.md)**.

> **Design canon, not yet engine-wired.** The engine ships ~8 effects today (marked **[✓]**); the rest
> are **needed**. The **deploy-first tranche** (below) is what to wire first. Magnitudes are a balance pass.

## Model (see ADR 0016)

Each effect is a **definition** in this catalog (`id · name · kind buff|debuff · layer · attunement ·
duration · magnitude/stacks · stacking rule · dispellable · cleansable · time-lockable · needs-source`),
applied to a unit as a structured **active instance** `{defId, turns, stacks, magnitude, source}`. Buffs
and debuffs share one model (sign = `kind`).

- **Stacking rules:** `refresh` (default) · `stack-intensity` (capped; scales with stacks) ·
  `stack-duration` (rare) · `unique`.
- **Phase-transition chains** = `stack-intensity` reaching a threshold → auto-promotes to the next-stage
  effect (Chill→Frozen→Brittle→Shatter, Overheat→Ignite→Detonate, Seed→Bloom→Overgrowth).
- **Ticking:** at the bearer's turn.
- **Lifecycle:** apply = `on-hit` (chip) or `resistible` (Accuracy↔Resistance, for hard CC) · removal =
  `cleanse` (respects `cleansable`) + `buff-strip` · protect = `time-lock`/`dispel-lock`/`preserve` ·
  hard-CC (Stun/Frozen/Anchored) grants a brief **re-application immunity window** (anti-perma-lock).

## The catalog

### Layer 1 · Status (DoTs / HoTs / timed debuffs & buffs)

| Bucket | Effects |
|---|---|
| **Neutral** | Attack Up **[✓ `atkup`]** · Defense Up · Attack Down · Defense Down · Guard **[✓]** · Barrier **[✓ `wardArmor`]** |
| **SOL** | **Burn** (signature DoT — combustion; *detonatable*, can spread) **[✓ clone → differentiate]** · Blind **[✓]** · Scorched (vulnerability) · Overheat (stacking heat → chain) |
| **NOX** | **Stasis** (signature DoT — winds vitality down, no rot; engine `decay`) **[✓ clone → differentiate]** · Chill (slow) · Frozen (can't act) · Brittle (bonus burst taken) · Sealed (an ability/buff locked) |
| **ANIMA** | **Infestation** (signature DoT — living contagion; stacks, *spreads to a new host on death*) **[✓ clone → differentiate]** · Regen (HoT, the DoT's mirror) **[✓]** · Bloom (a buff that grows each turn) |
| **UMBRAXIS** | **Drain** (signature DoT — ticked HP *transfers to the caster*; needs `source`) **[label only → wire]** · Crush (escalating pressure) · Anchored (rooted/pinned) |
| **QUANTA** | *no DoT* — **Doom** (delayed, *determined* hit) · Decohere (jinx: accuracy/crit down) · Observed (next dodge fails / action pre-empted) · Superposed (coin-flip, resolves at a threshold) |

### Layer 2 · Action-economy (ATB / turns)

| Bucket | Effects |
|---|---|
| **Neutral** | Stun **[✓]** · Slow · Haste |
| **SOL** | Haste (self/ally ATB up) · extra-action / double-tap · attack-bar **push-forward** |
| **NOX** | attack-bar **drag** (Chill slows fill) · attack-bar **push-back** · Stun/Freeze · **time-lock** a duration |
| **ANIMA** | (light — ramp/tempo via Bloom; no dedicated denial) |
| **UMBRAXIS** | Anchored (root = action denial) · attack-bar **pull** |
| **QUANTA** | extra turn · **pre-empt** (act before the enemy) · reroll-turn / tempo manipulation |

### Layer 3 · Stat / damage modifiers

| Bucket | Effects |
|---|---|
| **Neutral** | the stat up/downs (L1) applied as modifiers · Barrier / flat Damage Reduction |
| **SOL** | Sunder / Melt (reduce enemy armor) · Scorched vulnerability (amplify dmg taken) · escalating ramp |
| **NOX** | **Shatter** (Frozen/Brittle → bonus burst, esp. STR/AGI) · stillness / **lattice ward** (DR) · cap/fix (lock a value) |
| **ANIMA** | Bloom / compounding growth |
| **UMBRAXIS** | Crush (escalating damage the longer held) · gravity pressure |
| **QUANTA** | crit / dodge probability swings · Decohere (reduce enemy crit/accuracy) |

### Layer 4 · Meta

| Bucket | Effects |
|---|---|
| **Neutral** | Cleanse (remove cleansable debuffs) **[✓]** · Buff-strip (remove enemy buffs) |
| **SOL** | Detonate (consume Burn for a burst / spread) |
| **NOX** | dispel-lock · preserve (freeze an ally buff's duration) · reset (strip to neutral — buffs *and* debuffs) |
| **ANIMA** | spread (Infestation jumps hosts) · cleanse + heal |
| **UMBRAXIS** | drain-buff (steal a buff/resource) · redistribute (move HP/threat) · redirect (incoming → the well) |
| **QUANTA** | **Observe / Collapse** (force a probabilistic event to a chosen outcome) · Reroll (re-roll a hit/miss/crit) |

### Layer 5 · Economy

Resource / battery patterns per attunement (NOX **banks**, QUANTA **gambles**, etc.). Governed by the
**MNA resource-economy** canon ([Class System Model](./classes/README.md)); referenced here, not duplicated.

## Deploy-first tranche (wire these first)

1. **Differentiate the 3 clone DoTs** → Burn (detonatable) · Stasis (winds-down → Shatter setup) ·
   Infestation (spreads-on-death); **wire Drain** (→ caster).
2. **The Neutral set** — Attack Up/Down · Defense Up/Down · Guard · Barrier.
3. **Core control** — Stun · Blind (have) · Chill→Frozen · Slow.

Then, as the class-engine pass needs them: the QUANTA probability suite, the full meta layer, and the
remaining phase-transition chains.
