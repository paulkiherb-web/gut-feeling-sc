import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import ScreenIndicator from './ScreenIndicator';
import { boostaTokens } from '@/design/boosta/tokens';

export interface Screen {
  id: string;
  label: string;
  node: ReactNode;
}

interface Props {
  screens: Screen[];
  initial?: number;
  activeIdx?: number;
  onIndexChange?: (idx: number) => void;
}

export default function SwipeShell({ screens, initial = 0, activeIdx, onIndexChange }: Props) {
  const [internalIdx, setInternalIdx] = useState(initial);
  const [dir, setDir] = useState<1 | -1>(1);

  // Controlled mode: use activeIdx from parent if provided
  const idx = activeIdx !== undefined ? activeIdx : internalIdx;

  const go = (next: number) => {
    if (next < 0 || next >= screens.length) return;
    setDir(next > idx ? 1 : -1);
    if (onIndexChange) {
      onIndexChange(next);
    } else {
      setInternalIdx(next);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft:  () => go(idx + 1),
    onSwipedRight: () => go(idx - 1),
    trackMouse: true,
    delta: 40,
  });

  return (
    <div
      {...handlers}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: boostaTokens.color.surface.base,
        overflow: 'hidden',
      }}
    >
      <ScreenIndicator
        screens={screens}
        active={idx}
        onJump={go}
      />

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={screens[idx].id}
          custom={dir}
          initial={{ x: dir * 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -dir * 60, opacity: 0 }}
          transition={boostaTokens.motion.smooth}
          style={{ padding: '16px 20px 100px' }}
        >
          {screens[idx].node}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
