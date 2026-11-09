# KathaBridge — Stories Beyond Language

> **Culture in Every Voice**  
> An accessible digital storytelling platform bridging regional folklore across languages, sensory accessibility needs, and cultural barriers with authentic neural narration and human-in-the-loop scholar verification.

---

## 🌟 Key Features

- **Scroll-Controlled 120-Frame Heritage Cinema**:
  - High-DPI 60fps lerp-interpolated visual animation sequence transitioning from raw darkness into illuminated Theyyam and Kathakali ritual folk art.
  - Features Auto-Play Cinema toggle, interactive frame scrubbing, and a seamless **"Go to Intro / Login"** gateway.
- **Exact Obsidian Dark Intro Hero**: High-contrast modern typography, regional cultural collage illustration, floating starburst ornaments, and a dynamic tilted marquee banner.
- **Interactive User Persona Hub**: 4 distinct exploration modes:
  - 🎧 **Story Explorer** (`കഥാസ്വാദകൻ`): Oral folk tales with native neural narration, synchronized karaoke subtitles, and instant cultural term popovers.
  - 🎓 **Cultural Scholar** (`ഗവേഷകൻ`): Side-by-side comparison of raw oral transcripts, machine drafts, and verified scholar texts.
  - 🎙️ **Oral Lore Contributor** (`നാടൻ കലാകാരൻ`): Community submission portal for ancestral oral lore, ritual songs, and dialect proverbs.
  - ♿ **Universal Accessible Reader** (`സാർവത്രിക വായന`): WCAG 2.1 AAA suite with font scaling, 4 high-contrast palettes, relaxed line height, and reduced motion.
- **Curated Regional Story Library**:
  1. *The Legend of Mahabali: The Just Sovereign of Kerala* (Onam Heritage)
  2. *Theyyam: The Living Gods of North Malabar* (Ritual Folk Theatre)
  3. *Koodiyattam: The Living Sanskrit Theatre of Kerala* (UNESCO Masterpiece)
  4. *Panchatantra: The Blue Jackal and the Loyal Friend* (Sanskrit/Malayalam Moral Allegory)
- **Authentic Malayalam Neural TTS**:
  - Powered by **Azure / Edge Neural Speech (`ml-IN-SobhanaNeural`)** for native Central Kerala pronunciation of *chillu* characters (*ൽ, ൻ, ർ, ൾ, ൺ*) and the *samvruthokaram* (*്*).
  - Dedicated **Malayalam Voice Lab** with 4 standardized benchmark sentences and live synthesis playground.
- **"Meaning Behind the Words" Cultural Glossary**: 18 verified regional expressions and idioms with literal vs. contextual meanings, cultural significance, and native audio.
- **Ambient Classical Soundscape**: Procedural Web Audio API synthesis generating *Raga Mohanam*, tanpura drone, and temple bells.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm / yarn)

### Installation

```bash
# Navigate to the KathaBridge application directory
cd KathaBridge

# Install dependencies
pnpm install

# Start local development server
pnpm run dev
```

The application will be live at `http://localhost:8443/`.

### Production Build

```bash
cd KathaBridge
pnpm run build
pnpm run preview
```

### ☁️ Vercel Deployment

1. Import the repository `AnnRosePT/KathaBridge` on [Vercel](https://vercel.com).
2. Set **Root Directory** to `KathaBridge` (or use the provided root `vercel.json`).
3. Vercel auto-detects Vite and builds with single-page application rewrites automatically.

---

## 📁 Repository Structure

```
├── KathaBridge/
│   ├── public/
│   │   ├── audio/tts/       # Pre-synthesized native MP3 tracks for all stories and glossary terms
│   │   ├── images/
│   │   │   ├── landing/     # High-res transparent landing art and collage assets
│   │   │   └── stories/     # Local high-res story illustrations (zero external dependencies)
│   ├── src/
│   │   ├── components/      # UI Modals: VoiceLab, StoryReader, Glossary, A11y, Reviewer, etc.
│   │   ├── data/            # Curated bilingual stories, glossary, review queue & academic sources
│   │   ├── services/        # AudioNarrationService, SoundtrackService, StorageService, Translation
│   │   ├── App.tsx          # Full application shell & responsive layout (1720px max-width)
│   │   └── index.css        # Neo-pop brutalist design tokens & typography
│   └── vite.config.ts       # Vite config with dynamic /api/tts endpoint & caching
├── SUBMISSION_DRAFT.md      # Official ART//CODE competition submission report
└── README.md                # Project documentation
```

---

## 📜 Research & Heritage Sources

All cultural content and visual media adhere strictly to open-access and creative commons licensing:
- [StoryWeaver](https://storyweaver.org.in/) (CC BY 4.0)
- [Kerala Tourism Heritage Archive](https://www.keralatourism.org/)
- [Sahapedia Performing Arts Documentation](https://www.sahapedia.org/)
- [Wikimedia Commons](https://commons.wikimedia.org/) (CC BY-SA 4.0)
- [UNESCO Intangible Cultural Heritage](https://ich.unesco.org/)

---

## 📄 License
MIT License. Created for the ART//CODE Competition (Team: NPS).

