import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Prediction, StateSnapshot } from '../../store/types/state';
import { buildId, clamp, hoursSince } from '../../store/calculators/_helpers';

const riskLevel = (score: number): Prediction['riskLevel'] => (score >= 75 ? 'high' : score >= 50 ? 'moderate' : 'low');

export interface BuildPredictionsInput {
  snapshot: Pick<StateSnapshot, 'scores' | 'hydration' | 'nutrition' | 'sleep' | 'recovery' | 'energy' | 'behavioral'>;
  goals: GoalState;
  recentEvents: DomainEvent[];
  now?: number;
}

export const buildPredictions = ({
  snapshot,
  goals,
  recentEvents,
  now = Date.now(),
}: BuildPredictionsInput): Prediction[] => {
  const energyCrashDrivers: string[] = [];
  const energyCrashScore =
    clamp(
      (snapshot.nutrition.hoursSinceLastMeal ?? 0) * 11 +
      (1 - snapshot.hydration.progress) * 35 +
      snapshot.sleep.sleepDebtHours * 9 +
      snapshot.energy.crashRisk * 0.3,
      0,
      100,
    );
  if ((snapshot.nutrition.hoursSinceLastMeal ?? 0) > 4.5) {
    energyCrashDrivers.push('Длинный интервал без еды');
  }
  if (snapshot.hydration.progress < 0.5) {
    energyCrashDrivers.push('Гидратация ниже половины цели');
  }

  const recoveryDrivers: string[] = [];
  const recoveryDeclineScore = clamp(
    snapshot.recovery.strain * 0.5 +
    snapshot.sleep.sleepDebtHours * 16 +
    Math.max(0, 65 - snapshot.recovery.score) * 0.6,
    0,
    100,
  );
  if (snapshot.recovery.strain > 60) {
    recoveryDrivers.push('Высокая системная нагрузка');
  }
  if (snapshot.recovery.recoveryDebtHours > 1) {
    recoveryDrivers.push('Накопленный recovery debt');
  }

  const sleepDrivers: string[] = [];
  const sleepInstabilityScore = clamp(
    snapshot.sleep.sleepDebtHours * 18 +
    Math.max(0, 70 - snapshot.sleep.consistencyScore) * 0.8 +
    Math.max(0, 68 - snapshot.scores.sleep) * 0.7,
    0,
    100,
  );
  if (snapshot.sleep.consistencyScore < 65) {
    sleepDrivers.push('Сбитый sleep timing');
  }
  if (snapshot.scores.sleep < 60) {
    sleepDrivers.push('Качество сна проседает');
  }

  const hydrationDrivers: string[] = [];
  const hydrationScore = clamp(
    (1 - snapshot.hydration.progress) * 90 +
    Math.max(0, (snapshot.hydration.hoursSinceLastDrink ?? 0) - 2) * 8,
    0,
    100,
  );
  if (snapshot.hydration.progress < 0.4) {
    hydrationDrivers.push('Низкий cumulative water intake');
  }
  if ((snapshot.hydration.hoursSinceLastDrink ?? 0) > 3) {
    hydrationDrivers.push('Давно не было воды');
  }

  const goalDrivers: string[] = [];
  const recentRecommendationCompletions = recentEvents.filter((event) => event.type === 'recommendation.completed').length;
  const goalDeviationScore = clamp(
    Math.max(0, 70 - snapshot.scores.goalAlignment) * 1.1 +
    Math.max(0, 60 - snapshot.behavioral.adherenceScore) * 0.5 -
    recentRecommendationCompletions * 6 +
    (goals.dayGoal?.trim() ? 8 : 0),
    0,
    100,
  );
  if (snapshot.scores.goalAlignment < 60) {
    goalDrivers.push('Текущее поведение не поддерживает активную цель');
  }
  if (snapshot.behavioral.adherenceScore < 55) {
    goalDrivers.push('Низкая поведенческая инерция');
  }

  return [
    {
      id: buildId('prediction'),
      type: 'energy-crash-risk',
      title: 'Риск energy crash',
      description: 'Система ожидает просадку энергии в ближайшие часы.',
      score: Math.round(energyCrashScore),
      confidence: clamp((energyCrashDrivers.length * 0.22) + 0.42, 0.4, 0.9),
      horizonHours: 4,
      riskLevel: riskLevel(energyCrashScore),
      drivers: energyCrashDrivers,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: buildId('prediction'),
      type: 'recovery-decline',
      title: 'Риск ухудшения восстановления',
      description: 'Восстановление может ухудшиться без компенсации нагрузки.',
      score: Math.round(recoveryDeclineScore),
      confidence: clamp((recoveryDrivers.length * 0.22) + 0.44, 0.42, 0.9),
      horizonHours: 12,
      riskLevel: riskLevel(recoveryDeclineScore),
      drivers: recoveryDrivers,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: buildId('prediction'),
      type: 'sleep-instability',
      title: 'Риск нестабильного сна',
      description: 'Текущая динамика повышает шанс разбалансировки следующего сна.',
      score: Math.round(sleepInstabilityScore),
      confidence: clamp((sleepDrivers.length * 0.2) + 0.45, 0.38, 0.88),
      horizonHours: 18,
      riskLevel: riskLevel(sleepInstabilityScore),
      drivers: sleepDrivers,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: buildId('prediction'),
      type: 'hydration-risk',
      title: 'Риск гидратационного провала',
      description: 'Вода становится лимитирующим фактором состояния.',
      score: Math.round(hydrationScore),
      confidence: clamp((hydrationDrivers.length * 0.24) + 0.46, 0.45, 0.92),
      horizonHours: 6,
      riskLevel: riskLevel(hydrationScore),
      drivers: hydrationDrivers,
      createdAt: new Date(now).toISOString(),
    },
    {
      id: buildId('prediction'),
      type: 'goal-deviation',
      title: 'Риск ухода от цели',
      description: 'Текущая траектория может увести от дневной и долгосрочной цели.',
      score: Math.round(goalDeviationScore),
      confidence: clamp((goalDrivers.length * 0.2) + 0.43, 0.4, 0.85),
      horizonHours: 24,
      riskLevel: riskLevel(goalDeviationScore),
      drivers: goalDrivers,
      createdAt: new Date(now).toISOString(),
    },
  ].sort((left, right) => right.score - left.score);
};
