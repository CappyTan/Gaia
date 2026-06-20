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
   *   --- Riverhearth (city) kinds ---
   *   'a' grand avenue (walkable, paved spine)   'r' river (impassable water)   'b' bridge (walkable, spans the river)
   *   'd' dock/wharf plank (walkable, river-edge)   'G' grand building (impassable)   'U' townhouse (impassable)
   *   'S' market stall (impassable)   'Y' civic statue (impassable decoration)
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
  // city kinds (Riverhearth): grand avenue, river, bridge, dock, grand building, townhouse, market stall, statue
  "a": "town-avenue", "r": "town-river", "b": "town-bridge", "d": "town-dock",
  "G": "t-grand", "U": "t-townhouse", "S": "t-stall", "Y": "t-statue",
};

// Which POI a building tile triggers when walked onto.
export const POI_OF: Record<string, TownPOI> = {
  "t-inn": "inn", "t-shop": "shop", "t-smith": "smith", "t-revive": "revive", "t-exit": "exit",
};

// Town tiles the player cannot walk through.
export const TOWN_BLOCKERS = new Set([
  "twall", "t-fountain", "t-tree", "t-well", "t-house",
  "town-bog", "t-stilt", "t-deadtree", "t-lantern",
  // Riverhearth (city) blockers: the river, grand buildings, townhouses, market stalls, statues
  "town-river", "t-grand", "t-townhouse", "t-stall", "t-statue",
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

// ── Riverhearth — the Trade Capital (Aurelion #5) ───────────────────────────────────────────
// Gaia's first true CITY (ADR 0006 / aurelion-build-plan §1): the warm, civilized heart of the
// heartland and the grand hub the player reaches after the Greenvale Kingpin falls. Where Hearthford
// is a farm hamlet and Miregard a grim outpost, Riverhearth is BIG and DENSE — a 48×30 map the camera
// scrolls through, built around a RIVER that runs down its middle, crossed by two BRIDGES. Four
// districts read at a glance:
//   • DOCKS / RIVERFRONT (north-west): wharf planks ('d') along the river, dock warehouses ('G').
//   • CIVIC / KEEP (north-east): the grand halls ('G') and a civic statue ('Y') — the seat of power.
//   • MARKET SQUARE (south-west): a grid of stalls ('S'), a fountain and a well — the trade heart.
//   • RESIDENTIAL QUARTER (south-east): rows of townhouses ('U') — where the city sleeps.
// Grand AVENUES ('a') form the city's paved spine grid; the four services (inn/market/smith/shrine)
// sit one per quarter, all on an avenue. The exit gate is on the north wall (the road on to Miregard
// and the Duskmarsh). `theme: "city"` lets it take its own grand, bustling music later (audio-composer).
// ~10 NPCs give it a lived-in capital bustle — a town crier, dockworker, guildmaster, guard captain,
// children, ferryman, noble, busker, fishwife. Dialogue is placeholder (warm-but-bustling capital
// voice) for narrative-writer to polish. Layout authored + verified soft-lock-free (content.test.ts).
const RIVERHEARTH: Settlement = {
  id: "riverhearth",
  name: "Riverhearth",
  theme: "city",
  intro:
    "Riverhearth opens around you like a held breath let go — bridges arched over the broad bright " +
    "river, barges crowding the wharves, a market roaring under a hundred awnings, and the bells of " +
    "the civic hall counting out the hour. After the long road from Greenvale, this is the heart of " +
    "the heartland: rest, trade, hear the talk of the wider world — then take the north road on.",
  // 48 wide × 30 tall (the camera scrolls). River ('r') runs down the centre, crossed by two bridges
  // ('b'). Avenues ('a') grid the city; services sit one per district; NPCs stand beside the avenues
  // and wharves (never on a route tile), so none can ever sever the way. Verified in content.test.ts.
  layout: [
    "###########E####################################",
    "#,,,,,,,,,,a,,,,,,,,,,,rr,,,,,,,,,,,,,,,,,,,,,,#",
    "#,T.GGG....a..........drrd.......GGG..GGG....T,#",
    "#,..GGG.GG.a.........ddrrdd......GGG..GGG.....,#",
    "#,..GGG.GG.a..........drrd.......GGG..GGG.....,#",
    "#,aaaaaaaaaaaaaaaaaaaadrrdaaaaaaaaaaaaaaaaaaaa,#",
    "#,.........a.........ddrrdd...a...............,#",
    "#,.........a..........drrd....a.....Y.........,#",
    "#,..I....M.a..........drrd....a...R...........,#",
    "#,aaaaaaaaaaaaaaaaaaaaarraaaaaaaaaaaaaaaaaaaaa,#",
    "#,.........a......a....rr.....a...............,#",
    "#,..SSS.SS.a......a....rr.....a..UU..UU..UU...,#",
    "#,..SSS.SS.a......a...bbbb....a..UU..UU..UU...,#",
    "#,T........a......a....rr.....a..............T,#",
    "#,..SS.SSS.a......a....rr.....a..UU..UU..UU...,#",
    "#,..SS.SSS.a......a....rr.....a..UU..UU..UU...,#",
    "#,aaaaaaaaaaaaaaaaaaaabbbbaaaaaaaaaaaaaaaaaaaa,#",
    "#,.........a......a....rr.....a...B...........,#",
    "#,....F....a......a....rr.....a...............,#",
    "#,.........a......a....rr.....a..UU..UU..UU...,#",
    "#,...W.....a......a....rr.....a..UU..UU..UU...,#",
    "#,.........a......a....rr.....a...............,#",
    "#,.........a......a....rr.....a..UU..UU..UU...,#",
    "#,.........a......a....rr.....a..UU..UU..UU...,#",
    "#,.........a......a....rr.....a...............,#",
    "#,aaaaaaaaaaaaaaaaaaaaarraaaaaaaaaaaaaaaaaaaaa,#",
    "#,.....................rr.....................,#",
    "#,T....................rr....................T,#",
    "#,,,,,,,,,,,,,,,,,,,,,,rr,,,,,,,,,,,,,,,,,,,,,,#",
    "################################################",
  ],
  // spawn just inside the north gate, on the west-spine avenue
  spawn: { x: 11, y: 1 },
  npcs: [
    { id: "crier", name: "Town Crier Edda", spr: "📢", x: 13, y: 9,
      lines: [
        "HEAR YE! By order of the Riverhall — fair trade, full purses, and a fine sky over Riverhearth this day!",
        "Word off the south road: the Kingpin's warren is BROKEN, his bandits scattered to the four winds! Greenvale breathes easy again — and they say the heroes who did it walk our streets!",
        "Spend a coin, hear the bells, see the bridges by lamplight. But if you're bound north — the marsh-folk at Miregard could use a stout sword. Grim doings out past the fog.",
      ] },
    { id: "dock", name: "Dockhand Garrow", spr: "🧑‍🏭", x: 21, y: 5,
      lines: [
        "Mind the ropes, friend — barge in, barge out, dawn to dusk. Half of Aurelion's grain comes up this river and goes out through these hands.",
        "See those crates? Silverwood timber, Storm Coast salt, Frostpeak iron — the whole continent passes over Riverhearth's wharves. Busiest water you'll ever stand beside.",
        "You want to cross? Take a bridge, not the river. Current'll have your boots before you've said your prayers.",
      ] },
    { id: "guild", name: "Guildmaster Veska", spr: "🧑‍💼", x: 8, y: 9,
      lines: [
        "Welcome to the Merchant Quarter — the beating purse of the heartland. If it's bought or sold in Aurelion, the price is set HERE first.",
        "You've the look of coin to spend and gear to upgrade. The market's that way, the smith yonder. Buy well before the north road; Miregard's stalls are bare bones and worse.",
        "A word to the wise: gold's good, but a hero's NAME travels faster than any barge. Make ours, and the Guild remembers its friends.",
      ] },
    { id: "capt", name: "Captain Aldric", spr: "🛡️", x: 36, y: 9,
      lines: [
        "Captain of the Riverhall Watch. You're the band that cracked the warren? Then you've earned a nod from me, and I don't give those cheap.",
        "Riverhearth's safe within these walls — bridges watched, gates manned, no bandit dares the avenues. Out THERE is a different country.",
        "If you're for the Duskmarsh, go through Miregard and heed their warden. The marsh has been swallowing patrols. Even the Watch doesn't ride that road after dark.",
      ] },
    { id: "child1", name: "Tam", spr: "🧒", x: 6, y: 17,
      lines: [
        "Race you to the big bridge! Last one there's a river-rat! ...oh. You're not playing, are you.",
        "My da works the wharves. He says one day I'll captain a barge all the way to the SEA. Have you SEEN the sea? Is it true it's bigger than the whole market square?",
      ] },
    { id: "child2", name: "Nessa", spr: "🧒", x: 8, y: 17,
      lines: [
        "Did you really fight the Kingpin? Was he as big as a HOUSE? Tam says bandits eat children but I don't believe him.",
        "The fountain ate my copper. Mum says you make a wish and the river-spirit keeps it safe. I wished to see a real hero. ...Hey. HEY. Did it work?!",
      ] },
    { id: "ferry", name: "Ferryman Old Pell", spr: "🧓", x: 21, y: 13,
      lines: [
        "Bridges took most of my trade, but there's still folk'd rather ride than climb. I've poled this river fifty years, lad. Know every stone under it.",
        "She's gentle here in the city. North of the walls she turns mean, and by the time she reaches the Duskmarsh she's black as pitch and twice as patient. Rivers remember where they're going.",
      ] },
    { id: "noble", name: "Lady Corvin", spr: "👸", x: 39, y: 13,
      lines: [
        "How quaint — adventurers, in from the mud. Do try not to track it onto the avenues, there's a dear.",
        "One does NOT simply buy a townhouse in the High Quarter. One is invited. Crack a few more warrens, hero, and perhaps the Riverhall will invite YOU. Stranger things have climbed.",
      ] },
    { id: "bard", name: "Joss the Busker", spr: "🎻", x: 6, y: 13,
      lines: [
        "♪ — and the bandits all fled when the heroes came down, to the bells, to the bells of fair Riverhearth town! ♪ ...Like it? Wrote it this morning. About YOU, if you toss a coin.",
        "Every hero needs a song, and every song starts in a market square. Go north, do something worth singing, and come back — I'll have a whole ballad waiting.",
      ] },
    { id: "fishwife", name: "Marda the Fishwife", spr: "🐟", x: 26, y: 5,
      lines: [
        "Fresh off the morning catch! River-trout, eel, silverfin — you'll not taste better this side of the Storm Coast!",
        "You're bound north, I can smell the road on you. Then take a tip from one who's gutted ten thousand fish: whatever the marsh-folk tell you about the Duskmarsh, believe the WORST of it. Now — eel or trout?",
      ] },
  ],
};

export const SETTLEMENTS: Record<string, Settlement> = {
  hearthford: HEARTHFORD,
  riverhearth: RIVERHEARTH,
  miregard: MIREGARD,
};

/** Look up a settlement by id (falls back to Hearthford so the field never loads nothing). */
export function settlement(id: string): Settlement {
  return SETTLEMENTS[id] ?? HEARTHFORD;
}
