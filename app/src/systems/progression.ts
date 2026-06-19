import type { Member, MemberDef } from "../types";
import { SKILLS } from "../data/skills";

export function makeMember(d: MemberDef): Member {
  return {
    def: d, id: d.id, name: d.name, cls: d.cls, att: d.att, role: d.role, spr: d.spr,
    level: 1, xp: 0,
    base: { ...d.base },
    equip: { weapon: null, armor: null, trinket: null },
    skills: d.skills,
    // live combat fields filled by recalc / battle:
    hp: 0, maxhp: 0, mp: 0, maxmp: 0, atk: 0, spd: 0, armor: 0, mag: 0,
    status: {}, atb: 0, side: "party", alive: true,
    critPct: 0, solPct: 0, leech: 0,
  };
}

// effective stats = base + per-level growth + gear (implicit + affixes)
export function recalc(party: Member[]): void {
  party.forEach((m) => {
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
    const add: Record<string, number> = { atkPct: 0, critPct: 0, spd: 0, hp: 0, solPct: 0, armor: 0, leech: 0, mp: 0 };
    for (const slot of ["weapon", "armor", "trinket"] as const) {
      const it = m.equip[slot];
      if (!it) continue;
      s.atk += it.implicit.atk || 0;
      s.armor += it.implicit.armor || 0;
      s.hp += it.implicit.hp || 0;
      s.mp += it.implicit.mp || 0;
      s.mag += it.implicit.mag || 0;
      for (const a of it.affixes) add[a.stat] = (add[a.stat] || 0) + a.value;
    }
    s.atk = Math.round(s.atk * (1 + add.atkPct / 100));
    s.hp += add.hp;
    s.mp += add.mp;
    s.spd += add.spd;
    s.armor += add.armor;
    m.maxhp = s.hp;
    m.maxmp = s.mp;
    m.atk = s.atk;
    m.spd = Math.max(1, s.spd);
    m.armor = s.armor;
    m.mag = s.mag;
    m.critPct = 5 + (add.critPct || 0);
    m.solPct = add.solPct || 0;
    m.leech = add.leech || 0;
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
  return Math.round(26 * Math.pow(l, 1.65));
}

export interface LevelUp {
  name: string;
  level: number;
  newSkill: string | null;
}

export function grantXp(party: Member[], xp: number): LevelUp[] {
  const leveled: LevelUp[] = [];
  party.forEach((m) => {
    m.xp += xp;
    while (m.xp >= xpForLevel(m.level)) {
      m.xp -= xpForLevel(m.level);
      m.level++;
      let newSkill: string | null = null;
      const justUnlocked = m.skills.map((k) => SKILLS[k]).find((sk) => sk.unlock === m.level);
      if (justUnlocked) newSkill = justUnlocked.name;
      leveled.push({ name: m.name, level: m.level, newSkill });
    }
  });
  recalc(party);
  // level-up fully heals (FF-style)
  party.forEach((m) => {
    if (leveled.find((l) => l.name === m.name)) {
      m.hp = m.maxhp;
      m.mp = m.maxmp;
      m.alive = true;
    }
  });
  return leveled;
}
