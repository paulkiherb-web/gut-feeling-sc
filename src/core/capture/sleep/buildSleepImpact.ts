import type { DomainEvent } from '../../store/types/events';
import type { GoalState } from '../../store/types/state';
import { byType, sortEvents, todayKey } from '../../store/calculators/_helpers';

export interface SleepImpact {
  readinessDelta: number;
  energyDelta: number;
  recoveryDelta: number;
  sleepDebtHours: number;
  consistencyScore: number;
  qualityRating: number;
  predictionModifiers: {
    energyCrashRisk: number;
    recoveryDecline: number;
    sleepInstability: number;
  };
  recommendations: string[];
  risks: string[];
  enrichmentHints: {
    isRecoveryNight: boolean;
    isSleepDeprived: boolean;
    isConsistent: boolean;
    isOptimalDuration: boolean;
  };
}

export const buildSleepImpact = (
  durationHours: number,
  quality: number,
  bedTimeIso: string | undefined,
  events: DomainEvent[],
  goals: GoalState,
): SleepImpact => {
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const targetHours = (primaryGoal === 'recovery' || primaryGoal === 'sleep') ? 8.5 : 7.5;
  const sleepDebtHours = Math.max(0, targetHours - durationHours);
  const prevSleep = sortEvents(byType(events, 'sleep.recorded')).slice(-7);

  let consistencyScore = 70;
  if (bedTimeIso && prevSleep.length >= 2) {
    const bedHour = new Date(bedTimeIso).getHours();
    const prevBeds = prevSleep.filter(e => e.payload.bedTime).map(e => new Date(e.payload.bedTime!).getHours());
    if (prevBeds.length) {
      const avg = prevBeds.reduce((s, h) => s + h, 0) / prevBeds.length;
      consistencyScore = Math.max(30, 100 - Math.abs(bedHour - avg) * 12);
    }
  }

  const qualityRating = Math.min(100, Math.round((durationHours / targetHours) * 50 + quality * 50));
  const optimalDuration = durationHours >= 7 && durationHours <= 9;

  const readinessDelta = optimalDuration
    ? Math.round((quality - 0.6) * 25)
    : durationHours < 5 ? -20 : durationHours < 6.5 ? -10 : Math.round((durationHours - 7.5) * 4);

  const predictionModifiers = {
    energyCrashRisk: durationHours < 6 ? +20 : durationHours >= 7.5 ? -12 : +5,
    recoveryDecline: sleepDebtHours > 2 ? +15 : sleepDebtHours > 0 ? +5 : -8,
    sleepInstability: consistencyScore < 50 ? +15 : consistencyScore > 75 ? -10 : +5,
  };

  const recommendations: string[] = [];
  const risks: string[] = [];

  if (sleepDebtHours > 2) {
    risks.push(`Недосып ${sleepDebtHours.toFixed(1)}ч — снижает восстановление`);
    recommendations.push('Добавь 30-60 мин ко сну завтра или запланируй дневной сон');
  }
  if (quality < 0.5) {
    risks.push('Низкое качество сна');
    recommendations.push('Магний + тёмная комната + экран за 1ч до сна');
  }
  if (consistencyScore < 50) {
    risks.push('Нерегулярное время сна');
    recommendations.push('Ложись в одно время ±30 мин');
  }
  if (primaryGoal === 'recovery' && durationHours < 8)
    recommendations.push('Для восстановления критично 8-9 часов');

  return {
    readinessDelta, energyDelta: Math.round(readinessDelta * 0.8),
    recoveryDelta: Math.round(readinessDelta * 0.7 + (quality - 0.6) * 15),
    sleepDebtHours, consistencyScore: Math.round(consistencyScore), qualityRating,
    predictionModifiers, recommendations, risks,
    enrichmentHints: {
      isRecoveryNight: durationHours >= 8 && quality >= 0.75,
      isSleepDeprived: sleepDebtHours > 1.5,
      isConsistent: consistencyScore >= 70,
      isOptimalDuration: optimalDuration,
    },
  };
};
