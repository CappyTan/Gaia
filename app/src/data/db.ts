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
import { ATTUNEMENTS } from "../types";
import { SKILLS } from "./skills";
import { ENEMIES, RARE_MONSTERS } from "./enemies";
import { ZONES } from "./zones";
import { kitFor, className } from "./classes";
import { ARCHETYPE_KEYS } from "./party";

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

// skill key -> the class labels ("ATT Archetype") whose kit includes it
const skillClasses: Record<string, string[]> = {};
for (const att of ATTUNEMENTS) for (const arch of ARCHETYPE_KEYS)
  (kitFor(att, arch) || []).forEach((k) => { (skillClasses[k] ||= []).push(`${att} ${arch}`); });

export const DB = {
  skills: {
    get: (id: string): Skill | undefined => SKILLS[id],
    all: (): Skill[] => Object.values(SKILLS),
    ids: (): string[] => Object.keys(SKILLS),
    byAtt: (att: Attunement): Skill[] => Object.values(SKILLS).filter((s) => s.att === att),
    ults: (): Skill[] => Object.values(SKILLS).filter((s) => s.ult),
    /** Which classes (Attunement × Archetype) include this skill in their kit. */
    usedBy: (id: string): string[] => skillClasses[id] || [],
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
    kit: kitFor,
    name: className,
    /** The full 45-class grid with each class's resolved kit. */
    all: () => ATTUNEMENTS.flatMap((att) =>
      ARCHETYPE_KEYS.map((arch) => ({ att, archetype: arch, name: className(att, arch), kit: kitFor(att, arch) || [] }))),
  },
  zones: {
    get: (i: number) => ZONES[i],
    all: () => ZONES,
    count: (): number => ZONES.length,
  },
};
