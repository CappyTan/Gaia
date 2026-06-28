// Encounter composition (systems/encounter) — the pure decisions the field controller and the
// balance sim share. Seeded rng = deterministic; we assert the band/depth/champion/area-lean logic.

import { describe, it, expect } from "vitest";
import { rollEncounter, pickAreaSet, type EncounterCtx } from "../src/systems/encounter";
import { seeded } from "../src/core/rng";
import type { EncounterBand } from "../src/data/zones";

const bands: EncounterBand[] = [
  { at: 0,   sets: [["slime"], ["kobold"]] },
  { at: 0.5, sets: [["gbandit"], ["gmage"]] },
];
const base = (over: Partial<EncounterCtx> = {}): EncounterCtx => ({
  bands, progress: 0, inDungeon: false, dungeonFloor: 0, zoneIndex: 1, rareKeys: [], fav: undefined, ...over,
});

describe("encounter composition", () => {
  it("is deterministic under a seeded rng", () => {
    const a = rollEncounter(base({ progress: 0.6 }), seeded(42));
    const b = rollEncounter(base({ progress: 0.6 }), seeded(42));
    expect(a).toEqual(b);
  });

  it("selects the band by progress (the last band whose .at ≤ p)", () => {
    const early = rollEncounter(base({ progress: 0.1 }), seeded(1));
    expect(["slime", "kobold"]).toContain(early.keys[0]);
    const late = rollEncounter(base({ progress: 0.9, zoneIndex: 0 }), seeded(1)); // zone 0 = no champ
    expect(["gbandit", "gmage"]).toContain(late.keys[0]);
  });

  it("depth = progress on the overworld; dungeon adds 0.25 + floor bump, clamped to 1", () => {
    expect(rollEncounter(base({ progress: 0.3 }), seeded(1)).depth).toBeCloseTo(0.3);
    expect(rollEncounter(base({ progress: 0.3, inDungeon: true }), seeded(1)).depth).toBeCloseTo(0.55);
    expect(rollEncounter(base({ progress: 0.3, inDungeon: true, dungeonFloor: 2 }), seeded(1)).depth).toBeCloseTo(0.79);
    expect(rollEncounter(base({ progress: 0.9, inDungeon: true, dungeonFloor: 9 }), seeded(1)).depth).toBe(1); // clamped
  });

  it("the starter zone (index 0) never spawns a champion pack", () => {
    for (let i = 0; i < 60; i++) {
      const e = rollEncounter(base({ progress: 0.9, zoneIndex: 0 }), seeded(i));
      expect(e.champIdx).toBe(-1);
    }
  });

  it("champion packs only appear past the opening (p > 0.12)", () => {
    for (let i = 0; i < 60; i++) expect(rollEncounter(base({ progress: 0.1 }), seeded(i)).champIdx).toBe(-1);
  });

  it("a champion lead is index 0 and adds a minion (never another champion)", () => {
    // find a seed that rolls a champion at high progress, then check the shape
    let champ = rollEncounter(base({ progress: 0.95 }), seeded(0));
    for (let i = 1; champ.champIdx < 0 && i < 200; i++) champ = rollEncounter(base({ progress: 0.95 }), seeded(i));
    expect(champ.champIdx).toBe(0);
    expect(champ.keys.length).toBeGreaterThanOrEqual(2); // lead + at least one add
  });

  it("rare substitution yields a lone rare from the eligible pool", () => {
    let rare = rollEncounter(base({ rareKeys: ["hogger"] }), seeded(0));
    for (let i = 1; !rare.rare && i < 500; i++) rare = rollEncounter(base({ rareKeys: ["hogger"] }), seeded(i));
    expect(rare.rare).toBe(true);
    expect(rare.keys).toEqual(["hogger"]);
    expect(rare.champIdx).toBe(-1);
  });

  it("pickAreaSet weight-biases toward the favoured set but keeps every set possible", () => {
    const sets = [["slime"], ["gbandit"]];
    const fav = { gbandit: 9 }; // strongly favour the second set
    const counts = [0, 0];
    for (let i = 0; i < 400; i++) counts[pickAreaSet(sets, fav, seeded(i))[0] === "gbandit" ? 1 : 0]++;
    expect(counts[1]).toBeGreaterThan(counts[0]); // favoured set wins the long run
    expect(counts[0]).toBeGreaterThan(0);          // but the other set still appears (variety preserved)
  });

  it("pickAreaSet with no favour table is a plain pick over the sets", () => {
    const sets = [["a"], ["b"], ["c"]];
    const got = new Set<string>();
    for (let i = 0; i < 50; i++) got.add(pickAreaSet(sets, undefined, seeded(i))[0]);
    expect(got.size).toBeGreaterThan(1); // not stuck on one
  });
});
