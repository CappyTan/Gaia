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
  { at: 0.0, sets: [["slime"], ["kobold", "kobold"], ["slime", "kobold"]] },
  { at: 0.18, sets: [["gbandit"], ["slime", "slime"], ["kobold", "gbandit"], ["kobold"]] },
  { at: 0.36, sets: [["gbandit", "kobold"], ["slimebig"], ["gbandit", "gbandit"], ["slime", "kobolde"]] },
  { at: 0.54, sets: [["slimebig", "kobold"], ["kobolde"], ["gbandit", "gmage"], ["kobolde", "gbandit"]] },
  { at: 0.72, sets: [["kobolde", "gmage"], ["slimebig", "gmage"], ["gbandit", "kobolde"], ["gbandit", "gbandit", "gmage"]] },
];

// Zones are ordered. Beating a zone's boss opens a merchant, then the next zone; the LAST
// zone's boss wins the run.
export const ZONES: Zone[] = [
  { id: "greenvale", name: "Greenvale", mini: "brigand", miniAdds: ["gbandit", "gbandit"], boss: "kingpin",
    envs: ["plains", "forest", "desert", "mountains"], dungeon: { name: "The Bandit Warren", env: "hollow" }, bands: ENCOUNTERS },
  { id: "duskmarsh", name: "The Duskmarsh", mini: "broodmother", miniAdds: ["spider", "spider"], boss: "troll",
    envs: ["mire", "forest", "mire", "hollow"], dungeon: { name: "The Drowned Vault", env: "hollow" }, bands: [
      { at: 0.0, sets: [["rat"], ["spider"], ["rat", "rat"]] },
      { at: 0.2, sets: [["rat", "spider"], ["leper"], ["direrat"]] },
      { at: 0.4, sets: [["leper", "rat"], ["spider", "bonespider"], ["direrat", "spider"]] },
      { at: 0.6, sets: [["leper", "direrat"], ["bonespider", "spider"], ["rat", "rat", "leper"]] },
      { at: 0.8, sets: [["bonespider", "leper"], ["direrat", "direrat", "rat"], ["leper", "bonespider", "spider"]] },
    ] },
];
