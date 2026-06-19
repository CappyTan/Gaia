// ATB battle engine + battle-screen rendering. Orchestration layer: drives the gauge loop,
// player/enemy turns, and damage resolution by calling the pure combat systems, then paints
// the DOM. Pure math (combatDamage, makeEnemy, status helpers) lives in ../systems/combat.

import type { CombatAct, Enemy, Item, Member, Skill, Unit } from "../types";
import { $, el } from "../core/dom";
import { cap, ri, pick } from "../core/rng";
import { SKILLS } from "../data/skills";
import { combatDamage, damage, heal, applyStatus, makeEnemy, stunImmune } from "../systems/combat";
import { ATT } from "../data/attunements";
import { ENEMY_ABILITIES } from "../systems/enemyAbilities";
import { recalc, grantXp, skillUnlocked, mnaBonus, type LevelUp } from "../systems/progression";
import { rollDrop } from "../systems/loot";
import { enemySprite, renderDoll, statusBadges, pct, itemHtml, critFxUrl } from "../ui/render";
import { assetUrl } from "../core/assets";
import { Overlay } from "../ui/overlay";
import { Music } from "../audio/music";
import { Telemetry } from "../telemetry/telemetry";
import { Game } from "./game";
import { Screens } from "./screens";
import { Field } from "./field";

interface Selecting { m: Member; act: CombatAct; kind: "enemy" | "ally"; }

export const Battle = {
  active: false,
  enemies: [] as Enemy[],
  current: null as Unit | null,
  awaiting: false,
  selecting: null as Selecting | null,
  raf: 0,
  last: 0,
  env: "plains",
  isBoss: false,
  finalBoss: false,
  logLines: [] as string[],
  _unlockT: undefined as ReturnType<typeof setTimeout> | undefined,

  begin(enemyKeys: string[], env: string, isBoss: boolean, finalBoss: boolean, depth: number, champIdx = -1): void {
    this.active = true; this.isBoss = !!isBoss; this.finalBoss = !!finalBoss; this.env = env || "plains";
    const dp = depth || 0;
    this.enemies = enemyKeys.map((k, i) => makeEnemy(k, i, isBoss, dp, i === champIdx));
    if (this.enemies.some((e) => e.elite)) Telemetry.noteElite();
    Telemetry.encounterStart(enemyKeys, env || "plains", !!isBoss);
    Music.play(isBoss ? "boss" : "battle"); Music._renderStyleLabels();
    Game.party.forEach((m) => { m.atb = ri(0, 40); m.status = {}; m.side = "party"; m.guarding = false; m.acted = false; m.acting = false; m._hurt = false; });
    this.enemies.forEach((e) => { e.atb = ri(0, 30); });
    this.awaiting = false; this.current = null; this.logLines = [];
    Screens.show("battle");
    this.renderBg(); this.renderAll();
    this.lockInput(700); // swallow taps bleeding over from the field D-pad as the screen swaps in
    const lead = this.enemies.find((e) => e.boss) || this.enemies[0];
    this.log(isBoss ? `${lead.name} blocks the path!` : "Enemies ambush the party!");
    this.last = performance.now(); cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },

  tick(t: number): void {
    const dt = Math.min(80, t - this.last); this.last = t;
    if (!this.awaiting) {
      const units = this.allLiving();
      for (const u of units) {
        u.atb += u.spd * dt * 0.012 * (u.side === "enemy" ? 1.2 : 1); // SPD drives fill; enemies act a touch faster (Dara: enemies too slow)
        if (u.atb >= 100) u.atb = 100;
      }
      const ready = units.filter((u) => u.atb >= 100).sort((a, b) => b.atb - a.atb)[0];
      if (ready) {
        if (ready.side === "party") this.startPlayerTurn(ready as Member);
        else this.enemyTurn(ready as Enemy);
      }
      this.renderBars();
    }
    if (this.active) this.raf = requestAnimationFrame((t2) => this.tick(t2));
  },

  allUnits(): Unit[] { return [...this.enemies, ...Game.party]; },
  allLiving(): Unit[] { return this.allUnits().filter((u) => u.alive); },
  livingEnemies(): Enemy[] { return this.enemies.filter((e) => e.alive); },
  livingParty(): Member[] { return Game.party.filter((m) => m.alive); },
  livingFront(): Member[] { return this.livingParty().filter((m) => m.row !== "back"); },
  // Who an enemy may strike with a single-target hit: the front line shields the back. Casters and
  // bosses can reach anyone; a melee foe flanks to the back ~20% of the time, or when the front
  // line has fallen.
  reachable(e: Enemy): Member[] {
    const front = this.livingFront();
    if (!front.length || e.ai === "boss" || e.ai === "caster" || Math.random() < 0.2) return this.livingParty();
    return front;
  },

  /* ---- player turn ---- */
  startPlayerTurn(m: Member): void {
    this.awaiting = true; this.current = m; this.selecting = null;
    this.tickStatuses(m, () => {
      if (!m.alive) { this.endTurn(m); return; }
      this.renderAll(); this.showCommands(m);
    });
  },
  showCommands(m: Member): void {
    this.setCmdWide(false);
    $("#cmdWho")!.textContent = `${m.name}  ·  ${m.cls}`;
    const list = $("#cmdList")!; list.innerHTML = "";
    const mk = (label: string, cost: number, fn: () => void, dis?: boolean) => {
      const b = el("button", "cmd", `${label}${cost ? `<span class="cost">${cost} MP</span>` : ""}`) as HTMLButtonElement;
      if (dis) b.disabled = true; else b.onclick = fn;
      list.appendChild(b);
    };
    mk("Attack", 0, () => this.chooseTarget(m, { type: "attack" }));
    const known = m.skills.map((k) => SKILLS[k]).filter((s) => skillUnlocked(m, s));
    const skBtn = el("button", "cmd", "Skill ▸"); skBtn.onclick = () => this.showSkills(m, known); list.appendChild(skBtn);
    mk("Defend", 0, () => { m.guarding = true; this.log(`${m.name} braces.`); this.endTurn(m); });
    mk("Flee", 0, () => this.confirmFlee(m), this.isBoss); // confirm so a stray tap never flees
    this.lockInput(350); // stray-tap guard: ignore taps for a beat after the menu opens
  },
  // Flee is destructive (you lose the fight's rewards) and sits where the field D-pad was, so it
  // takes a deliberate second tap — a fat-finger from walking can never exit the battle.
  confirmFlee(m: Member): void {
    const list = $("#cmdList")!; list.innerHTML = "";
    $("#cmdWho")!.textContent = "Flee the battle?";
    const yes = el("button", "cmd", "Yes — flee"); yes.onclick = () => this.tryFlee(m); list.appendChild(yes);
    const no = el("button", "cmd", "◂ Keep fighting"); no.onclick = () => this.showCommands(m); list.appendChild(no);
    this.lockInput(350);
  },
  lockInput(ms: number): void {
    const ids = ["#cmdPanel", "#enemyZone"];
    ids.forEach((s) => { const e = $(s); if (e) e.style.pointerEvents = "none"; });
    clearTimeout(this._unlockT);
    this._unlockT = setTimeout(() => ids.forEach((s) => { const e = $(s); if (e) e.style.pointerEvents = ""; }), ms);
  },
  showSkills(m: Member, known: Skill[]): void {
    this.setCmdWide(true); // give descriptions room to breathe
    const list = $("#cmdList")!; list.innerHTML = "";
    const back = el("button", "cmd", "◂ Back"); back.onclick = () => { this.setCmdWide(false); this.showCommands(m); }; list.appendChild(back);
    known.forEach((s) => {
      const afford = m.mp >= s.mp;
      const cost = `<span class="cost${afford ? "" : " low"}">${s.mp} MP${afford ? "" : " — low"}</span>`;
      const b = el("button", "cmd", `${s.name}${cost}<div class="small" style="font-size:11px;opacity:.82;line-height:1.2;margin-top:3px;white-space:normal">${s.desc}</div>`) as HTMLButtonElement;
      if (!afford) b.disabled = true; else b.onclick = () => { this.setCmdWide(false); this.useSkill(m, s); };
      list.appendChild(b);
    });
    if (known.length === 0) list.appendChild(el("div", "small", "No abilities unlocked yet — raise MNA in the Party screen."));
  },
  setCmdWide(on: boolean): void { $("#cmdPanel")?.classList.toggle("cmd-wide", on); },
  useSkill(m: Member, s: Skill): void {
    if (s.target === "self") { this.resolve(m, [m], { skill: s }); return; }
    if (s.target === "allEnemies") { this.resolve(m, this.livingEnemies(), { skill: s }); return; }
    if (s.target === "allAllies") { this.resolve(m, this.livingParty(), { skill: s }); return; }
    if (s.target === "ally") { this.chooseAlly(m, { skill: s }); return; }
    this.chooseTarget(m, { skill: s }); // enemy
  },
  chooseTarget(m: Member, act: CombatAct): void {
    this.selecting = { m, act, kind: "enemy" };
    $("#cmdWho")!.textContent = "Choose a target";
    this.renderEnemies(true);
  },
  chooseAlly(m: Member, act: CombatAct): void {
    this.selecting = { m, act, kind: "ally" };
    const list = $("#cmdList")!; list.innerHTML = "";
    const back = el("button", "cmd", "◂ Back"); back.onclick = () => this.showCommands(m); list.appendChild(back);
    $("#cmdWho")!.textContent = "Choose an ally";
    this.livingParty().forEach((a) => {
      const b = el("button", "cmd", `${a.name} (${a.hp}/${a.maxhp})`); b.onclick = () => this.resolve(m, [a], act); list.appendChild(b);
    });
  },
  targetClicked(e: Enemy): void {
    if (!this.selecting || this.selecting.kind !== "enemy") return;
    const m = this.selecting.m, act = this.selecting.act; this.selecting = null;
    this.renderEnemies(false);
    this.resolve(m, [e], act);
  },

  /* ---- resolution ---- */
  resolve(actor: Unit, targets: Unit[], act: CombatAct): void {
    this.selecting = null;
    const s = act.skill;
    if (s && s.mp) actor.mp = Math.max(0, (actor.mp ?? 0) - s.mp);
    this.markActing(actor);

    if (s && s.type === "heal") {
      targets.forEach((t) => { const amt = Math.round((actor.mag * (s.power ?? 0) + 6) * (1 + mnaBonus(actor.mna?.ANIMA ?? 0))); heal(t, amt); this.float(t, `+${amt}`, "#aef0a0"); if (s.status) applyStatus(t, s.status); });
      this.log(`${actor.name} casts ${s.name}.`);
    } else if (s && s.type === "buff") {
      targets.forEach((t) => {
        if (s.buff?.def) t.guarding = true;
        if (s.buff?.atkup) applyStatus(t, { atkup: s.buff.turns ?? 0 });
        if (s.buff?.wardArmor) { applyStatus(t, { wardArmor: s.buff.turns ?? 0 }); t.wardAmt = s.buff.wardArmor; }
      });
      this.log(`${actor.name} uses ${s.name}.`);
    } else if (s && s.type === "util" && s.cleanse) {
      targets.forEach((t) => { t.status = {}; this.float(t, "cleansed", "#9cd1ff"); });
      this.log(`${actor.name} cleanses ${targets[0].name}.`);
    } else {
      // damage (attack or offensive skill)
      const hits = s ? s.hits || 1 : 1;
      const name = s ? s.name : "attacks";
      this.log(`${actor.name} ${s ? `uses ${name}` : "attacks"}.`);
      targets.forEach((t) => {
        for (let h = 0; h < hits; h++) { if (!t.alive) break; this.strike(actor, t, act); }
      });
    }
    recalc(Game.party);
    this.renderAll();
    setTimeout(() => this.afterAction(actor), 360);
  },

  strike(actor: Unit, target: Unit, act: CombatAct): void {
    const s = act.skill;
    const r = combatDamage(actor, target, act);
    if (r.miss) { this.float(target, "miss", "#bbb"); this.log(`${actor.name} is blinded — misses!`); return; }
    const { dmg, crit, mult } = r;
    damage(target, dmg);
    Telemetry.dmg(actor.side, dmg, crit, mult);
    this.float(target, (crit ? "✦" : "") + dmg, mult > 1 ? "#ffd97a" : mult < 1 ? "#9aa" : "#fff");
    if (crit) this.critFx(target, s && s.sol ? "SOL" : actor.att); // burst in the attacking power's color
    if (mult > 1) this.log(`  ${target.name}: ${dmg} (SOL surges!)`);
    else if (mult < 1) this.log(`  ${target.name} resists: ${dmg}`);
    if (crit) this.log(`  Critical! ${dmg} to ${target.name}`);
    if (actor.leech) { const h = Math.round((dmg * actor.leech) / 100); if (h > 0) heal(actor, h); }
    if (s && s.status) {
      let st = s.status;
      if (st.stun && stunImmune(target)) { st = { ...st }; delete st.stun; this.float(target, "resist", "#ccc"); }
      applyStatus(target, st);
    }
    if (actor.bonusBurn) applyStatus(target, { burn: 2 });
    if (actor.onHitPoison) applyStatus(target, { poison: actor.onHitPoison });
    this.markHurt(target);
    if (!target.alive) this.onDeath(target);
  },

  onDeath(u: Unit): void { this.log(`${u.name} is defeated.`); },

  afterAction(actor: Unit): void { if (this.checkEnd()) return; this.endTurn(actor); },
  endTurn(actor: Unit): void {
    actor.atb = 0; actor.acting = false;
    this.awaiting = false; this.current = null;
    this.renderAll();
  },

  /* ---- enemy AI ---- */
  enemyTurn(e: Enemy): void {
    this.awaiting = true; this.current = e; this.markActing(e);
    this.tickStatuses(e, () => {
      if (!e.alive) { this.endTurn(e); return; }
      const party = this.livingParty();
      if (party.length === 0) { this.endTurn(e); return; }
      let used = false;
      if (e.skills && e.skills.length && Math.random() < e.castChance) {
        const ab = ENEMY_ABILITIES[pick(e.skills)]; if (ab) used = ab.use(e, this);
      }
      if (!used) {
        let target: Member;
        const pool = this.reachable(e); // front line shields the back row
        const taunter = party.find((p) => p.status.wardArmor && p.role === "Tank");
        if (e.ai === "boss") target = Math.random() < 0.5 ? pool.slice().sort((a, b) => a.hp - b.hp)[0] : pick(pool);
        else target = pick(pool);
        if (taunter && Math.random() < 0.5) target = taunter;
        if (e.boss && Math.random() < 0.2) {
          this.log(`${e.name} unleashes a wild swing!`);
          party.forEach((t) => this.strike(e, t, { aoe: true }));
        } else {
          this.log(`${e.name} strikes ${target.name}.`);
          this.strike(e, target, {});
        }
      }
      recalc(Game.party);
      this.renderAll();
      setTimeout(() => { if (!this.checkEnd()) this.endTurn(e); }, 380);
    });
  },

  /* ---- status ticking at the start of a unit's turn ---- */
  tickStatuses(u: Unit, done: () => void): void {
    const st = u.status; let delay = 0;
    if (st.burn) { const d = Math.max(2, Math.round((u.maxhp || 40) * 0.05)); damage(u, d); this.float(u, `-${d}`, "#ffb27a"); st.burn--; if (st.burn <= 0) delete st.burn; delay = 300; }
    if (st.poison) { const d = Math.max(2, Math.round((u.maxhp || 40) * 0.06)); damage(u, d); this.float(u, `-${d}`, "#aef0a0"); st.poison--; if (st.poison <= 0) delete st.poison; delay = 300; }
    if (st.decay) { const d = Math.max(2, Math.round((u.maxhp || 40) * 0.05)); damage(u, d); this.float(u, `-${d}`, "#7ad0c0"); st.decay--; if (st.decay <= 0) delete st.decay; delay = 300; }
    if (st.drain) { const d = Math.max(2, Math.round((u.maxhp || 40) * 0.05)); damage(u, d); this.float(u, `-${d}`, "#c4a7ff"); st.drain--; if (st.drain <= 0) delete st.drain; delay = 300; } // UMBRAXIS signature
    if (st.regen) { const h = Math.round((u.maxhp || 40) * 0.08); heal(u, h); this.float(u, `+${h}`, "#aef0a0"); st.regen--; if (st.regen <= 0) delete st.regen; delay = 300; }
    if (st.wardArmor) { st.wardArmor--; if (st.wardArmor <= 0) { delete st.wardArmor; delete u.wardAmt; } }
    if (st.atkup) { st.atkup--; if (st.atkup <= 0) delete st.atkup; }
    if (st.blind) { st.blind--; if (st.blind <= 0) delete st.blind; }
    u.guarding = false;
    if (st.stun) {
      delete st.stun; this.log(`${u.name} is stunned!`); recalc(Game.party); this.renderAll();
      if (!u.alive) { done(); return; }
      setTimeout(() => { u.atb = 0; this.awaiting = false; this.current = null; this.endTurn(u); }, 400);
      return;
    }
    recalc(Game.party);
    if (!u.alive) { this.renderAll(); setTimeout(done, delay); return; }
    setTimeout(done, delay);
  },

  tryFlee(m: Member): void {
    if (Math.random() < 0.6) { this.log("Got away safely."); this.end(false, true); }
    else { this.log("Couldn't escape!"); this.endTurn(m); }
  },

  checkEnd(): boolean {
    if (this.livingEnemies().length === 0) { this.end(true); return true; }
    if (this.livingParty().length === 0) { this.end(false); return true; }
    return false;
  },
  end(victory: boolean, fled?: boolean): void {
    if (!this.active) return;
    this.active = false; this.awaiting = true; cancelAnimationFrame(this.raf);
    Game.party.forEach((m) => { m.acting = false; m._hurt = false; });
    this.enemies.forEach((e) => { e.acting = false; });
    if (fled) { Telemetry.encounterEnd("fled"); setTimeout(() => Screens.show("field"), 300); return; }
    if (!victory) { Telemetry.encounterEnd("wipe"); setTimeout(() => Game.gameOver(), 600); return; }
    // ----- victory: XP + gold + loot -----
    Telemetry.encounterEnd("won");
    Music.play("victory");
    Game.encountersWon++;
    let xp = 0, gold = 0;
    const drops: Item[] = [];
    for (const e of this.enemies) {
      xp += e.xpReward; gold += ri(e.goldRange[0], e.goldRange[1]);
      // drops bias toward a random party member's class+attunement (useful), with built-in variety
      const drop = () => { const m = pick(Game.party); return rollDrop(e, m.cls, m.att); };
      const chance = e.boss || e.miniboss ? 1 : e.elite ? 1 : 0.4;
      if (Math.random() < chance) drops.push(drop());
      if (e.champion) drops.push(drop()); // a leader's hoard
      if (e.miniboss) drops.push(drop());
      if (e.boss) { drops.push(drop()); drops.push(drop()); }
    }
    Game.gold += gold;
    const leveled = grantXp(Game.party, xp);
    if (leveled.length) Telemetry.levelup(leveled.length);
    drops.forEach((d) => { Game.inventory.push(d); Telemetry.drop(d.rarity); });
    const wasMini = this.enemies.some((e) => e.miniboss),
      wasZoneBoss = this.enemies.some((e) => e.boss),
      wasFinal = this.finalBoss;
    if (wasMini) { Game.miniBossDefeated = true; if (Field.gate) Field.map[Field.gate.y][Field.gate.x] = "path"; }
    Game.continueAfterBattle = wasZoneBoss
      ? wasFinal
        ? () => Game.victory()
        : () => Game.openMerchant()
      : () => Screens.show("field");
    setTimeout(() => this.showSpoils(xp, gold, drops, leveled, wasFinal), 500);
  },
  showSpoils(xp: number, gold: number, drops: Item[], leveled: LevelUp[], wasFinal: boolean): void {
    let h = `<h2 class="title-gold">Victory</h2><p class="small">+${xp} XP · +${gold} gold</p>`;
    if (leveled.length) {
      h += `<div class="card" style="background:#161226;border-color:var(--gold)"><b class="title-gold">Level up!</b><br>`;
      leveled.forEach((l) => { h += `<div class="small">${l.name} → Lv ${l.level} · +1 MNA point${l.newSkill ? ` · learned <span class="r-legendary">${l.newSkill}</span>` : ""}</div>`; });
      h += `<div class="small" style="opacity:.8">Spend MNA points in the Party screen.</div>`;
      h += "</div>";
    }
    if (drops.length) {
      h += `<div class="tag">Loot</div><div class="scroll">`;
      drops.forEach((d) => { h += itemHtml(d); });
      h += "</div>";
    } else h += `<p class="small">No loot this time.</p>`;
    h += `<div class="row"><button class="btn" onclick="UI.openInventory()">Open Bag</button>`;
    if (leveled.length) h += `<button class="btn" onclick="UI.openParty()">Spend MNA →</button>`;
    h += wasFinal ? `<button class="btn gold" onclick="UI.close()">Finish</button>` : `<button class="btn gold" onclick="UI.close()">Continue</button>`;
    h += `</div><div class="small" style="margin-top:8px">Victory jingle: <a class="link" onclick="Music.cycleStyle('victory')">${cap(Music.styleByState.victory)} ▸</a></div>`;
    Overlay.show(h);
  },

  /* ---- rendering ---- */
  renderBg(): void {
    // Painterly terrain backgrounds (sliced from Dara's terrain sheet). Game env -> bg slug;
    // a dark scrim keeps sprites + bars legible over the bright art. Falls back to the original
    // CSS gradient if the image isn't present.
    const ENV_BG: Record<string, string> = { plains: "plains", forest: "forest", desert: "desert", mountains: "mountains", mire: "swamp", hollow: "cave" };
    const fallback: Record<string, string> = {
      plains: "radial-gradient(130% 95% at 50% 22%, #34465a 0%, #131a26 50%, #06090f 100%)",
      forest: "radial-gradient(130% 95% at 50% 22%, #243a2a 0%, #0d1611 50%, #060a07 100%)",
      desert: "radial-gradient(130% 95% at 50% 22%, #4a3a22 0%, #1b1308 50%, #0a0704 100%)",
      mountains: "radial-gradient(130% 95% at 50% 22%, #2c3645 0%, #131722 50%, #070a0e 100%)",
      mire: "radial-gradient(130% 95% at 50% 22%, #1f3a36 0%, #0c1a18 50%, #050d0c 100%)",
      hollow: "radial-gradient(130% 95% at 50% 22%, #2a2440 0%, #120e22 50%, #07050e 100%)",
    };
    const bg = $("#battleBg")!;
    const url = assetUrl(`backgrounds/${ENV_BG[this.env] || "plains"}.png`);
    if (url) {
      // boss fights get a heavier scrim + warm tint for drama
      const top = this.isBoss ? "rgba(40,8,14,.55)" : "rgba(6,6,11,.28)";
      const bot = this.isBoss ? "rgba(7,4,6,.78)" : "rgba(6,6,11,.55)";
      bg.style.backgroundImage = `linear-gradient(${top}, ${bot}), url(${url})`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center 30%";
    } else {
      bg.style.background = this.isBoss
        ? "radial-gradient(120% 95% at 38% 34%, #4a1424 0%, #1a0810 52%, #070406 100%)"
        : fallback[this.env] || fallback.plains;
    }
  },
  renderAll(): void {
    this.renderEnemies(!!this.selecting && this.selecting.kind === "enemy");
    this.renderParty(); this.renderRoster(); this.renderLog();
  },
  renderEnemies(targetable: boolean): void {
    const z = $("#enemyZone")!; z.innerHTML = "";
    this.enemies.forEach((e) => {
      const d = el("div", "enemy" + (e.alive ? "" : " dead") + (e.champion ? " champion" : e.elite ? " elite" : "") + (targetable && e.alive ? " targetable" : "") + (e.acting ? " acting" : ""));
      d.innerHTML = `${enemySprite(e)}<div class="ebar">
        <div class="ename">${e.champion ? "★ Champion " : ""}${e.name} <span class="att-tag" style="color:${ATT[e.att].color}">◆${e.att}</span>${e.eliteAffixes ? ` <span class="badge ${e.champion ? "champ" : "atkup"}">${e.eliteAffixes.join(" ")}</span>` : ""}${statusBadges(e)}</div>
        <div class="bar hp"><i style="width:${pct(e.hp, e.maxhp)}%"></i><span class="bartxt">${Math.max(0, e.hp)}/${e.maxhp}</span></div>
        <div class="bar atb"><i style="width:${e.atb}%"></i></div></div>`;
      if (targetable && e.alive) d.onclick = () => this.targetClicked(e);
      z.appendChild(d);
    });
  },
  renderParty(): void {
    const z = $("#partyZone")!; z.innerHTML = "";
    // Two-column formation: front line nearer the enemies (left), back line behind (right).
    const front = el("div", "pcol front"), back = el("div", "pcol back");
    front.innerHTML = `<div class="pcol-cap">Front</div>`;
    back.innerHTML = `<div class="pcol-cap">Back</div>`;
    z.appendChild(front); z.appendChild(back);
    Game.party.forEach((m) => {
      const d = el("div", "pchar" + (m.alive ? "" : " downed") + (m.acting ? " acting" : "") + (m._hurt ? " hurt" : ""));
      d.dataset.mid = m.id;
      const spr = m.alive ? renderDoll(m) : '<div class="spr">💤</div>';
      d.innerHTML = `<div style="text-align:right"><div class="ename" style="color:${m.alive ? "var(--gold2)" : "#666"}">${m.name}${statusBadges(m)}</div></div>${spr}`;
      (m.row === "back" ? back : front).appendChild(d);
    });
  },
  renderBars(): void {
    const ez = $("#enemyZone")!.children;
    this.enemies.forEach((e, i) => {
      const n = ez[i]; if (!n) return;
      const atb = n.querySelector<HTMLElement>(".bar.atb > i"); if (atb) atb.style.width = e.atb + "%";
    });
    this.renderRoster(true);
  },
  renderRoster(barsOnly?: boolean): void {
    const p = $("#rosterPanel")!;
    if (!barsOnly || p.children.length !== Game.party.length) {
      p.innerHTML = "";
      Game.party.forEach((m) => {
        const row = el("div", "prow" + (m === this.current ? " turn" : "") + (m.alive ? "" : " downed"));
        row.dataset.id = m.id;
        row.innerHTML = `<div class="pn">${m.name}${statusBadges(m)}</div>
        <div class="bars">
          <div class="bar hp"><i style="width:${pct(m.hp, m.maxhp)}%"></i><span class="bartxt">${Math.max(0, m.hp)}/${m.maxhp}</span></div>
          <div class="bar mp"><i style="width:${pct(m.mp, m.maxmp)}%"></i></div>
          <div class="bar atb"><i style="width:${m.atb}%"></i></div>
        </div>`;
        p.appendChild(row);
      });
      return;
    }
    [...p.children].forEach((row) => {
      const m = Game.party.find((x) => x.id === (row as HTMLElement).dataset.id);
      if (!m) return;
      row.classList.toggle("turn", m === this.current);
      const bars = row.querySelectorAll<HTMLElement>(".bar > i");
      if (bars[0]) { bars[0].style.width = pct(m.hp, m.maxhp) + "%"; row.querySelector(".bar.hp .bartxt")!.textContent = `${Math.max(0, m.hp)}/${m.maxhp}`; }
      if (bars[1]) bars[1].style.width = pct(m.mp, m.maxmp) + "%";
      if (bars[2]) bars[2].style.width = m.atb + "%";
    });
  },
  log(t: string): void { this.logLines.push(t); if (this.logLines.length > 4) this.logLines.shift(); this.renderLog(); },
  renderLog(): void { const l = $("#log"); if (!l) return; l.innerHTML = this.logLines.map((x) => `<div>${x}</div>`).join(""); },

  /* ---- battle-screen feedback helpers ---- */
  markActing(u: Unit): void { u.acting = true; this.renderAll(); },
  markHurt(u: Unit): void { u._hurt = true; this.renderAll(); setTimeout(() => { u._hurt = false; }, 260); },
  float(u: Unit, txt: string, color: string): void {
    let node: Element | null | undefined;
    if (u.side === "enemy") { const i = (this.enemies as Unit[]).indexOf(u); node = $("#enemyZone")!.children[i]; }
    else node = $(`#partyZone .pchar[data-mid="${(u as Member).id}"]`);
    if (!node) return;
    const f = el("div", "float", txt); f.style.color = color || "#fff";
    const r = node.getBoundingClientRect(), s = $("#stage")!.getBoundingClientRect();
    f.style.left = r.left - s.left + r.width / 2 + "px";
    f.style.top = r.top - s.top + "px";
    $("#stage")!.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  },
  // Pop-and-fade crit burst, centered on the struck unit, tinted to the attacking Attunement.
  // Single still (Dara's art) animated via CSS — no-op if that sprite isn't sliced yet.
  critFx(u: Unit, att: Unit["att"]): void {
    const url = critFxUrl(att);
    if (!url) return;
    let node: Element | null | undefined;
    if (u.side === "enemy") { const i = (this.enemies as Unit[]).indexOf(u); node = $("#enemyZone")!.children[i]; }
    else node = $(`#partyZone .pchar[data-mid="${(u as Member).id}"]`);
    if (!node) return;
    const img = el("img", "crit-fx") as HTMLImageElement;
    img.src = url;
    const r = node.getBoundingClientRect(), s = $("#stage")!.getBoundingClientRect();
    img.style.left = r.left - s.left + r.width / 2 + "px";
    img.style.top = r.top - s.top + r.height / 2 + "px";
    $("#stage")!.appendChild(img);
    setTimeout(() => img.remove(), 500);
  },
};
