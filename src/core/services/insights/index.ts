import type { DomainEvent } from '../../store/types/events';
import type { Insight, StateSnapshot } from '../../store/types/state';
import { byType, filterToday } from '../../store/calculators/_helpers';

const id = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

// Rule-based local insights — fast feedback layer. AI insights can extend later.
export function deriveLocalInsights(events: DomainEvent[], snapshot: StateSnapshot): Insight[] {
  const out: Insight[] = [];
  const now = new Date().toISOString();
  const today = filterToday(events);
  const scans = byType(today, 'scan.completed');

  if (snapshot.scores.energy < 45 && snapshot.nutrition.redCount >= 2) {
    out.push({
      id: id(), kind: 'causal', confidence: 0.7, createdAt: now,
      title: 'Энергия проседает после тяжёлых выборов',
      body: 'Сегодня уже два «красных» приёма — это сильнее всего влияет на твою энергию.',
      signals: ['redCount>=2', 'energy<45'],
    });
  }

  if (snapshot.hydration.ml < 600 && scans.length >= 2) {
    out.push({
      id: id(), kind: 'risk', confidence: 0.6, createdAt: now,
      title: 'Вода забыта',
      body: `Меньше 600 мл за день при ${scans.length} приёмах. Это даст вялость к вечеру.`,
      signals: ['hydration<600'],
    });
  }

  if (snapshot.nutrition.greenCount >= 3) {
    out.push({
      id: id(), kind: 'win', confidence: 0.8, createdAt: now,
      title: 'Сильный день по выбору',
      body: `${snapshot.nutrition.greenCount} зелёных решения подряд — поддерживай ритм.`,
      signals: ['greenCount>=3'],
    });
  }

  return out;
}
