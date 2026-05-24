import type { DomainEvent } from '../../store/types/events';
import type { Insight, Prediction, StateSnapshot } from '../../store/types/state';
import { buildId } from '../../store/calculators/_helpers';

const createInsight = (input: Omit<Insight, 'id' | 'createdAt'>): Insight => ({
  ...input,
  id: buildId('insight'),
  createdAt: new Date().toISOString(),
});

export const generateInsights = (
  snapshot: StateSnapshot,
  predictions: Prediction[],
  recentEvents: DomainEvent[],
): Insight[] => {
  const insights: Insight[] = [];
  const completedRecommendations = recentEvents.filter((event) => event.type === 'recommendation.completed' && event.payload.outcome === 'done').length;

  if (snapshot.hydration.progress < 0.45 && (snapshot.nutrition.hoursSinceLastMeal ?? 0) > 4) {
    insights.push(
      createInsight({
        kind: 'causal',
        title: 'Энергия падает из-за связки вода + окно питания',
        body: 'Состояние проседает не из-за одного фактора, а из-за комбинации низкой гидратации и длинного окна без приема пищи.',
        confidence: 0.84,
        signals: ['hydration-low', 'meal-gap'],
      }),
    );
  }

  const topPrediction = predictions[0];
  if (topPrediction && topPrediction.score >= 55) {
    insights.push(
      createInsight({
        kind: 'risk',
        title: topPrediction.title,
        body: `${topPrediction.description} Главные причины: ${topPrediction.drivers.join(', ') || 'накопление слабых сигналов'}.`,
        confidence: topPrediction.confidence,
        signals: topPrediction.drivers,
      }),
    );
  }

  if (snapshot.behavioral.adherenceScore >= 70 && completedRecommendations > 0) {
    insights.push(
      createInsight({
        kind: 'win',
        title: 'Поведенческая инерция усиливается',
        body: 'Система видит, что выполненные действия быстро поднимают adherence и уменьшают вероятность отката.',
        confidence: 0.76,
        signals: ['recommendation-completion', 'behavioral-adherence'],
      }),
    );
  }

  if (snapshot.trajectory.direction !== 'flat') {
    insights.push(
      createInsight({
        kind: 'trend',
        title: snapshot.trajectory.direction === 'improving' ? 'Состояние ускоряется вверх' : 'Состояние теряет устойчивость',
        body: `Momentum: ${snapshot.trajectory.momentum}. Ключевые драйверы: ${snapshot.trajectory.causes.join(', ') || 'смешанные сигналы'}.`,
        confidence: snapshot.trajectory.confidence,
        signals: snapshot.trajectory.causes,
      }),
    );
  }

  if (snapshot.nutrition.redCount >= 2 && snapshot.scores.goalAlignment < 60) {
    insights.push(
      createInsight({
        kind: 'pattern',
        title: 'Тяжелые приемы сбивают согласованность с целью',
        body: 'Когда в дне накапливаются тяжелые решения по питанию, система почти сразу видит падение goal alignment.',
        confidence: 0.8,
        signals: ['nutrition-red-load', 'goal-alignment-drop'],
      }),
    );
  }

  return insights.slice(0, 6);
};
