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

**Attunement**:
One of the five mana types a Class draws from: **SOL, NOX, ANIMA, QUANTA, UMBRAXIS**. The
"Five Powers." Determines a Class's elemental flavor and affinities.
_Avoid_: element, school, mana type (when you mean the named five).

**Weapon Class**:
One of the nine weapon archetypes that defines how a character fights: Sword & Shield,
Dual Swords, Two-Handed Sword, Hammer, Dual Daggers, Dual Pistols, Rifle, Staff,
Spellblade.
_Avoid_: "class" unqualified (ambiguous — see Flagged ambiguities).

**Class**:
A specific **Attunement × Weapon Class** combination. There are 45 (5 × 9). Example:
the Umbraxis Dual-Daggers class ("the Lagrangian"). These are Dara's classes.

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

**Signature effect**:
The status/effect flavor tied to each Attunement (e.g. SOL = Burn/Blind). Distinct from
the affinity ring; the ring governs damage multipliers, the signature effect is what an
attunement's skills tend to *inflict*.

## Flagged ambiguities

- **"Class"** is overloaded. Dara's grid has 9 *Weapon Classes* (columns) and 45 *Classes*
  (each cell = Attunement × Weapon Class). When precision matters, say "Weapon Class" for
  the archetype and "Class" for the full combination.
- **"Tier"** often means loot quality in other games. In Gaia, loot quality is **Rarity**,
  not tier. Keep "tier" out of the loot vocabulary.

## Example dialogue

> **Dev:** The Bandit Brute drops something — what rarity?
> **Designer:** Boss, so roll Rare-or-better. Say it lands Epic.
> **Dev:** Epic gives it more affixes. What's the item?
> **Designer:** A SOL Sword & Shield — "Solar Flare." So the weapon is bound to the SOL
> Attunement and the Sword & Shield Weapon Class, Epic rarity, with three rolled affixes.
> **Dev:** And the character who can use it?
> **Designer:** Any Sword & Shield Class can equip it, but a SOL character gets the
> attunement bonus on top.
