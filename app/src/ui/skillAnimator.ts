// Reusable combat-animation COMPOSITOR. Given a SkillAnim definition (data/skillAnimations) and the
// actor + target sprite elements, it layers the character / effect / impact animations over the
// battle stage — exactly the pipeline Dara asked for:
//
//   background + enemy sprite   =  the live stage (NOT baked into any layer)
//   character / effect / impact =  transparent frame PNGs composited on top
//   damage timing               =  scheduled to land with the hit
//
// Each layer pre-creates ALL its frame <img>s up front, stacked in place, and animates by toggling
// which one is visible — we NEVER swap a live image's src (that re-decodes and flashes a blank frame,
// which read as the sprite "flickering / going invisible"). A ranged attack: the character animates
// where it stands; the beam layer SPANS from the actor's muzzle to the target. Glows render with a
// normal alpha composite + a drop-shadow halo (NOT mix-blend screen, which washes out over bright
// backgrounds). Pure presentation — the caller applies damage / floats the number via callbacks.

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
  // y→height). A `muzzleToTarget` beam spans from the muzzle (actor centre + offset) to the target.
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

  // One layer = all its frames pre-stacked at the same spot; we toggle which is visible (no src swap).
  function playLayer(layer: AnimLayer, startMs: number): void {
    const total = layer.frames * layer.frameMs;
    const imgs: HTMLImageElement[] = [];
    at(startMs, () => {
      for (let i = 0; i < layer.frames; i++) {
        const url = frameUrl(layer, i); if (!url) { imgs.push(null as unknown as HTMLImageElement); continue; }
        const b = box(layer, url);
        const img = document.createElement("img");
        img.className = "anim-sprite" + (layer.blend === "screen" ? " glow" : "");
        img.decoding = "sync"; img.src = url;
        img.style.width = Math.round(b.w) + "px"; img.style.height = Math.round(b.h) + "px";
        img.style.left = b.cx + "px"; img.style.top = b.cy + "px";
        img.style.transform = "translate(-50%,-50%)" + (b.flip ? " scaleX(-1)" : "");
        img.style.transition = "opacity 70ms linear";
        img.style.opacity = "0";
        stage.appendChild(img); imgs.push(img); live.push(img);
      }
    });
    // show each frame in turn (cross-fade via the 70ms transition); never touches src.
    for (let i = 0; i < layer.frames; i++) {
      at(startMs + 8 + i * layer.frameMs, () => imgs.forEach((im, j) => { if (im) im.style.opacity = j === i ? "1" : "0"; }));
    }
    at(startMs + total, () => { const last = imgs[layer.frames - 1]; if (last) { last.style.transition = "opacity 180ms ease"; last.style.opacity = "0"; } });
    at(startMs + total + 240, () => imgs.forEach((im) => im && im.remove()));
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

    at(lastEnd + 320, () => {
      timers.forEach(clearTimeout);
      live.forEach((e) => e.remove());
      if (anim.hideActor) (o.actor as HTMLElement).style.visibility = "";
      o.onComplete && o.onComplete();
    });
  }

  // PRELOAD every frame (capturing natural size), then run — with a hard cap so a slow/missing image
  // can never stall the turn. Preloaded images are cached, so the stacked sprites paint immediately.
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
