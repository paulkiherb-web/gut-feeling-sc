import type { InterventionMemory } from '../learning/interventionMemory';

export interface ResistanceCategory {
  category: string;
  label: string;
  level: number;
}

export interface ResistanceProfile {
  avoidanceCategories: ResistanceCategory[];
  highAdherenceCategories: ResistanceCategory[];
  /** 0–1: how much friction the user tolerates */
  frictionTolerance: number;
  /** 0–1: overall recommendation fatigue */
  interventionFatigue: number;
  recentIgnoreStreak: number;
  patterns: string[];
}

const LABELS: Record<string, string> = {
  hydration: 'Гидратация',
  nutrition: 'Питание',
  sleep: 'Сон',
  recovery: 'Восстановление',
  behavior: 'Поведение',
  goal: 'Цель дня',
  supplement: 'Добавки',
  habit: 'Привычки',
};

export const buildResistanceProfile = (memory: InterventionMemory): ResistanceProfile => {
  const records = Object.values(memory.records);

  const avoidanceCategories = records
    .filter((r) => r.resistanceLevel > 0.4 || (r.sampleCount >= 3 && r.adherenceRate < 0.25))
    .sort((a, b) => b.resistanceLevel - a.resistanceLevel)
    .map((r) => ({ category: r.category, label: LABELS[r.category] ?? r.category, level: r.resistanceLevel }));

  const highAdherenceCategories = records
    .filter((r) => r.adherenceRate >= 0.6 && r.sampleCount >= 2)
    .sort((a, b) => b.adherenceRate - a.adherenceRate)
    .map((r) => ({ category: r.category, label: LABELS[r.category] ?? r.category, level: r.adherenceRate }));

  const avgAdherence = records.length
    ? records.reduce((s, r) => s + r.adherenceRate, 0) / records.length
    : 0.5;

  const frictionTolerance = Math.max(0, 1 - memory.fatigueLevel) * avgAdherence;

  const patterns: string[] = [];

  const avoided = avoidanceCategories.filter((c) => c.level > 0.5);
  if (avoided.length > 0) {
    patterns.push(`Избегает: ${avoided.map((c) => c.label).join(', ')}`);
  }

  if (highAdherenceCategories.length > 0) {
    const top = highAdherenceCategories[0];
    patterns.push(`Выполняет: ${top.label} (${Math.round(top.level * 100)}%)`);
  }

  const strongCategories = records
    .filter((r) => r.avgEffectSize > 0.4 && r.sampleCount >= 3)
    .map((r) => LABELS[r.category] ?? r.category);
  if (strongCategories.length > 0) {
    patterns.push(`Работает: ${strongCategories.join(', ')}`);
  }

  const heavilyIgnored = records.filter(
    (r) => r.sampleCount >= 5 && r.ignoreCount / r.sampleCount > 0.7,
  );
  if (heavilyIgnored.length > 0) {
    const name = LABELS[heavilyIgnored[0].category] ?? heavilyIgnored[0].category;
    const ignoreRate = Math.round((heavilyIgnored[0].ignoreCount / heavilyIgnored[0].sampleCount) * 100);
    patterns.push(`Игнорирует ~${ignoreRate}% по: ${name}`);
  }

  if (memory.fatigueLevel > 0.6) {
    patterns.push('Слишком много рекомендаций — снижаю интенсивность');
  }

  return {
    avoidanceCategories,
    highAdherenceCategories,
    frictionTolerance,
    interventionFatigue: memory.fatigueLevel,
    recentIgnoreStreak: memory.recentIgnoreStreak,
    patterns,
  };
};
