import { useState } from 'react';
import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

export interface ActivityData {
  activityLevel: string;
  sleepHours: string;
  wakeTime: string;
  sleepTime: string;
}

interface Props {
  onNext: (data: ActivityData) => void;
}

const ACTIVITY_LEVELS = [
  { id: 'sedentary',    label: 'Сидячий образ жизни',      sub: 'офис, мало движения' },
  { id: 'light',        label: 'Лёгкая активность',         sub: 'прогулки, 1–2 тренировки в неделю' },
  { id: 'moderate',     label: 'Умеренная',                 sub: '3–4 тренировки в неделю' },
  { id: 'high',         label: 'Высокая',                   sub: '5+ тренировок, физический труд' },
  { id: 'professional', label: 'Профессиональный спорт',    sub: 'ежедневные тренировки' },
];

const SLEEP_HOURS = [
  { id: 'under6',    label: 'Меньше 6 часов',      sub: 'хронический недосып' },
  { id: '6_7',       label: '6–7 часов',            sub: 'немного не хватает' },
  { id: '7_8',       label: '7–8 часов',            sub: 'нормально ✓' },
  { id: 'over8',     label: '8+ часов',             sub: 'сплю много' },
  { id: 'unstable',  label: 'Нестабильный',         sub: 'по-разному каждую ночь' },
];

export default function Step10Activity({ onNext }: Props) {
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [sleepHours, setSleepHours] = useState('7_8');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');

  const timeInputStyle: React.CSSProperties = {
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
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', margin: 0 }}>
        Физическая активность и сон
      </h1>

      {/* Activity level */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Активность
        </span>
        {ACTIVITY_LEVELS.map((a) => {
          const active = activityLevel === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setActivityLevel(a.id)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 14,
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? 'rgba(110,86,255,0.07)' : boostaTokens.color.surface.raised,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? boostaTokens.color.ghost[600] : 'transparent',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: boostaTokens.color.surface.ink }}>{a.label}</div>
                <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{a.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sleep hours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Сон
        </span>
        {SLEEP_HOURS.map((s) => {
          const active = sleepHours === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSleepHours(s.id)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 14,
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? 'rgba(110,86,255,0.07)' : boostaTokens.color.surface.raised,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? boostaTokens.color.ghost[600] : 'transparent',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: active ? 600 : 400, color: boostaTokens.color.surface.ink }}>{s.label}</div>
                <div style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>{s.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Wake / Sleep time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Подъём
          </span>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            style={timeInputStyle}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Отход ко сну
          </span>
          <input
            type="time"
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
            style={timeInputStyle}
          />
        </div>
      </div>

      <BoostaButton fullWidth onClick={() => onNext({ activityLevel, sleepHours, wakeTime, sleepTime })}>
        Дальше
      </BoostaButton>
    </motion.div>
  );
}
