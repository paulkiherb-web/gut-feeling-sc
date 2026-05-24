/**
 * UX CONSTITUTION — Machine-Readable Rule Set
 *
 * Personal State OS · Product Canonization Layer
 *
 * Exports typed rule sets for CTA limits, card limits,
 * hierarchy rules, and interaction permissions.
 * Used for governance audits and contributor tooling.
 */

// ─── CTA Rules ────────────────────────────────────────────────────────────────

export const CTA_RULES = {
  maxPrimaryPerScreen: 1,
  maxSecondaryPerScreen: 2,
  maxPrimaryWordCount: 3,
  mustBeVerbFirst: true,
  forbiddenWords: ['OK', 'Submit', 'Continue', 'Click', 'Here'] as const,
  forbiddenCharacters: ['!', '…'] as const,
} as const;

// ─── Card Rules ───────────────────────────────────────────────────────────────

export const CARD_RULES = {
  maxPrimaryMetrics: 1,
  maxSupportingMetrics: 2,
  maxCTAsPerCard: 1,
  maxStatusIndicators: 1,
  maxBodyLines: 3,
  maxTitleLines: 1,
  nestedCardsAllowed: false,
  decorativeImagesAllowed: false,
} as const;

// ─── Hierarchy Rules ──────────────────────────────────────────────────────────

export const HIERARCHY_RULES = {
  maxHeroElementsPerScreen: 1,
  hierarchyLevels: ['hero', 'support', 'context', 'system'] as const,
  supportMayMatchHeroWeight: false,
  contextMustBeCollapsedByDefault: true,
} as const;

// ─── Navigation Rules ─────────────────────────────────────────────────────────

export const NAVIGATION_RULES = {
  maxBottomNavTabs: 5,
  maxNavLabelWords: 1,
  hamburgerMenuAllowed: false,
  floatingActionButtonAllowed: false,
  hiddenNavigationAllowed: false,
  iconSet: 'lucide-react' as const,
} as const;

// ─── Interaction Rules ────────────────────────────────────────────────────────

export const INTERACTION_RULES = {
  autoPlayMediaAllowed: false,
  hapticOnNonCriticalAllowed: false,
  pushNotificationPromptInFirstSession: false,
  midTaskPromotionAllowed: false,
  hidePrimaryNavBehindGesture: false,
} as const;

// ─── Spacing Token Whitelist ──────────────────────────────────────────────────

/** Only these spacing values (in px) may be used in production UI */
export const CANONICAL_SPACING_PX = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const;
export type CanonicalSpacingPx = (typeof CANONICAL_SPACING_PX)[number];

// ─── CTA State Suppression Map ────────────────────────────────────────────────

import type { AdaptiveExperienceState } from '@/design/adaptive';

export interface CTAStateRule {
  competingCtasAllowed: boolean;
  maxPrimary: number;
  maxSecondary: number;
  urgencyBadgeAllowed: boolean;
  impactChipsAllowed: boolean;
}

export const CTA_BY_STATE: Record<AdaptiveExperienceState, CTAStateRule> = {
  depleted:  { competingCtasAllowed: false, maxPrimary: 1, maxSecondary: 0, urgencyBadgeAllowed: false, impactChipsAllowed: false },
  fragile:   { competingCtasAllowed: false, maxPrimary: 1, maxSecondary: 0, urgencyBadgeAllowed: false, impactChipsAllowed: false },
  overloaded:{ competingCtasAllowed: false, maxPrimary: 1, maxSecondary: 0, urgencyBadgeAllowed: true,  impactChipsAllowed: false },
  recovering:{ competingCtasAllowed: false, maxPrimary: 1, maxSecondary: 1, urgencyBadgeAllowed: true,  impactChipsAllowed: true  },
  stable:    { competingCtasAllowed: true,  maxPrimary: 1, maxSecondary: 2, urgencyBadgeAllowed: true,  impactChipsAllowed: true  },
  focused:   { competingCtasAllowed: true,  maxPrimary: 1, maxSecondary: 2, urgencyBadgeAllowed: true,  impactChipsAllowed: true  },
  optimized: { competingCtasAllowed: true,  maxPrimary: 1, maxSecondary: 2, urgencyBadgeAllowed: true,  impactChipsAllowed: true  },
} as const;

// ─── Forbidden Visual Patterns ────────────────────────────────────────────────

export const FORBIDDEN_VISUAL_PATTERNS = [
  'animated-gradient-surface',
  'glowing-surface',
  'neon-color',
  'oversaturated-ui',
  'nested-cards',
  'looping-decoration-animation',
  'typewriter-text-effect',
  'confetti-or-celebration',
  'hamburger-menu',
  'floating-action-button',
  'dashboard-clutter',
  'badge-overload',
] as const;

export type ForbiddenVisualPattern = (typeof FORBIDDEN_VISUAL_PATTERNS)[number];
