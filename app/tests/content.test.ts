// Content-layer tests: the DB registry query API + cross-references, and the schema/integrity
// validator. These guard the "database" so authoring/tweaking content can't silently break the game.

import { describe, it, expect } from "vitest";
import { DB } from "../src/data/db";
import { validateContent } from "../src/data/validate";
import { ARCHETYPE_KEYS } from "../src/data/party";
import { ATTUNEMENTS } from "../src/types";

describe("content integrity (validateContent)", () => {
  it("reports no problems — all content is internally consistent", () => {
    expect(validateContent()).toEqual([]);
  });
});

describe("DB registry", () => {
  it("queries skills and reports which classes use them", () => {
    expect(DB.skills.get("guard")).toBeTruthy();
    expect(DB.skills.all().length).toBeGreaterThan(0);
    expect(DB.skills.ults().every((s) => s.ult)).toBe(true);
    // guard is the SOL Sword & Shield opener
    expect(DB.skills.usedBy("guard")).toContain("SOL Sword & Shield");
  });
  it("queries the bestiary with zone cross-references", () => {
    expect(DB.enemies.get("slime")).toBeTruthy();
    expect(DB.enemies.keys().length).toBe(DB.enemies.all().length);
    expect(DB.enemies.rares().some((e) => e.key === "hogger")).toBe(true);
    expect(DB.enemies.bosses().some((e) => e.boss)).toBe(true);
    // slime spawns in Greenvale (zone 0); the Cave Troll boss is in zone 1
    expect(DB.enemies.zonesOf("slime")).toContain(0);
    expect(DB.enemies.zonesOf("troll")).toContain(1);
    expect(DB.enemies.inZone(0).some((e) => e.key === "slime")).toBe(true);
  });
  it("exposes the full 45-class grid with kits", () => {
    expect(DB.classes.all().length).toBe(ATTUNEMENTS.length * ARCHETYPE_KEYS.length);
    expect(DB.classes.all().every((c) => c.kit.length > 0)).toBe(true);
  });
  it("exposes zones", () => {
    expect(DB.zones.count()).toBe(DB.zones.all().length);
    expect(DB.zones.get(0)).toBeTruthy();
  });
});
