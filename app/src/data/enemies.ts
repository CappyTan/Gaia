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
// LEVEL RE-CENTER (this pass, on top of v0.213/ADR 0021-amended): heroes start at GENUINE LEVEL 1
// again (Dara — reverted the v0.211/v0.212 level-10 start), so the whole Aurelion arc is re-seated
// DOWN from the v0.212 L10-tuned ~L8→19 trash ladder onto a gentle ~L1→12 climb (party runs L1→~10–
// 11) — Greenvale surface is a real-but-fair fight for a fresh L1 party (which already opens 2
// abilities beyond auto-attack day one: mnaFloor(1)=1 + the starter weapon's +10 MNA = 11, past both
// the 5-MNA special and 10-MNA signature milestones), the Ancient Ruins run clearly hotter (it
// borrows Silverwood's higher-level stock), and each zone scales on from there. Same non-obvious
// rules as the v0.212 pass, still sim-derived and still true at this lower band:
//   • BOOKEND LEVELS SIT AT/BELOW THEIR ZONE'S TRASH (every entry's within-zone relative position was
//     preserved while re-anchoring each zone's band down). The miniboss/boss ROLES already carry
//     6–9× HP and 2–2.4× ATK multipliers (systems/enemyStats) plus the depth level-lift (+3 at the
//     boss tile), and enemy power compounds ~14.5%/level — a boss labelled AT or ABOVE its zone's
//     trash top one-shots the sim's whole arc at ANY starting level (a property of the shared curve,
//     not an L10-only artifact). A few zones (Whisper Hills' Corrupted Abbot, Frostpeak's whole cast,
//     Dawnfall, Sunbridge) needed an EXTRA notch below the uniform re-anchor: a boss-role enemy fought
//     at a zone's ~50% "mini-boss" checkpoint reads markedly deadlier than the SAME enemy fought at
//     the zone-end "boss" checkpoint (Storm Coast/Riverhearth/Dawnfall/Whisper Hills reuse one
//     boss-role entry for both), since the party has had less time to out-level it that early.
//   • XP follows one curve of level (~0.5·lvl^1.9 for trash — this pass's K coefficient, down from the
//     v0.212 pass's 2.2, since the shorter L1→~11 climb needs proportionally less reward per kill than
//     the old L10→~21 one; minis/zone bosses keep their v0.212-era MULTIPLE over trash, applied to the
//     new curve; rares outsized) so leveling pace tracks the difficulty ladder. A few very-low-level
//     entries (Greenvale's earliest fodder + its mini/boss) carry an explicit XP FLOOR (3 trash / 15
//     miniboss / 25 boss) — the raw formula rounds to ~0–2 at L1–2, and a "+1 XP" Kingpin kill reads
//     as broken even when the AGGREGATE pacing is right.
// wave8b (balance-reviewer follow-up on wave8): wave8 fixed the L1 wipe wall but overcorrected —
// bosses/minis in 9/10 zones read 60-90% (target 30-50%). Bumped most zone-boss/mini LEVELS by
// +1 (a few +2, always kept BELOW that zone's trash top per the rule above) and added/nudged a
// few VIT leans for bulk without extra one-shot ATK risk (Duskmarsh/Goldmeadow/Frostpeak-mini).
// Reverted Greenvale's brigand/lieutenant bump (hit trash-top, introduced NEW mini wipes for a
// ~5pt gain — not worth it) and left Dawnfall's shared watchcommander entry untouched (it was
// already the closest-to-band zone; a level bump there disproportionately punished the BOSS
// checkpoint via the depth level-lift while barely moving the MINI checkpoint, per the "shared
// entry, two depths" note above — a real structural tension for the four zones that reuse one
// entry as both mini AND boss). KEY FINDING: `ENEMY_ATK_EASE`/`ENEMY_HP_EASE` were tested at
// several values (0.78–0.90) as a possible lever for the "random fights too easy" complaint —
// empirically INEFFECTIVE (skilled-persona proactive healing absorbs the average-fight delta
// almost entirely) while directly and repeatably INFLATING the skilled wipe rate (a pure tail-
// risk cost with no average-metric benefit) — left at the original 0.82/0.86. Net result (N=600,
// multi-run averaged — single-run deltas are noisy, see below): most zone bosses moved ~5-16pts
// closer to band, but the skilled wipe rate moved modestly AGAINST the target — averaging ~22%
// pre-pass to ~25-26% post-pass — rather than the hoped-for drop toward 10%. That's a real (if
// small) cost of bosses biting harder, not a wash; it's an accepted tradeoff (balance-reviewer
// verdict: ship-with-fixes), not a neutral one. The residual gap to the 10% target is dominated
// by the intentional Leviathan knife-edge finale (~6-7% of all runs)
// and pack-composition spike wipes (multi-elite/champion random packs in Frostpeak/Whisper
// Hills/Duskmarsh/Sunbridge) — both explicitly out of a data-only tuner's scope (encounter.ts /
// zone `bands` composition). Frostpeak's holdwarden mini remains stubbornly ~87% despite two
// level bumps + added lean — likely saturated by the same healing-absorption dynamic; flagged
// as a residual for the next pass (needs a bigger structural change, not another nudge).
// FOR WAVE9: `corruptabbot` (Whisper Hills' shared mini/boss) sits BELOW its own zone's trash
// floor even after this pass's bump — a stronger single-knob lead than another blanket sweep.
// `wreckcaptain` (Storm Coast) got the largest raw level bump but no VIT lean unlike its peers
// (broodmother/troll/warcaptain/warlord/holdwarden) — plausibly why it's still ~11pts over band;
// try a lean there before another level nudge. NOTE: `npm run sim`'s combat resolution is
// UNSEEDED (only content rolls are pinned — see balance-sim.ts) — repeated runs at the same N
// showed a ~5-9pt wipe-rate spread from noise alone; average 3+ runs before trusting a delta.
// Tuned via `npm run sim` (see the persona notes there); re-run it after touching any number here.
export const ENEMIES: Record<string, EnemyDef> = {
  // ── ZONE 1: Greenvale (trash L1–3, bookends L1–2 — the fresh-L1-party shire) ──
  slime: { name: "Green Slime", spr: "🟢", att: "ANIMA", lvl: 1, role: "bruiser", lean: { VIT: 1.4, SPD: 0.6 }, xp: 3, gold: [4, 10], ai: "basic", onHit: { poison: 2 } },
  kobold: { name: "Kobold", spr: "🦎", att: "SOL", lvl: 2, role: "skirmisher", xp: 3, gold: [6, 14], ai: "basic" },
  gbandit: { name: "Greenvale Bandit", spr: "🗡️", att: "NOX", lvl: 2, role: "bruiser", xp: 3, gold: [10, 22], ai: "basic" },
  slimebig: { name: "Bloated Slime", spr: "🟢", att: "QUANTA", lvl: 3, role: "wall", lean: { DEF: 0.5, VIT: 1.8 }, xp: 4, gold: [10, 20], ai: "basic", onHit: { poison: 3 }, art: "slime" },
  kobolde: { name: "Kobold Raider", spr: "🦎", att: "UMBRAXIS", lvl: 3, role: "skirmisher", xp: 4, gold: [16, 28], ai: "basic", art: "kobold" },
  gmage: { name: "Greenvale Mage", spr: "🧙", att: "UMBRAXIS", lvl: 3, role: "caster", xp: 4, gold: [18, 30], ai: "caster", skills: ["hex"], castChance: 0.55 },
  brigand: { name: "Bandit Brigadier", spr: "🪖", att: "NOX", lvl: 2, role: "miniboss", xp: 15, gold: [60, 100], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.2, art: "gbandit" },
  // IN-DUNGEON LIEUTENANT (Bandit Warren B2 gate): the MIDDLE step of the warren's spine — the Brigadier
  // guards the overworld MOUTH (L2), the Kingpin is the B3 FINALE (L1 + the depth lift), this gates B2. ~L2; startFloorMini
  // fights it at depth ~0.78, so the depth level-lift makes it a real mini-boss step WITHOUT overtaking the
  // finale. ANIMA keeps the Warren trio spread (Brigadier NOX / lieutenant ANIMA / Kingpin SOL). DRAFT name
  // (flag for Dara), 🔪 placeholder over the gbandit sprite (flag for art-integrator).
  lieutenant: { name: "Bandit Bloodknife", spr: "🔪", att: "ANIMA", lvl: 2, role: "miniboss", xp: 15, gold: [50, 90], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.22 },
  kingpin: { name: "Greenvale Kingpin", spr: "👑", att: "SOL", lvl: 2, role: "boss", xp: 25, gold: [120, 180], ai: "boss", boss: true, skills: ["rally"], castChance: 0.16, enrage: { omega: "kingpin-omega" } },
  // ── ZONE 2: Silverwood — the Ancient Forest (trash L3–5; new region, ADR 0006). Attunements are
  //    spread (Dara's no-region-identity ruling — the forest is NOT an ANIMA theme). CD-authored
  //    bestiary under Dara's granted authority — FLAGGED for Dara / requiem-canon-keeper to vet the
  //    names + lore. Sprites are emoji placeholders (see asset-gaps.md). Roles are mixed so packs play
  //    as different shapes — balance-tuner owns the final role/curve numbers. ──
  dwolf: { name: "Direwolf", spr: "🐺", att: "ANIMA", lvl: 3, role: "skirmisher", xp: 4, gold: [14, 28], ai: "basic" },
  thornling: { name: "Thornling", spr: "🌿", att: "QUANTA", lvl: 3, role: "bruiser", xp: 4, gold: [16, 30], ai: "basic", onHit: { poison: 3 } },
  sylvanarcher: { name: "Sylvan Archer", spr: "🏹", att: "SOL", lvl: 4, role: "harrier", xp: 7, gold: [20, 36], ai: "basic" },
  gloomwisp: { name: "Gloom Wisp", spr: "🔮", att: "UMBRAXIS", lvl: 4, role: "caster", xp: 7, gold: [22, 38], ai: "caster", skills: ["hex"], castChance: 0.5 },
  barkbrute: { name: "Barkhide Brute", spr: "🪵", att: "NOX", lvl: 5, role: "wall", xp: 11, gold: [24, 42], ai: "basic" },
  spriggan: { name: "Spriggan", spr: "🍂", att: "SOL", lvl: 4, role: "skirmisher", xp: 7, gold: [22, 40], ai: "basic", leech: 25 },
  treantelder: { name: "Elder Treant", spr: "🌳", att: "ANIMA", lvl: 4, role: "miniboss", lean: { VIT: 1.3 }, xp: 15, gold: [110, 180], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.25 },
  hollowking: { name: "The Hollow King", spr: "🦌", att: "QUANTA", lvl: 4, role: "boss", xp: 25, gold: [160, 240], ai: "boss", boss: true, skills: ["rally"], castChance: 0.17 },
  mossback: { name: "Mossback Tortoise", spr: "🐢", att: "ANIMA", lvl: 4, role: "rare", lean: { DEF: 9, VIT: 0.3, SPD: 0.4 }, xp: 54, gold: [110, 240], ai: "basic", rare: true },
  // ── ZONE 3: The Duskmarsh → the Drowned Vault (trash L4–6, entered off Silverwood) ──
  rat: { name: "Cave Rat", spr: "🐀", att: "NOX", lvl: 4, role: "skirmisher", xp: 7, gold: [14, 28], ai: "basic" },
  spider: { name: "Cave Spider", spr: "🕷️", att: "ANIMA", lvl: 4, role: "bruiser", xp: 7, gold: [18, 34], ai: "basic", onHit: { poison: 3 } },
  leper: { name: "Cave Leper", spr: "🧟", att: "UMBRAXIS", lvl: 5, role: "bruiser", xp: 11, gold: [20, 38], ai: "basic", leech: 30 },
  direrat: { name: "Dire Rat", spr: "🐀", att: "QUANTA", lvl: 5, role: "skirmisher", xp: 11, gold: [18, 32], ai: "basic", art: "rat" },
  bonespider: { name: "Bone Spider", spr: "🕷️", att: "NOX", lvl: 6, role: "bruiser", xp: 15, gold: [24, 42], ai: "basic", onHit: { poison: 4 }, art: "spider" },
  broodmother: { name: "Vault Broodmother", spr: "🕷️", att: "UMBRAXIS", lvl: 5, role: "miniboss", lean: { VIT: 1.6 }, xp: 21, gold: [120, 200], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "spider" },
  troll: { name: "Cave Troll", spr: "👹", att: "NOX", lvl: 5, role: "boss", lean: { VIT: 1.4, STR: 1.25 }, xp: 33, gold: [260, 400], ai: "boss", boss: true, skills: ["rally"], castChance: 0.22, enrage: { omega: "troll-omega" } },
  // ── ZONE 4: Goldmeadow Plains → the occupied Windmill Undercroft (trash L5–7; new region, first
  //    backlog fill 2026-06-21). The grim tide from the Duskmarsh has spilled onto the open
  //    breadbasket: an open-field WAR HOST (raiders who burned the harvest) plus PLAINS PREDATORS
  //    drawn to the carnage. Attunements stay SPREAD across the ring (Dara's no-region-identity
  //    ruling — surface regions carry no Attunement theme; the lean here is creature/terrain flavor
  //    only). CD-authored under granted authority — names DRAFT, FLAGGED for Dara / requiem-canon-keeper.
  //    Sprites are emoji placeholders (see asset-gaps.md). Role mix: fast skirmishers (marauder/wilddog),
  //    a ranged harrier, a rust-bladed bruiser (raider, whose NOX cuts fester — the onHit DoT is a rotting
  //    wound), a scavenger leecher (carrion), and a slow armored wall (reaver) so packs play as shapes. ──
  raider: { name: "Plains Raider", spr: "🗡️", att: "NOX", lvl: 5, role: "bruiser", xp: 11, gold: [22, 40], ai: "basic", onHit: { poison: 4 } },
  marauder: { name: "Field Marauder", spr: "🏃", att: "SOL", lvl: 5, role: "skirmisher", xp: 11, gold: [22, 40], ai: "basic" },
  harrier: { name: "Plains Harrier", spr: "🏹", att: "QUANTA", lvl: 6, role: "harrier", xp: 15, gold: [24, 42], ai: "basic" },
  wilddog: { name: "Wild Dog", spr: "🐕", att: "ANIMA", lvl: 5, role: "skirmisher", xp: 11, gold: [16, 30], ai: "basic" },
  carrion: { name: "Carrion Bird", spr: "🦅", att: "UMBRAXIS", lvl: 6, role: "skirmisher", xp: 15, gold: [20, 38], ai: "basic", leech: 28 },
  reaver: { name: "Iron Reaver", spr: "🪓", att: "QUANTA", lvl: 7, role: "wall", xp: 20, gold: [28, 48], ai: "basic" },
  // Mini-boss (mouth gate): a raider war-captain who rallies his band; escorted by marauders.
  warcaptain: { name: "Raider War-Captain", spr: "⚔️", att: "NOX", lvl: 6, role: "miniboss", lean: { VIT: 1.35 }, xp: 30, gold: [140, 220], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3 },
  // Zone boss (the windmill): the warlord who leads the host — the run-ender. ENRAGE-flagged like the
  // Kingpin/Cave Troll (omega art TBD; the swap no-ops gracefully until art-integrator supplies it). The
  // VIT lean makes the climax bite (survives the party's burst → more turns of rally/enrage pressure).
  warlord: { name: "The Reaping Warlord", spr: "👹", att: "SOL", lvl: 6, role: "boss", lean: { VIT: 1.4, STR: 1.2 }, xp: 48, gold: [300, 460], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "warlord-omega" } },
  // ════ AURELION COMPLETE — the remaining six regions' rosters (encounter-designer, brief 2026-06-21) ═
  // Authored under granted Director authority. Roles are mixed so packs play as different shapes; levels
  // climb on the curve PAST Goldmeadow (trash L5 → L12). Attunements stay SPREAD across the ring (Dara's
  // no-region-identity ruling). Names DRAFT — FLAGGED for Dara / requiem-canon-keeper. Sprites are emoji
  // placeholders (see asset-gaps.md). Some Goldmeadow predators (wilddog/carrion) are REUSED where they
  // genuinely fit a region's wild fringe, to limit roster sprawl.

  // ── ZONE 5 (index 4): Storm Coast (trash L6–8) — wreckers/pirates + sea-beasts. Fast flankers (cutthroat),
  //    a poison-crab tank, a ranged slinger (deckhand), a serpent leecher; champion = a wrecker-captain. ──
  wrecker: { name: "Coast Wrecker", spr: "🪝", att: "NOX", lvl: 6, role: "bruiser", xp: 15, gold: [24, 44], ai: "basic", onHit: { poison: 4 } },
  cutthroat: { name: "Tide Cutthroat", spr: "🗡️", att: "SOL", lvl: 6, role: "skirmisher", xp: 15, gold: [24, 44], ai: "basic" },
  deckhand: { name: "Pirate Slinger", spr: "🏹", att: "QUANTA", lvl: 7, role: "harrier", xp: 20, gold: [26, 46], ai: "basic" },
  shellcrab: { name: "Reef Crab", spr: "🦀", att: "ANIMA", lvl: 7, role: "wall", xp: 20, gold: [28, 50], ai: "basic", onHit: { poison: 3 } },
  seaserpent: { name: "Brine Serpent", spr: "🐍", att: "UMBRAXIS", lvl: 8, role: "skirmisher", xp: 26, gold: [26, 48], ai: "basic", leech: 30 },
  // Champion guardian (the sea-cave payoff): a tanky multi-threat wrecker-captain. boss:true so the engine
  // routes it through startBoss as the cave's finale — NOT enrage (champion-tier, not a spine boss).
  wreckcaptain: { name: "Wrecker-Captain", spr: "🏴‍☠️", att: "NOX", lvl: 7, role: "boss", xp: 44, gold: [180, 280], ai: "boss", boss: true, skills: ["rally"], castChance: 0.28, art: "wrecker" },

  // ── ZONE 6 (index 5): Riverhearth Outskirts (trash L7–9) — road-bandits, smugglers, river-toughs. A
  //    cosh-bruiser, a fast footpad, a crossbow smuggler, a river-tough wall, a fence-leecher; champion =
  //    a crime-lord. ──
  roadbandit: { name: "Road Bandit", spr: "🗡️", att: "NOX", lvl: 7, role: "bruiser", xp: 20, gold: [28, 50], ai: "basic" },
  footpad: { name: "Wharf Footpad", spr: "🏃", att: "ANIMA", lvl: 7, role: "skirmisher", xp: 20, gold: [28, 50], ai: "basic" },
  smuggler: { name: "Smuggler Crossbow", spr: "🏹", att: "SOL", lvl: 8, role: "harrier", xp: 26, gold: [30, 52], ai: "basic" },
  rivertough: { name: "River Tough", spr: "🪓", att: "QUANTA", lvl: 8, role: "wall", xp: 26, gold: [32, 56], ai: "basic" },
  fence: { name: "Wharf Fence", spr: "🦝", att: "UMBRAXIS", lvl: 9, role: "skirmisher", xp: 33, gold: [34, 58], ai: "basic", leech: 32 },
  crimelord: { name: "River Crime-Lord", spr: "🎩", att: "UMBRAXIS", lvl: 7, role: "boss", xp: 68, gold: [220, 340], ai: "boss", boss: true, skills: ["rally"], castChance: 0.3, art: "roadbandit" },

  // ── ZONE 7 (index 6): Frostpeak Highlands → the Dwarven Stronghold (trash L7–9, SPINE). Frost beasts
  //    (ice wolves, a snow-troll/yeti), mountain reavers, awakened dwarven stone-sentinels. A frost-bite
  //    wolf pack-flanker, a hexing frost-shade caster, a slow stone-sentinel wall, a reaver bruiser; the
  //    yeti is a heavy. Mini = a hold-warden at the gate; boss = a stone/frost guardian (ENRAGE). ──
  icewolf: { name: "Ice Wolf", spr: "🐺", att: "QUANTA", lvl: 7, role: "skirmisher", xp: 20, gold: [26, 48], ai: "basic" },
  mtnreaver: { name: "Mountain Reaver", spr: "🪓", att: "NOX", lvl: 7, role: "bruiser", xp: 20, gold: [30, 54], ai: "basic" },
  frostshade: { name: "Frost Shade", spr: "❄️", att: "UMBRAXIS", lvl: 8, role: "caster", xp: 26, gold: [32, 56], ai: "caster", skills: ["hex"], castChance: 0.5 },
  stonesentinel: { name: "Dwarven Sentinel", spr: "🗿", att: "SOL", lvl: 8, role: "wall", xp: 26, gold: [34, 60], ai: "basic" },
  snowtroll: { name: "Snow Troll", spr: "🦣", att: "ANIMA", lvl: 9, role: "brute", xp: 33, gold: [40, 70], ai: "basic", leech: 24 },
  // A crystalline-quilled pack-predator of the high passes — violet quills laced with a numbing
  // QUANTA venom; a fast bruiser between the Ice Wolf and the Mountain Reaver. (The 7th creature on
  // Dara's Frostpeak sheet; name agent-given 2026-06-22 — rename freely.)
  rimespine: { name: "Rimespine Mauler", spr: "🦔", att: "QUANTA", lvl: 8, role: "skirmisher", xp: 26, gold: [30, 56], ai: "basic", onHit: { poison: 4 } },
  // Mini-boss (hold-gate): the hold-warden who rallies the sentinels. Escorted by mountain reavers.
  holdwarden: { name: "Hold-Warden", spr: "⚒️", att: "SOL", lvl: 8, role: "miniboss", lean: { VIT: 1.6 }, xp: 49, gold: [200, 300], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "stonesentinel" },
  // Zone boss (the stronghold): a stone/frost guardian — the SPINE GATE; must genuinely bite.
  // ENRAGE-flagged (omega art TBD; no-ops until art). The DEF/VIT lean makes it a true wall-boss.
  frostguardian: { name: "The Glacier Guardian", spr: "🧊", att: "QUANTA", lvl: 8, role: "boss", lean: { VIT: 1.2, DEF: 1.4 }, xp: 91, gold: [340, 500], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "frostguardian-omega" } },

  // ── ZONE 8 (index 7): Dawnfall Hold → the breached undervault (trash L9–10). The wilds that broke the fort
  //    + the fallen watch. A feral wild-thing, a broken-watch poison-spear, a ghoul leecher of the fallen
  //    garrison, a ruin-beast wall, a fallen-archer harrier; champion = a fallen watch-commander. ──
  frontierbeast: { name: "Frontier Stalker", spr: "🐗", att: "ANIMA", lvl: 9, role: "skirmisher", xp: 33, gold: [30, 54], ai: "basic" },
  brokenwatch: { name: "Broken Sentry", spr: "🛡️", att: "NOX", lvl: 9, role: "bruiser", xp: 33, gold: [32, 56], ai: "basic", onHit: { poison: 5 } },
  watchghoul: { name: "Garrison Ghoul", spr: "🧟", att: "UMBRAXIS", lvl: 10, role: "bruiser", xp: 40, gold: [32, 58], ai: "basic", leech: 34 },
  ruinhulk: { name: "Rampart Hulk", spr: "🗿", att: "QUANTA", lvl: 10, role: "wall", xp: 40, gold: [38, 66], ai: "basic" },
  fallenarcher: { name: "Fallen Sentry", spr: "🏹", att: "SOL", lvl: 10, role: "harrier", xp: 40, gold: [36, 62], ai: "basic" },
  watchcommander: { name: "Fallen Watch-Commander", spr: "⚔️", att: "SOL", lvl: 8, role: "boss", xp: 110, gold: [240, 360], ai: "boss", boss: true, skills: ["rally"], castChance: 0.3, art: "brokenwatch" },

  // ── ZONE 9 (index 8): Whisper Hills → the reliquary crypt (trash L10–11). Restless spirits + corrupted monks.
  //    A flitting wraith flanker, a chanting corrupted-monk caster, a flagellant poison-zealot, a heavy
  //    reliquary-golem wall, a soul-leech revenant; champion = a corrupted abbot (a casting boss). ──
  wraith: { name: "Restless Wraith", spr: "👻", att: "UMBRAXIS", lvl: 10, role: "skirmisher", xp: 40, gold: [34, 60], ai: "basic" },
  corruptmonk: { name: "Corrupted Monk", spr: "🧎", att: "ANIMA", lvl: 10, role: "caster", xp: 40, gold: [36, 62], ai: "caster", skills: ["hex"], castChance: 0.52 },
  flagellant: { name: "Cloister Flagellant", spr: "⛓️", att: "NOX", lvl: 11, role: "bruiser", xp: 48, gold: [38, 66], ai: "basic", onHit: { poison: 6 } },
  reliquarygolem: { name: "Reliquary Golem", spr: "🗿", att: "SOL", lvl: 11, role: "wall", xp: 48, gold: [42, 72], ai: "basic" },
  revenant: { name: "Crypt Revenant", spr: "💀", att: "QUANTA", lvl: 11, role: "skirmisher", xp: 48, gold: [40, 70], ai: "basic", leech: 36 },
  corruptabbot: { name: "Corrupted Abbot", spr: "📿", att: "UMBRAXIS", lvl: 8, role: "boss", lean: { VIT: 1.4 }, xp: 90, gold: [260, 400], ai: "boss", boss: true, skills: ["rally", "hex"], castChance: 0.32, art: "corruptmonk" },

  // ── ZONE 10 (index 9): Sunbridge → the Besieged Citadel / Lighthouse (trash L11–12, SPINE FINALE / RUN-ENDER).
  //    The besieging host + sea-raiders + something risen from the deep. A siege-trooper bruiser, a fast
  //    sea-raider boarder, a ballista harrier, an abyssal poison-tentacle horror, a drowned leecher, an
  //    armored siege-ram wall. Mini = a siege captain; boss = the leviathan finale (ENRAGE, hardest yet). ──
  siegetrooper: { name: "Siege Trooper", spr: "🪖", att: "NOX", lvl: 11, role: "bruiser", xp: 48, gold: [40, 70], ai: "basic" },
  searaider: { name: "Sea-Raider", spr: "⚔️", att: "SOL", lvl: 11, role: "skirmisher", xp: 48, gold: [40, 70], ai: "basic" },
  ballista: { name: "Ballista Crew", spr: "🏹", att: "QUANTA", lvl: 11, role: "harrier", xp: 54, gold: [42, 74], ai: "basic" },
  abyssspawn: { name: "Abyssal Spawn", spr: "🦑", att: "ANIMA", lvl: 11, role: "bruiser", xp: 54, gold: [44, 76], ai: "basic", onHit: { poison: 6 } },
  drowned: { name: "Drowned Sailor", spr: "🧟", att: "UMBRAXIS", lvl: 11, role: "bruiser", xp: 54, gold: [44, 78], ai: "basic", leech: 38 },
  siegeram: { name: "Siege Ram", spr: "🐏", att: "SOL", lvl: 12, role: "wall", xp: 63, gold: [48, 84], ai: "basic" },
  // Mini-boss (citadel mouth): the siege captain who rallies the host. Escorted by siege troopers.
  siegecaptain: { name: "Siege Captain", spr: "🎖️", att: "NOX", lvl: 11, role: "miniboss", xp: 116, gold: [280, 420], ai: "boss", miniboss: true, skills: ["rally"], castChance: 0.3, art: "siegetrooper" },
  // CONTINENT-FINALE BOSS (the lighthouse summit): something risen from the deep — THE HARDEST FIGHT IN
  // THE GAME. ENRAGE-flagged (omega art TBD; no-ops until art). The highest BOSS level in the game +
  // its VIT/STR lean make it out-stat every prior boss under the shared boss curve — the apex
  // run-ender (the sim reads it as a knife-edge ~15% low-point win). balance-tuner owns the tune.
  leviathan: { name: "The Risen Leviathan", spr: "🐙", att: "ANIMA", lvl: 10, role: "boss", lean: { VIT: 1.35, STR: 1.2 }, xp: 225, gold: [500, 760], ai: "boss", boss: true, skills: ["rally"], castChance: 0.2, enrage: { omega: "leviathan-omega" } },

  // ── ULTRA-RARE treasure monsters (Metal-Slime / Warmech tier): very rare spawns, exceptional loot.
  //    All role:"rare" with a strong `lean`: the "metal" jackpots lean DEF huge + VIT near zero (tiny HP,
  //    enormous armor — chip for ~1 unless you crit/hit affinity — fast, weak attackers); the dangerous
  //    beasts (Warmech, Corsair) lean VIT/STR (tanky hitters with outsized hoards). ──
  hogger: { name: "Hogger", spr: "🐗", att: "ANIMA", lvl: 4, role: "rare", lean: { VIT: 2.2, STR: 1.2 }, xp: 57, gold: [90, 170], ai: "basic", rare: true },
  metalslime: { name: "Metal Slime", spr: "🪙", att: "QUANTA", lvl: 3, role: "rare", lean: { DEF: 9, VIT: 0.2, SPD: 2.5 }, xp: 32, gold: [40, 90], ai: "evasive", rare: true },
  metalbabble: { name: "Metal Babble", spr: "🪙", att: "UMBRAXIS", lvl: 5, role: "rare", lean: { DEF: 12, VIT: 0.2, SPD: 2.5 }, xp: 85, gold: [100, 240], ai: "evasive", rare: true },
  // Warmech (FF1 homage — wave6c): the ancient war construct now stalks THE LONG BRIDGE in the
  // Ancient Ruins' Sealed Deep (floor 3): each step on the causeway risks the ambush (systems/
  // encounter.BRIDGE_AMBUSH_CHANCE, wired in controllers/field.move — never consumed, later
  // crossings re-roll). Deliberately OUT-LEVELS the entire shipped arc (endgame trash tops at L19):
  // a bruiser/wall hybrid lean (heavy STR+VIT+DEF, slow) that is brutally hard for the current arc
  // but beatable by a strong late party — for a jackpot hoard (rare ⇒ the 3-drop treasure spoil +
  // outsized XP/gold). Canon home remains Titan Prime (future zone).
  warmech: { name: "Warmech", spr: "🤖", att: "QUANTA", lvl: 23, role: "rare", lean: { STR: 1.8, AGI: 0.5, VIT: 2.6, SPD: 0.4, DEF: 1.8 }, xp: 6200, gold: [700, 1300], ai: "basic", rare: true },
  // A fat, slow, gilded beast gorged on the golden harvest — wanders the wheat of Goldmeadow. Metal-
  // Slime/Hogger tier: huge armor + middling HP (chips for ~1 unless you crit/hit affinity), slow.
  goldsow: { name: "Gilded Sow", spr: "🐖", att: "ANIMA", lvl: 7, role: "rare", lean: { DEF: 3, VIT: 1.4, SPD: 0.4 }, xp: 145, gold: [260, 500], ai: "basic", rare: true },
  // ── AURELION COMPLETE rares (one per new region; treasure-tier, ~4% replace, exceptional loot). DRAFT
  //    names FLAGGED for Dara. A mix of high-armor "metal" jackpots and dangerous-but-rich beasts. ──
  pearlcrab: { name: "Pearlshell Crab", spr: "🦀", att: "QUANTA", lvl: 8, role: "rare", lean: { DEF: 4, VIT: 1.5 }, xp: 186, gold: [300, 560], ai: "basic", rare: true },        // Storm Coast: armored treasure-beast
  bullion: { name: "Bullion Hoarder", spr: "🪙", att: "SOL", lvl: 8, role: "rare", lean: { DEF: 13, VIT: 0.2, SPD: 2.5 }, xp: 186, gold: [220, 520], ai: "evasive", rare: true },  // Riverhearth: Metal-Slime-tier den fence
  crystalbeast: { name: "Crystal Stalker", spr: "💎", att: "UMBRAXIS", lvl: 8, role: "rare", lean: { DEF: 4, VIT: 1.5 }, xp: 183, gold: [340, 640], ai: "basic", rare: true },    // Frostpeak: the crystalline ice-beast
  goldenstag: { name: "Ruin Goldhart", spr: "🦌", att: "ANIMA", lvl: 10, role: "rare", lean: { DEF: 2.5, VIT: 1.5, SPD: 1.5 }, xp: 267, gold: [360, 680], ai: "basic", rare: true }, // Dawnfall: skittish gilded ruin-beast
  reliccherub: { name: "Gilt Reliquary", spr: "🕯️", att: "SOL", lvl: 11, role: "rare", lean: { DEF: 15, VIT: 0.2, SPD: 2.5 }, xp: 324, gold: [400, 720], ai: "evasive", rare: true }, // Whisper Hills: Metal-Babble-tier holy relic
  corsair: { name: "Treasure Corsair", spr: "🦜", att: "QUANTA", lvl: 13, role: "rare", lean: { VIT: 3, STR: 1.6 }, xp: 479, gold: [600, 1100], ai: "basic", rare: true },          // Sunbridge: a richly-laden, dangerous corsair

  // ── THE GATE GUARDIAN (wave6c — the Ancient Ruins' Sealed Deep). Defense Platform V.04 - #13: the
  //    ancient civilization's gate-ward — version .04 of the Defense Platform line, unit THIRTEEN, so
  //    at least a dozen more stand somewhere. A far-ENDGAME setpiece boss (~L35, +MNA-100-equivalent):
  //    tens of thousands of HP behind a wall of DEF, with the scripted three-turn opener → VAULT PURGE
  //    PROTOCOL full-party laser (systems/bossScripts → controllers/battle.runScriptStep). It MUST
  //    overpower any current-arc party — only a far-endgame roster genuinely takes it on. Reached only
  //    through an explicit Engage/Withdraw warning at the sealed gate (controllers/field.touchSeal);
  //    never a random spawn, in no zone's encounter tables. boss:true = boss-tier render/AI/stun
  //    immunity + boss spoils, but it is NOT any zone's authored `boss`, so the zone-advance flow
  //    ignores it (battle.end's zone-boss identity check). Emoji placeholder — flag for art-integrator.
  //    LEAN NOTE: at L35 the V3 primaries make the abp amplifier ENORMOUS (~×8.4 on all output), so
  //    STR is leaned near zero — the derived basic still one-shots any current hero (~990); the
  //    party-wide Vault Purge magnitude is calibrated in controllers/battle.VAULT_PURGE.power.
  defplatform: { name: "Defense Platform V.04 - #13", spr: "🗼", att: "QUANTA", lvl: 35, role: "boss", lean: { STR: 0.05, AGI: 0.6, VIT: 0.3, SPD: 0.1, DEF: 2.2 }, xp: 9000, gold: [1500, 2400], ai: "boss", boss: true },
};

// Pool of ultra-rare monsters eligible to crash a random encounter, with the zone index they
// can appear in. Kept tiny + data-driven — add an entry to introduce a new rare.
export const RARE_MONSTERS: { key: string; zones: number[] }[] = [
  { key: "hogger", zones: [0] },      // Hogger prowls Greenvale (zone 0)
  { key: "metalslime", zones: [0] },  // Metal Slime — Greenvale (zone 0)
  { key: "mossback", zones: [1] },    // Mossback Tortoise — Silverwood (zone 1; also its grove lair)
  { key: "metalbabble", zones: [2] }, // Metal Babble — the Drowned Vault (zone 2; rarer, richer)
  // (Warmech is NOT in this pool — wave6c re-homed it to the Sealed Deep's bridge, where it ambushes
  //  per-step via BRIDGE_AMBUSH_CHANCE in controllers/field.move, not via the random rare roll.)
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
export const ENEMY_ATK_EASE = 0.82;
