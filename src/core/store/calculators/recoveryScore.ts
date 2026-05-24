import type { DomainEvent } from '../types/events';
import type { UserState } from '../types/state';
import { byType, clamp, filterToday } from './_helpers';

export function calculateRecoveryScore(events: DomainEvent[], _profile: UserState): number {
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');
  const sleep = byType(events, 'sleep.recorded').slice(-1)[0];
  const supplements = byType(today, 'supplement.taken').length;

  let base = 55;
  const hintSum = scans.reduce((a, s) => a + (s.payload.impactHints?.recovery ?? 0), 0);
  base += hintSum;

  if (sleep) {
    const q = sleep.payload.quality ?? 0.6;
    base += Math.round(q * 25);
    if (sleep.payload.hours >= 7) base += 6;
    if (sleep.payload.hours < 6) base -= 10;
  } else {
    base -= 5;
  }

  base += Math.min(supplements * 2, 8);

  const reds = scans.filter(s => s.payload.verdict === 'red').length;
  base -= reds * 4;

  return clamp(Math.round(base));
}
