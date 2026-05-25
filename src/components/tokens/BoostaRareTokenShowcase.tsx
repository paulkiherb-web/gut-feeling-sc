import { BoostaToken } from './BoostaToken';
import { ALL_BOOSTA_TOKEN_TYPES, boostaTokenMeta } from './boostaTokenMeta';

export function BoostaRareTokenShowcase() {
  const rare = ALL_BOOSTA_TOKEN_TYPES.filter(t => boostaTokenMeta[t].group === 'rare');

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Редкие жетоны</h2>
      <div
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        {rare.map(t => {
          const meta = boostaTokenMeta[t];
          return (
            <div
              key={t}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: 16,
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 16,
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <BoostaToken type={t} size={120} />
              {meta.conditionText && (
                <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12, maxWidth: 180 }}>
                  {meta.conditionText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default BoostaRareTokenShowcase;
