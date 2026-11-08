import asyncio
import os
import urllib.parse
import urllib.request
import edge_tts

SENTENCES = [
    {
        "id": "sample-1",
        "text": "കേരളം ദൈവത്തിന്റെ സ്വന്തം നാടാണ്.",
        "en": "Kerala is God's own country."
    },
    {
        "id": "sample-2",
        "text": "ഓണത്തിന്റെ ഐതിഹ്യത്തിൽ മഹാബലി രാജാവിന് വലിയ സ്ഥാനമുണ്ട്.",
        "en": "King Mahabali holds a significant place in the folklore of Onam."
    },
    {
        "id": "sample-3",
        "text": "തെയ്യം വടക്കൻ കേരളത്തിലെ ഒരു പ്രധാന അനുഷ്ഠാന കലയാണ്.",
        "en": "Theyyam is a major ritual folk art of North Kerala."
    },
    {
        "id": "sample-4",
        "text": "ഒരിക്കൽ ഒരു കാട്ടിൽ ഒരു സിംഹവും ഒരു എലിയും ജീവിച്ചിരുന്നു.",
        "en": "Once upon a time in a forest lived a lion and a mouse."
    }
]

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "KathaBridge", "public", "audio", "tts")
os.makedirs(OUTPUT_DIR, exist_ok=True)

async def synthesize_edge(text: str, voice: str, outfile: str):
    communicate = edge_tts.Communicate(text, voice, rate="-4%")
    await communicate.save(outfile)

def synthesize_google(text: str, outfile: str):
    encoded = urllib.parse.quote(text)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded}&tl=ml&client=tw-ob"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        with open(outfile, "wb") as f:
            f.write(resp.read())

async def main():
    print("Synthesizing test sentences for voice comparison...")
    for item in SENTENCES:
        s_id = item["id"]
        text = item["text"]
        print(f"\nProcessing {s_id}: {text}")

        # 1. Sobhana (Azure Neural Female)
        sobhana_file = os.path.join(OUTPUT_DIR, f"{s_id}_sobhana.mp3")
        await synthesize_edge(text, "ml-IN-SobhanaNeural", sobhana_file)
        print(f" -> Sobhana saved ({os.path.getsize(sobhana_file)} bytes)")

        # 2. Midhun (Azure Neural Male)
        midhun_file = os.path.join(OUTPUT_DIR, f"{s_id}_midhun.mp3")
        await synthesize_edge(text, "ml-IN-MidhunNeural", midhun_file)
        print(f" -> Midhun saved ({os.path.getsize(midhun_file)} bytes)")

        # 3. Google Malayalam
        google_file = os.path.join(OUTPUT_DIR, f"{s_id}_google.mp3")
        synthesize_google(text, google_file)
        print(f" -> Google Malayalam saved ({os.path.getsize(google_file)} bytes)")

    print("\nAll sample test sentences synthesized successfully!")

if __name__ == "__main__":
    asyncio.run(main())

