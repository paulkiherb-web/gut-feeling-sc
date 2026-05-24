import type { DayProxy } from '../timeline/types';
import type { SensitivityWeight } from './types';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Compute normalized sensitivity weights for each domain by measuring
 * how strongly changes in that domain correlate with readiness changes.
 */
export const calculateSensitivityWeights = (proxies: DayProxy[]): SensitivityWeight[] => {
  if (proxies.length < 5) return [];

  const domains: Array<{
    domain: string;
    getSignal: (p: DayProxy) => number;
    direction: SensitivityWeight['direction'];
  }> = [
    { domain: 'hydration', getSignal: (p) => p.hydrationProxy, direction: 'positive' },
    { domain: 'sleep', getSignal: (p) => p.sleepQuality * 100, direction: 'positive' },
    { domain: 'nutrition', getSignal: (p) => p.greenMealCount * 20 - p.redMealCount * 15, direction: 'bidirectional' },
    { domain: 'habits', getSignal: (p) => Math.min(p.habitCount * 20, 100), direction: 'positive' },
    { domain: 'supplements', getSignal: (p) => Math.min(p.supplementCount * 25, 100), direction: 'positive' },
  ];

  const readiness = proxies.map((p) => p.readinessProxy);
  const meanReadiness = readiness.reduce((a, b) => a + b, 0) / readiness.length;

  const weights: SensitivityWeight[] = [];

  for (const { domain, getSignal, direction } of domains) {
    const signals = proxies.map(getSignal);
    const corr = pearsonCorrelation(signals, readiness);
    const absCorr = Math.abs(corr);
    if (absCorr < 0.1) continue;

    weights.push({
      domain,
      weight: clamp01(absCorr),
      direction: corr < 0 ? 'negative' : direction,
      confidence: clamp01(absCorr * (Math.min(proxies.length, 30) / 30)),
      evidenceCount: proxies.length,
    });
  }

  // Sort by weight descending
  return weights.sort((a, b) => b.weight - a.weight);
};

const pearsonCorrelation = (xs: number[], ys: number[]): number => {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, sdX = 0, sdY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX, dy = ys[i] - meanY;
    num += dx * dy; sdX += dx * dx; sdY += dy * dy;
  }
  const denom = Math.sqrt(sdX * sdY);
  return denom === 0 ? 0 : num / denom;
};
