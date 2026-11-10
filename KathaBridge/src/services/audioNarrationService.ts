import { LanguageCode } from "../types";
import { speakSafely, hasNativeVoiceFor } from "../utils/malayalamPhonetics";

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
  isNativeVoice: boolean;
  voiceLabel: string;
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
  private isNativeVoice = false;
  private voiceLabel = "Detecting voice...";

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.setupAudioListeners();
      this.detectVoice(this.activeLanguage);
    }
  }

  private detectVoice(lang: LanguageCode) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.isNativeVoice = false;
      this.voiceLabel = "Speech Synthesis Unsupported";
      return;
    }

    const check = hasNativeVoiceFor(window.speechSynthesis, lang);
    this.isNativeVoice = check.hasNative;
    if (check.hasNative) {
      this.voiceLabel = `Native ${lang} Voice (${check.voiceName || "System"})`;
    } else {
      if (lang === "ML") {
        this.voiceLabel = "Acoustic Phonetic Synthesis (No ml-IN voice in browser)";
      } else if (lang === "TA") {
        this.voiceLabel = "Tamil Acoustic Phonetic Synthesis (Indian Cadence)";
      } else if (lang === "SA") {
        this.voiceLabel = "Sanskrit Classical Phonetic Synthesis (Devanagari Cadence)";
      } else if (lang === "HI") {
        this.voiceLabel = "Hindi Acoustic Phonetic Synthesis (Devanagari Cadence)";
      } else {
        this.voiceLabel = `Acoustic Fallback (${check.voiceName || "Indian English Accent"})`;
      }
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
      console.warn("HTML5 audio playback failed, falling back to Web Speech:", e);
      this.isLoading = false;
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
        isNativeVoice: this.isNativeVoice,
        voiceLabel: this.voiceLabel,
        errorMessage: this.errorMessage
      });
    }
  }

  public loadSentences(sentences: (string | SentenceItem)[], language: LanguageCode) {
    this.stop();

    this.sentenceItems = sentences.map((s, idx) => {
      if (typeof s === "string") {
        return { id: `custom-${idx}`, text: s };
      }
      return s;
    });

    this.activeLanguage = language;
    this.detectVoice(language);
    this.currentSentenceIndex = 0;
    this.errorMessage = null;
    this.emitState();
  }

  public play(fromIndex?: number) {
    if (this.isPaused && fromIndex === undefined) {
      if (this.isUsingSpeechSynthesis && typeof window !== "undefined" && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          // If browser lost utterance state, replay current sentence cleanly
          this.playSentenceAtIndex(this.currentSentenceIndex);
        }
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

  public replaySentence(index: number) {
    if (index >= 0 && index < this.sentenceItems.length) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (this.audio) {
        this.audio.pause();
      }
      this.currentSentenceIndex = index;
      this.isPlaying = true;
      this.isPaused = false;
      this.playSentenceAtIndex(index);
    }
  }

  private playSentenceAtIndex(index: number) {
    if (!this.isPlaying || index >= this.sentenceItems.length) {
      this.stop();
      return;
    }

    const item = this.sentenceItems[index];
    const langCode = this.activeLanguage.toLowerCase();
    const encoded = encodeURIComponent(item.text);

    // Audio stream URLs for 100% authentic native Indian regional voices
    const targetTtsLang = langCode === "sa" ? "hi" : langCode;
    const directApiUrl = `/api/tts?text=${encoded}&lang=${targetTtsLang}&sentenceId=${item.id}`;
    const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${targetTtsLang}&client=tw-ob`;

    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    this.audio.pause();
    this.isLoading = true;
    this.isUsingSpeechSynthesis = false;
    this.isNativeVoice = true;
    this.voiceLabel = `Native ${this.activeLanguage} Voice (Authentic Regional Accent)`;
    this.emitState();

    this.audio.playbackRate = this.rate;
    this.audio.volume = this.volume;

    // 1. Try server proxy /api/tts first
    this.audio.src = directApiUrl;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // 2. Fall back to direct Google TTS audio stream
        if (!this.audio) return;
        this.audio.src = directGoogleUrl;
        const secondPromise = this.audio.play();
        if (secondPromise !== undefined) {
          secondPromise.catch(() => {
            // 3. Fall back to tuned SpeechSynthesis (0.78x calm storytelling cadence)
            this.playWithSpeechSynthesis(index);
          });
        }
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
      this.errorMessage = "Speech synthesis is unsupported on this browser.";
      this.emitState();
      return;
    }

    if (this.audio) {
      this.audio.pause();
    }

    this.isUsingSpeechSynthesis = true;
    this.isLoading = false;
    this.detectVoice(this.activeLanguage);
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
        console.warn("Speech synthesis error recovery:", err);
        if (this.isPlaying && !this.isPaused) {
          this.currentSentenceIndex++;
          if (this.currentSentenceIndex < this.sentenceItems.length) {
            setTimeout(() => this.playSentenceAtIndex(this.currentSentenceIndex), 250);
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
    this.errorMessage = null;
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
      isNativeVoice: this.isNativeVoice,
      voiceLabel: this.voiceLabel,
      errorMessage: this.errorMessage
    };
  }
}
