#!/usr/bin/env python3
# slice-art.py — the canonical, reproducible art pipeline. Slices Dara's reference sheets
# into the game's sprites AND knocks out the dark backgrounds to transparency (so figures
# sit flush in the battle scene instead of looking like cut-out rectangles).
#   python app/tools/slice-art.py            # writes app/assets/{items,enemies,heroes}/*.png
#   python app/tools/slice-art.py --preview  # also writes a verification montage
# Only needs Pillow (no numpy/scipy) — connected-component cleanup is hand-rolled BFS.
import sys, os, collections
from PIL import Image, ImageFilter

ROOT=os.path.normpath(os.path.join(os.path.dirname(__file__),"..",".."))
REF=os.path.join(ROOT,"assets","reference")
OUT=os.path.join(ROOT,"app","assets")
RAR=["common","uncommon","rare","epic","legendary","artifact"]
ATT=["sol","nox","anima","quanta","umbraxis"]   # painterly loot sheets run SOL..UMBRAXIS left->right
PREVIEW="--preview" in sys.argv

def remove_bg(im, luma=58, feather=1.2):
    """Flood-fill from the borders through dark pixels = background -> alpha 0. Interior dark
    (armor, robes) is preserved because it isn't border-connected. Feather softens the edge."""
    im=im.convert("RGBA"); W,H=im.size; px=im.load()
    L=lambda p:0.299*p[0]+0.587*p[1]+0.114*p[2]
    bg=[[False]*W for _ in range(H)]; dq=collections.deque()
    def seed(x,y):
        if L(px[x,y])<luma and not bg[y][x]: bg[y][x]=True; dq.append((x,y))
    for x in range(W): seed(x,0); seed(x,H-1)
    for y in range(H): seed(0,y); seed(W-1,y)
    while dq:
        x,y=dq.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<W and 0<=ny<H and not bg[ny][nx] and L(px[nx,ny])<luma:
                bg[ny][nx]=True; dq.append((nx,ny))
    a=Image.new("L",(W,H),255); ap=a.load()
    for y in range(H):
        for x in range(W):
            if bg[y][x]: ap[x,y]=0
    im.putalpha(a.filter(ImageFilter.GaussianBlur(feather)))
    return im

def keep_central(im, kx=0.85, ky=0.8, areafrac=0.06):
    """Drop neighbour bleed: the painterly grids are tight and a tilted sword/figure from the
    next cell can poke into a generous crop. Label the opaque blobs (BFS) and keep only those
    that are big enough AND centred — discarding edge slivers from adjacent cells."""
    im=im.convert("RGBA"); W,H=im.size; al=im.split()[3]; ap=al.load()
    lab=[[0]*W for _ in range(H)]; comps=[]; cur=0
    for y in range(H):
        for x in range(W):
            if ap[x,y]>30 and lab[y][x]==0:
                cur+=1; area=0; sx=0; sy=0; dq=collections.deque([(x,y)]); lab[y][x]=cur
                while dq:
                    cx,cy=dq.popleft(); area+=1; sx+=cx; sy+=cy
                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                        nx,ny=cx+dx,cy+dy
                        if 0<=nx<W and 0<=ny<H and lab[ny][nx]==0 and ap[nx,ny]>30:
                            lab[ny][nx]=cur; dq.append((nx,ny))
                comps.append((area,sx/area,sy/area))
    if not comps: return im
    mx=max(c[0] for c in comps); cxc,cyc=W/2,H/2
    keep={i for i,(a,cx,cy) in enumerate(comps,1)
          if a>=mx*areafrac and abs(cx-cxc)<=W*kx*0.5 and abs(cy-cyc)<=H*ky*0.5}
    for y in range(H):
        for x in range(W):
            if lab[y][x] and lab[y][x] not in keep: ap[x,y]=0
    im.putalpha(al)
    return im

def cell(im, cx, cy, hw, htop, hbot=None, kx=0.85, ky=0.8, af=0.06, luma=58):
    """Crop one grid cell (centre cx,cy; half-width hw; htop above / hbot below — asymmetric so
    a caption baked under the artwork can be trimmed), clear the dark bg, drop neighbour bleed,
    and trim to the artwork. `luma` raises the bg-knockout threshold to sever a dim glow bridge to a
    baked caption so keep_central can discard it (used by the spellblade sheet)."""
    if hbot is None: hbot=htop
    c=keep_central(remove_bg(im.crop((int(cx-hw),int(cy-htop),int(cx+hw),int(cy+hbot))), luma), kx, ky, af)
    bb=c.getbbox()
    return c.crop(bb) if bb else c

def is_magenta(p):
    """Flat chroma-key colour used by the dungeon/prop sheets (#FF00FF-ish): bright R&B, low G."""
    r,g,b=p[0],p[1],p[2]
    return r>180 and b>180 and g<120

def mag_spans(im, axis, thresh=0.6):
    """Find the magenta gutter runs along an axis (0=cols/x, 1=rows/y). Returns a list of
    (start,end) index spans that are >=thresh magenta across the perpendicular dimension. Used to
    auto-detect the grid lines on Dara's flat-magenta tile sheets so cell boxes aren't hardcoded."""
    W,H=im.size; px=im.load()
    total=W if axis==0 else H; span=H if axis==0 else W
    def frac(i):
        return sum(1 for j in range(span) if is_magenta(px[(i,j) if axis==0 else (j,i)]))/span
    mag=[frac(i)>thresh for i in range(total)]; out=[]; i=0
    while i<total:
        if mag[i]:
            j=i
            while j<total and mag[j]: j+=1
            out.append((i,j)); i=j
        else: i+=1
    return out

def mag_cells(im):
    """Auto-detect cell content boxes between magenta gutters -> (cols, rows) lists of (lo,hi)."""
    cg=mag_spans(im,0); rg=mag_spans(im,1)
    cols=[(cg[i][1],cg[i+1][0]) for i in range(len(cg)-1)]
    rows=[(rg[i][1],rg[i+1][0]) for i in range(len(rg)-1)]
    return cols,rows

def chroma_key(im, lo=110, hi=170, despill=12):
    """Magenta chroma-key knockout for the class-bodies sheet (figures rendered on flat #FF00FF).
    Unlike the dark-flood remove_bg, this keys on 'magenta-ness' m = min(R,B) - G, so pure-black
    robes survive (m~0) while the bright-magenta void drops (m~248) — the only reliable way to cut
    the dark NOX/UMBRAXIS figures. Ramps alpha across the anti-aliased edge and de-spills the pink
    fringe so edges read clean over any battlefield colour.

    The de-spill `gate` is low (12) on purpose: where bright near-white SNOW meets the magenta
    void (Frosthold's fh-* tiles) the transition pixels carry only a faint magenta cast — small m
    (~15-40), well under the old 40 gate — so the pink rim survived un-de-spilled. Any pixel above
    the gate is a genuine magenta-cast edge pixel, so we clamp BOTH keyed channels (R,B) fully down
    to the neutral G channel (standard chroma de-spill) — the magenta-tinted snow rim collapses to
    neutral grey/white. This is a no-op on warm gold edges (b<=g there, and r-g rarely clears the
    gate), so the already-clean eb/wc/wp/ll tiles don't regress. The alpha ramp's `lo` is widened to
    110 to start fading those faint-cast snow transition pixels a touch sooner. Measured fh-* edge
    pink: 695 -> 2 pixels (parity with the other towns), eb/wc/wp/ll all stay at 0."""
    im=im.convert("RGB"); W,H=im.size; px=im.load()
    out=Image.new("RGBA",(W,H)); op=out.load()
    for y in range(H):
        for x in range(W):
            r,g,b=px[x,y]; m=min(r,b)-g
            a=0 if m>=hi else 255 if m<=lo else int(255*(hi-m)/(hi-lo))
            if a>0 and m>despill:  # de-spill: clamp the pink rim down to the neutral G channel
                r=min(r, g); b=min(b, g)
            op[x,y]=(r,g,b,a)
    return out

def save(im, *parts):
    p=os.path.join(OUT,*parts); os.makedirs(os.path.dirname(p),exist_ok=True); im.save(p)

# ---- weapons: Dara's painterly loot sheets. Each is a 5-attunement (cols, SOL..UMBRAXIS) x
#      6-rarity (rows) grid -> items/{stem}-{att}-{rarity}.png. The SOL column is also saved as
#      the legacy items/{stem}-{rarity}.png so older lookups still resolve. -------------------
# stem -> (sheet, [(col-centre, half-width) per attunement], [row centres], (htop,hbot),
#          kx, ky, areafrac). Row centres differ slightly per sheet; the spellblade sheet bakes a
#          name caption under each blade, so it uses a blade-centred asymmetric crop to drop it.
RC6=[160,265,375,486,595,713]   # shared rarity-row centres for the S&S/staff sheets
WSHEETS={
 "sns":  ("loot-sword-shield-painterly.png",
          [(283,95),(524,113),(798,113),(1076,119),(1371,121)], RC6, (62,62), 0.86, 0.72, 0.05),
 "dual": ("loot-dual-swords-painterly.png",
          [(237,92),(468,88),(692,85),(913,85),(1134,82)],
          [148,246,349,457,580,704], (58,58), 0.85, 0.72, 0.05),
 "staff":("loot-staff-painterly.png",
          [(c,95) for c in (256,467,683,898,1116)], RC6, (62,62), 0.85, 0.82, 0.06),
 "spell":("loot-spellblade-painterly.png",
          [(c,92) for c in (227,435,644,857,1074)], [151,259,380,490,602,716], (46,44), 0.85, 0.58, 0.07),
}
items={}
for stem,(fn,cols,rows,(htop,hbot),kx,ky,af) in WSHEETS.items():
    im=Image.open(os.path.join(REF,fn)); items[stem]={}
    for ai,(cx,hw) in enumerate(cols):
        for ri,cy in enumerate(rows):
            c=cell(im,cx,cy,hw,htop,hbot,kx,ky,af, luma=(96 if stem=="spell" else 58)); c.thumbnail((300,160))
            save(c,"items",f"{stem}-{ATT[ai]}-{RAR[ri]}.png")
            if ai==0: save(c,"items",f"{stem}-{RAR[ri]}.png")   # legacy SOL-keyed fallback
            items[stem][(ATT[ai],ri)]=c

# ---- armor: the painterly armor-set sheet, same 5-attunement x 6-rarity grid (each cell a
#      full set; the figures sit left of their caption text, which keep_central discards). ->
#      items/armor-{att}-{rarity}.png (+ legacy SOL items/armor-{rarity}.png). ----------------
im=Image.open(os.path.join(REF,"loot-armor-painterly.png"))
ACOL=[(151,62),(366,62),(581,64),(802,64),(1023,66)]; AROW=[176,288,399,511,623,734]; armor={}
for ai,(cx,hw) in enumerate(ACOL):
    for ri,cy in enumerate(AROW):
        c=cell(im,cx,cy,hw,58,kx=0.7,ky=0.82,af=0.06); c.thumbnail((260,260))
        save(c,"items",f"armor-{ATT[ai]}-{RAR[ri]}.png")
        if ai==0: save(c,"items",f"armor-{RAR[ri]}.png")
        armor[(ATT[ai],ri)]=c

# ---- field tiles (Greenvale): a 4x2 grid of ground tiles + object overlays, plus a top-down
#      player walker below. Ground tiles are kept opaque (64x64, the canvas scales them); objects
#      and the walker get the dark bg knocked out so they sit over a ground tile. ---------------
im=Image.open(os.path.join(REF,"field-tiles-greenvale.png"))
FX=[(40,300),(345,600),(640,895),(940,1195)]; FY=[(70,330),(450,705)]
GROUND={(0,0):"grass",(0,1):"grass2",(0,2):"path",(0,3):"tree",(1,0):"bush",(1,1):"rock"}
OBJ={(1,2):"chest",(1,3):"merchant"}
# Ground tiles are cropped from the BRIGHT INTERIOR of each cell (skip the painted vignette/border)
# so they tile edge-to-edge without a dark grid showing between cells.
GIN=36
for (r,col),name in GROUND.items():
    x0,y0,x1,y1=FX[col][0],FY[r][0],FX[col][1],FY[r][1]
    save(im.crop((x0+GIN,y0+GIN,x1-GIN,y1-GIN)).convert("RGBA").resize((64,64)),"field",f"{name}.png")
for (r,col),name in OBJ.items():
    t=remove_bg(im.crop((FX[col][0],FY[r][0],FX[col][1],FY[r][1]))); t.thumbnail((96,96)); save(t,"field",f"{name}.png")
p=remove_bg(im.crop((440,720,820,1200))); p.thumbnail((80,104)); save(p,"field","player.png")

# ---- dungeon tilesets (per zone): flat-magenta 4x2 sheets (1774x887). Every cell is a full-bleed
#      painted scene tile (floor/wall AND chest/entrance/deco) — these are NOT knocked-out objects,
#      they composite as opaque 384x384 painterly tiles. Layout (shared across all three sets):
#        row0: floor floor2 path wall   |   row1: rock chest entrance <deco>
#      where <deco> is per-set: warren=torch, grove=spores, vault=lantern. (grove col2=path is the
#      trail cell, col3=wall is the solid root-tangle.) Cell boxes are auto-detected from the magenta
#      gutters (mag_cells), then inset MAG_INSET px to clear the gutter's anti-aliased fringe, and
#      resized to TILE px square. Wired in field.ts when east of the gate. ----------------------
DUNGEON_SETS={"warren":"dungeon-warren-set.png","grove":"dungeon-grove-set.png","vault":"dungeon-vault-set.png",
 "seacave":"dungeon-seacave-set.png","stronghold":"dungeon-stronghold-set.png","keepvault":"dungeon-keepvault-set.png",
 "crypt":"dungeon-crypt-set.png","citadel":"dungeon-citadel-set.png","smuggden":"dungeon-smuggden-set.png"}
DECO={"warren":"torch","grove":"spores","vault":"lantern",
 "seacave":"glowweed","stronghold":"brazier","keepvault":"torch","crypt":"candles","citadel":"brazier","smuggden":"lamp"}
DSLOT={(0,0):"floor",(0,1):"floor2",(0,2):"path",(0,3):"wall",(1,0):"rock",(1,1):"chest",(1,2):"entrance"}
MAG_INSET=4   # trim the gutter's magenta anti-aliased edge before cropping a cell
TILE=384      # shipped dungeon tile size
def even_cells(W,H,ncols=4,nrows=2):
    """Fallback for a sheet whose magenta gutters mis-detect: split into an even ncols x nrows grid.
    Returns raw (lo,hi) bounds (no inset) so the shared crop applies MAG_INSET once, matching the
    auto-detected path exactly."""
    cw,ch=W/ncols,H/nrows
    cols=[(int(c*cw),int((c+1)*cw)) for c in range(ncols)]
    rows=[(int(r*ch),int((r+1)*ch)) for r in range(nrows)]
    return cols,rows
dtiles={}; dgrid_notes=[]
for setn,fn in DUNGEON_SETS.items():
    dim=Image.open(os.path.join(REF,fn)).convert("RGB")
    cols,rows=mag_cells(dim)
    if len(cols)!=4 or len(rows)!=2:   # gutter detection misfired -> even 4x2 grid w/ inset
        cols,rows=even_cells(*dim.size)
        dgrid_notes.append(f"{setn}: mag_cells gave {len(cols)}x{len(rows)}, fell back to even 4x2 grid")
    slots=dict(DSLOT); slots[(1,3)]=DECO[setn]
    for (r,c),cn in slots.items():
        x0,x1=cols[c]; y0,y1=rows[r]
        t=dim.crop((x0+MAG_INSET,y0+MAG_INSET,x1-MAG_INSET,y1-MAG_INSET)).resize((TILE,TILE),Image.LANCZOS)
        save(t,"field",f"{setn}-{cn}.png"); dtiles[f"{setn}-{cn}"]=t
for n in dgrid_notes: print("  grid:",n)

# ---- dungeon props (single object on flat magenta, 1254x1254): knock out the magenta, crop to
#      content, pad to a square (preserving aspect, content centred) and resize to TILE — so they
#      drop into a map cell as transparent over a floor tile, exactly like the live tiles. --------
DUNGEON_PROPS={"warren-rest":"prop-warren-rest.png","warren-rubble":"prop-warren-rubble.png"}
for name,fn in DUNGEON_PROPS.items():
    pim=chroma_key(Image.open(os.path.join(REF,fn)))
    bb=pim.getbbox()
    if bb: pim=pim.crop(bb)
    w,h=pim.size; s=max(w,h)
    sq=Image.new("RGBA",(s,s),(0,0,0,0)); sq.alpha_composite(pim,((s-w)//2,(s-h)//2))
    save(sq.resize((TILE,TILE),Image.LANCZOS),"field",f"{name}.png"); dtiles[name]=sq

# ---- TOWN tileset (issue #34): Dara's gold-on-dark town montage (1536x1024). NOT a clean grid —
#      buildings/objects are irregularly placed, so each sprite has a hand-measured crop box (x0,y0,
#      x1,y1) read off the sheet by eye. Ground swatches are kept OPAQUE and interior-cropped to
#      64x64 so they tile seamlessly (like the field/dungeon floors); buildings + props get the dark
#      bg knocked out via remove_bg + thumbnail so they sit over a ground tile. Filenames match what
#      the Field controller already looks up under field/. -------------------------------------
tim=Image.open(os.path.join(REF,"town-tiles.png"))
# GROUND swatches (opaque, interior-cropped -> 64x64). Boxes lifted from the bottom swatch row.
# Swatch cells are separated by a thin dark painted seam; boxes below are measured to the clean
# interior of each cell (verified by a column-darkness seam scan), so only a small trim is needed.
TOWN_GROUND={
 "town-cobble": (192,750,306,864),    # irregular grey cobblestone
 "town-cobble2":(338,750,448,860),    # radial/circular cobble variant (texture break-up)
 "town-dirt":   (590,752,688,850),    # brown dirt / path (diagonal-crack pattern)
 "town-grass":  (700,748,760,856),    # olive grass (gold-on-dark reads tan-olive, not bright green)
}
TGIN=8   # trim the painted seam between swatches before tiling
for name,(x0,y0,x1,y1) in TOWN_GROUND.items():
    save(tim.crop((x0+TGIN,y0+TGIN,x1-TGIN,y1-TGIN)).convert("RGBA").resize((64,64)),"field",f"{name}.png")
# OBJECTS. NOTE: unlike the figure/enemy sheets, this town art has NO luma gap between subject and
# surround — the blue-grey building roofs read at the same luma (~25-35) as the ambient dark bg, and
# the props sit on painted COBBLE ground (not a dark void). A border flood-fill knockout therefore
# eats the buildings/props themselves. So these are cropped OPAQUE, tight to each painted vignette
# (each is a self-contained gold-on-dark scene element that composites as a painterly tile). Buildings
# keep their baked-in INN/SUPPLIES/BLACKSMITH/REVIVE labels — they read as signage.
TOWN_OBJ={
 "town-inn":     ((8,18,302,300),     (160,160)),  # blue-roof cottage, "INN"
 "town-shop":    ((442,28,768,302),   (160,160)),  # awning storefront, "SUPPLIES"
 "town-smith":   ((812,12,1090,300),  (160,160)),  # forge w/ glowing fire, "BLACKSMITH"
 "town-revive":  ((1182,8,1492,304),  (160,160)),  # blue-glow crystal shrine, "REVIVE"
 "town-fountain":((10,425,338,730),   (150,150)),  # octagonal fountain on cobble pad
 "town-exit":    ((1338,432,1502,668),(150,150)),  # stone archway = town gate / leave marker
 # bonus props (used later)
 "town-well":    ((432,358,512,486),  (96,110)),
 "town-stall":   ((544,562,720,730),  (140,140)),  # blue/white striped awning market stall
 "town-statue":  ((1008,356,1115,564),(110,150)),  # figure on pedestal
 "town-signpost":((812,376,880,510),  (90,130)),   # post w/ arrow signs
 "town-barrel":  ((758,894,836,988),  (90,110)),
 "town-crate":   ((852,890,926,988),  (96,110)),
}
town={}
for name,(box,thumb) in TOWN_OBJ.items():
    t=tim.crop(box).convert("RGBA"); t.thumbnail(thumb); save(t,"field",f"{name}.png"); town[name]=t

# ---- TOWN SETS (per-town tilesets): five gold-on-dark sheets on flat #FF00FF (1402x1122), each a
#      clean 4 columns x 3 rows grid (12 cells, row-major). Each cell is either an [O] OPAQUE ground
#      swatch (a rounded painted patch with magenta around it -> keep opaque, tile edge-to-edge) or a
#      [K] KNOCKOUT object (magenta chroma-keyed to transparent, content-cropped, square-padded). The
#      magenta gutters on these sheets are noisy (painted highlights read as magenta, slivers split a
#      gutter), so mag_cells mis-detects the grid here; instead we use the EVEN 4x3 grid (cell ~350.5w
#      x 374h) inset a few px to clear the gutter fringe. Outputs land in field/ named per the map
#      below (the field renderer wires them up). Ground swatches resize to TGROUND px square (matching
#      the existing town ground swatches, town-cobble.png); objects square-pad + resize to TOBJ px
#      (matching town-inn.png / town-well.png). -----------------------------------------------------
TSET_COLS, TSET_ROWS = 4, 3
TSET_INSET = 6      # trim the even-grid cell to clear the magenta gutter's anti-aliased fringe
TGROUND = 96        # shipped town ground-swatch size (matches field/town-cobble.png)
TOBJ = 96           # shipped town object size (matches field/town-inn.png, field/town-well.png)
TG_FRAC = 0.32      # fraction inset from each side of the ground patch's content bbox -> clean interior
                    # (0.26 left a faint dark frame on the snowy fh-floor/fh-snow swatches; 0.32 takes a
                    #  tighter, flatter interior — fh-snow edge/center luma 0.87 -> 0.99 — no regression elsewhere)
def tset_box(W, H, r, c):
    cw, ch = W/TSET_COLS, H/TSET_ROWS
    return (int(c*cw)+TSET_INSET, int(r*ch)+TSET_INSET, int((c+1)*cw)-TSET_INSET, int((r+1)*ch)-TSET_INSET)
def tset_ground(im, r, c):
    """[O] swatch: crop the cell, find the non-magenta content bbox of the rounded patch, then take a
    centred square well INSIDE it (TG_FRAC inset per side) so no magenta edge survives -> seamless,
    opaque, tileable swatch."""
    sub = im.crop(tset_box(*im.size, r, c)).convert("RGB"); px = sub.load(); W, H = sub.size
    xs = [x for y in range(H) for x in range(W) if not is_magenta(px[x, y])]
    ys = [y for y in range(H) for x in range(W) if not is_magenta(px[x, y])]
    sub = sub.crop((min(xs), min(ys), max(xs)+1, max(ys)+1))
    w, h = sub.size; s = int(min(w, h)*(1-2*TG_FRAC)); cx, cy = w//2, h//2
    sq = sub.crop((cx-s//2, cy-s//2, cx-s//2+s, cy-s//2+s))
    return sq.resize((TGROUND, TGROUND), Image.LANCZOS)
def tset_object(im, r, c):
    """[K] object: chroma-key the magenta to transparent, crop to the content bbox, pad to a centred
    square (transparent corners), resize to TOBJ -> drops over a ground tile like the other props."""
    t = chroma_key(im.crop(tset_box(*im.size, r, c)))
    bb = t.getbbox()
    if bb: t = t.crop(bb)
    w, h = t.size; s = max(w, h)
    sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); sq.alpha_composite(t, ((s-w)//2, (s-h)//2))
    return sq.resize((TOBJ, TOBJ), Image.LANCZOS)
# Per-sheet cell map. Each entry: (row, col, name, kind) with kind 'O'=opaque ground / 'K'=knockout.
# Cells row-major: (0,0..3)=top row 1-4, (1,0..3)=middle 5-8, (2,0..3)=bottom 9-12.
def _tmap(prefix, names, kinds):
    out = {}
    for i, (nm, kd) in enumerate(zip(names, kinds)):
        out[(i//TSET_COLS, i%TSET_COLS)] = (f"{prefix}-{nm}", kd)
    return out
TOWN_SETS = {
 "town-elderbough-set.png": _tmap("eb",
   ["path","verge","wall","inn","shop","smith","shrine","gate","eldertree","well","lantern","fern"],
   "OOKKKKKKKKKK"),
 "town-wheatcross-set.png": _tmap("wc",
   ["road","verge","wall","inn","shop","smith","shrine","gate","rick","well","scarecrow","sacks"],
   "OOKKKKKKKKKK"),
 "town-wrackport-set.png": _tmap("wp",
   ["cobble","boardwalk","wall","inn","shop","smith","shrine","gate","sea","dock","mooring","wreck"],
   "OOKKKKKKOOKK"),   # cells 9 (sea) & 10 (dock) are OPAQUE terrain, not objects
 "town-frosthold-set.png": _tmap("fh",
   ["floor","snow","wall","inn","shop","smith","shrine","gate","hearth","well","pillar","ore"],
   "OOKKKKKKKKKK"),
 "town-lastlight-set.png": _tmap("ll",
   ["ground","verge","wall","inn","shop","smith","shrine","gate","bonfire","well","tower","shields"],
   "OOKKKKKKKKKK"),
 "town-sunpier-set.png": _tmap("sp",
   ["flag","verge","wall","inn","shop","smith","shrine","gate","sea","pier","lamp","cargo"],
   "OOKKKKKKOOKK"),   # cells 9 (sea) & 10 (pier) are OPAQUE terrain, like wrackport's sea/dock
 "town-vesperhal-set.png": _tmap("vh",
   ["flag","garth","wall","inn","shop","smith","shrine","gate","bell","well","cypress","flowers"],
   "OOKKKKKKKKKK"),
}
tsets = {}
for fn, cmap in TOWN_SETS.items():
    sim = Image.open(os.path.join(REF, fn))
    for (r, c), (name, kind) in cmap.items():
        t = tset_ground(sim, r, c) if kind == "O" else tset_object(sim, r, c)
        save(t, "field", f"{name}.png"); tsets[name] = (t, kind)

# ---- BIOME SETS (overworld terrain tilesets): three gold-on-dark sheets on flat #FF00FF
#      (1254x1254), each a clean 3 columns x 3 rows grid (9 cells, row-major). The magenta is ONLY in
#      the inter-cell gutters — every cell is a full-bleed painted scene tile (verified 0% interior
#      magenta), so this is NOT the town-set "isolated object on a magenta field" layout. The cell map
#      tags cells [O] (walkable ground -> seamless OPAQUE swatch, BGROUND px, matches field/grass.png)
#      vs [K] (obstacle/feature -> full-bleed OPAQUE scene tile, BOBJ px, matches field/oldtree.png).
#      [K] cells canNOT be cleanly knocked out to transparency from this source (see biome_object);
#      they ship opaque like the dungeon scene tiles. The magenta gutters detect cleanly (mag_cells
#      gives a solid 3x3), so we use that; an EVEN 3x3 grid is the fallback if a future sheet's gutters
#      mis-detect. Cells inset BSET_INSET px to clear the gutter fringe. Outputs land in field/ named
#      per the map below (the field renderer wires them up). ----------------------------------------
BSET_COLS, BSET_ROWS = 3, 3
BSET_INSET = 6      # trim the cell box to clear the magenta gutter's anti-aliased fringe
BGROUND = 96        # overworld ground-tile size — matches the existing field ground tiles
                    # (grass.png / meadow-ground / mire-ground are all 96px)
BOBJ = 96           # overworld object size (matches field/oldtree.png, field/fern.png)
BG_FRAC = 0.20      # inset from each side of a ground patch's content bbox -> clean seamless interior
def _biome_cells(im):
    """mag_cells -> (cols, rows) of content (lo,hi) between magenta gutters; fall back to an even 3x3
    if detection doesn't give exactly 3x3 (matching the DUNGEON_SETS even-grid fallback approach)."""
    cols, rows = mag_cells(im)
    if len(cols) != BSET_COLS or len(rows) != BSET_ROWS:
        W, H = im.size; cw, ch = W/BSET_COLS, H/BSET_ROWS
        cols = [(int(c*cw), int((c+1)*cw)) for c in range(BSET_COLS)]
        rows = [(int(r*ch), int((r+1)*ch)) for r in range(BSET_ROWS)]
        return cols, rows, True
    return cols, rows, False
def _biome_box(cols, rows, r, c):
    x0, x1 = cols[c]; y0, y1 = rows[r]
    return (x0+BSET_INSET, y0+BSET_INSET, x1-BSET_INSET, y1-BSET_INSET)
def biome_ground(im, box):
    """[O] swatch: crop the inset cell, find the non-magenta content bbox of the painted patch, then
    take a centred square well INSIDE it (BG_FRAC inset per side) so no magenta edge survives ->
    seamless, opaque, tileable overworld ground swatch at BGROUND px."""
    sub = im.crop(box).convert("RGB"); px = sub.load(); W, H = sub.size
    xs = [x for y in range(H) for x in range(W) if not is_magenta(px[x, y])]
    ys = [y for y in range(H) for x in range(W) if not is_magenta(px[x, y])]
    if not xs: return sub.resize((BGROUND, BGROUND), Image.LANCZOS)
    sub = sub.crop((min(xs), min(ys), max(xs)+1, max(ys)+1))
    w, h = sub.size; s = int(min(w, h)*(1-2*BG_FRAC)); cx, cy = w//2, h//2
    sq = sub.crop((cx-s//2, cy-s//2, cx-s//2+s, cy-s//2+s))
    return sq.resize((BGROUND, BGROUND), Image.LANCZOS)
def biome_object(im, box):
    """[K] object: IMPORTANT — on THIS source art the feature is painted FULL-BLEED into the cell.
    There is no magenta or flat-dark surround INSIDE a cell (magenta lives only in the inter-cell
    gutters, verified 0% interior magenta), so the town-set chroma-key knockout is a no-op here and a
    dark-border flood eats arbitrary dark patches of the painted scene (ragged, inconsistent). These
    cells are therefore sliced as full-bleed OPAQUE scene tiles — the honest result for the source —
    same treatment as the dungeon-set scene tiles, just sized to the overworld object box (BOBJ). The
    renderer can composite them as opaque obstacle tiles. Clean transparent overlay props are NOT
    extractable from this art; if Dara wants knockout props, he'd need to re-cut these cells as
    isolated objects on flat magenta (like the town-set object cells). Flagged in the deliverable."""
    t = im.crop(box).convert("RGBA")
    return t.resize((BOBJ, BOBJ), Image.LANCZOS)
def _bmap(names, kinds):
    """Row-major 3x3 cell map: (row,col) -> (name, kind). kinds string of 9 'O'/'K' chars."""
    return {(i//BSET_COLS, i%BSET_COLS): (nm, kd) for i, (nm, kd) in enumerate(zip(names, kinds))}
BIOME_SETS = {
 "biome-snow-set.png": _bmap(
   ["snow-ground","snow-ground2","snow-path","snow-crag","snow-ice","snow-frozen","snow-pine","snow-cairn","snow-rock"],
   "OOOKOOKKK"),
 "biome-coast-set.png": _bmap(
   ["coast-sand","coast-sand2","coast-grass","coast-rock","coast-surf","coast-sea","coast-dock","coast-pool","coast-piling"],
   "OOOKOOOKK"),
 "biome-ruin-set.png": _bmap(
   ["ruin-flag","ruin-flag2","ruin-walk","ruin-wall","ruin-rubble","ruin-grass","ruin-column","ruin-pit","ruin-brazier"],
   "OOOKKOKOK"),
}
bsets = {}; bgrid_notes = []
for fn, cmap in BIOME_SETS.items():
    bim = Image.open(os.path.join(REF, fn))
    cols, rows, fell_back = _biome_cells(bim.convert("RGB"))
    if fell_back: bgrid_notes.append(f"{fn}: mag_cells mis-detected, used even 3x3 grid")
    for (r, c), (name, kind) in cmap.items():
        box = _biome_box(cols, rows, r, c)
        t = biome_ground(bim, box) if kind == "O" else biome_object(bim, box)
        save(t, "field", f"{name}.png"); bsets[name] = (t, kind)
for n in bgrid_notes: print("  grid:", n)

# ---- enemies (Greenvale bestiary, lower figure band) ----
EB={"bandit":(12,380,300,815),"cutpurse":(312,380,600,815),"marauder":(614,380,902,815),
    "archer":(916,380,1204,815),"brute":(1218,380,1524,815)}
im=Image.open(os.path.join(REF,"enemies-greenvale-l1-5.jpeg")); ens={}
for k,b in EB.items():
    c=remove_bg(im.crop(b)); c.thumbnail((240,300)); save(c,"enemies",f"{k}.png"); ens[k]=c

# ---- ENEMY SETS (later-region rosters): Dara's per-region creature sheets, each on flat #FF00FF,
#      figures facing RIGHT, soft shadow. Five sheets, each a clean even grid (row-major). Unlike the
#      greenvale jpeg (dark-flood remove_bg), these are flat-magenta — so they chroma_key cleanly. Per
#      cell we crop the even-grid box, find the NON-MAGENTA content bbox inside it (creatures vary a lot
#      in size, so a fixed crop would clip a leviathan or float a wolf), chroma-key the magenta to
#      transparency, crop tight to the content, then thumbnail to (240,300) preserving aspect — the same
#      on-screen footprint as the greenvale roster (raider.png/dwolf.png = 199x300). Output enemies/{key}
#      .png is a pure drop-in: ui/render.enemySprite resolves enemies/{e.art||e.key}.png via the asset
#      glob, no data/art.ts change needed. Grids:
#        stormcoast  3x2 (5 used, last blank)   frostpeak 4x2 (7 used + 1 unmapped beast)
#        dawnfall    3x2 (5 used, last blank)   whisperhills 3x2 (5 used, last blank)
#        sunbridge   4x2 (8 used)  [the 1448x1086 sheet; content sits cleanly in 4 cols x 2 rows]
#      Mapping is row-major; None = a blank cell or an unmapped extra creature (skipped, reported).
def enemy_cell_bbox(im, x0, y0, x1, y1, step=2):
    """Non-magenta content bbox inside an even-grid cell (so per-creature size variation is honoured)."""
    px=im.load(); xs=[]; ys=[]
    for y in range(y0,y1,step):
        for x in range(x0,x1,step):
            if not is_magenta(px[x,y]): xs.append(x); ys.append(y)
    if not xs: return None
    return (max(x0,min(xs)-2), max(y0,min(ys)-2), min(x1,max(xs)+3), min(y1,max(ys)+3))
ENEMY_SETS={  # sheet -> (ncols, nrows, [keys row-major; None skips the cell])
 "enemies-stormcoast-set.png":  (3,2,["wrecker","cutthroat","deckhand","shellcrab","seaserpent",None]),
 "enemies-frostpeak-set.png":   (4,2,["icewolf","mtnreaver","frostshade","stonesentinel",
                                       "snowtroll","frostguardian","frostguardian-omega","rimespine"]),
 "enemies-dawnfall-set.png":    (3,2,["frontierbeast","brokenwatch","watchghoul","ruinhulk","fallenarcher",None]),
 "enemies-whisperhills-set.png":(3,2,["wraith","corruptmonk","flagellant","reliquarygolem","revenant",None]),
 "enemies-sunbridge-set.png":   (4,2,["siegetrooper","searaider","ballista","abyssspawn",
                                       "drowned","siegeram","leviathan","leviathan-omega"]),
}
for fn,(nc,nr,keys) in ENEMY_SETS.items():
    sim=Image.open(os.path.join(REF,fn)).convert("RGB"); W,H=sim.size; cw,ch=W/nc,H/nr
    for i,k in enumerate(keys):
        if k is None: continue
        r,c=i//nc,i%nc
        bb=enemy_cell_bbox(sim,int(c*cw),int(r*ch),int((c+1)*cw),int((r+1)*ch))
        if bb is None: print(f"  enemy: {fn} cell [{r},{c}] ({k}) is BLANK — skipped"); continue
        e=chroma_key(sim.crop(bb)); eb=e.getbbox()
        if eb: e=e.crop(eb)
        e.thumbnail((240,300)); save(e,"enemies",f"{k}.png"); ens[k]=e

# ---- TOWN NPC SETS (issue #34 town folk): seven gold-on-dark per-town sheets on flat #FF00FF
#      (1536x1024), each a clean 3 columns x 2 rows grid (6 figures, facing the viewer, soft shadow).
#      Same chroma-key approach as ENEMY_SETS: per cell, find the NON-MAGENTA content bbox inside the
#      even-grid cell (figures vary in build — a child vs a broad smith — so a fixed crop would clip
#      or float them), chroma-key the magenta to transparency, crop tight to content, square-pad
#      transparent (figure centred), then thumbnail to (240,300) preserving aspect — the same on-screen
#      footprint as the enemy roster (raider.png/dwolf.png = 199x300; the field renderer scales NPCs by
#      aspect, so a clean centred figure reads at parity with townfolk emoji it replaces). Outputs
#      npcs/{town}-{id}.png are a pure drop-in: field.ts loads npcs/<town>-<id>.png into
#      tiles["npc:<town>-<id>"] with an emoji fallback, no data/art.ts change needed. Cells map
#      row-major (1-3 top, 4-6 bottom) to each town's npc IDs in DESIGN order (data/towns.ts). --------
NPC_COLS, NPC_ROWS = 3, 2
NPC_SETS={  # sheet -> [npc id per cell, row-major]; order matches data/towns.ts SETTLEMENTS[town].npcs
 "npc-elderbough-set.png": ("elderbough", ["warden","keeper","child","innkeep","forager","cutter"]),
 "npc-wheatcross-set.png": ("wheatcross", ["reeve","guard","thresher","miller","child","merch"]),
 "npc-wrackport-set.png":  ("wrackport",  ["harbormaster","warden","netwife","child","wreckwise","innkeep"]),
 "npc-frosthold-set.png":  ("frosthold",  ["holdwarden","smithdwarf","loremaster","child","minehand","hearthkeep"]),
 "npc-lastlight-set.png":  ("lastlight",  ["commander","sentry","quartermaster","child","oldwatch","healer"]),
 "npc-vesperhal-set.png":  ("vesperhal",  ["abbot","bellkeep","scribe","child","pilgrim","herbalist"]),
 "npc-sunpier-set.png":    ("sunpier",    ["portmaster","crier","sailmaster","child","raidwise","innkeep"]),
}
npcs={}
for fn,(town,ids) in NPC_SETS.items():
    sim=Image.open(os.path.join(REF,fn)).convert("RGB"); W,H=sim.size; cw,ch=W/NPC_COLS,H/NPC_ROWS
    for i,nid in enumerate(ids):
        r,c=i//NPC_COLS,i%NPC_COLS
        bb=enemy_cell_bbox(sim,int(c*cw),int(r*ch),int((c+1)*cw),int((r+1)*ch))
        if bb is None: print(f"  npc: {fn} cell [{r},{c}] ({nid}) is BLANK — skipped"); continue
        n=chroma_key(sim.crop(bb)); nb=n.getbbox()
        if nb: n=n.crop(nb)
        w,h=n.size; s=max(w,h)   # square-pad transparent, figure centred
        sq=Image.new("RGBA",(s,s),(0,0,0,0)); sq.alpha_composite(n,((s-w)//2,(s-h)//2))
        sq.thumbnail((240,300)); save(sq,"npcs",f"{town}-{nid}.png"); npcs[f"{town}-{nid}"]=sq

# ---- bodies + heroes: weaponless base figures from the 45-class base-model grid (5 attunement
#      rows x 9 archetype columns). Class = attunement x archetype, so the paper-doll picks the
#      body matching a hero's CURRENT class — equipping a foreign-attunement weapon swaps the
#      body to match. Outputs bodies/{att}-{slug}.png for all 45; the four SOL party figures are
#      also written as heroes/{id}.png (sprite + identity fallback). They're weaponless, so the
#      rig overlays the equipped weapon on a clean hand (ADR 0004). ---------------------------
im=Image.open(os.path.join(REF,"class-bodies-45.png"))   # Dara's chroma-key sheet: figures on flat #FF00FF
BCOL=[198,352,505,659,813,966,1120,1274,1427]   # 9 archetype column centres
BROWC=[129,318,503,686,877]                      # 5 attunement row centres SOL..UMBRAXIS
BHW,BHH=76,92                                     # cell half-width / half-height (figures fit inside)
SLUG=["sword-shield","dual-swords","two-handed","hammer","daggers","pistols","rifle","staff","spellblade"]
HERO={(0,0):"dawnguard",(0,1):"sunblade",(0,7):"lightkeeper",(0,8):"dawnchaser"}  # (row,col)->id
bodies={}; her={}
# Normalize every figure onto a FIXED canvas whose aspect matches the doll box (62:74), figure
# centred horizontally and feet bottom-aligned. This makes all 45 bodies render identically in
# the box (same scale + position), so the weapon rig coordinates (data/art.ts) map 1:1 to the
# figure for every class — without this, trim-varying widths drift the held weapon off the body.
DOLL_W, DOLL_H = 248, 296   # 62:74 * 4
def fit_body(im, hfrac=0.97, wcap=0.99, bottom=0.99):
    # Normalize every hero to the SAME on-screen size: scale the figure to a fixed fraction of the
    # canvas HEIGHT (so a rifle/two-hander hero is the same height as a sword hero), only shrinking
    # if that would overrun the canvas width. Centred horizontally, feet bottom-aligned.
    im=im.convert("RGBA"); iw,ih=im.size
    r=DOLL_H*hfrac/ih
    if iw*r>DOLL_W*wcap: r=DOLL_W*wcap/iw
    fig=im.resize((max(1,int(iw*r)), max(1,int(ih*r))), Image.LANCZOS)
    canvas=Image.new("RGBA",(DOLL_W,DOLL_H),(0,0,0,0))
    canvas.alpha_composite(fig,((DOLL_W-fig.width)//2, max(0,int(DOLL_H*bottom)-fig.height)))
    return canvas
for ri,cy in enumerate(BROWC):
    for ci,cx in enumerate(BCOL):
        # chroma-key the magenta void, then drop any neighbour-cell sliver / stray spark, trim, fit
        c=keep_central(chroma_key(im.crop((cx-BHW,cy-BHH,cx+BHW,cy+BHH))), kx=0.80, ky=0.97, areafrac=0.06)
        bb=c.getbbox(); c=fit_body(c.crop(bb) if bb else c)
        save(c,"bodies",f"{ATT[ri]}-{SLUG[ci]}.png"); bodies[(ri,ci)]=c
        if (ri,ci) in HERO: save(c,"heroes",f"{HERO[(ri,ci)]}.png"); her[HERO[(ri,ci)]]=c

print(f"sliced (transparent): {sum(len(v) for v in items.values())} painterly weapons, "
      f"{len(armor)} armor sets, {len(ens)} enemies, {len(bodies)} class bodies ({len(her)} hero ids), "
      f"{len(town)+len(tsets)} town tiles, {len(bsets)} biome tiles, {len(npcs)} town npcs")

if PREVIEW:
    os.makedirs(os.path.join(REF,"_preview"),exist_ok=True)
    def scene(w,h):
        bg=Image.new("RGBA",(w,h),(0,0,0,255)); p=bg.load()
        for y in range(h):
            for x in range(w):
                d=((x-w/2)**2+(y-h/2)**2)**0.5; v=max(0,52-d*0.12)
                p[x,y]=(int(22+v),int(16+v*0.7),int(34+v*0.4),255)
        return bg
    units=list(ens.values())+list(her.values())
    m=scene(230*len(units),300)
    for i,u in enumerate(units):
        uu=u.copy(); uu.thumbnail((200,260)); m.alpha_composite(uu,(230*i+(230-uu.width)//2,(300-uu.height)//2))
    m.convert("RGB").save(os.path.join(REF,"_preview","units_clean.png"))
    # one montage per archetype (+armor): 5 attunement columns x 6 rarity rows
    for stem,grid in list(items.items())+[("armor",armor)]:
        g=scene(170*5,150*6)
        for (att,ri),it in grid.items():
            ii=it.copy(); ii.thumbnail((160,140)); ai=ATT.index(att)
            g.alpha_composite(ii,(170*ai+(170-ii.width)//2,150*ri+(150-ii.height)//2))
        g.convert("RGB").save(os.path.join(REF,"_preview",f"items_{stem}.png"))
    # all 45 bodies: 9 archetype columns x 5 attunement rows
    g=scene(120*9,210*5)
    for (ri,ci),b in bodies.items():
        bb=b.copy(); bb.thumbnail((112,200))
        g.alpha_composite(bb,(120*ci+(120-bb.width)//2,210*ri+(210-bb.height)//2))
    g.convert("RGB").save(os.path.join(REF,"_preview","bodies_45.png"))
    print("wrote previews")
