import type { Affix, Attunement, Implicit, Item, Slot } from "../types";
import type { Enemy } from "../types";
import { ATTUNEMENTS, isArmorSlot } from "../types";
import { ri, pick, clamp } from "../core/rng";
import { RARITY } from "../data/rarity";
import { ITEM_NAMES, ARMOR_SLOT_NOUNS, TRINKET_NAMES, AFFIXES, ARCH_NOUN, ATT_ADJ } from "../data/items";

// Weapon archetypes that have sliced icon art (one per SOL loot chart). Random drops draw from
// these so dropped weapons always show a sprite; a hero's own (possibly art-less) archetype is
// still honored when it's the drop preference.
const ART_ARCHETYPES = Object.keys(ITEM_NAMES);

/** Pick a drop attunement: usually matches the party (so loot is equippable), sometimes a
 *  wildcard for cross-attunement reclassing finds. */
function rollAtt(pref?: Attunement): Attunement {
  return pref && Math.random() < 0.55 ? pref : pick(ATTUNEMENTS); // mostly useful, plenty of variety
}
function rollWeaponClass(pref?: string): string {
  return pref && Math.random() < 0.5 ? pref : pick(ART_ARCHETYPES);
}

// Item-level scaling: base stats grow with ilvl (enemy level / zone depth), so gear found
// deeper into the run is stronger, not just rarer. ilvl 0 = no scaling (starter gear). The slope
// is steep on purpose (Dara's "always exciting" rule): a high-ilvl low-rarity piece can out-stat
// a low-ilvl high-rarity one — rarity sets the affix count + base rung, ilvl sets the magnitude.
const ilvlMult = (ilvl: number): number => 1 + Math.max(0, ilvl) * 0.07;

// Per-slot base stat budgets for the armor family (chest carries the most; gloves lean offence,
// boots lean speed, helmet leans focus). `r` = rarity index, `k` = ilvl magnitude multiplier.
const ARMOR_STATS: Record<string, (r: number, k: number, ilvl: number) => Implicit> = {
  armor:  (r, k, ilvl) => ({ hp: Math.round((9 + r * 9) * k), armor: (1 + r) + Math.floor(ilvl / 4) }),
  helmet: (r, k, ilvl) => ({ hp: Math.round((5 + r * 5) * k), armor: Math.ceil((1 + r) / 2) + Math.floor(ilvl / 7), mp: Math.round((2 + r * 2) * k) }),
  gloves: (r, k, ilvl) => ({ atk: Math.round((2 + r * 2) * k), armor: Math.ceil((1 + r) / 2) + Math.floor(ilvl / 8) }),
  boots:  (r, k, ilvl) => ({ hp: Math.round((4 + r * 3) * k), spd: 1 + Math.floor(r / 2), armor: Math.ceil(r / 2) + Math.floor(ilvl / 8) }),
};

export function makeItem(cls: string | null, slot: Slot, rarityIx: number, weaponClass?: string | null, ilvl = 0, att: Attunement = "SOL"): Item {
  const R = RARITY[rarityIx];
  const r = rarityIx;
  const k = ilvlMult(ilvl);
  let name: string;
  const implicit: Implicit = {};
  let mna: Item["mna"];
  if (slot === "weapon") {
    const wc = weaponClass || "Dual Swords";
    // SOL's four art-charted archetypes use Dara's named loot charts; every other
    // attunement/archetype builds a themed name from the attunement adjective + archetype noun.
    name = att === "SOL" && ITEM_NAMES[wc]
      ? ITEM_NAMES[wc][r]
      : `${ATT_ADJ[att]?.[r] ?? att} ${ARCH_NOUN[wc] ?? wc}`;
    implicit.atk = Math.round((5 + r * 5) * k); // base atk ladder by rung, scaled by ilvl
    // A weapon carries intrinsic MNA in its own Attunement — the main MNA source, and what
    // sets the wielder's class.
    mna = { [att]: Math.round(14 + ilvl * 2.7 + r * 9) };
  } else if (isArmorSlot(slot)) {
    // Armor-family pieces (helmet/chest/gloves/boots) carry an attunement for flavor only (it
    // doesn't set class — weapons do): it picks the matching per-attunement art + a themed name,
    // e.g. "Wildgrown Cuirass", "Rimewrought Greaves". Each slot has its own stat budget.
    name = `${ATT_ADJ[att]?.[r] ?? ""} ${(ARMOR_SLOT_NOUNS[slot] ?? ARMOR_SLOT_NOUNS.armor)[r]}`.trim();
    Object.assign(implicit, ARMOR_STATS[slot](r, k, ilvl));
  } else {
    name = TRINKET_NAMES[r]; // attunement-neutral
    implicit.mp = Math.round((4 + r * 5) * k);
    implicit.mag = Math.round((2 + r * 2) * k);
  }
  // roll affixes
  const pool = [...AFFIXES];
  const affixes: Affix[] = [];
  for (let i = 0; i < R.affixes; i++) {
    const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    if (!a) break;
    affixes.push({ key: a.key, stat: a.stat, value: a.roll(r), label: a.label });
  }
  // weapons + armor carry an attunement (weapon sets class/MNA; armor is art/name flavor); trinkets don't
  return { slot, cls: weaponClass || cls || "", att: slot === "trinket" ? undefined : att, rarity: R.key, rIx: r, ilvl: Math.max(0, Math.round(ilvl)), name, implicit, mna, affixes };
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
  if (it.mna) for (const v of Object.values(it.mna)) s += (v || 0) * 0.8; // MNA unlocks/scales — valued
  return Math.round(s + it.rIx * 4);
}

// Level-gated rarity band (Dara's retune). Typical drops sit near the floor; the ceil is a
// "lucky" spike. L10 ≈ uncommon/rare (+lucky epic) · L20 ≈ rare/epic (+lucky legendary) ·
// L30 ≈ rare→legendary (+rare artifact) · L35+ artifacts become regular. (rarity index:
// 0 common · 1 uncommon · 2 rare · 3 epic · 4 legendary · 5 artifact.)
export function rarityBand(lvl: number): { floor: number; ceil: number } {
  if (lvl < 5) return { floor: 0, ceil: 1 };
  if (lvl < 10) return { floor: 0, ceil: 2 };
  if (lvl < 20) return { floor: 1, ceil: 3 }; // L10: mostly 1–2, lucky 3
  if (lvl < 30) return { floor: 2, ceil: 4 }; // L20: mostly 2–3, lucky 4
  if (lvl < 35) return { floor: 2, ceil: 5 }; // L30: 2–4, with rare 5s appearing
  return { floor: 3, ceil: 5 };               // L35+: 3–5
}

// Weighted roll within [floor,ceil]: starts at floor, each rung up needs another `step` success —
// so higher rarities are progressively rarer ("lucky" spikes). P(floor+n) = step^n.
function spikeRarity(floor: number, ceil: number, step = 0.4): number {
  let r = floor;
  for (let i = floor; i < ceil; i++) { if (Math.random() < step) r = i + 1; else break; }
  return clamp(r, 0, 5);
}

// Slot distribution for drops/loot: weapon weighted x2, every armor-family slot + trinket once.
const DROP_SLOTS: Slot[] = ["weapon", "weapon", "helmet", "armor", "gloves", "boots", "trinket"];

// drop: rarity from the enemy's level band + boss/elite bonus. prefCls/prefAtt bias the drop
// toward a party member's class/attunement (so it's useful) while a slice of drops roll wild
// (variety + cross-attunement reclassing). Weapons span all five attunements — not SOL-only.
export function rollDrop(enemy: Enemy, prefCls?: string, prefAtt?: Attunement): Item {
  const lvl = enemy.lvl || 1;
  let { floor, ceil } = rarityBand(lvl);
  if (enemy.elite) { floor += 1; ceil = Math.min(5, ceil + 1); }
  if (enemy.boss) { floor = Math.max(floor + 1, 3); ceil = 5; }
  if (enemy.rare) { floor = Math.max(floor, 3); ceil = 5; } // ultra-rare treasure monster: epic-or-better
  floor = clamp(floor, 0, 5);
  ceil = clamp(Math.max(ceil, floor), 0, 5);
  const r = spikeRarity(floor, ceil);
  const slot = pick(DROP_SLOTS);
  const wc = slot === "weapon" ? rollWeaponClass(prefCls) : null;
  return makeItem(null, slot, r, wc, lvl, rollAtt(prefAtt)); // drops scale to the enemy's level
}

// chest / merchant loot: roll around a target rarity floor, scaled to an item level
export function rollItemAtRarity(floor: number, prefCls?: string, ilvl = 0, prefAtt?: Attunement): Item {
  const r = spikeRarity(clamp(floor, 0, 5), 5);
  const slot = pick(DROP_SLOTS);
  const wc = slot === "weapon" ? rollWeaponClass(prefCls) : null;
  return makeItem(null, slot, r, wc, ilvl, rollAtt(prefAtt));
}
