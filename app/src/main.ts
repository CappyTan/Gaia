// Bootstrap: wire the controllers to the DOM, expose the inline-handler bridge, start music
// and the title screen.

import { $ } from "./core/dom";
import { GAME_VERSION } from "./data/version";
import { Game } from "./controllers/game";
import { UI } from "./controllers/menus";
import { Battle } from "./controllers/battle";
import { Field } from "./controllers/field";
import { Screens } from "./controllers/screens";
import { Overlay } from "./ui/overlay";
import { Music } from "./audio/music";
import { Telemetry } from "./telemetry/telemetry";

// Publish controllers for the HTML's inline onclick handlers.
Object.assign(window, { Game, UI, Battle, Field, Screens, Overlay, Music, Telemetry });

// Keyboard movement on the field.
window.addEventListener("keydown", (e) => {
  if (Screens.cur !== "field" || Overlay.isOn()) return;
  const k = e.key.toLowerCase();
  if (k === "arrowup" || k === "w") { Field.move(0, -1); e.preventDefault(); }
  else if (k === "arrowdown" || k === "s") { Field.move(0, 1); e.preventDefault(); }
  else if (k === "arrowleft" || k === "a") { Field.move(-1, 0); e.preventDefault(); }
  else if (k === "arrowright" || k === "d") { Field.move(1, 0); e.preventDefault(); }
});

// Boot.
Music.load();
// Web Audio needs a user gesture to start (esp. iOS) — unlock on first interaction.
(["pointerdown", "touchstart", "keydown"] as const).forEach((ev) =>
  window.addEventListener(ev, () => Music.unlock(), { once: true, passive: true })
);
const verTag = $("#verTag");
if (verTag) verTag.textContent = `Gaia ${GAME_VERSION}`;
Screens.show("title");
