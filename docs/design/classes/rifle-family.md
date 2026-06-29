# Rifle — the class family (the Marksman: can you make the one shot?) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Family note for the five Rifle classes,
> designed **as a pair with the [Dual Pistols family](./dual-pistols-family.md)** (the two back-row
> ranged archetypes) so they never blur. Mirrors the other family notes; built on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). Frame + lanes are the proposal;
> ability content is skill-drafted (`proposed`).

## The organizing principle

Rifle is the **Marksman** (`party.ts`: `role: "Marksman"`, **back row**, **SPD-secondary**, `spd 9`,
`atk 15` — the highest base attack of the back line). It is the other ranged archetype — and the frame
splits it from the **Dual Pistols** (Gunslinger):

### Rifle = **THE ONE SHOT**; Pistols = **VOLUME OF FIRE**

The Marksman asks **"can you make the one shot?"** — the **decisive single round**: **precision**
(single-target burst, the headshot), **charge/aim** (a wind-up that loads a bigger shot — the ranged
cousin of the Greatsword's momentum), **the mark** (designate a target → bonus damage / execute), and
**first-strike** (SPD = act first, open the fight from max range, control distance). Where the
Gunslinger buries the line under fire, the Marksman **removes one target before it can act.** Pistols
spray; the Rifle *aims*.

**Shared Marksman DNA:** (1) **the aimed shot** — single-target precision burst, not volume; (2)
**charge/aim** — spend a beat to load a devastating shot (momentum, at range); (3) **the mark** —
designate a target for bonus damage / execute / signature application; (4) **first-strike / range
control** — SPD priority to act first, suppress, keep distance (fragility answer = strike first and
stay out of reach); reuse the Attunement's phase chain *as the decisive shot*. No new resource.

| × Rifle | Canon name | Primary + SPD | Seat (precision) | vs its Pistols cousin (volume) |
|---|---|---|---|---|
| **SOL** | Photon Vanguard | AGI+SPD | charged radiant **beam** — pierce, Burn/Blind at range | one charged lance, not Gunslinger's crit-spray |
| **NOX** | Terminus | STR+SPD | the freezing **kill-shot** — mark → Frozen → Shatter-shot, execute | single executing shot, not Cryovex's Chill-volley |
| **ANIMA** | Genewarden | VIT+SPD | precision **gene-injection** — mark → Infestation/mutation (**non-healer**) | single injection, not Sporecaster's spore-spray |
| **QUANTA** | Observer Prime | **SPD+SPD** | doubled-SPD flagship — **observe → collapse** a target's fate; first-strike | one collapse-shot, not Entropic Echo's ricochet-volley |
| **UMBRAXIS** | Astrolancer | DEF+SPD | gravity **lance** — piercing charged shot, Anchor/Drain at range | single piercing lance, not Orbitalist's clustering volley |

**Cohesion:** all five share SPD-secondary + the Marksman DNA (aimed shot / charge / mark / first-strike);
the primary sets the role. **QUANTA is the doubled-SPD flagship.** *(Distinctness watch: QUANTA Observer
Prime is SPD+SPD like the melee **The Anomaly** — but Observer Prime is the ranged precision observer
[mark→collapse→shot, first-strike], the Anomaly the melee turn-economy assassin [steal turns]; different
row, different mechanic.)*

## Per-class sketches (3 lanes: a charged-shot/precision lane · a mark/execute lane · a first-strike/range-control lane)

### SOL · Photon Vanguard — charged radiant beam *(the existing animation test class — Photon Beam fits Lane A)*
- **A · Photon Lance** — charge a radiant **beam** that pierces the line; Burn on hit.
- **B · Sunmark** — mark a target (**Scorched**/**Blind**), then detonate the mark.
- **C · Overwatch** — first-strike suppressing fire, **Haste**, hold the angle. Pure offense, no guard.

### NOX · Terminus — the freezing kill-shot (the long-range executioner)
- **A · Killshot** — a charged freezing round; bonus vs low-HP — the execute.
- **B · Cold Mark** — mark → **Frozen**/**Brittle**, then a **Shatter-shot** detonates it.
- **C · Zero Point** — range-control: **time-lock**, attack-bar drag, the absolute-zero finality. NOX banks.

### ANIMA · Genewarden — precision gene-injection (non-healer)
- **A · Gene Shot** — a precise round that injects **Infestation** and evolves it (Seed→Bloom→Overgrowth).
- **B · Mark of the Strain** — mark → contagion-execute; the strain spreads from the marked corpse.
- **C · Adaptive Watch** — **adapt** resistances + first-strike overwatch; durable. Self-sustain only ([ledger #16](../attunement-mechanics.md)).

### QUANTA · Observer Prime — doubled-SPD observer (math/physics register, no gambling)
- **A · Collapse Shot** — **observe** the target, then **collapse** its fate to a guaranteed maximal hit.
- **B · Doom Mark** — mark → **Doom** + **Decohere**; resolve the determined shot.
- **C · First Observation** — **foresight**/first-strike: act before the line, pre-empt the enemy's move.

### UMBRAXIS · Astrolancer — gravity lance
- **A · Gravity Lance** — charge a piercing gravity-shot that **Anchors** what it hits.
- **B · Lance Mark** — mark → **Drain**/**Crush** from range; siphon the marked target.
- **C · Orbit Hold** — range-control: **Anchor**/event-horizon + **Mass armor**; durable, conservation.

## Open flags
- Confirm the **Rifle (precision) vs Pistols (volume)** split as the differentiator for the ranged pair.
- **QUANTA Observer Prime ↔ The Anomaly** (both SPD+SPD): ranged precision-observer vs melee turn-economy assassin — confirm.
- **ANIMA Genewarden** kept a **non-healer** (ledger #16).
- **SOL Photon Vanguard** is the existing combat-animation test class (`photonBeam`); Lane A (Photon Lance) is the natural home for that ability when wired.
