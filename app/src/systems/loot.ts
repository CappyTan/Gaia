import type { Affix, Attunement, Implicit, Item, Slot } from "../types";
import type { Enemy } from "../types";
import { ATTUNEMENTS } from "../types";
import { ri, pick, clamp } from "../core/rng";
import { RARITY } from "../data/rarity";
import { ITEM_NAMES, ARMOR_NOUN, TRINKET_NAMES, AFFIXES, ARCH_NOUN, ATT_ADJ } from "../data/items";

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
// deeper into the run is stronger, not just rarer. ilvl 0 = no scaling (starter gear).
const ilvlMult = (ilvl: number): number => 1 + Math.max(0, ilvl) * 0.07;

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
  } else if (slot === "armor") {
    // Armor carries an attunement for flavor only (it doesn't set class — weapons do): it picks
    // the matching per-attunement art + a themed name, e.g. "Wildgrown Cuirass".
    name = `${ATT_ADJ[att]?.[r] ?? ""} ${ARMOR_NOUN[r]}`.trim();
    implicit.hp = Math.round((10 + r * 12) * k);
    implicit.armor = (1 + r) + Math.floor(ilvl / 4);
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

// drop: rarity weighted by enemy level + boss/elite bonus. prefCls/prefAtt bias the drop toward
// a party member's class/attunement (so it's useful) while a slice of drops roll wild (variety +
// cross-attunement reclassing). Weapons span all five attunements — not SOL-only.
export function rollDrop(enemy: Enemy, prefCls?: string, prefAtt?: Attunement): Item {
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
  const wc = slot === "weapon" ? rollWeaponClass(prefCls) : null;
  return makeItem(null, slot, r, wc, lvl, rollAtt(prefAtt)); // drops scale to the enemy's level
}

// chest / merchant loot: roll around a target rarity floor, scaled to an item level
export function rollItemAtRarity(floor: number, prefCls?: string, ilvl = 0, prefAtt?: Attunement): Item {
  let r = clamp(floor, 0, 5);
  for (let i = r; i <= 5; i++) {
    if (Math.random() < 0.4) r = i;
    else break;
  }
  const slot = pick<Slot>(["weapon", "weapon", "armor", "trinket"]);
  const wc = slot === "weapon" ? rollWeaponClass(prefCls) : null;
  return makeItem(null, slot, clamp(r, 0, 5), wc, ilvl, rollAtt(prefAtt));
}
