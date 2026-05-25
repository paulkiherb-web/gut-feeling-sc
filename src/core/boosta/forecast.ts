import type { BoostaEvent } from '@/core/store/slices/boostaSlice';

export function projectCourse(events: BoostaEvent[], horizon = 90): {
  ifNothing: number;
  ifReal: number;
  ifGhost: number;
} {
  if (events.length < 7) {
    return { ifNothing: 0, ifReal: 5, ifGhost: 60 };
  }

  const avgRealDailyDelta = events.reduce((a, e) => a + e.impactReal, 0) / 30;
  const avgGhostDailyDelta = events.reduce((a, e) => a + e.impactGhost, 0) / 30;

  const ifNothing = 0;
  const ifReal = Math.max(0, Math.min(100, avgRealDailyDelta * horizon * 0.3));
  const ifGhost = Math.max(0, Math.min(100, avgGhostDailyDelta * horizon * 0.5));

  return { ifNothing: Math.round(ifNothing), ifReal: Math.round(ifReal), ifGhost: Math.round(ifGhost) };
}
