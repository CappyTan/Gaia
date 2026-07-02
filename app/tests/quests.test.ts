// Quest engine (systems/quests) — the pure chain/kill/turn-in logic.
import { describe, it, expect } from "vitest";
import { emptyQuests, questForTown, accept, ready, turnIn, noteKills, questList } from "../src/systems/quests";
import { QUESTS } from "../src/data/quests";

describe("quest chain", () => {
  it("offers the Hearthford chain sequentially and only after turn-in", () => {
    const log = emptyQuests();
    expect(questForTown(log, "hearthford")!.id).toBe("gv-kobolds");
    accept(log, "gv-kobolds");
    expect(questForTown(log, "hearthford")!.id).toBe("gv-kobolds"); // still current until turned in
    log["gv-kobolds"].kills = 10; turnIn(log, "gv-kobolds");
    expect(questForTown(log, "hearthford")!.id).toBe("gv-bandits");
  });
  it("counts only matching kills, only when accepted, capped at the goal", () => {
    const log = emptyQuests();
    expect(noteKills(log, ["kobold", "kobold"])).toEqual([]); // not accepted yet — no credit
    accept(log, "gv-kobolds");
    noteKills(log, ["kobold", "kobolde", "gbandit", "slime"]);
    expect(log["gv-kobolds"].kills).toBe(2); // gbandit/slime don't count
    expect(noteKills(log, Array(20).fill("kobold"))).toEqual(["gv-kobolds"]); // completes exactly once
    expect(log["gv-kobolds"].kills).toBe(10);
    expect(ready(log, QUESTS["gv-kobolds"])).toBe(true);
    turnIn(log, "gv-kobolds");
    expect(ready(log, QUESTS["gv-kobolds"])).toBe(false); // non-repeatable
  });
  it("locks later chain links until the previous is turned in", () => {
    const rows = questList(emptyQuests());
    expect(rows.map((r) => r.def.id)).toEqual(["gv-kobolds", "gv-bandits", "gv-kingpin"]);
    expect(rows[0].locked).toBe(false);
    expect(rows[1].locked).toBe(true);
    expect(rows[2].locked).toBe(true);
  });
});
