/**
 * ADAPTIVE EXPERIENCE LAYER — Density System
 *
 * Density changes are always subtle:
 *   - Spacing: minor scale adjustments only (max +25%)
 *   - Information count: fewer items, not zero items
 *   - Section visibility: optional sections suppressed, core sections always shown
 *
 * What is NEVER changed:
 *   - Card structure or layout
 *   - Visual identity or brand
 *   - Typography scale or font choices
 *   - Color system
 */

import type { AdaptiveExperienceState } from '../state/AdaptiveStateModel';

// ─── List Clamping ────────────────────────────────────────────────────────────

/**
 * Clamps a list to the adaptive maximum for a given slot.
 * When density is reduced, fewer items surface — reducing cognitive load
 * without removing data from the underlying model.
 */
export function clampList<T>(items: T[], max: number): T[] {
  return items.slice(0, max);
}

// ─── Section Gap ──────────────────────────────────────────────────────────────

/**
 * Returns the Tailwind space-y class for the given spacing scale.
 * Applied to the container of Home page sections — not to individual cards.
 */
export function getSectionGapClass(spacingScale: number): string {
  if (spacingScale >= 1.2) return 'space-y-4';
  if (spacingScale >= 1.1) return 'space-y-3.5';
  return 'space-y-3';
}

// ─── Secondary Content Opacity ────────────────────────────────────────────────

/**
 * Returns the opacity for secondary/contextual content.
 * When depleted or fragile, secondary cards are visually quieter —
 * not hidden, but subtly de-emphasized.
 */
export function getSecondaryOpacity(state: AdaptiveExperienceState): number {
  switch (state) {
    case 'depleted':   return 0.65;
    case 'fragile':    return 0.75;
    case 'overloaded': return 0.72;
    case 'recovering': return 0.88;
    default:           return 1.0;
  }
}

// ─── Section Visibility ───────────────────────────────────────────────────────

/** Sections that can be conditionally suppressed by the adaptive layer */
export type SectionType =
  | 'timeline'     // Today's event timeline — contextual, not critical
  | 'insights'     // Behavioral insight feed — analytical, not urgent
  | 'momentum'     // Daily momentum card — motivational signal
  | 'trajectory'   // Recovery trajectory — always relevant
  | 'secondary';   // Any other below-fold section

/**
 * Returns whether a given section should be rendered in the current state.
 *
 * Core sections (StateHeroCard, NextBestActionCard, PredictionWarningsCard)
 * are NEVER suppressed — only optional/secondary sections are gated.
 */
export function shouldShowSection(
  state: AdaptiveExperienceState,
  sectionType: SectionType,
): boolean {
  const isMinimal = state === 'depleted' || state === 'overloaded';
  const isReduced = state === 'fragile';

  if (isMinimal) {
    // Only recovery trajectory survives in minimal density
    return sectionType === 'trajectory';
  }

  if (isReduced) {
    // Timeline and pure analytics suppressed; trajectory and momentum visible
    return sectionType !== 'timeline' && sectionType !== 'insights';
  }

  // Standard, focused, optimized, recovering: show everything
  return true;
}
