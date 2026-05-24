import type { Scorecard } from '../types/state';
import { clamp, resolveGoalWeights } from './_helpers';
import type { GoalState } from '../types/state';

export const calculateReadinessScore = (scores: Omit<Scorecard, 'readiness'>, goals: GoalState) => {
  const weights = resolveGoalWeights(goals);
  const totalWeight =
    (1 + weights.energy * 0.25) +
    (1 + weights.recovery * 0.2) +
    (1 + weights.sleep * 0.2) +
    (1 + weights.nutrition * 0.15) +
    (1 + weights.goalAlignment * 0.1);

  const readiness =
    scores.energy * (1 + weights.energy * 0.25) +
    scores.recovery * (1 + weights.recovery * 0.2) +
    scores.sleep * (1 + weights.sleep * 0.2) +
    scores.nutrition * (1 + weights.nutrition * 0.15) +
    scores.goalAlignment * (1 + weights.goalAlignment * 0.1);

  return clamp(Math.round(readiness / totalWeight));
};
