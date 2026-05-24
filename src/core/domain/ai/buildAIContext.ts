import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Recommendation, StateSnapshot, UserState } from '../../store/types/state';
import { filterToday } from '../../store/calculators/_helpers';

export interface AIContext {
  profile: UserState;
  goals: GoalState;
  snapshot: StateSnapshot;
  todayEvents: { type: string; at: string; summary: string }[];
  recentEvents: { type: string; at: string; summary: string }[];
  activeRecommendations: Pick<Recommendation, 'id' | 'title' | 'category' | 'priority'>[];
}

const summarize = (e: DomainEvent): string => {
  switch (e.type) {
    case 'scan.completed':       return `${e.payload.verdict.toUpperCase()} • ${e.payload.title}`;
    case 'meal.logged':          return `Meal • ${e.payload.title}${e.payload.kcal ? ` (${e.payload.kcal}kcal)` : ''}`;
    case 'hydration.logged':     return `Water +${e.payload.ml}ml`;
    case 'supplement.taken':     return `Supplement • ${e.payload.name}`;
    case 'habit.completed':      return `Habit • ${e.payload.name}`;
    case 'sleep.recorded':       return `Sleep • ${e.payload.hours}h`;
    case 'recommendation.completed': return `Rec done • ${e.payload.recommendationId}`;
    default: return e.type;
  }
};

export function buildAIContext(
  events: DomainEvent[],
  profile: UserState,
  goals: GoalState,
  snapshot: StateSnapshot,
  activeRecommendations: Recommendation[],
): AIContext {
  const today = filterToday(events).map(e => ({ type: e.type, at: e.timestamp, summary: summarize(e) }));
  const recent = events.slice(-30).map(e => ({ type: e.type, at: e.timestamp, summary: summarize(e) }));

  return {
    profile,
    goals,
    snapshot,
    todayEvents: today,
    recentEvents: recent,
    activeRecommendations: activeRecommendations.map(r => ({
      id: r.id, title: r.title, category: r.category, priority: r.priority,
    })),
  };
}
