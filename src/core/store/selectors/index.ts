import type { AppState } from '../appStore';

export const selectStateSnapshot = (state: AppState) => state.stateSnapshot;
export const selectEnergyScore = (state: AppState) => state.scores.energy;
export const selectRecoveryScore = (state: AppState) => state.scores.recovery;
export const selectSleepScore = (state: AppState) => state.scores.sleep;
export const selectReadiness = (state: AppState) => state.scores.readiness;
export const selectGoalAlignment = (state: AppState) => state.scores.goalAlignment;
export const selectPredictions = (state: AppState) => state.predictions;
export const selectTrajectory = (state: AppState) => state.stateSnapshot?.trajectory ?? null;
export const selectRecommendations = (state: AppState) => state.recommendations;
export const selectInsights = (state: AppState) => state.insights;

export const selectSnapshot = selectStateSnapshot;
export const selectCurrentEnergy = selectEnergyScore;
export const selectCurrentRecovery = selectRecoveryScore;
export const selectCurrentNutrition = (state: AppState) => state.scores.nutrition;
export const selectTodayRecommendations = selectRecommendations;
export const selectNextBestAction = (state: AppState) =>
  state.recommendations.find((item) => item.kind === 'next-best') ?? state.recommendations[0] ?? null;
export const selectRecentInsights = (state: AppState) => state.insights.slice(0, 5);
export const selectHydration = (state: AppState) => state.hydration;
export const selectMealsToday = (state: AppState) => {
  const today = new Date().toISOString().slice(0, 10);
  return state.meals.filter((meal) => meal.at.startsWith(today));
};
