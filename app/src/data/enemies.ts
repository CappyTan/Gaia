import type { EnemyDef } from "../types";
import { clamp } from "../core/rng";

// Bestiary across both zones (Dara's canon roster). Attunements are spread across the ring so
// ANY party composition (the player builds their own — no SOL default) gets strong/weak matchups.
// Bosses are infused: the Greenvale Kingpin is SOL (per Dara's art); the Cave Troll is NOX (a
// deliberate variety pick so the final fight has a real affinity matchup vs most comps). Variants
// reuse a base creature's sprite via `art`. Stat magnitudes follow the tuned curve (balance-sim).
export const ENEMIES: Record<string, EnemyDef> = {
  // ── ZONE 1: Greenvale (levels 1-6) ──
  slime: { name: "Green Slime", spr: "🟢", att: "ANIMA", lvl: 1, hp: 64, atk: 10, spd: 6, armor: 1, mag: 0, xp: 30, gold: [4, 10], ai: "basic", onHit: { poison: 2 } },
  kobold: { name: "Kobold", spr: "🦎", att: "SOL", lvl: 2, hp: 60, atk: 11, spd: 13, armor: 1, mag: 0, xp: 38, gold: [6, 14], ai: "basic" },
  gbandit: { name: "Greenvale Bandit", spr: "🗡️", att: "NOX", lvl: 2, hp: 84, atk: 12, spd: 9, armor: 2, mag: 0, xp: 64, gold: [10, 22], ai: "basic" },
  slimebig: { name: "Bloated Slime", spr: "🟢", att: "QUANTA", lvl: 3, hp: 138, atk: 13, spd: 5, armor: 3, mag: 0, xp: 92, gold: [10, 20], ai: "basic", onHit: { poison: 3 }, art: "slime" },
  kobolde: { name: "Kobold Raider", spr: "🦎", att: "UMBRAXIS", lvl: 4, hp: 96, atk: 13, spd: 11, armor: 2, mag: 0, xp: 108, gold: [16, 28], ai: "basic", art: "kobold" },
  gmage: { name: "Greenvale Mage", spr: "🧙", att: "UMBRAXIS", lvl: 4, hp: 92, atk: 12, spd: 9, armor: 1, mag: 17, xp: 116, gold: [18, 30], ai: "caster", skills: ["hex"], castChance: 0.55 },
  brigand: { name: "Bandit Brigadier", spr: "🪖", att: "NOX", lvl: 5, hp: 520, atk: 39, spd: 8, armor: 5, mag: 0, xp: 170, gold: [60, 100], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.2, art: "gbandit" },
  kingpin: { name: "Greenvale Kingpin", spr: "👑", att: "SOL", lvl: 6, hp: 950, atk: 38, spd: 7, armor: 7, mag: 0, xp: 240, gold: [120, 180], ai: "boss", boss: true, skills: ["rally"], castChance: 0.15 },
  // ── ZONE 2: The Duskmarsh → the Drowned Vault (entered ~Lv 7-8, higher base stats) ──
  rat: { name: "Cave Rat", spr: "🐀", att: "NOX", lvl: 7, hp: 160, atk: 23, spd: 14, armor: 1, mag: 0, xp: 120, gold: [14, 28], ai: "basic" },
  spider: { name: "Cave Spider", spr: "🕷️", att: "ANIMA", lvl: 7, hp: 190, atk: 22, spd: 11, armor: 2, mag: 0, xp: 130, gold: [18, 34], ai: "basic", onHit: { poison: 3 } },
  leper: { name: "Cave Leper", spr: "🧟", att: "UMBRAXIS", lvl: 8, hp: 238, atk: 22, spd: 6, armor: 3, mag: 0, xp: 180, gold: [20, 38], ai: "basic", leech: 30 },
  direrat: { name: "Dire Rat", spr: "🐀", att: "QUANTA", lvl: 8, hp: 196, atk: 24, spd: 13, armor: 2, mag: 0, xp: 185, gold: [18, 32], ai: "basic", art: "rat" },
  bonespider: { name: "Bone Spider", spr: "🕷️", att: "NOX", lvl: 9, hp: 256, atk: 26, spd: 9, armor: 5, mag: 0, xp: 200, gold: [24, 42], ai: "basic", onHit: { poison: 4 }, art: "spider" },
  broodmother: { name: "Vault Broodmother", spr: "🕷️", att: "UMBRAXIS", lvl: 9, hp: 1260, atk: 66, spd: 8, armor: 7, mag: 0, xp: 320, gold: [120, 200], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "spider" },
  troll: { name: "Cave Troll", spr: "👹", att: "NOX", lvl: 10, hp: 2650, atk: 72, spd: 8, armor: 10, mag: 6, xp: 420, gold: [260, 400], ai: "boss", boss: true, skills: ["rally"], castChance: 0.22 },
  // ── ULTRA-RARE treasure monsters (Metal-Slime / Warmech tier): very rare spawns, exceptional
  //    loot. Tough but beatable, with outsized XP/gold. ──
  hogger: { name: "Hogger", spr: "🐗", att: "ANIMA", lvl: 4, hp: 440, atk: 24, spd: 10, armor: 6, mag: 0, xp: 620, gold: [90, 170], ai: "basic", rare: true },
  // Metal-Slime classics (Dara's metallic redraws): tiny HP but enormous armor (hits chip for ~1
  // unless you crit / hit affinity), fast, weak attackers — pure XP/loot jackpots.
  metalslime: { name: "Metal Slime", spr: "🪙", att: "QUANTA", lvl: 3, hp: 22, atk: 7, spd: 18, armor: 45, mag: 0, xp: 420, gold: [40, 90], ai: "evasive", rare: true },
  metalbabble: { name: "Metal Babble", spr: "🪙", att: "UMBRAXIS", lvl: 7, hp: 38, atk: 13, spd: 20, armor: 65, mag: 0, xp: 900, gold: [100, 240], ai: "evasive", rare: true },
  // Warmech (FF1 homage): an ancient war-construct — canon home is Titan Prime (future zone); for
  // now it stalks the Duskmarsh as a genuinely dangerous, tanky, hard-hitting rare with a huge hoard.
  warmech: { name: "Warmech", spr: "🤖", att: "QUANTA", lvl: 9, hp: 1300, atk: 44, spd: 9, armor: 12, mag: 0, xp: 1500, gold: [220, 420], ai: "basic", rare: true },
};

// Pool of ultra-rare monsters eligible to crash a random encounter, with the zone index they
// can appear in. Kept tiny + data-driven — add an entry to introduce a new rare.
export const RARE_MONSTERS: { key: string; zones: number[] }[] = [
  { key: "hogger", zones: [0] },     // Hogger prowls Greenvale
  { key: "metalslime", zones: [0] }, // Metal Slime — Greenvale
  { key: "metalbabble", zones: [1] }, // Metal Babble — the Drowned Vault (rarer, richer)
  { key: "warmech", zones: [1] },     // Warmech — Duskmarsh (until Titan Prime exists)
];
// Chance a random (non-boss) encounter is replaced by an eligible ultra-rare monster.
export const RARE_ENCOUNTER_CHANCE = 0.04;

// Enemies scale with DEPTH (how far east through a zone you are) so they keep pace with the
// party's level + gear growth. HP scales HARD (enemies survive the party's burst and keep
// acting = steady pressure); ATK scales GENTLY (hits chip instead of one-shotting squishies).
// Base stats are tuned for the zone START. Tuned via app/tools/balance-sim.ts.
// ATK_DEPTH 1.05->0.83: the deep-end ATK ramp was the dominant WIPE driver — at depth, champion
// packs (rally/atkup) + crits compounded into one-shot spikes that wiped otherwise-healthy parties.
// Flattening the ATK ramp keeps deep fights pressuring via HP/length (steady chip) instead of
// lethal burst, which is what smooths the curve (full-clear wipe ~13%->~9%) without sponging.
export const HP_DEPTH = 1.25;
export const ATK_DEPTH = 0.83;
export const depthHpScale = (d: number): number => 1 + clamp(d, 0, 1) * HP_DEPTH;
export const depthAtkScale = (d: number): number => 1 + clamp(d, 0, 1) * ATK_DEPTH;
