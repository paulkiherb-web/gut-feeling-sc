import type { DomainEvent } from '../store/types/events';
import type { GoalState } from '../store/types/state';
import { byType, filterToday, sortEvents, todayKey, hoursSince } from '../store/calculators/_helpers';

export interface BehavioralPattern {
  id: string;
  label: string;
  strength: 'strong' | 'moderate' | 'weak';
  frequency: number;
  trend: 'stable' | 'improving' | 'declining';
  lastSeen: string;
}

export interface BehavioralFingerprint {
  adherenceScore: number;
  consistencyScore: number;
  patterns: BehavioralPattern[];
  routines: string[];
  strengths: string[];
  weaknesses: string[];
  riskBehaviors: string[];
  positiveBehaviorLoops: string[];
  primaryBehavioralType: 'consistent' | 'reactive' | 'erratic' | 'improving';
  summary: string;
}

export const buildBehavioralFingerprint = (
  events: DomainEvent[],
  goals: GoalState,
): BehavioralFingerprint => {
  const primaryGoal = goals.primaryGoal ?? 'energy';
  const last14Days = events.filter(e => {
    const d = new Date(e.createdAt);
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
    return d >= cutoff;
  });

  const dayMap: Record<string, number> = {};
  last14Days.forEach(e => { const k = todayKey(new Date(e.createdAt)); dayMap[k] = (dayMap[k] ?? 0) + 1; });
  const activeDays = Object.keys(dayMap).length;
  const adherenceScore = Math.round(Math.min(100, (activeDays / 14) * 100));
  const countVariance = Object.values(dayMap).reduce((s, v) => s + Math.abs(v - 5), 0) / Math.max(1, activeDays);
  const consistencyScore = Math.max(0, Math.round(100 - countVariance * 5));

  // Pattern detection
  const patterns: BehavioralPattern[] = [];

  const hydration = byType(last14Days, 'hydration.logged');
  if (hydration.length >= 7) {
    const days = new Set(hydration.map(e => todayKey(new Date(e.createdAt)))).size;
    patterns.push({
      id: 'hydration-habit', label: 'Регулярная гидратация',
      strength: days >= 10 ? 'strong' : days >= 6 ? 'moderate' : 'weak',
      frequency: days, trend: 'stable',
      lastSeen: hydration.at(-1)!.createdAt,
    });
  }

  const habits = byType(last14Days, 'habit.completed');
  if (habits.length >= 4) {
    patterns.push({
      id: 'habit-adherence', label: 'Выполнение привычек',
      strength: habits.length >= 12 ? 'strong' : habits.length >= 7 ? 'moderate' : 'weak',
      frequency: habits.length, trend: 'stable',
      lastSeen: habits.at(-1)!.createdAt,
    });
  }

  const sleep = byType(last14Days, 'sleep.recorded');
  if (sleep.length >= 3) {
    const hours = sleep.map(e => e.payload.durationHours ?? e.payload.hours ?? 7);
    const avg = hours.reduce((s, h) => s + h, 0) / hours.length;
    const variance = hours.reduce((s, h) => s + Math.abs(h - avg), 0) / hours.length;
    patterns.push({
      id: 'sleep-pattern', label: 'Режим сна',
      strength: variance < 0.7 ? 'strong' : variance < 1.2 ? 'moderate' : 'weak',
      frequency: sleep.length, trend: avg >= 7 ? 'improving' : 'declining',
      lastSeen: sleep.at(-1)!.createdAt,
    });
  }

  const scans = byType(last14Days, 'scan.completed');
  if (scans.length >= 5) {
    const greenRatio = scans.filter(s => s.payload.verdict === 'green').length / scans.length;
    patterns.push({
      id: 'food-choices', label: 'Качество питания',
      strength: greenRatio >= 0.7 ? 'strong' : greenRatio >= 0.45 ? 'moderate' : 'weak',
      frequency: scans.length, trend: greenRatio > 0.55 ? 'improving' : 'declining',
      lastSeen: scans.at(-1)!.createdAt,
    });
  }

  // Routines
  const routines: string[] = [];
  const todayEvents = filterToday(events);
  const morningHabits = byType(events, 'habit.completed')
    .filter(e => new Date(e.createdAt).getHours() < 10).length;
  if (morningHabits >= 4) routines.push('Утренние привычки (регулярно)');
  const eveningWater = byType(events, 'hydration.logged')
    .filter(e => new Date(e.createdAt).getHours() >= 20).length;
  if (eveningWater >= 5) routines.push('Вечерняя гидратация');

  // Strengths & weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const strongPatterns = patterns.filter(p => p.strength === 'strong');
  const weakPatterns = patterns.filter(p => p.strength === 'weak');
  strongPatterns.forEach(p => strengths.push(p.label));
  weakPatterns.forEach(p => weaknesses.push(`Нестабильный паттерн: ${p.label}`));

  if (adherenceScore >= 70) strengths.push('Высокая вовлечённость в трекинг');
  else weaknesses.push('Низкая регулярность отслеживания');

  // Risk behaviors
  const riskBehaviors: string[] = [];
  const lateScans = scans.filter(s => new Date(s.createdAt).getHours() >= 21 && s.payload.verdict === 'red').length;
  if (lateScans >= 3) riskBehaviors.push('Красные продукты поздно вечером');
  const skipDays = 14 - activeDays;
  if (skipDays >= 5) riskBehaviors.push('Частые пропуски отслеживания');

  // Positive loops
  const positiveBehaviorLoops: string[] = [];
  const habitAfterScan = events.filter(e => e.type === 'habit.completed' &&
    byType(events, 'scan.completed').some(s => Math.abs(hoursSince(s.createdAt) - hoursSince(e.createdAt)) < 2)
  ).length;
  if (habitAfterScan >= 3) positiveBehaviorLoops.push('Привычки после сканирования — позитивный цикл');
  if (strongPatterns.length >= 2) positiveBehaviorLoops.push('Несколько устойчивых паттернов работают');

  // Primary type
  let primaryBehavioralType: BehavioralFingerprint['primaryBehavioralType'] = 'reactive';
  if (consistencyScore >= 70 && adherenceScore >= 65) primaryBehavioralType = 'consistent';
  else if (consistencyScore < 40) primaryBehavioralType = 'erratic';
  else if (patterns.some(p => p.trend === 'improving')) primaryBehavioralType = 'improving';

  const typeLabels: Record<BehavioralFingerprint['primaryBehavioralType'], string> = {
    consistent: 'Последовательный — высокая стабильность',
    reactive: 'Реактивный — реагирует на состояние',
    erratic: 'Нестабильный — неравномерный ритм',
    improving: 'В динамике — паттерны улучшаются',
  };

  return {
    adherenceScore, consistencyScore, patterns, routines, strengths, weaknesses,
    riskBehaviors, positiveBehaviorLoops, primaryBehavioralType,
    summary: typeLabels[primaryBehavioralType],
  };
};
