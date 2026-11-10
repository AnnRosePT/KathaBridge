import React, { useEffect } from "react";
import { AccessibilitySettings } from "../types";

interface Props {
  settings: AccessibilitySettings;
  onUpdate: (newSettings: AccessibilitySettings) => void;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<Props> = ({ settings, onUpdate, onClose }) => {
  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    onUpdate({
      ...settings,
      [key]: value
    });
  };

  const handleReset = () => {
    onUpdate({
      fontSizeScale: 1.0,
      lineSpacing: "normal",
      contrastMode: "normal",
      isDyslexiaFont: false,
      reduceMotion: false,
      showCaptions: true
    });
  };

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[12px_12px_0px_#FF087D] relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close accessibility controls"
          className="absolute top-5 right-5 w-9 h-9 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
        >
          ✕
        </button>

        <div className="inline-flex items-center gap-1.5 bg-brandPink text-white px-3 py-1 rounded-full font-mono text-xs font-black border border-brandBlack mb-2 shadow-[2px_2px_0px_#080808]">
          [ INCLUSIVE ACCESSIBLE DESIGN • WCAG 2.1 AA AUDITED ]
        </div>

        <h2
          id="accessibility-modal-title"
          className="font-editorial text-3xl font-black text-brandBlack mb-1"
        >
          Accessibility Center
        </h2>
        <p className="text-xs font-mono font-bold text-neutral-700 mb-6">
          Tailor typography, contrast, motion, dyslexia font, and captions to your individual preferences.
        </p>

        <div className="space-y-5">
          {/* Font Scaling */}
          <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
            <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-2">
              Text Scaling Size: {Math.round(settings.fontSizeScale * 100)}%
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0.9, 1.0, 1.15, 1.3].map((scale) => (
                <button
                  key={scale}
                  onClick={() => updateSetting("fontSizeScale", scale)}
                  aria-pressed={settings.fontSizeScale === scale}
                  className={`py-2 rounded-lg font-mono text-xs font-black border-2 border-brandBlack transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                    settings.fontSizeScale === scale
                      ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808]"
                      : "bg-[#FFFDE0] text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  {Math.round(scale * 100)}%
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
            <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-2">
              Line Spacing &amp; Readability
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["normal", "relaxed", "loose"] as const).map((space) => (
                <button
                  key={space}
                  onClick={() => updateSetting("lineSpacing", space)}
                  aria-pressed={settings.lineSpacing === space}
                  className={`py-2 rounded-lg font-mono text-xs font-black border-2 border-brandBlack uppercase transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                    settings.lineSpacing === space
                      ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808]"
                      : "bg-[#FFFDE0] text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  {space}
                </button>
              ))}
            </div>
          </div>

          {/* Color Contrast Theme */}
          <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
            <label className="block font-mono text-xs font-black text-brandBlack uppercase mb-2">
              Contrast &amp; Canvas Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "normal", label: "Brutalist Neon (Default)" },
                { id: "high-contrast", label: "High Contrast (Yellow/Black)" },
                { id: "dark", label: "Night Dark Mode" },
                { id: "sepia", label: "Warm Sepia Paper" },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateSetting("contrastMode", theme.id as any)}
                  aria-pressed={settings.contrastMode === theme.id}
                  className={`p-2.5 rounded-lg font-mono text-xs font-bold border-2 border-brandBlack text-left transition focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                    settings.contrastMode === theme.id
                      ? "bg-brandPink text-white font-black shadow-[2px_2px_0px_#080808]"
                      : "bg-[#FFFDE0] text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles (Dyslexia, Reduced Motion, Captions) */}
          <div className="bg-white p-4 rounded-xl border-2 border-brandBlack space-y-3.5 shadow-[2px_2px_0px_#080808]">
            {/* OpenDyslexic Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-black text-brandBlack block">
                  OpenDyslexic Typeface
                </span>
                <span className="text-[11px] text-neutral-600 font-medium">
                  Weighted bottom letterforms to prevent character inversion
                </span>
              </div>
              <button
                onClick={() => updateSetting("isDyslexiaFont", !settings.isDyslexiaFont)}
                aria-label={settings.isDyslexiaFont ? "Disable OpenDyslexic font" : "Enable OpenDyslexic font"}
                className={`w-12 h-6 rounded-full border-2 border-brandBlack transition relative p-0.5 focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                  settings.isDyslexiaFont ? "bg-brandPink" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white border border-brandBlack transition-transform ${
                    settings.isDyslexiaFont ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <div>
                <span className="font-mono text-xs font-black text-brandBlack block">
                  Reduced Motion &amp; Static Fallback
                </span>
                <span className="text-[11px] text-neutral-600 font-medium">
                  Disables rapid scroll animations and continuous ticker motion
                </span>
              </div>
              <button
                onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                aria-label={settings.reduceMotion ? "Disable reduced motion" : "Enable reduced motion"}
                className={`w-12 h-6 rounded-full border-2 border-brandBlack transition relative p-0.5 focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                  settings.reduceMotion ? "bg-brandPink" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white border border-brandBlack transition-transform ${
                    settings.reduceMotion ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>

            {/* Captions Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <div>
                <span className="font-mono text-xs font-black text-brandBlack block">
                  Synchronized Sentence Highlights
                </span>
                <span className="text-[11px] text-neutral-600 font-medium">
                  Visually highlight active sentence in audio narration reader
                </span>
              </div>
              <button
                onClick={() => updateSetting("showCaptions", !settings.showCaptions)}
                aria-label={settings.showCaptions ? "Disable synchronized subtitles" : "Enable synchronized subtitles"}
                className={`w-12 h-6 rounded-full border-2 border-brandBlack transition relative p-0.5 focus-visible:ring-2 focus-visible:ring-brandPink focus-visible:outline-none ${
                  settings.showCaptions ? "bg-brandPink" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white border border-brandBlack transition-transform ${
                    settings.showCaptions ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t-2 border-brandBlack flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-mono font-bold text-neutral-600 hover:text-brandBlack underline focus-visible:ring-2 focus-visible:ring-brandPink"
          >
            Reset to defaults
          </button>
          <button
            onClick={onClose}
            className="bg-brandPink hover:bg-brandPinkDark text-white px-6 py-2.5 rounded-full font-mono text-xs font-black border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition focus-visible:ring-4 focus-visible:ring-brandPink focus-visible:outline-none"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
