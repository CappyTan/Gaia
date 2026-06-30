# Endgame Mechanics — the five pillars *above* Archon Type I (TRACKED BACKLOG)

> **Status: TRACKED / FUTURE SCOPE (Dara, 2026-06-30).** A running record of the endgame combat
> mechanics that live **beyond** where our skill trees currently stop. Not built, not designed in
> detail — this doc exists so the five concepts are captured, anchored to the canon that already
> describes them, and not lost between sessions. We expand into these **later, deeper into
> development**, when battles start to "push the limits of our encounter system."

## Where the trees end today — the Archon Type I milestone

Our [Class System Model](./README.md) runs one progression axis (**MNA**) from 0 → 100:

- The **52-slot tree** (auto + 20 specials + 18 signatures + 4 ultimates + 9 passives) is fully
  spent by **MNA 100**.
- At **100** the signature cadence stops and you **pick 2 of 4 ultimates** — your first ultimate
  abilities.
- Reaching **+100 MNA = Archon Type I** ("Mortal Mastery" — full mastery of a single Attunement;
  see [REQUIEM battle-mechanics](../requiem/battle-mechanics.md)). **This is our first milestone, and
  as of now the tree ends here.**

Everything below is what comes *after* that ceiling. (Canon note: MNA already scales 0 → 200 — a
0–100 *leveling* band and a 100–200 *gear* band — so the endgame layer is **gear/drop-gated**, not
level-gated.)

## The five pillars (post-Archon-I)

Listed in Dara's order. Items 1–3 and 5 already have canonical sketches in
[REQUIEM battle-mechanics.md](../requiem/battle-mechanics.md) (Ascension · Soul Burn · Harmonic
Ascension · Archon Types); #4 is a newer concept that builds on our **party-shared resource economy**.

| # | Pillar | One-line intent | Canon anchor |
|---|---|---|---|
| 1 | **Ascension** | A gear-gated **proc gate** — when it fires (or is force-cast by rare gear) you enter an ascended state of magnified power; the prerequisite that *unlocks* Soul Burn. | REQUIEM b-m §Ascension |
| 2 | **Soul Burn (while ascended)** | Convert **self-inflicted life-drain into an output multiplier** — dangerous, but spikes DPS/HPS. Available *while in Ascension*. Turns even healers into a damage lever. | REQUIEM b-m §Soul Burn |
| 3 | **Harmonic Ascension** | A **two-player co-op super**: two allies who **harmonize attunements** *and* **proc Ascension on the exact same instant** combine into power far greater than the sum. | REQUIEM b-m §Harmonic Ascension |
| 4 | **Cross-class combo system** | Chained abilities **across different classes** that combine into a payoff no single class can produce — the team-play layer on top of our shared-resource economy. | *New — to design* |
| 5 | **Archon Type II** | **Dual Convergence** — a being who partially embodies **two** faction archetypes at once (a "living paradox"), wielding a blended kit beyond single-attunement mastery. | REQUIEM b-m §Archon Types |

### How they stack

A rough dependency read (to be confirmed when we design them):

- **Ascension (1)** is the gate. **Soul Burn (2)** rides *inside* it. **Harmonic Ascension (3)** is two
  players hitting Ascension together — so 1 is the foundation for 2 and 3.
- **Cross-class combo (4)** is orthogonal — a team-sequencing layer that can exist independently but
  pairs naturally with Harmonic Ascension's "two players in alignment" idea.
- **Archon Type II (5)** is the *identity/progression* ceiling above Archon Type I — it changes **who
  you are** (two attunements), where 1–4 change **what a fight does**. (REQUIEM also reserves **Archon
  Type III** as "intentionally mysterious" — noted, not in scope here.)

## Why this is parked, not built

- The **52-slot single-attunement tree** is the slice we're authoring now; these five are the layer
  *above* it and would each warrant their own grill + ADR.
- Several require **systems we haven't built**: an Ascension proc/state, life-drain-as-multiplier
  math, two-player synchronization (Harmonic), a cross-class sequencing engine, and dual-attunement
  characters (Type II breaks the "one weapon = one attunement = one class" assumption).
- They're explicitly the **encounter-pushing** endgame — they only matter once base combat and the
  encounter system are mature enough to be pushed.

## When we pick these up

Each pillar, when its time comes, should get: a `/grill-me` design session → an **ADR** (it's a
hard-to-reverse systems decision) → engine wiring. Reconcile toward **REQUIEM** canon for 1–3 and 5
(it already describes them); **#4 (cross-class combo)** is the one genuine greenfield design of the
five. **Dara owns the class/ability/lore design; agents support.**

> **Process note for future sessions:** this is a *tracking* doc. When any pillar moves from "parked"
> to "in design," update its row here with a link to its ADR/spec so this stays the index of the
> endgame layer.
