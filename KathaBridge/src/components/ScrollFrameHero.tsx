import React, { useEffect, useRef, useState, useCallback } from "react";
import { Soundtrack } from "../services/soundtrackService";

interface Props {
  onExploreClick?: () => void;
}

const TOTAL_FRAMES = 120;

export const ScrollFrameHero: React.FC<Props> = ({ onExploreClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeFrameDisplay, setActiveFrameDisplay] = useState<number>(1);

  // Helper to format frame filename
  const getFrameUrl = (index: number) => {
    const pad = String(index + 1).padStart(3, "0");
    return `/frames/sequence/ezgif-frame-${pad}.jpg`;
  };

  // Draw a specific image to the canvas with "cover" fit math
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Cover math: preserve aspect ratio, centered crop
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

  // 1. Preload frame sequence
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    imagesRef.current = images;

    let loaded = 0;

    // Load Frame 0 first so screen isn't black
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    images[0] = firstImg;
    firstImg.onload = () => {
      loaded++;
      setLoadedCount(loaded);
      renderFrame(0);
    };

    // Load remaining frames asynchronously
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      images[i] = img;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        // If current frame happens to be this one, render it
        if (currentFrameRef.current === i) {
          renderFrame(i);
        }
      };
    }

    return () => {
      imagesRef.current = [];
    };
  }, [renderFrame]);

  // 2. Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));

      setScrollProgress(progress);
      setActiveFrameDisplay(targetFrame + 1);

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

    // Initial check
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
      const el = document.getElementById("stories");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] bg-black text-white"
      id="scroll-intro-animation"
      data-purpose="scroll-controlled-frame-animation"
    >
      {/* Sticky full-screen stage */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black select-none">
        {/* Canvas viewport */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        />

        {/* Ambient Dark Gradient Vignette for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/70 pointer-events-none z-10" />

        {/* Top Control Bar inside Animation */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <svg
              className="w-7 h-7 text-brandPink animate-spin"
              style={{ animationDuration: "10s" }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
            </svg>
            <div>
              <span className="font-editorial text-2xl font-black tracking-tight text-white block leading-none">
                KathaBridge
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#FFFC00] uppercase font-bold">
                Scroll Cinema Experience
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Frame counter badge */}
            <div className="hidden sm:flex items-center gap-2 bg-neutral-900/80 border border-neutral-700/80 px-3 py-1.5 rounded-full text-xs font-mono">
              <span className="text-neutral-400">FRAME</span>
              <span className="text-brandYellow font-bold">
                {String(activeFrameDisplay).padStart(3, "0")} / {TOTAL_FRAMES}
              </span>
            </div>

            {/* Skip directly to main app */}
            <button
              onClick={handleSkipToStories}
              className="bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack px-4 py-1.5 rounded-full text-xs font-black transition-all transform hover:scale-105 shadow-[2px_2px_0px_#FFFC00] cursor-pointer flex items-center gap-1.5"
            >
              <span>Skip Animation</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        {/* Scrollytelling Stage 1: 0% - 30% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress < 0.32
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-8 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/60 bg-black/70 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_15px_rgba(255,252,0,0.3)]">
            <span>✦ CULTURE IN MOTION ✦</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4">
            Stories Beyond <span className="text-brandYellow underline decoration-brandPink decoration-wavy decoration-2">Language.</span>
          </h1>
          <p className="text-neutral-200 text-sm sm:text-lg max-w-lg mx-auto font-medium leading-relaxed drop-shadow-md">
            Translating centuries of oral folklore into a living, scroll-driven visual journey.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2 animate-bounce text-xs font-mono text-brandYellow">
            <span>↓ Scroll down to play frames</span>
            <div className="w-5 h-8 border-2 border-brandYellow rounded-full flex justify-center pt-1">
              <div className="w-1 h-2 bg-brandYellow rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Scrollytelling Stage 2: 33% - 66% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress >= 0.33 && scrollProgress < 0.68
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-brandPink/70 bg-black/70 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-brandPink mb-4 shadow-[0_0_15px_rgba(255,45,120,0.3)]">
            <span>RITUAL FOLKLORE • SUBALTERN VOICES</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4">
            Living Gods &amp; Sacred Groves.
          </h2>
          <p className="text-neutral-200 text-sm sm:text-lg max-w-lg mx-auto font-medium leading-relaxed drop-shadow-md">
            Theyyam trance dances, Sanskrit theatrical masterworks, and egalitarian folk memories preserved with authentic native voice.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="text-xs font-mono text-neutral-400">Keep scrolling to enter archive</span>
            <span className="text-brandYellow font-bold">↓</span>
          </div>
        </div>

        {/* Scrollytelling Stage 3: 68% - 100% */}
        <div
          className={`absolute z-20 max-w-2xl text-center px-6 transition-all duration-500 transform ${
            scrollProgress >= 0.68
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <div className="inline-flex items-center gap-2 border border-[#FFFC00]/60 bg-black/70 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#FFFC00] mb-4 shadow-[0_0_15px_rgba(255,252,0,0.3)]">
            <span>✦ KATHABRIDGE ARCHIVE IS READY ✦</span>
          </div>
          <h2 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05] mb-4">
            Welcome to the Full Archive.
          </h2>
          <p className="text-neutral-200 text-sm sm:text-lg max-w-lg mx-auto font-medium leading-relaxed mb-6 drop-shadow-md">
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
        <div className="absolute bottom-4 left-6 right-6 z-20 flex items-center justify-between text-xs font-mono text-neutral-400 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span>SCROLL PROGRESS</span>
            <span className="text-brandYellow font-bold">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-48 sm:w-64 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
            <div
              className="h-full bg-gradient-to-r from-brandPink to-brandYellow transition-all duration-100"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>

          <div className="text-[11px] text-neutral-500 hidden sm:block">
            {loadedCount < TOTAL_FRAMES ? `Loading frames (${loadedCount}/${TOTAL_FRAMES})...` : "120 Frames Loaded"}
          </div>
        </div>
      </div>
    </section>
  );
};
