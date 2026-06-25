import type { MemberDef, Stats, Row } from "../types";
import { kitFor } from "./classes";

// The default suggested party of five — 3 front line, 2 back line (ADR 0003) — spread across
// Attunements so nothing leans on any one power; the player rebuilds any slot (any Attunement ×
// Archetype) at the start in the Roster picker. Each hero's kit is its class kit (kitFor); the
// healer keeps SOL Staff for a reliable heal line.
export const PARTY_DEFS: MemberDef[] = [
  { id: "dawnguard", name: "Auren", cls: "Sword & Shield", att: "SOL", role: "Tank", spr: "🛡️", row: "front",
    base: { hp: 62, mp: 14, atk: 10, spd: 6, armor: 6, mag: 4 }, growth: { hp: 9, mp: 2, atk: 2, spd: 0.6, armor: 1.2, mag: 0.5 }, skills: [] },
  { id: "sunblade", name: "Kaela", cls: "Dual Swords", att: "NOX", role: "DPS", spr: "⚔️", row: "front",
    base: { hp: 44, mp: 14, atk: 14, spd: 11, armor: 2, mag: 5 }, growth: { hp: 6, mp: 2, atk: 3, spd: 1.1, armor: 0.7, mag: 0.6 }, skills: [] },
  { id: "dawnchaser", name: "Rion", cls: "Spellblade", att: "ANIMA", role: "Hybrid", spr: "✨", row: "front",
    base: { hp: 48, mp: 22, atk: 11, spd: 9, armor: 3, mag: 10 }, growth: { hp: 7, mp: 3, atk: 2, spd: 0.9, armor: 0.7, mag: 1.4 }, skills: [] },
  { id: "lightkeeper", name: "Sephi", cls: "Staff", att: "SOL", role: "Healer", spr: "🔮", row: "back",
    base: { hp: 36, mp: 30, atk: 6, spd: 8, armor: 1, mag: 13 }, growth: { hp: 5, mp: 5, atk: 1, spd: 0.8, armor: 0.6, mag: 2.2 }, skills: [] },
  { id: "sunsinger", name: "Liora", cls: "Staff", att: "QUANTA", role: "Caster", spr: "☀️", row: "back",
    base: { hp: 34, mp: 28, atk: 6, spd: 9, armor: 1, mag: 14 }, growth: { hp: 5, mp: 5, atk: 1, spd: 0.9, armor: 0.6, mag: 2.3 }, skills: [] },
];
// Fill each default hero's kit from its class (Attunement × Archetype).
PARTY_DEFS.forEach((d) => { d.skills = kitFor(d.att, d.cls) ?? d.skills; });

// Per-archetype stat template (role / default row / sprite / base / growth) used to build a hero
// of any Attunement × Archetype in the Roster picker. Attunement only swaps the ability kit
// (via kitFor) and the affinity colour — the body/stat profile come from the archetype.
export interface Archetype { role: string; row: Row; spr: string; base: Stats; growth: Stats; }
export const ARCHETYPES: Record<string, Archetype> = {
  "Sword & Shield": { role: "Tank", row: "front", spr: "🛡️", base: { hp: 62, mp: 14, atk: 10, spd: 6, armor: 6, mag: 4 }, growth: { hp: 9, mp: 2, atk: 2, spd: 0.6, armor: 1.2, mag: 0.5 } },
  "Dual Swords": { role: "DPS", row: "front", spr: "⚔️", base: { hp: 44, mp: 14, atk: 14, spd: 11, armor: 2, mag: 5 }, growth: { hp: 6, mp: 2, atk: 3, spd: 1.1, armor: 0.7, mag: 0.6 } },
  "Two-Handed Sword": { role: "Breaker", row: "front", spr: "🗡️", base: { hp: 54, mp: 14, atk: 16, spd: 7, armor: 3, mag: 5 }, growth: { hp: 8, mp: 2, atk: 3.2, spd: 0.7, armor: 0.8, mag: 0.6 } },
  "Hammer": { role: "Breaker", row: "front", spr: "🔨", base: { hp: 58, mp: 12, atk: 17, spd: 5, armor: 5, mag: 3 }, growth: { hp: 9, mp: 1.6, atk: 3.2, spd: 0.5, armor: 1.0, mag: 0.4 } },
  "Dual Daggers": { role: "Rogue", row: "front", spr: "🗡", base: { hp: 40, mp: 14, atk: 13, spd: 13, armor: 1, mag: 5 }, growth: { hp: 5.5, mp: 2, atk: 2.8, spd: 1.2, armor: 0.6, mag: 0.6 } },
  "Dual Pistols": { role: "Gunner", row: "back", spr: "🔫", base: { hp: 42, mp: 16, atk: 13, spd: 11, armor: 1, mag: 6 }, growth: { hp: 6, mp: 2, atk: 2.8, spd: 1.0, armor: 0.6, mag: 0.8 } },
  "Rifle": { role: "Marksman", row: "back", spr: "🎯", base: { hp: 40, mp: 16, atk: 15, spd: 9, armor: 1, mag: 6 }, growth: { hp: 6, mp: 2, atk: 3.0, spd: 0.9, armor: 0.6, mag: 0.8 } },
  "Staff": { role: "Caster", row: "back", spr: "🔮", base: { hp: 36, mp: 30, atk: 6, spd: 8, armor: 1, mag: 13 }, growth: { hp: 5, mp: 5, atk: 1, spd: 0.8, armor: 0.6, mag: 2.2 } },
  "Spellblade": { role: "Hybrid", row: "front", spr: "✨", base: { hp: 48, mp: 22, atk: 11, spd: 9, armor: 3, mag: 10 }, growth: { hp: 7, mp: 3, atk: 2, spd: 0.9, armor: 0.7, mag: 1.4 } },
};
export const ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

// Build a hero def from a chosen Attunement × Archetype, keeping a fixed slot name/id (identity).
export function buildDef(id: string, name: string, att: MemberDef["att"], cls: string, row: Row): MemberDef {
  const a = ARCHETYPES[cls] ?? ARCHETYPES["Sword & Shield"];
  return { id, name, cls, att, role: a.role, spr: a.spr, row, base: { ...a.base }, growth: { ...a.growth }, skills: [] };
}
