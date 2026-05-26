import { useEffect, useState } from 'react';
import { boostaTokens } from '@/design/boosta/tokens';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';
import { useRecommendations } from '@/core/hooks/useRecommendations';

export default function GhostWhisper() {
  const lastWhisper = useBoostaStore((s) => s.lastWhisper);
  const clear = useBoostaStore((s) => s.clearWhisper);
  const { recommendations } = useRecommendations();
  const text = lastWhisper || recommendations[0]?.body || undefined;
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState('');

  // Auto-clear after 12s — only for transient whispers, not permanent recommendations
  useEffect(() => {
    if (!lastWhisper) return;
    const t = setTimeout(clear, 12000);
    return () => clearTimeout(t);
  }, [lastWhisper, clear]);

  // Typewriter effect
  useEffect(() => {
    if (!text) { setVisible(false); setDisplayed(''); return; }

    setVisible(true);
    setDisplayed('');

    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 38);

    return () => clearInterval(interval);
  }, [text]);

  if (!text) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={boostaTokens.motion.smooth}
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: '16px 18px',
            background: boostaTokens.color.ghost[50],
            borderRadius: boostaTokens.radius.lg,
            border: `1px solid ${boostaTokens.color.ghost[200]}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pulsing avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: boostaTokens.color.ghost[200],
                opacity: 0.4,
                position: 'absolute',
                inset: -4,
              }}
            />
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: boostaTokens.color.ghost[50],
              border: `1.5px solid ${boostaTokens.color.ghost[400]}`,
              position: 'relative',
              zIndex: 1,
            }} />
          </div>

          {/* Typewriter text with blinking cursor */}
          <p style={{
            fontSize: 15,
            fontStyle: 'italic',
            color: boostaTokens.color.ghost[800],
            lineHeight: 1.55,
            letterSpacing: '-0.01em',
            paddingTop: 2,
          }}>
            {displayed}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ display: 'inline-block', width: 2, height: 14, background: boostaTokens.color.ghost[400], marginLeft: 2, verticalAlign: 'middle' }}
            />
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

