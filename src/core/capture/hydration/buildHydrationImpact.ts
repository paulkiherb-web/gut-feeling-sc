import type { DomainEvent } from '../../store/types/events';
import type { GoalState, StateSnapshot } from '../../store/types/state';
import { byType, filterToday, hoursSince } from '../../store/calculators/_helpers';

export interface HydrationImpact {
  progress: number;
  riskScore: number;
  readinessDelta: number;
  performanceImpact: { cognitive: number; physical: number };
  triggersRecoveryRebuild: boolean;
  recommendations: string[];
  enrichmentHints: {
    isDehydrated: boolean;
    isOptimal: boolean;
    isOverHydrated: boolean;
    benefitsRecovery: boolean;
  };
}

export const buildHydrationImpact = (
  newMl: number,
  events: DomainEvent[],
  goals: GoalState,
  snapshot: StateSnapshot | null,
): HydrationImpact => {
  const today = filterToday(events);
  const totalMl = byType(today, 'hydration.logged').reduce((s, d) => s + d.payload.ml, 0) + newMl;
  const targetMl = snapshot?.hydration.targetMl ?? 2000;
  const progress = Math.min(1, totalMl / targetMl);
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const riskScore = Math.max(0, Math.round((1 - progress) * 100));

  const dehydPct = Math.max(0, (1 - progress) * 100);
  const cognitive = Math.round(Math.max(40, 100 - dehydPct * 0.9));
  const physical = Math.round(Math.max(35, 100 - dehydPct * 1.1));
  const readinessDelta = progress >= 0.8 ? +5 : progress >= 0.5 ? +2 : -8;

  const drinks = byType(today, 'hydration.logged');
  const hoursDry = drinks.at(-1) ? hoursSince(drinks.at(-1)!.createdAt) : 8;

  const isDehydrated = progress < 0.5;
  const isOptimal = progress >= 0.75 && progress <= 1;
  const isOverHydrated = totalMl > targetMl * 1.5;
  const benefitsRecovery = progress >= 0.6 && (primaryGoal === 'recovery' || primaryGoal === 'energy');

  const recommendations: string[] = [];
  if (isDehydrated) {
    recommendations.push(`Ещё ${Math.round(targetMl - totalMl)}мл до нормы`);
    if (primaryGoal === 'energy') recommendations.push('Обезвоживание — причина усталости');
  }
  if (hoursDry > 3 && progress < 0.8) recommendations.push('Давно не пил — выпей стакан прямо сейчас');
  if (primaryGoal === 'recovery' && progress < 0.6) recommendations.push('Гидратация критична для восстановления мышц');
  if (isOverHydrated) recommendations.push('Норма перевыполнена — следи за электролитами');

  return {
    progress, riskScore, readinessDelta,
    performanceImpact: { cognitive, physical },
    triggersRecoveryRebuild: isDehydrated || (progress >= 0.8 && riskScore === 0),
    recommendations,
    enrichmentHints: { isDehydrated, isOptimal, isOverHydrated, benefitsRecovery },
  };
};
