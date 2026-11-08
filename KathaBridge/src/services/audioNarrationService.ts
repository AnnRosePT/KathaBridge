import { LanguageCode } from "../types";

export interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentSentenceIndex: number;
  totalSentences: number;
  rate: number; // 0.75, 1, 1.25, 1.5
  volume: number; // 0 to 1
  currentTimeSeconds: number;
  durationSeconds: number;
  activeLanguage: LanguageCode;
  errorMessage?: string | null;
}

export interface SentenceItem {
  id: string;
  text: string;
}

export class AudioNarrationService {
  private audio: HTMLAudioElement | null = null;
  private sentenceItems: SentenceItem[] = [];
  private currentSentenceIndex = 0;
  private isPaused = false;
  private isPlaying = false;
  private isLoading = false;
  private rate = 1.0;
  private volume = 1.0;
  private activeLanguage: LanguageCode = "EN";
  private onStateChange: ((state: AudioPlaybackState) => void) | null = null;
  private errorMessage: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener("timeupdate", () => {
      this.emitState();
    });

    this.audio.addEventListener("ended", () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentenceItems.length) {
          this.playSentenceAtIndex(this.currentSentenceIndex);
        } else {
          this.stop();
        }
      }
    });

    this.audio.addEventListener("waiting", () => {
      this.isLoading = true;
      this.emitState();
    });

    this.audio.addEventListener("playing", () => {
      this.isLoading = false;
      this.emitState();
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Audio element playback notice:", e);
      this.isLoading = false;

      // Gracefully advance after brief pause
      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIndex++;
        if (this.currentSentenceIndex < this.sentenceItems.length) {
          setTimeout(() => this.playSentenceAtIndex(this.currentSentenceIndex), 400);
        } else {
          this.stop();
        }
      }
    });
  }

  public subscribe(callback: (state: AudioPlaybackState) => void) {
    this.onStateChange = callback;
    this.emitState();
  }

  private emitState() {
    if (this.onStateChange) {
      const currentTime = this.audio ? this.audio.currentTime : 0;
      const duration = this.audio && !isNaN(this.audio.duration) ? this.audio.duration : 4;
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isLoading: this.isLoading,
        currentSentenceIndex: this.currentSentenceIndex,
        totalSentences: this.sentenceItems.length,
        rate: this.rate,
        volume: this.volume,
        currentTimeSeconds: currentTime,
        durationSeconds: duration,
        activeLanguage: this.activeLanguage,
        errorMessage: this.errorMessage
      });
    }
  }

  public loadSentences(sentences: (string | SentenceItem)[], language: LanguageCode) {
    this.stop();

    // Normalize input to SentenceItem format
    this.sentenceItems = sentences.map((s, idx) => {
      if (typeof s === "string") {
        return { id: `custom-${idx}`, text: s };
      }
      return s;
    });

    this.activeLanguage = language;
    this.currentSentenceIndex = 0;
    this.errorMessage = null;
    this.emitState();
  }

  public play(fromIndex?: number) {
    if (this.isPaused && fromIndex === undefined && this.audio) {
      this.audio.playbackRate = this.rate;
      this.audio.volume = this.volume;
      this.audio.play().catch((err) => console.warn("Resume failed:", err));
      this.isPaused = false;
      this.isPlaying = true;
      this.emitState();
      return;
    }

    if (fromIndex !== undefined) {
      this.currentSentenceIndex = fromIndex;
    }

    if (this.currentSentenceIndex >= this.sentenceItems.length) {
      this.currentSentenceIndex = 0;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.playSentenceAtIndex(this.currentSentenceIndex);
  }

  private playSentenceAtIndex(index: number) {
    if (!this.isPlaying || index >= this.sentenceItems.length) {
      this.stop();
      return;
    }

    const item = this.sentenceItems[index];
    const langCode = this.activeLanguage.toLowerCase();

    // Prefer pre-synthesized audio asset first, with dynamic /api/tts fallback
    const directUrl = `/audio/tts/${item.id}_${langCode}.mp3`;
    const fallbackApiUrl = `/api/tts?sentenceId=${encodeURIComponent(item.id)}&lang=${langCode}&text=${encodeURIComponent(item.text)}`;

    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    this.audio.pause();
    this.isLoading = true;
    this.emitState();

    // Try pre-rendered file first
    this.audio.src = directUrl;
    this.audio.playbackRate = this.rate;
    this.audio.volume = this.volume;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to API if direct asset fails
        if (this.audio) {
          this.audio.src = fallbackApiUrl;
          this.audio.playbackRate = this.rate;
          this.audio.volume = this.volume;
          this.audio.play().catch((err) => {
            console.warn("Fallback TTS playback failed:", err);
            this.isLoading = false;
            this.emitState();
          });
        }
      });
    }

    this.emitState();
  }

  public pause() {
    if (!this.audio || !this.isPlaying) return;
    this.audio.pause();
    this.isPaused = true;
    this.isPlaying = false;
    this.emitState();
  }

  public resume() {
    this.play();
  }

  public stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    this.currentSentenceIndex = 0;
    this.emitState();
  }

  public setRate(rate: number) {
    this.rate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.emitState();
  }

  public setVolume(volume: number) {
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume;
    }
    this.emitState();
  }

  public seekSentence(index: number) {
    if (index >= 0 && index < this.sentenceItems.length) {
      this.currentSentenceIndex = index;
      if (this.isPlaying) {
        this.playSentenceAtIndex(index);
      } else {
        this.emitState();
      }
    }
  }

  public getPlaybackState(): AudioPlaybackState {
    const currentTime = this.audio ? this.audio.currentTime : 0;
    const duration = this.audio && !isNaN(this.audio.duration) ? this.audio.duration : 4;
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isLoading: this.isLoading,
      currentSentenceIndex: this.currentSentenceIndex,
      totalSentences: this.sentenceItems.length,
      rate: this.rate,
      volume: this.volume,
      currentTimeSeconds: currentTime,
      durationSeconds: duration,
      activeLanguage: this.activeLanguage,
      errorMessage: this.errorMessage
    };
  }
}
