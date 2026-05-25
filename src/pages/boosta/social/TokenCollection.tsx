import BoostaToken from '@/components/tokens/BoostaToken';
import { boostaTokenMeta, BoostaTokenType } from '@/components/tokens/boostaTokenMeta';
import { boostaTokens } from '@/design/boosta/tokens';

const BASE_TOKENS = Object.entries(boostaTokenMeta)
  .filter(([, m]) => m.rarity === 'base')
  .map(([k]) => k as BoostaTokenType);

const RARE_TOKENS = Object.entries(boostaTokenMeta)
  .filter(([, m]) => m.rarity !== 'base')
  .map(([k]) => k as BoostaTokenType);

export default function TokenCollection() {
  const unlockedBase = BASE_TOKENS;
  const unlockedRare: BoostaTokenType[] = [];

  return (
    <div style={{ padding: '20px 16px 60px', display: 'flex',
      flexDirection: 'column', gap: 24 }}>

      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
          Моя коллекция
        </h2>
        <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>
          Разблокировано {unlockedBase.length + unlockedRare.length} из 30
        </p>
      </div>

      <div style={{ height: 4, borderRadius: 2,
        background: boostaTokens.color.surface.line, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${((unlockedBase.length + unlockedRare.length) / 30) * 100}%`,
          background: boostaTokens.color.ghost[600],
          borderRadius: 2,
        }} />
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          marginBottom: 12 }}>
          Базовые · {unlockedBase.length}/25
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {BASE_TOKENS.map(type => (
            <div key={type} style={{ display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4 }}>
              <BoostaToken
                type={type}
                size={52}
                showLabel={false}
                showSubLabel={false}
                locked={!unlockedBase.includes(type)}
              />
              <span style={{ fontSize: 9, color: boostaTokens.color.surface.inkMuted,
                textAlign: 'center' }}>
                {boostaTokenMeta[type].labelRu}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
          marginBottom: 12 }}>
          Редкие · {unlockedRare.length}/5
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {RARE_TOKENS.map(type => (
            <div key={type} style={{ display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6 }}>
              <BoostaToken
                type={type}
                size={72}
                showLabel={false}
                showSubLabel={false}
                locked={!unlockedRare.includes(type)}
              />
              <p style={{ fontSize: 11, fontWeight: 500, textAlign: 'center',
                color: boostaTokens.color.surface.ink }}>
                {boostaTokenMeta[type].labelRu}
              </p>
              <p style={{ fontSize: 10, textAlign: 'center',
                color: boostaTokens.color.surface.inkMuted, lineHeight: 1.3 }}>
                {boostaTokenMeta[type].conditionText}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        disabled
        style={{
          marginTop: 8,
          padding: '12px 0',
          borderRadius: 14,
          background: boostaTokens.color.surface.sunk,
          border: `0.5px solid ${boostaTokens.color.surface.line}`,
          fontSize: 13,
          color: boostaTokens.color.surface.inkMuted,
          cursor: 'not-allowed',
        }}
      >
        Распечатать набор (скоро)
      </button>
    </div>
  );
}
