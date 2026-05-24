import { byType, clamp, recencyWeight, resolveGoalWeights, weightedAverage, type ScoreCalculatorContext } from './_helpers';

export const calculateRecoveryScore = ({ events, goals, now = Date.now() }: ScoreCalculatorContext) => {
  const weights = resolveGoalWeights(goals);

  const recoverySignals = byType(events, 'recovery.recorded').map((event) => {
    const sorenessPenalty = (event.payload.soreness ?? 4) * 4;
    const stressPenalty = (event.payload.stressLoad ?? 4) * 3;
    const subjective = (event.payload.subjectiveScore ?? 60) * 0.55;

    return {
      value: subjective + 38 - sorenessPenalty - stressPenalty,
      weight: recencyWeight(event.createdAt, 18, now),
    };
  });

  const sleepSignals = byType(events, 'sleep.recorded').map((event) => ({
    value: (event.payload.quality ?? 0.75) * 55 + Math.min(45, ((event.payload.durationHours ?? event.payload.hours ?? 0) / 8) * 45),
    weight: recencyWeight(event.createdAt, 28, now),
  }));

  const supplementation = weightedAverage(
    byType(events, 'supplement.taken').map((event) => ({
      value: 68,
      weight: recencyWeight(event.createdAt, 16, now),
    })),
    52,
  );

  const nutritionPenalty = weightedAverage(
    byType(events, 'scan.completed').map((event) => ({
      value: event.payload.verdict === 'red' ? 30 : event.payload.verdict === 'yellow' ? 55 : 78,
      weight: recencyWeight(event.createdAt, 14, now),
    })),
    60,
  );

  const weighted =
    weightedAverage(recoverySignals, 58) * (0.4 + weights.recovery * 0.05) +
    weightedAverage(sleepSignals, 60) * (0.3 + weights.sleep * 0.04) +
    supplementation * 0.12 +
    nutritionPenalty * 0.18;

  const divisor = 1 + weights.recovery * 0.05 + weights.sleep * 0.04;

  return clamp(Math.round(weighted / divisor));
};
