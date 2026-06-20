// Screen switcher: shows exactly one of title/field/battle and cues the right music.

import { $ } from "../core/dom";
import { Music } from "../audio/music";
import { Field } from "./field";
import { Game } from "./game";

export const Screens = {
  cur: "title" as "title" | "field" | "battle",
  show(name: "title" | "field" | "battle"): void {
    Game.state = name;
    this.cur = name;
    (["title", "field", "battle"] as const).forEach((s) => $("#" + s + "Screen")?.classList.toggle("on", s === name));
    if (name === "title") Music.play("title");
    // Overworld screen: a settlement (town mode) gets the warm village theme; the open zone gets
    // the field theme. (Battle music is set by Battle.begin.) Reusable for any future settlement.
    else if (name === "field") Music.play(Field.townMode ? "village" : "field");
    Music._renderStyleLabels();
    if (name === "field") {
      Field.resize(); Field.draw(); Field.hint();
      requestAnimationFrame(() => { Field.resize(); Field.draw(); }); // redraw once layout settled
    }
  },
};
