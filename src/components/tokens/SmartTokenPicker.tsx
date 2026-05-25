import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BoostaToken from '@/components/tokens/BoostaToken';
import { boostaTokenMeta, BoostaTokenType } from '@/components/tokens/boostaTokenMeta';
import { boostaTokens } from '@/design/boosta/tokens';
import { useBoostaStore } from '@/core/store/slices/boostaSlice';

function getContextTokens(): BoostaTokenType[] {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return ['sleep', 'coffee', 'water', 'morning_charge', 'walk', 'run'];
  if (h >= 10 && h < 18) return ['desk', 'coffee', 'stress', 'water', 'walk', 'medicine'];
  if (h >= 18 && h < 23) return ['media', 'rest', 'alcohol', 'sleep', 'meditation', 'reading'];
  return ['sleep', 'rest', 'meditation', 'water', 'reading', 'media'];
}

const QUICK_CATEGORIES = [
  {
    id: 'eat',
    label: 'Ем / пью',
    icon: '🥤',
    tokens: ['water', 'coffee', 'alcohol', 'medicine'] as BoostaTokenType[],
  },
  {
    id: 'move',
    label: 'Двигаюсь',
    icon: '🚶',
    tokens: ['walk', 'run', 'bike', 'swim', 'ski'] as BoostaTokenType[],
  },
  {
    id: 'train',
    label: 'Тренируюсь',
    icon: '💪',
    tokens: ['morning_charge', 'cardio', 'hiit', 'strength', 'yoga', 'stretch'] as BoostaTokenType[],
  },
  {
    id: 'work',
    label: 'Работаю',
    icon: '💻',
    tokens: ['desk', 'physical_work', 'stress'] as BoostaTokenType[],
  },
  {
    id: 'rest',
    label: 'Восстанавливаюсь',
    icon: '🌙',
    tokens: ['sleep', 'rest', 'meditation', 'reading', 'media'] as BoostaTokenType[],
  },
  {
    id: 'intimate',
    label: 'Близость',
    icon: '❤️',
    tokens: ['sex'] as BoostaTokenType[],
  },
];

const FULL_GROUPS = [
  { label: 'Движение',       tokens: ['run','walk','swim','bike','ski'] as BoostaTokenType[] },
  { label: 'Спорт',          tokens: ['morning_charge','cardio','hiit','strength','yoga','stretch'] as BoostaTokenType[] },
  { label: 'Вещества',       tokens: ['water','coffee','alcohol','smoking','medicine'] as BoostaTokenType[] },
  { label: 'Восстановление', tokens: ['sleep','sex','meditation','rest','reading'] as BoostaTokenType[] },
  { label: 'Работа',         tokens: ['desk','physical_work','media','stress'] as BoostaTokenType[] },
  { label: 'Редкие',         tokens: ['streak_runner','clear','connected','iron_will','zen_master'] as BoostaTokenType[] },
];

interface Props {
  onSelect: (type: BoostaTokenType) => void;
  onClose: () => void;
}

export default function SmartTokenPicker({ onSelect, onClose }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const events = useBoostaStore(s => s.events);

  const recent = [...new Set(
    events
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(e => e.name)
  )].slice(0, 7).map(name =>
    Object.entries(boostaTokenMeta).find(([, m]) => m.labelRu === name)?.[0]
  ).filter(Boolean) as BoostaTokenType[];

  const freq = Object.entries(
    events.reduce((acc, e) => {
      acc[e.name] = (acc[e.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) =>
      Object.entries(boostaTokenMeta).find(([, m]) => m.labelRu === name)?.[0]
    )
    .filter(Boolean) as BoostaTokenType[];

  const contextTokens = getContextTokens();
  const activeCat = QUICK_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div style={{
      padding: '0 16px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 0' }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: boostaTokens.color.surface.ink }}>
          {activeCategory ? activeCat?.label : 'Что сейчас происходит?'}
        </p>
        <button
          onClick={activeCategory ? () => setActiveCategory(null) : onClose}
          style={{ background: 'none', border: 'none', fontSize: 13,
            color: boostaTokens.color.surface.inkSoft, cursor: 'pointer' }}
        >
          {activeCategory ? '← Назад' : 'Закрыть'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeCategory && activeCat && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
            }}>
              {activeCat.tokens.map(type => (
                <TokenCell key={type} type={type} onSelect={onSelect} />
              ))}
            </div>
          </motion.div>
        )}

        {!activeCategory && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
          >

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}>
              {QUICK_CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 16,
                    background: boostaTokens.color.surface.raised,
                    border: `0.5px solid ${boostaTokens.color.surface.line}`,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500,
                    color: boostaTokens.color.surface.ink, textAlign: 'center',
                    lineHeight: 1.3 }}>
                    {cat.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <div>
              <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
                marginBottom: 10 }}>
                Скорее всего сейчас
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {contextTokens.map(type => (
                  <TokenCell key={type} type={type} onSelect={onSelect} compact />
                ))}
              </div>
            </div>

            {recent.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
                  marginBottom: 10 }}>
                  Недавние
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {recent.map(type => (
                    <TokenCell key={type} type={type} onSelect={onSelect} compact />
                  ))}
                </div>
              </div>
            )}

            {freq.length > 0 && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
                  marginBottom: 10 }}>
                  Частые
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {freq.map(type => (
                    <TokenCell key={type} type={type} onSelect={onSelect} compact />
                  ))}
                </div>
              </div>
            )}

            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                style={{ background: 'none', border: 'none', fontSize: 13,
                  color: boostaTokens.color.ghost[600], cursor: 'pointer',
                  textAlign: 'left', padding: '4px 0' }}>
                Показать все жетоны →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FULL_GROUPS.map(group => (
                  <div key={group.label}>
                    <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: boostaTokens.color.surface.inkMuted,
                      marginBottom: 10 }}>
                      {group.label}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                      {group.tokens.map(type => (
                        <TokenCell key={type} type={type} onSelect={onSelect} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TokenCell({ type, onSelect, compact }: {
  type: BoostaTokenType;
  onSelect: (t: BoostaTokenType) => void;
  compact?: boolean;
}) {
  const meta = boostaTokenMeta[type];
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={() => onSelect(type)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: 4, borderRadius: 12,
      }}
    >
      <BoostaToken type={type} size={compact ? 48 : 56} showLabel={false} showSubLabel={false} />
      <span style={{ fontSize: 10, color: boostaTokens.color.surface.inkSoft,
        textAlign: 'center', lineHeight: 1.2 }}>
        {meta.labelRu}
      </span>
    </motion.button>
  );
}
