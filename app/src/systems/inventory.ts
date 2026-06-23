// Held-item inventory — PURE logic (ADR 0005: no DOM, no controller import). The run owns a Set of
// held-item ids (the party-menu "Items" tab); this module is the run-state half over the DATA registry
// in data/heldItems.ts. Its one piece of real logic — `capsFromItems` — derives the traversal
// capabilities the held key items confer (the raft → "gorge"), so "owning the item drives the capability"
// is a pure, tested function the controllers lean on. Consumable counts come later; for now the inventory
// tracks ownership (key items are never consumed, so a Set is enough).

import { HELD_ITEMS } from "../data/heldItems";
import type { Capability } from "../data/world";

/** A run's owned held-item ids — a plain Set so membership stays O(1). */
export type OwnedItems = Set<string>;

/** A fresh, empty inventory (a new run holds nothing). */
export function emptyItems(): OwnedItems { return new Set<string>(); }

/** Does the run hold this item? */
export function hasItem(items: OwnedItems, id: string): boolean { return items.has(id); }

/** Add an item to the inventory (idempotent — a key item is held once). Returns the set for chaining. */
export function grantItem(items: OwnedItems, id: string): OwnedItems { items.add(id); return items; }

/**
 * Every traversal capability conferred by the currently-held key items. This is the item→cap link:
 * acquiring the raft (or restoring a save that holds it) yields ["gorge"], which the field controller
 * grants into its owned-caps set. Unknown ids and items without a `grantsCap` contribute nothing.
 */
export function capsFromItems(items: OwnedItems): Capability[] {
  const out: Capability[] = [];
  for (const id of items) { const cap = HELD_ITEMS[id]?.grantsCap; if (cap) out.push(cap); }
  return out;
}

// ── Save envelope bridge (ADR 0007) ────────────────────────────────────────────────────────────
// Persist as a plain string[] (a Set isn't JSON-native). serialize → array; revive → Set, sanitized:
// drop non-string junk AND any id not in the registry (a removed item shouldn't linger), never throw.

/** The owned items as a JSON-friendly string[] (stable order via the Set's insertion order). */
export function serializeItems(items: OwnedItems): string[] { return [...items]; }

/** Rebuild the inventory from persisted data; tolerant of anything malformed (never throws). */
export function reviveItems(v: unknown): OwnedItems {
  const out = new Set<string>();
  if (Array.isArray(v)) for (const k of v) if (typeof k === "string" && HELD_ITEMS[k]) out.add(k);
  return out;
}
