import type { EnemyDef } from "../types";

// Bestiary across both zones (Dara's canon roster). Attunements are spread across the ring so
// ANY party composition (the player builds their own — no SOL default) gets strong/weak matchups.
// Bosses are infused: the Greenvale Kingpin is SOL (per Dara's art); the Cave Troll is NOX (a
// deliberate variety pick so the final fight has a real affinity matchup vs most comps). Variants
// reuse a base creature's sprite via `art`.
//
// V3 (ADR 0018): combat stats are DERIVED — each entry declares a `role` (the primary SHAPE +
// HP/ATK multipliers, systems/enemyStats) and an optional `lean` (per-enemy primary re-weighting for
// outliers — armored "metal" jackpots, sponges). "A level-N monster" = enemyPrimaries(role, lvl).
// Magnitudes are tuned via the balance-sim's role/curve constants, not per entry.
//
// LEVEL RE-CENTER (v0.212): heroes start at LEVEL 10 (Dara, v0.211), so the whole Aurelion arc is
// re-seated from the old L1→25 onto a COMPRESSED ~L8→19 trash ladder (party runs L10→~21) —
// Greenvale surface is a real-but-fair fight for a fresh L10 party, the Ancient Ruins run clearly
// hotter, and each zone scales on from there. Two non-obvious rules of this curve, both sim-derived:
//   • BOOKEND LEVELS SIT AT/BELOW THEIR ZONE'S TRASH. The miniboss/boss ROLES already carry 6–9×
//     HP and 2–2.4× ATK multipliers (systems/enemyStats) plus the depth level-lift (+3 at the boss
//     tile), and enemy power compounds ~14.5%/level — at L10+ a boss with the old "+2 over trash"
//     label one-shot the sim's whole arc. The fight is the boss; the label just sets loot/XP ilvl.
//   • XP follows one curve of level (~2.2·lvl^1.9 for trash; minis ~2.5× / zone bosses ~4× the
//     zone-mid trash value; rares outsized) so leveling pace tracks the difficulty ladder.
// Tuned via `npm run sim` (see the persona notes there); re-run it after touching any number here.
export const ENEMIES: Record<string, EnemyDef> = {
  // ── ZONE 1: Greenvale (trash L8–10, bookends L8–9 — the fresh-L10-party shire) ──
  slime: { name: "Green Slime", spr: "🟢", att: "ANIMA", lvl: 8, role: "bruiser", lean: { VIT: 1.4, SPD: 0.6 }, xp: 114, gold: [4, 10], ai: "basic", onHit: { poison: 2 } },
  kobold: { name: "Kobold", spr: "🦎", att: "SOL", lvl: 9, role: "skirmisher", xp: 143, gold: [6, 14], ai: "basic" },
  gbandit: { name: "Greenvale Bandit", spr: "🗡️", att: "NOX", lvl: 9, role: "bruiser", xp: 143, gold: [10, 22], ai: "basic" },
  slimebig: { name: "Bloated Slime", spr: "🟢", att: "QUANTA", lvl: 10, role: "wall", lean: { DEF: 0.5, VIT: 1.8 }, xp: 175, gold: [10, 20], ai: "basic", onHit: { poison: 3 }, art: "slime" },
  kobolde: { name: "Kobold Raider", spr: "🦎", att: "UMBRAXIS", lvl: 10, role: "skirmisher", xp: 175, gold: [16, 28], ai: "basic", art: "kobold" },
  gmage: { name: "Greenvale Mage", spr: "🧙", att: "UMBRAXIS", lvl: 10, role: "caster", xp: 175, gold: [18, 30], ai: "caster", skills: ["hex"], castChance: 0.55 },
  brigand: { name: "Bandit Brigadier", spr: "🪖", att: "NOX", lvl: 9, role: "miniboss", xp: 395, gold: [60, 100], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.2, art: "gbandit" },
  // IN-DUNGEON LIEUTENANT (Bandit Warren B2 gate): the MIDDLE step of the warren's spine — the Brigadier
  // guards the overworld MOUTH (L9), the Kingpin is the B3 FINALE (L8 + the depth lift), this gates B2. ~L9; startFloorMini
  // fights it at depth ~0.78, so the depth level-lift makes it a real mini-boss step WITHOUT overtaking the
  // finale. ANIMA keeps the Warren trio spread (Brigadier NOX / lieutenant ANIMA / Kingpin SOL). DRAFT name
  // (flag for Dara), 🔪 placeholder over the gbandit sprite (flag for art-integrator).
  lieutenant: { name: "Bandit Bloodknife", spr: "🔪", att: "ANIMA", lvl: 9, role: "miniboss", xp: 395, gold: [50, 90], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.22 },
  kingpin: { name: "Greenvale Kingpin", spr: "👑", att: "SOL", lvl: 8, role: "boss", xp: 633, gold: [120, 180], ai: "boss", boss: true, skills: ["rally"], castChance: 0.16, enrage: { omega: "kingpin-omega" } },
  // ── ZONE 2: Silverwood — the Ancient Forest (trash L11–13; new region, ADR 0006). Attunements are
  //    spread (Dara's no-region-identity ruling — the forest is NOT an ANIMA theme). CD-authored
  //    bestiary under Dara's granted authority — FLAGGED for Dara / requiem-canon-keeper to vet the
  //    names + lore. Sprites are emoji placeholders (see asset-gaps.md). Roles are mixed so packs play
  //    as different shapes — balance-tuner owns the final role/curve numbers. ──
  dwolf: { name: "Direwolf", spr: "🐺", att: "ANIMA", lvl: 11, role: "skirmisher", xp: 209, gold: [14, 28], ai: "basic" },
  thornling: { name: "Thornling", spr: "🌿", att: "QUANTA", lvl: 11, role: "bruiser", xp: 209, gold: [16, 30], ai: "basic", onHit: { poison: 3 } },
  sylvanarcher: { name: "Sylvan Archer", spr: "🏹", att: "SOL", lvl: 12, role: "harrier", xp: 247, gold: [20, 36], ai: "basic" },
  gloomwisp: { name: "Gloom Wisp", spr: "🔮", att: "UMBRAXIS", lvl: 12, role: "caster", xp: 247, gold: [22, 38], ai: "caster", skills: ["hex"], castChance: 0.5 },
  barkbrute: { name: "Barkhide Brute", spr: "🪵", att: "NOX", lvl: 13, role: "wall", xp: 288, gold: [24, 42], ai: "basic" },
  spriggan: { name: "Spriggan", spr: "🍂", att: "SOL", lvl: 12, role: "skirmisher", xp: 247, gold: [22, 40], ai: "basic", leech: 25 },
  treantelder: { name: "Elder Treant", spr: "🌳", att: "ANIMA", lvl: 11, role: "miniboss", lean: { VIT: 1.3 }, xp: 570, gold: [110, 180], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.25 },
  hollowking: { name: "The Hollow King", spr: "🦌", att: "QUANTA", lvl: 10, role: "boss", xp: 912, gold: [160, 240], ai: "boss", boss: true, skills: ["rally"], castChance: 0.17 },
  mossback: { name: "Mossback Tortoise", spr: "🐢", att: "ANIMA", lvl: 12, role: "rare", lean: { DEF: 9, VIT: 0.3, SPD: 0.4 }, xp: 1900, gold: [110, 240], ai: "basic", rare: true },
  // ── ZONE 3: The Duskmarsh → the Drowned Vault (trash L11–13, entered off Silverwood) ──
  rat: { name: "Cave Rat", spr: "🐀", att: "NOX", lvl: 11, role: "skirmisher", xp: 209, gold: [14, 28], ai: "basic" },
  spider: { name: "Cave Spider", spr: "🕷️", att: "ANIMA", lvl: 11, role: "bruiser", xp: 209, gold: [18, 34], ai: "basic", onHit: { poison: 3 } },
  leper: { name: "Cave Leper", spr: "🧟", att: "UMBRAXIS", lvl: 12, role: "bruiser", xp: 247, gold: [20, 38], ai: "basic", leech: 30 },
  direrat: { name: "Dire Rat", spr: "🐀", att: "QUANTA", lvl: 12, role: "skirmisher", xp: 247, gold: [18, 32], ai: "basic", art: "rat" },
  bonespider: { name: "Bone Spider", spr: "🕷️", att: "NOX", lvl: 13, role: "bruiser", xp: 288, gold: [24, 42], ai: "basic", onHit: { poison: 4 }, art: "spider" },
  broodmother: { name: "Vault Broodmother", spr: "🕷️", att: "UMBRAXIS", lvl: 11, role: "miniboss", lean: { VIT: 1.3 }, xp: 618, gold: [120, 200], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "spider" },
  troll: { name: "Cave Troll", spr: "👹", att: "NOX", lvl: 11, role: "boss", lean: { VIT: 1.2, STR: 1.2 }, xp: 988, gold: [260, 400], ai: "boss", boss: true, skills: ["rally"], castChance: 0.22, enrage: { omega: "troll-omega" } },
  // ── ZONE 4: Goldmeadow Plains → the occupied Windmill Undercroft (trash L12–14; new region, first
  //    backlog fill 2026-06-21). The grim tide from the Duskmarsh has spilled onto the open
  //    breadbasket: an open-field WAR HOST (raiders who burned the harvest) plus PLAINS PREDATORS
  //    drawn to the carnage. Attunements stay SPREAD across the ring (Dara's no-region-identity
  //    ruling — surface regions carry no Attunement theme; the lean here is creature/terrain flavor
  //    only). CD-authored under granted authority — names DRAFT, FLAGGED for Dara / requiem-canon-keeper.
  //    Sprites are emoji placeholders (see asset-gaps.md). Role mix: fast skirmishers (marauder/wilddog),
  //    a ranged harrier, a rust-bladed bruiser (raider, whose NOX cuts fester — the onHit DoT is a rotting
  //    wound), a scavenger leecher (carrion), and a slow armored wall (reaver) so packs play as shapes. ──
  raider: { name: "Plains Raider", spr: "🗡️", att: "NOX", lvl: 12, role: "bruiser", xp: 247, gold: [22, 40], ai: "basic", onHit: { poison: 4 } },
  marauder: { name: "Field Marauder", spr: "🏃", att: "SOL", lvl: 12, role: "skirmisher", xp: 247, gold: [22, 40], ai: "basic" },
  harrier: { name: "Plains Harrier", spr: "🏹", att: "QUANTA", lvl: 13, role: "harrier", xp: 288, gold: [24, 42], ai: "basic" },
  wilddog: { name: "Wild Dog", spr: "🐕", att: "ANIMA", lvl: 12, role: "skirmisher", xp: 247, gold: [16, 30], ai: "basic" },
  carrion: { name: "Carrion Bird", spr: "🦅", att: "UMBRAXIS", lvl: 13, role: "skirmisher", xp: 288, gold: [20, 38], ai: "basic", leech: 28 },
  reaver: { name: "Iron Reaver", spr: "🪓", att: "QUANTA", lvl: 14, role: "wall", xp: 332, gold: [28, 48], ai: "basic" },
  // Mini-boss (mouth gate): a raider war-captain who rallies his band; escorted by marauders.
  warcaptain: { name: "Raider War-Captain", spr: "⚔️", att: "NOX", lvl: 12, role: "miniboss", xp: 667, gold: [140, 220], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3 },
  // Zone boss (the windmill): the warlord who leads the host — the run-ender. ENRAGE-flagged like the
  // Kingpin/Cave Troll (omega art TBD; the swap no-ops gracefully until art-integrator supplies it). The
  // VIT lean makes the climax bite (survives the party's burst → more turns of rally/enrage pressure).
  warlord: { name: "The Reaping Warlord", spr: "👹", att: "SOL", lvl: 12, role: "boss", lean: { VIT: 1.2, STR: 1.15 }, xp: 1067, gold: [300, 460], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "warlord-omega" } },
  // ════ AURELION COMPLETE — the remaining six regions' rosters (encounter-designer, brief 2026-06-21) ═
  // Authored under granted Director authority. Roles are mixed so packs play as different shapes; levels
  // climb on the curve PAST Goldmeadow (trash L13 → L19). Attunements stay SPREAD across the ring (Dara's
  // no-region-identity ruling). Names DRAFT — FLAGGED for Dara / requiem-canon-keeper. Sprites are emoji
  // placeholders (see asset-gaps.md). Some Goldmeadow predators (wilddog/carrion) are REUSED where they
  // genuinely fit a region's wild fringe, to limit roster sprawl.

  // ── ZONE 5 (index 4): Storm Coast (trash L13–15) — wreckers/pirates + sea-beasts. Fast flankers (cutthroat),
  //    a poison-crab tank, a ranged slinger (deckhand), a serpent leecher; champion = a wrecker-captain. ──
  wrecker: { name: "Coast Wrecker", spr: "🪝", att: "NOX", lvl: 13, role: "bruiser", xp: 288, gold: [24, 44], ai: "basic", onHit: { poison: 4 } },
  cutthroat: { name: "Tide Cutthroat", spr: "🗡️", att: "SOL", lvl: 13, role: "skirmisher", xp: 288, gold: [24, 44], ai: "basic" },
  deckhand: { name: "Pirate Slinger", spr: "🏹", att: "QUANTA", lvl: 14, role: "harrier", xp: 332, gold: [26, 46], ai: "basic" },
  shellcrab: { name: "Reef Crab", spr: "🦀", att: "ANIMA", lvl: 14, role: "wall", xp: 332, gold: [28, 50], ai: "basic", onHit: { poison: 3 } },
  seaserpent: { name: "Brine Serpent", spr: "🐍", att: "UMBRAXIS", lvl: 15, role: "skirmisher", xp: 379, gold: [26, 48], ai: "basic", leech: 30 },
  // Champion guardian (the sea-cave payoff): a tanky multi-threat wrecker-captain. boss:true so the engine
  // routes it through startBoss as the cave's finale — NOT enrage (champion-tier, not a spine boss).
  wreckcaptain: { name: "Wrecker-Captain", spr: "🏴‍☠️", att: "NOX", lvl: 12, role: "boss", xp: 996, gold: [180, 280], ai: "boss", boss: true, skills: ["rally"], castChance: 0.28, art: "wrecker" },

  // ── ZONE 6 (index 5): Riverhearth Outskirts (trash L14–16) — road-bandits, smugglers, river-toughs. A
  //    cosh-bruiser, a fast footpad, a crossbow smuggler, a river-tough wall, a fence-leecher; champion =
  //    a crime-lord. ──
  roadbandit: { name: "Road Bandit", spr: "🗡️", att: "NOX", lvl: 14, role: "bruiser", xp: 332, gold: [28, 50], ai: "basic" },
  footpad: { name: "Wharf Footpad", spr: "🏃", att: "ANIMA", lvl: 14, role: "skirmisher", xp: 332, gold: [28, 50], ai: "basic" },
  smuggler: { name: "Smuggler Crossbow", spr: "🏹", att: "SOL", lvl: 15, role: "harrier", xp: 379, gold: [30, 52], ai: "basic" },
  rivertough: { name: "River Tough", spr: "🪓", att: "QUANTA", lvl: 15, role: "wall", xp: 379, gold: [32, 56], ai: "basic" },
  fence: { name: "Wharf Fence", spr: "🦝", att: "UMBRAXIS", lvl: 16, role: "skirmisher", xp: 429, gold: [34, 58], ai: "basic", leech: 32 },
  crimelord: { name: "River Crime-Lord", spr: "🎩", att: "UMBRAXIS", lvl: 13, role: "boss", xp: 1300, gold: [220, 340], ai: "boss", boss: true, skills: ["rally"], castChance: 0.3, art: "roadbandit" },

  // ── ZONE 7 (index 6): Frostpeak Highlands → the Dwarven Stronghold (trash L15–17, SPINE). Frost beasts
  //    (ice wolves, a snow-troll/yeti), mountain reavers, awakened dwarven stone-sentinels. A frost-bite
  //    wolf pack-flanker, a hexing frost-shade caster, a slow stone-sentinel wall, a reaver bruiser; the
  //    yeti is a heavy. Mini = a hold-warden at the gate; boss = a stone/frost guardian (ENRAGE). ──
  icewolf: { name: "Ice Wolf", spr: "🐺", att: "QUANTA", lvl: 15, role: "skirmisher", xp: 379, gold: [26, 48], ai: "basic" },
  mtnreaver: { name: "Mountain Reaver", spr: "🪓", att: "NOX", lvl: 15, role: "bruiser", xp: 379, gold: [30, 54], ai: "basic" },
  frostshade: { name: "Frost Shade", spr: "❄️", att: "UMBRAXIS", lvl: 16, role: "caster", xp: 429, gold: [32, 56], ai: "caster", skills: ["hex"], castChance: 0.5 },
  stonesentinel: { name: "Dwarven Sentinel", spr: "🗿", att: "SOL", lvl: 16, role: "wall", xp: 429, gold: [34, 60], ai: "basic" },
  snowtroll: { name: "Snow Troll", spr: "🦣", att: "ANIMA", lvl: 17, role: "brute", xp: 483, gold: [40, 70], ai: "basic", leech: 24 },
  // A crystalline-quilled pack-predator of the high passes — violet quills laced with a numbing
  // QUANTA venom; a fast bruiser between the Ice Wolf and the Mountain Reaver. (The 7th creature on
  // Dara's Frostpeak sheet; name agent-given 2026-06-22 — rename freely.)
  rimespine: { name: "Rimespine Mauler", spr: "🦔", att: "QUANTA", lvl: 16, role: "skirmisher", xp: 429, gold: [30, 56], ai: "basic", onHit: { poison: 4 } },
  // Mini-boss (hold-gate): the hold-warden who rallies the sentinels. Escorted by mountain reavers.
  holdwarden: { name: "Hold-Warden", spr: "⚒️", att: "SOL", lvl: 14, role: "miniboss", xp: 1074, gold: [200, 300], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "stonesentinel" },
  // Zone boss (the stronghold): a stone/frost guardian — the SPINE GATE; must genuinely bite.
  // ENRAGE-flagged (omega art TBD; no-ops until art). The DEF/VIT lean makes it a true wall-boss.
  frostguardian: { name: "The Glacier Guardian", spr: "🧊", att: "QUANTA", lvl: 15, role: "boss", lean: { VIT: 1.2, DEF: 1.4 }, xp: 1718, gold: [340, 500], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "frostguardian-omega" } },

  // ── ZONE 8 (index 7): Dawnfall Hold → the breached undervault (trash L16–17). The wilds that broke the fort
  //    + the fallen watch. A feral wild-thing, a broken-watch poison-spear, a ghoul leecher of the fallen
  //    garrison, a ruin-beast wall, a fallen-archer harrier; champion = a fallen watch-commander. ──
  frontierbeast: { name: "Frontier Stalker", spr: "🐗", att: "ANIMA", lvl: 16, role: "skirmisher", xp: 429, gold: [30, 54], ai: "basic" },
  brokenwatch: { name: "Broken Sentry", spr: "🛡️", att: "NOX", lvl: 16, role: "bruiser", xp: 429, gold: [32, 56], ai: "basic", onHit: { poison: 5 } },
  watchghoul: { name: "Garrison Ghoul", spr: "🧟", att: "UMBRAXIS", lvl: 17, role: "bruiser", xp: 483, gold: [32, 58], ai: "basic", leech: 34 },
  ruinhulk: { name: "Rampart Hulk", spr: "🗿", att: "QUANTA", lvl: 17, role: "wall", xp: 483, gold: [38, 66], ai: "basic" },
  fallenarcher: { name: "Fallen Sentry", spr: "🏹", att: "SOL", lvl: 17, role: "harrier", xp: 483, gold: [36, 62], ai: "basic" },
  watchcommander: { name: "Fallen Watch-Commander", spr: "⚔️", att: "SOL", lvl: 15, role: "boss", xp: 1594, gold: [240, 360], ai: "boss", boss: true, skills: ["rally"], castChance: 0.3, art: "brokenwatch" },

  // ── ZONE 9 (index 8): Whisper Hills → the reliquary crypt (trash L17–18). Restless spirits + corrupted monks.
  //    A flitting wraith flanker, a chanting corrupted-monk caster, a flagellant poison-zealot, a heavy
  //    reliquary-golem wall, a soul-leech revenant; champion = a corrupted abbot (a casting boss). ──
  wraith: { name: "Restless Wraith", spr: "👻", att: "UMBRAXIS", lvl: 17, role: "skirmisher", xp: 483, gold: [34, 60], ai: "basic" },
  corruptmonk: { name: "Corrupted Monk", spr: "🧎", att: "ANIMA", lvl: 17, role: "caster", xp: 483, gold: [36, 62], ai: "caster", skills: ["hex"], castChance: 0.52 },
  flagellant: { name: "Cloister Flagellant", spr: "⛓️", att: "NOX", lvl: 18, role: "bruiser", xp: 539, gold: [38, 66], ai: "basic", onHit: { poison: 6 } },
  reliquarygolem: { name: "Reliquary Golem", spr: "🗿", att: "SOL", lvl: 18, role: "wall", xp: 539, gold: [42, 72], ai: "basic" },
  revenant: { name: "Crypt Revenant", spr: "💀", att: "QUANTA", lvl: 18, role: "skirmisher", xp: 539, gold: [40, 70], ai: "basic", leech: 36 },
  corruptabbot: { name: "Corrupted Abbot", spr: "📿", att: "UMBRAXIS", lvl: 16, role: "boss", lean: { VIT: 1.4 }, xp: 1785, gold: [260, 400], ai: "boss", boss: true, skills: ["rally", "hex"], castChance: 0.32, art: "corruptmonk" },

  // ── ZONE 10 (index 9): Sunbridge → the Besieged Citadel / Lighthouse (trash L18–19, SPINE FINALE / RUN-ENDER).
  //    The besieging host + sea-raiders + something risen from the deep. A siege-trooper bruiser, a fast
  //    sea-raider boarder, a ballista harrier, an abyssal poison-tentacle horror, a drowned leecher, an
  //    armored siege-ram wall. Mini = a siege captain; boss = the leviathan finale (ENRAGE, hardest yet). ──
  siegetrooper: { name: "Siege Trooper", spr: "🪖", att: "NOX", lvl: 18, role: "bruiser", xp: 539, gold: [40, 70], ai: "basic" },
  searaider: { name: "Sea-Raider", spr: "⚔️", att: "SOL", lvl: 18, role: "skirmisher", xp: 539, gold: [40, 70], ai: "basic" },
  ballista: { name: "Ballista Crew", spr: "🏹", att: "QUANTA", lvl: 18, role: "harrier", xp: 598, gold: [42, 74], ai: "basic" },
  abyssspawn: { name: "Abyssal Spawn", spr: "🦑", att: "ANIMA", lvl: 18, role: "bruiser", xp: 598, gold: [44, 76], ai: "basic", onHit: { poison: 6 } },
  drowned: { name: "Drowned Sailor", spr: "🧟", att: "UMBRAXIS", lvl: 18, role: "bruiser", xp: 598, gold: [44, 78], ai: "basic", leech: 38 },
  siegeram: { name: "Siege Ram", spr: "🐏", att: "SOL", lvl: 19, role: "wall", xp: 661, gold: [48, 84], ai: "basic" },
  // Mini-boss (citadel mouth): the siege captain who rallies the host. Escorted by siege troopers.
  siegecaptain: { name: "Siege Captain", spr: "🎖️", att: "NOX", lvl: 16, role: "miniboss", xp: 1496, gold: [280, 420], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "siegetrooper" },
  // CONTINENT-FINALE BOSS (the lighthouse summit): something risen from the deep — THE HARDEST FIGHT IN
  // THE GAME. ENRAGE-flagged (omega art TBD; no-ops until art). The highest BOSS level in the game +
  // its VIT/STR lean make it out-stat every prior boss under the shared boss curve — the apex
  // run-ender (the sim reads it as a knife-edge ~15% low-point win). balance-tuner owns the tune.
  leviathan: { name: "The Risen Leviathan", spr: "🐙", att: "ANIMA", lvl: 17, role: "boss", lean: { VIT: 1.35, STR: 1.2 }, xp: 2693, gold: [500, 760], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "leviathan-omega" } },

  // ── ULTRA-RARE treasure monsters (Metal-Slime / Warmech tier): very rare spawns, exceptional loot.
  //    All role:"rare" with a strong `lean`: the "metal" jackpots lean DEF huge + VIT near zero (tiny HP,
  //    enormous armor — chip for ~1 unless you crit/hit affinity — fast, weak attackers); the dangerous
  //    beasts (Warmech, Corsair) lean VIT/STR (tanky hitters with outsized hoards). ──
  hogger: { name: "Hogger", spr: "🐗", att: "ANIMA", lvl: 11, role: "rare", lean: { VIT: 2.2, STR: 1.2 }, xp: 1700, gold: [90, 170], ai: "basic", rare: true },
  metalslime: { name: "Metal Slime", spr: "🪙", att: "QUANTA", lvl: 10, role: "rare", lean: { DEF: 9, VIT: 0.2, SPD: 2.5 }, xp: 1400, gold: [40, 90], ai: "evasive", rare: true },
  metalbabble: { name: "Metal Babble", spr: "🪙", att: "UMBRAXIS", lvl: 12, role: "rare", lean: { DEF: 12, VIT: 0.2, SPD: 2.5 }, xp: 1900, gold: [100, 240], ai: "evasive", rare: true },
  // Warmech (FF1 homage): an ancient war-construct — canon home is Titan Prime (future zone); for
  // now it stalks the Duskmarsh as a genuinely dangerous, tanky, hard-hitting rare with a huge hoard.
  warmech: { name: "Warmech", spr: "🤖", att: "QUANTA", lvl: 13, role: "rare", lean: { VIT: 3, STR: 1.6, DEF: 1.5 }, xp: 2400, gold: [220, 420], ai: "basic", rare: true },
  // A fat, slow, gilded beast gorged on the golden harvest — wanders the wheat of Goldmeadow. Metal-
  // Slime/Hogger tier: huge armor + middling HP (chips for ~1 unless you crit/hit affinity), slow.
  goldsow: { name: "Gilded Sow", spr: "🐖", att: "ANIMA", lvl: 14, role: "rare", lean: { DEF: 3, VIT: 1.4, SPD: 0.4 }, xp: 2400, gold: [260, 500], ai: "basic", rare: true },
  // ── AURELION COMPLETE rares (one per new region; treasure-tier, ~4% replace, exceptional loot). DRAFT
  //    names FLAGGED for Dara. A mix of high-armor "metal" jackpots and dangerous-but-rich beasts. ──
  pearlcrab: { name: "Pearlshell Crab", spr: "🦀", att: "QUANTA", lvl: 15, role: "rare", lean: { DEF: 4, VIT: 1.5 }, xp: 2700, gold: [300, 560], ai: "basic", rare: true },        // Storm Coast: armored treasure-beast
  bullion: { name: "Bullion Hoarder", spr: "🪙", att: "SOL", lvl: 15, role: "rare", lean: { DEF: 13, VIT: 0.2, SPD: 2.5 }, xp: 2700, gold: [220, 520], ai: "evasive", rare: true },  // Riverhearth: Metal-Slime-tier den fence
  crystalbeast: { name: "Crystal Stalker", spr: "💎", att: "UMBRAXIS", lvl: 16, role: "rare", lean: { DEF: 4, VIT: 1.5 }, xp: 3000, gold: [340, 640], ai: "basic", rare: true },    // Frostpeak: the crystalline ice-beast
  goldenstag: { name: "Ruin Goldhart", spr: "🦌", att: "ANIMA", lvl: 17, role: "rare", lean: { DEF: 2.5, VIT: 1.5, SPD: 1.5 }, xp: 3200, gold: [360, 680], ai: "basic", rare: true }, // Dawnfall: skittish gilded ruin-beast
  reliccherub: { name: "Gilt Reliquary", spr: "🕯️", att: "SOL", lvl: 18, role: "rare", lean: { DEF: 15, VIT: 0.2, SPD: 2.5 }, xp: 3600, gold: [400, 720], ai: "evasive", rare: true }, // Whisper Hills: Metal-Babble-tier holy relic
  corsair: { name: "Treasure Corsair", spr: "🦜", att: "QUANTA", lvl: 20, role: "rare", lean: { VIT: 3, STR: 1.6 }, xp: 4800, gold: [600, 1100], ai: "basic", rare: true },          // Sunbridge: a richly-laden, dangerous corsair
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
  // AURELION COMPLETE — one rare per new region (zone indices 4–9). Each region's named lair beast is
  // its FIRST eligible entry here (controllers/field.enterLair picks rares[0] for the den).
  { key: "pearlcrab", zones: [4] },    // Pearlshell Crab — Storm Coast (zone 4; the sea-cave/strand beast)
  { key: "bullion", zones: [5] },      // Bullion Hoarder — Riverhearth Outskirts (zone 5; the fat den fence)
  { key: "crystalbeast", zones: [6] }, // Crystal Stalker — Frostpeak (zone 6; the crystalline ice-beast)
  { key: "goldenstag", zones: [7] },   // Ruin Goldhart — Dawnfall Hold (zone 7; the gilded ruin-beast)
  { key: "reliccherub", zones: [8] },  // Gilt Reliquary — Whisper Hills (zone 8; the holy treasure relic)
  { key: "corsair", zones: [9] },      // Treasure Corsair — Sunbridge (zone 9; the laden corsair)
];
// Chance a random (non-boss) encounter is replaced by an eligible ultra-rare monster.
export const RARE_ENCOUNTER_CHANCE = 0.04;

// V3 (ADR 0018): enemies no longer scale via HP/ATK depth knobs — their stats DERIVE from
// (role, level) in systems/enemyStats, and `depth` (how far into a zone you are) lifts the EFFECTIVE
// level there (DEPTH_LEVELS, in enemyStats). What remains here is a blunt global ease applied in
// makeEnemy AFTER derivation — a difficulty trim the balance-sim tunes.
export const ENEMY_HP_EASE = 0.86;
export const ENEMY_ATK_EASE = 0.82; // v0.212 L10 re-center: the no-rest dungeon attrition tail needed a global trim
