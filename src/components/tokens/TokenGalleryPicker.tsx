import BoostaToken from './BoostaToken';
import { boostaTokenMeta, BoostaTokenType, TokenGroup, isSelectableBoostaToken } from './boostaTokenMeta';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  onSelect: (type: BoostaTokenType) => void;
}

const GROUP_LABELS: Record<TokenGroup, string> = {
  movement: 'Движение',
  sport: 'Спорт',
  substance: 'Привычки',
  life: 'Жизнь',
  work: 'Работа',
  rare: 'Редкие',
};

export default function TokenGalleryPicker({ onSelect }: Props) {
  const groups = Object.entries(GROUP_LABELS) as [TokenGroup, string][];

  return (
    <div style={{ padding: '8px 16px 40px' }}>
      {groups.map(([group, label]) => {
        const tokens = (Object.entries(boostaTokenMeta) as [BoostaTokenType, typeof boostaTokenMeta[BoostaTokenType]][])
          .filter(([type, meta]) => meta.group === group && isSelectableBoostaToken(type));

        if (tokens.length === 0) return null;

        return (
          <div key={group} style={{ marginBottom: 20 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: boostaTokens.color.surface.inkMuted,
              marginBottom: 10,
              paddingLeft: 4,
            }}>
              {label}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 8,
            }}>
              {tokens.map(([type]) => (
                <button
                  key={type}
                  onClick={() => onSelect(type)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <BoostaToken
                    type={type}
                    size={52}
                    showLabel={false}
                    showSubLabel={false}
                  />
                  <span style={{
                    fontSize: 10,
                    color: boostaTokens.color.surface.inkSoft,
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}>
                    {boostaTokenMeta[type].labelRu}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
