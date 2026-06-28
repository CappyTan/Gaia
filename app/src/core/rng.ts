// Random + small numeric helpers. The default RNG is Math.random, but combat math takes
// an injectable rng so tests/sims can be deterministic.

export type Rng = () => number;

// SEEDED variants take an explicit rng so the pure pipeline (loot/enemy rolls) can be pinned for
// the balance sim + deterministic tests. The bare rnd/ri/pick below are Math.random-bound
// convenience wrappers over these (so existing callers are unchanged).
export const rndR = (rng: Rng, a: number, b: number): number => a + rng() * (b - a);
export const riR = (rng: Rng, a: number, b: number): number => Math.floor(rndR(rng, a, b + 1));
export const pickR = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

export const rnd = (a: number, b: number): number => rndR(Math.random, a, b);
export const ri = (a: number, b: number): number => riR(Math.random, a, b);
export const pick = <T>(arr: readonly T[]): T => pickR(Math.random, arr);
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
