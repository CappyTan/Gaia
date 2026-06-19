import type { Affix, Implicit, Item, Slot } from "../types";
import type { Enemy } from "../types";
import { ri, pick, clamp } from "../core/rng";
import { RARITY } from "../data/rarity";
import { ITEM_NAMES, ARMOR_NAMES, TRINKET_NAMES, AFFIXES } from "../data/items";

export function makeItem(cls: string | null, slot: Slot, rarityIx: number, weaponClass?: string | null): Item {
  const R = RARITY[rarityIx];
  const r = rarityIx;
  let name: string;
  const implicit: Implicit = {};
  if (slot === "weapon") {
    const wc = weaponClass || "Dual Swords";
    name = (ITEM_NAMES[wc] || ITEM_NAMES["Dual Swords"])[r];
    implicit.atk = Math.round(5 + r * 5); // simple legible atk ladder by rung
  } else if (slot === "armor") {
    name = ARMOR_NAMES[r];
    implicit.hp = Math.round(10 + r * 12);
    implicit.armor = 1 + r;
  } else {
    name = TRINKET_NAMES[r];
    implicit.mp = Math.round(4 + r * 5);
    implicit.mag = Math.round(2 + r * 2);
  }
  // roll affixes
  const pool = [...AFFIXES];
  const affixes: Affix[] = [];
  for (let i = 0; i < R.affixes; i++) {
    const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (!a) break;
    affixes.push({ key: a.key, stat: a.stat, value: a.roll(r), label: a.label });
  }
  return { slot, cls: weaponClass || cls || "", rarity: R.key, rIx: r, name, implicit, affixes };
}

// crude power score for comparing/sorting items
export function itemScore(it: Item): number {
  let s =
    (it.implicit.atk || 0) * 3 +
    (it.implicit.hp || 0) * 0.5 +
    (it.implicit.armor || 0) * 4 +
    (it.implicit.mp || 0) * 0.3 +
    (it.implicit.mag || 0) * 2;
  for (const a of it.affixes) {
    s += a.value * (a.stat === "atkPct" ? 2 : a.stat === "critPct" ? 2 : a.stat.endsWith("Pct") ? 2 : 1.2);
  }
  return Math.round(s + it.rIx * 4);
}

// drop: rarity weighted by enemy level + boss/elite bonus
export function rollDrop(enemy: Enemy, weaponClassPreference?: string): Item {
  const lvl = enemy.lvl || 1;
  let floor = 0,
    ceil = 2 + Math.floor(lvl / 2);
  if (enemy.elite) {
    floor = 2;
    ceil = Math.min(5, ceil + 1);
  }
  if (enemy.boss) {
    floor = 3;
    ceil = 5;
  }
  // weighted toward floor with a chance to spike up
  let r = floor;
  for (let i = floor; i <= ceil; i++) {
    if (Math.random() < 0.45) r = i;
    else break;
  }
  r = clamp(r, 0, 5);
  const slot = pick<Slot>(["weapon", "weapon", "armor", "trinket"]);
  const wc = slot === "weapon" ? weaponClassPreference || pick(Object.keys(ITEM_NAMES)) : null;
  return makeItem(null, slot, r, wc);
}

// chest / merchant loot: roll around a target rarity floor
export function rollItemAtRarity(floor: number, weaponClassPreference?: string): Item {
  let r = clamp(floor, 0, 5);
  for (let i = r; i <= 5; i++) {
    if (Math.random() < 0.4) r = i;
    else break;
  }
  const slot = pick<Slot>(["weapon", "weapon", "armor", "trinket"]);
  const wc = slot === "weapon" ? weaponClassPreference || pick(Object.keys(ITEM_NAMES)) : null;
  return makeItem(null, slot, clamp(r, 0, 5), wc);
}
