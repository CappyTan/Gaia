// Thin DOM helpers used by the UI/controller layers.

export const $ = <T extends Element = HTMLElement>(sel: string): T | null =>
  document.querySelector<T>(sel);

/** Require an element to exist (throws if missing) — for boot-critical nodes. */
export const must = <T extends Element = HTMLElement>(sel: string): T => {
  const e = document.querySelector<T>(sel);
  if (!e) throw new Error(`Missing required element: ${sel}`);
  return e;
};

export function el(tag: string, cls?: string, html?: string | null): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
