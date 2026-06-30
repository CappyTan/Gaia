// Bootstrap: wire the controllers to the DOM, expose the inline-handler bridge, start music
// and the title screen.

import { $ } from "./core/dom";
import { WakeLock } from "./core/wakelock";
import { GAME_VERSION } from "./data/version";
import { Game } from "./controllers/game";
import { Roster } from "./controllers/roster";
import { UI } from "./controllers/menus";
import { Battle } from "./controllers/battle";
import { Field } from "./controllers/field";
import { Minimap } from "./controllers/minimap";
import { Screens } from "./controllers/screens";
import { DataBrowser } from "./controllers/dataBrowser";
import { WorldMapView } from "./controllers/worldMap";
import { ClassPicker } from "./controllers/classPicker";
import { applyCurrent } from "./data/overrides";
import { Overlay } from "./ui/overlay";
import { Dialogue } from "./ui/dialogue";
import { Music } from "./audio/music";
import { Telemetry } from "./telemetry/telemetry";
import { Save } from "./systems/save";

// Publish controllers for the HTML's inline onclick handlers.
Object.assign(window, { Game, Roster, UI, Battle, Field, Minimap, Screens, DataBrowser, WorldMapView, ClassPicker, Overlay, Dialogue, Music, Telemetry, Save });

// Keyboard on the field: while a conversation is open, any movement/confirm key advances it;
// otherwise the keys walk the map.
window.addEventListener("keydown", (e) => {
  if (Screens.cur !== "field") return;
  // Esc closes the minimap if open; otherwise let it bubble (other overlays own it).
  if (e.key === "Escape" && Minimap.open) { Minimap.hide(); e.preventDefault(); return; }
  // M toggles the minimap (but not while a modal overlay or a conversation owns the field).
  if (e.key.toLowerCase() === "m" && !Overlay.isOn() && !Dialogue.isOn()) { Minimap.toggle(); e.preventDefault(); return; }
  // While the minimap is open it captures input (no walking behind it).
  if (Minimap.open) { e.preventDefault(); return; }
  if (Dialogue.isOn()) {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "enter", " ", "spacebar"].includes(k)) { Dialogue.advance(); e.preventDefault(); }
    return;
  }
  if (Overlay.isOn()) return;
  const k = e.key.toLowerCase();
  if (k === "arrowup" || k === "w") { Field.move(0, -1); e.preventDefault(); }
  else if (k === "arrowdown" || k === "s") { Field.move(0, 1); e.preventDefault(); }
  else if (k === "arrowleft" || k === "a") { Field.move(-1, 0); e.preventDefault(); }
  else if (k === "arrowright" || k === "d") { Field.move(1, 0); e.preventDefault(); }
});

// Tap/click the dialogue box to advance/close it (touch-friendly; iOS-Safari safe).
$("#dialogue")?.addEventListener("click", () => Dialogue.advance());

// Boot.
applyCurrent(); // apply any persisted content edits (Data screen editor) onto live data first
Telemetry.load(); // recover + auto-send a run a prior crash left behind (before any new run starts)
Music.load();
// Web Audio needs a user gesture to start (esp. iOS) — unlock on first interaction.
(["pointerdown", "touchstart", "keydown"] as const).forEach((ev) =>
  window.addEventListener(ev, () => Music.unlock(), { once: true, passive: true })
);
// iOS lifecycle: a backgrounded standalone web app gets its AudioContext suspended and can be
// cold-reloaded on return. (1) Re-unlock audio when we become visible again (the once-listener
// above is already spent), and (2) persist the run when we're hidden / the page is being put away
// — visibilitychange+pagehide are the reliable iOS save points (beforeunload is not). saveNow()
// no-ops on the title / with no party, so this is safe to fire anytime.
const persistRun = () => { try { Game.saveNow(); } catch { /* storage off */ } };
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persistRun(); else { Music.unlock(); WakeLock.reacquire(); }
});
window.addEventListener("pagehide", persistRun);

// Standalone-aware chrome: tag <html> when launched as an installed app (vs a browser tab) so CSS can
// adapt (e.g. drop the d-pad for tap/swipe-to-move, hide the install hint).
const standalone = window.matchMedia("(display-mode: standalone)").matches
  || (navigator as Navigator & { standalone?: boolean }).standalone === true;
document.documentElement.classList.toggle("standalone", standalone);
const verTag = $("#verTag");
if (verTag) verTag.textContent = `Gaia ${GAME_VERSION}`;
// Offer Continue on the title only when a resumable save exists (ADR 0007).
const continueBtn = $("#continueBtn");
if (continueBtn) continueBtn.style.display = Save.hasSave() ? "" : "none";
Screens.show("title");

// Cold-launch splash: let the gold sun show a beat, then fade it out and remove it.
const boot = document.getElementById("boot");
if (boot) { setTimeout(() => boot.classList.add("hide"), 220); setTimeout(() => boot.remove(), 760); }

// First-visit "Add to Home Screen" hint — iOS Safari only (Chromium/Android shows its own install
// prompt), browser tab only (never when already installed), once (dismissal is remembered).
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
try {
  const a2hs = document.getElementById("a2hs");
  if (a2hs && !standalone && isIOS && !localStorage.getItem("gaia_a2hs_seen")) {
    const msg = document.getElementById("a2hsMsg");
    if (msg) msg.textContent = "Play full-screen: tap Share, then “Add to Home Screen.”";
    a2hs.classList.add("on");
  }
} catch { /* storage off */ }

// Offline support + instant loads for the installed PWA: register the service worker (scope = the
// app's own subpath). Best-effort — a failure (e.g. unsupported, or http on localhost) is silent and
// the game still runs online. Production only, so the dev server's HMR isn't intercepted.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // If we already had a controller at load, a LATER controller change means a new build was deployed
    // and just took over → reload once to run it. (No controller at first install → don't reload.)
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });
    navigator.serviceWorker.register("sw.js", { scope: "./" }).then((reg) => {
      reg.update();                                  // check for a new build now…
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update(); }); // …and on every return
    }).catch(() => { /* offline cache unavailable */ });
  });
}

// Dev-only: surface content-integrity problems in the console (the DB validator). Tree-shaken out
// of production builds; gives instant feedback when data is tweaked.
if (import.meta.env.DEV) {
  import("./data/validate").then(({ validateContent }) => {
    const issues = validateContent();
    if (issues.length) console.warn(`[content] ${issues.length} integrity issue(s):\n - ` + issues.join("\n - "));
    else console.info("[content] DB integrity OK");
  });
}
