// World-space helper tests (ADR 0008 Stage 2, step 1 — PURE conversions, no engine consumer yet).
//
// Guards the pure local↔world coordinate maths + ownership the seamless renderer/movement (Chunk B)
// will build on: a region's local tile ↔ its world tile round-trips exactly, `regionAtWorld` answers
// ownership on (and across) seams half-openly (the seam tile belongs to the neighbour that STARTS
// there, never two regions), and a seam blend band stays inside both touching rects.

import { describe, it, expect } from "vitest";
import {
  WORLD_REGIONS, worldRect, regionAtWorld, regionsOverlappingRect, localOf, worldOf, seamBlendBand,
} from "../src/data/zones";

describe("world-space helpers (ADR 0008 Stage 2)", () => {
  it("localOf(worldOf(...)) round-trips for every placed region (and vice-versa)", () => {
    for (const r of WORLD_REGIONS) {
      const rect = worldRect(r.id)!;
      // sample a spread of local tiles across the region
      for (const lx of [0, 1, Math.floor((rect.x1 - rect.x0) / 2), rect.x1 - rect.x0 - 1])
        for (const ly of [0, 1, Math.floor((rect.y1 - rect.y0) / 2), rect.y1 - rect.y0 - 1]) {
          const w = worldOf(r.id, lx, ly)!;
          expect(w).toEqual({ x: lx + rect.x0, y: ly + rect.y0 });
          const back = localOf(r.id, w.x, w.y)!;
          expect(back).toEqual({ x: lx, y: ly });
        }
    }
  });

  it("worldOf/localOf return undefined for an unplaced region", () => {
    expect(worldOf("nowhere", 0, 0)).toBeUndefined();
    expect(localOf("nowhere", 0, 0)).toBeUndefined();
  });

  it("regionAtWorld owns each region's interior and is half-open on the seam", () => {
    // a tile inside each region resolves to that region
    for (const r of WORLD_REGIONS) {
      const rect = worldRect(r.id)!;
      const mid = regionAtWorld(Math.floor((rect.x0 + rect.x1) / 2), Math.floor((rect.y0 + rect.y1) / 2));
      expect(mid).toBe(r.id);
    }
    // the Greenvale↔Silverwood vertical seam is at world-x 64: x=63 is Greenvale, x=64 is Silverwood
    // (the seam tile belongs to the neighbour whose rect STARTS there — never both).
    expect(regionAtWorld(63, 12)).toBe("greenvale");
    expect(regionAtWorld(64, 12)).toBe("silverwood");
    // the Silverwood↔Duskmarsh horizontal seam is at world-y 24: y=23 Silverwood, y=24 Duskmarsh.
    expect(regionAtWorld(80, 23)).toBe("silverwood");
    expect(regionAtWorld(80, 24)).toBe("duskmarsh");
    // outside every region
    expect(regionAtWorld(-1, -1)).toBeUndefined();
    expect(regionAtWorld(1000, 1000)).toBeUndefined();
  });

  it("regionsOverlappingRect spans a seam (both neighbours) but a single-region rect is alone", () => {
    // a viewport straddling x=64 sees both Greenvale and Silverwood
    const both = regionsOverlappingRect(60, 0, 70, 10);
    expect(both).toContain("greenvale");
    expect(both).toContain("silverwood");
    // a viewport entirely inside Greenvale sees only Greenvale
    expect(regionsOverlappingRect(2, 2, 10, 10)).toEqual(["greenvale"]);
    // empty far from any region
    expect(regionsOverlappingRect(500, 500, 510, 510)).toEqual([]);
  });

  it("a seam blend band lies inside BOTH touching rects' perpendicular span; corner-only edges have none", () => {
    for (const r of WORLD_REGIONS) {
      for (const e of r.edges) {
        const band = seamBlendBand(e, 3);
        const corner = e.border.from === e.border.to;
        if (corner) { expect(band).toBeUndefined(); continue; }
        expect(band).toBeTruthy();
        const a = worldRect(r.id)!, b = worldRect(e.to)!;
        if (band!.axis === "x") {
          // the band's perpendicular (y) span must sit within both rects' y-extents
          expect(band!.from).toBeGreaterThanOrEqual(Math.max(a.y0, b.y0));
          expect(band!.to).toBeLessThanOrEqual(Math.min(a.y1, b.y1));
          // the band straddles the seam x: lo<at<hi, and reaches into both regions
          expect(band!.lo).toBeLessThan(e.border.at);
          expect(band!.hi).toBeGreaterThan(e.border.at);
        } else {
          expect(band!.from).toBeGreaterThanOrEqual(Math.max(a.x0, b.x0));
          expect(band!.to).toBeLessThanOrEqual(Math.min(a.x1, b.x1));
          expect(band!.lo).toBeLessThan(e.border.at);
          expect(band!.hi).toBeGreaterThan(e.border.at);
        }
      }
    }
  });
});
