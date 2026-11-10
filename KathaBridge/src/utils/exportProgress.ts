/**
 * KathaBridge Folklore Certificate & Progress Export Utility
 * Generates printable cultural completion certificates and reading history exports.
 */

import { StorageService } from "../services/storageService";
import { mockStories } from "../data/mockData";

export interface ReadingSummary {
  totalStoriesRead: number;
  totalStoriesAvailable: number;
  completionPercentage: number;
  favoriteStoryTitles: string[];
  lastReadDate: string;
}

export function getReadingSummary(): ReadingSummary {
  const user = StorageService.getUser();
  const history = user?.readingHistory || [];
  const favorites = StorageService.getFavorites();

  const totalStoriesAvailable = mockStories.length;
  const completedCount = history.filter((h) => h.progressPercentage >= 80).length;
  const pct = Math.round((completedCount / totalStoriesAvailable) * 100);

  const favoriteStoryTitles = favorites
    .map((favId) => mockStories.find((s) => s.id === favId)?.title.EN)
    .filter(Boolean) as string[];

  return {
    totalStoriesRead: completedCount,
    totalStoriesAvailable,
    completionPercentage: pct,
    favoriteStoryTitles,
    lastReadDate: history[0]?.lastReadAt ? new Date(history[0].lastReadAt).toLocaleDateString() : "Today"
  };
}

export function downloadReadingPortfolio(userName: string = "Folklore Explorer"): void {
  const summary = getReadingSummary();
  const payload = {
    title: "KathaBridge Living Heritage Reading Portfolio",
    readerName: userName,
    exportedAt: new Date().toISOString(),
    summary,
    manifesto: "Preserving India's Endangered Oral Folklore with Bilingual Accessibility"
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kathabridge-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

