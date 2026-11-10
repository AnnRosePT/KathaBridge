import { LanguageCode } from "../types";
import { speakSafely } from "../utils/malayalamPhonetics";

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
  private isUsingSpeechSynthesis = false;
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

    this.audio.addEventListener("error", () => {
      this.isLoading = false;
      // If audio file playback errors, immediately switch to Web Speech Synthesis fallback!
      if (this.isPlaying && !this.isPaused) {
        this.playWithSpeechSynthesis(this.currentSentenceIndex);
      }
    });
  }

  public subscribe(callback: (state: AudioPlaybackState) => void) {
    this.onStateChange = callback;
    this.emitState();
  }

  private emitState() {
    if (this.onStateChange) {
      const currentTime = this.audio && !this.isUsingSpeechSynthesis ? this.audio.currentTime : 0;
      const duration = this.audio && !isNaN(this.audio.duration) && !this.isUsingSpeechSynthesis ? this.audio.duration : 4;
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
    if (this.isPaused && fromIndex === undefined) {
      if (this.isUsingSpeechSynthesis && typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.resume();
        this.isPaused = false;
        this.isPlaying = true;
        this.emitState();
        return;
      }
      if (this.audio) {
        this.audio.playbackRate = this.rate;
        this.audio.volume = this.volume;
        this.audio.play().catch(() => this.playWithSpeechSynthesis(this.currentSentenceIndex));
        this.isPaused = false;
        this.isPlaying = true;
        this.emitState();
        return;
      }
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

    // For Sanskrit (sa), Tamil (ta), and Hindi (hi), use native Speech Synthesis immediately
    // For English (en) and Malayalam (ml), attempt pre-rendered static MP3 first
    if (langCode === "sa" || langCode === "ta" || langCode === "hi") {
      this.playWithSpeechSynthesis(index);
      return;
    }

    const directUrl = `/audio/tts/${item.id}_${langCode}.mp3`;

    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    this.audio.pause();
    this.isLoading = true;
    this.isUsingSpeechSynthesis = false;
    this.emitState();

    this.audio.src = directUrl;
    this.audio.playbackRate = this.rate;
    this.audio.volume = this.volume;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fall back to Web Speech Synthesis if audio asset is missing
        this.playWithSpeechSynthesis(index);
      });
    }
  }

  private playWithSpeechSynthesis(index: number) {
    if (!this.isPlaying || index >= this.sentenceItems.length) {
      this.stop();
      return;
    }

    const item = this.sentenceItems[index];
    if (typeof window === "undefined" || !window.speechSynthesis) {
      this.isLoading = false;
      this.emitState();
      return;
    }

    if (this.audio) {
      this.audio.pause();
    }

    this.isUsingSpeechSynthesis = true;
    this.isLoading = false;
    this.emitState();

    speakSafely(window.speechSynthesis, item.text, this.activeLanguage, {
      rate: this.rate,
      volume: this.volume,
      onEnd: () => {
        if (this.isPlaying && !this.isPaused) {
          this.currentSentenceIndex++;
          if (this.currentSentenceIndex < this.sentenceItems.length) {
            this.playSentenceAtIndex(this.currentSentenceIndex);
          } else {
            this.stop();
          }
        }
      },
      onError: (err) => {
        console.warn("Speech synthesis notice:", err);
        if (this.isPlaying && !this.isPaused) {
          this.currentSentenceIndex++;
          if (this.currentSentenceIndex < this.sentenceItems.length) {
            setTimeout(() => this.playSentenceAtIndex(this.currentSentenceIndex), 300);
          } else {
            this.stop();
          }
        }
      }
    });
  }

  public pause() {
    this.isPaused = true;
    this.isPlaying = false;
    if (this.isUsingSpeechSynthesis && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (this.audio) {
      this.audio.pause();
    }
    this.emitState();
  }

  public resume() {
    this.play();
  }

  public stop() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.isLoading = false;
    this.isUsingSpeechSynthesis = false;
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
    const currentTime = this.audio && !this.isUsingSpeechSynthesis ? this.audio.currentTime : 0;
    const duration = this.audio && !isNaN(this.audio.duration) && !this.isUsingSpeechSynthesis ? this.audio.duration : 4;

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
