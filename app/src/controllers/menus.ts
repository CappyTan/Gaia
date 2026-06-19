// Party / inventory / equip screens, and the universal overlay-close that prevents the
// post-battle Bag/Party menus from soft-locking the run.

import type { Attunement, Member } from "../types";
import { cap } from "../core/rng";
import { ATTUNEMENTS } from "../types";
import { SKILLS } from "../data/skills";
import { rarityIx } from "../data/rarity";
import { className } from "../data/classes";
import { recalc, xpForLevel, skillUnlocked } from "../systems/progression";
import { itemScore } from "../systems/loot";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Game } from "./game";

const respecCost = (m: Member): number => 20 + m.level * 5;

export const UI = {
  // Universal overlay close. Outside post-battle it just hides; after a victory it fires
  // Game.continueAfterBattle so the player can never get stranded in the Bag/Party menus.
  close(): void {
    if (Game._inMerchant) { Game.renderMerchant(); return; } // Party/Bag from the shop return to the shop
    Overlay.hide();
    if (Game.continueAfterBattle) { const fn = Game.continueAfterBattle; Game.continueAfterBattle = null; fn(); }
  },
  openParty(): void {
    let h = `<h2 class="title-gold">Party</h2><div class="scroll">`;
    Game.party.forEach((m) => {
      const arch = m.equip.weapon?.cls || m.cls;
      const cls = className(m.att, arch);
      // MNA allocator: show each tree's total (with a +button to spend points), plus respec.
      const showTree = (a: typeof ATTUNEMENTS[number]) => m.mna[a] > 0 || m.mnaPoints > 0 || a === m.att;
      const mnaRow = ATTUNEMENTS.filter(showTree).map((a) => {
        const tot = m.mna[a], fromGear = tot - m.mnaAlloc[a];
        const plus = m.mnaPoints > 0 ? ` <button class="btn" style="padding:0 6px;font-size:11px" onclick="UI.allocMna('${m.id}','${a}')">+</button>` : "";
        const archon = tot >= 100 ? " ⭐" : "";
        return `<span class="pill" title="${m.mnaAlloc[a]} from levels + ${fromGear} from gear">${a} <b>${tot}</b>${archon}${plus}</span>`;
      }).join(" ");
      const spent = ATTUNEMENTS.reduce((n, a) => n + m.mnaAlloc[a], 0);
      const respec = spent > 0 ? ` <button class="btn" style="padding:0 6px;font-size:11px" onclick="UI.respec('${m.id}')">Respec ${respecCost(m)}g</button>` : "";
      h += `<div class="card" style="margin:6px 0;text-align:left">
        <b style="color:var(--gold2)">${m.spr} ${m.name}</b> <span class="pill">${cls} · ${m.role}</span> <span class="pill">Lv ${m.level}</span>
        <div class="small">HP ${m.maxhp} · MP ${m.maxmp} · ATK ${m.atk} · MAG ${m.mag} · SPD ${m.spd} · ARM ${m.armor} · Crit ${m.critPct}%${m.solPct ? ` · +${m.solPct}% SOL` : ""}${m.leech ? ` · ${m.leech}% leech` : ""}</div>
        <div class="small" style="margin-top:4px">MNA${m.mnaPoints > 0 ? ` · <b class="r-legendary">${m.mnaPoints} point${m.mnaPoints > 1 ? "s" : ""} to spend</b>` : ""}: ${mnaRow}${respec}</div>
        <div class="small">XP ${m.xp}/${xpForLevel(m.level)}</div>
        <div class="grid2" style="margin-top:6px">${(["weapon", "armor", "trinket"] as const).map((slot) => {
        const it = m.equip[slot];
        return `<div class="equip-slot"><span><span class="tag">${slot}</span><br>${it ? `<span class="r-${it.rarity}">${it.name}</span>` : "<span class='small'>— empty —</span>"}</span>
            <button class="btn" onclick="UI.equipPicker('${m.id}','${slot}')">Swap</button></div>`;
      }).join("")}</div>
        <div class="small" style="margin-top:6px">Abilities: ${m.skills.map((k) => SKILLS[k]).map((s) => { const ok = skillUnlocked(m, s); return `<span class="${ok ? (s.ult ? "r-legendary" : "r-uncommon") : "small"}">${s.name}${ok ? "" : ` (${s.att} ${s.mnaReq})`}${s.ult ? " ★" : ""}</span>`; }).join(" · ")}</div>
      </div>`;
    });
    h += `</div><div class="row"><button class="btn gold" onclick="UI.close()">Close</button></div>`;
    Overlay.show(h);
  },
  equipPicker(memberId: string, slot: "weapon" | "armor" | "trinket"): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m) return;
    const usable = Game.inventory.filter((it) => it.slot === slot && (slot !== "weapon" || it.cls === m.cls));
    let h = `<h2 class="title-gold">${cap(slot)} — ${m.name}</h2>`;
    h += `<div class="small">Equipped: ${m.equip[slot] ? `<span class="r-${m.equip[slot]!.rarity}">${m.equip[slot]!.name}</span> (score ${itemScore(m.equip[slot]!)})` : "none"}</div>`;
    h += `<div class="scroll">`;
    if (usable.length === 0) h += `<p class="small">No ${slot === "weapon" ? m.cls + " " : ""}${slot}s in your bag.</p>`;
    usable.sort((a, b) => itemScore(b) - itemScore(a)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn" onclick="UI.doEquip('${memberId}','${slot}',${idx})">Equip (score ${itemScore(it)})</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Back</button></div>`;
    Overlay.show(h);
  },
  doEquip(memberId: string, slot: "weapon" | "armor" | "trinket", invIdx: number): void {
    const m = Game.party.find((x) => x.id === memberId);
    const it = Game.inventory[invIdx];
    if (!m || !it) return;
    const old = m.equip[slot];
    m.equip[slot] = it;
    Game.inventory.splice(invIdx, 1);
    if (old) Game.inventory.push(old);
    recalc(Game.party);
    this.equipPicker(memberId, slot);
  },
  // Spend one earned MNA point into an Attunement tree (manual allocation).
  allocMna(memberId: string, att: Attunement): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m || m.mnaPoints <= 0) return;
    m.mnaAlloc[att] += 1;
    m.mnaPoints -= 1;
    recalc(Game.party);
    this.openParty();
  },
  // Refund all allocated points (back to the spend pool) for a gold fee.
  respec(memberId: string): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m) return;
    const spent = ATTUNEMENTS.reduce((n, a) => n + m.mnaAlloc[a], 0);
    if (spent <= 0) return;
    const cost = respecCost(m);
    if (Game.gold < cost) return;
    Game.gold -= cost;
    m.mnaPoints += spent;
    ATTUNEMENTS.forEach((a) => (m.mnaAlloc[a] = 0));
    recalc(Game.party);
    this.openParty();
  },
  openInventory(): void {
    let h = `<h2 class="title-gold">Bag</h2><div class="small">${Game.inventory.length} items · ${Game.gold} gold</div><div class="scroll">`;
    if (Game.inventory.length === 0) h += `<p class="small">Empty. Win fights to find loot.</p>`;
    Game.inventory.slice().sort((a, b) => rarityIx(b.rarity) - rarityIx(a.rarity)).forEach((it) => { h += itemHtml(it); });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">To Party</button><button class="btn gold" onclick="UI.close()">Close</button></div>`;
    Overlay.show(h);
  },
};
