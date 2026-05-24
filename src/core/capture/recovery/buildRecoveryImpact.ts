import type { DomainEvent } from '../../store/types/events';
import type { GoalState, StateSnapshot } from '../../store/types/state';
import { byType, sortEvents } from '../../store/calculators/_helpers';

export interface RecoveryImpact {
  capacityScore: number;
  recoveryDebtScore: number;
  isBindingConstraint: boolean;
  trend: 'recovering' | 'degrading' | 'stable';
  predictionModifiers: {
    recoveryDecline: number;
    energyCrashRisk: number;
    goalDeviation: number;
  };
  recoveryFlags: {
    highStrain: boolean;
    highSoreness: boolean;
    needsActiveRecovery: boolean;
    needsPassiveRest: boolean;
    supplementOpportunity: boolean;
  };
  recommendations: string[];
  insights: string[];
}

export const buildRecoveryImpact = (
  stressLoad: number,
  soreness: number,
  _subjectiveScore: number | undefined,
  events: DomainEvent[],
  goals: GoalState,
  snapshot: StateSnapshot | null,
): RecoveryImpact => {
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const currentRecovery = snapshot?.scores.recovery ?? 60;
  const currentSleep = snapshot?.scores.sleep ?? 60;

  const rawCapacity = 100 - stressLoad * 6 - soreness * 4 + (currentSleep - 50) * 0.3;
  const capacityScore = Math.max(0, Math.min(100, Math.round(rawCapacity)));
  const recoveryDebtScore = Math.max(0, 100 - capacityScore);

  const recentRecovery = sortEvents(byType(events, 'recovery.recorded')).slice(-4);
  const prevCaps = recentRecovery.map(e => 100 - (e.payload.stressLoad ?? 5) * 6 - (e.payload.soreness ?? 5) * 4);
  const avgPrev = prevCaps.length ? prevCaps.reduce((s, v) => s + v, 0) / prevCaps.length : capacityScore;
  const delta = capacityScore - avgPrev;
  const trend: RecoveryImpact['trend'] = delta > 5 ? 'recovering' : delta < -5 ? 'degrading' : 'stable';

  const isBindingConstraint = capacityScore < 45 || (primaryGoal === 'recovery' && capacityScore < 60);

  const predictionModifiers = {
    recoveryDecline: capacityScore < 40 ? +20 : capacityScore > 70 ? -10 : +5,
    energyCrashRisk: capacityScore < 35 ? +15 : capacityScore > 65 ? -8 : +3,
    goalDeviation: isBindingConstraint ? +12 : -3,
  };

  const flags = {
    highStrain: stressLoad >= 7,
    highSoreness: soreness >= 7,
    needsActiveRecovery: stressLoad >= 5 && soreness >= 4 && soreness < 8,
    needsPassiveRest: soreness >= 8 || stressLoad >= 8,
    supplementOpportunity: capacityScore < 55,
  };

  const recommendations: string[] = [];
  const insights: string[] = [];

  if (flags.needsPassiveRest) {
    recommendations.push('Высокая нагрузка — лёгкое движение и сон 8+ч');
    insights.push('Пассивный отдых ускорит восстановление на 30%');
  } else if (flags.needsActiveRecovery) {
    recommendations.push('Активное восстановление: прогулка, растяжка, дыхание');
  }
  if (flags.supplementOpportunity) recommendations.push('Омега-3 + Витамин C — оптимальный момент');
  if (flags.highStrain && primaryGoal !== 'recovery')
    insights.push('Высокий стресс снижает усвоение нутриентов — приоритет на магний');
  if (trend === 'degrading' && recentRecovery.length >= 2) {
    insights.push('Восстановление снижается 2+ дня — смени режим нагрузки');
    recommendations.push('Снизь интенсивность на 1-2 дня');
  }
  if (trend === 'recovering') insights.push('Восстановление улучшается — текущий режим работает');

  return {
    capacityScore, recoveryDebtScore, isBindingConstraint, trend,
    predictionModifiers, recoveryFlags: flags, recommendations, insights,
  };
};
