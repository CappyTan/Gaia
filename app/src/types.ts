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

// ── Status-effect catalog (ADR 0016) — the unified buff/debuff model that supersedes the loose
//    StatusMap + rigid Skill.buff: every effect is a DEFINITION (data/status.ts), applied to a unit as
//    a structured INSTANCE. Engine wiring (combat/battle/save/UI) migrates onto this incrementally;
//    StatusMap stays until that pass lands.
/** The 5 ratified mechanic layers (attunement-mechanics.md). */
export type StatusLayer = "status" | "action" | "stat" | "meta" | "economy";
export type StatusKind = "buff" | "debuff";
/** 6 buckets: class-agnostic Neutral + the 5 attunement suites. */
export type StatusBucket = "neutral" | Attunement;
export type StackRule = "refresh" | "stack-intensity" | "stack-duration" | "unique";
/** How an effect lands: `on-hit` chip (auto with the hit) or `resistible` (Accuracy ↔ Resistance). */
export type StatusApply = "on-hit" | "resistible";

/** A buff/debuff DEFINITION in the catalog (data/status.ts). Magnitudes are a balance pass. */
export interface StatusDef {
  id: string;
  name: string;
  kind: StatusKind;
  layer: StatusLayer;
  bucket: StatusBucket;
  /** Default duration in the bearer's turns. */
  turns: number;
  /** Per-stack effect magnitude — units are effect-specific (% for stat mods, dmg/tick for DoTs, …). */
  magnitude?: number;
  /** Max stacks for `stack-intensity` (default 1). */
  maxStacks?: number;
  stacking: StackRule;
  apply: StatusApply;
  cleansable?: boolean;   // removed by Cleanse (debuffs)
  dispellable?: boolean;  // removed by buff-strip / dispel (buffs)
  timeLockable?: boolean; // NOX preserve / dispel-lock target
  needsSource?: boolean;  // ticked effect that references its caster (Drain → caster)
  /** Phase-transition: at max stacks, auto-promotes to this def id (Chill→Frozen…). */
  promotesTo?: string;
  desc: string;
}

/** A live buff/debuff INSTANCE carried on a unit. */
export interface StatusInstance {
  defId: string;
  turns: number;
  stacks: number;
  magnitude: number;
  source?: string; // attacker/caster id, for needsSource effects
}

/**
 * DUNGEON REPRIEVE (ADR 0010) — a dungeon rest node's TAILORED relief. Deliberately NOT a full heal:
 * each kind relieves ONE axis, partially, so a deep dungeon stays punishing (a full HP+MP refill every
 * floor trivialises the game — Dara). Caves declare NO reprieve (no rest node at all). Themed per dungeon:
 *   • "mend"   — restores `amount` fraction of MAX HP to standing heroes (no MP). A field-dressing fire.
 *   • "mana"   — restores `amount` fraction of MAX MP to standing heroes (no HP). An arcane wellspring.
 *   • "regen"  — grants a carried Regeneration that seeds into the NEXT battle (`amount` regen ticks);
 *                heals gradually IN combat, never instantly — relief you have to survive into. A living
 *                wood / lava-vent's restorative warmth.
 * (A "cleanse" reprieve that lifts a lingering ailment like petrification awaits persistent out-of-combat
 * statuses — a later mechanic; statuses are per-battle today.)
 */
export type ReprieveKind = "mend" | "mana" | "regen";
export interface Reprieve {
  kind: ReprieveKind;
  amount?: number;   // mend/mana: fraction of max (0..1, default 0.4); regen: number of regen ticks (default 5)
  name: string;      // the node's themed name shown in the overlay (e.g. "A Bandit Hearth")
  blurb: string;     // overlay flavor — what the party does here (words only; the mechanic is the kind)
}


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

/** The five primary attributes (Stat System V3; MGC→VIT per ADR 0013). Keyed the same as
 *  data/statScaling. */
export type PrimaryStat = "STR" | "AGI" | "VIT" | "SPD" | "DEF";
export type Prims = Record<PrimaryStat, number>;
export const PRIM_KEYS: PrimaryStat[] = ["STR", "AGI", "VIT", "SPD", "DEF"];
export const zeroPrims = (): Prims => ({ STR: 0, AGI: 0, VIT: 0, SPD: 0, DEF: 0 });

/** The 20 secondary stats (4 per primary; ADR 0014 — Matter/Energy typing, the final 20). These are
 *  the rollable affix pool AND the substat sheet (canonical defs/labels/order in data/substats).
 *  All values are percentages. */
export type SubKey =
  | "Mpn" | "Exe" | "Lfs" | "Cch"   // STR
  | "Crt" | "Cmd" | "Eva" | "Acc"   // AGI
  | "Abp" | "Hld" | "Epn" | "Buf"   // VIT
  | "Abg" | "Acr" | "Cdr" | "Chc"   // SPD
  | "Mrd" | "Erd" | "Blk" | "Res";  // DEF
export type Subs = Record<SubKey, number>;
export const SUB_KEYS: SubKey[] = [
  "Mpn", "Exe", "Lfs", "Cch", "Crt", "Cmd", "Eva", "Acc", "Abp", "Hld",
  "Epn", "Buf", "Abg", "Acr", "Cdr", "Chc", "Mrd", "Erd", "Blk", "Res",
];
export const zeroSubs = (): Subs =>
  SUB_KEYS.reduce((o, k) => { o[k] = 0; return o; }, {} as Subs);

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
  /** V3 primary-attribute grants (STR/AGI/VIT/SPD/DEF) carried by the piece — every drop carries some. */
  prim?: Partial<Prims>;
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
/** ADR 0014 damage typing — MATTER (struck/martial) vs ENERGY (projected/channeled). When unset on a
 *  Skill/CombatAct, combat derives it from the skill kind (mag→energy, else matter), so tagging is opt-in. */
export type DmgType = "matter" | "energy";

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
  /** Optional explicit damage type (ADR 0014); unset = derived from `type` (mag→energy, else matter). */
  dmgType?: DmgType;
  power?: number;
  hits?: number;
  sol?: boolean;
  crit?: number;
  status?: StatusMap;
  buff?: { def?: number; atkup?: number; wardArmor?: number; turns?: number };
  cleanse?: boolean;
  /** V3 resource economy (ADR 0019): own-Attunement resource GENERATED on use (specials/auto) — added to
   *  the shared pool at turn end. One-way with `resourceCost` (a skill does one or the other). Set by the
   *  band→number generator (systems/classKit) on generated kits; unset on the legacy hand-authored kits. */
  resourceGen?: number;
  /** V3 resource economy: own-Attunement resource SPENT on use (signatures/ultimates) — debited from the
   *  shared pool at resolution. Unset on legacy kits (they spend nothing). */
  resourceCost?: number;
  /** Per-skill cooldown in turns (from the cooldown band). Unset → the flat `Battle.ABILITY_CD`. */
  cd?: number;
  /** Build-identity lane (A/B/C) — V3 generated kits only; display/future use. */
  lane?: string;
  /** Optional combat-animation key (SKILL_ANIM in data/skillAnimations) — plays a layered
   *  character/effect/impact sequence on use instead of the instant hit. */
  anim?: string;
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

/** Enemy combat role — sets the V3 primary SHAPE + HP/ATK multipliers (systems/enemyStats), so a
 *  level-N enemy's stats are DERIVED, not hand-authored (ADR 0018 — the bestiary level-seeding rebuild). */
export type EnemyRole =
  | "skirmisher" | "bruiser" | "harrier" | "caster" | "wall" | "brute"
  | "miniboss" | "boss" | "rare";

export interface EnemyDef {
  name: string;
  spr: string;
  att: Attunement;
  lvl: number;
  /** V3 (ADR 0018): combat stats DERIVE from role + lvl (+ lean) via systems/enemyStats — not authored. */
  role: EnemyRole;
  /** Optional per-enemy primary re-weighting (multiplies a role weight) — for outliers: armored
   *  "metal" jackpots (DEF huge, VIT near 0), sponges, fast variants. */
  lean?: Partial<Prims>;
  /** Optional explicit basic-attack damage type (ADR 0014); defaults to matter. */
  dmgType?: DmgType;
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
  /** Live buff/debuff instances (ADR 0016). Per-battle: reset at battle start, never saved. */
  statuses: StatusInstance[];
  atb: number;
  alive: boolean;
  critPct: number;
  solPct: number;
  leech: number;
  mp?: number;
  maxmp?: number;
  /** Effective MNA pools (members; enemies leave undefined). Drives output scaling in combat. */
  mna?: MnaPools;
  /** V3 effective primary attributes (innate + gear) — members only; enemies leave undefined. Display. */
  prim?: Prims;
  /** V3 secondary stats from gear affixes (the 20). Members only; enemies leave undefined. Combat reads
   *  Block/Evasion/typed Reduction & Penetration/Execute/Crit-Damage; the SPD-tempo group + Acc/Buf/Res
   *  stay display until the ATB/status pass (ADR 0016). */
  sub?: Subs;
  /** V3 ability-power amplifier from GEAR primaries + Ability Power affix (e.g. 0.12 = +12% ability
   *  damage). Zero with no gear, so a fresh hero is combat-neutral. Members only. */
  abp?: number;
  /** Damage type of this unit's BASIC attack (ADR 0014). Enemies set it (default matter); members
   *  leave it unset — combat derives per-skill. */
  dmgType?: DmgType;
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
  /** V3 3-lane choice picks (ADR 0020): slot id → chosen ability name(s); see `Picks` in systems/choice
   *  (structurally `Record<string, string[]>`). Present once the player has banked picks for this class
   *  in the picker; drives the usable kit via `activeKit` (systems/classKit) instead of the static KITS
   *  map. Absent → the member falls back to the legacy `kitFor` kit. Persisted per-member. */
  picks?: Record<string, string[]>;
  mp: number;
  maxmp: number;
  /** Battle System 2.0: per-skill cooldown timers (skill key → turns remaining) — the substitute for
   *  MP. Reset each battle; set on use, decremented at the start of the member's turn. */
  cooldowns?: Record<string, number>;
  acted?: boolean;
  /** A carried Regeneration from a dungeon "regen" reprieve — seeded into status at the next battle start
   *  (statuses are otherwise wiped per-battle), then spent. Gradual in-combat healing, never an instant heal. */
  pendingRegen?: number;
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
  /** Explicit damage type override (ADR 0014); falls back to the skill's derived type. */
  dmgType?: DmgType;
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
