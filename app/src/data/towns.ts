// Explorable settlements (ADR 0006): hand-authored, walkable towns/villages the player roams
// and whose NPCs they talk to — not modal interludes. Pure data: no DOM, no controller imports.
//
// A settlement is a small ASCII layout the field controller decodes into tile kinds, a set of
// service-building POIs (inn/merchant/smith/revive/exit, room to grow), and NPCs (position +
// sprite + name + dialogue). The legend below maps each ASCII glyph to a town tile kind; the
// field renderer/`passable` understand those kinds. Buildings are walk-in: stepping onto the
// door tile fires the building's service (routed in Field.townTouch → Game.open*).

export type TownPOI = "inn" | "shop" | "smith" | "revive" | "exit";

/** An NPC the player can walk up to (or onto) and talk to. `lines` are spoken in order. */
export interface TownNPC {
  id: string;
  name: string;
  spr: string;        // emoji placeholder until a real sprite is sliced (see asset-gaps.md)
  x: number;
  y: number;
  /** Placeholder dialogue in the pastoral-heartland voice — narrative-writer to polish. */
  lines: string[];
}

export interface Settlement {
  id: string;
  name: string;
  /** Flavor shown on entry. */
  intro: string;
  /**
   * Hand-authored tile grid. One char per tile; all rows the same width. Legend:
   *   '#' wall (impassable, tree/fence)   '.' cobble (walkable)   ',' grass (walkable, decoration)
   *   'I' inn   'M' merchant   'B' smith   'R' revive shrine   'E' exit gate
   *   'F' fountain (impassable decoration)  'T' tree (impassable decoration)  'W' well (impassable)
   *   'H' house front (impassable building, flavor only)   '+' flower bed (walkable)
   */
  layout: string[];
  /** Where the player stands on entry (defaults to just inside the exit gate if omitted). */
  spawn?: { x: number; y: number };
  npcs: TownNPC[];
}

// Map a layout glyph to the tile kind the field renderer draws + `passable` checks.
export const TOWN_GLYPHS: Record<string, string> = {
  "#": "twall", ".": "town-cobble", ",": "town-grass", "+": "town-flower",
  "I": "t-inn", "M": "t-shop", "B": "t-smith", "R": "t-revive", "E": "t-exit",
  "F": "t-fountain", "T": "t-tree", "W": "t-well", "H": "t-house",
};

// Which POI a building tile triggers when walked onto.
export const POI_OF: Record<string, TownPOI> = {
  "t-inn": "inn", "t-shop": "shop", "t-smith": "smith", "t-revive": "revive", "t-exit": "exit",
};

// Town tiles the player cannot walk through.
export const TOWN_BLOCKERS = new Set(["twall", "t-fountain", "t-tree", "t-well", "t-house"]);

// ── Hearthford — the Greenvale starting village ─────────────────────────────────────────────
// A lived-in farm hamlet (25×17): a central green with a well, two cobbled streets, the four
// services as walk-in buildings around the square, flavor houses, garden beds, and several NPCs
// (elder, guard, child, farmer, innkeeper) scattered where you'd find them. The exit gate sits
// in the north wall and opens onto the Greenvale overworld. Dialogue is placeholder — pastoral
// voice — flagged for narrative-writer.
const HEARTHFORD: Settlement = {
  id: "hearthford",
  name: "Hearthford",
  intro:
    "Hearthford wakes slow under a gold morning — woodsmoke, a creaking well, hens in the lane. " +
    "Talk to the folk, rest at the inn, stock up, then take the north gate out into Greenvale.",
  // 25 wide × 17 tall. Walls ring it; 'E' is the north exit gate.
  layout: [
    "##########EE#############",
    "#,,T,,.....,,...T,,,,,,,#",
    "#H,,,...........,,,,H,,,#",
    "#,,..I.....,,...M...,,,,#",
    "#T,...........,...,...,T#",
    "#,,.,,...+TT+..,,..,..,,#",
    "#,..,,...+,W,+.,,.....,,#",
    "#,..,,...+,,,+.,,..,..,,#",
    "#,..,,...+FF+..,,..,..,,#",
    "#T,.,,........,,,.,..,,T#",
    "#,,...........,,,...,,,,#",
    "#,,..B.....,,..R....,,,,#",
    "#H,,,...........,,,H,,,,#",
    "#,,T,,...,,,,,,..,T,,,,,#",
    "#,,,,,,.........,,,,,,,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "#########################",
  ],
  // spawn just inside the north gate on the central street
  spawn: { x: 10, y: 1 },
  npcs: [
    { id: "elder", name: "Elder Maelis", spr: "🧓", x: 11, y: 9,
      lines: [
        "Well met, traveler. You've the look of someone the road hasn't broken yet.",
        "Hearthford is quiet — too quiet of late. Bandits work the north fields, bold as crows.",
        "Take the gate north into Greenvale when you're ready. And mind the warren they nest in.",
      ] },
    { id: "guard", name: "Watchman Bram", spr: "💂", x: 11, y: 2,
      lines: [
        "Hold a moment. Heading out the north gate? Greenvale's no orchard stroll these days.",
        "Slimes and kobolds in the grass, and the bandits' Brigadier holds the choke to the warren.",
        "Rest at the inn before you go. Folk who march out tired march back on a board.",
      ] },
    { id: "child", name: "Little Pip", spr: "🧒", x: 6, y: 6,
      lines: [
        "Are you a real adventurer? With a sword and everything?",
        "I'm gonna be one too! Soon as Mum lets me past the gate. Which is never.",
        "If you see Hogger out there — he's HUGE, everyone says — tell him I said hi!",
      ] },
    { id: "farmer", name: "Goodwife Tansy", spr: "👩‍🌾", x: 18, y: 14,
      lines: [
        "Mind the flower beds, dear. Took me all spring to coax them out of this stubborn soil.",
        "The bandits trampled my far field again. If you're going north, give 'em one for me.",
        "There's good gear at the smith and supplies at the market — don't go out half-shod.",
      ] },
    { id: "innkeep", name: "Innkeeper Doral", spr: "🧑‍🍳", x: 7, y: 4,
      lines: [
        "Roof, hearth, and a hot meal — that's the inn just there. Costs you nothing, friend.",
        "Rest mends more than potions do. Step into the inn whenever the road's worn you thin.",
      ] },
  ],
};

export const SETTLEMENTS: Record<string, Settlement> = {
  hearthford: HEARTHFORD,
};

/** Look up a settlement by id (falls back to Hearthford so the field never loads nothing). */
export function settlement(id: string): Settlement {
  return SETTLEMENTS[id] ?? HEARTHFORD;
}
