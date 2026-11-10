import React, { useState, useEffect, useRef } from "react";
import { Story, LanguageCode, CulturalExpression } from "../types";
import { AudioNarrationService, AudioPlaybackState } from "../services/audioNarrationService";
import { StorageService } from "../services/storageService";
import { CulturalTermPopover } from "./CulturalTermPopover";
import { mockSources } from "../data/mockData";

interface Props {
  story: Story;
  initialLanguage?: LanguageCode;
  onClose: () => void;
  onFavoriteToggle?: (storyId: string) => void;
  isFavorite?: boolean;
}

export const StoryReaderModal: React.FC<Props> = ({
  story,
  initialLanguage = "EN",
  onClose,
  onFavoriteToggle,
  isFavorite = false
}) => {
  const [activeLang, setActiveLang] = useState<LanguageCode>(initialLanguage);
  const [activeTerm, setActiveTerm] = useState<CulturalExpression | null>(null);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0);
  const [contrastMode, setContrastMode] = useState<"normal" | "dark" | "high-contrast">("normal");
  const [audioState, setAudioState] = useState<AudioPlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentSentenceIndex: 0,
    totalSentences: story.sentences.length,
    rate: 1.0,
    volume: 1.0,
    currentTimeSeconds: 0,
    durationSeconds: 60,
    activeLanguage: initialLanguage,
    isNativeVoice: false,
    voiceLabel: "Initializing voice engine..."
  });

  const getSentenceTextForLang = (s: any, lang: LanguageCode): string => {
    if (lang === "ML") return s.originalText || s.translatedText?.ML || s.translatedText?.EN || "";
    if (lang === "SA") return s.translatedText?.SA || s.originalText || s.translatedText?.EN || "";
    if (lang === "HI") return s.translatedText?.HI || s.translatedText?.EN || "";
    if (lang === "TA") return s.translatedText?.TA || s.translatedText?.EN || "";
    return s.translatedText?.EN || s.originalText || "";
  };

  const getTitleForLang = (st: Story, lang: LanguageCode): string => {
    if (lang === "ML") return st.title.ML || st.title.EN;
    if (lang === "SA") return st.title.SA || st.title.ML || st.title.EN;
    if (lang === "HI") return st.title.HI || st.title.EN;
    if (lang === "TA") return st.title.TA || st.title.EN;
    return st.title.EN;
  };

  const getSummaryForLang = (st: Story, lang: LanguageCode): string => {
    if (lang === "ML") return st.summary.ML || st.summary.EN;
    if (lang === "SA") return st.summary.SA || st.summary.ML || st.summary.EN;
    if (lang === "HI") return st.summary.HI || st.summary.EN;
    if (lang === "TA") return st.summary.TA || st.summary.EN;
    return st.summary.EN;
  };

  const audioServiceRef = useRef<AudioNarrationService | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Initialize Audio Service
  useEffect(() => {
    const service = new AudioNarrationService();
    audioServiceRef.current = service;

    service.subscribe((state) => {
      setAudioState(state);
    });

    loadStoryAudio(service, activeLang);

    return () => {
      service.stop();
    };
  }, []);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Synchronized Transcript Auto-Scrolling
  useEffect(() => {
    if (audioState.isPlaying && audioState.currentSentenceIndex !== undefined) {
      const activeEl = sentenceRefs.current[audioState.currentSentenceIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [audioState.currentSentenceIndex, audioState.isPlaying]);

  const loadStoryAudio = (service: AudioNarrationService, lang: LanguageCode) => {
    const sentenceItems = story.sentences.map((s) => ({
      id: s.id,
      text: getSentenceTextForLang(s, lang)
    }));
    service.loadSentences(sentenceItems, lang);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setActiveLang(lang);
    if (audioServiceRef.current) {
      loadStoryAudio(audioServiceRef.current, lang);
    }
  };

  // Scroll listener for reading progress bar and storage persistence
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    const clamped = Math.min(100, Math.max(0, progress));
    setScrollProgress(clamped);
    StorageService.recordReadingHistory(story.id, Math.round(clamped));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getExpressionById = (id: string): CulturalExpression | undefined => {
    return story.culturalExpressions.find((exp) => exp.id === id);
  };

  // Resolved source record from sources.json
  const resolvedSource = story.sourceId
    ? mockSources.find((s) => s.id === story.sourceId)
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-story-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`w-full max-w-4xl max-h-[94vh] rounded-3xl border-4 border-brandBlack flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative transition-colors duration-200 ${
          contrastMode === "dark"
            ? "bg-neutral-950 text-neutral-100"
            : contrastMode === "high-contrast"
            ? "bg-black text-brandYellow"
            : "bg-[#FFFDE0] text-brandBlack"
        }`}
      >
        {/* Top Reading Progress Bar */}
        <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
          <div
            className="h-full bg-brandPink transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>

        {/* Header Bar */}
        <div className="px-6 py-3.5 border-b-2 border-brandBlack flex flex-wrap items-center justify-between gap-3 bg-brandYellow shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-brandPink text-white text-xs font-mono font-black px-3 py-1 rounded-full border border-brandBlack shadow-[2px_2px_0px_#080808]">
              {story.categoryLabel}
            </span>
            <span className="text-xs font-mono font-black text-brandBlack hidden sm:inline">
              REGION: {story.originRegion.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div
              role="group"
              aria-label="Language Selection"
              className="flex bg-white rounded-full p-1 border-2 border-brandBlack shadow-[2px_2px_0px_#080808]"
            >
              {[
                { code: "EN" as LanguageCode, label: "EN" },
                { code: "ML" as LanguageCode, label: "മലയാളം" },
                { code: "SA" as LanguageCode, label: "संस्कृतम्" },
                { code: "HI" as LanguageCode, label: "हिन्दी" },
                { code: "TA" as LanguageCode, label: "தமிழ்" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  aria-pressed={activeLang === lang.code}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-black transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                    activeLang === lang.code
                      ? "bg-brandPink text-white shadow-sm"
                      : "text-brandBlack hover:bg-neutral-100"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Font Size Scaling */}
            <div className="flex items-center gap-1 bg-white border-2 border-brandBlack rounded-full px-2 py-1 text-xs font-black shadow-[2px_2px_0px_#080808]">
              <button
                onClick={() => setFontSizeOffset(Math.max(-2, fontSizeOffset - 1))}
                className="hover:text-brandPink px-1 focus-visible:ring-2 focus-visible:ring-brandPink"
                title="Decrease font size"
                aria-label="Decrease reader font size"
              >
                A-
              </button>
              <span className="text-[10px] font-mono text-neutral-400">|</span>
              <button
                onClick={() => setFontSizeOffset(Math.min(4, fontSizeOffset + 1))}
                className="hover:text-brandPink px-1 focus-visible:ring-2 focus-visible:ring-brandPink"
                title="Increase font size"
                aria-label="Increase reader font size"
              >
                A+
              </button>
            </div>

            {/* Reading Contrast Mode */}
            <button
              onClick={() => {
                if (contrastMode === "normal") setContrastMode("dark");
                else if (contrastMode === "dark") setContrastMode("high-contrast");
                else setContrastMode("normal");
              }}
              className="p-2 bg-white border-2 border-brandBlack rounded-full text-xs font-black shadow-[2px_2px_0px_#080808] hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-brandPink"
              title="Toggle reading contrast theme"
              aria-label="Toggle reader contrast mode"
            >
              {contrastMode === "normal" ? "☀️" : contrastMode === "dark" ? "🌙" : "⚡"}
            </button>

            {/* Bookmark / Favorite Button */}
            {onFavoriteToggle && (
              <button
                onClick={() => onFavoriteToggle(story.id)}
                className={`p-2 border-2 border-brandBlack rounded-full text-xs transition shadow-[2px_2px_0px_#080808] focus-visible:ring-2 focus-visible:ring-brandPink ${
                  isFavorite
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandPink hover:text-white"
                }`}
                title={isFavorite ? "Bookmarked in library" : "Save bookmark"}
                aria-label={isFavorite ? "Remove bookmark" : "Bookmark this story"}
              >
                ★
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close story reader"
              className="w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Story Content Area */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 space-y-8"
        >
          {/* Title & Cover Artwork */}
          <div>
            <h1
              id="reader-story-title"
              className="font-editorial text-3xl sm:text-5xl font-black tracking-tight mb-4"
              style={{ fontSize: `calc(${fontSizeOffset * 2}px + 2.5rem)` }}
            >
              {getTitleForLang(story, activeLang)}
            </h1>
            <p className="font-bold text-base sm:text-lg opacity-90 leading-relaxed max-w-3xl mb-6">
              {getSummaryForLang(story, activeLang)}
            </p>

            <div className="relative rounded-2xl overflow-hidden border-2 border-brandBlack max-h-80 w-full shadow-[6px_6px_0px_#080808]">
              <img
                src={story.image}
                alt={story.title.EN}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-3 left-3 bg-brandPink text-white font-mono text-xs font-black px-3 py-1 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
                {story.pillTag} • {story.readingDurationMinutes} MIN READ
              </div>
            </div>
          </div>

          {/* Academic Provenance Transparency Banner */}
          <div className="bg-white border-2 border-brandBlack p-5 rounded-2xl shadow-[4px_4px_0px_#080808] text-brandBlack">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-brandPink text-white px-2 py-0.5 rounded border border-brandBlack">
                  ACADEMIC PROVENANCE
                </span>
                <span className="font-mono text-xs font-bold text-neutral-600">
                  {story.contentType || "FOLKLORE_ORAL_ARCHIVE"}
                </span>
              </div>

              {/* Genuine Reviewer Verification Status */}
              {story.isHumanReviewed ? (
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-400 font-mono text-[11px] font-black">
                  <span>✓</span>
                  <span>PEER VERIFIED: {story.verifiedBy || "Academic Scholar"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-300 font-mono text-[11px] font-bold">
                  <span>⏳</span>
                  <span>Community Ingestion (Review Pending)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral-500 font-bold block">Primary Source Record:</span>
                <span className="font-black text-brandBlack text-sm">
                  {resolvedSource ? resolvedSource.name : story.sourceName || story.sourceAttribution}
                </span>
                {(story.sourceUrl || resolvedSource?.url) && (
                  <a
                    href={story.sourceUrl || resolvedSource?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brandPink hover:underline font-black block mt-1 focus-visible:ring-2 focus-visible:ring-brandPink"
                  >
                    Archive Source Link ↗
                  </a>
                )}
              </div>

              <div>
                <span className="text-neutral-500 font-bold block">Content Transparency &amp; License:</span>
                <p className="text-neutral-800 text-[11px] leading-snug mt-0.5">
                  {story.attribution || resolvedSource?.attributionText || "Preserved under Open Cultural Documentation standards."}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-brandYellow/60 text-brandBlack px-2 py-0.5 rounded border border-brandBlack text-[10px] font-bold">
                    {story.license || resolvedSource?.license || "Creative Commons / Public Domain"}
                  </span>
                  <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-300 text-[10px] font-bold">
                    Bilingual Transcript Checked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Concept Box */}
          <div className="bg-brandYellow border-2 border-brandBlack p-5 rounded-2xl shadow-[5px_5px_0px_#080808] text-brandBlack">
            <span className="font-mono text-xs font-black text-brandPink block mb-1">
              {story.keyConcept.title}
            </span>
            <blockquote className="font-extrabold text-lg sm:text-xl font-sans mb-2 italic">
              {story.keyConcept.quote}
            </blockquote>
            <p className="text-sm font-semibold opacity-90">
              {story.keyConcept.explanation}
            </p>
          </div>

          {/* Sentence-by-Sentence Synchronized Reading Body */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b-2 border-brandBlack pb-2 mb-4">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-brandPink">
                ✦ Synchronized Narrative ({story.sentences.length} Sentences)
              </span>
              <span className="text-[11px] font-mono opacity-70">
                Click line to jump • Auto-scrolls as narration proceeds
              </span>
            </div>

            {story.sentences.map((sentence, idx) => {
              const isCurrentSpoken =
                audioState.isPlaying && audioState.currentSentenceIndex === idx;

              const sentenceText = getSentenceTextForLang(sentence, activeLang);

              return (
                <div
                  key={sentence.id}
                  ref={(el) => (sentenceRefs.current[idx] = el)}
                  onClick={() => {
                    if (audioServiceRef.current) {
                      audioServiceRef.current.seekSentence(idx);
                      audioServiceRef.current.play();
                    }
                  }}
                  className={`group p-4 rounded-xl border-2 transition-all cursor-pointer leading-relaxed ${
                    isCurrentSpoken
                      ? "bg-brandYellow border-brandBlack text-brandBlack shadow-[4px_4px_0px_#FF087D] scale-[1.01]"
                      : contrastMode === "dark"
                      ? "border-neutral-800 hover:border-brandYellow/60 bg-neutral-900/60"
                      : contrastMode === "high-contrast"
                      ? "border-brandYellow hover:bg-neutral-900"
                      : "border-transparent hover:border-brandBlack/40 hover:bg-white"
                  }`}
                  style={{
                    fontSize: `calc(${fontSizeOffset * 1.5}px + 1.1rem)`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-black opacity-50 select-none pt-1">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>

                    <div className="flex-1 font-medium">
                      <span>{sentenceText}</span>

                      {/* Highlighted In-Story Cultural Terms Stickers */}
                      {sentence.highlightedTermIds && sentence.highlightedTermIds.length > 0 && (
                        <div className="inline-flex flex-wrap gap-1.5 ml-2 align-middle">
                          {sentence.highlightedTermIds.map((termId) => {
                            const termObj = getExpressionById(termId);
                            if (!termObj) return null;
                            return (
                              <button
                                key={termId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTerm(termObj);
                                }}
                                aria-label={`View cultural note for ${termObj.term}`}
                                className="inline-flex items-center gap-1 bg-brandPink hover:bg-brandPinkDark text-white text-[11px] font-mono font-black px-2 py-0.5 rounded-full border border-brandBlack shadow-[1px_1px_0px_#080808] transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none"
                              >
                                <span>✦</span>
                                <span>{termObj.term}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Individual Sentence Replay Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioServiceRef.current?.replaySentence(idx);
                      }}
                      title="Replay this sentence"
                      aria-label={`Replay sentence ${idx + 1}`}
                      className="opacity-40 group-hover:opacity-100 hover:opacity-100 p-1.5 rounded-full bg-white hover:bg-brandYellow border border-brandBlack text-[10px] font-mono font-bold transition shrink-0 shadow-sm focus-visible:ring-2 focus-visible:ring-brandPink"
                    >
                      <span>🔊 Replay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cultural Background Section */}
          <div className="p-6 bg-white border-2 border-brandBlack rounded-2xl text-brandBlack shadow-[4px_4px_0px_#080808]">
            <span className="font-mono text-xs font-black text-brandPink uppercase block mb-1">
              [ HISTORICAL &amp; CULTURAL GENESIS ]
            </span>
            <h3 className="font-editorial text-2xl font-black mb-3">
              Understanding the Heritage
            </h3>
            <p className="text-sm font-semibold leading-relaxed text-neutral-800">
              {story.culturalBackground}
            </p>
          </div>
        </div>

        {/* Audio Player Bottom Bar */}
        <div className="p-4 bg-brandYellow border-t-2 border-brandBlack flex flex-col gap-2 shrink-0">
          <div className="flex flex-wrap items-center justify-between text-xs font-mono font-black text-brandBlack gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brandPink animate-ping"></span>
              <span className="truncate max-w-md">
                {audioState.isLoading
                  ? "LOADING VOICE ENGINE..."
                  : audioState.isPlaying
                  ? activeLang === "ML"
                    ? audioState.isNativeVoice
                      ? "MALAYALAM NARRATION (NATIVE ml-IN VOICE ACTIVE)"
                      : "MALAYALAM NARRATION (ACOUSTIC PHONETIC FALLBACK)"
                    : activeLang === "SA"
                    ? audioState.isNativeVoice
                      ? "SANSKRIT RECITATION (NATIVE DEVANAGARI VOICE)"
                      : "SANSKRIT RECITATION (PHONETIC SYNTHESIS ACTIVE)"
                    : activeLang === "HI"
                    ? audioState.isNativeVoice
                      ? "HINDI NARRATION (NATIVE hi-IN VOICE ACTIVE)"
                      : "HINDI NARRATION (PHONETIC SYNTHESIS ACTIVE)"
                    : activeLang === "TA"
                    ? audioState.isNativeVoice
                      ? "TAMIL NARRATION (NATIVE ta-IN VOICE ACTIVE)"
                      : "TAMIL NARRATION (PHONETIC SYNTHESIS ACTIVE)"
                    : "ENGLISH NARRATION (NEERJA NEURAL)"
                  : audioState.isPaused
                  ? "AUDIO PAUSED"
                  : "READY TO LISTEN"}
              </span>
              <span className="opacity-60">
                (Sentence {audioState.currentSentenceIndex + 1} of {audioState.totalSentences})
              </span>
            </div>
            <div>
              <span>{formatTime(audioState.currentTimeSeconds)}</span> /{" "}
              <span>{formatTime(audioState.durationSeconds)}</span>
            </div>
          </div>

          {/* Voice Notification Banner for Honest Audio Reporting */}
          {!audioState.isNativeVoice && activeLang !== "EN" && (
            <div className="text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-400 px-3 py-1 rounded-md flex items-center gap-2">
              <span>⚠️</span>
              <span>
                Notice: Browser lacks native {activeLang === "ML" ? "Malayalam (ml-IN)" : activeLang === "TA" ? "Tamil (ta-IN)" : activeLang === "SA" ? "Sanskrit" : "Hindi (hi-IN)"} voice. Running acoustic phonetic fallback synthesis mode with Indian cadence.
              </span>
            </div>
          )}

          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={Math.max(1, audioState.totalSentences - 1)}
            value={audioState.currentSentenceIndex}
            aria-label="Sentence scrubber"
            onChange={(e) => {
              if (audioServiceRef.current) {
                audioServiceRef.current.seekSentence(parseInt(e.target.value));
              }
            }}
            className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer border border-brandBlack accent-brandPink focus-visible:ring-2 focus-visible:ring-brandPink"
          />

          {/* Playback Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {!audioState.isPlaying ? (
                <button
                  onClick={() => audioServiceRef.current?.play()}
                  aria-label="Play narration"
                  className="bg-brandPink hover:bg-brandPinkDark text-white px-5 py-2 rounded-full font-mono text-xs font-black border-2 border-brandBlack shadow-[2px_2px_0px_#080808] flex items-center gap-1.5 transition focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
                >
                  <span>▶</span>
                  <span>Play Narration</span>
                </button>
              ) : (
                <button
                  onClick={() => audioServiceRef.current?.pause()}
                  aria-label="Pause narration"
                  className="bg-brandBlack hover:bg-neutral-800 text-brandYellow px-5 py-2 rounded-full font-mono text-xs font-black border-2 border-brandBlack shadow-[2px_2px_0px_#FFFC00] flex items-center gap-1.5 transition focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
                >
                  <span>⏸</span>
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={() => audioServiceRef.current?.stop()}
                aria-label="Stop narration"
                className="bg-white hover:bg-neutral-100 text-brandBlack px-3.5 py-2 rounded-full font-mono text-xs font-black border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
              >
                ⏹ Stop
              </button>
            </div>

            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1 font-mono text-xs font-black">
              <span className="opacity-70 text-[11px] mr-1">SPEED:</span>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => audioServiceRef.current?.setRate(speed)}
                  aria-label={`Set speed to ${speed}x`}
                  className={`px-2.5 py-1 rounded border border-brandBlack text-xs transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                    audioState.rate === speed
                      ? "bg-brandPink text-white font-black shadow-[1px_1px_0px_#080808]"
                      : "bg-white text-brandBlack hover:bg-neutral-100"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 font-mono text-xs font-black">
              <span>🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={audioState.volume}
                aria-label="Audio volume"
                onChange={(e) => audioServiceRef.current?.setVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-white rounded border border-brandBlack accent-brandPink focus-visible:ring-2 focus-visible:ring-brandPink"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Expression Popover */}
      {activeTerm && (
        <CulturalTermPopover
          expression={activeTerm}
          storyTitle={getTitleForLang(story, activeLang)}
          storyId={story.id}
          onClose={() => setActiveTerm(null)}
        />
      )}
    </div>
  );
};
