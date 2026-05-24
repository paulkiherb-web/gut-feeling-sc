import type { DomainEvent } from '../../store/types/events';
import type { GoalState, StateSnapshot } from '../../store/types/state';
import { byType, todayKey } from '../../store/calculators/_helpers';
import { findHabit } from './habitRegistry';

export interface HabitSignal {
  recognized: boolean;
  habitName: string;
  streak: number;
  streakBonus: number;
  stateModifiers: {
    energy: number;
    recovery: number;
    sleep: number;
    focus: number;
    stress: number;
    goalAlignment: number;
  };
  behavioralTags: ('positive-loop' | 'streak-builder' | 'goal-aligned' | 'recovery-boost' | 'risk-reducer')[];
  isOptimalTiming: boolean;
  recommendations: string[];
}

export const buildHabitSignal = (
  habitName: string,
  events: DomainEvent[],
  goals: GoalState,
  snapshot: StateSnapshot | null,
): HabitSignal => {
  const profile = findHabit(habitName);
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const streak = computeStreak(habitName, events);

  if (!profile) {
    return {
      recognized: false, habitName, streak, streakBonus: 1.0,
      stateModifiers: { energy: +3, recovery: +3, sleep: 0, focus: +2, stress: -3, goalAlignment: +4 },
      behavioralTags: ['positive-loop'], isOptimalTiming: true, recommendations: [],
    };
  }

  const streakBonus = Math.min(1.5, Math.pow(profile.streakMultiplier, Math.min(streak, 14)));
  const mods = profile.stateModifiers;
  const currentEnergy = snapshot?.scores.energy ?? 60;

  const stateModifiers = {
    energy: Math.round((mods.energy ?? 0) * streakBonus),
    recovery: Math.round((mods.recovery ?? 0) * streakBonus),
    sleep: mods.sleep ?? 0,
    focus: mods.focus ?? 0,
    stress: Math.round((mods.stress ?? 0) * streakBonus),
    goalAlignment: Math.round(
      ((mods.goalAlignment ?? 0) + (profile.targetGoals.includes(primaryGoal) ? 8 : 3)) * streakBonus
    ),
  };

  const hour = new Date().getHours();
  const isOptimalTiming =
    profile.optimalTimeOfDay === 'any' ||
    (profile.optimalTimeOfDay === 'morning' && hour < 12) ||
    (profile.optimalTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) ||
    (profile.optimalTimeOfDay === 'evening' && hour >= 17);

  const behavioralTags: HabitSignal['behavioralTags'] = ['positive-loop'];
  if (streak >= 3) behavioralTags.push('streak-builder');
  if (profile.targetGoals.includes(primaryGoal)) behavioralTags.push('goal-aligned');
  if ((mods.recovery ?? 0) > 0) behavioralTags.push('recovery-boost');
  if ((mods.stress ?? 0) < -10) behavioralTags.push('risk-reducer');

  const recommendations: string[] = [];
  if (!isOptimalTiming && profile.optimalTimeOfDay !== 'any') {
    const timeLabel = { morning: 'утром', afternoon: 'днём', evening: 'вечером' }[profile.optimalTimeOfDay];
    recommendations.push(`${profile.name} наиболее эффективна ${timeLabel}`);
  }
  if (streak === 6) recommendations.push('Ещё один день — и 7-дневная серия!');
  if (currentEnergy < 50 && (mods.energy ?? 0) > 0) recommendations.push(`${profile.name} сейчас особенно полезна`);

  return {
    recognized: true, habitName: profile.name, streak, streakBonus: +streakBonus.toFixed(2),
    stateModifiers, behavioralTags, isOptimalTiming, recommendations,
  };
};

const computeStreak = (habitName: string, events: DomainEvent[]): number => {
  const habits = byType(events, 'habit.completed')
    .filter(h => h.payload.name.toLowerCase().includes(habitName.toLowerCase().slice(0, 6)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!habits.length) return 1;
  let streak = 1;
  let current = todayKey(new Date(habits[0].createdAt));

  for (let i = 1; i < habits.length; i++) {
    const day = todayKey(new Date(habits[i].createdAt));
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    if (day === todayKey(prev)) { streak++; current = day; }
    else if (day !== current) break;
  }
  return streak;
};
