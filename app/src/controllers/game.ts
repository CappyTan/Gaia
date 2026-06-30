// Run lifecycle + run-state container + merchant. The orchestration layer: holds the live
// run (party/gold/inventory/flags) and drives transitions between systems, field, and battle.
// Cross-controller calls that appear only in inline HTML handlers (UI.*, Game.*) resolve via
// the window bridge set up in main.ts, so they aren't imported here (keeps the cycle small).

import type { Item, Member, MemberDef } from "../types";
import { ri, pick } from "../core/rng";
import { PARTY_DEFS } from "../data/party";
import { ZONES, type Zone } from "../data/zones";
import { settlement } from "../data/towns";
import { makeMember, recalc } from "../systems/progression";
import { makeItem, rollItemAtLevel, itemScore } from "../systems/loot";
import { zeroResources } from "../systems/resources";
import { emptyItems, grantItem, capsFromItems, type OwnedItems } from "../systems/inventory";
import { HELD_ITEMS, type HeldItemDef } from "../data/heldItems";
import { MERCHANT_LEVEL, DROP_MODS } from "../data/loot";
import { Save } from "../systems/save";
import { reviveProgress } from "../systems/progress";
import { GAME_VERSION } from "../data/version";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Screens } from "./screens";
import { Field } from "./field";
import { Telemetry } from "../telemetry/telemetry";

export function priceOf(it: Item): number {
  const base = [30, 70, 150, 320, 650, 1300][it.rIx] || 30;
  return Math.round(base + itemScore(it) * 2);
}
// The merchant buys loot back at a fraction of its asking price (standard RPG sell margin).
export function sellPriceOf(it: Item): number {
  return Math.max(5, Math.round(priceOf(it) * 0.4));
}
// The ordered settlements walked through on the way INTO a zone (ADR 0006 hub chain). Prefer the
// explicit `hubs` chain; fall back to the single `hub`, then Hearthford — so a zone always has one.
export function hubsFor(z: Zone): string[] {
  if (z.hubs && z.hubs.length) return z.hubs;
  return [z.hub ?? "hearthford"];
}

export const Game = {
  state: "title",
  gold: 0,
  // The five party-shared per-Attunement Resource pools (ADR 0019). Run-state: carries across fights
  // (aged by personality at fight start); reset on a fresh run. (Save-persistence is a follow-up.)
  resources: zeroResources(),
  party: [] as Member[],
  inventory: [] as Item[],
  // HELD ITEMS (party-menu "Items" tab) — quest/key items (held forever, never consumed) + later
  // consumables, by id. Distinct from `inventory` (equippable loot). A key item with a `grantsCap`
  // confers that traversal capability — owning the raft is what opens the Sunless Gorge.
  heldItems: emptyItems() as OwnedItems,
  steps: 0,
  encountersWon: 0,
  bossDefeated: false,
  miniBossDefeated: false,
  continueAfterBattle: null as (() => void) | null,
  // ── TEST LOOP (ADR 0017) ── the dev harness BORROWS this live run-state behind `testMode`. While set:
  // saveNow() early-returns (a test session never touches the player's save slot), a wipe returns to the
  // loop menu instead of gameOver→title, and a victory routes to the loop menu instead of the field.
  // `testReturn` is the loop-menu closure the harness installs; the three seams below call it. Keep the
  // testMode branches confined to these seams (saveNow/gameOver/victory route) — do not let them spread.
  testMode: false,
  testReturn: null as (() => void) | null,
  _inMerchant: false,
  _inTown: false,
  _revisitTown: false, // entered a hub via the overworld marker → leaving returns to the overworld
  // The starting village (Hearthford) drops you into the CURRENT zone on exit; the between-zone
  // hub advances to the NEXT zone. This flag distinguishes the two so the gate routes correctly.
  _startVillage: false,
  // HUB CHAIN (ADR 0006): the ordered settlements being walked through on the way into the next zone
  // (e.g. ["riverhearth","miregard"] before the Duskmarsh). Leaving advances the index; only when the
  // chain is exhausted does the next zone load. Empty/index past the end = no chain in progress.
  _hubChain: [] as string[],
  _hubIx: 0,
  _stock: [] as Item[],
  _lastDefs: null as MemberDef[] | null,
  // Persistent Vault/stash — survives between runs (localStorage), loaded lazily on first open.
  stash: [] as Item[],
  _stashLoaded: false,

  // Restart with the most recently chosen party (or the default) — used by retry/play-again.
  start(): void { this.startRun(this._lastDefs ?? PARTY_DEFS); },

  // Begin a fresh run with a specific party composition (from the Roster picker or default).
  startRun(defs: MemberDef[]): void {
    this._lastDefs = defs;
    this.gold = 0; this.resources = zeroResources(); this.inventory = []; this.heldItems = emptyItems(); this.steps = 0; this.encountersWon = 0;
    this.bossDefeated = false; this.miniBossDefeated = false; this.continueAfterBattle = null; this._inMerchant = false; this._inTown = false; this._startVillage = false;
    this.testMode = false; this.testReturn = null; // a real run is NEVER in test mode (ADR 0017) — enforce the invariant at the one entry point
    this._hubChain = []; this._hubIx = 0;
    Telemetry.load(); Telemetry.startSession();
    this.party = defs.map((d) => makeMember(d));
    // starting gear: a common weapon each, IN THE HERO'S CHOSEN ATTUNEMENT — otherwise the
    // weapon (which sets the class) would default to SOL and silently re-class the whole party.
    this.party.forEach((m) => { m.equip.weapon = makeItem(m.cls, "weapon", 0, m.cls, 0, m.att); });
    recalc(this.party);
    Field.init();          // ready zone 0 behind the village (canvas, tiles, map, encounter state)
    this.openStartVillage(); // ...but begin the run walking around the starting village
  },
  // Open the Greenvale starting village (Hearthford). Walking out its gate enters zone 0.
  openStartVillage(): void {
    this._startVillage = true;
    // The starting zone's hub chain is its opening village (usually just Hearthford).
    this._hubChain = hubsFor(ZONES[0]); this._hubIx = 0;
    this.openTown(this._hubChain[0] ?? "hearthford"); // the starting zone's own front-door village
  },

  // Pick up a held item (quest/key item) by registry id. Idempotent — a key item is held once. When the
  // item confers a traversal capability (the raft → "gorge"), grant it so owning the item drives the
  // unlock. Returns the def the FIRST time it's acquired (for a pickup notice), or null if already held
  // / unknown. The acquired set is reconciled with owned caps on save-load too (continueRun).
  acquireItem(id: string): HeldItemDef | null {
    const def = HELD_ITEMS[id];
    if (!def || this.heldItems.has(id)) { if (def) this.applyItemCaps(); return null; }
    grantItem(this.heldItems, id);
    this.applyItemCaps();
    return def;
  },
  // Grant into the run's traversal caps every capability conferred by the currently-held key items
  // (idempotent). The single place the item→cap link is realized — called on pickup and on resume.
  applyItemCaps(): void { for (const cap of capsFromItems(this.heldItems)) Field.grantTraversalCap(cap); },

  // ── SAVE & RESUME (ADR 0007) ───────────────────────────────────────────────────────────────
  // Autosave the live run to the single localStorage slot. Called on meaningful transitions
  // (battle resolved, enter/leave town, zone change, equip change). Cheap + silent; the pure
  // serialize/validate lives in systems/save.ts. Never saves the title screen / a dead run.
  saveNow(): void {
    if (this.testMode) return; // Test Loop (ADR 0017): never touch the player's save slot during a dev session
    if (this.state === "title" || !this.party.length) return;
    // wx/wy is the seamless-world tile — meaningful while roaming the continent AND while standing in a
    // big-map TOWN (there it's the overworld RETURN point you stepped in from; genTown leaves it intact).
    // Persist it in both so leaving the town after a reload returns you there, not to a zone spawn. A
    // dungeon leaves it 0 (px/py is truth in the dungeon).
    const owReturn = Field.bigMap && !Field.enteredDungeon;
    Save.save({
      gold: this.gold, steps: this.steps, encountersWon: this.encountersWon,
      bossDefeated: this.bossDefeated, miniBossDefeated: this.miniBossDefeated,
      party: this.party, inventory: this.inventory, defs: this._lastDefs,
      inTown: this._inTown, startVillage: this._startVillage, revisitTown: this._revisitTown,
      hubChain: this._hubChain, hubIx: this._hubIx,
      zoneIndex: Field.zoneIndex,
      townId: this._inTown ? (Field.town?.id ?? this._hubChain[this._hubIx] ?? null) : null,
      px: Field.px, py: Field.py,
      // WORLD COORDS (Stage 2C): persist the seamless big-map position when roaming the continent OR in a
      // big-map town (the overworld return tile). A dungeon/discrete save leaves these at 0 (px/py truth).
      wx: owReturn ? Field.wx : 0, wy: owReturn ? Field.wy : 0,
      bigMap: Field.bigMapActive(),
      enteredDungeon: Field.enteredDungeon,
      // CLEARED POIs (the inhabited world) — so a used shrine / raided camp stays spent across a reload.
      poisCleared: Field.poisCleared,
      // OPENED CHESTS — so a looted chest stays empty (carved as path) across a reload (no infinite-loot exploit).
      openedChests: Field.openedChests,
      // MULTI-FLOOR DUNGEON — the floor we're on (0 = B1 / single-floor), so a deep-Warren save resumes there.
      dungeonFloor: Field.dungeonFloor,
      dungeonMiniCleared: Field.dungeonMiniCleared,
      // PER-ZONE OVERWORLD MOUTH-CLEARED (Silverwood Overhaul fix) — which zones' dungeon-mouth guard is
      // beaten, by zone id; persisted so the right zones' mouths stay open across a reload (not a global).
      mouthCleared: Field.mouthCleared,
      // OWNED TRAVERSAL CAPS (Silverwood Overhaul, D2) — the run's macro-traversal unlocks (e.g. "gorge"),
      // as a plain string[] for JSON; restored into Field.ownedCaps (a Set) on resume.
      ownedCaps: [...Field.ownedCaps],
      // HELD ITEMS (quest/key items) — persisted as a plain string[] of ids; restored into the run's Set
      // and reconciled with owned caps on resume (continueRun).
      heldItems: [...this.heldItems],
      // WAYFINDING PROGRESS (ADR 0011) — the run's known/entered regions as two string[]s; restored into
      // Field.progress (Sets) on resume so the continent overview map re-reveals the right regions.
      progress: { known: [...Field.wayfinding.known], entered: [...Field.wayfinding.entered] },
      // RESOURCE POOLS (ADR 0019) — the five shared per-Attunement pools, persisted so they carry across a
      // reload like they carry across fights down a dungeon.
      resources: this.resources,
    }, GAME_VERSION);
  },
  // Resume the saved run from the title screen. Loads + validates + rebuilds the party, restores
  // run state, then drops the player back on the field / in town (NEVER mid-battle, ADR 0007 §5).
  // If the save can't be salvaged, falls back to a fresh roster with a notice.
  continueRun(): void {
    const r = Save.load();
    if (!r) {
      Save.clear();
      Overlay.show(`<h2 class="title-gold">No run to resume</h2>
        <p class="small">Your saved run couldn't be loaded — starting fresh.</p>
        <div class="row"><button class="btn gold" onclick="Overlay.hide();Roster.open()">Build a party</button>
          <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
      return;
    }
    // install run state
    this._lastDefs = r.defs;
    this.gold = r.gold; this.resources = r.resources; this.steps = r.steps; this.encountersWon = r.encountersWon;
    this.bossDefeated = r.bossDefeated; this.miniBossDefeated = r.miniBossDefeated;
    this.party = r.party; this.inventory = r.inventory;
    // HELD ITEMS (quest/key items): restore the set, then BACK-COMPAT seed — an old save that owns a cap
    // but predates the inventory gets the key item that confers it (so the raft shows in the Items tab for
    // a Greenvale-beaten save). applyItemCaps below re-grants caps from items (the item→cap link on load).
    this.heldItems = new Set(r.heldItems);
    for (const [id, def] of Object.entries(HELD_ITEMS))
      if (def.grantsCap && r.ownedCaps.includes(def.grantsCap)) this.heldItems.add(id);
    this.continueAfterBattle = null; this._inMerchant = false;
    this._inTown = r.inTown; this._startVillage = r.startVillage; this._revisitTown = !!r.revisitTown;
    this._hubChain = r.hubChain; this._hubIx = r.hubIx;
    recalc(this.party); // refold gear/MNA (hp/mp/alive already restored, _init guards the refill)
    Telemetry.load(); Telemetry.startSession();
    // build the field for the saved zone, then place the player.
    Field.init();                      // canvas + tiles + zone 0 baseline (resets poisCleared)
    // Restore cleared-POI state AFTER init() (which zeroes it) but BEFORE the genMap below rebuilds the
    // grid — stampPois + the big-map authored-grid re-apply consult it, so a spent shrine / raided camp
    // stays cleared across the reload (no infinite-heal exploit).
    Field.poisCleared = { ...r.poisCleared };
    // Restore opened-chest state on the same footing as poisCleared (AFTER init() zeroes it, BEFORE the
    // grid rebuild below) — genOverworld/genDungeon + the big-map authored-grid re-apply consult it, so a
    // looted chest stays opened (carved as path) across the reload (no infinite-loot exploit).
    Field.openedChests = { ...r.openedChests };
    // Restore owned traversal caps (Silverwood Overhaul, D2) BEFORE the grid rebuild below — bigPassable +
    // the chunk realizer consult Field.ownedCaps, so the gorge re-opens (or stays locked) correctly on
    // resume. An old save that beat Greenvale already had "gorge" granted in deserialize (no soft-lock).
    Field.ownedCaps = new Set(r.ownedCaps);
    // Restore WAYFINDING PROGRESS (ADR 0011) — the known/entered regions that drive the continent overview
    // reveal. reviveProgress rebuilds the Sets + re-establishes the entered ⊂ known invariant. Cosmetic
    // (gates no traversal), so an old save's empty progress is safe; syncZoneFromWorld re-marks on the next step.
    Field.wayfinding = reviveProgress(r.progress);
    this.applyItemCaps(); // union in caps conferred by held key items (the raft → "gorge"), before the grid rebuild
    // Restore PER-ZONE mouth-cleared state (Silverwood Overhaul fix) BEFORE any grid rebuild below —
    // buildAuthoredGrid / genOverworld read miniClearedFor(id), so a beaten zone's mouth stays open (and
    // an unbeaten zone's guard stays up) on resume, per zone. An old save seeds this in deserialize.
    Field.mouthCleared = { ...r.mouthCleared };
    Field.zoneIndex = r.zoneIndex;
    if (r.inTown && r.townId) {
      this.rollMerchantStock();        // re-roll shop stock (transient, never persisted)
      Field.genTown(r.townId);
      this.placePlayer(r.px, r.py);
      // Restore the big-map RETURN tile (where you stepped into the town) so LEAVING heads back there —
      // not to a zone spawn. genTown doesn't touch wx/wy; returnToOverworld reads them on leave.
      Field.wx = r.wx; Field.wy = r.wy;
      Screens.show("field"); Field.resize(); Field.draw(); Field.hint();
    } else {
      Field.enteredDungeon = r.enteredDungeon;
      // MULTI-FLOOR: restore the beaten-gate state BEFORE genDungeon below (it reads dungeonMiniCleared
      // to decide whether each floor's lieutenant still stands), so a resume past a beaten gate keeps
      // the stairs live. Set even when not in a dungeon (harmless; cleared on the next fresh descent).
      Field.dungeonMiniCleared = { ...r.dungeonMiniCleared };
      Field.resize();
      // ADR 0008 Stage 2: a new-model zone saved INSIDE its dungeon rebuilds the dungeon grid;
      // otherwise build the overworld (the mouth is enterable again if the mini was beaten). Legacy
      // zones go through genMap → the combined grid as before.
      if (Field.bigMapEnabled) {
        // BIG-MAP resume (Stage 2C). genMap enters the continent big map (sets up the world + grids);
        // a save made INSIDE a dungeon then rebuilds the (always-discrete) dungeon grid on top, keeping
        // bigMap set so ascend returns to the continent surface.
        Field.genMap();
        if (r.enteredDungeon) Field.genDungeon(Field.zoneIndex, r.dungeonFloor); // restore the saved floor
        else if (r.bigMap && Field.bigMapActive() && (r.wx || r.wy)) {
          Field.wx = r.wx; Field.wy = r.wy;           // restore the saved world tile + re-derive the zone
          Field.realizeAround(); Field.syncZoneFromWorld();
        }
      } else if (Field.usesNewModel() && r.enteredDungeon) {
        Field.genDungeon(Field.zoneIndex, r.dungeonFloor); // discrete: rebuild the saved dungeon floor
        this.placePlayer(r.px, r.py);
      } else {
        Field.genMap();                               // discrete: overworld / combined grid as before
        this.placePlayer(r.px, r.py);
      }
      Field.stepsToEncounter = ri(Field.ENC_MIN, Field.ENC_MAX);
      Screens.show("field"); Field.draw(); Field.hint();
    }
    const noteHtml = r.notes.length ? `<p class="small" style="opacity:.8">${r.notes.join("<br>")}</p>` : "";
    Overlay.show(`<h2 class="title-gold">Welcome back</h2>
      <p class="small">Your run resumes — party, gear, and Aether intact.</p>${noteHtml}
      <div class="row"><button class="btn gold" onclick="Overlay.hide()">Continue</button></div>`);
  },
  // Place the player at the saved tile IF it's passable on the (possibly changed) map; otherwise
  // leave them at the zone/town spawn genMap/genTown already set — never strand them in a wall.
  placePlayer(px: number, py: number): void {
    if ((px || py) && Field.passable(px, py)) { Field.px = px; Field.py = py; }
  },
  // Start a NEW run from the title — opens the Roster picker. Confirms first if a resumable run
  // exists (so the player doesn't accidentally overwrite their save), then clears the slot.
  newGame(): void {
    if (Save.hasSave()) {
      Overlay.show(`<h2 class="title-gold">Start a new run?</h2>
        <p class="small">You have a saved run in progress. Starting fresh will overwrite it.</p>
        <div class="row"><button class="btn gold" onclick="Overlay.hide();Save.clear();Roster.open()">New run</button>
          <button class="btn" onclick="Overlay.hide();Game.continueRun()">Resume instead</button>
          <button class="btn" onclick="Overlay.hide()">Cancel</button></div>`);
      return;
    }
    window.Roster.open();
  },
  // Whether the title screen should offer Continue (a valid save exists).
  hasSave(): boolean { return Save.hasSave(); },
  gameOver(): void {
    if (this.testMode) { this.testReturn?.(); return; } // Test Loop (ADR 0017): a wipe returns to the loop menu — no save-clear, no kick to title
    Save.clear(); // the run is over — don't offer a dead party to resume
    Telemetry.endSession("wipe");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">The party has fallen</h2>
    <p class="small">Greenvale claims another band of adventurers.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Try again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },
  victory(): void {
    Save.clear(); // run complete — nothing to resume
    this.bossDefeated = true; this._inMerchant = false; this._inTown = false;
    Telemetry.boss("win"); Telemetry.endSession("victory");
    Screens.show("title");
    Overlay.show(`
    <h2 class="title-gold">Gaia is saved</h2>
    <p>Mirelord Vorn falls. You have cut a path through every zone of the slice.</p>
    <p class="small">Run complete — encounters won: ${this.encountersWon}. Aether: ◈ ${this.gold}.</p>
    <div class="row"><button class="btn gold" onclick="Overlay.hide();Game.start()">Play again</button>
      <button class="btn" onclick="Overlay.hide()">Home</button></div>`);
  },

  // ── TOWN: a real walkable settlement hub (Field.townMode). The four buildings are walk-in POIs
  // (Field.townTouch routes each onto the actions below); the merchant/smith/revive open as focused
  // overlays over the town field. Party/Bag opened in town return to the town field via
  // UI.close() → backToTown (see menus.ts).
  // Open a specific walkable settlement by id (no resolution here — the caller picks the place; the
  // hub-chain machinery below decides WHICH settlement at each step).
  openTown(id = "hearthford"): void {
    this._inTown = true; this._inMerchant = false; this._revisitTown = false;
    this.rollMerchantStock(); // stock is rolled once per town visit (no reroll by re-entering the shop)
    Field.enterTown(id);
    this.saveNow(); // autosave on entering a settlement (ADR 0007)
  },
  // Enter a hub town as a REVISIT (stepped onto the overworld village marker) — leaving returns to the
  // overworld where you were, not on down the hub/zone chain.
  enterTownVisit(id: string): void {
    this.openTown(id);
    this._revisitTown = true; // openTown cleared it; this entry IS a revisit
    this.saveNow();
  },
  // Stepping onto an overworld hub VILLAGE MARKER — confirm before entering, so roaming the seamless
  // world can't yank you into a town by accident (Dara: "ended up in Miregard, didn't mean to"). The
  // marker sits a tile inside a region's entrance, so it's easy to step on. The EGRESS button + the
  // post-boss hub chain still enter directly via enterTownVisit.
  confirmEnterTownVisit(id: string): void {
    const name = settlement(id).name;
    Overlay.show(`<h2 class="title-gold">🏘️ ${name}</h2>
      <p class="small">Step inside ${name}? Inn, market, smith, shrine — and the Vault.</p>
      <div class="row"><button class="btn gold" onclick="Game.enterTownVisit('${id}')">Enter ${name} →</button>
        <button class="btn" onclick="Overlay.hide()">◂ Stay on the road</button></div>`);
  },
  // EGRESS: a convenience button on the overworld — instantly retreat to the current zone's hub town.
  // Same as the village marker (a revisit), so leaving returns you to where you egressed from.
  egress(): void {
    if (this._inTown) return;
    const hub = Field.zone().hub;
    if (!hub) return;
    this.enterTownVisit(hub);
  },
  // After a zone boss falls (battle.ts), return to the CURRENT zone's hub town — a familiar settlement
  // with the merchant for a breather + restock. LEAVING that town advances to the next zone (leaveTown
  // → loadZone). We deliberately do NOT teleport to the *next* zone's doorstep hub: those are
  // placeholders (e.g. Silverwood points at Riverhearth, the far "main city"), which made beating
  // Greenvale dump the player in the wrong city. Real inter-zone hub progression is Dara's design lane.
  // POST-ZONE-BOSS FLOW (Silverwood Overhaul, D6 — SCOPED auto-warp removal). For the Greenvale→Silverwood
  // transition ONLY, retire the auto-walk-the-hub-chain teleport: after the Kingpin falls the player has
  // the raft (the "gorge" cap, granted in battle.ts) and the world is ROAM-FIRST — drop them back onto the
  // seamless overworld (out of the Warren, at its mouth) to walk to the Sunless Gorge and cross to
  // Silverwood themselves. The Duskmarsh + all backlog zones KEEP `enterNextHubChain` (their hub/hubs flow
  // is unchanged). Gated on the SOURCE zone id so only Greenvale is affected.
  afterZoneBoss(): void {
    if (Field.isLastZone()) { this.victory(); return; }
    // ROAM-FIRST early arc (lock-before-key redesign). The Bandit Warren (Greenvale) is a beginner dungeon
    // with NO key — clearing it sends you EAST toward Silverwood, but the Sunless Gorge bars the way. The
    // raft is found SOUTH, in the Duskmarsh's Drowned Vault (battle.ts grants the "gorge" cap there); clearing
    // THAT opens the gorge so you can cross east. Both bosses drop you back onto the seamless surface to
    // navigate yourself (no hub-chain teleport). Copy is DRAFT — flagged for the narrative pass / Dara.
    const zid = Field.zone().id;
    if (zid === "greenvale" || zid === "duskmarsh") {
      this.bossDefeated = true;
      this._inTown = false; this._inMerchant = false; // roam-first: drop town/merchant flags (no hub chain here)
      Field.ascend();                                 // back onto the big-map overworld at the dungeon mouth
      this.saveNow();
      const title = zid === "duskmarsh" ? "The Vault yields the raft" : "The Warren falls";
      const body = zid === "duskmarsh"
        ? "Among the Drowned Vault's hoard — a lashed raft and bridging-kit. The Sunless Gorge is yours to cross now: strike EAST, over the chasm, for the ancient wood of Silverwood."
        : "The Kingpin is dead and the Warren is cleared. The road EAST to Silverwood is barred by the Sunless Gorge — no boot may cross it. They say a raft lies in the drowned ruins to the SOUTH.";
      Overlay.show(`<h2 class="title-gold">${title}</h2>
        <p class="small">${body}</p>
        <div class="row"><button class="btn gold" onclick="Overlay.hide()">Roam on</button></div>`);
      return;
    }
    this.enterNextHubChain();
  },
  enterNextHubChain(): void {
    this._startVillage = false;
    if (Field.isLastZone()) { this.victory(); return; } // no next zone (shouldn't reach here — final boss → victory)
    this._hubChain = hubsFor(Field.zone());
    this._hubIx = 0;
    if (!this._hubChain.length) { Field.loadZone(Field.zoneIndex + 1); this.saveNow(); return; } // hubless zone → straight on
    this.openTown(this._hubChain[0]);
  },
  // Close an in-town overlay and return to the walkable town field.
  backToTown(): void { this._inMerchant = false; Overlay.hide(); Screens.show("field"); },
  // The Inn — a small fee fully restores HP/MP for every living hero (Dara: resting now costs a bit).
  // Scales with the highest party level so it stays meaningful but affordable as you grow.
  restCost(): number { return 8 * this.party.reduce((n, m) => Math.max(n, m.level), 1); },
  openInn(): void {
    const fullHp = this.party.every((m) => !m.alive || (m.hp >= m.maxhp && m.mp >= m.maxmp));
    const hpSum = this.party.reduce((n, m) => n + Math.max(0, m.hp), 0), maxSum = this.party.reduce((n, m) => n + m.maxhp, 0);
    const cost = this.restCost(), canPay = this.gold >= cost;
    const label = fullHp ? "Fully rested" : canPay ? `Rest · ◈ ${cost}` : `Rest · ◈ ${cost} (need Aether)`;
    Overlay.show(`<h2 class="title-gold">🏠 The Inn</h2>
      <p class="small">Rest by the hearth — restore HP and MP for every living hero for a small fee.</p>
      <div class="card" style="margin:8px 0"><b style="color:var(--gold2)">Party HP</b> ${hpSum}/${maxSum} · <b style="color:var(--gold2)">Gold</b> ${this.gold}
        <div class="small" style="margin-top:6px">${this.party.map((m) => `${m.spr} ${m.name} ${m.alive ? `${Math.max(0, m.hp)}/${m.maxhp}` : `<span class="r-rare">fallen</span>`}`).join(" · ")}</div></div>
      <div class="row"><button class="btn${fullHp || !canPay ? "" : " gold"}" ${fullHp || !canPay ? "disabled" : ""} onclick="Game.restAtInn()">${label}</button>
        <button class="btn" onclick="Game.backToTown()">◂ Leave</button></div>`);
  },
  restAtInn(): void {
    const cost = this.restCost();
    if (this.gold < cost) { this.openInn(); return; }
    this.gold -= cost; this.restParty(); this.openInn();
  },
  rollMerchantStock(): void {
    const lvl = MERCHANT_LEVEL(Field.zoneIndex); // rarity scales with zone depth (same curve as drops)
    const ilvl = 6 + Field.zoneIndex * 6; // stat magnitude: stock the road ahead (gear for the next zone)
    // The merchant deals across attunements — a weapon of another power reclasses the hero who
    // wields it (class = weapon). Stock biases to the party's classes/attunements (with variety).
    this._stock = [];
    for (let i = 0; i < 6; i++) { const m = pick(this.party); this._stock.push(rollItemAtLevel(lvl, m.cls, ilvl, m.att, DROP_MODS.chest)); }
  },
  // Full heal of all LIVING members (mirrors the level-up refill in progression.ts). Dead members
  // are untouched — reviving them is a separate (paid) action.
  restParty(): void {
    this.party.forEach((m) => { if (m.alive) { m.hp = m.maxhp; m.mp = m.maxmp; } });
  },
  // Cost to revive one fallen hero. INTERIM: charged in GOLD. Canon will use an "Aether" currency
  // instead (Dara: Aether replaces gold) — swapping it is a one-line change here. See issue #35.
  reviveCostFor(m: Member): number { return 50 * m.level; },
  // The Revive shrine — bring fallen heroes back (cost scales with level). Re-renders in place.
  openRevive(): void {
    const dead = this.party.filter((m) => !m.alive);
    const reviveAll = dead.reduce((n, m) => n + this.reviveCostFor(m), 0);
    let h = `<h2 class="title-gold">🔮 The Revive Shrine</h2>`;
    if (!dead.length) h += `<p class="small">No fallen heroes. May it stay that way.</p>`;
    else {
      h += `<p class="small">Channel the shrine's Aether to bring the fallen back. Aether: <b>◈ ${this.gold}</b></p><div class="scroll">`;
      h += dead.map((m) => { const c = this.reviveCostFor(m), can = this.gold >= c;
        return `<button class="btn${can ? " gold" : ""}" ${can ? "" : "disabled"} onclick="Game.reviveMember('${m.id}')">Revive ${m.spr} ${m.name} · ◈ ${c}</button>`; }).join(" ");
      if (dead.length > 1) h += `<div class="small" style="opacity:.6;margin-top:4px">Total to revive all: ${reviveAll}g</div>`;
      h += `</div>`;
    }
    h += `<div class="row"><button class="btn" onclick="Game.backToTown()">◂ Leave</button></div>`;
    Overlay.show(h);
  },
  reviveMember(memberId: string): void {
    const m = this.party.find((x) => x.id === memberId);
    if (!m || m.alive) return;
    const cost = this.reviveCostFor(m);
    if (this.gold < cost) return; // ← currency check; swap `this.gold` for Aether later (#35)
    this.gold -= cost;            // ← currency spend; swap for Aether later (#35)
    m.alive = true; m.hp = m.maxhp; m.mp = m.maxmp;
    this.openRevive(); // refresh the shrine list
  },
  // Smith STUB — visibly present, clearly a placeholder. Per Dara (#35) this becomes a Diablo-style
  // affix REROLL (spend Mana Dust/Shard/Core by item rarity to reroll one affix), not forging.
  openSmith(): void {
    Overlay.show(`<h2 class="title-gold">🔨 The Smith</h2>
      <div class="card" style="text-align:left;margin:8px 0">
        <b class="r-legendary">Coming soon</b>
        <p class="small" style="margin-top:6px">Reroll a single affix on a piece of gear — Diablo-style — by spending Mana Dust, Mana Shard, and Mana Core gathered from enemies. The forge isn't open yet.</p>
      </div>
      <div class="row"><button class="btn gold" onclick="Game.backToTown()">◂ Back to town</button></div>`);
  },
  // ── VAULT / STASH: a persistent bank kept BETWEEN runs (localStorage). Deposit loot to keep it
  //    safe and withdraw later. (The Aether crafting economy will plug into stored mana materials
  //    here in time.) Placeholder 🏦 building until a real Vault is sliced. ──────────────────────
  loadStash(): void {
    if (this._stashLoaded) return;
    this._stashLoaded = true;
    try { const raw = localStorage.getItem("gaia_stash_v1"); this.stash = raw ? (JSON.parse(raw) as Item[]) : []; }
    catch { this.stash = []; }
  },
  saveStash(): void { try { localStorage.setItem("gaia_stash_v1", JSON.stringify(this.stash)); } catch { /* storage off (private mode) */ } },
  // Dismiss the one-time "Add to Home Screen" hint and remember it (bridged to the title button).
  dismissA2HS(): void {
    try { localStorage.setItem("gaia_a2hs_seen", "1"); } catch { /* storage off */ }
    document.getElementById("a2hs")?.classList.remove("on");
  },
  openStash(): void {
    this.loadStash();
    const col = (arr: Item[], btn: (i: number) => string, empty: string) => {
      if (!arr.length) return `<p class="small">${empty}</p>`;
      return arr.slice().sort((a, b) => b.rIx - a.rIx).map((it) => itemHtml(it,
        `<div class="row" style="justify-content:flex-start;margin-top:6px">${btn(arr.indexOf(it))}</div>`)).join("");
    };
    Overlay.show(`<h2 class="title-gold">🏦 The Vault</h2>
      <div class="small">Store loot safely — your Vault is kept between runs. Bag: ${this.inventory.length} · Vault: ${this.stash.length}</div>
      <div class="tag" style="margin-top:8px">Bag — deposit to Vault</div>
      <div class="scroll" style="max-height:28vh">${col(this.inventory, (i) => `<button class="btn" onclick="Game.depositToStash(${i})">Deposit →</button>`, "Bag empty.")}</div>
      <div class="tag" style="margin-top:8px">Vault — withdraw to Bag</div>
      <div class="scroll" style="max-height:28vh">${col(this.stash, (i) => `<button class="btn" onclick="Game.withdrawFromStash(${i})">← Withdraw</button>`, "Vault empty.")}</div>
      <div class="row"><button class="btn gold" onclick="Game.backToTown()">◂ Back to town</button></div>`);
  },
  depositToStash(invIdx: number): void {
    const it = this.inventory[invIdx]; if (!it) return;
    this.inventory.splice(invIdx, 1); this.stash.push(it); this.saveStash(); this.openStash();
  },
  withdrawFromStash(stashIdx: number): void {
    const it = this.stash[stashIdx]; if (!it) return;
    this.stash.splice(stashIdx, 1); this.inventory.push(it); this.saveStash(); this.openStash();
  },
  // Leave the settlement. The STARTING village heads into the current zone; a between-zone hub
  // either advances to the NEXT settlement in the chain (e.g. Riverhearth → Miregard) or, at the
  // chain's end, sets out for the next zone (or, after the last, the final reckoning).
  confirmLeaveTown(): void {
    if (this._startVillage) {
      const here = ZONES[Field.zoneIndex];
      Overlay.show(`<h2 class="title-gold">⚔️ Out the Gate</h2>
        <p class="small">Head north into ${here.name}? The road's yours when you're ready.</p>
        <div class="row"><button class="btn gold" onclick="Game.leaveTown()">Into ${here.name} →</button>
          <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
      return;
    }
    // A REVISIT (reached via the overworld village marker — start-village handled above): leaving heads
    // back out onto the overworld where you were, not on down the hub/zone chain.
    if (this._revisitTown) {
      const where = ZONES[Field.zoneIndex]?.name ?? "the overworld";
      Overlay.show(`<h2 class="title-gold">⚔️ Leave ${Field.town?.name ?? "Town"}</h2>
        <p class="small">Head back out into ${where}?</p>
        <div class="row"><button class="btn gold" onclick="Game.leaveTown()">Back to ${where} →</button>
          <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
      return;
    }
    const dest = this.nextLeaveDest();
    Overlay.show(`<h2 class="title-gold">⚔️ Leave ${Field.town?.name ?? "Town"}</h2>
      <p class="small">${dest.label}</p>
      <div class="row"><button class="btn gold" onclick="Game.leaveTown()">${dest.cta}</button>
        <button class="btn" onclick="Game.backToTown()">◂ Not yet</button></div>`);
  },
  // Where leaving the current between-zones hub goes: the NEXT settlement in the chain if one
  // remains, else the next zone (or the final reckoning). Pure copy-helper for the confirm prompt.
  nextLeaveDest(): { label: string; cta: string } {
    const nextHub = this._hubChain[this._hubIx + 1];
    if (nextHub) {
      const nm = settlement(nextHub).name;
      return { label: `Take the road on to ${nm}? Your gear and levels carry over.`, cta: `On to ${nm} →` };
    }
    const next = Field.isLastZone() ? null : ZONES[Field.zoneIndex + 1];
    return next
      ? { label: `Set out for ${next.name}? Your gear and levels carry over.`, cta: `Onward to ${next.name} →` }
      : { label: "Press on to the final reckoning?", cta: "Onward →" };
  },
  leaveTown(): void {
    this._inTown = false; this._inMerchant = false; Field.townMode = false;
    Overlay.hide();
    if (this._startVillage) { this._startVillage = false; Field.enterZoneFromVillage(); this.saveNow(); return; }
    // Revisit leave (Hearthford via the overworld marker): step back out onto the Greenvale overworld.
    if (this._revisitTown) { this._revisitTown = false; Field.returnToOverworld(); this.saveNow(); return; }
    // Advance the hub chain: if another settlement remains, walk into it; else load the next zone.
    const nextHub = this._hubChain[this._hubIx + 1];
    if (nextHub) { this._hubIx++; this.openTown(nextHub); Field.draw(); return; } // openTown saves
    if (Field.isLastZone()) this.victory();
    else { Field.loadZone(Field.zoneIndex + 1); this.saveNow(); } // autosave on zone change (ADR 0007)
  },
  restartFromTown(): void {
    this._inTown = false; this._inMerchant = false; Field.townMode = false;
    Overlay.hide();
    window.Roster.open(); // same entry the title screen uses (build party → start run)
  },

  // ── MERCHANT: opened from the town hub; spend gold on rolled loot, then back to the hub ──
  openMerchant(): void {
    this._inMerchant = true;
    this.renderMerchant();
  },
  renderMerchant(): void {
    this._inMerchant = true;
    let h = `<h2 class="title-gold">Wandering Merchant</h2><div class="small">"Spoils for the road ahead." Aether: <b>◈ ${this.gold}</b></div><div class="scroll">`;
    if (!this._stock.length) h += `<p class="small">Sold out. Safe travels.</p>`;
    this._stock.forEach((it, idx) => {
      const price = priceOf(it), afford = this.gold >= price;
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn${afford ? " gold" : ""}" ${afford ? "" : "disabled"} onclick="Game.buyItem(${idx})">Buy · ◈ ${price}</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">Party</button><button class="btn" onclick="UI.openInventory()">Bag / Sell</button>`;
    h += `<button class="btn gold" onclick="Game.leaveMerchant()">◂ Back to town</button></div>`;
    Overlay.show(h);
  },
  buyItem(idx: number): void {
    const it = this._stock[idx];
    if (!it) return;
    const price = priceOf(it);
    if (this.gold < price) return;
    this.gold -= price; this.inventory.push(it); this._stock.splice(idx, 1);
    this.renderMerchant();
  },
  // Sell a bag item to the merchant for gold (only meaningful while shopping). Stays in the Bag
  // view so the player can clear out several pieces in a row.
  sellItem(invIdx: number): void {
    const it = this.inventory[invIdx];
    if (!it || !this._inMerchant) return;
    this.gold += sellPriceOf(it);
    this.inventory.splice(invIdx, 1);
    window.UI.openInventory(); // UI resolves via the window bridge (avoids a controller import cycle)
  },
  // The shop's "back" returns to the walkable town field (the merchant is a building in town).
  leaveMerchant(): void {
    this.backToTown();
  },
};
