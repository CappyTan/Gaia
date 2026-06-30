// THE CONTENT REGISTRY ("the database"). A typed query API + cross-reference indexes over the
// data layer (skills, bestiary, classes, zones, items). Pure + static + DOM-free — consumers query
// `DB` instead of reaching into raw consts, which gives one place to see relationships (which zones
// spawn an enemy, which classes use a skill) and a stable seam: Phase 2 can swap the backing data to
// authored JSON without touching any consumer. The raw consts still export for now (non-breaking).
//
// NOTE: `skills.*` reflects the LIVE `SKILLS` map, into which systems/classKit registers the generated
// V3 kit (`v3:*`) abilities at module load (ADR 0020). So the skill query results include those only
// once classKit has been imported (always true in the running app + any test that touches the kit
// system). Don't assert an exact `skills.ids().length`/`ults()` set in a test that doesn't import classKit.

import type { Attunement, EnemyDef, Skill } from "../types";
import { SKILLS } from "./skills";
import { ENEMIES, RARE_MONSTERS } from "./enemies";
import { ZONES } from "./zones";
import { className } from "./classes";
import { SPECS } from "./classSpecs";

/** An enemy def with its registry key folded in (the bestiary row shape). */
export type EnemyRow = EnemyDef & { key: string };

// ── cross-reference indexes (built once at module load) ──
// enemy key -> zone indexes it can appear in (encounter bands + mini/adds/boss + rare pool)
const enemyZones: Record<string, number[]> = {};
const addZone = (k: string, zi: number) => { (enemyZones[k] ||= []).includes(zi) || enemyZones[k].push(zi); };
ZONES.forEach((z, zi) => {
  z.bands.forEach((b) => b.sets.forEach((set) => set.forEach((k) => addZone(k, zi))));
  addZone(z.mini, zi); (z.miniAdds || []).forEach((k) => addZone(k, zi)); addZone(z.boss, zi);
});
RARE_MONSTERS.forEach((r) => r.zones.forEach((zi) => addZone(r.key, zi)));

export const DB = {
  skills: {
    get: (id: string): Skill | undefined => SKILLS[id],
    all: (): Skill[] => Object.values(SKILLS),
    ids: (): string[] => Object.keys(SKILLS),
    byAtt: (att: Attunement): Skill[] => Object.values(SKILLS).filter((s) => s.att === att),
    ults: (): Skill[] => Object.values(SKILLS).filter((s) => s.ult),
  },
  enemies: {
    get: (key: string): EnemyDef | undefined => ENEMIES[key],
    all: (): EnemyRow[] => Object.entries(ENEMIES).map(([key, d]) => ({ key, ...d })),
    keys: (): string[] => Object.keys(ENEMIES),
    byAtt: (att: Attunement): EnemyRow[] => DB.enemies.all().filter((e) => e.att === att),
    bosses: (): EnemyRow[] => DB.enemies.all().filter((e) => e.boss),
    minis: (): EnemyRow[] => DB.enemies.all().filter((e) => e.miniboss),
    rares: (): EnemyRow[] => DB.enemies.all().filter((e) => e.rare),
    /** Zone indexes this enemy can appear in (encounters/mini/boss/rare). */
    zonesOf: (key: string): number[] => enemyZones[key] || [],
    /** All enemies that can appear in a given zone. */
    inZone: (zi: number): EnemyRow[] => DB.enemies.all().filter((e) => (enemyZones[e.key] || []).includes(zi)),
  },
  classes: {
    name: className,
    /** The full 45-class grid (Attunement × Archetype) with each class's 52-slot ability list (by name). */
    all: () => SPECS.map((s) => ({ att: s.att, archetype: s.archetype, name: s.name, kit: s.abilities.map((a) => a.name) })),
  },
  zones: {
    get: (i: number) => ZONES[i],
    all: () => ZONES,
    count: (): number => ZONES.length,
  },
};
