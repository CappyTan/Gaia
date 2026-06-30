import type { Attunement, CombatAct, DamageResult, Enemy, Unit } from "../types";
import type { Rng } from "../core/rng";
import { riR, pickR, clamp } from "../core/rng";
import { affinity } from "./affinity";
import { mnaBonus } from "./progression";
import { ENEMIES, ENEMY_HP_EASE, ENEMY_ATK_EASE } from "../data/enemies";
import { enemyBlock, DEPTH_LEVELS } from "./enemyStats";
import { hasStatus } from "./status";
import { ELITE_AFFIXES } from "../data/items";

// PURE damage math — no DOM, no side effects. Used by the battle controller AND the balance
// sim. rng is injectable for deterministic tests. Returns {dmg, crit, mult, miss}.
export function combatDamage(actor: Unit, target: Unit, act: CombatAct, rng: Rng = Math.random): DamageResult {
  const s = act.skill;
  if (hasStatus(actor.statuses, "blind") && rng() < 0.4) return { dmg: 0, crit: false, mult: 1, miss: true };
  const isMag = s ? s.type === "mag" : false;
  // Damage is typed (ADR 0014): an explicit `dmgType` wins, else derive from the skill kind
  // (mag→ENERGY = projected/ability; else MATTER = struck/martial). `isMag` still drives baseStat +
  // formation separately. Default-from-kind keeps this a behavioral no-op until something opts in.
  const dmgType = act.dmgType ?? (s ? s.dmgType : undefined) ?? actor.dmgType ?? (isMag ? "energy" : "matter");
  const energy = dmgType === "energy";
  // Defender avoid proc: Block fully stops a MATTER hit (clamped so you can't become unhittable).
  // Energy has no full-block — it's answered by Energy Reduction below. Evasion (any) applies later.
  const td = target.sub;
  if (td && !energy && rng() * 100 < Math.min(40, td.Blk)) return { dmg: 0, crit: false, mult: 1, miss: true };
  const power = s && s.power != null ? s.power : 1.0;
  const baseStat = isMag ? actor.mag : actor.atk;
  let raw = baseStat * power + (rng() * 3 - 1); // jitter [-1,2)
  if (hasStatus(actor.statuses, "atkup")) raw *= 1.5;
  if (act && act.aoe) raw *= 0.6; // sweep hits everyone, but glancing
  const atkAtt: Attunement = s && s.sol ? "SOL" : actor.att;
  const mult = affinity(atkAtt, target.att);
  // "Power dmg" affix amplifies the wielder's own attunement attacks (any attunement).
  if (actor.solPct) raw *= 1 + actor.solPct / 100;
  // V3 ability scaling: GEAR primaries amplify all ability output by the Attunement's tier (systems/stats).
  // Zero with no gear, so a fresh hero is unchanged — gear primaries are the new damage axis.
  if (actor.abp) raw *= 1 + actor.abp;
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
  // V3 Execute: extra damage to a target below 20% HP.
  const ao = actor.sub;
  if (ao && ao.Exe && target.maxhp > 0 && target.hp / target.maxhp < 0.2) raw *= 1 + ao.Exe / 100;
  const critC = (actor.critPct || 5) + (s && s.crit ? s.crit : 0) + (actor.att === "QUANTA" ? 10 : 0);
  const crit = rng() * 100 < critC;
  if (crit) raw *= 1.8 + (ao && ao.Cmd ? ao.Cmd / 100 : 0); // Crit Damage adds to the crit multiplier
  // MATTER mitigation = physical armor, cut by Matter Penetration. ENERGY ignores physical armor
  // (it's answered by Energy Reduction below).
  let eff = target.armor;
  if (!energy && ao && ao.Mpn) eff *= 1 - Math.min(80, ao.Mpn) / 100;
  let dmg = Math.max(1, Math.round(raw - (energy ? 0 : eff * 0.6)));
  // UMBRAXIS MNA scales the defender's damage reduction.
  if (target.mna && target.mna.UMBRAXIS) dmg = Math.max(1, Math.round(dmg * (1 - mnaBonus(target.mna.UMBRAXIS))));
  // Defender mitigation: Evasion (halve ANY hit) then the typed % Reduction — Matter Reduction vs
  // Energy Reduction (the latter penetrable by the attacker's Energy Penetration).
  if (td) {
    if (rng() * 100 < Math.min(60, td.Eva)) dmg = Math.max(1, Math.round(dmg * 0.5));
    if (energy) {
      let erd = Math.min(75, td.Erd || 0);
      if (ao && ao.Epn) erd *= 1 - Math.min(80, ao.Epn) / 100;
      if (erd > 0) dmg = Math.max(1, Math.round(dmg * (1 - erd / 100)));
    } else if (td.Mrd) {
      dmg = Math.max(1, Math.round(dmg * (1 - Math.min(75, td.Mrd) / 100)));
    }
  }
  if (target.guarding) dmg = Math.round(dmg * 0.5);
  if (hasStatus(target.statuses, "barrier")) dmg = Math.max(1, dmg - (target.wardAmt || 0));
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

/** Roll N distinct elite affixes onto an enemy (mutates eliteAffixes + applies stat effects). */
function applyAffixes(e: Enemy, n: number, rng: Rng = Math.random): void {
  const used = (e.eliteAffixes = e.eliteAffixes || []);
  for (let i = 0; i < n; i++) {
    const a = pickR(rng, ELITE_AFFIXES.filter((x) => !used.includes(x.key)));
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
export function makeEnemy(key: string, _idx: number, _isBossBattle: boolean, depth = 0, champion = false, rng: Rng = Math.random): Enemy {
  const d = ENEMIES[key];
  // V3 (ADR 0018): stats DERIVE from (role, level). `depth` (0–1, how far into the zone) lifts the
  // EFFECTIVE level (DEPTH_LEVELS) — replacing the old HP/ATK depth-scale AND the std-HP trash cut,
  // which now live in the role HP/ATK multipliers (systems/enemyStats). Champion/elite affixes apply
  // after, on the derived magnitudes.
  const effLvl = d.lvl + DEPTH_LEVELS * clamp(depth, 0, 1);
  const b = enemyBlock(d.att, d.role, effLvl, d.lean);
  const champHp = champion ? 1.4 : 1;
  const champAtk = champion ? 1.3 : 1;
  const hp = Math.round(b.maxhp * champHp * ENEMY_HP_EASE);
  const atk = Math.round(b.atk * champAtk * ENEMY_ATK_EASE);
  const mag = Math.round(b.mag * champAtk * ENEMY_ATK_EASE);
  const e: Enemy = {
    key, name: d.name, spr: d.spr, att: d.att, lvl: d.lvl, side: "enemy", // champion marker is a render concern
    maxhp: hp, hp, atk, spd: b.spd, armor: b.armor + (champion ? 2 : 0), mag,
    prim: b.prim, sub: b.sub, abp: b.abp, dmgType: d.dmgType ?? "matter",
    xpReward: champion ? Math.round(d.xp * 2.2) : d.xp,
    goldRange: champion ? [d.gold[0] * 2, d.gold[1] * 2] : d.gold,
    ai: d.ai, boss: !!d.boss, miniboss: !!d.miniboss, rare: !!d.rare, art: d.art, enrage: d.enrage,
    skills: d.skills || null, castChance: d.castChance || 0, onHitPoison: (d.onHit && d.onHit.poison) || 0,
    alive: true, atb: 0, statuses: [], critPct: b.critPct, leech: d.leech || 0, solPct: 0,
  };
  if (e.boss || e.miniboss || e.rare) return e; // rares are their own tier — no random elite roll
  if (champion) { e.champion = true; e.elite = true; applyAffixes(e, 3, rng); }
  else if (rng() < 0.22) { e.elite = true; applyAffixes(e, riR(rng, 1, 2), rng); } // elite roll
  return e;
}
