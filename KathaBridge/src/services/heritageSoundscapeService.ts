// Procedural Heritage Soundscape & Environmental Ambience Engine
// Uses Web Audio API to procedurally generate cultural environments without static audio files.

export type SoundscapeEnvironment = 'TEMPLE_SANCTUM' | 'SACRED_GROVE' | 'MONSOON_GHATS';

export interface SoundscapePreset {
  id: SoundscapeEnvironment;
  title: string;
  malayalam: string;
  description: string;
  icon: string;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'TEMPLE_SANCTUM',
    title: 'Kshetram Sanctum',
    malayalam: 'ക്ഷേത്ര ശ്രീകോവിൽ നാദം',
    description: 'Resonant bronze bell harmonics, continuous tanpura fundamental, and distant conch vibrato.',
    icon: '🔔'
  },
  {
    id: 'SACRED_GROVE',
    title: 'Kavu Night Woods',
    malayalam: 'സർപ്പക്കാവ് രാത്രി നാദം',
    description: 'Gentle midnight cicada oscillations, rustling sacred canopy, and soothing bamboo air.',
    icon: '🌿'
  },
  {
    id: 'MONSOON_GHATS',
    title: 'Edavappathi Monsoon',
    malayalam: 'ഇടവപ്പാതി മഴ',
    description: 'Continuous Kerala monsoon rain cadence over terracotta eaves with warm lowpass drone.',
    icon: '🌧️'
  }
];

class HeritageSoundscapeService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentEnv: SoundscapeEnvironment = 'TEMPLE_SANCTUM';
  private masterGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private intervals: number[] = [];

  private initAudio() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startSoundscape(env: SoundscapeEnvironment) {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    this.stopSoundscape();
    this.isPlaying = true;
    this.currentEnv = env;

    if (env === 'TEMPLE_SANCTUM') {
      this.startTempleSanctum();
    } else if (env === 'SACRED_GROVE') {
      this.startSacredGrove();
    } else if (env === 'MONSOON_GHATS') {
      this.startMonsoonGhats();
    }
  }

  public stopSoundscape() {
    this.intervals.forEach((id) => window.clearInterval(id));
    this.intervals = [];

    if (this.noiseNode) {
      try {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public toggle(env: SoundscapeEnvironment) {
    if (this.isPlaying && this.currentEnv === env) {
      this.stopSoundscape();
    } else {
      this.startSoundscape(env);
    }
  }

  public getActiveState(): { isPlaying: boolean; env: SoundscapeEnvironment } {
    return { isPlaying: this.isPlaying, env: this.currentEnv };
  }

  private startTempleSanctum() {
    if (!this.ctx || !this.masterGain) return;

    // Periodic gentle bronze chime
    const playChime = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 3.6);
    };

    playChime();
    this.intervals.push(window.setInterval(playChime, 6000));
  }

  private startSacredGrove() {
    if (!this.ctx || !this.masterGain) return;

    // Modulated high-frequency cicada oscillation
    const playCicadaPulse = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 500, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.3);
    };

    playCicadaPulse();
    this.intervals.push(window.setInterval(playCicadaPulse, 2800));
  }

  private startMonsoonGhats() {
    if (!this.ctx || !this.masterGain) return;

    // White noise buffer for rain with lowpass filtering
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoise.start(0);
    this.noiseNode = whiteNoise;
  }
}

export const HeritageSoundscape = new HeritageSoundscapeService();
