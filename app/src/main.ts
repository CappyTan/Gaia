// Bootstrap: wire the controllers to the DOM, expose the inline-handler bridge, start music
// and the title screen.

import { $ } from "./core/dom";
import { GAME_VERSION } from "./data/version";
import { Game } from "./controllers/game";
import { Roster } from "./controllers/roster";
import { UI } from "./controllers/menus";
import { Battle } from "./controllers/battle";
import { Field } from "./controllers/field";
import { Screens } from "./controllers/screens";
import { DataBrowser } from "./controllers/dataBrowser";
import { applyCurrent } from "./data/overrides";
import { Overlay } from "./ui/overlay";
import { Dialogue } from "./ui/dialogue";
import { Music } from "./audio/music";
import { Telemetry } from "./telemetry/telemetry";
import { Save } from "./systems/save";

// Publish controllers for the HTML's inline onclick handlers.
Object.assign(window, { Game, Roster, UI, Battle, Field, Screens, DataBrowser, Overlay, Dialogue, Music, Telemetry, Save });

// Keyboard on the field: while a conversation is open, any movement/confirm key advances it;
// otherwise the keys walk the map.
window.addEventListener("keydown", (e) => {
  if (Screens.cur !== "field") return;
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
const verTag = $("#verTag");
if (verTag) verTag.textContent = `Gaia ${GAME_VERSION}`;
// Offer Continue on the title only when a resumable save exists (ADR 0007).
const continueBtn = $("#continueBtn");
if (continueBtn) continueBtn.style.display = Save.hasSave() ? "" : "none";
Screens.show("title");

// Dev-only: surface content-integrity problems in the console (the DB validator). Tree-shaken out
// of production builds; gives instant feedback when data is tweaked.
if (import.meta.env.DEV) {
  import("./data/validate").then(({ validateContent }) => {
    const issues = validateContent();
    if (issues.length) console.warn(`[content] ${issues.length} integrity issue(s):\n - ` + issues.join("\n - "));
    else console.info("[content] DB integrity OK");
  });
}
