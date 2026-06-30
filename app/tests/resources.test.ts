// Resource economy (ADR 0019) — pure pool engine: gain/cap, spend + per-action cap, and the per-pool
// personalities (collapsible to flat). Deterministic.

import { describe, it, expect } from "vitest";
import { zeroResources, gain, spend, canAfford, poolCap, applyPersonalities } from "../src/systems/resources";
import { RESOURCE } from "../src/data/resources";

describe("resource pools — gain / spend (ADR 0019)", () => {
  it("gain clamps to the pool cap", () => {
    const p = zeroResources();
    gain(p, "NOX", 99999);
    expect(p.NOX).toBe(poolCap("NOX"));
  });

  it("spend debits when affordable and refuses when not", () => {
    const p = zeroResources();
    gain(p, "SOL", 50);
    expect(canAfford(p, "SOL", 30)).toBe(true);
    expect(spend(p, "SOL", 30)).toBe(true);
    expect(p.SOL).toBe(20);
    expect(spend(p, "SOL", 999)).toBe(false); // can't afford
    expect(p.SOL).toBe(20); // unchanged on a failed spend
  });

  it("a single spend is capped (D8 anti-degeneracy — no whole-pool dump)", () => {
    const p = zeroResources();
    gain(p, "NOX", poolCap("NOX")); // a deep banked pool
    spend(p, "NOX", 9999); // ask for everything
    expect(poolCap("NOX") - p.NOX).toBe(RESOURCE.spendCap); // only the cap left the pool
  });

  it("pools are party-shared per Attunement (two SOL heroes draw one pool)", () => {
    const p = zeroResources();
    gain(p, "SOL", 20); // hero A contributes
    gain(p, "SOL", 20); // hero B contributes
    expect(p.SOL).toBe(40); // shared
    expect(spend(p, "SOL", 35)).toBe(true); // either may spend it
  });
});

describe("resource pools — personalities (ADR 0019 D2)", () => {
  it("SOL runs hot: bleeds when hoarded above its threshold", () => {
    const p = zeroResources();
    gain(p, "SOL", 100); // above decayAbove 60
    applyPersonalities(p, () => 0.5);
    expect(p.SOL).toBeLessThan(100);
    expect(p.SOL).toBeGreaterThanOrEqual(60); // never below the threshold
  });

  it("NOX banks: no passive change", () => {
    const p = zeroResources();
    gain(p, "NOX", 100);
    applyPersonalities(p, () => 0.5);
    expect(p.NOX).toBe(100);
  });

  it("ANIMA compounds: passive regen grows the pool", () => {
    const p = zeroResources();
    gain(p, "ANIMA", 50);
    applyPersonalities(p, () => 0.5);
    expect(p.ANIMA).toBeGreaterThan(50);
  });

  it("personalities are collapsible to flat (config toggle leaves pools untouched)", () => {
    const p = zeroResources();
    gain(p, "SOL", 100);
    const orig = RESOURCE.personalities;
    RESOURCE.personalities = false;
    applyPersonalities(p, () => 0.5);
    RESOURCE.personalities = orig;
    expect(p.SOL).toBe(100); // unchanged when flat
  });
});
