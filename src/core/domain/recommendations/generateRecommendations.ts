import type { DomainEvent } from '../../store/types/events';
import type { GoalState, Recommendation, StateSnapshot } from '../../store/types/state';

const id = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export interface RecommendationOutput {
  nextBestAction: Recommendation | null;
  recommendations: Recommendation[];
  risks: string[];
  compensations: string[];
}

export function generateRecommendations(
  snapshot: StateSnapshot,
  goals: GoalState,
  _recentEvents: DomainEvent[],
): RecommendationOutput {
  const recs: Recommendation[] = [];
  const risks: string[] = [];
  const compensations: string[] = [];
  const now = new Date().toISOString();

  const { nutrition, hydration, scores, recovery } = snapshot;

  // Hydration
  if (hydration.ml < hydration.targetMl * 0.4) {
    recs.push({
      id: id(), title: 'Выпей стакан воды', body: '300–400 мл воды прямо сейчас стабилизируют энергию и снизят голод.',
      category: 'hydration', priority: 0.85,
      expectedImpact: { energy: +6, nutrition: +2 }, why: `Сегодня всего ${hydration.ml} мл из ${hydration.targetMl}`,
      cta: 'Записать стакан', createdAt: now,
    });
    risks.push('Низкая гидратация — энергия будет проседать');
  }

  // Meal gap
  if (nutrition.hoursSinceLastMeal != null && nutrition.hoursSinceLastMeal > 5) {
    recs.push({
      id: id(), title: 'Белок + клетчатка сейчас',
      body: 'Длинный перерыв снижает метаболизм. Лёгкий приём с белком вернёт фокус.',
      category: 'nutrition', priority: 0.9, expectedImpact: { energy: +8, nutrition: +5 },
      why: `Прошло ${nutrition.hoursSinceLastMeal}ч с последнего приёма`,
      cta: 'Запланировать приём', createdAt: now,
    });
    risks.push('Длинный пищевой разрыв');
  }

  // Compensation for red choices
  if (nutrition.redCount >= 2) {
    recs.push({
      id: id(), title: 'Компенсируй зелёным',
      body: 'Сегодня было несколько тяжёлых выборов. Следующий — лёгкий, белковый, с овощами.',
      category: 'nutrition', priority: 0.75, expectedImpact: { nutrition: +10, goalAlignment: +6 },
      why: `${nutrition.redCount} красных за день`, cta: 'Сканировать следующий', createdAt: now,
    });
    compensations.push('Следующий приём — белок + овощи');
  }

  // Sleep
  if (scores.sleep < 55) {
    recs.push({
      id: id(), title: 'Лёгкий ужин до 19:30',
      body: 'Сон ниже нормы. Тяжёлая еда вечером ухудшит восстановление.',
      category: 'recovery', priority: 0.7, expectedImpact: { sleep: +8, recovery: +6 },
      why: `Sleep score: ${scores.sleep}`, cta: 'Открыть протокол вечера', createdAt: now,
    });
  }

  // Goal alignment low
  if (scores.goalAlignment < 50 && goals.dayGoal) {
    recs.push({
      id: id(), title: 'Вернись к цели дня',
      body: `Твоя цель: «${goals.dayGoal}». Следующий выбор — в эту сторону.`,
      category: 'mindset', priority: 0.6, expectedImpact: { goalAlignment: +12 },
      cta: 'Открыть план дня', createdAt: now,
    });
  }

  // Movement default
  if (recs.length < 2) {
    recs.push({
      id: id(), title: '10 минут движения',
      body: 'Короткая прогулка/растяжка ускоряет пищеварение и поднимает энергию.',
      category: 'movement', priority: 0.4, expectedImpact: { energy: +4, recovery: +2 },
      cta: 'Отметить выполнение', createdAt: now,
    });
  }

  recs.sort((a, b) => b.priority - a.priority);
  const priorities = recs.map(r => r.id);
  void recovery;
  return {
    nextBestAction: recs[0] ?? null,
    recommendations: recs,
    risks,
    compensations,
  };
}
