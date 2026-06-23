// @vitest-environment jsdom
//
// RUNTIME-FLOW regression (Silverwood Overhaul — the [BLOCKING] per-zone mouth-cleared fix). The bug:
// `Game.miniBossDefeated` was a single per-RUN GLOBAL boolean, but the seamless big map hosts BOTH
// new-model zones (greenvale + silverwood) live at once, and crossing between them never calls loadZone
// (only syncZoneFromWorld). So beating Greenvale's mouth guard flipped the global true → reaching
// Silverwood's mouth, bigMove saw `!miniBossDefeated === false`, SKIPPED the Elder-Treant fight, and the
// Sunless-Grove mouth never opened → the dungeon was unreachable (bug-6, one zone later).
//
// The unit test (traversal.test.ts) missed it because it calls buildAuthoredGrid(SW, true) directly,
// bypassing the global. THIS test drives the live CONTROLLER: enter the big map, clear Greenvale's mouth
// through the real onMiniDefeated path, then step the player onto Silverwood's mouth via bigMove and
// assert the Elder-Treant fight STILL triggers (not skipped) — and once cleared, Silverwood's mouth
// realizes "mouth" so descend() is reachable. It MUST fail on the pre-fix global gate and pass after.

import { describe, it, expect, beforeEach } from "vitest";
import { Field } from "../src/controllers/field";
import { Game } from "../src/controllers/game";
import { ZONES } from "../src/data/zones";
import { placementOf } from "../src/data/world";

const GV = "greenvale", SW = "silverwood";
const swMouth = ZONES.find((z) => z.id === SW)!.layout.mouth;
const gvMouth = ZONES.find((z) => z.id === GV)!.layout.mouth;

/** World tile of a zone-local point (the big map windows the authored core into world space). */
function world(zoneId: string, p: { x: number; y: number }) {
  const pl = placementOf(zoneId)!;
  return { wx: pl.wx + p.x, wy: pl.wy + p.y };
}

describe("Silverwood per-zone mouth-cleared (BLOCKING — seamless-map soft-lock, bug-6 one zone later)", () => {
  // Record which trigger bigMove fired (the gating decision), without running the heavy battle/dungeon.
  let started: string[];
  let descended: number;

  beforeEach(() => {
    // a minimal party so saveNow() (called by some paths) is a no-op-safe non-empty run.
    Game.party = [{ alive: true } as any];
    Game.miniBossDefeated = false; // legacy global — the fix must NOT depend on it for the gate
    started = []; descended = 0;
    Field.init();           // canvas is null in jsdom → draw() is a no-op; resets per-run state
    Field.mouthCleared = {}; // explicit fresh state (no zone's guard beaten yet)
    // Stub the heavy leaves so we observe the GATING DECISION, not the battle/dungeon machinery.
    (Field as any).startMiniBoss = () => { started.push(Field.zone().id); };
    (Field as any).descend = () => { descended++; };
    Field.enterBigMap(GV);  // build BOTH zones' authored cores; drop at Greenvale's spawn
  });

  /** Place the player on a world tile and trigger that tile's cell handler via a zero-step bigMove. */
  function stepOnto(w: { wx: number; wy: number }) {
    Field.wx = w.wx; Field.wy = w.wy;
    Field.realizeAround(); Field.syncZoneFromWorld();
    Field.bigMove(0, 0); // nx/ny = current tile → runs the realized cell's trigger
  }

  it("clearing Greenvale's mouth does NOT open Silverwood's — its Elder-Treant fight still triggers", () => {
    // 1) stand on Greenvale's mouth → the guard fight triggers (Greenvale's mini).
    stepOnto(world(GV, gvMouth));
    expect(started).toEqual([GV]);
    expect(descended).toBe(0);

    // 2) beat it through the REAL controller path (battle.ts calls Field.onMiniDefeated for the current zone).
    Field.onMiniDefeated();
    expect(Field.miniClearedFor(GV)).toBe(true);
    expect(Field.miniClearedFor(SW)).toBe(false); // PER-ZONE: Silverwood's guard still stands

    // 3) cross to Silverwood's mouth. PRE-FIX (global flag) this would skip the fight and the mouth would
    //    already read "mouth" → soft-lock past a never-fought boss. POST-FIX the Elder-Treant fight fires.
    started = [];
    stepOnto(world(SW, swMouth));
    expect(started).toEqual([SW]); // the Elder-Treant guard fight STILL triggers (the bug-catching assert)
    expect(descended).toBe(0);     // and we do NOT descend past an unfought guard
  });

  it("once Silverwood's mouth is cleared, its mouth realizes \"mouth\" and descend() is reachable", () => {
    // clear Greenvale first (the global would have leaked into Silverwood pre-fix).
    stepOnto(world(GV, gvMouth)); Field.onMiniDefeated();
    // fight + beat Silverwood's guard.
    stepOnto(world(SW, swMouth)); expect(started).toContain(SW);
    Field.onMiniDefeated();
    expect(Field.miniClearedFor(SW)).toBe(true);

    // the realized Silverwood mouth cell now reads "mouth" (the authored grid was re-stamped per-zone).
    const w = world(SW, swMouth);
    Field.wx = w.wx; Field.wy = w.wy; Field.realizeAround();
    expect(Field.cellAt(w.wx, w.wy).kind).toBe("mouth");

    // stepping onto it now DESCENDS (no re-fight); Greenvale's mouth is unaffected.
    descended = 0; started = [];
    Field.bigMove(0, 0);
    expect(descended).toBe(1);
    expect(started).toEqual([]);
  });
});
