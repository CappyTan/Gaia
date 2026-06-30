// v3/classes vertical slice — the SOL Staff Heliomancer re-encoded from its markdown spec, run through
// the band→number generator. Validates the 52-slot invariants (ADR 0020 / Class System Model) on a real
// re-encoded class AND that the generated kit is well-formed: the spec→engine pipeline end-to-end.

import { describe, it, expect } from "vitest";
import { HELIOMANCER, SPECS } from "../src/data/classSpecs";
import { genClass } from "../src/systems/classGen";
import type { AbilityTier, ClassSpec } from "../src/data/classSpec";
import { ATTUNEMENTS } from "../src/types";

const A = HELIOMANCER.abilities;
const byTier = (t: AbilityTier) => A.filter((a) => a.tier === t);

describe("Heliomancer spec — 52-slot invariants (ADR 0020)", () => {
  it("is exactly 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = 52", () => {
    expect(byTier("auto").length).toBe(1);
    expect(byTier("special").length).toBe(20);
    expect(byTier("signature").length).toBe(18);
    expect(byTier("ultimate").length).toBe(4);
    expect(byTier("passive").length).toBe(9);
    expect(A.length).toBe(52);
  });

  it("specials sit on 5..95 (×2), signatures on 10..90 (×2), ultimates at 100, passives at 30/60/90", () => {
    const ms = (t: AbilityTier) => byTier(t).map((a) => a.milestone).sort((x, y) => x - y);
    expect(ms("special")).toEqual([5, 5, 15, 15, 25, 25, 35, 35, 45, 45, 55, 55, 65, 65, 75, 75, 85, 85, 95, 95]);
    expect(ms("signature")).toEqual([10, 10, 20, 20, 30, 30, 40, 40, 50, 50, 60, 60, 70, 70, 80, 80, 90, 90]);
    expect(byTier("ultimate").every((a) => a.milestone === 100)).toBe(true);
    expect(ms("passive")).toEqual([30, 30, 30, 60, 60, 60, 90, 90, 90]);
  });

  it("ultimates are 3 laned + 1 neutral (unlaned)", () => {
    const laned = byTier("ultimate").filter((a) => a.lane).length;
    expect(laned).toBe(3);
    expect(byTier("ultimate").filter((a) => !a.lane).length).toBe(1);
  });

  it("ability names are unique within the kit (invariant #8)", () => {
    const names = A.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("Heliomancer — generated kit (spec → engine numbers)", () => {
  const gen = genClass(A);

  it("the one-way economy holds: specials/auto only generate, signatures/ultimates only spend", () => {
    for (const g of gen) {
      const spec = A.find((a) => a.name === g.name)!;
      if (spec.tier === "special" || spec.tier === "auto") { expect(g.resourceCost).toBe(0); }
      if (spec.tier === "signature" || spec.tier === "ultimate") { expect(g.resourceGen).toBe(0); }
      expect(g.resourceGen > 0 && g.resourceCost > 0).toBe(false); // never both
    }
  });

  it("every ability's MNA gate equals its milestone; ultimates flagged; passives deal no direct damage", () => {
    for (const g of gen) expect(g.mnaReq).toBe(A.find((a) => a.name === g.name)!.milestone);
    expect(gen.filter((g) => g.ult).length).toBe(4);
    for (const g of gen.filter((g) => g.passive)) expect(g.power).toBe(0);
  });

  it("auto generates a minor trickle; a major special out-generates a moderate one", () => {
    const auto = gen.find((g) => g.name === "Sunbolt")!;
    expect(auto.resourceGen).toBeGreaterThan(0);
    const major = gen.find((g) => g.name === "Sunspear")!; // gen major
    const moderate = gen.find((g) => g.name === "Firebolt")!; // gen moderate
    expect(major.resourceGen).toBeGreaterThan(moderate.resourceGen);
  });
});

// The full roster: every class transcribed by the generator (app/tools/gen-class-specs.ts) must satisfy
// the same 52-slot invariants the markdown lint enforces — this is the gate that catches a generation
// regression (a parse drift would surface here as a malformed spec). All 45 = 5 Attunements × 9 Archetypes.
const SPECIAL_MS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
const SIGNATURE_MS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const tierMs = (s: ClassSpec, t: AbilityTier) => s.abilities.filter((a) => a.tier === t).map((a) => a.milestone).sort((x, y) => x - y);

describe("the full 45-class roster (generated specs)", () => {
  it("covers all 5 Attunements × 9 Archetypes = 45 distinct classes", () => {
    expect(SPECS.length).toBe(45);
    const keys = new Set(SPECS.map((s) => `${s.att}:${s.archetype}`));
    expect(keys.size).toBe(45);
    for (const att of ATTUNEMENTS) expect(SPECS.filter((s) => s.att === att).length).toBe(9);
  });

  it("every class is a well-formed 52-slot spec (counts, milestones, lanes, one-way economy)", () => {
    for (const s of SPECS) {
      const c = (t: AbilityTier) => s.abilities.filter((a) => a.tier === t).length;
      const where = `${s.att} ${s.archetype}`;
      expect(c("auto"), where).toBe(1);
      expect(c("special"), where).toBe(20);
      expect(c("signature"), where).toBe(18);
      expect(c("ultimate"), where).toBe(4);
      expect(c("passive"), where).toBe(9);
      expect(tierMs(s, "special"), where).toEqual(SPECIAL_MS.flatMap((m) => [m, m]));
      expect(tierMs(s, "signature"), where).toEqual(SIGNATURE_MS.flatMap((m) => [m, m]));
      expect(s.abilities.filter((a) => a.tier === "ultimate").every((a) => a.milestone === 100), where).toBe(true);
      // ultimates: 3 laned + 1 neutral; every special/signature/passive lane-tagged
      expect(s.abilities.filter((a) => a.tier === "ultimate" && a.lane).length, where).toBe(3);
      for (const a of s.abilities) if (a.tier === "special" || a.tier === "signature" || a.tier === "passive") expect(a.lane, `${where}: ${a.name}`).toBeTruthy();
      // one-way economy via the generator
      for (const g of genClass(s.abilities)) {
        if (g.passive) continue;
        expect(g.resourceGen > 0 && g.resourceCost > 0, `${where}: ${g.name}`).toBe(false);
      }
    }
  });

  it("ability names are globally unique across the entire roster (invariant #8)", () => {
    const names = SPECS.flatMap((s) => s.abilities.map((a) => a.name));
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect([...new Set(dupes)]).toEqual([]);
    expect(new Set(names).size).toBe(names.length);
  });
});
