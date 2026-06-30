// Class kit picker (ADR 0020 §2) — the 3-lane choice UI. A dev/preview screen over a structured
// ClassSpec: step total MNA up/down, pick at each reached milestone (specials/signatures pick 1 of 2,
// passive sets 1 of 3, the ultimate 2 of 4), and watch the resulting ACTIVE kit (picks below your MNA
// go dormant). Drives the pure systems/choice engine + the band→number generator. This demonstrates the
// mechanic on the re-encoded slice classes; wiring it into live member progression (replacing the old
// kit map) is the remaining capstone integration.

import type { ClassSpec } from "../data/classSpec";
import { choiceSlots, reached, choose, pickedAt, activeKit, fullyPicked, type Picks, type ChoiceSlot } from "../systems/choice";
import { genAbility } from "../systems/classGen";
import { HELIOMANCER, SLICE_SPECS } from "../data/classSpecs";
import { ATT } from "../data/attunements";
import { clamp } from "../core/rng";
import { Overlay } from "../ui/overlay";

const TIER_LABEL: Record<string, string> = { special: "Specials", signature: "Signatures", ultimate: "Ultimates", passive: "Passives" };

export const ClassPicker = {
  spec: HELIOMANCER as ClassSpec,
  picks: {} as Picks,
  mna: 100,

  open(spec: ClassSpec = HELIOMANCER): void {
    this.spec = spec;
    this.picks = {};
    this.mna = 100;
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

  render(): void {
    const col = ATT[this.spec.att].color;
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
    Overlay.show(`<h2 class="title-gold" style="color:${col}">${this.spec.name}</h2>
      <div class="small">${this.spec.att} × ${this.spec.archetype} — the 3-lane choice system. Pick at each milestone your MNA has reached; picks above your MNA go <i>dormant</i> (banked, inactive).</div>
      <div class="row" style="margin:6px 0;align-items:center">
        <span class="small">Total ${this.spec.att} MNA: <b style="color:${col}">${this.mna}</b></span>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna - 10})">−10</button>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna + 10})">+10</button>
        <button class="btn" onclick="ClassPicker.reset()">Reset</button></div>
      <div class="scroll" style="max-height:40vh;text-align:left">${groups}</div>
      <div class="tag" style="margin-top:6px">Active kit ${fullyPicked(this.spec, this.picks, this.mna) ? "✓ all picked" : ""}</div>
      <div style="text-align:left;line-height:1.8">${kit || '<span class="small">No picks yet.</span>'}</div>
      <div class="row"><button class="btn gold" onclick="Overlay.hide()">Close</button></div>`);
  },
};

// Kept referenced so the slice roster is available to a future class selector (and to satisfy the lint).
export const SLICE_CLASS_SPECS = SLICE_SPECS;
