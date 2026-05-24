import type { DayProxy } from '../timeline/types';
import type { CausalEdge } from './types';
import { buildId } from '../../store/calculators/_helpers';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Look for effects that manifest 1–3 days after a trigger.
 * Returns all detected delayed edges with their typical lag.
 */
export const inferDelayedEffects = (
  proxies: DayProxy[],
): CausalEdge[] => {
  const edges: CausalEdge[] = [];
  if (proxies.length < 5) return edges;

  // Delayed: poor sleep → hydration proxy drops next day (dehydration seeking)
  const sleepHydrationLag1 = computeLagCorrelation(
    proxies,
    (p) => 1 - p.sleepQuality,
    (p) => 100 - p.hydrationProxy,
    1,
  );
  if (sleepHydrationLag1 > 0.15) {
    edges.push({
      from: 'Reduced sleep quality',
      to: 'Lower hydration intake',
      type: 'delayed',
      delayHours: 24,
      weight: clamp01(sleepHydrationLag1),
      confidence: clamp01(sleepHydrationLag1 * 0.85),
      evidenceCount: proxies.length - 1,
    });
  }

  // Delayed: high red meals day N → more supplements day N+1 (compensatory)
  const redMealSupplementLag = computeLagCorrelation(
    proxies,
    (p) => p.redMealCount,
    (p) => p.supplementCount,
    1,
  );
  if (redMealSupplementLag > 0.15) {
    edges.push({
      from: 'High-impact meal choices',
      to: 'Increased supplement intake',
      type: 'delayed',
      delayHours: 24,
      weight: clamp01(redMealSupplementLag),
      confidence: clamp01(redMealSupplementLag * 0.8),
      evidenceCount: proxies.length - 1,
    });
  }

  return edges;
};

const computeLagCorrelation = (
  proxies: DayProxy[],
  fromFn: (p: DayProxy) => number,
  toFn: (p: DayProxy) => number,
  lag: number,
): number => {
  const n = proxies.length - lag;
  if (n < 3) return 0;

  const xs = proxies.slice(0, n).map(fromFn);
  const ys = proxies.slice(lag).map(toFn);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, sdX = 0, sdY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX, dy = ys[i] - meanY;
    num += dx * dy; sdX += dx * dx; sdY += dy * dy;
  }

  const denom = Math.sqrt(sdX * sdY);
  return denom === 0 ? 0 : num / denom;
};
