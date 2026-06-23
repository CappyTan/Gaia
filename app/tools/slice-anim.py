#!/usr/bin/env python3
"""Slice the REQUIEM combat-animation reference sheets into per-frame transparent PNGs.

Dara's animation sheets (assets/reference/anim-*.png) are *reference* sheets: rows of labelled
frames on a white (character) or transparent (effect/impact) background, with baked-in caption
text below the art. This tool crops just the art of each frame — explicit boxes per sheet, since
the sheets aren't clean grids (the beam is one continuous streak; the explosion bursts overlap) —
knocks the white background off the character sheet, tight-crops to the art, and writes numbered
frames to app/assets/fx/<set>/NN.png for the combat animation compositor (ui/skillAnimator).

Run:  python3 app/tools/slice-anim.py [--montage]
Frames resolve at runtime via core/assets.ts (import.meta.glob over app/assets/**).
"""
import os, sys
from PIL import Image

REF = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "reference")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "fx")

# Per-sheet frame boxes: (x0, x1) column span + (y0frac, y1frac) art window (excludes caption band).
# Derived from the sheets' content profiles (see commit notes); explicit because the art doesn't
# sit on a clean grid.
SHEETS = {
    "photon-vanguard": {
        "src": "anim-photon-vanguard-char.png", "knockout_white": True, "ywin": (0.14, 0.66),
        "frames": [  # the 5 firing poses: idle, load, aim, fire, final
            ("01", 16, 300), ("02", 300, 576), ("03", 576, 896), ("04", 896, 1216), ("05", 1216, 1512),
        ],
    },
    "photon-beam": {
        "src": "anim-photon-beam.png", "knockout_white": False, "ywin": (0.05, 0.55),
        # charge ball, then the beam streak (held for a few frames; the compositor fades them).
        "frames": [("01", 10, 431), ("02", 440, 1383), ("03", 440, 1383), ("04", 440, 1383)],
    },
    "sol-aloha": {
        "src": "anim-sol-aloha-impact.png", "knockout_white": False, "ywin": (0.04, 0.60),
        "frames": [  # contact, pinnacle, pinnacle, lessens, fade
            ("01", 0, 305), ("02", 305, 610), ("03", 610, 916), ("04", 959, 1258), ("05", 1307, 1490),
        ],
    },
}


def knock_white(im):
    """White/near-white -> transparent, with a soft edge. Keeps gold (low blue) opaque."""
    im = im.convert("RGBA"); px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            bg = min(r, g, b)            # how "white" (all channels high) the pixel is
            if bg >= 240:
                px[x, y] = (r, g, b, 0)
            elif bg >= 212:              # ramp the anti-aliased halo
                px[x, y] = (r, g, b, int(a * (240 - bg) / 28))
    return im


def tight(im, pad=6, thr=20):
    """Crop to the alpha bounding box (+pad)."""
    px = im.load(); W, H = im.size
    xs0, ys0, xs1, ys1 = W, H, 0, 0; found = False
    for y in range(H):
        for x in range(W):
            if px[x, y][3] > thr:
                found = True
                xs0 = min(xs0, x); ys0 = min(ys0, y); xs1 = max(xs1, x); ys1 = max(ys1, y)
    if not found:
        return im
    xs0 = max(0, xs0 - pad); ys0 = max(0, ys0 - pad); xs1 = min(W, xs1 + pad + 1); ys1 = min(H, ys1 + pad + 1)
    return im.crop((xs0, ys0, xs1, ys1))


def main():
    montage = "--montage" in sys.argv
    for setname, cfg in SHEETS.items():
        src = Image.open(os.path.join(REF, cfg["src"])).convert("RGBA")
        W, H = src.size
        y0, y1 = int(cfg["ywin"][0] * H), int(cfg["ywin"][1] * H)
        outdir = os.path.join(OUT, setname); os.makedirs(outdir, exist_ok=True)
        thumbs = []
        for name, x0, x1 in cfg["frames"]:
            cell = src.crop((x0, y0, x1, y1))
            if cfg["knockout_white"]:
                cell = knock_white(cell)
            cell = tight(cell)
            cell.save(os.path.join(outdir, f"{name}.png"))
            thumbs.append(cell)
        print(f"{setname}: {len(cfg['frames'])} frames -> {outdir}")
        if montage:
            mh = 200; pad = 8
            ws = [int(t.width * mh / t.height) for t in thumbs]
            sheet = Image.new("RGBA", (sum(ws) + pad * (len(thumbs) + 1), mh + 2 * pad), (30, 30, 40, 255))
            x = pad
            for t, w in zip(thumbs, ws):
                sheet.paste(t.resize((w, mh)), (x, pad), t.resize((w, mh)))
                x += w + pad
            mpath = os.path.join(OUT, f"_montage-{setname}.png"); sheet.convert("RGB").save(mpath)
            print(f"  montage -> {mpath}")


if __name__ == "__main__":
    main()
