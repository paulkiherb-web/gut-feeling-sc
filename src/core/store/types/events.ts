// Unified event system — every user/system action becomes an event.
// Events are append-only, persistable, and feed all derived state.

export type EventSource = 'scanner' | 'day' | 'home' | 'assistant' | 'profile' | 'system' | 'reminder';

export type DomainEventType =
  | 'scan.completed'
  | 'meal.logged'
  | 'hydration.logged'
  | 'supplement.taken'
  | 'habit.completed'
  | 'sleep.recorded'
  | 'recommendation.shown'
  | 'recommendation.completed'
  | 'insight.generated';

export interface BaseEvent<T extends DomainEventType, P> {
  id: string;
  type: T;
  timestamp: string;   // ISO
  source: EventSource;
  payload: P;
  userId?: string;
}

// Verdicts kept loosely typed to avoid circular deps with profile.ts
export type ScanVerdict = 'green' | 'yellow' | 'red';

export interface ScanCompletedPayload {
  scanId: string;
  verdict: ScanVerdict;
  category?: string;            // food | drink | supplement
  title: string;                // food_name
  confidence?: number;          // 0..1
  ingredients?: string[];
  recommendation?: string;
  imageUrl?: string;
  // Optional impact hints from analyzer (lightweight signal, calculators may ignore)
  impactHints?: {
    energy?: number;            // -10..+10
    recovery?: number;
    nutrition?: number;
    goalAlignment?: number;
  };
}

export interface MealLoggedPayload {
  mealId: string;
  scanId?: string;
  title: string;
  verdict?: ScanVerdict;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface HydrationLoggedPayload {
  ml: number;
  beverage?: 'water' | 'tea' | 'coffee' | 'other';
}

export interface SupplementTakenPayload {
  supplementId: string;
  name: string;
  doseMg?: number;
}

export interface HabitCompletedPayload {
  habitId: string;
  name: string;
  streak?: number;
}

export interface SleepRecordedPayload {
  hours: number;
  quality?: number; // 0..1
  bedTime?: string;
  wakeTime?: string;
}

export interface RecommendationShownPayload {
  recommendationId: string;
  title: string;
  category?: string;
}

export interface RecommendationCompletedPayload {
  recommendationId: string;
  outcome?: 'done' | 'skipped' | 'snoozed';
}

export interface InsightGeneratedPayload {
  insightId: string;
  title: string;
  body: string;
  confidence?: number;
  signals?: string[];
}

export type ScanCompletedEvent          = BaseEvent<'scan.completed', ScanCompletedPayload>;
export type MealLoggedEvent             = BaseEvent<'meal.logged', MealLoggedPayload>;
export type HydrationLoggedEvent        = BaseEvent<'hydration.logged', HydrationLoggedPayload>;
export type SupplementTakenEvent        = BaseEvent<'supplement.taken', SupplementTakenPayload>;
export type HabitCompletedEvent         = BaseEvent<'habit.completed', HabitCompletedPayload>;
export type SleepRecordedEvent          = BaseEvent<'sleep.recorded', SleepRecordedPayload>;
export type RecommendationShownEvent    = BaseEvent<'recommendation.shown', RecommendationShownPayload>;
export type RecommendationCompletedEvent = BaseEvent<'recommendation.completed', RecommendationCompletedPayload>;
export type InsightGeneratedEvent       = BaseEvent<'insight.generated', InsightGeneratedPayload>;

export type DomainEvent =
  | ScanCompletedEvent
  | MealLoggedEvent
  | HydrationLoggedEvent
  | SupplementTakenEvent
  | HabitCompletedEvent
  | SleepRecordedEvent
  | RecommendationShownEvent
  | RecommendationCompletedEvent
  | InsightGeneratedEvent;

export const newEvent = <T extends DomainEvent>(e: Omit<T, 'id' | 'timestamp'> & Partial<Pick<T, 'id' | 'timestamp'>>): T => ({
  id: e.id ?? (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
  timestamp: e.timestamp ?? new Date().toISOString(),
  ...e,
} as T);
