import { Story, CulturalExpression, ReviewItem, SourceReference } from "../types";
import rawGlossary from "./glossary.json";
import rawStories from "./stories.json";
import rawReviewQueue from "./reviewQueue.json";
import rawSources from "./sources.json";

export const mockSources: SourceReference[] = rawSources as SourceReference[];

export const mockCulturalExpressions: CulturalExpression[] = rawGlossary as CulturalExpression[];

export const mockStories: Story[] = rawStories.map((s: any) => {
  const expressions: CulturalExpression[] = (s.culturalExpressionIds || [])
    .map((id: string) => mockCulturalExpressions.find((exp) => exp.id === id))
    .filter(Boolean) as CulturalExpression[];

  return {
    ...s,
    culturalExpressions: expressions
  } as Story;
});

export const mockReviewQueue: ReviewItem[] = rawReviewQueue as ReviewItem[];
export const mockInitialReviewQueue: ReviewItem[] = mockReviewQueue;
