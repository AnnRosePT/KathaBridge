import re

with open('KathaBridge/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add selectedPersona state in App component
if 'selectedPersona' not in content:
    persona_state = '''  const [selectedPersona, setSelectedPersona] = useState<"explorer" | "scholar" | "contributor" | "inclusive">("explorer");'''
    content = content.replace(
        '  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);',
        '  const [isIntroSpeaking, setIsIntroSpeaking] = useState(false);\n' + persona_state
    )

# 2. Update Header to match the dark luxury design from the screenshot
old_header = '''      {/* =================================================================== */}
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
          </div>'''

new_header = '''      {/* =================================================================== */}
      {/* TOP NAVIGATION BAR (Exact KathaBridge Intro Navbar) */}
      {/* =================================================================== */}
      <header
        className={`w-full sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-[#0B0B0B]/95 backdrop-blur-md border-b-2 border-black/80 shadow-[0_4px_20px_rgba(0,0,0,0.6)] py-3.5"
            : "bg-[#0B0B0B] border-b border-white/10 pt-6 pb-4"
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
              <div className="flex items-center gap-2">
                {/* 4-point hot-pink star matching exact screenshot */}
                <svg
                  className="w-5 h-5 text-brandPink fill-current group-hover:scale-125 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z"></path>
                </svg>
                <span className="text-[26px] font-black tracking-tight text-white leading-none font-sans">
                  KathaBridge
                </span>
              </div>
              <span className="text-[10px] tracking-[0.25em] font-extrabold text-neutral-400 uppercase mt-1 pl-7">
                {t.nav.tagline}
              </span>
            </a>

            {/* Vertical divider */}
            <div className="h-7 w-[1px] bg-white/20 hidden md:block"></div>

            {/* Navigation Links matching exact Figma screenshot */}
            <nav
              className="hidden md:flex items-center gap-2 text-[14px] font-bold tracking-tight"
              data-purpose="primary-links"
            >
              <a
                href="#home"
                onClick={() => Soundtrack.playClick()}
                className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider transition ${
                  activeSection === "home"
                    ? "bg-[#FFFC00] text-black shadow-[2px_2px_0px_#FF087D]"
                    : "text-white hover:text-[#FFFC00]"
                }`}
              >
                {t.nav.home}
              </a>
              <a
                href="#stories"
                onClick={() => Soundtrack.playClick()}
                className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider transition ${
                  activeSection === "stories"
                    ? "text-[#FFFC00] underline decoration-2 underline-offset-4"
                    : "text-white hover:text-[#FFFC00]"
                }`}
              >
                {t.nav.stories}
              </a>
              <a
                href="#explore"
                onClick={() => Soundtrack.playClick()}
                className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider transition ${
                  activeSection === "explore"
                    ? "text-[#FFFC00] underline decoration-2 underline-offset-4"
                    : "text-white hover:text-[#FFFC00]"
                }`}
              >
                {t.nav.explore}
              </a>
              <a
                href="#about"
                onClick={() => Soundtrack.playClick()}
                className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider transition ${
                  activeSection === "about"
                    ? "text-[#FFFC00] underline decoration-2 underline-offset-4"
                    : "text-white hover:text-[#FFFC00]"
                }`}
              >
                {t.nav.about}
              </a>
            </nav>
          </div>'''

content = content.replace(old_header, new_header)

# 3. Update the Hero Main section + Add Tilted Yellow Banner & User Selection Hub
hero_main_start = content.find('      {/* SECTION 1: HERO SECTION */}')
hero_main_end = content.find('      {/* SECTION 2: CULTURAL ARCHIVE & MANIFESTO */}')

if hero_main_start != -1 and hero_main_end != -1:
    old_hero_and_marquee = content[hero_main_start:hero_main_end]
    
    new_hero_and_selection = '''      {/* SECTION 1: HERO SECTION (Exact KathaBridge Intro Page) */}
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
'''
    content = content[:hero_main_start] + new_hero_and_selection + content[hero_main_end:]
    print("Replaced hero section and added User Selection Hub successfully!")
else:
    print("Error: Could not find hero start or end points in App.tsx")

with open('KathaBridge/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated App.tsx successfully!")

