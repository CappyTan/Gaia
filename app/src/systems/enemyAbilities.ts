import type { BattleApi, Enemy } from "../types";
import { pick } from "../core/rng";
import { heal, applyStatus } from "./combat";

// Enemy abilities cast during an enemy's turn. Each returns true if it actually fired (false
// falls through to a normal attack — e.g. a Shaman with no wounded ally to mend). They talk to
// the battle only through BattleApi, so they stay engine-agnostic (no direct DOM).
export interface EnemyAbility {
  use(e: Enemy, B: BattleApi): boolean;
}

export const ENEMY_ABILITIES: Record<string, EnemyAbility> = {
  mend: {
    use(e, B) {
      const hurt = B.livingEnemies()
        .filter((x) => x.hp < x.maxhp)
        .sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp);
      const t = hurt[0];
      if (!t) return false;
      const amt = Math.round(e.mag * 1.7 + 22);
      heal(t, amt);
      B.float(t, `+${amt}`, "#aef0a0");
      B.log(`${e.name} mends ${t.name} (+${amt}).`);
      return true;
    },
  },
  hex: {
    use(e, B) {
      const p = pick(B.livingParty());
      if (!p) return false;
      applyStatus(p, { blind: 2 });
      B.float(p, "blinded", "#bbb");
      B.log(`${e.name} hexes ${p.name}.`);
      return true;
    },
  },
  rally: {
    use(e, B) {
      const allies = B.livingEnemies();
      if (!allies.length) return false;
      allies.forEach((a) => {
        applyStatus(a, { atkup: 3 });
        B.float(a, "ATK↑", "#ffb27a");
      });
      B.log(`${e.name} rallies the bandits!`);
      return true;
    },
  },
};
