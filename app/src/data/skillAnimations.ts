// REQUIEM combat-animation definitions — the JSON-style data that drives the reusable combat
// animation compositor (ui/skillAnimator). A skill's animation is built from LAYERS, each its own
// set of transparent frame PNGs under app/assets/fx/<dir>/NN.png (sliced by tools/slice-anim.py).
//
// Layers are composited over the live battle stage at runtime; backgrounds and the enemy sprite are
// NEVER baked into a layer — they're the stage the layers play on top of. The character layer is the
// MASTER CLOCK: effect/impact layers and the damage tick are scheduled off its frame indices.
//
// This is pure data (no DOM). Add a skill's animation here and reference it from the Skill via
// `anim` (data/skills.ts). To add a new animation: slice frames into app/assets/fx/<dir>/, then
// describe the layers + timing below — no compositor code changes needed.

/** One animation layer = a sequence of frames (fx/<dir>/01.png … NN.png) with placement + timing. */
export interface AnimLayer {
  /** Asset subfolder under fx/ holding 01.png … {frames}.png. */
  dir: string;
  /** Frame count (zero-padded files 01..NN). */
  frames: number;
  /** Milliseconds each frame is shown (frames cross-fade like the crit burst). */
  frameMs: number;
  /** Where the layer anchors: the actor sprite, the target sprite, or the midpoint between them. */
  at: "actor" | "target" | "between";
  /** Pixel offset from the anchor (+x right, +y down). X is mirrored when `flip` is set, so a
   *  muzzle offset stays at the gun whichever way the figure faces. */
  offsetX?: number;
  offsetY?: number;
  /** Size: frame HEIGHT = scale × the actor sprite height, unless sizeBy is "width" (then WIDTH =
   *  scale × the actor→target distance, so a beam stretches to connect). Aspect is preserved. */
  scale?: number;
  sizeBy?: "height" | "width";
  /** Mirror horizontally (the source sheets fire/charge rightward; flip to face the enemy at left). */
  flip?: boolean;
  /** Screen-blend for glowing energy (beam/impact); omit for solid figures. */
  blend?: "screen" | "normal";
  /** Fraction (0..1) of the actor→target distance the layer drifts across its frames — gives the
   *  firing figure its advance toward the enemy. Only meaningful for `at: "actor"`. */
  travel?: number;
  /** Which CHARACTER frame (1-based) launches this layer. Omit on the character layer itself. */
  startFrame?: number;
}

export interface SkillAnim {
  /** The figure performing the skill — the master clock the rest is scheduled against. */
  character: AnimLayer;
  /** Projectile / beam / cast effect (e.g. the photon beam at the muzzle). */
  effect?: AnimLayer;
  /** Hit effect on the target (e.g. the Sol Aloha explosion). */
  impact?: AnimLayer;
  /** Character frame (1-based) on which damage is applied to the target. */
  damageFrame: number;
  /** Float the damage number after the impact finishes (vs. at the damage frame). */
  damageAfterImpact?: boolean;
  /** Hide the actor's static battle sprite while the character frames play (they replace it). */
  hideActor?: boolean;
}

export const SKILL_ANIM: Record<string, SkillAnim> = {
  // Photon Beam — the Photon Vanguard test sequence. Hero fires from the right, advancing left;
  // the beam springs from the muzzle on the Aim frame; the Sol Aloha explosion blooms on the enemy
  // as the shot lands; damage applies on the Fire frame, the number floats up after the blast.
  photonBeam: {
    hideActor: true,
    damageFrame: 4,
    damageAfterImpact: true,
    character: {
      dir: "photon-vanguard", frames: 5, frameMs: 130, at: "actor", scale: 1.35, travel: 0.42, flip: false,
    },
    effect: {
      dir: "photon-beam", frames: 4, frameMs: 95, at: "between", startFrame: 3,
      sizeBy: "width", scale: 0.92, offsetY: -6, flip: true, blend: "screen",
    },
    impact: {
      dir: "sol-aloha", frames: 5, frameMs: 110, at: "target", startFrame: 5,
      scale: 1.5, blend: "screen",
    },
  },
};
