// Class kit picker (ADR 0020 §2) — the 3-lane choice UI over a structured ClassSpec: step total MNA up/
// down, pick at each reached milestone (specials/signatures pick 1 of 2, passive sets 1 of 3, the
// ultimate 2 of 4), and watch the resulting ACTIVE kit (picks below your MNA go dormant). Drives the pure
// systems/choice engine + the band→number generator.
//
// Two modes: a standalone PREVIEW (title-screen "Classes" button — open() with no member), and BOUND to a
// live party member (open(spec, member) from the Party→Abilities screen) — Confirm writes the picks onto
// the member, recalcs (so the choice-derived kit becomes their battle commands), and saves. This is the
// capstone wiring: the picker now feeds live member progression (ADR 0020 task), not just a demo.

import type { ClassSpec } from "../data/classSpec";
import type { Member } from "../types";
import { choiceSlots, reached, choose, pickedAt, activeKit, fullyPicked, type Picks, type ChoiceSlot } from "../systems/choice";
import { genAbility } from "../systems/classGen";
import { HELIOMANCER, SLICE_SPECS, specFor } from "../data/classSpecs";
import { recalc } from "../systems/progression";
import { ATT } from "../data/attunements";
import { clamp } from "../core/rng";
import { Overlay } from "../ui/overlay";
import { Game } from "./game";

const TIER_LABEL: Record<string, string> = { special: "Specials", signature: "Signatures", ultimate: "Ultimates", passive: "Passives" };

export const ClassPicker = {
  spec: HELIOMANCER as ClassSpec,
  picks: {} as Picks,
  mna: 100,
  member: null as Member | null,

  /** Open the picker. With a `member`, bind to it: seed the picks/MNA from the hero and surface a Confirm
   *  that writes them back. With none, it's a standalone preview (the title "Classes" button). */
  open(spec: ClassSpec = HELIOMANCER, member: Member | null = null): void {
    if (member) {
      this.member = member;
      this.spec = specFor(member.att, member.cls) ?? spec;
      this.picks = { ...(member.picks ?? {}) };
      this.mna = member.mna[member.att] || 0;
    } else {
      this.member = null;
      this.spec = spec;
      this.picks = {};
      this.mna = 100;
    }
    this.render();
  },
  setMna(v: number): void { this.mna = clamp(v, 0, 200); this.render(); },
  reset(): void { this.picks = {}; this.render(); },
  pick(id: string, idx: number): void {
    const slot = choiceSlots(this.spec).find((s) => s.id === id);
    const name = slot?.options[idx]?.name;
    if (slot && name) this.picks = choose(this.picks, id, name, slot.pickCount);
    this.render();
  },
  /** Fill every reached-but-unfilled slot with its first option (lane A where present) — a quick way to
   *  get a playable kit without clicking each milestone. Respects pickCount (ultimates take 2). */
  autoPick(): void {
    for (const s of choiceSlots(this.spec)) {
      if (!reached(s.milestone, this.mna)) continue;
      let chosen = pickedAt(this.picks, s.id);
      for (const o of s.options) {
        if (chosen.length >= s.pickCount) break;
        if (!chosen.includes(o.name)) { this.picks = choose(this.picks, s.id, o.name, s.pickCount); chosen = pickedAt(this.picks, s.id); }
      }
    }
    this.render();
  },
  /** Bound mode: write the banked picks onto the member, recompute its kit, persist. */
  confirm(): void {
    if (!this.member) return;
    this.member.picks = { ...this.picks };
    recalc(Game.party);   // re-derive m.skills from the picks (gated by the member's real MNA)
    Game.saveNow();
    Overlay.hide();
  },

  render(): void {
    const col = ATT[this.spec.att].color;
    const bound = !!this.member;
    const slots = choiceSlots(this.spec);
    const slotHtml = (s: ChoiceSlot): string => {
      const open = reached(s.milestone, this.mna);
      const picked = pickedAt(this.picks, s.id);
      const opts = s.options.map((o, i) => {
        const on = picked.includes(o.name);
        return `<button class="btn${on ? " gold" : ""}" ${open ? "" : "disabled"} style="font-size:11px;margin:1px" onclick="ClassPicker.pick('${s.id}',${i})" title="${o.effect}">${o.lane ? `[${o.lane}] ` : ""}${o.name}</button>`;
      }).join("");
      const need = s.pickCount > 1 ? ` (pick ${s.pickCount})` : "";
      return `<div style="opacity:${open ? 1 : 0.4};margin:3px 0"><span class="small">@${s.milestone}${need}</span> ${opts}</div>`;
    };
    const groups = (["special", "signature", "ultimate", "passive"] as const).map((t) => {
      const ss = slots.filter((s) => s.tier === t);
      return ss.length ? `<div class="tag" style="margin-top:6px">${TIER_LABEL[t]}</div>${ss.map(slotHtml).join("")}` : "";
    }).join("");
    const kit = activeKit(this.spec, this.picks, this.mna)
      .map((a) => { const g = genAbility(a); const tag = g.resourceCost ? ` −${g.resourceCost}` : g.resourceGen ? ` +${g.resourceGen}` : ""; return `<span class="badge" title="${a.effect}">${a.name}${tag}</span>`; })
      .join(" ");
    const who = bound ? ` <span class="pill">${this.member!.spr} ${this.member!.name}</span>` : "";
    const intro = bound
      ? `Choose this hero's abilities. Picks at milestones beyond their current ${this.spec.att} MNA are <i>banked</i> (dormant until they reach it). Confirm to apply.`
      : `${this.spec.att} × ${this.spec.archetype} — the 3-lane choice system. Pick at each milestone your MNA has reached; picks above your MNA go <i>dormant</i> (banked, inactive).`;
    const actions = bound
      ? `<button class="btn gold" onclick="ClassPicker.confirm()">Confirm</button><button class="btn" onclick="Overlay.hide()">Cancel</button>`
      : `<button class="btn gold" onclick="Overlay.hide()">Close</button>`;
    Overlay.show(`<h2 class="title-gold" style="color:${col}">${this.spec.name}${who}</h2>
      <div class="small">${intro}</div>
      <div class="row" style="margin:6px 0;align-items:center">
        <span class="small">Total ${this.spec.att} MNA: <b style="color:${col}">${this.mna}</b></span>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna - 10})">−10</button>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna + 10})">+10</button>
        <button class="btn" onclick="ClassPicker.autoPick()">Auto-pick</button>
        <button class="btn" onclick="ClassPicker.reset()">Reset</button></div>
      <div class="scroll" style="max-height:40vh;text-align:left">${groups}</div>
      <div class="tag" style="margin-top:6px">Active kit ${fullyPicked(this.spec, this.picks, this.mna) ? "✓ all picked" : ""}</div>
      <div style="text-align:left;line-height:1.8">${kit || '<span class="small">No picks yet.</span>'}</div>
      <div class="row">${actions}</div>`);
  },
};

// Kept referenced so the slice roster is available to a future class selector (and to satisfy the lint).
export const SLICE_CLASS_SPECS = SLICE_SPECS;
