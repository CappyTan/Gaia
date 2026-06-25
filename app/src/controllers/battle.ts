// ATB battle engine + battle-screen rendering. Orchestration layer: drives the gauge loop,
// player/enemy turns, and damage resolution by calling the pure combat systems, then paints
// the DOM. Pure math (combatDamage, makeEnemy, status helpers) lives in ../systems/combat.

import type { CombatAct, Enemy, Item, Member, Skill, Unit } from "../types";
import type { HeldItemDef } from "../data/heldItems";
import { $, el } from "../core/dom";
import { cap, ri, pick } from "../core/rng";
import { SKILLS } from "../data/skills";
import { combatDamage, damage, heal, applyStatus, makeEnemy, stunImmune } from "../systems/combat";
import { ATT, RING } from "../data/attunements";
import { ENEMY_ABILITIES } from "../systems/enemyAbilities";
import { recalc, grantXp, skillUnlocked, mnaBonus, type LevelUp } from "../systems/progression";
import { rollDrop } from "../systems/loot";
import { enemySprite, renderDoll, statusBadges, pct, itemHtml } from "../ui/render";
import { playSkillAnim, playSlash, playCast } from "../ui/skillAnimator";
import { SKILL_ANIM, BASIC_ATTACK_ANIM, type SkillAnim } from "../data/skillAnimations";
import { ULTIMATES, type Ultimate } from "../data/ultimates";
import { playCutscene } from "../ui/cutscene";
import { assetUrl } from "../core/assets";
import { Overlay } from "../ui/overlay";
import { Music } from "../audio/music";
import { Telemetry } from "../telemetry/telemetry";
import { Game } from "./game";
import { Screens } from "./screens";
import { Field } from "./field";

interface Selecting { m: Member; act: CombatAct; kind: "enemy" | "ally" | "ult"; ult?: Ultimate; }

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
  STATUS_NAMES: { burn: "Burn", poison: "Poison", decay: "Decay", drain: "Drain", stun: "Stun", blind: "Blind", atkup: "+ATK", regen: "Regen", def: "Guard", wardArmor: "Ward" } as Record<string, string>,
  _unlockT: undefined as ReturnType<typeof setTimeout> | undefined,
  // damage numbers held back during an animated skill, flushed when the hit lands (see animatedStrike).
  // `univ` = also play the universal mana-slash here (skills with their OWN bespoke impact layer set it
  // false so the two don't stack); `mirror` flips the slash for a hero→enemy hit (see strike).
  _animFloats: [] as { u: Unit; txt: string; color: string; crit: boolean; att: Unit["att"]; univ: boolean; mirror: boolean }[],
  _animHasImpact: false,   // true while resolving an animatedStrike whose anim supplies its own impact

  begin(enemyKeys: string[], env: string, isBoss: boolean, finalBoss: boolean, depth: number, champIdx = -1, zoneId = ""): void {
    this.active = true; this.isBoss = !!isBoss; this.finalBoss = !!finalBoss; this.env = env || "plains";
    const dp = depth || 0;
    this.enemies = enemyKeys.map((k, i) => makeEnemy(k, i, isBoss, dp, i === champIdx));
    if (this.enemies.some((e) => e.elite)) Telemetry.noteElite();
    Telemetry.encounterStart(enemyKeys, env || "plains", !!isBoss);
    Music.play(isBoss ? Music.forBoss(zoneId) : "battle"); Music._renderStyleLabels();
    // per-battle status starts clean; a carried dungeon "regen" reprieve (ADR 0010) seeds in AFTER the wipe
    // (and is spent), so a regen rest node heals gradually across THIS fight rather than instantly at the node.
    Game.party.forEach((m) => { m.atb = ri(0, 40); m.status = {}; if (m.pendingRegen) { m.status.regen = m.pendingRegen; m.pendingRegen = 0; } m.side = "party"; m.guarding = false; m.acted = false; m.acting = false; m._hurt = false; });
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
        const enraged = u.side === "enemy" && (u as Enemy).enraged ? 2 : 1; // enrage: double ATB gain (acts twice as fast)
        u.atb += u.spd * dt * 0.012 * (u.side === "enemy" ? 1.2 : 1) * enraged; // SPD drives fill; enemies act a touch faster (Dara: enemies too slow)
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
      if (!this.active) return; // the fight may have ENDED while this turn-start status tick was in flight
                                // (e.g. another hero killed the boss) — never re-open commands on a finished battle
      if (!m.alive) { this.onDeath(m); if (this.checkEnd()) return; this.endTurn(m); return; }
      this.renderAll(); this.showCommands(m);
    });
  },
  showCommands(m: Member): void {
    if (!this.active) return; // never paint the command menu after the battle has resolved (stuck-battle guard)
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
    // Ultimate: a per-class signature super (its own button, between Skill and Defend). Only shown for
    // members who have one (e.g. the Photon Vanguard's Orbital Cannon).
    const ult = ULTIMATES[`${m.att}:${m.cls}`];
    if (ult) { const uBtn = el("button", "cmd", "Ultimate ▸"); uBtn.onclick = () => this.showUltimate(m, ult); list.appendChild(uBtn); }
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
  // Ultimate submenu: a single big button for the class's signature super.
  showUltimate(m: Member, ult: Ultimate): void {
    this.setCmdWide(true);
    const list = $("#cmdList")!; list.innerHTML = "";
    const back = el("button", "cmd", "◂ Back"); back.onclick = () => { this.setCmdWide(false); this.showCommands(m); }; list.appendChild(back);
    const afford = m.mp >= ult.mp;
    const cost = `<span class="cost${afford ? "" : " low"}">${ult.mp ? `${ult.mp} MP` : "FREE"}${afford ? "" : " — low"}</span>`;
    const b = el("button", "cmd", `★ ${ult.name}${cost}<div class="small" style="font-size:11px;opacity:.82;line-height:1.2;margin-top:3px;white-space:normal">${ult.desc}</div>`) as HTMLButtonElement;
    if (!afford) b.disabled = true; else b.onclick = () => { this.setCmdWide(false); this.startUltimate(m, ult); };
    list.appendChild(b);
  },
  // Begin an ultimate: a single-target one asks you to pick a foe first; an all-enemies one fires now.
  startUltimate(m: Member, ult: Ultimate): void {
    if (ult.target === "enemy") {
      this.selecting = { m, act: {}, kind: "ult", ult };
      $("#cmdWho")!.textContent = "Choose a target";
      this.renderEnemies(true);
      this.lockInput(350);
      return;
    }
    this.fireUltimate(m, ult, this.livingEnemies());
  },
  // Fire the ultimate: take the turn, roll the cutscene (if any), and once the screen is back, apply
  // the hit to the chosen target(s) (with an impact burst), then resolve the turn / victory.
  fireUltimate(m: Member, ult: Ultimate, targets: Unit[]): void {
    this.selecting = null; this.awaiting = true; this.current = m;
    if (ult.mp) m.mp = Math.max(0, m.mp - ult.mp);
    const list = $("#cmdList"); if (list) list.innerHTML = "";
    $("#cmdWho")!.textContent = `${m.name} — ${ult.name}!`;
    this.lockInput(99999); // hold input through the cutscene; cleared when the next menu opens
    const apply = () => {
      if (!this.active) return;
      targets.filter((t) => t.alive).forEach((t) => {
        damage(t, ult.damage);
        this.float(t, String(ult.damage), "#ffd97a");
        this.slashFx(t, m.att, true, true); // hero-cast nuke: crit-grade slash, mirrored
        if (!t.alive) this.onDeath(t);
      });
      const who = ult.target === "enemy" ? (targets[0]?.name ?? "the target") : "all foes";
      this.log(`${m.name} unleashes ${ult.name} — ${ult.damage} to ${who}!`);
      recalc(Game.party); this.renderAll();
      setTimeout(() => this.afterAction(m), 500);
    };
    const url = ult.cutscene ? assetUrl(ult.cutscene) : null;
    if (url) playCutscene(url, apply); else apply();
  },
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
    if (!this.selecting || (this.selecting.kind !== "enemy" && this.selecting.kind !== "ult")) return;
    const sel = this.selecting; this.selecting = null;
    this.renderEnemies(false);
    if (sel.kind === "ult") { this.fireUltimate(sel.m, sel.ult!, [e]); return; } // single-target ultimate
    this.resolve(sel.m, [e], sel.act);
  },

  /* ---- resolution ---- */
  // A hero ABILITY (skill) first plays a mana CASTING CIRCLE under the caster for ~1.5s (hero idles),
  // then resolves. Basic attacks, enemy actions, and ultimates skip the circle (they resolve at once /
  // have their own flow). Falls back to instant resolve if the stage/sprite aren't in the DOM.
  resolve(actor: Unit, targets: Unit[], act: CombatAct): void {
    this.selecting = null;
    if (actor.side === "party" && act.skill) {
      const field = $("#battleField"), cel = this.spriteEl(actor);
      if (field && cel) {
        this.awaiting = true; this.current = actor;
        const list = $("#cmdList"); if (list) list.innerHTML = "";
        $("#cmdWho")!.textContent = `${actor.name} casts ${act.skill.name}…`;
        this.lockInput(99999); // hold input through the cast; cleared when the next menu opens
        const att = act.skill.sol ? "SOL" : actor.att;
        playCast(field, cel, att, () => this.resolveNow(actor, targets, act));
        return;
      }
    }
    this.resolveNow(actor, targets, act);
  },
  resolveNow(actor: Unit, targets: Unit[], act: CombatAct): void {
    const s = act.skill;
    if (s && s.mp) actor.mp = Math.max(0, (actor.mp ?? 0) - s.mp);

    // Layered combat animation (REQUIEM): a skill with an `anim` — or a class whose plain Attack has
    // a bespoke animation (BASIC_ATTACK_ANIM, e.g. the Photon Vanguard's rifle shot) — plays its
    // character/muzzle/projectile/impact sequence, applying damage + floating the number on the
    // configured beats. Single-target only. markActing is intentionally NOT called here — its lunge
    // would bob the hero's doll for a frame before the animation hides it (an intermittent flicker).
    const animKey = s && s.anim ? s.anim
      : !s && actor.side === "party" ? BASIC_ATTACK_ANIM[`${actor.att}:${(actor as Member).cls}`]
      : undefined;
    const anim = animKey ? SKILL_ANIM[animKey] : null;
    if (anim && targets.length === 1) { this.animatedStrike(actor, targets[0], act, anim); return; }

    this.markActing(actor);

    if (s && s.type === "heal") {
      targets.forEach((t) => { const amt = Math.round((actor.mag * (s.power ?? 0) + 6) * (1 + mnaBonus(actor.mna?.ANIMA ?? 0))); heal(t, amt); this.float(t, `+${amt}`, "#aef0a0"); if (s.status) applyStatus(t, s.status); this.log(`${actor.name}'s ${s.name} heals ${t.name} for ${amt}`); });
    } else if (s && s.type === "buff") {
      const applied: string[] = [];
      if (s.buff?.def) applied.push("Guard");
      if (s.buff?.atkup) applied.push("+ATK");
      if (s.buff?.wardArmor) applied.push("Ward");
      targets.forEach((t) => {
        if (s.buff?.def) t.guarding = true;
        if (s.buff?.atkup) applyStatus(t, { atkup: s.buff.turns ?? 0 });
        if (s.buff?.wardArmor) { applyStatus(t, { wardArmor: s.buff.turns ?? 0 }); t.wardAmt = s.buff.wardArmor; }
      });
      const who = targets.length > 1 ? "the party" : targets[0]?.name ?? actor.name;
      this.log(`${actor.name}'s ${s.name}${applied.length ? ` grants ${applied.join(", ")} to ${who}` : ""}`);
    } else if (s && s.type === "util" && s.cleanse) {
      targets.forEach((t) => { t.status = {}; this.float(t, "cleansed", "#9cd1ff"); });
      this.log(`${actor.name} cleanses ${targets[0].name}.`);
    } else {
      // damage (attack or offensive skill) — each strike() logs who it hit for how much
      const hits = s ? s.hits || 1 : 1;
      targets.forEach((t) => {
        for (let h = 0; h < hits; h++) { if (!t.alive) break; this.strike(actor, t, act); }
      });
    }
    recalc(Game.party);
    this.renderAll();
    setTimeout(() => this.afterAction(actor), 360);
  },

  // Run a skill's layered animation, then resolve the hit on its damage frame and float the number
  // when the blast lands. Falls back to an instant strike if the stage/sprites aren't in the DOM.
  animatedStrike(actor: Unit, target: Unit, act: CombatAct, anim: SkillAnim): void {
    const stage = $("#stage");
    const aEl = this.spriteEl(actor), tEl = this.spriteEl(target);
    if (!stage || !aEl || !tEl) {
      const hits = act.skill?.hits || 1;
      for (let h = 0; h < hits; h++) { if (target.alive) this.strike(actor, target, act); }
      recalc(Game.party); this.renderAll(); setTimeout(() => this.afterAction(actor), 360); return;
    }
    this._animFloats = [];
    this._animHasImpact = !!anim.impact;   // a bespoke impact layer overrides the universal burst
    playSkillAnim(anim, {
      stage, actor: aEl, target: tEl,
      onDamage: () => {
        const hits = act.skill?.hits || 1;
        for (let h = 0; h < hits; h++) { if (target.alive) this.strike(actor, target, act, true); }
        recalc(Game.party); this.renderAll();
      },
      onImpact: () => this.flushAnimFloats(),
      onComplete: () => this.afterAction(actor),
    });
  },
  flushAnimFloats(): void {
    this._animFloats.forEach((f) => { this.float(f.u, f.txt, f.color); if (f.univ) this.slashFx(f.u, f.att, f.crit, f.mirror); });
    this._animFloats = [];
  },

  strike(actor: Unit, target: Unit, act: CombatAct, silent = false): void {
    const s = act.skill;
    const r = combatDamage(actor, target, act);
    if (r.miss) {
      if (silent) this._animFloats.push({ u: target, txt: "miss", color: "#bbb", crit: false, att: actor.att, univ: false, mirror: false });
      else this.float(target, "miss", "#bbb");
      this.log(`${actor.name} misses ${target.name}.`); return;
    }
    const { crit, mult } = r;
    let dmg = r.dmg;
    if (actor.side === "enemy" && (actor as Enemy).enraged) dmg = Math.round(dmg * 2); // enrage: double damage
    damage(target, dmg);
    Telemetry.dmg(actor.side, dmg, crit, mult);
    const txt = (crit ? "✦" : "") + dmg, color = mult > 1 ? "#ffd97a" : mult < 1 ? "#9aa" : "#fff";
    const fxAtt = s && s.sol ? "SOL" : actor.att;
    // Mana-slash hit effect on the struck unit, coloured by the power's Attunement (mirrored for a
    // hero→enemy hit). Unless the skill's own animation supplies a bespoke impact layer, which overrides it.
    const mirror = actor.side === "party";
    if (silent) this._animFloats.push({ u: target, txt, color, crit, att: fxAtt, univ: !this._animHasImpact, mirror }); // deferred to impact
    else { this.float(target, txt, color); this.slashFx(target, fxAtt, crit, mirror); }
    // FULL combat log line: who hit whom for how much (both directions) — the scrollable history.
    const power = s && s.sol ? "SOL" : actor.att;
    const tag = crit ? " — CRIT!" : mult > 1 ? ` (${power} surge)` : mult < 1 ? " (resisted)" : "";
    this.log(`${s ? `${actor.name}'s ${s.name}` : actor.name} hits ${target.name} for ${dmg}${tag}`);
    if (actor.leech) { const h = Math.round((dmg * actor.leech) / 100); if (h > 0) heal(actor, h); }
    if (s && s.status) {
      let st = s.status;
      if (st.stun && stunImmune(target)) { st = { ...st }; delete st.stun; this.float(target, "resist", "#ccc"); this.log(`${target.name} resists Stun`); }
      applyStatus(target, st);
      const names = Object.keys(st).map((k) => this.STATUS_NAMES[k] || k);
      if (names.length) this.log(`${target.name} is afflicted with ${names.join(", ")}`);
    }
    if (actor.bonusBurn) { applyStatus(target, { burn: 2 }); this.log(`${target.name} is afflicted with Burn`); }
    if (actor.onHitPoison) { applyStatus(target, { poison: actor.onHitPoison }); this.log(`${target.name} is afflicted with Poison`); }
    this.markHurt(target);
    if (target.alive) this.maybeEnrage(target);
    if (!target.alive) this.onDeath(target);
  },

  onDeath(u: Unit): void { this.log(`${u.name} is defeated.`); },

  /* ---- ENRAGE: a flagged boss at ≤20% HP swaps to its "omega" sprite (crossfade) and gains
     double ATB gain + double damage for the rest of the fight. Art-only swap — the on-field
     footprint is unchanged (omega sprite is the same canvas as the alpha). ---- */
  maybeEnrage(u: Unit): void {
    const e = u as Enemy;
    if (u.side !== "enemy" || !u.alive || !e.enrage || e.enraged) return;
    if (u.hp > u.maxhp * 0.2) return;
    this.triggerEnrage(e);
  },
  triggerEnrage(e: Enemy): void {
    e.enraged = true;
    this.log(`⚠ ${e.name} ENRAGES — the Omega awakens!`);
    const i = (this.enemies as Unit[]).indexOf(e);
    const node = $("#enemyZone")!.children[i] as HTMLElement | undefined;
    const url = assetUrl(`enemies/${e.enrage!.omega}.png`);
    const img = node?.querySelector<HTMLElement>(".spr-img");
    if (img && url) {
      // crossfade: fade the omega sprite in on the #stage layer, over the alpha, then swap the
      // node's art so later re-renders show omega, and remove the overlay.
      const r = img.getBoundingClientRect(), s = $("#stage")!.getBoundingClientRect();
      const ov = el("img", "enrage-omega") as HTMLImageElement;
      ov.src = url;
      ov.style.left = r.left - s.left + "px"; ov.style.top = r.top - s.top + "px";
      ov.style.width = r.width + "px"; ov.style.height = r.height + "px";
      $("#stage")!.appendChild(ov);
      requestAnimationFrame(() => ov.classList.add("show"));
      setTimeout(() => { e.art = e.enrage!.omega; this.renderEnemies(!!this.selecting && this.selecting.kind !== "ally"); ov.remove(); }, 1100);
    } else {
      e.art = e.enrage!.omega;
    }
  },

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
      if (!this.active) return; // the fight may have ENDED while this turn-start status tick was in flight
      if (!e.alive) { this.onDeath(e); if (this.checkEnd()) return; this.endTurn(e); return; }
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
          this.strike(e, target, {}); // strike() logs who took how much
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
    if (u.alive) this.maybeEnrage(u); // DoT ticks can cross the 20% enrage threshold at turn start
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
    // Tear down any live turn UI: a player command menu (or target prompt) may have been painted by a
    // turn-start status tick that resolved just before this kill — leaving it up would strand the player
    // in a "finished" fight with no enemy to target (the reported stuck battle). Clear it authoritatively.
    this.current = null; this.selecting = null;
    const cmdList = $("#cmdList"); if (cmdList) cmdList.innerHTML = "";
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
      // victory drops: weapons match a party member's exact class 75% of the time (farmable upgrades),
      // 25% wild — see rollDrop. Pass the whole roster so any member's class can be the match.
      const roster = Game.party.map((p) => ({ cls: p.cls, att: p.att }));
      const drop = () => rollDrop(e, roster);
      const chance = e.boss || e.miniboss ? 1 : e.elite ? 1 : 0.4;
      if (Math.random() < chance) drops.push(drop());
      if (e.champion) drops.push(drop()); // a leader's hoard
      if (e.miniboss) drops.push(drop());
      if (e.boss) { drops.push(drop()); drops.push(drop()); }
      if (e.rare) { drops.push(drop()); drops.push(drop()); drops.push(drop()); } // treasure-monster hoard (epic+)
    }
    Game.gold += gold;
    const leveled = grantXp(Game.party, xp);
    if (leveled.length) Telemetry.levelup(leveled.length);
    drops.forEach((d) => { Game.inventory.push(d); Telemetry.drop(d.rarity); });
    const wasMini = this.enemies.some((e) => e.miniboss),
      wasZoneBoss = this.enemies.some((e) => e.boss),
      wasFinal = this.finalBoss;
    if (wasMini) { Game.miniBossDefeated = true; Field.onMiniDefeated(); } // open the mouth/gate (model-aware)
    // TRAVERSAL UNLOCK (Silverwood Overhaul, D2): clearing the Bandit Warren (the Kingpin, Greenvale's
    // zone boss) AWARDS the raft as a held quest item — and owning the raft confers the "gorge" capability
    // (Game.acquireItem → applyItemCaps), so the Sunless Gorge between Greenvale and Silverwood opens (its
    // crossing becomes passable). Gated on the SOURCE zone (greenvale) so only this boss grants it; later
    // barriers add their own item + grant point. Returns the def the first time → announced in the spoils.
    const gotItem = wasZoneBoss && Field.zone().id === "greenvale" ? Game.acquireItem("raft") : null;
    Game.continueAfterBattle = wasZoneBoss
      ? wasFinal
        ? () => Game.victory()
        : () => Game.afterZoneBoss() // post-boss flow (roam-first for Greenvale→Silverwood; hub chain elsewhere)
      : () => Screens.show("field");
    Game.saveNow(); // autosave after a battle resolves — XP/gold/loot/level all applied (ADR 0007)
    setTimeout(() => this.showSpoils(xp, gold, drops, leveled, wasFinal, gotItem), 500);
  },
  showSpoils(xp: number, gold: number, drops: Item[], leveled: LevelUp[], wasFinal: boolean, gotItem: HeldItemDef | null = null): void {
    let h = `<h2 class="title-gold">Victory</h2><p class="small">+${xp} XP · +◈ ${gold} Aether</p>`;
    // A held quest/key item picked up from this fight (e.g. the raft from the Kingpin) — a distinct callout
    // above the loot, since it goes to the Items tab, not the Bag.
    if (gotItem) h += `<div class="card" style="background:#161226;border-color:var(--gold);text-align:left">
      <div class="psec" style="margin:0 0 2px">Key Item</div>
      <b class="title-gold">${gotItem.icon} ${gotItem.name}</b>
      <div class="small" style="margin-top:4px">${gotItem.blurb}</div>
      <div class="small" style="opacity:.7;margin-top:4px">Kept in your Party → Items.</div></div>`;
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
    const ENV_BG: Record<string, string> = { plains: "plains", forest: "forest", desert: "desert", mountains: "mountains", mire: "swamp", hollow: "cave", warren: "warren", vault: "vault", granary: "vault",
      // Aurelion-complete dungeon/cave envs → closest existing enclosed backdrop until bespoke art lands.
      seacave: "cave", smuggden: "cave", crypt: "cave", stronghold: "vault", keepvault: "vault", citadel: "vault" };
    const fallback: Record<string, string> = {
      plains: "radial-gradient(130% 95% at 50% 22%, #34465a 0%, #131a26 50%, #06090f 100%)",
      forest: "radial-gradient(130% 95% at 50% 22%, #243a2a 0%, #0d1611 50%, #060a07 100%)",
      desert: "radial-gradient(130% 95% at 50% 22%, #4a3a22 0%, #1b1308 50%, #0a0704 100%)",
      mountains: "radial-gradient(130% 95% at 50% 22%, #2c3645 0%, #131722 50%, #070a0e 100%)",
      mire: "radial-gradient(130% 95% at 50% 22%, #1f3a36 0%, #0c1a18 50%, #050d0c 100%)",
      hollow: "radial-gradient(130% 95% at 50% 22%, #2a2440 0%, #120e22 50%, #07050e 100%)",
      warren: "radial-gradient(130% 95% at 50% 22%, #3a2a18 0%, #190f08 50%, #0a0604 100%)",
      vault: "radial-gradient(130% 95% at 50% 22%, #18283a 0%, #0a1420 50%, #050a0e 100%)",
    };
    const bg = $("#battleBg")!;
    const url = assetUrl(`backgrounds/${ENV_BG[this.env] || "plains"}.png`);
    if (url) {
      // boss fights get a heavier scrim + warm tint for drama. The gradient now darkens the lower
      // "ground" band hard (where the combatants stand) so sprites pop, plus a soft vignette — this
      // also disguises the upscaled-art softness (Dara's "low-res / lacks contrast" note).
      const top = this.isBoss ? "rgba(40,8,14,.5)" : "rgba(6,6,11,.26)";
      const bot = this.isBoss ? "rgba(6,3,5,.94)" : "rgba(5,5,9,.88)";
      const vignette = "radial-gradient(125% 80% at 50% 16%, transparent 42%, rgba(4,4,10,.5) 100%)";
      const scrim = `linear-gradient(180deg, ${top} 0%, transparent 34%, ${bot} 100%)`;
      bg.style.backgroundImage = `${vignette}, ${scrim}, url(${url})`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center 28%";
    } else {
      bg.style.background = this.isBoss
        ? "radial-gradient(120% 95% at 38% 34%, #4a1424 0%, #1a0810 52%, #070406 100%)"
        : fallback[this.env] || fallback.plains;
    }
  },
  renderAll(): void {
    this.renderEnemies(!!this.selecting && this.selecting.kind === "enemy");
    this.renderParty(); this.renderRoster(); this.renderLog(); this.renderChain();
  },
  // The affinity ring at the top of the field: 5 colored Attunement nodes joined by "beats →"
  // arrows in ring order (each beats the NEXT, wrapping back to SOL). Attunements actually present
  // in THIS fight (party + living enemies) are lit; absent ones are dimmed — so the player reads
  // which matchups are live. Pure presentation; redrawn with every battle render.
  renderChain(): void {
    const host = $("#affinityChain"); if (!host) return;
    const live = new Set([...Game.party, ...this.enemies].filter((u) => u.alive).map((u) => u.att));
    // 3-letter labels keep it legible at phone size + clear of the music button; the leading "beats"
    // tells the player the arrows mean prey-order (each node beats the next), not just sequence.
    const ABBR: Record<string, string> = { SOL: "SOL", NOX: "NOX", ANIMA: "ANI", QUANTA: "QUA", UMBRAXIS: "UMB" };
    host.innerHTML = '<span class="ac-beats">beats</span>' + RING.map((a) =>
      `<span class="ac-node${live.has(a) ? " live" : ""}" style="color:${ATT[a].color}" title="${a}">${ABBR[a]}</span>`
    ).join('<span class="ac-arrow">▸</span>') + '<span class="ac-arrow">↺</span>';
  },
  // RECONCILE in place rather than rebuilding (Dara's attack flicker): a full innerHTML wipe re-created
  // every sprite <img> on each re-render, flashing a blank frame at the start/end of the lunge. We keep
  // the .enemy node (and its sprite element) alive across renders — refreshing only the bar/name block
  // and the class flags — and rebuild a node ONLY when its sprite art actually changes (death keeps the
  // same art; enrage swaps to the omega). This also lets the CSS lunge animation run uninterrupted.
  renderEnemies(targetable: boolean): void {
    const z = $("#enemyZone")!;
    // A lone boss/mini-boss renders large + centered (Dara); with a pack it just scales up.
    const aliveN = this.enemies.filter((e) => e.alive).length;
    z.classList.toggle("has-boss", aliveN === 1 && this.enemies.some((e) => e.alive && (e.boss || e.miniboss)));
    const reuse = z.children.length === this.enemies.length;
    this.enemies.forEach((e, i) => {
      const rank = e.boss ? " boss" : e.miniboss ? " miniboss" : "";
      const cls = "enemy" + (e.alive ? "" : " dead") + rank + (e.rare ? " rare" : e.champion ? " champion" : e.elite ? " elite" : "") + (targetable && e.alive ? " targetable" : "") + (e.acting ? " acting" : "") + (e.enraged ? " enraged" : "");
      const art = e.art || e.key;
      const bar = `<div class="ebar">
        <div class="ename">${e.rare ? "✦ RARE " : e.champion ? "★ Champion " : ""}${e.name} <span class="att-tag" style="color:${ATT[e.att].color}">◆${e.att}</span>${e.eliteAffixes ? ` <span class="badge ${e.champion ? "champ" : "atkup"}">${e.eliteAffixes.join(" ")}</span>` : ""}${statusBadges(e)}</div>
        <div class="bar hp"><i style="width:${pct(e.hp, e.maxhp)}%"></i><span class="bartxt">${Math.max(0, e.hp)}/${e.maxhp}</span></div>
        <div class="bar atb"><i style="width:${e.atb}%"></i></div></div>`;
      const cur = reuse ? (z.children[i] as HTMLElement) : null;
      if (cur && cur.dataset.art === art) {
        // same creature, same art → keep the sprite, refresh only flags + the bar block.
        if (cur.className !== cls) cur.className = cls;
        const ebar = cur.querySelector(".ebar");
        if (ebar) ebar.outerHTML = bar;
        cur.onclick = targetable && e.alive ? () => this.targetClicked(e) : null;
      } else {
        const d = el("div", cls);
        d.dataset.art = art;
        d.innerHTML = `${enemySprite(e)}${bar}`;
        if (targetable && e.alive) d.onclick = () => this.targetClicked(e);
        if (cur) z.replaceChild(d, cur); else z.appendChild(d);
      }
    });
    while (z.children.length > this.enemies.length) z.lastChild!.remove();
  },
  renderParty(): void {
    const z = $("#partyZone")!;
    // Two-column formation: front line nearer the enemies (left), back line behind (right). Built once;
    // thereafter we reconcile each .pchar in place so the paper-doll <img> survives (no attack flicker)
    // — rebuilding a hero's sprite only when they fall (doll → 💤) or revive.
    let front = z.querySelector<HTMLElement>(".pcol.front");
    let back = z.querySelector<HTMLElement>(".pcol.back");
    if (!front || !back) {
      z.innerHTML = "";
      front = el("div", "pcol front"); back = el("div", "pcol back");
      front.innerHTML = `<div class="pcol-cap">Front</div>`;
      back.innerHTML = `<div class="pcol-cap">Back</div>`;
      z.appendChild(front); z.appendChild(back);
    }
    Game.party.forEach((m) => {
      const col = m.row === "back" ? back! : front!;
      const cls = "pchar" + (m.alive ? "" : " downed") + (m.acting ? " acting" : "") + (m._hurt ? " hurt" : "");
      const cur = z.querySelector<HTMLElement>(`.pchar[data-mid="${m.id}"]`);
      if (cur && cur.dataset.alive === String(m.alive)) {
        // same alive-state → keep the doll, refresh only flags + the status-badge strip.
        if (cur.className !== cls) cur.className = cls;
        const ename = cur.querySelector<HTMLElement>(".ename");
        if (ename) { ename.style.color = m.alive ? ATT[m.att].color : "#666"; ename.innerHTML = statusBadges(m); }
        if (cur.parentElement !== col) col.appendChild(cur); // row change (only outside battle)
      } else {
        const spr = m.alive ? renderDoll(m) : '<div class="spr">💤</div>';
        const d = el("div", cls);
        d.dataset.mid = m.id; d.dataset.alive = String(m.alive);
        // Names live in the lower roster panel only; up here we keep just status badges next to the sprite.
        d.innerHTML = `<div style="text-align:right"><div class="ename" style="color:${m.alive ? ATT[m.att].color : "#666"}">${statusBadges(m)}</div></div>${spr}`;
        if (cur) cur.replaceWith(d); else col.appendChild(d);
      }
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
  // Display order for the lower roster panel (Dara's preferred ordering). Members not listed keep
  // their party order, after the named ones. Cosmetic only — does not touch Game.party / combat.
  rosterOrder(): Member[] {
    const ORDER = ["Auren", "Sephi", "Kaela", "Liora", "Rion"];
    const rank = (m: Member) => { const i = ORDER.indexOf(m.name); return i < 0 ? ORDER.length + Game.party.indexOf(m) : i; };
    return [...Game.party].sort((a, b) => rank(a) - rank(b));
  },
  renderRoster(barsOnly?: boolean): void {
    const p = $("#rosterPanel")!;
    if (!barsOnly || p.children.length !== Game.party.length) {
      p.innerHTML = "";
      this.rosterOrder().forEach((m) => {
        const row = el("div", "prow" + (m === this.current ? " turn" : "") + (m.alive ? "" : " downed"));
        row.dataset.id = m.id;
        row.innerHTML = `<div class="pn" style="color:${m.alive ? ATT[m.att].color : "#666"}">${m.name}${statusBadges(m)}</div>
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
  // The battle log lives in the right column of the lower window: a scrollable history (capped),
  // newest at the bottom (Dara).
  log(t: string): void { this.logLines.push(t); if (this.logLines.length > 200) this.logLines.shift(); this.renderLog(); },
  renderLog(): void {
    const l = $("#log"); if (!l) return;
    l.innerHTML = this.logLines.map((x) => `<div>${x}</div>`).join("");
    l.scrollTop = l.scrollHeight; // auto-scroll to the latest
  },

  /* ---- battle-screen feedback helpers ---- */
  // Toggle the lunge/hurt animation classes IN PLACE rather than via a full renderAll — rebuilding
  // the zone re-creates the sprite <img>s and flashed a blank frame at the start/end of each attack
  // (Dara's flicker). Sprites also carry decoding="sync" so any genuine rebuild paints flash-free.
  markActing(u: Unit): void {
    u.acting = true;
    const n = this.unitNode(u) as HTMLElement | null | undefined;
    if (n) n.classList.add("acting"); else this.renderAll();
  },
  markHurt(u: Unit): void {
    u._hurt = true;
    const n = this.unitNode(u) as HTMLElement | null | undefined;
    if (n) n.classList.add("hurt"); else this.renderAll();
    setTimeout(() => { u._hurt = false; const n2 = this.unitNode(u) as HTMLElement | null | undefined; if (n2) n2.classList.remove("hurt"); }, 260);
  },
  // The DOM node for a unit, and the SPRITE element within it (enemies: the .spr-img; party: the doll).
  unitNode(u: Unit): Element | null | undefined {
    if (u.side === "enemy") { const i = (this.enemies as Unit[]).indexOf(u); return $("#enemyZone")!.children[i]; }
    return $(`#partyZone .pchar[data-mid="${(u as Member).id}"]`);
  },
  spriteEl(u: Unit): Element | null | undefined {
    const node = this.unitNode(u);
    return node ? (node.querySelector(".spr-img") || node.querySelector("img") || node) : node;
  },
  float(u: Unit, txt: string, color: string): void {
    const anchor = this.spriteEl(u); // damage/heal number floats above the SPRITE (Dara: not the HP bar)
    if (!anchor) return;
    const f = el("div", "float", txt); f.style.color = color || "#fff";
    const r = anchor.getBoundingClientRect(), s = $("#stage")!.getBoundingClientRect();
    f.style.left = r.left - s.left + r.width / 2 + "px";
    f.style.top = r.top - s.top + "px";
    $("#stage")!.appendChild(f);
    setTimeout(() => f.remove(), 1000);
  },
  // Universal mana-slash hit effect on the struck unit, tinted to the attacker's Attunement. Crit makes
  // it bigger/glowier with a camera shake; mirror flips it for a hero→enemy hit. Delegates to
  // ui/skillAnimator.playSlash (pooled) — no-op if the stage/sprite aren't in the DOM or the art is absent.
  slashFx(u: Unit, att: Unit["att"], crit: boolean, mirror: boolean): void {
    const stage = $("#stage"), anchor = this.spriteEl(u);
    if (stage && anchor) playSlash(stage, anchor, att, { crit, mirror });
  },
};
