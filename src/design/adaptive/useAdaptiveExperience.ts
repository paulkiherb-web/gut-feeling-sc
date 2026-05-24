/**
 * ADAPTIVE EXPERIENCE LAYER — Primary Hook
 *
 * The main interface for consuming adaptive state in components.
 * Components import only this hook — they never resolve state directly.
 *
 * Provides:
 *   - Full AdaptiveExperienceProfile
 *   - Resolved tone strings
 *   - Adapted motion variants + transitions
 *   - Content filtering functions (recommendations, insights, predictions)
 *   - Section visibility helpers
 *   - Secondary opacity for de-emphasis
 */

import type { Recommendation, Insight, Prediction } from '@/core/store/types/state';
import { useAdaptiveContext } from './AdaptiveContext';
import { resolveTone, shouldShowRecoveryNotice } from './tone/resolveTone';
import {
  adaptRecommendations,
  adaptInsights,
  adaptPredictions,
} from './content/AdaptiveContent';
import {
  shouldShowSection,
  getSecondaryOpacity,
  type SectionType,
} from './layout/AdaptiveDensity';

export function useAdaptiveExperience() {
  const { profile, variants, transitions } = useAdaptiveContext();
  const tone = resolveTone(profile.state);
  const showRecoveryNotice = shouldShowRecoveryNotice(profile.state, profile.tone);

  return {
    // Core profile
    profile,
    state: profile.state,
    density: profile.density,
    action: profile.action,
    motion: profile.motion,
    focusModeActive: profile.focusModeActive,
    sectionBreathing: profile.sectionBreathing,

    // Motion
    variants,
    transitions,

    // Tone
    tone,
    showRecoveryNotice,

    // Content filtering — pass your raw arrays, receive adapted slices
    filterRecommendations: (recs: Recommendation[]) =>
      adaptRecommendations(recs, profile),
    filterInsights: (insights: Insight[]) =>
      adaptInsights(insights, profile),
    filterPredictions: (preds: Prediction[]) =>
      adaptPredictions(preds, profile),

    // Section visibility — true = render, false = suppress
    showSection: (section: SectionType) =>
      shouldShowSection(profile.state, section),

    // Secondary content opacity (1.0 in normal states, reduced in low-load states)
    secondaryOpacity: getSecondaryOpacity(profile.state),
  };
}
