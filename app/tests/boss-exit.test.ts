// @vitest-environment jsdom
//
// BOSS-EXIT returns to the FIELD screen (the "stuck after the loot screen" bug). Beating a zone boss runs
// game.afterZoneBoss → Field.ascend() to climb out of the dungeon onto the overworld — but ascend() is
// called from the BATTLE screen, and it used to rebuild the overworld grid WITHOUT switching screens. So
// once the spoils/“Warren falls” overlays were dismissed, the finished battle screen was revealed and the
// player was stranded (no enemy, no field controls). ascend() must Screens.show("field"). This pins it.

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Field } from "../src/controllers/field";
import { Screens } from "../src/controllers/screens";
import { Game } from "../src/controllers/game";

describe("boss-exit → overworld field screen (stuck-after-loot fix)", () => {
  let shown: string[];
  const origShow = Screens.show;

  beforeEach(() => {
    document.body.innerHTML = `<div id="titleScreen"></div><div id="fieldScreen"></div><div id="battleScreen"></div>
      <div id="fieldHud"></div><div id="fieldZone"></div><div id="fieldHint"></div>`;
    Game.party = [{ alive: true } as any]; // non-empty so saveNow() in ascend() is a safe no-op
    shown = [];
    // record screen switches without running the heavy real render/Music path
    (Screens as any).show = (n: string) => { shown.push(n); Screens.cur = n as any; };
    Field.init();
    Field.enterBigMap("greenvale"); // build the seamless big map; player on the overworld surface
  });
  afterEach(() => { (Screens as any).show = origShow; Game.party = []; });

  it("Field.ascend() (the boss climb-out) shows the FIELD screen — not the finished battle", () => {
    Screens.cur = "battle"; shown = []; // simulate dismissing the spoils while still on the battle screen
    Field.ascend();
    expect(shown).toContain("field"); // pre-fix: nothing → screen stayed "battle" → stuck
    expect(Screens.cur).toBe("field");
  });
});
