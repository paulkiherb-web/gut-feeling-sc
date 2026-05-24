import type { DomainEvent } from '../types/events';
import type { UserState } from '../types/state';
import { byType, clamp, filterToday, hoursAgo } from './_helpers';

// 0..100 — current energy proxy based on today's scans + meal timing + hydration + sleep
export function calculateEnergyScore(events: DomainEvent[], _profile: UserState): number {
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');
  const meals = byType(today, 'meal.logged');
  const hydration = byType(today, 'hydration.logged');
  const sleep = byType(events, 'sleep.recorded').slice(-1)[0];

  let base = 60;

  // Verdict balance
  const greens = scans.filter(s => s.payload.verdict === 'green').length;
  const reds   = scans.filter(s => s.payload.verdict === 'red').length;
  base += greens * 4 - reds * 6;

  // Meal recency — long gap drains energy
  const lastMeal = meals.slice(-1)[0]?.timestamp ?? scans.slice(-1)[0]?.timestamp;
  const gap = hoursAgo(lastMeal);
  if (gap > 5) base -= Math.min(20, (gap - 5) * 4);

  // Hydration
  const ml = hydration.reduce((a, h) => a + (h.payload.ml || 0), 0);
  if (ml < 500) base -= 8;
  else if (ml > 1500) base += 4;

  // Sleep
  if (sleep) {
    const h = sleep.payload.hours;
    if (h >= 7 && h <= 9) base += 8;
    else if (h < 6) base -= 12;
  }

  // Explicit impact hints from analyzer
  const hintSum = scans.reduce((a, s) => a + (s.payload.impactHints?.energy ?? 0), 0);
  base += hintSum;

  return clamp(Math.round(base));
}
