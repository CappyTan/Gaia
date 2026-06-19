#!/usr/bin/env python3
# slice-backgrounds.py — reproducible slicer for Dara's biome battle backgrounds.
# Source: assets/reference/terrain-backgrounds-15.png (1536x1024), a 5-col x 3-row grid of
# framed "cards". Each card has a thin gold frame and a caption pill below it; both are cropped
# OUT. We slice each card's interior at FULL native cell resolution, then upscale to a common
# long-edge target with LANCZOS + a mild unsharp so the browser does far less of its own stretch
# (the battle stage is ~920px wide and uses background-size:cover).
#   python3 app/tools/slice-backgrounds.py            # writes app/assets/backgrounds/{slug}.png
#   python3 app/tools/slice-backgrounds.py --preview  # also writes a labeled montage
#
# HONEST NOTE ON RESOLUTION: the per-cell native art is only ~295x288 px. Re-slicing from the
# 1536x1024 sheet recovers essentially the SAME pixels the current 283px crops hold — the gain
# here is (a) a clean crop that drops the gold frame/caption and (b) a high-quality LANCZOS
# pre-upscale so the browser isn't doing a raw ~3.3x bilinear blow-up. It is NOT new detail. To
# truly fill a 920px stage crisply Dara would need higher-res per-biome source art.
import sys, os
from PIL import Image, ImageFilter

ROOT=os.path.normpath(os.path.join(os.path.dirname(__file__),"..",".."))
REF=os.path.join(ROOT,"assets","reference","terrain-backgrounds-15.png")
OUT=os.path.join(ROOT,"app","assets","backgrounds")
PREVIEW="--preview" in sys.argv
TARGET=768  # long-edge target for the upscaled output

# Card interior crop boxes (x0,y0,x1,y1), measured from the sheet's luminance/gold-frame profile.
# Cols sit on dark gutters centered ~307/613/916/1223; rows' caption pills occupy the dark bands
# ~296-341 / 630-677 / 969+. Boxes are inset ~6px inside the gold frame to exclude it.
COLS=[(6,303),(312,609),(619,912),(922,1217),(1229,1521)]
ROWS=[(6,294),(344,628),(678,967)]
# grid position (row,col) -> output slug. Verified by eye against the captioned sheet.
GRID={
 (0,0):"plains",   (0,1):"forest",      (0,2):"desert",   (0,3):"mountains", (0,4):"swamp",
 (1,0):"cave",     (1,1):"ruins",       (1,2):"castle",   (1,3):"temple",    (1,4):"ai-facility",
 (2,0):"sol-sanctuary",(2,1):"nox-glacier",(2,2):"anima-hall",
 (2,3):"quanta-observatory",(2,4):"umbraxis-chamber",
}

def slice_cell(im, box):
    """Crop the card interior, upscale long edge -> TARGET with LANCZOS, mild unsharp."""
    c=im.crop(box).convert("RGB")
    w,h=c.size
    s=TARGET/max(w,h)
    c=c.resize((max(1,round(w*s)), max(1,round(h*s))), Image.LANCZOS)
    c=c.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    return c

def main():
    os.makedirs(OUT, exist_ok=True)
    im=Image.open(REF)
    done=[]
    for (r,col),slug in GRID.items():
        x0,x1=COLS[col]; y0,y1=ROWS[r]
        box=(x0,y0,x1,y1)
        nat=(x1-x0,y1-y0)
        out=slice_cell(im, box)
        out.save(os.path.join(OUT, slug+".png"))
        done.append((slug, nat, out.size))
    for slug,nat,sz in sorted(done):
        print(f"{slug:22s} native {nat[0]}x{nat[1]} -> {sz[0]}x{sz[1]}")

    if PREVIEW:
        cells=[(slug,Image.open(os.path.join(OUT,slug+".png")).convert("RGB")) for slug in
               [GRID[(r,c)] for r in range(3) for c in range(5)]]
        cw=260; ch=240; pad=8
        from PIL import ImageDraw
        m=Image.new("RGB",(5*(cw+pad)+pad,3*(ch+pad+18)+pad),(10,8,14))
        d=ImageDraw.Draw(m)
        for i,(slug,c) in enumerate(cells):
            r,col=divmod(i,5)
            tw=cw; th=ch
            cc=c.copy(); cc.thumbnail((tw,th),Image.LANCZOS)
            x=pad+col*(cw+pad); y=pad+r*(ch+pad+18)
            m.paste(cc,(x+(cw-cc.width)//2,y))
            d.text((x+4,y+ch+2),slug,fill=(230,200,120))
        pdir=os.path.join(ROOT,"assets","reference","_preview"); os.makedirs(pdir,exist_ok=True)
        p=os.path.join(pdir,"backgrounds_montage.png"); m.save(p)
        print("wrote preview:",p)

if __name__=="__main__":
    main()
