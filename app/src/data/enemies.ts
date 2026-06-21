import type { EnemyDef } from "../types";
import { clamp } from "../core/rng";

// Bestiary across both zones (Dara's canon roster). Attunements are spread across the ring so
// ANY party composition (the player builds their own — no SOL default) gets strong/weak matchups.
// Bosses are infused: the Greenvale Kingpin is SOL (per Dara's art); the Cave Troll is NOX (a
// deliberate variety pick so the final fight has a real affinity matchup vs most comps). Variants
// reuse a base creature's sprite via `art`. Stat magnitudes follow the tuned curve (balance-sim).
export const ENEMIES: Record<string, EnemyDef> = {
  // ── ZONE 1: Greenvale (levels 1-6) ──
  slime: { name: "Green Slime", spr: "🟢", att: "ANIMA", lvl: 1, hp: 72, atk: 13, spd: 6, armor: 1, mag: 0, xp: 30, gold: [4, 10], ai: "basic", onHit: { poison: 2 } },
  kobold: { name: "Kobold", spr: "🦎", att: "SOL", lvl: 2, hp: 68, atk: 14, spd: 13, armor: 1, mag: 0, xp: 38, gold: [6, 14], ai: "basic" },
  gbandit: { name: "Greenvale Bandit", spr: "🗡️", att: "NOX", lvl: 2, hp: 94, atk: 15, spd: 9, armor: 2, mag: 0, xp: 64, gold: [10, 22], ai: "basic" },
  slimebig: { name: "Bloated Slime", spr: "🟢", att: "QUANTA", lvl: 3, hp: 152, atk: 16, spd: 5, armor: 3, mag: 0, xp: 92, gold: [10, 20], ai: "basic", onHit: { poison: 3 }, art: "slime" },
  kobolde: { name: "Kobold Raider", spr: "🦎", att: "UMBRAXIS", lvl: 4, hp: 108, atk: 16, spd: 11, armor: 2, mag: 0, xp: 108, gold: [16, 28], ai: "basic", art: "kobold" },
  gmage: { name: "Greenvale Mage", spr: "🧙", att: "UMBRAXIS", lvl: 4, hp: 102, atk: 15, spd: 9, armor: 1, mag: 22, xp: 116, gold: [18, 30], ai: "caster", skills: ["hex"], castChance: 0.55 },
  brigand: { name: "Bandit Brigadier", spr: "🪖", att: "NOX", lvl: 5, hp: 480, atk: 34, spd: 8, armor: 5, mag: 0, xp: 170, gold: [60, 100], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.2, art: "gbandit" },
  kingpin: { name: "Greenvale Kingpin", spr: "👑", att: "SOL", lvl: 6, hp: 870, atk: 35, spd: 7, armor: 7, mag: 0, xp: 240, gold: [120, 180], ai: "boss", boss: true, skills: ["rally"], castChance: 0.16, enrage: { omega: "kingpin-omega" } },
  // ── ZONE 2: Silverwood — the Ancient Forest (levels 7-9; new region, ADR 0006). Attunements are
  //    spread (Dara's no-region-identity ruling — the forest is NOT an ANIMA theme). CD-authored
  //    bestiary under Dara's granted authority — FLAGGED for Dara / requiem-canon-keeper to vet the
  //    names + lore. Sprites are emoji placeholders (see asset-gaps.md). Stats are starter values on
  //    the curve between Greenvale and the Duskmarsh — balance-tuner owns the final numbers. ──
  dwolf: { name: "Direwolf", spr: "🐺", att: "ANIMA", lvl: 7, hp: 210, atk: 27, spd: 15, armor: 1, mag: 0, xp: 124, gold: [14, 28], ai: "basic" },
  thornling: { name: "Thornling", spr: "🌿", att: "QUANTA", lvl: 7, hp: 248, atk: 24, spd: 8, armor: 3, mag: 0, xp: 132, gold: [16, 30], ai: "basic", onHit: { poison: 3 } },
  sylvanarcher: { name: "Sylvan Archer", spr: "🏹", att: "SOL", lvl: 8, hp: 200, atk: 28, spd: 12, armor: 1, mag: 0, xp: 146, gold: [20, 36], ai: "basic" },
  gloomwisp: { name: "Gloom Wisp", spr: "🔮", att: "UMBRAXIS", lvl: 8, hp: 168, atk: 19, spd: 12, armor: 1, mag: 25, xp: 150, gold: [22, 38], ai: "caster", skills: ["hex"], castChance: 0.5 },
  barkbrute: { name: "Barkhide Brute", spr: "🪵", att: "NOX", lvl: 9, hp: 338, atk: 29, spd: 6, armor: 6, mag: 0, xp: 196, gold: [24, 42], ai: "basic" },
  spriggan: { name: "Spriggan", spr: "🍂", att: "SOL", lvl: 9, hp: 266, atk: 28, spd: 12, armor: 3, mag: 0, xp: 190, gold: [22, 40], ai: "basic", leech: 25 },
  treantelder: { name: "Elder Treant", spr: "🌳", att: "ANIMA", lvl: 9, hp: 1600, atk: 64, spd: 6, armor: 8, mag: 0, xp: 300, gold: [110, 180], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.25 },
  hollowking: { name: "The Hollow King", spr: "🦌", att: "QUANTA", lvl: 10, hp: 2500, atk: 52, spd: 8, armor: 8, mag: 0, xp: 360, gold: [160, 240], ai: "boss", boss: true, skills: ["rally"], castChance: 0.17 },
  mossback: { name: "Mossback Tortoise", spr: "🐢", att: "ANIMA", lvl: 8, hp: 60, atk: 11, spd: 4, armor: 55, mag: 0, xp: 850, gold: [110, 240], ai: "basic", rare: true },
  // ── ZONE 3: The Duskmarsh → the Drowned Vault (entered ~Lv 10-11, higher base stats) ──
  rat: { name: "Cave Rat", spr: "🐀", att: "NOX", lvl: 7, hp: 250, atk: 29, spd: 14, armor: 1, mag: 0, xp: 120, gold: [14, 28], ai: "basic" },
  spider: { name: "Cave Spider", spr: "🕷️", att: "ANIMA", lvl: 7, hp: 294, atk: 28, spd: 11, armor: 2, mag: 0, xp: 130, gold: [18, 34], ai: "basic", onHit: { poison: 3 } },
  leper: { name: "Cave Leper", spr: "🧟", att: "UMBRAXIS", lvl: 8, hp: 366, atk: 28, spd: 6, armor: 3, mag: 0, xp: 180, gold: [20, 38], ai: "basic", leech: 30 },
  direrat: { name: "Dire Rat", spr: "🐀", att: "QUANTA", lvl: 8, hp: 304, atk: 30, spd: 13, armor: 2, mag: 0, xp: 185, gold: [18, 32], ai: "basic", art: "rat" },
  bonespider: { name: "Bone Spider", spr: "🕷️", att: "NOX", lvl: 9, hp: 396, atk: 33, spd: 9, armor: 5, mag: 0, xp: 200, gold: [24, 42], ai: "basic", onHit: { poison: 4 }, art: "spider" },
  broodmother: { name: "Vault Broodmother", spr: "🕷️", att: "UMBRAXIS", lvl: 9, hp: 1820, atk: 76, spd: 8, armor: 7, mag: 0, xp: 320, gold: [120, 200], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "spider" },
  troll: { name: "Cave Troll", spr: "👹", att: "NOX", lvl: 10, hp: 4000, atk: 88, spd: 9, armor: 10, mag: 6, xp: 420, gold: [260, 400], ai: "boss", boss: true, skills: ["rally"], castChance: 0.22, enrage: { omega: "troll-omega" } },
  // ── ZONE 4: Goldmeadow Plains → the occupied Windmill Undercroft (levels 11-15; new region, first
  //    backlog fill 2026-06-21). The grim tide from the Duskmarsh has spilled onto the open
  //    breadbasket: an open-field WAR HOST (raiders who burned the harvest) plus PLAINS PREDATORS
  //    drawn to the carnage. Attunements stay SPREAD across the ring (Dara's no-region-identity
  //    ruling — surface regions carry no Attunement theme; the lean here is creature/terrain flavor
  //    only). CD-authored under granted authority — names DRAFT, FLAGGED for Dara / requiem-canon-keeper.
  //    Sprites are emoji placeholders (see asset-gaps.md). Stats are TUNED (balance-sim 200-run) on the
  //    curve PAST the Duskmarsh (L11 base → scales to L15 at depth): the trash got a modest ATK/HP lift
  //    off the encounter-pass first-pass so plains packs chip a bit harder. Role mix:
  //    fast skirmishers (marauder/wilddog), a ranged harrier, a rust-bladed bruiser (raider, whose
  //    NOX cuts fester — the onHit DoT is a rotting wound, not a burn), a scavenger leecher (carrion),
  //    and a slow armored wall (reaver) so packs play as different shapes. ──
  raider: { name: "Plains Raider", spr: "🗡️", att: "NOX", lvl: 11, hp: 400, atk: 35, spd: 9, armor: 3, mag: 0, xp: 150, gold: [22, 40], ai: "basic", onHit: { poison: 4 } },
  marauder: { name: "Field Marauder", spr: "🏃", att: "SOL", lvl: 11, hp: 300, atk: 34, spd: 16, armor: 2, mag: 0, xp: 152, gold: [22, 40], ai: "basic" },
  harrier: { name: "Plains Harrier", spr: "🏹", att: "QUANTA", lvl: 12, hp: 272, atk: 36, spd: 13, armor: 1, mag: 0, xp: 158, gold: [24, 42], ai: "basic" },
  wilddog: { name: "Wild Dog", spr: "🐕", att: "ANIMA", lvl: 11, hp: 252, atk: 33, spd: 17, armor: 1, mag: 0, xp: 144, gold: [16, 30], ai: "basic" },
  carrion: { name: "Carrion Bird", spr: "🦅", att: "UMBRAXIS", lvl: 12, hp: 232, atk: 32, spd: 18, armor: 1, mag: 0, xp: 156, gold: [20, 38], ai: "basic", leech: 28 },
  reaver: { name: "Iron Reaver", spr: "🪓", att: "QUANTA", lvl: 13, hp: 500, atk: 38, spd: 6, armor: 8, mag: 0, xp: 200, gold: [28, 48], ai: "basic" },
  // Mini-boss (mouth gate): a raider war-captain who rallies his band; escorted by marauders.
  warcaptain: { name: "Raider War-Captain", spr: "⚔️", att: "NOX", lvl: 13, hp: 2100, atk: 80, spd: 10, armor: 6, mag: 0, xp: 340, gold: [140, 220], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "raider" },
  // Zone boss (the windmill): the warlord who leads the host — the run-ender. ENRAGE-flagged like the
  // Kingpin/Cave Troll (omega art TBD; the swap no-ops gracefully until art-integrator supplies it).
  // TUNED to BITE: the encounter-pass first cut (hp 4600 / atk 92) read soft (~75% mean party HP).
  // Raised hp→5400 (survives the party's burst → more turns of pressure) + atk→132 (each landed hit,
  // amplified by rally/enrage, actually hurts) so the climax dips the party to ~55% mean / can wipe a
  // mis-played run — without becoming a slog (boss-fight enemy actions stay ~4.5-5, not a sponge).
  warlord: { name: "The Reaping Warlord", spr: "👹", att: "SOL", lvl: 15, hp: 5400, atk: 140, spd: 11, armor: 11, mag: 0, xp: 480, gold: [300, 460], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "warlord-omega" } },
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
  // A fat, slow, gilded beast gorged on the golden harvest — wanders the wheat of Goldmeadow. Metal-
  // Slime/Hogger tier: huge armor + middling HP (chips for ~1 unless you crit / hit affinity), slow,
  // weak attacker — a pure XP/loot jackpot. DRAFT name, FLAGGED for Dara.
  goldsow: { name: "Gilded Sow", spr: "🐖", att: "ANIMA", lvl: 13, hp: 620, atk: 28, spd: 6, armor: 14, mag: 0, xp: 1800, gold: [260, 500], ai: "basic", rare: true },
};

// Pool of ultra-rare monsters eligible to crash a random encounter, with the zone index they
// can appear in. Kept tiny + data-driven — add an entry to introduce a new rare.
export const RARE_MONSTERS: { key: string; zones: number[] }[] = [
  { key: "hogger", zones: [0] },      // Hogger prowls Greenvale (zone 0)
  { key: "metalslime", zones: [0] },  // Metal Slime — Greenvale (zone 0)
  { key: "mossback", zones: [1] },    // Mossback Tortoise — Silverwood (zone 1; also its grove lair)
  { key: "metalbabble", zones: [2] }, // Metal Babble — the Drowned Vault (zone 2; rarer, richer)
  { key: "warmech", zones: [2] },     // Warmech — Duskmarsh (zone 2; until Titan Prime exists)
  { key: "goldsow", zones: [3] },     // Gilded Sow — Goldmeadow (zone 3; the gilded beast in the wheat)
];
// Chance a random (non-boss) encounter is replaced by an eligible ultra-rare monster.
export const RARE_ENCOUNTER_CHANCE = 0.04;

// Enemies scale with DEPTH (how far east through a zone you are) so they keep pace with the
// party's level + gear growth. HP scales HARD (enemies survive the party's burst and keep
// acting = steady pressure); ATK scales GENTLY (hits chip instead of one-shotting squishies).
// Base stats are tuned for the zone START. Tuned via app/tools/balance-sim.ts.
// ATK_DEPTH 1.05->0.83->0.60->0.50: the deep-end ATK ramp is the dominant WIPE driver — at depth,
// bosses + champion packs (rally/atkup) + crits compound into one-shot spikes that wipe
// otherwise-healthy parties. The 3-zone curve made full-clear wipes too high AND swingy (skilled
// 13-19%, the late bosses spiking — the Hollow King especially, fought at full depth with the
// party's weakest gear:HP ratio). Flattening the ATK ramp to 0.50 (with shorter, less-bursty late
// bosses, below) keeps deep fights pressuring via HP/length (steady chip) instead of lethal burst,
// landing a STABLE skilled full-clear wipe ~8% (was ~15%, ≤11% across runs, no 19% spikes).
export const HP_DEPTH = 1.35;
export const ATK_DEPTH = 0.55;
export const depthHpScale = (d: number): number => 1 + clamp(d, 0, 1) * HP_DEPTH;
export const depthAtkScale = (d: number): number => 1 + clamp(d, 0, 1) * ATK_DEPTH;
