/**
 * ADAPTIVE EXPERIENCE LAYER — State Model
 *
 * Maps physiological and behavioral signals to interface experience modes.
 * The interface becomes more appropriate for the user's current state —
 * not emotionally reactive, not motivationally framed. Clinically calibrated.
 *
 * Changes are always subtle. No redesigns. No personality shifts.
 * The system adapts silently; the user simply encounters a more fitting interface.
 *
 * Philosophy:
 *   - NOT "the app reacts to your feelings"
 *   - YES "the interface becomes appropriate for your current state"
 *
 * Forbidden:
 *   - Emojis, celebrations, confetti
 *   - Wellness language, fake positivity
 *   - Motivational framing
 *   - Emotional manipulation
 */

// ─── State Taxonomy ───────────────────────────────────────────────────────────

/**
 * Seven experience states, derived from physiological/behavioral signals.
 * Priority order for resolution: depleted → overloaded → fragile → recovering → optimized → focused → stable
 */
export type AdaptiveExperienceState =
  | 'depleted'    // Severely low readiness/recovery. Reduce everything.
  | 'fragile'     // Below-threshold sleep or recovery. Quiet the interface.
  | 'overloaded'  // High stress + multiple active risk predictions. Simplify aggressively.
  | 'recovering'  // Improving trajectory but not yet stable. Support without pressure.
  | 'stable'      // Baseline condition. Standard experience.
  | 'focused'     // High readiness + active momentum. Richer context is appropriate.
  | 'optimized';  // Peak state. Slightly more actionable, slightly more responsive.

// ─── Profile Interfaces ───────────────────────────────────────────────────────

/** Controls how much information surfaces and how densely it is presented */
export interface AdaptiveDensityProfile {
  level: 'minimal' | 'reduced' | 'standard' | 'rich';
  /** Max recommendations to display on the primary surface */
  maxRecommendations: number;
  /** Max insights to render in feeds */
  maxInsights: number;
  /** Max predictions to display */
  maxPredictions: number;
  /** Multiplier for vertical section spacing (1.0 = design system default) */
  spacingScale: number;
  /** Whether to render secondary/contextual cards below the fold */
  showSecondaryCards: boolean;
}

/** Controls CTA and action presentation intensity */
export interface AdaptiveActionProfile {
  /** Visual weight of call-to-action elements */
  intensity: 'passive' | 'quiet' | 'standard' | 'directive';
  /** Whether multiple competing actions can appear simultaneously */
  allowCompetingActions: boolean;
  /** Whether urgency badges (high/medium/low) are displayed */
  showUrgencyBadge: boolean;
  /** Whether impact projection chips are rendered */
  showImpactChips: boolean;
}

/** Controls motion behavior — duration, distance, stagger */
export interface AdaptiveMotionProfile {
  mode: 'still' | 'calm' | 'standard' | 'responsive';
  /** Duration multiplier relative to design system baseline (1.0 = no change) */
  durationScale: number;
  /** Stagger delay between list items in seconds */
  staggerDelay: number;
}

/** Controls text register — verbosity and framing, never tone character */
export interface AdaptiveToneProfile {
  /**
   * Register shifts verbosity, not the fundamental tone.
   * All registers remain: composed, precise, reassuring, intelligent.
   * None are chatty, motivational, or emotional.
   */
  register: 'terse' | 'concise' | 'standard';
  /** Whether to include rationale / "why now" context in cards */
  showRationale: boolean;
  /** Whether to render impact projections and effect windows */
  showImpact: boolean;
}

/** The fully resolved adaptive experience for a given state */
export interface AdaptiveExperienceProfile {
  state: AdaptiveExperienceState;
  density: AdaptiveDensityProfile;
  action: AdaptiveActionProfile;
  motion: AdaptiveMotionProfile;
  tone: AdaptiveToneProfile;
  /**
   * Contextual Focus Mode: activated when critical prediction risk is high.
   * Simplifies the Home surface to only essential context — reduces noise.
   */
  focusModeActive: boolean;
  /**
   * Section breathing room — affects only section separator spacing.
   * Never alters card structure or visual identity.
   */
  sectionBreathing: 'tight' | 'standard' | 'spacious';
}
