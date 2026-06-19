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
    else if (name === "field") Music.play("field"); // battle music is set by Battle.begin
    Music._renderStyleLabels();
    if (name === "field") {
      Field.resize(); Field.draw(); Field.hint();
      requestAnimationFrame(() => { Field.resize(); Field.draw(); }); // redraw once layout settled
    }
  },
};
