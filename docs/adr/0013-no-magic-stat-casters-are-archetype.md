# ADR 0013 — No "Magic" stat: casters are archetype-defined; VIT is the universal channeling fuel

**Status:** accepted (Dara-ratified, 2026-06-29). Resolves the loose end from the **MGC → VIT** stat
rename: how "casters" exist when there is no longer a Magic stat. Builds on the ratified
[Attunement Mechanics Framework](../design/attunement-mechanics.md) ("five stances on entropy") and the
[stat system](../design/stat-system.md). Glossary terms: **Caster**, **VIT** in [`CONTEXT.md`](../../CONTEXT.md).

## Context

Gaia's canon already says **all of a class's outputs scale off its one Attunement governing stat** —
i.e. there is no separate "magic vs martial" power axis; every Attunement *is* a form of channeled
power. The five primaries are **STR / AGI / DEF / SPD / VIT** (one per Attunement, 1:1).

Renaming the former **MGC ("Magic")** slot to **VIT ("Vitality")** — to fit ANIMA's Life/negentropy
stance — raised two worries:

1. **"We lost casters."** With no "Magic" stat, what defines a Staff/Spellblade caster, and where does
   its spell power come from?
2. **VIT looks like a Magic stat in disguise.** VIT carries the *universal* substats **ability power /
   healing / debuff** (`stat-system.md` §3, flat for everyone), so every ability-using class wants it —
   which reads like the old "everyone stacks Magic" pattern under a Life name.

The alternatives considered were: (a) add a 6th "Magic" stat (breaks the clean 5↔5 mapping, orphans
nothing but bloats the model); (b) surgically retheme VIT to pure Life and move "ability power" off it
(real rework, risks overlap with DEF's defensive substats, removes a tuning lever).

## Decision

1. **"Caster" is a delivery style, not a stat.** A caster is the **Staff** (and hybrid **Spellblade**)
   **Weapon Archetype** — a class that *projects/externalizes* its Attunement at range rather than
   channeling it through a struck weapon. Its "spell power" is simply its **Attunement governing stat**
   (a SOL Staff scales off AGI, an ANIMA Staff off VIT), per the §2 tier system. **There is no Magic
   stat.** The five stances on entropy define *what* a caster's projected power does.

2. **VIT is the universal channeling fuel — ratified meaning, no mechanical change.** Framed
   physically, every ability is work done against entropy, and a living system's capacity for that work
   is its **free energy / negentropic reserve = Vitality**. VIT therefore legitimately amplifies ability
   output (its ability-power/healing/debuff substats) for *all* classes — it is the fuel every
   Attunement burns, **universally applicable like the other four primaries**, not a caster-only stat.
   ANIMA scaling off VIT is the deepest case (life *is* negentropy).

We rejected the 6th-stat and substat-surgery alternatives: both add complexity to fix a problem that
dissolves once "caster = archetype" and "VIT = universal fuel" are stated explicitly.

## Consequences

- **No 6th stat.** The 5↔5 attunement↔primary mapping holds; the stat math (§2 tiers, §3 substats) is
  untouched.
- **Staff's secondary stat is VIT** (the consistent "rename the slot" result) — a Staff caster scaling
  its survivability/fuel off Vitality, which now reads as intentional, not a leftover.
- **Casters need no special-casing.** They route through the same scaling rules as everyone; the
  build-class specs already treat Staff/Spellblade as archetypes, not stat profiles.
- **VIT is universally desirable** — by design, symmetric with STR (autos), AGI (crit), SPD (tempo),
  DEF (survival). No dead stats; no mandatory "caster stat."
- **Engine wiring is downstream** (per CLAUDE.md — design canon, not yet engine-wired): when stats are
  built out, map the POC's `mag → VIT` and encode the §2/§3 tables; nothing here changes that plan.
