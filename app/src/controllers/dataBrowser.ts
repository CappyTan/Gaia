// In-app content browser + editor ("the Data screen"): browse the whole DB (bestiary, abilities,
// the 45-class grid, zones) for design/balance visibility, and — in Edit mode — tweak the numeric
// balance knobs live. Edits mutate the live data, persist to localStorage (survive reload, apply
// in-game), validate on every change, and Export downloads a JSON patch to commit. TS stays the
// source of truth; this is a designer's cockpit over it. Reads via the DB registry.

import { DB } from "../data/db";
import { ATT } from "../data/attunements";
import { GAME_VERSION } from "../data/version";
import { validateContent } from "../data/validate";
import { getOverrides, setOverride, clearOverrides, overrideCount } from "../data/overrides";
import { Overlay } from "../ui/overlay";

type Tab = "bestiary" | "skills" | "classes" | "zones";

const tab = (t: Tab, cur: Tab, label: string): string =>
  `<button class="btn${t === cur ? " gold" : ""}" onclick="DataBrowser.show('${t}')">${label}</button>`;
const att = (a: string): string => `<b style="color:${ATT[a as keyof typeof ATT]?.color || "#fff"}">${a}</b>`;

// editable number cell (input in Edit mode, plain text otherwise)
function num(kind: "enemy" | "skill", key: string, field: string, val: number | undefined): string {
  if (!DataBrowser.edit) return `${val ?? ""}`;
  return `<input type="number" step="any" value="${val ?? ""}" style="width:52px;font-size:12px" onchange="DataBrowser.set('${kind}','${key}','${field}',this.value)">`;
}

function bestiary(): string {
  const rows = DB.enemies.all().sort((a, b) => a.lvl - b.lvl).map((e) => {
    const flags = [e.boss && "boss", e.miniboss && "mini", e.rare && "rare", e.art && `art:${e.art}`].filter(Boolean).join(" ");
    const zones = DB.enemies.zonesOf(e.key).map((zi) => DB.zones.get(zi)?.name || `z${zi}`).join(", ") || "—";
    return `<tr><td>${e.name}</td><td>${att(e.att)}</td><td>${e.lvl}</td><td>${num("enemy", e.key, "hp", e.hp)}</td><td>${num("enemy", e.key, "atk", e.atk)}</td><td>${num("enemy", e.key, "spd", e.spd)}</td><td>${num("enemy", e.key, "armor", e.armor)}</td><td>${num("enemy", e.key, "mag", e.mag || 0)}</td><td>${num("enemy", e.key, "xp", e.xp)}</td><td>${e.gold[0]}–${e.gold[1]}</td><td class="small">${flags || ""}</td><td class="small">${zones}</td></tr>`;
  }).join("");
  return `<table class="dt"><thead><tr><th>Name</th><th>Att</th><th>Lv</th><th>HP</th><th>ATK</th><th>SPD</th><th>ARM</th><th>MAG</th><th>XP</th><th>Gold</th><th>Flags</th><th>Zones</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function skills(): string {
  const rows = DB.skills.ids().map((id) => ({ id, s: DB.skills.get(id)! }))
    .sort((a, b) => a.s.att.localeCompare(b.s.att) || a.s.mnaReq - b.s.mnaReq)
    .map(({ id, s }) => `<tr><td>${s.name}</td><td>${att(s.att)}</td><td>${num("skill", id, "mnaReq", s.mnaReq)}</td><td>${s.ult ? "ULT" : s.type}</td><td>${num("skill", id, "power", s.power)}</td><td>${num("skill", id, "hits", s.hits)}</td><td>${num("skill", id, "mp", s.mp || 0)}</td><td class="small">${DB.skills.usedBy(id).length}</td><td class="small" style="max-width:220px">${s.desc}</td></tr>`).join("");
  return `<table class="dt"><thead><tr><th>Ability</th><th>Att</th><th>MNA</th><th>Type</th><th>Pow</th><th>Hits</th><th>MP</th><th>#cls</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function classes(): string {
  const rows = DB.classes.all().sort((a, b) => a.att.localeCompare(b.att) || a.archetype.localeCompare(b.archetype))
    .map((c) => `<tr><td>${att(c.att)}</td><td>${c.archetype}</td><td>${c.name}</td><td class="small">${c.kit.map((k) => DB.skills.get(k)?.name || k).join(" · ")}</td></tr>`).join("");
  return `<table class="dt"><thead><tr><th>Att</th><th>Archetype</th><th>Class</th><th>Kit (MNA order)</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function zones(): string {
  return DB.zones.all().map((z, zi) => {
    const bands = z.bands.map((b) => `<div class="small">@${Math.round(b.at * 100)}%: ${b.sets.map((s) => s.join("+")).join(" · ")}</div>`).join("");
    return `<div class="card" style="text-align:left;margin:6px 0">
      <b class="title-gold">${z.name}</b> <span class="pill">zone ${zi}</span>
      <div class="small">envs: ${z.envs.join(", ")} · dungeon: ${z.dungeon.name} (${z.dungeon.env})</div>
      <div class="small">mini: <b>${DB.enemies.get(z.mini)?.name || z.mini}</b>${z.miniAdds?.length ? ` (+${z.miniAdds.map((k) => DB.enemies.get(k)?.name || k).join(", ")})` : ""} · boss: <b>${DB.enemies.get(z.boss)?.name || z.boss}</b></div>
      <div style="margin-top:4px">${bands}</div>
    </div>`;
  }).join("");
}

const TABS: Record<Tab, () => string> = { bestiary, skills, classes, zones };

export const DataBrowser = {
  edit: false,
  _tab: "bestiary" as Tab,

  show(t?: Tab): void {
    t = t ?? this._tab;
    this._tab = t;
    const counts = `${DB.enemies.keys().length} enemies · ${DB.skills.ids().length} abilities · ${DB.classes.all().length} classes · ${DB.zones.count()} zones`;
    const nOv = overrideCount(getOverrides());
    const issues = validateContent();
    const status = this.edit
      ? `<div class="small" style="margin:2px 0">${issues.length
          ? `<span class="r-legendary">⚠ ${issues.length} integrity issue(s): ${issues[0]}${issues.length > 1 ? " …" : ""}</span>`
          : `<span class="r-uncommon">✓ content valid</span>`} · <b>${nOv}</b> edit${nOv === 1 ? "" : "s"} pending</div>`
      : "";
    const editControls = this.edit
      ? `<button class="btn gold" onclick="DataBrowser.export()">Export JSON</button><button class="btn" onclick="DataBrowser.reset()">Reset edits</button>`
      : "";
    Overlay.show(`<h2 class="title-gold">Content — Gaia ${GAME_VERSION}</h2>
      <div class="small" style="margin-top:-4px;opacity:.7">${counts}${nOv && !this.edit ? ` · <b class="r-legendary">${nOv} unsaved edit(s)</b>` : ""}</div>
      <div class="row" style="margin:6px 0">${tab("bestiary", t, "Bestiary")}${tab("skills", t, "Abilities")}${tab("classes", t, "Classes")}${tab("zones", t, "Zones")}
        <button class="btn${this.edit ? " gold" : ""}" onclick="DataBrowser.toggleEdit()">${this.edit ? "✎ Editing" : "✎ Edit"}</button>${editControls}</div>
      ${status}
      <div class="scroll" style="max-height:58vh">${TABS[t]()}</div>
      <div class="row"><button class="btn gold" onclick="Overlay.hide()">Close</button></div>`);
  },

  toggleEdit(): void { this.edit = !this.edit; this.show(this._tab); },

  // Commit one numeric edit: live data is mutated + persisted, then re-render (validates).
  set(kind: "enemy" | "skill", key: string, field: string, raw: string): void {
    const v = parseFloat(raw);
    if (!isFinite(v)) return;
    setOverride(kind, key, field, v);
    this.show(this._tab);
  },

  // Download the override patch (what gets committed / handed to a maintainer to fold into TS).
  export(): void {
    const blob = new Blob([JSON.stringify(getOverrides(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gaia-overrides.json";
    document.body.appendChild(a); a.click(); a.remove();
  },

  // Clear all edits and reload to restore base values cleanly.
  reset(): void {
    if (!overrideCount(getOverrides())) { clearOverrides(); return; }
    clearOverrides();
    location.reload();
  },
};
