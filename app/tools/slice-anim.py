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
from collections import deque
from PIL import Image

REF = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "reference")
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "fx")
BODIES = os.path.join(os.path.dirname(__file__), "..", "assets", "bodies")

# ── Combat IMPACT VFX packs (per Attunement) ─────────────────────────────────────────────────────
# Dara's five impact sheets (assets/reference/anim-impact-<att>.png) are 1536x1024, four evenly-gridded
# frames (slash → full burst+ring → shard explosion → dissipate) on a near-WHITE CHECKERBOARD, with a
# "1 2 3 4" caption band along the bottom. We knock the checker off (soft alpha from colour + darkness
# deviation, with interior hot-cores hole-filled solid), split into four even cells, and crop every
# frame to one SHARED square centred on the cell — so the burst animates IN PLACE without jitter. The
# combat compositor (ui/skillAnimator.playImpact) plays them on the struck foe, tinted by the
# attacker's Attunement. Output: app/assets/fx/impact-<att>/01..04.png.
IMPACT_ATTS = ["sol", "nox", "anima", "quanta", "umbraxis"]
IMPACT_FRAMES = 4
IMPACT_LABEL_CUT = 0.72   # rows below this fraction are the caption band — excluded from the art
IMPACT_MAX = 320          # cap the long edge (they render at ~target height; keeps the bundle lean)

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
    # ── Reusable projectile-attack VFX (SOL) ─────────────────────────────────────────────────────
    # A gun-style basic attack: muzzle flash at the barrel → a tracer bullet that travels to the
    # target → an impact burst on the foe. Generic gold-on-dark sets, meant for ANY class/ability
    # that fires a projectile (catalogued in docs/art/projectile-vfx.md). White-background sheets
    # with number labels above + caption text below the art, so the ywin bounds just the art band.
    "muzzle-flash-sol": {
        "src": "anim-muzzle-flash-sol.png", "knockout_white": True, "ywin": (0.30, 0.66),
        "drop_caption": True,
        # 3 frames: compressed spark → spark expands forward → solar particles shoot out. (The sheet's
        # 4th "particles fade" frame is too faint to slice cleanly; the compositor fades the final
        # frame out, which covers that beat.) drop_caption trims the "1-4" label below each effect.
        "frames": [
            ("01", 40, 330), ("02", 384, 740), ("03", 760, 1150),
        ],
    },
    "bullet-tracer": {
        "src": "anim-bullet-projectile.png", "knockout_white": True, "ywin": (0.37, 0.66),
        "drop_caption": True,
        # ONE clean tracer (the compact frame-1 bullet with its symmetric trail): the compositor
        # rotates it along the muzzle→target line and TRANSLATES it across the stage, so the screen
        # travel IS the motion. (Frames 2-4 are one continuous, merged streak — slicing them yields
        # disjoint cut segments, the same problem the photon-beam had; a single tracer reads cleaner.)
        "frames": [("01", 16, 332)],
    },
    "bullet-impact": {
        "src": "anim-bullet-impact.png", "knockout_white": True, "ywin": (0.20, 0.74),
        "drop_caption": True,
        "frames": [  # sparkle contact, starburst pinnacle, outward solar explosion, fade
            ("01", 56, 300), ("02", 344, 745), ("03", 768, 1135), ("04", 1180, 1460),
        ],
    },
}

# Single hero idle/battle sprites → written as the class body (bodies/<out>.png). Source may already
# be transparent (preferred — cleanest), else a flat GRAY background knocked out by low-chroma flood.
# Dara's idle for the Photon Vanguard (SOL × Rifle) is a clean transparent PNG.
SINGLE_BODIES = {
    "sol-rifle": {"src": "anim-photon-vanguard-idle.png"},
    "umbraxis-daggers": {"src": "idle-umbraxis-daggers.png"}, # The Lagrangian (UMBRAXIS × Dual Daggers)
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


def drop_caption(im, min_gap=15, thr=24):
    """Drop the number/caption that sits BELOW the art. The reference frames carry a small label
    ("1".."4" + a caption) under each effect, on a fixed baseline — so a small effect (the spark)
    leaves a wide empty gap above its label while a big burst nearly touches it, and no single
    y-window separates them. Instead: scan down from the first art row and, at the FIRST run of
    >= min_gap near-empty rows, crop to the art above it (the label lives below the gap)."""
    px = im.load(); W, H = im.size
    rowcnt = [sum(1 for x in range(W) if px[x, y][3] > thr) for y in range(H)]
    art = [y for y in range(H) if rowcnt[y] > max(3, int(W * 0.02))]
    if not art:
        return im
    run = 0
    for y in range(art[0], H):
        if rowcnt[y] <= 2:
            run += 1
            if run >= min_gap:
                return im.crop((0, 0, W, y - run + 1))
        else:
            run = 0
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


def _impact_alpha(rgb):
    """Knock the near-white checkerboard off an impact frame: float alpha 0..1 from how far a pixel
    deviates from the bright neutral background, by COLOUR (saturation) and DARKNESS combined. The
    checker (~242-250, neutral) → ~0; the gold/blue/green/red/purple glow and sparkles → opaque."""
    import numpy as np
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    minc = np.minimum(np.minimum(r, g), b)
    sat = np.maximum(np.maximum(r, g), b) - minc
    darkdev = np.clip(250 - minc - 12, 0, None)      # below the bright checker
    satdev = np.clip(sat - 12, 0, None)              # colourful
    return np.clip((darkdev + satdev) / 70.0, 0, 1)


def _fill_holes(mask):
    """Flood from the border; any empty pixel never reached is an interior hole (a white-hot core ringed
    by glow) → mark it solid, so cores don't punch through as transparent."""
    import numpy as np
    h, w = mask.shape
    seen = np.zeros_like(mask, bool); dq = deque()
    for x in range(w):
        for y in (0, h - 1):
            if not mask[y, x] and not seen[y, x]: seen[y, x] = True; dq.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not mask[y, x] and not seen[y, x]: seen[y, x] = True; dq.append((y, x))
    while dq:
        y, x = dq.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not seen[ny, nx] and not mask[ny, nx]:
                seen[ny, nx] = True; dq.append((ny, nx))
    out = mask.copy(); out[~seen & ~mask] = True
    return out


def slice_impact(att, montage=False):
    """Slice one Attunement's impact sheet into 4 in-place-aligned transparent frames."""
    import numpy as np
    src = Image.open(os.path.join(REF, f"anim-impact-{att}.png")).convert("RGB")
    im = np.asarray(src).astype(float)
    H, W, _ = im.shape
    art = im[: int(H * IMPACT_LABEL_CUT)]                 # drop the caption band
    AH = art.shape[0]; colw = W // IMPACT_FRAMES
    a = _impact_alpha(art)
    # CENTRE EACH FRAME ON ITS OWN LUMINOUS MASS (alpha-weighted centroid), not the cell centre. The
    # artist drew the slash/burst/shards at DIFFERENT spots within their cells, so cell-centred crops made
    # the bright mass drift sideways across frames — in game the impact appeared to slide across the enemy.
    # Aligning every frame's centroid to the canvas centre makes the four bloom CONCENTRICALLY (in place).
    # The source window is clamped to each frame's OWN cell so a neighbouring burst can never bleed in; a
    # shared half-size keeps the four frames' relative scale intact.
    half = 0; cents = []
    for i in range(IMPACT_FRAMES):
        cx0, cx1 = i * colw, (i + 1) * colw
        cell = a[:, cx0:cx1]                              # this frame's cell ONLY (no neighbour bleed)
        ys, xs = np.where(cell > 0.12)
        if len(xs):
            wv = cell[ys, xs]
            gcx = int(round(((xs + cx0) * wv).sum() / wv.sum()))   # global centroid (luminous mass)
            gcy = int(round((ys * wv).sum() / wv.sum()))
            half = max(half, gcx - (int(xs.min()) + cx0), (int(xs.max()) + cx0) - gcx, gcy - int(ys.min()), int(ys.max()) - gcy)
        else:
            gcx, gcy = (cx0 + cx1) // 2, AH // 2
        cents.append((gcx, gcy, cx0, cx1))
    R = int(half) + 6
    outdir = os.path.join(OUT, f"impact-{att}"); os.makedirs(outdir, exist_ok=True)
    thumbs = []
    for i, (gcx, gcy, cx0, cx1) in enumerate(cents):
        canvas = np.zeros((2 * R, 2 * R, 4), np.uint8)
        # source window centred on the centroid, clamped to the cell (x) and art band (y)
        rx0, rx1 = max(gcx - R, cx0), min(gcx + R, cx1)
        ry0, ry1 = max(gcy - R, 0), min(gcy + R, AH)
        rgb = art[ry0:ry1, rx0:rx1]
        al = _impact_alpha(rgb)
        al = np.maximum(al, _fill_holes(al > 0.12).astype(float))
        block = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (al * 255).astype(np.uint8)])
        dx, dy = rx0 - (gcx - R), ry0 - (gcy - R)         # place so the centroid lands at canvas centre (R,R)
        canvas[dy:dy + block.shape[0], dx:dx + block.shape[1]] = block
        fr = Image.fromarray(canvas, "RGBA")
        if fr.width > IMPACT_MAX:
            fr = fr.resize((IMPACT_MAX, IMPACT_MAX), Image.LANCZOS)
        fr.save(os.path.join(outdir, f"{i + 1:02d}.png")); thumbs.append(fr)
    print(f"impact-{att}: {IMPACT_FRAMES} frames ({thumbs[0].width}x{thumbs[0].height}) -> {outdir}")
    if montage:
        mh = 180; pad = 8
        sheet = Image.new("RGBA", (IMPACT_FRAMES * (mh + pad) + pad, mh + 2 * pad), (28, 34, 26, 255))
        for j, t in enumerate(thumbs):
            r = t.resize((mh, mh)); sheet.paste(r, (pad + j * (mh + pad), pad), r)
        sheet.convert("RGB").save(os.path.join(OUT, f"_montage-impact-{att}.png"))


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
    for att in IMPACT_ATTS:                       # per-Attunement combat impact VFX packs
        slice_impact(att, montage)
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
            if cfg.get("drop_caption"):
                cell = drop_caption(cell)
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
