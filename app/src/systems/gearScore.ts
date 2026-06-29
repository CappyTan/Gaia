// Pure gear-score scoring. Distils a hero's effective stats into three composite numbers so the
// player can read "is this loot an upgrade?" at a glance. Deliberate weightings (a design choice,
// not a derived truth) — keep them. No DOM; takes any object with the stat fields off `Member`.

import type { Member } from "../types";

export interface GearScore {
  offense: number;
  defense: number;
  overall: number;
}

type Scorable = Pick<Member, "atk" | "mag" | "critPct" | "spd" | "leech" | "maxhp" | "armor" | "maxmp" | "abp" | "prim">;

/** Three composite scores from a member's effective stats (integers). V3: ability-power (abp) from gear
 *  primaries scales Offense (so a +VIT helmet visibly raises it), and the DEF primary feeds Defense. */
export function gearScore(m: Scorable): GearScore {
  const offense = Math.round((m.atk + m.mag + m.critPct * 1.5 + m.spd * 0.4 + (m.leech || 0) * 0.6) * (1 + (m.abp || 0)));
  const defense = Math.round(m.maxhp * 0.12 + m.armor * 5 + m.maxmp * 0.08 + (m.prim?.DEF || 0) * 0.6);
  return { offense, defense, overall: offense + defense };
}
