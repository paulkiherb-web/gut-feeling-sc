import { useMemo } from 'react';
import { useScores } from '@/core/hooks/useScores';
import { boostaTokens } from '@/design/boosta/tokens';
import type { DailyBlueprint } from '@/core/intensive/types';

interface Props { day: DailyBlueprint }

const WIDTH = 320;
const HEIGHT = 90;
const PAD_X = 12;
const TRACK_TOP = 30;
const TRACK_BOTTOM = 70;

function timeToX(time: string): number {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  const minutes = (Number.isFinite(h) ? h : 8) * 60 + (Number.isFinite(m) ? m : 0);
  return PAD_X + ((WIDTH - PAD_X * 2) * minutes) / (24 * 60);
}

export default function DualPathTrack({ day }: Props) {
  const { readinessScore, ghostReadinessScore } = useScores();
  const real = readinessScore ?? 50;
  const ghost = ghostReadinessScore ?? 50;
  const nowX = useMemo(() => {
    const n = new Date();
    return timeToX(`${n.getHours()}:${n.getMinutes()}`);
  }, []);

  const sortedItems = useMemo(
    () => [...day.items].sort((a, b) => timeToX(a.time) - timeToX(b.time)),
    [day],
  );

  return (
    <div style={{
      background: boostaTokens.color.surface.raised,
      border: `0.5px solid ${boostaTokens.color.surface.line}`,
      borderRadius: 18, padding: 14,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
        marginBottom: 8,
      }}>Сегодня</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 6, 12, 18, 24].map((h) => (
          <line key={h}
            x1={timeToX(`${h}:00`)} x2={timeToX(`${h}:00`)}
            y1={TRACK_TOP - 4} y2={TRACK_BOTTOM + 4}
            stroke={boostaTokens.color.surface.line} strokeWidth={0.5} />
        ))}
        {[0, 6, 12, 18].map((h) => (
          <text key={`l${h}`}
            x={timeToX(`${h}:00`)} y={TRACK_BOTTOM + 16}
            fontSize={9} fill={boostaTokens.color.surface.inkMuted} textAnchor="middle">{h}</text>
        ))}
        <line x1={PAD_X} x2={WIDTH - PAD_X} y1={TRACK_TOP} y2={TRACK_TOP}
          stroke={boostaTokens.color.ghost[600]} strokeWidth={2} strokeDasharray="3 3" />
        <line x1={PAD_X} x2={WIDTH - PAD_X} y1={TRACK_BOTTOM} y2={TRACK_BOTTOM}
          stroke={boostaTokens.color.real[600]} strokeWidth={2} />
        <line x1={nowX} x2={nowX} y1={TRACK_TOP - 8} y2={TRACK_BOTTOM + 8}
          stroke={boostaTokens.color.surface.ink} strokeWidth={1} />
        <circle cx={nowX} cy={TRACK_BOTTOM} r={4} fill={boostaTokens.color.real[800]} />
        {sortedItems.map((item) => {
          const x = timeToX(item.time);
          const past = x < nowX;
          return (
            <circle key={item.id || item.time + item.title}
              cx={x} cy={TRACK_TOP} r={past ? 3 : 4}
              fill={past ? boostaTokens.color.ghost[800] : boostaTokens.color.ghost[600]}
              opacity={past ? 0.5 : 1} />
          );
        })}
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: boostaTokens.color.surface.inkSoft, marginTop: 4,
      }}>
        <span style={{ color: boostaTokens.color.real[800] }}>ты: {Math.round(real)}%</span>
        <span style={{ color: boostaTokens.color.ghost[800] }}>план: {Math.round(ghost)}%</span>
      </div>
    </div>
  );
}
