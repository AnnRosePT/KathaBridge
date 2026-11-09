import React, { useEffect, useRef, useState, useCallback } from "react";
import { Soundtrack } from "../services/soundtrackService";

interface Props {
  onExploreClick?: () => void;
}

// Start from frame 16 (index 15) for immediate rich illumination
const START_FRAME_INDEX = 15;
const END_FRAME_INDEX = 119; // Frame 120
const TOTAL_PLAYABLE_FRAMES = END_FRAME_INDEX - START_FRAME_INDEX + 1; // 105 active visual frames

export const ScrollFrameHero: React.FC<Props> = ({ onExploreClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // Lerp tracking for ultra-smooth 60fps frame interpolation
  const targetFrameRef = useRef<number>(START_FRAME_INDEX);
  const currentRenderedFrameRef = useRef<number>(START_FRAME_INDEX);
  const animLoopIdRef = useRef<number | null>(null);

  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(START_FRAME_INDEX);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [pinState, setPinState] = useState<"top" | "pinned" | "bottom">("top");
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Helper to format frame filename
  const getFrameUrl = useCallback((index: number) => {
    const pad = String(index + 1).padStart(3, "0");
    return `/frames/sequence/ezgif-frame-${pad}.jpg`;
  }, []);

  // Draw a frame to canvas with high-DPI scaling and high-quality smoothing
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Nearest available frame fallback
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
    
    // High-fidelity image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

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

    // Load initial visual frame immediately
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
        if (Math.round(currentRenderedFrameRef.current) === i) {
          renderFrame(i);
        }
      };
    }

    setTimeout(() => {
      renderFrame(START_FRAME_INDEX);
    }, 80);

    return () => {
      imagesRef.current = [];
    };
  }, [getFrameUrl, renderFrame]);

  // 2. Smooth Lerp Animation Loop (60fps weighted damping)
  useEffect(() => {
    let animId: number;
    const lerpLoop = () => {
      const diff = targetFrameRef.current - currentRenderedFrameRef.current;
      if (Math.abs(diff) > 0.04) {
        currentRenderedFrameRef.current += diff * 0.24; // Smooth interpolation speed
        const currentInt = Math.max(
          START_FRAME_INDEX,
          Math.min(END_FRAME_INDEX, Math.round(currentRenderedFrameRef.current))
        );
        renderFrame(currentInt);
        setActiveFrameIndex(currentInt);
      }
      animId = requestAnimationFrame(lerpLoop);
    };

    animId = requestAnimationFrame(lerpLoop);
    animLoopIdRef.current = animId;

    return () => {
      if (animLoopIdRef.current) cancelAnimationFrame(animLoopIdRef.current);
    };
  }, [renderFrame]);

  // 3. Scroll Handler with Viewport Pinning
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      if (scrolled <= 0) {
        setPinState("top");
      } else if (scrolled >= scrollable) {
        setPinState("bottom");
      } else {
        setPinState("pinned");
      }

      setScrollProgress(progress);

      // Target frame calculation
      const target = Math.min(
        END_FRAME_INDEX,
        START_FRAME_INDEX + Math.floor(progress * TOTAL_PLAYABLE_FRAMES)
      );
      targetFrameRef.current = target;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      handleScroll();
      renderFrame(Math.round(currentRenderedFrameRef.current));
    }, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => {});
    };
  }, [renderFrame]);

  // 4. Auto-Play Cinema feature
  useEffect(() => {
    if (!isAutoPlaying) return;

    let autoInterval: any;
    autoInterval = setInterval(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const scrolled = -rect.top;

      if (scrolled >= scrollable - 10) {
        setIsAutoPlaying(false);
        clearInterval(autoInterval);
        return;
      }

      window.scrollBy({ top: 4.5, behavior: "auto" });
    }, 16);

    return () => clearInterval(autoInterval);
  }, [isAutoPlaying]);

  const toggleAutoPlay = () => {
    Soundtrack.playClick();
    setIsAutoPlaying(!isAutoPlaying);
  };

  const handleSkipToStories = () => {
    Soundtrack.playClick();
    setIsAutoPlaying(false);
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
      className="relative w-full h-[280vh] bg-neutral-950 text-white"
      id="scroll-intro-animation"
      data-purpose="scroll-controlled-frame-animation"
    >
      {/* Viewport Stage: Fixed pinning guarantees zero premature cutoff */}
      <div
        className={`w-full h-screen flex items-center justify-center overflow-hidden bg-neutral-950 select-none ${
          pinState === "pinned"
            ? "fixed top-0 left-0 z-30"
            : pinState === "bottom"
            ? "absolute bottom-0 left-0 z-20"
            : "absolute top-0 left-0 z-20"
        }`}
      >
        {/* Layer 1: GPU-Accelerated Crisp Image (Always visible fallback) */}
        <img
          src={getFrameUrl(activeFrameIndex)}
          alt="KathaBridge Living Heritage Cinema"
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-105 contrast-[1.02]"
        />

        {/* Layer 2: Ultra-Smooth High-DPI Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/55 pointer-events-none z-10" />

        {/* Top Control Bar */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-lg">
            <svg
              className="w-6 h-6 text-[#FF2D78] animate-spin"
              style={{ animationDuration: "10s" }}
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
            {/* Auto-Play Cinema Toggle */}
            <button
              onClick={toggleAutoPlay}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border cursor-pointer ${
                isAutoPlaying
                  ? "bg-brandPink text-white border-brandPink shadow-[0_0_15px_rgba(255,45,120,0.6)]"
                  : "bg-black/70 backdrop-blur-md text-white border-white/20 hover:border-[#FFFC00]"
              }`}
            >
              <span>{isAutoPlaying ? "⏸" : "▶"}</span>
              <span>{isAutoPlaying ? "Pause Auto-Scroll" : "Auto-Play Cinema"}</span>
            </button>

            {/* Frame Counter Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-mono shadow-md">
              <span className="text-neutral-400">FRAME</span>
              <span className="text-[#FFFC00] font-black">
                {String(currentDisplayNumber).padStart(3, "0")} / 120
              </span>
            </div>

            {/* Skip to Main Site */}
            <button
              onClick={handleSkipToStories}
              className="bg-[#FFFC00] hover:bg-[#ffe600] text-black border-2 border-brandBlack px-4 py-1.5 rounded-full text-xs font-black transition-all transform hover:scale-105 shadow-[2px_2px_0px_#FF2D78] cursor-pointer flex items-center gap-1.5"
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
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/70 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_25px_rgba(255,252,0,0.4)]">
            <span>✦ FOLKLORE IN MOTION • വാമൊഴി പൈതൃകം ✦</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]">
            Stories Beyond <span className="text-brandYellow underline decoration-brandPink decoration-wavy decoration-2">Language.</span>
          </h1>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl">
            Translating centuries of oral folklore into a living, scroll-driven visual journey.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 animate-bounce text-xs font-mono text-[#FFFC00]">
            <span className="bg-black/70 backdrop-blur-sm px-3.5 py-1 rounded-full border border-[#FFFC00]/40 shadow-md">
              ↓ Scroll down or press Auto-Play
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
          <div className="inline-flex items-center gap-2 border border-brandPink/80 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-brandPink mb-4 shadow-[0_0_25px_rgba(255,45,120,0.4)]">
            <span>തെയ്യം • കൂടിയാട്ടം • RITUAL FOLKLORE</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]">
            Living Gods &amp; Sacred Groves.
          </h2>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl">
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
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/70 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_25px_rgba(255,252,0,0.4)]">
            <span>✦ KATHABRIDGE ARCHIVE READY ✦</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4 drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]">
            Enter the Full Archive.
          </h2>
          <p className="text-neutral-100 text-sm sm:text-lg max-w-lg mx-auto font-semibold leading-relaxed mb-6 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl">
            Explore bilingual stories, synchronized Malayalam karaoke audio, cultural glossary, and scholar review tools below.
          </p>
          <button
            onClick={handleSkipToStories}
            className="inline-flex items-center gap-3 bg-[#FFFC00] hover:bg-[#ffe600] text-black font-extrabold text-base px-8 py-4 rounded-full shadow-[0_0_35px_rgba(255,252,0,0.6)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Enter Stories Collection</span>
            <span className="text-lg">↓</span>
          </button>
        </div>

        {/* Bottom Progress Tracker Ribbon */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-xs font-mono text-neutral-200 max-w-7xl mx-auto bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/15 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SCROLL PROGRESS</span>
            <span className="text-[#FFFC00] font-black">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-36 sm:w-64 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-brandPink to-[#FFFC00] transition-all duration-100"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          <div className="text-[11px] text-neutral-400 hidden sm:block">
            {loadedCount < TOTAL_PLAYABLE_FRAMES ? `Buffering frames (${loadedCount}/${TOTAL_PLAYABLE_FRAMES})...` : "Ultra-HD 60fps Ready"}
          </div>
        </div>
      </div>
    </section>
  );
};
