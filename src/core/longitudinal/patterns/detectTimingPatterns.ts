import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';
import {
  extractAdjacentPairs,
  computeEffectSize,
  isSufficientEvidence,
  buildPattern,
} from './PatternMemory';

/** Late caffeine → reduced next-day sleep quality */
export const detectLateCaffeinePattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, (p) => p.hadLateCaffeine, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgNextSleep = pairs.reduce((s, p) => s + p.outcome.sleepQuality, 0) / pairs.length;
  const baselineSleep = proxies.reduce((s, p) => s + p.sleepQuality, 0) / proxies.length;

  const effectSize = computeEffectSize(avgNextSleep, baselineSleep, 1);
  if (effectSize < 0.05) return null; // negligible effect

  const lastSeen = pairs.at(-1)?.trigger.day ?? proxies.at(-1)?.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'timing',
    description: 'Late caffeine frequently precedes reduced sleep quality.',
    triggerLabel: 'Late caffeine intake',
    outcomeLabel: 'Reduced next-day sleep quality',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter((p) => p.hadLateCaffeine).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

/** Night eating → lower next-day energy proxy */
export const detectNightEatingPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, (p) => p.hadNightEating, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgNextEnergy = pairs.reduce((s, p) => s + p.outcome.energyProxy, 0) / pairs.length;
  const baselineEnergy = proxies.reduce((s, p) => s + p.energyProxy, 0) / proxies.length;

  const effectSize = computeEffectSize(avgNextEnergy, baselineEnergy, 100);
  if (effectSize < 0.05) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'timing',
    description: 'Late-night eating appears associated with lower next-day energy.',
    triggerLabel: 'Eating after 22:00',
    outcomeLabel: 'Lower next-day energy proxy',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter((p) => p.hadNightEating).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

export const detectTimingPatterns = (proxies: DayProxy[]): RecurringPattern[] => {
  const results: RecurringPattern[] = [];
  const lateCaffeine = detectLateCaffeinePattern(proxies);
  if (lateCaffeine) results.push(lateCaffeine);
  const nightEating = detectNightEatingPattern(proxies);
  if (nightEating) results.push(nightEating);
  return results;
};
