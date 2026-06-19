import type { Skill } from "../types";

// ATB commands beyond Attack. unlock = level at which it's learned.
// target: "enemy"|"allEnemies"|"ally"|"allAllies"|"self". power scales vs ATK or MAG.
export const SKILLS: Record<string, Skill> = {
  // Sword & Shield (tank)
  shieldBash: { name: "Shield Bash", mp: 4, target: "enemy", unlock: 1, type: "phys", power: 1.1, status: { stun: 1 }, desc: "Smash one foe; may stun." },
  guard: { name: "Guard", mp: 0, target: "self", unlock: 1, type: "buff", buff: { def: 1 }, desc: "Brace: take half damage this turn." },
  taunt: { name: "Sun Bulwark", mp: 6, target: "allAllies", unlock: 3, type: "buff", buff: { wardArmor: 6, turns: 3 }, desc: "+6 armor to the party (3 turns)." },
  radiantSmite: { name: "Radiant Smite", mp: 12, target: "enemy", unlock: 5, type: "phys", power: 2.4, sol: true, desc: "A heavy SOL strike." },
  aegisDawn: { name: "Aegis of Dawn", mp: 16, target: "allAllies", unlock: 8, type: "buff", buff: { wardArmor: 12, turns: 3 }, desc: "+12 armor to the party (3 turns)." },
  sunbreaker: { name: "Sunbreaker", mp: 22, target: "enemy", unlock: 11, type: "phys", power: 3.6, sol: true, status: { stun: 1 }, desc: "A crushing SOL blow; may stun." },
  // Dual Swords (DPS)
  twinSlash: { name: "Twin Slash", mp: 4, target: "enemy", unlock: 1, type: "phys", power: 0.7, hits: 2, desc: "Two quick strikes." },
  flurry: { name: "Flurry", mp: 8, target: "enemy", unlock: 3, type: "phys", power: 0.5, hits: 4, desc: "Four blinding cuts." },
  solarFlareB: { name: "Solar Flare", mp: 10, target: "allEnemies", unlock: 4, type: "mag", power: 1.2, sol: true, status: { burn: 2 }, desc: "SOL burst, all foes; Burn." },
  eclipse: { name: "Eclipse Strike", mp: 14, target: "enemy", unlock: 6, type: "phys", power: 3.0, crit: 40, desc: "High crit-chance finisher." },
  sunderCombo: { name: "Sunder Combo", mp: 14, target: "enemy", unlock: 8, type: "phys", power: 0.62, hits: 5, desc: "Five blistering strikes." },
  radiantTempest: { name: "Radiant Tempest", mp: 20, target: "allEnemies", unlock: 11, type: "mag", power: 1.7, sol: true, status: { burn: 2 }, desc: "A storm of SOL blades on all foes; Burn." },
  // Staff (caster/healer)
  heal: { name: "Heal", mp: 5, target: "ally", unlock: 1, type: "heal", power: 1.4, desc: "Restore one ally's HP." },
  sunbolt: { name: "Sunbolt", mp: 4, target: "enemy", unlock: 1, type: "mag", power: 1.3, sol: true, status: { burn: 2 }, desc: "SOL bolt; Burn." },
  cleanse: { name: "Cleanse", mp: 6, target: "ally", unlock: 3, type: "util", cleanse: true, desc: "Remove an ally's debuffs." },
  dawnsLight: { name: "Dawn's Light", mp: 14, target: "allAllies", unlock: 5, type: "heal", power: 0.9, status: { regen: 3 }, desc: "Heal the party; grant Regen." },
  renewingDawn: { name: "Renewing Dawn", mp: 18, target: "allAllies", unlock: 8, type: "heal", power: 1.3, status: { regen: 3 }, desc: "A greater party heal; grant Regen." },
  solarZenith: { name: "Solar Zenith", mp: 22, target: "allEnemies", unlock: 11, type: "mag", power: 1.8, sol: true, status: { burn: 3 }, desc: "Noon-bright SOL nova on all foes; Burn." },
  // Spellblade (hybrid)
  flameStrike: { name: "Flame Strike", mp: 4, target: "enemy", unlock: 1, type: "phys", power: 1.0, sol: true, status: { burn: 2 }, desc: "Burning melee strike." },
  empower: { name: "Empower", mp: 6, target: "self", unlock: 2, type: "buff", buff: { atkup: 1, turns: 3 }, desc: "+50% ATK for 3 turns." },
  sunfire: { name: "Sunfire", mp: 8, target: "enemy", unlock: 4, type: "mag", power: 1.8, sol: true, desc: "A lance of SOL fire." },
  blindingLight: { name: "Blinding Light", mp: 10, target: "allEnemies", unlock: 5, type: "mag", power: 0.8, sol: true, status: { blind: 3 }, desc: "SOL flash; blinds all foes." },
  eclipseBrand: { name: "Eclipse Brand", mp: 16, target: "enemy", unlock: 8, type: "phys", power: 2.4, sol: true, status: { burn: 2 }, desc: "Brand a foe with searing SOL; Burn." },
  supernova: { name: "Supernova", mp: 24, target: "allEnemies", unlock: 11, type: "mag", power: 1.6, sol: true, crit: 20, desc: "A detonation of SOL on all foes; high crit." },
};
