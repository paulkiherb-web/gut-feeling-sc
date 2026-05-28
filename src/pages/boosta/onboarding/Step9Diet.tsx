import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

export interface DietData {
  dietType: string;
  ifWindow: string;
  badHabits: string[];
}

interface Props {
  onNext: (data: DietData) => void;
}

const DIET_TYPES = [
  { id: 'unrestricted', label: 'Без ограничений' },
  { id: 'if',           label: 'Интервальное голодание (IF)' },
  { id: 'keto',         label: 'Кето / низкоуглеводное' },
  { id: 'vegan',        label: 'Веганство / вегетарианство' },
  { id: 'gluten_free',  label: 'Безглютеновое' },
  { id: 'dairy_free',   label: 'Безлактозное' },
  { id: 'mediterranean',label: 'Средиземноморская диета' },
  { id: 'paleo',        label: 'Палео' },
];

const IF_WINDOWS = [
  { id: '12/12', label: '12/12 — начинающий' },
  { id: '16/8',  label: '16/8 — стандартный, аутофагия начинается' },
  { id: '18/6',  label: '18/6 — углублённый' },
  { id: '20/4',  label: '20/4 — продвинутый' },
  { id: 'omad',  label: 'OMAD — один приём в день' },
];

const BAD_HABITS = [
  { id: 'alcohol_regular',  label: 'Алкоголь регулярно (3+ раз в неделю)' },
  { id: 'alcohol_moderate', label: 'Алкоголь умеренно (1–2 раза в неделю)' },
  { id: 'smoking',          label: 'Курение' },
  { id: 'energy_drinks',    label: 'Энергетики / большие дозы кофеина' },
];

const BAD_NONE = 'bad_none';

export default function Step9Diet({ onNext }: Props) {
  const [dietType, setDietType] = useState('unrestricted');
  const [ifWindow, setIfWindow] = useState('16/8');
  const [badHabits, setBadHabits] = useState<Set<string>>(new Set([BAD_NONE]));

  const toggleHabit = (id: string) => {
    setBadHabits((prev) => {
      const next = new Set(prev);
      if (id === BAD_NONE) return new Set([BAD_NONE]);
      next.delete(BAD_NONE);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) next.add(BAD_NONE);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    onNext({
      dietType,
      ifWindow: dietType === 'if' ? ifWindow : '',
      badHabits: badHabits.has(BAD_NONE) ? [] : Array.from(badHabits),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 20 }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', margin: 0 }}>
        Как ты сейчас питаешься?
      </h1>

      {/* Diet type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Тип питания
        </span>
        {DIET_TYPES.map((d) => {
          const active = dietType === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDietType(d.id)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 14,
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? 'rgba(110,86,255,0.07)' : boostaTokens.color.surface.raised,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: boostaTokens.color.surface.ink,
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
                flexShrink: 0, transition: 'all 0.15s',
              }} />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Conditional IF window */}
      <AnimatePresence>
        {dietType === 'if' && (
          <motion.div
            key="if-window"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Окно голодания
              </span>
              {IF_WINDOWS.map((w) => {
                const active = ifWindow === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setIfWindow(w.id)}
                    style={{
                      textAlign: 'left',
                      padding: '11px 16px',
                      borderRadius: 12,
                      border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                      background: active ? 'rgba(110,86,255,0.07)' : boostaTokens.color.surface.base,
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      color: boostaTokens.color.surface.ink,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                      background: active ? boostaTokens.color.ghost[600] : 'transparent',
                      flexShrink: 0,
                    }} />
                    {w.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bad habits */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: boostaTokens.color.surface.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Вредные привычки
        </span>
        {BAD_HABITS.map((h) => {
          const active = badHabits.has(h.id);
          return (
            <button
              key={h.id}
              onClick={() => toggleHabit(h.id)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: 14,
                border: `2px solid ${active ? '#E35D5D' : boostaTokens.color.surface.line}`,
                background: active ? 'rgba(227,93,93,0.07)' : boostaTokens.color.surface.raised,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: boostaTokens.color.surface.ink,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 6,
                border: `2px solid ${active ? '#E35D5D' : boostaTokens.color.surface.line}`,
                background: active ? '#E35D5D' : 'transparent',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                fontSize: 11, color: '#fff',
              }}>
                {active ? '✓' : ''}
              </span>
              {h.label}
            </button>
          );
        })}
        <button
          onClick={() => toggleHabit(BAD_NONE)}
          style={{
            textAlign: 'left',
            padding: '12px 16px',
            borderRadius: 14,
            border: `2px solid ${badHabits.has(BAD_NONE) ? boostaTokens.color.real[600] : boostaTokens.color.surface.line}`,
            background: badHabits.has(BAD_NONE) ? 'rgba(68,199,168,0.08)' : boostaTokens.color.surface.raised,
            fontSize: 14,
            fontWeight: badHabits.has(BAD_NONE) ? 600 : 400,
            color: boostaTokens.color.surface.ink,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.15s',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: 6,
            border: `2px solid ${badHabits.has(BAD_NONE) ? boostaTokens.color.real[600] : boostaTokens.color.surface.line}`,
            background: badHabits.has(BAD_NONE) ? boostaTokens.color.real[600] : 'transparent',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            fontSize: 11, color: '#fff',
          }}>
            {badHabits.has(BAD_NONE) ? '✓' : ''}
          </span>
          Ничего из перечисленного
        </button>
      </div>

      <BoostaButton fullWidth onClick={handleNext}>
        Дальше
      </BoostaButton>
    </motion.div>
  );
}
