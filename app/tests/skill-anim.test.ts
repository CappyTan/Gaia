// @vitest-environment jsdom
//
// Combat animation compositor (ui/skillAnimator) + the Photon Beam definition. We can't eyeball the
// browser here, so this pins the WIRING: a SkillAnim plays frames onto the stage, fires the damage /
// impact / complete callbacks on schedule, hides then restores the actor sprite, and cleans up every
// frame element afterwards. Visual tuning (scale/offsets/timing) lives in data/skillAnimations.ts.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { playSkillAnim } from "../src/ui/skillAnimator";
import { SKILL_ANIM } from "../src/data/skillAnimations";

function stageWith() {
  document.body.innerHTML = `<div id="stage"><img id="a" src=""><img id="t" src=""></div>`;
  return {
    stage: document.getElementById("stage") as HTMLElement,
    actor: document.getElementById("a") as HTMLElement,
    target: document.getElementById("t") as HTMLElement,
  };
}

describe("Photon Beam definition", () => {
  it("is a well-formed layered animation (character master clock + effect + impact)", () => {
    const a = SKILL_ANIM.photonBeam;
    expect(a.character.frames).toBeGreaterThan(0);
    expect(a.effect?.startFrame).toBeGreaterThan(0);
    expect(a.impact?.startFrame).toBeGreaterThan(0);
    // damage frame must fall within the character animation
    expect(a.damageFrame).toBeGreaterThan(0);
    expect(a.damageFrame).toBeLessThanOrEqual(a.character.frames);
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

    // hideActor: the static sprite is hidden while the firing frames play (set synchronously)
    expect(actor.style.visibility).toBe("hidden");

    // frames preload first; in jsdom <img> never fires load, so the timeline starts via the 350ms
    // safety cap. Advance past that + the damage frame.
    vi.advanceTimersByTime(900);
    expect(stage.querySelectorAll("img.anim-frame").length).toBeGreaterThan(0);
    expect(calls).toContain("damage");

    // run to the end
    vi.advanceTimersByTime(4000);
    expect(calls).toEqual(["damage", "impact", "complete"]); // order: hit lands, number, done
    expect(actor.style.visibility).toBe(""); // sprite restored
    expect(stage.querySelectorAll("img.anim-frame").length).toBe(0); // every frame cleaned up
  });
});
