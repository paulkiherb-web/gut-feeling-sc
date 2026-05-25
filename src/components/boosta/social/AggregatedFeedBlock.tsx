import { useEffect, useState } from 'react';
import BoostaCard from '@/components/boosta/primitives/BoostaCard';
import { boostaTokens } from '@/design/boosta/tokens';
import { fetchAggregatedFeed, type AggregatedFeed } from '@/core/boosta/social';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

export default function AggregatedFeedBlock() {
  const course = useBoostaStore((s) => s.todayCourse);
  const [feed, setFeed] = useState<AggregatedFeed | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAggregatedFeed(course).then(setFeed);
  }, [course]);

  if (!feed) return null;

  return (
    <BoostaCard padding="sm">
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          width: '100%', textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Что выбирают сейчас другие
            </p>
            <p style={{ fontSize: 14, color: boostaTokens.color.surface.ink, marginTop: 4 }}>
              {feed.total} человек на курсе «{feed.course}» · {feed.timeWindow}
            </p>
          </div>
          <span style={{ fontSize: 18, color: boostaTokens.color.surface.inkMuted }}>{open ? '−' : '+'}</span>
        </div>
      </button>
      {open && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {feed.choices.map((c) => (
            <li key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: boostaTokens.color.surface.ink }}>{c.label}</span>
              <span style={{ color: boostaTokens.color.ghost[600], fontWeight: 600 }}>{c.percent}%</span>
            </li>
          ))}
        </ul>
      )}
    </BoostaCard>
  );
}
