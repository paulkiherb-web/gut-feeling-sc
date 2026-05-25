import { useState } from 'react';
import { boostaTokens } from '@/design/boosta/tokens';
import CategoryChip from '@/components/boosta/checkin/CategoryChip';
import type { Course } from '@/core/store/slices/boostaSlice';

const COURSES: { value: Course; label: string }[] = [
  { value: 'focus',       label: 'Больше фокуса' },
  { value: 'energy',      label: 'Больше энергии' },
  { value: 'sleep',       label: 'Лучше сон' },
  { value: 'calm',        label: 'Спокойствие' },
  { value: 'weight_loss', label: 'Меньше веса' },
  { value: 'muscle_gain', label: 'Мышечный рост' },
  { value: 'recovery',    label: 'Восстановление' },
];

interface Props {
  selected?: string;
  onSelect?: (course: Course, custom?: string) => void;
}

export default function CoursePicker({ selected, onSelect }: Props) {
  const [customText, setCustomText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: boostaTokens.color.surface.inkMuted,
      }}>
        Курс на сегодня
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COURSES.map((c) => (
          <CategoryChip
            key={c.value}
            label={c.label}
            selected={selected === c.value}
            onClick={() => onSelect?.(c.value)}
          />
        ))}
      </div>
      <div>
        <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, marginBottom: 8 }}>
          Свой курс
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Например: меньше кофе"
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: boostaTokens.radius.sm,
              border: `1px solid ${boostaTokens.color.surface.line}`,
              background: boostaTokens.color.surface.sunk,
              fontSize: 13,
              color: boostaTokens.color.surface.ink,
              outline: 'none',
            }}
          />
          <button
            disabled={!customText.trim()}
            onClick={() => {
              if (customText.trim()) {
                onSelect?.('custom', customText.trim());
                setCustomText('');
              }
            }}
            style={{
              padding: '10px 18px',
              borderRadius: boostaTokens.radius.sm,
              background: customText.trim() ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line,
              color: customText.trim() ? '#fff' : boostaTokens.color.surface.inkMuted,
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: customText.trim() ? 'pointer' : 'default',
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
