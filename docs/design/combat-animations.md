# Combat Animations — the layered compositor

How Gaia plays a skill's combat animation. Built as a **reusable compositor** driven by **JSON-style
skill definitions**, so adding an animation is data + art, not engine code. First class wired up:
the **Photon Vanguard** (SOL × Rifle) and its test ability **Photon Beam**.

## The model — layers over the live stage

A skill animation is composited from independent **layers**, each a set of transparent frame PNGs.
**Backgrounds and the enemy sprite are never baked into a layer** — they are the live battle stage the
layers play on top of:

| Layer | What | Anchor |
|---|---|---|
| (stage) | battlefield background + enemy sprite | — (already on screen) |
| **character** | the hero performing the skill (the **master clock**) | actor sprite, may drift toward target |
| **effect** | projectile / beam / cast | between actor and target (or the muzzle) |
| **impact** | the hit effect on the foe | target sprite |
| damage / number | HP change + floating number | driven by timing, not a layer |

The **character layer is the master clock**: the effect, impact, and the damage tick are scheduled off
its frame indices. Every frame fades in and out (like the crit burst) so a sequence reads smoothly.

## Pieces

- **Frames** — `app/assets/fx/<set>/01.png … NN.png`, transparent PNGs sliced from Dara's reference
  sheets by `app/tools/slice-anim.py` (reproducible; sources live in `assets/reference/anim-*.png`).
- **Definitions** — `app/src/data/skillAnimations.ts` (`SKILL_ANIM`). Pure data. Each layer carries the
  metadata Dara specced: `frames`, `frameMs` (duration), anchor (`at`), `offsetX/offsetY`, `scale`
  (+`sizeBy`), `flip`, `blend`, `travel`, and `startFrame`; the skill carries `damageFrame` and
  `damageAfterImpact`.
- **Compositor** — `app/src/ui/skillAnimator.ts` (`playSkillAnim`). Lays the frames over `#stage`,
  schedules everything off the character frames, calls back the battle controller to apply damage and
  float the number, then cleans up. Pure presentation — it owns no game state.
- **Hook** — `controllers/battle.ts`: a `Skill` with an `anim` key plays its sequence on use
  (`animatedStrike`); damage is applied silently on `damageFrame` and the number is flushed on impact.

## Add a new skill animation

1. Drop the reference sheet in `assets/reference/`, add its frame boxes to `app/tools/slice-anim.py`,
   run `python3 app/tools/slice-anim.py --montage`, and eyeball the montage.
2. Add a `SKILL_ANIM["<key>"]` entry describing the layers + timing.
3. Point the skill at it: `anim: "<key>"` on the `Skill` in `data/skills.ts`.

No compositor changes needed — tune scale/offsets/timing/`flip` in the JSON until it reads right.
