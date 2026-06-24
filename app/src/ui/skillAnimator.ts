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
interface Box { cx: number; cy: number; w: number; h: number; flip: boolean; rot: number; }

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
  const actorEl = o.actor as HTMLElement;
  const setActorHidden = (h: boolean) => { if (anim.hideActor) actorEl.style.visibility = h ? "hidden" : ""; };
  setActorHidden(true); // hide the static doll IMMEDIATELY (before preload) so it never shows a frame
                        // of the idle/lunge before the firing frames begin — that gap read as a flicker.

  // Where + how big a layer's frame draws. Offsets are FRACTIONS of the actor sprite (x→width,
  // y→height). A `muzzleToTarget` beam spans from the muzzle (actor centre + offset) to the target.
  function box(layer: AnimLayer, url: string): Box {
    const n = nat[url] || { w: 1, h: 1 }, scale = layer.scale ?? 1;
    const ox = (layer.offsetX || 0) * A.w, oy = (layer.offsetY || 0) * A.h;
    if (layer.at === "muzzleToTarget") {
      // a uniform bar from the muzzle (actor centre + offset) to the target, ROTATED to connect the
      // two points exactly (so the ends meet the gun and the enemy regardless of height difference).
      const mx = A.cx + ox, my = A.cy + oy;
      const dx = T.cx - mx, dy = T.cy - my;
      const w = Math.max(1, Math.hypot(dx, dy)) * scale;     // scale slightly >1 to overlap the impact
      const h = (layer.thickness ?? 0.18) * A.h;
      return { cx: (mx + T.cx) / 2, cy: (my + T.cy) / 2, w, h, flip: false, rot: Math.atan2(dy, dx) };
    }
    const refH = layer.at === "target" ? T.h : A.h;     // explosion scales to the enemy
    const h = scale * refH, w = (h * n.w) / n.h;
    if (layer.at === "muzzle") {
      // the cast flash sits at the barrel (actor centre + offset), ROTATED to face the target so it
      // points down-range (works for either side — the angle flips it toward a left- or right-hand foe).
      const mx = A.cx + ox, my = A.cy + oy;
      return { cx: mx, cy: my, w, h, flip: !!layer.flip, rot: Math.atan2(T.cy - my, T.cx - mx) };
    }
    let cx = A.cx, cy = A.cy;
    if (layer.at === "target") { cx = T.cx; cy = T.cy; }
    else if (layer.at === "between") { cx = (A.cx + T.cx) / 2; cy = (A.cy + T.cy) / 2; }
    return { cx: cx + ox, cy: cy + oy, w, h, flip: !!layer.flip, rot: 0 };
  }

  // A PROJECTILE that flies from the barrel to the target: its frames live in a wrapper we TRANSLATE
  // (CSS left/top transition) from muzzle → target over travelMs, rotated along the path, while the
  // frames cross-fade inside it. The screen travel IS the motion (a bullet leaving the rifle).
  function playTravelLayer(layer: AnimLayer, startMs: number): void {
    const url0 = frameUrl(layer, 0); if (!url0) return;
    const n = nat[url0] || { w: 1, h: 1 }, scale = layer.scale ?? 0.35;
    const h = scale * A.h, w = (h * n.w) / n.h;
    const ox = (layer.offsetX || 0) * A.w, oy = (layer.offsetY || 0) * A.h;
    const mx = A.cx + ox, my = A.cy + oy;          // barrel (start)
    const rot = Math.atan2(T.cy - my, T.cx - mx);  // aim the streak along its flight
    const travel = layer.travelMs ?? 260;
    at(startMs, () => {
      const wrap = document.createElement("div");
      wrap.style.position = "absolute"; wrap.style.pointerEvents = "none";
      wrap.style.width = Math.round(w) + "px"; wrap.style.height = Math.round(h) + "px";
      wrap.style.left = mx + "px"; wrap.style.top = my + "px";
      wrap.style.transform = `translate(-50%,-50%) rotate(${rot}rad)` + (layer.flip ? " scaleX(-1)" : "");
      wrap.style.transition = `left ${travel}ms linear, top ${travel}ms linear`;
      const imgs: HTMLImageElement[] = [];
      for (let i = 0; i < layer.frames; i++) {
        const u = frameUrl(layer, i);
        const img = document.createElement("img");
        img.className = "anim-sprite" + (layer.blend === "screen" ? " glow" : "");
        img.decoding = "sync"; if (u) img.src = u;
        img.style.position = "absolute"; img.style.left = "0"; img.style.top = "0";
        img.style.width = "100%"; img.style.height = "100%"; img.style.transform = "none";
        img.style.transition = "opacity 60ms linear"; img.style.opacity = i === 0 ? "1" : "0";
        wrap.appendChild(img); imgs.push(img);
      }
      stage.appendChild(wrap); live.push(wrap);
      requestAnimationFrame(() => { wrap.style.left = T.cx + "px"; wrap.style.top = T.cy + "px"; });
      for (let i = 1; i < layer.frames; i++)
        at(startMs + i * layer.frameMs, () => imgs.forEach((im, j) => { im.style.opacity = j === i ? "1" : "0"; }));
      at(startMs + travel, () => { wrap.style.transition += ", opacity 120ms ease"; wrap.style.opacity = "0"; });
      at(startMs + travel + 220, () => wrap.remove());
    });
  }

  // One layer = all its frames pre-stacked at the same spot; we toggle which is visible (no src swap).
  function playLayer(layer: AnimLayer, startMs: number): void {
    if (layer.at === "travel") { playTravelLayer(layer, startMs); return; }
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
        img.style.transform = "translate(-50%,-50%)" + (b.rot ? ` rotate(${b.rot}rad)` : "") + (b.flip ? " scaleX(-1)" : "");
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

    // A layer's on-screen duration: a travel projectile lasts its flight time; others, all their frames.
    const dur = (l: AnimLayer) => l.at === "travel" ? (l.travelMs ?? 260) : l.frames * l.frameMs;

    // The doll was hidden up front; restore it when the firing frames end so the hero's idle pose
    // holds through the beam/impact (never absent). (Hidden immediately at call time, not here, so no
    // pre-animation flicker.)
    playLayer(ch, 0);
    at(charDur, () => setActorHidden(false));
    let lastEnd = charDur;

    if (anim.muzzle) {                         // cast VFX at the barrel (the muzzle flash)
      const s = layerStart(anim.muzzle, charDur);
      playLayer(anim.muzzle, s);
      lastEnd = Math.max(lastEnd, s + dur(anim.muzzle));
    }

    let effectEnd = charDur;
    if (anim.effect) {
      const s = layerStart(anim.effect, charDur);
      playLayer(anim.effect, s);
      effectEnd = s + dur(anim.effect);
      lastEnd = Math.max(lastEnd, effectEnd);
    }
    let impactEnd = effectEnd;
    if (anim.impact) {
      const s = layerStart(anim.impact, anim.effect ? effectEnd : charDur);
      playLayer(anim.impact, s);
      impactEnd = s + dur(anim.impact);
      lastEnd = Math.max(lastEnd, impactEnd);
    }

    const dmgTime = anim.damageMs != null ? anim.damageMs : ((anim.damageFrame ?? 1) - 1) * charMs;
    at(dmgTime, () => o.onDamage && o.onDamage());
    at(anim.damageAfterImpact ? impactEnd : dmgTime, () => o.onImpact && o.onImpact());

    at(lastEnd + 320, () => {
      timers.forEach(clearTimeout);
      live.forEach((e) => e.remove());
      setActorHidden(false); // safety: ensure the doll is visible again
      o.onComplete && o.onComplete();
    });
  }

  // PRELOAD every frame (capturing natural size), then run — with a hard cap so a slow/missing image
  // can never stall the turn. Preloaded images are cached, so the stacked sprites paint immediately.
  const urls: string[] = [];
  for (const L of [anim.character, anim.muzzle, anim.effect, anim.impact]) {
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
