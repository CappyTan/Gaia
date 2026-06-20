// Party / inventory / equip screens, and the universal overlay-close that prevents the
// post-battle Bag/Party menus from soft-locking the run.

import type { Attunement, Item, Member, Skill, Slot } from "../types";
import { cap } from "../core/rng";
import { ATTUNEMENTS, EQUIP_SLOTS } from "../types";
import { SKILLS } from "../data/skills";
import { rarityIx } from "../data/rarity";
import { className } from "../data/classes";
import { ATT } from "../data/attunements";
import { recalc, xpForLevel, skillUnlocked, unlockedSkills } from "../systems/progression";
import { itemScore } from "../systems/loot";
import { itemHtml } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Game, sellPriceOf } from "./game";

const respecCost = (m: Member): number => 20 + m.level * 5;
const TARGET_LABEL: Record<string, string> = { enemy: "one enemy", allEnemies: "all enemies", ally: "one ally", allAllies: "whole party", self: "self" };
const skillKind = (s: Skill): string => (s.ult ? "ULTIMATE" : s.type === "phys" ? "Physical" : s.type === "mag" ? "Magic" : s.type === "heal" ? "Heal" : s.type === "buff" ? "Buff" : "Utility");

export const UI = {
  // Universal overlay close. Outside post-battle it just hides; after a victory it fires
  // Game.continueAfterBattle so the player can never get stranded in the Bag/Party menus.
  close(): void {
    if (Game._inMerchant) { Game.renderMerchant(); return; } // Party/Bag from the shop return to the shop
    if (Game._inTown) { Game.backToTown(); return; }          // Party/Bag in town return to the town field
    Overlay.hide();
    if (Game.continueAfterBattle) { const fn = Game.continueAfterBattle; Game.continueAfterBattle = null; fn(); }
  },
  openParty(): void {
    let h = `<h2 class="title-gold">Party</h2><div class="scroll">`;
    Game.party.forEach((m) => {
      const arch = m.equip.weapon?.cls || m.cls;
      const cls = className(m.att, arch);
      // MNA allocator: one full-width, thumb-friendly row per Attunement tree (Dara: the inline
      // pills + tiny "+" were hard to tap). Each row has a big +/- and a clear total.
      const showTree = (a: typeof ATTUNEMENTS[number]) => m.mna[a] > 0 || m.mnaPoints > 0 || a === m.att;
      const spent = ATTUNEMENTS.reduce((n, a) => n + m.mnaAlloc[a], 0);
      const pool = m.mnaPoints;
      const poolBar = `<div class="mna-pool"><span>MNA points <span style="opacity:.6">(levels + gear)</span></span>${pool > 0 ? `<b class="r-legendary">${pool} to spend</b>` : `<span class="small">all spent</span>`}</div>`;
      const mnaRows = ATTUNEMENTS.filter(showTree).map((a) => {
        const tot = m.mna[a], fromGear = tot - m.mnaAlloc[a];
        const archon = tot >= 100 ? " ⭐" : "";
        const dec = m.mnaAlloc[a] > 0 ? `<button class="btn mna-btn" onclick="UI.deallocMna('${m.id}','${a}')" aria-label="remove ${a} point">−</button>` : "";
        const inc = pool > 0 ? `<button class="btn gold mna-btn" onclick="UI.allocMna('${m.id}','${a}')" aria-label="add ${a} point">+</button>` : "";
        return `<div class="mna-row" style="border-color:${ATT[a].color}55">
          <span class="mna-name" style="color:${ATT[a].color}">${a}${archon}</span>
          <span class="mna-tot">${tot}</span>
          <span class="mna-sub">${m.mnaAlloc[a]} lvl + ${fromGear} gear</span>
          ${dec}${inc}</div>`;
      }).join("");
      h += `<div class="card" style="margin:6px 0;text-align:left">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <b style="color:var(--gold2);font-size:16px">${m.spr} ${m.name}</b>
          <span class="pill" style="color:${ATT[m.att].color};border-color:${ATT[m.att].color}66">${cls} · ${m.role}</span>
          <span class="pill">Lv ${m.level}</span></div>
        <div class="small" style="margin-top:6px">HP ${m.maxhp} · MP ${m.maxmp} · ATK ${m.atk} · MAG ${m.mag} · SPD ${m.spd} · ARM ${m.armor} · Crit ${m.critPct}%${m.solPct ? ` · +${m.solPct}% Power` : ""}${m.leech ? ` · ${m.leech}% leech` : ""}</div>
        <div class="small" style="opacity:.6">XP ${m.xp}/${xpForLevel(m.level)}</div>
        <div class="psec">Attunement (MNA)</div>
        ${poolBar}${mnaRows}
        ${spent > 0 ? `<div class="row" style="justify-content:flex-start;margin-top:4px"><button class="btn" style="min-height:40px" onclick="UI.respec('${m.id}')">Respec all · ${respecCost(m)}g</button></div>` : ""}
        <div class="psec">Gear</div>
        <div class="grid2">${EQUIP_SLOTS.map((slot) => {
        const it = m.equip[slot];
        return `<div class="equip-slot"><span><span class="tag">${slot}</span><br>${it ? `<span class="r-${it.rarity}">${it.name}</span>` : "<span class='small'>— empty —</span>"}</span>
            <button class="btn" onclick="UI.equipPicker('${m.id}','${slot}')">Swap</button></div>`;
      }).join("")}</div>
        <div class="psec">Abilities</div>
        <div class="small">${unlockedSkills(m).length}/${m.skills.length} unlocked <button class="btn" style="padding:9px 14px;font-size:13px;min-height:40px" onclick="UI.skillTree('${m.id}')">Skill Tree ▸</button></div>
      </div>`;
    });
    h += `</div><div class="row"><button class="btn gold" onclick="UI.close()">Close</button></div>`;
    Overlay.show(h);
  },
  equipPicker(memberId: string, slot: Slot): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m) return;
    const usable = Game.inventory.filter((it) => it.slot === slot && (slot !== "weapon" || it.cls === m.cls));
    let h = `<h2 class="title-gold">${cap(slot)} — ${m.name}</h2>`;
    h += `<div class="small">Equipped: ${m.equip[slot] ? `<span class="r-${m.equip[slot]!.rarity}">${m.equip[slot]!.name}</span> (score ${itemScore(m.equip[slot]!)})` : "none"}</div>`;
    h += `<div class="scroll">`;
    if (usable.length === 0) h += `<p class="small">No ${slot === "weapon" ? m.cls + " " : ""}${slot}s in your bag.</p>`;
    usable.sort((a, b) => itemScore(b) - itemScore(a)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      // a weapon of a different attunement reclasses the hero — say so up front
      const reclass = slot === "weapon" && it.att && it.att !== m.att ? `<br><span class="r-legendary" style="font-size:11px">Reclass → ${className(it.att, it.cls)}</span>` : "";
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn" onclick="UI.doEquip('${memberId}','${slot}',${idx})">Equip (score ${itemScore(it)})${reclass}</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Back</button></div>`;
    Overlay.show(h);
  },
  doEquip(memberId: string, slot: Slot, invIdx: number): void {
    const m = Game.party.find((x) => x.id === memberId);
    const it = Game.inventory[invIdx];
    if (!m || !it) return;
    const old = m.equip[slot];
    m.equip[slot] = it;
    Game.inventory.splice(invIdx, 1);
    if (old) Game.inventory.push(old);
    recalc(Game.party);
    Game.saveNow(); // autosave on equip change (ADR 0007)
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
  // Take one point back out of a tree (free undo for a mis-tap; whole-tree respec still costs gold).
  deallocMna(memberId: string, att: Attunement): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m || m.mnaAlloc[att] <= 0) return;
    m.mnaAlloc[att] -= 1;
    m.mnaPoints += 1;
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
  // Skill-tree visualizer: the hero's kit laid out by MNA threshold, with what each does.
  skillTree(memberId: string): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m) return;
    const arch = m.equip.weapon?.cls || m.cls;
    const tree = m.att, cur = m.mna[tree];
    let h = `<h2 class="title-gold">${className(tree, arch)}</h2>`;
    h += `<div class="small">${m.spr} ${m.name} · ${tree} tree · MNA <b>${cur}</b>${cur >= 100 ? ` · <span class="r-legendary">ARCHON</span>` : ""}</div>`;
    h += `<div class="small" style="opacity:.7;margin-bottom:4px">Raise ${tree} MNA (level points + ${tree} gear) to unlock these.</div><div class="scroll">`;
    const kit = m.skills.map((k) => SKILLS[k]).sort((a, b) => a.mnaReq - b.mnaReq);
    kit.forEach((s) => {
      const ok = cur >= s.mnaReq;
      const gate = ok ? `<span class="r-uncommon">✓ unlocked</span>` : `<span class="small">needs ${s.mnaReq} ${tree} (${s.mnaReq - cur} more)</span>`;
      // locked: dim the header/gate row only — keep the description readable so players can
      // plan toward what they haven't unlocked yet.
      h += `<div class="card" style="margin:6px 0;text-align:left;border-color:${ok ? (s.ult ? "var(--legendary)" : "var(--gold)") : "var(--line)"}">
        <div style="${ok ? "" : "opacity:.6"}"><b class="${ok ? (s.ult ? "r-legendary" : "r-uncommon") : ""}">${s.name}</b>${s.ult ? " ★" : ""} <span class="pill">${tree} ${s.mnaReq}</span> ${gate}</div>
        <div class="tag" style="margin:2px 0">${skillKind(s)} · ${TARGET_LABEL[s.target] ?? s.target}${s.mp ? ` · ${s.mp} MP` : " · free"}</div>
        <div class="small" style="color:var(--ink)">${s.desc}</div>
      </div>`;
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button><button class="btn gold" onclick="UI.close()">Close</button></div>`;
    Overlay.show(h);
  },
  openInventory(): void {
    const selling = Game._inMerchant; // the merchant buys loot off you while you're shopping
    let h = `<h2 class="title-gold">Bag</h2><div class="small">${Game.inventory.length} items · ${Game.gold} gold${selling ? " · sell unwanted loot to the merchant" : ""}</div><div class="scroll">`;
    if (Game.inventory.length === 0) h += `<p class="small">Empty. Win fights to find loot.</p>`;
    Game.inventory.slice().sort((a, b) => rarityIx(b.rarity) - rarityIx(a.rarity)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      const sell = selling ? ` <button class="btn" onclick="Game.sellItem(${idx})">Sell · ${sellPriceOf(it)}g</button>` : "";
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn gold" onclick="UI.equipChooser(${idx})">Equip ▸</button>${sell}</div>`);
    });
    h += `</div><div class="row">${selling ? `<button class="btn gold" onclick="Game.renderMerchant()">◂ Shop</button>` : ""}<button class="btn" onclick="UI.openParty()">To Party</button><button class="btn${selling ? "" : " gold"}" onclick="UI.close()">Close</button></div>`;
    Overlay.show(h);
  },

  // Effective stats a member WOULD have with `it` equipped (no mutation) — for the equip preview.
  _equipPreview(m: Member, it: Item): Member {
    const clone = { ...m, equip: { ...m.equip, [it.slot]: it }, _init: true } as Member;
    recalc([clone]);
    return clone;
  },
  // Click loot in the bag -> choose which hero to equip it on, with green/red stat deltas (Dara).
  equipChooser(invIdx: number): void {
    const it = Game.inventory[invIdx];
    if (!it) { this.openInventory(); return; }
    let h = `<h2 class="title-gold">Equip</h2>${itemHtml(it)}<div class="small" style="margin-top:4px">Choose a hero — arrows show stat changes:</div><div class="scroll">`;
    const stat = (label: string, cur: number, nxt: number) =>
      cur === nxt ? "" : `<span style="color:${nxt > cur ? "#aef0a0" : "#e8888c"}">${label} ${cur}→${nxt}${nxt > cur ? "↑" : "↓"}</span>`;
    Game.party.forEach((m) => {
      const c = this._equipPreview(m, it);
      const deltas = [
        stat("HP", m.maxhp, c.maxhp), stat("ATK", m.atk, c.atk), stat("MAG", m.mag, c.mag),
        stat("DEF", m.armor, c.armor), stat("SPD", m.spd, c.spd), stat("MP", m.maxmp, c.maxmp),
        stat("Crit", m.critPct, c.critPct),
        ...ATTUNEMENTS.map((a) => stat(`${a} MNA`, m.mna[a], c.mna[a])),
      ].filter(Boolean).join(" · ");
      const reclass = it.slot === "weapon" && (c.att !== m.att || c.cls !== m.cls)
        ? ` <span class="r-legendary" style="font-size:11px">→ ${className(c.att, c.cls)}</span>` : "";
      const replaces = m.equip[it.slot] ? `<span class="small" style="opacity:.6"> (replaces ${m.equip[it.slot]!.name})</span>` : "";
      h += `<div class="card" style="margin:6px 0;text-align:left">
        <b style="color:${ATT[m.att].color}">${m.spr} ${m.name}</b> <span class="pill">${m.cls}</span>${reclass}${replaces}
        <div class="small" style="margin-top:4px">${deltas || "no stat change"}</div>
        <div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn gold" onclick="UI.doEquipFromBag('${m.id}',${invIdx})">Equip on ${m.name}</button></div>
      </div>`;
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openInventory()">◂ Bag</button></div>`;
    Overlay.show(h);
  },
  doEquipFromBag(memberId: string, invIdx: number): void {
    const m = Game.party.find((x) => x.id === memberId);
    const it = Game.inventory[invIdx];
    if (!m || !it) { this.openInventory(); return; }
    const slot = it.slot as Slot;
    const old = m.equip[slot];
    m.equip[slot] = it;
    Game.inventory.splice(invIdx, 1);
    if (old) Game.inventory.push(old);
    recalc(Game.party);
    Game.saveNow(); // autosave on equip change (ADR 0007)
    this.openInventory();
  },
};
