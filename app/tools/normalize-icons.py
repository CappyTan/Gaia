#!/usr/bin/env python3
"""Normalize loot-icon sprites so they all CENTER and FILL their card box consistently.

The sliced item sprites (app/assets/items/*.png) have inconsistent canvases: some carry internal
transparent padding and/or off-centre content, and aspect ratios vary a lot. With CSS object-fit:
contain that makes some icons render tiny and off-centre (only the already-tight ones, like the
rare boots, looked right). This trims each sprite to its opaque content and re-pads it to a CENTRED
square (with a small uniform margin), so every icon sits centred and fills the box the same way.

Idempotent: re-running on an already-normalized sprite reproduces the same result. Operates only on
app/assets/items/ (the loot icons); paper-doll bodies/armor layers are untouched.

Usage:  python3 app/tools/normalize-icons.py
"""
import glob
import os
from PIL import Image

ALPHA_THRESH = 12     # treat pixels with alpha above this as content (ignore faint knockout halos)
MARGIN = 0.05         # uniform breathing room around content, as a fraction of the square side

ITEMS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "items")


def normalize(path: str) -> bool:
    im = Image.open(path).convert("RGBA")
    mask = im.getchannel("A").point(lambda a: 255 if a > ALPHA_THRESH else 0)
    bbox = mask.getbbox()
    if not bbox:
        return False  # fully transparent — leave it
    content = im.crop(bbox)
    cw, ch = content.size
    side = round(max(cw, ch) * (1 + 2 * MARGIN))
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(content, ((side - cw) // 2, (side - ch) // 2))
    canvas.save(path)
    return True


def main() -> None:
    files = sorted(glob.glob(os.path.join(ITEMS_DIR, "*.png")))
    n = sum(1 for f in files if normalize(f))
    print(f"normalized {n}/{len(files)} item icons (trim + centre on a square)")


if __name__ == "__main__":
    main()
