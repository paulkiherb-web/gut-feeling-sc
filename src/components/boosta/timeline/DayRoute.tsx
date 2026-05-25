import { boostaTokens } from '@/design/boosta/tokens';

type Phase = 'morning' | 'day' | 'evening' | 'sleep';
interface Props { currentPhase: Phase; }

const PHASES: { id: Phase; label: string }[] = [
  { id: 'morning', label: 'Утро' },
  { id: 'day',     label: 'День' },
  { id: 'evening', label: 'Вечер' },
  { id: 'sleep',   label: 'Сон' },
];

export default function DayRoute({ currentPhase }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {PHASES.map((p, i) => {
        const isCurrent = p.id === currentPhase;
        const idxCurrent = PHASES.findIndex(x => x.id === currentPhase);
        const isPast = i < idxCurrent;

        return (
          <div key={p.id} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            opacity: isPast || isCurrent ? 1 : 0.4,
          }}>
            <div style={{
              width: isCurrent ? 14 : 8,
              height: isCurrent ? 14 : 8,
              borderRadius: '50%',
              background: isCurrent || isPast
                ? boostaTokens.color.ghost[600]
                : boostaTokens.color.surface.line,
              transition: 'all 0.3s',
            }} />
            <span style={{
              fontSize: 11,
              fontWeight: isCurrent ? 600 : 400,
              color: boostaTokens.color.surface.inkSoft,
            }}>
              {p.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
