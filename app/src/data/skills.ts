import type { Skill } from "../types";
import { REQUIEM_SKILLS } from "./requiem-kits";

// ATB commands beyond Attack. Abilities are gated by MNA threshold in their Attunement tree
// (`att` + `mnaReq`) rather than character level (REQUIEM canon — see mna-progression.md).
// The all-SOL POC kits live in the SOL tree; the `ult` (req 100 = Archon) is each class's
// capstone. `mp` is the cast cost (a separate resource from MNA). power scales vs ATK or MAG.
export const SKILLS: Record<string, Skill> = {
  // Sword & Shield (tank)
  guard: { name: "Guard", mp: 0, target: "self", att: "SOL", mnaReq: 0, type: "buff", buff: { def: 1 }, desc: "Brace: take half damage this turn." },
  shieldBash: { name: "Shield Bash", mp: 4, target: "enemy", att: "SOL", mnaReq: 5, type: "phys", power: 1.1, status: { stun: 1 }, desc: "Smash one foe; may stun." },
  taunt: { name: "Sun Bulwark", mp: 6, target: "allAllies", att: "SOL", mnaReq: 15, type: "buff", buff: { wardArmor: 6, turns: 3 }, desc: "+6 armor to the party (3 turns)." },
  radiantSmite: { name: "Radiant Smite", mp: 12, target: "enemy", att: "SOL", mnaReq: 40, type: "phys", power: 2.4, sol: true, desc: "A heavy SOL strike." },
  aegisDawn: { name: "Aegis of Dawn", mp: 16, target: "allAllies", att: "SOL", mnaReq: 60, type: "buff", buff: { wardArmor: 12, turns: 3 }, desc: "+12 armor to the party (3 turns)." },
  sunbreaker: { name: "Sunbreaker", mp: 22, target: "enemy", att: "SOL", mnaReq: 100, ult: true, type: "phys", power: 3.6, sol: true, status: { stun: 1 }, desc: "ULTIMATE — a crushing SOL blow; may stun." },
  // Dual Swords (DPS)
  twinSlash: { name: "Twin Slash", mp: 4, target: "enemy", att: "SOL", mnaReq: 5, type: "phys", power: 0.7, hits: 2, desc: "Two quick strikes." },
  flurry: { name: "Flurry", mp: 8, target: "enemy", att: "SOL", mnaReq: 15, type: "phys", power: 0.5, hits: 4, desc: "Four blinding cuts." },
  solarFlareB: { name: "Solar Flare", mp: 10, target: "allEnemies", att: "SOL", mnaReq: 30, type: "mag", power: 1.2, sol: true, status: { burn: 2 }, desc: "SOL burst, all foes; Burn." },
  eclipse: { name: "Eclipse Strike", mp: 14, target: "enemy", att: "SOL", mnaReq: 55, type: "phys", power: 3.0, crit: 40, desc: "High crit-chance finisher." },
  sunderCombo: { name: "Sunder Combo", mp: 14, target: "enemy", att: "SOL", mnaReq: 70, type: "phys", power: 0.62, hits: 5, desc: "Five blistering strikes." },
  radiantTempest: { name: "Radiant Tempest", mp: 20, target: "allEnemies", att: "SOL", mnaReq: 100, ult: true, type: "mag", power: 1.7, sol: true, status: { burn: 2 }, desc: "ULTIMATE — a storm of SOL blades on all foes; Burn." },
  // Staff (caster/healer)
  sunbolt: { name: "Sunbolt", mp: 4, target: "enemy", att: "SOL", mnaReq: 5, type: "mag", power: 1.3, sol: true, status: { burn: 2 }, desc: "SOL bolt; Burn." },
  heal: { name: "Heal", mp: 5, target: "ally", att: "SOL", mnaReq: 10, type: "heal", power: 1.4, desc: "Restore one ally's HP." },
  cleanse: { name: "Cleanse", mp: 6, target: "ally", att: "SOL", mnaReq: 20, type: "util", cleanse: true, desc: "Remove an ally's debuffs." },
  dawnsLight: { name: "Dawn's Light", mp: 14, target: "allAllies", att: "SOL", mnaReq: 45, type: "heal", power: 0.9, status: { regen: 3 }, desc: "Heal the party; grant Regen." },
  renewingDawn: { name: "Renewing Dawn", mp: 18, target: "allAllies", att: "SOL", mnaReq: 65, type: "heal", power: 1.3, status: { regen: 3 }, desc: "A greater party heal; grant Regen." },
  solarZenith: { name: "Solar Zenith", mp: 22, target: "allEnemies", att: "SOL", mnaReq: 100, ult: true, type: "mag", power: 1.8, sol: true, status: { burn: 3 }, desc: "ULTIMATE — a noon-bright SOL nova on all foes; Burn." },
  // Spellblade (hybrid)
  flameStrike: { name: "Flame Strike", mp: 4, target: "enemy", att: "SOL", mnaReq: 5, type: "phys", power: 1.0, sol: true, status: { burn: 2 }, desc: "Burning melee strike." },
  empower: { name: "Empower", mp: 6, target: "self", att: "SOL", mnaReq: 12, type: "buff", buff: { atkup: 1, turns: 3 }, desc: "+50% ATK for 3 turns." },
  sunfire: { name: "Sunfire", mp: 8, target: "enemy", att: "SOL", mnaReq: 30, type: "mag", power: 1.8, sol: true, desc: "A lance of SOL fire." },
  blindingLight: { name: "Blinding Light", mp: 10, target: "allEnemies", att: "SOL", mnaReq: 50, type: "mag", power: 0.8, sol: true, status: { blind: 3 }, desc: "SOL flash; blinds all foes." },
  eclipseBrand: { name: "Eclipse Brand", mp: 16, target: "enemy", att: "SOL", mnaReq: 70, type: "phys", power: 2.4, sol: true, status: { burn: 2 }, desc: "Brand a foe with searing SOL; Burn." },
  supernova: { name: "Supernova", mp: 24, target: "allEnemies", att: "SOL", mnaReq: 100, ult: true, type: "mag", power: 1.6, sol: true, crit: 20, desc: "ULTIMATE — a detonation of SOL on all foes; high crit." },

  // ── NOX kits (cold / dark / decay). Adapted from REQUIEM canon; gated by NOX MNA. ──
  // Penumbral Bastion (Sword & Shield, tank)
  noxImmutable: { name: "Immutable Stance", mp: 0, target: "self", att: "NOX", mnaReq: 0, type: "buff", buff: { def: 1 }, desc: "Brace behind dark matter; halve damage this turn." },
  noxChillBite: { name: "Chill-Bite Strike", mp: 4, target: "enemy", att: "NOX", mnaReq: 10, type: "phys", power: 1.1, status: { decay: 2 }, desc: "Cold strike; inflicts Decay." },
  noxGravityPull: { name: "Gravity Pull", mp: 6, target: "allAllies", att: "NOX", mnaReq: 35, type: "buff", buff: { wardArmor: 7, turns: 3 }, desc: "Vacuum slam; +7 armor to the party (3 turns)." },
  noxAbsoluteZero: { name: "Absolute Zero Ward", mp: 14, target: "allAllies", att: "NOX", mnaReq: 65, type: "buff", buff: { wardArmor: 13, turns: 3 }, desc: "Dark-matter barrier; +13 armor to the party (3 turns)." },
  noxPenumbralCollapse: { name: "Penumbral Collapse", mp: 22, target: "allEnemies", att: "NOX", mnaReq: 100, ult: true, type: "mag", power: 1.7, status: { decay: 3 }, desc: "ULTIMATE — cold+dark nova on all foes; deep Decay." },
  // Rimewalker (Dual Swords, DPS)
  noxFrostLace: { name: "Frost-Lace", mp: 4, target: "enemy", att: "NOX", mnaReq: 0, type: "phys", power: 0.7, hits: 2, desc: "Dual cold pierce, two hits." },
  noxSingularityStep: { name: "Singularity Step", mp: 6, target: "enemy", att: "NOX", mnaReq: 10, type: "phys", power: 1.5, desc: "Shadow-step strike to a single foe." },
  noxGlacialFlurry: { name: "Blizzard Flurry", mp: 10, target: "enemy", att: "NOX", mnaReq: 35, type: "phys", power: 0.5, hits: 4, status: { decay: 2 }, desc: "Four cold strikes; Decay." },
  noxRimeEdge: { name: "Rime Edge", mp: 14, target: "enemy", att: "NOX", mnaReq: 65, type: "phys", power: 3.0, crit: 40, desc: "High-crit frozen finisher." },
  noxGreatStillness: { name: "The Great Stillness", mp: 22, target: "allEnemies", att: "NOX", mnaReq: 100, ult: true, type: "phys", power: 1.6, crit: 25, status: { decay: 2 }, desc: "ULTIMATE — absolute-zero dash through all foes; high crit." },
  // Null Absolutionist (Staff, caster — control/damage, no heal)
  noxVoidBolt: { name: "Void Bolt", mp: 4, target: "enemy", att: "NOX", mnaReq: 0, type: "mag", power: 1.3, desc: "A missile of pure dark antimatter." },
  noxPrimordialSilence: { name: "Primordial Silence", mp: 8, target: "allEnemies", att: "NOX", mnaReq: 10, type: "mag", power: 0.7, status: { blind: 2 }, desc: "Vacuum field; blinds all foes." },
  noxHeatDrain: { name: "Heat Drain", mp: 10, target: "enemy", att: "NOX", mnaReq: 35, type: "mag", power: 1.7, status: { decay: 3 }, desc: "Siphon thermal energy; heavy Decay." },
  noxHypothermia: { name: "Hypothermia", mp: 14, target: "allEnemies", att: "NOX", mnaReq: 65, type: "mag", power: 1.0, status: { decay: 3 }, desc: "A killing cold on all foes; Decay." },
  noxCosmicReset: { name: "The Cosmic Reset", mp: 24, target: "allEnemies", att: "NOX", mnaReq: 100, ult: true, type: "mag", power: 1.9, status: { decay: 3 }, desc: "ULTIMATE — a void rift swallows the field; massive cold+dark, Decay." },
  // Lattice Executioner (Spellblade, hybrid)
  noxLatticeSlash: { name: "Lattice Slash", mp: 4, target: "enemy", att: "NOX", mnaReq: 0, type: "phys", power: 1.0, status: { decay: 2 }, desc: "Ice-infused blade strike; Decay." },
  noxFrostSpike: { name: "Frost Spike", mp: 8, target: "enemy", att: "NOX", mnaReq: 10, type: "mag", power: 1.6, status: { decay: 2 }, desc: "An ice spike from below; Decay." },
  noxShatterShield: { name: "Shatter-Burst Shield", mp: 8, target: "self", att: "NOX", mnaReq: 35, type: "buff", buff: { wardArmor: 10, turns: 3 }, desc: "Frost barrier; +10 armor (3 turns)." },
  noxBrittleBrand: { name: "Brittle Brand", mp: 16, target: "enemy", att: "NOX", mnaReq: 65, type: "mag", power: 2.2, status: { decay: 3 }, desc: "Brand a foe brittle; heavy cold and Decay." },
  noxRunicRefrigeration: { name: "Runic Refrigeration", mp: 24, target: "allEnemies", att: "NOX", mnaReq: 100, ult: true, type: "mag", power: 1.7, status: { decay: 3 }, desc: "ULTIMATE — freeze the battlefield lattice; cold to all, Decay." },

  // ── PLACEHOLDER generic kits for the not-yet-authored attunements (ANIMA / QUANTA / UMBRAXIS).
  // One shared 5-ability tree per attunement (req 0/10/30/55/100), themed to that power's
  // signature so any class is playable until REQUIEM kits land. Reconcile to canon later.
  // ANIMA (life / growth / vitality — heals + nature damage; ANIMA MNA scales healing):
  animaThorns: { name: "Thornlash", mp: 4, target: "enemy", att: "ANIMA", mnaReq: 0, type: "phys", power: 1.1, status: { poison: 3 }, desc: "Barbed vines lash a foe; Poison." },
  animaMend: { name: "Mend", mp: 5, target: "ally", att: "ANIMA", mnaReq: 10, type: "heal", power: 1.4, desc: "Channel life into one ally." },
  animaWither: { name: "Wither", mp: 9, target: "enemy", att: "ANIMA", mnaReq: 30, type: "mag", power: 1.7, status: { poison: 3 }, desc: "Rot a foe from within; Poison." },
  animaBloom: { name: "Bloom", mp: 14, target: "allAllies", att: "ANIMA", mnaReq: 55, type: "heal", power: 1.0, status: { regen: 3 }, desc: "Heal the party; grant Regen." },
  animaGenesis: { name: "Genesis", mp: 22, target: "allAllies", att: "ANIMA", mnaReq: 100, ult: true, type: "heal", power: 1.7, status: { regen: 4 }, desc: "ULTIMATE — life floods the party; big heal + lasting Regen." },
  // QUANTA (probability / time — high crit, speed; QUANTA grants +crit and MNA scales SPD):
  quantaFlux: { name: "Flux Bolt", mp: 4, target: "enemy", att: "QUANTA", mnaReq: 0, type: "mag", power: 1.3, crit: 20, desc: "An uncertain bolt; high crit." },
  quantaHaste: { name: "Acceleration", mp: 6, target: "self", att: "QUANTA", mnaReq: 10, type: "buff", buff: { atkup: 1, turns: 3 }, desc: "Bend time: +50% ATK for 3 turns." },
  quantaCollapse: { name: "Probability Collapse", mp: 12, target: "enemy", att: "QUANTA", mnaReq: 30, type: "phys", power: 2.4, crit: 40, desc: "Collapse the odds onto one foe; very high crit." },
  quantaCascade: { name: "Cascade", mp: 14, target: "allEnemies", att: "QUANTA", mnaReq: 55, type: "mag", power: 1.0, crit: 30, desc: "A cascade of chance across all foes." },
  quantaSingularity: { name: "Singularity", mp: 24, target: "enemy", att: "QUANTA", mnaReq: 100, ult: true, type: "mag", power: 3.4, crit: 50, desc: "ULTIMATE — a near-certain critical detonation on one foe." },
  // UMBRAXIS (gravity / void / entropy — decay + mitigation; UMBRAXIS MNA scales damage reduction):
  umbraCrush: { name: "Gravity Crush", mp: 4, target: "enemy", att: "UMBRAXIS", mnaReq: 0, type: "phys", power: 1.2, status: { drain: 2 }, desc: "Crushing gravity; Drain." },
  umbraDrain: { name: "Void Drain", mp: 8, target: "enemy", att: "UMBRAXIS", mnaReq: 10, type: "mag", power: 1.6, status: { decay: 2 }, desc: "Siphon a foe into the void; Decay." },
  umbraEntropy: { name: "Entropy", mp: 12, target: "allEnemies", att: "UMBRAXIS", mnaReq: 30, type: "mag", power: 1.0, status: { decay: 3 }, desc: "Entropy gnaws all foes; Decay." },
  umbraWard: { name: "Event Ward", mp: 12, target: "allAllies", att: "UMBRAXIS", mnaReq: 55, type: "buff", buff: { wardArmor: 10, turns: 3 }, desc: "A gravity well shields the party; +10 armor (3 turns)." },
  umbraHorizon: { name: "Event Horizon", mp: 24, target: "allEnemies", att: "UMBRAXIS", mnaReq: 100, ult: true, type: "mag", power: 1.9, status: { decay: 3 }, desc: "ULTIMATE — a collapsing singularity engulfs all foes; Decay." },
};

// Fold in the canon-generated kits for the 37 classes that aren't hand-authored above
// (docs/design/requiem/gen-kits.cjs -> requiem-kits.ts). Hand-authored keys win on any overlap.
Object.assign(SKILLS, { ...REQUIEM_SKILLS, ...SKILLS });
