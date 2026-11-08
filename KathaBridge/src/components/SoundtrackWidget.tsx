import React, { useState, useEffect } from "react";
import { Soundtrack, BGM_TRACKS, BGMTrackId } from "../services/soundtrackService";

export const SoundtrackWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<BGMTrackId>("MOHANAM");
  const [volume, setVolume] = useState(0.28);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    Soundtrack.subscribe((playing, track, vol) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
      setVolume(vol);
    });
  }, []);

  const activeTrackObj = BGM_TRACKS.find((t) => t.id === currentTrack) || BGM_TRACKS[0];

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      {!isExpanded ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => {
            Soundtrack.playClick();
            if (!isPlaying) Soundtrack.playBGM();
            setIsExpanded(true);
          }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[4px_4px_0px_#080808] transition-all transform hover:-translate-y-0.5 ${
            isPlaying ? "bg-brandPink text-white" : "bg-brandYellow text-brandBlack hover:bg-white"
          }`}
        >
          {/* Animated Equalizer Bars */}
          <div className="flex items-end gap-1 h-4 w-4">
            <span
              className={`w-1 bg-current rounded-full transition-all ${
                isPlaying ? "animate-bounce" : "h-2"
              }`}
              style={{ animationDelay: "0ms", animationDuration: "700ms" }}
            ></span>
            <span
              className={`w-1 bg-current rounded-full transition-all ${
                isPlaying ? "animate-bounce" : "h-3"
              }`}
              style={{ animationDelay: "180ms", animationDuration: "500ms" }}
            ></span>
            <span
              className={`w-1 bg-current rounded-full transition-all ${
                isPlaying ? "animate-bounce" : "h-1.5"
              }`}
              style={{ animationDelay: "360ms", animationDuration: "620ms" }}
            ></span>
          </div>

          <div className="text-left font-mono">
            <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
              {isPlaying ? "LIVE SOUNDTRACK" : "INDIAN BGM"}
            </span>
            <span className="text-xs font-black block leading-none truncate max-w-[140px]">
              {activeTrackObj.name.split("&")[0]}
            </span>
          </div>

          <span className="text-xs bg-white text-brandBlack rounded-full w-6 h-6 flex items-center justify-center font-black border border-brandBlack ml-1">
            {isPlaying ? "⏸" : "▶"}
          </span>
        </button>
      ) : (
        /* Expanded Full Brutalist Audio Dock */
        <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-2xl p-4 shadow-[8px_8px_0px_#FF087D] w-80 animate-fade-in text-brandBlack">
          <div className="flex items-center justify-between border-b-2 border-brandBlack pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-brandPink text-white text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack">
                CULTURAL SOUNDSCAPE
              </span>
              <span className="w-2 h-2 rounded-full bg-brandEmerald animate-ping"></span>
            </div>
            <button
              onClick={() => {
                Soundtrack.playClick();
                setIsExpanded(false);
              }}
              className="w-6 h-6 rounded-full border border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center text-xs font-black transition"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <h4 className="font-editorial text-base font-black text-brandBlack leading-tight">
              {activeTrackObj.name}
            </h4>
            <p className="text-[11px] font-mono text-neutral-600 mt-0.5">
              Raga: <em>{activeTrackObj.raga}</em>
            </p>
          </div>

          {/* Track Switcher */}
          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] font-mono font-black text-neutral-500 uppercase block">
              Switch Indian Classical Ambient Drone:
            </span>
            {BGM_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  Soundtrack.playClick();
                  Soundtrack.setTrack(track.id);
                  if (!isPlaying) Soundtrack.playBGM();
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition flex items-center justify-between ${
                  currentTrack === track.id
                    ? "bg-brandYellow border-brandBlack text-brandBlack font-black shadow-[1px_1px_0px_#080808]"
                    : "bg-white border-neutral-300 hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                <span className="truncate">{track.name}</span>
                {currentTrack === track.id && <span>✓</span>}
              </button>
            ))}
          </div>

          {/* Volume Slider & Play/Pause */}
          <div className="pt-2 border-t-2 border-brandBlack flex items-center justify-between gap-3 font-mono text-xs">
            <button
              onClick={() => {
                Soundtrack.playClick();
                Soundtrack.toggleBGM();
              }}
              className={`px-4 py-2 rounded-full border-2 border-brandBlack font-black transition flex items-center gap-1.5 shadow-[2px_2px_0px_#080808] ${
                isPlaying ? "bg-brandBlack text-brandYellow" : "bg-brandPink text-white hover:bg-brandPinkDark"
              }`}
            >
              <span>{isPlaying ? "⏸ Pause" : "▶ Play BGM"}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span>🔊</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => Soundtrack.setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-white rounded border border-brandBlack accent-brandPink"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

