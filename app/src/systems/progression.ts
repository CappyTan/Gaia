import type { Attunement, Member, MemberDef, Prims, SubKey, Skill } from "../types";
import { zeroMna, zeroPrims, zeroSubs, PRIM_KEYS, EQUIP_SLOTS } from "../types";
import type { Rng } from "../core/rng";
import { SKILLS } from "../data/skills";
import { activeKitKeys, activePassives, hasSpec } from "./classKit";
import { passiveMods, applyMods } from "./passives";
import { SUB_BY_KEY } from "../data/substats";
import { abpFromGear, substatBaseline } from "./stats";

// Intrinsic MNA gained per level (player-assigned; interim auto-banks into the hero's own
// Attunement until the manual allocator ships — see mna-progression.md).
export const MNA_PER_LEVEL = 1;

/** Output-scaling bonus from an MNA total: up to +60% at 200 MNA (REQUIEM mana mechanic). */
export const mnaBonus = (mna: number): number => 0.6 * Math.max(0, Math.min(1, mna / 200));

/** Is an ability usable? (its Attunement MNA meets the threshold). */
export const skillUnlocked = (m: Member, s: Skill): boolean => m.mna[s.att] >= s.mnaReq;

/** The skill keys a member can currently use, in kit order. */
export const unlockedSkills = (m: Member): string[] => m.skills.filter((k) => SKILLS[k] && skillUnlocked(m, SKILLS[k]));

export function makeMember(d: MemberDef): Member {
  return {
    def: d, id: d.id, name: d.name, cls: d.cls, att: d.att, role: d.role, spr: d.spr,
    row: d.row ?? "front",
    level: 1, xp: 0,
    base: { ...d.base },
    equip: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, trinket: null },
    skills: d.skills,
    mnaAlloc: zeroMna(), mna: zeroMna(), mnaPoints: 0,
    // live combat fields filled by recalc / battle:
    hp: 0, maxhp: 0, mp: 0, maxmp: 0, atk: 0, spd: 0, armor: 0, mag: 0,
    statuses: [], atb: 0, side: "party", alive: true,
    critPct: 0, solPct: 0, leech: 0,
  };
}

// effective stats = base + per-level growth + gear (implicit + affixes); MNA = alloc + gear.
export function recalc(party: Member[]): void {
  party.forEach((m) => {
    // Class = equipped weapon's (Attunement × Archetype); falls back to the hero's innate class.
    const w = m.equip.weapon;
    m.att = w?.att ?? m.def.att;
    m.cls = w?.cls ?? m.def.cls;
    const g = m.def.growth,
      lv = m.level - 1;
    const s = {
      hp: Math.round(m.base.hp + g.hp * lv),
      mp: Math.round(m.base.mp + g.mp * lv),
      atk: Math.round(m.base.atk + g.atk * lv),
      spd: Math.round(m.base.spd + g.spd * lv),
      armor: Math.round(m.base.armor + g.armor * lv),
      mag: Math.round(m.base.mag + g.mag * lv),
    };
    const mna = zeroMna();
    (Object.keys(mna) as Attunement[]).forEach((a) => (mna[a] = m.mnaAlloc[a]));
    // (gear MNA folds into `mna` below; the V3 kit is then resolved from the EFFECTIVE total, after gear.)
    // V3 primaries — innate (display) derived from this hero's core profile, then GEAR adds on top.
    // Gear primaries are what drive ability scaling (abp); innate is context for the character sheet.
    const innate: Prims = { STR: Math.round(s.atk), AGI: Math.round(s.spd), VIT: Math.round(s.mag), SPD: Math.round(s.spd), DEF: Math.round(s.armor) };
    const gearPrim = zeroPrims();
    const sub = zeroSubs(); // the 20 secondary stats, summed from gear affixes (+ dual-source baseline below)
    for (const slot of EQUIP_SLOTS) {
      const it = m.equip[slot];
      if (!it) continue;
      s.atk += it.implicit.atk || 0;
      s.armor += it.implicit.armor || 0;
      s.hp += it.implicit.hp || 0;
      s.mp += it.implicit.mp || 0;
      s.mag += it.implicit.mag || 0;
      s.spd += it.implicit.spd || 0;
      for (const a of it.affixes) if (SUB_BY_KEY[a.stat as SubKey]) sub[a.stat as SubKey] += a.value;
      if (it.prim) PRIM_KEYS.forEach((p) => (gearPrim[p] += it.prim![p] || 0));
      if (it.mna) (Object.keys(it.mna) as Attunement[]).forEach((a) => (mna[a] += it.mna![a] || 0));
    }
    // Dual-source (ADR 0014): GEAR primaries grant a baseline trickle of their own group's substats,
    // on top of rolled affixes. Gear-only (like abp) so an ungeared hero stays combat-neutral.
    substatBaseline(gearPrim, sub);
    // V3 passives (ADR 0020 §5): a hero's ACTIVE passive picks add continuous Subs bonuses (crit / ability
    // power / penetration / mitigation / lifesteal), which flow into the effective stats derived below.
    // A no-op for an un-built hero (no picks → no passives). Resolved from the effective MNA (so a passive
    // goes dormant if MNA drops below its set).
    const picks = m.picks ?? {};
    if (hasSpec(m.att, m.cls))
      applyMods(sub, passiveMods(activePassives(m.att, m.cls, picks, mna[m.att])));
    s.spd += Math.round(gearPrim.SPD * 0.5); // SPD primary still speeds the attack bar (Dara), gently
    m.mna = mna;
    // V3 (ADR 0020): a hero's usable kit IS the choice system — the picked specials/signatures/ultimates
    // whose milestone the EFFECTIVE MNA total has reached (above-threshold picks stay dormant). There is NO
    // legacy fallback: a hero with no picks (or whose picks are all dormant at low MNA, or stale after a
    // rename) wields ONLY the basic Attack/Defend until they pick abilities in their lanes (the class
    // picker). Empty is the intended un-built state; a class with no spec also resolves empty.
    m.skills = (hasSpec(m.att, m.cls) ? activeKitKeys(m.att, m.cls, picks, m.mna[m.att]) : null) ?? [];
    m.prim = { STR: innate.STR + gearPrim.STR, AGI: innate.AGI + gearPrim.AGI, VIT: innate.VIT + gearPrim.VIT, SPD: innate.SPD + gearPrim.SPD, DEF: innate.DEF + gearPrim.DEF };
    m.sub = sub;
    // GEAR primaries (ability scaling) + the Ability Power affix both feed the ability-power amplifier.
    m.abp = abpFromGear(m.att, gearPrim) + sub.Abp / 100;
    m.maxhp = s.hp;
    m.maxmp = s.mp;
    m.atk = s.atk;
    // QUANTA MNA scales SPD / turn priority (REQUIEM); other trees scale in combat/heal.
    m.spd = Math.max(1, Math.round(s.spd * (1 + mnaBonus(mna.QUANTA))));
    m.armor = s.armor;
    m.mag = s.mag;
    m.critPct = 5 + sub.Crt;   // 5% base + the Crit Chance affix
    m.solPct = 0;
    m.leech = sub.Lfs;         // Life Steal affix
    if (!m._init) {
      m.hp = m.maxhp;
      m.mp = m.maxmp;
      m._init = true;
    } // first build only — never refill on recalc
    m.hp = Math.min(m.hp, m.maxhp);
    m.mp = Math.min(m.mp, m.maxmp);
    m.alive = m.hp > 0;
  });
}

export function xpForLevel(l: number): number {
  return Math.round(26 * Math.pow(l, 1.94)); // steepened 1.65->1.73->1.85->1.92->1.94: real playtest over-leveled (party ~L9 BEFORE the city/boss, ~L12.8 final). A modestly steeper late cost lands the city run-up nearer L8-9 and the finale ~L12 without over-taxing HP into wipe territory
}

export interface LevelUp {
  name: string;
  level: number;
  newSkill: string | null;
  /** MNA gained on THIS level — a fixed, deterministic +MNA_PER_LEVEL (no roll, no variance). */
  mnaGain?: number;
  /** Stat bumps gained across the level(s) this member just earned (shown on the Victory card). */
  hp?: number;
  atk?: number;
  arm?: number;
}

// rng kept in the signature for call-site compatibility (and future use); leveling MNA is now DETERMINISTIC.
export function grantXp(party: Member[], xp: number, rng: Rng = Math.random): LevelUp[] {
  void rng;
  const leveled: LevelUp[] = [];
  party.forEach((m) => {
    m.xp += xp;
    let unlocked = new Set(unlockedSkills(m)); // running set so each level reports only what IT opens
    let didLevel = false;
    while (m.xp >= xpForLevel(m.level)) {
      didLevel = true;
      const sb = { hp: m.maxhp, atk: m.atk, arm: m.armor }; // pre-level snapshot for THIS level's deltas
      m.xp -= xpForLevel(m.level);
      m.level++;
      // AUTO-ASSIGNED into the hero's own Attunement, a FIXED +1/level (no variance) — milestones open on a
      // predictable schedule and you just pick; the Mana allocator is an optional redistribution tool.
      m.mnaAlloc[m.att] += MNA_PER_LEVEL;
      recalc([m]); // settle this single level so the deltas below are per-level (never lumped onto the last)
      const opened = unlockedSkills(m).find((k) => !unlocked.has(k));
      unlocked = new Set(unlockedSkills(m));
      leveled.push({
        name: m.name,
        level: m.level,
        newSkill: opened ? SKILLS[opened].name : null,
        mnaGain: MNA_PER_LEVEL,
        hp: m.maxhp - sb.hp,
        atk: m.atk - sb.atk,
        arm: m.armor - sb.arm,
      });
    }
    // level-up fully heals (FF-style) — but a FALLEN hero stays dead until revived in town (Dara);
    // never resurrect on level-up.
    if (didLevel && m.alive) {
      m.hp = m.maxhp;
      m.mp = m.maxmp;
    }
  });
  return leveled;
}
