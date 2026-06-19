# The Attunement Affinity Ring — ratified design + roadmap

Dara's review (rated 9/10) ratifies the five-power affinity ring as a core pillar. This note
records the ratified rules, the tuning we ship today, and the systems flagged for when we build
the wider game. **REQUIEM remains canon;** this is the affinity layer of it.

## The ring (ratified)

```
SOL → NOX → ANIMA → QUANTA → UMBRAXIS → SOL
```

Each Attunement **beats the next** and is **weak to the previous**. So every power has exactly
**1 prey, 1 predator, 2 neutral matchups, and 1 mirror** — no attunement is ever universally best
or completely invalid. Implemented in `data/attunements.ts` (`RING`) + `systems/affinity.ts`.

### Lore rationale (why each matchup makes thematic sense)
- **SOL beats NOX** — Light/expansion/entropy breaks NOX's frozen Preservation. *Entropy beats Order.*
- **NOX beats ANIMA** — Preservation freezes growth; life requires change. *Preservation beats Evolution.*
- **ANIMA beats QUANTA** — Living systems adapt around rigid math. *Life beats Calculation.*
- **QUANTA beats UMBRAXIS** — Observation/probability collapses spacetime uncertainty. *Probability beats Singularity.*
- **UMBRAXIS beats SOL** — Gravity collapses light; stars become black holes. *Gravity beats Light.* (the strongest matchup in the ring)

## Tuning we ship (v0.35) — modest ±15%

| Matchup | Damage modifier |
|---|---|
| Strong against (your prey) | **×1.15** (deal +15%; and you take −15% from prey, since the prey is the *weak* attacker) |
| Weak against (your predator) | **×0.85** (deal −15%; take +15%) |
| Neutral / mirror | ×1.0 |

Total swing ≈ **30%** between attacking your prey vs your predator. This is a deliberate move
**away from the old ×1.5/×0.5 (±50%)**, which Dara flagged as too deterministic — it made
attunement dominate class and gear choices. At ±15%, matchup is a real lever but **gear and skill
matter more**. A single per-attack multiplier captures both the "deal more" and "take less" sides
because affinity is evaluated per attacker→defender direction.

Enemy/boss numbers are retuned to this gentler affinity (softer affinity removed the enemy burst
that drove most wipes) via `balance-sim.ts`.

## Already true in the POC (ratified, no work needed)
- **Loot inherits attunement** → a Mythic SOL sword is great vs NOX, average elsewhere, weak vs
  UMBRAXIS: desirable but never mandatory. No single BiS weapon invalidates the rest.
- **Build-your-own party** across attunements → comps already have matchup texture.
- **One zone boss off-mirror** (Cave Troll = NOX) so the final fight rewards the right comp.

## Flagged for future systems (not built — for when we get there)
1. **Continent identity.** Bias each continent's bestiary toward one attunement so players *want*
   the counter (Greenvale → ANIMA-leaning ⇒ bring NOX; Drowned Vault → NOX-leaning ⇒ bring SOL;
   Quantum Observatory → UMBRAXIS ⇒ bring QUANTA). Encourages collecting multiple teams and
   revisiting zones. *POC note:* the two starter zones are currently attunement-**spread** (for
   matchup variety in a 2-zone slice); continent identity is a deliberate later layer as the
   continent map fills out — it is NOT a return to any single-power bias.
2. **Rotating raid/endgame bosses** by attunement → players rotate rosters (Raid Boss UMBRAXIS ⇒
   QUANTA shines; next week NOX ⇒ SOL shines). The answer to "why collect 45 classes if I need 5."
3. **Corrupted Attunements** — a unit that counts as 50% one power + 50% another (e.g. Corrupted
   SOL = 50% SOL / 50% UMBRAXIS), so matchup certainty breaks down. Needs the affinity fn to accept
   blended attunements (today it's single-attunement per unit). Endgame spice.
4. **PvP drafting** — the ring creates natural counter-draft once PvP exists.

## Open
- Per-attunement **signature effects** (burn/decay/poison/drain/none) are an invented POC
  placeholder; reconcile against REQUIEM's full per-attunement kits over time.
