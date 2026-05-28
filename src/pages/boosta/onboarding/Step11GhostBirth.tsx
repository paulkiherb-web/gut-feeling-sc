import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import GhostAvatar from '@/components/boosta/ghost/GhostAvatar';
import { boostaTokens } from '@/design/boosta/tokens';

interface ProfileSummary {
  age: number;
  gender: 'male' | 'female' | 'other';
  conditions: string[];
  dietType: string;
  activityLevel: string;
  course: string;
}

interface Props {
  profile: ProfileSummary;
  onNext: () => void;
}

const COURSE_LABELS: Record<string, string> = {
  energy: 'Энергия', focus: 'Фокус', sleep: 'Сон', calm: 'Спокойствие',
  recovery: 'Восстановление', longevity: 'Долголетие', strength: 'Сила', weight: 'Вес',
  weight_loss: 'Снижение веса', muscle_gain: 'Набор массы',
};

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'в сидячем ритме', light: 'с лёгкой активностью',
  moderate: 'с умеренными тренировками', high: 'с высокой нагрузкой',
  professional: 'как профессиональный спортсмен',
};

function buildMessage(p: ProfileSummary): string {
  const course = COURSE_LABELS[p.course] ?? p.course;
  const activity = ACTIVITY_LABELS[p.activityLevel] ?? '';
  const condNote = p.conditions.length > 0 ? ' Учту твои особые условия.' : '';
  return `Я вижу тебя — ${p.age} лет, живёшь ${activity}. Курс: ${course}.${condNote} Каждое решение теперь работает на тебя.`;
}

export default function Step11GhostBirth({ profile, onNext }: Props) {
  const message = buildMessage(profile);

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
        transition={{ delay: 0.7 }}
        style={{
          borderLeft: `3px solid ${boostaTokens.color.ghost[400]}`,
          padding: '14px 18px',
          textAlign: 'left',
          maxWidth: 360,
        }}
      >
        <p style={{
          fontSize: 16,
          fontStyle: 'italic',
          color: boostaTokens.color.ghost[800],
          lineHeight: 1.55,
          margin: 0,
        }}>
          {message}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <BoostaButton onClick={onNext}>Готов</BoostaButton>
      </motion.div>
    </motion.div>
  );
}
