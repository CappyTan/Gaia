// CLASS-SPEC structural gate (Lens 1 of the class-spec-review rubric). Runs the deterministic
// linter (app/tools/class-spec-lint) over the shipped greenfield specs and FAILS the build on any
// Blocking finding — the hard CI gate for the 52-slot Class System Model invariants. The synthetic
// cases prove the checks actually bite (counts, economy one-way, global name-uniqueness), so the
// real-dir assertion isn't vacuously green.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintSpecs } from "../tools/class-spec-lint";

describe("class-spec-lint — the real specs (hard gate)", () => {
  const { findings, specCount } = lintSpecs();
  const blocking = findings.filter((f) => f.severity === "Blocking");

  it("lints all shipped class specs", () => {
    expect(specCount).toBeGreaterThan(0);
  });

  it("has NO Blocking structural findings", () => {
    // Surface the offenders in the failure message rather than a bare count.
    expect(blocking.map((f) => `${f.spec} · ${f.lens}: ${f.msg}`)).toEqual([]);
  });
});

describe("class-spec-lint — synthetic negatives (the checks bite)", () => {
  let dir: string;

  // A minimal WELL-FORMED spec body, parameterized so each case can break one thing.
  const goodBody = (autoName: string) => {
    const opt = (lane: string, name: string, kind: "gen" | "cost") =>
      `- **${lane} · ${name}** · phys · enemy · *does a thing* · ${kind === "gen" ? "gen **minor X**" : "cost **low X**"} · cd **short**`;
    const specMs = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95];
    const sigMs = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const pairs = ["A/B", "B/C", "A/C"];
    const lanesOf = (i: number) => pairs[i % 3].split("/");
    let s = `# Test — SOL × Hammer\n\n_provenance: proposed_\n\n## Auto-attack\n- **${autoName}** · phys · enemy · *swing* · gen **minor X** · cd **none**\n\n## Special skills\n`;
    specMs.forEach((m, i) => {
      const [l1, l2] = lanesOf(i);
      s += `**@ MNA ${m}** *(${pairs[i % 3]})*\n${opt(l1, `Sp${m}a`, "gen")}\n${opt(l2, `Sp${m}b`, "gen")}\n`;
    });
    s += `\n## Signature abilities\n`;
    sigMs.forEach((m, i) => {
      const [l1, l2] = lanesOf(i);
      s += `**@ MNA ${m}** *(${pairs[i % 3]})*\n${opt(l1, `Sg${m}a`, "cost")}\n${opt(l2, `Sg${m}b`, "cost")}\n`;
    });
    s += `\n## Ultimates\n- **A · UltA** *(A)* · enemy · *big*\n- **B · UltB** *(B)* · enemy · *big*\n- **C · UltC** *(C)* · enemy · *big*\n- **UltN** *(neutral)* · enemy · *big*\n`;
    s += `\n## Passives\n**Set @ MNA 30**\n- **A · PsvA30** · *mod*\n- **B · PsvB30** · *mod*\n- **C · PsvC30** · *mod*\n`;
    s += `**Set @ MNA 60**\n- **A · PsvA60** · *mod*\n- **B · PsvB60** · *mod*\n- **C · PsvC60** · *mod*\n`;
    s += `**Set @ MNA 90**\n- **A · PsvA90** · *mod*\n- **B · PsvB90** · *mod*\n- **C · PsvC90** · *mod*\n`;
    return s;
  };

  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), "class-spec-lint-")); });
  afterAll(() => { rmSync(dir, { recursive: true, force: true }); });

  const lensesIn = (file: string, body: string) => {
    writeFileSync(join(dir, file), body);
    const { findings } = lintSpecs(dir);
    return findings;
  };

  it("a clean synthetic spec passes", () => {
    const f = lensesIn("sol-clean.md", goodBody("CleanAuto"));
    expect(f.filter((x) => x.severity === "Blocking")).toEqual([]);
    rmSync(join(dir, "sol-clean.md"));
  });

  it("flags a missing milestone option (counts/milestones)", () => {
    const broken = goodBody("CountAuto").replace(/^- \*\*B · Sp5b\*\*.*$/m, "");
    const f = lensesIn("sol-count.md", broken);
    expect(f.some((x) => x.severity === "Blocking" && (x.lens === "counts" || x.lens === "milestones"))).toBe(true);
    rmSync(join(dir, "sol-count.md"));
  });

  it("flags an economy violation (a special that costs)", () => {
    const broken = goodBody("EconAuto").replace("**A · Sp5a** · phys · enemy · *does a thing* · gen **minor X**", "**A · Sp5a** · phys · enemy · *does a thing* · cost **low X**");
    const f = lensesIn("sol-econ.md", broken);
    expect(f.some((x) => x.severity === "Blocking" && x.lens === "economy")).toBe(true);
    rmSync(join(dir, "sol-econ.md"));
  });

  it("flags a globally-duplicated ability name across two specs", () => {
    writeFileSync(join(dir, "sol-one.md"), goodBody("SharedAuto"));
    writeFileSync(join(dir, "sol-two.md"), goodBody("SharedAuto")); // same auto name in both
    const f = lintSpecs(dir).findings;
    expect(f.some((x) => x.severity === "Blocking" && x.lens === "name-uniqueness" && x.msg.includes("sharedauto"))).toBe(true);
    rmSync(join(dir, "sol-one.md")); rmSync(join(dir, "sol-two.md"));
  });
});
