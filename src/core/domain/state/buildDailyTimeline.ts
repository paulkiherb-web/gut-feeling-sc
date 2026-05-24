import type { DomainEvent } from '../../store/types/events';
import { filterToday } from '../../store/calculators/_helpers';

export interface TimelineEntry {
  id: string;
  time: string;         // HH:MM
  iso: string;
  kind: 'scan' | 'meal' | 'hydration' | 'supplement' | 'habit' | 'sleep' | 'insight';
  title: string;
  subtitle?: string;
  verdict?: 'green' | 'yellow' | 'red';
  meta?: Record<string, unknown>;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

export function buildDailyTimeline(events: DomainEvent[]): TimelineEntry[] {
  const today = filterToday(events);
  const out: TimelineEntry[] = today.map(e => {
    switch (e.type) {
      case 'scan.completed':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'scan',
          title: e.payload.title, subtitle: e.payload.recommendation, verdict: e.payload.verdict };
      case 'meal.logged':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'meal',
          title: e.payload.title,
          subtitle: e.payload.kcal ? `${e.payload.kcal} ккал · ${e.payload.protein ?? 0}г белка` : undefined,
          verdict: e.payload.verdict };
      case 'hydration.logged':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'hydration',
          title: `${e.payload.ml} мл ${e.payload.beverage ?? 'воды'}` };
      case 'supplement.taken':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'supplement', title: e.payload.name };
      case 'habit.completed':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'habit', title: e.payload.name };
      case 'sleep.recorded':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'sleep',
          title: `Сон ${e.payload.durationHours ?? e.payload.hours ?? 0}ч` };
      case 'insight.generated':
        return { id: e.id, iso: e.createdAt, time: fmt(e.createdAt), kind: 'insight',
          title: e.payload.insight.title, subtitle: e.payload.insight.body };
      default:
        return null;
    }
  }).filter(Boolean) as TimelineEntry[];

  return out.sort((a, b) => a.iso.localeCompare(b.iso));
}
