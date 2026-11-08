// Comprehensive Malayalam phonetic transliterator and voice matcher for cross-platform SpeechSynthesis

const VOWELS: Record<string, string> = {
  "അ": "a", "ആ": "aa", "ഇ": "i", "ഈ": "ee", "ഉ": "u", "ഊ": "oo",
  "ഋ": "ri", "എ": "e", "ഏ": "e", "ഐ": "ai", "ഒ": "o", "ഓ": "o", "ഔ": "au"
};

const VOWEL_SIGNS: Record<string, string> = {
  "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ri",
  "െ": "e", "േ": "e", "ൈ": "ai", "ൊ": "o", "ോ": "o", "ൌ": "au"
};

const CONSONANTS: Record<string, string> = {
  "ക": "ka", "ഖ": "kha", "ഗ": "ga", "ഘ": "gha", "ങ": "nga",
  "ച": "cha", "ഛ": "chha", "ജ": "ja", "ഝ": "jha", "ഞ": "nja",
  "ട": "ta", "ഠ": "tha", "ഡ": "da", "ഢ": "dha", "ണ": "na",
  "ത": "tha", "ഥ": "tha", "ദ": "da", "ധ": "dha", "ന": "na",
  "പ": "pa", "ഫ": "pha", "ബ": "ba", "ഭ": "bha", "മ": "ma",
  "യ": "ya", "ര": "ra", "ല": "la", "വ": "va", "ശ": "sha",
  "ഷ": "sha", "സ": "sa", "ഹ": "ha", "ള": "la", "ഴ": "zha", "റ": "ra"
};

const CHILLUS: Record<string, string> = {
  "ൽ": "l", "ർ": "r", "ൻ": "n", "ൺ": "n", "ൿ": "k", "ൾ": "l", "ൕ": "n"
};

/**
 * Converts Malayalam script into natural phonetic Latin text.
 * When an operating system lacks native Malayalam TTS (like default Windows),
 * this enables Indian-accented TTS voices to pronounce Malayalam fluently.
 */
export function transliterateMalayalam(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (CHILLUS[ch]) {
      out += CHILLUS[ch];
    } else if (VOWELS[ch]) {
      out += VOWELS[ch];
    } else if (CONSONANTS[ch]) {
      const base = CONSONANTS[ch].slice(0, -1); // remove inherent 'a'
      if (next === "്") { // virama
        if (text[i + 2] && CONSONANTS[text[i + 2]]) {
          out += base;
        } else {
          out += base + "u"; // Malayalam samvruthokaram
        }
        i++; // skip virama
      } else if (next && VOWEL_SIGNS[next]) {
        out += base + VOWEL_SIGNS[next];
        i++; // skip vowel sign
      } else {
        out += base + "a"; // inherent 'a'
      }
    } else if (ch === "ം") {
      out += "m";
    } else if (ch === "ഃ") {
      out += "h";
    } else {
      out += ch;
    }
  }
  return out;
}

export interface VoiceResolution {
  voice: SpeechSynthesisVoice | null;
  effectiveLang: string;
  textToSpeak: string;
}

/**
 * Intelligently resolves the best voice and phonetic text across all browsers.
 */
export function resolveSpeechVoice(synth: SpeechSynthesis, originalText: string, targetLang: "EN" | "ML"): VoiceResolution {
  const voices = synth.getVoices();

  if (targetLang === "ML") {
    // 1. Look for native Malayalam voice
    const nativeMl = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ml") || v.name.toLowerCase().includes("malayalam")
    );
    if (nativeMl) {
      return {
        voice: nativeMl,
        effectiveLang: nativeMl.lang || "ml-IN",
        textToSpeak: originalText
      };
    }

    // 2. Fallback: Use Indian English / Hindi voice with phonetic transliteration
    const inVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("en-in") ||
        v.lang.toLowerCase().includes("hi-in") ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("ravi") ||
        v.name.toLowerCase().includes("heera")
    );

    const fallbackVoice = inVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
    const phoneticText = transliterateMalayalam(originalText);

    return {
      voice: fallbackVoice,
      effectiveLang: inVoice ? inVoice.lang : "en-IN",
      textToSpeak: phoneticText
    };
  }

  // English target
  const enInVoice = voices.find((v) => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("india"));
  const enVoice = enInVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;

  return {
    voice: enVoice,
    effectiveLang: enVoice?.lang || "en-US",
    textToSpeak: originalText
  };
}

/**
 * Safely speaks text with cross-platform resilience for Malayalam and English.
 * Works around Chrome's cancel/resume microtask race and voice pack deficiencies.
 */
export function speakSafely(
  synth: SpeechSynthesis,
  text: string,
  lang: "EN" | "ML",
  options?: {
    rate?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): SpeechSynthesisUtterance {
  synth.cancel();
  synth.resume();

  const resolution = resolveSpeechVoice(synth, text, lang);
  const utterance = new SpeechSynthesisUtterance(resolution.textToSpeak);

  if (resolution.voice) {
    utterance.voice = resolution.voice;
  }
  utterance.lang = resolution.effectiveLang;
  // If speaking Malayalam via transliteration on an English voice, slow down slightly for clear Indian inflection
  utterance.rate =
    options?.rate ?? (lang === "ML" && !resolution.voice?.lang.startsWith("ml") ? 0.85 : 0.95);
  utterance.volume = options?.volume ?? 1.0;

  utterance.onend = () => {
    if (options?.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    if (options?.onError) options.onError(e);
  };

  // A slight 15ms delay ensures Chrome's audio thread finishes cancelling previous speech
  setTimeout(() => {
    try {
      synth.resume();
      synth.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis invoke failed:", err);
      if (options?.onError) options.onError(err);
    }
  }, 15);

  return utterance;
}

