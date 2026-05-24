/**
 * ADAPTIVE EXPERIENCE LAYER — State Resolver
 *
 * Converts a StateSnapshot into an AdaptiveExperienceProfile.
 *
 * Resolution priority (highest urgency evaluated first):
 *   depleted → overloaded → fragile → recovering → optimized → focused → stable
 *
 * Thresholds use conservative margins — the system does not over-react
 * to transient fluctuations. Only sustained signal patterns trigger transitions.
 */

import type { StateSnapshot } from '@/core/store/types/state';
import type {
  AdaptiveExperienceProfile,
  AdaptiveExperienceState,
} from './AdaptiveStateModel';

// ─── Static Profiles ──────────────────────────────────────────────────────────

const PROFILES: Record<AdaptiveExperienceState, AdaptiveExperienceProfile> = {
  depleted: {
    state: 'depleted',
    density: {
      level: 'minimal',
      maxRecommendations: 1,
      maxInsights: 1,
      maxPredictions: 1,
      spacingScale: 1.25,
      showSecondaryCards: false,
    },
    action: {
      intensity: 'passive',
      allowCompetingActions: false,
      showUrgencyBadge: false,
      showImpactChips: false,
    },
    motion: { mode: 'still', durationScale: 1.6, staggerDelay: 0.10 },
    tone: { register: 'terse', showRationale: false, showImpact: false },
    focusModeActive: false,
    sectionBreathing: 'spacious',
  },

  fragile: {
    state: 'fragile',
    density: {
      level: 'reduced',
      maxRecommendations: 1,
      maxInsights: 2,
      maxPredictions: 1,
      spacingScale: 1.15,
      showSecondaryCards: false,
    },
    action: {
      intensity: 'quiet',
      allowCompetingActions: false,
      showUrgencyBadge: false,
      showImpactChips: false,
    },
    motion: { mode: 'calm', durationScale: 1.4, staggerDelay: 0.09 },
    tone: { register: 'concise', showRationale: false, showImpact: false },
    focusModeActive: false,
    sectionBreathing: 'spacious',
  },

  overloaded: {
    state: 'overloaded',
    density: {
      level: 'minimal',
      maxRecommendations: 1,
      maxInsights: 1,
      maxPredictions: 2,
      spacingScale: 1.2,
      showSecondaryCards: false,
    },
    action: {
      intensity: 'quiet',
      allowCompetingActions: false,
      showUrgencyBadge: true,
      showImpactChips: false,
    },
    motion: { mode: 'calm', durationScale: 1.3, staggerDelay: 0.08 },
    tone: { register: 'terse', showRationale: true, showImpact: false },
    focusModeActive: true,
    sectionBreathing: 'spacious',
  },

  recovering: {
    state: 'recovering',
    density: {
      level: 'reduced',
      maxRecommendations: 2,
      maxInsights: 2,
      maxPredictions: 2,
      spacingScale: 1.1,
      showSecondaryCards: true,
    },
    action: {
      intensity: 'quiet',
      allowCompetingActions: false,
      showUrgencyBadge: true,
      showImpactChips: true,
    },
    motion: { mode: 'calm', durationScale: 1.2, staggerDelay: 0.07 },
    tone: { register: 'concise', showRationale: true, showImpact: true },
    focusModeActive: false,
    sectionBreathing: 'standard',
  },

  stable: {
    state: 'stable',
    density: {
      level: 'standard',
      maxRecommendations: 3,
      maxInsights: 4,
      maxPredictions: 2,
      spacingScale: 1.0,
      showSecondaryCards: true,
    },
    action: {
      intensity: 'standard',
      allowCompetingActions: true,
      showUrgencyBadge: true,
      showImpactChips: true,
    },
    motion: { mode: 'standard', durationScale: 1.0, staggerDelay: 0.06 },
    tone: { register: 'standard', showRationale: true, showImpact: true },
    focusModeActive: false,
    sectionBreathing: 'standard',
  },

  focused: {
    state: 'focused',
    density: {
      level: 'standard',
      maxRecommendations: 3,
      maxInsights: 5,
      maxPredictions: 3,
      spacingScale: 1.0,
      showSecondaryCards: true,
    },
    action: {
      intensity: 'standard',
      allowCompetingActions: true,
      showUrgencyBadge: true,
      showImpactChips: true,
    },
    motion: { mode: 'standard', durationScale: 1.0, staggerDelay: 0.05 },
    tone: { register: 'standard', showRationale: true, showImpact: true },
    focusModeActive: false,
    sectionBreathing: 'standard',
  },

  optimized: {
    state: 'optimized',
    density: {
      level: 'rich',
      maxRecommendations: 4,
      maxInsights: 6,
      maxPredictions: 3,
      spacingScale: 1.0,
      showSecondaryCards: true,
    },
    action: {
      intensity: 'directive',
      allowCompetingActions: true,
      showUrgencyBadge: true,
      showImpactChips: true,
    },
    motion: { mode: 'responsive', durationScale: 0.85, staggerDelay: 0.045 },
    tone: { register: 'standard', showRationale: true, showImpact: true },
    focusModeActive: false,
    sectionBreathing: 'tight',
  },
};

// ─── Resolution Logic ─────────────────────────────────────────────────────────

/**
 * Resolves a StateSnapshot into an AdaptiveExperienceProfile.
 *
 * When snapshot is null (no data yet), returns the stable baseline profile.
 * States are evaluated in priority order; the first matching condition wins.
 */
export function resolveAdaptiveState(
  snapshot: StateSnapshot | null,
): AdaptiveExperienceProfile {
  if (!snapshot) {
    return { ...PROFILES.stable };
  }

  const { scores, recovery, sleep, predictions, trajectory } = snapshot;
  const stressLoad = recovery.stressLoad ?? 0;
  const highRisks = predictions.filter(p => p.riskLevel === 'high').length;
  const moderateRisks = predictions.filter(p => p.riskLevel === 'moderate').length;
  const weightedRiskLoad = highRisks * 1.0 + moderateRisks * 0.5;

  // Priority resolution — highest urgency evaluated first
  let state: AdaptiveExperienceState;

  if (scores.readiness < 30 || (scores.recovery < 30 && sleep.quality < 40)) {
    state = 'depleted';
  } else if (stressLoad > 75 || weightedRiskLoad >= 2.5) {
    state = 'overloaded';
  } else if (scores.readiness < 45 && (sleep.quality < 55 || stressLoad > 60)) {
    state = 'fragile';
  } else if (scores.readiness < 60 && trajectory.direction === 'improving') {
    state = 'recovering';
  } else if (
    scores.readiness >= 85 &&
    trajectory.direction === 'improving' &&
    trajectory.momentum !== 'weak'
  ) {
    state = 'optimized';
  } else if (scores.readiness >= 75 && trajectory.momentum !== 'weak') {
    state = 'focused';
  } else {
    state = 'stable';
  }

  // Contextual focus mode: activate when risk load is critical
  // independent of base state (e.g., a "stable" user can have high risk predictions)
  const focusModeActive =
    PROFILES[state].focusModeActive ||
    highRisks >= 2 ||
    (highRisks >= 1 && scores.readiness < 50);

  return { ...PROFILES[state], focusModeActive };
}

/** Static profile map — useful for testing and documentation */
export { PROFILES as adaptiveProfiles };
