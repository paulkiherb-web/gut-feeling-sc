import { boostaTokens } from '@/design/boosta/tokens';

interface Props { total: number; current: number }

export default function DayProgressDots({ total, current }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '4px 0' }}>
      {Array.from({ length: total }, (_, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <span key={idx} style={{
            width: active ? 16 : 8, height: 8, borderRadius: 999,
            background: done
              ? boostaTokens.color.ghost[600]
              : active
                ? boostaTokens.color.real[800]
                : boostaTokens.color.surface.line,
            transition: 'width 200ms ease',
          }} />
        );
      })}
    </div>
  );
}
