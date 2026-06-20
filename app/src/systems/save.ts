// Versioned save & resume (ADR 0007). PURE: no DOM, no controller imports — it only turns the
// run state into a plain data envelope and back, validating every content reference against the
// live registry on load so a save made on vX still loads on vY after a deploy (we ship many times
// a day). The controller (game.ts) owns the live run; this module only (de)serializes it.
//
// Cross-version tolerance, by construction:
//  - content is referenced by STABLE ID, never array index: zone by `zone.id`, party by class
//    (Attunement × Archetype) + def, items by affix/class KEYS.
//  - on load every ref is validated against DB/registry; whatever no longer exists is DROPPED or
//    RESET (never throws). Preference: keep the party (levels/gear/gold) even if zone progress or
//    exact field position has to reset.
//  - `saveSchema` (an int) drives migration when the run SHAPE changes; `gameVersion` is kept for
//    diagnostics only — a different game version must still load.

import type { Affix, Attunement, Item, Member, MemberDef, Row, Slot } from "../types";
import { ATTUNEMENTS, EQUIP_SLOTS, zeroMna } from "../types";
import { makeMember, recalc } from "./progression";
import { ZONES } from "../data/zones";
import { SETTLEMENTS } from "../data/towns";
import { kitFor } from "../data/classes";
import { AFFIXES } from "../data/items";
import { RARITY } from "../data/rarity";

// ── envelope ───────────────────────────────────────────────────────────────────────────────
/** Bump ONLY when the serialized run SHAPE changes (then add a migration in `migrate`). */
export const SAVE_SCHEMA = 1;
const STORAGE_KEY = "gaia.save.v1";

/** A persisted item — plain data; affix labels (functions) are rebuilt from the affix pool on load. */
export interface SavedItem {
  slot: Slot;
  cls: string;
  att?: Attunement;
  rarity: string;
  rIx: number;
  ilvl: number;
  name: string;
  implicit: Item["implicit"];
  mna?: Item["mna"];
  affixes: { key: string; stat: string; value: number }[];
}

/** A persisted party member: identity + class + the run-mutable progression/equipment. */
export interface SavedMember {
  def: MemberDef;        // the hero's definition (identity, class, base/growth, innate skills)
  level: number;
  xp: number;
  row: Row;
  hp: number;
  mp: number;
  alive: boolean;
  mnaAlloc: Record<Attunement, number>;
  mnaPoints: number;
  equip: Partial<Record<Slot, SavedItem | null>>;
}

export interface SavedRun {
  // run flags / economy
  gold: number;
  steps: number;
  encountersWon: number;
  bossDefeated: boolean;
  miniBossDefeated: boolean;
  // roster + bag
  party: SavedMember[];
  inventory: SavedItem[];
  defs: MemberDef[] | null;     // the last-chosen composition (drives "play again")
  // hub / town flow
  inTown: boolean;
  startVillage: boolean;
  hubChain: string[];           // settlement ids
  hubIx: number;
  // field position — by STABLE id, best-effort px/py
  zoneId: string;
  townId: string | null;        // set when saved in a settlement
  px: number;
  py: number;
  enteredDungeon: boolean;
}

export interface SaveEnvelope {
  saveSchema: number;
  gameVersion: string;
  savedAt: number;
  run: SavedRun;
}

/** The shape the controller hands in to serialize / receives back to apply. */
export interface RunSnapshot {
  gold: number;
  steps: number;
  encountersWon: number;
  bossDefeated: boolean;
  miniBossDefeated: boolean;
  party: Member[];
  inventory: Item[];
  defs: MemberDef[] | null;
  inTown: boolean;
  startVillage: boolean;
  hubChain: string[];
  hubIx: number;
  zoneIndex: number;
  townId: string | null;
  px: number;
  py: number;
  enteredDungeon: boolean;
}

/** A rebuilt run, content-validated, ready for the controller to install. */
export interface LoadedRun {
  gold: number;
  steps: number;
  encountersWon: number;
  bossDefeated: boolean;
  miniBossDefeated: boolean;
  party: Member[];
  inventory: Item[];
  defs: MemberDef[] | null;
  inTown: boolean;
  startVillage: boolean;
  hubChain: string[];
  hubIx: number;
  zoneIndex: number;
  townId: string | null;     // resolved settlement id (null = open field)
  px: number;
  py: number;
  enteredDungeon: boolean;
  /** Non-empty when something was dropped/reset on load — surfaced as a "resumed" notice. */
  notes: string[];
}

// ── localStorage guard (static-host + iOS-Safari safe) ───────────────────────────────────────
function storage(): Storage | null {
  try {
    const ls = globalThis.localStorage;
    if (!ls) return null;
    // private-mode Safari can throw on write — probe once.
    const k = "__gaia_probe__";
    ls.setItem(k, "1"); ls.removeItem(k);
    return ls;
  } catch { return null; }
}

export function hasSave(): boolean {
  return loadRaw() != null;
}

/** Read + parse the envelope (no migration/validation). null if absent or unparseable. */
export function loadRaw(): SaveEnvelope | null {
  const ls = storage();
  if (!ls) return null;
  try {
    const txt = ls.getItem(STORAGE_KEY);
    if (!txt) return null;
    const env = JSON.parse(txt) as SaveEnvelope;
    if (!env || typeof env !== "object" || !env.run) return null;
    return env;
  } catch { return null; }
}

export function clear(): void {
  const ls = storage();
  if (!ls) return;
  try { ls.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

// ── serialize ────────────────────────────────────────────────────────────────────────────────
function serializeItem(it: Item): SavedItem {
  return {
    slot: it.slot, cls: it.cls, att: it.att, rarity: it.rarity, rIx: it.rIx, ilvl: it.ilvl,
    name: it.name, implicit: { ...it.implicit }, mna: it.mna ? { ...it.mna } : undefined,
    affixes: it.affixes.map((a) => ({ key: a.key, stat: a.stat, value: a.value })),
  };
}

function serializeMember(m: Member): SavedMember {
  const equip: Partial<Record<Slot, SavedItem | null>> = {};
  for (const slot of EQUIP_SLOTS) { const it = m.equip[slot]; equip[slot] = it ? serializeItem(it) : null; }
  const mnaAlloc = {} as Record<Attunement, number>;
  for (const a of ATTUNEMENTS) mnaAlloc[a] = m.mnaAlloc[a] || 0;
  return {
    def: m.def, level: m.level, xp: m.xp, row: m.row, hp: m.hp, mp: m.mp, alive: m.alive,
    mnaAlloc, mnaPoints: m.mnaPoints, equip,
  };
}

/** Turn the live run into a persistable envelope. */
export function serialize(s: RunSnapshot, gameVersion: string): SaveEnvelope {
  const run: SavedRun = {
    gold: s.gold, steps: s.steps, encountersWon: s.encountersWon,
    bossDefeated: s.bossDefeated, miniBossDefeated: s.miniBossDefeated,
    party: s.party.map(serializeMember),
    inventory: s.inventory.map(serializeItem),
    defs: s.defs,
    inTown: s.inTown, startVillage: s.startVillage, hubChain: s.hubChain, hubIx: s.hubIx,
    zoneId: ZONES[s.zoneIndex]?.id ?? ZONES[0].id,
    townId: s.townId,
    px: s.px, py: s.py, enteredDungeon: s.enteredDungeon,
  };
  return { saveSchema: SAVE_SCHEMA, gameVersion, savedAt: Date.now(), run };
}

/** Write the envelope to the slot. Cheap; called on transitions. Silently no-ops if storage is off. */
export function save(s: RunSnapshot, gameVersion: string): void {
  const ls = storage();
  if (!ls) return;
  try { ls.setItem(STORAGE_KEY, JSON.stringify(serialize(s, gameVersion))); } catch { /* quota/private mode */ }
}

// ── migration ────────────────────────────────────────────────────────────────────────────────
// Bring an older-schema envelope up to the current shape. Each step is `(env) => env`. When a save's
// schema is newer than ours (a downgrade after a rollback) we can't understand it — bail to fresh.
function migrate(env: SaveEnvelope): SaveEnvelope | null {
  let e = env;
  if (typeof e.saveSchema !== "number") return null;
  if (e.saveSchema > SAVE_SCHEMA) return null;       // future save on an older build — start fresh
  // (no past schemas yet; future bumps add: `if (e.saveSchema < N) { ...migrate...; e.saveSchema = N; }`)
  return e;
}

// ── deserialize + validate (degrade, never throw) ────────────────────────────────────────────
const VALID_AFFIX = new Set(AFFIXES.map((a) => a.key));
const AFFIX_LABEL = new Map(AFFIXES.map((a) => [a.key, a.label] as const));
const VALID_RARITY = new Set<string>(RARITY.map((r) => r.key));

/** Rebuild a live Item from saved data; null if its content keys no longer exist (caller drops it). */
function reviveItem(si: SavedItem | null | undefined): Item | null {
  if (!si || typeof si !== "object") return null;
  if (!EQUIP_SLOTS.includes(si.slot as Slot)) return null;
  if (!VALID_RARITY.has(si.rarity)) return null;           // a removed rarity rung → drop
  const affixes: Affix[] = [];
  for (const a of si.affixes || []) {
    if (!a || !VALID_AFFIX.has(a.key)) continue;           // a removed affix key → drop that affix
    affixes.push({ key: a.key, stat: a.stat, value: a.value, label: AFFIX_LABEL.get(a.key)! });
  }
  return {
    slot: si.slot, cls: si.cls ?? "", att: si.att, rarity: si.rarity as Item["rarity"],
    rIx: si.rIx, ilvl: si.ilvl, name: si.name, implicit: { ...(si.implicit || {}) },
    mna: si.mna ? { ...si.mna } : undefined, affixes,
  };
}

/** Rebuild a live Member: makeMember(def) → apply saved progression/equip → recalc restores stats. */
function reviveMember(sm: SavedMember, notes: string[]): Member | null {
  if (!sm || !sm.def || typeof sm.def.att !== "string" || typeof sm.def.cls !== "string") return null;
  if (!ATTUNEMENTS.includes(sm.def.att)) return null;        // a removed attunement → drop the hero
  // The class must still resolve to a kit (Attunement × Archetype); else its abilities are gone.
  if (!kitFor(sm.def.att, sm.def.cls)) { notes.push(`dropped ${sm.def.name}: class no longer exists`); return null; }
  const m = makeMember(sm.def);
  m.level = Math.max(1, Math.floor(sm.level || 1));
  m.xp = Math.max(0, sm.xp || 0);
  m.row = sm.row === "back" ? "back" : "front";
  m.mnaPoints = Math.max(0, sm.mnaPoints || 0);
  for (const a of ATTUNEMENTS) m.mnaAlloc[a] = Math.max(0, sm.mnaAlloc?.[a] || 0);
  for (const slot of EQUIP_SLOTS) {
    const it = reviveItem(sm.equip?.[slot]);
    if (sm.equip?.[slot] && !it) notes.push(`dropped a ${slot} on ${sm.def.name} (content removed)`);
    m.equip[slot] = it;
  }
  // recalc builds maxhp/maxmp/stats from def+level+gear; THEN restore the saved live hp/mp/alive so
  // a mid-run wounded party resumes wounded (clamped to the freshly-computed maxima).
  m._init = true;            // don't let the first-build refill stomp our restored hp/mp
  recalc([m]);
  m.hp = clampN(sm.hp, 0, m.maxhp);
  m.mp = clampN(sm.mp, 0, m.maxmp);
  m.alive = sm.alive === false ? false : m.hp > 0;
  if (m.alive && m.hp <= 0) m.hp = 1;          // alive must have ≥1 hp (guards a bad save)
  if (!m.alive) m.hp = 0;
  return m;
}

function clampN(v: unknown, lo: number, hi: number): number {
  const n = typeof v === "number" && isFinite(v) ? v : hi;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * Parse → migrate → validate → rebuild a run. Returns null if it can't be salvaged (caller starts
 * fresh). Never throws. Drops/resets content that no longer exists, preferring to keep the party.
 */
export function deserialize(env: SaveEnvelope | null): LoadedRun | null {
  if (!env) return null;
  const migrated = migrate(env);
  if (!migrated) return null;
  const r = migrated.run;
  if (!r || typeof r !== "object") return null;
  const notes: string[] = [];

  // PARTY — the player's main investment. Drop only individual members whose class is gone; a run
  // with zero surviving heroes can't continue → start fresh.
  const party: Member[] = [];
  for (const sm of r.party || []) { const m = reviveMember(sm, notes); if (m) party.push(m); }
  if (!party.length) return null;

  // INVENTORY — drop any bag item whose content keys are gone (never crash).
  const inventory: Item[] = [];
  for (const si of r.inventory || []) { const it = reviveItem(si); if (it) inventory.push(it); }

  // ZONE — resolve stable id → index against the LIVE ZONES. If the id is gone (a zone was removed/
  // renamed), fall back to the nearest valid zone and reset zone-progress + position.
  let zoneIndex = ZONES.findIndex((z) => z.id === r.zoneId);
  let resetPos = false;
  if (zoneIndex < 0) {
    zoneIndex = 0;
    resetPos = true;
    notes.push(`zone "${r.zoneId}" no longer exists — restarting in ${ZONES[0].name}`);
  }

  // TOWN — resolve settlement id; if it's gone, drop into the zone's field instead of a town.
  let townId: string | null = null;
  let inTown = !!r.inTown;
  if (inTown) {
    const id = r.townId;
    if (id && SETTLEMENTS[id]) townId = id;
    else { inTown = false; resetPos = true; notes.push("settlement no longer exists — resuming on the field"); }
  }

  // HUB CHAIN — keep only settlement ids that still exist; clamp the index. A broken chain just
  // means the next leave recomputes it (game.ts), so this is best-effort, not load-blocking.
  const hubChain = (r.hubChain || []).filter((id) => SETTLEMENTS[id]);
  const hubIx = Math.max(0, Math.min(r.hubIx || 0, Math.max(0, hubChain.length - 1)));

  // FIELD POSITION — best-effort px/py. If the zone/town changed out from under us, the controller
  // respawns at the zone/town spawn (it also re-checks tile passability), so we just zero here.
  const px = resetPos ? 0 : Math.max(0, Math.floor(r.px || 0));
  const py = resetPos ? 0 : Math.max(0, Math.floor(r.py || 0));

  return {
    gold: Math.max(0, Math.floor(r.gold || 0)),
    steps: Math.max(0, Math.floor(r.steps || 0)),
    encountersWon: Math.max(0, Math.floor(r.encountersWon || 0)),
    bossDefeated: !!r.bossDefeated,
    miniBossDefeated: !!r.miniBossDefeated,
    party, inventory,
    defs: Array.isArray(r.defs) ? r.defs : null,
    inTown, startVillage: !!r.startVillage,
    hubChain, hubIx,
    zoneIndex, townId,
    px, py,
    enteredDungeon: resetPos ? false : !!r.enteredDungeon,
    notes,
  };
}

/** Convenience: read the slot, migrate, validate and rebuild in one call. null = no usable save. */
export function load(): LoadedRun | null {
  return deserialize(loadRaw());
}

export const Save = { SAVE_SCHEMA, hasSave, loadRaw, clear, serialize, save, deserialize, load };
