import React, { useState, useEffect, useRef } from "react";
import { Story, CulturalExpression, UserProfile, AccessibilitySettings, LanguageCode } from "./types";
import { mockStories, mockCulturalExpressions } from "./data/mockData";
import { StorageService } from "./services/storageService";
import { Soundtrack } from "./services/soundtrackService";
import { SoundtrackWidget } from "./components/SoundtrackWidget";
import { ConfettiEffect } from "./components/ConfettiEffect";
import { StoryReaderModal } from "./components/StoryReaderModal";
import { CulturalTermPopover } from "./components/CulturalTermPopover";
import { GlossaryModal } from "./components/GlossaryModal";
import { AccessibilityModal } from "./components/AccessibilityModal";
import { ReviewerDashboardModal } from "./components/ReviewerDashboardModal";
import { ContributionModal } from "./components/ContributionModal";
import { AuthModal } from "./components/AuthModal";
import { MalayalamVoiceLabModal } from "./components/MalayalamVoiceLabModal";
import { ContactAndPolicyModals, PolicyType } from "./components/ContactAndPolicyModals";
import { speakSafely } from "./utils/malayalamPhonetics";
import { getUIText } from "./utils/translations";

export default function App() {
  // Navigation & UI State
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("EN");

  const t = getUIText(selectedLanguage);

  // User & Accessibility State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => StorageService.getUser());
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() =>
    StorageService.getAccessibility()
  );

  // Modals State
  const [activeStoryReader, setActiveStoryReader] = useState<Story | null>(null);
  const [activeTermPopover, setActiveTermPopover] = useState<CulturalExpression | null>(null);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [a11yModalOpen, setA11yModalOpen] = useState(false);
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [voiceLabOpen, setVoiceLabOpen] = useState(false);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType | null>(null);

  // Celebratory Confetti & Sound
  const [showConfetti, setShowConfetti] = useState(false);

  // Story Library Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "DURATION" | "POPULAR">("DEFAULT");

  // Audio speech intro state
  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<"explorer" | "scholar" | "contributor" | "inclusive">("explorer");

  // Feedback & Newsletter
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ["home", "our-mission", "stories", "explore", "about", "contribute"];
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update Accessibility styling on root
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${accessibilitySettings.fontSizeScale * 100}%`;

    if (accessibilitySettings.reduceMotion) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }, [accessibilitySettings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFavoriteToggle = (storyId: string) => {
    Soundtrack.playClick();
    const isNowFav = StorageService.toggleFavorite(storyId);
    setFavorites(StorageService.getFavorites());
    if (isNowFav) {
      Soundtrack.playSuccessChime();
    }
    showToast(isNowFav ? "Story saved to your personal collection ★" : "Story removed from favorites");
  };

  const toggleIntroAudio = () => {
    Soundtrack.playClick();
    if (isIntroSpeaking) {
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current.currentTime = 0;
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsIntroSpeaking(false);
      showToast("Intro narration stopped.");
      return;
    }

    const audioSrc = selectedLanguage === "ML" ? "/audio/tts/intro_ml.mp3" : "/audio/tts/intro_en.mp3";
    const audio = new Audio(audioSrc);
    introAudioRef.current = audio;

    audio.onended = () => {
      setIsIntroSpeaking(false);
    };

    audio.onerror = () => {
      const intro =
        selectedLanguage === "ML"
          ? "കഥാബ്രിഡ്ജിലേക്ക് സ്വാഗതം. ഭാഷകൾക്കപ്പുറമുള്ള സാംസ്കാരിക കഥകളും നാടൻ കലകളും അവയുടെ തനതായ സന്ദർഭത്തോടെ മനസ്സിലാക്കാം."
          : "Welcome to KathaBridge: Stories beyond language. Discover cultural stories, folk performances and regional literature with meaning, context and inclusive access for all.";
      if ("speechSynthesis" in window) {
        speakSafely(window.speechSynthesis, intro, selectedLanguage, {
          rate: 0.95,
          onEnd: () => setIsIntroSpeaking(false),
          onError: () => setIsIntroSpeaking(false)
        });
      } else {
        setIsIntroSpeaking(false);
      }
    };

    setIsIntroSpeaking(true);
    audio.play().catch(() => {
      setIsIntroSpeaking(false);
    });

    showToast(
      selectedLanguage === "ML"
        ? "കഥാബ്രിഡ്ജ് ആമുഖ വിവരണം കേൾക്കുന്നു (Sobhana Neural)..."
        : "Playing KathaBridge audio introduction (Neerja Neural)..."
    );
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      showToast("Please provide a valid email address.");
      return;
    }
    Soundtrack.playSuccessChime();
    setShowConfetti(true);
    showToast(`Subscribed! Weekly Folklore Dispatch will arrive at ${newsletterEmail}`);
    setNewsletterEmail("");
  };

  // Filtered stories logic
  const filteredStories = mockStories
    .filter((story) => {
      const matchesSearch =
        story.title.EN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.title.ML.includes(searchQuery) ||
        story.summary.EN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.originRegion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === "ALL" || story.category === selectedCategory;

      const matchesLang =
        selectedLanguageFilter === "ALL" ||
        (selectedLanguageFilter === "MALAYALAM" &&
          (story.availableLanguages.includes("ML") ||
            story.originalLanguage.toLowerCase().includes("malayalam"))) ||
        (selectedLanguageFilter === "SANSKRIT" &&
          (story.availableLanguages.includes("SA") ||
            story.originalLanguage.toLowerCase().includes("sanskrit"))) ||
        story.availableLanguages.includes(selectedLanguageFilter as any);

      return matchesSearch && matchesCategory && matchesLang;
    })
    .sort((a, b) => {
      if (sortBy === "DURATION") return a.readingDurationMinutes - b.readingDurationMinutes;
      if (sortBy === "POPULAR") return (b.viewsCount || 0) - (a.viewsCount || 0);
      return 0;
    });

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden font-sans selection:bg-brandPink selection:text-white flex flex-col justify-between transition-colors duration-200 ${
        accessibilitySettings.contrastMode === "dark"
          ? "bg-neutral-950 text-neutral-100"
          : accessibilitySettings.contrastMode === "high-contrast"
          ? "bg-black text-brandYellow"
          : accessibilitySettings.contrastMode === "sepia"
          ? "bg-[#FBF0D9] text-[#2C2416]"
          : "bg-canvas text-brandBlack"
      }`}
    >
      {/* Confetti Particle Burst */}
      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}

      {/* Floating Cultural Indian BGM Soundtrack Player */}
      <SoundtrackWidget />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brandBlack text-brandYellow border-2 border-brandPink px-5 py-3 rounded-xl shadow-[5px_5px_0px_#FF087D] font-mono text-xs font-black flex items-center gap-2.5 animate-bounce">
          <span className="text-brandPink text-sm">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* TOP NAVIGATION BAR (Sticky with Scroll Transition) */}
      {/* =================================================================== */}
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-[#FFFC00]/95 backdrop-blur-md border-b-2 border-brandBlack shadow-[0_4px_0_#080808] py-3.5"
            : "bg-transparent pt-7 pb-4"
        }`}
        data-purpose="site-navigation"
      >
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 flex items-center justify-between">
          {/* Brand Identity Logo */}
          <div className="flex items-center gap-6" data-purpose="brand-identity">
            <a
              className="group flex flex-col"
              href="#home"
              onClick={() => Soundtrack.playClick()}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[28px] font-black tracking-tight text-brandBlack leading-none font-sans">
                  KathaBridge
                </span>
                {/* 4-point hot-pink star */}
                <svg
                  className="w-5 h-5 text-brandPink fill-current -mt-1 group-hover:scale-125 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"></path>
                </svg>
              </div>
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-brandBlack uppercase mt-1">
                {t.nav.tagline}
              </span>
            </a>

            {/* Vertical divider */}
            <div className="h-8 w-[2px] bg-brandBlack hidden md:block"></div>

            {/* Navigation Pill Links */}
            <nav
              className="hidden md:flex items-center gap-1.5 text-[15px] font-bold tracking-tight"
              data-purpose="primary-links"
            >
              {[
                { id: "home", label: t.nav.home },
                { id: "stories", label: t.nav.stories },
                { id: "explore", label: t.nav.explore },
                { id: "about", label: t.nav.about },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => Soundtrack.playClick()}
                  className={`px-4 py-2 rounded-full border transition duration-150 font-bold ${
                    activeSection === item.id
                      ? "bg-brandPink text-white font-extrabold border-brandBlack shadow-[2px_2px_0px_#080808]"
                      : "text-brandBlack border-transparent hover:bg-white hover:border-brandBlack"
                  }`}
                >
                  {item.label}
                </a>
              ))}

              <button
                onClick={() => {
                  Soundtrack.playModalPop();
                  setContributionModalOpen(true);
                }}
                className="text-brandBlack px-4 py-2 hover:bg-white rounded-full border border-transparent hover:border-brandBlack transition duration-150 font-bold"
              >
                {t.nav.contribute}
              </button>
            </nav>
          </div>

          {/* Right Controls: Accessibility, Audio, Language, Auth, Mobile Menu */}
          <div className="flex items-center gap-2.5 relative" data-purpose="accessibility-controls">
            {/* Malayalam Neural Voice Lab */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setVoiceLabOpen(true);
              }}
              aria-label="Malayalam Voice Lab"
              title="Evaluate Malayalam Neural Voice & Benchmarks"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 border-2 border-brandBlack rounded-full bg-brandYellow hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808]"
            >
              <span>🎙</span>
              <span>ML Voice</span>
            </button>

            {/* Accessibility Center Trigger */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setA11yModalOpen(true);
              }}
              aria-label="Open Accessibility Center"
              title="Accessibility Center (Font scale, contrast, captions)"
              className="flex items-center justify-center px-3.5 py-2 border-2 border-brandBlack rounded-full bg-white hover:bg-brandPink hover:text-white text-xs font-black transition shadow-[3px_3px_0px_#080808]"
            >
              <span className="text-sm font-black">A</span>
              <span className="text-[10px] font-black align-top ml-0.5">a</span>
            </button>

            {/* Audio Speech Narration Toggle */}
            <button
              onClick={toggleIntroAudio}
              aria-label="Listen audio mode"
              title="Play spoken introduction"
              className={`flex items-center justify-center p-2.5 border-2 border-brandBlack rounded-full transition shadow-[3px_3px_0px_#080808] ${
                isIntroSpeaking
                  ? "bg-brandPink text-white animate-pulse"
                  : "bg-white text-brandBlack hover:bg-brandPink hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path
                  d="M3 18v-6a9 9 0 0 1 18 0v6M3 18a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4a1 1 0 0 0-1 1v4zm18 0a3 3 0 0 1-3 3h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3a1 1 0 0 1 1 1v4z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  Soundtrack.playClick();
                  setLanguageOpen(!languageOpen);
                }}
                aria-label="Select Language"
                className="flex items-center gap-1.5 px-3.5 py-2 border-2 border-brandBlack rounded-full bg-white hover:bg-brandPink hover:text-white text-xs font-black transition shadow-[3px_3px_0px_#080808]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span className="font-black tracking-wider">{selectedLanguage}</span>
                <span className="text-[9px]">▼</span>
              </button>

              {languageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-brandBlack rounded-2xl shadow-[5px_5px_0px_#080808] z-50 overflow-hidden font-mono text-xs">
                  {[
                    { code: "EN" as LanguageCode, label: "English (EN)" },
                    { code: "ML" as LanguageCode, label: "Malayalam (മലയാളം)" },
                    { code: "SA" as LanguageCode, label: "Sanskrit (संस्कृतम्)" },
                    { code: "HI" as LanguageCode, label: "Hindi (हिन्दी)" },
                    { code: "TA" as LanguageCode, label: "Tamil (தமிழ்)" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        Soundtrack.playClick();
                        setSelectedLanguage(lang.code);
                        setLanguageOpen(false);
                        showToast(`Interface switched to ${lang.label}`);
                      }}
                      className={`w-full text-left px-4 py-2.5 font-bold transition flex items-center justify-between border-b last:border-0 border-neutral-100 ${
                        selectedLanguage === lang.code
                          ? "bg-brandPink text-white font-black"
                          : "text-brandBlack hover:bg-brandYellow"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {selectedLanguage === lang.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account / Profile Button */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setAuthModalOpen(true);
              }}
              title={currentUser ? `Profile: ${currentUser.name}` : "Sign In / Register"}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-brandBlack rounded-full bg-white hover:bg-brandYellow transition shadow-[3px_3px_0px_#080808]"
            >
              <div className="w-6 h-6 rounded-full bg-brandPink text-white font-mono text-[10px] font-black flex items-center justify-center">
                {currentUser ? currentUser.avatarInitials : "👤"}
              </div>
              <span className="text-xs font-mono font-black text-brandBlack hidden sm:inline">
                {currentUser ? currentUser.name.split(" ")[0] : "Account"}
              </span>
            </button>

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => {
                Soundtrack.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle Navigation Menu"
              className="md:hidden p-2.5 bg-white border-2 border-brandBlack rounded-xl shadow-[3px_3px_0px_#080808]"
            >
              <div className="space-y-1 w-5">
                <div className="h-0.5 bg-brandBlack"></div>
                <div className="h-0.5 bg-brandBlack"></div>
                <div className="h-0.5 bg-brandBlack"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brandYellow border-t-2 border-brandBlack px-6 py-4 space-y-2 font-mono text-sm font-black shadow-[0_6px_0_#080808] animate-fade-in">
            <a
              href="#home"
              onClick={() => {
                Soundtrack.playClick();
                setMobileMenuOpen(false);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20"
            >
              Home
            </a>
            <a
              href="#stories"
              onClick={() => {
                Soundtrack.playClick();
                setMobileMenuOpen(false);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20"
            >
              Stories Collection
            </a>
            <a
              href="#explore"
              onClick={() => {
                Soundtrack.playClick();
                setMobileMenuOpen(false);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20"
            >
              Explore Cultures
            </a>
            <a
              href="#about"
              onClick={() => {
                Soundtrack.playClick();
                setMobileMenuOpen(false);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20"
            >
              About &amp; Mission
            </a>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setMobileMenuOpen(false);
                setContributionModalOpen(true);
              }}
              className="block py-2 text-brandPink text-left w-full"
            >
              + Contribute a Folk Tale
            </button>
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* SECTION 1: HERO SECTION (Exact KathaBridge Intro Page) */}
      {/* =================================================================== */}
      <main
        className="w-full bg-[#0B0B0B] text-white pt-8 pb-16 lg:pb-24 relative overflow-hidden"
        data-purpose="hero-content"
        id="home"
      >
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            {/* Left Column: Headline & Exploration */}
            <div className="lg:col-span-7 flex flex-col justify-center" data-purpose="hero-copy">
              {/* Yellow Pill Badge matching exact screenshot */}
              <div className="inline-flex items-center gap-2 border-2 border-[#FFFC00] text-[#FFFC00] px-4 py-1.5 rounded-full text-xs font-mono font-black uppercase tracking-wider w-fit mb-8 shadow-[0_0_15px_rgba(255,252,0,0.2)]">
                CULTURE · LANGUAGE · ACCESSIBILITY
              </div>

              {/* Exact High-Impact Headline from screenshot */}
              <h1 className="font-sans font-black text-white text-5xl sm:text-7xl lg:text-8xl xl:text-[94px] leading-[1.02] tracking-tight mb-8">
                {selectedLanguage === "ML" ? (
                  <>
                    ഭാഷകൾക്കപ്പുറം<br />
                    സഞ്ചരിക്കുന്ന<br />
                    <span className="text-[#FFFC00]">കഥകൾ.</span>
                  </>
                ) : (
                  <>
                    Stories<br />
                    Beyond<br />
                    <span className="text-[#FFFC00]">Language.</span>
                  </>
                )}
              </h1>

              {/* Subtitle from exact screenshot */}
              <p className="text-neutral-300 text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed max-w-xl mb-10">
                Discover India's rich cultural stories across languages with accessible, meaningful and human-reviewed storytelling.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10" data-purpose="call-to-action-buttons">
                <a
                  className="inline-flex items-center gap-3 bg-[#FFFC00] hover:bg-white text-black font-black px-8 py-4 rounded-full text-base transition-all duration-200 transform hover:-translate-y-1 shadow-[5px_5px_0px_#FF087D] cursor-pointer"
                  href="#stories"
                  onClick={() => Soundtrack.playClick()}
                >
                  <span>Explore Stories</span>
                  <span className="text-xl leading-none font-bold">→</span>
                </a>

                <button
                  onClick={toggleIntroAudio}
                  className={`inline-flex items-center gap-2.5 px-6 py-4 rounded-full text-sm font-black border-2 border-white/60 transition shadow-[4px_4px_0px_rgba(255,255,255,0.15)] ${
                    isIntroSpeaking
                      ? "bg-brandPink text-white border-brandPink animate-pulse"
                      : "bg-transparent text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <span className="text-base">🔊</span>
                  <span>{isIntroSpeaking ? "Stop Narration" : "Listen Spoken Intro"}</span>
                </button>
              </div>

              {/* Quick Persona Highlights bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/20 max-w-2xl">
                <div
                  onClick={() => {
                    setSelectedPersona("explorer");
                    Soundtrack.playClick();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedPersona === "explorer"
                      ? "bg-[#FFFC00]/15 border-[#FFFC00] text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  <div className="text-lg mb-1">🎧</div>
                  <div className="text-xs font-black">Story Explorer</div>
                  <div className="text-[10px] text-neutral-400">Audio & Karaoke</div>
                </div>

                <div
                  onClick={() => {
                    setSelectedPersona("scholar");
                    Soundtrack.playClick();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedPersona === "scholar"
                      ? "bg-brandPink/20 border-brandPink text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  <div className="text-lg mb-1">🎓</div>
                  <div className="text-xs font-black">Scholar Review</div>
                  <div className="text-[10px] text-neutral-400">Verify Dialects</div>
                </div>

                <div
                  onClick={() => {
                    setSelectedPersona("contributor");
                    Soundtrack.playClick();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedPersona === "contributor"
                      ? "bg-[#FFFC00]/15 border-[#FFFC00] text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  <div className="text-lg mb-1">🎙️</div>
                  <div className="text-xs font-black">Oral Contributor</div>
                  <div className="text-[10px] text-neutral-400">Preserve Lore</div>
                </div>

                <div
                  onClick={() => {
                    setSelectedPersona("inclusive");
                    Soundtrack.playClick();
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedPersona === "inclusive"
                      ? "bg-brandPink/20 border-brandPink text-white"
                      : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  <div className="text-lg mb-1">♿</div>
                  <div className="text-xs font-black">Universal Access</div>
                  <div className="text-[10px] text-neutral-400">WCAG 2.1 AAA</div>
                </div>
              </div>
            </div>

            {/* Right Column: Exact Cultural Collage from Figma Mockup */}
            <div
              className="lg:col-span-5 relative flex justify-center items-center min-h-[480px] lg:min-h-[580px] w-full"
              data-purpose="pop-art-hero-illustration"
            >
              {/* Pink floating stars matching screenshot */}
              <svg className="w-8 h-8 text-brandPink fill-current absolute -top-2 right-8 animate-pulse" viewBox="0 0 24 24">
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"/>
              </svg>
              <svg className="w-6 h-6 text-[#FFFC00] fill-current absolute bottom-20 left-6" viewBox="0 0 24 24">
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"/>
              </svg>
              <svg className="w-6 h-6 text-brandPink fill-current absolute top-1/3 -left-4 animate-bounce" viewBox="0 0 24 24">
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"/>
              </svg>

              <div className="relative w-full flex flex-col items-center">
                <img
                  alt="KathaBridge Stories Beyond Language Cultural Collage"
                  className="w-full max-w-[480px] lg:max-w-[540px] xl:max-w-[580px] h-auto object-contain select-none animate-float filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-pointer"
                  onClick={() => {
                    Soundtrack.playModalPop();
                    setActiveStoryReader(mockStories[0]);
                  }}
                  src="/images/landing/hero_collage_transparent.png"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Tilted Yellow Ribbon crossing across the bottom */}
        <div className="relative w-full overflow-hidden py-3.5 bg-[#FFFC00] text-black border-y-2 border-black transform -rotate-1 scale-105 z-20 shadow-[0_6px_25px_rgba(0,0,0,0.6)] mt-12 mb-0">
          <div className="flex whitespace-nowrap select-none font-mono font-black text-sm tracking-widest uppercase pixel-marquee items-center gap-8">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 shrink-0">
                <span className="text-brandPink text-lg">✦</span>
                <span className="text-black font-extrabold tracking-widest">KATHABRIDGE</span>
                <span className="text-brandPink text-lg">✦</span>
                <span className="text-black font-extrabold tracking-widest">STORIES BEYOND LANGUAGE</span>
                <span className="text-brandPink text-lg">✦</span>
                <span className="text-black font-extrabold tracking-widest">CULTURE IN EVERY VOICE</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* =================================================================== */}
      {/* SECTION: INTERACTIVE USER SELECTION & PERSONA EXPERIENCE */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-20"
        id="user-selection"
        data-purpose="user-persona-selection"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-brandBlack pb-6 mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-brandPink text-white border-2 border-brandBlack px-3.5 py-1 text-xs font-mono font-black mb-3 shadow-[2px_2px_0px_#080808]">
              ✦ [ 00 / USER PERSONA SELECTION ] ✦
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight">
              CHOOSE HOW YOU EXPERIENCE KATHABRIDGE.
            </h2>
            <p className="text-brandBlack text-base sm:text-lg font-bold mt-2 max-w-2xl">
              Personalize your storytelling interface. Switch between immersive folklore listening, scholarly transcript verification, community contribution, and universal accessibility.
            </p>
          </div>

          {/* Quick Language Switcher Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-black text-brandBlack uppercase">Quick Language:</span>
            {[
              { code: "EN" as LanguageCode, label: "English" },
              { code: "ML" as LanguageCode, label: "മലയാളം" },
              { code: "SA" as LanguageCode, label: "संस्कृतम्" }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  Soundtrack.playClick();
                  setSelectedLanguage(lang.code);
                  showToast(`Language switched to ${lang.label}`);
                }}
                className={`px-3.5 py-1.5 rounded-full border-2 border-brandBlack text-xs font-black transition shadow-[2px_2px_0px_#080808] ${
                  selectedLanguage === lang.code
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Interactive Persona Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: Story Explorer */}
          <div
            onClick={() => {
              Soundtrack.playClick();
              setSelectedPersona("explorer");
              showToast("Switched to Story Explorer Mode");
            }}
            className={`border-2 border-brandBlack rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[6px_6px_0px_#080808] ${
              selectedPersona === "explorer"
                ? "bg-white ring-4 ring-brandPink -translate-y-1"
                : "bg-white/80 hover:bg-white hover:-translate-y-0.5"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎧</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack ${
                  selectedPersona === "explorer" ? "bg-brandPink text-white" : "bg-neutral-100 text-brandBlack"
                }`}>
                  {selectedPersona === "explorer" ? "✓ ACTIVE MODE" : "STORY EXPLORER"}
                </span>
              </div>
              <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">
                Oral Story Explorer
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-6">
                Immerse in living regional folklore with native neural narration, real-time synchronized karaoke subtitles, and instant cultural term explanations.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-brandBlack/15 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[0]);
                }}
                className="w-full text-center py-2 bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                ▶ Listen to Mahabali
              </button>
              <a
                href="#stories"
                onClick={() => Soundtrack.playClick()}
                className="w-full text-center py-1.5 bg-brandYellow hover:bg-white text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                Browse All 4 Stories ↓
              </a>
            </div>
          </div>

          {/* Card 2: Cultural Scholar */}
          <div
            onClick={() => {
              Soundtrack.playClick();
              setSelectedPersona("scholar");
              showToast("Switched to Cultural Scholar Mode");
            }}
            className={`border-2 border-brandBlack rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[6px_6px_0px_#080808] ${
              selectedPersona === "scholar"
                ? "bg-white ring-4 ring-brandPink -translate-y-1"
                : "bg-white/80 hover:bg-white hover:-translate-y-0.5"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎓</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack ${
                  selectedPersona === "scholar" ? "bg-brandPink text-white" : "bg-neutral-100 text-brandBlack"
                }`}>
                  {selectedPersona === "scholar" ? "✓ ACTIVE MODE" : "PEER-REVIEW"}
                </span>
              </div>
              <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">
                Cultural Scholar
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-6">
                Compare raw oral field recordings against AI draft translations, verify cultural idioms, and audit regional dialect etymologies.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-brandBlack/15 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setReviewerModalOpen(true);
                }}
                className="w-full text-center py-2 bg-brandYellow hover:bg-brandPink hover:text-white text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                ↗ Open Review Queue
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setGlossaryModalOpen(true);
                }}
                className="w-full text-center py-1.5 bg-white hover:bg-brandYellow text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                18-Term Cultural Glossary
              </button>
            </div>
          </div>

          {/* Card 3: Folk Narrator */}
          <div
            onClick={() => {
              Soundtrack.playClick();
              setSelectedPersona("contributor");
              showToast("Switched to Folk Narrator Mode");
            }}
            className={`border-2 border-brandBlack rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[6px_6px_0px_#080808] ${
              selectedPersona === "contributor"
                ? "bg-white ring-4 ring-brandPink -translate-y-1"
                : "bg-white/80 hover:bg-white hover:-translate-y-0.5"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎙️</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack ${
                  selectedPersona === "contributor" ? "bg-brandPink text-white" : "bg-neutral-100 text-brandBlack"
                }`}>
                  {selectedPersona === "contributor" ? "✓ ACTIVE MODE" : "CONTRIBUTE"}
                </span>
              </div>
              <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">
                Oral Lore Contributor
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-6">
                Contribute community oral heritage, local folk tales, ritual songs, and dialect proverbs from your regional community.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-brandBlack/15 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setContributionModalOpen(true);
                }}
                className="w-full text-center py-2 bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                ↗ Submit Folklore
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setVoiceLabOpen(true);
                }}
                className="w-full text-center py-1.5 bg-brandYellow hover:bg-white text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                🎙 Test ML Voice Engine
              </button>
            </div>
          </div>

          {/* Card 4: Universal Accessible Reader */}
          <div
            onClick={() => {
              Soundtrack.playClick();
              setSelectedPersona("inclusive");
              showToast("Switched to Universal Accessible Mode");
            }}
            className={`border-2 border-brandBlack rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-[6px_6px_0px_#080808] ${
              selectedPersona === "inclusive"
                ? "bg-white ring-4 ring-brandPink -translate-y-1"
                : "bg-white/80 hover:bg-white hover:-translate-y-0.5"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">♿</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack ${
                  selectedPersona === "inclusive" ? "bg-brandPink text-white" : "bg-neutral-100 text-brandBlack"
                }`}>
                  {selectedPersona === "inclusive" ? "✓ ACTIVE MODE" : "WCAG 2.1 AAA"}
                </span>
              </div>
              <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">
                Accessible for All
              </h3>
              <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-6">
                Full accessibility suite with font scaling, 4 high-contrast color palettes, relaxed line height, and reduced motion.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-brandBlack/15 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playModalPop();
                  setA11yModalOpen(true);
                }}
                className="w-full text-center py-2 bg-brandYellow hover:bg-brandPink hover:text-white text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                ⚙️ Accessibility Center
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  Soundtrack.playClick();
                  const newMode = accessibilitySettings.contrastMode === "high-contrast" ? "normal" : "high-contrast";
                  setAccessibilitySettings({ ...accessibilitySettings, contrastMode: newMode });
                  showToast(`Contrast mode: ${newMode}`);
                }}
                className="w-full text-center py-1.5 bg-white hover:bg-brandYellow text-brandBlack border-2 border-brandBlack rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808]"
              >
                🌓 Toggle High Contrast
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 2: CULTURAL ARCHIVE & MANIFESTO */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-20 lg:py-28 relative"
        data-purpose="cultural-introduction"
        id="our-mission"
      >
        <div className="flex items-center justify-between border-b-2 border-brandBlack pb-4 mb-12">
          <div className="flex items-center gap-3 font-mono text-xs md:text-sm font-black tracking-wider text-brandBlack">
            <span className="bg-brandPink text-white px-3 py-1 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
              [ 01 / CULTURAL ARCHIVE ]
            </span>
            <span>MANIFESTO &amp; REGIONAL ROOTS</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold text-brandBlack bg-white px-3 py-1 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
            <span>REF // KBR-2025</span>
            <span className="text-brandPink">✦</span>
            <span>BHARAT FOLKLORE INITIATIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 bg-brandPink text-white border-2 border-brandBlack px-3.5 py-1 text-xs font-mono font-black w-fit mb-6 shadow-[3px_3px_0px_#080808]">
                <span>✦</span> PRESERVING ORAL TRADITIONS WITH MEANING
              </div>
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-black text-brandBlack leading-[1.05] tracking-tight mb-8">
                EVERY CULTURE <br />
                <span className="relative inline-block text-brandPink bg-white px-2 py-0.5 border-2 border-brandBlack shadow-[4px_4px_0px_#080808] rotate-[-1deg]">
                  HAS A STORY.
                </span>
                <br />
                AND EVERY STORY DESERVES CONTEXT.
              </h2>
              <p className="text-brandBlack text-lg sm:text-xl font-bold leading-relaxed max-w-xl mb-6">
                When folklore crosses boundaries, automated machine tools strip out centuries of nuanced humor, ritual reverence, and regional idioms. KathaBridge bridges that gap through curated, verified, and accessible digital archives of living traditions.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-2 bg-white border-2 border-brandBlack px-4 py-2 rounded-full text-xs font-black shadow-[3px_3px_0px_#080808]">
                  <span className="w-3 h-3 rounded-full bg-brandPink border border-brandBlack"></span> Dialect Integrity
                </span>
                <span className="inline-flex items-center gap-2 bg-brandYellow border-2 border-brandBlack px-4 py-2 rounded-full text-xs font-black shadow-[3px_3px_0px_#080808]">
                  <span className="w-3 h-3 rounded-full bg-brandBlack"></span> Ritual Symbolism Decoded
                </span>
                <span className="inline-flex items-center gap-2 bg-white border-2 border-brandBlack px-4 py-2 rounded-full text-xs font-black shadow-[3px_3px_0px_#080808]">
                  <span className="w-3 h-3 rounded-full bg-brandPink border border-brandBlack"></span> Multilingual Transcriptions
                </span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="relative pb-10 pt-4">
              <div className="absolute -top-3 left-12 w-32 h-8 scrapbook-tape z-30 transform -rotate-3 border border-brandBlack"></div>

              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[1]); // Theyyam
                }}
                className="relative bg-white border-2 border-brandBlack p-4 rounded-2xl polaroid-tilt-1 transition hover:rotate-0 duration-200 z-10 shadow-[8px_8px_0px_#080808] cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-xl border-2 border-brandBlack bg-brandYellowWarm">
                  <img
                    alt="Living Oral Traditions - Traditional Veil and Folk Motifs"
                    className="w-full h-96 object-cover object-center"
                    src="/images/landing/asset_6.png"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-6">
                    <div>
                      <span className="bg-brandPink text-white font-mono text-[11px] font-black px-3 py-1 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
                        FOLK ARCHIVE // 01
                      </span>
                      <h3 className="text-white font-editorial text-3xl font-black mt-2 drop-shadow">
                        Living Oral Traditions
                      </h3>
                      <p className="text-white text-sm mt-1.5 font-bold line-clamp-2 max-w-md">
                        Over 22 constitutionally recognized languages and thousands of regional dialects shape living, breathing folklore.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 px-2 pb-1 flex items-center justify-between font-mono text-xs font-black text-brandBlack">
                  <span>ORIGIN: RAJASTHAN &amp; KERALA</span>
                  <span className="text-brandPink bg-brandYellow px-2 py-0.5 rounded border border-brandBlack">
                    ★ VERIFIED HERITAGE
                  </span>
                </div>
              </div>

              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[2]); // Panchatantra
                }}
                className="absolute -bottom-8 -left-6 sm:-left-8 w-72 sm:w-80 bg-brandYellow border-2 border-brandBlack p-3 rounded-xl polaroid-tilt-2 z-20 transition hover:scale-105 duration-200 shadow-[6px_6px_0px_#080808] cursor-pointer"
              >
                <div className="w-28 h-6 scrapbook-tape absolute -top-2 right-6 -rotate-6 z-10 border border-brandBlack"></div>
                <img
                  alt="Puppet Theatre Under Banyan Tree"
                  className="w-full h-44 object-cover rounded-lg border-2 border-brandBlack"
                  src="/images/landing/asset_8.png"
                />
                <div className="mt-2.5 px-1">
                  <span className="text-[10px] font-mono font-black bg-brandPink text-white px-2 py-0.5 rounded border border-brandBlack">
                    PUPPETRY &amp; MUSIC
                  </span>
                  <p className="text-xs text-brandBlack font-extrabold leading-tight mt-1">
                    Village banyan gatherings &amp; shadow play.
                  </p>
                </div>
              </div>

              <div className="absolute -top-5 -right-4 bg-brandPink text-white border-2 border-brandBlack px-4 py-1.5 text-xs font-mono font-black rotate-6 shadow-[4px_4px_0px_#080808] z-30">
                ✦ ORAL ROOTS
              </div>
              <div className="absolute top-1/2 -right-8 w-24 h-24 bg-brandYellow border-2 border-brandBlack rounded-full flex flex-col items-center justify-center p-2 text-center text-[10px] font-mono font-black -rotate-12 shadow-[4px_4px_0px_#080808] z-20 hidden md:flex border-dashed">
                <span className="text-sm font-black text-brandPink">100%</span>
                <span className="leading-none text-brandBlack">COMMUNITY CURATED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 3: STORY LIBRARY (Fully Searchable & Filterable) */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24"
        data-purpose="featured-stories"
        id="stories"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b-2 border-brandBlack pb-6 gap-4">
          <div>
            <div className="font-mono text-xs md:text-sm font-black text-brandPink tracking-widest mb-2 bg-brandBlack text-white inline-block px-2.5 py-0.5 rounded border border-brandBlack shadow-[2px_2px_0px_#FFFC00]">
              {t.storiesSection.badge}
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight">
              {t.storiesSection.heading}
            </h2>
          </div>

          {/* Quick Search & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.storiesSection.searchPlaceholder}
                className="bg-white border-2 border-brandBlack px-3.5 py-1.5 rounded-full font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brandPink shadow-[2px_2px_0px_#080808] w-48 sm:w-60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-[10px] font-mono font-black text-neutral-400"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => {
                Soundtrack.playClick();
                setSortBy(e.target.value as any);
              }}
              className="bg-white border-2 border-brandBlack px-3 py-1.5 rounded-full font-mono text-xs font-black shadow-[2px_2px_0px_#080808] focus:outline-none"
            >
              <option value="DEFAULT">{t.storiesSection.sortDefault}</option>
              <option value="DURATION">{t.storiesSection.sortShortest}</option>
              <option value="POPULAR">{t.storiesSection.sortPopular}</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10 pb-4 border-b border-brandBlack/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-black text-brandBlack mr-1">{t.storiesSection.languageLabel}</span>
            {[
              { id: "ALL", label: t.storiesSection.allLang },
              { id: "MALAYALAM", label: t.storiesSection.malayalamLang },
              { id: "SANSKRIT", label: t.storiesSection.sanskritLang },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => {
                  Soundtrack.playClick();
                  setSelectedLanguageFilter(lang.id);
                }}
                className={`border-2 border-brandBlack px-3.5 py-1 rounded-full text-xs font-black transition shadow-[2px_2px_0px_#080808] ${
                  selectedLanguageFilter === lang.id
                    ? "bg-brandPink text-white"
                    : "bg-white text-brandBlack hover:bg-brandYellow"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-neutral-700">SHOWING:</span>
            <span className="bg-brandYellow px-2 py-0.5 rounded border border-brandBlack font-black">
              {filteredStories.length} {t.storiesSection.showingStories}
            </span>
          </div>
        </div>

        {/* Story Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
          {filteredStories.map((story) => {
            const isFav = favorites.includes(story.id);

            return (
              <article
                key={story.id}
                className="bg-white border-2 border-brandBlack rounded-2xl overflow-hidden shadow-[7px_7px_0px_#080808] flex flex-col justify-between group hover:-translate-y-1 transition duration-200"
              >
                <div
                  className={`relative ${
                    story.id === "theyyam" ? "bg-brandPink" : "bg-brandYellow"
                  } border-b-2 border-brandBlack p-5 pt-7 overflow-hidden flex flex-col items-center`}
                >
                  <div
                    className={`w-28 h-6 ${
                      story.tapeColor === "pink" ? "scrapbook-tape" : "scrapbook-tape-yellow"
                    } absolute -top-1 ${story.id === "theyyam" ? "right-8 rotate-3" : "left-6 -rotate-2"} z-20 border border-brandBlack`}
                  ></div>

                  <div
                    className={`relative w-full h-72 sm:h-80 overflow-hidden rounded-xl border-2 border-brandBlack shadow-[5px_5px_0px_#080808] -rotate-1 group-hover:rotate-0 transition-transform duration-200 ${story.imageBg}`}
                  >
                    <img
                      alt={story.title.EN}
                      className="w-full h-full object-cover object-top"
                      src={story.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <span
                      className={`absolute bottom-3 left-3 text-[11px] font-mono font-black tracking-widest ${
                        story.id === "theyyam" ? "bg-brandYellow text-brandBlack" : "bg-brandPink text-white"
                      } px-2.5 py-1 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]`}
                    >
                      {story.pillTag}
                    </span>
                  </div>

                  {/* Top Badges & Favorite Star */}
                  <div className="absolute top-3 right-4 flex items-center gap-1.5 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(story.id);
                      }}
                      title="Save to favorites"
                      className={`w-8 h-8 rounded-full border-2 border-brandBlack flex items-center justify-center text-sm font-black transition shadow-[2px_2px_0px_#080808] ${
                        isFav ? "bg-brandPink text-white" : "bg-white text-brandBlack hover:bg-brandYellow"
                      }`}
                    >
                      ★
                    </button>
                    <span className="bg-brandPink text-white text-[10px] font-mono font-black px-2.5 py-1 rounded border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
                      {story.originalLanguage.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-brandPink font-black mb-1">
                      STORY // {story.number} • {story.categoryLabel}
                    </div>
                    <h3 className="font-editorial text-2xl font-black text-brandBlack mb-3 group-hover:text-brandPink transition-colors">
                      {selectedLanguage === "ML" ? story.title.ML : story.title.EN}
                    </h3>
                    <p className="text-brandBlack text-sm font-semibold leading-relaxed mb-4">
                      {selectedLanguage === "ML" ? story.summary.ML : story.summary.EN}
                    </p>
                    <div className="bg-brandYellow p-3 rounded-lg border-2 border-brandBlack text-xs font-mono text-brandBlack shadow-[2px_2px_0px_#080808]">
                      <strong className="font-black">{t.storiesSection.keyConceptLabel}</strong>{" "}
                      <em>{story.keyConcept.quote}</em>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t-2 border-brandBlack flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-600 font-mono">
                      {story.readingDurationMinutes} {t.storiesSection.readTime}
                    </span>
                    <button
                      onClick={() => {
                        Soundtrack.playModalPop();
                        setActiveStoryReader(story);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black bg-brandPink text-white hover:bg-brandPinkDark border-2 border-brandBlack px-4 py-2 rounded-full transition shadow-[3px_3px_0px_#080808]"
                    >
                      <span>{t.storiesSection.readStory}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 4: EXPLORE THE VOICES OF INDIA (Categories Grid) */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24"
        data-purpose="explore-cultures"
        id="explore"
      >
        <div className="flex items-center justify-between border-b-2 border-brandBlack pb-4 mb-10">
          <div>
            <div className="font-mono text-xs md:text-sm font-black text-white bg-brandPink px-3 py-0.5 rounded border border-brandBlack inline-block tracking-widest shadow-[2px_2px_0px_#080808]">
              {t.categoriesSection.badge}
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight mt-2">
              {t.categoriesSection.heading}
            </h2>
          </div>
          <div className="hidden md:block font-mono text-xs font-black text-brandBlack bg-white border-2 border-brandBlack px-3.5 py-1.5 rounded-lg shadow-[3px_3px_0px_#080808]">
            {t.categoriesSection.totalArchived} {t.categoriesSection.modesCount}
          </div>
        </div>

        {/* 6 Illustrated Grid Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "folk-tales",
              tag: "01 • ORAL ANTHOLOGY",
              title: t.categoriesSection.folkLoreTitle,
              desc: t.categoriesSection.folkLoreDesc,
              stat: "140+ TALES",
              icon: "📖",
              image:
                "/images/landing/asset_5.png",
              subTag: "ORAL ANTHOLOGY",
              tape: "right",
            },
            {
              id: "classical-lit",
              tag: "02 • POETRY & PROSE",
              title: t.categoriesSection.classicalTitle,
              desc: t.categoriesSection.classicalDesc,
              stat: "85+ MANUSCRIPTS",
              icon: "📜",
              image:
                "/images/landing/asset_4.png",
              subTag: "POETRY & PROSE",
              tape: "left",
            },
            {
              id: "performances",
              tag: "03 • LIVING THEATRE",
              title: t.categoriesSection.theatreTitle,
              desc: t.categoriesSection.theatreDesc,
              stat: "62+ DOCUMENTED ACTS",
              icon: "🎭",
              image:
                "/images/stories/koodiyattam.png",
              subTag: "LIVING THEATRE",
              tape: "right-yellow",
            },
            {
              id: "regional-art",
              tag: "04 • VISUAL LANGUAGE",
              title: t.categoriesSection.craftsTitle,
              desc: t.categoriesSection.craftsDesc,
              stat: "95+ ART ESSAYS",
              icon: "🎨",
              image:
                "/images/landing/asset_1.png",
              subTag: "VISUAL LANGUAGE",
              tape: "left",
            },
            {
              id: "music-traditions",
              tag: "05 • SOUND & RHYTHM",
              title: t.categoriesSection.balladsTitle,
              desc: t.categoriesSection.balladsDesc,
              stat: "110+ AUDIO TRACKS",
              icon: "🪕",
              image:
                "/images/landing/asset_3.png",
              subTag: "SOUND & RHYTHM",
              tape: "right",
            },
            {
              id: "festivals",
              tag: "06 • LIVING CALENDAR",
              title: "Festivals & Heritage",
              desc: "Seasonal transitions, harvest alignments, boat races, and sacred grove rituals decoded beyond tourist spectacle into deep reverence.",
              stat: "50+ CELEBRATIONS",
              icon: "🏮",
              image:
                "/images/landing/asset_12.png",
              subTag: "LIVING CALENDAR",
              tape: "left-yellow",
            },
          ].map((cat) => (
            <div
              key={cat.id}
              className="bg-white border-2 border-brandBlack rounded-2xl shadow-[6px_6px_0px_#080808] hover:-translate-y-1 transition duration-150 flex flex-col justify-between group relative overflow-hidden"
            >
              <div
                className={`w-20 h-5 ${
                  cat.tape.includes("yellow") ? "scrapbook-tape-yellow" : "scrapbook-tape"
                } absolute -top-1 ${cat.tape.includes("left") ? "left-8 -rotate-2" : "right-6 rotate-3"} z-10 border border-brandBlack`}
              ></div>

              <div
                className={`relative w-full h-44 overflow-hidden border-b-2 border-brandBlack ${
                  cat.id === "festivals"
                    ? "bg-brandBlack"
                    : cat.id === "performances"
                    ? "bg-brandPink"
                    : "bg-brandYellow"
                }`}
              >
                <img
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  src={cat.image}
                />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-brandYellow border-2 border-brandBlack flex items-center justify-center text-xl shadow-[2px_2px_0px_#080808]">
                    {cat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-black bg-brandPink text-white px-2 py-0.5 rounded border border-brandBlack uppercase shadow-[1px_1px_0px_#080808]">
                    {cat.subTag}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[11px] text-brandPink font-black uppercase tracking-wider mb-1">
                    {cat.tag}
                  </div>
                  <h3 className="font-editorial text-2xl font-black text-brandBlack mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-brandBlack font-semibold text-sm leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-mono font-black text-brandBlack pt-3 border-t-2 border-brandBlack">
                  <span className="bg-brandYellow px-2 py-0.5 rounded border border-brandBlack">
                    {cat.stat}
                  </span>
                  <a
                    href="#stories"
                    onClick={() => {
                      Soundtrack.playClick();
                      if (cat.id === "folk-tales") setSelectedCategory("FOLK_TALES");
                      else if (cat.id === "classical-lit") setSelectedCategory("CLASSICAL_LIT");
                      else if (cat.id === "performances") setSelectedCategory("PERFORMANCES");
                      else setSelectedCategory("ALL");
                    }}
                    className="text-brandPink group-hover:translate-x-1 transition-transform"
                  >
                    EXPLORE →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 5: SIGNATURE FEATURE ("MEANING BEHIND THE WORDS.") */}
      {/* =================================================================== */}
      <section className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24" data-purpose="meaning-behind-words">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block bg-brandPink text-white text-xs font-mono font-black px-4 py-1.5 rounded-full mb-3 border-2 border-brandBlack shadow-[3px_3px_0px_#080808]">
            {t.meaningSection.badge}
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight">
            {t.meaningSection.heading}
          </h2>
          <p className="text-brandBlack text-base sm:text-lg font-bold mt-3">
            {t.meaningSection.subtext}
          </p>
        </div>

        {/* Interactive 3-Column Comparative Breakdown */}
        <div className="bg-white border-2 border-brandBlack rounded-2xl shadow-[9px_9px_0px_#080808] overflow-hidden">
          {/* Comparative Header Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-b-2 border-brandBlack bg-brandYellow font-mono font-black text-xs uppercase tracking-wider divide-y-2 md:divide-y-0 md:divide-x-2 divide-brandBlack">
            <div className="p-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brandPink border border-brandBlack"></span>
              <span>01. ORIGINAL EXPRESSION (MALAYALAM)</span>
            </div>
            <div className="p-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brandBlack"></span>
              <span>02. CONTEXTUAL TRANSLATION (ENGLISH)</span>
            </div>
            <div className="p-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brandPink border border-brandBlack"></span>
              <span>03. CULTURAL MEANING &amp; SUBTEXT</span>
            </div>
          </div>

          {/* Row 1: Kakka kulichal kokkavumo */}
          <div
            onClick={() => {
              Soundtrack.playModalPop();
              setActiveTermPopover(mockCulturalExpressions[0]);
            }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-brandBlack border-b-2 border-brandBlack hover:bg-brandYellowLight transition-colors cursor-pointer group"
          >
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <span className="text-xs font-mono text-brandPink font-black mb-2 flex items-center gap-1.5">
                <span>MALAYALAM IDIOM // REGION: VALLUVANAD</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-brandBlack">CLICK 🔊</span>
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-brandBlack font-sans leading-tight group-hover:text-brandPink transition-colors">
                "{mockCulturalExpressions[0].originalScript}"
              </div>
              <div className="text-xs font-mono text-neutral-700 mt-2 font-bold">
                Transliteration: <em>{mockCulturalExpressions[0].transliteration}</em>
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="text-xs font-mono text-neutral-500 font-black mb-2">LITERAL VS CONTEXTUAL</div>
              <p className="text-brandBlack font-black text-lg mb-1">
                "{mockCulturalExpressions[0].literalTranslation}"
              </p>
              <p className="text-neutral-700 text-sm font-semibold">
                Idiomatic English equivalent: <em>A leopard cannot change its spots.</em>
              </p>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center bg-brandYellow/30">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-brandPink mb-2 bg-white px-2 py-0.5 rounded border border-brandBlack w-fit shadow-[1px_1px_0px_#080808]">
                <span>✓</span> HUMAN VERIFIED CONTEXT
              </div>
              <p className="text-brandBlack text-sm leading-relaxed font-bold">
                {mockCulturalExpressions[0].culturalSignificance}
              </p>
            </div>
          </div>

          {/* Row 2: Theeyil pirannaval */}
          <div
            onClick={() => {
              Soundtrack.playModalPop();
              setActiveTermPopover(mockCulturalExpressions[1]);
            }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-brandBlack hover:bg-brandYellowLight transition-colors cursor-pointer group"
          >
            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <span className="text-xs font-mono text-brandPink font-black mb-2 flex items-center gap-1.5">
                <span>PERFORMANCE DIALOGUE // THEYYAM CHANT</span>
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-brandBlack">CLICK 🔊</span>
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-brandBlack font-sans leading-tight group-hover:text-brandPink transition-colors">
                "{mockCulturalExpressions[1].originalScript}"
              </div>
              <div className="text-xs font-mono text-neutral-700 mt-2 font-bold">
                Transliteration: <em>{mockCulturalExpressions[1].transliteration}</em>
              </div>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center">
              <div className="text-xs font-mono text-neutral-500 font-black mb-2">LITERAL VS CONTEXTUAL</div>
              <p className="text-brandBlack font-black text-lg mb-1">
                "{mockCulturalExpressions[1].literalTranslation}"
              </p>
              <p className="text-neutral-700 text-sm font-semibold">
                Spoken during nocturnal entry of the Muchilot Bhagavathi performer stepping over glowing embers.
              </p>
            </div>

            <div className="p-6 lg:p-8 flex flex-col justify-center bg-brandYellow/30">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-brandPink mb-2 bg-white px-2 py-0.5 rounded border border-brandBlack w-fit shadow-[1px_1px_0px_#080808]">
                <span>✓</span> HUMAN VERIFIED CONTEXT
              </div>
              <p className="text-brandBlack text-sm leading-relaxed font-bold">
                {mockCulturalExpressions[1].culturalSignificance}
              </p>
            </div>
          </div>
        </div>

        {/* Explore Full Glossary CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              Soundtrack.playModalPop();
              setGlossaryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-brandYellow hover:bg-white text-brandBlack border-2 border-brandBlack px-7 py-3 rounded-full font-mono text-xs font-black shadow-[4px_4px_0px_#080808] transition"
          >
            <span>📖</span>
            <span>{t.meaningSection.exploreGlossaryBtn} ({mockCulturalExpressions.length})</span>
          </button>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 6: UNIVERSAL DESIGN ACCESSIBILITY */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24"
        data-purpose="accessibility-features"
        id="about"
      >
        <div className="bg-white border-2 border-brandBlack rounded-3xl p-8 sm:p-12 lg:p-16 shadow-[10px_10px_0px_#080808] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 pointer-events-none">
            <svg className="w-44 h-44 text-brandYellow fill-current opacity-90" viewBox="0 0 100 100">
              <polygon points="50,0 60,35 100,50 60,65 50,100 40,65 0,50 40,35"></polygon>
            </svg>
          </div>

          <div className="max-w-3xl mb-12 relative z-10">
            <div className="font-mono text-xs md:text-sm font-black text-white bg-brandPink px-3 py-1 rounded-full border-2 border-brandBlack inline-block tracking-widest mb-2 shadow-[2px_2px_0px_#080808]">
              [ 05 / UNIVERSAL DESIGN ]
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight">
              STORIES FOR EVERYONE.
            </h2>
            <p className="text-brandBlack text-base sm:text-lg font-bold mt-3">
              Folklore belongs to every human being regardless of eyesight, hearing capability, literacy level, or assistive device choice.
            </p>
          </div>

          {/* 4 Feature Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div
              onClick={() => {
                Soundtrack.playModalPop();
                setA11yModalOpen(true);
              }}
              className="bg-brandYellow border-2 border-brandBlack p-6 rounded-2xl shadow-[5px_5px_0px_#080808] flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl mb-4 shadow-[2px_2px_0px_#080808]">
                  📝
                </div>
                <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">Read Along</h3>
                <p className="text-brandBlack font-semibold text-sm leading-relaxed">
                  Synchronized karaoke-style subtitles highlight sentence by sentence in both regional scripts and Latin alphabets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-brandBlack font-mono text-xs text-brandBlack font-black flex items-center justify-between">
                <span>WCAG 2.1 AAA CAPTIONS</span>
                <span>⚙</span>
              </div>
            </div>

            <div
              onClick={toggleIntroAudio}
              className="bg-brandYellow border-2 border-brandBlack p-6 rounded-2xl shadow-[5px_5px_0px_#080808] flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl mb-4 shadow-[2px_2px_0px_#080808]">
                  🎧
                </div>
                <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">Listen &amp; Experience</h3>
                <p className="text-brandBlack font-semibold text-sm leading-relaxed">
                  Full dramatized regional vocal narrations, ambient ritual background soundscapes, and voice-speed control options.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-brandBlack font-mono text-xs text-brandBlack font-black flex items-center justify-between">
                <span>IMMERSIVE AUDIO</span>
                <span>▶</span>
              </div>
            </div>

            <div
              onClick={() => {
                Soundtrack.playModalPop();
                setA11yModalOpen(true);
              }}
              className="bg-brandYellow border-2 border-brandBlack p-6 rounded-2xl shadow-[5px_5px_0px_#080808] flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl mb-4 shadow-[2px_2px_0px_#080808]">
                  👁️
                </div>
                <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">Accessible Reading</h3>
                <p className="text-brandBlack font-semibold text-sm leading-relaxed">
                  Instantly adjust font sizes, swap to OpenDyslexic typography, and toggle pure high-contrast monochrome themes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-brandBlack font-mono text-xs text-brandBlack font-black flex items-center justify-between">
                <span>HIGH CONTRAST &amp; SCALING</span>
                <span>⚙</span>
              </div>
            </div>

            <div
              onClick={() => {
                Soundtrack.playModalPop();
                setA11yModalOpen(true);
              }}
              className="bg-brandYellow border-2 border-brandBlack p-6 rounded-2xl shadow-[5px_5px_0px_#080808] flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-xl mb-4 shadow-[2px_2px_0px_#080808]">
                  ⌨️
                </div>
                <h3 className="font-editorial text-xl font-black text-brandBlack mb-2">Inclusive Navigation</h3>
                <p className="text-brandBlack font-semibold text-sm leading-relaxed">
                  Engineered from ground up with complete keyboard navigation, aria-live announce regions, and screen-reader tags.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-brandBlack font-mono text-xs text-brandBlack font-black flex items-center justify-between">
                <span>FULL KEYBOARD SHORTCUTS</span>
                <span>⚙</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 7: HUMAN REVIEW SYSTEM */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24"
        data-purpose="human-review-system"
        id="contribute"
      >
        <div className="flex items-center justify-between border-b-2 border-brandBlack pb-4 mb-12">
          <div>
            <div className="font-mono text-xs md:text-sm font-black text-white bg-brandPink px-3 py-0.5 rounded border border-brandBlack inline-block tracking-widest shadow-[2px_2px_0px_#080808]">
              [ 06 / METHODOLOGY ]
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-brandBlack tracking-tight mt-2">
              TECHNOLOGY TRANSLATES.<br className="hidden sm:inline" /> PEOPLE PRESERVE MEANING.
            </h2>
          </div>
          <button
            onClick={() => {
              Soundtrack.playModalPop();
              setReviewerModalOpen(true);
            }}
            className="hidden lg:flex items-center gap-2 bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack px-4 py-2 font-mono text-xs font-black shadow-[3px_3px_0px_#080808] transition"
          >
            <span>⚙ OPEN REVIEWER WORKSTATION</span>
          </button>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 relative">
          <div className="bg-white border-2 border-brandBlack p-5 rounded-xl shadow-[5px_5px_0px_#080808] relative">
            <div className="font-mono text-[11px] font-black text-brandPink mb-1">STAGE 01</div>
            <div className="font-editorial text-lg font-black text-brandBlack mb-2">Original Cultural Text</div>
            <p className="text-xs text-neutral-800 font-bold leading-relaxed">
              Native audio recordings, handwritten palm-leaf scrolls, or regional community publications transcribed.
            </p>
            <div className="mt-3 text-[10px] font-mono bg-brandYellow text-brandBlack font-black px-2 py-1 rounded border border-brandBlack">
              INPUT: RAW DIALECT
            </div>
          </div>

          <div className="bg-white border-2 border-brandBlack p-5 rounded-xl shadow-[5px_5px_0px_#080808] relative">
            <div className="font-mono text-[11px] font-black text-brandPink mb-1">STAGE 02</div>
            <div className="font-editorial text-lg font-black text-brandBlack mb-2">AI Initial Draft</div>
            <p className="text-xs text-neutral-800 font-bold leading-relaxed">
              High-throughput multi-lingual neural language model produces first-pass literal vocabulary translation.
            </p>
            <div className="mt-3 text-[10px] font-mono bg-brandYellow text-brandBlack font-black px-2 py-1 rounded border border-brandBlack">
              PROCESS: BASELINE SYNTAX
            </div>
          </div>

          {/* Step 3 (Highlighted) */}
          <div className="bg-brandPink text-white border-2 border-brandBlack p-5 rounded-xl shadow-[6px_6px_0px_#080808] relative">
            <div className="absolute -top-3 right-3 bg-brandYellow text-brandBlack text-[10px] font-mono font-black px-2.5 py-0.5 rounded border border-brandBlack shadow-[2px_2px_0px_#080808]">
              CRUCIAL STEP
            </div>
            <div className="font-mono text-[11px] font-black text-brandYellow mb-1">STAGE 03</div>
            <div className="font-editorial text-lg font-black text-white mb-2">Scholar Peer-Review</div>
            <p className="text-xs text-white/95 leading-relaxed font-bold">
              Folklorists, native speakers, and anthropology scholars correct nuances, humor, idioms, and rituals.
            </p>
            <div className="mt-3 text-[10px] font-mono bg-brandYellow text-brandBlack px-2 py-1 rounded border border-brandBlack font-black">
              HUMAN VALIDATION 100%
            </div>
          </div>

          <div className="bg-white border-2 border-brandBlack p-5 rounded-xl shadow-[5px_5px_0px_#080808] relative">
            <div className="font-mono text-[11px] font-black text-brandPink mb-1">STAGE 04</div>
            <div className="font-editorial text-lg font-black text-brandBlack mb-2">Verified &amp; Published</div>
            <p className="text-xs text-neutral-800 font-bold leading-relaxed">
              Story cataloged into KathaBridge with audio narration, glossaries, and regional credits publicly preserved.
            </p>
            <div className="mt-3 text-[10px] font-mono bg-brandYellow text-brandBlack px-2 py-1 rounded border border-brandBlack font-black">
              STATUS: IMMUTABLE ARCHIVE
            </div>
          </div>
        </div>

        {/* Reviewer Badge Card */}
        <div className="bg-white border-2 border-brandBlack p-6 sm:p-8 rounded-2xl shadow-[7px_7px_0px_#080808] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center font-black text-xl shrink-0 shadow-[3px_3px_0px_#080808]">
              AN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial font-black text-lg text-brandBlack">Dr. Ananya Nair</span>
                <span className="bg-brandYellow text-brandBlack text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full border border-brandBlack flex items-center gap-1 shadow-[1px_1px_0px_#080808]">
                  <span>✓</span> VERIFIED SCHOLAR
                </span>
              </div>
              <div className="text-xs font-mono text-neutral-700 mt-0.5 font-bold">
                Senior Folklorist • Kerala Folklore Society &amp; Calicut Heritage Circle
              </div>
              <p className="text-brandBlack text-xs mt-2 italic font-semibold">
                "Verified 14 North Kerala ritual chants, correcting 8 idioms where standard AI misidentified ritual offering terms as domestic cooking items."
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setContributionModalOpen(true);
              }}
              className="px-6 py-3 rounded-full border-2 border-brandBlack bg-brandYellow hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808]"
            >
              BECOME A CONTRIBUTOR →
            </button>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setReviewerModalOpen(true);
              }}
              className="px-5 py-3 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808] md:hidden"
            >
              REVIEW QUEUE →
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 8: FINAL CALL-TO-ACTION */}
      {/* =================================================================== */}
      <section
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 py-16 lg:py-24"
        data-purpose="final-call-to-action"
        id="explore-stories"
      >
        <div className="bg-brandPink text-white border-2 border-brandBlack rounded-3xl p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-[12px_12px_0px_#080808]">
          <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-25">
            <svg
              className="w-96 h-96 text-brandYellow fill-current animate-spin"
              style={{ animationDuration: "40s" }}
              viewBox="0 0 200 200"
            >
              <polygon points="100,0 120,70 190,40 145,95 200,100 145,105 190,160 120,130 100,200 80,130 10,160 55,105 0,100 55,95 10,40 80,70"></polygon>
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-10">
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-brandYellow text-brandBlack text-xs font-mono font-black px-3.5 py-1 rounded-full mb-6 border-2 border-brandBlack w-fit shadow-[2px_2px_0px_#080808]">
                <span>✦</span> {t.communitySection.badge}
              </div>
              <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.0] tracking-tight mb-6">
                {t.communitySection.heading}
              </h2>
              <p className="text-white text-lg sm:text-xl font-bold max-w-xl leading-relaxed mb-10">
                {t.communitySection.subtext}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  className="inline-flex items-center gap-3 bg-brandYellow hover:bg-white text-brandBlack border-2 border-brandBlack px-8 py-4 rounded-full font-black text-base transition-all duration-200 transform hover:-translate-y-1 shadow-[5px_5px_0px_#080808]"
                  href="#stories"
                  onClick={() => Soundtrack.playClick()}
                >
                  <span>{t.hero.exploreBtn}</span>
                  <span className="text-xl">→</span>
                </a>
                <button
                  onClick={() => {
                    Soundtrack.playModalPop();
                    setContributionModalOpen(true);
                  }}
                  className="inline-flex items-center gap-3 bg-brandBlack hover:bg-neutral-900 text-white border-2 border-brandBlack px-8 py-4 rounded-full font-black text-base transition-all duration-200 shadow-[5px_5px_0px_#FFFC00]"
                >
                  <span>{t.communitySection.submitStoryBtn}</span>
                </button>
              </div>
            </div>

            <div className="relative flex justify-center items-center w-full">
              <div className="w-36 h-7 scrapbook-tape-yellow absolute -top-3 right-12 rotate-3 z-30"></div>
              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[0]);
                }}
                className="relative bg-white p-4 rounded-2xl border-2 border-brandBlack polaroid-tilt-2 shadow-[12px_12px_0px_#080808] w-full max-w-lg cursor-pointer"
              >
                <img
                  alt="Incredible India Cultural Folk Heritage Collage"
                  className="w-full h-96 sm:h-[420px] object-cover rounded-xl border-2 border-brandBlack"
                  src="/images/landing/asset_1.png"
                />
                <div className="mt-3.5 px-2 flex items-center justify-between font-mono text-xs font-black text-brandBlack">
                  <span className="bg-brandYellow px-2.5 py-1 rounded border border-brandBlack shadow-[1px_1px_0px_#080808]">
                    COMMUNITY REPOSITORY
                  </span>
                  <span className="text-brandPink">KATHABRIDGE ARCHIVE</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-brandYellow text-brandBlack border-2 border-brandBlack px-5 py-2.5 rounded-xl text-xs font-mono font-black -rotate-6 shadow-[5px_5px_0px_#080808] z-20 hidden sm:block">
                ★ 100% PRESERVED HERITAGE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SECTION 9: EDITORIAL FOOTER */}
      {/* =================================================================== */}
      <footer className="w-full bg-brandBlack text-white pt-16 border-t-2 border-brandBlack z-20" data-purpose="editorial-footer">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
            {/* Col 1: Brand Info */}
            <div className="md:col-span-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-black tracking-tight text-white font-sans">KathaBridge</span>
                  <svg className="w-5 h-5 text-brandPink fill-current" viewBox="0 0 24 24">
                    <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"></path>
                  </svg>
                </div>
                <p className="text-[10px] tracking-[0.25em] font-black text-brandYellow uppercase mb-4">
                  {t.nav.tagline}
                </p>
                <p className="text-neutral-300 text-sm leading-relaxed max-w-sm mb-6 font-sans font-medium">
                  {t.footer.tagline}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-brandYellow animate-ping"></span>
                <span className="text-xs font-mono text-brandYellow font-bold">ARCHIVE SYSTEMS ONLINE • v2.4</span>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div className="md:col-span-2">
              <div className="font-mono text-xs font-black text-brandYellow uppercase tracking-wider mb-4">{t.footer.navigationHeader}</div>
              <ul className="space-y-2.5 text-sm text-neutral-300 font-sans font-semibold">
                <li><a onClick={() => Soundtrack.playClick()} className="hover:text-brandPink transition-colors" href="#home">{t.nav.home}</a></li>
                <li><a onClick={() => Soundtrack.playClick()} className="hover:text-brandPink transition-colors" href="#stories">{t.nav.stories}</a></li>
                <li><a onClick={() => Soundtrack.playClick()} className="hover:text-brandPink transition-colors" href="#explore">{t.nav.explore}</a></li>
                <li><a onClick={() => Soundtrack.playClick()} className="hover:text-brandPink transition-colors" href="#about">{t.nav.about}</a></li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setContributionModalOpen(true);
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    {t.nav.contribute}
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Ethics & Access */}
            <div className="md:col-span-3">
              <div className="font-mono text-xs font-black text-brandYellow uppercase tracking-wider mb-4">ETHICS &amp; ACCESS</div>
              <ul className="space-y-2.5 text-sm text-neutral-300 font-sans font-semibold">
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("WCAG");
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    WCAG 2.1 Statement
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("INDIGENOUS_RIGHTS");
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    Indigenous Oral Rights
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("RESEARCH_SOURCES");
                    }}
                    className="hover:text-brandPink transition-colors text-left flex items-center gap-1.5 font-bold"
                  >
                    <span>📚</span> Research Sources (7)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("SCHOLAR_ATTRIBUTION");
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    Scholar Attribution Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("PRIVACY");
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    Privacy &amp; Open Access
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      Soundtrack.playModalPop();
                      setActivePolicyModal("CONTACT");
                    }}
                    className="hover:text-brandPink transition-colors text-left"
                  >
                    Contact Curators
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter */}
            <div className="md:col-span-3">
              <div className="font-mono text-xs font-black text-brandYellow uppercase tracking-wider mb-4">{t.newsletter.badge}</div>
              <p className="text-neutral-300 text-xs leading-relaxed mb-4 font-semibold">
                {t.newsletter.subtext}
              </p>
              <form className="space-y-2" onSubmit={handleNewsletterSubmit}>
                <input
                  className="w-full bg-neutral-900 border-2 border-neutral-700 text-white px-3.5 py-2.5 rounded-lg text-xs font-mono focus:border-brandYellow focus:ring-1 focus:ring-brandYellow outline-none"
                  placeholder={t.newsletter.placeholder}
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button
                  className="w-full bg-brandPink hover:bg-brandPinkDark text-white py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition border-2 border-brandBlack shadow-[2px_2px_0px_#FFFC00]"
                  type="submit"
                >
                  {t.newsletter.subscribeBtn}
                </button>
              </form>
            </div>
          </div>

          {/* Sub-footer credits */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 font-mono gap-4 font-bold">
            <div>
              {t.footer.copyright}
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActivePolicyModal("CONTACT");
                }}
                className="hover:text-brandYellow transition"
              >
                CURATORIAL OFFICE
              </button>
              <button
                onClick={() => {
                  Soundtrack.playModalPop();
                  setReviewerModalOpen(true);
                }}
                className="hover:text-brandPink transition"
              >
                REVIEWER PORTAL
              </button>
              <span className="hover:text-brandYellow transition cursor-pointer">OPEN REPO</span>
            </div>
          </div>
        </div>

        {/* Repeating Bottom Ticker Ribbon Strip */}
        <div
          className="w-full bg-brandPink text-brandYellow overflow-hidden py-3 border-t-2 border-brandBlack"
          data-purpose="footer-marquee"
        >
          <div className="animate-marquee select-none font-bold text-base sm:text-lg items-center tracking-wider pixel-marquee">
            <div className="flex items-center gap-6 shrink-0">
              <span className="text-white font-extrabold">KATHABRIDGE</span>
              <span className="text-brandYellow text-base">✦</span>
              <span className="text-brandYellow font-extrabold">STORIES BEYOND LANGUAGE</span>
              <span className="text-white text-base">✦</span>
              <span className="text-white font-extrabold">PRESERVING ORAL TRADITION</span>
              <span className="text-brandYellow text-base">✦</span>
              <span className="text-white font-extrabold">KATHABRIDGE</span>
              <span className="text-brandYellow text-base">✦</span>
            </div>
            <div aria-hidden="true" className="flex items-center gap-6 shrink-0 ml-6">
              <span className="text-white font-extrabold">KATHABRIDGE</span>
              <span className="text-brandYellow text-base">✦</span>
              <span className="text-brandYellow font-extrabold">STORIES BEYOND LANGUAGE</span>
              <span className="text-white text-base">✦</span>
              <span className="text-white font-extrabold">PRESERVING ORAL TRADITION</span>
              <span className="text-brandYellow text-base">✦</span>
              <span className="text-white font-extrabold">KATHABRIDGE</span>
              <span className="text-brandYellow text-base">✦</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* MODALS AND PANELS */}
      {/* =================================================================== */}

      {/* 1. Immersive Story Reader Modal */}
      {activeStoryReader && (
        <StoryReaderModal
          story={activeStoryReader}
          initialLanguage={selectedLanguage === "ML" ? "ML" : "EN"}
          onClose={() => {
            Soundtrack.playClick();
            setActiveStoryReader(null);
          }}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={favorites.includes(activeStoryReader.id)}
        />
      )}

      {/* 2. Cultural Term Popover */}
      {activeTermPopover && (
        <CulturalTermPopover
          expression={activeTermPopover}
          onClose={() => {
            Soundtrack.playClick();
            setActiveTermPopover(null);
          }}
        />
      )}

      {/* 3. Cultural Glossary Explorer Modal */}
      {glossaryModalOpen && (
        <GlossaryModal
          onClose={() => {
            Soundtrack.playClick();
            setGlossaryModalOpen(false);
          }}
          onSelectExpression={(exp) => setActiveTermPopover(exp)}
        />
      )}

      {/* 4. Accessibility Center Modal */}
      {a11yModalOpen && (
        <AccessibilityModal
          settings={accessibilitySettings}
          onUpdate={(newSettings) => {
            setAccessibilitySettings(newSettings);
            StorageService.setAccessibility(newSettings);
          }}
          onClose={() => {
            Soundtrack.playClick();
            setA11yModalOpen(false);
          }}
        />
      )}

      {/* 5. Scholar Peer-Reviewer Workstation Dashboard */}
      {reviewerModalOpen && (
        <ReviewerDashboardModal
          onClose={() => {
            Soundtrack.playClick();
            setReviewerModalOpen(false);
          }}
          onReviewUpdated={() => {
            showToast("Review queue updated in scholarly repository.");
          }}
        />
      )}

      {/* 6. Community Contribution Modal */}
      {contributionModalOpen && (
        <ContributionModal
          onClose={() => {
            Soundtrack.playClick();
            setContributionModalOpen(false);
          }}
          onSuccess={(trackingId) => {
            Soundtrack.playSuccessChime();
            setShowConfetti(true);
            showToast(`Contribution submitted! Queued for review under ID: ${trackingId}`);
          }}
        />
      )}

      {/* 7. Citizen Profile & Authentication Modal */}
      {authModalOpen && (
        <AuthModal
          currentUser={currentUser}
          onUserChange={(usr) => setCurrentUser(usr)}
          onClose={() => {
            Soundtrack.playClick();
            setAuthModalOpen(false);
          }}
          onSelectStory={(st) => {
            Soundtrack.playModalPop();
            setActiveStoryReader(st);
          }}
        />
      )}

      {/* 9. Malayalam Neural Voice Lab Modal */}
      {voiceLabOpen && (
        <MalayalamVoiceLabModal
          onClose={() => {
            Soundtrack.playClick();
            setVoiceLabOpen(false);
          }}
        />
      )}

      {/* 8. Contact & Policy Modals */}
      {activePolicyModal && (
        <ContactAndPolicyModals
          type={activePolicyModal}
          onClose={() => {
            Soundtrack.playClick();
            setActivePolicyModal(null);
          }}
        />
      )}
    </div>
  );
}
