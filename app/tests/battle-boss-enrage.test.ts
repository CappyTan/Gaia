// @vitest-environment jsdom
//
// Boss-fight RESOLUTION regression. A player reported a STUCK battle: they killed Greenvale's
// zone boss (the Kingpin) but the fight never ended — the command menu stayed up with no living
// enemy left to target (selecting Attack found no target). These tests drive a single-enemy boss
// to death — including THROUGH the enrage path (the Kingpin's distinguishing feature, hp ≤20% →
// triggerEnrage swaps to its Omega sprite via a DOM crossfade) — and assert the battle ENDS
// (Battle.active === false, 0 living enemies). They guard against an enrage-side DOM/render
// failure aborting resolve() before it schedules afterAction → checkEnd.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Battle } from "../src/controllers/battle";
import { Game } from "../src/controllers/game";
import { makeMember, recalc } from "../src/systems/progression";
import { buildDef } from "../src/data/party";
import type { Enemy, Member } from "../src/types";

// A kingpin-shaped boss: real art (kingpin.png) so enemySprite yields a .spr-img, and an enrage
// omega (kingpin-omega.png exists) so triggerEnrage takes the DOM crossfade branch.
function boss(hp: number): Enemy {
  return {
    key: "kingpin", name: "Greenvale Kingpin", att: "SOL", spr: "👑",
    hp, maxhp: 870, atb: 0, spd: 7, atk: 35, armor: 7, mag: 0, statuses: [],
    alive: true, side: "enemy", boss: true, ai: "boss", enrage: { omega: "kingpin-omega" },
    xpReward: 240, goldRange: [120, 180],
    mna: { SOL: 0, NOX: 0, ANIMA: 0, QUANTA: 0, UMBRAXIS: 0 },
  } as unknown as Enemy;
}

// A real hero via makeMember (so the live recalc that resolve()/grantXp() invoke succeeds).
// NOX attacker → strong affinity vs the SOL boss; we override base.atk to control kill timing.
function hero(atk: number): Member {
  const def = buildDef("auren", "Auren", "NOX", "Dual Swords", "front");
  def.base = { ...def.base, hp: 400, atk };
  const m = makeMember(def);
  recalc([m]); // fill live combat stats (atk/maxhp) as the battle start would
  m.hp = m.maxhp;
  return m;
}

function stage(): void {
  document.body.innerHTML = `<div id="battleBg"></div><div id="stage">
    <div id="enemyZone"></div><div id="partyZone"></div>
    <div id="rosterPanel"><div id="resStrip"></div><div id="rosterRows"></div></div><div id="log"></div><div id="affinityChain"></div>
    <div id="cmdPanel"><div id="cmdWho"></div><div id="cmdList"></div></div></div>`;
}

describe("boss fight ends on death (no stuck battle)", () => {
  beforeEach(() => {
    stage();
    vi.useFakeTimers();
    Battle.active = true; Battle.isBoss = true; Battle.finalBoss = false;
    Battle.selecting = null; Battle.current = null; Battle.logLines = [];
    Battle.awaiting = false;
    // stub the post-victory flow the engine schedules so end() doesn't reach into game/field DOM
    Game.continueAfterBattle = () => {};
    (Game as unknown as { saveNow(): void }).saveNow = () => {};
    (Game as unknown as { acquireItem(k: string): null }).acquireItem = () => null;
    Game.gold = 0; Game.inventory = []; Game.encountersWon = 0; Game.miniBossDefeated = false;
  });
  afterEach(() => {
    vi.clearAllTimers(); vi.useRealTimers();
    Game.party = []; Battle.active = false; Battle.enemies = [];
  });

  const settle = () => { vi.advanceTimersByTime(2000); };

  it("ends on a single fatal hit (no enrage)", () => {
    Game.party = [hero(9999)];                 // one hit obliterates it
    Battle.enemies = [boss(870)];
    Battle.renderAll();
    Battle.resolve(Game.party[0], [Battle.enemies[0]], { type: "attack" });
    settle();
    expect(Battle.enemies[0].alive).toBe(false);
    expect(Battle.livingEnemies().length).toBe(0);
    expect(Battle.active).toBe(false);
  });

  it("ends through the ENRAGE path: an overkill hit that crosses ≤20% (enrage threshold)", () => {
    // 870 → 0 in one big hit; the kill itself can't enrage (dead), so this is the pure-kill control
    // for the enraged-then-die case below. Enemy already low so the engine's death transition is the
    // thing under test.
    Game.party = [hero(9999)];
    Battle.enemies = [boss(130)];              // 130/870 ≈ 15%
    Battle.renderAll();
    Battle.resolve(Game.party[0], [Battle.enemies[0]], { type: "attack" });
    settle();
    expect(Battle.enemies[0].alive).toBe(false);
    expect(Battle.active).toBe(false);
  });

  it("ends when ENRAGE fires on a survivable hit, then a later hit kills (the reported flow)", () => {
    const m = hero(40);                        // chip damage — first hit leaves it alive at <20%
    Game.party = [m];
    const e = boss(150);                       // 150/870 ≈ 17%
    Battle.enemies = [e];
    Battle.renderAll();
    // first action: non-fatal hit at <20% HP → maybeEnrage → triggerEnrage (DOM crossfade scheduled)
    Battle.resolve(m, [e], { type: "attack" });
    settle();
    expect(e.enraged).toBe(true);
    expect(e.alive).toBe(true);
    expect(Battle.active).toBe(true);          // still fighting — correct
    // keep attacking until it dies; EVERY resolve must keep the turn flow alive and finally end it
    Battle.awaiting = false; Battle.current = null;
    for (let i = 0; i < 40 && e.alive; i++) {
      Battle.resolve(m, [e], { type: "attack" });
      settle();
      Battle.awaiting = false; Battle.current = null;
    }
    expect(e.alive).toBe(false);
    expect(Battle.livingEnemies().length).toBe(0);
    expect(Battle.active).toBe(false);
  });

  it("does NOT re-open the command menu when a pending status-tick callback fires after the boss dies", () => {
    // The reported flow: the boss is killed while a hero's turn-start status tick (DoT/stun delay)
    // is still in flight. end() runs (raft granted, active=false), then the deferred tickStatuses
    // 'done' callback fires and — if unchecked — calls showCommands on a finished battle, leaving a
    // live command menu with no enemy to target. The fix: a dead/inactive battle must not show commands.
    const killer = hero(9999);
    const burned = hero(40); burned.id = "sephi"; burned.name = "Sephi"; burned.statuses = [{ defId: "burn", turns: 2, stacks: 1, magnitude: 5 }];
    Game.party = [killer, burned];
    const e = boss(870);
    Battle.enemies = [e];
    Battle.renderAll();
    // a burning hero begins their turn → tickStatuses schedules its 'done' (showCommands) ~300ms out
    Battle.startPlayerTurn(burned);
    // before that resolves, the killer obliterates the boss → end() runs
    Battle.awaiting = false;
    Battle.resolve(killer, [e], { type: "attack" });
    settle();
    expect(e.alive).toBe(false);
    expect(Battle.active).toBe(false);
    // the command list must be empty — the battle is over, no live menu
    expect(document.querySelector("#cmdList")!.children.length).toBe(0);
  });

  it("does NOT re-open the command menu when the status-tick callback fires STRICTLY AFTER end()", () => {
    // Same race, opposite ordering: end() runs FIRST (kill resolves), THEN the deferred showCommands
    // callback fires. The showCommands/startPlayerTurn !active guards must suppress it.
    const killer = hero(9999);
    const burned = hero(40); burned.id = "sephi"; burned.name = "Sephi"; burned.statuses = [{ defId: "burn", turns: 2, stacks: 1, magnitude: 5 }];
    Game.party = [killer, burned];
    const e = boss(870);
    Battle.enemies = [e];
    Battle.renderAll();
    // kill the boss first → end() runs at +360 (active=false, cmdList cleared)
    Battle.resolve(killer, [e], { type: "attack" });
    vi.advanceTimersByTime(360);
    expect(Battle.active).toBe(false);
    // now a stale turn-start tick resolves and tries to open commands on the finished battle
    Battle.startPlayerTurn(burned);
    settle();
    expect(document.querySelector("#cmdList")!.children.length).toBe(0);
  });

  it("ends with a multi-hit skill that crosses enrage AND kills in the same resolve loop", () => {
    const m = hero(90);
    Game.party = [m];
    const e = boss(160);                       // an early hit drops it <20% (enrage), a later hit kills
    Battle.enemies = [e];
    Battle.renderAll();
    Battle.resolve(m, [e], { skill: { name: "Flurry", mp: 0, hits: 5, target: "enemy", type: "phys", desc: "" } as never });
    settle();
    expect(e.alive).toBe(false);
    expect(Battle.livingEnemies().length).toBe(0);
    expect(Battle.active).toBe(false);
  });
});
