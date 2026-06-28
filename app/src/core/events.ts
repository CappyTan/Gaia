// Tiny typed event bus — AVAILABLE, NOT YET ADOPTED. Intended as a decoupling seam so emitters
// (controllers/systems) don't know who listens; today controllers still couple via direct public-
// object calls (Game/Field/Battle/Screens), and this bus has no live consumers. Reach for it when a
// seam genuinely fans out to several independent listeners; add event names + payloads to GameEvents
// then. Until something subscribes, prefer the existing direct call rather than emitting to nobody.

import type { Item, Member } from "../types";

export interface GameEvents {
  "screen:show": { name: "title" | "field" | "battle" };
  "battle:start": { enemyKeys: string[]; env: string; isBoss: boolean };
  "battle:end": { victory: boolean; fled: boolean };
  "loot:drop": { item: Item };
  "member:levelup": { member: Member; level: number; newSkill: string | null };
}

type Handler<T> = (payload: T) => void;
type AnyHandler = (payload: never) => void;

class EventBus {
  // Stored loosely; the public on/emit signatures keep callers type-safe.
  private handlers: Partial<Record<keyof GameEvents, Set<AnyHandler>>> = {};

  on<K extends keyof GameEvents>(type: K, fn: Handler<GameEvents[K]>): () => void {
    const set = (this.handlers[type] ??= new Set<AnyHandler>());
    set.add(fn as AnyHandler);
    return () => set.delete(fn as AnyHandler);
  }

  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]): void {
    this.handlers[type]?.forEach((fn) => (fn as Handler<GameEvents[K]>)(payload));
  }
}

export const bus = new EventBus();
