// Party / inventory / equip screens, and the universal overlay-close that prevents the
// post-battle Bag/Party menus from soft-locking the run.
//
// VISUAL LANGUAGE (wave6e): these menus follow the dashboard style Dara ratified on the class
// picker (.cpx) — card-per-hero with Attunement accent stripes, chip rows, uppercase letterspaced
// section headers, the gold-dark gradient panel family. Everything is scoped under `.mnx`
// (index.html) so nothing leaks to other windows. Phone-first: ≥40px touch targets.

import type { Item, Member, Skill, Slot } from "../types";
import { cap } from "../core/rng";
import { ATTUNEMENTS, EQUIP_SLOTS } from "../types";
import { SKILLS } from "../data/skills";
import { rarityIx } from "../data/rarity";
import { classTitle } from "../data/classes";
import { ATT } from "../data/attunements";
import { PRIMARY_STATS, STAT_TIERS } from "../data/statScaling";
import { recalc, mnaBonus, mnaFloor } from "../systems/progression";
import { hasSpec } from "../systems/classKit";
import { ClassPicker } from "./classPicker";
import { itemScore } from "../systems/loot";
import { gearScore } from "../systems/gearScore";
import { substats } from "../systems/stats";
import { HELD_ITEMS, type HeldKind, type HeldItemDef } from "../data/heldItems";
import { MATERIALS } from "../data/materials";
import { CONSUMABLES } from "../data/consumables";
import { itemHtml, classBody, pct } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Game, sellPriceOf } from "./game";
import { Field } from "./field";

const TARGET_LABEL: Record<string, string> = { enemy: "one enemy", allEnemies: "all enemies", ally: "one ally", allAllies: "whole party", self: "self" };
const skillKind = (s: Skill): string => (s.ult ? "ULTIMATE" : s.type === "phys" ? "Physical" : s.type === "mag" ? "Magic" : s.type === "heal" ? "Heal" : s.type === "buff" ? "Buff" : "Utility");
// One .mnx chip — the small bordered tag used across the restyled menus.
const chip = (inner: string, style = ""): string => `<span class="mchip"${style ? ` style="${style}"` : ""}>${inner}</span>`;
// Read-only derived-MNA chip (ADR 0021): total = floor(level/5) in the active tree + gear. There is
// no allocator any more — this is a read-out, with the breakdown so the sourcing stays legible.
const mnaChip = (m: Member): string => {
  const tot = m.mna[m.att], lvl = mnaFloor(m.level), gear = Math.max(0, tot - lvl);
  return chip(`<span style="color:${ATT[m.att].color}">${m.att}</span> MNA <b>${tot}</b>${tot >= 100 ? " ⭐" : ""} · ${lvl} lvl + ${gear} gear`);
};

export const UI = {
  // Universal overlay close. Outside post-battle it just hides; after a victory it fires
  // Game.continueAfterBattle so the player can never get stranded in the Bag/Party menus.
  close(): void {
    if (Game._inMerchant) { Game.renderMerchant(); return; } // Party/Bag from the shop return to the shop
    if (Game._inTown) { Game.backToTown(); return; }          // Party/Bag in town return to the town field
    Overlay.hide();
    if (Game.continueAfterBattle) { const fn = Game.continueAfterBattle; Game.continueAfterBattle = null; fn(); }
  },
  // ── PARTY HUB (FF-style main menu): a left roster of hero CARDS (sprite · name · Lv/class/MNA
  //    chips · HP bar) and a right column of sub-menu options, with location + Aether pinned bottom-right.
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
      const hpPct = pct(Math.max(0, m.hp), m.maxhp);
      return `<div class="mcard mhero" style="border-left-color:${col}">
        <div class="pm-spr">${body ? `<img src="${body}" alt="">` : `<span class="spr">${m.spr}</span>`}</div>
        <div class="mh-body">
          <div class="mname">${m.name}${m.alive ? "" : ` <span style="color:var(--artifact);font-size:11px">✝ fallen</span>`}</div>
          <div class="mchips">${chip(`Lv <b>${m.level}</b>`)}${chip(`<span style="color:${col}">${classTitle(m.att, arch, m.mna[m.att])}</span>`)}${mnaChip(m)}</div>
          <div class="mh-hp"><div class="mbar${hpPct <= 30 ? " low" : ""}"><i style="width:${hpPct}%"></i></div><span class="mh-hpv">HP <b style="color:var(--mink)">${Math.max(0, m.hp)}</b> / ${m.maxhp}</span></div>
        </div></div>`;
    }).join("");
    const opts: [string, string][] = [
      ["Items", "UI.partyItems()"], ["Abilities", "UI.partyAbilities()"], ["Status &amp; Equipment", "UI.partyEquipment()"],
      ["Formation", "UI.partyFormation()"],
    ];
    const menu = opts.map(([label, fn]) => `<button class="btn pm-opt" onclick="${fn}">${label}</button>`).join("");
    return `<div class="mnx"><h2 class="title-gold">Party</h2>
      <div class="pm-hub" style="margin-top:8px">
        <div class="mroster scroll">${roster}</div>
        <div class="pm-side">
          <div class="pm-menu">${menu}</div>
          <div class="minfo">
            <div><span class="minfo-k">Location</span><br><b class="title-gold">${this.location()}</b></div>
            <div style="margin-top:8px"><span class="minfo-k">Aether</span><br><b class="title-gold">◈ ${Game.gold}</b></div>
          </div>
        </div>
      </div>
      <div class="row" style="margin-top:8px"><button class="btn gold" onclick="UI.close()">Close</button></div></div>`;
  },

  // ── ITEMS — the held-item inventory (quest/key items + consumables), distinct from the loot Bag.
  //    Key items (the raft, future keys/sigils) are held forever; consumables (none yet) will stack here.
  partyItems(): void {
    const held = [...Game.heldItems].map((id) => HELD_ITEMS[id]).filter((d): d is HeldItemDef => !!d);
    const section = (kind: HeldKind, title: string, empty: string): string => {
      const items = held.filter((d) => d.kind === kind);
      let s = `<div class="msec">${title}</div>`;
      if (!items.length) return s + `<div class="msub">${empty}</div>`;
      items.forEach((d) => {
        // a demoted "Opens: …" chip tells the player WHAT a traversal key item is for (not just flavor).
        const opens = d.opens ? `<div class="mchips">${chip(`Opens: ${d.opens}`)}</div>` : "";
        s += `<div class="mcard">
          <b class="title-gold">${d.icon} ${d.name}</b>
          <div class="msub" style="margin:6px 0 0">${d.blurb}</div>${opens}</div>`;
      });
      return s;
    };
    Overlay.show(`<div class="mnx"><h2 class="title-gold">Items</h2>
      <div class="scroll" style="margin-top:4px">
        ${section("key", "Quest Items", "None yet — quest and traversal items appear here as you explore.")}
        ${section("consumable", "Consumables", "None yet — potions and antidotes will gather here.")}
      </div>
      <div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openParty()">◂ Party</button></div></div>`);
  },

  // ── ABILITIES: every hero's kit by MNA threshold (unlocked vs locked); heal abilities can be cast
  //    here to mend the LIVING party out of battle (spends MP). ──────────────────────────────────
  partyAbilities(): void {
    let h = `<div class="mnx"><h2 class="title-gold">Abilities</h2>
      <div class="msub">Raise a hero's Attunement MNA (level floor + gear) to unlock abilities. A 🟢 heal can be cast here to mend the party out of battle (spends MP).</div>
      <div class="scroll">`;
    Game.party.forEach((m) => {
      const arch = m.equip.weapon?.cls || m.cls;
      const col = ATT[m.att].color;
      // Re-encoded classes (ADR 0020) drive their kit through the 3-lane choice picker; offer it here.
      const v3 = hasSpec(m.att, m.cls)
        ? `<button class="btn gold sm" onclick="UI.openClassPicker('${m.id}')">Choose abilities ▸</button>` : "";
      h += `<div class="mcard" style="border-left-color:${col}">
        <div class="mh-top"><b class="mname" style="color:${col}">${m.spr} ${m.name}</b>${v3}</div>
        <div class="mchips">${chip(classTitle(m.att, arch, m.mna[m.att]))}${mnaChip(m)}</div>`;
      const kit = m.skills.map((k) => ({ k, s: SKILLS[k] })).filter((x) => x.s).sort((a, b) => a.s.mnaReq - b.s.mnaReq);
      kit.forEach(({ k, s }) => {
        const ok = m.mna[s.att] >= s.mnaReq;
        const canHeal = ok && s.type === "heal" && m.alive && m.mp >= s.mp;
        const useBtn = canHeal ? `<button class="btn gold sm" onclick="UI.useHeal('${m.id}','${k}')">Cast · ${s.mp} MP</button>` : "";
        const gate = ok ? "" : `<span class="small">needs ${s.mnaReq - m.mna[s.att]} more ${s.att}</span>`;
        h += `<div class="mrow${ok ? "" : " locked"}">
          <span class="${ok ? (s.ult ? "r-legendary" : "r-uncommon") : ""}">${s.type === "heal" ? "🟢 " : ok ? "✓ " : "🔒 "}${s.name}</span>
          ${chip(`${s.att} ${s.mnaReq}`)}${gate}${useBtn}</div>`;
      });
      if (!kit.length) h += `<div class="msub" style="margin:6px 0 0">No abilities picked yet — Choose abilities to build the kit.</div>`;
      h += `</div>`;
    });
    h += `</div><div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openParty()">◂ Party</button></div></div>`;
    Overlay.show(h);
  },
  // Open the 3-lane choice picker bound to a hero (ADR 0020) — for a re-encoded class, this is where the
  // player builds the kit that becomes their battle commands.
  openClassPicker(memberId: string): void {
    const m = Game.party.find((x) => x.id === memberId);
    // Return to the Abilities screen on Confirm/Cancel (not the bare title) — so the picker, reached from
    // the Party menu (incl. via the Test Loop), comes back where it was opened instead of stranding.
    if (m && hasSpec(m.att, m.cls)) ClassPicker.open(undefined, m, () => this.partyAbilities());
  },
  useHeal(memberId: string, key: string): void {
    const m = Game.party.find((x) => x.id === memberId), s = SKILLS[key];
    if (!m || !s || s.type !== "heal" || !m.alive) return;
    if (m.mna[s.att] < s.mnaReq || m.mp < s.mp) return;
    m.mp -= s.mp;
    const amt = Math.round((m.mag * (s.power ?? 0) + 6) * (1 + mnaBonus(m.mna.ANIMA ?? 0)) * (1 + (m.sub?.Hld ?? 0) / 100));
    Game.party.forEach((t) => { if (t.alive) t.hp = Math.min(t.maxhp, t.hp + amt); }); // mends the LIVING party
    recalc(Game.party); Game.saveNow();
    this.partyAbilities();
  },

  // ── STATUS & EQUIPMENT ─────────────────────────────────────────────────────────────────────────
  // Per-hero gear with a LIVE totals panel: Offense/Defense/Overall, a Primary-stat grid (col1
  // HP/ATK/ARM · col2 STR/AGI/VIT/SPD/DEF) and a Secondary-stat sheet you toggle to. Choosing a slot
  // swaps the left column to that slot's bag items IN PLACE; selecting one PREVIEWS its impact on the
  // right BEFORE you equip. Swapping a weapon (which reclasses the hero) asks first.
  _eq: null as null | { mid: string; slot: Slot | null; pick: number; view: "primary" | "secondary"; confirm: boolean },
  partyEquipment(memberId?: string): void {
    const m = (memberId && Game.party.find((x) => x.id === memberId)) || Game.party[0];
    if (!m) return;
    this._eq = { mid: m.id, slot: null, pick: -1, view: this._eq?.view ?? "primary", confirm: false };
    this.renderEquip();
  },
  eqMember(): Member | undefined { return this._eq ? Game.party.find((x) => x.id === this._eq!.mid) : undefined; },
  eqOpenSlot(slot: Slot): void { if (this._eq) { this._eq.slot = slot; this._eq.pick = -1; this._eq.confirm = false; this.renderEquip(); } },
  eqCloseSlot(): void { if (this._eq) { this._eq.slot = null; this._eq.pick = -1; this._eq.confirm = false; this.renderEquip(); } },
  eqPick(invIdx: number): void { if (this._eq) { this._eq.pick = invIdx; this._eq.confirm = false; this.renderEquip(); } },
  eqToggleView(): void { if (this._eq) { this._eq.view = this._eq.view === "primary" ? "secondary" : "primary"; this.renderEquip(); } },
  eqConfirm(): void {
    const st = this._eq, m = this.eqMember();
    if (!st || !m || st.slot == null || st.pick < 0) return;
    const it = Game.inventory[st.pick];
    if (!it) { this.renderEquip(); return; }
    // a weapon that reclasses the hero (different Attunement/Archetype) asks first
    if (st.slot === "weapon" && (it.att !== m.att || it.cls !== m.cls) && !st.confirm) { st.confirm = true; this.renderEquip(); return; }
    const slot = st.slot, old = m.equip[slot];
    m.equip[slot] = it;
    Game.inventory.splice(st.pick, 1);
    if (old) Game.inventory.push(old);
    recalc(Game.party);
    Game.saveNow(); // autosave on equip change (ADR 0007)
    st.pick = -1; st.confirm = false;
    this.renderEquip();
  },
  renderEquip(): void {
    const st = this._eq, m = this.eqMember();
    if (!st || !m) return;
    const tabs = Game.party.map((p) => `<button class="btn sm${p.id === m.id ? " gold" : ""}" onclick="UI.partyEquipment('${p.id}')">${p.spr} ${p.name.split(" ")[0]}</button>`).join("");
    const left = st.slot == null ? this.eqGearList(m) : this.eqSlotList(m, st.slot, st.pick);
    const preview = st.pick >= 0 && Game.inventory[st.pick] ? this._equipPreview(m, Game.inventory[st.pick]) : null;
    Overlay.show(`<div class="mnx"><h2 class="title-gold">Status &amp; Equipment</h2>
      <div class="row" style="gap:6px;justify-content:space-between;align-items:flex-start;margin-top:6px">
        <div class="row" style="flex-wrap:wrap;gap:4px;justify-content:flex-start;flex:1;min-width:0">${tabs}</div>
        <button class="btn gold sm" style="flex:0 0 auto" onclick="UI.openInventory()">Bag ▸</button>
      </div>
      <div class="pm-eq">
        <div class="pm-eq-gear scroll">${left}</div>
        ${this.eqTotalsHtml(m, preview)}
      </div>
      <div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openParty()">◂ Party</button></div></div>`, true);
  },
  // LEFT — the gear paper-doll (each slot opens its bag list in place).
  eqGearList(m: Member): string {
    return EQUIP_SLOTS.map((slot) => {
      const it = m.equip[slot];
      const btn = `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn sm" onclick="UI.eqOpenSlot('${slot}')">${it ? "Swap" : "Equip"} ${slot} ▸</button></div>`;
      return it ? itemHtml(it, btn) : `<div class="item" style="opacity:.7"><span class="tag">${slot}</span> — empty —${btn}</div>`;
    }).join("");
  },
  // LEFT (slot mode) — the bag items for one slot; tap to preview (deltas show on the right).
  eqSlotList(m: Member, slot: Slot, pick: number): string {
    // ANY weapon is equippable — a weapon of another Archetype/Attunement reclasses the hero (confirmed
    // before it's applied). So the list isn't filtered to the current class.
    const usable = Game.inventory.filter((it) => it.slot === slot);
    let h = `<div class="mh-top"><b class="title-gold">Choose ${cap(slot)}</b><button class="btn sm" onclick="UI.eqCloseSlot()">◂ Gear</button></div>`;
    h += `<div class="msub" style="margin:4px 0 6px">Equipped: ${m.equip[slot] ? `<span class="r-${m.equip[slot]!.rarity}">${m.equip[slot]!.name}</span>` : "none"} — tap an item to preview, then Equip.${slot === "weapon" ? " A different weapon type changes this hero's class." : ""}</div>`;
    if (!usable.length) return h + `<div class="msub">No ${slot}s in your bag.</div>`;
    usable.sort((a, b) => itemScore(b) - itemScore(a)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      const sel = idx === pick;
      const btn = `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn sm${sel ? " gold" : ""}" onclick="UI.eqPick(${idx})">${sel ? "✓ Selected" : "Preview"}</button></div>`;
      h += `<div style="${sel ? "outline:2px solid #f4b942;border-radius:10px" : ""}">${itemHtml(it, btn)}</div>`;
    });
    return h;
  },
  // RIGHT — the live totals panel; `preview` (if set) shows the would-be stats with green/red deltas.
  eqTotalsHtml(m: Member, preview: Member | null): string {
    const st = this._eq!;
    const num = (a: number, b: number | null | undefined, unit = ""): string =>
      b == null || a === b ? `${a}${unit}` : `${a}${unit} <span style="color:${b > a ? "#aef0a0" : "#e8888c"}">→ ${b}${unit}${b > a ? "↑" : "↓"}</span>`;
    const gs = gearScore(m), pg = preview ? gearScore(preview) : null;
    const gline = (k: string, a: number, b?: number) => `<span><span class="gs-k">${k}</span><b>${num(a, b)}</b></span>`;
    const score = `<div class="gscore">${gline("Offense", gs.offense, pg?.offense)}${gline("Defense", gs.defense, pg?.defense)}${gline("Overall", gs.overall, pg?.overall)}</div>`;
    const row = (label: string, a: number, b: number | null | undefined, unit = "") => `<span class="st-row"><span class="st-name">${label}</span><span class="st-val">${num(a, b, unit)}</span></span>`;
    const toggle = `<div class="row" style="justify-content:flex-start;margin:8px 0 2px"><button class="btn sm" onclick="UI.eqToggleView()">${st.view === "primary" ? "Secondary Stats ▸" : "◂ Primary Stats"}</button></div>`;
    let body: string;
    if (st.view === "primary") {
      const p = m.prim!, pp = preview?.prim;
      const col1 = [row("HP", m.maxhp, preview?.maxhp), row("ATK", m.atk, preview?.atk), row("ARM", m.armor, preview?.armor)].join("");
      const col2 = PRIMARY_STATS.map((s) => row(s, p[s], pp?.[s])).join("");
      body = `<div class="eq-cols"><div class="statlist">${col1}</div><div class="statlist">${col2}</div></div>`;
    } else {
      const cur = substats(m.sub!, { crit: m.critPct, leech: m.leech });
      const nxt = preview ? substats(preview.sub!, { crit: preview.critPct, leech: preview.leech }) : null;
      body = `<div class="statlist">${cur.map((s, i) => row(s.label, s.value, nxt ? nxt[i].value : undefined, s.unit)).join("")}</div>`;
    }
    let action = "";
    if (st.slot != null && st.pick >= 0 && preview && Game.inventory[st.pick]) {
      const it = Game.inventory[st.pick];
      const reclass = st.slot === "weapon" && (preview.att !== m.att || preview.cls !== m.cls);
      if (st.confirm && reclass) {
        action = `<div class="mcard" style="border-left-color:var(--legendary);margin-top:8px">
          <b class="r-legendary">Change class?</b>
          <div class="msub" style="margin:4px 0">Equipping <b>${it.name}</b> reclasses ${m.name} to <b>${classTitle(preview.att, preview.cls, m.mna[preview.att])}</b> — a different Attunement and ability kit.</div>
          <div class="row" style="justify-content:flex-start"><button class="btn gold" onclick="UI.eqConfirm()">Yes, change class</button><button class="btn" onclick="UI.eqPick(${st.pick})">Cancel</button></div></div>`;
      } else {
        const note = reclass ? ` <span class="r-legendary" style="font-size:11px">→ ${classTitle(preview.att, preview.cls, m.mna[preview.att])}</span>` : "";
        action = `<div class="row" style="justify-content:flex-start;margin-top:8px"><button class="btn gold" onclick="UI.eqConfirm()">Equip${note}</button></div>`;
      }
    }
    // MNA is READ-ONLY (ADR 0021): the derived level floor + per-piece gear grants — no allocator.
    const mnaChips = ATTUNEMENTS.filter((a) => m.mna[a] > 0)
      .map((a) => chip(`<span style="color:${ATT[a].color}">${a}</span> <b>${m.mna[a]}</b>`)).join("") || `<span class="small">—</span>`;
    const scaling = `<div class="msec">Mana Scaling · <span style="color:${ATT[m.att].color}">${m.att}</span></div>
      <div class="msub" style="margin:0 0 5px">How well ${m.name}'s abilities scale from each stat (S best → D minimal).</div>
      <div class="statier">${PRIMARY_STATS.map((s) => { const t = STAT_TIERS[m.att][s]; return `<span class="st-row"><span class="st-name">${s}</span><span class="st-tier st-${t}">${t}</span></span>`; }).join("")}</div>`;
    return `<div class="mcard pm-eq-tot" style="border-left-color:${ATT[m.att].color};margin:0">
      <b class="title-gold">${m.name}${preview ? " — preview" : ""}</b>
      ${score}
      <div class="msub" style="margin:4px 0 0">Higher is better · Overall = Offense + Defense</div>
      ${toggle}${body}${action}
      <div class="msec">MNA · ${mnaFloor(m.level)} lvl floor + gear</div><div class="mchips" style="margin-top:2px">${mnaChips}</div>
      ${scaling}
    </div>`;
  },

  // ── FORMATION: assign each hero Front/Back; the line stays a 3×2 or 2×3 (min 2, max 3 in front). ─
  partyFormation(note = ""): void {
    const front = Game.party.filter((m) => m.row !== "back").length;
    let h = `<div class="mnx"><h2 class="title-gold">Formation</h2>
      <div class="msub">The FRONT row is struck first and shields the BACK row (casters/ranged). Keep a 3×2 (3 front) or 2×3 (2 front) line.</div>
      <div class="mcard"><div class="mh-top"><b class="title-gold">${front} Front / ${5 - front} Back</b>${chip(`${front}×${5 - front} line`)}</div>${note ? `<div class="msub" style="color:#e8b27a;margin:5px 0 0">${note}</div>` : ""}</div>
      <div class="scroll">`;
    Game.party.forEach((m) => {
      const isFront = m.row !== "back";
      const col = ATT[m.att].color;
      h += `<div class="mcard mhero" style="border-left-color:${col}">
        <div class="mh-body"><span class="mname" style="color:${col}">${m.spr} ${m.name}</span>
          <div class="mchips">${chip(m.role)}${chip(isFront ? "Front line" : "Back line")}</div></div>
        <span style="display:flex;gap:6px;flex:0 0 auto"><button class="btn sm${isFront ? " gold" : ""}" onclick="UI.setRow('${m.id}','front')">Front</button><button class="btn sm${!isFront ? " gold" : ""}" onclick="UI.setRow('${m.id}','back')">Back</button></span>
      </div>`;
    });
    h += `</div><div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openParty()">◂ Party</button></div></div>`;
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
  // Clicking an equipped item routes into the Status & Equipment screen with that slot open.
  showGear(memberId: string, slot: Slot): void {
    if (!Game.party.find((x) => x.id === memberId)) return;
    this.partyEquipment(memberId);
    this.eqOpenSlot(slot);
  },
  // Skill-tree visualizer: the hero's kit laid out by MNA threshold, with what each does.
  skillTree(memberId: string): void {
    const m = Game.party.find((x) => x.id === memberId);
    if (!m) return;
    const arch = m.equip.weapon?.cls || m.cls;
    const tree = m.att, cur = m.mna[tree], col = ATT[tree].color;
    let h = `<div class="mnx"><h2 class="title-gold">${classTitle(tree, arch, cur)}</h2>`;
    h += `<div class="mchips">${chip(`${m.spr} ${m.name}`)}${chip(`<span style="color:${col}">${tree}</span> tree`)}${chip(`MNA <b>${cur}</b>`)}${cur >= 100 ? chip(`<span class="r-legendary">ARCHON</span>`) : ""}</div>`;
    h += `<div class="msub" style="margin-top:6px">Raise ${tree} MNA (level floor + ${tree} gear) to unlock these.</div><div class="scroll">`;
    const kit = m.skills.map((k) => SKILLS[k]).sort((a, b) => a.mnaReq - b.mnaReq);
    kit.forEach((s) => {
      const ok = cur >= s.mnaReq;
      const gate = ok ? `<span class="r-uncommon">✓ unlocked</span>` : `<span class="small">needs ${s.mnaReq} ${tree} (${s.mnaReq - cur} more)</span>`;
      // locked: dim the header/gate row only — keep the description readable so players can
      // plan toward what they haven't unlocked yet.
      h += `<div class="mcard" style="border-left-color:${ok ? (s.ult ? "var(--legendary)" : "#f4b942") : "#3a2e12"}">
        <div style="${ok ? "" : "opacity:.6"}"><b class="${ok ? (s.ult ? "r-legendary" : "r-uncommon") : ""}">${s.name}</b>${s.ult ? " ★" : ""} ${chip(`${tree} ${s.mnaReq}`)} ${gate}</div>
        <div class="mchips">${chip(skillKind(s))}${chip(TARGET_LABEL[s.target] ?? s.target)}${chip(s.mp ? `${s.mp} MP` : "free")}</div>
        <div class="small" style="color:var(--mink);margin-top:5px">${s.desc}</div>
      </div>`;
    });
    h += `</div><div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openParty()">◂ Party</button><button class="btn gold" onclick="UI.close()">Close</button></div></div>`;
    Overlay.show(h);
  },
  // Transient one-render feedback line for the Bag (set by useConsumable, cleared on render).
  _bagNote: "" as string,
  // Use a consumable from the Bag (out of battle — Game owns the effect + counts), then re-render
  // with the feedback line so the heal reads.
  useConsumable(id: string): void {
    this._bagNote = Game.useConsumable(id) ?? "";
    this.openInventory();
  },
  openInventory(): void {
    const selling = Game._inMerchant; // the merchant buys loot off you while you're shopping
    const note = this._bagNote; this._bagNote = "";
    let h = `<div class="mnx"><h2 class="title-gold">Bag</h2>
      <div class="mchips">${chip(`<b>${Game.inventory.length}</b> items`)}${chip(`◈ <b>${Game.gold}</b> Aether`)}${selling ? chip("selling to the merchant") : ""}</div>
      <div class="scroll" style="margin-top:4px">`;
    // ── CONSUMABLES (crafting slice): crafted at a town smith, usable here out of battle. ──
    const cons = Object.entries(Game.consumables).filter(([id, n]) => n > 0 && CONSUMABLES[id]);
    if (note) h += `<div class="small" style="color:#aef0a0;margin:4px 0">${note}</div>`;
    if (cons.length) {
      h += `<div class="msec">Consumables</div>`;
      cons.forEach(([id, n]) => {
        const d = CONSUMABLES[id]!;
        h += `<div class="mcard">
          <div class="mh-top"><b class="title-gold">${d.icon} ${d.name}</b>${chip(`×${n}`)}<button class="btn gold sm" onclick="UI.useConsumable('${id}')">Use</button></div>
          <div class="msub" style="margin:4px 0 0">${d.blurb}</div></div>`;
      });
    }
    // ── MATERIALS (crafting slice): read-only counts — spent at the smith, never equipped. ──
    const mats = Object.entries(Game.materials).filter(([id, n]) => n > 0 && MATERIALS[id]);
    if (mats.length) {
      h += `<div class="msec">Materials</div><div class="msub">Gathered from nodes and fallen foes — craft with them at a town smith.</div>
        <div class="mchips">${mats.map(([id, n]) => chip(`${MATERIALS[id]!.icon} ${MATERIALS[id]!.name} <b>×${n}</b>`)).join("")}</div>`;
    }
    if (cons.length || mats.length) h += `<div class="msec">Gear</div>`;
    if (Game.inventory.length === 0) h += `<div class="msub">Empty. Win fights to find loot.</div>`;
    Game.inventory.slice().sort((a, b) => rarityIx(b.rarity) - rarityIx(a.rarity)).forEach((it) => {
      const idx = Game.inventory.indexOf(it);
      const sell = selling ? ` <button class="btn sm" onclick="Game.sellItem(${idx})">Sell · ◈ ${sellPriceOf(it)}</button>` : "";
      h += itemHtml(it, `<div class="row" style="justify-content:flex-start;margin-top:6px"><button class="btn gold sm" onclick="UI.equipChooser(${idx})">Equip ▸</button>${sell}</div>`);
    });
    h += `</div><div class="row" style="margin-top:8px">${selling ? `<button class="btn gold" onclick="Game.renderMerchant()">◂ Shop</button>` : ""}<button class="btn" onclick="UI.openParty()">To Party</button><button class="btn${selling ? "" : " gold"}" onclick="UI.close()">Close</button></div></div>`;
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
    let h = `<div class="mnx"><h2 class="title-gold">Equip</h2>${itemHtml(it)}<div class="msub" style="margin-top:4px">Choose a hero — arrows show stat changes:</div><div class="scroll">`;
    const stat = (label: string, cur: number, nxt: number) =>
      cur === nxt ? "" : `<span style="color:${nxt > cur ? "#aef0a0" : "#e8888c"}">${label} ${cur}→${nxt}${nxt > cur ? "↑" : "↓"}</span>`;
    Game.party.forEach((m) => {
      const c = this._equipPreview(m, it);
      const col = ATT[m.att].color;
      const gNow = gearScore(m), gNext = gearScore(c);
      const score = [
        stat("Offense", gNow.offense, gNext.offense), stat("Defense", gNow.defense, gNext.defense),
        stat("Overall", gNow.overall, gNext.overall),
      ].filter(Boolean).join(" · ");
      const deltas = [
        stat("HP", m.maxhp, c.maxhp), stat("ATK", m.atk, c.atk), stat("MAG", m.mag, c.mag),
        stat("DEF", m.armor, c.armor), stat("SPD", m.spd, c.spd),
        stat("Crit", m.critPct, c.critPct),
        ...ATTUNEMENTS.map((a) => stat(`${a} MNA`, m.mna[a], c.mna[a])),
      ].filter(Boolean).join(" · ");
      const reclass = it.slot === "weapon" && (c.att !== m.att || c.cls !== m.cls)
        ? ` <span class="r-legendary" style="font-size:11px">→ ${classTitle(c.att, c.cls, m.mna[c.att])}</span>` : "";
      const replaces = m.equip[it.slot] ? `<span class="small" style="opacity:.7"> (replaces ${m.equip[it.slot]!.name})</span>` : "";
      h += `<div class="mcard" style="border-left-color:${col}">
        <div class="mname" style="color:${col}">${m.spr} ${m.name}</div>
        <div class="mchips">${chip(classTitle(m.att, m.cls, m.mna[m.att]))}${reclass}${replaces}</div>
        ${score ? `<div class="small" style="margin-top:5px;font-weight:bold">${score}</div>` : ""}
        <div class="small" style="margin-top:4px">${deltas || "no stat change"}</div>
        <div class="row" style="justify-content:flex-start;margin-top:8px"><button class="btn gold" onclick="UI.doEquipFromBag('${m.id}',${invIdx})">Equip on ${m.name}</button></div>
      </div>`;
    });
    h += `</div><div class="row" style="margin-top:8px"><button class="btn" onclick="UI.openInventory()">◂ Bag</button></div></div>`;
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
