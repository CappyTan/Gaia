// Wayfinding progress — the PURE state behind the "where to go next" guidance (ADR 0011).
//
// Gaia guides the player environmentally (landmarks, soft-gates, NPC directions, signposts, the
// zoomed-out overview map), NOT with a HUD quest marker. This module owns the two pieces of run
// state that drive that guidance, plus the pure derivation of the current Objective. It is PURE
// (ADR 0005): no DOM, no controller import. It mirrors the proven `systems/traversal` shape — plain
// Sets in run state, serialize→array / revive←array for the ADR 0007 save envelope, tolerant of junk.
//
// VOCABULARY (CONTEXT.md): a **Known region** is one the player has either ENTERED or been TOLD of
// (an NPC naming a destination). `entered` ⊂ `known` — you can know a region from a rumor before
// setting foot in it. The overview map reveals KNOWN regions (backlog stays fogged); the current
// **Objective** is *derived* (never authored) from these sets + the run's gate-clear flags.
//
// AUTHORED QUESTS ARE RESERVED, NOT BUILT. `Objective`/`currentObjective` are named source-agnostically
// so a future authored `Quest` layer can SUPPLY an Objective without a rename (see CONTEXT.md / ADR 0011).
// Do not add a quest engine here without extending that ADR.

import { ZONES } from "../data/zones";

/** A run's wayfinding progress: which regions are known vs actually entered (entered ⊂ known). */
export interface Progress {
  /** Regions the player KNOWS of — entered OR named by an NPC. Gates the overview-map reveal. */
  known: Set<string>;
  /** Regions the player has actually VISITED. A subset of `known`. */
  entered: Set<string>;
}

/** A fresh run: nothing known, nothing entered. */
export function emptyProgress(): Progress {
  return { known: new Set<string>(), entered: new Set<string>() };
}

/** Is this region known (shows on the overview map)? */
export function isRegionKnown(p: Progress, zoneId: string): boolean {
  return p.known.has(zoneId);
}

/** Has the player entered this region? */
export function isRegionEntered(p: Progress, zoneId: string): boolean {
  return p.entered.has(zoneId);
}

/** Mark a region KNOWN (an NPC named it, or it became a current objective). Idempotent. */
export function markRegionKnown(p: Progress, zoneId: string): Progress {
  p.known.add(zoneId);
  return p;
}

/** Mark a region ENTERED (the player crossed into it). Also marks it known (entered ⊂ known). */
export function markRegionEntered(p: Progress, zoneId: string): Progress {
  p.entered.add(zoneId);
  p.known.add(zoneId);
  return p;
}

// ── The current Objective — DERIVED, never authored (ADR 0011) ────────────────────────────────────

/** What kind of "next step" the derived Objective is. */
export type ObjectiveKind = "clear-gate" | "travel" | "explore";

/** The player's current "where to go next" — a derived goal, surfaced diegetically (not a HUD pin). */
export interface Objective {
  kind: ObjectiveKind;
  /** The zone this objective concerns (the current zone for a gate, the destination for travel). */
  zoneId: string;
  /** A short diegetic line (e.g. "Clear the Bandit Warren", "Travel to Silverwood"). */
  label: string;
}

/** The run facts the derivation needs, injected so this module stays pure (no controller import). */
export interface ObjectiveCtx {
  /** The zone the player currently stands in. */
  currentZone: string;
  /** Has the current zone's dungeon-mouth guard been beaten? (the zone's forward gate). */
  gateCleared: (zoneId: string) => boolean;
}

const zoneName = (id: string): string => ZONES.find((z) => z.id === id)?.name ?? id;
const dungeonName = (id: string): string => ZONES.find((z) => z.id === id)?.dungeon.name ?? "the dungeon";

/**
 * Derive the current Objective from run state. Source-agnostic: today this is the ONLY producer, but
 * an authored Quest could later take precedence. Order of resolution:
 *   1. The current zone's forward gate isn't cleared → go clear its dungeon.
 *   2. A region is KNOWN but not yet ENTERED → travel there (the place the world told you about).
 *   3. Otherwise → explore (no specific objective).
 */
export function currentObjective(p: Progress, ctx: ObjectiveCtx): Objective {
  if (!ctx.gateCleared(ctx.currentZone)) {
    return { kind: "clear-gate", zoneId: ctx.currentZone, label: `Clear ${dungeonName(ctx.currentZone)}` };
  }
  for (const id of p.known) {
    if (!p.entered.has(id)) return { kind: "travel", zoneId: id, label: `Travel to ${zoneName(id)}` };
  }
  return { kind: "explore", zoneId: ctx.currentZone, label: `Explore ${zoneName(ctx.currentZone)}` };
}

// ── Save envelope bridge (ADR 0007) — Sets aren't JSON-native; (de)serialize tolerantly ────────────

/** Persisted shape: two string[]s (stable insertion order). */
export interface ProgressSave { known: string[]; entered: string[]; }

/** Progress → a JSON-friendly object. */
export function serializeProgress(p: Progress): ProgressSave {
  return { known: [...p.known], entered: [...p.entered] };
}

/** Rebuild Progress from persisted data; tolerant of anything malformed (never throws). */
export function reviveProgress(v: unknown): Progress {
  const out = emptyProgress();
  const o = (v ?? {}) as Record<string, unknown>;
  const take = (arr: unknown, into: Set<string>) => {
    if (Array.isArray(arr)) for (const k of arr) if (typeof k === "string" && k) into.add(k);
  };
  take(o.known, out.known);
  take(o.entered, out.entered);
  // entered ⊂ known invariant: anything entered is also known (repairs a hand-edited/old save).
  for (const k of out.entered) out.known.add(k);
  return out;
}
