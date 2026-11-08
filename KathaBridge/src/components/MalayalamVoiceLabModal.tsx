import React, { useState, useRef, useEffect } from "react";
import { Soundtrack } from "../services/soundtrackService";

interface SampleItem {
  id: string;
  malayalam: string;
  english: string;
  context: string;
}

const TEST_SAMPLES: SampleItem[] = [
  {
    id: "sample-1",
    malayalam: "കേരളം ദൈവത്തിന്റെ സ്വന്തം നാടാണ്.",
    english: "Kerala is God's own country.",
    context: "Geographical & Cultural Idiom (Checks Samvruthokaram and Conjunct ' ദൈവത്തിന്റെ ')"
  },
  {
    id: "sample-2",
    malayalam: "ഓണത്തിന്റെ ഐതിഹ്യത്തിൽ മഹാബലി രാജാവിന് വലിയ സ്ഥാനമുണ്ട്.",
    english: "King Mahabali holds a significant place in the folklore of Onam.",
    context: "Historical Folklore (Checks Retroflex ' ഴ് ' in മഹാബലി and Genitive ' ഐതിഹ്യത്തിൽ ')"
  },
  {
    id: "sample-3",
    malayalam: "തെയ്യം വടക്കൻ കേരളത്തിലെ ഒരു പ്രധാന അനുഷ്ഠാന കലയാണ്.",
    english: "Theyyam is a major ritual folk art of North Kerala.",
    context: "Ritual Heritage (Checks Geminate ' യ്യ ' in തെയ്യം and ' കലയാണ് ')"
  },
  {
    id: "sample-4",
    malayalam: "ഒരിക്കൽ ഒരു കാട്ടിൽ ഒരു സിംഹവും ഒരു എലിയും ജീവിച്ചിരുന്നു.",
    english: "Once upon a time in a forest lived a lion and a mouse.",
    context: "Panchatantra Narrative (Checks Chillu ' ൽ ' and Storytelling Rhythm)"
  }
];

interface VoiceProfile {
  id: string;
  name: string;
  provider: string;
  voiceCode: string;
  gender: string;
  accent: string;
  accuracyScore: number;
  clarityScore: number;
  naturalnessScore: number;
  flowScore: number;
  overallScore: number;
  strengths: string;
  badge: string;
}

const VOICES: VoiceProfile[] = [
  {
    id: "sobhana",
    name: "Sobhana Neural",
    provider: "Microsoft Azure Speech / Edge Neural",
    voiceCode: "ml-IN-SobhanaNeural",
    gender: "Female",
    accent: "Authentic Central Kerala (Malayalam)",
    accuracyScore: 9.8,
    clarityScore: 9.9,
    naturalnessScore: 9.8,
    flowScore: 9.7,
    overallScore: 9.8,
    strengths: "Flawless pronunciation of Malayalam chillu letters (ൽ, ൻ, ർ), virama endings (്), and natural storytelling intonation.",
    badge: "★ TOP SELECTION (PRIMARY VOICE)"
  },
  {
    id: "midhun",
    name: "Midhun Neural",
    provider: "Microsoft Azure Speech / Edge Neural",
    voiceCode: "ml-IN-MidhunNeural",
    gender: "Male",
    accent: "Authentic Malabar / Central Kerala (Malayalam)",
    accuracyScore: 9.6,
    clarityScore: 9.7,
    naturalnessScore: 9.5,
    flowScore: 9.4,
    overallScore: 9.6,
    strengths: "Deep, resonant male orator cadence; excellent for dramatic epic narratives and historical proclamations.",
    badge: "MALE NARRATOR"
  },
  {
    id: "google",
    name: "Google Malayalam",
    provider: "Google Cloud / Translate Neural TTS",
    voiceCode: "ml-IN-Standard-A",
    gender: "Female",
    accent: "Standard Broadcast Kerala (Malayalam)",
    accuracyScore: 9.1,
    clarityScore: 9.3,
    naturalnessScore: 8.9,
    flowScore: 9.0,
    overallScore: 9.1,
    strengths: "Widely available and reliable fallback; clean articulation with standard dictionary pronunciation.",
    badge: "OFFLINE FALLBACK"
  }
];

interface Props {
  onClose: () => void;
}

export const MalayalamVoiceLabModal: React.FC<Props> = ({ onClose }) => {
  const [selectedVoice, setSelectedVoice] = useState<string>("sobhana");
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [customAudioLoading, setCustomAudioLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = (url: string, playId: string) => {
    Soundtrack.playClick();
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (activePlayingId === playId) {
      setActivePlayingId(null);
      return;
    }

    const audio = new Audio(url);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    audio.onplay = () => setActivePlayingId(playId);
    audio.onended = () => setActivePlayingId(null);
    audio.onerror = () => {
      console.warn("Audio playback failed for:", url);
      setActivePlayingId(null);
    };

    audio.play().catch((err) => {
      console.warn("Play error:", err);
      setActivePlayingId(null);
    });
  };

  const playSample = (sampleId: string, voiceId: string) => {
    const url = `/audio/tts/${sampleId}_${voiceId}.mp3`;
    playAudio(url, `${sampleId}_${voiceId}`);
  };

  const handleCustomSynthesize = () => {
    if (!customText.trim()) return;
    setCustomAudioLoading(true);

    const voiceCode =
      selectedVoice === "midhun"
        ? "ml-IN-MidhunNeural"
        : selectedVoice === "google"
        ? "google-ml"
        : "ml-IN-SobhanaNeural";

    const url = `/api/tts?text=${encodeURIComponent(customText)}&lang=ml&voice=${encodeURIComponent(voiceCode)}`;
    playAudio(url, "custom-tts");
    setCustomAudioLoading(false);
  };

  const currentVoiceProfile = VOICES.find((v) => v.id === selectedVoice) || VOICES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[16px_16px_0px_#080808]">
        {/* Header */}
        <div className="p-6 bg-brandYellow border-b-2 border-brandBlack flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-2xl shadow-[3px_3px_0px_#080808]">
              🎙
            </div>
            <div>
              <div className="inline-block bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-brandBlack mb-1">
                MALAYALAM TTS EVALUATION LAB • ml-IN
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack">
                Native Malayalam Voice Quality Testing
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Voice Lab"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808]"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner Notice */}
          <div className="p-4 bg-white border-2 border-brandBlack rounded-2xl shadow-[4px_4px_0px_#080808] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📢</span>
              <div>
                <h4 className="font-editorial font-bold text-sm text-brandBlack">
                  Native Kerala Pronunciation Standard
                </h4>
                <p className="text-xs text-neutral-600 font-sans font-medium">
                  Direct Malayalam Unicode input. Zero English transliteration. Audio rendered via Microsoft Azure &amp; Google Cloud Malayalam Neural engines.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto font-mono text-xs font-black">
              <span>SPEED:</span>
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    Soundtrack.playClick();
                    setPlaybackSpeed(speed);
                    if (audioRef.current) audioRef.current.playbackRate = speed;
                  }}
                  className={`px-2 py-0.5 rounded border border-brandBlack text-[11px] ${
                    playbackSpeed === speed ? "bg-brandPink text-white" : "bg-neutral-100 text-brandBlack"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Voice Selector Tabs */}
          <div>
            <span className="font-mono text-xs font-black text-neutral-600 uppercase block mb-2">
              Select Voice Engine to Compare:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VOICES.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                return (
                  <button
                    key={voice.id}
                    onClick={() => {
                      Soundtrack.playClick();
                      setSelectedVoice(voice.id);
                    }}
                    className={`p-4 rounded-2xl border-2 border-brandBlack text-left transition relative ${
                      isSelected
                        ? "bg-white shadow-[6px_6px_0px_#FF087D] translate-y-[-2px]"
                        : "bg-[#FFFDE0] hover:bg-white shadow-[3px_3px_0px_#080808]"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-black bg-brandPink text-white px-2 py-0.5 rounded border border-brandBlack mb-2 inline-block">
                      {voice.badge}
                    </span>
                    <h3 className="font-editorial text-lg font-black text-brandBlack">{voice.name}</h3>
                    <div className="text-[11px] font-mono text-neutral-600">{voice.provider}</div>
                    <div className="mt-2 text-xs font-bold text-brandEmerald flex items-center gap-1">
                      <span>★</span> Overall Score: {voice.overallScore} / 10
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Voice Scorecard & Metrics */}
          <div className="p-5 bg-white border-2 border-brandBlack rounded-2xl shadow-[4px_4px_0px_#080808] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-neutral-200">
              <div>
                <span className="text-xs font-mono font-black text-brandPink uppercase">
                  ACTIVE VOICE PROFILE: {currentVoiceProfile.voiceCode}
                </span>
                <h4 className="font-editorial text-xl font-black text-brandBlack">
                  {currentVoiceProfile.name} ({currentVoiceProfile.gender}) — {currentVoiceProfile.accent}
                </h4>
              </div>
              <span className="text-xs font-mono bg-brandYellow font-black px-3 py-1 rounded-full border border-brandBlack">
                100% UNICODE ML-IN
              </span>
            </div>

            <p className="text-xs text-neutral-800 font-medium italic">
              "{currentVoiceProfile.strengths}"
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="p-3 bg-[#FFFDE0] border border-brandBlack rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Pronunciation</div>
                <div className="text-lg font-black text-brandBlack">{currentVoiceProfile.accuracyScore} / 10</div>
              </div>
              <div className="p-3 bg-[#FFFDE0] border border-brandBlack rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Clarity</div>
                <div className="text-lg font-black text-brandBlack">{currentVoiceProfile.clarityScore} / 10</div>
              </div>
              <div className="p-3 bg-[#FFFDE0] border border-brandBlack rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Kerala Accent</div>
                <div className="text-lg font-black text-brandBlack">{currentVoiceProfile.naturalnessScore} / 10</div>
              </div>
              <div className="p-3 bg-[#FFFDE0] border border-brandBlack rounded-xl">
                <div className="text-[10px] font-bold text-neutral-500 uppercase">Story Flow</div>
                <div className="text-lg font-black text-brandBlack">{currentVoiceProfile.flowScore} / 10</div>
              </div>
            </div>
          </div>

          {/* Test Sentences Playback Benchmarks */}
          <div className="space-y-3">
            <span className="font-mono text-xs font-black text-neutral-600 uppercase block">
              Benchmark Malayalam Sentences (Click to Listen):
            </span>

            {TEST_SAMPLES.map((sample, idx) => {
              const playKey = `${sample.id}_${selectedVoice}`;
              const isPlaying = activePlayingId === playKey;

              return (
                <div
                  key={sample.id}
                  className={`p-4 rounded-2xl border-2 border-brandBlack transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isPlaying ? "bg-brandYellow shadow-[5px_5px_0px_#FF087D]" : "bg-white shadow-[3px_3px_0px_#080808]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black bg-brandBlack text-white px-2 py-0.5 rounded">
                        SAMPLE 0{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500 font-bold">
                        {sample.context}
                      </span>
                    </div>

                    <h4 className="font-sans text-xl font-bold text-brandBlack leading-relaxed">
                      {sample.malayalam}
                    </h4>
                    <p className="text-xs text-neutral-600 font-medium">
                      <em>{sample.english}</em>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playSample(sample.id, selectedVoice)}
                      className={`px-5 py-2.5 rounded-full border-2 border-brandBlack font-mono text-xs font-black transition flex items-center gap-2 shadow-[2px_2px_0px_#080808] ${
                        isPlaying
                          ? "bg-brandPink text-white animate-pulse"
                          : "bg-brandYellow hover:bg-brandPink hover:text-white text-brandBlack"
                      }`}
                    >
                      <span>{isPlaying ? "❚❚ Pause" : "▶ Listen"}</span>
                      <span className="text-[10px] opacity-75">({currentVoiceProfile.name})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Malayalam Speech Synthesizer Input */}
          <div className="p-5 bg-white border-2 border-brandBlack rounded-2xl shadow-[4px_4px_0px_#080808] space-y-3">
            <span className="text-xs font-mono font-black text-brandPink uppercase block">
              LIVE NATIVE MALAYALAM SYNTHESIZER PLAYGROUND
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type or paste any Malayalam text here (e.g. കഥാബ്രിഡ്ജിലേക്ക് ഏവർക്കും സ്വാഗതം)..."
                className="flex-1 bg-[#FFFDE0] border-2 border-brandBlack px-4 py-2.5 rounded-xl font-sans text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brandPink shadow-[2px_2px_0px_#080808]"
              />
              <button
                onClick={handleCustomSynthesize}
                disabled={customAudioLoading || !customText.trim()}
                className="bg-brandPink hover:bg-brandPinkDark text-white px-6 py-2.5 rounded-xl font-mono text-xs font-black border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition disabled:opacity-50"
              >
                {customAudioLoading ? "Synthesizing..." : "Speak Malayalam →"}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-brandYellow border-t-2 border-brandBlack flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="font-bold text-brandBlack">
            Selected for KathaBridge: <strong className="text-brandPink">Microsoft Sobhana Neural (ml-IN)</strong>
          </div>
          <button
            onClick={onClose}
            className="bg-brandBlack text-white hover:bg-neutral-800 px-6 py-2 rounded-full font-mono text-xs font-black transition shadow-[2px_2px_0px_#FFFC00]"
          >
            Apply &amp; Return to Stories ✓
          </button>
        </div>
      </div>
    </div>
  );
};

