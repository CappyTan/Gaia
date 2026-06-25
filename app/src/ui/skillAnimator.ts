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
import { ATT } from "../data/attunements";
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
        img.decoding = "sync";
        img.onload = () => {   // refine the wrapper to the streak's real aspect once known
          if (!img.naturalWidth) return;
          nat[u || ""] = { w: img.naturalWidth, h: img.naturalHeight };
          wrap.style.width = Math.round((h * img.naturalWidth) / img.naturalHeight) + "px";
        };
        if (u) img.src = u;
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

  // Apply a layer-frame's computed geometry (size + position + rotation/flip) to an <img>.
  const applyBox = (img: HTMLImageElement, b: Box) => {
    img.style.width = Math.round(b.w) + "px"; img.style.height = Math.round(b.h) + "px";
    img.style.left = b.cx + "px"; img.style.top = b.cy + "px";
    img.style.transform = "translate(-50%,-50%)" + (b.rot ? ` rotate(${b.rot}rad)` : "") + (b.flip ? " scaleX(-1)" : "");
  };

  // One layer = all its frames pre-stacked at the same spot; we toggle which is visible (no src swap).
  function playLayer(layer: AnimLayer, startMs: number): void {
    if (layer.at === "travel") { playTravelLayer(layer, startMs); return; }
    const total = layer.frames * layer.frameMs;
    const imgs: HTMLImageElement[] = [];
    at(startMs, () => {
      for (let i = 0; i < layer.frames; i++) {
        const url = frameUrl(layer, i); if (!url) { imgs.push(null as unknown as HTMLImageElement); continue; }
        const img = document.createElement("img");
        img.className = "anim-sprite" + (layer.blend === "screen" ? " glow" : "");
        img.decoding = "sync";
        applyBox(img, box(layer, url));          // sized from the known/fallback aspect …
        img.onload = () => {                       // … then snap to the real aspect once it loads
          if (img.naturalWidth) { nat[url] = { w: img.naturalWidth, h: img.naturalHeight }; applyBox(img, box(layer, url)); }
        };
        img.src = url;
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

  // RUN IMMEDIATELY — do NOT gate the timeline on a preload. We used to hide the actor up front, then
  // wait for every frame to preload before starting; on iOS/PWA a cached image's load event can simply
  // never fire, so the start fell to a 350ms safety AND the real frame requests stalled — the hero sat
  // hidden with nothing drawn for ~a second (the intermittent "vanish"). Now each frame paints with a
  // sane fallback size and snaps to its true aspect on its own load (see playLayer/applyBox), so the
  // sequence always renders on time and the hide↔restore is driven purely by the timeline clock.
  // We still warm the cache (best-effort, ungated) so the first paint is crisp.
  for (const L of [anim.character, anim.muzzle, anim.effect, anim.impact]) {
    if (!L) continue;
    for (let i = 0; i < L.frames; i++) {
      const u = frameUrl(L, i); if (!u || nat[u]) continue;
      const im = new Image();
      im.onload = () => { nat[u] = { w: im.naturalWidth || 1, h: im.naturalHeight || 1 }; };
      im.src = u;
    }
  }
  runTimeline();
}

// ── Universal mana-SLASH impact VFX ──────────────────────────────────────────────────────────────
// The single, universal hit-confirm played ON the struck unit for EVERY damaging hit (normal attacks,
// skills, signatures, ultimates), tinted by the ATTACKER's Attunement (fx/slash-<att>.png). A directional
// energy crescent that snaps over the target's centre, flashes (fade-in → peak glow + a particle burst →
// brief hold → fade-out, ~150-180ms), and clears — it does NOT travel. Scales to the target sprite and
// stays centred; screen-blended so the glow reads as light. No-op if that Attunement's art is absent.
//
//   • per hit: rotation jitter, scale ±10%, position ±5px (so combo hits never look identical)
//   • crit:    bigger (~+20%), stronger glow, more particles, + a subtle camera shake
//   • mirror:  the art is drawn for an enemy→hero hit; hero→enemy hits flip it horizontally (Dara)
//   • pooled:  slash units (a root + img + particle spans) are reused, not re-created each hit
//
// Implemented with the Web Animations API (rich keyframes, auto-cleanup) + a setTimeout safety so the
// unit is always returned to the pool even where WAAPI isn't driven (e.g. jsdom tests).

interface SlashUnit { root: HTMLDivElement; img: HTMLImageElement; parts: HTMLSpanElement[]; }
const SLASH_PARTS = 12;        // max particles per unit (we show a subset per hit)
const slashPool: SlashUnit[] = [];

function makeSlashUnit(): SlashUnit {
  const root = document.createElement("div"); root.className = "slash-fx";
  const img = document.createElement("img"); img.className = "slash-img"; img.decoding = "sync";
  root.appendChild(img);
  const parts: HTMLSpanElement[] = [];
  for (let i = 0; i < SLASH_PARTS; i++) { const s = document.createElement("span"); s.className = "slash-part"; root.appendChild(s); parts.push(s); }
  return { root, img, parts };
}

export interface SlashOpts { crit?: boolean; mirror?: boolean; }

/** Flash the attacker-Attunement slash over `targetEl`. att is a Unit Attunement (e.g. "SOL"). */
export function playSlash(stage: HTMLElement, targetEl: Element, att: string, opts: SlashOpts = {}): void {
  const url = assetUrl(`fx/slash-${att.toLowerCase()}.png`);
  if (!url) return;                                  // art not present → skip silently
  const crit = !!opts.crit, mir = opts.mirror ? -1 : 1;
  const color = ATT[att as keyof typeof ATT]?.color || "#fff";
  const r = targetEl.getBoundingClientRect(), s = stage.getBoundingClientRect();
  const cx = r.left - s.left + (r.width || 1) / 2 + (Math.random() * 10 - 5);   // centred ±5px
  const cy = r.top - s.top + (r.height || 1) / 2 + (Math.random() * 10 - 5);
  const span = Math.max(r.width || 40, r.height || 40) * (crit ? 1.85 : 1.5);   // ~1.5× the sprite
  const sz = span * (0.9 + Math.random() * 0.2);                                 // scale ±10%
  const rot = Math.random() * 44 - 22;                                           // ±22° jitter around base

  const u = slashPool.pop() || makeSlashUnit();
  const { root, img, parts } = u;
  img.src = url;
  img.style.filter = crit
    ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}) brightness(1.25)`
    : `drop-shadow(0 0 6px ${color}) brightness(1.1)`;
  root.style.left = cx + "px"; root.style.top = cy + "px";
  root.style.width = root.style.height = Math.round(sz) + "px";
  stage.appendChild(root);

  const peak = crit ? 0.98 : 0.9, dur = crit ? 210 : 170;
  const tf = (k: number) => `rotate(${rot}deg) scale(${(k * mir).toFixed(3)},${k.toFixed(3)})`;
  let released = false;
  const release = () => { if (released) return; released = true; root.remove(); slashPool.push(u); };

  if (img.animate) {
    img.animate(
      [ { opacity: 0, transform: tf(0.82) },
        { opacity: peak, transform: tf(1.06), offset: 0.32 },
        { opacity: peak, transform: tf(1.0), offset: 0.55 },
        { opacity: 0, transform: tf(1.0) } ],
      { duration: dur, easing: "ease-out" });
  }
  // particle burst, fired outward from the centre
  const n = crit ? 11 : 6;
  for (let i = 0; i < SLASH_PARTS; i++) {
    const p = parts[i];
    if (i >= n) { p.style.display = "none"; continue; }
    p.style.display = ""; p.style.background = color; p.style.boxShadow = `0 0 6px ${color}`;
    const ps = (crit ? 7 : 5) * (0.7 + Math.random() * 0.7);
    p.style.width = p.style.height = ps.toFixed(1) + "px";
    if (p.animate) {
      const ang = Math.random() * Math.PI * 2, dist = (crit ? 46 : 30) * (0.55 + Math.random() * 0.7);
      p.animate(
        [ { transform: "translate(-50%,-50%) translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(-50%,-50%) translate(${(Math.cos(ang) * dist).toFixed(1)}px,${(Math.sin(ang) * dist).toFixed(1)}px) scale(.4)`, opacity: 0 } ],
        { duration: dur + 50, easing: "ease-out" });
    }
  }
  if (crit) {                                        // subtle camera shake on crits
    const field = document.getElementById("battleField") || stage;
    field.animate?.(
      [ { transform: "translate(0,0)" }, { transform: "translate(-5px,3px)" },
        { transform: "translate(4px,-3px)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(0,0)" } ],
      { duration: 200, easing: "ease-out" });
  }
  window.setTimeout(release, dur + 120);             // safety: always return the unit to the pool
}

// ── Mana CASTING CIRCLE ──────────────────────────────────────────────────────────────────────────
// A ground rune-circle laid UNDER a casting hero's feet for the duration of an ability cast, tinted to
// the caster's Attunement (fx/cast-<att>.png). It fades in, slowly rotates + pulses for ~CAST_MS, fires
// `onDone` (the caller applies the ability), then fades out. Centred under the feet, scaled to the
// sprite, and inserted BEHIND the combatant zones so the hero stands on top of it. It does not move.
// If the art is missing it just runs onDone immediately so the ability still resolves.
const CAST_FADE_MS = 160;      // quick fade-in
const CAST_HOLD_MS = 1500;     // ~1.5s cast, then apply + fade out
const CAST_OUT_MS = 450;       // smooth fade-out (longer than the fade-in)
const CAST_W = 1.7;            // circle width vs. the caster sprite's larger dimension
const CAST_FLATTEN = 0.6;      // extra ground flatten on top of the art's own squash (lower = flatter)

/** Play a casting circle under `casterEl` (positioned within `field`); calls `onDone` at cast end. */
export function playCast(field: HTMLElement, casterEl: Element, att: string, onDone: () => void): void {
  const url = assetUrl(`fx/cast-${att.toLowerCase()}.png`);
  if (!url) { onDone(); return; }                    // no art → don't block the ability
  const r = casterEl.getBoundingClientRect(), s = field.getBoundingClientRect();
  const cx = r.left - s.left + (r.width || 1) / 2;
  const cy = r.top - s.top + (r.height || 1);        // under the feet (sprite bottom)
  const w = Math.max(r.width || 40, r.height || 40) * CAST_W;

  const wrap = document.createElement("div"); wrap.className = "cast-circle";
  wrap.style.left = cx + "px"; wrap.style.top = cy + "px"; wrap.style.width = Math.round(w) + "px";
  wrap.style.opacity = "0"; wrap.style.transition = `opacity ${CAST_FADE_MS}ms ease`;
  const img = document.createElement("img"); img.className = "cast-circle-img"; img.decoding = "sync";
  // Per-asset squash so the spin stays in the ground plane: un-squash the ellipse to a circle, rotate,
  // re-squash flatter (see .cast-circle-img keyframes). k = width/height stretches height to a circle;
  // re-squashing by CAST_FLATTEN/k lays it flatter on the ground than the art's own perspective.
  img.onload = () => {
    if (!img.naturalHeight) return;
    const k = img.naturalWidth / img.naturalHeight;
    img.style.setProperty("--unsq", String(k));
    img.style.setProperty("--sq", String(CAST_FLATTEN / k));
  };
  img.src = url;
  wrap.appendChild(img);
  field.insertBefore(wrap, field.children[1] || null); // after #battleBg, before the combatant zones
  requestAnimationFrame(() => { wrap.style.opacity = "1"; });

  window.setTimeout(() => {
    onDone();                                          // cast complete → apply the ability
    wrap.style.transition = `opacity ${CAST_OUT_MS}ms ease`; // smooth fade-out (not an abrupt cut)
    wrap.style.opacity = "0";
    window.setTimeout(() => wrap.remove(), CAST_OUT_MS + 60);
  }, CAST_HOLD_MS);
}

// ── HEALING CIRCLE ───────────────────────────────────────────────────────────────────────────────
// Played UNDER a healed target, tinted to the CASTER's Attunement (not the recipient's). Two layers,
// both SEMI-TRANSPARENT and inserted behind the combatant zones so the sprite stays fully visible:
//   • a flat ground DISC (fx/heal-disc-<att>.png) that rotates in the ground plane (reuses the casting-
//     circle spin), and
//   • a rising COLUMN (fx/heal-col-<att>.png) of themed energy/particles that gently pulses.
// Fades in ~0.15s, holds ~1.1s while the hero idles, fires `onDone` (apply the heal + numbers), then
// fades out. No-op (runs onDone) if the art is absent.
const HEAL_FADE_MS = 150;
const HEAL_HOLD_MS = 1100;     // ~1.0-1.25s
const HEAL_OUT_MS = 420;
const HEAL_DISC_OP = 0.6;      // semi-transparent (sprite still reads through), but clearly visible
const HEAL_COL_OP = 0.72;

/** Play a healing circle under `targetEl` (within `field`), in the caster's Attunement `att`. */
export function playHeal(field: HTMLElement, targetEl: Element, att: string, onDone?: () => void): void {
  const a = att.toLowerCase();
  const discUrl = assetUrl(`fx/heal-disc-${a}.png`), colUrl = assetUrl(`fx/heal-col-${a}.png`);
  if (!discUrl && !colUrl) { onDone?.(); return; }
  const r = targetEl.getBoundingClientRect(), s = field.getBoundingClientRect();
  const cx = r.left - s.left + (r.width || 1) / 2;
  const feet = r.top - s.top + (r.height || 1);
  const h = r.height || 60;                            // size to the sprite HEIGHT so it reads big enough
  const anchor = field.querySelector("#enemyZone") || field.children[1] || null;
  const layers: { wrap: HTMLDivElement; op: number }[] = [];

  if (discUrl) {                                      // rotating flat ground disc (reuses the cast spin)
    const wrap = document.createElement("div"); wrap.className = "cast-circle";
    wrap.style.left = cx + "px"; wrap.style.top = feet + "px"; wrap.style.width = Math.round(h * 2.2) + "px";
    const img = document.createElement("img"); img.className = "cast-circle-img"; img.decoding = "sync";
    img.onload = () => { if (img.naturalHeight) { const k = img.naturalWidth / img.naturalHeight; img.style.setProperty("--unsq", String(k)); img.style.setProperty("--sq", String(CAST_FLATTEN / k)); } };
    img.src = discUrl; wrap.appendChild(img);
    field.insertBefore(wrap, anchor); layers.push({ wrap, op: HEAL_DISC_OP });
  }
  if (colUrl) {                                       // rising column of themed energy/particles (towers over the hero)
    const wrap = document.createElement("div"); wrap.className = "heal-col";
    wrap.style.left = cx + "px"; wrap.style.top = feet + "px"; wrap.style.width = Math.round(h * 2.0) + "px";
    const img = document.createElement("img"); img.className = "heal-col-img"; img.decoding = "sync"; img.src = colUrl;
    wrap.appendChild(img);
    field.insertBefore(wrap, anchor); layers.push({ wrap, op: HEAL_COL_OP });
  }
  layers.forEach((l) => { l.wrap.style.opacity = "0"; l.wrap.style.transition = `opacity ${HEAL_FADE_MS}ms ease`; });
  requestAnimationFrame(() => layers.forEach((l) => { l.wrap.style.opacity = String(l.op); }));

  window.setTimeout(() => {
    onDone?.();                                        // heal resolves at the end (numbers appear)
    layers.forEach((l) => { l.wrap.style.transition = `opacity ${HEAL_OUT_MS}ms ease`; l.wrap.style.opacity = "0"; });
    window.setTimeout(() => layers.forEach((l) => l.wrap.remove()), HEAL_OUT_MS + 60);
  }, HEAL_HOLD_MS);
}
