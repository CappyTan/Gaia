// Random + small numeric helpers. The default RNG is Math.random, but combat math takes
// an injectable rng so tests/sims can be deterministic.

export type Rng = () => number;

export const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
export const ri = (a: number, b: number): number => Math.floor(rnd(a, b + 1));
export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Mulberry32 — a tiny seedable PRNG for reproducible runs (balance sim, tests). */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
