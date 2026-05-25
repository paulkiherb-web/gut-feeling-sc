import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props { onDone: () => void; }

export default function Step7Ready({ onDone }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={boostaTokens.motion.smooth}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', paddingTop: 80 }}
    >
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 24,
        background: `linear-gradient(135deg, ${boostaTokens.color.real[400]}, ${boostaTokens.color.ghost[600]})`,
      }} />
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Готов.
      </h1>
      <p style={{ fontSize: 16, color: boostaTokens.color.surface.inkSoft, maxWidth: 300, lineHeight: 1.5 }}>
        Открой Boosta когда что-то выберешь сегодня.
      </p>
      <BoostaButton onClick={onDone}>В путь</BoostaButton>
    </motion.div>
  );
}
