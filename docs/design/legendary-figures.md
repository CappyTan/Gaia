# Legendary Figures of Gaia

**Dara owns the world and lore; this catalogs his canon.** Legendary Figures are named, singular
beings of extraordinary power that exist *above* the ordinary scale of the world — some human, some
monster, some neither. They are not the party and not the regular bestiary, and they operate on a
power scale far above ordinary combatants (the affinity ring **still applies** to them, though — see
below). They are added **as we go**; each gets an entry here as Dara provides it.

This doc is the **roster + canon record**. Where a figure maps onto an existing REQUIEM class, the
tie-in is noted (REQUIEM remains canon — see [`requiem/`](requiem/README.md)). Anything an agent
infers beyond Dara's text is marked **(proposed)** and stays subordinate to his canon.

---

## What a Legendary Figure *is* (working definition)

- **Singular & named.** One being, not a species. (The bestiary in `data/enemies.ts` is the
  ordinary roster; Legendary Figures are a tier above — closer in spirit to the rare/treasure
  monsters and bosses, but mythic in scope.)
- **Beyond the ordinary power scale.** Their strength can be world- or era-spanning. A Legendary
  Figure can plausibly overcome things an ordinary combatant of their Attunement never could.
- **Still bound by the affinity ring — but power can override it (Dara).** The [affinity ring](affinity-ring.md)
  **still applies** to Legendary Figures: a NOX legendary is still weak to a SOL legendary, and so on.
  What sets them apart is that they vary **wildly** in raw power — so a figure strong enough **may
  overcome an attunement disadvantage by sheer power**. It does **not** *ignore* or *transcend* the
  ring; it **out-muscles** a matchup it should lose. (A weaker legendary still loses to its predator;
  only a vast power gap flips the result. First demonstrated by The Last Lagrangian; see his entry.)
- **A thread, not a stat block.** Each figure carries a story hook (who they hunt, what they guard,
  why they wander). How/whether they ever appear in-game (boss, cameo, questline) is a later
  decision — first they exist as canon.

> **Not yet implemented in the POC.** These are lore entries. None are wired into `data/` yet;
> when/if one becomes a fight, it'll be built then and balanced like any boss.

---

## Combat behavior — Ascension as a temporary enrage (DESIGN OPTION, not built)

> **Status: OPTION — logged by Dara, not yet designed or built. Surface this when we design
> late-game enemy encounters** (the encounter-designer + `dungeon-design`/`overworld-design`
> passes for end-game zones).

When a Legendary NPC is fought, it **may** be able to trigger its own **Ascension** — borrowing the
hero [Ascension / Soul Burn](battle-system-2.0.md) idea as an **NPC-side "temporary enrage."** The
intent (Dara):

- **A *maybe*, not a guarantee.** Like the hero Ascension proc, it's a **chance per turn**, not a
  scripted phase. Some fights it fires; some it never does — that randomness is the point (it makes
  each encounter with the figure feel different and tense).
- **Buffs + debuffs, similar in spirit to hero Ascension/Soul Burn** (a damage/speed/throughput
  spike), but **NOT the same numbers.** The **damage scaling and the per-turn HP cost** are tuned
  *for the NPC*, independent of how Soul Burn drains/scales a hero — an enemy shouldn't melt itself
  on the hero formula, and its burst shouldn't be the hero's either.
- **Distinct from the existing boss "Omega" enrage.** Today's `triggerEnrage` (in
  `controllers/battle.ts`) is **deterministic** — it fires once at ≤20% HP and is permanent
  (double ATB + double damage, art swap to the Omega sprite). This proposed mechanic is
  **probabilistic and temporary** — a windowed buff that can come and go (and could fire more than
  once a fight). They can coexist; this is a *new* axis, not a replacement.
- **Scope:** reserved for **certain Legendary NPCs** (e.g. The Last Lagrangian), not ordinary
  bosses/elites — it's part of what makes a Legendary Figure feel above the normal scale.

**Open questions for when we design it:** proc chance + duration (mirror Ascension's "≥5 turns,
then 50%/turn to drop"? or its own curve); the exact buff set and its per-turn self-cost (if any);
whether it should telegraph (so the player can react/burst) or surprise; and how it reads on the
battle screen (a clear "ENRAGED/ASCENDED" state, reusing the enrage VFX language).

---

## Roster

| Figure | Attunement | Archetype / Class | Nature | Status |
|---|---|---|---|---|
| **The Last Lagrangian** | UMBRAXIS | Dual Daggers — *The Lagrangian* (REQUIEM) | The Wandering Assassin | Canon (Dara) |

*(More to come — Dara adds figures over time; some human, some monster, some non-human.)*

---

## The Last Lagrangian — "The Wandering Assassin"

*Reference art: [`assets/reference/legendary-the-last-lagrangian.png`](../../assets/reference/legendary-the-last-lagrangian.png) (Dara's sheet).*

> *"All things end. I simply… accelerate the truth."*

**Attunement:** UMBRAXIS (beyond-high mana attunement) — Gravity · Spacetime · Singularities ·
Cosmic Structure.
**Class tie-in:** he is the legendary exemplar of the REQUIEM Umbraxis × Dual-Daggers class
**[The Lagrangian](requiem/REQUIEM-classes.md)** — *Phase Assassin*, resource **Lagrange Nodes**,
whose kit is weightless phase-stabs, node-blink stealth, and *Libration Point Execution* (an
armor-ignoring True-Damage strike that erases its target). The Last Lagrangian is what that class
becomes at the apex of the world.

He is the final equation — the unmatched variable. Where all paths converge, he walks alone. Over a
thousand years since his existence was first recorded (*if* "recorded" is the word), civilizations
have risen, burned, and crumbled; stars have been born and died. Through it all, he remains.

He does not seek power or revenge. He simply **ensures the balance of what must be** — the keeper of
inevitability, cutting away anomalies that threaten the structure of existence itself. He is not a
hero. He is not a villain. **He is the conclusion.**

### Attributes (from Dara's sheet)
- **Age:** Unknown — *walks between all things; the end is his origin.*
- **Origin:** The Endpoint — *born from the collapse of the final constant.*
- **Nature:** Entropic — *he breaks where laws grow thin.*
- **Allegiance:** None — *bound to no king, god, or cause.*
- **Purpose:** Observance — *he removes what should not exist.*
- **Level:** Beyond — *start and end, cause and effect, light and dark.*
- *"Long ago, Umbraxis gifted me with sight beyond sight."*

### The Twin Singularities — *"The Only Constant is Erasure"*
Twin daggers forged from the edges of collapsed stars; they distort spacetime with every strike.
They do not just cut flesh — **they sever probability, erasing the target from all possible
futures.** (This is the Twin-Singularities flavor of the class's *Lagrange Nodes* / *Libration Point
Execution*.)

### The hunt — and the affinity inversion
For the last ~1000 years he has obscured himself across the world while **hunting a single unknown
entity**. Legend holds his quarry is a **QUANTA-attuned Legendary Figure** — and that the Quanta
figure is the one **running**.

This is the striking part, and a deliberate canon point:

- On the [affinity ring](affinity-ring.md), **QUANTA beats UMBRAXIS** ("Probability beats
  Singularity"). By the ring he *genuinely* holds an **elemental disadvantage** to his prey — and the
  ring still applies to him; it is not switched off.
- Yet his raw power so far **eclipses** hers that he **overcomes** that disadvantage by sheer force —
  the predator/prey relationship effectively inverts and the Quanta figure flees. This is the canon
  example of the rule: Legendary Figures are **still bound by the ring**, but a vast enough power gap
  can **out-muscle** an unfavorable matchup. (A QUANTA legendary of *comparable* power would still
  have the edge on him.)
- **(Proposed thematic reconciliation — for Dara to confirm/adjust):** it is *fitting* that the one
  Umbraxis being who can run down a Quanta entity is the assassin whose daggers **"sever
  probability"** — he has learned to turn his predator's own weapon (probability/observation)
  against it. The thing that should counter Umbraxis is the very thing he erases.

### Timeline of Whispers (from the sheet)
| When | Event |
|---|---|
| **1133 years ago — The First Record** | A name appears in a flying civilization's final chronicle. |
| **999 years ago — The Fall of Kadrig** | An empire erased in a night. No survivors. Only silence. |
| **840 years ago — The Void Contract** | He makes a pact — not with a god, but with *nothing*. |
| **529 years ago — The Star Plague** | A cluster of stars vanishes; witnesses speak of twin comets. |
| **412 years ago — The Cindered War** | He fights in a war that never was, and never will be. |
| **210 years ago — The Forbidden Archive** | All records of him are buried across reality — except these. |
| **Present — Now** | He walks again. None know where. None know why. |

### Open hooks (for Dara)
- **Who is the Quanta quarry?** The next Legendary Figure to define — the one who runs.
- **Does he ever cross the party's path?** Cameo, omen, optional super-boss, or purely background myth?
- **What was the Void Contract** ("a pact with nothing"), and what did it cost/grant?
