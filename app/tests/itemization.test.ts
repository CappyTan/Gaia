// Itemization (ADR 0015) — slot-locked affix homes (§5) + random per-slot primary (§4). Seeded → deterministic.

import { describe, it, expect } from "vitest";
import { makeItem } from "../src/systems/loot";
import { seeded } from "../src/core/rng";
import type { Slot } from "../src/types";

const SLOTS: Slot[] = ["weapon", "helmet", "armor", "gloves", "boots", "trinket"];

describe("itemization — slot-locked affixes (ADR 0015 §5)", () => {
  it("hard exclusives only roll on their home slot (Crt→gloves, Eva→boots, Blk→armor)", () => {
    const home: Record<string, Slot> = { Crt: "gloves", Eva: "boots", Blk: "armor" };
    for (const slot of SLOTS) {
      for (let s = 0; s < 40; s++) {
        const it = makeItem(null, slot, 5, slot === "weapon" ? "Staff" : null, 12, "SOL", seeded(s));
        for (const a of it.affixes) if (home[a.stat]) expect(home[a.stat]).toBe(slot);
      }
    }
  });

  it("gloves CAN roll Crit Chance; boots never can", () => {
    let gloves = false, boots = false;
    for (let s = 0; s < 80; s++) {
      if (makeItem(null, "gloves", 5, null, 12, "SOL", seeded(s)).affixes.some((a) => a.stat === "Crt")) gloves = true;
      if (makeItem(null, "boots", 5, null, 12, "SOL", seeded(s)).affixes.some((a) => a.stat === "Crt")) boots = true;
    }
    expect(gloves).toBe(true);
    expect(boots).toBe(false);
  });
});

describe("itemization — per-slot primary (ADR 0015 §4)", () => {
  it("a weapon's primary is its Attunement's governing stat (SOL → AGI)", () => {
    const w = makeItem(null, "weapon", 3, "Staff", 10, "SOL", seeded(1));
    expect(Object.keys(w.prim ?? {})).toEqual(["AGI"]);
  });

  it("armor primaries roll randomly — not pinned to one stat", () => {
    const seen = new Set<string>();
    for (let s = 0; s < 80; s++) seen.add(Object.keys(makeItem(null, "armor", 3, null, 10, "NOX", seeded(s)).prim ?? {})[0]);
    expect(seen.size).toBeGreaterThan(1);
  });
});
