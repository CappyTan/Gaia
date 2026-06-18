#!/usr/bin/env python3
# slice-art.py — the canonical, reproducible art pipeline. Slices Dara's reference sheets
# into the game's sprites AND knocks out the dark backgrounds to transparency (so figures
# sit flush in the battle scene instead of looking like cut-out rectangles).
#   python app/tools/slice-art.py            # writes app/assets/{items,enemies,heroes}/*.png
#   python app/tools/slice-art.py --preview  # also writes a verification montage
import sys, os, collections
from PIL import Image, ImageFilter

ROOT=os.path.normpath(os.path.join(os.path.dirname(__file__),"..",".."))
REF=os.path.join(ROOT,"assets","reference")
OUT=os.path.join(ROOT,"app","assets")
RAR=["common","uncommon","rare","epic","legendary","artifact"]
PREVIEW="--preview" in sys.argv

def remove_bg(im, luma=60, feather=1.2):
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
    return im.crop(im.getbbox() or (0,0,W,H))   # trim fully-transparent margins

def save(im, *parts):
    p=os.path.join(OUT,*parts); os.makedirs(os.path.dirname(p),exist_ok=True); im.save(p)

# ---- weapons (loot charts, leftmost column = the names the drop tables use) ----
LOOT=[("loot-sol-sword-shield.jpeg","sns",3,0.96,30,24),
      ("loot-sol-dual-swords.jpeg","dual",3,0.96,30,24),
      ("loot-sol-staves.jpeg","staff",5,0.80,30,24),
      ("loot-sol-spellblades.jpeg","spell",4,0.90,28,34)]
items={}
for fn,wk,cols,wfrac,ttop,tbot in LOOT:
    im=Image.open(os.path.join(REF,fn)); X0,Y0,X1,Y1=300,84,1536,1002; cw=(X1-X0)/cols; rh=(Y1-Y0)/6
    items[wk]=[]
    for r in range(6):
        c=im.crop((int(X0)+4,int(Y0+r*rh)+ttop,int(X0+cw*wfrac),int(Y0+(r+1)*rh)-tbot))
        c=remove_bg(c); c.thumbnail((300,150)); save(c,"items",f"{wk}-{RAR[r]}.png"); items[wk].append(c)

# ---- enemies (Greenvale bestiary, lower figure band) ----
EB={"bandit":(12,380,300,815),"cutpurse":(312,380,600,815),"marauder":(614,380,902,815),
    "archer":(916,380,1204,815),"brute":(1218,380,1524,815)}
im=Image.open(os.path.join(REF,"enemies-greenvale-l1-5.jpeg")); ens={}
for k,b in EB.items():
    c=remove_bg(im.crop(b)); c.thumbnail((240,300)); save(c,"enemies",f"{k}.png"); ens[k]=c

# ---- heroes (SOL row of the class grid, measured figure centers) ----
im=Image.open(os.path.join(REF,"classes-grid-45.jpeg")); center=lambda col:270+142*col
HC={"dawnguard":0,"sunblade":1,"lightkeeper":7,"dawnchaser":8}; HW=64; her={}
for hid,col in HC.items():
    c=remove_bg(im.crop((center(col)-HW,46,center(col)+HW,180))); c.thumbnail((200,220)); save(c,"heroes",f"{hid}.png"); her[hid]=c

print(f"sliced (transparent): {sum(len(v) for v in items.values())} weapons, {len(ens)} enemies, {len(her)} heroes")

if PREVIEW:
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
    g=scene(220*6,130*4)
    for ri,wk in enumerate(["sns","dual","staff","spell"]):
        for ci,it in enumerate(items[wk]):
            ii=it.copy(); g.alpha_composite(ii,(220*ci+(220-ii.width)//2,130*ri+(130-ii.height)//2))
    g.convert("RGB").save(os.path.join(REF,"_preview","items_clean.png"))
    print("wrote previews")
