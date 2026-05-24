import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';

const MIN_OCCURRENCES_WEAK = 3;
const MIN_OCCURRENCES_MODERATE = 6;
const MIN_OCCURRENCES_STRONG = 10;
const HALF_LIFE_DAYS = 21;

export const computePatternStrength = (
  occurrences: number,
): RecurringPattern['strength'] => {
  if (occurrences >= MIN_OCCURRENCES_STRONG) return 'strong';
  if (occurrences >= MIN_OCCURRENCES_MODERATE) return 'moderate';
  return 'weak';
};

/** Confidence scales with sample size and hit rate consistency */
export const computePatternConfidence = (
  occurrences: number,
  totalOpportunities: number,
): number => {
  if (totalOpportunities === 0) return 0;
  const hitRate = occurrences / totalOpportunities;
  const sampleFactor = Math.min(occurrences / 12, 1); // saturates at 12 samples
  return Math.min(hitRate * 0.7 + sampleFactor * 0.3, 0.95);
};

/** Decay factor: 1.0 = very recent, 0 = not seen in a long time */
export const computeDecayFactor = (lastSeenAt: string): number => {
  const daysSince =
    (Date.now() - new Date(lastSeenAt).getTime()) / 86_400_000;
  return Math.exp((-Math.LN2 * daysSince) / HALF_LIFE_DAYS);
};

/** Effect size: how much worse (or better) the outcome is on trigger days vs base */
export const computeEffectSize = (
  triggerOutcomeAvg: number,
  baselineAvg: number,
  range = 100,
): number => Math.min(Math.abs(triggerOutcomeAvg - baselineAvg) / range, 1);

/** Require at least the weak minimum before returning any pattern */
export const isSufficientEvidence = (occurrences: number): boolean =>
  occurrences >= MIN_OCCURRENCES_WEAK;

/**
 * Look up the proxy pair for two adjacent days (day N + day N+delayDays).
 * Returns all matched pairs.
 */
export const extractAdjacentPairs = (
  proxies: DayProxy[],
  triggerFn: (p: DayProxy) => boolean,
  delayDays = 1,
): { trigger: DayProxy; outcome: DayProxy }[] => {
  const pairs: { trigger: DayProxy; outcome: DayProxy }[] = [];
  for (let i = 0; i < proxies.length - delayDays; i++) {
    if (triggerFn(proxies[i])) {
      const outcome = proxies[i + delayDays];
      if (outcome) pairs.push({ trigger: proxies[i], outcome });
    }
  }
  return pairs;
};

export const buildPattern = (
  id: string,
  fields: Omit<RecurringPattern, 'id' | 'strength' | 'confidence' | 'decayFactor'>,
): RecurringPattern => ({
  id,
  ...fields,
  strength: computePatternStrength(fields.occurrences),
  confidence: computePatternConfidence(fields.occurrences, fields.totalOpportunities),
  decayFactor: computeDecayFactor(fields.lastSeenAt),
});
