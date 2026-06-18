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
  styleByState: { title: "radiant", field: "radiant", battle: "radiant", boss: "radiant", victory: "radiant" } as Record<string, string>,
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
    set("#st-field", "field");
    set("#st-battle", this.cur === "boss" || this.cur === "battle" ? this.cur : "battle");
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
