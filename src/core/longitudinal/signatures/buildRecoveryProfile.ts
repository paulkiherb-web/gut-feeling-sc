import type { DayProxy } from '../timeline/types';
import type { RecoveryProfile } from './types';
import { inferRecoveryLag } from '../causality/inferRecoveryLag';

/**
 * Build a recovery profile: lag, consistency, and effectiveness of interventions.
 */
export const buildRecoveryProfile = (proxies: DayProxy[]): RecoveryProfile => {
  const lagResult = inferRecoveryLag(proxies);

  // Recovery consistency: how stable is readiness on good days?
  const goodDays = proxies.filter((p) => p.readinessProxy >= 65);
  const recoveryConsistency =
    goodDays.length >= 3
      ? 1 - Math.min(standardDeviation(goodDays.map((p) => p.readinessProxy)) / 20, 1)
      : 0.5;

  // Intervention effectiveness: average readiness gain after interventions
  const interventionDays = proxies
    .map((p, i) => (p.hadRecoveryIntervention ? i : -1))
    .filter((i) => i >= 0);

  const gains = interventionDays
    .map((i) => {
      const after = proxies[i + lagResult.lagDays];
      const before = proxies[i];
      return after && before ? after.readinessProxy - before.readinessProxy : 0;
    })
    .filter((g) => g !== 0);

  const avgGain = gains.length > 0
    ? gains.reduce((a, b) => a + b, 0) / gains.length
    : 0;

  const interventionEffectiveness = Math.max(0, Math.min(avgGain / 15, 1));

  return {
    avgRecoveryLagDays: lagResult.lagDays,
    recoveryConsistency,
    interventionEffectiveness,
  };
};

const standardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};
