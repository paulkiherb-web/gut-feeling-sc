/**
 * ADAPTIVE EXPERIENCE LAYER — React Context
 *
 * Provides the resolved AdaptiveExperienceProfile to all consuming components.
 * Re-resolves on every stateSnapshot change — all resolution is synchronous
 * and memoized, so there is no render cost beyond the snapshot update itself.
 *
 * Usage:
 *   1. Wrap your app (or Home) with <AdaptiveExperienceProvider>
 *   2. Consume via useAdaptiveContext() or the higher-level useAdaptiveExperience()
 */

import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Transition, Variants } from 'framer-motion';
import { useAppStore } from '@/core/store/appStore';
import type { AdaptiveExperienceProfile } from './state/AdaptiveStateModel';
import { resolveAdaptiveState } from './state/resolveAdaptiveState';
import {
  resolveAdaptiveVariants,
  resolveAdaptiveTransitions,
} from './motion/AdaptiveMotion';

// ─── Context Shape ────────────────────────────────────────────────────────────

export interface AdaptiveContextValue {
  profile: AdaptiveExperienceProfile;
  variants: {
    fadeInUp: Variants;
    staggerContainer: Variants;
    staggerItem: Variants;
  };
  transitions: {
    instant: Transition;
    fast: Transition;
    base: Transition;
    slow: Transition;
    calm: Transition;
  };
}

const AdaptiveContext = createContext<AdaptiveContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdaptiveExperienceProvider({ children }: { children: ReactNode }) {
  const snapshot = useAppStore(s => s.stateSnapshot);

  const value = useMemo<AdaptiveContextValue>(() => {
    const profile = resolveAdaptiveState(snapshot);
    const variants = resolveAdaptiveVariants(profile.motion);
    const transitions = resolveAdaptiveTransitions(profile.motion);
    return { profile, variants, transitions };
  }, [snapshot]);

  return (
    <AdaptiveContext.Provider value={value}>
      {children}
    </AdaptiveContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the raw AdaptiveContextValue.
 * Provides a graceful stable fallback when used outside the provider.
 */
export function useAdaptiveContext(): AdaptiveContextValue {
  const ctx = useContext(AdaptiveContext);
  if (!ctx) {
    const profile = resolveAdaptiveState(null);
    return {
      profile,
      variants: resolveAdaptiveVariants(profile.motion),
      transitions: resolveAdaptiveTransitions(profile.motion),
    };
  }
  return ctx;
}
