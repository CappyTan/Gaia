// Content OVERRIDES — the in-app editor's mechanism. The TS data files stay the source of truth;
// this lets a designer (Dara) tweak numeric values live in the Data screen, persist them to
// localStorage (so they survive reload and apply in-game for testing), and export a small JSON
// patch to commit/hand back. Applying = a shallow field-assign onto the live const objects (their
// bindings are const but the objects are mutable). Only whitelisted scalar number fields are
// editable — no structure/keys/functions — so this can't corrupt the content shape.

import type { EnemyDef, Skill } from "../types";
import { ENEMIES } from "./enemies";
import { SKILLS } from "./skills";

/** Editable numeric fields, per entity (the balance knobs — not names/keys/structure). */
export const ENEMY_FIELDS = ["hp", "atk", "spd", "armor", "mag", "xp"] as const;
export const SKILL_FIELDS = ["power", "mp", "mnaReq", "hits"] as const;

export interface Overrides {
  enemies?: Record<string, Partial<Record<(typeof ENEMY_FIELDS)[number], number>>>;
  skills?: Record<string, Partial<Record<(typeof SKILL_FIELDS)[number], number>>>;
}

const KEY = "gaia_overrides_v1";

/** Shallow-assign whitelisted numeric fields onto the live ENEMIES / SKILLS objects. */
export function applyOverrides(o: Overrides): void {
  for (const k in o.enemies || {}) {
    const e = ENEMIES[k]; if (!e) continue;
    for (const f of ENEMY_FIELDS) { const v = o.enemies![k][f]; if (typeof v === "number" && isFinite(v)) (e as unknown as Record<string, number>)[f] = v; }
  }
  for (const k in o.skills || {}) {
    const s = SKILLS[k]; if (!s) continue;
    for (const f of SKILL_FIELDS) { const v = o.skills![k][f]; if (typeof v === "number" && isFinite(v)) (s as unknown as Record<string, number>)[f] = v; }
  }
}

export function loadOverrides(): Overrides {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
}
export function saveOverrides(o: Overrides): void {
  try { localStorage.setItem(KEY, JSON.stringify(o)); } catch { /* ignore */ }
}
export function clearOverrides(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Count of overridden fields (for the editor's status line). */
export function overrideCount(o: Overrides): number {
  let n = 0;
  for (const grp of [o.enemies, o.skills]) for (const k in grp || {}) n += Object.keys(grp![k]).length;
  return n;
}

// ── live editor state (the in-app editor edits this; persists to localStorage) ──
let current: Overrides = loadOverrides();
/** Apply the persisted overrides onto live data — call once at boot (before any battle). */
export function applyCurrent(): void { applyOverrides(current); }
/** The active override patch (what Export downloads). */
export function getOverrides(): Overrides { return current; }
/** Set one field: mutate live data + record + persist. */
export function setOverride(kind: "enemy" | "skill", key: string, field: string, val: number): void {
  const grp = kind === "enemy" ? (current.enemies ||= {}) : (current.skills ||= {});
  ((grp[key] ||= {}) as Record<string, number>)[field] = val;
  applyOverrides(kind === "enemy" ? { enemies: { [key]: { [field]: val } } } : { skills: { [key]: { [field]: val } } });
  saveOverrides(current);
}

export type { EnemyDef, Skill };
