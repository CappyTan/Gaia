// @vitest-environment jsdom
//
// Combat animation compositor (ui/skillAnimator) + the Photon Beam definition. We can't eyeball the
// browser here, so this pins the WIRING: a SkillAnim plays frames onto the stage, fires the damage /
// impact / complete callbacks on schedule, hides then restores the actor sprite, and cleans up every
// frame element afterwards. Visual tuning (scale/offsets/timing) lives in data/skillAnimations.ts.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { playSkillAnim, playImpact } from "../src/ui/skillAnimator";
import { SKILL_ANIM, BASIC_ATTACK_ANIM } from "../src/data/skillAnimations";

function stageWith() {
  document.body.innerHTML = `<div id="stage"><img id="a" src=""><img id="t" src=""></div>`;
  return {
    stage: document.getElementById("stage") as HTMLElement,
    actor: document.getElementById("a") as HTMLElement,
    target: document.getElementById("t") as HTMLElement,
  };
}

describe("Photon Beam definition", () => {
  it("is a well-formed layered animation (in-place character + muzzle beam + impact on target)", () => {
    const a = SKILL_ANIM.photonBeam;
    expect(a.character.frames).toBeGreaterThan(0);
    expect(a.effect?.at).toBe("muzzleToTarget"); // beam spans the muzzle to the foe
    expect(a.impact?.at).toBe("target");          // explosion on the struck enemy
    expect(typeof a.damageMs).toBe("number");      // damage scheduled to land with the hit
  });
});

describe("Photon Shot (basic attack) definition", () => {
  it("is the Photon Vanguard's (SOL×Rifle) basic attack — muzzle flash + travelling tracer + impact", () => {
    expect(BASIC_ATTACK_ANIM["SOL:Rifle"]).toBe("photonShot");
    const a = SKILL_ANIM.photonShot;
    expect(a.character.frames).toBeGreaterThan(0);
    expect(a.muzzle?.at).toBe("muzzle");        // cast flash at the barrel
    expect(a.effect?.at).toBe("travel");         // a bullet that flies to the foe
    expect(a.effect?.travelMs).toBeGreaterThan(0);
    expect(a.impact?.at).toBe("target");         // burst on the struck enemy
    expect(typeof a.damageMs).toBe("number");
  });
});

describe("skillAnimator compositor", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays frames, fires callbacks in order, hides/restores the actor, and cleans up", () => {
    const { stage, actor, target } = stageWith();
    const calls: string[] = [];
    playSkillAnim(SKILL_ANIM.photonBeam, {
      stage, actor, target,
      onDamage: () => calls.push("damage"),
      onImpact: () => calls.push("impact"),
      onComplete: () => calls.push("complete"),
    });

    // The timeline runs immediately (NOT gated on image preload — jsdom <img> never fires load, which
    // is exactly the iOS/PWA case that used to leave the hero hidden with nothing drawn). The static
    // doll is hidden only WHILE the firing frames play, and is restored purely off the timeline clock.
    vi.advanceTimersByTime(550);
    expect(actor.style.visibility).toBe("hidden");
    expect(stage.querySelectorAll("img.anim-sprite").length).toBeGreaterThan(0);

    // past the damage time + the character frames (the doll is restored to its held pose)
    vi.advanceTimersByTime(700);
    expect(calls).toContain("damage");

    // run to the end
    vi.advanceTimersByTime(4000);
    expect(calls).toEqual(["damage", "impact", "complete"]); // order: hit lands, number, done
    expect(actor.style.visibility).toBe(""); // sprite restored
    expect(stage.querySelectorAll("img.anim-sprite").length).toBe(0); // every frame cleaned up
  });

  it("plays a projectile basic attack (muzzle flash + travelling tracer) and cleans it all up", () => {
    const { stage, actor, target } = stageWith();
    const calls: string[] = [];
    playSkillAnim(SKILL_ANIM.photonShot, {
      stage, actor, target,
      onDamage: () => calls.push("damage"),
      onImpact: () => calls.push("impact"),
      onComplete: () => calls.push("complete"),
    });

    // mid-flight: the muzzle flash + the moving tracer wrapper are on the stage
    vi.advanceTimersByTime(900);
    expect(stage.querySelectorAll("img.anim-sprite").length).toBeGreaterThan(0);

    vi.advanceTimersByTime(4000);
    expect(calls).toEqual(["damage", "impact", "complete"]);
    expect(actor.style.visibility).toBe("");
    expect(stage.querySelectorAll("img.anim-sprite").length).toBe(0); // tracer wrapper + frames gone
  });
});

describe("universal impact VFX (playImpact)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("spawns a 4-frame Attunement burst on the target, then destroys it (no loop)", () => {
    const { stage, target } = stageWith();
    playImpact(stage, target, "QUANTA");
    expect(stage.querySelectorAll("img.impact-fx").length).toBe(4); // all four frames stacked
    // frames advance; after the last frame the burst is removed — it does NOT loop
    vi.advanceTimersByTime(83 * 4 + 300);
    expect(stage.querySelectorAll("img.impact-fx").length).toBe(0);
  });

  it("resolves the sheet from the attacker's Attunement (each of the five exists)", () => {
    for (const att of ["SOL", "NOX", "ANIMA", "QUANTA", "UMBRAXIS"]) {
      const { stage, target } = stageWith();
      playImpact(stage, target, att);
      expect(stage.querySelectorAll("img.impact-fx").length).toBe(4);
      vi.advanceTimersByTime(83 * 4 + 300);
    }
  });

  it("is a graceful no-op when that Attunement has no art", () => {
    const { stage, target } = stageWith();
    playImpact(stage, target, "NOPE");
    expect(stage.querySelectorAll("img.impact-fx").length).toBe(0);
  });
});
