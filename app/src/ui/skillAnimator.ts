// Reusable combat-animation COMPOSITOR. Given a SkillAnim definition (data/skillAnimations) and the
// actor + target sprite elements, it layers the character / effect / impact animations over the
// battle stage and schedules them off the character layer's frames — exactly the pipeline Dara asked
// for:
//
//   background + enemy sprite  =  the live stage (NOT baked into any layer)
//   character / effect / impact =  transparent frame PNGs composited on top
//   damage timing               =  driven by the character layer's frame index
//
// Each layer is ONE persistent <img> sprite that swaps through its frames and, if it has `travel`,
// GLIDES smoothly (CSS-transitioned) from the actor toward the target — so the firing figure slides
// in cleanly instead of stamping a row of stepped ghosts. The whole sprite fades in at the start and
// out at the end (like the crit burst). Pure presentation: the caller (battle controller) applies
// damage and floats the number via the callbacks and owns game state.
//
// Frames are PRELOADED first so each sprite gets an explicit width AND height from the image's natural
// aspect the instant it appears (a height + width:auto element is zero-width until the PNG loads).

import { assetUrl } from "../core/assets";
import type { AnimLayer, SkillAnim } from "../data/skillAnimations";

interface Geo { cx: number; cy: number; w: number; h: number; }
interface XY { x: number; y: number; }

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

const frameUrl = (layer: AnimLayer, idx: number): string | null =>
  assetUrl(`fx/${layer.dir}/${String(idx + 1).padStart(2, "0")}.png`);

/** Play a skill's layered animation. Returns nothing; drives the caller via the opts callbacks. */
export function playSkillAnim(anim: SkillAnim, o: PlayOpts): void {
  const stage = o.stage;
  const A = geo(o.actor, stage), T = geo(o.target, stage);
  const refH = A.h || 110;                               // combatant-relative sizing reference
  const dist = Math.max(1, Math.hypot(T.cx - A.cx, T.cy - A.cy));
  const live: HTMLElement[] = [];
  const timers: number[] = [];
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, Math.max(0, ms)));
  const nat: Record<string, { w: number; h: number }> = {};   // natural frame sizes (from preload)

  if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "hidden";

  // Anchor point for a layer at travel-fraction `frac` (0 = at the actor, travel = its glide end).
  function anchor(layer: AnimLayer, frac: number): XY {
    let x = A.cx, y = A.cy;
    if (layer.at === "target") { x = T.cx; y = T.cy; }
    else if (layer.at === "between") { x = (A.cx + T.cx) / 2; y = (A.cy + T.cy) / 2; }
    else { x = A.cx + (T.cx - A.cx) * frac; y = A.cy + (T.cy - A.cy) * frac; } // actor (+ optional drift)
    return { x: x + (layer.offsetX || 0) * (layer.flip ? -1 : 1), y: y + (layer.offsetY || 0) };
  }
  function sizeFor(layer: AnimLayer, url: string): { w: number; h: number } {
    const n = nat[url] || { w: 1, h: 1 }, scale = layer.scale ?? 1;
    if (layer.sizeBy === "width") { const w = Math.round(scale * dist); return { w, h: Math.round((w * n.h) / n.w) }; }
    const h = Math.round(scale * refH); return { w: Math.round((h * n.w) / n.h), h };
  }

  // One layer = one sprite that swaps frames, glides if it has travel, and fades in/out as a whole.
  function playLayer(layer: AnimLayer, baseDelay: number): void {
    const total = layer.frames * layer.frameMs;
    const tf = "translate(-50%,-50%)" + (layer.flip ? " scaleX(-1)" : "");
    let img: HTMLImageElement;
    const setFrame = (idx: number) => {
      const url = frameUrl(layer, idx); if (!url || !img) return;
      const sz = sizeFor(layer, url);
      img.src = url; img.style.width = sz.w + "px"; img.style.height = sz.h + "px";
    };
    at(baseDelay, () => {
      img = document.createElement("img");
      img.className = "anim-sprite" + (layer.blend === "screen" ? " screen" : "");
      img.decoding = "sync";
      img.style.transform = tf;
      const p = anchor(layer, 0);
      img.style.left = p.x + "px"; img.style.top = p.y + "px";
      img.style.opacity = "0";
      setFrame(0);
      stage.appendChild(img); live.push(img);
    });
    // next tick: fade in, and (if travelling) glide to the end anchor over the layer duration
    at(baseDelay + 16, () => {
      if (!img) return;
      const glide = layer.travel ? `, left ${total}ms linear, top ${total}ms linear` : "";
      img.style.transition = `opacity 120ms ease${glide}`;
      img.style.opacity = "1";
      if (layer.travel) { const e = anchor(layer, layer.travel); img.style.left = e.x + "px"; img.style.top = e.y + "px"; }
    });
    for (let i = 1; i < layer.frames; i++) at(baseDelay + i * layer.frameMs, () => setFrame(i));
    at(baseDelay + total, () => { if (img) { img.style.transition = "opacity 180ms ease"; img.style.opacity = "0"; } });
    at(baseDelay + total + 220, () => { if (img) img.remove(); });
  }

  function runTimeline(): void {
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

    at(lastEnd + 460, () => {
      timers.forEach(clearTimeout);
      live.forEach((e) => e.remove());
      if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "";
      o.onComplete && o.onComplete();
    });
  }

  // PRELOAD every frame (capturing natural size), then run — with a hard cap so a slow/missing image
  // can never stall the turn. Preloaded images are cached, so the sprites paint immediately.
  const urls: string[] = [];
  for (const L of [anim.character, anim.effect, anim.impact]) {
    if (!L) continue;
    for (let i = 0; i < L.frames; i++) { const u = frameUrl(L, i); if (u) urls.push(u); }
  }
  let pending = urls.length, started = false;
  const start = () => { if (!started) { started = true; runTimeline(); } };
  if (!pending) start();
  urls.forEach((u) => {
    const im = new Image();
    im.onload = im.onerror = () => { nat[u] = { w: im.naturalWidth || 1, h: im.naturalHeight || 1 }; if (--pending <= 0) start(); };
    im.src = u;
  });
  window.setTimeout(start, 350); // safety: never wait on a hung load
}
