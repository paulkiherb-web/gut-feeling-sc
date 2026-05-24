import type { DayProxy } from '../timeline/types';
import type { RecurringPattern } from './types';
import { buildId } from '../../store/calculators/_helpers';
import { isSufficientEvidence, buildPattern } from './PatternMemory';

/** Detect days where readiness proxy stays low for 3+ consecutive days */
export const detectLowReadinessStreak = (proxies: DayProxy[]): RecurringPattern | null => {
  const LOW_THRESHOLD = 45;
  let maxStreakLength = 0;
  let streakCount = 0;
  let currentStreak = 0;
  let lastStreakEnd: string | null = null;
  let firstStreakStart: string | null = null;

  for (const p of proxies) {
    if (p.readinessProxy < LOW_THRESHOLD) {
      currentStreak++;
      if (currentStreak >= 3) {
        if (currentStreak === 3) streakCount++;
        if (currentStreak > maxStreakLength) {
          maxStreakLength = currentStreak;
          lastStreakEnd = p.day;
          if (!firstStreakStart) firstStreakStart = p.day;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  if (!isSufficientEvidence(streakCount) || !lastStreakEnd || !firstStreakStart) return null;

  return buildPattern(buildId('pat'), {
    category: 'recurring',
    description: 'Recurring periods of sustained low readiness detected.',
    triggerLabel: 'Multi-day low-readiness pattern',
    outcomeLabel: 'Prolonged below-threshold readiness',
    delayDays: 0,
    occurrences: streakCount,
    totalOpportunities: proxies.length,
    effectSize: Math.min(maxStreakLength / 7, 1),
    lastSeenAt: `${lastStreakEnd}T00:00:00.000Z`,
    firstSeenAt: `${firstStreakStart}T00:00:00.000Z`,
  });
};

/** Detect weekly periodicity in readiness patterns */
export const detectWeeklyPeriodicity = (proxies: DayProxy[]): RecurringPattern | null => {
  if (proxies.length < 14) return null;

  const dayOfWeekScores: number[][] = Array.from({ length: 7 }, () => []);
  for (const p of proxies) {
    const dow = new Date(p.day).getDay();
    dayOfWeekScores[dow].push(p.readinessProxy);
  }

  const avgByDow = dayOfWeekScores.map((scores) =>
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 50,
  );

  const maxAvg = Math.max(...avgByDow);
  const minAvg = Math.min(...avgByDow);
  const swing = maxAvg - minAvg;

  if (swing < 15) return null; // no meaningful periodicity

  const weakestDow = avgByDow.indexOf(minAvg);
  const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const lastProxy = proxies.at(-1);
  const firstProxy = proxies[0];
  if (!lastProxy || !firstProxy) return null;

  const weeksOfData = Math.floor(proxies.length / 7);
  if (!isSufficientEvidence(weeksOfData)) return null;

  return buildPattern(buildId('pat'), {
    category: 'recurring',
    description: `Weekly readiness variability observed — ${DOW_NAMES[weakestDow]}s show the lowest average readiness proxy.`,
    triggerLabel: `${DOW_NAMES[weakestDow]} pattern`,
    outcomeLabel: 'Reduced readiness on that day of week',
    delayDays: 0,
    occurrences: weeksOfData,
    totalOpportunities: proxies.length,
    effectSize: Math.min(swing / 40, 1),
    lastSeenAt: `${lastProxy.day}T00:00:00.000Z`,
    firstSeenAt: `${firstProxy.day}T00:00:00.000Z`,
  });
};

export const detectRecurringPatterns = (proxies: DayProxy[]): RecurringPattern[] => {
  const results: RecurringPattern[] = [];
  const streak = detectLowReadinessStreak(proxies);
  if (streak) results.push(streak);
  const weekly = detectWeeklyPeriodicity(proxies);
  if (weekly) results.push(weekly);
  return results;
};
