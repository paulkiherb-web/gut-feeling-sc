import { describe, expect, it } from 'vitest';
import { computeDualPath } from './computeDualPath';
import { materializePlanEvents } from './materializePlanEvents';
import type { IntensivePlan } from './types';
import { newEvent } from '@/core/store/types/events';

const plan: IntensivePlan = {
  id: 'plan-1',
  effort: 'balanced',
  title: 'Energy reset',
  oneLineWhy: 'Gentle structure for a steadier day.',
  badge: '⚡',
  tags: ['сон', 'вода', 'движение'],
  course: 'energy',
  durationDays: 3,
  expectedDelta: { energy: 10, sleep: 6, readiness: 8 },
  generatedAt: new Date('2026-05-26T06:00:00.000Z').toISOString(),
  daily: [
    {
      dayIndex: 1,
      items: [
        { id: 'water', time: '07:00', category: 'hydration', title: 'Стакан воды' },
        { id: 'breakfast', time: '08:00', category: 'meal', title: 'Белковый завтрак' },
        { id: 'walk', time: '12:00', category: 'movement', title: 'Прогулка', durationMin: 15 },
      ],
    },
  ],
};

const profile = {
  age: 34,
  gender: 'male' as const,
  heightCm: 182,
  weightKg: 82,
  diets: [],
  condition: 'healthy',
};

const goals = {
  primaryGoal: 'energy',
};

describe('materializePlanEvents', () => {
  it('builds scoreable events from the blueprint', () => {
    const events = materializePlanEvents(
      plan,
      1,
      new Date('2026-05-26T13:00:00.000Z'),
      '2026-05-26T06:00:00.000Z',
    );

    expect(events).toHaveLength(3);
    expect(events[0].type).toBe('hydration.logged');
    expect(events[1].type).toBe('meal.logged');
    expect(events[1].payload).toMatchObject({ verdict: 'green', protein: expect.any(Number) });
    expect(events[2].type).toBe('habit.completed');
  });
});

describe('computeDualPath', () => {
  it('keeps ghost score independent from a real red event', () => {
    const realEvents = [
      newEvent({
        type: 'scan.completed',
        source: 'scanner',
        createdAt: '2026-05-26T09:00:00.000Z',
        payload: {
          verdict: 'red' as const,
          productName: 'Пицца',
        },
      }),
    ];

    const result = computeDualPath({
      events: realEvents,
      profile,
      goals,
      plan,
      startedAtISO: '2026-05-26T06:00:00.000Z',
    });

    expect(result.realScores.readiness).toBeLessThan(result.ghostScores.readiness);
    expect(result.plannedEvents.every((event) => event.type !== 'scan.completed')).toBe(true);
    expect(result.delta).toBeGreaterThan(0);
  });
});
