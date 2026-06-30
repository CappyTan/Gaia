// Headless CLASS-SPEC LINTER. Deterministically checks the greenfield class design specs
// (docs/design/classes/<attunement>-<archetype>.md) against the MECHANICAL subset of the Class
// System Model's hard invariants (docs/design/classes/README.md). This is Lens 1 of the
// class-spec-review rubric — the part a script nails and an LLM reading specs one-at-a-time drifts
// on (counts, milestone thresholds, economy one-way, and GLOBAL ability-name uniqueness across all
// specs). The judgment lenses (attunement-mechanics fidelity, lane quality, distinctness, …) stay
// with the class-spec-reviewer agent.
//
//   npm run lint:classes          # lint every spec, print a per-spec table + roster name sweep
//   npx tsx app/tools/class-spec-lint.ts
//
// Exit code is non-zero if any BLOCKING finding exists, so `npm test` (via the vitest wrapper) gates
// on it. `*-family.md` and `README.md` are not class specs and are skipped.

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

// Repo-root docs dir, resolved from this file (app/tools/ → ../../docs/design/classes).
export const SPECS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "docs", "design", "classes");

const TYPE_ENUM = ["phys", "mag", "heal", "buff", "util", "passive"] as const;
const SPECIAL_MS = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
const SIGNATURE_MS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const PASSIVE_MS = [30, 60, 90];
const LANES = ["A", "B", "C"] as const;

export type Severity = "Blocking" | "Should-fix";
export interface Finding { spec: string; severity: Severity; lens: string; msg: string; }

type Section = "auto" | "special" | "signature" | "ultimate" | "passive" | null;

interface Entry { lane: string | null; name: string; type?: string; ms?: number; raw: string; }
interface Parsed {
  spec: string;
  auto: Entry[];
  special: Entry[];      // each carries its milestone
  signature: Entry[];
  ultimate: Entry[];
  passive: Entry[];
  specialPairs: Map<number, string>;   // milestone → declared lane-pair (e.g. "A/B")
  signaturePairs: Map<number, string>;
  hasProvenance: boolean;
}

// ── parse one spec ────────────────────────────────────────────────────────────────────────────
// Tolerant, section-aware. Section is set by `## <Header…>` prefix; milestone by `**@ MNA N**`
// (specials/signatures) or `**Set @ MNA N**` (passives); entries are `- **[L · ]Name** · …` bullets.
function parseSpec(spec: string, text: string): Parsed {
  const p: Parsed = {
    spec, auto: [], special: [], signature: [], ultimate: [], passive: [],
    specialPairs: new Map(), signaturePairs: new Map(), hasProvenance: /provenance|from-brief|proposed/i.test(text),
  };
  let section: Section = null;
  let ms = 0;

  // Fold soft-wrapped continuation lines (leading whitespace) back into their list item, so an
  // entry's full text — incl. a gen/cost annotation that wrapped to the next line — is on one line.
  const folded: string[] = [];
  for (const ln of text.split("\n")) {
    if (/^\s+\S/.test(ln) && folded.length && folded[folded.length - 1].trimStart().startsWith("-")) {
      folded[folded.length - 1] += " " + ln.trim();
    } else folded.push(ln);
  }

  for (const line of folded) {
    const h = /^##\s+(.+)/.exec(line);
    if (h) {
      const t = h[1].toLowerCase();
      section = t.startsWith("auto-attack") ? "auto"
        : t.startsWith("special skills") ? "special"
        : t.startsWith("signature abilities") ? "signature"
        : t.startsWith("ultimates") ? "ultimate"
        : t.startsWith("passives") ? "passive"
        : null;
      ms = 0;
      continue;
    }
    // milestone marker (specials/signatures) or passive-set marker; "MNA" optional (staff specs drop it)
    const mile = /^\*\*(?:Set\s+)?@\s*(?:MNA\s+)?(\d+)\*\*(?:\s*\*\(([A-C/]+)\)\*)?/.exec(line);
    if (mile) {
      ms = Number(mile[1]);
      if (mile[2] && section === "special") p.specialPairs.set(ms, mile[2]);
      if (mile[2] && section === "signature") p.signaturePairs.set(ms, mile[2]);
      // compact INLINE passive form (staff specs): "@ 30 — A · **Name** *(…)* | B · **Name** …"
      if (section === "passive") {
        for (const m of line.matchAll(/\b([A-C])\s+·\s+\*\*(.+?)\*\*/g))
          p.passive.push({ lane: m[1], name: m[2].trim(), ms, raw: line, type: "passive" });
      }
      continue;
    }
    if (!section) continue;
    const b = /^-\s+\*\*(.+?)\*\*(.*)$/.exec(line);
    if (!b) continue;

    // bold = "[L · ]Name"; lane is a leading single A/B/C token before " · "
    const boldRaw = b[1].trim();
    const laneM = /^([A-C])\s+·\s+(.+)$/.exec(boldRaw);
    const lane = laneM ? laneM[1] : null;
    const name = (laneM ? laneM[2] : boldRaw).trim();
    const rest = b[2];
    // fields after the bold are " · "-separated; type is the FIRST for auto/special/signature
    const fields = rest.split("·").map((s) => s.trim()).filter(Boolean);
    const type = (section === "auto" || section === "special" || section === "signature")
      ? (fields[0] || "").toLowerCase() : undefined;

    const entry: Entry = { lane, name, type, ms: ms || undefined, raw: line };
    p[section].push(entry);
  }
  return p;
}

// ── checks ──────────────────────────────────────────────────────────────────────────────────
function lintOne(p: Parsed): Finding[] {
  const f: Finding[] = [];
  const block = (lens: string, msg: string) => f.push({ spec: p.spec, severity: "Blocking", lens, msg });
  const should = (lens: string, msg: string) => f.push({ spec: p.spec, severity: "Should-fix", lens, msg });

  // 1 · tier counts (52)
  const counts = { auto: p.auto.length, special: p.special.length, signature: p.signature.length, ultimate: p.ultimate.length, passive: p.passive.length };
  if (counts.auto !== 1) block("counts", `expected 1 auto-attack, found ${counts.auto}`);
  if (counts.special !== 20) block("counts", `expected 20 specials, found ${counts.special}`);
  if (counts.signature !== 18) block("counts", `expected 18 signatures, found ${counts.signature}`);
  if (counts.ultimate !== 4) block("counts", `expected 4 ultimates, found ${counts.ultimate}`);
  if (counts.passive !== 9) block("counts", `expected 9 passives, found ${counts.passive}`);

  // 2 · milestones present + exactly 2 options each (specials & signatures)
  const checkMilestones = (entries: Entry[], expected: number[], tier: string) => {
    const byMs = new Map<number, number>();
    for (const e of entries) if (e.ms != null) byMs.set(e.ms, (byMs.get(e.ms) || 0) + 1);
    for (const m of expected) {
      const n = byMs.get(m) || 0;
      if (n !== 2) block("milestones", `${tier} @ MNA ${m}: expected 2 options, found ${n}`);
    }
    for (const m of byMs.keys()) if (!expected.includes(m)) block("milestones", `${tier} has an off-curve milestone @ MNA ${m}`);
  };
  checkMilestones(p.special, SPECIAL_MS, "specials");
  checkMilestones(p.signature, SIGNATURE_MS, "signatures");

  // 3 · lane tags present (specials/signatures/passives) + ultimates = 3 laned + 1 neutral
  for (const e of [...p.special, ...p.signature, ...p.passive])
    if (!e.lane) block("lanes", `entry "${e.name}" is missing a lane tag (A/B/C)`);
  const ultLaned = p.ultimate.filter((e) => e.lane).length;
  if (p.ultimate.length === 4 && ultLaned !== 3) block("lanes", `ultimates must be 3 laned + 1 neutral; found ${ultLaned} laned`);

  // 4 · ≥2-lane guarantee: no single lane offered at EVERY milestone of a tier
  const laneGuarantee = (entries: Entry[], totalMs: number, tier: string) => {
    const milestonesWithLane: Record<string, Set<number>> = { A: new Set(), B: new Set(), C: new Set() };
    for (const e of entries) if (e.lane && e.ms != null) milestonesWithLane[e.lane].add(e.ms);
    for (const L of LANES)
      if (milestonesWithLane[L].size >= totalMs) block("lane-rotation", `lane ${L} appears at every ${tier} milestone — mono-laning is possible (≥2-lane guarantee broken)`);
  };
  laneGuarantee(p.special, SPECIAL_MS.length, "special");
  laneGuarantee(p.signature, SIGNATURE_MS.length, "signature");

  // 5 · declared lane-pair matches the two options' lanes
  const checkPair = (entries: Entry[], pairs: Map<number, string>, tier: string) => {
    for (const [m, pair] of pairs) {
      const declared = pair.split("/").sort().join("/");
      const got = entries.filter((e) => e.ms === m && e.lane).map((e) => e.lane!).sort().join("/");
      if (got && declared !== got) block("lane-rotation", `${tier} @ MNA ${m}: declared lanes (${pair}) ≠ option lanes (${got})`);
    }
  };
  checkPair(p.special, p.specialPairs, "specials");
  checkPair(p.signature, p.signaturePairs, "signatures");

  // 6 · type enum (auto/special/signature carry an inline type)
  for (const e of [...p.auto, ...p.special, ...p.signature])
    if (e.type && !(TYPE_ENUM as readonly string[]).includes(e.type))
      block("type-enum", `entry "${e.name}" has type "${e.type}" (not one of ${TYPE_ENUM.join("/")})`);

  // 7 · economy one-way: specials & auto GENERATE (never cost); signatures & ultimates COST (never generate)
  const genRe = /\bgen\b/i, costRe = /\bcost\b/i;
  for (const e of [...p.auto, ...p.special]) {
    if (costRe.test(e.raw)) block("economy", `"${e.name}" is a ${e.ms != null ? "special" : "auto"} but COSTS resource (specials/auto generate only)`);
    if (!genRe.test(e.raw)) should("economy", `"${e.name}" should declare a resource gen (gen minor/moderate/major)`);
  }
  for (const e of p.signature) {
    if (genRe.test(e.raw)) block("economy", `signature "${e.name}" GENERATES resource (signatures cost only)`);
    if (!costRe.test(e.raw)) should("economy", `signature "${e.name}" should declare a resource cost (cost low/med/high)`);
  }

  // 8 · provenance declared somewhere (advisory — the model wants per-entry, specs often state it once)
  if (!p.hasProvenance) should("provenance", "no provenance declared (from-brief / proposed)");

  return f;
}

// ── public API ────────────────────────────────────────────────────────────────────────────────
export interface LintResult { findings: Finding[]; parsed: Parsed[]; specCount: number; }

function isSpec(file: string): boolean {
  // A class spec is "<attunement>-<archetype>.md". Match the attunement prefix so README, *-family.md,
  // ROSTER.md AND any other doc dropped in the folder (e.g. endgame-mechanics.md) are excluded — only the
  // 45 real specs are linted.
  return /^(sol|nox|anima|quanta|umbraxis)-.+\.md$/.test(file);
}

export function lintSpecs(dir: string = SPECS_DIR): LintResult {
  const files = readdirSync(dir).filter(isSpec).sort();
  const parsed = files.map((file) => parseSpec(basename(file, ".md"), readFileSync(join(dir, file), "utf8")));
  const findings: Finding[] = [];
  for (const p of parsed) findings.push(...lintOne(p));

  // ROSTER LENS — global ability-name uniqueness across ALL specs (the cross-file check)
  const seen = new Map<string, string[]>();   // lowercased name → [spec:entry]
  for (const p of parsed)
    for (const e of [...p.auto, ...p.special, ...p.signature, ...p.ultimate, ...p.passive]) {
      const key = e.name.toLowerCase();
      (seen.get(key) ?? seen.set(key, []).get(key)!).push(`${p.spec}`);
    }
  for (const [name, specs] of seen) {
    if (specs.length > 1) {
      const where = [...new Set(specs)].length > 1 ? specs.join(", ") : `${specs[0]} (×${specs.length})`;
      findings.push({ spec: "ROSTER", severity: "Blocking", lens: "name-uniqueness", msg: `ability name "${name}" is reused (${where}) — names must be globally unique` });
    }
  }
  return { findings, parsed, specCount: files.length };
}

// ── CLI ─────────────────────────────────────────────────────────────────────────────────────
export function formatReport(r: LintResult): string {
  const lines: string[] = [];
  const bySpec = new Map<string, Finding[]>();
  for (const f of r.findings) (bySpec.get(f.spec) ?? bySpec.set(f.spec, []).get(f.spec)!).push(f);

  lines.push(`\n████ class-spec-lint — ${r.specCount} spec(s) ████\n`);
  for (const p of r.parsed) {
    const fs = bySpec.get(p.spec) || [];
    const blk = fs.filter((x) => x.severity === "Blocking").length;
    const mark = blk ? "✗" : fs.length ? "⚠" : "✓";
    lines.push(`${mark} ${p.spec}  (${p.auto.length}+${p.special.length}+${p.signature.length}+${p.ultimate.length}+${p.passive.length})`);
    for (const x of fs) lines.push(`    [${x.severity}] ${x.lens}: ${x.msg}`);
  }
  const roster = bySpec.get("ROSTER") || [];
  if (roster.length) {
    lines.push(`\n── roster ──`);
    for (const x of roster) lines.push(`    [${x.severity}] ${x.lens}: ${x.msg}`);
  }
  const blocking = r.findings.filter((x) => x.severity === "Blocking").length;
  const should = r.findings.filter((x) => x.severity === "Should-fix").length;
  lines.push(`\n${blocking ? "✗" : "✓"} ${blocking} Blocking · ${should} Should-fix\n`);
  return lines.join("\n");
}

// Run as CLI only when invoked directly (not when imported by the vitest gate).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = lintSpecs();
  console.log(formatReport(r));
  process.exit(r.findings.some((x) => x.severity === "Blocking") ? 1 : 0);
}
