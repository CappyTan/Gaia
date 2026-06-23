import type { Capability } from "./world";

// HELD ITEMS — the party-menu "Items" inventory (distinct from `Game.inventory`, which is equippable
// loot). Two classes:
//   • "key"        — quest / traversal items. Held for the whole run, NEVER consumed (rafts, keys,
//                    sigils, the planks-and-rafts the player gathers along the way). A key item with
//                    `grantsCap` confers that traversal capability while held — owning the raft IS what
//                    opens the Sunless Gorge. This keeps systems/traversal.ts + data/world.ts the cap
//                    authority: acquiring the item just grants its cap (capsFromItems derives the link).
//   • "consumable" — stackable use-items (potions, antidotes, ethers…) for later. None exist yet; the
//                    class is here so the inventory + Items panel are built to hold them.
// Definitions live here (DATA, ADR 0005); the run owns which ids it holds (Game.heldItems) and persists
// them (save.ts). Add a new quest item / key by adding a row here + a single grant point in a controller.
export type HeldKind = "key" | "consumable";

export interface HeldItemDef {
  id: string;              // stable key — persisted, and the grant/lookup handle
  name: string;            // display name (canon names pending Dara's blessing)
  icon: string;            // emoji glyph shown in the Items panel
  kind: HeldKind;
  blurb: string;           // flavor line for the Items panel (no mechanics/numbers — narrative's lane)
  grantsCap?: Capability;  // KEY items only: owning it unlocks this run-traversal capability
}

// The registry. First entry: the raft hauled from the Bandit Warren — the run's first held quest item,
// and the thing that "drives the gorge capability" per the Silverwood overhaul (D2). NAME PENDING DARA.
export const HELD_ITEMS: Record<string, HeldItemDef> = {
  raft: {
    id: "raft",
    name: "Lashed Raft",
    icon: "🛶",
    kind: "key",
    blurb: "A crude raft of bound logs, hauled from the Bandit Warren. It bears the party across the Sunless Gorge into the Silverwood.",
    grantsCap: "gorge",
  },
};
