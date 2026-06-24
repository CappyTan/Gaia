// @vitest-environment jsdom
//
// REGRESSION (Warren exit-displacement): on the seamless big map, `Field.mouth` is what `ascend()`
// returns the player to when they climb out of a dungeon. It must always reflect the CURRENT zone's
// authored mouth. The bug: `Field.mouth` defaulted to a hardcoded (40,12) and was only refreshed in
// syncZoneFromWorld on a zone-INDEX CHANGE — but a run starts already in zone 0 (greenvale), so that
// guard never fires, leaving the stale default. Once Greenvale's mouth was RELOCATED to (35,20) for the
// lock-before-key flow, the player descended at the real (rendered) mouth (35,20) but ascend() dropped
// them back at the stale (40,12) — north of the real mouth ("the Bandit Warren entrance is messed up,
// I entered below and came out displaced"). This pins that Field.mouth tracks the live zone layout.

import { describe, it, expect, beforeEach } from "vitest";
import { Field } from "../src/controllers/field";
import { Game } from "../src/controllers/game";
import { ZONES } from "../src/data/zones";
import { placementOf } from "../src/data/world";

const GV = "greenvale";
const gvLayout = ZONES.find((z) => z.id === GV)!.layout;

/** Stand the player on a zone-local tile (world coords) and run the per-move position-derived sync. */
function standIn(zoneId: string, p: { x: number; y: number }) {
  const pl = placementOf(zoneId)!;
  Field.wx = pl.wx + p.x; Field.wy = pl.wy + p.y;
  Field.realizeAround(); Field.syncZoneFromWorld();
}

describe("Field.mouth tracks the current zone's authored mouth (Warren exit-displacement regression)", () => {
  beforeEach(() => {
    Game.party = [{ alive: true } as any];
    Field.init();
    Field.enterBigMap(GV); // start in Greenvale at zoneIndex 0 — the case that never trips the change-guard
  });

  it("syncs to the RELOCATED Greenvale mouth, not the stale default", () => {
    standIn(GV, gvLayout.spawn);
    // Must equal the live layout mouth (35,20), NOT the old hardcoded default (40,12).
    expect(Field.mouth).toEqual(gvLayout.mouth);
    expect(Field.mouth).not.toEqual({ x: 40, y: 12 });
  });

  it("the ascend() return tile equals the rendered mouth's world tile", () => {
    standIn(GV, gvLayout.spawn);
    const pl = placementOf(GV)!;
    // ascend() sets wx/wy = placement + this.mouth; the authored grid renders the mouth at the same
    // placement + layout.mouth — so the exit lands exactly on the mouth the player descended through.
    expect({ x: pl.wx + Field.mouth.x, y: pl.wy + Field.mouth.y })
      .toEqual({ x: pl.wx + gvLayout.mouth.x, y: pl.wy + gvLayout.mouth.y });
  });
});
