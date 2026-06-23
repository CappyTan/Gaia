// Dungeon reprieve — PURE logic (ADR 0005/0010: no DOM, no controller import). Applies a dungeon rest
// node's TAILORED relief to the standing party. Deliberately partial and single-axis: a reprieve is NOT
// a full heal (a full HP+MP refill every floor trivialises the game — Dara), so a deep dungeon stays
// punishing. Caves carry NO reprieve at all (their rest data is simply absent). The field controller calls
// this when the player steps on a rest node, then renders the returned summary.

import type { Member, Reprieve } from "../types";

/** What a reprieve actually did — so the controller can render an honest, specific overlay line. */
export interface ReprieveResult {
  hpHealed: number;     // total HP restored across the party ("mend")
  mpRestored: number;   // total MP restored across the party ("mana")
  regenTicks: number;   // regen ticks granted per hero, carried into the next battle ("regen")
  affected: number;     // standing heroes the reprieve touched
}

const DEFAULT_FRACTION = 0.4; // mend/mana: restore 40% of max by default — a breather, not a refill
const DEFAULT_REGEN = 5;      // regen: 5 ticks (~5 combat turns of 8% maxhp) carried into the next fight

/**
 * Apply `r` to the LIVING party (the fallen need a town to revive — a reprieve never raises the dead).
 * Mutates the members (HP/MP/pendingRegen) and returns a summary. Pure + deterministic (no RNG).
 */
export function applyReprieve(party: Member[], r: Reprieve): ReprieveResult {
  const res: ReprieveResult = { hpHealed: 0, mpRestored: 0, regenTicks: 0, affected: 0 };
  const standing = party.filter((m) => m.alive);
  for (const m of standing) {
    res.affected++;
    switch (r.kind) {
      case "mend": {
        const amt = Math.round((m.maxhp || 0) * (r.amount ?? DEFAULT_FRACTION));
        const before = m.hp; m.hp = Math.min(m.maxhp, m.hp + amt); res.hpHealed += m.hp - before;
        break;
      }
      case "mana": {
        const amt = Math.round((m.maxmp || 0) * (r.amount ?? DEFAULT_FRACTION));
        const before = m.mp; m.mp = Math.min(m.maxmp, m.mp + amt); res.mpRestored += m.mp - before;
        break;
      }
      case "regen": {
        const ticks = Math.round(r.amount ?? DEFAULT_REGEN);
        // carried, not instant: seeded into status at the next battle start (battle wipes per-fight status).
        m.pendingRegen = Math.max(m.pendingRegen ?? 0, ticks); res.regenTicks = ticks;
        break;
      }
    }
  }
  return res;
}
