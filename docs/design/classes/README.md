# Class System Model — the 52-slot greenfield design

The canonical rules every Gaia class spec follows. This is the **source of truth** for the
class-progression design and the contract the **`build-class`** skill
([`.claude/skills/build-class/SKILL.md`](../../../.claude/skills/build-class/SKILL.md)) authors
against. One spec file per class lives beside this README as
`docs/design/classes/<attunement>-<archetype>.md`.

> **Relationship to REQUIEM.** This is the **greenfield successor** to REQUIEM's class-kit shape
> (the old *passive / 2–3 basics / 1–2 signatures / 1 ultimate* per class). Class *ability content*
> is built fresh here. The REQUIEM canon in [`docs/design/requiem/`](../requiem/README.md) stays
> **untouched as verbatim source** — the 5 attunements, 9 weapon archetypes, affinity ring, and
> per-attunement signature effects all carry over; only the per-class kit design is replaced.
>
> **Status: design canon, not yet engine-wired.** Specs are numberless design records. Translating
> them into `data/skills.ts` + `data/classes.ts` (and the new progression/choice/resource systems
> they imply) is downstream implementation work, tracked separately.

## What a class is

A class = one **Attunement** × one **Weapon Archetype** (5 × 9 = 45). The scaffolding is fixed; the
kit is greenfield. Character level caps at **100** (progression beyond 100 is future scope and is
**gear-gated**, not built now).

## The 52 authored entries per class

| Tier | Count | Grouping | Milestone (MNA threshold) | You end with |
|---|---|---|---|---|
| **Auto-attack** | 1 | — | innate (always available) | 1 |
| **Special skills** | 20 | 10 pairs | 5, 15, 25, 35, 45, 55, 65, 75, 85, 95 | 10 |
| **Signature abilities** | 18 | 9 pairs | 10, 20, 30, 40, 50, 60, 70, 80, 90 | 9 |
| **Ultimates** | 4 | 1 pool | 100 (**pick 2 of 4**) | 2 |
| **Passives** | 9 | 3 sets of 3 | 30, 60, 90 (**pick 1 of 3** each) | 3 |

At every special/signature milestone you **pick 1 of 2**. At 100 the signature cadence stops and is
replaced by the ultimate choice.

## The two progression axes (Model B)

There is **one master progression axis — MNA** — sourced from level early and from gear forever.

- **Character level** grants **base stats (HP / primary attributes)** and **intrinsic MNA**.
- **Total MNA = intrinsic (from level) + weapon (gear).** The equipped weapon sets the class
  (Attunement × Archetype) and carries intrinsic MNA in that attunement.
- **MNA is the single gate.** Each skill has an **MNA threshold = its milestone value**. The moment
  total MNA crosses a milestone you **bank a permanent pick** from that milestone's pair; the pick
  stays yours forever but goes **dormant** if total MNA later drops below its threshold.
- **Consequences (all intended):** a high-MNA weapon lets you *leap ahead* (use higher picks early);
  a low-MNA weapon needs more level to hold the same skills; **unequipping the weapon drops access**
  to the skills its MNA was enabling; a low-level character in a great weapon is a **twink** (big
  kit, squishy base stats).
- **Endgame:** past level 100 all further MNA — and any content beyond the 100 milestone — is gated
  by **gear/drops**. (MNA already scales 0→200 in canon: 0–100 leveling band, 100–200 gear band.)

A skill's MNA threshold is **derived from its milestone** by default; per-skill off-curve overrides
are allowed (a deliberate "this one's a reach") but should be rare.

## The 3-lane build model

Every class has **3 lanes** (named build identities). The anti-degeneracy rule: **you cannot
mono-lane.**

- Every special/signature milestone offers **exactly 2 options → pick 1**, but **which 2 lanes are
  on offer rotates** (some milestones are A/B, some B/C, some A/C). Counts are unchanged
  (10 milestones × 2 = 20 specials; 9 × 2 = 18 signatures).
- Because **no lane appears at every milestone**, the most you can invest in one lane is ~⅔ of picks
  — you are structurally forced into **≥ 2 lanes**. Touching all 3 is *encouraged by gear/party
  incentives, never forced*.
- Lanes are deliberately **keyed to different stats and team roles** so the best lane for you is
  tipped by your **gear** (which substats you've rolled) and your **party** (comp/synergies) — real,
  recurring decisions, not autopilot.
- **Ultimates:** 3 lane-aligned (one capstone per lane) + 1 neutral/fusion. Pick 2 of 4 at MNA 100.
- **Passives:** each set of 3 = one passive per lane (A/B/C); pick the lane to reinforce. You *may*
  triple-down on one lane in passives — the anti-mono force lives in the skill choices.

## Derived fields (auto-filled, never authored per class)

### Primary stat ← Attunement
| Attunement | Primary |
|---|---|
| SOL | AGI |
| NOX | STR |
| ANIMA | MGC |
| QUANTA | SPD |
| UMBRAXIS | DEF |

### Secondary stat ← Weapon Archetype
| Archetype | Secondary |
|---|---|
| Sword & Shield | DEF |
| Two-Handed Sword | STR |
| Hammer | STR |
| Dual Swords | AGI |
| Dual Daggers | SPD |
| Dual Pistols | AGI |
| Rifle | SPD |
| Staff | MGC |
| Spellblade | AGI *(tentative)* |

Both are **primary attributes** (STR / AGI / MGC / SPD / DEF) — a class scales on **two** of them
(primary from attunement, secondary from archetype). Some combos **collide** (e.g. SOL Dual Swords =
AGI + AGI, NOX Two-Handed = STR + STR) → a hyper-focused class; that's fine. *How* scaling works is
deferred to a balance pass.

## The MNA resource economy

Five **party-shared** resource pools, one per attunement (SOL / NOX / ANIMA / QUANTA / UMBRAXIS).

- **Auto-attack:** free, the only spammable thing; generates a **small** amount of own-attunement
  resource (idle income).
- **Special skills:** **generate** resource (own attunement), potentially multiple; may have
  cooldowns → not spammable.
- **Signatures & Ultimates:** **cost** resource (own attunement); may have cooldowns.
- **Strictly one-way:** specials generate (never cost); signatures/ultimates cost (never generate).
- **Strictly own-attunement in-tree.** Cross-attunement abilities exist only as **found loot**
  (emergent exploration) and are **not** authored by the class skill.
- **Nothing but auto-attack is spammable.**
- **Strategic identity:** a mono-attunement stack pools deep into one resource and fuels each
  other's big abilities, but pays for it in diversity (one resource, one ring position, a narrower
  toolkit). A balanced team has all five pools, each fed by fewer members, and unlocks found
  cross-attunement payoffs.

## Attunement flavor (design on-theme)

A class's effects default to its attunement's signature status/theme (canon: `data/attunements.ts`
+ [affinity-ring](../affinity-ring.md)), deviating only with reason.

| Attunement | Signature | Theme |
|---|---|---|
| SOL | **Burn** | light · fire · expansion · entropy |
| NOX | **Decay** | cold · dark · order · anti-entropy |
| ANIMA | **Poison** | life · nature · evolution · vitality |
| QUANTA | **probability swings** (crit/dodge/time — *no DoT*) | probability · time · observation |
| UMBRAXIS | **Drain** | gravity · void · spacetime · cosmic structure |

## Per-ability schema (structured, numberless)

Every authored entry carries:

- **name**
- **type** — `phys` · `mag` · `heal` · `buff` · `util` · `passive`
- **target** — `self` · `ally` · `allAllies` · `enemy` · `allEnemies`
- **effect** — 1–2 sentence mechanical description, including any **status** it applies
- **tier + milestone** — which tier and which MNA threshold it's chosen at
- **lane** — A / B / C (auto-attack and the neutral ultimate are unlaned)
- **provenance** — `from-brief` (supplied, locked, never overwritten) vs `proposed` (skill-invented)
- **resource gen** — pool + **minor / moderate / major** (specials & auto only)
- **resource cost** — pool + **low / med / high** (signatures & ultimates only)
- **cooldown** — **none / short / medium / long** (auto is always `none`)

No numbers (no MP/power/durations/exact MNA) — magnitudes are a later balance pass. Fields map 1:1
onto the existing `Skill` interface (`type`, `target`, `status`, `desc`) for eventual wiring.

## Hard invariants (the skill validates these before finalizing)

1. Exactly **1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives** (52).
2. Every special/signature milestone has **exactly 2 options**, on the correct MNA thresholds.
3. **No lane appears in every milestone** (the ≥2-lane guarantee holds).
4. Every special/signature/passive option is **lane-tagged** (A/B/C); ultimates = 3 laned + 1 neutral.
5. Derived fields correct (primary ← attunement, secondary ← archetype, threshold ← milestone).
6. Economy holds: **specials generate-only**, **sig/ult cost-only**, **auto = small trickle**, all
   **own-attunement**.
7. Every entry carries a **provenance** flag; `from-brief` content is preserved verbatim.
8. **Ability names are globally unique** — no two abilities share a name, **within the kit and
   across every other class spec**. (Reuse of a flavor *concept* is fine; reuse of an exact ability
   *name* is not. Check new names against the existing `docs/design/classes/*.md` before finalizing.)

## Deferred (parked) — not needed to author specs

Resource **pool caps**; pools **reset-per-fight vs persist**; **cooldown unit** (turns vs ATB ticks);
shared-pool **timing** with ATB turn order; the level→intrinsic-MNA curve; scaling math; found
cross-attunement ability design; engine wiring. Resolve these in a separate battle-system pass.
