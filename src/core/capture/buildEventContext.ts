import type { DomainEvent } from '../store/types/events';
import type { GoalState, StateSnapshot } from '../store/types/state';
import { filterToday, byType, hoursSince } from '../store/calculators/_helpers';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface EventContext {
  timeOfDay: TimeOfDay;
  dayProgressPct: number;
  hoursSinceWakeup: number;
  recentEventSummary: string[];
  currentScores: {
    energy: number;
    recovery: number;
    sleep: number;
    nutrition: number;
    hydration: number;
    readiness: number;
  };
  activePredictions: string[];
  goalContext: string;
  stressLoad: 'low' | 'medium' | 'high';
}

export const buildEventContext = (
  events: DomainEvent[],
  goals: GoalState,
  snapshot: StateSnapshot | null,
): EventContext => {
  const hour = new Date().getHours();
  const timeOfDay: TimeOfDay = hour < 11 ? 'morning' : hour < 16 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
  const dayProgressPct = Math.round((hour / 24) * 100);

  const wakeupEvents = byType(filterToday(events), 'sleep.recorded');
  const lastWakeup = wakeupEvents.at(-1);
  const hoursSinceWakeup = lastWakeup ? hoursSince(lastWakeup.createdAt) : hour;

  const today = filterToday(events).slice(-8);
  const recentEventSummary = today.map(e => {
    if (e.type === 'hydration.logged') return `💧 ${e.payload.ml}мл воды`;
    if (e.type === 'meal.logged') return `🍽 Приём пищи`;
    if (e.type === 'scan.completed') return `📷 Скан (${e.payload.verdict})`;
    if (e.type === 'supplement.taken') return `💊 ${e.payload.name}`;
    if (e.type === 'habit.completed') return `✅ ${e.payload.name}`;
    if (e.type === 'sleep.recorded') return `😴 Сон ${e.payload.durationHours ?? e.payload.hours}ч`;
    if (e.type === 'recovery.recorded') return `🔄 Восстановление`;
    return e.type;
  });

  const scores = snapshot?.scores;
  const currentScores = {
    energy: scores?.energy ?? 60,
    recovery: scores?.recovery ?? 60,
    sleep: scores?.sleep ?? 60,
    nutrition: scores?.nutrition ?? 60,
    hydration: scores?.hydration ?? 60,
    readiness: scores?.readiness ?? 60,
  };

  const activePredictions = (snapshot?.predictions ?? [])
    .filter(p => p.probability > 0.5)
    .map(p => `${p.type} (${Math.round(p.probability * 100)}%)`);

  const goalContextMap: Record<string, string> = {
    energy: 'Максимизируй энергию и стабильность',
    recovery: 'Фокус на восстановление и снижение стресса',
    sleep: 'Приоритет — качество и регулярность сна',
    weight_loss: 'Дефицит калорий, высокое насыщение',
  };

  const rr = currentScores.recovery;
  const stressLoad: EventContext['stressLoad'] = rr < 40 ? 'high' : rr < 65 ? 'medium' : 'low';

  return {
    timeOfDay, dayProgressPct, hoursSinceWakeup,
    recentEventSummary, currentScores, activePredictions,
    goalContext: goalContextMap[goals.primaryGoal ?? 'energy'] ?? 'Оптимизируй общее состояние',
    stressLoad,
  };
};
