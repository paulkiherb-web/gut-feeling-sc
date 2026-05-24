import { type InterventionMemory, getRecord } from '../learning/interventionMemory';

export interface EffectTimelineEntry {
  category: string;
  title: string;
  avgEffectSize: number;
  adherenceRate: number;
  successRate: number;
  sampleCount: number;
  trend: 'improving' | 'stable' | 'declining';
  strength: 'strong' | 'moderate' | 'weak' | 'resistant';
  lastSuccessAt?: string;
}

export interface EffectTimeline {
  entries: EffectTimelineEntry[];
  strongestIntervention: EffectTimelineEntry | null;
  mostResisted: EffectTimelineEntry | null;
  insights: string[];
  hasData: boolean;
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

export const buildEffectTimeline = (memory: InterventionMemory): EffectTimeline => {
  const entries: EffectTimelineEntry[] = Object.values(memory.records)
    .filter((r) => r.sampleCount >= 2)
    .map((r) => {
      let strength: EffectTimelineEntry['strength'];
      if (r.avgEffectSize >= 0.6) strength = 'strong';
      else if (r.avgEffectSize >= 0.2) strength = 'moderate';
      else if (r.avgEffectSize >= -0.1) strength = 'weak';
      else strength = 'resistant';

      const trend: EffectTimelineEntry['trend'] =
        r.successRate > 0.6 && r.adherenceRate > 0.5
          ? 'improving'
          : r.resistanceLevel > 0.5
            ? 'declining'
            : 'stable';

      return {
        category: r.category,
        title: LABELS[r.category] ?? r.category,
        avgEffectSize: r.avgEffectSize,
        adherenceRate: r.adherenceRate,
        successRate: r.successRate,
        sampleCount: r.sampleCount,
        trend,
        strength,
        lastSuccessAt: r.lastSuccessAt,
      };
    })
    .sort((a, b) => b.avgEffectSize - a.avgEffectSize);

  const strongestIntervention = entries.find((e) => e.strength === 'strong') ?? null;
  const mostResisted =
    [...entries]
      .sort((a, b) => b.sampleCount - a.sampleCount)
      .find((e) => e.strength === 'resistant') ?? null;

  const insights: string[] = [];

  if (strongestIntervention) {
    insights.push(`${strongestIntervention.title} — сильный эффект`);
  }

  const highAdherence = entries.filter((e) => e.adherenceRate > 0.7);
  if (highAdherence.length > 0) {
    insights.push(`Высокое следование: ${highAdherence.map((e) => e.title).join(', ')}`);
  }

  const lowAdherence = entries.filter((e) => e.adherenceRate < 0.3 && e.sampleCount >= 3);
  if (lowAdherence.length > 0) {
    insights.push(`Низкое выполнение: ${lowAdherence.map((e) => e.title).join(', ')}`);
  }

  if (memory.fatigueLevel > 0.6) {
    insights.push('Высокая рекомендательная усталость — снижаю количество');
  }

  return {
    entries,
    strongestIntervention,
    mostResisted,
    insights,
    hasData: entries.length > 0,
  };
};
