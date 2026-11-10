export default async function handler(req, res) {
  try {
    const { text, lang = "ml" } = req.query;
    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    let ttsLang = "ml";
    const l = String(lang).toLowerCase();
    if (l === "ml") ttsLang = "ml";
    else if (l === "ta") ttsLang = "ta";
    else if (l === "hi" || l === "sa") ttsLang = "hi";
    else ttsLang = "en";

    const encoded = encodeURIComponent(text);
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${ttsLang}&client=tw-ob`;

    const response = await fetch(googleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Upstream TTS service error" });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
