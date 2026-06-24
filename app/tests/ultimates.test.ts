// @vitest-environment jsdom
//
// Ultimate ability wiring: the data entry is well-formed and its cutscene asset actually resolves
// (guards the core/assets glob now covering .mp4, not just .png).

import { describe, it, expect } from "vitest";
import { ULTIMATES } from "../src/data/ultimates";
import { assetUrl } from "../src/core/assets";

describe("Ultimates", () => {
  it("defines the Photon Vanguard's Orbital Cannon (SOL:Rifle), keyed like the basic-attack map", () => {
    const u = ULTIMATES["SOL:Rifle"];
    expect(u).toBeTruthy();
    expect(u.name).toBe("Orbital Cannon");
    expect(u.damage).toBe(9999);
    expect(u.target).toBe("allEnemies");
    expect(u.mp).toBe(0); // TEST build: free
  });

  it("its cutscene video resolves through the asset pipeline (mp4 glob)", () => {
    const u = ULTIMATES["SOL:Rifle"];
    expect(u.cutscene).toBeTruthy();
    expect(assetUrl(u.cutscene!)).toBeTruthy(); // bundled + hashed by Vite
  });
});
