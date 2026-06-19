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

def cell(im, cx, cy, hw, hh, kx=0.85, ky=0.8, af=0.06):
    """Crop one grid cell (centre cx,cy; half-size hw,hh), clear the dark bg, drop neighbour
    bleed, and trim to the artwork."""
    c=keep_central(remove_bg(im.crop((int(cx-hw),int(cy-hh),int(cx+hw),int(cy+hh)))), kx, ky, af)
    bb=c.getbbox()
    return c.crop(bb) if bb else c

def save(im, *parts):
    p=os.path.join(OUT,*parts); os.makedirs(os.path.dirname(p),exist_ok=True); im.save(p)

# ---- weapons: Dara's painterly loot sheets. Each is a 5-attunement (cols, SOL..UMBRAXIS) x
#      6-rarity (rows) grid -> items/{stem}-{att}-{rarity}.png. The SOL column is also saved as
#      the legacy items/{stem}-{rarity}.png so older lookups still resolve. -------------------
ROWCY=[160,265,375,486,595,713]   # rarity-row centres, shared by all three painterly sheets
# stem -> (sheet, [(col-centre, half-width) per attunement], row half-height, kx, ky, areafrac)
WSHEETS={
 "sns":  ("loot-sword-shield-painterly.png",
          [(283,95),(524,113),(798,113),(1076,119),(1371,121)], 62, 0.86, 0.72, 0.05),
 "staff":("loot-staff-painterly.png",
          [(c,95) for c in (256,467,683,898,1116)], 62, 0.85, 0.82, 0.06),
 "spell":("loot-spellblade-painterly.png",
          [(c,92) for c in (227,435,644,857,1074)], 60, 0.85, 0.82, 0.06),
}
items={}
for stem,(fn,cols,hh,kx,ky,af) in WSHEETS.items():
    im=Image.open(os.path.join(REF,fn)); items[stem]={}
    for ai,(cx,hw) in enumerate(cols):
        for ri,cy in enumerate(ROWCY):
            c=cell(im,cx,cy,hw,hh,kx,ky,af); c.thumbnail((300,160))
            save(c,"items",f"{stem}-{ATT[ai]}-{RAR[ri]}.png")
            if ai==0: save(c,"items",f"{stem}-{RAR[ri]}.png")   # legacy SOL-keyed fallback
            items[stem][(ATT[ai],ri)]=c

# ---- dual swords: no painterly multi-attunement sheet yet -> keep the SOL slices from the
#      original loot chart (leftmost column = the drop-table names). -------------------------
im=Image.open(os.path.join(REF,"loot-sol-dual-swords.jpeg")); X0,Y0,X1,Y1=300,84,1536,1002
cw=(X1-X0)/3; rh=(Y1-Y0)/6
for r in range(6):
    c=im.crop((int(X0)+4,int(Y0+r*rh)+30,int(X0+cw*0.96),int(Y0+(r+1)*rh)-24))
    c=remove_bg(c); c.thumbnail((300,150))
    save(c,"items",f"dual-{RAR[r]}.png"); save(c,"items",f"dual-sol-{RAR[r]}.png")

# ---- enemies (Greenvale bestiary, lower figure band) ----
EB={"bandit":(12,380,300,815),"cutpurse":(312,380,600,815),"marauder":(614,380,902,815),
    "archer":(916,380,1204,815),"brute":(1218,380,1524,815)}
im=Image.open(os.path.join(REF,"enemies-greenvale-l1-5.jpeg")); ens={}
for k,b in EB.items():
    c=remove_bg(im.crop(b)); c.thumbnail((240,300)); save(c,"enemies",f"{k}.png"); ens[k]=c

# ---- heroes: weaponless SOL base bodies from the 45-class base-model grid (row 0 = SOL).
#      These replace the old pre-equipped portraits, so the paper-doll can overlay the equipped
#      weapon on a clean hand (ADR 0004). Columns: 0 S&S, 1 Dual, 7 Staff, 8 Spellblade. ------
im=Image.open(os.path.join(REF,"class-base-models-45.png"))
HCOL={"dawnguard":253,"sunblade":386,"lightkeeper":1235,"dawnchaser":1390}; her={}
for hid,cx in HCOL.items():
    c=cell(im,cx,145,66,92,kx=0.8,ky=0.92,af=0.04); c.thumbnail((200,240))
    save(c,"heroes",f"{hid}.png"); her[hid]=c

print(f"sliced (transparent): {sum(len(v) for v in items.values())} painterly weapons + 6 dual, "
      f"{len(ens)} enemies, {len(her)} weaponless heroes")

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
    # one montage per archetype: 5 attunement columns x 6 rarity rows
    for stem in items:
        g=scene(170*5,120*6)
        for (att,ri),it in items[stem].items():
            ii=it.copy(); ii.thumbnail((160,110)); ai=ATT.index(att)
            g.alpha_composite(ii,(170*ai+(170-ii.width)//2,120*ri+(120-ii.height)//2))
        g.convert("RGB").save(os.path.join(REF,"_preview",f"items_{stem}.png"))
    print("wrote previews")
