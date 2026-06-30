// Pure instance engine (systems/status) — the ADR-0016 buff/debuff lifecycle: apply / stack /
// phase-transition / tick / cleanse / strip / resist. Deterministic (RNG injected) — locks behavior.

import { describe, it, expect } from "vitest";
import type { StatusInstance } from "../src/types";
import { applyStatus, findStatus, hasStatus, removeStatus, cleanse, stripBuffs, tickStatus, resolveApply } from "../src/systems/status";

describe("applyStatus — stacking rules", () => {
  it("adds a new instance with stacks 1 and the catalog duration", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "burn");
    const b = findStatus(list, "burn")!;
    expect(b.stacks).toBe(1);
    expect(b.turns).toBe(2); // burn catalog duration
  });

  it("refresh takes the longer remaining duration, not a new instance", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "blind", { turns: 1 });
    applyStatus(list, "blind", { turns: 3 });
    expect(list.filter((s) => s.defId === "blind").length).toBe(1);
    expect(findStatus(list, "blind")!.turns).toBe(3);
  });

  it("stack-intensity climbs to the cap (burn maxStacks 5)", () => {
    const list: StatusInstance[] = [];
    for (let i = 0; i < 8; i++) applyStatus(list, "burn");
    expect(findStatus(list, "burn")!.stacks).toBe(5);
  });

  it("phase-transition: Chill tops out → promotes to Frozen", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "chill");
    applyStatus(list, "chill");
    expect(hasStatus(list, "chill")).toBe(true);
    applyStatus(list, "chill"); // 3rd = maxStacks → promote
    expect(hasStatus(list, "chill")).toBe(false);
    expect(hasStatus(list, "frozen")).toBe(true);
  });

  it("records the source for needs-source effects (Drain)", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "drain", { source: "hero3" });
    expect(findStatus(list, "drain")!.source).toBe("hero3");
  });

  it("removeStatus drops an instance", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "stun");
    removeStatus(list, "stun");
    expect(hasStatus(list, "stun")).toBe(false);
  });
});

describe("cleanse / strip", () => {
  it("cleanse removes cleansable debuffs only; buffs survive", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "burn");   // cleansable debuff
    applyStatus(list, "doom");   // un-cleansable debuff
    applyStatus(list, "atkup");  // buff
    expect(cleanse(list)).toBe(1);
    expect(hasStatus(list, "burn")).toBe(false);
    expect(hasStatus(list, "doom")).toBe(true);
    expect(hasStatus(list, "atkup")).toBe(true);
  });

  it("stripBuffs removes dispellable buffs only", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "atkup"); // dispellable buff
    applyStatus(list, "guard"); // stance (not dispellable)
    applyStatus(list, "burn");  // debuff
    expect(stripBuffs(list)).toBe(1);
    expect(hasStatus(list, "atkup")).toBe(false);
    expect(hasStatus(list, "guard")).toBe(true);
    expect(hasStatus(list, "burn")).toBe(true);
  });
});

describe("tickStatus (lifecycle events)", () => {
  it("a DoT event carries its stacks + layer/kind and counts down", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "burn");
    applyStatus(list, "burn"); // stacks 2
    const ev = tickStatus(list).find((e) => e.defId === "burn")!;
    expect(ev.kind).toBe("debuff");
    expect(ev.layer).toBe("status");
    expect(ev.stacks).toBe(2);
    expect(findStatus(list, "burn")!.turns).toBe(1); // turns 2 − 1 this tick
  });

  it("Drain flags needsSource + carries its source (the caller transfers to the caster)", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "drain", { source: "h1" });
    const ev = tickStatus(list).find((e) => e.defId === "drain")!;
    expect(ev.needsSource).toBe(true);
    expect(ev.source).toBe("h1");
  });

  it("a HoT (Regen) is a status-layer buff with positive magnitude", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "regen");
    const ev = tickStatus(list).find((e) => e.defId === "regen")!;
    expect(ev.kind).toBe("buff");
    expect(ev.layer).toBe("status");
    expect(ev.magnitude).toBeGreaterThan(0);
  });

  it("Doom detonates on expiry (a delayed determined hit), then is removed", () => {
    const list: StatusInstance[] = [];
    applyStatus(list, "doom"); // turns 2, mag 0, unique
    expect(tickStatus(list).find((e) => e.defId === "doom")!.detonated).toBe(false);
    const ev = tickStatus(list).find((e) => e.defId === "doom")!;
    expect(ev.detonated).toBe(true);
    expect(ev.expired).toBe(true);
    expect(hasStatus(list, "doom")).toBe(false);
  });
});

describe("resolveApply", () => {
  it("on-hit effects always land (chip)", () => {
    expect(resolveApply("burn", 0, 0, () => 0.99)).toBe(true);
  });

  it("resistible effects roll Accuracy ↔ Resistance", () => {
    expect(resolveApply("stun", 0, 0, () => 0)).toBe(true);     // 0 < 70 base
    expect(resolveApply("stun", 0, 0, () => 0.99)).toBe(false); // 99 >= 70
    expect(resolveApply("stun", 0, 99, () => 0.2)).toBe(false); // resistance floors the chance to 15
  });
});
