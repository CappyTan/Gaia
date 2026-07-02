# Crafting Schema & Consumables — reconciled canon (from Dara's sheets, 2026-07-02)

> **Status: ratified direction, staged implementation.** Source: Dara's "Requiem Crafting Schema" +
> "Requiem Consumables Table" sheets. Per Dara: the sheets are NOT absolute — **what's on `main` is
> canon**, and the sheets are amended to match. This doc is the reconciled record; the sheets stay
> reference art. Implementation lands in slices (see Staging).

## The core formula (as-sheet, confirmed)

**Item = Body + Attunement + Archetype + Modifier** — i.e. *Base Material + Attunement Essence +
Archetype Component + Modifier Catalyst*. Crafting composes the same axes the loot system already
rolls (slot/ilvl/rarity/affixes — ADR 0015), so crafted and dropped gear share one identity model.

## Reconciliations (sheet → main canon)

| Sheet says | Canon is | Ruling |
|---|---|---|
| Stat Catalyst "Arcane → **MGC**" | ADR 0013/0014: no Magic stat; **VIT** | Arcane Catalyst governs **VIT** |
| "2H Hammer" archetype naming | Archetype is **Hammer** | use canon names for the 9 archetypes |
| Rarity ladder Common→…→Artifact | matches ADR 0015 | ✓ as-is |
| Currency "Aether" in every recipe | Aether (◈) is the currency | ✓ as-is |
| "Cave Troll / Kingpin Ω" boss mats | both exist (`kingpin-omega` enrage) | ✓ as-is |
| Consumable "+MGC elixir" (Arcane Elixir) | **+VIT** | Arcane Elixir buffs VIT |
| Ward effects (Burn/Freeze/Rot/Phase/Gravity) | must map to the ADR 0016 status catalog | Burn Ward→`burn` resist · Freeze→`chill`/`frozen` · Rot→`poison`/`decay` · Phase Cleanser→QUANTA effects · Gravity Anchor→`drain`/pull |
| Stations: Blacksmith/Arcanist/Apothecary/Relic Scholar/Salvage Bench | only the town **smith** exists (placeholder) | Blacksmith = the existing smith, upgraded; the other four are future town services |

Everything else on the sheets (material families A–H, acquisition table, the 8 material uses,
the early-game Greenvale pool, consumable families/tiers) reads clean against main and stands.

## Material model (engine shape)

- **Materials are stackable non-gear inventory** (new `Material` kind: id, name, family, tier, icon).
- **Families** (from the sheet): salvage · attunement essence (per-Attunement × 4 tiers: e.g. Sol
  Ember → Radiant Shard → Sunfire Core → Entropy Heart) · archetype components · monster-family ·
  regional (Greenvale → **Greenvale Ironwood**) · stat catalysts · gems · ancient.
- **Acquisition:** combat drops (family+regional+attunement of the foe) · **salvaging gear** (by
  rarity) · **gathering nodes** (below) · bosses · exploration caches.
- **Uses** (the sheet's 8, staged): forge new gear · upgrade ilvl · increase rarity (ladder, with
  Rarity Catalysts) · reroll affixes (scrub/focus/preserve) · attune · temper (stat catalysts) ·
  socket gems · legendary reconstruction.

## Gathering nodes (WoW-style, Dara)

World-placed, interactable, respawning-per-visit nodes on the overworld/dungeons:

| Node | Yields | Where (slice) |
|---|---|---|
| **Ore Vein** ⛏️ | Iron Scrap / regional ore | Greenvale rocky edges |
| **Ancient Root** 🌿 | Greenvale Ironwood / ANIMA mats | tree lines, the Grove |
| **Spirit Bloom** ✨ | healing reagents (Lifebloom Seed) | meadows, near water |
| Crystal Outcrop · Ash Pile · Frozen Obelisk · Ruined Machine · Fallen Banner | gems / SOL / NOX / gears / battle mats | later zones (staged) |

Walk onto a node → gather (consumes the node this visit; persisted like POIs/chests).

## Consumables (slice = Greenvale-starter tier ♦)

From the Consumables Table, reconciled: **Health Tonic** (restore small HP — Lifebloom Seed + Beast
Sinew) · **Cleansing Tincture** (remove 1 negative status) · **Smoke Veil** (escape encounter) ·
the six **stat Elixirs** (Might STR / Grace AGI / **Arcane VIT** / Velocity SPD / Bastion DEF /
Vital HP — several turns) · **Wards** per the status mapping above · Attunement **battle items**
(Solar Flask etc. — Attunement-typed damage + signature status). Mid/late/rare tiers staged.

## Staging

1. **Slice (now):** materials inventory + 3 Greenvale node kinds + gathering flow + material drops
   folded into the early-game pool + **Health Tonic** craft/use via the smith ("Blacksmith" front)
   and Bag use.
2. Salvage bench + forge/upgrade/temper at the smith; consumable battle use.
3. Rarity ladder, rerolls, sockets/gems, attunement essences economy, remaining stations.
4. Legendary reconstruction + ancient materials (ties into the Ancient Ruins content).
