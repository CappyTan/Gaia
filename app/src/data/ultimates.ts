// ULTIMATE abilities — a per-class signature super, surfaced as its own "Ultimate" command in battle
// and (for the showcase ones) gated behind a fullscreen cutscene. Pure data: the cutscene is an asset
// KEY resolved by core/assets at play time; the controller (controllers/battle) owns the flow.
//
// Keyed by "Attunement:Archetype" (a Member's att × cls), like BASIC_ATTACK_ANIM / BODY_SCALE.
// First entry is a TEST build of the Photon Vanguard's Orbital Cannon (per Dara): free, every turn,
// plays a cutscene, then deletes the enemy line for 9999. Numbers/cost are placeholders to iterate on.

export interface Ultimate {
  name: string;
  desc: string;
  /** Asset key under assets/ for the fullscreen cutscene (resolved via core/assets). Omit for none. */
  cutscene?: string;
  /** Flat damage dealt (bypasses the affinity ring — this is a fixed-number showcase nuke for now). */
  damage: number;
  /** Who it hits. Only allEnemies for now. */
  target: "allEnemies";
  /** MP cost (0 = free, for testing). */
  mp: number;
}

export const ULTIMATES: Record<string, Ultimate> = {
  "SOL:Rifle": {
    name: "Orbital Cannon",
    desc: "Paint the field and call down the orbital lance — 9999 to ALL foes.",
    cutscene: "cutscenes/orbital-cannon.mp4",
    damage: 9999,
    target: "allEnemies",
    mp: 0, // TEST: free + usable every turn
  },
};
