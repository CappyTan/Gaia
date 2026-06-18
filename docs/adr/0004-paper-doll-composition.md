# Layered paper-doll character composition

To let characters cleanly equip different weapons (and later armor, shields, helms, FX), a
character is no longer one baked image. It renders as an **ordered stack of aligned layers**
in a single box; equipping an item **swaps a layer**. Adding a new equipment kind later is
new slots + new art, with **no engine change**.

**Layers / slots (back → front):** `back` (cape/quiver/sheathed 2H) · `body` (weaponless
base pose, fixed per class) · `armor` (over torso/legs) · `offhand` (shield) · `mainhand`
(weapon) · `fx` (attunement glow). The compositor draws them in that z-order.

**Attachment.** Two strategies, both supported by the same compositor:
- *Pre-aligned* — art drawn already-positioned for the pose (trivial, but art = pieces ×
  poses; explodes across 45 classes).
- *Anchored (chosen target)* — the body declares a normalized `hand` anchor; each weapon a
  display transform (scale/rotation, and eventually a grip point); the compositor maps the
  weapon onto the hand. **One weapon art reused on every character.** Scales to 45 classes.

**The gating dependency is art, not code.** Clean swaps require **weaponless body bases**
(today's figures have the weapon baked in) and armor authored as over-body layers — see
`docs/art/rig-spec.md` (the contract) and `docs/art/layer-art-brief.md` (how to produce it).

**Art-gated rollout.** `BODY_LAYER` / `ARMOR_LAYER` maps start empty. Until a class has a
weaponless body, the compositor falls back to its current full figure as the body and
attaches the equipped weapon at the hand anchor (an interim, anchored version of the v0.6
overlay). The moment weaponless-body / armor art is dropped in and registered, the SAME
compositor renders fully-clean equip — no code change. This avoids a flag-day rewrite and
never regresses below what shipped.

**Why not keep baking figures:** baked art can't show swappable gear, and a glowing icon
floated in front (v0.6) reads as a HUD element, not equipment. The paper-doll is the
standard model (Diablo/FF/MMO) and the only one that also answers armor/shields/helms.
