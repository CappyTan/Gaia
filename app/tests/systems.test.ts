// Headless unit tests for the pure systems (no DOM). These replace the old inline node
// "logic harness" — run with `npm test`.

import { describe, it, expect } from "vitest";
import { affinity } from "../src/systems/affinity";
import { makeItem, itemScore, rollDrop, rarityBand } from "../src/systems/loot";
import { combatDamage, makeEnemy, damage, heal, applyStatus } from "../src/systems/combat";
import { makeMember, recalc, grantXp, xpForLevel, skillUnlocked, unlockedSkills } from "../src/systems/progression";
import { seeded } from "../src/core/rng";
import { PARTY_DEFS } from "../src/data/party";
import { SKILLS } from "../src/data/skills";
import { ITEM_NAMES } from "../src/data/items";
import { RARITY } from "../src/data/rarity";
import { kitFor, KITS_GENERIC } from "../src/data/classes";
import { buildDef, ARCHETYPE_KEYS } from "../src/data/party";
import { zeroMna, ARMOR_SLOTS } from "../src/types";
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
    const boss = makeEnemy("kingpin", 0, true, 0);
    for (let i = 0; i < 50; i++) expect(rollDrop(boss).rIx).toBeGreaterThanOrEqual(3);
  });
  it("every armor-family slot makes a valid, defensive piece", () => {
    for (const slot of ARMOR_SLOTS) {
      const it = makeItem(null, slot, 3, null, 10, "NOX");
      expect(it.slot).toBe(slot);
      expect(it.att).toBe("NOX"); // armor carries an attunement (flavor/art)
      // each armor piece contributes at least one of HP / armor / atk / spd / mp
      const total = (it.implicit.hp || 0) + (it.implicit.armor || 0) + (it.implicit.atk || 0) + (it.implicit.spd || 0) + (it.implicit.mp || 0);
      expect(total).toBeGreaterThan(0);
    }
  });
  it("rarity band climbs with level (Dara's retune) and is monotonic", () => {
    expect(rarityBand(10)).toEqual({ floor: 1, ceil: 3 }); // L10: uncommon/rare, lucky epic
    expect(rarityBand(20)).toEqual({ floor: 2, ceil: 4 }); // L20: rare/epic, lucky legendary
    expect(rarityBand(30).ceil).toBe(5); // L30: artifacts start appearing
    for (let l = 2; l <= 40; l++) {
      expect(rarityBand(l).floor).toBeGreaterThanOrEqual(rarityBand(l - 1).floor);
      expect(rarityBand(l).ceil).toBeGreaterThanOrEqual(rarityBand(l - 1).ceil);
    }
  });
  it("ilvl keeps loot exciting: a high-ilvl rare out-bases a low-ilvl legendary", () => {
    // base magnitude scales with ilvl, so a deep rare beats a shallow legendary on raw stats +
    // MNA (rarity still wins on affix COUNT — the trade-off that makes every drop worth a look).
    const goodRare = makeItem(null, "weapon", 2, "Staff", 30, "SOL"); // rarity 2, deep ilvl
    const lowLegendary = makeItem(null, "weapon", 4, "Staff", 2, "SOL"); // rarity 4, shallow ilvl
    expect(goodRare.implicit.atk!).toBeGreaterThan(lowLegendary.implicit.atk!);
    expect(goodRare.mna!.SOL!).toBeGreaterThan(lowLegendary.mna!.SOL!);
  });
});

describe("champion packs", () => {
  it("a champion is a tankier, multi-affix elite with richer rewards", () => {
    const normal = makeEnemy("gbandit", 0, false, 0, false);
    const champ = makeEnemy("gbandit", 0, false, 0, true);
    expect(champ.champion).toBe(true);
    expect(champ.elite).toBe(true);
    expect(champ.eliteAffixes!.length).toBe(3);
    expect(champ.maxhp).toBeGreaterThan(normal.maxhp * 1.5); // ~2x base HP (a tanky leader)
    expect(champ.xpReward).toBeGreaterThan(normal.xpReward);
    expect(champ.name).toBe(normal.name); // base name preserved; the "Champion" marker is a render concern
  });
});

describe("ultra-rare treasure monsters", () => {
  it("a rare monster is flagged, not a boss/elite, and always drops epic-or-better loot", () => {
    const r = makeEnemy("hogger", 0, false, 0);
    expect(r.rare).toBe(true);
    expect(r.boss).toBe(false);
    expect(r.miniboss).toBe(false);
    expect(r.elite).toBeFalsy(); // rares are their own tier — no random elite roll
    for (let i = 0; i < 50; i++) expect(rollDrop(r).rIx).toBeGreaterThanOrEqual(3);
  });
});

describe("roster start preserves the chosen attunement", () => {
  it("a foreign-attunement hero keeps its class after the starting weapon is equipped", () => {
    // mirror Game.startRun: build def -> equip a common weapon IN THE HERO'S ATTUNEMENT -> recalc
    const m = makeMember(buildDef("hero0", "Test", "NOX", "Dual Swords", "front"));
    m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att);
    recalc([m]);
    expect(m.att).toBe("NOX"); // NOT silently re-classed to SOL
    expect(m.skills).toEqual(kitFor("NOX", "Dual Swords"));
  });
});

describe("combat math", () => {
  const mkUnit = (over: Partial<Member>): Member => ({ ...makeMember(PARTY_DEFS[1]), ...over });
  it("is deterministic under a seeded rng", () => {
    const a = mkUnit({ atk: 20, att: "SOL" });
    const b = makeEnemy("gbandit", 0, false, 0); // NOX -> SOL is strong
    const r1 = combatDamage(a, b, {}, seeded(42));
    const r2 = combatDamage(a, b, {}, seeded(42));
    expect(r1.dmg).toBe(r2.dmg);
    expect(r1.mult).toBe(1.5);
  });
  it("damage/heal clamp at bounds and flip alive", () => {
    const e: Enemy = makeEnemy("gbandit", 0, false, 0);
    damage(e, e.hp + 999);
    expect(e.hp).toBe(0);
    expect(e.alive).toBe(false);
    heal(e, 50); // dead units don't heal
    expect(e.hp).toBe(0);
  });
  it("applyStatus keeps the longer duration", () => {
    const e = makeEnemy("gbandit", 0, false, 0);
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

describe("MNA gating & scaling", () => {
  it("abilities are gated by MNA threshold in their tree", () => {
    const m = makeMember(PARTY_DEFS[0]); // Auren, SOL
    recalc([m]); // no gear, no alloc -> SOL MNA 0
    expect(skillUnlocked(m, SKILLS.guard)).toBe(true); // req 0
    expect(skillUnlocked(m, SKILLS.shieldBash)).toBe(false); // req 5
    m.mnaAlloc.SOL = 10;
    recalc([m]);
    expect(skillUnlocked(m, SKILLS.shieldBash)).toBe(true);
    expect(skillUnlocked(m, SKILLS.radiantSmite)).toBe(false); // req 40
    expect(skillUnlocked(m, SKILLS.sunbreaker)).toBe(false); // ult, req 100
  });
  it("a high-MNA weapon instantly opens a cluster of abilities", () => {
    const m = makeMember(PARTY_DEFS[0]);
    recalc([m]);
    const before = unlockedSkills(m).length;
    m.equip.weapon = makeItem(m.cls, "weapon", 5, m.cls, 12); // artifact, high ilvl
    recalc([m]);
    expect(m.mna.SOL).toBeGreaterThan(60);
    expect(unlockedSkills(m).length).toBeGreaterThan(before);
  });
  it("Archon (100 MNA) is required for the ultimate", () => {
    const m = makeMember(PARTY_DEFS[1]);
    m.mnaAlloc[m.att] = 100; // allocate into the hero's own tree (party comp is attunement-diverse)
    recalc([m]);
    const ult = m.skills.map((k) => SKILLS[k]).find((s) => s.ult)!;
    expect(ult.mnaReq).toBe(100);
    expect(skillUnlocked(m, ult)).toBe(true);
    m.mnaAlloc[m.att] = 99;
    recalc([m]);
    expect(skillUnlocked(m, ult)).toBe(false);
  });
  it("leveling grants spendable MNA points; recalc folds allocation into totals", () => {
    const party = [makeMember(PARTY_DEFS[0])];
    recalc(party);
    const m = party[0];
    expect(m.mnaPoints).toBe(0);
    grantXp(party, xpForLevel(1) * 4); // a few levels
    expect(m.mnaPoints).toBeGreaterThan(0);
    const pts = m.mnaPoints;
    m.mnaAlloc.SOL += pts; m.mnaPoints = 0; // allocate all into SOL (what UI.allocMna does)
    recalc(party);
    expect(m.mna.SOL).toBe(pts); // no gear -> total equals allocation
  });
  it("equipping a foreign-attunement weapon reclasses the hero (class = weapon)", () => {
    const m = makeMember(buildDef("hero0", "Kael", "SOL", "Dual Swords", "front")); // innate SOL Dual Swords
    recalc([m]);
    expect(m.att).toBe("SOL");
    expect(m.skills).toEqual(kitFor("SOL", "Dual Swords"));
    m.equip.weapon = makeItem(m.cls, "weapon", 3, "Dual Swords", 10, "NOX"); // a NOX blade
    recalc([m]);
    expect(m.att).toBe("NOX"); // reclassed
    expect(m.mna.NOX).toBeGreaterThan(0); // gear MNA flows to NOX
    expect(m.skills).toEqual(kitFor("NOX", "Dual Swords")); // NOX kit (Rimewalker)
    expect(skillUnlocked(m, SKILLS.noxFrostLace)).toBe(true); // low NOX ability usable
  });
  it("any attunement is playable: every archetype resolves to a usable kit", () => {
    for (const att of ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"] as const)
      for (const arch of ARCHETYPE_KEYS) {
        const kit = kitFor(att, arch);
        expect(kit && kit.length).toBeGreaterThan(0);
        kit!.forEach((k) => expect(SKILLS[k]).toBeTruthy()); // every kit key is a real skill
      }
    // every class now has its OWN canon kit, not the shared generic placeholder (the fix for
    // "ANIMA S&S borrowed another class's abilities" / "classes need distinction")
    expect(kitFor("ANIMA", "Staff")).not.toEqual(KITS_GENERIC.ANIMA);
    expect(kitFor("SOL", "Hammer")).not.toEqual(KITS_GENERIC.SOL);
    // all 45 attunement×archetype kits are distinct
    const all = (["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"] as const)
      .flatMap((att) => ARCHETYPE_KEYS.map((arch) => JSON.stringify(kitFor(att, arch))));
    expect(new Set(all).size).toBe(45);
  });
  it("buildDef makes a playable hero of a chosen attunement × archetype", () => {
    const m = makeMember(buildDef("hero0", "Test", "QUANTA", "Rifle", "back"));
    m.mnaAlloc.QUANTA = 10; recalc([m]);
    expect(m.att).toBe("QUANTA");
    expect(m.row).toBe("back");
    expect(m.skills).toEqual(kitFor("QUANTA", "Rifle"));
    expect(unlockedSkills(m).length).toBeGreaterThan(0); // has a usable ability
  });
  it("SOL MNA scales damage output", () => {
    const target = makeEnemy("gbandit", 0, false, 0); // NOX
    const lo: Member = { ...makeMember(PARTY_DEFS[1]), atk: 50, att: "SOL", mna: zeroMna() };
    const hi: Member = { ...lo, mna: { ...zeroMna(), SOL: 200 } };
    const a = combatDamage(lo, target, {}, seeded(7));
    const b = combatDamage(hi, target, {}, seeded(7));
    expect(b.dmg).toBeGreaterThan(a.dmg);
  });
});
