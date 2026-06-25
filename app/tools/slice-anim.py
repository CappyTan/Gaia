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

# ── Universal mana-SLASH impact VFX (per Attunement) ─────────────────────────────────────────────
# Dara's five slash sheets (assets/reference/anim-slash-<att>.png) are single transparent crescents — a
# curved energy slash with particle flecks, one per Attunement (SOL gold, NOX blue, ANIMA green, QUANTA
# red, UMBRAXIS purple). We just tight-crop to the art and downscale. The combat compositor
# (ui/skillAnimator.playSlash) plays them over the struck unit, tinted by the attacker's Attunement,
# with an animated fade-in→peak→fade-out + particle burst. Output: app/assets/fx/slash-<att>.png.
SLASH_ATTS = ["sol", "nox", "anima", "quanta", "umbraxis"]
SLASH_MAX = 512           # cap the long edge (they render scaled to the target sprite; keeps it lean)

# ── Mana CASTING-CIRCLE VFX (per Attunement) ─────────────────────────────────────────────────────
# Dara's five casting circles (assets/reference/anim-cast-<att>.png) are 1536x1024 ground-perspective
# magic circles on a near-WHITE CHECKERBOARD (painted, not real alpha). We knock the checker off by how
# far each pixel deviates from the bright neutral background (DARK runic interiors and COLOURED glow are
# kept; the ~248 checker → transparent), tight-crop, and downscale. The combat compositor
# (ui/skillAnimator.playCast) lays one under the caster's feet during an ability cast, tinted by the
# hero's Attunement, fading in then slowly rotating + pulsing. Output: app/assets/fx/cast-<att>.png.
CAST_ATTS = ["sol", "nox", "anima", "quanta", "umbraxis"]
CAST_MAX = 640            # cap the long edge (ground decals are wide; a bit larger than the slash)

# ── HEALING-CIRCLE VFX (per Attunement) ──────────────────────────────────────────────────────────
# Dara's five healing effects (assets/reference/anim-heal-<att>.png) are tall COLUMNS on a near-white
# checkerboard: a ground magic-circle at the base with themed energy/particles swirling upward. We knock
# the checker off (same darkness+saturation deviation as the casting circles) and split each into two
# layers — heal-disc-<att> (the base ground circle, which the compositor rotates flat) and
# heal-col-<att> (the rising swirl/particles, which pulses). The combat compositor
# (ui/skillAnimator.playHeal) lays them UNDER the healed target, tinted by the CASTER's Attunement.
HEAL_ATTS = ["sol", "nox", "anima", "quanta", "umbraxis"]
HEAL_MAX = 560
HEAL_DISC_BAND = 0.66     # bottom fraction that holds the ground circle
HEAL_COL_BAND = 0.82      # top fraction that holds the rising column (overlaps the disc a touch)

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


def slice_slash(att):
    """Tight-crop one Attunement's slash crescent to its art and downscale → fx/slash-<att>.png."""
    src = Image.open(os.path.join(REF, f"anim-slash-{att}.png")).convert("RGBA")
    fr = tight(src, pad=4)
    if max(fr.size) > SLASH_MAX:
        s = SLASH_MAX / max(fr.size)
        fr = fr.resize((max(1, round(fr.width * s)), max(1, round(fr.height * s))), Image.LANCZOS)
    fr.save(os.path.join(OUT, f"slash-{att}.png"))
    print(f"slash-{att}.png  ({fr.width}x{fr.height})")


def slice_cast(att):
    """Knock the checker off one Attunement's casting circle, tight-crop, downscale → fx/cast-<att>.png."""
    import numpy as np
    rgb = np.asarray(Image.open(os.path.join(REF, f"anim-cast-{att}.png")).convert("RGB")).astype(float)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    minc = np.minimum(np.minimum(r, g), b)
    sat = np.maximum(np.maximum(r, g), b) - minc
    # opaque where the pixel is DARKER than the bright checker OR colourful; the ~248 neutral checker → 0
    al = np.clip((np.clip(250 - minc - 10, 0, None) + np.clip(sat - 10, 0, None)) / 60.0, 0, 1)
    out = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (al * 255).astype(np.uint8)])
    fr = tight(Image.fromarray(out, "RGBA"), pad=4)
    if max(fr.size) > CAST_MAX:
        s = CAST_MAX / max(fr.size)
        fr = fr.resize((max(1, round(fr.width * s)), max(1, round(fr.height * s))), Image.LANCZOS)
    fr.save(os.path.join(OUT, f"cast-{att}.png"))
    print(f"cast-{att}.png  ({fr.width}x{fr.height})")


def _downscale(fr, cap):
    if max(fr.size) > cap:
        s = cap / max(fr.size)
        fr = fr.resize((max(1, round(fr.width * s)), max(1, round(fr.height * s))), Image.LANCZOS)
    return fr


def slice_heal(att):
    """Knock the checker off one Attunement's healing column, then split into a base ground DISC + the
    rising COLUMN → fx/heal-disc-<att>.png + fx/heal-col-<att>.png."""
    import numpy as np
    rgb = np.asarray(Image.open(os.path.join(REF, f"anim-heal-{att}.png")).convert("RGB")).astype(float)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    minc = np.minimum(np.minimum(r, g), b)
    sat = np.maximum(np.maximum(r, g), b) - minc
    al = np.clip((np.clip(250 - minc - 10, 0, None) + np.clip(sat - 10, 0, None)) / 60.0, 0, 1)
    full = Image.fromarray(np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), (al * 255).astype(np.uint8)]), "RGBA")
    W, H = full.size
    disc = _downscale(tight(full.crop((0, int(H * (1 - HEAL_DISC_BAND)), W, H)), pad=4), HEAL_MAX)
    col = _downscale(tight(full.crop((0, 0, W, int(H * HEAL_COL_BAND))), pad=4), HEAL_MAX)
    disc.save(os.path.join(OUT, f"heal-disc-{att}.png"))
    col.save(os.path.join(OUT, f"heal-col-{att}.png"))
    print(f"heal-{att}: disc {disc.size}  col {col.size}")


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
    for att in SLASH_ATTS:                         # per-Attunement universal mana-slash impact VFX
        slice_slash(att)
    for att in CAST_ATTS:                          # per-Attunement mana casting circles
        slice_cast(att)
    for att in HEAL_ATTS:                          # per-Attunement healing circles (disc + column)
        slice_heal(att)
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
