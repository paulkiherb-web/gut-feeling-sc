import { boostaTokens } from '@/design/boosta/tokens';
import type { Screen } from './SwipeShell';

interface Props {
  screens: Screen[];
  active: number;
  onJump: (i: number) => void;
}

export default function ScreenIndicator({ screens, active, onJump }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 18,
      paddingBottom: 8,
      gap: 10,
    }}>
      <p style={{
        fontSize: 13,
        fontWeight: 500,
        color: boostaTokens.color.surface.ink,
        letterSpacing: '-0.01em',
      }}>
        {screens[active].label}
      </p>
      <div style={{ display: 'flex', gap: 6 }}>
        {screens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onJump(i)}
            style={{
              width: i === active ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: i === active
                ? boostaTokens.color.ghost[600]
                : boostaTokens.color.surface.line,
              transition: 'all 0.35s ease',
              border: 'none',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
