// Shared domain types for Gaia. Kept dependency-free so every layer can import them.

export type Attunement = "SOL" | "NOX" | "ANIMA" | "QUANTA" | "UMBRAXIS";
export type Slot = "weapon" | "helmet" | "armor" | "gloves" | "boots" | "trinket";
/** Every gear slot a hero can equip, in paper-doll display order. */
export const EQUIP_SLOTS: Slot[] = ["weapon", "helmet", "armor", "gloves", "boots", "trinket"];
/** The armor family (defensive body pieces) — share naming/art and the armor stat budget. */
export const ARMOR_SLOTS: Slot[] = ["helmet", "armor", "gloves", "boots"];
export const isArmorSlot = (s: Slot): boolean => ARMOR_SLOTS.includes(s);
export type RarityKey =
  | "common" | "uncommon" | "rare" | "epic" | "legendary" | "artifact";

/** A status/buff timer keyed by effect name (burn, poison, decay, regen, stun, blind, atkup, wardArmor). */
export type StatusMap = Record<string, number>;

/** Per-Attunement mana. A threshold that gates abilities AND scales output (REQUIEM). */
export type MnaPools = Record<Attunement, number>;
export const ATTUNEMENTS: Attunement[] = ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"];
export const zeroMna = (): MnaPools => ({ SOL: 0, NOX: 0, ANIMA: 0, QUANTA: 0, UMBRAXIS: 0 });

export interface Rarity {
  key: RarityKey;
  mult: number;
  affixes: number;
}

/** Affix definition (in the data pool) — `roll` produces a value for a given rarity index. */
export interface AffixDef {
  key: string;
  label: (n: number) => string;
  roll: (r: number) => number;
  stat: string;
}

/** A rolled affix instance carried on an item. */
export interface Affix {
  key: string;
  stat: string;
  value: number;
  label: (n: number) => string;
}

export type Implicit = Partial<Record<"atk" | "hp" | "armor" | "mp" | "mag" | "spd", number>>;

export interface Item {
  slot: Slot;
  cls: string;
  /** Weapon Attunement — a weapon sets the wielder's class (Attunement × Archetype). */
  att?: Attunement;
  rarity: RarityKey;
  rIx: number;
  ilvl: number;
  name: string;
  implicit: Implicit;
  /** Gear MNA grants by Attunement (weapons carry intrinsic MNA in their Attunement). */
  mna?: Partial<MnaPools>;
  affixes: Affix[];
}

export interface Stats {
  hp: number;
  mp: number;
  atk: number;
  spd: number;
  armor: number;
  mag: number;
}

export type SkillTarget = "enemy" | "allEnemies" | "ally" | "allAllies" | "self";
export type SkillType = "phys" | "mag" | "heal" | "buff" | "util";

export interface Skill {
  name: string;
  mp: number;
  target: SkillTarget;
  /** Attunement tree this ability lives in. */
  att: Attunement;
  /** MNA required in `att` to use it (a threshold, not a cast cost). */
  mnaReq: number;
  /** Marks the class Ultimate (unlocks at Archon = 100 MNA). */
  ult?: boolean;
  type: SkillType;
  power?: number;
  hits?: number;
  sol?: boolean;
  crit?: number;
  status?: StatusMap;
  buff?: { def?: number; atkup?: number; wardArmor?: number; turns?: number };
  cleanse?: boolean;
  desc: string;
}

export type Row = "front" | "back";

export interface MemberDef {
  id: string;
  name: string;
  cls: string;
  att: Attunement;
  role: string;
  spr: string;
  /** Formation row: front line is targeted first; back line (casters/ranged) is shielded. */
  row?: Row;
  base: Stats;
  growth: Stats;
  skills: string[];
}

export interface EnemyDef {
  name: string;
  spr: string;
  att: Attunement;
  lvl: number;
  hp: number;
  atk: number;
  spd: number;
  armor: number;
  mag: number;
  xp: number;
  gold: [number, number];
  ai: string;
  boss?: boolean;
  miniboss?: boolean;
  /** Ultra-rare "treasure" monster (Metal-Slime / Warmech tier): very rare spawn, exceptional loot. */
  rare?: boolean;
  /** Sprite art key override (defaults to the enemy's own key) — lets variants reuse base art. */
  art?: string;
  /** Bosses we deem to have an ENRAGE phase: at ≤20% HP they crossfade to the `omega` sprite and
   *  gain double ATB gain + double damage for the rest of the fight (the base is the "alpha"). */
  enrage?: { omega: string };
  skills?: string[];
  castChance?: number;
  onHit?: { poison?: number };
  leech?: number;
}

/** Common combatant shape shared by party members and enemies. */
export interface Unit {
  name: string;
  att: Attunement;
  side: "party" | "enemy";
  hp: number;
  maxhp: number;
  atk: number;
  spd: number;
  armor: number;
  mag: number;
  status: StatusMap;
  atb: number;
  alive: boolean;
  critPct: number;
  solPct: number;
  leech: number;
  mp?: number;
  maxmp?: number;
  /** Effective MNA pools (members; enemies leave undefined). Drives output scaling in combat. */
  mna?: MnaPools;
  guarding?: boolean;
  acting?: boolean;
  _hurt?: boolean;
  wardAmt?: number;
  bonusBurn?: boolean;
  onHitPoison?: number;
}

export interface Member extends Unit {
  def: MemberDef;
  id: string;
  cls: string;
  role: string;
  spr: string;
  /** Formation row (front targeted first; back shielded). */
  row: Row;
  level: number;
  xp: number;
  base: Stats;
  equip: Record<Slot, Item | null>;
  skills: string[];
  /** Player-assigned intrinsic MNA (from levels). Gear MNA is added on top in recalc. */
  mnaAlloc: MnaPools;
  /** Effective MNA = mnaAlloc + gear (computed by recalc; also mirrored to Unit.mna). */
  mna: MnaPools;
  /** Unspent intrinsic MNA points awaiting allocation (manual allocator = Phase 2). */
  mnaPoints: number;
  mp: number;
  maxmp: number;
  acted?: boolean;
  _init?: boolean;
}

export interface Enemy extends Unit {
  key: string;
  spr: string;
  lvl: number;
  xpReward: number;
  goldRange: [number, number];
  ai: string;
  boss: boolean;
  miniboss: boolean;
  skills: string[] | null;
  castChance: number;
  elite?: boolean;
  eliteAffixes?: string[];
  /** A champion: a tanky, multi-affix pack leader (above elite) with richer rewards. */
  champion?: boolean;
  /** Ultra-rare treasure monster: very rare spawn, exceptional loot. */
  rare?: boolean;
  /** Sprite art key override (defaults to `key`). */
  art?: string;
  /** Enrage config (alpha→omega at 20% HP), copied from the def; `enraged` flips on once triggered. */
  enrage?: { omega: string };
  enraged?: boolean;
}

/** What a combatant is doing this action — a plain attack, a skill, and/or an AoE sweep. */
export interface CombatAct {
  type?: string;
  skill?: Skill;
  aoe?: boolean;
}

export interface DamageResult {
  dmg: number;
  crit: boolean;
  mult: number;
  miss: boolean;
}

/** Minimal surface a battle exposes to enemy-ability handlers (keeps abilities engine-agnostic). */
export interface BattleApi {
  livingEnemies(): Enemy[];
  livingParty(): Member[];
  log(msg: string): void;
  float(u: Unit, txt: string, color: string): void;
}
