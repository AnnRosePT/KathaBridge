import { LanguageCode, Story } from "../types";
import { mockStories } from "../data/mockData";

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: LanguageCode;
  isHumanVerified: boolean;
  provider: "CURATED_SCHOLAR" | "AI_ASSISTED" | "FALLBACK";
  explanationNotes?: string;
}

export interface ITranslationProvider {
  name: string;
  isAvailable(): boolean;
  translate(text: string, fromLang: string, toLang: LanguageCode): Promise<TranslationResult>;
}

/**
 * Primary Curated Provider:
 * Uses human-reviewed folklorist translations from the KathaBridge scholarly archive.
 */
class LocalCuratedTranslationProvider implements ITranslationProvider {
  name = "KathaBridge Curated Archive";

  isAvailable(): boolean {
    return true;
  }

  async translate(text: string, fromLang: string, toLang: LanguageCode): Promise<TranslationResult> {
    for (const story of mockStories) {
      for (const sentence of story.sentences) {
        if (sentence.originalText === text || sentence.translatedText.EN === text || sentence.translatedText.ML === text) {
          const match = sentence.translatedText[toLang as "EN" | "ML"];
          if (match) {
            return {
              translatedText: match,
              sourceLanguage: fromLang,
              targetLanguage: toLang,
              isHumanVerified: true,
              provider: "CURATED_SCHOLAR",
              explanationNotes: "Verified by KathaBridge Folklore Scholar Review Committee."
            };
          }
        }
      }
    }

    return {
      translatedText: text,
      sourceLanguage: fromLang,
      targetLanguage: toLang,
      isHumanVerified: false,
      provider: "FALLBACK",
      explanationNotes: "Translation awaiting folklorist peer-review."
    };
  }
}

/**
 * Live Google Gemini 2.5 Flash Neural Translation Provider:
 * Directly connected via VITE_GEMINI_API_KEY.
 */
class ExternalAITranslationProvider implements ITranslationProvider {
  name = "Gemini 2.5 Flash Neural Engine";

  private getApiKey(): string {
    return (
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof process !== "undefined" && process.env?.VITE_GEMINI_API_KEY) ||
      ""
    );
  }

  isAvailable(): boolean {
    return Boolean(this.getApiKey());
  }

  async translate(text: string, fromLang: string, toLang: LanguageCode): Promise<TranslationResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    try {
      const targetLangName =
        toLang === "ML" ? "Malayalam" :
        toLang === "TA" ? "Tamil" :
        toLang === "SA" ? "Sanskrit" :
        toLang === "HI" ? "Hindi" : "English";

      const prompt = `You are a distinguished folklorist and literary translator specializing in Indian languages (Malayalam, Sanskrit, Tamil, Hindi) and English.
Translate the following folklore text from ${fromLang} to ${targetLangName}.
Preserve cultural nuance, dialect rhythm, and emotional subtext without reducing it to a mechanical translation.

Return a valid JSON object matching this schema:
{
  "translatedText": "string - translated narrative line",
  "culturalNotes": "string - 1 to 2 sentences explaining regional context, idioms, or ritual meaning"
}

Text to translate:
"${text}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          translatedText: parsed.translatedText || text,
          sourceLanguage: fromLang,
          targetLanguage: toLang,
          isHumanVerified: false,
          provider: "AI_ASSISTED",
          explanationNotes: `[AI Draft via Gemini]: ${parsed.culturalNotes || "Awaiting scholar peer-review"}`
        };
      }
    } catch (err) {
      console.warn("Live Gemini translation fallback:", err);
    }

    return {
      translatedText: text,
      sourceLanguage: fromLang,
      targetLanguage: toLang,
      isHumanVerified: false,
      provider: "FALLBACK",
      explanationNotes: "Translation fallback. Marked for Scholar Peer-Review."
    };
  }

  /**
   * Generates AI-assisted cultural term explanations for the Reviewer Workstation.
   */
  async generateCulturalAnalysis(term: string, context: string): Promise<{
    literalTranslation: string;
    contextualMeaning: string;
    culturalSignificance: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        literalTranslation: term,
        contextualMeaning: "Cultural context awaiting human folklorist review.",
        culturalSignificance: "Regional oral tradition."
      };
    }

    try {
      const prompt = `You are a senior anthropologist and folklorist of Indian cultural heritage.
Analyze the following regional expression or term: "${term}"
Found in context: "${context}"

Return a valid JSON object matching this schema:
{
  "literalTranslation": "exact word-by-word literal meaning",
  "contextualMeaning": "idiomatic and philosophical meaning in context",
  "culturalSignificance": "ritual, ecological, agrarian or historical significance in Kerala/Indian folklore"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
          })
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn("Failed generating AI cultural analysis:", e);
    }

    return {
      literalTranslation: term,
      contextualMeaning: "Awaiting folklorist validation.",
      culturalSignificance: "Documented community folklore."
    };
  }
}

class TranslationServiceManager {
  private curatedProvider = new LocalCuratedTranslationProvider();
  private aiProvider = new ExternalAITranslationProvider();

  public getActiveProvider(): ITranslationProvider {
    if (this.aiProvider.isAvailable()) {
      return this.aiProvider;
    }
    return this.curatedProvider;
  }

  public isAIActive(): boolean {
    return this.aiProvider.isAvailable();
  }

  public async translateText(text: string, fromLang: string, toLang: LanguageCode): Promise<TranslationResult> {
    // Check curated archive first for verified content
    const curated = await this.curatedProvider.translate(text, fromLang, toLang);
    if (curated.isHumanVerified) {
      return curated;
    }

    // If uncurated and Gemini AI is available, generate neural draft
    if (this.aiProvider.isAvailable()) {
      return this.aiProvider.translate(text, fromLang, toLang);
    }

    return curated;
  }

  public async generateCulturalAnalysis(term: string, context: string) {
    return this.aiProvider.generateCulturalAnalysis(term, context);
  }
}

export const TranslationService = new TranslationServiceManager();
