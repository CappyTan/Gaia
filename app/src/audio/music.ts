// Procedural old-school chiptune (Web Audio, no asset files). Hand-composed loops per game
// state, cross-faded. Starts on first user gesture (iOS autoplay policy).

const NOTE_SEMI: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};
function noteFreq(name: string): number {
  if (!name || name === "r") return 0;
  const m = /^([A-G][#b]?)(\d)$/.exec(name);
  if (!m) return 0;
  const midi = NOTE_SEMI[m[1]] + (+m[2] + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

type SeqEvent = [string, number]; // [note|'r'|drum, steps(16ths)]
interface Song { bpm: number; loop?: boolean; roles: Record<string, SeqEvent[]>; }
interface VoiceCfg {
  w?: OscillatorType; vol?: number; gate?: number; atk?: number; rel?: number;
  cutoff?: number; detune?: number; drum?: boolean;
}
interface Style { tempo?: number; roles: Record<string, VoiceCfg | null>; }
type Channel = VoiceCfg & { seq: SeqEvent[] };
interface Track { bpm: number; loop?: boolean; ch: Channel[]; }

export const Music = {
  ctx: null as AudioContext | null,
  master: null as GainNode | null,
  sink: null as MediaStreamAudioDestinationNode | null,
  el: null as HTMLAudioElement | null,
  route: "" as string,
  started: false,
  muted: false,
  vol: 0.16,
  pending: "title" as string,
  cur: null as string | null,
  track: null as Track | null,
  stepDur: 0,
  cursors: [] as { i: number; next: number }[],
  _timer: undefined as ReturnType<typeof setInterval> | undefined,
  LOOKAHEAD: 0.12,
  TICK: 25,
  styleByState: { title: "radiant", field: "radiant", village: "radiant", city: "radiant", forest: "orchestral", mire: "orchestral", marsh: "orchestral", plains: "heroic", granary: "orchestral", battle: "radiant", boss: "radiant", warlord: "heroic", victory: "radiant" } as Record<string, string>,
  STYLE_ORDER: ["radiant", "orchestral", "heroic"],

  SONGS: {
    title: { bpm: 100, roles: {
      bass: [["A2", 8], ["F2", 8], ["C2", 8], ["G2", 8], ["A2", 8], ["F2", 8], ["C2", 8], ["G2", 8]],
      pad: [["E3", 8], ["C3", 8], ["G3", 8], ["D3", 8], ["E3", 8], ["C3", 8], ["G3", 8], ["D3", 8]],
      arp: [["A3", 2], ["C4", 2], ["E4", 2], ["A4", 2], ["A3", 2], ["C4", 2], ["F4", 2], ["A4", 2], ["C4", 2], ["E4", 2], ["G4", 2], ["C5", 2], ["B3", 2], ["D4", 2], ["G4", 2], ["B4", 2]],
      lead: [["E4", 4], ["A4", 4], ["C5", 4], ["B4", 4], ["A4", 4], ["C5", 4], ["F5", 4], ["E5", 4], ["E5", 4], ["G4", 4], ["C5", 4], ["G5", 4], ["D5", 4], ["B4", 4], ["G4", 4], ["D5", 4]],
    } },
    field: { bpm: 116, roles: {
      bass: [["A2", 8], ["G2", 8], ["F2", 8], ["E2", 8]],
      pad: [["E3", 8], ["D3", 8], ["C3", 8], ["B2", 8]],
      arp: [["A3", 2], ["C4", 2], ["E4", 2], ["C4", 2], ["G3", 2], ["B3", 2], ["D4", 2], ["B3", 2], ["F3", 2], ["A3", 2], ["C4", 2], ["A3", 2], ["E3", 2], ["G#3", 2], ["B3", 2], ["G#3", 2]],
      lead: [["A4", 2], ["C5", 2], ["E5", 2], ["C5", 2], ["B4", 2], ["D5", 2], ["G4", 2], ["B4", 2], ["A4", 2], ["C5", 2], ["F4", 2], ["A4", 2], ["G#4", 2], ["B4", 2], ["E4", 2], ["B4", 2]],
    } },
    // Hearthford / village theme — warm folk-pastoral "home" tune for any settlement (town mode).
    // F major with a Lydian lift (B-natural over the C/G bars), relaxed 92 BPM, no drums. Two 4-bar
    // phrases over an 8-bar loop: A settles at home (F·Dm·Bb·C), B lifts and resolves (F·C·Bb·F).
    // A singable lead over a soft sustained pad, a gentle root-fifth bass, and a light plucked
    // open-interval arp = the "folk strum". Sibling to `field` (same A-minor-ish family voicing) but
    // brighter, slower, and consonant where the field is restless.
    village: { bpm: 92, roles: {
      bass: [["F2", 4], ["C3", 4], ["D2", 4], ["A2", 4], ["Bb1", 4], ["F2", 4], ["C2", 4], ["G2", 4],
             ["F2", 4], ["C3", 4], ["C2", 4], ["G2", 4], ["Bb1", 4], ["F2", 4], ["C2", 4], ["C3", 4]],
      pad: [["A3", 8], ["F3", 8], ["F3", 8], ["A3", 8], ["D4", 8], ["A3", 8], ["E4", 8], ["C4", 8]],
      arp: [["F3", 2], ["A3", 2], ["C4", 2], ["A3", 2], ["A3", 2], ["C4", 2], ["F4", 2], ["C4", 2],
            ["Bb3", 2], ["D4", 2], ["F4", 2], ["D4", 2], ["C4", 2], ["E4", 2], ["G4", 2], ["E4", 2]],
      lead: [["F4", 4], ["A4", 4], ["C5", 6], ["A4", 2], ["D5", 4], ["C5", 4], ["A4", 6], ["F4", 2],
             ["Bb4", 4], ["A4", 2], ["G4", 2], ["F4", 4], ["G4", 4], ["A4", 8], ["G4", 4], ["F4", 4],
             ["F4", 4], ["A4", 4], ["C5", 6], ["E5", 2], ["G5", 4], ["E5", 4], ["C5", 6], ["A4", 2],
             ["Bb4", 4], ["C5", 4], ["A4", 4], ["G4", 4], ["F4", 12], ["r", 4]],
    } },
    // Duskmarsh overworld / dread theme — grim, low, sparse. The pastoral field's dark mirror:
    // D phrygian (D Eb F G A Bb C), a slow 78 BPM, no drums. A low sustained drone-bass on the
    // tonic that only shifts to the bII (Eb) and bVII (C) for an uneasy, unresolved pull; a slow
    // pad breathing minor-third/tritone clusters above it. The "melody" is barely there — a few
    // lonely long tones (the lead) drifting D–F–G–Bb–Eb with long rests, like something half-seen
    // across the bog. No arp/no drums = open, still, dread. Long phrase (two 8-bar halves) so the
    // loop never feels chirpy. Pairs as a sibling to `field` (same role set) but slow + phrygian.
    mire: { bpm: 78, roles: {
      bass: [["D2", 16], ["D2", 16], ["Eb2", 16], ["D2", 16],
             ["D2", 16], ["C2", 16], ["Bb1", 16], ["D2", 16]],
      pad: [["F3", 16], ["A3", 16], ["G3", 16], ["Ab3", 16],
            ["F3", 16], ["Eb3", 16], ["D3", 16], ["F3", 16]],
      lead: [["D4", 8], ["r", 8], ["F4", 6], ["r", 10], ["G4", 8], ["r", 8], ["Bb4", 8], ["A4", 4], ["r", 12],
             ["Eb4", 8], ["r", 8], ["F4", 6], ["r", 10], ["D4", 8], ["r", 8], ["C4", 8], ["r", 4], ["D4", 8], ["r", 4]],
    } },
    // Miregard outpost / fog theme — a grimmer, colder, hushed town cue for marsh-themed settlements
    // (the dark sibling of the warm Hearthford `village`). Same D phrygian dread color as `mire`, a
    // hair faster (84 BPM) and a touch more "inhabited": a slow root-fifth bass that walks the gloomy
    // cadence (D–Bb–Eb–D), a cold breathing pad, a sparse open-fifth "lantern" arp (the only sign of
    // life — quiet, far-apart plucks), and a low, resigned lead phrase that keeps falling back to the
    // tonic and never lifts. No drums. Reads as "shelter, but cold and fog-bound", not "home".
    marsh: { bpm: 84, roles: {
      bass: [["D2", 8], ["A2", 8], ["Bb1", 8], ["F2", 8], ["Eb2", 8], ["Bb1", 8], ["D2", 8], ["A2", 8],
             ["D2", 8], ["A2", 8], ["C2", 8], ["G2", 8], ["Eb2", 8], ["Bb1", 8], ["D2", 8], ["D2", 8]],
      pad: [["F3", 16], ["D3", 16], ["Eb3", 16], ["F3", 16], ["Eb3", 16], ["D3", 16], ["F3", 16], ["A3", 16]],
      arp: [["D4", 4], ["r", 4], ["A4", 4], ["r", 4], ["r", 8], ["F4", 4], ["r", 4],
            ["Bb3", 4], ["r", 4], ["F4", 4], ["r", 4], ["r", 8], ["Eb4", 4], ["r", 4]],
      lead: [["A4", 8], ["G4", 4], ["F4", 12], ["r", 8], ["F4", 6], ["Eb4", 2], ["D4", 8], ["r", 16],
             ["Bb4", 8], ["A4", 8], ["G4", 4], ["F4", 12], ["Eb4", 8], ["D4", 12], ["r", 4], ["D4", 8], ["r", 8]],
    } },
    // Silverwood / ancient-forest theme — hushed, old, mysterious. The pastoral `field`'s deep-canopy
    // sibling: where Greenvale is bright + restless, Silverwood is slow + enclosing; where the `mire`
    // is bleak Phrygian dread, this is modal woodland — minor-colored but alive. E Dorian (E F# G A B
    // C# D): the minor third (G) hushes it, but the natural sixth (C#) keeps it green/old rather than
    // grim. Slow 96 BPM, no drums. 16-bar loop in two breathing 8-bar halves. A soft root-fifth drone-
    // bass drifts the modal cadence i–bVI–bVII–v (E–C–D–A) so it pulls but never resolves bright; a
    // slow pad breathes stacked open fifths / minor-thirds above (towering canopy). A quiet plucked
    // open-interval arp = shafts of light through the leaves — sparse, far apart, mostly fifths. The
    // lead is barely-there: long lonely tones (E–B–D–F#–C#) with wide rests, like birdsong deep in old
    // growth. Best heard through the `orchestral` style (soft saw pad, triangle lead, no drums).
    forest: { bpm: 96, roles: {
      bass: [["E2", 8], ["B2", 8], ["C2", 8], ["G2", 8], ["D2", 8], ["A2", 8], ["A2", 8], ["E2", 8],
             ["E2", 8], ["B2", 8], ["C2", 8], ["G2", 8], ["D2", 8], ["A2", 8], ["B1", 8], ["E2", 8]],
      pad: [["B3", 16], ["G3", 16], ["G3", 16], ["E3", 16],
            ["A3", 16], ["E3", 16], ["F#3", 16], ["B3", 16]],
      arp: [["E4", 4], ["r", 4], ["B4", 4], ["r", 4], ["r", 8], ["G4", 4], ["r", 4],
            ["D4", 4], ["r", 4], ["A4", 4], ["r", 4], ["r", 8], ["F#4", 4], ["r", 4]],
      lead: [["E4", 8], ["r", 8], ["B4", 6], ["r", 10], ["G4", 8], ["r", 8], ["F#4", 8], ["E4", 4], ["r", 12],
             ["A4", 8], ["r", 8], ["C#4", 6], ["r", 10], ["B4", 8], ["r", 8], ["D4", 8], ["r", 4], ["E4", 8], ["r", 4]],
    } },
    // Goldmeadow Plains / "the Breadbasket" overworld theme — BITTERSWEET + MARTIAL. The pastoral
    // `field`'s wide-open, war-front sibling: where Greenvale is restless A-minor and Silverwood is a
    // hushed Dorian canopy, Goldmeadow is bright, fast and EXPOSED — wind-over-wheat openness shot
    // through with a marching pulse (the breadbasket is beautiful AND burning). D MIXOLYDIAN (D E F#
    // G A B C-nat): a major-bright tonic that the FLATTENED SEVENTH (C-natural over the bVII / G and
    // C bars) keeps from ever feeling safe — that's the undercurrent of threat. Brisk 132 BPM with a
    // light MARCHING drum (steady kick on the beat, snare backbeat, hat 8ths — a column on the move,
    // never a battle beat). 16-bar loop in two 8-bar halves: A strides out across open country
    // (D·A·G·D — I–V–bVII–I, the bVII souring the lift), B answers and presses on without resolving
    // home clean (G·D·C·A — bVII–I–bVII-of-C·V, left hanging on the dominant). A confident, singable
    // lead (the wheat-and-banners tune) rides a *walking* root-fifth bass (the march), a warm
    // sustained pad (the open sky), and a steady running 8th/16th arp = wind combing the wheat.
    // Best through the `heroic` style (square lead + driving drums) for the martial bite; the
    // `orchestral` style softens it to the pastoral side. Slots in as a `field`-family overworld cue.
    plains: { bpm: 132, roles: {
      bass: [["D2", 4], ["A2", 4], ["A1", 4], ["E2", 4], ["G1", 4], ["D2", 4], ["A1", 4], ["A2", 4],
             ["G1", 4], ["D2", 4], ["G2", 4], ["D2", 4], ["C2", 4], ["G2", 4], ["A1", 4], ["A2", 4]],
      pad: [["F#3", 8], ["D3", 8], ["A3", 8], ["E3", 8], ["B3", 8], ["G3", 8], ["A3", 8], ["F#3", 8],
            ["B3", 8], ["G3", 8], ["F#3", 8], ["D3", 8], ["E3", 8], ["C3", 8], ["E3", 8], ["A3", 8]],
      arp: [["D4", 2], ["F#4", 2], ["A4", 2], ["F#4", 2], ["E4", 2], ["A4", 2], ["C#5", 2], ["A4", 2],
            ["G3", 2], ["B3", 2], ["D4", 2], ["B3", 2], ["D4", 2], ["F#4", 2], ["A4", 2], ["F#4", 2],
            ["G3", 2], ["B3", 2], ["D4", 2], ["B3", 2], ["D4", 2], ["A4", 2], ["F#4", 2], ["D4", 2],
            ["C4", 2], ["E4", 2], ["G4", 2], ["E4", 2], ["E4", 2], ["A4", 2], ["C#5", 2], ["A4", 2]],
      drums: [["K", 4], ["H", 2], ["H", 2], ["S", 4], ["H", 2], ["H", 2], ["K", 4], ["H", 2], ["H", 2], ["S", 4], ["H", 2], ["K", 2]],
      lead: [["D5", 4], ["A4", 2], ["B4", 2], ["A4", 4], ["F#4", 4], ["G4", 4], ["A4", 4], ["B4", 6], ["A4", 2],
             ["G4", 4], ["F#4", 2], ["E4", 2], ["D4", 4], ["E4", 4], ["F#4", 8], ["A4", 4], ["D5", 4],
             ["B4", 4], ["A4", 4], ["G4", 6], ["F#4", 2], ["D4", 4], ["F#4", 4], ["A4", 6], ["B4", 2],
             ["C5", 4], ["B4", 2], ["A4", 2], ["G4", 4], ["F#4", 4], ["E4", 8], ["A4", 4], ["A4", 4]],
    } },
    // Goldmeadow dungeon / "the occupied windmill & granary undercroft" theme — TIGHT, TENSE,
    // ENCLOSED. The plains theme's claustrophobic underside: the open D-mixolydian sky collapses to
    // D HARMONIC MINOR (D E F G A Bb C#) — minor and grim, with the raised leading-tone C# grinding
    // against the C-natural the overworld leaned on (the enemy has moved indoors). A coiled 120 BPM
    // (a hair under the field's march), no swing. Sibling to the Warren/Grove/Vault cues but tauter:
    // a low, pulsing repeated-tone bass (boots pacing a stone undercroft), a cold close-voiced pad
    // breathing minor-2nd/tritone clusters (Bb against A, F against E), and a SPARSE, prowling lead
    // — short anxious motifs (D–F–E, Bb–A, C#→D) with long rests between them, like rounding a
    // corner not knowing what's there. A bare drum: muffled kick + an occasional snare hit, no hats
    // (no open air). 16-bar loop, two 8-bar halves that tighten the screw rather than resolve. Best
    // through `orchestral` (no drums → pure dread) or `radiant` (the soft kick = footsteps).
    granary: { bpm: 120, roles: {
      bass: [["D2", 2], ["D2", 2], ["D2", 4], ["A1", 2], ["A1", 2], ["Bb1", 4], ["D2", 2], ["D2", 2], ["D2", 4], ["G1", 2], ["A1", 2], ["A1", 4],
             ["D2", 2], ["D2", 2], ["D2", 4], ["Bb1", 2], ["Bb1", 2], ["C#2", 4], ["D2", 2], ["D2", 2], ["F2", 4], ["A1", 2], ["A1", 2], ["A1", 4]],
      pad: [["F3", 16], ["A3", 16], ["Bb3", 16], ["A3", 16], ["F3", 16], ["Eb3", 16], ["E3", 16], ["A3", 16]],
      arp: [["D4", 2], ["r", 6], ["A3", 2], ["r", 6], ["Bb3", 2], ["r", 6], ["A3", 2], ["r", 6],
            ["F3", 2], ["r", 6], ["C#4", 2], ["r", 6], ["D4", 2], ["r", 6], ["A3", 2], ["r", 6]],
      drums: [["K", 4], ["r", 4], ["K", 4], ["S", 4], ["K", 4], ["r", 4], ["K", 4], ["r", 2], ["S", 2]],
      lead: [["D5", 4], ["F5", 2], ["E5", 2], ["r", 8], ["A4", 4], ["Bb4", 4], ["r", 8],
             ["F5", 4], ["E5", 4], ["D5", 4], ["C#5", 4], ["D5", 6], ["r", 10],
             ["A4", 4], ["Bb4", 2], ["A4", 2], ["r", 8], ["F4", 4], ["G4", 4], ["r", 8],
             ["Bb4", 4], ["A4", 4], ["C#5", 4], ["D5", 4], ["r", 16]],
    } },
    // Goldmeadow boss / "the Warlord of the Host" theme — the build's BIGGEST, MOST MARTIAL statement.
    // The shared `boss` cue (D minor, 134) made bigger and angrier for the war-front endgame: same D
    // tonal centre so it reads as kin, but pushed to a pounding 144 BPM and built on a HARMONIC-minor
    // war-march (D E F G A Bb C#) — the raised C# leading-tone gives every phrase a vicious upward
    // snap into the tonic. A relentless DOUBLE-KICK + snare war-drum (kick on every beat, snare
    // backbeat, driving). A heavy octave-pumping root bass (the host advancing), a brass-like pad
    // stabbing the chords (Dm·Bb·Gm·A — i–bVI–iv–V, the V landing hard on the C#-major dominant for
    // menace), and a commanding lead that climbs the harmonic-minor scale and hammers the tonic — the
    // warlord's banner-call. 16 bars, no rest, no let-up. Best through `heroic` (square lead + full
    // drums) for maximum bite. Selected per-boss via `Music.forBoss(zoneId)` so only Goldmeadow's
    // warlord gets it; every other boss keeps the shared `boss` cue.
    warlord: { bpm: 144, roles: {
      bass: [["D2", 2], ["D1", 2], ["D2", 2], ["D1", 2], ["D2", 2], ["D1", 2], ["A1", 2], ["A2", 2],
             ["Bb1", 2], ["Bb0", 2], ["Bb1", 2], ["F2", 2], ["A1", 2], ["A2", 2], ["A1", 2], ["C#2", 2],
             ["D2", 2], ["D1", 2], ["D2", 2], ["D1", 2], ["G1", 2], ["G2", 2], ["G1", 2], ["Bb1", 2],
             ["A1", 2], ["A2", 2], ["A1", 2], ["E2", 2], ["A1", 2], ["C#2", 2], ["A1", 2], ["A2", 2]],
      pad: [["F3", 4], ["A3", 4], ["D4", 8], ["D3", 4], ["F3", 4], ["Bb3", 8],
            ["Bb2", 4], ["D3", 4], ["G3", 8], ["A2", 4], ["C#3", 4], ["E3", 8]],
      drums: [["K", 2], ["K", 2], ["S", 2], ["K", 2], ["K", 2], ["K", 2], ["S", 2], ["K", 2],
              ["K", 2], ["K", 2], ["S", 2], ["K", 2], ["K", 2], ["S", 2], ["S", 2], ["S", 2]],
      lead: [["D4", 2], ["F4", 2], ["A4", 2], ["D5", 2], ["C#5", 2], ["D5", 2], ["A4", 4],
             ["Bb4", 2], ["A4", 2], ["G4", 2], ["F4", 2], ["E4", 4], ["F4", 2], ["A4", 2],
             ["D5", 2], ["C#5", 2], ["D5", 2], ["F5", 2], ["E5", 2], ["D5", 2], ["C#5", 2], ["A4", 2],
             ["Bb4", 2], ["C#5", 2], ["D5", 4], ["A4", 2], ["F4", 2], ["E4", 2], ["D4", 4]],
    } },
    // Riverhearth / city theme — grand, bustling, prosperous trade-capital cue. The warm `village`'s
    // big-city cousin: brighter (C major, no Lydian wink — just confident, open major), faster (112
    // BPM vs the village's relaxed 92) and fuller — the only town theme with drums (a soft, swung
    // kick+hat market-pulse, never a battle beat). 16-bar loop in two stately 8-bar halves: A struts
    // a proud I–vi–IV–V (C·Am·F·G), B answers and lands home (C·F·G·C). A confident singable lead over
    // a warm sustained pad and a *walking* root-fifth bass (commerce on the move); a fast, flowing
    // 16th-note arp under it all = the river current and the chatter of crowds. Upbeat, civic, warm —
    // unmistakably a thriving city, distinct from cozy `village`, cold `marsh`, restless `field`.
    city: { bpm: 112, roles: {
      bass: [["C2", 4], ["G2", 4], ["A1", 4], ["E2", 4], ["F2", 4], ["C2", 4], ["G2", 4], ["B1", 4],
             ["C2", 4], ["G2", 4], ["F2", 4], ["C2", 4], ["F2", 4], ["G2", 4], ["C2", 4], ["G1", 4]],
      pad: [["E3", 8], ["C3", 8], ["A3", 8], ["E3", 8], ["A3", 8], ["F3", 8], ["B3", 8], ["G3", 8],
            ["E3", 8], ["C3", 8], ["A3", 8], ["F3", 8], ["A3", 8], ["F3", 8], ["G3", 8], ["G3", 8]],
      arp: [["C4", 2], ["E4", 2], ["G4", 2], ["E4", 2], ["A3", 2], ["C4", 2], ["E4", 2], ["C4", 2],
            ["F3", 2], ["A3", 2], ["C4", 2], ["A3", 2], ["G3", 2], ["B3", 2], ["D4", 2], ["B3", 2],
            ["C4", 2], ["E4", 2], ["G4", 2], ["E4", 2], ["F3", 2], ["A3", 2], ["C4", 2], ["A3", 2],
            ["G3", 2], ["B3", 2], ["D4", 2], ["B3", 2], ["C4", 2], ["G4", 2], ["E4", 2], ["G4", 2]],
      drums: [["K", 4], ["H", 2], ["H", 2], ["S", 4], ["H", 2], ["K", 2], ["K", 4], ["H", 2], ["H", 2], ["S", 4], ["H", 2], ["H", 2]],
      lead: [["G4", 4], ["C5", 4], ["E5", 6], ["D5", 2], ["C5", 4], ["E5", 4], ["A4", 6], ["C5", 2],
             ["F5", 4], ["E5", 4], ["D5", 4], ["B4", 4], ["C5", 8], ["G4", 4], ["E4", 4],
             ["G4", 4], ["C5", 4], ["E5", 6], ["G5", 2], ["F5", 4], ["E5", 4], ["D5", 6], ["C5", 2],
             ["E5", 4], ["G5", 4], ["F5", 4], ["D5", 4], ["C5", 12], ["r", 4]],
    } },
    battle: { bpm: 152, roles: {
      bass: [["A2", 2], ["A2", 2], ["A2", 2], ["A2", 2], ["E2", 2], ["E2", 2], ["E2", 2], ["E2", 2], ["A2", 2], ["A2", 2], ["A2", 2], ["A2", 2], ["G2", 2], ["G2", 2], ["G2", 2], ["G2", 2]],
      drums: [["K", 2], ["H", 2], ["S", 2], ["H", 2], ["K", 2], ["H", 2], ["S", 2], ["H", 2], ["K", 2], ["H", 2], ["S", 2], ["H", 2], ["K", 2], ["H", 2], ["S", 2], ["H", 2]],
      lead: [["A4", 2], ["C5", 2], ["E5", 2], ["C5", 2], ["E4", 2], ["G#4", 2], ["B4", 2], ["G#4", 2], ["A4", 2], ["E5", 2], ["C5", 2], ["A4", 2], ["G4", 2], ["B4", 2], ["D5", 2], ["B4", 2]],
    } },
    boss: { bpm: 134, roles: {
      bass: [["D2", 2], ["D2", 2], ["D2", 2], ["D2", 2], ["Bb1", 2], ["Bb1", 2], ["Bb1", 2], ["Bb1", 2], ["C2", 2], ["C2", 2], ["C2", 2], ["C2", 2], ["A1", 2], ["A1", 2], ["A1", 2], ["A1", 2]],
      drums: [["K", 2], ["H", 2], ["K", 2], ["S", 2], ["K", 2], ["H", 2], ["K", 2], ["S", 2], ["K", 2], ["H", 2], ["K", 2], ["S", 2], ["K", 2], ["H", 2], ["S", 2], ["S", 2]],
      lead: [["D4", 2], ["F4", 2], ["A4", 2], ["F4", 2], ["D4", 2], ["F4", 2], ["Bb4", 2], ["A4", 2], ["E4", 2], ["G4", 2], ["C5", 2], ["B4", 2], ["C#5", 2], ["A4", 2], ["E4", 2], ["C#5", 2]],
    } },
    victory: { bpm: 140, loop: false, roles: {
      lead: [["G4", 2], ["C5", 2], ["E5", 2], ["G5", 6], ["E5", 2], ["G5", 2], ["C6", 8]],
      bass: [["C3", 8], ["G2", 8], ["C3", 8]],
    } },
  } as Record<string, Song>,

  STYLES: {
    radiant: { tempo: 1.0, roles: {
      bass: { w: "triangle", vol: 0.46, gate: 0.88 }, pad: { w: "triangle", vol: 0.15, atk: 0.05, gate: 0.98, rel: 0.25 },
      arp: { w: "square", vol: 0.14, gate: 0.5 }, lead: { w: "square", vol: 0.32, gate: 0.82 }, drums: { drum: true, vol: 1 },
    } },
    orchestral: { tempo: 0.9, roles: {
      bass: { w: "triangle", vol: 0.34, gate: 0.96, rel: 0.3 }, pad: { w: "sawtooth", vol: 0.12, atk: 0.1, gate: 0.99, rel: 0.4, cutoff: 1100, detune: 8 },
      arp: { w: "triangle", vol: 0.1, atk: 0.03, gate: 0.7 }, lead: { w: "triangle", vol: 0.27, atk: 0.05, gate: 0.92, rel: 0.2 }, drums: null,
    } },
    heroic: { tempo: 1.18, roles: {
      bass: { w: "triangle", vol: 0.46, gate: 0.8 }, pad: { w: "square", vol: 0.12, gate: 0.6 },
      arp: { w: "square", vol: 0.2, gate: 0.5 }, lead: { w: "square", vol: 0.34, gate: 0.86 }, drums: { drum: true, vol: 1 },
    } },
  } as Record<string, Style>,

  load(): void {
    try {
      this.muted = localStorage.getItem("gaia_muted") === "1";
      for (const s of Object.keys(this.styleByState)) {
        const v = localStorage.getItem("gaia_style_" + s);
        if (v && this.STYLES[v]) this.styleByState[s] = v;
      }
    } catch { /* ignore */ }
    this._renderBtns();
    this._renderStyleLabels();
  },
  cycleStyle(state: string): void {
    if (!this.SONGS[state]) state = "title";
    const o = this.STYLE_ORDER;
    this.styleByState[state] = o[(o.indexOf(this.styleByState[state] || "radiant") + 1) % o.length];
    try { localStorage.setItem("gaia_style_" + state, this.styleByState[state]); } catch { /* ignore */ }
    this.unlock();
    if (this.cur === state) this._switch(state);
    this._renderStyleLabels();
  },
  _renderStyleLabels(): void {
    const capf = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    const set = (sel: string, state: string) => {
      const e = document.querySelector(sel);
      if (e) e.textContent = capf(this.styleByState[state] || "radiant");
    };
    set("#st-title", "title");
    // The field HUD's style pill reflects whichever overworld track is playing — the open-field /
    // grim-mire zone theme, or the village / fog-bound-outpost theme while in a settlement.
    set("#st-field", (["village", "city", "mire", "marsh", "forest", "plains", "granary"].includes(this.cur || "") ? this.cur : "field") as string);
    set("#st-battle", this.cur === "boss" || this.cur === "warlord" || this.cur === "battle" ? this.cur : "battle");
  },
  unlock(): void {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      try { this.ctx = new AC(); } catch { return; }
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.vol;
      // Route through an <audio> element via a MediaStream so iOS plays on the MEDIA channel
      // and ignores the ring/silent switch. Fall back to direct output if unsupported.
      try {
        this.sink = this.ctx.createMediaStreamDestination();
        this.master.connect(this.sink);
        const el = document.createElement("audio");
        el.setAttribute("playsinline", ""); el.setAttribute("webkit-playsinline", ""); el.autoplay = true; el.loop = true;
        el.srcObject = this.sink.stream;
        (document.body || document.documentElement).appendChild(el);
        this.el = el; this.route = "media";
      } catch {
        this.master.connect(this.ctx.destination); this.route = "direct";
      }
      this.started = true;
      this._start(this.pending);
      this._timer = setInterval(() => this._sched(), this.TICK);
    }
    if (this.el) {
      try { const p = this.el.play(); if (p && p.catch) p.catch(() => { /* retry next gesture */ }); } catch { /* ignore */ }
    }
    if (this.ctx.state !== "running" && this.ctx.resume) {
      this.ctx.resume();
      if (this.track) {
        const t0 = this.ctx.currentTime + 0.06;
        this.cursors.forEach((c) => { if (c.next !== Infinity) c.next = t0; });
      }
    }
    this._renderBtns();
  },
  status(): string {
    return (this.ctx ? this.ctx.state : "none") + " · " + (this.route || "-") + (this.muted ? " · muted" : "");
  },
  play(state: string): void {
    this.pending = state;
    if (this.started && this.cur !== state) this._switch(state);
  },
  // ── Shared FIELD theme selector (Stage 2C) ──────────────────────────────────────────────────
  // One place both the discrete screen switcher (screens.ts) and the seamless big-map (field.ts
  // bigMove) resolve which overworld song to play from the player's IDENTITY at their position.
  // Inputs are the Area's music key (AreaIdentity.music: "field"/"forest"/"mire") with a Zone id
  // fallback (silverwood→forest, duskmarsh→mire) and an OPEN-CONTINENT ambient default (no Area, no
  // built zone) — backlog land outside the built cores rides the restless `field` cue until it's
  // built out. The result is a SONGS key; the caller duck-swaps via play() only when the key changes.
  forField(areaMusic?: string, zoneId?: string): string {
    if (areaMusic && this.SONGS[areaMusic as keyof typeof this.SONGS]) return areaMusic;
    if (zoneId === "silverwood") return "forest";
    if (zoneId === "duskmarsh") return "mire";
    if (zoneId === "goldmeadow") return "plains";
    return "field"; // open continent / unknown → the ambient overworld cue
  },
  // Per-zone BOSS cue selector. Most bosses share the generic `boss` SONG; a zone can claim its own
  // boss-variant here. Goldmeadow's warlord gets the bigger, more martial `warlord` statement. The
  // battle controller calls this in place of the hard-coded "boss" key when starting a boss fight.
  forBoss(zoneId?: string): string {
    if (zoneId === "goldmeadow") return "warlord";
    return "boss";
  },
  // Per-zone DUNGEON cue selector. Most dungeons ride the overworld cue (return ""); a zone can claim
  // its own enclosed dungeon theme. Goldmeadow's windmill undercroft gets the tense `granary` cue.
  // The field controller switches to this on descend when it's non-empty (and `ascend` restores the
  // overworld cue via the normal key-compare). "" means "keep the current cue".
  forDungeon(zoneId?: string): string {
    if (zoneId === "goldmeadow") return "granary";
    return "";
  },
  _switch(state: string): void {
    if (!this.ctx || !this.master) return;
    const g = this.master.gain, t = this.ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(0.0001, t + 0.12);
    setTimeout(() => {
      if (!this.ctx || !this.master) return;
      this._start(state);
      const tt = this.ctx.currentTime, gg = this.master.gain;
      gg.cancelScheduledValues(tt); gg.setValueAtTime(0.0001, tt); gg.linearRampToValueAtTime(this.muted ? 0 : this.vol, tt + 0.16);
    }, 130);
  },
  // render a screen's SONG through its chosen STYLE into a playable track
  _render(state: string): Track | null {
    const song = this.SONGS[state];
    if (!song) return null;
    const st = this.STYLES[this.styleByState[state] || "radiant"] || this.STYLES.radiant;
    const ch: Channel[] = [];
    for (const role of ["bass", "pad", "arp", "lead", "drums"]) {
      const seq = song.roles[role], v = st.roles[role];
      if (seq && v) ch.push(Object.assign({ seq }, v));
    }
    return { bpm: Math.round(song.bpm * (st.tempo || 1)), loop: song.loop, ch };
  },
  _start(state: string): void {
    if (!this.ctx) return;
    this.cur = state;
    this.track = this._render(state);
    if (!this.track) return;
    this.stepDur = 60 / this.track.bpm / 4;
    const t0 = this.ctx.currentTime + 0.06;
    this.cursors = this.track.ch.map(() => ({ i: 0, next: t0 }));
  },
  _sched(): void {
    if (!this.ctx || !this.track) return;
    const now = this.ctx.currentTime, t = this.track;
    t.ch.forEach((ch, ci) => {
      const cur = this.cursors[ci];
      while (cur.next < now + this.LOOKAHEAD) {
        const ev = ch.seq[cur.i];
        const dur = ev[1] * this.stepDur;
        if (!this.muted && ev[0] && ev[0] !== "r") this._voice(ch, ev[0], cur.next, dur);
        cur.next += dur; cur.i++;
        if (cur.i >= ch.seq.length) {
          if (t.loop === false) cur.next = Infinity;
          else cur.i = 0;
        }
      }
    });
  },
  _voice(ch: Channel, note: string, time: number, dur: number): void {
    const c = this.ctx;
    if (!c || !this.master) return;
    if (ch.drum) { this._drum(note, time); return; }
    const f = noteFreq(note);
    if (!f) return;
    const v = ch.vol || 0.4;
    const atk = ch.atk || 0.006;
    const gate = ch.gate || 0.78;
    const hold = Math.max(atk + 0.01, dur * gate);
    const rel = ch.rel || Math.min(0.07, dur * 0.25);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(v, time + atk);
    g.gain.setValueAtTime(v, time + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, time + hold + rel);
    if (ch.cutoff) {
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = ch.cutoff; g.connect(lp); lp.connect(this.master);
    } else g.connect(this.master);
    const stop = time + hold + rel + 0.05;
    const mk = (det: number) => {
      const o = c.createOscillator(); o.type = ch.w || "square"; o.frequency.value = f; if (det) o.detune.value = det; o.connect(g); o.start(time); o.stop(stop);
    };
    mk(0);
    if (ch.detune) { mk(ch.detune); mk(-ch.detune); } // detuned stack = warm/orchestral
  },
  _drum(note: string, time: number): void {
    const c = this.ctx;
    if (!c || !this.master) return;
    if (note === "K") {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(150, time); o.frequency.exponentialRampToValueAtTime(48, time + 0.12);
      g.gain.setValueAtTime(0.55, time); g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      o.connect(g); g.connect(this.master); o.start(time); o.stop(time + 0.17);
      return;
    }
    const dur = note === "H" ? 0.03 : 0.13;
    const n = c.createBufferSource();
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = note === "H" ? 7000 : 1400;
    const g = c.createGain(); g.gain.setValueAtTime(note === "H" ? 0.1 : 0.28, time); g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    n.connect(hp); hp.connect(g); g.connect(this.master); n.start(time); n.stop(time + dur + 0.02);
  },
  toggleMute(): boolean {
    this.unlock();
    this.muted = !this.muted;
    try { localStorage.setItem("gaia_muted", this.muted ? "1" : "0"); } catch { /* ignore */ }
    if (this.master) this.master.gain.value = this.muted ? 0 : this.vol;
    this._renderBtns();
    return this.muted;
  },
  _renderBtns(): void {
    document.querySelectorAll(".mutebtn").forEach((b) => (b.textContent = this.muted ? "🔇" : "🔊"));
  },
};
