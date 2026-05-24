import type { ScanVerdict } from '../../store/types/events';
import type { GoalState, Scorecard, StateSnapshot } from '../../store/types/state';

export interface ScanImpact {
  energy: number;
  recovery: number;
  nutrition: number;
  hydration: number;
  goalAlignment: number;
  readiness: number;
  stateLabel: string;
  predictionModifiers: {
    energyCrashRisk: number;
    recoveryDecline: number;
    goalDeviation: number;
    hydrationRisk: number;
  };
  contextualRecommendations: string[];
}

const BASE_DELTAS: Record<ScanVerdict, Pick<ScanImpact, 'energy' | 'recovery' | 'nutrition'>> = {
  green:  { energy: +6,  recovery: +5,  nutrition: +8  },
  yellow: { energy: -2,  recovery: -3,  nutrition: -4  },
  red:    { energy: -10, recovery: -7,  nutrition: -12 },
};

const GOAL_BONUS: Record<string, Partial<Record<ScanVerdict, number>>> = {
  weight_loss: { green: +12, yellow: -6, red: -18 },
  energy:      { green: +10, yellow: -4, red: -14 },
  recovery:    { green: +9,  yellow: -5, red: -12 },
  sleep:       { green: +7,  yellow: -3, red: -10 },
};

const FOCUS_LABELS: Record<string, string> = {
  energy: 'энергии', sleep: 'сна', focus: 'фокуса', calm: 'спокойствия',
  digestion: 'пищеварения', weight: 'веса', weight_loss: 'снижения веса', recovery: 'восстановления',
};

export const buildScanImpact = (
  verdict: ScanVerdict,
  goals: GoalState,
  snapshot: StateSnapshot | null,
  mealCount: number,
): ScanImpact => {
  const base = BASE_DELTAS[verdict];
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const goalBonus = GOAL_BONUS[primaryGoal]?.[verdict] ?? 0;

  const energy = base.energy;
  const recovery = base.recovery;
  const nutrition = base.nutrition;
  const goalAlignment = goalBonus;
  const hydration = verdict === 'green' ? 2 : verdict === 'red' ? -3 : 0;
  const readiness = Math.round((energy * 0.3 + recovery * 0.25 + nutrition * 0.3 + goalAlignment * 0.15) * 10) / 10;

  const currentEnergy = snapshot?.scores.energy ?? 60;
  const currentRecovery = snapshot?.scores.recovery ?? 60;

  const predictionModifiers = {
    energyCrashRisk: verdict === 'red' ? +18 : verdict === 'yellow' && currentEnergy < 55 ? +8 : -6,
    recoveryDecline: verdict === 'red' ? +10 : verdict === 'green' && currentRecovery < 50 ? -8 : verdict === 'green' ? -4 : +3,
    goalDeviation: verdict === 'red' ? +12 : verdict === 'yellow' ? +4 : -6,
    hydrationRisk: verdict === 'red' ? +5 : verdict === 'green' ? -3 : 0,
  };

  const contextualRecommendations: string[] = [];
  const focusState = goals.currentFocusState ?? primaryGoal;

  if (verdict === 'red') {
    if (currentEnergy < 50) contextualRecommendations.push('Компенсируй зелёным приёмом в течение 2 часов');
    if (mealCount === 0) contextualRecommendations.push('Первый приём дня — лучше выбрать что-то зелёное');
    if (focusState === 'recovery') contextualRecommendations.push('Этот продукт замедляет восстановление — смени на белок/антиоксиданты');
    if (focusState === 'sleep') contextualRecommendations.push('Избегай этого продукта за 3 часа до сна');
  }
  if (verdict === 'yellow') {
    if (focusState === 'sleep') contextualRecommendations.push('Безопаснее употреблять до 16:00');
    if (focusState === 'energy' && currentEnergy < 60) contextualRecommendations.push('Добавь белок к этому приёму для стабильности энергии');
    if (primaryGoal === 'weight_loss') contextualRecommendations.push('Учитывай при подсчёте углеводов дня');
  }
  if (verdict === 'green') {
    const goalAlign = snapshot?.scores.goalAlignment;
    if (goalAlign !== undefined && goalAlign < 50) contextualRecommendations.push('Хороший выбор — повышает выравнивание с целью');
    if (currentEnergy > 70) contextualRecommendations.push('Отличный момент — энергия на подъёме');
  }

  const verb = verdict === 'green' ? 'Помогает' : verdict === 'yellow' ? 'Нейтрально для' : 'Снижает';
  const stateLabel = `${verb} ${FOCUS_LABELS[focusState] ?? focusState}`;

  return {
    energy, recovery, nutrition, hydration, goalAlignment, readiness, stateLabel,
    predictionModifiers, contextualRecommendations,
  };
};

export const toImpactHints = (impact: ScanImpact): Partial<Scorecard> => ({
  energy: impact.energy,
  recovery: impact.recovery,
  nutrition: impact.nutrition,
  hydration: impact.hydration,
  goalAlignment: impact.goalAlignment,
  readiness: impact.readiness,
});
