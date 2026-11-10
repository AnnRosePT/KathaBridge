import React, { useState } from "react";
import { CulturalExpression } from "../types";
import { speakSafely, hasNativeVoiceFor } from "../utils/malayalamPhonetics";
import { mockSources } from "../data/mockData";

interface Props {
  expression: CulturalExpression;
  storyTitle?: string;
  storyId?: string;
  onClose: () => void;
  onPlayPronunciation?: (text: string) => void;
}

export const CulturalTermPopover: React.FC<Props> = ({
  expression,
  storyTitle,
  storyId: _storyId,
  onClose,
  onPlayPronunciation
}) => {
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Connect glossary term to source records using stable IDs
  const linkedSource = expression.sourceId
    ? mockSources.find((s) => s.id === expression.sourceId)
    : null;

  const handleAudio = () => {
    const text =
      expression.audioPronunciationText || expression.originalScript || expression.term;

    if (onPlayPronunciation) {
      onPlayPronunciation(text);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voiceCheck = hasNativeVoiceFor(window.speechSynthesis, "ML");
      if (voiceCheck.hasNative) {
        setVoiceNotice(`Native voice: ${voiceCheck.voiceName}`);
      } else {
        setVoiceNotice("Acoustic phonetic fallback (Browser lacks native ml-IN voice)");
      }
      speakSafely(window.speechSynthesis, text, "ML");
    } else {
      const directUrl = `/audio/tts/${expression.id}.mp3`;
      const audio = new Audio(directUrl);
      audio.play().catch(() => {
        setVoiceNotice("Speech synthesis unavailable");
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cultural-popover-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-[12px_12px_0px_#FF087D] relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close cultural term explanation"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-brandBlack bg-brandYellow hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
        >
          ✕
        </button>

        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-brandPink text-white text-[11px] font-mono font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]">
            CULTURAL FOOTNOTE
          </span>
          <span className="text-xs font-mono font-bold text-neutral-700">
            {expression.region}
          </span>
          {expression.sourceId && (
            <span className="bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
              ID: {expression.sourceId}
            </span>
          )}
        </div>

        {/* Term & Pronunciation */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b-2 border-brandBlack">
          <div>
            <h3
              id="cultural-popover-title"
              className="text-2xl sm:text-3xl font-black text-brandBlack font-sans leading-tight tracking-tight"
            >
              {expression.originalScript}
            </h3>
            <p className="text-sm font-mono font-bold text-neutral-800 mt-1">
              English Transliteration:{" "}
              <em className="text-brandPink font-bold not-italic font-sans">
                {expression.transliteration}
              </em>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={handleAudio}
              aria-label={`Listen to pronunciation of ${expression.term}`}
              className="flex items-center gap-1.5 bg-brandYellow hover:bg-brandPink hover:text-white px-3.5 py-1.5 rounded-full border-2 border-brandBlack text-xs font-mono font-black transition shadow-[2px_2px_0px_#080808] focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
            >
              <span>🔊</span>
              <span>Pronounce</span>
            </button>
            {voiceNotice && (
              <span className="text-[10px] font-mono font-bold text-neutral-600 max-w-[170px] text-right leading-tight">
                {voiceNotice}
              </span>
            )}
          </div>
        </div>

        {/* Detail Sections */}
        <div className="space-y-3 mb-5">
          {/* Literal Meaning */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-brandBlack text-xs shadow-[2px_2px_0px_#080808]">
            <span className="font-mono font-black text-neutral-600 uppercase block mb-1">
              Literal Meaning:
            </span>
            <p className="font-extrabold text-brandBlack text-sm">
              "{expression.literalMeaning || expression.literalTranslation}"
            </p>
          </div>

          {/* Contextual Subtext */}
          <div className="bg-brandYellow/40 p-3.5 rounded-xl border-2 border-brandBlack text-xs shadow-[2px_2px_0px_#080808]">
            <span className="font-mono font-black text-brandPink uppercase block mb-1">
              Contextual Subtext &amp; Meaning:
            </span>
            <p className="font-black text-brandBlack text-sm leading-snug">
              {expression.contextualMeaning}
            </p>
          </div>

          {/* Cultural Significance */}
          <div className="p-3.5 bg-white rounded-xl border-2 border-brandBlack text-xs shadow-[2px_2px_0px_#080808]">
            <span className="font-mono font-black text-neutral-800 uppercase block mb-1">
              Living Cultural Significance:
            </span>
            <p className="font-semibold text-neutral-900 leading-relaxed text-xs sm:text-sm">
              {expression.culturalSignificance}
            </p>
          </div>

          {/* Relevance to Current Story */}
          {expression.storyRelevance && (
            <div className="p-3.5 bg-brandPink/10 rounded-xl border-2 border-brandBlack text-xs shadow-[2px_2px_0px_#080808]">
              <span className="font-mono font-black text-brandPink uppercase block mb-1">
                ✦ Relevance to {storyTitle ? `"${storyTitle}"` : "Narrative"}:
              </span>
              <p className="font-bold text-brandBlack leading-relaxed">
                {typeof expression.storyRelevance === "string"
                  ? expression.storyRelevance
                  : Object.values(expression.storyRelevance)[0]}
              </p>
            </div>
          )}

          {/* Academic Provenance & Source Citation */}
          <div className="text-[11px] font-mono text-neutral-800 bg-white p-3 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
            <div className="flex items-center justify-between mb-1 pb-1 border-b border-neutral-300">
              <span className="font-black text-brandBlack uppercase">
                Academic Provenance Citation:
              </span>
              {linkedSource?.category && (
                <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-300 font-bold">
                  {linkedSource.category}
                </span>
              )}
            </div>
            <p className="font-bold text-brandBlack">
              {linkedSource ? linkedSource.name : expression.sourceAttribution}
            </p>
            {linkedSource?.attributionText && (
              <p className="text-[10px] text-neutral-600 mt-0.5 leading-snug">
                {linkedSource.attributionText}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-neutral-200">
              {(expression.sourceUrl || linkedSource?.url) && (
                <a
                  href={expression.sourceUrl || linkedSource?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brandPink hover:underline font-black text-xs inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-brandPink"
                >
                  <span>Verify at Archive</span>
                  <span>↗</span>
                </a>
              )}
              <span className="text-[9px] font-bold bg-brandYellow/60 px-2 py-0.5 rounded border border-brandBlack">
                {expression.license || linkedSource?.license || "Public Cultural Heritage Documentation"}
              </span>
            </div>
          </div>
        </div>

        {/* Reviewer Verification Stamp */}
        <div className="pt-3 border-t-2 border-brandBlack flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          {expression.isVerified ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-black bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>HUMAN VERIFIED BY: {expression.verifiedBy || "Folklore Scholar Council"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-600 font-bold bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-300">
              <span>⏳</span>
              <span>Pending Folklorist Peer Review</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="bg-brandBlack text-white hover:bg-neutral-800 px-5 py-2 rounded-full font-bold font-sans transition focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
