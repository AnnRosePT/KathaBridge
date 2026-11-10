import React, { useState, useEffect, useRef } from "react";
import { Soundtrack } from "../services/soundtrackService";

export interface TalaDefinition {
  id: string;
  name: string;
  malayalamName: string;
  beats: number;
  description: string;
  folkloreApplication: string;
  sampleStanza: {
    malayalam: string;
    transliteration: string;
    meaning: string;
  };
  pattern: ("BASS" | "TREBLE" | "CYMBAL" | "REST")[];
}

export const TALA_PRESETS: TalaDefinition[] = [
  {
    id: "chempata",
    name: "Chempata Tala (ചെമ്പട)",
    malayalamName: "ചെമ്പട താളം",
    beats: 8,
    description: "The foundational 8-beat majestic cadence of Kerala. Drives Theyyam Thottam pattu and epic narrative delivery.",
    folkloreApplication: "Theyyam Invocations, Kathakali, and Onam Vallamkali prelude chants.",
    sampleStanza: {
      malayalam: "മാവേലി നാടു വാണീടും കാലം, മാനുഷരെല്ലാരും ഒന്നുപോലെ",
      transliteration: "Maveli naadu vaaneedum kaalam, maanusharellaarum onnupole",
      meaning: "When King Maveli ruled the land, all humankind lived in egalitarian equality."
    },
    pattern: ["CYMBAL", "TREBLE", "BASS", "TREBLE", "CYMBAL", "TREBLE", "BASS", "TREBLE"]
  },
  {
    id: "panchari",
    name: "Panchari Tala (പഞ്ചാരി)",
    malayalamName: "പഞ്ചാരി താളം",
    beats: 6,
    description: "Traditional 6-beat cycle characterized by accelerating rhythmic drive in temple melam ensembles.",
    folkloreApplication: "Temple festival processions, folk ballads, and dynamic narrative turns.",
    sampleStanza: {
      malayalam: "തീയിൽ പിറന്നവൾ നാടിന്റെ കാവൽ, തെയ്യത്തിൻ തിരുമുടി ചൂടിയമ്മ",
      transliteration: "Theeyil pirannaval naadinte kaaval, theyyathin thirumudi choodiyamma",
      meaning: "Born of fire, she guards the realm, crowned in Theyyam's sacred halo."
    },
    pattern: ["CYMBAL", "TREBLE", "TREBLE", "BASS", "TREBLE", "TREBLE"]
  },
  {
    id: "adantha",
    name: "Adantha Tala (അടന്ത)",
    malayalamName: "അടന്ത താളം",
    beats: 14,
    description: "Complex, expansive 14-beat meter used exclusively for classical Sanskrit dramatic recitation in Koodiyattam.",
    folkloreApplication: "Koodiyattam Sanskrit temple theatre, ritualistic Hastha Mudras, and Netrabhinaya.",
    sampleStanza: {
      malayalam: "നേത്രാഭിനയേന ലോകം പ്രകാശിതം, മിഴാവിൻ നാദം പ്രതിധ്വനിക്കുന്നു",
      transliteration: "Netrabhinayena lokam prakaashitham, mizhaavin naadam pratidhavanikkunnu",
      meaning: "The universe is revealed through eye expression as the bronze Mizhavu drum resonates."
    },
    pattern: [
      "CYMBAL", "TREBLE", "TREBLE", "BASS", "TREBLE", "TREBLE", "TREBLE",
      "CYMBAL", "TREBLE", "TREBLE", "BASS", "TREBLE", "TREBLE", "REST"
    ]
  },
  {
    id: "vanchipattu",
    name: "Vanchipattu Tala (വഞ്ചിപ്പാട്ട്)",
    malayalamName: "വഞ്ചിപ്പാട്ട് താളം",
    beats: 4,
    description: "Vibrant 4-beat folk rowing cadence mirroring the physical rhythm of oars cutting through backwaters.",
    folkloreApplication: "Snake boat races (Vallamkali), harvest folklore, and community work songs.",
    sampleStanza: {
      malayalam: "ആരണ്യ വാസികൾ കൈകൾ കോർത്തു, പമ്പാനദിയിൽ തുഴയെറിഞ്ഞു",
      transliteration: "Aaranya vaasikal kaikal korthu, Pampa-nadiyil thuzha-yerinju",
      meaning: "Forest dwellers linked their hands and struck their oars into River Pampa."
    },
    pattern: ["CYMBAL", "BASS", "TREBLE", "BASS"]
  }
];

interface Props {
  onClose: () => void;
}

export const OralTalaMetronomeModal: React.FC<Props> = ({ onClose }) => {
  const [selectedTala, setSelectedTala] = useState<TalaDefinition>(TALA_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(68); // Traditional deliberate storytelling tempo
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);

  // Initialize Web Audio API
  const getAudioContext = (): AudioContext => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Synthesize Chenda / Percussion sounds procedurally with Web Audio API
  const playSynthesizedPercussion = (
    type: "BASS" | "TREBLE" | "CYMBAL" | "REST",
    time: number
  ) => {
    if (type === "REST") return;
    const ctx = getAudioContext();
    const now = time;

    if (type === "BASS") {
      // Valanthala (വലന്തല): Deep resonant skin body
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gain.gain.setValueAtTime(volume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === "TREBLE") {
      // Uruttu Chenda (ഉരുട്ടുചെണ്ട): Crisp rim strike + sharp bandpass skin snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);

      gain.gain.setValueAtTime(volume * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "CYMBAL") {
      // Ilathalam (ഇലത്താളം): Bronze clash with dual metallic frequencies
      [780, 1240, 2100].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(volume * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      });
    }
  };

  // Accurate Web Audio Clock Scheduler
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const ctx = getAudioContext();
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    currentBeatRef.current = 0;

    const secondsPerBeat = 60.0 / bpm;

    timerRef.current = window.setInterval(() => {
      const currentTime = ctx.currentTime;
      while (nextBeatTimeRef.current < currentTime + 0.1) {
        const beatIndex = currentBeatRef.current % selectedTala.beats;
        const soundType = selectedTala.pattern[beatIndex] || "TREBLE";

        playSynthesizedPercussion(soundType, nextBeatTimeRef.current);
        setCurrentBeatIndex(beatIndex);

        nextBeatTimeRef.current += secondsPerBeat;
        currentBeatRef.current += 1;
      }
    }, 25);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, bpm, selectedTala, volume]);

  const togglePlayback = () => {
    Soundtrack.playClick();
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tala-engine-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="bg-brandYellow border-b-4 border-brandBlack p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-2xl shadow-[3px_3px_0px_#080808]">
              🥁
            </div>
            <div>
              <div className="inline-block bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack uppercase tracking-widest">
                WEB AUDIO PROCEDURAL METRONOME
              </div>
              <h2
                id="tala-engine-title"
                className="font-editorial text-2xl sm:text-3xl font-black text-brandBlack tracking-tight"
              >
                Indigenous Oral Tala &amp; Poetic Meter Engine
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            aria-label="Close metronome modal"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Selector */}
          <div>
            <span className="font-mono text-xs font-black uppercase text-brandPink block mb-2">
              ✦ Select Indigenous Rhythm Tradition (താളക്രമം):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TALA_PRESETS.map((tala) => (
                <button
                  key={tala.id}
                  onClick={() => {
                    Soundtrack.playClick();
                    setSelectedTala(tala);
                    setCurrentBeatIndex(0);
                    currentBeatRef.current = 0;
                  }}
                  className={`p-3 rounded-2xl border-2 border-brandBlack text-left transition shadow-[3px_3px_0px_#080808] cursor-pointer flex flex-col justify-between ${
                    selectedTala.id === tala.id
                      ? "bg-brandPink text-white"
                      : "bg-white text-brandBlack hover:bg-brandYellow"
                  }`}
                >
                  <span className="font-bold text-sm">{tala.name.split(" ")[0]}</span>
                  <span className="text-[10px] font-mono font-black opacity-80 mt-1">
                    {tala.beats} BEATS • {tala.malayalamName}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Visual Beat Indicator Grid */}
          <div className="bg-white p-6 rounded-2xl border-4 border-brandBlack shadow-[6px_6px_0px_#080808] text-center space-y-4">
            <div className="flex items-center justify-between text-xs font-mono font-black text-neutral-500">
              <span>METER: {selectedTala.name}</span>
              <span className="text-brandPink">
                BEAT {isPlaying ? currentBeatIndex + 1 : 0} OF {selectedTala.beats}
              </span>
            </div>

            {/* Bouncing Visual Beats */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-4">
              {selectedTala.pattern.map((sound, idx) => {
                const isActive = isPlaying && currentBeatIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 transition-transform duration-75 ${
                      isActive ? "scale-125" : "scale-100"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full border-2 border-brandBlack flex items-center justify-center font-mono font-black text-sm shadow-[2px_2px_0px_#080808] transition-colors ${
                        isActive
                          ? "bg-brandPink text-white ring-4 ring-brandYellow"
                          : sound === "CYMBAL"
                          ? "bg-brandYellow text-brandBlack"
                          : sound === "BASS"
                          ? "bg-brandBlack text-white"
                          : "bg-white text-brandBlack"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="font-mono text-[9px] font-bold text-neutral-500 uppercase">
                      {sound === "CYMBAL" ? "താളം" : sound === "BASS" ? "വലന്തല" : "ഉരുട്ട്"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Transport Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={togglePlayback}
                className={`px-8 py-3 rounded-full border-4 border-brandBlack font-mono font-black text-sm uppercase transition shadow-[4px_4px_0px_#080808] cursor-pointer flex items-center gap-2 ${
                  isPlaying
                    ? "bg-brandBlack text-brandYellow hover:bg-neutral-800"
                    : "bg-brandPink text-white hover:bg-pink-600"
                }`}
              >
                <span>{isPlaying ? "⏸ Pause Tala Metronome" : "▶ Start Oral Rhythm"}</span>
              </button>
            </div>
          </div>

          {/* Tempo & Volume Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808]">
              <div className="flex justify-between text-xs font-mono font-black mb-2">
                <span>TEMPO (LAYA):</span>
                <span className="text-brandPink">{bpm} BPM</span>
              </div>
              <input
                type="range"
                min="45"
                max="135"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-brandPink cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                <span>45 (Vilamba / Meditative)</span>
                <span>90 (Madhya)</span>
                <span>135 (Dhrutha / Rapid)</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808]">
              <div className="flex justify-between text-xs font-mono font-black mb-2">
                <span>PERCUSSION VOLUME:</span>
                <span className="text-brandPink">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-brandPink cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                <span>Procedural Web Audio API</span>
                <span>Chenda + Ilathalam Synth</span>
              </div>
            </div>
          </div>

          {/* Oral Stanza Recitation Practice Guide */}
          <div className="bg-white p-5 rounded-2xl border-2 border-brandBlack shadow-[4px_4px_0px_#080808] space-y-2">
            <span className="font-mono text-xs font-black uppercase text-brandPink block">
              ✦ Oral Stanza Recitation Meter (കവിതാ താളം):
            </span>
            <p className="font-malayalam text-lg sm:text-xl font-black text-brandBlack leading-relaxed">
              "{selectedTala.sampleStanza.malayalam}"
            </p>
            <p className="font-mono text-xs text-neutral-700 italic">
              {selectedTala.sampleStanza.transliteration}
            </p>
            <p className="text-xs font-sans font-semibold text-neutral-500 pt-1 border-t border-neutral-200">
              Literal Meaning: {selectedTala.sampleStanza.meaning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

