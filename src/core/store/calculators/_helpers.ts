import type { DomainEvent, DomainEventType } from '../types/events';
import type { GoalState, GoalWeights, UserState } from '../types/state';

export interface ScoreCalculatorContext {
  events: DomainEvent[];
  goals: GoalState;
  profile: UserState;
  now?: number;
}

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const buildId = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const todayKey = (date: Date = new Date()) => date.toISOString().slice(0, 10);

export const eventTime = (event: Pick<DomainEvent, 'createdAt'> & { timestamp?: string }) =>
  event.createdAt ?? event.timestamp ?? new Date().toISOString();

export const sortEvents = <T extends DomainEvent>(events: T[]) =>
  [...events].sort((left, right) => eventTime(left).localeCompare(eventTime(right)));

export const byType = <T extends DomainEventType>(events: DomainEvent[], type: T) =>
  events.filter((event) => event.type === type) as Extract<DomainEvent, { type: T }>[];

export const filterToday = (events: DomainEvent[], day: string = todayKey()) =>
  events.filter((event) => eventTime(event).slice(0, 10) === day);

export const hoursSince = (iso?: string, now: number = Date.now()) =>
  iso ? Math.max(0, (now - new Date(iso).getTime()) / 3_600_000) : Infinity;

export const recencyWeight = (iso?: string, halfLifeHours = 10, now: number = Date.now()) => {
  if (!iso) {
    return 0;
  }

  return Math.exp((-Math.LN2 * hoursSince(iso, now)) / Math.max(1, halfLifeHours));
};

export const weightedAverage = (entries: Array<{ value: number; weight: number }>, fallback = 50) => {
  const totalWeight = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);

  if (!totalWeight) {
    return fallback;
  }

  return entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / totalWeight;
};

const DEFAULT_GOAL_WEIGHTS: GoalWeights = {
  energy: 1,
  recovery: 1,
  sleep: 1,
  nutrition: 1,
  hydration: 1,
  goalAlignment: 1,
};

export const resolveGoalWeights = (goals: GoalState): GoalWeights => {
  const weights: GoalWeights = {
    ...DEFAULT_GOAL_WEIGHTS,
    ...goals.weights,
  };

  const focusKey = `${goals.primaryGoal ?? ''} ${goals.currentFocusState ?? ''}`.toLowerCase();

  if (focusKey.includes('energy') || focusKey.includes('focus')) {
    weights.energy += 0.35;
    weights.hydration += 0.2;
    weights.sleep += 0.1;
  }

  if (focusKey.includes('sleep')) {
    weights.sleep += 0.4;
    weights.recovery += 0.25;
  }

  if (focusKey.includes('recover') || focusKey.includes('recovery')) {
    weights.recovery += 0.4;
    weights.sleep += 0.2;
  }

  if (focusKey.includes('digest') || focusKey.includes('weight') || focusKey.includes('nutrition')) {
    weights.nutrition += 0.4;
    weights.goalAlignment += 0.15;
  }

  if (goals.dayGoal?.trim()) {
    weights.goalAlignment += 0.2;
  }

  return weights;
};

export const baselineHydrationTarget = (profile: UserState) => profile.hydrationTargetMl ?? 2_200;

export const baselineSleepTarget = (profile: UserState) => profile.sleepTargetHours ?? 8;
