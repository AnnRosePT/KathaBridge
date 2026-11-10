export type LanguageCode = "EN" | "ML" | "SA" | "HI" | "TA";

export interface CulturalExpression {
  id: string;
  term: string;
  originalScript: string;
  transliteration: string;
  region: string;
  literalTranslation: string;
  contextualMeaning: string;
  culturalSignificance: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDate?: string;
  audioPronunciationText?: string;
  sourceAttribution?: string;
  sourceUrl?: string;
  license?: string;
}

export interface StorySentence {
  id: string;
  originalText: string;
  translatedText: {
    EN: string;
    ML: string;
  };
  highlightedTermIds?: string[];
}

export interface Story {
  id: string;
  number: string;
  title: {
    EN: string;
    ML: string;
  };
  category: "FOLK_TALES" | "CLASSICAL_LIT" | "PERFORMANCES" | "REGIONAL_ART" | "MUSIC_ORAL" | "FESTIVALS";
  categoryLabel: string;
  originRegion: string;
  originalLanguage: string;
  availableLanguages: LanguageCode[];
  pillTag: string;
  image: string;
  imageBg: string;
  tapeColor: "pink" | "yellow";
  summary: {
    EN: string;
    ML: string;
  };
  sourceAttribution?: string;
  sourceUrl?: string;
  license?: string;
  imageAttribution?: string;
  imageLicense?: string;
  keyConcept: {
    title: string;
    quote: string;
    explanation: string;
  };
  culturalBackground: string;
  readingDurationMinutes: number;
  sentences: StorySentence[];
  culturalExpressions: CulturalExpression[];
  isFeatured?: boolean;
  viewsCount?: number;
  likesCount?: number;
}

export interface SourceReference {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  license: string;
  description: string;
  attributionText: string;
  heritageRole: string;
}

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED";

export interface ReviewItem {
  id: string;
  submissionType: "NEW_STORY" | "EXPRESSION" | "TRANSLATION_CORRECTION" | "CULTURAL_NOTE";
  title: string;
  contributorName: string;
  contributorEmail: string;
  submittedAt: string;
  language: string;
  region: string;
  originalContent: string;
  aiDraftContent?: string;
  reviewedContent: string;
  culturalNotes: string;
  transcriptStatus: ReviewStatus;
  translationStatus: ReviewStatus;
  explanationStatus: ReviewStatus;
  overallStatus: ReviewStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  version: number;
  versionHistory: {
    version: number;
    timestamp: string;
    modifiedBy: string;
    changes: string;
  }[];
}

export interface UserContribution {
  id: string;
  type: "STORY" | "EXPRESSION" | "CORRECTION";
  title: string;
  language: string;
  region: string;
  content: string;
  submittedAt: string;
  status: ReviewStatus;
  reviewerFeedback?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "READER" | "CONTRIBUTOR" | "REVIEWER" | "SCHOLAR";
  avatarInitials: string;
  photoURL?: string;
  authProvider?: "google" | "password" | "phone" | "local";
  favoriteStoryIds: string[];
  readingHistory: {
    storyId: string;
    lastReadAt: string;
    progressPercentage: number;
  }[];
  preferredLanguage: LanguageCode;
  joinedDate: string;
  isRealAuth?: boolean;
}

export interface AccessibilitySettings {
  fontSizeScale: number; // 0.9, 1.0, 1.15, 1.3
  lineSpacing: "normal" | "relaxed" | "loose";
  contrastMode: "normal" | "high-contrast" | "dark" | "sepia";
  isDyslexiaFont: boolean;
  reduceMotion: boolean;
  showCaptions: boolean;
}

