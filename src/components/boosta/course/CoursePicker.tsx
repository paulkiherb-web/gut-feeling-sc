import { boostaTokens } from '@/design/boosta/tokens';
import type { Course } from '@/core/store/slices/boostaSlice';

const BOOSTA_COURSES: {
  id: Course;
  label: string;
  icon: string;
  description: string;
  tags: string[];
}[] = [
  {
    id: 'energy',
    label: 'Энергия',
    icon: '⚡',
    description: 'Меньше послеобеденного спада. Заряд до вечера.',
    tags: ['фокус', 'продуктивность', 'без провалов'],
  },
  {
    id: 'focus',
    label: 'Фокус',
    icon: '🧠',
    description: 'Ясная голова. Лучше концентрация к 16:00.',
    tags: ['концентрация', 'память', 'ясность'],
  },
  {
    id: 'sleep',
    label: 'Сон',
    icon: '🌙',
    description: 'Засыпать за 15 минут. Глубокий восстановительный сон.',
    tags: ['засыпание', 'глубокий сон', 'утренняя бодрость'],
  },
  {
    id: 'calm',
    label: 'Спокойствие',
    icon: '🌊',
    description: 'Меньше тревоги. Без перегруза и реактивности.',
    tags: ['стресс', 'тревога', 'баланс'],
  },
  {
    id: 'recovery',
    label: 'Восстановление',
    icon: '🔋',
    description: 'Вернуть ресурс после нагрузок или болезни.',
    tags: ['восстановление', 'воспаление', 'регенерация'],
  },
  {
    id: 'longevity',
    label: 'Долголетие',
    icon: '🌿',
    description: 'Замедлить старение. Поддержать NAD+, митохондрии.',
    tags: ['антистарение', 'NAD+', 'аутофагия'],
  },
  {
    id: 'strength',
    label: 'Сила',
    icon: '💪',
    description: 'Рост мышечной массы. Выносливость и результат.',
    tags: ['мышцы', 'тренировки', 'белок'],
  },
  {
    id: 'weight',
    label: 'Вес',
    icon: '⚖️',
    description: 'Снизить и удержать вес без срывов.',
    tags: ['похудение', 'метаболизм', 'насыщение'],
  },
];

interface Props {
  selected?: string;
  onSelect?: (course: Course, custom?: string) => void;
}

export default function CoursePicker({ selected, onSelect }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {BOOSTA_COURSES.map((c) => {
        const isSelected = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect?.(c.id)}
            style={{
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: 18,
              border: `2px solid ${isSelected ? boostaTokens.color.ghost[600] : boostaTokens.color.surface.line}`,
              background: isSelected
                ? 'linear-gradient(135deg, rgba(110,86,255,0.08), rgba(68,199,168,0.08))'
                : boostaTokens.color.surface.raised,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{c.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: boostaTokens.color.surface.ink,
                marginBottom: 3,
              }}>
                {c.label}
              </div>
              <div style={{
                fontSize: 13,
                color: boostaTokens.color.surface.inkSoft,
                lineHeight: 1.4,
                marginBottom: 8,
              }}>
                {c.description}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {c.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: isSelected
                      ? 'rgba(110,86,255,0.12)'
                      : boostaTokens.color.surface.base,
                    color: isSelected
                      ? boostaTokens.color.ghost[700]
                      : boostaTokens.color.surface.inkMuted,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {isSelected && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: boostaTokens.color.ghost[700],
                display: 'grid', placeItems: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

