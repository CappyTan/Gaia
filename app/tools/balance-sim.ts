// Headless full-run combat simulator for tuning difficulty. Imports the SHIPPING systems
// directly (combatDamage / makeEnemy / loot / progression) — no DOM, no regex extraction.
//   npm run sim                         # 60 runs, "skilled" persona (models real play)
//   npx tsx app/tools/balance-sim.ts 200            # 200 runs, skilled
//   npx tsx app/tools/balance-sim.ts 200 reckless   # pessimistic floor
//
// PERSONA matters: tune against "skilled" (it tracks real telemetry — competent play), and sanity
// the floor with "reckless". Tune by editing data/enemies.ts (or zones.ts) then re-running. Targets
// against the SKILLED persona:
//   - avg end-of-fight party HP ~55-75% on randoms (fights cost real HP, net of heals)
//   - boss / mini-boss low-point ~30-50% — genuine threats
//   - skilled wipe rate low (~5-10%); reckless will read higher (worst-case headroom)

import type { Enemy, Item, Member, Skill } from "../src/types";
import { ri, pick, clamp, seeded } from "../src/core/rng";
import { PARTY_DEFS } from "../src/data/party";
import { SKILLS } from "../src/data/skills";
import { ENEMIES } from "../src/data/enemies";
import { ZONES } from "../src/data/zones";
import { makeMember, recalc, grantXp, skillUnlocked, START_LEVEL } from "../src/systems/progression";
import { specFor } from "../src/data/classSpecs";
import { defaultPicks } from "../src/systems/choice";
import { starterWeapon, rollDrop, itemScore } from "../src/systems/loot";
import { makeEnemy, combatDamage } from "../src/systems/combat";
import { applyStatus, tickStatus, hasStatus } from "../src/systems/status";
import { rollEncounter } from "../src/systems/encounter";

// Field-layout constants the sim traverses (mirror controllers/field.ts).
const BX = 58, GX = 30, ENC_MIN = 3, ENC_MAX = 6;

// SEEDED rng for the loot/enemy/encounter rolls so the pure pipeline is reproducible (regression-
// pinnable). Seed from argv[4] (`npm run sim 200 skilled 123`) or default. The combat/persona RNG
// in the fight loop still uses Math.random (it models live play); this only pins the CONTENT rolls.
const SEED = parseInt(process.argv[4] || "1", 10);
const rng = seeded(SEED);

// PLAYER PERSONA — how well the simulated player drives the party. The default models a
// competent player (you, per telemetry: focus-fire threats, keep HP topped, open with buffs) so
// the sim is PREDICTIVE of the real game; "reckless" keeps the old loose play as a pessimistic
// floor for worst-case tuning. Pick with: `npm run sim 200 reckless`.
// What separates a skilled player here is keeping HP topped (proactive + party heals) while still
// killing fast — NOT fancy targeting (whittling the tanky champion first just lets everything else
// hit you; finishing the soonest-to-die enemy removes attackers fastest, which both personas do).
interface Persona { name: string; healAt: number; partyHeal: boolean; }
const PERSONAS: Record<string, Persona> = {
  skilled: { name: "skilled (you)", healAt: 0.68, partyHeal: true },   // heal early, top the party
  reckless: { name: "reckless", healAt: 0.4, partyHeal: false },        // heal late, single-target — worst-case floor
};
const PERSONA: Persona = PERSONAS[process.argv[3]] ?? PERSONAS.skilled;

const ZERO: Item = { slot: "armor", cls: "", rarity: "common", rIx: -1, ilvl: 0, name: "", implicit: {}, affixes: [] };

// Recalc, then give every hero the DEFAULT V3 kit (lane A at each milestone) for its CURRENT class — the
// game ships heroes with only the auto-attack until the player picks (ADR 0020), but the balance bench
// needs a fully-built, level-appropriate kit to exercise. Re-derived after a possible reclass (recalc
// settles att/cls from equipped weapons first), then recalc again to resolve the kit from picks + MNA.
function v3kit(party: Member[]): void {
  recalc(party);
  party.forEach((m) => { const sp = specFor(m.att, m.cls); if (sp) m.picks = defaultPicks(sp); });
  recalc(party);
}
// Mirror Game.startRun (v0.213 + ADR 0021, amended): heroes begin at LEVEL 1 with the fixed +10-MNA
// starter weapon IN THEIR OWN ATTUNEMENT (the derived piecewise mnaFloor lands in recalc).
function freshParty(): Member[] {
  const p = PARTY_DEFS.map(makeMember);
  p.forEach((m) => { m.level = START_LEVEL; m.equip.weapon = starterWeapon(m.cls, m.att, rng); });
  v3kit(p);
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
// All affordable, usable heals (skilled play prefers a party-wide heal when several are hurt).
function affordableHeals(m: Member): Skill[] {
  return m.skills.map((k) => SKILLS[k]).filter((s) => skillUnlocked(m, s) && s.mp <= (m.mp ?? 0) && s.type === "heal");
}
function dot(u: Member | Enemy): void {
  // ADR 0016 instance tick: status-layer DoTs/HoTs change HP (magnitude is %-of-maxhp per stack);
  // Doom detonates on expiry. Other layers just count down. (Drain's transfer is omitted in the sim.)
  for (const ev of tickStatus(u.statuses)) {
    if (ev.layer !== "status") continue;
    if (ev.detonated) { u.hp = Math.max(0, u.hp - Math.max(2, Math.round(u.maxhp * 0.25))); continue; }
    if (ev.magnitude <= 0) continue;
    const amt = Math.max(2, Math.round(u.maxhp * (ev.magnitude / 100) * ev.stacks));
    if (ev.kind === "buff") u.hp = Math.min(u.maxhp, u.hp + amt);
    else u.hp = Math.max(0, u.hp - amt);
  }
  if (u.hp <= 0) u.alive = false;
  u.guarding = false;
}

interface FightResult {
  win: boolean; taken: number; actions: number; endHP: number; minHP: number;
  enemies: Enemy[]; eActs: number; pdph: number; partyMax: number;
}

// Front line shields the back row (mirror controllers/battle.ts reachable()).
function reachable(e: Enemy, foes: Member[]): Member[] {
  const front = foes.filter((m) => m.row !== "back");
  if (!front.length || e.ai === "boss" || e.ai === "caster" || Math.random() < 0.2) return foes;
  return front;
}

function simFight(party: Member[], keys: string[], depth: number, champIdx = -1): FightResult {
  const enemies = keys.map((k, i) => makeEnemy(k, i, false, depth || 0, i === champIdx, rng));
  party.forEach((m) => { m.atb = ri(0, 30); m.statuses = []; m.guarding = false; });
  enemies.forEach((e) => (e.atb = ri(0, 20)));
  const living = (): (Member | Enemy)[] => [...party.filter((m) => m.alive), ...enemies.filter((e) => e.alive)];
  const maxTot = party.reduce((a, m) => a + m.maxhp, 0);
  const hpPct = () => party.reduce((a, m) => a + Math.max(0, m.hp), 0) / maxTot;
  let actions = 0, taken = 0, minHP = 1, eActs = 0, pDmg = 0, pHits = 0;
  while (party.some((m) => m.alive) && enemies.some((e) => e.alive) && actions < 500) {
    minHP = Math.min(minHP, hpPct());
    const us = living();
    if (!us.length) break;
    // continuous-time ATB: whoever's gauge reaches 100 first acts; advance all proportionally.
    // Enemies fill 1.25x faster (mirrors battle.ts — Dara: enemies too slow).
    const espd = (u: Member | Enemy) => Math.max(1, u.spd) * (u.side === "enemy" ? 1.2 : 1);
    let act: Member | Enemy | null = null, bt = Infinity;
    for (const u of us) { const t = (100 - u.atb) / espd(u); if (t < bt) { bt = t; act = u; } }
    for (const u of us) u.atb += espd(u) * bt;
    if (!act) break;
    act.atb = 0; actions++;
    const ccd = hasStatus(act.statuses, "stun") || hasStatus(act.statuses, "frozen");
    dot(act);
    if (!act.alive) continue;
    if (ccd) continue;
    if (act.side === "party") {
      const m = act as Member;
      const foesAlive = enemies.filter((e) => e.alive);
      if (!foesAlive.length) continue;
      const wounded = party.filter((x) => x.alive && x.hp < x.maxhp * PERSONA.healAt).sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp);
      // ONE designated healer (the highest-mag hero with a heal) keeps the party topped; the rest keep
      // killing — real skilled play. Everyone still triages a CRITICAL ally (<35%). Without this the
      // whole party heal-locks (zero damage output) and a deep pack grinds them down — not how a
      // competent player drives five heroes.
      const primaryHealer = party.filter((x) => x.alive && affordableHeals(x).length).sort((a, b) => b.mag - a.mag)[0];
      const critical = wounded.length && wounded[0].hp < wounded[0].maxhp * 0.35;
      const mayHeal = m === primaryHealer || critical;
      const heals = mayHeal ? affordableHeals(m) : [];
      const partyHeal = PERSONA.partyHeal && wounded.length >= 2 ? heals.find((s) => s.target === "allAllies") : undefined;
      const singleHeal = heals.slice().sort((a, b) => (b.power ?? 0) - (a.power ?? 0))[0];
      if (partyHeal && wounded.length) { // top off the whole party
        m.mp = (m.mp ?? 0) - partyHeal.mp;
        party.filter((x) => x.alive).forEach((t) => { t.hp = Math.min(t.maxhp, t.hp + Math.round(m.mag * (partyHeal.power ?? 0) + 6)); if (partyHeal.status?.regen) applyStatus(t.statuses, "regen", { turns: partyHeal.status.regen }); });
      } else if (singleHeal && wounded.length) { // patch the most-wounded ally
        m.mp = (m.mp ?? 0) - singleHeal.mp; const t = wounded[0];
        t.hp = Math.min(t.maxhp, t.hp + Math.round(m.mag * (singleHeal.power ?? 0) + 6));
      } else { // kill the soonest-to-die enemy (fewest enemy turns) — efficient for both personas
        const tgt = foesAlive.slice().sort((a, b) => a.hp - b.hp)[0];
        const sk = affordableDmg(m);
        if (sk && sk.mp) m.mp = (m.mp ?? 0) - sk.mp;
        const hits = sk ? sk.hits || 1 : 1;
        const targs = sk && sk.target === "allEnemies" ? foesAlive : [tgt];
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
        else if (ab === "hex") { applyStatus(pick(foes).statuses, "blind", { turns: 2 }); used = true; }
        else if (ab === "rally") { enemies.filter((x) => x.alive).forEach((x) => applyStatus(x.statuses, "atkup", { turns: 3 })); used = true; }
      }
      if (!used) {
        const aoe = e.boss && Math.random() < 0.2;
        const targs = aoe ? foes : [pick(reachable(e, foes))];
        targs.forEach((t) => {
          const r = combatDamage(e, t, aoe ? { aoe: true } : {});
          if (!r.miss) {
            t.hp = Math.max(0, t.hp - r.dmg); taken += r.dmg;
            if (e.leech) e.hp = Math.min(e.maxhp, e.hp + Math.round((r.dmg * e.leech) / 100));
            if (e.onHitPoison) applyStatus(t.statuses, "poison", { turns: e.onHitPoison });
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
    const drop = () => rollDrop(e, party.map((p) => ({ cls: p.cls, att: p.att })), rng);
    if (Math.random() < ch) drops.push(drop());
    if (e.champion) drops.push(drop());
    if (e.miniboss) drops.push(drop());
    if (e.boss) { drops.push(drop()); drops.push(drop()); }
  });
  drops.forEach((it) => {
    // a weapon equips on a same-archetype hero only if it's an upgrade (it may reclass them)
    if (it.slot === "weapon") { const m = party.find((x) => x.cls === it.cls); if (m && (!m.equip.weapon || itemScore(it) > itemScore(m.equip.weapon))) m.equip.weapon = it; }
    else {
      const m = party.slice().sort((a, b) => itemScore(a.equip[it.slot] || ZERO) - itemScore(b.equip[it.slot] || ZERO))[0];
      if (!m.equip[it.slot] || itemScore(it) > itemScore(m.equip[it.slot]!)) m.equip[it.slot] = it;
    }
  });
  v3kit(party); // re-derive each hero's kit (picks follow a reclass; new MNA folds in) after gearing up
}

interface Fight extends FightResult { kind: string; zone: number; p: number; desc?: string; }

function simRun() {
  const party = freshParty();
  const fights: Fight[] = [];
  let wiped = false;
  for (let zi = 0; zi < ZONES.length && !wiped; zi++) {
    const Z = ZONES[zi];
    // FRONT-DOOR TOWN (every zone has one): a skilled player rests at the inn before pushing on —
    // full heal + town revive. Without this the sim compounds attrition across all ten zones,
    // something the real game never asks of the player.
    party.forEach((m) => { m.alive = true; m.hp = m.maxhp; m.mp = m.maxmp; });
    let px = 1;
    let toEnc = ri(ENC_MIN, ENC_MAX);
    const prog = () => (px - 1) / (BX - 1);
    const fight = (keys: string[], kind: string, depth = prog(), champIdx = -1): boolean => {
      const preHP = party.reduce((a, m) => a + Math.max(0, m.hp), 0) / party.reduce((a, m) => a + m.maxhp, 0);
      const preLvl = party.reduce((a, m) => a + m.level, 0) / party.length;
      const r = simFight(party, keys, depth, champIdx);
      const desc = `${r.enemies.map((e) => `${e.key}${e.champion ? "!C" : e.elite ? "!e" : ""}`).join("+")} d${depth.toFixed(2)} vs L${preLvl.toFixed(1)}@${Math.round(preHP * 100)}%hp acts${r.actions} eActs${r.eActs}`;
      fights.push({ kind, zone: zi, p: prog(), desc, ...r });
      if (!r.win) { wiped = true; return false; }
      const xp = r.enemies.reduce((a, e) => a + e.xpReward, 0); // champions/elites carry their own reward
      grantXp(party, xp); // MNA is derived (ADR 0021) — nothing to bank
      gearUp(party, r.enemies);
      // POST-FIGHT TONIC (the shipping crafting slice sells/crafts health tonics; the sim's gold is
      // otherwise unspent): a skilled player never walks into the next pack half-dead. Top a survivor
      // up to 50% — partial, consumable-scale; in-fight healing still has to do the real work.
      party.forEach((m) => { if (m.alive && m.hp < m.maxhp * 0.5) m.hp = Math.round(m.maxhp * 0.5); });
      // RETREAT ON A DEATH: a fallen hero stays down until revived IN TOWN (Dara), and the world
      // persists — so a skilled player who loses someone walks back to the front-door town, revives,
      // rests and returns (losing time, not progress). Only a FULL wipe in one fight ends the run.
      if (party.some((m) => !m.alive)) party.forEach((m) => { m.alive = true; m.hp = m.maxhp; m.mp = m.maxmp; });
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
        // Share the SHIPPING encounter composition (systems/encounter) instead of a hand-mirrored copy
        // so the two can't drift. The sim has no Area lean and doesn't model the rare substitution, so
        // fav/rareKeys are empty; dungeonFloor 0 (single-floor model here). Seeded rng = reproducible.
        const enc = rollEncounter({ bands: Z.bands, progress: p, inDungeon, dungeonFloor: 0, zoneIndex: zi, rareKeys: [], fav: undefined }, rng);
        if (!fight(enc.keys, "rand", enc.depth, enc.champIdx)) break;
      }
    }
    // MULTI-FLOOR (ADR 0008 Stage 3): a multi-floor dungeon adds an IN-DUNGEON mini-boss (the gating
    // lieutenant) per gated floor before the boss — model each as one extra deep fight so the curve
    // accounts for the added attrition. Single-floor dungeons (no `floors`) skip this, unchanged.
    const floors = Z.dungeon.floors && Z.dungeon.floors.length ? Z.dungeon.floors : [Z.dungeon.layout];
    if (!wiped && floors.length > 1) {
      const key = Z.dungeon.floorMini || Z.mini;
      floors.forEach((f, fi) => { if (!wiped && f.miniboss) fight([key], "floormini", clamp(0.45 + fi / floors.length, 0, 1)); });
    }
    if (!wiped) fight([Z.boss], zi === ZONES.length - 1 ? "finalboss" : "boss");
  }
  return { fights, wiped, lvl: party.reduce((a, m) => a + m.level, 0) / party.length };
}

const N = parseInt(process.argv[2] || "60", 10);
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pc = (x: number) => (x * 100).toFixed(0) + "%";
let wipes = 0;
const lvls: number[] = [];
const wipeAt: Record<string, number> = {}; // where runs die — the tuning wall finder
const byZone: Record<number, { rand: number[]; mini: number[]; boss: number[]; n: number; danger: number }> = {};
for (let i = 0; i < N; i++) {
  const r = simRun();
  if (r.wiped) {
    wipes++;
    const last = r.fights[r.fights.length - 1];
    const key = `${ZONES[last.zone]?.name ?? last.zone}/${last.kind}@${last.p.toFixed(1)}${last.actions >= 500 ? " STALL" : ""}`;
    wipeAt[key] = (wipeAt[key] || 0) + 1;
    if (process.env.SIM_DEBUG && wipes <= 15) console.log(`  WIPE ${key}: ${last.desc}`);
  }
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
console.log(`runs ${N} | persona: ${PERSONA.name} | full-clear wipe rate ${pc(wipes / N)} | avg final party level ${avg(lvls).toFixed(1)}`);
if (wipes) console.log(`  wiped at: ${Object.entries(wipeAt).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join(" | ")}`);
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
