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
   *   '=' boardwalk plank (walkable)   '~' bog/standing water (impassable)   'h' stilt-house (impassable)
   *   't' dead/marsh tree (impassable)  'L' lantern post (impassable decoration)
   */
  layout: string[];
  /** Optional flavor key — lets the renderer tint a settlement (e.g. "marsh" reads grim). */
  theme?: string;
  /** Where the player stands on entry (defaults to just inside the exit gate if omitted). */
  spawn?: { x: number; y: number };
  npcs: TownNPC[];
}

// Map a layout glyph to the tile kind the field renderer draws + `passable` checks.
export const TOWN_GLYPHS: Record<string, string> = {
  "#": "twall", ".": "town-cobble", ",": "town-grass", "+": "town-flower",
  "I": "t-inn", "M": "t-shop", "B": "t-smith", "R": "t-revive", "E": "t-exit",
  "F": "t-fountain", "T": "t-tree", "W": "t-well", "H": "t-house",
  // marsh-outpost kinds (Miregard): plank boardwalk over bog, standing water, stilt-houses, dead trees, lantern posts
  "=": "town-plank", "~": "town-bog", "h": "t-stilt", "t": "t-deadtree", "L": "t-lantern",
};

// Which POI a building tile triggers when walked onto.
export const POI_OF: Record<string, TownPOI> = {
  "t-inn": "inn", "t-shop": "shop", "t-smith": "smith", "t-revive": "revive", "t-exit": "exit",
};

// Town tiles the player cannot walk through.
export const TOWN_BLOCKERS = new Set([
  "twall", "t-fountain", "t-tree", "t-well", "t-house",
  "town-bog", "t-stilt", "t-deadtree", "t-lantern",
]);

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
    "Hearthford wakes slow in the gold of the Shirelands — woodsmoke and warm bread, a creaking " +
    "well, hens loose in the lane. A good place to be from. Beyond the north gate, Greenvale is " +
    "less kind these days. Talk to the folk, rest at the inn, kit yourself out — then go see why.",
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
        "Well met, traveler. You've a young road in your eyes — not yet worn the way mine is.",
        "I've watched over Hearthford forty winters, and never seen the fields so quiet. Bandits work the north end now, bold as crows on a scarecrow.",
        "Go north into Greenvale when you're ready — but mind the old warren they've made their nest. Brave folk have gone in. Fewer come out.",
      ] },
    { id: "guard", name: "Watchman Bram", spr: "💂", x: 11, y: 2,
      lines: [
        "Hold up. North gate? On your own head, then — Greenvale's no orchard stroll anymore.",
        "Slimes and kobolds in the long grass, that's the least of it. The bandits' Brigadier holds the choke into the warren, and he doesn't bluff.",
        "Sleep at the inn first. I've seen too many march out proud and come back on a board. Don't make me carry you.",
      ] },
    { id: "child", name: "Little Pip", spr: "🧒", x: 6, y: 6,
      lines: [
        "Are you a REAL adventurer? With a sword and a whole quest and everything?",
        "I'm gonna be one too — soon as Mum lets me past the gate. So... never.",
        "Hey — if you see Hogger out there, you HAVE to tell me! He's bigger than the barn, Tomas swears it. Nobody believes him. I do.",
      ] },
    { id: "farmer", name: "Goodwife Tansy", spr: "👩‍🌾", x: 18, y: 14,
      lines: [
        "Watch the flower beds, dear — took me all spring to coax those out of this stubborn Shireland soil, and I'll not have them stomped.",
        "The bandits trampled my far field a third time this month. If you're headed north, you give one of them a knock for Tansy.",
        "And don't go out half-shod, you hear? Honest steel at the smith, good supplies at the market. Spend the coin or you'll wish you had.",
      ] },
    { id: "innkeep", name: "Innkeeper Doral", spr: "🧑‍🍳", x: 7, y: 4,
      lines: [
        "A roof, a hearth, a hot bowl of something — that's all I've got, and it's yours, friend. The inn's right there.",
        "Sleep mends what no potion can reach. Come back through that door whenever the road's worn you down to the wick.",
      ] },
  ],
};

// ── Miregard — the Duskmarsh marsh-edge outpost ─────────────────────────────────────────────
// NOT sunny Hearthford. A grim, half-drowned stockade on stilts at the lip of the mire (25×16):
// a palisade of dead timber rings it, the streets are plank BOARDWALKS laid over black BOG, and a
// lantern-lit causeway runs the spine. The four services are walk-in stilt-buildings off the
// boardwalk; the EAST gate opens onto the Duskmarsh proper. Only a few wary folk remain — a
// marsh-warden, a bog-touched healer, a stranded trader — their lines dread-tinged (placeholder;
// narrative-writer to polish). This is the between-zones hub the player reaches after the Kingpin
// falls, before stepping into the marsh.
const MIREGARD: Settlement = {
  id: "miregard",
  name: "Miregard",
  theme: "marsh",
  intro:
    "Miregard hangs on rotting stilts at the lip of the Duskmarsh — plank walks over black water, " +
    "lanterns guttering in a fog that never lifts. The folk who stayed speak low and bar their " +
    "doors at dusk. Rest while there's a roof; trade while there's coin; mend at the shrine. " +
    "Past the east gate the marsh is waiting. It has nowhere else to be.",
  // 25 wide × 16 tall. Dead-timber palisade rings it; 'E' is the EAST gate onto the marsh. Plank
  // boardwalks ('=') run an H over black bog ('~'); the four services sit on the cross-walks; stilt-
  // houses ('h'), lantern posts ('L') and dead trees ('t') dress the water. NPCs stand at the water's
  // edge (on bog beside a plank — you bump them from the walk), so none can ever sever the route.
  layout: [
    "#########################",
    "#~t~~~~~~~~~~~~~~~~~~~t~#",
    "#~~~~~~~L~~==~~L~~~~~~~~#",
    "#~~~=I===========M=~~~~~#",
    "#~~~~~~~~~~==~~~~~~~~~~~#",
    "#~~~~~~~h~~==~~h~~~~~~~~#",
    "#~~t~~~~~~~==~~~~~~~t~~~#",
    "#~~~~~~~~~~============E#",
    "#~~~~~~~~~~==~~~~~~~~~~~#",
    "#~~t~~~~~~~==~~~~~~~~~~~#",
    "#~~~~~~~h~~==~~h~~~~~~~~#",
    "#~~~~~~~~~~==~~~~~~~~~~~#",
    "#~~~=B===========R=~~~~~#",
    "#~~~~~~~L~~==~~L~~~~~~~~#",
    "#~t~~~~~~~~~~~~~~~~~~~t~#",
    "#########################",
  ],
  // spawn on the spine boardwalk near the south end, facing up the lantern causeway
  spawn: { x: 11, y: 13 },
  npcs: [
    { id: "warden", name: "Marsh-Warden Coll", spr: "🪖", x: 10, y: 7,
      lines: [
        "Came up the dry road from Greenvale, did you. Welcome to the wet end of nowhere.",
        "The marsh has turned wrong this season. Water climbs where it never climbed, and things stir under it that ought to stay still. Three patrols I sent toward the Drowned Vault. I'm still waiting on all three.",
        "You're set on going east — I know the look. Then heed me: keep to the planks. Step off the causeway into that bog, and the Duskmarsh doesn't give you back.",
      ] },
    { id: "healer", name: "Old Mother Sedge", spr: "🧙", x: 18, y: 11,
      lines: [
        "Come into the lantern-light where I can see you, child. The fog's fond of faces it hasn't learned yet. Don't give it yours.",
        "I tend what the marsh leaves on my step — fever, rot, the slow grey sickness the lepers carry up from the water. Your fallen? Lay them at the shrine. It works deeper than these old hands.",
        "There's a Broodmother out there, spinning the dark before the Vault. And below her, the troll — old as the mire and twice as spiteful. Go heavy, or go home. Sedge has buried braver than you.",
      ] },
    { id: "trader", name: "Stranded Jeb", spr: "🧑‍🌾", x: 18, y: 2,
      lines: [
        "Marooned, that's the word for me. Rolled in to sell to the marsh-folk, and now the only road out runs straight through THAT. Should've trusted the fog when it told me to turn around.",
        "Here's the bright side, friend — my misfortune's your bargain. I'll let the stock go cheap as I dare, sooner than watch it rot in the cart when the water comes up for it.",
        "Two rules in Miregard. One: you hear singing on the water after dark, you do not answer it. Two: settle your tab at the inn. Both'll keep you breathing, in their way.",
      ] },
    { id: "fisher", name: "Wynn the Bog-Fisher", spr: "🧓", x: 13, y: 8,
      lines: [
        "Hauled up my nets last week. What was in them weren't fish. Cut the line and let it sink. Some catches you leave to the water.",
        "Good steel's down there, rusting in the dark — sunken stones south of the causeway, the marsh swallowed whole. A bold soul comes back rich off it. Bolder one don't come back. I fish where it's shallow.",
      ] },
  ],
};

export const SETTLEMENTS: Record<string, Settlement> = {
  hearthford: HEARTHFORD,
  miregard: MIREGARD,
};

/** Look up a settlement by id (falls back to Hearthford so the field never loads nothing). */
export function settlement(id: string): Settlement {
  return SETTLEMENTS[id] ?? HEARTHFORD;
}
