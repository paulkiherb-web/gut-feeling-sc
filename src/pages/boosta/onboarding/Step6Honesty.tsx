import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import HonestyBadge from '@/components/boosta/checkin/HonestyBadge';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props { onNext: () => void; }

export default function Step6Honesty({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingTop: 60, alignItems: 'center', textAlign: 'center' }}
    >
      <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.015em' }}>
        Будь честен.
      </h1>
      <p style={{ fontSize: 16, color: boostaTokens.color.surface.inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
        Это работает только так. Вино, лыжи, срывы — всё имеет вес. Я не сужу.
      </p>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <HonestyBadge />
      </div>
      <BoostaButton onClick={onNext}>Согласен</BoostaButton>
    </motion.div>
  );
}
