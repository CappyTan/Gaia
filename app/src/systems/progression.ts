import type { Attunement, Member, MemberDef, Prims, Skill } from "../types";
import { zeroMna, zeroPrims, PRIM_KEYS, EQUIP_SLOTS } from "../types";
import type { Rng } from "../core/rng";
import { SKILLS } from "../data/skills";
import { kitFor } from "../data/classes";
import { abpFromGear } from "./stats";

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
    status: {}, atb: 0, side: "party", alive: true,
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
    m.skills = kitFor(m.att, m.cls) ?? m.def.skills;
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
    const mna = zeroMna();
    (Object.keys(mna) as Attunement[]).forEach((a) => (mna[a] = m.mnaAlloc[a]));
    // V3 primaries — innate (display) derived from this hero's core profile, then GEAR adds on top.
    // Gear primaries are what drive ability scaling (abp); innate is context for the character sheet.
    const innate: Prims = { STR: Math.round(s.atk), AGI: Math.round(s.spd), MGC: Math.round(s.mag), SPD: Math.round(s.spd), DEF: Math.round(s.armor) };
    const gearPrim = zeroPrims();
    for (const slot of EQUIP_SLOTS) {
      const it = m.equip[slot];
      if (!it) continue;
      s.atk += it.implicit.atk || 0;
      s.armor += it.implicit.armor || 0;
      s.hp += it.implicit.hp || 0;
      s.mp += it.implicit.mp || 0;
      s.mag += it.implicit.mag || 0;
      s.spd += it.implicit.spd || 0;
      for (const a of it.affixes) add[a.stat] = (add[a.stat] || 0) + a.value;
      if (it.prim) PRIM_KEYS.forEach((p) => (gearPrim[p] += it.prim![p] || 0));
      if (it.mna) (Object.keys(it.mna) as Attunement[]).forEach((a) => (mna[a] += it.mna![a] || 0));
    }
    s.atk = Math.round(s.atk * (1 + add.atkPct / 100));
    s.hp += add.hp;
    s.mp += add.mp;
    s.spd += add.spd + Math.round(gearPrim.SPD * 0.5); // SPD primary still speeds the attack bar (Dara), gently
    s.armor += add.armor;
    m.mna = mna;
    m.prim = { STR: innate.STR + gearPrim.STR, AGI: innate.AGI + gearPrim.AGI, MGC: innate.MGC + gearPrim.MGC, SPD: innate.SPD + gearPrim.SPD, DEF: innate.DEF + gearPrim.DEF };
    m.abp = abpFromGear(m.att, gearPrim);
    m.maxhp = s.hp;
    m.maxmp = s.mp;
    m.atk = s.atk;
    // QUANTA MNA scales SPD / turn priority (REQUIEM); other trees scale in combat/heal.
    m.spd = Math.max(1, Math.round(s.spd * (1 + mnaBonus(mna.QUANTA))));
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
  return Math.round(26 * Math.pow(l, 1.94)); // steepened 1.65->1.73->1.85->1.92->1.94: real playtest over-leveled (party ~L9 BEFORE the city/boss, ~L12.8 final). A modestly steeper late cost lands the city run-up nearer L8-9 and the finale ~L12 without over-taxing HP into wipe territory
}

export interface LevelUp {
  name: string;
  level: number;
  newSkill: string | null;
  /** MNA points won this level (the 50/50 thrill: 0, or a chunky +2, rarely +3). */
  mnaGain?: number;
  /** Stat bumps gained across the level(s) this member just earned (shown on the Victory card). */
  hp?: number;
  atk?: number;
  arm?: number;
}

/** A level-up's MNA reward (Dara): usually +1, sometimes nothing, and a SUPER-RARE +2 jackpot.
 *  ~5% +2 · ~75% +1 · ~20% nothing → averages ~0.85/level. The whiff/jackpot spread keeps a little
 *  "did I get lucky?" thrill without the old swingy +2/+3. (rng()→0 yields the jackpot, so the
 *  deterministic test still sees a gain.) */
function rollLevelMna(rng: Rng): number {
  const r = rng();
  if (r < 0.05) return 2; // super-rare jackpot
  if (r < 0.80) return 1; // the common case
  return 0;               // unlucky whiff
}

export function grantXp(party: Member[], xp: number, rng: Rng = Math.random): LevelUp[] {
  const leveled: LevelUp[] = [];
  // snapshot what's unlocked + the pre-level stats so we can report newly-opened abilities and stat bumps
  const before = new Map(party.map((m) => [m.id, new Set(unlockedSkills(m))]));
  const statBefore = new Map(party.map((m) => [m.id, { hp: m.maxhp, atk: m.atk, arm: m.armor }]));
  const mnaWon = new Map<string, number>();
  party.forEach((m) => {
    m.xp += xp;
    while (m.xp >= xpForLevel(m.level)) {
      m.xp -= xpForLevel(m.level);
      m.level++;
      const gain = rollLevelMna(rng);
      m.mnaPoints += gain; // earned, spent by the player in the allocator
      mnaWon.set(m.id, (mnaWon.get(m.id) || 0) + gain);
      leveled.push({ name: m.name, level: m.level, newSkill: null });
    }
  });
  recalc(party);
  // attribute newly-unlocked abilities + the MNA/stat gains to the member's last level-up entry
  party.forEach((m) => {
    const entry = [...leveled].reverse().find((l) => l.name === m.name);
    if (!entry) return;
    const prev = before.get(m.id)!;
    const opened = unlockedSkills(m).find((k) => !prev.has(k));
    if (opened) entry.newSkill = SKILLS[opened].name;
    const sb = statBefore.get(m.id)!;
    entry.hp = m.maxhp - sb.hp;
    entry.atk = m.atk - sb.atk;
    entry.arm = m.armor - sb.arm;
    entry.mnaGain = mnaWon.get(m.id) || 0;
    // level-up fully heals (FF-style) — but a FALLEN hero stays dead until revived in town (Dara);
    // never resurrect on level-up.
    if (m.alive) {
      m.hp = m.maxhp;
      m.mp = m.maxmp;
    }
  });
  return leveled;
}
