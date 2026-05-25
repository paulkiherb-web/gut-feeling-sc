import { motion } from 'framer-motion';
import { useState } from 'react';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import CategoryChip from '@/components/boosta/checkin/CategoryChip';
import { boostaTokens } from '@/design/boosta/tokens';

const GOALS = ['Здоровье', 'Энергия', 'Спокойствие', 'Тело', 'Ясность ума', 'Близость'];

interface Props { onNext: (goal: string) => void; }

export default function Step3Goal({ onNext }: Props) {
  const [goal, setGoal] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 40 }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', textAlign: 'center' }}>
        Куда ты хочешь прийти?
      </h1>

      <input
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Своими словами…"
        style={{
          width: '100%',
          padding: '14px 18px',
          background: boostaTokens.color.surface.raised,
          border: `0.5px solid ${boostaTokens.color.surface.line}`,
          borderRadius: boostaTokens.radius.md,
          fontSize: 15,
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {GOALS.map(g => (
          <CategoryChip key={g} label={g} selected={goal === g} onClick={() => setGoal(g)} />
        ))}
      </div>

      <BoostaButton fullWidth onClick={() => onNext(goal || 'не определена')}>
        Дальше
      </BoostaButton>
    </motion.div>
  );
}
