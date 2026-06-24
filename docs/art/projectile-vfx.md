# Projectile VFX library (reusable combat-animation sheets)

A catalogue of the **reusable** gun/projectile effect sheets Dara painted, so any future ability or
class that *fires a projectile* can reuse them instead of commissioning new art. These are the SOL
gold-on-dark VFX behind the **Photon Vanguard's basic attack** (`photonShot`), but they're authored
generically — a muzzle flash, a tracer bullet, and an impact burst.

The pipeline: reference sheet → `app/tools/slice-anim.py` → transparent frame PNGs in
`app/assets/fx/<set>/NN.png` → referenced by a layer in `data/skillAnimations.ts` and composited at
runtime by `ui/skillAnimator.ts`. (See [`README.md`](README.md) and the inline docs in those files.)

## The five REQUIEM animation phases

Every combat ability is built from independently-configurable phases (each maps to a layer / field
in `SkillAnim`):

| Phase | Where it lives | Notes |
|---|---|---|
| 1. Character animation | `character` (`at: "actor"`) | the figure's firing poses, animates in place |
| 2. Cast / Muzzle VFX | `muzzle` (`at: "muzzle"`) | blooms at the barrel, rotated to face the target |
| 3. Projectile VFX *(optional)* | `effect` (`at: "travel"`) | flies barrel→target over `travelMs`, rotated along its path |
| 4. Impact VFX | `impact` (`at: "target"`) | bursts on the struck foe, sized to the target sprite |
| 5. Damage event | `damageMs` / `damageFrame` | when the hit applies; `damageAfterImpact` floats the number after the blast |
| 6. Return to idle | (automatic) | the actor's held pose is restored when the firing frames end |

A beam ability instead uses `effect` with `at: "muzzleToTarget"` (a spanning bar) — see `photonBeam`.

## The sheets

All three are 1536×1024, white background, 4 labelled frames in a row (number above, caption below).
The slicer's `drop_caption` trims the label band; the `ywin` bounds the art.

| Set (fx dir) | Reference sheet | Frames | Beat |
|---|---|---|---|
| `muzzle-flash-sol` | `assets/reference/anim-muzzle-flash-sol.png` | 3 (sheet has 4; the faint "fade" frame is dropped — the compositor fades the last frame out) | compressed spark → expands forward → solar particles shoot out |
| `bullet-tracer` | `assets/reference/anim-bullet-projectile.png` | 1 clean tracer | the sheet's 4 frames are one continuous, merged streak (slicing them yields disjoint cut segments, like the photon-beam); the compositor instead **translates a single tracer** barrel→target — the screen travel IS the motion |
| `bullet-impact` | `assets/reference/anim-bullet-impact.png` | 4 | sparkle contact → starburst pinnacle → outward solar explosion → fade |

## Reusing these for a new projectile attack

1. Pick a class/ability. The art is SOL-gold; for another Attunement, recolour or slice that
   Attunement's own sheet into a new `fx/<set>` (keep the same structure).
2. Add a `SkillAnim` in `data/skillAnimations.ts` with `muzzle` + `effect (at:"travel")` + `impact`
   layers pointing at the fx dirs, and tune `offsetX/offsetY` (barrel origin, as a fraction of the
   actor sprite), `scale`, `travelMs`, and the per-layer `startMs`.
3. Wire it up:
   - **Basic attack:** add `"<ATT>:<Archetype>": "<animKey>"` to `BASIC_ATTACK_ANIM`.
   - **Skill:** set `anim: "<animKey>"` on the `Skill` in `data/skills.ts`.
4. No compositor changes needed — `at: "muzzle"` and `at: "travel"` are generic.

The Photon Vanguard's `photonShot` is the worked example to copy.
