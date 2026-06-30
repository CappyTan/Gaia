// V3 passive effects (ADR 0020 §5): the prose→Subs-bonus derivation, and that recalc only applies it to
// a re-encoded hero WITH picks (so the legacy roster + the balance sim are unaffected). Pure + deterministic.

import { describe, it, expect } from "vitest";
import { passiveMods, applyMods } from "../src/systems/passives";
import { activePassives } from "../src/systems/classKit";
import { makeMember, recalc } from "../src/systems/progression";
import { buildDef } from "../src/data/party";
import { zeroSubs } from "../src/types";
import type { AbilityEntry } from "../src/data/classSpec";

const pas = (effect: string): AbilityEntry =>
  ({ name: effect, tier: "passive", lane: "A", milestone: 30, type: "util", target: "self", effect });

describe("passives — prose → Subs bonus (first-pass)", () => {
  it("maps the dominant combat axis by keyword", () => {
    expect(passiveMods([pas("your beams crit more")]).Crt).toBeGreaterThan(0);
    expect(passiveMods([pas("your beams ignore more resistance")]).Mpn).toBeGreaterThan(0);
    expect(passiveMods([pas("your beams ignore more resistance")]).Epn).toBeGreaterThan(0);
    expect(passiveMods([pas("gain damage reduction; cannot be moved")]).Mrd).toBeGreaterThan(0);
    expect(passiveMods([pas("every hit lifesteals")]).Lfs).toBeGreaterThan(0);
    expect(passiveMods([pas("bonus damage vs a low-HP target")]).Exe).toBeGreaterThan(0);
  });

  it("a non-matching passive falls through to ability power (every passive does something)", () => {
    const m = passiveMods([pas("your fields linger and bloom across the field")]);
    expect(m.Abp).toBeGreaterThan(0);
  });

  it("accumulates across multiple active passives", () => {
    const m = passiveMods([pas("your beams crit more"), pas("more single-target crit pressure")]);
    expect(m.Crt).toBeGreaterThan(passiveMods([pas("your beams crit more")]).Crt!);
  });

  it("applyMods adds into a live sub sheet in place", () => {
    const sub = zeroSubs();
    sub.Crt = 5;
    applyMods(sub, { Crt: 6, Abp: 8 });
    expect(sub.Crt).toBe(11);
    expect(sub.Abp).toBe(8);
  });
});

describe("passives — recalc integration (gated to a re-encoded class with picks)", () => {
  // A SOL Staff hero (Heliomancer is re-encoded) at full MNA so the @30 passive set is reached.
  const heliomancer = () => {
    const m = makeMember(buildDef("h", "Solas", "SOL", "Staff", "back"));
    m.mnaAlloc.SOL = 100;
    return m;
  };

  it("no picks → no passive bonus (legacy roster + the sim are unaffected)", () => {
    const m = heliomancer();
    recalc([m]);
    const baseCrit = m.critPct;
    // Focus pick (the @30 lane-B crit passive) is in the spec; with NO picks it can't apply.
    expect(m.picks).toBeUndefined();
    expect(activePassives(m.att, m.cls, {}, 100)).toEqual([]); // empty picks → no active passives
    expect(baseCrit).toBe(5 + (m.sub?.Crt ?? 0)); // exactly the gear/baseline crit, no passive add
  });

  it("a picked crit passive raises the hero's effective crit via recalc", () => {
    const base = heliomancer(); recalc([base]);
    const before = base.critPct;
    const m = heliomancer();
    m.picks = { "passive@30": ["Focus"] }; // Heliomancer @30 lane B — "your beams crit more"
    recalc([m]);
    expect(m.critPct).toBeGreaterThan(before); // the passive folded a crit bonus into the effective stat
  });
});
