import { byType, clamp, recencyWeight, resolveGoalWeights, weightedAverage, type ScoreCalculatorContext } from './_helpers';

const goalKeywordScore = (value?: string) => {
  const normalized = value?.toLowerCase() ?? '';

  if (!normalized) {
    return 1;
  }

  if (normalized.includes('sleep') || normalized.includes('сон')) {
    return 1.15;
  }

  if (normalized.includes('energy') || normalized.includes('focus') || normalized.includes('энерг')) {
    return 1.2;
  }

  if (normalized.includes('recover') || normalized.includes('восст')) {
    return 1.18;
  }

  if (normalized.includes('weight') || normalized.includes('digest') || normalized.includes('питан')) {
    return 1.12;
  }

  return 1.05;
};

export const calculateGoalAlignment = ({ events, goals, now = Date.now() }: ScoreCalculatorContext) => {
  const weights = resolveGoalWeights(goals);
  const focusMultiplier = goalKeywordScore(goals.primaryGoal) * goalKeywordScore(goals.currentFocusState);

  const alignment = weightedAverage(
    [...byType(events, 'scan.completed'), ...byType(events, 'habit.completed'), ...byType(events, 'recommendation.completed')].map((event) => {
      const base =
        event.type === 'scan.completed'
          ? event.payload.verdict === 'green'
            ? 88 + (event.payload.impactHints?.goalAlignment ?? 0)
            : event.payload.verdict === 'red'
              ? 25 + (event.payload.impactHints?.goalAlignment ?? 0)
              : 58 + (event.payload.impactHints?.goalAlignment ?? 0)
          : event.type === 'habit.completed'
            ? 78 + Math.min(14, (event.payload.streak ?? 0) * 1.8)
            : event.payload.outcome === 'done'
              ? 82
              : event.payload.outcome === 'snoozed'
                ? 56
                : 42;

      return {
        value: base * focusMultiplier,
        weight: recencyWeight(event.createdAt, 18, now),
      };
    }),
    goals.dayGoal?.trim() ? 62 : 52,
  );

  return clamp(Math.round(alignment / Math.max(1, focusMultiplier / (1 + weights.goalAlignment * 0.04))));
};
