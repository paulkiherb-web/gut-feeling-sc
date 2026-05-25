import { boostaTokens } from '@/design/boosta/tokens';

interface Event { time: number; label: string; }

const MOCK_REAL: Event[] = [
  { time: 0.1, label: 'кофе' },
  { time: 0.35, label: 'круассан' },
  { time: 0.55, label: 'кофе' },
];
const MOCK_GHOST: Event[] = [
  { time: 0.1, label: 'кофе' },
  { time: 0.4, label: 'омлет' },
];

export default function DualTimeline() {
  return (
    <div style={{ position: 'relative', height: 80, padding: '8px 4px' }}>
      <Line y={20} color={boostaTokens.color.real[400]} events={MOCK_REAL} variant="real" />
      <Line y={56} color={boostaTokens.color.ghost[600]} events={MOCK_GHOST} variant="ghost" />

      <div style={{
        position: 'absolute',
        right: 6,
        top: 14,
        fontSize: 10,
        color: boostaTokens.color.real[600],
        fontWeight: 500,
      }}>
        ты
      </div>
      <div style={{
        position: 'absolute',
        right: 6,
        top: 50,
        fontSize: 10,
        color: boostaTokens.color.ghost[600],
        fontWeight: 500,
      }}>
        лучший
      </div>
    </div>
  );
}

function Line({ y, color, events, variant }: {
  y: number;
  color: string;
  events: Event[];
  variant: 'real' | 'ghost';
}) {
  return (
    <div style={{ position: 'absolute', left: 30, right: 50, top: y, height: 2 }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: variant === 'ghost' ? 0.5 : 1,
        borderRadius: 1,
        borderTop: variant === 'ghost' ? `1px dashed ${color}` : 'none',
        backgroundColor: variant === 'ghost' ? 'transparent' : color,
      }} />
      {events.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: -4,
            left: `${e.time * 100}%`,
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: color,
            border: `2px solid ${boostaTokens.color.surface.raised}`,
          }}
        />
      ))}
    </div>
  );
}
