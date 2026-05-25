import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props { onNext: () => void; }

export default function Step1Welcome({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', paddingTop: 80 }}
    >
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 18,
        background: `linear-gradient(135deg, ${boostaTokens.color.real[400]}, ${boostaTokens.color.ghost[600]})`,
      }} />
      <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Привет. Это Boosta.
      </h1>
      <p style={{ fontSize: 16, color: boostaTokens.color.surface.inkSoft, maxWidth: 280 }}>
        Зеркало двух твоих версий — настоящей и лучшей.
      </p>
      <BoostaButton onClick={onNext}>Дальше</BoostaButton>
    </motion.div>
  );
}
