import { useState } from 'react';
import { motion } from 'framer-motion';
import BoostaButton from '@/components/boosta/primitives/BoostaButton';
import { boostaTokens } from '@/design/boosta/tokens';

interface Props {
  onNext: (conditions: string[]) => void;
}

const CONDITIONS = [
  { id: 'diabetes2',      label: 'Диабет 2 типа' },
  { id: 'hypertension',   label: 'Гипертония' },
  { id: 'thyroid',        label: 'Заболевания щитовидной железы' },
  { id: 'autoimmune',     label: 'Аутоиммунные заболевания' },
  { id: 'chronic_pain',   label: 'Хронические боли / воспаления' },
  { id: 'post_recovery',  label: 'Восстановление после операции / болезни' },
  { id: 'pregnancy',      label: 'Беременность или кормление' },
  { id: 'antidepressants',label: 'Принимаю антидепрессанты' },
  { id: 'meds',           label: 'Принимаю другие препараты' },
];

const NONE_ID = 'none';

export default function Step8Health({ onNext }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set([NONE_ID]));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (id === NONE_ID) {
        return new Set([NONE_ID]);
      }
      next.delete(NONE_ID);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) next.add(NONE_ID);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    const conditions = selected.has(NONE_ID) ? [] : Array.from(selected);
    onNext(conditions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={boostaTokens.motion.smooth}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 20 }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', margin: '0 0 8px' }}>
          Есть ли особые условия?
        </h1>
        <p style={{ fontSize: 14, color: boostaTokens.color.surface.inkSoft, margin: 0, lineHeight: 1.5 }}>
          AI учтёт ограничения при составлении плана. Это не медицинская консультация — это персонализация.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CONDITIONS.map((c) => {
          const active = selected.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{
                textAlign: 'left',
                padding: '13px 16px',
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
                width: 20, height: 20, borderRadius: 6,
                border: `2px solid ${active ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
                background: active ? boostaTokens.color.ghost[600] : 'transparent',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                fontSize: 11, color: '#fff',
                transition: 'all 0.15s',
              }}>
                {active ? '✓' : ''}
              </span>
              {c.label}
            </button>
          );
        })}

        {/* None option */}
        <button
          onClick={() => toggle(NONE_ID)}
          style={{
            textAlign: 'left',
            padding: '13px 16px',
            borderRadius: 14,
            border: `2px solid ${selected.has(NONE_ID) ? boostaTokens.color.real[600] : boostaTokens.color.surface.line}`,
            background: selected.has(NONE_ID) ? 'rgba(68,199,168,0.08)' : boostaTokens.color.surface.raised,
            fontSize: 14,
            fontWeight: selected.has(NONE_ID) ? 600 : 400,
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
            border: `2px solid ${selected.has(NONE_ID) ? boostaTokens.color.real[600] : boostaTokens.color.surface.line}`,
            background: selected.has(NONE_ID) ? boostaTokens.color.real[600] : 'transparent',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            fontSize: 11, color: '#fff',
            transition: 'all 0.15s',
          }}>
            {selected.has(NONE_ID) ? '✓' : ''}
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
