---
name: ios-pwa-review
description: Review Gaia's UI/UX through the lens of iOS PWA (Add-to-Home-Screen web app) best practices — installability & chromeless standalone launch, notch/Dynamic-Island/home-indicator safe areas, touch ergonomics & gestures (no bounce/zoom/callout), the iOS audio-autoplay gate, Canvas retina/DPR crispness, orientation, app lifecycle & persistence (iOS can kill the web app), and offline. Produces a prioritized findings report (Blocking / Should-fix / Polish) with file:line refs and concrete fixes; can then apply + ship them via the deploy skill. Use when the user asks to review/audit the game as an iPhone/iPad home-screen app, after any change to app/index.html or the DOM/Canvas UI, or before shipping a mobile-facing change. Complements the general `ux-designer` agent (which owns broad UI/UX); this is the iOS-PWA slice.
---

# iOS PWA review — Gaia as an iPhone/iPad home-screen app

The repeatable way to audit Gaia **specifically as an installed iOS web app** (Safari ▸ Share ▸
Add to Home Screen ▸ launched from the icon). The general `ux-designer` agent owns broad
legibility/hierarchy/touch UX — **this skill is the iOS-PWA slice**: does it install, launch
chromeless, sit correctly inside the notch/Dynamic-Island/home-indicator, feel native to touch,
play sound under Safari's gate, render crisp on retina, survive being backgrounded, and (optionally)
launch offline.

- **Repo:** `cappytan/gaia` · **Live site:** https://cappytan.github.io/Gaia/
- **Read first:** `CLAUDE.md` (architecture/workflow), `CONTEXT.md` (vocabulary). The UI is
  **vanilla TS + DOM/CSS + Canvas**, no framework — keep it that way (ADR 0005).
- **Output is a review** (Blocking / Should-fix / Polish, with `file:line` + a concrete fix).
  Because a skill runs in the live session it MAY then apply fixes and ship them — but propose the
  fixes first; only edit when the user says go, then ship via the **`deploy` skill**.

## Where the iOS-PWA surface lives (read these before judging)
- `app/index.html` — the shell: the `<head>` meta/manifest/icon tags, the one `<style>` block
  (palette in `:root`, `#app`/`#stage` sizing, safe-area padding, `body` touch rules), the d-pad
  and battle/menu DOM.
- `app/public/` — `manifest.webmanifest`, `apple-touch-icon.png`, `icon-192/512.png` (Vite copies
  `app/public/*` to the `dist/` root; `base:'./'` keeps paths working on the `/Gaia/` Pages subpath).
- `app/src/core/dom.ts` + `controllers/field.ts` (Canvas sizing/DPR, the field HUD + d-pad),
  `controllers/battle.ts` (battle controls, bottom command panel), `controllers/{menus,screens,
  game}.ts` (overlays), `audio/music.ts` (the AudioContext gesture gate).
- Verify what actually shipped: `grep` the BUILT html — `npm run build` then check
  `dist/index.html` for the meta tags, and `dist/` for the icons + manifest. The live site is the
  source of truth (`curl -s https://cappytan.github.io/Gaia/`).

## The review checklist (each item: what good looks like · where · Gaia notes)

### 1 · Installability & chromeless standalone
- `<meta name="apple-mobile-web-app-capable" content="yes">` (+ `mobile-web-app-capable`) so it
  launches with **no Safari address bar**. `apple-mobile-web-app-title` sets the icon label.
- `apple-mobile-web-app-status-bar-style`: `black-translucent` lets content draw under the status
  bar (immersive; **requires** safe-area padding, see §2). `default`/`black` reserve the bar.
- `<link rel="apple-touch-icon" href="apple-touch-icon.png">` — iOS needs a **180×180** PNG,
  **opaque, no transparency, no pre-rounding** (iOS masks the corners). A transparent icon shows a
  black background on the Home Screen — flag it.
- `manifest.webmanifest`: `display:"standalone"`, `start_url`/`scope` **relative (`./`)** for the
  Pages subpath, `theme_color`/`background_color` matching the gold-on-dark shell, `icons` 192 + 512.
  Consider a **`purpose:"maskable"`** icon variant (Android adaptive masks clip a non-maskable icon).
- `<meta name="theme-color">` matches the UI chrome.
- **Baseline (v0.85):** all of the above shipped. Re-verify they survive in `dist/index.html`.

### 2 · Safe areas — notch / Dynamic Island / home indicator
- `<meta name="viewport" … viewport-fit=cover>` is REQUIRED for `env(safe-area-inset-*)` to be
  non-zero. Without it the insets are 0 and content hides under the notch.
- Inset the playfield with `env(safe-area-inset-{top,right,bottom,left})`. Gaia pads `#app` and
  sizes `#stage` to the safe box (`min(100%,…)`), so in-stage controls stay clear — verify nothing
  bypasses it with a screen-edge `position:fixed`.
- **Check BOTH orientations.** Landscape is the likely play mode: the notch moves to a SIDE
  (inset-left/right) and the home indicator is the bottom bar. Confirm the **d-pad** (bottom-left)
  and the **battle command panel** (`#battleUi`, full-width bottom) don't slip under either.
- The `100vh`/`100dvh` trap: in a Safari TAB the URL bar resizes the viewport (`dvh` handles it);
  in standalone there's no bar. Gaia uses `100dvh` — fine. Flag any raw `100vh` that would clip.
- Eyeball it: the stage is centered+capped (920×640), so on a tall phone it letterboxes (insets
  absorbed by the margin); on a short/landscape screen it fills and the insets do the work.

### 3 · Touch ergonomics
- **Hit targets ≥ 44×44pt** (Apple HIG). Audit the d-pad cells, battle command buttons, menu rows,
  overlay close/▲▼ controls, the inventory/equip tap rows. Flag anything smaller a thumb must hit.
- **Thumb reach:** primary controls within the lower-third / corners, not centered up top.
- **No hover-only affordances** — `title=` tooltips and `:hover`-only reveals don't exist on touch
  (this overlaps the ux-designer agent; flag from the touch angle).
- **Pressed feedback** on every button (`:active`) since there's no cursor; ensure it's visible.
- Adequate spacing so adjacent targets aren't mis-tapped (≥ ~8px gaps on dense rows).

### 4 · Gestures & native feel
- `body { overscroll-behavior:none }` (no rubber-band / pull-to-refresh) and `position:fixed;
  inset:0` so the page itself can't scroll-bounce.
- `touch-action:manipulation` (kills the 300ms double-tap-zoom delay) + `maximum-scale=1,
  user-scalable=no` (no pinch-zoom of the UI). Confirm this doesn't break any intended swipe
  handler on the Canvas (touch events still fire; the browser just won't scroll/zoom).
- `-webkit-touch-callout:none` + `user-select:none` so a long-press doesn't pop the copy/Look-Up
  menu or select text/sprites. `-webkit-tap-highlight-color:transparent` kills the grey tap flash.
- **Baseline (v0.85):** these shipped on `body`/`*`. Verify no element re-enables selection where a
  long-press would feel broken.

### 5 · Audio under iOS's autoplay gate
- iOS **suspends `AudioContext` until a user gesture**. Music/SFX must be (re)started from inside a
  tap handler (`ctx.resume()` on first touch). Check `audio/music.ts` + wherever the title "Start"
  / first interaction kicks it off. No autoplay-on-load (it silently fails on iOS).
- After backgrounding, iOS may suspend the context again — confirm it resumes on return / next tap.
- Respect a mute toggle; never assume audio is audible (silent switch / low volume).

### 6 · Canvas crispness & performance (retina)
- The field Canvas should scale for **`devicePixelRatio`**: set `canvas.width/height` to CSS-size ×
  DPR and scale the context, else it's blurry on retina (or wastefully huge). Pixel-art tiles use
  `image-rendering:pixelated` — verify the intent (crisp pixels) matches the DPR handling.
- Resize on rotate / viewport change (`resize`/`orientationchange`) and re-draw.
- Smooth ~60fps: draw via `requestAnimationFrame`, avoid per-frame allocations and layout thrash;
  Gaia realizes map chunks on MOVE, not in draw (keep it that way). Watch memory on mobile Safari
  (large decoded PNGs — the zone backdrops are multi-MB).

### 7 · Orientation
- Decide and honor: does the game support portrait AND landscape? `manifest orientation` +
  reflow on rotate. If both, verify the HUD/d-pad/battle UI reflow legibly in each (tie to §2).
- No content assumes a fixed aspect; the letterbox handles extremes but check the short edge.

### 8 · Lifecycle & persistence (iOS kills web apps aggressively)
- iOS reclaims a backgrounded standalone app quickly and may **cold-reload** on return. Persist on
  `visibilitychange`→hidden and `pagehide` (NOT `beforeunload`/`unload` — unreliable on iOS).
- Gaia autosaves to `localStorage` (run state, opened chests, world pos, the persistent Vault).
  Verify the save points cover a backgrounding mid-run, and that a reload restores cleanly
  (this overlaps prior QA — flag from the "iOS killed it" angle).
- `localStorage` can be evicted under storage pressure / 7-day cap in some modes — don't treat it as
  durable; degrade gracefully (already wrapped in try/catch — confirm).

### 9 · Offline (optional, flag as enhancement)
- A standalone app launched without a connection shows a blank/offline page unless a **service
  worker** caches the static bundle. Gaia has none yet → flag as a *Should-fix/Polish* enhancement
  (cache the hashed `dist/` assets so it opens offline and loads instantly). Keep it statically
  hostable; no new runtime deps. This is the one item that needs new code, not just a tweak.

### 10 · Standalone visual polish
- **Launch screen:** without `apple-touch-startup-image` (per-resolution) iOS shows a blank/white
  flash on cold start. Flag if the gold-on-dark world deserves a branded splash (a generated
  set, or a CSS first-paint that matches `background_color`).
- **No FOUC / white flash:** the shell `background` is the dark `--bg` from first paint (verify the
  `<html>`/`body` bg is set before JS, so the white default never flashes on the OLED dark UI).
- Status-bar legibility: with `black-translucent`, light status-bar glyphs over the dark UI — good;
  flag any light screen behind the status bar that would wash the clock out.

### 11 · Accessibility / legibility on a handheld
- Min font ~11px for anything the player must read; contrast on gold-on-dark (the `--gold2` on
  `--panel` etc.) holds at arm's length.
- `prefers-reduced-motion`: gate the title sun-pulse and any large looping animation (vestibular).
- Never signal by **color alone** (Attunement/rarity also need a glyph/label — overlaps ux-designer).

## How to actually test (be honest about what's verifiable here)
- **Headless / in this session (do these):** `npm run build`; grep `dist/index.html` for the meta
  tags + `viewport-fit=cover`; confirm `dist/` has `manifest.webmanifest` + the icons; lint the
  manifest JSON; read the CSS to confirm `env(safe-area-inset-*)`, `overscroll-behavior`, etc.;
  `curl` the live site to confirm what's deployed. Static analysis catches most of §1, §2, §4.
- **Needs a real device (say so, don't fake it):** the *feel* of safe areas, gestures, the audio
  gate, retina crispness, lifecycle/kill behavior, and the install flow can only be confirmed on an
  actual iPhone/iPad — Safari's responsive-design mode does NOT emulate standalone insets or the
  autoplay gate faithfully. Hand the user a short **on-device test pass** (install it, rotate it,
  long-press, background-and-return, airplane-mode-launch) and ask for a screenshot when unsure.

## Output format (what this skill returns)
A prioritized findings list, each with **severity · `file:line` · the issue · the concrete fix**:
- **Blocking** — breaks the installed experience (hides under the notch, can't install, no audio,
  blurry/clipped on a real iPhone).
- **Should-fix** — clearly off-best-practice (missing maskable icon, no reduced-motion gate, no
  lifecycle save, small hit target).
- **Polish** — nice-to-have (startup splash, offline service worker, micro-spacing).

Lead with a one-line **verdict** (does it pass as an iOS home-screen app today?) and end with the
**on-device test pass** for the user. If asked to fix, apply the changes, bump `GAME_VERSION`
(player-visible), add a changelog line, and ship via the **`deploy` skill** — never hand-run git.
