// @vitest-environment jsdom
//
// OVERWORLD MOVEMENT AUDIT (Dara) — the smooth-step glide engine (controllers/field.ts): the pure
// interpolation math (glidePos, playerImg) and the turn-then-walk beat (move()'s TURN_MS gate). The
// visual glide itself only ARMS when a real <canvas> exists (glideFrom bails in jsdom — see
// silverwood-flow.test.ts's note), so these tests drive the math directly by setting Field's glide/turn
// state by hand, and drive move()'s FACING/turn-gate logic (which doesn't depend on canvas) live.

import { describe, it, expect, beforeEach } from "vitest";
import { Field, WALK_MS, TURN_MS } from "../src/controllers/field";
import { Game } from "../src/controllers/game";
import { Screens } from "../src/controllers/screens";

describe("glidePos — the tile-to-tile interpolation curve", () => {
  beforeEach(() => { (Field as any)._glide = null; });

  it("settled (no glide) returns the exact target, k=0", () => {
    expect(Field.glidePos(5, 5)).toEqual({ x: 5, y: 5, k: 0 });
  });

  it("mid-glide sits strictly between the origin and target tile", () => {
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - WALK_MS / 2, ms: WALK_MS };
    const p = Field.glidePos(1, 0);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(1);
    expect(p.k).toBeCloseTo(0.5, 1);
  });

  it("smoothstep is exactly 0.5 at the temporal midpoint (symmetric ease-in/ease-out)", () => {
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - WALK_MS / 2, ms: WALK_MS };
    const p = Field.glidePos(1, 0);
    expect(p.x).toBeCloseTo(0.5, 2);
  });

  it("clamps to the target once the glide duration has fully elapsed (never overshoots)", () => {
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - WALK_MS * 5, ms: WALK_MS };
    expect(Field.glidePos(1, 0)).toEqual({ x: 1, y: 0, k: 1 });
  });

  it("a >2-tile jump (teleport / space change) snaps instantly instead of gliding across it", () => {
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - 5, ms: WALK_MS };
    expect(Field.glidePos(9, 9)).toEqual({ x: 9, y: 9, k: 0 });
  });
});

describe("playerImg — the walk-cycle frame stays locked to ACTUAL glide progress, not input events", () => {
  beforeEach(() => { (Field as any)._glide = null; Field.step = 0; Field.face = "down"; });

  it("idle (settled, no glide) always shows the neutral frame", () => {
    const img = Field.playerImg({} as any);
    expect(img).toBeUndefined(); // no art loaded in the test env — asserting it doesn't throw is the point
  });

  it("the first half of a tile-glide shows neutral; the second half shows a strike frame", () => {
    const T: Record<string, any> = { "player-down-1": "neutral", "player-down-2": "strikeA", "player-down-0": "strikeB" };
    Field.step = 0;
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - 5, ms: WALK_MS }; // k≈0.03 — early
    expect(Field.playerImg(T)).toBe("neutral");
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - WALK_MS * 0.75, ms: WALK_MS }; // k≈0.75 — late
    expect(Field.playerImg(T)).toBe("strikeA"); // step even → frame 2
    Field.step = 1;
    (Field as any)._glide = { fx: 0, fy: 0, t0: performance.now() - WALK_MS * 0.75, ms: WALK_MS };
    expect(Field.playerImg(T)).toBe("strikeB"); // step odd → frame 0 (alternate foot)
  });
});

describe("move() — the turn-then-walk beat (TURN_MS)", () => {
  beforeEach(() => {
    Game.party = [{ alive: true } as any];
    Screens.cur = "field"; // move() gates on this — a fresh jsdom run defaults to "title"
    Field.init(); // canvas is null in jsdom → glideFrom no-ops; px/py logic still runs live
    (Field as any)._glide = null;
    (Field as any)._turn = null;
    Field.face = "down";
    Field.px = 10; Field.py = 10;
  });

  it("a direction change from the current facing TURNS first and does not step yet", () => {
    const before = { x: Field.px, y: Field.py };
    Field.move(-1, 0); // was facing down, now asked to go left
    expect(Field.face).toBe("left");
    expect({ x: Field.px, y: Field.py }).toEqual(before); // no step yet — this was a pivot
    expect((Field as any)._turn).not.toBeNull();
  });

  it("continuing in the SAME facing skips the turn beat entirely (zero added latency)", () => {
    Field.face = "left";
    (Field as any)._turn = null;
    Field.move(-1, 0); // already facing left — should step immediately, no turn beat armed
    expect((Field as any)._turn).toBeNull();
  });

  it("TURN_MS is a positive, small beat (not zero, not sluggish)", () => {
    expect(TURN_MS).toBeGreaterThan(0);
    expect(TURN_MS).toBeLessThan(200);
  });

  it("WALK_MS is a classic-JRPG walking pace, not the old twitchy dash rate", () => {
    expect(WALK_MS).toBeGreaterThanOrEqual(140);
    expect(WALK_MS).toBeLessThanOrEqual(220);
  });
});
