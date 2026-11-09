import React, { useEffect, useRef, useState, useCallback } from "react";
import { Soundtrack } from "../services/soundtrackService";

interface Props {
  onExploreClick?: () => void;
}

// Start from frame 15 (index 14) so the screen is never black on initial load
const START_FRAME_INDEX = 14; 
const END_FRAME_INDEX = 119; // Frame 120
const TOTAL_PLAYABLE_FRAMES = END_FRAME_INDEX - START_FRAME_INDEX + 1; // 106 active visual frames

export const ScrollFrameHero: React.FC<Props> = ({ onExploreClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(START_FRAME_INDEX);
  const animationFrameIdRef = useRef<number | null>(null);

  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(START_FRAME_INDEX);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);

  // Helper to format frame filename
  const getFrameUrl = useCallback((index: number) => {
    const pad = String(index + 1).padStart(3, "0");
    return `/frames/sequence/ezgif-frame-${pad}.jpg`;
  }, []);

  // Draw a frame to canvas with cover fit
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Find requested or nearest available loaded frame
    let img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < TOTAL_PLAYABLE_FRAMES; offset++) {
        const prev = imagesRef.current[frameIdx - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          img = prev;
          break;
        }
        const next = imagesRef.current[frameIdx + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          img = next;
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  }, []);

  // 1. Preload visual frame sequence
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;
    let loaded = 0;

    // Load initial frame (START_FRAME_INDEX) immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(START_FRAME_INDEX);
    images[START_FRAME_INDEX] = firstImg;
    firstImg.onload = () => {
      loaded++;
      setLoadedCount(loaded);
      renderFrame(START_FRAME_INDEX);
    };

    // Preload remaining frames
    for (let i = START_FRAME_INDEX; i <= END_FRAME_INDEX; i++) {
      if (i === START_FRAME_INDEX) continue;
      const img = new Image();
      img.src = getFrameUrl(i);
      images[i] = img;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (currentFrameRef.current === i) {
          renderFrame(i);
        }
      };
    }

    // Force an initial draw
    setTimeout(() => {
      renderFrame(START_FRAME_INDEX);
    }, 100);

    return () => {
      imagesRef.current = [];
    };
  }, [getFrameUrl, renderFrame]);

  // 2. Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      
      // Map progress across the visual frames
      const targetFrame = Math.min(
        END_FRAME_INDEX,
        START_FRAME_INDEX + Math.floor(progress * TOTAL_PLAYABLE_FRAMES)
      );

      setScrollProgress(progress);
      setActiveFrameIndex(targetFrame);

      if (currentFrameRef.current !== targetFrame) {
        currentFrameRef.current = targetFrame;
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        animationFrameIdRef.current = requestAnimationFrame(() => {
          renderFrame(targetFrame);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => renderFrame(currentFrameRef.current), { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => {});
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  const handleSkipToStories = () => {
    Soundtrack.playClick();
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById("home");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const currentDisplayNumber = activeFrameIndex + 1;

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[300vh] bg-neutral-950 text-white"
      id="scroll-intro-animation"
      data-purpose="scroll-controlled-frame-animation"
    >
      {/* Sticky full-screen viewport */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-neutral-950 select-none">
        
        {/* Layer 1: Hardware-Accelerated Fallback Image (Guarantees NEVER black) */}
        <img
          src={getFrameUrl(activeFrameIndex)}
          alt="KathaBridge Living Heritage Cinema"
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-105"
        />

        {/* Layer 2: High-Performance Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Subtle, soft vignette (keeps artwork vivid) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/50 pointer-events-none z-10" />

        {/* Top Control Bar */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <svg
              className="w-6 h-6 text-[#FF2D78] animate-spin"
              style={{ animationDuration: "12s" }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
            </svg>
            <div>
              <span className="font-editorial text-xl font-black tracking-tight text-white block leading-none">
                KathaBridge
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#FFFC00] uppercase font-bold">
                Cinematic Heritage Scroll
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Frame Counter Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-mono">
              <span className="text-neutral-400">FRAME</span>
              <span className="text-brandYellow font-bold">
                {String(currentDisplayNumber).padStart(3, "0")} / 120
              </span>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleSkipToStories}
              className="bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack px-4 py-2 rounded-full text-xs font-black transition-all transform hover:scale-105 shadow-[2px_2px_0px_#FFFC00] cursor-pointer flex items-center gap-1.5"
            >
              <span>Skip to Stories</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        {/* Narrative Stage 1: 0% - 33% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress < 0.35
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-6 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/60 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_20px_rgba(255,252,0,0.3)]">
            <span>✦ FOLKLORE IN MOTION ✦</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Stories Beyond <span className="text-brandYellow underline decoration-brandPink decoration-wavy decoration-2">Language.</span>
          </h1>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            Translating centuries of oral folklore into a living, scroll-driven visual journey.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 animate-bounce text-xs font-mono text-brandYellow">
            <span className="bg-black/60 px-3 py-1 rounded-full border border-[#FFFC00]/40">
              ↓ Scroll down to play sequence
            </span>
          </div>
        </div>

        {/* Narrative Stage 2: 35% - 68% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress >= 0.35 && scrollProgress < 0.70
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-brandPink/70 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-brandPink mb-4 shadow-[0_0_20px_rgba(255,45,120,0.3)]">
            <span>RITUAL FOLKLORE • SUBALTERN VOICES</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Living Gods &amp; Sacred Groves.
          </h2>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            Theyyam trance dances, Sanskrit theatrical masterworks, and egalitarian folk memories preserved with authentic native voice.
          </p>
        </div>

        {/* Narrative Stage 3: 70% - 100% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress >= 0.70
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/60 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_20px_rgba(255,252,0,0.3)]">
            <span>✦ KATHABRIDGE ARCHIVE READY ✦</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Enter the Full Archive.
          </h2>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed mb-6 bg-black/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
            Explore bilingual stories, synchronized Malayalam karaoke audio, cultural glossary, and scholar review tools below.
          </p>
          <button
            onClick={handleSkipToStories}
            className="inline-flex items-center gap-3 bg-[#FFFC00] hover:bg-[#ffe600] text-black font-extrabold text-base px-8 py-4 rounded-full shadow-[0_0_30px_rgba(255,252,0,0.5)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Enter Stories Collection</span>
            <span className="text-lg">↓</span>
          </button>
        </div>

        {/* Bottom Progress Tracker Ribbon */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-xs font-mono text-neutral-300 max-w-7xl mx-auto bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SCROLL PROGRESS</span>
            <span className="text-brandYellow font-bold">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-36 sm:w-64 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-brandPink to-brandYellow transition-all duration-100"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          <div className="text-[11px] text-neutral-400 hidden sm:block">
            {loadedCount < TOTAL_PLAYABLE_FRAMES ? `Loading frames (${loadedCount}/${TOTAL_PLAYABLE_FRAMES})...` : "Sequence Ready"}
          </div>
        </div>
      </div>
    </section>
  );
};
