// The HTML uses inline onclick handlers (e.g. onclick="Game.start()") that resolve to window
// globals. main.ts publishes the controllers onto window; these declarations type that bridge.
// (Transitional: a future pass can replace inline handlers with delegated listeners — see ADR 0005.)

import type { Game } from "./controllers/game";
import type { Roster } from "./controllers/roster";
import type { UI } from "./controllers/menus";
import type { Battle } from "./controllers/battle";
import type { Field } from "./controllers/field";
import type { Screens } from "./controllers/screens";
import type { DataBrowser } from "./controllers/dataBrowser";
import type { Overlay } from "./ui/overlay";
import type { Dialogue } from "./ui/dialogue";
import type { Music } from "./audio/music";
import type { Telemetry } from "./telemetry/telemetry";

declare global {
  interface Window {
    Game: typeof Game;
    Roster: typeof Roster;
    UI: typeof UI;
    Battle: typeof Battle;
    Field: typeof Field;
    Screens: typeof Screens;
    DataBrowser: typeof DataBrowser;
    Overlay: typeof Overlay;
    Dialogue: typeof Dialogue;
    Music: typeof Music;
    Telemetry: typeof Telemetry;
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
