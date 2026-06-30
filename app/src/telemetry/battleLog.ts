// Per-action battle telemetry for the Test Loop dev harness (ADR 0017) — a SEPARATE buffer from the
// shipping Telemetry service (which records session aggregates). This is granular per-hit data, captured
// at the battle.ts seams and gated by `enabled` (mirrors Game.testMode), so it costs ZERO in real play.
// In-memory only (dies on exit-to-title), capped at the last N fights, exported on demand (Copy/Download
// JSON, the same plumbing as Telemetry). Pure presentation/instrumentation — no engine change.

import { Overlay } from "../ui/overlay";

/** One resolved action (a hit/heal) in a fight's timeline. */
export interface BLAction {
  seq: number;
  side: "party" | "enemy";
  actor: string;
  ability: string;       // skill name, or "Attack" for a basic
  target: string;
  dmg: number;           // damage dealt (negative = heal)
  affinityMult: number;  // the affinity-ring multiplier on this hit (1 = neutral)
  crit: boolean;
  status?: string;       // status(es) applied by this action
  hpBefore: number;
  hpAfter: number;
}

/** A per-fight context header + its action stream + a rolled-up summary. */
export interface BLFight {
  ctx: {
    enemies: { key: string; lvl: number; att: string; elite?: boolean; champion?: boolean }[];
    party: { name: string; cls: string; att: string; level: number; gearScore: number }[];
    isBoss: boolean;
    depth: number;
    env: string;
  };
  actions: BLAction[];
  outcome: "won" | "wipe" | "fled" | "";
  summary: { actions: number; partyDmg: number; enemyDmg: number; crits: number; partyHpEndPct: number };
}

const CAP = 30; // keep the last N fights as a backstop (in-memory only)

export const BattleLog = {
  enabled: false,
  fights: [] as BLFight[],
  cur: null as BLFight | null,
  _seq: 0,

  /** Begin a fight context (called from Battle.begin under testMode). */
  startFight(ctx: BLFight["ctx"]): void {
    if (!this.enabled) return;
    this._seq = 0;
    this.cur = { ctx, actions: [], outcome: "", summary: { actions: 0, partyDmg: 0, enemyDmg: 0, crits: 0, partyHpEndPct: 0 } };
  },

  /** Record one resolved action (called from Battle.strike under testMode). */
  action(ev: Omit<BLAction, "seq">): void {
    if (!this.enabled || !this.cur) return;
    this.cur.actions.push({ seq: this._seq++, ...ev });
  },

  /** Close the current fight, roll up its summary, and bank it (capped). */
  endFight(outcome: BLFight["outcome"], partyHpEndPct: number): void {
    if (!this.enabled || !this.cur) return;
    const f = this.cur;
    f.outcome = outcome;
    f.summary.actions = f.actions.length;
    f.summary.partyDmg = f.actions.filter((a) => a.side === "party" && a.dmg > 0).reduce((n, a) => n + a.dmg, 0);
    f.summary.enemyDmg = f.actions.filter((a) => a.side === "enemy" && a.dmg > 0).reduce((n, a) => n + a.dmg, 0);
    f.summary.crits = f.actions.filter((a) => a.crit).length;
    f.summary.partyHpEndPct = Math.round(partyHpEndPct);
    this.fights.push(f);
    if (this.fights.length > CAP) this.fights = this.fights.slice(-CAP);
    this.cur = null;
  },

  clear(): void { this.fights = []; this.cur = null; this._seq = 0; },

  // ── export (reuses the Telemetry Copy/Download plumbing) ──────────────────────────────────────
  _exportJson(): string {
    return JSON.stringify({ exported: Date.now(), fights: this.fights }, null, 2);
  },
  copy(): void {
    const json = this._exportJson();
    const done = () => { const b = document.getElementById("blCopyBtn"); if (b) b.textContent = "Copied ✓"; };
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(json).then(done, () => fallbackCopy(json, done)); }
    else fallbackCopy(json, done);
  },
  download(): void {
    const blob = new Blob([this._exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gaia-battlelog.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },

  // ── dashboard (loop-menu only) ────────────────────────────────────────────────────────────────
  show(): void {
    const n = this.fights.length;
    const won = this.fights.filter((f) => f.outcome === "won").length;
    const wipes = this.fights.filter((f) => f.outcome === "wipe").length;
    const totalActions = this.fights.reduce((s, f) => s + f.summary.actions, 0);
    const totalCrits = this.fights.reduce((s, f) => s + f.summary.crits, 0);
    const pDmg = this.fights.reduce((s, f) => s + f.summary.partyDmg, 0);
    const eDmg = this.fights.reduce((s, f) => s + f.summary.enemyDmg, 0);
    const head = `<h2 class="title-gold">Battle Log</h2>
      <div class="small" style="opacity:.8">Per-action telemetry for this Test Loop session (in-memory; last ${CAP} fights). Not saved.</div>
      <div class="spoils-head" style="margin:6px 0">
        <span class="spoil-pill"><b>${n}</b> fights</span>
        <span class="spoil-pill"><b>${won}</b>W / <b>${wipes}</b>L</span>
        <span class="spoil-pill"><b>${totalActions}</b> actions</span>
        <span class="spoil-pill"><b>${totalCrits}</b> crits</span>
        <span class="spoil-pill"><b>${pDmg}</b> party dmg</span>
        <span class="spoil-pill"><b>${eDmg}</b> enemy dmg</span>
      </div>`;
    let list = `<div class="scroll" style="max-height:46vh;text-align:left">`;
    if (!n) list += `<p class="small">No fights yet — run a fight from the Test Loop.</p>`;
    this.fights.slice().reverse().forEach((f, ri) => {
      const i = n - 1 - ri;
      const mark = f.outcome === "won" ? "✓" : f.outcome === "wipe" ? "✗" : "•";
      const foes = f.ctx.enemies.map((e) => `${e.key} L${e.lvl}`).join(", ");
      list += `<div class="card" style="margin:4px 0;padding:6px 8px">
        <button class="btn" style="font-size:12px;padding:6px 10px" onclick="BattleLog.showFight(${i})">${mark} #${i + 1} ▸</button>
        <span class="small"> ${f.ctx.isBoss ? "BOSS " : ""}${foes}</span>
        <div class="small" style="opacity:.8;margin-top:3px">${f.summary.actions} actions · party ${f.summary.partyDmg} dmg · enemy ${f.summary.enemyDmg} dmg · ${f.summary.crits} crits · party ended ${f.summary.partyHpEndPct}% HP</div>
      </div>`;
    });
    list += `</div>`;
    const canCopy = !!navigator.clipboard?.writeText;
    const actions = `<div class="row" style="margin-top:6px">
      <button id="blCopyBtn" class="btn${canCopy ? " gold" : ""}" onclick="BattleLog.copy()">Copy JSON</button>
      <button class="btn" onclick="BattleLog.download()">Download</button>
      <button class="btn" onclick="BattleLog.clear();BattleLog.show()">Clear</button>
      <button class="btn" onclick="TestLoop.menu()">◂ Test Loop</button></div>`;
    Overlay.show(head + list + actions);
  },

  /** Drill into one fight's action timeline. */
  showFight(i: number): void {
    const f = this.fights[i];
    if (!f) { this.show(); return; }
    const party = f.ctx.party.map((p) => `${p.name} (${p.cls}, L${p.level}, GS ${p.gearScore})`).join(" · ");
    let h = `<h2 class="title-gold">Fight #${i + 1} — ${f.outcome || "?"}</h2>
      <div class="small" style="text-align:left">Party: ${party}</div>
      <div class="small" style="text-align:left;opacity:.85;margin-top:2px">Foes: ${f.ctx.enemies.map((e) => `${e.key} L${e.lvl} (${e.att})${e.elite ? " elite" : ""}${e.champion ? " champ" : ""}`).join(", ")} · env ${f.ctx.env} · depth ${f.ctx.depth.toFixed(2)}</div>
      <div class="tag" style="margin-top:6px">Action timeline</div>
      <div class="scroll" style="max-height:44vh;text-align:left;font-size:11px;line-height:1.5">`;
    f.actions.forEach((a) => {
      const col = a.side === "party" ? "#aef0a0" : "#ff9b9b";
      const tag = a.crit ? " ✦CRIT" : a.affinityMult > 1 ? ` (${a.affinityMult.toFixed(2)}× surge)` : a.affinityMult < 1 ? ` (${a.affinityMult.toFixed(2)}× resist)` : "";
      const st = a.status ? ` +${a.status}` : "";
      const amt = a.dmg < 0 ? `heal ${-a.dmg}` : `${a.dmg}`;
      h += `<div><span style="color:${col}">${a.seq}. ${a.actor}</span> — ${a.ability} → ${a.target}: <b>${amt}</b>${tag}${st} <span style="opacity:.6">[${a.hpBefore}→${a.hpAfter}]</span></div>`;
    });
    h += `</div><div class="row" style="margin-top:6px"><button class="btn gold" onclick="BattleLog.show()">◂ Battle Log</button></div>`;
    Overlay.show(h);
  },
};

function fallbackCopy(text: string, done: () => void): void {
  const ta = document.createElement("textarea");
  ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch { /* ignore */ }
  ta.remove();
}
