import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import GhostAvatar from '@/components/boosta/ghost/GhostAvatar';
import { boostaTokens } from '@/design/boosta/tokens';
import { ghostVoice } from '@/design/boosta/voice';

interface Props { onNext: () => void; }

export default function Step5GhostMeet({ onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={boostaTokens.motion.smooth}
      style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', paddingTop: 60 }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...boostaTokens.motion.slow, delay: 0.2 }}
      >
        <GhostAvatar size={96} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{ borderLeft: `2px solid ${boostaTokens.color.ghost[400]}`, padding: '12px 18px', textAlign: 'left' }}
      >
        <p style={{ fontSize: 16, fontStyle: 'italic', color: boostaTokens.color.ghost[800], lineHeight: 1.5 }}>
          {ghostVoice.onboarding.greet} {ghostVoice.onboarding.quiet}
        </p>
      </motion.div>

      <BoostaButton onClick={onNext}>Понял</BoostaButton>
    </motion.div>
  );
}
