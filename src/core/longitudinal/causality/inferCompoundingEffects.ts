import type { DayProxy } from '../timeline/types';
import type { CausalEdge } from './types';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * Detect compounding effects: when two negative signals co-occur,
 * the combined impact exceeds either signal alone.
 */
export const inferCompoundingEffects = (proxies: DayProxy[]): CausalEdge[] => {
  const edges: CausalEdge[] = [];
  if (proxies.length < 5) return edges;

  // Low sleep + low hydration → much lower readiness (compound)
  const compoundDays = proxies.filter(
    (p) => p.sleepQuality < 0.65 && p.hydrationProxy < 50,
  );
  const singleDeficitDays = proxies.filter(
    (p) =>
      (p.sleepQuality < 0.65 && p.hydrationProxy >= 50) ||
      (p.sleepQuality >= 0.65 && p.hydrationProxy < 50),
  );
  const cleanDays = proxies.filter(
    (p) => p.sleepQuality >= 0.65 && p.hydrationProxy >= 50,
  );

  if (compoundDays.length >= 3 && cleanDays.length >= 3) {
    const compoundAvg = compoundDays.reduce((s, p) => s + p.readinessProxy, 0) / compoundDays.length;
    const cleanAvg = cleanDays.reduce((s, p) => s + p.readinessProxy, 0) / cleanDays.length;
    const singleAvg =
      singleDeficitDays.length > 0
        ? singleDeficitDays.reduce((s, p) => s + p.readinessProxy, 0) / singleDeficitDays.length
        : (compoundAvg + cleanAvg) / 2;

    // Compounding detected when compound effect is worse than single effects
    const compoundPenalty = cleanAvg - compoundAvg;
    const singlePenalty = cleanAvg - singleAvg;
    if (compoundPenalty > singlePenalty * 1.3 && compoundPenalty > 5) {
      const weight = clamp01(compoundPenalty / 40);
      edges.push({
        from: 'Low sleep quality + low hydration (co-occurring)',
        to: 'Compounded readiness reduction',
        type: 'compounding',
        delayHours: 0,
        weight,
        confidence: clamp01(weight * 0.75),
        evidenceCount: compoundDays.length,
      });
    }
  }

  return edges;
};
