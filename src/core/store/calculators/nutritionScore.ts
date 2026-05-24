import type { DomainEvent } from '../types/events';
import type { UserState } from '../types/state';
import { byType, clamp, filterToday } from './_helpers';

export function calculateNutritionScore(events: DomainEvent[], _profile: UserState): number {
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');
  const meals = byType(today, 'meal.logged');

  if (scans.length + meals.length === 0) return 50;

  const greens = scans.filter(s => s.payload.verdict === 'green').length;
  const yellows = scans.filter(s => s.payload.verdict === 'yellow').length;
  const reds = scans.filter(s => s.payload.verdict === 'red').length;
  const total = greens + yellows + reds || 1;

  const verdictScore = (greens * 100 + yellows * 60 + reds * 20) / total;

  // Macro coverage from logged meals
  const protein = meals.reduce((a, m) => a + (m.payload.protein ?? 0), 0);
  const fiber = meals.reduce((a, m) => a + (m.payload.fiber ?? 0), 0);
  let macroBonus = 0;
  if (protein > 60) macroBonus += 8;
  if (fiber > 15) macroBonus += 6;

  const hintSum = scans.reduce((a, s) => a + (s.payload.impactHints?.nutrition ?? 0), 0);

  return clamp(Math.round(verdictScore + macroBonus + hintSum));
}
