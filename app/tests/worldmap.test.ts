// World-map graph tests (ADR 0008, Stage 1 — world-cartographer).
//
// Guards the seamless-overworld FOUNDATION: the world-space placement + 8-way region graph in
// data/zones.ts. A broken world graph (a non-reciprocal edge, a direction that contradicts the two
// regions' coordinates, a dangling `to`, overlapping/gapped neighbors, or a misaligned seam) MUST
// fail here — that's what stops the map from quietly contradicting itself as Aurelion grows.

import { describe, it, expect } from "vitest";
import {
  ZONES, WORLD_REGIONS, OPPOSITE, DIR_DELTA, worldRect, worldRegion,
  type WorldEdge,
} from "../src/data/zones";

const rectOf = (id: string) => {
  const r = worldRect(id);
  expect(r, `worldRect("${id}") should resolve`).toBeTruthy();
  return r!;
};
// Do two rects overlap with positive AREA (touching edges/corners is NOT an overlap)?
const overlaps = (a: ReturnType<typeof rectOf>, b: ReturnType<typeof rectOf>) =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
// The 1-D span where two intervals touch (length 0 = corner/edge touch; <0 = a gap).
const touchLen = (lo1: number, hi1: number, lo2: number, hi2: number) =>
  Math.min(hi1, hi2) - Math.max(lo1, lo2);

describe("world map — placement + region graph (ADR 0008 Stage 1)", () => {
  it("every region id maps to a real zone, and vice-versa for placed zones", () => {
    const zoneIds = new Set(ZONES.map((z) => z.id));
    for (const r of WORLD_REGIONS) expect(zoneIds.has(r.id), `region "${r.id}" must be a real zone`).toBe(true);
    // Every shipping zone is placed in world-space (no orphan zone off the map).
    const placed = new Set(WORLD_REGIONS.map((r) => r.id));
    for (const z of ZONES) expect(placed.has(z.id), `zone "${z.id}" must be placed in WORLD_REGIONS`).toBe(true);
    // No duplicate placements.
    expect(placed.size).toBe(WORLD_REGIONS.length);
  });

  it("no two regions overlap (regions are tiles of one world, not stacked)", () => {
    for (let i = 0; i < WORLD_REGIONS.length; i++)
      for (let j = i + 1; j < WORLD_REGIONS.length; j++) {
        const a = rectOf(WORLD_REGIONS[i].id), b = rectOf(WORLD_REGIONS[j].id);
        expect(overlaps(a, b), `${WORLD_REGIONS[i].id} and ${WORLD_REGIONS[j].id} must not overlap`).toBe(false);
      }
  });

  it("every edge references a real zone and a real placed region", () => {
    const placed = new Set(WORLD_REGIONS.map((r) => r.id));
    for (const r of WORLD_REGIONS)
      for (const e of r.edges) {
        expect(placed.has(e.to), `${r.id} —${e.dir}→ "${e.to}" must reference a placed region`).toBe(true);
        expect(e.to, `${r.id} cannot border itself`).not.toBe(r.id);
      }
  });

  it("every edge's direction AGREES with the two regions' world coordinates", () => {
    // Relationship of b to a on one axis: -1 (b strictly before a), +1 (b strictly after a),
    // 0 (the intervals overlap). Cardinal directions require 0 on the perpendicular axis (the
    // regions overlap there); the active axis must be strictly one side. Diagonals require both
    // axes strictly one side (the regions meet only at a corner).
    const axisRel = (lo1: number, hi1: number, lo2: number, hi2: number) =>
      hi2 <= lo1 ? -1 : lo2 >= hi1 ? 1 : 0;
    for (const r of WORLD_REGIONS)
      for (const e of r.edges) {
        const a = rectOf(r.id), b = rectOf(e.to);
        const { dx, dy } = DIR_DELTA[e.dir];
        expect(axisRel(a.x0, a.x1, b.x0, b.x1), `${r.id} —${e.dir}→ ${e.to}: x-direction must match`).toBe(dx);
        expect(axisRel(a.y0, a.y1, b.y0, b.y1), `${r.id} —${e.dir}→ ${e.to}: y-direction must match`).toBe(dy);
      }
  });

  it("every edge is RECIPROCAL — A —dir→ B implies B —opposite(dir)→ A, same border", () => {
    const find = (id: string, to: string): WorldEdge | undefined =>
      worldRegion(id)?.edges.find((e) => e.to === to);
    for (const r of WORLD_REGIONS)
      for (const e of r.edges) {
        const back = find(e.to, r.id);
        expect(back, `${e.to} must have a return edge to ${r.id}`).toBeTruthy();
        expect(back!.dir, `${e.to} —${back!.dir}→ ${r.id} must be the opposite of ${e.dir}`).toBe(OPPOSITE[e.dir]);
        // The shared border is the same physical segment from both sides.
        expect(back!.border.axis).toBe(e.border.axis);
        expect(back!.border.at).toBe(e.border.at);
        expect(back!.border.from).toBe(e.border.from);
        expect(back!.border.to).toBe(e.border.to);
        // And the recommended seam crossing, if any, must match from both sides.
        expect(back!.cross).toEqual(e.cross);
      }
  });

  it("regions are CONTIGUOUS along each edge — touching neighbors, no gaps; the border lies on the shared seam", () => {
    for (const r of WORLD_REGIONS)
      for (const e of r.edges) {
        const a = rectOf(r.id), b = rectOf(e.to);
        const diagonal = e.dir.length === 2;
        if (e.border.axis === "x") {
          // Vertical seam: the regions must share the world-x line `at`, and it must be an actual
          // edge of BOTH rects (one's right edge == the other's left edge).
          const at = e.border.at;
          const sharedX = (a.x1 === at && b.x0 === at) || (a.x0 === at && b.x1 === at);
          expect(sharedX, `${r.id}/${e.to} must share the vertical seam x=${at}`).toBe(true);
          const tl = touchLen(a.y0, a.y1, b.y0, b.y1);
          if (diagonal) expect(tl, "corner-touch must be a single point (touch length 0)").toBe(0);
          else expect(tl, `${r.id}/${e.to} must touch along y with no gap`).toBeGreaterThan(0);
          // The recorded border span must equal the real y-overlap of the two rects.
          expect(e.border.from).toBe(Math.max(a.y0, b.y0));
          expect(e.border.to).toBe(Math.min(a.y1, b.y1));
        } else {
          const at = e.border.at;
          const sharedY = (a.y1 === at && b.y0 === at) || (a.y0 === at && b.y1 === at);
          expect(sharedY, `${r.id}/${e.to} must share the horizontal seam y=${at}`).toBe(true);
          const tl = touchLen(a.x0, a.x1, b.x0, b.x1);
          if (diagonal) expect(tl, "corner-touch must be a single point (touch length 0)").toBe(0);
          else expect(tl, `${r.id}/${e.to} must touch along x with no gap`).toBeGreaterThan(0);
          expect(e.border.from).toBe(Math.max(a.x0, b.x0));
          expect(e.border.to).toBe(Math.min(a.x1, b.x1));
        }
      }
  });

  it("each seam road-crossing (when present) sits ON the shared border span", () => {
    for (const r of WORLD_REGIONS)
      for (const e of r.edges) {
        if (!e.cross) continue;
        const { axis, at, from, to } = e.border;
        if (axis === "x") {
          expect(e.cross.wx, `crossing must lie on the seam x=${at}`).toBe(at);
          expect(e.cross.wy).toBeGreaterThanOrEqual(from);
          expect(e.cross.wy).toBeLessThanOrEqual(to);
        } else {
          expect(e.cross.wy, `crossing must lie on the seam y=${at}`).toBe(at);
          expect(e.cross.wx).toBeGreaterThanOrEqual(from);
          expect(e.cross.wx).toBeLessThanOrEqual(to);
        }
      }
  });

  it("each region's worldRect width/height equals that region's overworld layout w/h", () => {
    // World-space placement and the engine's grid must agree on a region's size — otherwise the
    // seamless renderer (Chunk B) would draw a region wider/taller than it actually generates.
    for (const r of WORLD_REGIONS) {
      const rect = rectOf(r.id);
      const z = ZONES.find((zz) => zz.id === r.id)!;
      expect(rect.x1 - rect.x0, `${r.id} worldRect width must equal layout.w`).toBe(z.layout.w);
      expect(rect.y1 - rect.y0, `${r.id} worldRect height must equal layout.h`).toBe(z.layout.h);
    }
  });

  it("the placement matches the laid-out Aurelion geography", () => {
    // Greenvale start at origin; Silverwood directly east; Duskmarsh directly south of Silverwood.
    expect(worldRegion("greenvale")!.origin).toEqual({ wx: 0, wy: 0 });
    const gv = rectOf("greenvale"), sw = rectOf("silverwood"), dm = rectOf("duskmarsh");
    expect(sw.x0).toBe(gv.x1);   // Silverwood's west edge == Greenvale's east edge
    expect(dm.y0).toBe(sw.y1);   // Duskmarsh's north edge == Silverwood's south edge
    expect(dm.x0).toBe(gv.x1);   // Greenvale & Duskmarsh meet at the x=64 corner line
  });
});
