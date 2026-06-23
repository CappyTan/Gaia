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
import { placementOf } from "../data/world";
import { SETTLEMENTS } from "../data/towns";
import { kitFor } from "../data/classes";
import { AFFIXES } from "../data/items";
import { HELD_ITEMS } from "../data/heldItems";
import { RARITY } from "../data/rarity";

// ── envelope ───────────────────────────────────────────────────────────────────────────────
/** Bump ONLY when the serialized run SHAPE changes (then add a migration in `migrate`). */
// v2 (Stage 2C): adds world coords `wx/wy` for the seamless big-map overworld (the position source of
// truth when roaming the continent). v1 saves migrate forward by deriving wx/wy from the zone placement.
export const SAVE_SCHEMA = 2;
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
  revisitTown?: boolean;        // entered a hub via the overworld marker (leaving returns to the overworld)
  hubChain: string[];           // settlement ids
  hubIx: number;
  // field position — by STABLE id, best-effort px/py
  zoneId: string;
  townId: string | null;        // set when saved in a settlement
  px: number;
  py: number;
  // WORLD COORDS (schema v2, Stage 2C) — the seamless big-map overworld position source of truth. Set
  // when saved roaming the continent (big-map on); 0,0 / absent for town/dungeon/discrete saves (the
  // controller falls back to px/py + the zone placement). v1 saves get these derived in migration.
  wx?: number;
  wy?: number;
  bigMap?: boolean;             // saved while roaming the continent big map (resume re-enters it)
  enteredDungeon: boolean;
  // CLEARED POIs (the inhabited world): per-zone keys ("<zoneId>:<x>,<y>") → spent (shrine used / camp
  // raided), so a cleared point-of-interest stays cleared across a reload (no infinite-heal exploit).
  // OPTIONAL — absent on an old save = nothing cleared (back-compatible, no schema bump needed).
  poisCleared?: Record<string, boolean>;
  // OPENED CHESTS (looted treasure): per-context keys ("<zoneId>:ow:<x>,<y>" for overworld/big-map
  // chests, "<zoneId>:d<floor>:<x>,<y>" for dungeon chests) → looted, so a chest opened this run stays
  // opened across a reload (no infinite-loot exploit). OPTIONAL — absent on an old save = nothing
  // opened (back-compatible, no schema bump needed).
  openedChests?: Record<string, boolean>;
  // MULTI-FLOOR DUNGEON (ADR 0008 Stage 3): which floor of the dungeon the player was on (0 = B1), so a
  // save made deep in the Bandit Warren resumes on the right floor. OPTIONAL + degrade-never-throw —
  // absent / out-of-range on an old or single-floor save → floor 0 (back-compatible, no schema bump).
  // Only meaningful when `enteredDungeon`; ignored otherwise.
  dungeonFloor?: number;
  // MULTI-FLOOR: which floors' IN-DUNGEON mini-boss (the gating lieutenant) has been beaten this visit,
  // by floor index ("0".."N" → true). Persisted so a resume past a beaten gate keeps the stairs live
  // (no surprise re-fight / no being stranded past a gate the state thinks is closed). OPTIONAL +
  // degrade-never-throw — absent on an old save = nothing beaten (back-compatible, no schema bump).
  dungeonMiniCleared?: Record<string, boolean>;
  // PER-ZONE OVERWORLD-MOUTH cleared state (Silverwood Overhaul fix): which zones' overworld dungeon-mouth
  // guard (the zone mini-boss) has been beaten, by STABLE zone id ("<zoneId>" → true). The seamless big map
  // hosts SEVERAL new-model zones live at once, so this is per-zone, not the single global `miniBossDefeated`.
  // OPTIONAL + degrade-never-throw — absent on an old save: the legacy global `miniBossDefeated` seeds the
  // zone the save was in (back-compatible: an old save that beat Greenvale gets greenvale in the set).
  mouthCleared?: Record<string, boolean>;
  // OWNED TRAVERSAL CAPABILITIES (Silverwood Overhaul, D2): the macro-traversal unlocks the run owns
  // (e.g. "gorge" — the raft/bridge-kit from the Bandit Warren), as a plain string[]. A barrier band is
  // impassable terrain until its cap is owned. OPTIONAL + degrade-never-throw — absent on an old save =
  // nothing owned, EXCEPT a save that already beat Greenvale (the Warren) is auto-granted "gorge" on
  // load (no soft-lock at the gorge for an in-flight run). Back-compatible, no schema bump needed.
  ownedCaps?: string[];
  // HELD ITEMS (quest/key items, party-menu "Items" tab) — the registry ids the run holds, as a plain
  // string[]. OPTIONAL + degrade-never-throw — absent on an old save = none held, EXCEPT the controller
  // re-seeds a key item whose cap the save already owns (a Greenvale-beaten save shows the raft). No bump.
  heldItems?: string[];
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
  revisitTown?: boolean;        // entered a hub via the overworld marker (leaving returns to the overworld)
  hubChain: string[];
  hubIx: number;
  zoneIndex: number;
  townId: string | null;
  px: number;
  py: number;
  wx: number;
  wy: number;
  bigMap: boolean;
  enteredDungeon: boolean;
  poisCleared: Record<string, boolean>;
  openedChests: Record<string, boolean>;
  dungeonFloor: number;
  dungeonMiniCleared: Record<number, boolean>;
  mouthCleared: Record<string, boolean>;
  ownedCaps: string[];
  heldItems: string[];
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
  revisitTown?: boolean;        // entered a hub via the overworld marker (leaving returns to the overworld)
  hubChain: string[];
  hubIx: number;
  zoneIndex: number;
  townId: string | null;     // resolved settlement id (null = open field)
  px: number;
  py: number;
  wx: number;                // world coords (big-map resume); 0 when not roaming the continent
  wy: number;
  bigMap: boolean;           // resume into the seamless continent big map
  enteredDungeon: boolean;
  poisCleared: Record<string, boolean>; // cleared/spent POIs (per-zone keys); empty on an old save
  openedChests: Record<string, boolean>; // looted chests (per-context keys); empty on an old save
  dungeonFloor: number;      // which multi-floor dungeon floor to resume on (0 if not / single-floor)
  dungeonMiniCleared: Record<number, boolean>; // floors whose gating lieutenant was beaten this visit
  mouthCleared: Record<string, boolean>; // zones whose OVERWORLD mouth guard was beaten (per zone id); old saves seed from the global miniBossDefeated
  ownedCaps: string[];       // owned traversal capabilities (e.g. ["gorge"]); old Greenvale-beaten saves auto-get "gorge" (the controller installs these into the run's Set)
  heldItems: string[];       // held quest/key item ids (e.g. ["raft"]); empty on an old save (the controller re-seeds a key item whose cap is already owned)
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
    inTown: s.inTown, startVillage: s.startVillage, revisitTown: s.revisitTown, hubChain: s.hubChain, hubIx: s.hubIx,
    zoneId: ZONES[s.zoneIndex]?.id ?? ZONES[0].id,
    townId: s.townId,
    px: s.px, py: s.py,
    wx: s.wx, wy: s.wy, bigMap: s.bigMap,
    enteredDungeon: s.enteredDungeon,
    poisCleared: { ...s.poisCleared },
    openedChests: { ...s.openedChests },
    dungeonFloor: s.dungeonFloor,
    dungeonMiniCleared: serializeFloorFlags(s.dungeonMiniCleared),
    mouthCleared: { ...s.mouthCleared },
    ownedCaps: [...s.ownedCaps],
    heldItems: [...s.heldItems],
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
  const e = env;
  if (typeof e.saveSchema !== "number") return null;
  if (e.saveSchema > SAVE_SCHEMA) return null;       // future save on an older build — start fresh
  // v1 → v2 (Stage 2C): the run gained world coords for the seamless big-map overworld. DERIVE wx/wy
  // from the saved zone placement + (px,py) so a v1 OVERWORLD save resumes at the right world tile;
  // DEGRADE-NEVER-THROW for town/dungeon saves (no sensible world tile → leave 0,0 + bigMap false, so
  // the controller respawns at the zone spawn). The discrete fields (zoneId/px/py) are untouched.
  if (e.saveSchema < 2) {
    const r = e.run;
    if (r && typeof r === "object") {
      const pl = !r.inTown && !r.enteredDungeon && r.zoneId ? placementOf(r.zoneId) : undefined;
      if (pl && typeof r.px === "number" && typeof r.py === "number") {
        r.wx = pl.wx + r.px; r.wy = pl.wy + r.py;
      } else { r.wx = 0; r.wy = 0; }
      r.bigMap = false; // v1 had no big map; resume on the proven discrete path
    }
    e.saveSchema = 2;
  }
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

/** Sanitize the persisted cleared-POI map: a plain {string→true} dict; anything else → empty (never throws). */
function revivePoisCleared(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) if (val === true && typeof k === "string") out[k] = true;
  return out;
}

/** Sanitize the persisted opened-chest map: a plain {string→true} dict; anything else → empty (never throws). */
function reviveOpenedChests(v: unknown): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) if (val === true && typeof k === "string") out[k] = true;
  return out;
}

/**
 * Sanitize the persisted owned-capability list → a clean string[] (dedup, drop non-strings; never
 * throws). BACK-COMPAT: a save with no `ownedCaps` that has already passed Greenvale (`zoneIndex≥1`, or
 * Greenvale with the boss down) auto-gets "gorge" so an in-flight run isn't stranded at the new barrier.
 * The zone index is the GREENVALE constant 0 (the Bandit Warren is Greenvale's dungeon).
 */
function reviveOwnedCaps(v: unknown, zoneIndex: number, bossDefeated: boolean): string[] {
  const out = new Set<string>();
  if (Array.isArray(v)) for (const k of v) if (typeof k === "string" && k) out.add(k);
  const beatGreenvale = zoneIndex >= 1 || (zoneIndex === 0 && bossDefeated);
  if (!out.has("gorge") && v === undefined && beatGreenvale) out.add("gorge"); // legacy save, no field → grant
  return [...out];
}

/**
 * Sanitize the persisted per-zone mouth-cleared map → a clean {zoneId→true} dict (drop junk; never
 * throws). BACK-COMPAT (no soft-lock): a save with NO `mouthCleared` field that has the legacy global
 * `miniBossDefeated` set seeds the zone the save was IN (`zoneIndex` → id) — so an old save that beat
 * Greenvale's mouth guard resumes with greenvale in the cleared set (its mouth stays open). A save that
 * also advanced past that zone (zoneIndex>0) likewise seeds its current zone; the earlier zone's mouth is
 * cosmetic on resume (you've moved on). Legacy combined-grid zones map onto the same per-zone state.
 */
function reviveMouthCleared(v: unknown, miniBossDefeated: boolean, zoneIndex: number): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  if (v && typeof v === "object") {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) if (val === true && typeof k === "string" && k) out[k] = true;
    return out;
  }
  // legacy save (no field): seed the current zone from the global flag so its mouth stays open on resume.
  if (miniBossDefeated) { const id = ZONES[zoneIndex]?.id; if (id) out[id] = true; }
  return out;
}

/** Sanitize the persisted held-item ids → a clean string[] of KNOWN registry ids (drop junk + any id no
 *  longer in HELD_ITEMS so a removed item doesn't linger; dedup; never throws). */
function reviveHeldItems(v: unknown): string[] {
  const out = new Set<string>();
  if (Array.isArray(v)) for (const k of v) if (typeof k === "string" && HELD_ITEMS[k]) out.add(k);
  return [...out];
}

/** Flatten a numeric floor→beaten map to a string-keyed dict for JSON (a Record<number> isn't JSON-native). */
function serializeFloorFlags(v: Record<number, boolean>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [k, val] of Object.entries(v || {})) if (val) out[k] = true;
  return out;
}
/** Rebuild the floor→beaten map: parse the string keys back to non-negative ints; drop junk (never throws). */
function reviveFloorFlags(v: unknown): Record<number, boolean> {
  const out: Record<number, boolean> = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const n = Number(k);
    if (val === true && Number.isInteger(n) && n >= 0) out[n] = true;
  }
  return out;
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

  // WORLD COORDS (v2). Resume the big-map overworld at the saved world tile; if the zone changed out
  // from under us, drop bigMap so the controller respawns at the (discrete or big-map) zone spawn.
  const bigMap = !resetPos && !inTown && !!r.bigMap;
  const wx = bigMap ? Math.max(0, Math.floor(r.wx || 0)) : 0;
  const wy = bigMap ? Math.max(0, Math.floor(r.wy || 0)) : 0;

  return {
    gold: Math.max(0, Math.floor(r.gold || 0)),
    steps: Math.max(0, Math.floor(r.steps || 0)),
    encountersWon: Math.max(0, Math.floor(r.encountersWon || 0)),
    bossDefeated: !!r.bossDefeated,
    miniBossDefeated: !!r.miniBossDefeated,
    party, inventory,
    defs: Array.isArray(r.defs) ? r.defs : null,
    inTown, startVillage: !!r.startVillage, revisitTown: !!r.revisitTown,
    hubChain, hubIx,
    zoneIndex, townId,
    px, py,
    wx, wy, bigMap,
    enteredDungeon: resetPos ? false : !!r.enteredDungeon,
    // CLEARED POIs — keep only sane boolean-true entries (degrade-never-throw on a malformed field).
    poisCleared: revivePoisCleared(r.poisCleared),
    // OPENED CHESTS — keep only sane boolean-true entries (degrade-never-throw on a malformed field).
    openedChests: reviveOpenedChests(r.openedChests),
    // MULTI-FLOOR — the saved dungeon floor (clamped ≥0; clamped to the zone's floor count by the
    // controller on resume). Reset to 0 if the zone changed under us. Degrade-never-throw.
    dungeonFloor: resetPos ? 0 : Math.max(0, Math.floor(r.dungeonFloor || 0)),
    dungeonMiniCleared: resetPos ? {} : reviveFloorFlags(r.dungeonMiniCleared),
    // PER-ZONE MOUTH-CLEARED — sanitized {zoneId→true}. BACK-COMPAT (no soft-lock): an old save with no
    // field but the legacy global `miniBossDefeated` set seeds its current zone (so a Greenvale-beaten save
    // keeps greenvale's mouth open on resume). Empty if the zone changed out from under us (resetPos).
    mouthCleared: resetPos ? {} : reviveMouthCleared(r.mouthCleared, !!r.miniBossDefeated, zoneIndex),
    // OWNED TRAVERSAL CAPS — sanitized string[]. BACK-COMPAT (no soft-lock): a save that already PASSED
    // Greenvale (any later zone, OR Greenvale itself with its boss down) predates the gorge gate, so
    // auto-grant "gorge" — otherwise an in-flight run could be stranded at a barrier it earned long ago.
    ownedCaps: reviveOwnedCaps(r.ownedCaps, zoneIndex, !!r.bossDefeated),
    // HELD ITEMS — sanitized to known registry ids (drop junk/removed items; never throws). Empty on an
    // old save: the controller re-seeds any key item whose cap is owned, so the raft shows for a
    // Greenvale-beaten save. Reset when the zone changed under us (the run effectively restarts elsewhere).
    // NOTE the deliberate asymmetry with ownedCaps (not reset on resetPos): if a vanished zone strands the
    // held set, continueRun's cap→item re-seed self-heals it on the next load (the raft reappears from the
    // still-owned cap), so the cap — the thing that prevents a soft-lock — is never lost.
    heldItems: resetPos ? [] : reviveHeldItems(r.heldItems),
    notes,
  };
}

/** Convenience: read the slot, migrate, validate and rebuild in one call. null = no usable save. */
export function load(): LoadedRun | null {
  return deserialize(loadRaw());
}

export const Save = { SAVE_SCHEMA, hasSave, loadRaw, clear, serialize, save, deserialize, load };
