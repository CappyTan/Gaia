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
import { classTitle } from "../data/classes";
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
  onClose: null as (() => void) | null, // where Confirm/Cancel/Close return to (set by the opener); null → just hide

  /** Open the picker. With a `member`, bind to it: seed the picks/MNA from the hero and surface a Confirm
   *  that writes them back. With none, it's a standalone preview (the title "Classes" button). `onClose`
   *  is the return target (e.g. the Party→Abilities screen) so closing doesn't dump the player to the title
   *  — important when the picker is reached from the Test Loop / a menu (every page returns to its opener). */
  open(spec: ClassSpec = HELIOMANCER, member: Member | null = null, onClose: (() => void) | null = null): void {
    this.onClose = onClose;
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

  /** Leave the picker — return to the opener (the menu/screen that launched it) or just hide if standalone. */
  close(): void { if (this.onClose) this.onClose(); else Overlay.hide(); },
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
  /** Bound mode: write the banked picks onto the member, recompute its kit, persist, return to the opener. */
  confirm(): void {
    if (!this.member) return;
    this.member.picks = { ...this.picks };
    recalc(Game.party);   // re-derive m.skills from the picks (gated by the member's real MNA)
    Game.saveNow();
    this.close();
  },

  render(): void {
    const col = ATT[this.spec.att].color;
    const bound = !!this.member;
    const slots = choiceSlots(this.spec);

    // One ability, as a dashboard-style card: name + lane chip, description, and detail tags
    // (type · target · resource gen/spend · cooldown). Colour-coded by its build lane (A/B/C, or N
    // for the unlaned neutral ultimate). Clickable to pick when its milestone is reached.
    const laneOf = (o: ChoiceSlot["options"][number]): string => o.lane ?? "N";
    const card = (s: ChoiceSlot, o: ChoiceSlot["options"][number], i: number, open: boolean, on: boolean): string => {
      const g = genAbility(o);
      const L = laneOf(o);
      const tags = [
        `<span class="tag lane-${L}">${o.lane ? `Lane ${o.lane}` : "Neutral"}</span>`,
        `<span class="tag t-${o.type}">${o.type}</span>`,
        `<span class="tag">${o.target}</span>`,
        o.tier === "passive" ? `<span class="tag">passive</span>` : "",
        g.resourceGen ? `<span class="tag gen" title="${o.gen ?? ""} generation">+${g.resourceGen} res</span>` : "",
        g.resourceCost ? `<span class="tag cost" title="${o.cost ?? ""} cost">−${g.resourceCost} res</span>` : "",
        g.cooldown ? `<span class="tag cd" title="${o.cooldown ?? ""} cooldown">cd ${g.cooldown}t</span>` : "",
      ].join("");
      const click = open ? ` onclick="ClassPicker.pick('${s.id}',${i})"` : "";
      return `<div class="ab l${L}${on ? " on" : ""}${open ? "" : " off"}"${click}>
        <div class="nm">${on ? "✓ " : ""}${o.name}</div>
        <div class="ef">${o.effect}</div>
        <div class="tags">${tags}</div></div>`;
    };
    const slotHtml = (s: ChoiceSlot): string => {
      const open = reached(s.milestone, this.mna);
      const picked = pickedAt(this.picks, s.id);
      const lanes = [...new Set(s.options.map(laneOf))].map((l) => `<span class="lane-${l} lnk">${l}</span>`).join(" / ");
      const need = s.pickCount > 1 ? `pick ${s.pickCount}` : "pick 1";
      const cnt = open ? `<span class="cnt${picked.length >= s.pickCount ? " done" : ""}">${picked.length}/${s.pickCount}</span>` : `<span class="lock">🔒 ${s.milestone} MNA</span>`;
      return `<div class="ms-h">@ ${s.milestone} MNA · ${lanes} · ${need} ${cnt}</div>
        <div class="abs">${s.options.map((o, i) => card(s, o, i, open, picked.includes(o.name))).join("")}</div>`;
    };
    const groups = (["special", "signature", "ultimate", "passive"] as const).map((t) => {
      const ss = slots.filter((s) => s.tier === t);
      return ss.length ? `<div class="tier-h">${TIER_LABEL[t]}</div>${ss.map(slotHtml).join("")}` : "";
    }).join("");

    const kit = activeKit(this.spec, this.picks, this.mna)
      .map((a) => { const g = genAbility(a); const tag = g.resourceCost ? ` −${g.resourceCost}` : g.resourceGen ? ` +${g.resourceGen}` : ""; return `<span class="kchip l${laneOf(a)}" title="${a.effect}">${a.name}${tag}</span>`; })
      .join(" ");
    const L = this.spec.lanes;
    const legend = L
      ? `<div class="paths-h">The three paths — pick abilities along these lanes</div>
         <div class="lanes-legend">
           <span class="ll lA"><b class="lane-A">A</b> ${L.A}</span>
           <span class="ll lB"><b class="lane-B">B</b> ${L.B}</span>
           <span class="ll lC"><b class="lane-C">C</b> ${L.C}</span></div>`
      : "";
    const who = bound ? ` <span class="pill">${this.member!.spr} ${this.member!.name}</span>` : "";
    // Bound to a live hero: below Archon Type I they're known by their Weapon Discipline, not the
    // Archon Title this spec is named for (ADR 0023). Standalone preview mode is a class BROWSER
    // (not a specific hero's state), so it always shows the true/canonical spec name.
    const headline = bound ? classTitle(this.spec.att, this.spec.archetype, this.mna) : this.spec.name;
    const intro = bound
      ? `Choose this hero's abilities. Picks at milestones beyond their current ${this.spec.att} MNA are <i>banked</i> (dormant until they reach it). Confirm to apply.`
      : `${this.spec.att} × ${this.spec.archetype} — the 3-lane choice system. Pick at each milestone your MNA has reached; picks above your MNA go <i>dormant</i> (banked, inactive).`;
    const actions = bound
      ? `<button class="btn gold" onclick="ClassPicker.confirm()">Confirm</button><button class="btn" onclick="ClassPicker.close()">Cancel</button>`
      : `<button class="btn gold" onclick="ClassPicker.close()">Close</button>`;

    Overlay.show(`<div class="cpx">${CP_STYLE}
      <h2 class="title-gold cptitle" style="color:${col}">${headline}${who}</h2>
      <div class="small cpintro">${intro}</div>
      ${legend}
      <div class="row cpbar">
        <span class="small">Total ${this.spec.att} MNA: <b style="color:${col}">${this.mna}</b></span>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna - 10})">−10</button>
        <button class="btn" onclick="ClassPicker.setMna(${this.mna + 10})">+10</button>
        <button class="btn" onclick="ClassPicker.autoPick()">Auto-pick</button>
        <button class="btn" onclick="ClassPicker.reset()">Reset</button></div>
      <div class="scroll cpscroll">${groups}</div>
      <div class="tier-h kit-h">Active kit ${fullyPicked(this.spec, this.picks, this.mna) ? "✓ all picked" : ""}</div>
      <div class="kit">${kit || '<span class="small">No picks yet.</span>'}</div>
      <div class="row cpactions">${actions}</div></div>`);
  },
};

// Scoped picker theme (dashboard-derived). Intentionally breaks house style INSIDE the picker only —
// every rule is prefixed .cpx so nothing leaks to other windows (Dara's call; other menus follow later).
const CP_STYLE = `<style>
.cpx{--A:#f4b942;--B:#ef7a4a;--C:#5fc6d6;--N:#ffd877;--gen:#8fd17a;--cost:#ef6b6b;--line:#3a2e12;--panel:#1b1509;--panel2:#241c0d;--dim:#b8a87f;--ink:#f3e9d2;text-align:left}
.cpx .cptitle{margin:0 0 2px}
.cpx .cpintro{margin-bottom:6px}
.cpx .paths-h{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--dim);margin:6px 0 4px;font-weight:600}
.cpx .lanes-legend{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px}
.cpx .ll{flex:1;min-width:130px;background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 9px;font-size:12.5px;font-weight:600;color:var(--ink)}
.cpx .ll.lA{border-left:3px solid var(--A)} .cpx .ll.lB{border-left:3px solid var(--B)} .cpx .ll.lC{border-left:3px solid var(--C)}
.cpx .ll b{margin-right:6px;font-weight:800}
.cpx .cpbar{margin:6px 0;align-items:center;flex-wrap:wrap;gap:4px}
.cpx .cpscroll{max-height:52vh;overflow:auto;text-align:left;padding-right:4px}
.cpx .tier-h{font-size:12px;text-transform:uppercase;letter-spacing:1.4px;color:var(--N);font-weight:700;margin:16px 0 2px;border-bottom:1px solid var(--line);padding-bottom:4px}
.cpx .ms-h{font-size:11.5px;color:var(--dim);letter-spacing:.4px;margin:11px 0 6px;font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.cpx .ms-h .lnk{font-weight:800}
.cpx .ms-h .cnt{margin-left:auto;font-weight:700;color:var(--dim);border:1px solid var(--line);border-radius:20px;padding:0 8px}
.cpx .ms-h .cnt.done{color:var(--gen);border-color:#2f4d27}
.cpx .ms-h .lock{margin-left:auto;color:#8a795a}
.cpx .abs{display:grid;grid-template-columns:repeat(auto-fit,minmax(158px,1fr));gap:7px}
.cpx .ab{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:8px 10px;cursor:pointer;transition:box-shadow .1s,background .1s}
.cpx .ab.lA{border-left:3px solid var(--A)} .cpx .ab.lB{border-left:3px solid var(--B)} .cpx .ab.lC{border-left:3px solid var(--C)} .cpx .ab.lN{border-left:3px solid var(--N)}
.cpx .ab.on{background:var(--panel2);box-shadow:0 0 0 2px var(--N) inset}
.cpx .ab.off{opacity:.4;cursor:default}
.cpx .ab .nm{font-weight:700;color:var(--ink);font-size:13px;line-height:1.25}
.cpx .ab .ef{color:var(--dim);font-size:12px;margin:4px 0 6px;line-height:1.35}
.cpx .ab .tags{display:flex;flex-wrap:wrap;gap:4px}
.cpx .tag{font-size:10px;padding:1px 6px;border-radius:20px;border:1px solid var(--line);color:var(--dim);white-space:nowrap;background:transparent}
.cpx .lane-A{color:var(--A)} .cpx .lane-B{color:var(--B)} .cpx .lane-C{color:var(--C)} .cpx .lane-N{color:var(--N)}
.cpx .tag.lane-A{border-color:#5a4413} .cpx .tag.lane-B{border-color:#5a3413} .cpx .tag.lane-C{border-color:#1f4651} .cpx .tag.lane-N{border-color:#5a4413}
.cpx .tag.t-phys{color:#e8c98a}.cpx .tag.t-mag{color:#f0a06a}.cpx .tag.t-heal{color:#8fd17a}.cpx .tag.t-buff{color:#9fd1ff}.cpx .tag.t-util{color:#c6a6ff}
.cpx .tag.gen{color:var(--gen);border-color:#2f4d27}.cpx .tag.cost{color:var(--cost);border-color:#5a2222}.cpx .tag.cd{color:#cdbf9a}
.cpx .kit{text-align:left;line-height:2}
.cpx .kit-h{margin-top:10px}
.cpx .kchip{display:inline-block;font-size:11px;padding:2px 8px;margin:2px;border-radius:20px;border:1px solid var(--line);background:var(--panel);color:var(--ink)}
.cpx .kchip.lA{border-left:3px solid var(--A)} .cpx .kchip.lB{border-left:3px solid var(--B)} .cpx .kchip.lC{border-left:3px solid var(--C)} .cpx .kchip.lN{border-left:3px solid var(--N)}
.cpx .cpactions{margin-top:8px}
</style>`;

// Kept referenced so the slice roster is available to a future class selector (and to satisfy the lint).
export const SLICE_CLASS_SPECS = SLICE_SPECS;
