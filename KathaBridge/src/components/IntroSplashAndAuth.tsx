import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "../types";
import { Soundtrack } from "../services/soundtrackService";
import {
  isFirebaseLive,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail
} from "../services/firebaseAuth";

interface Props {
  isOpen: boolean;
  onComplete: () => void;
  onUserLogin: (user: UserProfile) => void;
  currentUser: UserProfile | null;
}

export const IntroSplashAndAuth: React.FC<Props> = ({
  isOpen,
  onComplete,
  onUserLogin,
  currentUser
}) => {
  // Stages: "loading" -> "hero"
  const [stage, setStage] = useState<"loading" | "hero">("loading");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [progressPct, setProgressPct] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING ARCHIVE...");
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Form input state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tiltCardRef = useRef<HTMLDivElement | null>(null);

  const loaderQuotes = [
    "Translating centuries of oral folklore into vibrant interactive experiences...",
    "Preserving endangered dialects, ritual songs, and living oral traditions...",
    "Connecting UNESCO intangible heritage with universal accessibility...",
    "Welcome to KathaBridge: Stories Beyond Language."
  ];

  const loaderStages = [
    { pct: 32, text: "INDEXING REGIONAL TALES..." },
    { pct: 64, text: "SYNCHRONIZING BILINGUAL AUDIO..." },
    { pct: 89, text: "PREPARING CULTURAL ARCHIVE..." },
    { pct: 100, text: "WELCOME TO KATHABRIDGE" }
  ];

  // 1. Loading sequence
  useEffect(() => {
    if (!isOpen) return;
    setStage("loading");
    setIsLoginModalOpen(true);
    setProgressPct(0);

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < loaderStages.length) {
        setProgressPct(loaderStages[stageIdx].pct);
        setStatusText(loaderStages[stageIdx].text);
        setCurrentQuoteIndex((prev) => (prev + 1) % loaderQuotes.length);
        if (isAudioEnabled) {
          Soundtrack.playClick();
        }
        stageIdx++;
      } else {
        clearInterval(interval);
        // Completed loading -> transition to hero with login modal
        setTimeout(() => {
          if (isAudioEnabled) {
            Soundtrack.playSuccessChime();
          }
          setStage("hero");
          setIsLoginModalOpen(true);
        }, 400);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen]);

  // 2. Interactive Sparkles Canvas (from code.html)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      fadeRate: number;
    }

    const particles: Particle[] = [];
    const colors = ["#FFFC00", "#FF2D78", "#FFFFFF"];

    const createParticle = (x: number, y: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      fadeRate: 0.015 + Math.random() * 0.02
    });

    const handlePointerMove = (e: MouseEvent) => {
      if (Math.random() > 0.4) {
        particles.push(createParticle(e.clientX, e.clientY));
      }
    };
    window.addEventListener("mousemove", handlePointerMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.fadeRate;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  // 3. 3D Tilt Card effect
  useEffect(() => {
    const card = tiltCardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [stage]);

  const handleSkipLoading = () => {
    Soundtrack.playClick();
    Soundtrack.playSuccessChime();
    setStage("hero");
    setIsLoginModalOpen(true);
  };

  const handleGoogleLogin = async () => {
    Soundtrack.playModalPop();
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      if (isFirebaseLive()) {
        const user = await loginWithGoogle();
        onUserLogin(user);
        Soundtrack.playSuccessChime();
        setIsLoginModalOpen(false);
        onComplete();
      } else {
        const mockUser: UserProfile = {
          id: "usr-google-" + Date.now(),
          name: "Aarav Sharma",
          email: "aarav.sharma@gmail.com",
          avatarInitials: "AS",
          role: "SCHOLAR",
          favoriteStoryIds: ["mahabali"],
          readingHistory: [],
          joinedDate: new Date().toISOString().split("T")[0],
          preferredLanguage: "EN",
          authProvider: "local",
          isRealAuth: false
        };
        onUserLogin(mockUser);
        Soundtrack.playSuccessChime();
        setIsLoginModalOpen(false);
        onComplete();
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      let msg = err.message || "Failed to sign in with Google.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Sign-in popup was closed before completion.";
      }
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMobileLogin = () => {
    Soundtrack.playModalPop();
    const mockUser: UserProfile = {
      id: "usr-mob-" + Date.now(),
      name: "Kerala Folk Reader",
      email: "+91 98470 12345",
      avatarInitials: "KF",
      role: "READER",
      favoriteStoryIds: ["mahabali", "theyyam"],
      readingHistory: [],
      joinedDate: new Date().toISOString().split("T")[0],
      preferredLanguage: "ML",
      authProvider: "phone",
      isRealAuth: false
    };
    onUserLogin(mockUser);
    Soundtrack.playSuccessChime();
    setIsLoginModalOpen(false);
    onComplete();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    Soundtrack.playModalPop();
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (isFirebaseLive() && password) {
        try {
          const user = await loginWithEmail(email, password);
          onUserLogin(user);
          Soundtrack.playSuccessChime();
          setIsLoginModalOpen(false);
          onComplete();
          return;
        } catch (loginErr: any) {
          if (loginErr.code === "auth/user-not-found" || loginErr.code === "auth/invalid-credential") {
            const namePart = email.split("@")[0] || "Reader";
            const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
            const user = await registerWithEmail(email, password, displayName, "READER");
            onUserLogin(user);
            Soundtrack.playSuccessChime();
            setIsLoginModalOpen(false);
            onComplete();
            return;
          }
          throw loginErr;
        }
      } else {
        const namePart = email.split("@")[0] || "Reader";
        const initials = (namePart.slice(0, 2) || "KB").toUpperCase();
        const mockUser: UserProfile = {
          id: "usr-email-" + Date.now(),
          name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
          email: email,
          avatarInitials: initials,
          role: "READER",
          favoriteStoryIds: ["mahabali"],
          readingHistory: [],
          joinedDate: new Date().toISOString().split("T")[0],
          preferredLanguage: "EN",
          authProvider: "local",
          isRealAuth: false
        };
        onUserLogin(mockUser);
        Soundtrack.playSuccessChime();
        setIsLoginModalOpen(false);
        onComplete();
      }
    } catch (err: any) {
      console.error("Email auth failed:", err);
      setAuthError(err.message || "Failed to authenticate with email.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCloseModalOnly = () => {
    Soundtrack.playClick();
    setIsLoginModalOpen(false);
  };

  const handleStartScrollAnimation = () => {
    Soundtrack.playClick();
    onComplete();
    setTimeout(() => {
      const el = document.getElementById("scroll-intro-animation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const handleExploreStories = () => {
    Soundtrack.playClick();
    onComplete();
    setTimeout(() => {
      const el = document.getElementById("stories");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto flex flex-col justify-between select-none animate-fade-in">
      {/* Interactive Sparkles Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[110]"
        style={{ width: "100%", height: "100%" }}
      />

      {/* ========================================================== */}
      {/* 1. FULLSCREEN INTRO / LOADING CURTAIN                      */}
      {/* ========================================================== */}
      {stage === "loading" && (
        <div
          className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-between p-6 sm:p-12 transition-all duration-700 select-none animate-fade-in"
          id="intro-screen"
        >
          {/* Top Bar inside Loader */}
          <div className="w-full flex items-center justify-between max-w-6xl">
            <div className="flex items-center gap-3">
              {/* Hot Pink Spinning Starburst */}
              <svg
                className="w-7 h-7 text-[#FF2D78] animate-spin"
                fill="currentColor"
                style={{ animationDuration: "8s" }}
                viewBox="0 0 24 24"
              >
                <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
              </svg>
              <span className="font-bold text-xl tracking-tight text-white font-sans">
                KathaBridge
              </span>
            </div>

            {/* Audio FX Controller / Equalizer Indicator */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-neutral-800 hover:border-[#FFFC00]/60 bg-neutral-900/70 text-xs font-mono transition-all group cursor-pointer"
                onClick={() => {
                  setIsAudioEnabled(!isAudioEnabled);
                  Soundtrack.playClick();
                }}
              >
                <div
                  className={`flex items-end gap-0.5 h-4 w-4 ${
                    isAudioEnabled ? "" : "opacity-30"
                  }`}
                >
                  <span className="w-1 bg-[#FFFC00] rounded-sm eq-bar-1"></span>
                  <span className="w-1 bg-[#FF2D78] rounded-sm eq-bar-2"></span>
                  <span className="w-1 bg-[#FFFC00] rounded-sm eq-bar-3"></span>
                </div>
                <span className="text-neutral-300 group-hover:text-white tracking-wider">
                  {isAudioEnabled ? "SOUND FX: ON" : "SOUND FX: OFF"}
                </span>
              </button>
              <div className="hidden md:block text-xs tracking-widest uppercase text-neutral-400 font-mono">
                Cultural Folklore Archive • 2025
              </div>
            </div>
          </div>

          {/* Center Interactive Loader Element */}
          <div className="flex flex-col items-center text-center max-w-lg my-auto">
            {/* Mascot Emblem with glowing pulse */}
            <div
              className="relative mb-8 cursor-pointer group"
              onClick={handleSkipLoading}
              title="Click to enter immediately"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#FFFC00] p-[3px] animate-logo-pulse">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center p-3">
                  <svg className="w-12 h-12 text-[#FFFC00]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
                  </svg>
                </div>
              </div>
              {/* Pulsing ring badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#FF2D78] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono whitespace-nowrap shadow-md">
                Loading Stories
              </div>
            </div>

            {/* Animated Tagline */}
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-white">
              Stories Beyond <span className="text-[#FFFC00]">Language.</span>
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-8 h-12 transition-opacity duration-300">
              "{loaderQuotes[currentQuoteIndex]}"
            </p>

            {/* Progress Track */}
            <div className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-full h-2 p-0.5 relative overflow-hidden mb-3">
              <div
                className="bg-gradient-to-r from-[#FF2D78] to-[#FFFC00] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between w-full max-w-xs text-xs font-mono text-neutral-500">
              <span>{statusText}</span>
              <span className="text-[#FFFC00] font-bold">{progressPct}%</span>
            </div>

            {/* Skip Button */}
            <button
              className="mt-8 text-xs text-neutral-400 hover:text-white underline underline-offset-4 tracking-wider uppercase font-mono transition-colors cursor-pointer"
              onClick={handleSkipLoading}
            >
              Skip intro directly to Login →
            </button>
          </div>

          {/* Bottom disclaimer */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[11px] text-neutral-500 font-mono tracking-wider">
            <span>MTC24 DESIGN FESTIVAL EDITION</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#FFFC00]/80">WEB AUDIO SYNTH ENGINE ACTIVE</span>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. THE EXACT DARK INTRO HERO BASE (From user screenshot)   */}
      {/* ========================================================== */}
      <div className="w-full min-h-screen flex flex-col justify-between relative z-10 bg-black">
        {/* Top Sticky Navigation Bar */}
        <header className="w-full px-6 sm:px-12 py-5 flex items-center justify-between relative z-30 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => {
              Soundtrack.playClick();
              setStage("loading");
            }}
          >
            <svg
              className="w-7 h-7 text-[#FF2D78] transition-transform duration-300 group-hover:rotate-45"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
            </svg>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-none">
                KathaBridge
              </span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono mt-0.5">
                Stories Beyond Language
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-3 sm:gap-5">
            <button
              className="bg-[#FFFC00] text-black font-bold text-xs sm:text-sm px-5 py-2 rounded-full shadow-[0_0_15px_rgba(255,252,0,0.3)] hover:scale-105 transition-all cursor-pointer"
              onClick={handleExploreStories}
            >
              Home
            </button>
            <button
              className="text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
              onClick={handleExploreStories}
            >
              Stories
            </button>
            <button
              className="text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
              onClick={handleExploreStories}
            >
              About
            </button>

            {/* Language Switcher Pill */}
            <div className="hidden sm:flex items-center gap-1.5 border border-neutral-700/80 rounded-full px-3.5 py-1.5 text-xs text-neutral-300">
              <span>English</span>
              <span className="text-neutral-500 text-xs">▼</span>
            </div>

            {/* Sign In / User Status */}
            <button
              className="border border-[#FF2D78] hover:bg-[#FF2D78] text-[#FF2D78] hover:text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer"
              onClick={() => {
                Soundtrack.playModalPop();
                setIsLoginModalOpen(true);
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
              <span>{currentUser ? currentUser.name.split(" ")[0] : "Sign In"}</span>
            </button>
          </nav>
        </header>

        {/* Hero Main Section */}
        <main className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-grow relative z-20">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 border border-[#FFFC00]/40 bg-black/60 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#FFFC00]">
              <span>Culture</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78]"></span>
              <span>Language</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78]"></span>
              <span>Accessibility</span>
            </div>

            {/* Main Headline from Screenshot */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight leading-[1.02] text-white">
              Stories<br />
              Beyond<br />
              <span className="text-[#FFFC00] inline-block relative">
                Language.
                <span className="absolute -bottom-1 left-0 w-full h-2 bg-[#FFFC00]/20 blur-sm rounded"></span>
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-neutral-400 text-base sm:text-lg max-w-md leading-relaxed">
              Discover India's rich cultural stories across languages with accessible, meaningful and human-reviewed storytelling.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                className="bg-[#FFFC00] hover:bg-[#ffe600] text-black font-extrabold text-sm sm:text-base px-8 py-4 rounded-full shadow-[0_0_35px_rgba(255,252,0,0.5)] hover:shadow-[0_0_45px_rgba(255,252,0,0.7)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer group"
                onClick={handleStartScrollAnimation}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-brandPink animate-ping"></span>
                <span>Start Scroll Animation</span>
                <span className="text-lg group-hover:translate-y-0.5 transition-transform">↓</span>
              </button>

              <button
                className="bg-neutral-900/90 hover:bg-neutral-800 text-white font-bold text-sm px-6 py-4 rounded-full border border-neutral-700 hover:border-brandYellow transition-all flex items-center gap-2 cursor-pointer shadow-md"
                onClick={handleExploreStories}
              >
                <span>Explore Stories</span>
                <span>→</span>
              </button>

              <button
                className="bg-black/60 hover:bg-neutral-900 text-neutral-300 hover:text-white font-semibold text-xs px-5 py-4 rounded-full border border-neutral-800 transition-all cursor-pointer"
                onClick={() => {
                  Soundtrack.playModalPop();
                  setIsLoginModalOpen(true);
                }}
              >
                Account &amp; Library
              </button>
            </div>

            {/* Live Experience Quick Trigger */}
            <div className="pt-4 flex items-center gap-3 text-xs text-neutral-400 font-mono">
              <button
                className="hover:text-[#FFFC00] flex items-center gap-1.5 transition-colors cursor-pointer"
                onClick={() => {
                  Soundtrack.playClick();
                  setStage("loading");
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                <span>Replay Intro Splash</span>
              </button>
              <span>•</span>
              <span className="text-neutral-500">Interactive 3D Tilt Active</span>
            </div>
          </div>

          {/* Right Column: 3D Artwork Ensemble with Pulsing Stars */}
          <div className="lg:col-span-6 relative flex items-center justify-center py-6">
            <div
              ref={tiltCardRef}
              className="tilt-card relative w-full max-w-[540px] flex items-center justify-center p-4 transition-transform duration-200"
            >
              {/* Floating Animated Pink Accent Stars */}
              <div className="absolute -top-4 right-16 z-20 pointer-events-none float-star-1">
                <svg className="w-10 h-10 text-[#FF2D78]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
                </svg>
              </div>
              <div className="absolute top-1/4 -left-4 z-20 pointer-events-none float-star-2">
                <svg className="w-12 h-12 text-[#FF2D78]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
                </svg>
              </div>
              <div className="absolute bottom-1/3 -right-6 z-20 pointer-events-none float-star-3">
                <svg className="w-9 h-9 text-[#FF2D78]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
                </svg>
              </div>

              {/* Cultural Ensemble Illustration */}
              <div className="relative w-full overflow-visible transition-transform duration-300 hover:scale-[1.03]">
                <img
                  alt="KathaBridge Cultural Folklore Ensemble"
                  className="w-full h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)] drop-shadow-[0_0_60px_rgba(255,45,120,0.25)] select-none cursor-pointer"
                  src="/images/landing/login_ensemble_transparent.png"
                  onClick={handleStartScrollAnimation}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Angled Running Marquee Ticker Tape */}
        <div className="w-full overflow-hidden bg-[#FFFC00] text-black py-3 sm:py-3.5 transform rotate-[-1.5deg] scale-[1.04] origin-left shadow-[0_10px_30px_rgba(255,252,0,0.3)] relative z-30 mt-6 border-y-2 border-black">
          <div className="animate-marquee whitespace-nowrap flex items-center text-sm sm:text-base font-extrabold uppercase tracking-widest font-mono">
            <span className="flex items-center gap-6 mx-4">
              <span>KATHABRIDGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>KATHABRIDGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>STORIES BEYOND LANGUAGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>CULTURAL HERITAGE ARCHIVE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>MALAYALAM NARRATION ENGINE</span>
              <span className="text-[#FF2D78]">✳</span>
            </span>
            <span className="flex items-center gap-6 mx-4" aria-hidden="true">
              <span>KATHABRIDGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>KATHABRIDGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>STORIES BEYOND LANGUAGE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>CULTURAL HERITAGE ARCHIVE</span>
              <span className="text-[#FF2D78]">✳</span>
              <span>MALAYALAM NARRATION ENGINE</span>
              <span className="text-[#FF2D78]">✳</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 3. LOGIN MODAL OVERLAY (When isLoginModalOpen === true)     */}
      {/* ========================================================== */}
      {isLoginModalOpen && stage === "hero" && (
        <div
          className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-500 animate-fade-in"
          id="login-modal"
        >
          <div
            className="relative w-full max-w-md bg-[#0F0F0F] border-2 border-[#FFFC00] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,252,0,0.25)] transition-all transform scale-100 duration-300"
            id="login-card"
          >
            {/* Close Button -> reveals Dark Hero page cleanly */}
            <button
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#FF2D78] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              onClick={handleCloseModalOnly}
              title="Close modal and explore intro page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
              </svg>
            </button>

            {/* Decorative Brand Star */}
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-6 h-6 text-[#FF2D78]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0L14.5 8.5L23.5 9.5L16.5 15.5L18.5 24L12 19L5.5 24L7.5 15.5L0.5 9.5L9.5 8.5L12 0Z"></path>
              </svg>
              <span className="text-xs uppercase font-mono tracking-widest text-[#FFFC00] font-bold">
                KATHABRIDGE ACCESS
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Enter the World of Stories
            </h3>
            <p className="text-neutral-400 text-sm mb-5 leading-relaxed">
              Sign in with your email or username to save folklore bookmarks and track your reading journey.
            </p>

            {/* Email Form */}
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Email or Username
                </label>
                <input
                  className="w-full bg-black border border-neutral-800 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00] text-sm px-4 py-3 rounded-xl text-white placeholder-neutral-600 outline-none transition-all"
                  placeholder="e.g. reader@kathabridge.org"
                  required
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-300">Password</label>
                </div>
                <input
                  className="w-full bg-black border border-neutral-800 focus:border-[#FFFC00] focus:ring-1 focus:ring-[#FFFC00] text-sm px-4 py-3 rounded-xl text-white placeholder-neutral-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                className="w-full bg-[#FFFC00] hover:bg-[#ffe600] text-black font-extrabold text-sm py-3.5 px-4 rounded-full transition-transform active:scale-95 shadow-[0_0_20px_rgba(255,252,0,0.3)] mt-2 flex items-center justify-center gap-2 cursor-pointer"
                type="submit"
              >
                <span>Sign In to KathaBridge</span>
                <span>→</span>
              </button>
            </form>

            {/* Instant 1-Click Demo Testing */}
            <div className="pt-4 mt-4 border-t border-neutral-800">
              <span className="block text-center text-[10px] font-mono uppercase text-neutral-500 mb-2 font-bold tracking-wider">
                OR TEST INSTANTLY WITH 1-CLICK
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    Soundtrack.playSuccessChime();
                    onUserLogin({
                      id: "usr-aarav-" + Date.now(),
                      name: "Aarav Sharma",
                      email: "aarav.sharma@kathabridge.org",
                      role: "SCHOLAR",
                      avatarInitials: "AS",
                      favoriteStoryIds: ["mahabali", "theyyam", "panchatantra"],
                      readingHistory: [
                        { storyId: "mahabali", lastReadAt: new Date().toISOString(), progressPercentage: 100 },
                        { storyId: "theyyam", lastReadAt: new Date(Date.now() - 86400000).toISOString(), progressPercentage: 80 }
                      ],
                      joinedDate: "November 2026",
                      preferredLanguage: "EN",
                      authProvider: "local",
                      isRealAuth: true
                    });
                    setIsLoginModalOpen(false);
                    onComplete();
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-[#FFFC00] py-2 px-3 rounded-xl font-mono text-[11px] font-bold border border-neutral-700 transition cursor-pointer text-center"
                >
                  ⚡ Aarav (Scholar)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    Soundtrack.playSuccessChime();
                    onUserLogin({
                      id: "usr-devi-" + Date.now(),
                      name: "Devi Varma",
                      email: "devi.varma@heritage.in",
                      role: "READER",
                      avatarInitials: "DV",
                      favoriteStoryIds: ["mahabali"],
                      readingHistory: [
                        { storyId: "mahabali", lastReadAt: new Date().toISOString(), progressPercentage: 100 }
                      ],
                      joinedDate: "November 2026",
                      preferredLanguage: "EN",
                      authProvider: "local",
                      isRealAuth: true
                    });
                    setIsLoginModalOpen(false);
                    onComplete();
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white py-2 px-3 rounded-xl font-mono text-[11px] font-bold border border-neutral-700 transition cursor-pointer text-center"
                >
                  📖 Devi (Reader)
                </button>
              </div>
            </div>

            {/* Guest Entry Link */}
            <div className="mt-5 text-center">
              <button
                className="text-xs text-neutral-400 hover:text-[#FFFC00] transition-colors underline underline-offset-4 font-mono cursor-pointer"
                onClick={handleCloseModalOnly}
              >
                Or continue as Guest Reader (Read-Only) →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
