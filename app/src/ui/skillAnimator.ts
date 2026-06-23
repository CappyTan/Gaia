// Reusable combat-animation COMPOSITOR. Given a SkillAnim definition (data/skillAnimations) and the
// actor + target sprite elements, it layers the character / effect / impact frames over the battle
// stage and schedules them off the character layer's frames — exactly the pipeline Dara asked for:
//
//   background + enemy sprite  =  the live stage (NOT baked into any layer)
//   character / effect / impact =  transparent frame PNGs composited on top
//   damage timing               =  driven by the character layer's frame index
//
// Each frame is a short-lived <img> that fades in and out (like the crit burst), so a sequence reads
// as a smooth glowing animation. The compositor is pure presentation: the caller (battle controller)
// passes callbacks for when to apply damage and when to float the number, and owns game state.

import { assetUrl } from "../core/assets";
import type { AnimLayer, SkillAnim } from "../data/skillAnimations";

interface Geo { cx: number; cy: number; w: number; h: number; }

export interface PlayOpts {
  stage: HTMLElement;
  actor: Element;            // the actor's sprite element (anchor + hidden while firing)
  target: Element;          // the target's sprite element (impact anchor)
  onDamage?: () => void;     // fired on the character layer's damageFrame
  onImpact?: () => void;     // fired when the hit lands (float the number here)
  onComplete?: () => void;   // fired after everything has played and been cleaned up
}

function geo(el: Element, stage: HTMLElement): Geo {
  const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
  return { cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2, w: r.width, h: r.height };
}

/** Play a skill's layered animation. Returns nothing; drives the caller via the opts callbacks. */
export function playSkillAnim(anim: SkillAnim, o: PlayOpts): void {
  const stage = o.stage;
  const A = geo(o.actor, stage), T = geo(o.target, stage);
  const refH = A.h || 110;                               // combatant-relative sizing reference
  const dist = Math.max(1, Math.hypot(T.cx - A.cx, T.cy - A.cy));
  const live: HTMLElement[] = [];
  const timers: number[] = [];
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, Math.max(0, ms)));

  if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "hidden";

  // Spawn one fading frame of a layer at frame index `idx` (0-based).
  function spawnFrame(layer: AnimLayer, idx: number): void {
    const url = assetUrl(`fx/${layer.dir}/${String(idx + 1).padStart(2, "0")}.png`);
    if (!url) return;
    let cx = A.cx, cy = A.cy;
    if (layer.at === "target") { cx = T.cx; cy = T.cy; }
    else if (layer.at === "between") { cx = (A.cx + T.cx) / 2; cy = (A.cy + T.cy) / 2; }
    else if (layer.travel) {                              // actor layer drifting toward the target
      const f = (layer.frames > 1 ? idx / (layer.frames - 1) : 0) * layer.travel;
      cx = A.cx + (T.cx - A.cx) * f; cy = A.cy + (T.cy - A.cy) * f;
    }
    cx += (layer.offsetX || 0) * (layer.flip ? -1 : 1);   // offset follows the facing
    cy += (layer.offsetY || 0);

    const img = document.createElement("img");
    img.className = "anim-frame" + (layer.blend === "screen" ? " screen" : "");
    img.src = url;
    img.decoding = "sync";
    const scale = layer.scale ?? 1;
    if (layer.sizeBy === "width") { img.style.width = Math.round(scale * dist) + "px"; img.style.height = "auto"; }
    else { img.style.height = Math.round(scale * refH) + "px"; img.style.width = "auto"; }
    img.style.left = cx + "px"; img.style.top = cy + "px";
    img.style.transform = "translate(-50%,-50%)" + (layer.flip ? " scaleX(-1)" : "");
    img.style.setProperty("--d", Math.round(layer.frameMs * 1.6) + "ms");
    stage.appendChild(img); live.push(img);
    at(layer.frameMs * 1.6, () => img.remove());          // frame fades out and removes itself
  }

  function playLayer(layer: AnimLayer, baseDelay: number): void {
    for (let i = 0; i < layer.frames; i++) at(baseDelay + i * layer.frameMs, () => spawnFrame(layer, i));
  }

  const ch = anim.character;
  const charMs = ch.frameMs;
  playLayer(ch, 0);

  let lastEnd = ch.frames * charMs;
  if (anim.effect && anim.effect.startFrame) {
    const start = (anim.effect.startFrame - 1) * charMs;
    playLayer(anim.effect, start);
    lastEnd = Math.max(lastEnd, start + anim.effect.frames * anim.effect.frameMs);
  }
  let impactEnd = ch.frames * charMs;
  if (anim.impact) {
    const start = ((anim.impact.startFrame ?? ch.frames) - 1) * charMs;
    playLayer(anim.impact, start);
    impactEnd = start + anim.impact.frames * anim.impact.frameMs;
    lastEnd = Math.max(lastEnd, impactEnd);
  }

  at((anim.damageFrame - 1) * charMs, () => o.onDamage && o.onDamage());
  at(anim.damageAfterImpact ? impactEnd : (anim.damageFrame - 1) * charMs, () => o.onImpact && o.onImpact());

  at(lastEnd + 220, () => {
    timers.forEach(clearTimeout);
    live.forEach((e) => e.remove());
    if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "";
    o.onComplete && o.onComplete();
  });
}
