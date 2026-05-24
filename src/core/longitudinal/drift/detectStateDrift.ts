import type { DayProxy } from '../timeline/types';
import type { DriftSignal } from './types';
import { buildId } from '../../store/calculators/_helpers';

const WINDOW_DAYS = 7;
const OVERLOAD_THRESHOLD = 45;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Compute linear trend slope over a window of values.
 * Returns positive = rising, negative = falling.
 */
const linearSlope = (values: number[]): number => {
  const n = values.length;
  if (n < 2) return 0;
  const xs = values.map((_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  return den === 0 ? 0 : num / den;
};

/** Smooth values with a simple 3-point moving average */
const smooth = (values: number[]): number[] =>
  values.map((v, i) => {
    const prev = values[i - 1] ?? v;
    const next = values[i + 1] ?? v;
    return (prev + v + next) / 3;
  });

export const detectStateDrift = (proxies: DayProxy[]): DriftSignal[] => {
  const signals: DriftSignal[] = [];
  const recent = proxies.slice(-WINDOW_DAYS);
  if (recent.length < 4) return signals;

  const readiness = smooth(recent.map((p) => p.readinessProxy));
  const slope = linearSlope(readiness);
  const slopePerDay = slope;

  if (Math.abs(slopePerDay) < 1.5) return signals; // too flat to report

  const direction =
    slopePerDay > 0 ? ('recovering' as const) : ('toward-overload' as const);
  const urgency = Math.abs(slopePerDay) > 5 ? 'high' : Math.abs(slopePerDay) > 2.5 ? 'moderate' : 'low';
  const confidence = clamp01(Math.abs(slopePerDay) / 8);

  signals.push({
    id: buildId('drift'),
    type: 'state-drift',
    direction,
    urgency,
    description:
      direction === 'recovering'
        ? 'Readiness proxy has been trending upward over recent days.'
        : 'Readiness proxy has been trending downward over recent days.',
    confidence,
    trendWindowDays: recent.length,
    detectedAt: new Date().toISOString(),
    signals: ['readiness-proxy-trend'],
  });

  return signals;
};
