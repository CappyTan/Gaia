// Lightweight, NON-blocking in-world dialogue surface (ADR 0006). Distinct from the blocking
// modal `Overlay` used for menus/merchant: a small box anchored at the bottom of the field that
// shows one NPC line at a time and advances on tap/click. While open it captures the player's
// "talk/advance" action but doesn't freeze the screen the way the overlay does. DOM-only (ui/),
// no game logic — controllers drive it.

import { $ } from "../core/dom";

interface DState {
  name: string;
  spr: string;
  lines: string[];
  i: number;
  onDone?: () => void;
}

let st: DState | null = null;

function render(): void {
  const box = $("#dialogue");
  if (!box) return;
  if (!st) { box.classList.remove("on"); return; }
  const last = st.i >= st.lines.length - 1;
  box.innerHTML =
    `<div class="dlg-spr">${st.spr}</div>` +
    `<div class="dlg-body"><div class="dlg-name">${st.name}</div>` +
    `<div class="dlg-text">${st.lines[st.i]}</div></div>` +
    `<div class="dlg-next">${last ? "▢" : "▶"}</div>`;
  box.classList.add("on");
}

export const Dialogue = {
  isOn(): boolean { return !!st; },

  /** Open a conversation: shows the first line; `advance()` walks the rest, then closes. */
  open(name: string, spr: string, lines: string[], onDone?: () => void): void {
    st = { name, spr, lines: lines.length ? lines : ["..."], i: 0, onDone };
    render();
  },

  /** Tap/click while talking: next line, or close on the last. Returns true if it handled it. */
  advance(): boolean {
    if (!st) return false;
    if (st.i < st.lines.length - 1) { st.i++; render(); return true; }
    this.close();
    return true;
  },

  close(): void {
    const done = st?.onDone;
    st = null;
    render();
    done?.();
  },
};
