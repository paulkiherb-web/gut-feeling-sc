import { BoostaToken } from './BoostaToken';
import {
  ALL_BOOSTA_TOKEN_TYPES,
  BoostaTokenType,
  TOKEN_GROUP_LABELS,
  TokenGroup,
  boostaTokenMeta,
} from './boostaTokenMeta';

const BASE_GROUPS: TokenGroup[] = ['movement', 'sport', 'substance', 'life', 'work'];

export function BoostaTokenGrid() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {BASE_GROUPS.map(group => {
        const types = ALL_BOOSTA_TOKEN_TYPES.filter(t => boostaTokenMeta[t].group === group);
        return (
          <section key={group}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, opacity: 0.85 }}>
              {TOKEN_GROUP_LABELS[group]}
            </h2>
            <div
              style={{
                display: 'grid',
                gap: 20,
                gridTemplateColumns: 'repeat(var(--cols, 5), 1fr)',
              }}
              className="boosta-token-grid"
            >
              {types.map((t: BoostaTokenType) => (
                <div key={t} style={{ display: 'flex', justifyContent: 'center' }}>
                  <BoostaToken type={t} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <style>{`
        .boosta-token-grid { --cols: 5; }
        @media (max-width: 640px) {
          .boosta-token-grid { --cols: 4; }
        }
      `}</style>
    </div>
  );
}

export default BoostaTokenGrid;
