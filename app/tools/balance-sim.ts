// Headless full-run combat simulator for tuning difficulty. Imports the SHIPPING systems
// directly (combatDamage / makeEnemy / loot / progression) — no DOM, no regex extraction.
//   npm run sim            # 60 runs (default)
//   npx tsx app/tools/balance-sim.ts 200
//
// Tune by editing data/enemies.ts (or zones.ts) then re-running. Targets:
//   - avg end-of-fight party HP ~55-75% (fights cost real HP, net of heals)
//   - boss / mini-boss end HP lower (~30-50%) — genuine threats
//   - wipe rate low (<~10%) under decent play, but non-zero room for bad play

import type { Enemy, Item, Member, Skill } from "../src/types";
import { ri, pick, clamp } from "../src/core/rng";
import { PARTY_DEFS } from "../src/data/party";
import { SKILLS } from "../src/data/skills";
import { ENEMIES } from "../src/data/enemies";
import { ZONES } from "../src/data/zones";
import { makeMember, recalc, grantXp, skillUnlocked } from "../src/systems/progression";
import { makeItem, rollDrop, itemScore } from "../src/systems/loot";
import { makeEnemy, combatDamage } from "../src/systems/combat";

// Field-layout constants the sim traverses (mirror controllers/field.ts).
const BX = 58, GX = 30, ENC_MIN = 3, ENC_MAX = 6;

const ZERO: Item = { slot: "armor", cls: "", rarity: "common", rIx: -1, ilvl: 0, name: "", implicit: {}, affixes: [] };

function freshParty(): Member[] {
  const p = PARTY_DEFS.map(makeMember);
  p.forEach((m) => (m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls)));
  recalc(p);
  return p;
}
function affordableDmg(m: Member): Skill | null {
  return (
    m.skills
      .map((k) => SKILLS[k])
      .filter((s) => skillUnlocked(m, s) && s.mp <= (m.mp ?? 0) && (s.type === "phys" || s.type === "mag"))
      .sort((a, b) => (b.power ?? 0) * (b.hits || 1) - (a.power ?? 0) * (a.hits || 1))[0] || null
  );
}
function affordableHeal(m: Member): Skill | null {
  return m.skills.map((k) => SKILLS[k]).filter((s) => skillUnlocked(m, s) && s.mp <= (m.mp ?? 0) && s.type === "heal")[0] || null;
}
function dot(u: Member | Enemy): void {
  const st = u.status;
  for (const k of ["burn", "poison", "decay"]) if (st[k]) { u.hp = Math.max(0, u.hp - Math.max(2, Math.round(u.maxhp * 0.05))); if (--st[k] <= 0) delete st[k]; }
  if (st.regen) { u.hp = Math.min(u.maxhp, u.hp + Math.round(u.maxhp * 0.08)); if (--st.regen <= 0) delete st.regen; }
  for (const k of ["blind", "atkup", "stun", "wardArmor"]) if (st[k] && --st[k] <= 0) delete st[k];
  if (u.hp <= 0) u.alive = false;
  u.guarding = false;
}

interface FightResult {
  win: boolean; taken: number; actions: number; endHP: number; minHP: number;
  enemies: Enemy[]; eActs: number; pdph: number; partyMax: number;
}

function simFight(party: Member[], keys: string[], depth: number): FightResult {
  const enemies = keys.map((k, i) => makeEnemy(k, i, false, depth || 0));
  party.forEach((m) => { m.atb = ri(0, 30); m.status = {}; m.guarding = false; });
  enemies.forEach((e) => (e.atb = ri(0, 20)));
  const living = (): (Member | Enemy)[] => [...party.filter((m) => m.alive), ...enemies.filter((e) => e.alive)];
  const maxTot = party.reduce((a, m) => a + m.maxhp, 0);
  const hpPct = () => party.reduce((a, m) => a + Math.max(0, m.hp), 0) / maxTot;
  let actions = 0, taken = 0, minHP = 1, eActs = 0, pDmg = 0, pHits = 0;
  while (party.some((m) => m.alive) && enemies.some((e) => e.alive) && actions < 500) {
    minHP = Math.min(minHP, hpPct());
    const us = living();
    if (!us.length) break;
    // continuous-time ATB: whoever's gauge reaches 100 first acts; advance all proportionally
    let act: Member | Enemy | null = null, bt = Infinity;
    for (const u of us) { const t = (100 - u.atb) / Math.max(1, u.spd); if (t < bt) { bt = t; act = u; } }
    for (const u of us) u.atb += Math.max(1, u.spd) * bt;
    if (!act) break;
    act.atb = 0; actions++;
    dot(act);
    if (!act.alive) continue;
    if (act.status.stun) continue;
    if (act.side === "party") {
      const m = act as Member;
      const wounded = party.filter((x) => x.alive && x.hp < x.maxhp * 0.55).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp);
      const hs = affordableHeal(m);
      if (hs && wounded.length) { m.mp = (m.mp ?? 0) - hs.mp; const t = wounded[0]; t.hp = Math.min(t.maxhp, t.hp + Math.round(m.mag * (hs.power ?? 0) + 6)); }
      else {
        const sk = affordableDmg(m), tgt = enemies.filter((e) => e.alive).sort((a, b) => a.hp - b.hp)[0];
        if (!tgt) continue;
        if (sk && sk.mp) m.mp = (m.mp ?? 0) - sk.mp;
        const hits = sk ? sk.hits || 1 : 1;
        const targs = sk && sk.target === "allEnemies" ? enemies.filter((e) => e.alive) : [tgt];
        targs.forEach((tt) => {
          for (let h = 0; h < hits; h++) {
            if (!tt.alive) break;
            const r = combatDamage(m, tt, { skill: sk || undefined });
            if (!r.miss) { tt.hp = Math.max(0, tt.hp - r.dmg); pDmg += r.dmg; pHits++; if (tt.hp <= 0) tt.alive = false; }
          }
        });
      }
    } else {
      const e = act as Enemy;
      const foes = party.filter((m) => m.alive);
      if (!foes.length) break;
      eActs++;
      let used = false;
      if (e.skills && e.skills.length && Math.random() < e.castChance) {
        const ab = pick(e.skills);
        if (ab === "mend") { const h = enemies.filter((x) => x.alive && x.hp < x.maxhp).sort((a, b) => a.hp - b.hp)[0]; if (h) { h.hp = Math.min(h.maxhp, h.hp + Math.round(e.mag * 1.7 + 22)); used = true; } }
        else if (ab === "hex") { pick(foes).status.blind = 2; used = true; }
        else if (ab === "rally") { enemies.filter((x) => x.alive).forEach((x) => (x.status.atkup = 3)); used = true; }
      }
      if (!used) {
        const aoe = e.boss && Math.random() < 0.2;
        const targs = aoe ? foes : [pick(foes)];
        targs.forEach((t) => {
          const r = combatDamage(e, t, aoe ? { aoe: true } : {});
          if (!r.miss) {
            t.hp = Math.max(0, t.hp - r.dmg); taken += r.dmg;
            if (e.leech) e.hp = Math.min(e.maxhp, e.hp + Math.round((r.dmg * e.leech) / 100));
            if (e.onHitPoison) t.status.poison = e.onHitPoison;
            if (t.hp <= 0) t.alive = false;
          }
        });
      }
    }
  }
  minHP = Math.min(minHP, hpPct());
  const win = party.some((m) => m.alive) && !enemies.some((e) => e.alive);
  const hp = party.reduce((a, m) => a + Math.max(0, m.hp), 0), max = party.reduce((a, m) => a + m.maxhp, 0);
  return { win, taken, actions, endHP: hp / max, minHP, enemies, eActs, pdph: pHits ? pDmg / pHits : 0, partyMax: max };
}

function gearUp(party: Member[], enemies: Enemy[]): void {
  const drops: Item[] = [];
  enemies.forEach((e) => {
    const ch = e.boss || e.miniboss ? 1 : e.elite ? 1 : 0.4;
    if (Math.random() < ch) drops.push(rollDrop(e, pick(party).cls));
    if (e.miniboss) drops.push(rollDrop(e, pick(party).cls));
    if (e.boss) { drops.push(rollDrop(e, pick(party).cls)); drops.push(rollDrop(e, pick(party).cls)); }
  });
  drops.forEach((it) => {
    if (it.slot === "weapon") { const m = party.find((x) => x.cls === it.cls); if (m && (!m.equip.weapon || itemScore(it) > itemScore(m.equip.weapon))) m.equip.weapon = it; }
    else {
      const m = party.slice().sort((a, b) => itemScore(a.equip[it.slot] || ZERO) - itemScore(b.equip[it.slot] || ZERO))[0];
      if (!m.equip[it.slot] || itemScore(it) > itemScore(m.equip[it.slot]!)) m.equip[it.slot] = it;
    }
  });
  recalc(party);
}

interface Fight extends FightResult { kind: string; zone: number; p: number; }

function simRun() {
  const party = freshParty();
  const fights: Fight[] = [];
  let wiped = false;
  for (let zi = 0; zi < ZONES.length && !wiped; zi++) {
    const Z = ZONES[zi];
    let px = 1;
    let toEnc = ri(ENC_MIN, ENC_MAX);
    const prog = () => (px - 1) / (BX - 1);
    const fight = (keys: string[], kind: string, depth = prog()): boolean => {
      const r = simFight(party, keys, depth);
      fights.push({ kind, zone: zi, p: prog(), ...r });
      if (!r.win) { wiped = true; return false; }
      let xp = 0;
      keys.forEach((k) => (xp += ENEMIES[k].xp));
      grantXp(party, xp);
      // a sensible player banks earned MNA into their own (SOL) tree
      party.forEach((m) => { m.mnaAlloc[m.att] += m.mnaPoints; m.mnaPoints = 0; });
      gearUp(party, r.enemies);
      return true;
    };
    while (px < BX && !wiped) {
      px++;
      if (px === GX) { if (!fight([Z.mini, ...(Z.miniAdds || [])], "mini")) break; continue; }
      toEnc--;
      if (toEnc <= 0) {
        toEnc = ri(ENC_MIN, ENC_MAX);
        const p = prog();
        const inDungeon = px > GX; // past the gate = the zone's dungeon
        let band = Z.bands[0];
        for (const b of Z.bands) if (p >= b.at) band = b;
        const depth = inDungeon ? clamp(p + 0.25, 0, 1) : p;
        if (!fight(pick(band.sets), "rand", depth)) break;
      }
    }
    if (!wiped) fight([Z.boss], zi === ZONES.length - 1 ? "finalboss" : "boss");
  }
  return { fights, wiped, lvl: party.reduce((a, m) => a + m.level, 0) / 4 };
}

const N = parseInt(process.argv[2] || "60", 10);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pc = (x: number) => (x * 100).toFixed(0) + "%";
let wipes = 0;
const lvls: number[] = [];
const byZone: Record<number, { rand: number[]; mini: number[]; boss: number[]; n: number; danger: number }> = {};
for (let i = 0; i < N; i++) {
  const r = simRun();
  if (r.wiped) wipes++;
  lvls.push(r.lvl);
  r.fights.forEach((f) => {
    const z = byZone[f.zone] || (byZone[f.zone] = { rand: [], mini: [], boss: [], n: 0, danger: 0 });
    z.n++;
    if (f.minHP < 0.4) z.danger++;
    if (f.kind === "rand") z.rand.push(f.minHP);
    else if (f.kind === "mini") z.mini.push(f.minHP);
    else z.boss.push(f.minHP);
  });
}
console.log(`runs ${N} | full-clear wipe rate ${pc(wipes / N)} | avg final party level ${avg(lvls).toFixed(1)}`);
console.log(`(low point during fight = lowest party HP%; boss = zone/final boss)`);
for (const zi of Object.keys(byZone)) {
  const z = byZone[+zi];
  const name = ZONES[+zi] ? ZONES[+zi].name : "zone" + zi;
  console.log(`  ${name}: random ${pc(avg(z.rand))} | mini ${pc(avg(z.mini))} | boss ${pc(avg(z.boss))} | dipped<40%: ${pc(z.danger / z.n)} | scariest boss ${pc(z.boss.length ? Math.min(...z.boss) : 1)}`);
}
// diagnostics for sizing enemy HP/ATK
const pdph: number[] = [], eacts: number[] = [], pmaxLate: number[] = [], eactsBoss: number[] = [];
for (let i = 0; i < 20; i++) {
  const r = simRun();
  r.fights.forEach((f) => {
    pdph.push(f.pdph); eacts.push(f.eActs);
    if (f.kind === "boss") { eactsBoss.push(f.eActs); pmaxLate.push(f.partyMax); }
  });
}
console.log(`DIAG: party dmg/hit ~${avg(pdph).toFixed(0)} | enemy actions/fight ~${avg(eacts).toFixed(1)} | boss-fight enemy actions ~${avg(eactsBoss).toFixed(1)} | party total HP at boss ~${avg(pmaxLate).toFixed(0)}`);
