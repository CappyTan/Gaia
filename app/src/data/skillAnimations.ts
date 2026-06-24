// REQUIEM combat-animation definitions — the JSON-style data that drives the reusable combat
// animation compositor (ui/skillAnimator). A skill's animation is built from LAYERS, each its own
// set of transparent frame PNGs under app/assets/fx/<dir>/NN.png (sliced by tools/slice-anim.py).
//
// Layers are composited over the live battle stage at runtime; backgrounds and the enemy sprite are
// NEVER baked into a layer — they're the stage the layers play on top of. The character animates IN
// PLACE (a ranged attack — nobody slides across the screen); the effect/impact layers and the damage
// tick are scheduled by time (startMs / damageMs), with character-frame fallbacks (startFrame /
// damageFrame).
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
  /** Milliseconds each frame is shown. */
  frameMs: number;
  /** Where the layer anchors:
   *   "actor"          — on the caster (the character animation)
   *   "target"         — on the struck foe (the impact); sized relative to the TARGET sprite
   *   "between"        — midpoint of actor↔target
   *   "muzzleToTarget" — a BEAM spanning from the actor's muzzle (centre + offset) to the target. */
  at: "actor" | "target" | "between" | "muzzleToTarget";
  /** Offset from the anchor as a FRACTION of the actor sprite (x → its width, y → its height), so
   *  placement scales with the rendered size. For a muzzle, e.g. offsetX:-0.3 (left) offsetY:-0.06. */
  offsetX?: number;
  offsetY?: number;
  /** Size: frame HEIGHT = scale × the reference sprite height (actor, or the TARGET for "target"
   *  layers); width follows the frame's aspect. For a "muzzleToTarget" beam, WIDTH = scale × the
   *  muzzle→target distance and height = `thickness` × the actor height. */
  scale?: number;
  /** Beam thickness as a fraction of the actor height (only for "muzzleToTarget"). */
  thickness?: number;
  /** Mirror horizontally (the beam sheet points rightward; flip it to fire toward a left-side foe). */
  flip?: boolean;
  /** Screen-blend for glowing energy (beam/impact); omit for a solid figure. */
  blend?: "screen" | "normal";
  /** Start time, in ms from the animation start (preferred). */
  startMs?: number;
  /** Fallback start: which CHARACTER frame (1-based) launches this layer, if startMs is absent. */
  startFrame?: number;
}

export interface SkillAnim {
  /** The figure performing the skill — animates in place. */
  character: AnimLayer;
  /** Projectile / beam / cast effect (e.g. the photon beam from the muzzle). */
  effect?: AnimLayer;
  /** Hit effect on the target (e.g. the Sol Aloha explosion). */
  impact?: AnimLayer;
  /** When damage is applied, in ms from the animation start (preferred over damageFrame). */
  damageMs?: number;
  /** Fallback: character frame (1-based) on which damage is applied, if damageMs is absent. */
  damageFrame?: number;
  /** Float the damage number after the impact finishes (vs. at the damage moment). */
  damageAfterImpact?: boolean;
  /** Hide the actor's static battle sprite while the character frames play (they replace it). */
  hideActor?: boolean;
}

export const SKILL_ANIM: Record<string, SkillAnim> = {
  // Photon Beam — the Photon Vanguard test sequence. The Vanguard animates IN PLACE through his five
  // poses (idle → load → aim → fire → final); on the FIRE/FINAL beat a photon beam springs from his
  // muzzle and spans to the enemy, the Sol-Aloha explosion blooms on the foe as it lands, damage is
  // applied on impact, and the number floats up after the blast.
  photonBeam: {
    hideActor: true,
    damageMs: 600,
    damageAfterImpact: true,
    character: { dir: "photon-vanguard", frames: 5, frameMs: 130, at: "actor", scale: 1.12 },
    effect: {
      dir: "photon-beam", frames: 3, frameMs: 100, at: "muzzleToTarget", startMs: 520,
      offsetX: -0.46, offsetY: -0.12, thickness: 0.16, scale: 1.06, blend: "screen",
    },
    impact: {
      dir: "sol-aloha", frames: 5, frameMs: 95, at: "target", startMs: 580,
      scale: 1.25, blend: "screen",
    },
  },
};
