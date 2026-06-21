import { $ } from "../core/dom";

// The single modal overlay used for loot, level-ups, menus, merchant, and end screens.
export const Overlay = {
  show(html: string, wide = false): void {
    const inner = $("#overlayInner");
    if (inner) {
      inner.innerHTML = html;
      (inner as HTMLElement).style.maxWidth = wide ? "880px" : ""; // wide layouts (e.g. the Party hub) opt in
    }
    $("#overlay")?.classList.add("on");
  },
  hide(): void {
    $("#overlay")?.classList.remove("on");
  },
  isOn(): boolean {
    return $("#overlay")?.classList.contains("on") ?? false;
  },
};
