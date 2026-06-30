// Roster picker: before a run, build your party of five — each hero's Attunement × Archetype
// (= class). The formation is fixed 3 front / 2 back (front line is targeted first, the back
// line of casters/ranged is shielded). Class = weapon, so a hero's starting class is set here
// and can later change via loot. Bodies/kits for any attunement come from the art + the
// KITS_GENERIC fallback, so every attunement is playable.

import type { Attunement, MemberDef } from "../types";
import { ATTUNEMENTS } from "../types";
import { ATT } from "../data/attunements";
import { ARCHETYPES, ARCHETYPE_KEYS, buildDef, PARTY_DEFS } from "../data/party";
import { className } from "../data/classes";
import { classBody } from "../ui/render";
import { Overlay } from "../ui/overlay";
import { Screens } from "./screens";
import { Game } from "./game";

interface Slot { name: string; att: Attunement; cls: string; }
const HEAL_ROLES = ["Healer", "Caster"]; // a party with neither has no sustain/ranged punch

export const Roster = {
  draft: [] as Slot[],
  // Optional override for what "confirm" does with the built defs (the Test Loop harness installs them
  // into a borrowed test party instead of starting a real run). Reset on every open(); null = start a run.
  onConfirm: null as ((defs: MemberDef[]) => void) | null,
  rowOf(i: number): "front" | "back" { return i < 3 ? "front" : "back"; }, // slots 0-2 front, 3-4 back

  open(onConfirm: ((defs: MemberDef[]) => void) | null = null): void {
    this.onConfirm = onConfirm;
    this.draft = PARTY_DEFS.map((d) => ({ name: d.name, att: d.att, cls: d.cls }));
    this.render();
  },
  // Hand the built defs to the active consumer: the harness hook if set, else a fresh real run.
  confirm(defs: MemberDef[]): void {
    Overlay.hide();
    if (this.onConfirm) { const fn = this.onConfirm; this.onConfirm = null; fn(defs); }
    else Game.startRun(defs);
  },

  card(i: number): string {
    const s = this.draft[i];
    const col = ATT[s.att].color;
    const role = ARCHETYPES[s.cls]?.role ?? "";
    const body = classBody(s.att, s.cls) || "";
    return `<div class="rcard" style="border-color:${col}44">
      <div class="rbody">${body ? `<img src="${body}" alt="">` : `<div class="spr">🧝</div>`}</div>
      <div class="rinfo">
        <div class="rname">${s.name} <span class="rcls" style="color:${col}">${className(s.att, s.cls)}</span></div>
        <div class="rpick"><button class="rb" onclick="Roster.cycle(${i},'att',-1)">◀</button><b style="color:${col};flex:1;text-align:center">${s.att}</b><button class="rb" onclick="Roster.cycle(${i},'att',1)">▶</button></div>
        <div class="rpick"><button class="rb" onclick="Roster.cycle(${i},'cls',-1)">◀</button><span style="flex:1;text-align:center">${s.cls} · <span class="rrole">${role}</span></span><button class="rb" onclick="Roster.cycle(${i},'cls',1)">▶</button></div>
      </div></div>`;
  },

  render(): void {
    const front = [0, 1, 2].map((i) => this.card(i)).join("");
    const back = [3, 4].map((i) => this.card(i)).join("");
    const hasHealer = this.draft.some((s) => HEAL_ROLES.includes(ARCHETYPES[s.cls]?.role ?? ""));
    const warn = hasHealer ? "" : `<div class="rwarn">⚠ No Caster/Healer — you'll have no healing. Consider a Staff in the back line.</div>`;
    Overlay.show(`<h2 class="title-gold">Assemble your party</h2>
      <p class="small">Pick each hero's Attunement and Weapon Archetype (their class). The <b>front line</b> is struck first; the <b>back line</b> (casters, ranged) is shielded. <b>Max 2 heroes per Attunement.</b></p>
      ${warn}
      <div class="tag">⚔ Front line</div><div class="rgrid">${front}</div>
      <div class="tag" style="margin-top:8px">↩ Back line</div><div class="rgrid">${back}</div>
      <div class="rfoot row">
        <button class="btn" onclick="Overlay.hide();Screens.show('title')">← Title</button>
        <button class="btn" onclick="Roster.useDefault()">Default</button>
        <button class="btn gold" onclick="Roster.begin()">Begin →</button>
      </div>`);
  },

  // Max 2 heroes of any one Attunement (so a party can't hard-counter a known-attunement encounter
  // by stacking a single power). Cycling skips attunements already at the cap among the other slots.
  attCount(att: Attunement, exceptI: number): number {
    return this.draft.reduce((n, s, j) => n + (j !== exceptI && s.att === att ? 1 : 0), 0);
  },
  cycle(i: number, field: "att" | "cls", dir: number): void {
    const s = this.draft[i];
    if (field === "att") {
      let a = s.att;
      for (let k = 0; k < ATTUNEMENTS.length; k++) {
        a = ATTUNEMENTS[(ATTUNEMENTS.indexOf(a) + dir + ATTUNEMENTS.length) % ATTUNEMENTS.length];
        if (this.attCount(a, i) < 2) { s.att = a; break; } // skip an attunement already at the 2-cap
      }
    } else {
      s.cls = ARCHETYPE_KEYS[(ARCHETYPE_KEYS.indexOf(s.cls) + dir + ARCHETYPE_KEYS.length) % ARCHETYPE_KEYS.length];
    }
    this.render();
  },

  useDefault(): void { this.confirm(PARTY_DEFS); },
  begin(): void {
    const defs: MemberDef[] = this.draft.map((s, i) => buildDef(`hero${i}`, s.name, s.att, s.cls, this.rowOf(i)));
    this.confirm(defs);
  },
};
