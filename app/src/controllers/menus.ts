// Party / inventory / equip screens, and the universal overlay-close that prevents the
// post-battle Bag/Party menus from soft-locking the run.

import type { Attunement, Item, Member, Skill, Slot } from "../types";
import { cap } from "../core/rng";
import { ATTUNEMENTS, EQUIP_SLOTS } from "../types";
import { SKILLS } from "../data/skills";
import { rarityIx } from "../data/rarity";
import { className } from "../data/classes";
import { ATT } from "../data/attunements";
import { recalc, xpForLevel, skillUnlocked, unlockedSkills, mnaBonus } from "../systems/progression";
import { itemScore } from "../systems/loot";
import { gearScore } from "../systems/gearScore";
import { HELD_ITEMS, type HeldKind, type HeldItemDef } from "../data/heldItems";
import { itemHtml, classBody } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Game, sellPriceOf } from "./game";
import { Field } from "./field";

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
  // ── PARTY HUB (FF-style main menu): a left roster list (sprite · name · Lv · class · attunement ·
  //    MNA · HP · MP) and a right column of sub-menu options, with location + Aether pinned bottom-right.
  openParty(): void { Overlay.show(this.partyHubHtml(), true); },
  // Where the party currently is, for the hub's info box.
  location(): string {
    if (Game._inTown) return Field.town?.name ?? "Town";
    if (Field.bigMapActive() && !Field.bigZone) return "Open Aurelion";
    return Field.zone().name;
  },
  partyHubHtml(): string {
    const roster = Game.party.map((m) => {
      const arch = m.equip.weapon?.cls || m.cls;
      const col = ATT[m.att].color;
      const body = classBody(m.att, arch) || "";
      return `<div class="pm-mem">
        <div class="pm-spr">${body ? `<img src="${body}" alt="">` : `<span class="spr">${m.spr}</span>`}</div>
        <div class="pm-stat">
          <div class="pm-name">${m.name}${m.alive ? "" : ` <span class="r-rare" style="font-size:11px">fallen</span>`}</div>
          <div class="pm-line">Lv ${m.level} · <span style="color:${col}">${className(m.att, arch)}</span></div>
          <div class="pm-line"><span style="color:${col}">${m.att}</span> · MNA ${m.mna[m.att]}${m.mna[m.att] >= 100 ? " ⭐" : ""}</div>
          <div class="pm-line">HP <b>${Math.max(0, m.hp)}</b> / ${m.maxhp}</div>
          <div class="pm-line">MP <b>${m.mp}</b> / ${m.maxmp}</div>
        </div></div>`;
    }).join("");
    const opts: [string, string][] = [
      ["Items", "UI.partyItems()"], ["Abilities", "UI.partyAbilities()"], ["Equipment", "UI.partyEquipment()"],
      ["Mana", "UI.partyMana()"], ["Formation", "UI.partyFormation()"],
    ];
    const menu = opts.map(([label, fn]) => `<button class="btn pm-opt" onclick="${fn}">${label}</button>`).join("");
    return `<h2 class="title-gold" style="margin-bottom:6px">Party</h2>
      <div class="pm-hub">
        <div class="pm-roster scroll">${roster}</div>
        <div class="pm-side">
          <div class="pm-menu">${menu}</div>
          <div class="pm-info">
            <div><span class="pm-info-k">Location</span><br><b class="title-gold">${this.location()}</b></div>
            <div style="margin-top:8px"><span class="pm-info-k">Aether</span><br><b class="title-gold">◈ ${Game.gold}</b></div>
          </div>
        </div>
      </div>
      <div class="row"><button class="btn gold" onclick="UI.close()">Close</button></div>`;
  },

  // ── ITEMS — the held-item inventory (quest/key items + consumables), distinct from the loot Bag.
  //    Key items (the raft, future keys/sigils) are held forever; consumables (none yet) will stack here.
  partyItems(): void {
    const held = [...Game.heldItems].map((id) => HELD_ITEMS[id]).filter((d): d is HeldItemDef => !!d);
    const section = (kind: HeldKind, title: string, empty: string): string => {
      const items = held.filter((d) => d.kind === kind);
      let s = `<div class="psec">${title}</div>`;
      if (!items.length) return s + `<p class="small" style="opacity:.7;margin:4px 0 8px">${empty}</p>`;
      items.forEach((d) => {
        // a demoted "Opens: …" line tells the player WHAT a traversal key item is for (not just flavor).
        const opens = d.opens ? `<div class="tag" style="margin-top:6px">Opens: ${d.opens}</div>` : "";
        s += `<div class="card" style="text-align:left;margin:6px 0">
          <b class="title-gold">${d.icon} ${d.name}</b>
          <p class="small" style="margin-top:6px">${d.blurb}</p>${opens}</div>`;
      });
      return s;
    };
    Overlay.show(`<h2 class="title-gold">Items</h2>
      <div class="scroll">
        ${section("key", "Quest Items", "None yet — quest and traversal items appear here as you explore.")}
        ${section("consumable", "Consumables", "None yet — potions and antidotes will gather here.")}
      </div>
      <div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button></div>`);
  },

  // ── ABILITIES: every hero's kit by MNA threshold (unlocked vs locked); heal abilities can be cast
  //    here to mend the LIVING party out of battle (spends MP). ──────────────────────────────────
  partyAbilities(): void {
    let h = `<h2 class="title-gold">Abilities</h2>
      <div class="small" style="opacity:.78">Raise a hero's Attunement MNA to unlock abilities. A 🟢 heal can be cast here to mend the party out of battle (spends MP).</div>
      <div class="scroll">`;
    Game.party.forEach((m) => {
      const arch = m.equip.weapon?.cls || m.cls;
      h += `<div class="card" style="text-align:left;margin:6px 0">
        <b style="color:${ATT[m.att].color}">${m.spr} ${m.name}</b> <span class="pill">${className(m.att, arch)}</span> <span class="pill">${m.att} MNA ${m.mna[m.att]}</span>`;
      const kit = m.skills.map((k) => ({ k, s: SKILLS[k] })).filter((x) => x.s).sort((a, b) => a.s.mnaReq - b.s.mnaReq);
      kit.forEach(({ k, s }) => {
        const ok = m.mna[s.att] >= s.mnaReq;
        const canHeal = ok && s.type === "heal" && m.alive && m.mp >= s.mp;
        const useBtn = canHeal ? ` <button class="btn gold" style="padding:3px 8px;font-size:11px;min-height:0" onclick="UI.useHeal('${m.id}','${k}')">Cast · ${s.mp} MP</button>` : "";
        const gate = ok ? "" : ` <span class="small">needs ${s.mnaReq - m.mna[s.att]} more ${s.att}</span>`;
        h += `<div class="pm-ab${ok ? "" : " locked"}">
          <span class="${ok ? (s.ult ? "r-legendary" : "r-uncommon") : ""}">${s.type === "heal" ? "🟢 " : ok ? "✓ " : "🔒 "}${s.name}</span>
          <span class="pill">${s.att} ${s.mnaReq}</span>${gate}${useBtn}</div>`;
      });
      h += `</div>`;
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button></div>`;
    Overlay.show(h);
  },
  useHeal(memberId: string, key: string): void {
    const m = Game.party.find((x) => x.id === memberId), s = SKILLS[key];
    if (!m || !s || s.type !== "heal" || !m.alive) return;
    if (m.mna[s.att] < s.mnaReq || m.mp < s.mp) return;
    m.mp -= s.mp;
    const amt = Math.round((m.mag * (s.power ?? 0) + 6) * (1 + mnaBonus(m.mna.ANIMA ?? 0)));
    Game.party.forEach((t) => { if (t.alive) t.hp = Math.min(t.maxhp, t.hp + amt); }); // mends the LIVING party
    recalc(Game.party); Game.saveNow();
    this.partyAbilities();
  },

  // ── EQUIPMENT: per-hero gear (full stats + affixes) with a side panel of that hero's TOTAL stats ─
  partyEquipment(memberId?: string): void {
    const m = (memberId && Game.party.find((x) => x.id === memberId)) || Game.party[0];
    if (!m) return;
    const tabs = Game.party.map((p) => `<button class="btn${p.id === m.id ? " gold" : ""}" style="padding:6px 10px;font-size:12px" onclick="UI.partyEquipment('${p.id}')">${p.spr} ${p.name.split(" ")[0]}</button>`).join("");
    const gear = EQUIP_SLOTS.map((slot) => {
      const it = m.equip[slot];
      const btn = `<div class="row" style="justify-content:flex-start;margin-top:4px"><button class="btn" style="padding:6px 12px;font-size:12px" onclick="UI.equipPicker('${m.id}','${slot}')">${it ? "Swap" : "Equip"} ${slot} ▸</button></div>`;
      return it ? itemHtml(it, btn) : `<div class="item" style="opacity:.7"><span class="tag">${slot}</span> — empty —${btn}</div>`;
    }).join("");
    const gs = gearScore(m);
    const totals = `<div class="card pm-eq-tot" style="text-align:left">
      <b class="title-gold">${m.name} — Totals</b>
      <div class="gscore">
        <span><span class="gs-k">Offense</span><b>${gs.offense}</b></span>
        <span><span class="gs-k">Defense</span><b>${gs.defense}</b></span>
        <span><span class="gs-k">Overall</span><b class="title-gold">${gs.overall}</b></span>
      </div>
      <div class="small" style="opacity:.55;margin-top:2px">Higher is better · Overall = Offense + Defense</div>
      <div class="small" style="margin-top:6px;line-height:1.7">HP <b>${m.maxhp}</b><br>MP <b>${m.maxmp}</b><br>ATK <b>${m.atk}</b><br>MAG <b>${m.mag}</b><br>SPD <b>${m.spd}</b><br>ARM <b>${m.armor}</b><br>Crit <b>${m.critPct}%</b>${m.leech ? `<br>Leech <b>${m.leech}%</b>` : ""}</div>
      <div class="psec">+MNA</div>
      <div class="small">${ATTUNEMENTS.filter((a) => m.mna[a] > 0).map((a) => `<span style="color:${ATT[a].color}">${a} ${m.mna[a]}</span>`).join(" · ") || "—"}</div>
    </div>`;
    Overlay.show(`<h2 class="title-gold">Equipment</h2>
      <div class="row" style="flex-wrap:wrap;gap:4px;justify-content:flex-start">${tabs}</div>
      <div class="pm-eq">
        <div class="pm-eq-gear scroll">${gear}</div>
        ${totals}
      </div>
      <div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button></div>`, true);
  },

  // ── MANA: spend earned MNA points per hero (full-width thumb rows; ±1 and respec). ─────────────
  partyMana(): void {
    let h = `<h2 class="title-gold">Mana (MNA)</h2>
      <div class="small" style="opacity:.78">Spend earned points into an Attunement tree to unlock & power abilities. Reach 100 for Archon (the ultimate).</div>
      <div class="scroll">`;
    Game.party.forEach((m) => {
      const showTree = (a: typeof ATTUNEMENTS[number]) => m.mna[a] > 0 || m.mnaPoints > 0 || a === m.att;
      const spent = ATTUNEMENTS.reduce((n, a) => n + m.mnaAlloc[a], 0);
      const pool = m.mnaPoints;
      const poolBar = `<div class="mna-pool"><span>${m.spr} ${m.name} · MNA points</span>${pool > 0 ? `<b class="r-legendary">${pool} to spend</b>` : `<span class="small">all spent</span>`}</div>`;
      const rows = ATTUNEMENTS.filter(showTree).map((a) => {
        const tot = m.mna[a], fromGear = tot - m.mnaAlloc[a];
        const dec = m.mnaAlloc[a] > 0 ? `<button class="btn mna-btn" onclick="UI.deallocMna('${m.id}','${a}')" aria-label="remove ${a}">−</button>` : "";
        const inc = pool > 0 ? `<button class="btn gold mna-btn" onclick="UI.allocMna('${m.id}','${a}')" aria-label="add ${a}">+</button>` : "";
        return `<div class="mna-row" style="border-color:${ATT[a].color}55">
          <span class="mna-name" style="color:${ATT[a].color}">${a}${tot >= 100 ? " ⭐" : ""}</span>
          <span class="mna-tot">${tot}</span><span class="mna-sub">${m.mnaAlloc[a]} lvl + ${fromGear} gear</span>${dec}${inc}</div>`;
      }).join("");
      h += `<div class="card" style="text-align:left;margin:6px 0">${poolBar}${rows}
        ${spent > 0 ? `<div class="row" style="justify-content:flex-start;margin-top:4px"><button class="btn" style="min-height:40px" onclick="UI.respec('${m.id}')">Respec all · ◈ ${respecCost(m)}</button></div>` : ""}</div>`;
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button></div>`;
    Overlay.show(h);
  },

  // ── FORMATION: assign each hero Front/Back; the line stays a 3×2 or 2×3 (min 2, max 3 in front). ─
  partyFormation(note = ""): void {
    const front = Game.party.filter((m) => m.row !== "back").length;
    let h = `<h2 class="title-gold">Formation</h2>
      <div class="small" style="opacity:.8">The FRONT row is struck first and shields the BACK row (casters/ranged). Keep a 3×2 (3 front) or 2×3 (2 front) line.</div>
      <div class="card" style="text-align:left;margin:8px 0"><b class="title-gold">${front} Front / ${5 - front} Back &nbsp;·&nbsp; ${front}×${5 - front}</b>${note ? `<div class="small" style="color:#e8b27a;margin-top:4px">${note}</div>` : ""}</div>
      <div class="scroll">`;
    Game.party.forEach((m) => {
      const isFront = m.row !== "back";
      h += `<div class="pm-form">
        <span><b style="color:${ATT[m.att].color}">${m.spr} ${m.name}</b> <span class="pill">${m.role}</span></span>
        <span style="display:flex;gap:4px"><button class="btn${isFront ? " gold" : ""}" style="padding:6px 12px" onclick="UI.setRow('${m.id}','front')">Front</button><button class="btn${!isFront ? " gold" : ""}" style="padding:6px 12px" onclick="UI.setRow('${m.id}','back')">Back</button></span>
      </div>`;
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.openParty()">◂ Party</button></div>`;
    Overlay.show(h);
  },
  setRow(memberId: string, row: "front" | "back"): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m || m.row === row) return;
    const front = Game.party.filter((x) => x.row !== "back").length;
    if (row === "front" && front >= 3) { this.partyFormation("Front row is full (max 3) — move someone back first."); return; }
    if (row === "back" && front <= 2) { this.partyFormation("Keep at least 2 heroes in the front line."); return; }
    m.row = row; recalc(Game.party); Game.saveNow();
    this.partyFormation();
  },
  // Clicking an equipped item opens a window with its full stats (Dara). Swap from here too.
  showGear(memberId: string, slot: Slot): void {
    const m = Game.party.find((x) => x.id === memberId);
    const it = m?.equip[slot];
    if (!m || !it) return;
    Overlay.show(`<h2 class="title-gold">${cap(slot)} — ${m.name}</h2>${itemHtml(it)}
      <div class="small" style="opacity:.7;margin-top:4px">Score ${itemScore(it)}</div>
      <div class="row"><button class="btn gold" onclick="UI.equipPicker('${m.id}','${slot}')">Swap ▸</button>
        <button class="btn" onclick="UI.openParty()">◂ Back</button></div>`);
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
      // Show the OVERALL gear-score delta (the "is this an upgrade?" signal) instead of an opaque raw score,
      // matching the bag→equip flow (equipChooser). Green up / red down.
      const ov = gearScore(m).overall, nv = gearScore(this._equipPreview(m, it)).overall;
      const od = nv === ov ? `Overall ${nv}` : `Overall <span style="color:${nv > ov ? "#aef0a0" : "#e8888c"}">${ov}→${nv}${nv > ov ? "↑" : "↓"}</span>`;
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn" onclick="UI.doEquip('${memberId}','${slot}',${idx})">Equip · ${od}${reclass}</button></div>`);
    });
    h += `</div><div class="row"><button class="btn" onclick="UI.partyEquipment('${memberId}')">◂ Equipment</button></div>`;
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
  // Re-render the Mana screen but KEEP the scroll position (so rapid +/- clicks don't jump to the
  // top — Dara). Overlay.show replaces the markup, so we snapshot/restore the scroller's scrollTop.
  reopenManaKeepScroll(): void {
    const top = document.querySelector<HTMLElement>("#overlayInner .scroll")?.scrollTop ?? 0;
    this.partyMana();
    const sc = document.querySelector<HTMLElement>("#overlayInner .scroll");
    if (sc) sc.scrollTop = top;
  },
  // Spend one earned MNA point into an Attunement tree (manual allocation).
  allocMna(memberId: string, att: Attunement): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m || m.mnaPoints <= 0) return;
    m.mnaAlloc[att] += 1;
    m.mnaPoints -= 1;
    recalc(Game.party);
    this.reopenManaKeepScroll();
  },
  // Take one point back out of a tree (free undo for a mis-tap; whole-tree respec still costs gold).
  deallocMna(memberId: string, att: Attunement): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m || m.mnaAlloc[att] <= 0) return;
    m.mnaAlloc[att] -= 1;
    m.mnaPoints += 1;
    recalc(Game.party);
    this.reopenManaKeepScroll();
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
    let h = `<h2 class="title-gold">Bag</h2><div class="small">${Game.inventory.length} items · ◈ ${Game.gold} Aether${selling ? " · sell unwanted loot to the merchant" : ""}</div><div class="scroll">`;
    if (Game.inventory.length === 0) h += `<p class="small">Empty. Win fights to find loot.</p>`;
    Game.inventory.slice().sort((a, b) => rarityIx(b.rarity) - rarityIx(a.rarity)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      const sell = selling ? ` <button class="btn" onclick="Game.sellItem(${idx})">Sell · ◈ ${sellPriceOf(it)}</button>` : "";
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
      const gNow = gearScore(m), gNext = gearScore(c);
      const score = [
        stat("Offense", gNow.offense, gNext.offense), stat("Defense", gNow.defense, gNext.defense),
        stat("Overall", gNow.overall, gNext.overall),
      ].filter(Boolean).join(" · ");
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
        ${score ? `<div class="small" style="margin-top:4px;font-weight:bold">${score}</div>` : ""}
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
