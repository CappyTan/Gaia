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
BODIES = os.path.join(os.path.dirname(__file__), "..", "assets", "bodies")

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
        # UNIFORM beam: the compositor rotates + stretches this bar from the muzzle to the target,
        # so it reads as one clean beam (the original streak tapered to faint points at both ends,
        # which looked disjointed and never reached the gun). Built from the streak's bright core.
        "uniform_beam": (440, 1383),
    },
    "sol-aloha": {
        "src": "anim-sol-aloha-impact.png", "knockout_white": False, "ywin": (0.04, 0.60),
        "frames": [  # contact, pinnacle, pinnacle, lessens, fade
            ("01", 0, 305), ("02", 305, 610), ("03", 610, 916), ("04", 959, 1258), ("05", 1307, 1490),
        ],
    },
}

# Single hero idle/battle sprites → written as the class body (bodies/<out>.png). Source may already
# be transparent (preferred — cleanest), else a flat GRAY background knocked out by low-chroma flood.
# Dara's idle for the Photon Vanguard (SOL × Rifle) is a clean transparent PNG.
SINGLE_BODIES = {
    "sol-rifle": {"src": "anim-photon-vanguard-idle.png"},
}


def knock_white(im, thr=236, soft=205):
    """Knock the WHITE BACKGROUND off via an edge flood-fill: only near-white pixels CONNECTED to the
    border become transparent, so the figure's bright/gold interior highlights stay fully opaque (a
    plain global white-threshold ate those highlights and left the sprite looking faded). Soft-ramps
    the anti-aliased halo at the figure edge."""
    from collections import deque
    im = im.convert("RGBA"); px = im.load(); W, H = im.size
    isbg = lambda x, y: min(px[x, y][0], px[x, y][1], px[x, y][2]) >= soft
    dq = deque(); seen = set()
    for x in range(W):                       # seed from every border pixel that is background-ish
        for y in (0, H - 1):
            if isbg(x, y) and (x, y) not in seen: seen.add((x, y)); dq.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if isbg(x, y) and (x, y) not in seen: seen.add((x, y)); dq.append((x, y))
    while dq:                                 # flood the connected background region
        x, y = dq.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and isbg(nx, ny):
                seen.add((nx, ny)); dq.append((nx, ny))
    for (x, y) in seen:
        r, g, b, a = px[x, y]; m = min(r, g, b)
        px[x, y] = (r, g, b, 0) if m >= thr else (r, g, b, int(a * (thr - m) / (thr - soft)))
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


def knock_gray(im, spread=22):
    """Knock a flat/gradient GRAY background off a single sprite via edge flood-fill: a pixel is
    'background' if it's low-chroma (max-min channel <= spread) and reachable from the border. Keeps
    the figure's gold + coloured/shadowed armour (high chroma) and any interior silver (not border-
    connected). Soft-ramps the edge."""
    from collections import deque
    im = im.convert("RGBA"); px = im.load(); W, H = im.size
    gray = lambda x, y: (max(px[x, y][:3]) - min(px[x, y][:3])) <= spread
    dq = deque(); seen = set()
    for x in range(W):
        for y in (0, H - 1):
            if gray(x, y) and (x, y) not in seen: seen.add((x, y)); dq.append((x, y))
    for y in range(H):
        for x in (0, W - 1):
            if gray(x, y) and (x, y) not in seen: seen.add((x, y)); dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and gray(nx, ny):
                seen.add((nx, ny)); dq.append((nx, ny))
    for (x, y) in seen:
        r, g, b, a = px[x, y]; sp = max(r, g, b) - min(r, g, b)
        px[x, y] = (r, g, b, 0) if sp <= spread - 6 else (r, g, b, int(a * (spread - sp) / 6))
    return im


def uniform_beam(strip, width=320):
    """Turn a tapering beam streak into a UNIFORM bar the compositor can stretch into a clean beam:
    take the streak's brightest column (its glow cross-section) and tile it along the length. Keeps
    the art's exact gold colour + vertical falloff, but removes the taper that made the beam look
    disjointed / never reach the muzzle."""
    strip = tight(strip); sw, sh = strip.size; px = strip.load()
    best, bx = -1, sw // 2
    for x in range(sw):                      # brightest column by summed alpha
        s = sum(px[x, y][3] for y in range(0, sh, 2))
        if s > best: best, bx = s, x
    col = strip.crop((max(0, bx - 10), 0, min(sw, bx + 10), sh))   # a few px around it, averaged by resize
    return col.resize((width, sh), Image.BICUBIC)


def main():
    montage = "--montage" in sys.argv
    os.makedirs(BODIES, exist_ok=True)
    for out, cfg in SINGLE_BODIES.items():       # single idle sprites → class bodies
        sp = Image.open(os.path.join(REF, cfg["src"])).convert("RGBA")
        if cfg.get("spread"):                     # gray-background source: knock it out
            sp = knock_gray(sp, cfg["spread"])
        sp = tight(sp)                            # transparent source: just crop to the figure
        sp.save(os.path.join(BODIES, f"{out}.png"))
        print(f"body {out} <- {cfg['src']} ({sp.size[0]}x{sp.size[1]})")
    for setname, cfg in SHEETS.items():
        src = Image.open(os.path.join(REF, cfg["src"])).convert("RGBA")
        W, H = src.size
        y0, y1 = int(cfg["ywin"][0] * H), int(cfg["ywin"][1] * H)
        outdir = os.path.join(OUT, setname); os.makedirs(outdir, exist_ok=True)
        thumbs = []; cells = {}
        if cfg.get("uniform_beam"):           # build a clean uniform beam, with a subtle intensity pulse
            bx0, bx1 = cfg["uniform_beam"]
            base = uniform_beam(src.crop((bx0, y0, bx1, y1)))
            for i, mult in enumerate([0.82, 1.0, 0.9]):
                fr = base.copy()
                fr.putalpha(fr.getchannel("A").point(lambda v: int(v * mult)))
                fr.save(os.path.join(outdir, f"0{i + 1}.png")); thumbs.append(fr)
            print(f"{setname}: 3 uniform-beam frames -> {outdir}")
            continue
        for name, x0, x1 in cfg["frames"]:
            cell = src.crop((x0, y0, x1, y1))
            if cfg["knockout_white"]:
                cell = knock_white(cell)
            cell = tight(cell)
            cell.save(os.path.join(outdir, f"{name}.png"))
            cells[name] = cell; thumbs.append(cell)
        print(f"{setname}: {len(cfg['frames'])} frames -> {outdir}")
        if cfg.get("body_from"):  # also use one frame as a class battle body (idle sprite)
            os.makedirs(BODIES, exist_ok=True)
            bpath = os.path.join(BODIES, f"{cfg['body_out']}.png")
            cells[cfg["body_from"]].save(bpath)
            print(f"  body (frame {cfg['body_from']}) -> {bpath}")
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
