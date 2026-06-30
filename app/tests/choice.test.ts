// The 3-lane choice system (ADR 0020 §2) — pure engine. Uses the re-encoded Heliomancer slice spec.

import { describe, it, expect } from "vitest";
import { HELIOMANCER } from "../src/data/classSpecs";
import { choiceSlots, reached, choose, pickedAt, activeKit, fullyPicked, slotId } from "../src/systems/choice";

describe("choice slots", () => {
  it("groups into 10 special + 9 signature + 3 passive + 1 ultimate = 23 slots (auto excluded)", () => {
    const slots = choiceSlots(HELIOMANCER);
    expect(slots.filter((s) => s.tier === "special").length).toBe(10);
    expect(slots.filter((s) => s.tier === "signature").length).toBe(9);
    expect(slots.filter((s) => s.tier === "passive").length).toBe(3);
    expect(slots.filter((s) => s.tier === "ultimate").length).toBe(1);
    expect(slots.length).toBe(23);
  });

  it("pickCount is 2 for the ultimate slot, 1 everywhere else; each non-ult slot offers 2–3 options", () => {
    for (const s of choiceSlots(HELIOMANCER)) {
      expect(s.pickCount).toBe(s.tier === "ultimate" ? 2 : 1);
      if (s.tier === "ultimate") expect(s.options.length).toBe(4);
      else if (s.tier === "passive") expect(s.options.length).toBe(3);
      else expect(s.options.length).toBe(2);
    }
  });
});

describe("picking + MNA gating", () => {
  it("reached() gates a milestone by total MNA", () => {
    expect(reached(45, 50)).toBe(true);
    expect(reached(45, 30)).toBe(false);
  });

  it("choose toggles and respects the pick limit (a pick-1 slot swaps; pick-2 keeps two)", () => {
    const sp5 = slotId("special", 5), ult = slotId("ultimate", 100);
    let p = {};
    p = choose(p, sp5, "Firebolt", 1);
    expect(pickedAt(p, sp5)).toEqual(["Firebolt"]);
    p = choose(p, sp5, "Sunbeam", 1); // pick-1 → swaps
    expect(pickedAt(p, sp5)).toEqual(["Sunbeam"]);
    let u = {};
    u = choose(u, ult, "Solar Flare", 2);
    u = choose(u, ult, "Death Ray", 2);
    expect(pickedAt(u, ult).length).toBe(2);
    u = choose(u, ult, "Heliosphere", 2); // a 3rd drops the oldest
    expect(pickedAt(u, ult)).toEqual(["Death Ray", "Heliosphere"]);
  });

  it("a signature and a passive sharing milestone 30 are DISTINCT slots (no collision)", () => {
    let p = choose({}, slotId("signature", 30), "Blaze", 1);
    p = choose(p, slotId("passive", 30), "Pyromania", 1);
    expect(pickedAt(p, slotId("signature", 30))).toEqual(["Blaze"]);
    expect(pickedAt(p, slotId("passive", 30))).toEqual(["Pyromania"]);
  });

  it("toggling the same name off removes it", () => {
    const sp5 = slotId("special", 5);
    let p = choose({}, sp5, "Firebolt", 1);
    p = choose(p, sp5, "Firebolt", 1);
    expect(pickedAt(p, sp5)).toEqual([]);
  });
});

describe("active kit (dormant below MNA)", () => {
  it("includes the auto-attack always, and picked abilities only once their milestone is reached", () => {
    let p = {};
    p = choose(p, slotId("special", 5), "Firebolt", 1);   // reached at MNA 5
    p = choose(p, slotId("special", 45), "Sunspear", 1);  // reached at MNA 45
    const atLow = activeKit(HELIOMANCER, p, 10).map((a) => a.name);
    expect(atLow).toContain("Sunbolt");   // auto always
    expect(atLow).toContain("Firebolt");  // milestone 5 reached
    expect(atLow).not.toContain("Sunspear"); // milestone 45 NOT reached → dormant
    const atHigh = activeKit(HELIOMANCER, p, 50).map((a) => a.name);
    expect(atHigh).toContain("Sunspear"); // now reached
  });

  it("fullyPicked reflects whether every reachable slot has its picks", () => {
    expect(fullyPicked(HELIOMANCER, {}, 5)).toBe(false); // the MNA-5 special slot is unpicked
    const p = choose({}, slotId("special", 5), "Firebolt", 1);
    expect(fullyPicked(HELIOMANCER, p, 5)).toBe(true); // only the MNA-5 slot is reachable, and it's picked
  });
});
