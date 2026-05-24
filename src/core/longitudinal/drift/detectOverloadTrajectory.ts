import type { DayProxy } from '../timeline/types';
import type { DriftSignal } from './types';
import { buildId } from '../../store/calculators/_helpers';

const WINDOW_DAYS = 7;
const OVERLOAD_THRESHOLD = 45;
const TOWARD_OVERLOAD_DAYS_MIN = 3;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Detect trajectory toward an overload state BEFORE it collapses.
 * Fires when: readiness is declining AND multiple risk signals are co-occurring.
 */
export const detectOverloadTrajectory = (proxies: DayProxy[]): DriftSignal | null => {
  const recent = proxies.slice(-WINDOW_DAYS);
  if (recent.length < 4) return null;

  const belowThresholdCount = recent.filter((p) => p.readinessProxy < OVERLOAD_THRESHOLD + 10).length;
  if (belowThresholdCount < TOWARD_OVERLOAD_DAYS_MIN) return null;

  const avgHydration = recent.reduce((s, p) => s + p.hydrationProxy, 0) / recent.length;
  const avgSleep = recent.reduce((s, p) => s + p.sleepQuality, 0) / recent.length;
  const redMealLoad = recent.reduce((s, p) => s + p.redMealCount, 0) / recent.length;

  const riskScore =
    (avgHydration < 50 ? 0.3 : 0) +
    (avgSleep < 0.65 ? 0.3 : 0) +
    (redMealLoad >= 1 ? 0.2 : 0) +
    (belowThresholdCount / recent.length) * 0.2;

  if (riskScore < 0.3) return null;

  const urgency = riskScore > 0.6 ? 'high' : riskScore > 0.4 ? 'moderate' : 'low';
  const signals: string[] = [];
  if (avgHydration < 50) signals.push('low-hydration-trend');
  if (avgSleep < 0.65) signals.push('sleep-quality-decline');
  if (redMealLoad >= 1) signals.push('elevated-red-meal-load');
  signals.push('readiness-approaching-threshold');

  return {
    id: buildId('drift'),
    type: 'overload-trajectory',
    direction: 'toward-overload',
    urgency,
    description: 'Multiple signals suggest a trajectory toward reduced readiness.',
    confidence: clamp01(riskScore),
    trendWindowDays: recent.length,
    detectedAt: new Date().toISOString(),
    signals,
  };
};
