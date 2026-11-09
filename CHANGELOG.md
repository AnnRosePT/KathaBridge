# Changelog — KathaBridge (കഥാബ്രിഡ്ജ്)

All notable changes to this project are documented in this file in accordance with [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-09

### 🌟 Major Highlights
- **Scroll-Controlled Heritage Cinema**: High-DPI 60fps HTML5 Canvas frame animation (120 ritual sequence frames) with bicubic smoothing, auto-play cinema toggle, and native CSS sticky viewport pinning.
- **Workflow-Aligned Intro & Auth Gateway**: Seamless transition from visual sequence into the cultural loading curtain and multi-provider login (Google One-Tap, Mobile OTP, Email, and Instant Guest Explore).
- **Synchronized Karaoke Narration**: Sentence-level dynamic text illumination synchronized with native Malayalam (*Sobhana Neural*) and English acoustic speech synthesis.
- **Living Cultural Glossary**: 24 verified regional expressions (*Theyyam, Chenda, Hastha Mudra, Sopanam, Padayani, Samvruthokaram, Chillaksharangal*) with native pronunciation, literal meanings, and historical context.
- **WCAG 2.1 AAA Accessibility Suite**: Custom Dyslexia-friendly typography, 4 high-contrast color palettes (Dark, High-Contrast Yellow, Sepia, Default Canvas), font scaling (80%–130%), and reduced motion preference toggling.
- **Direct Edge Deployment on Vercel**: Fully configured single-page routing, unbundled direct Git binary assets, and instant Edge CDN delivery with zero external latency.

### 🚀 Added
- `ScrollFrameHero.tsx`: Hardware-accelerated canvas lerp animation engine with auto-play cinema controls.
- `PITCH_DECK.md`: Comprehensive 9-slide presentation guide for competition and jury evaluations.
- `manifest.json`: Full Progressive Web App (PWA) manifest enabling mobile and desktop app installation.
- `robots.txt` & `sitemap.xml`: SEO metadata, OpenGraph tags, Twitter Card cards, and JSON-LD structured schemas.
- `scripts/verify-all.js`: 66-check automated verification suite for story structures, glossary integrity, and phonetics.
- `exportProgress.ts`: Reading progress exporter and bilingual cultural portfolio generator.
- 2 New Regional Folklore Stories in `stories.json`:
  - *The Divine Hunter: The Legend of Parassini Muthappan* (North Malabar Subaltern Lore)
  - *Naranath Bhranthan: The Philosopher of Rayiranelloor Hill* (Valluvanad Philosophical Allegory)
- 6 New Cultural Glossary Entries in `glossary.json`: *Chenda, Chakyar Koothu, Hastha Mudra, Sopana Sangeetham, Padayani, and Chillu Aksharangal*.

### ⚡ Performance & Reliability
- Replaced Git LFS pointers with direct binary Git objects, resolving Vercel deployment 130-byte text pointer decoding errors.
- Implemented prioritized progressive frame preloading (instant priority window + idle chunk streaming).
- Replaced JavaScript state-based position toggling with native CSS `sticky top-0 w-full h-screen` to prevent black screen cutoff at 30%–39%.
- Added ARIA live regions and keyboard power shortcuts (`Escape`, `Alt+A`, `Alt+G`, `Alt+V`) for assistive screen readers.

### 📜 Cultural Sources & Citations
- Kerala Tourism Cultural Archives & Heritage Publications
- Sahapedia Performing Arts & Oral Traditions Documentation (CC BY-NC-SA 4.0)
- StoryWeaver (Pratham Books) Open Heritage Collection (CC BY 4.0)
- Kottarathil Sankunni's *Aithihyamala* (1909 Classical Public Domain Edition)
- Hermann Gundert's *Malayalam-English Dictionary* (1872)

---

Created with heart by **Ann Rose P T** (Team NPS) for the ART//CODE Competition.
