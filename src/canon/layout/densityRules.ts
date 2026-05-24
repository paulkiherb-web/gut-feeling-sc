/**
 * INFORMATION DENSITY RULES — TypeScript Reference
 *
 * Personal State OS · Product Canonization Layer
 *
 * Numeric density constants for use in components and governance checks.
 * These values mirror the Adaptive Experience Layer profiles but are
 * also used independently for density validation.
 */

import type { AdaptiveExperienceState } from '@/design/adaptive';

// ─── Screen Density Limits ────────────────────────────────────────────────────

export const SCREEN_DENSITY_LIMITS = {
  /** Maximum elements claiming attention above the fold */
  maxPrioritiesAboveFold: 3,
  /** Maximum total priorities on a full screen (standard state) */
  maxPrioritiesFullScreen: 5,
  /** Maximum total priorities on a full screen (rich state) */
  maxPrioritiesFullScreenRich: 7,
  /** Max named sections per scrollable screen */
  maxSectionsPerScreen: 5,
  /** Max charts visible simultaneously */
  maxChartsPerScreen: 2,
  /** Max progress bars visible simultaneously */
  maxProgressBarsPerScreen: 3,
  /** Max numeric metrics per screen (standard state) */
  maxNumericMetricsPerScreen: 8,
} as const;

// ─── Card Density Limits ──────────────────────────────────────────────────────

export const CARD_DENSITY_LIMITS = {
  maxNumericMetrics: 3,
  maxTextParagraphs: 2,
  maxIconLabelPairs: 4,
  maxActionLinks: 2,
  maxCharts: 1,
  maxProgressBars: 2,
} as const;

// ─── Spacing Minimums ─────────────────────────────────────────────────────────

/** Minimum spacing values that must never be reduced for density purposes */
export const SPACING_MINIMUMS = {
  horizontalScreenMargin: 16,
  horizontalScreenMarginPreferred: 24,
  betweenCards: 12,
  betweenSections: 24,
  betweenSectionsSpacious: 32,
  cardInternalPadding: 16,
  sectionHeaderToContent: 8,
  bottomNavClearance: 20,
} as const;

// ─── Typography Hierarchy Limits ──────────────────────────────────────────────

export const TYPOGRAPHY_HIERARCHY_LIMITS = {
  maxSimultaneousTypeLevels: 4,
  maxHeroInstances: 1,
  maxTitleInstances: 2,
  maxSectionInstances: 5,
} as const;

// ─── Cards Above Fold by State ────────────────────────────────────────────────

export const MAX_CARDS_ABOVE_FOLD: Record<AdaptiveExperienceState, number> = {
  depleted:   1,
  fragile:    1,
  overloaded: 1,
  recovering: 2,
  stable:     3,
  focused:    3,
  optimized:  3,
} as const;

// ─── Content Limits by Density Level ─────────────────────────────────────────

export interface DensityLimits {
  readonly maxRecommendations: number;
  readonly maxInsights: number;
  readonly maxPredictions: number;
  readonly maxListItemsVisible: number;
  readonly secondaryCardsVisible: boolean;
}

export const DENSITY_LIMITS: Record<'minimal' | 'reduced' | 'standard' | 'rich', DensityLimits> = {
  minimal:  { maxRecommendations: 1, maxInsights: 1, maxPredictions: 1,   maxListItemsVisible: 2, secondaryCardsVisible: false },
  reduced:  { maxRecommendations: 2, maxInsights: 2, maxPredictions: 2,   maxListItemsVisible: 3, secondaryCardsVisible: false },
  standard: { maxRecommendations: 3, maxInsights: 5, maxPredictions: 3,   maxListItemsVisible: 4, secondaryCardsVisible: true  },
  rich:     { maxRecommendations: 4, maxInsights: 6, maxPredictions: 3,   maxListItemsVisible: 4, secondaryCardsVisible: true  },
} as const;
