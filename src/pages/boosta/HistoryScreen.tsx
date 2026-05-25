import { useEffect, useState } from 'react';
import BoostaSection from '@/components/boosta/primitives/BoostaSection';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { fetchLast30Days, type DailySummary } from '@/core/boosta/syncEvents';
import { projectCourse } from '@/core/boosta/forecast';
import { detectPatterns, getHeatmap90, searchEvents, type Pattern } from '@/core/boosta/patterns';

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function HistoryScreen() {
  const events = useBoostaStore((s) => s.events);
  const realCharge = useBoostaStore((s) => s.realCharge);
  const ghostCharge = useBoostaStore((s) => s.ghostCharge);
  const todayCourse = useBoostaStore((s) => s.todayCourse);

  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [patterns, setPatterns]   = useState<Pattern[]>([]);
  const [heatmap, setHeatmap]     = useState<Array<{ date: string; real: number; ghost: number }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; timestamp: string; impact_real: number }>>([]);

  useEffect(() => {
    fetchLast30Days().then(setSummaries);
    detectPatterns(90).then(setPatterns);
    getHeatmap90().then(setHeatmap);
  }, []);

  useEffect(() => {
    if (!searchQuery) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      searchEvents({ query: searchQuery }).then((rs) => setSearchResults(rs.slice(0, 30)));
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

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

      <BoostaSection spacing="lg" label="Heatmap · 90 дней">
        <BoostaCard padding="md">
          {heatmap.length === 0 ? (
            <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
              Накопится после 7 дней чек-ина.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, 1fr)',
              gap: 4,
            }}>
              {fillHeatmap(heatmap).map((d, i) => (
                <div
                  key={i}
                  title={`${d.date}: ${d.real}/${d.ghost}`}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 4,
                    background: heatColor(d.real, d.ghost),
                    opacity: d.empty ? 0.25 : 1,
                  }}
                />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: boostaTokens.color.ghost[400], borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />близко</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: boostaTokens.color.real[400], borderRadius: 2, verticalAlign: 'middle', marginRight: 4 }} />разрыв</span>
          </div>
        </BoostaCard>
      </BoostaSection>

      <BoostaSection spacing="lg" label="Найденные паттерны">
        {patterns.length === 0 ? (
          <BoostaCard variant="sunk" padding="sm">
            <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted }}>
              Паттерны появятся после ~5 событий. Чем больше данных, тем точнее.
            </p>
          </BoostaCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patterns.map((p) => (
              <BoostaCard key={p.id} padding="sm">
                <p style={{ fontSize: 14, color: boostaTokens.color.surface.ink }}>{p.title}</p>
                {p.detail && <p style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted, marginTop: 4 }}>{p.detail}</p>}
              </BoostaCard>
            ))}
          </div>
        )}
      </BoostaSection>

      <BoostaSection spacing="lg" label="Поиск по событиям">
        <BoostaCard padding="sm">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Например: кофе'
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 12,
              border: `0.5px solid ${boostaTokens.color.surface.line}`,
              background: boostaTokens.color.surface.sunk,
              fontSize: 14, boxSizing: 'border-box',
            }}
          />
          {searchResults.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {searchResults.map((r, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>{new Date(r.timestamp).toLocaleDateString('ru')} — {r.name}</span>
                  <span style={{ color: r.impact_real < 0 ? boostaTokens.color.state.drift : boostaTokens.color.state.aligned }}>
                    {r.impact_real > 0 ? '+' : ''}{r.impact_real}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </BoostaCard>
      </BoostaSection>
    </div>
  );
}

function fillHeatmap(rows: Array<{ date: string; real: number; ghost: number }>) {
  const map = new Map(rows.map((r) => [r.date, r]));
  const out: Array<{ date: string; real: number; ghost: number; empty: boolean }> = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = map.get(key);
    out.push({
      date: key,
      real: found?.real ?? 0,
      ghost: found?.ghost ?? 0,
      empty: !found,
    });
  }
  return out;
}

function heatColor(real: number, ghost: number) {
  const gap = Math.abs(real - ghost);
  if (gap === 0 && real === 0) return '#E0DBD2';
  if (gap <= 5)  return '#1D9E75';
  if (gap <= 15) return '#5DCAA5';
  if (gap <= 30) return '#EF9F27';
  return '#A32D2D';
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
