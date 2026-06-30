// Headless unit tests for the pure systems (no DOM). These replace the old inline node
// "logic harness" — run with `npm test`.

import { describe, it, expect } from "vitest";
import { affinity } from "../src/systems/affinity";
import { gearScore } from "../src/systems/gearScore";
import { makeItem, itemScore, rollDrop, rarityBand } from "../src/systems/loot";
import { combatDamage, makeEnemy, damage, heal } from "../src/systems/combat";
import { applyStatus, findStatus } from "../src/systems/status";
import { makeMember, recalc, grantXp, xpForLevel, skillUnlocked, unlockedSkills } from "../src/systems/progression";
import { seeded } from "../src/core/rng";
import { PARTY_DEFS } from "../src/data/party";
import { SKILLS } from "../src/data/skills";
import { ITEM_NAMES } from "../src/data/items";
import { RARITY } from "../src/data/rarity";
import { WEAPON_MNA_ROLL, ARMOR_MNA_ROLL } from "../src/data/loot";
import { buildDef, ARCHETYPE_KEYS } from "../src/data/party";
import { genSkillKey, hasSpec } from "../src/systems/classKit";
import { defaultPicks } from "../src/systems/choice";
import { specFor } from "../src/data/classSpecs";
import { zeroMna, ARMOR_SLOTS, ATTUNEMENTS } from "../src/types";
import type { Attunement, Enemy, Member } from "../src/types";

// Build a hero on its FULL default V3 kit (lane A at every milestone) at a given own-Attunement MNA —
// the game ships heroes with only the auto-attack until they pick, but these tests need a built kit to
// exercise the MNA gating / reclass / playability invariants. (defaultPicks is a test/sim helper.)
const built = (att: Attunement, cls: string, mna: number, row: "front" | "back" = "front"): Member => {
  const m = makeMember(buildDef("h", "Tester", att, cls, row));
  m.picks = defaultPicks(specFor(att, cls)!);
  m.mnaAlloc[att] = mna;
  recalc([m]);
  return m;
};

describe("affinity ring", () => {
  it("each power beats the next and is weak to the previous", () => {
    expect(affinity("SOL", "NOX")).toBe(1.15); // SOL beats NOX (modest +15%)
    expect(affinity("SOL", "UMBRAXIS")).toBe(0.85); // SOL weak to UMBRAXIS (prev, -15%)
    expect(affinity("SOL", "ANIMA")).toBe(1); // neutral
    expect(affinity("SOL", "SOL")).toBe(1); // same = neutral
    expect(affinity(null, "NOX")).toBe(1); // unknown = neutral
  });
  it("the whole ring is internally consistent", () => {
    const ring = ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"] as const;
    ring.forEach((a, i) => {
      expect(affinity(a, ring[(i + 1) % 5])).toBe(1.15);
      expect(affinity(a, ring[(i + 4) % 5])).toBe(0.85);
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
  it("a boss drop is uncommon-or-better — a notch above its level band, NOT a guaranteed epic", () => {
    const boss = makeEnemy("kingpin", 0, true, 0); // an EARLY boss (Greenvale) must not hand out epics
    const floor = rarityBand(boss.lvl).floor;
    for (let i = 0; i < 80; i++) { // seeded per-iteration: deterministic yet covers many rolls
      const r = rollDrop(boss, undefined, seeded(i)).rIx;
      expect(r).toBeGreaterThanOrEqual(Math.max(1, floor)); // boss bump: never below uncommon
      expect(r).toBeLessThanOrEqual(5);
    }
  });
  it("every armor-family slot makes a valid, defensive piece", () => {
    for (const slot of ARMOR_SLOTS) {
      for (let i = 0; i < 24; i++) { // seeded; covers both branches of the 50/50 attuned-vs-neutral roll
        const it = makeItem(null, slot, 3, null, 10, "NOX", seeded(i));
        expect(it.slot).toBe(slot);
        // armor is attuned IFF it rolled MNA; neutral armor carries no attunement designation (Dara)
        if (it.mna) expect(it.att).toBe("NOX"); else expect(it.att).toBeUndefined();
        // each armor piece contributes at least one of HP / armor / atk / spd
        const total = (it.implicit.hp || 0) + (it.implicit.armor || 0) + (it.implicit.atk || 0) + (it.implicit.spd || 0);
        expect(total).toBeGreaterThan(0);
      }
    }
  });
  it("rarity band climbs with level (STEEP early curve) and is monotonic", () => {
    expect(rarityBand(3)).toEqual({ floor: 0, ceil: 0 });  // L1–4 : commons only
    expect(rarityBand(8)).toEqual({ floor: 0, ceil: 1 });  // L5–9 : common/uncommon — no rares yet
    expect(rarityBand(10)).toEqual({ floor: 0, ceil: 2 }); // L10–14: + a lucky RARE (built-game treat)
    expect(rarityBand(20)).toEqual({ floor: 1, ceil: 3 }); // L15–24: uncommon..epic
    expect(rarityBand(30)).toEqual({ floor: 2, ceil: 4 }); // L25–34: rare..legendary
    expect(rarityBand(35).ceil).toBe(5);                   // L35+ : artifacts appear
    for (let l = 2; l <= 40; l++) {
      expect(rarityBand(l).floor).toBeGreaterThanOrEqual(rarityBand(l - 1).floor);
      expect(rarityBand(l).ceil).toBeGreaterThanOrEqual(rarityBand(l - 1).ceil);
    }
  });
  it("ilvl keeps loot exciting: a high-ilvl rare out-bases a low-ilvl legendary", () => {
    // base magnitude scales with ilvl, so a deep rare beats a shallow legendary on raw base stats
    // (rarity still wins on affix COUNT + MNA — the trade-off that makes every drop worth a look).
    const goodRare = makeItem(null, "weapon", 2, "Staff", 30, "SOL"); // rarity 2, deep ilvl
    const lowLegendary = makeItem(null, "weapon", 4, "Staff", 2, "SOL"); // rarity 4, shallow ilvl
    expect(goodRare.implicit.atk!).toBeGreaterThan(lowLegendary.implicit.atk!);
  });
  it("weapon MNA rolls within its per-rarity range, independent of ilvl (ADR 0015)", () => {
    // Weapon MNA is owned by RARITY, not ilvl: every roll lands in WEAPON_MNA_ROLL[rarity], and a
    // shallow piece can roll the same MNA as a deep one of the same rarity. Seeded for determinism.
    for (let r = 0; r < WEAPON_MNA_ROLL.length; r++) {
      const [lo, hi] = WEAPON_MNA_ROLL[r];
      for (let s = 0; s < 50; s++) {
        const lowIlvl = makeItem(null, "weapon", r, "Staff", 1, "SOL", seeded(s));
        const highIlvl = makeItem(null, "weapon", r, "Staff", 40, "SOL", seeded(s));
        expect(lowIlvl.mna!.SOL!).toBeGreaterThanOrEqual(lo);
        expect(lowIlvl.mna!.SOL!).toBeLessThanOrEqual(hi);
        expect(highIlvl.mna!.SOL!).toBe(lowIlvl.mna!.SOL!); // ilvl does not move weapon MNA
      }
    }
  });
  it("non-weapon MNA (armor + trinket), when present, rolls in range and is floored to ≥1 (ADR 0015)", () => {
    // Only ~ARMOR_MNA_CHANCE of these pieces are attuned; when one is, its MNA lands in ARMOR_MNA_ROLL
    // for the rarity, never below 1. Seeded across many draws so some come back attuned.
    for (const slot of ["helmet", "armor", "gloves", "boots", "trinket"] as const) {
      for (let r = 0; r < ARMOR_MNA_ROLL.length; r++) {
        const [, hi] = ARMOR_MNA_ROLL[r];
        for (let s = 0; s < 80; s++) {
          const v = makeItem(null, slot, r, null, 20, "SOL", seeded(s)).mna?.SOL;
          if (v != null) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(hi); }
        }
      }
    }
  });
});

describe("champion packs", () => {
  it("a champion is a tankier, multi-affix elite with richer rewards", () => {
    // makeEnemy takes an injectable rng for the 22% elite roll; feed a constant-high rng so the plain
    // `normal` baseline never rolls Elite (an HP affix would inflate its maxhp and flake this test).
    const noElite: () => number = () => 0.99;
    const normal = makeEnemy("gbandit", 0, false, 0, false, noElite);
    const champ = makeEnemy("gbandit", 0, false, 0, true, seeded(4)); // seed whose 3 affix rolls include an HP one (the tanky-leader case)
    expect(champ.champion).toBe(true);
    expect(champ.elite).toBe(true);
    expect(champ.eliteAffixes!.length).toBe(3);
    expect(champ.maxhp).toBeGreaterThan(normal.maxhp * 1.5); // ~2x base HP (a tanky leader)
    expect(champ.xpReward).toBeGreaterThan(normal.xpReward);
    expect(champ.name).toBe(normal.name); // base name preserved; the "Champion" marker is a render concern
  });
});

describe("ultra-rare treasure monsters", () => {
  it("a rare monster is flagged, not a boss/elite, and always drops rare-or-better loot", () => {
    const r = makeEnemy("hogger", 0, false, 0);
    expect(r.rare).toBe(true);
    expect(r.boss).toBe(false);
    expect(r.miniboss).toBe(false);
    expect(r.elite).toBeFalsy(); // rares are their own tier — no random elite roll
    for (let i = 0; i < 50; i++) expect(rollDrop(r, undefined, seeded(i)).rIx).toBeGreaterThanOrEqual(2); // rare-or-better (floorMin 2), seeded = deterministic
  });
});

describe("roster start preserves the chosen attunement", () => {
  it("a foreign-attunement hero keeps its class after the starting weapon is equipped", () => {
    // mirror Game.startRun: build def -> equip a common weapon IN THE HERO'S ATTUNEMENT -> recalc
    const m = makeMember(buildDef("hero0", "Test", "NOX", "Dual Swords", "front"));
    m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att);
    recalc([m]);
    expect(m.att).toBe("NOX"); // NOT silently re-classed to SOL
    expect(m.cls).toBe("Dual Swords");
    expect(m.skills).toEqual([]); // no picks yet → only the basic Attack/Defend (there is no legacy kit)
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
    expect(r1.mult).toBe(1.15);
  });
  it("damage/heal clamp at bounds and flip alive", () => {
    const e: Enemy = makeEnemy("gbandit", 0, false, 0);
    damage(e, e.hp + 999);
    expect(e.hp).toBe(0);
    expect(e.alive).toBe(false);
    heal(e, 50); // dead units don't heal
    expect(e.hp).toBe(0);
  });
  it("applyStatus stacks Burn (stack-intensity) and keeps the longer duration (ADR 0016)", () => {
    const e = makeEnemy("gbandit", 0, false, 0);
    applyStatus(e.statuses, "burn", { turns: 2 });
    applyStatus(e.statuses, "burn", { turns: 1 });
    const b = findStatus(e.statuses, "burn")!;
    expect(b.stacks).toBe(2); // stack-intensity climbs
    expect(b.turns).toBe(2);  // longer remaining duration kept
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
  it("V3 abilities are gated by MNA threshold in their tree (the choice-system milestones)", () => {
    const fire = SKILLS[genSkillKey("Firebolt")]; // Heliomancer (SOL Staff) special @ MNA 5
    const ray = SKILLS[genSkillKey("Death Ray")]; // its ultimate @ MNA 100
    const m = built("SOL", "Staff", 0); // full picks, but SOL MNA 0
    expect(skillUnlocked(m, fire)).toBe(false); // 0 < 5
    expect(m.skills).toEqual([]); // nothing reached → empty active kit
    m.mnaAlloc.SOL = 10; recalc([m]);
    expect(skillUnlocked(m, fire)).toBe(true); // 10 ≥ 5
    expect(m.skills).toContain(genSkillKey("Firebolt")); // now in the active kit
    expect(skillUnlocked(m, ray)).toBe(false); // ult still gated at 100
  });
  it("a high-MNA weapon instantly opens a cluster of abilities", () => {
    const m = built("SOL", "Staff", 0); // picks set, MNA 0 → empty active kit
    const before = unlockedSkills(m).length;
    expect(before).toBe(0);
    m.equip.weapon = makeItem(m.cls, "weapon", 5, m.cls, 12, "SOL"); // artifact, high ilvl → big MNA
    recalc([m]);
    expect(m.mna.SOL).toBeGreaterThan(10); // gear MNA is toned down, but still opens abilities
    expect(unlockedSkills(m).length).toBeGreaterThan(before);
  });
  it("Archon (100 MNA) is required for the ultimate", () => {
    const m = built("SOL", "Staff", 100);
    const ult = m.skills.map((k) => SKILLS[k]).find((s) => s.ult)!;
    expect(ult.mnaReq).toBe(100);
    expect(skillUnlocked(m, ult)).toBe(true);
    m.mnaAlloc.SOL = 99; recalc([m]);
    // at 99 MNA the @100 ultimate pick is dormant → it isn't in the active kit at all
    expect(m.skills.map((k) => SKILLS[k]).some((s) => s.ult)).toBe(false);
  });
  it("leveling grants spendable MNA points; recalc folds allocation into totals", () => {
    const party = [makeMember(PARTY_DEFS[0])];
    recalc(party);
    const m = party[0];
    expect(m.mnaPoints).toBe(0);
    grantXp(party, xpForLevel(1) * 4, () => 0); // a few levels; rng()=0 forces the 50/50 MNA win each level
    expect(m.mnaPoints).toBeGreaterThan(0);
    const pts = m.mnaPoints;
    m.mnaAlloc.SOL += pts; m.mnaPoints = 0; // allocate all into SOL (what UI.allocMna does)
    recalc(party);
    expect(m.mna.SOL).toBe(pts); // no gear -> total equals allocation
  });
  it("equipping a foreign-attunement weapon reclasses the hero (class = weapon)", () => {
    const m = built("SOL", "Dual Swords", 10); // innate SOL Dual Swords, full SOL kit
    expect(m.att).toBe("SOL");
    expect(m.skills.length).toBeGreaterThan(0);
    m.equip.weapon = makeItem(m.cls, "weapon", 3, "Dual Swords", 10, "NOX"); // a NOX blade
    m.picks = defaultPicks(specFor("NOX", "Dual Swords")!); // a player re-picks for the new class (Rimewalker)
    recalc([m]);
    expect(m.att).toBe("NOX"); // reclassed
    expect(m.mna.NOX).toBeGreaterThan(0); // gear MNA flows to NOX
    expect(m.skills.length).toBeGreaterThan(0); // a usable NOX kit
    expect(m.skills.every((k) => SKILLS[k]?.att === "NOX")).toBe(true); // every active ability is NOX
  });
  it("any attunement is playable: every archetype is a real class (52-slot spec) with a usable kit", () => {
    for (const att of ATTUNEMENTS)
      for (const arch of ARCHETYPE_KEYS) {
        expect(hasSpec(att, arch)).toBe(true); // all 45 classes are re-encoded
        const m = built(att, arch, 100); // full picks at a maxed well
        expect(m.skills.length).toBeGreaterThan(0); // a non-empty active kit
        m.skills.forEach((k) => { expect(SKILLS[k]).toBeTruthy(); expect(SKILLS[k].att).toBe(att); });
      }
  });
  it("buildDef makes a playable hero of a chosen attunement × archetype", () => {
    const m = built("QUANTA", "Rifle", 10, "back");
    expect(m.att).toBe("QUANTA");
    expect(m.row).toBe("back");
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

describe("gear score", () => {
  it("scores a member's three composites from the locked formulas", () => {
    // offense = 40 + 10 + 20*1.5 + 25*0.4 + 5*0.6 = 93 ; defense = 200*0.12 + 8*5 + 30*0.08 = 66.4→66
    const m = { atk: 40, mag: 10, critPct: 20, spd: 25, leech: 5, maxhp: 200, armor: 8, maxmp: 30 };
    const s = gearScore(m);
    expect(s.offense).toBe(93);
    expect(s.defense).toBe(66);
    expect(s.overall).toBe(159);
  });
  it("a higher-ATK item raises Offense and Overall", () => {
    const base = { atk: 30, mag: 0, critPct: 0, spd: 10, leech: 0, maxhp: 100, armor: 5, maxmp: 10 };
    const lo = gearScore(base);
    const hi = gearScore({ ...base, atk: 45 }); // +15 ATK
    expect(hi.offense).toBeGreaterThan(lo.offense);
    expect(hi.overall).toBeGreaterThan(lo.overall);
    expect(hi.defense).toBe(lo.defense); // unchanged
  });
});
