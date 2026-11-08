import asyncio
import json
import os
import urllib.parse
import urllib.request
import edge_tts

STORIES_FILE = os.path.join(os.path.dirname(__file__), "KathaBridge", "src", "data", "stories.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "KathaBridge", "public", "audio", "tts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE_ML = "ml-IN-SobhanaNeural"  # Microsoft Sobhana (Natural Native Kerala Malayalam)
VOICE_EN = "en-IN-NeerjaNeural"   # Microsoft Neerja (Natural Indian English Storyteller)

async def synthesize_edge(text: str, voice: str, outfile: str):
    communicate = edge_tts.Communicate(text, voice, rate="-3%")
    await communicate.save(outfile)

def synthesize_google_fallback(text: str, lang: str, outfile: str):
    encoded = urllib.parse.quote(text)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded}&tl={lang}&client=tw-ob"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        with open(outfile, "wb") as f:
            f.write(resp.read())

async def main():
    with open(STORIES_FILE, "r", encoding="utf-8") as f:
        stories = json.load(f)

    print(f"Loaded {len(stories)} stories. Starting sentence audio synthesis...")

    for story in stories:
        s_id = story["id"]
        sentences = story.get("sentences", [])
        print(f"\n--- Story: {s_id} ({len(sentences)} sentences) ---")

        for idx, s in enumerate(sentences):
            sent_id = s["id"]
            text_ml = s["originalText"]
            text_en = s["translatedText"]["EN"]

            # 1. Malayalam Audio
            ml_file = os.path.join(OUTPUT_DIR, f"{sent_id}_ml.mp3")
            try:
                await synthesize_edge(text_ml, VOICE_ML, ml_file)
                print(f" [ML] {sent_id} synthesized with SobhanaNeural ({os.path.getsize(ml_file)} bytes)")
            except Exception as e:
                print(f" [ML] Edge error for {sent_id}, using Google fallback: {e}")
                synthesize_google_fallback(text_ml, "ml", ml_file)
                print(f" [ML] Fallback saved ({os.path.getsize(ml_file)} bytes)")

            # 2. English Audio
            en_file = os.path.join(OUTPUT_DIR, f"{sent_id}_en.mp3")
            try:
                await synthesize_edge(text_en, VOICE_EN, en_file)
                print(f" [EN] {sent_id} synthesized with NeerjaNeural ({os.path.getsize(en_file)} bytes)")
            except Exception as e:
                print(f" [EN] Edge error for {sent_id}, using Google fallback: {e}")
                synthesize_google_fallback(text_en, "en", en_file)
                print(f" [EN] Fallback saved ({os.path.getsize(en_file)} bytes)")

    # Also synthesize intro narration audio in Malayalam & English
    intro_ml = "കഥാബ്രിഡ്ജിലേക്ക് സ്വാഗതം. ഭാഷകൾക്കപ്പുറമുള്ള സാംസ്കാരിക കഥകളും നാടൻ കലകളും അവയുടെ തനതായ സന്ദർഭത്തോടെ മനസ്സിലാക്കാം."
    intro_en = "Welcome to KathaBridge: Stories beyond language. Discover cultural stories, folk performances and regional literature with meaning, context and inclusive access for all."
    
    await synthesize_edge(intro_ml, VOICE_ML, os.path.join(OUTPUT_DIR, "intro_ml.mp3"))
    await synthesize_edge(intro_en, VOICE_EN, os.path.join(OUTPUT_DIR, "intro_en.mp3"))
    print("\nIntro narration audios generated for both languages!")

if __name__ == "__main__":
    asyncio.run(main())

