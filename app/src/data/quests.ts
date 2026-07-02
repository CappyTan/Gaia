// Quest definitions — pure data (the engine lives in systems/quests). Wave6d expands the original
// Hearthford chain (Dara) to the WHOLE continent: every front-door town fields its own sequential,
// non-repeatable kill-bounty chain against ITS zone's actual cast (spine zones get 3 steps ending on
// the zone boss; optional zones get 2), plus a few OVERWORLD quests given by wayside petitioners at
// existing landmark POIs (Dara: "take the liberty"). Rewards stay deliberately SIGNIFICANT and scale
// with the arc — Aether ~250→3000, gear floorMin rarity rising rare→epic→legendary→artifact (ADR 0015
// mods), ilvl tracking each zone's drop range. Every kill key must spawn in its quest's zone
// (bands / bookends) — enforced in tests/quests.test.ts.

import type { RarityKey } from "../types";
import { SETTLEMENTS } from "./towns";

export interface QuestDef {
  id: string;
  name: string;
  /** Giver SCOPE id: a settlement id (town giver) or a synthetic id (overworld POI giver). */
  town: string;
  /** NPC id within that settlement — or "poi" for a wayside (overworld landmark) giver. */
  giver: string;
  /** The ZONES id whose cast this bounty hunts (kill keys must spawn there — tests enforce). */
  zone: string;
  /** Finale step vs the zone's one-time boss — the giver auto-credits if he's already fallen. */
  boss?: boolean;
  /** Overworld giver: the landmark POI name (in `zone`) the petitioner waits at + their display name. */
  poi?: { at: string; giver: string };
  brief: string;    // giver's offer prose
  doneLine: string; // giver's turn-in prose
  kill: { keys: string[]; count: number; label: string };
  reward: { aether: number; gearIlvl: number; gearRarity: RarityKey };
  next?: string;    // the chain
}

export const QUESTS: Record<string, QuestDef> = {
  // ── Hearthford / Greenvale (Watchman Bram) — the original chain ────────────────────────────
  "gv-kobolds": {
    id: "gv-kobolds", name: "Cull the Long Grass", town: "hearthford", giver: "guard", zone: "greenvale",
    brief: "Kobolds in the long grass — ten of them at least, bold as brass since the bandits stirred everything up. Thin them out for me and Hearthford's purse will thank you properly.",
    doneLine: "Ten kobolds quieter out there. You work clean. Here — the purse, and something from the armory rack. Now, about those bandits…",
    kill: { keys: ["kobold", "kobolde"], count: 10, label: "kobolds" },
    reward: { aether: 250, gearIlvl: 9, gearRarity: "rare" },
    next: "gv-bandits",
  },
  "gv-bandits": {
    id: "gv-bandits", name: "Clear the Roads", town: "hearthford", giver: "guard", zone: "greenvale",
    brief: "The Greenvale Bandits bleed this shire white — wagons robbed, farms scared quiet. Put five of them down and the roads breathe again.",
    doneLine: "Five fewer knives on the road. The carters will sing about you, if carters sang. Take this — and listen: the one who sends them all is still out there.",
    kill: { keys: ["gbandit"], count: 5, label: "Greenvale Bandits" },
    reward: { aether: 450, gearIlvl: 11, gearRarity: "epic" },
    next: "gv-kingpin",
  },
  "gv-kingpin": {
    id: "gv-kingpin", name: "The Kingpin Falls", town: "hearthford", giver: "guard", zone: "greenvale", boss: true,
    brief: "Every raid, every toll, every burned barn traces back to one crown — the Greenvale Kingpin, holed up past the Bandit Warren. End him, and Greenvale is free. This is the big one.",
    doneLine: "The Kingpin — actually down. I'll be honest, I didn't think anyone would ever collect this bounty. Greenvale owes you more than this, but start with this.",
    kill: { keys: ["kingpin"], count: 1, label: "the Greenvale Kingpin" },
    reward: { aether: 1000, gearIlvl: 13, gearRarity: "legendary" },
  },

  // ── Elderbough / Silverwood (Warden Eira) ───────────────────────────────────────────────────
  "sw-wolves": {
    id: "sw-wolves", name: "Teeth of the Wood", town: "elderbough", giver: "warden", zone: "silverwood",
    brief: "The direwolves run in daylight now — eight of them shadowed the last forager home to the lanterns. Thin the pack and the paths breathe again. The wood won't thank you. I will.",
    doneLine: "Eight fewer shadows between the trees. You walk soft and strike true — Elderbough can use that. Take this, and don't wander far.",
    kill: { keys: ["dwolf"], count: 8, label: "Direwolves" },
    reward: { aether: 300, gearIlvl: 11, gearRarity: "rare" },
    next: "sw-wisps",
  },
  "sw-wisps": {
    id: "sw-wisps", name: "Lights Off the Path", town: "elderbough", giver: "warden", zone: "silverwood",
    brief: "Gloom-wisps drifting at the trail-edge, sylvan bows behind them — they've led two of mine off the marked paths, and the deep kept both. Put six of those false lights and their archers out.",
    doneLine: "The paths run darker tonight — and safer for it. Whatever wears a crown down in the Grove felt that, mark me. Here's your due.",
    kill: { keys: ["gloomwisp", "sylvanarcher"], count: 6, label: "wisps and sylvan archers" },
    reward: { aether: 550, gearIlvl: 12, gearRarity: "epic" },
    next: "sw-hollowking",
  },
  "sw-hollowking": {
    id: "sw-hollowking", name: "The Hollow Crown", town: "elderbough", giver: "warden", zone: "silverwood", boss: true,
    brief: "The Hollow King holds the Sunless Grove — a guardian once, hollow now, calling the whole wood to fill him. While he stands, Silverwood only gets darker. Go down the ravine and end the calling.",
    doneLine: "The wood went quiet the moment he fell — truly quiet, the old way. I'd near forgotten the sound. Elderbough owes you a debt no purse holds. Take this anyway.",
    kill: { keys: ["hollowking"], count: 1, label: "the Hollow King" },
    reward: { aether: 1150, gearIlvl: 14, gearRarity: "legendary" },
  },

  // ── Miregard / The Duskmarsh (Marsh-Warden Coll) ────────────────────────────────────────────
  "dm-vermin": {
    id: "dm-vermin", name: "What the Water Left", town: "miregard", giver: "warden", zone: "duskmarsh",
    brief: "Rats off the drowned roads — ten at least, gnawing at the causeway pilings under our feet. Drown a few for Miregard and I'll see the purse opened.",
    doneLine: "The planks creak easier already. Small work, maybe — but out here the small work is what keeps our heads above the water. Here.",
    kill: { keys: ["rat", "direrat"], count: 10, label: "marsh rats" },
    reward: { aether: 350, gearIlvl: 12, gearRarity: "rare" },
    next: "dm-spiders",
  },
  "dm-spiders": {
    id: "dm-spiders", name: "Silk Over the Causeway", town: "miregard", giver: "warden", zone: "duskmarsh",
    brief: "Spiders web the east paths — the Broodmother's get, spinning the dark before the Vault. Six of them cut down, and my patrols might start coming home again.",
    doneLine: "Six of the spinners gone. The webs are already sagging off the dead trees. You've bought the marsh-folk a season of breathing — take the bounty, it's honest-earned.",
    kill: { keys: ["spider", "bonespider"], count: 6, label: "marsh spiders" },
    reward: { aether: 600, gearIlvl: 13, gearRarity: "epic" },
    next: "dm-troll",
  },
  "dm-troll": {
    id: "dm-troll", name: "The Troll Below", town: "miregard", giver: "warden", zone: "duskmarsh", boss: true,
    brief: "Under the Drowned Vault sits the troll — old as the mire and twice as spiteful, the reason the water climbs and the dead don't rest. Kill it, and the Duskmarsh loosens its grip on all of us.",
    doneLine: "The troll — dead in the deep. The water's already falling back from the pilings, I'd swear it. Miregard stands another year because of you. Take this, and take our thanks with it.",
    kill: { keys: ["troll"], count: 1, label: "the Cave Troll" },
    reward: { aether: 1250, gearIlvl: 14, gearRarity: "legendary" },
  },

  // ── Wheatcross / Goldmeadow Plains (Reeve Haldor) ───────────────────────────────────────────
  "gm-scavengers": {
    id: "gm-scavengers", name: "Wolves in the Wheat", town: "wheatcross", giver: "reeve", zone: "goldmeadow",
    brief: "Wild dogs and the Warlord's fast runners work the standing wheat — ten of them between my farms and the harvest. Clear them and the reapers go out with both eyes on the grain again.",
    doneLine: "Ten fewer teeth in the wheat. The reapers went out this morning singing — singing, in a war. That's your doing. Here's Wheatcross's thanks.",
    kill: { keys: ["wilddog", "marauder"], count: 10, label: "dogs and marauders" },
    reward: { aether: 400, gearIlvl: 13, gearRarity: "rare" },
    next: "gm-raiders",
  },
  "gm-raiders": {
    id: "gm-raiders", name: "Break the Line", town: "wheatcross", giver: "reeve", zone: "goldmeadow",
    brief: "The host's real muscle — Plains Raiders with their rust blades, Iron Reavers in that black armor. Six of them broken and the Warlord's line west of the creek folds.",
    doneLine: "Six of his best face-down in the furrows. The host pulled back to the mill by nightfall — first ground we've won back all season. Take this, and hear me out on one thing more.",
    kill: { keys: ["raider", "reaver"], count: 6, label: "Raiders and Reavers" },
    reward: { aether: 700, gearIlvl: 14, gearRarity: "epic" },
    next: "gm-warlord",
  },
  "gm-warlord": {
    id: "gm-warlord", name: "The Reaping Ends", town: "wheatcross", giver: "reeve", zone: "goldmeadow", boss: true,
    brief: "The Reaping Warlord sits in MY mill and eats MY shire one rick at a time. Cut the head off the host and the raiders scatter to the winds. Leave him, and there's no Wheatcross come winter.",
    doneLine: "The Warlord's fallen and the mill flies no banner at all — which is to say, ours. Six villages will eat this winter because of you. It's not payment enough. It's what we have.",
    kill: { keys: ["warlord"], count: 1, label: "the Reaping Warlord" },
    reward: { aether: 1400, gearIlvl: 15, gearRarity: "legendary" },
  },

  // ── Wrackport / Storm Coast (Coast-Watch Brann) — optional zone, 2 steps ────────────────────
  "sc-cutthroats": {
    id: "sc-cutthroats", name: "Knives on the Strand", town: "wrackport", giver: "warden", zone: "stormcoast",
    brief: "Tide Cutthroats on the north strand and Reef Crabs in the shallows — eight of them between us and honest fishing water. The coast-watch is three men and a bad lantern. Be the fourth.",
    doneLine: "Eight fewer on the strand, and the boats went out past the point today — first time in a month. The watch counts you one of ours now, for whatever that's worth. This is worth more.",
    kill: { keys: ["cutthroat", "shellcrab"], count: 8, label: "Cutthroats and Reef Crabs" },
    reward: { aether: 500, gearIlvl: 14, gearRarity: "epic" },
    next: "sc-wreckcaptain",
  },
  "sc-wreckcaptain": {
    id: "sc-wreckcaptain", name: "The False Light", town: "wrackport", giver: "warden", zone: "stormcoast", boss: true,
    brief: "The Wrecker-Captain swings his false lantern from the Sea-Cave and counts the drowned among his profits. Snuff him, and every crew on this coast sails a kinder sea.",
    doneLine: "The Captain's flag is down and his lantern's dark for good. There'll be sailors who never learn your name owing you their lives. Wrackport knows it, though. Take this.",
    kill: { keys: ["wreckcaptain"], count: 1, label: "the Wrecker-Captain" },
    reward: { aether: 1550, gearIlvl: 16, gearRarity: "legendary" },
  },

  // ── Riverhearth / Riverhearth Outskirts (Captain Aldric) — optional zone, 2 steps ───────────
  "rh-roads": {
    id: "rh-roads", name: "Peace on the Roads", town: "riverhearth", giver: "capt", zone: "riverhearth",
    brief: "Within these walls the peace holds. Past the gate, road-bandits and wharf footpads work every cart that rolls for the city. Eight of them off my roads — the Watch can't ride that far, and you can.",
    doneLine: "Eight collars I didn't have to make. The caravans came in on time this week for the first time since spring. The Riverhall notices such things — and pays for them. Here.",
    kill: { keys: ["roadbandit", "footpad"], count: 8, label: "bandits and footpads" },
    reward: { aether: 550, gearIlvl: 15, gearRarity: "epic" },
    next: "rh-crimelord",
  },
  "rh-crimelord": {
    id: "rh-crimelord", name: "The River's Crown", town: "riverhearth", giver: "capt", zone: "riverhearth", boss: true,
    brief: "Every smuggler, fence, and river-tough on the outskirts answers to one man — the Crime-Lord, holed up in his den off the wharf-roads. He's bought half my informants and buried the other half. End him.",
    doneLine: "The Crime-Lord — down, and his whole web already eating itself over the remains. You did in a night what the Watch couldn't do in ten years. That buys you the city's gratitude, and this.",
    kill: { keys: ["crimelord"], count: 1, label: "the River Crime-Lord" },
    reward: { aether: 1700, gearIlvl: 17, gearRarity: "legendary" },
  },

  // ── Frosthold / Frostpeak Highlands (Hold-Warden Durgan) ────────────────────────────────────
  "fp-wolves": {
    id: "fp-wolves", name: "The White Hunt", town: "frosthold", giver: "holdwarden", zone: "frostpeak",
    brief: "Ice Wolves come down the cut when the wind howls, and the quilled maulers with them — eight beasts between my gate and the high passes. Hunt them, surface-walker, and Frosthold will weigh your worth in proper coin.",
    doneLine: "Eight beasts fewer on the passes. You hunt like a dwarf twice your years — I'll say no higher praise, for there is none. Your coin, as weighed.",
    kill: { keys: ["icewolf", "rimespine"], count: 8, label: "Ice Wolves and Maulers" },
    reward: { aether: 650, gearIlvl: 16, gearRarity: "epic" },
    next: "fp-sentinels",
  },
  "fp-sentinels": {
    id: "fp-sentinels", name: "Stone Against Stone", town: "frosthold", giver: "holdwarden", zone: "frostpeak",
    brief: "Our own Sentinels stand against us now, and the frost-shades whisper them onward. Break six of the turned watchers. It is stone our forefathers carved — so let it be us who pays to have it unmade.",
    doneLine: "Six of the turned watchers, dust and quiet. It grieves the hold and frees it in the same stroke. You've earned this twice over — once for the deed, once for understanding what it cost us.",
    kill: { keys: ["stonesentinel", "frostshade"], count: 6, label: "Sentinels and Frost Shades" },
    reward: { aether: 1050, gearIlvl: 17, gearRarity: "legendary" },
    next: "fp-guardian",
  },
  "fp-guardian": {
    id: "fp-guardian", name: "The Under-Throne", town: "frosthold", giver: "holdwarden", zone: "frostpeak", boss: true,
    brief: "The Glacier Guardian sits the under-throne and holds our stolen binding in its fist. Bring the deep hold back to us, surface-walker — end it — and Frosthold will not forget while stone endures.",
    doneLine: "The Guardian broken, the binding loosed, the Sentinels still. The deep hold is OURS again. While stone endures, Frosthold remembers — and Frosthold pays its debts. Take this, friend of the hold.",
    kill: { keys: ["frostguardian"], count: 1, label: "the Glacier Guardian" },
    reward: { aether: 1950, gearIlvl: 18, gearRarity: "legendary" },
  },

  // ── Lastlight / Dawnfall Hold (Captain Roan) — optional zone, 2 steps ───────────────────────
  "df-watch": {
    id: "df-watch", name: "Mercy on the Wall", town: "lastlight", giver: "commander", zone: "dawnfall",
    brief: "The Broken Sentries walk the rounds they walked in life, and the Fallen Sentries still man the towers. Eight of them laid down — and understand, it IS laying them down. A mercy. Say that to yourself when your arm hesitates.",
    doneLine: "Eight of our brothers at rest — truly at rest. My men saw the wall stand a little emptier this morning, and some of them wept, and none of them are ashamed. The garrison pays this gladly.",
    kill: { keys: ["brokenwatch", "fallenarcher"], count: 8, label: "Broken and Fallen Sentries" },
    reward: { aether: 750, gearIlvl: 17, gearRarity: "epic" },
    next: "df-commander",
  },
  "df-commander": {
    id: "df-commander", name: "The Last Order", town: "lastlight", giver: "commander", zone: "dawnfall", boss: true,
    brief: "The Watch-Commander I served under for ten years leads the dead on the wall he once kept. Whatever wears his face, it drills them still. Put him down, and the watch he loved can finally stand down with him.",
    doneLine: "It's done, then. The wall is empty and the rounds have stopped. I'll write his name in the roll of honor tonight — the man's name, not the thing's. You gave me back the right to. No purse squares that, but here's ours.",
    kill: { keys: ["watchcommander"], count: 1, label: "the Fallen Watch-Commander" },
    reward: { aether: 2200, gearIlvl: 18, gearRarity: "artifact" },
  },

  // ── Vesperhal / Whisper Hills (Abbot Ferrun) — optional zone, 2 steps ───────────────────────
  "wh-wraiths": {
    id: "wh-wraiths", name: "Rest for the Restless", town: "vesperhal", giver: "abbot", zone: "whisperhills",
    brief: "The wraiths in the upper cloister were brothers who died refusing the prayer; the monks on the hill-paths are brothers who did not. Grant eight of them the gentler ending. It is the last rite we can offer them, and we cannot offer it ourselves.",
    doneLine: "Eight brothers at rest. We rang the true bell for each of them as they fell — you'll not have heard it out on the hills, but they did. The order gives this with both hands.",
    kill: { keys: ["wraith", "corruptmonk"], count: 8, label: "wraiths and Corrupted Monks" },
    reward: { aether: 900, gearIlvl: 18, gearRarity: "legendary" },
    next: "wh-abbot",
  },
  "wh-abbot": {
    id: "wh-abbot", name: "The Unfinished Prayer", town: "vesperhal", giver: "abbot", zone: "whisperhills", boss: true,
    brief: "My own prior leads the fallen rite — the Corrupted Abbot now, finishing a prayer that should never be finished. The rite holds them all; break the one who leads it, and the rest may yet find their rest. Mercy may be the only ending left.",
    doneLine: "The second bell has stopped. Do you understand what that means, traveler? Sixty years it will take me to believe it. The hills are ours to grieve and mend now — because of you. Take this blessing, and everything with it.",
    kill: { keys: ["corruptabbot"], count: 1, label: "the Corrupted Abbot" },
    reward: { aether: 2500, gearIlvl: 19, gearRarity: "artifact" },
  },

  // ── Sunpier / Sunbridge (Portmaster Calla) — the siege finale, 3 steps ──────────────────────
  "sb-raiders": {
    id: "sb-raiders", name: "Hold the Quays", town: "sunpier", giver: "portmaster", zone: "sunbridge",
    brief: "Sea-Raiders on the water, Siege Troopers at the landward wall — ten of them off my quays and the sea-gate holds another week. A thousand years this port has stood. Help me make it a thousand and one.",
    doneLine: "Ten of theirs down and the sea-gate still ours. The defenders are saying your name on the wall like it's a watchword. Sunpier pays her debts while she stands — and she stands. Here.",
    kill: { keys: ["searaider", "siegetrooper"], count: 10, label: "Raiders and Troopers" },
    reward: { aether: 1100, gearIlvl: 18, gearRarity: "legendary" },
    next: "sb-engines",
  },
  "sb-engines": {
    id: "sb-engines", name: "Break the Engines", town: "sunpier", giver: "portmaster", zone: "sunbridge",
    brief: "Their ballistae rake the sea-wall and the rams come at the gate each dawn. Break six of the siege engines and their crews, and this harbor buys the time it's dying for.",
    doneLine: "Six engines wrecked on the flats — the wall took no fire at all this dawn. You've bought Sunpier her breath back. Now spend it well, because the worst of this siege isn't the siege.",
    kill: { keys: ["ballista", "siegeram"], count: 6, label: "Ballista Crews and Siege Rams" },
    reward: { aether: 1800, gearIlvl: 19, gearRarity: "legendary" },
    next: "sb-leviathan",
  },
  "sb-leviathan": {
    id: "sb-leviathan", name: "The Deep Rises", town: "sunpier", giver: "portmaster", zone: "sunbridge", boss: true,
    brief: "The siege woke something out past the reef — the Risen Leviathan, vast as a drowned hill, and it means to end the last free harbor of Aurelion. Your whole long road led here. If it ends, let it end well.",
    doneLine: "The Leviathan — gone back to the dark, dead, by YOUR hand. The bay is bright again and the bells haven't stopped since it sank. A thousand years from now they'll still tell it. Take the harbor's whole gratitude — starting with this.",
    kill: { keys: ["leviathan"], count: 1, label: "the Risen Leviathan" },
    reward: { aether: 3000, gearIlvl: 20, gearRarity: "artifact" },
  },

  // ── OVERWORLD (wayside petitioners at existing landmark POIs — Field.runPoi hook) ───────────
  "ow-idol": {
    id: "ow-idol", name: "An Offering of Quiet", town: "mire-idol", giver: "poi", zone: "duskmarsh",
    poi: { at: "The Mire-Idol", giver: "the Reed-Priest" },
    brief: "A figure wrapped in reeds kneels at the idol, and does not turn. \"The lepers come up from the water and paw at the offerings. Five of them given BACK to the water, stranger, and the idol will open what the bog has kept for you.\"",
    doneLine: "The reed-wrapped figure lays a bundle on the offerings — for you. \"Quiet, again. The idol is pleased, and the bog gives up what it swallowed. Go before the fog learns your face.\"",
    kill: { keys: ["leper"], count: 5, label: "Cave Lepers" },
    reward: { aether: 500, gearIlvl: 13, gearRarity: "epic" },
  },
  "ow-hull": {
    id: "ow-hull", name: "The Wrecker's Due", town: "broken-hull", giver: "poi", zone: "stormcoast",
    poi: { at: "The Broken Hull", giver: "the Marooned Bosun" },
    brief: "A gaunt sailor shelters in the ship's ribs, knife across her knees. \"This was MY ship, and a wrecker's lantern put her on the teeth. Five Coast Wreckers fed to the gulls, and my crew's sea-chest — what I dug from the sand — is yours. I've no use for it. I'm staying with her.\"",
    doneLine: "The bosun listens to the count, nods once, and drags the sea-chest from under the sand. \"Five for forty. It doesn't square — nothing squares it. But it's the whole of the due I can pay, and my crew would want the paying done. Fair winds, stranger.\"",
    kill: { keys: ["wrecker"], count: 5, label: "Coast Wreckers" },
    reward: { aether: 700, gearIlvl: 15, gearRarity: "epic" },
  },
  "ow-ruin": {
    id: "ow-ruin", name: "The Prospector's Claim", town: "dwarven-ruin", giver: "poi", zone: "frostpeak",
    poi: { at: "The Dwarven Ruin", giver: "Prospector Skarn" },
    brief: "A snow-crusted dwarf crouches in the lee of the cairn, breath icing his beard. \"Snow Trolls took my claim — the dig, the tools, my partner's ashes-urn, all of it under their stinking den now. Two of the brutes dead and it's half-shares on everything my pick ever pulled out of this mountain.\"",
    doneLine: "Skarn spits into the snow, which for a dwarf is open weeping. \"Both brutes? BOTH? Then the claim's mine again and half of it's yours, as sworn on the cairn. My partner would've liked you. He hated everyone, but he'd have liked you.\"",
    kill: { keys: ["snowtroll"], count: 2, label: "Snow Trolls" },
    reward: { aether: 1100, gearIlvl: 17, gearRarity: "legendary" },
  },
};

/** Each giver scope's chain entry point (the quest the giver opens with), in arc order — the quest
 *  log groups render in this order within their state bucket. */
export const QUEST_CHAIN_START: Record<string, string> = {
  hearthford: "gv-kobolds",
  elderbough: "sw-wolves",
  miregard: "dm-vermin",
  "mire-idol": "ow-idol",
  wheatcross: "gm-scavengers",
  wrackport: "sc-cutthroats",
  "broken-hull": "ow-hull",
  riverhearth: "rh-roads",
  frosthold: "fp-wolves",
  "dwarven-ruin": "ow-ruin",
  lastlight: "df-watch",
  vesperhal: "wh-wraiths",
  sunpier: "sb-raiders",
};

/** The giver's display name + where they stand (settlement name, or the landmark for a POI giver). */
export function questGiver(def: QuestDef): { name: string; where: string } {
  if (def.poi) return { name: def.poi.giver, where: def.poi.at };
  const s = SETTLEMENTS[def.town];
  const npc = s?.npcs.find((n) => n.id === def.giver);
  return { name: npc?.name ?? "the giver", where: s?.name ?? def.town };
}

/** The giver scope waiting at a landmark POI, or null — Field.runPoi's overworld quest hook. */
export function poiQuestScope(zoneId: string, poiName: string): string | null {
  for (const def of Object.values(QUESTS))
    if (def.poi && def.zone === zoneId && def.poi.at === poiName) return def.town;
  return null;
}
