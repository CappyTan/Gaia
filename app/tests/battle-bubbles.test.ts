// @vitest-environment jsdom
//
// Battle presentation (wave5b): ability-announcement bubbles, the scripted-dialogue sayLine API,
// and the per-action animation-class hook. DOM-behavior tests: a bubble mounts (one per side, the
// newest replacing the last), an enemy bubble anchors over its sprite, sayLine serializes queued
// lines (queue-safe) and resolves each promise after its fade, and the act-<action> class survives
// the reconcile-in-place re-render (so a dash/frame animation never dies to a mid-action re-paint).

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { Battle } from "../src/controllers/battle";
import { Game } from "../src/controllers/game";
import type { Enemy, Member } from "../src/types";

function enemy(over: Partial<Enemy> = {}): Enemy {
  return {
    key: "gbandit", name: "Greenvale Bandit", att: "NOX", spr: "🗡",
    hp: 40, maxhp: 40, atb: 0, spd: 10, statuses: [], alive: true, side: "enemy",
    ...over,
  } as unknown as Enemy;
}
function member(over: Partial<Member> = {}): Member {
  return {
    id: "auren", name: "Auren", att: "SOL", cls: "S&S", row: "front", spr: "🛡",
    hp: 30, maxhp: 30, mp: 10, maxmp: 10, atb: 0, statuses: [], alive: true, side: "party",
    ...over,
  } as unknown as Member;
}

// The real markup nests the combatant zones inside #battleField (the bubble host).
function stage(): void {
  document.body.innerHTML = `<div id="stage"><div id="battleField"><div id="battleBg"></div>
    <div id="enemyZone"></div><div id="partyZone"></div></div>
    <div id="rosterPanel"><div id="resStrip"></div><div id="rosterRows"></div></div><div id="log"></div><div id="affinityChain"></div></div>`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("battle bubbles + sayLine + action-animation classes", () => {
  beforeEach(() => {
    stage();
    Battle.active = true; Battle.selecting = null; Battle.current = null; Battle.logLines = [];
    Battle.enemies = [enemy()];
    Game.party = [member()];
    Battle._sayQ.length = 0; Battle._saying = false;
    Battle.renderAll();
  });

  it("shows ONE hero announcement bubble, newest replacing the last", () => {
    Battle.announce(Game.party[0], "Radiant Cut", "#f4b942", 50);
    Battle.announce(Game.party[0], "Defend", "#ffd877", 50);
    const bubbles = document.querySelectorAll("#battleField .abubble.hero");
    expect(bubbles.length).toBe(1);
    expect(bubbles[0].textContent).toBe("Defend");
    expect((bubbles[0] as HTMLElement).style.color).toBeTruthy();
  });

  it("anchors an enemy bubble over the acting enemy's sprite", () => {
    Battle.announce(Battle.enemies[0], "Attack", "#c4a7ff", 50);
    const b = document.querySelector<HTMLElement>("#battleField .abubble.foe");
    expect(b).toBeTruthy();
    expect(b!.textContent).toBe("Attack");
    expect(b!.style.left).toMatch(/px$/);   // positioned at the sprite, not the fixed hero spot
    expect(b!.style.top).toMatch(/px$/);
  });

  it("sayLine queues: two quick lines play one at a time, both promises resolve", async () => {
    const p1 = Battle.sayLine("Defense Platform V.04 - #13", "Systems Online", { holdMs: 10 });
    const p2 = Battle.sayLine("Defense Platform V.04 - #13", "Threat Detected", { holdMs: 10 });
    // queue-safe: only the FIRST line is on screen
    let lines = document.querySelectorAll(".say-line");
    expect(lines.length).toBe(1);
    expect(lines[0].innerHTML).toContain("<b");
    expect(lines[0].textContent).toBe("Defense Platform V.04 - #13: Systems Online");
    await p1;
    lines = document.querySelectorAll(".say-line");   // second line took the stage
    expect(lines.length).toBe(1);
    expect(lines[0].textContent).toContain("Threat Detected");
    await p2;
    expect(document.querySelectorAll(".say-line").length).toBe(0);   // all faded + removed
  });

  it("sayLine resolves (and drains) without battle DOM instead of hanging", async () => {
    document.body.innerHTML = "";
    await Battle.sayLine("Narrator", "no stage");   // must not reject or hang
  });

  it("markActing tags the per-ACTION class and the reconciler keeps it across re-renders", async () => {
    Battle.markActing(Battle.enemies[0]);
    const node = document.querySelector("#enemyZone .enemy")!;
    expect(node.classList.contains("acting")).toBe(true);
    expect(node.classList.contains("act-strike")).toBe(true);
    Battle.renderAll();   // a mid-action re-paint must not strip the animation class
    const again = document.querySelector("#enemyZone .enemy")!;
    expect(again.classList.contains("act-strike")).toBe(true);
    await sleep(400);     // let the announce/bubble timers from other tests settle
  });
});

// don't leak fixtures into suites that share the Game/Battle singletons
afterAll(() => { Game.party = []; Battle.active = false; Battle.enemies = []; });
