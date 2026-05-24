/**
 * INVISIBLE PREMIUM — Motion System
 *
 * Motion: subtle, almost invisible, smooth, calm, responsive.
 * No flashy animations. No bouncing. No exaggerated transitions.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Base Transitions ─────────────────────────────────────────────────────────

export const transitions = {
  instant: { duration: 0.08, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition,
  fast:    { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } satisfies Transition,
  base:    { duration: 0.25, ease: [0.4, 0, 0.2, 1] }     satisfies Transition,
  slow:    { duration: 0.4,  ease: [0.4, 0, 0.2, 1] }     satisfies Transition,
  calm:    { duration: 0.6,  ease: [0.4, 0, 0.2, 1] }     satisfies Transition,
  spring:  { type: 'spring', stiffness: 380, damping: 38 } satisfies Transition,
  gentle:  { type: 'spring', stiffness: 260, damping: 34 } satisfies Transition,
} as const;

// ─── Fade Variants ────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

// ─── Stagger Container ────────────────────────────────────────────────────────

export const staggerContainer = (staggerChildren = 0.06): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

// ─── Micro Interactions ───────────────────────────────────────────────────────

/** For tap-able cards and buttons */
export const tapScale = {
  whileTap: { scale: 0.98 } as const,
  transition: transitions.instant,
};

export const tapScaleLight = {
  whileTap: { scale: 0.99 } as const,
  transition: transitions.instant,
};

// ─── State Transitions ────────────────────────────────────────────────────────

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.base },
  exit: { opacity: 0, x: -12, transition: transitions.fast },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.gentle },
  exit: { opacity: 0, y: 12, transition: transitions.fast },
};

// ─── Progress / Number Reveal ─────────────────────────────────────────────────

export const progressReveal = (delay = 0): Transition => ({
  duration: 0.7,
  delay,
  ease: [0.4, 0, 0.2, 1],
});

// ─── Drawer / Sheet ───────────────────────────────────────────────────────────

export const drawerVariants: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: transitions.gentle },
  exit: { y: '100%', opacity: 0, transition: transitions.fast },
};
