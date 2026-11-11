# 👁️ AI Heritage Lens (ദൃശ്യപരിശോധന) – Visual Art Recognition Engine

## 1. Overview
The **AI Heritage Lens** is KathaBridge's multimodal visual identification engine. It allows users, students, and cultural researchers to photograph or upload traditional Indian and Kerala performing arts (e.g. Kathakali, Theyyam, Koodiyattam, Mohiniyattam, Padayani, Ottamthullal) or indigenous crafts (e.g. Aranmula Kannadi metal mirrors) and receive immediate cultural, visual, and academic context.

---

## 2. Technical Architecture

```
[ User Camera / File Upload / Preset Sample ]
                      │
                      ▼
        [ Canvas Frame Extraction (JPEG) ]
                      │
                      ▼
         [ HeritageVisionService ]
          ├── 1. Primary: Google Gemini Flash Multimodal Vision API
          └── 2. Fallback: High-Accuracy Offline Curated Heuristics
                      │
                      ▼
        [ Structured Art Identification Result ]
          ├── Art Form Name (English & Malayalam script)
          ├── Detected Visual Markers (Face paint, Chutti, Kireedam)
          ├── Confidence Score (e.g., 96%)
          ├── Cultural & Ritual Significance
          ├── Costume & Makeup Classification
          ├── Direct Link to Associated Story in KathaBridge
          └── Audio Narration of Analysis via Web Speech / TTS
```

---

## 3. Multimodal Analysis Pipeline

1. **Hardware Camera Access**:
   Uses `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })` for rear-camera scanning on smartphones and tablets, with a universal `<input type="file" capture="environment">` fallback.

2. **Gemini Multimodal Payload**:
   Sends the base64-encoded frame with strict JSON schema instructions to `models/gemini-flash-latest:generateContent`, asking for specific Kerala art form features (Paccha, Kathi, Minukku, Thirumudi, Mudras).

3. **Offline Resilience**:
   If network is unavailable or API tokens are depleted, `HeritageVisionService` falls back gracefully to a curated local knowledge base (`artForms.json`), guaranteeing zero runtime failure.

---

## 4. User Interaction Flow
1. Open scanner via **`👁️ Heritage Lens`** header button, Explore section banner, or shortcut **`Alt + L`**.
2. Point camera at a traditional art photo or select from **✨ Preset Cultural Samples** (Kathakali, Theyyam, Koodiyattam, Mohiniyattam, Padayani, Aranmula Kannadi).
3. Watch the real-time scanning beam analyze pigments and headdresses.
4. Read the cultural breakdown, listen to spoken audio, or click **"Read Related Story →"** to jump directly into the full narrative.
