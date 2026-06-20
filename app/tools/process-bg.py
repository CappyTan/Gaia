#!/usr/bin/env python3
"""Process Dara's high-res hero backgrounds into shippable battle backdrops.

Drop a full-res source in assets/reference/ named `bg-<slug>.png` and re-run; it
downscales (LANCZOS + mild sharpen) to a stage-friendly width and writes
app/assets/backgrounds/<slug>.png. The <slug> is the battle ENV_BG key (plains,
forest, warren, vault, …). Distinct from slice-backgrounds.py (which cuts the old
low-res terrain *sheet*) — these are individual high-res scenes.

    python3 app/tools/process-bg.py
"""
import glob
import os
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "..", "assets", "reference")
OUT = os.path.join(HERE, "..", "assets", "backgrounds")
SHIP_W = 1024  # the battle stage maxes ~920px wide; 1024 gives a touch of retina headroom

def main():
    os.makedirs(OUT, exist_ok=True)
    srcs = sorted(glob.glob(os.path.join(REF, "bg-*.png")))
    if not srcs:
        print("no assets/reference/bg-*.png found")
        return
    for src in srcs:
        slug = os.path.basename(src)[3:-4]  # bg-<slug>.png -> <slug>
        im = Image.open(src).convert("RGB")
        if im.width > SHIP_W:
            h = round(im.height * SHIP_W / im.width)
            im = im.resize((SHIP_W, h), Image.LANCZOS).filter(
                ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
        dst = os.path.join(OUT, f"{slug}.png")
        im.save(dst, optimize=True)
        print(f"{slug}.png  <- {os.path.basename(src)}  {im.size}")

if __name__ == "__main__":
    main()
