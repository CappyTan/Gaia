// Per-session + lifetime gameplay metrics, persisted to localStorage. Purpose: tune the
// ~1-hour pacing (encounter rate, fight length, drop rates, difficulty).

import type { RarityKey } from "../types";
import { cap } from "../core/rng";
import { RARITY } from "../data/rarity";
import { GAME_VERSION } from "../data/version";
import { TELEMETRY_ENDPOINT } from "./endpoint";
import { Overlay } from "../ui/overlay";
import { Game } from "../controllers/game";
import { Music } from "../audio/music";

type DropCounts = Record<RarityKey, number>;
const zeroDrops = (): DropCounts => ({ common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0, artifact: 0 });

interface Session {
  id: number; version: string; start: number; end: number | null; durationMs: number;
  reason: string | null; steps: number; encounters: number; won: number; fled: number;
  wipes: number; eliteFights: number; dmgDealt: number; dmgTaken: number; partyHits: number;
  crits: number; affinityBonus: number; affinityResist: number; drops: DropCounts;
  dropTotal: number; levelups: number; gold: number; bossResult: string | null;
  timeToBossMs: number | null; encMs: number[];
}

export const Telemetry = {
  key: "gaia_telemetry_v1",
  s: null as Session | null,
  all: [] as Session[],
  _encStart: 0,
  _encBoss: false,
  _eliteThisFight: false,

  load(): void {
    try { this.all = JSON.parse(localStorage.getItem(this.key) || "[]") || []; } catch { this.all = []; }
  },
  save(): void {
    try { localStorage.setItem(this.key, JSON.stringify(this.all.slice(-50))); } catch { /* ignore */ }
  },
  startSession(): void {
    this.endSession("restart"); // close any dangling session
    this.s = {
      id: Date.now(), version: GAME_VERSION, start: Date.now(), end: null, durationMs: 0, reason: null, steps: 0,
      encounters: 0, won: 0, fled: 0, wipes: 0, eliteFights: 0,
      dmgDealt: 0, dmgTaken: 0, partyHits: 0, crits: 0, affinityBonus: 0, affinityResist: 0,
      drops: zeroDrops(), dropTotal: 0, levelups: 0, gold: 0, bossResult: null, timeToBossMs: null, encMs: [],
    };
  },
  step(): void { if (this.s) this.s.steps++; },
  encounterStart(set: string[], _env: string, boss: boolean): void {
    if (!this.s) return;
    this.s.encounters++; this._encStart = Date.now(); this._encBoss = boss;
    if (set.length && this._eliteThisFight) this.s.eliteFights++;
    this._eliteThisFight = false;
  },
  noteElite(): void { if (this.s) this._eliteThisFight = true; },
  encounterEnd(result: "won" | "fled" | "wipe"): void {
    if (!this.s) return;
    const d = Date.now() - (this._encStart || Date.now());
    this.s.encMs.push(d);
    if (result === "won") this.s.won++;
    else if (result === "fled") this.s.fled++;
    else if (result === "wipe") this.s.wipes++;
  },
  dmg(fromSide: "party" | "enemy", amt: number, crit: boolean, mult: number): void {
    if (!this.s) return;
    if (fromSide === "party") {
      this.s.dmgDealt += amt; this.s.partyHits++;
      if (crit) this.s.crits++;
      if (mult > 1) this.s.affinityBonus++;
      else if (mult < 1) this.s.affinityResist++;
    } else this.s.dmgTaken += amt;
  },
  drop(rarity: RarityKey): void {
    if (this.s && this.s.drops[rarity] != null) { this.s.drops[rarity]++; this.s.dropTotal++; }
  },
  levelup(n: number): void { if (this.s) this.s.levelups += n; },
  boss(result: string): void {
    if (this.s) { this.s.bossResult = result; if (this.s.timeToBossMs == null) this.s.timeToBossMs = Date.now() - this.s.start; }
  },
  endSession(reason: string): void {
    if (!this.s) return;
    this.s.end = Date.now(); this.s.durationMs = this.s.end - this.s.start;
    this.s.reason = reason; this.s.gold = Game.gold || 0;
    if (reason !== "restart") this._autosave(this.s); // a real run end (victory/wipe) -> push to repo
    this.all.push(this.s); this.save(); this.s = null;
  },
  // Fire-and-forget POST to the telemetry Worker (which commits it to the repo). No-op if no
  // endpoint is configured; never throws / never blocks gameplay.
  _autosave(session: Session): void {
    if (!TELEMETRY_ENDPOINT) return;
    try {
      fetch(TELEMETRY_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session), keepalive: true, // keepalive lets it finish during page-close
      }).catch(() => { /* offline / blocked — ignore */ });
    } catch { /* ignore */ }
  },

  agg() {
    const sessions = [...this.all, ...(this.s ? [this.s] : [])];
    const A = {
      sessions: sessions.length, steps: 0, encounters: 0, won: 0, fled: 0, wipes: 0, eliteFights: 0,
      dmgDealt: 0, dmgTaken: 0, partyHits: 0, crits: 0, affinityBonus: 0, affinityResist: 0, levelups: 0,
      drops: zeroDrops(), dropTotal: 0, encMsAll: [] as number[], durationMs: 0, bossWins: 0, timeToBoss: [] as number[],
    };
    sessions.forEach((s) => {
      A.steps += s.steps; A.encounters += s.encounters; A.won += s.won; A.fled += s.fled; A.wipes += s.wipes;
      A.eliteFights += s.eliteFights; A.dmgDealt += s.dmgDealt; A.dmgTaken += s.dmgTaken; A.partyHits += s.partyHits;
      A.crits += s.crits; A.affinityBonus += s.affinityBonus; A.affinityResist += s.affinityResist; A.levelups += s.levelups;
      A.dropTotal += s.dropTotal; A.durationMs += s.durationMs || (s === this.s ? Date.now() - s.start : 0);
      (Object.keys(A.drops) as RarityKey[]).forEach((k) => (A.drops[k] += s.drops[k] || 0));
      A.encMsAll.push(...(s.encMs || []));
      if (s.bossResult === "win") A.bossWins++;
      if (s.timeToBossMs != null) A.timeToBoss.push(s.timeToBossMs);
    });
    return A;
  },

  show(): void {
    const cur = this.s, A = this.agg();
    const ms = (v: number | null) => (v == null ? "—" : v < 60000 ? (v / 1000).toFixed(0) + "s" : (v / 60000).toFixed(1) + "m");
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const pctf = (n: number, d: number) => (d ? Math.round((n / d) * 100) + "%" : "—");
    const dropRow = (d: DropCounts) => RARITY.map((r) => `<span class="r-${r.key}">${cap(r.key)} ${d[r.key]}</span>`).join(" · ");
    let h = `<h2 class="title-gold">Telemetry</h2><div class="small" style="margin-top:-4px;opacity:.7">build ${GAME_VERSION} · audio: ${Music.status()}</div>`;
    if (cur) {
      h += `<div class="card" style="text-align:left;border-color:var(--gold)">
      <div class="tag">Current session</div>
      <div class="small">Time ${ms(Date.now() - cur.start)} · Steps ${cur.steps} · Encounters ${cur.encounters} (won ${cur.won}, fled ${cur.fled})</div>
      <div class="small">Dmg dealt ${cur.dmgDealt} · taken ${cur.dmgTaken} · Crit ${pctf(cur.crits, cur.partyHits)} · SOL-bonus hits ${cur.affinityBonus} / resisted ${cur.affinityResist}</div>
      <div class="small">Level-ups ${cur.levelups} · Drops ${cur.dropTotal} · Gold ${Game.gold}</div>
      <div class="small">Drops: ${dropRow(cur.drops)}</div>
      ${cur.timeToBossMs != null ? `<div class="small">Reached boss in ${ms(cur.timeToBossMs)}</div>` : ""}
    </div>`;
    }
    h += `<div class="card" style="text-align:left">
      <div class="tag">Lifetime (${A.sessions} sessions)</div>
      <div class="small">Avg session ${ms(A.sessions ? A.durationMs / A.sessions : 0)} · Avg fight ${ms(avg(A.encMsAll))} · Total steps ${A.steps}</div>
      <div class="small">Encounters ${A.encounters} · Win ${pctf(A.won, A.encounters)} · Fled ${A.fled} · Wipes ${A.wipes} · Elite fights ${A.eliteFights}</div>
      <div class="small">Crit rate ${pctf(A.crits, A.partyHits)} · Affinity bonus ${pctf(A.affinityBonus, A.partyHits)} / resist ${pctf(A.affinityResist, A.partyHits)}</div>
      <div class="small">Dmg dealt ${A.dmgDealt} · taken ${A.dmgTaken} · Level-ups ${A.levelups}</div>
      <div class="small">Drops (${A.dropTotal}): ${dropRow(A.drops)}</div>
      <div class="small">Boss wins ${A.bossWins} · Avg time-to-boss ${ms(avg(A.timeToBoss))}</div>
    </div>`;
    h += `<div class="row">
      <button id="tmCopyBtn" class="btn gold" onclick="Telemetry.copy()">Copy JSON</button>
      <button class="btn" onclick="Telemetry.download()">Download</button>
      <button class="btn" onclick="Telemetry.reset()">Reset</button>
      <button class="btn" onclick="Overlay.hide()">Close</button></div>
      <div class="small" style="opacity:.7;margin-top:6px">On mobile use <b>Copy JSON</b> (downloads are blocked in-app) — paste into Notes or a message.</div>`;
    Overlay.show(h);
  },
  _exportJson(): string {
    return JSON.stringify({ exported: Date.now(), sessions: this.all, current: this.s }, null, 2);
  },
  // Copy works on iOS Safari where a programmatic <a download> is silently blocked.
  copy(): void {
    const json = this._exportJson();
    const done = () => { const b = document.getElementById("tmCopyBtn"); if (b) b.textContent = "Copied ✓"; };
    const fallback = () => {
      const t = document.createElement("textarea");
      t.value = json; t.style.position = "fixed"; t.style.top = "0"; t.style.opacity = "0";
      document.body.appendChild(t); t.focus(); t.select();
      try { document.execCommand("copy"); done(); } catch { /* ignore */ }
      t.remove();
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(json).then(done).catch(fallback);
    else fallback();
  },
  download(): void {
    const blob = new Blob([this._exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "gaia-telemetry.json";
    document.body.appendChild(a); a.click(); a.remove();
  },
  reset(): void { this.all = []; this.save(); this.show(); },
};
