# Dungeon Design — Research Basis (JRPG best practices for Gaia)

A synthesis of dungeon-design principles drawn from acclaimed party JRPGs and their designers,
filtered for **Gaia's** specific shape: a turn-based, **party-of-five** (3 front / 2 back) RPG with
**ATB** combat, the **Attunement affinity ring** (±15% matchup), status effects, and **Diablo-style
random/affix loot**. This is the *basis* for our dungeon design — the "why" behind the rules we'll
ship in `data/zones.ts` and `controllers/field.ts`.

> **How to read this.** Each section gives the principle, who/what it's drawn from, and a
> **→ Gaia** translation that points at the system or knob it touches. Sources range from primary
> designer interviews and reputable trade press (Game Developer/Gamasutra, Game Maker's Toolkit,
> The Level Design Book) down to community sentiment — claims are flagged where the sourcing is
> weak so we don't over-trust forum opinion. **Dara owns class/ability/lore design; this doc is
> agent-driven dungeon/level craft** (layout, pacing, encounter cadence, reward placement), which
> per CLAUDE.md is our lane.

---

## TL;DR — the ten principles we'll build on

1. **Pace by tension-and-release, not a constant grind.** Alternate combat with breather beats;
   players go numb under unrelenting intensity.
2. **Make resource depletion the engine of tension** — a dungeon is interesting because you might
   run out (MP/HP/items) before you reach the next safe room, not because every fight is hard.
3. **Visible/avoidable encounters beat pure random**, but only if they don't choke off the
   exploration they're meant to reward.
4. **Build legible space**: distinct landmarks, a hub to orient around, loops + unlockable
   shortcuts instead of dead-end backtracking.
5. **Branch early, funnel late** — front-load choice/exploration, then streamline toward the boss.
6. **Every node should pose a real decision.** Cut "dead space" — long choiceless corridors are
   the failure mode.
7. **Puzzles in moderation, and tied to the dungeon's identity** — light gimmicks as variety, not
   obtuse puzzle-saturation that breaks the combat/loot flow.
8. **Reward exploration generously but tune density** — optional side-paths pay out categorically
   better loot than the critical path; over-stuffing chests causes fatigue.
9. **Teach, then test.** Introduce a threat in a low-stakes fight, combine/escalate it, then the
   boss is a knowledge-check on what the dungeon taught.
10. **Use enemy composition to push strategy** — compose packs around Attunement matchups and
    row-targeting so the dungeon *rewards* good party-building, and telegraph boss threats so
    failure reads as the player's mistake.

---

## 1. Pacing & encounter cadence

**Tension-and-release is the core rhythm.** Players adjust to prolonged high intensity — "any
intense boss fight will feel like a slog after 10+ minutes" — so downtime is a deliberate
"contrast and palette cleanser, otherwise the player will simply go numb" (The Level Design Book,
*Pacing* — book.leveldesignbook.com/process/preproduction/pacing, **verified**). Loot-management
loops (return to town to sell/repair/turn-in) are explicitly called out as the low-intensity
"reward" valley between combat peaks — which maps directly onto Gaia's merchant.

**Pacing, not the combat system, decides whether fights feel fresh.** Aevee Bee's much-cited
analysis argues the *spacing* of encounters is "the only thing that matters" — great combat is
ruined by forced repetition, and over-generous healing (her example: *Bravely Default*) flattens
tension because the only real penalty left is "wasting the player's time." Conversely *Etrian
Odyssey* depletes party resources **before** exploration gets boring, so scarcity itself is the
tension and the same enemy feels different by context (Medium, *Nobody Cares About It But It's The
Only Thing That Matters*; **high confidence — focused design essay**).

**Visible / avoidable encounters over pure random.** *Chrono Trigger*'s team explicitly A/B'd
FF-style random battles against on-field touch encounters and chose the latter as a pillar,
hand-authoring 100+ setpiece encounters; their stated rationale was to kill the random-battle "oh,
it's these guys again" fatigue and let players observe enemies before engaging (shmuplations 1995
developer interview; **high — primary, though fetched via snippet**). Visible encounters raise
agency: players can heal, re-equip, and choose when to fight (Significant Bits, *Revisiting Field
Encounters*).
**But the counter-point matters:** filling every forked path with on-map enemies makes optional
routes *less* enticing, and "avoidable" is often overstated since enemies hold speed/positioning
advantages (same source; **high — names the tradeoff explicitly**).

**Safe rooms segment combat stretches.** *Persona 5* places periodic Safe Rooms (save, recover,
regroup, fast-travel) inside Palaces, and Atlus handcrafted P5's dungeons specifically to fix the
repetitive, poorly-paced procedural floors of P3/P4 (Megami Tensei Wiki / Game Rant; **medium —
mechanic well-attested, rationale is games-press not primary**).

**→ Gaia.**
- Our **explore → fight → reward → rest** loop already exists (zones → encounters → loot →
  merchant). Treat the merchant as the sanctioned "valley" between Greenvale and Duskmarsh, and add
  **in-dungeon rest/save nodes** for the Drowned Vault so a long dungeon has internal breathers.
- **Tune encounter rate to resource depletion, not a fixed timer.** The win condition for our
  dungeons is "the party arrives at the boss gate having spent most of its MP/items" — that's what
  the balance sim's end-of-fight HP targets (~55–75%, bosses 30–50%) are really protecting. If
  healing/MP is too abundant, fights become "time tax," which is the failure mode to avoid.
- We currently use abstracted encounters; **if/when we add on-map enemies, keep optional side-paths
  lightly guarded** so exploration stays inviting (the Significant Bits trap).

---

## 2. Spatial layout & navigation

**Legibility comes from distinct parts.** Level designers lean on Kevin Lynch's *imageability*
model — players build mental maps from **paths, edges, districts, nodes, and landmarks** — so a
readable dungeon gives identifiable instances of each rather than uniform geometry (The Level
Design Book, *Wayfinding*; **high — the standard reference**). A landmark guides best when it has
**singularity**: clear form, contrast with surroundings, prominent placement — and a distant
visible target (a "weenie," from Disney park design) pulls players toward goals and reduces
disorientation (same source; **high**).

**Loops + unlockable shortcuts beat backtracking.** The Souls-like pattern converts a straight
route into a circle so a later shortcut yields a "how did I get back here?" revelation instead of a
tedious return trip; the shortcut *itself* is a reward, and opening it recontextualizes the space.
Interconnected levels orient around a **central hub** (Firelink Shrine) that paths radiate from and
loop back to (Bramasole *Souls-like Methodology* + TheGamer Dark Souls analysis; **high —
corroborated, canonical example**).

**Branch early, funnel late.** Choice-density should taper from branching toward linear right
before the boss, so exploration freedom front-loads and the climax streamlines to manage fatigue
(Bramasole; **medium — single analyst, but coherent**).

**Non-linearity is measurable and a design choice, not automatically "good."** Mark Brown's *Boss
Keys* graphs dungeons by rooms/keys/locks and shows that constraining the player to one usable
locked door at a time (*Ocarina of Time*) produces a more linear graph than letting them choose
where to spend a key (GMTK / Patreon methodology; **high — analyst's own method**).

**A map is nearly a prerequisite for a non-linear dungeon.** *Etrian Odyssey*'s manual
map-drawing — auto-coloring traversed tiles plus player-placed icons — is the mechanism that keeps
players oriented in dense maze floors, and it works *because* it tolerates personal, non-standard
marking (Retronauts; **high**). The widely-mocked failures are the inverse: teleporter-warp mazes
with same-looking destinations (FF I Citadel of Trials) and dead-end mazes with **no in-game map**
(FF XII Great Crystal) — though these specific examples are fan-wiki/community-ranking sourced
(**low — sentiment, not design authority**).

**Cut dead space.** The recurring pacing rule (Angry GM, tabletop-framed but transferable): never
chain two "fast" combat beats without a "slow" decision beat between, and **almost every node
should pose a real choice** — long choiceless corridors are the specific thing to delete (**medium
— respected author, TTRPG context**). *FF XIII*'s "corridor" dungeons are the canonical modern
criticism of the opposite, though reception is genuinely contested (some read linearity as
comfortably guided) — so **linearity is a tradeoff to tune, not a sin** (**low/medium — mostly
opinion outlets, but the polarized reception is real**).

**Segment long dungeons.** Practitioner rule of thumb: break a dungeon into a handful of distinct
sub-areas (TTRPG figures land around ~3 maps / ~7 rooms each) so the run has internal milestones
rather than one undifferentiated slog (**low — TTRPG numbers, directional only**).

**→ Gaia.**
- Our `genMap` in `controllers/field.ts` should **shape space with distinct tile landmarks** (a
  vista, a unique room, a water feature) per zone — not uniform tiling. This already aligns with
  the **level-designer** agent's OPEN-WORLD rule (interconnected/looping, never a corridor with
  spurs) and ADR 0008's seamless world.
- **The Drowned Vault wants a hub-and-loop shape with an unlockable shortcut** back toward the
  entrance/rest node, plus a clear "weenie" (the boss gate visible from afar) to orient toward.
- **Branch early, funnel late:** Greenvale = roam/branch; the Vault tightens as it descends to the
  Cave Troll. Keep the run-up to the boss legible.
- Because we draw the field on a Canvas minimap, **lean into our map as the anti-frustration tool**
  — that's the license to build a non-linear Vault at all.

---

## 3. Puzzles & gimmicks — how much belongs in a combat/loot RPG

**The Zelda model is the reference, but it's a different genre.** Zelda dungeons (attributed to
Aonuma) center each dungeon on one or two puzzles built around a newly acquired item that escalates
in difficulty, with the boss beaten using that item — the item is the "new key" (Game Developer,
*Depicting the Level Design of a Zelda Dungeon*; **high**). The JRPGs that borrow this — *Golden
Sun*, *Lufia II*, *Wild Arms* — are praised when puzzles are "not too difficult, not too easy" and
embedded in the space (TheGamer; **high**).

**But puzzles fail JRPGs in two specific ways.** (1) *Golden Sun*'s wide Psynergy puzzle set
collapses to one repetitive solution (block-pushing "Move"), and solving puzzles forces tedious
ability-swapping/backtracking — a wide mechanic reduced to busywork (RPGFan review; **high**). (2)
In random-encounter JRPGs, **combat interrupting puzzle-solving creates drudgery** ("endurance
tests") — the most common player complaint (ResetEra/RPG Codex; **low — forum sentiment, but
consistent and worth heeding**). Player preference skews to *light* puzzle content — a couple of
minor puzzles, a secret, a riddle — because over-stuffing "messes up the flow."

**Diablo-likes deliberately exclude puzzles.** ARPGs engineer an uninterrupted **slay → loot →
sell → chase** loop where flow comes from continuous combat/movement, not environmental
problem-solving (Fextralife + cxong; **high — consistent across sources & matches the genre**).
The bite-sized middle ground that works in combat-forward JRPGs is *FF X*'s "Cloister of Trials" —
small environmental puzzles as **variety bookends** between combat, not the main course (**medium —
factual, forum-sourced**).

**Flow theory underwrites the limit.** Engagement needs challenge≈skill (the "flow channel"); too
little bores, too much creates anxiety — and **varying activity type** is an explicit lever against
boredom over a long game (Game Developer, *The Flow Applied to Game Design*; yukaichou; **high**).
So puzzles' real job is *variety*, and they must be tuned for difficulty just like combat is.

**→ Gaia.**
- **Gaia leans Diablo (loot loop) + JRPG (party/affinity), not Zelda.** Keep puzzles *light and
  optional*: gates that want a key/lever, a hidden-passage secret, a simple environmental gimmick
  per dungeon as flavor. **Do not** build obtuse puzzle-dungeons or anything that forces
  ability-swapping busywork — it fights our combat/loot core.
- The principle to actually steal from Zelda is **"one signature mechanic per dungeon"** as a
  *variety* tool (a Drowned-Vault water/flood gimmick, a Warren collapse), not a puzzle gate.
- Never let a random/ambient encounter interrupt mid-puzzle (the JRPG drudgery trap) — if we add
  any puzzle node, make its immediate tile safe.

---

## 4. Reward placement & risk/reward (and how loot reshapes the dungeon)

**The loot loop is the reward engine — design the dungeon around it.** Diablo's designers model
loot as a **slot machine**: killing enemies is "pulling the lever," mundane drops punctuated by
rare dopamine payouts, and they attribute replayability specifically to *randomized* drops vs.
fixed predictable rewards (TheGamer, *Diablo 2 Designers Talk Addictive Loot* — Schaefer/Brevik
quotes; **high**). *(Note: the often-cited Brevik "20 years later" Game Developer piece is actually
about real-time combat and accessibility — the loot-loop quotes come from the D2 interview, not
that article. Verified by direct fetch.)*

**Variable-ratio reward schedules drive the engagement.** Rewards delivered after an unpredictable
number of actions produce higher, steadier engagement and resist extinction better than
predictable fixed-ratio rewards; the design convention is **fixed-ratio for common actions (XP per
kill), variable-ratio for the loot/drop layer** (Game Developer, *Reward Schedules*; **high/medium**),
and the *rarity* of a payout — the unpredictability itself — is the reinforcer, with peer-reviewed
work showing rare drops trigger larger arousal/reward responses (PMC study; **high — title-level**).

**Tune reward density — more is not better.** Research on open-world treasure chests finds players
shift from open exploration to targeted chest-hunting over time, and **overexposure to chests
causes rapid fatigue/disengagement** — reward density must be tuned, not maximized (ScienceDirect
2025; **medium — abstract-level, paywalled body**). Chests split into "system-awarded" (can't
decline) vs. "player-explored" (optional, off the path) — the **player-explored** type is what ties
exploration to reward.

**Risk/reward on side-paths; difficulty as the gate.** FromSoftware uses **difficulty itself as
the guide** — wander into a high-reward area early and get slaughtered — creating organic risk/
reward without explicit barriers (Miyazaki, via Medium analysis; **medium**). Keep exploration
paying out: a high density of small enticing rewards (a visible chest, ruins, a risky enemy) is
what stops "plain" terrain feeling tedious; exploration should consistently pay meaningful content,
never empty space. And a **shortcut or new vista can feel as rewarding as a boss** (same source).

**Optional bosses must guard better loot.** Convention: optional bosses are tuned harder and guard
the best/exclusive rewards — an optional boss with no loot actively *discourages* the fight, and
the strong incentive stacks vectors (unique loot + big XP + completion), since a marginal stat
upgrade alone is weak (TV Tropes / Game Rant; **low — convention/enthusiast, but directionally
sound**).

**→ Gaia.**
- This is Gaia's strongest existing alignment. Our **affix loot + rarityBand + ilvl scaling** (in
  `systems/loot.ts`) *is* the variable-ratio engine; **XP/MNA per kill is the fixed-ratio
  baseline**. Keep that split.
- **Place chests as "player-explored" off the critical path**, gated by *difficulty* (a champion
  pack or risky detour) rather than locks — the side that "costs" something should pay
  categorically better than the path (deeper ilvl / higher rarity-band roll).
- Our **rare "treasure" monsters** (Hogger tier) are exactly the slot-machine jackpot beat — keep
  them as earned spice, low encounter-replace rate.
- **Don't carpet the Vault in chests.** Tune density so exploration is rewarded but not trivialized
  (the fatigue finding). The **merchant buy-back** is the deliberate low-intensity reward valley.
- Make the **boss gate / mini-boss** worth the climb with a visibly better drop (rarity-band bump),
  and treat **finding the shortcut/rest node** as its own reward.

---

## 5. Difficulty curve, boss gating & reinforcing party/affinity strategy

**Teach, then test.** Nintendo's four-beat (kishōtenketsu) level structure — **introduce** a
mechanic safely, **develop** it, add a **twist/combination**, then a **conclusion** — escalates
difficulty without explicit tutorials, and the boss is the test of the just-taught skill (GMTK,
*Super Mario 3D World's 4-Step Level Design*; **high**). A boss works best as a **knowledge-check**
on the tools the dungeon rehearsed — so dungeon encounters should drill the exact tools the boss
demands (GMTK body of work; **medium**).

**Sawtooth the curve.** Escalate tension, then briefly release (safe room, easy fight, save point)
before the next climb — a rising sawtooth, not a monotonic ramp — with a **mid-point mini-boss as a
checkpoint/difficulty preview** before the climactic boss gate (Level Design Book pacing + common
JRPG convention; **medium/low**).

**Telegraph for fairness.** Telegraphing — a readable pre-attack wind-up (animation/SFX/VFX) — is
what makes combat fair: without a signal of "what question the enemy is asking," failure feels
arbitrary rather than earned, and bosses follow a **telegraph → attack → recovery** cycle players
learn by exposure (Game Developer, *Enemy Attacks and Telegraphing* + Psychonauts 2 boss piece;
**high**). Bosses can be built from **modular maneuvers** (each a telegraph-attack-recovery unit)
recombined and escalated across phases (**high/medium**). Telegraph windows should **scale with the
punishment** — the more decisive the move, the longer/clearer the wind-up.

**Make encounter composition push strategy.** SMT's **Press Turn** makes elemental knowledge the
central risk/reward axis: hitting a weakness/crit grants an extra action, a **miss costs two
icons**, and a **null/block/reflect/absorb ends your whole turn** — and the rules apply
**symmetrically to enemies**, so an exposed party weakness can be chained into a wipe (CBR; **high
— multi-sourced**). This forces parties to cover elements both offensively and defensively. The
design is most interesting when **weakness info is scarce** so guarding/passing is a real choice
(NeoGAF; **medium**). FF's elements come in **opposing pairs** (Fire↔Ice, Lightning↔Water) to give
a learnable rule, and enemy traits (flyers immune to melee, etc.) push players to vary attack type
(Jegged/PC Gamer; **high/medium**).

**Rows guide composition.** FF's **front/back row** is asymmetric: back row **takes ½ physical**
but **deals ½ melee** (ranged/magic unaffected), so the natural build is tanks front, casters/
ranged back — but **magic/elemental attacks bypass rows entirely**, so a dungeon can pressure a
back-heavy party by leaning on magic. Re-forming costs a turn (friction that got the mechanic cut
in later FF) (gamegrinder FFV analysis; **high**). FF X demands roster diversity by making each
character strong vs. specific enemy types and allowing **mid-battle swaps** (FF Wiki; **medium**).

**Keep introducing new challenges.** Don't let 3–4 early tricks carry the whole game — later zones
should introduce multi-phase encounters and minibosses scaled to progression (rpgcodex/blog;
**low — sentiment, but standard**).

**→ Gaia.**
- **Compose packs to teach the Attunement ring.** Per CLAUDE.md the boss matchups are already
  deliberate (Kingpin **SOL-infused**, Cave Troll **NOX-infused**). Build the dungeon's encounters
  to *rehearse* that final matchup: introduce the boss's Attunement on trash mobs first, then the
  mini-boss, then the boss = **teach → develop → test**. This is the **encounter-designer** agent's
  "teach one, then combine" pacing, made concrete.
- **Our affinity ring is gentler than Press Turn (±15%, no turn-economy swing)** — by design (Dara
  ratified ±15% so gear/skill matter more than matchup). So don't import Press Turn's punishing
  asymmetry; instead use **enemy composition** as the strategy prompt: a pack all of one Attunement
  rewards the right counter; a **mixed-resistance pack punishes a mono-Attunement party**, nudging
  comp diversity without a hard wall. Reconcile toward REQUIEM, surface conflicts to Dara.
- **Exploit our front/back rows the same way.** We already shield the back line; a dungeon that
  leans on **AoE / back-line-reaching threats** (or casters) pressures lazy formations — a natural
  difficulty lever that rewards thoughtful row placement.
- **Mini-boss as checkpoint + difficulty preview** before the boss gate — our zones already have
  `mini`/`miniAdds` and `boss`; sawtooth the curve into them.
- **Telegraph boss attacks.** Even in ATB, give big enemy moves a readable wind-up (a charge state /
  cast bar / VFX tell) so a wipe reads as the player's mistake — and **scale the tell to the
  punishment**. Build bosses from a few **modular, telegraphed maneuvers** that escalate across HP
  phases.

---

## Anti-patterns to avoid (the "don'ts")

- **Don't** run a constant high-intensity gauntlet with no breather — players go numb. *(§1)*
- **Don't** over-supply healing/MP/items — it removes the only real tension and makes fights a time
  tax. *(§1)*
- **Don't** choke optional/branch paths with guaranteed encounters — it kills the exploration the
  path exists to reward. *(§1)*
- **Don't** ship a non-linear maze without a map, or teleporter mazes with identical destinations. *(§2)*
- **Don't** leave long choiceless corridors ("dead space") or a pure there-and-back backtrack — use
  loops/shortcuts. *(§2)*
- **Don't** build obtuse/puzzle-saturated dungeons or force ability-swap busywork — it fights our
  combat/loot core; keep puzzles light, optional, and never interrupted mid-solve by a fight. *(§3)*
- **Don't** carpet the dungeon in chests — reward density causes fatigue; off-path/optional and
  difficulty-gated rewards should pay *categorically* better. *(§4)*
- **Don't** gate an optional boss/detour behind risk and then under-reward it. *(§4)*
- **Don't** spike difficulty without telegraphing, or skip the teach-then-test ramp into the boss. *(§5)*
- **Don't** let 3–4 early threats carry a whole zone — keep introducing/combining new ones. *(§5)*

---

## How this maps onto Gaia's pipeline

| Principle area | Owning agent / file |
|---|---|
| Layout, tile grammar, loops, landmarks, shortcuts, rest nodes | **level-designer** → `controllers/field.ts` (`genMap`), `data/zones.ts` |
| World shape / inter-zone connections (seamless, ADR 0008) | **world-cartographer** → world-graph |
| Encounter cadence, pack composition, teach-then-test, Attunement lean, rare-monster placement | **encounter-designer** → `data/zones.ts` (`bands`/`sets`/`mini`/`boss`), `RARE_MONSTERS` |
| Affix pool, chest/loot identity, chase items | **itemization-designer** → `data/items.ts`, `systems/loot.ts` |
| Difficulty numbers, reward density, MP/heal economy, pacing targets | **balance-tuner** → `data/enemies.ts`, `data/zones.ts`, `balance-sim.ts` |
| Boss/ability mechanics & telegraphing, class kits the dungeon tests | **class-designer** (Dara owns design) → `data/skills.ts`, `data/classes.ts` |
| Lore/flavor of the space, signature dungeon gimmick framing | **requiem-canon-keeper** / **narrative-writer** |

**Verification:** dungeon pacing/difficulty is validated by the headless **balance sim**
(`npm run sim`) against the design targets (end-of-fight party HP ~55–75%, bosses ~30–50%,
full-clear wipe <~10%, finish ~L10). A dungeon that leaves the party near-full HP at the boss gate
is under-paced (a "time tax"); one that wipes the party on trash is over-spiked.

---

## Source confidence ledger

**Designer-grade / primary (high trust):** The Level Design Book (pacing, wayfinding); Game Maker's
Toolkit / Boss Keys (Mark Brown — teach-then-test, non-linearity graphs); Game Developer/Gamasutra
(telegraphing, reward schedules, flow, Zelda dungeon level design); shmuplations *Chrono Trigger*
1995 developer interview (primary); RPGFan (Golden Sun critique); Retronauts (Etrian Odyssey
mapping); TheGamer *Diablo 2* designer interview (Schaefer/Brevik loot quotes); CBR (Press Turn
mechanics); gamegrinder (FF row analysis).

**Medium:** Significant Bits & Aevee Bee/Medium (focused design essays); FromSoftware world-design
Medium analysis; ScienceDirect treasure-chest study (abstract-level, paywalled); Persona safe-room
rationale (games press); various Final Fantasy Wiki mechanic pages.

**Low — treat as sentiment, not doctrine:** ResetEra / RPG Codex / NeoGAF forum threads (puzzle
drudgery, weakness-loop critique, difficulty curve); TheTopTens / TV Tropes / opinion blogs (worst-
dungeon rankings, optional-boss conventions, FF XIII linearity debate).

**Adversarial corrections made:** the loot-loop/slot-machine claims were re-attributed from the
Brevik "20 years later" article (which is actually about real-time combat + accessibility) to the
separate *Diablo 2* designers interview, confirmed by direct fetch. shmuplations and several wikis
blocked direct fetch, so those claims rest on search snippets and are flagged accordingly.
