// Explorable settlements (ADR 0006): hand-authored, walkable towns/villages the player roams
// and whose NPCs they talk to — not modal interludes. Pure data: no DOM, no controller imports.
//
// A settlement is a small ASCII layout the field controller decodes into tile kinds, a set of
// service-building POIs (inn/merchant/smith/revive/exit, room to grow), and NPCs (position +
// sprite + name + dialogue). The legend below maps each ASCII glyph to a town tile kind; the
// field renderer/`passable` understand those kinds. Buildings are walk-in: stepping onto the
// door tile fires the building's service (routed in Field.townTouch → Game.open*).

export type TownPOI = "inn" | "shop" | "smith" | "revive" | "stash" | "exit";

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
  "I": "t-inn", "M": "t-shop", "B": "t-smith", "R": "t-revive", "V": "t-stash", "E": "t-exit",
  "F": "t-fountain", "T": "t-tree", "W": "t-well", "H": "t-house",
  // marsh-outpost kinds (Miregard): plank boardwalk over bog, standing water, stilt-houses, dead trees, lantern posts
  "=": "town-plank", "~": "town-bog", "h": "t-stilt", "t": "t-deadtree", "L": "t-lantern",
  // city kinds (Riverhearth): grand avenue, river, bridge, dock, grand building, townhouse, market stall, statue
  "a": "town-avenue", "r": "town-river", "b": "town-bridge", "d": "town-dock",
  "G": "t-grand", "U": "t-townhouse", "S": "t-stall", "Y": "t-statue",
};

// Which POI a building tile triggers when walked onto.
export const POI_OF: Record<string, TownPOI> = {
  "t-inn": "inn", "t-shop": "shop", "t-smith": "smith", "t-revive": "revive", "t-stash": "stash", "t-exit": "exit",
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
    "#,,..B....V,,..R....,,,,#",
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
        "Go north into Greenvale when you're ready — the old Bandit Warren they've nested in will cut your teeth. Brave folk have gone in for the cleaning out of it; fewer come out. But it's a trial, no more — the prize there is only what the Kingpin hoards.",
        "Your road runs east, in the end — to Silverwood, the ancient wood beyond the fields. But the Sunless Gorge cuts the way, a wound no boot can cross. The one crossing is a raft, and no bandit holds it: it lies sunk to the SOUTH, in the drowned ruins under the Duskmarsh — the Drowned Vault. Raise it, and the east opens.",
      ] },
    { id: "guard", name: "Watchman Bram", spr: "💂", x: 11, y: 2,
      lines: [
        "Hold up. North gate? On your own head, then — Greenvale's no orchard stroll anymore.",
        "Slimes and kobolds in the long grass, that's the least of it. The bandits' Brigadier holds the choke into the warren, and he doesn't bluff.",
        "Sleep at the inn first. I've seen too many march out proud and come back on a board. Don't make me carry you.",
        "Don't waste a thought on the east road — the Sunless Gorge keeps it shut, and no boot crosses that wound. The open way runs SOUTH, down through the marsh. Not a kinder road, mind. Just the one that's there.",
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
  // spawn on the spine/cross-walk junction (a 4-way-open plank) so you can move freely on arrival —
  // NOT the dead-end stub at (11,13) where bog walls you in on two sides (down + right).
  spawn: { x: 11, y: 12 },
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
        "You're chasing the raft, then. Aye — it's down in the Drowned Vault, below the mire, where the old ruins sit under black water. It's the one way over the Sunless Gorge and on east to Silverwood. Raise it from the deep, and the crossing's yours. If the deep lets you.",
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

// ── Elderbough — the Silverwood forest hamlet ───────────────────────────────────────────────
// The front-door settlement of Silverwood (the Ancient Forest), reached after Riverhearth on the
// way into the wood (Dara's chosen name; see world-atlas G10/G17). NOT a farm village and NOT a
// grim outpost — a green HUSH: lodges grown up among roots older than any kingdom, moss on every
// sill, a canopy so thick noon comes down gentle. The four services are walk-in lodges around a
// central ELDER-OAK grove (a ring of great trees about a mossy well); the south gate ('E') opens
// onto the Silverwood overworld and the long path to the Sunless Grove. No `theme` → it renders in
// the default pastoral palette (the hedgerow/treeline palisade reads as the forest edge). The folk
// speak soft, for the wood has WOKEN — their lines hold woodfolk warmth over an old, climbing dread
// (the Hollow King in the Sunless Grove, the Elder Treant stirring). Layout authored + verified
// soft-lock-free (content.test.ts). Dialogue is on-brand forest voice — flagged for Dara / narrative-writer.
const ELDERBOUGH: Settlement = {
  id: "elderbough",
  name: "Elderbough",
  theme: "elderbough",
  intro:
    "Elderbough sits in a green hush — lodges grown up among roots older than any king's line, moss " +
    "on every sill, lantern-moths drifting at the eaves, the canopy so thick that noon comes down gold " +
    "and gentle. The folk here speak soft, for the wood listens. Rest in the warm, trade for the road, " +
    "mend at the grove-shrine — then take the south paths. Past the last lantern the trees close ranks, " +
    "the light fails, and the Sunless Grove keeps the Hollow King.",
  // 25 wide × 16 tall. Old-growth treeline rings it; 'E' is the SOUTH gate onto Silverwood. A central
  // ELDER-OAK grove ('T' ring + flower-fern beds '+' about a mossy well 'W') is routed around; sparse
  // tree pillars + flavor lodges ('H') dress the clearing. NPCs stand on grass beside a path so none
  // can sever the route (verified in content.test.ts).
  layout: [
    "#########################",
    "#,,T,,,,,,,,,,,,,,,,,T,,#",
    "#,H,..I..........M...,H,#",
    "#,T,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,+TTT+,,,,,,,,,#",
    "#,,,,,,,,,+,W,+,,,,,,,T,#",
    "#,,,,,,,,,+,,,+,,,,,,,,,#",
    "#,,,,,,,,,+TTT+,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,T,#",
    "#,T,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,..B..........R...,,,#",
    "#,,T,,,,,,,,.,,,,,,,,,,,#",
    "#,H,,,,,,,,,.,,,,,,,,,H,#",
    "#,,,,,,,,,,,,,,,,,,,,T,,#",
    "#,,,,,,,,,,,,,,,,,T,,,,,#",
    "###########EE############",
  ],
  // spawn just inside the south gate, on the central lane
  spawn: { x: 12, y: 14 },
  npcs: [
    { id: "warden", name: "Warden Eira", spr: "🏹", x: 9, y: 8,
      lines: [
        "Stranger on the deer-paths. Good — you walk soft, that's half of staying alive out here. Most don't, and the wood's stopped forgiving the rest.",
        "I've wardened Silverwood since I could draw a bow, and I'll tell you plain: it has WOKEN. Trees that stood quiet a thousand years move when your back's turned now. The thornlings bite, the direwolves run in daylight, and something old wears a crown in the dark of the Sunless Grove.",
        "South takes you toward it — and I see that you must go. Then keep to the marked paths and never follow a light off them. The gloom-wisps love a trusting soul; they lead you deep, and the deep keeps you.",
      ] },
    { id: "keeper", name: "Grove-keeper Wenna", spr: "🧙‍♀️", x: 8, y: 5,
      lines: [
        "Come, sit by the Elder-Oak. He's the oldest thing in Elderbough — older than the lodges, older than the warden's grandmother's grandmother. He still sleeps. Pray the rest of the wood remembers how.",
        "Lay your fallen at the grove-shrine, child. The green mends what steel cannot — root and sap and patience. It is the one old kindness the wood has not yet forgotten.",
        "You feel him too, don't you. The Hollow King. A guardian once, they say — the heart of the forest given a will — and now hollow where the heart should be, calling the wood to fill him. The Elder Treant already answers. Go careful, or you'll answer too.",
      ] },
    { id: "child", name: "Little Fenn", spr: "🧒", x: 16, y: 6,
      lines: [
        "Are you going INTO the deep wood? With a SWORD?! Nobody goes in the deep wood. The trees there WALK. Bran saw one. He cried.",
        "I'm not allowed past the last lantern. Mum says the wisps'll get me — the pretty lights, the ones that float and bob and want you to follow. I'd never. ...probably.",
        "If you see the big tree that walks — the REALLY big one — don't wake it up! Just let it sleep. Promise me?",
      ] },
    { id: "innkeep", name: "Innkeeper Hollis", spr: "🧑‍🍳", x: 6, y: 3,
      lines: [
        "Mind the low beam — these lodges were built round the trees, not the trees round them, and old oak doesn't bend for tall folk. The hearth's lit and the bed's soft; that's all I've got and it's yours.",
        "Sleep here while it's still safe to. Out under the deep canopy you don't sleep — you wait for a morning that comes grey and late, if it comes at all. Rest now, the proper way. The wood can keep till dawn.",
      ] },
    { id: "forager", name: "Forager Maren", spr: "🧺", x: 17, y: 3,
      lines: [
        "Roots, mushrooms, fern-tips — what the wood will still spare a careful hand. I bring it in and pass it on, and these days the road-gear too. The far gatherers don't come back, so their stock falls to me to sell. Cheap, then. Take it.",
        "I keep close to the lanterns now. I used to range clear to Deep Mossbed — sweetest bilberries in all Aurelion, down there. Now Mossbed's gone dark and the brambles have grown TEETH. Some berries you leave on the branch.",
      ] },
    { id: "cutter", name: "Old Hask the Woodcutter", spr: "🪓", x: 14, y: 12,
      lines: [
        "Forty years I felled timber in Silverwood, and never a tree begrudged me an honest axe. Now I keep the axe by the door and I do not raise it to the wood. Not since the day a trunk BLED — and the one beside it turned to watch.",
        "You're for the south paths. Then hear an old cutter: the barkhides were trees once, and they remember every blade ever laid to a Silverwood trunk. Carry your steel if you must — but if a 'tree' opens its eyes, you don't chop. You RUN.",
      ] },
  ],
};

// ── Wheatcross — the Goldmeadow farming-crossroads (Dara's chosen name) ──────────────────────
// The breadbasket's market town, doorstep to Goldmeadow Plains — and the war-front. The Reaping
// Warlord's host (Plains Raiders, Field Marauders, Iron Reavers) burns the fields and has taken the
// great mill (the occupied Windmill Undercroft). Hardy, defiant-weary farmfolk. Default pastoral
// palette. Layout verified soft-lock-free. Voice flagged for Dara / narrative-writer.
const WHEATCROSS: Settlement = {
  id: "wheatcross",
  name: "Wheatcross",
  theme: "wheatcross",
  intro:
    "Wheatcross stands where four cart-roads meet in a sea of gold — or it did, before the burning. " +
    "Half the ricks are ash now, the great mill flies a banner that isn't ours, and the harvest comes " +
    "in under guard. Still the market opens at dawn, because folk must eat and the bread won't bake " +
    "itself. Rest, lay in supplies, take steel from the smith — then west, into the standing wheat, " +
    "where the Reaping Warlord's host waits with the mill at their backs.",
  layout: [
    "###########################",
    "#,,,,,,,,,,,,,,,,,,,,,,,,,#",
    "#,T...........T.........,,#",
    "#,,I,,,,,,,,,.,,,,,,,,M,,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,H,,,,,,,,,.,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,F,,,,,,,,,,,,#",
    "#,,,,,,,,,,,FFF,,,,,,,,,,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,H,,,,,,,,,.,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,T,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,B,,,WW,,,,.,,,,,,,,R,,,#",
    "#,,....WW...............,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,,,#",
    "#############E#############",
  ],
  spawn: { x: 13, y: 14 },
  npcs: [
    { id: "reeve", name: "Reeve Haldor", spr: "🧑‍🌾", x: 13, y: 9,
      lines: [
        "You came up the east road and lived — that's news enough to make me hope. I'm reeve here; mine's the thankless task of keeping Wheatcross fed and standing while a warlord eats our fields one rick at a time.",
        "The Reaping Warlord, they call him, and he's earned it. His host took the great mill — our mill, that ground for six villages — and turned the Windmill Undercroft into a barracks. Every sack of grain we don't burn first, he takes.",
        "If you're the sort that goes west instead of running east, the gods love you and so do I. Cut the head off the host and the Plains Raiders scatter. Leave him, and there'll be no Wheatcross to come back to.",
      ] },
    { id: "guard", name: "Militiaman Cob", spr: "💂", x: 13, y: 3,
      lines: [
        "Halt — friend or forage? ...Friend. Good. We've learned to ask. The Field Marauders run faster than any honest man and hit twice as hard.",
        "I'm no soldier. I'm a ploughman with a billhook and a bad knee, same as every 'militiaman' on this gate. But it's our wheat, and somebody has to stand on the road. Might as well be us.",
      ] },
    { id: "thresher", name: "Goodwife Brenna", spr: "👩‍🌾", x: 9, y: 12,
      lines: [
        "Forty harvests I've threshed on this floor, and never once feared the reaping till this year. Now the Warlord's made the word a curse.",
        "Mind the Iron Reavers if you go west — slow as millstones and just as hard to stop, all that black armor. The Raiders you can outrun. A Reaver you have to break.",
      ] },
    { id: "miller", name: "Old Miller Tam", spr: "🧑‍🏭", x: 20, y: 12,
      lines: [
        "That's MY mill they're squatting in. Built by my grandfather's hand, every gear of it, and now it grinds nothing but mischief. I can hear the sails turning wrong from here. It hurts me like a tooth.",
        "If you get inside the Undercroft — and gods keep you if you try — there's a grain-hoist in the south cellar still rigged to my old workings. A body who knows the mill could come up behind them. Tell them Tam sent you. They won't understand, but I'll feel better.",
      ] },
    { id: "child", name: "Little Wren", spr: "🧒", x: 6, y: 8,
      lines: [
        "We used to make corn-dollies at harvest and dance round the big rick. This year Mum hid me in the root-cellar when the riders came. I didn't dance. I didn't even breathe.",
        "There's a HUGE golden pig out in the far wheat — the Gilded Sow, the big folk call her. Fat as a haywain and worth a king's purse, Da says, if you could ever catch her. Nobody can. She's faster than she looks.",
      ] },
    { id: "merch", name: "Trader Esma", spr: "🧺", x: 21, y: 4,
      lines: [
        "Buy while there's a market to buy in, traveler. Half my stock came off carts that'll never roll home — their owners didn't make the east road like you did. I sell it cheap and I don't tell their stories. Bad for trade, and worse for sleep.",
        "Gear yourself proper before the wheat. Out there it's open ground to the horizon — nowhere to hide, nothing at your back but more wheat. You'll want every edge a coin can buy.",
      ] },
  ],
};

// ── Wrackport — the Storm Coast harbor (Dara's chosen name) ─────────────────────────────────
// A storm-battered fishing harbor, doorstep to the Storm Coast — and a wreckers' nest. Coast
// Wreckers and Tide Cutthroats lure ships onto the rocks; the Wrecker-Captain holds the Smuggler's
// Sea-Cave. Weathered, superstitious sea-folk. Default pastoral palette; the 'W' blocks read as the
// grey water along the top. Layout verified soft-lock-free. Voice flagged for Dara / narrative-writer.
const WRACKPORT: Settlement = {
  id: "wrackport",
  name: "Wrackport",
  theme: "wrackport",
  intro:
    "Wrackport clings to the cliff-foot where the grey sea throws itself at the rocks and never tires. " +
    "Salt in the air, salt in the bread, fish-racks creaking in a wind that smells of weed and tar. " +
    "Honest folk fish these waters — and others lure ships onto the teeth for what washes up. Rest " +
    "while the harbor's friendly; trade; mend at the shrine. North along the storm-coast the wreckers " +
    "keep the Smuggler's Sea-Cave, and the Wrecker-Captain counts the drowned among his profits.",
  layout: [
    "###########################",
    "#,,,,T,,,,,WWWWW,,,,,T,,,,#",
    "#,,.........WWW.........,,#",
    "#,,,I,,,,,,,,.,,,,,,,,M,,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,H,,,,,,,,,.,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,T,,,,,,,,,F,,,,,,,,,T,,#",
    "#,,,,,,,,,,,FFF,,,,,,,,,,,#",
    "#,,H,,,,,,,,,.,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,.,,,,,,,,,,,,#",
    "#,,,B,,,,,,,,.,,,,,,,,R,,,#",
    "#,,.....................,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,,,#",
    "#############E#############",
  ],
  spawn: { x: 13, y: 13 },
  npcs: [
    { id: "harbormaster", name: "Harbormaster Sten", spr: "🧭", x: 10, y: 4,
      lines: [
        "Another soul off the cliff-road. Few enough use it now — the coast's gone bad, and word travels even where the road doesn't. I keep what's left of an honest harbor. It's a short tally these days.",
        "Up the shore there's lights some nights, swung on a pole where no lighthouse stands. That's a wrecker's lantern, friend. It says SAFE HARBOR and it means the rocks. Many a good crew steered for it and fed the Reef Crabs.",
        "You're for the north shore and the Sea-Cave, I can see it. Then go heavy and go at low tide — and trust no light you didn't light yourself.",
      ] },
    { id: "warden", name: "Coast-Watch Brann", spr: "🪖", x: 13, y: 6,
      lines: [
        "Coast-watch — what's left of it. We were six. The Tide Cutthroats took three off the north strand in one night; they move like the surf and cut just as cold.",
        "The Wrecker-Captain runs them all from the Sea-Cave — flies a black flag over a hoard of drowned men's gear. Break him and this coast might breathe again. Don't, and Wrackport's the next wreck on his tally.",
      ] },
    { id: "netwife", name: "Maready the Netwife", spr: "🐟", x: 17, y: 4,
      lines: [
        "Fresh off the morning boats — what few dare go out. Take a fish while there's fish to take; the Brine Serpents have got into the shallows and they don't care what's on the hook or who's holding it.",
        "You'll buy nothing fresher this side of the deep blue water, and you'll pay less for my fear than my fish. Now — herring or hake? Don't dither, the gulls are watching and so am I.",
      ] },
    { id: "child", name: "Little Cress", spr: "🧒", x: 7, y: 9,
      lines: [
        "I'm not scared of the sea. I'm not. ...I'm scared of what the sea spits back up. Da hauled a Reef Crab in his net once, big as a rowboat. We don't eat crab anymore.",
        "When the storm comes you can hear singing on the wind — that's the drowned, Gran says, calling for company. I plug my ears. You should too. Don't answer it.",
      ] },
    { id: "wreckwise", name: "Old Gull the Wreckwise", spr: "🧓", x: 19, y: 9,
      lines: [
        "Fifty years before the mast, lad, and I'll tell you the one true thing I learned: the sea doesn't hate you. It just doesn't notice you. It's the men ON it you want to watch.",
        "The Sea-Cave's an old smugglers' run — tide floods the low gallery twice a day, drowns it to the roof. Time it wrong and the cave does the Wrecker-Captain's killing for him. Time it RIGHT and you'll walk in dry behind his guard.",
      ] },
    { id: "innkeep", name: "Innkeeper Marsa", spr: "🧑‍🍳", x: 5, y: 4,
      lines: [
        "Come in out of that wind before it takes your ears off. Hot fish-stew, a dry bunk, and a fire that's never once gone out in forty winters — storm or no storm, the hearth holds.",
        "Sleep sound here. North of the harbor there's no sleeping — only listening, in the wet and the dark, for the next thing to come up out of the surf. Take your rest while the walls are between you and the water.",
      ] },
  ],
};

// ── Frosthold — the Frostpeak dwarven hold-gate (Dara's chosen name) ─────────────────────────
// A dwarven hold carved into the mountain's knee, doorstep to the Frostpeak Highlands. The deep
// stronghold has turned: the Dwarven Sentinels stand against their own makers, Ice Wolves and a Snow
// Troll prowl the passes, and the Glacier Guardian holds the under-halls. Gruff dwarven gravitas.
// Default palette ('H' lodges read as hewn stone; 'T' as stone pillars). Soft-lock-free. Voice flagged.
const FROSTHOLD: Settlement = {
  id: "frosthold",
  name: "Frosthold",
  theme: "frosthold",
  intro:
    "Frosthold is hewn straight into the mountain's grey knee — squat stone halls, iron-banded doors, " +
    "a forge-hearth that has not gone cold in nine hundred years breathing warmth into the everlasting " +
    "snow. The dwarves who hold the gate are few now, and grim. Warm yourself, take honest steel, mend " +
    "at the shrine — then up, into the white passes, where the deep stronghold has turned against its " +
    "own and the Glacier Guardian sits the under-throne in ice.",
  layout: [
    "#########################",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "#,T.....H.......H.....T,#",
    "#,,,I,,,,,,,.,,,,,,,M,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,H,,T,,,,,.,,,,,T,,H,,#",
    "#,,,,,,,,,,FFF,,,,,,,,,,#",
    "#,,,,,,,,,,FFF,,,,,,,,,,#",
    "#,,H,,T,,,,,.,,,,,T,,H,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,B,,,,,,,.,,,,,,,R,,,#",
    "#,,...................,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "############E############",
  ],
  spawn: { x: 12, y: 13 },
  npcs: [
    { id: "holdwarden", name: "Hold-Warden Durgan", spr: "⚒️", x: 12, y: 6,
      lines: [
        "Surface-walker. You've a long stride and no beard worth the name, but you stand straight in the cold, so I'll not turn you off my gate. I am Durgan, and this gate is mine to hold while one Durgan draws breath.",
        "Hear me plain, for I'll not say it twice: the deep hold has turned. The Dwarven Sentinels — stone guardians our own forefathers carved and woke to keep us — now stand against us. Something below has bent them. We named it the Glacier Guardian. We do not say the name often.",
        "Up the passes if you must, and the gods of the deep stone go with you. Mind the Mountain Reavers in the high snow, and mind worse below. Bring me the hold back, and Frosthold will not forget it while stone endures.",
      ] },
    { id: "smithdwarf", name: "Smith Brynja", spr: "🔨", x: 6, y: 12,
      lines: [
        "Stand clear of the sparks and state your need. Frosthold steel is folded cold-and-hot a hundred times — it'll not chip on a Sentinel's hide, which is more than I'll say for whatever tin you walked in wearing.",
        "Snow Troll on the high road, they tell me. Big as a cart and it knits its own wounds shut as fast as you open them. Hit it hard, hit it ONCE, and don't give it the breath to mend. My axes are made for exactly that argument.",
      ] },
    { id: "loremaster", name: "Loremaster Hagen", spr: "🧙", x: 8, y: 5,
      lines: [
        "Ah — a guest, and a curious one. Few come this high but the desperate. Sit, mind the rune-stones, and let an old dwarf talk; the young ones here have heard it all and believe none of it.",
        "The Sentinels were never mere statues, you understand. We carved them, and we WOKE them — bound a watchful will into the stone to guard the deep. Now that bond runs the wrong way, and the watchers wake against the watched. Whatever sits in the under-halls did not break the binding. It STOLE it.",
      ] },
    { id: "child", name: "Little Dorn", spr: "🧒", x: 16, y: 5,
      lines: [
        "Are you going DOWN? Past the sealed doors? Nobody goes past the sealed doors. The stone men are down there and they don't blink and they don't STOP.",
        "I found a crystal in the high snow once — all blue and burning-cold, prettiest thing ever. Grandda made me throw it back. Said the Crystal Stalker grows them, and what grows a jewel like that grows teeth to match. I still think about it.",
      ] },
    { id: "minehand", name: "Pickhand Vor", spr: "⛏️", x: 18, y: 11,
      lines: [
        "We don't dig deep anymore. We dig SHALLOW, and we dig listening. The day the picks woke something in the under-halls is the day Frosthold started dying by inches.",
        "The Ice Wolves come down the cut when the wind howls — quiet on the snow, a whole pack on you before you hear a paw. Travel the passes in daylight, and never alone. The mountain takes the lonely first.",
      ] },
    { id: "hearthkeep", name: "Hearth-Keeper Orla", spr: "🧑‍🍳", x: 6, y: 4,
      lines: [
        "In, in — shut the cold out behind you. The forge-hearth's burned nine hundred years and it'll burn through your bones tonight if you let it. Ale's hot, stew's hotter, and the bunks are cut from the living rock — you'll not feel the wind here.",
        "Rest deep while you can. Up in the white there's no true rest — only the cold that creeps in while you doze and doesn't creep out again. Sleep here, by the fire that does not die. The mountain can wait one more night for you.",
      ] },
  ],
};

// ── Lastlight — the Dawnfall Hold frontier garrison (Dara's chosen name) ─────────────────────
// The last manned waystation before the frontier, doorstep to Dawnfall Hold. The border watch has
// FALLEN — Broken Sentries and Fallen Sentries are the garrison's own dead turned, and the Fallen
// Watch-Commander leads them. Grim soldiers holding a thread, dreading the comrades they must fight.
// Default palette. Soft-lock-free. Voice flagged for Dara / narrative-writer.
const LASTLIGHT: Settlement = {
  id: "lastlight",
  name: "Lastlight",
  theme: "lastlight",
  intro:
    "Lastlight is the final fire on the frontier road — a stockade, a watch-bonfire that is never let " +
    "to die, and a garrison that grows smaller every dark. Beyond it the old border-hold stands open " +
    "and wrong. Warm yourself at the muster-fire, take what the quartermaster can spare, lay your fallen " +
    "at the shrine — then through the gate to Dawnfall Hold, where the watch turned in the night and now " +
    "the Fallen Watch-Commander musters the dead on the wall he once kept.",
  layout: [
    "#########################",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "#,,....TH.......HT....,,#",
    "#,,,I,,,,,,,.,,,,,,,M,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,H,,,,,,,,.,,,,,,,,H,,#",
    "#,,,,,,,,,,,F,,,,,,,,,,,#",
    "#,,W,,,,,,,FFF,,,,,,,W,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,H,,,,,,,,.,,,,,,,,H,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,B,,,,,,,.,,,,,,,R,,,#",
    "#,,....T.........T....,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "############E############",
  ],
  spawn: { x: 12, y: 13 },
  npcs: [
    { id: "commander", name: "Captain Roan", spr: "🎖️", x: 12, y: 6,
      lines: [
        "Stand in the firelight where I can see your eyes. ...Living. Good. We check, here. Not everything that walks up to Lastlight in the dark still owns its own soul.",
        "I command what's left of the frontier watch. And here's the thing breaking my men — you'll meet it soon enough: the enemy on that wall is US. Our own fallen. The Watch-Commander I served under for ten years leads them now, and he knows every word of our drill.",
        "Through the gate to Dawnfall, then. Put them down — and understand it IS putting them down, a mercy, not a murder. Whatever wears their faces up there, our brothers left it long ago. Say that to yourself when your arm hesitates. It will.",
      ] },
    { id: "sentry", name: "Sentry Pell", spr: "🛡️", x: 12, y: 3,
      lines: [
        "Eyes front and keep moving — I hold this gate and I do not chat. ...You're going IN, though. So I'll say one thing.",
        "If you see a Broken Sentry come at you off the wall, don't look at the face. Just don't. I looked, my first night. I knew him. I've not slept a whole night since.",
      ] },
    { id: "quartermaster", name: "Quartermaster Edda", spr: "📦", x: 6, y: 11,
      lines: [
        "Take what you need and take it cheap — I'm down to outfitting the dead's gear to the living, and there's a grim plenty of THAT. Better on your back than rusting on the wall, I tell myself. Most nights I believe it.",
        "Stock deep before the Hold. There's no resupply past the gate, no fallback, no friendly door. Once you're on that wall it's what you carried in or nothing. Carry in plenty.",
      ] },
    { id: "child", name: "Little Sparrow", spr: "🧒", x: 16, y: 11,
      lines: [
        "My brother's up on the wall. Mum says he's gone. But I heard a sentry say the watch is still up there, still walking the rounds. So he's not gone, is he? He's just... still on watch. Right?",
        "I keep the bonfire fed. That's MY job, the captain gave it me himself. As long as Lastlight burns, the dark stays out. So I never let it get low. Not ever. Not for anything.",
      ] },
    { id: "oldwatch", name: "Old Garrow", spr: "🧓", x: 8, y: 5,
      lines: [
        "Forty years I walked the Dawnfall wall, boy, and retired with all my fingers — rare enough out here to count as a miracle. Now I watch the young ones march up to fight the ghosts of men I trained. There's no retiring from THAT.",
        "Whatever fell on the Hold that night, it didn't kill the watch. Killing, they'd have understood. It UNMADE them — kept them standing, kept them dutiful, just emptied out whatever made them men. Be quick up there. Don't let it study you the way it studied them.",
      ] },
    { id: "healer", name: "Mender Lysa", spr: "⚕️", x: 17, y: 5,
      lines: [
        "Bring me your hurt and bring me your dead — I'll tend both, and lay your fallen at the shrine where the rot of that place can't follow them. It's the one promise I can still keep out here.",
        "The Fallen Sentries loose arrows from the towers, fast and cold and dead-eyed — they don't tire, don't flinch, don't miss for fear the way the living do. Keep cover between you and the walls. Dead men have all the patience in the world.",
      ] },
  ],
};

// ── Vesperhal — the Whisper Hills cloister (Dara's chosen name) ──────────────────────────────
// A hillside monastery, doorstep to the Whisper Hills (Aurelion, per Dara). The holy order has been
// corrupted: Corrupted Monks and Restless Wraiths walk the cloisters and the Corrupted Abbot leads
// the fallen rite. Hushed, devout survivors grieving their order's fall. Default palette (the central
// 'F'+'+' block reads as a shrine-garth). Soft-lock-free. Voice flagged for Dara / narrative-writer.
const VESPERHAL: Settlement = {
  id: "vesperhal",
  name: "Vesperhal",
  theme: "vesperhal",
  intro:
    "Vesperhal keeps its hush even now — a cloister of pale stone in the folded green hills, herb-garths " +
    "and a shrine-well at its heart, the evening bell still rung at vespers by the few who keep the true " +
    "rite. But the bell answers something in the deeper cloisters these days, and the answer is wrong. " +
    "Rest in the guest-cells, take what the order can give, mend at the shrine — then into the whispering " +
    "hills, where the Corrupted Abbot leads the fallen brothers in a prayer that should never be finished.",
  layout: [
    "#########################",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "#,T...................T,#",
    "#,,,I,,,,,,,.,,,,,,,M,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,H,,,,T,,,.,,,T,,,,H,,#",
    "#,,,,,,,,,,+++,,,,,,,,,,#",
    "#,,,,,,,,,,FFF,,,,,,,,,,#",
    "#,,,,,,,,,,+++,,,,,,,,,,#",
    "#,,H,,,,T,,,.,,,T,,,,H,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,,,,,,,,,.,,,,,,,,,,,#",
    "#,,,B,,,,,,,.,,,,,,,R,,,#",
    "#,T...................T,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,#",
    "############E############",
  ],
  spawn: { x: 12, y: 14 },
  npcs: [
    { id: "abbot", name: "Abbot Ferrun", spr: "📿", x: 12, y: 6,
      lines: [
        "Peace, traveler — what peace we can still offer. I am abbot of the few who hold the true rite, and a poor abbot, for I have lost most of my flock to a darkness I should have seen rising in my own house.",
        "It began in the deep cloisters, in a prayer we were forbidden to finish — and one of us, my own prior, chose to finish it. He is the Corrupted Abbot now, and the brothers who followed him are the Corrupted Monks you'll meet on the hill-paths. They are not possessed. They CHOSE. That is the grief of it.",
        "If you go up to end it — and mercy may be the only ending left — then end HIM. The rite holds them; break the one who leads it and the rest may yet find their rest. Go with what blessing a broken order can give. It is freely given.",
      ] },
    { id: "bellkeep", name: "Bell-Keeper Nona", spr: "🔔", x: 12, y: 3,
      lines: [
        "I ring the vesper bell at dusk, the same as I have these sixty years. The difference is what answers it now — a second bell, deeper in the hills, tolling back. I do not stop ringing. If I stop, theirs is the only voice left.",
        "When you hear two bells out of time with each other, traveler, you'll know you've crossed into their ground. Keep walking toward the wrong one. That's where it ends.",
      ] },
    { id: "scribe", name: "Brother Calix", spr: "✍️", x: 6, y: 12,
      lines: [
        "I copy what I can save before it's lost — the true psalms, the founding rolls, the names of the brothers as they WERE, not as they are now. Someone must remember them whole. Memory is its own small mercy.",
        "The Restless Wraiths in the upper cloister were brothers too, once — the ones who died refusing the prayer. They did not fall; they were OVERCOME. There's a difference, and I'll thank you to grant them the gentler ending. They earned it.",
      ] },
    { id: "child", name: "Little Pim", spr: "🧒", x: 16, y: 12,
      lines: [
        "I'm a novice. That means I sweep the cloister and learn my letters and I'm NOT allowed up the hill, not ever, not even a little bit. Brother Calix says the hill isn't the order's anymore. He says it sadly.",
        "Sometimes at night the second bell rings and all the candles bow the same way, like something walked past blowing on them. I hide under my cot and say the true prayer over and over. It still works. I think it still works.",
      ] },
    { id: "pilgrim", name: "Pilgrim Ades", spr: "🧎", x: 8, y: 5,
      lines: [
        "I walked three hundred miles to pray at Vesperhal's shrine, and arrived to find half the monastery praying to something else. The gods have a cruel sense of timing, or I've a cruel sense of direction. Perhaps both.",
        "Still — the true shrine stands, the true bell rings, and the abbot has not bent. That's more faith held under siege than I've seen in a soft lifetime of easy chapels. I'll stay. Someone should kneel where it still means something.",
      ] },
    { id: "herbalist", name: "Sister Wren", spr: "🌿", x: 17, y: 5,
      lines: [
        "The garth still gives — sage and self-heal, the bitter blue flower that draws fever out. The hills haven't poisoned the roots yet, gods be thanked. Lay your fallen at the shrine; between the green and the grace, we mend more than you'd credit.",
        "Mind the Corrupted Monks cast as well as strike — a hex off the lips of a man you'd have called brother last spring. The words are holy words, turned inside out. Don't listen for meaning in them. Just close the distance and make them stop.",
      ] },
  ],
};

// ── Sunpier — the Sunbridge port (Dara's chosen name) ────────────────────────────────────────
// The great port toward the Coral Archipelago, doorstep to Sunbridge — and the journey's last stand.
// Sea-Raiders and Siege Troopers besiege the harbor under the Siege Captain, and from the deep water
// the Risen Leviathan rises (the run-ender). A grand, defiant port under siege; end-of-journey weight.
// Default palette (the 'W' block is the bright sea; 'F' the harbor plaza). Soft-lock-free. Voice flagged.
const SUNPIER: Settlement = {
  id: "sunpier",
  name: "Sunpier",
  theme: "sunpier",
  intro:
    "Sunpier throws its great stone pier out over water so bright it hurts — the last harbor of Aurelion, " +
    "gateway to the coral isles, and for a thousand years the busiest, gladdest port under the sun. The " +
    "gladness is under siege now. Sea-Raiders hammer the sea-wall, the Siege Captain's host darkens the " +
    "quays, and something vast has woken in the deep beyond the reef. Rest, arm, steady yourself at the " +
    "shrine — then out to the wall and the water, where the Risen Leviathan ends journeys, and means to end this one.",
  layout: [
    "#############################",
    "#,,,,,T,,,WWWWWWWWW,,,T,,,,,#",
    "#,,.........WWWWW.........,,#",
    "#,,,I,,,,,,,,,.,,,,,,,,,M,,,#",
    "#,,,,,,,,,,,,,.,,,,,,,,,,,,,#",
    "#,,,,,,,,,,,,,.,,,,,,,,,,,,,#",
    "#,,H,,,,,,,,,,.,,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,,.,,,,,,,,,,,,,#",
    "#,,T,,,,,,,,,,F,,,,,,,,,,T,,#",
    "#,,,,,,,,,,,,FFF,,,,,,,,,,,,#",
    "#,,H,,,,,,,,,,.,,,,,,,,,,H,,#",
    "#,,,,,,,,,,,,,.,,,,,,,,,,,,,#",
    "#,,,,,,,,,,,,,.,,,,,,,,,,,,,#",
    "#,,,B,,,,H,,,,.,,,,H,,,,R,,,#",
    "#,,.......................,,#",
    "#,,,,,,,,,,,,,,,,,,,,,,,,,,,#",
    "##############E##############",
  ],
  spawn: { x: 14, y: 14 },
  npcs: [
    { id: "portmaster", name: "Portmaster Calla", spr: "🧭", x: 11, y: 4,
      lines: [
        "You've come the whole long road to reach my quays, haven't you — I can read a journey in a face, and yours has Greenvale mud and Frostpeak frost both still on it. Welcome to Sunpier. I only wish I'd a gladder harbor to welcome you to.",
        "A thousand years this port has stood, gateway to the coral isles, and never once shut its gates — until now. The Siege Captain's host has the landward wall, the Sea-Raiders have the water, and between them they mean to take the last free harbor of Aurelion.",
        "If your road ends here, let it end well. Hold the wall, break the siege — but know the worst of it isn't the Captain or his raiders. It's what they WOKE, out past the reef, calling it up out of the dark to finish what they started.",
      ] },
    { id: "crier", name: "Crier Bohl", spr: "📢", x: 14, y: 6,
      lines: [
        "HEAR ME, SUNPIER! The wall holds another dawn — the wall HOLDS! Bread at the plaza, water at the well, and every able hand to the sea-gate by the noon bell! We have stood a thousand years and we do not fall today!",
        "And word for the stranger off the long road: they're saying YOU'RE the one. The one who's broken every host between here and the far north, all the long way down the world to here. If half of it's true, then for the love of every god — get to that wall. We have been waiting for someone exactly like you.",
      ] },
    { id: "sailmaster", name: "Sailmaster Yorrin", spr: "⛵", x: 18, y: 4,
      lines: [
        "Every hull I had is hauled up the slips or sunk at her mooring — no one sails out of Sunpier while the Sea-Raiders own the water. Fast as falcons, those raiders, and they board before you've seen the sail. We learned that the hard and bloody way.",
        "Past the reef the water goes wrong — dark and heaving where it should run clear and bright. That's where the deep thing lies. The old charts named that trench and warned ships off it a thousand years ago. We forgot the warning. It did not forget us.",
      ] },
    { id: "child", name: "Little Dori", spr: "🧒", x: 8, y: 9,
      lines: [
        "I'm not allowed near the sea-wall. But I climbed the bell-tower and I SAW. The whole sea full of black sails. And past the reef the water stood up like a hill — a WHOLE HILL — and something under it. I didn't tell Mum. She's scared enough already.",
        "You came to help, didn't you? You have to have. Everyone keeps looking at the landward road like they're waiting for someone. I think they were waiting for you. Don't go yet — let me show you the tall ships first. ...while there's still ships to show.",
      ] },
    { id: "raidwise", name: "Old Tide-Reader Sef", spr: "🧓", x: 20, y: 9,
      lines: [
        "I've read this water seventy years, and I never thought to read THIS in it. The Risen Leviathan, the deep-singers are calling it — and 'risen' is the word that should frighten you. It was down there all along. The siege didn't bring it. The siege WOKE it.",
        "When it surfaces the whole harbor will know — the sea draws back off the flats first, sucks the water out past the low-tide line, and goes still and wrong. That's your one breath of warning. When Sunpier's bay empties, you get to high ground or you get to dying. There's no third road.",
      ] },
    { id: "innkeep", name: "Innkeeper Bressa", spr: "🧑‍🍳", x: 5, y: 4,
      lines: [
        "Sit, eat, sleep — orders of the house, and the house doesn't take no. You've the look of someone the whole town's pinning its hopes on, and hope fights poorly on an empty stomach and no sleep. I've fed defenders through three days of siege; I'll not have the best of them keel over from want of a hot meal.",
        "Rest deep tonight. Whatever the morning brings to that wall — and I think we both know what it's bringing — you'll meet it fed, warm, and rested, because that much at least is still in my power to give. The rest is in yours. No pressure, love — and all of it. Now eat, before I take it personal.",
      ] },
  ],
};

export const SETTLEMENTS: Record<string, Settlement> = {
  hearthford: HEARTHFORD,
  riverhearth: RIVERHEARTH,
  elderbough: ELDERBOUGH,
  miregard: MIREGARD,
  wheatcross: WHEATCROSS,
  wrackport: WRACKPORT,
  frosthold: FROSTHOLD,
  lastlight: LASTLIGHT,
  vesperhal: VESPERHAL,
  sunpier: SUNPIER,
};

/** Look up a settlement by id (falls back to Hearthford so the field never loads nothing). */
export function settlement(id: string): Settlement {
  return SETTLEMENTS[id] ?? HEARTHFORD;
}
