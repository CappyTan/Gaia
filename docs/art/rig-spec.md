# Character rig spec (the layer contract)

Every character layer is authored to **one shared canvas with one registration**, or
nothing lines up. This is the contract the compositor (`renderDoll` in `app/gaia.html`,
ADR 0004) and all layer art must meet.

## Canvas & registration
- **Canvas:** 512 × 640 px (4:5), transparent background. (Battle renders it scaled down to
  a 62 × 74 box; authoring large keeps it crisp.)
- **Facing:** 3/4 front, facing screen-left (party stands on the right, faces the enemies).
- **Feet anchor:** figure stands centered horizontally, **feet at ~92% of canvas height**
  (small ground margin). Same footing for every layer so body/armor/weapon align.
- **Headroom:** top of head ~8% from the top.

## Anchors (normalized 0..1 on the box)
- **`hand` (main):** where the weapon attaches. Per class, in `RIG.hand` (gaia.html).
  Current values — dawnguard (0.34,0.60), sunblade (0.42,0.58), lightkeeper (0.30,0.50),
  dawnchaser (0.42,0.58).
- **`offhand`:** shield attach point (add when shields are layered).

## Layers / slots & z-order (back → front)
`back` → `body` → `armor` → `offhand` → `mainhand` → `fx`. Files are transparent PNGs on the
shared canvas. The `body` is **weaponless** (open/neutral hand at the `hand` anchor).

## Weapon transform
Per weapon-class in `RIG.weapon`: `scale` (fraction of box width) and `rot` (degrees).
Weapon art should be a clean side-on silhouette with the **grip toward the lower-left**;
v1 centers the art on the hand anchor, so keep the grip near the art's center-lower. (A
future `grip:{x,y}` per weapon will allow exact hilt placement.)

## File layout & naming (what the compositor reads)
```
app/assets/
  heroes/{id}.png            current full figures (fallback body until weaponless exist)
  bodies/{id}.png            weaponless body base per class  ← register in BODY_LAYER
  armor/{id}/{rarity}.png    armor over-body layer           ← register in ARMOR_LAYER
  items/{wk}-{rarity}.png    weapon art (already sliced)
```
Class ids: `dawnguard` (Sword & Shield), `sunblade` (Dual Swords), `lightkeeper` (Staff),
`dawnchaser` (Spellblade). Weapon keys `wk`: `sns`, `dual`, `staff`, `spell`. Rarities:
common, uncommon, rare, epic, legendary, artifact.

## Registering new art
Drop the file at the path above and add it to the map in `gaia.html`:
`BODY_LAYER = { dawnguard:"assets/bodies/dawnguard.png", … }` /
`ARMOR_LAYER = { dawnguard:{ epic:"assets/armor/dawnguard/epic.png", … } }`.
No other code changes — the compositor renders it.
