// In-app content browser ("the Data screen"): a read-only view of the whole DB — bestiary, skills,
// the 45-class grid, and zones — for design/balance visibility at a glance. Reads via the DB
// registry and renders into the overlay. Phase 2 of the content layer; an inline editor + JSON
// export (so Dara can tweak values live and commit a patch) builds on this next.

import { DB } from "../data/db";
import { ATT } from "../data/attunements";
import { GAME_VERSION } from "../data/version";
import { Overlay } from "../ui/overlay";

type Tab = "bestiary" | "skills" | "classes" | "zones";

const tab = (t: Tab, cur: Tab, label: string): string =>
  `<button class="btn${t === cur ? " gold" : ""}" onclick="DataBrowser.show('${t}')">${label}</button>`;
const att = (a: string): string => `<b style="color:${ATT[a as keyof typeof ATT]?.color || "#fff"}">${a}</b>`;

function bestiary(): string {
  const rows = DB.enemies.all().sort((a, b) => a.lvl - b.lvl).map((e) => {
    const flags = [e.boss && "boss", e.miniboss && "mini", e.rare && "rare", e.art && `art:${e.art}`].filter(Boolean).join(" ");
    const zones = DB.enemies.zonesOf(e.key).map((zi) => DB.zones.get(zi)?.name || `z${zi}`).join(", ") || "—";
    return `<tr><td>${e.name}</td><td>${att(e.att)}</td><td>${e.lvl}</td><td>${e.hp}</td><td>${e.atk}</td><td>${e.spd}</td><td>${e.armor}</td><td>${e.mag || 0}</td><td>${e.xp}</td><td>${e.gold[0]}–${e.gold[1]}</td><td class="small">${flags || ""}</td><td class="small">${zones}</td></tr>`;
  }).join("");
  return `<table class="dt"><thead><tr><th>Name</th><th>Att</th><th>Lv</th><th>HP</th><th>ATK</th><th>SPD</th><th>ARM</th><th>MAG</th><th>XP</th><th>Gold</th><th>Flags</th><th>Zones</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function skills(): string {
  const rows = DB.skills.ids().map((id) => ({ id, s: DB.skills.get(id)! }))
    .sort((a, b) => a.s.att.localeCompare(b.s.att) || a.s.mnaReq - b.s.mnaReq)
    .map(({ id, s }) => `<tr><td>${s.name}</td><td>${att(s.att)}</td><td>${s.mnaReq}</td><td>${s.ult ? "ULT" : s.type}</td><td>${s.power ?? ""}</td><td>${s.hits ?? ""}</td><td>${s.mp || 0}</td><td class="small">${DB.skills.usedBy(id).length}</td><td class="small" style="max-width:240px">${s.desc}</td></tr>`).join("");
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
  show(t: Tab = "bestiary"): void {
    const counts = `${DB.enemies.keys().length} enemies · ${DB.skills.ids().length} abilities · ${DB.classes.all().length} classes · ${DB.zones.count()} zones`;
    Overlay.show(`<h2 class="title-gold">Content — Gaia ${GAME_VERSION}</h2>
      <div class="small" style="margin-top:-4px;opacity:.7">${counts}</div>
      <div class="row" style="margin:6px 0">${tab("bestiary", t, "Bestiary")}${tab("skills", t, "Abilities")}${tab("classes", t, "Classes")}${tab("zones", t, "Zones")}</div>
      <div class="scroll" style="max-height:62vh">${TABS[t]()}</div>
      <div class="row"><button class="btn gold" onclick="Overlay.hide()">Close</button></div>`);
  },
};
