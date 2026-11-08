import asyncio
import json
import os
import edge_tts

GLOSSARY_FILE = os.path.join(os.path.dirname(__file__), "KathaBridge", "src", "data", "glossary.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "KathaBridge", "public", "audio", "tts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE_ML = "ml-IN-SobhanaNeural"

async def main():
    with open(GLOSSARY_FILE, "r", encoding="utf-8") as f:
        glossary = json.load(f)

    print(f"Loaded {len(glossary)} expressions. Synthesizing native Malayalam audio...")
    for exp in glossary:
        e_id = exp["id"]
        text = exp.get("audioPronunciationText") or exp.get("originalScript") or exp.get("term")
        outfile = os.path.join(OUTPUT_DIR, f"{e_id}.mp3")
        try:
            communicate = edge_tts.Communicate(text, VOICE_ML, rate="-4%")
            await communicate.save(outfile)
            print(f" [GLOSSARY] {e_id} ({text}) -> {os.path.getsize(outfile)} bytes")
        except Exception as e:
            print(f" [GLOSSARY] Error {e_id}: {e}")

    print("All glossary audio synthesized!")

if __name__ == "__main__":
    asyncio.run(main())

