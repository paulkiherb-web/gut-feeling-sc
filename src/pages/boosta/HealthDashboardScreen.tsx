// HealthDashboardScreen — BMI realtime + weekly RYG counts + biomarker trends placeholder.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/core/store/appStore';
import { useScores } from '@/core/hooks/useScores';
import { boostaTokens } from '@/design/boosta/tokens';

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Недовес', color: '#8AB4F8' };
  if (bmi < 25) return { label: 'Норма', color: '#34C759' };
  if (bmi < 30) return { label: 'Избыток', color: '#FFCC00' };
  return { label: 'Высокий', color: '#FF6B6B' };
}

export default function HealthDashboardScreen() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const events = useAppStore((s) => s.eventLog);
  const { readinessScore, energy, sleep, recovery, nutrition } = useScores();

  const bmi = useMemo(() => {
    const h = profile?.heightCm;
    const w = profile?.weightKg;
    if (!h || !w) return null;
    const m = h / 100;
    return w / (m * m);
  }, [profile?.heightCm, profile?.weightKg]);

  const weeklyRYG = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    let red = 0, yellow = 0, green = 0;
    for (const e of events) {
      const t = new Date(e.createdAt ?? Date.now()).getTime();
      if (now - t > week) continue;
      if (e.type !== 'scan.completed') continue;
      const v = (e.payload as any).verdict;
      if (v === 'red') red++;
      else if (v === 'yellow') yellow++;
      else if (v === 'green') green++;
    }
    return { red, yellow, green };
  }, [events]);

  const totalScans = weeklyRYG.red + weeklyRYG.yellow + weeklyRYG.green;

  return (
    <div style={{
      minHeight: '100dvh',
      background: boostaTokens.color.surface.base,
      color: boostaTokens.color.surface.ink,
      padding: '16px 16px 80px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none', border: 'none', color: boostaTokens.color.surface.inkSoft,
          fontSize: 14, cursor: 'pointer', padding: 4,
        }}>← назад</button>
        <h1 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Здоровье</h1>
        <span style={{ width: 60 }} />
      </div>

      {/* BMI card */}
      <section style={{
        background: boostaTokens.color.surface.raised,
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
        borderRadius: 18, padding: 16,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          margin: '0 0 8px',
        }}>Индекс массы тела</p>
        {bmi ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 600 }}>{bmi.toFixed(1)}</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: bmiCategory(bmi).color,
              }}>{bmiCategory(bmi).label}</span>
            </div>
            <p style={{
              fontSize: 12, color: boostaTokens.color.surface.inkSoft,
              margin: '4px 0 0',
            }}>{profile?.heightCm} см · {profile?.weightKg} кг</p>
          </>
        ) : (
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, margin: 0 }}>
            Укажите рост и вес в профиле, чтобы видеть ИМТ.
          </p>
        )}
      </section>

      {/* Weekly RYG */}
      <section style={{
        background: boostaTokens.color.surface.raised,
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
        borderRadius: 18, padding: 16,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          margin: '0 0 12px',
        }}>Эта неделя — сканы</p>
        {totalScans === 0 ? (
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft, margin: 0 }}>
            Пока нет сканов за 7 дней.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: '🟢', count: weeklyRYG.green, color: '#34C759' },
              { label: '🟡', count: weeklyRYG.yellow, color: '#FFCC00' },
              { label: '🔴', count: weeklyRYG.red, color: '#FF6B6B' },
            ].map((s) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '10px 6px',
                background: boostaTokens.color.surface.base,
                borderRadius: 12,
                border: `0.5px solid ${boostaTokens.color.surface.line}`,
              }}>
                <div style={{ fontSize: 20 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: s.color }}>{s.count}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Biomarker trends — composite from scorecard */}
      <section style={{
        background: boostaTokens.color.surface.raised,
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
        borderRadius: 18, padding: 16,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          margin: '0 0 12px',
        }}>Биомаркеры — текущие</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Готовность', value: readinessScore },
            { label: 'Энергия', value: energy },
            { label: 'Сон', value: sleep },
            { label: 'Восстановление', value: recovery },
            { label: 'Питание', value: nutrition },
          ].map((row) => {
            const v = Math.round(row.value ?? 0);
            return (
              <div key={row.label}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, color: boostaTokens.color.surface.inkSoft,
                  marginBottom: 4,
                }}>
                  <span>{row.label}</span>
                  <span style={{ color: boostaTokens.color.surface.ink, fontWeight: 600 }}>{v}</span>
                </div>
                <div style={{
                  height: 6, borderRadius: 3,
                  background: boostaTokens.color.surface.line,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${Math.max(0, Math.min(100, v))}%`,
                    background: v >= 70 ? '#34C759' : v >= 40 ? '#FFCC00' : '#FF6B6B',
                    transition: 'width 400ms ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{
          fontSize: 11, color: boostaTokens.color.surface.inkMuted,
          margin: '12px 0 0', lineHeight: 1.4,
        }}>
          Тренды по неделям появятся после 7 дней регулярных сканов.
        </p>
      </section>
    </div>
  );
}
