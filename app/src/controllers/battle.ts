// ATB battle engine + battle-screen rendering. Orchestration layer: drives the gauge loop,
// player/enemy turns, and damage resolution by calling the pure combat systems, then paints
// the DOM. Pure math (combatDamage, makeEnemy, status helpers) lives in ../systems/combat.

import type { CombatAct, Enemy, Item, Member, Skill, StatusMap, Unit } from "../types";
import type { HeldItemDef } from "../data/heldItems";
import { $, el } from "../core/dom";
import { cap, ri, pick } from "../core/rng";
import { SKILLS } from "../data/skills";
import { combatDamage, damage, heal, makeEnemy, stunImmune } from "../systems/combat";
import { applyStatus, tickStatus, cleanse, hasStatus, resolveApply } from "../systems/status";
import { STATUS } from "../data/status";
import { gain, spend, carryPools, turnGain } from "../systems/resources";
import { autoGenFor } from "../systems/classKit";
import { RESOURCE } from "../data/resources";
import { ATT, RING } from "../data/attunements";
import { classTitle } from "../data/classes";
import { ENEMY_ABILITIES } from "../systems/enemyAbilities";
import { ENEMY_SCRIPTS, newScriptState, scriptedTurn, type ScriptState, type ScriptStep } from "../systems/bossScripts";
import { recalc, grantXp, skillUnlocked, mnaBonus, type LevelUp } from "../systems/progression";
import { rollDrop } from "../systems/loot";
import { enemySprite, renderDoll, statusBadges, pct, itemHtml } from "../ui/render";
import { playSkillAnim, playSlash, playCast, playHeal } from "../ui/skillAnimator";
import { SKILL_ANIM, BASIC_ATTACK_ANIM, type SkillAnim } from "../data/skillAnimations";
import { ULTIMATES, type Ultimate } from "../data/ultimates";
import { playCutscene } from "../ui/cutscene";
import { assetUrl, preloadVideoUrl, videoUrlSync } from "../core/assets";
import { Overlay } from "../ui/overlay";
import { Music } from "../audio/music";
import { Telemetry } from "../telemetry/telemetry";
import { BattleLog } from "../telemetry/battleLog";
import { gearScore } from "../systems/gearScore";
import { noteKills } from "../systems/quests";
import { QUESTS } from "../data/quests";
import { rollBattleMaterials, rollBattleConsumables, addCounts, type Counts } from "../systems/crafting";
import { MATERIALS } from "../data/materials";
import { CONSUMABLES } from "../data/consumables";
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
  STATUS_NAMES: { burn: "Burn", poison: "Infestation", decay: "Stasis", drain: "Drain", stun: "Stun", blind: "Blind", atkup: "+ATK", regen: "Regen", barrier: "Ward", doom: "Doom", chill: "Chill", frozen: "Frozen" } as Record<string, string>,
  DOT_COLOR: { burn: "#ffb27a", poison: "#aef0a0", decay: "#7ad0c0", drain: "#c4a7ff" } as Record<string, string>,
  _unlockT: undefined as ReturnType<typeof setTimeout> | undefined,
  // damage numbers held back during an animated skill, flushed when the hit lands (see animatedStrike).
  // `univ` = also play the universal mana-slash here (skills with their OWN bespoke impact layer set it
  // false so the two don't stack); `mirror` flips the slash for a hero→enemy hit (see strike).
  _animFloats: [] as { u: Unit; txt: string; color: string; crit: boolean; att: Unit["att"]; univ: boolean; mirror: boolean }[],
  _animHasImpact: false,   // true while resolving an animatedStrike whose anim supplies its own impact
  _enter: false,           // true for the first ~1s of a battle: nodes built now get the .enter sweep-in
  // BATTLE ATMOSPHERE (#battleFx canvas): per-environment weather so the arena is never static —
  // wind-streaks + pollen on open ground, drifting leaves in forest, rain in the mire, rising embers
  // underground — plus GLINTS that sparkle across the backdrop's water band where the painted bg has
  // water. Self-stopping RAF loop (pauses when the battle screen hides); reduced-motion skips it.
  _fxRaf: 0,
  _fxLast: 0,
  _fxParts: [] as { x: number; y: number; vx: number; vy: number; r: number; p: number; life: number }[],
  _fxStyle: "",
  // Lane palette for ability-announcement bubbles (matches the class picker's lane colors). A skill
  // with a pick lane tints its bubble by lane; an un-laned skill by the hero's Attunement; basics
  // (Attack/Defend) stay warm-neutral.
  LANE_COLOR: { A: "#f4b942", B: "#ef7a4a", C: "#5fc6d6" } as Record<string, string>,
  LANE_NEUTRAL: "#ffd877",
  // Scripted-dialogue queue (sayLine) — lines called in quick succession play one after another.
  _sayQ: [] as { speaker: string; text: string; color?: string; holdMs?: number; done: () => void }[],
  _saying: false,
  // Per-action stage-animation hook: an acting combatant carries BOTH .acting and an act-<action>
  // class from ACTION_ANIM, so the choreography (the dash keyframes today, sprite-sheet frames
  // tomorrow) binds to the ACTION, not a hardcoded keyframe name. A new action slots in as a map
  // entry + CSS; _actAnim lets the reconcile-in-place renderers re-apply the class across re-renders.
  ACTION_ANIM: { strike: "act-strike", cast: "act-cast", guard: "act-guard" } as Record<string, string>,
  _actAnim: new WeakMap<Unit, string>(),
  // SCRIPTED BOSS TURNS (wave6c — systems/bossScripts): per-enemy sequencing state, keyed by the live
  // Enemy object. makeEnemy builds fresh objects every fight, so a new battle always starts a fresh
  // script — nothing to reset in begin().
  _scripts: new WeakMap<Enemy, ScriptState>(),

  begin(enemyKeys: string[], env: string, isBoss: boolean, finalBoss: boolean, depth: number, champIdx = -1, zoneId = "", eliteChance = 0.22): void {
    // FF-style encounter transition: white shock-flashes over the field, iris to black while the screen
    // swaps beneath (everything below runs synchronously under the cover), iris-open onto the battle.
    // Pure overlay — combat timing untouched; reduced-motion collapses it to an instant cut.
    const sw = $("#battleSwirl");
    if (sw) { sw.classList.remove("go"); void sw.offsetWidth; sw.classList.add("go"); setTimeout(() => sw.classList.remove("go"), 860); }
    this._enter = true; setTimeout(() => { this._enter = false; }, 1000); // entrance-sweep window
    this.active = true; this.isBoss = !!isBoss; this.finalBoss = !!finalBoss; this.env = env || "plains";
    const dp = depth || 0;
    this.enemies = enemyKeys.map((k, i) => makeEnemy(k, i, isBoss, dp, i === champIdx, Math.random, eliteChance));
    if (this.enemies.some((e) => e.elite)) Telemetry.noteElite();
    Telemetry.encounterStart(enemyKeys, env || "plains", !!isBoss);
    Music.play(isBoss ? Music.forBoss(zoneId) : "battle"); Music._renderStyleLabels();
    // per-battle status starts clean; a carried dungeon "regen" reprieve (ADR 0010) seeds in AFTER the wipe
    // (and is spent), so a regen rest node heals gradually across THIS fight rather than instantly at the node.
    Game.party.forEach((m) => { m.atb = ri(0, 40); m.statuses = []; m.cooldowns = {}; if (m.pendingRegen) { applyStatus(m.statuses, "regen", { turns: m.pendingRegen }); m.pendingRegen = 0; } m.side = "party"; m.guarding = false; m.acted = false; m.acting = false; m._hurt = false; });
    this.enemies.forEach((e) => { e.atb = ri(0, 30); });
    carryPools(Game.resources); // pools age by personality (or reset if not persistent) at fight start (ADR 0019)
    // Test Loop (ADR 0017): open a per-action BattleLog fight context. `enabled` mirrors testMode (the
    // authority); the ctx build is gated so real play does literally nothing (no gearScore/alloc cost).
    BattleLog.enabled = Game.testMode;
    if (Game.testMode) BattleLog.startFight({
      enemies: this.enemies.map((e) => ({ key: e.key, lvl: e.lvl, att: e.att, elite: e.elite, champion: e.champion })),
      party: Game.party.map((m) => ({ name: m.name, cls: m.cls, att: m.att, level: m.level, gearScore: gearScore(m).overall })),
      isBoss: this.isBoss, depth: dp, env: this.env,
    });
    this.awaiting = false; this.current = null; this.logLines = [];
    this._sayQ.length = 0; // stale scripted lines never carry into a new fight (in-flight one self-cleans)
    document.querySelectorAll("#battleField .abubble, #battleField .say-line").forEach((n) => n.remove());
    Screens.show("battle");
    this.renderBg(); this.renderAll();
    this.ensureFx();
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
  // Battle System 2.0: abilities are gated by a per-skill cooldown (substitute for MP). 2 turns for now.
  ABILITY_CD: 2,
  tickCooldowns(m: Member): void {
    const cd = m.cooldowns; if (!cd) return;
    for (const k in cd) if (cd[k] > 0) cd[k]--;
  },
  startPlayerTurn(m: Member): void {
    this.awaiting = true; this.current = m; this.selecting = null;
    this.tickCooldowns(m); // count down this hero's ability cooldowns at the start of their turn
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
    $("#cmdWho")!.textContent = `${m.name}  ·  ${classTitle(m.att, m.cls, m.mna[m.att])}`;
    const list = $("#cmdList")!; list.innerHTML = "";
    const mk = (label: string, cost: number, fn: () => void, dis?: boolean) => {
      const b = el("button", "cmd", `${label}${cost ? `<span class="cost">${cost} MP</span>` : ""}`) as HTMLButtonElement;
      if (dis) b.disabled = true; else b.onclick = fn;
      list.appendChild(b);
    };
    mk("Attack", 0, () => this.chooseTarget(m, { type: "attack" }));
    // V3 (ADR 0020): the Skill menu only appears once the hero has usable picked abilities — an un-built
    // hero (no picks, or all dormant at low MNA) just has Attack/Defend until they pick abilities in their
    // lanes (the class picker). No empty "Skill ▸" menu to tap into.
    const knownKeys = m.skills.filter((k) => SKILLS[k] && skillUnlocked(m, SKILLS[k]));
    if (knownKeys.length) { const skBtn = el("button", "cmd", "Skill ▸"); skBtn.onclick = () => this.showSkills(m, knownKeys); list.appendChild(skBtn); }
    // Ultimate: a per-class signature super (its own button, between Skill and Defend). Only shown for
    // members who have one (e.g. the Photon Vanguard's Orbital Cannon).
    const ult = ULTIMATES[`${m.att}:${m.cls}`];
    if (ult) { const uBtn = el("button", "cmd", "Ultimate ▸"); uBtn.onclick = () => this.showUltimate(m, ult); list.appendChild(uBtn); }
    mk("Defend", 0, () => { m.guarding = true; this.announce(m, "Defend", this.LANE_NEUTRAL, 900); this.log(`${m.name} braces.`); this.endTurn(m); });
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
  showSkills(m: Member, keys: string[]): void {
    this.setCmdWide(true); // give descriptions room to breathe
    const list = $("#cmdList")!; list.innerHTML = "";
    const back = el("button", "cmd", "◂ Back"); back.onclick = () => { this.setCmdWide(false); this.showCommands(m); }; list.appendChild(back);
    const cds = (m.cooldowns ||= {});
    keys.forEach((key) => {
      const s = SKILLS[key]; if (!s) return;
      const cd = cds[key] || 0, offCd = cd <= 0; // Battle 2.0: cooldown-gated (no MP cost)
      // V3 (ADR 0019): signatures/ultimates COST the Attunement's shared pool — gate the button on it too.
      // Gate on the SAME amount spend() will actually debit (clamped by the per-action spendCap, D8), so a
      // future cost above the cap can't require more than it takes.
      const afford = !s.resourceCost || Game.resources[m.att] >= Math.min(s.resourceCost, RESOURCE.spendCap);
      const ready = offCd && afford;
      // Resource delta badge: −cost (sig/ult) or +gen (special); the pool fuel the whole party shares.
      const rTag = s.resourceCost ? ` <span class="cost${afford ? "" : " low"}">−${s.resourceCost} ${m.att}</span>`
        : s.resourceGen ? ` <span class="cost">+${s.resourceGen} ${m.att}</span>` : "";
      const cdTag = `<span class="cost${offCd ? "" : " low"}">${offCd ? "Ready" : `CD ${cd}`}</span>`;
      const b = el("button", "cmd", `${s.name}${cdTag}${rTag}<div class="small" style="font-size:11px;opacity:.82;line-height:1.2;margin-top:3px;white-space:normal">${s.desc}</div>`) as HTMLButtonElement;
      if (!ready) b.disabled = true;
      else b.onclick = () => { this.setCmdWide(false); cds[key] = s.cd && s.cd > 0 ? s.cd : this.ABILITY_CD; this.useSkill(m, s); };
      list.appendChild(b);
    });
    if (keys.length === 0) list.appendChild(el("div", "small", "No abilities unlocked yet — raise MNA in the Party screen."));
  },
  setCmdWide(on: boolean): void { $("#cmdPanel")?.classList.toggle("cmd-wide", on); },
  // Ultimate submenu: a single big button for the class's signature super.
  showUltimate(m: Member, ult: Ultimate): void {
    if (ult.cutscene) void preloadVideoUrl(ult.cutscene); // warm the lazy video URL before the player fires
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
    spend(Game.resources, m.att, RESOURCE.ultSpend); // legacy cutscene ultimate spends a flat pool amount (V3 ults are Skills with their own cost band, spent in resolveNow)
    if (ult.mp) m.mp = Math.max(0, m.mp - ult.mp);
    const list = $("#cmdList"); if (list) list.innerHTML = "";
    $("#cmdWho")!.textContent = `${m.name} — ${ult.name}!`;
    this.announce(m, `★ ${ult.name}`, this.LANE_NEUTRAL, 1400);
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
    if (!ult.cutscene) { apply(); return; }
    // Prefer the URL warmed in showUltimate so play() stays in the click gesture (unmuted audio);
    // if it isn't cached yet, resolve the lazy video chunk first (cutscene falls back to muted).
    const url = videoUrlSync(ult.cutscene);
    if (url) playCutscene(url, apply);
    else preloadVideoUrl(ult.cutscene).then((u) => (u ? playCutscene(u, apply) : apply()));
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
  // A hero ABILITY (skill) plays a cast VFX for ~1-1.5s (hero idles), then resolves: a HEAL ability shows
  // a HEALING circle under each target (caster's Attunement); any other ability shows a mana CASTING
  // CIRCLE under the caster. Basic attacks, enemy actions, and ultimates skip this (they resolve at once
  // / have their own flow). Falls back to instant resolve if the stage/sprite aren't in the DOM.
  resolve(actor: Unit, targets: Unit[], act: CombatAct): void {
    this.selecting = null;
    const s = act.skill;
    // ANNOUNCE: a hero action names itself in a bubble over the party side as its choreography
    // starts — lane-tinted where the ability declares a pick lane, Attunement-tinted otherwise,
    // warm-neutral for a basic Attack. Held longer for a cast (~1.5s circle) than an instant strike.
    if (actor.side === "party") {
      const color = s ? (s.lane && this.LANE_COLOR[s.lane]) || ATT[actor.att].color : this.LANE_NEUTRAL;
      this.announce(actor, s ? s.name : "Attack", color, s ? 1500 : 1000);
    }
    if (actor.side === "party" && s) {
      const field = $("#battleField");
      if (field) {
        this.awaiting = true; this.current = actor;
        const list = $("#cmdList"); if (list) list.innerHTML = "";
        $("#cmdWho")!.textContent = `${actor.name} casts ${s.name}…`;
        this.lockInput(99999); // hold input through the cast; cleared when the next menu opens
        const att = s.sol ? "SOL" : actor.att;
        const done = () => this.resolveNow(actor, targets, act);
        if (s.type === "heal") {
          // healing circle under EACH recipient; resolve (heal numbers) at the end of the animation
          const els = targets.map((t) => this.spriteEl(t)).filter(Boolean) as Element[];
          if (els.length) { els.forEach((el, i) => playHeal(field, el, att, i === 0 ? done : undefined)); return; }
        } else {
          const cel = this.spriteEl(actor);
          if (cel) { playCast(field, cel, att, done); return; }
        }
      }
    }
    this.resolveNow(actor, targets, act);
  },
  resolveNow(actor: Unit, targets: Unit[], act: CombatAct): void {
    const s = act.skill;
    // Battle System 2.0: abilities no longer cost MP — they're gated by cooldown (set in showSkills).
    // V3 (ADR 0019): a costing ability (signature/ultimate) debits its Attunement's shared pool at the
    // moment it resolves (one-way; the affordability was gated in showSkills, re-checked here implicitly
    // by `spend`). Generating abilities (specials/auto) credit the pool at turn end — see endTurn.
    if (actor.side === "party" && s?.resourceCost) spend(Game.resources, actor.att, s.resourceCost);

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
      const hld = 1 + (actor.sub?.Hld ?? 0) / 100; // V3 Healing Done amplifies all healing the caster does
      targets.forEach((t) => { const amt = Math.round((actor.mag * (s.power ?? 0) + 6) * (1 + mnaBonus(actor.mna?.ANIMA ?? 0)) * hld); const hpBefore = t.hp; heal(t, amt); this.float(t, `+${amt}`, "#aef0a0"); const stN = s.status ? this.applySkillStatuses(actor, t, s.status) : []; this.log(`${actor.name}'s ${s.name} heals ${t.name} for ${amt}`); BattleLog.action({ side: actor.side, actor: actor.name, ability: s.name, target: t.name, dmg: -amt, affinityMult: 1, crit: false, status: stN.length ? stN.join(", ") : undefined, hpBefore, hpAfter: t.hp }); });
    } else if (s && s.type === "buff") {
      const applied: string[] = [];
      if (s.buff?.def) applied.push("Guard");
      if (s.buff?.atkup) applied.push("+ATK");
      if (s.buff?.wardArmor) applied.push("Ward");
      targets.forEach((t) => {
        if (s.buff?.def) t.guarding = true;
        if (s.buff?.atkup) applyStatus(t.statuses, "atkup", { turns: s.buff.turns ?? 0 });
        if (s.buff?.wardArmor) { applyStatus(t.statuses, "barrier", { turns: s.buff.turns ?? 0 }); t.wardAmt = s.buff.wardArmor; }
        BattleLog.action({ side: actor.side, actor: actor.name, ability: s.name, target: t.name, dmg: 0, affinityMult: 1, crit: false, status: applied.length ? applied.join(", ") : undefined, hpBefore: t.hp, hpAfter: t.hp });
      });
      const who = targets.length > 1 ? "the party" : targets[0]?.name ?? actor.name;
      this.log(`${actor.name}'s ${s.name}${applied.length ? ` grants ${applied.join(", ")} to ${who}` : ""}`);
    } else if (s && s.type === "util" && s.cleanse) {
      targets.forEach((t) => { cleanse(t.statuses); this.float(t, "cleansed", "#9cd1ff"); });
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
    setTimeout(() => this.afterAction(actor, act), 360);
  },

  // Run a skill's layered animation, then resolve the hit on its damage frame and float the number
  // when the blast lands. Falls back to an instant strike if the stage/sprites aren't in the DOM.
  animatedStrike(actor: Unit, target: Unit, act: CombatAct, anim: SkillAnim): void {
    const stage = $("#stage");
    const aEl = this.spriteEl(actor), tEl = this.spriteEl(target);
    if (!stage || !aEl || !tEl) {
      const hits = act.skill?.hits || 1;
      for (let h = 0; h < hits; h++) { if (target.alive) this.strike(actor, target, act); }
      recalc(Game.party); this.renderAll(); setTimeout(() => this.afterAction(actor, act), 360); return;
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
      onComplete: () => this.afterAction(actor, act),
    });
  },
  flushAnimFloats(): void {
    this._animFloats.forEach((f) => { this.float(f.u, f.txt, f.color, f.crit); if (f.univ) this.slashFx(f.u, f.att, f.crit, f.mirror); });
    this._animFloats = [];
  },

  strike(actor: Unit, target: Unit, act: CombatAct, silent = false): void {
    const s = act.skill;
    const abilityName = s ? s.name : "Attack"; // for the Test Loop BattleLog
    const r = combatDamage(actor, target, act);
    if (r.miss) {
      if (silent) this._animFloats.push({ u: target, txt: "miss", color: "#bbb", crit: false, att: actor.att, univ: false, mirror: false });
      else this.float(target, "miss", "#bbb");
      this.log(`${actor.name} misses ${target.name}.`);
      BattleLog.action({ side: actor.side, actor: actor.name, ability: abilityName, target: target.name, dmg: 0, affinityMult: 1, crit: false, hpBefore: target.hp, hpAfter: target.hp });
      return;
    }
    const { crit, mult } = r;
    let dmg = r.dmg;
    if (actor.side === "enemy" && (actor as Enemy).enraged) dmg = Math.round(dmg * 2); // enrage: double damage
    const hpBefore = target.hp; // Test Loop BattleLog: capture HP across the hit
    damage(target, dmg);
    Telemetry.dmg(actor.side, dmg, crit, mult);
    const txt = (crit ? "✦" : "") + dmg, color = mult > 1 ? "#ffd97a" : mult < 1 ? "#9aa" : "#fff";
    const fxAtt = s && s.sol ? "SOL" : actor.att;
    // Mana-slash hit effect on the struck unit, coloured by the power's Attunement (mirrored for a
    // hero→enemy hit). Unless the skill's own animation supplies a bespoke impact layer, which overrides it.
    const mirror = actor.side === "party";
    if (silent) this._animFloats.push({ u: target, txt, color, crit, att: fxAtt, univ: !this._animHasImpact, mirror }); // deferred to impact
    else { this.float(target, txt, color, crit); this.slashFx(target, fxAtt, crit, mirror); }
    // FULL combat log line: who hit whom for how much (both directions) — the scrollable history.
    const power = s && s.sol ? "SOL" : actor.att;
    const tag = crit ? " — CRIT!" : mult > 1 ? ` (${power} surge)` : mult < 1 ? " (resisted)" : "";
    this.log(`${s ? `${actor.name}'s ${s.name}` : actor.name} hits ${target.name} for ${dmg}${tag}`);
    if (actor.leech) { const h = Math.round((dmg * actor.leech) / 100); if (h > 0) heal(actor, h); }
    const applied: string[] = [];
    if (s && s.status) {
      const names = this.applySkillStatuses(actor, target, s.status);
      applied.push(...names);
      if (names.length) this.log(`${target.name} is afflicted with ${names.join(", ")}`);
    }
    if (actor.bonusBurn) { applyStatus(target.statuses, "burn", { turns: 2, source: (actor as Member).id }); applied.push("Burn"); this.log(`${target.name} is afflicted with Burn`); }
    if (actor.onHitPoison) { applyStatus(target.statuses, "poison", { turns: actor.onHitPoison, source: (actor as Member).id }); applied.push("Infestation"); this.log(`${target.name} is afflicted with Infestation`); }
    BattleLog.action({ side: actor.side, actor: actor.name, ability: abilityName, target: target.name, dmg, affinityMult: mult, crit, status: applied.length ? applied.join(", ") : undefined, hpBefore, hpAfter: target.hp });
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

  afterAction(actor: Unit, act?: CombatAct): void { if (this.checkEnd()) return; this.endTurn(actor, act); },
  endTurn(actor: Unit, act?: CombatAct): void {
    // A party action feeds its Attunement's shared pool (ADR 0019). V3 per-ability bands (one-way): a
    // generating special credits its `resourceGen`, a basic Attack/Defend the class's auto trickle; a
    // costing signature/ultimate generated nothing here (it spent at resolution). A legacy hand-authored
    // skill credits the flat genSpecial. For classes not yet re-encoded `autoGenFor` is null → the legacy
    // flat trickle, so their economy is unchanged. (The two legacy CUTSCENE ultimates — Photon Vanguard /
    // Lagrangian, fireUltimate — are the one exception that both spends and trickles: a showcase pre-dating
    // the V3 cost bands, behavior intentionally preserved until they're re-encoded as V3 ult Skills.)
    if (actor.side === "party") {
      const m = actor as Member;
      const autoGen = autoGenFor(m.att, m.cls) ?? RESOURCE.genSpecial;
      gain(Game.resources, m.att, turnGain(act?.skill, autoGen, RESOURCE.genSpecial));
    }
    actor.atb = 0; actor.acting = false; this._actAnim.delete(actor);
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
      // SCRIPTED TURNS (wave6c): a setpiece boss with an authored script (systems/bossScripts) plays
      // its step INSTEAD of the free AI — the dialogue line lands first (the ATB is already held),
      // then the step's action resolves. Turns the script returns null for fall through to the
      // normal AI below. Pure sequencing (scriptedTurn) so the choreography is unit-testable.
      const script = ENEMY_SCRIPTS[e.key];
      if (script) {
        let st = this._scripts.get(e);
        if (!st) { st = newScriptState(); this._scripts.set(e, st); }
        const step = scriptedTurn(script, st);
        if (step) { this.runScriptStep(e, step); return; }
      }
      // Each enemy action names itself in a bubble anchored over the sprite (its HP/ATB block fades
      // out for the turn — `.enemy.acting .ebar`). The kit is simplistic today ("Attack" for a plain
      // hit), but named casts announce their skill: an ability's own display `name` when it declares
      // one, else its capitalized key ("hex" → "Hex").
      let used = false;
      if (e.skills && e.skills.length && Math.random() < e.castChance) {
        const key = pick(e.skills), ab = ENEMY_ABILITIES[key];
        if (ab) {
          used = ab.use(e, this);
          if (used) this.announce(e, (ab as { name?: string }).name ?? cap(key), ATT[e.att].color, 800);
        }
      }
      if (!used) {
        let target: Member;
        const pool = this.reachable(e); // front line shields the back row
        const taunter = party.find((p) => hasStatus(p.statuses, "barrier") && p.role === "Tank");
        if (e.ai === "boss") target = Math.random() < 0.5 ? pool.slice().sort((a, b) => a.hp - b.hp)[0] : pick(pool);
        else target = pick(pool);
        if (taunter && Math.random() < 0.5) target = taunter;
        if (e.boss && Math.random() < 0.2) {
          this.announce(e, "Wild Swing", ATT[e.att].color, 800);
          this.log(`${e.name} unleashes a wild swing!`);
          party.forEach((t) => this.strike(e, t, { aoe: true }));
        } else {
          this.announce(e, "Attack", ATT[e.att].color, 800);
          this.strike(e, target, {}); // strike() logs who took how much
        }
      }
      recalc(Game.party);
      this.renderAll();
      setTimeout(() => { if (!this.checkEnd()) this.endTurn(e); }, 380);
    });
  },

  /* ---- SCRIPTED BOSS TURNS (wave6c — the sequencing is pure systems/bossScripts; this is the
     presentation half): play the step's dialogue line, then resolve its action. "hold" spends the
     turn without attacking (the machine boots/aims); "nuke" fires VAULT PURGE PROTOCOL. ---- */
  runScriptStep(e: Enemy, step: ScriptStep): void {
    const act = () => {
      if (!this.active) return; // the fight ended while the line played (e.g. a DoT finished it)
      if (step.act === "nuke") { this.vaultPurge(e); return; }
      // hold: no attack — the dread beat between the lines.
      this.log(`${e.name} hums — dormant systems wake, one by one.`);
      this.renderAll();
      setTimeout(() => { if (!this.checkEnd()) this.endTurn(e); }, 420);
    };
    if (step.say) void this.sayLine(step.say.speaker, step.say.text, { color: step.say.color }).then(act);
    else act();
  },
  // VAULT PURGE PROTOCOL — the Platform's signature: a full-party annihilation beam. An ENERGY hit
  // (ignores physical armor; answered only by Energy Reduction / guard / wards — the far-endgame
  // mitigation the spec demands), resolved through the normal strike() pipeline so floats, wards,
  // BattleLog and the wipe flow all behave. POWER CALIBRATION: the Platform's L35 abp amplifier is
  // ~×8.4 (V3 primaries-as-gear), so effective per-hit ≈ atk(≈118) × 0.65 × 8.4 (+crit/jitter)
  // ≈ ~760 — ~2–3× a geared L10–12 hero's max HP, and above its own Wild Swing (so the signature
  // dominates): a guaranteed wipe today, survivable only with far-endgame HP/mitigation/shields.
  // Re-check this calibration if the enemy abp curve or the Platform's lean is ever retuned.
  VAULT_PURGE: {
    name: "Vault Purge Protocol", mp: 0, target: "allEnemies", att: "QUANTA", mnaReq: 0,
    type: "phys", dmgType: "energy", power: 0.65,
    desc: "The vault's judgement — a sweeping annihilation beam across the whole party.",
  } as Skill,
  vaultPurge(e: Enemy): void {
    this.announce(e, "★ Vault Purge Protocol", "#7ae0ff", 1600);
    this.log(`⚠ ${e.name} executes VAULT PURGE PROTOCOL!`);
    const field = $("#battleField");
    const fire = () => {
      if (!this.active) return;
      this.laserSweep();
      this.livingParty().forEach((m) => this.strike(e, m, { skill: this.VAULT_PURGE }));
      recalc(Game.party);
      this.renderAll();
      setTimeout(() => { if (!this.checkEnd()) this.endTurn(e); }, 600);
    };
    // charge-up: the standard casting circle under the Platform sells the power-build; the beam +
    // per-hero crit-grade slashes/shakes land on resolution. Falls back to instant if no stage/sprite.
    const cel = this.spriteEl(e);
    if (field && cel) playCast(field, cel, e.att, fire); else fire();
  },
  // The beam itself: a screen-wide cyan sweep over the battlefield (.vault-laser, battle CSS) —
  // pure presentation, self-removing. The per-target slashFx/shake come from strike() as usual.
  laserSweep(): void {
    const field = $("#battleField"); if (!field) return;
    const beam = el("div", "vault-laser");
    field.appendChild(beam);
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => beam.classList.add("on"));
    else beam.classList.add("on");
    setTimeout(() => beam.remove(), 1100);
  },

  /* ---- status: apply a skill's effects + tick at the start of a unit's turn (ADR 0016) ---- */
  // Apply a skill's StatusMap (effect id → turns) as catalog instances: skip Stun on immune foes, roll
  // resistible effects (Accuracy ↔ Resistance), and tag the caster as `source` for transfer effects
  // (Drain). Returns the display names applied, for the combat log.
  applySkillStatuses(actor: Unit, target: Unit, st: StatusMap): string[] {
    const names: string[] = [];
    for (const id of Object.keys(st)) {
      if (id === "stun" && stunImmune(target)) { this.float(target, "resist", "#ccc"); this.log(`${target.name} resists Stun`); continue; }
      const def = STATUS[id];
      if (def && def.apply === "resistible" && !resolveApply(id, actor.sub?.Acc ?? 0, target.sub?.Res ?? 0)) { this.float(target, "resist", "#ccc"); continue; }
      applyStatus(target.statuses, id, { turns: st[id], source: (actor as Member).id });
      names.push(this.STATUS_NAMES[id] || def?.name || id);
    }
    return names;
  },
  tickStatuses(u: Unit, done: () => void): void {
    // A unit hard-CC'd (Stun/Frozen) at its turn start loses the turn; the tick then expires the CC.
    const wasCC = hasStatus(u.statuses, "stun") || hasStatus(u.statuses, "frozen");
    let delay = 0;
    for (const ev of tickStatus(u.statuses)) {
      if (ev.layer !== "status") continue; // only DoT/HoT/Doom touch HP here; other layers just counted down
      if (ev.detonated) { const d = Math.max(2, Math.round((u.maxhp || 40) * 0.25)); damage(u, d); this.float(u, `-${d}`, "#ef9bff"); delay = 300; continue; } // Doom — determined hit
      if (ev.magnitude <= 0) continue;
      const amt = Math.max(2, Math.round((u.maxhp || 40) * (ev.magnitude / 100) * ev.stacks)); // magnitude is %-of-maxhp per stack
      if (ev.kind === "buff") { heal(u, amt); this.float(u, `+${amt}`, "#aef0a0"); delay = 300; } // HoT (Regen)
      else {
        damage(u, amt); this.float(u, `-${amt}`, this.DOT_COLOR[ev.defId] || "#ffb27a"); delay = 300;
        if (ev.needsSource && ev.source) { const src = this.allUnits().find((x) => (x as Member).id === ev.source); if (src && src.alive) heal(src, amt); } // Drain → caster
      }
    }
    if (u.alive) this.maybeEnrage(u); // DoT ticks can cross the 20% enrage threshold at turn start
    u.guarding = false;
    if (wasCC) {
      this.log(`${u.name} is stunned!`); recalc(Game.party); this.renderAll();
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
    // Test Loop (ADR 0017): close the BattleLog fight with its outcome + party-HP-remaining (no-op in real play).
    const totalHp = Game.party.reduce((s, m) => s + Math.max(0, m.hp), 0), totalMax = Game.party.reduce((s, m) => s + m.maxhp, 0) || 1;
    BattleLog.endFight(fled ? "fled" : victory ? "won" : "wipe", (totalHp / totalMax) * 100);
    // THE GATE GUARDIAN (wave6c): capture + clear the in-flight flag on ANY outcome — a wipe/flee
    // leaves the Platform standing to re-challenge; only a victory marks it down (below).
    const wasGate = Field.pendingGateGuardian;
    Field.pendingGateGuardian = false;
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
    // MATERIAL DROPS (crafting slice): each fallen foe sheds 0–2 crafting materials from its family
    // pool (pure roll — systems/crafting off data/materials); banked straight into the run's stacks.
    const matDrops = rollBattleMaterials(this.enemies.map((e) => e.key));
    addCounts(Game.materials, matDrops);
    // CONSUMABLE DROPS: a modest flat chance per fallen foe to shed a ready-made potion directly
    // (independent of crafting — pure roll, systems/crafting off data/consumables).
    const consDrops = rollBattleConsumables(this.enemies.map((e) => e.key));
    addCounts(Game.consumables, consDrops);
    // QUESTS: every fallen enemy counts toward accepted kill-bounties (pure log op — systems/quests).
    const questsDone = noteKills(Game.quests, this.enemies.filter((e) => !e.alive).map((e) => e.key));
    const leveled = grantXp(Game.party, xp);
    if (leveled.length) Telemetry.levelup(leveled.length);
    drops.forEach((d) => { Game.inventory.push(d); Telemetry.drop(d.rarity); });
    const wasMini = this.enemies.some((e) => e.miniboss),
      // The ZONE boss by IDENTITY, not just the boss flag (wave6c): setpiece guardians (the Ruins'
      // Defense Platform) are boss-TIER (render/AI/spoils) but are nobody's zone gate — only the
      // current zone's authored `boss` key advances the zone flow / grants the raft.
      wasZoneBoss = this.enemies.some((e) => e.boss && e.key === Field.zone().boss),
      wasFinal = this.finalBoss;
    if (wasMini) { Game.miniBossDefeated = true; Field.onMiniDefeated(); } // open the mouth/gate (model-aware)
    if (wasGate) Field.onGateGuardianDefeated(); // the Platform falls — persist it down (the gate stays sealed)
    // TRAVERSAL UNLOCK (lock-before-key redesign): the raft is found in the DROWNED VAULT — clearing the
    // DUSKMARSH zone boss AWARDS it as a held quest item, and owning the raft confers the "gorge" capability
    // (Game.acquireItem → applyItemCaps), opening the Sunless Gorge so you can finally cross EAST to
    // Silverwood. The flow: blocked east by the gorge → go SOUTH to the Duskmarsh → raft → cross east. The
    // Bandit Warren (Greenvale) is now a pure beginner dungeon with NO key item. Gated on the SOURCE zone
    // (duskmarsh); later barriers add their own item + grant point. Returns the def the first time → spoils.
    const gotItem = wasZoneBoss && Field.zone().id === "duskmarsh" ? Game.acquireItem("raft") : null;
    Game.continueAfterBattle = wasZoneBoss
      ? wasFinal
        ? () => Game.victory()
        : () => Game.afterZoneBoss() // post-boss flow (roam-first for Greenvale→Silverwood; hub chain elsewhere)
      : () => Screens.show("field");
    if (Game.testMode && Game.testReturn) Game.continueAfterBattle = Game.testReturn; // Test Loop (ADR 0017): victory routes to the loop menu, not the field/zone flow
    Game.saveNow(); // autosave after a battle resolves — XP/gold/loot/level all applied (ADR 0007). (early-returns under testMode)
    setTimeout(() => this.showSpoils(xp, gold, drops, leveled, wasFinal, gotItem, questsDone, matDrops, consDrops), 500);
  },
  showSpoils(xp: number, gold: number, drops: Item[], leveled: LevelUp[], wasFinal: boolean, gotItem: HeldItemDef | null = null, questsDone: string[] = [], matDrops: Counts = {}, consDrops: Counts = {}): void {
    // FANFARE: a burst-in VICTORY banner over slow-turning golden rays; XP/Aether count up; loot
    // cards cascade in. All CSS/DOM — the numbers land at their true values even if animation is off.
    let h = `<div class="vict"><div class="vict-rays"></div><div class="vict-title">VICTORY</div></div>
      <div class="spoils-head"><span class="spoil-pill"><b id="victXp">+${xp}</b> XP</span><span class="spoil-pill aether"><b id="victGold">+◈ ${gold}</b> Aether</span></div>`;
    // MATERIAL PILLS (crafting slice): the crafting materials the fallen shed, already banked above.
    const matPills = Object.entries(matDrops)
      .map(([id, n]) => { const m = MATERIALS[id]; return m ? `<span class="spoil-pill"><b>${m.icon} ${m.name}</b> ×${n}</span>` : ""; })
      .join("");
    // CONSUMABLE PILLS: the ready-made potions the fallen shed directly (already banked above),
    // alongside the material pills so a lucky drop reads at a glance.
    const consPills = Object.entries(consDrops)
      .map(([id, n]) => { const c = CONSUMABLES[id]; return c ? `<span class="spoil-pill"><b>${c.icon} ${c.name}</b> ×${n}</span>` : ""; })
      .join("");
    if (matPills || consPills) h += `<div class="spoils-head" style="margin-top:4px">${matPills}${consPills}</div>`;
    // A held quest/key item picked up from this fight (e.g. the raft from the Kingpin) — a distinct callout
    // above the loot, since it goes to the Items tab, not the Bag.
    for (const qid of questsDone) {
      const q = QUESTS[qid];
      if (q) h += `<div class="card" style="background:#182615;border-color:#6fce6f;text-align:left"><b style="color:#8fe08f">✓ Quest complete — ${q.name}</b><div class="small" style="margin-top:3px">Return to ${q.town === "hearthford" ? "Watchman Bram in Hearthford" : q.town} to claim ◈ ${q.reward.aether} + ${q.reward.gearRarity} gear.</div></div>`;
    }
    if (gotItem) h += `<div class="card" style="background:#161226;border-color:var(--gold);text-align:left">
      <div class="psec" style="margin:0 0 2px">Key Item</div>
      <b class="title-gold">${gotItem.icon} ${gotItem.name}</b>
      <div class="small" style="margin-top:4px">${gotItem.blurb}</div>
      <div class="small" style="opacity:.7;margin-top:4px">Kept in your Party → Items.</div></div>`;
    if (leveled.length) {
      h += `<div class="card" style="background:#161226;border-color:var(--gold)"><b class="title-gold">Level up!</b><br>`;
      leveled.forEach((l) => {
        // MNA is a fixed, automatic grant each level (no roll) — assigned straight into the hero's tree
        const mna = `+${l.mnaGain ?? 0} MNA`;
        h += `<div class="small" style="margin-top:3px">${l.name} → Lv ${l.level}${l.newSkill ? ` · learned <span class="r-legendary">${l.newSkill}</span>` : ""}</div>`;
        h += `<div class="small" style="opacity:.9;margin-left:10px">+${l.hp ?? 0} HP · +${l.atk ?? 0} ATK · +${l.arm ?? 0} ARM · ${mna}</div>`;
      });
      h += `<div class="small" style="opacity:.8;margin-top:4px">MNA is assigned automatically — pick new abilities in Party → Abilities.</div>`;
      h += "</div>";
    }
    if (drops.length) {
      h += `<div class="tag">Loot</div><div class="scroll vict-loot">`;
      drops.forEach((d) => { h += itemHtml(d); });
      h += "</div>";
    } else h += `<p class="small">No loot this time.</p>`;
    h += `<div class="row"><button class="btn" onclick="UI.openInventory()">Open Bag</button>`;
    if (leveled.length) h += `<button class="btn" onclick="UI.openParty()">Spend MNA →</button>`;
    h += wasFinal ? `<button class="btn gold" onclick="UI.close()">Finish</button>` : `<button class="btn gold" onclick="UI.close()">Continue</button>`;
    h += `</div><div class="small" style="margin-top:8px">Victory jingle: <a class="link" onclick="Music.cycleStyle('victory')">${cap(Music.styleByState.victory)} ▸</a></div>`;
    Overlay.show(h);
    // Count the XP/Aether up from 0 over ~0.9s (pure flourish — the DOM above already holds the real
    // totals, so a mid-animation close/re-render can never show a wrong number for long).
    const countUp = (id: string, target: number, fmt: (n: number) => string): void => {
      const elx = document.getElementById(id); if (!elx || target <= 0) return;
      const t0 = performance.now(), dur = 900;
      const step = (): void => {
        const k = Math.min(1, (performance.now() - t0) / dur), eased = 1 - (1 - k) * (1 - k) * (1 - k);
        elx.textContent = fmt(Math.round(target * eased));
        if (k < 1 && document.getElementById(id)) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    countUp("victXp", xp, (n) => `+${n}`);
    countUp("victGold", gold, (n) => `+◈ ${n}`);
  },

  /* ---- battle atmosphere (weather + water glints) ---- */
  fxStyleFor(env: string): { kind: string; glint: [number, number] | null } {
    if (env === "mire") return { kind: "rain", glint: [0.5, 0.64] };
    if (env === "forest") return { kind: "leaves", glint: null };
    if (["hollow", "warren", "vault", "seacave", "smuggden", "crypt", "stronghold", "keepvault", "citadel", "granary"].includes(env)) return { kind: "embers", glint: null };
    return { kind: "wind", glint: env === "plains" ? [0.23, 0.33] : null }; // plains bg has the lake band
  },
  ensureFx(): void {
    if (this._fxRaf || typeof requestAnimationFrame === "undefined") return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = $("#battleFx") as HTMLCanvasElement | null; if (!cv) return;
    const tick = (): void => {
      this._fxRaf = 0;
      const scr = document.getElementById("battleScreen");
      if (!scr || !scr.classList.contains("on") || document.hidden) { this._fxParts = []; this._fxStyle = ""; return; } // self-stop
      const now = performance.now();
      if (now - this._fxLast >= 32) { this._fxLast = now; this.stepFx(cv, now); }
      this._fxRaf = requestAnimationFrame(tick);
    };
    this._fxRaf = requestAnimationFrame(tick);
  },
  stepFx(cv: HTMLCanvasElement, now: number): void {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const { kind, glint } = this.fxStyleFor(this.env);
    if (kind !== this._fxStyle) { // (re)seed on env change
      this._fxStyle = kind;
      const n = kind === "rain" ? 70 : kind === "leaves" ? 26 : kind === "embers" ? 22 : 30;
      this._fxParts = Array.from({ length: n + (glint ? 10 : 0) }, (_, i) => {
        const isGlint = glint ? i >= n : false;
        const m = { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: 0, p: Math.random() * Math.PI * 2, life: isGlint ? Math.random() : -1 };
        if (isGlint && glint) { m.y = h * (glint[0] + Math.random() * (glint[1] - glint[0])); m.r = 1.4 + Math.random() * 1.4; }
        else if (kind === "rain") { m.vx = -60 - Math.random() * 40; m.vy = 420 + Math.random() * 180; m.r = 7 + Math.random() * 6; }
        else if (kind === "leaves") { m.vx = 22 + Math.random() * 26; m.vy = 26 + Math.random() * 22; m.r = 2 + Math.random() * 2; }
        else if (kind === "embers") { m.vx = (Math.random() - 0.5) * 12; m.vy = -(16 + Math.random() * 22); m.r = 1 + Math.random() * 1.4; }
        else { m.vx = 90 + Math.random() * 80; m.vy = (Math.random() - 0.5) * 8; m.r = 1 + Math.random() * 1.2; }
        return m;
      });
    }
    const c = cv.getContext("2d")!; c.clearRect(0, 0, w, h);
    const dt = 0.033;
    for (const m of this._fxParts) {
      if (m.life >= 0) { // water glint: pulse in place, respawn along the band when the pulse dies
        m.life += dt * 0.55;
        if (m.life >= 1) { m.life = 0; m.x = Math.random() * w; }
        const a = Math.sin(m.life * Math.PI) * 0.55;
        c.strokeStyle = `rgba(235,248,255,${a.toFixed(3)})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(m.x - m.r * 2, m.y); c.lineTo(m.x + m.r * 2, m.y); c.moveTo(m.x, m.y - m.r); c.lineTo(m.x, m.y + m.r); c.stroke();
        continue;
      }
      m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.x > w + 20) m.x = -10; if (m.x < -20) m.x = w + 10;
      if (m.y > h + 20) m.y = -10; if (m.y < -20) m.y = h + 10;
      if (this._fxStyle === "rain") {
        c.strokeStyle = "rgba(190,215,235,.34)"; c.lineWidth = 1;
        c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x + m.vx * 0.03, m.y + m.vy * 0.03); c.stroke();
      } else if (this._fxStyle === "leaves") {
        const rot = now / 600 + m.p;
        c.fillStyle = "rgba(150,190,110,.5)";
        c.save(); c.translate(m.x, m.y); c.rotate(rot); c.fillRect(-m.r, -m.r * 0.45, m.r * 2, m.r * 0.9); c.restore();
      } else if (this._fxStyle === "embers") {
        const tw = 0.4 + 0.4 * Math.sin(now / 300 + m.p);
        c.fillStyle = `rgba(255,160,70,${tw.toFixed(3)})`;
        c.beginPath(); c.arc(m.x, m.y, m.r, 0, Math.PI * 2); c.fill();
      } else { // wind: faint fast streaks + a slow pollen shimmer
        const a = 0.05 + 0.05 * Math.sin(now / 500 + m.p);
        c.strokeStyle = `rgba(255,244,220,${a.toFixed(3)})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x - 14 - m.r * 6, m.y + 1); c.stroke();
      }
    }
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
    const ring = '<span class="ac-beats">beats</span>' + RING.map((a) =>
      `<span class="ac-node${live.has(a) ? " live" : ""}" style="color:${ATT[a].color}" title="${a}">${ABBR[a]}</span>`
    ).join('<span class="ac-arrow">▸</span>') + '<span class="ac-arrow">↺</span>';
    host.innerHTML = ring;
    // Party-shared Resource pools (ADR 0019) now live in the lower-right window, ABOVE the party HP bars
    // (Dara) — a compact per-Attunement strip. High-contrast chips (white value + attunement-coloured
    // label) so the pools read clearly, out of the way of the battlefield up top.
    const rs = $("#resStrip");
    if (rs) rs.innerHTML = RING.map((a) =>
      `<span class="res-pool" title="${a} Resource"><b style="color:${ATT[a].color}">${ABBR[a]}</b> <span class="res-val">${Game.resources[a]}</span></span>`
    ).join("");
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
      const cls = "enemy" + (e.alive ? "" : " dead") + rank + (e.rare ? " rare" : e.champion ? " champion" : e.elite ? " elite" : "") + (targetable && e.alive ? " targetable" : "") + this.actClass(e) + (e.enraged ? " enraged" : "") + (this._enter ? " enter" : "");
      const art = e.art || e.key;
      const hpPct = pct(e.hp, e.maxhp);
      const ename = `<div class="ename">${e.rare ? "✦ RARE " : e.champion ? "★ Champion " : ""}${e.name} <span class="att-tag" style="color:${ATT[e.att].color}">◆${e.att}</span>${e.eliteAffixes ? ` <span class="badge ${e.champion ? "champ" : "atkup"}">${e.eliteAffixes.join(" ")}</span>` : ""}${statusBadges(e)}</div>`;
      // HP bar carries a red GHOST layer under the green fill: on damage the green snaps, the ghost
      // drains down after it (CSS transition) — the classic "here's what that hit cost" read.
      const bar = `<div class="ebar">
        ${ename}
        <div class="bar hp"><i class="ghost" style="width:${hpPct}%"></i><i style="width:${hpPct}%"></i><span class="bartxt">${Math.max(0, e.hp)}/${e.maxhp}</span></div>
        <div class="bar atb"><i style="width:${e.atb}%"></i></div></div>`;
      const cur = reuse ? (z.children[i] as HTMLElement) : null;
      if (cur && cur.dataset.art === art) {
        // same creature, same art → keep the sprite; update the bar SURGICALLY (not an outerHTML swap)
        // so the ghost layer persists across renders and its catch-up drain actually animates.
        if (cur.className !== cls) cur.className = cls;
        const en = cur.querySelector(".ename"); if (en) en.outerHTML = ename;
        const hpG = cur.querySelector<HTMLElement>(".bar.hp > i:not(.ghost)"); if (hpG) hpG.style.width = hpPct + "%";
        const gh = cur.querySelector<HTMLElement>(".bar.hp > i.ghost"); if (gh) gh.style.width = hpPct + "%";
        const btxt = cur.querySelector(".bar.hp .bartxt"); if (btxt) btxt.textContent = `${Math.max(0, e.hp)}/${e.maxhp}`;
        const atb = cur.querySelector<HTMLElement>(".bar.atb > i"); if (atb) atb.style.width = e.atb + "%";
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
      // `.turn` marks the hero whose command menu is open ON THE BATTLEFIELD (a gold caret + lit ground
      // ring, CSS) — before, whose turn it was only showed in the lower roster panel.
      const cls = "pchar" + (m.alive ? "" : " downed") + this.actClass(m) + (m._hurt ? " hurt" : "") + (m === this.current && m.alive ? " turn" : "") + (this._enter ? " enter" : "");
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
    // Prune stale hero dolls: a party rebuilt in the Roster picker uses different member ids (hero0…)
    // than the defaults (dawnguard…), and #partyZone persists across rebuilds — so without a prune the
    // old dolls linger and stack up (the "10 heroes on screen" bug). Keep only current members.
    const ids = new Set(Game.party.map((m) => m.id));
    z.querySelectorAll<HTMLElement>(".pchar").forEach((n) => { if (!ids.has(n.dataset.mid ?? "")) n.remove(); });
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
    const p = $("#rosterRows")!;
    // Build once, then ALWAYS reconcile in place — a rebuild would recreate the HP bars and reset the
    // red ghost layer, killing its catch-up drain animation mid-fight.
    if (p.children.length !== Game.party.length) {
      p.innerHTML = "";
      this.rosterOrder().forEach((m) => {
        const w = pct(m.hp, m.maxhp);
        const row = el("div", "prow" + (m === this.current ? " turn" : "") + (m.alive ? "" : " downed"));
        row.dataset.id = m.id;
        row.innerHTML = `<div class="pn" style="color:${m.alive ? ATT[m.att].color : "#666"}">${m.name}${statusBadges(m)}</div>
        <div class="bars">
          <div class="bar hp"><i class="ghost" style="width:${w}%"></i><i style="width:${w}%"></i><span class="bartxt">${Math.max(0, m.hp)}/${m.maxhp}</span></div>
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
      row.classList.toggle("downed", !m.alive);
      if (!barsOnly) {
        const pn = row.querySelector<HTMLElement>(".pn");
        if (pn) { pn.style.color = m.alive ? ATT[m.att].color : "#666"; pn.innerHTML = `${m.name}${statusBadges(m)}`; }
      }
      const w = pct(m.hp, m.maxhp) + "%";
      const hpG = row.querySelector<HTMLElement>(".bar.hp > i:not(.ghost)");
      if (hpG) { hpG.style.width = w; row.querySelector(".bar.hp .bartxt")!.textContent = `${Math.max(0, m.hp)}/${m.maxhp}`; }
      const gh = row.querySelector<HTMLElement>(".bar.hp > i.ghost"); if (gh) gh.style.width = w;
      const atb = row.querySelector<HTMLElement>(".bar.atb > i"); if (atb) atb.style.width = m.atb + "%";
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

  /* ---- announcement & dialogue bubbles ---- */
  // Ability-name announcement: a rounded dark chat bubble that fades in, holds for ~the action's
  // choreography, and fades out. Hero bubbles sit at a fixed spot above the party side (top-right
  // of the battlefield); an enemy bubble anchors just above the acting enemy's sprite (whose HP/ATB
  // block fades out while it acts — see `.enemy.acting .ebar`). One bubble per side at a time.
  announce(u: Unit, text: string, color: string, holdMs: number): void {
    const field = $("#battleField"); if (!field) return;
    const side = u.side === "party" ? "hero" : "foe";
    field.querySelectorAll(`.abubble.${side}`).forEach((n) => n.remove());
    const b = el("div", `abubble ${side}`, text);
    b.style.color = color;
    if (u.side === "enemy") {
      const anchor = this.spriteEl(u);
      if (!anchor) return;
      const r = anchor.getBoundingClientRect(), f = field.getBoundingClientRect();
      b.style.left = r.left - f.left + r.width / 2 + "px";
      b.style.top = Math.max(30, r.top - f.top - 8) + "px";
    }
    field.appendChild(b);
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => b.classList.add("show"));
    else b.classList.add("show");
    setTimeout(() => { b.classList.remove("show"); setTimeout(() => b.remove(), 320); }, holdMs);
  },
  /** Scripted battle dialogue (for boss fights): shows a bubble at the TOP of the battle screen
   *  formatted `<Speaker>: <text>` — e.g. sayLine("Defense Platform V.04 - #13", "Systems Online")
   *  → "**Defense Platform V.04 - #13**: Systems Online" (speaker bold + colored, gold by default).
   *  Fade in → hold (~1.6s, or opts.holdMs) → fade out. Queue-safe: lines called in quick succession
   *  play one after another; the returned promise resolves when THIS line has fully faded out. */
  sayLine(speaker: string, text: string, opts: { color?: string; holdMs?: number } = {}): Promise<void> {
    return new Promise((done) => { this._sayQ.push({ speaker, text, ...opts, done }); this.pumpSay(); });
  },
  pumpSay(): void {
    if (this._saying) return;
    const q = this._sayQ.shift(); if (!q) return;
    const host = $("#battleField") || $("#battleScreen");
    if (!host) { q.done(); this.pumpSay(); return; } // no battle DOM (headless) — resolve and drain
    this._saying = true;
    const b = el("div", "say-line", `<b style="color:${q.color || "#ffd877"}">${q.speaker}</b>: ${q.text}`);
    host.appendChild(b);
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => b.classList.add("show"));
    else b.classList.add("show");
    setTimeout(() => {
      b.classList.remove("show");
      setTimeout(() => { b.remove(); this._saying = false; q.done(); this.pumpSay(); }, 340);
    }, 280 + (q.holdMs ?? 1600));
  },

  /* ---- battle-screen feedback helpers ---- */
  // Toggle the lunge/hurt animation classes IN PLACE rather than via a full renderAll — rebuilding
  // the zone re-creates the sprite <img>s and flashed a blank frame at the start/end of each attack
  // (Dara's flicker). Sprites also carry decoding="sync" so any genuine rebuild paints flash-free.
  markActing(u: Unit, action = "strike"): void {
    u.acting = true;
    const ac = this.ACTION_ANIM[action] || this.ACTION_ANIM.strike;
    this._actAnim.set(u, ac);
    const n = this.unitNode(u) as HTMLElement | null | undefined;
    if (n) n.classList.add("acting", ac); else this.renderAll();
  },
  // The class fragment the reconciling renderers re-apply for an acting unit (see ACTION_ANIM).
  actClass(u: Unit): string { return u.acting ? ` acting ${this._actAnim.get(u) || "act-strike"}` : ""; },
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
  float(u: Unit, txt: string, color: string, crit = false): void {
    const anchor = this.spriteEl(u); // damage/heal number floats above the SPRITE (Dara: not the HP bar)
    if (!anchor) return;
    const f = el("div", "float" + (crit ? " crit" : ""), txt); f.style.color = color || "#fff";
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
