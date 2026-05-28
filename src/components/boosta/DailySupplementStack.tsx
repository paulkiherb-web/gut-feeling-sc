import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { boostaTokens } from '@/design/boosta/tokens';
import { useScores } from '@/core/hooks/useScores';
import { getPlanDay } from '@/core/intensive/planUtils';
import type { BlueprintItem } from '@/core/intensive/types';

// ─── types ────────────────────────────────────────────────────────────────────

interface SupplementItem {
  id: string;
  name: string;
  dose: string;
  timing: string;     // "HH:MM"
  condition: string;  // e.g. "натощак, за 30 мин до еды"
  why: string;        // human-readable impact hint
}

type TimeBlock = 'morning' | 'afternoon' | 'evening' | 'night';

// ─── time helpers ─────────────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function timeBlock(time: string): TimeBlock {
  const [hStr] = time.split(':');
  const h = parseInt(hStr, 10);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

const BLOCK_LABELS: Record<TimeBlock, string> = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  night: 'Перед сном',
};

const BLOCK_ORDER: TimeBlock[] = ['morning', 'afternoon', 'evening', 'night'];

// ─── impact → why string ──────────────────────────────────────────────────────

function impactToWhy(impact?: BlueprintItem['expectedImpact']): string {
  if (!impact) return '';
  const parts: string[] = [];
  if (impact.energy) parts.push(`↑ энергия +${impact.energy}`);
  if (impact.recovery) parts.push(`↑ восстановление +${impact.recovery}`);
  if (impact.sleep) parts.push(`↑ сон +${impact.sleep}`);
  if (impact.nutrition) parts.push(`↑ питание +${impact.nutrition}`);
  return parts.join(' · ');
}

// ─── plan items → SupplementItem ─────────────────────────────────────────────

function blueprintToSupplement(item: BlueprintItem): SupplementItem {
  // title format: "Omega-3 2 г + Vit D3 5000 МЕ" — use as-is for name
  const doseMatch = item.title.match(/\d[\d\s]*(?:г|мг|МЕ|мл|кг)(?:\s*[+·,].*)?/);
  const dose = doseMatch ? doseMatch[0].trim() : '';
  const name = dose ? item.title.replace(dose, '').trim().replace(/\s*\+\s*$/, '').trim() || item.title : item.title;

  return {
    id: item.id,
    name,
    dose,
    timing: item.time,
    condition: item.description ?? '',
    why: impactToWhy(item.expectedImpact),
  };
}

// ─── fallback base stack (no active plan) ─────────────────────────────────────

const BASE_STACK: SupplementItem[] = [
  {
    id: 'base-vit-d3',
    name: 'Vit D3',
    dose: '5000 МЕ',
    timing: '08:00',
    condition: 'с едой',
    why: '↑ иммунитет · гормональный фон',
  },
  {
    id: 'base-omega3',
    name: 'Omega-3',
    dose: '2 г',
    timing: '08:00',
    condition: 'с едой',
    why: '↑ восстановление · снижение воспаления',
  },
  {
    id: 'base-mg',
    name: 'Mg глицинат',
    dose: '400 мг',
    timing: '21:00',
    condition: 'за 1 час до сна',
    why: '↑ сон · расслабление мышц',
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem('boosta_supplements_' + todayKey());
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>): void {
  try {
    localStorage.setItem('boosta_supplements_' + todayKey(), JSON.stringify([...ids]));
  } catch { /* noop */ }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function DailySupplementStack() {
  const { activePlan, intensiveDayIndex } = useScores();
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Refresh completed from localStorage on mount (handles day rollover)
  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  const items: SupplementItem[] = (() => {
    if (activePlan) {
      const day = getPlanDay(activePlan, intensiveDayIndex ?? 1);
      const planSupplements = (day?.items ?? [])
        .filter((item) => item.category === 'supplement')
        .map(blueprintToSupplement);
      if (planSupplements.length > 0) return planSupplements;
    }
    return BASE_STACK;
  })();

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCompleted(next);
      return next;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const grouped = BLOCK_ORDER
    .map((block) => ({ block, blockItems: items.filter((i) => timeBlock(i.timing) === block) }))
    .filter(({ blockItems }) => blockItems.length > 0);

  const doneCount = items.filter((i) => completed.has(i.id)).length;

  return (
    <section
      style={{
        background: boostaTokens.color.surface.raised,
        borderRadius: 24,
        padding: 16,
        border: `1px solid ${boostaTokens.color.surface.line}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill size={18} color={boostaTokens.color.ghost[700]} />
          <strong style={{ fontSize: 15 }}>Стек на сегодня</strong>
        </div>
        <span style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft }}>
          {doneCount}/{items.length} выполнено
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 999, background: boostaTokens.color.surface.line, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${items.length ? Math.round((doneCount / items.length) * 100) : 0}%` }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 999, background: boostaTokens.color.ghost[700] }}
        />
      </div>

      {/* Time blocks */}
      {grouped.map(({ block, blockItems }) => (
        <div key={block} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              ...boostaTokens.typography.eyebrow,
              color: boostaTokens.color.surface.inkMuted,
              marginBottom: 2,
            }}
          >
            {BLOCK_LABELS[block]}
          </div>

          {blockItems.map((item) => {
            const done = completed.has(item.id);
            const open = expanded.has(item.id);
            const hasDetails = !!(item.condition || item.why);

            return (
              <div
                key={item.id}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${done ? boostaTokens.color.ghost[700] + '55' : boostaTokens.color.surface.line}`,
                  background: done ? `${boostaTokens.color.ghost[700]}10` : boostaTokens.color.surface.base,
                  overflow: 'hidden',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                {/* Main row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 12px',
                  }}
                >
                  {/* Checkbox tap target */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => toggle(item.id)}
                    aria-label={done ? 'Отметить невыполненным' : 'Отметить выполненным'}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `2px solid ${done ? boostaTokens.color.ghost[700] : boostaTokens.color.surface.inkSoft}`,
                      background: done ? boostaTokens.color.ghost[700] : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      fontSize: 14,
                    }}
                  >
                    {done && '✓'}
                  </motion.button>

                  {/* Name + timing */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: done ? boostaTokens.color.surface.inkSoft : boostaTokens.color.surface.ink,
                        textDecoration: done ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                      {item.dose && (
                        <span style={{ fontWeight: 400, color: boostaTokens.color.surface.inkSoft }}> · {item.dose}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: boostaTokens.color.surface.inkMuted, marginTop: 2 }}>
                      {item.timing}
                      {item.condition && <span> · {item.condition}</span>}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  {hasDetails && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      aria-label="Подробнее"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        color: boostaTokens.color.surface.inkMuted,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                {/* Expandable why row */}
                <AnimatePresence initial={false}>
                  {open && item.why && (
                    <motion.div
                      key="why"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: '0 12px 10px 56px',
                          fontSize: 12,
                          color: boostaTokens.color.ghost[700],
                          lineHeight: 1.45,
                        }}
                      >
                        Почему: {item.why}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}

      {!activePlan && (
        <p style={{ fontSize: 12, color: boostaTokens.color.surface.inkSoft, margin: 0 }}>
          Базовый стек. Активируй интенсив чтобы получить персональный план добавок.
        </p>
      )}
    </section>
  );
}
