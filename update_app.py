import json
import re

with open('url_map.json', 'r', encoding='utf-8') as f:
    url_map = json.load(f)

with open('KathaBridge/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all external URLs with local URLs
for ext_url, local_url in url_map.items():
    content = content.replace(ext_url, local_url)

# Add MalayalamVoiceLabModal import if not present
if 'MalayalamVoiceLabModal' not in content:
    content = content.replace(
        'import { AuthModal } from "./components/AuthModal";',
        'import { AuthModal } from "./components/AuthModal";\nimport { MalayalamVoiceLabModal } from "./components/MalayalamVoiceLabModal";'
    )

# Add useRef if not imported
if 'useRef' not in content:
    content = content.replace(
        'import React, { useState, useEffect }',
        'import React, { useState, useEffect, useRef }'
    )

# Add voiceLabOpen state and introAudioRef
if 'voiceLabOpen' not in content:
    target = '  const [authModalOpen, setAuthModalOpen] = useState(false);'
    replacement = target + '\n  const [voiceLabOpen, setVoiceLabOpen] = useState(false);\n  const introAudioRef = useRef<HTMLAudioElement | null>(null);'
    content = content.replace(target, replacement)

# Replace toggleIntroAudio implementation
old_toggle_intro = '''  const toggleIntroAudio = () => {
    Soundtrack.playClick();
    if (!("speechSynthesis" in window)) {
      showToast("Speech synthesis is not supported on this browser.");
      return;
    }

    if (isIntroSpeaking) {
      window.speechSynthesis.cancel();
      setIsIntroSpeaking(false);
      showToast("Intro narration stopped.");
    } else {
      const intro =
        selectedLanguage === "ML"
          ? "കഥാബ്രിഡ്ജിലേക്ക് സ്വാഗതം. ഭാഷകൾക്കപ്പുറമുള്ള സാംസ്കാരിക കഥകളും നാടൻ കലകളും അവയുടെ തനതായ സന്ദർഭത്തോടെ മനസ്സിലാക്കാം."
          : "Welcome to KathaBridge: Stories beyond language. Discover cultural stories, folk performances and regional literature with meaning, context and inclusive access for all.";

      setIsIntroSpeaking(true);
      speakSafely(window.speechSynthesis, intro, selectedLanguage, {
        rate: 0.95,
        onEnd: () => setIsIntroSpeaking(false),
        onError: () => setIsIntroSpeaking(false)
      });
      showToast(
        selectedLanguage === "ML"
          ? "കഥാബ്രിഡ്ജ് ആമുഖ വിവരണം കേൾക്കുന്നു..."
          : "Playing KathaBridge audio introduction..."
      );
    }
  };'''

new_toggle_intro = '''  const toggleIntroAudio = () => {
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
  };'''

if old_toggle_intro in content:
    content = content.replace(old_toggle_intro, new_toggle_intro)
else:
    print('Warning: old_toggle_intro not matched directly')

# Add "🎙 ML Voice" button in nav bar
nav_btn_target = '''            {/* Accessibility Center Trigger */}'''
nav_btn_insert = '''            {/* Malayalam Neural Voice Lab */}
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

            {/* Accessibility Center Trigger */}'''

if nav_btn_target in content and 'ML Voice' not in content:
    content = content.replace(nav_btn_target, nav_btn_insert)

# Add MalayalamVoiceLabModal rendering
modal_target = '''      {/* 8. Contact & Policy Modals */}'''
modal_insert = '''      {/* 9. Malayalam Neural Voice Lab Modal */}
      {voiceLabOpen && (
        <MalayalamVoiceLabModal
          onClose={() => {
            Soundtrack.playClick();
            setVoiceLabOpen(false);
          }}
        />
      )}

      {/* 8. Contact & Policy Modals */}'''

if modal_target in content and 'MalayalamVoiceLabModal' in content and 'voiceLabOpen &&' not in content:
    content = content.replace(modal_target, modal_insert)

with open('KathaBridge/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('App.tsx updated successfully!')

