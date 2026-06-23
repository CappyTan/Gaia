// Traversal-gating — the OWNED-CAPABILITY layer for the macro "soft-gate by terrain" overworld lever
// (Silverwood Overhaul, D2). PURE logic (ADR 0005): no DOM, no controller import. It owns the run's set
// of unlocked traversal CAPABILITIES (e.g. "gorge" — the raft/bridge-kit from the Bandit Warren) and
// the cheap predicates the field controller calls before its cell-kind check.
//
// The DATA half lives in data/world.ts (the generic `BARRIERS` table + `barrierBlocks`): a barrier is a
// band of world tiles that realize as an IMPASSABLE terrain kind UNTIL the run owns the named capability,
// after which the band's CROSSING tiles open. This module is the run-state half: hold the owned set, ask
// world.ts whether a tile is blocked given that set, and grant/serialize/restore the set. Generic by
// construction — a later barrier just adds its own row + cap key in world.ts and a grant point; no change
// here beyond (optionally) widening the `Capability` union there.

import { barrierBlocks, type Capability } from "../data/world";

/** A run's owned traversal capabilities — a plain Set so membership stays O(1). */
export type OwnedCaps = Set<string>;

/** A fresh, empty owned-capability set (a new run owns nothing — every barrier starts locked). */
export function emptyCaps(): OwnedCaps { return new Set<string>(); }

/** Does the run own this capability? (the unlock the barrier consults). */
export function hasCap(caps: OwnedCaps, cap: Capability): boolean { return caps.has(cap); }

/** Grant a capability to the run (idempotent). Returns the set for chaining. */
export function grantCap(caps: OwnedCaps, cap: Capability): OwnedCaps { caps.add(cap); return caps; }

/**
 * Does a traversal barrier BLOCK movement onto (wx,wy) on `map` given the run's owned caps? Thin wrapper
 * over the pure data predicate in world.ts — the controller's `bigPassable` calls THIS before its cheap
 * cell-kind check (a handful of point-in-rect tests). Blocked iff a barrier covers the tile, its cap is
 * NOT owned, and the tile isn't a crossing put-in/take-out. Once owned, the whole band is passable.
 */
export function traversalBlocks(map: string, wx: number, wy: number, caps: OwnedCaps): boolean {
  return barrierBlocks(map, wx, wy, caps);
}

// ── Save envelope bridge (ADR 0007) ────────────────────────────────────────────────────────────
// The owned set persists as a plain string[] (a Set isn't JSON-native). serialize → array; restore →
// Set, sanitized (drop non-string junk; never throw — degrade-never-throw, like the rest of save.ts).

/** The owned caps as a JSON-friendly string[] (stable order via the Set's insertion order). */
export function serializeCaps(caps: OwnedCaps): string[] { return [...caps]; }

/** Rebuild the owned set from persisted data; tolerant of anything malformed (never throws). */
export function reviveCaps(v: unknown): OwnedCaps {
  const out = new Set<string>();
  if (Array.isArray(v)) for (const k of v) if (typeof k === "string" && k) out.add(k);
  return out;
}
