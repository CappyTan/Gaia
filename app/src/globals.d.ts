// The HTML uses inline onclick handlers (e.g. onclick="Game.start()") that resolve to window
// globals. main.ts publishes the controllers onto window; these declarations type that bridge.
// (Transitional: a future pass can replace inline handlers with delegated listeners — see ADR 0005.)

import type { Game } from "./controllers/game";
import type { UI } from "./controllers/menus";
import type { Battle } from "./controllers/battle";
import type { Field } from "./controllers/field";
import type { Screens } from "./controllers/screens";
import type { Overlay } from "./ui/overlay";
import type { Music } from "./audio/music";
import type { Telemetry } from "./telemetry/telemetry";

declare global {
  interface Window {
    Game: typeof Game;
    UI: typeof UI;
    Battle: typeof Battle;
    Field: typeof Field;
    Screens: typeof Screens;
    Overlay: typeof Overlay;
    Music: typeof Music;
    Telemetry: typeof Telemetry;
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
