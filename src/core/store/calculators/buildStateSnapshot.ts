import type { DomainEvent } from '../types/events';
import type { GoalState, StateSnapshot, UserState, NutritionState, HydrationState, RecoveryState, EnergyState, Scorecard } from '../types/state';
import { byType, filterToday, hoursAgo, todayKey } from './_helpers';
import { calculateEnergyScore } from './energyScore';
import { calculateRecoveryScore } from './recoveryScore';
import { calculateSleepScore } from './sleepScore';
import { calculateNutritionScore } from './nutritionScore';
import { calculateReadinessScore } from './readinessScore';
import { calculateGoalAlignmentScore } from './goalAlignmentScore';

const HYDRATION_TARGET_ML = 2000;

function buildNutrition(events: DomainEvent[]): NutritionState {
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');
  const meals = byType(today, 'meal.logged');

  const acc = meals.reduce((a, m) => ({
    kcal: a.kcal + (m.payload.kcal ?? 0),
    protein: a.protein + (m.payload.protein ?? 0),
    carbs: a.carbs + (m.payload.carbs ?? 0),
    fat: a.fat + (m.payload.fat ?? 0),
    fiber: a.fiber + (m.payload.fiber ?? 0),
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const lastMealAt = meals.slice(-1)[0]?.timestamp ?? scans.slice(-1)[0]?.timestamp;
  return {
    ...acc,
    greenCount: scans.filter(s => s.payload.verdict === 'green').length,
    yellowCount: scans.filter(s => s.payload.verdict === 'yellow').length,
    redCount: scans.filter(s => s.payload.verdict === 'red').length,
    meals: meals.length || scans.length,
    lastMealAt,
    hoursSinceLastMeal: lastMealAt ? Math.round(hoursAgo(lastMealAt) * 10) / 10 : undefined,
  };
}

function buildHydration(events: DomainEvent[]): HydrationState {
  const today = filterToday(events);
  const drinks = byType(today, 'hydration.logged');
  return {
    ml: drinks.reduce((a, d) => a + (d.payload.ml || 0), 0),
    targetMl: HYDRATION_TARGET_ML,
    lastDrinkAt: drinks.slice(-1)[0]?.timestamp,
  };
}

function buildRecovery(events: DomainEvent[]): RecoveryState {
  const last = byType(events, 'sleep.recorded').slice(-1)[0];
  return {
    sleepHours: last?.payload.hours,
    sleepQuality: last?.payload.quality,
    lastSleepAt: last?.timestamp,
  };
}

function buildEnergy(score: number, prev?: number): EnergyState {
  const trend: EnergyState['trend'] =
    prev == null ? 'flat' :
    score - prev > 4 ? 'rising' :
    prev - score > 4 ? 'declining' : 'flat';
  return { score, trend };
}

export function buildStateSnapshot(
  events: DomainEvent[],
  profile: UserState,
  goals: GoalState,
  prevSnapshot?: StateSnapshot,
): StateSnapshot {
  const nutrition = buildNutrition(events);
  const hydration = buildHydration(events);
  const recovery = buildRecovery(events);

  const energyScore   = calculateEnergyScore(events, profile);
  const recoveryScore = calculateRecoveryScore(events, profile);
  const sleepScore    = calculateSleepScore(events, profile);
  const nutritionScore= calculateNutritionScore(events, profile);
  const goalAlignment = calculateGoalAlignmentScore(events, goals);
  const readiness     = calculateReadinessScore({
    energy: energyScore, recovery: recoveryScore, sleep: sleepScore, nutrition: nutritionScore,
  });

  const scores: Scorecard = {
    energy: energyScore,
    recovery: recoveryScore,
    sleep: sleepScore,
    nutrition: nutritionScore,
    readiness,
    goalAlignment,
  };

  const energy = buildEnergy(energyScore, prevSnapshot?.scores.energy);

  // Trajectory
  const prevRead = prevSnapshot?.scores.readiness;
  const direction: StateSnapshot['trajectory']['direction'] =
    prevRead == null ? 'flat' :
    readiness - prevRead > 3 ? 'improving' :
    prevRead - readiness > 3 ? 'declining' : 'flat';

  const drivers: string[] = [];
  if (nutrition.redCount >= 2) drivers.push('Несколько «красных» выборов сегодня');
  if (nutrition.hoursSinceLastMeal && nutrition.hoursSinceLastMeal > 5) drivers.push(`Перерыв ${nutrition.hoursSinceLastMeal}ч без еды`);
  if (hydration.ml < 800) drivers.push('Низкое потребление воды');
  if (recovery.sleepHours != null && recovery.sleepHours < 6) drivers.push('Короткий сон');
  if (nutrition.greenCount >= 2) drivers.push(`${nutrition.greenCount} зелёных выбора усиливают цель`);

  return {
    generatedAt: new Date().toISOString(),
    date: todayKey(),
    nutrition,
    hydration,
    recovery,
    energy,
    scores,
    trajectory: { direction, confidence: drivers.length ? 0.75 : 0.5, drivers },
  };
}
