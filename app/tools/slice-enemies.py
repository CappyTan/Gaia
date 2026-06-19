#!/usr/bin/env python3
# slice-enemies.py — reproducible slicer for Dara's enemy roster sheets into the game's
# per-enemy battle sprites (RGBA, ~199x300 portrait, matching enemies/archer.png convention).
#   python3 app/tools/slice-enemies.py            # writes app/assets/enemies/{key}.png
#   python3 app/tools/slice-enemies.py --preview  # also writes a montage for verification
# These sheets sit on a DARK VIGNETTE (not pure black), so a plain luminance->alpha would eat
# the creatures' dark armor/shadow edges. We knock out the background by FLOOD-FILLING from the
# crop borders through near-background pixels: the interior dark (armor, fur, shadow) is kept
# because it isn't border-connected. Captions/headers are excluded by the crop boxes' y-bands.
import sys, os, collections
from PIL import Image, ImageFilter

ROOT=os.path.normpath(os.path.join(os.path.dirname(__file__),"..",".."))
REF=os.path.join(ROOT,"assets","reference")
OUT=os.path.join(ROOT,"app","assets","enemies")
PREVIEW="--preview" in sys.argv
CANVAS=(199,300)   # final portrait convention (matches archer.png/bandit.png)

def remove_bg(im, luma=30, sat=14, feather=1.1):
    """Flood-fill from the borders through BACKGROUND pixels -> alpha 0. A pixel is background if
    it is dark (<luma) AND near-neutral (max-min channel < sat). The neutral test is what saves the
    creatures: their dark fur/armor/shadow is warm-tinted (e.g. (41,20,2)) so it reads as colored,
    not background, even when as dark as the near-black vignette -- so the flood-fill stops at the
    silhouette instead of tunnelling through dark seams. Interior dark stays opaque anyway (not
    border-connected). Feather softens the cut edge."""
    im=im.convert("RGBA"); W,H=im.size; px=im.load()
    L=lambda p:0.299*p[0]+0.587*p[1]+0.114*p[2]
    def isbg(p):
        return L(p)<luma and (max(p[0],p[1],p[2])-min(p[0],p[1],p[2]))<sat
    bg=[[False]*W for _ in range(H)]; dq=collections.deque()
    def seed(x,y):
        if isbg(px[x,y]) and not bg[y][x]: bg[y][x]=True; dq.append((x,y))
    for x in range(W): seed(x,0); seed(x,H-1)
    for y in range(H): seed(0,y); seed(W-1,y)
    while dq:
        x,y=dq.popleft()
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<W and 0<=ny<H and not bg[ny][nx] and isbg(px[nx,ny]):
                bg[ny][nx]=True; dq.append((nx,ny))
    a=Image.new("L",(W,H),255); ap=a.load()
    for y in range(H):
        for x in range(W):
            if bg[y][x]: ap[x,y]=0
    im.putalpha(a.filter(ImageFilter.GaussianBlur(feather)))
    return im

def keep_central(im, kx=0.92, ky=0.92, areafrac=0.04):
    """Drop neighbour/caption bleed: label opaque blobs (BFS) and keep only those big enough AND
    reasonably central. Discards slivers from adjacent creature cells."""
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

def fit(im, w=CANVAS[0], h=CANVAS[1], wcap=0.96, hcap=0.97):
    """Trim to content, scale to fit the portrait canvas (keep aspect), center, pad transparent."""
    im=im.convert("RGBA"); bb=im.getbbox()
    if bb: im=im.crop(bb)
    iw,ih=im.size
    r=min(w*wcap/iw, h*hcap/ih)
    fig=im.resize((max(1,int(iw*r)), max(1,int(ih*r))))
    canvas=Image.new("RGBA",(w,h),(0,0,0,0))
    canvas.alpha_composite(fig,((w-fig.width)//2,(h-fig.height)//2))
    return canvas

def slice_cell(im, box, luma=30, kx=0.92, ky=0.92, af=0.04):
    return fit(keep_central(remove_bg(im.crop(box), luma=luma), kx, ky, af))

def save(im, key):
    os.makedirs(OUT, exist_ok=True); im.save(os.path.join(OUT, key+".png"))

# ---- SOURCE 1: enemies-roster.png. Two rows of creatures over a dark vignette; section
#      headers + per-creature captions are cropped OUT via the y-bands. Boxes are (x0,y0,x1,y1)
#      measured from column/row brightness profiles. Top row captions ~y120-132 (excluded by
#      y0>=165); header ~y60-72. Bottom row captions ~y672-708 (excluded by y0>=735). ----------
# key -> (box=(x0,y0,x1,y1), luma). The golden/bright Greenvale creatures cut cleanly at the
# default luma; the dark Drowned Vault creatures (spider abdomen, bat wings, troll/leper shadow)
# are near-black AND near-neutral, indistinguishable from the vignette by color -- so they need a
# LOWER luma (~18) that removes only true near-black backdrop and stops the flood at their bodies.
# A faint dark halo can survive on the lighter test backdrop but is invisible on the battle scene.
ROSTER={
 # top row (Greenvale) — y band 165..555
 "slime":   ((40, 175, 210, 555), 30),
 "kobold":  ((228, 165, 456, 555), 30),
 "gbandit": ((516, 165, 666, 555), 30),
 "gmage":   ((720, 165, 918, 555), 30),
 "kingpin": ((966, 165, 1272, 555), 30),
 # bottom row (Drowned Vault) — y band 735..1100 (dark creatures: low luma)
 "leper":   ((18, 735, 222, 1100), 20),
 "spider":  ((258, 735, 534, 1100), 18),
 "rat":     ((558, 735, 746, 1100), 18),
 "troll":   ((752, 735, 1248, 1100), 20),
}
out={}
im=Image.open(os.path.join(REF,"enemies-roster.png"))
for key,(box,luma) in ROSTER.items():
    c=slice_cell(im, box, luma=luma)
    save(c, key); out[key]=c

# ---- SOURCE 2: rare-hogger.png. Single creature on near-black; "Hogger (Rare)" title at top is
#      cropped out via y0 below the title. -----------------------------------------------------
him=Image.open(os.path.join(REF,"rare-hogger.png")); HW,HH=him.size
c=slice_cell(him, (0, int(HH*0.13), HW, HH), luma=20)
save(c, "hogger"); out["hogger"]=c

print("sliced enemies:", ", ".join(f"{k} {v.size[0]}x{v.size[1]}" for k,v in out.items()))

if PREVIEW:
    pdir=os.path.join(REF,"_preview"); os.makedirs(pdir,exist_ok=True)
    def scene(w,h):
        bg=Image.new("RGBA",(w,h),(0,0,0,255)); p=bg.load()
        for y in range(h):
            for x in range(w):
                d=((x-w/2)**2+(y-h/2)**2)**0.5; v=max(0,52-d*0.05)
                p[x,y]=(int(22+v),int(16+v*0.7),int(34+v*0.4),255)
        return bg
    units=list(out.items())
    m=scene(215*len(units),330)
    from PIL import ImageDraw
    d=ImageDraw.Draw(m)
    for i,(k,u) in enumerate(units):
        uu=u.copy(); m.alpha_composite(uu,(215*i+(215-uu.width)//2,8))
        d.text((215*i+6,312), k, fill=(230,200,120,255))
    m.convert("RGB").save(os.path.join(pdir,"enemies_roster_clean.png"))
    print("wrote preview:", os.path.join(pdir,"enemies_roster_clean.png"))
