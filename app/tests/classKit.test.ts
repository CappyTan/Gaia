// v3/classes capstone — the live-combat wiring (ADR 0020): a re-encoded ClassSpec's banked picks become
// engine Skills, resolved into a member's usable kit and the one-way resource economy. Pure systems tests
// (no DOM): the spec→Skill bridge (classKit), the recalc kit-resolution seam, and the turn-gain decision.

import { describe, it, expect } from "vitest";
import { GENERATED_SKILLS, genSkillKey, activeKitKeys, autoGenFor, hasSpec } from "../src/systems/classKit";
import { SKILLS } from "../src/data/skills";
import { HELIOMANCER, SLICE_SPECS } from "../src/data/classSpecs";
import { genAbility } from "../src/systems/classGen";
import { turnGain } from "../src/systems/resources";
import { makeMember, recalc } from "../src/systems/progression";
import { kitFor } from "../src/data/classes";
import { buildDef } from "../src/data/party";

const heliomancer = () => {
  const m = makeMember(buildDef("h", "Solas", "SOL", "Staff", "back"));
  m.mnaAlloc.SOL = 100; // a fully-realised SOL well so every milestone is reached
  return m;
};

describe("classKit — spec → engine Skill registration", () => {
  it("every Heliomancer ability is registered into the shared SKILLS map under its v3 key", () => {
    for (const a of HELIOMANCER.abilities) {
      const s = SKILLS[genSkillKey(a.name)];
      expect(s, a.name).toBeTruthy();
      expect(s.name).toBe(a.name);
    }
  });

  it("generated keys are globally unique across every slice spec (the slug-collision gate)", () => {
    // genSkillKey slugifies (strips non-alphanumerics), which is MORE aggressive than the spec lint's
    // name-uniqueness (lowercase only) — so two names differing only in punctuation would pass the lint
    // but collide here, silently dropping one ability. This assertion is the gate that catches that the
    // moment such a spec is added to SLICE_SPECS (fail loud at the test gate, never silently at runtime).
    const keys = SLICE_SPECS.flatMap((sp) => sp.abilities.map((a) => genSkillKey(a.name)));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("the converter carries the one-way economy: specials generate, signatures/ultimates cost", () => {
    const special = GENERATED_SKILLS[genSkillKey("Firebolt")]; // special, gen moderate
    expect(special.resourceGen).toBeGreaterThan(0);
    expect(special.resourceCost).toBe(0);
    expect(special.att).toBe("SOL");
    expect(special.mnaReq).toBe(5);
    expect(special.status).toEqual({ burn: 2 }); // status id → a StatusMap with a default duration

    const signature = GENERATED_SKILLS[genSkillKey("Ignition")]; // signature, cost med
    expect(signature.resourceCost).toBeGreaterThan(0);
    expect(signature.resourceGen).toBe(0);

    const ult = GENERATED_SKILLS[genSkillKey("Death Ray")]; // ultimate
    expect(ult.ult).toBe(true);
    expect(ult.resourceCost).toBeGreaterThan(0);
    expect(ult.mnaReq).toBe(100);
  });
});

describe("classKit — activeKitKeys (the commandable kit from picks + MNA)", () => {
  it("excludes the auto-attack and passives; empty picks → empty kit", () => {
    expect(activeKitKeys("SOL", "Staff", {}, 100)).toEqual([]);
    // a passive pick alone never surfaces as a command
    expect(activeKitKeys("SOL", "Staff", { "passive@30": ["Pyromania"] }, 100)).toEqual([]);
  });

  it("returns the picked specials/signatures in SKILLS-key form, in milestone order", () => {
    const picks = { "special@5": ["Firebolt"], "signature@10": ["Ignition"] };
    expect(activeKitKeys("SOL", "Staff", picks, 100)).toEqual([genSkillKey("Firebolt"), genSkillKey("Ignition")]);
  });

  it("respects MNA dormancy — a pick above the current MNA is banked, not active", () => {
    const picks = { "special@5": ["Firebolt"] };
    expect(activeKitKeys("SOL", "Staff", picks, 100)).toEqual([genSkillKey("Firebolt")]);
    expect(activeKitKeys("SOL", "Staff", picks, 4)).toEqual([]); // below milestone 5 → dormant
  });

  it("a class with no re-encoded spec → null (caller falls back to the legacy kit)", () => {
    expect(hasSpec("NOX", "Dual Swords")).toBe(false);
    expect(activeKitKeys("NOX", "Dual Swords", { "special@5": ["x"] }, 100)).toBeNull();
    expect(hasSpec("SOL", "Staff")).toBe(true);
  });

  it("autoGenFor returns the spec's auto-attack gen (SOL Staff) and null otherwise", () => {
    expect(autoGenFor("SOL", "Staff")).toBe(genAbility(HELIOMANCER.abilities.find((a) => a.tier === "auto")!).resourceGen);
    expect(autoGenFor("SOL", "Staff")).toBeGreaterThan(0);
    expect(autoGenFor("NOX", "Dual Swords")).toBeNull();
  });
});

describe("classKit — turnGain (one-way resource decision, pure)", () => {
  it("a basic Attack/Defend (no skill) generates the auto trickle", () => {
    expect(turnGain(null, 6, 12)).toBe(6);
    expect(turnGain(undefined, 6, 12)).toBe(6);
  });
  it("a generating special gives its band; a spend action gives nothing; a legacy skill gives the flat gen", () => {
    expect(turnGain({ resourceGen: 12, resourceCost: 0 }, 6, 12)).toBe(12); // special
    expect(turnGain({ resourceCost: 30, resourceGen: 0 }, 6, 12)).toBe(0); // signature/ultimate (it spent at resolve)
    expect(turnGain({}, 6, 12)).toBe(12); // legacy hand-authored skill — no resource fields
    expect(turnGain({ resourceGen: 20 }, 6, 12)).toBe(20);
  });
});

describe("progression — recalc resolves the V3 kit from picks (else the legacy kit)", () => {
  it("no picks → the legacy kitFor kit (a hero is never left without abilities)", () => {
    const m = heliomancer();
    recalc([m]);
    expect(m.skills).toEqual(kitFor("SOL", "Staff"));
    expect(m.skills.length).toBeGreaterThan(0);
  });

  it("with picks → the choice-derived kit (the picked specials/signatures), gated by MNA", () => {
    const m = heliomancer();
    m.picks = { "special@5": ["Firebolt"], "signature@10": ["Ignition"] };
    recalc([m]);
    expect(m.skills).toEqual([genSkillKey("Firebolt"), genSkillKey("Ignition")]);
    // every resolved key is a real, registered Skill in the member's own Attunement
    for (const k of m.skills) { expect(SKILLS[k]).toBeTruthy(); expect(SKILLS[k].att).toBe("SOL"); }
  });

  it("picks above the member's MNA go dormant (only Attack/Defend remain)", () => {
    const m = heliomancer();
    m.mnaAlloc.SOL = 4; // below the @5 milestone
    m.picks = { "special@5": ["Firebolt"] };
    recalc([m]);
    expect(m.skills).toEqual([]);
  });
});
