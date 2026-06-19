# Field-map art brief — "walking around Greenvale"

What's needed to replace the placeholder **field map** (the top-down zone you walk through, e.g.
Greenvale) with real art. Everything else in the game now has art; this is the last
emoji/rectangle system. Pairs with the painterly battle backgrounds already wired
(`app/assets/backgrounds/`) — the field should read like the *same world* you then fight in.

## What's there now (placeholder)
`app/src/controllers/field.ts` draws the map on a **Canvas**: flat colored rectangles per cell +
emoji glyphs. Tile size is variable (`tile = max(28, min(w/13, h/9))` ≈ 28–70px depending on
screen). Cell types and their current placeholders:

| Cell | Placeholder | Passable |
|---|---|---|
| `grass` | green rect | yes |
| `path` | tan rect (the road east) | yes |
| `tree` | 🌲 on dark-green (the walls/borders) | **no** |
| `bush` | 🌿 (decoration) | yes |
| `chest` | 📦 | yes (opens loot) |
| `miniboss` | 🪖 (the gate guardian) | triggers fight |
| `boss` | ⛺ / 🏴 (dungeon end) | triggers fight |
| player | 🧝 with a gold ring + chevron | — |
| dungeon (east of the gate) | same tiles, tinted stone | — |

## The art we need

**1. Greenvale tileset** — square, **tileable**, top-down (or gentle ¾). Base **64×64** (Canvas
scales it). Match the lush-green painterly Greenvale + the gold-on-dark UI; readable at ~32px on a
phone.
- `grass` (1–3 variants to avoid obvious repetition), `path`/road, `tree` (impassable; can overhang
  its tile), `bush`/foliage, plus optional decor (flowers, rocks, stumps).
- A subset of these per zone later (Duskmarsh = swamp), but **Greenvale first**.

**2. Dungeon floor variant** ("The Bandit Warren", east of the gate) — stone/packed-dirt versions
of grass/path/wall so the dungeon reads distinct from the overworld.

**3. Map objects / markers** — transparent PNGs drawn over a ground tile (~48–64px):
- **Treasure chest** — closed + opened states.
- **Mini-boss gate** — a barricade/banner that reads as "blocked until you win."
- **Boss / dungeon entrance** — a cave mouth or bandit camp.
- **Merchant** — a stall/NPC (enables the walkable shop you wanted, vs. the current auto-popup).

**4. Player walker** — the genuinely new asset. A top-down sprite for the party lead.
- Minimum: **one** clean top-down pose. Ideal: **4 directions × 2 walk frames** (8 frames) for a
  real walk cycle. ~48–64px, transparent, gold-on-dark, with a clear "you are here" silhouette.
- Note: the 45-class base models / concept art are battle/portrait poses — they don't cover a
  top-down overworld walker, so this needs to be made fresh.

## Style anchors
- Match the painterly terrain backgrounds (same Greenvale palette) and Dara's gold-on-dark world.
- Crisp/legible at small size on mobile; the player must always pop against the ground.

## How it wires (no engine rewrite)
- Drop assets at `app/assets/field/{grass,path,tree,bush,chest,...}.png` and
  `app/assets/field/player-{dir}-{frame}.png`; they resolve at runtime via the existing
  `import.meta.glob` resolver (`core/assets.ts`).
- `field.ts draw()` swaps `fillRect`/emoji for `drawImage` per cell, **keeping the emoji/rect
  fallback** so the map never breaks if a tile is missing (same pattern as the battle backgrounds).
- If delivered as one sheet, the art-integrator agent calibrates `slice-art.py` (verify with
  `--preview`); individual transparent PNGs can be dropped in directly.

## Minimum viable drop (highest impact, least art)
A **Greenvale tileset (grass/path/tree/bush)** + **one top-down player sprite** + **chest** already
transforms the field from emoji to hand-crafted. Markers and the dungeon variant can follow.
