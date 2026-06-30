import type { Skill } from "../types";

// The engine skill registry. There are NO hand-authored kits: every ability comes from the 45 class
// specs (data/classSpecs). systems/classKit re-encodes each spec into engine `Skill`s and merges them in
// here under their `v3:*` keys at module load — so this map is empty until classKit has been imported
// (always true in the running app and in any test/sim that touches the kit system; see the db.ts note).
export const SKILLS: Record<string, Skill> = {};
