// Content integrity checks ("schema validation" for the database). Catches the mistakes that are
// easy to make when authoring/tweaking content — a kit pointing at a missing skill, a zone spawning
// an enemy key that doesn't exist, a broken art reference, the 45-kit distinctness invariant. Run in
// the test suite (must return []) and as a dev-startup assert; this is the safety net that lets Dara
// (or an agent) tweak data without silently breaking the game.

import { DB } from "./db";
import { ENEMIES, RARE_MONSTERS } from "./enemies";
import { ZONES } from "./zones";
import { RARITY } from "./rarity";
import { BARRIERS, MAPS } from "./world";
import { MATERIALS, GATHER_NODES, ENEMY_MAT_FAMILY, FAMILY_MATS } from "./materials";
import { CONSUMABLES } from "./consumables";
import { ATTUNEMENTS } from "../types";

// Class kits are no longer authored here: every class is the V3 choice-system kit derived from its
// 52-slot spec (data/classSpecs), whose structural invariants are gated by the class-spec linter
// (`npm run lint:classes`, vitest-gated) — so there is no kit-integrity check to run in this net.

/** Returns a list of content problems; empty array = content is internally consistent. */
export function validateContent(): string[] {
  const issues: string[] = [];

  // every enemy referenced by a zone (encounters/mini/adds/boss) exists
  ZONES.forEach((z, zi) => {
    const refs = new Set<string>();
    z.bands.forEach((b) => b.sets.forEach((s) => { if (!s.length) issues.push(`zone ${zi} "${z.name}": empty encounter set`); s.forEach((k) => refs.add(k)); }));
    refs.add(z.mini); (z.miniAdds || []).forEach((k) => refs.add(k)); refs.add(z.boss);
    if (z.dungeon.floorMini) refs.add(z.dungeon.floorMini); // multi-floor in-dungeon lieutenant (Bandit Warren)
    // SECOND DUNGEON (wave3b — the Ancient Ruins): its bands/floorMini feed the same enemy net, and the
    // entrance↔dungeon pairing must hold both ways (an entrance with no dungeon is a dead tile; a
    // dungeon with no entrance is unreachable content). A dungeon2 is BOSSLESS by contract, so its last
    // floor must carry the `seal` terminus genDungeon carves instead of a boss.
    if (z.dungeon2) {
      (z.dungeon2.bands ?? []).forEach((b) => b.sets.forEach((s) => { if (!s.length) issues.push(`zone ${zi} "${z.name}": empty dungeon2 encounter set`); s.forEach((k) => refs.add(k)); }));
      if (z.dungeon2.floorMini) refs.add(z.dungeon2.floorMini);
      if (!z.layout.ruins) issues.push(`zone ${zi} "${z.name}": dungeon2 "${z.dungeon2.name}" has no layout.ruins entrance`);
      const fl2 = z.dungeon2.floors && z.dungeon2.floors.length ? z.dungeon2.floors : [z.dungeon2.layout];
      if (z.dungeon2.floors?.length && z.dungeon2.layout !== z.dungeon2.floors[0]) issues.push(`zone ${zi} "${z.name}": dungeon2 layout !== floors[0] (the single-floor contract)`);
      if (!fl2[fl2.length - 1].seal) issues.push(`zone ${zi} "${z.name}": dungeon2 "${z.dungeon2.name}" last floor has no seal terminus (a bossless dungeon must end at the sealed door)`);
    } else if (z.layout.ruins) {
      issues.push(`zone ${zi} "${z.name}": layout.ruins entrance with no dungeon2 to descend into`);
    }
    refs.forEach((k) => { if (!ENEMIES[k]) issues.push(`zone ${zi} "${z.name}": missing enemy "${k}"`); });
    if (!ENEMIES[z.boss]?.boss) issues.push(`zone ${zi} "${z.name}": boss "${z.boss}" is not flagged boss`);
  });

  // enemy sanity: art refs point at a real enemy sprite key; stats are positive
  DB.enemies.all().forEach((e) => {
    if (e.art && !ENEMIES[e.art]) issues.push(`enemy ${e.key}: art ref "${e.art}" is not an enemy key`);
    if (e.lvl <= 0) issues.push(`enemy ${e.key}: nonsensical level (${e.lvl})`); // V3: stats derive from role+lvl
    if (!ATTUNEMENTS.includes(e.att)) issues.push(`enemy ${e.key}: bad attunement "${e.att}"`);
  });

  // ultra-rare treasure monsters: each key is a real enemy and each zone index is in range (db.ts +
  // field.ts consume r.key / r.zones — a typo'd key or stray index would silently drop the rare).
  RARE_MONSTERS.forEach((r) => {
    if (!ENEMIES[r.key]) issues.push(`rare monster "${r.key}": not an enemy key`);
    r.zones.forEach((zi) => { if (zi < 0 || zi >= ZONES.length) issues.push(`rare monster "${r.key}": zone index ${zi} out of range (0..${ZONES.length - 1})`); });
  });

  // traversal barriers (ADR 0011): each points at a real map, and declares a band + a crossing (a
  // band with no crossing would be an uncrossable wall; the cap is type-checked by Capability).
  const mapIds = new Set(MAPS.map((m) => m.id));
  BARRIERS.forEach((bar) => {
    if (!mapIds.has(bar.map)) issues.push(`barrier "${bar.id}": map "${bar.map}" is not a known map`);
    if (!bar.band.length) issues.push(`barrier "${bar.id}": empty band`);
    if (!bar.crossing.length) issues.push(`barrier "${bar.id}": no crossing tiles (uncrossable)`);
  });

  // rarity ladder is the expected 6 rungs with non-decreasing affix counts
  if (RARITY.length !== 6) issues.push(`expected 6 rarities, got ${RARITY.length}`);
  RARITY.forEach((r, i) => { if (i && r.affixes < RARITY[i - 1].affixes) issues.push(`rarity ${r.key}: affix count drops below ${RARITY[i - 1].key}`); });

  // CRAFTING (the slice): every consumable recipe ingredient, gather-node yield, and family-drop
  // material is a real MATERIALS id; every enemy-family mapping points at a real bestiary key; every
  // authored gathering node uses a known kind and sits inside its zone's grid. A typo'd id would
  // silently drop a drop / brick a recipe — this net catches it at authoring time.
  Object.values(CONSUMABLES).forEach((c) => {
    Object.keys(c.recipe).forEach((id) => { if (!MATERIALS[id]) issues.push(`consumable ${c.id}: recipe ingredient "${id}" is not a material`); });
    if (c.fee < 0) issues.push(`consumable ${c.id}: negative craft fee`);
  });
  Object.values(GATHER_NODES).forEach((n) => {
    if (!MATERIALS[n.base]) issues.push(`gather node ${n.kind}: base yield "${n.base}" is not a material`);
    if (!MATERIALS[n.rare]) issues.push(`gather node ${n.kind}: rare yield "${n.rare}" is not a material`);
  });
  // (enrage-omega identities — e.g. "kingpin-omega" — are legitimate fallen-enemy keys without a
  // bestiary row of their own, exactly as data/quests references them.)
  const omegaKeys = new Set(Object.values(ENEMIES).map((e) => e.enrage?.omega).filter(Boolean));
  Object.keys(ENEMY_MAT_FAMILY).forEach((k) => { if (!ENEMIES[k] && !omegaKeys.has(k)) issues.push(`material drop family: "${k}" is not an enemy key`); });
  Object.entries(FAMILY_MATS).forEach(([fam, ids]) => ids.forEach((id) => { if (!MATERIALS[id]) issues.push(`material family ${fam}: "${id}" is not a material`); }));
  ZONES.forEach((z, zi) => (z.layout.nodes ?? []).forEach((n) => {
    if (!GATHER_NODES[n.kind]) issues.push(`zone ${zi} "${z.name}": gathering node has unknown kind "${n.kind}"`);
    if (n.x <= 0 || n.y <= 0 || n.x >= z.layout.w - 1 || n.y >= z.layout.h - 1) issues.push(`zone ${zi} "${z.name}": gathering node (${n.x},${n.y}) is out of the grid interior`);
  }));

  return issues;
}
