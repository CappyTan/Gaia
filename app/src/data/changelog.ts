// In-game patch notes — the full version history, newest first. Surfaced under Stats so we can
// see the whole arc of the POC. Add a line here whenever GAME_VERSION bumps.

export interface ChangeEntry {
  v: string;
  t: string;
}

export const CHANGELOG: ChangeEntry[] = [
  { v: "v0.42", t: "The Greenvale Outpost is now a real, walkable town — you roam a cobbled plaza and step up to each building to use it: the Inn (free rest), the Merchant (Supplies), the Smith, and the Revive shrine, then the south gate to head on. Replaces the menu-style hub." },
  { v: "v0.41", t: "First town — the Greenvale Outpost hub now sits between zones (in place of the bare merchant): Rest & Recover (free full heal), Visit Merchant, Revive Fallen, Character Status, Head Back Out, Start Over — plus a Smith placeholder for crafting to come." },
  { v: "v0.40", t: "UX pass from Dara's notes — Party screen redone with a vertical, thumb-friendly MNA allocator (big +/− per Attunement, free undo); boss sprites render big and centered in battle; the combat log is now a calm 2-line ticker instead of a cluttered scroll over the party." },
  { v: "v0.39", t: "The Data screen is now an editor — toggle Edit to tweak enemy and ability numbers live (validated as you go), with the changes persisting and an Export to a JSON patch. Lets a designer balance by hand; the code stays the source of truth." },
  { v: "v0.38", t: "Content browser — a 'Data' screen on the title that lays out the whole game database (bestiary, abilities, the 45 classes, zones) for design/balance visibility at a glance." },
  { v: "v0.37", t: "Difficulty + pacing retune — fights now actually cost HP and bosses bite, tuned against a 'skilled' player model in the sim; steeper XP so you reach the boss around level 10 instead of out-leveling it." },
  { v: "v0.36", t: "High-res hero backgrounds — a proper Greenvale grassland plus distinct backdrops for the Bandit Warren (warm) and Drowned Vault (cold), each dungeon now its own scene." },
  { v: "v0.35", t: "Affinity ring ratified + tuned to a modest ±15% (was ±50%) so gear and skill matter more than matchup; enemies rebalanced to suit." },
  { v: "v0.34", t: "Battle visual pass — crisp sprite outlines + contrast, formations grounded out of the sky, higher-fidelity re-sliced backgrounds, hero names colored by Attunement; Warmech ultra-rare added." },
  { v: "v0.33", t: "Cave Troll boss re-tuned to NOX so the final fight has a real affinity matchup." },
  { v: "v0.32", t: "Dara's canon bestiary (Greenvale + Drowned Vault, SOL/NOX bosses); SOL de-weighted everywhere; ultra-rare monster tier — Hogger, Metal Slime, Metal Babble." },
  { v: "v0.31", t: "Crit-hit burst VFX — a per-Attunement spark that pops and fades on a critical." },
  { v: "v0.30", t: "Six gear slots (helmet/armor/gloves/boots/weapon/trinket); level-banded loot with ilvl scaling; sell loot back to the merchant." },
  { v: "v0.29", t: "All 45 classes get distinct ability kits generated from REQUIEM canon; mid-run telemetry save." },
  { v: "v0.28", t: "Serverless telemetry auto-save — runs commit themselves to the repo via a Cloudflare Worker." },
  { v: "v0.27", t: "Loot → equip flow with green/red stat-delta arrows." },
  { v: "v0.26", t: "Dungeon tilesets + combat feel pass — faster enemies, stun immunity for tough foes, front/back formation." },
  { v: "v0.25", t: "Loot repass so every Attunement drops; telemetry copy-export; field art polish." },
  { v: "v0.24", t: "Party of five (3 front / 2 back), champion packs, Greenvale tileset, build-any-Attunement Roster picker." },
  { v: "v0.23", t: "Painterly art pass — per-Attunement weapons, 45 class bodies, armor icons, hero-sized weapons." },
  { v: "v0.22", t: "All 45 class bodies + per-Attunement Dual Swords and armor icons." },
  { v: "v0.21", t: "Painterly per-Attunement weapon art + weaponless SOL hero bodies." },
  { v: "v0.20", t: "Fixed accidental battle-exit from stray taps at the start of a fight." },
  { v: "v0.19", t: "Wired Dara's painterly terrain backgrounds into battle." },
  { v: "v0.18", t: "Applied the UX-review findings — legibility and clarity polish." },
  { v: "v0.17", t: "Skill-tree visualizer + ability tooltips; foreign-weapon fixes." },
  { v: "v0.16", t: "Beyond SOL — weapon-driven reclassing and the first NOX classes." },
  { v: "v0.15", t: "Dungeons; ingested the base-model and gear art." },
  { v: "v0.14", t: "MNA allocator UI + respec." },
  { v: "v0.13", t: "MNA progression engine + loot scaling, more skills, rebalance." },
  { v: "v0.12", t: "Re-architected to modular TypeScript + Vite (the frozen single-file build is v0.11)." },
  { v: "v0.11", t: "Second zone — The Duskmarsh — and a merchant between zones." },
  { v: "v0.10", t: "Per-screen music style; battle stray-tap fix." },
  { v: "v0.9", t: "Punchier home theme + three switchable music variants." },
  { v: "v0.8", t: "Procedural chiptune soundtrack (Web Audio — no asset files)." },
  { v: "v0.7", t: "Paper-doll character compositor (ADR 0004)." },
  { v: "v0.6", t: "Transparent sprites + dark scenes; equipped weapon shown on heroes." },
  { v: "v0.5", t: "Real difficulty via depth-scaled enemies; glitch and art-bleed fixes." },
  { v: "v0.4", t: "Wired in Dara's real art — weapons, enemies, heroes." },
  { v: "v0.3", t: "Bigger bestiary, enemy abilities, a mini-boss gate, and treasure chests." },
  { v: "v0.2", t: "Longer run, gradual leveling, tougher fights; fixed a victory soft-lock." },
  { v: "v0.1", t: "First playable Greenvale vertical slice." },
];
