// CLASS-SPEC GENERATOR. Parses the 45 numberless greenfield class design specs
// (docs/design/classes/<attunement>-<archetype>.md — the human design record) into the structured
// `ClassSpec` shape (app/src/data/classSpec.ts) the band→number generator + the live kit system consume.
// Emits app/src/data/classSpecs.generated.ts (committed, NEVER hand-edited — re-run this to regenerate),
// mirroring the requiem-kits.ts / parse-requiem.js pattern. The markdown stays the design record; this
// JSON-shaped TS is the build input (ADR 0020 §3).
//
//   npm run gen:classes           # regenerate classSpecs.generated.ts from the markdown
//   npx tsx app/tools/gen-class-specs.ts
//
// Every STRUCTURAL field (name/tier/lane/milestone/type/target/effect/gen/cost/cd) is parsed
// deterministically from the spec's uniform line grammar (the same grammar class-spec-lint.ts checks).
// The one DERIVED field is `status` (the catalog status an ability APPLIES, ADR 0016): inferred from the
// effect prose via a per-attunement keyword map + an "is this applied vs merely referenced?" heuristic,
// validated to reproduce the hand-encoded Heliomancer (the ground truth) exactly.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SPECS_DIR = join(HERE, "..", "..", "docs", "design", "classes");
const OUT_FILE = join(HERE, "..", "src", "data", "classSpecs.generated.ts");

const ATT_MAP: Record<string, string> = { sol: "SOL", nox: "NOX", anima: "ANIMA", quanta: "QUANTA", umbraxis: "UMBRAXIS" };
const ARCH_MAP: Record<string, string> = {
  "sword-and-shield": "Sword & Shield", "two-handed-sword": "Two-Handed Sword", hammer: "Hammer",
  "dual-swords": "Dual Swords", "dual-daggers": "Dual Daggers", "dual-pistols": "Dual Pistols",
  rifle: "Rifle", staff: "Staff", spellblade: "Spellblade",
};

const SPECIAL_MS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
const SIGNATURE_MS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

type Tier = "auto" | "special" | "signature" | "ultimate" | "passive";
interface Entry {
  name: string; tier: Tier; lane?: string; milestone: number;
  type: string; target: string; effect: string; status?: string;
  gen?: string; cost?: string; cooldown?: string;
}
interface Spec { att: string; archetype: string; name: string; abilities: Entry[]; }

// ── status derivation ───────────────────────────────────────────────────────────────────────────
// Ordered keyword → catalog status (ADR 0016). Only catalog statuses can be applied by the engine, so
// flavor words with no catalog match (Scorched, Brittle, Anchor, rooted, the "Opening") stay untagged.
const STATUS_KEYWORDS: [RegExp, string][] = [
  [/\bburn|\bburning|\bignit/i, "burn"],          // SOL signature
  [/\bblind/i, "blind"],                           // SOL control
  [/\bchill/i, "chill"],                           // NOX
  [/\bfrozen|\bfreeze|\bfreezing/i, "frozen"],     // NOX
  [/\bstasis|\bdecay/i, "decay"],                  // NOX DoT (Stasis = engine `decay`, per the NOX specs)
  [/\binfest|\bpoison|\bvenom|\btoxin/i, "poison"], // ANIMA signature (display "Infestation")
  [/\bdrain|\bsiphon/i, "drain"],                  // UMBRAXIS signature
  [/\bstun/i, "stun"],
  [/\bdoom/i, "doom"],
  [/\bregen/i, "regen"],
  [/\bslow\b/i, "slow"],
  [/\bhaste/i, "haste"],
];
// A keyword hit is a REFERENCE (a condition/target descriptor — "vs a Frozen target", "if Chilled",
// "consumes the Chill"), not an APPLICATION, when one of these sits just before it…
const REF_BEFORE = /(?:\bvs\b|against|bonus vs|\bif\b|already|consum|scaling with|\bwhile\b|\bis\b|\bare\b|\bwas\b)[\s\w/]*$/i;
// …or when it's immediately followed by a target descriptor.
const REF_AFTER = /^[\s/]*(?:target|foe|or\b|brittle|frozen|chilled|low\b|-hp)/i;

/** The catalog status an ability APPLIES (the earliest applied keyword in reading order), or undefined.
 *  Passives are never tagged (their prose names statuses they MODIFY, not apply). */
function deriveStatus(tier: Tier, effect: string): string | undefined {
  if (tier === "passive") return undefined;
  let best: { i: number; status: string } | null = null;
  for (const [re, status] of STATUS_KEYWORDS) {
    const m = re.exec(effect);
    if (!m) continue;
    const i = m.index;
    const before = effect.slice(Math.max(0, i - 24), i);
    const after = effect.slice(i + m[0].length);
    if (REF_BEFORE.test(before) || REF_AFTER.test(after)) continue; // referenced, not applied
    if (!best || i < best.i) best = { i, status };
  }
  return best?.status;
}

// ── parse one spec ────────────────────────────────────────────────────────────────────────────
function foldLines(text: string): string[] {
  const out: string[] = [];
  for (const ln of text.split("\n")) {
    if (/^\s+\S/.test(ln) && out.length && out[out.length - 1].trimStart().startsWith("-")) out[out.length - 1] += " " + ln.trim();
    else out.push(ln);
  }
  return out;
}

// Effects in the specs are lowercase-initial design prose; sentence-case them for the in-game tooltip
// (matching the hand-encoded style) without touching the wording. Status is derived case-insensitively.
const sentence = (s: string): string => {
  const t = s.trim();
  if (!t) return t;
  const head = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?)]$/.test(head) ? head : head + ".";
};

const band = (rest: string, kind: "gen" | "cost"): string | undefined => {
  const m = new RegExp(`\\b${kind}\\s+\\*\\*(\\w+)`, "i").exec(rest);
  return m ? m[1].toLowerCase() : undefined;
};
const cdBand = (rest: string): string | undefined => {
  const m = /\bcd\s+\*\*(\w+)/i.exec(rest);
  return m ? m[1].toLowerCase() : undefined;
};

function parseSpec(file: string, text: string): Spec {
  const slug = basename(file, ".md");
  const dash = slug.indexOf("-");
  const att = ATT_MAP[slug.slice(0, dash)];
  const archetype = ARCH_MAP[slug.slice(dash + 1)];
  const h1 = /^#\s+(.+?)\s+[—-]/m.exec(text);
  const name = h1 ? h1[1].trim() : slug;

  const abilities: Entry[] = [];
  let section: Tier | null = null;
  let ms = 0;
  let ultCost = "high", ultCd = "long"; // ultimates' cost/cd are declared once in the section header

  for (const line of foldLines(text)) {
    const h = /^##\s+(.+)/.exec(line);
    if (h) {
      const t = h[1].toLowerCase();
      section = t.startsWith("auto-attack") ? "auto" : t.startsWith("special skills") ? "special"
        : t.startsWith("signature abilities") ? "signature" : t.startsWith("ultimates") ? "ultimate"
        : t.startsWith("passives") ? "passive" : null;
      ms = section === "ultimate" ? 100 : 0;
      if (section === "ultimate") { ultCost = band(h[1], "cost") ?? "high"; ultCd = cdBand(h[1]) ?? "long"; }
      continue;
    }
    // milestone / passive-set marker (also carries the inline-passive form some staff specs use)
    const mile = /^\*\*(?:Set\s+)?@\s*(?:MNA\s+)?(\d+)\*\*/.exec(line);
    if (mile) {
      ms = Number(mile[1]);
      if (section === "passive") for (const m of line.matchAll(/\b([A-C])\s+·\s+\*\*(.+?)\*\*\s*\*\((.+?)\)\*/g))
        abilities.push({ name: m[2].trim(), tier: "passive", lane: m[1], milestone: ms, type: "util", target: "self", effect: sentence(m[3].trim()) });
      continue;
    }
    if (!section) continue;
    const b = /^-\s+\*\*(.+?)\*\*(.*)$/.exec(line);
    if (!b) continue;
    const boldRaw = b[1].trim();
    const laneM = /^([A-C])\s+·\s+(.+)$/.exec(boldRaw);
    const lane = laneM ? laneM[1] : undefined;
    const name2 = (laneM ? laneM[2] : boldRaw).trim();
    const rest = b[2];
    const fields = rest.split(/\s·\s/).map((s) => s.trim()).filter(Boolean); // drop the leading empty (rest starts " · …")
    const stripItalic = (s: string) => s.replace(/^\*+|\*+$/g, "").trim();

    if (section === "passive") {
      // block form: "- **L · Name** · *effect* · `proposed`"
      const eff = fields.find((f) => f.startsWith("*") && !f.startsWith("**") && !/^\*\(/.test(f));
      abilities.push({ name: name2, tier: "passive", lane, milestone: ms, type: "util", target: "self", effect: eff ? sentence(stripItalic(eff)) : "" });
      continue;
    }
    if (section === "ultimate") {
      // "- **[L · ]Name** *(LaneLabel)* · target · *effect*" — type derived later; cost/cd from header
      const target = fields.find((f) => /^(enemy|allEnemies|ally|allAllies|self)$/.test(f)) ?? "enemy";
      const eff = fields.find((f) => f.startsWith("*") && !/^\*\(/.test(f) && !f.startsWith("**"));
      const effText = eff ? sentence(stripItalic(eff)) : "";
      const u: Entry = { name: name2, tier: "ultimate", lane, milestone: 100, type: "mag", target, effect: effText, cost: ultCost, cooldown: ultCd };
      const ust = deriveStatus("ultimate", effText); if (ust) u.status = ust;
      abilities.push(u);
      continue;
    }
    // auto / special / signature: "- **[L · ]Name** · type · target · *effect* · gen|cost **band** · cd **band**"
    const type = (fields[0] || "").toLowerCase();
    const target = fields[1] || "enemy";
    const eff = fields[2] ? sentence(stripItalic(fields[2])) : "";
    const e: Entry = { name: name2, tier: section, lane, milestone: section === "auto" ? 0 : ms, type, target, effect: eff };
    const st = deriveStatus(section, eff); if (st) e.status = st;
    if (section === "auto" || section === "special") e.gen = band(rest, "gen") ?? "none";
    if (section === "signature") e.cost = band(rest, "cost") ?? "none";
    e.cooldown = cdBand(rest) ?? "none";
    abilities.push(e);
  }

  // Ultimate type = the modal damaging type (phys/mag) of the class's specials+signatures (caster→mag,
  // martial→phys) — the markdown ult line carries no type. Matches the hand-encoded Heliomancer (mag).
  const dmg = abilities.filter((a) => (a.tier === "special" || a.tier === "signature") && (a.type === "phys" || a.type === "mag"));
  const physN = dmg.filter((a) => a.type === "phys").length;
  const ultType = physN > dmg.length - physN ? "phys" : "mag";
  for (const a of abilities) if (a.tier === "ultimate") a.type = ultType;

  return { att, archetype, name, abilities };
}

// ── emit ───────────────────────────────────────────────────────────────────────────────────────
const q = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
function emitEntry(e: Entry): string {
  const parts = [`name: ${q(e.name)}`, `tier: ${q(e.tier)}`];
  if (e.lane) parts.push(`lane: ${q(e.lane)}`);
  parts.push(`milestone: ${e.milestone}`, `type: ${q(e.type)}`, `target: ${q(e.target)}`, `effect: ${q(e.effect)}`);
  if (e.status) parts.push(`status: ${q(e.status)}`);
  if (e.gen != null) parts.push(`gen: ${q(e.gen)}`);
  if (e.cost != null) parts.push(`cost: ${q(e.cost)}`);
  if (e.cooldown != null) parts.push(`cooldown: ${q(e.cooldown)}`);
  return `    { ${parts.join(", ")} },`;
}
function emitSpec(s: Spec): string {
  return `  {\n    att: ${q(s.att)}, archetype: ${q(s.archetype)}, name: ${q(s.name)},\n    abilities: [\n${s.abilities.map(emitEntry).join("\n")}\n    ],\n  },`;
}

function isSpec(f: string): boolean { return f.endsWith(".md") && f !== "README.md" && f !== "ROSTER.md" && !f.endsWith("-family.md"); }

function main(): void {
  const files = readdirSync(SPECS_DIR).filter(isSpec).sort();
  const specs = files.map((f) => parseSpec(f, readFileSync(join(SPECS_DIR, f), "utf8")));
  const header = `// AUTO-GENERATED by app/tools/gen-class-specs.ts from docs/design/classes/*.md — DO NOT EDIT.\n` +
    `// Re-run \`npm run gen:classes\` to regenerate. The markdown specs are the human design record; this\n` +
    `// is the structured build input the band→number generator (systems/classGen) + the live kit system\n` +
    `// (systems/classKit) consume. ${specs.length} classes (5 Attunements × 9 Weapon Archetypes).\n\n` +
    `import type { ClassSpec } from "./classSpec";\n\n` +
    `export const GENERATED_SPECS: ClassSpec[] = [\n`;
  writeFileSync(OUT_FILE, header + specs.map(emitSpec).join("\n") + "\n];\n");
  // brief report
  const counts = specs.map((s) => `${s.att} ${s.archetype} (${s.name}): ${s.abilities.length}`);
  console.log(`Generated ${specs.length} specs → ${OUT_FILE}`);
  const bad = specs.filter((s) => s.abilities.length !== 52);
  if (bad.length) { console.error("✗ specs not at 52 entries:", bad.map((s) => `${s.att} ${s.archetype}=${s.abilities.length}`)); process.exit(1); }
  console.log(counts.slice(0, 5).join("\n"), `\n… (${specs.length} total, all 52 entries)`);
}

main();
