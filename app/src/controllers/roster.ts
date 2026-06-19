// Roster picker: before a run, build your party of five — each hero's Attunement × Archetype
// (= class) and formation row. Class = weapon, so a hero's starting class is set here and can
// later change via loot. Bodies/kits for any attunement come from the art + KITS_GENERIC fallback.

import type { Attunement, MemberDef, Row } from "../types";
import { ATTUNEMENTS } from "../types";
import { ARCHETYPE_KEYS, buildDef, PARTY_DEFS } from "../data/party";
import { className } from "../data/classes";
import { classBody } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Game } from "./game";

interface Slot { name: string; att: Attunement; cls: string; row: Row; }

const ATT_COLOR: Record<Attunement, string> = {
  SOL: "var(--sol)", NOX: "#7ad0c0", ANIMA: "#7ad06b", QUANTA: "#b46bff", UMBRAXIS: "#9aa0ad",
};

export const Roster = {
  draft: [] as Slot[],

  open(): void {
    // seed from the default SOL party so "just hit Begin" works
    this.draft = PARTY_DEFS.map((d) => ({ name: d.name, att: d.att, cls: d.cls, row: d.row ?? "front" }));
    this.render();
  },

  render(): void {
    const cards = this.draft.map((s, i) => {
      const col = ATT_COLOR[s.att];
      const body = classBody(s.att, s.cls) || "";
      return `<div class="rcard" style="border-color:${col}33">
        <div class="rbody">${body ? `<img src="${body}" alt="">` : `<div class="spr">🧝</div>`}</div>
        <div class="rinfo">
          <div class="rname">${s.name} <span class="rcls" style="color:${col}">${className(s.att, s.cls)}</span></div>
          <div class="rpick"><button class="rb" onclick="Roster.cycle(${i},'att',-1)">◀</button><b style="color:${col};flex:1;text-align:center">${s.att}</b><button class="rb" onclick="Roster.cycle(${i},'att',1)">▶</button></div>
          <div class="rpick"><button class="rb" onclick="Roster.cycle(${i},'cls',-1)">◀</button><span style="flex:1;text-align:center">${s.cls}</span><button class="rb" onclick="Roster.cycle(${i},'cls',1)">▶</button></div>
          <button class="rb wide ${s.row === "back" ? "back" : ""}" onclick="Roster.toggleRow(${i})">${s.row === "back" ? "↩ Back line" : "⚔ Front line"}</button>
        </div></div>`;
    }).join("");
    const nf = this.draft.filter((s) => s.row !== "back").length;
    Overlay.show(`<h2 class="title-gold">Assemble your party</h2>
      <p class="small">Pick each hero's Attunement and Weapon Archetype (their class), and a formation row. The front line is struck first; the back line (casters, ranged) is shielded. <b>${nf} front · ${5 - nf} back</b></p>
      <div class="rgrid">${cards}</div>
      <div class="row" style="margin-top:10px">
        <button class="btn" onclick="Roster.useDefault()">Default SOL party</button>
        <button class="btn gold" onclick="Roster.begin()">Begin →</button>
      </div>`);
  },

  cycle(i: number, field: "att" | "cls", dir: number): void {
    const s = this.draft[i];
    if (field === "att") {
      const ix = (ATTUNEMENTS.indexOf(s.att) + dir + ATTUNEMENTS.length) % ATTUNEMENTS.length;
      s.att = ATTUNEMENTS[ix];
    } else {
      const ix = (ARCHETYPE_KEYS.indexOf(s.cls) + dir + ARCHETYPE_KEYS.length) % ARCHETYPE_KEYS.length;
      s.cls = ARCHETYPE_KEYS[ix];
    }
    this.render();
  },
  toggleRow(i: number): void { this.draft[i].row = this.draft[i].row === "back" ? "front" : "back"; this.render(); },

  useDefault(): void { Overlay.hide(); Game.startRun(PARTY_DEFS); },
  begin(): void {
    const defs: MemberDef[] = this.draft.map((s, i) => buildDef(`hero${i}`, s.name, s.att, s.cls, s.row));
    Overlay.hide();
    Game.startRun(defs);
  },
};
