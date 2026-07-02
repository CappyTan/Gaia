// Crafting MATERIALS — pure data (docs/design/crafting-schema.md, Staging §1 "the slice"). The
// Greenvale-starter pool: stackable non-gear inventory (id/name/family/tier/icon/blurb), the
// per-enemy-family battle-drop tables, and the three overworld GATHERING-NODE yield tables. The
// pure roll logic lives in systems/crafting; the run's counts live on Game.materials (persisted
// as an optional degrade-never-throw save field, like quests). Extensible: later slices add the
// full family ladders (essence ×4 tiers, catalysts, gems, ancient) as more rows here.

import type { NodeKind } from "./zones";

/** The sheet's material families (A–H), reconciled — a material belongs to exactly one. */
export type MaterialFamily =
  | "salvage"    // scrap/base parts (also salvaged from gear, slice 2)
  | "essence"    // attunement essence (Sol Ember → … ladder; Aether Dust is the neutral trace)
  | "component"  // archetype components (staged)
  | "monster"    // monster-family parts (fangs/hides/threads of the foes that shed them)
  | "regional"   // region-bound resources (Greenvale → Greenvale Ironwood, Lifebloom Seed)
  | "catalyst"   // stat catalysts (staged)
  | "gem"        // socketables (staged)
  | "ancient";   // legendary reconstruction (staged)

export interface MaterialDef {
  id: string;
  name: string;
  family: MaterialFamily;
  /** Tier band (1 = the Greenvale starter ♦ tier; later zones climb). */
  tier: number;
  icon: string;
  blurb: string;
}

export const MATERIALS: Record<string, MaterialDef> = {
  "iron-scrap":         { id: "iron-scrap",         name: "Iron Scrap",         family: "salvage",  tier: 1, icon: "⚙️", blurb: "Bent nails, snapped fittings, a hinge worth saving — the smith's bread and butter." },
  "worn-leather":       { id: "worn-leather",       name: "Worn Leather",       family: "salvage",  tier: 1, icon: "🥾", blurb: "Supple straps and patches cut from gear that outlived its owner." },
  "marked-steel":       { id: "marked-steel",       name: "Marked Steel",       family: "salvage",  tier: 1, icon: "🗡️", blurb: "Good steel struck with the Greenvale bandits' crown-mark — someone will want it melted." },
  "greenvale-ironwood": { id: "greenvale-ironwood", name: "Greenvale Ironwood", family: "regional", tier: 1, icon: "🪵", blurb: "Heartwood of the shire's oldest roots — takes an edge like slow iron." },
  "lifebloom-seed":     { id: "lifebloom-seed",     name: "Lifebloom Seed",     family: "regional", tier: 1, icon: "🌱", blurb: "A meadow seed that hums warm in the palm — the base of every mending draught." },
  "beast-fang":         { id: "beast-fang",         name: "Beast Fang",         family: "monster",  tier: 1, icon: "🦷", blurb: "A clean-pulled fang, still sharp. Kobolds and worse shed them when they fall." },
  "beast-hide":         { id: "beast-hide",         name: "Beast Hide",         family: "monster",  tier: 1, icon: "🐾", blurb: "Tough field-beast hide, slime-scoured but sound." },
  "beast-sinew":        { id: "beast-sinew",        name: "Beast Sinew",        family: "monster",  tier: 1, icon: "🪢", blurb: "Springy cord stripped from a beast's haunch — binding, bowstring, or tonic-thickener." },
  "rogue-thread":       { id: "rogue-thread",       name: "Rogue Thread",       family: "monster",  tier: 1, icon: "🧵", blurb: "Waxed black thread off a bandit's jerkin — strong, and it holds a dye." },
  "aether-dust":        { id: "aether-dust",        name: "Aether Dust",        family: "essence",  tier: 1, icon: "💫", blurb: "A pinch of raw mana settled to glitter — the neutral trace every attunement leaves behind." },
  "sol-ember":          { id: "sol-ember",          name: "Sol Ember",          family: "essence",  tier: 1, icon: "🔥", blurb: "A mote of SOL that refuses to gutter out. Warm through any pouch." },
  "nox-rime":           { id: "nox-rime",           name: "Nox Rime",           family: "essence",  tier: 1, icon: "🌘", blurb: "A flake of NOX frost that never melts — cold the way a held breath is quiet." },
};

// ── BATTLE DROPS (the Greenvale early-game pool) ────────────────────────────────────────────────
/** Which drop family a bestiary key sheds (unmapped foes shed nothing — later zones join per slice). */
export type EnemyMatFamily = "beast" | "outlaw";
export const ENEMY_MAT_FAMILY: Record<string, EnemyMatFamily> = {
  // beasts & slimes (the shire's wild side; Hogger sheds like the beast he is)
  slime: "beast", slimebig: "beast", kobold: "beast", kobolde: "beast", hogger: "beast",
  // bandits & humanoids (the Kingpin's crews)
  gbandit: "outlaw", gmage: "outlaw", brigand: "outlaw", lieutenant: "outlaw",
  kingpin: "outlaw", "kingpin-omega": "outlaw",
};
/** The common parts each family sheds (material ids). */
export const FAMILY_MATS: Record<EnemyMatFamily, string[]> = {
  beast: ["beast-fang", "beast-hide", "beast-sinew"],
  outlaw: ["rogue-thread", "marked-steel", "worn-leather"],
};
/** The rare essence trace by the foe's Attunement (anything unlisted sheds neutral Aether Dust). */
export const RARE_ESSENCE: Record<string, string> = { SOL: "sol-ember", NOX: "nox-rime" };

// ── GATHERING NODES (WoW-style, Dara — crafting-schema §Gathering nodes) ───────────────────────
/** A node kind's yield table: always 1–2 of the base material, plus a rare bonus roll. */
export interface GatherNodeDef {
  kind: NodeKind;
  name: string;
  icon: string;
  blurb: string;
  base: string;        // material id, 1–2 per gather
  rare: string;        // material id, bonus roll
  rareChance: number;  // 0–1
}

export const GATHER_NODES: Record<NodeKind, GatherNodeDef> = {
  "node-ore":   { kind: "node-ore",   name: "Ore Vein",     icon: "⛏️", blurb: "A seam of workable ore glinting in the rock. You pry loose what the shire's crags will give.", base: "iron-scrap", rare: "marked-steel", rareChance: 0.25 },
  "node-root":  { kind: "node-root",  name: "Ancient Root", icon: "🌿", blurb: "An old root heaved up through the loam, hard as slow iron. You cut free the good heartwood.", base: "greenvale-ironwood", rare: "lifebloom-seed", rareChance: 0.3 },
  "node-bloom": { kind: "node-bloom", name: "Spirit Bloom", icon: "✨", blurb: "A faintly glowing bloom, petals warm with settled mana. You gather it whole, seeds and all.", base: "lifebloom-seed", rare: "aether-dust", rareChance: 0.2 },
};
