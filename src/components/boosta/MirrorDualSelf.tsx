import { motion } from 'framer-motion';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

interface Props {
  shortReturnHint?: string;
}

export default function MirrorDualSelf({
  shortReturnHint = 'Лёгкий вечер + меньше экрана',
}: Props) {
  const realCharge = useBoostaStore((s) => s.realCharge);
  const ghostCharge = useBoostaStore((s) => s.ghostCharge);

  const gap = Math.max(0, Math.round(ghostCharge - realCharge));

  const realColor = boostaTokens.color.real[600];
  const ghostColor = boostaTokens.color.ghost[600];

  return (
    <div
      style={{
        background: boostaTokens.color.surface.raised,
        borderRadius: boostaTokens.radius.lg,
        padding: '20px 18px 22px',
        border: `0.5px solid ${boostaTokens.color.surface.line}`,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: boostaTokens.color.surface.ink,
            marginBottom: 4,
          }}
        >
          Зеркало дня
        </h3>
        <p
          style={{
            fontSize: 12,
            color: boostaTokens.color.surface.inkSoft,
          }}
        >
          Ты сейчас и лучший сценарий этого дня
        </p>
      </div>

      {/* Two figures + gap */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 14,
          marginBottom: 18,
        }}
      >
        {/* You now — solid */}
        <FigureBlock
          label="Ты сейчас"
          color={realColor}
          opacity={1}
          glow={false}
        />

        {/* Gap arc */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width={44} height={56} viewBox="0 0 44 56" aria-hidden>
            <path
              d="M 6 8 Q 22 28 6 48"
              stroke={boostaTokens.color.surface.inkMuted}
              strokeWidth={1.2}
              fill="none"
              strokeDasharray="3 3"
            />
            <path
              d="M 38 8 Q 22 28 38 48"
              stroke={boostaTokens.color.surface.inkMuted}
              strokeWidth={1.2}
              fill="none"
              strokeDasharray="3 3"
            />
          </svg>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: boostaTokens.color.surface.inkMuted,
            }}
          >
            Разрыв
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: boostaTokens.color.surface.ink,
            }}
          >
            {gap}%
          </div>
        </motion.div>

        {/* Best scenario — ghost */}
        <FigureBlock
          label="Лучший сценарий"
          color={ghostColor}
          opacity={0.55}
          glow
        />
      </div>

      <p
        style={{
          fontSize: 13,
          lineHeight: 1.45,
          color: boostaTokens.color.surface.inkSoft,
          marginBottom: 14,
        }}
      >
        Твой лучший сценарий ещё рядом. Можно мягко сократить разрыв.
      </p>

      <div
        style={{
          padding: '10px 12px',
          borderRadius: boostaTokens.radius.sm,
          background: boostaTokens.color.surface.sunk,
          border: `0.5px solid ${boostaTokens.color.surface.line}`,
        }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: boostaTokens.color.surface.inkMuted,
            marginBottom: 4,
          }}
        >
          Короткий возврат
        </p>
        <p
          style={{
            fontSize: 13,
            color: boostaTokens.color.surface.ink,
          }}
        >
          {shortReturnHint}
        </p>
      </div>
    </div>
  );
}

function FigureBlock({
  label,
  color,
  opacity,
  glow,
}: {
  label: string;
  color: string;
  opacity: number;
  glow: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <motion.div
        animate={glow ? { scale: [1, 1.04, 1], opacity: [opacity, opacity * 0.85, opacity] } : undefined}
        transition={glow ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{ filter: glow ? `drop-shadow(0 0 12px ${color}55)` : undefined }}
      >
        <Silhouette color={color} opacity={opacity} />
      </motion.div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: boostaTokens.color.surface.inkSoft,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Silhouette({ color, opacity }: { color: string; opacity: number }) {
  return (
    <svg width={64} height={92} viewBox="0 0 64 92" aria-hidden>
      <g fill={color} opacity={opacity}>
        {/* head */}
        <circle cx={32} cy={18} r={12} />
        {/* body — abstract rounded shape */}
        <path d="M 14 88 Q 14 48 32 38 Q 50 48 50 88 Q 32 96 14 88 Z" />
      </g>
    </svg>
  );
}
