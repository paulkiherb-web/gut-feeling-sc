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

function isoForToday(time: string, dayOffset = 0): string {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(Number.isFinite(h) ? h : 8, Number.isFinite(m) ? m : 0, 0, 0);
  return d.toISOString();
}

function itemToEvent(item: BlueprintItem, dayOffset = 0): DomainEvent | null {
  const at = isoForToday(item.time, dayOffset);
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

// Build the ghost event stream up to "now" of dayIndex (1-based).
export function materializePlanEvents(plan: IntensivePlan, dayIndex: number, upTo = new Date()): DomainEvent[] {
  const out: DomainEvent[] = [];
  const days: DailyBlueprint[] = plan.daily.slice(0, Math.max(1, dayIndex));
  const today = new Date();
  const todayKey = today.toDateString();

  for (const day of days) {
    const offset = day.dayIndex - dayIndex; // 0 for today, negative for past
    for (const item of day.items) {
      const ev = itemToEvent(item, offset);
      if (!ev) continue;
      // For today, only include items whose time has passed
      if (offset === 0) {
        const evDate = new Date(ev.createdAt);
        if (evDate.toDateString() === todayKey && evDate.getTime() > upTo.getTime()) continue;
      }
      out.push(ev);
    }
  }
  return out;
}
