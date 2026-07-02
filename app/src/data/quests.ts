// Quest definitions — pure data (the engine lives in systems/quests). The first content: Hearthford's
// three-step bounty chain from Watchman Bram (Dara): cull the kobolds → break the bandits → fell the
// Kingpin. Sequential (each offered only after the previous is turned in), non-repeatable, with
// deliberately SIGNIFICANT rewards (Aether + a guaranteed-tier gear roll — floorMin, ADR 0015 mods).

import type { RarityKey } from "../types";

export interface QuestDef {
  id: string;
  name: string;
  town: string;   // settlement id whose giver offers it
  giver: string;  // npc id within that town
  brief: string;  // giver's offer prose
  doneLine: string; // giver's turn-in prose
  kill: { keys: string[]; count: number; label: string };
  reward: { aether: number; gearIlvl: number; gearRarity: RarityKey };
  next?: string;  // the chain
}

export const QUESTS: Record<string, QuestDef> = {
  "gv-kobolds": {
    id: "gv-kobolds", name: "Cull the Long Grass", town: "hearthford", giver: "guard",
    brief: "Kobolds in the long grass — ten of them at least, bold as brass since the bandits stirred everything up. Thin them out for me and Hearthford's purse will thank you properly.",
    doneLine: "Ten kobolds quieter out there. You work clean. Here — the purse, and something from the armory rack. Now, about those bandits…",
    kill: { keys: ["kobold", "kobolde"], count: 10, label: "kobolds" },
    reward: { aether: 250, gearIlvl: 9, gearRarity: "rare" },
    next: "gv-bandits",
  },
  "gv-bandits": {
    id: "gv-bandits", name: "Clear the Roads", town: "hearthford", giver: "guard",
    brief: "The Greenvale Bandits bleed this shire white — wagons robbed, farms scared quiet. Put five of them down and the roads breathe again.",
    doneLine: "Five fewer knives on the road. The carters will sing about you, if carters sang. Take this — and listen: the one who sends them all is still out there.",
    kill: { keys: ["gbandit"], count: 5, label: "Greenvale Bandits" },
    reward: { aether: 450, gearIlvl: 11, gearRarity: "epic" },
    next: "gv-kingpin",
  },
  "gv-kingpin": {
    id: "gv-kingpin", name: "The Kingpin Falls", town: "hearthford", giver: "guard",
    brief: "Every raid, every toll, every burned barn traces back to one crown — the Greenvale Kingpin, holed up past the Bandit Warren. End him, and Greenvale is free. This is the big one.",
    doneLine: "The Kingpin — actually down. I'll be honest, I didn't think anyone would ever collect this bounty. Greenvale owes you more than this, but start with this.",
    kill: { keys: ["kingpin", "kingpin-omega"], count: 1, label: "the Greenvale Kingpin" },
    reward: { aether: 1000, gearIlvl: 13, gearRarity: "legendary" },
  },
};

/** Each town's chain entry point (the quest the giver opens with). */
export const QUEST_CHAIN_START: Record<string, string> = { hearthford: "gv-kobolds" };
