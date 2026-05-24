import type { DomainEvent, HydrationLoggedEvent, MealLoggedEvent, RecoveryRecordedEvent, ScanCompletedEvent, SleepRecordedEvent } from '../../store/types/events';
import type {
  BehavioralState,
  GoalState,
  HydrationState,
  NutritionState,
  RecoveryState,
  SleepState,
  StateSnapshot,
  StateTrajectoryPoint,
  UserState,
} from '../../store/types/state';
import {
  baselineHydrationTarget,
  baselineSleepTarget,
  buildId,
  byType,
  clamp,
  filterToday,
  hoursSince,
  recencyWeight,
  sortEvents,
  weightedAverage,
} from '../../store/calculators/_helpers';
import { buildScorecard } from '../scoring/buildScorecard';
import { buildPredictions } from './buildPredictions';
import { buildTrajectory } from './buildTrajectory';

const buildNutritionState = (events: DomainEvent[]): NutritionState => {
  const todayEvents = filterToday(events);
  const meals = byType(todayEvents, 'meal.logged');
  const scans = byType(todayEvents, 'scan.completed');
  const mergedMeals = sortEvents<MealLoggedEvent | ScanCompletedEvent>([...meals, ...scans]);
  const macroTotals = meals.reduce(
    (accumulator, meal) => ({
      kcal: accumulator.kcal + (meal.payload.kcal ?? 0),
      protein: accumulator.protein + (meal.payload.protein ?? 0),
      carbs: accumulator.carbs + (meal.payload.carbs ?? 0),
      fat: accumulator.fat + (meal.payload.fat ?? 0),
      fiber: accumulator.fiber + (meal.payload.fiber ?? 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
  const lastMealAt = mergedMeals[mergedMeals.length - 1]?.createdAt;

  return {
    ...macroTotals,
    greenCount: scans.filter((scan) => scan.payload.verdict === 'green').length + meals.filter((meal) => meal.payload.verdict === 'green').length,
    yellowCount: scans.filter((scan) => scan.payload.verdict === 'yellow').length + meals.filter((meal) => meal.payload.verdict === 'yellow').length,
    redCount: scans.filter((scan) => scan.payload.verdict === 'red').length + meals.filter((meal) => meal.payload.verdict === 'red').length,
    meals: mergedMeals.length,
    lastMealAt,
    hoursSinceLastMeal: lastMealAt ? Number(hoursSince(lastMealAt).toFixed(1)) : undefined,
    cadenceScore: clamp(
      weightedAverage(
        meals.map((meal, index, collection) => {
          const previous = collection[index - 1];
          const gap = previous ? Math.abs((new Date(meal.createdAt).getTime() - new Date(previous.createdAt).getTime()) / 3_600_000) : 4;
          return { value: gap >= 3 && gap <= 6 ? 85 : gap < 2 ? 58 : 46, weight: recencyWeight(meal.createdAt, 18) };
        }),
        mergedMeals.length ? 68 : 55,
      ),
    ),
  };
};

const buildHydrationState = (events: DomainEvent[], profile: UserState): HydrationState => {
  const drinks = byType(filterToday(events), 'hydration.logged');
  const sortedDrinks = sortEvents<HydrationLoggedEvent>(drinks);
  const lastDrinkAt = sortedDrinks[sortedDrinks.length - 1]?.createdAt;
  const targetMl = baselineHydrationTarget(profile);
  const ml = drinks.reduce((sum, event) => sum + event.payload.ml, 0);
  const progress = clamp(ml / targetMl, 0, 1);

  return {
    ml,
    targetMl,
    progress,
    risk: clamp((1 - progress) * 100, 0, 100),
    lastDrinkAt,
    hoursSinceLastDrink: lastDrinkAt ? Number(hoursSince(lastDrinkAt).toFixed(1)) : undefined,
  };
};

const buildSleepState = (events: DomainEvent[], profile: UserState): SleepState => {
  const allSleepEvents = sortEvents<SleepRecordedEvent>(byType(events, 'sleep.recorded'));
  const sleepEvent = allSleepEvents[allSleepEvents.length - 1];
  const durationHours = sleepEvent?.payload.durationHours ?? sleepEvent?.payload.hours ?? 0;
  const quality = sleepEvent?.payload.quality ?? (durationHours ? 0.72 : 0.6);
  const target = baselineSleepTarget(profile);

  return {
    durationHours,
    quality,
    sleepDebtHours: Math.max(0, target - durationHours),
    consistencyScore: sleepEvent?.payload.bedTime
      ? clamp(100 - Math.abs(23 - new Date(sleepEvent.payload.bedTime).getHours()) * 10)
      : 65,
    bedtime: sleepEvent?.payload.bedTime,
    wakeTime: sleepEvent?.payload.wakeTime,
    lastRecordedAt: sleepEvent?.createdAt,
  };
};

const buildRecoveryState = (events: DomainEvent[], scoresRecovery: number, sleep: SleepState): RecoveryState => {
  const allRecoveryEvents = sortEvents<RecoveryRecordedEvent>(byType(events, 'recovery.recorded'));
  const recoveryEvent = allRecoveryEvents[allRecoveryEvents.length - 1];

  return {
    score: scoresRecovery,
    strain: clamp(((recoveryEvent?.payload.stressLoad ?? 4) * 12) + sleep.sleepDebtHours * 9, 0, 100),
    recoveryDebtHours: sleep.sleepDebtHours + Math.max(0, ((recoveryEvent?.payload.stressLoad ?? 4) - 5) * 0.35),
    soreness: recoveryEvent?.payload.soreness,
    stressLoad: recoveryEvent?.payload.stressLoad,
    lastRecordedAt: recoveryEvent?.createdAt ?? sleep.lastRecordedAt,
  };
};

const buildBehavioralState = (events: DomainEvent[]): BehavioralState => {
  const todayEvents = filterToday(events);
  const habits = byType(todayEvents, 'habit.completed');
  const supplements = byType(todayEvents, 'supplement.taken');
  const recommendationEvents = byType(todayEvents, 'recommendation.completed');
  const recommendationCompletionRate = recommendationEvents.length
    ? recommendationEvents.filter((event) => event.payload.outcome === 'done').length / recommendationEvents.length
    : 0;

  return {
    habitsCompleted: habits.length,
    activeStreaks: Math.max(0, ...habits.map((event) => event.payload.streak ?? 0)),
    supplementCount: supplements.length,
    recommendationCompletionRate,
    adherenceScore: clamp(
      45 +
      habits.length * 8 +
      supplements.length * 5 +
      recommendationCompletionRate * 25,
    ),
  };
};

export interface BuildStateSnapshotInput {
  events: DomainEvent[];
  profile: UserState;
  goals: GoalState;
  previousSnapshot?: StateSnapshot;
}

export const buildStateSnapshot = ({
  events,
  profile,
  goals,
  previousSnapshot,
}: BuildStateSnapshotInput): StateSnapshot => {
  const orderedEvents = sortEvents(events);
  const scores = buildScorecard({ events: orderedEvents, goals, profile });
  const nutrition = buildNutritionState(orderedEvents);
  const hydration = buildHydrationState(orderedEvents, profile);
  const sleep = buildSleepState(orderedEvents, profile);
  const recovery = buildRecoveryState(orderedEvents, scores.recovery, sleep);
  const behavioral = buildBehavioralState(orderedEvents);
  const energyTrend = previousSnapshot
    ? scores.energy > previousSnapshot.scores.energy + 3
      ? 'rising'
      : scores.energy < previousSnapshot.scores.energy - 3
        ? 'declining'
        : 'flat'
    : 'flat';

  const energy = {
    score: scores.energy,
    trend: energyTrend,
    stability: clamp(100 - Math.abs((nutrition.hoursSinceLastMeal ?? 4) - 4) * 12 - (1 - hydration.progress) * 22),
    crashRisk: clamp((nutrition.hoursSinceLastMeal ?? 0) * 10 + (1 - hydration.progress) * 30 + sleep.sleepDebtHours * 8),
    contributors: [
      ...(hydration.progress < 0.5 ? ['Гидратация стала ограничителем'] : []),
      ...((nutrition.hoursSinceLastMeal ?? 0) > 4.5 ? ['Нужно окно для питания'] : []),
      ...(sleep.sleepDebtHours > 1 ? ['Сон снижает энергетический потолок'] : []),
    ],
  } as StateSnapshot['energy'];

  const predictions = buildPredictions({
    snapshot: { scores, hydration, nutrition, sleep, recovery, energy, behavioral },
    goals,
    recentEvents: orderedEvents.slice(-40),
  });
  const trajectory = buildTrajectory({
    currentSnapshot: { scores, hydration, nutrition, sleep, recovery },
    previousSnapshot,
    predictions,
    recentEvents: orderedEvents.slice(-24),
  });

  return {
    id: buildId('snapshot'),
    generatedAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
    windowStartedAt: orderedEvents[0]?.createdAt ?? new Date().toISOString(),
    windowEndedAt: orderedEvents[orderedEvents.length - 1]?.createdAt ?? new Date().toISOString(),
    derived: { energy, recovery, sleep, nutrition, hydration, behavioral },
    energy,
    recovery,
    sleep,
    nutrition,
    hydration,
    behavioral,
    scores,
    trajectory,
    predictions,
  };
};

export const buildTrajectoryPoint = (snapshot: StateSnapshot): StateTrajectoryPoint => ({
  id: snapshot.id,
  generatedAt: snapshot.generatedAt,
  readiness: snapshot.scores.readiness,
  energy: snapshot.scores.energy,
  direction: snapshot.trajectory.direction,
});
