// Headless unit tests for the pure systems (no DOM). These replace the old inline node
// "logic harness" — run with `npm test`.

import { describe, it, expect } from "vitest";
import { affinity } from "../src/systems/affinity";
import { makeItem, itemScore, rollDrop } from "../src/systems/loot";
import { combatDamage, makeEnemy, damage, heal, applyStatus } from "../src/systems/combat";
import { makeMember, recalc, grantXp, xpForLevel } from "../src/systems/progression";
import { seeded } from "../src/core/rng";
import { PARTY_DEFS } from "../src/data/party";
import { ITEM_NAMES } from "../src/data/items";
import { RARITY } from "../src/data/rarity";
import type { Enemy, Member } from "../src/types";

describe("affinity ring", () => {
  it("each power beats the next and is weak to the previous", () => {
    expect(affinity("SOL", "NOX")).toBe(1.5); // SOL beats NOX
    expect(affinity("SOL", "UMBRAXIS")).toBe(0.5); // SOL weak to UMBRAXIS (prev)
    expect(affinity("SOL", "ANIMA")).toBe(1); // neutral
    expect(affinity("SOL", "SOL")).toBe(1); // same = neutral
    expect(affinity(null, "NOX")).toBe(1); // unknown = neutral
  });
  it("the whole ring is internally consistent", () => {
    const ring = ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"] as const;
    ring.forEach((a, i) => {
      expect(affinity(a, ring[(i + 1) % 5])).toBe(1.5);
      expect(affinity(a, ring[(i + 4) % 5])).toBe(0.5);
    });
  });
});

describe("loot generation", () => {
  it("makes a valid item for every weapon archetype at every rarity", () => {
    for (const cls of Object.keys(ITEM_NAMES)) {
      for (let r = 0; r < RARITY.length; r++) {
        const it = makeItem(cls, "weapon", r, cls);
        expect(it.name).toBe(ITEM_NAMES[cls][r]);
        expect(it.rarity).toBe(RARITY[r].key);
        expect(it.affixes.length).toBe(RARITY[r].affixes);
        expect(it.implicit.atk).toBeGreaterThan(0);
      }
    }
  });
  it("higher rarity scores higher (more affixes + base)", () => {
    const common = makeItem("Staff", "weapon", 0, "Staff");
    const artifact = makeItem("Staff", "weapon", 5, "Staff");
    expect(itemScore(artifact)).toBeGreaterThan(itemScore(common));
  });
  it("boss drops are rare-or-better", () => {
    const boss = makeEnemy("brute", 0, true, 0);
    for (let i = 0; i < 50; i++) expect(rollDrop(boss).rIx).toBeGreaterThanOrEqual(3);
  });
});

describe("combat math", () => {
  const mkUnit = (over: Partial<Member>): Member => ({ ...makeMember(PARTY_DEFS[1]), ...over });
  it("is deterministic under a seeded rng", () => {
    const a = mkUnit({ atk: 20, att: "SOL" });
    const b = makeEnemy("bandit", 0, false, 0); // NOX -> SOL is strong
    const r1 = combatDamage(a, b, {}, seeded(42));
    const r2 = combatDamage(a, b, {}, seeded(42));
    expect(r1.dmg).toBe(r2.dmg);
    expect(r1.mult).toBe(1.5);
  });
  it("damage/heal clamp at bounds and flip alive", () => {
    const e: Enemy = makeEnemy("bandit", 0, false, 0);
    damage(e, e.hp + 999);
    expect(e.hp).toBe(0);
    expect(e.alive).toBe(false);
    heal(e, 50); // dead units don't heal
    expect(e.hp).toBe(0);
  });
  it("applyStatus keeps the longer duration", () => {
    const e = makeEnemy("bandit", 0, false, 0);
    applyStatus(e, { burn: 2 });
    applyStatus(e, { burn: 1 });
    expect(e.status.burn).toBe(2);
  });
});

describe("progression", () => {
  it("recalc folds gear into effective stats and inits HP/MP once", () => {
    const party = PARTY_DEFS.map(makeMember);
    recalc(party);
    const tank = party[0];
    const baseHp = tank.maxhp;
    expect(tank.hp).toBe(baseHp); // first build fills
    tank.equip.armor = makeItem(null, "armor", 3, null);
    recalc(party);
    expect(tank.maxhp).toBeGreaterThan(baseHp); // armor added HP
    expect(tank.hp).toBeLessThanOrEqual(tank.maxhp);
  });
  it("grantXp levels up, unlocks skills, and full-heals the leveled member", () => {
    const party = PARTY_DEFS.map(makeMember);
    recalc(party);
    party.forEach((m) => (m.hp = 1));
    const leveled = grantXp(party, xpForLevel(1) * 5);
    expect(leveled.length).toBeGreaterThan(0);
    party.forEach((m) => { if (leveled.find((l) => l.name === m.name)) expect(m.hp).toBe(m.maxhp); });
  });
});
