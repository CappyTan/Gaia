// Status-effect catalog (ADR 0016) — locks the catalog's STRUCTURAL invariants: ids match keys,
// buckets/layers/kinds are valid, phase-transition targets resolve, the signature DoTs are present and
// well-formed, stacking is coherent. Magnitudes are a balance pass — not asserted here.

import { describe, it, expect } from "vitest";
import { STATUS, STATUS_KEYS, statusDef } from "../src/data/status";
import { ATTUNEMENTS } from "../src/types";

const LAYERS = ["status", "action", "stat", "meta", "economy"];
const STACK = ["refresh", "stack-intensity", "stack-duration", "unique"];

describe("status catalog (ADR 0016)", () => {
  it("every entry's id matches its key, with a name + desc", () => {
    for (const k of STATUS_KEYS) {
      const d = STATUS[k];
      expect(d.id).toBe(k);
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.desc.length).toBeGreaterThan(0);
    }
  });

  it("every effect has a valid kind / layer / bucket / stacking / apply", () => {
    for (const d of Object.values(STATUS)) {
      expect(["buff", "debuff"]).toContain(d.kind);
      expect(LAYERS).toContain(d.layer);
      expect(d.bucket === "neutral" || ATTUNEMENTS.includes(d.bucket as never)).toBe(true);
      expect(STACK).toContain(d.stacking);
      expect(["on-hit", "resistible"]).toContain(d.apply);
      expect(d.turns).toBeGreaterThan(0);
    }
  });

  it("stack-intensity effects declare a maxStacks > 1", () => {
    for (const d of Object.values(STATUS)) {
      if (d.stacking === "stack-intensity") expect((d.maxStacks ?? 1)).toBeGreaterThan(1);
    }
  });

  it("phase-transition targets resolve to real defs (Chill → Frozen)", () => {
    for (const d of Object.values(STATUS)) {
      if (d.promotesTo) expect(statusDef(d.promotesTo)).toBeDefined();
    }
    expect(STATUS.chill.promotesTo).toBe("frozen");
  });

  it("the 4 signature DoTs are present, debuffs, in the status layer, each its own attunement", () => {
    const sig = { burn: "SOL", decay: "NOX", poison: "ANIMA", drain: "UMBRAXIS" } as const;
    for (const [id, att] of Object.entries(sig)) {
      const d = statusDef(id)!;
      expect(d).toBeDefined();
      expect(d.kind).toBe("debuff");
      expect(d.layer).toBe("status");
      expect(d.bucket).toBe(att);
    }
  });

  it("Drain references its caster (needsSource); Doom is the un-cleansable QUANTA finisher (no DoT)", () => {
    expect(STATUS.drain.needsSource).toBe(true);
    expect(STATUS.doom.bucket).toBe("QUANTA");
    expect(STATUS.doom.cleansable).toBe(false);
  });

  it("buffs are dispellable-or-stance, debuffs are mostly cleansable", () => {
    // a couple of anchors: Attack Up is a strippable buff; Attack Down is a cleansable debuff
    expect(STATUS.atkup.kind).toBe("buff");
    expect(STATUS.atkup.dispellable).toBe(true);
    expect(STATUS.atkdown.kind).toBe("debuff");
    expect(STATUS.atkdown.cleansable).toBe(true);
  });
});
