// Devanagari Phonetic Transliterator (Hindi & Sanskrit)
const DEVA_VOWELS: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo",
  "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au"
};

const DEVA_VOWEL_SIGNS: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au"
};

const DEVA_CONSONANTS: Record<string, string> = {
  "क": "ka", "ख": "kha", "ग": "ga", "घ": "gha", "ङ": "nga",
  "च": "cha", "छ": "chha", "ज": "ja", "झ": "jha", "ञ": "nya",
  "ट": "ta", "ठ": "tha", "ड": "da", "ढ": "dha", "ण": "na",
  "त": "ta", "थ": "tha", "द": "da", "ध": "dha", "न": "na",
  "प": "pa", "फ": "pha", "ब": "ba", "भ": "bha", "म": "ma",
  "य": "ya", "र": "ra", "ल": "la", "व": "va",
  "श": "sha", "ष": "sha", "स": "sa", "ह": "ha",
  "क्ष": "ksha", "ज्ञ": "gya"
};

/**
 * Converts Devanagari script (Sanskrit & Hindi) into phonetic Latin text.
 * When browser lacks native Hindi/Sanskrit TTS, enables Indian English TTS to read fluently.
 */
export function transliterateDevanagari(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (DEVA_VOWELS[ch]) {
      out += DEVA_VOWELS[ch];
    } else if (DEVA_CONSONANTS[ch]) {
      const base = DEVA_CONSONANTS[ch].slice(0, -1);
      if (next === "्") { // Virama (halant)
        out += base;
        i++; // skip virama
      } else if (next && DEVA_VOWEL_SIGNS[next]) {
        out += base + DEVA_VOWEL_SIGNS[next];
        i++; // skip vowel sign
      } else {
        out += base + "a";
      }
    } else if (ch === "ं") {
      out += "m";
    } else if (ch === "ः") {
      out += "h";
    } else if (ch === "।" || ch === "॥") {
      out += ". ";
    } else {
      out += ch;
    }
  }
  return out;
}

// Tamil Phonetic Transliterator
const TAMIL_VOWELS: Record<string, string> = {
  "அ": "a", "ஆ": "aa", "இ": "i", "ஈ": "ee", "உ": "u", "ஊ": "oo",
  "எ": "e", "ஏ": "ae", "ஐ": "ai", "ஒ": "o", "ஓ": "o", "ஔ": "au"
};

const TAMIL_VOWEL_SIGNS: Record<string, string> = {
  "ா": "aa", "ி": "i", "ீ": "ee", "ு": "u", "ூ": "oo",
  "ெ": "e", "ே": "ae", "ை": "ai", "ொ": "o", "ோ": "o", "ௌ": "au"
};

const TAMIL_CONSONANTS: Record<string, string> = {
  "க": "ka", "ங": "nga", "ச": "cha", "ஞ": "nya",
  "ட": "ta", "ண": "na", "த": "tha", "ந": "na",
  "ப": "pa", "ம": "ma", "ய": "ya", "ர": "ra",
  "ல": "la", "வ": "va", "ழ": "zha", "ள": "la",
  "ற": "ra", "ன": "na", "ஜ": "ja", "ஷ": "sha",
  "ஸ": "sa", "ஹ": "ha", "க்ஷ": "ksha"
};

/**
 * Converts Tamil script into natural phonetic Latin text.
 * When browser lacks native Tamil TTS, enables Indian English TTS to read fluently.
 */
export function transliterateTamil(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (TAMIL_VOWELS[ch]) {
      out += TAMIL_VOWELS[ch];
    } else if (TAMIL_CONSONANTS[ch]) {
      const base = TAMIL_CONSONANTS[ch].slice(0, -1);
      if (next === "்") { // Pulli (virama)
        out += base;
        i++; // skip pulli
      } else if (next && TAMIL_VOWEL_SIGNS[next]) {
        out += base + TAMIL_VOWEL_SIGNS[next];
        i++; // skip vowel sign
      } else {
        out += base + "a";
      }
    } else if (ch === "ஃ") {
      out += "k";
    } else {
      out += ch;
    }
  }
  return out;
}

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

export interface VoiceCheckResult {
  hasNative: boolean;
  voiceName: string | null;
  lang: string;
}

/**
 * Checks whether an authentic native regional voice pack exists in the host browser.
 */
export function hasNativeVoiceFor(synth: SpeechSynthesis, lang: string): VoiceCheckResult {
  if (!synth || typeof synth.getVoices !== "function") {
    return { hasNative: false, voiceName: null, lang };
  }
  const voices = synth.getVoices();
  const langUpper = lang.toUpperCase();

  if (langUpper === "ML") {
    const native = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ml") || v.name.toLowerCase().includes("malayalam")
    );
    return {
      hasNative: !!native,
      voiceName: native ? native.name : null,
      lang: "ml-IN"
    };
  }

  if (langUpper === "HI") {
    const native = voices.find(
      (v) => v.lang.toLowerCase().startsWith("hi") || v.name.toLowerCase().includes("hindi")
    );
    return {
      hasNative: !!native,
      voiceName: native ? native.name : null,
      lang: "hi-IN"
    };
  }

  if (langUpper === "SA") {
    const native = voices.find(
      (v) => v.lang.toLowerCase().startsWith("sa") || v.name.toLowerCase().includes("sanskrit")
    );
    return {
      hasNative: !!native,
      voiceName: native ? native.name : null,
      lang: "sa-IN"
    };
  }

  if (langUpper === "TA") {
    const native = voices.find(
      (v) => v.lang.toLowerCase().startsWith("ta") || v.name.toLowerCase().includes("tamil")
    );
    return {
      hasNative: !!native,
      voiceName: native ? native.name : null,
      lang: "ta-IN"
    };
  }

  const enNative = voices.find((v) => v.lang.startsWith("en"));
  return {
    hasNative: !!enNative,
    voiceName: enNative ? enNative.name : null,
    lang: "en-US"
  };
}

/**
 * Intelligently resolves the best voice and phonetic text across all browsers.
 */
export function resolveSpeechVoice(synth: SpeechSynthesis, originalText: string, targetLang: string): VoiceResolution {
  const voices = synth.getVoices();
  const langUpper = targetLang.toUpperCase();

  if (langUpper === "ML") {
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

  if (langUpper === "HI" || langUpper === "SA") {
    // 1. Look for native Hindi / Sanskrit Devanagari voice
    const devanagariVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.lang.toLowerCase().startsWith("sa") ||
        v.name.toLowerCase().includes("hindi") ||
        v.name.toLowerCase().includes("swara") ||
        v.name.toLowerCase().includes("madhur")
    );

    if (devanagariVoice) {
      return {
        voice: devanagariVoice,
        effectiveLang: devanagariVoice.lang || "hi-IN",
        textToSpeak: originalText
      };
    }

    // Fallback: Transliterate Devanagari to Latin and use Indian English voice
    const inVoice = voices.find((v) => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("india"));
    const fallbackVoice = inVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
    const phoneticText = transliterateDevanagari(originalText);

    return {
      voice: fallbackVoice,
      effectiveLang: inVoice ? inVoice.lang : "en-IN",
      textToSpeak: phoneticText
    };
  }

  if (langUpper === "TA") {
    // 1. Look for native Tamil voice
    const taVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("ta") ||
        v.name.toLowerCase().includes("tamil") ||
        v.name.toLowerCase().includes("valluvar")
    );

    if (taVoice) {
      return {
        voice: taVoice,
        effectiveLang: taVoice.lang || "ta-IN",
        textToSpeak: originalText
      };
    }

    // Fallback: Transliterate Tamil to Latin and use Indian English voice
    const inVoice = voices.find((v) => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("india"));
    const fallbackVoice = inVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;
    const phoneticText = transliterateTamil(originalText);

    return {
      voice: fallbackVoice,
      effectiveLang: inVoice ? inVoice.lang : "en-IN",
      textToSpeak: phoneticText
    };
  }

  // English or general target
  const enInVoice = voices.find((v) => v.lang.toLowerCase().includes("en-in") || v.name.toLowerCase().includes("india"));
  const enVoice = enInVoice || voices.find((v) => v.lang.startsWith("en")) || voices[0] || null;

  return {
    voice: enVoice,
    effectiveLang: enVoice?.lang || "en-US",
    textToSpeak: originalText
  };
}

/**
 * Safely speaks text with cross-platform resilience for all supported languages.
 * Works around Chrome's cancel/resume microtask race and voice pack deficiencies.
 */
export function speakSafely(
  synth: SpeechSynthesis,
  text: string,
  lang: string,
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
  utterance.rate =
    options?.rate ?? (lang.toUpperCase() === "ML" && !resolution.voice?.lang.startsWith("ml") ? 0.85 : 0.95);
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

