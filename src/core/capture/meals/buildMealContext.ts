import type { DomainEvent } from '../../store/types/events';
import type { GoalState, StateSnapshot } from '../../store/types/state';
import { byType, filterToday, hoursSince, sortEvents } from '../../store/calculators/_helpers';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface MealContext {
  timeOfDay: TimeOfDay;
  mealNumber: number;
  hoursSinceLastMeal: number;
  isOptimalWindow: boolean;
  totalProteinToday: number;
  totalCarbsToday: number;
  totalFatToday: number;
  totalKcalToday: number;
  proteinDeficit: number;
  caffeineLoadScore: number;
  sugarLoadScore: number;
  hydrationAtMealTime: number;
  recoveryScore: number;
  goalContext: string;
  alerts: string[];
  recommendations: string[];
  enrichmentHints: {
    needsProtein: boolean;
    needsHydration: boolean;
    lateMealRisk: boolean;
    highCaffeineLoad: boolean;
    goodMealTiming: boolean;
  };
}

const PROTEIN_TARGETS: Record<string, number> = {
  weight_loss: 140, energy: 120, recovery: 165, sleep: 110,
};

export const buildMealContext = (
  events: DomainEvent[],
  goals: GoalState,
  snapshot: StateSnapshot | null,
): MealContext => {
  const hour = new Date().getHours();
  const today = filterToday(events);
  const todayMeals = sortEvents(byType(today, 'meal.logged'));
  const todayScans = sortEvents(byType(today, 'scan.completed'));
  const todayDrinks = byType(today, 'hydration.logged');
  const todaySupps = byType(today, 'supplement.taken');

  const lastMeal = [...todayMeals].at(-1) ?? [...todayScans].at(-1);
  const hoursSinceLast = lastMeal ? hoursSince(lastMeal.createdAt) : 24;

  const totalProtein = todayMeals.reduce((s, m) => s + (m.payload.protein ?? 0), 0);
  const totalCarbs = todayMeals.reduce((s, m) => s + (m.payload.carbs ?? 0), 0);
  const totalFat = todayMeals.reduce((s, m) => s + (m.payload.fat ?? 0), 0);
  const totalKcal = todayMeals.reduce((s, m) => s + (m.payload.kcal ?? 0), 0);

  const caffeineSupps = todaySupps.filter(s => /кофе|кофеин|caffeine|coffee/i.test(s.payload.name));
  const caffeineLoadScore = Math.min(100, caffeineSupps.length * 28 + (hour >= 14 ? caffeineSupps.length * 14 : 0));

  const redScans = todayScans.filter(s => s.payload.verdict === 'red').length;
  const yellowScans = todayScans.filter(s => s.payload.verdict === 'yellow').length;
  const sugarLoadScore = Math.min(100, redScans * 22 + yellowScans * 9);

  const primaryGoal = goals.primaryGoal ?? 'energy';
  const proteinTarget = PROTEIN_TARGETS[primaryGoal] ?? 130;
  const proteinDeficit = Math.max(0, proteinTarget - totalProtein);

  const hydrationMl = todayDrinks.reduce((s, h) => s + h.payload.ml, 0);
  const hydrationTarget = snapshot?.hydration.targetMl ?? 2000;
  const hydrationAtMealTime = Math.min(100, Math.round((hydrationMl / hydrationTarget) * 100));
  const recoveryScore = snapshot?.scores.recovery ?? 60;

  const timeOfDay: TimeOfDay = hour < 11 ? 'morning' : hour < 16 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

  const isOptimalWindow =
    (timeOfDay === 'morning' && hoursSinceLast > 3) ||
    (timeOfDay === 'afternoon' && hoursSinceLast >= 3 && hoursSinceLast <= 5) ||
    (timeOfDay === 'evening' && primaryGoal !== 'sleep' && hour < 19);

  const alerts: string[] = [];
  const recommendations: string[] = [];

  if (hoursSinceLast > 5 && timeOfDay !== 'morning') alerts.push('Давно не ели — риск энергетического провала');
  if (timeOfDay === 'night' && primaryGoal === 'sleep') alerts.push('Поздний приём нарушит сон');
  if (caffeineLoadScore > 65 && hour >= 15) alerts.push('Высокая кофеиновая нагрузка после 15:00');
  if (sugarLoadScore > 55) alerts.push('Высокая гликемическая нагрузка за день');
  if (hydrationAtMealTime < 40) alerts.push('Обезвоженность — сначала выпей 200мл воды');

  if (proteinDeficit > 40) recommendations.push(`Нужно ещё ≈${Math.round(proteinDeficit)}г белка до конца дня`);
  if (hydrationAtMealTime < 50) recommendations.push('Выпей воду перед едой');
  if (recoveryScore < 50 && primaryGoal === 'recovery') recommendations.push('Фокус: белок + противовоспалительные');
  if (timeOfDay === 'evening' && primaryGoal === 'sleep') recommendations.push('Лёгкий ужин без стимуляторов');
  if (hoursSinceLast > 4 && primaryGoal === 'energy') recommendations.push('Белок + сложные углеводы для стабилизации энергии');

  const goalContextMap: Record<string, string> = {
    weight_loss: 'Дефицит калорий + насыщение белком',
    energy: 'Стабилизируй сахар: белок + сложные углеводы',
    recovery: 'Белок, омега-3, антиоксиданты',
    sleep: 'Без стимуляторов и тяжёлых блюд после 18:00',
  };

  return {
    timeOfDay, mealNumber: todayMeals.length + 1,
    hoursSinceLastMeal: +hoursSinceLast.toFixed(1), isOptimalWindow,
    totalProteinToday: totalProtein, totalCarbsToday: totalCarbs,
    totalFatToday: totalFat, totalKcalToday: totalKcal,
    proteinDeficit, caffeineLoadScore, sugarLoadScore, hydrationAtMealTime, recoveryScore,
    goalContext: goalContextMap[primaryGoal] ?? 'Сбалансированный рацион',
    alerts, recommendations,
    enrichmentHints: {
      needsProtein: proteinDeficit > 30,
      needsHydration: hydrationAtMealTime < 45,
      lateMealRisk: timeOfDay === 'night' || (timeOfDay === 'evening' && hour >= 20 && primaryGoal === 'sleep'),
      highCaffeineLoad: caffeineLoadScore > 60,
      goodMealTiming: isOptimalWindow,
    },
  };
};
