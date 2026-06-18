# Layer-art generation brief

How to produce the layer art the compositor needs (ADR 0004, contract in `rig-spec.md`).
Works **manually in the ChatGPT image UI** (upload the reference, paste the prompt, download
the PNG) or via an API tool. Reference-from-existing-art is what keeps it on-model.

## Output spec (every image)
- **Transparent background** (PNG with alpha). In ChatGPT: ask for "transparent background."
- **Full body, single figure, centered, feet near the bottom**, 3/4 front, facing left.
- Same **gold-on-near-black painterly** style as the reference. No text, no frame, no ground.
- Square-ish portrait canvas (it gets scaled into a 62×74 battle box).

## 1. Weaponless body bases  (the gating art — 4 files)
For each class, **upload the current figure** as the reference and prompt:

> "Use this character as reference. Redraw the SAME character, same armor, pose, colors and
> painterly style, but **holding no weapon** — main hand open/relaxed at their side.
> Full body, centered, transparent background, no shield, no ground, no text."

| Class id | Reference file | Note |
|---|---|---|
| dawnguard | `app/assets/heroes/dawnguard.png` | Sword & Shield knight — also remove the shield (shield becomes its own offhand layer later) |
| sunblade | `app/assets/heroes/sunblade.png` | Dual-blade duelist — remove both blades |
| lightkeeper | `app/assets/heroes/lightkeeper.png` | Staff mage — remove the staff |
| dawnchaser | `app/assets/heroes/dawnchaser.png` | Spellblade — remove the blade |

Save as `app/assets/bodies/{id}.png`. (I'll background-clean + register them.)

## 2. Armor over-body layers  (later)
Armor is a layer drawn over the body on the SAME canvas/registration. Prompt per class +
rarity tier, referencing the body:

> "Armor only, worn over this body: [rarity] SOL [class] armor — [common=simple, …,
> artifact=radiant blazing]. Same registration as the body, transparent elsewhere, just the
> armor pieces (chest/shoulders/legs). No character skin, no weapon, no background."

Save as `app/assets/armor/{id}/{rarity}.png`.

## 3. (Optional) Other attunements / classes
Same recipe scales to NOX/ANIMA/QUANTA/UMBRAXIS and the other weapon classes — reference
that cell from the class grid, swap the palette per attunement.

## Handoff
Drop the PNGs in the paths above and tell me — I run the background-clean pass and register
them in `BODY_LAYER` / `ARMOR_LAYER`. The compositor shows clean equip immediately.

> If you'd rather I generate these automatically: that needs an OpenAI **API** key (separate
> from a ChatGPT Teams seat) — set `OPENAI_API_KEY` in the env and I'll add `tools/gen-art.py`.
