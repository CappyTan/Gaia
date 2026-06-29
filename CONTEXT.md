# Gaia: A World of Five Powers

A turn-based RPG set in Dara Saadat's world of **Gaia**: Diablo-style loot, elite mobs
with random affixes, and a Final Fantasy-style battle screen. Dara owns the world, lore,
classes, and art; this project brings the gameplay mechanics. The proof-of-concept is a
single-zone vertical slice (**Greenvale**) delivering roughly one hour of play.

This file is a glossary of Gaia's domain language, nothing else. Mechanics decisions live
in `docs/adr/`; build/architecture notes live in the README and design docs.

## Language

**Gaia**:
The game world and the title (full title: _Gaia: A World of Five Powers_). The "Five
Powers" are the five Attunements.
_Avoid_: "IRL STONKS" (that is the group-chat name where the idea was born, not the game).

**REQUIEM**:
Dara's canonical class & combat system for Gaia ("Attunement Combat System"): 45 classes,
250 abilities, 45 ultimates. The authoritative capture lives in
[`docs/design/requiem/`](docs/design/requiem/README.md). The playable POC implements only a
small placeholder subset (see Flagged ambiguities).

**Attunement** (canon):
One of the five "Powers" a Class draws from, each with a **domain** and a **governing stat** — the
single primary stat its class abilities **scale from**. Per Dara, **all** of a class's outputs
(damage, healing, speed, defense, etc.) scale off that one stat, so **every class can perform in
every aspect of the game**; the attunement just sets which stat makes its abilities scale *best*. The
five main stats are **STR, AGI, DEF, SPD, VIT**. Each Attunement is one **stance on entropy** (its
combat *verb*), ratified alongside the mechanics framework ([`docs/design/attunement-mechanics.md`](docs/design/attunement-mechanics.md)):
- **SOL** — Expansion · Light · Fire · Entropy — *(stance: **Spread**)* — abilities scale from **AGI**
- **NOX** — Preservation · Cold · Darkness · Order · Anti-Entropy — *(stance: **Freeze**)* — abilities scale from **STR**
- **ANIMA** — Life · Purpose · Evolution · Vitality — *(stance: **Grow** — adaptive negentropy)* — abilities scale from **VIT**
- **QUANTA** — Probability · Time · Observation · Possibility — *(stance: **Collapse**)* — abilities scale from **SPD**
- **UMBRAXIS** — Gravity · Spacetime · Singularities · Cosmic Structure — *(stance: **Pull**)* — abilities scale from **DEF**
_Avoid_: element, school. Note attunement is per-class flavor + a scaling stat, NOT a damage
rock-paper-scissors (the ±15% affinity ring is a separate layer).
_Relationship to REQUIEM:_ the governing **stat** above (Dara's ruling) is what abilities scale
*from*; REQUIEM's per-attunement **MNA** mechanic (mana investment → +output, see
[`docs/design/requiem/`](docs/design/requiem/README.md)) is a separate amplifier, reconciled toward
this over time.
_POC note:_ the playable build currently uses `atk/armor/mag/spd` (+`hp/mp`), not the canonical
**STR/AGI/DEF/SPD/VIT** set — to be formalized/reconciled when stats are built out.
_VIT (canon):_ **VIT (Vitality)** is the ratified rename of the former **MGC ("Magic")** slot —
ANIMA's governing stat, fitting the Life/negentropy stance; it keeps that slot's substat role
(ability power / healing / debuff potency) and is also the **Staff** archetype's secondary.

**Scaling Tier** (canon):
How well an Attunement converts a given primary stat into **ability power**, best→worst: **S, A, B,
C, D** (S best; D minimal, ~5%). Each Attunement's **S** is its own stat; the rest follow the affinity
ring — walk it in the **beats** direction (you → prey → … → predator) assigning S→A→B→C→D, so **A =
your prey's stat, D = your predator's stat**. A low tier governs *ability scaling only* — the stat's
universal substats still help everyone. Full table + coefficients: [`docs/design/stat-system.md`](docs/design/stat-system.md).

**Fating / Fated** (canon — process named; mechanics WIP):
The **"Corrupted Attunement"** process applied to an item, named after *fate*: to **Fate** an item is
to corrupt/blend its Attunement and/or unlock **tier-breaking** stat scaling (raising a stat's
Scaling Tier for the wearer). A processed item is **Fated**. See [`docs/design/stat-system.md`](docs/design/stat-system.md) §7.

**The Five / the Pantheon** (canon):
The "gods" of Gaia ARE the five Attunements personified — **Sol, Nox, Anima, Quanta, Umbraxis** —
each the **leader/embodiment** of their Power and the head of its own **civilization and order**. The
Five all sprang from **one origin civilization** that **fragmented** into the five Powers. What kind
of life-forms they are is canonically **unknown** (energy made matter? pure energy? physical?). They
are the beings behind the lore's "the gods clashed" (the Sundering scars) and "but the gods came
first" (the underworld). Pantheon-scale — *above* Legendary Figures. Full record:
[`docs/design/pantheon.md`](docs/design/pantheon.md).
_Avoid_: treating "god" as a separate species from the Attunements — the gods *are* the Five.

**Weapon Archetype**:
One of the nine that defines how a character fights: Sword & Shield, Dual Swords, Two-Handed
Sword, Hammer, Dual Daggers, Dual Pistols, Rifle, Staff, Spellblade.
_Avoid_: "Weapon Class" (Dara's term is **Archetype**); "class" unqualified.

**Class**:
A specific **Attunement × Weapon Archetype** combination — 45 total. Each has a **role** and
a unique **Resource**, with an ability kit (Passive / Basic ×2-3 / Signature ×1-2 /
Ultimate). Example: the Umbraxis Dual-Daggers class **The Lagrangian** (resource: Lagrange
Nodes). Full roster in [`docs/design/requiem/REQUIEM-classes.md`](docs/design/requiem/REQUIEM-classes.md).

**Caster** (canon):
Not a stat and not a separate kind of power — a **delivery style**, defined by **Weapon Archetype**.
The **Staff** (and hybrid **Spellblade**) classes *project / externalize* their Attunement at range
(fields, bolts, channeled effects) rather than channeling it through a struck weapon. A caster's
"spell power" is simply its **Attunement governing stat** (a SOL Staff scales off AGI, an ANIMA Staff
off VIT) — there is **no "Magic" stat**, because every Attunement already *is* a form of channeled
power. The five stances on entropy define *what* a caster's projected power does (a SOL caster spreads
fire, a NOX caster freezes at range, …).
_Avoid_: treating "caster" as needing an Intelligence/Magic stat — in Gaia, magic is not a separate axis.

**Resource** (per Class):
The class-specific meter its abilities build/spend (e.g. Radiance, Solar Charge, Core Heat,
Entropy Debt, Lagrange Nodes). Distinct from MNA (attunement mana) and RES/MP costs.

**Rarity**:
A loot item's quality tier, lowest to highest: **Common, Uncommon, Rare, Epic, Legendary,
Artifact**. Higher rarity means bigger base stats and more random affixes (Diablo model).
_Avoid_: grade, level, tier (reserve "tier" for non-loot escalation if it ever appears).

**Affix**:
A randomly-rolled modifier on a loot item (e.g. +ATK%, +crit, attunement damage). Rarity
governs how many affixes an item can carry.

**Greenvale**:
The starter zone and the POC vertical slice. Its bestiary is five bandit enemies, levels
1-5: Highway Bandit, Thieves' Cutpurse, Marauder, Outlaw Archer, Bandit Brute (the boss).

**Party**:
The set of player-controlled characters taken into battle (FF-style, multiple characters
acting in turn order).

**Paper-doll**:
The character-rendering model (ADR 0004): a character is a stack of aligned **layers**
(back / body / armor / off-hand / main-hand / fx) on one shared canvas; equipping an item
**swaps a layer**. The **body** is the weaponless base pose; the **anchor** is the
normalized hand point a weapon attaches to.
_Avoid_: "sprite" for the whole character (it's composed of layers, not one sprite).

**Battle screen**:
The Final Fantasy-style combat view: party on the right, enemies on the left, a command
menu (Attack / Skill / Item / Defend / Flee), and an HP/MP status panel. Combat runs on
**ATB** (Active Time Battle): each combatant's gauge fills by SPD and it acts when full.
_Avoid_: combat, fight (fine in prose; "battle screen" names the specific UI).

**Elite**:
A normal enemy variant carrying one or two random **Affixes** (e.g. Frenzied, Vampiric)
and a guaranteed better loot drop. The enemy-side mirror of the loot affix system.
_Avoid_: boss (the Bandit Brute is the boss; elites are buffed normal enemies).

**Legendary Figure**:
A named, singular, mythic-scale being (human, monster, or non-human) that exists *above* the
ordinary power scale. **They are still bound by the affinity ring** — a NOX legendary is still weak
to a SOL legendary, etc. — but Legendary Figures vary **wildly** in raw power, so a figure powerful
enough **may overcome an affinity disadvantage by sheer power** (it doesn't *ignore* the ring; it
out-muscles it). Distinct from a **boss** (a zone gate fight) and a **rare/treasure
monster** (an encounter spice). Dara's canon, added over time. Roster +
first entry (The Last Lagrangian) in [`docs/design/legendary-figures.md`](docs/design/legendary-figures.md).
_Not yet in the POC._

**Signature effect**:
The status/effect flavor tied to each Attunement. Distinct from the affinity ring; the ring governs
damage multipliers, the signature effect is what an attunement's skills tend to *inflict*. Ratified
set (see [`docs/design/attunement-mechanics.md`](docs/design/attunement-mechanics.md)): **SOL = Burn**
(+ Blind/Spread) · **NOX = Stasis** (cold *cessation* — winding toward absolute zero, **not** rot;
engine keyword stays `decay`) · **ANIMA = Infestation** (living contagion) + **Evolution** · **QUANTA
= probability swings + Doom** (a *delayed, determined* hit — not a DoT) · **UMBRAXIS = Drain**.
_Avoid_: calling NOX's signature "Decay"/"rot" in design prose — it is **Stasis**.

**Objective**:
The player's current "where to go next" — the single active goal the world's *environmental*
guidance reflects (an NPC's directions, a signpost, the lit destination on the zoomed-out map).
Today it is always **derived** from run state (gates cleared, capabilities owned, known regions),
never authored; the term is deliberately **source-agnostic** so a future authored **Quest** can
supply one without renaming. Surfaced diegetically, not as a HUD quest marker.
_Avoid_: "quest" for the derived objective (see Flagged ambiguities).

**Known region**:
A region the player has either **entered** or been **told of** (e.g. an NPC naming a destination).
Gates what the zoomed-out overview map reveals — known regions show; unbuilt or unheard-of regions
stay fogged. Persisted in run state (the `OwnedCaps` pattern).
_Avoid_: using "discovered"/"visited" as synonyms — *entered* is a subset of *known* (you can know
a region from a rumor without having set foot in it).

**Traversal barrier**:
A band of terrain that reads as impassable (e.g. the **Sunless Gorge**) until the run owns the
**Capability** that opens it (the gorge's raft/bridge-kit → the `"gorge"` capability), after which a
clear crossing opens. The legible "see it now, reach it later" soft-gate.
_Avoid_: "wall"/"invisible wall" — a traversal barrier is capability-gated and always crossable once
the capability is earned (never an auto-warp).

**Ascension** (canon, per REQUIEM):
A proc effect that unlocks **Soul Burn**. Gear-gated — rare gear can force-cast it, and better
gear raises its proc chance and uptime. See
[`docs/design/requiem/battle-mechanics.md`](docs/design/requiem/battle-mechanics.md).
_Not yet in the POC._

**Soul Burn** (canon, per REQUIEM):
A risk/reward mode unlocked by Ascension: a character life-drains *itself* to amp output
(dps/hps). It raises throughput (attack speed, lower cooldowns, more dmg/healing/mitigation) and
jumps **mana proficiency** to unlock more powerful abilities. The design hook: it turns healers
into a *damage* enabler — a strong healer lets a burning ally push far past safe HP.
_Avoid_: confusing with the SOL "Burn" signature effect — different thing.

**Harmonic Ascension** (canon, per REQUIEM):
A two-player co-op super: two ascended players who **harmonize attunements** and proc Ascension
at the same instant produce power greater than the sum of their two mana attunements. Best
between same-attunement players (e.g. two Quanta Spellblades) but allowed across classes of the
same attunement. Built for synergized duos in raids/large fights, not solo DPS rankings.
_Not yet in the POC._

**Archon** (canon, per REQUIEM lore):
An attunement-mastery threshold — embodying a faction's ontology physically. **Type I** (Mortal
Mastery): 100 MNA in a single attunement. **Type II** (Dual Convergence): 100 MNA in two
attunements at once — a living paradox. **Type III**: intentionally mysterious, the path toward
the **Sixth Deity**. See
[`docs/design/requiem/battle-mechanics.md`](docs/design/requiem/battle-mechanics.md).
Reaching Archon Type I (100 MNA in one tree) is the moment a class's **Ultimate** unlocks.
_Not yet in the POC._

**MNA** (canon, per REQUIEM):
Per-Attunement mana — five pools (SOL/NOX/ANIMA/QUANTA/UMBRAXIS) forming a talent tree. MNA is a
**threshold, not a cast cost**: each ability requires a minimum MNA in its tree to be usable
(e.g. Solar Strike needs 10 SOL MNA). It also **scales output** (up to +60% at 200). MNA comes
from **intrinsic points** (~1/level, **player-assigned**, respec-able for gold) plus **gear**
(items grant MNA in specific trees). Distinct from **MP/RES** (what you spend to cast). See
[`docs/design/requiem/mna-progression.md`](docs/design/requiem/mna-progression.md).
_POC: reconciling toward it (MNA-gated abilities + output scaling)._

**Class = equipped weapon** (canon, per REQUIEM):
A hero's Class (Attunement × Weapon Archetype) is set by the **weapon they wield** — a SOL
Two-Handed Sword makes them a **Starbreaker**. A weapon's highest MNA tree is its Attunement and
sets the class flair. Swapping weapons swaps class (and its ability kit). This supersedes the
POC's fixed-class framing (ADR 0003) for the full game.
_Avoid_: treating a hero's class as fixed — it's weapon-driven.

**Sixth Deity** (canon, per REQUIEM lore):
A being or state beyond the five-faction (five-Attunement) framework, reached via the Archon
Type III path. No roster class attains it — "what lies beyond the game." Deliberately
under-defined.

## Flagged ambiguities

- **"Class"** is overloaded. There are 9 *Weapon Archetypes* (Dara's term) and 45 *Classes*
  (each = Attunement × Archetype). Say "Archetype" for the weapon family, "Class" for the
  full combination. ("Weapon Class" was earlier EA shorthand; Dara's canon is "Archetype".)
- **"Tier"** often means loot quality in other games. In Gaia, loot quality is **Rarity**,
  not tier. Keep "tier" out of the loot vocabulary.
- **"Quest" is reserved, not built.** The game has **no authored quest system yet**. Player
  direction comes from *derived* **Objectives** surfaced environmentally (NPC lines, signposts,
  the map highlight). The naming deliberately leaves room for an authored **Quest** layer later (a
  `Quest` would *supply* an Objective), but until then don't call the derived objective a "quest,"
  and don't add a quest engine without an ADR.
- **Canon vs. POC.** REQUIEM (`docs/design/requiem/`) is Dara's authoritative class/combat
  design — distinct per-attunement mana mechanics, per-class resources, full ability kits.
  The playable POC (`app/gaia.html`) currently uses an **invented placeholder** (a damage
  affinity ring + a single "signature effect" per attunement) and only the 4 SOL classes.
  When the two disagree, **REQUIEM is canon**; the POC is a slice to be reconciled, not the
  source of truth.

## Example dialogue

> **Dev:** The Bandit Brute drops something — what rarity?
> **Designer:** Boss, so roll Rare-or-better. Say it lands Epic.
> **Dev:** Epic gives it more affixes. What's the item?
> **Designer:** A SOL Sword & Shield — "Solar Flare." So the weapon is bound to the SOL
> Attunement and the Sword & Shield Weapon Class, Epic rarity, with three rolled affixes.
> **Dev:** And the character who can use it?
> **Designer:** Any Sword & Shield Class can equip it, but a SOL character gets the
> attunement bonus on top.
