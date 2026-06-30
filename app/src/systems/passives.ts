// V3 passive effects (ADR 0020 §5) — pure. A class's 9 passives (one of three picked at each of MNA
// 30/60/90) are continuous modifiers, not commands. This turns a hero's ACTIVE passive picks into
// bonuses to the V3 secondary stats (the `Subs` sheet), which `recalc` already folds into the effective
// crit / ability-power / penetration / mitigation / lifesteal the combat math reads — so a passive plugs
// into existing levers with no new combat hook.
//
// The per-passive effect is numberless DESIGN PROSE (Dara's lane); this maps each to its dominant combat
// axis by keyword and assigns a FIRST-PASS magnitude — the same agent-driven "first-pass numbers, balance
// pass later" posture as the band→number ability generator (ADR 0020 §3). The precise per-passive design
// is Dara's to refine; this gives every picked passive real, tunable weight instead of being inert.

import type { AbilityEntry } from "../data/classSpec";
import type { SubKey, Subs } from "../types";

/** First-pass magnitudes (percentage points on the Subs sheet; tuned in a later balance pass). */
const MAG = { crit: 6, abp: 8, leech: 5, exe: 12, pen: 10, def: 6, eva: 6, cmd: 10 } as const;

// Effect-prose → the sub-stat(s) a passive boosts. First match wins (most specific first); anything that
// doesn't match a lever falls through to ability power, so every passive does *something*.
const RULES: { re: RegExp; subs: Partial<Record<SubKey, number>> }[] = [
  { re: /crit damage|crit.*harder|harder.*crit/i, subs: { Cmd: MAG.cmd } },
  { re: /\bcrit/i, subs: { Crt: MAG.crit } },
  { re: /execut|finish|killing blow|low[- ]?hp|missing hp|already low/i, subs: { Exe: MAG.exe } },
  { re: /lifesteal|life steal|leech|siphon|vampir|sustain|heal more/i, subs: { Lfs: MAG.leech } },
  { re: /pierc|ignore.*(resist|armor|defen)|penetrat|bypass|ignores? more/i, subs: { Mpn: MAG.pen, Epn: MAG.pen } },
  { re: /evas|dodge|avoid/i, subs: { Eva: MAG.eva } },
  { re: /reduc|mitigat|\barmor\b|\bward\b|tankier|tougher|absorb|defens|damage taken/i, subs: { Mrd: MAG.def, Erd: MAG.def } },
];

/** Derive the cumulative Subs bonus from a hero's active passive picks (AbilityEntries of tier "passive").
 *  Pure; magnitudes are first-pass. */
export function passiveMods(passives: AbilityEntry[]): Partial<Subs> {
  const out: Partial<Subs> = {};
  const add = (subs: Partial<Record<SubKey, number>>) => {
    for (const k in subs) out[k as SubKey] = (out[k as SubKey] ?? 0) + subs[k as SubKey]!;
  };
  for (const p of passives) {
    if (p.tier !== "passive") continue;
    const rule = RULES.find((r) => r.re.test(p.effect));
    add(rule ? rule.subs : { Abp: MAG.abp }); // unmatched → generic ability power
  }
  return out;
}

/** Add a Subs bonus into a live sub sheet in place (recalc applies passive mods before deriving the
 *  effective crit/abp/leech from `sub`). */
export function applyMods(sub: Subs, mods: Partial<Subs>): void {
  for (const k in mods) sub[k as SubKey] += mods[k as SubKey]!;
}
