# Gaia art pipeline — START HERE (resume guide)

Read this when you come back to finish the character art. Everything you need to flip
"clean equip" on is here; the detailed contracts are in the two linked docs.

## Design directive — the weapon IS the character (Dara)

**Class is determined by the equipped weapon** (REQUIEM canon — see
[`docs/design/requiem/mna-progression.md`](../design/requiem/mna-progression.md)): a SOL
Two-Handed Sword makes you a Starbreaker. So the weapon must **read instantly and dominate the
silhouette** — render weapons **big, prominent, and over-the-top**, oversized relative to the
body, the first thing the eye lands on. When in doubt, scale the weapon *up*. This applies to
the battle paper-doll and (later) loot/equip art.
- The knob already exists: `RIG.weapon[archetype].scale` in
  [`app/src/data/art.ts`](../../app/src/data/art.ts) (a fraction of the doll-box width). Today
  it's a tasteful ~0.8–0.95; the directive is to push it well past 1.0 (hero-sized weapons)
  once real grip-ready weapon art exists, and to tune per archetype in
  [`rig-spec.md`](rig-spec.md).
- Generated/sliced weapon art should be drawn to be legible and impressive at large scale
  (heavy gold-on-dark, strong rarity glow), not dainty.

## What's already done (no action needed)
- The **paper-doll engine** is built and live (ADR 0004): characters render as stacked
  layers — body + armor + weapon + fx — and **equipping swaps a layer**.
- It's **art-gated and falls back safely**: a missing layer degrades to the previous look,
  no code change.
- **Weaponless SOL bodies are in** (v0.21). The four SOL heroes (`dawnguard`, `sunblade`,
  `lightkeeper`, `dawnchaser`) are now sliced from the **45-class base-model grid**
  (`assets/reference/class-base-models-45.png`, SOL row) — empty-handed figures — so the
  doll overlays the equipped weapon on a clean hand. They replaced the old pre-equipped
  portraits. (`slice-art.py`, `HCOL`.)
- **Per-attunement weapon art is in** (v0.21). The painterly loot sheets are sliced to
  `items/{stem}-{att}-{rarity}.png` (Sword & Shield, Staff, Spellblade × 5 attunements × 6
  rarities); `ui/render.ts weaponArt()` prefers the attunement match and falls back to the
  SOL-keyed file. So a NOX blade now shows NOX art instead of borrowing SOL's.

## What's pending
- **Weaponless bodies for the other 41 classes** — only the SOL row is sliced today. The
  remaining four attunement rows of the base-model grid (NOX/ANIMA/QUANTA/UMBRAXIS × 9
  archetypes) can be sliced the same way when those heroes exist. (The "decked" grid,
  `class-concept-decked-45.png`, is **aspirational reference only** — what a fully-geared
  class should look like — not a slice source.)
- **Dual Swords** has no painterly multi-attunement sheet yet, so it still uses the SOL-only
  slices from the original loot chart (every attunement falls back to SOL art for now).
- **Armor layers** — a nice-to-have after bodies, same system.

## How to make them — two paths

### Path A — ChatGPT (uses your Teams seat, no API key, recommended)
ChatGPT Teams ≠ the OpenAI API. Your Teams seat has **no API key**, but its **chat-UI image
generation can edit from a reference image**, which is all we need.
1. Open ChatGPT, **upload one reference figure** (the 4 are in `app/assets/heroes/`:
   `dawnguard.png` = Sword & Shield, `sunblade.png` = Dual Swords, `lightkeeper.png` = Staff,
   `dawnchaser.png` = Spellblade).
2. Paste this prompt:
   > "Use this character as reference. Redraw the **same** character — same armor, pose,
   > colors, and painterly gold-on-near-black style — but **holding no weapon**, main hand
   > open at their side. Full body, centered, **transparent background**, no shield, no
   > ground, no text."
3. Download the PNG. Repeat for all four.
4. Hand the 4 PNGs back to me (or drop them in `app/assets/bodies/{id}.png`). I run the
   background-clean pass and register them — done.

### Path B — OpenAI API (automated, for scaling to more classes/armor later)
Requires a **separate OpenAI API account + key** (a few cents per image), independent of
ChatGPT Teams. Set `OPENAI_API_KEY` in the environment and ask me to build
`app/tools/gen-art.py` — it reads the prompts here + the rig spec and generates the layers
(weaponless bodies, then armor) directly into `app/assets/`.

## Field map (walking around a zone)
The top-down walkable field is the last placeholder system (Canvas rects + emoji). The asset
checklist — Greenvale tileset, dungeon floor, markers (chest / gate / entrance / merchant), and a
top-down player walker — is in **[`field-map-brief.md`](field-map-brief.md)**.

## The contract the art must meet
See **[`rig-spec.md`](rig-spec.md)** — shared canvas, feet/hand anchors, slot z-order, file
naming. And **[`layer-art-brief.md`](layer-art-brief.md)** — per-class prompts + the armor
recipe. Files land at:
- `app/assets/bodies/{id}.png` — weaponless body (register in `BODY_LAYER` in `app/src/data/art.ts`)
- `app/assets/armor/{id}/{rarity}.png` — armor over-body (register in `ARMOR_LAYER`, same file)

## Armor (later, same model)
Once bodies exist, armor is just another layer drawn over the body on the same canvas.
Generate per class + rarity with the armor prompt in the brief, drop in, register. No engine
work.

## One-line handoff to me
"Here are the weaponless bodies" (attach PNGs) → I clean + register → clean equip is live.
Or: "Here's an OpenAI API key in the env" → I build the generator and do it automatically.
