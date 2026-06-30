// Class spec band→number generator (ADR 0020 §3). Locks the spec→engine mapping: tier→power,
// milestone→MNA gate, gen/cost bands→resource, the one-way economy (D3), cooldown bands.

import { describe, it, expect } from "vitest";
import type { AbilityEntry } from "../src/data/classSpec";
import { genAbility, genClass, GEN_BAND, COST_BAND } from "../src/systems/classGen";

// A representative slice of a 52-slot spec — one of each tier.
const SAMPLE: AbilityEntry[] = [
  { name: "Solar Strike", tier: "auto", milestone: 0, type: "phys", target: "enemy", effect: "A basic strike.", gen: "minor" },
  { name: "Flare Lance", tier: "special", lane: "A", milestone: 15, type: "phys", target: "enemy", effect: "A charged lance. Generates Radiance.", gen: "moderate", cooldown: "short", status: "burn" },
  { name: "Sunflare", tier: "signature", lane: "B", milestone: 30, type: "mag", target: "allEnemies", effect: "A burst of fire. Spends Radiance.", cost: "med", cooldown: "medium", status: "burn" },
  { name: "Supernova", tier: "ultimate", milestone: 100, type: "mag", target: "allEnemies", effect: "Cataclysm.", cost: "high", cooldown: "long" },
  { name: "Solar Core", tier: "passive", lane: "C", milestone: 30, type: "util", target: "self", effect: "Passive: +ability power." },
];

describe("classGen — band → number (ADR 0020 §3)", () => {
  it("mnaReq mirrors the milestone (the MNA gate)", () => {
    for (const g of genClass(SAMPLE)) expect(g.mnaReq).toBe(SAMPLE.find((s) => s.name === g.name)!.milestone);
  });

  it("power escalates by tier (auto < special < signature < ultimate); passives deal none", () => {
    const by = Object.fromEntries(genClass(SAMPLE).map((g) => [g.name, g]));
    expect(by["Solar Strike"].power).toBeLessThan(by["Flare Lance"].power);
    expect(by["Flare Lance"].power).toBeLessThan(by["Sunflare"].power);
    expect(by["Sunflare"].power).toBeLessThan(by["Supernova"].power);
    expect(by["Solar Core"].power).toBe(0);
    expect(by["Solar Core"].passive).toBe(true);
  });

  it("one-way economy (D3): specials/auto only GENERATE, signatures/ultimates only SPEND", () => {
    const g = genAbility(SAMPLE[1]); // special, gen moderate
    expect(g.resourceGen).toBe(GEN_BAND.moderate);
    expect(g.resourceCost).toBe(0);
    const u = genAbility(SAMPLE[3]); // ultimate, cost high
    expect(u.resourceCost).toBe(COST_BAND.high);
    expect(u.resourceGen).toBe(0);
    expect(u.ult).toBe(true);
  });

  it("a band-less special generates nothing; bands map monotonically", () => {
    expect(genAbility({ name: "x", tier: "special", milestone: 5, type: "phys", target: "enemy", effect: "" }).resourceGen).toBe(0);
    expect(GEN_BAND.minor).toBeLessThan(GEN_BAND.moderate);
    expect(GEN_BAND.moderate).toBeLessThan(GEN_BAND.major);
  });

  it("carries lane + status through for the choice system / status engine", () => {
    const g = genAbility(SAMPLE[1]);
    expect(g.lane).toBe("A");
    expect(g.status).toBe("burn");
  });
});
