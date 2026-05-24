import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';
import {
  extractAdjacentPairs,
  computeEffectSize,
  isSufficientEvidence,
  buildPattern,
} from './PatternMemory';

const HYDRATION_DEFICIT_THRESHOLD = 40; // hydrationProxy below this = deficit day

/** Hydration deficit → lower next-day readiness */
export const detectHydrationCrashPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(
    proxies,
    (p) => p.hydrationProxy < HYDRATION_DEFICIT_THRESHOLD,
    1,
  );
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgNextReadiness = pairs.reduce((s, p) => s + p.outcome.readinessProxy, 0) / pairs.length;
  const baselineReadiness = proxies.reduce((s, p) => s + p.readinessProxy, 0) / proxies.length;

  const effectSize = computeEffectSize(avgNextReadiness, baselineReadiness, 100);
  if (effectSize < 0.04) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'crash',
    description: 'Hydration deficits appear associated with lower next-day readiness.',
    triggerLabel: 'Low hydration intake',
    outcomeLabel: 'Reduced next-day readiness proxy',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter((p) => p.hydrationProxy < HYDRATION_DEFICIT_THRESHOLD).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

/** Heavy meal load → lower next-day energy proxy */
export const detectHeavyMealCrashPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, (p) => p.redMealCount >= 2, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgNextEnergy = pairs.reduce((s, p) => s + p.outcome.energyProxy, 0) / pairs.length;
  const baselineEnergy = proxies.reduce((s, p) => s + p.energyProxy, 0) / proxies.length;

  const effectSize = computeEffectSize(avgNextEnergy, baselineEnergy, 100);
  if (effectSize < 0.04) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'crash',
    description: 'Multiple high-impact food choices in a day appear associated with lower energy the following day.',
    triggerLabel: 'Multiple red-verdict meals',
    outcomeLabel: 'Lower next-day energy proxy',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter((p) => p.redMealCount >= 2).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

export const detectCrashPatterns = (proxies: DayProxy[]): RecurringPattern[] => {
  const results: RecurringPattern[] = [];
  const hydrationCrash = detectHydrationCrashPattern(proxies);
  if (hydrationCrash) results.push(hydrationCrash);
  const heavyMealCrash = detectHeavyMealCrashPattern(proxies);
  if (heavyMealCrash) results.push(heavyMealCrash);
  return results;
};
