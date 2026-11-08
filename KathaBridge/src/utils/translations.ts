import { LanguageCode } from "../types";

export interface TranslationDictionary {
  nav: {
    home: string;
    stories: string;
    explore: string;
    about: string;
    contribute: string;
    tagline: string;
    reviewQueue: string;
    accessibility: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    exploreBtn: string;
    listenBtn: string;
    ticker: string;
  };
  storiesSection: {
    badge: string;
    heading: string;
    searchPlaceholder: string;
    sortShortest: string;
    sortPopular: string;
    sortDefault: string;
    languageLabel: string;
    allLang: string;
    malayalamLang: string;
    sanskritLang: string;
    showingStories: string;
    readStory: string;
    readTime: string;
    keyConceptLabel: string;
    noStories: string;
  };
  categoriesSection: {
    badge: string;
    heading: string;
    totalArchived: string;
    modesCount: string;
    folkLoreTitle: string;
    folkLoreDesc: string;
    classicalTitle: string;
    classicalDesc: string;
    theatreTitle: string;
    theatreDesc: string;
    craftsTitle: string;
    craftsDesc: string;
    balladsTitle: string;
    balladsDesc: string;
    festivalsTitle: string;
    festivalsDesc: string;
  };
  meaningSection: {
    badge: string;
    heading: string;
    subtext: string;
    exploreGlossaryBtn: string;
    verifiedScholarshipBadge: string;
    literalLabel: string;
    contextLabel: string;
    significanceLabel: string;
  };
  communitySection: {
    badge: string;
    heading: string;
    subtext: string;
    submitStoryBtn: string;
    reviewQueueBtn: string;
  };
  newsletter: {
    badge: string;
    heading: string;
    subtext: string;
    placeholder: string;
    subscribeBtn: string;
  };
  footer: {
    tagline: string;
    navigationHeader: string;
    curatorialHeader: string;
    initiativesHeader: string;
    copyright: string;
    unescoStatement: string;
  };
}

export const UI_TRANSLATIONS: Record<"EN" | "ML", TranslationDictionary> = {
  EN: {
    nav: {
      home: "Home",
      stories: "Stories",
      explore: "Explore",
      about: "About",
      contribute: "Contribute",
      tagline: "STORIES BEYOND LANGUAGE",
      reviewQueue: "Review Queue",
      accessibility: "Accessibility"
    },
    hero: {
      badge: "[ 01 / CULTURAL ARCHIVE ]",
      title: "STORIES BEYOND LANGUAGE.",
      subtitle:
        "A radical multilingual storytelling archive bridging oral histories, regional folklore, and living traditions with rich contextual meaning. Preserving authentic cultural depth beyond literal translation.",
      exploreBtn: "Explore Stories",
      listenBtn: "Listen Intro",
      ticker:
        "KATHABRIDGE // STORIES BEYOND LANGUAGE // CULTURAL ACCESS FOR ALL // PRESERVING LIVING ORAL TRADITIONS // UNESCO HERITAGE ALIGNED"
    },
    storiesSection: {
      badge: "[ 02 / FEATURED ARCHIVE ]",
      heading: "STORIES THAT TRAVEL THROUGH TIME.",
      searchPlaceholder: "Search stories or keywords...",
      sortShortest: "Shortest Read Time",
      sortPopular: "Most Popular",
      sortDefault: "Default Order",
      languageLabel: "LANGUAGE:",
      allLang: "ALL",
      malayalamLang: "MALAYALAM",
      sanskritLang: "SANSKRIT",
      showingStories: "STORIES AVAILABLE",
      readStory: "Read Story →",
      readTime: "MIN READ • AUDIO",
      keyConceptLabel: "Key Concept:",
      noStories: "No stories found matching your filter criteria."
    },
    categoriesSection: {
      badge: "[ 03 / CATEGORIES ]",
      heading: "EXPLORE THE MANY VOICES OF INDIA.",
      totalArchived: "TOTAL ARCHIVED MODES:",
      modesCount: "6 CURATED DISCIPLINES",
      folkLoreTitle: "Kerala Folklore & Myths",
      folkLoreDesc: "Oral tales of benevolent sovereigns, monsoon bounties, and egalitarian hopes.",
      classicalTitle: "Ancient Moral Fables",
      classicalDesc: "Panchatantra didactic allegories translated into vernacular schoolroom traditions.",
      theatreTitle: "Living Ritual Theatre",
      theatreDesc: "Theyyam sacred groves, Koodiyattam Sanskrit temple halls, and Mudiyettu catharsis.",
      craftsTitle: "Indigenous Heritage Crafts",
      craftsDesc: "Front-surface Aranmula metal mirrors, Kasavu handloom weaving, and sacred murals.",
      balladsTitle: "Oral Ballads & Invocations",
      balladsDesc: "Vadakkan Pattukal heroic ballads, Thottam hymns, and Onam seasonal songs.",
      festivalsTitle: "Harvests & Living Celebrations",
      festivalsDesc: "Onam Pookkalams, Thrissur Pulikkali street parades, and temple poorams."
    },
    meaningSection: {
      badge: "[ 04 / MEANING BEHIND THE WORDS ]",
      heading: "BEYOND LITERAL TRANSLATION.",
      subtext:
        "Literal translation misses cultural nuance. Our curated regional footnotes deconstruct local metaphors, idioms, and historical context with peer-reviewed authority.",
      exploreGlossaryBtn: "Explore Living Glossary →",
      verifiedScholarshipBadge: "VERIFIED SCHOLARSHIP",
      literalLabel: "Literal Meaning:",
      contextLabel: "Contextual Cultural Meaning:",
      significanceLabel: "Living Cultural Significance:"
    },
    communitySection: {
      badge: "[ 05 / COMMUNITY ARCHIVIST ]",
      heading: "EVERY CULTURE HAS A STORY. SHARE YOURS.",
      subtext:
        "Contribute oral histories, suggest regional expressions, and help bridge cultures with dignity. Submissions enter a scholar-led peer-review pipeline before permanent archiving.",
      submitStoryBtn: "Submit Oral Story",
      reviewQueueBtn: "Scholar Review Workstation"
    },
    newsletter: {
      badge: "WEEKLY FOLKLORE DISPATCH",
      heading: "Oral histories delivered to your inbox every Friday.",
      subtext: "Explore unvarnished translations, scholar annotations, and indigenous audio archives.",
      placeholder: "Enter your email address...",
      subscribeBtn: "Subscribe"
    },
    footer: {
      tagline: "Stories Beyond Language. An accessible digital heritage archive.",
      navigationHeader: "Platform",
      curatorialHeader: "Curatorial & Legal",
      initiativesHeader: "Heritage Initiatives",
      copyright: "© 2026 KathaBridge. Open Heritage Architecture under CC BY-SA 4.0 & Public Cultural Trust.",
      unescoStatement: "Built in adherence to UNESCO Intangible Cultural Heritage safeguarding recommendations and WCAG 2.1 AAA Accessibility benchmarks."
    }
  },
  ML: {
    nav: {
      home: "ഹോം",
      stories: "കഥകൾ",
      explore: "പര്യവേക്ഷണം",
      about: "ഞങ്ങളെക്കുറിച്ച്",
      contribute: "പങ്കാളിയാകൂ",
      tagline: "ഭാഷകൾക്കപ്പുറമുള്ള കഥകൾ",
      reviewQueue: "റിവ്യൂ ക്യൂ",
      accessibility: "സഹായ സവിശേഷതകൾ"
    },
    hero: {
      badge: "[ 01 / സാംസ്കാരിക ആർക്കൈവ് ]",
      title: "ഭാഷകൾക്കപ്പുറമുള്ള കഥകൾ.",
      subtitle:
        "വാമൊഴി പാരമ്പര്യങ്ങളും പ്രാദേശിക നാടൻ കലകളും അവയുടെ തനതായ സന്ദർഭത്തോടെ മനസ്സിലാക്കാം. അക്ഷരമാത്രമായ വിവർത്തനത്തിനപ്പുറം സാംസ്കാരികമായ അന്തരാർത്ഥം കാത്തുസൂക്ഷിക്കുന്ന പ്ലാറ്റ്‌ഫോം.",
      exploreBtn: "കഥകൾ കാണുക",
      listenBtn: "ആമുഖം കേൾക്കുക",
      ticker:
        "കഥാബ്രിഡ്ജ് // ഭാഷകൾക്കപ്പുറമുള്ള കഥകൾ // എല്ലാവർക്കും തുല്യമായ സാംസ്കാരിക പ്രാപ്യത // വാമൊഴി പാരമ്പര്യ സംരക്ഷണം // യുനെസ്കോ പൈതൃക മാനദണ്ഡങ്ങൾ"
    },
    storiesSection: {
      badge: "[ 02 / സാംസ്കാരിക കഥാ ശേഖരം ]",
      heading: "കാലാതീതമായ സാംസ്കാരിക കഥകൾ.",
      searchPlaceholder: "കഥകളോ വാക്കുകളോ തിരയുക...",
      sortShortest: "കുറഞ്ഞ വായനാ സമയം",
      sortPopular: "ഏറ്റവും ജനപ്രിയം",
      sortDefault: "സാധാരണ ക്രമം",
      languageLabel: "ഭാഷ:",
      allLang: "എല്ലാം",
      malayalamLang: "മലയാളം",
      sanskritLang: "സംസ്കൃതം",
      showingStories: "കഥകൾ ലഭ്യമാണ്",
      readStory: "കഥ വായിക്കുക →",
      readTime: "മിനിറ്റ് വായന • ശബ്ദം",
      keyConceptLabel: "പ്രധാന ആശയം:",
      noStories: "നിങ്ങൾ തിരഞ്ഞെടുത്ത വിഭാഗത്തിൽ കഥകളൊന്നും കണ്ടെത്താനായില്ല."
    },
    categoriesSection: {
      badge: "[ 03 / സാംസ്കാരിക വിഭാഗങ്ങൾ ]",
      heading: "ഭാരതത്തിന്റെ സാംസ്കാരിക സ്വരങ്ങൾ.",
      totalArchived: "ആകെ ലഭ്യമായ വിഭാഗങ്ങൾ:",
      modesCount: "6 സാംസ്കാരിക ശാഖകൾ",
      folkLoreTitle: "കേരള നാടോടിക്കഥകൾ",
      folkLoreDesc: "മഹാബലിയുടെ നീതിപൂർവ്വമായ ഭരണവും കാർഷിക സമൃദ്ധിയും തുല്യതയും പങ്കുവെക്കുന്ന കഥകൾ.",
      classicalTitle: "പ്രാചീന സാഹിത്യം",
      classicalDesc: "പഞ്ചതന്ത്ര തന്ത്രകഥകളും നന്മയുടെ പ്രാചീന സാരോപദേശങ്ങളും.",
      theatreTitle: "അനുഷ്ഠാന കലാരൂപങ്ങൾ",
      theatreDesc: "ഉത്തരമലബാറിലെ തെയ്യക്കാവുകൾ, കൂടിയാട്ടം സംസ്കൃത നാടകം, മുടിയേറ്റ് അനുഷ്ഠാനം.",
      craftsTitle: "തനതു കരകൗശലം",
      craftsDesc: "ആറന്മുള കണ്ണാടി നിർമ്മാണം, പരമ്പരാഗത കൈത്തറി വസ്ത്രങ്ങൾ, ചുവർച്ചിത്ര പാരമ്പര്യം.",
      balladsTitle: "വാമൊഴി പാട്ടുകൾ",
      balladsDesc: "വടക്കൻ പാട്ടുകൾ, തെയ്യം തോറ്റംപാട്ടുകൾ, ഓണക്കാല നാടൻ പാട്ടുകൾ.",
      festivalsTitle: "ഉത്സവ പാരമ്പര്യം",
      festivalsDesc: "ഓണപ്പൂക്കളം, തൃശ്ശൂർ പുലിക്കളി, നാട്ടുകൂട്ടങ്ങളുടെ ആഘോഷങ്ങൾ."
    },
    meaningSection: {
      badge: "[ 04 / വാക്കുകൾക്കപ്പുറമുള്ള അർത്ഥം ]",
      heading: "അക്ഷരങ്ങൾക്കപ്പുറമുള്ള അന്തരാർത്ഥം.",
      subtext:
        "അക്ഷരമാത്രമായ വിവർത്തനം പലപ്പോഴും പ്രാദേശിക സംസ്കാരത്തിന്റെ തനിമ നഷ്ടപ്പെടുത്തുന്നു. പണ്ഡിതന്മാരുടെ നേതൃത്വത്തിൽ സാംസ്കാരിക വ്യാഖ്യാനങ്ങൾ ഞങ്ങൾ ഇവിടെ ലഭ്യമാക്കുന്നു.",
      exploreGlossaryBtn: "സമ്പൂർണ്ണ പദാവലി കാണുക →",
      verifiedScholarshipBadge: "പണ്ഡിതർ സാക്ഷ്യപ്പെടുത്തിയത്",
      literalLabel: "അക്ഷരാർത്ഥം:",
      contextLabel: "സന്ദർഭോചിത അർത്ഥം:",
      significanceLabel: "സാംസ്കാരിക പ്രാധാന്യം:"
    },
    communitySection: {
      badge: "[ 05 / സാംസ്കാരിക കൂട്ടായ്മ ]",
      heading: "ഓരോ സംസ്കാരത്തിനും ഒരു കഥയുണ്ട്. നിങ്ങളുടെ കഥ പങ്കുവെക്കൂ.",
      subtext:
        "വാമൊഴി കഥകളും തനതു പ്രാദേശിക പ്രയോഗങ്ങളും പങ്കുവെക്കൂ. എല്ലാ സമർപ്പണങ്ങളും പ്രസിദ്ധീകരിക്കുന്നതിന് മുൻപ് പണ്ഡിത സമിതി പരിശോധിച്ച് ഉറപ്പുവരുത്തുന്നു.",
      submitStoryBtn: "കഥ സമർപ്പിക്കുക",
      reviewQueueBtn: "പണ്ഡിത റിവ്യൂ ക്യൂ"
    },
    newsletter: {
      badge: "പ്രതിവാര സാംസ്കാരിക വാർത്താപത്രിക",
      heading: "സാംസ്കാരിക കഥകളും ചരിത്രവും എല്ലാ വെള്ളിയാഴ്ചയും നിങ്ങളുടെ ഇൻബോക്സിൽ.",
      subtext: "വാമൊഴി പാരമ്പര്യങ്ങളും പണ്ഡിത വ്യാഖ്യാനങ്ങളും കേട്ടു മനസ്സിലാക്കൂ.",
      placeholder: "നിങ്ങളുടെ ഇമെയിൽ വിലാസം നൽകുക...",
      subscribeBtn: "വരിക്കാരാകൂ"
    },
    footer: {
      tagline: "ഭാഷകൾക്കപ്പുറമുള്ള കഥകൾ. ഏവർക്കും പ്രാപ്യമായ ഡിജിറ്റൽ സാംസ്കാരിക ആർക്കൈവ്.",
      navigationHeader: "പ്ലാറ്റ്‌ഫോം",
      curatorialHeader: "നിയമപരവും പൈതൃകപരവുമായ നയങ്ങൾ",
      initiativesHeader: "സാംസ്കാരിക ദൗത്യങ്ങൾ",
      copyright: "© 2026 കഥാബ്രിഡ്ജ്. CC BY-SA 4.0 പ്രകാരമുള്ള സ്വതന്ത്ര സാംസ്കാരിക ട്രസ്റ്റ്.",
      unescoStatement: "യുനെസ്കോ അദൃശ്യ സാംസ്കാരിക പൈതൃക സംരക്ഷണ മാനദണ്ഡങ്ങൾക്കും WCAG 2.1 AAA ആക്സസിബിലിറ്റി നിലവാരത്തിനും അനുസൃതമായി നിർമ്മിച്ചത്."
    }
  }
};

export function getUIText(lang: LanguageCode): TranslationDictionary {
  if (lang === "ML") return UI_TRANSLATIONS.ML;
  return UI_TRANSLATIONS.EN;
}

