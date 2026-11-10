import React, { useState } from "react";
import { CulturalExpression } from "../types";
import { speakSafely } from "../utils/malayalamPhonetics";
import { mockCulturalExpressions } from "../data/mockData";

interface Props {
  onClose: () => void;
  onSelectExpression?: (exp: CulturalExpression) => void;
}

export const GlossaryModal: React.FC<Props> = ({ onClose, onSelectExpression }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");

  const regions = [
    "ALL",
    "Valluvanad, Kerala",
    "North Malabar, Kerala",
    "Kerala (Pan-Regional)",
    "Kolathunadu (Malabar)",
    "Ancient Pataliputra / Pan-India"
  ];

  const filteredExpressions = mockCulturalExpressions.filter((exp) => {
    const matchesSearch =
      exp.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.originalScript.includes(searchQuery) ||
      exp.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.contextualMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.literalTranslation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === "ALL" || exp.region.toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  const handlePronounce = (exp: CulturalExpression) => {
    const text = exp.audioPronunciationText || exp.originalScript || exp.term;
    const directUrl = `/audio/tts/${exp.id}.mp3`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[12px_12px_0px_#080808]">
        {/* Header */}
        <div className="p-6 bg-brandYellow border-b-2 border-brandBlack flex items-center justify-between">
          <div>
            <div className="inline-block bg-brandPink text-white text-[11px] font-mono font-black px-3 py-1 rounded-full border border-brandBlack mb-1 shadow-[2px_2px_0px_#080808]">
              [ 04 / LIVING CULTURAL GLOSSARY ]
            </div>
            <h2 className="font-editorial text-2xl sm:text-4xl font-black text-brandBlack">
              Meaning Behind the Words
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close glossary"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-6 border-b-2 border-brandBlack bg-white space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cultural idioms, Malayalam phrases, ritual terms, or transliterations..."
              className="w-full bg-[#FFFDE0] border-2 border-brandBlack px-4 py-3 rounded-xl font-mono text-xs sm:text-sm font-bold placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-brandPink shadow-[3px_3px_0px_#080808]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3.5 text-xs font-mono font-black text-neutral-400 hover:text-brandBlack"
              >
                CLEAR
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono font-black">
            <span className="text-neutral-500 shrink-0">REGION:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-full border-2 border-brandBlack shrink-0 transition ${
                  selectedRegion === reg
                    ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808]"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                {reg === "ALL" ? "ALL REGIONS" : reg.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredExpressions.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-dashed border-brandBlack rounded-2xl p-8">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-editorial text-2xl font-black text-brandBlack mb-1">
                No matching cultural expressions found
              </h3>
              <p className="text-xs font-mono font-bold text-neutral-600">
                Try searching with a broader keyword, Malayalam script, or clear your filters.
              </p>
            </div>
          ) : (
            filteredExpressions.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border-2 border-brandBlack rounded-2xl p-5 shadow-[5px_5px_0px_#080808] hover:border-brandPink transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-brandBlack mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
                        {exp.region}
                      </span>
                      {exp.isVerified && (
                        <span className="bg-brandEmerald text-white text-[10px] font-mono font-black px-2 py-0.5 rounded flex items-center gap-1">
                          <span>✓</span> VERIFIED SCHOLARSHIP
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-extrabold text-brandBlack font-sans">
                      {exp.originalScript}
                    </h3>
                    <p className="text-xs font-mono font-bold text-neutral-600">
                      Transliteration: <em>{exp.transliteration}</em>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePronounce(exp)}
                      className="bg-brandYellow hover:bg-brandPink hover:text-white px-3.5 py-1.5 rounded-full border-2 border-brandBlack font-mono text-xs font-black transition flex items-center gap-1 shadow-[2px_2px_0px_#080808]"
                    >
                      <span>🔊</span>
                      <span>Pronounce</span>
                    </button>
                    {onSelectExpression && (
                      <button
                        onClick={() => {
                          onSelectExpression(exp);
                          onClose();
                        }}
                        className="bg-brandBlack hover:bg-neutral-800 text-white px-3.5 py-1.5 rounded-full font-mono text-xs font-black transition"
                      >
                        Inspect →
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-300">
                    <span className="font-mono font-black text-neutral-500 uppercase block mb-1">
                      Literal Meaning:
                    </span>
                    <p className="font-bold text-brandBlack">"{exp.literalTranslation}"</p>
                  </div>

                  <div className="p-3 bg-brandYellow/30 rounded-xl border-2 border-brandBlack md:col-span-2">
                    <span className="font-mono font-black text-brandPink uppercase block mb-1">
                      Contextual Cultural Significance:
                    </span>
                    <p className="font-extrabold text-brandBlack mb-1 text-sm">
                      {exp.contextualMeaning}
                    </p>
                    <p className="text-neutral-700 leading-relaxed font-medium text-[11px]">
                      {exp.culturalSignificance}
                    </p>
                  </div>
                </div>

                {exp.sourceAttribution && (
                  <div className="mt-3 pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-neutral-600">
                    <div>
                      <strong className="text-brandBlack">Provenance: </strong>
                      {exp.sourceUrl ? (
                        <a
                          href={exp.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brandPink hover:underline"
                        >
                          {exp.sourceAttribution} ↗
                        </a>
                      ) : (
                        exp.sourceAttribution
                      )}
                    </div>
                    {exp.license && (
                      <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-300">
                        {exp.license}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

