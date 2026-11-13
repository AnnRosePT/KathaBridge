import React, { useEffect, useRef, useState } from "react";
import { Soundtrack } from "../services/soundtrackService";

interface AudioVisualizerCanvasProps {
  isPlaying: boolean;
  className?: string;
  height?: number;
  initialMode?: "bars" | "wave" | "pulse";
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  isPlaying,
  className = "",
  height = 42,
  initialMode = "bars"
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"bars" | "wave" | "pulse">(initialMode);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;
    const analyser = Soundtrack.getAnalyser();
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : new Uint8Array(32);

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (isPlaying) {
        phaseRef.current += 0.08;
        if (analyser) {
          analyser.getByteFrequencyData(dataArray);
        }
      }

      // Neo-Pop Brutalist Canvas Background
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, width, h);

      if (mode === "bars") {
        const barCount = 28;
        const barWidth = Math.floor(width / barCount);
        const padding = 2;

        for (let i = 0; i < barCount; i++) {
          let value = 0;
          if (isPlaying) {
            const raw = dataArray[i % dataArray.length] || 0;
            const synth = Math.sin(phaseRef.current + i * 0.4) * 0.3 + 0.5;
            value = Math.max(raw / 255, synth * (0.4 + (i % 3) * 0.2));
          } else {
            value = 0.08; // Resting idle line
          }

          const barHeight = Math.max(4, value * (h - 6));
          const x = i * barWidth + padding;
          const y = h - barHeight - 2;

          // Palette cycling: Neon Yellow, Neon Pink, Bright White
          const colors = ["#FFFC00", "#FF087D", "#00F0FF", "#FFFDE0"];
          ctx.fillStyle = isPlaying ? colors[i % colors.length] : "#333333";
          ctx.fillRect(x, y, barWidth - padding * 2, barHeight);

          // Brutalist stroke
          ctx.strokeStyle = "#080808";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, barWidth - padding * 2, barHeight);

          // Top peak accent
          if (isPlaying) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(x, y - 2, barWidth - padding * 2, 2);
          }
        }
      } else if (mode === "wave") {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = isPlaying ? "#FFFC00" : "#555555";

        const points = 40;
        const slice = width / (points - 1);

        for (let i = 0; i < points; i++) {
          const x = i * slice;
          let amp = 0;
          if (isPlaying) {
            amp = Math.sin(phaseRef.current * 2 + i * 0.35) * (h * 0.32) * Math.cos(i * 0.1);
          }
          const y = h / 2 + amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (mode === "pulse") {
        const center = width / 2;
        const midY = h / 2;
        const pulseCount = 3;

        for (let i = 0; i < pulseCount; i++) {
          const radius = isPlaying
            ? ((phaseRef.current * 18 + i * 22) % (h * 0.9)) + 2
            : 8 + i * 6;
          ctx.beginPath();
          ctx.arc(center, midY, Math.max(1, radius), 0, Math.PI * 2);
          ctx.strokeStyle = i === 0 ? "#FF087D" : i === 1 ? "#FFFC00" : "#00F0FF";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, mode]);

  return (
    <div className={`relative border-2 border-brandBlack rounded-xl overflow-hidden bg-brandBlack shadow-[2px_2px_0px_#080808] ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        className="w-full h-full block"
        aria-label="Oral recitation audio visualizer spectrum"
      />
      {/* Mode Switcher Pill Overlay */}
      <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/80 px-1 py-0.5 rounded border border-white/20 text-[9px] font-mono font-bold text-white z-10">
        <button
          type="button"
          onClick={() => setMode("bars")}
          className={`px-1 rounded ${mode === "bars" ? "bg-brandYellow text-brandBlack" : "hover:text-brandYellow"}`}
          title="Frequency Spectrum Bars"
        >
          BARS
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => setMode("wave")}
          className={`px-1 rounded ${mode === "wave" ? "bg-brandPink text-white" : "hover:text-brandPink"}`}
          title="Oscilloscope Waveform"
        >
          WAVE
        </button>
        <span>|</span>
        <button
          type="button"
          onClick={() => setMode("pulse")}
          className={`px-1 rounded ${mode === "pulse" ? "bg-cyan-400 text-brandBlack" : "hover:text-cyan-400"}`}
          title="Tala Radial Pulse"
        >
          PULSE
        </button>
      </div>
    </div>
  );
};
