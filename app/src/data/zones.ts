// Encounter tables + zone definitions. Adding a zone/band is pure data — no engine changes.

export interface EncounterBand {
  at: number;
  sets: string[][];
}

export interface Zone {
  id: string;
  name: string;
  mini: string;
  miniAdds?: string[];
  boss: string;
  envs: string[];
  bands: EncounterBand[];
  /** The dungeon past the mini-boss gate: own name + environment, tougher enemies. */
  dungeon: { name: string; env: string };
}

// Greenvale's encounter table by area depth (the further east, the tougher the roll-set).
// The mid-zone chokepoint (Brigand Captain) and the final Brute are NOT in this table.
export const ENCOUNTERS: EncounterBand[] = [
  { at: 0.0, sets: [["bandit"], ["wolf", "wolf"], ["bandit", "wolf"]] },
  { at: 0.18, sets: [["bandit", "bandit"], ["cutpurse"], ["wolf", "wolf", "bandit"], ["wisp"]] },
  { at: 0.36, sets: [["cutpurse", "bandit"], ["marauder"], ["lurker"], ["wisp", "bandit"]] },
  { at: 0.54, sets: [["marauder", "bandit"], ["shade"], ["shaman", "bandit"], ["archer"]] },
  { at: 0.72, sets: [["archer", "cutpurse"], ["shade", "shaman"], ["marauder", "archer"], ["shaman", "bandit", "bandit"]] },
];

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "captain", miniAdds: ["bandit", "bandit"], boss: "brute",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "hollow" }, bands: ENCOUNTERS },
  { id: "duskmarsh", name: "The Duskmarsh", mini: "fenwarden", miniAdds: ["serpent", "serpent"], boss: "vorn",
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "hollow" }, bands: [
      { at: 0.0, sets: [["serpent"], ["husk"], ["serpent", "serpent"]] },
      { at: 0.2, sets: [["husk", "serpent"], ["gloomwisp"], ["knight"]] },
      { at: 0.4, sets: [["knight", "serpent"], ["fenwitch", "husk"], ["gloomwisp", "serpent"]] },
      { at: 0.6, sets: [["husk", "knight"], ["fenwitch", "gloomwisp"], ["serpent", "serpent", "husk"]] },
      { at: 0.8, sets: [["knight", "fenwitch"], ["husk", "husk", "serpent"], ["gloomwisp", "knight", "fenwitch"]] },
    ] },
];
