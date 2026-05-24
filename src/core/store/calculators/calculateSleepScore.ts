import { byType, clamp, hoursSince, recencyWeight, resolveGoalWeights, weightedAverage, type ScoreCalculatorContext } from './_helpers';

export const calculateSleepScore = ({ events, goals, profile, now = Date.now() }: ScoreCalculatorContext) => {
  const weights = resolveGoalWeights(goals);
  const sleepTarget = profile.sleepTargetHours ?? 8;

  const sleepEvents = byType(events, 'sleep.recorded');
  const sleepSignal = weightedAverage(
    sleepEvents.map((event) => {
      const duration = event.payload.durationHours ?? event.payload.hours ?? 0;
      const durationScore = Math.max(15, 100 - Math.abs(sleepTarget - duration) * 18);

      return {
        value: durationScore * 0.7 + (event.payload.quality ?? 0.72) * 30,
        weight: recencyWeight(event.createdAt, 32, now),
      };
    }),
    58,
  );

  const lateMealPenalty = weightedAverage(
    byType(events, 'meal.logged').map((event) => {
      const hour = new Date(event.createdAt).getHours();
      return {
        value: hour >= 21 ? 38 : hour >= 19 ? 58 : 82,
        weight: recencyWeight(event.createdAt, 20, now),
      };
    }),
    72,
  );

  const bedtimeRegularity = weightedAverage(
    sleepEvents.map((event) => {
      const bedtime = event.payload.bedTime;
      if (!bedtime) {
        return { value: 68, weight: recencyWeight(event.createdAt, 48, now) };
      }

      const hour = new Date(bedtime).getHours();
      const variance = Math.abs(23 - hour);
      return {
        value: Math.max(40, 92 - variance * 12),
        weight: recencyWeight(event.createdAt, 48, now),
      };
    }),
    66,
  );

  const latestSleepEvent = sleepEvents[sleepEvents.length - 1];
  const sleepFreshness = sleepEvents.length ? Math.max(45, 100 - hoursSince(latestSleepEvent?.createdAt, now) * 1.6) : 55;
  const weighted =
    sleepSignal * (0.46 + weights.sleep * 0.05) +
    lateMealPenalty * 0.18 +
    bedtimeRegularity * 0.18 +
    sleepFreshness * 0.18;

  return clamp(Math.round(weighted / (1 + weights.sleep * 0.05)));
};
