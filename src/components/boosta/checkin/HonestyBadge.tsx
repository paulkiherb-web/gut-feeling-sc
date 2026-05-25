import { boostaTokens } from '@/design/boosta/tokens';

export default function HonestyBadge() {
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: boostaTokens.radius.md,
      background: boostaTokens.color.ghost[50],
      border: `0.5px solid ${boostaTokens.color.ghost[200]}`,
      display: 'flex',
      gap: 10,
      alignItems: 'center',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: boostaTokens.color.ghost[400],
        flexShrink: 0,
      }} />
      <p style={{
        fontSize: 13,
        color: boostaTokens.color.ghost[800],
        fontStyle: 'italic',
        lineHeight: 1.4,
      }}>
        Будь честен с собой. Всё имеет вес.
      </p>
    </div>
  );
}
