import { motion } from 'framer-motion';
import { useState } from 'react';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import CoursePicker from '@/components/boosta/course/CoursePicker';
import { boostaTokens } from '@/design/boosta/tokens';
import type { Course } from '@/core/store/slices/boostaSlice';

interface Props { onNext: (course: string) => void; }

export default function Step4Course({ onNext }: Props) {
  const [course, setCourse] = useState<Course>('focus');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 40 }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.015em', textAlign: 'center' }}>
        Что важно прямо сейчас?
      </h1>

      <CoursePicker
        selected={course}
        onSelect={(c, custom) => setCourse(custom ? ('custom' as Course) : c)}
      />

      <BoostaButton fullWidth onClick={() => onNext(course || 'focus')}>
        Дальше
      </BoostaButton>
    </motion.div>
  );
}
