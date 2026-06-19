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

def cell(im, cx, cy, hw, htop, hbot=None, kx=0.85, ky=0.8, af=0.06):
    """Crop one grid cell (centre cx,cy; half-width hw; htop above / hbot below — asymmetric so
    a caption baked under the artwork can be trimmed), clear the dark bg, drop neighbour bleed,
    and trim to the artwork."""
    if hbot is None: hbot=htop
    c=keep_central(remove_bg(im.crop((int(cx-hw),int(cy-htop),int(cx+hw),int(cy+hbot)))), kx, ky, af)
    bb=c.getbbox()
    return c.crop(bb) if bb else c

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
          [(c,92) for c in (227,435,644,857,1074)], [151,259,380,490,602,716], (40,28), 0.85, 0.95, 0.05),
}
items={}
for stem,(fn,cols,rows,(htop,hbot),kx,ky,af) in WSHEETS.items():
    im=Image.open(os.path.join(REF,fn)); items[stem]={}
    for ai,(cx,hw) in enumerate(cols):
        for ri,cy in enumerate(rows):
            c=cell(im,cx,cy,hw,htop,hbot,kx,ky,af); c.thumbnail((300,160))
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

# ---- dungeon tilesets (per zone): Bandit Warren (Greenvale dungeon) + Drowned Vault (Duskmarsh
#      dungeon). Same 4-col grid; floor/wall tiles kept opaque + interior-cropped, chest + entrance
#      knocked out. Wired in field.ts when east of the gate. -----------------------------------
DUNGEONS={"warren":"dungeon-bandit-warren.png","vault":"dungeon-drowned-vault.png"}
DFX=[(40,300),(345,600),(640,895),(940,1195)]; DFY=[(60,300),(330,570),(600,840),(870,1150)]
DGROUND={(0,0):"floor",(0,1):"floor2",(0,2):"path",(1,0):"wall",(1,2):"rock"}  # opaque ground tiles
DOBJ={(2,1):"chest",(0,3):"entrance"}                                          # transparent objects
for name,fn in DUNGEONS.items():
    dim=Image.open(os.path.join(REF,fn))
    for (r,c),cn in DGROUND.items():
        x0,y0,x1,y1=DFX[c][0],DFY[r][0],DFX[c][1],DFY[r][1]
        save(dim.crop((x0+GIN,y0+GIN,x1-GIN,y1-GIN)).convert("RGBA").resize((64,64)),"field",f"{name}-{cn}.png")
    for (r,c),cn in DOBJ.items():
        t=remove_bg(dim.crop((DFX[c][0],DFY[r][0],DFX[c][1],DFY[r][1]))); t.thumbnail((96,96)); save(t,"field",f"{name}-{cn}.png")

# ---- enemies (Greenvale bestiary, lower figure band) ----
EB={"bandit":(12,380,300,815),"cutpurse":(312,380,600,815),"marauder":(614,380,902,815),
    "archer":(916,380,1204,815),"brute":(1218,380,1524,815)}
im=Image.open(os.path.join(REF,"enemies-greenvale-l1-5.jpeg")); ens={}
for k,b in EB.items():
    c=remove_bg(im.crop(b)); c.thumbnail((240,300)); save(c,"enemies",f"{k}.png"); ens[k]=c

# ---- bodies + heroes: weaponless base figures from the 45-class base-model grid (5 attunement
#      rows x 9 archetype columns). Class = attunement x archetype, so the paper-doll picks the
#      body matching a hero's CURRENT class — equipping a foreign-attunement weapon swaps the
#      body to match. Outputs bodies/{att}-{slug}.png for all 45; the four SOL party figures are
#      also written as heroes/{id}.png (sprite + identity fallback). They're weaponless, so the
#      rig overlays the equipped weapon on a clean hand (ADR 0004). ---------------------------
im=Image.open(os.path.join(REF,"class-base-models-45.png"))
BCOL=[253,386,525,663,810,958,1097,1235,1390]   # 9 archetype column centres
BROW=[132,335,530,721,896]                       # 5 attunement row centres (SOL..UMBRAXIS)
SLUG=["sword-shield","dual-swords","two-handed","hammer","daggers","pistols","rifle","staff","spellblade"]
HERO={(0,0):"dawnguard",(0,1):"sunblade",(0,7):"lightkeeper",(0,8):"dawnchaser"}  # (row,col)->id
bodies={}; her={}
# Normalize every figure onto a FIXED canvas whose aspect matches the doll box (62:74), figure
# centred horizontally and feet bottom-aligned. This makes all 45 bodies render identically in
# the box (same scale + position), so the weapon rig coordinates (data/art.ts) map 1:1 to the
# figure for every class — without this, trim-varying widths drift the held weapon off the body.
DOLL_W, DOLL_H = 248, 296   # 62:74 * 4
def fit_body(im, wcap=0.86, hfrac=0.97, bottom=0.99):
    im=im.convert("RGBA"); iw,ih=im.size
    r=min(DOLL_H*hfrac/ih, DOLL_W*wcap/iw)
    fig=im.resize((max(1,int(iw*r)), max(1,int(ih*r))))
    canvas=Image.new("RGBA",(DOLL_W,DOLL_H),(0,0,0,0))
    canvas.alpha_composite(fig,((DOLL_W-fig.width)//2, max(0,int(DOLL_H*bottom)-fig.height)))
    return canvas
for ri,cy in enumerate(BROW):
    for ci,cx in enumerate(BCOL):
        c=fit_body(cell(im,cx,cy,66,96,kx=0.78,ky=0.95,af=0.04))
        save(c,"bodies",f"{ATT[ri]}-{SLUG[ci]}.png"); bodies[(ri,ci)]=c
        if (ri,ci) in HERO: save(c,"heroes",f"{HERO[(ri,ci)]}.png"); her[HERO[(ri,ci)]]=c

print(f"sliced (transparent): {sum(len(v) for v in items.values())} painterly weapons, "
      f"{len(armor)} armor sets, {len(ens)} enemies, {len(bodies)} class bodies ({len(her)} hero ids)")

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
