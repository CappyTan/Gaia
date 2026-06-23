---
name: dungeon-design
description: The dungeon & cave design playbook for Gaia — the distilled, gradeable rubric the level-designer follows when shaping a dungeon/cave and the reviewers grade against. Turns the JRPG dungeon-design research (docs/design/dungeon-design-research.md) into concrete rules for Gaia's systems: pacing/breather beats, interconnected layout with loops & shortcuts, light-and-optional puzzles, difficulty-gated reward placement, and a teach→develop→test ramp into a telegraphed boss. Use whenever building or reworking a dungeon (the Drowned Vault, the Bandit Warren) or, to a lesser extent, a cave/POI interior.
---

# Dungeon Design skill — how Gaia dungeons are built and graded

The one repeatable rubric for a Gaia **dungeon** (and, lighter, a **cave**). It distills
`docs/design/dungeon-design-research.md` — best practices drawn from acclaimed party JRPGs and their
designers — into concrete rules tied to Gaia's systems (**ATB**, the **Attunement ring** at ±15%,
**front/back rows**, **affix loot**, the **balance sim**).

**Two audiences, one rubric.** The **level-designer** *follows* this when shaping a dungeon; the
**level-design-reviewer** (and **encounter-reviewer** for §5) *grade against* it. The numbered checks
are written to be gradeable **[Blocking] / [Should-fix] / [Polish]**.

- **Read first:** `CLAUDE.md`, `docs/design/dungeon-design-research.md` (the *why* + citations),
  `docs/design/affinity-ring.md` (Attunement/continent identity). Lanes per CLAUDE.md still hold —
  layout is the level-designer's, fights are the encounter-designer's, numbers are balance-tuner's,
  lore/classes are **Dara's**. This skill says how a *dungeon* should feel; it doesn't move the lanes.
- **When to use:** building/reworking a dungeon (Drowned Vault, Bandit Warren) — **full rubric**. A
  **cave/POI interior** — apply it **lightly** (see §7). A single tile tweak — skip it.

## The spine: explore → fight → reward → rest

A dungeon is a **rhythm**, not a difficulty wall. The player explores a legible space, spends
resources in fights, banks rewards, and gets a breather before the next climb — escalating to a boss
that tests what the dungeon taught. Everything below serves that loop.

---

## 1 · Pace by tension-and-release (don't run a constant gauntlet)
- **Alternate combat with breather beats.** Players go numb under unrelenting intensity. After a spike
  (a champion pack, the mini-boss), give a low-intensity beat — a cleared room, a chest, a **rest/save
  node** — before the next climb. Sawtooth the curve; never a flat ramp.
- **Resource depletion is the tension, not per-fight lethality.** The dungeon is interesting because
  the party might run low on **MP/HP/items before the next safe node** — *that's* what makes each
  fight matter. If healing/MP is so abundant that fights are just a time tax, the dungeon has failed,
  however "hard" the numbers are. (This is exactly what the sim's HP targets protect — see §8.)
- **Give a long dungeon internal milestones.** Segment it into a few distinct sub-areas with their own
  read, so the run has waypoints rather than one undifferentiated slog.
- **Gradeable:** is there a breather beat between spikes? A rest/save node mid-dungeon? Does the run
  segment into legible sub-areas, or is it one long same-y stretch?

## 2 · Build interconnected, legible space (loops & shortcuts, not dead-end spurs)
This is **Dara's open-world directive applied inside a dungeon** — the cardinal layout rule.
- **A small mesh of rooms with loops and shortcuts**, not a hall that forks into dead-end cells.
  Apply the test: *"could I draw this as a tree with one trunk?"* If yes, it's still too linear.
- **Orient around a hub** the player keeps returning to (the entrance / a rest node), with paths that
  radiate and **loop back**. An **unlockable shortcut** back toward the hub (a door opened from the far
  side, a one-way drop that rejoins the spine) is *itself a reward* and kills backtracking — prefer it
  over a there-and-back return trip.
- **Legibility is the license for non-linearity.** Distinct **landmarks** at junctions (high contrast,
  clear form, prominent), a visible far goal to head toward (the boss gate as a "weenie"), and
  consistent tile grammar (wall = block, path = forward). Gaia draws a minimap — lean on it; it's what
  lets a non-linear dungeon not frustrate.
- **No teleporter mazes, no dead-end labyrinths without a map** — the canonical failure cases.
- **Gradeable:** mesh or corridor? Is there a hub + at least one loop/shortcut? Distinct landmarks at
  junctions? Can the player always sense "forward"?

## 3 · Branch early, funnel late
- **Front-load choice/exploration; streamline toward the boss.** Choice-density tapers from branching
  to near-linear right before the boss gate, so the climax is legible and fatigue stays low.
- **Cut dead space.** Almost every node — door, fork, chest, feature — should pose a real decision.
  Long choiceless corridors are the specific thing to delete (the FF XIII "corridor" critique).
- **Gradeable:** does exploration freedom live up front and tighten into the boss? Any stretch of
  choiceless corridor to cut?

## 4 · Gate progression as a small spatial puzzle (light — Gaia is loot-first, not Zelda)
- **The mini-boss chokepoint is the seed.** Build on it: a key/switch/locked route, a beaten-mini-boss
  opening the way, a one-way drop. Progression should feel like solving a connected space, not "walk
  east."
- **Puzzles light and optional, tied to the dungeon's identity.** Gaia leans **Diablo (loot loop) +
  party JRPG**, *not* Zelda. One **signature gimmick per dungeon** as *variety* (a Drowned-Vault flood/
  water mechanic, a Warren collapse), plus the odd hidden-passage secret — never obtuse,
  puzzle-saturated, or ability-swap busywork that breaks the combat/loot flow.
- **Never interrupt a puzzle with a fight** — keep the immediate puzzle tile safe (the JRPG drudgery
  trap). And **never soft-lock**: the map is always traversable to the boss, every chest reachable.
- **Gradeable:** is gating a small spatial puzzle or just distance? Are puzzles light/optional/
  on-identity, or heavy and flow-breaking? Any soft-lock risk (always **[Blocking]**)?

## 5 · Teach → develop → test (encounter-facing — hand to encounter-designer)
*This section is the **encounter-designer's** to populate and the **encounter-reviewer's** to grade;
the level-designer shapes the space that makes it possible (intro rooms, mini-boss slot, boss arena).*
- **Compose encounters to rehearse the boss.** Introduce the boss's Attunement / a threat on trash
  first, **develop/combine** it, then the mini-boss previews it, then the boss is a **knowledge-check**
  on what the dungeon taught. Per CLAUDE.md the boss matchups are already deliberate (Kingpin
  **SOL-infused**, Cave Troll **NOX-infused**) — build toward that final matchup.
- **Use composition to push strategy (not a hard wall).** Gaia's ring is gentle by design (**±15%**,
  no Press-Turn turn-economy) — so prompt strategy through **enemy makeup**: a mono-Attunement pack
  rewards the right counter; a **mixed-resistance pack punishes a mono-Attunement party**, nudging comp
  diversity. Lean on **AoE / back-line-reaching threats** to pressure lazy front/back formations.
- **Mini-boss = checkpoint + difficulty preview** before the boss gate (`mini`/`miniAdds`/`boss` slots).
- **Gradeable (encounter-reviewer):** does the dungeon teach-then-test? Does composition reward good
  party-building without forcing one comp? Is there a mid-point preview before the boss?

## 6 · Reward exploration generously — but tune density, and gate the best loot by risk
- **Off-path, difficulty-gated rewards pay categorically better.** Optional/side-route chests and the
  **rare "treasure" monsters** (`RARE_MONSTERS`, Hogger-tier) sit behind a tougher pocket or a chosen
  detour and pay a real step up (deeper ilvl / higher rarity-band roll) — not a marginal trinket.
  **Difficulty itself is the gate** (wander somewhere risky early = you're not ready), not arbitrary
  locks.
- **Don't carpet the dungeon in chests.** Reward density causes fatigue; exploration should
  *consistently* pay meaningful content, but space it. The **merchant** (and any in-dungeon rest node)
  is the deliberate low-intensity reward valley between combat peaks.
- **The loot loop is the reward engine.** Affix drops are the variable-ratio jackpot; XP/MNA per kill
  is the fixed-ratio baseline — keep that split, and make the **mini-boss/boss** drops a visible bump.
- **Gradeable:** do side-paths/optional rooms pay categorically better than the critical path? Is
  reward density tuned (not carpeted)? Are rare monsters earned spice?

## 7 · Caves & POI interiors — the rubric, lighter
A **cave** or POI interior is a *small* dungeon: apply the spirit, not the full ceremony.
- **Keep:** legible space, no soft-lock, a breather/risk rhythm, at least one **off-path reward** that
  justifies entering, and tile grammar consistent with the parent zone.
- **Relax:** a cave can be a single loop or a couple of rooms (no full mesh required), usually **no
  puzzle gimmick and no boss gate** — a rare-monster pocket or a good chest is reward enough.
- **Gradeable:** is it worth entering (a real reward), legible, and soft-lock-free? That's the bar.

## 8 · Verify (the real gate)
- **Read the floor objectively first — `npm run map <zone>`.** The `dungeon-map` tool
  (`app/tools/dungeon-map.ts`, on the pure `systems/dungeonTopology.floorTopology`) renders any dungeon
  floor as ASCII + a read keyed straight to these checks, so authors and reviewers grade from the same
  picture instead of mentally simulating `genMap`: **MESH vs CORRIDOR** (cyclomatic loops — the §2
  "could I draw this as one trunk?" test, computed), hubs vs dead-end rooms (§2), rest-node presence
  (§1), drop/shortcut count (§2/§4), the **soft-lock** check (every feature reachable from entry —
  §2/§4, always [Blocking]), and the **mini-boss gate-pinch** verdict (does walling the lieutenant
  actually cut off the stairs/boss, or is it bypassable? — §5). `npm run map greenvale` (all floors) or
  `npm run map greenvale 1` (one floor). It reports the topology; the *qualitative* calls (legibility,
  pacing feel, risk/reward) are still yours.
- `npm run typecheck && npm run build && npm test` clean; **never soft-lock** (the `dungeon-topology`
  test asserts every shipping floor is reachable + a mesh; trace a path to the boss and every chest on
  several generated maps for anything new).
- If cadence/depth/difficulty moved, run `npm run sim 200` and read the pacing against the targets:
  **end-of-fight party HP ~55–75%, boss ~30–50%, full-clear wipe <~10%, finish ~L10.** A party at
  near-full HP at the boss gate = **under-paced** (a time tax — see §1); a wipe on trash = over-spiked.
  Hand specific number moves to **balance-tuner** — don't tune enemy stats in the layout pass.
- Don't bump `GAME_VERSION` or commit from the layout pass — hand finished work back with notes.

## The don'ts (quick reference)
- Constant high-intensity gauntlet with no breather. *(§1)*
- Over-supplied healing/MP that removes all tension (fights become a time tax). *(§1)*
- A corridor with dead-end spurs; teleporter mazes; a mapless labyrinth. *(§2)*
- Long choiceless corridors / dead space. *(§3)*
- Obtuse or puzzle-saturated dungeons; ability-swap busywork; a fight interrupting a puzzle. *(§4)*
- A boss that tests nothing the dungeon taught; an untelegraphed difficulty spike. *(§5)*
- Carpeting the dungeon in chests; under-rewarding a risk-gated detour or optional fight. *(§6)*
- Any soft-lock — unreachable boss or chest, a stranding trigger. *(§2,§4 — always [Blocking])*

## Lanes (who owns what)
Layout/tiles/loops/landmarks/rest nodes → **level-designer** (`controllers/field.ts` `genMap`,
`data/zones.ts`). Encounter composition / teach-then-test / Attunement lean → **encounter-designer**.
Loot identity → **itemization-designer**. Difficulty numbers, reward density, MP/heal economy →
**balance-tuner**. Boss ability mechanics & telegraphing, class kits the dungeon tests → **Dara /
class-designer**. Names/lore/flavor → **requiem-canon-keeper / narrative-writer**. Spot it, apply your
part, hand off the rest.
