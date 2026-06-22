// Screen switcher: shows exactly one of title/field/battle and cues the right music.

import { $ } from "../core/dom";
import { Music } from "../audio/music";
import { WakeLock } from "../core/wakelock";
import { Field } from "./field";
import { Game } from "./game";

export const Screens = {
  cur: "title" as "title" | "field" | "battle",
  show(name: "title" | "field" | "battle"): void {
    Game.state = name;
    this.cur = name;
    (["title", "field", "battle"] as const).forEach((s) => $("#" + s + "Screen")?.classList.toggle("on", s === name));
    // Keep the screen awake while playing; let it sleep on the title. (Field also closes its More sheet.)
    if (name === "title") { WakeLock.release(); } else { void WakeLock.request(); }
    if (name === "field") Field.closeMore();
    if (name === "title") Music.play("title");
    // Overworld screen: pick the cue by place + mood (Battle music is set by Battle.begin).
    //  - In a settlement (town mode): a grand "city"-themed trade capital (e.g. Riverhearth) gets the
    //    bustling, prosperous `city` cue; a grim "marsh"-themed outpost (e.g. Miregard) gets the cold,
    //    fog-bound `marsh` cue; every other settlement keeps the warm `village` theme (Hearthford).
    //  - In the open zone: a mire env (the Duskmarsh) gets the low, dread `mire` theme; a forest env
    //    (Silverwood) gets the hushed, old-growth `forest` theme; everything else keeps the restless
    //    `field` theme (Greenvale).
    // Keyed off flags/theme, not place names, so it generalizes to future cities/grim zones/settlements.
    else if (name === "field") Music.play(Field.townMode ? (Field.town?.theme === "city" ? "city" : Field.town?.theme === "marsh" ? "marsh" : "village") : Field.fieldMusic());
    Music._renderStyleLabels();
    if (name === "field") {
      Field.resize(); Field.draw(); Field.hint();
      requestAnimationFrame(() => { Field.resize(); Field.draw(); }); // redraw once layout settled
    }
  },
};
