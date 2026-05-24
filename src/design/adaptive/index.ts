/**
 * ADAPTIVE EXPERIENCE LAYER
 *
 * Barrel export for the adaptive layer.
 * Everything a component needs is available from this single import path.
 *
 * @example
 *   import { useAdaptiveExperience, AdaptiveSurfaceLayer, AdaptiveExperienceProvider } from '@/design/adaptive';
 */

// ─── State Model ──────────────────────────────────────────────────────────────
export type {
  AdaptiveExperienceState,
  AdaptiveDensityProfile,
  AdaptiveActionProfile,
  AdaptiveMotionProfile,
  AdaptiveToneProfile,
  AdaptiveExperienceProfile,
} from './state/AdaptiveStateModel';

export {
  resolveAdaptiveState,
  adaptiveProfiles,
} from './state/resolveAdaptiveState';

// ─── Tone ─────────────────────────────────────────────────────────────────────
export type { ToneStrings } from './tone/resolveTone';
export { resolveTone, shouldShowRecoveryNotice } from './tone/resolveTone';

// ─── Layout / Density ─────────────────────────────────────────────────────────
export type { SectionType } from './layout/AdaptiveDensity';
export {
  clampList,
  getSectionGapClass,
  getSecondaryOpacity,
  shouldShowSection,
} from './layout/AdaptiveDensity';

// ─── Content Filtering ────────────────────────────────────────────────────────
export {
  adaptRecommendations,
  adaptInsights,
  adaptPredictions,
} from './content/AdaptiveContent';

// ─── Motion ───────────────────────────────────────────────────────────────────
export {
  resolveAdaptiveTransitions,
  resolveAdaptiveVariants,
} from './motion/AdaptiveMotion';

// ─── Context ──────────────────────────────────────────────────────────────────
export type { AdaptiveContextValue } from './AdaptiveContext';
export {
  AdaptiveExperienceProvider,
  useAdaptiveContext,
} from './AdaptiveContext';

// ─── Surface Layer ────────────────────────────────────────────────────────────
export { AdaptiveSurfaceLayer } from './AdaptiveSurfaceLayer';

// ─── Primary Hook ─────────────────────────────────────────────────────────────
export { useAdaptiveExperience } from './useAdaptiveExperience';
