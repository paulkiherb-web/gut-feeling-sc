import type { Scorecard } from '../types/state';
import { clamp } from './_helpers';

// Composite — weighted blend of the four pillars
export function calculateReadinessScore(parts: Omit<Scorecard, 'readiness' | 'goalAlignment'>): number {
  const v =
    parts.energy * 0.30 +
    parts.recovery * 0.25 +
    parts.sleep * 0.25 +
    parts.nutrition * 0.20;
  return clamp(Math.round(v));
}
