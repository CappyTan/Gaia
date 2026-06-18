import { $ } from "../core/dom";

// The single modal overlay used for loot, level-ups, menus, merchant, and end screens.
export const Overlay = {
  show(html: string): void {
    const inner = $("#overlayInner");
    if (inner) inner.innerHTML = html;
    $("#overlay")?.classList.add("on");
  },
  hide(): void {
    $("#overlay")?.classList.remove("on");
  },
  isOn(): boolean {
    return $("#overlay")?.classList.contains("on") ?? false;
  },
};
