import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';
import {
  extractAdjacentPairs,
  computeEffectSize,
  isSufficientEvidence,
  buildPattern,
} from './PatternMemory';

const POOR_SLEEP_QUALITY = 0.65;
const POOR_SLEEP_HOURS = 6.5;

const hadPoorSleep = (p: DayProxy): boolean =>
  p.sleepQuality < POOR_SLEEP_QUALITY || p.sleepHours < POOR_SLEEP_HOURS;

const hadGoodSleep = (p: DayProxy): boolean =>
  p.sleepQuality >= 0.75 && p.sleepHours >= 7;

/** Poor sleep → increased red meals next day (sugar-seeking behavior) */
export const detectPoorSleepFoodPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, hadPoorSleep, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgRedMeals = pairs.reduce((s, p) => s + p.outcome.redMealCount, 0) / pairs.length;
  const baselineRed = proxies.reduce((s, p) => s + p.redMealCount, 0) / proxies.length;

  const effectSize = computeEffectSize(avgRedMeals, baselineRed, 4);
  if (effectSize < 0.05) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'recovery',
    description: 'Reduced sleep quality appears associated with higher-risk food choices the following day.',
    triggerLabel: 'Poor sleep',
    outcomeLabel: 'Increased red-verdict meals next day',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter(hadPoorSleep).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

/** Good sleep → higher next-day habit completion */
export const detectGoodSleepHabitPattern = (proxies: DayProxy[]): RecurringPattern | null => {
  const pairs = extractAdjacentPairs(proxies, hadGoodSleep, 1);
  if (!isSufficientEvidence(pairs.length)) return null;

  const avgHabits = pairs.reduce((s, p) => s + p.outcome.habitCount, 0) / pairs.length;
  const baselineHabits = proxies.reduce((s, p) => s + p.habitCount, 0) / proxies.length;

  const effectSize = computeEffectSize(avgHabits, baselineHabits, 5);
  if (effectSize < 0.05) return null;

  const lastSeen = pairs.at(-1)?.trigger.day ?? new Date().toISOString().slice(0, 10);
  const firstSeen = pairs[0]?.trigger.day ?? lastSeen;

  return buildPattern(buildId('pat'), {
    category: 'recovery',
    description: 'Adequate sleep appears associated with more habits completed the following day.',
    triggerLabel: 'Good sleep quality and duration',
    outcomeLabel: 'Higher habit completion next day',
    delayDays: 1,
    occurrences: pairs.length,
    totalOpportunities: proxies.filter(hadGoodSleep).length,
    effectSize,
    lastSeenAt: `${lastSeen}T00:00:00.000Z`,
    firstSeenAt: `${firstSeen}T00:00:00.000Z`,
  });
};

export const detectRecoveryPatterns = (proxies: DayProxy[]): RecurringPattern[] => {
  const results: RecurringPattern[] = [];
  const poorSleepFood = detectPoorSleepFoodPattern(proxies);
  if (poorSleepFood) results.push(poorSleepFood);
  const goodSleepHabit = detectGoodSleepHabitPattern(proxies);
  if (goodSleepHabit) results.push(goodSleepHabit);
  return results;
};
