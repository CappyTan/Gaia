// @vitest-environment jsdom
//
// Battle-screen RENDER RECONCILIATION (Dara's attack flicker, v0.102). The flicker came from
// renderEnemies/renderParty wiping their zone with innerHTML="" on every re-paint, which destroyed
// and re-created every combatant sprite <img> — flashing a blank frame at the start AND end of each
// attack. The fix reconciles in place: a sprite element must SURVIVE a re-paint (so the browser never
// re-fetches/re-lays-it-out → no flash) and only be rebuilt when its ART genuinely changes (a hero
// falling to 💤, or a boss enraging into its Omega sprite). These tests pin that invariant.

import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { Battle } from "../src/controllers/battle";
import { Game } from "../src/controllers/game";
import type { Enemy, Member } from "../src/types";

// Minimal combatant fixtures — only the fields the render path reads. "gbandit" has real sliced art
// so enemySprite yields an <img class="spr-img">, the element whose identity we're guarding.
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

function stage(): void {
  document.body.innerHTML = `<div id="stage"><div id="enemyZone"></div><div id="partyZone"></div>
    <div id="rosterPanel"><div id="resStrip"></div><div id="rosterRows"></div></div><div id="log"></div><div id="affinityChain"></div></div>`;
}

const enemySpr = () => document.querySelector("#enemyZone .enemy")?.firstElementChild ?? null;
const heroDoll = () => document.querySelector('#partyZone .pchar[data-mid="auren"] .doll, #partyZone .pchar[data-mid="auren"] .spr') ?? null;

describe("battle render reconciliation (no attack flicker)", () => {
  beforeEach(() => {
    stage();
    Battle.active = true; Battle.selecting = null; Battle.current = null; Battle.logLines = [];
    Battle.enemies = [enemy()];
    Game.party = [member()];
  });

  it("keeps the SAME sprite element across a plain re-paint", () => {
    Battle.renderAll();
    const e0 = enemySpr(), h0 = heroDoll();
    expect(e0).toBeTruthy(); expect(h0).toBeTruthy();
    // a re-paint with no art change (e.g. an ATB/HP tick) must reuse the very same node.
    Battle.renderAll();
    expect(enemySpr()).toBe(e0);
    expect(heroDoll()).toBe(h0);
  });

  it("preserves sprite identity through an attack (markActing + re-paint), and flags .acting", () => {
    Battle.renderAll();
    const e0 = enemySpr(), h0 = heroDoll();
    // the exact flicker path: lunge starts, then resolve()/endTurn() re-paint the screen mid-animation.
    Battle.markActing(Game.party[0]);
    Battle.renderAll();
    expect(heroDoll()).toBe(h0); // sprite NOT rebuilt → no blank frame
    expect(document.querySelector('#partyZone .pchar[data-mid="auren"]')!.classList.contains("acting")).toBe(true);
    // enemy takes the hit; its sprite must likewise survive the re-paint.
    Battle.markHurt(Battle.enemies[0]);
    Battle.renderAll();
    expect(enemySpr()).toBe(e0);
  });

  it("REBUILDS a sprite only when its art truly changes (enrage → Omega)", () => {
    Battle.renderAll();
    const e0 = enemySpr();
    Battle.enemies[0].art = "hollowking"; // stand-in for an Omega art swap
    Battle.renderAll();
    expect(enemySpr()).not.toBe(e0); // a genuine art change DOES swap the element
  });

  it("REBUILDS a hero sprite when they fall (doll → 💤)", () => {
    Battle.renderAll();
    const h0 = heroDoll();
    Game.party[0].alive = false;
    Battle.renderAll();
    expect(heroDoll()).not.toBe(h0);
    expect(document.querySelector('#partyZone .pchar[data-mid="auren"] .spr')!.textContent).toBe("💤");
  });

  // don't leak fixtures into suites that share the Game/Battle singletons
  afterAll(() => { Game.party = []; Battle.active = false; Battle.enemies = []; });
});
