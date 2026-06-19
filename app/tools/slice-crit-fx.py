#!/usr/bin/env python3
"""Slice Dara's 5-up crit-burst reference montage into transparent per-Attunement sprites.

Reads assets/reference/crit-fx.png (five glowing bursts on black, in ring order
SOL · NOX · ANIMA · QUANTA · UMBRAXIS) and writes app/assets/fx/crit-{att}.png.

Black is "knocked out" the way additive glow art wants it: alpha = max(r,g,b) per
pixel, so the black backdrop goes fully transparent while the colored glow keeps its
soft edges. Output is trimmed to content, padded square, and scaled to a uniform size.

Reproducible art step (see CLAUDE.md art conventions). Re-run if the source changes:
    python3 app/tools/slice-crit-fx.py
"""
import os
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "assets", "reference", "crit-fx.png")
OUT = os.path.join(HERE, "..", "assets", "fx")
ATTS = ["sol", "nox", "anima", "quanta", "umbraxis"]  # left-to-right = affinity-ring order
SIZE = 256        # final square sprite size
ALPHA_FLOOR = 12  # below this, knock to fully transparent (kills faint backdrop noise)


def detect_columns(bright):
    """Find the contiguous bright column runs (one per burst)."""
    energy = bright.sum(0)
    cols = np.where(energy > energy.max() * 0.02)[0]
    runs, start, prev = [], cols[0], cols[0]
    for c in cols[1:]:
        if c - prev > 15:
            runs.append((start, prev)); start = c
        prev = c
    runs.append((start, prev))
    return runs


def main():
    im = np.asarray(Image.open(SRC).convert("RGB")).astype(np.uint8)
    h = im.shape[0]
    bright = im.max(2).astype(int)
    runs = detect_columns(bright)
    assert len(runs) == len(ATTS), f"expected {len(ATTS)} bursts, found {len(runs)}"
    os.makedirs(OUT, exist_ok=True)

    pitch = (runs[1][0] - runs[0][0]) if len(runs) > 1 else (runs[0][1] - runs[0][0])
    for (a, b), att in zip(runs, ATTS):
        c = (a + b) // 2
        half = pitch // 2
        x0, x1 = max(0, c - half), min(im.shape[1], c + half)
        crop = im[:, x0:x1, :]
        # knockout: alpha from brightness; black backdrop -> transparent glow
        alpha = crop.max(2).astype(np.uint16)
        alpha = np.clip(alpha, 0, 255).astype(np.uint8)
        alpha[alpha < ALPHA_FLOOR] = 0
        rgba = np.dstack([crop, alpha])
        sprite = Image.fromarray(rgba, "RGBA").crop(Image.fromarray(alpha).getbbox())
        # pad to square, then scale to a uniform sprite size
        w, hh = sprite.size
        side = max(w, hh)
        sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        sq.paste(sprite, ((side - w) // 2, (side - hh) // 2))
        sq.resize((SIZE, SIZE), Image.LANCZOS).save(os.path.join(OUT, f"crit-{att}.png"))
        print(f"crit-{att}.png  <- col {x0}:{x1}  content {w}x{hh}")


if __name__ == "__main__":
    main()
