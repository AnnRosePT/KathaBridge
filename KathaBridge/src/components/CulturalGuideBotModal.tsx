import React, { useState, useRef, useEffect } from "react";
import { Soundtrack } from "../services/soundtrackService";
import { speakSafely } from "../utils/malayalamPhonetics";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  relatedStoryId?: string;
  relatedStoryTitle?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Why is Theyyam called a 'living divine embodiment'?",
  "What is the philosophical lesson of Naranath Bhranthan rolling the boulder?",
  "Tell me about King Mahabali and the egalitarian Onam legend.",
  "How does Koodiyattam use eye expressions (Netrabhinaya)?",
  "Where are the sacred serpent groves in Kerala?",
  "How does KathaBridge handle accessibility and native Indic audio?"
];

// Offline knowledgebase fallback for instant response resilience
const KNOWLEDGE_BASE: Record<string, { answer: string; storyId?: string; storyTitle?: string }> = {
  theyyam: {
    answer: "Theyyam (തെയ്യം, from 'Daivam' meaning Deity) is North Malabar's living ritual theatre. Performers from indigenous communities undergo rigorous penance, elaborate natural face painting (chayilyam), and wear towering bamboo headdresses (thirumudi) to embody the fierce mother goddess, hero spirits, and ancestral deities like Thee Chamundi, dancing directly across glowing embers without protective footwear.",
    storyId: "theyyam",
    storyTitle: "The Red Fire of Theyyam (തീച്ചാമുണ്ഡി)"
  },
  naranath: {
    answer: "Naranath Bhranthan (നارانത്ത് ഭ്രാന്തൻ, 'The Wise Madman of Naranath') is Kerala's quintessential philosophical folk figure. Every morning, he rolled a heavy granite boulder up the 500-foot Rayiranelloor hill with intense toil, only to push it down and roar with laughter as it tumbled—satirizing humanity's obsession with accumulating pride, titles, and transient worldly achievements.",
    storyId: "naranath",
    storyTitle: "Naranath Bhranthan: The Wise Madman (നارانത്ത് ഭ്രാന്തൻ)"
  },
  mahabali: {
    answer: "King Mahabali (Maveli) was the benevolent Asura sovereign celebrated in the Onam folk song 'Maveli Nadu Vaneedum Kalam'. His myth represents a timeless social vision of total equality, mutual trust, and agricultural abundance where 'all humankind lived as equals without deceit or inequality'. When Lord Vamana measured earth and skies, Mahabali surrendered his head to honor his promise of dharma.",
    storyId: "mahabali",
    storyTitle: "The Legend of Mahabali & Onam (മാവേലി ചരിതം)"
  },
  koodiyattam: {
    answer: "Koodiyattam (കൂടിയാട്ടം) is recognized by UNESCO as a Masterpiece of the Oral and Intangible Heritage of Humanity (2001). Performed inside sacred temple theatres (Koothambalam) for over 1,800 years, it relies on Netrabhinaya (micro-muscular eye choreography), Mudras (hand gestures), and the bronze Mizhavu drum to enact classical Sanskrit drama.",
    storyId: "koodiyattam",
    storyTitle: "Koodiyattam: The Eye That Speaks (കൂടിയാട്ടം)"
  },
  panchatantra: {
    answer: "The Panchatantra (Mitra-bheda / The Separation of Friends) is an ancient didactic anthology compiled by sage Vishnu Sharma. Through talking animals, lion kings, and cunning jackals, it teaches Niti (practical governance, critical psychology, and ethical discernment) preserved across vernacular Malayalam schoolroom traditions.",
    storyId: "panchatantra",
    storyTitle: "Panchatantra: The Lion & The Bull (പഞ്ചതന്ത്രം)"
  },
  accessibility: {
    answer: "KathaBridge is engineered for full accessibility conforming to WCAG 2.1 Level AA standards. Features include: OpenDyslexic typeface toggle, font scaling up to 130%, high-contrast themes (18.2:1 contrast ratio), reduced-motion mode, synchronized subtitle captions, full keyboard focus (Alt+M for Map, Alt+R for Folk Tala, Alt+C for Guide Bot), and native multi-tier Indic audio streams."
  }
};

interface Props {
  onClose: () => void;
  onOpenStory?: (storyId: string) => void;
}

export const CulturalGuideBotModal: React.FC<Props> = ({ onClose, onOpenStory }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-1",
      sender: "bot",
      text: "Namaskaram! 🙏 I am your KathaBridge Cultural Guide (സഹചാരി). Ask me anything about Kerala's oral folklore, ancient rituals (Theyyam, Koodiyattam), mythological philosophies, or how to navigate our multilingual archive!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isTyping) return;

    Soundtrack.playClick();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // 1. Check local knowledgebase for direct keyword matches
    const lower = textToSend.toLowerCase();
    let localMatch: { answer: string; storyId?: string; storyTitle?: string } | null = null;
    if (lower.includes("theyyam") || lower.includes("fire") || lower.includes("chamundi") || lower.includes("തെയ്യം")) {
      localMatch = KNOWLEDGE_BASE.theyyam;
    } else if (lower.includes("naranath") || lower.includes("bhranthan") || lower.includes("boulder") || lower.includes("ഭ്രാന്തൻ")) {
      localMatch = KNOWLEDGE_BASE.naranath;
    } else if (lower.includes("mahabali") || lower.includes("onam") || lower.includes("maveli") || lower.includes("മാവേലി")) {
      localMatch = KNOWLEDGE_BASE.mahabali;
    } else if (lower.includes("koodiyattam") || lower.includes("eye") || lower.includes("netra") || lower.includes("കൂടിയാട്ടം")) {
      localMatch = KNOWLEDGE_BASE.koodiyattam;
    } else if (lower.includes("panchatantra") || lower.includes("fable") || lower.includes("lion") || lower.includes("പഞ്ചതന്ത്രം")) {
      localMatch = KNOWLEDGE_BASE.panchatantra;
    } else if (lower.includes("accessib") || lower.includes("font") || lower.includes("dyslexi") || lower.includes("voice") || lower.includes("audio")) {
      localMatch = KNOWLEDGE_BASE.accessibility;
    }

    // 2. Query Gemini API for live natural response
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || (typeof process !== "undefined" && (process.env as any)?.VITE_GEMINI_API_KEY) || "";
    let botReplyText = "";
    let botStoryId = localMatch?.storyId;
    let botStoryTitle = localMatch?.storyTitle;

    try {
      const systemPrompt = `You are the KathaBridge AI Cultural Guide (സഹചാരി), an expert folklorist, anthropologist, and digital heritage guide for the KathaBridge platform (an oral folklore and digital heritage archive focusing on Kerala, Sanskrit, Tamil, and Indic traditions).
Answer clearly, respectfully, and accurately.
Key traditions in our archive:
- The Legend of Mahabali & Onam (മാവേലി ചരിതം): Egalitarian golden age, Thrikkakara temple, Pookkalam, Vamana.
- The Red Fire of Theyyam (തീച്ചാമുണ്ഡി): North Malabar sacred shrines, Thee Chamundi, Thottam Pattu chants, Vannan/Malayan custodians, Madayi Kavu.
- Koodiyattam (കൂടിയാട്ടം): UNESCO Intangible Cultural Heritage, Koothambalam temple theatres at Irinjalakuda, Netrabhinaya eye gestures, Mizhavu drums.
- Naranath Bhranthan (നارانത്ത് ഭ്രാന്തൻ): Rayiranelloor hill, rolling boulder, mockery of worldly pride.
- Muthappan (മുത്തപ്പൻ): Parassinikadavu folk deity, toddy offerings, universal acceptance.
- Panchatantra (Mitra-bheda): Animal fables, practical governance (Niti).
- Sacred Topography: OpenFreeMap GIS loci across Kerala districts.
Keep answers under 3-4 sentences. Include cultural nuances. If the user asks in Malayalam, answer in Malayalam.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser Question: ${textToSend}` }]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 250
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          botReplyText = candidate.trim();
        }
      }
    } catch (err) {
      console.warn("Gemini guide bot fallback:", err);
    }

    if (!botReplyText) {
      if (localMatch) {
        botReplyText = localMatch.answer;
      } else {
        botReplyText = "KathaBridge preserves the living folklore and sacred oral traditions of India. You can explore our 6 curated disciplines in the Explore tab, navigate the OpenFreeMap Sacred Topography (Alt+M), or listen to synchronized native narration in any story!";
      }
    }

    setIsTyping(false);
    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: "bot",
      text: botReplyText,
      relatedStoryId: botStoryId,
      relatedStoryTitle: botStoryTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  const handleSpeak = (msg: Message) => {
    Soundtrack.playClick();
    if (speakingMsgId === msg.id) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msg.id);
    speakSafely(msg.text, {
      lang: "EN",
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => setSpeakingMsgId(null)
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-bot-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#FFFDE0] border-4 border-brandBlack rounded-3xl max-w-2xl w-full h-[88vh] flex flex-col overflow-hidden shadow-[14px_14px_0px_#FF087D] relative">
        {/* Header */}
        <div className="bg-brandYellow border-b-4 border-brandBlack p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brandPink text-white border-2 border-brandBlack flex items-center justify-center text-2xl shadow-[3px_3px_0px_#080808] relative">
              🤖
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-brandBlack animate-pulse"></span>
            </div>
            <div>
              <div className="inline-block bg-brandBlack text-brandYellow text-[10px] font-mono font-black px-2 py-0.5 rounded border border-brandBlack uppercase tracking-widest">
                AI CULTURAL GUIDE • സഹചാരി
              </div>
              <h2
                id="guide-bot-title"
                className="font-editorial text-xl sm:text-2xl font-black text-brandBlack tracking-tight"
              >
                KathaBridge Oral Heritage Assistant
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide bot"
            className="w-10 h-10 rounded-full border-2 border-brandBlack bg-white hover:bg-brandPink hover:text-white flex items-center justify-center font-black text-lg transition shadow-[2px_2px_0px_#080808] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Message Stream */}
        <div
          aria-live="polite"
          aria-atomic="false"
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-brandPink text-white text-xs flex items-center justify-center border border-brandBlack shrink-0 font-bold mb-1">
                    🤖
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl border-2 border-brandBlack shadow-[3px_3px_0px_#080808] text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-brandYellow text-brandBlack rounded-br-none"
                      : "bg-[#FFFDE0] text-brandBlack rounded-bl-none font-medium"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Connected Story Pill */}
                  {msg.relatedStoryId && onOpenStory && (
                    <div className="mt-3 pt-2 border-t border-brandBlack/20">
                      <button
                        onClick={() => {
                          onOpenStory(msg.relatedStoryId!);
                          onClose();
                        }}
                        className="bg-brandPink hover:bg-brandBlack text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-brandBlack transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>📖</span>
                        <span>Read: {msg.relatedStoryTitle || msg.relatedStoryId} →</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-2 text-[10px] font-mono text-neutral-500">
                    <span>{msg.timestamp}</span>
                    {msg.sender === "bot" && (
                      <button
                        onClick={() => handleSpeak(msg)}
                        className="hover:text-brandPink font-bold flex items-center gap-1 cursor-pointer"
                        title="Listen to response"
                      >
                        <span>{speakingMsgId === msg.id ? "⏹ Stop" : "🔊 Listen"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 animate-pulse">
              <span className="w-6 h-6 rounded-full bg-brandPink text-white flex items-center justify-center text-xs">
                🤖
              </span>
              <span>Guide Bot is consulting oral archives...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Chips */}
        <div className="bg-neutral-50 border-t-2 border-brandBlack px-4 py-2.5 overflow-x-auto whitespace-nowrap flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-neutral-400 shrink-0">
            SUGGESTIONS:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] font-mono font-bold bg-white hover:bg-brandYellow text-brandBlack px-2.5 py-1 rounded-full border border-brandBlack transition shadow-[1px_1px_0px_#080808] shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-white border-t-2 border-brandBlack p-3 sm:p-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about Theyyam, Mahabali, sacred groves, or navigation..."
            className="flex-1 bg-neutral-100 border-2 border-brandBlack rounded-full px-4 py-2.5 text-xs sm:text-sm font-sans font-medium focus:outline-none focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-brandPink hover:bg-brandBlack text-white disabled:opacity-40 font-mono text-xs font-black px-5 py-2.5 rounded-full border-2 border-brandBlack shadow-[2px_2px_0px_#080808] transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Ask</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
};
