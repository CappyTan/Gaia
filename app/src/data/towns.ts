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
    "Riverhearth hits you all at once — two great bridges arched over the broad bright river, barges " +
    "shouldering for the wharves, a thousand awnings and a thousand bargains roaring under them, and " +
    "over it all the Riverhall bells tolling the hour to a city that never quite holds still. After " +
    "the long quiet road from Greenvale, this is the heartland's beating heart: rest at the inn, kit " +
    "out at the market, and hear what the wide world's saying — then take the north gate on.",
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
        "HEAR YE, HEAR YE! By grace of the Riverhall — fair scales, full purses, and the bridges open from bell to bell! Mind your coin-pouch in the crush!",
        "FRESH OFF THE SOUTH ROAD! The Kingpin's warren lies BROKEN, his bandits scattered like chaff on the wind! Greenvale sleeps sound again — and word is the very heroes who did it walk OUR cobbles this hour!",
        "Bide a while — drink, bargain, see the lamps come up gold on the water. But heed this, north-bound stranger: past the fog at Miregard the marsh has turned hungry. They'd pay dear for a stout sword. You did not hear it from ME.",
      ] },
    { id: "dock", name: "Dockhand Garrow", spr: "🧑‍🏭", x: 21, y: 5,
      lines: [
        "Mind the ropes, friend, and mind your toes — barge in, barge out, dawn to black dark. These two hands have hauled half of Aurelion across this wharf and the day's not done.",
        "Have a look at that cargo. Silverwood timber, Storm Coast salt, Frostpeak iron, grain off the Goldmeadow — the whole heartland floats through Riverhearth sooner or later. Busiest water you'll ever stand beside, and the smell to prove it.",
        "Crossing over? Take a bridge, not a shortcut. This river's friendly enough where the city minds her — but she runs north too, and folk who trust her past the walls wash up at Miregard. If they wash up at all.",
      ] },
    { id: "guild", name: "Guildmaster Veska", spr: "🧑‍💼", x: 8, y: 9,
      lines: [
        "Welcome, welcome — to the Merchant Quarter, the purse the whole heartland answers to. If a thing is bought or sold anywhere in Aurelion, rest assured its price was settled HERE first, over wine, by people far less charming than myself.",
        "And you have the look of coin to spend and steel to better. The market's down the avenue, the smith just yonder — outfit yourself well while you can. North of here the stalls thin to nothing, and at Miregard a 'shop' is one stranded soul selling out of a cart.",
        "A word, free of charge: gold is good, but a name travels faster than any barge — and outlasts it. Make yours grand, and the Guild always remembers a friend. We are far, far less fond of remembering the other sort.",
      ] },
    { id: "capt", name: "Captain Aldric", spr: "🛡️", x: 36, y: 9,
      lines: [
        "Captain of the Riverhall Watch. So — you're the lot that cracked the warren. Then have a nod from me, and know I don't hand those out cheap. Most days I hand out orders and the odd arrest.",
        "Within these walls the peace holds: bridges watched, gates manned, no bandit fool enough to draw steel on my avenues. Enjoy it while you stand on it. Past the gate is a different country, and it does not keep the Watch's hours.",
        "Bound for the Duskmarsh? Then go by Miregard and mind their warden — he's grim, but he's right. The marsh has been eating patrols whole. I'll ride a bandit down to the river's edge and no further. Some roads even the Watch leaves to the brave or the foolish.",
      ] },
    { id: "child1", name: "Tam", spr: "🧒", x: 6, y: 17,
      lines: [
        "Race you to the big bridge! Loser's a river-rat! ...oh. Grown-ups never play. You've got a SWORD though, so I'll let you off.",
        "My da works the wharves. He says one day I'll captain my own barge all the way down to the SEA! Have you SEEN the sea? Tam says it's so big you can't see the other market square on the far side. ...There IS a far side, isn't there?",
      ] },
    { id: "child2", name: "Nessa", spr: "🧒", x: 8, y: 17,
      lines: [
        "Did you REALLY fight the Kingpin? Was he tall as a house? Tam says bandits eat children but Tam's a liar, so. ...He doesn't, does he?",
        "I dropped my last copper in the fountain. Mum says you make a wish and the river keeps it safe forever and ever. I wished to meet a real hero. ...Wait. WAIT. It WORKED?! Best wish EVER!",
      ] },
    { id: "ferry", name: "Ferryman Old Pell", spr: "🧓", x: 21, y: 13,
      lines: [
        "Them bridges took most of my trade, aye — but there's always one or two too proud to climb the steps, bless 'em. Fifty years I've poled this water, lad. I know every stone under her by the feel of my pole.",
        "Gentle, ain't she, here where the city keeps her? Don't you trust it. North of the walls she sours, and by the time she's crawling into the Duskmarsh she's black as pitch and twice as patient. A river never forgets where it's bound. Mind you don't go the same way.",
      ] },
    { id: "noble", name: "Lady Corvin", spr: "👸", x: 39, y: 13,
      lines: [
        "Oh — how quaint. Adventurers. In from the mud, by the smell of it. Do try not to drag the wilds onto MY avenue, there's a dear. The cobbles were swept at dawn.",
        "One does not simply BUY into the High Quarter, you understand. One is invited. Topple a few more warlords, win a few more whispers at the right tables, and who knows — perhaps the Riverhall opens its doors to you. Stranger creatures have climbed. ...You'd want a bath first, naturally.",
      ] },
    { id: "bard", name: "Joss the Busker", spr: "🎻", x: 6, y: 13,
      lines: [
        "♪ — and the bandits all FLED when the heroes came down, to the bells, to the bells, of fair Riverhearth town! ♪ ...Eh? Eh?? Wrote it this very morning. It's about YOU — or it could be, for the price of a copper. Two, and I'll leave out the bit where you trip in the mud.",
        "Every hero wants a song, and every great song starts its life in a market square. So go on — go north, do something worth a verse or three, and come back this way. I'll have the ballad half-written before you've crossed the bridge.",
      ] },
    { id: "fishwife", name: "Marda the Fishwife", spr: "🐟", x: 26, y: 5,
      lines: [
        "FRESH off the dawn catch — river-trout, fat eel, silverfin still arguing about it! You'll not put better between your teeth this side of the Storm Coast, and I'll fight the soul who says otherwise.",
        "North-bound, are you? Don't bother lying, love, I can smell the road on you over my own stall. Then here's wisdom from a woman who's gutted ten thousand fish and a few worse things: whatever Miregard tells you of the Duskmarsh, believe the WORST of it, and pack double. Now — eel or trout? I haven't got all morning and neither, by the look of you, have you.",
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
