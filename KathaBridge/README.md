# KathaBridge — Culture in Every Voice
> **An accessible storytelling platform that opens selected cultural content across languages and accessibility needs while preserving its original meaning and context.**

---

### ART//CODE Hackathon Submission
- **Project Name**: KathaBridge (കഥാബ്രിഡ്ജ്)
- **Tagline**: *Stories Beyond Language*
- **Theme**: Language · Accessibility · Digital Storytelling
- **Team**: NPS
- **Live Local Demo**: `http://localhost:8443`

---

## 01 // Cultural Background & Context
Cultural stories, folk performances, art demonstrations, and regional literature are frequently inaccessible to audiences who do not speak the original tongue or require screen readers, captions, transcripts, and alternative sensory representations. Furthermore, literal machine translation routinely strips regional metaphors, devotional nuances, and socio-historical significance.

**KathaBridge** bridges this divide by combining:
1. Authentic multi-sensory storytelling (bilingual text, synchronized audio narration, procedural Indian classical background ragas).
2. The **"Meaning Behind the Words"** engine: deep cultural context explaining idioms, metaphors, and historical roots.
3. **WCAG 2.1 AAA Accessibility** controls (font scaling, high-contrast brutalist modes, line-height tuning, reduced motion).
4. **Human-in-the-Loop Verification**: A scholar-led peer-review workstation where machine transcripts and community contributions are verified before public archiving.

---

## 02 // Required Objectives & Feature Checklist

| Objective | Brief Requirement | KathaBridge Implementation |
|---|---|---|
| **Story Library** | Library of short cultural stories or performance clips | 3 curated stories: *The Legend of Mahabali*, *Theyyam: The Living Gods of North Malabar*, *Panchatantra: The Blue Jackal*. Search, category filters & sort. |
| **Transcripts & Subtitles** | Text transcripts & synchronised subtitles | Sentence-by-sentence text transcript with **live karaoke highlight**, audio scrub bar, and clickable sentence jumping. |
| **Bilingual Support** | English + 1 regional language (Malayalam) | Dual-language switcher (`EN` / `ML`), bilingual story reader, audio narration in both tongues, and live Gemini AI translation layer. |
| **Audio Narration** | Audio narration or text-to-speech | Cross-platform SpeechSynthesis engine with native `ml-IN` voice detection and phonetic transliteration fallback for Windows, speed & volume sliders. |
| **Living Glossary** | Glossary for culturally specific terms | Searchable **Cultural Glossary Modal** + **Inline Context Popovers** showing literal vs contextual translation, significance, and audio pronunciation. |
| **Accessibility** | Captions, readable layouts, image descriptions | Font scaling (`-` / `+`), High-Contrast Yellow/Black & Dark modes, line spacing, captions, reduced-motion toggle, semantic HTML, and full `alt` tags. |
| **Human Correction** | Human correction of machine-generated content | **Scholar Review Workstation (`[ 06 ]`)**: Side-by-side comparison (Raw vs AI Draft vs Verified), editable fields, granular statuses, and version history. |
| **Community Submissions** | User contribution pipeline | Community archivist modal (`[ 05 ]`) allowing folklore suggestions and corrections with moderation before publishing. |
| **AI Heritage Lens** | Visual art form & ritual recognition | Camera & photo scanner identifying Kathakali, Theyyam, Koodiyattam, Padayani, etc., with visual markers and story deep-links (`Alt+L`). |
| **Geographical Topography** | Sacred loci & living heritage GIS | OpenTopoMap elevation & relief map plotting sacred shrines, UNESCO temple theatres, and artisan guilds with GeoJSON export (`Alt+M`). |
| **Oral Folk Tala** | Indigenous rhythmic meter metronome | Web Audio API procedural synthesis of Chenda, Valanthala, and Ilathalam across authentic Kerala folk meters (`Alt+R`). |
| **Cultural Guide Bot** | AI folklore dialogue assistant | Gemini-powered assistant with strict oral folklore guardrails, audio readout, and story links (`Alt+C`). |
| **PWA & Offline Cache** | Standalone progressive web app & service worker | Full offline oral folklore caching (`sw.js` and `manifest.json`) for rural fieldwork without connectivity. |
| **Procedural Soundscapes** | Pure Web Audio ambient soundscapes | Synthesized Kshetram Sanctum bronze bells, Kavu night cicadas, and Edavappathi monsoon rain without audio files. |
| **Canvas Audio Visualizer** | Live oral recitation waveform & spectrum | Neo-Pop brutalist frequency bars, oscilloscope wave, and radial tala pulse canvas connected to Web Audio Analyser. |
| **Cultural Archival Dossier** | Print-ready peer-reviewed monograph | One-click printable PDF / Markdown anthropological dossier with W3C JSON-LD and scholar sign-off. |
| **Automated Verification** | High-rigor test suite | 431 automated assertions across 18 test suites verifying schema integrity, Unicode preservation, and audio contracts (`pnpm test`). |

---

## 03 // Research Connection & UNESCO Alignment
UNESCO highlights **linguistic diversity, accessibility, and the responsible ethics of AI** as three critical pillars in the preservation of intangible cultural heritage:
- **Intangible Cultural Rights**: Regional idioms are preserved in their living context rather than flattened by generic machine translation.
- **Indigenous Oral Rights**: Stories carry scholar verification stamps and regional provenance tags.
- **Accountable AI**: AI-generated translations are never presented as authoritative facts without human peer approval.

---

## 04 // Tech Stack & Architecture
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Design Paradigm**: Neo-Pop Brutalism (Stitch design system: `#FFFC00`, `#FF087D`, `#080808`, `#FFFDE0`)
- **Audio Engine**:
  - Web Audio API Procedural Classical BGM Engine (*Raga Mohanam*, tanpura drone, temple bells, Malabar grove ambient)
  - Web SpeechSynthesis API with custom Malayalam phonetic transliteration algorithms
- **AI Integration**: Google Gemini API (`gemini-flash-latest` / `gemini-3.8-flash`) for real-time translation abstraction and cultural nuance analysis
- **State & Storage**: Persistent `localStorage` repository for user profiles, reading history, favorites, accessibility preferences, and review queues

---

## 05 // How to Run Locally

```bash
# 1. Clone repository & navigate to KathaBridge
cd KathaBridge

# 2. Install dependencies
pnpm install

# 3. Create .env file with your Gemini API key
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# 4. Start the development server
pnpm run dev --port 8443

# 5. Open in your browser
http://localhost:8443/
```

---

## 06 // Demonstration Walkthrough for Evaluation

1. **Header & BGM**: Listen to the procedural tanpura & bell ambient dock in the bottom-right. Switch header language to `മലയാളം` and click `🔊` to hear the introduction spoken in Malayalam.
2. **Explore Stories**: Filter by `Ritual Folk Art` or search for `Theyyam`.
3. **Open Story Reader**: Click *Read Story* on *The Legend of Mahabali*. Click *Play Narration* to observe live karaoke sentence tracking.
4. **Cultural Popover**: Click any highlighted phrase (e.g. *മാവേലി നാടു വാണീടും കാലം*) to open the cultural anchor popover and listen to the audio pronunciation.
5. **Accessibility Modal**: Click `♿ Accessibility` in top bar to test font scaling, High-Contrast Brutalist mode, and line spacing adjustments.
6. **Scholar Review Workstation**: Click `Review Queue` in the navigation to test the side-by-side comparison, edit transcripts, and approve pending submissions with version timestamps.

