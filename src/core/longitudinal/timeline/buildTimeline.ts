import type { DomainEvent } from '../../store/types/events';
import type { NormalizedTimeline, TimelineItem, DayProxy } from './types';
import { buildDailyProxies, groupEventsByDay } from '../_shared/dailyBuckets';
import { buildId } from '../../store/calculators/_helpers';

const POOR_READINESS_THRESHOLD = 45;
const STRONG_READINESS_THRESHOLD = 70;
const INSTABILITY_SWING = 20; // min swing to count as instability
const MIN_OVERLOAD_DAYS = 2;
const MIN_RECOVERY_DAYS = 2;

const daysBetween = (a: string, b: string): number => {
  const msPerDay = 86_400_000;
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / msPerDay;
};

const hoursToIso = (baseIso: string, offsetHours: number): string => {
  return new Date(new Date(baseIso).getTime() + offsetHours * 3_600_000).toISOString();
};

const buildTimelineItems = (
  proxies: DayProxy[],
  grouped: Map<string, DomainEvent[]>,
): TimelineItem[] => {
  const items: TimelineItem[] = [];

  for (let i = 0; i < proxies.length; i++) {
    const today = proxies[i];
    const prev = proxies[i - 1];
    const next = proxies[i + 1];
    const todayEvents = grouped.get(today.day) ?? [];
    const eventIds = todayEvents.map((e) => e.id);

    // Positive shift: readiness jumps meaningfully
    if (prev && today.readinessProxy - prev.readinessProxy >= 15 && today.readinessProxy >= STRONG_READINESS_THRESHOLD) {
      items.push({
        id: buildId('tl'),
        type: 'positive-shift',
        at: `${today.day}T12:00:00.000Z`,
        label: 'Positive shift detected',
        description: `Readiness proxy rose by ${Math.round(today.readinessProxy - prev.readinessProxy)} points.`,
        before: prev,
        after: today,
        eventIds,
        significance: Math.min((today.readinessProxy - prev.readinessProxy) / 40, 1),
      });
    }

    // Intervention day
    if (today.hadRecoveryIntervention) {
      items.push({
        id: buildId('tl'),
        type: 'intervention',
        at: `${today.day}T09:00:00.000Z`,
        label: 'Recovery intervention',
        description: `Supplements and habits logged together.`,
        before: prev,
        after: next,
        eventIds,
        significance: 0.6,
      });
    }

    // Overload window: 2+ consecutive low-readiness days
    if (
      today.readinessProxy < POOR_READINESS_THRESHOLD &&
      next &&
      next.readinessProxy < POOR_READINESS_THRESHOLD &&
      (i === 0 || (proxies[i - 1]?.readinessProxy ?? 100) >= POOR_READINESS_THRESHOLD)
    ) {
      const windowEnd =
        proxies.slice(i).findIndex((p, offset) => offset > 0 && p.readinessProxy >= POOR_READINESS_THRESHOLD);
      const endIndex = windowEnd === -1 ? proxies.length - 1 : i + windowEnd - 1;
      const endDay = proxies[endIndex].day;
      const durationHours = daysBetween(today.day, endDay) * 24;
      items.push({
        id: buildId('tl'),
        type: 'overload-window',
        at: `${today.day}T00:00:00.000Z`,
        window: {
          startAt: `${today.day}T00:00:00.000Z`,
          endAt: `${endDay}T23:59:59.000Z`,
          durationHours,
        },
        label: 'Low-readiness window',
        description: `${Math.ceil(durationHours / 24)} days of below-threshold readiness proxy.`,
        before: prev,
        after: proxies[endIndex + 1],
        eventIds,
        significance: Math.min(0.4 + (durationHours / 24 / 7), 1),
      });
    }

    // Recovery window: 2+ consecutive high-readiness days with interventions
    if (
      today.readinessProxy >= STRONG_READINESS_THRESHOLD &&
      today.hadRecoveryIntervention &&
      next &&
      next.readinessProxy >= STRONG_READINESS_THRESHOLD &&
      (i === 0 || (proxies[i - 1]?.readinessProxy ?? 0) < STRONG_READINESS_THRESHOLD)
    ) {
      items.push({
        id: buildId('tl'),
        type: 'recovery-window',
        at: `${today.day}T00:00:00.000Z`,
        label: 'Recovery window',
        description: 'Sustained high-readiness period with active interventions.',
        before: prev,
        after: today,
        eventIds,
        significance: 0.65,
      });
    }

    // Instability cluster: alternating high/low readiness within 3 days
    if (
      i >= 2 &&
      Math.abs(today.readinessProxy - proxies[i - 1].readinessProxy) >= INSTABILITY_SWING &&
      Math.abs(proxies[i - 1].readinessProxy - proxies[i - 2].readinessProxy) >= INSTABILITY_SWING
    ) {
      items.push({
        id: buildId('tl'),
        type: 'instability-cluster',
        at: `${today.day}T00:00:00.000Z`,
        label: 'Instability cluster',
        description: 'Alternating readiness swings observed across recent days.',
        eventIds,
        significance: 0.7,
      });
    }

    // State change: notable single-day change
    if (
      prev &&
      Math.abs(today.readinessProxy - prev.readinessProxy) >= 12 &&
      !items.some((item) => item.type === 'positive-shift' && item.at.startsWith(today.day))
    ) {
      const delta = today.readinessProxy - prev.readinessProxy;
      items.push({
        id: buildId('tl'),
        type: 'state-change',
        at: `${today.day}T12:00:00.000Z`,
        label: delta > 0 ? 'State improvement' : 'State decline',
        description: `Readiness proxy ${delta > 0 ? 'rose' : 'dropped'} by ${Math.abs(Math.round(delta))} points.`,
        before: prev,
        after: today,
        eventIds,
        significance: Math.min(Math.abs(delta) / 30, 0.8),
      });
    }
  }

  return items.sort((a, b) => a.at.localeCompare(b.at));
};

const spanDays = (proxies: DayProxy[]): number => {
  if (proxies.length < 2) return proxies.length;
  return daysBetween(proxies[0].day, proxies[proxies.length - 1].day) + 1;
};

export const buildTimeline = (events: DomainEvent[]): NormalizedTimeline => {
  const sorted = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const grouped = groupEventsByDay(sorted);
  const proxies = buildDailyProxies(sorted);
  const items = buildTimelineItems(proxies, grouped);

  return {
    items,
    dailyProxies: proxies,
    generatedAt: new Date().toISOString(),
    spanDays: spanDays(proxies),
    activeDays: proxies.length,
    eventCount: sorted.length,
  };
};
