// Pure instance engine for the ADR-0016 status catalog (no DOM). Owns the buff/debuff lifecycle —
// apply / stack / phase-transition / tick / cleanse / buff-strip / resist — over a unit's
// StatusInstance[] list, driven by the data/status catalog. The battle controller owns APPLYING the
// returned damage/heal to units (and resolving Drain's transfer / Doom's detonation from the events);
// this module is the logic, RNG-injectable for deterministic tests.

import type { StatusInstance } from "../types";
import type { Rng } from "../core/rng";
import { STATUS } from "../data/status";

/** Find a live instance of `id` on the list (or undefined). */
export const findStatus = (list: StatusInstance[], id: string): StatusInstance | undefined =>
  list.find((s) => s.defId === id);

export const hasStatus = (list: StatusInstance[], id: string): boolean => list.some((s) => s.defId === id);

/** Remove an instance by id (no-op if absent). */
export function removeStatus(list: StatusInstance[], id: string): void {
  const i = list.findIndex((s) => s.defId === id);
  if (i >= 0) list.splice(i, 1);
}

export interface ApplyOpts { turns?: number; magnitude?: number; source?: string; }

/** Apply (or stack/refresh) a catalog effect onto `list`, per its stacking rule. Phase-transition: when
 *  a `stack-intensity` effect tops out at maxStacks and declares `promotesTo`, it is replaced by the
 *  next-stage effect (Chill→Frozen). Returns the live instance (or null for an unknown id). Mutates list. */
export function applyStatus(list: StatusInstance[], id: string, opts: ApplyOpts = {}): StatusInstance | null {
  const def = STATUS[id];
  if (!def) return null;
  const turns = opts.turns ?? def.turns;
  const magnitude = opts.magnitude ?? def.magnitude ?? 0;
  const cap = def.maxStacks ?? 1;
  const existing = findStatus(list, id);
  if (existing) {
    if (opts.source) existing.source = opts.source;
    switch (def.stacking) {
      case "stack-duration":
        existing.turns += turns;
        break;
      case "stack-intensity":
        existing.stacks = Math.min(cap, existing.stacks + 1);
        existing.turns = Math.max(existing.turns, turns);
        if (def.promotesTo && existing.stacks >= cap) {
          removeStatus(list, id);
          return applyStatus(list, def.promotesTo, opts);
        }
        break;
      default: // refresh + unique: extend to the longer remaining duration
        existing.turns = Math.max(existing.turns, turns);
    }
    return existing;
  }
  const inst: StatusInstance = { defId: id, turns, stacks: 1, magnitude, source: opts.source };
  list.push(inst);
  return inst;
}

/** Cleanse: remove cleansable DEBUFFS. Returns the count removed. */
export function cleanse(list: StatusInstance[]): number {
  const before = list.length;
  for (let i = list.length - 1; i >= 0; i--) {
    const def = STATUS[list[i].defId];
    if (def && def.kind === "debuff" && def.cleansable) list.splice(i, 1);
  }
  return before - list.length;
}

/** Buff-strip: remove dispellable BUFFS (the enemy-buff counterpart to cleanse). Returns count removed. */
export function stripBuffs(list: StatusInstance[]): number {
  const before = list.length;
  for (let i = list.length - 1; i >= 0; i--) {
    const def = STATUS[list[i].defId];
    if (def && def.kind === "buff" && def.dispellable) list.splice(i, 1);
  }
  return before - list.length;
}

/** What a single instance did this tick — the battle controller applies these to the units. `dmg`/`heal`
 *  are to the BEARER; `toSource` is HP transferred to the instance's `source` (Drain); `detonated` marks a
 *  Doom-style delayed hit firing on expiry; `expired` instances are removed from the list by `tickStatus`. */
export interface StatusTick { defId: string; dmg: number; heal: number; toSource: number; detonated: boolean; expired: boolean; }

/** Tick every instance at the bearer's turn: compute DoT damage / HoT heal (magnitude × stacks),
 *  Drain's transfer-to-source, a delayed-hit detonation on expiry, then count down and drop expired
 *  instances. Pure: returns the per-effect amounts; the caller mutates HP. Mutates `list` (durations). */
export function tickStatus(list: StatusInstance[]): StatusTick[] {
  const out: StatusTick[] = [];
  for (let i = list.length - 1; i >= 0; i--) {
    const inst = list[i];
    const def = STATUS[inst.defId];
    if (!def) { list.splice(i, 1); continue; }
    const amt = inst.magnitude * inst.stacks;
    const isDot = def.layer === "status" && def.kind === "debuff" && inst.magnitude > 0;
    const isHot = def.layer === "status" && def.kind === "buff" && inst.magnitude > 0;
    inst.turns -= 1;
    const expired = inst.turns <= 0;
    // A magnitude-0 unique debuff in the status layer (Doom) is a delayed, determined hit: it fires once,
    // on expiry, for a caller-supplied burst (engine resolves the amount).
    const detonated = expired && def.kind === "debuff" && inst.magnitude === 0 && def.stacking === "unique";
    out.push({
      defId: inst.defId,
      dmg: isDot ? amt : 0,
      heal: isHot ? amt : 0,
      toSource: isDot && def.needsSource ? amt : 0,
      detonated,
      expired,
    });
    if (expired) list.splice(i, 1);
  }
  return out;
}

/** Whether a resistible debuff lands: `on-hit` effects always chip; `resistible` ones roll a base
 *  chance shifted by (attacker Accuracy − target Resistance), clamped to a sane window. */
export function resolveApply(id: string, accuracy = 0, resistance = 0, rng: Rng = Math.random): boolean {
  const def = STATUS[id];
  if (!def) return false;
  if (def.apply === "on-hit") return true;
  const chance = Math.max(15, Math.min(95, 70 + accuracy - resistance));
  return rng() * 100 < chance;
}
