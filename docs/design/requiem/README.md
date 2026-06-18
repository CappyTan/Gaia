# REQUIEM — canonical class & combat design (Dara)

**REQUIEM** is Dara Saadat's Attunement Combat System for Gaia: **45 base classes** (5
attunements × 9 weapon archetypes), **250 abilities**, **45 ultimates**. This folder is the
faithful capture of that design — not an interpretation.

## Files
- **`requiem-compendium.source.html`** — Dara's compendium, verbatim. Source of truth.
- **`parse-requiem.js`** — deterministic parser. Re-run after any source update: `node docs/design/requiem/parse-requiem.js`
- **`classes.json`** — structured extraction (attunements + every class + every ability with type/cost/description). What the game/tools read.
- **`REQUIEM-classes.md`** — human-readable compendium generated from the JSON.
- **`battle-mechanics.md`** — Ascension · Soul Burn · Harmonic Ascension (combat-systems layer above the class kits). Captured from Dara's notes; not yet in the compendium HTML.

Everything in the JSON/MD comes straight from the HTML via the parser — nothing invented or
edited by hand. Open `requiem-compendium.source.html` in a browser for Dara's filterable view.
The current source (250 abilities) is the more complete revision — earlier ability text that
was truncated is now full.

## The five attunements (each has its own mana mechanic)
| Attunement | Domain | Mana mechanic |
|---|---|---|
| **Sol** | Expansion · Light · Fire · Entropy | scales damage output (up to +60% at 200) |
| **Nox** | Preservation · Cold · Darkness · Order · Anti-Entropy | scales damage output (up to +60% at 200) |
| **Anima** | Life · Purpose · Evolution · Vitality | scales healing potency (up to +60% at 200) |
| **Quanta** | Probability · Time · Observation · Possibility | scales SPD / Turn-Order priority |
| **Umbraxis** | Gravity · Spacetime · Singularities · Cosmic Structure | scales Defense / Damage reduction |

## Class shape
Each class = one **attunement** × one **weapon archetype**, with a **role** and a unique
**resource** (e.g. Radiance, Solar Charge, Entropy Debt, Lagrange Nodes), and an ability kit:
a **Passive**, two–three **Basic**s, one–two **Signature**s, and one **Ultimate** (some cost
RES/MP, some generate it). 9 weapon archetypes: Sword & Shield, Dual Swords, Two-Handed Sword,
Hammer, Dual Daggers, Dual Pistols, Rifle, Staff, Spellblade.

## Relationship to the playable POC
The game (`app/gaia.html`) is an early vertical slice. Its current party uses the four **SOL**
classes from this compendium (**Dawnwarden** S&S, **Sunblade** Dual Swords, **Heliomancer**
Staff, **Starforge Knight** Spellblade — the figures sliced for the battle screen). The POC's
combat (a simple affinity ring + per-attunement "signature effect", invented placeholders) does
**not** yet implement REQUIEM's actual mana mechanics, resources, or ability kits — reconciling
the game to this canon is open follow-up work, tracked here so the canon is the reference.
