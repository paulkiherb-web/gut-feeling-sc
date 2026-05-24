export * from '../types/events';

export const ENGINE_GENERATED_EVENT_TYPES = new Set([
  'recommendation.generated',
  'insight.generated',
  'state.snapshot.generated',
]);

export const isEngineGeneratedEvent = (type: string) => ENGINE_GENERATED_EVENT_TYPES.has(type);
