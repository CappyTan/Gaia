// Tiny typed event bus. Decouples systems/controllers from one another and from the UI:
// emitters don't know who listens. Add event names + payloads to GameEvents as the world grows.

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
