import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Insight, Prediction, Recommendation, StateSnapshot, UserState } from '../../store/types/state';
import { filterToday } from '../../store/calculators/_helpers';

export interface AIContext {
  profile: UserState;
  goals: GoalState;
  stateSnapshot: StateSnapshot;
  goalAlignment: number;
  predictions: Prediction[];
  recentEvents: Array<{ type: string; at: string; summary: string }>;
  todayEvents: Array<{ type: string; at: string; summary: string }>;
  activeRecommendations: Array<Pick<Recommendation, 'id' | 'title' | 'category' | 'priority' | 'kind'>>;
  insights: Array<Pick<Insight, 'id' | 'title' | 'kind' | 'confidence'>>;
}

const summarizeEvent = (event: DomainEvent) => {
  switch (event.type) {
    case 'scan.completed':
      return `${event.payload.verdict.toUpperCase()} · ${event.payload.title}`;
    case 'meal.logged':
      return `Meal · ${event.payload.title}`;
    case 'hydration.logged':
      return `Hydration +${event.payload.ml}ml`;
    case 'supplement.taken':
      return `Supplement · ${event.payload.name}`;
    case 'habit.completed':
      return `Habit · ${event.payload.name}`;
    case 'sleep.recorded':
      return `Sleep · ${event.payload.durationHours ?? event.payload.hours ?? 0}h`;
    case 'recovery.recorded':
      return 'Recovery signal updated';
    case 'recommendation.completed':
      return `Recommendation ${event.payload.outcome ?? 'done'}`;
    default:
      return event.type;
  }
};

export const buildAIContext = (
  profile: UserState,
  goals: GoalState,
  stateSnapshot: StateSnapshot,
  predictions: Prediction[],
  recentEvents: DomainEvent[],
  activeRecommendations: Recommendation[],
  insights: Insight[],
): AIContext => ({
  profile,
  goals,
  stateSnapshot,
  goalAlignment: stateSnapshot.scores.goalAlignment,
  predictions,
  recentEvents: recentEvents.slice(-30).map((event) => ({
    type: event.type,
    at: event.createdAt,
    summary: summarizeEvent(event),
  })),
  todayEvents: filterToday(recentEvents).map((event) => ({
    type: event.type,
    at: event.createdAt,
    summary: summarizeEvent(event),
  })),
  activeRecommendations: activeRecommendations
    .filter((item) => item.status === 'active')
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      kind: item.kind,
    })),
  insights: insights.map((item) => ({
    id: item.id,
    title: item.title,
    kind: item.kind,
    confidence: item.confidence,
  })),
});
