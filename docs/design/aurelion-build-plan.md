# Aurelion Build Plan — a proposal for Dara

**Status: PROPOSAL. Not canon.** This is the Creative Director's plan for building out **Aurelion,
The Heartland** (the NW continent, the starting continent) as a coherent early/mid-game continent.
It follows the `world-builder` skill (World Brief → pipeline → sync gates → integrate → verify →
ship). **Dara owns the world, lore, classes, and art** — everything below that touches progression,
attunement, lore, naming, or class identity is offered for him to **react to and rule on**, not
settled. Nothing here overrides `world-atlas.md` §4.

Anchored in: `docs/design/world-atlas.md` (Aurelion = regions #1–9 + the Duskmarsh, per §4 G3/G5),
`docs/design/affinity-ring.md` (the ±15% ring; surface regions carry **no** attunement theme — §4
G4), `app/src/data/zones.ts` (current 2-zone structure), and the REQUIEM tone.

> **Dara's rulings this plan respects (atlas §4):** Aurelion = The Heartland, the starting continent.
> **No surface region has an Attunement identity — only the five Sundering scars do.** The Duskmarsh /
> Drowned Vault are in Aurelion. Whisper Hills (#8) and Sunbridge (#9) are Aurelion. **Progression
> order, level bands, and the region connection graph are deliberately OPEN** ("figure out as we
> go") — so every band/order/connection below is a *proposal*.

---

## 1 · Aurelion World Brief — the shared creative anchor

This is the one contract the whole continent's build hangs on, per the skill's Step 1. Every
specialist agent is dispatched against it; any drift from it is treated as a defect at the sync gate.

### Identity & fantasy
**Aurelion is the cradle of civilization — the warm, known, human world the player calls home, with
the wild and the ruined pressing in at its edges.** It is fertile farmland and old forests, river
trade-towns and dwarven mountain holds, a frontier watch and quiet monasteries — "the seat of
humanity's greatest nations." The fantasy is **the classic RPG opening**: you start in the shire,
you grow up through your homeland, and by the time you leave Aurelion you are ready for the truly
hostile continents (Varkhaz, Myr'Thalas) and, eventually, the Sundering. It is the place that makes
the rest of Gaia feel dangerous *by contrast*.

**One-line hook:** *Rise from a farm village to a continent-spanning hero, learning the world is
older and stranger than the Heartland lets on.*

### The through-line that ties the 9 regions together
A **rising-stakes journey outward from the heartland's safe center toward its edges.** Greenvale (the
shire) and Riverhearth (the trade capital) are the warm civilized core; each region you travel pushes
*outward* — to the coast, the high mountains, the frontier, the haunted marsh — and the threats
escalate from "bandits and vermin" to "the things civilization keeps at bay." A quiet secondary
thread, drawn from canon: Aurelion sits atop the sealed **Aurelion Access Shafts** (atlas §2) — the
heartland is built over the buried Forgotten Civilization, a hum under the floorboards that the
endgame eventually answers. **No region preaches this**; it's texture for later, not an early plot.

### Biome & visual language (gold-on-dark house style)
The house palette is **gold-on-dark** throughout (CLAUDE.md / art lane). Aurelion reads as **warm and
lived-in** within that palette — gold is *hearthlight, harvest, lamplit towns, banners* — distinct
from the colder/harsher palettes the other continents should eventually claim. Per-region biomes are
varied (see §2) but all rendered in the same gold-on-dark key so the continent feels like one place.
Tile language extends the existing Greenvale tileset (plains/forest/water/path) and the dungeon
tilesets (warren/vault), adding region-specific kinds as each zone needs them (coast/harbor, snow/
stone holds, fortress walls, monastery, town/hub tiles).

### Attunement identity — DELIBERATELY NONE (per Dara, §4 G4)
**No Aurelion region carries a continent- or region-wide Attunement theme.** Enemy attunements stay
**spread across the ring** so any party composition gets matchups and the ±15% affinity lever stays
live per-fight (as it is today: Greenvale spread; Kingpin SOL-infused, Cave Troll NOX-infused for the
boss matchups). Individual bosses/elites *may* be infused with a single Attunement for a deliberate
"bring the counter" fight — that is per-unit flavor, **not** a region theme. The attunement-themed
regions are reserved for the **Sundering** endgame. *(Open for Dara: which bosses, if any, get an
infusion — §4 below.)*

### Level band & role in the world
Aurelion is the **early and lower-mid game**: the on-ramp from level 1 up to roughly the high teens /
low twenties, handing the player off to the harsher continents above that. It currently holds
Greenvale (L1–6) and the Duskmarsh (L7–10); this plan proposes extending that ladder across the
remaining seven regions (see §2 — all bands are proposals for Dara).

### Cast & threats (theme, not roster — Dara owns canon enemies)
Aurelion's threats escalate along the through-line: **human banditry and farm vermin** at the core
(slimes, kobolds, bandits — already canon), then **wilder beasts and the marsh's drowned things**
(rats, spiders, lepers, the Cave Troll — already canon), then, toward the edges, **coastal raiders,
mountain/cave dwellers, frontier marauders, and the first faint underworld-touched anomalies** near
the sealed Access Shafts. New enemies are **Dara's to author** (REQUIEM canon roster); this plan only
flags *where* new enemies are needed so he can name/design them.

### Loot & class hooks
Aurelion is where the player **learns the loot game**: it should keep delivering the level-banded
rarity ladder already shipping (`rarityBand` in `systems/loot.ts` — uncommon/rare/epic appearing as
levels climb; artifacts are L30+, i.e. *beyond* Aurelion, which keeps the chase pointing at later
continents). It is also the natural place to **introduce more of the 45 classes** through the Roster
picker as the player meets attunement-diverse foes — but **class kit design is Dara's**; the pipeline
only *showcases* kits, it doesn't invent them.

### Tone & sound
**Pastoral, hopeful, adventurous, with darkening edges.** Music should sound like the biome the art
paints: bright/folk-pastoral for the heartland core (Greenvale's existing theme is the anchor),
turning **windswept** on the coast, **austere/echoing** in the mountain holds and monasteries, **tense
and martial** at the frontier, and **dread/low** in the marsh and dungeons (the Duskmarsh/Drowned
Vault already set this floor). All procedural chiptune in `audio/music.ts` — no asset files, iOS-Safari
safe.

---

## 2 · Region-by-region build order (PROPOSAL — Dara owns progression, §4 G6)

The nine Aurelion regions are the atlas table (#1–9) plus the Duskmarsh. **Greenvale (L1–6) and the
Duskmarsh (L7–10) are already shipped** — they bookend the early game. The proposal threads the other
seven *around* them along the "outward from the core" through-line. **Level bands, order, and which is
a combat zone vs. a town/hub are all proposals for Dara to confirm.**

The current engine zone shape (`data/zones.ts`) is: a zone = `envs` + encounter `bands` + a `mini`
(gate) + a `dungeon` + a `boss`. A pure **town/hub** like Riverhearth doesn't fit that combat-zone
shape and is flagged as **new content** (a non-combat hub screen) — a decision for Dara on whether to
build it as a hub or fold it into a combat zone's town tiles.

| Order | # | Region | Proposed band | Role / fantasy (one line) | Biome | Zone kind | New content it implies |
|---|---|---|---|---|---|---|---|
| 1 (shipped) | 1 | **Greenvale** | **L1–6** | The shire — your first steps, bandits & vermin | Temperate farm/forest | Combat zone + Bandit Warren dungeon | *(done)* |
| 2 | 3 | **Goldmeadow Plains** | **L5–9** | The breadbasket — open-field fights, first real travel | Open grassland & farms | Combat zone | Grassland tile variants; new field enemies (Dara) |
| 3 | 5 | **Riverhearth** | **hub (no band)** | The trade capital — town, merchant, party/roster, breather | River trade city | **Town/hub** (non-combat) | **NEW: hub screen** (merchant + roster + lore NPCs); town tileset |
| 4 (shipped) | — | **The Duskmarsh** + Drowned Vault | **L7–10** | The dark detour — the marsh civilization fears | Mire/hollow + drowned vault | Combat zone + dungeon | *(done)* |
| 5 | 2 | **Silverwood** | **L9–12** | The ancient forest — old-growth depths, beasts | Old-growth forest | Combat zone (+ optional grove dungeon) | Dense-forest tiles; forest beasts (Dara) |
| 6 | 4 | **Storm Coast** | **L11–14** | The storm-battered coast — raiders & the sea's edge | Rocky coast & harbor | Combat zone | Coast/water/harbor tiles; coastal raiders (Dara) |
| 7 | 6 | **Frostpeak Highlands** | **L13–16** | The dwarven holds — snow peaks, a mountain dungeon | Snow mountains, dwarven holds | Combat zone + hold dungeon | Snow/stone-hold tiles; mountain/cave foes (Dara) |
| 8 | 8 | **Whisper Hills** | **L15–18** | The monastery land — quieter, eerie, a teaching beat | Hills & monasteries | Combat zone (or mini-hub) | Monastery/hill tiles; possible NPC lore beats |
| 9 | 7 | **Dawnfall Hold** | **L17–20** | The frontier watch — the wall before the wild continents | Border fortress / frontier | Combat zone + fortress dungeon | Fortress-wall tiles; frontier marauders + a capstone boss (Dara) |
| 10 | 9 | **Sunbridge** | **L18–21** | The port city — the gateway off Aurelion to the Coral Archipelago | Port city toward the isles | **Town/hub** + departure gate | Port/hub tiles; sets up the *next* continent |

**Why this order (the through-line in motion):** core-out. Greenvale → Goldmeadow keeps you in the
warm heartland and teaches travel. Riverhearth is the first hub/breather and the social heart. The
Duskmarsh is the early "dark detour." Then the journey pushes *outward to the edges* — the ancient
forest, the coast, the mountains, the monasteries — escalating to **Dawnfall Hold**, the frontier
fortress that is the natural Aurelion capstone, and finally **Sunbridge**, the port that ships you off
to the next continent. This keeps the two shipped zones in place and only *adds* around them.

**Notes / flags on this proposal:**
- Bands deliberately **overlap slightly** (e.g. Goldmeadow L5–9 reaches back under Greenvale's top)
  so a player isn't hard-walled — but order vs. band is Dara's call (§4 G6).
- **Riverhearth and Sunbridge as true hubs** is the biggest new-content swing (a non-combat screen the
  engine doesn't have yet). Cheaper alternative: ship them first as combat zones with prominent town
  tiles + the existing merchant, and upgrade to full hubs later. Flagged for Dara.
- The **connection graph** (which region links to which, via trade/sea/underground routes — atlas §4
  G7) is left to fall out of this build order; Sunbridge's sea route to the Coral Archipelago is the
  one canon-implied link.

---

## 3 · Per-region pipeline note — the first 1–2 regions

How the `world-builder` pipeline would actually dispatch for the opening builds, once Dara confirms
the brief and the first target. (The Director writes a per-region World Brief slice from §1, runs it
past `requiem-canon-keeper` first, then dispatches.)

### Region A — **Goldmeadow Plains** (proposed first build, L5–9, combat zone)
The lowest-risk first build: a pure combat zone that extends the proven Greenvale shape, no new engine
screen. Pipeline order:

1. **`requiem-canon-keeper`** (pre-flight) — vet the Goldmeadow brief slice (name, biome, any
   enemy/boss intent) against REQUIEM + vocabulary *before* anyone builds. Reports; Dara rules.
2. **`level-designer`** + **`art-integrator`** (parallel — space + skin):
   - level-designer: shape the zone in `data/zones.ts` + the `genMap` path in `controllers/field.ts`
     — open grassland layout, branching paths, a chest/POI or two, the mini-boss gate, soft-lock-free
     flow; defines any new **tile kinds** (grassland variants).
   - art-integrator: paint/wire those tile kinds and any new sprites from Dara's reference sheets in
     the gold-on-dark palette; register in `data/art.ts`, resolve via `core/assets.ts`.
3. **`encounter-designer`** — populate the encounter `bands` (sets by depth), `mini`/`miniAdds`, and
   `boss`; place any rare monster; keep enemy attunements **spread** (no region theme) with teach-then-
   combine pacing. Uses canon enemies where they exist; flags any *new* enemy for Dara to author.
4. **`requiem-canon-keeper`** (flavor pass) — re-vet the populated zone's names/mechanics.
5. **`narrative-writer`** — write the zone intro, enemy/POI blurbs, microcopy in the brief's pastoral-
   heartland voice — only after canon is settled.
6. **`audio-composer`** — compose the Goldmeadow field theme: bright, folk-pastoral, sibling to the
   Greenvale theme, in `audio/music.ts`.
7. **`balance-tuner`** (last) — tune enemy stats, loot/ilvl/MNA, XP for the L5–9 band; iterate with
   `npm run sim 200` toward targets (party HP ~55–75%, boss ~30–50%, wipe <~10%).
8. **`code-reviewer`** + **`ux-designer`** (final gates) — ADR 0005 layering + types + tests; legibility
   and gold-on-dark consistency for any new field UI. Then Director integrates, verifies, versions,
   ships via `devops`/the deploy skill.

### Region B — **Riverhearth** (the hub, if Dara wants it next)
Different shape — a **town/hub**, which the engine doesn't have yet, so the pipeline shifts toward UX
and architecture early:

1. **`requiem-canon-keeper`** — vet Riverhearth as the trade capital (name/role/any lore NPCs).
2. **Director + `code-reviewer` (design consult)** — decide *how* a non-combat hub fits the layering
   (likely a new `controllers/` screen reusing the merchant + roster), since this is an architecture
   call, not just content. **This is the gating decision** and may warrant an ADR.
3. **`level-designer`** + **`art-integrator`** — town layout/tiles + town/hub sprites (gold = lamplit
   streets, banners, market).
4. **`narrative-writer`** — the town's voice: NPC/merchant lines, lore beats (the faint hum of the
   Access Shafts as optional texture), signage microcopy.
5. **`audio-composer`** — a warm, bustling town theme (distinct from the field/battle themes).
6. **`ux-designer`** (heavy) + **`code-reviewer`** — a new screen is mostly a UX/flow problem: legibility,
   touch targets, navigation in/out, mobile safety. No `balance-tuner` (no combat) unless the hub gates
   anything.

(If Dara would rather not build a brand-new hub screen yet, swap Region B for **Silverwood** — another
straightforward combat zone on the same pipeline as Goldmeadow — and defer the hub.)

---

## 4 · Decisions needed from Dara (the smallest set that unblocks building)

1. **Approve the Aurelion World Brief (§1)** as the shared anchor — especially the through-line ("core
   outward, rising stakes") and the "no region-wide attunement theme, enemies stay spread" reading of
   his §4 G4 ruling.
2. **Confirm or reorder the build sequence + level bands (§2)** — this is his (atlas §4 G6). At
   minimum: do the proposed bands (extending L1–6 / L7–10 up to ~L21 across Aurelion) feel right, and
   does the "core → edges → frontier → port" order match his intent?
3. **Pick the first region to build.** Recommendation: **Goldmeadow Plains** (lowest-risk, reuses the
   proven combat-zone shape). Confirm, or name a different first target.
4. **Rule on hubs:** should **Riverhearth** (and later **Sunbridge**) be built as true **non-combat
   hub screens** (new engine work, maybe an ADR), or shipped first as combat zones with town tiles +
   the existing merchant and upgraded later?
5. **Naming / canon to author for the first build:** confirm the names **Goldmeadow Plains** /
   **Riverhearth** (or rename), and — since enemies/classes/lore are his — say whether the first new
   combat zone should reuse the existing canon bestiary or whether he wants to **author new
   Goldmeadow enemies + a zone boss** (the pipeline will flag the gaps either way).
6. **Boss attunement infusions (optional):** should any Aurelion bosses be single-Attunement-infused
   for a "bring the counter" fight (like the SOL Kingpin / NOX Troll today), and if so which — or keep
   future bosses attunement-neutral? (Per-unit flavor only; not a region theme.)

---

*This plan is a proposal for Dara's approval. When he rules, fold his decisions into
`world-atlas.md` §4 (move open items up to Resolved) and begin the first region's build via the
`world-builder` skill.*
