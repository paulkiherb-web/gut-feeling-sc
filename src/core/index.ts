// Public surface of the new core architecture
export { useAppStore } from './store/appStore';
export * from './store/types/events';
export * from './store/types/state';
export * from './store/selectors';
export { eventDispatcher } from './services/events/eventDispatcher';
export { generateRecommendations } from './domain/recommendations/generateRecommendations';
export { buildAIContext } from './domain/ai/buildAIContext';
export { buildStateSnapshot } from './store/calculators/buildStateSnapshot';
export { buildDailyTimeline } from './domain/state/buildDailyTimeline';
export { deriveLocalInsights } from './services/insights';
export { useUnifiedState } from './hooks/useUnifiedState';
export { useRecommendations } from './hooks/useRecommendations';
export { useScores } from './hooks/useScores';
export { useInsights } from './hooks/useInsights';
export { useEventLogger } from './hooks/useEventLogger';
export { useCoreSync } from './hooks/useCoreSync';
