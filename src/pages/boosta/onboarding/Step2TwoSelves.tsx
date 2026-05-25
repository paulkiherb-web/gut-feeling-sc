import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import DualBattery from '@/components/boosta/battery/DualBattery';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props { onNext: () => void; }

export default function Step2TwoSelves({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={boostaTokens.motion.smooth}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', paddingTop: 40 }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', maxWidth: 320 }}>
        В тебе живут двое. Ты настоящий и ты лучший.
      </h1>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <DualBattery real={54} ghost={82} />
      </div>
      <BoostaButton onClick={onNext}>Дальше</BoostaButton>
    </motion.div>
  );
}
