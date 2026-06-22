#!/usr/bin/env python3
# slice-equipment.py — slice Dara's helmet / gloves / boots reference STRIPS into the game's
# per-attunement × per-rarity armor sprites. Each source is one attunement's strip on flat magenta
# with the 6 rarities in a row (Common → Artifact, left→right) under a label band.
#   assets/reference/loot-{slot}-{att}.png  ->  app/assets/items/{slot}-{att}-{rarity}.png
# Run:  python3 app/tools/slice-equipment.py [--preview]
# Magenta knockout keys on the GREEN channel (the flat bg is bright magenta with G~0-5, while the
# items' purple/red glows keep G high), so QUANTA/UMBRAXIS effects survive the cut. Pillow only.
import sys, os
from PIL import Image, ImageFilter

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
REF = os.path.join(ROOT, "assets", "reference")
OUT = os.path.join(ROOT, "app", "assets", "items")
RAR = ["common", "uncommon", "rare", "epic", "legendary", "artifact"]
ATT = ["sol", "nox", "anima", "quanta", "umbraxis"]
SLOTS = ["helmet", "gloves", "boots"]
LABEL_FRAC = 0.17   # skip the top label band
MAXDIM = 320        # cap the saved sprite's larger side
PREVIEW = "--preview" in sys.argv

def chroma(im):
    """Knock out the flat magenta backdrop by GREEN channel: bright pixels with very low green are
    background; the items (incl. purple/red glow, which has G well above the bg) are kept. Soft ramp
    on G gives a feathered edge."""
    im = im.convert("RGBA"); W, H = im.size; px = im.load()
    a = Image.new("L", (W, H), 255); ap = a.load()
    for y in range(H):
        for x in range(W):
            r, g, b, _ = px[x, y]
            if min(r, b) > 110:                 # bright, non-green-dominant → candidate bg
                if g <= 22: ap[x, y] = 0
                elif g < 72: ap[x, y] = int((g - 22) / 50 * 255)  # feather 22..72 → 0..255
    im.putalpha(a.filter(ImageFilter.GaussianBlur(0.6)))
    return im

def is_bg(r, g, b):
    return min(r, b) > 110 and g < 40

def item_top(im):
    """Find where the items start: skip the thin label text + the little ornament dots beneath it,
    landing on the first TALL content band (the item itself). Robust to per-strip label placement."""
    im2 = im.convert("RGB"); W, H = im2.size; px = im2.load()
    thr = max(3, W // 40)
    has = [sum(1 for x in range(0, W, 4) if not is_bg(*px[x, y])) > thr for y in range(H)]
    y = 0
    while y < int(H * 0.6):
        if has[y]:
            y1 = y
            while y1 < H and has[y1]: y1 += 1
            if y1 - y > H * 0.07: return max(0, y - 2)  # first tall band = the item
            y = y1
        else:
            y += 1
    return int(H * 0.17)

def slice_strip(path, slot, att):
    im = Image.open(path).convert("RGBA"); W, H = im.size
    y0 = item_top(im)
    out = []
    for ri in range(6):
        x0, x1 = int(W * ri / 6), int(W * (ri + 1) / 6)
        cell = chroma(im.crop((x0, y0, x1, H)))
        bb = cell.getbbox()
        if bb: cell = cell.crop(bb)
        cell.thumbnail((MAXDIM, MAXDIM), Image.LANCZOS)
        os.makedirs(OUT, exist_ok=True)
        cell.save(os.path.join(OUT, f"{slot}-{att}-{RAR[ri]}.png"))
        out.append(cell)
    return out

count = 0; grids = {}
for slot in SLOTS:
    grids[slot] = {}
    for att in ATT:
        p = os.path.join(REF, f"loot-{slot}-{att}.png")
        if not os.path.exists(p): print("MISSING", p); continue
        cells = slice_strip(p, slot, att)
        for ri, c in enumerate(cells): grids[slot][(att, ri)] = c
        count += len(cells)
print(f"sliced {count} armor-piece sprites ({len(SLOTS)} slots × {len(ATT)} attunements × 6 rarities)")

if PREVIEW:
    pv = os.path.join(REF, "_preview"); os.makedirs(pv, exist_ok=True)
    CW, CH = 150, 150
    for slot in SLOTS:
        g = Image.new("RGBA", (CW * 6, CH * 5), (28, 24, 40, 255))
        for ai, att in enumerate(ATT):
            for ri in range(6):
                c = grids[slot].get((att, ri))
                if not c: continue
                t = c.copy(); t.thumbnail((CW - 12, CH - 12), Image.LANCZOS)
                g.alpha_composite(t, (ri * CW + (CW - t.width) // 2, ai * CH + (CH - t.height) // 2))
        g.convert("RGB").save(os.path.join(pv, f"equip_{slot}.png"))
    print("wrote previews:", ", ".join(f"_preview/equip_{s}.png" for s in SLOTS))
