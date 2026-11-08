import { AccessibilitySettings, ReviewItem, UserContribution, UserProfile } from "../types";
import { mockInitialReviewQueue } from "../data/mockData";

const KEYS = {
  USER: "kathabridge_user_v1",
  FAVORITES: "kathabridge_favorites_v1",
  HISTORY: "kathabridge_history_v1",
  ACCESSIBILITY: "kathabridge_a11y_v1",
  CONTRIBUTIONS: "kathabridge_contributions_v1",
  REVIEW_QUEUE: "kathabridge_reviews_v1",
  LANGUAGE: "kathabridge_lang_v1"
};

const defaultAccessibility: AccessibilitySettings = {
  fontSizeScale: 1.0,
  lineSpacing: "normal",
  contrastMode: "normal",
  isDyslexiaFont: false,
  reduceMotion: false,
  showCaptions: true
};

const defaultDemoUser: UserProfile = {
  id: "user-demo-1",
  name: "Devi Varma",
  email: "devi.varma@heritage.in",
  role: "REVIEWER", // Allows testing reviewer dashboard
  avatarInitials: "DV",
  favoriteStoryIds: ["mahabali"],
  readingHistory: [
    {
      storyId: "mahabali",
      lastReadAt: new Date().toISOString(),
      progressPercentage: 100
    }
  ],
  preferredLanguage: "EN",
  joinedDate: "2024-11-01"
};

export const StorageService = {
  getUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(KEYS.USER);
      if (!data) {
        // Initialize demo user
        this.setUser(defaultDemoUser);
        return defaultDemoUser;
      }
      return JSON.parse(data);
    } catch {
      return defaultDemoUser;
    }
  },

  setUser(user: UserProfile | null) {
    try {
      if (!user) {
        localStorage.removeItem(KEYS.USER);
      } else {
        localStorage.setItem(KEYS.USER, JSON.stringify(user));
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  },

  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(KEYS.FAVORITES);
      return data ? JSON.parse(data) : ["mahabali"];
    } catch {
      return ["mahabali"];
    }
  },

  toggleFavorite(storyId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(storyId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(storyId);
      isFav = true;
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));

    // Update user profile favorites if logged in
    const user = this.getUser();
    if (user) {
      user.favoriteStoryIds = favs;
      this.setUser(user);
    }
    return isFav;
  },

  recordReadingHistory(storyId: string, progressPercentage: number) {
    try {
      const user = this.getUser();
      if (!user) return;
      const existing = user.readingHistory.find((h) => h.storyId === storyId);
      if (existing) {
        existing.lastReadAt = new Date().toISOString();
        existing.progressPercentage = Math.max(existing.progressPercentage, progressPercentage);
      } else {
        user.readingHistory.unshift({
          storyId,
          lastReadAt: new Date().toISOString(),
          progressPercentage
        });
      }
      this.setUser(user);
    } catch (e) {
      console.error("Failed recording history", e);
    }
  },

  getAccessibility(): AccessibilitySettings {
    try {
      const data = localStorage.getItem(KEYS.ACCESSIBILITY);
      return data ? { ...defaultAccessibility, ...JSON.parse(data) } : defaultAccessibility;
    } catch {
      return defaultAccessibility;
    }
  },

  setAccessibility(settings: AccessibilitySettings) {
    try {
      localStorage.setItem(KEYS.ACCESSIBILITY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  getReviewQueue(): ReviewItem[] {
    try {
      const data = localStorage.getItem(KEYS.REVIEW_QUEUE);
      if (!data) {
        localStorage.setItem(KEYS.REVIEW_QUEUE, JSON.stringify(mockInitialReviewQueue));
        return mockInitialReviewQueue;
      }
      return JSON.parse(data);
    } catch {
      return mockInitialReviewQueue;
    }
  },

  saveReviewQueue(items: ReviewItem[]) {
    try {
      localStorage.setItem(KEYS.REVIEW_QUEUE, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  },

  getContributions(): UserContribution[] {
    try {
      const data = localStorage.getItem(KEYS.CONTRIBUTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addContribution(c: Omit<UserContribution, "id" | "submittedAt" | "status">): UserContribution {
    const contributions = this.getContributions();
    const newContrib: UserContribution = {
      ...c,
      id: "contrib-" + Date.now(),
      submittedAt: new Date().toISOString(),
      status: "PENDING"
    };
    contributions.unshift(newContrib);
    localStorage.setItem(KEYS.CONTRIBUTIONS, JSON.stringify(contributions));

    // Also push to Review Queue so the reviewer dashboard sees it immediately!
    const reviewQueue = this.getReviewQueue();
    const newReviewItem: ReviewItem = {
      id: "rev-" + Date.now(),
      submissionType: c.type === "STORY" ? "NEW_STORY" : c.type === "EXPRESSION" ? "EXPRESSION" : "TRANSLATION_CORRECTION",
      title: c.title,
      contributorName: "Community Member",
      contributorEmail: "community@kathabridge.org",
      submittedAt: new Date().toISOString(),
      language: c.language,
      region: c.region,
      originalContent: c.content,
      aiDraftContent: `[AI Draft Generated for review: "${c.title}" in ${c.language}]`,
      reviewedContent: c.content,
      culturalNotes: `Submitted via KathaBridge portal for ${c.region}. Awaiting folklorist verification.`,
      transcriptStatus: "PENDING",
      translationStatus: "PENDING",
      explanationStatus: "PENDING",
      overallStatus: "PENDING",
      version: 1,
      versionHistory: [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          modifiedBy: "Community Submission",
          changes: "Initial user contribution submitted to queue."
        }
      ]
    };
    reviewQueue.unshift(newReviewItem);
    this.saveReviewQueue(reviewQueue);

    return newContrib;
  }
};

