// Materialise a future blueprint item into synthetic DomainEvents so we can
// re-run buildScorecard over the "ghost timeline" (what would have happened
// if the user followed the plan perfectly).

import {
  newEvent,
  type DomainEvent,
  type MealLoggedEvent,
  type HydrationLoggedEvent,
  type SleepRecordedEvent,
  type HabitCompletedEvent,
  type TokenLoggedEvent,
} from '../store/types/events';
import type { BlueprintItem, DailyBlueprint, IntensivePlan } from './types';

/** Compute an ISO timestamp for `time` ("HH:MM") on the date of `baseDate` + `dayOffset`. */
function isoFor(baseDate: Date, time: string, dayOffset = 0): string {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0, 0, 0);
  return d.toISOString();
}

function itemToEvent(item: BlueprintItem, baseDate: Date): DomainEvent | null {
  const at = isoFor(baseDate, item.time);
  const base = { source: 'system' as const, createdAt: at, confidence: 0.6 };

  switch (item.category) {
    case 'hydration':
      return newEvent<HydrationLoggedEvent>({
        ...base,
        type: 'hydration.logged',
        payload: { ml: 250, beverage: 'water', source: 'plan' },
      });
    case 'meal':
      return newEvent<MealLoggedEvent>({
        ...base,
        type: 'meal.logged',
        payload: {
          title: item.title,
          name: item.title,
          notes: 'plan',
          verdict: 'green',
          protein: 25,
        },
      });
    case 'sleep':
      return newEvent<SleepRecordedEvent>({
        ...base,
        type: 'sleep.recorded',
        payload: { hours: 7.5, quality: 80 },
      });
    case 'movement':
    case 'rest':
    case 'habit':
      return newEvent<HabitCompletedEvent>({
        ...base,
        type: 'habit.completed',
        payload: {
          name: item.title,
          duration: item.durationMin,
        },
      });
    case 'supplement':
      return newEvent<TokenLoggedEvent>({
        ...base,
        type: 'token.logged',
        payload: {
          tokenId: 'medicine',
          labelRu: item.title,
          category: 'supplement',
          signals: {},
        },
      });
    default:
      return null;
  }
}

/**
 * Build the ghost event stream up to `upTo` for `dayIndex` (1-based).
 *
 * @param startedAtISO  ISO string of when the plan started. When provided, event
 *                      timestamps are computed relative to the plan's start date
 *                      (deterministic, useful for tests and future-dated plans).
 *                      Defaults to today.
 */
export function materializePlanEvents(
  plan: IntensivePlan,
  dayIndex: number,
  upTo: Date = new Date(),
  startedAtISO?: string,
): DomainEvent[] {
  const out: DomainEvent[] = [];
  const days: DailyBlueprint[] = plan.daily.slice(0, Math.max(1, dayIndex));

  // Base date is the plan start date (or today when not provided).
  const planStart = startedAtISO ? new Date(startedAtISO) : new Date();

  for (const day of days) {
    // Compute the calendar date this day corresponds to.
    const dayBase = new Date(planStart);
    dayBase.setDate(planStart.getDate() + (day.dayIndex - 1));

    const offset = day.dayIndex - dayIndex; // 0 = current day, negative = past days

    for (const item of day.items) {
      const ev = itemToEvent(item, dayBase);
      if (!ev) continue;
      // For the current day only include items whose scheduled time has already passed.
      if (offset === 0 && new Date(ev.createdAt).getTime() > upTo.getTime()) continue;
      out.push(ev);
    }
  }
  return out;
}
