import type { DayProxy } from '../timeline/types';
import type { PersonalSignature } from './types';
import { calculateSensitivityWeights } from './calculateSensitivityWeights';
import { buildDominantFactors } from './buildDominantFactors';
import { buildRecoveryProfile } from './buildRecoveryProfile';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

const getWeightForDomain = (weights: ReturnType<typeof calculateSensitivityWeights>, domain: string): number =>
  weights.find((w) => w.domain === domain)?.weight ?? 0;

/**
 * Build the personal signature model: what uniquely affects this user.
 * Uses rolling sensitivity weights and recovery profile inference.
 */
export const buildPersonalSignature = (proxies: DayProxy[]): PersonalSignature => {
  const evidenceCount = proxies.length;
  const MIN_EVIDENCE = 5;

  if (evidenceCount < MIN_EVIDENCE) {
    return emptySignature(evidenceCount);
  }

  const weights = calculateSensitivityWeights(proxies);
  const dominantFactors = buildDominantFactors(weights);
  const recoveryProfile = buildRecoveryProfile(proxies);

  const hydrationSensitivity = getWeightForDomain(weights, 'hydration');
  const sleepSensitivity = getWeightForDomain(weights, 'sleep');
  const nutritionSensitivity = getWeightForDomain(weights, 'nutrition');

  // Caffeine impact: proportion of late-caffeine days that have poor next sleep
  const lateCaffeineDays = proxies.filter((p) => p.hadLateCaffeine);
  const caffeineImpact =
    lateCaffeineDays.length >= 3
      ? clamp01(
          lateCaffeineDays.filter((_, i) => {
            const next = proxies[proxies.indexOf(lateCaffeineDays[i]) + 1];
            return next && next.sleepQuality < 0.65;
          }).length / lateCaffeineDays.length,
        )
      : 0;

  // Overload resilience: proportion of low-readiness days that recover within 2 days
  const lowDays = proxies
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.readinessProxy < 45);

  const resilience =
    lowDays.length >= 3
      ? clamp01(
          lowDays.filter(({ i }) => {
            const d1 = proxies[i + 1];
            const d2 = proxies[i + 2];
            return (d1 && d1.readinessProxy >= 55) || (d2 && d2.readinessProxy >= 55);
          }).length / lowDays.length,
        )
      : 0.5;

  // Intervention responsiveness from recovery profile
  const interventionResponsiveness = recoveryProfile.interventionEffectiveness;

  // Overall confidence: scales with evidence and weight count
  const confidence = clamp01(
    (evidenceCount / 30) * 0.5 +
    (weights.length / 5) * 0.3 +
    recoveryProfile.interventionEffectiveness * 0.2,
  );

  return {
    hydrationSensitivity,
    sleepSensitivity,
    caffeineImpact,
    nutritionSensitivity,
    recoveryLagDays: recoveryProfile.avgRecoveryLagDays,
    overloadResilience: resilience,
    interventionResponsiveness,
    dominantFactors,
    recoveryProfile,
    confidence,
    evidenceCount,
  };
};

const emptySignature = (evidenceCount: number): PersonalSignature => ({
  hydrationSensitivity: 0,
  sleepSensitivity: 0,
  caffeineImpact: 0,
  nutritionSensitivity: 0,
  recoveryLagDays: 1,
  overloadResilience: 0.5,
  interventionResponsiveness: 0,
  dominantFactors: [],
  recoveryProfile: { avgRecoveryLagDays: 1, recoveryConsistency: 0.5, interventionEffectiveness: 0 },
  confidence: 0,
  evidenceCount,
});
