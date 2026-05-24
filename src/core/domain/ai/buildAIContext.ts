import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Insight, Prediction, Recommendation, StateSnapshot, UserState } from '../../store/types/state';
import { filterToday } from '../../store/calculators/_helpers';
import type { LongitudinalModel } from '../../longitudinal/engine/types';

export interface AILongitudinalContext {
  recurringPatterns: Array<{ id: string; title: string; strength: string; confidence: number }>;
  dominantSensitivities: Array<{ factor: string; weight: number }>;
  driftSignals: Array<{ id: string; domain: string; direction: string; urgency: string; title: string }>;
  recoveryLagDays: number;
  interventionResponsiveness: number;
  activeDays: number;
}

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
  longitudinal?: AILongitudinalContext;
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
  longitudinalModel?: LongitudinalModel | null,
): AIContext => {
  const base: AIContext = {
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
  };

  // Additive longitudinal injection — guarded, never throws
  if (longitudinalModel?.isDataSufficient) {
    try {
      const sig = longitudinalModel.personalSignature;
      base.longitudinal = {
        recurringPatterns: longitudinalModel.recurringPatterns.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          strength: p.strength,
          confidence: p.confidence,
        })),
        dominantSensitivities: sig.dominantFactors.map(f => ({
          factor: f.factor,
          weight: f.weight,
        })),
        driftSignals: longitudinalModel.driftSignals
          .filter(d => d.urgency !== 'low')
          .slice(0, 4)
          .map(d => ({
            id: d.id,
            domain: d.domain,
            direction: d.direction,
            urgency: d.urgency,
            title: d.title,
          })),
        recoveryLagDays: sig.recoveryProfile.lagDays,
        interventionResponsiveness: sig.recoveryProfile.effectivenessScore,
        activeDays: sig.activeDays,
      };
    } catch {
      // longitudinal injection is non-critical; silently skip
    }
  }

  return base;
};
