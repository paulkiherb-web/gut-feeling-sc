import type { Insight, Recommendation, StateSnapshot } from './state';

export type EventSource =
  | 'scanner'
  | 'day'
  | 'home'
  | 'assistant'
  | 'profile'
  | 'system'
  | 'reminder'
  | 'import'
  | 'sync';

export type ScanVerdict = 'green' | 'yellow' | 'red';

export type DomainEventType =
  | 'scan.completed'
  | 'meal.logged'
  | 'hydration.logged'
  | 'supplement.taken'
  | 'habit.completed'
  | 'sleep.recorded'
  | 'recovery.recorded'
  | 'recommendation.generated'
  | 'recommendation.viewed'
  | 'recommendation.accepted'
  | 'recommendation.snoozed'
  | 'recommendation.ignored'
  | 'recommendation.completed'
  | 'recommendation.expired'
  | 'insight.generated'
  | 'state.snapshot.generated'
  // Sprint 3: scan-course impact actions
  | 'scan.course.accepted'
  | 'scan.course.already_consumed'
  | 'scan.course.smoothed'
  | 'scan.course.replaced'
  | 'scan.course.noted';

export interface BaseEvent<T extends DomainEventType, P> {
  id: string;
  type: T;
  createdAt: string;
  source: EventSource;
  confidence: number;
  payload: P;
  timestamp?: string;
}

export interface ScanCompletedPayload {
  scanId?: string;
  verdict: ScanVerdict;
  title?: string;
  productName?: string;
  category?: string;
  recommendation?: string;
  ingredients?: string[];
  imageUrl?: string;
  confidence?: number;
  details?: string;
  stateLabel?: string;
  contextualRecommendations?: string[];
  impactHints?: {
    energy?: number;
    recovery?: number;
    nutrition?: number;
    hydration?: number;
    goalAlignment?: number;
    readiness?: number;
  };
}

export interface MealLoggedPayload {
  mealId?: string;
  title?: string;
  name?: string;
  scanId?: string;
  verdict?: ScanVerdict;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  notes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mealContext?: any;
}

export interface HydrationLoggedPayload {
  ml: number;
  beverage?: 'water' | 'tea' | 'coffee' | 'electrolyte' | 'other';
  source?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hydrationImpact?: any;
}

export interface SupplementTakenPayload {
  supplementId?: string;
  name: string;
  doseMg?: number;
  notes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intervention?: any;
}

export interface HabitCompletedPayload {
  habitId?: string;
  name: string;
  streak?: number;
  duration?: number;
  notes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  habitSignal?: any;
}

export interface SleepRecordedPayload {
  hours?: number;
  durationHours?: number;
  quality?: number;
  bedTime?: string;
  wakeTime?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sleepImpact?: any;
}

export interface RecoveryRecordedPayload {
  soreness?: number;
  stressLoad?: number;
  restingHeartRate?: number;
  subjectiveScore?: number;
  notes?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recoveryImpact?: any;
}

export interface RecommendationGeneratedPayload {
  recommendation: Recommendation;
}

export interface RecommendationViewedPayload {
  recommendationId: string;
  category?: string;
}

export interface RecommendationAcceptedPayload {
  recommendationId: string;
  category?: string;
  interventionType?: string;
  preStateScores?: Partial<Record<string, number>>;
  expectedImpact?: Partial<Record<string, number>>;
  estimatedEffectWindowHours?: number;
}

export interface RecommendationSnoozedPayload {
  recommendationId: string;
  category?: string;
  snoozedUntil: string;
}

export interface RecommendationIgnoredPayload {
  recommendationId: string;
  category?: string;
  interventionType?: string;
}

export interface RecommendationCompletedPayload {
  recommendationId: string;
  outcome?: 'done' | 'skipped' | 'snoozed';
  category?: string;
  interventionType?: string;
}

export interface RecommendationExpiredPayload {
  recommendationId: string;
  category?: string;
}

export interface InsightGeneratedPayload {
  insight: Insight;
}

export interface StateSnapshotGeneratedPayload {
  snapshot: StateSnapshot;
}

// Sprint 3: scan-course impact event payload
export interface ScanCourseActionEventPayload {
  scanId?: string;
  activeCourse: string;
  impactStatus: string;
  affectedDomains: string[];
  selectedAction: string;
  timestamp: string;
}

export type ScanCompletedEvent = BaseEvent<'scan.completed', ScanCompletedPayload>;
export type MealLoggedEvent = BaseEvent<'meal.logged', MealLoggedPayload>;
export type HydrationLoggedEvent = BaseEvent<'hydration.logged', HydrationLoggedPayload>;
export type SupplementTakenEvent = BaseEvent<'supplement.taken', SupplementTakenPayload>;
export type HabitCompletedEvent = BaseEvent<'habit.completed', HabitCompletedPayload>;
export type SleepRecordedEvent = BaseEvent<'sleep.recorded', SleepRecordedPayload>;
export type RecoveryRecordedEvent = BaseEvent<'recovery.recorded', RecoveryRecordedPayload>;
export type RecommendationGeneratedEvent = BaseEvent<'recommendation.generated', RecommendationGeneratedPayload>;
export type RecommendationViewedEvent = BaseEvent<'recommendation.viewed', RecommendationViewedPayload>;
export type RecommendationAcceptedEvent = BaseEvent<'recommendation.accepted', RecommendationAcceptedPayload>;
export type RecommendationSnoozedEvent = BaseEvent<'recommendation.snoozed', RecommendationSnoozedPayload>;
export type RecommendationIgnoredEvent = BaseEvent<'recommendation.ignored', RecommendationIgnoredPayload>;
export type RecommendationCompletedEvent = BaseEvent<'recommendation.completed', RecommendationCompletedPayload>;
export type RecommendationExpiredEvent = BaseEvent<'recommendation.expired', RecommendationExpiredPayload>;
export type InsightGeneratedEvent = BaseEvent<'insight.generated', InsightGeneratedPayload>;
export type StateSnapshotGeneratedEvent = BaseEvent<'state.snapshot.generated', StateSnapshotGeneratedPayload>;
// Sprint 3: scan-course impact events
export type ScanCourseAcceptedEvent = BaseEvent<'scan.course.accepted', ScanCourseActionEventPayload>;
export type ScanCourseAlreadyConsumedEvent = BaseEvent<'scan.course.already_consumed', ScanCourseActionEventPayload>;
export type ScanCourseSmoothedEvent = BaseEvent<'scan.course.smoothed', ScanCourseActionEventPayload>;
export type ScanCourseReplacedEvent = BaseEvent<'scan.course.replaced', ScanCourseActionEventPayload>;
export type ScanCourseNotedEvent = BaseEvent<'scan.course.noted', ScanCourseActionEventPayload>;

export type DomainEvent =
  | ScanCompletedEvent
  | MealLoggedEvent
  | HydrationLoggedEvent
  | SupplementTakenEvent
  | HabitCompletedEvent
  | SleepRecordedEvent
  | RecoveryRecordedEvent
  | RecommendationGeneratedEvent
  | RecommendationViewedEvent
  | RecommendationAcceptedEvent
  | RecommendationSnoozedEvent
  | RecommendationIgnoredEvent
  | RecommendationCompletedEvent
  | RecommendationExpiredEvent
  | InsightGeneratedEvent
  | StateSnapshotGeneratedEvent
  // Sprint 3
  | ScanCourseAcceptedEvent
  | ScanCourseAlreadyConsumedEvent
  | ScanCourseSmoothedEvent
  | ScanCourseReplacedEvent
  | ScanCourseNotedEvent;

export type EventBuilderInput<T extends DomainEvent> = Omit<T, 'id' | 'createdAt' | 'confidence'> & {
  id?: string;
  createdAt?: string;
  confidence?: number;
  timestamp?: string;
};

const buildId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const normalizeEvent = <T extends DomainEvent>(event: EventBuilderInput<T> | T): T => {
  const createdAt = event.createdAt ?? event.timestamp ?? new Date().toISOString();

  return {
    ...event,
    id: event.id ?? buildId(),
    createdAt,
    confidence: event.confidence ?? 0.8,
    timestamp: createdAt,
  } as T;
};

export const newEvent = <T extends DomainEvent>(event: EventBuilderInput<T>): T => normalizeEvent<T>(event);
