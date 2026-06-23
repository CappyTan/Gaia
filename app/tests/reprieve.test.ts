import { describe, it, expect } from "vitest";
import { applyReprieve } from "../src/systems/reprieve";
import type { Member, Reprieve } from "../src/types";

// A minimal member stub — only the fields applyReprieve touches (it's pure + field-scoped).
function hero(over: Partial<Member> = {}): Member {
  return { alive: true, hp: 30, maxhp: 100, mp: 10, maxmp: 50, status: {}, ...over } as Member;
}

const rep = (kind: Reprieve["kind"], amount?: number): Reprieve =>
  ({ kind, amount, name: "Test Rest", blurb: "…" });

describe("reprieve — tailored dungeon relief (never a full heal)", () => {
  it("'mend' restores a fraction of MAX HP, not MP, and never overheals", () => {
    const a = hero({ hp: 30, maxhp: 100, mp: 5, maxmp: 50 });
    const r = applyReprieve([a], rep("mend", 0.4));
    expect(a.hp).toBe(70);          // 30 + 40% of 100
    expect(a.mp).toBe(5);           // MP untouched
    expect(r.hpHealed).toBe(40);
    // clamps at max
    const b = hero({ hp: 90, maxhp: 100 });
    applyReprieve([b], rep("mend", 0.4));
    expect(b.hp).toBe(100);
  });

  it("'mana' restores a fraction of MAX MP, not HP", () => {
    const a = hero({ hp: 30, maxhp: 100, mp: 10, maxmp: 50 });
    const r = applyReprieve([a], rep("mana", 0.5));
    expect(a.mp).toBe(35);          // 10 + 50% of 50
    expect(a.hp).toBe(30);          // HP untouched
    expect(r.mpRestored).toBe(25);
  });

  it("'regen' grants a CARRIED buff (pendingRegen), not an instant heal", () => {
    const a = hero({ hp: 30, maxhp: 100 });
    const r = applyReprieve([a], rep("regen", 5));
    expect(a.hp).toBe(30);          // no instant healing — it seeds into the next battle
    expect(a.pendingRegen).toBe(5);
    expect(r.regenTicks).toBe(5);
    // takes the larger pending value (idempotent-ish, never downgrades a stronger carry)
    applyReprieve([a], rep("regen", 3));
    expect(a.pendingRegen).toBe(5);
  });

  it("never raises the fallen — only standing heroes are touched", () => {
    const dead = hero({ alive: false, hp: 0 });
    const live = hero({ hp: 20, maxhp: 100 });
    const r = applyReprieve([dead, live], rep("mend", 0.5));
    expect(dead.hp).toBe(0);
    expect(live.hp).toBe(70);
    expect(r.affected).toBe(1);
  });

  it("uses sensible defaults when amount is omitted", () => {
    const a = hero({ hp: 0, maxhp: 100 });
    applyReprieve([a], rep("mend"));   // default 0.4
    expect(a.hp).toBe(40);
    const b = hero({ hp: 50, maxhp: 100, pendingRegen: 0 });
    applyReprieve([b], rep("regen"));  // default 5 ticks
    expect(b.pendingRegen).toBe(5);
  });
});
