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
    "Miregard clings to the edge of the Duskmarsh on rotting stilts — plank walks over black water, " +
    "lanterns guttering against a fog that never quite lifts. Folk here speak low and lock their " +
    "doors at dusk. Rest, trade, gird yourself. Beyond the east gate the marsh is waiting, and it " +
    "is patient.",
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
        "You came up the dry road from Greenvale, then. Wish I had better news for the welcome.",
        "The marsh has been wrong of late. The water rises where it shouldn't, and things move under it that didn't used to. We've lost three patrols to the Drowned Vault.",
        "If you mean to go east — and I see that you do — keep to the causeway. Step off the planks into the bog and the Duskmarsh keeps you.",
      ] },
    { id: "healer", name: "Old Mother Sedge", spr: "🧙", x: 18, y: 11,
      lines: [
        "Come close, child, into the lantern-light. The fog likes to take faces it doesn't know.",
        "I tend what the marsh leaves behind — fever, rot, the slow grey sickness the lepers carry. The shrine there will mend your fallen better than these old hands can.",
        "There's a Broodmother spinning in the dark before the Vault. And under her, the troll. Old as the mire, and twice as hateful. Go heavy, or don't go.",
      ] },
    { id: "trader", name: "Stranded Jeb", spr: "🧑‍🌾", x: 18, y: 2,
      lines: [
        "Marooned, that's what I am. Came to sell to the marsh-folk and now the only road out runs through THAT.",
        "Tell you what — my loss is your luck. I'll part with my stock cheap as I dare, just so it's not rotting in my cart when the water comes for it.",
        "You hear singing out on the water at night, you don't answer it. That's the one rule of Miregard. The other is: pay your tab at the inn.",
      ] },
    { id: "fisher", name: "Wynn the Bog-Fisher", spr: "🧓", x: 13, y: 8,
      lines: [
        "Pulled something up in my nets last week weren't no fish. Threw it back fast as I could. Some catches you don't keep.",
        "There's good steel rusting out in the ruins, they say — the old sunken stones south of the causeway. Brave soul might come back rich. Braver one might not come back.",
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
