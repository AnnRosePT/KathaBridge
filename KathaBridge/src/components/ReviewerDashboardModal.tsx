import React, { useState } from "react";
import { ReviewItem, ReviewStatus } from "../types";
import { StorageService } from "../services/storageService";
import { TranslationService } from "../services/translationService";

interface Props {
  onClose: () => void;
  onReviewUpdated?: () => void;
}

export const ReviewerDashboardModal: React.FC<Props> = ({ onClose, onReviewUpdated }) => {
  const [queue, setQueue] = useState<ReviewItem[]>(() => StorageService.getReviewQueue());
  const [selectedItem, setSelectedItem] = useState<ReviewItem>(() => queue[0] || null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | ReviewStatus>("ALL");

  // Editable Form State for selected review item
  const [editedReviewedContent, setEditedReviewedContent] = useState("");
  const [editedCulturalNotes, setEditedCulturalNotes] = useState("");
  const [editedReviewerComment, setEditedReviewerComment] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // When selectedItem changes, sync inputs
  const selectItem = (item: ReviewItem) => {
    setSelectedItem(item);
    setEditedReviewedContent(item.reviewedContent);
    setEditedCulturalNotes(item.culturalNotes);
    setEditedReviewerComment(item.reviewerNotes || "");
  };

  React.useEffect(() => {
    if (selectedItem) {
      setEditedReviewedContent(selectedItem.reviewedContent);
      setEditedCulturalNotes(selectedItem.culturalNotes);
      setEditedReviewerComment(selectedItem.reviewerNotes || "");
    }
  }, [selectedItem?.id]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleAiAssistedDraft = async () => {
    if (!selectedItem) return;
    setIsAiProcessing(true);
    showToast("Querying Gemini 2.5 Flash for cultural analysis...");

    try {
      const [translationResult, analysisResult] = await Promise.all([
        TranslationService.translateText(selectedItem.originalContent, selectedItem.language, "EN"),
        TranslationService.generateCulturalAnalysis(selectedItem.title, selectedItem.originalContent)
      ]);

      if (translationResult.translatedText) {
        setEditedReviewedContent(translationResult.translatedText);
      }

      const compositeNotes = `Literal Translation: "${analysisResult.literalTranslation}"\nContextual Meaning: ${analysisResult.contextualMeaning}\nLiving Significance: ${analysisResult.culturalSignificance}`;
      setEditedCulturalNotes(compositeNotes);
      showToast("AI Draft generated via Gemini 2.5 Flash! Review and approve below.");
    } catch (e) {
      console.error(e);
      showToast("Could not contact Gemini AI service.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleUpdateStatus = (
    newOverallStatus: ReviewStatus,
    transcriptStatus: ReviewStatus = "APPROVED",
    translationStatus: ReviewStatus = "APPROVED",
    explanationStatus: ReviewStatus = "APPROVED"
  ) => {
    if (!selectedItem) return;

    const updatedQueue = queue.map((item) => {
      if (item.id === selectedItem.id) {
        const nextVersion = item.version + 1;
        const updated: ReviewItem = {
          ...item,
          reviewedContent: editedReviewedContent,
          culturalNotes: editedCulturalNotes,
          reviewerNotes: editedReviewerComment,
          transcriptStatus,
          translationStatus,
          explanationStatus,
          overallStatus: newOverallStatus,
          reviewedBy: "Dr. Ananya Nair (Senior Folklorist)",
          reviewedAt: new Date().toISOString(),
          version: nextVersion,
          versionHistory: [
            ...item.versionHistory,
            {
              version: nextVersion,
              timestamp: new Date().toISOString(),
              modifiedBy: "Dr. Ananya Nair",
              changes: `Status set to ${newOverallStatus}. ${editedReviewerComment ? `Notes: ${editedReviewerComment}` : ""}`
            }
          ]
        };
        return updated;
      }
      return item;
    });

    setQueue(updatedQueue);
    StorageService.saveReviewQueue(updatedQueue);
    const updatedSelected = updatedQueue.find((i) => i.id === selectedItem.id);
    if (updatedSelected) setSelectedItem(updatedSelected);

    if (onReviewUpdated) onReviewUpdated();
    showToast(`Submission "${selectedItem.title}" marked as ${newOverallStatus}`);
  };

  const filteredQueue = queue.filter((item) => {
    if (activeFilter === "ALL") return true;
    return item.overallStatus === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-[16px_16px_0px_#080808]">
        {/* Toast */}
        {feedbackToast && (
          <div className="absolute top-4 right-16 z-50 bg-brandBlack text-brandYellow border-2 border-brandPink px-4 py-2 rounded-xl font-mono text-xs font-black shadow-[3px_3px_0px_#FF087D] animate-bounce">
            {feedbackToast}
          </div>
        )}

        {/* Top Header */}
        <div className="p-5 bg-brandPink text-white border-b-2 border-brandBlack flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-brandYellow text-brandBlack font-mono text-xs font-black px-3 py-1 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
              HUMAN-IN-THE-LOOP PORTAL
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-black text-white">
              Scholar Peer-Review Dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dashboard"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white text-brandBlack hover:bg-brandYellow flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
          >
            ✕
          </button>
        </div>

        {/* Status Filter Bar */}
        <div className="px-6 py-3 bg-brandYellow border-b-2 border-brandBlack flex flex-wrap items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-brandBlack">QUEUE FILTER:</span>
            {(["ALL", "PENDING", "APPROVED", "REVISION_REQUESTED"] as const).map((filter) => {
              const count =
                filter === "ALL" ? queue.length : queue.filter((i) => i.overallStatus === filter).length;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full border-2 border-brandBlack font-black transition ${
                    activeFilter === filter
                      ? "bg-brandBlack text-brandYellow shadow-[2px_2px_0px_#FF087D]"
                      : "bg-white text-brandBlack hover:bg-neutral-100"
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-neutral-800">
            Active Reviewer: <strong>Dr. Ananya Nair</strong> • Folklore Scholar #402
          </div>
        </div>

        {/* Master-Detail Workstation Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Submissions Queue List */}
          <div className="w-full md:w-80 border-r-2 border-brandBlack bg-white overflow-y-auto divide-y-2 divide-neutral-200">
            {filteredQueue.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono font-bold text-neutral-500">
                No submissions in this filter queue.
              </div>
            ) : (
              filteredQueue.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => selectItem(item)}
                    className={`p-4 cursor-pointer transition ${
                      isSelected
                        ? "bg-brandYellow border-l-4 border-l-brandPink"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-black bg-brandPink text-white px-2 py-0.5 rounded">
                        {item.submissionType}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack ${
                          item.overallStatus === "APPROVED"
                            ? "bg-brandEmerald text-white"
                            : item.overallStatus === "PENDING"
                            ? "bg-brandYellow text-brandBlack"
                            : "bg-brandVermillion text-white"
                        }`}
                      >
                        {item.overallStatus}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-brandBlack line-clamp-1 mb-1">
                      {item.title}
                    </h4>

                    <div className="text-[11px] text-neutral-600 font-mono flex items-center justify-between">
                      <span>{item.region}</span>
                      <span>v{item.version}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Side-by-Side Review & Editing Station */}
          {selectedItem ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Item Header */}
              <div className="bg-white p-5 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-brandPink text-white text-xs font-mono font-black px-3 py-1 rounded">
                      ID: {selectedItem.id}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-600">
                      Language: {selectedItem.language} ({selectedItem.region})
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-500">
                    Submitted: {new Date(selectedItem.submittedAt).toLocaleDateString()} by {selectedItem.contributorName}
                  </div>
                </div>

                <h3 className="font-editorial text-2xl font-black text-brandBlack">
                  {selectedItem.title}
                </h3>
              </div>

              {/* Side-by-Side Comparison Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Original Dialect */}
                <div className="bg-white p-4 rounded-xl border-2 border-brandBlack flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-brandBlack pb-2 mb-2">
                      <span className="font-mono text-xs font-black text-brandPink">
                        STAGE 01: RAW DIALECT
                      </span>
                      <span className="text-[10px] font-mono bg-neutral-200 px-2 py-0.5 rounded">
                        IMMUTABLE SOURCE
                      </span>
                    </div>
                    <p className="font-bold text-sm text-brandBlack leading-relaxed italic">
                      "{selectedItem.originalContent}"
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t text-[11px] font-mono text-neutral-500">
                    Dialect: {selectedItem.language}
                  </div>
                </div>

                {/* 2. AI Initial Draft */}
                <div className="bg-neutral-100 p-4 rounded-xl border-2 border-brandBlack flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-brandBlack pb-2 mb-2">
                      <span className="font-mono text-xs font-black text-brandBlack">
                        STAGE 02: AI SYNTAX DRAFT
                      </span>
                      <span className="text-[10px] font-mono bg-brandYellow px-2 py-0.5 rounded border border-brandBlack font-black">
                        GEMINI 2.5 FLASH
                      </span>
                    </div>
                    <p className="text-xs font-medium text-neutral-800 leading-relaxed mb-3">
                      {selectedItem.aiDraftContent || "Direct neural translation generated without cultural context."}
                    </p>
                    <button
                      onClick={handleAiAssistedDraft}
                      disabled={isAiProcessing}
                      className="w-full bg-brandYellow hover:bg-brandPink hover:text-white py-1.5 px-3 rounded-lg border-2 border-brandBlack font-mono text-[11px] font-black transition shadow-[2px_2px_0px_#080808] flex items-center justify-center gap-1.5"
                    >
                      <span>✦</span>
                      <span>{isAiProcessing ? "Calling Gemini 2.5 Flash..." : "Run Live AI Analysis"}</span>
                    </button>
                  </div>
                  <div className="mt-4 pt-2 border-t text-[10px] font-mono text-neutral-600 font-bold">
                    User content → AI processing → Human review
                  </div>
                </div>

                {/* 3. Human Folklorist Validated Text (Editable) */}
                <div className="bg-brandYellow/30 p-4 rounded-xl border-2 border-brandBlack flex flex-col justify-between shadow-[3px_3px_0px_#080808]">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-brandBlack pb-2 mb-2">
                      <span className="font-mono text-xs font-black text-brandPink">
                        STAGE 03: FOLKLORIST CURATION
                      </span>
                      <span className="text-[10px] font-mono bg-brandPink text-white px-2 py-0.5 rounded font-black">
                        EDITABLE
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={editedReviewedContent}
                      onChange={(e) => setEditedReviewedContent(e.target.value)}
                      className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-lg text-xs font-bold leading-relaxed focus:ring-2 focus:ring-brandPink outline-none"
                      placeholder="Refine translated vocabulary and cultural idioms..."
                    ></textarea>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-brandEmerald font-black">
                    ✓ High fidelity human translation
                  </div>
                </div>
              </div>

              {/* Cultural Context & Subtext Notes (Editable) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808]">
                <label className="block font-mono text-xs font-black text-brandPink uppercase mb-2">
                  Cultural Notes &amp; Ethical Attribution (Displayed in Public Glossary):
                </label>
                <textarea
                  rows={3}
                  value={editedCulturalNotes}
                  onChange={(e) => setEditedCulturalNotes(e.target.value)}
                  className="w-full bg-[#FFFDE0] border-2 border-brandBlack p-3 rounded-xl text-xs font-bold leading-relaxed focus:ring-2 focus:ring-brandPink outline-none"
                  placeholder="Explain ritual origin, regional ecology, and social subtext..."
                ></textarea>
              </div>

              {/* Reviewer Comments & Decision */}
              <div className="bg-brandYellow p-5 rounded-2xl border-2 border-brandBlack space-y-4">
                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-1">
                    Reviewer Notes / Feedback to Contributor:
                  </label>
                  <input
                    type="text"
                    value={editedReviewerComment}
                    onChange={(e) => setEditedReviewerComment(e.target.value)}
                    placeholder="Enter peer-review observations or reasons for revision..."
                    className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-lg text-xs font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus("APPROVED", "APPROVED", "APPROVED", "APPROVED")}
                      className="bg-brandEmerald hover:brightness-110 text-white font-mono text-xs font-black px-5 py-2.5 rounded-full border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition flex items-center gap-1.5"
                    >
                      <span>✓</span>
                      <span>Approve &amp; Publish</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus("REVISION_REQUESTED", "APPROVED", "PENDING", "PENDING")}
                      className="bg-brandYellow hover:bg-white text-brandBlack font-mono text-xs font-black px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition"
                    >
                      Request Revision
                    </button>

                    <button
                      onClick={() => handleUpdateStatus("REJECTED", "REJECTED", "REJECTED", "REJECTED")}
                      className="bg-white hover:bg-neutral-100 text-brandVermillion font-mono text-xs font-black px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition"
                    >
                      Reject Submission
                    </button>
                  </div>

                  {selectedItem.reviewedAt && (
                    <div className="text-[11px] font-mono font-bold text-neutral-700">
                      Last reviewed: {new Date(selectedItem.reviewedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Version History Log */}
              <div className="bg-white p-4 rounded-xl border-2 border-brandBlack text-xs">
                <span className="font-mono font-black text-neutral-600 block mb-2 uppercase">
                  Version Audit Trail (v{selectedItem.version})
                </span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedItem.versionHistory.map((hist) => (
                    <div key={hist.version} className="flex items-start gap-2 text-neutral-700">
                      <span className="font-black text-brandPink">v{hist.version}</span>
                      <span className="text-neutral-400">•</span>
                      <span>{new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-neutral-400">•</span>
                      <strong className="text-brandBlack">{hist.modifiedBy}:</strong>
                      <span>{hist.changes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-12 text-center text-neutral-500 font-mono text-sm">
              Select an item from the queue to start peer review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

