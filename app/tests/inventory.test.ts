import { describe, it, expect } from "vitest";
import {
  emptyItems, hasItem, grantItem, capsFromItems, serializeItems, reviveItems,
} from "../src/systems/inventory";
import { HELD_ITEMS } from "../src/data/heldItems";

describe("inventory — held items", () => {
  it("starts empty and grants idempotently", () => {
    const inv = emptyItems();
    expect(inv.size).toBe(0);
    expect(hasItem(inv, "raft")).toBe(false);
    grantItem(inv, "raft");
    grantItem(inv, "raft"); // idempotent — a key item is held once
    expect(inv.size).toBe(1);
    expect(hasItem(inv, "raft")).toBe(true);
  });

  it("derives the traversal cap from a held key item (the raft → gorge)", () => {
    const inv = emptyItems();
    expect(capsFromItems(inv)).toEqual([]);
    grantItem(inv, "raft");
    expect(capsFromItems(inv)).toEqual(["gorge"]);
  });

  it("ignores items without a grantsCap when deriving caps", () => {
    // every registry item that confers a cap contributes exactly that cap; others contribute nothing.
    const inv = emptyItems();
    for (const id of Object.keys(HELD_ITEMS)) grantItem(inv, id);
    const expected = Object.values(HELD_ITEMS).filter((d) => d.grantsCap).map((d) => d.grantsCap);
    expect(capsFromItems(inv).sort()).toEqual(expected.sort());
  });

  it("round-trips through serialize → revive", () => {
    const inv = grantItem(emptyItems(), "raft");
    const json = serializeItems(inv);
    expect(json).toEqual(["raft"]);
    const back = reviveItems(json);
    expect(hasItem(back, "raft")).toBe(true);
  });

  it("revive is tolerant: drops junk, non-strings, and unknown/removed ids (never throws)", () => {
    expect([...reviveItems(["raft", 7, null, "", "no-such-item", {}])]).toEqual(["raft"]);
    expect(reviveItems(undefined).size).toBe(0);
    expect(reviveItems("nope").size).toBe(0);
    expect(reviveItems({ raft: true }).size).toBe(0); // not an array
  });
});
