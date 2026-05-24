/**
 * ADAPTIVE EXPERIENCE LAYER — Motion Adaptation
 *
 * Motion adapts to the user's current physiological state.
 *
 * Philosophy:
 *   - When depleted or fragile: calmer, slower, less stimulating
 *   - When stable: design system baseline unchanged
 *   - When optimized: slightly more responsive, still restrained
 *
 * Constraints:
 *   - Maximum duration scale: 1.6× (depleted) — never feels broken
 *   - Minimum duration scale: 0.85× (optimized) — never feels rushed
 *   - No bouncing, no personality animation at any state
 *   - Entrance distances are reduced in calm/still modes (less visual movement)
 *
 * Baseline: design system defaults (base transition: 250ms)
 */

import type { Transition, Variants } from 'framer-motion';
import type { AdaptiveMotionProfile } from '../state/AdaptiveStateModel';

// ─── Transition Resolver ──────────────────────────────────────────────────────

const SMOOTH_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

function scaledDuration(base: number, scale: number): number {
  return parseFloat((base * scale).toFixed(3));
}

/**
 * Returns adapted Framer Motion transition objects for the given motion profile.
 * All transitions use the smooth ease curve — no curve changes across states.
 */
export function resolveAdaptiveTransitions(motion: AdaptiveMotionProfile): {
  instant: Transition;
  fast: Transition;
  base: Transition;
  slow: Transition;
  calm: Transition;
} {
  const s = motion.durationScale;
  return {
    instant: { duration: scaledDuration(0.08,  s), ease: SMOOTH_EASE },
    fast:    { duration: scaledDuration(0.15,  s), ease: SMOOTH_EASE },
    base:    { duration: scaledDuration(0.25,  s), ease: SMOOTH_EASE },
    slow:    { duration: scaledDuration(0.40,  s), ease: SMOOTH_EASE },
    calm:    { duration: scaledDuration(0.60,  s), ease: SMOOTH_EASE },
  } as const;
}

// ─── Variant Resolver ─────────────────────────────────────────────────────────

/**
 * Returns adapted Framer Motion variants for content entrance.
 *
 * 'still' mode: minimal entrance movement (y: 4px) — nearly imperceptible
 * 'calm' mode:  moderate entrance movement (y: 6px) — slow and quiet
 * 'standard':   design system default (y: 8px)
 * 'responsive': same distance, faster timing (durationScale: 0.85)
 */
export function resolveAdaptiveVariants(motion: AdaptiveMotionProfile): {
  fadeInUp: Variants;
  staggerContainer: Variants;
  staggerItem: Variants;
} {
  const transitions = resolveAdaptiveTransitions(motion);
  const yDistance =
    motion.mode === 'still' ? 4 :
    motion.mode === 'calm'  ? 6 : 8;

  return {
    fadeInUp: {
      hidden:  { opacity: 0, y: yDistance },
      visible: { opacity: 1, y: 0, transition: transitions.base },
    },
    staggerContainer: {
      hidden: {},
      visible: {
        transition: { staggerChildren: motion.staggerDelay },
      },
    },
    staggerItem: {
      hidden:  { opacity: 0, y: Math.round(yDistance * 0.75) },
      visible: { opacity: 1, y: 0, transition: transitions.base },
    },
  };
}
