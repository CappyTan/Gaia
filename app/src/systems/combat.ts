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
  // FORMATION (party only — enemies have no row): melee hammers the front line but glances off the
  // back; ranged/magic does the reverse. And a hero fights best in their proper row.
  const trow = (target as { row?: "front" | "back" }).row;
  if (target.side === "party" && trow === "back") raw *= isMag ? 1.25 : 0.7;
  const arow = (actor as { row?: "front" | "back" }).row;
  if (actor.side === "party" && arow) {
    if (isMag) raw *= arow === "back" ? 1.1 : 0.95;   // casters/ranged stronger from the back
    else raw *= arow === "front" ? 1.1 : 0.9;          // melee stronger up front
  }
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

/** Elites, champions, mini-bosses and bosses shrug off Stun (it was trivializing tough fights). */
export function stunImmune(u: Unit): boolean {
  const e = u as Enemy;
  return u.side === "enemy" && !!(e.boss || e.miniboss || e.elite || e.champion);
}

export function applyStatus(u: Unit, st: StatusMap): void {
  for (const k in st) {
    if (k === "turns") continue;
    u.status[k] = Math.max(u.status[k] || 0, st[k]);
  }
}

/** Roll N distinct elite affixes onto an enemy (mutates eliteAffixes + applies stat effects). */
function applyAffixes(e: Enemy, n: number): void {
  const used = (e.eliteAffixes = e.eliteAffixes || []);
  for (let i = 0; i < n; i++) {
    const a = pick(ELITE_AFFIXES.filter((x) => !used.includes(x.key)));
    if (!a) break;
    used.push(a.key);
    a.apply(e);
  }
  e.hp = e.maxhp;
}

/**
 * Build a live enemy from its data def, scaled by zone depth. Regular enemies have a ~22% chance
 * to roll Elite (1-2 affixes). Passing `champion` makes a tanky pack leader: much higher HP, more
 * ATK, three affixes, and richer XP/gold (a tier above elite) — see Field champion packs.
 */
export function makeEnemy(key: string, _idx: number, _isBossBattle: boolean, depth = 0, champion = false): Enemy {
  const d = ENEMIES[key];
  const champHp = champion ? 1.65 : 1;
  const champAtk = champion ? 1.3 : 1;
  const hp = Math.round(d.hp * depthHpScale(depth) * champHp);
  const atk = Math.round(d.atk * depthAtkScale(depth) * champAtk);
  const mag = Math.round((d.mag || 0) * depthAtkScale(depth) * champAtk);
  const e: Enemy = {
    key, name: d.name, spr: d.spr, att: d.att, lvl: d.lvl, side: "enemy", // champion marker is a render concern
    maxhp: hp, hp, atk, spd: d.spd, armor: d.armor + (champion ? 2 : 0), mag,
    xpReward: champion ? Math.round(d.xp * 2.2) : d.xp,
    goldRange: champion ? [d.gold[0] * 2, d.gold[1] * 2] : d.gold,
    ai: d.ai, boss: !!d.boss, miniboss: !!d.miniboss, rare: !!d.rare, art: d.art,
    skills: d.skills || null, castChance: d.castChance || 0, onHitPoison: (d.onHit && d.onHit.poison) || 0,
    alive: true, atb: 0, status: {}, critPct: 5, leech: d.leech || 0, solPct: 0,
  };
  if (e.boss || e.miniboss || e.rare) return e; // rares are their own tier — no random elite roll
  if (champion) { e.champion = true; e.elite = true; applyAffixes(e, 3); }
  else if (Math.random() < 0.22) { e.elite = true; applyAffixes(e, ri(1, 2)); } // elite roll
  return e;
}
