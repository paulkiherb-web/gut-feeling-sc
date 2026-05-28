import { useState } from 'react';
import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

export interface BiometricData {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number | null;
  weightKg: number | null;
}

interface Props {
  onNext: (data: BiometricData) => void;
}

const GENDERS: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male',   label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'other',  label: 'Другой' },
];

function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Недовес';
  if (bmi < 25)   return 'Норма ✓';
  if (bmi < 30)   return 'Избыток';
  return 'Ожирение';
}

export default function Step7Biometrics({ onNext }: Props) {
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);

  const bmi = heightCm && weightKg
    ? Number((weightKg / ((heightCm / 100) ** 2)).toFixed(1))
    : null;

  const inputStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderRadius: 12,
    border: `1.5px solid ${boostaTokens.color.surface.line}`,
    background: boostaTokens.color.surface.raised,
    fontSize: 15,
    color: boostaTokens.color.surface.ink,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 20 }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 8px' }}>
          Немного о тебе физически
        </h1>
        <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, margin: 0, lineHeight: 1.5 }}>
          Это влияет на дозировки и рекомендации. Никто кроме тебя не видит.
        </p>
      </div>

      {/* Gender */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Пол
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {GENDERS.map((g) => {
            const active = gender === g.value;
            return (
              <button
                key={g.value}
                onClick={() => setGender(g.value)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 12,
                  border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                  background: active ? 'rgba(110,86,255,0.08)' : boostaTokens.color.surface.raised,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? boostaTokens.color.ghost[700] : boostaTokens.color.surface.ink,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Возраст — <span style={{ color: boostaTokens.color.ghost[700] }}>{age} лет</span>
        </span>
        <input
          type="range"
          min={15}
          max={80}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          style={{ width: '100%', accentColor: boostaTokens.color.ghost[600] }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: boostaTokens.color.surface.inkMuted }}>
          <span>15</span><span>80</span>
        </div>
      </div>

      {/* Height + Weight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Рост (см)
          </span>
          <input
            type="number"
            min={100}
            max={230}
            value={heightCm ?? ''}
            onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : null)}
            placeholder="175"
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Вес (кг)
          </span>
          <input
            type="number"
            min={30}
            max={300}
            value={weightKg ?? ''}
            onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : null)}
            placeholder="70"
            style={inputStyle}
          />
        </div>
      </div>

      {/* BMI badge */}
      {bmi && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 14,
          background: 'rgba(110,86,255,0.07)',
          border: `1px solid ${boostaTokens.color.ghost[200]}`,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: boostaTokens.color.ghost[700] }}>{bmi}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: boostaTokens.color.ghost[700] }}>ИМТ</div>
            <div style={{ fontSize: 13, color: boostaTokens.color.surface.inkSoft }}>{bmiLabel(bmi)}</div>
          </div>
        </div>
      )}

      <BoostaButton fullWidth onClick={() => onNext({ gender, age, heightCm, weightKg })}>
        Дальше
      </BoostaButton>
    </motion.div>
  );
}
