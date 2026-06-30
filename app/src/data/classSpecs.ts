// Re-encoded 52-slot class specs (ADR 0020) — the structured build input the band→number generator
// (systems/classGen) consumes. Faithfully transcribed from the numberless markdown design specs
// (docs/design/classes/*.md), which stay the human design record. This is the v3/classes VERTICAL
// SLICE: the first class fully re-encoded to prove the complete pipeline on real content; the other
// four slice classes (one per Attunement) are the same mechanical transcription.

import type { ClassSpec } from "./classSpec";

// ── SOL × Staff — Heliomancer (docs/design/classes/sol-staff.md). Back-line artillery; Burn/Blind. ──
export const HELIOMANCER: ClassSpec = {
  att: "SOL",
  archetype: "Staff",
  name: "Heliomancer",
  abilities: [
    // auto
    { name: "Sunbolt", tier: "auto", milestone: 0, type: "mag", target: "enemy", effect: "A small bolt of light.", gen: "minor", cooldown: "none" },
    // specials (10 milestones × 2)
    { name: "Firebolt", tier: "special", lane: "A", milestone: 5, type: "mag", target: "enemy", effect: "A flaming bolt; applies Burn.", status: "burn", gen: "moderate", cooldown: "short" },
    { name: "Sunbeam", tier: "special", lane: "B", milestone: 5, type: "mag", target: "enemy", effect: "A focused beam; bonus vs Blinded.", gen: "moderate", cooldown: "short" },
    { name: "Photon Lance", tier: "special", lane: "B", milestone: 15, type: "mag", target: "enemy", effect: "A piercing beam of light.", gen: "moderate", cooldown: "short" },
    { name: "Flash", tier: "special", lane: "C", milestone: 15, type: "util", target: "allEnemies", effect: "A burst of light; Blinds nearby foes.", status: "blind", gen: "moderate", cooldown: "short" },
    { name: "Scorch", tier: "special", lane: "A", milestone: 25, type: "mag", target: "enemy", effect: "Burn that spreads to an adjacent foe.", status: "burn", gen: "moderate", cooldown: "short" },
    { name: "Flare Ring", tier: "special", lane: "C", milestone: 25, type: "mag", target: "allEnemies", effect: "A radiant ring; light damage + Scorched.", gen: "moderate", cooldown: "medium" },
    { name: "Wildflame", tier: "special", lane: "A", milestone: 35, type: "mag", target: "allEnemies", effect: "Fire that jumps between foes (spread Burn).", status: "burn", gen: "moderate", cooldown: "medium" },
    { name: "Pierce Light", tier: "special", lane: "B", milestone: 35, type: "mag", target: "enemy", effect: "A beam that ignores some resistance; crit-leaning.", gen: "moderate", cooldown: "medium" },
    { name: "Sunspear", tier: "special", lane: "B", milestone: 45, type: "mag", target: "enemy", effect: "A heavy single-target bolt.", gen: "major", cooldown: "medium" },
    { name: "Solar Glare", tier: "special", lane: "C", milestone: 45, type: "util", target: "allEnemies", effect: "Blind all foes + light Scorched.", status: "blind", gen: "moderate", cooldown: "medium" },
    { name: "Ember Spread", tier: "special", lane: "A", milestone: 55, type: "mag", target: "allEnemies", effect: "Spread existing Burn across foes.", status: "burn", gen: "moderate", cooldown: "medium" },
    { name: "Heatwave", tier: "special", lane: "C", milestone: 55, type: "mag", target: "allEnemies", effect: "A wave of heat; escalating field damage.", gen: "major", cooldown: "medium" },
    { name: "Combust", tier: "special", lane: "A", milestone: 65, type: "mag", target: "enemy", effect: "Detonate the target's Burn; splash to neighbors.", status: "burn", gen: "moderate", cooldown: "medium" },
    { name: "Lightlance", tier: "special", lane: "B", milestone: 65, type: "mag", target: "enemy", effect: "A precise lance; guaranteed crit vs Blinded.", gen: "moderate", cooldown: "medium" },
    { name: "Sunpiercer", tier: "special", lane: "B", milestone: 75, type: "mag", target: "enemy", effect: "A beam through the target and the one behind it.", gen: "major", cooldown: "medium" },
    { name: "Solar Field", tier: "special", lane: "C", milestone: 75, type: "util", target: "allEnemies", effect: "A lingering light field: Blind + area damage.", status: "blind", gen: "moderate", cooldown: "long" },
    { name: "Emberstorm", tier: "special", lane: "A", milestone: 85, type: "mag", target: "allEnemies", effect: "A storm of embers; spreading Burn.", status: "burn", gen: "major", cooldown: "medium" },
    { name: "Blinding Light", tier: "special", lane: "C", milestone: 85, type: "util", target: "allEnemies", effect: "Intense Blind; enemy accuracy crashes.", status: "blind", gen: "moderate", cooldown: "medium" },
    { name: "Hellfire", tier: "special", lane: "A", milestone: 95, type: "mag", target: "allEnemies", effect: "Raining fire; heavy Burn on all foes.", status: "burn", gen: "major", cooldown: "medium" },
    { name: "Sunlance", tier: "special", lane: "B", milestone: 95, type: "mag", target: "enemy", effect: "A massive focused beam.", gen: "major", cooldown: "medium" },
    // signatures (9 milestones × 2)
    { name: "Ignition", tier: "signature", lane: "A", milestone: 10, type: "mag", target: "enemy", effect: "Heavy Burn.", status: "burn", cost: "med", cooldown: "medium" },
    { name: "Searing Ray", tier: "signature", lane: "B", milestone: 10, type: "mag", target: "enemy", effect: "A burning beam; big single-target.", status: "burn", cost: "med", cooldown: "medium" },
    { name: "Sunstrike", tier: "signature", lane: "B", milestone: 20, type: "mag", target: "enemy", effect: "A strike from above; bonus vs Blinded.", cost: "med", cooldown: "medium" },
    { name: "Daystar", tier: "signature", lane: "C", milestone: 20, type: "mag", target: "allEnemies", effect: "A blinding flash; AoE light + Blind.", status: "blind", cost: "med", cooldown: "long" },
    { name: "Blaze", tier: "signature", lane: "A", milestone: 30, type: "mag", target: "allEnemies", effect: "Spread Burn to all foes.", status: "burn", cost: "med", cooldown: "long" },
    { name: "Sunburst", tier: "signature", lane: "C", milestone: 30, type: "mag", target: "allEnemies", effect: "A radiant burst; AoE damage + Blind.", status: "blind", cost: "med", cooldown: "medium" },
    { name: "Firewave", tier: "signature", lane: "A", milestone: 40, type: "mag", target: "allEnemies", effect: "Detonate all Burn on the field.", status: "burn", cost: "med", cooldown: "medium" },
    { name: "Solar Beam", tier: "signature", lane: "B", milestone: 40, type: "mag", target: "enemy", effect: "A charged beam; massive single-target.", cost: "med", cooldown: "medium" },
    { name: "Lance of Dawn", tier: "signature", lane: "B", milestone: 50, type: "mag", target: "enemy", effect: "A piercing execution beam; bonus vs low-HP foes.", cost: "high", cooldown: "medium" },
    { name: "Solar Storm", tier: "signature", lane: "C", milestone: 50, type: "mag", target: "allEnemies", effect: "A storm of light; AoE damage + Blind all.", status: "blind", cost: "high", cooldown: "medium" },
    { name: "Cinderfall", tier: "signature", lane: "A", milestone: 60, type: "mag", target: "allEnemies", effect: "Raining cinders: heavy spreading Burn.", status: "burn", cost: "high", cooldown: "medium" },
    { name: "Radiance", tier: "signature", lane: "C", milestone: 60, type: "util", target: "allEnemies", effect: "Blinding radiance: Blind all foes; brief party accuracy up.", status: "blind", cost: "med", cooldown: "medium" },
    { name: "Firenova", tier: "signature", lane: "A", milestone: 70, type: "mag", target: "allEnemies", effect: "A nova of fire; AoE + Burn.", status: "burn", cost: "high", cooldown: "long" },
    { name: "Starfall Beam", tier: "signature", lane: "B", milestone: 70, type: "mag", target: "enemy", effect: "A beam of starfire; enormous single-target.", cost: "high", cooldown: "long" },
    { name: "Apex Ray", tier: "signature", lane: "B", milestone: 80, type: "mag", target: "enemy", effect: "Peak-power beam; guaranteed crit.", cost: "high", cooldown: "long" },
    { name: "Sunstorm", tier: "signature", lane: "C", milestone: 80, type: "mag", target: "allEnemies", effect: "A relentless sun-storm: AoE damage + Blind over time.", status: "blind", cost: "high", cooldown: "long" },
    { name: "Worldfire", tier: "signature", lane: "A", milestone: 90, type: "mag", target: "allEnemies", effect: "The field ignites — max Burn on all, detonating.", status: "burn", cost: "high", cooldown: "long" },
    { name: "Solar Zenith", tier: "signature", lane: "C", milestone: 90, type: "mag", target: "allEnemies", effect: "The sun at noon: massive AoE light + total Blind.", status: "blind", cost: "high", cooldown: "long" },
    // ultimates (@100, pick 2 of 4 — 3 laned + 1 neutral)
    { name: "Solar Flare", tier: "ultimate", lane: "A", milestone: 100, type: "mag", target: "allEnemies", effect: "Unleash a solar flare — max Burn on all foes, detonated in a chain.", status: "burn", cost: "high", cooldown: "long" },
    { name: "Death Ray", tier: "ultimate", lane: "B", milestone: 100, type: "mag", target: "enemy", effect: "A beam of pure starfire — colossal single-target piercing all resistance.", cost: "high", cooldown: "long" },
    { name: "Solar Apocalypse", tier: "ultimate", lane: "C", milestone: 100, type: "mag", target: "allEnemies", effect: "The sky becomes a sun — sustained AoE light, Blinding and burning the field.", status: "blind", cost: "high", cooldown: "long" },
    { name: "Heliosphere", tier: "ultimate", milestone: 100, type: "mag", target: "allEnemies", effect: "Become a small star: a blast that Burns, Blinds, and spreads across all foes.", status: "burn", cost: "high", cooldown: "long" },
    // passives (3 sets × 3, pick 1 each @30/60/90)
    { name: "Pyromania", tier: "passive", lane: "A", milestone: 30, type: "util", target: "self", effect: "Your Burns spread to more foes." },
    { name: "Focus", tier: "passive", lane: "B", milestone: 30, type: "util", target: "self", effect: "Your beams crit more." },
    { name: "Glare", tier: "passive", lane: "C", milestone: 30, type: "util", target: "self", effect: "Your Blinds last longer." },
    { name: "Chain Ignition", tier: "passive", lane: "A", milestone: 60, type: "util", target: "self", effect: "Your Burn detonations chain further." },
    { name: "Pierce", tier: "passive", lane: "B", milestone: 60, type: "util", target: "self", effect: "Your beams ignore more resistance." },
    { name: "Sunsoaked", tier: "passive", lane: "C", milestone: 60, type: "util", target: "self", effect: "Your light fields deal more over time." },
    { name: "Eternal Flame", tier: "passive", lane: "A", milestone: 90, type: "util", target: "self", effect: "Your Burns don't expire while you keep dealing fire." },
    { name: "Solar Focus", tier: "passive", lane: "B", milestone: 90, type: "util", target: "self", effect: "More single-target damage vs a lone or Blinded foe." },
    { name: "Daylight", tier: "passive", lane: "C", milestone: 90, type: "util", target: "self", effect: "Your Blinds also reduce enemy accuracy further." },
  ],
};

/** The vertical-slice class specs (one per Attunement is the target; Heliomancer is the first, fully
 *  re-encoded). Add the other four here as they're transcribed — the generator + lint handle them
 *  uniformly. */
export const SLICE_SPECS: ClassSpec[] = [HELIOMANCER];
