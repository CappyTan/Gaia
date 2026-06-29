---
name: build-class
description: Author a complete greenfield class design spec for Gaia — one Attunement × Weapon Archetype — following the 52-slot class system model (auto + 20 specials + 18 signatures + 4 ultimates + 9 passives, 3-lane rotating choices, MNA-gated, party-shared resource economy). Use when building or reworking a class's ability tree, e.g. "build the NOX dual swords class", "spec out a SOL staff", "design <class>'s kit". Produces docs/design/classes/<attunement>-<archetype>.md.
---

Author a **complete class design spec** for one Gaia class (one Attunement × one Weapon Archetype),
following the canonical [Class System Model](../../../docs/design/classes/README.md). **Read that
model first every time** — it is the contract. This skill is hybrid: the designer supplies the
class identity (and optionally a brief of must-have concepts/lore/abilities); you draft the full
spec as a **proposal for review**, clearly marking what you invented.

Output: `docs/design/classes/<attunement>-<archetype>.md` (e.g. `nox-dual-swords.md`).
**One class per run.**

## Inputs

- **Required:** attunement (SOL/NOX/ANIMA/QUANTA/UMBRAXIS) + weapon archetype (one of the 9).
- **Optional brief:** any concepts, lore, or specific abilities the designer already has. Treat
  everything in the brief as **`from-brief` — locked canon, preserved verbatim, never overwritten.**

## Process — two approval gates

Do not skip the gates. Gate 1 is where the designer's taste matters most; never write abilities
before lanes are approved.

### Gate 0 — auto-fill the derived fields (no choices)

From the model's tables, fill and state:
- **Class name** — reuse the existing canon name (`data/classes.ts` `CLASS_NAMES` / REQUIEM); invent
  only for an unnamed combo.
- **Primary stat** ← attunement · **Secondary stat** ← archetype.
- **Resource** = the class's own attunement pool.
- **Attunement signature** (Burn/Decay/Poison/probability/Drain) to design on-theme.

### Gate 1 — Class DNA (STOP for approval)

Propose, then **wait for the designer to approve or edit**:
- A one-paragraph **class fantasy**.
- **3 lanes** (A/B/C), each with: a name, the build identity, **which stats/substats it keys off**,
  the **team role**, and **the gear + party situation it's best for** (so gear/party tip the
  optimum). Lanes must be genuinely distinct.
- The **build axes** the pairs trade along.
- Fold any `from-brief` lore/concepts into the relevant lane here.

Do not proceed to Gate 2 until lanes are locked.

### Gate 2 — the kit (draft → review → write)

With lanes locked, draft all 52 entries per the schema, then let the designer redline before writing.

- **Auto-attack** (unlaned): free, `cd none`, generates **minor** own-attunement resource.
- **20 specials** across milestones 5/15/25/35/45/55/65/75/85/95 (2 options each): workhorse
  buttons, **generate** resource (minor/moderate/major), may have cooldowns, **never cost**.
- **18 signatures** across 10/20/30/40/50/60/70/80/90 (2 options each): class-defining high-impact
  abilities, **cost** resource (low/med/high), may have cooldowns, **never generate**.
- **4 ultimates** @100 (pick 2): 3 lane-aligned capstones + 1 neutral/fusion; all cost **high**, `cd
  long`.
- **9 passives** @30/60/90 (3 sets of 3, one per lane): always-on modifiers, no target/cost.

**Assigning the rotating 2-of-3 lane availability** (the core constraint):
- Each special/signature milestone draws its 2 options from a **lane-pair** (A/B, B/C, or A/C).
- Distribute lane-pairs so **no single lane appears at every milestone** (this is what forbids
  mono-laning). A simple safe pattern is to cycle `A/B → B/C → A/C → …` down the milestones; verify
  the result, don't trust the pattern blindly.
- Each option is the *that-lane* design of that milestone's choice — and the two options should be a
  **real tradeoff** (each clearly better for a different build/gear/party), not strictly-better.

**Provenance:** tag every entry `from-brief` or `proposed`. Never silently invent over supplied
content.

**Brief conflicts:** if supplied content can't fit the structure (e.g. 3 must-have signatures for
one lane but the rotation only fits 2), **stop and flag it for the designer to resolve** — do not
drop or mangle it.

### Validation — before writing the file

Self-check the hard invariants and report each ✓/✗. **Do not finalize on any ✗:**

1. Exactly 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives.
2. Every special/signature milestone has exactly 2 options on the correct MNA thresholds.
3. No lane appears in every milestone (≥2-lane guarantee holds).
4. Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral.
5. Derived fields correct (primary ← attunement, secondary ← archetype, threshold ← milestone).
6. Economy: specials generate-only, sig/ult cost-only, auto = minor trickle, all own-attunement.
7. Every entry has a provenance flag; `from-brief` content preserved verbatim.
8. **Ability names are globally unique** — no two entries share a name within this kit, **and** none
   collides with an ability name in any existing `docs/design/classes/*.md`. Grep the other specs
   before finalizing; rename collisions (reusing a flavor *concept* is fine, an exact *name* is not).

### After writing — gate + handoff

- **Run the deterministic gate:** `npm run lint:classes`. It re-checks invariants 1–8 mechanically
  across *all* specs (counts, milestones, lane rotation, economy one-way, type enum, and the global
  name-uniqueness sweep you can't eyeball). A **✗ is blocking** — fix the spec until it's green. This
  is the same gate `npm test` enforces in CI, so a red linter = a red build.
- **Recommend the review handoff:** the structural gate is only Lens 1. The judgment lenses
  (attunement-mechanics fidelity, stat/Matter-Energy typing, lane quality, distinctness, canon) are
  the **`class-spec-reviewer`** agent's job (rubric: `class-spec-review`). Tell the designer the spec
  is written + lint-green, and recommend running `class-spec-reviewer` for the design review.

## Output format

Match the worked example at [`docs/design/classes/nox-dual-swords.md`](../../../docs/design/classes/nox-dual-swords.md):
a header (class name, attunement × archetype, primary/secondary, resource, fantasy, 3 lanes + axes),
then the auto-attack, the special milestones, the signature milestones, the ultimate pool, and the
passive sets — each entry numberless and carrying the full schema, with provenance marked.

## Guardrails

- **Numberless.** No MP/power/durations/exact MNA — magnitudes are a later balance pass.
- **On-theme.** Default effects to the attunement's signature status; deviate only with reason.
- **Designer owns the design.** You draft and flag; the designer rules. Never bless invented content
  as canon without the gates.
- **Don't touch** `docs/design/requiem/` (verbatim source) or engine code — this skill writes design
  docs only.
