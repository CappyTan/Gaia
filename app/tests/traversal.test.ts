// Traversal-gating tests (Silverwood Overhaul, D2) — the barrier DATA predicates (data/world.ts) +
// the run-state CAPABILITY wrapper (systems/traversal.ts), and the deterministic SILVERWOOD
// dungeon-entry proof (live bug 6).
//
// The level-design-reviewer / cartography [Should-fix] grades the barrier predicates here:
//   • a LOCKED barrier tile blocks; an owned cap opens the WHOLE band; a CROSSING tile is passable
//     while locked; a NON-barrier tile never blocks; the band's half-open boundary is correct.
// Plus the traversal wrapper (blocks-when-locked / opens-when-owned) and the Silverwood mouth proof
// (mini defeated ⇒ the authored mouth realizes "mouth" ⇒ descend is reachable from spawn).

import { describe, it, expect } from "vitest";
import {
  BARRIERS, barrierAt, isBarrierCrossing, barrierBlocks, OVERWORLD_ID,
  buildAuthoredGrid, placementOf, unreachableWorldTargets,
  realizeKindWorld, inZonePolygon,
} from "../src/data/world";
import {
  emptyCaps, hasCap, grantCap, traversalBlocks, serializeCaps, reviveCaps,
} from "../src/systems/traversal";
import { ZONES } from "../src/data/zones";

const GORGE = BARRIERS.find((b) => b.id === "greenvale-gorge")!;
const band = GORGE.band[0]; // first rect of the (possibly multi-rect) band; [x0,x1) × [y0,y1)
// A tile that is OUTSIDE EVERY band rect — used for the half-open / out-of-band assertions, since the
// gorge is now a multi-rect organic band (a north reach stacked on a wider waist, D2 reposition), so a
// rect's own y1/x1 edge may be covered by the NEXT rect. Min over all rects keeps the boundary honest.
const inAnyRect = (x: number, y: number) =>
  GORGE.band.some((r) => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1);
const bandMinX = Math.min(...GORGE.band.map((r) => r.x0));
const bandMaxX = Math.max(...GORGE.band.map((r) => r.x1)); // exclusive across the whole band
const bandMinY = Math.min(...GORGE.band.map((r) => r.y0));

describe("traversal barrier predicates (data/world.ts) — the cartography Should-fix", () => {
  it("a barrier exists on the overworld with a band and crossing tiles", () => {
    expect(GORGE).toBeTruthy();
    expect(GORGE.map).toBe(OVERWORLD_ID);
    expect(GORGE.cap).toBe("gorge");
    expect(GORGE.band.length).toBeGreaterThan(0);
    expect(GORGE.crossing.length).toBeGreaterThan(0);
  });

  it("barrierAt resolves a tile inside the band and is undefined outside it (half-open boundary)", () => {
    // a tile strictly inside the band → the barrier.
    const ix = band.x0 + 1, iy = band.y0 + 1;
    expect(barrierAt(OVERWORLD_ID, ix, iy)?.id).toBe("greenvale-gorge");
    // HALF-OPEN [x0,x1) × [y0,y1): the min edge is IN. (Use the WHOLE-band extremes — the gorge is a
    // multi-rect organic band now, so a single rect's max edge can be covered by the next rect; only the
    // band's outermost max edges are truly exclusive.)
    expect(barrierAt(OVERWORLD_ID, bandMinX, bandMinY)?.id).toBe("greenvale-gorge"); // min corner inside
    expect(barrierAt(OVERWORLD_ID, bandMaxX, bandMinY)).toBeUndefined();             // outer x1 is exclusive
    // a tile just past the WHOLE band's south edge (below every rect) → out (y1 exclusive).
    const bandMaxY = Math.max(...GORGE.band.map((r) => r.y1));
    expect(barrierAt(OVERWORLD_ID, bandMinX, bandMaxY)).toBeUndefined();             // outer y1 is exclusive
    // sanity: those "outside" probes really are outside every rect.
    expect(inAnyRect(bandMaxX, bandMinY)).toBe(false);
    expect(inAnyRect(bandMinX, bandMaxY)).toBe(false);
    // far outside the band → nothing.
    expect(barrierAt(OVERWORLD_ID, bandMinX - 50, bandMinY)).toBeUndefined();
    // wrong map → nothing.
    expect(barrierAt("underworld", band.x0 + 1, band.y0 + 1)).toBeUndefined();
  });

  it("a LOCKED tile blocks; owning the cap opens the WHOLE band; a non-barrier tile never blocks", () => {
    const locked = emptyCaps();
    const owned = grantCap(emptyCaps(), "gorge");
    // a plain (non-crossing) band tile: blocked while locked, open once owned.
    const bx = band.x0 + 2, by = band.y0 + 2;
    expect(isBarrierCrossing(GORGE, bx, by)).toBe(false);
    expect(barrierBlocks(OVERWORLD_ID, bx, by, locked)).toBe(true);  // locked → blocked
    expect(barrierBlocks(OVERWORLD_ID, bx, by, owned)).toBe(false);  // owned → the band opens
    // a tile OUTSIDE any barrier never blocks, owned or not.
    expect(barrierBlocks(OVERWORLD_ID, band.x0 - 30, by, locked)).toBe(false);
    expect(barrierBlocks(OVERWORLD_ID, band.x0 - 30, by, owned)).toBe(false);
  });

  it("a CROSSING tile is BLOCKED while the barrier is locked (the raft is REQUIRED) and opens once owned", () => {
    const locked = emptyCaps(), owned = grantCap(emptyCaps(), "gorge");
    for (const c of GORGE.crossing) {
      expect(isBarrierCrossing(GORGE, c.x, c.y)).toBe(true);
      // The crossing is the RAFT route — it must be walled while locked (the contiguous crossing line
      // was a free walk-across-without-the-raft before this fix); the `crossing` list now drives only
      // RENDERING (where to draw the causeway once owned), not locked passability.
      expect(barrierBlocks(OVERWORLD_ID, c.x, c.y, locked)).toBe(true);  // locked → walled (no free crossing)
      expect(barrierBlocks(OVERWORLD_ID, c.x, c.y, owned)).toBe(false);  // owned → the raft route opens
    }
  });

  // SECONDARY CHECK (NOT the seal proof — the seal proof is the BFS describe block below). On the
  // CRITICAL PATH — the player's eastward roam from Greenvale's spawn — the impassable gorge is
  // ENCOUNTERED BEFORE they can reach/enter the Bandit-Warren mouth (the raft "key"). The mechanism is
  // that the gorge spans the spawn's LATITUDE (walk straight east → hit the wall) while the Warren mouth
  // has been RELOCATED OFF that eastward path (a SOUTH branch, a different latitude). So:
  //   • walking due east from spawn, the FIRST barrier band tile reached on the spawn row is the gorge;
  //   • the Warren mouth is NOT on the spawn row — it's south of it, requiring the player to turn off the
  //     east route to find it (so they meet the lock, get stuck, THEN seek the key);
  //   • the mouth is reachable WITHOUT touching the gorge band (mouth west of the wall, no soft-lock);
  //   • the Elder-Oak (Silverwood crown ≈ (280,46)) stays OUTSIDE the band (visible across, not buried).
  // This single-ray check is necessary-but-not-sufficient (it MISSED the walk-around-the-end leak the
  // BFS seal test now catches), so it is kept only as a critical-path-ordering sanity check.
  it("on the eastward critical path the impassable gorge is reached BEFORE the relocated Warren mouth (secondary, ordering only)", () => {
    const gvL = ZONES.find((z) => z.id === "greenvale")!.layout;
    const gvPl = placementOf("greenvale")!;
    const spawnWX = gvPl.wx + gvL.spawn.x, spawnWY = gvPl.wy + gvL.spawn.y; // the player's start, world space
    const mouthWX = gvPl.wx + gvL.mouth.x, mouthWY = gvPl.wy + gvL.mouth.y; // the raft-dropping mouth, world space

    // (1) The spawn's LATITUDE crosses the gorge band — walking due east, the player runs into the wall.
    const bandMaxY = Math.max(...GORGE.band.map((r) => r.y1));
    expect(spawnWY).toBeGreaterThanOrEqual(bandMinY);
    expect(spawnWY).toBeLessThan(bandMaxY);
    // the first barrier tile due-east of spawn (on the spawn row) is a gorge band tile, and it is east of spawn.
    let firstGorgeX = Infinity;
    for (let x = spawnWX + 1; x <= bandMaxX; x++) {
      if (barrierAt(OVERWORLD_ID, x, spawnWY)?.id === "greenvale-gorge") { firstGorgeX = x; break; }
    }
    expect(firstGorgeX).toBeLessThan(Infinity);  // the eastward ray HITS the gorge
    expect(firstGorgeX).toBeGreaterThan(spawnWX); // and the wall is ahead (east) of the player

    // (2) The Warren mouth is OFF the eastward path — NOT on the spawn row (it's a south branch). So the
    //     player meets the LOCK (the gorge, straight ahead) before they can reach the KEY (the mouth).
    expect(mouthWY).not.toBe(spawnWY);            // the mouth is at a different latitude than the spawn
    expect(mouthWY).toBeGreaterThan(spawnWY);     // specifically SOUTH of the spawn row (the relocation)

    // (3) The mouth is reachable WITHOUT crossing the gorge (it sits WEST of the wall) — no soft-lock; the
    //     order is purely "which do you meet first on the obvious east route", and that is the gorge.
    expect(mouthWX).toBeLessThan(bandMinX);
    expect(barrierAt(OVERWORLD_ID, mouthWX, mouthWY)).toBeUndefined(); // the mouth tile is not in the band

    // (4) The Elder-Oak weenie is NOT swallowed by the band — it remains visible ACROSS the gorge.
    expect(inAnyRect(280, 46)).toBe(false);
  });
});

// ── THE TRUE SEAL PROOF (ADR 0011 D2, the [Blocking] walk-around fix) ──────────────────────────────
// The single due-east ray above is necessary-but-NOT-sufficient: the prior band spanned only y40→110,
// so a LOCKED-state player could walk AROUND its north end (rows y14–39, between the ocean and the band
// top) or its south end and reach a Silverwood-zone tile (e.g. world (244,52)) WITHOUT owning the raft —
// the lock-before-key beat was cosmetic. This is the HONEST proof: a full 8-way BFS over the LOCKED
// overworld asserting there is NO walkable path from Greenvale's spawn to ANY Silverwood-zone tile
// EXCEPT via a crossing tile, and that WITH the cap a path exists. The BFS replicates the real
// `controllers/field.ts bigPassable` rule exactly: a world tile is walkable iff its realized kind is not
// "uncharted"/a FIELD wall (tree/water/cliff/river) AND it is not blocked by `traversalBlocks` (the
// barrier band, while the cap is unowned, except on a crossing tile).
describe("the Sunless Gorge truly SEALS Greenvale→Silverwood (8-way BFS, the [Blocking] walk-around fix)", () => {
  const FIELD_WALLS = new Set(["tree", "water", "cliff", "river"]);
  // Build every placed zone's authored core once (the realizer windows these into world space).
  const authoredGrids: Record<string, string[][]> = {};
  for (const z of ZONES) authoredGrids[z.id] = buildAuthoredGrid(z.id, true);

  const gvL = ZONES.find((z) => z.id === "greenvale")!.layout;
  const gvPl = placementOf("greenvale")!;
  const SPAWN = { x: gvPl.wx + gvL.spawn.x, y: gvPl.wy + gvL.spawn.y };

  // The exact `bigPassable` predicate (data/world + systems/traversal), parameterised by owned caps.
  const passable = (x: number, y: number, caps: Set<string>) => {
    if (traversalBlocks(OVERWORLD_ID, x, y, caps)) return false;
    const k = realizeKindWorld(OVERWORLD_ID, authoredGrids, x, y);
    return k !== "uncharted" && !FIELD_WALLS.has(k);
  };
  const isSilverwood = (x: number, y: number) => inZonePolygon("silverwood", x, y);

  /** 8-way BFS from Greenvale's spawn over the REAL `bigPassable` predicate (no crossing exception —
   *  while the cap is unowned the crossing tiles are walled too, so the raft is the ONLY way across). */
  const reachesSilverwood = (caps: Set<string>): { x: number; y: number } | null => {
    const seen = new Set<string>();
    const key = (x: number, y: number) => x + "," + y;
    const q: { x: number; y: number }[] = [SPAWN];
    seen.add(key(SPAWN.x, SPAWN.y));
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (q.length) {
      const { x, y } = q.shift()!;
      if (isSilverwood(x, y)) return { x, y };
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx > 959 || ny > 639 || seen.has(key(nx, ny))) continue;
        if (!passable(nx, ny, caps)) continue;
        seen.add(key(nx, ny));
        q.push({ x: nx, y: ny });
      }
    }
    return null;
  };

  it("LOCKED: Silverwood is UNREACHABLE — the raft is required (no walk-around the ends, no free crossing line)", () => {
    // The bug-catching assert: with the raft UNOWNED, a full 8-way BFS over the real passable predicate
    // must find NO path to any Silverwood-zone tile. (Two prior leaks: walking around the short band's
    // ends — fixed by the coast-to-coast seal; and the contiguous crossing line being walkable while
    // locked — fixed by barrierBlocks now walling crossings too.)
    expect(reachesSilverwood(emptyCaps())).toBeNull();
  });

  it("UNLOCKED (cap owned): the band opens and Silverwood is reachable", () => {
    expect(reachesSilverwood(grantCap(emptyCaps(), "gorge"))).not.toBeNull();
  });
});

describe("systems/traversal — the owned-capability run state", () => {
  it("emptyCaps owns nothing; grantCap adds (idempotent); hasCap reports membership", () => {
    const caps = emptyCaps();
    expect(hasCap(caps, "gorge")).toBe(false);
    grantCap(caps, "gorge"); grantCap(caps, "gorge"); // idempotent
    expect(hasCap(caps, "gorge")).toBe(true);
    expect(caps.size).toBe(1);
  });

  it("traversalBlocks: a locked gorge band tile blocks; granting the cap opens it; a crossing is walled too while locked", () => {
    const caps = emptyCaps();
    const bx = band.x0 + 3, by = band.y0 + 3;
    expect(traversalBlocks(OVERWORLD_ID, bx, by, caps)).toBe(true);  // locked
    grantCap(caps, "gorge");
    expect(traversalBlocks(OVERWORLD_ID, bx, by, caps)).toBe(false); // owned → open
    // a crossing tile is BLOCKED while locked (the raft is required) and opens once owned.
    const c = GORGE.crossing[0];
    expect(traversalBlocks(OVERWORLD_ID, c.x, c.y, emptyCaps())).toBe(true);
    expect(traversalBlocks(OVERWORLD_ID, c.x, c.y, grantCap(emptyCaps(), "gorge"))).toBe(false);
  });

  it("serializeCaps/reviveCaps round-trip; reviveCaps tolerates junk", () => {
    const caps = grantCap(emptyCaps(), "gorge");
    expect(serializeCaps(caps)).toEqual(["gorge"]);
    const back = reviveCaps(["gorge", 5, null, ""]);
    expect(hasCap(back, "gorge")).toBe(true);
    expect(back.size).toBe(1);
    expect(reviveCaps(undefined).size).toBe(0);
    expect(reviveCaps("nope" as unknown).size).toBe(0);
  });
});

// ── SILVERWOOD dungeon-entry (live bug 6): the Elder Treant beaten ⇒ the Sunless-Grove mouth opens. ──
// Deterministic + pure: the authored blueprint (what the big-map realizer windows into) must REALIZE the
// mouth cell as "mouth" once the mini is defeated, and the mouth must stay REACHABLE from spawn — so
// stepping onto it triggers descend() rather than a stuck "miniboss" guard (the bug the model migration
// fixes). Mirrors field.onMiniDefeated flipping the authored cell + descend()'s reachability guarantee.
describe("Silverwood dungeon-entry: Elder Treant defeated ⇒ Sunless-Grove mouth opens (live bug 6)", () => {
  const SW = "silverwood";
  const L = ZONES.find((z) => z.id === SW)!.layout;

  it("while the mini stands, the mouth cell realizes as the GUARD; once beaten, as the enterable MOUTH", () => {
    const guarded = buildAuthoredGrid(SW, false);
    const opened = buildAuthoredGrid(SW, true);
    expect(guarded[L.mouth.y][L.mouth.x]).toBe("miniboss"); // Elder Treant guards the mouth
    expect(opened[L.mouth.y][L.mouth.x]).toBe("mouth");     // beaten ⇒ enterable mouth (descend trigger)
  });

  it("the opened mouth is reachable from spawn across the realized Silverwood core (descend reachable, no soft-lock)", () => {
    const grid = buildAuthoredGrid(SW, true);
    const pl = placementOf(SW)!;
    const w = (p: { x: number; y: number }) => ({ x: pl.wx + p.x, y: pl.wy + p.y });
    const targets = [w(L.mouth), ...L.chests.map(w), w(L.lair!)];
    expect(unreachableWorldTargets(SW, grid, w(L.spawn), targets)).toEqual([]);
  });

  it("the Sunless-Grove mouth sits at the SE ravine foot (south + east of the crown spawn)", () => {
    expect(L.mouth.x).toBeGreaterThan(L.spawn.x); // east of the NW crown spawn
    expect(L.mouth.y).toBeGreaterThan(L.spawn.y); // and LOWER (south) — the descent's foot
    expect(L.mouth).toEqual(L.gate);              // mouth == the gate tile (engine invariant)
  });
});
