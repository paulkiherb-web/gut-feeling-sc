/**
 * Internal shared utilities for longitudinal analysis.
 * Builds daily bucket signals from raw events — used by timeline, patterns, and drift modules.
 */
import type { DomainEvent } from '../../store/types/events';
import type { DayProxy } from '../timeline/types';

const CAFFEINE_KEYWORDS = ['caffein', 'кофе', 'кофеин', 'coffee', 'guarana', 'гуарана', 'matcha', 'матча', 'pre-workout', 'предтрен'];

const LATE_CAFFEINE_HOUR = 16;
const NIGHT_EATING_HOUR = 22;
const HYDRATION_GOOD_ML = 1800;

const isCaffeineEvent = (name: string): boolean =>
  CAFFEINE_KEYWORDS.some((kw) => name.toLowerCase().includes(kw));

const eventHour = (iso: string): number => new Date(iso).getHours();

const clampProxy = (v: number): number => Math.max(0, Math.min(100, v));

/** Group event log by calendar day (YYYY-MM-DD) */
export const groupEventsByDay = (events: DomainEvent[]): Map<string, DomainEvent[]> => {
  const map = new Map<string, DomainEvent[]>();
  for (const event of events) {
    const day = event.createdAt.slice(0, 10);
    const bucket = map.get(day);
    if (bucket) bucket.push(event);
    else map.set(day, [event]);
  }
  return map;
};

/** Build a DayProxy from a day's events */
export const buildDayProxy = (day: string, events: DomainEvent[]): DayProxy => {
  let totalHydrationMl = 0;
  let sleepHours = 0;
  let sleepQuality = 0;
  let hasSleepData = false;
  let redMealCount = 0;
  let greenMealCount = 0;
  let supplementCount = 0;
  let habitCount = 0;
  let hadLateCaffeine = false;
  let hadNightEating = false;

  for (const event of events) {
    switch (event.type) {
      case 'hydration.logged':
        totalHydrationMl += event.payload.ml ?? 0;
        break;
      case 'sleep.recorded': {
        sleepHours = event.payload.durationHours ?? event.payload.hours ?? 0;
        sleepQuality = event.payload.quality ?? (sleepHours >= 7 ? 0.75 : 0.6);
        hasSleepData = true;
        break;
      }
      case 'meal.logged':
        if (event.payload.verdict === 'red') redMealCount++;
        if (event.payload.verdict === 'green') greenMealCount++;
        if (eventHour(event.createdAt) >= NIGHT_EATING_HOUR) hadNightEating = true;
        break;
      case 'scan.completed':
        if (event.payload.verdict === 'red') redMealCount++;
        if (event.payload.verdict === 'green') greenMealCount++;
        if (eventHour(event.createdAt) >= NIGHT_EATING_HOUR) hadNightEating = true;
        break;
      case 'supplement.taken':
        supplementCount++;
        if (
          isCaffeineEvent(event.payload.name ?? '') &&
          eventHour(event.createdAt) >= LATE_CAFFEINE_HOUR
        ) {
          hadLateCaffeine = true;
        }
        break;
      case 'habit.completed':
        habitCount++;
        break;
    }
  }

  const resolvedSleepQuality = hasSleepData ? sleepQuality : 0.7;
  const resolvedSleepHours = hasSleepData ? sleepHours : 7;

  const hydrationProxy = clampProxy((totalHydrationMl / HYDRATION_GOOD_ML) * 100);
  const sleepScore = clampProxy(resolvedSleepQuality * 60 + (resolvedSleepHours / 8) * 40);
  const nutritionScore = clampProxy(
    50 + greenMealCount * 10 - redMealCount * 15 + (hadNightEating ? -10 : 0),
  );
  const behaviorBonus = Math.min(habitCount * 5 + supplementCount * 3, 20);

  const readinessProxy = clampProxy(
    sleepScore * 0.4 + hydrationProxy * 0.3 + nutritionScore * 0.2 + behaviorBonus,
  );
  const energyProxy = clampProxy(
    hydrationProxy * 0.35 + nutritionScore * 0.35 + sleepScore * 0.3,
  );

  return {
    day,
    readinessProxy,
    energyProxy,
    hydrationProxy,
    sleepQuality: resolvedSleepQuality,
    sleepHours: resolvedSleepHours,
    redMealCount,
    greenMealCount,
    supplementCount,
    habitCount,
    totalHydrationMl,
    hadLateCaffeine,
    hadNightEating,
    hadRecoveryIntervention: supplementCount >= 1 && habitCount >= 1,
  };
};

/** Build sorted daily proxies covering the event log span */
export const buildDailyProxies = (events: DomainEvent[]): DayProxy[] => {
  const grouped = groupEventsByDay(events);
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, dayEvents]) => buildDayProxy(day, dayEvents));
};

export const HYDRATION_GOOD_ML_THRESHOLD = HYDRATION_GOOD_ML;
export const HYDRATION_DEFICIT_ML_THRESHOLD = 1000;
