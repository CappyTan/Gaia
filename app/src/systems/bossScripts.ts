// SCRIPTED BOSS TURNS (wave6c — the Ancient Ruins' gate guardian). PURE turn choreography for
// setpiece bosses — no DOM, rng injectable. A boss with an entry here plays AUTHORED steps instead
// of the free enemy AI: the opening turns run verbatim (a dialogue line + an action each), then the
// signature nuke re-fires on a rolled cadence, every other turn falling through to the normal AI.
// The sequencer is a pure function of (script, state, rng) so the choreography is unit-testable;
// the battle controller owns all presentation (sayLine, FX, damage resolution) and holds the
// per-enemy ScriptState (fresh enemies each fight ⇒ fresh scripts, nothing to reset).

import type { Rng } from "../core/rng";
import { riR } from "../core/rng";

/** A dialogue line played over the battle (Battle.sayLine) right before the step's action resolves. */
export interface ScriptSay { speaker: string; text: string; color?: string }
/** One scripted turn: `hold` = no attack (the machine boots/aims); `nuke` = the scripted super. */
export interface ScriptStep { say?: ScriptSay; act: "hold" | "nuke" }
export interface EnemyScript {
  /** Turns 1..N (1-based) play these steps verbatim. */
  opening: ScriptStep[];
  /** After the opening, the nuke re-fires every [min,max] turns (rolled each time); turns between
   *  cadence beats return null and run the normal enemy AI. */
  loopEvery: [number, number];
}

const PLATFORM = "Defense Platform V.04 - #13";
/** Scripted setpieces by ENEMY KEY (data/enemies). Data-driven: a new scripted boss is an entry
 *  here + its nuke resolution in controllers/battle.runScriptStep — never a hack in the turn loop. */
export const ENEMY_SCRIPTS: Record<string, EnemyScript> = {
  // THE GATE GUARDIAN: three turns of dread — boot, aim, EXECUTE (Vault Purge Protocol, the
  // full-party laser) — then the purge re-fires every 2–3 turns for the rest of the fight.
  defplatform: {
    opening: [
      { say: { speaker: PLATFORM, text: "Systems Online", color: "#7ae0ff" }, act: "hold" },
      { say: { speaker: PLATFORM, text: "Targeting", color: "#7ae0ff" }, act: "hold" },
      { say: { speaker: PLATFORM, text: "Execute", color: "#ff8a7a" }, act: "nuke" },
    ],
    loopEvery: [2, 3],
  },
};

/** Per-enemy live sequencing state the battle holds across the fight. */
export interface ScriptState { turn: number; nextNukeAt: number }
export const newScriptState = (): ScriptState => ({ turn: 0, nextNukeAt: 0 });

/** Advance ONE turn of the script (mutates `st`): returns the step to run this turn, or null for a
 *  normal AI turn. Opening steps play verbatim; the loop cadence is scheduled off the opening's end
 *  and re-rolled after each nuke, so the re-fires land every loopEvery[0]..loopEvery[1] turns. */
export function scriptedTurn(s: EnemyScript, st: ScriptState, rng: Rng = Math.random): ScriptStep | null {
  st.turn++;
  const gap = () => riR(rng, s.loopEvery[0], s.loopEvery[1]);
  if (st.turn <= s.opening.length) {
    const step = s.opening[st.turn - 1];
    if (st.turn === s.opening.length) st.nextNukeAt = st.turn + gap(); // schedule the first re-fire
    return step;
  }
  if (st.nextNukeAt <= 0) st.nextNukeAt = st.turn + gap(); // defensive: an empty opening never scheduled
  if (st.turn >= st.nextNukeAt) { st.nextNukeAt = st.turn + gap(); return { act: "nuke" }; }
  return null;
}
