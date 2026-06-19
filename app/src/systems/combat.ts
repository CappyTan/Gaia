import type { Attunement, CombatAct, DamageResult, Enemy, StatusMap, Unit } from "../types";
import type { Rng } from "../core/rng";
import { ri, pick } from "../core/rng";
import { affinity } from "./affinity";
import { mnaBonus } from "./progression";
import { ENEMIES, depthHpScale, depthAtkScale } from "../data/enemies";
import { ELITE_AFFIXES } from "../data/items";

// PURE damage math — no DOM, no side effects. Used by the battle controller AND the balance
// sim. rng is injectable for deterministic tests. Returns {dmg, crit, mult, miss}.
export function combatDamage(actor: Unit, target: Unit, act: CombatAct, rng: Rng = Math.random): DamageResult {
  const s = act.skill;
  if (actor.status.blind && rng() < 0.4) return { dmg: 0, crit: false, mult: 1, miss: true };
  const isMag = s ? s.type === "mag" : false;
  const power = s && s.power != null ? s.power : 1.0;
  const baseStat = isMag ? actor.mag : actor.atk;
  let raw = baseStat * power + (rng() * 3 - 1); // jitter [-1,2)
  if (actor.status.atkup) raw *= 1.5;
  if (act && act.aoe) raw *= 0.6; // sweep hits everyone, but glancing
  const atkAtt: Attunement = s && s.sol ? "SOL" : actor.att;
  const mult = affinity(atkAtt, target.att);
  // "Power dmg" affix amplifies the wielder's own attunement attacks (any attunement).
  if (actor.solPct) raw *= 1 + actor.solPct / 100;
  // MNA scales output: SOL/NOX attunements amplify damage (up to +60% at 200 MNA).
  if ((atkAtt === "SOL" || atkAtt === "NOX") && actor.mna) raw *= 1 + mnaBonus(actor.mna[atkAtt]);
  raw *= mult;
  const critC = (actor.critPct || 5) + (s && s.crit ? s.crit : 0) + (actor.att === "QUANTA" ? 10 : 0);
  const crit = rng() * 100 < critC;
  if (crit) raw *= 1.8;
  let dmg = Math.max(1, Math.round(raw - target.armor * 0.6 * (isMag ? 0.5 : 1)));
  // UMBRAXIS MNA scales the defender's damage reduction.
  if (target.mna && target.mna.UMBRAXIS) dmg = Math.max(1, Math.round(dmg * (1 - mnaBonus(target.mna.UMBRAXIS))));
  if (target.guarding) dmg = Math.round(dmg * 0.5);
  if (target.status.wardArmor) dmg = Math.max(1, dmg - (target.wardAmt || 0));
  return { dmg, crit, mult, miss: false };
}

export function damage(u: Unit, d: number): void {
  u.hp = Math.max(0, u.hp - d);
  if (u.hp <= 0) u.alive = false;
}

export function heal(u: Unit, h: number): void {
  if (!u.alive) return;
  u.hp = Math.min(u.maxhp, u.hp + h);
}

export function applyStatus(u: Unit, st: StatusMap): void {
  for (const k in st) {
    if (k === "turns") continue;
    u.status[k] = Math.max(u.status[k] || 0, st[k]);
  }
}

/** Build a live enemy from its data def, scaled by zone depth, with a chance to roll Elite. */
export function makeEnemy(key: string, _idx: number, _isBossBattle: boolean, depth = 0): Enemy {
  const d = ENEMIES[key];
  const hp = Math.round(d.hp * depthHpScale(depth));
  const atk = Math.round(d.atk * depthAtkScale(depth));
  const mag = Math.round((d.mag || 0) * depthAtkScale(depth));
  const e: Enemy = {
    key, name: d.name, spr: d.spr, att: d.att, lvl: d.lvl, side: "enemy",
    maxhp: hp, hp, atk, spd: d.spd, armor: d.armor, mag,
    xpReward: d.xp, goldRange: d.gold, ai: d.ai, boss: !!d.boss, miniboss: !!d.miniboss,
    skills: d.skills || null, castChance: d.castChance || 0, onHitPoison: (d.onHit && d.onHit.poison) || 0,
    alive: true, atb: 0, status: {}, critPct: 5, leech: d.leech || 0, solPct: 0,
  };
  // elite roll (regular enemies only): ~22% become elite with 1-2 affixes
  if (!e.boss && !e.miniboss && Math.random() < 0.22) {
    e.elite = true;
    const n = ri(1, 2);
    const used: string[] = [];
    e.eliteAffixes = [];
    for (let i = 0; i < n; i++) {
      const a = pick(ELITE_AFFIXES.filter((x) => !used.includes(x.key)));
      if (!a) break;
      used.push(a.key);
      e.eliteAffixes.push(a.key);
      a.apply(e);
    }
    e.hp = e.maxhp;
  }
  return e;
}
