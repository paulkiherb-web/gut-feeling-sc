import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { boostaTokens } from '@/design/boosta/tokens';
import { ghostVoice } from '@/design/boosta/voice';
import type { BoostaEvent } from '@/core/store/slices/boostaSlice';

export default function EventFeed() {
  const events = useBoostaStore((s) => s.events);
  const removeEvent = useBoostaStore((s) => s.removeEvent);
  const today = events
    .filter((e) => {
      const d = new Date(e.timestamp);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (today.length === 0) {
    return (
      <p style={{
        fontSize: 13,
        color: boostaTokens.color.surface.inkMuted,
        textAlign: 'center',
        padding: '16px 0',
      }}>
        День ещё чист. Первое событие создаст линию.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {today.map((e) => (
        <EventRow key={e.id} event={e} onRemove={() => removeEvent(e.id)} />
      ))}
    </div>
  );
}

function EventRow({ event, onRemove }: { event: BoostaEvent; onRemove: () => void }) {
  const label = {
    aligned: ghostVoice.inline.aligned,
    drift:   ghostVoice.inline.drift,
    neutral: ghostVoice.inline.neutral,
  }[event.verdict];

  const color = {
    aligned: boostaTokens.color.ghost[600],
    drift:   boostaTokens.color.state.drift,
    neutral: boostaTokens.color.surface.inkSoft,
  }[event.verdict];

  const time = new Date(event.timestamp).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      background: boostaTokens.color.surface.sunk,
      borderRadius: 14,
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 500 }}>{event.name}</p>
        <p style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>{time}</p>
      </div>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color,
        padding: '4px 10px',
        borderRadius: 8,
        background: `${color}15`,
      }}>
        {label} · {event.impactReal > 0 ? '+' : ''}{event.impactReal}%
      </span>
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 16,
          color: boostaTokens.color.surface.inkMuted,
          cursor: 'pointer',
          padding: '0 4px',
          lineHeight: 1,
        }}
        aria-label="Удалить"
      >
        ×
      </button>
    </div>
  );
}
