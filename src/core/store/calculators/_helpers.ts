import type { DomainEvent } from '../types/events';

export const todayKey = (d: Date = new Date()) => d.toISOString().slice(0, 10);

export const isSameDay = (iso: string, day: string = todayKey()) => (iso || '').slice(0, 10) === day;

export const filterToday = (events: DomainEvent[], day: string = todayKey()) =>
  events.filter(e => isSameDay(e.timestamp, day));

export const byType = <T extends DomainEvent['type']>(events: DomainEvent[], type: T) =>
  events.filter(e => e.type === type) as Extract<DomainEvent, { type: T }>[];

export const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const hoursAgo = (iso?: string) => {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
};
