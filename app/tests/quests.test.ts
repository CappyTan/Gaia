// Quest engine (systems/quests) — the pure chain/kill/turn-in logic — plus the CONTINENT CONTENT
// invariants (wave6d): every chain well-formed, every kill target real and actually fightable in its
// quest's zone, rewards monotone within a chain and across the arc, chain-locks ordered everywhere.
import { describe, it, expect } from "vitest";
import { emptyQuests, questForTown, accept, ready, turnIn, noteKills, questList, questGroups } from "../src/systems/quests";
import { QUESTS, QUEST_CHAIN_START, questGiver, poiQuestScope, type QuestDef } from "../src/data/quests";
import { ZONES, type Zone } from "../src/data/zones";
import { ENEMIES } from "../src/data/enemies";
import { SETTLEMENTS } from "../src/data/towns";
import { rarityIx } from "../src/data/rarity";

// Walk every chain from its start (guarded — a `next` cycle fails loudly instead of hanging).
const chains = Object.entries(QUEST_CHAIN_START).map(([town, start]) => {
  const ids: string[] = [];
  for (let id: string | undefined = start; id && ids.length < 10; id = QUESTS[id]?.next) ids.push(id);
  return { town, ids, defs: ids.map((i) => QUESTS[i]).filter(Boolean) as QuestDef[] };
});
const zoneOf = (id: string): Zone | undefined => ZONES.find((z) => z.id === id);
/** Every key genuinely fightable in a zone: band spawns (overworld + both dungeons) + the bookends. */
const zoneCast = (z: Zone): Set<string> => {
  const keys = new Set<string>();
  for (const bands of [z.bands, z.dungeon?.bands ?? [], z.dungeon2?.bands ?? []])
    for (const b of bands) for (const set of b.sets) for (const k of set) keys.add(k);
  for (const k of [z.mini, ...(z.miniAdds ?? []), z.boss, z.dungeon?.floorMini, z.dungeon2?.floorMini]) if (k) keys.add(k);
  return keys;
};

describe("quest chain", () => {
  it("offers the Hearthford chain sequentially and only after turn-in", () => {
    const log = emptyQuests();
    expect(questForTown(log, "hearthford")!.id).toBe("gv-kobolds");
    accept(log, "gv-kobolds");
    expect(questForTown(log, "hearthford")!.id).toBe("gv-kobolds"); // still current until turned in
    log["gv-kobolds"].kills = 10; turnIn(log, "gv-kobolds");
    expect(questForTown(log, "hearthford")!.id).toBe("gv-bandits");
  });
  it("counts only matching kills, only when accepted, capped at the goal", () => {
    const log = emptyQuests();
    expect(noteKills(log, ["kobold", "kobold"])).toEqual([]); // not accepted yet — no credit
    accept(log, "gv-kobolds");
    noteKills(log, ["kobold", "kobolde", "gbandit", "slime"]);
    expect(log["gv-kobolds"].kills).toBe(2); // gbandit/slime don't count
    expect(noteKills(log, Array(20).fill("kobold"))).toEqual(["gv-kobolds"]); // completes exactly once
    expect(log["gv-kobolds"].kills).toBe(10);
    expect(ready(log, QUESTS["gv-kobolds"])).toBe(true);
    turnIn(log, "gv-kobolds");
    expect(ready(log, QUESTS["gv-kobolds"])).toBe(false); // non-repeatable
  });
  it("locks later chain links until the previous is turned in — in EVERY chain", () => {
    const rows = questList(emptyQuests());
    expect(rows.slice(0, 3).map((r) => r.def.id)).toEqual(["gv-kobolds", "gv-bandits", "gv-kingpin"]);
    for (const g of questGroups(emptyQuests()))
      g.quests.forEach((q, i) => expect(q.locked, `${q.def.id} locked`).toBe(i > 0));
  });
});

describe("continent quest content", () => {
  it("chains are well-formed: ids self-consistent, every quest in exactly one chain", () => {
    for (const [id, def] of Object.entries(QUESTS)) expect(def.id, `id of ${id}`).toBe(id);
    const walked = chains.flatMap((c) => c.ids);
    expect(walked.length).toBe(new Set(walked).size); // no shared tails / cycles
    expect([...walked].sort()).toEqual(Object.keys(QUESTS).sort()); // no orphans, no dangling `next`
    for (const c of chains) expect(c.defs.length, `${c.town} chain resolves`).toBe(c.ids.length);
  });

  it("every front-door town on the continent fields a chain", () => {
    for (const z of ZONES) {
      const hubs = z.hubs ?? [z.hub];
      expect(hubs.some((h) => h && QUEST_CHAIN_START[h]), `${z.id} hub chain`).toBe(true);
    }
  });

  it("every kill target exists in ENEMIES and actually spawns in the quest's zone", () => {
    for (const def of Object.values(QUESTS)) {
      const z = zoneOf(def.zone);
      expect(z, `${def.id} zone ${def.zone}`).toBeTruthy();
      const cast = zoneCast(z!);
      expect(def.kill.keys.length, `${def.id} has targets`).toBeGreaterThan(0);
      expect(def.kill.count, `${def.id} count`).toBeGreaterThan(0);
      expect(def.kill.label, `${def.id} label`).toBeTruthy();
      for (const k of def.kill.keys) {
        expect(ENEMIES[k], `${def.id} target ${k} in ENEMIES`).toBeTruthy();
        expect(cast.has(k), `${def.id} target ${k} spawns in ${def.zone}`).toBe(true);
      }
    }
  });

  it("every giver resolves: town chains to a real hub NPC, overworld chains to a real landmark", () => {
    for (const c of chains) {
      for (const def of c.defs) {
        expect(def.town, `${def.id} scope`).toBe(c.town);
        if (def.poi) {
          expect(def.giver, `${def.id} poi giver kind`).toBe("poi");
          const pois = zoneOf(def.zone)!.layout.pois ?? [];
          const at = pois.find((p) => p.name === def.poi!.at);
          expect(at, `${def.id} landmark "${def.poi.at}" exists in ${def.zone}`).toBeTruthy();
          expect(["landmark", "signpost"]).toContain(at!.kind);
          expect(poiQuestScope(def.zone, def.poi.at), `${def.id} poi hook round-trip`).toBe(c.town);
          expect(questGiver(def).name).toBe(def.poi.giver);
        } else {
          const s = SETTLEMENTS[def.town];
          expect(s, `${def.id} settlement ${def.town}`).toBeTruthy();
          expect(s.npcs.some((n) => n.id === def.giver), `${def.id} giver npc ${def.giver}`).toBe(true);
          const z = zoneOf(def.zone)!;
          expect((z.hubs ?? [z.hub]).includes(def.town), `${def.town} fronts ${def.zone}`).toBe(true);
          expect(questGiver(def).where).toBe(s.name);
        }
      }
    }
  });

  it("every town chain ends on its zone's one-time boss (auto-credit flagged)", () => {
    for (const c of chains) {
      const last = c.defs[c.defs.length - 1];
      if (last.poi) { expect(last.boss, `${last.id} overworld quests never gate on a boss`).toBeFalsy(); continue; }
      expect(last.boss, `${last.id} finale flags boss`).toBe(true);
      expect(last.kill.keys, `${last.id} targets the zone boss`).toContain(zoneOf(last.zone)!.boss);
      expect(last.kill.count, `${last.id} boss count`).toBe(1);
      for (const def of c.defs.slice(0, -1)) expect(def.boss, `${def.id} only the finale is the boss step`).toBeFalsy();
    }
  });

  it("rewards grow within every chain and finales grow across the arc", () => {
    for (const c of chains)
      for (let i = 1; i < c.defs.length; i++) {
        const a = c.defs[i - 1].reward, b = c.defs[i].reward;
        expect(b.aether, `${c.town} step ${i} aether grows`).toBeGreaterThan(a.aether);
        expect(b.gearIlvl, `${c.town} step ${i} ilvl grows`).toBeGreaterThanOrEqual(a.gearIlvl);
        expect(rarityIx(b.gearRarity), `${c.town} step ${i} rarity grows`).toBeGreaterThanOrEqual(rarityIx(a.gearRarity));
      }
    // town-chain finales, in ZONES (arc) order: Aether strictly climbs Greenvale → Sunbridge
    const finales = ZONES.map((z) => chains.find((c) => !c.defs[0].poi && c.defs[0].zone === z.id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => c.defs[c.defs.length - 1].reward);
    expect(finales.length).toBe(ZONES.length); // one town chain per zone
    for (let i = 1; i < finales.length; i++) {
      expect(finales[i].aether).toBeGreaterThan(finales[i - 1].aether);
      expect(finales[i].gearIlvl).toBeGreaterThanOrEqual(finales[i - 1].gearIlvl);
    }
    expect(finales[finales.length - 1].gearRarity).toBe("artifact"); // the siege finale pays the top of the ladder
  });

  it("questGroups puts active chains first and completed chains last", () => {
    const log = emptyQuests();
    accept(log, "dm-vermin"); // Miregard active
    for (const id of ["gv-kobolds", "gv-bandits", "gv-kingpin"]) { accept(log, id); log[id].kills = QUESTS[id].kill.count; turnIn(log, id); } // Hearthford done
    const groups = questGroups(log);
    expect(groups[0].town).toBe("miregard");
    expect(groups[0].state).toBe("active");
    expect(groups[groups.length - 1].town).toBe("hearthford");
    expect(groups[groups.length - 1].state).toBe("done");
    const rank = { active: 0, open: 1, done: 2 } as const;
    for (let i = 1; i < groups.length; i++) expect(rank[groups[i].state]).toBeGreaterThanOrEqual(rank[groups[i - 1].state]);
  });
});
