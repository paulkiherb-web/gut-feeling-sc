import { useEffect } from 'react';
import { boostaTokens } from '@/design/boosta/tokens';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

export default function GhostWhisper() {
  const text = useBoostaStore((s) => s.lastWhisper);
  const clear = useBoostaStore((s) => s.clearWhisper);

  useEffect(() => {
    if (!text) return;
    const t = setTimeout(clear, 12000);
    return () => clearTimeout(t);
  }, [text, clear]);
  if (!text) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={boostaTokens.motion.smooth}
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          padding: '14px 18px',
          background: 'transparent',
          borderLeft: `2px solid ${boostaTokens.color.ghost[400]}`,
        }}
      >
        <div style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: boostaTokens.color.ghost[50],
          border: `1px solid ${boostaTokens.color.ghost[200]}`,
          flexShrink: 0,
          marginTop: 2,
        }} />
        <p style={{
          fontSize: 15,
          fontStyle: 'italic',
          color: boostaTokens.color.ghost[800],
          lineHeight: 1.5,
        }}>
          {text}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
