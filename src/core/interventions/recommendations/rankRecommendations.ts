import type { Recommendation } from '../../store/types/state';
import { type ScoringContext, scoreRecommendation } from './scoreRecommendation';

/** Max 2 recommendations of the same category before diversifying */
const MAX_PER_CATEGORY = 2;

/**
 * Rank recommendations using the learned scoring model.
 *
 * Strategy:
 * 1. Filter out snoozed items (snoozedUntil in the future)
 * 2. Score every item with scoreRecommendation()
 * 3. Sort descending by composite score
 * 4. Diversify: cap same-category items at MAX_PER_CATEGORY, extras appended at the end
 *
 * Result: highest leverage × highest execution probability × best contextual fit
 */
export const rankRecommendations = (
  recommendations: Recommendation[],
  context: ScoringContext,
): Recommendation[] => {
  if (!recommendations.length) return [];

  const now = new Date().toISOString();

  // 1. Filter snoozed
  const active = recommendations.filter((rec) => {
    const snoozedUntil = (rec as { snoozedUntil?: string }).snoozedUntil;
    return !snoozedUntil || snoozedUntil < now;
  });

  // 2. Score
  const scored = active.map((rec) => ({
    rec,
    score: scoreRecommendation(rec, context),
  }));

  // 3. Sort descending
  scored.sort((a, b) => b.score - a.score);

  // 4. Diversify: first pass collects up to MAX_PER_CATEGORY per category
  const categoryCount = new Map<string, number>();
  const primary: typeof scored = [];
  const overflow: typeof scored = [];

  for (const item of scored) {
    const cat = item.rec.category;
    const count = categoryCount.get(cat) ?? 0;
    if (count < MAX_PER_CATEGORY) {
      primary.push(item);
      categoryCount.set(cat, count + 1);
    } else {
      overflow.push(item);
    }
  }

  return [...primary, ...overflow].map(({ rec, score }) => ({
    ...rec,
    compositeScore: score,
  }));
};
