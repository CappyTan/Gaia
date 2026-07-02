// CONSUMABLES — pure data (docs/design/crafting-schema.md §Consumables, the Greenvale-starter ♦
// tier). Crafted at a town smith from MATERIALS (+ a small Aether fee) into Game.consumables
// (stackable, persisted like quests/materials — optional degrade-never-throw save field), used
// from the Bag OUT of battle (in-battle use is a later slice). Extensible: the effect is a typed
// union — Cleansing Tincture / Smoke Veil / the six stat Elixirs / Wards join as new kinds here.

/** What using a consumable does. A union so later families (cleanse/escape/buff/ward) slot in. */
export type ConsumableEffect =
  | { kind: "heal"; pct: number }; // restore pct of max HP to one ally

export interface ConsumableDef {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  effect: ConsumableEffect;
  /** Material ids → counts consumed per craft. */
  recipe: Record<string, number>;
  /** The smith's Aether (◈) crafting fee. */
  fee: number;
  /** Tier band (1 = the Greenvale starter tier; later zones climb) — used to pick an
   *  encounter-appropriate battle drop (systems/crafting rollBattleConsumables). Optional: consumables
   *  without one are eligible at every tier (falls back to uniform selection). */
  tier?: number;
}

export const CONSUMABLES: Record<string, ConsumableDef> = {
  "health-tonic": {
    id: "health-tonic",
    name: "Health Tonic",
    icon: "🧪",
    blurb: "A warm red draught of lifebloom steeped in sinew-broth — closes wounds from the inside. Restores a good third of one ally's health.",
    effect: { kind: "heal", pct: 0.35 },
    recipe: { "lifebloom-seed": 1, "beast-sinew": 1 }, // the reconciled sheet's Health Tonic
    fee: 15,
    tier: 1,
  },
};
