import type { EnemyDef } from "../types";
import { clamp } from "../core/rng";

// Bestiary across both zones. Attunement is chosen so the all-SOL party feels the ring:
// SOL is STRONG vs NOX (+50%), WEAK vs UMBRAXIS (-50%), neutral vs ANIMA/QUANTA/SOL.
export const ENEMIES: Record<string, EnemyDef> = {
  // ── ZONE 1: Greenvale (levels 1-6) ──
  bandit: { name: "Highway Bandit", spr: "🗡️", att: "NOX", lvl: 1, hp: 40, atk: 11, spd: 8, armor: 1, mag: 0, xp: 42, gold: [6, 14], ai: "basic" },
  wolf: { name: "Gray Wolf", spr: "🐺", att: "ANIMA", lvl: 1, hp: 30, atk: 12, spd: 14, armor: 0, mag: 0, xp: 36, gold: [3, 8], ai: "basic" },
  cutpurse: { name: "Thieves' Cutpurse", spr: "🥷", att: "UMBRAXIS", lvl: 2, hp: 52, atk: 13, spd: 12, armor: 2, mag: 0, xp: 62, gold: [10, 22], ai: "evasive" },
  wisp: { name: "Forest Wisp", spr: "💠", att: "QUANTA", lvl: 2, hp: 34, atk: 9, spd: 13, armor: 0, mag: 12, xp: 58, gold: [6, 12], ai: "evasive", skills: ["hex"], castChance: 0.5 },
  marauder: { name: "Marauder", spr: "🪓", att: "ANIMA", lvl: 3, hp: 80, atk: 16, spd: 7, armor: 3, mag: 0, xp: 90, gold: [14, 26], ai: "basic" },
  lurker: { name: "Bog Lurker", spr: "🦎", att: "NOX", lvl: 3, hp: 88, atk: 14, spd: 6, armor: 4, mag: 0, xp: 95, gold: [12, 22], ai: "basic", onHit: { poison: 3 } },
  archer: { name: "Outlaw Archer", spr: "🏹", att: "QUANTA", lvl: 4, hp: 66, atk: 17, spd: 10, armor: 2, mag: 2, xp: 104, gold: [16, 28], ai: "basic" },
  shade: { name: "Hollow Shade", spr: "👻", att: "UMBRAXIS", lvl: 4, hp: 64, atk: 16, spd: 10, armor: 2, mag: 4, xp: 110, gold: [14, 26], ai: "basic", leech: 35 },
  shaman: { name: "Bandit Shaman", spr: "🧙", att: "ANIMA", lvl: 4, hp: 60, atk: 11, spd: 9, armor: 1, mag: 14, xp: 115, gold: [18, 30], ai: "caster", skills: ["mend"], castChance: 0.55 },
  captain: { name: "Brigand Captain", spr: "🪖", att: "NOX", lvl: 5, hp: 560, atk: 29, spd: 8, armor: 5, mag: 0, xp: 170, gold: [60, 100], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.4 },
  brute: { name: "Bandit Brute", spr: "💀", att: "NOX", lvl: 6, hp: 1000, atk: 37, spd: 7, armor: 8, mag: 0, xp: 240, gold: [120, 180], ai: "boss", boss: true },
  // ── ZONE 2: The Duskmarsh (entered ~Lv 7-8, so higher base stats; no real art yet -> emoji) ──
  serpent: { name: "Mire Serpent", spr: "🐍", att: "ANIMA", lvl: 7, hp: 115, atk: 28, spd: 13, armor: 1, mag: 0, xp: 155, gold: [16, 30], ai: "basic", onHit: { poison: 3 } },
  husk: { name: "Drowned Husk", spr: "🧟", att: "UMBRAXIS", lvl: 7, hp: 155, atk: 24, spd: 6, armor: 3, mag: 0, xp: 170, gold: [20, 38], ai: "basic", leech: 30 },
  gloomwisp: { name: "Gloom Wisp", spr: "👁️", att: "QUANTA", lvl: 8, hp: 92, atk: 17, spd: 13, armor: 0, mag: 22, xp: 170, gold: [14, 26], ai: "evasive", skills: ["hex"], castChance: 0.5 },
  fenwitch: { name: "Fen Witch", spr: "🧙‍♀️", att: "ANIMA", lvl: 8, hp: 124, atk: 17, spd: 9, armor: 1, mag: 24, xp: 190, gold: [28, 46], ai: "caster", skills: ["mend"], castChance: 0.55 },
  knight: { name: "Sunken Knight", spr: "⚰️", att: "NOX", lvl: 8, hp: 205, atk: 31, spd: 6, armor: 6, mag: 0, xp: 190, gold: [24, 42], ai: "basic" },
  fenwarden: { name: "Fen Warden", spr: "🐲", att: "NOX", lvl: 9, hp: 1120, atk: 40, spd: 8, armor: 7, mag: 0, xp: 320, gold: [120, 200], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.4 },
  vorn: { name: "Mirelord Vorn", spr: "👹", att: "ANIMA", lvl: 10, hp: 2600, atk: 50, spd: 7, armor: 10, mag: 6, xp: 420, gold: [260, 400], ai: "boss", boss: true, skills: ["rally"], castChance: 0.35 },
};

// Enemies scale with DEPTH (how far east through a zone you are) so they keep pace with the
// party's level + gear growth. HP scales HARD (enemies survive the party's burst and keep
// acting = steady pressure); ATK scales GENTLY (hits chip instead of one-shotting squishies).
// Base stats are tuned for the zone START. Tuned via app/tools/balance-sim.ts.
export const HP_DEPTH = 1.6;
export const ATK_DEPTH = 1.2;
export const depthHpScale = (d: number): number => 1 + clamp(d, 0, 1) * HP_DEPTH;
export const depthAtkScale = (d: number): number => 1 + clamp(d, 0, 1) * ATK_DEPTH;
