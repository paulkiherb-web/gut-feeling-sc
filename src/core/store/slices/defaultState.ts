import type { DomainEvent } from '../types/events';
import type {
  GoalState,
  HydrationState,
  RecoveryState,
  Scorecard,
  SleepState,
  UserState,
} from '../types/state';
import { byType, clamp, sortEvents } from '../calculators/_helpers';

export interface LoggedMeal {
  id: string;
  title: string;
  at: string;
  verdict?: 'green' | 'yellow' | 'red';
}

export interface LoggedSupplement {
  id: string;
  name: string;
  at: string;
}

export interface LoggedHabit {
  id: string;
  name: string;
  at: string;
  streak?: number;
}

export const EMPTY_SCORECARD: Scorecard = {
  energy: 0,
  recovery: 0,
  sleep: 0,
  nutrition: 0,
  readiness: 0,
  goalAlignment: 0,
};

export const DEFAULT_PROFILE: UserState = {
  diets: [],
  hydrationTargetMl: 2200,
  sleepTargetHours: 8,
};

export const DEFAULT_GOALS: GoalState = {
  primaryGoal: 'energy',
};

export const DEFAULT_HYDRATION: HydrationState = {
  ml: 0,
  targetMl: 2200,
  progress: 0,
  risk: 100,
};

export const DEFAULT_SLEEP: SleepState = {
  durationHours: 0,
  quality: 0,
  sleepDebtHours: 8,
  consistencyScore: 0,
};

export const DEFAULT_RECOVERY: RecoveryState = {
  score: 0,
  strain: 0,
  recoveryDebtHours: 0,
};

export const deriveMeals = (events: DomainEvent[]): LoggedMeal[] =>
  sortEvents([...byType(events, 'meal.logged'), ...byType(events, 'scan.completed')])
    .map((event) => ({
      id: event.type === 'meal.logged' ? event.payload.mealId : event.payload.scanId,
      title: event.payload.title,
      at: event.createdAt,
      verdict: event.payload.verdict,
    }))
    .slice(-200);

export const deriveSupplements = (events: DomainEvent[]): LoggedSupplement[] =>
  sortEvents(byType(events, 'supplement.taken'))
    .map((event) => ({
      id: event.payload.supplementId,
      name: event.payload.name,
      at: event.createdAt,
    }))
    .slice(-200);

export const deriveHabits = (events: DomainEvent[]): LoggedHabit[] =>
  sortEvents(byType(events, 'habit.completed'))
    .map((event) => ({
      id: event.payload.habitId,
      name: event.payload.name,
      at: event.createdAt,
      streak: event.payload.streak,
    }))
    .slice(-200);

export const mergeHydration = (current: HydrationState | null | undefined, fallback: HydrationState = DEFAULT_HYDRATION) => ({
  ...fallback,
  ...current,
  progress: clamp(current?.progress ?? fallback.progress, 0, 1),
});
