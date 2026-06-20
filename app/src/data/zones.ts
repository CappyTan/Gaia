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
// The mid-zone chokepoint (Bandit Brigadier) and the final Kingpin are NOT in this table.
export const ENCOUNTERS: EncounterBand[] = [
  { at: 0.0, sets: [["slime", "slime", "kobold"], ["kobold", "kobold"], ["slime", "kobold"]] },
  { at: 0.18, sets: [["gbandit", "kobold", "kobold"], ["slime", "slime", "kobold"], ["kobold", "gbandit"], ["slime", "kobold", "kobold"]] },
  { at: 0.36, sets: [["gbandit", "kobold", "kobold"], ["slimebig", "kobold", "kobold"], ["gbandit", "gbandit", "kobold"], ["slime", "kobolde", "kobold"]] },
  { at: 0.54, sets: [["slimebig", "kobold", "kobold"], ["kobolde", "gbandit", "kobold"], ["gbandit", "gmage", "kobold"], ["kobolde", "gbandit", "kobold"]] },
  { at: 0.72, sets: [["kobolde", "gmage", "kobold"], ["slimebig", "gmage", "kobold"], ["gbandit", "kobolde", "gbandit"], ["gbandit", "gbandit", "gmage"]] },
];

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "brigand", miniAdds: ["gbandit", "gbandit"], boss: "kingpin",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "warren" }, bands: ENCOUNTERS },
  { id: "duskmarsh", name: "The Duskmarsh", mini: "broodmother", miniAdds: ["spider", "spider"], boss: "troll",
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "vault" }, bands: [
      { at: 0.0, sets: [["rat", "rat", "spider"], ["spider", "rat"], ["rat", "rat", "spider"]] },
      { at: 0.2, sets: [["rat", "spider", "rat"], ["leper", "rat", "rat"], ["direrat", "rat", "spider"]] },
      { at: 0.4, sets: [["leper", "rat", "spider"], ["spider", "bonespider", "rat"], ["direrat", "spider", "rat"]] },
      { at: 0.6, sets: [["leper", "direrat", "rat"], ["bonespider", "spider", "rat"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper", "rat"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
];
