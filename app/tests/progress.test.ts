// Pure wayfinding-progress tests (ADR 0011): the known/entered sets, the derived Objective, and the
// save round-trip. No RNG, no DOM — deterministic by construction.

import { describe, it, expect } from "vitest";
import {
  emptyProgress, isRegionKnown, isRegionEntered, markRegionKnown, markRegionEntered,
  currentObjective, serializeProgress, reviveProgress, type ObjectiveCtx,
} from "../src/systems/progress";

const GV = "greenvale", SW = "silverwood";
const ctx = (currentZone: string, cleared: string[]): ObjectiveCtx => ({
  currentZone, gateCleared: (z) => cleared.includes(z),
});

describe("progress — known vs entered (entered ⊂ known)", () => {
  it("starts empty", () => {
    const p = emptyProgress();
    expect(isRegionKnown(p, GV)).toBe(false);
    expect(isRegionEntered(p, GV)).toBe(false);
  });

  it("naming a region makes it known but not entered", () => {
    const p = markRegionKnown(emptyProgress(), SW);
    expect(isRegionKnown(p, SW)).toBe(true);
    expect(isRegionEntered(p, SW)).toBe(false);
  });

  it("entering a region marks it both entered AND known", () => {
    const p = markRegionEntered(emptyProgress(), GV);
    expect(isRegionEntered(p, GV)).toBe(true);
    expect(isRegionKnown(p, GV)).toBe(true);
  });
});

describe("currentObjective — derived, in resolution order", () => {
  it("uncleared current-zone gate → clear-gate for the current zone", () => {
    const o = currentObjective(emptyProgress(), ctx(GV, []));
    expect(o.kind).toBe("clear-gate");
    expect(o.zoneId).toBe(GV);
    expect(o.label.length).toBeGreaterThan(0);
  });

  it("gate cleared + a known-but-unentered region → travel there", () => {
    const p = markRegionEntered(markRegionKnown(emptyProgress(), SW), GV); // know SW, have entered GV
    const o = currentObjective(p, ctx(GV, [GV]));
    expect(o.kind).toBe("travel");
    expect(o.zoneId).toBe(SW);
  });

  it("gate cleared + everything known is entered → explore", () => {
    const p = markRegionEntered(emptyProgress(), GV);
    const o = currentObjective(p, ctx(GV, [GV]));
    expect(o.kind).toBe("explore");
    expect(o.zoneId).toBe(GV);
  });
});

describe("save round-trip (ADR 0007) — tolerant, invariant-preserving", () => {
  it("serialize → revive preserves known + entered", () => {
    const p = markRegionEntered(markRegionKnown(emptyProgress(), SW), GV);
    const back = reviveProgress(serializeProgress(p));
    expect(isRegionKnown(back, SW)).toBe(true);
    expect(isRegionKnown(back, GV)).toBe(true);
    expect(isRegionEntered(back, GV)).toBe(true);
    expect(isRegionEntered(back, SW)).toBe(false);
  });

  it("revive never throws on junk and repairs entered ⊂ known", () => {
    expect(isRegionKnown(reviveProgress(null), GV)).toBe(false);
    expect(isRegionKnown(reviveProgress("nonsense"), GV)).toBe(false);
    // an old/hand-edited save lists an entered region that wasn't in `known` → revive repairs it.
    const repaired = reviveProgress({ known: [SW, 42], entered: [GV, null] });
    expect(isRegionKnown(repaired, SW)).toBe(true);
    expect(isRegionEntered(repaired, GV)).toBe(true);
    expect(isRegionKnown(repaired, GV)).toBe(true); // entered ⊂ known repaired
  });
});
