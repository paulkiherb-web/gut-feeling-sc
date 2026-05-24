import type { DomainEvent } from '../types/events';
import type { UserState } from '../types/state';
import { byType, clamp } from './_helpers';

export function calculateSleepScore(events: DomainEvent[], _profile: UserState): number {
  const sleep = byType(events, 'sleep.recorded').slice(-1)[0];
  if (!sleep) return 50;
  const { hours, quality = 0.65 } = sleep.payload;
  // Optimal 7.5h. Penalize too short or too long.
  const hoursScore = 100 - Math.min(50, Math.abs(7.5 - hours) * 14);
  const qScore = quality * 100;
  return clamp(Math.round(hoursScore * 0.6 + qScore * 0.4));
}
