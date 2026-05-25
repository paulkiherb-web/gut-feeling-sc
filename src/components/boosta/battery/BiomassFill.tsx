import { boostaTokens } from '@/design/boosta/tokens';
import { motion } from 'framer-motion';

interface Props {
  percent: number;
  variant: 'real' | 'ghost';
}

export default function BiomassFill({ percent, variant }: Props) {
  const colors = variant === 'real'
    ? { wave1: boostaTokens.color.real[200], wave2: boostaTokens.color.real[400], fill: boostaTokens.color.real[400] }
    : { wave1: boostaTokens.color.ghost[200], wave2: boostaTokens.color.ghost[400], fill: boostaTokens.color.ghost[600] };

  return (
    <div style={{ position: 'relative', width: 56, height: 100 }}>
      <div style={{
        position: 'absolute',
        top: -4,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 22,
        height: 6,
        background: colors.wave2,
        borderRadius: '3px 3px 0 0',
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        border: `2.5px solid ${colors.wave2}`,
        borderRadius: 12,
        overflow: 'hidden',
        background: boostaTokens.color.surface.sunk,
      }}>
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          transition={{ ...boostaTokens.motion.slow, delay: 0.2 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: colors.fill,
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: [-6, 6, -6] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: -6,
              left: -12,
              right: -12,
              height: 14,
              background: colors.wave1,
              borderRadius: '50%',
            }}
          />
          <motion.div
            animate={{ x: [6, -6, 6] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: -2,
              left: -12,
              right: -12,
              height: 10,
              background: colors.wave2,
              borderRadius: '50%',
              opacity: 0.55,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
