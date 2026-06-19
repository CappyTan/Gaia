import type { Rarity, RarityKey } from "../types";

// Rarity ladder: sets base-stat magnitude and how many affixes an item can roll (Diablo model).
export const RARITY: Rarity[] = [
  { key: "common", mult: 1.0, affixes: 0 },
  { key: "uncommon", mult: 1.3, affixes: 1 },
  { key: "rare", mult: 1.7, affixes: 2 },
  { key: "epic", mult: 2.2, affixes: 3 },
  { key: "legendary", mult: 3.0, affixes: 4 },
  { key: "artifact", mult: 4.0, affixes: 5 },
];

export const rarityIx = (k: RarityKey): number => RARITY.findIndex((r) => r.key === k);
