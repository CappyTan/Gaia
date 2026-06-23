// Headless DUNGEON FLOOR TOPOLOGY dumper. Imports the SHIPPING analyzer (systems/dungeonTopology) and
// the authored content (data/zones) — no DOM. Prints an ASCII map + a rubric-keyed metrics summary for
// any dungeon floor, so the level-designer / level-design-reviewer agents can SEE a floor and grade it
// against the dungeon-design skill without mentally simulating genDungeon.
//
//   npm run map                  # every dungeon, every floor (overview)
//   npm run map greenvale        # all floors of one zone (by id or index)
//   npm run map greenvale 2      # one specific floor (0-based: B3 = floor 2)
//   npx tsx app/tools/dungeon-map.ts duskmarsh
//
// Read the output top-to-bottom: the MESH/CORRIDOR verdict, soft-lock safety, the gate-pinch verdict,
// rest/loop/shortcut presence, then the room graph — each maps onto a dungeon-design SKILL.md check.

import { ZONES, type DungeonLayout } from "../src/data/zones";
import { floorTopology, renderTopology } from "../src/systems/dungeonTopology";

// The floor stack for a zone's dungeon (mirrors Field.dungeonFloors): authored `floors` if multi-floor,
// else a 1-element stack of the single `layout`.
function floorsOf(zoneIndex: number): DungeonLayout[] {
  const d = ZONES[zoneIndex].dungeon;
  return d.floors && d.floors.length ? d.floors : [d.layout];
}

function resolveZone(arg?: string): number[] {
  if (!arg) return ZONES.map((_, i) => i);
  const byIndex = Number(arg);
  if (!Number.isNaN(byIndex) && byIndex >= 0 && byIndex < ZONES.length) return [byIndex];
  const i = ZONES.findIndex((z) => z.id.toLowerCase() === arg.toLowerCase() || z.name.toLowerCase().includes(arg.toLowerCase()));
  if (i < 0) { console.error(`No zone matching "${arg}". Zones: ${ZONES.map((z, k) => `${k}:${z.id}`).join(", ")}`); process.exit(1); }
  return [i];
}

const [, , zoneArg, floorArg] = process.argv;
const zoneIdxs = resolveZone(zoneArg);
const onlyFloor = floorArg != null ? Number(floorArg) : null;

for (const zi of zoneIdxs) {
  const z = ZONES[zi];
  const floors = floorsOf(zi);
  console.log(`\n████ ${z.name}  (zone ${zi} · "${z.id}") — ${z.dungeon.name} · ${floors.length} floor(s) ████`);
  floors.forEach((D, fi) => {
    if (onlyFloor != null && fi !== onlyFloor) return;
    const t = floorTopology(D, { zone: z.dungeon.name, floorIndex: fi, floorCount: floors.length });
    console.log("\n" + renderTopology(t));
  });
}
