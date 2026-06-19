#!/usr/bin/env python3
"""Slice Dara's ultra-rare monster portraits (on near-black, with a gold "(Rare)" title) into
transparent battle sprites matching the enemy convention (RGBA, fit within 199x300 portrait).

Black is knocked out via alpha = max(r,g,b); the title band is cropped off the top first. Add a
(source, key) pair to RARES to introduce another rare. Re-run: python3 app/tools/slice-rares.py
"""
import os
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "..", "assets", "reference")
OUT = os.path.join(HERE, "..", "assets", "enemies")
CANVAS = (199, 300)   # match existing enemy sprites
ALPHA_FLOOR = 16      # knock near-black backdrop fully transparent

# (source, output key, title-band crop fraction) — the gold "(Rare)" caption sits at different
# heights per portrait, so the crop is per-entry.
RARES = [
    ("rare-metalslime.png", "metalslime", 0.22),
    ("rare-metalbabble.png", "metalbabble", 0.22),
    ("rare-warmech.png", "warmech", 0.13),
]


def slice_one(src, key, title_frac):
    im = np.asarray(Image.open(os.path.join(REF, src)).convert("RGB")).astype(np.uint8)
    im = im[int(im.shape[0] * title_frac):, :, :]            # drop the title band
    alpha = im.max(2).astype(np.uint8)                        # glow/metal bright, bg ~black
    alpha[alpha < ALPHA_FLOOR] = 0
    sprite = Image.fromarray(np.dstack([im, alpha]), "RGBA")
    sprite = sprite.crop(sprite.getbbox())                    # trim to content
    # fit within the portrait canvas, preserve aspect, center on transparent
    w, h = sprite.size
    scale = min(CANVAS[0] / w, CANVAS[1] / h)
    sprite = sprite.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.paste(sprite, ((CANVAS[0] - sprite.width) // 2, (CANVAS[1] - sprite.height) // 2))
    canvas.save(os.path.join(OUT, f"{key}.png"))
    print(f"{key}.png  <- {src}  content {w}x{h} -> {sprite.size}")


if __name__ == "__main__":
    for src, key, tf in RARES:
        slice_one(src, key, tf)
