export * from '../types/events';

export const ENGINE_GENERATED_EVENT_TYPES = new Set([
  'recommendation.generated',
  'insight.generated',
  'state.snapshot.generated',
]);

export const RECOMMENDATION_LIFECYCLE_TYPES = new Set([
  'recommendation.viewed',
  'recommendation.accepted',
  'recommendation.snoozed',
  'recommendation.ignored',
  'recommendation.completed',
  'recommendation.expired',
]);

export const isEngineGeneratedEvent = (type: string) => ENGINE_GENERATED_EVENT_TYPES.has(type);
export const isRecommendationLifecycleEvent = (type: string) => RECOMMENDATION_LIFECYCLE_TYPES.has(type);
