# World Brief — Aurelion, completed (the remaining 6 regions)

The sync anchor for the **"Aurelion complete" build** (world-builder skill §1): the six remaining
backlog regions of the first continent, built into playable seamless-overworld zones in ONE release.
Every agent anchors to this brief; drift from it is a defect.

> **Status:** DRAFT — agent first pass. Dara owns lore/names; everything here is flagged for his
> blessing. Bands, bestiary, encounters, balance are agent-driven (Director's authority). REQUIEM is
> canon. Surface regions carry **NO Attunement identity** (Dara's ruling) — encounter leans are
> creature/terrain flavor only; enemy Attunements stay spread across the ring for matchups.

## Decisions locked (Dara/Director, this build)
- **Structure = spine + optional side-regions.** A main story spine (Frostpeak → Sunbridge) extends
  the level curve to a continent finale (~L25); the other four are OPTIONAL side-regions at
  overlapping bands — roamable, tougher, reward-rich, but NOT on the critical path.
- **Cadence = build all six, ship once** as a single "Aurelion complete" version.
- **Run-ender moves to Sunbridge** (the continent's southern gateway). Goldmeadow is no longer the
  finale — the spine now ends at Sunbridge. (Reversible; flagged.)
- **Optional regions are LIGHTER:** a small tough **cave** (single-floor, one strong reward) + a
  **champion**-tier guardian, not a full multi-room dungeon + unique boss. Spine regions get the
  full dungeon + boss treatment. (Fits ADR 0009: cave = small/optional/tough; dungeon = story arc.)

## The continent after this build (9 regions, the curve)
Built already: Greenvale L1–6 · Silverwood L7–9 · Duskmarsh ~L10 · Goldmeadow L11–15.
```
                      Storm Coast 13–17 (opt, W coast)
Goldmeadow 11–15 ──┬─ Riverhearth 15–18 (opt, center)
                   ├─ Frostpeak 16–20  (SPINE, E mtns) ── Sunbridge 21–25 (SPINE FINALE, S port)
                   ├─ Dawnfall 17–21   (opt, SW)
                   └─ Whisper Hills 19–23 (opt, SE)
```
Overlapping bands = a web, not a ladder: after Goldmeadow the player can drift into Storm
Coast/Riverhearth, push the spine through Frostpeak to the Sunbridge finale, with Dawnfall and
Whisper Hills as tougher optional detours.

---

## SPINE

### Frostpeak Highlands (#6 — "Dwarven Strongholds", eastern mountains) · L16–20
- **Fantasy:** the cold gate east — frozen peaks, glacial passes, and the tunnels of a dwarven hold
  gone silent. After the open Goldmeadow plains, the world turns vertical, white, and biting.
- **Biome/visual:** snow/ice/stone — white ground, dark pine, frozen water, cliff walls, hold-gates.
  Placeholder = recolored cold tiles (flag snow/ice/dwarven-stone art). Gold-on-dark, cold-tinted.
- **Cast (draft):** frost beasts (ice wolves, a yeti/snow-troll), mountain reavers, and the hold's
  awakened stone sentinels. Mini: a hold-warden at the gate. **Dungeon:** the Dwarven Stronghold
  (a hold/mine, multi-room). **Boss:** a stone/frost guardian (enrage-capable). Rare: a crystalline
  beast in the ice.
- **Sound:** stoic, cold, deep — low horns and a slow glacial pulse.

### Sunbridge (#9 — "Port City", south, toward the Coral Archipelago) · L21–25 · AURELION FINALE
- **Fantasy:** the grand southern port — Aurelion's bridge to the world beyond — under siege. The
  continent's climax: a great sea-city you fight through to its citadel/lighthouse.
- **Biome/visual:** harbor/city-coast — quays, sea-walls, a lighthouse, warm stone under storm-sky;
  water everywhere. Placeholder = recolored coast/town tiles (flag port-city art).
- **Cast (draft):** the besieging host + sea-raiders + something risen from the deep. Mini: a siege
  captain at the citadel mouth. **Dungeon:** the Besieged Citadel / Lighthouse (the finale dungeon).
  **Boss:** the continent-finale antagonist — a siege-warlord or a leviathan — the hardest fight in
  the game so far, **enrage-flagged**. Rare: a treasure-laden corsair.
- **Sound:** grand and tragic — the build's biggest, most cinematic statement; a besieged-city dirge
  rising to a climactic boss theme.

---

## OPTIONAL SIDE-REGIONS (cave + champion; lighter)

### Storm Coast (#4 — "Seafarer's Rest", west coast) · L13–17
- **Fantasy:** a storm-lashed rock coast of wrecked hulls and smugglers' coves — restless, wet,
  dangerous. **Cast:** pirates/wreckers + sea-beasts (crabs, serpents). **Cave:** a sea-cave /
  smuggler's hold (one rich reward). **Champion:** a wrecker-captain. **Sound:** wind, breakers,
  unease.

### Riverhearth (#5 — "Trade Capital", center) · L15–18
- **Fantasy:** the capital's beset outskirts — trade roads and river-wharves where bandits and
  smugglers prey on the war's chaos. **Keeps the EXISTING Riverhearth city as its hub** (already a
  town). **Cast:** road-bandits, smugglers, river-toughs. **Cave:** a smugglers' den beneath the
  wharves. **Champion:** a crime-lord. **Sound:** a tenser variant of the bustling city theme.

### Dawnfall Hold (#7 — "Frontier Watch", SW) · L17–21
- **Fantasy:** a breached frontier fortress that held back the wilds and lost — grim, martial ruin.
  **Cast:** the wild things that broke through + the hold's fallen watch. **Cave:** the keep's
  breached undervault. **Champion:** a fallen watch-commander. **Sound:** martial, grim, watchful.

### Whisper Hills (#8 — "Monastery Land", SE) · L19–23
- **Fantasy:** quiet green monastic hills hiding a dark secret beneath a silent monastery — sacred
  turned wrong. **Cast:** restless spirits + corrupted monks. **Cave:** the crypt/reliquary below.
  **Champion:** a corrupted abbot or a wraith. **Sound:** hushed, sacred, eerie — bells and breath.

---

## Build wiring (per region, the seamless-engine recipe — same as Goldmeadow)
1. **world-cartographer:** link each region (`zone:"<id>"`, drop `draft`) in `data/world.ts`; refine
   its organic polygon (inside Aurelion, no overlap); paint tiling **Areas** (eastern lobe = the
   mouth/cave Area, `miniboss-gate` lean); report each centroid for `WORLD_PLACEMENT`.
2. **level-designer:** author each `ZoneLayout` (open-world loops, mouth east, spawn, chests, lair) +
   `WORLD_PLACEMENT` entry + the dungeon (spine) or cave (optional) `DungeonLayout`; add the `Zone`
   to `ZONES` (Sunbridge LAST = run-ender). Flag new tile kinds (snow/ice/port/etc.) for art.
3. **encounter-designer:** rosters in `enemies.ts` (spread Attunements), teach→combine bands,
   mini/champion/boss, rare monsters. Reuse existing enemies where they fit to limit roster sprawl.
4. **requiem-canon-keeper → narrative-writer:** vet names; write the prose, in each region's voice.
5. **audio-composer → balance-tuner:** six region themes (+ spine dungeon/boss cues); tune each band
   (sim targets: party HP ~55–75%, boss ~30–50%, wipe <~10% relative).

Verify gate before ship: `npm run typecheck && npm test && npm run build && npm run sim 200`, green +
on target. Then ONE version bump + changelog ("Aurelion complete") + devops deploy.

## Standing flags for Dara (carried through this build)
- All region/Area/enemy/dungeon **names are draft**.
- **Run-ender → Sunbridge** (Goldmeadow demoted). Confirm.
- **Optional regions use caves + champions**, not full dungeons+bosses — confirm that's the right
  weight, or say which deserve a full dungeon.
- **Riverhearth** kept as a city hub + a light outskirts zone (not rebuilt as a pure combat zone).
- **Settlement doorsteps:** the new regions have no towns yet (Goldmeadow already flagged). Which
  regions get a walkable settlement is Dara's call — placeholders/none for now.
- Geography: all six are rough traces of the canon map; nudge on Dara's word.
