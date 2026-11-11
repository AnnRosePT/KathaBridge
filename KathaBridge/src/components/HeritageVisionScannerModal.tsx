import React, { useState, useRef, useEffect } from "react";
import { HeritageVisionService, ART_FORMS } from "../services/heritageVisionService";
import { ArtIdentificationResult, Story } from "../types";
import { Soundtrack } from "../services/soundtrackService";
import { speakSafely } from "../utils/malayalamPhonetics";

interface Props {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onClose: () => void;
}

export const HeritageVisionScannerModal: React.FC<Props> = ({
  stories,
  onSelectStory,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"CAMERA" | "UPLOAD" | "SAMPLES">("SAMPLES");
  const [selectedImage, setSelectedImage] = useState<string | null>(ART_FORMS[0].sampleImageUrl);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>("kathakali");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [result, setResult] = useState<ArtIdentificationResult | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize with the first sample on mount
  useEffect(() => {
    handleRunIdentification(ART_FORMS[0].sampleImageUrl, "kathakali");
  }, []);

  // Camera cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera unavailable or permission denied. You can upload a photo or use sample artworks below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    Soundtrack.playClick();
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setSelectedImage(dataUrl);
      setSelectedSampleId(null);
      stopCamera();
      handleRunIdentification(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Soundtrack.playClick();

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      setSelectedSampleId(null);
      handleRunIdentification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof ART_FORMS)[0]) => {
    Soundtrack.playClick();
    stopCamera();
    setSelectedImage(sample.sampleImageUrl);
    setSelectedSampleId(sample.id);
    handleRunIdentification(sample.sampleImageUrl, sample.id);
  };

  const handleRunIdentification = async (imgUrl: string, sampleHint?: string) => {
    setIsScanning(true);
    Soundtrack.playModalPop();

    try {
      const identification = await HeritageVisionService.identifyArtForm(imgUrl, sampleHint);
      setResult(identification);
    } catch (e) {
      console.warn("Identification error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSpeakAnalysis = () => {
    if (!result) return;
    Soundtrack.playClick();

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    const narrationText = `${result.identifiedArtForm.name}, or ${result.identifiedArtForm.nameMalayalam}. ${result.analysisSummary} ${result.historicalContext}`;

    setIsSpeaking(true);
    speakSafely(narrationText, {
      lang: "EN",
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => setIsSpeaking(false)
    });
  };

  const handleJumpToStory = () => {
    if (!result?.recommendedStoryId) return;
    Soundtrack.playClick();
    const targetStory = stories.find((s) => s.id === result.recommendedStoryId);
    if (targetStory) {
      onSelectStory(targetStory);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vision-scanner-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Modal Header */}
        <div className="bg-brandYellow border-b-4 border-brandBlack p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-2xl shadow-[3px_3px_0px_#080808]">
              👁️
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack uppercase tracking-widest">
                <span>AI HERITAGE LENS</span>
                <span>•</span>
                <span>ദൃശ്യപരിശോധന</span>
              </div>
              <h2
                id="vision-scanner-title"
                className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack tracking-tight"
              >
                Cultural Art Form &amp; Ritual Scanner
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close scanner modal"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-white border-b-2 border-brandBlack px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: "SAMPLES", label: "✨ Sample Artworks", icon: "✨" },
              { id: "CAMERA", label: "📷 Camera Scanner", icon: "📷" },
              { id: "UPLOAD", label: "📁 Upload Photo", icon: "📁" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  Soundtrack.playClick();
                  setActiveTab(tab.id as any);
                  if (tab.id === "CAMERA") {
                    startCamera();
                  } else {
                    stopCamera();
                  }
                }}
                className={`text-xs font-mono font-black px-3.5 py-1.5 rounded-full border-2 border-brandBlack transition shadow-[2px_2px_0px_#080808] cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-neutral-500 font-bold hidden sm:inline">
            Powered by Gemini Multimodal Vision &amp; Folklorist Archive
          </span>
        </div>

        {/* Main Grid: Viewfinder / Input (Left) & Cultural Analysis Dossier (Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-4 divide-brandBlack">
          {/* Left Column: Viewfinder & Photo Input */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-xs font-black uppercase text-brandPink block mb-2">
                ✦ Visual Target:
              </span>

              {/* Viewfinder Container */}
              <div className="relative w-full aspect-square max-h-80 bg-brandBlack rounded-2xl border-4 border-brandBlack overflow-hidden shadow-[6px_6px_0px_#080808] flex items-center justify-center">
                {activeTab === "CAMERA" && cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Reticle */}
                    <div className="absolute inset-6 border-2 border-dashed border-brandYellow rounded-xl pointer-events-none opacity-80 flex items-center justify-center">
                      <span className="text-brandYellow text-2xl font-bold">+</span>
                    </div>
                  </>
                ) : selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Cultural Art to Identify"
                      className="w-full h-full object-cover"
                    />
                    {/* Laser Scanner Animation while processing */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-brandPink shadow-[0_0_12px_#FF087D] animate-bounce pointer-events-none"></div>
                    )}
                  </>
                ) : (
                  <div className="text-white text-xs font-mono text-center p-4">
                    No image selected. Choose a sample or take a photo.
                  </div>
                )}

                {/* Status Badge */}
                <div
                  aria-live="polite"
                  className="absolute top-3 left-3 bg-brandBlack/80 text-brandYellow text-[10px] font-mono font-black px-2.5 py-1 rounded border border-brandBlack"
                >
                  {isScanning ? "ANALYZING PIGMENTS & MUDRAS..." : "VISUAL SCAN READY"}
                </div>
              </div>

              {/* Camera Error Alert */}
              {cameraError && (
                <div className="mt-2 text-[11px] font-mono text-red-700 bg-red-100 p-2.5 rounded-lg border border-red-300">
                  {cameraError}
                </div>
              )}

              {/* Controls per Tab */}
              {activeTab === "CAMERA" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={capturePhotoFromCamera}
                    disabled={!cameraActive || isScanning}
                    className="flex-1 bg-brandPink hover:bg-brandBlack text-white disabled:opacity-50 font-mono text-xs font-black py-2.5 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📸</span>
                    <span>Capture &amp; Identify</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className="bg-white hover:bg-brandYellow text-brandBlack font-mono text-xs font-black px-3 py-2.5 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808] cursor-pointer"
                    title="Restart Camera"
                  >
                    🔄
                  </button>
                </div>
              )}

              {activeTab === "UPLOAD" && (
                <div className="mt-4 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-brandYellow hover:bg-amber-300 text-brandBlack font-mono text-xs font-black py-3 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📁</span>
                    <span>Browse Image / Photo from Device</span>
                  </button>
                  <p className="text-[10px] font-mono text-neutral-500 text-center">
                    Supports JPG, PNG, WEBP (Kathakali, Theyyam, Koodiyattam, Mural art, Crafts)
                  </p>
                </div>
              )}
            </div>

            {/* Curated Sample Thumbnails */}
            <div>
              <span className="font-mono text-xs font-black uppercase text-brandBlack block mb-2">
                ✦ Preset Cultural Samples:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {ART_FORMS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-1.5 rounded-xl border-2 border-brandBlack text-left transition ${
                      selectedSampleId === sample.id
                        ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808] ring-2 ring-brandYellow"
                        : "bg-neutral-50 text-brandBlack hover:bg-brandYellow"
                    }`}
                  >
                    <img
                      src={sample.sampleImageUrl}
                      alt={sample.name}
                      className="w-full h-12 rounded object-cover border border-brandBlack mb-1"
                    />
                    <span className="font-bold text-[10px] block truncate">{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Identification Dossier */}
          <div className="lg:col-span-7 p-6 bg-[#FFFDE0] flex flex-col justify-between space-y-4">
            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-brandPink border-t-transparent animate-spin"></div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl font-black text-brandBlack">
                    Analyzing Traditional Art Elements...
                  </h3>
                  <p className="font-mono text-xs text-neutral-600 max-w-sm">
                    Scanning facial pigments, Chutti rice ridges, Mudra hand positions, and Kireedam headdresses against the cultural knowledgebase.
                  </p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Identification Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brandBlack pb-3">
                  <div>
                    <span className="font-mono text-[10px] font-black bg-brandPink text-white px-2 py-0.5 rounded border border-brandBlack uppercase shadow-[1px_1px_0px_#080808]">
                      {result.identifiedArtForm.categoryLabel}
                    </span>
                    <h3 className="font-editorial text-3xl font-black text-brandBlack mt-1">
                      {result.identifiedArtForm.name}
                    </h3>
                    <span className="font-malayalam text-xl font-bold text-brandPink block">
                      {result.identifiedArtForm.nameMalayalam}
                    </span>
                    <span className="font-mono text-xs text-neutral-600">
                      Origin: {result.identifiedArtForm.originRegion}
                    </span>
                  </div>

                  {/* Confidence Badge */}
                  <div className="bg-white border-2 border-brandBlack p-3 rounded-2xl shadow-[3px_3px_0px_#080808] text-center">
                    <span className="font-mono text-[10px] text-neutral-500 uppercase block">
                      CONFIDENCE
                    </span>
                    <span className="font-mono text-2xl font-black text-emerald-700">
                      {Math.round(result.confidenceScore * 100)}%
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400 block">
                      Verified Visual Match
                    </span>
                  </div>
                </div>

                {/* Visual Markers Identified */}
                <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] space-y-2">
                  <span className="font-mono text-xs font-black uppercase text-brandPink block">
                    ✦ Visual Markers Detected:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-brandBlack">
                    {result.identifiedFeatures.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 bg-neutral-50 p-2 rounded-lg border border-neutral-200">
                        <span className="text-emerald-700 font-bold shrink-0">✓</span>
                        <span className="text-[11px] leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural Significance & Costume Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] space-y-1">
                    <span className="font-mono text-[10px] font-black uppercase text-brandBlack block">
                      ✦ Cultural &amp; Ritual Significance
                    </span>
                    <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
                      {result.historicalContext}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] space-y-1">
                    <span className="font-mono text-[10px] font-black uppercase text-brandBlack block">
                      ✦ Costume &amp; Headdress Details
                    </span>
                    <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
                      {result.detectedCostumeDetails}
                    </p>
                  </div>
                </div>

                {/* Academic Citation & Audio Readout */}
                <div className="bg-neutral-100 p-3 rounded-xl border border-neutral-300 text-[11px] font-mono text-neutral-600 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-brandBlack">Academic Source: </span>
                    <span>{result.identifiedArtForm.academicCitation}</span>
                  </div>

                  <button
                    onClick={handleSpeakAnalysis}
                    className="hover:text-brandPink font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]"
                  >
                    <span>{isSpeaking ? "⏹ Stop" : "🔊 Listen"}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Action Buttons: Read Related Story */}
            {result?.recommendedStoryId && (
              <div className="pt-3 border-t-2 border-brandBlack flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs text-neutral-600">
                  Associated folklore available in KathaBridge archive.
                </span>

                <button
                  onClick={handleJumpToStory}
                  className="bg-brandPink hover:bg-brandBlack text-white font-mono text-xs font-black py-2.5 px-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition flex items-center gap-2 cursor-pointer"
                >
                  <span>📖</span>
                  <span>Read Related Story: {result.recommendedStoryTitle} →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
