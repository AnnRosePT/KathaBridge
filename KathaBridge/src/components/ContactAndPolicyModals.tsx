import React, { useState } from "react";
import { mockSources } from "../data/mockData";

export type PolicyType = "CONTACT" | "WCAG" | "INDIGENOUS_RIGHTS" | "SCHOLAR_ATTRIBUTION" | "PRIVACY" | "RESEARCH_SOURCES";

interface Props {
  type: PolicyType;
  onClose: () => void;
}

export const ContactAndPolicyModals: React.FC<Props> = ({ type, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[14px_14px_0px_#FF087D] relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
        >
          ✕
        </button>

        {type === "CONTACT" && (
          <div>
            <div className="inline-block bg-brandPink text-white font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack mb-2 shadow-[2px_2px_0px_#080808]">
              CURATORIAL LIAISON
            </div>
            <h2 className="font-editorial text-3xl font-black text-brandBlack mb-2">
              Contact KathaBridge Curators
            </h2>
            <p className="text-xs font-mono font-bold text-neutral-700 mb-6">
              Connect with our editorial board, archive folklorists, or university partnerships team.
            </p>

            {submitted ? (
              <div className="bg-brandEmerald text-white p-5 rounded-2xl border-2 border-brandBlack font-mono text-center space-y-2">
                <span className="text-3xl block">✓</span>
                <h4 className="font-bold text-base">Message Received</h4>
                <p className="text-xs">
                  Thank you, {name}! A lead folklorist will respond to {email} within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.org"
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Subject / Inquiry *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  >
                    <option value="Archive Inquiry">Archive Inquiry</option>
                    <option value="Academic Collaboration">Academic &amp; University Research</option>
                    <option value="Copyright & Oral Rights">Indigenous Oral Rights</option>
                    <option value="Report Translation Inaccuracy">Report Inaccuracy / Dialect Drift</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-black text-brandBlack mb-1 uppercase">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your note to the curatorial team..."
                    className="w-full bg-white border-2 border-brandBlack p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brandPink outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-3.5 rounded-full font-mono text-xs font-black uppercase transition border-2 border-brandBlack shadow-[4px_4px_0px_#080808]"
                >
                  Send Inquiry to Editorial Board →
                </button>
              </form>
            )}
          </div>
        )}

        {type === "WCAG" && (
          <div className="space-y-4">
            <div className="inline-block bg-brandPink text-white font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack">
              STANDARDS COMPLIANCE
            </div>
            <h2 className="font-editorial text-3xl font-black text-brandBlack">
              WCAG 2.1 AAA Statement
            </h2>
            <div className="prose text-xs font-semibold leading-relaxed text-neutral-800 space-y-3">
              <p>
                KathaBridge is engineered in accordance with the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.1 level AAA criteria.
              </p>
              <h4 className="font-mono font-black text-brandBlack uppercase text-sm">Key Principles:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Perceivable:</strong> High-contrast color ratios exceeding 7:1 against pure black borders; synchronized sentence captions and speech audio.</li>
                <li><strong>Operable:</strong> Full keyboard accessibility across all modal dialogs, audio scrubbers, and category cards.</li>
                <li><strong>Understandable:</strong> Clear dialect labeling, dual transliterations, and context explanations for regional vernacular.</li>
                <li><strong>Robust:</strong> Fully compatible with JAWS, NVDA, VoiceOver, and modern Web Speech synthesis engines.</li>
              </ul>
            </div>
          </div>
        )}

        {type === "INDIGENOUS_RIGHTS" && (
          <div className="space-y-4">
            <div className="inline-block bg-brandYellow text-brandBlack font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack">
              ETHICAL FRAMEWORK
            </div>
            <h2 className="font-editorial text-3xl font-black text-brandBlack">
              Indigenous &amp; Oral Rights Policy
            </h2>
            <div className="prose text-xs font-semibold leading-relaxed text-neutral-800 space-y-3">
              <p>
                Folklore and ritual performance traditions belong unconditionally to the indigenous communities, temple groves, and artisan lineages that originated them.
              </p>
              <p>
                KathaBridge operates as an open, non-commercial public trust. We do not claim intellectual property ownership over oral chants, Theyyam mudis, or community folk tales.
              </p>
              <p>
                Any regional elder or traditional guardian may request attribution modifications, sacred restrictions, or removal of sensitive ceremonial records at any time.
              </p>
            </div>
          </div>
        )}

        {type === "SCHOLAR_ATTRIBUTION" && (
          <div className="space-y-4">
            <div className="inline-block bg-brandPink text-white font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack">
              PEER-REVIEW STANDARD
            </div>
            <h2 className="font-editorial text-3xl font-black text-brandBlack">
              Scholar Attribution Policy
            </h2>
            <div className="prose text-xs font-semibold leading-relaxed text-neutral-800 space-y-3">
              <p>
                Every published translation and cultural nuance footnote undergoes a rigorous 4-stage validation workflow:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Raw oral transcript preservation.</li>
                <li>AI syntax baseline draft generation.</li>
                <li>Human scholar peer-review by recognized folklorists and native language scholars.</li>
                <li>Permanent attribution and immutable version audit trails.</li>
              </ol>
              <p>
                No AI-generated cultural claims are ever published without explicit scholar sign-off.
              </p>
            </div>
          </div>
        )}

        {type === "PRIVACY" && (
          <div className="space-y-4">
            <div className="inline-block bg-brandBlack text-brandYellow font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack">
              DATA INTEGRITY
            </div>
            <h2 className="font-editorial text-3xl font-black text-brandBlack">
              Privacy &amp; Open Access Policy
            </h2>
            <div className="prose text-xs font-semibold leading-relaxed text-neutral-800 space-y-3">
              <p>
                KathaBridge respects reader privacy. We do not monetize personal data, inject tracking cookies, or sell reading metrics.
              </p>
              <p>
                Your bookmarks, audio settings, and reading progress are stored locally on your device unless you choose to sync an archivist profile.
              </p>
            </div>
          </div>
        )}

        {type === "RESEARCH_SOURCES" && (
          <div className="space-y-4">
            <div className="inline-block bg-brandYellow text-brandBlack font-mono text-[11px] font-black px-3 py-0.5 rounded-full border border-brandBlack shadow-[2px_2px_0px_#080808]">
              [ OPEN CITATION REGISTRY ]
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack">
              Curatorial Research &amp; Open Sources
            </h2>
            <p className="text-xs font-mono font-bold text-neutral-700 leading-relaxed">
              KathaBridge content is rigorously grounded in verified public domain and Creative Commons repositories. All materials preserve source attribution and licensing integrity:
            </p>

            <div className="space-y-3 mt-4 max-h-[55vh] overflow-y-auto pr-1">
              {mockSources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white border-2 border-brandBlack p-4 rounded-2xl shadow-[3px_3px_0px_#080808] hover:translate-x-0.5 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm text-brandBlack font-editorial">{source.name}</h4>
                    <span className="text-[10px] font-mono font-black bg-brandYellowLight text-brandBlack px-2 py-0.5 rounded border border-brandBlack">
                      {source.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-700 font-sans mb-2 leading-relaxed">
                    {source.description}
                  </p>
                  <div className="bg-[#FFFDE0] border border-neutral-300 p-2 rounded-lg text-[10px] font-mono text-neutral-800 space-y-1">
                    <div>
                      <strong className="text-brandPink">License:</strong> {source.license}
                    </div>
                    <div>
                      <strong className="text-brandBlack">Heritage Role:</strong> {source.heritageRole}
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-black text-brandPink hover:underline"
                    >
                      Visit {source.domain} ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

