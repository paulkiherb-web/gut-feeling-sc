import type { DomainEvent } from '../types/events';
import type { GoalState } from '../types/state';
import { byType, clamp, filterToday } from './_helpers';

// 0..100 — how today's choices match the active goal
export function calculateGoalAlignmentScore(events: DomainEvent[], goals: GoalState): number {
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');
  if (!scans.length) return 50;

  const greens = scans.filter(s => s.payload.verdict === 'green').length;
  const reds = scans.filter(s => s.payload.verdict === 'red').length;

  let base = 50 + greens * 8 - reds * 12;

  const hintSum = scans.reduce((a, s) => a + (s.payload.impactHints?.goalAlignment ?? 0), 0);
  base += hintSum;

  // Soft signal: if user has a written day goal, treat every green as stronger alignment
  if (goals.dayGoal && goals.dayGoal.trim()) base += greens * 2;

  return clamp(Math.round(base));
}
