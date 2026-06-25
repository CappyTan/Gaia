// Pure presentation helpers: turn domain objects into HTML strings. No control flow, no
// game state mutation — just rendering. Swapping the renderer later means replacing this file.

import type { Attunement, Enemy, Item, Member, Unit } from "../types";
import { isArmorSlot } from "../types";
import { cap, clamp } from "../core/rng";
import { assetUrl } from "../core/assets";
import { WEAP_IMG, ARCH_SLUG, RIG, DEFAULT_WEAPON, BODY_LAYER, ARMOR_LAYER, BODY_SCALE } from "../data/art";

// Resolve a weapon's sprite. Prefers attunement-specific art (items/{stem}-{att}-{rarity}.png,
// e.g. a NOX blade gets the NOX painterly sprite) and falls back to the legacy SOL-keyed file
// (items/{stem}-{rarity}.png) so weapons still render before the per-attunement art is sliced.
export function weaponArt(cls: string, rarity: string, att?: string): string | null {
  const stem = WEAP_IMG[cls];
  if (!stem) return null;
  const a = (att || "SOL").toLowerCase();
  return assetUrl(`items/${stem}-${a}-${rarity}.png`) || assetUrl(`items/${stem}-${rarity}.png`);
}

// Armor sprite for a slot. Helmet / gloves / boots now have their OWN per-attunement × rarity art
// (items/{slot}-{att}-{rarity}.png); the chest slot ("armor") uses the armor set. Falls back to the
// chest art (then the legacy SOL-keyed file) so a piece always renders even if its art is missing.
export function armorArt(slot: string, rarity: string, att?: string): string | null {
  const a = (att || "SOL").toLowerCase();
  const slug = slot === "armor" ? "armor" : slot;
  return assetUrl(`items/${slug}-${a}-${rarity}.png`)
    || assetUrl(`items/armor-${a}-${rarity}.png`)
    || assetUrl(`items/armor-${rarity}.png`);
}

export function itemIcon(it: Item): string {
  // Armor-family slots (helmet/chest/gloves/boots) share the armor art set until each gets its
  // own sliced sprite; weapons use the per-archetype art; trinkets have none yet.
  const url = it.slot === "weapon" ? weaponArt(it.cls, it.rarity, it.att)
            : isArmorSlot(it.slot) ? armorArt(it.slot, it.rarity, it.att)
            : null;
  return url ? `<img class="ico" src="${url}" alt="">` : "";
}

// Weaponless body for a hero's CURRENT class (attunement × archetype), falling back to their
// identity portrait (heroes/{id}.png) then nothing. Reclassing via a weapon swaps the figure.
export function classBody(att: Attunement | undefined, archetype: string, id?: string): string {
  const slug = ARCH_SLUG[archetype];
  const a = (att || "SOL").toLowerCase();
  return (slug ? assetUrl(`bodies/${a}-${slug}.png`) : null)
    || (id ? assetUrl(`heroes/${id}.png`) : null) || "";
}

export function enemySprite(e: Enemy): string {
  const url = assetUrl(`enemies/${e.art || e.key}.png`); // variants reuse a base creature's art
  return url ? `<img class="spr-img" decoding="sync" src="${url}" alt="">` : `<div class="spr">${e.spr}</div>`;
}

export function heroSprite(m: Member): string {
  const url = classBody(m.att, m.cls, m.id);
  return url ? `<img class="spr-img" src="${url}" alt="${m.name}">` : `<div class="spr">${m.spr}</div>`;
}

// PAPER-DOLL COMPOSITOR (ADR 0004): a character is a STACK of aligned layers; equipping an
// item swaps a layer. Art-gated layers (BODY_LAYER / ARMOR_LAYER) draw with zero code change
// once that art exists.
export function renderDoll(m: Member): string {
  const id = m.id;
  const body = BODY_LAYER[id] || classBody(m.att, m.cls, id);
  // some bodies render small/large vs the shared sheet — scale to match, anchored at the feet.
  const sc = BODY_SCALE[`${m.att}:${m.cls}`];
  const ss = sc ? ` style="transform:scale(${sc});transform-origin:bottom center"` : "";
  let h = `<div class="doll"><img class="dl-body"${ss} decoding="sync" src="${body}" alt="${m.name}">`;
  const ar = m.equip && m.equip.armor;
  if (ar && ARMOR_LAYER[id] && ARMOR_LAYER[id][ar.rarity]) {
    h += `<img class="dl-layer"${ss} decoding="sync" src="${ARMOR_LAYER[id][ar.rarity]}" alt="">`;
  }
  // Weapon overlay DISABLED for now (Dara): the v2 class bodies already depict the held weapon,
  // and the separate weapon-sprite layer doesn't align cleanly over them. Revisit later — kept
  // here (and the RIG/WEAP_IMG tables in data/art.ts) so it's a one-line re-enable.
  // const w = m.equip && m.equip.weapon;
  // if (w && WEAP_IMG[w.cls]) {
  //   const r = RIG.weapon[w.cls] || DEFAULT_WEAPON;
  //   const url = weaponArt(w.cls, w.rarity, w.att) || "";
  //   const st = `left:${(r.x * 100).toFixed(1)}%;top:${(r.y * 100).toFixed(1)}%;width:${Math.round(r.scale * 100)}%;transform:translate(-50%,-50%) rotate(${r.rot}deg);`;
  //   h += `<img class="dl-wep g-${w.rarity}" style="${st}" src="${url}" alt="">`;
  // }
  return h + `</div>`;
}

export function itemHtml(it: Item, actionBtn?: string): string {
  const rc = "r-" + it.rarity,
    bc = "b-" + it.rarity;
  const aff = it.affixes.map((a) => `<div class="affix">• ${a.label(a.value)}</div>`).join("");
  const imp = Object.entries(it.implicit).map(([k, v]) => `+${v} ${k}`).join("  ");
  // weapon MNA grant — the main thing that unlocks/scales abilities (and sets the class)
  const mna = it.mna ? Object.entries(it.mna).filter(([, v]) => v).map(([a, v]) => `+${v} ${a} MNA`).join("  ") : "";
  // V3 primary attributes carried by the piece (STR/AGI/MGC/SPD/DEF) — feed the wearer's ability scaling
  const prim = it.prim ? Object.entries(it.prim).filter(([, v]) => v).map(([p, v]) => `+${v} ${p}`).join("  ") : "";
  const ico = itemIcon(it);
  return `<div class="item ${bc}" style="display:flex; gap:10px; align-items:flex-start">
    ${ico}
    <div style="flex:1; min-width:0">
      <div class="iname ${rc}">${it.name} <span class="meta">[${cap(it.rarity)} ${it.slot}${it.slot === "weapon" ? ` · ${it.att} ${it.cls}` : isArmorSlot(it.slot) && it.att ? ` · ${it.att}` : ""}${it.ilvl ? ` · i${it.ilvl}` : ""}]</span></div>
      <div class="meta">${imp}</div>${prim ? `<div class="affix" style="color:#e6c06a">◇ ${prim}</div>` : ""}${mna ? `<div class="affix" style="color:var(--atb)">◆ ${mna}</div>` : ""}${aff}${actionBtn || ""}
    </div></div>`;
}

export function statusBadges(u: Unit): string {
  const m: Record<string, string> = {
    burn: "burn", blind: "blind", regen: "regen", stun: "stun",
    atkup: "atkup", wardArmor: "def", poison: "regen", decay: "def", drain: "def",
  };
  let h = "";
  for (const k in u.status) {
    if (u.status[k] > 0 && m[k]) h += `<span class="badge ${m[k]}">${k.slice(0, 3)}</span>`;
  }
  return h;
}

export function pct(a: number, b: number): number {
  return clamp(Math.round((a / b) * 100), 0, 100);
}
