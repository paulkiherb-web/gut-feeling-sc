import type { DayProxy } from '../timeline/types';
import type { CausalChain, CausalEdge } from './types';
import { buildId } from '../../store/calculators/_helpers';

const MIN_CHAIN_EVIDENCE = 3;

const pearsonCorrelation = (xs: number[], ys: number[]): number => {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, sdX = 0, sdY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX, dy = ys[i] - meanY;
    num += dx * dy;
    sdX += dx * dx;
    sdY += dy * dy;
  }
  const denom = Math.sqrt(sdX * sdY);
  return denom === 0 ? 0 : num / denom;
};

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Attempt to infer edge weight from correlation between two delayed signals.
 */
const inferEdge = (
  proxies: DayProxy[],
  fromFn: (p: DayProxy) => number,
  toFn: (p: DayProxy) => number,
  delayDays: number,
  edgeType: CausalEdge['type'],
  fromLabel: string,
  toLabel: string,
): CausalEdge | null => {
  const from = proxies.slice(0, proxies.length - delayDays).map(fromFn);
  const to = proxies.slice(delayDays).map(toFn);
  if (from.length < MIN_CHAIN_EVIDENCE) return null;
  const corr = pearsonCorrelation(from, to);
  const weight = clamp01(Math.abs(corr));
  if (weight < 0.15) return null;
  return {
    from: fromLabel,
    to: toLabel,
    type: edgeType,
    delayHours: delayDays * 24,
    weight,
    confidence: clamp01(weight * 0.9),
    evidenceCount: from.length,
  };
};

/**
 * Chain: Late caffeine → poor sleep → reduced next-day readiness → compensatory behavior
 */
export const buildCaffeineChain = (proxies: DayProxy[]): CausalChain | null => {
  if (proxies.length < 6) return null;

  const lateCaffeineCount = proxies.filter((p) => p.hadLateCaffeine).length;
  if (lateCaffeineCount < MIN_CHAIN_EVIDENCE) return null;

  const edge1 = inferEdge(
    proxies,
    (p) => (p.hadLateCaffeine ? 1 : 0),
    (p) => 1 - p.sleepQuality,
    1,
    'delayed',
    'Late caffeine intake',
    'Reduced sleep quality',
  );

  const edge2 = inferEdge(
    proxies,
    (p) => 1 - p.sleepQuality,
    (p) => 100 - p.readinessProxy,
    1,
    'delayed',
    'Reduced sleep quality',
    'Lower next-day readiness',
  );

  if (!edge1 || !edge2) return null;
  const totalConfidence = edge1.confidence * edge2.confidence;
  if (totalConfidence < 0.08) return null;

  return {
    id: buildId('chain'),
    steps: ['Late caffeine intake', 'Reduced sleep quality', 'Lower next-day readiness'],
    edges: [edge1, edge2],
    totalConfidence,
    occurrences: lateCaffeineCount,
    description: 'Late caffeine intake appears associated with reduced sleep quality, followed by lower readiness the next day.',
    lastSeenAt: proxies.filter((p) => p.hadLateCaffeine).at(-1)?.day
      ? `${proxies.filter((p) => p.hadLateCaffeine).at(-1)!.day}T00:00:00.000Z`
      : new Date().toISOString(),
  };
};

/**
 * Chain: Hydration deficit → lower energy → reduced habit adherence
 */
export const buildHydrationChain = (proxies: DayProxy[]): CausalChain | null => {
  if (proxies.length < 6) return null;

  const deficitDays = proxies.filter((p) => p.hydrationProxy < 40).length;
  if (deficitDays < MIN_CHAIN_EVIDENCE) return null;

  const edge1 = inferEdge(
    proxies,
    (p) => 100 - p.hydrationProxy,
    (p) => 100 - p.energyProxy,
    0,
    'direct',
    'Hydration deficit',
    'Reduced energy proxy',
  );

  const edge2 = inferEdge(
    proxies,
    (p) => 100 - p.energyProxy,
    (p) => Math.max(0, 3 - p.habitCount),
    1,
    'delayed',
    'Reduced energy proxy',
    'Lower habit completion',
  );

  if (!edge1 || !edge2) return null;
  const totalConfidence = edge1.confidence * edge2.confidence;
  if (totalConfidence < 0.06) return null;

  return {
    id: buildId('chain'),
    steps: ['Hydration deficit', 'Reduced energy proxy', 'Lower habit completion'],
    edges: [edge1, edge2],
    totalConfidence,
    occurrences: deficitDays,
    description: 'Low hydration intake appears associated with reduced energy and lower behavioral adherence.',
    lastSeenAt: proxies.filter((p) => p.hydrationProxy < 40).at(-1)?.day
      ? `${proxies.filter((p) => p.hydrationProxy < 40).at(-1)!.day}T00:00:00.000Z`
      : new Date().toISOString(),
  };
};

export const buildCausalChain = (proxies: DayProxy[]): CausalChain[] => {
  const chains: CausalChain[] = [];
  const caffeine = buildCaffeineChain(proxies);
  if (caffeine) chains.push(caffeine);
  const hydration = buildHydrationChain(proxies);
  if (hydration) chains.push(hydration);
  return chains;
};
