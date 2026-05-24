import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Prediction, Recommendation, StateSnapshot } from '../../store/types/state';
import { buildId, clamp } from '../../store/calculators/_helpers';
import {
  CATEGORY_EFFECT_WINDOW_HOURS,
  CATEGORY_FRICTION,
  CATEGORY_TO_INTERVENTION_TYPE,
} from '../../interventions/recommendations/types';

export interface RecommendationOutput {
  nextBestAction: Recommendation | null;
  highestLeverageAction: Recommendation | null;
  compensationActions: Recommendation[];
  preventionActions: Recommendation[];
  recommendations: Recommendation[];
}

const buildRecommendation = (input: Omit<Recommendation, 'id' | 'createdAt' | 'status'>): Recommendation => {
  const category = input.category ?? 'behavior';
  const kind = input.kind ?? 'next-best';
  const urgency: Recommendation['urgency'] =
    kind === 'prevention' ? 'high' : kind === 'highest-leverage' ? 'high' : 'medium';

  return {
    ...input,
    id: buildId('recommendation'),
    createdAt: new Date().toISOString(),
    status: 'active',
    lifecycleState: 'generated',
    interventionType: CATEGORY_TO_INTERVENTION_TYPE[category] ?? 'behavioral',
    urgency,
    confidence: 0.75,
    frictionScore: CATEGORY_FRICTION[category] ?? 40,
    behavioralFit: 60,
    estimatedEffectWindowHours: CATEGORY_EFFECT_WINDOW_HOURS[category] ?? 3,
    learningWeight: 0.7,
  };
};

const topPredictionsByType = (predictions: Prediction[], type: Prediction['type']) =>
  predictions.find((prediction) => prediction.type === type);

export const generateRecommendations = (
  snapshot: StateSnapshot,
  predictions: Prediction[],
  goals: GoalState,
  recentEvents: DomainEvent[],
): RecommendationOutput => {
  const recommendations: Recommendation[] = [];
  const compensationActions: Recommendation[] = [];
  const preventionActions: Recommendation[] = [];

  const hydrationRisk = topPredictionsByType(predictions, 'hydration-risk');
  if (hydrationRisk && hydrationRisk.score >= 45) {
    preventionActions.push(
      buildRecommendation({
        kind: 'prevention',
        title: 'Закрой гидратационный риск',
        body: 'Выпей 300-500 мл воды сейчас, чтобы не дать состоянию уйти в когнитивную и физическую просадку.',
        category: 'hydration',
        priority: clamp(hydrationRisk.score + 8),
        leverage: 84,
        expectedImpact: { energy: 8, recovery: 4 },
        why: `Гидратация ${Math.round(snapshot.hydration.progress * 100)}% от цели`,
        cta: 'Записать воду',
        sourcePredictionTypes: ['hydration-risk'],
      }),
    );
  }

  const energyCrash = topPredictionsByType(predictions, 'energy-crash-risk');
  if (energyCrash && energyCrash.score >= 50) {
    recommendations.push(
      buildRecommendation({
        kind: 'next-best',
        title: 'Стабилизируй энергию через питание',
        body: 'Собери быстрый прием: белок + клетчатка + вода. Это снизит риск energy crash в ближайшие часы.',
        category: 'nutrition',
        priority: clamp(energyCrash.score + 12),
        leverage: 92,
        expectedImpact: { energy: 10, nutrition: 7, readiness: 6 },
        why: snapshot.nutrition.hoursSinceLastMeal
          ? `С момента последнего приема прошло ${snapshot.nutrition.hoursSinceLastMeal.toFixed(1)}ч`
          : 'Система видит дефицит энергообеспечения',
        cta: 'Сделать прием',
        sourcePredictionTypes: ['energy-crash-risk'],
      }),
    );
  }

  if (snapshot.nutrition.redCount >= 2) {
    compensationActions.push(
      buildRecommendation({
        kind: 'compensation',
        title: 'Компенсируй тяжелые выборы зеленым приемом',
        body: 'Следующий прием сделай легким: белок, овощи, минимум простых сахаров и без перегруза жиром.',
        category: 'nutrition',
        priority: 72,
        leverage: 78,
        expectedImpact: { nutrition: 10, goalAlignment: 8, recovery: 4 },
        why: `Сегодня уже ${snapshot.nutrition.redCount} тяжелых решения`,
        cta: 'Спланировать следующий',
        sourcePredictionTypes: ['goal-deviation'],
      }),
    );
  }

  const recoveryDecline = topPredictionsByType(predictions, 'recovery-decline');
  if (recoveryDecline && recoveryDecline.score >= 52) {
    preventionActions.push(
      buildRecommendation({
        kind: 'prevention',
        title: 'Снизь нагрузку на восстановление',
        body: 'Убери лишнюю стимуляцию вечером, добавь спокойный ритуал и не расширяй нагрузку до восстановления.',
        category: 'recovery',
        priority: clamp(recoveryDecline.score + 4),
        leverage: 80,
        expectedImpact: { recovery: 9, sleep: 6 },
        why: 'Восстановление не успевает за текущей нагрузкой',
        cta: 'Запустить recovery protocol',
        sourcePredictionTypes: ['recovery-decline', 'sleep-instability'],
      }),
    );
  }

  const sleepInstability = topPredictionsByType(predictions, 'sleep-instability');
  if (sleepInstability && sleepInstability.score >= 45) {
    preventionActions.push(
      buildRecommendation({
        kind: 'prevention',
        title: 'Зафиксируй окно сна',
        body: 'Определи время оффлайна и не вводи тяжелую еду поздно вечером. Это стабилизирует следующий сон.',
        category: 'sleep',
        priority: clamp(sleepInstability.score + 2),
        leverage: 74,
        expectedImpact: { sleep: 10, recovery: 5 },
        why: `Sleep score ${snapshot.scores.sleep}/100`,
        cta: 'Подготовить вечер',
        sourcePredictionTypes: ['sleep-instability'],
      }),
    );
  }

  const goalDeviation = topPredictionsByType(predictions, 'goal-deviation');
  if (goalDeviation && goalDeviation.score >= 50 && goals.dayGoal) {
    recommendations.push(
      buildRecommendation({
        kind: 'highest-leverage',
        title: 'Синхронизируй следующее действие с целью дня',
        body: `Твоя цель: «${goals.dayGoal}». Выбери следующее решение так, чтобы оно прямо продвигало эту цель.`,
        category: 'goal',
        priority: clamp(goalDeviation.score + 5),
        leverage: 88,
        expectedImpact: { goalAlignment: 14, readiness: 5 },
        why: 'Текущая траектория начинает расходиться с заявленной целью',
        cta: 'Вернуться к цели',
        sourcePredictionTypes: ['goal-deviation'],
      }),
    );
  }

  const recentCompletions = recentEvents.filter((event) => event.type === 'recommendation.completed' && event.payload.outcome === 'done').length;
  if (!recentCompletions && recommendations.length + compensationActions.length + preventionActions.length < 2) {
    recommendations.push(
      buildRecommendation({
        kind: 'next-best',
        title: 'Создай инерцию через микро-действие',
        body: 'Отметь один короткий полезный шаг: вода, прогулка или белковый перекус. Система усилит momentum.',
        category: 'behavior',
        priority: 58,
        leverage: 66,
        expectedImpact: { readiness: 4, goalAlignment: 6 },
        why: 'Нужен быстрый поведенческий импульс',
        cta: 'Сделать микро-шаг',
      }),
    );
  }

  const all = [...recommendations, ...compensationActions, ...preventionActions].sort(
    (left, right) => right.priority - left.priority || right.leverage - left.leverage,
  );

  return {
    nextBestAction: all.find((item) => item.kind === 'next-best') ?? all[0] ?? null,
    highestLeverageAction: all.find((item) => item.kind === 'highest-leverage') ?? all[0] ?? null,
    compensationActions,
    preventionActions,
    recommendations: all,
  };
};
