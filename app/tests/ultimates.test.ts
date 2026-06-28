// @vitest-environment jsdom
//
// Ultimate ability wiring: the data entry is well-formed and its cutscene asset actually resolves
// (guards the core/assets LAZY .mp4 glob — videos are loaded on demand, not in the eager graph).

import { describe, it, expect } from "vitest";
import { ULTIMATES } from "../src/data/ultimates";
import { preloadVideoUrl } from "../src/core/assets";

describe("Ultimates", () => {
  it("defines the Photon Vanguard's Orbital Cannon (SOL:Rifle), keyed like the basic-attack map", () => {
    const u = ULTIMATES["SOL:Rifle"];
    expect(u).toBeTruthy();
    expect(u.name).toBe("Orbital Cannon");
    expect(u.damage).toBe(9999);
    expect(u.target).toBe("allEnemies");
    expect(u.mp).toBe(0); // TEST build: free
  });

  it("defines the Lagrangian's Umbraxian Fealty (UMBRAXIS:Dual Daggers) as a single-target nuke", () => {
    const u = ULTIMATES["UMBRAXIS:Dual Daggers"];
    expect(u).toBeTruthy();
    expect(u.name).toBe("Umbraxian Fealty");
    expect(u.damage).toBe(9999);
    expect(u.target).toBe("enemy"); // single target, not AoE
    expect(u.mp).toBe(0);
  });

  it("every ultimate's cutscene resolves through the lazy mp4 asset pipeline", async () => {
    for (const key of Object.keys(ULTIMATES)) {
      const u = ULTIMATES[key];
      expect(u.cutscene, key).toBeTruthy();
      expect(await preloadVideoUrl(u.cutscene!), key).toBeTruthy(); // bundled + hashed by Vite, loaded on demand
    }
  });
});
