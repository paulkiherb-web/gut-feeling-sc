import { byType, clamp, hoursSince, recencyWeight, resolveGoalWeights, weightedAverage, type ScoreCalculatorContext } from './_helpers';

export const calculateNutritionScore = ({ events, goals, now = Date.now() }: ScoreCalculatorContext) => {
  const weights = resolveGoalWeights(goals);
  const meals = byType(events, 'meal.logged');

  const mealQuality = weightedAverage(
    [...byType(events, 'scan.completed'), ...meals].map((event) => ({
      value:
        event.type === 'meal.logged'
          ? event.payload.verdict === 'green'
            ? 85
            : event.payload.verdict === 'red'
              ? 35
              : 62
          : event.payload.verdict === 'green'
            ? 84 + (event.payload.impactHints?.nutrition ?? 0)
            : event.payload.verdict === 'red'
              ? 28 + (event.payload.impactHints?.nutrition ?? 0)
              : 58 + (event.payload.impactHints?.nutrition ?? 0),
      weight: recencyWeight(event.createdAt, 10, now),
    })),
    55,
  );

  const macros = weightedAverage(
    meals.map((event) => ({
      value:
        Math.min(35, (event.payload.protein ?? 0) * 0.7) +
        Math.min(20, (event.payload.fiber ?? 0) * 1.6) +
        Math.max(25, 40 - Math.max(0, (event.payload.kcal ?? 0) - 900) / 25),
      weight: recencyWeight(event.createdAt, 12, now),
    })),
    50,
  );

  const cadence = weightedAverage(
    meals.map((event, index, collection) => {
      const previous = collection[index - 1];
      const gap = previous ? Math.abs(hoursSince(previous.createdAt, new Date(event.createdAt).getTime())) : 4;

      return {
        value: gap >= 3 && gap <= 6 ? 84 : gap < 2 ? 58 : 42,
        weight: recencyWeight(event.createdAt, 12, now),
      };
    }),
    64,
  );

  const weighted =
    mealQuality * (0.46 + weights.nutrition * 0.05) +
    macros * 0.3 +
    cadence * 0.24;

  return clamp(Math.round(weighted / (1 + weights.nutrition * 0.05)));
};
