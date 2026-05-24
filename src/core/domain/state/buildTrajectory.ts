import type { DomainEvent } from '../../store/types/events';
import type { Prediction, StateSnapshot, StateTrajectory } from '../../store/types/state';
import { clamp } from '../../store/calculators/_helpers';

export interface BuildTrajectoryInput {
  currentSnapshot: Pick<StateSnapshot, 'scores' | 'hydration' | 'nutrition' | 'sleep' | 'recovery'>;
  previousSnapshot?: Pick<StateSnapshot, 'scores'>;
  predictions: Prediction[];
  recentEvents: DomainEvent[];
}

export const buildTrajectory = ({
  currentSnapshot,
  previousSnapshot,
  predictions,
  recentEvents,
}: BuildTrajectoryInput): StateTrajectory => {
  const delta = currentSnapshot.scores.readiness - (previousSnapshot?.scores.readiness ?? currentSnapshot.scores.readiness);
  const causes: string[] = [];

  if (currentSnapshot.hydration.progress < 0.45) {
    causes.push(`Гидратация ${Math.round(currentSnapshot.hydration.progress * 100)}% от цели`);
  }

  if ((currentSnapshot.nutrition.hoursSinceLastMeal ?? 0) > 5) {
    causes.push(`Перерыв между приёмами ${currentSnapshot.nutrition.hoursSinceLastMeal?.toFixed(1)}ч`);
  }

  if (currentSnapshot.sleep.sleepDebtHours > 1.2) {
    causes.push(`Дефицит сна ${currentSnapshot.sleep.sleepDebtHours.toFixed(1)}ч`);
  }

  if ((currentSnapshot.recovery.strain ?? 0) > 60) {
    causes.push('Нагрузка опережает восстановление');
  }

  const topPrediction = [...predictions].sort((left, right) => right.score - left.score)[0];
  if (topPrediction && topPrediction.score >= 60) {
    causes.push(topPrediction.title);
  }

  if (!causes.length && recentEvents.length >= 3) {
    causes.push('Сигналы выравниваются, состояние стабилизируется');
  }

  const direction: StateTrajectory['direction'] = delta > 4 ? 'improving' : delta < -4 ? 'declining' : 'flat';
  const magnitude = Math.abs(delta);
  const momentum: StateTrajectory['momentum'] = magnitude >= 10 ? 'strong' : magnitude >= 4 ? 'moderate' : 'weak';
  const confidence = clamp((recentEvents.length * 6 + causes.length * 12 + predictions.length * 5) / 100, 0.35, 0.94);

  return {
    direction,
    momentum,
    confidence,
    delta: Math.round(delta),
    windowHours: 24,
    causes,
    drivers: causes,
  };
};
