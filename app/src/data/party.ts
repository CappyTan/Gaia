import type { MemberDef } from "../types";

// The fixed all-SOL party (ADR 0003).
export const PARTY_DEFS: MemberDef[] = [
  { id: "dawnguard", name: "Auren", cls: "Sword & Shield", att: "SOL", role: "Tank", spr: "🛡️",
    base: { hp: 62, mp: 14, atk: 10, spd: 6, armor: 6, mag: 4 }, growth: { hp: 9, mp: 2, atk: 2, spd: 0.6, armor: 1.2, mag: 0.5 },
    skills: ["shieldBash", "guard", "taunt", "radiantSmite", "aegisDawn", "sunbreaker"] },
  { id: "sunblade", name: "Kaela", cls: "Dual Swords", att: "SOL", role: "DPS", spr: "⚔️",
    base: { hp: 44, mp: 14, atk: 14, spd: 11, armor: 2, mag: 5 }, growth: { hp: 6, mp: 2, atk: 3, spd: 1.1, armor: 0.4, mag: 0.6 },
    skills: ["twinSlash", "flurry", "solarFlareB", "eclipse", "sunderCombo", "radiantTempest"] },
  { id: "lightkeeper", name: "Sephi", cls: "Staff", att: "SOL", role: "Caster", spr: "🔮",
    base: { hp: 36, mp: 30, atk: 6, spd: 8, armor: 1, mag: 13 }, growth: { hp: 5, mp: 5, atk: 1, spd: 0.8, armor: 0.3, mag: 2.2 },
    skills: ["heal", "sunbolt", "cleanse", "dawnsLight", "renewingDawn", "solarZenith"] },
  { id: "dawnchaser", name: "Rion", cls: "Spellblade", att: "SOL", role: "Hybrid", spr: "✨",
    base: { hp: 48, mp: 22, atk: 11, spd: 9, armor: 3, mag: 10 }, growth: { hp: 7, mp: 3, atk: 2, spd: 0.9, armor: 0.6, mag: 1.4 },
    skills: ["flameStrike", "empower", "sunfire", "blindingLight", "eclipseBrand", "supernova"] },
];
