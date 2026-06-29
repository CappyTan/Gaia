---
name: class-spec-review
description: The validation playbook for Gaia's greenfield class design specs (docs/design/classes/<attunement>-<archetype>.md) — the distilled, gradeable rubric the class-spec-reviewer grades against and the build-class skill self-checks toward. Turns the Class System Model (52-slot contract), the ratified Attunement Mechanics Framework (five stances on entropy), and the Stat System V3 / ADR 0014 (primary←attunement, secondary←archetype, Matter/Energy typing) into concrete per-lens pass/fail rules across seven lenses. Lens 1 (structure) is a deterministic linter wired into the test gate; Lenses 2–7 are judgment lenses reported as advisory findings. Use when reviewing or auditing one class spec or the whole 45-seat roster. NOT the shipped engine kits (that's class-kit-reviewer) and NOT balance numbers (that's balance-tuner — specs are numberless by design).
---

# Class-Spec Review skill — validating the 45 class designs across every lens

The one repeatable rubric for the **greenfield class design specs** in
[`docs/design/classes/`](../../../docs/design/classes/). It distills the three canon docs every spec
must answer to into concrete, gradeable rules. The north star: **all 45 classes (5 Attunements × 9
Weapon Archetypes) are mechanically sound, on-theme, internally distinct, and a non-overlapping seat
in the roster — before any of it is engine-wired.**

**Two audiences, one rubric.** The **`build-class`** skill *self-checks* toward this when authoring;
the **`class-spec-reviewer`** agent *grades against* it. Each check is written to be graded
**[Blocking] / [Should-fix] / [Polish]**.

- **Read first (the canon this grades against):**
  - [`docs/design/classes/README.md`](../../../docs/design/classes/README.md) — the **Class System
    Model** (52 slots, 3 lanes, MNA economy, the 8 hard invariants).
  - [`docs/design/attunement-mechanics.md`](../../../docs/design/attunement-mechanics.md) — **ratified**
    per-attunement mechanic suites (signature status, economy archetype, lexicon, showcase chain).
  - [`docs/design/stat-system.md`](../../../docs/design/stat-system.md) + [ADR 0014](../../../docs/adr/0014-secondary-stats-matter-energy-final-20.md)
    — primary/secondary stats, the S/A/B/C/D ring, the final-20 substats, **Matter vs Energy** typing.
  - [`CONTEXT.md`](../../../CONTEXT.md) — the exact domain vocabulary.
  - The relevant **`*-family.md`** note (the weapon family's "non-overlapping seats" frame).
- **Scope:** the *numberless design* of a class — structure, theme, role, distinctness, canon.
  It is **NOT** balance/magnitudes (numberless by design → `balance-tuner` post-wiring), **NOT** the
  shipped `requiem-kits.ts` engine kits (→ `class-kit-reviewer`), and **NOT** prose voice
  (→ `narrative-reviewer`). Spot a cross-lane issue, name it, hand it off.

## Two modes

- **Single-spec** (reviewing one new/changed `*.md`): Lenses **1–4, 6**, plus the *eager* slice of
  Lens 5 — load the spec's **family** (same weapon, 5 attunements) and its **attunement-mates** (same
  attunement, 9 archetypes) and confirm it doesn't collapse into an existing seat.
- **Roster audit** (auditing the whole set): Lenses **5 & 7** across all specs + the global
  name-uniqueness sweep, refreshing [`ROSTER.md`](../../../docs/design/classes/ROSTER.md). Against a
  partial roster this is a **gap report**, never a gate — incompleteness is expected, not a fault.

---

## Lens 1 · Structure — the 52-slot invariants *(DETERMINISTIC — the linter owns this)*

**Run `npm run lint:classes`.** It checks the mechanical subset across all specs and is wired into
`npm test` as a hard gate. A linter **✗ is [Blocking]** — do not pass the spec. The linter covers:

- Exactly **1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives** (= 52).
- Every special milestone @ MNA **5/15/…/95** and signature @ **10/20/…/90**, each with **exactly 2
  options**; no off-curve milestones.
- **≥2-lane guarantee:** no single lane (A/B/C) is offered at *every* milestone of a tier.
- Declared lane-pair `*(A/B)*` matches the two options' lanes.
- Every special/signature/passive **lane-tagged**; ultimates = **3 laned + 1 neutral**.
- **Economy one-way:** specials & auto **generate** (never cost); signatures & ultimates **cost**
  (never generate).
- `type` ∈ `phys · mag · heal · buff · util · passive`.
- **Global ability-name uniqueness** across *all* specs (the cross-file check humans miss).

**The judgment half of structure (you grade, the linter can't):** are a milestone's **2 options a
real tradeoff** (each better for a different build/gear/party), not strictly-better? Is the lane
rotation *meaningfully* ≥2-lane, or technically-legal-but-degenerate? → **[Should-fix]**.

## Lens 2 · Attunement-mechanics fidelity *(judgment)*

Grade against the **ratified suite** for the spec's attunement in `attunement-mechanics.md`:

- **Signature status** is the right one and named on-theme: SOL **Burn** · NOX **Stasis** *(cold
  cessation — NOT rot/decay; engine keyword `decay` may persist but the concept is Stasis)* · ANIMA
  **Infestation** *(living contagion, not generic poison)* · UMBRAXIS **Drain** · QUANTA **Doom**
  *(a delayed determined hit — nothing ticks)*. A wrong/off-theme signature is **[Blocking]**.
- **Economy archetype** matches: NOX **banks** · SOL **runs hot** (use-or-lose) · ANIMA **compounds**
  · UMBRAXIS **transfers** (conservation — fed by what it drains) · QUANTA **gambles** (fluctuates).
- **Principle reads** across the kit (the five verbs): SOL **Spread** · NOX **Freeze** · ANIMA
  **Grow** · UMBRAXIS **Pull** · QUANTA **Collapse**. Abilities should be readable expressions of it,
  spanning the layers (status / action-economy / stat / meta / economy) — not all one note.
- The **showcase phase-transition** (e.g. Chill→Frozen→Shatter, Overheat→Ignite→Detonate,
  Seed→Bloom→Overgrowth, Singularity, Superposition→Collapse) is present or deliberately echoed.
- **Lexicon** leans on the attunement's flavor words. Off-lexicon naming → **[Polish]**.

## Lens 3 · Stat-system fidelity + Matter/Energy typing *(judgment)*

- **Derived stats correct:** primary ← attunement (SOL=AGI, NOX=STR, ANIMA=VIT, QUANTA=SPD,
  UMBRAXIS=DEF), secondary ← archetype (per `stat-system.md` §6). Wrong → **[Blocking]** (linter
  doesn't check the Identity prose; you do).
- **Lanes key off distinct stats/substats** so gear & party tip the optimum (the off-stat-build
  promise) — a lane that keys off nothing, or all three lanes keying the same stat, is **[Should-fix]**.
- **Matter/Energy typing (per-class):** every ability is correctly typed (`phys`=Matter,
  `mag`=Energy), and the kit's lean **matches its archetype + attunement fantasy** — a Hammer leaning
  Matter and a Staff leaning Energy is *correct*. Flag **accidental** mono-typing, especially a
  Spellblade (the explicit AGI/VIT hybrid) that came out all-`phys`, or a caster that's all-`phys`.
  This is **[Should-fix]**, not a 50/50 quota.

## Lens 4 · Lane / role-fantasy quality *(judgment)*

- The kit **reads unmistakably as its class** (fantasy paragraph delivered by the actual abilities).
- **3 lanes are genuinely distinct** identities with different team roles — not three flavors of DPS.
- **No dead rungs:** every milestone pick is worth taking at the MNA it unlocks; early picks usable.
- **A memorable signature + a real ultimate payoff** — at least one ability you build around.
- Weak lane / dead rung / forgettable capstone → **[Should-fix]**.

## Lens 5 · Cross-class distinctness — the non-overlapping seat *(judgment; eager per-spec)*

- Within the **weapon family** (5 attunements, one weapon — see the `*-family.md` note): the spec
  occupies its own seat — the family's organizing question answered *differently* by this attunement
  (e.g. Hammer's "five physics of the blow": NOX=control, SOL=AoE-burst, ANIMA=sustain, QUANTA=fate,
  UMBRAXIS=gravity-bruiser). A spec that duplicates a sibling's seat → **[Should-fix]**.
- Within the **attunement** (9 archetypes, one attunement): the weapon changes the *delivery*, not
  just the paint — the spec is distinct from its attunement-mates.
- **No shared ability names** with any sibling (the linter enforces globally; here you catch
  *conceptual* near-dupes the linter can't — two "different-named but identical" abilities).

## Lens 6 · Canon & vocabulary *(judgment; defer to requiem-canon-keeper)*

- **REQUIEM truth + CONTEXT.md vocabulary** — class name matches canon (`data/classes.ts`
  `CLASS_NAMES` / REQUIEM), Attunement/Archetype terms exact, no "element"/"school"/"weapon class"
  slips. Route canon-truth questions to **`requiem-canon-keeper`** rather than re-adjudicating.
- **`phys`/`mag` → Matter/Energy reconciliation:** specs use the engine-legacy `type` words while
  ADR 0014 canon is **Matter/Energy**. Flag whether a spec should adopt the canon terms — a
  vocabulary **[Should-fix]** for Dara to rule on, not a unilateral rewrite.

## Lens 7 · Coverage / completeness — the roster matrix *(judgment; roster mode)*

- **Seat coverage:** which of the 45 (Attunement × Archetype) exist; which families are complete;
  which seats are empty. Report as a matrix → refresh `ROSTER.md`. Missing seats are **tracked gaps,
  never Blocking.**
- **Matter/Energy roster balance:** across the built specs, are **both** damage types well-represented
  so itemization's Matter-vs-Energy offense (Mpn/Epn) and defense (Mrd/Erd) substats both have real
  targets? An accidental Matter-monoculture → **[Should-fix]** flag for the roster, with the gap named.
- **Family role-coverage:** within each built family, are the five seats spread across roles
  (control / burst / sustain / tempo / tank), or clustered?

---

## Output

A prioritized findings list — **[Blocking] / [Should-fix] / [Polish]** — each tagged with its **lens**,
a `file:section` ref, the problem, and a concrete fix. Lead with the **linter result** (Lens 1) and a
**per-lens ✓/✗ roll-up** so Dara reads state at a glance. **Lens 1 ✗ blocks; Lenses 2–7 are advisory —
Dara rules on design taste** (per CLAUDE.md). End with **ship / ship-with-fixes / needs-work**, the top
fix, and any canon question routed to `requiem-canon-keeper`. In roster mode, also write `ROSTER.md`.
