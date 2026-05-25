import { boostaTokens } from '@/design/boosta/tokens';
import { motion } from 'framer-motion';

interface Props {
  original: string;
  alternative: string;
  reason: string;
  onClose: () => void;
}

export default function GhostAlternative({ original, alternative, reason, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        right: 16,
        background: boostaTokens.color.surface.raised,
        borderRadius: boostaTokens.radius.xl,
        padding: 20,
        boxShadow: boostaTokens.shadow.raise,
        border: `0.5px solid ${boostaTokens.color.ghost[200]}`,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: boostaTokens.color.ghost[50],
            border: `1px solid ${boostaTokens.color.ghost[200]}`,
          }} />
          <p style={{ fontSize: 11, fontWeight: 500, color: boostaTokens.color.ghost[600], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Я бы выбрал
          </p>
        </div>
        <button onClick={onClose} style={{ fontSize: 20, color: boostaTokens.color.surface.inkMuted, background: 'none', border: 'none', cursor: 'pointer' }}>
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ flex: 1, padding: '10px 14px', background: boostaTokens.color.surface.sunk, borderRadius: 12, opacity: 0.5 }}>
          <p style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>{original}</p>
        </div>
        <span style={{ fontSize: 18, color: boostaTokens.color.surface.inkMuted }}>→</span>
        <div style={{ flex: 1, padding: '10px 14px', background: boostaTokens.color.ghost[50], borderRadius: 12, border: `1px solid ${boostaTokens.color.ghost[200]}` }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: boostaTokens.color.ghost[800] }}>{alternative}</p>
        </div>
      </div>

      <p style={{ fontSize: 13, fontStyle: 'italic', color: boostaTokens.color.surface.inkSoft, lineHeight: 1.5 }}>
        {reason}
      </p>
    </motion.div>
  );
}
