import type { Affix, Attunement, Implicit, Item, PrimaryStat, Prims, Slot, SubKey } from "../types";
import type { Enemy } from "../types";
import { ATTUNEMENTS, isArmorSlot, PRIM_KEYS } from "../types";
import type { Rng } from "../core/rng";
import { riR, pickR, clamp } from "../core/rng";
import { GOVERNING_STAT } from "../data/statScaling";
import { RARITY } from "../data/rarity";
import { LOOT_BANDS, SPIKE_STEP, DROP_MODS, DROP_SLOTS, WEAPON_MNA_ROLL, ARMOR_MNA_ROLL, ARMOR_MNA_CHANCE, type RarityMod } from "../data/loot";
import { ITEM_NAMES, ARMOR_SLOT_NOUNS, TRINKET_NAMES, AFFIXES, ARCH_NOUN, ATT_ADJ } from "../data/items";

// Weapon archetypes that have sliced icon art (one per SOL loot chart). Random drops draw from
// these so dropped weapons always show a sprite; a hero's own (possibly art-less) archetype is
// still honored when it's the drop preference.
const ART_ARCHETYPES = Object.keys(ITEM_NAMES);

/** Pick a drop attunement: usually matches the party (so loot is equippable), sometimes a
 *  wildcard for cross-attunement reclassing finds. */
function rollAtt(rng: Rng, pref?: Attunement): Attunement {
  return pref && rng() < 0.55 ? pref : pickR(rng, ATTUNEMENTS); // mostly useful, plenty of variety
}
function rollWeaponClass(rng: Rng, pref?: string): string {
  return pref && rng() < 0.5 ? pref : pickR(rng, ART_ARCHETYPES);
}

// Item-level scaling: base stats grow with ilvl (enemy level / zone depth), so gear found
// deeper into the run is stronger, not just rarer. ilvl 0 = no scaling (starter gear). The slope
// is steep on purpose (Dara's "always exciting" rule): a high-ilvl low-rarity piece can out-stat
// a low-ilvl high-rarity one — rarity sets the affix count + base rung, ilvl sets the magnitude.
const ilvlMult = (ilvl: number): number => 1 + Math.max(0, ilvl) * 0.07;

// V3 primary-attribute grant (ADR 0015 §4). Every piece grants ONE primary: a weapon grants its
// Attunement's GOVERNING stat (it sets the class); armor/trinket roll a RANDOM primary — slot identity
// now lives in the affix slot-homes (SLOT_AFFIXES), not the primary. Magnitude grows with rarity + ilvl;
// feeds the wearer's ability scaling (systems/stats abp) + the character-sheet primaries.
const primVal = (r: number, ilvl: number): number => Math.round(1.5 + r * 1.2 + Math.max(0, ilvl) * 0.15);
// Intrinsic gear MNA (ADR 0015) — weapon and non-weapon gear roll from per-rarity ranges (rarity owns
// the roll, each value equally weighted; tables + the attune chance live in data/loot.ts). A weapon's
// MNA is its Attunement and sets the class (it ALWAYS carries it). Armor/trinket MNA is a small,
// occasional top-up: only ~ARMOR_MNA_CHANCE of pieces are attuned, and an attuned piece never rolls 0
// (the roll is floored to 1).
const weaponMna = (r: number, rng: Rng): number => { const [lo, hi] = WEAPON_MNA_ROLL[r]; return riR(rng, lo, hi); };
const armorMna  = (r: number, rng: Rng): number => { const [lo, hi] = ARMOR_MNA_ROLL[r];  return Math.max(1, riR(rng, lo, hi)); };
function rollPrim(slot: Slot, att: Attunement, r: number, ilvl: number, rng: Rng): Partial<Prims> {
  const stat: PrimaryStat = slot === "weapon" ? GOVERNING_STAT[att] : pickR(rng, PRIM_KEYS);
  return { [stat]: primVal(r, ilvl) };
}

// ADR 0015 §5 — slot homes: each slot rolls affixes only from its identity's substats (the 20 V3
// substats ARE the affix pool = AFFIXES). The hard exclusives fall out of the map — Crit Chance (Crt)
// only on Gloves, Evasion (Eva) only on Boots, Block (Blk) only on Chest (=armor slot). Brick-safe (no
// build needs two stats trapped on the same slot). A tight slot (gloves, 4) simply caps its affix count.
const SLOT_AFFIXES: Record<Slot, SubKey[]> = {
  weapon: ["Mpn", "Epn", "Abp", "Exe", "Cmd", "Hld"],
  gloves: ["Crt", "Cch", "Acc", "Mpn"],
  helmet: ["Abp", "Acc", "Cdr", "Hld", "Erd", "Buf", "Res"],
  armor: ["Mrd", "Erd", "Blk", "Res", "Lfs"],
  boots: ["Eva", "Abg", "Acr", "Chc", "Mrd"],
  trinket: ["Lfs", "Buf", "Hld", "Epn", "Cmd", "Abg", "Cdr", "Res"],
};

// Per-slot base stat budgets for the armor family (chest carries the most; gloves lean offence,
// boots lean speed, helmet leans focus). `r` = rarity index, `k` = ilvl magnitude multiplier.
const ARMOR_STATS: Record<string, (r: number, k: number, ilvl: number) => Implicit> = {
  armor:  (r, k, ilvl) => ({ hp: Math.round((9 + r * 9) * k), armor: (1 + r) + Math.floor(ilvl / 4) }),
  helmet: (r, k, ilvl) => ({ hp: Math.round((6 + r * 6) * k), armor: Math.ceil((1 + r) / 2) + Math.floor(ilvl / 7) }),
  gloves: (r, k, ilvl) => ({ atk: Math.round((2 + r * 2) * k), armor: Math.ceil((1 + r) / 2) + Math.floor(ilvl / 8) }),
  boots:  (r, k, ilvl) => ({ hp: Math.round((4 + r * 3) * k), spd: 1 + Math.floor(r / 2), armor: Math.ceil(r / 2) + Math.floor(ilvl / 8) }),
};

export function makeItem(cls: string | null, slot: Slot, rarityIx: number, weaponClass?: string | null, ilvl = 0, att: Attunement = "SOL", rng: Rng = Math.random): Item {
  const R = RARITY[rarityIx];
  const r = rarityIx;
  const k = ilvlMult(ilvl);
  let name: string;
  const implicit: Implicit = {};
  let mna: Item["mna"];
  // The Attunement actually STAMPED on the item. Weapons always keep it (it sets the class). Armor keeps
  // it only if the piece rolled MNA; otherwise the armor is NEUTRAL (no attunement designation). Trinkets
  // are always neutral.
  let itemAtt: Attunement | undefined = att;
  if (slot === "weapon") {
    const wc = weaponClass || "Dual Swords";
    // SOL's four art-charted archetypes use Dara's named loot charts; every other
    // attunement/archetype builds a themed name from the attunement adjective + archetype noun.
    name = att === "SOL" && ITEM_NAMES[wc]
      ? ITEM_NAMES[wc][r]
      : `${ATT_ADJ[att]?.[r] ?? att} ${ARCH_NOUN[wc] ?? wc}`;
    implicit.atk = Math.round((5 + r * 5) * k); // base atk ladder by rung, scaled by ilvl
    // A weapon carries intrinsic MNA in its own Attunement — always ≥1, and what sets the wielder's class.
    mna = { [att]: weaponMna(r, rng) };
  } else if (isArmorSlot(slot)) {
    const noun = (ARMOR_SLOT_NOUNS[slot] ?? ARMOR_SLOT_NOUNS.armor)[r];
    Object.assign(implicit, ARMOR_STATS[slot](r, k, ilvl));
    if (rng() < ARMOR_MNA_CHANCE) {
      // ATTUNED armor: small MNA in its Attunement + a themed name ("Wildgrown Cuirass", "Rimewrought Greaves").
      mna = { [att]: armorMna(r, rng) };
      name = `${ATT_ADJ[att]?.[r] ?? ""} ${noun}`.trim();
    } else {
      // NEUTRAL armor: no MNA, so no attunement designation (Dara) — a plain, unthemed name.
      itemAtt = undefined;
      name = noun;
    }
  } else {
    // TRINKET: flex slot. Like armor, SOMETIMES attuned (small MNA + an att-themed name), else neutral.
    implicit.mag = Math.round((3 + r * 3) * k);
    implicit.hp = Math.round((4 + r * 3) * k);
    if (rng() < ARMOR_MNA_CHANCE) {
      mna = { [att]: armorMna(r, rng) };
      name = `${ATT_ADJ[att]?.[r] ?? ""} ${TRINKET_NAMES[r]}`.trim();
    } else {
      itemAtt = undefined;
      name = TRINKET_NAMES[r];
    }
  }
  // roll affixes from the slot's home pool (ADR 0015 §5) — no duplicates; count + quality by rarity
  const pool = AFFIXES.filter((a) => SLOT_AFFIXES[slot].includes(a.stat as SubKey));
  const affixes: Affix[] = [];
  for (let i = 0; i < R.affixes; i++) {
    const a = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    if (!a) break;
    affixes.push({ key: a.key, stat: a.stat, value: a.roll(r), label: a.label });
  }
  // every piece carries a V3 primary attribute by slot identity (weapon → governing stat, etc.)
  const prim = rollPrim(slot, att, r, ilvl, rng);
  // att is stamped only where it means something: weapons (always) + attuned armor (rolled MNA). Neutral
  // armor and trinkets carry no attunement designation.
  return { slot, cls: weaponClass || cls || "", att: itemAtt, rarity: R.key, rIx: r, ilvl: Math.max(0, Math.round(ilvl)), name, implicit, mna, prim, affixes };
}

/** MNA every hero's starting weapon grants in its own Attunement — a fixed head start (so a fresh hero
 *  reaches the first ability milestone a few levels in, with the auto-assigned per-level MNA on top). */
export const STARTER_WEAPON_MNA = 3;
/** The basic level-0 weapon a new hero begins with — a common piece in their class, pinned to a
 *  deterministic +STARTER_WEAPON_MNA (not the random roll) so every new character starts identically. */
export function starterWeapon(cls: string, att: Attunement, rng: Rng = Math.random): Item {
  const w = makeItem(cls, "weapon", 0, cls, 0, att, rng);
  w.mna = { [att]: STARTER_WEAPON_MNA };
  return w;
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
function spikeRarity(floor: number, ceil: number, rng: Rng = Math.random, step = SPIKE_STEP): number {
  let r = floor;
  for (let i = floor; i < ceil; i++) { if (rng() < step) r = i + 1; else break; }
  return clamp(r, 0, 5);
}

/** A party member's class identity for loot biasing: their weapon archetype + attunement. */
export interface RosterClass { cls: string; att: Attunement; }

// VICTORY drop: rarity from the enemy's level band + a MODEST source bump (DROP_MODS). When a WEAPON
// drops, 75% of the time it rolls an EXACT class a party member already wields (same attunement +
// archetype) so the player can farm upgrades for their current comp; the other 25% roll wild across
// all classes (so loot still offers reclass options). Armor/trinket att is cosmetic, biased to roster.
export function rollDrop(enemy: Enemy, roster?: RosterClass[], rng: Rng = Math.random): Item {
  const lvl = enemy.lvl || 1;
  let band = rarityBand(lvl);
  if (enemy.elite) band = applyMod(band, DROP_MODS.elite);
  if (enemy.boss) band = applyMod(band, DROP_MODS.boss);
  if (enemy.rare) band = applyMod(band, DROP_MODS.rare); // ultra-rare treasure monster: rare-or-better
  const r = spikeRarity(band.floor, band.ceil, rng);
  const slot = pickR(rng, DROP_SLOTS);
  if (slot === "weapon" && roster && roster.length && rng() < 0.75) {
    const m = pickR(rng, roster);                            // matches a party member's exact class
    return makeItem(null, "weapon", r, m.cls, lvl, m.att, rng);
  }
  if (slot === "weapon") return makeItem(null, "weapon", r, pickR(rng, ART_ARCHETYPES), lvl, pickR(rng, ATTUNEMENTS), rng); // wild
  const att = roster && roster.length ? pickR(rng, roster).att : pickR(rng, ATTUNEMENTS); // armor/trinket: cosmetic att
  return makeItem(null, slot, r, null, lvl, att, rng);
}

// CHEST / MERCHANT loot: rarity from the find's LEVEL band (same curve as drops) + an optional source
// bump (e.g. DROP_MODS.chest), scaled to an item level for stat magnitude. No more flat "floor + always
// spike to artifact" — a Greenvale chest is now common/uncommon with a lucky rare, not a guaranteed rare+.
export function rollItemAtLevel(lvl: number, prefCls?: string, ilvl = 0, prefAtt?: Attunement, mod?: RarityMod, rng: Rng = Math.random): Item {
  let band = rarityBand(lvl);
  if (mod) band = applyMod(band, mod);
  const r = spikeRarity(band.floor, band.ceil, rng);
  const slot = pickR(rng, DROP_SLOTS);
  const wc = slot === "weapon" ? rollWeaponClass(rng, prefCls) : null;
  return makeItem(null, slot, r, wc, ilvl, rollAtt(rng, prefAtt), rng);
}
