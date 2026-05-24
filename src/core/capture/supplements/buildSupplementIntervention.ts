import type { GoalState, StateSnapshot } from '../../store/types/state';
import { findSupplement } from './supplementRegistry';
import type { SupplementProfile } from './supplementRegistry';

export interface SupplementIntervention {
  recognized: boolean;
  profile: SupplementProfile | null;
  actualStateModifiers: {
    energy: number;
    recovery: number;
    sleep: number;
    focus: number;
    stress: number;
  };
  effectStartsAt: string;
  effectEndsAt: string;
  warnings: string[];
  goalRelevance: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export const buildSupplementIntervention = (
  name: string,
  doseMg: number | undefined,
  goals: GoalState,
  snapshot: StateSnapshot | null,
): SupplementIntervention => {
  const profile = findSupplement(name);
  const now = new Date();
  const hour = now.getHours();
  const primaryGoal = goals.primaryGoal ?? 'energy';

  if (!profile) {
    return {
      recognized: false, profile: null,
      actualStateModifiers: { energy: 0, recovery: 0, sleep: 0, focus: 0, stress: 0 },
      effectStartsAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
      effectEndsAt: new Date(now.getTime() + 4 * 3_600_000).toISOString(),
      warnings: [],
      goalRelevance: 'low',
      recommendations: [`Отслеживай воздействие "${name}" со временем`],
    };
  }

  const doseMultiplier = doseMg ? Math.min(1.5, doseMg / 400) : 1.0;
  const currentRecovery = snapshot?.scores.recovery ?? 60;
  const isCaffeineRisk = profile.name === 'Кофеин' && hour >= 15;
  const isMelatoninDay = profile.name === 'Мелатонин' && hour < 20;
  const mods = profile.stateModifiers;

  const actualStateModifiers = {
    energy: isCaffeineRisk ? Math.round((mods.energy ?? 0) * 0.6) : Math.round((mods.energy ?? 0) * doseMultiplier),
    recovery: currentRecovery < 50
      ? Math.round((mods.recovery ?? 0) * 1.25 * doseMultiplier)
      : Math.round((mods.recovery ?? 0) * doseMultiplier),
    sleep: isMelatoninDay ? -Math.abs(mods.sleep ?? 0) : Math.round((mods.sleep ?? 0) * doseMultiplier),
    focus: Math.round((mods.focus ?? 0) * doseMultiplier),
    stress: Math.round((mods.stress ?? 0) * doseMultiplier),
  };

  const effectStartsAt = new Date(now.getTime() + profile.onsetMinutes * 60_000).toISOString();
  const effectEndsAt = new Date(now.getTime() + (profile.onsetMinutes + profile.durationHours * 60) * 60_000).toISOString();

  const warnings = [...profile.warnings];
  if (isCaffeineRisk) warnings.push('Кофеин после 15:00 — высокий риск нарушения сна');
  if (isMelatoninDay) warnings.push('Мелатонин днём вызовет сонливость');

  const recommendations: string[] = [];
  if (profile.category === 'sleep' && hour < 18) recommendations.push(`${profile.name} эффективнее за 1-2 часа до сна`);
  if (profile.category === 'recovery' && currentRecovery < 50) recommendations.push('Восстановление снижено — хороший момент для приёма');

  const relevantMap: Record<string, string[]> = {
    energy: ['energy', 'cognitive'], recovery: ['recovery', 'immune'],
    sleep: ['sleep', 'cognitive'], weight_loss: ['energy', 'general'],
  };
  const relevant = relevantMap[primaryGoal] ?? ['general'];
  const goalRelevance: SupplementIntervention['goalRelevance'] =
    profile.category === relevant[0] ? 'high' : relevant.includes(profile.category) ? 'medium' : 'low';

  return {
    recognized: true, profile, actualStateModifiers, effectStartsAt, effectEndsAt,
    warnings, goalRelevance, recommendations,
  };
};
