import { useEffect, useState } from 'react';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { fetchLast30Days, type DailySummary } from '@/core/boosta/syncEvents';
import { projectCourse } from '@/core/boosta/forecast';

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function HistoryScreen() {
  const events = useBoostaStore((s) => s.events);
  const realCharge = useBoostaStore((s) => s.realCharge);
  const ghostCharge = useBoostaStore((s) => s.ghostCharge);
  const todayCourse = useBoostaStore((s) => s.todayCourse);

  const [summaries, setSummaries] = useState<DailySummary[]>([]);

  useEffect(() => {
    fetchLast30Days().then(setSummaries);
  }, []);

  // Build 30-day chart data: real Supabase summaries + today from store
  const chart30 = buildChart30(summaries, realCharge, ghostCharge);

  // Build week data from last 7 events (simplified)
  const week = buildWeek(events);

  const forecast = projectCourse(events);
  const FORECASTS = [
    { title: 'Если ничего не менять',  value: `${forecast.ifNothing > 0 ? '+' : ''}${forecast.ifNothing}%`, tone: 'drift' as const },
    { title: 'Если идти как идёшь',    value: `${forecast.ifReal > 0 ? '+' : ''}${forecast.ifReal}%`,    tone: 'neutral' as const },
    { title: 'Если идти как лучший',   value: `${forecast.ifGhost > 0 ? '+' : ''}${forecast.ifGhost}%`,  tone: 'aligned' as const },
  ];

  return (
    <div>
      <BoostaSection spacing="md">
        <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>
          Твои дни
        </h1>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Карта разрывов · 30 дней">
        <BoostaCard padding="md">
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${chart30.length}, 1fr)`,
            gap: 4,
            alignItems: 'end',
            height: 100,
          }}>
            {chart30.map((d, i) => (
              <div key={i} style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 2,
              }}>
                <div style={{
                  height: `${d.ghost}%`,
                  background: boostaTokens.color.ghost[400],
                  borderRadius: 1,
                  opacity: 0.85,
                }} />
                <div style={{
                  height: `${d.real}%`,
                  background: boostaTokens.color.real[400],
                  borderRadius: 1,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: '50%',
                  opacity: 0.85,
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 10, color: boostaTokens.color.surface.inkMuted }}>30 дней назад</span>
            <span style={{ fontSize: 10, color: boostaTokens.color.surface.inkMuted }}>сегодня</span>
          </div>
        </BoostaCard>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Тренд недели">
        <BoostaCard padding="md">
          <svg viewBox="0 0 280 100" style={{ width: '100%', height: 120 }}>
            <polyline
              fill="none"
              stroke={boostaTokens.color.real[400]}
              strokeWidth="2"
              points={week.map((d, i) => `${(i / 6) * 280},${100 - d.real}`).join(' ')}
            />
            <polyline
              fill="none"
              stroke={boostaTokens.color.ghost[600]}
              strokeWidth="2"
              strokeDasharray="4 3"
              points={week.map((d, i) => `${(i / 6) * 280},${100 - d.ghost}`).join(' ')}
            />
            {week.map((d, i) => (
              <g key={i}>
                <circle cx={(i / 6) * 280} cy={100 - d.real} r="3" fill={boostaTokens.color.real[400]} />
                <circle cx={(i / 6) * 280} cy={100 - d.ghost} r="3" fill={boostaTokens.color.ghost[600]} />
              </g>
            ))}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {week.map((d) => (
              <span key={d.label} style={{ fontSize: 10, color: boostaTokens.color.surface.inkMuted }}>{d.label}</span>
            ))}
          </div>
        </BoostaCard>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Прогноз курса · 90 дней">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FORECASTS.map(f => {
            const color =
              f.tone === 'drift'   ? boostaTokens.color.state.drift :
              f.tone === 'aligned' ? boostaTokens.color.state.aligned :
                                     boostaTokens.color.state.neutral;
            return (
              <BoostaCard key={f.title} padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: boostaTokens.color.surface.ink }}>{f.title}</span>
                  <span style={{ fontSize: 18, fontWeight: 600, color }}>{f.value}</span>
                </div>
              </BoostaCard>
            );
          })}
        </div>
      </BoostaSection>

      {events.length === 0 && (
        <BoostaSection spacing="md">
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkMuted, textAlign: 'center' }}>
            История появится после первых событий в чек-ине
          </p>
        </BoostaSection>
      )}
    </div>
  );
}

function buildChart30(
  summaries: DailySummary[],
  todayReal: number,
  todayGhost: number,
): { real: number; ghost: number }[] {
  const filled: { real: number; ghost: number }[] = [];
  // Oldest to newest (30 slots)
  for (let i = 29; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = summaries.find((s) => s.date === key);
    filled.push({ real: found?.end_real ?? 0, ghost: found?.end_ghost ?? 0 });
  }
  filled.push({ real: todayReal, ghost: todayGhost });
  return filled;
}

function buildWeek(events: ReturnType<typeof useBoostaStore.getState>['events']) {
  const result: { real: number; ghost: number; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayEvents = events.filter((e) => new Date(e.timestamp).toDateString() === dateStr);
    const real = dayEvents.length > 0
      ? Math.max(0, Math.min(100, 80 + dayEvents.reduce((a, e) => a + e.impactReal, 0)))
      : 0;
    const ghost = dayEvents.length > 0
      ? Math.max(0, Math.min(100, 80 + dayEvents.reduce((a, e) => a + e.impactGhost, 0)))
      : 0;
    result.push({ real, ghost, label: WEEK_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1] });
  }
  return result;
}
