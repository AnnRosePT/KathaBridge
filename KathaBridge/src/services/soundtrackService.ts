// Procedural Indian Classical Ambient BGM & Sound Effects Engine via Web Audio API

export type BGMTrackId = "MOHANAM" | "BHAIRAVI" | "SACRED_GROVE";

export interface BGMTrack {
  id: BGMTrackId;
  name: string;
  raga: string;
  description: string;
}

export const BGM_TRACKS: BGMTrack[] = [
  {
    id: "MOHANAM",
    name: "Raga Mohanam & Temple Bells",
    raga: "Mohanam (Pentatonic Folk Harvest)",
    description: "Uplifting festive ambient drone with shimmering tanpura harmonics and temple bells."
  },
  {
    id: "BHAIRAVI",
    name: "Sacred Dawn Drone (Bhairavi)",
    raga: "Sindhu Bhairavi",
    description: "Meditative oral tradition drone evoking Kerala temple sanctums and ancient storytelling."
  },
  {
    id: "SACRED_GROVE",
    name: "Malabar Grove Ambient",
    raga: "Deep Drone & Bronze Chimes",
    description: "Ethereal forest sanctuary atmosphere with soft resonating brass bowl harmonics."
  }
];

class SoundtrackService {
  private ctx: AudioContext | null = null;
  private isPlayingBgm = false;
  private currentTrack: BGMTrackId = "MOHANAM";
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private loopInterval: number | null = null;
  private bellInterval: number | null = null;
  private bgmVolume = 0.28; // Pleasant background level
  private sfxEnabled = true;
  private onStateChange: ((isPlaying: boolean, track: BGMTrackId, volume: number) => void) | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public subscribe(callback: (isPlaying: boolean, track: BGMTrackId, volume: number) => void) {
    this.onStateChange = callback;
    this.emitState();
  }

  private emitState() {
    if (this.onStateChange) {
      this.onStateChange(this.isPlayingBgm, this.currentTrack, this.bgmVolume);
    }
  }

  public isBgmPlaying(): boolean {
    return this.isPlayingBgm;
  }

  public getTrack(): BGMTrackId {
    return this.currentTrack;
  }

  public getVolume(): number {
    return this.bgmVolume;
  }

  public toggleBGM() {
    if (this.isPlayingBgm) {
      this.stopBGM();
    } else {
      this.playBGM();
    }
  }

  public setTrack(trackId: BGMTrackId) {
    this.currentTrack = trackId;
    if (this.isPlayingBgm) {
      this.stopBGM();
      this.playBGM();
    } else {
      this.emitState();
    }
  }

  public setVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.bgmGain) {
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
    }
    this.emitState();
  }

  public playBGM() {
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.stopBGM();
    this.isPlayingBgm = true;

    // Base root notes: D2 (73.42Hz), A2 (110Hz), D3 (146.83Hz), F#3 (185Hz)
    let rootFreq = 146.83; // D3
    let fifthFreq = 220.0; // A3
    let octFreq = 293.66;  // D4

    if (this.currentTrack === "BHAIRAVI") {
      rootFreq = 138.59; // C#3
      fifthFreq = 207.65; // G#3
      octFreq = 277.18;  // C#4
    } else if (this.currentTrack === "SACRED_GROVE") {
      rootFreq = 110.0;  // A2
      fifthFreq = 164.81; // E3
      octFreq = 220.0;   // A3
    }

    // 1. Shimmering Tanpura Drone Synthesis
    const droneFreqs = [rootFreq * 0.5, rootFreq, fifthFreq, octFreq];

    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Warm lowpass filter to emulate resonance wooden gourd of tanpura
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 3.5, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Subtle LFO modulation for organic acoustic shimmering
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.15, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.008, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      const baseGain = idx === 0 ? 0.35 : 0.14 / (idx + 1);
      gain.gain.setValueAtTime(baseGain, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start();
      this.activeOscillators.push(osc, lfo);
    });

    // 2. Periodic Temple Bell / Bronze Chime strike
    this.playTempleBell();
    this.bellInterval = window.setInterval(() => {
      if (this.isPlayingBgm && Math.random() > 0.25) {
        this.playTempleBell();
      }
    }, 7000);

    // 3. Ambient Raga Meditative Melody Notes
    const ragaNotes =
      this.currentTrack === "MOHANAM"
        ? [rootFreq, rootFreq * 1.125, rootFreq * 1.25, fifthFreq, rootFreq * 1.667, octFreq] // Sa Ri Ga Pa Dha Sa'
        : this.currentTrack === "BHAIRAVI"
        ? [rootFreq, rootFreq * 1.066, rootFreq * 1.2, fifthFreq, rootFreq * 1.6, octFreq] // Sa Re Ga Ma Pa Dha Ni Sa'
        : [rootFreq * 1.5, rootFreq * 2, rootFreq * 2.25, rootFreq * 2.67];

    this.loopInterval = window.setInterval(() => {
      if (this.isPlayingBgm && Math.random() > 0.3) {
        const note = ragaNotes[Math.floor(Math.random() * ragaNotes.length)];
        this.playSoftFluteNote(note);
      }
    }, 4500);

    this.emitState();
  }

  private playTempleBell() {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;

    const bellFreq = this.currentTrack === "SACRED_GROVE" ? 1760 : 2093; // High pure crystal chime

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(bellFreq, now);

    // Overtone oscillator
    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(bellFreq * 2.76, now); // Metallic non-harmonic ratio

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(bellFreq, now);
    filter.Q.setValueAtTime(3.0, now);

    // Exponential long natural decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    overGain.gain.setValueAtTime(0.08, now);
    overGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    overtone.connect(overGain);
    overGain.connect(this.bgmGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 4.6);
    overtone.stop(now + 2.1);
  }

  private playSoftFluteNote(freq: number) {
    if (!this.ctx || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    const duration = 3.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Gentle vibrato
    const vib = this.ctx.createOscillator();
    const vibGain = this.ctx.createGain();
    vib.frequency.setValueAtTime(5.2, now);
    vibGain.gain.setValueAtTime(freq * 0.012, now);
    vib.connect(osc.frequency);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 2.2, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    vib.start(now);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
    vib.stop(now + duration + 0.1);
  }

  public stopBGM() {
    this.isPlayingBgm = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.bellInterval) {
      clearInterval(this.bellInterval);
      this.bellInterval = null;
    }

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
    this.emitState();
  }

  // Tactical Sound Effects (SFX)
  public playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playSuccessChime() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.85);
    });
  }

  public playModalPop() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.1);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Heritage Procedural Soundscapes & Ritual Instruments
  public playShankhaInvocation() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    subOsc.type = "sine";

    // Sacred conch characteristic swell and rising harmonic glissando
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.8);
    osc.frequency.exponentialRampToValueAtTime(277.18, now + 2.2);

    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(146.83, now + 0.8);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(900, now + 0.6);
    filter.frequency.exponentialRampToValueAtTime(300, now + 2.4);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 2.55);
    subOsc.stop(now + 2.55);
  }

  public playChendaUruttu() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 3 rapid resonant cylindrical drum strikes with exponential body resonance
    [0, 0.09, 0.22].forEach((offset, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const strikeTime = now + offset;
      const osc = this.ctx.createOscillator();
      const strikeGain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(idx === 2 ? 140 : 165, strikeTime);
      osc.frequency.exponentialRampToValueAtTime(60, strikeTime + 0.08);

      strikeGain.gain.setValueAtTime(0.35, strikeTime);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.15);

      osc.connect(strikeGain);
      strikeGain.connect(this.sfxGain);

      osc.start(strikeTime);
      osc.stop(strikeTime + 0.16);
    });
  }

  public playTempleManiSolo() {
    this.playTempleBell();
  }
}

export const Soundtrack = new SoundtrackService();

