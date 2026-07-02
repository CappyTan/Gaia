// Quest engine — pure, no DOM (the layering rule): accept/progress/turn-in state over the defs in
// data/quests. The controller (Game) owns the overlays and reward granting; battle victory calls
// noteKills with the fallen enemies' keys. State is a plain record so it serializes straight into
// the save (versioned, defaults to {} on old saves — ADR 0007 tolerance).

import { QUESTS, QUEST_CHAIN_START, type QuestDef } from "../data/quests";

export interface QuestProg { accepted: boolean; kills: number; turnedIn: boolean; }
export type QuestLog = Record<string, QuestProg>;

export const emptyQuests = (): QuestLog => ({});

const prog = (log: QuestLog, id: string): QuestProg => (log[id] ??= { accepted: false, kills: 0, turnedIn: false });

/** The quest a town's giver currently talks about: the first quest in the town's chain not yet turned
 *  in (sequential — the next link is offered only after the previous is handed over). Null = chain done. */
export function questForTown(log: QuestLog, townId: string): QuestDef | null {
  let id = QUEST_CHAIN_START[townId];
  while (id) {
    const def = QUESTS[id];
    if (!def) return null;
    if (!log[id]?.turnedIn) return def;
    id = def.next ?? "";
  }
  return null;
}

export function accept(log: QuestLog, id: string): void { prog(log, id).accepted = true; }

/** True when the quest is accepted, its count met, and the reward not yet claimed. */
export function ready(log: QuestLog, def: QuestDef): boolean {
  const p = log[def.id];
  return !!p && p.accepted && !p.turnedIn && p.kills >= def.kill.count;
}

/** Mark turned in (the controller grants the reward). */
export function turnIn(log: QuestLog, id: string): void { prog(log, id).turnedIn = true; }

/** Count a batch of fallen enemies toward every accepted, unfinished kill-quest. Returns the ids of
 *  quests COMPLETED by this batch (for the victory-screen callout). */
export function noteKills(log: QuestLog, fallenKeys: string[]): string[] {
  const completed: string[] = [];
  for (const def of Object.values(QUESTS)) {
    const p = log[def.id];
    if (!p || !p.accepted || p.turnedIn || p.kills >= def.kill.count) continue;
    const n = fallenKeys.filter((k) => def.kill.keys.includes(k)).length;
    if (!n) continue;
    p.kills = Math.min(def.kill.count, p.kills + n);
    if (p.kills >= def.kill.count) completed.push(def.id);
  }
  return completed;
}

/** Every quest the log knows about, in chain order per town — for the quest-log screen. */
export function questList(log: QuestLog): { def: QuestDef; p: QuestProg | undefined; locked: boolean }[] {
  const out: { def: QuestDef; p: QuestProg | undefined; locked: boolean }[] = [];
  for (const start of Object.values(QUEST_CHAIN_START)) {
    let id: string | undefined = start, prevDone = true;
    while (id) {
      const def: QuestDef | undefined = QUESTS[id];
      if (!def) break;
      out.push({ def, p: log[id], locked: !prevDone });
      prevDone = !!log[id]?.turnedIn;
      id = def.next;
    }
  }
  return out;
}
