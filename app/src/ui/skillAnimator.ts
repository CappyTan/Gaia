// Reusable combat-animation COMPOSITOR. Given a SkillAnim definition (data/skillAnimations) and the
// actor + target sprite elements, it layers the character / effect / impact animations over the
// battle stage — exactly the pipeline Dara asked for:
//
//   background + enemy sprite   =  the live stage (NOT baked into any layer)
//   character / effect / impact =  transparent frame PNGs composited on top
//   damage timing               =  scheduled to land with the hit
//
// Each layer is ONE persistent <img> sprite that stays in place and swaps through its frames (a
// ranged attack: the figure animates where it stands; nobody slides across the screen). The whole
// sprite fades in at the start and out at the end. The beam layer is special: it SPANS from the
// actor's muzzle to the target, so it reads as a shot fired from the gun into the enemy. Pure
// presentation — the caller (battle controller) applies damage / floats the number via callbacks.
//
// Frames are PRELOADED first so each sprite gets an explicit width AND height the instant it appears.

import { assetUrl } from "../core/assets";
import type { AnimLayer, SkillAnim } from "../data/skillAnimations";

interface Geo { cx: number; cy: number; w: number; h: number; }
interface Box { cx: number; cy: number; w: number; h: number; flip: boolean; }

export interface PlayOpts {
  stage: HTMLElement;
  actor: Element;            // the actor's sprite element (anchor + hidden while firing)
  target: Element;          // the target's sprite element (beam end + impact anchor)
  onDamage?: () => void;     // fired when the hit lands (apply damage)
  onImpact?: () => void;     // fired to float the number (after impact, per the def)
  onComplete?: () => void;   // fired after everything has played and been cleaned up
}

function geo(el: Element, stage: HTMLElement): Geo {
  const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
  return { cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2, w: r.width || 1, h: r.height || 1 };
}

const frameUrl = (layer: AnimLayer, idx: number): string | null =>
  assetUrl(`fx/${layer.dir}/${String(idx + 1).padStart(2, "0")}.png`);

/** Play a skill's layered animation. Returns nothing; drives the caller via the opts callbacks. */
export function playSkillAnim(anim: SkillAnim, o: PlayOpts): void {
  const stage = o.stage;
  const A = geo(o.actor, stage), T = geo(o.target, stage);
  const live: HTMLElement[] = [];
  const timers: number[] = [];
  const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, Math.max(0, ms)));
  const nat: Record<string, { w: number; h: number }> = {};   // natural frame sizes (from preload)

  if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "hidden";

  // Where + how big a layer's frame draws. Offsets are FRACTIONS of the actor sprite (x→width,
  // y→height) so placement scales with the rendered size. A `muzzleToTarget` beam spans from the
  // muzzle (actor centre + offset) to the target, with a fixed thickness.
  function box(layer: AnimLayer, url: string): Box {
    const n = nat[url] || { w: 1, h: 1 }, scale = layer.scale ?? 1;
    const ox = (layer.offsetX || 0) * A.w, oy = (layer.offsetY || 0) * A.h;
    if (layer.at === "muzzleToTarget") {
      const mx = A.cx + ox, my = A.cy + oy;
      const w = Math.max(1, Math.hypot(T.cx - mx, T.cy - my)) * scale;
      const h = (layer.thickness ?? 0.18) * A.h;
      return { cx: (mx + T.cx) / 2, cy: (my + T.cy) / 2, w, h, flip: !!layer.flip };
    }
    const refH = layer.at === "target" ? T.h : A.h;     // explosion scales to the enemy
    const h = scale * refH, w = (h * n.w) / n.h;
    let cx = A.cx, cy = A.cy;
    if (layer.at === "target") { cx = T.cx; cy = T.cy; }
    else if (layer.at === "between") { cx = (A.cx + T.cx) / 2; cy = (A.cy + T.cy) / 2; }
    return { cx: cx + ox, cy: cy + oy, w, h, flip: !!layer.flip };
  }

  // One layer = one sprite that swaps frames in place and fades in/out as a whole.
  function playLayer(layer: AnimLayer, startMs: number): void {
    const total = layer.frames * layer.frameMs;
    let img: HTMLImageElement;
    const setFrame = (idx: number) => {
      const url = frameUrl(layer, idx); if (!url || !img) return;
      const b = box(layer, url);
      img.src = url;
      img.style.width = Math.round(b.w) + "px"; img.style.height = Math.round(b.h) + "px";
      img.style.left = b.cx + "px"; img.style.top = b.cy + "px";
    };
    at(startMs, () => {
      img = document.createElement("img");
      img.className = "anim-sprite" + (layer.blend === "screen" ? " screen" : "");
      img.decoding = "sync";
      img.style.transform = "translate(-50%,-50%)" + (layer.flip ? " scaleX(-1)" : "");
      img.style.opacity = "0";
      setFrame(0);
      stage.appendChild(img); live.push(img);
    });
    at(startMs + 16, () => { if (img) { img.style.transition = "opacity 110ms ease"; img.style.opacity = "1"; } });
    for (let i = 1; i < layer.frames; i++) at(startMs + i * layer.frameMs, () => setFrame(i));
    at(startMs + total, () => { if (img) { img.style.transition = "opacity 200ms ease"; img.style.opacity = "0"; } });
    at(startMs + total + 240, () => { if (img) img.remove(); });
  }

  function runTimeline(): void {
    const ch = anim.character, charMs = ch.frameMs, charDur = ch.frames * charMs;
    const layerStart = (l: AnimLayer, fallback: number) =>
      l.startMs != null ? l.startMs : l.startFrame != null ? (l.startFrame - 1) * charMs : fallback;

    playLayer(ch, 0);
    let lastEnd = charDur;

    let effectEnd = charDur;
    if (anim.effect) {
      const s = layerStart(anim.effect, charDur);
      playLayer(anim.effect, s);
      effectEnd = s + anim.effect.frames * anim.effect.frameMs;
      lastEnd = Math.max(lastEnd, effectEnd);
    }
    let impactEnd = effectEnd;
    if (anim.impact) {
      const s = layerStart(anim.impact, anim.effect ? effectEnd : charDur);
      playLayer(anim.impact, s);
      impactEnd = s + anim.impact.frames * anim.impact.frameMs;
      lastEnd = Math.max(lastEnd, impactEnd);
    }

    const dmgTime = anim.damageMs != null ? anim.damageMs : ((anim.damageFrame ?? 1) - 1) * charMs;
    at(dmgTime, () => o.onDamage && o.onDamage());
    at(anim.damageAfterImpact ? impactEnd : dmgTime, () => o.onImpact && o.onImpact());

    at(lastEnd + 300, () => {
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
