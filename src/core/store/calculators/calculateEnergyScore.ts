import type { DomainEvent } from '../types/events';
import { byType, clamp, hoursSince, recencyWeight, resolveGoalWeights, weightedAverage, type ScoreCalculatorContext } from './_helpers';

const scoreMealCadence = (events: DomainEvent[], now: number) => {
  const lastMeal = [...byType(events, 'meal.logged'), ...byType(events, 'scan.completed')]
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .slice(-1)[0];
  const gap = hoursSince(lastMeal?.createdAt, now);

  if (gap === Infinity) {
    return 55;
  }

  if (gap <= 3.5) {
    return 88;
  }

  if (gap <= 5) {
    return 72;
  }

  return Math.max(30, 72 - (gap - 5) * 8);
};

export const calculateEnergyScore = ({ events, goals, now = Date.now() }: ScoreCalculatorContext) => {
  const weights = resolveGoalWeights(goals);
  const hydrationScore = weightedAverage(
    byType(events, 'hydration.logged').map((event) => ({
      value: Math.min(100, 45 + event.payload.ml / 12),
      weight: recencyWeight(event.createdAt, 6, now),
    })),
    55,
  );
  const mealScore = scoreMealCadence(events, now);
  const sleepScore = weightedAverage(
    byType(events, 'sleep.recorded').map((event) => ({
      value: ((event.payload.durationHours ?? event.payload.hours ?? 0) / 8) * 100 * (0.65 + (event.payload.quality ?? 0.75) * 0.35),
      weight: recencyWeight(event.createdAt, 24, now),
    })),
    60,
  );
  const scanScore = weightedAverage(
    byType(events, 'scan.completed').map((event) => ({
      value:
        event.payload.verdict === 'green'
          ? 82 + (event.payload.impactHints?.energy ?? 0)
          : event.payload.verdict === 'yellow'
            ? 60 + (event.payload.impactHints?.energy ?? 0)
            : 35 + (event.payload.impactHints?.energy ?? 0),
      weight: recencyWeight(event.createdAt, 8, now),
    })),
    58,
  );

  const weighted =
    hydrationScore * (0.18 + weights.hydration * 0.04) +
    mealScore * 0.3 +
    sleepScore * (0.22 + weights.sleep * 0.03) +
    scanScore * (0.22 + weights.energy * 0.04);

  const divisor = 0.92 + weights.hydration * 0.04 + weights.sleep * 0.03 + weights.energy * 0.04;

  return clamp(Math.round(weighted / divisor));
};
