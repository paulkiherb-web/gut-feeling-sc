import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isHintSeen, markHintSeen, HINTS } from '@/core/boosta/firstUseHints';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  hintId: string;
  children: React.ReactNode;
}

export default function FirstUseHint({ hintId, children }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isHintSeen(hintId)) {
      const t = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(t);
    }
  }, [hintId]);

  const dismiss = () => {
    markHintSeen(hintId);
    setShow(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              background: '#1a1a1a',
              borderRadius: 14,
              padding: '12px 14px',
              zIndex: 100,
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
          >
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.5, marginBottom: 8 }}>
              {HINTS[hintId]}
            </p>
            <button
              onClick={dismiss}
              style={{ background: 'none', border: 'none', fontSize: 12,
                color: boostaTokens.color.ghost[400], cursor: 'pointer', padding: 0 }}
            >
              Понял →
            </button>
            <div style={{
              position: 'absolute', top: -6, left: 20,
              width: 12, height: 12,
              background: '#1a1a1a',
              transform: 'rotate(45deg)',
              borderRadius: 2,
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
