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
import { IntroSplashAndAuth } from "./components/IntroSplashAndAuth";
import { ScrollFrameHero } from "./components/ScrollFrameHero";
import { ContactAndPolicyModals, PolicyType } from "./components/ContactAndPolicyModals";
import { CategoryShowcaseModal, CategoryData } from "./components/CategoryShowcaseModal";
import { CulturalGuideBotModal } from "./components/CulturalGuideBotModal";
import { HeritageMapModal } from "./components/HeritageMapModal";
import { OralTalaMetronomeModal } from "./components/OralTalaMetronomeModal";
import { HeritageVisionScannerModal } from "./components/HeritageVisionScannerModal";
import { speakSafely } from "./utils/malayalamPhonetics";
import { getUIText } from "./utils/translations";
import { subscribeToAuthChanges } from "./services/firebaseAuth";

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
  const [showIntroSplash, setShowIntroSplash] = useState(false);
  const [voiceLabOpen, setVoiceLabOpen] = useState(false);
  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType | null>(null);
  const [activeCategoryShowcase, setActiveCategoryShowcase] = useState<CategoryData | null>(null);
  const [guideBotOpen, setGuideBotOpen] = useState(false);
  const [heritageMapOpen, setHeritageMapOpen] = useState(false);
  const [talaMetronomeOpen, setTalaMetronomeOpen] = useState(false);
  const [visionScannerOpen, setVisionScannerOpen] = useState(false);

  // Celebratory Confetti & Sound
  const [showConfetti, setShowConfetti] = useState(false);

  // Story Library Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "DURATION" | "POPULAR">("DEFAULT");

  // Audio speech intro state
  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);

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

  // Listen to Real Firebase Auth State Changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
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

    if (accessibilitySettings.isDyslexiaFont) {
      document.body.classList.add("font-dyslexic");
    } else {
      document.body.classList.remove("font-dyslexic");
    }
  }, [accessibilitySettings]);

  // Global Accessibility & Power Keyboard Shortcuts (Escape to dismiss, Alt+A for A11y, Alt+G for Glossary, Alt+V for Voice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape") {
        setActiveStoryReader(null);
        setActiveTermPopover(null);
        setGlossaryModalOpen(false);
        setA11yModalOpen(false);
        setReviewerModalOpen(false);
        setContributionModalOpen(false);
        setAuthModalOpen(false);
        setVoiceLabOpen(false);
        setActivePolicyModal(null);
        setGuideBotOpen(false);
        setHeritageMapOpen(false);
        setTalaMetronomeOpen(false);
        setVisionScannerOpen(false);
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setVisionScannerOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setGuideBotOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setHeritageMapOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setTalaMetronomeOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setA11yModalOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setGlossaryModalOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        Soundtrack.playModalPop();
        setVoiceLabOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    const introTexts: Record<LanguageCode, string> = {
      EN: "Welcome to KathaBridge: Stories beyond language. Discover India's rich cultural stories, living ritual theatre, and regional folklore with deep contextual meaning.",
      ML: "കഥാബ്രിഡ്ജിലേക്ക് സ്വാഗതം. ഭാഷകൾക്കപ്പുറമുള്ള സാംസ്കാരിക കഥകളും നാടൻ കലകളും അവയുടെ തനതായ സന്ദർഭത്തോടെ മനസ്സിലാക്കാം.",
      SA: "कथाब्रीड्ज्-मञ्चे स्वागतम्। भाषाभ्यः परे सांस्कृतिककथाः, प्राचीननीतिबोधाः, अनुष्ठानपरम्पराश्च सार्थकरूपेण अन्विषन्तु।",
      HI: "कथाब्रिज में आपका स्वागत है। भाषा से परे सांस्कृतिक कहानियों, लोक गाथाओं और जीवंत नाट्य परंपराओं को उनके मूल संदर्भ के साथ अनुभव करें।",
      TA: "கதாபிரிட்ஜ் தளத்திற்கு அன்புடன் வரவேற்கிறோம். மொழிகளுக்கு அப்பாற்பட்ட வாய்மொழி வரலாறுகள் மற்றும் பாரம்பரிய கலாச்சாரக் கதைகளை ஆழமான பொருளுடன் கேட்டு மகிழுங்கள்."
    };

    const introAnnouncements: Record<LanguageCode, string> = {
      EN: "Playing KathaBridge audio introduction...",
      ML: "കഥാബ്രിഡ്ജ് ആമുഖ വിവരണം കേൾക്കുന്നു (Sobhana Neural)...",
      SA: "कथाब्रीड्ज्-प्रस्तावनां शृण्वन्ति (संस्कृत-वाचनम्)...",
      HI: "कथाब्रिज परिचय ऑडियो बज रहा है (स्वरा न्यूरल)...",
      TA: "கதாபிரிட்ஜ் அறிமுகக் குரல் ஒலிக்கிறது (வள்ளுவர் குரல்)..."
    };

    setIsIntroSpeaking(true);
    showToast(introAnnouncements[selectedLanguage] || introAnnouncements.EN);

    if ("speechSynthesis" in window) {
      speakSafely(window.speechSynthesis, introTexts[selectedLanguage] || introTexts.EN, selectedLanguage, {
        rate: selectedLanguage === "SA" ? 0.85 : 0.95,
        onEnd: () => setIsIntroSpeaking(false),
        onError: () => setIsIntroSpeaking(false)
      });
    } else {
      setIsIntroSpeaking(false);
    }
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
        (story.title.SA && story.title.SA.includes(searchQuery)) ||
        (story.title.HI && story.title.HI.includes(searchQuery)) ||
        story.summary.EN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.originRegion.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" ||
        story.category === selectedCategory ||
        (selectedCategory === "FOLK_TALES" && (story.category === "FOLK_TALES" || story.id === "mahabali" || story.id === "naranath" || story.id === "muthappan")) ||
        (selectedCategory === "CLASSICAL_LIT" && (story.category === "CLASSICAL_LIT" || story.id === "panchatantra")) ||
        (selectedCategory === "PERFORMANCES" && (story.category === "PERFORMANCES" || story.id === "theyyam" || story.id === "koodiyattam" || story.id === "muthappan")) ||
        (selectedCategory === "REGIONAL_ART" && (story.category === "REGIONAL_ART" || story.id === "koodiyattam" || story.id === "theyyam")) ||
        (selectedCategory === "MUSIC_ORAL" && (story.category === "MUSIC_ORAL" || story.id === "theyyam" || story.id === "mahabali")) ||
        (selectedCategory === "FESTIVALS" && (story.category === "FESTIVALS" || story.id === "mahabali" || story.id === "theyyam"));

      const matchesLang =
        selectedLanguageFilter === "ALL" ||
        (selectedLanguageFilter === "MALAYALAM" &&
          (story.availableLanguages.includes("ML") ||
            story.originalLanguage.toLowerCase().includes("malayalam"))) ||
        (selectedLanguageFilter === "SANSKRIT" &&
          (story.availableLanguages.includes("SA") ||
            story.originalLanguage.toLowerCase().includes("sanskrit"))) ||
        (selectedLanguageFilter === "HINDI" &&
          (story.availableLanguages.includes("HI") ||
            story.originalLanguage.toLowerCase().includes("hindi"))) ||
        (selectedLanguageFilter === "TAMIL" &&
          (story.availableLanguages.includes("TA") ||
            story.originalLanguage.toLowerCase().includes("tamil"))) ||
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
      className={`min-h-screen w-full overflow-x-clip font-sans selection:bg-brandPink selection:text-white flex flex-col justify-between transition-colors duration-200 ${
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

      {/* Intro Loading Curtain & User Login Modal (from design zip) */}
      {showIntroSplash && (
        <IntroSplashAndAuth
          isOpen={showIntroSplash}
          onComplete={() => setShowIntroSplash(false)}
          onUserLogin={(user) => {
            setCurrentUser(user);
            StorageService.setUser(user);
            setShowIntroSplash(false);
            showToast(t.toast.signedIn);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Floating Cultural Indian BGM Soundtrack Player */}
      <SoundtrackWidget />

      {/* Live Region for Screen Reader Assistive Technologies */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {toastMessage}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brandBlack text-brandYellow border-2 border-brandPink px-5 py-3 rounded-xl shadow-[5px_5px_0px_#FF087D] font-mono text-xs font-black flex items-center gap-2.5 animate-bounce">
          <span className="text-brandPink text-sm">✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 0. STARTING SCROLL-CONTROLLED FRAME ANIMATION (120-frame sequence)  */}
      {/* =================================================================== */}
      <ScrollFrameHero
        onOpenIntroLogin={() => setShowIntroSplash(true)}
        onExploreClick={() => {
          const el = document.getElementById("home");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

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
                  className={`px-4 py-1.5 rounded-full border-2 border-brandBlack font-extrabold transition-all duration-150 ${
                    activeSection === item.id
                      ? "bg-brandPink text-white shadow-[2px_2px_0px_#080808]"
                      : "bg-transparent text-brandBlack hover:bg-brandPink hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2.5 relative" data-purpose="accessibility-controls">
            {/* AI Heritage Lens Scanner */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setVisionScannerOpen(true);
              }}
              aria-label="AI Heritage Lens Visual Scanner"
              title="Identify Cultural Art Forms with Camera & AI (Alt+L)"
              className="flex items-center gap-1.5 px-3 py-2 border-2 border-brandBlack rounded-full bg-brandPink text-white hover:bg-brandBlack text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808] cursor-pointer"
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Heritage Lens</span>
            </button>

            {/* AI Cultural Guide Bot */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setGuideBotOpen(true);
              }}
              aria-label="AI Cultural Guide Bot"
              title="Ask AI Cultural Guide about Folklore, Rituals & Navigation (Alt+C)"
              className="flex items-center gap-1.5 px-3 py-2 border-2 border-brandBlack rounded-full bg-white hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808] cursor-pointer"
            >
              <span>🤖</span>
              <span>Guide Bot</span>
            </button>

            {/* Kerala Living Heritage Topography GIS Map */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setHeritageMapOpen(true);
              }}
              aria-label="Kerala Sacred Topography & GIS Provenance Map"
              title="Explore Sacred Topography & GIS Provenance Map (Alt+M)"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 border-2 border-brandBlack rounded-full bg-brandYellow hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808]"
            >
              <span>🗺️</span>
              <span>Heritage Map</span>
            </button>

            {/* Oral Folk Rhythm & Meter Metronome */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setTalaMetronomeOpen(true);
              }}
              aria-label="Oral Tala & Meter Metronome"
              title="Practice Oral Stanza Meter with Web Audio Metronome (Alt+R)"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 border-2 border-brandBlack rounded-full bg-white hover:bg-brandPink hover:text-white text-xs font-mono font-black transition shadow-[3px_3px_0px_#080808]"
            >
              <span>🥁</span>
              <span>Folk Tala</span>
            </button>

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

            {/* Replay Intro Splash & Login Trigger */}
            <button
              onClick={() => {
                Soundtrack.playClick();
                setShowIntroSplash(true);
              }}
              title="Launch Intro Splash & User Login"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border-2 border-brandBlack rounded-full bg-brandYellow hover:bg-brandPink hover:text-white transition shadow-[3px_3px_0px_#080808] text-xs font-mono font-black cursor-pointer"
            >
              <span>✨</span>
              <span>Intro &amp; Login</span>
            </button>

            {/* User Account / Profile Button */}
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setAuthModalOpen(true);
              }}
              title={currentUser ? `Profile: ${currentUser.name}` : "Sign In / Register"}
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-brandBlack rounded-full bg-white hover:bg-brandYellow transition shadow-[3px_3px_0px_#080808] cursor-pointer"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-brandBlack object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-brandPink text-white font-mono text-[10px] font-black flex items-center justify-center">
                  {currentUser ? currentUser.avatarInitials : "👤"}
                </div>
              )}
              <span className="text-xs font-mono font-black text-brandBlack hidden sm:inline">
                {currentUser ? currentUser.name.split(" ")[0] : "Sign In"}
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
                setVisionScannerOpen(true);
              }}
              className="block py-2 text-brandPink border-b border-brandBlack/20 text-left w-full font-bold"
            >
              👁️ AI Heritage Lens (Art Scanner)
            </button>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setMobileMenuOpen(false);
                setHeritageMapOpen(true);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20 text-left w-full font-bold"
            >
              🗺️ Sacred Topography GIS Map
            </button>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setMobileMenuOpen(false);
                setTalaMetronomeOpen(true);
              }}
              className="block py-2 text-brandBlack border-b border-brandBlack/20 text-left w-full font-bold"
            >
              🥁 Oral Tala &amp; Meter Metronome
            </button>
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
      {/* SECTION 1: HERO SECTION */}
      {/* =================================================================== */}
      <main
        className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24 pt-4 pb-8 flex flex-col justify-center relative overflow-hidden"
        data-purpose="hero-content"
        id="home"
      >
        {/* Starburst Ornaments - element behind BEYOND was removed as requested */}
        <div className="absolute right-2 sm:right-6 lg:right-10 bottom-12 -z-0 pointer-events-none select-none opacity-40 lg:opacity-75">
          <svg className="w-40 h-40 lg:w-52 lg:h-52 text-brandPink fill-current rotate-12" viewBox="0 0 100 100">
            <path d="M0,50 L35,28 L50,0 L65,28 L100,50 L65,72 L50,100 L35,72 Z"></path>
          </svg>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center relative z-10">
          <div className="flex flex-col justify-center pr-0 lg:pr-4" data-purpose="hero-copy">
            <div className="relative mb-6 select-none">
              <div className="inline-flex items-center gap-2 bg-brandPink text-white border-2 border-brandBlack px-3.5 py-1 text-xs font-mono font-black mb-4 shadow-[3px_3px_0px_#080808] rotate-[-1.5deg]">
                ✦ {selectedLanguage === "ML" ? "വാമൊഴി പൈതൃകവും സാംസ്കാരിക ആർക്കൈവും" : "FOLKLORE MEETS HIGH-ENERGY ARCHIVE"} ✦
              </div>
              <div className="pixel-heading text-[52px] sm:text-[68px] md:text-[80px] font-black text-brandBlack leading-[0.98]">
                {selectedLanguage === "ML" ? (
                  <>
                    <div>ഭാഷകൾക്കപ്പുറം</div>
                    <div className="flex items-center gap-4">
                      <span className="text-brandPink">സഞ്ചരിക്കുന്ന</span>
                      <svg
                        className="w-12 h-12 md:w-16 md:h-16 text-brandPink fill-current -mt-2 animate-bounce"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"></path>
                      </svg>
                    </div>
                    <div>കഥകൾ</div>
                  </>
                ) : (
                  <>
                    <div>STORIES</div>
                    <div className="flex items-center gap-4">
                      <span className="text-brandPink">BEYOND</span>
                      <svg
                        className="w-12 h-12 md:w-16 md:h-16 text-brandPink fill-current -mt-2 animate-bounce"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"></path>
                      </svg>
                    </div>
                    <div>LANGUAGE</div>
                  </>
                )}
              </div>
            </div>

            <p className="text-brandBlack text-[18px] sm:text-[20px] leading-relaxed max-w-2xl xl:max-w-3xl font-bold mb-8">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10" data-purpose="call-to-action-buttons">
              <a
                className="inline-flex items-center gap-3 bg-brandPink hover:bg-brandPinkDark text-white border-2 border-brandBlack px-8 py-4 rounded-full font-black text-base transition-all duration-200 transform hover:-translate-y-1 shadow-[5px_5px_0px_#080808]"
                href="#stories"
                onClick={() => Soundtrack.playClick()}
              >
                <span className="text-xs bg-brandYellow text-brandBlack font-black p-1.5 rounded-full leading-none border border-brandBlack">
                  ▶
                </span>
                <span>{t.hero.exploreBtn}</span>
              </a>

              <button
                onClick={toggleIntroAudio}
                className={`inline-flex items-center gap-2.5 bg-white hover:bg-brandYellow text-brandBlack border-2 border-brandBlack px-8 py-4 rounded-full font-black text-base transition-all duration-200 transform hover:-translate-y-1 shadow-[5px_5px_0px_#080808] ${
                  isIntroSpeaking ? "bg-brandYellow animate-pulse" : ""
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path
                    d="M15.536 8.464a5 5 0 0 1 0 7.072m2.828-9.9a9 9 0 0 1 0 12.728M5.586 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                <span>{isIntroSpeaking ? t.hero.stopSpeech : t.hero.listenSpeech}</span>
              </button>
            </div>

            {/* Quick 4-Feature Icons Bar */}
            <div className="grid grid-cols-4 gap-2 pt-6 border-t-2 border-brandBlack max-w-xl xl:max-w-2xl w-full">
              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[0]);
                }}
                className="flex flex-col items-center text-center px-1 cursor-pointer hover:scale-105 transition"
              >
                <div className="mb-2 bg-white p-2 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
                  <svg className="w-6 h-6 text-brandBlack" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <span className="text-xs font-black leading-tight text-brandBlack">
                  Multilingual<br />Stories
                </span>
              </div>

              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setGlossaryModalOpen(true);
                }}
                className="flex flex-col items-center text-center px-1 border-l-2 border-brandBlack cursor-pointer hover:scale-105 transition"
              >
                <div className="mb-2 bg-white p-2 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
                  <svg className="w-6 h-6 text-brandBlack" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <span className="text-xs font-black leading-tight text-brandBlack">
                  Cultural<br />Explanations
                </span>
              </div>

              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setA11yModalOpen(true);
                }}
                className="flex flex-col items-center text-center px-1 border-l-2 border-brandBlack cursor-pointer hover:scale-105 transition"
              >
                <div className="mb-2 bg-white p-2 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
                  <svg className="w-6 h-6 text-brandBlack" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M4 11h16M12 11v10m-3-6 3 3 3-3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <span className="text-xs font-black leading-tight text-brandBlack">
                  Accessible<br />for All
                </span>
              </div>

              <div
                onClick={() => {
                  Soundtrack.playModalPop();
                  setReviewerModalOpen(true);
                }}
                className="flex flex-col items-center text-center px-1 border-l-2 border-brandBlack cursor-pointer hover:scale-105 transition"
              >
                <div className="mb-2 bg-white p-2 rounded-xl border-2 border-brandBlack shadow-[2px_2px_0px_#080808]">
                  <svg className="w-6 h-6 text-brandBlack" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path
                      d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </div>
                <span className="text-xs font-black leading-tight text-brandBlack">
                  Human<br />Reviewed
                </span>
              </div>
            </div>
          </div>

          {/* Pop Art Hero Illustration */}
          <div
            className="relative flex justify-center items-center min-h-[580px] lg:min-h-[640px] w-full"
            data-purpose="pop-art-hero-illustration"
          >
            <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-90">
              <svg
                className="w-full max-w-[620px] h-[620px] text-brandPink/30 fill-current animate-pulse"
                style={{ animationDuration: "7s" }}
                viewBox="0 0 400 400"
              >
                <polygon points="200,200 180,0 220,0"></polygon>
                <polygon points="200,200 320,40 350,75"></polygon>
                <polygon points="200,200 400,180 400,220"></polygon>
                <polygon points="200,200 360,320 330,355"></polygon>
                <polygon points="200,200 220,400 180,400"></polygon>
                <polygon points="200,200 75,360 40,325"></polygon>
                <polygon points="200,200 0,220 0,180"></polygon>
                <polygon points="200,200 400,75 75,40"></polygon>
              </svg>
            </div>
            <div className="absolute right-0 top-1/4 w-96 h-80 bg-brandPink/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute left-0 bottom-16 w-80 h-72 bg-white/50 rounded-full blur-2xl -z-10"></div>
            <div className="relative w-full flex flex-col items-center">
              <img
                alt="KathaBridge Cultural Pop Art Storyteller"
                className="w-full h-auto max-h-[640px] object-contain select-none animate-float filter drop-shadow-[10px_10px_0px_#080808] cursor-pointer"
                onClick={() => {
                  Soundtrack.playModalPop();
                  setActiveStoryReader(mockStories[0]);
                }}
                src="/images/landing/asset_9.png"
              />
            </div>
          </div>
        </div>
      </main>

      {/* =================================================================== */}
      {/* CONTINUOUS TICKER MARQUEE 1 */}
      {/* =================================================================== */}
      <div
        className="w-full bg-brandPink text-brandYellow overflow-hidden py-3.5 border-y-2 border-brandBlack z-20 shadow-[0_4px_0_#080808]"
        data-purpose="announcement-marquee"
      >
        <div className="animate-marquee select-none font-bold text-lg sm:text-xl items-center tracking-wider pixel-marquee flex whitespace-nowrap">
          {/* Repeating Ribbon Text Pattern matching reference */}
          <div className="flex items-center gap-6 shrink-0">
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">STORIES BEYOND LANGUAGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">ORAL TRADITION</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">VERIFIED FOLKLORE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">STORIES BEYOND LANGUAGE</span>
            <span className="text-brandYellow text-base">✦</span>
          </div>
          <div className="flex items-center gap-6 shrink-0" aria-hidden="true">
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">STORIES BEYOND LANGUAGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">ORAL TRADITION</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">VERIFIED FOLKLORE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">KATHABRIDGE</span>
            <span className="text-brandYellow text-base">✦</span>
            <span className="text-white font-extrabold">STORIES BEYOND LANGUAGE</span>
            <span className="text-brandYellow text-base">✦</span>
          </div>
        </div>
      </div>


      {/* =================================================================== */}
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
              { id: "MALAYALAM", label: selectedLanguage === "ML" ? "മലയാളം" : "MALAYALAM" },
              { id: "SANSKRIT", label: selectedLanguage === "SA" ? "संस्कृतम्" : "SANSKRIT" },
              { id: "HINDI", label: selectedLanguage === "HI" ? "हिन्दी" : "HINDI" },
              { id: "TAMIL", label: selectedLanguage === "TA" ? "தமிழ்" : "TAMIL" },
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

            {selectedCategory !== "ALL" && (
              <div className="flex items-center gap-1.5 bg-brandPink text-white px-3 py-1 rounded-full text-xs font-mono font-black border-2 border-brandBlack shadow-[2px_2px_0px_#080808] animate-fade-in">
                <span>CATEGORY: {selectedCategory.replace("_", " ")}</span>
                <button
                  onClick={() => {
                    Soundtrack.playClick();
                    setSelectedCategory("ALL");
                    showToast("Category filter reset to All");
                  }}
                  title="Clear Category Filter"
                  className="w-4 h-4 rounded-full bg-white text-brandPink flex items-center justify-center font-bold text-[10px] ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
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
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (story.id === "theyyam") target.src = "/images/landing/asset_7.png";
                        else if (story.id === "koodiyattam") target.src = "/images/landing/asset_2.png";
                        else if (story.id === "panchatantra") target.src = "/images/landing/asset_11.png";
                        else target.src = "/images/landing/asset_10.png";
                      }}
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

        {/* Living Cultural Geography & Oral Metronome Feature Callout */}
        <div className="mb-10 bg-brandYellow border-4 border-brandBlack rounded-2xl p-5 sm:p-6 shadow-[6px_6px_0px_#080808] flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brandPink text-white font-mono text-[10px] font-black px-2 py-0.5 rounded border border-brandBlack uppercase">
                GEOSPATIAL TOPOGRAPHY &amp; INDIGENOUS METERS
              </span>
              <span className="text-xs font-mono font-bold text-brandBlack hidden sm:inline">
                • Living Heritage Loci
              </span>
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-black text-brandBlack">
              Trace Sacred Shrines, Ancient Koothambalams &amp; Oral Tala Rhythms
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-brandBlack/80 mt-1">
              Explore pinpointed GPS coordinates of living shrines, UNESCO Sanskrit theatres, and practice oral recitation meters using our Web Audio procedural metronome.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setVisionScannerOpen(true);
              }}
              className="bg-brandPink hover:bg-black text-white font-mono text-xs font-black px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>👁️</span>
              <span>Scan Art with AI Lens →</span>
            </button>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setHeritageMapOpen(true);
              }}
              className="bg-brandBlack hover:bg-neutral-800 text-brandYellow font-mono text-xs font-black px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[3px_3px_0px_#FF087D] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🗺️</span>
              <span>Launch Heritage GIS Map →</span>
            </button>
            <button
              onClick={() => {
                Soundtrack.playModalPop();
                setTalaMetronomeOpen(true);
              }}
              className="bg-white hover:bg-brandPink hover:text-white text-brandBlack font-mono text-xs font-black px-4 py-2.5 rounded-full border-2 border-brandBlack shadow-[3px_3px_0px_#080808] transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🥁</span>
              <span>Open Folk Tala Metronome →</span>
            </button>
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
              image: "/images/landing/asset_5.png",
              subTag: "ORAL ANTHOLOGY",
              tape: "right",
              categoryKey: "FOLK_TALES"
            },
            {
              id: "classical-lit",
              tag: "02 • POETRY & PROSE",
              title: t.categoriesSection.classicalTitle,
              desc: t.categoriesSection.classicalDesc,
              stat: "85+ MANUSCRIPTS",
              icon: "📜",
              image: "/images/landing/asset_4.png",
              subTag: "POETRY & PROSE",
              tape: "left",
              categoryKey: "CLASSICAL_LIT"
            },
            {
              id: "performances",
              tag: "03 • LIVING THEATRE",
              title: t.categoriesSection.theatreTitle,
              desc: t.categoriesSection.theatreDesc,
              stat: "62+ DOCUMENTED ACTS",
              icon: "🎭",
              image: "/images/stories/koodiyattam.png",
              subTag: "LIVING THEATRE",
              tape: "right-yellow",
              categoryKey: "PERFORMANCES"
            },
            {
              id: "regional-art",
              tag: "04 • VISUAL LANGUAGE",
              title: t.categoriesSection.craftsTitle,
              desc: t.categoriesSection.craftsDesc,
              stat: "95+ ART ESSAYS",
              icon: "🎨",
              image: "/images/landing/asset_1.png",
              subTag: "VISUAL LANGUAGE",
              tape: "left",
              categoryKey: "REGIONAL_ART"
            },
            {
              id: "music-traditions",
              tag: "05 • SOUND & RHYTHM",
              title: t.categoriesSection.balladsTitle,
              desc: t.categoriesSection.balladsDesc,
              stat: "110+ AUDIO TRACKS",
              icon: "🪕",
              image: "/images/landing/asset_3.png",
              subTag: "SOUND & RHYTHM",
              tape: "right",
              categoryKey: "MUSIC_ORAL"
            },
            {
              id: "festivals",
              tag: "06 • LIVING CALENDAR",
              title: t.categoriesSection.festivalsTitle || "Festivals & Heritage",
              desc: t.categoriesSection.festivalsDesc || "Seasonal transitions, harvest alignments, boat races, and sacred grove rituals decoded beyond tourist spectacle into deep reverence.",
              stat: "50+ CELEBRATIONS",
              icon: "🏮",
              image: "/images/landing/asset_12.png",
              subTag: "LIVING CALENDAR",
              tape: "left-yellow",
              categoryKey: "FESTIVALS"
            },
          ].map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                Soundtrack.playModalPop();
                setActiveCategoryShowcase(cat as CategoryData);
              }}
              className="bg-white border-2 border-brandBlack rounded-2xl shadow-[6px_6px_0px_#080808] hover:-translate-y-1 transition duration-150 flex flex-col justify-between group relative overflow-hidden cursor-pointer hover:border-brandPink"
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
                  <h3 className="font-editorial text-2xl font-black text-brandBlack mb-2 group-hover:text-brandPink transition">
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      Soundtrack.playClick();
                      setSelectedCategory(cat.categoryKey);
                      showToast(`Filtered archive to: ${cat.title}`);
                      const el = document.getElementById("stories");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-brandPink group-hover:translate-x-1 transition-transform font-bold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <span>EXPLORE</span>
                    <span>→</span>
                  </button>
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
              <a
                href="https://github.com/AnnRosePT/KathaBridge"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => Soundtrack.playClick()}
                className="hover:text-brandYellow transition cursor-pointer"
              >
                OPEN REPO ↗
              </a>
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

      {/* 10. Heritage Category Deep-Dive Showcase Modal */}
      {activeCategoryShowcase && (
        <CategoryShowcaseModal
          category={activeCategoryShowcase}
          stories={mockStories.filter((s) => {
            const k = activeCategoryShowcase.categoryKey;
            if (k === "FOLK_TALES") return s.category === "FOLK_TALES" || s.id === "mahabali" || s.id === "naranath" || s.id === "muthappan";
            if (k === "CLASSICAL_LIT") return s.category === "CLASSICAL_LIT" || s.id === "panchatantra";
            if (k === "PERFORMANCES") return s.category === "PERFORMANCES" || s.id === "theyyam" || s.id === "koodiyattam" || s.id === "muthappan";
            if (k === "REGIONAL_ART") return s.id === "koodiyattam" || s.id === "theyyam";
            if (k === "MUSIC_ORAL") return s.id === "theyyam" || s.id === "mahabali";
            if (k === "FESTIVALS") return s.id === "mahabali" || s.id === "theyyam";
            return true;
          })}
          onSelectStory={(st) => {
            setActiveStoryReader(st);
            setActiveCategoryShowcase(null);
          }}
          onFilterArchive={(k) => {
            setSelectedCategory(k);
            showToast(`Archive filtered to: ${activeCategoryShowcase.title}`);
            const el = document.getElementById("stories");
            if (el) el.scrollIntoView({ behavior: "smooth" });
            setActiveCategoryShowcase(null);
          }}
          onClose={() => {
            Soundtrack.playClick();
            setActiveCategoryShowcase(null);
          }}
        />
      )}

      {/* 11. AI Cultural Guide & Storytelling Assistant Modal */}
      {guideBotOpen && (
        <CulturalGuideBotModal
          onClose={() => {
            Soundtrack.playClick();
            setGuideBotOpen(false);
          }}
          onOpenStory={(storyId) => {
            const targetStory = mockStories.find((s) => s.id === storyId);
            if (targetStory) {
              setActiveStoryReader(targetStory);
              setGuideBotOpen(false);
            }
          }}
        />
      )}

      {/* 12. Kerala Sacred Topography & GIS Map Modal */}
      {heritageMapOpen && (
        <HeritageMapModal
          stories={mockStories}
          onSelectStory={(st) => {
            setActiveStoryReader(st);
            setHeritageMapOpen(false);
          }}
          onClose={() => {
            Soundtrack.playClick();
            setHeritageMapOpen(false);
          }}
        />
      )}

      {/* 13. Indigenous Oral Tala & Poetic Meter Metronome Modal */}
      {talaMetronomeOpen && (
        <OralTalaMetronomeModal
          onClose={() => {
            Soundtrack.playClick();
            setTalaMetronomeOpen(false);
          }}
        />
      )}

      {/* 14. AI Heritage Lens Visual Art Scanner Modal */}
      {visionScannerOpen && (
        <HeritageVisionScannerModal
          stories={mockStories}
          onSelectStory={(st) => {
            setActiveStoryReader(st);
            setVisionScannerOpen(false);
          }}
          onClose={() => {
            Soundtrack.playClick();
            setVisionScannerOpen(false);
          }}
        />
      )}

      {/* Floating AI Cultural Guide Bot Trigger (Bottom-Right) */}
      <button
        onClick={() => {
          Soundtrack.playModalPop();
          setGuideBotOpen(true);
        }}
        aria-label="Open AI Cultural Guide Bot"
        title="Ask Cultural Guide Bot about Folklore & Rituals (Alt+C)"
        className="fixed bottom-20 right-6 z-40 bg-brandBlack text-brandYellow hover:bg-brandPink hover:text-white border-2 border-brandBlack px-4 py-2 rounded-full font-mono text-xs font-black shadow-[4px_4px_0px_#FF087D] flex items-center gap-2 transition cursor-pointer"
      >
        <span className="text-sm">🤖</span>
        <span className="hidden sm:inline">Ask Guide Bot (സഹചാരി)</span>
        <span className="sm:hidden">Guide</span>
      </button>
    </div>
  );
}
