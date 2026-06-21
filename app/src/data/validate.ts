// Content integrity checks ("schema validation" for the database). Catches the mistakes that are
// easy to make when authoring/tweaking content — a kit pointing at a missing skill, a zone spawning
// an enemy key that doesn't exist, a broken art reference, the 45-kit distinctness invariant. Run in
// the test suite (must return []) and as a dev-startup assert; this is the safety net that lets Dara
// (or an agent) tweak data without silently breaking the game.

import { DB } from "./db";
import { SKILLS } from "./skills";
import { ENEMIES } from "./enemies";
import { ZONES } from "./zones";
import { RARITY } from "./rarity";
import { ATTUNEMENTS } from "../types";
import { ARCHETYPE_KEYS } from "./party";
import { kitFor } from "./classes";

/** Returns a list of content problems; empty array = content is internally consistent. */
export function validateContent(): string[] {
  const issues: string[] = [];

  // every class kit references real skills, and carries exactly one ultimate at the top
  for (const att of ATTUNEMENTS) for (const arch of ARCHETYPE_KEYS) {
    const kit = kitFor(att, arch) || [];
    if (!kit.length) { issues.push(`kit ${att} ${arch}: empty`); continue; }
    kit.forEach((k) => { if (!SKILLS[k]) issues.push(`kit ${att} ${arch}: missing skill "${k}"`); });
    const ults = kit.filter((k) => SKILLS[k]?.ult).length;
    if (ults !== 1) issues.push(`kit ${att} ${arch}: expected 1 ultimate, found ${ults}`);
  }

  // all 45 classes resolve to distinct kits (no accidental shared placeholder)
  const distinct = new Set(ATTUNEMENTS.flatMap((att) => ARCHETYPE_KEYS.map((arch) => JSON.stringify(kitFor(att, arch)))));
  if (distinct.size !== ATTUNEMENTS.length * ARCHETYPE_KEYS.length)
    issues.push(`expected ${ATTUNEMENTS.length * ARCHETYPE_KEYS.length} distinct kits, got ${distinct.size}`);

  // every enemy referenced by a zone (encounters/mini/adds/boss) exists
  ZONES.forEach((z, zi) => {
    const refs = new Set<string>();
    z.bands.forEach((b) => b.sets.forEach((s) => { if (!s.length) issues.push(`zone ${zi} "${z.name}": empty encounter set`); s.forEach((k) => refs.add(k)); }));
    refs.add(z.mini); (z.miniAdds || []).forEach((k) => refs.add(k)); refs.add(z.boss);
    if (z.dungeon.floorMini) refs.add(z.dungeon.floorMini); // multi-floor in-dungeon lieutenant (Bandit Warren)
    refs.forEach((k) => { if (!ENEMIES[k]) issues.push(`zone ${zi} "${z.name}": missing enemy "${k}"`); });
    if (!ENEMIES[z.boss]?.boss) issues.push(`zone ${zi} "${z.name}": boss "${z.boss}" is not flagged boss`);
  });

  // enemy sanity: art refs point at a real enemy sprite key; stats are positive
  DB.enemies.all().forEach((e) => {
    if (e.art && !ENEMIES[e.art]) issues.push(`enemy ${e.key}: art ref "${e.art}" is not an enemy key`);
    if (e.hp <= 0 || e.atk < 0) issues.push(`enemy ${e.key}: nonsensical hp/atk (${e.hp}/${e.atk})`);
    if (!ATTUNEMENTS.includes(e.att)) issues.push(`enemy ${e.key}: bad attunement "${e.att}"`);
  });

  // rarity ladder is the expected 6 rungs with non-decreasing affix counts
  if (RARITY.length !== 6) issues.push(`expected 6 rarities, got ${RARITY.length}`);
  RARITY.forEach((r, i) => { if (i && r.affixes < RARITY[i - 1].affixes) issues.push(`rarity ${r.key}: affix count drops below ${RARITY[i - 1].key}`); });

  return issues;
}
