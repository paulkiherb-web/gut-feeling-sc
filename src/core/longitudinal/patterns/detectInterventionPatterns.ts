import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';
import {
  extractAdjacentPairs,
  computeEffectSize,
  isSufficientEvidence,
  buildPattern,
} from './PatternMemory';

/** Recovery intervention (supplements + habits) → better next-day readiness */
export const detectInterventionReadinessPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, (p) => p.hadRecoveryIntervention, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgNextReadiness = pairs.reduce((s, p) => s + p.outcome.readinessProxy, 0) / pairs.length;
  const nonInterventionDays = proxies.filter((p) => !p.hadRecoveryIntervention);
  const baselineReadiness =
    nonInterventionDays.length > 0
      ? nonInterventionDays.reduce((s, p) => s + p.readinessProxy, 0) / nonInterventionDays.length
      : proxies.reduce((s, p) => s + p.readinessProxy, 0) / proxies.length;

  const effectSize = computeEffectSize(avgNextReadiness, baselineReadiness, 100);
  if (effectSize < 0.04) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'intervention',
    description: 'Days combining supplements and habits appear associated with improved next-day readiness.',
    triggerLabel: 'Supplement + habit combination',
    outcomeLabel: 'Improved next-day readiness proxy',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter((p) => p.hadRecoveryIntervention).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

/** Good hydration → better same-day energy proxy */
export const detectHydrationEnergyPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const highHydrationDays = proxies.filter((p) => p.hydrationProxy >= 80);
  const lowHydrationDays = proxies.filter((p) => p.hydrationProxy < 40);

  if (highHydrationDays.length < 3 || lowHydrationDays.length < 3) return null;

  const highAvgEnergy = highHydrationDays.reduce((s, p) => s + p.energyProxy, 0) / highHydrationDays.length;
  const lowAvgEnergy = lowHydrationDays.reduce((s, p) => s + p.energyProxy, 0) / lowHydrationDays.length;

  const effectSize = computeEffectSize(highAvgEnergy, lowAvgEnergy, 100);
  if (effectSize < 0.06) return null;

  const occurrences = Math.min(highHydrationDays.length, lowHydrationDays.length);
  if (!isSufficientEvidence(occurrences)) return null;

  const lastSeen =
    highHydrationDays.at(-1)?.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = highHydrationDays[0]?.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'intervention',
    description: 'Hydration consistency appears strongly associated with stable energy.',
    triggerLabel: 'Consistent hydration intake',
    outcomeLabel: 'Higher energy proxy',
    delayDays: 0,
    occurrences,
    totalOpportunities: proxies.length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

export const detectInterventionPatterns = (proxies: DayProxy[]): RecurringPattern[] => {
  const results: RecurringPattern[] = [];
  const interventionReadiness = detectInterventionReadinessPattern(proxies);
  if (interventionReadiness) results.push(interventionReadiness);
  const hydrationEnergy = detectHydrationEnergyPattern(proxies);
  if (hydrationEnergy) results.push(hydrationEnergy);
  return results;
};
