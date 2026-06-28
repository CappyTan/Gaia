# Attunement Mechanics Framework — PROPOSAL (pending Dara's blessing)

> **Status: DRAFT PROPOSAL — NOT yet canon.** This is a working design framework for a *larger
> suite of combat mechanics* grounded in Gaia's five core physics concepts, so class design has a
> shared vocabulary to draw on. **Attunement identity, mechanics, and lore are Dara's lane**
> (per `CLAUDE.md`): everything here is drafted by an agent + the dev and **awaits Dara's
> ratification**. Nothing here is written into `CONTEXT.md` (the ratified glossary) until he
> blesses it. Track open approvals in the **Approval Ledger** at the bottom.
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

### Two reframes this implies (both need Dara)

- **ANIMA: from "biology" to a peer principle.** Reframed as *adaptive negentropy / emergence* —
  order maintained through **change** (vs NOX's order through **stasis**). Same enemy (entropy),
  opposite method, which is *why NOX beats ANIMA*. Shifts ANIMA's mechanical identity away from
  generic poison/heal toward **evolution / adaptation / replication / metabolism**.
- **NOX: "Decay" is cold *cessation*, not rot.** NOX is anti-entropy, so its signature DoT is not
  putrefaction (a disorder-increasing, ANIMA-ish idea) but the victim's motion/animation **winding
  down toward absolute zero** — being *frozen / stilled / arrested*, not rotted. (The engine status
  keyword `decay` can stay; only its *meaning* for NOX is being fixed. A rename — e.g. "Stasis" —
  is an open option in the ledger.)

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

> *To be fleshed out in the ongoing grill — each attunement gets its family across the five layers.*

- **SOL (Spread)** — _TBD_
- **NOX (Freeze)** — _TBD_
- **ANIMA (Grow)** — _TBD_
- **UMBRAXIS (Pull)** — _TBD_
- **QUANTA (Collapse)** — _TBD_

---

## Approval Ledger — what needs Dara's blessing

Legend: **canon** = already ratified · **proposed** = drafted here, needs Dara · **open** = undecided.

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | One unifying principle per attunement (facets are flavor) | proposed | Implied by canon; making it explicit |
| 2 | "Five stances on entropy" as the framework spine + per-attunement verb | proposed | Spread/Freeze/Grow/Pull/Collapse |
| 3 | **ANIMA reframe** → adaptive negentropy/emergence (evolution/adaptation/replication) | proposed | Biggest identity shift; Dara's call |
| 4 | **NOX "Decay" reframe** → cold cessation/stasis, not rot | proposed | Meaning fix; keyword may stay |
| 5 | NOX "Decay" → possible **rename** (e.g. "Stasis") | open | Only if Dara wants the keyword changed |
| 6 | Full-spectrum mechanic layers (status/action-economy/stat/meta/economy) | proposed | Framework scope |
| 7 | Cross-cutting families: conservation/transfer, resonance/interference, phase-transition | proposed | Dev loves these; Dara to bless |
| 8 | Per-attunement mechanic suites | open | Being drafted in the grill |
