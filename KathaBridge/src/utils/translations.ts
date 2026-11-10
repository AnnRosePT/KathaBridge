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

export const UI_TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
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
  },
  SA: {
    nav: {
      home: "गृहम्",
      stories: "कथाः",
      explore: "अन्वेषणम्",
      about: "परिचयः",
      contribute: "योगदानम्",
      tagline: "भाषाभ्यः परे कथाः",
      reviewQueue: "विद्वत्-समीक्षा",
      accessibility: "सुलभता"
    },
    hero: {
      badge: "[ ०१ / सांस्कृतिक-संग्रहालयः ]",
      title: "भाषाभ्यः परे कथाः.",
      subtitle:
        "मौखिकपरम्पराणां प्रादेशिकलोककथानां च जीवन्तसंस्कृतेः सार्थकमन्वेषणम्। शाब्दिकानुवादमतिक्रम्य गम्भीरभावसंरक्षणम्।",
      exploreBtn: "कथाः पश्यन्तु",
      listenBtn: "प्रस्तावनां शृण्वन्तु",
      ticker:
        "कथाब्रीड्ज् // भाषाभ्यः परे कथाः // सर्वेभ्यः समाना सांस्कृतिकसुलभता // मौखिकपरम्परासंरक्षणम् // युनेस्को-मान्यतानुसृतम्"
    },
    storiesSection: {
      badge: "[ ०२ / कथासंग्रहः ]",
      heading: "कालातीताः सांस्कृतिककथाः।",
      searchPlaceholder: "कथाः पदानि वा अन्विषन्तु...",
      sortShortest: "लघुतम-वाचनकालः",
      sortPopular: "अतिलोकप्रियम्",
      sortDefault: "मूलक्रमः",
      languageLabel: "भाषा:",
      allLang: "सर्वाणि",
      malayalamLang: "मलयाळम्",
      sanskritLang: "संस्कृतम्",
      showingStories: "कथाः उपलभ्यन्ते",
      readStory: "कथां पठन्तु →",
      readTime: "निमेषाः • श्रवणम्",
      keyConceptLabel: "मुख्यभावः:",
      noStories: "भवता चितवर्गे कथा न प्राप्ता।"
    },
    categoriesSection: {
      badge: "[ ०३ / सांस्कृतिकविभागाः ]",
      heading: "भारतस्य विविधाः सांस्कृतिकस्वराः।",
      totalArchived: "आहत्य उपलभ्यमानाः वर्गाः:",
      modesCount: "६ सांस्कृतिकशाखाः",
      folkLoreTitle: "केरळ-लोककथाः",
      folkLoreDesc: "महाबलिमहाराजस्य न्यायरूपशासनं सामरस्यपूर्णं च जीवनम्।",
      classicalTitle: "प्राचीन-नीतिकथाः",
      classicalDesc: "पञ्चतन्त्रस्य नीतिबोधाः उपदेशाश्च।",
      theatreTitle: "अनुष्ठान-नाट्यपरम्परा",
      theatreDesc: "उत्तरकेरलस्य तेय्यम्, कूटियाट्टं संस्कृतनाट्यं, मुडियेत्तु च।",
      craftsTitle: "पारम्परिकशिल्पकला",
      craftsDesc: "आरन्मुळ-दर्पणनिर्माणम्, कासव-वस्त्राणि, भित्तिचित्राणि च।",
      balladsTitle: "मौखिकगीतानि",
      balladsDesc: "वीरगाथाः, तोट्टम्-स्तोत्राणि, ओणम्-ऋतुगीतानि च।",
      festivalsTitle: "उत्सवपरम्परा",
      festivalsDesc: "ओण-पुष्पवृष्टयः, तृश्शूर्-पुलिक्कलि, ग्रामोत्सवाश्च।"
    },
    meaningSection: {
      badge: "[ ०४ / शब्देभ्यः परं भावः ]",
      heading: "अक्षराभ्यः परं गम्भीरार्थः।",
      subtext:
        "केवलं शाब्दिकानुवादः सांस्कृतिकसौन्दर्यं नाशयति। अत्र विदुषां साहाय्येन सांस्कृतिकव्याख्यानं प्रदीयते।",
      exploreGlossaryBtn: "शब्दावलीं पश्यन्तु →",
      verifiedScholarshipBadge: "विद्वत्-प्रमाणितम्",
      literalLabel: "वाच्यार्थः:",
      contextLabel: "सान्दर्भिकार्थः:",
      significanceLabel: "सांस्कृतिकमहत्त्वम्:"
    },
    communitySection: {
      badge: "[ ०५ / सांस्कृतिकमेलनम् ]",
      heading: "प्रत्येकसंस्कृतेः एका कथा अस्ति। स्वकथां समर्पयन्तु।",
      subtext:
        "मौखिककथाः प्रादेशिकप्रयोगांश्च प्रेषयन्तु। सर्वाणि विदुषां परिशीलनानन्तरमेव प्रकाश्यन्ते।",
      submitStoryBtn: "कथां प्रेषयन्तु",
      reviewQueueBtn: "समीक्षा-कार्यस्थानम्"
    },
    newsletter: {
      badge: "साप्ताहिक-सांस्कृतिकपत्रम्",
      heading: "प्रतिशुक्रवासरं संस्कृतेः कथाः प्राप्नुवन्तु।",
      subtext: "मौखिकपरम्पराः विद्वत्-टिप्पणीश्च पठन्तु।",
      placeholder: "ईमेल्-सङ्केतं लिखन्तु...",
      subscribeBtn: "सदस्यतां प्राप्नुवन्तु"
    },
    footer: {
      tagline: "भाषाभ्यः परे कथाः। सर्वेभ्यः सुगमः डिजिटल-सांस्कृतिकसंग्रहः।",
      navigationHeader: "मञ्चः",
      curatorialHeader: "नीतिनियमाः",
      initiativesHeader: "सांस्कृतिकप्रकल्पाः",
      copyright: "© २०२६ कथाब्रीड्ज्। CC BY-SA 4.0 मुक्तरहस्यम्।",
      unescoStatement: "युनेस्को-अमूर्तसांस्कृतिकदायसंरक्षण-मान्यतानुसारं निर्मितम्।"
    }
  },
  HI: {
    nav: {
      home: "होम",
      stories: "कहानियाँ",
      explore: "अन्वेषण",
      about: "हमारे बारे में",
      contribute: "योगदान करें",
      tagline: "भाषा से परे कहानियाँ",
      reviewQueue: "समीक्षा कतार",
      accessibility: "सुलभता"
    },
    hero: {
      badge: "[ 01 / सांस्कृतिक संग्रह ]",
      title: "भाषा से परे कहानियाँ.",
      subtitle:
        "मौखिक इतिहास, क्षेत्रीय लोककथाओं और जीवंत सांस्कृतिक परंपराओं को उनके मूल संदर्भ के साथ समझने का खुला डिजिटल मंच। केवल शाब्दिक अनुवाद नहीं, बल्कि सांस्कृतिक गहराई का संरक्षण।",
      exploreBtn: "कहानियाँ देखें",
      listenBtn: "प्रस्तावना सुनें",
      ticker:
        "कथाब्रिज // भाषा से परे कहानियाँ // सभी के लिए सांस्कृतिक सुलभता // मौखिक परंपराओं का संरक्षण // यूनेस्को विरासत मानकों के अनुरूप"
    },
    storiesSection: {
      badge: "[ 02 / मुख्य कथा संग्रह ]",
      heading: "समय से परे यात्रा करती कहानियाँ।",
      searchPlaceholder: "कहानियाँ या शब्द खोजें...",
      sortShortest: "कम पढ़ने का समय",
      sortPopular: "सबसे लोकप्रिय",
      sortDefault: "सामान्य क्रम",
      languageLabel: "भाषा:",
      allLang: "सभी",
      malayalamLang: "मलयालम",
      sanskritLang: "संस्कृत",
      showingStories: "कहानियाँ उपलब्ध हैं",
      readStory: "कहानी पढ़ें →",
      readTime: "मिनट पढ़ना • ऑडियो",
      keyConceptLabel: "मुख्य अवधारणा:",
      noStories: "आपके खोज मानदंडों के अनुसार कोई कहानी नहीं मिली।"
    },
    categoriesSection: {
      badge: "[ 03 / सांस्कृतिक श्रेणियाँ ]",
      heading: "भारत के विविध सांस्कृतिक स्वर।",
      totalArchived: "कुल उपलब्ध श्रेणियाँ:",
      modesCount: "6 सांस्कृतिक शाखाएँ",
      folkLoreTitle: "केरल लोककथाएँ",
      folkLoreDesc: "राजा महाबली का न्यायप्रिय शासन, समानता और समृद्धि की अमर गाथाएँ।",
      classicalTitle: "प्राचीन नीति कथाएँ",
      classicalDesc: "पंचतंत्र की नैतिक और बुद्धिमत्ता से भरी कालजयी कहानियाँ।",
      theatreTitle: "अनुष्ठानिक नाट्य परंपरा",
      theatreDesc: "उत्तर मालाबार का थेय्यम, कूडियाट्टम संस्कृत रंगमंच और मुडियेट्टू।",
      craftsTitle: "पारंपरिक हस्तशिल्प",
      craftsDesc: "आरनमुला दर्पण निर्माण, पारंपरिक हथकरघा और भित्ति चित्रकला।",
      balladsTitle: "मौखिक लोकगीत",
      balladsDesc: "वडक्कन पट्टुकल वीरगाथाएँ, थोट्टम स्तुतिगान और ओणम लोकगीत।",
      festivalsTitle: "उत्सव परंपरा",
      festivalsDesc: "ओणम पूक्कलम, त्रिशूर पुलिककली और पारंपरिक जनोत्सव।"
    },
    meaningSection: {
      badge: "[ 04 / शब्दों के पीछे का भाव ]",
      heading: "शाब्दिक अनुवाद से परे गहरा अर्थ।",
      subtext:
        "सिर्फ शाब्दिक अनुवाद अक्सर मूल सांस्कृतिक सार को खो देता है। यहाँ विद्वानों द्वारा प्रमाणित सांस्कृतिक व्याख्या उपलब्ध है।",
      exploreGlossaryBtn: "शब्दावली देखें →",
      verifiedScholarshipBadge: "विद्वानों द्वारा प्रमाणित",
      literalLabel: "शाब्दिक अर्थ:",
      contextLabel: "सांस्कृतिक संदर्भ:",
      significanceLabel: "सांस्कृतिक महत्व:"
    },
    communitySection: {
      badge: "[ 05 / सामुदायिक मंच ]",
      heading: "हर संस्कृति की एक कहानी है। अपनी कहानी साझा करें।",
      subtext:
        "मौखिक कहानियाँ और स्थानीय मुहावरे साझा करें। सभी प्रस्तुतियाँ प्रकाशन से पहले विद्वानों द्वारा जाँची जाती हैं।",
      submitStoryBtn: "कहानी सबमिट करें",
      reviewQueueBtn: "विद्वान समीक्षा केंद्र"
    },
    newsletter: {
      badge: "साप्ताहिक सांस्कृतिक पत्रिका",
      heading: "मौखिक कहानियाँ हर शुक्रवार आपके इनबॉक्स में।",
      subtext: "प्रामाणिक अनुवाद, विद्वान टिप्पणियाँ और लोक ऑडियो संग्रह सुनें।",
      placeholder: "अपना ईमेल दर्ज करें...",
      subscribeBtn: "सब्सक्राइब करें"
    },
    footer: {
      tagline: "भाषा से परे कहानियाँ। सुलभ डिजिटल सांस्कृतिक विरासत संग्रह।",
      navigationHeader: "प्लेटफ़ॉर्म",
      curatorialHeader: "नीति एवं कानूनी",
      initiativesHeader: "सांस्कृतिक पहल",
      copyright: "© 2026 कथाब्रिज। CC BY-SA 4.0 खुला सांस्कृतिक ट्रस्ट।",
      unescoStatement: "यूनेस्को अमूर्त सांस्कृतिक विरासत संरक्षण और WCAG 2.1 AAA मानकों के अनुसार निर्मित।"
    }
  },
  TA: {
    nav: {
      home: "முகப்பு",
      stories: "கதைகள்",
      explore: "ஆராய்க",
      about: "பற்றி",
      contribute: "பங்களிப்பு",
      tagline: "மொழிகளுக்கு அப்பாற்பட்ட கதைகள்",
      reviewQueue: "ஆய்வு வரிசை",
      accessibility: "அணுகல்தன்மை"
    },
    hero: {
      badge: "[ 01 / கலாச்சார காப்பகம் ]",
      title: "மொழிகளுக்கு அப்பாற்பட்ட கதைகள்.",
      subtitle: "வாய்மொழி வரலாறுகள் மற்றும் பிராந்திய பாரம்பரியங்களை ஆழமான கலாச்சார அர்த்தத்துடன் புரிந்துகொள்ளும் தளம்.",
      exploreBtn: "கதைகளை காண்க",
      listenBtn: "அறிமுகம் கேட்கவும்",
      ticker: "கதாபிரிட்ஜ் // மொழிகளுக்கு அப்பாற்பட்ட கதைகள் // யுனெஸ்கோ பாரம்பரிய நெறிமுறைகள்"
    },
    storiesSection: {
      badge: "[ 02 / கதைத் தொகுப்பு ]",
      heading: "காலத்தைக் கடந்த கதைகள்.",
      searchPlaceholder: "கதைகள் அல்லது சொற்களைத் தேடுங்கள்...",
      sortShortest: "குறைந்த வாசிப்பு நேரம்",
      sortPopular: "மிகவும் பிரபலமானவை",
      sortDefault: "இயல்பு நிலை",
      languageLabel: "மொழி:",
      allLang: "அனைத்தும்",
      malayalamLang: "மலையாளம்",
      sanskritLang: "சமஸ்கிருதம்",
      showingStories: "கதைகள் உள்ளன",
      readStory: "கதை வாசிக்க →",
      readTime: "நிமிடம் வாசிப்பு",
      keyConceptLabel: "முக்கிய கருத்து:",
      noStories: "கதைகள் எதுவும் கிடைக்கவில்லை."
    },
    categoriesSection: {
      badge: "[ 03 / வகைகள் ]",
      heading: "இந்தியாவின் கலாச்சாரக் குரல்கள்.",
      totalArchived: "மொத்த வகைகள்:",
      modesCount: "6 கலாச்சாரப் பிரிவுகள்",
      folkLoreTitle: "நாட்டுப்புறக் கதைகள்",
      folkLoreDesc: "மகாபலி மன்னனின் நீதி மற்றும் சமத்துவ ஆட்சி.",
      classicalTitle: "பழங்கால நீதிக் கதைகள்",
      classicalDesc: "பஞ்சதந்திரக் கதைகள் மற்றும் அறநெறி போதனைகள்.",
      theatreTitle: "சடங்கு அரங்க கலைகள்",
      theatreDesc: "தெய்யம், கூடியாட்டம் மற்றும் பாரம்பரிய கலைகள்.",
      craftsTitle: "பாரம்பரிய கைவினைப் பொருட்கள்",
      craftsDesc: "ஆறன்முள கண்ணாடி, கைத்தறி மற்றும் சுவரோவியங்கள்.",
      balladsTitle: "வாய்மொழிப் பாடல்கள்",
      balladsDesc: "வீரக்காவியங்கள் மற்றும் பாரம்பரிய பாடல்கள்.",
      festivalsTitle: "திருவிழா பாரம்பரியம்",
      festivalsDesc: "ஓணப் பூக்கோலம் மற்றும் திருவிழாக்கள்."
    },
    meaningSection: {
      badge: "[ 04 / வார்த்தைகளுக்கு அப்பால் ]",
      heading: "சொற்களுக்கு அப்பாற்பட்ட ஆழமான பொருள்.",
      subtext: "நேரடி மொழிபெயர்ப்பு கலாச்சார சாரத்தை இழக்கக்கூடும். அறிஞர்களின் விளக்கங்கள் இங்கே கிடைக்கின்றன.",
      exploreGlossaryBtn: "அகராதியைக் காண்க →",
      verifiedScholarshipBadge: "சான்றளிக்கப்பட்ட ஆய்வு",
      literalLabel: "நேரடிப் பொருள்:",
      contextLabel: "கலாச்சார சூழல்:",
      significanceLabel: "கலாச்சார முக்கியத்துவம்:"
    },
    communitySection: {
      badge: "[ 05 / சமூகப் பகிர்வு ]",
      heading: "ஒவ்வொரு கலாச்சாரத்திற்கும் ஒரு கதை உண்டு. உங்கள் கதையைப் பகிருங்கள்.",
      subtext: "வாய்மொழிக் கதைகளைப் பகிருங்கள். அனைத்துக் கதைகளும் ஆய்வு செய்யப்பட்ட பின்னரே வெளியிடப்படும்.",
      submitStoryBtn: "கதை சமர்ப்பிக்கவும்",
      reviewQueueBtn: "ஆய்வாளர் பணித்தளம்"
    },
    newsletter: {
      badge: "வாராந்திர கலாச்சார இதழ்",
      heading: "கலாச்சாரக் கதைகள் ஒவ்வொரு வெள்ளிக்கிழமையும் உங்கள் மின்னஞ்சலில்.",
      subtext: "வாய்மொழி மரபுகள் மற்றும் ஆய்வுக் குறிப்புகளைப் படியுங்கள்.",
      placeholder: "உங்கள் மின்னஞ்சலை உள்ளிடவும்...",
      subscribeBtn: "பதிவு செய்க"
    },
    footer: {
      tagline: "மொழிகளுக்கு அப்பாற்பட்ட கதைகள். டிஜிட்டல் கலாச்சாரக் காப்பகம்.",
      navigationHeader: "தளம்",
      curatorialHeader: "கொள்கைகள்",
      initiativesHeader: "திட்டங்கள்",
      copyright: "© 2026 கதாபிரிட்ஜ். CC BY-SA 4.0 உரிமை.",
      unescoStatement: "யுனெஸ்கோ கலாச்சார பாரம்பரிய வழிகாட்டுதல்களின்படி உருவாக்கப்பட்டது."
    }
  }
};

export function getUIText(lang: LanguageCode): TranslationDictionary {
  if (lang === "ML") return UI_TRANSLATIONS.ML;
  if (lang === "SA") return UI_TRANSLATIONS.SA;
  if (lang === "HI") return UI_TRANSLATIONS.HI;
  if (lang === "TA") return UI_TRANSLATIONS.TA;
  return UI_TRANSLATIONS.EN;
}
