import type { DailyBlueprint, IntensivePlan } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getIntensiveDayIndex(startedAtISO: string | null, now = new Date()): number {
  if (!startedAtISO) return 1;
  const startedAt = new Date(startedAtISO);
  if (Number.isNaN(startedAt.getTime())) return 1;
  return Math.max(1, Math.floor((now.getTime() - startedAt.getTime()) / DAY_MS) + 1);
}

export function getPlanDay(plan: IntensivePlan, dayIndex: number): DailyBlueprint | null {
  return plan.daily.find((day) => day.dayIndex === dayIndex) ?? plan.daily[0] ?? null;
}

export function getPlanStartDate(startedAtISO: string | null): Date {
  const base = startedAtISO ? new Date(startedAtISO) : new Date();
  if (Number.isNaN(base.getTime())) return new Date();
  base.setHours(0, 0, 0, 0);
  return base;
}

export function getPlanDayDate(startedAtISO: string | null, dayIndex: number): Date {
  const date = getPlanStartDate(startedAtISO);
  date.setDate(date.getDate() + Math.max(0, dayIndex - 1));
  return date;
}

export function toClockMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((value) => parseInt(value, 10));
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}
