import type { DayProxy } from '../timeline/types';
import type { DriftSignal } from './types';
import { buildId } from '../../store/calculators/_helpers';

const WINDOW_DAYS = 7;
const POSITIVE_THRESHOLD = 65;
const CONSECUTIVE_DAYS_MIN = 3;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Detect sustained positive momentum: readiness improving and staying above threshold.
 */
export const detectPositiveMomentum = (proxies: DayProxy[]): DriftSignal | null => {
  const recent = proxies.slice(-WINDOW_DAYS);
  if (recent.length < 4) return null;

  const consecutiveGood = recent.reduceRight((streak, p) => {
    if (streak === -1) return -1; // already broken
    return p.readinessProxy >= POSITIVE_THRESHOLD ? streak + 1 : -1;
  }, 0);

  const actualStreak = consecutiveGood === -1 ? 0 : consecutiveGood;
  if (actualStreak < CONSECUTIVE_DAYS_MIN) return null;

  const avgHydration = recent.reduce((s, p) => s + p.hydrationProxy, 0) / recent.length;
  const avgSleep = recent.reduce((s, p) => s + p.sleepQuality, 0) / recent.length;
  const hasConsistentBehavior = avgHydration >= 60 || avgSleep >= 0.7;

  if (!hasConsistentBehavior && actualStreak < CONSECUTIVE_DAYS_MIN + 1) return null;

  const confidence = clamp01((actualStreak / 7) * 0.7 + (hasConsistentBehavior ? 0.3 : 0));

  const signals: string[] = ['readiness-sustained-positive'];
  if (avgHydration >= 60) signals.push('hydration-consistent');
  if (avgSleep >= 0.7) signals.push('sleep-quality-stable');

  return {
    id: buildId('drift'),
    type: 'positive-momentum',
    direction: 'toward-recovery',
    urgency: 'low',
    description: `Readiness proxy has remained above threshold for ${actualStreak} consecutive days.`,
    confidence,
    trendWindowDays: recent.length,
    detectedAt: new Date().toISOString(),
    signals,
  };
};
