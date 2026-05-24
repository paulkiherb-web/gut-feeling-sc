import type { AppState } from '../appStore';

export const selectCurrentEnergy    = (s: AppState) => s.scores?.energy ?? 0;
export const selectCurrentRecovery  = (s: AppState) => s.scores?.recovery ?? 0;
export const selectCurrentNutrition = (s: AppState) => s.scores?.nutrition ?? 0;
export const selectReadiness        = (s: AppState) => s.scores?.readiness ?? 0;
export const selectGoalAlignment    = (s: AppState) => s.scores?.goalAlignment ?? 0;
export const selectSnapshot         = (s: AppState) => s.stateSnapshot;
export const selectTodayRecommendations = (s: AppState) => s.recommendations;
export const selectNextBestAction   = (s: AppState) => s.recommendations[0] ?? null;
export const selectRecentInsights   = (s: AppState) => s.insights.slice(0, 5);
export const selectHydration        = (s: AppState) => s.hydration;
export const selectMealsToday       = (s: AppState) => {
  const today = new Date().toISOString().slice(0, 10);
  return s.meals.filter(m => m.at.startsWith(today));
};
