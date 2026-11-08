import React, { useState } from "react";
import { StorageService } from "../services/storageService";

interface Props {
  onClose: () => void;
  onSuccess: (trackingId: string) => void;
}

export const ContributionModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [contribType, setContribType] = useState<"STORY" | "EXPRESSION" | "CORRECTION">("STORY");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("Malayalam");
  const [region, setRegion] = useState("");
  const [content, setContent] = useState("");
  const [culturalNotes, setCulturalNotes] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submission = StorageService.addContribution({
      type: contribType,
      title,
      language,
      region: region || "Kerala (Pan-Regional)",
      content: `${content}${culturalNotes ? `\n\n[Cultural Notes: ${culturalNotes}]` : ""}`
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(submission.id);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="p-6 bg-brandYellow border-b-2 border-brandBlack flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-brandPink text-white px-3 py-0.5 rounded-full font-mono text-[11px] font-black border border-brandBlack mb-1 shadow-[2px_2px_0px_#080808]">
              ✦ COMMUNITY CITIZEN ARCHIVE
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack">
              Contribute Living Folklore
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close contribution modal"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contribution Type Tabs */}
          <div>
            <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-2">
              Select What You Are Submitting:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "STORY", label: "Regional Folk Tale" },
                { type: "EXPRESSION", label: "Cultural Idiom / Term" },
                { type: "CORRECTION", label: "Translation Fix" }
              ].map((tab) => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setContribType(tab.type as any)}
                  className={`py-2.5 px-3 rounded-xl font-mono text-xs font-black border-2 border-brandBlack text-center transition ${
                    contribType === tab.type
                      ? "bg-brandPink text-white shadow-[3px_3px_0px_#080808]"
                      : "bg-white text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                Title / Folklore Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  contribType === "STORY"
                    ? "e.g. The Legend of Pakkanar's Walking Stick"
                    : contribType === "EXPRESSION"
                    ? "e.g. Vellathil Varacha Vara (Line drawn on water)"
                    : "e.g. Correction for Theyyam Mask Symbolism in Story #02"
                }
                className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-brandPink outline-none shadow-[2px_2px_0px_#080808]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Language / Dialect *
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none shadow-[2px_2px_0px_#080808]"
                >
                  <option value="Malayalam">Malayalam (മലയാളം)</option>
                  <option value="Sanskrit">Sanskrit (संस्कृतम्)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Regional Dialect">Other Regional Dialect</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Region / Village / District *
                </label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="e.g. Valluvanad, Palakkad, Kerala"
                  className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none shadow-[2px_2px_0px_#080808]"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                {contribType === "STORY"
                  ? "Oral Story Narrative (In original script or English)"
                  : contribType === "EXPRESSION"
                  ? "Original Expression & Literal Translation"
                  : "Original Text vs Proposed Correction"} *
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share the full story or expression as told in your community..."
                className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-brandPink outline-none shadow-[2px_2px_0px_#080808]"
              ></textarea>
            </div>

            <div>
              <label className="block font-mono text-xs font-black text-brandPink mb-1 uppercase">
                Cultural Context, Ritual Meaning &amp; Living Significance:
              </label>
              <textarea
                rows={2}
                value={culturalNotes}
                onChange={(e) => setCulturalNotes(e.target.value)}
                placeholder="Why is this meaningful? Is it tied to a specific festival, proverb, or harvest?"
                className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brandPink outline-none shadow-[2px_2px_0px_#080808]"
              ></textarea>
            </div>

            {/* Image Upload Preview */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-brandBlack">
              <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-1">
                Attach Supporting Photo / Artwork / Manuscript (Optional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs font-mono file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-2 file:border-brandBlack file:text-xs file:font-mono file:font-black file:bg-brandYellow hover:file:bg-brandPink hover:file:text-white"
              />
              {imagePreview && (
                <div className="mt-3 w-28 h-20 rounded-lg overflow-hidden border border-brandBlack">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  placeholder="e.g. Sreejith Warrier"
                  className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contributorEmail}
                  onChange={(e) => setContributorEmail(e.target.value)}
                  placeholder="sreejith@example.org"
                  className="w-full bg-white border-2 border-brandBlack p-2.5 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3.5 rounded-full font-mono text-xs font-black uppercase tracking-wider transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808]"
              >
                {isSubmitting ? "Enqueuing Submission..." : "Submit to Folklore Review Queue →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

