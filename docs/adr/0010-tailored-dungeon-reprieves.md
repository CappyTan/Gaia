# ADR 0010 — Tailored dungeon reprieves (no full-heal rest nodes)

**Status:** accepted (Aurelion build). Refines the dungeon-pacing rule of the
[`dungeon-design`](../../.claude/skills/dungeon-design/SKILL.md) skill (§1) and builds on
[ADR 0005](0005-modular-ts-vite.md) (layering) and [ADR 0007](0007-versioned-save-resume.md) (save).

## Context

A dungeon rest node used to call `restParty()` — a **full HP + MP refill** for every standing hero,
once per node. The Bandit Warren placed one on **all three floors**, so the entire descent could be
taken at full resources. The new dungeon-topology analyzer (`npm run map`) made the consequence
legible across the build, and Dara named the problem directly:

> "We don't want a place to get back all your HP and MP on every floor of every dungeon or cave.
> Caves should have no rest. Dungeon resting should be reprieves that are tailored to that dungeon …
> something of variety that is still punishing. Full clear every floor trivializes the game."

Resource depletion *is* the tension the dungeon-design rubric protects (§1); a full heal every floor
removes it, however hard the numbers are.

## Decision

**1 · A rest node applies a TAILORED REPRIEVE, never a full heal.** A reprieve relieves **one axis,
partially, themed to the dungeon**, so the party presses on imperfect. The kinds (`types.ts:Reprieve`):

| kind | relieves | not | fantasy |
|---|---|---|---|
| `mend` | a fraction of **max HP** (default 40%) | MP | a field-dressing fire (the Bandit Warren) |
| `mana` | a fraction of **max MP** (default 50%) | HP | an arcane wellspring |
| `regen` | a **carried** heal-over-time that pays out **in the next fight** | instant HP | a living wood / lava-vent warmth |

A reprieve **never raises the fallen** (a town still revives). The fantasy/name is Dara's lore lane;
the kind + magnitude are agent-tunable balance knobs.

**2 · Caves get no rest at all.** A cave (and any short, sharp interior) omits `rests` — punishing
end-to-end. **No-rest is correct, not a deficiency**; the topology analyzer no longer flags it.

**3 · Mechanism (data-driven, ADR 0005).**
- Data: `DungeonLayout.reprieve?: Reprieve` declares what the floor's `rests` tiles do. A `rests` tile
  with no `reprieve` is a content bug (a dead beat) — the analyzer flags *that*, not the absence of rest.
- Pure logic: `systems/reprieve.ts` `applyReprieve(party, reprieve)` mutates HP/MP/`pendingRegen` and
  returns a summary. No DOM, no RNG — unit-tested.
- Controller: `field.restAt` applies the current floor's reprieve and renders its themed copy. The
  full-heal `restParty()` survives **only** for the town inn and the optional overworld shrine (by
  design — those are deliberate full rests, not in-dungeon pacing).
- `regen` is carried because per-battle status is wiped at `battle.begin()`; a `pendingRegen` on the
  member seeds into status *after* the wipe, then spends — so it heals gradually in the next fight.

## Consequences

- The Warren's three hearths are now `mend` (HP only) — the full 3-floor descent no longer refills the
  party; spent magic stays spent until a town. Player-visible (v0.111).
- New dungeons declare a reprieve that **leans to their identity**, and we **vary the kind** so no two
  rests feel the same — the dungeon analog of Dara's "no two zones the same" directive.
- **Deferred:** a `cleanse` reprieve that lifts a lingering ailment (e.g. petrification) needs
  **persistent out-of-combat statuses**, which don't exist yet (statuses are per-battle). Don't author
  it until that mechanic lands. (`pendingRegen` IS persisted across save/resume, so a future `regen`
  dungeon's carried buff survives a reload — closed pre-emptively even though no shipping dungeon uses it.)
