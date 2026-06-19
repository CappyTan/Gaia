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
- It's **art-gated and falls back safely**: with no weaponless-body art yet, it uses the
  current figure as the body and attaches the equipped weapon at the hand. The moment the
  art below exists and is registered, equip becomes fully clean **with zero code change**.

## What's pending (the one gating thing)
**Weaponless body bases** — one per class. Today's hero figures have the weapon painted in,
so nothing can be truly "clean" until we have figures with an empty hand. (Armor layers are
a nice-to-have after that, same system.)

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
