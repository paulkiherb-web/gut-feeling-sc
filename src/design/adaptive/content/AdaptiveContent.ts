/**
 * ADAPTIVE EXPERIENCE LAYER — Content Filtering
 *
 * Filters and prioritizes content collections based on the current
 * adaptive profile. When cognitive load must be reduced, only the most
 * relevant items surface — without modifying the underlying data model.
 *
 * Priority logic per state:
 *   depleted/overloaded: recovery/sleep recommendations first
 *   fragile:             risk insights first
 *   recovering:          standard order, clamped to reduced count
 *   stable/focused/optimized: standard order, standard or rich count
 */

import type { Recommendation, Insight, Prediction } from '@/core/store/types/state';
import type { AdaptiveExperienceProfile } from '../state/AdaptiveStateModel';
import { clampList } from '../layout/AdaptiveDensity';

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Returns the subset of recommendations appropriate for the current state.
 *
 * When cognitive load is high (depleted / overloaded):
 *   - Recovery and sleep recommendations are surfaced first
 *   - All others are suppressed beyond the maximum count
 *
 * The underlying recommendation list is never mutated.
 */
export function adaptRecommendations(
  recommendations: Recommendation[],
  profile: AdaptiveExperienceProfile,
): Recommendation[] {
  const max = profile.density.maxRecommendations;

  if (profile.state === 'depleted' || profile.state === 'overloaded') {
    const priority = recommendations.filter(
      r => r.category === 'recovery' || r.category === 'sleep',
    );
    const rest = recommendations.filter(
      r => r.category !== 'recovery' && r.category !== 'sleep',
    );
    return clampList([...priority, ...rest], max);
  }

  return clampList(recommendations, max);
}

// ─── Insights ─────────────────────────────────────────────────────────────────

/**
 * Returns the subset of insights appropriate for the current state.
 *
 * When state is depleted or fragile:
 *   - Risk insights are surfaced first
 *   - Win and pattern insights are suppressed at the limit
 */
export function adaptInsights(
  insights: Insight[],
  profile: AdaptiveExperienceProfile,
): Insight[] {
  const max = profile.density.maxInsights;

  if (profile.state === 'depleted' || profile.state === 'fragile') {
    const risk = insights.filter(i => i.kind === 'risk');
    const rest = insights.filter(i => i.kind !== 'risk');
    return clampList([...risk, ...rest], max);
  }

  return clampList(insights, max);
}

// ─── Predictions ──────────────────────────────────────────────────────────────

/**
 * Returns the subset of predictions appropriate for the current state.
 *
 * Low-risk predictions are always suppressed — they add noise without value.
 * High-risk predictions are always shown (up to maxPredictions).
 */
export function adaptPredictions(
  predictions: Prediction[],
  profile: AdaptiveExperienceProfile,
): Prediction[] {
  const max = profile.density.maxPredictions;
  const active = predictions.filter(p => p.riskLevel !== 'low');

  // In focus mode, only high-risk predictions survive
  if (profile.focusModeActive) {
    const critical = active.filter(p => p.riskLevel === 'high');
    return clampList(critical.length > 0 ? critical : active, max);
  }

  return clampList(active, max);
}
