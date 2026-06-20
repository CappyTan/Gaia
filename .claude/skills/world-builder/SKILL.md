---
name: world-builder
description: Build a whole new region of Gaia end-to-end with gameplay, sound, art, and lore all in sync — the Creative Director's orchestration playbook. Establishes one shared World Brief, then dispatches the specialist agents (level/encounter/class/itemization design, art, audio, narrative) in pipeline order, runs the canon + UX + code-review sync gates, integrates everything the agents hand back, verifies (typecheck/test/build/sim), bumps the version, and ships via the deploy skill. Use when the ask is big — "build a new zone/region/continent", "add a whole area", "flesh out <place>" — not a single isolated tweak.
---

# World Builder skill — build a region of Gaia, in sync

The one repeatable way to grow Gaia by a **whole section of world** (a region: one or more
**zones** + a **dungeon**, its biome and **Attunement identity**, its encounters, loot, lore,
music, and art) without the four creative powers drifting out of sync.

This is the **Creative Director's** playbook. Like `devops` follows the `deploy` skill, the
**`creative-director` agent's first action is to read and execute this skill.** Run it from the
**lead session** (the main loop) — the specialist agents *hand their work back* rather than commit,
so one orchestrator must dispatch them, integrate, and ship. (Subagents can't spawn subagents; the
Director is the conductor, not a peer in the queue.)

- **Repo:** `cappytan/gaia` · **Live site:** https://cappytan.github.io/Gaia/
- **Read first:** `CLAUDE.md` (architecture + workflow), `CONTEXT.md` (vocabulary), `DESIGN.md`
  (locked decisions), `docs/design/affinity-ring.md` (continent identity), `docs/design/requiem/`
  (canon). **Dara owns lore, classes, abilities, and art** — invent only into real gaps, reconcile
  toward REQUIEM, and *surface* conflicts for him rather than overruling canon.

## The mandate: four powers, one world

The build is only done when **gameplay, sound, visuals, and lore are mutually reinforcing** — the
music *sounds like* the biome the art *paints*, which *reads as* the lore the encounters *express*,
all on one **Attunement identity**. The mechanism that keeps them in sync is a single **World Brief**
that every agent anchors to. Write it first; treat any drift from it as a defect.

## 0 · When to use
Use for a **large** addition (a new region/zone/dungeon, or a major rework of one). For a single
isolated change (one affix, one tile, one cue) just call the relevant specialist agent directly —
the full pipeline is overkill.

## 1 · Write the World Brief (the sync anchor) — Director, before any dispatch
A short doc the whole build hangs on. Derive it from canon + Dara's intent; **flag any gap or
conflict for Dara before building on it.** Cover:
- **Identity & fantasy** — what this place *is*, why the player goes, the one-line hook.
- **Biome & visual language** — terrain, palette (gold-on-dark house style), tile kinds, landmarks.
- **Attunement identity** — which power the region leans toward (so the player brings the counter),
  per the affinity ring; the matchup story for its boss.
- **Level band & role in the world** — where it sits after the current zones (v0.33: Greenvale L1–6
  → Duskmarsh L7–10), how it gates progression.
- **Cast & threats** — the enemy roster theme, the mini/boss, any rare monster.
- **Loot & class hooks** — what the region rewards; whether it introduces/showcases any class kit.
- **Tone & sound** — the mood the music and prose must hit.

Run it past **requiem-canon-keeper** for canon truth *before* dispatching. This brief is what every
agent is told to honor; it is the contract that keeps the four powers aligned.

## 2 · Dispatch the build pipeline (in order, with handoffs)
Give each agent the **World Brief** + the prior step's output. Respect the established pipeline so
each stage builds on a stable base. Launch genuinely independent agents **in parallel** (one message,
multiple Agent calls); keep dependent stages sequential.

**Phase A0 — Geography (where it sits + how it connects), FIRST:**
- **`world-cartographer`** — set the macro geography before any tiles: place the region on the world
  map (coordinate/orientation consistent with `world-atlas.md`), define its **connections to
  neighbors** (which sides exit, in which compass direction — N/S/E/W — and to which zone, with
  reciprocity; a region can connect to several), and emit the per-zone **edge spec** the level-designer
  must honor. Pure data (the zone graph); verifies reciprocity + atlas-consistency. Do this before
  Phase A so the space is shaped into a world that actually joins up.

**Phase A — Foundation (space + skin), in parallel pairing:**
- **`level-designer`** — shape the zone/dungeon **to the cartographer's edge spec** (exits/gate/spawn
  on the specified edges): layout, tile composition, paths, gates, POIs, treasure, soft-lock-free flow
  (`data/zones.ts`, `controllers/field.ts`). Defines any new tile *kinds* and flags the sprites needed.
- **`art-integrator`** — paint/wire those tile kinds + any new sprites from Dara's reference sheets
  (palette + style consistency). Works alongside level-designer (kinds vs. pixels).

**Phase B — Population (the fights):**
- **`encounter-designer`** — fill the encounter sets, mini/boss, rare-monster placement, pacing,
  and the Attunement lean from the Brief (`data/zones.ts`, `RARE_MONSTERS`).

**Phase C — Identity systems (only if the Brief calls for them):**
- **`class-designer`** — if the region showcases/introduces a class kit or ability.
- **`itemization-designer`** — if it adds affixes / set / unique / chase loot.

**Phase D — Canon & flavor pass:**
- **`requiem-canon-keeper`** — vet names/mechanics/vocabulary against REQUIEM; flag invented-not-canon
  drift for Dara (read-only; it reports).
- **`narrative-writer`** — write the on-brand words: zone/enemy/ability/item blurbs, intro copy,
  microcopy — only after canon is settled, in the Brief's voice.

**Phase E — Sound & numbers:**
- **`audio-composer`** — compose the zone/dungeon/boss themes to the Brief's mood (`audio/music.ts`).
- **`balance-tuner`** — last: tune enemy stats, loot/ilvl/MNA, XP for the new level band; iterate
  with the sim toward targets (HP ~55–75%, bosses ~30–50%, wipe <~10%).

(Cross-cutting agents — narrative, audio, canon-keeper, ux — serve *whatever* the design agents
produce; weave them in as each piece lands, don't save them all for the end.)

## 3 · Sync gates — the Director's job between phases
After each phase, check the four powers still cohere with the Brief: does the music match the
painted biome? do the encounters express the Attunement identity? does the prose match the lore?
**If any power drifts, loop that agent back** with the specific mismatch before moving on. This is
the whole point of the skill — don't let phases proceed on a broken anchor.

## 4 · Integrate — Director only
Specialists **hand work back and do not commit**. Collect every change, resolve overlaps (e.g. two
agents touching `data/zones.ts`), and assemble the coherent region on the dev branch.

## 5 · Verify locally — the real gate
```
npm run typecheck && npm test && npm run build && npm run sim 200
```
All green, sim within targets. **Tests must be deterministic** (pin RNG — mock `Math.random` or use
`seeded`); a flake = a failed deploy. If the sim is off, loop **balance-tuner**, not a re-run.

## 6 · Quality + canon final pass
- **`code-reviewer`** — ADR 0005 layering (`data/`+`systems/` stay pure), types, test coverage, no
  new runtime deps, house style.
- **`ux-designer`** — legibility, mobile/touch, gold-on-dark consistency for any new UI/field/battle.
- **`requiem-canon-keeper`** — final canon read on the integrated whole.
Address blocking findings before shipping.

## 7 · Version + ship
- Bump `app/src/data/version.ts` (`GAME_VERSION`) and add a `app/src/data/changelog.ts` entry
  (newest first) — this is a big, player-visible change.
- **Ship via the `deploy` skill / `devops` agent** (re-cut from `main` → PR → squash-merge → watch
  the post-merge deploy → verify live). Don't hand-run git.

## 8 · Report to Dara in plain terms
What region shipped, the experience it delivers across all four powers, that it's merged and live
(allow ~1 min for the CDN; hard-refresh) — and **every open question/canon flag** for him to rule
on. No git or agent mechanics; the world, in his language.

## Guardrails
- **Dara rules canon.** Classes/abilities/lore/art are his; the Director *assists and flags*, never
  overrules. Reconcile toward REQUIEM; invent only into genuine gaps.
- **Respect the layering (ADR 0005).** New content → `data/`; new pure logic → `systems/` (with a
  test); DOM/flow → `controllers/`/`ui/`. No new runtime framework; stay statically hostable + iOS
  Safari-safe.
- **The Director conducts; specialists craft.** Don't do a specialist's job inline — dispatch it,
  then integrate. Keep each agent in its lane (see the per-agent files for the seams).
- **Don't ship red.** Local typecheck/test/build/sim are the gate; never amend/force-push `main`.
- Commit as `Claude <noreply@anthropic.com>`; never put the model identifier in any artifact.
- Stay scoped to `cappytan/gaia`.
