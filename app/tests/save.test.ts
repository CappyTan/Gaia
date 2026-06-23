// Save & resume (ADR 0007) — round-trip + graceful-degradation. Pure systems test (no DOM).
// Deterministic: builds members/items directly, no unseeded RNG in assertions.

import { describe, it, expect, beforeEach } from "vitest";
import {
  serialize, deserialize, save, load, hasSave, loadRaw, clear, SAVE_SCHEMA,
  type RunSnapshot, type SaveEnvelope,
} from "../src/systems/save";
import { makeMember, recalc } from "../src/systems/progression";
import { makeItem } from "../src/systems/loot";
import { buildDef } from "../src/data/party";
import { ZONES } from "../src/data/zones";
import type { Member, Item } from "../src/types";

// ── a minimal in-memory localStorage so the storage-guarded API has something to write to ──
class MemStore {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}
beforeEach(() => {
  (globalThis as any).localStorage = new MemStore();
});

// Build a representative live run: a 2-hero party (one wounded, geared), some gold + bag, mid-zone.
function makeRun(): { party: Member[]; inventory: Item[]; snapshot: RunSnapshot } {
  const a = makeMember(buildDef("h0", "Auren", "SOL", "Sword & Shield", "front"));
  const b = makeMember(buildDef("h1", "Kaela", "NOX", "Dual Swords", "front"));
  a.level = 5; a.xp = 42; a.mnaAlloc.SOL = 8; a.mnaPoints = 2;
  a.equip.weapon = makeItem(a.cls, "weapon", 2, a.cls, 10, "SOL");
  a.equip.armor = makeItem(null, "armor", 3, null, 10, "SOL");
  b.level = 4; b.xp = 10;
  b.equip.weapon = makeItem(b.cls, "weapon", 1, b.cls, 8, "NOX");
  recalc([a, b]);
  a.hp = Math.max(1, Math.floor(a.maxhp * 0.4)); // wounded
  b.alive = false; b.hp = 0;                      // fallen
  const party = [a, b];
  const inventory = [makeItem(null, "trinket", 2, null, 12, "SOL"), makeItem(null, "boots", 1, null, 6, "NOX")];
  const snapshot: RunSnapshot = {
    gold: 1234, steps: 57, encountersWon: 9, bossDefeated: false, miniBossDefeated: true,
    party, inventory, defs: [a.def, b.def],
    inTown: false, startVillage: false, hubChain: ["hearthford"], hubIx: 0,
    zoneIndex: 1, townId: null, px: 12, py: 7,
    wx: 0, wy: 0, bigMap: false,
    enteredDungeon: true,
    poisCleared: {},
    openedChests: {},
    dungeonFloor: 1,
    dungeonMiniCleared: { 0: true },
    mouthCleared: { greenvale: true },
    ownedCaps: [],
    heldItems: [],
  };
  return { party, inventory, snapshot };
}

describe("save round-trip", () => {
  it("serialize → deserialize yields an equivalent run", () => {
    const { party, inventory, snapshot } = makeRun();
    const env = serialize(snapshot, "v9.9");
    expect(env.saveSchema).toBe(SAVE_SCHEMA);
    expect(env.gameVersion).toBe("v9.9");

    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.notes).toEqual([]);

    // run flags / economy
    expect(r.gold).toBe(1234);
    expect(r.steps).toBe(57);
    expect(r.encountersWon).toBe(9);
    expect(r.miniBossDefeated).toBe(true);
    expect(r.bossDefeated).toBe(false);
    expect(r.zoneIndex).toBe(1);
    expect(r.enteredDungeon).toBe(true);
    expect(r.px).toBe(12); expect(r.py).toBe(7);
    // MULTI-FLOOR dungeon state round-trips (the floor index + which gates were beaten this visit).
    expect(r.dungeonFloor).toBe(1);
    expect(r.dungeonMiniCleared).toEqual({ 0: true });

    // party rebuilt: identity, class, level/xp/mna preserved; gear re-equipped; stats recomputed
    expect(r.party.length).toBe(2);
    const a2 = r.party[0], b2 = r.party[1];
    expect(a2.id).toBe("h0"); expect(a2.att).toBe("SOL"); expect(a2.cls).toBe("Sword & Shield");
    expect(a2.level).toBe(5); expect(a2.xp).toBe(42);
    expect(a2.mnaAlloc.SOL).toBe(8); expect(a2.mnaPoints).toBe(2);
    expect(a2.equip.weapon?.name).toBe(party[0].equip.weapon!.name);
    expect(a2.equip.armor?.affixes.length).toBe(party[0].equip.armor!.affixes.length);
    expect(a2.maxhp).toBe(party[0].maxhp); // recalc reproduces the same effective stats
    expect(a2.hp).toBe(party[0].hp);        // wounded hp restored
    expect(a2.alive).toBe(true);

    // fallen member resumes fallen
    expect(b2.id).toBe("h1"); expect(b2.alive).toBe(false); expect(b2.hp).toBe(0);

    // bag survives with affix labels rebuilt (functions are reconstructed, not serialized)
    expect(r.inventory.length).toBe(2);
    expect(typeof r.inventory[0].affixes[0]?.label).toBe("function");

    // saved defs carried for "play again"
    expect(r.defs?.length).toBe(2);
  });

  it("persists through localStorage (save → load)", () => {
    const { snapshot } = makeRun();
    expect(hasSave()).toBe(false);
    save(snapshot, "v1.0");
    expect(hasSave()).toBe(true);
    const r = load()!;
    expect(r.gold).toBe(1234);
    expect(r.party.length).toBe(2);
    clear();
    expect(hasSave()).toBe(false);
    expect(load()).toBeNull();
  });

  it("persists cleared-POI state (spent shrine / raided camp stays cleared)", () => {
    const { snapshot } = makeRun();
    snapshot.poisCleared = { "greenvale:18,4": true, "greenvale:16,18": true };
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.poisCleared["greenvale:18,4"]).toBe(true);
    expect(r.poisCleared["greenvale:16,18"]).toBe(true);
    expect(r.poisCleared["greenvale:99,99"]).toBeUndefined();
  });

  it("a save with no poisCleared field (old save) loads as nothing-cleared, never throws", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    delete (env.run as any).poisCleared;
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.poisCleared).toEqual({});       // absent field → empty map (back-compatible)
  });

  it("persists opened-chest state (a looted chest stays looted across a reload)", () => {
    const { snapshot } = makeRun();
    snapshot.openedChests = { "greenvale:ow:20,6": true, "greenvale:d1:14,9": true };
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.openedChests["greenvale:ow:20,6"]).toBe(true);   // overworld chest stays opened
    expect(r.openedChests["greenvale:d1:14,9"]).toBe(true);   // dungeon-floor chest stays opened
    expect(r.openedChests["greenvale:ow:99,99"]).toBeUndefined();
  });

  it("a save with no openedChests field (old save) loads as nothing-opened, never throws", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    delete (env.run as any).openedChests;
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.openedChests).toEqual({});      // absent field → empty map (back-compatible, no schema bump)
  });

  it("a junk openedChests map degrades cleanly (drops non-true / non-string keys, never throws)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    (env.run as any).openedChests = { "greenvale:ow:1,1": true, "bad": false, "n": 5, "greenvale:d0:2,2": true };
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    // only the boolean-true entries survive; falsey / non-true values are dropped.
    expect(r.openedChests).toEqual({ "greenvale:ow:1,1": true, "greenvale:d0:2,2": true });
  });

  it("a save with no dungeonFloor/dungeonMiniCleared (old save) loads as floor 0 / nothing-beaten", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    delete (env.run as any).dungeonFloor;
    delete (env.run as any).dungeonMiniCleared;
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.dungeonFloor).toBe(0);          // absent floor → B1 (back-compatible, no schema bump)
    expect(r.dungeonMiniCleared).toEqual({}); // absent gate-state → nothing beaten
  });

  it("a junk dungeonMiniCleared map degrades cleanly (drops non-int / non-true keys, never throws)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    (env.run as any).dungeonMiniCleared = { "-1": true, "x": true, "0": 5, "2": true };
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    // only the valid non-negative-int key mapped to boolean-true survives; junk is dropped.
    expect(r.dungeonMiniCleared).toEqual({ 2: true });
  });

  it("persists owned traversal capabilities (the raft 'gorge' unlock round-trips)", () => {
    const { snapshot } = makeRun();
    snapshot.ownedCaps = ["gorge"];
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.ownedCaps).toContain("gorge");
  });

  it("persists held quest/key items (the raft round-trips in the Items inventory)", () => {
    const { snapshot } = makeRun();
    snapshot.heldItems = ["raft"];
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.heldItems).toEqual(["raft"]);
  });

  it("a save with no heldItems field (old save) loads as nothing-held, never throws", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    delete (env.run as any).heldItems;          // legacy save predating the inventory
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.heldItems).toEqual([]);            // controller re-seeds from owned caps on resume
  });

  it("a junk heldItems value degrades cleanly (drops non-strings + unknown ids, never throws)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    (env.run as any).heldItems = ["raft", 5, null, "", "no-such-item", "raft"]; // dupes + junk + unknown
    const r = deserialize(env)!;
    expect(r.heldItems).toEqual(["raft"]);      // deduped, only known registry ids survive
  });

  it("persists a carried 'regen' reprieve (pendingRegen) across save/resume (ADR 0010)", () => {
    const { snapshot } = makeRun();
    snapshot.party[0].pendingRegen = 5;       // hero picked up a regen reprieve mid-dungeon
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.party[0].pendingRegen).toBe(5);
    expect(r.party[1].pendingRegen).toBeUndefined(); // not carried by heroes who didn't get it
  });

  it("a save with explicit empty ownedCaps stays empty even past Greenvale (no spurious auto-grant)", () => {
    const { snapshot } = makeRun();         // zoneIndex 1, ownedCaps []
    snapshot.ownedCaps = [];
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.ownedCaps).toEqual([]);        // present (not undefined) → no back-compat grant
  });

  it("an OLD save (no ownedCaps field) that beat Greenvale auto-gets 'gorge' (no soft-lock at the new gate)", () => {
    const { snapshot } = makeRun();          // zoneIndex 1 = already past Greenvale
    const env = serialize(snapshot, "v1");
    delete (env.run as any).ownedCaps;       // legacy save predating the gorge
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.ownedCaps).toContain("gorge");  // auto-granted so an in-flight run isn't stranded
  });

  it("an OLD save still IN Greenvale (boss not down) gets NO cap (the gorge stays locked, as intended)", () => {
    const { snapshot } = makeRun();
    snapshot.zoneIndex = 0; snapshot.bossDefeated = false;
    const env = serialize(snapshot, "v1");
    delete (env.run as any).ownedCaps;
    const r = deserialize(env)!;
    expect(r.ownedCaps).toEqual([]);         // hasn't earned the raft yet
  });

  it("a junk ownedCaps value degrades cleanly (drops non-strings, never throws)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    (env.run as any).ownedCaps = ["gorge", 5, null, "", "gorge"]; // dupes + junk
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.ownedCaps).toEqual(["gorge"]);  // deduped, junk dropped
  });

  // ── PER-ZONE mouth-cleared (Silverwood Overhaul fix) ──────────────────────────────────────────
  it("persists PER-ZONE mouth-cleared state (which zones' overworld mouth guard was beaten round-trips)", () => {
    const { snapshot } = makeRun();
    snapshot.mouthCleared = { greenvale: true, silverwood: true };
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.mouthCleared.greenvale).toBe(true);
    expect(r.mouthCleared.silverwood).toBe(true);
    expect(r.mouthCleared.duskmarsh).toBeUndefined(); // only beaten zones present
  });

  it("an OLD save (no mouthCleared field) that beat the mini SEEDS the zone it was in (back-compat, no soft-lock)", () => {
    const { snapshot } = makeRun();          // zoneIndex 1 (silverwood), miniBossDefeated true
    const env = serialize(snapshot, "v1");
    delete (env.run as any).mouthCleared;    // legacy save predating per-zone state
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.mouthCleared).toEqual({ silverwood: true }); // the global flag → the current zone's mouth stays open
  });

  it("an OLD save (no mouthCleared) with the mini NOT beaten seeds NOTHING (the guard still stands)", () => {
    const { snapshot } = makeRun();
    snapshot.miniBossDefeated = false;
    const env = serialize(snapshot, "v1");
    delete (env.run as any).mouthCleared;
    const r = deserialize(env)!;
    expect(r.mouthCleared).toEqual({});      // nothing beaten → no zone seeded
  });

  it("a junk mouthCleared value degrades cleanly (drops non-true / non-string keys, never throws)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    (env.run as any).mouthCleared = { greenvale: true, silverwood: 1, "": true, duskmarsh: false };
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.mouthCleared).toEqual({ greenvale: true }); // only the boolean-true string key survives
  });

  it("re-equipped affix labels render the saved value (no broken label fn)", () => {
    const { snapshot, party } = makeRun();
    const r = deserialize(serialize(snapshot, "v1"))!;
    const af = r.party[0].equip.armor!.affixes[0];
    const orig = party[0].equip.armor!.affixes[0];
    expect(af.label(af.value)).toBe(orig.label(orig.value));
  });
});

describe("graceful degradation (never throws; keeps the party)", () => {
  it("a save in a town that was removed resumes on the field, not stranded", () => {
    const { snapshot } = makeRun();
    snapshot.inTown = true; snapshot.townId = "atlantis_does_not_exist";
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r).toBeTruthy();
    expect(r.inTown).toBe(false);            // dropped the missing town
    expect(r.townId).toBeNull();
    expect(r.notes.length).toBeGreaterThan(0);
    expect(r.party.length).toBe(2);          // party preserved
  });

  it("a save referencing a removed ZONE id resets to zone 0, party intact", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    env.run.zoneId = "the_shadowrealm_that_never_was";
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.zoneIndex).toBe(0);             // fell back to the first zone
    expect(r.px).toBe(0); expect(r.py).toBe(0); // position reset (respawn at zone spawn)
    expect(r.enteredDungeon).toBe(false);
    expect(r.notes.some((n) => /zone/i.test(n))).toBe(true);
    expect(r.party.length).toBe(2);          // levels/gear/gold kept
    expect(r.gold).toBe(1234);
  });

  it("a save with a missing/removed AFFIX key drops that affix but keeps the item", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    // doctor a bag item: inject a bogus affix key alongside the real ones
    const bag = env.run.inventory[0];
    const realCount = bag.affixes.length;
    bag.affixes.push({ key: "this_affix_was_deleted", stat: "atkPct", value: 99 });
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.inventory.length).toBe(2);                    // item kept
    expect(r.inventory[0].affixes.length).toBe(realCount); // bogus affix dropped, reals kept
    expect(r.inventory[0].affixes.every((a) => a.key !== "this_affix_was_deleted")).toBe(true);
  });

  it("a member with an UNKNOWN ARCHETYPE still resumes (kept playable via the generic kit)", () => {
    // ADR 0007 prefers KEEPING the party. An unknown archetype on a valid attunement still
    // resolves to a usable kit (kitFor falls back to the attunement's generic kit), so the hero
    // is preserved — not dropped. (A member is only dropped when nothing resolves; see below.)
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    env.run.party[0].def = { ...env.run.party[0].def, cls: "Plasma Whip (unknown archetype)" };
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.party.length).toBe(2);
    expect(r.party[0].skills.length).toBeGreaterThan(0); // playable fallback kit
  });

  it("a member whose ATTUNEMENT no longer exists is dropped, the rest survive", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    // member 0 gets an invalid attunement (unresolvable); member 1 stays valid
    env.run.party[0].def = { ...env.run.party[0].def, att: "PLASMA" as any };
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect(r.party.length).toBe(1);          // only the resolvable hero remains
    expect(r.party[0].id).toBe("h1");
  });

  it("a save with NO salvageable members returns null (caller starts fresh)", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    env.run.party.forEach((sm) => { sm.def = { ...sm.def, att: "PLASMA" as any }; }); // invalid attunement
    expect(deserialize(env)).toBeNull();
  });

  it("a NEWER saveSchema (downgrade after rollback) is discarded, not loaded", () => {
    const { snapshot } = makeRun();
    const env = serialize(snapshot, "v1");
    env.saveSchema = SAVE_SCHEMA + 5;        // a future-version save we can't understand
    expect(deserialize(env)).toBeNull();
  });

  it("garbage / unparseable input never throws", () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize({} as SaveEnvelope)).toBeNull();
    expect(deserialize({ saveSchema: SAVE_SCHEMA, gameVersion: "v1", savedAt: 0, run: null } as any)).toBeNull();
    expect(deserialize({ saveSchema: "x", gameVersion: "v1", savedAt: 0, run: {} } as any)).toBeNull();
  });

  it("a corrupt localStorage blob is treated as no-save (hasSave=false, load=null)", () => {
    (globalThis.localStorage as Storage).setItem("gaia.save.v1", "{not json");
    expect(hasSave()).toBe(false);
    expect(load()).toBeNull();
    expect(loadRaw()).toBeNull();
  });
});

describe("storage-unavailable (private mode / no localStorage) is safe", () => {
  it("save/load/hasSave no-op without throwing when storage is gone", () => {
    delete (globalThis as any).localStorage;
    const { snapshot } = makeRun();
    expect(() => save(snapshot, "v1")).not.toThrow();
    expect(hasSave()).toBe(false);
    expect(load()).toBeNull();
    expect(() => clear()).not.toThrow();
  });
});

describe("world coords (schema v2, Stage 2C seamless big-map)", () => {
  it("round-trips wx/wy when roaming the continent (bigMap on)", () => {
    const { snapshot } = makeRun();
    snapshot.bigMap = true; snapshot.enteredDungeon = false; snapshot.inTown = false;
    snapshot.wx = 290; snapshot.wy = 70; // a Silverwood-core-ish world tile
    const env = serialize(snapshot, "v9.9");
    expect(env.saveSchema).toBe(2);
    const r = deserialize(env)!;
    expect(r.bigMap).toBe(true);
    expect(r.wx).toBe(290); expect(r.wy).toBe(70);
  });

  it("a discrete (non-big-map) save carries no world position", () => {
    const { snapshot } = makeRun();          // bigMap:false in the builder
    const r = deserialize(serialize(snapshot, "v1"))!;
    expect(r.bigMap).toBe(false);
    expect(r.wx).toBe(0); expect(r.wy).toBe(0);
  });

  it("migrates a v1 OVERWORLD save → v2 by deriving wx/wy from the zone placement + (px,py)", () => {
    const { snapshot } = makeRun();
    snapshot.zoneIndex = 0; snapshot.enteredDungeon = false; snapshot.inTown = false;
    snapshot.px = 12; snapshot.py = 7;
    const env = serialize(snapshot, "v1");
    // forge a legacy v1 envelope: schema 1, strip the v2 fields the migration must synthesize.
    env.saveSchema = 1;
    delete (env.run as any).wx; delete (env.run as any).wy; delete (env.run as any).bigMap;
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    // greenvale placement is (127,62); spawn-relative (12,7) → world (139,69). Migration sets bigMap
    // false (v1 had no big map → resume discrete), but wx/wy are derived for forward-compat.
    expect(r.bigMap).toBe(false);
    // the migration wrote wx/wy onto the envelope run; deserialize zeroes them only because bigMap is
    // false — so we verify the migration math on the raw migrated run instead.
    expect((env.run as any).wx).toBe(127 + 12);
    expect((env.run as any).wy).toBe(62 + 7);
    expect(r.party.length).toBe(2);          // degrade-never-throw: party intact
  });

  it("migrates a v1 DUNGEON/TOWN save without throwing (no world tile → 0,0, respawn at spawn)", () => {
    const { snapshot } = makeRun();
    snapshot.inTown = true; snapshot.townId = "hearthford";
    const env = serialize(snapshot, "v1");
    env.saveSchema = 1;
    delete (env.run as any).wx; delete (env.run as any).wy; delete (env.run as any).bigMap;
    const r = deserialize(env)!;
    expect(r).toBeTruthy();
    expect((env.run as any).wx).toBe(0);     // no sensible world tile in town → degraded
    expect((env.run as any).wy).toBe(0);
    expect(r.party.length).toBe(2);
  });
});

describe("field-position guard (ADR 0007: never strand)", () => {
  it("zone resolves to the live index for every zone id", () => {
    for (let i = 0; i < ZONES.length; i++) {
      const { snapshot } = makeRun();
      snapshot.zoneIndex = i;
      const r = deserialize(serialize(snapshot, "v1"))!;
      expect(r.zoneIndex).toBe(i);
    }
  });
});
