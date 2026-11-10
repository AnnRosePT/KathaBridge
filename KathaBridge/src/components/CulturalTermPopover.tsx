import React from "react";
import { CulturalExpression } from "../types";
import { speakSafely } from "../utils/malayalamPhonetics";

interface Props {
  expression: CulturalExpression;
  onClose: () => void;
  onPlayPronunciation?: (text: string) => void;
}

export const CulturalTermPopover: React.FC<Props> = ({ expression, onClose, onPlayPronunciation }) => {
  const handleAudio = () => {
    const text =
      expression.audioPronunciationText || expression.originalScript || expression.term;
    if (onPlayPronunciation) {
      onPlayPronunciation(text);
      return;
    }
    const directUrl = `/audio/tts/${expression.id}.mp3`;
    const audio = new Audio(directUrl);
    audio.play().catch(() => {
      const apiAudio = new Audio(
        `/api/tts?text=${encodeURIComponent(text)}&lang=ml&voice=ml-IN-SobhanaNeural`
      );
      apiAudio.play().catch(() => {
        if ("speechSynthesis" in window) {
          speakSafely(window.speechSynthesis, text, "ML");
        }
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-4 border-brandBlack rounded-2xl max-w-lg w-full p-6 shadow-[10px_10px_0px_#FF087D] relative">
        <button
          onClick={onClose}
          aria-label="Close cultural explanation"
          className="absolute top-4 right-4 w-9 h-9 rounded-full border-2 border-brandBlack bg-brandYellow hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
        >
          ✕
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-brandPink text-white text-[11px] font-mono font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]">
            CULTURAL ANCHOR
          </span>
          <span className="text-xs font-mono font-bold text-neutral-600">
            {expression.region}
          </span>
        </div>

        {/* Term & Pronunciation */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b-2 border-brandBlack">
          <div>
            <h3 className="text-2xl font-black text-brandBlack font-sans leading-tight">
              {expression.originalScript}
            </h3>
            <p className="text-xs font-mono font-bold text-neutral-600 mt-0.5">
              Transliteration: <em>{expression.transliteration}</em>
            </p>
          </div>
          <button
            onClick={handleAudio}
            title="Listen to native pronunciation"
            className="flex items-center gap-1.5 bg-brandYellow hover:bg-brandPink hover:text-white px-3 py-1.5 rounded-full border-2 border-brandBlack text-xs font-mono font-black transition shadow-[2px_2px_0px_#080808] shrink-0"
          >
            <span>🔊</span>
            <span>Pronounce</span>
          </button>
        </div>

        {/* Literal vs Contextual */}
        <div className="space-y-3 mb-5">
          <div className="bg-neutral-100 p-3 rounded-xl border border-brandBlack text-xs">
            <span className="font-mono font-black text-neutral-500 uppercase block mb-1">
              Literal Translation:
            </span>
            <p className="font-bold text-brandBlack">
              "{expression.literalTranslation}"
            </p>
          </div>

          <div className="bg-brandYellow/40 p-3.5 rounded-xl border-2 border-brandBlack text-xs">
            <span className="font-mono font-black text-brandPink uppercase block mb-1">
              Contextual Meaning &amp; Subtext:
            </span>
            <p className="font-black text-brandBlack text-sm leading-snug">
              {expression.contextualMeaning}
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-neutral-300 text-xs">
            <span className="font-mono font-black text-neutral-700 uppercase block mb-1">
              Living Cultural Significance:
            </span>
            <p className="font-medium text-neutral-800 leading-relaxed">
              {expression.culturalSignificance}
            </p>
          </div>

          {expression.sourceAttribution && (
            <div className="text-[10px] font-mono text-neutral-600 bg-neutral-100 p-2 rounded-lg border border-neutral-200 flex items-center justify-between">
              <div>
                <strong className="text-brandBlack">Source: </strong>
                {expression.sourceUrl ? (
                  <a
                    href={expression.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brandPink hover:underline"
                  >
                    {expression.sourceAttribution} ↗
                  </a>
                ) : (
                  expression.sourceAttribution
                )}
              </div>
              {expression.license && (
                <span className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 text-[9px] font-bold">
                  {expression.license}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reviewer Verification Stamp */}
        <div className="pt-3 border-t-2 border-brandBlack flex items-center justify-between text-[11px] font-mono">
          {expression.isVerified ? (
            <div className="flex items-center gap-1.5 text-brandEmerald font-black">
              <span className="w-4 h-4 rounded-full bg-brandEmerald text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
              <span>HUMAN VERIFIED BY: {expression.verifiedBy || "Folklore Scholar Council"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-500 font-bold">
              <span>⏳</span>
              <span>Pending Folklorist Peer Review</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="bg-brandBlack text-white hover:bg-neutral-800 px-4 py-1.5 rounded-lg font-bold font-sans transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

