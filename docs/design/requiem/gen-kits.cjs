#!/usr/bin/env node
// gen-kits.js — generate game ability kits for the REQUIEM classes that aren't hand-authored yet.
// Reads classes.json (Dara's canon) and emits app/src/data/requiem-kits.ts: a Skill per BASIC/
// SIGNATURE/ULTIMATE ability (PASSIVE is skipped — the engine has no passive slot yet) plus a
// KITS map (Attunement × Archetype -> skill keys). The 8 hand-tuned SOL/NOX kits (S&S, Dual
// Swords, Staff, Spellblade) are skipped so they stay as-is. Mechanics (type/power/mp/mnaReq/
// status/target) are inferred heuristically from each ability's description; names are canon.
// Re-run after editing classes.json:  node docs/design/requiem/gen-kits.js
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");
const canon = JSON.parse(fs.readFileSync(path.join(__dirname, "classes.json"), "utf8")).classes;

const ATT = { sol: "SOL", nox: "NOX", anima: "ANIMA", quanta: "QUANTA", umbraxis: "UMBRAXIS" };
const ARCH = {
  "sword & shield": "Sword & Shield", "dual swords": "Dual Swords", "two-handed sword": "Two-Handed Sword",
  "hammer": "Hammer", "dual daggers": "Dual Daggers", "dual pistols": "Dual Pistols",
  "rifle": "Rifle", "staff": "Staff", "spellblade": "Spellblade",
};
const SIG = { SOL: "burn", NOX: "decay", ANIMA: "poison", QUANTA: "", UMBRAXIS: "drain" };
// the 8 hand-authored kits to skip (kept in classes.ts/skills.ts)
const SKIP = new Set(["SOL|Sword & Shield", "SOL|Dual Swords", "SOL|Staff", "SOL|Spellblade",
                      "NOX|Sword & Shield", "NOX|Dual Swords", "NOX|Staff", "NOX|Spellblade"]);
const MAGE = new Set(["Staff", "Spellblade"]);

const has = (s, re) => re.test(s);
function classify(desc, att, arch, tier) {
  const d = desc.toLowerCase();
  // strong attack verbs (avoid weak/ambiguous ones like "swing/fire/round" that appear in flavor)
  const dmgWord = /damage|strikes?|slash|slam|pierce|stab|\bshot|smite|cleave|execution|blast|bolt|nova|crush|barrage|volley|impale|gore|hammer down|rend/;
  const isDmg = has(d, dmgWord);
  const isHeal = has(d, /heal|restore .*hp|regrowth|revives?|\bmend|vital energy|restores? .*health/);
  const healParty = has(d, /heals .*(party|all allies|everyone)|fully heal|entire party|heals all|party .*heal/);
  const isCleanse = !isDmg && has(d, /cleanse|dispel|remove .*(debuff|negative|status)/);
  // PRIMARY effect: a dedicated party-heal wins; otherwise an attack wins over incidental
  // heal/buff side-effects (the engine resolves one effect per ability).
  let type;
  if (healParty) type = "heal";
  else if (isDmg) type = MAGE.has(arch) || has(d, /blast|bolt|nova|beam|void|cosmic|energy|spell|arcane|magic|radiant|\blight|pulse of|wave of/) ? "mag" : "phys";
  else if (isHeal) type = "heal";
  else if (isCleanse) type = "util";
  else type = "buff";
  // TARGET — constrained to be valid for the chosen type (never damage an ally / heal an enemy).
  const aoeE = has(d, /all enemies|all foes|each enemy|every enemy|all targets|battlefield|enemy row|multiple enemies|up to \d+ .*(enemies|targets)|\d+ (frontline )?enemies|all in the/);
  const aoeA = has(d, /entire party|all allies|whole party|party (is|for|gains|are|fully)|each ally|the (entire )?party|to all allies/);
  let target;
  if (type === "phys" || type === "mag") target = aoeE ? "allEnemies" : "enemy";
  else if (type === "heal") target = aoeA ? "allAllies" : (has(d, /lowest|\ban ally|single ally|one ally|target ally/) ? "ally" : "allAllies");
  else if (type === "util") target = aoeA ? "allAllies" : "ally";
  else target = (aoeA || has(d, /allies|party/)) ? "allAllies" : "self";
  const out = { type, target, mp: 0, status: null, power: 1, hits: 1, crit: 0, sol: false, buff: null, cleanse: type === "util" };
  // tier scaling
  const T = tier === "ULTIMATE" ? 2 : tier === "SIGNATURE" ? 1 : 0;
  out.mp = [5, 13, 23][T] + (out.type === "heal" || out.type === "buff" ? 0 : 1);
  if (out.type === "phys" || out.type === "mag") {
    const aoe = out.target === "allEnemies";
    out.power = aoe ? [1.0, 1.3, 1.7][T] : [1.2, 2.2, 3.3][T];
    // multi-hit
    if (has(d, /twice|double|two (strikes|hits|stabs)|2 (hits|strikes)|per (node|stack|charge)|each (node|stack)|flurry|rapid|multiple|barrage|volley|three|3 (hits|strikes)/)) {
      out.hits = has(d, /three|3 |per node|barrage|volley/) ? 3 : 2; out.power = +(out.power / out.hits * 1.15).toFixed(2);
    }
    if (att === "SOL") out.sol = true;
    if (att === "QUANTA") out.crit = T === 2 ? 50 : T === 1 ? 30 : 20;
    if (has(d, /crit/)) out.crit = Math.max(out.crit, T === 2 ? 50 : 30);
    // status: explicit keyword, else attunement signature on signature/ultimate hits
    const st = statusFrom(d);
    if (st) out.status = st;
    else if (T >= 1 && SIG[att]) out.status = { [SIG[att]]: T === 2 ? 3 : 2 };
  } else if (out.type === "heal") {
    const aoe = out.target === "allAllies";
    out.power = aoe ? [0.9, 1.0, 1.5][T] : [1.4, 1.6, 1.8][T];
    if (has(d, /regen|regrowth|over time|lasting/)) out.status = { regen: 3 };
  } else if (out.type === "buff") {
    const turns = 3;
    if (has(d, /taunt|barrier|shield|aegis|\+.*armor|\+.*def|guard|bastion|wall|fortif/)) out.buff = { wardArmor: T === 2 ? 14 : T === 1 ? 10 : 6, turns };
    else if (has(d, /\+.*atk|empower|enrage|rage|power up|berserk|damage \+|fury/)) out.buff = { atkup: 1, turns };
    else if (has(d, /\bguard\b|brace|defend|reduce.*damage/)) out.buff = { def: 1 };
    else out.buff = { atkup: 1, turns }; // generic offensive buff
  }
  return out;
}
function statusFrom(d) {
  if (has(d, /\bstun|stunned|cannot act|incapacitat/)) return { stun: 1 };
  if (has(d, /\bburn|burning|ignite|scorch|incinerat/)) return { burn: 2 };
  if (has(d, /blind|sunblind|accuracy|hit chance|miss/)) return { blind: 3 };
  if (has(d, /poison|toxic|venom|infest|bleed/)) return { poison: 3 };
  if (has(d, /decay|frostbite|brittle|chill|freeze|frozen|rime/)) return { decay: 2 };
  if (has(d, /drain|siphon|leech|consume .*(hp|life)|absorb/)) return { drain: 2 };
  return null;
}
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const archSlug = (a) => ARCH[a].toLowerCase().replace(/[^a-z]+/g, "");

const SKILLS = {}, KITS = {}, NAMES = {};
for (const c of canon) {
  const att = ATT[c.attunement.toLowerCase()], arch = ARCH[c.archetype.toLowerCase()];
  if (!att || !arch) continue;
  (NAMES[att] ||= {})[arch] = c.name; // canon class name for ALL 45
  if (SKIP.has(`${att}|${arch}`)) continue;
  const abils = c.abilities.filter((a) => a.type !== "PASSIVE").slice(0, 6);
  // ensure exactly one ultimate (last); if none flagged, mark the last as ultimate
  const keys = [];
  let basicN = 0;
  const ultIdx = abils.map((a) => a.type).lastIndexOf("ULTIMATE");
  abils.forEach((a, i) => {
    const tier = i === (ultIdx >= 0 ? ultIdx : abils.length - 1) ? "ULTIMATE" : a.type === "SIGNATURE" ? "SIGNATURE" : "BASIC";
    const m = classify(a.desc, att, arch, tier);
    const key = `${att.toLowerCase()}_${archSlug(c.archetype.toLowerCase())}_${i}`;
    let req;
    if (tier === "ULTIMATE") req = 100;
    else if (tier === "SIGNATURE") req = basicN >= 3 ? 65 : 45;
    else { req = [0, 10, 20, 30][basicN] ?? 30; basicN++; }
    const sk = { name: a.name, mp: m.mp, target: m.target, att, mnaReq: req, type: m.type, desc: a.desc.replace(/\s+/g, " ").trim().slice(0, 140) };
    if (tier === "ULTIMATE") sk.ult = true;
    if (m.type === "phys" || m.type === "mag") { sk.power = m.power; if (m.hits > 1) sk.hits = m.hits; if (m.sol) sk.sol = true; if (m.crit) sk.crit = m.crit; if (m.status) sk.status = m.status; }
    else if (m.type === "heal") { sk.power = m.power; if (m.status) sk.status = m.status; }
    else if (m.type === "buff") sk.buff = m.buff;
    else if (m.type === "util") sk.cleanse = true;
    SKILLS[key] = sk; keys.push(key);
  });
  (KITS[att] ||= {})[arch] = keys;
}

// emit TS
const j = (o) => JSON.stringify(o);
let out = `// AUTO-GENERATED by docs/design/requiem/gen-kits.js from classes.json — do not hand-edit.
// Canon-named ability kits for the REQUIEM classes not hand-authored in skills.ts/classes.ts
// (everything except the 8 SOL/NOX S&S·Dual·Staff·Spellblade kits). Mechanics are heuristic
// adaptations of the canon descriptions — reconcile/balance as needed.
import type { Skill, Attunement } from "../types";\n\n`;
out += `export const REQUIEM_SKILLS: Record<string, Skill> = {\n`;
for (const [k, s] of Object.entries(SKILLS)) out += `  ${k}: ${j(s)},\n`;
out += `};\n\nexport const REQUIEM_KITS: Partial<Record<Attunement, Record<string, string[]>>> = {\n`;
for (const [att, m] of Object.entries(KITS)) {
  out += `  ${att}: {\n`;
  for (const [arch, ks] of Object.entries(m)) out += `    ${j(arch)}: ${j(ks)},\n`;
  out += `  },\n`;
}
out += `};\n\nexport const REQUIEM_CLASS_NAMES: Partial<Record<Attunement, Record<string, string>>> = {\n`;
for (const [att, m] of Object.entries(NAMES)) out += `  ${att}: ${j(m)},\n`;
out += `};\n`;
fs.writeFileSync(path.join(ROOT, "app", "src", "data", "requiem-kits.ts"), out);
console.log(`generated ${Object.keys(SKILLS).length} skills across ${Object.values(KITS).reduce((n, m) => n + Object.keys(m).length, 0)} classes`);
