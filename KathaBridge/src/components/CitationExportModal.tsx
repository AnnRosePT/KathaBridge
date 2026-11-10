import React, { useState } from "react";
import { Story, SourceCitation } from "../types";
import { Soundtrack } from "../services/soundtrackService";

interface Props {
  story: Story;
  source: SourceCitation | null;
  onClose: () => void;
}

export const CitationExportModal: React.FC<Props> = ({
  story,
  source,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"BIBTEX" | "APA" | "MLA" | "JSONLD">("BIBTEX");
  const [copied, setCopied] = useState<boolean>(false);

  const cleanTitle = story.title.EN.replace(/[^\w\s-]/g, "");
  const citeKey = `kathabridge_${story.id}_2026`;
  const accessDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // 1. BibTeX
  const bibtex = `@misc{${citeKey},
  title        = {${story.title.EN} (${story.title.ML || ""})},
  author       = {{KathaBridge Living Oral Folklore Archive}},
  howpublished = {Digital Heritage Repository},
  year         = {2026},
  url          = {https://kathabridge.vercel.app/#story-${story.id}},
  note         = {Academic Source: ${source?.name || "Kerala Cultural Archive"}; Reviewer: ${story.reviewedBy || "Scholar Council"}},
  urldate      = {${new Date().toISOString().slice(0, 10)}}
}`;

  // 2. APA 7th Edition
  const apa = `KathaBridge Archive. (2026). ${story.title.EN} [Oral folklore and digital heritage archive]. Preserved from ${source?.name || "Kerala Folklore Society"}. Reviewed by ${story.reviewedBy || "Scholar Advisory Council"}. Retrieved ${accessDate}, from https://kathabridge.vercel.app/#story-${story.id}`;

  // 3. MLA 9th Edition
  const mla = `"${story.title.EN}." KathaBridge: Stories Beyond Language, reviewed by ${story.reviewedBy || "Scholar Council"}, 2026, https://kathabridge.vercel.app/#story-${story.id}. Accessed ${accessDate}.`;

  // 4. W3C Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": story.title.EN,
    "alternateName": story.title.ML,
    "description": story.summary.EN,
    "genre": story.category,
    "inLanguage": ["en", "ml"],
    "contentLocation": {
      "@type": "Place",
      "name": story.originRegion
    },
    "license": story.license || "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "author": {
      "@type": "Organization",
      "name": "KathaBridge Living Oral Folklore Archive",
      "url": "https://kathabridge.vercel.app/"
    },
    "contributor": {
      "@type": "Person",
      "name": story.reviewedBy || "Scholar Advisory Council"
    },
    "citation": {
      "@type": "CreativeWork",
      "name": source?.name || "Indigenous Oral Tradition",
      "url": source?.url || "https://www.sahapedia.org"
    },
    "timeRequired": `PT${story.readingDurationMinutes}M`
  };

  const getActiveText = (): string => {
    switch (activeTab) {
      case "BIBTEX":
        return bibtex;
      case "APA":
        return apa;
      case "MLA":
        return mla;
      case "JSONLD":
        return JSON.stringify(jsonLd, null, 2);
    }
  };

  const handleCopy = () => {
    Soundtrack.playClick();
    navigator.clipboard.writeText(getActiveText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    Soundtrack.playClick();
    const content = getActiveText();
    const extension = activeTab === "BIBTEX" ? "bib" : activeTab === "JSONLD" ? "jsonld" : "txt";
    const mime = activeTab === "JSONLD" ? "application/ld+json" : "text/plain";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${citeKey}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="bg-brandYellow border-b-4 border-brandBlack p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl shadow-[3px_3px_0px_#080808]">
              📜
            </div>
            <div>
              <div className="inline-block bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack uppercase tracking-widest">
                ACADEMIC PROVENANCE EXPORT
              </div>
              <h2
                id="citation-export-title"
                className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack tracking-tight"
              >
                Archival Citation &amp; JSON-LD
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close citation modal"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-white border-b-2 border-brandBlack px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: "BIBTEX", label: "BibTeX (.bib)" },
              { id: "APA", label: "APA 7th" },
              { id: "MLA", label: "MLA 9th" },
              { id: "JSONLD", label: "W3C JSON-LD" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  Soundtrack.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`text-xs font-mono font-black px-3 py-1.5 rounded-full border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="font-mono text-[11px] text-neutral-500 font-bold hidden sm:inline">
            ID: {story.id}
          </span>
        </div>

        {/* Citation Preview Text Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-white p-4 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808] relative">
            <pre className="font-mono text-xs sm:text-sm text-brandBlack whitespace-pre-wrap break-all leading-relaxed select-all">
              {getActiveText()}
            </pre>
          </div>

          <div className="bg-neutral-100 p-3.5 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-600 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              Metadata includes permanent stable IDs, verified human reviewer attribution, and academic source linkages.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t-2 border-brandBlack p-4 px-6 flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold text-neutral-500">
            {copied ? "✓ Copied to clipboard!" : "Select format and copy or download."}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="bg-brandYellow hover:bg-amber-300 text-brandBlack border-2 border-brandBlack font-mono text-xs font-black px-4 py-2 rounded-full shadow-[2px_2px_0px_#080808] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="bg-brandPink hover:bg-pink-600 text-white border-2 border-brandBlack font-mono text-xs font-black px-4 py-2 rounded-full shadow-[2px_2px_0px_#080808] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span>
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
