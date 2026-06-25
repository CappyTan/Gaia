import type { Affix, Attunement, Implicit, Item, PrimaryStat, Prims, Slot } from "../types";
import type { Enemy } from "../types";
import { ATTUNEMENTS, isArmorSlot } from "../types";
import { ri, pick, clamp } from "../core/rng";
import { GOVERNING_STAT } from "../data/statScaling";
import { RARITY } from "../data/rarity";
import { LOOT_BANDS, SPIKE_STEP, DROP_MODS, DROP_SLOTS, type RarityMod } from "../data/loot";
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

// V3 primary-attribute grant on a drop (Stat System V3). Every piece carries one primary by SLOT
// IDENTITY: weapons grant their Attunement's governing stat; each armor slot leans a distinct stat
// (helmet→MGC, chest→DEF, gloves→STR, boots→SPD); trinkets→AGI. Magnitude grows with rarity + ilvl.
// These feed the wearer's ability scaling (systems/stats abp) and the character-sheet primaries.
const primVal = (r: number, ilvl: number): number => Math.round(1.5 + r * 1.2 + Math.max(0, ilvl) * 0.15);
const ARMOR_SLOT_PRIM: Record<string, PrimaryStat> = { helmet: "MGC", armor: "DEF", gloves: "STR", boots: "SPD" };
function rollPrim(slot: Slot, att: Attunement, r: number, ilvl: number): Partial<Prims> {
  const stat: PrimaryStat = slot === "weapon" ? GOVERNING_STAT[att] : slot === "trinket" ? "AGI" : ARMOR_SLOT_PRIM[slot] ?? "STR";
  return { [stat]: primVal(r, ilvl) };
}

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
  // every piece carries a V3 primary attribute by slot identity (weapon → governing stat, etc.)
  const prim = rollPrim(slot, att, r, ilvl);
  // weapons + armor carry an attunement (weapon sets class/MNA; armor is art/name flavor); trinkets don't
  return { slot, cls: weaponClass || cls || "", att: slot === "trinket" ? undefined : att, rarity: R.key, rIx: r, ilvl: Math.max(0, Math.round(ilvl)), name, implicit, mna, prim, affixes };
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
  if (it.prim) for (const v of Object.values(it.prim)) s += (v || 0) * 1.5; // V3 primaries — drive ability scaling
  return Math.round(s + it.rIx * 4);
}

// Level-gated rarity band — the curve LIVES IN data/loot.ts (LOOT_BANDS); this just reads it. The
// first band whose maxLvl ≥ lvl applies. `floor` = typical rarity, `ceil` = the lucky spike.
export function rarityBand(lvl: number): { floor: number; ceil: number } {
  const b = LOOT_BANDS.find((x) => lvl <= x.maxLvl) ?? LOOT_BANDS[LOOT_BANDS.length - 1];
  return { floor: b.floor, ceil: b.ceil };
}

// Apply a source bump (DROP_MODS) to a band: add floor/ceil, clamp the floor up to floorMin, keep sane.
function applyMod(b: { floor: number; ceil: number }, m: RarityMod): { floor: number; ceil: number } {
  let floor = b.floor + (m.floor ?? 0);
  if (m.floorMin != null) floor = Math.max(floor, m.floorMin);
  let ceil = b.ceil + (m.ceil ?? 0);
  floor = clamp(floor, 0, 5);
  ceil = clamp(Math.max(ceil, floor), 0, 5);
  return { floor, ceil };
}

// Weighted roll within [floor,ceil]: starts at floor, each rung up needs another SPIKE_STEP success —
// so higher rarities are progressively rarer ("lucky" spikes). P(floor+n) = SPIKE_STEP^n.
function spikeRarity(floor: number, ceil: number, step = SPIKE_STEP): number {
  let r = floor;
  for (let i = floor; i < ceil; i++) { if (Math.random() < step) r = i + 1; else break; }
  return clamp(r, 0, 5);
}

/** A party member's class identity for loot biasing: their weapon archetype + attunement. */
export interface RosterClass { cls: string; att: Attunement; }

// VICTORY drop: rarity from the enemy's level band + a MODEST source bump (DROP_MODS). When a WEAPON
// drops, 75% of the time it rolls an EXACT class a party member already wields (same attunement +
// archetype) so the player can farm upgrades for their current comp; the other 25% roll wild across
// all classes (so loot still offers reclass options). Armor/trinket att is cosmetic, biased to roster.
export function rollDrop(enemy: Enemy, roster?: RosterClass[]): Item {
  const lvl = enemy.lvl || 1;
  let band = rarityBand(lvl);
  if (enemy.elite) band = applyMod(band, DROP_MODS.elite);
  if (enemy.boss) band = applyMod(band, DROP_MODS.boss);
  if (enemy.rare) band = applyMod(band, DROP_MODS.rare); // ultra-rare treasure monster: rare-or-better
  const r = spikeRarity(band.floor, band.ceil);
  const slot = pick(DROP_SLOTS);
  if (slot === "weapon" && roster && roster.length && Math.random() < 0.75) {
    const m = pick(roster);                                   // matches a party member's exact class
    return makeItem(null, "weapon", r, m.cls, lvl, m.att);
  }
  if (slot === "weapon") return makeItem(null, "weapon", r, pick(ART_ARCHETYPES), lvl, pick(ATTUNEMENTS)); // wild
  const att = roster && roster.length ? pick(roster).att : pick(ATTUNEMENTS); // armor/trinket: cosmetic att
  return makeItem(null, slot, r, null, lvl, att);
}

// CHEST / MERCHANT loot: rarity from the find's LEVEL band (same curve as drops) + an optional source
// bump (e.g. DROP_MODS.chest), scaled to an item level for stat magnitude. No more flat "floor + always
// spike to artifact" — a Greenvale chest is now common/uncommon with a lucky rare, not a guaranteed rare+.
export function rollItemAtLevel(lvl: number, prefCls?: string, ilvl = 0, prefAtt?: Attunement, mod?: RarityMod): Item {
  let band = rarityBand(lvl);
  if (mod) band = applyMod(band, mod);
  const r = spikeRarity(band.floor, band.ceil);
  const slot = pick(DROP_SLOTS);
  const wc = slot === "weapon" ? rollWeaponClass(prefCls) : null;
  return makeItem(null, slot, r, wc, ilvl, rollAtt(prefAtt));
}
