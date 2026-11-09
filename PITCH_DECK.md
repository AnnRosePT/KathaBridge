# KathaBridge — Presentation Pitch Deck
> **Stories Beyond Language: Preserving India's Endangered Oral Folklore with Interactive Dual-Language Neural Storytelling**

---

## Slide 1: Title & Vision
- **Project**: KathaBridge (കഥാബ്രിഡ്ജ്)
- **Tagline**: Stories Beyond Language • Culture in Every Voice
- **Vision**: To bridge the generational and linguistic divide in India’s endangered oral folklore by transforming centuries of vernacular heritage into multisensory, bilingual, accessible digital experiences.
- **Presenter**: Ann Rose P T (Team NPS)
- **Live Deployment**: [https://kathabridge.vercel.app/](https://kathabridge.vercel.app/)
- **Repository**: [https://github.com/AnnRosePT/KathaBridge](https://github.com/AnnRosePT/KathaBridge)

---

## Slide 2: The Problem
### What happens when an oral dialect vanishes?
1. **Linguistic Attrition**: India is home to 19,500+ mother tongues, but hundreds lack written codification and disappear when elder oral tradition-bearers pass away.
2. **The "Lost in Translation" Trap**: Standard generic machine translation strips the spiritual and ritual soul out of cultural terms like *Theyyam (തെയ്യം)*, *Mizhavu (മിഴാവ്)*, or *Sarpakkavu (സർപ്പക്കാവ്)*.
3. **Accessibility Void**: Traditional archives are static PDFs or academic papers that alienate young language learners, dyslexic readers, and visually impaired individuals.

---

## Slide 3: The Solution — The KathaBridge Trinity
KathaBridge combines three synchronized modalities:
1. **Visual Cinema**: 60fps scroll-controlled frame animation that transports readers into the sanctum of North Malabar ritual folklore.
2. **Synchronized Bilingual Audio**: Word-level and sentence-level real-time karaoke narration in native Malayalam (tuned for *chillu* consonants and *samvruthokaram*) and English.
3. **Living Cultural Context**: Inline interactive popovers and an etymological glossary that explain the *meaning behind the words*, not just literal definitions.

---

## Slide 4: Target Personas
| Persona | User Need | KathaBridge Feature |
| :--- | :--- | :--- |
| **Story Explorer** | Wants engaging, bite-sized cultural stories | Dual-language reader with karaoke audio & ambient Carnatic soundtrack |
| **Cultural Scholar** | Needs authenticated source texts & variants | Side-by-side dialect comparison & academic review dashboard |
| **Oral Lore Contributor** | Village elder or folk artist with oral memory | Community audio recording upload & transcription tool |
| **Accessible Reader** | Has dyslexia, low vision, or sensory sensitivities | WCAG AAA suite (Dyslexia font, High Contrast, Sepia, Reduced Motion) |

---

## Slide 5: Technical Architecture
- **Frontend Core**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS v4 Neo-Pop Editorial Brutalist Design Tokens
- **Animation Engine**: High-DPI HTML5 Canvas with 60fps Lerp (Linear Interpolation) damping
- **Audio Stack**:
  - Web Audio API (procedural *Raga Mohanam* synthesis, temple bells, tanpura)
  - Pre-synthesized phonetically mapped Malayalam Neural Audio
  - Browser SpeechSynthesis fallback with phoneme sanitization
- **Edge Deployment**: Vercel Global Edge CDN with zero-dependency direct binary routing

---

## Slide 6: The Innovation & Competitive Edge
| Feature | Traditional Archives | Generic AI Translators | KathaBridge |
| :--- | :---: | :---: | :---: |
| Native Regional TTS | ❌ | ⚠️ Robotic | ✅ Neural Phonetic Tuning |
| Real-time Karaoke Highlighting | ❌ | ❌ | ✅ Interactive Sync |
| Deep Cultural Term Popovers | ❌ | ❌ | ✅ Historical Etymology |
| WCAG AAA Accessibility | ❌ | ❌ | ✅ Built-in Palettes & Fonts |
| Scholar Verification Loop | ⚠️ Slow Peer Review | ❌ No Safeguards | ✅ Two-Way Human-in-the-Loop |

---

## Slide 7: Scalability & Future Roadmap
- **Phase 1 (Current)**: Central Kerala & North Malabar Folklore (Malayalam + English).
- **Phase 2 (Q2 2026)**: Expansion to Tulu (*Paddanas*), Kodava, and Sanskrit (*Koodiyattam* acts).
- **Phase 3 (Q3 2026)**: Crowdsourced elder oral recordings with on-device speech-to-text whisper models.
- **Phase 4 (Q4 2026)**: Integration with rural school tablets and UNESCO intangible heritage portals.

---

## Slide 8: Live Demonstration Checklist
1. **Scroll-Driven Cinema**: Auto-Play Cinema through the 120-frame ritual sequence.
2. **Gateway**: Click *Go to Intro / Login* to view the cultural loader quotes.
3. **Bilingual Reader**: Open *The Legend of Muthappan*, play native Malayalam narration, and watch karaoke synchronization.
4. **Cultural Popovers**: Tap *തെയ്യം (Theyyam)* to inspect pronunciation and historical meaning.
5. **Malayalam Voice Lab**: Test speech synthesis pitch, rate, and dialect phonetics.
6. **Accessibility**: Toggle High-Contrast and Dyslexia font modes.

---

## Slide 9: Impact & Closing
> *"Stories are not just entertainment; they are the genetic memory of our ancestors. KathaBridge ensures those memories never go silent."*

- **Try it now**: [https://kathabridge.vercel.app/](https://kathabridge.vercel.app/)
- **Contribute**: [https://github.com/AnnRosePT/KathaBridge](https://github.com/AnnRosePT/KathaBridge)
